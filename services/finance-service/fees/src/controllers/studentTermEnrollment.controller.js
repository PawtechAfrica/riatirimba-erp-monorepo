const studentTermEnrollmentService = require('../services/studentTermEnrollment.service');
const { logger } = require('../utils/logger');
const { ApiError } = require('../middlewares/errorHandler');

/**
 * Process enrollment event from Academics
 * POST /api/enrollment-events
 */
const processEvent = async (req, res, next) => {
  try {
    console.log(req.body);
    const result = await studentTermEnrollmentService.processEnrollmentEvent(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        code: 'ENROLLMENT_PROCESSING_FAILED',
      });
    }

    // Check if already processed (idempotent)
    if (result.alreadyProcessed) {
      return res.status(200).json({
        success: true,
        data: result.data,
        message: 'Event already processed (idempotent)',
        alreadyProcessed: true,
      });
    }

    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Enrollment processed successfully',
    });
  } catch (error) {
    logger.error('Error processing enrollment event:', error.message);

    // Handle specific errors
    if (error.message.includes('No active fee structure found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'FEE_STRUCTURE_NOT_FOUND',
      });
    }

    if (error.message.includes('Programme') && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        code: 'PROGRAMME_NOT_FOUND',
      });
    }

    next(error);
  }
};

/**
 * Get enrollment by ID
 * GET /api/enrollments/:id
 */
const getById = async (req, res, next) => {
  try {
    const enrollment = await studentTermEnrollmentService.getEnrollmentById(req.params.id);

    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    logger.error('Error fetching enrollment:', error.message);
    next(error);
  }
};

/**
 * Get enrollments by registration number
 * GET /api/enrollments?regNo=2380AB/2023
 */
const getByRegNo = async (req, res, next) => {
  try {
    const { regNo } = req.query;

    if (!regNo) {
      throw new ApiError(400, 'regNo query parameter is required', 'MISSING_REG_NO');
    }

    const enrollments = await studentTermEnrollmentService.getEnrollmentsByRegNo(regNo);

    res.json({
      success: true,
      data: enrollments,
      count: enrollments.length,
    });
  } catch (error) {
    logger.error('Error fetching enrollments by regNo:', error.message);
    next(error);
  }
};

/**
 * Get enrollments by student ID (deprecated - kept for backward compatibility)
 * GET /api/enrollments/student/:studentId
 */
const getByStudent = async (req, res, next) => {
  try {
    const enrollments = await studentTermEnrollmentService.getEnrollmentsByStudent(req.params.studentId);

    res.json({
      success: true,
      data: enrollments,
      count: enrollments.length,
    });
  } catch (error) {
    logger.error('Error fetching student enrollments:', error.message);
    next(error);
  }
};

/**
 * Update enrollment status
 * PATCH /api/enrollments/:id/status
 */
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const enrollment = await studentTermEnrollmentService.updateEnrollmentStatus(id, status, notes);

    res.json({
      success: true,
      data: enrollment,
      message: `Enrollment status updated to ${status}`,
    });
  } catch (error) {
    logger.error('Error updating enrollment status:', error.message);
    next(error);
  }
};

module.exports = {
  processEvent,
  getById,
  getByRegNo,
  getByStudent,
  updateStatus,
};