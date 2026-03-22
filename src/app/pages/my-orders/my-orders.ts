import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ApiService, Order } from '../../services/api';
import { EcommerceStore } from '../../ecommerce-store';
import { Toaster } from '../../services/toaster';
import { BackButton } from "../../components/back-button/back-button";

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, BackButton],
  template: `
  <div class="mx-auto max-w-[1200px] py-6 px-4">
    <app-back-button class="mb-6" navigateTo="/"> Continue Shopping </app-back-button>

    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">My Orders</h1>

      @if (orders.length === 0) {
        <div class="text-center py-12">
          <mat-icon class="text-4xl text-gray-400">shopping_cart</mat-icon>
          <p class="mt-4 text-gray-600">You haven't placed any orders yet.</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (order of orders; track order.id) {
            <mat-card class="p-4">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-semibold">Order #{{ order.id.slice(-8) }}</h3>
                  <p class="text-sm text-gray-600">{{ order.dateOrdered | date:'medium' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-bold">{{ order.totalPrice | currency }}</p>
                  <mat-chip [color]="getStatusColor(order.status)" selected>
                    {{ order.status }}
                  </mat-chip>
                </div>
              </div>

              <div class="mb-4">
                <h4 class="font-medium mb-2">Items:</h4>
                <div class="space-y-2">
                  @for (item of order.orderItems; track item.product) {
                    <div class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div class="flex items-center">
                        <mat-icon class="text-gray-400 mr-2">shopping_bag</mat-icon>
                        <span>{{ getProductName(item.product) }}</span>
                      </div>
                      <span class="text-sm text-gray-600">Qty: {{ item.quantity }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="text-sm text-gray-600">
                <p><strong>Shipping Address:</strong> {{ formatAddress(order.shippingAddress) }}</p>
                <p><strong>Phone:</strong> {{ order.phone }}</p>
              </div>
            </mat-card>
          }
        </div>
      }
    </div>
  </div>
  `,
  styles: [`
  `]
})
export class MyOrdersComponent {
  route = inject(ActivatedRoute);
  api = inject(ApiService);
  store = inject(EcommerceStore);
  toaster = inject(Toaster);

  orders: Order[] = [];
  loading = false;

  constructor() {
    const data = this.route.snapshot.data['orders'] as Order[];
    if (data) {
      this.orders = data;
    } else {
      // If no data was resolved (user not authenticated), check and show error
      const user = this.store.user();
      if (!user) {
        this.toaster.error('Please sign in to view your orders');
      }
    }
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status.toLowerCase()) {
      case 'delivered': return 'primary';
      case 'shipped': return 'accent';
      case 'ready to ship': return 'accent';
      default: return 'warn';
    }
  }

  getProductName(product: any): string {
    return typeof product === 'string' ? product : product?.name || 'Unknown Product';
  }

  formatAddress(address: any): string {
    if (!address) return '';
    return `${address.street || ''} ${address.apartment || ''}, ${address.city || ''}, ${address.zip || ''}, ${address.country || ''}`.trim();
  }
}

export default MyOrdersComponent;