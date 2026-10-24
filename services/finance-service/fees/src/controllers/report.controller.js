const reportService = require('../services/report.service');
const { logger } = require('../utils/logger');

/**
 * Get daily collection report
 * GET /api/reports/daily-collection?date=2026-09-04
 */
const getDailyCollection = async (req, res, next) => {
  try {
    const { date } = req.query;
    const report = await reportService.getDailyCollection(date);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error generating daily collection report:', error.message);
    next(error);
  }
};

/**
 * Get weekly collection summary
 * GET /api/reports/weekly-summary?weekStart=2026-09-01
 */
const getWeeklySummary = async (req, res, next) => {
  try {
    const { weekStart } = req.query;
    const report = await reportService.getWeeklySummary(weekStart);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error generating weekly summary:', error.message);
    next(error);
  }
};

/**
 * Get monthly collection summary
 * GET /api/reports/monthly-summary?year=2026&month=9
 */
const getMonthlySummary = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const report = await reportService.getMonthlySummary(
      year ? parseInt(year, 10) : undefined,
      month ? parseInt(month, 10) : undefined
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error generating monthly summary:', error.message);
    next(error);
  }
};

/**
 * Get programme-wise collection report
 * GET /api/reports/programme-collection?startDate=2026-09-01&endDate=2026-09-30
 */
const getProgrammeCollection = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await reportService.getProgrammeCollection(startDate, endDate);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error generating programme collection report:', error.message);
    next(error);
  }
};

/**
 * Get outstanding aging report
 * GET /api/reports/aging
 */
const getAgingReport = async (req, res, next) => {
  try {
    const report = await reportService.getAgingReport();

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error generating aging report:', error.message);
    next(error);
  }
};

/**
 * Get collection summary
 * GET /api/reports/collection-summary?startDate=2026-09-01&endDate=2026-09-30
 */
const getCollectionSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await reportService.getCollectionSummary(startDate, endDate);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error generating collection summary:', error.message);
    next(error);
  }
};

module.exports = {
  getDailyCollection,
  getWeeklySummary,
  getMonthlySummary,
  getProgrammeCollection,
  getAgingReport,
  getCollectionSummary,
};