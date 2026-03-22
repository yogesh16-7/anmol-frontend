import { Component, inject, OnInit } from '@angular/core';
import { ViewPanel } from "../../../directives/view-panel";
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EcommerceStore } from '../../../ecommerce-store';

@Component({
  selector: 'app-shipping-form',
  imports: [ViewPanel, MatIcon, MatFormField, MatInput, ReactiveFormsModule],
  template: `
    <div appViewPanel>
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <mat-icon>local_shipping</mat-icon>
        Shipping Information
      </h2>
      <form [formGroup]="shippingForm" class="grid grid-cols-1 lg:grid-cols-2 gap-4" (ngSubmit)="onSubmit()">
        <mat-form-field class="col-span-2">
          <textarea matInput formControlName="address" placeholder="Address Line 1"></textarea>
        </mat-form-field>
        <mat-form-field class="col-span-2">
          <textarea matInput formControlName="address2" placeholder="Address Line 2 (Optional)"></textarea>
        </mat-form-field>
        <mat-form-field>
          <input matInput formControlName="city" placeholder="City" />
        </mat-form-field>
        <mat-form-field>
          <input matInput formControlName="zip" placeholder="Zip Code" />
        </mat-form-field>
        <mat-form-field>
          <input matInput formControlName="country" placeholder="Country" />
        </mat-form-field>
        <mat-form-field>
          <input matInput formControlName="phone" placeholder="Phone Number" />
        </mat-form-field>
      </form>
    </div>
  `,
  styles: ``,
})
export class ShippingForm implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(EcommerceStore);

  shippingForm: FormGroup = this.fb.group({
    address: ['', Validators.required],
    address2: ['', Validators.required],
    city: ['', Validators.required],
    zip: ['', Validators.required],
    country: ['', Validators.required],
    phone: ['', Validators.required],
  });

  ngOnInit() {
    // Pre-populate form if shipping address exists in store
    const address = this.store.shippingAddress();
    if (address) {
      this.shippingForm.patchValue({
        address: address.address,
        address2: address.address2,
        city: address.city,
        zip: address.zip,
        country: address.country,
        phone: address.phone,
      });
    }

    // Update store when form changes
    this.shippingForm.valueChanges.subscribe(value => {
      this.store.updateShippingAddress({
        address: value.address,
        address2: value.address2,
        city: value.city,
        zip: value.zip,
        country: value.country,
        phone: value.phone,
      });
    });
  }

  onSubmit() {
    const value = this.shippingForm.value;
    this.store.updateShippingAddress({
      address: value.address,
      address2: value.address2,
      city: value.city,
      zip: value.zip,
      country: value.country,
      phone: value.phone,
    });
  }
}
