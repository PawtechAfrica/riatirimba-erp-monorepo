const auditLogService = require('../services/auditLog.service');

/**
 * Middleware to auto-log actions
 * Usage: Add to routes that need logging
 */
const auditLog = (options) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Store request data
    const startTime = Date.now();
    const userId = req.user?.id || req.body?.userId || req.query?.userId || 'SYSTEM';
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;
    
    // Override send to capture response
    res.send = function(data) {
      try {
        const response = typeof data === 'string' ? JSON.parse(data) : data;
        
        // Determine if action was successful
        const isSuccess = response?.success !== false && res.statusCode < 400;
        
        // Log only successful operations
        if (isSuccess && options.entityType) {
          const entityId = req.params.id || response?.data?.id || null;
          
          if (entityId) {
            auditLogService.createAuditLog({
              userId: userId,
              action: options.action || `${req.method} ${req.route?.path || req.path}`,
              entityType: options.entityType,
              entityId: entityId,
              oldValue: options.oldValue || null,
              newValue: options.newValue || response?.data || null,
              ipAddress: ipAddress,
              userAgent: userAgent,
            }).catch(err => {
              console.error('Failed to create audit log:', err);
            });
          }
        }
      } catch (e) {
        // Silently fail - don't break the response
        console.error('Audit log error:', e.message);
      }
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Manual audit log helper for services
 */
const logAction = async (data) => {
  return await auditLogService.createAuditLog(data);
};

module.exports = {
  auditLog,
  logAction,
};