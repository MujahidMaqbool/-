import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from "@angular/core";

/************************* Services & Models ***********************************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DataSharingService } from "src/app/services/data.sharing.service";
import { MessageService } from "src/app/services/app.message.service";

/* Models */
import { ClientDashboardSearchParam, ITopServices, ITopEmployeeServices, ISalesBreakDownServices, ISalesbyChannel, IMonthlySales, IMonthlyVisits, IServicesandAttendanceBooking, INewvsReturningClient, IClientVisits } from 'src/app/customer/client/models/client.dashboard.model';
import { ApiResponse } from "src/app/models/common.model";

/**********************  Configurations *********************/
import { ClientApi } from 'src/app/helper/config/app.webapi';
import { Messages } from "src/app/helper/config/app.messages";
import { CustomerType, ENU_DateFormatName } from "src/app/helper/config/app.enums";
import { MatDatepicker } from "@angular/material/datepicker";
import { Configurations } from "src/app/helper/config/app.config";

/**********************  Components *********************/
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { DateToDateFromComponent } from "src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component";

@Component({
    selector: 'client-dashboard',
    templateUrl: './client.dashboard.component.html'
})
export class ClientDashboardComponent extends AbstractGenericComponent implements OnInit,AfterViewInit {

    @ViewChild('datePickerElement') _input: ElementRef;
    @ViewChild('fromToDateComoRef') fromToDateComoRef: DateToDateFromComponent;
    @ViewChild('fromToDateHighRef') fromToDateHighRef: DateToDateFromComponent;


    DataChangeDashboard = {
        ClientVisits: 1,
        ServicesBookedandCompleted: 2,
        NewvsReturningClient: 3,
        TopServices: 4,
        TopEmployeesforServices: 5,
        SalesbyPaymentMethod: 7,
        SalesBreakdown: 8
    };

    // #region Local Members

