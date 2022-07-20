// #region Imports

/*********************** Angular References *************************/
import { Component, OnInit, Inject, ViewChild, Output, EventEmitter } from '@angular/core';
import { SubscriptionLike as ISubscription, SubscriptionLike } from 'rxjs';
import { NgForm } from '@angular/forms';
import { FormControl } from "@angular/forms";

/*********************** Material References *************************/
import { MatDialogRef, MAT_DIALOG_DATA, } from '@angular/material/dialog';

/************* Services & Models *******************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';

/* Models */
import { Membership, PaymentGateway, MembershipTranscation } from 'src/app/customer/member/models/member.membership.payments.model';
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';
import { Messages } from 'src/app/helper/config/app.messages';

/************** Configurations ******************/
import { MemberPaymentsApi } from 'src/app/helper/config/app.webapi';
import { Configurations } from 'src/app/helper/config/app.config';
import { ENU_PaymentGateway, MembershipPaymentType, MembershipDurationType, ENU_DateFormatName, ENU_PaymentStatus } from 'src/app/helper/config/app.enums';
import { DatePickerComponent } from 'src/app/application-dialog-module/date-picker/date.picker.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

// #endregion

@Component({
    selector: 'transaction-detail',
    templateUrl: './transaction.detail.component.html'
})

export class TransactionDetailComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Members
    @ViewChild('transactionDetailForm') transactionDetailForm: NgForm;
    @ViewChild('datePicker') datePicker: DatePickerComponent;
    @Output()
    isSavedEditTransaction = new EventEmitter<boolean>();

    /* Local Members */
    showAdjustFuturePayments: boolean;
    showProcessingDaysMessage: boolean;
    isDisabledProRata: boolean = false;
    currencyFormat: string;
    totalAmount: number;
    minDate: Date = new Date();
    maxDate: Date;
    collectionDate: any;
    isShowPrecessDayStripeACH: boolean;
    dateFormat: string = "";//Configurations.DateFormat;
    PaymentStatusTypeID: number;
    branchCurrentDate: Date;

    /* Model References */
    selectedGateway: PaymentGateway;
    selectedMembership: Membership;
    transactionModel: MembershipTranscation = new MembershipTranscation();

    /* Collection Types */
    membershipList: Membership[];
    paymentGatewayList: PaymentGateway[];


    /* Messages */
    messages = Messages;

    /* Configurations */
    dateFormatForSave = Configurations.DateFormatForSave;
    paymentGateway = ENU_PaymentGateway;
    membershipPaymentType = MembershipPaymentType;
    memDurationType = MembershipDurationType;
    enu_PaymentStatus = ENU_PaymentStatus;
