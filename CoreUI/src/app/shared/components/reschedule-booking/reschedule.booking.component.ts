import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnumSaleType, ENU_Action_ActivityType, ENU_CancelItemType, ENU_ChargeFeeType, ENU_ChargeOption, ENU_ChargeValue, ENU_PaymentActionType, ENU_RefundOption, ENU_RefundValue } from 'src/app/helper/config/app.enums';
import { Messages } from 'src/app/helper/config/app.messages';
import { RescheduleBookingApi } from 'src/app/helper/config/app.webapi';
import { RescheduleBooking } from 'src/app/models/bookings.model';
import { ApiResponse } from 'src/app/models/common.model';
import { SalePaymentModeViewModel } from 'src/app/models/sale.model';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { CommonService } from 'src/app/services/common.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { MatDialogService } from '../generics/mat.dialog.service';
import { SavePartialPaymentComponent } from '../sale/partial-payment/save.partial.payment.component';
import { RefundPaymentComponent } from '../sale/refund-payment/refund.payment.component';

@Component({
  selector: 'app-reschedule-booking',
  templateUrl: './reschedule.booking.component.html'
})
export class RescheduleBookingComponent extends AbstractGenericComponent implements OnInit {
  @Output() isCancelled = new EventEmitter<boolean>();
  @Output() isConfirm = new EventEmitter<boolean>();
  chargeRefundObj: any = {}; // Charge and Refund model also containing the amount
  amountChargeRefund: number;
  currencyFormat: string;
  rescheduleObj : any = {} ;
  enumRefundValue = ENU_RefundValue;
  enumRefundOption = ENU_RefundOption;
  enumChargeValue = ENU_ChargeValue;
  enumChargeOption = ENU_ChargeOption;
  enumPaymentActionType = ENU_PaymentActionType;
  paymentType = EnumSaleType;
  enumActivityType = ENU_Action_ActivityType;
  bookingType = ENU_CancelItemType;
  isBenefitConsumed : boolean = false;
  disableConfirmBtn: boolean = false;

  /***********Messages*********/
  messages = Messages;

  RefundOptions = [
    { RefundTypeId: this.enumRefundValue.RefundNow, RefundTypeName: this.enumRefundOption.RefundNow },
    { RefundTypeId: this.enumRefundValue.RefundLater, RefundTypeName: this.enumRefundOption.RefundLater },
  ]
  ChargeOptions = [
    { ChargeTypeId: this.enumChargeValue.ChargeNow, ChargeTypeName: this.enumChargeOption.ChargeNow },
    { ChargeTypeId: this.enumChargeValue.ChargeLater, ChargeTypeName: this.enumChargeOption.chargeLater },
  ]

  constructor(
    public dialogRef: MatDialogRef<RescheduleBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dataSharingService: DataSharingService,
    private _commonService: CommonService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dialog: MatDialogService,
  ) { super(); }

  ngOnInit() {
    this.rescheduleObj.RefundTypeId = this.enumRefundValue.RefundNow;
    this.rescheduleObj.ChargeTypeId = this.enumChargeValue.ChargeNow;
    this.chargeRefundObj = this._commonService.calculateRefundorCharge(this.data.OldTotalDue, this.data.AmountPaid, this.data.CancellationCharges, this.data.ItemDiscountedPrice, false , ENU_ChargeFeeType.Reschedule , this.data.TotalAdjustment);
    this.amountChargeRefund = Math.abs(this.chargeRefundObj.Amount);
    // set opposite value of benefit consumed button as per discussion with faisal and ali
    this.isBenefitConsumed = this.data.ClassRescheduleBenefit == true ? false : true;

  }


