// #region Imports

/********************** Angular References *********************/
import { Component, OnInit, Output, EventEmitter, Inject, ViewChild } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { FormControl } from "@angular/forms";
import { SubscriptionLike } from "rxjs";
/********************** Angular Material References *********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


/****************** Services & Models *****************/
/* Models */
import { SaleInvoice, POSClient, SavedCard, POSCartItem, SaveQueue, SaleQueueDetail, StripePaymentIntent, POSFormsDetail, SalePaymentMode, SaveSaleCardInvoice, UpdateCardSaleStatus, PayTabPaymentMode, SavePOSForAddMoreItems, SaleQueuePaymentGateway, UnProcessedPayments } from "src/app/point-of-sale/models/point.of.sale.model"
import { ReceiptModel, ReceiptItem, ReceiptPaymentMethod, CustomerRewardPointsDetailForPOS } from "src/app/models/sale.model";
import { ApiResponse } from "src/app/models/common.model";
/* Services */
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { DateTimeService } from "src/app/services/date.time.service";
import { TaxCalculation } from "src/app/services/tax.calculations.service";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { AuthService } from "src/app/helper/app.auth.service";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";
/****************** Components *****************/
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { PrintReceiptComponent } from "src/app/shared/components/print-receipt/print.receipt.component";
/****************** Configurations *****************/
import { CalculatorValue, POSItemType, EnumSaleType, ENU_PaymentGateway, ENU_Package, ENU_ReaderStatus, ENU_DateFormatName, POSProductEnum } from "src/app/helper/config/app.enums";
import { Configurations, SaleArea, DiscountType } from "src/app/helper/config/app.config";
import { Messages } from "src/app/helper/config/app.messages";
import { PointOfSaleApi, SaleApi, DiscountSetupApi, CustomerPaymentGatewayApi, GatewayIntegrationApi, CustomerRewardProgramApi } from "src/app/helper/config/app.webapi";
import { ENU_Permission_Module, ENU_Permission_PointOfSale, ENU_Permission_Individual } from "src/app/helper/config/app.module.page.enums";
import { PartPaymentComponent } from "../part-payment-alert/part.payment.component";
import { DynamicScriptLoaderService } from "src/app/services/dynamic.script.loader.service";
import { StripeService, StripeDataSharingService } from "src/app/services/stripe.service";
import { variables } from "src/app/helper/config/app.variable";
import { StripeReaderPopupComponent } from "src/app/home/stripe.reader.popup/stripe.reader.popup.component";
import { ViewFormComponent } from "../../forms/view/view.form.component";
import { CustomerFormsInfromation, CustomFormView } from "src/app/models/customer.form.model";
import { AuthenticateCard } from "src/app/customer/member/models/member.gateways.model";
import { AddStripeCustomerComponent } from "src/app/gateway/stripe/add.stripe.customer.component";
import { PayTabsCustomerComponent } from "src/app/gateway/pay-tabs/paytabs.customer.component";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { TimeFormatPipe } from "src/app/application-pipes/time-format.pipe";
import { AlertConfirmationComponent } from "src/app/application-dialog-module/confirmation-dialog/alert.confirmation.component";
import { PaymentFailedComponent } from "../payment-failed/payment.failed.component";
import { LoaderService } from "src/app/services/app.loader.service";



// #endregion


@Component({
    selector: 'pos-payment',
    templateUrl: './pos.payment.component.html'
})

export class POSPaymentComponent extends AbstractGenericComponent implements OnInit {
    @ViewChild("stripeRef") stripeRef: AddStripeCustomerComponent;
    @ViewChild(PayTabsCustomerComponent) paytabsRef: PayTabsCustomerComponent;
    @ViewChild('stripeReaderComponentRef') stripeReaderComponentRef: StripeReaderPopupComponent;
    @Output() paymentStatus = new EventEmitter<boolean>();
    @Output() notAvailableServices = new EventEmitter<number[]>();
    @Output() productOutOfStock = new EventEmitter<number[]>();

    @Output() onBack = new EventEmitter<SavePOSForAddMoreItems>();


    // #region Local Members
    processPaymentResponse = {
        paymentIntentID: '',
        isProcessPaymentSucced: true
    }

    discountType = DiscountType;
    receiptDateFormat: string = "EEE, d MMM, yyyy";//Configurations.ReceiptDateFormat;
    saveInProgress: boolean;
    payAndPrint: boolean;
    receiptId: number;
    tipStaffName: string = '';

    serviceCharges: number = 0;
    taxAmount: number = 0;
    discountAmount: number = 0;
    tipAmount: number = 0;
    amountPaid: number = 0;
    splitAmountPaid: number = 0;
    grossAmount: number;
    totalAmount: number = 0;
    bankName: string;
    bankEmail: string;

    isWalkedInCustomer: boolean;
    showTipsCalculator: boolean;
    showCalendar: boolean = false;
    showDiscountCalc: boolean;
    showDiscountPin: boolean;
    isPayTabsIntegrated: boolean;
    isStripeIntegrated: boolean;
    showServiceChargeCalculator: boolean;
    isTipsCalculator: boolean;
    isServiceChargeCalculator: boolean;
    isDiscountCalculator: boolean;
    isPartialPaymentAllow: boolean = false;
    calculatorResult: string = "0";
    discountPinResult: string = "";
    discountPin: string = "";
    hasItemsInCart: boolean = true;
    hasPartialPaymentPermision: boolean = false;
    currencyFormat: string;
    currencySymbol: string;
    isStripeTerminalAllow: boolean = false;
    hasDiscountInPackage: boolean = false;
    hasTipsInPackage: boolean = false;
    hasServiceChargesInPackage: boolean = false;
    formStatus: string = 'normal';
    customerPaymentGatewayId: number;
    branchName: string;
    showStripeCard: boolean = false;
    showPayTabCard: boolean = false;
    isShowCounter: boolean = false;
    dueDate: Date;
    longDateFormat: string;
    minDueDate: Date;
    /* Model References */
    splitamntPaid: FormControl = new FormControl();
    saveQueue: SaveQueue;
    saleInvoice: SaleInvoice;
    personInfo: POSClient;
    walkedInClient: POSClient;
    formsDetail = new POSFormsDetail();
    stripePaymentIntent: StripePaymentIntent;
    authenticateCard: AuthenticateCard = new AuthenticateCard();
    saveSaleCardInvoice: SaveSaleCardInvoice;
    UpdateCardSaleStatus: UpdateCardSaleStatus;
    ReceiptPaymentMethod = new ReceiptPaymentMethod;

    staffForTipList: any[] = [];
    savedCards: SavedCard[] = [];

    unProcessedPayments: UnProcessedPayments[] = [];

    posDataSubscription: SubscriptionLike;
    stripeTerminalSubscription: SubscriptionLike;
    /* Configurations */
    messages = Messages;
    timeFormat = Configurations.TimeFormat;
    dateFormatForSave = Configurations.DateFormatForSave;
    paymentType = EnumSaleType;
    calculatorValue = CalculatorValue;
    paymentTypeId = EnumSaleType.Cash;
    paymentGateway = ENU_PaymentGateway;
    enu_ReaderStatus = ENU_ReaderStatus;
    posItemType = POSItemType;
    saleArea = SaleArea;
    package = ENU_Package;
    public formsList = new CustomerFormsInfromation();
    isOnlyWaitListedItemInCart: boolean = false;

    //for split payments
    isAllowedSplitPayment: boolean = false;
    hasSplitPaymentInPackage: boolean = false;
    isSaveSaleAndGetError: boolean = false;

    // for reward points use
    isAllowedRewardPointsForPayment: boolean = false;
    isAllowedRewardPointsCustomerForPayment: boolean = false;
    isShowRewardPoint: boolean = false;
    customerRewardPointsDetailForPOS = new CustomerRewardPointsDetailForPOS();
    redeemPoints: number = 0;
    rewardPointsUsed: number = 0;
    isRewardProgramInPackage: boolean = false;
    isBranchHaveAnyDefaultRewardProgram: boolean = false;


    //for go back and park sale use
    public saleServiceCharges: number = 0;
    public isServiceChargesInPercentage: boolean = true;
    saleDiscount: number = 0;
    isSaleDiscountInPercentage: boolean = false;
    savePOSForAddMoreItems: SavePOSForAddMoreItems = new SavePOSForAddMoreItems();

      /* Subsctiptions */
    packageIdSubscription: SubscriptionLike;
    // #endregion


    constructor(public _dialogRef: MatDialogRef<POSPaymentComponent>,
        public _FormDialogue: MatDialogService,
        public _httpService: HttpService,
        public _messageService: MessageService,
        public _dialog: MatDialogService,
        public _currencyFormatter: CurrencyPipe,
        public _dateTimeService: DateTimeService,
        public _dataSharingService: DataSharingService,
        private _loaderService: LoaderService,
        public _taxCalculationService: TaxCalculation,
        public _authService: AuthService,
        public _stripeService: StripeService,
        public _dynamicScriptLoader: DynamicScriptLoaderService,
        public _stripeDataSharingService: StripeDataSharingService,
        private _TimeFormatPipe: TimeFormatPipe,
        @Inject(MAT_DIALOG_DATA) public invoice: any) {
        super();
    }

    ngOnInit() {
        this.isOnlyWaitListedItemInCart = this.invoice.cartItems.length == this.invoice.cartItems.filter(ci => ci.IsWaitlistItem == true).length ? true : false;

        this.loadScripts();

        this.grossAmount = this.invoice.grossAmount;
        this.taxAmount = this.getTaxTotal();
        this.saleInvoice = this.invoice.saleInvoice;
        this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.Cash;
        this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.Cash;
        this.personInfo = this.invoice.personInfo;

        //console.log(this.personInfo);

        //this.getCustomerRewardPointsFundamentals();

        //this.getBranchConfiguredGatewaysFundamentals();

        Promise.all([
            this.checkPackagePermissions(),
            this.getBranchConfiguredGatewaysFundamentals(),
            this.getSaleFundamentals(),
        ]).then(
            success => {
                if(this.isRewardProgramInPackage){
                    Promise.all([
                        this.getCustomerRewardPointsFundamentals()
                    ]).then(
                        success => {
                            this.getCurrentBranchDetail();
                            this.getFormsData();
                    });
                    //this.getCustomerRewardPointsFundamentals();
                } else{
                    this.getCurrentBranchDetail();
                    this.getFormsData();
                }
        });

        this.setPermissions();



        this.getTotal();

        if (this.saleInvoice.ApplicationArea !== this.saleArea.Service) {
            this.markOutdatedItems();
        }

        if (this.saleInvoice.ApplicationArea === this.saleArea.POS) {
            this.invoice.cartItems.forEach(element => {
                element.SelectedForPay = true;
            });
        }

        this.isPartPaymentAllowed();

    }




    async isPartPaymentAllowed() {
        this.isPartialPaymentAllow = await super.isPartPaymentAllow(this._dataSharingService);
    }

