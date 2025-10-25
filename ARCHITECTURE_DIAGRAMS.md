# 📐 System Architecture Diagram

## Use Case Diagram

```
                    ┌─────────────────────────────────────┐
                    │  Online Food Ordering System (OFOS) │
                    │                                     │
                    │  ◯ Browse Menu                      │
                    │  ◯ Place Order                      │
                    │  ◯ Make Payment                     │
                    │  ◯ Track Order                      │
                    │  ◯ View Orders                      │
                    │  ◯ Update Order Status              │
                    │  ◯ Manage Menu Items                │
                    │  ◯ Manage Users                     │
                    └─────────────────────────────────────┘
                               ▲  ▲  ▲
                               │  │  │
              ┌────────────────┘  │  └──────────────┐
              │                   │                  │
         [Customer]         [Restaurant Staff]  [Administrator]
              │                   │                  │
              ├─ Browse Menu      ├─ View Orders    ├─ Manage Menu
              ├─ Place Order      └─ Update Status  └─ Manage Users
              ├─ Make Payment
              └─ Track Order
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App Component                        │
│                    (NavbarComponent + Router)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
   ┌───▼────┐    ┌────▼─────┐   ┌────▼────┐
   │Customer│    │  Staff   │   │  Admin  │
   │  Area  │    │   Area   │   │  Area   │
   └───┬────┘    └────┬─────┘   └────┬────┘
       │              │              │
       │              │              │
   ┌───▼──────────────▼──────────────▼────┐
   │                                       │
   │  ┌─────────────┐  ┌─────────────┐    │
   │  │   Auth      │  │    Menu     │    │
   │  │  Service    │  │   Service   │    │
   │  └─────────────┘  └─────────────┘    │
   │                                       │
   │  ┌─────────────┐  ┌─────────────┐    │
   │  │   Cart      │  │    Order    │    │
   │  │  Service    │  │   Service   │    │
   │  └─────────────┘  └─────────────┘    │
   │                                       │
   │         Services Layer                │
   └───────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│   Browser   │
│ LocalStorage│ ◄──────────────┐
└─────────────┘                │
                               │
┌──────────────────────────────┴─────────────────────┐
│                                                     │
│  ┌──────────┐     ┌──────────┐     ┌───────────┐  │
│  │   User   │────▶│   Auth   │────▶│  Current  │  │
│  │  Login   │     │ Service  │     │   User    │  │
│  └──────────┘     └──────────┘     └───────────┘  │
│                                                     │
│  ┌──────────┐     ┌──────────┐     ┌───────────┐  │
│  │  Browse  │────▶│   Menu   │────▶│   Cart    │  │
│  │   Menu   │     │ Service  │     │  Service  │  │
│  └──────────┘     └──────────┘     └─────┬─────┘  │
│                                           │        │
│  ┌──────────┐     ┌──────────┐     ┌─────▼─────┐  │
│  │ Checkout │────▶│  Order   │────▶│   Order   │  │
│  │          │     │ Service  │     │  Created  │  │
│  └──────────┘     └──────────┘     └───────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Order Status Flow

```
    ┌─────────┐
    │ Pending │
    └────┬────┘
         │
         ▼
   ┌──────────┐
   │Preparing │
   └────┬─────┘
        │
        ▼
   ┌─────────┐
   │  Ready  │
   └────┬────┘
        │
        ▼
┌──────────────────┐
│ Out for Delivery │
└────────┬─────────┘
         │
         ▼
    ┌──────────┐
    │Delivered │
    └──────────┘

    (Cancelled can happen at any stage)
```

## Route Structure

```
/
├── /login (Public)
├── /menu (Authenticated)
│
├── /cart (Customer only)
├── /checkout (Customer only)
├── /order-confirmation/:id (Customer only)
├── /my-orders (Customer only)
│
├── /staff
│   └── /orders (Staff + Admin)
│
└── /admin
    ├── /menu (Admin only)
    └── /users (Admin only)
```

## Service Dependencies

```
┌─────────────────┐
│  AuthService    │
│  - login()      │
│  - logout()     │
│  - currentUser  │
└────────┬────────┘
         │
         │ Used by
         ▼
┌─────────────────┐     ┌─────────────────┐
│  OrderService   │────▶│  CartService    │
│  - createOrder()│     │  - addToCart()  │
│  - getOrders()  │     │  - cartItems    │
└────────┬────────┘     └─────────────────┘
         │
         │ Uses
         ▼
┌─────────────────┐
│  MenuService    │
│  - getMenu()    │
│  - addItem()    │
└─────────────────┘
```

## State Management (Signals)

```
┌──────────────────────────────────────┐
│         Signal-based State           │
├──────────────────────────────────────┤
│                                      │
│  AuthService                         │
│  ├─ currentUser: Signal<User>       │
│  ├─ isAuthenticated: Signal<bool>   │
│  └─ userRole: Computed<Role>        │
│                                      │
│  CartService                         │
│  ├─ cartItems: Signal<CartItem[]>   │
│  ├─ totalItems: Computed<number>    │
│  └─ totalAmount: Computed<number>   │
│                                      │
│  MenuService                         │
│  └─ menuItems: Signal<MenuItem[]>   │
│                                      │
│  OrderService                        │
│  └─ orders: Signal<Order[]>         │
│                                      │
└──────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Navbar (always visible)
└── Router Outlet
    ├── Home
    ├── Login
    ├── Menu
    │   └── Menu Card (repeated)
    ├── Cart
    │   └── Cart Item (repeated)
    ├── Checkout
    ├── OrderConfirmation
    ├── MyOrders
    │   └── Order Card (repeated)
    ├── StaffOrders
    │   └── Order Card (repeated)
    ├── AdminMenu
    │   └── Menu Card + Edit Modal
    └── AdminUsers
        └── User Table + Edit Modal
```

## Security Layer

```
┌────────────────────────────────────────┐
│           Route Guards                 │
├────────────────────────────────────────┤
│                                        │
│  authGuard()                           │
│  ├─ Check if user is authenticated    │
│  └─ Redirect to /login if not         │
│                                        │
│  roleGuard(['customer'])               │
│  ├─ Check if user has required role   │
│  └─ Redirect to /unauthorized if not  │
│                                        │
└────────────────────────────────────────┘
```
