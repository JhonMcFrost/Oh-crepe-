# Oh Crêpe! Backend API

A Node.js/Express backend API for the Oh Crêpe! Food Ordering System.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Menu Management**: CRUD operations for menu items (admin only)
- **Order Processing**: Complete order lifecycle management
- **User Management**: Admin panel for user administration
- **Security**: Rate limiting, CORS, input validation, and secure headers
- **Database**: SQLite with proper schema and foreign key constraints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: helmet, cors, bcryptjs, express-rate-limit

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

The `.env` file is already configured with development settings. For production, update:

```env
NODE_ENV=production
JWT_SECRET=your-secure-production-secret
FRONTEND_URL=https://your-production-domain.com
```

### 3. Start the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000`

### 4. Database

The SQLite database will be automatically created and seeded with demo data on first run.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration  
- `POST /verify` - Token verification

### Menu (`/api/menu`)
- `GET /` - Get all menu items (public)
- `GET /available` - Get available items only (public)
- `GET /:id` - Get item by ID (public)
- `GET /categories/list` - Get categories (public)
- `POST /` - Add new item (admin only)
- `PUT /:id` - Update item (admin only)
- `PATCH /:id/toggle-availability` - Toggle availability (admin only)
- `DELETE /:id` - Delete item (admin only)

### Orders (`/api/orders`)
- `GET /` - Get orders (role-based access)
- `GET /:id` - Get order by ID
- `POST /` - Create new order (customer only)
- `PATCH /:id/status` - Update order status (staff/admin only)

### Users (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /:id` - Get user by ID (admin only)
- `PATCH /:id/role` - Update user role (admin only)
- `DELETE /:id` - Delete user (admin only)
- `GET /stats/overview` - Get user statistics (admin only)

## Demo Accounts

The system comes with pre-seeded demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@ofos.com | password |
| Staff | staff@ofos.com | password |
| Admin | admin@ofos.com | password |

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Customer, Staff, and Admin roles
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation
- **Password Hashing**: bcrypt for secure password storage
- **CORS Protection**: Configurable cross-origin requests
- **Security Headers**: Helmet.js for secure HTTP headers

## Database Schema

### Users
- id, email, password_hash, name, role, phone, address, timestamps

### Menu Items  
- id, name, description, price, category, image_url, available, preparation_time, timestamps

### Orders
- id, user_id, customer details, status, payment info, total_amount, notes, timestamps

### Order Items
- id, order_id, menu_item_id, menu_item_name, quantity, price

### Cart Items
- id, user_id, menu_item_id, quantity, created_at

## Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@ofos.com", "password": "password"}'
```

### Get Menu (Public)
```bash
curl http://localhost:3000/api/menu
```

### Create Order (Authenticated)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerName": "John Doe",
    "customerPhone": "+63-912-345-6789",
    "customerAddress": "123 Main St, Quezon City",
    "paymentMethod": "cash-on-delivery",
    "items": [
      {"menuItemId": 1, "quantity": 2},
      {"menuItemId": 3, "quantity": 1}
    ],
    "notes": "Extra sauce please"
  }'
```

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── menu.js              # Menu routes
│   ├── orders.js            # Order routes
│   └── users.js             # User management routes
├── database/                # SQLite database files
├── .env                     # Environment variables
├── server.js                # Main server file
└── package.json             # Dependencies and scripts
```

### Adding New Features

1. **New Routes**: Add to appropriate route file in `/routes`
2. **Middleware**: Add custom middleware in `/middleware`
3. **Database**: Update schema in `/config/database.js`
4. **Validation**: Use express-validator for input validation

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": []  // Additional validation details if applicable
}
```

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables
- Returns 429 status when limit exceeded

## CORS Configuration

- Default: Allows requests from `http://localhost:4200` (Angular dev server)
- Configurable via `FRONTEND_URL` environment variable
- Supports credentials for authenticated requests