  // get branch detail
  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.CurrencySymbol;
    }
  }

  //call when we save the Reschedule
  saveRescheduleBooking() {
    return new Promise<any>((isPromiseResolved, reject) => {
      try {
        let rescheduleBookingData = this.mapRescheduleData();

        this._httpService.save(RescheduleBookingApi.saveReschedule,rescheduleBookingData)
          .subscribe(async (response: ApiResponse) => {
            this.disableConfirmBtn = false;
            if (await response && response.MessageCode > 0) {
              isPromiseResolved(true);
              this._messageService.showSuccessMessage(this.messages.Success.Booking_Reschedule_Successfully.replace("{0}", this.data.CancelbookingType == ENU_CancelItemType.Class ? "Class" : "Service"));
              this.isConfirm.emit(true);
              this.onClosePopup();
            }
            else {
              this._messageService.showErrorMessage(response.MessageText);
            }
            error => {
              this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", this.data.CancelbookingType == ENU_CancelItemType.Class ? "Reschedule Class" : "Reschedule Service"))
            }
          }
          );
      }
      catch (err) {
        reject(this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", this.data.CancelbookingType == ENU_CancelItemType.Class ? "Reschedule Class" : "Reschedule Service")));
      }
    });
  }



  mapRescheduleData(){
    let rescheduleBookingData = new RescheduleBooking();
    rescheduleBookingData.CustomerID = this.data.CustomerID;
    rescheduleBookingData.ActivityType = this.enumActivityType.Reschedule;
    rescheduleBookingData.SaleID = this.data.SaleID;
    rescheduleBookingData.SaleDetailID = this.data.SaleID > 0 ? this.data.SaleDetailID : null;
    rescheduleBookingData.CustomerBookingID = this.data.SaleID == null ? this.data.CustomerBookingID : null;
    rescheduleBookingData.IsRefundNow = this.rescheduleObj.RefundTypeId == this.enumRefundValue.RefundNow && this.chargeRefundObj.IsRefund != null && this.chargeRefundObj.IsRefund ? true : false;
    rescheduleBookingData.IsChargeNow = this.rescheduleObj.ChargeTypeId == this.enumChargeValue.ChargeNow && this.chargeRefundObj.IsRefund != null && !this.chargeRefundObj.IsRefund ? true : false;
    rescheduleBookingData.ItemTypeID = this.data.CancelbookingType == ENU_CancelItemType.Class ? ENU_CancelItemType.Class : ENU_CancelItemType.Service;
    rescheduleBookingData.ItemID = this.data.ItemID;
    rescheduleBookingData.NewItemID = this.data.NewItemID;
    rescheduleBookingData.NewStartDate = this.data.NewStartDate;
    rescheduleBookingData.NewStartTime = this.data.NewStartTime;
    rescheduleBookingData.NewEndTime = this.data.NewEndTime;
    rescheduleBookingData.CustomerMembershipID = this.data.CustomerMembershipID;
    // send opposite value of benefit consumed button as per discussion with faisal and ali
    rescheduleBookingData.IsBenefitConsumed = this.isBenefitConsumed == true ? false : true;
    rescheduleBookingData.TotalAjustment = this.data.TotalAjustment;
    rescheduleBookingData.DiscountType = this.data.CustomerMembershipID && this.data.CustomerMembershipID > 0 ? this.data.DiscountType : "";
    //In case of equal Amount calculateRefundorCharge return IsRefund and Amount Null so we set the Action Type No Change and ChargesAmount 0
    if (this.chargeRefundObj.IsRefund == null ) {
      rescheduleBookingData.ActionType = this.enumPaymentActionType.NoChange;
      rescheduleBookingData.ChargesAmount =  0;
    } else {
      rescheduleBookingData.ActionType = this.chargeRefundObj.IsRefund == true ? this.enumPaymentActionType.Refund : this.enumPaymentActionType.Charge;
      rescheduleBookingData.ChargesAmount = this.amountChargeRefund;
    }
    /** Only For service send FacilityID, Notes, StaffID */
    if(rescheduleBookingData.ItemTypeID == ENU_CancelItemType.Service) {
      rescheduleBookingData.StaffID = this.data.StaffID;
      rescheduleBookingData.FacilityID = this.data.FacilityID;
      rescheduleBookingData.Notes = this.data.Notes;
    }

    let salePaymentMode = new SalePaymentModeViewModel();
        salePaymentMode.amount = this.amountChargeRefund;
        salePaymentMode.paymentGatewayID = this.paymentType.Cash
        salePaymentMode.saleTypeID =  this.paymentType.Cash;

        rescheduleBookingData.paymentModes =  [salePaymentMode];

    return rescheduleBookingData;
   }

   onOpenRefundPaymentDialog() {
    const dialogRef = this._dialog.open(RefundPaymentComponent, {
      disableClose: true,
      data: {
        RefundedModel:this.mapRescheduleData(),
        SaleID: this.data.SaleID,
        SaleDetailID: this.data.SaleDetailID,
        chargedType: ENU_ChargeFeeType.Reschedule,
        IsRefunded: true,
        RefundedAmount: this.amountChargeRefund,
        Url: RescheduleBookingApi.saveReschedule,
        ItemRescheduleCharges : this.amountChargeRefund,
      }
    });
    // when we click the cancel confirm button in refund popup
    dialogRef.componentInstance.isSaved.subscribe( (isRefund: boolean) => {
      if (isRefund) {
            this._messageService.showSuccessMessage(this.messages.Success.Booking_Reschedule_Successfully.replace("{0}", this.data.CancelbookingType == ENU_CancelItemType.Class ? "Class" : "Service") );
            this.isConfirm.emit(true);
            // this.isCancellationComplete.emit(true);
            this.onClosePopup();
      }
      else {
        dialogRef.close();
        this.disableConfirmBtn = false;
      }
    });
  }


        //call when we select the charge now from drop down
  onOpenPartialPaymentDialog() {
    const dialogRef = this._dialog.open(SavePartialPaymentComponent, {
      disableClose: true,
      panelClass: 'pos-full-popup',
      data: {
        ChargedModel:this.mapRescheduleData(),
        saleID: this.data.SaleID,
        customerId: this.data.CustomerID,
        saleDetailID: this.data.SaleDetailID,
        isItemChargedFee : true,
        chargedType: ENU_ChargeFeeType.Reschedule,
        itemChargedAmount: this.amountChargeRefund,
        isBookingID: this.data.IsBookingID,
        CustomerBookingID:this.data.CustomerBookingID,
        newItemName : this.data.newItemName,
        newItemPricePerSesion : this.data.newItemPricePerSesion,
        Url:  RescheduleBookingApi.saveReschedule,
        ItemRescheduleCharges : this.amountChargeRefund,
        TotalEarnedRewardPoints: this.data.TotalEarnedRewardPoints

      }
    });
    dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this._messageService.showSuccessMessage(this.messages.Success.Booking_Reschedule_Successfully.replace("{0}",  this.data.CancelbookingType == ENU_CancelItemType.Class ? "Class" : "Service"));
        this.isConfirm.emit(true);
        // this.isCancellationComplete.emit(true);
        dialogRef.close()
        this.onClosePopup();
      }
      else {
        dialogRef.close();
        this.disableConfirmBtn = false;
      }
    });
  }

  onConfirm() {
    this.disableConfirmBtn = true;

    if (this.chargeRefundObj.IsRefund) {

      if (this.rescheduleObj.RefundTypeId == this.enumRefundValue.RefundNow) {
        this.onOpenRefundPaymentDialog();
      }
      else {
        this.saveRescheduleBooking()
      }
    }
    else if (this.chargeRefundObj.IsRefund == false) {
      if (this.rescheduleObj.ChargeTypeId == this.enumChargeValue.ChargeNow) {

        this.onOpenPartialPaymentDialog();
      }
     else {
        this.saveRescheduleBooking()
      }
    }
    else {//this is the equal case
      this.saveRescheduleBooking()
    }
  }

  onCancel(){
    this.onClosePopup();
    this.isCancelled.emit(true)
  }

  onClosePopup() {
    this.dialogRef.close();
  }

}
