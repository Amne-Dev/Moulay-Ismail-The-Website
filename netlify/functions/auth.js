const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to parse request body
const parseBody = (event) => {
  try {
    return JSON.parse(event.body);
  } catch (error) {
    return null;
  }
};

// Helper function to create response
const createResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify(body)
  };
};

// Login handler
const handleLogin = async (body) => {
  const { username, password } = body;

  // Validate input
  if (!username || !password) {
    return createResponse(400, { message: 'Username and password are required' });
  }

  // Check credentials against environment variables
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPassHash = process.env.ADMIN_PASS_HASH;

  if (username !== adminUser) {
    return createResponse(401, { message: 'Invalid credentials' });
  }

  // If no hash is set, create one from a default password
  let isValidPassword = false;
  if (adminPassHash) {
    isValidPassword = await bcrypt.compare(password, adminPassHash);
  } else {
    // Fallback for development - use 'admin123' as default password
    const defaultPassword = 'admin123';
    isValidPassword = password === defaultPassword;
    console.log('Warning: Using default password. Set ADMIN_PASS_HASH in production.');
  }

  if (!isValidPassword) {
    return createResponse(401, { message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { username: adminUser, isAdmin: true },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: '24h' }
  );

  return createResponse(200, {
    message: 'Login successful',
    token,
    user: { username: adminUser, isAdmin: true }
  });
};

// Logout handler
const handleLogout = () => {
  return createResponse(200, { message: 'Logout successful' });
};

// Verify token handler
const handleVerify = (event) => {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createResponse(401, { message: 'No token provided or invalid format' });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return createResponse(401, { message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    if (!decoded.isAdmin) {
      return createResponse(403, { message: 'Access denied. Admin privileges required.' });
    }

    return createResponse(200, {
      message: 'Token is valid',
      user: { username: decoded.username, isAdmin: decoded.isAdmin }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return createResponse(401, { message: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return createResponse(401, { message: 'Invalid token' });
    }
    
    return createResponse(401, { message: 'Token verification failed' });
  }
};

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  try {
    // Debug logging
    console.log('Event path:', event.path);
    console.log('Event method:', event.httpMethod);
    console.log('Event headers:', event.headers);
    
    // Extract the route from the path
    let path = event.path.replace('/.netlify/functions/auth', '');
    
    // Handle both /api/auth/* and direct function calls
    if (path.startsWith('/api/auth')) {
      path = path.replace('/api/auth', '');
    }
    
    // Remove leading slash if present
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    
    const method = event.httpMethod;
    
    console.log('Processed path:', path);
    console.log('Method:', method);

    // Route handling
    if ((path === 'login' || path === '') && method === 'POST') {
      const body = parseBody(event);
      if (!body) {
        return createResponse(400, { message: 'Invalid request body' });
      }
      return await handleLogin(body);
    }

    if (path === 'logout' && method === 'POST') {
      return handleLogout();
    }

    if (path === 'verify' && method === 'GET') {
      return handleVerify(event);
    }

    // If we get here, route wasn't found
    return createResponse(404, { 
      message: 'Route not found',
      debug: {
        originalPath: event.path,
        processedPath: path,
        method: method
      }
    });
  } catch (error) {
    console.error('Auth function error:', error);
    return createResponse(500, { 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
    });
  }
};