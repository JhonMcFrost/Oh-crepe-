import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule, DatePipe],
  template: `
    <div class="admin-users-container">
      <div class="header">
        <h1>Manage Users 👥</h1>
      </div>

      @if (successMessage()) {
        <div class="success-message">{{ successMessage() }}</div>
      }

      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users; track user.id) {
              <tr>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" [class]="'role-' + user.role">
                    {{ user.role }}
                  </span>
                </td>
                <td>{{ user.phone || 'N/A' }}</td>
                <td>{{ user.createdAt | date : 'short' }}</td>
                <td>
                  <div class="action-buttons">
                    <button (click)="editUser(user)" class="btn-edit">Edit</button>
                    @if (user.id !== currentUserId) {
                      <button (click)="deleteUser(user.id)" class="btn-delete">
                        Delete
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (showEditForm()) {
        <div class="modal-overlay" (click)="closeEditForm()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2>Edit User</h2>
            <form (ngSubmit)="saveUser()">
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
                <label for="email">Email</label>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="formData.email"
                  name="email"
                  required
                />
              </div>

              <div class="form-group">
                <label for="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  [(ngModel)]="formData.phone"
                  name="phone"
                />
              </div>

              <div class="form-group">
                <label for="address">Address</label>
                <textarea
                  id="address"
                  [(ngModel)]="formData.address"
                  name="address"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="role">Role</label>
                <select id="role" [(ngModel)]="formData.role" name="role" required>
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-submit">Update User</button>
                <button type="button" (click)="closeEditForm()" class="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .admin-users-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      margin-bottom: 2rem;
    }

    .header h1 {
      color: #2c3e50;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .users-table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table thead {
      background: #f8f9fa;
    }

    .users-table th,
    .users-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .users-table th {
      font-weight: 600;
      color: #2c3e50;
    }

    .users-table tbody tr:hover {
      background: #f8f9fa;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .role-customer {
      background: #e7f3ff;
      color: #0066cc;
    }

    .role-staff {
      background: #fff4e6;
      color: #d97706;
    }

    .role-admin {
      background: #fee;
      color: #dc2626;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-edit,
    .btn-delete {
      padding: 0.4rem 0.75rem;
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

    .btn-delete {
      background: #e74c3c;
      color: white;
    }

    .btn-delete:hover {
      background: #c0392b;
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
      color: #2c3e50;
      margin-bottom: 1.5rem;
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
    textarea,
    select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus,
    textarea:focus,
    select:focus {
      outline: none;
      border-color: #f39c12;
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

    @media (max-width: 768px) {
      .users-table {
        font-size: 0.9rem;
      }

      .users-table th,
      .users-table td {
        padding: 0.75rem 0.5rem;
      }
    }
  `,
})
export class AdminUsersComponent {
  private readonly authService = inject(AuthService);

  protected readonly users = this.authService.getAllUsers();
  protected readonly currentUserId = this.authService.currentUser()?.id;
  protected readonly showEditForm = signal(false);
  protected readonly editingUser = signal<User | null>(null);
  protected readonly successMessage = signal('');

  protected formData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'customer' as UserRole,
  };

  editUser(user: User): void {
    this.editingUser.set(user);
    this.formData = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role,
    };
    this.showEditForm.set(true);
  }

  saveUser(): void {
    const editing = this.editingUser();
    if (!editing) return;

    this.authService.updateUser(editing.id, this.formData);
    this.successMessage.set('User updated successfully!');
    this.closeEditForm();
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.authService.deleteUser(userId);
      this.successMessage.set('User deleted successfully!');
      setTimeout(() => this.successMessage.set(''), 3000);
    }
  }

  closeEditForm(): void {
    this.showEditForm.set(false);
    this.editingUser.set(null);
    this.formData = {
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'customer',
    };
  }
}
