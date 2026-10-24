const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/models');
const { logger } = require('../utils/logger');
const { logAction } = require('../middlewares/audit.middleware');

const { FeeStructure, FeeStructureLine, VoteHead, Department, Programme } = db;

/**
 * Generate a unique ID for fee structure
 */
const generateId = () => `FS-${Date.now()}-${uuidv4().slice(0, 8)}`;

/**
 * Generate a unique ID for fee structure line
 */
const generateLineId = () => `FSL-${Date.now()}-${uuidv4().slice(0, 8)}`;

/**
 * Create a new fee structure with its lines
 */
const createFeeStructure = async (data) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Validate that the total amount matches sum of lines
    const linesTotal = data.lines.reduce((sum, line) => sum + line.amount, 0);
    if (Math.abs(linesTotal - data.total_amount) > 0.01) {
      throw new Error(`Total amount (${data.total_amount}) does not match sum of lines (${linesTotal})`);
    }

    // Validate vote heads exist
    const voteHeadIds = data.lines.map(line => line.vote_head_id);
    const voteHeads = await VoteHead.findAll({
      where: { id: { [Op.in]: voteHeadIds }, is_active: true },
      transaction,
    });

    if (voteHeads.length !== voteHeadIds.length) {
      const foundIds = voteHeads.map(vh => vh.id);
      const missingIds = voteHeadIds.filter(id => !foundIds.includes(id));
      throw new Error(`Invalid vote head IDs: ${missingIds.join(', ')}`);
    }

    // Check for overlapping active structures
    const existing = await FeeStructure.findOne({
      where: {
        term_number: data.term_number,
        scope_type: data.scope_type,
        scope_id: data.scope_id || null,
        student_category: data.student_category || null,
        [Op.or]: [
          { valid_to: null },
          { valid_to: { [Op.gte]: data.valid_from } },
        ],
        is_active: true,
      },
      transaction,
    });

    if (existing) {
      throw new Error(
        `An active fee structure already exists for term ${data.term_number}, ` +
        `scope ${data.scope_type}/${data.scope_id || 'college'}, ` +
        `category ${data.student_category || 'all'}`
      );
    }

    // Create fee structure
    const feeStructure = await FeeStructure.create({
      id: generateId(),
      version_label: data.version_label,
      term_number: data.term_number,
      scope_type: data.scope_type,
      scope_id: data.scope_id || null,
      student_category: data.student_category || null,
      valid_from: data.valid_from,
      valid_to: data.valid_to || null,
      total_amount: data.total_amount,
      is_active: true,
      created_by: data.created_by,
    }, { transaction });

    // Create fee structure lines
    const lines = await Promise.all(
      data.lines.map(line =>
        FeeStructureLine.create({
          id: generateLineId(),
          fee_structure_id: feeStructure.id,
          vote_head_id: line.vote_head_id,
          amount: line.amount,
          priority_order: line.priority_order,
        }, { transaction })
      )
    );

    await transaction.commit();

    // ✅ CREATE AUDIT LOG
    await logAction({
      userId: data.created_by || 'SYSTEM',
      action: 'CREATE',
      entityType: 'FeeStructure',
      entityId: feeStructure.id,
      oldValue: null,
      newValue: feeStructure.toJSON(),
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
    });

    logger.info(`Fee structure created: ${feeStructure.id}`, {
      term_number: feeStructure.term_number,
      scope_type: feeStructure.scope_type,
      scope_id: feeStructure.scope_id,
      total_amount: feeStructure.total_amount,
    });

    return {
      ...feeStructure.toJSON(),
      lines,
    };
  } catch (error) {
    await transaction.rollback();
    logger.error('Failed to create fee structure:', error.message);
    throw error;
  }
};

/**
 * Resolve the appropriate fee structure for a student enrollment
 * Implements the cascade: programme → department → college
 * Uses programmeCode and departmentId (both optional)
 */
