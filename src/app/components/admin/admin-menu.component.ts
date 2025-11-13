import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { MenuItem } from '../../models/menu-item.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-admin-menu',
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="admin-menu-container">
      <div class="header">
        <h1>Manage Menu Items 🍽️</h1>
        <button (click)="showAddForm.set(true)" class="btn-add">+ Add New Item</button>
      </div>

      @if (showAddForm()) {
        <div class="modal-overlay" (click)="closeAddForm()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2>{{ editingItem() ? 'Edit Menu Item' : 'Add New Menu Item' }}</h2>
            <form (ngSubmit)="saveItem()">
              <div class="form-group">
                <label for="name">Name</label>
                <input
                  type="text"
                  id="name"
                  [(ngModel)]="formData.name"
                  name="name"
                  required
                />
              </div>

              <div class="form-group">
                <label for="description">Description</label>
                <textarea
                  id="description"
                  [(ngModel)]="formData.description"
                  name="description"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="price">Price (₱)</label>
                  <input
                    type="number"
                    id="price"
                    [(ngModel)]="formData.price"
                    name="price"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="prepTime">Prep Time (min)</label>
                  <input
                    type="number"
                    id="prepTime"
                    [(ngModel)]="formData.preparationTime"
                    name="prepTime"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="category">Category</label>
                <input
                  type="text"
                  id="category"
                  [(ngModel)]="formData.category"
                  name="category"
                  required
                />
              </div>

              <div class="form-group">
                <label for="imageUrl">Image URL</label>
                <input
                  type="url"
                  id="imageUrl"
                  [(ngModel)]="formData.imageUrl"
                  name="imageUrl"
                  required
                />
              </div>

              <div class="form-group">
                <label>
                  <input
                    type="checkbox"
                    [(ngModel)]="formData.available"
                    name="available"
                  />
                  Available for order
                </label>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-submit">
                  {{ editingItem() ? 'Update' : 'Add' }} Item
                </button>
                <button type="button" (click)="closeAddForm()" class="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (successMessage()) {
        <div class="success-message">{{ successMessage() }}</div>
      }

      <div class="menu-grid">
        @for (item of menuService.menuItems(); track item.id) {
          <div class="menu-card" [class.unavailable]="!item.available">
            <img [src]="item.imageUrl" [alt]="item.name" />
            <div class="card-content">
              <h3>{{ item.name }}</h3>
              <p class="description">{{ item.description }}</p>
              <div class="card-details">
                <span class="price">₱{{ item.price | number:'1.2-2' }}</span>
                <span class="category">{{ item.category }}</span>
              </div>
              <div class="card-meta">
                <span>⏱️ {{ item.preparationTime }} min</span>
                <span [class.available]="item.available" [class.unavailable-text]="!item.available">
                  {{ item.available ? '✅ Available' : '❌ Unavailable' }}
                </span>
              </div>
              <div class="card-actions">
                <button (click)="editItem(item)" class="btn-edit">Edit</button>
                <button (click)="toggleAvailability(item.id)" class="btn-toggle">
                  {{ item.available ? 'Mark Unavailable' : 'Mark Available' }}
                </button>
                <button (click)="deleteItem(item.id)" class="btn-delete">Delete</button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .admin-menu-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      margin-top: 4rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      color: #6B3E2E;
    }

    .btn-add {
      padding: 0.75rem 1.5rem;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-add:hover {
      background: #229954;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 2rem;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content h2 {
      color: #6B3E2E;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--light-brown);
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

    input[type='checkbox'] {
      width: auto;
      margin-right: 0.5rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .btn-submit,
    .btn-cancel {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-submit {
      background: #27ae60;
      color: white;
    }

    .btn-submit:hover {
      background: #229954;
    }

    .btn-cancel {
      background: white;
      color: #e74c3c;
      border: 2px solid #e74c3c;
    }

    .btn-cancel:hover {
      background: #e74c3c;
      color: white;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .menu-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.3s;
    }

    .menu-card.unavailable {
      opacity: 0.7;
    }

    .menu-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .menu-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .card-content {
      padding: 1.5rem;
    }

    .card-content h3 {
      color: #6B3E2E;
      margin-bottom: 0.5rem;
    }

    .description {
      color: var(--light-brown);
      font-size: 0.9rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .card-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .price {
      font-size: 1.25rem;
      font-weight: bold;
      color: #27ae60;
    }

    .category {
      background: #f8f9fa;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      color: #495057;
    }

    .card-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .available {
      color: #27ae60;
      font-weight: 600;
    }

    .unavailable-text {
      color: #e74c3c;
      font-weight: 600;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-edit,
    .btn-toggle,
    .btn-delete {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-edit {
      background: #3498db;
      color: white;
    }

    .btn-edit:hover {
      background: #2980b9;
    }

    .btn-toggle {
      background: #f39c12;
      color: white;
    }

    .btn-toggle:hover {
      background: #e67e22;
    }

    .btn-delete {
      background: #e74c3c;
      color: white;
    }

    .btn-delete:hover {
      background: #c0392b;
    }
  `,
})
export class AdminMenuComponent {
  protected readonly menuService = inject(MenuService);

  protected readonly showAddForm = signal(false);
  protected readonly editingItem = signal<MenuItem | null>(null);
  protected readonly successMessage = signal('');

  protected formData = {
    name: '',
    description: '',
    price: 0,
    category: '',
    imageUrl: '',
    available: true,
    preparationTime: 10,
  };

  editItem(item: MenuItem): void {
    this.editingItem.set(item);
    this.formData = {
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      available: item.available,
      preparationTime: item.preparationTime,
    };
    this.showAddForm.set(true);
  }

  saveItem(): void {
    const editing = this.editingItem();

    if (editing) {
      this.menuService.updateMenuItem(editing.id, this.formData);
      this.successMessage.set('Menu item updated successfully!');
    } else {
      this.menuService.addMenuItem(this.formData);
      this.successMessage.set('Menu item added successfully!');
    }

    this.closeAddForm();
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  deleteItem(itemId: string): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.menuService.deleteMenuItem(itemId);
      this.successMessage.set('Menu item deleted successfully!');
      setTimeout(() => this.successMessage.set(''), 3000);
    }
  }

  toggleAvailability(itemId: string): void {
    this.menuService.toggleAvailability(itemId);
    this.successMessage.set('Availability updated!');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  closeAddForm(): void {
    this.showAddForm.set(false);
    this.editingItem.set(null);
    this.formData = {
      name: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
      available: true,
      preparationTime: 10,
    };
  }
}
