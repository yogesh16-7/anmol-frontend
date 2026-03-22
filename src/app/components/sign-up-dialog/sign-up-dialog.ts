import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconButton, MatAnchor, MatButton } from '@angular/material/button';
import { MatIcon } from "@angular/material/icon";
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from "@angular/material/dialog"
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormField, MatPrefix, MatError } from "@angular/material/form-field"
import { MatInput } from "@angular/material/input"
import { SignInParams, SignUpParams } from '../../models/user';
import { EcommerceStore } from '../../ecommerce-store';
import { SignInDialog } from '../sign-in-dialog/sign-in-dialog';

@Component({
  selector: 'app-sign-up-dialog',
  imports: [CommonModule, MatIconButton, MatIcon, MatDialogClose, MatFormField, MatInput, 
    MatPrefix, MatError, MatAnchor, MatButton, ReactiveFormsModule],
  template: `
    <div class="p-8 max-w-[400px] flex flex-col">
      <div class="flex justify-between">
        <div>
          <h2 class="text-x1 font-medium mb-1">Sign Up</h2>
          <p class="text-sm text-gray-500">Join us and start shopping today</p>
        </div>
        <button tabindex="-1" matIconButton class="-mt-2 -mr-2" mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <form [formGroup]="signUpForm" class="mt-6 flex flex-col" (ngSubmit)="signUp()">
        <mat-form-field class="mb-4">
          <input matInput  formControlName="name" type="text" placeholder="Enter your name" />
          <mat-icon matPrefix>person</mat-icon>
        </mat-form-field>
        <mat-form-field class="mb-4">
          <input  matInput formControlName="email" type="email" placeholder="Enter your email" />
          <mat-icon matPrefix>email</mat-icon>
        </mat-form-field>
        <mat-form-field class="mb-4">
          <input matInput formControlName="password" type="password" placeholder="Enter your password" />
          <mat-icon matPrefix>lock</mat-icon>
        </mat-form-field>
        <mat-form-field class="mb-4">
          <input matInput formControlName="confirmPassword" type="password" placeholder="Confirm your password" />
          <mat-icon matPrefix>lock</mat-icon>
          <mat-error *ngIf="signUpForm.hasError('passwordMismatch')">Passwords do not match</mat-error>
        </mat-form-field>
        <mat-form-field class="mb-4">
          <input matInput formControlName="phone" type="tel" placeholder="Enter your phone number" />
          <mat-icon matPrefix>phone</mat-icon>
        </mat-form-field>
        <mat-form-field class="mb-4">
          <input matInput formControlName="street" type="text" placeholder="Enter your street address" />
          <mat-icon matPrefix>home</mat-icon>
        </mat-form-field>
        <mat-form-field class="mb-4">
          <input matInput formControlName="apartment" type="text" placeholder="Enter your apartment/unit" />
          <mat-icon matPrefix>apartment</mat-icon>
        </mat-form-field>
        <mat-form-field class="mb-4">
          <input matInput formControlName="zip" type="text" placeholder="Enter your zip code" />
          <mat-icon matPrefix>location_on</mat-icon>
        </mat-form-field>
        <mat-form-field class="mb-4">
          <input matInput formControlName="city" type="text" placeholder="Enter your city" />
          <mat-icon matPrefix>location_city</mat-icon>
        </mat-form-field>
        <mat-form-field class="mb-4">
          <input matInput formControlName="country" type="text" placeholder="Enter your country" />
          <mat-icon matPrefix>flag</mat-icon>
        </mat-form-field>
        <button type="submit" matButton="filled" class="w-full">Create Account</button>
      </form>
      <p class="text-sm text-gray-500 mt-2 text-center">
        Already have an account?
        <a class="text-blue-600 cursor-pointer" (click)="openSignInDialog()">Sign In</a>
      </p>
    </div>  
  `,
  styles: ``,
})
export class SignUpDialog {

  fb = inject(NonNullableFormBuilder);
  dialogRef = inject(MatDialogRef);
  store = inject(EcommerceStore);
  matDialog = inject(MatDialog);
  data = inject<{ checkout: boolean }>(MAT_DIALOG_DATA);

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  signUpForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    phone: ['', Validators.required],
    street: [''],
    apartment: [''],
    zip: [''],
    city: [''],
    country: ['']
  }, { validators: this.passwordMatchValidator });

  signUp() {

    if(!this.signUpForm.valid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const { name, email, password, phone, street, apartment, zip, city, country } = this.signUpForm.value;

    this.store.signUp({ 
      name, 
      email, 
      password, 
      phone, 
      street, 
      apartment, 
      zip, 
      city, 
      country,
      dialogId: this.dialogRef.id, 
      checkout: this.data?.checkout 
    } as SignUpParams);
  }

  openSignInDialog() {
    this.dialogRef.close();
    this.matDialog.open(SignInDialog, {
      disableClose: true,
      data: {
        checkout: this.data?.checkout,
      }
    })
  }
}