const resolveFeeStructure = async ({ termNumber, enrollmentDate, programmeCode, departmentId, studentCategory }) => {
  // Build scopes in order of precedence
  const scopes = [];

  // 1. Programme-specific scope (if programmeCode provided)
  if (programmeCode) {
    scopes.push({ type: 'programme', id: programmeCode });
  }

  // 2. Department-specific scope (if departmentId provided)
  if (departmentId) {
    scopes.push({ type: 'department', id: departmentId });
  }

  // 3. College-wide scope (always fallback)
  scopes.push({ type: 'college', id: null });

  // Build the resolution query
  const whereClause = {
    term_number: termNumber,
    valid_from: { [Op.lte]: enrollmentDate },
    [Op.or]: [
      { valid_to: { [Op.gte]: enrollmentDate } },
      { valid_to: null },
    ],
    is_active: true,
  };

  // Try each scope in order
  for (const scope of scopes) {
    const scopeWhere = {
      ...whereClause,
      scope_type: scope.type,
      scope_id: scope.id,
    };

    // Try exact student category match first
    if (studentCategory) {
      const categoryMatch = await FeeStructure.findOne({
        where: {
          ...scopeWhere,
          student_category: studentCategory,
        },
        order: [['valid_from', 'DESC']],
        include: [{
          model: FeeStructureLine,
          as: 'lines',
          include: [{
            model: VoteHead,
            as: 'voteHead',
          }],
        }],
      });

      if (categoryMatch) {
        logger.info(`Fee structure resolved: ${categoryMatch.id}`, {
          scope: scope.type,
          termNumber,
          studentCategory,
        });
        return categoryMatch;
      }
    }

    // Try null category (applies to all)
    const categoryNullMatch = await FeeStructure.findOne({
      where: {
        ...scopeWhere,
        student_category: null,
      },
      order: [['valid_from', 'DESC']],
      include: [{
        model: FeeStructureLine,
        as: 'lines',
        include: [{
          model: VoteHead,
          as: 'voteHead',
        }],
      }],
    });

    if (categoryNullMatch) {
      logger.info(`Fee structure resolved: ${categoryNullMatch.id}`, {
        scope: scope.type,
        termNumber,
        studentCategory: 'all',
      });
      return categoryNullMatch;
    }
  }

  // No fee structure found
  logger.warn('No fee structure found', {
    termNumber,
    enrollmentDate,
    programmeCode,
    departmentId,
    studentCategory,
  });

  return null;
};

/**
 * Close a fee structure version (set valid_to)
 */
const closeVersion = async (id, { validTo, closedBy, ipAddress, userAgent }) => {
  const feeStructure = await FeeStructure.findByPk(id);

  if (!feeStructure) {
    throw new Error(`Fee structure ${id} not found`);
  }

  if (!feeStructure.is_active) {
    throw new Error(`Fee structure ${id} is already inactive`);
  }

  if (feeStructure.valid_to && feeStructure.valid_to < new Date().toISOString().split('T')[0]) {
    throw new Error(`Fee structure ${id} is already expired`);
  }

  const oldValue = feeStructure.toJSON();

  feeStructure.valid_to = validTo;
  feeStructure.is_active = false;
  await feeStructure.save();

  // ✅ CREATE AUDIT LOG
  await logAction({
    userId: closedBy || 'SYSTEM',
    action: 'CLOSE',
    entityType: 'FeeStructure',
    entityId: feeStructure.id,
    oldValue: oldValue,
    newValue: feeStructure.toJSON(),
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });

  logger.info(`Fee structure closed: ${id}`, {
    validTo,
    closedBy,
  });

  return feeStructure;
};

/**
 * Get active fee structures for a specific term
 */
const getActiveStructuresForTerm = async (termNumber, date) => {
  const whereClause = {
    term_number: termNumber,
    is_active: true,
    valid_from: { [Op.lte]: date },
    [Op.or]: [
      { valid_to: { [Op.gte]: date } },
      { valid_to: null },
    ],
  };

  return await FeeStructure.findAll({
    where: whereClause,
    include: [{
      model: FeeStructureLine,
      as: 'lines',
      include: [{
        model: VoteHead,
        as: 'voteHead',
      }],
      order: [['priority_order', 'ASC']],
    }],
    order: [
      ['scope_type', 'ASC'],
      ['valid_from', 'DESC'],
    ],
  });
};

/**
 * Get all fee structures with optional filters
 */
const getAllFeeStructures = async (filters = {}) => {
  const whereClause = {};

  if (filters.termNumber) {
    whereClause.term_number = filters.termNumber;
  }
  if (filters.scopeType) {
    whereClause.scope_type = filters.scopeType;
  }
  if (filters.scopeId) {
    whereClause.scope_id = filters.scopeId;
  }
  if (filters.isActive !== undefined) {
    whereClause.is_active = filters.isActive;
  }
  if (filters.versionLabel) {
    whereClause.version_label = { [Op.iLike]: `%${filters.versionLabel}%` };
  }

  return await FeeStructure.findAll({
    where: whereClause,
    include: [{
      model: FeeStructureLine,
      as: 'lines',
      include: [{
        model: VoteHead,
        as: 'voteHead',
      }],
      order: [['priority_order', 'ASC']],
    }],
    order: [
      ['valid_from', 'DESC'],
      ['term_number', 'ASC'],
    ],
  });
};

