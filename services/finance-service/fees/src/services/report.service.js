const { Op } = require('sequelize');
const db = require('../database/models');
const { logger } = require('../utils/logger');

const {
  Payment,
  PaymentDistribution,
  FeeObligation,
  StudentTermEnrollment,
  VoteHead,
  StudentCredit,
} = db;

/**
 * Get daily collection report
 */
const getDailyCollection = async (date) => {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    // Get all payments for the day
    const payments = await Payment.findAll({
      where: {
        payment_date: targetDate,
        is_reversal: false,
      },
      include: [
        {
          model: PaymentDistribution,
          as: 'distributions',
          include: [
            {
              model: VoteHead,
              as: 'voteHead',
            },
          ],
        },
      ],
    });

    // Calculate totals by payment mode
    const byPaymentMode = {};
    const byFundingSource = {};
    let totalCollected = 0;
    let totalTransactions = payments.length;

    for (const payment of payments) {
      const amount = parseFloat(payment.total_amount);
      totalCollected += amount;

      // By payment mode
      const mode = payment.payment_mode;
      if (!byPaymentMode[mode]) {
        byPaymentMode[mode] = { count: 0, total: 0 };
      }
      byPaymentMode[mode].count += 1;
      byPaymentMode[mode].total += amount;

      // By funding source
      const source = payment.funding_source;
      if (!byFundingSource[source]) {
        byFundingSource[source] = { count: 0, total: 0 };
      }
      byFundingSource[source].count += 1;
      byFundingSource[source].total += amount;
    }

    return {
      date: targetDate,
      summary: {
        totalCollected,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalCollected / totalTransactions : 0,
      },
      byPaymentMode,
      byFundingSource,
      payments: payments.map(p => ({
        id: p.id,
        receiptNumber: p.receipt_number,
        studentId: p.student_id,
        amount: parseFloat(p.total_amount),
        paymentMode: p.payment_mode,
        fundingSource: p.funding_source,
        paymentDate: p.payment_date,
        receivedBy: p.received_by,
      })),
    };
  } catch (error) {
    logger.error('Error generating daily collection report:', error.message);
    throw error;
  }
};

/**
 * Get weekly collection summary
 */
const getWeeklySummary = async (weekStartDate) => {
  try {
    let startDate;
    if (weekStartDate) {
      startDate = new Date(weekStartDate);
    } else {
      // Default to current week (Monday)
      startDate = new Date();
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
    }
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get all payments for the week
    const payments = await Payment.findAll({
      where: {
        payment_date: {
          [Op.between]: [startDateStr, endDateStr],
        },
        is_reversal: false,
      },
      include: [
        {
          model: PaymentDistribution,
          as: 'distributions',
        },
      ],
    });

    // Daily breakdown
    const dailyBreakdown = {};
    let totalCollected = 0;
    let totalTransactions = payments.length;

    for (const payment of payments) {
      const date = payment.payment_date;
      const amount = parseFloat(payment.total_amount);
      totalCollected += amount;

      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = { count: 0, total: 0 };
      }
      dailyBreakdown[date].count += 1;
      dailyBreakdown[date].total += amount;
    }

    return {
      weekStart: startDateStr,
      weekEnd: endDateStr,
      summary: {
        totalCollected,
        totalTransactions,
        averageDaily: totalCollected / 7,
      },
      dailyBreakdown,
    };
  } catch (error) {
    logger.error('Error generating weekly summary:', error.message);
    throw error;
  }
};

/**
 * Get monthly collection summary
 */
const getMonthlySummary = async (year, month) => {
  try {
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month !== undefined ? month : new Date().getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const payments = await Payment.findAll({
      where: {
        payment_date: {
          [Op.between]: [startDateStr, endDateStr],
        },
        is_reversal: false,
      },
      include: [
        {
          model: PaymentDistribution,
          as: 'distributions',
        },
      ],
    });

    let totalCollected = 0;
    let totalTransactions = payments.length;

    // Weekly breakdown
    const weeklyBreakdown = {};
    for (const payment of payments) {
      const amount = parseFloat(payment.total_amount);
      totalCollected += amount;

      const date = new Date(payment.payment_date);
      const weekNumber = Math.ceil(date.getDate() / 7);
      const weekKey = `Week ${weekNumber}`;
      
      if (!weeklyBreakdown[weekKey]) {
        weeklyBreakdown[weekKey] = { count: 0, total: 0 };
      }
      weeklyBreakdown[weekKey].count += 1;
      weeklyBreakdown[weekKey].total += amount;
    }

    return {
      month: `${targetYear}-${String(targetMonth).padStart(2, '0')}`,
      summary: {
        totalCollected,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalCollected / totalTransactions : 0,
      },
      weeklyBreakdown,
    };
  } catch (error) {
    logger.error('Error generating monthly summary:', error.message);
    throw error;
  }
};

/**
 * Get programme-wise collection report
 */
