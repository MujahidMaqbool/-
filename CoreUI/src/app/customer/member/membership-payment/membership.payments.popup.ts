/********************** Angular Refrences *********************/
import { Component, OnInit, Inject } from '@angular/core';
/********************* Material:Refference ********************/
import {
    MatDialogRef, MAT_DIALOG_DATA
} from '@angular/material/dialog';

/********************** Services & Models *********************/
/* Models */
import { MemberMembershipPayments, Membership } from "src/app/customer/member/models/member.membership.payments.model";
import { MemberMembership } from 'src/app/customer/member/models/member.membership.model';
import { ApiResponse } from 'src/app/models/common.model';
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
/********************** Common & Customs *********************/
import { MembershipPaymentType } from 'src/app/helper/config/app.enums';

/**********************  Common *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { Messages } from 'src/app/helper/config/app.messages';
import { MemberPaymentsApi } from 'src/app/helper/config/app.webapi';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';


@Component({
    selector: 'membership-payment',
    templateUrl: "./membership.payments.popup.html"
})

export class MembershipPaymentsPopupComponent extends AbstractGenericComponent implements OnInit {

    /***********Local*********/
    setDefaultMembership: Membership;
    totalAmount: number;
    currencyFormat: string;
    /***********Messages*********/
    messages = Messages;
    errorMessage: string;
    isDataExists: boolean = false;
    hasMemberships: boolean;

    /***********Collection And Models*********/
    membership: MemberMembership;
    statusList = Configurations.Status;
    memberMembershipPayments: MemberMembershipPayments[];
    memberMembershipFundmentals: Membership[];
    membershipPaymentType = MembershipPaymentType;

    constructor(
        private _memberMembershipPaymentsService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _taxCalculationService: TaxCalculation,
        private _dialogRef: MatDialogRef<MembershipPaymentsPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public membershipModel: any
    ) {
        super();
    }

    ngOnInit() {
        this.getMemberMembershipPyments();
        this.getCurrentBranchDetail();
    }

    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
    }

    getMemberMembershipPyments() {
        let params = {
            CustomerID: this.membershipModel.CustomerID,
            MembershipID: this.membershipModel.MembershipID,
            PageNumber: 1,
            PageSize: 10
        }
        this._memberMembershipPaymentsService.get(MemberPaymentsApi.getMembershipPyments, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isDataExists) {
                        this.memberMembershipPayments = response.Result;
                        this.getTotalAmount();
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Membership Payments"));
                }
            );
    }

    getTotalAmount() {
        this.totalAmount = 0;
        if (this.memberMembershipPayments && this.memberMembershipPayments.length > 0)
            this.memberMembershipPayments.forEach(payment => {
                let taxAmount = this._taxCalculationService.getTaxAmount(payment.TotalTaxPercentage, payment.Price)
                this.totalAmount += this._taxCalculationService.getRoundValue(payment.Price + payment.ProRataPrice + taxAmount);
            })
    }

    onCloseDialog() {
        this._dialogRef.close();
    }
}
