/**
 * Admin Authentication Middleware
 * Validates request header 'x-admin-key' or Bearer token against ADMIN_KEY env variable.
 */
const requireAdmin = (req, res, next) => {
  const configuredKey = process.env.ADMIN_KEY || 'arshiya-portfolio-admin-secret-2026';
  
  const headerKey = req.headers['x-admin-key'];
  const authHeader = req.headers['authorization'];
  let bearerKey = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerKey = authHeader.substring(7).trim();
  }

  const providedKey = headerKey || bearerKey;

  if (!providedKey) {
    return res.status(401).json({
      status: 'error',
      message: 'Access Denied: Missing Admin Key. Please provide the x-admin-key header.'
    });
  }

  if (providedKey !== configuredKey) {
    return res.status(403).json({
      status: 'error',
      message: 'Forbidden: Invalid Admin Key supplied.'
    });
  }

  next();
};

module.exports = { requireAdmin };
