/********************** Angular References *********************************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, SubscriptionLike as ISubscription } from "rxjs";
import { debounceTime } from 'rxjs/internal/operators';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
/********************* Material:Refference ********************/
import { MatPaginator } from '@angular/material/paginator';
import { MatDatepicker } from '@angular/material/datepicker';

/********************** Service & Models *********************/
/* Services */
import { DataSharingService } from '@services/data.sharing.service';
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { CommonService } from '@app/services/common.service';
import { MatDialogService } from '../../generics/mat.dialog.service';
import { AuthService } from '@app/helper/app.auth.service';
/* Models */
import { SearchSaleHistory, SaleHistory, InvoiceFundamental } from '@models/sale.model';
import { AllPerson, InvoiceHistory, InvoiceSaleHistory, InvoiceSaleHistoryDetail } from '@app/models/common.model';
/********************** Component *********************************/
import { SaleDetailComponent } from '@shared/components/sale/sale.detail/sale.detail.component';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { ActivityLogComponent } from '../../activity-log/activity.log.popup.component';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { SaleVoidComponent } from '../sale-void/sale-void.popup.component';
import { SavePartialPaymentComponent } from '../partial-payment/save.partial.payment.component';
import { RefundPaymentComponent } from '../refund-payment/refund.payment.component';
import { BadDebtComponent } from '../bad-debt/bad.debt.component';

/********************** Common *********************************/
import { PersonType, EnumSaleStatusType, EnumSaleCurrentStatusType, ENU_PartialPaymentName, ENU_DateFormatName, FileType, ENU_PaymentGateway, EnumSaleTermsType, EnumSaleTermsOption, EnumActivityLogType, EnumSaleDetailType, EnumSalePaymentStatusType } from "@helper/config/app.enums";
import { Messages } from '@app/helper/config/app.messages';
import { SaleApi } from '@app/helper/config/app.webapi';
import { ENU_Permission_Module, ENU_Permission_Individual } from '@app/helper/config/app.module.page.enums';
import { Configurations } from '@app/helper/config/app.config';

@Component({
    selector: 'sale-history',
    templateUrl: './sale.history.component.html',
})


