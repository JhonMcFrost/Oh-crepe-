import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

interface NavLink {
  route: string;
  label: string;
  class?: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  protected readonly authService = inject(AuthService);
  protected readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  protected readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  protected readonly isCustomer = computed(() => this.authService.isCustomer());
  protected readonly isStaff = computed(() => this.authService.isStaff());
  protected readonly isAdmin = computed(() => this.authService.isAdmin());
  protected readonly userName = computed(() => this.authService.currentUser()?.name);
  protected readonly cartItemCount = computed(() => this.cartService.totalItems());
  protected readonly hasCartItems = computed(() => this.cartItemCount() > 0);

  protected readonly navLinks = computed<NavLink[]>(() => {
    if (!this.isAuthenticated()) {
      return [
        { route: '/login', label: 'Login', class: 'nav-link' },
        { route: '/register', label: 'Sign Up', class: 'btn-primary' }
      ];
    }

    const links: NavLink[] = [];

    if (this.isCustomer()) {
      links.push(
        { route: '/menu', label: 'Menu', class: 'nav-link' },
        { route: '/my-orders', label: 'My Orders', class: 'nav-link' },
        { route: '/cart', label: 'Cart', class: 'nav-link' }
      );
    }

    if (this.isStaff()) {
      links.push({ route: '/staff/orders', label: 'Orders', class: 'nav-link' });
    }

    if (this.isAdmin()) {
      links.push(
        { route: '/admin/dashboard', label: 'Dashboard', class: 'nav-link' },
        { route: '/admin/menu', label: 'Manage Menu', class: 'nav-link' },
        { route: '/admin/users', label: 'Manage Users', class: 'nav-link' }
      );
    }

    return links;
  });

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

