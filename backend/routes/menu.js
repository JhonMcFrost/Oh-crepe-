const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all menu items (public)
router.get('/', (req, res) => {
  const db = getDb();
  
  db.all('SELECT * FROM menu_items ORDER BY category, name', (err, items) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch menu items'
      });
    }
    
    db.close();
    res.json({
      message: 'Menu items retrieved successfully',
      data: items
    });
  });
});

// Get available menu items only (public)
router.get('/available', (req, res) => {
  const db = getDb();
  
  db.all('SELECT * FROM menu_items WHERE available = 1 ORDER BY category, name', (err, items) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch available menu items'
      });
    }
    
    db.close();
    res.json({
      message: 'Available menu items retrieved successfully',
      data: items
    });
  });
});

// Get menu item by ID (public)
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  
  db.get('SELECT * FROM menu_items WHERE id = ?', [id], (err, item) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch menu item'
      });
    }
    
    if (!item) {
      db.close();
      return res.status(404).json({
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }
    
    db.close();
    res.json({
      message: 'Menu item retrieved successfully',
      data: item
    });
  });
});

// Get menu categories (public)
router.get('/categories/list', (req, res) => {
  const db = getDb();
  
  db.all('SELECT DISTINCT category FROM menu_items ORDER BY category', (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch categories'
      });
    }
    
    const categories = rows.map(row => row.category);
    db.close();
    
    res.json({
      message: 'Categories retrieved successfully',
      data: categories
    });
  });
});

// Add new menu item (admin only)
router.post('/', authenticateToken, isAdmin, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().isLength({ min: 2 }).withMessage('Category is required'),
  body('image_url').optional().isURL().withMessage('Image URL must be valid'),
  body('preparation_time').optional().isInt({ min: 1 }).withMessage('Preparation time must be a positive integer')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { name, description, price, category, image_url, available = true, preparation_time = 15 } = req.body;
  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO menu_items (name, description, price, category, image_url, available, preparation_time)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([name, description, price, category, image_url, available ? 1 : 0, preparation_time], function(err) {
    if (err) {
      console.error('Error creating menu item:', err);
      stmt.finalize();
      db.close();
      return res.status(500).json({
        error: 'Failed to create menu item',
        message: 'An error occurred while creating the menu item'
      });
    }

    const itemId = this.lastID;
    stmt.finalize();

    // Get the created item
    db.get('SELECT * FROM menu_items WHERE id = ?', [itemId], (err, item) => {
      if (err) {
        console.error('Error fetching created item:', err);
        db.close();
        return res.status(500).json({
          error: 'Item created but failed to fetch',
          message: 'Menu item was created but could not be retrieved'
        });
      }

      db.close();
      res.status(201).json({
        message: 'Menu item created successfully',
        data: item
      });
    });
  });
});

// Update menu item (admin only)
router.put('/:id', authenticateToken, isAdmin, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().trim().isLength({ min: 2 }).withMessage('Category is required'),
  body('image_url').optional().isURL().withMessage('Image URL must be valid'),
  body('preparation_time').optional().isInt({ min: 1 }).withMessage('Preparation time must be a positive integer')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { id } = req.params;
  const updates = req.body;
  const db = getDb();

  // Check if item exists
  db.get('SELECT * FROM menu_items WHERE id = ?', [id], (err, item) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check menu item'
      });
    }

    if (!item) {
      db.close();
      return res.status(404).json({
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && ['name', 'description', 'price', 'category', 'image_url', 'available', 'preparation_time'].includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(key === 'available' ? (updates[key] ? 1 : 0) : updates[key]);
      }
    });

    if (updateFields.length === 0) {
      db.close();
      return res.status(400).json({
        error: 'No valid fields to update',
        message: 'At least one valid field must be provided for update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const updateQuery = `UPDATE menu_items SET ${updateFields.join(', ')} WHERE id = ?`;

    db.run(updateQuery, updateValues, function(err) {
      if (err) {
        console.error('Error updating menu item:', err);
        db.close();
        return res.status(500).json({
          error: 'Failed to update menu item',
          message: 'An error occurred while updating the menu item'
        });
      }

      // Get the updated item
      db.get('SELECT * FROM menu_items WHERE id = ?', [id], (err, updatedItem) => {
        if (err) {
          console.error('Error fetching updated item:', err);
          db.close();
          return res.status(500).json({
            error: 'Item updated but failed to fetch',
            message: 'Menu item was updated but could not be retrieved'
          });
        }

        db.close();
        res.json({
          message: 'Menu item updated successfully',
          data: updatedItem
        });
      });
    });
  });
});

// Toggle menu item availability (admin only)
router.patch('/:id/toggle-availability', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  db.get('SELECT * FROM menu_items WHERE id = ?', [id], (err, item) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check menu item'
      });
    }

    if (!item) {
      db.close();
      return res.status(404).json({
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }

    const newAvailability = item.available ? 0 : 1;

    db.run('UPDATE menu_items SET available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
           [newAvailability, id], function(err) {
      if (err) {
        console.error('Error toggling availability:', err);
        db.close();
        return res.status(500).json({
          error: 'Failed to toggle availability',
          message: 'An error occurred while updating availability'
        });
      }

      db.close();
      res.json({
        message: `Menu item ${newAvailability ? 'enabled' : 'disabled'} successfully`,
        data: { id: parseInt(id), available: Boolean(newAvailability) }
      });
    });
  });
});

// Delete menu item (admin only)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  // Check if item exists
  db.get('SELECT * FROM menu_items WHERE id = ?', [id], (err, item) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check menu item'
      });
    }

    if (!item) {
      db.close();
      return res.status(404).json({
        error: 'Menu item not found',
        message: `Menu item with ID ${id} does not exist`
      });
    }

    // Delete the item
    db.run('DELETE FROM menu_items WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting menu item:', err);
        db.close();
        return res.status(500).json({
          error: 'Failed to delete menu item',
          message: 'An error occurred while deleting the menu item'
        });
      }

      db.close();
      res.json({
        message: 'Menu item deleted successfully',
        data: { id: parseInt(id) }
      });
    });
  });
});

module.exports = router;