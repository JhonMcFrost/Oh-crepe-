import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { MenuComponent } from './components/customer/menu.component';
import { CartComponent } from './components/customer/cart.component';
import { CheckoutComponent } from './components/customer/checkout.component';
import { OrderConfirmationComponent } from './components/customer/order-confirmation.component';
import { MyOrdersComponent } from './components/customer/my-orders.component';
import { StaffOrdersComponent } from './components/staff/staff-orders.component';
import { AdminMenuComponent } from './components/admin/admin-menu.component';
import { AdminUsersComponent } from './components/admin/admin-users.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Customer routes
  { path: 'menu', component: MenuComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent, canActivate: [roleGuard(['customer'])] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [roleGuard(['customer'])] },
  { path: 'order-confirmation/:orderId', component: OrderConfirmationComponent, canActivate: [roleGuard(['customer'])] },
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [roleGuard(['customer'])] },
  
  // Staff routes
  { path: 'staff/orders', component: StaffOrdersComponent, canActivate: [roleGuard(['staff', 'admin'])] },
  
  // Admin routes
  { path: 'admin/menu', component: AdminMenuComponent, canActivate: [roleGuard(['admin'])] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [roleGuard(['admin'])] },
  
  { path: '**', redirectTo: '' },
];
