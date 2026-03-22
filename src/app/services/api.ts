import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  user: string;
  token: string;
  userId: string;
  isAdmin: boolean;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  street: string;
  apartment: string;
  zip: string;
  city: string;
  country: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  countInStock: number;
  rating?: number;
  numReviews?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Order {
  id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: {
    street: string;
    apartment: string;
    zip: string;
    city: string;
    country: string;
  };
  phone: string;
  status: string;
  totalPrice: number;
  dateOrdered: string;
}

export interface OrderItem {
  product: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://ecommerce-backend-xrnh.onrender.com/api/v1/products';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/users/login`, { email, password });
  }

  register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    isAdmin?: boolean;
    street?: string;
    apartment?: string;
    zip?: string;
    city?: string;
    country?: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/users/register`, userData);
  }

  // Products
  getProducts(categories?: string[]): Observable<Product[]> {
    console.log('API: getProducts called with categories:', categories);
    const params = categories && categories.length > 0 ? { categories: categories.join(',') } : undefined;
    console.log('API: Making request to:', `${this.baseUrl}/products`, 'with params:', params);
    return this.http.get<Product[]>(`${this.baseUrl}/products`, params ? { params } : {});
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  // Orders
  createOrder(orderData: {
    orderItems: { product: string; quantity: number }[];
    shippingAddress1: string;
    shippingAddress2: string;
    city: string;
    zip: string;
    country: string;
    phone: string;
    totalPrice: number;
  }): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, orderData);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders`);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`);
  }

  getUserOrders(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/get/userorders/${userId}`);
  }
}