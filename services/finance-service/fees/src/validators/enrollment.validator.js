const { z } = require('zod')

/**
 * Schema for enrollment event from Academics
 * Uses registration number as the primary identifier
 */
const enrollmentEventSchema = z.object({
  // Event metadata
  event: z.enum([
    'TERM_ADVANCED',
    'STUDENT_WITHDRAWN',
    'STUDENT_DEFERRED',
    'STUDENT_REINSTATED'
  ]),
  eventId: z.string().max(80).optional(),

  // Student identifiers - ONLY registration number is required
  studentRegNo: z.string().min(1).max(50), //  REQUIRED - Primary identifier
  studentName: z.string().max(100).optional(),

  // Programme
  programmeCode: z.string().min(1).max(50),

  // Academic position
  studentYear: z.number().int().positive(),
  studentTerm: z.number().int().min(1).max(3),

  // Enrollment details
  enrollmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  studentCategory: z
    .enum(['regular', 'kuccps', 'nita', 'employer', 'self_sponsored'])
    .default('regular'),
  isNewStudent: z.boolean().default(false),
  enrolledBy: z.string().min(1).max(50)
})

/**
 * Schema for updating enrollment status
 */
const updateEnrollmentStatusSchema = z.object({
  status: z.enum(['active', 'completed', 'withdrawn', 'deferred']),
  notes: z.string().optional()
})

module.exports = {
  enrollmentEventSchema,
  updateEnrollmentStatusSchema
}
