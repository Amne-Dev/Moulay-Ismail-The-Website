const Content = require('../models/Content');

// Get all content (public endpoint)
const getAll = async (req, res) => {
  try {
    const { section, language = 'en' } = req.query;
    
    const query = { isActive: true };
    if (section) query.section = section;
    if (language) query.language = language;

    const content = await Content.find(query);
    res.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Error fetching content' });
  }
};

// Get content by ID (public endpoint)
const getById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json(content);
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    res.status(500).json({ message: 'Error fetching content' });
  }
};

// Create new content (protected)
const create = async (req, res) => {
  try {
    const { title, body, imageUrl, section, order, language, metadata } = req.body;

    if (!title || !body || !section) {
      return res.status(400).json({ message: 'Title, body, and section are required' });
    }

    const contentData = {
      title,
      body,
      imageUrl: imageUrl || '',
      section,
      order: order || 0,
      language: language || 'en',
      metadata: metadata || {},
      isActive: true
    };

    const newContent = await Content.create(contentData);
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: 'Error creating content' });
  }
};

// Update content (protected)
const update = async (req, res) => {
  try {
    const { title, body, imageUrl, section, order, language, metadata, isActive } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (body !== undefined) updateData.body = body;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (section !== undefined) updateData.section = section;
    if (order !== undefined) updateData.order = order;
    if (language !== undefined) updateData.language = language;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedContent = await Content.findByIdAndUpdate(req.params.id, updateData);
    
    if (!updatedContent) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ message: 'Error updating content' });
  }
};

// Delete content (protected)
const remove = async (req, res) => {
  try {
    const deletedContent = await Content.findByIdAndDelete(req.params.id);
    
    if (!deletedContent) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ message: 'Error deleting content' });
  }
};

// Get all content for admin (protected)
const getAllAdmin = async (req, res) => {
  try {
    const { section, language } = req.query;
    
    const query = {};
    if (section) query.section = section;
    if (language) query.language = language;

    const content = await Content.find(query);
    res.json(content);
  } catch (error) {
    console.error('Error fetching admin content:', error);
    res.status(500).json({ message: 'Error fetching content' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getAllAdmin
};