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

      <!-- Revenue Trend Chart -->
      <div class="chart-section">
        <h2>📈 Revenue Trend (Last 7 Days)</h2>
        <div class="chart-container">
          <div class="chart-grid">
            @for (day of revenueTrendData(); track day.date) {
              <div class="chart-bar-wrapper">
                <div class="chart-bar-container">
                  <div 
                    class="chart-bar" 
                    [style.height.%]="(day.revenue / maxDailyRevenue()) * 100"
                    [title]="'₱' + (day.revenue | number:'1.2-2')">
                  </div>
                </div>
                <div class="chart-label">
                  <span class="day-name">{{ day.dayName }}</span>
                  <span class="day-date">{{ day.dateLabel }}</span>
                  <span class="revenue-label">₱{{ day.revenue | number:'1.0-0' }}</span>
                </div>
              </div>
            }
          </div>
          <div class="chart-summary">
            <div class="summary-item">
              <span class="summary-label">Total (7 days)</span>
              <span class="summary-value">₱{{ weeklyRevenue() | number:'1.2-2' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Daily Average</span>
              <span class="summary-value">₱{{ (weeklyRevenue() / 7) | number:'1.2-2' }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Best Day</span>
              <span class="summary-value">{{ bestRevenueDay() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Analytics Section -->
      <div class="customer-analytics-section">
        <h2>👥 Customer Analytics</h2>
        <div class="customer-grid">
          <!-- New Customers -->
          <div class="customer-card highlight">
            <div class="customer-card-header">
              <span class="card-icon">✨</span>
              <h3>New Customers</h3>
            </div>
            <div class="customer-stats">
              <div class="stat-row">
                <span class="stat-label">This Week</span>
                <span class="stat-value primary">{{ newCustomersThisWeek() }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">This Month</span>
                <span class="stat-value">{{ newCustomersThisMonth() }}</span>
              </div>
              <div class="growth-indicator" [class.positive]="customerGrowthRate() >= 0">
                {{ customerGrowthRate() >= 0 ? '↑' : '↓' }} {{ Math.abs(customerGrowthRate()) | number:'1.1-1' }}% growth
              </div>
            </div>
          </div>

          <!-- Active Customers -->
          <div class="customer-card">
            <div class="customer-card-header">
              <span class="card-icon">🔥</span>
              <h3>Active Customers</h3>
            </div>
            <div class="customer-stats">
              <div class="stat-row">
                <span class="stat-label">Daily Active</span>
                <span class="stat-value primary">{{ dailyActiveCustomers() }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Weekly Active</span>
                <span class="stat-value">{{ weeklyActiveCustomers() }}</span>
              </div>
              <div class="info-text">
                {{ activeCustomerRate() | number:'1.0-0' }}% of total customers
              </div>
            </div>
          </div>

          <!-- Customer Lifetime Value -->
          <div class="customer-card">
            <div class="customer-card-header">
              <span class="card-icon">💎</span>
              <h3>Average Customer Value</h3>
            </div>
            <div class="customer-stats">
              <div class="stat-row">
                <span class="stat-label">Lifetime Value</span>
                <span class="stat-value primary">₱{{ avgCustomerLifetimeValue() | number:'1.2-2' }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Avg Orders</span>
                <span class="stat-value">{{ avgOrdersPerCustomer() | number:'1.1-1' }}</span>
              </div>
              <div class="info-text">
                Based on {{ totalCustomers() }} customers
              </div>
            </div>
          </div>

          <!-- Retention Rate -->
          <div class="customer-card">
            <div class="customer-card-header">
              <span class="card-icon">🎯</span>
              <h3>Customer Retention</h3>
            </div>
            <div class="customer-stats">
              <div class="stat-row">
                <span class="stat-label">Retention Rate</span>
                <span class="stat-value primary">{{ customerRetentionRate() | number:'1.0-0' }}%</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Repeat Customers</span>
                <span class="stat-value">{{ repeatCustomersCount() }}</span>
              </div>
              <div class="progress-bar-small">
                <div class="progress-fill" [style.width.%]="customerRetentionRate()"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Customers Leaderboard -->
        <div class="top-customers-section">
          <h3>🏆 Top Customers This Month</h3>
          <div class="leaderboard">
            @for (customer of topCustomers(); track customer.email; let idx = $index) {
              <div class="leaderboard-item" [class.top-three]="idx < 3">
                <div class="customer-rank">
                  @if (idx === 0) { <span class="medal gold">🥇</span> }
                  @else if (idx === 1) { <span class="medal silver">🥈</span> }
                  @else if (idx === 2) { <span class="medal bronze">🥉</span> }
                  @else { <span class="rank-number">{{ idx + 1 }}</span> }
                </div>
                <div class="customer-info">
                  <span class="customer-name">{{ customer.name }}</span>
                  <span class="customer-email">{{ customer.email }}</span>
                </div>
                <div class="customer-metrics">
                  <div class="metric-item">
                    <span class="metric-label">Orders</span>
                    <span class="metric-value">{{ customer.orderCount }}</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-label">Total Spent</span>
                    <span class="metric-value">₱{{ customer.totalSpent | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Customer Acquisition Sources -->
        <div class="acquisition-section">
          <h3>📊 Customer Acquisition Sources</h3>
          <div class="acquisition-stats">
            <div class="acquisition-item">
              <div class="acquisition-label">
                <span class="icon">📧</span>
                <span>Email Registration</span>
              </div>
              <div class="acquisition-bar">
                <div class="bar-fill email" [style.width.%]="emailSignupRate()"></div>
              </div>
              <span class="acquisition-value">{{ emailSignupCount() }} ({{ emailSignupRate() | number:'1.0-0' }}%)</span>
            </div>
            <div class="acquisition-item">
              <div class="acquisition-label">
                <span class="icon">🔍</span>
                <span>Google OAuth</span>
              </div>
              <div class="acquisition-bar">
                <div class="bar-fill google" [style.width.%]="googleSignupRate()"></div>
              </div>
              <span class="acquisition-value">{{ googleSignupCount() }} ({{ googleSignupRate() | number:'1.0-0' }}%)</span>
            </div>
            <div class="acquisition-item">
              <div class="acquisition-label">
                <span class="icon">📘</span>
                <span>Facebook OAuth</span>
              </div>
              <div class="acquisition-bar">
                <div class="bar-fill facebook" [style.width.%]="facebookSignupRate()"></div>
              </div>
              <span class="acquisition-value">{{ facebookSignupCount() }} ({{ facebookSignupRate() | number:'1.0-0' }}%)</span>
            </div>
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

    /* Revenue Trend Chart */
    .chart-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 2.5rem;
    }

    .chart-section h2 {
      color: #6B3E2E;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .chart-container {
      margin-top: 1.5rem;
    }

    .chart-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem 0;
    }

    .chart-bar-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .chart-bar-container {
      width: 100%;
      height: 200px;
      display: flex;
      align-items: flex-end;
      background: linear-gradient(to top, rgba(212, 163, 115, 0.05), transparent);
      border-radius: 8px 8px 0 0;
      padding: 0.5rem;
    }

    .chart-bar {
      width: 100%;
      background: linear-gradient(to top, #D4A373, #F4A460);
      border-radius: 8px 8px 0 0;
      transition: all 0.5s ease;
      cursor: pointer;
      position: relative;
      min-height: 10px;
    }

    .chart-bar:hover {
      background: linear-gradient(to top, #6B3E2E, #D4A373);
      transform: scaleY(1.05);
    }

    .chart-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.85rem;
    }

    .day-name {
      font-weight: 700;
      color: #6B3E2E;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }

    .day-date {
      color: #888;
      font-size: 0.7rem;
    }

    .revenue-label {
      color: #4CAF50;
      font-weight: 600;
      font-size: 0.8rem;
    }

    .chart-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px solid #f0f0f0;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .summary-label {
      color: #888;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .summary-value {
      color: #6B3E2E;
      font-size: 1.5rem;
      font-weight: 700;
    }

    /* Customer Analytics Section */
    .customer-analytics-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 2.5rem;
    }

    .customer-analytics-section h2 {
      color: #6B3E2E;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .customer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .customer-card {
      background: linear-gradient(135deg, #fff 0%, #fafafa 100%);
      border: 2px solid #f0f0f0;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s;
    }

    .customer-card.highlight {
      border-color: #D4A373;
      background: linear-gradient(135deg, #FFF8F0 0%, #fff 100%);
    }

    .customer-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .customer-card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .customer-card-header .card-icon {
      font-size: 1.75rem;
    }

    .customer-card-header h3 {
      color: #6B3E2E;
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .customer-stats {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .stat-row:last-of-type {
      border-bottom: none;
    }

    .stat-row .stat-label {
      color: #888;
      font-size: 0.9rem;
    }

    .stat-row .stat-value {
      color: #333;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .stat-row .stat-value.primary {
      color: #D4A373;
      font-size: 1.75rem;
    }

    .growth-indicator {
      text-align: center;
      padding: 0.5rem;
      background: #fee;
      color: #c00;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .growth-indicator.positive {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .info-text {
      text-align: center;
      color: #888;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      font-style: italic;
    }

    .progress-bar-small {
      width: 100%;
      height: 6px;
      background: #eee;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #45a049);
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    /* Top Customers Leaderboard */
    .top-customers-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #f0f0f0;
    }

    .top-customers-section h3 {
      color: #6B3E2E;
      margin-bottom: 1.5rem;
      font-size: 1.25rem;
    }

    .leaderboard {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .leaderboard-item {
      display: grid;
      grid-template-columns: 60px 1fr auto;
      gap: 1.5rem;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #fafafa;
      border-radius: 8px;
      transition: all 0.3s;
    }

    .leaderboard-item.top-three {
      background: linear-gradient(135deg, #FFF8F0, #fafafa);
      border: 2px solid #D4A373;
    }

    .leaderboard-item:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .customer-rank {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .medal {
      font-size: 2rem;
    }

    .rank-number {
      font-weight: 700;
      color: #888;
      font-size: 1.5rem;
    }

    .customer-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .customer-name {
      color: #6B3E2E;
      font-weight: 600;
      font-size: 1rem;
    }

    .customer-email {
      color: #888;
      font-size: 0.85rem;
    }

    .customer-metrics {
      display: flex;
      gap: 2rem;
    }

    .metric-item {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .metric-item .metric-label {
      color: #888;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-item .metric-value {
      color: #333;
      font-weight: 700;
      font-size: 1rem;
    }

    /* Customer Acquisition */
    .acquisition-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #f0f0f0;
    }

    .acquisition-section h3 {
      color: #6B3E2E;
      margin-bottom: 1.5rem;
      font-size: 1.25rem;
    }

    .acquisition-stats {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .acquisition-item {
      display: grid;
      grid-template-columns: 200px 1fr 150px;
      gap: 1rem;
      align-items: center;
    }

    .acquisition-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #6B3E2E;
      font-weight: 600;
    }

    .acquisition-label .icon {
      font-size: 1.5rem;
    }

    .acquisition-bar {
      height: 32px;
      background: #eee;
      border-radius: 16px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      transition: width 0.5s ease;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 0.75rem;
      color: white;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .bar-fill.email {
      background: linear-gradient(90deg, #4CAF50, #45a049);
    }

    .bar-fill.google {
      background: linear-gradient(90deg, #4285F4, #357ae8);
    }

    .bar-fill.facebook {
      background: linear-gradient(90deg, #1877F2, #166fe5);
    }

    .acquisition-value {
      text-align: right;
      color: #333;
      font-weight: 600;
      font-size: 0.95rem;
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

      .chart-grid {
        gap: 0.5rem;
      }

      .customer-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .acquisition-item {
        grid-template-columns: 150px 1fr 120px;
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

      .chart-section,
      .customer-analytics-section {
        padding: 1.5rem;
      }

      .customer-grid {
        grid-template-columns: 1fr;
      }

      .chart-summary {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .leaderboard-item {
        grid-template-columns: 50px 1fr;
        gap: 1rem;
      }

      .customer-metrics {
        grid-column: 2;
        margin-top: 0.5rem;
      }

      .acquisition-item {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .acquisition-bar {
        order: 2;
      }

      .acquisition-value {
        order: 3;
        text-align: left;
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

      .chart-grid {
        grid-template-columns: repeat(7, 1fr);
        gap: 0.25rem;
      }

      .chart-bar-container {
        height: 120px;
      }

      .chart-label {
        font-size: 0.65rem;
      }

      .revenue-label {
        display: none;
      }

      .leaderboard-item {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .customer-rank {
        justify-content: center;
      }

      .customer-metrics {
        justify-content: center;
        margin-top: 1rem;
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

  // Revenue Trend Data (Last 7 Days)
  protected readonly revenueTrendData = computed(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = this.orderService.getAllOrders().filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= date && orderDate < nextDate && order.status === 'delivered';
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      days.push({
        date: date.toISOString(),
        dayName: dayNames[date.getDay()],
        dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
        revenue: revenue
      });
    }
    
    return days;
  });

  protected readonly maxDailyRevenue = computed(() => {
    const revenues = this.revenueTrendData().map(d => d.revenue);
    return Math.max(...revenues, 1); // Minimum 1 to avoid division by zero
  });

  protected readonly bestRevenueDay = computed(() => {
    const data = this.revenueTrendData();
    if (data.length === 0) return 'N/A';
    const best = data.reduce((prev, current) => 
      current.revenue > prev.revenue ? current : prev
    );
    return `${best.dayName} (₱${best.revenue.toFixed(0)})`;
  });

  // Customer Analytics
  protected readonly newCustomersThisWeek = computed(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return this.authService.getAllUsers().filter(user => {
      if (user.role !== 'customer') return false;
      const createdAt = new Date(user.createdAt);
      return createdAt >= sevenDaysAgo;
    }).length;
  });

  protected readonly newCustomersThisMonth = computed(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return this.authService.getAllUsers().filter(user => {
      if (user.role !== 'customer') return false;
      const createdAt = new Date(user.createdAt);
      return createdAt >= firstDay;
    }).length;
  });

  protected readonly customerGrowthRate = computed(() => {
    const thisWeek = this.newCustomersThisWeek();
    const today = new Date();
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const lastWeek = this.authService.getAllUsers().filter(user => {
      if (user.role !== 'customer') return false;
      const createdAt = new Date(user.createdAt);
      return createdAt >= twoWeeksAgo && createdAt < oneWeekAgo;
    }).length;
    
    if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
    return ((thisWeek - lastWeek) / lastWeek) * 100;
  });

  protected readonly dailyActiveCustomers = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeCustomerIds = new Set(
      this.orderService.getAllOrders()
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        })
        .map(order => order.customerId)
    );
    
    return activeCustomerIds.size;
  });

  protected readonly weeklyActiveCustomers = computed(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activeCustomerIds = new Set(
      this.orderService.getAllOrders()
        .filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= sevenDaysAgo;
        })
        .map(order => order.customerId)
    );
    
    return activeCustomerIds.size;
  });

  protected readonly activeCustomerRate = computed(() => {
    if (this.totalCustomers() === 0) return 0;
    return (this.weeklyActiveCustomers() / this.totalCustomers()) * 100;
  });

  protected readonly avgCustomerLifetimeValue = computed(() => {
    const customers = this.authService.getAllUsers().filter(u => u.role === 'customer');
    if (customers.length === 0) return 0;
    
    const totalRevenue = this.orderService.getAllOrders()
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    
    return totalRevenue / customers.length;
  });

  protected readonly avgOrdersPerCustomer = computed(() => {
    const customers = this.authService.getAllUsers().filter(u => u.role === 'customer');
    if (customers.length === 0) return 0;
    
    const totalOrders = this.orderService.getAllOrders()
      .filter(o => o.status === 'delivered').length;
    
    return totalOrders / customers.length;
  });

  protected readonly customerRetentionRate = computed(() => {
    const customers = this.authService.getAllUsers().filter(u => u.role === 'customer');
    if (customers.length === 0) return 0;
    
    const repeatCustomers = this.repeatCustomersCount();
    return (repeatCustomers / customers.length) * 100;
  });

  protected readonly repeatCustomersCount = computed(() => {
    const ordersByCustomer = new Map<string, number>();
    
    this.orderService.getAllOrders()
      .filter(o => o.status === 'delivered')
      .forEach(order => {
        const count = ordersByCustomer.get(order.customerId) || 0;
        ordersByCustomer.set(order.customerId, count + 1);
      });
    
    return Array.from(ordersByCustomer.values()).filter(count => count > 1).length;
  });

  // Top Customers
  protected readonly topCustomers = computed(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const customerStats = new Map<string, { email: string; name: string; orderCount: number; totalSpent: number }>();
    
    this.orderService.getAllOrders()
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= firstDay && order.status === 'delivered';
      })
      .forEach(order => {
        const customer = this.authService.getAllUsers().find(u => u.id === order.customerId);
        if (!customer || customer.role !== 'customer') return;
        
        const existing = customerStats.get(order.customerId);
        if (existing) {
          existing.orderCount++;
          existing.totalSpent += order.totalAmount;
        } else {
          customerStats.set(order.customerId, {
            email: customer.email,
            name: customer.name,
            orderCount: 1,
            totalSpent: order.totalAmount
          });
        }
      });
    
    return Array.from(customerStats.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  });

  // Customer Acquisition Sources
  protected readonly emailSignupCount = computed(() => {
    return this.authService.getAllUsers().filter(u => 
      u.role === 'customer' && !u.firebaseUid
    ).length;
  });

  protected readonly googleSignupCount = computed(() => {
    return this.authService.getAllUsers().filter(u => 
      u.role === 'customer' && u.firebaseUid && u.photoURL?.includes('googleusercontent')
    ).length;
  });

  protected readonly facebookSignupCount = computed(() => {
    return this.authService.getAllUsers().filter(u => 
      u.role === 'customer' && u.firebaseUid && u.photoURL?.includes('facebook')
    ).length;
  });

  protected readonly emailSignupRate = computed(() => {
    if (this.totalCustomers() === 0) return 0;
    return (this.emailSignupCount() / this.totalCustomers()) * 100;
  });

  protected readonly googleSignupRate = computed(() => {
    if (this.totalCustomers() === 0) return 0;
    return (this.googleSignupCount() / this.totalCustomers()) * 100;
  });

  protected readonly facebookSignupRate = computed(() => {
    if (this.totalCustomers() === 0) return 0;
    return (this.facebookSignupCount() / this.totalCustomers()) * 100;
  });
}
