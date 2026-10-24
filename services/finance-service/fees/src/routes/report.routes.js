const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

/**
 * @route GET /api/reports/daily-collection
 * @desc Get daily collection report
 * @query date - Date in YYYY-MM-DD format (default: today)
 * @access Admin, Finance
 */
router.get('/daily-collection', reportController.getDailyCollection);

/**
 * @route GET /api/reports/weekly-summary
 * @desc Get weekly collection summary
 * @query weekStart - Date in YYYY-MM-DD format (default: current week Monday)
 * @access Admin, Finance
 */
router.get('/weekly-summary', reportController.getWeeklySummary);

/**
 * @route GET /api/reports/monthly-summary
 * @desc Get monthly collection summary
 * @query year - Year (default: current year)
 * @query month - Month (default: current month)
 * @access Admin, Finance
 */
router.get('/monthly-summary', reportController.getMonthlySummary);

/**
 * @route GET /api/reports/programme-collection
 * @desc Get programme-wise collection report
 * @query startDate - Start date in YYYY-MM-DD format
 * @query endDate - End date in YYYY-MM-DD format
 * @access Admin, Finance
 */
router.get('/programme-collection', reportController.getProgrammeCollection);

/**
 * @route GET /api/reports/aging
 * @desc Get outstanding aging report
 * @access Admin, Finance
 */
router.get('/aging', reportController.getAgingReport);

/**
 * @route GET /api/reports/collection-summary
 * @desc Get collection summary for a period
 * @query startDate - Start date in YYYY-MM-DD format
 * @query endDate - End date in YYYY-MM-DD format
 * @access Admin, Finance
 */
router.get('/collection-summary', reportController.getCollectionSummary);

// Add this to report.routes.js
const studentFeePositionController = require('../controllers/studentFeePosition.controller');

router.get('/outstanding', studentFeePositionController.getOutstandingBalances);

module.exports = router;