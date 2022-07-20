import { Component, Input, Output, EventEmitter, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { CustomerShippingAddress } from '../customer-billing-address/customer.billing.address.component';


@Component({
    selector: 'missing-billing-address',
    templateUrl: './missing.billing.address.dialog.html'
})

export class MissingBillingAddressDialog {

    @Input() redirectUrl: string;
    @Output() onCancel = new EventEmitter<boolean>();
    billingAddress:any;
    constructor(private _openDialog: MatDialogService,
        public dialogRef: MatDialogRef<MissingBillingAddressDialog>,
        @Inject(MAT_DIALOG_DATA) public data:any) { }

    onNo(isCancel : boolean) {
        this.onCancel.emit(isCancel);
        this.closePopup();
    }

    onRedirectToBillingAddress() {
        this.closePopup();
        this.showBillingAddressDialog();
        
       // this._router.navigate([this.redirectUrl]);
    }

    showBillingAddressDialog() {
        const dialog = this._openDialog.open(CustomerShippingAddress, {
            disableClose: true,
            data:this.data
        });
        dialog.componentInstance.onCancel.subscribe(isCancel =>{
            if(isCancel){
                this.onNo(isCancel);
            }else{
                this.onNo(isCancel);
            }
        });
    }

    closePopup() {
        this.dialogRef.close();
    }
}