import { Component, inject, signal, computed } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { CartService } from '../../services/cart.service';
import { MenuItem } from '../../models/menu-item.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-menu',
  imports: [DecimalPipe],
  template: `
    <div class="menu-container">
      <div class="menu-header">
        <h1>Our Delicious Menu 🥞</h1>
        <p>Browse our amazing selection of sweet and savory crepes</p>
      </div>

      <div class="category-filter">
        <button
          (click)="selectedCategory.set('all')"
          [class.active]="selectedCategory() === 'all'"
          class="filter-btn"
        >
          All Items
        </button>
        @for (category of categories; track category) {
          <button
            (click)="selectedCategory.set(category)"
            [class.active]="selectedCategory() === category"
            class="filter-btn"
          >
            {{ category }}
          </button>
        }
      </div>

      @if (addedToCartMessage()) {
        <div class="success-message">{{ addedToCartMessage() }}</div>
      }

      <div class="menu-grid">
        @for (item of filteredItems(); track item.id) {
          <div class="menu-card">
            <img [src]="item.imageUrl" [alt]="item.name" />
            <div class="menu-card-content">
              <h3>{{ item.name }}</h3>
              <p class="description">{{ item.description }}</p>
              <div class="menu-card-footer">
                <span class="price">₱{{ item.price | number:'1.2-2' }}</span>
                <span class="prep-time">⏱️ {{ item.preparationTime }} min</span>
              </div>
              @if (item.available) {
                <button (click)="addToCart(item)" class="btn-add-cart">
                  Add to Cart
                </button>
              } @else {
                <button class="btn-unavailable" disabled>Unavailable</button>
              }
            </div>
          </div>
        }
      </div>

      @if (filteredItems().length === 0) {
        <div class="empty-state">
          <p>No items found in this category.</p>
        </div>
      }
    </div>
  `,
  styles: `
    .menu-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .menu-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .menu-header h1 {
      color: var(--dark-brown);
      margin-bottom: 0.5rem;
    }

    .menu-header p {
      color: var(--text-light);
    }

    .category-filter {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.5rem 1.5rem;
      border: 2px solid var(--border-beige);
      background: white;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
      color: var(--text-medium);
    }

    .filter-btn:hover {
      border-color: var(--buff);
      background: var(--light-yellow);
      transform: translateY(-2px);
    }

    .filter-btn.active {
      background: var(--buff);
      color: white;
      border-color: var(--buff);
      box-shadow: 0 4px 12px var(--shadow-light);
    }

    .success-message {
      background: rgba(143, 188, 143, 0.2);
      color: var(--success-green);
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      text-align: center;
      border: 2px solid var(--success-green);
      font-weight: 600;
    }

    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .menu-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px var(--shadow-light);
      overflow: hidden;
      transition: all 0.3s;
      border: 2px solid var(--cream);
    }

    .menu-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 24px var(--shadow-medium);
      border-color: var(--buff);
    }

    .menu-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .menu-card-content {
      padding: 1.5rem;
    }

    .menu-card h3 {
      color: var(--dark-brown);
      margin-bottom: 0.5rem;
    }

    .description {
      color: var(--text-light);
      font-size: 0.9rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .menu-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .price {
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--success-green);
    }

    .prep-time {
      color: var(--text-light);
      font-size: 0.9rem;
    }

    .btn-add-cart {
      width: 100%;
      padding: 0.75rem;
      background: var(--buff);
      color: white;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 12px var(--shadow-light);
    }

    .btn-add-cart:hover {
      background: var(--dark-brown);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px var(--shadow-medium);
    }

    .btn-unavailable {
      width: 100%;
      padding: 0.75rem;
      background: #95a5a6;
      color: white;
      border: none;
      border-radius: 25px;
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-light);
    }
  `,
})
export class MenuComponent {
  private readonly menuService = inject(MenuService);
  private readonly cartService = inject(CartService);

  protected readonly selectedCategory = signal<string>('all');
  protected readonly addedToCartMessage = signal('');

  protected readonly categories = this.menuService.getCategories();
  protected readonly allItems = this.menuService.getAvailableMenuItems();

  protected readonly filteredItems = computed(() => {
    const category = this.selectedCategory();
    if (category === 'all') {
      return this.allItems;
    }
    return this.allItems.filter((item) => item.category === category);
  });

  addToCart(item: MenuItem): void {
    this.cartService.addToCart(item, 1);
    this.addedToCartMessage.set(`${item.name} added to cart!`);

    setTimeout(() => {
      this.addedToCartMessage.set('');
    }, 3000);
  }
}
