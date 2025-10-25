import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-order-confirmation',
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="confirmation-container">
      @if (order) {
        <div class="confirmation-card">
          <div class="success-icon">✅</div>
          <h1>Order Placed Successfully!</h1>
          <p class="order-id">Order #{{ order.id }}</p>

          <div class="order-details">
            <h2>Order Details</h2>
            <div class="detail-row">
              <span>Order Date:</span>
              <span>{{ order.createdAt | date : 'medium' }}</span>
            </div>
            <div class="detail-row">
              <span>Estimated Delivery:</span>
              <span>{{ order.estimatedDeliveryTime | date : 'short' }}</span>
            </div>
            <div class="detail-row">
              <span>Payment Method:</span>
              <span>{{ formatPaymentMethod(order.paymentMethod) }}</span>
            </div>
            <div class="detail-row">
              <span>Payment Status:</span>
              <span [class]="'status-' + order.paymentStatus">
                {{ formatPaymentStatus(order.paymentStatus) }}
              </span>
            </div>
          </div>

          <div class="delivery-info">
            <h2>Delivery Information</h2>
            <p><strong>Name:</strong> {{ order.customerName }}</p>
            <p><strong>Phone:</strong> {{ order.customerPhone }}</p>
            <p><strong>Address:</strong> {{ order.customerAddress }}</p>
          </div>

          <div class="order-items">
            <h2>Order Items</h2>
            @for (item of order.items; track item.menuItemId) {
              <div class="order-item">
                <span>{{ item.menuItemName }} × {{ item.quantity }}</span>
                <span>₱{{ (item.price * item.quantity) | number:'1.2-2' }}</span>
              </div>
            }
            <div class="order-total">
              <span>Total Amount</span>
              <span>₱{{ order.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="actions">
            <button (click)="trackOrder()" class="btn-primary">Track Order</button>
            <button (click)="goToMenu()" class="btn-secondary">Back to Menu</button>
          </div>
        </div>
      } @else {
        <div class="error-card">
          <p>Order not found</p>
          <button (click)="goToMenu()" class="btn-primary">Go to Menu</button>
        </div>
      }
    </div>
  `,
  styles: `
    .confirmation-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .confirmation-card,
    .error-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      padding: 2rem;
      max-width: 600px;
      width: 100%;
    }

    .success-icon {
      font-size: 4rem;
      text-align: center;
      margin-bottom: 1rem;
    }

    h1 {
      color: #2c3e50;
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .order-id {
      text-align: center;
      color: #7f8c8d;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .order-details,
    .delivery-info,
    .order-items {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    h2 {
      color: #2c3e50;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: #555;
    }

    .detail-row span:last-child {
      font-weight: 600;
    }

    .status-paid {
      color: #27ae60;
    }

    .status-pending {
      color: #f39c12;
    }

    .delivery-info p {
      color: #555;
      margin: 0.5rem 0;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: #555;
    }

    .order-total {
      display: flex;
      justify-content: space-between;
      padding-top: 1rem;
      margin-top: 1rem;
      border-top: 2px solid #eee;
      font-weight: bold;
      color: #2c3e50;
      font-size: 1.1rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-primary,
    .btn-secondary {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #27ae60;
      color: white;
    }

    .btn-primary:hover {
      background: #229954;
    }

    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-secondary:hover {
      background: #667eea;
      color: white;
    }

    .error-card {
      text-align: center;
    }

    .error-card p {
      color: #e74c3c;
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }
  `,
})
export class OrderConfirmationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);

  protected order: Order | undefined;

  constructor() {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
      this.order = this.orderService.getOrderById(orderId);
    }
  }

  trackOrder(): void {
    if (this.order) {
      this.router.navigate(['/my-orders']);
    }
  }

  goToMenu(): void {
    this.router.navigate(['/menu']);
  }

  formatPaymentMethod(method: string): string {
    return method === 'online' ? 'Online Payment' : 'Cash on Delivery';
  }

  formatPaymentStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