    ngOnDestroy() {
        if (this.stripeTerminalSubscription) {
            this.stripeTerminalSubscription.unsubscribe();
        }

        this.packageIdSubscription?.unsubscribe();

    }

    //#region Events

    checkPackagePermissions() {
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPackagePermissions(packageId);
            }
        })
      }

    setPackagePermissions(packageId: number) {
        this.isRewardProgramInPackage = false;
        switch (packageId) {

            case this.package.Full:
                this.isRewardProgramInPackage = true;
                break;
        }
    }

    onPaidAmountChange(){
        this.amountPaid = 0;

        this.saleInvoice.PaymentModes.forEach(mode => {
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

    onPaymentTypeChange(paymentTypeId: number) {
        this.splitAmountPaid = 0;
        this.paymentTypeId = paymentTypeId;
        this.isShowRewardPoint = false;
        if (this.paymentTypeId === this.paymentType.Cash) {
            this.showStripeCard = false;
            this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.Cash;
            this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.Cash;
            this.saleInvoice.PaymentMode.IsSaveCard = undefined;
        }
        else if (this.paymentTypeId === this.paymentType.Card) {
            if (this.isStripeIntegrated) {
                this.showStripeCard = true;
                this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.Card;
                this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.Stripe_Card;
                this.saleInvoice.PaymentMode.IsSaveCard = false;

                this.authenticateCard.SaleTypeID = this.paymentType.Card;
                this.authenticateCard.PaymentGatewayID = this.paymentGateway.Stripe_Card;
            }
            else if (this.isPayTabsIntegrated) {
                this.showPayTabCard = true;
                this.showStripeCard = false;
                this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.Card;
                this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.PayTabs;
                this.saleInvoice.PaymentMode.IsSaveCard = false;
            } else {
                this.showPayTabCard = false;
                this.showStripeCard = false;
            }

        }
        else if (this.paymentTypeId === this.paymentType.Other) {
            this.showStripeCard = false;
            this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.Other;
            this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.Other;
            this.saleInvoice.PaymentMode.IsSaveCard = undefined;
        }
        else if (this.paymentTypeId === this.paymentType.StripeTerminal) {
            //   this.getStripeTerminalConfig();
            this.showStripeCard = false;
            this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.Card;
            this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.Stripe_Card;
            this.saleInvoice.PaymentMode.IsSaveCard = undefined;
        }
        else if (this.paymentTypeId === this.paymentType.RewardPoint) {
            this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.RewardPoint;
            this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.RewardPoints;
            this.saleInvoice.PaymentMode.IsSaveCard = undefined;
            this.isShowRewardPoint = true;
            //this.getCustomerRewardPointsFundamentals();
        }

        this.onPaidAmountChange();
        this.splitAmountPaid = this.saleInvoice.PaymentMode.SaleTypeID == this.paymentType.Cash ||  this.saleInvoice.PaymentMode.SaleTypeID == this.paymentType.RewardPoint
                                ? 0 : this.roundValue((this.totalAmount - this.amountPaid));
        //this.amountPaid = this.amountPaid + this.splitAmountPaid;
        //fixed shuja bug
        this.amountPaid = this.splitAmountPaid > 0 ? this.amountPaid + this.splitAmountPaid : this.amountPaid;
        this.splitAmountPaid = this.splitAmountPaid < 0 ? 0 : this.splitAmountPaid;
    }

    onCardTabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
        if (tabChangeEvent.index == 0) {
            this.showStripeCard = true;
            this.showPayTabCard = false;
            this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.Stripe_Card;
            this.saleInvoice.PaymentMode.IsSaveCard = false;
            this.authenticateCard.SaleTypeID = this.paymentType.Card;
            this.authenticateCard.PaymentGatewayID = this.paymentGateway.Stripe_Card;
        }
        else {
            this.showPayTabCard = true;
            this.showStripeCard = false;
            this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.Card;
            this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.PayTabs;
            this.saleInvoice.PaymentMode.IsSaveCard = false;
        }
    }

    onServiceSelectionChange() {
        this.grossAmount = this.calculateGrossAmount();
        this.taxAmount = this.getTaxTotal();
        this.getTotal();
        this.hasItemsInCart = this.invoice.cartItems.filter(c => c.SelectedForPay === true).length > 0 ? true : false;
    }

    onShowTipsCalculator() {
        setTimeout(() => {
            this.calculatorResult = "0";
            this.showTipsCalculator = true;
            this.showServiceChargeCalculator = false;
            this.showDiscountCalc = false;
            this.showDiscountPin = false;
            this.showCalendar = false;

            this.isTipsCalculator = true;
            this.isDiscountCalculator = false;
            this.isServiceChargeCalculator = false;
        });
    }

    onShowDiscountCalculator() {
        setTimeout(() => {
            this.calculatorResult = "0";
            this.showDiscountPin = true;
            this.showDiscountCalc = false;
            this.showServiceChargeCalculator = false;
            this.showTipsCalculator = false;
            this.showCalendar = false;

            this.isTipsCalculator = false;
            this.isDiscountCalculator = false;
            this.isServiceChargeCalculator = false;
        });
    }

    onShowServiceChargeCalculator() {
        setTimeout(() => {
            this.calculatorResult = "0";
            this.showServiceChargeCalculator = true;
            this.showDiscountCalc = false;
            this.showDiscountPin = false;
            this.showTipsCalculator = false;
            this.showCalendar = false;

            this.isTipsCalculator = false;
            this.isDiscountCalculator = false;
            this.isServiceChargeCalculator = true;
        });
    }

    onDeletePaymentMode(paymentMode, arrayIndex){

            if (paymentMode.PaymentTypeID === this.paymentType.Cash || paymentMode.PaymentTypeID === this.paymentType.Other || paymentMode.PaymentTypeID === this.paymentType.RewardPoint){
                this.saleInvoice.PaymentModes.splice(arrayIndex, 1);

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
                            this.saleInvoice.PaymentModes.splice(arrayIndex, 1);
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
        } else if (this.isPartialPaymentAllow && this.personInfo.AllowPartPaymentOnCore) {
            if ((this.paymentTypeId === this.paymentType.Other || this.paymentTypeId === this.paymentType.StripeTerminal || this.paymentTypeId === this.paymentType.Card || this.paymentTypeId === this.paymentType.RewardPoint) && this.amountPaid > this.totalAmount ) {
                this._messageService.showErrorMessage(this.messages.Validation.Equal_Payment_In_Card_Case);
                this.saveInProgress = false;
            } else if(this.checkAnyItemDeleteOnCartAndPaidAmount()){
                this._messageService.showErrorMessage(this.messages.Validation.Equal_Payment_In_Card_Case);
                this.saveInProgress = false;
            }
            else if (this.roundValue(this.amountPaid) < this.totalAmount) {
                //as per discussion with tahir saab commenting tip and service (09/02/2022)
                // if (this.tipAmount > 0 && this.amountPaid < this.tipAmount) {
                //     this.saveInProgress = false;
                //     this._messageService.showErrorMessage(this.messages.Validation.TipAmount_Required.replace("{0}", this.getFormattedAmount(this.tipAmount)));
                // }
                // else {
                    this.hasPartialPaymentPermision = true;
                    this.onOpenPartialPaymentDialoge(isSplitPayment);
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
            } else if(this.checkAnyItemDeleteOnCartAndPaidAmount()){
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
        this.saleInvoice.PaymentModes.forEach(mode => {
            totalPaidamount += Number(mode.Amount);
        });
        return totalPaidamount > this.totalAmount ? true : false;
    }

    onAddSplitPayments(){
        if(this.saleInvoice.PaymentModes == null || this.saleInvoice.PaymentModes.length == 0){
            this.saleInvoice.PaymentModes = new Array<SalePaymentMode>();
        }

        this.saleInvoice.PaymentMode.Amount = this.splitAmountPaid;

        this.saleInvoice.PaymentMode.CustomerID = this.personInfo.CustomerID;

        this.saleInvoice.PaymentMode.IsWalkedIn = this.isWalkedInCustomer;
        this.saleInvoice.PaymentMode.IsNewCard = this.saleInvoice.PaymentMode.GatewayCustomerID ? true : false;

        var authorizePaymentBasedOnPaymentGatewayResult;
        if(this.paymentTypeId != this.paymentType.RewardPoint && this.paymentTypeId != this.paymentType.Cash &&  this.paymentTypeId != this.paymentType.Other){
            this._httpService.save(CustomerPaymentGatewayApi.AuthorizePaymentBasedOnPaymentGateway, this.saleInvoice.PaymentMode)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    authorizePaymentBasedOnPaymentGatewayResult =  response.Result;

                    if(!this.saleInvoice.PaymentMode.IsStripeTerminal && authorizePaymentBasedOnPaymentGatewayResult.PaymentGatewayID == this.paymentGateway.Stripe_Card && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsAuthenticationRequire){

                        this._stripeService.confirmCardPayment(authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.ClientSecret, authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.PaymentMethod).then(response => {
                            if (response) {
                                var saleMode = new SalePaymentMode();
                                saleMode.PaymentGatewayID = this.saleInvoice.PaymentMode.PaymentGatewayID;
                                saleMode.IsStripeTerminal =this.saleInvoice.PaymentMode.IsStripeTerminal;
                                saleMode.SaleTypeID	= this.saleInvoice.PaymentMode.SaleTypeID;
                                saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                                saleMode.Amount = this.saleInvoice.PaymentMode.Amount;
                                saleMode.IsSaveCard = this.saleInvoice.PaymentMode.IsSaveCard;
                                saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                                this.saleInvoice.PaymentModes.push(saleMode);

                                this.splitAmountPaid = 0;
                                this.onPaidAmountChange();
                                this.onPaymentTypeChange(this.paymentType.Cash);
                            } else{
                                return;
                            }
                        },
                            error => {
                                this._messageService.showErrorMessage(this.messages.Error.Payment_Declined);
                                return;
                            });

                        /////////////////////////////
                    } else if(this.saleInvoice.PaymentMode.IsStripeTerminal){
                        // this._stripeService.createPaymentIntent(this.splitAmountPaid, this.personInfo.CustomerID, this.personInfo.Email).then((response: ApiResponse) => {
                        //     this.stripePaymentIntent = response.Result;
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
                                        this._loaderService.hide();
                                        if(this.processPaymentResponse.paymentIntentID == ""){
                                            this.processPaymentResponse.isProcessPaymentSucced = false;
                                            this.saveInProgress = false;
                                        } else{
                                            var saleMode = new SalePaymentMode();
                                            saleMode.PaymentGatewayID = this.saleInvoice.PaymentMode.PaymentGatewayID;
                                            saleMode.IsStripeTerminal =this.saleInvoice.PaymentMode.IsStripeTerminal;
                                            saleMode.SaleTypeID	= this.saleInvoice.PaymentMode.SaleTypeID;
                                            saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                                            saleMode.Amount = this.saleInvoice.PaymentMode.Amount;
                                            saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                                            saleMode.IsSaveInstrument = authorizePaymentBasedOnPaymentGatewayResult &&
                                            authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel
                                            ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveInstrument : false;
                                            saleMode.IsSaveCard = authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveCard :
                                                                    authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel.IsSaveCard : false;
                                            this.saleInvoice.PaymentModes.push(saleMode);

                                            this.splitAmountPaid = 0;
                                            this.onPaidAmountChange();
                                            this.onPaymentTypeChange(this.paymentType.Cash);
                                        }
                                    }).catch(
                                        err => {
                                                this._messageService.showErrorMessage(err)
                                                this._loaderService.hide();
                                                this.saveInProgress = false;
                                            }
                                        );
                                }

                            }).catch(err => {
                                this._messageService.showErrorMessage(err);
                                this._loaderService.hide();
                                this._stripeService.clearReaderDisplay();
                            });

                        // }).catch(err => {
                        //     this._messageService.showErrorMessage(err);
                        //     this._stripeService.clearReaderDisplay();
                        // });
                    } else{
                        var saleMode = new SalePaymentMode();
                        saleMode.PaymentGatewayID = this.saleInvoice.PaymentMode.PaymentGatewayID;
                        saleMode.PaymentTypeID = this.saleInvoice.PaymentMode.PaymentTypeID;
                        saleMode.IsStripeTerminal =this.saleInvoice.PaymentMode.IsStripeTerminal;
                        saleMode.SaleTypeID	= this.saleInvoice.PaymentMode.SaleTypeID;
                        saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                        saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                        saleMode.IsSaveInstrument = authorizePaymentBasedOnPaymentGatewayResult &&
                                 authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel
                                  ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveInstrument : false;
                                saleMode.IsSaveCard = authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveCard :
                                                        authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel.IsSaveCard : false;
                        saleMode.Amount = this.saleInvoice.PaymentMode.Amount;
                        //saleMode.IsSaveCard = this.saleInvoice.PaymentMode.IsSaveCard;
                        this.saleInvoice.PaymentModes.push(saleMode);

                        this.splitAmountPaid = 0;
                        this.onPaidAmountChange();
                        this.onPaymentTypeChange(this.paymentType.Cash);
                    }
                } else{
                    this._messageService.showErrorMessage("Authorize Payment error");
                    this.saveInProgress = false;
                }
            },
            error => {
                this._messageService.showErrorMessage(error?.error?.MessageText);
                this.saveInProgress = false;
            });
        } else{

            var result = this.saleInvoice.PaymentModes.find(i => i.PaymentTypeID == this.paymentTypeId);

            if(result){
                result.Amount = Number(result.Amount) + Number(this.saleInvoice.PaymentMode.Amount);
            } else{
                var saleMode = new SalePaymentMode();
                saleMode.PaymentGatewayID = this.saleInvoice.PaymentMode.PaymentGatewayID;
                saleMode.IsStripeTerminal =this.saleInvoice.PaymentMode.IsStripeTerminal;
                saleMode.SaleTypeID	= this.saleInvoice.PaymentMode.SaleTypeID;
                saleMode.PaymentTypeID = this.saleInvoice.PaymentMode.PaymentTypeID;
                saleMode.PaymentAuthorizationID	= null;
                saleMode.Amount = this.saleInvoice.PaymentMode.Amount;
                this.saleInvoice.PaymentModes.push(saleMode);
            }

            this.splitAmountPaid = 0;
            this.onPaidAmountChange();
        }
    }

    onPrint() {
        this.getReceiptForPrint(this.receiptId, false);
    }

    onCalculatorValueChange(value: any) {
        this.calculatorResult = this.calculatorResult.length >= 13 ? this.calculatorResult : this.calculatorResult + value.toString();
        // this.calculatorResult = this.calculatorResult + value.toString();
        this.calculatorResult = this.removeFirstCharacter(this.calculatorResult, "0");
    }

    onCalulatorValueReset() {
        this.calculatorResult = "0";
    }

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

    onDiscountPinReset() {
        this.resetDiscountPin();
    }

    onDiscountPinCancel() {
        this.resetDiscountPin();
        this.closeDicsountPin();
    }

    onDiscountPinVerify() {
        if (this.discountPin && this.discountPin.length > 3) {
            this.verifyDiscountPassword(parseInt(this.discountPin));
        }
    }

    onQueueInvoice() {
        this.saveQueueInvoice();
    }

    onTipStaffChange() {
        if (this.saleInvoice.TipStaffID == undefined || this.saleInvoice.TipStaffID <= 0) {
            this.saleInvoice.TipStaffID = null;
            this.tipAmount = 0;
            this.saleInvoice.TipAmount = 0;
            this.tipStaffName = '';
            this.getTotal();
        } else{
            this.tipStaffName = this.staffForTipList.find(s => s.StaffID == this.saleInvoice.TipStaffID).StaffFullName;
        }
    }

    onkeyPress(event: any) {
        const pattern = /[0-9]/;
        let inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode != 8 && !pattern.test(inputChar)) {
            event.preventDefault();
        }
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
    closeCalculator() {
        this.showDiscountCalc = false;
        this.showServiceChargeCalculator = false;
        this.showTipsCalculator = false;
    }

    onCloseCalendar() {

        this.showCalendar = false;
    }

    closeDicsountPin() {
        this.showDiscountPin = false;
    }

    onBackToPOS(){

        this.savePOSForAddMoreItems = new SavePOSForAddMoreItems();
        this.savePOSForAddMoreItems.paymentModes = this.saleInvoice.PaymentModes;
        this.savePOSForAddMoreItems.dueDate = this.dueDate;
        this.savePOSForAddMoreItems.saleDiscount = this.saleDiscount;
        this.savePOSForAddMoreItems.isDiscountInPercentage = this.isSaleDiscountInPercentage;
        this.savePOSForAddMoreItems.serviceCharges = this.saleServiceCharges;
        this.savePOSForAddMoreItems.isServiceChargesInPercentage = this.isServiceChargesInPercentage;
        this.savePOSForAddMoreItems.tipAmount = this.tipAmount;
        this.savePOSForAddMoreItems.tipStaffName = this.tipStaffName;
        this.savePOSForAddMoreItems.paymentNote = this.saleInvoice?.Note;
        this.savePOSForAddMoreItems.tipStaffID = this.saleInvoice.TipStaffID;
        this.savePOSForAddMoreItems.rewardPointsUsed = this.customerRewardPointsDetailForPOS.CopyPointsBalance - this.customerRewardPointsDetailForPOS.PointsBalance;

        this.onBack.emit(this.savePOSForAddMoreItems);

        this.closeDialog();
    }

    onClose() {

      if((this.saleInvoice.PaymentModes && this.saleInvoice.PaymentModes.length > 0) || this.tipAmount > 0 || this.discountAmount > 0 || this.serviceCharges > 0){

          const dialog = this._dialog.open(AlertConfirmationComponent);

          dialog.componentInstance.Heading = this.messages.Dialog_Title.Leave_Checkout;
          dialog.componentInstance.Title = "Alert";
          dialog.componentInstance.Message = this.messages.Confirmation.Any_Changes_You_Have_Made_Will_Be_Lost;
          dialog.componentInstance.showConfirmCancelButton = true;
          dialog.componentInstance.isChangeIcon = false;
          dialog.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
              if(isConfirm){
                  this.saleInvoice.PaymentModes.forEach((paymentMode, index) => {
                      this.onDeletePaymentMode(paymentMode, index);
                  });
                  this.onBack.emit(new SavePOSForAddMoreItems());
                  this.paymentStatus.emit(false);
                  this.closeDialog();
              }
          })
      } else{
          this.paymentStatus.emit(false);
          this.closeDialog();
      }

  }
    async getFormsData() {
        if (!this.isWalkedInCustomer) {
            this.formsDetail.CustomerID = this.personInfo.CustomerID;
            this.formsDetail.ItemList = [];
            this.invoice.cartItems.forEach(element => {
                let itemList: any = {};
                //after discussion with ali raza i have change item type id (Ahmed Arshad)
                itemList.ItemTypeID = element.ItemTypeID == POSProductEnum.ProductVariant ? POSProductEnum.Product : element.ItemTypeID;
                itemList.ItemID = element.ItemTypeID == POSProductEnum.ProductVariant ? element.ProductID : element.ItemID;
                this.formsDetail.ItemList.push(itemList);
            });
            let customerBookingIds = [];
            if (this.invoice.saleInvoice && this.invoice.saleInvoice.SaleDetailList) {
                this.invoice.saleInvoice.SaleDetailList.forEach((element: any) => {
                    if (element.CustomerBookingID) {
                        customerBookingIds.push(element.CustomerBookingID);
                    }
                });
                this.formsDetail.CustomerBookingIDs = customerBookingIds.toString();
            }
            return this._httpService.save(PointOfSaleApi.getFormList, this.formsDetail)
                .toPromise()
                .then((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.formsList = new CustomerFormsInfromation();
                        this.formsList.CustomFormView = response.Result;
                        this.formsList.isViewForm = false;
                        if (this.formsList.CustomFormView) {
                            const formStatusColor = this.formsList.CustomFormView.filter(c => c.IsMandatory == true);
                            this.formStatus = formStatusColor.length > 0 ? 'mandatory' : 'non-mandatory';
                        }
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Form")); }
                );
        }
    }
    onViewForm() {
        if (!this.isWalkedInCustomer && this.formsList.CustomFormView && this.formsList.CustomFormView.length > 0) {
            //let formsList = JSON.parse(JSON.stringify(this.formsList));
            const dialogRef = this._dialog.open(ViewFormComponent, {
                disableClose: true,
                data: this.formsList
            });

            dialogRef.componentInstance.onSubmitForms.subscribe((selectedItems: CustomFormView[]) => {
                this.formsList.CustomFormView = selectedItems;
                //this.getSelectedItems(selectedItems, itemTypeID);
            })
        }
    }

    //#endregion

    // #region Local

    async getCurrentBranchDetail() {
        this.receiptDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.ReceiptDateFormat);
        this.longDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.LongDateFormat);

        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.branchName = branch.BranchName;
            this.isStripeTerminalAllow = branch.AllowStripeTerminal;
            this.isStripeTerminalAllow = this._authService.hasPagePermission(ENU_Permission_Module.Individual, ENU_Permission_Individual.AllowStripeTerminal) && this.isStripeTerminalAllow ? true : false;
             this.currencySymbol = branch.CurrencySymbol;
            /*
             by default we pass currency name and angualr pipe get currrency symbol on the behalf of currency ,
              if currency symbol did't exist in angular currency pipe then angular bind currency name,so we need to change currency format to currency symbol
             */
            this.currencyFormat = branch.CurrencySymbol;
        }

        // get due date according branch time zone
        this.dueDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.minDueDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        if(this.saleInvoice.ApplicationArea === this.saleArea.POS){
            if(this.invoice.PaymentData.paymentModes?.length > 0 || this.invoice.PaymentData.dueDate || this.invoice.PaymentData.saleDiscount > 0 || this.invoice.PaymentData.serviceCharges > 0 || this.invoice.PaymentData.tipAmount > 0 || this.invoice.PaymentData.tipStaffName){
                if(this.hasSplitPaymentInPackage && this.isAllowedSplitPayment){
                    if(this.invoice.PaymentData.paymentModes){
                        this.saleInvoice.PaymentModes = this.invoice.PaymentData.paymentModes;

                        //add PaymentTypeID and reward points invoke remove it from list
                        this.saleInvoice.PaymentModes.forEach((paymentMode, index) => {

                            paymentMode.PaymentTypeID = paymentMode.SaleTypeID;

                            // for park sale reterive if reward program not assign remove reward points payment modes
                            if(paymentMode.PaymentTypeID == this.paymentType.RewardPoint && !this.isAllowedRewardPointsForPayment) {
                                this.onDeletePaymentMode(paymentMode, index);
                            } else if(paymentMode.PaymentTypeID == this.paymentType.RewardPoint && this.isRewardProgramInPackage){
                                this.invoice.PaymentData.rewardPointsUsed = this.roundValue(((paymentMode.Amount / this.customerRewardPointsDetailForPOS.RewardProgramRedemptionValue) * this.customerRewardPointsDetailForPOS.RewardProgramRedemptionPoints));
                            }

                        });

                        this.onPaidAmountChange();
                    }
                } else{
                    //this.saleInvoice.PaymentMode =  this.saleInvoice.PaymentModes[0];
                    this.saleInvoice.PaymentModes = new Array<SalePaymentMode>();
                    this.onPaidAmountChange();

                }


                if(this.invoice.PaymentData.dueDate){
                    this.dueDate = this.invoice.PaymentData.dueDate;
                }

                if(this.invoice.PaymentData.paymentNote){
                    this.saleInvoice.Note = this.invoice.PaymentData.paymentNote;
                }

                if(this.invoice.PaymentData.serviceCharges){
                    this.calculatorResult = this.invoice.PaymentData.serviceCharges.toString();
                    this.getServiceCharges(this.invoice.PaymentData.isServiceChargesInPercentage);
                }

                if(this.invoice.PaymentData.saleDiscount){
                    this.calculatorResult = this.invoice.PaymentData.saleDiscount.toString();
                    this.getDiscount(this.invoice.PaymentData.isDiscountInPercentage);
                }

                if(this.invoice.PaymentData.rewardPointsUsed){
                    this.rewardPointsUsed = this.invoice.PaymentData.rewardPointsUsed;
                }

                if(this.invoice.PaymentData.tipAmount){
                    this.tipAmount = this.invoice.PaymentData.tipAmount;
                    //////////////////////////////////////////////////////////////
                    this.saleInvoice.TipAmount = this.invoice.PaymentData.tipAmount;

                    this.saleInvoice.TipStaffID = this.invoice.PaymentData.tipStaffID;
                    this.tipStaffName = this.invoice.PaymentData.tipStaffName ? this.invoice.PaymentData.tipStaffName : this.staffForTipList.find(s => s.StaffID == this.saleInvoice.TipStaffID).StaffFullName;
                    this.getTotal();
                }
            }
        }
    }

    setPermissions() {
        this.hasDiscountInPackage = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Discount);
        this.hasTipsInPackage = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Tips);
        this.hasServiceChargesInPackage = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.ServiceCharges);
        this.hasSplitPaymentInPackage = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.SplitPayment);

    }

    getSaleFundamentals() {
        return this._httpService.get(SaleApi.getSaleFundamentals)
            .toPromise()
            .then(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.walkedInClient = response.Result.WalkedIn;
                        this.staffForTipList = response.Result.StaffList;

                        if (!this.personInfo) {
                            this.personInfo = this.walkedInClient;
                            this.personInfo.FullName = this.walkedInClient.FirstName + ' ' + this.walkedInClient.LastName;
                            this.isWalkedInCustomer = true;
                        }
                        else if (this.personInfo.CustomerID === (this.walkedInClient && this.walkedInClient.CustomerID)) {
                            this.isWalkedInCustomer = true;
                        } else if(this.personInfo){
                            this.personInfo.FullName = this.personInfo.FullName ? this.personInfo.FullName : this.personInfo.FirstName + ' ' + this.personInfo.LastName;
                        }
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

    calculateGrossAmount() {
        let grossAmount = 0;
        let selectedItems = this.invoice.cartItems.filter(i => i.SelectedForPay === true);
        selectedItems.forEach((cartItem: POSCartItem) => {
            grossAmount += cartItem.TotalAmountExcludeTax - (cartItem?.TotalDiscount && cartItem?.TotalDiscount > 0 ? cartItem?.TotalDiscount : 0);
        });

        return grossAmount;
    }

    filterSelectedService() {
        return this.saleInvoice.SaleDetailList.filter(m => this.invoice.cartItems.filter(c => c.SelectedForPay === true).some(c => c.ItemID == m.ItemID && c.ServiceStartTime == m.StartTime));
    }

    // getFreeClassesForMember(memberId: number) {
    //     this._httpService.get(PointOfSaleApi.getFreeClassesForMember + memberId).subscribe(
    //         data => {
    //             if (data && data.Result) {
    //                 let freeClasses = data.Result;
    //                 this.invoice.cartItems.forEach(cartItem => {
    //                     // If Cart Item is Class
    //                     if (cartItem.ItemTypeID === this.posItemType.Class) {
    //                         // Check ItemID from Free Class List
    //                         let freeClass = freeClasses.filter(fc => fc.ClassID === cartItem.ItemID)[0];
    //                         // If found, then mark cartItem as Free
    //                         cartItem.IsFree = freeClass ? true : false;
    //                         cartItem.Price = cartItem.IsFree ? 0 : cartItem.Price;
    //                     }
    //                 });
    //             }
    //         },
    //         error => {
    //             this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Free Classes"))
    //         }
    //     );
    // }

    getTips(isPercentage: boolean) {
        /*
            Tax should be calculated on Gross Amount
        */
        this.calculatorResult = this.removeLastCharacter(this.calculatorResult, ".");
        //this.isDiscountPercent = isPercentage;

        if (isPercentage) {
            this.tipAmount = this.getPercentage(this.grossAmount, parseFloat(this.calculatorResult));
        }
        else {
            this.tipAmount = parseFloat(this.calculatorResult);
        }
        this.tipAmount = isNaN(this.tipAmount) ? 0 : this.tipAmount;
        this.tipAmount = this.roundValue(this.tipAmount);
        this.saleInvoice.TipAmount = this.roundValue(this.tipAmount);
        this.getTotal();
    }

    getServiceCharges(isPercentage: boolean) {
        /*
            Service Charges should be calculated on Gross Amount
        */
        this.calculatorResult = this.removeLastCharacter(this.calculatorResult, ".");

        //for add more items and park sale reterive
        this.isServiceChargesInPercentage = isPercentage;
        this.saleServiceCharges = Number(this.calculatorResult);

        if (isPercentage) {
            this.serviceCharges = this.getPercentage(this.grossAmount, parseFloat(this.calculatorResult));
        }
        else {
            this.serviceCharges = parseFloat(this.calculatorResult);
        }

        this.serviceCharges = isNaN(this.serviceCharges) ? 0 : this.serviceCharges;
        this.serviceCharges = this.roundValue(this.serviceCharges);
        this.saleInvoice.ServiceChargesAmount = this.serviceCharges;
        this.getTotal();
    }

    getDiscount(isPercentage: boolean) {
        /*
            Tax should be calculated on Gross Amount
        */
        this.calculatorResult = this.removeLastCharacter(this.calculatorResult, ".");
        this.calculatorResult = isNaN(parseFloat(this.calculatorResult)) ? "0" : this.calculatorResult;

        //for add more items and park sale reterive
        this.saleDiscount = Number(this.calculatorResult);
        this.isSaleDiscountInPercentage = isPercentage;

        if (isPercentage) {
            if (parseFloat(this.calculatorResult) > 100) {
                // show message that Discount can not be greater than 100%
                this._messageService.showErrorMessage(this.messages.Validation.POS_Discount_Max);
            }
            else {
                this.discountAmount = this.getPercentage(this.grossAmount, parseFloat(this.calculatorResult));
            }
        }
        else {
            if (parseFloat(this.calculatorResult) > this.grossAmount) {
                // show message that discount cannot be greater than gross amount
                this._messageService.showErrorMessage(this.messages.Validation.POS_Discount_Max);
            }
            else {
                this.discountAmount = parseFloat(this.calculatorResult);
            }
        }

        this.discountAmount = this.roundValue(this.discountAmount);
        this.saleInvoice.DiscountAmount = this.discountAmount;
        this.getTaxAfterDiscount((this.discountAmount / this.grossAmount));
    }

    getTaxTotal(): number {
        let taxTotal = 0;
        this.invoice.cartItems.forEach(item => {
            /*
                TotalPrice = Quantity x Price
                TotalPrice x TotalTaxPercentage / 100
            */
            if (this.saleInvoice && this.saleInvoice.ApplicationArea === this.saleArea.Service) {
                if (item.SelectedForPay) {
                    taxTotal += item.TotalTaxPercentage ? this.getTaxAmount(item.TotalTaxPercentage, item.Price) * item.Qty : 0;
                }
            }
            else {
                taxTotal += item.TotalTaxPercentage ? this.getTaxAmount(item.TotalTaxPercentage, item.Price) * item.Qty : 0;
            }
        })

        return taxTotal;
    }

    getTaxAfterDiscount(discountRate: number) {

        // let discount1 =  (((this.discountAmount / this.grossAmount) * 100) / 100) * (item.Qty * item.Price);
        let taxTotal = 0;
        this.invoice.cartItems.forEach(item => {
            /*
                TotalPrice = Quantity * Price
                Discount = TotalPrice * DiscountRate
                Tax = (TotalPrice - Discount) * TotalTaxPercentage / 100
            */
            if (item.hasOwnProperty("SelectedForPay") && item.SelectedForPay) {
                let discount = item.Price * discountRate;
                let priceAfterDiscount = item.Price - discount;
                taxTotal += item.TotalTaxPercentage ? this.getTaxAmount(item.TotalTaxPercentage, item.Qty * priceAfterDiscount) : 0;
            }
            // else {
            //     let discount = item.Price * discountRate;
            //     let priceAfterDiscount = item.Price - discount;
            //     taxTotal += item.TotalTaxPercentage ? this.getTaxAmount(item.TotalTaxPercentage, item.Qty * priceAfterDiscount) : 0;

            // }

        })

        this.taxAmount = taxTotal;
        this.getTotal();
    }

    getTotal() {
        let total = 0;
        /*
            Total Amount = Gross Amount + Service Charges - Discount + Tax Amount
        */
        total = this.grossAmount + this.serviceCharges - this.discountAmount + this.taxAmount + this.tipAmount;

        this.totalAmount = this.roundValue(total);
        // if (this.paymentTypeId !== this.paymentType.Cash) {
        //     //this.amountPaid = this.roundValue(this.totalAmount);
        //     // this.amountPaid = this.isAllowedSplitPayment ? this.roundValue(this.totalAmount) - this.amountPaid : this.roundValue(this.totalAmount);
        //     // this.splitAmountPaid = !this.isAllowedSplitPayment ? this.amountPaid : this.splitAmountPaid;
        // }
    }

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

    /** changed by Ameer hamza */
    Save(isSplitPayment: boolean) {

        this.saleInvoice.PaymentMode.PaymentTypeID = this.paymentTypeId
        this.saleInvoice.PaymentMode.IsStripeTerminal = false;
        if(this.saleInvoice.PaymentModes && this.saleInvoice.PaymentModes.length > 0 && this.splitAmountPaid == 0 && !isSplitPayment){
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
                    this.saleInvoice.PaymentMode.CustomerPaymentGatewayID = response.CustomerPaymentGatewayID;
                    this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.PayTabs;
                    this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.Card;
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
            this.saleInvoice.PaymentMode.IsStripeTerminal = true;

            this.isReaderConnected().then(isConnected => {
                if (isConnected) {

                    if(isSplitPayment){
                        this.onAddSplitPayments();
                    }else{
                        this.parepareDataForSaveInvoice();
                    }

                    // this._stripeService.createPaymentIntent(this.splitAmountPaid, this.personInfo.CustomerID, this.personInfo.Email).then((response: ApiResponse) => {
                    //     this.stripePaymentIntent = response.Result;
                    //     //sdvsdv
                    //     this._stripeService.collectPayment(this.stripePaymentIntent.ClientSecret).then((response: any) => {
                    //         if (response === "canceled") {
                    //             this.saveInProgress = false;
                    //         }
                    //         if (!response) {
                    //             //   this._messageService.showErrorMessage(this.messages.Error.Reader_Not_Connected);
                    //             this.onOpenStripeReaderDialoge();
                    //             this.saveInProgress = false;
                    //         }
                    //         else {
                    //             this._stripeService.processPayment(response).then((processPaymentResponse: any) => {
                    //                 this.processPaymentResponse.paymentIntentID = processPaymentResponse.paymentIntentID;
                    //                 //   console.log("Step 3 => payment intent id = ", paymentIntentID);
                    //                 if(this.processPaymentResponse.paymentIntentID == ""){
                    //                     this.processPaymentResponse.isProcessPaymentSucced = false;
                    //                     this.saveInProgress = false;
                    //                 } else{
                    //                     //this.saleInvoice.PaymentMode.PaymentIntentID = this.processPaymentResponse.paymentIntentID;
                    //                     //this.saleInvoice.PaymentMode.PaymentID = this.processPaymentResponse.paymentIntentID;
                    //                     if(isSplitPayment){
                    //                         this.onAddSplitPayments()
                    //                     }else{
                    //                         this.parepareDataForSaveInvoice();
                    //                     }
                    //                 }
                    //             }).catch(err => this._messageService.showErrorMessage(err));
                    //         }

                    //     }).catch(err => {
                    //         this._messageService.showErrorMessage(err);
                    //         this._stripeService.clearReaderDisplay();
                    //     });

                    // }).catch(err => {
                    //     this._messageService.showErrorMessage(err);
                    //     this._stripeService.clearReaderDisplay();
                    // });
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

            // this.stripeTerminalSubscription = this._stripeDataSharingService.StripeTerminal.subscribe((terminalResponse) => {
            //     let terminal: any;
            //     terminal = terminalResponse;
            //     if (terminal && terminal !== null && terminal !== "undefined" && terminal.connectionStatus == "connected") {
            //         resolve(true);
            //     } else {
            //         resolve(false);
            //     }
            // });
        });
    }
    showDiscountCalculator() {
        setTimeout(() => {
            this.resetDiscountPin();
            this.showDiscountCalc = true;
            this.showDiscountPin = false;
            this.showServiceChargeCalculator = false;
            this.showTipsCalculator = false;
            this.showCalendar = false;

            this.isTipsCalculator = false;
            this.isDiscountCalculator = true;
            this.isServiceChargeCalculator = false;
        });
    }

    resetDiscountPin() {
        this.discountPinResult = "";
        this.discountPin = "";
    }

    parepareDataForSaveInvoice(){
        if (!this.hasOutdatedOrNotAvailableItems()) {

            if (this.hasPartialPaymentPermision || this.roundValue(this.amountPaid) >= this.roundValue(this.totalAmount)) {
                if (this.saleInvoice.ApplicationArea === this.saleArea.Service) {
                    this.saleInvoice.SaleDetailList = this.filterSelectedService();
                }
                if (this.paymentTypeId == this.paymentType.StripeTerminal) {
                    this.saleInvoice.PaymentMode.CustomerPaymentGatewayID = this.stripePaymentIntent.CustomerPaymentGatewayID;
                    this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.Stripe_Card;
                    this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.Card;
                    this.saleInvoice.PaymentMode.StripeTerminalRefenceNo = this.processPaymentResponse.paymentIntentID;
                }

                if (this.saleInvoice.SaleDetailList.length > 0) {
                    this.saleInvoice.TotalAmountPaid = (this.amountPaid >= this.roundValue(this.totalAmount)) ? this.totalAmount : this.amountPaid;
                    //this.saleInvoice.TotalAmountRecieved = this.amountPaid;
                    this.saleInvoice.TotalAmountRecieved = (this.amountPaid >= this.roundValue(this.totalAmount)) ? this.totalAmount : this.amountPaid;
                    this.saleInvoice.CustomerID = this.personInfo.CustomerID;
                    this.saleInvoice.customerFormList = this.formsList.CustomFormView;
                    this.saleInvoice.dueDate = this._dateTimeService.convertDateObjToString(this.dueDate, this.dateFormatForSave);

                    if(this.saleInvoice.PaymentModes == null || this.saleInvoice.PaymentModes.length == 0){
                        this.saleInvoice.PaymentModes = new Array<SalePaymentMode>();
                        this.saleInvoice.PaymentMode.Amount = this.saleInvoice.TotalAmountPaid;
                    } else{
                        this.saleInvoice.PaymentMode.Amount = this.splitAmountPaid;

                    }

                    if(this.saleInvoice.PaymentModes && this.saleInvoice.PaymentModes.length > 0 && this.splitAmountPaid == 0){
                        this.saveInvoice();
                        return;
                    }

                    if(this.isSaveSaleAndGetError){
                        this.saveInvoice();
                        return;
                    }

                    this.saleInvoice.PaymentMode.CustomerID = this.saleInvoice.CustomerID;
                    this.saleInvoice.PaymentMode.IsWalkedIn = this.isWalkedInCustomer;
                    this.saleInvoice.PaymentMode.IsNewCard = this.saleInvoice.PaymentMode.GatewayCustomerID ? true : false;




                    var authorizePaymentBasedOnPaymentGatewayResult;
                    if(this.paymentTypeId != this.paymentType.RewardPoint && this.paymentTypeId != this.paymentType.Cash &&  this.paymentTypeId != this.paymentType.Other){
                        if(this.splitAmountPaid > 0){
                            this._httpService.save(CustomerPaymentGatewayApi.AuthorizePaymentBasedOnPaymentGateway, this.saleInvoice.PaymentMode)
                            .subscribe((response: ApiResponse) => {
                                if (response && response.MessageCode > 0) {
                                    authorizePaymentBasedOnPaymentGatewayResult =  response.Result;

                                    if(!this.saleInvoice.PaymentMode.IsStripeTerminal&& authorizePaymentBasedOnPaymentGatewayResult.PaymentGatewayID == this.paymentGateway.Stripe_Card && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsAuthenticationRequire){

                                        this._stripeService.confirmCardPayment(authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.ClientSecret, authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.PaymentMethod).then(response => {
                                            if (response) {
                                                var saleMode = new SalePaymentMode();
                                                saleMode.PaymentGatewayID = this.saleInvoice.PaymentMode.PaymentGatewayID;
                                                saleMode.IsStripeTerminal =this.saleInvoice.PaymentMode.IsStripeTerminal;
                                                saleMode.SaleTypeID	= this.saleInvoice.PaymentMode.SaleTypeID;
                                                saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                                                saleMode.Amount = this.saleInvoice.PaymentMode.Amount;
                                                saleMode.IsSaveCard = this.saleInvoice.PaymentMode.IsSaveCard;
                                                saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                                                this.saleInvoice.PaymentModes.push(saleMode);

                                                this.saveInvoice();
                                                return;
                                            } else{
                                                return;
                                            }
                                        },
                                            error => {
                                                this._messageService.showErrorMessage(this.messages.Error.Payment_Declined);
                                                this.saveInProgress = false;
                                                return;
                                            });

                                        /////////////////////////////
                                    } else if(this.saleInvoice.PaymentMode.IsStripeTerminal){
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
                                                            saleMode.PaymentGatewayID = this.saleInvoice.PaymentMode.PaymentGatewayID;
                                                            saleMode.IsStripeTerminal =this.saleInvoice.PaymentMode.IsStripeTerminal;
                                                            saleMode.SaleTypeID	= this.saleInvoice.PaymentMode.SaleTypeID;
                                                            saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                                                            saleMode.Amount = this.saleInvoice.PaymentMode.Amount;
                                                            saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                                                            saleMode.IsSaveInstrument = authorizePaymentBasedOnPaymentGatewayResult &&
                                                            authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel
                                                            ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveInstrument : false;
                                                            saleMode.IsSaveCard = authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveCard :
                                                                                    authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel.IsSaveCard : false;
                                                            this.saleInvoice.PaymentModes.push(saleMode);

                                                            this.saveInvoice();
                                                            return;
                                                        }
                                                    }).catch(
                                                        err => {
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
                                        saleMode.PaymentGatewayID = this.saleInvoice.PaymentMode.PaymentGatewayID;
                                        saleMode.IsStripeTerminal =this.saleInvoice.PaymentMode.IsStripeTerminal;
                                        saleMode.SaleTypeID	= this.saleInvoice.PaymentMode.SaleTypeID;
                                        saleMode.PaymentAuthorizationID	= authorizePaymentBasedOnPaymentGatewayResult ? authorizePaymentBasedOnPaymentGatewayResult.PaymentAuthorizationID : null;
                                        saleMode.Amount = this.saleInvoice.PaymentMode.Amount;
                                        //saleMode.IsSaveCard = this.saleInvoice.PaymentMode.IsSaveCard;
                                        saleMode.PaymentTypeID = this.saleInvoice.PaymentMode.PaymentTypeID;
                                        saleMode.LastDigit = authorizePaymentBasedOnPaymentGatewayResult.CardLast4Digit;
                                        saleMode.IsSaveInstrument = authorizePaymentBasedOnPaymentGatewayResult &&
                                        authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel
                                        ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveInstrument : false;
                                        saleMode.IsSaveCard = authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.StripeAuthPaymentResponseModel.IsSaveCard :
                                                                authorizePaymentBasedOnPaymentGatewayResult && authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel ? authorizePaymentBasedOnPaymentGatewayResult.PayTabsAuthPaymentResponseModel.IsSaveCard : false;
                                        this.saleInvoice.PaymentModes.push(saleMode);

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
                        // var saleMode = new SalePaymentMode();
                        // saleMode.PaymentGatewayID = this.saleInvoice.PaymentMode.PaymentGatewayID;
                        // saleMode.IsStripeTerminal =this.saleInvoice.PaymentMode.IsStripeTerminal;
                        // saleMode.SaleTypeID	= this.saleInvoice.PaymentMode.SaleTypeID;
                        // saleMode.PaymentAuthorizationID	= null;
                        // saleMode.Amount = saleMode.PaymentGatewayID == this.paymentGateway.Cash && (this.amountPaid - this.totalAmount) > 0 ? this.saleInvoice.PaymentMode.Amount - (this.amountPaid - this.totalAmount) : this.saleInvoice.PaymentMode.Amount;
                        // this.saleInvoice.PaymentModes.push(saleMode);

                        var result = this.saleInvoice.PaymentModes.find(i => i.PaymentTypeID == this.paymentTypeId);

                        if(this.saleInvoice.PaymentMode.SaleTypeID == this.paymentType.Cash && this.saleInvoice.PaymentModes && this.saleInvoice.PaymentModes.length > 0){
                            var totalSplitAmount = 0
                            this.saleInvoice.PaymentModes.forEach(mode => {
                                totalSplitAmount += Number(mode.Amount);
                            });

                            this.saleInvoice.PaymentMode.Amount = (totalSplitAmount + Number(this.splitAmountPaid)) > this.totalAmount ? this.totalAmount - totalSplitAmount : this.splitAmountPaid;
                        }

                        if(result){
                            if(result.SaleTypeID != this.paymentType.Cash){
                                result.Amount = Number(result.Amount) + Number(this.saleInvoice.PaymentMode.Amount);
                            } else{
                                var paidAmountWithoutCash = 0;
                                this.saleInvoice.PaymentModes.forEach(mode => {
                                    if(mode.SaleTypeID != this.paymentType.Cash)
                                        paidAmountWithoutCash += Number(mode.Amount);
                                });

                                var paidAmountWithCash = Number(result.Amount) + Number(this.saleInvoice.PaymentMode.Amount);

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
                            saleMode.PaymentGatewayID = this.saleInvoice.PaymentMode.PaymentGatewayID;
                            saleMode.IsStripeTerminal =this.saleInvoice.PaymentMode.IsStripeTerminal;
                            saleMode.SaleTypeID	= this.saleInvoice.PaymentMode.SaleTypeID;
                            saleMode.PaymentTypeID = this.saleInvoice.PaymentMode.PaymentTypeID;
                            saleMode.PaymentAuthorizationID	= null;
                            saleMode.Amount = this.saleInvoice.PaymentMode.Amount;
                            // saleMode.Amount = saleMode.PaymentGatewayID == this.paymentGateway.Cash && (this.amountPaid - this.totalAmount) > 0 ? this.saleInvoice.PaymentMode.Amount - (this.amountPaid - this.totalAmount) : this.saleInvoice.PaymentMode.Amount;
                            this.saleInvoice.PaymentModes.push(saleMode);
                        }

                        this.saveInvoice();
                        return;
                    }

                }
                else {

                }
            }
            else {
                this._messageService.showErrorMessage(this.messages.Validation.Pay_Full_Amount);
                this.saveInProgress = false;
            }
        }
        else {
            this._messageService.showErrorMessage(this.messages.Validation.Outdated_Items);
            this.saveInProgress = false;
        }
    }

    saveInvoice() {

        this._httpService.save(PointOfSaleApi.saveInvoice, this.saleInvoice)
            .subscribe((res: ApiResponse) => {
                this.saveInProgress = false;
                if(res.MessageCode < 0 || res?.Result?.WaitListStatusCode < 0){
                    this.isSaveSaleAndGetError = true;
                    this.splitAmountPaid = 0;
                    if(!this.hasSplitPaymentInPackage || !this.isAllowedSplitPayment){
                        this.saleInvoice.PaymentMode =  this.saleInvoice.PaymentModes[0];

                        this.saleInvoice.PaymentModes.forEach((paymentMode, index) => {
                            this.onDeletePaymentMode(paymentMode, index);
                        });

                        this.onPaymentTypeChange(this.paymentType.Cash);
                        this.amountPaid = 0;
                        // this.saleInvoice.PaymentMode =  new SalePaymentMode();
                        // this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.Cash;
                        // this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.Cash;
                        // this.saleInvoice.PaymentMode.Amount = 0;
                        this.saleInvoice.PaymentModes = new Array<SalePaymentMode>();
                    }
                }

                if (res?.Result?.WaitListStatusCode === -1251 && this.saleInvoice.SaleDetailList.filter(sd => sd.IsWaitlistItem).length == this.saleInvoice.SaleDetailList.length) {
                    this._messageService.showErrorMessage(this.messages.Error.WaitlistMustBeAssociatedWithACustomer);
                    this.saveInProgress = false;
                    return;
                }
                else if (res?.Result?.WaitListStatusCode === -1252 && this.saleInvoice.SaleDetailList.filter(sd => sd.IsWaitlistItem).length == this.saleInvoice.SaleDetailList.length) {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Waitlist"));
                    this.saveInProgress = false;
                    return;
                }
                else if (res?.Result?.WaitListStatusCode === -1253 && this.saleInvoice.SaleDetailList.filter(sd => sd.IsWaitlistItem).length == this.saleInvoice.SaleDetailList.length) {
                    this._messageService.showErrorMessage(this.messages.Error.WaitlistWithSameDetailsAlreadyExists);
                    this.saveInProgress = false;
                    return;
                }

                // Payment Failed check
                if (res && res.Result?.unProcessedPayments?.length > 0) {
                    this.unProcessedPayments = res.Result.unProcessedPayments;
                    this.saleInvoice = res.Result;
                    this._dialog.open(PaymentFailedComponent, {
                        disableClose: true,
                        data: {
                            unProcessedPaymentsList: this.unProcessedPayments,
                            saleInvoiceNumber: this.saleInvoice?.SaleInvoiceNumber,
                            totalAmountPaid: this.saleInvoice?.TotalAmountPaid,
                            totalDue: this.saleInvoice?.TotalDue,
                            totalFailedAmountToBePaid: this.saleInvoice?.TotalFailedAmountToBePaid,
                            customerID: this.personInfo.CustomerID,
                        }
                    })
                }

                if (res && res.MessageCode > 0) {
                    this.showMessageAfterPaymentCapturedSuccessfully(res);
                }
                else if (res.MessageCode === -166) {
                    this.showUnavailableServices(res.MessageData);
                } else if(res.MessageCode === -791){
                    this.showUnavailableFamilyAndFamilyBooking(res.MessageData);
                }
                else if(res.MessageCode === -793){
                  this.showOutOfStockProductAfterSave(res.MessageData);
                  //this.showOutOfStockProduct(res.MessageData);
                }
                else if (res.MessageCode === -103) {
                    this._messageService.showErrorMessage(res.MessageText);
                    this.saveInProgress = false;
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                    this.saveInProgress = false;
                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Invoice"));
                    this.saveInProgress = false;

                    this.isSaveSaleAndGetError = true;
                    this.splitAmountPaid = 0;
                    if(!this.hasSplitPaymentInPackage || !this.isAllowedSplitPayment){
                        this.saleInvoice.PaymentMode =  this.saleInvoice.PaymentModes[0];

                        this.saleInvoice.PaymentModes.forEach((paymentMode, index) => {
                            this.onDeletePaymentMode(paymentMode, index);
                        });

                        this.amountPaid = 0;
                        this.onPaymentTypeChange(this.paymentType.Cash);
                        // this.saleInvoice.PaymentMode =  new SalePaymentMode();
                        // this.saleInvoice.PaymentMode.SaleTypeID = this.paymentType.Cash;
                        // this.saleInvoice.PaymentMode.PaymentGatewayID = this.paymentGateway.Cash;
                        // this.saleInvoice.PaymentMode.Amount = 0;
                        this.saleInvoice.PaymentModes = new Array<SalePaymentMode>();
                    }
                }
            );



    }

    saveQueueInvoice() {
        this.saveQueue = new SaveQueue();
        this.saveQueue.CustomerID = this.personInfo.CustomerID;
        this.saveQueue.DiscountAmount = this.saleDiscount;
        //this.saveQueue.Note = this.saleInvoice.Note;
        this.saveQueue.ServiceChargesAmount = this.saleServiceCharges;
        this.saveQueue.TipAmount = this.tipAmount;
        this.saveQueue.TipStaffID = this.saleInvoice.TipStaffID > 0 ? this.saleInvoice.TipStaffID : null;
        this.saveQueue.PaymentNote = this.saleInvoice.Note;
        this.saveQueue.IsDiscountInPercentage = this.isSaleDiscountInPercentage;
        this.saveQueue.IsServiceChargesInPercentage = this.isServiceChargesInPercentage;
        this.saveQueue.DueDate = this._dateTimeService.convertDateObjToString(this.dueDate, this.dateFormatForSave);

        this.saveQueue.QueueSaleDetailList = [];
        this.saveQueue.QueueSalePaymentGatewayList = [];

        this.invoice.cartItems.forEach((item) => {
            let saleQueueDetail = new SaleQueueDetail();

            saleQueueDetail.ItemTypeID = item.ItemTypeID;
            saleQueueDetail.ItemID = item.ItemID;
            saleQueueDetail.Qty = item.Qty;
            saleQueueDetail.Price = item.PricePerSession;
            saleQueueDetail.TotalTaxPercentage = item.TotalTaxPercentage;
            saleQueueDetail.CustomerMembershipID = item.CustomerMembershipID ? item.CustomerMembershipID : null;
            //saleQueueDetail.ItemDiscountAmount = item.PerLineItemDiscount;
            saleQueueDetail.IsFree = item.IsFree;

            saleQueueDetail.IsWaitlistItem = item.IsWaitlistItem;

            saleQueueDetail.IsFamilyAndFriendItem = item.IsFamilyAndFriendItem;
            saleQueueDetail.IsCartItemUseBenefit = item.IsCartItemUseBenefit;

            if (item.ItemTypeID === this.posItemType.Class) {
                //saleQueueDetail.AssignedToStaffID = item.StaffID;
                saleQueueDetail.StartDate = this._dateTimeService.convertDateObjToString(item.ClassStartDate, this.dateFormatForSave);
                saleQueueDetail.StartTime = item.ClassStartTime;
                saleQueueDetail.EndTime = item.ClassEndTime;
                saleQueueDetail.ItemDiscountAmount = item.ItemDiscountAmount ? item.ItemDiscountAmount : item.PerLineItemDiscount;
            }

            if (item.ItemTypeID === this.posItemType.Service) {
                saleQueueDetail.AssignedToStaffID = item.StaffID;
                saleQueueDetail.StartDate = this._dateTimeService.convertDateObjToString(item.ServiceDate, this.dateFormatForSave);
                saleQueueDetail.StartTime = item.ServiceStartTime;
                saleQueueDetail.EndTime = item.ServiceEndTime;
                saleQueueDetail.ItemDiscountAmount =  item.ItemDiscountAmount ? item.ItemDiscountAmount : item.PerLineItemDiscount;
                saleQueueDetail.Note = item.Note;
            }

            if(item.ItemTypeID === this.posItemType.Product){
              saleQueueDetail.ItemDiscountAmount =  item.ItemDiscountAmount ? item.ItemDiscountAmount : item.PerLineItemDiscount ? item.PerLineItemDiscount : 0;
          }

            this.saveQueue.QueueSaleDetailList.push(saleQueueDetail);
        });

        this.saleInvoice.PaymentModes.forEach((payment) => {
          let queueSalePaymentGateway = new SaleQueuePaymentGateway();

          queueSalePaymentGateway.PaymentGatewayID = payment.PaymentGatewayID;
          queueSalePaymentGateway.CustomerPaymentGatewayID = payment.CustomerPaymentGatewayID;
          queueSalePaymentGateway.Amount = payment.Amount;
          queueSalePaymentGateway.PaymentAuthorizationID = payment.PaymentAuthorizationID;
          queueSalePaymentGateway.IsStripeTerminal = payment.IsStripeTerminal;
          queueSalePaymentGateway.SaleTypeID = payment.SaleTypeID;
          queueSalePaymentGateway.LastDigit = payment.LastDigit;
          queueSalePaymentGateway.IsSaveInstrument = payment.IsSaveInstrument;
          queueSalePaymentGateway.IsSaveCard = payment.IsSaveCard;

          this.saveQueue.QueueSalePaymentGatewayList.push(queueSalePaymentGateway);
      });

      this._httpService.save(PointOfSaleApi.saveSaleQueue, this.saveQueue).subscribe(
        (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
                this.paymentStatus.emit(true);
                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Park Sale"));
                this.closeDialog();
            }
            else {
                this._messageService.showErrorMessage(response.MessageText);
            }
        },  error => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Park Sale")) }
    )
    }

    showUnavailableServices(serviceList: any[]) {
        this.notAvailableServices.emit(serviceList);

        serviceList.forEach(response => {
           var _cartItems = this.invoice.cartItems.filter(c => c.ItemTypeID === response.ItemTypeID && c.ItemID === response.ItemID);

           _cartItems.forEach(response => {
                this.invoice.cartItems.find(c => c.ItemTypeID === response.ItemTypeID && c.ItemID === response.ItemID).IsNotAvailable = true;
            });
        });

        this._messageService.showErrorMessage(this.messages.Validation.Items_Not_Available);
    }

    showOutOfStockProductAfterSave(productList: any[]) {
      this.productOutOfStock.emit(productList);

      productList.forEach(response => {
         var _cartItems = this.invoice.cartItems.filter(c => c.ItemTypeID === response.ItemTypeID && c.ItemID === response.ItemID);

         _cartItems.forEach(response => {
              this.invoice.cartItems.find(c => c.ItemTypeID === response.ItemTypeID && c.ItemID === response.ItemID).IsItemOutOfStock = true;
          });
      });

      this._messageService.showErrorMessage(this.messages.Validation.Product_Is_Out_Of_stock);
  }
    showUnavailableFamilyAndFamilyBooking(itemList: any[]){
        itemList.forEach(response => {
            this.invoice.cartItems.find(c => c.ItemTypeID === response.ItemTypeID && c.ItemID === response.ItemID && c.IsFamilyAndFriendItem == true && !c.FamilyAndFriendIsNotAvailable).FamilyAndFriendIsNotAvailable = true;
        });

        this._messageService.showErrorMessage(this.messages.Validation.Family_And_Friend_Booking_Disabled);
    }

    showOutOfStockProduct(itemList: any[]){
      itemList.forEach(response => {
          this.invoice.cartItems.find(c => c.ItemTypeID === response.ItemTypeID && c.ItemID === response.ItemID ).IsItemOutOfStock = true;
      });
     }

    hasOutdatedOrNotAvailableItems() {
        let hasOutdatedItems = false;
        if (this.saleInvoice.ApplicationArea !== this.saleArea.Service) {
            hasOutdatedItems = this.invoice.cartItems.find(item => item.IsOutdated || item.IsNotAvailable) != undefined ? true : false;
        }
        return hasOutdatedItems;
    }

    markOutdatedItems() {
        let today = this._dateTimeService.getDateTimeWithoutZone(this._dateTimeService.getCurrentDate());
        this.invoice.cartItems.forEach(item => {
            if (item.ItemTypeID === POSItemType.Service && !item.IsWaitlistItem) {
                let serviceDate = new Date(item.ServiceDate);
                serviceDate.setHours(parseInt(item.ServiceStartTime.split(":")[0]));
                serviceDate.setMinutes(parseInt(item.ServiceStartTime.split(":")[1]));
                let _serviceDate = this._dateTimeService.getDateTimeWithoutZone(serviceDate);
                item.IsOutdated = (_serviceDate < today);
            }
            else if (item.ItemTypeID === POSItemType.Class && !item.IsWaitlistItem) {
                let classDate = new Date(item.ClassStartDate + ' ' + item.ClassStartTime.split(' ')[1]);
                let _classDate = this._dateTimeService.getDateTimeWithoutZone(classDate);
                item.IsOutdated = (_classDate < today);
            }
        });
    }

    getReceiptForPrint(saleId: number, openDrawer: boolean) {
        if (saleId && saleId > 0) {
            this._httpService.get(PointOfSaleApi.getInvoiceForPrint + saleId).subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (response.Result) {
                            this.printReceipt(response.Result, openDrawer);
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText)
                    }
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Receipt for print")) }
            )
        }
    }

    printReceipt(receiptInfo: any, openDrawer: boolean) {
        this._dialog.open(PrintReceiptComponent, {
            data: {
                receipt: this.setReceiptPrintModel(receiptInfo),
                openDrawer: openDrawer
            }
        });
    }

    setReceiptPrintModel(receiptInfo: any) {
        let receipt = new ReceiptModel();
        this.invoice.cartItems.forEach(item => {
            console.log(item);

            let receiptItem = new ReceiptItem();
            receiptItem.Name = item.Name;
            receiptItem.VariantName = item.ItemVariantName;
            receiptItem.Price = this.getFormattedAmount(item.PricePerSession);
            receiptItem.Qty = item.Qty;
            receiptItem.Amount = this.getFormattedAmount(item.TotalAmountIncludeTax);//this.getFormattedAmount((item.PricePerSession * item.Qty) - item.TotalDiscount);
            // receiptItem.DiscountType = item.DiscountType ? item.DiscountType : null;
            receiptItem.DiscountType = item.IsMembershipBenefit ? item.DiscountType : item.IsPOSLineItemDiscount ? this.discountType.POSDiscount : '';
            receiptItem.TotalDiscount = item.ItemDiscountAmount > 0 ? item.ItemDiscountAmount : null;//item.TotalDiscount > 0 ? this.getDiscountPercentage(item.ItemDiscountAmount, item.PricePerSession) : null;
            receiptItem.ItemTaxAmount = item.ItemTotalTaxAmount > 0 ? receiptInfo.CurrencySymbol + item.ItemTotalTaxAmount.toString() : receiptInfo.CurrencySymbol + "0.00";
            switch (item.ItemTypeID) {
                case this.posItemType.Product:
                    receiptItem.Description = '';
                    break;
                case this.posItemType.Service:
                    receiptItem.Description = this._dateTimeService.convertDateObjToString(new Date(item.ServiceDate), this.longDateFormat)
                        + ' | ' + this._TimeFormatPipe.transform(item.ServiceStartTime) + ' - ' + this._TimeFormatPipe.transform(item.ServiceEndTime);
                    break;
                case this.posItemType.Class:
                    receiptItem.Description = this._dateTimeService.convertDateObjToString(new Date(item.ClassStartDate), this.longDateFormat)
                        + ' | ' +  this._TimeFormatPipe.transform(item.ClassStartTime)
                        + ' - ' + this._TimeFormatPipe.transform(item.ClassEndTime);
                    break;
            }

            receipt.Items.push(receiptItem);
        });

        receipt.Balance = this.getFormattedAmount((this.amountPaid - this.totalAmount));
        //receipt.BranchInfo = receiptBranch;
        receipt.branchName = this.branchName;
        receipt.CashierID = receiptInfo.CashierName;
        receipt.ReceiptAdjustmentAmount = this.getFormattedAmount(receiptInfo.Adjustment);
        receipt.CustomerName = receiptInfo.CustomerName;
        receipt.Discount = this.discountAmount == 0 ? this.discountAmount.toString() : this.getFormattedAmount(this.discountAmount);
        var reciptDate = this._dateTimeService.convertDateObjToString(new Date(receiptInfo.ReceiptDate), this.longDateFormat);
        const receiptTime = receiptInfo.ReceiptDate.split("T")[1].split(":")[0] + ":" + receiptInfo.ReceiptDate.split("T")[1].split(":")[1] + ":" + receiptInfo.ReceiptDate.split("T")[1].split(":")[2];
        receipt.ReceiptTime = this._TimeFormatPipe.transform(receiptTime);
        receipt.ReceiptDate = reciptDate;
        //processed by date and time

        var reciptProcessedByDate = this._dateTimeService.convertDateObjToString(new Date(), this.receiptDateFormat);
        receipt.ReceiptProcessedByDate = reciptProcessedByDate;
        receipt.ReceiptNo = receiptInfo.ReceiptNumber;
        receipt.AppliedTaxNames = receiptInfo.AppliedTaxNames;
        receipt.ServiceCharges = this.serviceCharges == 0 ? this.serviceCharges.toString() : this.getFormattedAmount(this.serviceCharges);
        receipt.TipAmount = this.tipAmount == 0 ? this.tipAmount.toString() : this.getFormattedAmount(this.tipAmount);
        receipt.SubTotal = this.getFormattedAmount(this.grossAmount);
        receipt.Tax = this.getFormattedAmount(this.taxAmount);
        receipt.Total = this.getFormattedAmount(this.totalAmount - this.tipAmount);
        receipt.CurrencySymbol = receiptInfo.CurrencySymbol;
        receipt.SaleStatusTypeName = receiptInfo.SaleStatusTypeName;

        receiptInfo.InvoiceReceiptPayments.forEach(paymentModel => {
            this.ReceiptPaymentMethod = new ReceiptPaymentMethod();
            this.ReceiptPaymentMethod.paymentMethod = paymentModel.MethodName;
            this.ReceiptPaymentMethod.MethodName = paymentModel.SaleTypeName;
            receipt.SaleTypeName = paymentModel.SaleTypeName;
            this.ReceiptPaymentMethod.LastDigits = paymentModel.LastDigits;
            this.ReceiptPaymentMethod.InvoiceAmount =  paymentModel.InvoiceAmount;
            receipt.paidPaymentMethod.push(this.ReceiptPaymentMethod);
         });

        receipt.EarnedRewardPointsIsToBeCalculated = this.isAllowedRewardPointsForPayment && !this.isWalkedInCustomer && this.isAllowedRewardPointsCustomerForPayment ? true : null;
        receipt.BalanceDue = this.getFormattedAmount(receiptInfo.BalanceDue);

        /*in case of partial payment*/
        receipt.AmountPaid = this.getFormattedAmount(this.amountPaid);
        // receipt.IsPartialReceipt = (this.amountPaid - this.totalAmount) > 0 ? false : true;
        receipt.HasRemainingAmount = (this.amountPaid - this.totalAmount) > 0 ? false : true;;
        receipt.BalanceAmount = this.getFormattedAmount((this.amountPaid - this.totalAmount) > 0 ? (this.amountPaid - this.totalAmount) : (this.totalAmount - this.amountPaid));

        return receipt;
    }

    getFormattedAmount(value: any) {
        return this._currencyFormatter.transform(value, this.currencyFormat);
    }

    getDiscountPercentage(discount: number, pricePerSession: number): number {
        return (discount / pricePerSession) * 100;
    }

    removeFirstCharacter(value, character) {
        return value.indexOf(character) === 0 ? value.substring(1) : value;
    }

    removeLastCharacter(value, character) {
        return value.indexOf(character) === value.length ? value.substring(0, value - 1) : value;
    }

    payByCard(isSplitPayment: boolean) {
        this.authenticateCard.CustomerID = this.personInfo.CustomerID;
        if (this.stripeRef.cardId === 0) {
            this.stripeRef.getStripeToken().then(
                token => {
                    this.saleInvoice.PaymentMode.IsSaveCard = this.stripeRef.isSaveCard;
                    this.authenticateCard.CardToken = token.id;

                    this._stripeService.stripeCardAuthentication(this.authenticateCard).then(isResolved => {
                        if (isResolved && isResolved.Resolve) {
                            this.saleInvoice.PaymentMode.CardToken = null;
                            // this.saleInvoice.PaymentMode.IsSaveCard = undefined;
                            this.saleInvoice.PaymentMode.CustomerPaymentGatewayID = isResolved.CustomerPaymentGatewayId;
                            this.saleInvoice.PaymentMode.GatewayCustomerID = isResolved.GatewayCustomerID;
                            this.saleInvoice.PaymentMode.InstrumentID = isResolved.PaymentMethod;
                            this.saleInvoice.PaymentMode.LastDigit = isResolved.LastDigit;
                            this.saleInvoice.PaymentMode.Brand = isResolved.Brand;
                            this.saleInvoice.PaymentMode.IsSaveInstrument = isResolved.IsSaveInstrument;
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

                        else if (!this.saleInvoice.PaymentMode.IsSaveCard) {
                            this.saveInProgress = false;
                            this._stripeService.deleteGateway(this.authenticateCard);
                        }
                        else {
                            this.saveInProgress = false;
                            this.stripeRef.getSavedCards();
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
            this.saleInvoice.PaymentMode.CardToken = null;
            this.authenticateCard.CardToken = null;
            this.saleInvoice.PaymentMode.IsSaveCard = undefined;
            this.saleInvoice.PaymentMode.CustomerPaymentGatewayID = this.stripeRef.cardId;

            this.authenticateCard.CustomerPaymentGatewayID = this.stripeRef.cardId;
            // this._stripeService.stripeCardAuthentication(this.authenticateCard).then(isResolved => {
            //     if (isResolved && isResolved.Resolve) {
                    this.saleInvoice.PaymentMode.IsSaveInstrument = this.stripeRef.isSaveInstrument;
                    if(isSplitPayment){
                        this.onAddSplitPayments()
                    }else{
                        this.parepareDataForSaveInvoice();
                    }
            //     }
            //     else {
            //         this.saveInProgress = false;
            //     }
            // },
            //     error => {
            //         this._messageService.showErrorMessage(error);
            //         this.saveInProgress = false;
            //     });
        }
    }

    // stripeCardAuthentication() {
    //     return new Promise<boolean>((resolve, reject) => {
    //         this._httpService.save(PointOfSaleApi.getStripeCardAuthentication, this.authenticateCard)
    //             .subscribe((response: ApiResponse) => {
    //                 if (response && response.MessageCode > 0) {
    //                     this.customerPaymentGatewayId = response.Result.CustomerPaymentGatewayID;
    //                     if (response.Result.IsAuthenticationRequire) {
    //                         this.stripeRef.confirCardSetup(response.Result.ClientSecret, response.Result.PaymentMethod).then(res => {
    //                             if (res) {
    //                                 resolve(true);
    //                                 return;
    //                             }
    //                         },
    //                             error => {
    //                                 if (!this.saleInvoice.PaymentMode.IsSaveCard) {
    //                                     this.deleteGateway();
    //                                 }
    //                                 this.stripeRef.getSavedCards();
    //                                 this.saveInProgress = false;
    //                                 this._messageService.showErrorMessage(error);
    //                             });
    //                     }
    //                     else if (response && response.Result.ResponseValue == -118) {
    //                         //   this.gatewaySaved.emit(false);
    //                         this._messageService.showErrorMessage(this.messages.Error.Duplicate_Card);
    //                         this.saveInProgress = false;
    //                         reject(false);
    //                         return;
    //                     }
    //                     else if (!response.Result.IsAuthenticationRequire) {
    //                         resolve(true);
    //                         return;
    //                     }

    //                 }
    //                 else {
    //                     this.saveInProgress = false;
    //                     this._messageService.showErrorMessage(response.MessageText);
    //                 }
    //             },
    //                 error => {
    //                     this.saveInProgress = false;
    //                     this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Customer Gateway"));
    //                 });
    //     });
    // }

    showMessageAfterPaymentCapturedSuccessfully(res: ApiResponse) {
        this.paymentStatus.emit(true);
        this.receiptId = res.Result.ResponseValue;

        if (this.payAndPrint) {
            this.getReceiptForPrint(this.receiptId, true);
        }

        // if (this.paymentTypeId == this.paymentType.StripeTerminal) {
        //     this._stripeService.capturePayment(this.processPaymentResponse.paymentIntentID).then(response => {
        //         if (response && response.MessageCode > 0) {
        //             this._messageService.showSuccessMessage(this.messages.Success.Payment_Captured);
        //         }
        //     })
        // }
        // else
         if(this.saleInvoice.SaleDetailList.filter(sd => sd.IsWaitlistItem).length == this.saleInvoice.SaleDetailList.length){
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Waitlist"));
        } else {
            if(!this.isAllowedRewardPointsForPayment && this.isBranchHaveAnyDefaultRewardProgram && !this.isWalkedInCustomer){
                // var unenrolledMessage = "<strong>" + this.messages.Success.Save_Success.replace("{0}", "Invoice") + "</strong><br>" +  this.messages.Success.The_Customer_Is_Not_Currently_Enrolled_Within_A_Reward_Program_You_Can_Visit_The_Customers_Profile_In_Order_To_Assign_Them_One;
                var unenrolledMessage = this.messages.Success.Save_Success.replace("{0}", "Invoice") + " " + this.messages.Success.The_Customer_Is_Not_Currently_Enrolled_Within_A_Reward_Program_You_Can_Visit_The_Customers_Profile_In_Order_To_Assign_Them_One;
                this._messageService.showSuccessMessage(unenrolledMessage);
            } else{
                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Invoice"));
            }
        }

        this.onBack.emit(new SavePOSForAddMoreItems());

        this.closeDialog();
        this.saveInProgress = false;

    }
    getPercentage(amount: number, percentage: number): number {
        //return this._taxCalculationService.getTaxAmount(percentage, amount);
        return this._taxCalculationService.getTwoDecimalDigit(((amount * percentage) / 100));
    }

    getTaxAmount(taxPercentage: number, price: number) {
        return this._taxCalculationService.getTaxAmount(taxPercentage, price);
    }
    getStripeTerminalConfig() {
        this._stripeService.initializeTerminal();
        let selectedReaderSerialNumber = JSON.parse(localStorage.getItem(variables.StripeTerminalSerialNumber));
        if (selectedReaderSerialNumber != null && selectedReaderSerialNumber != "undefined") {
            this._stripeService.connectReader(selectedReaderSerialNumber);
        }
    }
    /* returns  integrated gateways flag  */
    getBranchConfiguredGatewaysFundamentals() {
        this._httpService.get(GatewayIntegrationApi.fundamentals).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.isPayTabsIntegrated = response.Result.IsPayTabsIntegrated;
                        this.isStripeIntegrated = response.Result.IsStripeIntegrated;
                        this.isAllowedSplitPayment = response.Result.IsSplitPaymentsEnabledOnCore;
                        this.isAllowedRewardPointsForPayment = response.Result.RewardProgramPaymentOnCore;
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

    getCustomerRewardPointsFundamentals() {

        this._httpService.get(CustomerRewardProgramApi.fundamentalsForWidgetAndPOS + this.personInfo.CustomerID).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.isAllowedRewardPointsCustomerForPayment = true;
                        this.customerRewardPointsDetailForPOS = response.Result;

                        this.customerRewardPointsDetailForPOS.CopyPointsBalance = this.customerRewardPointsDetailForPOS.PointsBalance;

                        if(this.rewardPointsUsed > 0){
                            this.customerRewardPointsDetailForPOS.PointsBalance = this.roundValue(this.customerRewardPointsDetailForPOS.PointsBalance - this.rewardPointsUsed);
                        }

                        var pointsValue = (this.totalAmount / 100) * this.customerRewardPointsDetailForPOS.MaximumPointsRedeemLimitInPercentage;

                        this.customerRewardPointsDetailForPOS.MaximumPointsRedeemLimit = this.roundValue(((pointsValue / this.customerRewardPointsDetailForPOS.RewardProgramRedemptionValue) * this.customerRewardPointsDetailForPOS.RewardProgramRedemptionPoints));
                    } else if(response && response.MessageCode == 204){
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


    roundValue(value: any) {
        return this._taxCalculationService.getRoundValue(value);
    }

    closeDialog() {
        this._dialogRef.close();
    }

    public loadScripts() {
        // You can load multiple scripts by just providing the key as argument into load method of the service
        this._dynamicScriptLoader.load('stripejs', 'stripeterminaljs').then(data => {


            // Script Loaded Successfully
        }).catch(error => console.log(error));
    }


    deleteGateway() {
        let params = {
            CustomerID: this.authenticateCard.CustomerID,
            SaleTypeID: this.authenticateCard.SaleTypeID,
            PaymentGatewayID: this.authenticateCard.PaymentGatewayID,
            CustomerPaymentGatewayID: this.customerPaymentGatewayId
        }

        this._httpService.delete(CustomerPaymentGatewayApi.deleteGateway, params).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    // this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Gateway Account"));
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Gateway Account"));
            }
        )
    }





    //#endregion
}
