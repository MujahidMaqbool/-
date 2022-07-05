import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnumPurchaseOrderStatus, ENU_DateFormatName } from '@app/helper/config/app.enums';
import { Messages } from '@app/helper/config/app.messages';
import { DD_Branch } from '@app/models/common.model';
import { PurchaseOrderViewModel } from '@app/product/models/purchaseOrder.model';
import { DataSharingService } from '@app/services/data.sharing.service';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';

@Component({
  selector: 'app-view-purchase-order',
  templateUrl: './view.purchase.order.component.html'
})
export class ViewPurchaseOrderComponent extends AbstractGenericComponent implements OnInit {

  /***Region local members */
  messages = Messages;
  isDataExists: boolean = false;
  isDataExistsGRN: boolean = false;
  currencyFormat: string;
  grnTotal: number = 0;
  branchID:number = 0;
  grnTotalReceivedQuantity: number = 0;
  dateFormat: string = "";  
  enumPOStatus = EnumPurchaseOrderStatus;

  purchaseOrderViewModel: PurchaseOrderViewModel = new PurchaseOrderViewModel();




  constructor(
    private _dialog: MatDialogRef<ViewPurchaseOrderComponent>,
    private _dataSharingService: DataSharingService,

    @Inject(MAT_DIALOG_DATA) public purchaseOrderViewDetail: any,
  ) { super(); }

  ngOnInit(): void {
     this.getCurrentBranchDetail();
    this.isDataExists = this.purchaseOrderViewDetail.PurchaseOrderDetails && this.purchaseOrderViewDetail.PurchaseOrderDetails.length > 0  ? true : false;
    this.isDataExistsGRN = this.purchaseOrderViewDetail.grnList && this.purchaseOrderViewDetail.grnList.length > 0  ? true : false;

    this.purchaseOrderViewDetail?.grnList?.forEach(grn => {
        this.grnTotal = this.grnTotal + grn.GRNTotal;
        this.grnTotalReceivedQuantity = this.grnTotalReceivedQuantity + grn.ReceivedQuantity;
    });

  }


  async getCurrentBranchDetail() {
    this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);  

    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
        this.branchID = branch.BranchID;
        this.currencyFormat = branch.CurrencySymbol
    }
}
  
onCloseDialog() {
    this._dialog.close();
}


}