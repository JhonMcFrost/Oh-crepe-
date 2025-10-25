export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';

export type PaymentMethod = 'online' | 'cash-on-delivery';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  estimatedDeliveryTime?: Date;
  notes?: string;
}
