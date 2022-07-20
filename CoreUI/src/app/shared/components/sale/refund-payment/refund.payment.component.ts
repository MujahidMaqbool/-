/********************** Angular References *********************************/
import { SubscriptionLike } from 'rxjs';
import { NgForm, FormControl, Validators } from '@angular/forms';
import { Component, Inject, Output, EventEmitter, ViewChild } from '@angular/core';
/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
/********************** Service & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
/* Models */
import { ApiResponse } from 'src/app/models/common.model';
import { RefundSaleDetail, SaveRefundDetail, RefundedItemsList, SaveOverPaidRefundDetail, SalePaymentModeViewModel } from 'src/app/models/sale.model';

/********************** Component *********************************/
import { AlertConfirmationComponent } from 'src/app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

/********************** Common *********************************/
import { CurrencyPipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { SaleApi } from 'src/app/helper/config/app.webapi';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { Messages } from 'src/app/helper/config/app.messages';
import { Configurations } from 'src/app/helper/config/app.config';
import { POSItemType, ENU_DateFormatName, ENU_RefundType, EnumSaleStatusType, ENU_ChargeFeeType, ENU_Action_ActivityType, ENU_CancelItemType, EnumSaleType, ENU_PaymentGateway } from 'src/app/helper/config/app.enums';


@Component({
    selector: 'refund-payment',
    templateUrl: './refund.payment.component.html'
})

export class RefundPaymentComponent extends AbstractGenericComponent {

    // #region Local Memebers
    amntRefund: FormControl = new FormControl(0, [Validators.required ,Validators.min(.01)]);

    quantity: number = 0;
    //noOfItems: number = 0;
    currencyFormat: string;
    dateFormat: string = "";
    dateTimeFormat: string = "";
    isSaveRefund: boolean = false;
    isMembershipBenefit: boolean = false;
    isDataExists: boolean = false;
    hasFlatRefundAmountValid: boolean = true;
    isOtherReasonRequired: boolean = false;
    minRefundValue: number = 0.1;
    @Output() isSaved = new EventEmitter<any>();

    @ViewChild('saveRefundNoteFrom') saveRefundNoteFrom: NgForm;
    refundType: number = 0; // 1 means true and 2 means false. implemented as a number due to two check boxes

    isCheckedAllItems: boolean = true;
    isShowAddedToInventory: boolean = false;
    isCancelledOrRescheduledRefund: boolean = false;
    activityType: string = '';
    calculatedRewardPoints: number = 0;
    //#endregion

     /***********Collection And Models*********/
     refundSaleDetail: RefundSaleDetail;
     refundSaleDetailCopy: RefundSaleDetail;
     saveRefundDetail: SaveRefundDetail;
     saveOverPaidRefundDetail: SaveOverPaidRefundDetail;
    //  currentBranchSubscription: SubscriptionLike;

    /***********Messages*********/
    messages = Messages;
    errorMessage: string;
    successMessage: string;
    hasError: boolean = false;
    hasSuccess: boolean = false;
    serverImageAddress = environment.imageUrl;

    /* Configurations */
    posItemType = POSItemType;
    enuRefundType = ENU_RefundType;
    timeFormat = Configurations.TimeFormatView;
    receiptDateFormat = Configurations.ReceiptDateFormat;

    enumSaleStatusType = EnumSaleStatusType;
    enumSaleType = EnumSaleType;
    enumPaymentGateway = ENU_PaymentGateway;
    // enumCancelActivityType = ENU_CancelActivityType;

    
    constructor(
        private _httpService: HttpService,
        private _openDialogue: MatDialogService,
        private _messageService: MessageService,
        private _currencyFormatter: CurrencyPipe,
        private _dateTimeService: DateTimeService,
        private _taxCalculationService: TaxCalculation,
        // @Inject(MAT_DIALOG_DATA) public saleID: number,
        @Inject(MAT_DIALOG_DATA) public data: any,

        private _dataSharingService: DataSharingService,
        public dialogRef: MatDialogRef<RefundPaymentComponent>,
    ) {
        super();
        this.refundType = this.enuRefundType.FlatAmountRefund; 
        this.saveRefundDetail = new SaveRefundDetail();
        this.refundSaleDetail = new RefundSaleDetail();
     }

    ngOnInit() {
        this.getCurrentBranchDetail();

        if (this.data.StatusTypeID === this.enumSaleStatusType.OverPaid) {
            // get over paid invoice detail
            this.getOverPaidRefundDetail(this.data);

        } else {
            // get sale/specific payment details (in this case SaleDetailID is null its ,means getting invoice details)
            this.getRefundedSaleDetail(this.data.SaleID, this.data.SaleDetailID);
        }

        /* Activity type (Cancellation/NoShow/Reschedule)*/
        this.activityType = this.data.RefundedModel?.ActivityType;

    }
   

    // #region Events

    onClose() {
        this.isSaved.emit(false);
        this.closePopup();
    }

    closePopup(): void {
        this.dialogRef.close();
    }

    onChangeRefundMethod(){
        this.minRefundValue = this.saveRefundDetail.PaymentGatewayID == this.enumSaleType.Cash ? 0.1 : 1;
         /**Restrict user only in case of card (refund amount can not be greater than TotalAmountPaid through card) */ 
        //  if(this.isCancelledOrRescheduledRefund) {
        //     let oldData = JSON.parse(JSON.stringify(this.refundSaleDetailCopy));
        //         let selectedPaymentGateway = this.refundSaleDetail.RefundMethods.find(i => i.PaymentGatewayID == this.saveRefundDetail.PaymentGatewayID && i.PaymentGatewayID != this.enumPaymentGateway.RewardPoints && i.PaymentGatewayID != this.enumPaymentGateway.Cash);
        //         if (selectedPaymentGateway) {
        //             this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded = selectedPaymentGateway.TotalAmountPaid;
        //             this.saveRefundDetail.RefundAmount = selectedPaymentGateway.TotalAmountPaid;  
        //         } else if(this.saveRefundDetail.PaymentGatewayID == this.enumPaymentGateway.RewardPoints) {    
        //             this.saveRefundDetail.RefundAmount = oldData.RemainingTotalAmountThatCanBeRefunded;             
        //             this.calculatedRewardPoints = this.calculateRewardPoints(oldData.RemainingTotalAmountThatCanBeRefunded);
                    
        //         } else {                  
        //             this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded = oldData.RemainingTotalAmountThatCanBeRefunded;
        //             this.saveRefundDetail.RefundAmount = oldData.RemainingTotalAmountThatCanBeRefunded;
        //         }

        //  } else {
                this.onAmountSelectionChange(this.refundType);   
      //   } 
        
       //this.onAmountSelectionChange(this.enuRefundType.FlatAmountRefund);
    }

    // for all items select/unselect
    onAllItemTypeSelectionChange(event: any) {
        this.refundSaleDetail.ItemList.forEach(element => {
            if(element.RemainingItemAmountThatCanBeRefunded > 0){
                element.IsSelected = event;
                element.ItemsDetail.RefundAmount = event ? element.RemainingItemAmountThatCanBeRefunded : 0;
                if(element.IsShowBenefitReturn && element.IsMembershipBenefit){
                    element.ItemsDetail.IsBenefitReverted = event;
                }
            }
        });

        this.setTotalRefundedAmount();
    }

    // for single item select/unselect
    onItemTypeSelectionChange(event: any, index) {
        var isSelected = this.refundSaleDetail.ItemList.filter(mc => mc.IsSelected);
       
        
        this.isCheckedAllItems = isSelected && isSelected.length == this.refundSaleDetail.ItemList.length ? true : false;

        if(this.refundSaleDetail.ItemList[index].IsShowBenefitReturn && this.refundSaleDetail.ItemList[index].IsMembershipBenefit){
            this.refundSaleDetail.ItemList[index].ItemsDetail.IsBenefitReverted = event;
        }

        //this.refundSaleDetail.ItemList[index].ItemsDetail.IsBenefitReverted = event;

        var oldData = JSON.parse(JSON.stringify(this.refundSaleDetailCopy));

        if(!event){
            this.refundSaleDetail.ItemList[index].RemainingItemQtyRefunded = oldData.ItemList[index].RemainingItemQtyRefunded;
            this.refundSaleDetail.ItemList[index].RemainingItemQtyAddedToInventoryRefunded = oldData.ItemList[index].RemainingItemQtyAddedToInventoryRefunded;
            this.refundSaleDetail.ItemList[index].ItemsDetail.RefundAmount = 0;
            this.refundSaleDetail.ItemList[index].hasItemRefundAmountValid = true;
            this.refundSaleDetail.ItemList[index].hasAddedToInventoryValid = true;
        } else{
            this.refundSaleDetail.ItemList[index].ItemsDetail.RefundAmount = oldData.ItemList[index].RemainingItemAmountThatCanBeRefunded;
            this.refundSaleDetail.ItemList[index].RemainingItemQtyRefunded = oldData.ItemList[index].RemainingItemQtyRefunded;
            this.refundSaleDetail.ItemList[index].RemainingItemQtyAddedToInventoryRefunded = oldData.ItemList[index].RemainingItemQtyAddedToInventoryRefunded;
        }
        this.setTotalRefundedAmount();
    }

    // for refund reson change
    onChangeRefundReason(data: number) {
        var result = this.refundSaleDetail.Reasons.find(i => i.ReasonID == data);
        this.isOtherReasonRequired = result.ReasonName.toLowerCase() == "other" ? true : false;
        if(!this.isOtherReasonRequired) {
            this.saveRefundDetail.Note = "";
        };
    }

    // for flat/ line item aount chnage
    onAmountSelectionChange(entry): void {
        this.refundType = entry;
        var flag: boolean = entry == this.enuRefundType.FlatAmountRefund ? true : false;

        this.refundSaleDetail = JSON.parse(JSON.stringify(this.refundSaleDetailCopy));

        this.refundSaleDetail.IsSelectedServiceCharges = flag;
        this.refundSaleDetail.IsSelectedTip = flag;

        this.isCheckedAllItems = flag;
        this.refundSaleDetail.ItemList.forEach(element => {
            element.IsSelected = flag;
            element.ItemsDetail.RefundAmount = flag ? element.RemainingItemAmountThatCanBeRefunded : 0;

            if(element.IsShowBenefitReturn && element.IsMembershipBenefit){
                element.ItemsDetail.IsBenefitReverted = flag;
            }
        });

        //this.saveRefundDetail.RefundAmount = 0;
         /**========Restrict user only in case of card (refund amount can not be greater than TotalAmountPaid through card)======== */
         this.calculatedRewardPoints = 0;
         let selectedPaymentGateway = this.refundSaleDetail.RefundMethods.find(i => i.PaymentGatewayID == this.saveRefundDetail.PaymentGatewayID && i.PaymentGatewayID != this.enumPaymentGateway.RewardPoints && i.PaymentGatewayID != this.enumPaymentGateway.Cash);
         if(selectedPaymentGateway) {
             this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded = selectedPaymentGateway.TotalAmountPaid;
             this.saveRefundDetail.RefundAmount = flag ? selectedPaymentGateway.TotalAmountPaid : 0;
         } else if(this.saveRefundDetail.PaymentGatewayID == this.enumPaymentGateway.Cash){
            this.saveRefundDetail.RefundAmount = flag ? this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded : 0;
         } else {
            this.saveRefundDetail.RefundAmount = 0;
         }
         /********================== */

       
        this.saveRefundDetail.ReasonID = this.refundSaleDetail.Reasons[0].ReasonID;
        this.saveRefundDetail.Note = "";
        this.saveRefundDetail.RefundedTipAmount = 0;//this.refundSaleDetail.TipAmount;
        //this.saveRefundDetail.RefundedTipAmount = this.refundSaleDetail.RemainingTipAmountThatCanBeRefunded;
        //this.saveRefundDetail.RefundedServiceChargesAmount = this.refundSaleDetail.RemainingServiceChargesAmountThatCanBeRefunded;
        this.saveRefundDetail.RefundedServiceChargesAmount = 0;//this.refundSaleDetail.ServiceChargesAmount;
        this.isOtherReasonRequired = false;

        this.refundSaleDetail.IsValidRefundedTipAmount = true;
        this.refundSaleDetail.IsValidRefundedServiceChargesAmount = true;
        this.hasFlatRefundAmountValid = true;       
             
    }

    // for refund quantity change
    onRefundQuantityChange(event: string, Index: number){
        if(this.refundType == this.enuRefundType.LineItemRefund && this.refundSaleDetail.ItemList[Index].IsSelected){
             if (event === 'add' && this.refundSaleDetail.ItemList[Index].RemainingItemQtyRefunded != this.refundSaleDetail.ItemList[Index].RemainingItemQtyThatCanBeRefunded) {
                 this.refundSaleDetail.ItemList[Index].RemainingItemQtyRefunded = this.refundSaleDetail.ItemList[Index].RemainingItemQtyRefunded + 1;
             }
 
             if (event === 'minus' && this.refundSaleDetail.ItemList[Index].RemainingItemQtyRefunded  != 1 && this.refundSaleDetail.ItemList[Index].RemainingItemQtyRefunded != 0) {
                 this.refundSaleDetail.ItemList[Index].RemainingItemQtyRefunded = this.refundSaleDetail.ItemList[Index].RemainingItemQtyRefunded - 1;
             }
        }
     }

     // for refund quantity change
    onInventoryQuantityChange(event: string, Index: number){
        this.refundSaleDetail.ItemList[Index].hasAddedToInventoryValid = true;
        if(this.refundType == this.enuRefundType.LineItemRefund && this.refundSaleDetail.ItemList[Index].IsSelected){
             if (event === 'add' && (this.refundSaleDetail.ItemList[Index].RemainingItemQtyAddedToInventoryRefunded < this.refundSaleDetail.ItemList[Index].RemainingItemQtyRefunded)) {
                 this.refundSaleDetail.ItemList[Index].RemainingItemQtyAddedToInventoryRefunded = this.refundSaleDetail.ItemList[Index].RemainingItemQtyAddedToInventoryRefunded + 1;
             }
 
             if (event === 'minus' && this.refundSaleDetail.ItemList[Index].RemainingItemQtyAddedToInventoryRefunded  != 1 && this.refundSaleDetail.ItemList[Index].RemainingItemQtyAddedToInventoryRefunded != 0) {
                 this.refundSaleDetail.ItemList[Index].RemainingItemQtyAddedToInventoryRefunded = this.refundSaleDetail.ItemList[Index].RemainingItemQtyAddedToInventoryRefunded - 1;
             }
        }
     }

     // for service charges change
    onRefundSCAmountChange(){
        setTimeout(() => {
            var maxLength = this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded.toString().length > this.refundSaleDetail.ServiceChargesAmount.toString().length ?
                            this.refundSaleDetail.ServiceChargesAmount.toString().length : this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded.toString().length;
            this.saveRefundDetail.RefundedServiceChargesAmount = this.setMaxLength(this.saveRefundDetail.RefundedServiceChargesAmount, maxLength);

            if(this.saveRefundDetail.RefundedServiceChargesAmount > this.refundSaleDetail.RemainingServiceChargesAmountThatCanBeRefunded){
                this.saveRefundDetail.RefundedServiceChargesAmount = this.refundSaleDetail.RemainingServiceChargesAmountThatCanBeRefunded;
            }

            this.refundSaleDetail.IsValidRefundedServiceChargesAmount = this.saveRefundDetail.RefundedServiceChargesAmount == 0 ? false : true;;
            this.setTotalRefundedAmount();
        }, 100);
    }

    // for tip amount change
    onRefundTipAmountChange(){
        setTimeout(() => {
            var maxLength = this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded.toString().length > this.refundSaleDetail.TipAmount.toString().length ?
                            this.refundSaleDetail.TipAmount.toString().length : this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded.toString().length;
            this.saveRefundDetail.RefundedTipAmount = this.setMaxLength(this.saveRefundDetail.RefundedTipAmount, maxLength);

            if(this.saveRefundDetail.RefundedTipAmount > this.refundSaleDetail.RemainingTipAmountThatCanBeRefunded){
                this.saveRefundDetail.RefundedTipAmount = this.refundSaleDetail.RemainingTipAmountThatCanBeRefunded;
            }

            this.refundSaleDetail.IsValidRefundedTipAmount = this.saveRefundDetail.RefundedTipAmount == 0 ? false : true;;

            this.setTotalRefundedAmount();
        }, 100);
    }

    // check refund amount not greater than remaining refunded amount
    checkItemRefundAmount(Index) {
        setTimeout(() => {
            let PaymentGateway = this.refundSaleDetail.RefundMethods.find(i => i.PaymentGatewayID == this.saveRefundDetail.PaymentGatewayID && i.PaymentGatewayID != this.enumPaymentGateway.RewardPoints && i.PaymentGatewayID != this.enumPaymentGateway.Cash);
            if (PaymentGateway) {
                this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded = PaymentGateway.TotalAmountPaid;
            }

            var maxLength = this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded.toString().length > this.refundSaleDetail.ItemList[Index].ItemTotalPrice.toString().length ?
            this.refundSaleDetail.ItemList[Index].ItemTotalPrice.toString().length : this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded.toString().length;
            this.refundSaleDetail.ItemList[Index].ItemsDetail.RefundAmount = this.setMaxLength(this.refundSaleDetail.ItemList[Index].ItemsDetail.RefundAmount, maxLength);
            
            if(this.refundSaleDetail.ItemList[Index].ItemsDetail.RefundAmount > this.refundSaleDetail.ItemList[Index].RemainingItemAmountThatCanBeRefunded){
                this.refundSaleDetail.ItemList[Index].ItemsDetail.RefundAmount = this.refundSaleDetail.ItemList[Index].RemainingItemAmountThatCanBeRefunded;
            }

            this.setTotalRefundedAmount();
            this.refundSaleDetail.ItemList[Index].hasItemRefundAmountValid = this.refundSaleDetail.ItemList[Index].ItemsDetail.RefundAmount == 0 || this.refundSaleDetail.ItemList[Index].ItemsDetail.RefundAmount > this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded ? false : true;
        }, 100);
       
    }

    // set total refunded amount
    setTotalRefundedAmount(){
        this.saveRefundDetail.RefundAmount = 0;

        this.refundSaleDetail.ItemList.forEach(detail => {
            if(detail.IsSelected)
                this.saveRefundDetail.RefundAmount = this.saveRefundDetail.RefundAmount + detail.ItemsDetail.RefundAmount;           
        });

        if(this.refundSaleDetail.IsSelectedServiceCharges){
            this.saveRefundDetail.RefundAmount = this.saveRefundDetail.RefundAmount + this.saveRefundDetail.RefundedServiceChargesAmount;
        }
       
        if(this.refundSaleDetail.IsSelectedTip){
            this.saveRefundDetail.RefundAmount = this.saveRefundDetail.RefundAmount + this.saveRefundDetail.RefundedTipAmount;
        }        

        this.saveRefundDetail.RefundAmount = this._taxCalculationService.getRoundValue(this.saveRefundDetail.RefundAmount);

         /** ////for reward points calculation*/ //
         if (this.saveRefundDetail.PaymentGatewayID == this.enumPaymentGateway.RewardPoints && this.refundSaleDetail.CustomerRewardPointsFundamentals != null) {
            this.calculatedRewardPoints = this.calculateRewardPoints(this.saveRefundDetail.RefundAmount);
        }

        
    }

    // set max length for enter in input field
    setMaxLength(amount: number, maxLength: number) {

        var roundValue: any;
        var result: number = Number(amount);

        if(amount && amount.toString().includes(".")){
            roundValue = amount.toString().split(".");
           result = Number(roundValue[0]);
        }

        if (amount && amount.toString().length > maxLength) {
            result = Number(amount.toString().substring(0, maxLength));
        } else if(amount == null || amount == undefined || amount.toString() == ""){
            result = 0;
        }

        if(roundValue){
            if(!result.toString().includes(".")){
                result = Number(result.toString() + "." + roundValue[1]);
            }
        }

        result = this._taxCalculationService.getRoundValue(result);
        
        return result;
    }

    onServiceChargesSelectionChange(event){
        
        var oldData = JSON.parse(JSON.stringify(this.refundSaleDetailCopy));
        if(!event){
            this.saveRefundDetail.RefundedServiceChargesAmount = 0;
            this.refundSaleDetail.IsValidRefundedServiceChargesAmount = true;
        } else{
            this.saveRefundDetail.RefundedServiceChargesAmount = oldData.RemainingServiceChargesAmountThatCanBeRefunded;
            this.refundSaleDetail.IsValidRefundedServiceChargesAmount = true;
        }
        this.setTotalRefundedAmount();
    }

    onTipSelectionChange(event){
        
        var oldData = JSON.parse(JSON.stringify(this.refundSaleDetailCopy));
        if(!event){
            this.saveRefundDetail.RefundedTipAmount = 0;
            this.refundSaleDetail.IsValidRefundedTipAmount = true;
        } else{
            this.saveRefundDetail.RefundedTipAmount = oldData.RemainingTipAmountThatCanBeRefunded;
            this.refundSaleDetail.IsValidRefundedTipAmount = true;
        }
        this.setTotalRefundedAmount();
    }

    onChangeFlatRefundAmount() {
        setTimeout(() => {
            if(this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded){
                var maxLength = this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded.toString().length;
                this.saveRefundDetail.RefundAmount = this.setMaxLength(this.saveRefundDetail.RefundAmount, maxLength);
    
                this.saveRefundDetail.RefundAmount = this.saveRefundDetail.RefundAmount > this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded ? this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded : this.saveRefundDetail.RefundAmount;
                this.hasFlatRefundAmountValid = this.saveRefundDetail.RefundAmount == 0 || this.saveRefundDetail.RefundAmount > this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded ? false : true;
                //////for reward points calculation
                if (this.saveRefundDetail.PaymentGatewayID == this.enumPaymentGateway.RewardPoints && this.refundSaleDetail.CustomerRewardPointsFundamentals != null) {
                    this.calculatedRewardPoints = this.calculateRewardPoints(this.saveRefundDetail.RefundAmount);
                }
            }
        }, 100);
    }

    // #endregion

    // #region Methods
    calculateRewardPoints(amount) {       
        return  this._taxCalculationService.getRoundValue(((amount / this.refundSaleDetail.CustomerRewardPointsFundamentals.RewardProgramRedemptionValue) * this.refundSaleDetail.CustomerRewardPointsFundamentals.RewardProgramRedemptionPoints));
    }

    async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.dateTimeFormat =  this.dateFormat + " | " + this.timeFormat;

        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol
        }
    }

    getRefundedSaleDetail(saleID: number ,saleDetaiID:number) {
        this.quantity = 0;
        this._httpService.get(SaleApi.getSaleRefund + saleID)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    if (res.Result) {
                        this.refundSaleDetail = res.Result;
                        this.mapRefundDetail(saleDetaiID, false);
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Sale Refund"));
                }
            );
    }

    getOverPaidRefundDetail(sale: any){
        let param = {
            saleID: sale.SaleID,
        }
        this._httpService.save(SaleApi.getCreditInvoiceDetail, param)
        .subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                if (res.Result) {
                    this.refundSaleDetail = res.Result;
                    this.mapRefundDetail(null, true);
                }
            }
            else {
                this._messageService.showErrorMessage(res.MessageText);
            }
        },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Sale Detail"));
            }
        );
    }

    mapRefundDetail(saleDetaiID, isSaleOverPaid){


        // case cancelled/rescheduled item
        if(saleDetaiID != null || isSaleOverPaid){ // here we are filtering the line item with saledetailid

            this.isCancelledOrRescheduledRefund = true;
            if(!isSaleOverPaid){
                // in this case only one item recived
                this.refundSaleDetail.ItemList = this.refundSaleDetail.ItemList.filter(o => o.SaleDetailID == this.data.SaleDetailID);
                this.refundSaleDetail.SubTotalPrice = this.data.RefundedAmount;
            } else{
                this.refundSaleDetail.SubTotalPrice = this.refundSaleDetail.TotalRefundedAmount;
            }
         
            //set by default line item
            this.refundType = this.enuRefundType.LineItemRefund; 
            this.isCheckedAllItems = this.refundSaleDetail.ItemList.length == 1 ? true : false;
        }
       

        this.refundSaleDetail.ItemList.forEach(detail => {

            detail.ItemsDetail = new RefundedItemsList();

            if(detail.ItemTypeID == this.posItemType.Product && detail.HasTrackInventory){
                this.isShowAddedToInventory = true;
            }

            if (detail.ImagePath && detail.ImagePath !== "") {
                detail.ImagePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setOtherImagePath()) + detail.ImagePath;
            }
            else {
                detail.ImagePath = detail.ImagePath + './assets/images/pos_placeholder.jpg';
            }
            
            detail.ItemsDetail.RefundedQty = detail.RefundedQty;

            detail.IsDisabledRefunded = detail.ItemsDetail.IsRefunded;
            detail.IsSelected = true;
            detail.hasItemRefundAmountValid = true;
            detail.hasAddedToInventoryValid = true;
            detail.IsDisabledInventoryAdded = detail.ItemsDetail.IsInventoryAdded;
            
            if (detail.StartTime && detail.StartTime != "") {
                detail.StartTime = this._dateTimeService.formatTimeString(detail.StartTime, this.timeFormat);
            }

            if (detail.EndTime && detail.EndTime != "") {
                detail.EndTime = this._dateTimeService.formatTimeString(detail.EndTime, this.timeFormat);
            }

            detail.ShowBookingTime = (detail.ItemTypeID === this.posItemType.Class || detail.ItemTypeID === this.posItemType.Service) ? true : false;
            this.quantity += detail.RefundedQty ? detail.RefundedQty : 0;

            detail.ItemsDetail.RefundQty = detail.ItemsDetail.RefundQty;

            detail.ItemsDetail.RefundAmount = this.isCancelledOrRescheduledRefund ? detail.RemainingItemAmountThatCanBeRefunded : 0;

            detail.RemainingItemQtyRefunded = saleDetaiID != null || isSaleOverPaid ? 1 : detail.RemainingItemQtyThatCanBeRefunded;
            detail.RemainingItemQtyAddedToInventoryRefunded = saleDetaiID != null || isSaleOverPaid ? 1 : detail.RemainingItemQtyThatCanBeRefunded;

            detail.IsLineItemDiscount = !detail.IsMembershipBenefit && detail.ItemDiscountAmount > 0 ? true :  false
            detail.IsShowBenefitReturn = detail.IsItemBenefitReverted ? false  : true;
            //detail.IsShowBenefitReturn = true;

            if(this.data?.IsRefunded){
                detail.ItemsDetail.RefundAmount = this.data.RefundedAmount;
                detail.NoShowCharges = this.data.NoShowCharges;
                detail.ItemCancellationCharges = this.data.ItemCancellationCharges
                detail.ItemRescheduleCharges = this.data.ItemRescheduleCharges;
                detail.IsItemCancelled = this.data?.chargedType == ENU_ChargeFeeType.Cancellation ? true : false;
                detail.IsItemNoShow = this.data?.chargedType == ENU_ChargeFeeType.NoShow ? true : false;
                detail.IsItemRescheduled = this.data?.chargedType == ENU_ChargeFeeType.Reschedule ? true : false;

                //detail.IsItemCancelled = true;
            }

            if(isSaleOverPaid){
                detail.ItemsDetail.RefundAmount = this.refundSaleDetail.TotalRefundedAmount;//detail.IsItemCancelled ? detail.ItemCancellationCharges : detail.IsItemNoShow ? detail.NoShowCharges : 0;
            }
           
            detail.ItemsDetail.SaleDetailID = detail.SaleDetailID;
        });

        this.isMembershipBenefit = this.refundSaleDetail.ItemList.find(il => il.IsMembershipBenefit && !il.IsItemBenefitReverted) ? true : false;
        this.refundSaleDetail.IsSelectedServiceCharges =  saleDetaiID != null || isSaleOverPaid ? false : true;
        this.refundSaleDetail.IsSelectedTip = saleDetaiID != null || isSaleOverPaid ? false : true;
        this.refundSaleDetail.IsSelectedTax = saleDetaiID != null || isSaleOverPaid  ? false : true;

        if(isSaleOverPaid){
            // if(this.refundSaleDetail.ServiceChargesAmount > 0){
            //     this.saveRefundDetail.RefundedServiceChargesAmount = this.refundSaleDetail.RemainingServiceChargesAmountThatCanBeRefunded;
            //     this.refundSaleDetail.IsValidRefundedServiceChargesAmount = true;
            // }
            
            // if(this.refundSaleDetail.TipAmount > 0){
            //     this.saveRefundDetail.RefundedTipAmount = this.refundSaleDetail.RemainingTipAmountThatCanBeRefunded;
            //     this.refundSaleDetail.IsValidRefundedTipAmount = true;
            // }

            this.setTotalRefundedAmount();
        }
        
        if(isSaleOverPaid){
            this.saveRefundDetail.ReasonID = this.refundSaleDetail.ReasonID > 0 ? this.refundSaleDetail.ReasonID : this.refundSaleDetail?.Reasons ? this.refundSaleDetail.Reasons[0].ReasonID : 0;
        } else{
            this.saveRefundDetail.ReasonID = this.refundSaleDetail?.Reasons ? this.refundSaleDetail.Reasons[0].ReasonID : 0;
            this.saveRefundDetail.RefundAmount = this.data?.IsRefunded ? this.refundSaleDetail.ItemList[0].ItemsDetail.RefundAmount : this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded;
        }
      

        this.saveRefundDetail.PaymentGatewayID = this.refundSaleDetail.RefundMethods ?  this.isCancelledOrRescheduledRefund ?  this.enumPaymentGateway.Cash : this.refundSaleDetail.RefundMethods[0].PaymentGatewayID : 0;
       
        /** Amount can not be refunded greater than amount that was paid through selected refund method*/
        let paymentGateway = this.refundSaleDetail.RefundMethods.find(i => i.PaymentGatewayID == this.refundSaleDetail.RefundMethods[0].PaymentGatewayID && i.PaymentGatewayID != this.enumPaymentGateway.RewardPoints && i.PaymentGatewayID != this.enumPaymentGateway.Cash);
        if(paymentGateway) {
            this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded = paymentGateway.TotalAmountPaid;
            this.saveRefundDetail.RefundAmount = paymentGateway.TotalAmountPaid;
        }

        this.isDataExists = true;

        this.refundSaleDetailCopy = JSON.parse(JSON.stringify(this.refundSaleDetail));
    }

    getRefundedItemsList(): RefundedItemsList[] {
        var refundedItemsList = new Array<RefundedItemsList>();

        this.refundSaleDetail.ItemList.forEach(detail => {
            if(detail.IsSelected){
                var refundedItem = new  RefundedItemsList();
                refundedItem.RefundedQty = detail.RemainingItemQtyRefunded > detail.RemainingItemQtyThatCanBeRefunded ? detail.RemainingItemQtyThatCanBeRefunded : detail.RemainingItemQtyRefunded;
                refundedItem.InventoryAddedQty = detail.RemainingItemQtyAddedToInventoryRefunded;
                refundedItem.RefundedAmount = detail.ItemsDetail.RefundAmount;
                refundedItem.SaleDetailID = detail.ItemsDetail.SaleDetailID;
                refundedItem.IsRefunded = true;
                refundedItem.IsBenefitReverted = detail.ItemsDetail.IsBenefitReverted ? detail.ItemsDetail.IsBenefitReverted : false;
    
                refundedItemsList.push(refundedItem);
            }
           
        });

        return refundedItemsList;
    }

    getFormattedAmount(value: any) {
        return this._currencyFormatter.transform(value, this.currencyFormat);
    }

    getIsRefunded(val: boolean): any {
        var result = this.refundSaleDetail.ItemList.filter(i => i.ItemsDetail.IsRefunded == val);
        return result;
    }

    confirmationSaveRefundPoup() {
        //this is only call when we refund the amount in case of cancellation, no show and reshedule
        if(this.isCancelledOrRescheduledRefund && this.data.StatusTypeID != this.enumSaleStatusType.OverPaid){
            this.saveItemStatusChangedRefundPayment();
        }
        else{
            var isValidate: boolean = this.isValid();
            if(isValidate){
    
                const dialogRef = this._openDialogue.open(AlertConfirmationComponent, { disableClose: true });
    
                dialogRef.componentInstance.Title = this.messages.Dialog_Title.Save_Refund;
                dialogRef.componentInstance.Message = this.messages.Confirmation.Refund_Message;
    
                dialogRef.componentInstance.confirmChange.subscribe((isConfirmPay: boolean) => {
                    if (isConfirmPay) {
                        isConfirmPay = true;
                        if(this.data.StatusTypeID != this.enumSaleStatusType.OverPaid){
                            this.saveRefundPayment();
                        }else{
                            this.saveOverPaidRefundPayment();
                        }
                       
                    }
                    else {
                        isConfirmPay = false;
                    }
                })
            }}
    
    }

    isValid(): boolean{

        if(this.refundType === this.enuRefundType.LineItemRefund){

            var itemsList = this.refundSaleDetail.ItemList.filter(i => i.IsSelected == true);

            if((itemsList == null || itemsList.length == 0) && !this.refundSaleDetail.IsSelectedTip && !this.refundSaleDetail.IsSelectedServiceCharges){
                this._messageService.showErrorMessage(this.messages.Error.PleaseCheckAtLeastOneLineItemToRefund);
                return false;
            } else {

                var isValidSelectedItems: number = 0;
                var isValidAddedToInventory: number = 0;

                itemsList.forEach(detail => {
                    if(detail.ItemsDetail.RefundAmount == 0){
                        detail.hasItemRefundAmountValid = false;
                        isValidSelectedItems++;
                    }

                    if(detail.RemainingItemQtyAddedToInventoryRefunded > detail.RemainingItemQtyRefunded){
                        detail.hasAddedToInventoryValid = false;
                        isValidAddedToInventory++;
                        
                    }
                });

                if(isValidSelectedItems > 0){
                    this._messageService.showErrorMessage(this.messages.Validation.PleaseEnterARefundAmountGreaterThanOrEqualTo1);
                    return false;
                } else if(this.refundSaleDetail.RemainingServiceChargesAmountThatCanBeRefunded > 0 && this.refundSaleDetail.IsSelectedServiceCharges && this.saveRefundDetail.RefundedServiceChargesAmount <= 0){
                    this.refundSaleDetail.IsValidRefundedServiceChargesAmount = false;
                    this._messageService.showErrorMessage(this.messages.Validation.PleaseEnterARefundAmountGreaterThanOrEqualTo1);
                    return false;
                }
                else if(this.refundSaleDetail.RemainingTipAmountThatCanBeRefunded > 0 && this.refundSaleDetail.IsSelectedTip && this.saveRefundDetail.RefundedTipAmount <= 0){
                    this.refundSaleDetail.IsValidRefundedTipAmount = false;
                    this._messageService.showErrorMessage(this.messages.Validation.PleaseEnterARefundAmountGreaterThanOrEqualTo1);
                    return false;
                }

                if(isValidAddedToInventory > 0){
                    this._messageService.showErrorMessage("Added to inventory quantity cannot be greater than the returned quantity.");
                    return false;
                }
                // else if(this.saveRefundDetail.RefundAmount < 1){
                //     this.hasFlatRefundAmountValid = false;
                //     this._messageService.showErrorMessage(this.messages.Validation.PleaseEnterARefundAmountGreaterThanOrEqualTo1);
                //     return false;
                // }
                // else if(this.saveRefundDetail.RefundAmount > this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded){
                //     this._messageService.showErrorMessage(this.messages.Error.RefundAmountCannotExceedTheTotalPaidAmount);
                //     return false;
                // }
            }
        } 

        if(isNaN(this.saveRefundDetail.RefundAmount)){ 
            this.hasFlatRefundAmountValid = false;
            this._messageService.showErrorMessage(this.messages.Validation.PleaseEnterARefundAmountGreaterThanOrEqualTo1);
            return false;
        }else if(this.saveRefundDetail.RefundAmount < 0.1 && this.saveRefundDetail.PaymentGatewayID == this.enumSaleType.Cash){
            this.hasFlatRefundAmountValid = false;
            this._messageService.showErrorMessage(this.messages.Validation.PleaseEnterARefundAmountGreaterThanZero);
            return false;
        } 
        else if(this.saveRefundDetail.RefundAmount < 1 && this.saveRefundDetail.PaymentGatewayID != this.enumSaleType.Cash){
            this.hasFlatRefundAmountValid = false;
            this._messageService.showErrorMessage(this.messages.Validation.PleaseEnterARefundAmountGreaterThanOrEqualTo1);
            return false;
        } else if(this.saveRefundDetail.RefundAmount > this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded){
            this.hasFlatRefundAmountValid = false;
            this._messageService.showErrorMessage(this.messages.Error.Max_Refund_Amount.replace("{0}", this.refundSaleDetail.RemainingTotalAmountThatCanBeRefunded.toString()));
            return false;
        } 

        if(this.isOtherReasonRequired && this.saveRefundDetail.Note == ""){
            this._messageService.showErrorMessage(this.messages.Error.Refund_Reasons);
            return false;
        } 

        return true;
    }

    // save sale refund amount
    saveRefundPayment(){

        this.saveRefundDetail.CustomerID = this.refundSaleDetail.CustomerID;
        this.saveRefundDetail.SaleID = this.refundSaleDetail.SaleID;
        this.saveRefundDetail.ItemList = this.refundType === this.enuRefundType.LineItemRefund ? this.getRefundedItemsList() : [];
        this.saveRefundDetail.IsFlatAmountRefund = this.refundType === this.enuRefundType.FlatAmountRefund ? true : false;
        this.saveRefundDetail.RefundAmount = this._taxCalculationService.getRoundValue(this.saveRefundDetail.RefundAmount);
        
        this._httpService.save(SaleApi.saveSaleRefund, this.saveRefundDetail)
        .subscribe((res: any) => {
                if (res && res.MessageCode > 0) {
                    this.showSuccessMessageForInvoiceSave(this.saveRefundDetail.PaymentGatewayID);
                    this.closePopup();
                    this.isSaved.emit(true);
                }
                else{
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            err => { 
                this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Sale Refund")); 
            }
        );       
    }

    // save over paid refund amount
    saveOverPaidRefundPayment(){

        this.saveOverPaidRefundDetail = new SaveOverPaidRefundDetail();
        this.saveOverPaidRefundDetail.SaleInvoiceID = this.refundSaleDetail.SaleInvoiceID;
        this.saveOverPaidRefundDetail.CustomerID = this.refundSaleDetail.CustomerID;
        this.saveOverPaidRefundDetail.PaymentGatewayID = this.saveRefundDetail.PaymentGatewayID;
        this.saveOverPaidRefundDetail.Note = this.saveRefundDetail.Note;
        this.saveOverPaidRefundDetail.ReasonID = this.saveRefundDetail.ReasonID;

        this._httpService.save(SaleApi.saveSaleOverPaidRefund, this.saveOverPaidRefundDetail)
        .subscribe((res: any) => {
                if (res && res.MessageCode > 0) {
                    this.showSuccessMessageForInvoiceSave(this.saveOverPaidRefundDetail.PaymentGatewayID);
                    this.closePopup();
                    this.isSaved.emit(true);
                }
                else{
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            err => {
                 this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Sale Refund")); 
            }
        );       
    }

    // save item cancel, reschdule or no show refunded amount
    saveItemStatusChangedRefundPayment(){
                
        var param:any = {
            IsSaved: true,
            Notes: this.saveRefundDetail.Note,
          //  PaymentGatewayID: this.saveRefundDetail.PaymentGatewayID,
            SaleID: this.data.SaleID,
            ///////
            ActionType: this.data.RefundedModel.ActionType,
            ActivityType: this.data.RefundedModel.ActivityType,
            AppSourceTypeID: this.data.RefundedModel.AppSourceTypeID,
            ChargesAmount: this.data.RefundedModel.ChargesAmount,
            CustomerID: this.data.RefundedModel.CustomerID,
            IsChargeNow: this.data.RefundedModel.IsChargeNow,
            IsEarlyCancellationSelected: this.data.RefundedModel.IsEarlyCancellationSelected,
            IsRefundNow: this.data.RefundedModel.IsRefundNow,
            ItemID: this.data.RefundedModel.ItemID,
            ItemTypeID: this.data.RefundedModel.ItemTypeID,
            ReasonID: this.data.RefundedModel.ReasonID,
            SaleDetailID: this.data.RefundedModel.SaleDetailID,
            IsBenefitConsumed : this.data.RefundedModel.IsBenefitConsumed, 
            SaleStatusTypeID : this.data.RefundedModel.SaleStatusTypeID,
            ClassNoShowBenefit : this.data.RefundedModel.ClassNoShowBenefit,
            ClassCancellationEarlyBenefit : this.data.RefundedModel.ClassCancellationEarlyBenefit,
            ClassCancellationLateBenefit : this.data.RefundedModel.ClassCancellationLateBenefit,

        }

        if(this.data.RefundedModel.ActivityType == ENU_Action_ActivityType.Reschedule){
             /////////////added these new items for reschedule
             param.NewItemID = this.data.RefundedModel.NewItemID;
             param.NewStartDate = this.data.RefundedModel.NewStartDate;
             param.NewStartTime = this.data.RefundedModel.NewStartTime;
             param.NewEndTime = this.data.RefundedModel.NewEndTime;
             param.CustomerMembershipID = this.data.RefundedModel.CustomerMembershipID;
             param.Notes =this.saveRefundDetail.Note;
             /**For service only */
             if(this.data.RefundedModel.ItemTypeID == ENU_CancelItemType.Service) {
                param.StaffID = this.data.RefundedModel.StaffID;
                param.FacilityID = this.data.RefundedModel.FacilityID;
                param.SaleTypeId = this.saveRefundDetail.PaymentGatewayID;
             } 
        }
        let salePaymentMode = new SalePaymentModeViewModel();
        salePaymentMode.amount = this.data.RefundedModel.ChargesAmount;       
        salePaymentMode.paymentGatewayID = this.enumPaymentGateway.Cash;        
        salePaymentMode.saleTypeID = this.enumSaleType.Cash;
        // salePaymentMode.paymentGatewayID = this.saveRefundDetail.PaymentGatewayID;
        // salePaymentMode.saleTypeID = this.saveRefundDetail.PaymentGatewayID == this.enumPaymentGateway.Stripe_Card 
        // || this.saveRefundDetail.PaymentGatewayID == this.enumPaymentGateway.PayTabs ? this.enumSaleType.Card
        //                             : this.saveRefundDetail.PaymentGatewayID == this.enumPaymentGateway.Cash ? this.enumSaleType.Cash : this.enumSaleType.RewardPoint;
        
        
        param.paymentModes =  [salePaymentMode];

        this._httpService.save(this.data.Url, param)
        .subscribe((res: any) => {
                if (res && res.MessageCode > 0) {
                    this.closePopup();
                    this.isSaved.emit(true);
                }
                else{
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            err => {
                 this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Sale Refund")); 
            }
        );       
    }



    showSuccessMessageForInvoiceSave(paymentGatewayID: number){
        if(paymentGatewayID == this.enumSaleType.Cash ){
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Sale Refund"));
        }else{
            this._messageService.showSuccessMessage(this.messages.Success.YourRequestIsReceivedAndWillBeProcessedWithin48Hours); 
        }
    }

    setSchedulerFilters(paymentGatewayID: number) {
        let saleTypeId = EnumSaleType.Cash;
        switch (paymentGatewayID) {
            case ENU_PaymentGateway.Cash:
                saleTypeId = EnumSaleType.Cash;
                break;
            case ENU_PaymentGateway.Stripe_Card:
                break;

            case ENU_PaymentGateway.PaySafe:
                break;
        }

    }
    

    // #endregion

}