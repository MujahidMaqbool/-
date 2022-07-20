import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ENU_DateFormatName, EnumSaleType, ENU_PaymentGateway } from 'src/app/helper/config/app.enums';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { Configurations } from 'src/app/helper/config/app.config';
import { SavePartialPaymentComponent } from '../partial-payment/save.partial.payment.component';
import { MatDialogService } from '../../generics/mat.dialog.service';

@Component({
  selector: 'payment-failed',
  templateUrl: './payment.failed.component.html'
})
export class PaymentFailedComponent extends AbstractGenericComponent implements OnInit {
  @Output() confirmProcessPayment = new EventEmitter<boolean>();

  saleDate: Date;
  dateTimeFormat: string = "";
  dateFormat: string = "";//Configurations.DateFormat;
  timeFormat = Configurations.TimeFormatView;
  branchName: string;
  currencyFormat: string;

  unProcessedPaymentsList: any[] = [];

  paymentType = EnumSaleType;
  paymentgateway = ENU_PaymentGateway;

  constructor(public _dialogRef: MatDialogRef<PaymentFailedComponent>,
        public _dateTimeService: DateTimeService,
        public _dataSharingService: DataSharingService,
        private _saleDialogue: MatDialogService,
    @Inject(MAT_DIALOG_DATA) public receiveData: any,
    ) {
      super();
    }

  ngOnInit(): void {
    this.getCurrentBranchDetail();
    this.unProcessedPaymentsList = this.receiveData.unProcessedPaymentsList;
  }
  

// Get Branch details 
  async getCurrentBranchDetail() {
    this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
    this.dateTimeFormat = this.dateFormat + " | " + this.timeFormat;
    // get due date according branch time zone
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.branchName = branch.BranchName;
      this.currencyFormat = branch.CurrencySymbol
    }
    this.saleDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
  }


onProcessPayment() {
  var result = this.receiveData.saleInvoiceNumber.split("-");
  var saleID = result[3];
  let data = {
      saleID: saleID,
      customerId: this.receiveData.customerID
  }
  // let saleID = cellData.data.SaleID;
  const dialogRef = this._saleDialogue.open(SavePartialPaymentComponent, {
      disableClose: true,
      panelClass: 'pos-full-popup',
      data: data
  });

  dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
          this.onCloseDialog();
      }
  });
}

// Close dialouge method
onCloseDialog() {
  this._dialogRef.close();
}

}
