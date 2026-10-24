const { Op } = require('sequelize');
const db = require('../database/models');
const { logger } = require('../utils/logger');
const { computeWaterfall, obligationStatus } = require('../utils/waterfall');
const { logAction } = require('../middlewares/audit.middleware');

const {
  Payment,
  PaymentDistribution,
  FeeObligation,
  ObligationVoteHeadSnapshot,
  StudentCredit,
  VoteHead,
  StudentTermEnrollment,
} = db;

// =============================================
// ID GENERATORS
// =============================================

const generatePaymentId = () => `PMT-${Date.now().toString(36)}`.slice(0, 20);

const generateReceiptNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `RCP-${year}-${seq}`;
};

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Normalize registration number (handle both / and - formats)
 */
const normalizeRegNo = (regNo) => {
  if (!regNo) return regNo;
  return regNo.includes('/') ? regNo : regNo.replace(/-/g, '/');
};

/**
 * Get the opposite format of a registration number
 */
const getAlternativeRegNo = (regNo) => {
  if (!regNo) return regNo;
  return regNo.includes('/') 
    ? regNo.replace(/\//g, '-') 
    : regNo.replace(/-/g, '/');
};

/**
 * Find obligations by registration number (tries both formats)
 */
const findObligationsByRegNo = async (regNo, obligationIds = null, transaction = null) => {
  const whereClause = { student_reg_no: regNo };
  if (obligationIds) {
    whereClause.id = { [Op.in]: obligationIds };
  }

  let obligations = await FeeObligation.findAll({
    where: whereClause,
    include: [
      {
        model: ObligationVoteHeadSnapshot,
        as: 'snapshots',
        order: [['priority_order', 'ASC']],
      },
    ],
    transaction,
  });

  // If not found, try alternative format
  if (obligations.length === 0) {
    const alternativeRegNo = getAlternativeRegNo(regNo);
    const altWhereClause = { student_reg_no: alternativeRegNo };
    if (obligationIds) {
      altWhereClause.id = { [Op.in]: obligationIds };
    }

    obligations = await FeeObligation.findAll({
      where: altWhereClause,
      include: [
        {
          model: ObligationVoteHeadSnapshot,
          as: 'snapshots',
          order: [['priority_order', 'ASC']],
        },
      ],
      transaction,
    });
  }

  return obligations;
};

// =============================================
// MAIN SERVICES
// =============================================

/**
 * Post a payment with waterfall distribution
 * Uses registration number as the primary identifier
 */
const postPayment = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    let {
      regNo,           // Primary identifier
      obligations,     // Array of { obligationId, amount }
      totalAmount,
      paymentMode,
      bankName,  
      transactionRef,
      fundingSource,
      helbBand,
      sponsorName,
      receivedBy,
      paymentDate,
      notes,
      ipAddress,
      userAgent,
    } = data;

    // Normalize registration number
    const normalizedRegNo = normalizeRegNo(regNo);

    // Validate total amount matches sum of obligation amounts
    const totalObligationAmount = obligations.reduce((sum, o) => sum + o.amount, 0);
    if (Math.abs(totalObligationAmount - totalAmount) > 0.01) {
      throw new Error(
        `Total amount (${totalAmount}) does not match sum of obligation amounts (${totalObligationAmount})`
      );
    }

    // Validate all obligations exist and belong to the student by regNo
    const obligationIds = obligations.map(o => o.obligationId);
    const foundObligations = await findObligationsByRegNo(normalizedRegNo, obligationIds, transaction);

    if (foundObligations.length !== obligationIds.length) {
      const foundIds = foundObligations.map(o => o.id);
      const missingIds = obligationIds.filter(id => !foundIds.includes(id));
      throw new Error(`Invalid obligation IDs: ${missingIds.join(', ')}`);
    }

    // Create payment record - ONLY student_reg_no
    const payment = await Payment.create({
      id: generatePaymentId(),
      student_reg_no: normalizedRegNo,        // Primary identifier
      receipt_number: generateReceiptNumber(),
      total_amount: totalAmount,
      payment_mode: paymentMode,
      bank_name: bankName || null,
      transaction_ref: transactionRef || null,
      funding_source: fundingSource,
      helb_band: helbBand || null,
      sponsor_name: sponsorName || null,
      received_by: receivedBy,
      is_reversal: false,
      reversal_of: null,
      payment_date: paymentDate,
      notes: notes || null,
    }, { transaction });

    // Process each obligation
    const results = [];
    let remainingAmount = totalAmount;

    // Sort obligations: term first, then one_time
    const sortedObligations = obligations.sort((a, b) => {
      const obA = foundObligations.find(o => o.id === a.obligationId);
      const obB = foundObligations.find(o => o.id === b.obligationId);
      if (obA.obligation_type === 'term' && obB.obligation_type === 'one_time') return -1;
      if (obA.obligation_type === 'one_time' && obB.obligation_type === 'term') return 1;
      return 0;
    });

    for (const obligationData of sortedObligations) {
      const obligation = foundObligations.find(o => o.id === obligationData.obligationId);
      const amountToApply = Math.min(obligationData.amount, remainingAmount);

      if (amountToApply <= 0) continue;

      // Check if obligation is already cleared or overpaid
      const currentBalance = parseFloat(obligation.total_balance);
      if (currentBalance <= 0) {
        logger.info(`Obligation ${obligation.id} already cleared/overpaid, skipping`);
        results.push({
          obligationId: obligation.id,
          obligationType: obligation.obligation_type,
          amountPaid: 0,
          newBalance: currentBalance,
          newStatus: obligation.status,
          skipped: true,
          reason: 'Already cleared/overpaid',
        });
        continue;
      }

      // Calculate actual amount to apply (don't exceed balance)
      const actualAmount = Math.min(amountToApply, currentBalance);

      // Get snapshots for waterfall distribution
      const snapshots = obligation.snapshots.map(s => ({
        voteheadId: s.vote_head_id,
        amount: parseFloat(s.amount_assessed),
        priorityOrder: s.priority_order,
      }));

      // Compute waterfall distribution
      const distributions = computeWaterfall(snapshots, actualAmount);

      // Apply distribution to obligation
      const oldBalance = parseFloat(obligation.total_balance);
      const oldPaid = parseFloat(obligation.total_paid);

      obligation.total_paid = oldPaid + actualAmount;
      obligation.total_balance = oldBalance - actualAmount;
      obligation.status = obligationStatus(obligation.total_amount, obligation.total_paid);

      await obligation.save({ transaction });

      // Create payment distributions
      for (const dist of distributions) {
        await PaymentDistribution.create({
          id: `DST-${Date.now().toString(36)}`.slice(0, 20),
          payment_id: payment.id,
          obligation_id: obligation.id,
          vote_head_id: dist.voteheadId,
          amount_applied: dist.amountApplied,
        }, { transaction });
      }

      results.push({
        obligationId: obligation.id,
        obligationType: obligation.obligation_type,
        amountPaid: actualAmount,
        newBalance: obligation.total_balance,
        newStatus: obligation.status,
        distributions: distributions,
        skipped: false,
      });

      remainingAmount -= actualAmount;
    }

    // Handle remaining amount (overpayment) - create credit
    let creditCreated = null;
    if (remainingAmount > 0) {
      const lastProcessed = results.filter(r => !r.skipped);
      const lastObligationId = lastProcessed.length > 0
        ? lastProcessed[lastProcessed.length - 1].obligationId
        : foundObligations[0].id;

      creditCreated = await createStudentCredit(
        normalizedRegNo,
        remainingAmount,
        lastObligationId,
        transaction
      );

      logger.info(`Overpayment of ${remainingAmount} converted to credit for student ${normalizedRegNo}`);
    }

    await transaction.commit();

    // CREATE AUDIT LOG FOR PAYMENT
    await logAction({
      userId: receivedBy || 'SYSTEM',
      action: 'POST',
      entityType: 'Payment',
      entityId: payment.id,
      oldValue: null,
      newValue: {
        payment: payment.toJSON(),
        obligationsApplied: results.filter(r => !r.skipped).length,
        totalAmount,
        creditCreated: creditCreated ? creditCreated.amount : 0,
        regNo: normalizedRegNo,
      },
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    logger.info(`Payment posted: ${payment.id}`, {
      regNo: normalizedRegNo,
      totalAmount,
      receiptNumber: payment.receipt_number,
      obligationsProcessed: results.filter(r => !r.skipped).length,
      obligationsSkipped: results.filter(r => r.skipped).length,
      creditCreated: creditCreated ? creditCreated.amount : 0,
      remainingAmount,
    });

    return {
      payment,
      obligationResults: results,
      creditCreated,
      remainingAmount,
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Failed to post payment:', error.message);
    throw error;
  }
};

/**
 * Create student credit for overpayment
 */
const createStudentCredit = async (regNo, amount, sourceObligationId, transaction) => {
  // Try exact format first
  let credit = await StudentCredit.findOne({
    where: { student_reg_no: regNo },
    transaction,
  });

  // If not found, try alternative format
  if (!credit) {
    const alternativeRegNo = getAlternativeRegNo(regNo);
    credit = await StudentCredit.findOne({
      where: { student_reg_no: alternativeRegNo },
      transaction,
    });
  }

  let isNew = false;
  let oldValue = null;

  if (credit) {
    oldValue = credit.toJSON();
    credit.amount = parseFloat(credit.amount) + amount;
    credit.source_obligation_id = sourceObligationId;
    await credit.save({ transaction });
  } else {
    isNew = true;
    credit = await StudentCredit.create({
      id: `CRED-${Date.now().toString(36)}`.slice(0, 20),
      student_reg_no: regNo,
      amount: amount,
      source_obligation_id: sourceObligationId,
    }, { transaction });
  }

  await logAction({
    userId: 'SYSTEM',
    action: isNew ? 'CREATE' : 'UPDATE',
    entityType: 'StudentCredit',
    entityId: credit.id,
    oldValue: oldValue,
    newValue: credit.toJSON(),
    ipAddress: null,
    userAgent: null,
  });

  return credit;
};

/**
 * Generate receipt for an obligation
 */
const generateReceipt = async (obligationId) => {
  const obligation = await FeeObligation.findByPk(obligationId, {
    include: [
      {
        model: ObligationVoteHeadSnapshot,
        as: 'snapshots',
        order: [['priority_order', 'ASC']],
      },
      {
        model: StudentTermEnrollment,
        as: 'enrollment',
      },
    ],
  });

  if (!obligation) {
    throw new Error(`Obligation ${obligationId} not found`);
  }

  const distributions = await PaymentDistribution.findAll({
    where: { obligation_id: obligationId },
    include: [
      {
        model: Payment,
        as: 'payment',
        where: { is_reversal: false },
      },
    ],
    order: [['created_at', 'ASC']],
  });

  const voteHeadTotals = {};
  for (const dist of distributions) {
    const voteHeadId = dist.vote_head_id;
    if (!voteHeadTotals[voteHeadId]) {
      voteHeadTotals[voteHeadId] = 0;
    }
    voteHeadTotals[voteHeadId] += parseFloat(dist.amount_applied);
  }

  const receipt = {
    obligationId: obligation.id,
    regNo: obligation.student_reg_no,
    studentName: obligation.student_name,
    programmeCode: obligation.programme_code,
    studentYear: obligation.student_year,
    studentTerm: obligation.student_term,
    obligationType: obligation.obligation_type,
    totalAmount: parseFloat(obligation.total_amount),
    totalPaid: parseFloat(obligation.total_paid),
    totalBalance: parseFloat(obligation.total_balance),
    status: obligation.status,
    voteHeads: obligation.snapshots.map(snapshot => {
      const paid = voteHeadTotals[snapshot.vote_head_id] || 0;
      const assessed = parseFloat(snapshot.amount_assessed);
      return {
        name: snapshot.vote_head_name,
        assessed: assessed,
        paid: paid,
        balance: assessed - paid,
        status: paid >= assessed ? 'cleared' : paid > 0 ? 'partial' : 'unpaid',
      };
    }),
    payments: distributions.map(dist => ({
      receiptNumber: dist.payment.receipt_number,
      amount: parseFloat(dist.amount_applied),
      paymentDate: dist.payment.payment_date,
      paymentMode: dist.payment.payment_mode,
      fundingSource: dist.payment.funding_source,
    })),
  };

  return receipt;
};

/**
 * Reverse a payment with audit log
 */
const reversePayment = async (paymentId, reversedBy, notes, ipAddress, userAgent) => {
  const transaction = await db.sequelize.transaction();

  try {
    const originalPayment = await Payment.findByPk(paymentId, { transaction });

    if (!originalPayment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    if (originalPayment.is_reversal) {
      throw new Error(`Payment ${paymentId} is already a reversal`);
    }

    const existingReversal = await Payment.findOne({
      where: { reversal_of: paymentId },
      transaction,
    });

    if (existingReversal) {
      throw new Error(`Payment ${paymentId} has already been reversed`);
    }

    const oldPaymentValue = originalPayment.toJSON();

    // Create reversal payment - ONLY student_reg_no
    const reversal = await Payment.create({
      id: generatePaymentId(),
      student_reg_no: originalPayment.student_reg_no,      // ✅ Primary identifier
      receipt_number: `REV-${originalPayment.receipt_number}`,
      total_amount: -originalPayment.total_amount,
      payment_mode: originalPayment.payment_mode,
      transaction_ref: `REV-${originalPayment.transaction_ref || paymentId}`,
      funding_source: originalPayment.funding_source,
      helb_band: originalPayment.helb_band,
      sponsor_name: originalPayment.sponsor_name,
      received_by: reversedBy,
      is_reversal: true,
      reversal_of: paymentId,
      payment_date: new Date().toISOString().split('T')[0],
      notes: notes || `Reversal of payment ${paymentId}`,
    }, { transaction });

    const distributions = await PaymentDistribution.findAll({
      where: { payment_id: paymentId },
      transaction,
    });

    await PaymentDistribution.destroy({
      where: { payment_id: paymentId },
      transaction,
    });

    const obligationIds = [...new Set(distributions.map(d => d.obligation_id))];
    const reversedObligations = [];

    for (const obligationId of obligationIds) {
      const obligation = await FeeObligation.findByPk(obligationId, { transaction });
      if (obligation) {
        const totalReversed = distributions
          .filter(d => d.obligation_id === obligationId)
          .reduce((sum, d) => sum + parseFloat(d.amount_applied), 0);

        const oldObligationValue = obligation.toJSON();
        obligation.total_paid = parseFloat(obligation.total_paid) - totalReversed;
        obligation.total_balance = parseFloat(obligation.total_balance) + totalReversed;
        obligation.status = obligationStatus(obligation.total_amount, obligation.total_paid);

        await obligation.save({ transaction });

        reversedObligations.push({
          obligationId: obligation.id,
          oldValue: oldObligationValue,
          newValue: obligation.toJSON(),
          amountReversed: totalReversed,
        });
      }
    }

    await transaction.commit();

    await logAction({
      userId: reversedBy || 'SYSTEM',
      action: 'REVERSE',
      entityType: 'Payment',
      entityId: paymentId,
      oldValue: {
        payment: oldPaymentValue,
        reversedObligations: reversedObligations,
      },
      newValue: {
        reversal: reversal.toJSON(),
        reversedObligations: reversedObligations,
      },
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    logger.info(`Payment reversed: ${paymentId}`, {
      reversedBy,
      reversalId: reversal.id,
    });

    return {
      originalPayment,
      reversal,
      reversedObligations: obligationIds,
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Failed to reverse payment:', error.message);
    throw error;
  }
};

/**
 * Get payments by registration number (tries both formats)
 */
const getPaymentsByRegNo = async (regNo) => {
  if (!regNo) return [];

  const normalizedRegNo = normalizeRegNo(regNo);

  // Try exact format first
  let payments = await Payment.findAll({
    where: {
      student_reg_no: normalizedRegNo,
      is_reversal: false,
    },
    include: [
      {
        model: PaymentDistribution,
        as: 'distributions',
        include: [
          {
            model: FeeObligation,
            as: 'obligation',
          },
          {
            model: VoteHead,
            as: 'voteHead',
          },
        ],
      },
    ],
    order: [['payment_date', 'DESC']],
  });

  // If not found, try alternative format
  if (payments.length === 0) {
    const alternativeRegNo = getAlternativeRegNo(normalizedRegNo);
    payments = await Payment.findAll({
      where: {
        student_reg_no: alternativeRegNo,
        is_reversal: false,
      },
      include: [
        {
          model: PaymentDistribution,
          as: 'distributions',
          include: [
            {
              model: FeeObligation,
              as: 'obligation',
            },
            {
              model: VoteHead,
              as: 'voteHead',
            },
          ],
        },
      ],
      order: [['payment_date', 'DESC']],
    });
  }

  return payments;
};

/**
 * Get payment by ID
 */
const getPaymentById = async (id) => {
  const payment = await Payment.findByPk(id, {
    include: [
      {
        model: PaymentDistribution,
        as: 'distributions',
        include: [
          {
            model: FeeObligation,
            as: 'obligation',
          },
          {
            model: VoteHead,
            as: 'voteHead',
          },
        ],
      },
    ],
  });

  if (!payment) {
    throw new Error(`Payment ${id} not found`);
  }

  return payment;
};

module.exports = {
  postPayment,
  generateReceipt,
  reversePayment,
  getPaymentsByRegNo,
  getPaymentById,
};