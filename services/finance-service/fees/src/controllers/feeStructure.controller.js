const feeStructureService = require('../services/feeStructure.service');
const { logger } = require('../utils/logger');

/**
 * Create a new fee structure
 * POST /api/fee-structures
 */
const create = async (req, res, next) => {
  try {
    const result = await feeStructureService.createFeeStructure(req.body);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Fee structure created successfully',
    });
  } catch (error) {
    logger.error('Error creating fee structure:', error.message);
    next(error);
  }
};

/**
 * Resolve fee structure for enrollment
 * POST /api/fee-structures/resolve
 */
const resolve = async (req, res, next) => {
  try {
    const { term_number, enrollment_date, programme_id, department_id, student_category } = req.body;

    const feeStructure = await feeStructureService.resolveFeeStructure({
      termNumber: term_number,
      enrollmentDate: enrollment_date,
      programmeId: programme_id,
      departmentId: department_id,
      studentCategory: student_category || null,
    });

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        error: `No active fee structure found for term ${term_number} on ${enrollment_date}`,
        code: 'FEE_STRUCTURE_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: feeStructure,
    });
  } catch (error) {
    logger.error('Error resolving fee structure:', error.message);
    next(error);
  }
};

/**
 * Get all fee structures
 * GET /api/fee-structures
 */
const getAll = async (req, res, next) => {
  try {
    const filters = {
      termNumber: req.query.term_number ? parseInt(req.query.term_number, 10) : undefined,
      scopeType: req.query.scope_type,
      scopeId: req.query.scope_id,
      isActive: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
      versionLabel: req.query.version_label,
    };

    const feeStructures = await feeStructureService.getAllFeeStructures(filters);

    res.json({
      success: true,
      data: feeStructures,
      count: feeStructures.length,
    });
  } catch (error) {
    logger.error('Error fetching fee structures:', error.message);
    next(error);
  }
};

/**
 * Get a single fee structure by ID
 * GET /api/fee-structures/:id
 */
const getById = async (req, res, next) => {
  try {
    const feeStructure = await feeStructureService.getFeeStructureById(req.params.id);

    res.json({
      success: true,
      data: feeStructure,
    });
  } catch (error) {
    logger.error('Error fetching fee structure:', error.message);
    next(error);
  }
};

/**
 * Close a fee structure version
 * PATCH /api/fee-structures/:id/close
 */
const closeVersion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { valid_to, closed_by } = req.body;

    const feeStructure = await feeStructureService.closeVersion(id, {
      validTo: valid_to,
      closedBy: closed_by || 'SYSTEM',
    });

    res.json({
      success: true,
      data: feeStructure,
      message: 'Fee structure closed successfully',
    });
  } catch (error) {
    logger.error('Error closing fee structure:', error.message);
    next(error);
  }
};

/**
 * Copy a fee structure version
 * POST /api/fee-structures/:id/copy
 */
const copyVersion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { new_valid_from, version_label, created_by } = req.body;

    const newFeeStructure = await feeStructureService.copyVersion(id, {
      newValidFrom: new_valid_from,
      versionLabel: version_label,
      createdBy: created_by,
    });

    res.status(201).json({
      success: true,
      data: newFeeStructure,
      message: 'Fee structure copied successfully',
    });
  } catch (error) {
    logger.error('Error copying fee structure:', error.message);
    next(error);
  }
};

/**
 * Get active structures for a term
 * GET /api/fee-structures/active?term_number=1&date=2026-09-05
 */
const getActiveForTerm = async (req, res, next) => {
  try {
    const { term_number, date } = req.query;

    if (!term_number || !date) {
      return res.status(400).json({
        success: false,
        error: 'term_number and date are required',
        code: 'MISSING_PARAMETERS',
      });
    }

    const structures = await feeStructureService.getActiveStructuresForTerm(
      parseInt(term_number, 10),
      date
    );

    res.json({
      success: true,
      data: structures,
      count: structures.length,
    });
  } catch (error) {
    logger.error('Error fetching active structures:', error.message);
    next(error);
  }
};

/**
 * Get fee structures by scope
 * GET /api/fee-structures/scope/:scope_type?scope_id=xxx&term_number=1
 */
const getByScope = async (req, res, next) => {
  try {
    const { scope_type } = req.params;
    const { scope_id, term_number } = req.query;

    const structures = await feeStructureService.getByScope(
      scope_type,
      scope_id || null,
      term_number ? parseInt(term_number, 10) : undefined
    );

    res.json({
      success: true,
      data: structures,
      count: structures.length,
    });
  } catch (error) {
    logger.error('Error fetching structures by scope:', error.message);
    next(error);
  }
};





/**
 * Update a fee structure
 * PUT /api/fee-structures/:id
 */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feeStructure = await feeStructureService.updateFeeStructure(id, req.body);

    res.json({
      success: true,
      data: feeStructure,
      message: 'Fee structure updated successfully',
    });
  } catch (error) {
    logger.error('Error updating fee structure:', error.message);
    next(error);
  }
};

/**
 * Delete a fee structure
 * DELETE /api/fee-structures/:id
 */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await feeStructureService.deleteFeeStructure(id);

    res.json({
      success: true,
      message: 'Fee structure deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting fee structure:', error.message);
    next(error);
  }
};

/**
 * Get all versions with history
 * GET /api/fee-structures/versions
 */
const getVersions = async (req, res, next) => {
  try {
    const versions = await feeStructureService.getAllVersions();

    res.json({
      success: true,
      data: versions,
      count: versions.length,
    });
  } catch (error) {
    logger.error('Error fetching versions:', error.message);
    next(error);
  }
};

/**
 * Bulk create fee structures
 * POST /api/fee-structures/bulk
 */
const bulkCreate = async (req, res, next) => {
  try {
    const results = await feeStructureService.bulkCreateFeeStructures(req.body);

    res.status(201).json({
      success: true,
      data: results,
      message: `${results.length} fee structures created successfully`,
    });
  } catch (error) {
    logger.error('Error bulk creating fee structures:', error.message);
    next(error);
  }
};

/**
 * Get fee structures by version label
 * GET /api/fee-structures/version/:versionLabel
 */
const getByVersion = async (req, res, next) => {
  try {
    const { versionLabel } = req.params;
    const structures = await feeStructureService.getByVersion(versionLabel);

    res.json({
      success: true,
      data: structures,
      count: structures.length,
    });
  } catch (error) {
    logger.error('Error fetching structures by version:', error.message);
    next(error);
  }
};




module.exports = {
  create,
  resolve,
  getAll,
  getById,
  closeVersion,
  copyVersion,
  getActiveForTerm,
  getByScope,
  update,
  remove,
  getVersions,
  bulkCreate,
  getByVersion

};