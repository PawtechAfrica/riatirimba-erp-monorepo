const studentFeePositionService = require("../services/studentFeePosition.service");
const { logger } = require("../utils/logger");
const { ApiError } = require("../middlewares/errorHandler");

/**
 * Get complete fee position for a student by registration number
 * GET /api/students/fee-position?regNo=2380AB/2023
 * or GET /api/students/fee-position/:regNo (deprecated)
 */
const getFeePosition = async (req, res, next) => {
  try {
    let regNo;
    let studentYear;

    // Support both query param and path param
    if (req.query.regNo) {
      regNo = req.query.regNo;
      studentYear = req.query.studentYear ? parseInt(req.query.studentYear, 10) : undefined;
    } else if (req.params.regNo) {
      regNo = req.params.regNo;
      studentYear = req.query.studentYear ? parseInt(req.query.studentYear, 10) : undefined;
    } else {
      throw new ApiError(400, 'Registration number (regNo) is required', 'MISSING_REG_NO');
    }

    // ✅ PASS THE ORIGINAL VALUE - DO NOT NORMALIZE HERE
    // The service will handle normalization
    console.log("Searching for regNo: ", regNo);

    const position = await studentFeePositionService.getStudentFeePosition(
      regNo,  // ← Pass original, not normalized
      studentYear
    );

    if (!position.found) {
      return res.status(404).json({
        success: false,
        error: `No enrollments found for student ${regNo}`,
        code: "STUDENT_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: position,
    });
  } catch (error) {
    logger.error("Error getting student fee position:", error.message);
    next(error);
  }
};

/**
 * Get fee position summary only (lightweight)
 * GET /api/students/summary?regNo=2380AB/2023
 * or GET /api/students/summary/:regNo (deprecated)
 */
const getFeeSummary = async (req, res, next) => {
  try {
    let regNo;

    // Support both query param and path param
    if (req.query.regNo) {
      regNo = req.query.regNo;
    } else if (req.params.regNo) {
      regNo = req.params.regNo;
    } else {
      throw new ApiError(400, 'Registration number (regNo) is required', 'MISSING_REG_NO');
    }

    // ✅ PASS THE ORIGINAL VALUE - DO NOT NORMALIZE HERE
    console.log("Summary for regNo: ", regNo);

    const summary = await studentFeePositionService.getStudentFeeSummary(regNo);

    if (!summary.found) {
      return res.status(404).json({
        success: false,
        error: `No enrollments found for student ${regNo}`,
        code: "STUDENT_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error("Error getting student fee summary:", error.message);
    next(error);
  }
};

/**
 * Get outstanding balances for all students
 * GET /api/reports/outstanding
 */
const getOutstandingBalances = async (req, res, next) => {
  try {
    const filters = {
      programmeCode: req.query.programme_code,
    };

    const results = await studentFeePositionService.getAllOutstandingBalances(filters);

    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    logger.error("Error getting outstanding balances:", error.message);
    next(error);
  }
};

module.exports = {
  getFeePosition,
  getFeeSummary,
  getOutstandingBalances,
};