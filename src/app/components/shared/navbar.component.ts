import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a routerLink="/" class="navbar-brand">
          <img src="/assets/images/oh_crepe_logo.png" alt="Oh Crêpe Logo" class="logo">
          Oh Crepe!
        </a>

        @if (authService.isAuthenticated()) {
          <div class="navbar-menu">
            @if (authService.isCustomer()) {
              <a routerLink="/menu" class="nav-link">Menu</a>
              <a routerLink="/my-orders" class="nav-link">My Orders</a>
              <a routerLink="/cart" class="nav-link">
                Cart
                @if (cartService.totalItems() > 0) {
                  <span class="cart-badge">{{ cartService.totalItems() }}</span>
                }
              </a>
            }

            @if (authService.isStaff()) {
              <a routerLink="/staff/orders" class="nav-link">Orders</a>
            }

            @if (authService.isAdmin()) {
              <a routerLink="/admin/menu" class="nav-link">Manage Menu</a>
              <a routerLink="/admin/users" class="nav-link">Manage Users</a>
            }

            <div class="navbar-user">
              <span class="user-name">{{ authService.currentUser()?.name }}</span>
              <button (click)="logout()" class="btn-logout">Logout</button>
            </div>
          </div>
        } @else {
          <div class="navbar-menu">
            <a routerLink="/login" class="nav-link">Login</a>
            <a routerLink="/register" class="btn-primary">Sign Up</a>
          </div>
        }
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      background: linear-gradient(135deg, var(--buff) 0%, var(--sunset) 100%);
      color: var(--text-dark);
      padding: 1rem 0;
      box-shadow: 0 2px 8px var(--shadow-medium);
      border-bottom: 3px solid var(--border-beige);
    }

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-brand {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--dark-brown);
      text-decoration: none;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo {
      height: 40px;
      width: 40px;
      object-fit: contain;
    }

    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-link {
      color: var(--text-dark);
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      transition: all 0.3s;
      position: relative;
      background: rgba(255, 255, 255, 0.3);
      font-weight: 600;
    }

    .nav-link:hover {
      background: var(--warm-white);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px var(--shadow-light);
    }

    .cart-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: var(--error-red);
      color: white;
      border-radius: 50%;
      padding: 0.2rem 0.5rem;
      font-size: 0.75rem;
      font-weight: bold;
      box-shadow: 0 2px 4px var(--shadow-medium);
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-left: 1rem;
      border-left: 2px solid var(--border-beige);
    }

    .user-name {
      font-size: 0.9rem;
      color: var(--text-dark);
      font-weight: 600;
    }

    .btn-logout {
      background: var(--error-red);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
    }

    .btn-logout:hover {
      background: #B84A4A;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px var(--shadow-medium);
    }

    .btn-primary {
      background: var(--dark-brown);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      text-decoration: none;
      transition: all 0.3s;
      font-weight: 600;
    }

    .btn-primary:hover {
      background: var(--text-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px var(--shadow-medium);
    }
  `,
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);
  protected readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
