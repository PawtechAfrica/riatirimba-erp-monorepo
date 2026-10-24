const express = require('express');
const router = express.Router();
const voteHeadController = require('../controllers/voteHead.controller');
const { validate } = require('../validators');
const {
  createVoteHeadSchema,
  updateVoteHeadSchema,
} = require('../validators/voteHead.validator');

/**
 * @route GET /api/vote-heads
 * @desc Get all vote heads with optional filters
 * @access Admin, Finance
 */
router.get('/', voteHeadController.getAll);

/**
 * @route GET /api/vote-heads/one-time
 * @desc Get one-time charges only
 * @access Admin, Finance
 */
router.get('/one-time', voteHeadController.getOneTime);

/**
 * @route GET /api/vote-heads/recurring
 * @desc Get recurring charges only
 * @access Admin, Finance
 */
router.get('/recurring', voteHeadController.getRecurring);

/**
 * @route GET /api/vote-heads/:id
 * @desc Get a single vote head by ID
 * @access Admin, Finance
 */
router.get('/:id', voteHeadController.getById);

/**
 * @route POST /api/vote-heads
 * @desc Create a new vote head
 * @access Admin only
 */
router.post(
  '/',
  validate(createVoteHeadSchema),
  voteHeadController.create
);

/**
 * @route PUT /api/vote-heads/:id
 * @desc Update a vote head
 * @access Admin only
 */
router.put(
  '/:id',
  validate(updateVoteHeadSchema),
  voteHeadController.update
);

/**
 * @route DELETE /api/vote-heads/:id
 * @desc Delete a vote head (only if not in use)
 * @access Admin only
 */
router.delete('/:id', voteHeadController.remove);

/**
 * @route PATCH /api/vote-heads/:id/toggle
 * @desc Toggle vote head active status
 * @access Admin only
 */
router.patch('/:id/toggle', voteHeadController.toggleActive);

module.exports = router;