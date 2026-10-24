const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/studentTermEnrollment.controller');
const { validate } = require('../validators');
const {
  enrollmentEventSchema,
  updateEnrollmentStatusSchema,
} = require('../validators/enrollment.validator');

/**
 * @route POST /api/enrollment-events
 * @desc Process enrollment event from Academics
 */
router.post('/', validate(enrollmentEventSchema), enrollmentController.processEvent);

/**
 * @route GET /api/enrollments
 * @desc Get enrollments by registration number
 * @query regNo - Registration number (required)
 */
router.get('/', enrollmentController.getByRegNo);

/**
 * @route GET /api/enrollments/:id
 * @desc Get enrollment by ID
 */
router.get('/:id', enrollmentController.getById);

/**
 * @route PATCH /api/enrollments/:id/status
 * @desc Update enrollment status
 */
router.patch('/:id/status', validate(updateEnrollmentStatusSchema), enrollmentController.updateStatus);

module.exports = router;