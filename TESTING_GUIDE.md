# 🧪 Testing Guide - Oh Crepe! OFOS

## Quick Start

1. **Start the application**: `npm start`
2. **Open browser**: Navigate to `http://localhost:4200`
3. **You'll see**: Welcome page with "Browse Menu" and "Sign In" buttons

---

## 🔐 Demo Accounts

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Customer | `customer@ofos.com` | any | Browse, order, track |
| Staff | `staff@ofos.com` | any | View & manage orders |
| Admin | `admin@ofos.com` | any | Full system access |

---

## 📝 Test Scenarios

### Scenario 1: Complete Customer Journey ✅

**Objective**: Test all customer use cases from browsing to order tracking

1. **Login as Customer**
   - Click "Sign In" on home page
   - Use email: `customer@ofos.com`
   - Click "Customer" quick login button

2. **Browse Menu** (Use Case #1)
   - You'll be redirected to the menu page
   - See 6 different crepe items
   - Notice category filter buttons: "All Items", "Sweet Crepes", "Savory Crepes"
   - Click "Sweet Crepes" - should show only sweet items
   - Click "Savory Crepes" - should show only savory items

3. **Add to Cart**
   - Click "Add to Cart" on any item
   - See green success message: "{Item} added to cart!"
   - Notice cart badge in navbar shows item count
   - Add 3-4 different items

4. **View Cart**
   - Click "Cart" in navbar
   - See all items you added
   - Test quantity controls:
     - Click "+" to increase quantity
     - Click "-" to decrease quantity
     - Click "✕" to remove an item
   - See order summary with total

5. **Place Order** (Use Case #2)
   - Click "Proceed to Checkout"
   - Form should be pre-filled with customer info
   - Fill in/verify:
     - Full Name
     - Phone Number
     - Delivery Address
     - Order Notes (optional)

6. **Make Payment** (Use Case #3)
   - Choose payment method:
     - Online Payment (sets status to "paid")
     - Cash on Delivery (sets status to "pending")
   - Click "Place Order"
   - See "Processing..." button text
   - After 1.5 seconds, redirect to confirmation page

7. **Order Confirmation**
   - See success icon ✅
   - View order details:
     - Order number
     - Order date
     - Estimated delivery time
     - Payment method & status
     - Delivery information
     - List of ordered items
     - Total amount

8. **Track Order** (Use Case #4)
   - Click "Track Order" or "My Orders" in navbar
   - See your order with status badge
   - View progress bar showing order status
   - See 5 progress steps:
     - 📝 Pending (yellow)
     - 👨‍🍳 Preparing (blue)
     - ✅ Ready (green)
     - 🚚 Delivering (purple)
     - 🎉 Delivered (green)
   - Initially at "Pending" (20% complete)

**✅ Expected Result**: Order successfully placed and visible in "My Orders"

---

### Scenario 2: Staff Order Management ✅

**Objective**: Test staff use cases for viewing and updating orders

1. **Logout & Login as Staff**
   - Click "Logout" in navbar
   - Login with `staff@ofos.com`
   - Automatically redirected to "Orders Management"

2. **View Orders** (Use Case #5)
   - See all orders in the system
   - Each order card shows:
     - Order number and date
     - Status badge
     - Customer details (name, phone, address)
     - Order notes (if any)
     - List of items with quantities
     - Total amount
     - Payment information

3. **Filter Orders**
   - Click "All Orders" - shows everything
   - Click "Active" - shows non-delivered/cancelled orders
   - Click "Pending" - shows only pending orders
   - Click "Preparing" - shows only preparing orders
   - Notice count on "Active" button

4. **Update Order Status** (Use Case #6)
   - Find the order you placed as customer
   - Use the "Update Status" dropdown
   - Change from "Pending" to "Preparing"
   - See green success message
   - Change to "Ready for Pickup"
   - Change to "Out for Delivery"
   - Finally change to "Delivered"

5. **Verify Real-time Updates**
   - Logout and login as customer again
   - Go to "My Orders"
   - See your order's updated status
   - Progress bar should show 100% completion
   - All 5 steps should be highlighted

**✅ Expected Result**: Staff can view all orders and successfully update their status

---

### Scenario 3: Admin Menu Management ✅

**Objective**: Test admin use case for managing menu items

1. **Login as Admin**
   - Logout and login with `admin@ofos.com`
   - Redirected to "Manage Menu Items"

2. **View Menu Items** (Use Case #7)
   - See all 6 menu items in grid layout
   - Each card shows:
     - Image
     - Name and description
     - Price and category
     - Preparation time
     - Availability status
     - Action buttons (Edit, Toggle, Delete)

3. **Add New Menu Item**
   - Click "+ Add New Item" button
   - Modal opens with form
   - Fill in:
     - Name: "Strawberry Delight"
     - Description: "Fresh strawberries with cream"
     - Price: 11.99
     - Prep Time: 12
     - Category: "Sweet Crepes"
     - Image URL: `https://via.placeholder.com/300x200?text=Strawberry`
     - Check "Available for order"
   - Click "Add Item"
   - See success message
   - New item appears in grid

4. **Edit Menu Item**
   - Click "Edit" on any item
   - Modal opens with pre-filled data
   - Change price or description
   - Click "Update Item"
   - See success message
   - Changes reflected in card

5. **Toggle Availability**
   - Click "Mark Unavailable" on an item
   - Item becomes slightly transparent
   - Status changes to "❌ Unavailable"
   - Click "Mark Available" to restore
   - Status changes to "✅ Available"

6. **Delete Menu Item**
   - Click "Delete" on the item you added
   - Confirm deletion in alert
   - Item removed from grid
   - See success message

**✅ Expected Result**: Full CRUD operations work correctly

---

### Scenario 4: Admin User Management ✅

**Objective**: Test admin use case for managing users

1. **Navigate to User Management** (Use Case #8)
   - Still logged in as admin
   - Click "Manage Users" in navbar

2. **View Users**
   - See table with all users:
     - Name
     - Email
     - Role badge (colored by role)
     - Phone
     - Created date
     - Actions

3. **Edit User**
   - Click "Edit" on the customer account
   - Modal opens with user data
   - Change:
     - Name
     - Phone number
     - Address
     - Role (try changing to "staff")
   - Click "Update User"
   - See success message
   - Changes reflected in table

4. **Delete User**
   - Try to delete the admin account (your current user)
   - Notice there's NO delete button (protection!)
   - Click "Delete" on another user
   - Confirm deletion
   - User removed from table

5. **Verify Role-based Access**
   - Logout
   - Login as the customer you just changed to staff
   - Should now see staff menu items in navbar
   - Has access to staff orders page

**✅ Expected Result**: User management works with proper access control

---

## 🔍 Edge Cases to Test

### Authentication & Authorization
- [ ] Try accessing `/admin/menu` without logging in → Redirects to login
- [ ] Login as customer, try accessing `/staff/orders` → Blocked
- [ ] Login as staff, try accessing `/admin/users` → Blocked
- [ ] Logout clears session and cart

### Shopping Cart
- [ ] Cart persists after page refresh (localStorage)
- [ ] Removing last item empties cart
- [ ] Quantity can't go below 0
- [ ] Cart badge updates in real-time

### Order Flow
- [ ] Can't checkout with empty cart
- [ ] Required fields in checkout form are validated
- [ ] Order appears immediately after placement
- [ ] Estimated delivery time is ~45 minutes from now

### Menu Management
- [ ] Can't save menu item without required fields
- [ ] Price must be positive number
- [ ] Prep time must be positive number
- [ ] Image URL must be valid URL

### User Management
- [ ] Can't delete currently logged-in user
- [ ] Email format is validated
- [ ] Role changes take effect immediately

---

## 📊 Success Criteria

All use cases should work as specified:

| # | Use Case | Test Result |
|---|----------|-------------|
| 1 | Browse Menu | ✅ |
| 2 | Place Order | ✅ |
| 3 | Make Payment | ✅ |
| 4 | Track Order | ✅ |
| 5 | View Orders | ✅ |
| 6 | Update Order Status | ✅ |
| 7 | Manage Menu Items | ✅ |
| 8 | Manage Users | ✅ |

---

## 🐛 Known Limitations (By Design)

1. **Mock Authentication**: Passwords are not validated (demo purposes)
2. **No Backend**: All data stored in localStorage
3. **No Real Payment**: Payment processing is simulated
4. **No Notifications**: No email/SMS notifications
5. **Single Restaurant**: System supports only one restaurant
6. **No Image Upload**: Images must be provided as URLs

---

## 💡 Tips

- **Quick Login**: Use the demo account buttons on login page
- **Data Persistence**: Orders and cart persist in browser
- **Reset Data**: Clear browser localStorage to reset
- **Multiple Roles**: Open different browser profiles to test multiple users simultaneously
- **Real-time Updates**: Refresh pages to see changes made by other roles

---

## ✨ What to Look For

### Good UX Elements
- ✅ Immediate feedback on actions (success messages)
- ✅ Loading states (e.g., "Processing..." during checkout)
- ✅ Visual order progress tracking
- ✅ Color-coded status badges
- ✅ Responsive design (try resizing browser)
- ✅ Intuitive navigation based on user role
- ✅ Cart badge showing item count
- ✅ Hover effects on cards and buttons

### Technical Excellence
- ✅ No page reloads (SPA)
- ✅ Reactive updates with signals
- ✅ Role-based access control
- ✅ Route protection with guards
- ✅ Clean component architecture
- ✅ Type-safe TypeScript code

---

**Happy Testing! 🥞**
