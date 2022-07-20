import { Component, OnInit, Output, EventEmitter, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { StripeService } from 'src/app/services/stripe.service';
import { ConnectStripeAccount } from 'src/app/setup/models/gateway.integration.model';

@Component({
  selector: 'app-uae-stripe-connect',
  templateUrl: './uae.stripe.connect.component.html',
})
export class UaeStripeConnectComponent implements OnInit {
  @ViewChild('connectStripeForm') connectStripeForm: NgForm;
  @Output() returnedUrl = new EventEmitter<any>();
  connectStripeAccount:ConnectStripeAccount = new ConnectStripeAccount();
  constructor(public dialogRef: MatDialogRef<UaeStripeConnectComponent>,
    private _stripeService: StripeService,
    @Inject(MAT_DIALOG_DATA) public redirect_Url: any) {

  }

  ngOnInit(): void {


  }
  /*****This method save client email for connecting stripe account  */
  onEmailSave() {
    this.connectStripeAccount.redirectUrl = this.redirect_Url;
    this._stripeService.connectStripeAccount(this.connectStripeAccount).then((retunedUrl: any) => {
      if (retunedUrl) {
        this.returnedUrl.emit(retunedUrl);
        this.dialogRef.close();
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
