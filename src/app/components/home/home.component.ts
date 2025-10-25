import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="home-container">
      <div class="hero">
        <img src="/assets/images/oh_crepe_logo.png" alt="Oh Crêpe Logo" class="hero-logo">
        <h1>Welcome to Oh Crepe!</h1>
        <p class="tagline">Your favorite online food ordering system</p>
        <p class="description">
          Delicious crepes delivered right to your door. Browse our menu, place orders, and
          track your delivery in real-time.
        </p>
        <div class="cta-buttons">
          <a routerLink="/menu" class="btn-primary">Browse Menu</a>
          <a routerLink="/register" class="btn-secondary">Sign Up</a>
          <a routerLink="/login" class="btn-tertiary">Sign In</a>
        </div>
      </div>

      <div class="features">
        <h2>Why Choose Oh Crepe?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🍽️</div>
            <h3>Wide Menu Selection</h3>
            <p>Choose from our variety of sweet and savory crepes</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🚚</div>
            <h3>Fast Delivery</h3>
            <p>Get your order delivered hot and fresh to your doorstep</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Easy Ordering</h3>
            <p>Simple and intuitive ordering process</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">💳</div>
            <h3>Secure Payment</h3>
            <p>Multiple payment options for your convenience</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📦</div>
            <h3>Order Tracking</h3>
            <p>Track your order status in real-time</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⭐</div>
            <h3>Quality Service</h3>
            <p>Committed to providing the best customer experience</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .home-container {
      min-height: 100vh;
    }

    .hero {
      background: linear-gradient(135deg, var(--papaya-whip) 0%, var(--sunset) 100%);
      color: var(--dark-brown);
      text-align: center;
      padding: 2rem 2rem;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0c16.5685 0 30 13.4315 30 30 0 16.5685-13.4315 30-30 30C13.4315 60 0 46.5685 0 30 0 13.4315 13.4315 0 30 0zm0 58C45.464 58 58 45.464 58 30 58 14.536 45.464 2 30 2 14.536 2 2 14.536 2 30c0 15.464 12.536 28 28 28z' fill='%23D4A373' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E") repeat;
      opacity: 0.3;
    }

    .hero h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(212, 163, 115, 0.2);
      position: relative;
      z-index: 1;
    }

    .hero-logo {
      height: 16rem;
      width: 16rem;
      object-fit: contain;
      filter: drop-shadow(2px 2px 4px rgba(212, 163, 115, 0.3));
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    .tagline {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      opacity: 0.95;
      position: relative;
      z-index: 1;
    }

    .description {
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto 2rem;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      position: relative;
      z-index: 1;
    }

    .btn-primary,
    .btn-secondary,
    .btn-tertiary {
      padding: 1rem 2.5rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(212, 163, 115, 0.2);
    }

    .btn-primary {
      background: var(--buff);
      color: white;
    }

    .btn-primary:hover {
      background: var(--dark-brown);
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(212, 163, 115, 0.3);
    }

    .btn-secondary {
      background: white;
      color: var(--dark-brown);
      border: 2px solid var(--buff);
    }

    .btn-secondary:hover {
      background: var(--buff);
      color: white;
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(212, 163, 115, 0.3);
    }

    .btn-tertiary {
      background: transparent;
      color: var(--dark-brown);
      border: 2px solid var(--dark-brown);
    }

    .btn-tertiary:hover {
      background: var(--dark-brown);
      color: white;
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(212, 163, 115, 0.3);
    }

    .features {
      max-width: 1200px;
      margin: 0 auto;
      padding: 4rem 2rem;
    }

    .features h2 {
      text-align: center;
      color: var(--dark-brown);
      font-size: 2.5rem;
      margin-bottom: 3rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px var(--shadow-light);
      text-align: center;
      transition: all 0.3s;
      border: 2px solid var(--cream);
    }

    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 24px var(--shadow-medium);
      border-color: var(--buff);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      filter: drop-shadow(2px 2px 4px var(--shadow-light));
    }

    .feature-card h3 {
      color: var(--dark-brown);
      margin-bottom: 0.5rem;
    }

    .feature-card p {
      color: var(--text-light);
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }

      .tagline {
        font-size: 1.2rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class HomeComponent {}
