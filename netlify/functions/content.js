const jwt = require('jsonwebtoken');

// In-memory storage for content (since we can't use MongoDB easily in serverless)
// In production, you'd want to use a database service like FaunaDB, Supabase, or Airtable
let contentStore = [
  // Sample data for hero section
  {
    _id: '1',
    title: 'Online Community of Teachers and Students',
    body: 'Welcome to Moulay Ismail High School online platform where teachers and students collaborate and learn together.',
    imageUrl: '',
    section: 'hero',
    order: 0,
    language: 'en',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    title: 'مجتمع تعليمي للمعلمين والطلاب عبر الإنترنت',
    body: 'مرحبًا بكم في منصة ثانوية مولاي إسماعيل الإلكترونية حيث يتعاون المعلمون والطلاب ويتعلمون معًا.',
    imageUrl: '',
    section: 'hero',
    order: 0,
    language: 'ar',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Sample slideshow data
  {
    _id: '3',
    title: 'Welcome to our Community',
    body: 'Join our vibrant educational community',
    imageUrl: 'https://placehold.co/1200x800',
    section: 'slideshow',
    order: 0,
    language: 'en',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '4',
    title: 'Engage with Teachers and Students',
    body: 'Connect and collaborate with educators and learners',
    imageUrl: 'https://placehold.co/1200x800',
    section: 'slideshow',
    order: 1,
    language: 'en',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let nextId = 5;

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
const getAllContent = (queryParams) => {
  const { section, language = 'en' } = queryParams;
  
  let filteredContent = contentStore.filter(item => item.isActive);
  
  if (section) {
    filteredContent = filteredContent.filter(item => item.section === section);
  }
  
  if (language) {
    filteredContent = filteredContent.filter(item => item.language === language);
  }
  
  return filteredContent.sort((a, b) => a.order - b.order);
};

const getContentById = (id) => {
  return contentStore.find(item => item._id === id);
};

const createContent = (data) => {
  const newContent = {
    _id: String(nextId++),
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
  
  contentStore.push(newContent);
  return newContent;
};

const updateContent = (id, data) => {
  const index = contentStore.findIndex(item => item._id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedContent = {
    ...contentStore[index],
    ...data,
    updatedAt: new Date()
  };
  
  contentStore[index] = updatedContent;
  return updatedContent;
};

const deleteContent = (id) => {
  const index = contentStore.findIndex(item => item._id === id);
  
  if (index === -1) {
    return null;
  }
  
  return contentStore.splice(index, 1)[0];
};

const getAllContentAdmin = (queryParams) => {
  const { section, language } = queryParams;
  
  let filteredContent = contentStore;
  
  if (section) {
    filteredContent = filteredContent.filter(item => item.section === section);
  }
  
  if (language) {
    filteredContent = filteredContent.filter(item => item.language === language);
  }
  
  return filteredContent.sort((a, b) => a.order - b.order);
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
      const content = getAllContent(queryParams);
      return createResponse(200, content);
    }

    if (method === 'GET' && path && !path.includes('admin') && path !== '') {
      const content = getContentById(path);
      if (!content) {
        return createResponse(404, { message: 'Content not found' });
      }
      return createResponse(200, content);
    }

    // Protected routes - require authentication
    try {
      verifyToken(event);
    } catch (error) {
      return createResponse(401, { message: 'Authentication required' });
    }

    // Admin routes
    if (method === 'GET' && path === 'admin/all') {
      const content = getAllContentAdmin(queryParams);
      return createResponse(200, content);
    }

    if (method === 'POST' && (path === '' || path === 'create')) {
      const body = parseBody(event);
      if (!body) {
        return createResponse(400, { message: 'Invalid request body' });
      }

      if (!body.title || !body.body || !body.section) {
        return createResponse(400, { message: 'Title, body, and section are required' });
      }

      const newContent = createContent(body);
      return createResponse(201, newContent);
    }

    if (method === 'PUT' && path) {
      const body = parseBody(event);
      if (!body) {
        return createResponse(400, { message: 'Invalid request body' });
      }

      const updatedContent = updateContent(path, body);
      if (!updatedContent) {
        return createResponse(404, { message: 'Content not found' });
      }

      return createResponse(200, updatedContent);
    }

    if (method === 'DELETE' && path) {
      const deletedContent = deleteContent(path);
      if (!deletedContent) {
        return createResponse(404, { message: 'Content not found' });
      }

      return createResponse(200, { message: 'Content deleted successfully' });
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