import { Component, inject } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus } from '../../models/order.model';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-my-orders',
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="my-orders-container">
      <h1>My Orders 📦</h1>

      @if (orders.length === 0) {
        <div class="empty-state">
          <p>You haven't placed any orders yet.</p>
          <button (click)="goToMenu()" class="btn-primary">Browse Menu</button>
        </div>
      } @else {
        <div class="orders-list">
          @for (order of orders; track order.id) {
            <div class="order-card">
              <div class="order-header">
                <div>
                  <h3>Order #{{ order.id }}</h3>
                  <p class="order-date">{{ order.createdAt | date : 'medium' }}</p>
                </div>
                <div class="order-status" [class]="'status-' + order.status">
                  {{ getStatusLabel(order.status) }}
                </div>
              </div>

              <div class="order-progress">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    [style.width.%]="getProgressPercent(order.status)"
                  ></div>
                </div>
                <div class="progress-steps">
                  <div class="step" [class.active]="getStepActive(order.status, 0)">
                    <div class="step-icon">📝</div>
                    <div class="step-label">Pending</div>
                  </div>
                  <div class="step" [class.active]="getStepActive(order.status, 1)">
                    <div class="step-icon">👨‍🍳</div>
                    <div class="step-label">Preparing</div>
                  </div>
                  <div class="step" [class.active]="getStepActive(order.status, 2)">
                    <div class="step-icon">✅</div>
                    <div class="step-label">Ready</div>
                  </div>
                  <div class="step" [class.active]="getStepActive(order.status, 3)">
                    <div class="step-icon">🚚</div>
                    <div class="step-label">Delivering</div>
                  </div>
                  <div class="step" [class.active]="getStepActive(order.status, 4)">
                    <div class="step-icon">🎉</div>
                    <div class="step-label">Delivered</div>
                  </div>
                </div>
              </div>

              <div class="order-items">
                <h4>Items:</h4>
                @for (item of order.items; track item.menuItemId) {
                  <div class="order-item">
                    <span>{{ item.menuItemName }} × {{ item.quantity }}</span>
                    <span>₱{{ (item.price * item.quantity) | number:'1.2-2' }}</span>
                  </div>
                }
              </div>

              <div class="order-footer">
                <div class="order-total">
                  <span>Total:</span>
                  <span class="total-amount">₱{{ order.totalAmount | number:'1.2-2' }}</span>
                </div>
                @if (order.estimatedDeliveryTime && order.status !== 'delivered' && order.status !== 'cancelled') {
                  <div class="estimated-time">
                    <span>Estimated Delivery:</span>
                    <span>{{ order.estimatedDeliveryTime | date : 'short' }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .my-orders-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      margin-top: 4rem;
    }

    h1 {
      color: #6B3E2E;
      margin-bottom: 2rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .empty-state p {
      color: #6B3E2E;
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .btn-primary {
      padding: 0.75rem 2rem;
      background: #f39c12;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary:hover {
      background: #e67e22;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .order-header h3 {
      color: #6B3E2E;
      margin-bottom: 0.25rem;
    }

    .order-date {
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .order-status {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .status-pending {
      background: #fff3cd;
      color: #6B3E2E;
    }

    .status-preparing {
      background: #cfe2ff;
      color: #6B3E2E;
    }

    .status-ready {
      background: #d1e7dd;
      color: #6B3E2E;
    }

    .status-out-for-delivery {
      background: #e7d1ff;
      color: #6B3E2E;
    }

    .status-delivered {
      background: var(--cream);
      color: #6B3E2E;
    }

    .status-cancelled {
      background: #f8d7da;
      color: #6B3E2E;
    }

    .order-progress {
      margin-bottom: 1.5rem;
    }

    .progress-bar {
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--text-light) 0%, #6B3E2E 100%);
      transition: width 0.5s ease;
    }

    .progress-steps {
      display: flex;
      justify-content: space-between;
    }

    .step {
      text-align: center;
      flex: 1;
      opacity: 0.4;
      transition: opacity 0.3s;
    }

    .step.active {
      opacity: 1;
    }

    .step-icon {
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
    }

    .step-label {
      font-size: 0.75rem;
      color: #6B3E2E;
      font-weight: 600;
    }

    .order-items {
      margin-bottom: 1rem;
    }

    .order-items h4 {
      color: #6B3E2E;
      margin-bottom: 0.75rem;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: #6B3E2E;
    }

    .order-footer {
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .order-total {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      color: #6B3E2E;
      margin-bottom: 0.5rem;
    }

    .total-amount {
      color: #27ae60;
      font-size: 1.25rem;
    }

    .estimated-time {
      display: flex;
      justify-content: space-between;
      color: #7f8c8d;
      font-size: 0.9rem;
    }
  `,
})
export class MyOrdersComponent {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);

  protected readonly orders: Order[] = [];

  constructor() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.orders = this.orderService
        .getOrdersByCustomerId(currentUser.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pending',
      preparing: 'Preparing',
      ready: 'Ready for Pickup',
      'out-for-delivery': 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return labels[status];
  }

  getProgressPercent(status: OrderStatus): number {
    const progress: Record<OrderStatus, number> = {
      pending: 20,
      preparing: 40,
      ready: 60,
      'out-for-delivery': 80,
      delivered: 100,
      cancelled: 0,
    };
    return progress[status];
  }

  getStepActive(status: OrderStatus, step: number): boolean {
    const statusOrder: OrderStatus[] = [
      'pending',
      'preparing',
      'ready',
      'out-for-delivery',
      'delivered',
    ];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= step;
  }

  goToMenu(): void {
    window.location.href = '/menu';
  }
}
