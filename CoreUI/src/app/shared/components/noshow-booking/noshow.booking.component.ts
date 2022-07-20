// #region Imports

/********************** Angular Refrences *********************/
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/**********************  Configurations *********************/
import { CustomerType , EnumSaleType, ENU_Action_ActivityType, ENU_CancelItemType, ENU_cancellationTypeValue, ENU_ChargeFeeType, ENU_ChargeOption, ENU_ChargeValue, ENU_NoShowReasonOption, ENU_NoShowReasonValue, ENU_PaymentActionType, ENU_RefundOption, ENU_RefundValue } from 'src/app/helper/config/app.enums';
import { CancelNoShowBookingApi, SchedulerServicesApi } from 'src/app/helper/config/app.webapi';
import { Configurations } from 'src/app/helper/config/app.config';

/**********************  Components  *************************/
import { RefundPaymentComponent } from '../sale/refund-payment/refund.payment.component';
import { SavePartialPaymentComponent } from '../sale/partial-payment/save.partial.payment.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

/********************** Services & Models *********************/
import { DateTimeService } from 'src/app/services/date.time.service';
import { CommonService } from 'src/app/services/common.service';
import { CancelNoshowDialogModel, CancelNoShowBooking} from 'src/app/models/bookings.model';
import { HttpService } from 'src/app/services/app.http.service';
import { ApiResponse} from 'src/app/models/common.model';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { MatDialogService } from '../generics/mat.dialog.service';
import { SaleDetail, SaleHistoryDetailList, SalePaymentModeViewModel } from 'src/app/models/sale.model';
import { DataSharingService } from 'src/app/services/data.sharing.service';



// #endregion

@Component({
  selector: 'app-noshow-booking',
  templateUrl: './noshow.booking.component.html'
})
export class NoShowBookingComponent extends AbstractGenericComponent implements OnInit {

  /*********** region Local Members ****/
  @Output() confirm = new EventEmitter<boolean>();
  @Output() isServiceNoShowChargesZero = new EventEmitter<boolean>(false);

   /***********Messages*********/
   messages = Messages;

   /***********Model Reference*********/
   dialogData: CancelNoshowDialogModel

  /*********** Configurations *********/

  personType = CustomerType;
  cancellationTypeValue = ENU_cancellationTypeValue;
  enumRefundValue = ENU_RefundValue;
  enumRefundOption = ENU_RefundOption;
  enumChargeValue = ENU_ChargeValue;
  enumChargeOption = ENU_ChargeOption;
  enumNoShowReasonValue = ENU_NoShowReasonValue;
  enumNoShowReasonOption = ENU_NoShowReasonOption;
  enumCancelActivityType = ENU_Action_ActivityType;
  enumPaymentActionType = ENU_PaymentActionType;
  bookingType = ENU_CancelItemType;
  paymentType = EnumSaleType;

  /*********** Local *******************/
  amountChargeRefund: number;
  cancelBenefits:boolean = true;
  cancelationValue: number = this.cancellationTypeValue.LateCancellation;
  chargeRefundObj: any = {}; // Charge and Refund model also containing the amount
  noShowObj: any = {}; // Main cancellation model
  dateFormat = Configurations.DateFormat;
  saleDetail: SaleDetail;
  currencyFormat: string;
  itemCharges:number
  disableConfirmBtn: boolean = false;

/************ DropDowns****************/
  NoShowReasonOptions = [
    { NoShowReasonTypeID:this.enumNoShowReasonValue.Conflictinschedule , NoShowReasonTypeName:this.enumNoShowReasonOption.Conflictinschedule },
    { NoShowReasonTypeID:this.enumNoShowReasonValue.Familyemergency , NoShowReasonTypeName:this.enumNoShowReasonOption.Familyemergency },
    { NoShowReasonTypeID:this.enumNoShowReasonValue.Transportationlogisticalissues , NoShowReasonTypeName:this.enumNoShowReasonOption.Transportationlogisticalissues },
    { NoShowReasonTypeID:this.enumNoShowReasonValue.CustomerisUnreachable , NoShowReasonTypeName:this.enumNoShowReasonOption.CustomerisUnreachable },
    { NoShowReasonTypeID:this.enumNoShowReasonValue.CustomerdeniedBooking , NoShowReasonTypeName:this.enumNoShowReasonOption.CustomerdeniedBooking },
  ];
  RefundOptions = [
    { RefundTypeId: this.enumRefundValue.RefundNow, RefundTypeName: this.enumRefundOption.RefundNow },
    { RefundTypeId: this.enumRefundValue.RefundLater, RefundTypeName: this.enumRefundOption.RefundLater },
  ]
  ChargeOptions = [
    { ChargeTypeId: this.enumChargeValue.ChargeNow, ChargeTypeName: this.enumChargeOption.ChargeNow },
    { ChargeTypeId: this.enumChargeValue.ChargeLater, ChargeTypeName: this.enumChargeOption.chargeLater },
  ]


