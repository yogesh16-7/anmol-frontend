import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ApiService, Order } from '../../services/api';
import { EcommerceStore } from '../../ecommerce-store';

export const ordersResolver: ResolveFn<Order[]> = () => {
  const api = inject(ApiService);
  const store = inject(EcommerceStore);
  const user = store.user();

  if (!user) {
    return [];
  }

  return api.getUserOrders(user.id);
};