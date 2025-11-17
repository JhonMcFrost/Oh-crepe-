import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  User,
  authState
} from '@angular/fire/auth';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private auth = inject(Auth);
  private authService = inject(AuthService);
  
  firebaseUser = signal<User | null>(null);
  
  constructor() {
    // Listen to Firebase auth state changes
    authState(this.auth).subscribe(user => {
      this.firebaseUser.set(user);
    });
  }

  async signInWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      
      // Integrate with existing auth system
      await this.syncWithLocalAuth(result.user);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  async signInWithFacebook(): Promise<void> {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      
      // Integrate with existing auth system
      await this.syncWithLocalAuth(result.user);
    } catch (error: any) {
      console.error('Facebook sign-in error:', error);
      throw new Error(error.message || 'Failed to sign in with Facebook');
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      await this.authService.logout();
    } catch (error: any) {
      console.error('Sign-out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  private async syncWithLocalAuth(firebaseUser: User): Promise<void> {
    // Check if user exists in IndexedDB
    const existingUser = await this.authService.getUserByEmail(firebaseUser.email || '');
    
    if (existingUser) {
      // User exists, just log them in
      await this.authService.setCurrentUser(existingUser);
    } else {
      // New user, register them with default 'customer' role
      const newUser = {
        email: firebaseUser.email || '',
        password: '', // No password for OAuth users
        name: firebaseUser.displayName || 'User',
        role: 'customer' as const,
        firebaseUid: firebaseUser.uid,
        photoURL: firebaseUser.photoURL || undefined
      };
      
      await this.authService.register(newUser);
    }
  }
}
