const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../keys/public.pem'));

/**
 * @param {string | string[] | null} requiredPermission - permission(s) to require
 */
module.exports = function verifyJWT(requiredPermission = null) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('*Auth Fail* No token provided');
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
      console.log('*Auth Success* Token verified:', payload);

      const userPermissions = payload.permissions || [];

      if (requiredPermission) {
       
        const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
        const hasPermission = required.some(p => userPermissions.includes(p));

        if (!hasPermission) {
          console.log(`*Access Denied* Missing required permission(s): ${required}`);
          return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
      }

      req.user = payload;

      console.log('*Access Granted* User:', payload.email, '| Permissions:', userPermissions);
      next();
    } catch (err) {
      console.log('*Auth Error*', err.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
};
