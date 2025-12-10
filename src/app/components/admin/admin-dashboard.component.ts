import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DecimalPipe],
  template: `
    <div class="admin-dashboard-container">
      <div class="header">
        <h1>Admin Dashboard 📊</h1>
        <p class="subtitle">Business Performance Overview</p>
      </div>

      <!-- Main Analytics Grid -->
      <div class="analytics-grid">
        <div class="analytics-card revenue">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <h3>Today's Revenue</h3>
            <p class="card-value">₱{{ todayRevenue() | number:'1.2-2' }}</p>
            <span class="card-label">{{ todayOrdersCount() }} orders completed</span>
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

        <div class="analytics-card users">
          <div class="card-icon">👥</div>
          <div class="card-content">
            <h3>Total Users</h3>
            <p class="card-value">{{ totalUsers() }}</p>
            <span class="card-label">{{ totalCustomers() }} customers, {{ totalStaff() }} staff</span>
          </div>
        </div>

        <div class="analytics-card items">
          <div class="card-icon">🍽️</div>
          <div class="card-content">
            <h3>Menu Items</h3>
            <p class="card-value">{{ totalMenuItems() }}</p>
            <span class="card-label">{{ availableItems() }} available</span>
          </div>
        </div>
      </div>

      <!-- Weekly & Monthly Stats -->
      <div class="stats-row">
        <div class="stats-card">
          <h3>Weekly Revenue</h3>
          <p class="stat-value">₱{{ weeklyRevenue() | number:'1.2-2' }}</p>
          <span class="stat-change" [class.positive]="weeklyGrowth() >= 0">
            {{ weeklyGrowth() >= 0 ? '↑' : '↓' }} {{ Math.abs(weeklyGrowth()) | number:'1.1-1' }}%
          </span>
        </div>

        <div class="stats-card">
          <h3>Monthly Revenue</h3>
          <p class="stat-value">₱{{ monthlyRevenue() | number:'1.2-2' }}</p>
          <span class="stat-change" [class.positive]="monthlyGrowth() >= 0">
            {{ monthlyGrowth() >= 0 ? '↑' : '↓' }} {{ Math.abs(monthlyGrowth()) | number:'1.1-1' }}%
          </span>
        </div>

        <div class="stats-card">
          <h3>Avg Order Value</h3>
          <p class="stat-value">₱{{ averageOrderValue() | number:'1.2-2' }}</p>
          <span class="stat-label">Based on all orders</span>
        </div>

        <div class="stats-card">
          <h3>Pending Orders</h3>
          <p class="stat-value">{{ pendingOrdersCount() }}</p>
          <span class="stat-label">Requires attention</span>
        </div>
      </div>

      <!-- Top Sellers -->
      <div class="top-items-section">
        <h2>Top Selling Items This Week</h2>
        <div class="top-items-grid">
          @for (item of topSellingItems(); track item.name; let idx = $index) {
            <div class="top-item-card" [style.--rank]="idx + 1">
              <div class="rank-badge">{{ idx + 1 }}</div>
              <h4>{{ item.name }}</h4>
              <div class="item-stats">
                <span class="sold">{{ item.quantity }} sold</span>
                <span class="revenue">₱{{ item.revenue | number:'1.2-2' }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="key-metrics">
        <h2>Key Performance Indicators</h2>
        <div class="metrics-grid">
          <div class="metric">
            <span class="metric-label">Order Completion Rate</span>
            <div class="metric-bar">
              <div class="metric-fill" [style.width.%]="orderCompletionRate()"></div>
            </div>
            <span class="metric-value">{{ orderCompletionRate() | number:'1.1-1' }}%</span>
          </div>

          <div class="metric">
            <span class="metric-label">Customer Satisfaction</span>
            <div class="metric-bar">
              <div class="metric-fill" [style.width.%]="customerSatisfaction()"></div>
            </div>
            <span class="metric-value">{{ customerSatisfaction() | number:'1.1-1' }}%</span>
          </div>

          <div class="metric">
            <span class="metric-label">Menu Item Availability</span>
            <div class="metric-bar">
              <div class="metric-fill" [style.width.%]="menuAvailabilityRate()"></div>
            </div>
            <span class="metric-value">{{ menuAvailabilityRate() | number:'1.1-1' }}%</span>
          </div>

          <div class="metric">
            <span class="metric-label">Average Prep Time</span>
            <div class="metric-bar">
              <div class="metric-fill" [style.width.%]="Math.min((averagePrepTime() / 60) * 100, 100)"></div>
            </div>
            <span class="metric-value">{{ averagePrepTime() | number:'1.0-0' }} min</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .admin-dashboard-container {
      max-width: 1600px;
      margin: 0 auto;
      padding: 2rem;
      margin-top: 4rem;
    }

    .header {
      margin-bottom: 2.5rem;
    }

    .header h1 {
      color: #6B3E2E;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #888;
      font-size: 1rem;
      margin: 0;
    }

    /* Analytics Grid */
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
      transition: all 0.3s;
    }

    .analytics-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .analytics-card.revenue { border-left: 5px solid #4CAF50; }
    .analytics-card.profit { border-left: 5px solid #2196F3; }
    .analytics-card.users { border-left: 5px solid #FF9800; }
    .analytics-card.items { border-left: 5px solid #9C27B0; }

    .card-icon {
      font-size: 2.5rem;
      line-height: 1;
      flex-shrink: 0;
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
      font-size: 2rem;
      font-weight: 700;
      color: #333;
      line-height: 1;
    }

    .card-label {
      font-size: 0.8rem;
      color: #888;
      display: block;
      margin-top: 0.25rem;
    }

    /* Stats Row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .stats-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      text-align: center;
    }

    .stats-card h3 {
      color: #6B3E2E;
      margin: 0 0 1rem 0;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .stat-change {
      font-size: 0.9rem;
      font-weight: 600;
      color: #F44336;
    }

    .stat-change.positive {
      color: #4CAF50;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #888;
      display: block;
      margin-top: 0.5rem;
    }

    /* Top Items */
    .top-items-section {
      margin-bottom: 2.5rem;
    }

    .top-items-section h2 {
      color: #6B3E2E;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .top-items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .top-item-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: relative;
      text-align: center;
    }

    .rank-badge {
      position: absolute;
      top: -10px;
      right: 15px;
      width: 35px;
      height: 35px;
      background: linear-gradient(135deg, #FF9800, #F57C00);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .top-item-card h4 {
      color: #6B3E2E;
      margin: 1rem 0 0.5rem 0;
      font-weight: 600;
    }

    .item-stats {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .item-stats .sold {
      color: #4CAF50;
      font-weight: 600;
    }

    .item-stats .revenue {
      color: #2196F3;
      font-weight: 600;
    }

    /* Key Metrics */
    .key-metrics {
      margin-top: 2.5rem;
    }

    .key-metrics h2 {
      color: #6B3E2E;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .metric {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .metric-label {
      display: block;
      color: #6B3E2E;
      font-weight: 600;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }

    .metric-bar {
      width: 100%;
      height: 8px;
      background: #eee;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .metric-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #45a049);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .metric-value {
      display: block;
      text-align: right;
      color: #333;
      font-weight: 600;
      font-size: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 968px) {
      .analytics-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .top-items-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .admin-dashboard-container {
        padding: 1rem;
      }

      .header h1 {
        font-size: 1.75rem;
      }

      .analytics-grid,
      .stats-row {
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

      .top-items-grid {
        grid-template-columns: 1fr;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .analytics-card {
        flex-direction: column;
        text-align: center;
      }

      .card-content {
        width: 100%;
      }

      .header h1 {
        font-size: 1.5rem;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly menuService = inject(MenuService);

  protected readonly Math = Math;

  // Today's metrics
  protected readonly todayOrders = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.orderService.getAllOrders().filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime() && order.status === 'delivered';
    });
  });

  protected readonly todayRevenue = computed(() => {
    return this.todayOrders().reduce((sum, order) => sum + order.totalAmount, 0);
  });

  protected readonly todayProfit = computed(() => {
    return this.todayRevenue() * 0.4;
  });

  protected readonly todayOrdersCount = computed(() => this.todayOrders().length);

  // Weekly metrics
  protected readonly weeklyOrders = computed(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    return this.orderService.getAllOrders().filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate >= sevenDaysAgo && order.status === 'delivered';
    });
  });

  protected readonly weeklyRevenue = computed(() => {
    return this.weeklyOrders().reduce((sum, order) => sum + order.totalAmount, 0);
  });

  protected readonly weeklyGrowth = computed(() => {
    const weekly = this.weeklyRevenue();
    const daily = this.todayRevenue();
    if (daily === 0) return 0;
    return ((weekly / 7 - daily) / daily) * 100;
  });

  // Monthly metrics
  protected readonly monthlyOrders = computed(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);

    return this.orderService.getAllOrders().filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate >= firstDay && order.status === 'delivered';
    });
  });

  protected readonly monthlyRevenue = computed(() => {
    return this.monthlyOrders().reduce((sum, order) => sum + order.totalAmount, 0);
  });

  protected readonly monthlyGrowth = computed(() => {
    const monthly = this.monthlyRevenue();
    const weekly = this.weeklyRevenue();
    if (weekly === 0) return 0;
    return ((monthly / 4 - weekly) / weekly) * 100;
  });

  protected readonly averageOrderValue = computed(() => {
    const allOrders = this.orderService.getAllOrders().filter(o => o.status !== 'cancelled');
    if (allOrders.length === 0) return 0;
    return allOrders.reduce((sum, order) => sum + order.totalAmount, 0) / allOrders.length;
  });

  // User metrics
  protected readonly totalUsers = computed(() => this.authService.getAllUsers().length);
  protected readonly totalCustomers = computed(() => 
    this.authService.getAllUsers().filter(u => u.role === 'customer').length
  );
  protected readonly totalStaff = computed(() => 
    this.authService.getAllUsers().filter(u => u.role === 'staff').length
  );

  // Menu metrics
  protected readonly totalMenuItems = computed(() => this.menuService.getMenuItems().length);
  protected readonly availableItems = computed(() =>
    this.menuService.getMenuItems().filter(item => item.available).length
  );

  protected readonly pendingOrdersCount = computed(() => {
    return this.orderService.getAllOrders().filter(o => o.status === 'pending').length;
  });

  // Top selling items
  protected readonly topSellingItems = computed(() => {
    const itemCounts = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    this.weeklyOrders().forEach(order => {
      order.items.forEach(item => {
        const existing = itemCounts.get(item.menuItemId);
        const itemRevenue = item.price * item.quantity;
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += itemRevenue;
        } else {
          itemCounts.set(item.menuItemId, {
            name: item.menuItemName,
            quantity: item.quantity,
            revenue: itemRevenue
          });
        }
      });
    });

    return Array.from(itemCounts.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);
  });

  // KPIs
  protected readonly orderCompletionRate = computed(() => {
    const allOrders = this.orderService.getAllOrders();
    if (allOrders.length === 0) return 0;
    const completed = allOrders.filter(o => o.status === 'delivered').length;
    return (completed / allOrders.length) * 100;
  });

  protected readonly customerSatisfaction = computed(() => {
    // Based on completed orders (assuming all completed = satisfied)
    return this.orderCompletionRate();
  });

  protected readonly menuAvailabilityRate = computed(() => {
    if (this.totalMenuItems() === 0) return 0;
    return (this.availableItems() / this.totalMenuItems()) * 100;
  });

  protected readonly averagePrepTime = computed(() => {
    const items = this.menuService.getMenuItems();
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.preparationTime, 0) / items.length;
  });
}
