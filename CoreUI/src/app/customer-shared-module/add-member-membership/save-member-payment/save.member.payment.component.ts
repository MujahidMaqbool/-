
/********************** Angular References *********************/
import { Component, OnInit, Input, DoCheck, Output, EventEmitter } from "@angular/core";
import { SubscriptionLike } from "rxjs";

/********************** Services & Models *********************/
/* Models */
import { GetMemberMembershipPlan, MembershipPaymentSummary } from 'src/app/customer/member/models/member.membership.model';
import { ApiResponse, DD_Branch } from "src/app/models/common.model";
/* Services */
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { TaxCalculation } from "src/app/services/tax.calculations.service";
import { DataSharingService } from "src/app/services/data.sharing.service";
/********************** Common & Customs *********************/

/********************** Component *********************/
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";

/********************** Configurations *********************/
import { Messages } from "src/app/helper/config/app.messages";
import { MemberMembershipApi } from "src/app/helper/config/app.webapi";
import { ENU_MembershipPaymetType, ENU_DateFormatName } from "src/app/helper/config/app.enums";

@Component({
    selector: 'save-member-payment',
    templateUrl: './save.member.payment.component.html'
})

export class SaveMemberPaymentComponent extends AbstractGenericComponent implements OnInit, DoCheck {
    @Input() getMembershipPlanModel: GetMemberMembershipPlan;
    @Input() getPaymentSummary: boolean;

    @Output() endDateChange = new EventEmitter<Date>();

    currencyFormat: string;


    /* Messages */
    messages = Messages;

    /* Local Members */
    dateFormat: string = "";///Configurations.DateFormat;
    hasPayments: boolean;
    totalAmount: number;


    membershipPaymentType = ENU_MembershipPaymetType;
    /* Model Reference */
    membershipPaymentSummary: MembershipPaymentSummary = new MembershipPaymentSummary();


    constructor(private _memberMembershipService: HttpService,
        private _taxCalculationService: TaxCalculation,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService) {
            super();
    }

    /********* Events *********/
    ngOnInit() {
        this.getCurrentBranchDetail();
      
    }



    ngDoCheck() {
        if (this.getMembershipPlanModel && this.getPaymentSummary) {
            this.getPaymentPlanSummary();
            this.getPaymentSummary = false;
        }
    }

    /********* Methods *********/

    async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
    }
    
    getPaymentPlanSummary() {
        if (this.getMembershipPlanModel && this.getMembershipPlanModel.MembershipID && this.getMembershipPlanModel.MembershipID > 0) {
            this._memberMembershipService.save(MemberMembershipApi.getMembershipPaymentPlanSummary, this.getMembershipPlanModel)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (response.Result) {
                            this.membershipPaymentSummary = response.Result;
                            this.endDateChange.emit(this.membershipPaymentSummary.ValidTo);
                            this.hasPayments = this.membershipPaymentSummary.MembershipPaymentSummaryList &&
                                this.membershipPaymentSummary.MembershipPaymentSummaryList.length > 0 && !this.membershipPaymentSummary.MembershipPaymentSummaryList.every(i => i.Price == 0) ? true : false;

                            if (this.hasPayments) {
                                this.getTaxAmount();
                                this.getTotalPayments();
                            }
                        }
                        else {
                            this.membershipPaymentSummary = new MembershipPaymentSummary();
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText)
                    }
                },
                    error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Payment Summary")) }
                )
        }
    }

    getTaxAmount() {
        this.membershipPaymentSummary.MembershipPaymentSummaryList.forEach(payment => {
            payment.TaxAmount = this._taxCalculationService.getTaxAmount(this.membershipPaymentSummary.TotalTaxPercentage, (payment.Price + payment.ProRataPrice));
        })
    }
    getTotalPayments() {
        //let taxAmount = this._taxCalculationService.getTaxAmount(this.membershipPaymentSummary.TotalTaxPercentage, this.membershipPaymentSummary.TotalPrice)
        this.totalAmount = this._taxCalculationService.getRoundValue(this.membershipPaymentSummary.TotalPrice);
    }
}