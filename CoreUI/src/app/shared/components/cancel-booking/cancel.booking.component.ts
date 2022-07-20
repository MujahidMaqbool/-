// #region Imports

/********************** Angular Refrences *********************/
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**********************  Configurations *********************/
import { CustomerType, ENU_CancelItemType, ENU_Action_ActivityType, ENU_CancellationReasonOption, ENU_CancellationReasonValue, ENU_cancellationTypeOption, ENU_cancellationTypeValue, ENU_ChargeOption, ENU_ChargeValue, ENU_RefundOption, ENU_RefundValue, ENU_PaymentActionType, ENU_ChargeFeeType, EnumSaleType, EnumSaleStatusType } from 'src/app/helper/config/app.enums';
import { CancelNoShowBookingApi , SchedulerServicesApi } from 'src/app/helper/config/app.webapi';
import { Configurations } from 'src/app/helper/config/app.config';

/**********************  Components  *************************/
import { RefundPaymentComponent } from '../sale/refund-payment/refund.payment.component';
import { SavePartialPaymentComponent } from '../sale/partial-payment/save.partial.payment.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

/********************** Services & Models *********************/
import { DateTimeService } from 'src/app/services/date.time.service';
import { CommonService } from 'src/app/services/common.service';
import { MatDialogService } from '../generics/mat.dialog.service';
import { CancelNoShowBooking, CancelNoshowDialogModel } from 'src/app/models/bookings.model';
import { HttpService } from 'src/app/services/app.http.service';
import { ApiResponse } from 'src/app/models/common.model';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { SaleDetail, SaleHistoryDetailList, SalePaymentModeViewModel } from 'src/app/models/sale.model';
import { DataSharingService } from 'src/app/services/data.sharing.service';



// #endregion



@Component({
  selector: 'app-cancel-booking',
  templateUrl: './cancel.booking.component.html'
})
export class CancelBookingComponent extends AbstractGenericComponent implements OnInit {

  /*********** region Local Members ****/

  @Output() confirm = new EventEmitter<boolean>();
  @Output() isCancellationComplete = new EventEmitter<boolean>(false);
  @Output() isServiceCancellationChargesZero = new EventEmitter<boolean>(false);

   /***********Messages*********/
   messages = Messages;

  /*********** Configurations *********/
  personType = CustomerType;
  bookingType = ENU_CancelItemType;
  enumCancelActivityType = ENU_Action_ActivityType;
  enumCancellationTypeValue = ENU_cancellationTypeValue;
  enumCancellationTypeOption = ENU_cancellationTypeOption;
  enumCancellationReasonValue = ENU_CancellationReasonValue;
  enumCancellationReasonOption = ENU_CancellationReasonOption;
  enumPaymentActionType = ENU_PaymentActionType;
  enumRefundValue = ENU_RefundValue;
  enumRefundOption = ENU_RefundOption;
  enumChargeValue = ENU_ChargeValue;
  enumChargeOption = ENU_ChargeOption;
  paymentType = EnumSaleType;
  enumSaleStatusType = EnumSaleStatusType;

  /*********** Local *******************/

  cancellationObj: any = {}; // Main cancellation model
  chargeRefundObj: any = {}; // Charge and Refund model also containing the amount
  memberBenefits: boolean = true;
  amountChargeRefund: number;
  saleDetail: SaleDetail;
  dateFormat = Configurations.DateFormat;
  currencyFormat: string;
  itemCharges:number
  isBenefitConsumed : boolean;
  disableConfirmBtn: boolean = false;
  /***********Model Reference*********/
  dialogData: CancelNoshowDialogModel