  constructor(
    public dialogRef: MatDialogRef<NoShowBookingComponent>,
    private _commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dialog: MatDialogService,
    private _dateTimeService: DateTimeService,
    private _dataSharingService: DataSharingService,

  ) { super() }

  ngOnInit(): void {
    this.dialogData = this.data.cancelNoShowData;
    this.setDropDownDefaultValue();
  }
  /**Method Region start ********/

  // set all the default values
  setDropDownDefaultValue(){
    this.chargeRefundObj = this._commonService.calculateRefundorCharge(this.dialogData.OldTotalDue, this.dialogData.AmountPaid, this.dialogData.NoShowCharges, this.dialogData.ItemDiscountedPrice, this.dialogData.IsNoShowFlatFee);
    this.amountChargeRefund = Math.abs(this.chargeRefundObj.Amount);
    this.noShowObj.NoShowReasonTypeID = this.enumNoShowReasonValue.Conflictinschedule;
    this.noShowObj.RefundTypeId = this.dialogData.IsClassAttendance ? this.enumRefundValue.RefundLater : this.enumRefundValue.RefundNow;
    this.noShowObj.ChargeTypeId = this.dialogData.IsClassAttendance ? this.enumChargeValue.ChargeLater : this.enumChargeValue.ChargeNow;
    this.noShowObj.IsBenefitConsumed = this.dialogData.ClassNoShowBenefit;
    this.getCurrentBranchDetail();
    this.calculateItemPercentageCharges();
  }




