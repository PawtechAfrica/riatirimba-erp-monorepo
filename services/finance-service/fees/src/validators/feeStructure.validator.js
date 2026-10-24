const { z } = require('zod');

// Base schema for FeeStructure
const feeStructureBaseSchema = z.object({
  version_label: z.string().min(1).max(60),
  term_number: z.number().int().min(1).max(3),
  scope_type: z.enum(['college', 'department', 'programme']),
  scope_id: z.string().max(20).nullable().optional(),
  student_category: z.enum(['regular', 'kuccps', 'nita', 'employer', 'self_sponsored']).nullable().optional(),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valid_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  total_amount: z.number().positive(),
  created_by: z.string().max(20),
});

// Schema for creating a fee structure (with lines)
const createFeeStructureSchema = feeStructureBaseSchema.extend({
  lines: z.array(
    z.object({
      vote_head_id: z.string().max(20),
      amount: z.number().positive(),
      priority_order: z.number().int().positive(),
    })
  ).min(1, 'At least one vote head line is required'),
});

// Schema for resolving fee structure
const resolveFeeStructureSchema = z.object({
  term_number: z.number().int().min(1).max(3),
  enrollment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  programme_id: z.string().max(20),
  department_id: z.string().max(20).optional(),
  student_category: z.enum(['regular', 'kuccps', 'nita', 'employer', 'self_sponsored']).nullable().optional(),
});

// Schema for closing a version
const closeVersionSchema = z.object({
  valid_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Schema for copying a version
const copyVersionSchema = z.object({
  new_valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  version_label: z.string().min(1).max(60).optional(),
  created_by: z.string().max(20),
});


// Schema for updating a fee structure
const updateFeeStructureSchema = z.object({
  version_label: z.string().min(1).max(60).optional(),
  term_number: z.number().int().min(1).max(3).optional(),
  scope_type: z.enum(['college', 'department', 'programme']).optional(),
  scope_id: z.string().max(20).nullable().optional(),
  student_category: z.enum(['regular', 'kuccps', 'nita', 'employer', 'self_sponsored']).nullable().optional(),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  valid_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  total_amount: z.number().positive().optional(),
  is_active: z.boolean().optional(),
  created_by: z.string().max(20).optional(),
});

// Schema for bulk create
const bulkCreateFeeStructureSchema = z.object({
  version_label: z.string().min(1).max(60),
  valid_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valid_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  created_by: z.string().max(20),
  terms: z.array(
    z.object({
      term_number: z.number().int().min(1).max(3),
      scope_type: z.enum(['college', 'department', 'programme']).default('college'),
      scope_id: z.string().max(20).nullable().optional(),
      student_category: z.enum(['regular', 'kuccps', 'nita', 'employer', 'self_sponsored']).nullable().optional(),
      total_amount: z.number().positive(),
      lines: z.array(
        z.object({
          vote_head_id: z.string().max(20),
          amount: z.number().positive(),
          priority_order: z.number().int().positive(),
        })
      ).min(1, 'At least one vote head line is required'),
    })
  ).min(1).max(3, 'Maximum 3 terms allowed'),
});



module.exports = {
  createFeeStructureSchema,
  resolveFeeStructureSchema,
  closeVersionSchema,
  copyVersionSchema,
  updateFeeStructureSchema,
  bulkCreateFeeStructureSchema
};