  /**********  Dropdown List ************/
  cancellationTypeOptions = [
    { CancellationTypeId: this.enumCancellationTypeValue.EarlyCancellation, CancellationTypeName: this.enumCancellationTypeOption.EarlyCancellation },
    { CancellationTypeId: this.enumCancellationTypeValue.LateCancellation, CancellationTypeName: this.enumCancellationTypeOption.LateCancellation }
  ]
  cancellationReasonOptions = [
    { CancellationReasonTypeId: this.enumCancellationReasonValue.Bookingtimenotsuitable, CancellationReasonTypeName: this.enumCancellationReasonOption.Bookingtimenotsuitable },
    { CancellationReasonTypeId: this.enumCancellationReasonValue.Customerwantstochangebookingdetails, CancellationReasonTypeName: this.enumCancellationReasonOption.Customerwantstochangebookingdetails },
    { CancellationReasonTypeId: this.enumCancellationReasonValue.Customernolongerrequiresthisbooking, CancellationReasonTypeName: this.enumCancellationReasonOption.Customernolongerrequiresthisbooking },
    { CancellationReasonTypeId: this.enumCancellationReasonValue.Customerwasunsatisfiedwiththeirlastbooking, CancellationReasonTypeName: this.enumCancellationReasonOption.Customerwasunsatisfiedwiththeirlastbooking },
    { CancellationReasonTypeId: this.enumCancellationReasonValue.Customerneedstoreschedulethisbooking, CancellationReasonTypeName: this.enumCancellationReasonOption.Customerneedstoreschedulethisbooking },
    { CancellationReasonTypeId: this.enumCancellationReasonValue.CancelledbyStaff, CancellationReasonTypeName: this.enumCancellationReasonOption.CancelledbyStaff },
  ]
  RefundOptions = [
    { RefundTypeId: this.enumRefundValue.RefundNow, RefundTypeName: this.enumRefundOption.RefundNow },
    { RefundTypeId: this.enumRefundValue.RefundLater, RefundTypeName: this.enumRefundOption.RefundLater },
  ]
  ChargeOptions = [
    { ChargeTypeId: this.enumChargeValue.ChargeNow, ChargeTypeName: this.enumChargeOption.ChargeNow },
    { ChargeTypeId: this.enumChargeValue.ChargeLater, ChargeTypeName: this.enumChargeOption.chargeLater },
  ]

  constructor(
    public dialogRef: MatDialogRef<CancelBookingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _commonService: CommonService,
    private _dialog: MatDialogService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dateTimeService: DateTimeService,
    private _dataSharingService: DataSharingService,

  ) { super()}

  ngOnInit(): void {
    this.dialogData = this.data.cancelNoShowData;
    this.checkEarlyOrLateCancellation(); /* Check if cancellation early or cancellation late is ON in configuration then load option accordingly in dropdown*/
    this.setDefaultValue()
  }

