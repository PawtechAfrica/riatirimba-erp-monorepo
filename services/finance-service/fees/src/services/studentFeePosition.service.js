
const { Op } = require('sequelize');
const db = require('../database/models');
const { logger } = require('../utils/logger');

const {
  StudentTermEnrollment,
  FeeObligation,
  ObligationVoteHeadSnapshot,
  PaymentDistribution,
  Payment,
  StudentCredit,
  FeeStructure,
} = db;

/**
 * =============================================
 * HELPER FUNCTIONS
 * =============================================
 */

/**
 * Normalize registration number (handle both / and - formats)
 * Converts hyphens to slashes for consistent storage
 */
const normalizeRegNo = (regNo) => {
  if (!regNo) return regNo;
  return regNo.includes('/') ? regNo : regNo.replace(/-/g, '/');
};

/**
 * Get the opposite format of a registration number
 * If it has /, convert to -; if it has -, convert to /
 */
const getAlternativeRegNo = (regNo) => {
  if (!regNo) return regNo;
  return regNo.includes('/') 
    ? regNo.replace(/\//g, '-') 
    : regNo.replace(/-/g, '/');
};

/**
 * Search for student enrollments by registration number
 * Tries both formats (with / and with -)
 */
const findEnrollmentsByRegNo = async (regNo, studentYear = null, options = {}) => {
  const { transaction } = options;

  // Try the exact format first
  let whereClause = { student_reg_no: regNo };
  if (studentYear) {
    whereClause.student_year = studentYear;
  }

  let enrollments = await StudentTermEnrollment.findAll({
    where: whereClause,
    include: [
      {
        model: FeeObligation,
        as: 'obligations',
        include: [
          {
            model: ObligationVoteHeadSnapshot,
            as: 'snapshots',
            order: [['priority_order', 'ASC']],
          },
        ],
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
    transaction,
  });

  // If not found, try the opposite format
  if (enrollments.length === 0) {
    const alternativeRegNo = getAlternativeRegNo(regNo);
    
    logger.info(`No enrollments found for ${regNo}, trying alternative format: ${alternativeRegNo}`);
    
    whereClause = { student_reg_no: alternativeRegNo };
    if (studentYear) {
      whereClause.student_year = studentYear;
    }

    enrollments = await StudentTermEnrollment.findAll({
      where: whereClause,
      include: [
        {
          model: FeeObligation,
          as: 'obligations',
          include: [
            {
              model: ObligationVoteHeadSnapshot,
              as: 'snapshots',
              order: [['priority_order', 'ASC']],
            },
          ],
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
      transaction,
    });
  }

  return enrollments;
};

/**
 * Search for student credit by registration number
 * Tries both formats
 */
const findCreditByRegNo = async (regNo, transaction = null) => {
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

  return credit;
};

/**
 * Search for HELB by registration number
 * Tries both formats
 */
const findHelbByRegNo = async (regNo, transaction = null) => {
  try {
    const HelbAssessment = require('../database/models').HelbAssessment;
    
    // Try exact format first
    let helb = await HelbAssessment.findOne({
      where: { student_reg_no: regNo },
      order: [['assessment_year', 'DESC']],
      transaction,
    });

    // If not found, try alternative format
    if (!helb) {
      const alternativeRegNo = getAlternativeRegNo(regNo);
      helb = await HelbAssessment.findOne({
        where: { student_reg_no: alternativeRegNo },
        order: [['assessment_year', 'DESC']],
        transaction,
      });
    }

    return helb;
  } catch (error) {
    logger.warn('HELB table not ready, skipping HELB lookup:', error.message);
    return null;
  }
};

/**
 * =============================================
 * MAIN SERVICES
 * =============================================
 */

/**
 * Get complete fee position for a student by registration number
 */
const getStudentFeePosition = async (regNo, studentYear) => {
  try {
    if (!regNo) {
      return {
        regNo: regNo,
        found: false,
        message: 'Registration number is required',
      };
    }

    // Find enrollments (tries both formats)
    const enrollments = await findEnrollmentsByRegNo(regNo, studentYear);

    if (enrollments.length === 0) {
      return {
        regNo: regNo,
        found: false,
        message: 'No enrollments found for this student',
      };
    }

    // Use the stored reg no from the first enrollment
    const storedRegNo = enrollments[0]?.student_reg_no || regNo;

    // Get student credit (tries both formats)
    const credit = await findCreditByRegNo(storedRegNo);

    // Get student name from first enrollment
    const studentName = enrollments[0]?.student_name || null;
    const programmeCode = enrollments[0]?.programme_code || null;
    const studentId = enrollments[0]?.student_id || null;

    // Build fee position
    const obligations = [];
    let totalTermFees = 0;
    let totalOneTimeFees = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    for (const enrollment of enrollments) {
      const enrollmentObligations = enrollment.obligations || [];

      for (const obligation of enrollmentObligations) {
        // Get payment distributions for this obligation
        const distributions = await PaymentDistribution.findAll({
          where: { obligation_id: obligation.id },
          include: [
            {
              model: Payment,
              as: 'payment',
              where: { is_reversal: false },
              required: false,
            },
          ],
        });

        // Calculate paid per vote head
        const voteHeadPaid = {};
        for (const dist of distributions) {
          const voteHeadId = dist.vote_head_id;
          if (!voteHeadPaid[voteHeadId]) {
            voteHeadPaid[voteHeadId] = 0;
          }
          voteHeadPaid[voteHeadId] += parseFloat(dist.amount_applied);
        }

        // Build vote head details
        const voteHeads = obligation.snapshots.map(snapshot => {
          const paid = voteHeadPaid[snapshot.vote_head_id] || 0;
          const assessed = parseFloat(snapshot.amount_assessed);
          const balance = assessed - paid;

          let status = 'unpaid';
          if (balance <= 0 && paid > 0) status = 'cleared';
          else if (balance > 0 && paid > 0) status = 'partial';

          return {
            name: snapshot.vote_head_name,
            assessed: assessed,
            paid: paid,
            balance: balance,
            status: status,
          };
        });

        // Get student reg_no from obligation
        const obligationRegNo = obligation.student_reg_no || storedRegNo;

        const obligationData = {
          obligationId: obligation.id,
          enrollmentId: enrollment.id,
          regNo: obligationRegNo,
          studentName: obligation.student_name || studentName,
          type: obligation.obligation_type,
          studentTerm: obligation.student_term,
          studentYear: obligation.student_year,
          enrollmentDate: enrollment.enrollment_date,
          feeVersion: enrollment.feeStructure ? enrollment.feeStructure.version_label : 'Unknown',
          feeScope: enrollment.feeStructure ? enrollment.feeStructure.scope_type : 'Unknown',
          totalAmount: parseFloat(obligation.total_amount),
          totalPaid: parseFloat(obligation.total_paid),
          totalBalance: parseFloat(obligation.total_balance),
          status: obligation.status,
          voteHeads: voteHeads,
          payments: distributions.map(d => ({
            receiptNumber: d.payment ? d.payment.receipt_number : 'Unknown',
            amount: parseFloat(d.amount_applied),
            paymentDate: d.payment ? d.payment.payment_date : null,
            paymentMode: d.payment ? d.payment.payment_mode : null,
            fundingSource: d.payment ? d.payment.funding_source : null,
          })),
        };

        obligations.push(obligationData);

        // Update totals
        if (obligation.obligation_type === 'term') {
          totalTermFees += parseFloat(obligation.total_amount);
        } else if (obligation.obligation_type === 'one_time') {
          totalOneTimeFees += parseFloat(obligation.total_amount);
        }
        totalPaid += parseFloat(obligation.total_paid);
        totalBalance += parseFloat(obligation.total_balance);
      }
    }

    // Build summary
    const summary = {
      termFeesTotal: totalTermFees,
      oneTimeTotal: totalOneTimeFees,
      grandTotal: totalTermFees + totalOneTimeFees,
      totalPaid: totalPaid,
      totalBalance: totalBalance,
      creditOnAccount: credit ? parseFloat(credit.amount) : 0,
      netPosition: totalBalance - (credit ? parseFloat(credit.amount) : 0),
    };

    // Get HELB info (tries both formats)
    const helb = await findHelbByRegNo(storedRegNo);
    let helbInfo = null;
    if (helb) {
      helbInfo = {
        band: helb.band,
        assessmentYear: helb.assessment_year,
        scholarship: parseFloat(helb.scholarship_amt),
        loan: parseFloat(helb.loan_amt),
        household: parseFloat(helb.household_amt),
        upkeep: parseFloat(helb.upkeep_amt),
        scholarshipPct: helb.scholarship_pct,
        loanPct: helb.loan_pct,
        householdPct: helb.household_pct,
      };
    }

    return {
      regNo: storedRegNo,
      studentId: studentId,
      studentName: studentName,
      found: true,
      programmeCode: programmeCode,
      studentYear: studentYear || null,
      obligations,
      summary,
      credit: credit ? parseFloat(credit.amount) : 0,
      helb: helbInfo,
      enrollmentCount: enrollments.length,
      obligationCount: obligations.length,
    };
  } catch (error) {
    logger.error('Error getting student fee position:', error.message);
    throw error;
  }
};

/**
 * Get fee position summary only (lightweight)
 */

const getStudentFeeSummary = async (regNo) => {
  if (!regNo) {
    return {
      regNo: regNo,
      found: false,
      message: 'Registration number is required',
    };
  }

  const position = await getStudentFeePosition(regNo);

  if (!position.found) {
    return position;
  }

  return {
    regNo: position.regNo,
    found: true,   // ← this was missing
    studentId: position.studentId,
    studentName: position.studentName,
    programmeCode: position.programmeCode,
    summary: position.summary,
    credit: position.credit,
    helb: position.helb,
    enrollmentCount: position.enrollmentCount,
    obligationCount: position.obligationCount,
  };
};



/**
 * Get outstanding balances for all students (for reporting)
 * Now includes registration number
 */
const getAllOutstandingBalances = async (filters = {}) => {
  const whereClause = {
    status: { [Op.in]: ['unpaid', 'partial'] },
  };

  if (filters.programmeCode) {
    whereClause.programme_code = filters.programmeCode;
  }

  const obligations = await FeeObligation.findAll({
    where: whereClause,
    attributes: [
      'student_reg_no',
      'student_name',
      'programme_code',
      [db.sequelize.fn('SUM', db.sequelize.col('total_balance')), 'total_outstanding'],
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'obligation_count'],
    ],
    group: ['student_reg_no', 'student_name', 'programme_code'],
    having: db.sequelize.where(
      db.sequelize.fn('SUM', db.sequelize.col('total_balance')),
      { [Op.gt]: 0 }
    ),
    order: [[db.sequelize.fn('SUM', db.sequelize.col('total_balance')), 'DESC']],
  });

  return obligations;
};

/**
 * Get student by registration number (simple lookup)
 * Tries both formats
 */
const getStudentByRegNo = async (regNo) => {
  if (!regNo) return null;
  
  // Try exact format first
  let enrollment = await StudentTermEnrollment.findOne({
    where: { student_reg_no: regNo },
    order: [['created_at', 'DESC']],
  });

  // If not found, try alternative format
  if (!enrollment) {
    const alternativeRegNo = getAlternativeRegNo(regNo);
    enrollment = await StudentTermEnrollment.findOne({
      where: { student_reg_no: alternativeRegNo },
      order: [['created_at', 'DESC']],
    });
  }

  if (!enrollment) {
    return null;
  }

  return {
    regNo: enrollment.student_reg_no,
    studentId: enrollment.student_id,
    studentName: enrollment.student_name,
    programmeCode: enrollment.programme_code,
    studentYear: enrollment.student_year,
    studentTerm: enrollment.student_term,
    status: enrollment.status,
  };
};

/**
 * Get all obligations for a student by registration number
 * Tries both formats
 */
const getObligationsByRegNo = async (regNo) => {
  if (!regNo) return [];
  
  // Try exact format first
  let obligations = await FeeObligation.findAll({
    where: { student_reg_no: regNo },
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
    order: [
      ['student_year', 'ASC'],
      ['student_term', 'ASC'],
    ],
  });

  // If not found, try alternative format
  if (obligations.length === 0) {
    const alternativeRegNo = getAlternativeRegNo(regNo);
    obligations = await FeeObligation.findAll({
      where: { student_reg_no: alternativeRegNo },
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
      order: [
        ['student_year', 'ASC'],
        ['student_term', 'ASC'],
      ],
    });
  }

  return obligations;
};

module.exports = {
  getStudentFeePosition,
  getStudentFeeSummary,
  getAllOutstandingBalances,
  getStudentByRegNo,
  getObligationsByRegNo,
};