/**
 * Get a single fee structure by ID
 */
const getFeeStructureById = async (id) => {
  const feeStructure = await FeeStructure.findByPk(id, {
    include: [{
      model: FeeStructureLine,
      as: 'lines',
      include: [{
        model: VoteHead,
        as: 'voteHead',
      }],
      order: [['priority_order', 'ASC']],
    }],
  });

  if (!feeStructure) {
    throw new Error(`Fee structure ${id} not found`);
  }

  return feeStructure;
};

/**
 * Copy a fee structure version (for creating new versions)
 */
const copyVersion = async (sourceId, { newValidFrom, versionLabel, createdBy, ipAddress, userAgent }) => {
  const source = await getFeeStructureById(sourceId);

  if (!source) {
    throw new Error(`Source fee structure ${sourceId} not found`);
  }

  // Create new structure with same data but new dates
  const newData = {
    version_label: versionLabel || `${source.version_label} (Copy)`,
    term_number: source.term_number,
    scope_type: source.scope_type,
    scope_id: source.scope_id,
    student_category: source.student_category,
    valid_from: newValidFrom,
    valid_to: null,
    total_amount: source.total_amount,
    created_by: createdBy,
    ipAddress: ipAddress,
    userAgent: userAgent,
    lines: source.lines.map(line => ({
      vote_head_id: line.vote_head_id,
      amount: parseFloat(line.amount),
      priority_order: line.priority_order,
    })),
  };

  const result = await createFeeStructure(newData);

  // ✅ CREATE AUDIT LOG FOR COPY
  await logAction({
    userId: createdBy || 'SYSTEM',
    action: 'COPY',
    entityType: 'FeeStructure',
    entityId: result.id,
    oldValue: null,
    newValue: { sourceId: sourceId, ...result },
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  });

  return result;
};

/**
 * Validate that the total amount matches sum of lines
 */
const validateTotal = (feeStructure) => {
  const linesTotal = feeStructure.lines.reduce((sum, line) => sum + parseFloat(line.amount), 0);
  const total = parseFloat(feeStructure.total_amount);
  return Math.abs(linesTotal - total) < 0.01;
};

/**
 * Get fee structures by scope
 */
const getByScope = async (scopeType, scopeId, termNumber) => {
  const whereClause = {
    scope_type: scopeType,
    is_active: true,
  };

  if (scopeId) {
    whereClause.scope_id = scopeId;
  }

  if (termNumber) {
    whereClause.term_number = termNumber;
  }

  return await FeeStructure.findAll({
    where: whereClause,
    include: [{
      model: FeeStructureLine,
      as: 'lines',
      include: [{
        model: VoteHead,
        as: 'voteHead',
      }],
      order: [['priority_order', 'ASC']],
    }],
    order: [['valid_from', 'DESC']],
  });
};

/**
 * Bulk create fee structures (for multiple terms at once)
 */
const bulkCreate = async (structuresData) => {
  const results = [];
  for (const data of structuresData) {
    const result = await createFeeStructure(data);
    results.push(result);
  }
  return results;
};

/**
 * Update a fee structure (metadata only, not lines)
 * Lines must be managed separately
 */
const updateFeeStructure = async (id, data) => {
  const feeStructure = await FeeStructure.findByPk(id);

  if (!feeStructure) {
    throw new Error(`Fee structure ${id} not found`);
  }

  const oldValue = feeStructure.toJSON();

  // Check if trying to update term/scope that would cause overlap
  if (data.term_number || data.scope_type || data.scope_id || data.student_category) {
    const existing = await FeeStructure.findOne({
      where: {
        term_number: data.term_number || feeStructure.term_number,
        scope_type: data.scope_type || feeStructure.scope_type,
        scope_id: data.scope_id !== undefined ? data.scope_id : feeStructure.scope_id,
        student_category: data.student_category !== undefined ? data.student_category : feeStructure.student_category,
        valid_from: { [Op.lte]: data.valid_from || feeStructure.valid_from },
        [Op.or]: [
          { valid_to: null },
          { valid_to: { [Op.gte]: data.valid_from || feeStructure.valid_from } },
        ],
        is_active: true,
        id: { [Op.ne]: id }, // Exclude current record
      },
    });

    if (existing) {
      throw new Error('Another active fee structure exists with these parameters');
    }
  }

  await feeStructure.update({
    version_label: data.version_label || feeStructure.version_label,
    term_number: data.term_number || feeStructure.term_number,
    scope_type: data.scope_type || feeStructure.scope_type,
    scope_id: data.scope_id !== undefined ? data.scope_id : feeStructure.scope_id,
    student_category: data.student_category !== undefined ? data.student_category : feeStructure.student_category,
    valid_from: data.valid_from || feeStructure.valid_from,
    valid_to: data.valid_to !== undefined ? data.valid_to : feeStructure.valid_to,
    total_amount: data.total_amount || feeStructure.total_amount,
    is_active: data.is_active !== undefined ? data.is_active : feeStructure.is_active,
    created_by: data.created_by || feeStructure.created_by,
  });

  // ✅ CREATE AUDIT LOG
  await logAction({
    userId: data.updatedBy || 'SYSTEM',
    action: 'UPDATE',
    entityType: 'FeeStructure',
    entityId: feeStructure.id,
    oldValue: oldValue,
    newValue: feeStructure.toJSON(),
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
  });

  logger.info(`Fee structure updated: ${feeStructure.id}`);

  return feeStructure;
};