  checkEarlyOrLateCancellation(){
    if (!this.dialogData?.IsClassAttendance) {
      this.chargeRefundObj = this._commonService.calculateRefundorCharge(this.dialogData.OldTotalDue, this.dialogData.AmountPaid, 0, this.dialogData.ItemDiscountedPrice, this.dialogData.IsCancellationFeeInPercentage);
    }
    else {//only for attendance screen by default we set later cases for both charge and refund
      this.chargeRefundObj = this._commonService.calculateRefundorCharge(this.dialogData.OldTotalDue, this.dialogData.AmountPaid, this.dialogData.CancellationCharges, this.dialogData.ItemDiscountedPrice, this.dialogData.IsCancellationFeeInPercentage);
    }

    if (!this.dialogData?.CancellationLate) {
     /* If Late Cancellation is OFF then remove option "Late Cancellation" option from dropdown*/
        this.cancellationTypeOptions = this.cancellationTypeOptions.splice(this.cancellationTypeOptions.findIndex(option => option.CancellationTypeId === this.enumCancellationTypeValue.EarlyCancellation) , 1);
        this.cancellationObj.CancellationTypeId = this.enumCancellationTypeValue.EarlyCancellation
        this.onCancellationChangeType()
    } else if (!this.dialogData?.CancellationEarly) {
        /* If Early Cancellation is OFF then remove option "Early Cancellation" option from dropdown*/
        this.cancellationTypeOptions = this.cancellationTypeOptions.splice(this.cancellationTypeOptions.findIndex(option => option.CancellationTypeId === this.enumCancellationTypeValue.LateCancellation) , 1);
        this.cancellationObj.CancellationTypeId = this.enumCancellationTypeValue.LateCancellation
        this.onCancellationChangeType()

    }
  }
  // here we are setting the drop down default values and selecting the early cancellation by default
  setDefaultValue() {
      this.isBenefitConsumed = this.dialogData.ClassCancellationEarlyBenefit;
      this.amountChargeRefund = Math.abs(this.chargeRefundObj.Amount);
      this.cancellationObj.CancellationReasonTypeId = this.enumCancellationReasonValue.CancelledbyStaff;
      this.cancellationObj.CancellationTypeId = this.dialogData.IsClassAttendance ? this.enumCancellationTypeValue.LateCancellation : this.cancellationTypeOptions[0].CancellationTypeId; //this.enumCancellationTypeValue.EarlyCancellation;
      this.cancellationObj.RefundTypeId = this.dialogData.IsClassAttendance ? this.enumRefundValue.RefundLater : this.enumRefundValue.RefundNow;
      this.cancellationObj.ChargeTypeId = this.dialogData.IsClassAttendance ? this.enumChargeValue.ChargeLater : this.enumChargeValue.ChargeNow;
      this.cancellationObj.ClassCancellationLateBenefit = this.dialogData.ClassCancellationLateBenefit;
      this.cancellationObj.ClassCancellationEarlyBenefit =  this.dialogData.ClassCancellationEarlyBenefit;

      this.getCurrentBranchDetail();
      this.calculateItemPercentageCharges();
  }

  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.CurrencySymbol;
    }
  }

  // call when click on cancel button of pop up
  onCancel() {
    this.confirm.emit(false);
    this.onClosePopup();
  }


  // call when we click on confirm button of pop up
  onConfirm() {
    this.disableConfirmBtn = true;
    if(this.dialogData.CancelbookingType == ENU_CancelItemType.Service && this.amountChargeRefund == 0 && this.dialogData.SaleID == 0){
      this.isServiceCancellationChargesZero.emit(true);
      this.onClosePopup();
    }
            else {
              if (this.chargeRefundObj.IsRefund) {
                if (this.cancellationObj.RefundTypeId == this.enumRefundValue.RefundNow) {
                  this.onOpenRefundPaymentDialog();
                }
                else {
                  this.saveCancellation()
                }
              }
              else if (this.chargeRefundObj.IsRefund == false) {
                if (this.cancellationObj.ChargeTypeId == this.enumChargeValue.ChargeNow) {
                  if (this.dialogData.IsBookingID) {
                    this.getBookingDetail();
                  }
                  else {
                    this.onOpenPartialPaymentDialog();
                  }
                }
                else {
                  this.saveCancellation()
                }
              }
              else {//this is the equal case
                this.saveCancellation()
              }
            }
  }

  onClosePopup() {
      this.dialogRef.close();
  }

  // call when change the status (charge now and charge later || refund now and refund later)
  onChangeStatus() { }


  onChangeBenefitsSwitch(event) {
    if (this.cancellationObj.CancellationTypeId == this.enumCancellationTypeValue.EarlyCancellation) {
       this.cancellationObj.ClassCancellationEarlyBenefit = event.checked;
       this.cancellationObj.ClassCancellationLateBenefit = this.dialogData.ClassCancellationLateBenefit;
    }
    else {
      this.cancellationObj.ClassCancellationLateBenefit = event.checked;
      this.cancellationObj.ClassCancellationEarlyBenefit =  this.dialogData.ClassCancellationEarlyBenefit;


    }
  }

  /* call when we change the cancellation status (early cancellation and late cancellation) */
  onCancellationChangeType() {
      if (this.cancellationObj.CancellationTypeId == this.enumCancellationTypeValue.EarlyCancellation) {
        /* oldTotalDue,amountPaid ,cancellationCharges ,itemPrice,percentage */
        this.chargeRefundObj = this._commonService.calculateRefundorCharge(this.dialogData.OldTotalDue, this.dialogData.AmountPaid, 0, this.dialogData.ItemDiscountedPrice, this.dialogData.IsCancellationFeeInPercentage);
        this.amountChargeRefund = Math.abs(this.chargeRefundObj.Amount);
        this.isBenefitConsumed = this.dialogData.ClassCancellationEarlyBenefit;

      }
      else {
        this.chargeRefundObj = this._commonService.calculateRefundorCharge(this.dialogData.OldTotalDue, this.dialogData.AmountPaid, this.dialogData.CancellationCharges, this.dialogData.ItemDiscountedPrice, this.dialogData.IsCancellationFeeInPercentage);
        this.amountChargeRefund = Math.abs(this.chargeRefundObj.Amount);
        this.isBenefitConsumed = this.dialogData.ClassCancellationLateBenefit;

      }
  }

  // call when we change the reason from reason dropdown
  onReasonChange() {}

  //call when we save the cancellation
  saveCancellation() {
    return new Promise<any>((isPromiseResolved, reject) => {
      try {
        let cancelBookingData = this.mapCancellationData();
        let cancellationEndPoint = this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? CancelNoShowBookingApi.saveClassNoShowCancelation : SchedulerServicesApi.cancelNoShowSaleServiceStatus;

        this._httpService.save( cancellationEndPoint, cancelBookingData)
          .subscribe(async (response: ApiResponse) => {
            this.disableConfirmBtn = false;
            if (await response && response.MessageCode > 0) {
              isPromiseResolved(true);
              this._messageService.showSuccessMessage(this.messages.Success.Booking_Cancel_Successfully.replace("{0}", this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? "Class" : "Service"));
              this.confirm.emit(true);
              this.isCancellationComplete.emit(true);
              this.onClosePopup();
            }
            else {
              this._messageService.showErrorMessage(response.MessageText);
            }
            error => {
              this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Cancel Booking"))
            }
          }
          );
      }
      catch (err) {
        reject(this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Cancel Booking")));
      }
    });
  }
   mapCancellationData(){
    let cancelBookingData = new CancelNoShowBooking();
    cancelBookingData.PaymentGatewayID = this.paymentType.Cash;
    cancelBookingData.CustomerID = this.dialogData.CustomerID;
    cancelBookingData.ActivityType = this.enumCancelActivityType.Cancellation;
    cancelBookingData.SaleID = this.dialogData.SaleID;
    cancelBookingData.SaleDetailID = this.dialogData.SaleID>0 ?this.dialogData.SaleDetailID:null;
    cancelBookingData.CustomerBookingID=this.dialogData.SaleID==null ?this.dialogData.CustomerBookingID:null;
    cancelBookingData.IsRefundNow = this.cancellationObj.RefundTypeId == this.enumRefundValue.RefundNow && this.chargeRefundObj.IsRefund != null && this.chargeRefundObj.IsRefund ? true : false;
    cancelBookingData.IsChargeNow = this.cancellationObj.ChargeTypeId == this.enumChargeValue.ChargeNow && this.chargeRefundObj.IsRefund != null && !this.chargeRefundObj.IsRefund ? true : false;
    cancelBookingData.ReasonID = this.cancellationObj.CancellationReasonTypeId;
    cancelBookingData.ItemTypeID = this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? ENU_CancelItemType.Class : ENU_CancelItemType.Service;
    cancelBookingData.ItemID = this.dialogData.ItemID;
    cancelBookingData.IsEarlyCancellationSelected = this.cancellationObj.CancellationTypeId == this.enumCancellationTypeValue.EarlyCancellation || this.dialogData?.IsEarlyCancellation ? true : false;
    cancelBookingData.CustomerPaymentGatewayID = this.cancellationObj.CustomerPaymentGatewayID;
    cancelBookingData.Notes = this.cancellationObj.Notes;
    cancelBookingData.SaleTypeID = this.paymentType.Cash
    cancelBookingData.DiscountType = this.dialogData.DiscountType;
    cancelBookingData.CustomerMembershipID = this.dialogData.CustomerMembershipID;
    if(this.dialogData.CustomerTypeId == CustomerType.Member) {
      cancelBookingData.IsBenefitConsumed =  this.isBenefitConsumed;
    }

    //In case of equal Amount calculateRefundorCharge return IsRefund and Amount Null so we set the Action Type No Change and ChargesAmount 0
    if (this.chargeRefundObj.IsRefund == null ) {
      cancelBookingData.ActionType = this.enumPaymentActionType.NoChange
      cancelBookingData.ChargesAmount =  0;
    } else {
      cancelBookingData.ActionType = this.chargeRefundObj.IsRefund == true ? this.enumPaymentActionType.Refund : this.enumPaymentActionType.Charge;
      cancelBookingData.ChargesAmount = this.amountChargeRefund;
    }

     let salePaymentMode = new SalePaymentModeViewModel();
     salePaymentMode.amount = this.amountChargeRefund;
     salePaymentMode.paymentGatewayID = this.paymentType.Cash;
     salePaymentMode.saleTypeID = this.paymentType.Cash;

     cancelBookingData.paymentModes = [salePaymentMode];

    return cancelBookingData;
   }



        //call when we select the refund now from drop down
  onOpenRefundPaymentDialog() {
    const dialogRef = this._dialog.open(RefundPaymentComponent, {
      disableClose: true,
      data: {
        RefundedModel:this.mapCancellationData(),
        SaleID: this.dialogData.SaleID,
        SaleDetailID: this.dialogData.SaleDetailID,
        chargedType: ENU_ChargeFeeType.Cancellation,
        IsRefunded: true,
        RefundedAmount: this.amountChargeRefund,
        Url: this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? CancelNoShowBookingApi.saveClassNoShowCancelation : SchedulerServicesApi.cancelNoShowSaleServiceStatus,
        ItemCancellationCharges : this.cancellationObj.CancellationTypeId == this.enumCancellationTypeValue.EarlyCancellation  ? 0 : this.itemCharges
      }
    });
    // when we click the cancel confirm button in refund popup
    dialogRef.componentInstance.isSaved.subscribe( (isRefund: boolean) => {
      if (isRefund) {
            this._messageService.showSuccessMessage(this.messages.Success.Booking_Cancel_Successfully.replace("{0}", this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? "Class" : "Service"));
            this.confirm.emit(true);
            this.isCancellationComplete.emit(true);
            dialogRef.close()
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
        ChargedModel:this.mapCancellationData(),
        saleID: this.dialogData.SaleID,
        customerId: this.dialogData.CustomerID,
        saleDetailID: this.dialogData.SaleDetailID,
        isItemChargedFee : true,
        chargedType: ENU_ChargeFeeType.Cancellation,
        itemChargedAmount: this.amountChargeRefund,
        isBookingID: this.dialogData.IsBookingID,
        CustomerBookingID:this.dialogData.CustomerBookingID,
        BookingData: this.saleDetail,
        Url: this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? CancelNoShowBookingApi.saveClassNoShowCancelation : SchedulerServicesApi.cancelNoShowSaleServiceStatus,
        ItemCancellationCharges : this.itemCharges
      }
    });
    dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this._messageService.showSuccessMessage(this.messages.Success.Booking_Cancel_Successfully.replace("{0}", this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? "Class" : "Service"));
        this.confirm.emit(true);
        this.isCancellationComplete.emit(true);
        dialogRef.close()
        this.onClosePopup();
      }
      else {
        dialogRef.close();
        this.disableConfirmBtn = false ;
      }
    });
  }

  calculateItemPercentageCharges(){
    if(this.dialogData.IsCancellationFeeInPercentage){
      var calculatePercentage = (this.dialogData.CancellationCharges / 100) * this.dialogData.ItemDiscountedPrice;
      this.itemCharges = calculatePercentage
    }
    else{
      this.itemCharges = this.dialogData.CancellationCharges

    }
  }

  getBookingDetail(){
    let date = this._dateTimeService.convertDateObjToString(this.dialogData.ServiceStartDate, this.dateFormat);
        this._httpService.get(SchedulerServicesApi.getServiceDetailByBookingID + this.dialogData.CustomerID + "/" + this.dialogData.CustomerBookingID + "/" + date)
    .subscribe((res: ApiResponse) => {

        if (res && res.MessageCode > 0) {
            if (res.Result) {

                this.saleDetail = new SaleDetail();

                this.saleDetail.ItemList = [];
                this.saleDetail.CustomerName = res.Result.CustomerName;
                this.saleDetail.Email = res.Result.Email;
                this.saleDetail.CustomerTypeID = res.Result.CustomerTypeID;
                this.saleDetail.CustomerTypeName = res.Result.CustomerTypeName;

                let serviceItem = new SaleHistoryDetailList();
                serviceItem.ItemTypeID = ENU_CancelItemType.Service;
                serviceItem.ItemQty = 1;
                serviceItem.ItemName = res.Result.ServiceBookingList[0].ItemName;
                serviceItem.StartDate = res.Result.ServiceBookingList[0].StartDate;
                serviceItem.StartTime = res.Result.ServiceBookingList[0].StartTime;
                serviceItem.EndTime = res.Result.ServiceBookingList[0].EndTime;
                serviceItem.PricePerSession = res.Result.ServiceBookingList[0].Price;
                serviceItem.ItemPricePerUnit = res.Result.ServiceBookingList[0].Price;
                this.saleDetail.ItemList.push(serviceItem);

                this.onOpenPartialPaymentDialog();
            }
        }
        else {
          this._messageService.showErrorMessage(res.MessageText)
        }
    },
        error => {
            //this.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', "Sale Detail"));
        }
    );
  }
}
