const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', contentController.getAll);
router.get('/:id', contentController.getById);

// Protected routes (require authentication)
router.get('/admin/all', authMiddleware, contentController.getAllAdmin);
router.post('/', authMiddleware, contentController.create);
router.put('/:id', authMiddleware, contentController.update);
router.delete('/:id', authMiddleware, contentController.remove);

module.exports = router