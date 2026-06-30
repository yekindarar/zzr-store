import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Order } from '../types';
import { userApi, adminApi } from '../api';

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  createOrder: (data: {
    items: any[];
    total: number;
    shipping: { name: string; phone: string; address: string; city: string; zip: string };
    paymentMethod: string;
  }) => Promise<string>;
  confirmDelivery: (orderId: string) => Promise<void>;
  payOrder: (orderId: string) => Promise<{ pay_type: string; qrcode: string; out_trade_no: string; total_fee: string; message?: string }>;
  mockPay: (orderId: string) => Promise<{ message: string; status: string }>;
  getOrderStatus: (orderId: string) => Promise<{ id: string; status: string; tracking_number: string | null; updated_at: string | null }>;
  cancelOrder: (orderId: string) => Promise<void>;
  adminOrders: Order[];
  adminLoading: boolean;
  refreshAdminOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: string, trackingNumber?: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const data = await userApi.getMyOrders();
      setOrders(data.orders);
    } catch {
      // not logged in
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data: {
    items: any[];
    total: number;
    shipping: { name: string; phone: string; address: string; city: string; zip: string };
    paymentMethod: string;
  }): Promise<string> => {
    const res = await userApi.createOrder({
      items: data.items,
      total: data.total,
      shipping_name: data.shipping.name,
      shipping_phone: data.shipping.phone,
      shipping_address: data.shipping.address,
      shipping_city: data.shipping.city,
      shipping_zip: data.shipping.zip,
      payment_method: data.paymentMethod,
    });
    return res.order_id;
  };

  const refreshAdminOrders = async () => {
    setAdminLoading(true);
    try {
      const data = await adminApi.getOrders();
      setAdminOrders(data.orders);
    } catch {
      // not admin
    } finally {
      setAdminLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    await adminApi.updateOrderStatus(orderId, status, trackingNumber);
    await refreshAdminOrders();
  };

  const confirmDelivery = async (orderId: string) => {
    await userApi.confirmDelivery(orderId);
    await refreshOrders();
  };

  const payOrder = async (orderId: string) => {
    return await userApi.payOrder(orderId);
  };

  const mockPay = async (orderId: string) => {
    return await userApi.mockPay(orderId);
  };

  const getOrderStatus = async (orderId: string) => {
    return await userApi.getOrderStatus(orderId);
  };

  const cancelOrder = async (orderId: string) => {
    await userApi.cancelOrder(orderId);
    await refreshOrders();
  };

  return (
    <OrderContext.Provider value={{
      orders, loading, refreshOrders, createOrder, confirmDelivery,
      payOrder, mockPay, getOrderStatus, cancelOrder,
      adminOrders, adminLoading, refreshAdminOrders, updateOrderStatus,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
