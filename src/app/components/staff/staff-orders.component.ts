import { Component, inject, signal, computed } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-staff-orders',
  imports: [DatePipe, DecimalPipe, FormsModule],
  template: `
    <div class="staff-orders-container">
      <div class="header">
        <h1>Orders Management 📋</h1>
        <div class="filters">
          <button
            (click)="filterStatus.set('all')"
            [class.active]="filterStatus() === 'all'"
            class="filter-btn"
          >
            All Orders
          </button>
          <button
            (click)="filterStatus.set('active')"
            [class.active]="filterStatus() === 'active'"
            class="filter-btn"
          >
            Active ({{ activeOrdersCount() }})
          </button>
          <button
            (click)="filterStatus.set('pending')"
            [class.active]="filterStatus() === 'pending'"
            class="filter-btn"
          >
            Pending
          </button>
          <button
            (click)="filterStatus.set('preparing')"
            [class.active]="filterStatus() === 'preparing'"
            class="filter-btn"
          >
            Preparing
          </button>
        </div>
      </div>

      @if (successMessage()) {
        <div class="success-message">{{ successMessage() }}</div>
      }

      @if (filteredOrders().length === 0) {
        <div class="empty-state">
          <p>No orders to display</p>
        </div>
      } @else {
        <div class="orders-grid">
          @for (order of filteredOrders(); track order.id) {
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

              <div class="customer-info">
                <h4>Customer Details</h4>
                <p><strong>Name:</strong> {{ order.customerName }}</p>
                <p><strong>Phone:</strong> {{ order.customerPhone }}</p>
                <p><strong>Address:</strong> {{ order.customerAddress }}</p>
                @if (order.notes) {
                  <p class="notes"><strong>Notes:</strong> {{ order.notes }}</p>
                }
              </div>

              <div class="order-items">
                <h4>Items</h4>
                @for (item of order.items; track item.menuItemId) {
                  <div class="order-item">
                    <span>{{ item.menuItemName }} × {{ item.quantity }}</span>
                    <span>₱{{ (item.price * item.quantity) | number:'1.2-2' }}</span>
                  </div>
                }
                <div class="order-total">
                  <span>Total:</span>
                  <span>₱{{ order.totalAmount | number:'1.2-2' }}</span>
                </div>
              </div>

              <div class="order-actions">
                <label for="status-{{ order.id }}">Update Status:</label>
                <select
                  id="status-{{ order.id }}"
                  [value]="order.status"
                  (change)="updateOrderStatus(order.id, $event)"
                  class="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready for Pickup</option>
                  <option value="out-for-delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div class="payment-info">
                <span>Payment: {{ formatPaymentMethod(order.paymentMethod) }}</span>
                <span [class]="'payment-' + order.paymentStatus">
                  {{ formatPaymentStatus(order.paymentStatus) }}
                </span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .staff-orders-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      margin-top: 4rem;
    }

    .header {
      margin-bottom: 2rem;
    }

    .header h1 {
      color: #6B3E2E;
      margin-bottom: 1rem;
    }

    .filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      background: white;
      border: 2px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
    }

    .filter-btn:hover {
      border-color: #6B3E2E;
    }

    .filter-btn.active {
      background: var(--primary-brown);
      color: white;
      border-color: var(--cream);
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      color: #6B3E2E;
    }

    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
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
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .order-header h3 {
      color: #6B3E2E;
      margin-bottom: 0.25rem;
    }

    .order-date {
      color: var(--light-brown);
      font-size: 0.9rem;
    }

    .order-status {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .status-pending {
      background: var(--cream);
      color: #6B3E2E;
    }

    .status-preparing {
      background: var(--cream);
      color: #6B3E2E;
    }

    .status-ready {
      background: var(--cream);
      color: #6B3E2E;
    }

    .status-out-for-delivery {
      background: var(--cream);
      color: #6B3E2E;
    }

    .status-delivered {
      background: var(--cream);
      color: #6B3E2E;
    }

    .status-cancelled {
      background: var(--cream);
      color: #6B3E2E;
    }

    .customer-info,
    .order-items,
    .order-actions {
      margin-bottom: 1rem;
    }

    .customer-info h4,
    .order-items h4 {
      color: #6B3E2E;
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .customer-info p {
      color: var(--light-brown);
      font-size: 0.9rem;
      margin: 0.25rem 0;
    }

    .notes {
      font-style: italic;
      color: var(--light-brown);
      margin-top: 0.5rem;
    }

    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: var(--light-brown);
      font-size: 0.9rem;
    }

    .order-total {
      display: flex;
      justify-content: space-between;
      padding-top: 0.5rem;
      margin-top: 0.5rem;
      border-top: 1px solid #eee;
      font-weight: bold;
      color: var(--light-brown);
    }

    .order-actions {
      padding: 1rem 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }

    .order-actions label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--light-brown);
    }

    .status-select {
      width: 100%;
      padding: 0.5rem;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: border-color 0.3s;
    }

    .status-select:focus {
      outline: none;
      border-color: var(--cream);
    }

    .payment-info {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
      font-size: 0.9rem;
      color: #6B3E2E;
    }

    .payment-paid {
      color: #27ae60;
      font-weight: 600;
    }

    .payment-pending {
      color: #f39c12;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .orders-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class StaffOrdersComponent {
  private readonly orderService = inject(OrderService);

  protected readonly filterStatus = signal<string>('active');
  protected readonly successMessage = signal('');

  protected readonly allOrders = computed(() => {
    return this.orderService
      .getAllOrders()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  protected readonly activeOrdersCount = computed(() => {
    return this.allOrders().filter(
      (order) => order.status !== 'delivered' && order.status !== 'cancelled'
    ).length;
  });

  protected readonly filteredOrders = computed(() => {
    const filter = this.filterStatus();
    const orders = this.allOrders();

    if (filter === 'all') {
      return orders;
    } else if (filter === 'active') {
      return orders.filter(
        (order) => order.status !== 'delivered' && order.status !== 'cancelled'
      );
    } else {
      return orders.filter((order) => order.status === filter);
    }
  });

  updateOrderStatus(orderId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as OrderStatus;

    const success = this.orderService.updateOrderStatus(orderId, newStatus);

    if (success) {
      this.successMessage.set(`Order #${orderId} status updated to ${this.getStatusLabel(newStatus)}`);

      setTimeout(() => {
        this.successMessage.set('');
      }, 3000);
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

  formatPaymentMethod(method: string): string {
    return method === 'gcash' ? 'GCash' : 'Cash on Delivery';
  }

  formatPaymentStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
