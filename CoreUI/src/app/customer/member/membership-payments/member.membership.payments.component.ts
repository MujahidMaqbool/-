// #region Imports

/********************** Angular Refrences *********************/
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SubscriptionLike as ISubscription } from "rxjs";
import { Router, ActivatedRoute } from '@angular/router';
/********************* Material:Refference ********************/
import { MatPaginator } from '@angular/material/paginator';
import { MatDatepicker } from '@angular/material/datepicker';

/********************** Services & Models *********************/
/* Models */
import { MemberMembershipPayments, MemberPaymentSearch, PaymentGateway, PaymentStatus, Membership } from "@customer/member/models/member.membership.payments.model";
import { MembershipsFundamentals } from "@customer/member/models/member.membership.model"
import { PersonInfo, ApiResponse, DD_Branch } from '@app/models/common.model';
/* Services */
import { HttpService } from '@services/app.http.service';
import { DataSharingService } from '@services/data.sharing.service';
import { MessageService } from '@services/app.message.service';
import { TaxCalculation } from '@app/services/tax.calculations.service';
import { AuthService } from '@app/helper/app.auth.service';
/********************** Common & Customs *********************/
import { MembershipPaymentType, CustomerType, ENU_PaymentGateway, ENU_PaymentStatus, EnumSaleType, ENU_DateFormatName, EnumActivityLogType } from '@helper/config/app.enums';

import { Configurations } from '@helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { MemberPaymentsApi, PointOfSaleApi } from '@app/helper/config/app.webapi';
import { ENU_Permission_ClientAndMember, ENU_Permission_Module } from '@app/helper/config/app.module.page.enums';
import { SuspendMembershipComponent } from '@customer/member/suspend-membership/suspend.membership.component';
import { AddMembershipTransactionComponent } from '@customer/member/membership-payments/add-transactions/add.membership.transaction.component';
import { TransactionDetailComponent } from '@customer/member/membership-payments/transaction-detail/transaction.detail.component';
import { TransactionPaymentComponent } from './payment/transaction.payment.component';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { AlertConfirmationComponent } from '@app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { DateTimeService } from '@app/services/date.time.service';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { DynamicScriptLoaderService } from '@app/services/dynamic.script.loader.service';
import { StripeService } from '@app/services/stripe.service';
import { LoaderService } from '@app/services/app.loader.service';
import { AddStripeCustomerComponent } from '@app/gateway/stripe/add.stripe.customer.component';
import { ActivityLogComponent } from '@app/shared/components/activity-log/activity.log.popup.component';

// #endregion
declare var Stripe: any;
var stripe: any;
var loaderService;

@Component({
    selector: 'member-membership-payment',
    templateUrl: './member.membership.payments.component.html'
})

export class MemberMembershipPaymentsComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    @ViewChild("stripeRef") stripeRef: AddStripeCustomerComponent;

    /***********Local*********/
    setDefaultMembership: MembershipsFundamentals;
    totalAmount: number;
    currencyFormat: string;
    shouldGetPersonInfo: boolean = false;
    customerPaymentId: number;
    // dateFrom: Date;
    // dateTo: Date;
    dateFrom = new Date();
    dateTo = new Date();
    dateFormatForSearch: string = 'MM/dd/yyyy';
    dateFormat: string = "";

    //Configurations.DateFormat;

    /***********Angular Event*********/
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
    @ViewChild('membershipPaymentDate') membershipPaymentDate: DateToDateFromComponent;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;

    searchByPageIndex: boolean = false;

    /***********Messages*********/
    messages = Messages;
    errorMessage: string;
    //isDataExists: boolean = false;
    hasMemberships: boolean;

    /***********Collection And Models*********/
    // personInfo: PersonInfo;
    memberIdSubscription: ISubscription;

    membershipSearchModel: MemberPaymentSearch = new MemberPaymentSearch();
    singalMembePaymentParams = new MemberPaymentSearch();

    membershipList: Membership[];
    paymentGatewayList: PaymentGateway[];
    paymentStatusList: PaymentStatus[];

    memberMembershipPayments: MemberMembershipPayments[];

    /* Pagination */
    // totalRecords: number = 0;
    // defaultPageSize = Configurations.DefaultPageSize;
    // pageSizeOptions = Configurations.PageSizeOptions;
    // pageNumber: number = 1;
    // pageIndex: number = 0;
    sortIndex: number = 1;
    sortOrder_ASC = Configurations.SortOrder_ASC;
    sortOrder_DESC = Configurations.SortOrder_DESC;
    sortOrder: string;
    postionSortOrder: string;
    isPositionOrderASC: boolean = undefined;
    isDataExists: boolean = false;
    isTemplateTitile: boolean = true;
    isSearchByPageIndex: boolean = false;

    /***********Configuration*********/
    membershipPaymentType = MembershipPaymentType;
    paymentStatusType = ENU_PaymentStatus;
    paymentGateWayType = ENU_PaymentGateway;
    saleType = EnumSaleType;

    allowedPages = {
        Search_Member: false,
        Payment_Freeze: false,
        Payment_Save: false
    };


    constructor(private _taxCalulationService: TaxCalculation,
        private _memberMembershipPaymentsService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _authService: AuthService,
        private _dateTimeService: DateTimeService,
        private _dialog: MatDialogService,
        private _dynamicScriptLoader: DynamicScriptLoaderService,
        private _loaderService: LoaderService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _stripeService: StripeService) {
        super();
        loaderService = this._loaderService;
    }

    ngOnInit() {
        this.getCurrentBranchDetail();
        this.getMemberID();
        this.setPermissions();
        this.getPaymentSearchFundamentals();

    }

    ngAfterViewInit() {
        this.membershipPaymentDate.setEmptyDateFilter();
        this.getMemberMembershipPyments();
    }

    ngOnDestroy() {
        if (this.memberIdSubscription) {
            this.memberIdSubscription.unsubscribe();
        }

    }

    // #region Events

    onSuspendMembership() {
        this.openDialogForFreezePayment();
    }

    onAddMembershipTransaction() {
        const dialogRef = this._dialog.open(AddMembershipTransactionComponent, {
            disableClose: true
        })

        dialogRef.componentInstance.isSavedTransaction.subscribe((isSavedTransaction) => {
            if (isSavedTransaction) {
                this.getMemberMembershipPyments();
            }
            else {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Membership Payments"));
            }
        })
    }

    onEditTransaction(payment: MemberMembershipPayments) {
        this.openDialogForEditTransaction(payment);
    }

    // onToDateChange(date: any) {
    //     setTimeout(() => {
    //         this.membershipSearchModel.DateTo = date; //this._dateTimeService.convertDateObjToString(date, this.dateFormat); 07/05/2018  MM/dd/yyyy
    //     });
    // }

    // onFromDateChange(date: any) {
    //     setTimeout(() => {
    //         this.membershipSearchModel.DateFrom = date; //this._dateTimeService.convertDateObjToString(date, this.dateFormat); 07/05/2018 MM/dd/yyyy
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

    onPayTransaction(memberMembershipPayment: MemberMembershipPayments) {
        this.openDialogForPayment(memberMembershipPayment);
    }

    onDeleteTransaction(membershipId: number, paymentId: number) {
        this.openDialogForDeleteTransaction(membershipId, paymentId);
    }

    onCancelTransaction(membershipId: number, paymentId: number) {
        this.openDialogForCancelTransaction(membershipId, paymentId);
    }
    onAuthorization(customerMembershipPaymentID: number,) {
        this.getTransactionDetail(customerMembershipPaymentID);
    }

    onRetryPayment(paymentGatewayID: number, paymentId: number) {
        this.openDialogForRetryPayment(paymentGatewayID, paymentId);
    }

    onMembershipChange(customerMembershipID:number) {
        //this.membershipSearchModel.MembershipID = selectedMembership.MembershipID;
        this.singalMembePaymentParams.MembershipID = this.membershipList.filter(item => item.CustomerMembershipID == customerMembershipID)[0].MembershipID;
    }

    // #endregion

    // #region Methods

    async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
    }

    openDialogForFreezePayment() {
        const dialogRef = this._dialog.open(SuspendMembershipComponent, {
            disableClose: true
        });

        dialogRef.componentInstance.paymentSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getMemberMembershipPyments();
            }
        })
    }

    openDialogForEditTransaction(payment: MemberMembershipPayments) {
        const dialogRef = this._dialog.open(TransactionDetailComponent, {
            disableClose: true,
            data: {
                CustomerID: this.membershipSearchModel.CustomerID,
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

    openDialogForPayment(memberMembershipPayment: MemberMembershipPayments) {
        const dialogRef = this._dialog.open(TransactionPaymentComponent, {
            disableClose: true,
            data: memberMembershipPayment
        })

        dialogRef.componentInstance.paymentSaved.subscribe(
            (isPaymentSaved: boolean) => {
                if (isPaymentSaved) {
                    this.getMemberMembershipPyments();
                }
            })
    }

    setPermissions() {
        this.allowedPages.Search_Member = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.View);
        this.allowedPages.Payment_Freeze = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Payments_Freeze);
        this.allowedPages.Payment_Save = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Payments_Save);
    }

    resetMembershipPaymentSearchFilters() {
        this.singalMembePaymentParams = new MemberPaymentSearch();
        this.membershipSearchModel.MembershipID = undefined;
        this.membershipSearchModel.PaymentGatewayID = undefined;
        this.membershipSearchModel.PaymentStatusTypeID = undefined;
        this.membershipSearchModel.CustomerMembershipID = undefined;
        this.appPagination.resetPagination();
        this.membershipPaymentDate.setEmptyDateFilter();
        this.getMemberMembershipPyments();

    }

    getMemberID() {
        this.memberIdSubscription = this._dataSharingService.memberID.subscribe(memberID => {
            if (memberID > 0) {
                this.membershipSearchModel.CustomerID = memberID;
                //set PersonID and PersonTypeID for personInfo
                // this.personInfo = new PersonInfo();
                // this.personInfo.PersonID = this.membershipSearchModel.CustomerID;
                // this.personInfo.PersonTypeID = CustomerType.Member;
                this.shouldGetPersonInfo = true;
            }
        });
    }

    // changePageSize(e: any) {
    //     if (e.pageIndex >= this.pageNumber) { this.pageNumber = ++e.pageIndex; }

    //     else {
    //         if (e.pageIndex >= 1) {
    //             this.pageNumber = --this.pageNumber;
    //         }
    //         else { this.pageNumber = 1 }
    //     }

    //     this.getMemberMembershipPyments();
    // }


    getPaymentSearchFundamentals() {
        this.membershipList = [];
        this.paymentGatewayList = [];
        this.paymentStatusList = [];

        let params = {
            CustomerID: this.membershipSearchModel.CustomerID
        }
        this._memberMembershipPaymentsService.get(MemberPaymentsApi.getMembershipPaymentFundamentals, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.membershipList = response.Result.MembershipList;
                    this.paymentGatewayList = response.Result.BranchPaymentGatewayList;
                    this.paymentStatusList = response.Result.PaymentStatusTypeList;
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
    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getMemberMembershipPyments();
    }

    memberPaymentSearch() {
        this.singalMembePaymentParams = new MemberPaymentSearch();
        // this.singalMembePaymentParams.CustomerID = this.membershipSearchModel.CustomerID;
        this.singalMembePaymentParams.MembershipID = this.membershipSearchModel.MembershipID,
            this.singalMembePaymentParams.PaymentGatewayID = this.membershipSearchModel.PaymentGatewayID,
            this.singalMembePaymentParams.PaymentStatusTypeID = this.membershipSearchModel.PaymentStatusTypeID,
            this.singalMembePaymentParams.DateFrom = this.membershipSearchModel.DateFrom,
            this.singalMembePaymentParams.DateTo = this.membershipSearchModel.DateTo,
            this.singalMembePaymentParams.CustomerMembershipID = this.membershipSearchModel.CustomerMembershipID,
            this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getMemberMembershipPyments();
    }

    getMemberMembershipPyments() {
        this.isDataExists = false;
        // let param = {
        //     CustomerID: this.membershipSearchModel.CustomerID,
        //     PageNumber: this.appPagination.pageNumber,
        //     PageSize: this.appPagination.pageSize

        // }
        this.singalMembePaymentParams.CustomerID = this.membershipSearchModel.CustomerID;
        this.singalMembePaymentParams.PageNumber = this.appPagination.pageNumber;
        this.singalMembePaymentParams.PageSize = this.appPagination.pageSize;


        this._memberMembershipPaymentsService.get(MemberPaymentsApi.getMembershipPyments, this.singalMembePaymentParams)
            .subscribe((response: ApiResponse) => {

                if (response && response.MessageCode > 0) {
                    this.isDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }

                // if (this.isDataExists) {
                //     this.memberMembershipPayments = response.Result;
                //     this.totalRecords = response.TotalRecord;
                //     this.searchByPageIndex = false;
                //     this.setTotalAmount();
                // }
                // else {
                //     this.totalRecords = 0;
                // }
                if (this.isDataExists) {
                    if (response.Result.length > 0) {
                        this.appPagination.totalRecords = response.TotalRecord;
                    }
                    else {
                        this.appPagination.totalRecords = 0;
                    }
                    this.isSearchByPageIndex = false;
                    this.memberMembershipPayments = response.Result;
                    this.setTotalAmount();
                } else {
                    this.appPagination.totalRecords = 0;
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Membership Payments"));
                }
            );
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
        this.customerPaymentId = paymentId;
        let params = {
            PaymentGatewayID: paymentGatewayID,
            CustomerMembershipPaymentID: paymentId
        }

        this._memberMembershipPaymentsService.save(MemberPaymentsApi.retryPayment, params).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.memberMembershipPayments.filter(item => item.CustomerMembershipPaymentID === this.customerPaymentId)[0].TemporaryDisable = true;
                    if (response.Result.IsAuthenticationRequire) {
                        this._stripeService.confirmCardPayment(response.Result.ClientSecret, response.Result.PaymentMethod).then(response => {
                            if (response) {
                                this._messageService.showSuccessMessage(this.messages.Success.Sent_Success.replace("{0}", "Retry payment"));
                                setTimeout(() => {
                                    this.getMemberMembershipPyments();
                                }, 1000);
                            }
                        },
                            error => {
                                this._messageService.showErrorMessage(error);
                            });
                    }
                    else {
                        this._messageService.showSuccessMessage(this.messages.Success.Sent_Success.replace("{0}", "Retry payment"));
                        setTimeout(() => {
                            this.getMemberMembershipPyments();
                        }, 3000);
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                    // Dec 18,2019 at 16:18 hrs
                    //As per discussion with Iftikhar there should be a call for view all payments if retry attempt is made.
                    this.getMemberMembershipPyments();
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Generic_Messages.Error_Message.replace("{0}", "retry payment"));
            }
        )
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

    getTransactionDetail(customerMembershipPaymentID: number) {

        let url = MemberPaymentsApi.authorizeTranscation.replace("{customerMembershipPaymentID}", customerMembershipPaymentID.toString());
        this._memberMembershipPaymentsService.get(url).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this._stripeService.confirmCardPayment(response.Result.ClientSecret, response.Result.PaymentMethod).then(response => {
                        if (response) {
                            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Authentication"));
                        }
                    },
                        error => {
                            this._messageService.showErrorMessage(error);
                            this._loaderService.hide();
                        })
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Transaction"));
            }
        )
    }

    getStripSettings() {
        this._memberMembershipPaymentsService.get(PointOfSaleApi.getStripeSettings)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result.StripePublishablekey && response.Result.StripeAccountID) {
                        this.setStripKeys(response.Result);
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Stripe Settings"));
                }
            );
    }

    setStripKeys(stripeConfig: any) {
        //stripe = Stripe('pk_test_vzkoTBnZPa9gSvbuSzZbIgXH', 'acct_1DoqMYIuCqZ95Hms');
        stripe = Stripe(stripeConfig.StripePublishablekey, stripeConfig.StripeAccountID);
    }


    setTotalAmount() {
        if (this.isDataExists) {
            this.memberMembershipPayments.forEach(payment => {
                let membershipPrice = payment.Price + payment.ProRataPrice;
                let taxAmount = this._taxCalulationService.getTaxAmount(payment.TotalTaxPercentage, membershipPrice);
                payment.TotalAmount = this._taxCalulationService.getRoundValue(membershipPrice + taxAmount);
            })
        }
    }
    public loadScripts() {
        // You can load multiple scripts by just providing the key as argument into load method of the service
        this._dynamicScriptLoader.load('stripejs').then(data => {
            this._stripeService.getStripSettings();
            // Script Loaded Successfully
        }).catch(error => console.log(error));
    }

    openDialogForActivityLog (paymentId) {
      const dialogRef = this._dialog.open(ActivityLogComponent, {
        disableClose: true
      });
      dialogRef.componentInstance.customerMembershipPaymentID = paymentId;
      dialogRef.componentInstance.dateFormat = this.dateFormat;
      dialogRef.componentInstance.logType = EnumActivityLogType.MemberPayment;
    }

    // confirmCardPayment(clientSecret: any, paymentMethod: any, setupFutureUsage: any) {
    //     var compInst = this;
    //     compInst._loaderService.show();
    //     return new Promise<any>((resolve, reject) => {
    //         stripe.confirmCardPayment(clientSecret, {
    //             payment_method: paymentMethod,
    //             setup_future_usage: 'on_session'
    //         }).then(function (result) {
    //             compInst._loaderService.hide();
    //             if (result.error) {
    //                 reject(result.error.message)
    //                 return;
    //             } else {
    //                 if (result.paymentIntent.status === 'succeeded') {
    //                     resolve(true);
    //                     return;
    //                 }
    //                 else {
    //                     reject(compInst.messages.Validation.Stripe_Account_Agreement_Required);
    //                     return;
    //                 }
    //             }
    //         }, function (error) {
    //             compInst._loaderService.hide();
    //             reject(error);
    //             return
    //         });
    //     });

    // }

    onViewSale(saleNumber: string) {
      if(saleNumber) {
        const saleReference = saleNumber.split('-');
        const saleNo = saleReference[saleReference.length - 1];
        this._router.navigate(['../invoice-history'], {queryParams: {saleNo}, relativeTo: this._activatedRoute})
      }
    }
    // #endregion


}

