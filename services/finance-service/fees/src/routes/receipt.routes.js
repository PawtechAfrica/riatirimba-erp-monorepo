const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');

/**
 * @route GET /api/receipts/:obligationId/pdf
 * @desc Generate receipt as PDF (downloadable)
 * @query type - 'student' (default) or 'sponsor'
 * @access Student, Finance, Admin
 */
router.get('/:obligationId/pdf', receiptController.getPDF);

/**
 * @route GET /api/receipts/:obligationId/json
 * @desc Generate receipt as JSON (for preview)
 * @access Student, Finance, Admin
 */
router.get('/:obligationId/json', receiptController.getJSON);

module.exports = router;