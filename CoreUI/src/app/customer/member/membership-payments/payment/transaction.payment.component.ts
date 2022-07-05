/********************** Angular References *********************/
import { Component, OnInit, Output, EventEmitter, ViewChild, Inject } from "@angular/core";
import { SubscriptionLike } from "rxjs";
/********************** Angular Material References *********************/
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";


/****************** Services & Models *****************/
/* Models */
import { SavedCard, SaveSaleCardInvoice } from "@app/point-of-sale/models/point.of.sale.model";
import { ApiResponse, DD_Branch } from "@app/models/common.model";
import { TransactionPaymentDetail, PayTransaction, MemberMembershipPayments } from "@customer/member/models/member.membership.payments.model";

/* Services */
import { HttpService } from "@services/app.http.service";
import { MessageService } from "@services/app.message.service";
import { TaxCalculation } from "@app/services/tax.calculations.service";
import { DataSharingService } from "@app/services/data.sharing.service";

/****************** Components *****************/

/****************** Configurations *****************/
import { EnumSaleType, ENU_PaymentGateway, ENU_DateFormatName } from "@helper/config/app.enums";
import { Configurations } from "@helper/config/app.config";
import { Messages } from "@app/helper/config/app.messages";
import { MemberPaymentsApi, PointOfSaleApi } from "@app/helper/config/app.webapi";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";
import { StripeService } from "@app/services/stripe.service";
import { AddStripeCustomerComponent } from "@app/gateway/stripe/add.stripe.customer.component";

@Component({
    selector: 'transaction-payment',
    templateUrl: './transaction.payment.component.html'
})

export class TransactionPaymentComponent extends AbstractGenericComponent implements OnInit {
    @ViewChild('stripeRef') stripeRef: AddStripeCustomerComponent;
    @Output() paymentSaved = new EventEmitter<boolean>();
    // #region Local Members

    saveInProgress: boolean;
    isStripeIntegrated: boolean;
    hasPayments: boolean = false;
    showCard: boolean = false;
    showCash: boolean = false;
    showPayTabs:boolean = false;
    currencyFormat: string;
    dateFormat: string = "";//Configurations.DateFormat;

    /* Model References */

    transactionDetail: TransactionPaymentDetail = new TransactionPaymentDetail();
    paymentModel: PayTransaction = new PayTransaction();
    savedCards: SavedCard[] = [];
    saveSaleCardInvoice: SaveSaleCardInvoice;
    /* Configurations */
    messages = Messages;
    timeFormat = Configurations.TimeFormat;
    dateFormatForSave = Configurations.DateFormatForSave;
    receiptDateFormat = Configurations.ReceiptDateFormat;
    saleType = EnumSaleType;
    gatewayType = ENU_PaymentGateway;

    // #endregion

    constructor(private _dialogRef: MatDialogRef<TransactionPaymentComponent>,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _taxCalculationService: TaxCalculation,
        private _dataSharingService: DataSharingService,
        private _stripeService: StripeService,
        @Inject(MAT_DIALOG_DATA) public memberMembershipPayment: MemberMembershipPayments) {
        super();
    }

    ngOnInit() {
        this.getCurrentBranchDetail();
        this.getTransactionDetail();
     
    }
    
    //#region Events

    onSaleTypeChange(saleType: number) {
        this.transactionDetail.SaleTypeID = saleType;
    }

    onPay() {
        this.saveInProgress = true;
        this.setPaymentType();
    }

    onClose() {
        this.closeDialog();
    }

    //#endregion

    // #region Local