export class SaleHistoryComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Members
    @ViewChild('todayTaskRef') todayTaskRef: DateToDateFromComponent;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;

    allowedNumberKeysForNumberOnly = Configurations.AllowedNumberKeysForClassBooking;
    /***********Local*********/
    allowedPages = {
        Refund: false,
        WrittenOff: false,
        AmountRefunded: false,
    };

    dateFrom = new Date();
    dateTo = new Date();
    readonly DATE_FORMAT = "MM/dd/yyyy";
    dateFormat: string = "";
    dateTimeFormat: string = "";
    timeFormat: string = "";
    isDataExists: boolean;
    currencyFormat: string;
    isFromMember: boolean = true;
    isPOSHistory: boolean = false;
    personName: string = "";
    person: string;
    clearCustomerInput: string = "";
    balanceAmount: number = 0;
    hasAmountPaid: boolean = false;
    paymentStatus: string;
    hasAmountRefunded: boolean = false;
    index = 0;


    bySaleIDRefund: number = 0;
    bySaleIDPaid: number = 0;
    totalPaidAmout: number = 0;

    saleNumberPrefix: string = "";
    invoiceNumberPrefix: string = "";
    companyID: number;
    branchID: number;

    /***********Messages*********/
    messages = Messages;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    successMessage: string;
    errorMessage: string;
    isSearchByPageIndex: boolean = false;
    /***********Collection And Models*********/
    searchSaleHistory: SearchSaleHistory;
    searchSaleHistoryParams: SearchSaleHistory = new SearchSaleHistory();
    invoiceSaleHistory: InvoiceSaleHistory[] = [];
    invoiceHistoryDetail: InvoiceSaleHistory;
    saleHistory: SaleHistory[] = [];

    saleStatusTypeList: InvoiceFundamental[] = [];
    appSourceTypeList: InvoiceFundamental[] = [];

    personType: PersonType;
    searchPerson: FormControl = new FormControl();

    allPerson: AllPerson[];
    invocieHistory: InvoiceHistory;
    invocieHistoryMasterData: any[];

    enumSaleStatusType = EnumSaleStatusType;
    enumSalePaymentStatusType = EnumSalePaymentStatusType;
    enu_PartialPaymentName = ENU_PartialPaymentName;
    enu_PaymentGateway = ENU_PaymentGateway;
    enum_SaleCurrentStatusType = EnumSaleCurrentStatusType;

    fileType = FileType;
    enuSaleDetailType = EnumSaleDetailType;

    /*********** Reference*********/
    deleteDialogRef: any;
    customerIdSubscription: ISubscription;
    posSubscription: ISubscription;


    /***********Pagination And Sorting *********/
    sortOrder_ASC = Configurations.SortOrder_ASC;
    sortOrder_DESC = Configurations.SortOrder_DESC;
    sortOrder: string;

    dateToPlaceHolder: string = "Invoice Created Date";
    dateFromPlaceHolder: string = "Invoice Created Date";
    filter$: Observable<string>;

    // #endregion


    constructor(
        private _dataSharingService: DataSharingService,
        private _messagesService: MessageService,
        private _saleDialogue: MatDialogService,
        private _httpService: HttpService,
        private _commonService: CommonService,
        private _authService: AuthService,
        private _router: ActivatedRoute,
    ) {
        super();

        this.searchSaleHistory = new SearchSaleHistory();
        this.invocieHistory = new InvoiceHistory();
        this.sortOrder = this.sortOrder_ASC;
        this.searchSaleHistoryParams.SortOrder = this.sortOrder_DESC;

    }


    ngOnInit() {
        this.setPermissions();
        this.getCurrentBranchDetail();
        this.searchPerson.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" ) {
                    if (typeof (searchText) === "string") {
                        if(searchText.length > 2){
                        this._commonService.searchClient(searchText, 0)
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
                }
                else {
                    this.allPerson = [];
                    this.searchSaleHistory.CustomerID = "";
                }
            });

        this.getSearchFundamental();

    }

    ngAfterViewInit() {
        this.todayTaskRef.setEmptyDateFilter();
        this.getInvoiceInfo();
    }

    ngOnDestroy() {
        if (this.customerIdSubscription != undefined) {
            this.customerIdSubscription.unsubscribe();
        }
        if (this.posSubscription != undefined) {
            this.posSubscription.unsubscribe();
        }
        
    }

    // #region Events

    //check length for Invoice Number and Payment Number
    onNumberChange(val, event){
        setTimeout(() => {
            if(val == "INV"){
                if(event.toString() == "e"){
                    this.searchSaleHistory.SaleInvoiceNumber = null;
                }
                if (this.searchSaleHistory.SaleInvoiceNumber && this.searchSaleHistory.SaleInvoiceNumber.toString().length > 9) {
                    this.searchSaleHistory.SaleInvoiceNumber = this.searchSaleHistory.SaleInvoiceNumber.toString().substring(0, 9);
                }
            } else{
                if(event.toString() == "e"){
                    this.searchSaleHistory.SaleInvoicePaymentNumber = null;
                }
                if (this.searchSaleHistory.SaleInvoicePaymentNumber && this.searchSaleHistory.SaleInvoicePaymentNumber.toString().length > 9) {
                    this.searchSaleHistory.SaleInvoicePaymentNumber = this.searchSaleHistory.SaleInvoicePaymentNumber.toString().substring(0, 9);
                }
            }
        }, 100);
    }

    /**allow numeric keys for booking and prevents others*/
    preventCharactersForNumber(event: any) {
        //console.log(this.parentClassObj.ClassDurationInMinutes.toString())
        // let index = this.allowedNumberKeysForNumberOnly.findIndex(k => k == event.key);
        // if (index < 0) {
        //     event.preventDefault()
        // }
        //this.showErrorMessage = false;
    }

    reciviedDateTo($event) {
        this.searchSaleHistory.DateFrom = $event.DateFrom;
        this.searchSaleHistory.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.searchSaleHistory.DateFrom = date;
        this.todayTaskRef.validateDate();
    }

    onToDateChange(date: any) {
        this.searchSaleHistory.DateTo = date;
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getSaleHistory();
    }

    changeSorting(sortIndex: number) {
        this.searchSaleHistoryParams.SortIndex = sortIndex;
        this.searchSaleHistoryParams.SortOrder = this.searchSaleHistoryParams.SortOrder == this.sortOrder_DESC ? this.sortOrder_ASC : this.sortOrder_DESC;
        this.getSaleHistory()
    }

    onReset() {
        this.searchSaleHistoryParams = new SearchSaleHistory();
        this.searchSaleHistoryParams.SortOrder = this.sortOrder_DESC;
        this.todayTaskRef.setEmptyDateFilter();
        this.searchSaleHistory.SaleInvoiceNumber = "";
        this.searchSaleHistory.SaleInvoicePaymentNumber = "";
        this.searchSaleHistory.SaleStatusTypeID = 0;
        this.searchSaleHistory.AppSourceTypeID = 0;
        this.searchSaleHistory.InvoiceDueTerm = null;
        this.searchSaleHistory.SortOrder = this.sortOrder_DESC;
        this.appPagination.resetPagination();
        this.allPerson = [];
        if (this.isPOSHistory) {
            this.searchSaleHistory.CustomerID = "";
        }
        // this.searchPerson.setValue("");
        this.clearCustomerInput = "";
        this.getSaleHistory();
    }

    // #endregion

    // #region Action Popup

    // for open Activity Popup
    openDialogForActivityLog (saleItem: any) {

    const dialogRef = this._saleDialogue.open(ActivityLogComponent, {
        disableClose: true
      });

      dialogRef.componentInstance.saleID = saleItem.SaleID;
      dialogRef.componentInstance.dateFormat = this.dateFormat;
      dialogRef.componentInstance.logType = EnumActivityLogType.Invoice;

    }

    //for open Sale Detail popup
    onViewSaleDetail(saleItem: any, detailType) {
        this.onOpenDialog(saleItem, detailType);
    }

    onOpenDialog(sale: any, detailType) {
        var data = {
            SaleID: sale.SaleID,
            SaleInvoiceID: sale.SaleInvoiceID,
            detailType: detailType,
            SaleStatusID: sale.SaleStatusID
        }
        this._saleDialogue.open(SaleDetailComponent, {
            disableClose: true,
            data: data,
        });
    }

    // for download invoice in PDF
    onDownloadSaleDetail(saleItem: any) {
        var invoiceFileName: string = saleItem.CustomerName + "-Invoice";
        this._httpService.get(SaleApi.viewSaleDetail + saleItem.SaleID + "/" + this.fileType.PDF)
        .toPromise().then(data => {
            if (data && data.MessageCode > 0) {
                this._commonService.createPDF(data, invoiceFileName);
            }
            else {
                this._messagesService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error.replace('{0}', "PDF"));
            }
        });
    }

    // for open Writen off popup
    onOpenBadDebtDialog(saleDetail: any) {
        let data = {
            saleID: saleDetail.SaleID,
            balanceAmount: saleDetail.BalanceAmount,
            branchCurrencySymbol: this.currencyFormat
        }
        const dialogRef = this._saleDialogue.open(BadDebtComponent, {
            disableClose: true,
            data: data
        });

        dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getSaleHistory();
            }
        });

    }

    //for open void popup
    onOpenSaleVoidDialog(saleDetail: any) {


        let data = {
            saleID: saleDetail.SaleID,
            totalDueAmount: saleDetail.BalanceAmount,
            branchCurrencySymbol: this.currencyFormat
        }
        const dialogRef = this._saleDialogue.open(SaleVoidComponent, {
            disableClose: true,
            data: data
        });

        dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getSaleHistory();
            }
        });
    }

    // for partial payment poup
    onOpenPartialPaymentDialog(saleDetail: any) {

        let data = {
            saleID: saleDetail.SaleID,
            customerId: saleDetail.CustomerID
        }
        // let saleID = cellData.data.SaleID;
        const dialogRef = this._saleDialogue.open(SavePartialPaymentComponent, {
            disableClose: true,
            panelClass: 'pos-full-popup',
            data: data
        });

        dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getSaleHistory();
            }
        });
    }

    // for open refund payment popup
    onOpenRefundPaymentDialog(saleDetail: any) {

        var data = {
            SaleID: saleDetail.SaleID,
            SaleDetailID: null,
            StatusTypeID: saleDetail.StatusTypeID
        }

        const dialogRef = this._saleDialogue.open(RefundPaymentComponent, {
            disableClose: true,
            data: data
        });

        dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getSaleHistory();
            }
        });
    }


    // #endregion

    // #region Methods

    setPermissions() {
        this.allowedPages.Refund = this._authService.hasPagePermission(ENU_Permission_Module.Individual, ENU_Permission_Individual.Refund);
        this.allowedPages.WrittenOff = this._authService.hasPagePermission(ENU_Permission_Module.Individual, ENU_Permission_Individual.WrittenOff);
    }

    async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.dateTimeFormat =  this.dateFormat + " | " + this.timeFormat;

        this.getCompanyDetails();
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.branchID = branch.BranchID;
            this.currencyFormat = branch.CurrencySymbol
        }
    }
    async getCompanyDetails(){
        const company = await super.getCompanyDetail(this._dataSharingService);
        if (company) {
          this.companyID = company.CompanyID;
        }
    }
    onSearchSaleHistory() {
        this.searchSaleHistoryParams.CustomerID = this.searchSaleHistory.CustomerID;
        this.searchSaleHistoryParams.SaleInvoiceNumber = this.searchSaleHistory.SaleInvoiceNumber;
        this.searchSaleHistoryParams.SaleInvoicePaymentNumber = this.searchSaleHistory.SaleInvoicePaymentNumber;
        this.searchSaleHistoryParams.AppSourceTypeID = this.searchSaleHistory.AppSourceTypeID;
        this.searchSaleHistoryParams.SaleStatusTypeID = this.searchSaleHistory.SaleStatusTypeID;
        this.searchSaleHistoryParams.InvoiceDueTerm = this.searchSaleHistory.InvoiceDueTerm;
        this.searchSaleHistoryParams.DateFrom = this.searchSaleHistory.DateFrom ? this.searchSaleHistory.DateFrom : "",
            this.searchSaleHistoryParams.DateTo = this.searchSaleHistory.DateTo ? this.searchSaleHistory.DateTo : "",
            this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getSaleHistory();
    }

    getSaleHistory() {
        let params = {
            CustomerID: this.isPOSHistory ? this.searchSaleHistoryParams.CustomerID : this.searchSaleHistory.CustomerID,
            SaleInvoiceNumber: this.searchSaleHistoryParams.SaleInvoiceNumber ? String(this.searchSaleHistoryParams.SaleInvoiceNumber) : '',
            SaleInvoicePaymentNumber: this.searchSaleHistoryParams.SaleInvoicePaymentNumber ? String(this.searchSaleHistoryParams.SaleInvoicePaymentNumber) : '',
            AppSourceTypeID: (this.searchSaleHistoryParams.AppSourceTypeID == 0 || this.searchSaleHistoryParams.AppSourceTypeID == null) ? '' : this.searchSaleHistoryParams.AppSourceTypeID,
            SaleStatusTypeID: (this.searchSaleHistoryParams.SaleStatusTypeID == 0 || this.searchSaleHistoryParams.SaleStatusTypeID == null) ? '' : this.searchSaleHistoryParams.SaleStatusTypeID,
            DateFrom: this.searchSaleHistoryParams.DateFrom ? this.searchSaleHistoryParams.DateFrom : '',
            DateTo: this.searchSaleHistoryParams.DateTo ? this.searchSaleHistoryParams.DateTo : '',
            InvoiceDueTerm : this.searchSaleHistoryParams.InvoiceDueTerm == null || this.searchSaleHistoryParams.InvoiceDueTerm == "null" ? '' : this.searchSaleHistoryParams.InvoiceDueTerm,
            PageNumber: this.appPagination.pageNumber,
            PageSize: this.appPagination.pageSize,
            SortOrder: this.searchSaleHistoryParams.SortOrder,
        }

        this._httpService.get(SaleApi.getSaleHistory, params)
            .subscribe(data => {
                if (data && data.MessageCode > 0) {
                    this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                    //console.log(data.Result);
                    if (this.isDataExists) {
                        this.index = 0;
                        this.appPagination.totalRecords = data.TotalRecord;
                        let invocieHistory = [];
                        this.invoiceSaleHistory = [];
                        invocieHistory = data.Result;
                        this.invocieHistoryMasterData = data.Result;

                        var flags = [], output = [], l = invocieHistory.length, i;
                        for (i = 0; i < l; i++) {
                            if (flags[invocieHistory[i].SaleID]) continue;
                            flags[invocieHistory[i].SaleID] = true;
                            output.push(invocieHistory[i].SaleID);
                        }

                        output.forEach((saleId) => {

                            this.index = this.index + 1;
                            let invoiceMasterInfo = invocieHistory.find(e => e.SaleID == saleId && e.ReferenceNumber.includes("INV"));
                            this.invoiceHistoryDetail = new InvoiceSaleHistory();
                            this.invoiceHistoryDetail.Adjustment = invoiceMasterInfo.Adjustment;
                            this.invoiceHistoryDetail.AppSourceTypeName = invoiceMasterInfo.AppSourceTypeName;
                            this.invoiceHistoryDetail.CreationDate = invoiceMasterInfo.CreationDate;
                            this.invoiceHistoryDetail.CurrencySymbol = invoiceMasterInfo.CurrencySymbol;
                            this.invoiceHistoryDetail.CustomerID = invoiceMasterInfo.CustomerID;
                            this.invoiceHistoryDetail.CustomerName = invoiceMasterInfo.CustomerName;
                            this.invoiceHistoryDetail.InvoiceDueDate = invoiceMasterInfo.InvoiceDueDate;
                            this.invoiceHistoryDetail.IsOverDue = invoiceMasterInfo.IsOverDue;
                            this.invoiceHistoryDetail.PaymentMethod = invoiceMasterInfo.PaymentMethod;
                            this.invoiceHistoryDetail.PaymentMethodID = invoiceMasterInfo.PaymentMethodID;
                            this.invoiceHistoryDetail.ReferenceNumber = invoiceMasterInfo.ReferenceNumber;
                            this.invoiceHistoryDetail.SaleID = invoiceMasterInfo.SaleID;
                            this.invoiceHistoryDetail.SaleInvoicePaymentID = invoiceMasterInfo.SaleInvoicePaymentID;
                            this.invoiceHistoryDetail.StatusTypeID = invoiceMasterInfo.StatusTypeID;
                            this.invoiceHistoryDetail.StatusTypeName = invoiceMasterInfo.StatusTypeName;

                            this.invoiceHistoryDetail.BalanceAmount = invoiceMasterInfo.BalanceAmount;
                            this.invoiceHistoryDetail.TotalDue = invoiceMasterInfo.TotalDue;
                            this.invoiceHistoryDetail.TotalPaid = invoiceMasterInfo.TotalPaid;
                            this.invoiceHistoryDetail.IsSaleLogsExist = invoiceMasterInfo.IsSaleLogsExist;

                            this.invoiceSaleHistory.push(this.invoiceHistoryDetail);

                            var invoiceDetail: any
                            invoiceDetail = invocieHistory.filter(e =>  e.SaleID == invoiceMasterInfo.SaleID && !e.ReferenceNumber.includes("INV"));
                            if(invoiceDetail){
                                this.setInvoiceDetail(invoiceDetail);
                            }

                            //this.invoiceHistoryDetail.InvoiceSaleDetail.sort((a, b) => (a > b ? -1 : 1))

                        });
                    }
                    else {
                        this.appPagination.totalRecords = 0;
                        this.saleHistory = null;
                        this.invoiceSaleHistory = null;
                    }
                }
                else { this._messagesService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Sale.")); }
            },
                error => { this._messagesService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Sale.")); });
    }

    setInvoiceDetail(invocieDetail: any) {
        if (invocieDetail) {

            invocieDetail.forEach(element => {

                let invoiceSaleHistoryDetail = new InvoiceSaleHistoryDetail();
                invoiceSaleHistoryDetail.SaleInvoiceID = element.SaleInvoiceID;
                invoiceSaleHistoryDetail.CreationDate = element.CreationDate;
                invoiceSaleHistoryDetail.ReferenceNumber = element.ReferenceNumber;
                invoiceSaleHistoryDetail.TotalPaid = element.TotalPaid;
                invoiceSaleHistoryDetail.Adjustment = element.Adjustment;
                invoiceSaleHistoryDetail.Adjustment = element.Adjustment;
                invoiceSaleHistoryDetail.StatusTypeName = element.StatusTypeName;
                invoiceSaleHistoryDetail.StatusTypeID = element.StatusTypeID;
                invoiceSaleHistoryDetail.PaymentMethodID = element.PaymentMethodID;
                invoiceSaleHistoryDetail.PaymentMethod = element.PaymentMethod;

                this.invoiceHistoryDetail.InvoiceSaleDetail.push(invoiceSaleHistoryDetail);

            });
        }
    }

    getInvoiceInfo() {
        this.posSubscription = this._dataSharingService.invoiceHistory.subscribe(posInvoiceHistory => {
            this.isPOSHistory = posInvoiceHistory.POSHistory;
            this.searchSaleHistory.CustomerID = posInvoiceHistory.CustomerID.toString();
            this.getQueryParams();
        });
    }

    getQueryParams(){
        this._router.queryParams.subscribe(qparams => {
            if(qparams && qparams['saleNo']) {
              this.searchSaleHistoryParams.SaleInvoiceNumber = qparams['saleNo'];
              this.searchSaleHistory.SaleInvoiceNumber = qparams['saleNo'];
              this.getSaleHistory();
            }
            else{
                this.getSaleHistory();
            }
          });
    }

    getSearchFundamental() {
        this._httpService.get(SaleApi.getInvoiceFundamental)
            .toPromise().then(data => {
                if (data && data.MessageCode > 0) {
                    // this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                    // if (this.isDataExists) {
                       
                        this.saleStatusTypeList = data.Result.SaleStatusType;
                        this.appSourceTypeList = data.Result.AppSourceType;
                    // }
                    // else {
                    //     this.saleStatusTypeList = [];
                    //     this.appSourceTypeList = [];
                    // }
                }
                else {
                    this._messagesService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error.replace('{0}', "Inovice."));
                }
            });
    }

    getSelectedClient(person: AllPerson) {
        this.searchSaleHistory.CustomerID = person.CustomerID.toString();
    }

    displayClientName(user?: AllPerson): string | undefined {
        return user ? user.FirstName + ' ' + user.LastName : undefined;
    }

    // #endregion

    /* Select terms for invoice dropdown options*/
    termsTypeList = [
        {InvoiceDueTerm: EnumSaleTermsType.SelectTerm, InvoiceDueTermName: EnumSaleTermsOption.SelectTerm},
        {InvoiceDueTerm: EnumSaleTermsType.OverDue , InvoiceDueTermName: EnumSaleTermsOption.OverDue},
        {InvoiceDueTerm: EnumSaleTermsType.Next7Days, InvoiceDueTermName: EnumSaleTermsOption.Next7Days},
        {InvoiceDueTerm: EnumSaleTermsType.Next14Days, InvoiceDueTermName: EnumSaleTermsOption.Next14Days},
        {InvoiceDueTerm: EnumSaleTermsType.Next30Days, InvoiceDueTermName: EnumSaleTermsOption.Next30Days}
    ];

}
