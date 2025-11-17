import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';

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

        <div class="divider">
          <span>OR</span>
        </div>

        <div class="oauth-buttons">
          <button (click)="signInWithGoogle()" class="btn-oauth btn-google" [disabled]="isOAuthLoading()">
            @if (isOAuthLoading()) {
              <span>Signing in...</span>
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
              <span>Signing in...</span>
            } @else {
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            }
          </button>
        </div>

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
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly firebaseAuthService = inject(FirebaseAuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly errorMessage = signal('');
  protected readonly isOAuthLoading = signal(false);

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

  async signInWithGoogle(): Promise<void> {
    this.isOAuthLoading.set(true);
    this.errorMessage.set('');
    
    try {
      await this.firebaseAuthService.signInWithGoogle();
      this.redirectBasedOnRole();
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to sign in with Google');
    } finally {
      this.isOAuthLoading.set(false);
    }
  }

  async signInWithFacebook(): Promise<void> {
    this.isOAuthLoading.set(true);
    this.errorMessage.set('');
    
    try {
      await this.firebaseAuthService.signInWithFacebook();
      this.redirectBasedOnRole();
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Failed to sign in with Facebook');
    } finally {
      this.isOAuthLoading.set(false);
    }
  }
}