const getProgrammeCollection = async (startDate, endDate) => {
  try {
    const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Get all payments with distributions that link to obligations with programme_code
    const distributions = await PaymentDistribution.findAll({
      where: {
        created_at: {
          [Op.between]: [new Date(start), new Date(end)],
        },
      },
      include: [
        {
          model: FeeObligation,
          as: 'obligation',
          attributes: ['programme_code', 'student_id'],
        },
        {
          model: Payment,
          as: 'payment',
          where: { is_reversal: false },
          attributes: ['payment_date', 'receipt_number'],
        },
      ],
    });

    const programmeData = {};
    let totalCollected = 0;

    for (const dist of distributions) {
      const programmeCode = dist.obligation?.programme_code || 'UNKNOWN';
      const amount = parseFloat(dist.amount_applied) || 0;
      totalCollected += amount;

      if (!programmeData[programmeCode]) {
        programmeData[programmeCode] = {
          programmeCode,
          totalPaid: 0,
          transactionCount: 0,
          studentCount: new Set(),
        };
      }

      programmeData[programmeCode].totalPaid += amount;
      programmeData[programmeCode].transactionCount += 1;
      if (dist.obligation?.student_id) {
        programmeData[programmeCode].studentCount.add(dist.obligation.student_id);
      }
    }

    // Convert Set to count
    const result = Object.values(programmeData).map(p => ({
      ...p,
      studentCount: p.studentCount.size,
    }));

    // Sort by totalPaid descending
    result.sort((a, b) => b.totalPaid - a.totalPaid);

    return {
      period: { start, end },
      summary: {
        totalCollected,
        totalProgrammes: result.length,
      },
      programmes: result,
    };
  } catch (error) {
    logger.error('Error generating programme collection report:', error.message);
    throw error;
  }
};

/**
 * Get outstanding aging report
 */
const getAgingReport = async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get all unpaid/partial obligations
    const obligations = await FeeObligation.findAll({
      where: {
        status: {
          [Op.in]: ['unpaid', 'partial'],
        },
        total_balance: {
          [Op.gt]: 0,
        },
      },
      include: [
        {
          model: StudentTermEnrollment,
          as: 'enrollment',
          attributes: ['enrollment_date', 'programme_code'],
        },
      ],
    });

    const agingBuckets = {
      '0-30': { count: 0, total: 0, students: [] },
      '31-60': { count: 0, total: 0, students: [] },
      '61-90': { count: 0, total: 0, students: [] },
      '90+': { count: 0, total: 0, students: [] },
    };

    const studentMap = {};

    for (const obligation of obligations) {
      const enrollmentDate = obligation.enrollment?.enrollment_date;
      if (!enrollmentDate) continue;

      const daysOverdue = Math.floor((today - new Date(enrollmentDate)) / (1000 * 60 * 60 * 24));
      const balance = parseFloat(obligation.total_balance);
      const studentId = obligation.student_id;

      let bucket;
      if (daysOverdue <= 30) bucket = '0-30';
      else if (daysOverdue <= 60) bucket = '31-60';
      else if (daysOverdue <= 90) bucket = '61-90';
      else bucket = '90+';

      agingBuckets[bucket].count += 1;
      agingBuckets[bucket].total += balance;

      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          studentId,
          programmeCode: obligation.programme_code,
          totalBalance: 0,
          obligations: [],
        };
      }
      studentMap[studentId].totalBalance += balance;
      studentMap[studentId].obligations.push({
        obligationId: obligation.id,
        amount: balance,
        daysOverdue,
        term: obligation.student_term,
        year: obligation.student_year,
      });
    }

    // Build student list with balances
    const students = Object.values(studentMap)
      .filter(s => s.totalBalance > 0)
      .sort((a, b) => b.totalBalance - a.totalBalance);

    // Add to buckets
    for (const student of students) {
      for (const obligation of student.obligations) {
        const days = obligation.daysOverdue;
        if (days <= 30) agingBuckets['0-30'].students.push(student);
        else if (days <= 60) agingBuckets['31-60'].students.push(student);
        else if (days <= 90) agingBuckets['61-90'].students.push(student);
        else agingBuckets['90+'].students.push(student);
        break; // Add student once based on oldest obligation
      }
    }

    // Deduplicate students in buckets
    for (const bucketKey of Object.keys(agingBuckets)) {
      const uniqueStudents = [];
      const seen = new Set();
      for (const student of agingBuckets[bucketKey].students) {
        if (!seen.has(student.studentId)) {
          seen.add(student.studentId);
          uniqueStudents.push(student);
        }
      }
      agingBuckets[bucketKey].students = uniqueStudents;
    }

    const totalOutstanding = Object.values(agingBuckets).reduce((sum, b) => sum + b.total, 0);

    return {
      generatedDate: todayStr,
      totalOutstanding,
      totalStudents: students.length,
      agingBuckets,
      students: students.slice(0, 100), // Top 100 students with balances
    };
  } catch (error) {
    logger.error('Error generating aging report:', error.message);
    throw error;
  }
};

/**
 * Get collection summary (overall)
 */
const getCollectionSummary = async (startDate, endDate) => {
  try {
    const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const payments = await Payment.findAll({
      where: {
        payment_date: {
          [Op.between]: [start, end],
        },
        is_reversal: false,
      },
      include: [
        {
          model: PaymentDistribution,
          as: 'distributions',
          include: [
            {
              model: VoteHead,
              as: 'voteHead',
            },
          ],
        },
      ],
    });

    let totalCollected = 0;
    const voteHeadTotals = {};

    for (const payment of payments) {
      const amount = parseFloat(payment.total_amount);
      totalCollected += amount;

      for (const dist of payment.distributions || []) {
        const voteHeadName = dist.voteHead?.name || 'Unknown';
        const distAmount = parseFloat(dist.amount_applied) || 0;
        if (!voteHeadTotals[voteHeadName]) {
          voteHeadTotals[voteHeadName] = 0;
        }
        voteHeadTotals[voteHeadName] += distAmount;
      }
    }

    return {
      period: { start, end },
      totalCollected,
      totalTransactions: payments.length,
      voteHeadTotals,
    };
  } catch (error) {
    logger.error('Error generating collection summary:', error.message);
    throw error;
  }
};

module.exports = {
  getDailyCollection,
  getWeeklySummary,
  getMonthlySummary,
  getProgrammeCollection,
  getAgingReport,
  getCollectionSummary,
};