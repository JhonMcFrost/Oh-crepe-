import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { PaymentMethod, OrderItem } from '../../models/order.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-checkout',
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="checkout-container">
      <h1>Checkout 💳</h1>

      <div class="checkout-content">
        <div class="checkout-form">
          <div class="section">
            <h2>Delivery Information</h2>
            <div class="form-group">
              <label for="name">Full Name</label>
              <input
                type="text"
                id="name"
                [(ngModel)]="name"
                required
                placeholder="Enter your full name"
              />
            </div>

            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                [(ngModel)]="phone"
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div class="form-group">
              <label for="address">Delivery Address</label>
              <textarea
                id="address"
                [(ngModel)]="address"
                required
                placeholder="Enter your complete delivery address"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="notes">Order Notes (Optional)</label>
              <textarea
                id="notes"
                [(ngModel)]="notes"
                placeholder="Any special instructions?"
                rows="2"
              ></textarea>
            </div>
          </div>

          <div class="section">
            <h2>Payment Method</h2>
            <div class="payment-options">
              <label class="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="gcash"
                  [(ngModel)]="paymentMethod"
                />
                <span>💳 GCash</span>
              </label>
              <label class="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cash-on-delivery"
                  [(ngModel)]="paymentMethod"
                />
                <span>💵 Cash on Delivery</span>
              </label>
            </div>
          </div>

          @if (errorMessage()) {
            <div class="error-message">{{ errorMessage() }}</div>
          }
        </div>

        <div class="order-summary">
          <h2>Order Summary</h2>

          <div class="summary-items">
            @for (item of cartService.cartItems(); track item.menuItem.id) {
              <div class="summary-item">
                <span>{{ item.menuItem.name }} × {{ item.quantity }}</span>
                <span>₱{{ (item.menuItem.price * item.quantity) | number:'1.2-2' }}</span>
              </div>
            }
          </div>

          <div class="summary-totals">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₱{{ cartService.totalAmount() | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Delivery Fee</span>
              <span>₱{{ deliveryFee | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>₱{{ (cartService.totalAmount() + deliveryFee) | number:'1.2-2' }}</span>
            </div>
          </div>

          <button (click)="placeOrder()" [disabled]="isProcessing()" class="btn-place-order">
            @if (isProcessing()) {
              Processing...
            } @else {
              Place Order
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      margin-top: 4rem;
    }

    h1 {
      color: #2c3e50;
      margin-bottom: 2rem;
    }

    .checkout-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .section h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.25rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 600;
    }

    input,
    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus,
    textarea:focus {
      outline: none;
      border-color: #f39c12;
    }

    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .payment-option {
      display: flex;
      align-items: center;
      padding: 1rem;
      border: 2px solid #ddd;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .payment-option:hover {
      border-color: #f39c12;
    }

    .payment-option input[type='radio'] {
      width: auto;
      margin-right: 0.75rem;
    }

    .payment-option span {
      font-weight: 600;
      color: #2c3e50;
    }

    .order-summary {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      height: fit-content;
    }

    .order-summary h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
      font-size: 1.25rem;
    }

    .summary-items {
      border-bottom: 1px solid #eee;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: #7f8c8d;
    }

    .summary-totals {
      padding-bottom: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
    }

    .summary-row.total {
      font-size: 1.25rem;
      font-weight: bold;
      color: #2c3e50;
      border-top: 2px solid #eee;
      padding-top: 1rem;
      margin-top: 0.5rem;
    }

    .btn-place-order {
      width: 100%;
      padding: 1rem;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-place-order:hover:not(:disabled) {
      background: #229954;
    }

    .btn-place-order:disabled {
      background: #95a5a6;
      cursor: not-allowed;
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 1rem;
      border-radius: 4px;
      text-align: center;
    }

    @media (max-width: 768px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class CheckoutComponent {
  protected readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly deliveryFee = 50;
  protected readonly isProcessing = signal(false);
  protected readonly errorMessage = signal('');

  protected name = this.authService.currentUser()?.name || '';
  protected phone = this.authService.currentUser()?.phone || '';
  protected address = this.authService.currentUser()?.address || '';
  protected notes = '';
  protected paymentMethod: PaymentMethod = 'cash-on-delivery';

  placeOrder(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.errorMessage.set('You must be logged in to place an order');
      this.isProcessing.set(false);
      return;
    }

    const orderItems: OrderItem[] = this.cartService.cartItems().map((item) => ({
      menuItemId: item.menuItem.id,
      menuItemName: item.menuItem.name,
      quantity: item.quantity,
      price: item.menuItem.price,
    }));

    // Simulate payment processing delay
    setTimeout(() => {
      const order = this.orderService.createOrder(
        currentUser.id,
        this.name,
        this.phone,
        this.address,
        orderItems,
        this.paymentMethod,
        this.notes || undefined
      );

      this.cartService.clearCart();
      this.isProcessing.set(false);

      // Navigate to order confirmation
      this.router.navigate(['/order-confirmation', order.id]);
    }, 1500);
  }

  private validateForm(): boolean {
    if (!this.name.trim()) {
      this.errorMessage.set('Please enter your name');
      return false;
    }

    if (!this.phone.trim()) {
      this.errorMessage.set('Please enter your phone number');
      return false;
    }

    if (!this.address.trim()) {
      this.errorMessage.set('Please enter your delivery address');
      return false;
    }

    if (this.cartService.totalItems() === 0) {
      this.errorMessage.set('Your cart is empty');
      return false;
    }

    return true;
  }
}
