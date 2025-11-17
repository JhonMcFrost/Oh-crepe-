import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(null);
  private readonly isAuthenticatedSignal = signal(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);
  readonly isCustomer = computed(() => this.userRole() === 'customer');
  readonly isStaff = computed(() => this.userRole() === 'staff');
  readonly isAdmin = computed(() => this.userRole() === 'admin');

  // Mock users for demo purposes
  private readonly mockUsers: User[] = [
    {
      id: '1',
      email: 'customer@ofos.com',
      name: 'John Customer',
      role: 'customer',
      phone: '555-0101',
      address: '123 Main St, City',
      createdAt: new Date(),
    },
    {
      id: '2',
      email: 'staff@ofos.com',
      name: 'Jane Staff',
      role: 'staff',
      phone: '555-0102',
      createdAt: new Date(),
    },
    {
      id: '3',
      email: 'admin@ofos.com',
      name: 'Admin User',
      role: 'admin',
      phone: '555-0103',
      createdAt: new Date(),
    },
  ];

  constructor() {
    // Check if user is stored in localStorage
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
    }
  }

  login(email: string, password: string): boolean {
    // Simple mock authentication
    const user = this.mockUsers.find((u) => u.email === email);
    
    if (user) {
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    
    return false;
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    localStorage.removeItem('currentUser');
  }

  register(userData: { email: string; name: string; phone?: string; address?: string; password?: string; role?: UserRole; firebaseUid?: string; photoURL?: string }): User | null {
    // Check if email already exists
    if (this.mockUsers.some((u) => u.email === userData.email)) {
      return null;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      role: userData.role || 'customer',
      createdAt: new Date(),
      firebaseUid: userData.firebaseUid,
      photoURL: userData.photoURL,
    };

    this.mockUsers.push(newUser);
    this.currentUserSignal.set(newUser);
    this.isAuthenticatedSignal.set(true);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return newUser;
  }

  hasRole(role: UserRole): boolean {
    return this.userRole() === role;
  }

  // For admin use
  getAllUsers(): User[] {
    return [...this.mockUsers];
  }

  updateUser(userId: string, updates: Partial<User>): boolean {
    const index = this.mockUsers.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.mockUsers[index] = { ...this.mockUsers[index], ...updates };
      
      // Update current user if it's the same
      if (this.currentUserSignal()?.id === userId) {
        this.currentUserSignal.set(this.mockUsers[index]);
        localStorage.setItem('currentUser', JSON.stringify(this.mockUsers[index]));
      }
      
      return true;
    }
    return false;
  }

  deleteUser(userId: string): boolean {
    const index = this.mockUsers.findIndex((u) => u.id === userId);
    if (index !== -1) {
      this.mockUsers.splice(index, 1);
      return true;
    }
    return false;
  }

  // Helper methods for Firebase integration
  async getUserByEmail(email: string): Promise<User | null> {
    const user = this.mockUsers.find((u) => u.email === email);
    return user || null;
  }

  async setCurrentUser(user: User): Promise<void> {
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}
