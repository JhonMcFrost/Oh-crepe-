import { MenuItem } from './menu-item.model';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}
