export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  color: string;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shipping: {
    name: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
  };
  paymentMethod: string;
  createdAt: string;
}

export type UserRole = 'user' | 'admin' | 'owner';