  // call when click on cancel button
  onCancel() {
    this.confirm.emit(false);
    this.closePopup();
  }
  //  get branch details
  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.CurrencySymbol;
    }
  }

  closePopup() {
    this.dialogRef.close();
  }
  //called when click on NoShow confirm button
  onConfirm() {
    this.disableConfirmBtn = true;
    // returing this bit with true value to service to only update the status  only in case of amountchargerefund = 0
    if (this.dialogData.CancelbookingType == ENU_CancelItemType.Service && this.amountChargeRefund == 0 && this.dialogData.SaleID == 0) {
      this.isServiceNoShowChargesZero.emit(true);
      this.closePopup();

    }

    else {
      if (this.chargeRefundObj.IsRefund) {
        if (this.noShowObj.RefundTypeId == this.enumRefundValue.RefundNow) {
          this.onOpenRefundPaymentDialog();
        }
        else {
          this.saveCancellation()
        }

      }
      else if (this.chargeRefundObj.IsRefund == false) {
        if (this.noShowObj.ChargeTypeId == this.enumChargeValue.ChargeNow) {
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
      else {
        this.saveCancellation();
      }

    }

  }
   //call when we select the charge later and refund late
   saveCancellation(){
        let NoShowBookModel = this.mapCancellationData();

        this._httpService.save(CancelNoShowBookingApi.saveClassNoShowCancelation, NoShowBookModel)
            .subscribe(
                (response: ApiResponse) => {
                  this.disableConfirmBtn = false;
                    if (response && response.MessageCode > 0) {
                      let classOrService = this.dialogData.CancelbookingType == ENU_CancelItemType.Service ? 'Service' : 'Class';
                      this._messageService.showSuccessMessage(this.messages.Success.Booking_NoShow_Successfully.replace("{0}", classOrService));
                      this.confirm.emit(true);
                      this.closePopup();
                    }
                else {
                  this._messageService.showErrorMessage(response.MessageText);
              }
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "No Show Booking"))
                }}
            );
  }
  //call when we select the refund now from drop down
  onOpenRefundPaymentDialog() {
        const dialogRef = this._dialog.open(RefundPaymentComponent, {
          disableClose: true,
          data: {
            RefundedModel: this.mapCancellationData(),
            SaleID: this.dialogData.SaleID,
            SaleDetailID: this.dialogData.SaleDetailID,
            IsRefunded: true,
            RefundedAmount: this.amountChargeRefund,
            Url: this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? CancelNoShowBookingApi.saveClassNoShowCancelation : SchedulerServicesApi.cancelNoShowSaleServiceStatus,
            NoShowCharges : this.itemCharges,
            chargedType: ENU_ChargeFeeType.NoShow,
          }
        });

        dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
          if (isSaved) {
            this._messageService.showSuccessMessage(this.messages.Success.Booking_NoShow_Successfully.replace("{0}", this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? "Class" : "Service"));
            this.confirm.emit(true);
            dialogRef.close();
            this.closePopup();
          } else {
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
              ChargedModel: this.mapCancellationData(),
              saleID: this.dialogData.SaleID,
              customerId: this.dialogData.CustomerID,
              saleDetailID: this.dialogData.SaleDetailID,
              isItemChargedFee: true,
              chargedType: ENU_ChargeFeeType.NoShow,
              itemChargedAmount: this.amountChargeRefund,
              isBookingID: this.dialogData.IsBookingID,
              BookingData: this.saleDetail,
              CustomerBookingID:this.dialogData.CustomerBookingID,
              Url: this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? CancelNoShowBookingApi.saveClassNoShowCancelation : SchedulerServicesApi.cancelNoShowSaleServiceStatus,
              NoShowCharges : this.itemCharges
            }
          });

          dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
              this._messageService.showSuccessMessage(this.messages.Success.Booking_NoShow_Successfully.replace("{0}", this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? "Class" : "Service"));
              this.confirm.emit(true);
              dialogRef.close()
              this.closePopup();
            }
            else {
              dialogRef.close();
              this.disableConfirmBtn = false;
            }
          });
  }

  onChangeStatus(){

  }
  calculateItemPercentageCharges(){
    if(this.dialogData.IsNoShowFlatFee){
      var calculatePercentage = (this.dialogData.NoShowCharges / 100) * this.dialogData.ItemDiscountedPrice;
      this.itemCharges = calculatePercentage
    }
    else{
      this.itemCharges = this.dialogData.NoShowCharges
    }
  }
  // mapping values
  mapCancellationData() {
          let noShowData = new CancelNoShowBooking();
          noShowData.CustomerID = this.dialogData.CustomerID;
          noShowData.ActivityType = this.enumCancelActivityType.NoShow;
          noShowData.SaleID = this.dialogData.SaleID;
          noShowData.SaleDetailID = this.dialogData.SaleDetailID;
          noShowData.CustomerBookingID=this.dialogData.SaleID==null ? this.dialogData.CustomerBookingID :null;
          noShowData.IsRefundNow = this.noShowObj.RefundTypeId == this.enumRefundValue.RefundNow && this.chargeRefundObj.IsRefund != null && this.chargeRefundObj.IsRefund ? true : false;
          noShowData.IsChargeNow = this.noShowObj.ChargeTypeId == this.enumChargeValue.ChargeNow && this.chargeRefundObj.IsRefund != null && !this.chargeRefundObj.IsRefund ? true : false;
          noShowData.ReasonID = this.noShowObj.NoShowReasonTypeID;
          noShowData.ItemTypeID = this.dialogData.CancelbookingType == ENU_CancelItemType.Class ? ENU_CancelItemType.Class : ENU_CancelItemType.Service;
          noShowData.ItemID = this.dialogData.ItemID;
          noShowData.ClassNoShowBenefit = this.noShowObj.ClassNoShowBenefit;
          noShowData.SaleTypeID = this.paymentType.Cash;
          noShowData.PaymentGatewayID = this.paymentType.Cash;
          noShowData.DiscountType = this.dialogData.DiscountType;
          noShowData.CustomerMembershipID = this.dialogData.CustomerMembershipID;
          if (this.dialogData.CustomerTypeId == CustomerType.Member) {
            noShowData.IsBenefitConsumed = this.noShowObj.IsBenefitConsumed;
          }
          // cancelBookingData.CustomerPaymentGatewayID = this.noShowObj.CustomerPaymentGatewayID;

          //In case of equal Amount calculateRefundorCharge return IsRefund and Amount Null so we set the Action Type No Change and ChargesAmount 0
          if (this.chargeRefundObj.IsRefund == null) {
            noShowData.ActionType = this.enumPaymentActionType.NoChange
            noShowData.ChargesAmount = 0
          } else {
            noShowData.ActionType = this.chargeRefundObj.IsRefund == true ? this.enumPaymentActionType.Refund : this.enumPaymentActionType.Charge;
            noShowData.ChargesAmount = this.amountChargeRefund;
          }

          let salePaymentMode = new SalePaymentModeViewModel();
          salePaymentMode.amount = this.amountChargeRefund;
          salePaymentMode.paymentGatewayID = this.paymentType.Cash;
          salePaymentMode.saleTypeID =  this.paymentType.Cash;

          noShowData.paymentModes =  [salePaymentMode];

          return noShowData;
  }

// get the booking details in case of services
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
               // serviceItem.EndDate = res.Result.ServiceBookingList[0].StartDate;
                serviceItem.EndTime = res.Result.ServiceBookingList[0].EndTime;
                serviceItem.PricePerSession = res.Result.ServiceBookingList[0].Price;
                serviceItem.ItemPricePerUnit = res.Result.ServiceBookingList[0].Price;
                this.saleDetail.ItemList.push(serviceItem);

                this.onOpenPartialPaymentDialog();
            }
        }
        else {
            //this.showErrorMessage(res.MessageText);
        }
    },
        error => {
            //this.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', "Sale Detail"));
        }
    );
  }

  }
