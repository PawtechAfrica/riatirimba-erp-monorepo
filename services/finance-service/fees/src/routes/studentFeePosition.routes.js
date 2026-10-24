
const express = require('express');
const router = express.Router();
const studentFeePositionController = require('../controllers/studentFeePosition.controller');

/**
 * @route GET /api/students/fee-position
 * @desc Get complete fee position by registration number
 * @query regNo - Registration number (required)
 * @query studentYear - Year (optional)
 * @access Student, Finance, Admin
 */
router.get('/fee-position', studentFeePositionController.getFeePosition);

/**
 * @route GET /api/students/summary
 * @desc Get fee position summary by registration number
 * @query regNo - Registration number (required)
 * @access Student, Finance, Admin
 */
router.get('/summary', studentFeePositionController.getFeeSummary);

/**
 * @route GET /api/students/fee-position/:regNo (deprecated - kept for compatibility)
 * @desc Get fee position by registration number in path
 * @access Student, Finance, Admin
 */
router.get('/fee-position/:regNo', studentFeePositionController.getFeePosition);

/**
 * @route GET /api/students/summary/:regNo (deprecated - kept for compatibility)
 * @desc Get fee summary by registration number in path
 * @access Student, Finance, Admin
 */
router.get('/summary/:regNo', studentFeePositionController.getFeeSummary);

/**
 * @route GET /api/reports/outstanding
 * @desc Get outstanding balances for all students
 * @access Finance, Admin
 */
router.get('/reports/outstanding', studentFeePositionController.getOutstandingBalances);

module.exports = router;