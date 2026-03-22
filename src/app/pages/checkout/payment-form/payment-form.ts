import { Component } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { ViewPanel } from "../../../directives/view-panel";
import { MatRadioButton, MatRadioGroup } from "@angular/material/radio"

@Component({
  selector: 'app-payment-form',
  imports: [MatIcon, MatRadioGroup, MatRadioButton, ViewPanel],
  template: `
    <div appViewPanel>
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <mat-icon>payment</mat-icon>
        Payment Options
      </h2>
      <div>
        <mat-radio-group [value]="'gpay' ">
          <mat-radio-button value="gpay">
            <!-- <img src="gpay.png" alt="GPay" class="h-6" /> -->
             COD
          </mat-radio-button>
        </mat-radio-group>
      </div>
    </div>
  `,
  styles: ``,
})
export class PaymentForm {

}
