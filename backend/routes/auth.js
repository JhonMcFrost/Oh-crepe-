const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../config/database');

const router = express.Router();

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;
    const db = getDb();

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        db.close();
        return res.status(500).json({
          error: 'Database error',
          message: 'An error occurred while querying the database'
        });
      }

      if (!user) {
        db.close();
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        db.close();
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      db.close();

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Register endpoint
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone(),
  body('address').optional().trim()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, name, phone, address } = req.body;
    const db = getDb();

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        console.error('Database error:', err);
        db.close();
        return res.status(500).json({
          error: 'Database error',
          message: 'An error occurred while querying the database'
        });
      }

      if (existingUser) {
        db.close();
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create new user
      const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, name, role, phone, address)
        VALUES (?, ?, ?, 'customer', ?, ?)
      `);

      stmt.run([email, passwordHash, name, phone || null, address || null], function(err) {
        if (err) {
          console.error('Error creating user:', err);
          stmt.finalize();
          db.close();
          return res.status(500).json({
            error: 'Failed to create user',
            message: 'An error occurred while creating your account'
          });
        }

        const userId = this.lastID;

        // Generate JWT token
        const token = jwt.sign(
          { 
            id: userId, 
            email, 
            role: 'customer',
            name
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        stmt.finalize();
        db.close();

        res.status(201).json({
          message: 'Registration successful',
          token,
          user: {
            id: userId,
            email,
            name,
            role: 'customer'
          }
        });
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Verify token endpoint
router.post('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'No token provided',
      message: 'Authorization token is required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      valid: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Invalid token',
      message: 'Token is not valid or has expired'
    });
  }
});

module.exports = router;