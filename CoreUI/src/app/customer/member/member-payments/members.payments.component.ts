/********************** Angular Refrences *********************/
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SubscriptionLike as ISubscription } from "rxjs";
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

/********************* Material:Refference ********************/
import { MatPaginator } from '@angular/material/paginator';
import { MatDatepicker } from '@angular/material/datepicker';
import { debounceTime } from 'rxjs/internal/operators';

/********************** Services & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MessageService } from 'src/app/services/app.message.service';
import { CommonService } from 'src/app/services/common.service';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
import { AuthService } from 'src/app/helper/app.auth.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { StripeService } from 'src/app/services/stripe.service';

/* Models */
import { MemberMembershipPayments, MemberPaymentSearch, PaymentGateway, PaymentStatus, Membership } from "src/app/customer/member/models/member.membership.payments.model";
import { PersonInfo, ApiResponse, AllPerson } from 'src/app/models/common.model';
import { SaveSaleCardInvoice } from 'src/app/point-of-sale/models/point.of.sale.model';

/********************** Common & Customs *********************/
import { CustomerType, ENU_PaymentStatus, MembershipPaymentType, EnumSaleType, ENU_PaymentGateway, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { ENU_Permission_ClientAndMember, ENU_Permission_Module } from 'src/app/helper/config/app.module.page.enums';
import { Messages } from 'src/app/helper/config/app.messages';
import { MemberPaymentsApi, PointOfSaleApi } from 'src/app/helper/config/app.webapi';

/********************** Components *********************/
import { SuspendMembershipComponent } from 'src/app/customer/member/suspend-membership/suspend.membership.component';
import { AddMembershipTransactionComponent } from 'src/app/customer/member/membership-payments/add-transactions/add.membership.transaction.component';
import { TransactionDetailComponent } from 'src/app/customer/member/membership-payments/transaction-detail/transaction.detail.component';
import { TransactionPaymentComponent } from '../membership-payments/payment/transaction.payment.component';
import { AlertConfirmationComponent } from 'src/app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';

@Component({
    selector: "members-payments",
    templateUrl: "./members.payments.component.html"
})

export class MembersPaymentsComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    // #region Local Members

    /* Local */
    setDefaultMembership: Membership;
    // totalAmount: number;
    currencyFormat: string;
    shouldGetPersonInfo: boolean = false;
    clearCustomerInput: string = "";
    // totalRecords: number = 0;
    searchByPageIndex: boolean = false;
    dateFormat: string = "";


    //Configurations.DateFormat;
    paymentTypeId = EnumSaleType.Card;
    /* Angular Events */
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
    @ViewChild('paymentDateSearch') paymentDateSearch: DateToDateFromComponent;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;

    /* Messages */
    messages = Messages;
    errorMessage: string;
    isDataExists: boolean = false;
    hasMemberships: boolean;

    /* Collection And Models */
    personInfo: PersonInfo;
    memberIdSubscription: ISubscription;
    currentBranchSubscription: ISubscription;

    membershipSearchModel: MemberPaymentSearch = new MemberPaymentSearch();
    searchMembershipPaymentParams = new MemberPaymentSearch();
    searchPerson: FormControl = new FormControl();

    membershipList: Membership[];
    paymentGatewayList: PaymentGateway[];
    paymentStatusList: PaymentStatus[];
    memberMembershipPayments: MemberMembershipPayments[];
    allPerson: AllPerson[];
    saveSaleCardInvoice: SaveSaleCardInvoice;

    /* Configuration */
    paymentStatusType = ENU_PaymentStatus;
    // pageSizeOptions = Configurations.PageSizeOptions;
    //  defaultPageSize = Configurations.DefaultPageSize;
    currentDate = new Date();
    membershipPaymentType = MembershipPaymentType;
    saleType = EnumSaleType;
    paymentGateWayType = ENU_PaymentGateway;

    allowedPages = {
        Search_Member: false,
        Payment_Save: false
    };
    FromDateDifference :any;
    // #endregion Local Members

    constructor(private _taxCalulationService: TaxCalculation,
        private _memberMembershipPaymentsService: HttpService,
        private _messageService: MessageService,
        private _commonService: CommonService,
        private _dataSharingService: DataSharingService,
        private _authService: AuthService,
        private _dialog: MatDialogService,
        private _stripeService: StripeService,
        private datePipe: DatePipe,
        private _dateTimeService: DateTimeService,
    ) {

        super();

    }

    ngOnInit() {
        this.getCurrentBranchDetail();
        this.searchPerson.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {
                    if (typeof (searchText) === "string") {
                        this._commonService.searchClient(searchText, CustomerType.Member)
                            .subscribe(
                                response => {
                                    if (response.Result != null && response.Result.length) {
                                        this.allPerson = response.Result;
                                        this.allPerson.forEach(person => {
                                            person.FullName = person.FirstName + " " + person.LastName;
                                        });
                                    }
                                    else {
                                        this.allPerson = [];
                                    }
                                });
                    }
                }
                else {
                    this.allPerson = [];
                }
            });



        this.getMemberID();
        this.setPermissions();
        this.getPaymentSearchFundamentals();
        this.setDates();
        this.FromDateDifference = 30;
    }

    ngAfterViewInit() {
        // this.paymentDateSearch.setEmptyDateFilter();
        this.getMemberMembershipPyments();
    }

    ngOnDestroy() {
        if (this.memberIdSubscription) {
            this.memberIdSubscription.unsubscribe();
        }

    }

    // #region Events

    onSuspendMembership() {
        this._dialog.open(SuspendMembershipComponent, {
            disableClose: true
        });
    }
    //this if the datefrom of search filter (from which date we want to load data)
    FromDate(){
        let dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - 30);
        return this.datePipe.transform(dateFrom, 'yyyy-MM-dd');
    }
    onAddMembershipTransaction() {
        this._dialog.open(AddMembershipTransactionComponent, {
            disableClose: true
        })
    }
    setDates() {
        this.searchMembershipPaymentParams.DateTo = this.datePipe.transform(this.currentDate,'yyyy-MM-dd');
        this.searchMembershipPaymentParams.DateFrom = this.FromDate();
  }

    // onToDateChange(date: any) {
    //     setTimeout(() => {
    //         this.membershipSearchModel.DateTo = date;
    //     });
    // }

    // onFromDateChange(date: any) {
    //     setTimeout(() => {
    //         this.membershipSearchModel.DateFrom = date;
    //     });
    // }

    reciviedDateTo($event) {
        this.membershipSearchModel.DateFrom = $event.DateFrom;
        this.membershipSearchModel.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.membershipSearchModel.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.membershipSearchModel.DateTo = date;
    }

    onPayTransaction(payment: MemberMembershipPayments) {
        this.openDialogForPayment(payment);
    }

    onEditTransaction(payment: MemberMembershipPayments) {
        this.openDialogForEditTransaction(payment);
    }

    onDeleteTransaction(membershipId: number, paymentId: number) {
        this.openDialogForDeleteTransaction(membershipId, paymentId);
    }

    onCancelTransaction(membershipId: number, paymentId: number) {
        this.openDialogForCancelTransaction(membershipId, paymentId);
    }

    onRetryPayment(paymentGatewayID: number, paymentId: number) {
        this.openDialogForRetryPayment(paymentGatewayID, paymentId);
    }

    // #endregion

    // #region Methods

    async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.currentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
    }

    getMemberID() {
        this.memberIdSubscription = this._dataSharingService.memberID.subscribe(memberID => {
            if (memberID > 0) {
                //this.membershipSearchModel.CustomerId = memberID;
                //set PersonID and PersonTypeID for personInfo
                this.personInfo = new PersonInfo();
                this.personInfo.PersonID = this.membershipSearchModel.CustomerID;
                this.personInfo.PersonTypeID = CustomerType.Member;
                this.shouldGetPersonInfo = true;
            }
        });
    }

    getPaymentSearchFundamentals() {
        this._memberMembershipPaymentsService.get(MemberPaymentsApi.getMembershipPaymentFundamentals)
            .subscribe((response: ApiResponse) => {
                if (response) {
                    this.membershipList = response.Result.MembershipList;
                    this.paymentGatewayList = response.Result.BranchPaymentGatewayList;
                    this.paymentStatusList = response.Result.PaymentStatusTypeList;
                }
                else {
                    this.membershipList = [];
                    this.paymentGatewayList = [];
                    this.paymentStatusList = [];
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Membership Payments"));
                }
            );
    }

    setPermissions() {
        this.allowedPages.Search_Member = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.View);
        this.allowedPages.Payment_Save = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Payments_Save);
    }

    openDialogForEditTransaction(payment: MemberMembershipPayments) {
        const dialogRef = this._dialog.open(TransactionDetailComponent, {
            disableClose: true,
            data: {
                CustomerID: payment.CustomerID,
                CustomerMembershipPaymentID: payment.CustomerMembershipPaymentID,
                ShowAdjustFuturePayment: !payment.IsManualTransaction,
                PaymentStatusTypeID: payment.PaymentStatusTypeID
            }
        })

        dialogRef.componentInstance.isSavedEditTransaction
            .subscribe((isSavedEditTransaction: boolean) => {
                if (isSavedEditTransaction) {
                    this.getMemberMembershipPyments();
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Membership Payments"));
                }
            })
    }

    openDialogForPayment(payment: MemberMembershipPayments) {

        const dialogRef = this._dialog.open(TransactionPaymentComponent, {
            disableClose: true,
            data: payment
        })

        dialogRef.componentInstance.paymentSaved.subscribe(
            (isPaymentSaved: boolean) => {
                if (isPaymentSaved) {
                    this.getMemberMembershipPyments();
                }
            })
    }

    openDialogForDeleteTransaction(membershipId: number, paymentId: number) {
        const dialogRef = this._dialog.open(DeleteConfirmationComponent, {
            disableClose: true,
            data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}
        });

        dialogRef.componentInstance.confirmDelete.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                this.deleteTransaction(membershipId, paymentId, true);
            }
        })
    }

    openDialogForCancelTransaction(membershipId: number, paymentId: number) {
        const dialogRef = this._dialog.open(AlertConfirmationComponent, { disableClose: true });
        dialogRef.componentInstance.Title = this.messages.Dialog_Title.Cancel_Payment;
        dialogRef.componentInstance.Message = this.messages.Confirmation.Cancel_Payment;
        dialogRef.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                this.deleteTransaction(membershipId, paymentId, false);
            }
        })
    }

    deleteTransaction(membershipId: number, paymentId: number, isDelete: boolean) {
        let params = {
            CustomerMembershipID: membershipId,
            CustomerMembershipPaymentID: paymentId
        }

        this._memberMembershipPaymentsService.delete(MemberPaymentsApi.deleteTransaction, params).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    if (isDelete) {
                        this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Transaction"));
                    }
                    else {
                        this._messageService.showSuccessMessage(this.messages.Success.Cancel_Success.replace("{0}", "Transaction"));
                    }

                    this.getMemberMembershipPyments();
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Transaction"));
            }
        )
    }

    openDialogForRetryPayment(paymentGatewayID: number, paymentId: number) {
        const dialog = this._dialog.open(AlertConfirmationComponent);

        dialog.componentInstance.Title = this.messages.Dialog_Title.Retry_Payment;
        dialog.componentInstance.Message = this.messages.Confirmation.Retry_Payment;
        dialog.componentInstance.confirmChange.subscribe(isConfirm => {
            if (isConfirm) {
                this.retryPayment(paymentGatewayID, paymentId);
            }
        })
    }

    retryPayment(paymentGatewayID: number, paymentId: number) {
        let params = {
            PaymentGatewayID: paymentGatewayID,
            CustomerMembershipPaymentID: paymentId
        }

        this._memberMembershipPaymentsService.save(MemberPaymentsApi.retryPayment, params).subscribe((response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
                if (response.Result.IsAuthenticationRequire) {
                    this._stripeService.confirmCardPayment(response.Result.ClientSecret, response.Result.PaymentMethod).then(response => {
                        if (response) {
                            this._memberMembershipPaymentsService.save(PointOfSaleApi.saveSaleCardInvoice, this.saveSaleCardInvoice)
                                .subscribe((res: ApiResponse) => {
                                    if (res && res.MessageCode > 0) {
                                        this.showMessageAfterPaymentCapturedSuccessfully(res);
                                    }
                                });
                            setTimeout(() => {
                                this.getMemberMembershipPyments();
                            }, 1000);
                        }
                    }, error => {
                        this._messageService.showErrorMessage(error);
                        // this._loaderService.hide();
                    });
                }
                else {
                    setTimeout(() => {
                        this.getMemberMembershipPyments();
                    }, 2000);
                }
            }
            else {
                this._messageService.showErrorMessage(response.MessageText);
                // Dec 18,2019 at 16:18 hrs
                //As per discussion with Iftikhar there should be a call for view all payments if retry attempt is made.

                setTimeout(() => {
                this.getMemberMembershipPyments();
                }, 2000)
            }
        }, error => {
            this._messageService.showErrorMessage(this.messages.Generic_Messages.Error_Message.replace("{0}", "retry payment"));
        })
    }

    resetMembershipPaymentSearchFilters() {
        this.searchMembershipPaymentParams = new MemberPaymentSearch();
        this.membershipSearchModel.DateTo = this.datePipe.transform(this.currentDate,'yyyy-MM-dd');
        this.membershipSearchModel.DateFrom = this.FromDate();
        this.membershipSearchModel.MembershipID = undefined;
        this.membershipSearchModel.PaymentGatewayID = undefined;
        this.membershipSearchModel.PaymentStatusTypeID = undefined;
        this.membershipSearchModel.CustomerID = null;
        this.appPagination.resetPagination();
        this.allPerson = [];
        this.clearCustomerInput = "";
        this.paymentDateSearch.dateFrom = this.membershipSearchModel.DateFrom as any;
        this.paymentDateSearch.dateTo = new Date();
        // this.paymentDateSearch.setEmptyDateFilter();
        this.getMemberMembershipPyments();

    }


    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getMemberMembershipPyments();
    }
    memberPaymentSearch() {
        this.searchMembershipPaymentParams = new MemberPaymentSearch();
        this.searchMembershipPaymentParams.CustomerID = this.membershipSearchModel.CustomerID;
        this.searchMembershipPaymentParams.MembershipID = this.membershipSearchModel.MembershipID;
        this.searchMembershipPaymentParams.PaymentGatewayID = this.membershipSearchModel.PaymentGatewayID;
        this.searchMembershipPaymentParams.PaymentStatusTypeID = this.membershipSearchModel.PaymentStatusTypeID;
        this.searchMembershipPaymentParams.DateFrom = this.membershipSearchModel.DateFrom;
        this.searchMembershipPaymentParams.DateTo = this.membershipSearchModel.DateTo;
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getMemberMembershipPyments();
    }

    getMemberMembershipPyments() {
            this.isDataExists = false;
            if(this.membershipSearchModel.DateTo == undefined && this.membershipSearchModel.DateFrom == undefined){
                this.membershipSearchModel.DateTo = this.datePipe.transform(this.currentDate,'yyyy-MM-dd');
                this.membershipSearchModel.DateFrom = this.FromDate();
            }
            else{
                this.searchMembershipPaymentParams.DateTo = this.membershipSearchModel.DateTo;
                this.searchMembershipPaymentParams.DateFrom = this.membershipSearchModel.DateFrom;
            }

            this.searchMembershipPaymentParams.PageNumber = this.appPagination.pageNumber,
            this.searchMembershipPaymentParams.PageSize = this.appPagination.pageSize,
            this._memberMembershipPaymentsService.get(MemberPaymentsApi.getMembershipPyments, this.searchMembershipPaymentParams)
                .subscribe((response: ApiResponse) => {

                    if (response && response.MessageCode > 0) {
                        this.isDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }

                    if (this.isDataExists) {
                        this.memberMembershipPayments = response.Result;
                        this.appPagination.totalRecords = response.TotalRecord;
                        this.setTotalAmount();
                        this.searchByPageIndex = false;
                    }
                    else {
                        this.appPagination.totalRecords = 0;
                    }
                },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Membership Payments"));
                    }
                );
    }

    setTotalAmount() {
        if (this.isDataExists) {
            this.memberMembershipPayments.forEach(payment => {
                let taxAmount = this._taxCalulationService.getTaxAmount(payment.Price, payment.TotalTaxPercentage);
                payment.TotalAmount = this._taxCalulationService.getRoundValue(payment.Price + payment.ProRataPrice + taxAmount);
            })
        }
    }

    getSelectedClient(person: AllPerson) {
        this.membershipSearchModel.CustomerID = person.CustomerID;
    }

    displayClientName(user?: AllPerson): string | undefined {
        return user ? user.FirstName + ' ' + user.LastName : undefined;
    }

    showMessageAfterPaymentCapturedSuccessfully(res: ApiResponse) {
        this._messageService.showSuccessMessage(this.messages.Success.Sent_Success.replace("{0}", "Retry payment"));

    }

    // #endregion
}
