const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../config/database');
const { authenticateToken, isStaffOrAdmin, isCustomer } = require('../middleware/auth');

const router = express.Router();

// Get orders (role-based access)
router.get('/', authenticateToken, (req, res) => {
  const db = getDb();
  let query;
  let params = [];

  // Customers can only see their own orders
  if (req.user.role === 'customer') {
    query = `
      SELECT o.*, 
             GROUP_CONCAT(
               json_object(
                 'id', oi.id,
                 'menuItemId', oi.menu_item_id,
                 'menuItemName', oi.menu_item_name,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    params = [req.user.id];
  } else {
    // Staff and admin can see all orders
    query = `
      SELECT o.*, 
             GROUP_CONCAT(
               json_object(
                 'id', oi.id,
                 'menuItemId', oi.menu_item_id,
                 'menuItemName', oi.menu_item_name,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
  }

  db.all(query, params, (err, orders) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch orders'
      });
    }

    // Parse items JSON for each order
    const processedOrders = orders.map(order => ({
      ...order,
      items: order.items ? order.items.split(',').map(item => {
        try {
          return JSON.parse(item);
        } catch (e) {
          console.error('Error parsing order item:', e);
          return null;
        }
      }).filter(item => item !== null) : []
    }));

    db.close();
    res.json({
      message: 'Orders retrieved successfully',
      data: processedOrders
    });
  });
});

// Get specific order by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  let query = `
    SELECT o.*, 
           GROUP_CONCAT(
             json_object(
               'id', oi.id,
               'menuItemId', oi.menu_item_id,
               'menuItemName', oi.menu_item_name,
               'quantity', oi.quantity,
               'price', oi.price
             )
           ) as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = ?
  `;
  
  let params = [id];

  // Customers can only access their own orders
  if (req.user.role === 'customer') {
    query += ' AND o.user_id = ?';
    params.push(req.user.id);
  }

  query += ' GROUP BY o.id';

  db.get(query, params, (err, order) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch order'
      });
    }

    if (!order) {
      db.close();
      return res.status(404).json({
        error: 'Order not found',
        message: `Order with ID ${id} does not exist or you don't have access to it`
      });
    }

    // Parse items JSON
    const processedOrder = {
      ...order,
      items: order.items ? order.items.split(',').map(item => {
        try {
          return JSON.parse(item);
        } catch (e) {
          console.error('Error parsing order item:', e);
          return null;
        }
      }).filter(item => item !== null) : []
    };

    db.close();
    res.json({
      message: 'Order retrieved successfully',
      data: processedOrder
    });
  });
});

