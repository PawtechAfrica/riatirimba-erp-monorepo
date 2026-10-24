
const { z } = require('zod');

// Base schema for VoteHead
const voteHeadBaseSchema = z.object({
  id: z.string().max(20),
  name: z.string().min(1).max(100),
  description: z.string().max(200).nullable().optional(),
  is_one_time: z.boolean().default(false),
  is_refundable: z.boolean().default(false),
  priority_order: z.number().int().positive(),
  is_active: z.boolean().default(true),
});

// Schema for creating a vote head
const createVoteHeadSchema = voteHeadBaseSchema;

// Schema for updating a vote head (all fields optional)
const updateVoteHeadSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(200).nullable().optional(),
  is_one_time: z.boolean().optional(),
  is_refundable: z.boolean().optional(),
  priority_order: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
});

// Schema for toggling active status
const toggleActiveSchema = z.object({
  id: z.string().max(20),
});

module.exports = {
  createVoteHeadSchema,
  updateVoteHeadSchema,
  toggleActiveSchema,
};