// #endregion

    constructor(
        private _transactionDetailService: HttpService,
        private _messageService: MessageService,
        private _dialogRef: MatDialogRef<TransactionDetailComponent>,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
        private _taxCalculationService: TaxCalculation,
        @Inject(MAT_DIALOG_DATA) public transDetails: any) {
            super();
    }

    ngOnInit() {
        this.getCurrentBranchDetail();

    }

    

    onTransactionDateChange(date: any) {
        setTimeout(() => {
            this.transactionModel.CollectionDate = date;
            this.transactionDetailForm.form.markAsDirty();
        });
    }

    // #region Event(s)

    onMembershipSelectionChange() {
        this.transactionModel.MembershipID = this.selectedMembership.MembershipID;
        this.transactionModel.CustomerMembershipID = this.selectedMembership.CustomerMembershipID;
        this.setMaxDueDate();
    }

    onGatewaySelectionChange() {
        this.transactionModel.PaymentGatewayID = this.selectedGateway?.PaymentGatewayID;
        this.transactionModel.SaleTypeID = this.selectedGateway?.SaleTypeID;
        this.transactionModel.CustomerPaymentGatewayID = this.selectedGateway?.CustomerPaymentGatewayID;
        this.showProcessingDaysMessage = this.selectedGateway?.PaymentProcessingDays && this.selectedGateway?.PaymentProcessingDays > 0 ? true : false;
        this.resetMinCollectionDate();
        this.setPaymentType();
    }

    async resetMinCollectionDate() {
        var branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.minDate = branchCurrentDate;
        this.minDate.setHours(0, 0, 0, 0);
    }

    onCloseDialog() {
        this._dialogRef.close();
    }

    onSave(isValid: boolean) {
        if(this.transactionModel.Price && this.transactionModel.Price > 0){
            this.saveTransactionDetails(isValid)
        }
       
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

         this.showAdjustFuturePayments = this.transDetails.ShowAdjustFuturePayment;
         this.PaymentStatusTypeID = this.transDetails.PaymentStatusTypeID;
         this.minDate = this.branchCurrentDate;
         this.minDate.setHours(0, 0, 0, 0);

         const branch = await super.getBranchDetail(this._dataSharingService);
         if (branch && branch.hasOwnProperty("Currency")) {
             this.currencyFormat = branch.CurrencySymbol;
         }

         Promise.all([
             this.getTransactionDetailsById(this.transDetails.CustomerMembershipPaymentID),
             this.getTransactionDetailFundamentals(this.transDetails.CustomerID)
         ]).then(
             success => {
                 this.setDefaultDropdowns();
                 this.getTotalAmount();
             }
         )
    }

    getTransactionDetailFundamentals(memberId: number) {
        return this._transactionDetailService.get(MemberPaymentsApi.getPaymentTrancationFundmentals, { customerId: memberId })
            .toPromise()
            .then((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.membershipList = response.Result.ExistingMembershipList;
                    this.paymentGatewayList = response.Result.CustomerPaymentGatewayList;
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Transaction"));
                })
    }

    getTransactionDetailsById(membershipPaymentId: number) {
        return this._transactionDetailService.get(MemberPaymentsApi.getMemberPaymentDetail + membershipPaymentId)
            .toPromise()
            .then((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.collectionDate = response.Result.CollectionDate;
                    this.transactionModel = response.Result;
                    this.isDisabledProRata = this.transactionModel.ProRataPrice > 0 && this.transactionModel.IsProRata ? false : true;
                    this.showAdjustFuturePayments = this.showAdjustFuturePayments && this.transactionModel.MembershipPaymentTypeID === this.membershipPaymentType.Recurring;
                    this.checkDueDate();
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Transaction"));
                })
    }

    setDefaultDropdowns() {
        /* On page reload first membership will be selected by default */
        if (this.membershipList && this.membershipList.length > 0) {
            this.selectedMembership = this.membershipList.find(m => m.MembershipID === this.transactionModel.MembershipID && m.CustomerMembershipID === this.transactionModel.CustomerMembershipID);
            this.onMembershipSelectionChange();
        }

        if (this.paymentGatewayList && this.paymentGatewayList.length > 0) {
            this.selectedGateway = this.paymentGatewayList.find(p => p.PaymentGatewayID === this.transactionModel.PaymentGatewayID &&
                p.CustomerPaymentGatewayID === this.transactionModel.CustomerPaymentGatewayID);
            // this.selectedGateway = this.paymentGatewayList.find(p => p.PaymentGatewayID === this.transactionModel.PaymentGatewayID &&
            //     p.SaleTypeID === this.transactionModel.SaleTypeID &&
            //     p.CustomerPaymentGatewayID === this.transactionModel.CustomerPaymentGatewayID);
            this.onGatewaySelectionChange();
        }
    }

    async checkDueDate() {
        var branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.minDate = branchCurrentDate;
        // let todayDate = this._dateTimeService.getStartOfDay();
        // if (todayDate > this.transactionModel.CollectionDate) {
        //     this.minDate = this.transactionModel.CollectionDate;
        //     this.maxDate = this.transactionModel.CollectionDate;
        // }
        // else {
        //     this.minDate = new Date();
        //     this.maxDate = null;
        // }
    }

    saveTransactionDetails(isValid: boolean) {
        if (isValid && this.datePicker.dateElement.valid && this.transactionDetailForm.dirty) {
            let modelForSave = JSON.parse(JSON.stringify(this.transactionModel))
            modelForSave.CollectionDate = this._dateTimeService.convertDateObjToString( this._dateTimeService.removeZoneFromDateTime(modelForSave.CollectionDate), this.dateFormatForSave);
            this._transactionDetailService.save(MemberPaymentsApi.savePaymentTranscation, modelForSave)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Transaction"));
                        this.isSavedEditTransaction.emit(true);
                        this.onCloseDialog();
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Membership Transaction"));
                    })
        }

    }

    setPaymentType() {
        switch (this.transactionModel.PaymentGatewayID) {
            case this.paymentGateway.Cash:
                this.checkDueDate();
                break;
            case this.paymentGateway.Stripe_Card:
                this.checkDueDate();
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
    }

    getTotalAmount() {
        this.totalAmount = 0;
        if (this.transactionModel.Price && this.transactionModel.Price > 0) {
            if (this.selectedMembership && this.selectedMembership.TotalTaxPercentage) {
                this.transactionModel.Price = parseFloat(this.transactionModel.Price.toString());
                this.transactionModel.ProRataPrice = this.transactionModel.ProRataPrice ? Number(this.transactionModel.ProRataPrice) : 0;
                this.transactionModel.TaxAmount = this._taxCalculationService.getTaxAmount(this.selectedMembership.TotalTaxPercentage, (this.transactionModel.Price + this.transactionModel.ProRataPrice));
                this.totalAmount = +this.transactionModel.Price + +this.transactionModel.TaxAmount + +this.transactionModel.ProRataPrice;
            }
            else {
                this.totalAmount = +this.transactionModel.Price + +this.transactionModel.ProRataPrice;
            }
        } else{
            this.transactionModel.TaxAmount = 0;
        }
    }

    onProRataChange() {
      this.getTotalAmount();
    }

    setMaxDueDate() {
        this.maxDate = undefined;
        if (this.showAdjustFuturePayments) {
            this.maxDate = new Date(this.collectionDate);
            switch (this.selectedMembership.DurationTypeID) {
                case this.memDurationType.Days:
                    this.maxDate.setDate(this.maxDate.getDate() + 1);
                    break;
                case this.memDurationType.Weeks:
                    this.maxDate.setDate(this.maxDate.getDate() + 7);
                    break;
                case this.memDurationType.Months:
                    this.maxDate.setMonth(this.maxDate.getMonth() + 1);
                    break;
                case this.memDurationType.Quarter:
                    this.maxDate.setMonth(this.maxDate.getMonth() + 3);
                    break;
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
