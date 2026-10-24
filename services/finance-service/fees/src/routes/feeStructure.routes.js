const express = require('express');
const router = express.Router();
const feeStructureController = require('../controllers/feeStructure.controller');
const { validate } = require('../validators');
const {
  createFeeStructureSchema,
  resolveFeeStructureSchema,
  closeVersionSchema,
  copyVersionSchema,
  updateFeeStructureSchema,
  bulkCreateFeeStructureSchema,
} = require('../validators/feeStructure.validator');

// STATIC ROUTES 

/**
 * @route GET /api/fee-structures/versions
 * @desc Get all versions with history
 * @access Admin, Finance
 */
router.get('/versions', feeStructureController.getVersions);

/**
 * @route GET /api/fee-structures/active
 * @desc Get active structures for a specific term and date
 * @access Admin, Finance
 */
router.get('/active', feeStructureController.getActiveForTerm);

/**
 * @route GET /api/fee-structures/scope/:scope_type
 * @desc Get structures by scope (college/department/programme)
 * @access Admin, Finance
 */
router.get('/scope/:scope_type', feeStructureController.getByScope);

/**
 * @route GET /api/fee-structures/version/:versionLabel
 * @desc Get fee structures by version label
 * @access Admin, Finance
 */
router.get('/version/:versionLabel', feeStructureController.getByVersion);

// =============================================
// POST ROUTES (bulk before single)
// =============================================

/**
 * @route POST /api/fee-structures/bulk
 * @desc Bulk create fee structures (all 3 terms)
 * @access Admin only
 */
router.post(
  '/bulk',
  validate(bulkCreateFeeStructureSchema),
  feeStructureController.bulkCreate
);

/**
 * @route POST /api/fee-structures
 * @desc Create a new fee structure with lines
 * @access Admin only
 */
router.post(
  '/',
  validate(createFeeStructureSchema),
  feeStructureController.create
);

/**
 * @route POST /api/fee-structures/resolve
 * @desc Resolve the appropriate fee structure for enrollment
 * @access Internal service
 */
router.post(
  '/resolve',
  validate(resolveFeeStructureSchema),
  feeStructureController.resolve
);

/**
 * @route POST /api/fee-structures/:id/copy
 * @desc Copy a fee structure version
 * @access Admin only
 */
router.post(
  '/:id/copy',
  validate(copyVersionSchema),
  feeStructureController.copyVersion
);


// GET ALL


/**
 * @route GET /api/fee-structures
 * @desc Get all fee structures with optional filters
 * @access Admin, Finance
 */
router.get('/', feeStructureController.getAll);


// DYNAMIC ROUTES 


/**
 * @route GET /api/fee-structures/:id
 * @desc Get a single fee structure by ID
 * @access Admin, Finance
 */
router.get('/:id', feeStructureController.getById);

/**
 * @route PUT /api/fee-structures/:id
 * @desc Update a fee structure (metadata only)
 * @access Admin only
 */
router.put(
  '/:id',
  validate(updateFeeStructureSchema),
  feeStructureController.update
);

/**
 * @route PATCH /api/fee-structures/:id/close
 * @desc Close a fee structure version
 * @access Admin only
 */
router.patch(
  '/:id/close',
  validate(closeVersionSchema),
  feeStructureController.closeVersion
);

/**
 * @route DELETE /api/fee-structures/:id
 * @desc Delete a fee structure (only if no enrollments)
 * @access Admin only
 */
router.delete('/:id', feeStructureController.remove);

module.exports = router;