/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/internal/operators';

/********************** Services & Models *********************/
/* Models */
import { LeadReportsSearchParameter } from '@reports/models/lead.reports.model';
import { AllPerson, ApiResponse } from '@models/common.model';
/* Services */
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { DateTimeService } from '@services/date.time.service';
import { CommonService } from "@app/services/common.service";
/**********************  Common *********************/
import { Messages } from '@helper/config/app.messages';
import { LeadApi, CustomerApi } from '@helper/config/app.webapi';
import { PersonType, CustomerType, FileType, ReportName, EnquirySourceType } from '@app/helper/config/app.enums';

/********************** Configurations *********************/
import { Configurations } from '@app/helper/config/app.config';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { AuthService } from '@app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Report } from '@app/helper/config/app.module.page.enums';
import { AllSaleHistoryReportComponent } from '../common/all.sale.history.report/all.sale.history.report.component';
import { AllSaleBookedDetailReportComponent } from '../common/all.sale.booked.detail.report/all.sale.booked.detail.report.component';

@Component({
    selector: 'lead-report',
    templateUrl: './lead.reports.component.html'
})


export class LeadReportsComponent implements OnInit {

    allowedPages = {
        AllLeadReport: false,
        LeadActivitiesReport: false,
        LeadBySourceReport: false,
        LeadLostReport: false,
        AllBookedDetailReport: false,
        AllSaleDetailReport: false
    };


    @ViewChild('allLeadToFromDateComoRef') allLeadToFromDateComoRef: DateToDateFromComponent;
    @ViewChild('allLeadActivtiesToFromDateComoRef') allLeadActivtiesToFromDateComoRef: DateToDateFromComponent;
    @ViewChild('allLeadBySourceToFromDateComoRef') allLeadBySourceToFromDateComoRef: DateToDateFromComponent;
    @ViewChild('allLeadLostToFromDateComoRef') allLeadLostToFromDateComoRef: DateToDateFromComponent;
    @ViewChild('customerSearch_LeadAllSaleHistoryRef') customerSearch_LeadAllSaleHistoryRef: AllSaleHistoryReportComponent;
    @ViewChild('customerSearch_LeadAllSaleDetailByInvoiceRef') customerSearch_LeadAllSaleDetailByInvoiceRef: AllSaleBookedDetailReportComponent;

    // #region Local Members

    /***********Local*********/
    dateFrom: Date;
    dateTo: Date;
    leadActivitiesdateFrom: Date;
    leadActivitiesdateTo: Date;
    leadBySourcedateFrom: Date;
    leadBySourcedateTo: Date;
    lostReasonDateFrom: Date;
    lostReasonDateTo: Date;

    maxDate: Date = new Date();
    dateFormat: string = 'yyyy-MM-dd';
    personName: string = "";
    person: string;
    customerName: string = '';
    leadCustomerName: string = '';
    currentDate: Date = new Date();
    /***********Messages*********/
    messages = Messages;

    /***********Collection And Models*********/
    membershipList: any[];
    leadStatusTypeList: any[];
    staffList: any[];
    enquirySourceTypeList: any;
    lostReasonTypeList: any;
    allPerson: AllPerson[];
    leadReportsSearchParameterObj = new LeadReportsSearchParameter();
    searchPerson: FormControl = new FormControl();
    fileType = FileType;
    reportName = ReportName;
    enquirySourceType = EnquirySourceType;
    CustomerTypeID = CustomerType.Lead;
    /* Configurations */
    activityList = Configurations.LeadActivitiesForReports;

    // #endregion

    constructor(
        private _dateTimeService: DateTimeService,
        private _httpService: HttpService,
        private _commonService: CommonService,
        private _messageService: MessageService,
        private _authService: AuthService
    ) {
        this.getBranchSetting();
        this.person = CustomerType.Lead.toString();
    }

