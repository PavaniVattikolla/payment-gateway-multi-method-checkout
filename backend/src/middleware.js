const { query } = require('./db');

const authMiddleware = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const apiSecret = req.headers['x-api-secret'];

  if (!apiKey || !apiSecret) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        description: 'Invalid API credentials'
      }
    });
  }

  try {
    const result = await query(
      'SELECT id, name, email FROM merchants WHERE api_key = $1 AND api_secret = $2 AND is_active = true',
      [apiKey, apiSecret]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          description: 'Invalid API credentials'
        }
      });
    }

    req.merchant = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        description: 'Authentication failed'
      }
    });
  }
};

module.exports = authMiddleware;
