const { Op } = require('sequelize');
const { VoteHead } = require('../database/models');
const { logger } = require('../utils/logger');
const { logAction } = require('../middlewares/audit.middleware');

/**
 * Get all vote heads with optional filters
 */
const getAllVoteHeads = async (filters = {}) => {
  const whereClause = {};

  if (filters.isOneTime !== undefined) {
    whereClause.is_one_time = filters.isOneTime === 'true' || filters.isOneTime === true;
  }
  if (filters.isRefundable !== undefined) {
    whereClause.is_refundable = filters.isRefundable === 'true' || filters.isRefundable === true;
  }
  if (filters.isActive !== undefined) {
    whereClause.is_active = filters.isActive === 'true' || filters.isActive === true;
  }
  if (filters.name) {
    whereClause.name = { [Op.iLike]: `%${filters.name}%` };
  }
  if (filters.priorityOrder) {
    whereClause.priority_order = parseInt(filters.priorityOrder, 10);
  }

  return await VoteHead.findAll({
    where: whereClause,
    order: [['priority_order', 'ASC']],
  });
};

/**
 * Get a single vote head by ID
 */
const getVoteHeadById = async (id) => {
  const voteHead = await VoteHead.findByPk(id);

  if (!voteHead) {
    throw new Error(`Vote head ${id} not found`);
  }

  return voteHead;
};

/**
 * Get a single vote head by name
 */
const getVoteHeadByName = async (name) => {
  const voteHead = await VoteHead.findOne({
    where: { name: { [Op.iLike]: name } },
  });

  return voteHead;
};

/**
 * Create a new vote head with audit log
 */
const createVoteHead = async (data) => {
  // Check if ID already exists
  const existing = await VoteHead.findByPk(data.id);
  if (existing) {
    throw new Error(`Vote head with ID ${data.id} already exists`);
  }

  // Check if name already exists
  const existingName = await getVoteHeadByName(data.name);
  if (existingName) {
    throw new Error(`Vote head with name "${data.name}" already exists`);
  }

  // Check if priority order already exists
  const existingPriority = await VoteHead.findOne({
    where: { priority_order: data.priority_order },
  });
  if (existingPriority) {
    throw new Error(`Priority order ${data.priority_order} is already taken`);
  }

  const voteHead = await VoteHead.create({
    id: data.id,
    name: data.name,
    description: data.description || null,
    is_one_time: data.is_one_time || false,
    is_refundable: data.is_refundable || false,
    priority_order: data.priority_order,
    is_active: data.is_active !== undefined ? data.is_active : true,
  });

  // ✅ CREATE AUDIT LOG
  await logAction({
    userId: data.createdBy || 'SYSTEM',
    action: 'CREATE',
    entityType: 'VoteHead',
    entityId: voteHead.id,
    oldValue: null,
    newValue: voteHead.toJSON(),
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
  });

  logger.info(`Vote head created: ${voteHead.id} - ${voteHead.name}`);

  return voteHead;
};

/**
 * Update a vote head with audit log
 */
const updateVoteHead = async (id, data) => {
  const voteHead = await getVoteHeadById(id);
  
  // Store old value for audit
  const oldValue = voteHead.toJSON();

  // If updating name, check uniqueness
  if (data.name && data.name !== voteHead.name) {
    const existingName = await getVoteHeadByName(data.name);
    if (existingName && existingName.id !== id) {
      throw new Error(`Vote head with name "${data.name}" already exists`);
    }
  }

  // If updating priority order, check uniqueness
  if (data.priority_order && data.priority_order !== voteHead.priority_order) {
    const existingPriority = await VoteHead.findOne({
      where: { priority_order: data.priority_order, id: { [Op.ne]: id } },
    });
    if (existingPriority) {
      throw new Error(`Priority order ${data.priority_order} is already taken`);
    }
  }

  await voteHead.update({
    name: data.name || voteHead.name,
    description: data.description !== undefined ? data.description : voteHead.description,
    is_one_time: data.is_one_time !== undefined ? data.is_one_time : voteHead.is_one_time,
    is_refundable: data.is_refundable !== undefined ? data.is_refundable : voteHead.is_refundable,
    priority_order: data.priority_order || voteHead.priority_order,
    is_active: data.is_active !== undefined ? data.is_active : voteHead.is_active,
  });

  // ✅ CREATE AUDIT LOG
  await logAction({
    userId: data.updatedBy || 'SYSTEM',
    action: 'UPDATE',
    entityType: 'VoteHead',
    entityId: voteHead.id,
    oldValue: oldValue,
    newValue: voteHead.toJSON(),
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
  });

  logger.info(`Vote head updated: ${voteHead.id} - ${voteHead.name}`);

  return voteHead;
};

