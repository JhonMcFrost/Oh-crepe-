import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

// Use lazy-loaded components (loadComponent) to reduce initial bundle size.
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register.component').then(m => m.RegisterComponent)
  },

  // Customer routes
  {
    path: 'menu',
    loadComponent: () => import('./components/customer/menu.component').then(m => m.MenuComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/customer/cart.component').then(m => m.CartComponent),
    canActivate: [roleGuard(['customer'])]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./components/customer/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [roleGuard(['customer'])]
  },
  {
    path: 'order-confirmation/:orderId',
    loadComponent: () => import('./components/customer/order-confirmation.component').then(m => m.OrderConfirmationComponent),
    canActivate: [roleGuard(['customer'])]
  },
  {
    path: 'my-orders',
    loadComponent: () => import('./components/customer/my-orders.component').then(m => m.MyOrdersComponent),
    canActivate: [roleGuard(['customer'])]
  },

  // Staff routes
  {
    path: 'staff/orders',
    loadComponent: () => import('./components/staff/staff-orders.component').then(m => m.StaffOrdersComponent),
    canActivate: [roleGuard(['staff', 'admin'])]
  },

  // Admin routes
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./components/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [roleGuard(['admin'])]
  },
  {
    path: 'admin/menu',
    loadComponent: () => import('./components/admin/admin-menu.component').then(m => m.AdminMenuComponent),
    canActivate: [roleGuard(['admin'])]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./components/admin/admin-users.component').then(m => m.AdminUsersComponent),
    canActivate: [roleGuard(['admin'])]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
