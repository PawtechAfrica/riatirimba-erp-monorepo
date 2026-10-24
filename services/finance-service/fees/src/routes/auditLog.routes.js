const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { validate } = require('../validators');
const { auditLogFiltersSchema } = require('../validators/auditLog.validator');

/**
 * @route GET /api/audit-logs
 * @desc Get all audit logs with filters
 * @access Admin, Finance
 */
router.get('/', validate(auditLogFiltersSchema), auditLogController.getAuditLogs);

/**
 * @route GET /api/audit-logs/stats
 * @desc Get audit log statistics
 * @access Admin, Finance
 */
router.get('/stats', auditLogController.getStats);

/**
 * @route GET /api/audit-logs/recent
 * @desc Get recent audit logs
 * @access Admin, Finance
 */
router.get('/recent', auditLogController.getRecent);

/**
 * @route GET /api/audit-logs/user/:userId
 * @desc Get audit logs by user
 * @access Admin, Finance
 */
router.get('/user/:userId', auditLogController.getByUser);

/**
 * @route GET /api/audit-logs/entity/:entityType/:entityId
 * @desc Get audit logs by entity
 * @access Admin, Finance
 */
router.get('/entity/:entityType/:entityId', auditLogController.getByEntity);

/**
 * @route GET /api/audit-logs/:id
 * @desc Get audit log by ID
 * @access Admin, Finance
 */
router.get('/:id', auditLogController.getById);

/**
 * @route DELETE /api/audit-logs/cleanup
 * @desc Delete old audit logs
 * @access Admin only
 */
router.delete('/cleanup', auditLogController.cleanupOldLogs);

module.exports = router;