    async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
    }

    getTransactionDetail() {
        this._httpService.get(MemberPaymentsApi.getTransactionDetailForPayment + this.memberMembershipPayment.CustomerMembershipPaymentID).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.transactionDetail = response.Result;

                    this.transactionDetail.TaxAmount = this._taxCalculationService.getTaxAmount(this.transactionDetail.TotalTaxPercentage, this.transactionDetail.Price + this.transactionDetail.ProRataPrice);
                    this.transactionDetail.TotalAmount = this.roundValue(this.transactionDetail.Price + this.transactionDetail.ProRataPrice + this.transactionDetail.TaxAmount);
                    this.paymentModel.CustomerID = this.transactionDetail.CustomerID;
                    this.paymentModel.CustomerMembershipPaymentID = this.transactionDetail.CustomerMembershipPaymentID;
                    this.paymentModel.SaleTypeID = this.transactionDetail.SaleTypeID;
                    this.paymentModel.Notes = this.transactionDetail.Notes;

                    this.setGatewayVisibility();
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Transaction Details"));
            }
        )
    }

    setPaymentType() {
       
        this.paymentModel.PaymentGatewayID = this.transactionDetail.PaymentGatewayID;
        switch (this.paymentModel.PaymentGatewayID) {
            case this.gatewayType.Cash:
                this.payTransaction();
                break;
            case this.gatewayType.Stripe_Card:
                this.payWithStripe();
                break;
                case this.gatewayType.PayTabs:
                    this.paymentModel.CustomerPaymentGatewayID = this.transactionDetail.CustomerPaymentGatewayID;
                    this.payTransaction();
                break;
        }
    }

    payWithStripe() {
       
        if (this.stripeRef.cardId === 0) {
            this.stripeRef.getStripeToken().then(
                token => {
                    this.paymentModel.PaymentGatewayToken = token;
                    this.payTransaction();
                },
                error => {
                    this._messageService.showErrorMessage(error);
                    this.saveInProgress = false;
                }
            )
        }
        else {
            this.paymentModel.CustomerPaymentGatewayID = this.stripeRef.cardId;
            this.payTransaction();
        }

    }

    payTransaction() {
        this._httpService.save(MemberPaymentsApi.savePayment, this.paymentModel).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result?.IsAuthenticationRequire) {

                        this.saveSaleCardInvoice = new SaveSaleCardInvoice();
                        this.saveSaleCardInvoice.SaleID = response.Result.SaleID;
                        this.saveSaleCardInvoice.CustomerID = this.paymentModel.CustomerID;
                        this.saveSaleCardInvoice.PaymentReferenceNo = response.Result.PaymentID;
                        this.saveSaleCardInvoice.CustomerPaymentGatewayID = response.Result.CustomerPaymentGatewayID;
                        this.saveSaleCardInvoice.InvoiceAmount = this.memberMembershipPayment.TotalAmount;
                        this.saveSaleCardInvoice.CashReceived = this.memberMembershipPayment.TotalAmount;
                        this.saveSaleCardInvoice.IsSaveCard = response.Result.IsSaveCard;
                        this.saveSaleCardInvoice.IsSaveInstrument = response.Result.IsSaveInstrument;

                        this._stripeService.confirmCardPayment(response.Result.ClientSecret, response.Result.PaymentMethod).then(response => {
                            if (response) {
                                // this._httpService.save(PointOfSaleApi.saveSaleCardInvoice, this.saveSaleCardInvoice)
                                //     .subscribe((res: ApiResponse) => {
                                //         if (res && res.MessageCode > 0) {
                                //             this.showMessageAfterPaymentCapturedSuccessfully();
                                //         }
                                //     });
                               this.showMessageAfterPaymentCapturedSuccessfully();
                            }
                        },
                        error => {
                            this._messageService.showErrorMessage(error);
                        });
                    }
                    else {
                        this.showMessageAfterPaymentCapturedSuccessfully();
                    }
                }
                else {
                    this.paymentSaved.emit(false);
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this.paymentSaved.emit(false);
                this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Payment"));
            }
        )
    }

    setGatewayVisibility() {
        this.showCash = false;
        this.showCard = false;
        this.showPayTabs = false;
        switch (this.transactionDetail.SaleTypeID) {
            case this.saleType.Cash:
            case this.saleType.Other:
                this.showCash = true;
                break;
            case this.saleType.Card:
                if(this.transactionDetail.PaymentGatewayID == this.gatewayType.Stripe_Card){
                    this.showCard = true;
                }
                if(this.transactionDetail.PaymentGatewayID == this.gatewayType.PayTabs){
                    this.showPayTabs = true;
                }
                break;
            case this.saleType.CardPM:
                if(this.transactionDetail.PaymentGatewayID == this.gatewayType.Stripe_Card){
                    this.showCard = true;
                }
                break;
        }
    }

    showMessageAfterPaymentCapturedSuccessfully() {
        this.closeDialog();
        this.paymentSaved.emit(true);
        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Payment"));

    }

    roundValue(value: any) {
        return this._taxCalculationService.getRoundValue(value);
    }

    closeDialog() {
        this._dialogRef.close();
    }

    //#endregion
}