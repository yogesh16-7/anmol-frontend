import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./layout/header/header";
import { EcommerceStore } from './ecommerce-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  template: `
    <app-header class="z-10" />
    <div class="h-[calc(100%-64px)] overflow-auto">
      <router-outlet />
    </div>
  `,
  styles: [],
})
export class App implements OnInit {
  private store = inject(EcommerceStore);

  ngOnInit() {
    console.log('App initialized, loading products...');
    this.store.loadProducts();
  }
}
