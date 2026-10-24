const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/models');
const { logger } = require('../utils/logger');
const feeStructureService = require('./feeStructure.service');
const { logAction } = require('../middlewares/audit.middleware');

const {
  StudentTermEnrollment,
  FeeObligation,
  ObligationVoteHeadSnapshot,
  StudentCredit,
  FeeStructure,
  FeeStructureLine,
  VoteHead,
  Programme,
} = db;

// =============================================
// ID GENERATORS
// =============================================

const generateEnrollmentId = () => `STE-${Date.now().toString(36)}`.slice(0, 20);
const generateObligationId = () => `OBL-${Date.now().toString(36)}`.slice(0, 20);
const generateSnapshotId = () => `SNAP-${Date.now().toString(36)}`.slice(0, 20);
const generatePaymentId = () => `PMT-${Date.now().toString(36)}`.slice(0, 20);

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
 * Generate eventId from student reg no + year + term
 */
const generateEventId = (payload) => {
  const { studentRegNo, studentYear, studentTerm } = payload;
  const normalizedRegNo = studentRegNo?.replace(/\//g, '-') || 'UNKNOWN';
  return `EVT-${normalizedRegNo}-Y${studentYear}T${studentTerm}`.slice(0, 80);
};

// =============================================
// MAIN SERVICES
// =============================================

/**
 * Process a TERM_ADVANCED enrollment event from Academics
 * Uses registration number as the primary identifier
 */
const processEnrollmentEvent = async (eventData) => {
  const transaction = await db.sequelize.transaction();

  try {
    const {
      eventId: providedEventId,
      event,
      studentRegNo,     // ✅ Required - Primary identifier
      studentName,      // ✅ Optional
      programmeCode,    // ✅ Required
      studentYear,      // ✅ Required
      studentTerm,      // ✅ Required
      enrollmentDate,   // ✅ Required
      studentCategory,
      isNewStudent,
      enrolledBy,
      ipAddress,
      userAgent,
    } = eventData;

    // Normalize registration number
    const normalizedRegNo = normalizeRegNo(studentRegNo);

    // Generate eventId if not provided
    const eventId = providedEventId || generateEventId({ 
      studentRegNo: normalizedRegNo, 
      studentYear, 
      studentTerm 
    });

    // 1. Check idempotency
    const existingEnrollment = await StudentTermEnrollment.findOne({
      where: { source_event_id: eventId },
      transaction,
    });

    if (existingEnrollment) {
      logger.info(`Event ${eventId} already processed`);
      await transaction.rollback();
      return {
        success: true,
        data: existingEnrollment,
        alreadyProcessed: true,
      };
    }

    // 2. Try to find programme in local DB (optional)
    let programme = null;
    let programmeId = null;
    
    try {
      programme = await Programme.findOne({
        where: { code: programmeCode, is_active: true },
        transaction,
      });
      
      if (programme) {
        programmeId = programme.id;
        logger.info(`Found programme locally: ${programmeCode}`);
      } else {
        logger.info(`Programme ${programmeCode} not in local DB, will store as reference only`);
      }
    } catch (error) {
      logger.warn(`Could not lookup programme ${programmeCode}: ${error.message}`);
    }

    // 3. Resolve fee structure
    let departmentId = null;
    if (programme && programme.department_id) {
      departmentId = programme.department_id;
    }

    const feeStructure = await feeStructureService.resolveFeeStructure({
      termNumber: studentTerm,
      enrollmentDate: enrollmentDate,
      programmeCode: programmeCode,
      departmentId: departmentId,
      studentCategory: studentCategory || null,
    });

    if (!feeStructure) {
      throw new Error(
        `No active fee structure found for term ${studentTerm} on ${enrollmentDate} ` +
        `for programme ${programmeCode}`
      );
    }

    // 4. Create enrollment record - NO student_id
    const enrollment = await StudentTermEnrollment.create({
      id: generateEnrollmentId(),
      student_reg_no: normalizedRegNo,        // ✅ Primary identifier
      student_name: studentName || null,
      programme_id: programmeId,
      programme_code: programmeCode,
      student_year: studentYear,
      student_term: studentTerm,
      fee_structure_id: feeStructure.id,
      student_category: studentCategory || 'regular',
      is_new_student: isNewStudent || false,
      enrollment_date: enrollmentDate,
      enrolled_by: enrolledBy,
      source_event_id: eventId,
      status: 'active',
      notes: `Enrolled via event ${eventId}`,
    }, { transaction });

    // 5. Create term obligation - NO student_id
    const termObligation = await createTermObligation(
      enrollment,
      feeStructure,
      programmeId,
      programmeCode,
      normalizedRegNo,
      studentName,
      transaction
    );

    // 6. Create one-time obligation if new student
    let oneTimeObligation = null;
    if (isNewStudent) {
      const existingOneTime = await FeeObligation.findOne({
        where: {
          student_reg_no: normalizedRegNo,
          obligation_type: 'one_time',
        },
        transaction,
      });

      if (!existingOneTime) {
        oneTimeObligation = await createOneTimeObligation(
          enrollment,
          programmeId,
          programmeCode,
          normalizedRegNo,
          studentName,
          transaction
        );
      } else {
        logger.info(`Student ${normalizedRegNo} already has one-time charges, skipping`);
      }
    }

    // 7. Apply credit if any
    let creditApplied = 0;
    let creditRemaining = 0;

    const studentCredit = await StudentCredit.findOne({
      where: { student_reg_no: normalizedRegNo },
      transaction,
    });

    if (studentCredit && studentCredit.amount > 0) {
      const result = await applyCredit(
        studentCredit,
        termObligation,
        transaction
      );
      creditApplied = result.applied;
      creditRemaining = result.remaining;
    }

    // 8. Update obligation status
    await updateObligationStatus(termObligation, transaction);

    // 9. Commit transaction
    await transaction.commit();

    // 10. Audit log
    await logAction({
      userId: enrolledBy || 'SYSTEM',
      action: 'TERM_ADVANCED',
      entityType: 'TraineeTermEnrollment',
      entityId: enrollment.id,
      oldValue: null,
      newValue: {
        enrollment: enrollment.toJSON(),
        termObligation: termObligation.toJSON(),
        oneTimeObligation: oneTimeObligation ? oneTimeObligation.toJSON() : null,
        feeStructure: feeStructure.id,
        creditApplied: creditApplied,
        creditRemaining: creditRemaining,
        isNewStudent: isNewStudent,
        regNo: normalizedRegNo,
      },
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    // 11. Fetch complete enrollment
    const completeEnrollment = await StudentTermEnrollment.findByPk(enrollment.id, {
      include: [
        {
          model: FeeObligation,
          as: 'obligations',
          include: [
            {
              model: ObligationVoteHeadSnapshot,
              as: 'snapshots',
            },
          ],
        },
        {
          model: Programme,
          as: 'programme',
        },
        {
          model: FeeStructure,
          as: 'feeStructure',
          include: [
            {
              model: FeeStructureLine,
              as: 'lines',
            },
          ],
        },
      ],
    });

    logger.info(`Enrollment processed: ${enrollment.id} for student ${normalizedRegNo}`, {
      term: `${studentYear}.${studentTerm}`,
      feeStructure: feeStructure.id,
      totalAmount: termObligation.total_amount,
      creditApplied,
      programmeCode,
      regNo: normalizedRegNo,
    });

    return {
      success: true,
      data: {
        enrollment: completeEnrollment,
        creditApplied,
        creditRemaining,
        termObligation,
        oneTimeObligation,
        feeStructureUsed: feeStructure,
        programmeFound: !!programme,
      },
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Failed to process enrollment event:', error.message);
    throw error;
  }
};

/**
 * Create a term obligation from enrollment
 */
const createTermObligation = async (
  enrollment,
  feeStructure,
  programmeId,
  programmeCode,
  regNo,
  studentName,
  transaction
) => {
  const obligation = await FeeObligation.create({
    id: generateObligationId(),
    enrollment_id: enrollment.id,
    student_reg_no: regNo,              // ✅ Primary identifier
    student_name: studentName || null,
    programme_id: programmeId,
    programme_code: programmeCode,
    student_year: enrollment.student_year,
    student_term: enrollment.student_term,
    obligation_type: 'term',
    total_amount: feeStructure.total_amount,
    total_paid: 0,
    total_balance: feeStructure.total_amount,
    status: 'unpaid',
  }, { transaction });

  // Create snapshots
  const lines = await FeeStructureLine.findAll({
    where: { fee_structure_id: feeStructure.id },
    include: [{ model: VoteHead, as: 'voteHead' }],
    order: [['priority_order', 'ASC']],
    transaction,
  });

  for (const line of lines) {
    await ObligationVoteHeadSnapshot.create({
      id: generateSnapshotId(),
      obligation_id: obligation.id,
      vote_head_id: line.vote_head_id,
      vote_head_name: line.voteHead ? line.voteHead.name : 'Unknown',
      amount_assessed: line.amount,
      priority_order: line.priority_order,
    }, { transaction });
  }

  logger.info(`Term obligation created: ${obligation.id}`, {
    totalAmount: obligation.total_amount,
    snapshots: lines.length,
    regNo: regNo,
  });

  return obligation;
};

/**
 * Create one-time obligation for new students
 */
const createOneTimeObligation = async (
  enrollment,
  programmeId,
  programmeCode,
  regNo,
  studentName,
  transaction
) => {
  const obligation = await FeeObligation.create({
    id: generateObligationId(),
    enrollment_id: enrollment.id,
    student_reg_no: regNo,              // ✅ Primary identifier
    student_name: studentName || null,
    programme_id: programmeId,
    programme_code: programmeCode,
    student_year: enrollment.student_year,
    student_term: enrollment.student_term,
    obligation_type: 'one_time',
    total_amount: 1000.00,
    total_paid: 0,
    total_balance: 1000.00,
    status: 'unpaid',
  }, { transaction });

  const oneTimeData = [
    { id: 'VH-ADM', name: 'Admission Fee', amount: 500.00, priority: 1 },
    { id: 'VH-ID', name: 'Student ID', amount: 500.00, priority: 2 },
  ];

  for (const item of oneTimeData) {
    await ObligationVoteHeadSnapshot.create({
      id: generateSnapshotId(),
      obligation_id: obligation.id,
      vote_head_id: item.id,
      vote_head_name: item.name,
      amount_assessed: item.amount,
      priority_order: item.priority,
    }, { transaction });
  }

  logger.info(`One-time obligation created: ${obligation.id}`, {
    totalAmount: obligation.total_amount,
    regNo: regNo,
  });

  return obligation;
};

/**
 * Apply credit to an obligation
 */
const applyCredit = async (studentCredit, obligation, transaction) => {
  const creditAmount = parseFloat(studentCredit.amount);
  const obligationBalance = parseFloat(obligation.total_balance);

  const amountToApply = Math.min(creditAmount, obligationBalance);
  const remainingCredit = creditAmount - amountToApply;

  if (amountToApply > 0) {
    const oldValue = obligation.toJSON();

    obligation.total_paid = parseFloat(obligation.total_paid) + amountToApply;
    obligation.total_balance = parseFloat(obligation.total_balance) - amountToApply;
    await obligation.save({ transaction });

    const Payment = require('../database/models').Payment;
    await Payment.create({
      id: generatePaymentId(),
      student_reg_no: obligation.student_reg_no,  // ✅ Primary identifier
      receipt_number: `SYS-${Date.now()}-${uuidv4().slice(0, 6)}`,
      total_amount: amountToApply,
      payment_mode: 'credit_transfer',
      transaction_ref: `CREDIT-${studentCredit.id}`,
      funding_source: 'carry_forward',
      helb_band: null,
      sponsor_name: null,
      received_by: 'SYSTEM',
      is_reversal: false,
      reversal_of: null,
      payment_date: new Date().toISOString().split('T')[0],
      notes: `Auto-applied credit from previous overpayment`,
    }, { transaction });

    if (remainingCredit > 0) {
      await studentCredit.update({
        amount: remainingCredit,
        source_obligation_id: obligation.id,
      }, { transaction });
    } else {
      await studentCredit.destroy({ transaction });
    }

    logger.info(`Credit applied: ${amountToApply} to obligation ${obligation.id}`, {
      remainingCredit,
    });
  }

  return {
    applied: amountToApply,
    remaining: remainingCredit,
  };
};

/**
 * Update obligation status
 */
const updateObligationStatus = async (obligation, transaction) => {
  const balance = parseFloat(obligation.total_balance);
  const paid = parseFloat(obligation.total_paid);

  let status = 'unpaid';
  if (balance === 0 && paid > 0) status = 'cleared';
  else if (balance > 0 && paid > 0) status = 'partial';
  else if (balance < 0) status = 'overpaid';

  const oldValue = obligation.toJSON();
  obligation.status = status;
  await obligation.save({ transaction });

  if (oldValue.status !== status) {
    await logAction({
      userId: 'SYSTEM',
      action: 'UPDATE_STATUS',
      entityType: 'FeeObligation',
      entityId: obligation.id,
      oldValue: { status: oldValue.status },
      newValue: { status: status },
      ipAddress: null,
      userAgent: null,
    });
  }

  return obligation;
};

/**
 * Get enrollment by ID
 */
const getEnrollmentById = async (id) => {
  const enrollment = await StudentTermEnrollment.findByPk(id, {
    include: [
      {
        model: FeeObligation,
        as: 'obligations',
        include: [
          {
            model: ObligationVoteHeadSnapshot,
            as: 'snapshots',
          },
        ],
      },
      {
        model: Programme,
        as: 'programme',
      },
      {
        model: FeeStructure,
        as: 'feeStructure',
      },
    ],
  });

  if (!enrollment) {
    throw new Error(`Enrollment ${id} not found`);
  }

  return enrollment;
};

/**
 * Get enrollments by registration number
 */
const getEnrollmentsByRegNo = async (regNo) => {
  if (!regNo) return [];

  // Try exact format first
  let enrollments = await StudentTermEnrollment.findAll({
    where: { student_reg_no: regNo },
    include: [
      {
        model: FeeObligation,
        as: 'obligations',
        include: [
          {
            model: ObligationVoteHeadSnapshot,
            as: 'snapshots',
          },
        ],
      },
      {
        model: Programme,
        as: 'programme',
      },
      {
        model: FeeStructure,
        as: 'feeStructure',
      },
    ],
    order: [
      ['student_year', 'ASC'],
      ['student_term', 'ASC'],
    ],
  });

  // If not found, try alternative format
  if (enrollments.length === 0) {
    const alternativeRegNo = getAlternativeRegNo(regNo);
    enrollments = await StudentTermEnrollment.findAll({
      where: { student_reg_no: alternativeRegNo },
      include: [
        {
          model: FeeObligation,
          as: 'obligations',
          include: [
            {
              model: ObligationVoteHeadSnapshot,
              as: 'snapshots',
            },
          ],
        },
        {
          model: Programme,
          as: 'programme',
        },
        {
          model: FeeStructure,
          as: 'feeStructure',
        },
      ],
      order: [
        ['student_year', 'ASC'],
        ['student_term', 'ASC'],
      ],
    });
  }

  return enrollments;
};

/**
 * Update enrollment status
 */
const updateEnrollmentStatus = async (id, status, notes) => {
  const enrollment = await StudentTermEnrollment.findByPk(id);

  if (!enrollment) {
    throw new Error(`Enrollment ${id} not found`);
  }

  const validStatuses = ['active', 'completed', 'withdrawn', 'deferred'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  const oldValue = enrollment.toJSON();

  await enrollment.update({
    status,
    notes: notes || enrollment.notes,
  });

  await logAction({
    userId: 'SYSTEM',
    action: 'UPDATE_STATUS',
    entityType: 'StudentTermEnrollment',
    entityId: enrollment.id,
    oldValue: { status: oldValue.status },
    newValue: { status: status },
    ipAddress: null,
    userAgent: null,
  });

  logger.info(`Enrollment ${id} status updated to ${status}`);

  return enrollment;
};

module.exports = {
  processEnrollmentEvent,
  getEnrollmentById,
  getEnrollmentsByRegNo,
  updateEnrollmentStatus,
  createTermObligation,
  createOneTimeObligation,
  applyCredit,
  updateObligationStatus,
};