/**
 * Delete a fee structure (hard delete - only if no enrollments)
 */
const deleteFeeStructure = async (id, data = {}) => {
  const feeStructure = await FeeStructure.findByPk(id, {
    include: [
      {
        model: StudentTermEnrollment,
        as: 'enrollments',
      },
    ],
  });

  if (!feeStructure) {
    throw new Error(`Fee structure ${id} not found`);
  }

  // Check if it has enrollments
  if (feeStructure.enrollments && feeStructure.enrollments.length > 0) {
    throw new Error(
      `Cannot delete fee structure ${id} because it has ${feeStructure.enrollments.length} enrollment(s). ` +
      `Use closeVersion instead to prevent future use.`
    );
  }

  const oldValue = feeStructure.toJSON();

  // Delete associated lines first
  await FeeStructureLine.destroy({
    where: { fee_structure_id: id },
  });

  // Delete the structure
  await feeStructure.destroy();

  // ✅ CREATE AUDIT LOG
  await logAction({
    userId: data.deletedBy || 'SYSTEM',
    action: 'DELETE',
    entityType: 'FeeStructure',
    entityId: id,
    oldValue: oldValue,
    newValue: null,
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
  });

  logger.info(`Fee structure deleted: ${id}`);

  return feeStructure;
};

/**
 * Get all versions with history
 */
const getAllVersions = async () => {
  const structures = await FeeStructure.findAll({
    include: [
      {
        model: FeeStructureLine,
        as: 'lines',
        include: [
          {
            model: VoteHead,
            as: 'voteHead',
          },
        ],
        order: [['priority_order', 'ASC']],
      },
    ],
    order: [
      ['version_label', 'ASC'],
      ['valid_from', 'DESC'],
      ['term_number', 'ASC'],
    ],
  });

  // Group by version_label
  const versions = {};
  for (const structure of structures) {
    const label = structure.version_label;
    if (!versions[label]) {
      versions[label] = {
        versionLabel: label,
        structures: [],
        validFrom: structure.valid_from,
        validTo: structure.valid_to,
        isActive: structure.is_active,
      };
    }
    versions[label].structures.push(structure);
  }

  return Object.values(versions);
};

/**
 * Bulk create fee structures (all 3 terms at once)
 */
const bulkCreateFeeStructures = async (data) => {
  const { version_label, valid_from, valid_to, created_by, terms } = data;

  const results = [];
  for (const term of terms) {
    const result = await createFeeStructure({
      version_label: version_label,
      term_number: term.term_number,
      scope_type: term.scope_type || 'college',
      scope_id: term.scope_id || null,
      student_category: term.student_category || null,
      valid_from: valid_from,
      valid_to: valid_to || null,
      total_amount: term.total_amount,
      created_by: created_by,
      lines: term.lines,
    });
    results.push(result);
  }

  return results;
};

/**
 * Get fee structures by version label
 */
const getByVersion = async (versionLabel) => {
  return await FeeStructure.findAll({
    where: { version_label: versionLabel },
    include: [
      {
        model: FeeStructureLine,
        as: 'lines',
        include: [
          {
            model: VoteHead,
            as: 'voteHead',
          },
        ],
        order: [['priority_order', 'ASC']],
      },
    ],
    order: [['term_number', 'ASC']],
  });
};

module.exports = {
  createFeeStructure,
  resolveFeeStructure,
  closeVersion,
  getActiveStructuresForTerm,
  getAllFeeStructures,
  getFeeStructureById,
  copyVersion,
  validateTotal,
  getByScope,
  bulkCreate,
  generateId,
  generateLineId,
  updateFeeStructure,
  deleteFeeStructure,
  getAllVersions,
  bulkCreateFeeStructures,
  getByVersion
};