// Create new order (customer only)
router.post('/', authenticateToken, isCustomer, [
  body('customerName').trim().isLength({ min: 2 }).withMessage('Customer name is required'),
  body('customerPhone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
  body('customerAddress').trim().isLength({ min: 10 }).withMessage('Customer address is required'),
  body('paymentMethod').isIn(['online', 'cash-on-delivery']).withMessage('Invalid payment method'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.menuItemId').isInt({ min: 1 }).withMessage('Valid menu item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('notes').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { customerName, customerPhone, customerAddress, paymentMethod, items, notes } = req.body;
  const db = getDb();

  // Verify all menu items exist and calculate total
  const menuItemIds = items.map(item => item.menuItemId);
  const placeholders = menuItemIds.map(() => '?').join(',');
  
  db.all(`SELECT id, name, price, available FROM menu_items WHERE id IN (${placeholders})`, 
         menuItemIds, (err, menuItems) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to verify menu items'
      });
    }

    if (menuItems.length !== menuItemIds.length) {
      db.close();
      return res.status(400).json({
        error: 'Invalid menu items',
        message: 'One or more menu items do not exist'
      });
    }

    // Check if all items are available
    const unavailableItems = menuItems.filter(item => !item.available);
    if (unavailableItems.length > 0) {
      db.close();
      return res.status(400).json({
        error: 'Unavailable items',
        message: 'Some items are currently unavailable',
        unavailableItems: unavailableItems.map(item => item.name)
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map(orderItem => {
      const menuItem = menuItems.find(mi => mi.id === orderItem.menuItemId);
      const itemTotal = menuItem.price * orderItem.quantity;
      totalAmount += itemTotal;
      
      return {
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        quantity: orderItem.quantity,
        price: menuItem.price
      };
    });

    // Add delivery fee (if applicable)
    const deliveryFee = 5.00;
    totalAmount += deliveryFee;

    // Calculate estimated delivery time (30-60 minutes from now)
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 45);

    // Create order
    const orderStmt = db.prepare(`
      INSERT INTO orders (
        user_id, customer_name, customer_phone, customer_address,
        status, payment_method, payment_status, total_amount, notes, estimated_delivery_time
      ) VALUES (?, ?, ?, ?, 'pending', ?, 'pending', ?, ?, ?)
    `);

    orderStmt.run([
      req.user.id, customerName, customerPhone, customerAddress,
      paymentMethod, totalAmount, notes, estimatedDeliveryTime.toISOString()
    ], function(err) {
      if (err) {
        console.error('Error creating order:', err);
        orderStmt.finalize();
        db.close();
        return res.status(500).json({
          error: 'Failed to create order',
          message: 'An error occurred while creating the order'
        });
      }

      const orderId = this.lastID;
      orderStmt.finalize();

      // Insert order items
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, menu_item_id, menu_item_name, quantity, price)
        VALUES (?, ?, ?, ?, ?)
      `);

      let itemsInserted = 0;
      const insertErrors = [];

      orderItems.forEach(item => {
        itemStmt.run([orderId, item.menuItemId, item.menuItemName, item.quantity, item.price], (err) => {
          if (err) {
            insertErrors.push(err);
          }
          
          itemsInserted++;
          
          if (itemsInserted === orderItems.length) {
            itemStmt.finalize();
            
            if (insertErrors.length > 0) {
              console.error('Errors inserting order items:', insertErrors);
              // Rollback - delete the order
              db.run('DELETE FROM orders WHERE id = ?', [orderId], () => {
                db.close();
                return res.status(500).json({
                  error: 'Failed to create order items',
                  message: 'An error occurred while creating order items'
                });
              });
              return;
            }

            // Clear user's cart (if implemented)
            db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.id], (err) => {
              if (err) {
                console.error('Error clearing cart:', err);
              }

              // Fetch the complete created order
              db.get(`
                SELECT o.*, 
                       GROUP_CONCAT(
                         json_object(
                           'id', oi.id,
                           'menuItemId', oi.menu_item_id,
                           'menuItemName', oi.menu_item_name,
                           'quantity', oi.quantity,
                           'price', oi.price
                         )
                       ) as items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE o.id = ?
                GROUP BY o.id
              `, [orderId], (err, order) => {
                if (err) {
                  console.error('Error fetching created order:', err);
                  db.close();
                  return res.status(500).json({
                    error: 'Order created but failed to fetch',
                    message: 'Order was created but could not be retrieved'
                  });
                }

                const processedOrder = {
                  ...order,
                  items: order.items ? order.items.split(',').map(item => {
                    try {
                      return JSON.parse(item);
                    } catch (e) {
                      return null;
                    }
                  }).filter(item => item !== null) : []
                };

                db.close();
                res.status(201).json({
                  message: 'Order created successfully',
                  data: processedOrder
                });
              });
            });
          }
        });
      });
    });
  });
});

// Update order status (staff/admin only)
router.patch('/:id/status', authenticateToken, isStaffOrAdmin, [
  body('status').isIn(['pending', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { id } = req.params;
  const { status } = req.body;
  const db = getDb();

  // Check if order exists
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      console.error('Database error:', err);
      db.close();
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check order'
      });
    }

    if (!order) {
      db.close();
      return res.status(404).json({
        error: 'Order not found',
        message: `Order with ID ${id} does not exist`
      });
    }

    // Update order status
    db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
           [status, id], function(err) {
      if (err) {
        console.error('Error updating order status:', err);
        db.close();
        return res.status(500).json({
          error: 'Failed to update order status',
          message: 'An error occurred while updating the order status'
        });
      }

      db.close();
      res.json({
        message: 'Order status updated successfully',
        data: { id: parseInt(id), status }
      });
    });
  });
});

module.exports = router;