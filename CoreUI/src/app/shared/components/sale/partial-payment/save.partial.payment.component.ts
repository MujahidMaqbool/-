/********************** Angular References *********************************/
import { Component, OnInit, Inject, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';

/********************** Service & Models *********************/
/* Services */
import { HttpService } from '@services/app.http.service';
import { DataSharingService } from '@app/services/data.sharing.service';
import { MessageService } from '@app/services/app.message.service';
import { DateTimeService } from '@app/services/date.time.service';
import { LoaderService } from '@app/services/app.loader.service';
import { AuthService } from '@app/helper/app.auth.service';
import { StripeService } from '@app/services/stripe.service';
import { TaxCalculation } from '@app/services/tax.calculations.service';
import { MatDialogService } from '../../generics/mat.dialog.service';


/* Models */
import { SaleDetail, ReceiptItem, ReceiptModel, ReceiptPaymentMethod, CustomerRewardPointsDetailForPOS } from '@models/sale.model';
import { SaleInvoice, POSCartItem, SavePartialInvocie, StripePaymentIntent, POSFormsDetail, SaveSaleCardInvoice, PayTabPaymentMode, SalePaymentMode } from '@pos/models/point.of.sale.model';
import { ApiResponse, CustomerBasicInfo } from '@app/models/common.model';
import { AuthenticateCard } from '@customer/member/models/member.gateways.model';

/********************** Components *********************************/
import { AlertConfirmationComponent } from '@app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { PaymentFailedComponent } from '../payment-failed/payment.failed.component';
import { PrintReceiptComponent } from '../../print-receipt/print.receipt.component';
import { PartPaymentComponent } from '../part-payment-alert/part.payment.component';
import { AddStripeCustomerComponent } from '@app/gateway/stripe/add.stripe.customer.component';
import { PayTabsCustomerComponent } from '@app/gateway/pay-tabs/paytabs.customer.component';
import { StripeReaderPopupComponent } from '@app/home/stripe.reader.popup/stripe.reader.popup.component';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';

/******************  Configurations ****************************/
import { Configurations, SaleArea, DiscountType } from '@helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { environment } from '@env/environment';
import { POSItemType, EnumSaleType, ENU_PaymentGateway, PersonType, EnumSaleStatusType, ENU_ReaderStatus, ENU_DateFormatName, CalculatorValue, ENU_ChargeFeeType, ENU_Action_ActivityType, ENU_BookingStatusOption, ENU_CancelItemType } from '@helper/config/app.enums';
import { SaleApi, PointOfSaleApi, CustomerApi, GatewayIntegrationApi, DiscountSetupApi, CustomerRewardProgramApi, CustomerPaymentGatewayApi } from '@app/helper/config/app.webapi';
import { AppUtilities } from '@app/helper/aap.utilities';
import { ENU_Permission_Module, ENU_Permission_Individual, ENU_Permission_PointOfSale } from '@app/helper/config/app.module.page.enums';
import { TimeFormatPipe } from '@app/application-pipes/time-format.pipe';

@Component({
    selector: 'save-partial-payment',
    templateUrl: './save.partial.payment.component.html'
})

export class SavePartialPaymentComponent extends AbstractGenericComponent implements OnInit {
    @ViewChild("paytabsRef") paytabsRef: PayTabsCustomerComponent;
    @ViewChild("stripeRef") stripeRef: AddStripeCustomerComponent;
    @Output() paymentStatus = new EventEmitter<boolean>();
    @Output() isSaved = new EventEmitter<boolean>();
    // #region Local Memebers
    processPaymentResponse = {
        paymentIntentID: '',
        isProcessPaymentSucced: true
    }

    amntPaid: FormControl = new FormControl();
    splitamntPaid: FormControl = new FormControl();
    isDataExists: boolean;
    hasServiceCharges: boolean = false;
    hasDiscounts: boolean = false;
    hasBalance: boolean = false;
    isPartialPaymentAllow: boolean = false;
    hasPartialPaymentPermision: boolean = false;
    hasCustomerInfo: boolean = false;
    hasPaidAmountValid: boolean = false;
    isPayTabsIntegrated: boolean;
    isStripeIntegrated: boolean
    saveInProgress: boolean;
    noOfItems: number = 0;
    quantity: number = 0;
    receiptId: number;
    payAndPrint: boolean;
    currencyFormat: string;
    serviceCharges: number = 0;
    taxAmount: number = 0;
    discountAmount: number = 0;
    earlyPaymentDiscountAmount = 0;
    subTotalAmount: number = 0;
    tipAmount: number = 0;
    amountPaid: number = 0;
    grossAmount: number;
    totalAmountPaid: number = 0;
    totalBalance: number = 0;
    totalAmount: number = 0;
    customerID: number = 0;
    isStripeTerminalAllow: boolean = false;
    isWalkedIn: boolean;
    formStatus: string = 'normal';
    showStripeCard: boolean = false;
    showPayTabCard: boolean = false;
    branchName: string;
    hasTipsInPackage: boolean = false;

    calculatorResult: string = "0";
    showTipsCalculator: boolean;
    showServiceChargeCalculator: boolean;
    showDiscountCalc: boolean;
    showDiscountPin: boolean;
    isTipsCalculator: boolean;
    isDiscountCalculator: boolean;
    isServiceChargeCalculator: boolean;
    hasServiceChargesInPackage: boolean = false;
    hasDiscountInPackage: boolean = false;
    discountPinResult: string = "";
    discountPin: string = "";
    isBookingStatusChanged : boolean = false;
    //#endregion

    /***********Messages*********/
    messages = Messages;
    serverImageAddress = environment.imageUrl;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    successMessage: string;
    errorMessage: string;
    paymentTypeId: number;

    /* Model References */
    stripePaymentIntent: StripePaymentIntent;
    saleDetail: SaleDetail;
    copySaleDetail: SaleDetail;
    saleInvoice: SaleInvoice;
    savePartialInvocie: SavePartialInvocie;
    customerBasicInfo: CustomerBasicInfo;
    posCartItems: POSCartItem[] = [];
    formsDetail = new POSFormsDetail();
    saveSaleCardInvoice: SaveSaleCardInvoice;
    authenticateCard: AuthenticateCard = new AuthenticateCard();
    ReceiptPaymentMethod = new ReceiptPaymentMethod;


    staffForTipList: any[] = [];

    /* Dialog Reference */
    deleteDialogRef: any;
    viewDialogRef: any;

    /* Configurations */
    paymentType = EnumSaleType;
    posItemType = POSItemType;
    receiptDateFormat = Configurations.ReceiptDateFormat;
    dateFormat = Configurations.DateFormat;
    timeFormat = Configurations.TimeFormatView;
    saleArea = SaleArea;
    paymentGateway = ENU_PaymentGateway;
    enumSaleStatusType = EnumSaleStatusType;
    personType = PersonType;
    enu_ReaderStatus = ENU_ReaderStatus;
    discountType = DiscountType;

    calculatorValue = CalculatorValue;

    tipStaffName: string = "";
    // paymentTypeId = EnumSaleType.Cash;
    enumChargeType = ENU_ChargeFeeType;

    showCalendar: boolean = false;

    dueDate: Date;
    longDateFormat: string;
    dateFormatForSave = Configurations.DateFormatForSave;
    minDueDate: Date;
    tipStaffID: number = 0;

    //for split payment
    splitAmountPaid: number = 0;
    isAllowedSplitPayment: boolean = false;
    hasSplitPaymentInPackage: boolean = false;


    //for rewards points
    isShowRewardPoint: boolean = false;
    customerRewardPointsDetailForPOS = new CustomerRewardPointsDetailForPOS();
    isAllowedRewardPointsForPayment: boolean = false;
    isAllowedRewardPointsCustomerForPayment: boolean = false;
    isBranchHaveAnyDefaultRewardProgram: boolean = false;
    rewardPointsUsed: number = 0;
    redeemPoints: number = 0;

    isSaveSaleAndGetError: boolean = false;


    constructor(private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _currencyFormatter: CurrencyPipe,
        private _dialogRef: MatDialogRef<SavePartialPaymentComponent>,
        private _dialog: MatDialogService,
        private _taxCalculationService: TaxCalculation,
        private _authService: AuthService,
        private _stripeService: StripeService,
        private _TimeFormatPipe: TimeFormatPipe,
        private _loaderService: LoaderService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        super();
        this.paymentTypeId = this.paymentType.Cash;
        this.saleDetail = new SaleDetail();
        this.savePartialInvocie = new SavePartialInvocie();
        //this.savePartialInvocie.PaymentModes = new Array<SalePaymentMode>();
    }

    // #region Events

    ngOnInit() {
        this.getCurrentBranchDetail();
        this.getBranchConfiguredGatewaysFundamentals();
        this.setPermissions();
        this.customerID = this.data.customerId;


    }
    async isPartPaymentAllowed() {
        this.isPartialPaymentAllow = await super.isPartPaymentAllow(this._dataSharingService);
    }


    //#region Calculation

  onBackToPOS(){
    this.closePopup();
  }

  // Calculator Method Start

    onShowTipsCalculator() {
      setTimeout(() => {
          this.calculatorResult = "0";
          this.showTipsCalculator = true;
          this.showServiceChargeCalculator = false;
          this.showDiscountCalc = false;
          this.showDiscountPin = false;

          this.isTipsCalculator = true;
          this.isDiscountCalculator = false;
          this.isServiceChargeCalculator = false;
          this.showCalendar = false;
      });
  }

  // show discount vale
    showDiscountCalculator() {
        setTimeout(() => {
            this.resetDiscountPin();
            this.showDiscountCalc = true;
            this.showDiscountPin = false;
            this.showServiceChargeCalculator = false;
            this.showTipsCalculator = false;

            this.isTipsCalculator = false;
            this.isDiscountCalculator = true;
            this.isServiceChargeCalculator = false;
            this.showCalendar = false;
        });
    }

  // Services charges calculator
    onShowServiceChargeCalculator() {
        setTimeout(() => {
            this.calculatorResult = "0";
            this.showServiceChargeCalculator = true;
            this.showDiscountCalc = false;
            this.showDiscountPin = false;
            this.showTipsCalculator = false;
            this.isTipsCalculator = false;
            this.isDiscountCalculator = false;
            this.isServiceChargeCalculator = true;
            this.showCalendar = false;
        });
    }

    // Discount calculator
    onShowDiscountCalculator() {
    setTimeout(() => {
        this.calculatorResult = "0";
        this.showDiscountPin = true;
        this.showDiscountCalc = false;
        this.showServiceChargeCalculator = false;
        this.showTipsCalculator = false;
        this.isTipsCalculator = false;
        this.isDiscountCalculator = false;
        this.isServiceChargeCalculator = false;
        this.showCalendar = false;
    });
    }

    // Staff Tip
    onTipStaffChange() {
        if (this.tipStaffID == undefined || this.tipStaffID <= 0) {
            this.tipStaffID = null;
            this.tipAmount = 0;
            this.getTotal();
        } else{
          this.tipStaffName = this.tipStaffID > 0 ? this.staffForTipList.find(ts => ts.StaffID == this.tipStaffID).StaffFullName : "";
        }
    }

    // Get Total Calculation
    getTotal() {
        let total = 0;
    /*
        Total Amount = Gross Amount + Service Charges - Discount + Tax Amount
    */
        // if(!this.hasSplitPaymentInPackage || !this.isAllowedSplitPayment){
            var oldData = JSON.parse(JSON.stringify(this.copySaleDetail));

            oldData.BalanceAmount = oldData.BalanceAmount - this.earlyPaymentDiscountAmount;

            var scDiffrence = this.serviceCharges - oldData.ServiceChargesAmount ;
            oldData.BalanceAmount = oldData.BalanceAmount + scDiffrence;

            var tipDiffrence = this.tipAmount - oldData.TipAmount ;
            oldData.BalanceAmount = oldData.BalanceAmount + tipDiffrence;

            this.totalAmount = this.roundValue(oldData.BalanceAmount);
            // if (this.paymentTypeId !== this.paymentType.Cash) {
            //     this.amountPaid = this.roundValue(this.totalAmount);
            // }
        // } else {
        //     total = this.totalAmount + this.serviceCharges - this.earlyPaymentDiscountAmount + this.taxAmount + this.tipAmount;

        //     this.totalAmount = this.roundValue(total);
        // }

    }

    // close calculator
    closeCalculator() {
        this.showDiscountCalc = false;
        this.showServiceChargeCalculator = false;
        this.showTipsCalculator = false;
    }

    // Reset Calculator
        onCalulatorValueReset() {
        this.calculatorResult = "0";
    }

    // Calculate Method
    onCalculate(isPercentage: boolean) {
        if (this.isTipsCalculator) {
            this.getTips(isPercentage);
            this.showTipsCalculator = false;
        }
        else if (this.isDiscountCalculator) {
            this.getDiscount(isPercentage);
            this.showDiscountCalc = false;
        }
        else if (this.isServiceChargeCalculator) {
            this.getServiceCharges(isPercentage)
            this.showServiceChargeCalculator = false;
        }
    }

    getTips(isPercentage: boolean) {
        /*
            Tax should be calculated on Gross Amount
        */
        this.calculatorResult = this.removeLastCharacter(this.calculatorResult, ".");
        if (isPercentage) {
            this.tipAmount = this.getPercentage(this.totalAmount, parseFloat(this.calculatorResult));
        }
        else {
            this.tipAmount = parseFloat(this.calculatorResult);
        }
        this.tipAmount = isNaN(this.tipAmount) ? 0 : this.tipAmount;
        this.tipAmount = this.roundValue(this.tipAmount);

        this.getTotal();
    }

    getDiscount(isPercentage: boolean) {
        /*
            Tax should be calculated on Gross Amount
        */

        this.earlyPaymentDiscountAmount = 0;
        this.calculatorResult = this.removeLastCharacter(this.calculatorResult, ".");
        this.calculatorResult = isNaN(parseFloat(this.calculatorResult)) ? "0" : this.calculatorResult;
        if (isPercentage) {
            if (parseFloat(this.calculatorResult) > 100) {
                // show message that Discount can not be greater than 100%
                this._messageService.showErrorMessage(this.messages.Validation.Partail_Discount_Max);
            }
            else {
                this.earlyPaymentDiscountAmount = this.getPercentage(this.totalAmount, parseFloat(this.calculatorResult));
            }
        }
        else {
            if (parseFloat(this.calculatorResult) > this.totalAmount) {
                // show message that discount cannot be greater than gross amount
                this._messageService.showErrorMessage(this.messages.Validation.Partail_Discount_Max);
            }
            else {
                this.earlyPaymentDiscountAmount = parseFloat(this.calculatorResult);
            }
        }
        this.earlyPaymentDiscountAmount = this.roundValue(this.earlyPaymentDiscountAmount);

        this.getTotal();
    }

    getServiceCharges(isPercentage: boolean) {
        /*
            Service Charges should be calculated on Gross Amount
        */
        this.calculatorResult = this.removeLastCharacter(this.calculatorResult, ".");


        if (isPercentage) {
            this.serviceCharges = this.getPercentage(this.totalAmount, parseFloat(this.calculatorResult));
        }
        else {
            this.serviceCharges = parseFloat(this.calculatorResult);
        }

        this.serviceCharges = isNaN(this.serviceCharges) ? 0 : this.serviceCharges;
        this.serviceCharges = this.roundValue(this.serviceCharges);
        //this.saleInvoice.ServiceChargesAmount = this.serviceCharges;

        this.getTotal();
    }

    // Calculator Value change
    onCalculatorValueChange(value: any) {
        this.calculatorResult = this.calculatorResult.length >= 13 ? this.calculatorResult : this.calculatorResult + value.toString();
        this.calculatorResult = this.removeFirstCharacter(this.calculatorResult, "0");
    }

    removeFirstCharacter(value, character) {
        return value.indexOf(character) === 0 ? value.substring(1) : value;
    }
    removeLastCharacter(value, character) {
        return value.indexOf(character) === value.length ? value.substring(0, value - 1) : value;
    }
    getPercentage(amount: number, percentage: number): number {
        return this._taxCalculationService.getTwoDecimalDigit(((amount * percentage) / 100));
    }

// //#endregion Calculator Method End

// //#region Discount Pin Method Start

    closeDicsountPin() {
        this.showDiscountPin = false;
    }

    // Pin value Change
    onDiscountPinValueChange(value: any) {
        this.discountPinResult.length >= 10 ? '' : this.discountPinResult += "*";
        // this.discountPinResult += "*";
        if (!this.discountPin) {
            this.discountPin = value.toString();
        }
        else {
            this.discountPin = this.discountPin + value.toString();
        }
    }

    //  discount pin reset
    onDiscountPinReset() {
        this.resetDiscountPin();
    }

    resetDiscountPin() {
        this.discountPinResult = "";
        this.discountPin = "";
    }

    // discount Pin Cancel
    onDiscountPinCancel() {
        this.resetDiscountPin();
        this.closeDicsountPin();
    }

    onDiscountPinVerify() {
        if (this.discountPin && this.discountPin.length > 3) {
            this.verifyDiscountPassword(parseInt(this.discountPin));
        }
    }

    // Verify discount password
    verifyDiscountPassword(password: number) {
    this._httpService.save(DiscountSetupApi.verifyDiscountPassword, password).subscribe(
            response => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.showDiscountCalculator();
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Validation.Invalid_Discount_Password);
                    }
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Discount_Password_Verify_Error);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Discount_Password_Verify_Error);
            }
        )
    }

    //#region Discount Pin Method Start

    onCloseCalendar(){
        this.showCalendar = false;
    }

    //#endregion start date

    onClose() {

        if((this.savePartialInvocie.PaymentModeList && this.savePartialInvocie.PaymentModeList.length > 0) || this.tipAmount > 0 || this.discountAmount > 0 || this.serviceCharges > 0){

            const dialog = this._dialog.open(AlertConfirmationComponent);

            dialog.componentInstance.Heading = this.messages.Dialog_Title.Leave_Checkout;
            dialog.componentInstance.Title = "Alert";
            dialog.componentInstance.Message = this.messages.Confirmation.Any_Changes_You_Have_Made_Will_Be_Lost;
            dialog.componentInstance.showConfirmCancelButton = true;
            dialog.componentInstance.isChangeIcon = false;
            dialog.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
                if(isConfirm){
                    this.savePartialInvocie.PaymentModeList.forEach((paymentMode, index) => {
                        this.onDeletePaymentMode(paymentMode, index);
                    });
                    this.closePopup();
                }
            })
        } else{
            this.closePopup();
        }
    }
    closePopup(): void {
        this.isSaved.emit(false);
        this._dialogRef.close();
    }

    // onPrint() {
    //     this.getReceiptForPrint();
    // }

    ngOnChanges(changes: SimpleChanges): void {
        this.hasPaidAmountValid = false;
    }

    onPaymentTypeChange(paymentTypeId: number) {
        this.splitAmountPaid = 0;
        this.paymentTypeId = paymentTypeId;
        this.isShowRewardPoint = false;
        if (this.paymentTypeId === this.paymentType.Cash) {
            this.showStripeCard = false;
            this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Cash;
            this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.Cash;
            this.savePartialInvocie.PaymentMode.IsSaveCard = undefined;
        }
        else if (this.paymentTypeId === this.paymentType.Card) {
            if (this.isStripeIntegrated) {
                this.showStripeCard = true;
                this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Card;
                this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.Stripe_Card;
                this.savePartialInvocie.PaymentMode.IsSaveCard = false;

                this.authenticateCard.SaleTypeID = this.paymentType.Card;
                this.authenticateCard.PaymentGatewayID = this.paymentGateway.Stripe_Card;
            }
            else if (this.isPayTabsIntegrated) {
                this.showPayTabCard = true;
                this.showStripeCard = false;
                this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Card;
                this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.PayTabs;
                this.savePartialInvocie.PaymentMode.IsSaveCard = false;
            } else {
                this.showPayTabCard = false;
                this.showStripeCard = false;
            }

        }
        else if (this.paymentTypeId === this.paymentType.Other) {
            this.showStripeCard = false;
            this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Other;
            this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.Other;
            this.savePartialInvocie.PaymentMode.IsSaveCard = undefined;
        }
        else if (this.paymentTypeId === this.paymentType.StripeTerminal) {
            //   this.getStripeTerminalConfig();
            this.showStripeCard = false;
            this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Card;
            this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.Stripe_Card;
            this.savePartialInvocie.PaymentMode.IsSaveCard = undefined;
        }
        else if (this.paymentTypeId === this.paymentType.RewardPoint) {
            this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.RewardPoint;
            this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.RewardPoints;
            this.savePartialInvocie.PaymentMode.IsSaveCard = undefined;
            this.isShowRewardPoint = true;
        }

        this.onPaidAmountChange();
        this.splitAmountPaid = this.savePartialInvocie.PaymentMode.SaleTypeID == this.paymentType.Cash ||  this.savePartialInvocie.PaymentMode.SaleTypeID == this.paymentType.RewardPoint
                                ? 0 : this.roundValue((this.totalAmount - this.amountPaid));
        //this.amountPaid = this.amountPaid + this.splitAmountPaid;
        this.amountPaid = this.splitAmountPaid > 0 ? this.amountPaid + this.splitAmountPaid : this.amountPaid;
        this.splitAmountPaid =  this.splitAmountPaid < 0 ? 0 :  this.splitAmountPaid
    }

    onCardTabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
        if (tabChangeEvent.index == 0) {
            this.showStripeCard = true;
            this.showPayTabCard = false;
            this.savePartialInvocie.SaleTypeID = this.paymentType.Card;
            this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Card;
            this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.Stripe_Card;
            this.savePartialInvocie.PaymentMode.IsSaveCard = false;
            this.amountPaid = this.totalAmount;
            this.hasPaidAmountValid = false;

            this.authenticateCard.SaleTypeID = this.paymentType.Card;
            this.authenticateCard.PaymentGatewayID = this.paymentGateway.Stripe_Card;
        }
        else {
            this.showPayTabCard = true;
            this.showStripeCard = false;
            this.savePartialInvocie.SaleTypeID = this.paymentType.Card;
            this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Card;
            this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.PayTabs;
            this.savePartialInvocie.PaymentMode.IsSaveCard = false;
            this.amountPaid = this.totalAmount;
            this.hasPaidAmountValid = false;
        }
    }

    // onPay(payAndPrint: boolean, isSplitPayment: boolean) {
    //     this.saveInProgress = true;
    //     this.payAndPrint = payAndPrint;

    //     // if (this.roundValue(this.amountPaid) <= 0) {
    //     if (this.isPartialPaymentAllow && this.customerBasicInfo.AllowPartPaymentOnCore) {
    //         if (this.paymentTypeId === this.paymentType.Card && this.amountPaid > this.totalAmount) {
    //             this._messageService.showErrorMessage(this.messages.Validation.Equal_Payment_In_Card_Case);
    //             this.saveInProgress = false;
    //         }
    //         else if (this.amountPaid < this.totalAmount) {
    //             this.hasPartialPaymentPermision = true;
    //             this.onOpenPartialPaymentDialoge();
    //         }
    //         else {
    //             this.hasPartialPaymentPermision = false;
    //             this.Save();
    //         }
    //     }
    //     else {
    //         this.hasPartialPaymentPermision = false;
    //         this.Save();
    //     }
    //     // }
    //     // else {
    //     //     this.saveInProgress = false;
    //     //     this.hasPaidAmountValid = true;
    //     // }
    // }

    onPay(payAndPrint: boolean, isSplitPayment: boolean) {
        this.saveInProgress = isSplitPayment ? false : true;
        this.payAndPrint = payAndPrint;

        if(isSplitPayment && (this.paymentTypeId === this.paymentType.Card || this.paymentTypeId === this.paymentType.StripeTerminal) && this.splitAmountPaid < 0.50){
            this.saveInProgress = false;
            this._messageService.showErrorMessage(this.messages.Validation.Please_Enter_An_Amount_Greater_Than_Or_Equal_To_Proceed_Through_Card.replace("{0}", this.currencyFormat));
            return;
        }

        if(!isSplitPayment && (this.paymentTypeId === this.paymentType.Card || this.paymentTypeId === this.paymentType.StripeTerminal) && this.splitAmountPaid > 0 && this.splitAmountPaid < 0.50){
            this.saveInProgress = false;
            this._messageService.showErrorMessage(this.messages.Validation.Please_Enter_An_Amount_Greater_Than_Or_Equal_To_Proceed_Through_Card.replace("{0}", this.currencyFormat));
            return;
        }

        if(isSplitPayment && this.splitAmountPaid == 0){
            this.saveInProgress = false;
            this._messageService.showErrorMessage("Please enter an amount greater than zero to proceed.");
            return
        } else if(this.splitAmountPaid > 0 && this.paymentTypeId == this.paymentType.RewardPoint && (this.customerRewardPointsDetailForPOS.PointsBalance == 0 || this.rewardPointsUsed == 0 || this.rewardPointsUsed > this.customerRewardPointsDetailForPOS.PointsBalance)){
            this.saveInProgress = false;
            this._messageService.showErrorMessage(this.messages.Validation.Insufficient_Points_Balance);
            return
        }
        else if(isSplitPayment && this.splitAmountPaid > 0){

            if ((this.paymentTypeId === this.paymentType.Cash || this.paymentTypeId === this.paymentType.Card || this.paymentTypeId === this.paymentType.Other || this.paymentTypeId === this.paymentType.StripeTerminal || this.paymentTypeId === this.paymentType.RewardPoint) && this.amountPaid > this.totalAmount) {
                this._messageService.showErrorMessage(this.messages.Validation.Equal_Payment_In_Card_Case);
                this.saveInProgress = false;
                return;
            }
            this.Save(isSplitPayment);
        } else if (this.isPartialPaymentAllow && this.customerBasicInfo.AllowPartPaymentOnCore) {
            if ((this.paymentTypeId === this.paymentType.Other || this.paymentTypeId === this.paymentType.StripeTerminal || this.paymentTypeId === this.paymentType.Card || this.paymentTypeId === this.paymentType.RewardPoint) && this.amountPaid > this.totalAmount) {
                this._messageService.showErrorMessage(this.messages.Validation.Equal_Payment_In_Card_Case);
                this.saveInProgress = false;
            }else if(this.checkAnyItemDeleteOnCartAndPaidAmount()){
                this._messageService.showErrorMessage(this.messages.Validation.Equal_Payment_In_Card_Case);
                this.saveInProgress = false;
            } else if (this.amountPaid < this.totalAmount) {
                //as per discussion with tahir saab commenting tip and service (09/02/2022)

                //if (this.tipAmount > 0 && this.amountPaid < this.tipAmount) {
                // if (this.tipAmount > 0 && this.saleDetail.TotalAmountPaid + this.amountPaid < this.tipAmount) {
                //     this.saveInProgress = false;
                //     this._messageService.showErrorMessage(this.messages.Validation.TipAmount_Required.replace("{0}", this.getFormattedAmount(this.tipAmount)));
                // }
                // else {
                    this.hasPartialPaymentPermision = true;
                    this.onOpenPartialPaymentDialoge(isSplitPayment);
                    //this.Save(isSplitPayment);
                // }
            }
            else {
                this.hasPartialPaymentPermision = false;
                this.Save(isSplitPayment);
            }
        }
        else {
            if ((this.paymentTypeId === this.paymentType.Other || this.paymentTypeId === this.paymentType.StripeTerminal || this.paymentTypeId === this.paymentType.Card || this.paymentTypeId === this.paymentType.RewardPoint) && this.amountPaid > this.totalAmount) {
                this._messageService.showErrorMessage(this.messages.Validation.Equal_Payment_In_Card_Case);
                this.saveInProgress = false;
            } else{
                this.hasPartialPaymentPermision = false;
                this.Save(isSplitPayment);
            }
        }
    }

    checkAnyItemDeleteOnCartAndPaidAmount(): boolean{
        var totalPaidamount = 0;
        this.savePartialInvocie.PaymentModeList.forEach(mode => {
            totalPaidamount += Number(mode.Amount);
        });
        return totalPaidamount > this.totalAmount ? true : false;
    }

    onOpenPartialPaymentDialoge(isSplitPayment: boolean): boolean {
        let isConfirmPay: boolean = false;
        let payment = {
            totalAmount: this.roundValue(this.totalAmount),
            totalAmountPaid: this.roundValue(this.amountPaid),
            totalBalance: this.roundValue(this.amountPaid - this.totalAmount)
        }
        const dialogref = this._dialog.open(PartPaymentComponent,
            {
                disableClose: true,
                data: payment
            });
        dialogref.componentInstance.confirmPay.subscribe((isConfirmPay: boolean) => {
            if (isConfirmPay) {
                isConfirmPay = true;
                this.Save(isSplitPayment);
            }
            else {
                this.saveInProgress = false;
                isConfirmPay = false;
            }
        })
        return isConfirmPay;
    }

    onOpenStripeReaderDialoge() {
        this._httpService.get(GatewayIntegrationApi.GetTerminalConfig).subscribe(
            (response: ApiResponse) => {
              if (response && response.MessageCode > 0) {
                if (response.Result) {
                  this._dataSharingService.shareStripeTerminalLoactionID(response.Result.TerminalLocation);
                }
              }

              this._dialog.open(StripeReaderPopupComponent, {
                disableClose: false,
              });

            },
            (error) => {
              this._messageService.showErrorMessage(
                this.messages.Error.Get_Error.replace("{0}", "Stripe Configuration")
              );
            }
          );
    }

    // #endregion

    // #region Methods

    setPermissions() {
        this.hasDiscountInPackage = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Discount);
        this.hasTipsInPackage = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Tips);
        this.hasServiceChargesInPackage = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.ServiceCharges);
        this.hasSplitPaymentInPackage = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.SplitPayment);

        if(this.hasTipsInPackage){
            this.getSaleFundamentals();
        }

    }

    async getCurrentBranchDetail() {
        this.receiptDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.ReceiptDateFormat);

        this.longDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.LongDateFormat);

        // get due date according branch time zone
        this.minDueDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

        if( this.data?.isBookingID){
            this.getServiceDetail();
        } else{
            this.getSaleDetail(this.data.saleID);
        }

        this.savePartialInvocie.CustomerID = this.data.customerId;
        this.savePartialInvocie.SaleID = this.data.saleID;
        this.savePartialInvocie.SaleTypeID = this.paymentType.Cash;
        this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.Cash;
        this.savePartialInvocie.SaleStatusTypeID = this.enumSaleStatusType.Paid;

        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.isStripeTerminalAllow = branch.AllowStripeTerminal;
            this.branchName = branch.BranchName;
            this.isStripeTerminalAllow = this._authService.hasPagePermission(ENU_Permission_Module.Individual, ENU_Permission_Individual.AllowStripeTerminal) && this.isStripeTerminalAllow ? true : false;
            /*
         by default we pass currency name and angualr pipe get currrency symbol on the behalf of currency ,
          if currency symbol did't exist in angular currency pipe then angular bind currency name,so we need to change currency format to currency symbol
         */
            this.currencyFormat = branch.CurrencySymbol;
        }

        this.isPartPaymentAllowed();

    }

    /* returns  integrated gateways flag  */
    getBranchConfiguredGatewaysFundamentals() {
        this._httpService.get(GatewayIntegrationApi.fundamentals).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.isPayTabsIntegrated = response.Result.IsPayTabsIntegrated;
                        this.isStripeIntegrated = response.Result.IsStripeIntegrated;
                        this.isStripeIntegrated = response.Result.IsStripeIntegrated;
                        this.isAllowedSplitPayment = response.Result.IsSplitPaymentsEnabledOnCore;
                        this.isAllowedRewardPointsForPayment = response.Result.RewardProgramPaymentOnCore;
                        if(this.isAllowedRewardPointsForPayment){
                            this.getCustomerRewardPointsFundamentals();
                        }
                        this.isBranchHaveAnyDefaultRewardProgram = response.Result.IsBranchHaveAnyDefaultRewardProgram;
                    }
                } else {
                    this.isPayTabsIntegrated = false;
                    this.isStripeIntegrated = false;
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            (error) => {
                this.isPayTabsIntegrated = false;
                this.isStripeIntegrated = false;
                this._messageService.showErrorMessage(
                    this.messages.Error.Get_Error.replace("{0}", "Branch Gateways Fundamentals")
                );
            }
        );
    }

    // Save() {
    //     var oldData = JSON.parse(JSON.stringify(this.copySaleDetail));
    //     if(this.totalAmount < 0){
    //         this._messageService.showErrorMessage(this.messages.Error.PleaseEnterAnAmountGreaterThanThePaidAmountToProceed);
    //         this.saveInProgress = false;
    //     } else{
    //         if (this.paymentTypeId === this.paymentType.Cash) {
    //             this.saveInvoice();
    //         }
    //         else if (this.paymentTypeId === this.paymentType.Card && this.showStripeCard) {
    //             this.authenticateCard.SaleTypeID = this.paymentType.Card;
    //             this.authenticateCard.PaymentGatewayID = this.paymentGateway.Stripe_Card;
    //             this.payByCard();
    //         }
    //         else if (this.paymentTypeId === this.paymentType.Card && this.showPayTabCard) {
    //             this._dataSharingService.onButtonSubmit(true);
    //             this.paytabsRef.payByPayTabsCard().then((response: PayTabPaymentMode) => {
    //                 this.savePartialInvocie.PaymentMode.CustomerPaymentGatewayID = response.CustomerPaymentGatewayID;
    //                 this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.PayTabs;
    //                 this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Card;
    //                 this.saveInvoice();

    //             }).catch(error => {
    //                 this.saveInProgress = false;
    //                 this._messageService.showErrorMessage(error);
    //             })
    //         }
    //         else if (this.paymentTypeId === this.paymentType.Other) {
    //             this.saveInvoice();
    //         }

    //         else if (this.paymentTypeId === this.paymentType.StripeTerminal) {
    //             this.stripePaymentIntent = new StripePaymentIntent();
    //             this.savePartialInvocie.PaymentMode.IsStripeTerminal = true;

    //             this.isReaderConnected().then(isConnected => {
    //                 if (isConnected) {
    //                     this._stripeService.createPaymentIntent(this.amountPaid, this.customerBasicInfo.CustomerID, this.customerBasicInfo.Email).then((response: ApiResponse) => {
    //                         this.stripePaymentIntent = response.Result;
    //                         this.savePartialInvocie.PaymentMode.CustomerPaymentGatewayID = this.stripePaymentIntent.CustomerPaymentGatewayID;
    //                         this._stripeService.collectPayment(this.stripePaymentIntent.ClientSecret).then((response: any) => {
    //                             if (response === "canceled") {
    //                                 this.saveInProgress = false;
    //                             }
    //                             if (!response) {
    //                                 //   this._messageService.showErrorMessage(this.messages.Error.Reader_Not_Connected);
    //                                 this.onOpenStripeReaderDialoge();
    //                                 this.saveInProgress = false;
    //                             }
    //                             else {
    //                                 this._stripeService.processPayment(response).then((processPaymentResponse: any) => {
    //                                     this.processPaymentResponse.paymentIntentID = processPaymentResponse.paymentIntentID;
    //                                     this.savePartialInvocie.PaymentReferenceNo = processPaymentResponse.paymentIntentID;
    //                                     //   console.log("Step 3 => payment intent id = ", paymentIntentID);
    //                                     if(this.processPaymentResponse.paymentIntentID == ""){
    //                                         this.processPaymentResponse.isProcessPaymentSucced = false;
    //                                         this.saveInProgress = false;
    //                                     } else{
    //                                         this.saveInvoice();
    //                                     }
    //                                 }).catch(err => this._messageService.showErrorMessage(err));
    //                             }

    //                         }).catch(err => {
    //                             this._messageService.showErrorMessage(err);
    //                             this._stripeService.clearReaderDisplay();
    //                         });
    //                     }).catch(err => {
    //                         this._messageService.showErrorMessage(err);
    //                         this._stripeService.clearReaderDisplay();
    //                     });
    //                 }
    //                 else {
    //                     this._messageService.showErrorMessage(this.messages.Error.Reader_Not_Connected);
    //                     this.onOpenStripeReaderDialoge();
    //                     this.saveInProgress = false;
    //                 }
    //             });
    //         }
    //     }

    // }

    Save(isSplitPayment: boolean) {

        this.savePartialInvocie.PaymentMode.PaymentTypeID = this.paymentTypeId
        this.savePartialInvocie.PaymentMode.IsStripeTerminal = false;
        if(this.savePartialInvocie.PaymentModeList && this.savePartialInvocie.PaymentModeList.length > 0 && this.splitAmountPaid == 0 && !isSplitPayment){
            this.parepareDataForSaveInvoice();
        } else if (this.paymentTypeId === this.paymentType.Cash) {

            if(isSplitPayment){
                this.onAddSplitPayments()
            }else{
                this.parepareDataForSaveInvoice();
            }
        }
        else if (this.paymentTypeId === this.paymentType.Card && this.showStripeCard) {
            this.payByCard(isSplitPayment);
        }
        else if (this.paymentTypeId === this.paymentType.Card && this.showPayTabCard) {
            this._dataSharingService.onButtonSubmit(true);
            this.paytabsRef.payByPayTabsCard().then((response: PayTabPaymentMode) => {
                    this.savePartialInvocie.PaymentMode.CustomerPaymentGatewayID = response.CustomerPaymentGatewayID;
                    this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.PayTabs;
                    this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Card;
                    if(isSplitPayment){
                        this.onAddSplitPayments()
                    }else{
                        this.parepareDataForSaveInvoice();
                    }

            }).catch(error => {

                this.saveInProgress = false;
                this._messageService.showErrorMessage(error);
            })
        }
        else if (this.paymentTypeId === this.paymentType.Other) {
            if(isSplitPayment){
                this.onAddSplitPayments()
            }else{
                this.parepareDataForSaveInvoice();
            }
        }
        else if (this.paymentTypeId === this.paymentType.StripeTerminal) {
            this.stripePaymentIntent = new StripePaymentIntent();
            this.savePartialInvocie.PaymentMode.IsStripeTerminal = true;

            this.isReaderConnected().then(isConnected => {
                if (isConnected) {

                    if(isSplitPayment){
                        this.onAddSplitPayments();
                    }else{
                        this.parepareDataForSaveInvoice();
                    }
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Reader_Not_Connected);
                    this.onOpenStripeReaderDialoge();
                    this.saveInProgress = false;
                }
            });
        } else if (this.paymentTypeId === this.paymentType.RewardPoint) {
            this.customerRewardPointsDetailForPOS.PointsBalance = this.roundValue(this.customerRewardPointsDetailForPOS.PointsBalance - this.redeemPoints);
            if(isSplitPayment){
                this.onAddSplitPayments();
            }else{
                this.parepareDataForSaveInvoice();
            }
        }
    }

    onDeletePaymentMode(paymentMode, arrayIndex){

        if (paymentMode.PaymentTypeID === this.paymentType.Cash || paymentMode.PaymentTypeID === this.paymentType.Other || paymentMode.PaymentTypeID === this.paymentType.RewardPoint){
            this.savePartialInvocie.PaymentModeList.splice(arrayIndex, 1);

            if(paymentMode.PaymentTypeID === this.paymentType.RewardPoint){
                this.customerRewardPointsDetailForPOS.PointsBalance = this.customerRewardPointsDetailForPOS.CopyPointsBalance;
                this.rewardPointsUsed = 0;
            }

            this.onPaidAmountChange();
        } else{

            let params = {
                paymentGatewayID: paymentMode.PaymentGatewayID,
                paymentAuthorizationID: paymentMode.PaymentAuthorizationID
            }

            this._httpService.save(CustomerPaymentGatewayApi.ReleasePaymentBasedOnPaymentGateway, params).subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.savePartialInvocie.PaymentModeList.splice(arrayIndex, 1);
                        this._messageService.showSuccessMessage(res.Result.Message);
                        this.onPaidAmountChange();
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Release_Payment_Error);
                }
            )
        }
    }

    onAddSplitPayments(){
        if(this.savePartialInvocie.PaymentModeList == null || this.savePartialInvocie.PaymentModeList.length == 0){
            this.savePartialInvocie.PaymentModeList = new Array<SalePaymentMode>();
        }

        this.savePartialInvocie.PaymentMode.Amount = this.splitAmountPaid;

        this.savePartialInvocie.PaymentMode.CustomerID = this.customerID;

        this.savePartialInvocie.PaymentMode.IsWalkedIn = this.isWalkedIn;
        this.savePartialInvocie.PaymentMode.IsNewCard = this.savePartialInvocie.PaymentMode.GatewayCustomerID ? true : false;

        var authorizePaymentBasedOnPaymentGatewayResult;
        if(this.paymentTypeId != this.paymentType.RewardPoint && this.paymentTypeId != this.paymentType.Cash &&  this.paymentTypeId != this.paymentType.Other){
            this._httpService.save(CustomerPaymentGatewayApi.AuthorizePaymentBasedOnPaymentGateway, this.savePartialInvocie.PaymentMode)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    authorizePaymentBasedOnPaymentGatewayResult =  response.Result;

                    if(!this.savePartialInvocie.PaymentMode.IsStripeTerminal && authorizePaymentBasedOnPaymentGatewayResult.PaymentGatewayID == this.paymentGateway.Stripe_Card && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsAuthenticationRequire){

                        this._stripeService.confirmCardPayment(authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.ClientSecret, authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.PaymentMethod).then(response => {
                            if (response) {
                                var saleMode = new SalePaymentMode();
                                saleMode.PaymentGatewayID = this.savePartialInvocie.PaymentMode.PaymentGatewayID;
                                saleMode.IsStripeTerminal =this.savePartialInvocie.PaymentMode.IsStripeTerminal;
                                saleMode.SaleTypeID	= this.savePartialInvocie.PaymentMode.SaleTypeID;
                                saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                                saleMode.Amount = this.savePartialInvocie.PaymentMode.Amount;
                                saleMode.IsSaveCard = this.savePartialInvocie.PaymentMode.IsSaveCard;
                                saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                                this.savePartialInvocie.PaymentModeList.push(saleMode);

                                this.splitAmountPaid = 0;
                                this.onPaidAmountChange();
                            } else{
                                return;
                            }
                        },
                            error => {
                                this._messageService.showErrorMessage(this.messages.Error.Payment_Declined);
                                return;
                            });

                        /////////////////////////////
                    } else if(this.savePartialInvocie.PaymentMode.IsStripeTerminal){
                        // this._stripeService.createPaymentIntent(this.splitAmountPaid, this.personInfo.CustomerID, this.personInfo.Email).then((response: ApiResponse) => {
                        //     this.stripePaymentIntent = response.Result;
                            //sdvsdv
                            this._loaderService.show();
                            this._stripeService.collectPayment(authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.ClientSecret).then((response: any) => {
                                if (response === "canceled") {
                                    this.saveInProgress = false;
                                    this._loaderService.hide();
                                }
                                if (!response) {
                                    this.onOpenStripeReaderDialoge();
                                    this.saveInProgress = false;
                                    this._loaderService.hide();
                                }
                                else {
                                    this._stripeService.processPayment(response).then((processPaymentResponse: any) => {
                                        this.processPaymentResponse.paymentIntentID = processPaymentResponse.paymentIntentID;
                                        if(this.processPaymentResponse.paymentIntentID == ""){
                                            this.processPaymentResponse.isProcessPaymentSucced = false;
                                            this.saveInProgress = false;
                                        } else{
                                            var saleMode = new SalePaymentMode();
                                            saleMode.PaymentGatewayID = this.savePartialInvocie.PaymentMode.PaymentGatewayID;
                                            saleMode.IsStripeTerminal =this.savePartialInvocie.PaymentMode.IsStripeTerminal;
                                            saleMode.SaleTypeID	= this.savePartialInvocie.PaymentMode.SaleTypeID;
                                            saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                                            saleMode.Amount = this.savePartialInvocie.PaymentMode.Amount;
                                            saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                                            saleMode.IsSaveInstrument = authorizePaymentBasedOnPaymentGatewayResult &&
                                            authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel
                                            ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveInstrument : false;
                                            saleMode.IsSaveCard = authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveCard :
                                                                    authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel.IsSaveCard : false;
                                            this.savePartialInvocie.PaymentModeList.push(saleMode);

                                            this.splitAmountPaid = 0;
                                            this.onPaidAmountChange();
                                            this.onPaymentTypeChange(this.paymentType.Cash);
                                            this._loaderService.hide();
                                        }
                                    }).catch(err => {
                                        this._messageService.showErrorMessage(err);
                                        this._loaderService.hide();
                                        this.saveInProgress = false;
                                    });
                                }

                            }).catch(err => {
                                this._loaderService.hide();
                                this._messageService.showErrorMessage(err);
                                this._stripeService.clearReaderDisplay();
                                this.saveInProgress = false;
                            });

                        // }).catch(err => {
                        //     this._messageService.showErrorMessage(err);
                        //     this._stripeService.clearReaderDisplay();
                        // });
                    } else{
                        var saleMode = new SalePaymentMode();
                        saleMode.PaymentGatewayID = this.savePartialInvocie.PaymentMode.PaymentGatewayID;
                        saleMode.PaymentTypeID = this.savePartialInvocie.PaymentMode.PaymentTypeID;
                        saleMode.IsStripeTerminal =this.savePartialInvocie.PaymentMode.IsStripeTerminal;
                        saleMode.SaleTypeID	= this.savePartialInvocie.PaymentMode.SaleTypeID;
                        saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                        saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                        saleMode.IsSaveInstrument = authorizePaymentBasedOnPaymentGatewayResult &&
                                 authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel
                                  ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveInstrument : false;
                                saleMode.IsSaveCard = authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveCard :
                                                        authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel.IsSaveCard : false;
                        saleMode.Amount = this.savePartialInvocie.PaymentMode.Amount;
                        //saleMode.IsSaveCard = this.savePartialInvocie.PaymentMode.IsSaveCard;
                        this.savePartialInvocie.PaymentModeList.push(saleMode);

                        this.splitAmountPaid = 0;
                        this.onPaidAmountChange();
                        this.onPaymentTypeChange(this.paymentType.Cash);
                    }
                } else{
                    this._messageService.showErrorMessage("error");
                    this.saveInProgress = false;
                }
            },
            error => {
                this.saveInProgress = false;
                this._messageService.showErrorMessage(error?.error?.MessageText);
            });
        } else{


            var result = this.savePartialInvocie.PaymentModeList.find(i => i.PaymentTypeID == this.paymentTypeId);

            if(result){
                result.Amount = Number(result.Amount) + Number(this.savePartialInvocie.PaymentMode.Amount);
            } else{
                var saleMode = new SalePaymentMode();
                saleMode.SaleTypeID	= this.savePartialInvocie.PaymentMode.SaleTypeID ? this.savePartialInvocie.PaymentMode.SaleTypeID : this.paymentType.Cash;
                saleMode.PaymentGatewayID = this.savePartialInvocie.PaymentMode.PaymentGatewayID;
                saleMode.IsStripeTerminal =this.savePartialInvocie.PaymentMode.IsStripeTerminal;
                saleMode.PaymentTypeID = this.savePartialInvocie.PaymentMode.PaymentTypeID;
                saleMode.PaymentAuthorizationID	= null;
                saleMode.Amount = this.savePartialInvocie.PaymentMode.Amount;
                this.savePartialInvocie.PaymentModeList.push(saleMode);
            }

            this.splitAmountPaid = 0;
            this.onPaidAmountChange();
        }
    }

    isReaderConnected() {
        return new Promise<boolean>((resolve, reject) => {
            this._stripeService.getConnectionStatus().then((isReaderConneted: any) => {
                if (isReaderConneted == this.enu_ReaderStatus.Connected) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        });
    }

    saveInvoice() {
        if (this.hasPartialPaymentPermision || this.amountPaid >= this.roundValue(this.totalAmount)) {

            let saveModel = this.preparInvoiceModelForSave();

            this._httpService.save(saveModel.url, saveModel.params)
                .subscribe((res: ApiResponse) => {


                    this.saveInProgress = false;

                    if(res.MessageCode < 0){
                        this.isSaveSaleAndGetError = true;
                        this.splitAmountPaid = 0;
                        if(!this.hasSplitPaymentInPackage || !this.isAllowedSplitPayment){
                            this.savePartialInvocie.PaymentMode =  this.savePartialInvocie.PaymentModeList[0];

                            this.savePartialInvocie.PaymentModeList.forEach((paymentMode, index) => {
                                this.onDeletePaymentMode(paymentMode, index);
                            });
                            // this.savePartialInvocie.PaymentMode = new SalePaymentMode();
                            // this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Cash;
                            // this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.Cash;
                            this.onPaymentTypeChange(this.paymentType.Cash);
                            this.savePartialInvocie.PaymentMode.Amount = 0;
                            this.amountPaid = 0;


                            this.savePartialInvocie.PaymentModeList = new Array<SalePaymentMode>();
                        }
                    }

                    // if some payments faield in case of partial payments show payment failed dailog for go to purchase precess complete
                    if (res && res.Result?.unProcessedPayments?.length > 0) {
                        var invoiceDetail = res.Result;
                        this._dialog.open(PaymentFailedComponent, {
                                disableClose: true,
                                data: {
                                unProcessedPaymentsList: res.Result.unProcessedPayments,
                                saleInvoiceNumber: invoiceDetail?.SaleInvoiceNumber,
                                totalAmountPaid: invoiceDetail?.TotalAmountPaid,
                                totalDue: invoiceDetail?.TotalDue,
                                totalFailedAmountToBePaid: invoiceDetail?.TotalFailedAmountToBePaid,
                                customerID: this.savePartialInvocie.CustomerID,
                            }
                        })
                    } else if (res && res.MessageCode > 0) {
                        this.showMessageAfterPaymentCapturedSuccessfully(res);
                    }
                    else if (res.MessageCode === -103 || res.MessageCode === -607 || res.MessageCode === -608) {
                        this._messageService.showErrorMessage(res.MessageText);
                        this.saveInProgress = false;

                    } else {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Invoice"));
                        this.saveInProgress = false;
                    }
                },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Invoice"));
                        this.saveInProgress = false;
                        this.isSaveSaleAndGetError = true;
                        this.splitAmountPaid = 0;
                        if(!this.hasSplitPaymentInPackage || !this.isAllowedSplitPayment){
                            this.savePartialInvocie.PaymentMode =  this.savePartialInvocie.PaymentModeList[0];

                            this.savePartialInvocie.PaymentModeList.forEach((paymentMode, index) => {
                                this.onDeletePaymentMode(paymentMode, index);
                            });
                            // this.savePartialInvocie.PaymentMode = new SalePaymentMode();
                            // this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Cash;
                            // this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.Cash;
                            // this.savePartialInvocie.PaymentMode.Amount = 0;
                            this.onPaymentTypeChange(this.paymentType.Cash);
                            this.amountPaid = 0;


                            this.savePartialInvocie.PaymentModeList = new Array<SalePaymentMode>();
                        }
                    }
                );
        }
        else {
            this._messageService.showErrorMessage(this.messages.Validation.Pay_Full_Amount);
            this.saveInProgress = false;
        }
    }

    parepareDataForSaveInvoice(){

        if (this.paymentTypeId == this.paymentType.StripeTerminal) {
            this.savePartialInvocie.PaymentMode.CustomerPaymentGatewayID = this.stripePaymentIntent.CustomerPaymentGatewayID;
            this.savePartialInvocie.PaymentMode.PaymentGatewayID = this.paymentGateway.Stripe_Card;
            this.savePartialInvocie.PaymentMode.SaleTypeID = this.paymentType.Card;
            this.savePartialInvocie.PaymentMode.StripeTerminalRefenceNo = this.processPaymentResponse.paymentIntentID;
        }


        if(this.savePartialInvocie.PaymentModeList == null || this.savePartialInvocie.PaymentModeList.length == 0){
            this.savePartialInvocie.PaymentModeList = new Array<SalePaymentMode>();
            this.savePartialInvocie.PaymentMode.Amount = this.splitAmountPaid;
        } else{
            this.savePartialInvocie.PaymentMode.Amount = this.splitAmountPaid;
        }

        if(this.savePartialInvocie.PaymentModeList && this.savePartialInvocie.PaymentModeList.length > 0 && this.splitAmountPaid == 0){
            this.saveInvoice();
            return;
        }

        if(this.isSaveSaleAndGetError && (this.hasSplitPaymentInPackage || this.isAllowedSplitPayment)){
            this.saveInvoice();
            return;
        }

        this.savePartialInvocie.PaymentMode.CustomerID = this.savePartialInvocie.CustomerID;
        this.savePartialInvocie.PaymentMode.IsWalkedIn = this.isWalkedIn;
        this.savePartialInvocie.PaymentMode.IsNewCard = this.savePartialInvocie.PaymentMode.GatewayCustomerID ? true : false;

        var authorizePaymentBasedOnPaymentGatewayResult;
        if(this.paymentTypeId != this.paymentType.RewardPoint && this.paymentTypeId != this.paymentType.Cash &&  this.paymentTypeId != this.paymentType.Other){
            if(this.splitAmountPaid > 0){
                this._httpService.save(CustomerPaymentGatewayApi.AuthorizePaymentBasedOnPaymentGateway, this.savePartialInvocie.PaymentMode)
                .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    authorizePaymentBasedOnPaymentGatewayResult =  response.Result;

                    if(!this.savePartialInvocie.PaymentMode.IsStripeTerminal&& authorizePaymentBasedOnPaymentGatewayResult.PaymentGatewayID == this.paymentGateway.Stripe_Card && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsAuthenticationRequire){

                        this._stripeService.confirmCardPayment(authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.ClientSecret, authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.PaymentMethod).then(response => {
                            if (response) {
                                var saleMode = new SalePaymentMode();
                                saleMode.PaymentGatewayID = this.savePartialInvocie.PaymentMode.PaymentGatewayID;
                                saleMode.IsStripeTerminal =this.savePartialInvocie.PaymentMode.IsStripeTerminal;
                                saleMode.SaleTypeID	= this.savePartialInvocie.PaymentMode.SaleTypeID;
                                saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                                saleMode.Amount = this.savePartialInvocie.PaymentMode.Amount;
                                saleMode.IsSaveCard = this.savePartialInvocie.PaymentMode.IsSaveCard;
                                saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                                this.savePartialInvocie.PaymentModeList.push(saleMode);

                                this.saveInvoice();
                                return;
                            } else{
                                return;
                            }
                        },
                            error => {
                                this._messageService.showErrorMessage(this.messages.Error.Payment_Declined);
                                return;
                            });

                        /////////////////////////////
                    } else if(this.savePartialInvocie.PaymentMode.IsStripeTerminal){
                        this._loaderService.show();
                            this._stripeService.collectPayment(authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.ClientSecret).then((response: any) => {
                                if (response === "canceled") {
                                    this.saveInProgress = false;
                                    this._loaderService.hide();
                                }
                                if (!response) {
                                    this.onOpenStripeReaderDialoge();
                                    this.saveInProgress = false;
                                    this._loaderService.hide();
                                }
                                else {
                                    this._stripeService.processPayment(response).then((processPaymentResponse: any) => {
                                        this.processPaymentResponse.paymentIntentID = processPaymentResponse.paymentIntentID;
                                        if(this.processPaymentResponse.paymentIntentID == ""){
                                            this.processPaymentResponse.isProcessPaymentSucced = false;
                                            this.saveInProgress = false;
                                            this._loaderService.hide();
                                        } else{
                                            var saleMode = new SalePaymentMode();
                                            saleMode.PaymentGatewayID = this.savePartialInvocie.PaymentMode.PaymentGatewayID;
                                            saleMode.IsStripeTerminal =this.savePartialInvocie.PaymentMode.IsStripeTerminal;
                                            saleMode.SaleTypeID	= this.savePartialInvocie.PaymentMode.SaleTypeID;
                                            saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                                            saleMode.Amount = this.savePartialInvocie.PaymentMode.Amount;
                                            saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                                            saleMode.IsSaveInstrument = authorizePaymentBasedOnPaymentGatewayResult &&
                                            authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel
                                            ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveInstrument : false;
                                            saleMode.IsSaveCard = authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveCard :
                                                                    authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel.IsSaveCard : false;
                                            this.savePartialInvocie.PaymentModeList.push(saleMode);

                                            this.saveInvoice();
                                            return;
                                        }
                                    }).catch(err => {
                                            this._messageService.showErrorMessage(err);
                                            this._loaderService.hide();
                                            this.saveInProgress = false;
                                        });
                                }

                            }).catch(err => {
                                this._loaderService.hide();
                                this._messageService.showErrorMessage(err);
                                this._stripeService.clearReaderDisplay();
                                this.saveInProgress = false;
                            });
                    } else{

                        var saleMode = new SalePaymentMode();
                        saleMode.PaymentGatewayID = this.savePartialInvocie.PaymentMode.PaymentGatewayID;
                        saleMode.IsStripeTerminal =this.savePartialInvocie.PaymentMode.IsStripeTerminal;
                        saleMode.SaleTypeID	= this.savePartialInvocie.PaymentMode.SaleTypeID;
                        saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                        saleMode.Amount = this.savePartialInvocie.PaymentMode.Amount;
                        //saleMode.IsSaveCard = this.savePartialInvocie.PaymentMode.IsSaveCard;
                        saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                        saleMode.PaymentTypeID = this.savePartialInvocie.PaymentMode.PaymentTypeID;
                        saleMode.IsSaveInstrument = authorizePaymentBasedOnPaymentGatewayResult &&
                        authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel
                        ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveInstrument : false;
                        saleMode.IsSaveCard = authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveCard :
                                                authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel.IsSaveCard : false;
                        this.savePartialInvocie.PaymentModeList.push(saleMode);

                        this.saveInvoice();
                        return;
                    }
                } else{
                    this._messageService.showErrorMessage("error");
                    this.saveInProgress = false;
                }
            },
            error => {
                this._messageService.showErrorMessage(error?.error?.MessageText);
                this.saveInProgress = false;
            });
            } else{
                this.saveInvoice();
                return;
            }
        } else{

            var result = this.savePartialInvocie.PaymentModeList.find(i => i.PaymentTypeID == this.paymentTypeId);

            if(this.savePartialInvocie.PaymentMode.SaleTypeID == this.paymentType.Cash && this.savePartialInvocie.PaymentModeList && this.savePartialInvocie.PaymentModeList.length > 0){
                var totalSplitAmount = 0
                this.savePartialInvocie.PaymentModeList.forEach(mode => {
                    totalSplitAmount += Number(mode.Amount);
                });

                this.savePartialInvocie.PaymentMode.Amount = (totalSplitAmount + Number(this.splitAmountPaid)) > this.totalAmount ? this.totalAmount - totalSplitAmount : this.splitAmountPaid;
            }

            if(result){
                if(result.SaleTypeID != this.paymentType.Cash){
                    result.Amount = Number(result.Amount) + Number(this.savePartialInvocie.PaymentMode.Amount);
                } else{
                    var paidAmountWithoutCash = 0;
                    this.savePartialInvocie.PaymentModeList.forEach(mode => {
                        if(mode.SaleTypeID != this.paymentType.Cash)
                            paidAmountWithoutCash += Number(mode.Amount);
                    });

                    var paidAmountWithCash = Number(result.Amount) + Number(this.savePartialInvocie.PaymentMode.Amount);

                    if((paidAmountWithoutCash > 0 && paidAmountWithoutCash + paidAmountWithCash) > this.totalAmount){
                        result.Amount = this.totalAmount - paidAmountWithoutCash;
                    } else if(paidAmountWithoutCash == 0 && paidAmountWithCash > this.totalAmount){
                        result.Amount = this.totalAmount;
                    } else{
                        result.Amount = paidAmountWithCash;
                    }
                }
            } else{
                var saleMode = new SalePaymentMode();
                saleMode.SaleTypeID	= this.savePartialInvocie.PaymentMode.SaleTypeID ? this.savePartialInvocie.PaymentMode.SaleTypeID : this.paymentType.Cash;
                saleMode.PaymentGatewayID = this.savePartialInvocie.PaymentMode.PaymentGatewayID;
                saleMode.IsStripeTerminal =this.savePartialInvocie.PaymentMode.IsStripeTerminal;
                saleMode.PaymentAuthorizationID	= null;
                saleMode.PaymentTypeID = this.savePartialInvocie.PaymentMode.PaymentTypeID;
                saleMode.Amount = saleMode.PaymentGatewayID == this.paymentGateway.Cash && (this.amountPaid - this.totalAmount) > 0 ? this.savePartialInvocie.PaymentMode.Amount - (this.amountPaid - this.totalAmount) : this.savePartialInvocie.PaymentMode.Amount;
                this.savePartialInvocie.PaymentModeList.push(saleMode);
            }

            this.saveInvoice();
            return;
        }
    }

    preparInvoiceModelForSave(){

        let saveInvoiceModel: any = {};

        this.savePartialInvocie.InvoiceAmount = (this.amountPaid >= this.roundValue(this.totalAmount)) ? this.totalAmount : this.amountPaid;
        this.savePartialInvocie.CashReceived = this.amountPaid;

        //this data will only map when isItemChargedFee bit is true (in case of (cancellation - No Show - Reschedule) class and service)
        if(this.data?.isItemChargedFee){
            saveInvoiceModel.url = this.data.Url;
            saveInvoiceModel.params = {
                PaymentReferenceNo: null,
                PaymentGatewayID : this.savePartialInvocie.PaymentMode.PaymentGatewayID,
                CustomerPaymentGatewayID : this.savePartialInvocie.PaymentMode.CustomerPaymentGatewayID,
                SaleID : this.data?.isBookingID ? null : this.data.saleID,
                ActionType : this.data.ChargedModel.ActionType,
                ActivityType : this.data.ChargedModel.ActivityType,
                AppSourceTypeID : this.data.ChargedModel.AppSourceTypeID,
                ChargesAmount : this.data.ChargedModel.ChargesAmount,
                CustomerID : this.data.ChargedModel.CustomerID,
                IsChargeNow : this.data.ChargedModel.IsChargeNow,
                IsEarlyCancellationSelected : this.data.ChargedModel.IsEarlyCancellationSelected,
                IsRefundNow : this.data.ChargedModel.IsRefundNow,
                ItemID : this.data.ChargedModel.ItemID,
                ItemTypeID : this.data.ChargedModel.ItemTypeID,
                ReasonID : this.data.ChargedModel.ReasonID,
                SaleDetailID : this.data?.isBookingID ? null : this.data.ChargedModel.SaleDetailID,
                SaleTypeID : this.savePartialInvocie.SaleTypeID == this.paymentType.Other ? this.paymentType.Cash : this.savePartialInvocie.SaleTypeID,
                CustomerBookingID: this.data?.isBookingID ? this.data.CustomerBookingID : null,
                ClassNoShowBenefit : this.data.ChargedModel.ClassNoShowBenefit,
                ClassCancellationEarlyBenefit : this.data.ChargedModel.ClassCancellationEarlyBenefit,
                ClassCancellationLateBenefit : this.data.ChargedModel.ClassCancellationLateBenefit,
                NewItemID : this.data.ChargedModel.NewItemID,
                Notes : this.savePartialInvocie.Note,
                IsBenefitConsumed : this.data.ChargedModel.IsBenefitConsumed,
                PaymentModes: this.savePartialInvocie.PaymentModeList
            }
            if(this.data.ChargedModel.ActivityType == ENU_Action_ActivityType.Reschedule){
                /////////////added these new items for reschedule
                saveInvoiceModel.params.NewItemID = this.data.ChargedModel.NewItemID;
                saveInvoiceModel.params.NewStartDate = this.data.ChargedModel.NewStartDate;
                saveInvoiceModel.params.NewStartTime = this.data.ChargedModel.NewStartTime;
                saveInvoiceModel.params.NewEndTime = this.data.ChargedModel.NewEndTime;
                saveInvoiceModel.params.CustomerMembershipID = this.data.ChargedModel.CustomerMembershipID;
                saveInvoiceModel.params.PaymentModes = this.savePartialInvocie.PaymentModeList;

                if(this.data.ChargedModel.ItemTypeID == ENU_CancelItemType.Service) {
                    saveInvoiceModel.params.StaffID = this.data.ChargedModel.StaffID;
                    saveInvoiceModel.params.FacilityID = this.data.ChargedModel.FacilityID;
                 }
           }
        } else{
            saveInvoiceModel.url = PointOfSaleApi.savePartialPaymentInvoice;

            var oldData = JSON.parse(JSON.stringify(this.copySaleDetail));

            this.savePartialInvocie.InvoiceDueDate = this._dateTimeService.convertDateObjToString(this.dueDate, this.dateFormatForSave);
            this.savePartialInvocie.SaleDiscountAmount = this.earlyPaymentDiscountAmount > 0 ? this.earlyPaymentDiscountAmount : null
            this.savePartialInvocie.SaleTipAmount = oldData.TipAmount != this.tipAmount ? this.tipAmount : null;
            this.savePartialInvocie.SaleServiceChargesAmount = oldData.ServiceChargesAmount != this.serviceCharges ? this.serviceCharges : null;
            this.savePartialInvocie.TipStaffID = this.tipStaffID > 0 ? this.tipStaffID : null;

            saveInvoiceModel.params = this.savePartialInvocie;
        }

        return saveInvoiceModel;
    }

    showMessageAfterPaymentCapturedSuccessfully(res: ApiResponse) {
        this.receiptId = res.MessageCode;
        if (this.payAndPrint) {
            this.printReceipt(res.Result.InvoiceReceiptDetails);
        }
        // if (this.paymentTypeId == this.paymentType.StripeTerminal) {
        //     this._stripeService.capturePayment(this.processPaymentResponse.paymentIntentID).then(response => {
        //         if (response && response.MessageCode > 0) {
        //             this._messageService.showSuccessMessage(this.messages.Success.Payment_Captured);
        //         }
        //     })
        // }
        // else {
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Invoice"));
        // }

        // this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Invoice"));
        this.closePopup();
        this.saveInProgress = false;
        this.isSaved.emit(true);

    }

    payByCard(isSplitPayment: boolean) {
        this.authenticateCard.CustomerID = this.savePartialInvocie.CustomerID;
        if (this.stripeRef.cardId === 0) {
            this.authenticateCard.CustomerPaymentGatewayID = this.stripeRef.cardId;
            this.stripeRef.getStripeToken().then(
                token => {
                    this.savePartialInvocie.PaymentMode.IsSaveCard = this.stripeRef.isSaveCard;
                    this.authenticateCard.CardToken = token.id;

                    this._stripeService.stripeCardAuthentication(this.authenticateCard).then(isResolved => {
                        if (isResolved && isResolved.Resolve) {
                            this.savePartialInvocie.PaymentMode.CardToken = null;
                            // this.saleInvoice.PaymentMode.IsSaveCard = undefined;
                            this.savePartialInvocie.PaymentMode.CustomerPaymentGatewayID = isResolved.CustomerPaymentGatewayId;
                            this.savePartialInvocie.PaymentMode.IsSaveInstrument = isResolved.IsSaveInstrument;
                            this.savePartialInvocie.GatewayCustomerID = isResolved.GatewayCustomerID;
                            if(isSplitPayment){
                                this.onAddSplitPayments()
                            }else{
                                this.parepareDataForSaveInvoice();
                            }
                        }
                        else if (isResolved && isResolved.MessageCode === -103 ||
                            isResolved && isResolved.MessageCode === -118 ||
                            isResolved && isResolved.MessageCode === -125) {
                            this.saveInProgress = false;
                            this._messageService.showErrorMessage(isResolved.MessageText);
                        }

                        else if (!this.savePartialInvocie.PaymentMode.IsSaveCard) {
                            this.saveInProgress = false;
                            this._stripeService.deleteGateway(this.authenticateCard);
                        }

                        else {
                            this.saveInProgress = false;
                            if (isResolved && isResolved.MessageCode === -103) {
                                this._messageService.showErrorMessage(isResolved.MessageText);
                            }
                            else {
                                this.stripeRef.getSavedCards();
                                this.saveInProgress = false;
                            }

                        }
                    },
                        error => {
                            this._messageService.showErrorMessage(error);
                            this.saveInProgress = false;
                            this._stripeService.deleteGateway(this.authenticateCard);
                        });


                },
                error => {
                    this._messageService.showErrorMessage(error);
                    this.saveInProgress = false;
                }
            )

        }
        else {
            this.savePartialInvocie.PaymentMode.CardToken = null;
            this.authenticateCard.CardToken = null;
            this.savePartialInvocie.PaymentMode.IsSaveCard = undefined;
            this.savePartialInvocie.PaymentMode.CustomerPaymentGatewayID = this.stripeRef.cardId;
            this.authenticateCard.CustomerPaymentGatewayID = this.stripeRef.cardId;

            // this._stripeService.stripeCardAuthentication(this.authenticateCard).then(isResolved => {
            //     if (isResolved && isResolved.Resolve) {
                    this.savePartialInvocie.PaymentMode.IsSaveInstrument = this.stripeRef.isSaveInstrument;
            //         this.savePartialInvocie.GatewayCustomerID = isResolved.GatewayCustomerID;
                     if(isSplitPayment){
                         this.onAddSplitPayments()
                     }else{
                         this.parepareDataForSaveInvoice();
                     }
            //     }
            // },
            //     error => {
            //         this._messageService.showErrorMessage(error);
            //         this.saveInProgress = false;
            //     });

        }
    }


    getSaleDetail(saleID: number) {
        this.noOfItems = 0;
        this.quantity = 0;

        this._httpService.get(SaleApi.getInvoiceDetail + saleID)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    if (res.Result) {
                        this.saleDetail = res.Result;

                        // check for cancel, reschedule or no show case
                        if(this.data?.isItemChargedFee){
                            this.prepareItemChargeModelForShow();
                        }

                        this.prepareSaleDateForSHow();
                    }
                }
                else {
                    this.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', "Sale Detail"));
                }
            );
    }

    getServiceDetail(){
        this.noOfItems = 0;
        this.quantity = 0;
       this.saleDetail = this.data.BookingData;
       this.prepareItemChargeModelForShow();
       this.prepareSaleDateForSHow();

    }

    prepareItemChargeModelForShow(){
        this.getCustomerBasicInfo();
        this.isPartialPaymentAllow = false;
        this.isBookingStatusChanged = true;
        // in this case only one item recived
        if(!this.data.isBookingID)
            this.saleDetail.ItemList = this.saleDetail.ItemList.filter(o => o.SaleDetailID == this.data.saleDetailID);
        // this.saleDetail.ItemList = [];
        // this.saleDetail.ItemList = filteredItem;
        this.saleDetail.ItemList[0].IsItemCancelled = this.data?.chargedType == ENU_ChargeFeeType.Cancellation ? true : false;
        this.saleDetail.ItemList[0].IsItemNoShow = this.data?.chargedType == ENU_ChargeFeeType.NoShow ? true : false;
        this.saleDetail.ItemList[0].IsItemRescheduled = this.data?.chargedType == ENU_ChargeFeeType.Reschedule ? true : false;
        this.saleDetail.ItemList[0].IsMembershipBenefit = this.data?.ChargedModel.CustomerMembershipID && this.data?.ChargedModel.CustomerMembershipID > 0 ? true : false;

        this.saleDetail.ItemList[0].MembershipName = this.data?.ChargedModel.DiscountType;

        // set cancelation fee only
        this.saleDetail.ItemList[0].ItemPrice =  this.data.itemChargedAmount;
        this.saleDetail.ItemList[0].ItemTotalPrice = this.data.itemChargedAmount;
        this.saleDetail.ItemList[0].ItemTotalDiscountedPrice = this.data.itemChargedAmount;
        this.saleDetail.TotalDue = this.data.itemChargedAmount;
        this.saleDetail.TotalPrice =  this.data.itemChargedAmount;
        this.saleDetail.SubTotalPrice = this.data.itemChargedAmount;
        this.saleDetail.ItemList[0].ItemCancellationCharges = this.data.ItemCancellationCharges ;
        this.saleDetail.ItemList[0].NoShowCharges = this.data.NoShowCharges ;
        this.saleDetail.ItemList[0].ItemRescheduleCharges = this.data.ItemRescheduleCharges;

        // set the new item name date start time end time and unit per session only for reschedule booking
        if(this.data.ChargedModel.ActivityType == ENU_BookingStatusOption.Reschedule){
            this.saleDetail.ItemList[0].ItemName = this.data.newItemName;
            this.saleDetail.ItemList[0].StartDate = this.data.ChargedModel.NewStartDate;
            this.saleDetail.ItemList[0].StartTime = this.data.ChargedModel.NewStartTime;
            this.saleDetail.ItemList[0].EndTime = this.data.ChargedModel.NewEndTime;
            this.saleDetail.ItemList[0].ItemPricePerUnit =  this.data.newItemPricePerSesion;
            // this.saleDetail.ItemList[0].DiscountType =  this.data.ChargedModel.DiscountType;
            // this.saleDetail.ItemList[0].MembershipName =  this.data.ChargedModel.DiscountType;


        }


        // set zero
        this.saleDetail.ItemList[0].ItemTaxAmount = 0;
        this.saleDetail.ItemList[0].ItemDiscountAmount = 0;
        this.saleDetail.TipAmount = 0;
        this.saleDetail.ServiceChargesAmount = 0;
        this.saleDetail.TipStaffID = 0;
        this.saleDetail.SaleDiscountAmount = 0;
        this.saleDetail.BalanceAmount = 0;
        this.saleDetail.TotalAmountPaid = 0;
        this.saleDetail.TotalTaxAmount = 0;
    }

    prepareSaleDateForSHow(){
        this.copySaleDetail = JSON.parse(JSON.stringify(this.saleDetail));

        this.dueDate = this.saleDetail.InvoiceDueDate ? this._dateTimeService.convertStringIntoDateForScheduler(this.saleDetail.InvoiceDueDate) : this.minDueDate;
        this.getCustomerBasicInfo();
        this.setInvocieAmounts(this.saleDetail);
        this.hasServiceCharges = this.saleDetail.ServiceChargesAmount && this.saleDetail.ServiceChargesAmount > 0 ? true : false;
        this.hasDiscounts = this.saleDetail.SaleDiscountAmount && this.saleDetail.SaleDiscountAmount > 0 ? true : false;
        this.hasBalance = this.saleDetail.BalanceAmount && this.saleDetail.BalanceAmount > 0 ? true : false;

        this.saleDetail.ItemList.forEach(detail => {
            if (detail.ImagePath && detail.ImagePath !== "") {
                detail.ImagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + detail.ImagePath;
            }
            else {
                detail.ImagePath = detail.ImagePath + './assets/images/pos_placeholder.jpg';
            }


            if (detail.StartTime && detail.StartTime != "") {
                detail.StartTime = this._dateTimeService.formatTimeString(detail.StartTime, this.timeFormat);
            }

            if (detail.EndTime && detail.EndTime != "") {
                detail.EndTime = this._dateTimeService.formatTimeString(detail.EndTime, this.timeFormat);
            }


             //this code commented by fahad after invoice chnages no need to discount multiply by qty backend developer already done all calculations added by fahaf 26/07/2021
            // if (detail.IsMembershipBenefit) {
            //     detail.DiscountType = detail.IsMembershipBenefit ? this.discountType.MembershipBenefit : this.discountType.POSDiscount;
            //     //detail.TotalDiscount = detail.ItemDiscountAmount && detail.ItemDiscountAmount > 0 ? (detail.ItemDiscountAmount * detail.Qty) : 0;
            //     //detail.TotalAmount = detail.TotalDiscount > 0 ? (detail.Price * detail.Qty) - detail.TotalDiscount : (detail.Price * detail.Qty);
            // }
            // else {
            //     detail.TotalDiscount = 0;
            // }

            // added by fahad remap code after backend changes dated on 26/07/2021
            detail.DiscountType = detail.IsMembershipBenefit ? detail.MembershipName : !detail.IsMembershipBenefit && detail.ItemDiscountAmount > 0 ? this.discountType.POSDiscount : "";
            detail.TotalDiscount = detail.ItemDiscountAmount ? detail.ItemDiscountAmount : 0;

            if(this.data?.isItemChargedFee){
                detail.ItemTotalPrice = detail.ItemTotalPrice;
            } else {
                detail.ItemTotalPrice = detail.ItemTotalDiscountedPrice;
            }


            // remove - sign from discount amount added by fahaf dated on 26/07/2021
            if(Math.sign(detail.TotalDiscount) == -1){
                var dAmount: string = detail.TotalDiscount.toString();
                dAmount = dAmount.replace("-", "");
                detail.TotalDiscount = Number(dAmount);
            }


            detail.ShowBookingTime = (detail.ItemTypeID === this.posItemType.Class || detail.ItemTypeID === this.posItemType.Service) ? true : false;
            this.quantity += detail.ItemQty ? detail.ItemQty : 0;
        });

        this.tipAmount = this.saleDetail.TipAmount;
        this.serviceCharges = this.saleDetail.ServiceChargesAmount;
        this.tipStaffID = this.saleDetail.TipStaffID > 0 ? this.saleDetail.TipStaffID : 0;
        this.tipStaffName = this.tipStaffID > 0 ? this.staffForTipList.find(ts => ts.StaffID == this.tipStaffID).StaffFullName : "";
        this.grossAmount = this.saleDetail.TotalDue;
        this.noOfItems = this.saleDetail.ItemList.length;
    }

    // getReceiptForPrint() {
    //     this._httpService.get(PointOfSaleApi.getInvoiceForPrint + this.saleDetail.SaleID).subscribe(
    //         (res: ApiResponse) => {
    //             if (res && res.MessageCode > 0) {
    //                 if (res.Result) {
    //                     this.printReceipt(res.Result);
    //                 }
    //                 else {
    //                     this._messageService.showErrorMessage(this.messages.Error.Printer_Not_Configured);
    //                 }
    //             }
    //             else {
    //                 this.showErrorMessage(res.MessageText);
    //             }
    //         },
    //         error => {
    //             this.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Receipt for print"));
    //         }
    //     )
    // }

    getCustomerBasicInfo() {
        this._httpService.get(CustomerApi.getCustomerBasicInfo + this.customerID)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    if (res.Result) {
                        this.hasCustomerInfo = res.Result ? true : false;
                        this.customerBasicInfo = new CustomerBasicInfo();
                        this.customerBasicInfo = res.Result;

                        // check for cancel, reschedule or no show case
                        this.customerBasicInfo.AllowPartPaymentOnCore = this.data?.isItemChargedFee ? false : this.customerBasicInfo.AllowPartPaymentOnCore
                    }
                }
                else {
                    this.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', "Customer Basic Info"));
                }
            );
    }

    getSaleFundamentals() {
        return this._httpService.get(SaleApi.getSaleFundamentals)
            .toPromise()
            .then(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.staffForTipList = response.Result.StaffList;
                        this.tipStaffName = this.tipStaffID > 0 ? this.staffForTipList.find(ts => ts.StaffID == this.tipStaffID).StaffFullName : "";
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
                }
            )
    }

    // onPaidAmountChange(amountPaid: any) {
    //     sdcv
    //     this.hasPaidAmountValid = this.roundValue(amountPaid) <= 0 ? true : false;
    // }

    onPaidAmountChange(){
        this.amountPaid = 0;

        this.savePartialInvocie.PaymentModeList.forEach(mode => {
            this.amountPaid += Number(mode.Amount);
        });

        if(this.splitAmountPaid > 0){
            this.amountPaid = this.roundValue(this.amountPaid + Number(this.splitAmountPaid));
        }

        if(this.paymentTypeId === this.paymentType.RewardPoint && this.splitAmountPaid > 0){
            this.redeemPoints = this.roundValue(((this.splitAmountPaid / this.customerRewardPointsDetailForPOS.RewardProgramRedemptionValue) * this.customerRewardPointsDetailForPOS.RewardProgramRedemptionPoints));
            this.rewardPointsUsed = this.redeemPoints;
        } else{
            this.redeemPoints = 0;
        }
    }

    getCustomerRewardPointsFundamentals() {

        this._httpService.get(CustomerRewardProgramApi.fundamentalsForWidgetAndPOS + this.customerID).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.isAllowedRewardPointsCustomerForPayment = true;
                        this.customerRewardPointsDetailForPOS = response.Result;

                        this.customerRewardPointsDetailForPOS.CopyPointsBalance = this.customerRewardPointsDetailForPOS.PointsBalance;

                        if(this.rewardPointsUsed > 0){
                            this.customerRewardPointsDetailForPOS.PointsBalance = this.roundValue(this.customerRewardPointsDetailForPOS.PointsBalance - this.rewardPointsUsed);
                        } else if(this.rewardPointsUsed == 0 && this.savePartialInvocie.PaymentModeList.find(pm => pm.PaymentTypeID == this.paymentType.RewardPoint)){
                          //discus with faisal; and then implement
                        }
                        var pointsValue = (this.totalAmount / 100) * this.customerRewardPointsDetailForPOS.MaximumPointsRedeemLimitInPercentage;

                        this.customerRewardPointsDetailForPOS.MaximumPointsRedeemLimit = this.roundValue(((pointsValue / this.customerRewardPointsDetailForPOS.RewardProgramRedemptionValue) * this.customerRewardPointsDetailForPOS.RewardProgramRedemptionPoints));
                    }else if(response && response.MessageCode == 204){
                        this.isAllowedRewardPointsForPayment = false;
                    }
                } else {
                    this.isAllowedRewardPointsForPayment = false;
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            (error) => {
                this.isPayTabsIntegrated = false;
                this.isStripeIntegrated = false;
                this._messageService.showErrorMessage(
                    this.messages.Error.Get_Error.replace("{0}", "Customer Reward Points Fundamentals")
                );
            }
        );
    }

    printReceipt(receiptInfo: any) {
        this._dialog.open(PrintReceiptComponent, {
            data: {
                receipt: this.setReceiptPrintModel(receiptInfo),
                openDrawer: false
            }
        });
    }

    setReceiptPrintModel(receiptInfo: any) {
        let receipt = new ReceiptModel();

        this.saleDetail.ItemList.forEach(item => {
            let receiptItem = new ReceiptItem();
            receiptItem.Name = item.ItemName;
            receiptItem.VariantName = item.ItemVariantName;
            receiptItem.MembershipPaymentInterval = item.MembershipPaymentInterval;
            receiptItem.MembershipPaymentName = item.MembershipPaymentName;
            receiptItem.Name = item.ItemName;
            receiptItem.Price = this.getFormattedAmount(item.ItemPricePerUnit);
            receiptItem.Qty = item.ItemQty.toString();
            receiptItem.ItemIsRefunded = item.IsRefunded;
            receiptItem.ItemRefundedAmount = item.RefundedAmount;
            receiptItem.IsItemRescheduled = item.IsItemRescheduled;
            receiptItem.ItemReScheduleCount = item.ItemReScheduleCount;
            receiptItem.Amount = this.getFormattedAmount(item.ItemTotalDiscountedPrice);
            receiptItem.ItemTaxAmount = item.ItemTaxAmount > 0 ?  receiptInfo.CurrencySymbol + this.getFormattedAmount(item.ItemTaxAmount) : receiptInfo.CurrencySymbol + "0.00";
            //receiptItem.Amount = this.getFormattedAmount((item.Price * item.Qty) - (item.ItemDiscountAmount * item.Qty));
            receiptItem.DiscountType = item.IsMembershipBenefit ? item.MembershipName : item.ItemDiscountAmount > 0 ? this.discountType.POSDiscount : '';
            receiptItem.TotalDiscount = item.ItemDiscountAmount > 0 ? item.ItemDiscountAmount : null;

            switch (item.ItemTypeID) {
                case this.posItemType.Product:
                    receiptItem.Description = '';
                    break;
                case this.posItemType.Service:
                    receiptItem.Description = this._dateTimeService.convertDateObjToString(new Date(item.StartDate), this.longDateFormat)
                    + ' | ' + this._TimeFormatPipe.transform(item.StartTime) + ' - ' + this._TimeFormatPipe.transform(item.EndTime);
                    break;
                case this.posItemType.Class:
                    receiptItem.Description = this._dateTimeService.convertDateObjToString(new Date(item.StartDate), this.longDateFormat)
                    + ' | ' +  this._TimeFormatPipe.transform(item.StartTime)
                    + ' - ' + this._TimeFormatPipe.transform(item.EndTime);
                    break;
            }

            receipt.Items.push(receiptItem);
        });

        // no need to show refund in partial payments case
        // if (this.saleDetail.SaleReceipt && this.saleDetail.SaleReceipt.length > 0) {
        //     this.saleDetail.SaleReceipt.forEach(element => {
        //         if(element.SaleStatusTypeID == this.enumSaleStatusType.Refund){
        //             this.ReceiptPaymentMethod.MethodName = element.PaymentMethod ;
        //             this.ReceiptPaymentMethod.PaymentGatewayName = element.PaymentGateWayName;
        //             this.ReceiptPaymentMethod.SaleStatusTypeName = element.SaleStatusTypeName;
        //             this.ReceiptPaymentMethod.LastDigits = element.InstrumentLastDigit;
        //             this.ReceiptPaymentMethod.InvoiceAmount = element.InvoiceAmount == "0.00"? "0" : this.getFormattedAmount(element.InvoiceAmount);
        //             this.ReceiptPaymentMethod.Adjustment = this.getFormattedAmount(element.AdjustmentAmount);
        //             receipt.paymentMethod.push(this.ReceiptPaymentMethod);
        //             this.ReceiptPaymentMethod = new ReceiptPaymentMethod;
        //         }
        //     });
        // }

        receipt.branchName = this.branchName;
        receipt.Balance = this.getFormattedAmount(this.saleDetail.BalanceAmount);
        //receipt.BranchInfo = receiptBranch;
        receipt.CashierID = receiptInfo.CashierName;
        receipt.CustomerName = receiptInfo.CustomerName;
        receipt.Discount = this.saleDetail.SaleDiscountAmount== 0? this.saleDetail.SaleDiscountAmount.toString() : this.getFormattedAmount(this.saleDetail.SaleDiscountAmount);
        receipt.ReceiptAdjustmentAmount = this.getFormattedAmount(receiptInfo.Adjustment);
        var reciptDate = this._dateTimeService.convertDateObjToString(new Date(receiptInfo.ReceiptDate), this.longDateFormat);
        // receipt.ReceiptDate = this._dateTimeService.convertDateObjToString(new Date(receiptInfo.ReceiptDate), this.receiptDateFormat)
        //     + ' ' + this._dateTimeService.getTimeStringFromDate(new Date(receiptInfo.ReceiptDate), this.timeFormat);
        const receiptTime = receiptInfo.ReceiptDate.split("T")[1].split(":")[0] + ":" + receiptInfo.ReceiptDate.split("T")[1].split(":")[1] + ":" + receiptInfo.ReceiptDate.split("T")[1].split(":")[2];
        receipt.ReceiptTime = this._TimeFormatPipe.transform(receiptTime);
        receipt.ReceiptDate = reciptDate;

        //processed by date and time
        var reciptProcessedByDate = this._dateTimeService.convertDateObjToString(new Date(), this.receiptDateFormat);
        receipt.ReceiptProcessedByDate = reciptProcessedByDate;

        receipt.ReceiptNo = receiptInfo.ReceiptNumber;
        receipt.AppliedTaxNames = receiptInfo.AppliedTaxNames;
        receipt.AmountPaid = this.getFormattedAmount(this.saleDetail.TotalAmountPaid);
        receipt.ServiceCharges = this.saleDetail.ServiceChargesAmount == 0? this.saleDetail.ServiceChargesAmount.toString() : this.getFormattedAmount(this.saleDetail.ServiceChargesAmount);
        receipt.TipAmount = this.saleDetail.TipAmount== 0? this.saleDetail.TipAmount.toString() : this.getFormattedAmount(this.saleDetail.TipAmount);
        receipt.SubTotal = this.getFormattedAmount(this.saleDetail.SubTotalPrice);
        receipt.Tax = this.getFormattedAmount(this.saleDetail.TotalTaxAmount);
        receipt.Total = this.getFormattedAmount(this.saleDetail.TotalDue);
        receipt.BalanceDue = this.getFormattedAmount(receiptInfo.BalanceDue);
        receipt.TotalRefundedTipAmount = this.saleDetail.RefundedTipAmount.toString();
        receipt.IsRefunded = this.saleDetail.IsRefunded;
        receipt.CurrencySymbol = receiptInfo.CurrencySymbol;
        receipt.SaleStatusTypeName = receiptInfo.SaleStatusTypeName;
        receipt.TotalRefundedServiceChargesAmount = this.saleDetail.RefundedServiceChargesAmount.toString();

        receiptInfo.InvoiceReceiptPayments.forEach(paymentModel => {
            this.ReceiptPaymentMethod = new ReceiptPaymentMethod();
            this.ReceiptPaymentMethod.paymentMethod = paymentModel.MethodName;
            this.ReceiptPaymentMethod.MethodName = paymentModel.SaleTypeName;
            this.ReceiptPaymentMethod.LastDigits = paymentModel.LastDigits;
            this.ReceiptPaymentMethod.InvoiceAmount =  paymentModel.InvoiceAmount;
            this.ReceiptPaymentMethod.SaleTypeName = paymentModel.SaleTypeName;
            receipt.paidPaymentMethod.push(this.ReceiptPaymentMethod);
         });


        // Methode Info (updated payment object and pushed to list)
        // this.ReceiptPaymentMethod.paymentMethod = receiptInfo.MethodName;
        // this.ReceiptPaymentMethod.MethodName = receiptInfo.PaymentGatewayName;
        // receipt.SaleStatusTypeName = this.saleDetail.SaleStatusTypeName;
        // receipt.SaleTypeName = receiptInfo.SaleTypeName;
        // this.ReceiptPaymentMethod.LastDigits = receiptInfo.LastDigits;
        // this.ReceiptPaymentMethod.InvoiceAmount = receiptInfo.InvoiceAmount;
        // receipt.paidPaymentMethod.push(this.ReceiptPaymentMethod);
        return receipt;
    }

    setInvocieAmounts(saleDetail: SaleDetail) {
        this.serviceCharges = saleDetail.ServiceChargesAmount;
        this.discountAmount = saleDetail.SaleDiscountAmount;
        this.subTotalAmount = saleDetail.SubTotalPrice;
        this.taxAmount = saleDetail.TotalTaxAmount;
        this.totalBalance = saleDetail.BalanceAmount;
        this.totalAmount = saleDetail.BalanceAmount > 0 ? saleDetail.BalanceAmount : saleDetail.TotalPrice;
        this.tipAmount = saleDetail.TipAmount == null ? 0 : this.saleDetail.TipAmount;
        this.isWalkedIn = saleDetail.IsWalkedIn;
    }

    getFormattedAmount(value: any) {
        return this._currencyFormatter.transform(value, this.currencyFormat);
    }

    showErrorMessage(message: string) {
        this._messageService.showErrorMessage(message);
    }
    roundValue(value: any) {
        return this._taxCalculationService.getRoundValue(value);
    }


    getDiscountPercentage(discount: number, pricePerSession: number): number {
        return (discount / pricePerSession) * 100;
    }

    // #endregion

}



