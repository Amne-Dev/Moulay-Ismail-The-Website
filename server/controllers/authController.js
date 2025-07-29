const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check credentials against environment variables
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPassHash = process.env.ADMIN_PASS_HASH;

    if (username !== adminUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
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
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: adminUser, isAdmin: true },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { username: adminUser, isAdmin: true }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const logout = async (req, res) => {
  // For JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logout successful' });
};

const verifyToken = async (req, res) => {
  try {
    // Token verification is handled by middleware
    res.json({
      message: 'Token is valid',
      user: { username: req.user.username, isAdmin: req.user.isAdmin }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {
  login,
  logout,
  verifyToken
};