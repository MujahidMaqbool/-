/*********************** Angular References *************************/
import { Component, OnInit, ViewChild, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { NgForm } from '@angular/forms';
/*********************** Material References *************************/
import { MatDialogRef, } from '@angular/material/dialog';

/************* Services & Models *******************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { MessageService } from 'src/app/services/app.message.service';

/* Models */
import { MembershipTranscation, Membership, PaymentGateway } from 'src/app/customer/member/models/member.membership.payments.model';
import { MemberPaymentsApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';

/************* Common *******************/
import { Messages } from 'src/app/helper/config/app.messages';
import { Configurations } from 'src/app/helper/config/app.config';
import { ENU_PaymentGateway, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

@Component({
    selector: 'add-membership-transaction',
    templateUrl: './add.membership.transaction.component.html'
})

export class AddMembershipTransactionComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Members

    @ViewChild('transactionForm') transactionForm: NgForm;
    @Output() isSavedTransaction = new EventEmitter<boolean>();

    /* Local Members */
    showProcessingDaysMessage: boolean;
    totalAmount: number = 0;
    currencyFormat: string;
    isShowPrecessDayStripeACH: boolean;
    dateFormat: string = "";//Configurations.DateFormat;

    minDate: Date = new Date();
    branchCurrentDate: Date;

    /* Model References */
    transactionModel: MembershipTranscation = new MembershipTranscation();
    selectedGateway: PaymentGateway;
    selectedMembership: Membership;

    memberIdSubscription: ISubscription;

    /* Collection Types */
    membershipList: Membership[];
    paymentGatewayList: PaymentGateway[];

    /* Messages */
    messages = Messages;

    /* Configurations */
    dateFormatForSave = Configurations.DateFormatForSave;
    paymentGateway = ENU_PaymentGateway;
    taxAmount: number = 0;

    // #endregion

    constructor(
        private _transcationService: HttpService,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _taxCalculationService: TaxCalculation,
        private cdr: ChangeDetectorRef,
        private dialogRef: MatDialogRef<AddMembershipTransactionComponent>) {
            super();
    }

    ngOnInit() {
        this.getCurrentBranchDetail();
    }

    ngAfterViewChecked(){
        //your code to update the model
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        this.memberIdSubscription.unsubscribe();
    }

    // #region Event(s)

    onMembershipSelectionChange() {
        this.transactionModel.MembershipID = this.selectedMembership.MembershipID;
        this.transactionModel.CustomerMembershipID = this.selectedMembership.CustomerMembershipID;
        this.getTotalAmount();
    }

    onGatewaySelectionChange() {
        this.transactionModel.PaymentGatewayID = this.selectedGateway.PaymentGatewayID;
        this.transactionModel.SaleTypeID = this.selectedGateway.SaleTypeID;
        this.transactionModel.CustomerPaymentGatewayID = this.selectedGateway.CustomerPaymentGatewayID;
        this.showProcessingDaysMessage = this.selectedGateway.PaymentProcessingDays && this.selectedGateway.PaymentProcessingDays > 0 ? true : false;
        this.setPaymentType();
    }

    onSave(isValid: boolean) {
        this.saveMembershipTranscation(isValid);
    }

    onTransactionDateChange(date: any) {
        setTimeout(() => {
            this.transactionModel.CollectionDate = date;
        });
    }

    onCloseDialog() {
        this.dialogRef.close();
    }

    onPriceChange() {
        this.getTotalAmount();
    }

    // #endregion

    // #region Method(s)

    async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);

        //implementation change after discuss with tahir bhai show branch current date not browser date implementaed by fahad dated on 03-03-2021
        this.branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.minDate = this.branchCurrentDate;
        this.minDate.setHours(0, 0, 0, 0);
        this.transactionModel.CollectionDate = this.minDate;
     
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
        this.getMemberID();
    }

    getMemberID() {
        this.memberIdSubscription = this._dataSharingService.memberID.subscribe(memberID => {
            if (memberID && memberID > 0) {
                this.getTranscationFundamentals(memberID);
            }
        });
    }

    getTranscationFundamentals(memberId: number) {
        this._transcationService.get(MemberPaymentsApi.getPaymentTrancationFundmentals, { customerId: memberId })
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.membershipList = response.Result.ExistingMembershipList;
                    this.paymentGatewayList = response.Result.CustomerPaymentGatewayList;
                    this.setDefaultDropdowns();
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            })
    }

    setDefaultDropdowns() {
        /* On page reload first membership will be selected by default */

        this.selectedMembership = this.membershipList[0];
        this.selectedGateway = this.paymentGatewayList[0];
        this.onMembershipSelectionChange();
        this.onGatewaySelectionChange();
    }

    saveMembershipTranscation(isValid: boolean) {
        if (isValid && this.transactionForm.dirty) {
            this.transactionModel.Notes = this.transactionModel.Notes.trim();
            if (this.transactionModel.Notes.length <= 0) {
                this.transactionModel.Notes = "";
            }
            let modelForSave = JSON.parse(JSON.stringify(this.transactionModel))
            modelForSave.CollectionDate = this._dateTimeService.convertDateObjToString(modelForSave.CollectionDate, this.dateFormatForSave);
                this._transcationService.save(MemberPaymentsApi.savePaymentTranscation, modelForSave)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Transaction"));
                        this.onCloseDialog();
                        this.isSavedTransaction.emit(true);
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Transaction")); }
                )
        }
    }

    setPaymentType() {
        switch (this.transactionModel.PaymentGatewayID) {
            case this.paymentGateway.Cash:
              this.addProcessingCurrentDate();
                break;
            case this.paymentGateway.Stripe_Card:
              this.addProcessingCurrentDate();
                break;
            case this.paymentGateway.GoCardless:
                this.addProcessingDays(false);
                break;
            case this.paymentGateway.Stripe_DD:
                this.addProcessingDays(true);
                break;
        }
    }

    async addProcessingDays(val) {
        this.isShowPrecessDayStripeACH = val;
        var branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.minDate = this._dateTimeService.addWorkDays(branchCurrentDate, this.selectedGateway.PaymentProcessingDays);
        this.minDate.setHours(0, 0, 0, 0);
        this.transactionModel.CollectionDate = this.minDate;
    }

    async addProcessingCurrentDate() {
        var branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.minDate = branchCurrentDate;
        this.minDate.setHours(0, 0, 0, 0);
        this.transactionModel.CollectionDate = this.minDate;
    }

    getTotalAmount() {
        this.totalAmount = 0;
        this.taxAmount = 0;
        if (this.transactionModel.Price && this.transactionModel.Price > 0) {
            if (this.selectedMembership && this.selectedMembership.TotalTaxPercentage) {
                this.transactionModel.Price = parseFloat(this.transactionModel.Price.toString());
                this.taxAmount = this._taxCalculationService.getTaxAmount(this.selectedMembership.TotalTaxPercentage, this.transactionModel.Price);
                this.totalAmount = +this.transactionModel.Price + +this.taxAmount;
            }
            else {
                this.totalAmount = this.transactionModel.Price;
            }
        }
    }

    isNumber(evt) {
        evt = (evt) ? evt : window.event;
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    // #endregion

}
