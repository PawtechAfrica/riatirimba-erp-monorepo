const voteHeadService = require('../services/voteHead.service');
const { logger } = require('../utils/logger');

/**
 * Get all vote heads
 * GET /api/vote-heads
 */
const getAll = async (req, res, next) => {
  try {
    const filters = {
      isOneTime: req.query.is_one_time,
      isRefundable: req.query.is_refundable,
      isActive: req.query.is_active,
      name: req.query.name,
      priorityOrder: req.query.priority_order,
    };

    const voteHeads = await voteHeadService.getAllVoteHeads(filters);

    res.json({
      success: true,
      data: voteHeads,
      count: voteHeads.length,
    });
  } catch (error) {
    logger.error('Error fetching vote heads:', error.message);
    next(error);
  }
};

/**
 * Get a single vote head by ID
 * GET /api/vote-heads/:id
 */
const getById = async (req, res, next) => {
  try {
    const voteHead = await voteHeadService.getVoteHeadById(req.params.id);

    res.json({
      success: true,
      data: voteHead,
    });
  } catch (error) {
    logger.error('Error fetching vote head:', error.message);
    next(error);
  }
};

/**
 * Create a new vote head
 * POST /api/vote-heads
 */
const create = async (req, res, next) => {
  try {
    const voteHead = await voteHeadService.createVoteHead(req.body);

    res.status(201).json({
      success: true,
      data: voteHead,
      message: 'Vote head created successfully',
    });
  } catch (error) {
    logger.error('Error creating vote head:', error.message);
    next(error);
  }
};

/**
 * Update a vote head
 * PUT /api/vote-heads/:id
 */
const update = async (req, res, next) => {
  try {
    const voteHead = await voteHeadService.updateVoteHead(req.params.id, req.body);

    res.json({
      success: true,
      data: voteHead,
      message: 'Vote head updated successfully',
    });
  } catch (error) {
    logger.error('Error updating vote head:', error.message);
    next(error);
  }
};

/**
 * Delete a vote head (hard delete - only if not in use)
 * DELETE /api/vote-heads/:id
 */
const remove = async (req, res, next) => {
  try {
    await voteHeadService.deleteVoteHead(req.params.id);

    res.json({
      success: true,
      message: 'Vote head deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting vote head:', error.message);
    next(error);
  }
};

/**
 * Toggle vote head active status
 * PATCH /api/vote-heads/:id/toggle
 */
const toggleActive = async (req, res, next) => {
  try {
    const voteHead = await voteHeadService.toggleActive(req.params.id);

    res.json({
      success: true,
      data: voteHead,
      message: `Vote head ${voteHead.is_active ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    logger.error('Error toggling vote head:', error.message);
    next(error);
  }
};

/**
 * Get one-time charges only
 * GET /api/vote-heads/one-time
 */
const getOneTime = async (req, res, next) => {
  try {
    const voteHeads = await voteHeadService.getOneTimeCharges();

    res.json({
      success: true,
      data: voteHeads,
      count: voteHeads.length,
    });
  } catch (error) {
    logger.error('Error fetching one-time charges:', error.message);
    next(error);
  }
};

/**
 * Get recurring charges only
 * GET /api/vote-heads/recurring
 */
const getRecurring = async (req, res, next) => {
  try {
    const voteHeads = await voteHeadService.getRecurringCharges();

    res.json({
      success: true,
      data: voteHeads,
      count: voteHeads.length,
    });
  } catch (error) {
    logger.error('Error fetching recurring charges:', error.message);
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  toggleActive,
  getOneTime,
  getRecurring,
};