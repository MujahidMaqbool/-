/********************** Angular References *********************/
import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from "@angular/core";
import { SubscriptionLike } from "rxjs";
/********************** Angular Material References *********************/


/****************** Services & Models *****************/
/* Models */
import { ViewPaymentSummary } from "@app/customer/member/models/member.membership.model";
import { SavedCard } from "@app/point-of-sale/models/point.of.sale.model";
import { DD_Branch, ApiResponse, CustomerBillingDetail } from "@app/models/common.model";

/* Services */
import { TaxCalculation } from "@app/services/tax.calculations.service";
import { DataSharingService } from "@app/services/data.sharing.service";
import { HttpService } from "@app/services/app.http.service";
import { MessageService } from "@app/services/app.message.service";
import { DateTimeService } from "@app/services/date.time.service";
/****************** Components *****************/
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";

/****************** Configurations *****************/
import { EnumSaleType, MembershipDurationType, ENU_DateFormatName, ENU_PaymentGateway } from "@helper/config/app.enums";
import { Configurations } from "@helper/config/app.config";
import { Messages } from "@app/helper/config/app.messages";
import { CustomerApi } from "@app/helper/config/app.webapi";


@Component({
    selector: 'pos-membership-payment',
    templateUrl: './pos.membership.payment.html'
})

export class POSMembershipPaymentComponent extends AbstractGenericComponent implements OnInit {
    paymentSummary: ViewPaymentSummary;
    @Input() isByMemberShip: boolean = false;
    @Output() saleTypeChange = new EventEmitter<number>();

    // #region Local Members

    isStripeIntegrated: boolean;
    hasPayments: boolean = false;
    showDirectDebit: boolean = false;
    showPayTabsCard: boolean = false;
    showCard: boolean = false;
    showStripeDD: boolean = false;
    showCash: boolean = false;
    currencyFormat: string;
    nextPaymentDay: any;
    dateFormat: string = "";

    /* Model References */

    billingDetail: CustomerBillingDetail = new CustomerBillingDetail();
    savedCards: SavedCard[] = [];

    /* Configurations */
    messages = Messages;
    timeFormat = Configurations.TimeFormat;
    dateFormatForSave = Configurations.DateFormatForSave;
    receiptDateFormat = Configurations.ReceiptDateFormat;
    saleType = EnumSaleType;
    paymentGateway = ENU_PaymentGateway;
    membershipDurationType = MembershipDurationType;

    // #endregion

    constructor(private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _taxCalculationService: TaxCalculation) {
        super();
    }

    ngOnInit() {
        this.getPaymentSummery();
        this.getCurrentBranchDetail();
        this.hasPayments = this.paymentSummary.PaymentList && this.paymentSummary.PaymentList.length > 0 ? true : false;
        if (this.hasPayments) {
            this.getTotal();
            this.setGatewayVisibility();
            this.getBillingDetails();
            this.setNextPaymentDay();
        }

        
    }

    //#region Events

    onSaleTypeChange(saleType: number) {
        this.paymentSummary.SaleTypeID = saleType;
    }
    //#endregion

    // #region Local

    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    }
    getPaymentSummery() {
        this.paymentSummary = JSON.parse(localStorage.getItem('paymentSummary'));
    }
    getBillingDetails() {
        if (this.paymentSummary.BillingDetails) {
            this.billingDetail = this.paymentSummary.BillingDetails;
        }
        else if (this.paymentSummary.CustomerID && this.paymentSummary.CustomerID > 0) {
            this._httpService.get(CustomerApi.getCustomerBillingDetails + this.paymentSummary.CustomerID).subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.billingDetail = response.Result == undefined || response.Result == null?[]:response.Result;
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Billing Address"));
                })

        }
    }

    setGatewayVisibility() {
        
        this.showCash = false;
        this.showCard = false;
        this.showStripeDD = false;
        this.showDirectDebit = false;
        this.showPayTabsCard = false;
        switch (this.paymentSummary.SaleTypeID) {
            case this.saleType.Cash:
            case this.saleType.Other:
                this.showCash = true;
                break;
            case this.saleType.Card:
                if (this.paymentSummary.CustomerGatewayId == this.paymentGateway.Stripe_Card) {
                    this.showCard = true;
                }
                else if (this.paymentSummary.CustomerGatewayId == this.paymentGateway.PayTabs) {
                    this.showPayTabsCard = true;
                }
                break;
            case this.saleType.DirectDebit:
                this.showDirectDebit = true;
                break;
            case this.saleType.CardAndDirectDebit:
                this.showDirectDebit = true;
                this.showCard = true;
                break;
            case this.saleType.StripeTerminal:
                this.showStripeDD = true;
                break;
        }
    }

    getTotal() {
        let total = 0;
        this.paymentSummary.TaxAmount = 0;
        this.paymentSummary.TotalAmount = 0;
        let splitOnlyDatePart1 = this.paymentSummary.PaymentDate.toString();
        let splitOnlyDatePart = splitOnlyDatePart1.split('T')[0];
        this.paymentSummary.PaymentDate = splitOnlyDatePart;
        this.paymentSummary.PaymentList.forEach(payment => {
            this.paymentSummary.TaxAmount += this.paymentSummary.TotalTaxPercentage ? this._taxCalculationService.getTaxAmount(this.paymentSummary.TotalTaxPercentage, payment.Price + payment.ProRataPrice) : 0;
            payment.TotalPrice = payment.Price + payment.ProRataPrice;
            total += payment.TotalPrice;
        })
        this.paymentSummary.TotalAmount = this.roundValue(total + this.paymentSummary.TaxAmount);
    }

    setNextPaymentDay() {
        if (this.paymentSummary.NextPaymentAmount && this.paymentSummary.NextPaymentAmount > 0) {
            if (this.paymentSummary.NextPaymentInterval === this.membershipDurationType.Weeks) {
                //remove zone form date time added by fahad for browser different time zone issue resolving
                this.nextPaymentDay = this._dateTimeService.getDayNameFromDate(this._dateTimeService.removeZoneFromDateTime(this.paymentSummary.NextPaymentDate));
            }
            else {
                //remove zone form date time added by fahad for browser different time zone issue resolving
                this.nextPaymentDay = (new Date(this._dateTimeService.removeZoneFromDateTime(this.paymentSummary.NextPaymentDate))).getDate();
            }
        }
    }

    roundValue(value: any) {
        return this._taxCalculationService.getRoundValue(value);
    }

    //#endregion
}
