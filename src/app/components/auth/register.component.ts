import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h1>🥞 Join Oh Crepe!</h1>
        <p class="subtitle">Create your account and start enjoying delicious crepes!</p>

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }

        @if (successMessage()) {
          <div class="success-message">{{ successMessage() }}</div>
        }

        <form (ngSubmit)="register()">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              type="text"
              id="name"
              [(ngModel)]="name"
              name="name"
              required
              placeholder="Enter your full name"
            />
          </div>

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
            <label for="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              [(ngModel)]="phone"
              name="phone"
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div class="form-group">
            <label for="address">Address</label>
            <textarea
              id="address"
              [(ngModel)]="address"
              name="address"
              required
              placeholder="Enter your delivery address"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="Create a password"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" class="btn-submit" [disabled]="isLoading()">
            @if (isLoading()) {
              Creating Account...
            } @else {
              Create Account
            }
          </button>
        </form>

        <p class="login-link">
          Already have an account? <a routerLink="/login">Sign in here</a>
        </p>
      </div>
    </div>
  `,
  styles: `
    .register-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, var(--papaya-whip) 0%, var(--sunset) 100%);
      padding: 2rem;
    }

    .register-card {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(212, 163, 115, 0.3);
      width: 100%;
      max-width: 500px;
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

    .success-message {
      background: #efe;
      color: #060;
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

    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid var(--border-beige);
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
      transition: all 0.3s;
      font-family: inherit;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: var(--buff);
      box-shadow: 0 0 0 3px rgba(212, 163, 115, 0.1);
    }

    textarea {
      resize: vertical;
      min-height: 80px;
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

    .btn-submit:hover:not(:disabled) {
      background: var(--dark-brown);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px var(--shadow-medium);
    }

    .btn-submit:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .login-link {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--text-light);
    }

    .login-link a {
      color: var(--buff);
      text-decoration: none;
      font-weight: 600;
    }

    .login-link a:hover {
      text-decoration: underline;
      color: var(--dark-brown);
    }

    @media (max-width: 480px) {
      .register-container {
        padding: 1rem;
      }
      
      .register-card {
        padding: 1.5rem;
      }
    }
  `,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected name = '';
  protected email = '';
  protected phone = '';
  protected address = '';
  protected password = '';
  protected confirmPassword = '';
  
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly isLoading = signal(false);

  register(): void {
    // Reset messages
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validation
    if (!this.validateForm()) {
      return;
    }

    this.isLoading.set(true);

    // Simulate API call delay
    setTimeout(() => {
      const newUser = this.authService.register(
        this.email,
        this.name,
        this.phone,
        this.address
      );

      this.isLoading.set(false);

      if (newUser) {
        this.successMessage.set('Account created successfully! Redirecting...');
        
        // Redirect to menu after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/menu']);
        }, 2000);
      } else {
        this.errorMessage.set('Email already exists. Please use a different email.');
      }
    }, 1000);
  }

  private validateForm(): boolean {
    if (!this.name.trim()) {
      this.errorMessage.set('Please enter your full name');
      return false;
    }

    if (!this.email.trim()) {
      this.errorMessage.set('Please enter your email');
      return false;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage.set('Please enter a valid email address');
      return false;
    }

    if (!this.phone.trim()) {
      this.errorMessage.set('Please enter your phone number');
      return false;
    }

    if (!this.address.trim()) {
      this.errorMessage.set('Please enter your address');
      return false;
    }

    if (!this.password.trim()) {
      this.errorMessage.set('Please enter a password');
      return false;
    }

    if (this.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long');
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return false;
    }

    return true;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}