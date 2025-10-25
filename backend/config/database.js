const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './database/oh_crepe.db';

// Ensure database directory exists
function ensureDatabaseDirectory() {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// Create database connection
function createConnection() {
  ensureDatabaseDirectory();
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      throw err;
    }
    console.log('Connected to SQLite database');
  });
}

// Initialize database with tables and seed data
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = createConnection();
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON;');
    
    // Create tables
    const createTables = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('customer', 'staff', 'admin')),
        phone TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Menu items table
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        available BOOLEAN DEFAULT 1,
        preparation_time INTEGER DEFAULT 15,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled')),
        payment_method TEXT NOT NULL CHECK(payment_method IN ('online', 'cash-on-delivery')),
        payment_status TEXT NOT NULL CHECK(payment_status IN ('pending', 'paid', 'failed')),
        total_amount DECIMAL(10,2) NOT NULL,
        notes TEXT,
        estimated_delivery_time DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      -- Order items table
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        menu_item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
      );

      -- Cart items table (for persistence)
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        menu_item_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE
      );
    `;

    db.exec(createTables, (err) => {
      if (err) {
        console.error('Error creating tables:', err.message);
        db.close();
        reject(err);
        return;
      }
      
      console.log('Database tables created successfully');
      
      // Seed initial data
      seedDatabase(db)
        .then(() => {
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
              reject(err);
            } else {
              console.log('Database initialization completed');
              resolve();
            }
          });
        })
        .catch(reject);
    });
  });
}

// Seed database with initial data
async function seedDatabase(db) {
  return new Promise((resolve, reject) => {
    // Check if users already exist
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row.count > 0) {
        console.log('Database already seeded');
        resolve();
        return;
      }
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('password', 10);
      
      // Insert demo users
      const insertUsers = `
        INSERT INTO users (email, password_hash, name, role, phone, address) VALUES
        ('customer@ofos.com', ?, 'John Customer', 'customer', '+63-912-345-6789', '123 Main St, Quezon City'),
        ('staff@ofos.com', ?, 'Jane Staff', 'staff', '+63-912-345-6790', '456 Staff Ave, Manila'),
        ('admin@ofos.com', ?, 'Admin User', 'admin', '+63-912-345-6791', '789 Admin Blvd, Makati');
      `;
      
      db.run(insertUsers, [hashedPassword, hashedPassword, hashedPassword], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        // Insert menu items
        const insertMenuItems = `
          INSERT INTO menu_items (name, description, price, category, image_url, available, preparation_time) VALUES
          ('Classic Butter & Sugar Crêpe', 'A timeless French classic, delicately thin and perfectly golden, brushed with melted butter and sprinkled with fine granulated sugar. Simple, elegant, and utterly delicious.', 110.00, 'Sweet Crepes', '/assets/images/Classic_Butter_%26_Sugar_Cr%C3%AApe.png', 1, 10),
          ('Nutella Dream Crêpe', 'A decadent crêpe generously spread with rich, creamy Nutella hazelnut spread. A dream come true for chocolate and hazelnut lovers!', 165.00, 'Sweet Crepes', '/assets/images/Nutella_Dream_Cr%C3%AApe.png', 1, 12),
          ('Strawberry Fields Crêpe', 'Freshly sliced ripe strawberries nestled in a delicate crêpe, drizzled with a sweet strawberry glaze or a hint of whipped cream. A taste of summer!', 175.00, 'Sweet Crepes', '/assets/images/Strawberry_Fields_Cr%C3%AApe.png', 1, 15),
          ('Lemon Zest & Sugar Crêpe', 'A bright and tangy delight! Our signature crêpe with a generous squeeze of fresh lemon juice and a sprinkle of sugar. Refreshing and zesty.', 140.00, 'Sweet Crepes', '/assets/images/Lemon_Zest_%26_Sugar_Cr%C3%AApe.png', 1, 15),
          ('Bananas & Caramel Crêpe', 'Sliced ripe bananas folded into a warm crêpe, generously drizzled with rich, buttery caramel sauce. A comforting and sweet treat.', 160.00, 'Sweet Crepes', '/assets/images/Bananas_%26_Caramel_Cr%C3%AApe.png', 1, 10),
          ('Cinnamon Apple Crêpe', 'Warm, tender spiced apples with a hint of cinnamon, folded into a soft crêpe. Tastes just like apple pie!', 170.00, 'Sweet Crepes', '/assets/images/Cinnamon_Apple_Cr%C3%AApe.png', 1, 18),
          ('S''mores Delight Crêpe', 'A fun, campfire-inspired treat! Melted chocolate, toasted marshmallows, and crushed graham crackers enveloped in a warm crêpe.', 185.00, 'Sweet Crepes', '/assets/images/S%27mores_Delight_Cr%C3%AApe.png', 1, 18),
          ('Berry Blast Crêpe', 'A delightful medley of fresh seasonal berries (blueberries, raspberries, blackberries) tucked into a delicate crêpe, perhaps with a dollop of crème fraîche or a light berry compote.', 180.00, 'Sweet Crepes', '/assets/images/Berry_Blast_Cr%C3%AApe.png', 1, 18),
          ('Coconut Paradise Crêpe', 'Transport yourself to a tropical island with this crêpe filled with creamy coconut custard or shredded toasted coconut, perhaps with a touch of white chocolate drizzle.', 170.00, 'Sweet Crepes', '/assets/images/Coconut_Paradise_/Cr%C3%AApe.png', 1, 18);
        `;
        
        db.run(insertMenuItems, function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          console.log('✅ Database seeded with demo data');
          resolve();
        });
      });
    });
  });
}

// Get database connection
function getDb() {
  return createConnection();
}

module.exports = {
  initializeDatabase,
  getDb
};