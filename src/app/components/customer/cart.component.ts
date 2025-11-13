import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [DecimalPipe],
  template: `
    <div class="cart-container">
      <h1>Shopping Cart 🛒</h1>

      @if (cartService.totalItems() === 0) {
        <div class="empty-cart">
          <p>Your cart is empty</p>
          <button (click)="goToMenu()" class="btn-primary">Browse Menu</button>
        </div>
      } @else {
        <div class="cart-content">
          <div class="cart-items">
            @for (item of cartService.cartItems(); track item.menuItem.id) {
              <div class="cart-item">
                <img [src]="item.menuItem.imageUrl" [alt]="item.menuItem.name" />
                <div class="item-details">
                  <h3>{{ item.menuItem.name }}</h3>
                  <p class="item-price">₱{{ item.menuItem.price | number:'1.2-2' }}</p>
                </div>
                <div class="quantity-controls">
                  <button
                    (click)="updateQuantity(item.menuItem.id, item.quantity - 1)"
                    class="btn-quantity"
                  >
                    -
                  </button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <button
                    (click)="updateQuantity(item.menuItem.id, item.quantity + 1)"
                    class="btn-quantity"
                  >
                    +
                  </button>
                </div>
                <div class="item-total">
                  ₱{{ (item.menuItem.price * item.quantity) | number:'1.2-2' }}
                </div>
                <button
                  (click)="removeItem(item.menuItem.id)"
                  class="btn-remove"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            }
          </div>

          <div class="cart-summary">
            <h2>Order Summary</h2>
            <div class="summary-row">
              <span>Items ({{ cartService.totalItems() }})</span>
              <span>₱{{ cartService.totalAmount() | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Delivery Fee</span>
              <span>₱{{ 5.00 | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>₱{{ (cartService.totalAmount() + 5.00) | number:'1.2-2' }}</span>
            </div>
            <button (click)="proceedToCheckout()" class="btn-checkout">
              Proceed to Checkout
            </button>
            <button (click)="clearCart()" class="btn-clear">Clear Cart</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      margin-top: 4rem;
    }

    h1 {
      color: #6B3E2E;
      margin-bottom: 2rem;
    }

    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .empty-cart p {
      color: var(--light-brown);
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: grid;
      grid-template-columns: 100px 1fr auto auto auto;
      gap: 1rem;
      align-items: center;
    }

    .cart-item img {
      width: 100px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }

    .item-details h3 {
      color: #6B3E2E;
      margin-bottom: 0.25rem;
    }

    .item-price {
      color: var(--light-brown);
      font-size: 0.9rem;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-quantity {
      width: 32px;
      height: 32px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    }

    .btn-quantity:hover {
      background: #f8f9fa;
      border-color: #6B3E2E;
    }

    .quantity {
      min-width: 30px;
      text-align: center;
      font-weight: 600;
    }

    .item-total {
      font-weight: bold;
      color: #27ae60;
      font-size: 1.1rem;
    }

    .btn-remove {
      width: 32px;
      height: 32px;
      border: none;
      background: #e74c3c;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-remove:hover {
      background: #c0392b;
    }

    .cart-summary {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      height: fit-content;
    }

    .cart-summary h2 {
      color: #6B3E2E;
      margin-bottom: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }

    .summary-row.total {
      font-size: 1.25rem;
      font-weight: bold;
      color: #6B3E2E;
      border-bottom: none;
      padding-top: 1rem;
    }

    .btn-checkout {
      width: 100%;
      padding: 1rem;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
      transition: background-color 0.3s;
    }

    .btn-checkout:hover {
      background: #229954;
    }

    .btn-clear {
      width: 100%;
      padding: 0.75rem;
      background: white;
      color: #e74c3c;
      border: 2px solid #e74c3c;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: all 0.3s;
    }

    .btn-clear:hover {
      background: #e74c3c;
      color: white;
    }

    .btn-primary {
      padding: 0.75rem 2rem;
      background: var(--cream);
      color: #6B3E2E;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary:hover {
      background: Var(--buff);
    }

    @media (max-width: 768px) {
      .cart-content {
        grid-template-columns: 1fr;
      }

      .cart-item {
        grid-template-columns: 80px 1fr;
        grid-template-rows: auto auto;
      }

      .quantity-controls {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class CartComponent {
  protected readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  updateQuantity(menuItemId: string, quantity: number): void {
    this.cartService.updateQuantity(menuItemId, quantity);
  }

  removeItem(menuItemId: string): void {
    this.cartService.removeFromCart(menuItemId);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  goToMenu(): void {
    this.router.navigate(['/menu']);
  }
}
