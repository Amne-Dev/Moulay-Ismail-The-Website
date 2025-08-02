const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');

// MongoDB connection
let cachedClient = null;
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'school_platform');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
};

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

// Initialize admin user if it doesn't exist
const initializeAdminUser = async (db) => {
  try {
    const users = db.collection('users');
    const adminUser = process.env.ADMIN_USER || 'admin';
    
    const existingAdmin = await users.findOne({ username: adminUser });
    
    if (!existingAdmin) {
      const adminPassHash = process.env.ADMIN_PASS_HASH;
      let hashedPassword;
      
      if (adminPassHash) {
        hashedPassword = adminPassHash;
      } else {
        // Create hash for default password 'admin123'
        const defaultPassword = 'admin123';
        hashedPassword = await bcrypt.hash(defaultPassword, 12);
        console.log('Warning: Using default password. Set ADMIN_PASS_HASH in production.');
      }
      
      await users.insertOne({
        username: adminUser,
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Admin user initialized');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

// Login handler
const handleLogin = async (body) => {
  const { username, password } = body;

  // Validate input
  if (!username || !password) {
    return createResponse(400, { message: 'Username and password are required' });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    
    // Find user by username
    const user = await users.findOne({ username });
    
    if (!user) {
      return createResponse(401, { message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return createResponse(401, { message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    // Update last login
    await users.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    return createResponse(200, {
      message: 'Login successful',
      token,
      user: { 
        id: user._id,
        username: user.username, 
        isAdmin: user.isAdmin 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return createResponse(500, { message: 'Internal server error during login' });
  }
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
      user: { 
        id: decoded.userId,
        username: decoded.username, 
        isAdmin: decoded.isAdmin 
      }
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

// Register handler (for creating additional admin users)
const handleRegister = async (body) => {
  const { username, password, isAdmin = false } = body;

  // Validate input
  if (!username || !password) {
    return createResponse(400, { message: 'Username and password are required' });
  }

  if (password.length < 6) {
    return createResponse(400, { message: 'Password must be at least 6 characters long' });
  }

  try {
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    
    // Check if user already exists
    const existingUser = await users.findOne({ username });
    
    if (existingUser) {
      return createResponse(409, { message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user
    const newUser = {
      username,
      password: hashedPassword,
      isAdmin,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await users.insertOne(newUser);
    
    return createResponse(201, {
      message: 'User created successfully',
      user: {
        id: result.insertedId,
        username,
        isAdmin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return createResponse(500, { message: 'Internal server error during registration' });
  }
};

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  try {
    // Initialize database connection and admin user
    const { db } = await connectToDatabase();
    await initializeAdminUser(db);
    
    // Debug logging
    console.log('Event path:', event.path);
    console.log('Event method:', event.httpMethod);
    
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

    if (path === 'register' && method === 'POST') {
      const body = parseBody(event);
      if (!body) {
        return createResponse(400, { message: 'Invalid request body' });
      }
      return await handleRegister(body);
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