const { Op } = require('sequelize');
const db = require('../database/models');
const { logger } = require('../utils/logger');

const { AuditLog } = db;

/**
 * Generate a unique ID for audit log
 */
const generateAuditLogId = () => {
  return `AUD-${Date.now().toString(36)}`.slice(0, 20);
};

/**
 * Create an audit log entry
 */
const createAuditLog = async (data) => {
  try {
    const {
      userId,
      action,
      entityType,
      entityId,
      oldValue = null,
      newValue = null,
      ipAddress = null,
      userAgent = null,
    } = data;

    const auditLog = await AuditLog.create({
      id: generateAuditLogId(),
      user_id: userId || 'SYSTEM',
      action: action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    logger.info(`Audit log created: ${auditLog.id} - ${action} on ${entityType} (${entityId})`);
    return auditLog;
  } catch (error) {
    logger.error('Error creating audit log:', error.message);
    throw error;
  }
};

/**
 * Get audit logs with filters
 */
const getAuditLogs = async (filters = {}) => {
  const whereClause = {};

  if (filters.userId) {
    whereClause.user_id = filters.userId;
  }
  if (filters.entityType) {
    whereClause.entity_type = filters.entityType;
  }
  if (filters.entityId) {
    whereClause.entity_id = filters.entityId;
  }
  if (filters.action) {
    whereClause.action = filters.action;
  }
  if (filters.search) {
    whereClause[Op.or] = [
      { user_id: { [Op.iLike]: `%${filters.search}%` } },
      { action: { [Op.iLike]: `%${filters.search}%` } },
      { entity_type: { [Op.iLike]: `%${filters.search}%` } },
      { entity_id: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }
  if (filters.startDate && filters.endDate) {
    whereClause.created_at = {
      [Op.between]: [filters.startDate, filters.endDate],
    };
  } else if (filters.startDate) {
    whereClause.created_at = {
      [Op.gte]: filters.startDate,
    };
  } else if (filters.endDate) {
    whereClause.created_at = {
      [Op.lte]: filters.endDate,
    };
  }

  const limit = filters.limit ? parseInt(filters.limit, 10) : 100;
  const offset = filters.offset ? parseInt(filters.offset, 10) : 0;

  const { count, rows } = await AuditLog.findAndCountAll({
    where: whereClause,
    order: [['created_at', 'DESC']],
    limit: limit,
    offset: offset,
  });

  return {
    total: count,
    limit: limit,
    offset: offset,
    data: rows,
  };
};

/**
 * Get audit logs by user
 */
const getAuditLogsByUser = async (userId, filters = {}) => {
  return await getAuditLogs({ ...filters, userId });
};

/**
 * Get audit logs by entity
 */
const getAuditLogsByEntity = async (entityType, entityId, filters = {}) => {
  return await getAuditLogs({ ...filters, entityType, entityId });
};

/**
 * Get recent audit logs
 */
const getRecentAuditLogs = async (limit = 50) => {
  return await getAuditLogs({ limit });
};

/**
 * Get audit log by ID
 */
const getAuditLogById = async (id) => {
  const auditLog = await AuditLog.findByPk(id);
  if (!auditLog) {
    throw new Error(`Audit log ${id} not found`);
  }
  return auditLog;
};

/**
 * Delete old audit logs (for retention policy)
 */
const deleteOldAuditLogs = async (daysToKeep = 365) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const deleted = await AuditLog.destroy({
    where: {
      created_at: {
        [Op.lt]: cutoffDate,
      },
    },
  });

  logger.info(`Deleted ${deleted} audit logs older than ${daysToKeep} days`);
  return deleted;
};

/**
 * Get audit log statistics
 */
const getAuditLogStats = async () => {
  const total = await AuditLog.count();
  
  const byAction = await AuditLog.findAll({
    attributes: [
      'action',
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
    ],
    group: ['action'],
    order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']],
  });

  const byEntity = await AuditLog.findAll({
    attributes: [
      'entity_type',
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
    ],
    group: ['entity_type'],
    order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']],
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await AuditLog.count({
    where: {
      created_at: {
        [Op.gte]: today,
      },
    },
  });

  return {
    total,
    today: todayCount,
    byAction,
    byEntity,
  };
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByEntity,
  getRecentAuditLogs,
  getAuditLogById,
  deleteOldAuditLogs,
  getAuditLogStats,
};