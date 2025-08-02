const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

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

// Initialize sample content
const initializeSampleContent = async (db) => {
  try {
    const content = db.collection('content');
    const count = await content.countDocuments();
    
    if (count === 0) {
      const sampleContent = [
        // Sample data for hero section
        {
          title: 'Online Community of Teachers and Students',
          body: 'Welcome to Moulay Ismail High School online platform where teachers and students collaborate and learn together.',
          imageUrl: '',
          section: 'hero',
          order: 0,
          language: 'en',
          isActive: true,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'مجتمع تعليمي للمعلمين والطلاب عبر الإنترنت',
          body: 'مرحبًا بكم في منصة ثانوية مولاي إسماعيل الإلكترونية حيث يتعاون المعلمون والطلاب ويتعلمون معًا.',
          imageUrl: '',
          section: 'hero',
          order: 0,
          language: 'ar',
          isActive: true,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // Sample slideshow data
        {
          title: 'Welcome to our Community',
          body: 'Join our vibrant educational community',
          imageUrl: 'https://placehold.co/1200x800',
          section: 'slideshow',
          order: 0,
          language: 'en',
          isActive: true,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: 'Engage with Teachers and Students',
          body: 'Connect and collaborate with educators and learners',
          imageUrl: 'https://placehold.co/1200x800',
          section: 'slideshow',
          order: 1,
          language: 'en',
          isActive: true,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      await content.insertMany(sampleContent);
      console.log('Sample content initialized');
    }
  } catch (error) {
    console.error('Error initializing sample content:', error);
  }
};

// Helper functions
const parseBody = (event) => {
  try {
    return JSON.parse(event.body);
  } catch (error) {
    return null;
  }
};

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

const verifyToken = (event) => {
  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    if (!decoded.isAdmin) {
      throw new Error('Not admin');
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

// Content handlers
const getAllContent = async (db, queryParams) => {
  try {
    const { section, language = 'en' } = queryParams;
    const content = db.collection('content');
    
    let filter = { isActive: true };
    
    if (section) {
      filter.section = section;
    }
    
    if (language) {
      filter.language = language;
    }
    
    const results = await content
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    
    return results;
  } catch (error) {
    console.error('Error getting all content:', error);
    throw error;
  }
};

const getContentById = async (db, id) => {
  try {
    const content = db.collection('content');
    
    if (!ObjectId.isValid(id)) {
      return null;
    }
    
    const result = await content.findOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.error('Error getting content by ID:', error);
    throw error;
  }
};

const createContent = async (db, data) => {
  try {
    const content = db.collection('content');
    
    const newContent = {
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl || '',
      section: data.section,
      order: data.order || 0,
      language: data.language || 'en',
      metadata: data.metadata || {},
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await content.insertOne(newContent);
    
    // Return the created document
    const createdContent = await content.findOne({ _id: result.insertedId });
    return createdContent;
  } catch (error) {
    console.error('Error creating content:', error);
    throw error;
  }
};

const updateContent = async (db, id, data) => {
  try {
    const content = db.collection('content');
    
    if (!ObjectId.isValid(id)) {
      return null;
    }
    
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    const result = await content.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result.value;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

const deleteContent = async (db, id) => {
  try {
    const content = db.collection('content');
    
    if (!ObjectId.isValid(id)) {
      return null;
    }
    
    const result = await content.findOneAndDelete({ _id: new ObjectId(id) });
    return result.value;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

const getAllContentAdmin = async (db, queryParams) => {
  try {
    const { section, language } = queryParams;
    const content = db.collection('content');
    
    let filter = {};
    
    if (section) {
      filter.section = section;
    }
    
    if (language) {
      filter.language = language;
    }
    
    const results = await content
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    
    return results;
  } catch (error) {
    console.error('Error getting all content for admin:', error);
    throw error;
  }
};

const getContentStats = async (db) => {
  try {
    const content = db.collection('content');
    
    const stats = await content.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          sections: { $addToSet: '$section' },
          languages: { $addToSet: '$language' }
        }
      }
    ]).toArray();
    
    const sectionCounts = await content.aggregate([
      {
        $group: {
          _id: '$section',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]).toArray();
    
    return {
      ...stats[0],
      sectionCounts
    };
  } catch (error) {
    console.error('Error getting content stats:', error);
    throw error;
  }
};

exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  try {
    // Initialize database connection and sample content
    const { db } = await connectToDatabase();
    await initializeSampleContent(db);
    
    // Debug logging
    console.log('Event path:', event.path);
    console.log('Event method:', event.httpMethod);
    
    let path = event.path.replace('/.netlify/functions/content', '');
    
    // Handle both /api/content/* and direct function calls
    if (path.startsWith('/api/content')) {
      path = path.replace('/api/content', '');
    }
    
    // Remove leading slash if present
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    
    const method = event.httpMethod;
    const queryParams = event.queryStringParameters || {};
    
    console.log('Processed path:', path);
    console.log('Method:', method);

    // Public routes
    if (method === 'GET' && (path === '' || path === 'all')) {
      const contentResults = await getAllContent(db, queryParams);
      return createResponse(200, contentResults);
    }

    if (method === 'GET' && path && !path.includes('admin') && path !== 'stats') {
      const contentResult = await getContentById(db, path);
      if (!contentResult) {
        return createResponse(404, { message: 'Content not found' });
      }
      return createResponse(200, contentResult);
    }

    // Protected routes - require authentication
    try {
      verifyToken(event);
    } catch (error) {
      return createResponse(401, { message: 'Authentication required' });
    }

    // Admin routes
    if (method === 'GET' && path === 'admin/all') {
      const contentResults = await getAllContentAdmin(db, queryParams);
      return createResponse(200, contentResults);
    }

    if (method === 'GET' && path === 'stats') {
      const stats = await getContentStats(db);
      return createResponse(200, stats);
    }

    if (method === 'POST' && (path === '' || path === 'create')) {
      const body = parseBody(event);
      if (!body) {
        return createResponse(400, { message: 'Invalid request body' });
      }

      if (!body.title || !body.body || !body.section) {
        return createResponse(400, { message: 'Title, body, and section are required' });
      }

      const newContent = await createContent(db, body);
      return createResponse(201, newContent);
    }

    if (method === 'PUT' && path) {
      const body = parseBody(event);
      if (!body) {
        return createResponse(400, { message: 'Invalid request body' });
      }

      const updatedContent = await updateContent(db, path, body);
      if (!updatedContent) {
        return createResponse(404, { message: 'Content not found' });
      }

      return createResponse(200, updatedContent);
    }

    if (method === 'DELETE' && path) {
      const deletedContent = await deleteContent(db, path);
      if (!deletedContent) {
        return createResponse(404, { message: 'Content not found' });
      }

      return createResponse(200, { 
        message: 'Content deleted successfully',
        deletedContent 
      });
    }

    return createResponse(404, { 
      message: 'Route not found',
      debug: {
        originalPath: event.path,
        processedPath: path,
        method: method
      }
    });
  } catch (error) {
    console.error('Content function error:', error);
    return createResponse(500, { 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
    });
  }
};