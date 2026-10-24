const auditLogService = require('../services/auditLog.service');
const { logger } = require('../utils/logger');
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Get audit logs with filters
 * GET /api/audit-logs
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const filters = {
      userId: req.query.user_id,
      entityType: req.query.entity_type,
      entityId: req.query.entity_id,
      action: req.query.action,
      search: req.query.search,
      startDate: req.query.start_date,
      endDate: req.query.end_date,
      limit: req.query.limit,
      offset: req.query.offset,
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const result = await auditLogService.getAuditLogs(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
      count: result.data.length,
    });
  } catch (error) {
    logger.error('Error fetching audit logs:', error.message);
    next(error);
  }
};

/**
 * Get audit logs by user
 * GET /api/audit-logs/user/:userId
 */
const getByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const filters = {
      limit: req.query.limit,
      offset: req.query.offset,
      startDate: req.query.start_date,
      endDate: req.query.end_date,
    };

    const result = await auditLogService.getAuditLogsByUser(userId, filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
      count: result.data.length,
    });
  } catch (error) {
    logger.error('Error fetching user audit logs:', error.message);
    next(error);
  }
};

/**
 * Get audit logs by entity
 * GET /api/audit-logs/entity/:entityType/:entityId
 */
const getByEntity = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const filters = {
      limit: req.query.limit,
      offset: req.query.offset,
      startDate: req.query.start_date,
      endDate: req.query.end_date,
    };

    const result = await auditLogService.getAuditLogsByEntity(entityType, entityId, filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
      count: result.data.length,
    });
  } catch (error) {
    logger.error('Error fetching entity audit logs:', error.message);
    next(error);
  }
};

/**
 * Get recent audit logs
 * GET /api/audit-logs/recent
 */
const getRecent = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const result = await auditLogService.getRecentAuditLogs(limit);

    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
    });
  } catch (error) {
    logger.error('Error fetching recent audit logs:', error.message);
    next(error);
  }
};

/**
 * Get audit log by ID
 * GET /api/audit-logs/:id
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const auditLog = await auditLogService.getAuditLogById(id);

    res.json({
      success: true,
      data: auditLog,
    });
  } catch (error) {
    logger.error('Error fetching audit log:', error.message);
    next(error);
  }
};

/**
 * Get audit log statistics
 * GET /api/audit-logs/stats
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await auditLogService.getAuditLogStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching audit log stats:', error.message);
    next(error);
  }
};

/**
 * Delete old audit logs
 * DELETE /api/audit-logs/cleanup
 */
const cleanupOldLogs = async (req, res, next) => {
  try {
    const daysToKeep = req.query.days ? parseInt(req.query.days, 10) : 365;
    const deleted = await auditLogService.deleteOldAuditLogs(daysToKeep);

    res.json({
      success: true,
      message: `Deleted ${deleted} audit logs older than ${daysToKeep} days`,
      deleted,
    });
  } catch (error) {
    logger.error('Error cleaning up audit logs:', error.message);
    next(error);
  }
};

module.exports = {
  getAuditLogs,
  getByUser,
  getByEntity,
  getRecent,
  getById,
  getStats,
  cleanupOldLogs,
};