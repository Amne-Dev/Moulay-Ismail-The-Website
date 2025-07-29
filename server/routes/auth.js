
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/login - Admin login
router.post('/login', authController.login);

// POST /api/auth/logout - Admin logout
router.post('/logout', authController.logout);

// GET /api/auth/verify - Verify token
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;