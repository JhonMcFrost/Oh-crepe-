import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>🥞 Oh Crepe! Login</h1>
        <p class="subtitle">Welcome back! Please login to your account.</p>

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }

        <form (ngSubmit)="login()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="Enter your email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" class="btn-submit">Login</button>
        </form>

        <div class="demo-accounts">
          <p><strong>Demo Accounts:</strong></p>
          <div class="demo-grid">
            <button (click)="quickLogin('customer@ofos.com')" class="btn-demo">
              Customer
            </button>
            <button (click)="quickLogin('staff@ofos.com')" class="btn-demo">
              Staff
            </button>
            <button (click)="quickLogin('admin@ofos.com')" class="btn-demo">
              Admin
            </button>
          </div>
        </div>

        <p class="register-link">
          Don't have an account? <a routerLink="/register">Sign up here</a>
        </p>
      </div>
    </div>
  `,
  styles: `
    .login-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, var(--papaya-whip) 0%, var(--sunset) 100%);
      padding: 2rem;
    }

    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(212, 163, 115, 0.3);
      width: 100%;
      max-width: 400px;
      border: 3px solid var(--cream);
    }

    h1 {
      text-align: center;
      color: var(--dark-brown);
      margin-bottom: 0.5rem;
    }

    .subtitle {
      text-align: center;
      color: var(--text-light);
      margin-bottom: 2rem;
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--dark-brown);
      font-weight: 600;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid var(--border-beige);
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
      transition: all 0.3s;
    }

    input:focus {
      outline: none;
      border-color: var(--buff);
      box-shadow: 0 0 0 3px rgba(212, 163, 115, 0.1);
    }

    .btn-submit {
      width: 100%;
      padding: 0.75rem;
      background: var(--buff);
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px var(--shadow-light);
    }

    .btn-submit:hover {
      background: var(--dark-brown);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px var(--shadow-medium);
    }

    .demo-accounts {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-beige);
    }

    .demo-accounts p {
      text-align: center;
      color: var(--text-light);
      margin-bottom: 1rem;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .btn-demo {
      padding: 0.5rem;
      background: var(--light-yellow);
      border: 2px solid var(--border-beige);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
      color: var(--text-medium);
    }

    .btn-demo:hover {
      background: var(--cream);
      border-color: var(--buff);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px var(--shadow-light);
    }

    .register-link {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--text-light);
    }

    .register-link a {
      color: var(--buff);
      text-decoration: none;
      font-weight: 600;
    }

    .register-link a:hover {
      text-decoration: underline;
      color: var(--dark-brown);
    }
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly errorMessage = signal('');

  login(): void {
    const success = this.authService.login(this.email, this.password);

    if (success) {
      this.redirectBasedOnRole();
    } else {
      this.errorMessage.set('Invalid email or password');
    }
  }

  quickLogin(email: string): void {
    this.email = email;
    this.password = 'password'; // Demo password
    this.login();
  }

  private redirectBasedOnRole(): void {
    if (this.authService.isCustomer()) {
      this.router.navigate(['/menu']);
    } else if (this.authService.isStaff()) {
      this.router.navigate(['/staff/orders']);
    } else if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/menu']);
    }
  }
}
