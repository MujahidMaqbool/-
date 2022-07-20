import { Component, Output, EventEmitter, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

@Component({
    selector: 'part-payment',
    templateUrl: 'part.payment.component.html'
})
export class PartPaymentComponent extends AbstractGenericComponent implements  OnInit {
    // #region Local Members

    currencyFormat: string;
    // currencySymbol: string;
    confirmChange: any;
    @Output()
    confirmPay = new EventEmitter<boolean>();
    @Output() isSaved = new EventEmitter<boolean>();
    // #endregion

    constructor(public dialogRef: MatDialogRef<PartPaymentComponent>,
        private _dataSharingService: DataSharingService,
        @Inject(MAT_DIALOG_DATA) public payment: any) { super(); }


    ngOnInit() {
        this.getCurrentBranchDetail();
    }

    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
    }
   

    onYes() {
        this.confirmPay.emit(true);
        this.closePopup();
    }

    onNo() {
        this.confirmPay.emit(false);
        this.closePopup();
    }


    closePopup() {
        this.dialogRef.close();
    }

}