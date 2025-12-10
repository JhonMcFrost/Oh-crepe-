import { Injectable, signal, computed, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, getDocs, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly firestore = inject(Firestore);
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

  // Mock passwords (in production, use Firebase Auth)
  private readonly mockPasswords: Record<string, string> = {
    'customer@ofos.com': 'password123',
    'staff@ofos.com': 'staff123',
    'admin@ofos.com': 'admin123',
  };

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
    // Validate credentials
    const user = this.mockUsers.find((u) => u.email === email);
    const storedPassword = this.mockPasswords[email];
    
    if (user && storedPassword === password) {
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

  async register(userData: { email: string; name: string; phone?: string; address?: string; password?: string; role?: UserRole; firebaseUid?: string; photoURL?: string }): Promise<User | null> {
    try {
      // Check if user already exists in Firestore
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        return null;
      }

      const newUser: User = {
        id: userData.firebaseUid || Date.now().toString(),
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        role: userData.role || 'customer',
        createdAt: new Date(),
        firebaseUid: userData.firebaseUid,
        photoURL: userData.photoURL,
      };

      // Save to Firestore
      await this.saveUserToFirestore(newUser);
      
      // Set as current user
      this.currentUserSignal.set(newUser);
      this.isAuthenticatedSignal.set(true);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      return newUser;
    } catch (error) {
      console.error('Error registering user:', error);
      return null;
    }
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

  // Firebase Firestore methods
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const userDoc = doc(this.firestore, 'users', email);
      const docSnap = await getDoc(userDoc);
      
      if (docSnap.exists()) {
        return { ...docSnap.data(), email } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async setCurrentUser(user: User): Promise<void> {
    this.currentUserSignal.set(user);
    this.isAuthenticatedSignal.set(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  async saveUserToFirestore(user: User): Promise<void> {
    try {
      const userDoc = doc(this.firestore, 'users', user.email);
      await setDoc(userDoc, {
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
        firebaseUid: user.firebaseUid,
        photoURL: user.photoURL,
        createdAt: user.createdAt || new Date()
      });
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
      throw error;
    }
  }
}
