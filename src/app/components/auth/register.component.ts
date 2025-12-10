import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';

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

        <div class="divider">
          <span>OR</span>
        </div>

        <div class="oauth-buttons">
          <button (click)="signInWithGoogle()" class="btn-oauth btn-google" [disabled]="isOAuthLoading()">
            @if (isOAuthLoading()) {
              <span>Signing up...</span>
            } @else {
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.582 9 3.582z"/>
              </svg>
              <span>Continue with Google</span>
            }
          </button>
          <button (click)="signInWithFacebook()" class="btn-oauth btn-facebook" [disabled]="isOAuthLoading()">
            @if (isOAuthLoading()) {
              <span>Signing up...</span>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            }
          </button>
        </div>

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
      margin-top: 4rem;
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

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 2rem 0 1.5rem;
      color: var(--text-light);
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--cream);
    }

    .divider span {
      padding: 0 1rem;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .oauth-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .btn-oauth {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      border: 2px solid var(--cream);
      border-radius: 8px;
      background: white;
      color: var(--text-dark);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-oauth:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .btn-oauth:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-google:hover:not(:disabled) {
      border-color: #4285F4;
      background: #f8f9fa;
    }

    .btn-facebook {
      color: #1877F2;
    }

    .btn-facebook:hover:not(:disabled) {
      border-color: #1877F2;
      background: #f0f5ff;
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
  private readonly firebaseAuthService = inject(FirebaseAuthService);
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
  protected readonly isOAuthLoading = signal(false);

  async register(): Promise<void> {
    // Reset messages
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validation
    if (!this.validateForm()) {
      return;
    }

    this.isLoading.set(true);

    try {
      await this.firebaseAuthService.registerWithEmail(
        this.email,
        this.password,
        this.name,
        this.phone,
        this.address
      );

      this.successMessage.set('Account created successfully! Redirecting...');
      
      // Redirect to menu after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/menu']);
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      this.errorMessage.set(error.message || 'Failed to create account. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
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

  async signInWithGoogle(): Promise<void> {
    this.isOAuthLoading.set(true);
    this.errorMessage.set('');
    
    try {
      await this.firebaseAuthService.signInWithGoogle();
      this.successMessage.set('Account created successfully! Redirecting...');
      
      setTimeout(() => {
        this.router.navigate(['/menu']);
      }, 1500);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to sign up with Google');
    } finally {
      this.isOAuthLoading.set(false);
    }
  }

  async signInWithFacebook(): Promise<void> {
    this.isOAuthLoading.set(true);
    this.errorMessage.set('');
    
    try {
      await this.firebaseAuthService.signInWithFacebook();
      this.successMessage.set('Account created successfully! Redirecting...');
      
      setTimeout(() => {
        this.router.navigate(['/menu']);
      }, 1500);
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to sign up with Facebook');
    } finally {
      this.isOAuthLoading.set(false);
    }
  }
}