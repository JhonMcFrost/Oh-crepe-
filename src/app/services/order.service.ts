import { Injectable, signal } from '@angular/core';
import { Order, OrderStatus, PaymentMethod, PaymentStatus, OrderItem } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly ordersSignal = signal<Order[]>([]);

  readonly orders = this.ordersSignal.asReadonly();

  constructor() {
    this.loadOrdersFromStorage();
  }

  private loadOrdersFromStorage(): void {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      const orders = JSON.parse(storedOrders);
      // Parse dates
      orders.forEach((order: Order) => {
        order.createdAt = new Date(order.createdAt);
        order.updatedAt = new Date(order.updatedAt);
        if (order.estimatedDeliveryTime) {
          order.estimatedDeliveryTime = new Date(order.estimatedDeliveryTime);
        }
      });
      this.ordersSignal.set(orders);
    }
  }

  private saveOrdersToStorage(): void {
    localStorage.setItem('orders', JSON.stringify(this.ordersSignal()));
  }

  createOrder(
    customerId: string,
    customerName: string,
    customerPhone: string,
    customerAddress: string,
    items: OrderItem[],
    paymentMethod: PaymentMethod,
    notes?: string
  ): Order {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const now = new Date();
    const estimatedDeliveryTime = new Date(now.getTime() + 45 * 60000); // 45 minutes

    const newOrder: Order = {
      id: Date.now().toString(),
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      items,
      totalAmount,
      status: 'pending',
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      createdAt: now,
      updatedAt: now,
      estimatedDeliveryTime,
      notes,
    };

    this.ordersSignal.update((orders) => [newOrder, ...orders]);
    this.saveOrdersToStorage();
    
    return newOrder;
  }

  getOrderById(orderId: string): Order | undefined {
    return this.ordersSignal().find((order) => order.id === orderId);
  }

  getOrdersByCustomerId(customerId: string): Order[] {
    return this.ordersSignal().filter((order) => order.customerId === customerId);
  }

  getPendingOrders(): Order[] {
    return this.ordersSignal().filter(
      (order) => order.status === 'pending' || order.status === 'preparing'
    );
  }

  getActiveOrders(): Order[] {
    return this.ordersSignal().filter(
      (order) =>
        order.status !== 'delivered' && order.status !== 'cancelled'
    );
  }

  updateOrderStatus(orderId: string, status: OrderStatus): boolean {
    const orders = this.ordersSignal();
    const index = orders.findIndex((order) => order.id === orderId);

    if (index !== -1) {
      const updatedOrders = [...orders];
      updatedOrders[index] = {
        ...updatedOrders[index],
        status,
        updatedAt: new Date(),
      };
      this.ordersSignal.set(updatedOrders);
      this.saveOrdersToStorage();
      return true;
    }

    return false;
  }

  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): boolean {
    const orders = this.ordersSignal();
    const index = orders.findIndex((order) => order.id === orderId);

    if (index !== -1) {
      const updatedOrders = [...orders];
      updatedOrders[index] = {
        ...updatedOrders[index],
        paymentStatus,
        updatedAt: new Date(),
      };
      this.ordersSignal.set(updatedOrders);
      this.saveOrdersToStorage();
      return true;
    }

    return false;
  }

  cancelOrder(orderId: string): boolean {
    return this.updateOrderStatus(orderId, 'cancelled');
  }

  getAllOrders(): Order[] {
    return this.ordersSignal();
  }
}