/**
 * Delete a vote head with audit log
 */
const deleteVoteHead = async (id, data = {}) => {
  const voteHead = await getVoteHeadById(id);

  // Check if vote head is being used in any fee structures
  const { FeeStructureLine } = require('../database/models');
  const usageCount = await FeeStructureLine.count({
    where: { vote_head_id: id },
  });

  if (usageCount > 0) {
    throw new Error(
      `Cannot delete vote head ${id} because it is used in ${usageCount} fee structure(s). ` +
      `Set is_active to false instead.`
    );
  }

  const oldValue = voteHead.toJSON();
  await voteHead.destroy();

  // ✅ CREATE AUDIT LOG
  await logAction({
    userId: data.deletedBy || 'SYSTEM',
    action: 'DELETE',
    entityType: 'VoteHead',
    entityId: id,
    oldValue: oldValue,
    newValue: null,
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
  });

  logger.info(`Vote head deleted: ${voteHead.id} - ${voteHead.name}`);

  return voteHead;
};

/**
 * Toggle vote head active status with audit log
 */
const toggleActive = async (id, data = {}) => {
  const voteHead = await getVoteHeadById(id);
  const newStatus = !voteHead.is_active;
  
  const oldValue = voteHead.toJSON();

  await voteHead.update({ is_active: newStatus });

  // ✅ CREATE AUDIT LOG
  await logAction({
    userId: data.toggledBy || 'SYSTEM',
    action: 'TOGGLE',
    entityType: 'VoteHead',
    entityId: voteHead.id,
    oldValue: oldValue,
    newValue: voteHead.toJSON(),
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
  });

  logger.info(`Vote head ${voteHead.id} status changed to ${newStatus ? 'active' : 'inactive'}`);

  return voteHead;
};

/**
 * Get one-time charges (for new students)
 */
const getOneTimeCharges = async () => {
  return await VoteHead.findAll({
    where: { is_one_time: true, is_active: true },
    order: [['priority_order', 'ASC']],
  });
};

/**
 * Get recurring charges (per term)
 */
const getRecurringCharges = async () => {
  return await VoteHead.findAll({
    where: { is_one_time: false, is_active: true },
    order: [['priority_order', 'ASC']],
  });
};

/**
 * Bulk create vote heads with audit log
 */
const bulkCreateVoteHeads = async (voteHeadsData, metadata = {}) => {
  const results = [];
  for (const data of voteHeadsData) {
    try {
      const result = await createVoteHead({
        ...data,
        createdBy: metadata.createdBy || 'SYSTEM',
        ipAddress: metadata.ipAddress || null,
        userAgent: metadata.userAgent || null,
      });
      results.push(result);
    } catch (error) {
      logger.error(`Failed to create vote head ${data.id}:`, error.message);
      throw error;
    }
  }
  return results;
};

module.exports = {
  getAllVoteHeads,
  getVoteHeadById,
  getVoteHeadByName,
  createVoteHead,
  updateVoteHead,
  deleteVoteHead,
  toggleActive,
  getOneTimeCharges,
  getRecurringCharges,
  bulkCreateVoteHeads,
};