const express = require('express');
const router = express.Router();
const feeStructureRoutes = require('./feeStructure.routes');
const voteHeadRoutes = require('./voteHead.routes');
const enrollmentRoutes = require('./enrollment.routes');
const paymentRoutes = require('./payment.routes');
const studentFeePositionRoutes = require('./studentFeePosition.routes');
const receiptRoutes = require('./receipt.routes');
const auditLogRoutes = require('./auditLog.routes');
const reportRoutes = require('./report.routes');

// Mount routes
router.use('/fee-structures', feeStructureRoutes);
router.use('/vote-heads', voteHeadRoutes);
router.use('/enrollment-events', enrollmentRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/payments', paymentRoutes);
router.use('/students', studentFeePositionRoutes);
router.use('/reports', reportRoutes);
router.use('/receipts', receiptRoutes);
router.use('/audit-logs', auditLogRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'riatirimba-finance-service',
    timestamp: new Date().toISOString(),
  });
});

// Root API endpoint
router.get('/', (req, res) => {
  res.json({
    service: 'riatirimba-finance-service',
    version: '1.0.0',
    endpoints: {
      vote_heads: '/api/vote-heads',
      fee_structures: '/api/fee-structures',
      enrollment_events: '/api/enrollment-events',
      enrollments: '/api/enrollments',
      payments: '/api/payments',
      receipts: '/api/receipts',
      student_fee_position: '/api/students/:studentId/fee-position',
      outstanding_report: '/api/reports/outstanding',
      health: '/api/health',
    },
  });
});

module.exports = router;