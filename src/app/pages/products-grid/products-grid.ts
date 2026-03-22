import { Component, computed, HostListener, inject, input, signal, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { ProductCard } from "../../components/product-card/product-card";
import { MatSidenavContainer, MatSidenavContent, MatSidenav } from "@angular/material/sidenav"
import { MatNavList, MatListItem } from "@angular/material/list"
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { EcommerceStore } from '../../ecommerce-store';
import { ToggleWishlistButton } from "../../components/toggle-wishlist-button/toggle-wishlist-button";
import { ApiService, Category } from '../../services/api';

@Component({
  selector: 'app-products-grid',
  imports: [
    CommonModule,
    ProductCard,
    MatSidenav,
    MatSidenavContainer,
    MatSidenavContent,
    MatNavList,
    MatListItem,
    MatIcon,
    RouterLink,
    TitleCasePipe,
    ToggleWishlistButton
],
  template: ` 
  
  <mat-sidenav-container>

    <mat-sidenav [mode]="isHandset ? 'over' : 'side'" [opened]="!isHandset || sidenavOpen" (closedStart)="sidenavOpen = false"> 
      <div class="p-6">
        <h2 class="text-lg text-gray-900">Categories</h2>

        <mat-nav-list>
          @for (cat of categories(); track cat) {
            <mat-list-item [activated]="cat === category()" class="my-2" [routerLink]="['/products', cat]">
              <span matListItemTitle class="font-medium" [class]="cat === category() ? 'text-white': null">
                 {{ cat | titlecase }} 
              </span>
            </mat-list-item>
          }
        </mat-nav-list>
      </div>
    </mat-sidenav>

    <mat-sidenav-content class="bg-gray-100 p-6 h-full">
      <div class="flex items-center justify-between mb-4">
        <button mat-icon-button (click)="toggleSidenav()" *ngIf="isHandset">
          <mat-icon>menu</mat-icon>
        </button>
        <h1 class="text-2xl font-bold text-gray-900 mb-1"> {{ category() | titlecase }} </h1>
      </div>
      <p class="text-base text-gray-600 mb-6"> {{ store.filteredProducts().length }} Products found </p>
      <div class="responsive-grid">
        @for (product of store.filteredProducts(); track product.id) {
          <app-product-card [product]="product"  [style.view-transition-name]="'wishlist-button-' + product.id">
            <app-toggle-wishlist-button class="!absolute z-10 top-3 right-3 !bg-white shadow-md rounded-md transition-all duration-200 hover:scale-110 hover:shadow-lg" [product]="product" />
          </app-product-card>
        }
      </div>
    </mat-sidenav-content>
  </mat-sidenav-container>
 
  `,
  styles: [`
    .responsive-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      padding: 0;
    }

    mat-sidenav-container {
      height: 100vh;
    }

    mat-sidenav {
      width: 280px;
      background: white;
      border-right: 1px solid #e5e7eb;
    }

    mat-sidenav-content {
      background: #f9fafb;
    }

    .mat-mdc-list-item {
      border-radius: 8px;
      margin: 4px 0;
      transition: all 0.2s ease;
    }

    .mat-mdc-list-item:hover {
      background-color: #f3f4f6;
    }

    .mat-mdc-list-item.activated {
      background-color: #3b82f6;
      color: white;
    }

    .mat-mdc-list-item.activated:hover {
      background-color: #2563eb;
    }

    @media (max-width: 768px) {
      mat-sidenav {
        width: 100% !important;
      }

      mat-sidenav-content {
        padding: 12px !important;
      }

      .responsive-grid {
        grid-template-columns: 1fr !important;
        gap: 1rem;
      }

      .p-6 {
        padding: 12px !important;
      }

      .text-2xl {
        font-size: 1.25rem;
      }
    }
  `],
})
export default class ProductsGrid implements OnInit {

  category = input<string>('all');

  store = inject(EcommerceStore);
  api = inject(ApiService);

  isHandset = window.innerWidth <= 768;
  sidenavOpen = !this.isHandset;

  categories = signal<string[]>(['all']);
  
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const width = (event.target as Window).innerWidth;
    this.isHandset = width <= 768;
    if (!this.isHandset) {
      this.sidenavOpen = true;
    }
  }

  toggleSidenav() {
    this.sidenavOpen = !this.sidenavOpen;
  }

  ngOnInit() {
    this.store.loadProducts();
    this.loadCategories();
  }

  constructor() {
    this.store.setCategory(this.category); 
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (categories) => {
        const categoryNames = categories.map(cat => cat.name.toLowerCase());
        const uniqueCategoryNames = [...new Set(categoryNames)];
        this.categories.set(['all', ...uniqueCategoryNames]);
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
      }
    });
  }
}
