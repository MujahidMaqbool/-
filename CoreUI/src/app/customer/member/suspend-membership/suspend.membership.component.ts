/*********************** Angular References *************************/
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { NgForm } from '@angular/forms';

/*********************** Material References *************************/
import { MatDialogRef } from '@angular/material/dialog';

/*********************** Services *************************/
import { HttpService } from 'src/app/services/app.http.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';

/*********************** Models *************************/
import { MemberMembership,MembershipFreezeDetail, MemberMembershipPaymentsDetail, SaveMembershipFreezeDetail } from '../models/member.membership.suspend.model';
import { ApiResponse } from 'src/app/models/common.model'
import { PaymentGateway } from '../models/member.membership.payments.model';

/*********************** Configurations *************************/
import { MemberApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';
import { Configurations } from 'src/app/helper/config/app.config';
import { MembershipStatus_Enum, ENU_PaymentGateway, ENU_PaymentStatus, EnumSaleType, ENU_DateFormatName } from 'src/app/helper/config/app.enums';

/*********************** Components *************************/
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

@Component({
    selector: 'suspend-membership',
    templateUrl: './suspend.membership.component.html'
})

export class SuspendMembershipComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Members

    @ViewChild('freezeMembershipForm') freezeMembershipForm: NgForm;
    @Output() paymentSaved = new EventEmitter<boolean>();
    /* Messages */
    messages = Messages;

    /* Local */
    isDataExists: boolean = false;
    hasNoPayments: boolean = false;
    showProcessingDaysMessage: boolean = false;
    paymentProcessingDays: number = 0;
    currencyFormat: string;
    totalAmount: number;
    currentDate: Date = new Date();
    minDate: Date = new Date();
    isShowPrecessDayStripeACH: boolean;

    dateFormat = Configurations.DateFormat;
    dateFormatForSave = Configurations.DateFormatForSave;

    /* Models */

    memberIdSubscription: ISubscription;
    membershipFreezeDetail: MembershipFreezeDetail = new MembershipFreezeDetail();
    saveMembershipFreezeDetail: SaveMembershipFreezeDetail = new SaveMembershipFreezeDetail();
    selectedMembership: MemberMembership;
    selectedGateway: PaymentGateway;
    /* Collection Types */
    membershipList: MemberMembership[];
    paymentGatewayList: PaymentGateway[];
    memberMembershipPaymentsDetail: MemberMembershipPaymentsDetail[];
    startMembershipFreezeDateList: MemberMembershipPaymentsDetail[];
    intervalList: number[];

    membershipStatus = MembershipStatus_Enum;
    paymentStatus = ENU_PaymentStatus;
    enumPaymentGateway = ENU_PaymentGateway;
    enumSaleType = EnumSaleType;

    // #endregion

    constructor(
        private dialogRef: MatDialogRef<SuspendMembershipComponent>,
        private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _taxCalculationService: TaxCalculation) {
            super();
    }

    ngOnInit() {
       this.getCurrentBranchDetail();
    }

    ngOnDestroy() {
        this.memberIdSubscription.unsubscribe();
    }

    // #region Event(s)

    onCloseDialog() {
        this.closeDialog();
    }

    onMembershipChange() {
        this.membershipFreezeDetail.MembershipID = this.selectedMembership.MembershipID;
        this.membershipFreezeDetail.CustomerMembershipID = this.selectedMembership.CustomerMembershipID;
        this.getMemberMembershipDetail();
        this.getTotalAmount();
    }

    async onPaymentMethodChange() {
        this.membershipFreezeDetail.PaymentGatewayID = this.selectedGateway.PaymentGatewayID;
        this.membershipFreezeDetail.CustomerPaymentGatewayID = this.selectedGateway.CustomerPaymentGatewayID;
        if (this.membershipFreezeDetail.PaymentGatewayID == this.enumPaymentGateway.GoCardless) {
            this.paymentProcessingDays = this.paymentGatewayList.find(m => m.PaymentGatewayID == this.selectedGateway.PaymentGatewayID).PaymentProcessingDays;
            this.addProcessingDays();
            // this.minDate.setDate(this.minDate.getDate() + this.paymentProcessingDays);
            this.showProcessingDaysMessage = true;
            this.isShowPrecessDayStripeACH = false;
            this.currentDate = this.minDate;
        } else if (this.membershipFreezeDetail.PaymentGatewayID == this.enumPaymentGateway.Stripe_DD) {
            this.paymentProcessingDays = this.paymentGatewayList.find(m => m.PaymentGatewayID == this.selectedGateway.PaymentGatewayID).PaymentProcessingDays;
            this.addProcessingDays();
            // this.minDate.setDate(this.minDate.getDate() + this.paymentProcessingDays);
            this.showProcessingDaysMessage = true;
            this.isShowPrecessDayStripeACH = true;
            this.currentDate = this.minDate;
        }
        else {
             //set branch date time added by fahad for browser different time zone issue resolving
             this.minDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
             this.currentDate = this.minDate;
             this.showProcessingDaysMessage = false;
        }
    }

    onStatusChange() {
        this.setPaymentsList();
    }

    onSave(isValid: boolean) {
        this.save(isValid);
    }

    onCollectionDateChange(date: any) {
        this.currentDate = date;
    }

    onPriceChange() {
        this.getTotalAmount();
    }

    onSuspensionDateChange() {
        this.calculateIntervals(true);
    }

    // #endregion

    // #regoin Methods

    async getCurrentBranchDetail(){
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.minDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.getMemberID();

        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
          //set branch date time added by fahad for browser different time zone issue resolving

         this.currentDate = this.minDate;
    }

    addProcessingDays() {
        this.minDate = this._dateTimeService.addWorkDays(new Date(), this.paymentProcessingDays);
        this.minDate.setHours(0, 0, 0, 0);
    }

    setPaymentsList() {
        if (this.membershipFreezeDetail.Freeze) {
            this.startMembershipFreezeDateList = this.memberMembershipPaymentsDetail.filter(p => p.PaymentStatusTypeID !== this.paymentStatus.Freeze);
        }
        else {
            this.startMembershipFreezeDateList = this.memberMembershipPaymentsDetail.filter(p => p.PaymentStatusTypeID === this.paymentStatus.Freeze);
        }

        this.hasNoPayments = this.startMembershipFreezeDateList && this.startMembershipFreezeDateList.length < 1 ? true : false;
        if (!this.hasNoPayments) {
            this.setPaymentCollectionDefaultDropDown();
        }
        else {
            this.intervalList = [];
        }
    }

    setPaymentCollectionDateFormat() {
        this.memberMembershipPaymentsDetail.forEach(element => {

            //remove zone from date added by fahad for browser different time zone issue resolving
            element.CollectionDate = this._dateTimeService.removeZoneFromDateTime(element.CollectionDate);
            element.CollectionDate = this._dateTimeService.convertDateObjToString(new Date(element.CollectionDate), this.dateFormat) + '/ ' + element.PaymentStatusTypeName;
        });
    }

    setPaymentCollectionDefaultDropDown() {
        if (this.startMembershipFreezeDateList && this.startMembershipFreezeDateList.length > 0) {
            this.membershipFreezeDetail.StartCollectionDateID = this.startMembershipFreezeDateList[0].CustomerMembershipPaymentID;
            this.membershipFreezeDetail.CustomerMembershipID = this.startMembershipFreezeDateList[0].CustomerMembershipID;
        }
        this.calculateIntervals();
    }

    calculateIntervals(filterByPayments: boolean = false) {
        if (this.selectedMembership.IsAutoRoll) {
            if (this.membershipFreezeDetail.Freeze) {
                this.setIntervalList(6);
            }
            else {
                if (filterByPayments) {
                    this.setIntervalList(this.getIntervalsByPayment());
                }
                else {
                    this.setIntervalList(this.startMembershipFreezeDateList.length);
                }
            }
        }
        else {
            if (filterByPayments) {
                this.setIntervalList(this.getIntervalsByPayment());
            }
            else {
                this.setIntervalList(this.startMembershipFreezeDateList.length);
            }
        }
    }

    getIntervalsByPayment() {
        let startFrom = this.startMembershipFreezeDateList.find(c => c.CustomerMembershipPaymentID == this.membershipFreezeDetail.StartCollectionDateID);
        let filteredPayments = this.startMembershipFreezeDateList.slice(this.startMembershipFreezeDateList.indexOf(startFrom), this.startMembershipFreezeDateList.length);
        return filteredPayments.length;

    }

    setIntervalList(noOfIntervals: number) {
        this.intervalList = [];
        noOfIntervals = noOfIntervals && noOfIntervals > 6 ? 6 : noOfIntervals;
        for (let interval = 1; interval <= noOfIntervals; interval++) {
            this.intervalList.push(interval);

        }
        //this.intervalList = [1, 2, 3, 4, 5, 6];
    }

    setDefaultDropdown() {
        this.selectedGateway = this.paymentGatewayList && this.paymentGatewayList.length > 0 ? this.paymentGatewayList[0] : null;
        this.membershipFreezeDetail.PaymentGatewayID = this.selectedGateway.PaymentGatewayID;
    }

    getMemberID() {
        this.memberIdSubscription = this._dataSharingService.memberID.subscribe(memberID => {
            if (memberID && memberID > 0) {
                this.membershipFreezeDetail.CustomerID = memberID;
                this.getMembershipFreezeFundamental();
            }
        });
    }

    getMembershipFreezeFundamental() {
        this.membershipList = [];
        this.paymentGatewayList = [];

        let params = {
            customerID: this.membershipFreezeDetail.CustomerID
        }
        this._httpService.get(MemberApi.getMembershipFreezeFundamental, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isDataExists = res.Result != null ? true : false;
                    if (this.isDataExists) {
                        this.membershipList = res.Result.ExistingMembershipList;
                        this.paymentGatewayList = res.Result.CustomerPaymentGatewayList;
                        if (this.membershipList && this.membershipList.length > 0) {
                            this.selectedMembership = this.membershipList && this.membershipList.length > 0 ? this.membershipList[0] : null;
                            this.membershipFreezeDetail.MembershipID = this.selectedMembership.MembershipID;
                            this.membershipFreezeDetail.CustomerMembershipID = this.selectedMembership.CustomerMembershipID;
                            this.getMemberMembershipDetail();
                        }
                        else {
                            this._messageService.showErrorMessage(this.messages.Generic_Messages.No_Memebrships_Alert);
                            this.membershipList = [];
                        }
                        this.setDefaultDropdown();
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Fundamentals"));
                }
            );
    }

    getMemberMembershipDetail() {
        let params = {
            customerID: this.membershipFreezeDetail.CustomerID,
            customerMembershipID: this.membershipFreezeDetail.CustomerMembershipID,
        }
        this._httpService.get(MemberApi.getMemberMembershipDetail, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.hasNoPayments = res.Result && res.Result.length > 0 ? false : true;
                    if (this.hasNoPayments) {
                        this.memberMembershipPaymentsDetail = [];
                        this.startMembershipFreezeDateList = [];
                    }
                    else {
                        this.memberMembershipPaymentsDetail = res.Result;
                        this.setPaymentCollectionDateFormat();
                        this.setPaymentsList();
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Membership Payment Detail"));
                }
            );
    }

    mapMembershipFreezeModel() {
        this.saveMembershipFreezeDetail.CustomerID = this.membershipFreezeDetail.CustomerID;
        this.saveMembershipFreezeDetail.CustomerMembershipID = this.membershipFreezeDetail.CustomerMembershipID;
        this.saveMembershipFreezeDetail.IsFreeze = this.membershipFreezeDetail.Freeze;
        this.saveMembershipFreezeDetail.MembershipID = this.membershipFreezeDetail.MembershipID;
        this.saveMembershipFreezeDetail.CustomerMembershipPaymentID = this.membershipFreezeDetail.StartCollectionDateID;
        this.saveMembershipFreezeDetail.IsOpenEnded = this.membershipFreezeDetail.OpenEndedSuspension;

        if (!this.saveMembershipFreezeDetail.IsOpenEnded) {
            this.saveMembershipFreezeDetail.Intervals = this.membershipFreezeDetail.Intervals;
        }

        if (this.membershipFreezeDetail.Price > 0) {
            this.saveMembershipFreezeDetail.Price = this.membershipFreezeDetail.Price;
            this.saveMembershipFreezeDetail.PaymentGatewayID = this.membershipFreezeDetail.PaymentGatewayID;
            this.saveMembershipFreezeDetail.CustomerPaymentGatewayID = this.membershipFreezeDetail.CustomerPaymentGatewayID;
            this.saveMembershipFreezeDetail.Notes = this.membershipFreezeDetail.Notes;
            this.saveMembershipFreezeDetail.CollectionDate = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormatForSave);
            this.saveMembershipFreezeDetail.SaleTypeID = this.membershipFreezeDetail.PaymentGatewayID == this.enumPaymentGateway.Stripe_DD ? this.enumSaleType.DirectDebit : this.membershipFreezeDetail.PaymentGatewayID;
        }
    }

    save(isValid: boolean) {
        if (isValid) {
            this.mapMembershipFreezeModel();
            this._httpService.save(MemberApi.saveFreezeMembership, this.saveMembershipFreezeDetail)
                .subscribe((res: ApiResponse) => {
                    if (res && res.MessageCode && res.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Payment"));
                        //this.getMemberMembershipDetail();
                        this.closeDialog();
                        this.paymentSaved.emit(true);
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                        this.paymentSaved.emit(false);
                    }
                },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Payment"));
                        this.paymentSaved.emit(false);
                    }
                );
        }
    }

    getTotalAmount() {
        this.totalAmount = 0;
        if (this.membershipFreezeDetail.Price && this.membershipFreezeDetail.Price > 0) {
            if (this.selectedMembership && this.selectedMembership.TotalTaxPercentage) {
                this.membershipFreezeDetail.Price = parseFloat(this.membershipFreezeDetail.Price.toString());
                let taxAmount = this._taxCalculationService.getTaxAmount(this.selectedMembership.TotalTaxPercentage, this.membershipFreezeDetail.Price);
                this.totalAmount = this.membershipFreezeDetail.Price + taxAmount;
            }
            else {
                this.totalAmount = this.membershipFreezeDetail.Price;
            }
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }

    // #endregion

}
