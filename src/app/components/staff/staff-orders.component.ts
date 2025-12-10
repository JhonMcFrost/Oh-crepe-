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
      </div>

      <!-- Analytics Cards -->
      <div class="analytics-grid">
        <div class="analytics-card revenue">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>Today's Revenue</h3>
            <p class="card-value">₱{{ todayRevenue() | number:'1.2-2' }}</p>
            <span class="card-label">{{ todayOrdersTotal() }} orders</span>
          </div>
        </div>

        <div class="analytics-card profit">
          <div class="card-icon">📈</div>
          <div class="card-content">
            <h3>Today's Profit</h3>
            <p class="card-value">₱{{ todayProfit() | number:'1.2-2' }}</p>
            <span class="card-label">40% margin</span>
          </div>
        </div>

        <div class="analytics-card top-item">
          <div class="card-icon">🏆</div>
          <div class="card-content">
            <h3>Top Selling Item</h3>
            <p class="card-value">{{ topSellingProduct().name }}</p>
            <span class="card-label">{{ topSellingProduct().quantity }} sold</span>
          </div>
        </div>

        <div class="analytics-card pending">
          <div class="card-icon">⏳</div>
          <div class="card-content">
            <h3>Pending Orders</h3>
            <p class="card-value">{{ pendingTodayCount() }}</p>
            <span class="card-label">Requires attention</span>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <h2>Order Filters</h2>
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
      margin-bottom: 1.5rem;
    }

    .header h1 {
      color: #6B3E2E;
      margin-bottom: 0;
    }

    /* Analytics Cards */
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .analytics-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: transform 0.2s;
    }

    .analytics-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }

    .analytics-card.revenue {
      border-left: 4px solid #4CAF50;
    }

    .analytics-card.profit {
      border-left: 4px solid #2196F3;
    }

    .analytics-card.top-item {
      border-left: 4px solid #FF9800;
    }

    .analytics-card.pending {
      border-left: 4px solid #F44336;
    }

    .card-icon {
      font-size: 2.5rem;
      line-height: 1;
    }

    .card-content {
      flex: 1;
    }

    .card-content h3 {
      margin: 0 0 0.5rem 0;
      color: #6B3E2E;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-value {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #333;
      line-height: 1;
    }

    .card-label {
      font-size: 0.75rem;
      color: #888;
      display: block;
      margin-top: 0.25rem;
    }

    .filters-section {
      margin-bottom: 2rem;
    }

    .filters-section h2 {
      color: #6B3E2E;
      font-size: 1.25rem;
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

    @media (max-width: 968px) {
      .analytics-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }

      .analytics-card {
        padding: 1.25rem;
      }

      .card-icon {
        font-size: 2rem;
      }

      .card-value {
        font-size: 1.5rem;
      }

      .orders-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .staff-orders-container {
        padding: 1rem;
      }

      .analytics-card {
        flex-direction: column;
        text-align: center;
      }

      .card-content {
        width: 100%;
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

  // Analytics computed signals
  protected readonly todayOrders = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.allOrders().filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime() && order.status !== 'cancelled';
    });
  });

  protected readonly todayRevenue = computed(() => {
    return this.todayOrders().reduce((sum, order) => sum + order.totalAmount, 0);
  });

  protected readonly todayProfit = computed(() => {
    // Assuming 40% profit margin
    return this.todayRevenue() * 0.4;
  });

  protected readonly todayOrdersTotal = computed(() => {
    return this.todayOrders().length;
  });

  protected readonly pendingTodayCount = computed(() => {
    return this.todayOrders().filter(order => order.status === 'pending').length;
  });

  protected readonly topSellingProduct = computed(() => {
    const itemCounts = new Map<string, { name: string; quantity: number }>();
    
    this.todayOrders().forEach(order => {
      order.items.forEach(item => {
        const existing = itemCounts.get(item.menuItemId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          itemCounts.set(item.menuItemId, {
            name: item.menuItemName,
            quantity: item.quantity
          });
        }
      });
    });

    if (itemCounts.size === 0) {
      return { name: 'No sales yet', quantity: 0 };
    }

    let topItem = { name: '', quantity: 0 };
    itemCounts.forEach(item => {
      if (item.quantity > topItem.quantity) {
        topItem = item;
      }
    });

    return topItem;
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