    // ************* Local ****************
    ItemType = Configurations.ItemTypeOnReport
    currentDate: Date = new Date();
    maxDate: Date = new Date();
    topServicesDate: Date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    topEmployesforServicesDate: Date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    salesbyChannelDate: Date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);


    isTopServicesDataExists: boolean = false;
    isTopEmployeeServicesDataExists: boolean = false;
    isSalesBreakDownDataExists: boolean = false;
    isTopSalesDataExists: boolean = false;
    isClientVisitsExists: boolean = false;
    isServicesandAttendanceExists: boolean = false;
    isNewvsReturningExists: boolean = false;
    isMonthlySalesExists: boolean = false;
    dateFormatforBooked: string = ""; //'EEE MMM d y';
    dateFormatforReturingClient: string = ""; //'MMM d y';
    dateFormat: string = 'yyyy-MM-dd';
    currencyFormat: string;


    /***********Messages*********/
    messages = Messages;
    // ************* Model and Collection ****************
    iNewvsReturningClient: INewvsReturningClient[] = [];
    iTopServices: ITopServices[] = [];
    iTopEmployeeServices: ITopEmployeeServices[] = [];
    iSalesBreakDownServices: ISalesBreakDownServices[] = [];
    iSalesbyChannel: ISalesbyChannel[] = [];
    iMonthlySales: IMonthlySales[] = [];
    iMonthlyVisits: IMonthlyVisits[] = [];
    iServicesandAttendanceBooking: IServicesandAttendanceBooking[] = [];
    clientDashboardSearchParam = new ClientDashboardSearchParam();
    // #endregion

    constructor(private _dateTimeService: DateTimeService,
        private _httpService: HttpService,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService) {
            super();

    }

    ngOnInit() {
        this.getCurrentBranchDetail();

    }

    ngAfterViewInit(){

    }



    // #region Events

    // onFromDateChange(date: Date) {
    //     this.clientDashboardSearchParam.DateFrom = this._dateTimeService.convertDateObjToString(date, this.dateFormat); // 07/05/2018 MM/dd/yyyy
    // }

    // onToDateChange(date: Date) {
    //     this.clientDashboardSearchParam.DateTo = this._dateTimeService.convertDateObjToString(date, this.dateFormat); // 07/05/2018  MM/dd/yyyy
    // }

    onTopServicesDateChange() {
        this.getTopServicesByDate();
    }

    onTopEmployessServicesDateChange() {
        this.getTopEmployeeServicesByDate();
    }

    onTopSalesByChanelDateChange() {
        this.getTopSalesChannelByDate();
    }

    onNewvsReturningDateChange() {
        this.getNewvsReturningClient();
    }

    onBookedServicesDateChange() {
        this.getBookedServicesByDate();
    }
    onMonthlyVisitsDateChange() {
        this.getMonthlyVisitsByDate();
    }

    onSalesBraekDownDateChange() {
        this.getSalesBreakDownByDate();
    }

    onDateChange($event, dashboardID: number) {

        if ($event != undefined) {
            this.clientDashboardSearchParam.DateFrom = $event.DateFrom;
            this.clientDashboardSearchParam.DateTo = $event.DateTo;
        }

        switch (dashboardID) {
            case this.DataChangeDashboard.ClientVisits:
                this.onMonthlyVisitsDateChange();
                break;
            case this.DataChangeDashboard.NewvsReturningClient:
                this.onNewvsReturningDateChange();
                break;
            case this.DataChangeDashboard.ServicesBookedandCompleted:
                this.onBookedServicesDateChange();
                break;
            case this.DataChangeDashboard.TopServices:
                this.clientDashboardSearchParam.DateFrom = this._dateTimeService.convertDateObjToString($event.DateFrom, this.dateFormat);
                this.clientDashboardSearchParam.DateTo = this._dateTimeService.convertDateObjToString($event.DateTo, this.dateFormat);
                this.onTopServicesDateChange();
                this.onTopEmployessServicesDateChange();
                this.onTopSalesByChanelDateChange();
                break;
            case this.DataChangeDashboard.SalesBreakdown:
                this.clientDashboardSearchParam.DateFrom = this._dateTimeService.convertDateObjToString($event.DateFrom, this.dateFormat);
                this.clientDashboardSearchParam.DateTo = this._dateTimeService.convertDateObjToString($event.DateTo, this.dateFormat);
                this.onSalesBraekDownDateChange();
                break;
            // case this.DataChangeDashboard.SalesbyPaymentMethod:
            //     this.clientDashboardSearchParam.DateFrom = this._dateTimeService.convertDateObjToString($event, this.dateFormat);
            //     this.onTopSalesByChanelDateChange();
            //     break;

        }
    }


    onOpenCalendar(picker: MatDatepicker<Date>) {
        picker.open();
        setTimeout(() => this._input.nativeElement.focus());
    }




    // #endregion

    // #region Methods

    async getCurrentBranchDetail() {
        this.dateFormatforBooked = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormatforBooked);
        this.dateFormatforReturingClient = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormatforReturingClient);
        let branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }

        this.clientDashboardSearchParam.DateFrom = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormat);
        this.clientDashboardSearchParam.DateTo = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormat);
        this.clientDashboardSearchParam.itemTypeID = 0;

        this.getMonthlySalesByDate();
        this.onMonthlyVisitsDateChange();
        this.onBookedServicesDateChange();
        this.onNewvsReturningDateChange();
        this.onTopServicesDateChange();
        this.onTopEmployessServicesDateChange();
        this.onTopSalesByChanelDateChange();
        this.onSalesBraekDownDateChange();
    }

    getTopServicesByDate() {
        let params = {
            fromDate: this.clientDashboardSearchParam.DateFrom,
            toDate: this.clientDashboardSearchParam.DateTo
        }

        this._httpService.get(ClientApi.getTopServicesByDate, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isTopServicesDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isTopServicesDataExists) {
                        this.iTopServices = response.Result;
                    }
                    else {
                        this.iTopServices = [];
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Top Services"));
                }
            );
    }

    getTopEmployeeServicesByDate() {
        let params = {
            fromDate: this.clientDashboardSearchParam.DateFrom,
            toDate: this.clientDashboardSearchParam.DateTo
        }

        this._httpService.get(ClientApi.getEmployeeTopServicesByDate, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isTopEmployeeServicesDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isTopEmployeeServicesDataExists) {
                        this.iTopEmployeeServices = response.Result;
                    }
                    else {
                        this.iTopEmployeeServices = [];
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Employee Top Services"));
                });
    }

    getSalesBreakDownByDate() {
        let params = {
            itemTypeID: this.clientDashboardSearchParam.itemTypeID,
            customerTypeID: CustomerType.Client.toString(),
            fromDate: this.clientDashboardSearchParam.DateFrom,
            toDate: this.clientDashboardSearchParam.DateTo
        }

        this._httpService.get(ClientApi.getSalesBreakDownByDate, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isSalesBreakDownDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isSalesBreakDownDataExists) {
                        this.iSalesBreakDownServices = response.Result;
                        this.iSalesBreakDownServices.forEach(element => {
                            if (element.Class == 0) {
                                element.Class = null;
                            }
                            if (element.Product == 0) {
                                element.Product = null;
                            }
                            if (element.Service == 0) {
                                element.Service = null;
                            }
                        });

                    }
                    else {
                        this.iSalesBreakDownServices = [];
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Employee Top Services"));
                });
    }

    getTopSalesChannelByDate() {
        let params = {
            fromDate: this.clientDashboardSearchParam.DateFrom,
            toDate: this.clientDashboardSearchParam.DateTo
        }

        this._httpService.get(ClientApi.getTopSalesByChannelByDate, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isTopSalesDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isTopSalesDataExists) {
                        this.iSalesbyChannel = response.Result;
                    }
                    else {
                        this.iSalesbyChannel = [];
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Sale by Payment Method"));
                });
    }

    getMonthlySalesByDate() {
        var url = ClientApi.getMonthlySalesByDate.replace("{customerTypeID}", CustomerType.Client.toString())
        this._httpService.get(url)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isMonthlySalesExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (response.Result != null && response.Result.length > 0) {
                        this.iMonthlySales = response.Result;
                    }
                    else {
                        this.iMonthlySales = [];
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Monthly Sales"));
                });
    }

    getMonthlyVisitsByDate() {
        let params = {
            fromDate: this.clientDashboardSearchParam.DateFrom,
            toDate: this.clientDashboardSearchParam.DateTo,
            customerTypeID: 1
        }
        if (this._dateTimeService.compareTwoDates(new Date(this.clientDashboardSearchParam.DateFrom), new Date(this.clientDashboardSearchParam.DateFrom))) {
            this._httpService.get(ClientApi.getMonthlyVisitsByDate, params)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.isClientVisitsExists = response.Result != null && response.Result.length ? true : false;
                        if (this.isClientVisitsExists) {
                            this.iMonthlyVisits = response.Result;
                            this.setClientVisitsDate();
                        }
                        else {
                            this.iMonthlyVisits = [];
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Monthly Visits"));
                    });
        }

        else {
            this._messageService.showErrorMessage(this.messages.Error.Invalid_FromDate);
        }
    }

    getBookedServicesByDate() {
        let params = {
            personTypeID: CustomerType.Client,
            fromDate: this.clientDashboardSearchParam.DateFrom,
            toDate: this.clientDashboardSearchParam.DateTo,
            customerTypeID: CustomerType.Client
        }
        if (this._dateTimeService.compareTwoDates(new Date(this.clientDashboardSearchParam.DateFrom), new Date(this.clientDashboardSearchParam.DateTo))) {
            this._httpService.get(ClientApi.getBookedServicesByDate, params)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.isServicesandAttendanceExists = response.Result != null && response.Result.length ? true : false
                        if (this.isServicesandAttendanceExists) {
                            this.iServicesandAttendanceBooking = response.Result;
                            this.setBookingDate();
                        }

                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Booked Services"));
                    });
        }

        else {
            this._messageService.showErrorMessage(this.messages.Error.Invalid_FromDate);
        }
    }


    getNewvsReturningClient() {
        let params = {
            personTypeID: CustomerType.Client,
            fromDate: this.clientDashboardSearchParam.DateFrom,
            toDate: this.clientDashboardSearchParam.DateTo
        }
        if (this._dateTimeService.compareTwoDates(new Date(this.clientDashboardSearchParam.DateFrom), new Date(this.clientDashboardSearchParam.DateTo))) {
            this._httpService.get(ClientApi.getnewvsReturningClient, params)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.isNewvsReturningExists = response.Result != null && response.Result.length ? true : false;
                        if (this.isNewvsReturningExists) {
                            this.iNewvsReturningClient = response.Result;
                            this.setReturningDate();
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "New vs Returning"));
                    });
        }

        else {
            this._messageService.showErrorMessage(this.messages.Error.Invalid_FromDate);
        }
    }

    setReturningDate() {
        this.iNewvsReturningClient.forEach(element => {
            element.Date = this._dateTimeService.convertDateObjToString(new Date(element.Date), this.dateFormatforReturingClient);
        });
    }

    setClientVisitsDate() {
        this.iMonthlyVisits.forEach(element => {
            element.Date = this._dateTimeService.convertDateObjToString(new Date(element.Date), this.dateFormatforBooked);
        });
    }

    setBookingDate() {
        this.iServicesandAttendanceBooking.forEach(element => {
            element.Date = this._dateTimeService.convertDateObjToString(new Date(element.Date), this.dateFormatforBooked);
        });
    }

    clientVisits: IClientVisits[] = [
        { value: "TotalClient", name: "Client Visits" }
    ];

    monthlySalecustomizeTooltip(arg: any) {
        return {
            text: 'Total Sales : ' + arg.valueText
        };
    }
    BreakDowncustomizeTooltip(arg: any) {
        return {
            text: arg.seriesName + ' : ' + arg.valueText
        };
    }
    clientVisitsCustomizeTooltip(arg: any) {
        return {
            text: ' Total ' + arg.seriesName + ' : ' + arg.valueText
        };
    }

    newVsReturningCustomizeTooltip(arg: any) {
        return {
            text: arg.seriesName + ' : ' + arg.valueText
        };
    }

    monthlySalescustomizePoint(arg: any) {
        return {
            text: arg.seriesName + ' : ' + arg.valueText
        }
    }
    // #endregion



}
