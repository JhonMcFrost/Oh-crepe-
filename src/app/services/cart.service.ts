import { Injectable, signal, computed } from '@angular/core';
import { Cart, CartItem } from '../models/cart.model';
import { MenuItem } from '../models/menu-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly cartItemsSignal = signal<CartItem[]>([]);

  readonly cartItems = this.cartItemsSignal.asReadonly();
  
  readonly totalItems = computed(() => 
    this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  
  readonly totalAmount = computed(() => 
    this.cartItemsSignal().reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
  );

  readonly cart = computed<Cart>(() => ({
    items: this.cartItemsSignal(),
    totalAmount: this.totalAmount(),
    totalItems: this.totalItems(),
  }));

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      const cartItems = JSON.parse(storedCart);
      this.cartItemsSignal.set(cartItems);
    }
  }

  private saveCartToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItemsSignal()));
  }

  addToCart(menuItem: MenuItem, quantity: number = 1): void {
    const currentItems = this.cartItemsSignal();
    const existingItemIndex = currentItems.findIndex(
      (item) => item.menuItem.id === menuItem.id
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      };
      this.cartItemsSignal.set(updatedItems);
    } else {
      // Add new item
      this.cartItemsSignal.update((items) => [...items, { menuItem, quantity }]);
    }

    this.saveCartToStorage();
  }

  removeFromCart(menuItemId: string): void {
    this.cartItemsSignal.update((items) =>
      items.filter((item) => item.menuItem.id !== menuItemId)
    );
    this.saveCartToStorage();
  }

  updateQuantity(menuItemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(menuItemId);
      return;
    }

    const currentItems = this.cartItemsSignal();
    const index = currentItems.findIndex((item) => item.menuItem.id === menuItemId);

    if (index !== -1) {
      const updatedItems = [...currentItems];
      updatedItems[index] = { ...updatedItems[index], quantity };
      this.cartItemsSignal.set(updatedItems);
      this.saveCartToStorage();
    }
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
    localStorage.removeItem('cart');
  }

  getCartItem(menuItemId: string): CartItem | undefined {
    return this.cartItemsSignal().find((item) => item.menuItem.id === menuItemId);
  }
}