    ngOnInit() {
        this.setPermissions();
        this.leadSearchFundamentals();
        this.searchPerson.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {
                    if (typeof (searchText) === "string") {
                        this._commonService.searchClient(searchText, CustomerType.Lead)
                            .subscribe(response => {
                                if (response.Result != null && response.Result.length) {
                                    this.allPerson = response.Result;
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

    }

    ngAfterViewInit() {
        this.customerSearch_LeadAllSaleDetailByInvoiceRef.setPlaceHolder();
        this.customerSearch_LeadAllSaleHistoryRef.setPlaceHolder(CustomerType.Lead);
    }
    // #region Events

    onToDateChange(date: Date) {
        this.leadReportsSearchParameterObj.DateTo = this.getDateString(date, this.dateFormat); // 07/05/2018  MM/dd/yyyy
    }

    onFromDateChange(date: Date) {
        this.leadReportsSearchParameterObj.DateFrom = this.getDateString(date, this.dateFormat); // 07/05/2018 MM/dd/yyyy
    }

    onClearDate() {
        this.leadReportsSearchParameterObj.CustomerID = 0;
        this.leadCustomerName = '';
        this.customerName = '';
        this.leadReportsSearchParameterObj.CustomerName = "";
    }

    // #endregion

    // #region Methods

    async getBranchSetting() {
        this.currentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

        this.leadReportsSearchParameterObj.DateFrom = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat),
            this.leadReportsSearchParameterObj.DateTo = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat)
    }

    leadSearchFundamentals() {
        this._httpService.get(LeadApi.searchFundamentals)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.membershipList = response.Result.MembershipList;
                    this.leadStatusTypeList = response.Result.LeadStatusTypeList;
                    this.staffList = response.Result.StaffList;
                    this.enquirySourceTypeList = response.Result.EnquirySourceTypeList;
                    this.lostReasonTypeList = response.Result.LostReasonList;
                    this.setDropdownDefaultValue();
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
            );
    }

    // #region AllLeadReports

    exportAllLeadReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            customerName: this.leadReportsSearchParameterObj.CustomerName,
            membershipID: this.leadReportsSearchParameterObj.MembershipID == 0 ? null : this.leadReportsSearchParameterObj.MembershipID,
            assignedToStaffID: this.leadReportsSearchParameterObj.AssignedToStaffID == 0 ? null : this.leadReportsSearchParameterObj.AssignedToStaffID,
            dateFrom: this.leadReportsSearchParameterObj.DateFrom,
            dateTo: this.leadReportsSearchParameterObj.DateTo,
            leadStatusTypeID: this.leadReportsSearchParameterObj.LeadStatusTypeID == 0 ? null : this.leadReportsSearchParameterObj.LeadStatusTypeID,
        }
        this._httpService.get(LeadApi.getAllLeadreport, params).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (fileType == this.fileType.PDF) {
                        this._commonService.createPDF(response, this.reportName.AllLead);
                    }
                    if (fileType == this.fileType.Excel) {
                        this._commonService.createExcel(response, this.reportName.AllLead);
                    };
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }

            })
    }

    viewAllLeadReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            customerName: this.leadReportsSearchParameterObj.CustomerName,
            membershipID: this.leadReportsSearchParameterObj.MembershipID == 0 ? null : this.leadReportsSearchParameterObj.MembershipID,
            assignedToStaffID: this.leadReportsSearchParameterObj.AssignedToStaffID == 0 ? null : this.leadReportsSearchParameterObj.AssignedToStaffID,
            dateFrom: this.leadReportsSearchParameterObj.DateFrom,
            dateTo: this.leadReportsSearchParameterObj.DateTo,
            leadStatusTypeID: this.leadReportsSearchParameterObj.LeadStatusTypeID == 0 ? null : this.leadReportsSearchParameterObj.LeadStatusTypeID,
        }
        this._httpService.get(LeadApi.getAllLeadreport, params)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this._commonService.viewPDFReport(response)
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                })
    }

    resetAllLeadReportFilters() {
        this.leadReportsSearchParameterObj.CustomerName = "";
        this.leadReportsSearchParameterObj.MembershipID = 0;
        this.leadReportsSearchParameterObj.LeadStatusTypeID = 0;
        this.leadReportsSearchParameterObj.DateFrom = "";
        this.leadReportsSearchParameterObj.DateTo = "";
        this.leadReportsSearchParameterObj.AssignedToStaffID = 0;
        this.customerName = '';
        this.resetDateToFrom();
        this.allLeadToFromDateComoRef.resetDateFilter();
    }

    // #endregion

    // #region LeadActivityReports

    exportAllLeadActivitiesReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            customerID: this.leadReportsSearchParameterObj.CustomerID == 0 ? null : this.leadReportsSearchParameterObj.CustomerID,
            activityTypeID: this.leadReportsSearchParameterObj.ActivityTypeID == 0 ? null : this.leadReportsSearchParameterObj.ActivityTypeID,
            dateFrom: this.leadReportsSearchParameterObj.DateFrom,
            dateTo: this.leadReportsSearchParameterObj.DateTo
        }
        // if (!this.leadReportsSearchParameterObj.CustomerID || this.leadReportsSearchParameterObj.CustomerID == 0) {
        //     this._messageService.showErrorMessage(this.messages.Validation.Search_Customer.replace("{0}", "Lead"));
        // } else {

            this._httpService.get(LeadApi.getAllLeadActivitiesReport, params).subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (fileType == this.fileType.PDF) {
                            this._commonService.createPDF(response, this.reportName.LeadActivties);
                        }
                        if (fileType == this.fileType.Excel) {
                            this._commonService.createExcel(response, this.reportName.LeadActivties);
                        };
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                })
        //}
    }

    viewExportAllLeadActivitiesReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            customerID: this.leadReportsSearchParameterObj.CustomerID == 0 ? null : this.leadReportsSearchParameterObj.CustomerID,
            activityTypeID: this.leadReportsSearchParameterObj.ActivityTypeID == 0 ? null : this.leadReportsSearchParameterObj.ActivityTypeID,
            dateFrom: this.leadReportsSearchParameterObj.DateFrom,
            dateTo: this.leadReportsSearchParameterObj.DateTo
        }
        // if (!this.leadReportsSearchParameterObj.CustomerID || this.leadReportsSearchParameterObj.CustomerID == 0) {
        //     this._messageService.showErrorMessage(this.messages.Validation.Search_Customer.replace("{0}", "Lead"));
        // } else 
        // {
            this._httpService.get(LeadApi.getAllLeadActivitiesReport, params)
                .subscribe(
                    (response: ApiResponse) => {
                        if (response && response.MessageCode > 0) {
                            this._commonService.viewPDFReport(response);
                        }
                        else {
                            this._messageService.showErrorMessage(response.MessageText);
                        }
                    });
        // }
    }

    resetLeadActivitiesFilters() {
        this.leadReportsSearchParameterObj.CustomerName = "";
        this.leadReportsSearchParameterObj.ActivityTypeID = 0;
        this.leadReportsSearchParameterObj.DateTo = "";
        this.leadReportsSearchParameterObj.DateFrom = "";
        this.leadCustomerName = '';
        this.resetDateToFrom();
        this.allLeadActivtiesToFromDateComoRef.resetDateFilter();
    }

    // #endregion



    // #endregion

    // #region LeadBySourceReports

    exportAllLeadBySourceReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            membershipID: this.leadReportsSearchParameterObj.MembershipID == 0 ? null : this.leadReportsSearchParameterObj.MembershipID,
            assignedToStaffID: this.leadReportsSearchParameterObj.AssignedToStaffID == 0 ? null : this.leadReportsSearchParameterObj.AssignedToStaffID,
            dateFrom: this.leadReportsSearchParameterObj.DateFrom,
            dateTo: this.leadReportsSearchParameterObj.DateTo,
            enquirySourceTypeID: this.leadReportsSearchParameterObj.EnquirySourceTypeID == 0 ? null : this.leadReportsSearchParameterObj.EnquirySourceTypeID
        }
        this._httpService.get(LeadApi.getAllLeadBySourceReport, params).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (fileType == this.fileType.PDF) {
                        this._commonService.createPDF(response, this.reportName.AllLeadBySource);
                    }
                    if (fileType == this.fileType.Excel) {
                        this._commonService.createExcel(response, this.reportName.AllLeadBySource);
                    };
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            });
    }

    viewAllLeadBySourceReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            membershipID: this.leadReportsSearchParameterObj.MembershipID == 0 ? null : this.leadReportsSearchParameterObj.MembershipID,
            assignedToStaffID: this.leadReportsSearchParameterObj.AssignedToStaffID == 0 ? null : this.leadReportsSearchParameterObj.AssignedToStaffID,
            dateFrom: this.leadReportsSearchParameterObj.DateFrom,
            dateTo: this.leadReportsSearchParameterObj.DateTo,
            enquirySourceTypeID: this.leadReportsSearchParameterObj.EnquirySourceTypeID == 0 ? null : this.leadReportsSearchParameterObj.EnquirySourceTypeID,
        }
        this._httpService.get(LeadApi.getAllLeadBySourceReport, params)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this._commonService.viewPDFReport(response);
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                });
    }

    resetLeadBySourceFilters() {
        this.leadReportsSearchParameterObj.DateTo = "";
        this.leadReportsSearchParameterObj.DateFrom = "";
        this.leadReportsSearchParameterObj.EnquirySourceTypeID = 0;
        this.leadReportsSearchParameterObj.AssignedToStaffID = 0;
        this.leadReportsSearchParameterObj.MembershipID = 0;

        this.resetDateToFrom();
        this.allLeadBySourceToFromDateComoRef.resetDateFilter();
    }

    // #endregion


    // #region LeadLostReports

    exportAllLeadLostReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            dateFrom: this.leadReportsSearchParameterObj.DateFrom,
            dateTo: this.leadReportsSearchParameterObj.DateTo,
            lostReasonTypeID: this.leadReportsSearchParameterObj.LostReasonTypeID == 0 ? null : this.leadReportsSearchParameterObj.LostReasonTypeID
        }
        this._httpService.get(LeadApi.getAllLeadLostReport, params).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (fileType == this.fileType.PDF) {
                        this._commonService.createPDF(response, this.reportName.LeadLost);
                    }
                    if (fileType == this.fileType.Excel) {
                        this._commonService.createExcel(response, this.reportName.LeadLost);
                    };
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            });
    }

    viewAllLeadLostReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            dateFrom: this.leadReportsSearchParameterObj.DateFrom,
            dateTo: this.leadReportsSearchParameterObj.DateTo,
            lostReasonTypeID: this.leadReportsSearchParameterObj.LostReasonTypeID == 0 ? null : this.leadReportsSearchParameterObj.LostReasonTypeID
        }
        this._httpService.get(LeadApi.getAllLeadLostReport, params)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this._commonService.viewPDFReport(response);
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                });
    }

    resetLeadLostFilters() {
        this.leadReportsSearchParameterObj.LostReasonTypeID = 0;
        this.leadReportsSearchParameterObj.DateTo = "";
        this.leadReportsSearchParameterObj.DateFrom = "";
        this.resetDateToFrom();
        this.allLeadLostToFromDateComoRef.resetDateFilter();
    }


    // #endregion


    getDateString(dateValue: Date, dateFormat: string) {
        return this._dateTimeService.convertDateObjToString(dateValue, dateFormat);
    }

    getSelectedLead(customer: AllPerson) {
        this.leadReportsSearchParameterObj.CustomerID = customer.CustomerID;
        this.leadReportsSearchParameterObj.CustomerName = customer.FirstName + ' ' + customer.LastName;
    }

    displayLeadName(user?: AllPerson): string | undefined {
        return user ? user.FirstName + ' ' + user.LastName : undefined;
    }

    setDropdownDefaultValue() {
        this.membershipList.splice(0, 0, { MembershipID: 0, MembershipName: "All", IsActive: true });
        this.leadStatusTypeList.splice(0, 0, { LeadStatusTypeID: 0, LeadStatusTypeFriendlyName: "All Active Enquiries", IsActive: true });
        this.staffList.splice(0, 0, { StaffID: 0, StaffFullName: "All", IsActive: true });
        this.enquirySourceTypeList.splice(0, 0, { EnquirySourceTypeID: 0, EnquirySourceTypeName: "All", IsActive: true });
        this.lostReasonTypeList.splice(0, 0, { LostReasonTypeID: 0, LostReasonTypeName: "All", IsActive: true });
    };

    reciviedDateTo($event) {
        this.leadReportsSearchParameterObj.DateFrom = $event.DateFrom;
        this.leadReportsSearchParameterObj.DateTo = $event.DateTo;
    }

    resetDateToFrom() {
        this.leadReportsSearchParameterObj.DateFrom = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat),
            this.leadReportsSearchParameterObj.DateTo = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
    }

    setPermissions() {
        this.allowedPages.AllBookedDetailReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.LeadAllBookedDetailReport);
        this.allowedPages.AllLeadReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.AllLeadReport);
        this.allowedPages.AllSaleDetailReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.LeadAllSaleDetailReport);
        this.allowedPages.LeadActivitiesReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.LeadActivitiesReport);
        this.allowedPages.LeadBySourceReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.LeadBySourceReport);
        this.allowedPages.LeadLostReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.LeadLostReport);
    }

    // #endregion
}

