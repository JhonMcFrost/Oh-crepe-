# 🥞 Oh Crepe! - Online Food Ordering System (OFOS)

A complete Angular-based online food ordering system for a crepe restaurant, built with modern Angular features including signals, standalone components, and reactive state management.

## 📋 System Overview

This application implements a complete Use Case model for an Online Food Ordering System with three distinct user roles:

### Actors

1. **Customer** - End users who browse menu, place orders, make payments, and track order status
2. **Restaurant Staff** - Manages incoming orders and updates order status
3. **Administrator** - Manages menu items and user accounts

### Use Cases

| Use Case | Description | Actor |
|----------|-------------|-------|
| Browse Menu | View available dishes with details | Customer |
| Place Order | Select items, add to cart, and submit order | Customer |
| Make Payment | Pay online or choose cash on delivery | Customer |
| Track Order | Monitor real-time order progress | Customer |
| View Orders | See all incoming orders | Staff |
| Update Order Status | Change order progress status | Staff |
| Manage Menu Items | Add, edit, or remove menu items | Admin |
| Manage Users | Create, update, or remove user accounts | Admin |

## 🚀 Features

### Customer Features
- ✅ Browse menu with category filtering
- ✅ Add items to shopping cart
- ✅ Adjust item quantities
- ✅ Checkout with delivery information
- ✅ Multiple payment methods (Online & Cash on Delivery)
- ✅ Order confirmation
- ✅ Track order status in real-time
- ✅ View order history

### Staff Features
- ✅ View all orders with filtering
- ✅ Update order status (Pending → Preparing → Ready → Out for Delivery → Delivered)
- ✅ View customer details and order items
- ✅ Filter orders by status

### Admin Features
- ✅ Full CRUD operations for menu items
- ✅ Toggle item availability
- ✅ Manage user accounts
- ✅ Update user roles and information

## 🛠️ Technical Stack

- **Framework**: Angular 20.3
- **Language**: TypeScript 5.9
- **State Management**: Angular Signals
- **Routing**: Angular Router with Guards
- **Forms**: Reactive Forms
- **Styling**: Component-scoped CSS

## 🔐 Authentication & Authorization

### Demo Accounts

The system includes three pre-configured demo accounts:

1. **Customer Account**
   - Email: `customer@ofos.com`
   - Password: `password123`
   - Role: Customer
   - Access: Browse menu, place orders, track orders

2. **Staff Account**
   - Email: `staff@ofos.com`
   - Password: `staff123`
   - Role: Staff
   - Access: View and manage orders

3. **Admin Account**
   - Email: `admin@ofos.com`
   - Password: `admin123`
   - Role: Admin
   - Access: Full system access (menu, users, orders)

## 🚦 Order Status Flow

```
Pending → Preparing → Ready → Out for Delivery → Delivered
```

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
