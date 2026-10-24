const { z } = require('zod');

const auditLogFiltersSchema = z.object({
  user_id: z.string().max(20).optional(),
  entity_type: z.string().max(40).optional(),
  entity_id: z.string().max(20).optional(),
  action: z.string().max(80).optional(),
  search: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

const createAuditLogSchema = z.object({
  userId: z.string().max(20),
  action: z.string().max(80),
  entityType: z.string().max(40),
  entityId: z.string().max(20),
  oldValue: z.any().optional(),
  newValue: z.any().optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(255).optional(),
});

module.exports = {
  auditLogFiltersSchema,
  createAuditLogSchema,
};