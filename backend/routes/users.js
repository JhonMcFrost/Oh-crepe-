const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, isAdmin, (req, res) => {
  const db = getDb();
  
  db.all(`
    SELECT id, email, name, role, phone, address, created_at, updated_at 
    FROM users 
    ORDER BY created_at DESC
  `, (err, users) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch users'
      });
    }
    
    db.close();
    res.json({
      message: 'Users retrieved successfully',
      data: users
    });
  });
});

// Get user by ID (admin only)
router.get('/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();
  
  db.get(`
    SELECT id, email, name, role, phone, address, created_at, updated_at 
    FROM users 
    WHERE id = ?
  `, [id], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch user'
      });
    }
    
    if (!user) {
      db.close();
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${id} does not exist`
      });
    }
    
    db.close();
    res.json({
      message: 'User retrieved successfully',
      data: user
    });
  });
});

// Update user role (admin only)
router.patch('/:id/role', authenticateToken, isAdmin, [
  body('role').isIn(['customer', 'staff', 'admin']).withMessage('Invalid role')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { id } = req.params;
  const { role } = req.body;
  const db = getDb();

  // Prevent admin from changing their own role
  if (parseInt(id) === req.user.id) {
    db.close();
    return res.status(400).json({
      error: 'Cannot modify own role',
      message: 'You cannot change your own role'
    });
  }

  // Check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check user'
      });
    }

    if (!user) {
      db.close();
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${id} does not exist`
      });
    }

    // Update user role
    db.run('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
           [role, id], function(err) {
      if (err) {
        console.error('Error updating user role:', err);
        db.close();
        return res.status(500).json({
          error: 'Failed to update user role',
          message: 'An error occurred while updating the user role'
        });
      }

      db.close();
      res.json({
        message: 'User role updated successfully',
        data: { 
          id: parseInt(id), 
          role,
          previousRole: user.role
        }
      });
    });
  });
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  // Prevent admin from deleting themselves
  if (parseInt(id) === req.user.id) {
    db.close();
    return res.status(400).json({
      error: 'Cannot delete own account',
      message: 'You cannot delete your own account'
    });
  }

  // Check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check user'
      });
    }

    if (!user) {
      db.close();
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${id} does not exist`
      });
    }

    // Delete the user (this will cascade to cart_items due to foreign key constraints)
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting user:', err);
        db.close();
        return res.status(500).json({
          error: 'Failed to delete user',
          message: 'An error occurred while deleting the user'
        });
      }

      db.close();
      res.json({
        message: 'User deleted successfully',
        data: { 
          id: parseInt(id),
          deletedUser: {
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      });
    });
  });
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, isAdmin, (req, res) => {
  const db = getDb();
  
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role = 'customer') as customers,
      (SELECT COUNT(*) FROM users WHERE role = 'staff') as staff,
      (SELECT COUNT(*) FROM users WHERE role = 'admin') as admins,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM orders) as total_orders,
      (SELECT COUNT(*) FROM menu_items WHERE available = 1) as available_items
  `;
  
  db.get(statsQuery, (err, stats) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch statistics'
      });
    }
    
    db.close();
    res.json({
      message: 'Statistics retrieved successfully',
      data: stats
    });
  });
});

module.exports = router;