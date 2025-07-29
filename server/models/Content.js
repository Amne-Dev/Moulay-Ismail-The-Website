const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  section: {
    type: String,
    required: true,
    enum: ['hero', 'slideshow', 'lessons', 'projects', 'activities', 'about']
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    enum: ['en', 'ar'],
    default: 'en'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better query performance
ContentSchema.index({ section: 1, order: 1, isActive: 1 });

// In-memory storage fallback when MongoDB is not available
let memoryStore = [];
let nextId = 1;

const ContentModel = {
  // Create content
  async create(data) {
    if (mongoose.connection.readyState === 1) {
      const Content = mongoose.model('Content', ContentSchema);
      return await Content.create(data);
    } else {
      const newContent = {
        _id: nextId++,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.push(newContent);
      return newContent;
    }
  },

  // Find all content
  async find(query = {}) {
    if (mongoose.connection.readyState === 1) {
      const Content = mongoose.model('Content', ContentSchema);
      return await Content.find(query).sort({ section: 1, order: 1 });
    } else {
      let results = memoryStore;
      if (query.section) results = results.filter(item => item.section === query.section);
      if (query.isActive !== undefined) results = results.filter(item => item.isActive === query.isActive);
      if (query.language) results = results.filter(item => item.language === query.language);
      return results.sort((a, b) => a.order - b.order);
    }
  },

  // Find by ID
  async findById(id) {
    if (mongoose.connection.readyState === 1) {
      const Content = mongoose.model('Content', ContentSchema);
      return await Content.findById(id);
    } else {
      return memoryStore.find(item => item._id == id);
    }
  },

  // Update content
  async findByIdAndUpdate(id, data) {
    if (mongoose.connection.readyState === 1) {
      const Content = mongoose.model('Content', ContentSchema);
      return await Content.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
    } else {
      const index = memoryStore.findIndex(item => item._id == id);
      if (index !== -1) {
        memoryStore[index] = { ...memoryStore[index], ...data, updatedAt: new Date() };
        return memoryStore[index];
      }
      return null;
    }
  },

  // Delete content
  async findByIdAndDelete(id) {
    if (mongoose.connection.readyState === 1) {
      const Content = mongoose.model('Content', ContentSchema);
      return await Content.findByIdAndDelete(id);
    } else {
      const index = memoryStore.findIndex(item => item._id == id);
      if (index !== -1) {
        return memoryStore.splice(index, 1)[0];
      }
      return null;
    }
  }
};

module.exports = ContentModel;