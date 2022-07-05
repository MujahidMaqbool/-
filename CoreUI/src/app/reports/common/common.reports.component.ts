/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';

/********************** Services & Models *********************/
/* Models */
import { AllPerson, ApiResponse } from '@models/common.model';
/* Services */
import { HttpService } from '@services/app.http.service';
import { CommonService } from '@app/services/common.service';
/**********************  Common *********************/
import { Messages } from '@helper/config/app.messages';
import { CommonReportApi, AttendeeApi, HomeApi, SaleApi, CustomerRewardProgramApi } from '@helper/config/app.webapi';
import { PersonType, CustomerType, FileType, ReportName, ENU_Package, ReportCustomerType } from '@app/helper/config/app.enums';

/********************** Configurations *********************/
import { Configurations } from '@app/helper/config/app.config';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { CommonReportSearchParam, InventoryChnageLogSearchParam, RewardProgramSearchParam } from '../models/common.reports.model';
import { DateTimeService } from '@app/services/date.time.service';
import { SubscriptionLike } from 'rxjs';
import { DataSharingService } from '@app/services/data.sharing.service';
import { MessageService } from '@app/services/app.message.service';
import { ENU_Permission_Module, ENU_Permission_Report } from '@app/helper/config/app.module.page.enums';
import { AuthService } from '@app/helper/app.auth.service';
import { debounceTime } from 'rxjs/operators';
import { MatDatepicker } from '@angular/material/datepicker';
import { ClassInfo } from '@app/models/attendee.model';
import { NumberValidator } from '@app/shared/helper/number.validator';


@Component({
    selector: 'common-report',
    templateUrl: './common.reports.component.html'
})

export class CommonReportsComponent implements OnInit {

    allowedPages = {
        MailingLsit: false,
        FirstVisit: false,
        StaffActivities: false,
        ClassAttendees: false,
        CustomerCheckInReport: false,
        CustomerZeroVisits: false,
        RewardProgramSummary: false,
        ServiceBookingReport: false,
        InventoryChangeLog: false,
        CurrentStock: false

    };

    @ViewChild('mailingListToDateFromCompoObj') mailingListToDateFromCompoObj: DateToDateFromComponent;
    @ViewChild('firstToDateFromCompoObj') firstToDateFromCompoObj: DateToDateFromComponent;
    @ViewChild('TodayAcTivityoDateFromCompoObj') todayActivityToDateFromCompoObj: DateToDateFromComponent;
    @ViewChild('classAttendance') classAttendanceObj: DateToDateFromComponent;
    @ViewChild('customerCheckIn') customerCheckIn: DateToDateFromComponent;
    @ViewChild('serviceBookingDate') serviceBookingDate: DateToDateFromComponent;
    @ViewChild('customerZeroVisits') customerZeroVisits: DateToDateFromComponent;
    @ViewChild('rewardProgramToFromDate') rewardProgramToFromDate: DateToDateFromComponent;
    @ViewChild('inVentoryChangeLogToDateFromCompoObj') inVentoryChangeLogToDateFromCompoObj: DateToDateFromComponent;


    @ViewChild('customerCheckInForm') customerCheckInForm: NgForm;
    @ViewChild('customerZeroVisitsForm') customerZeroVisitsForm: NgForm;
    // #region Local Members



    /***********Local*********/
    dateFrom = new Date();
    dateTo = new Date();
    dateFormat: string = 'yyyy-MM-dd';
    branchCurrentDate: Date = new Date();
    personName: string = "";
    packageId: number;
    person: string;
    customerName: string;
    staffName: string;
    isStaff: boolean = false;
    packageIdSubscription: SubscriptionLike;
    clearCustomerInput = '';
    clearServiceBooking = '';
    clearCustomerInputRewardProgram = '';
    clearProductInput = '';
    clearProductCurrentStockInput= '';
    clearstaffInput = '';
    clearAssignStaffInput = '';
    disableMembershipStatusType: boolean = false;
    toMaxDate = new Date();

    isClassActive: boolean = false;
    /***********Messages*********/
    messages = Messages;

    /***********Collection And Models*********/
    fileType = FileType;
    reportName = ReportName;
    allPerson: AllPerson[];
    allCustomer: AllPerson[];
    allCustomerRewardProgram: AllPerson[];
    allProducts: any[];
    serviceList: any[] = [];
    productCategoryList: any[] = [];
    productBrandList: any[] = [];

    searchPerson: FormControl = new FormControl();
    searchCustomerCheckIn: FormControl = new FormControl();
    searchCustomerRewardProgram: FormControl = new FormControl();
    searchProduct: FormControl = new FormControl();
    searchProductCurrentStock: FormControl = new FormControl();

    searchCustomerZeroVisit: FormControl = new FormControl();
    commonReportSearchParam: CommonReportSearchParam = new CommonReportSearchParam();

    rewardProgramSearchParam: RewardProgramSearchParam = new RewardProgramSearchParam();
    inventoryChangeLogSearchParam: InventoryChnageLogSearchParam = new InventoryChnageLogSearchParam();

    allowedNumberKeysForClassBooking = Configurations.AllowedNumberKeysForClassBooking;
    customerEnrollmentList = Configurations.customerEnrollmentList;
    customerStatusList: any = Configurations.Status;

    customerTypeList: any[] = [];
    firstVisitCustomerTypeList: any[] = [];
    ActivitiesTypeList: any[] = [];
    branchRewardProgramList: any[] = [];
    rewardProgramList: any[] = [];

    numberValidator: NumberValidator = new NumberValidator();

    /* Configurations */
    package = ENU_Package;
    activityList = Configurations.ActivityList;
    customerActivityList = Configurations.CustomerCheckInActivityListForCommon;
    customerType = CustomerType.All;
    bookingStatusList = Configurations.BookingStatusList;

    personTypeList = Configurations.PersonTypeList;
    membershipStatusList = Configurations.MembershipStatusList;
    minDate: Date = new Date();
    ClassDate: any;
    isClassesExists: boolean = false;
    classDate: any;
    attendeeClass: any = [];
    ClassAttendance: ClassInfo = new ClassInfo();;
    dateFormatForSearch = 'yyyy-MM-dd';
    ServiceScheduledDateToLabelName: string = 'To - Service Scheduled Date';
    ServiceScheduledDateFromLabelName: string = 'From - Service Scheduled Date';

    personObj: any = {
        PersonID: 0,
        PersonName: ''
    };

    // #endregion

    constructor(
        private _httpService: HttpService,
        private _commonService: CommonService,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService,
        private _authService: AuthService) {
        //  this.customerTypeList = Configurations.CustomerTypeList;

    }

    ngOnInit() {
        this.getBranchSetting();
        //this.getRewardProgramList();
    }

    // #region Events


    ngOnDestroy() {
        this.packageIdSubscription.unsubscribe();
    }

    // onFromDateChange(date: Date) {
    //     this.dateFrom = this._dateTimeService.convertDateObjToString(date, this.dateFormat); // 07/05/2018 MM/dd/yyyy
    // };

    // onToDateChange(date: Date) {
    //     this.dateToFrom.DateTo = this._dateTimeService.convertDateObjToString(date, this.dateFormat) ; // 07/05/2018 MM/dd/yyyy
    // };


    onDateChange(date: any) {
        // this.ClassAttendance.ClassDate = this._dateTimeService.convertDateObjToString(date, this.dateFormatForSearch); // 07-05-2018
        // this.getAttendeeClasses();
        this.ClassAttendance.ClassDate = date;
        //this.ClassAttendance.ClassID = undefined;

        this.getAttendeeClasses();
    }

    getAttendeeClasses() {

        this._httpService.get(AttendeeApi.getClassesAttendeeOnBaseOfBranch)
            .subscribe((res:ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isClassesExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isClassesExists) {

                        this.attendeeClass = res.Result;
                        this.ClassAttendance.ClassID = 0;
                    }
                    else {
                        this.attendeeClass = [];
                        this.ClassAttendance.ClassID = 0;
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Attendee Classes"));
                });
    }



    onOpenCalendar(picker: MatDatepicker<Date>) {
        picker.open();
    }

    onPersonTypeChange() {

        if (this.commonReportSearchParam.PersonID == PersonType.Staff) {
            this.isStaff = true;
            this.commonReportSearchParam.CustomerTypeID = 0;
        }
        else {
            this.filtercustomerTypeList(this.packageId);
            this.isStaff = false;
            this.commonReportSearchParam.CustomerTypeID = 0;
        }
    }

    onCustomerTypeChange() {
        if (this.commonReportSearchParam.CustomerTypeID)
            if (this.commonReportSearchParam.CustomerTypeID > 0) {
                this.personObj = this.personTypeList.filter(x => x.PersonID == 2);
                this.commonReportSearchParam.PersonID = this.personObj[0].PersonID;
            } else {
                this.commonReportSearchParam.PersonID = 0;
            }
    }

    onClientNameChange(clientName: any) {
        if (clientName && clientName.length < 3) {
            this.commonReportSearchParam.CustomerID = 0;
        }
    }

    onStaffNameChange(staffName: any) {
        if (staffName && staffName.length < 3) {
            this.commonReportSearchParam.StaffID = 0;
        }
    }

    onReset() {
        this.isStaff = false;
        this.commonReportSearchParam.CustomerTypeID = 0;
        this.commonReportSearchParam.PersonID = 0;
        this.commonReportSearchParam.ActivityTypeID = 0;
        this.clearCustomerInput = "";
        this.clearProductInput = "";
        this.clearProductCurrentStockInput = '';
        this.clearstaffInput = "";
        this.clearAssignStaffInput = "";

    }
    onClearCustomer() {
        this.commonReportSearchParam.CustomerID = 0;
        this.clearCustomerInput = '';
    }
    onClearStaff() {
        this.commonReportSearchParam.StaffID = 0;
        this.clearstaffInput = '';
        this.clearAssignStaffInput ='';
    }

    // #endregion

    // #region Methods

    async getBranchSetting() {
        this.branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.toMaxDate = this.branchCurrentDate;
        this.setPermissions();
        this.getFundamental();
        this.getServiceFundamental();
        this.ClassAttendance.ClassID = 0;
        this.onDateChange(this.minDate);
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.packageId = packageId;
                this.filtercustomerTypeList(this.packageId);
                this.filterClassActive(this.packageId);
            }
        });
        this.commonReportSearchParam.ActivityTypeID = 0;
        this.searchPerson.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {
                    if (typeof (searchText) === "string") {
                        this._commonService.searchStaff(searchText).subscribe(response => {
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

        this.searchCustomerCheckIn.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {

                    if (typeof (searchText) === "string") {

                        this._commonService.searchClient(searchText, this.customerType).subscribe(response => {
                            if (response.Result != null && response.Result.length) {
                                this.allCustomer = response.Result;
                            }
                            else {
                                this.allCustomer = [];
                            }
                        });
                    }
                }
                else {
                    this.allCustomer = [];
                }
            });

        this.searchCustomerZeroVisit.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {

                    if (typeof (searchText) === "string") {

                        this._commonService.searchClient(searchText, this.customerType).subscribe(response => {
                            if (response.Result != null && response.Result.length) {
                                this.allCustomer = response.Result;
                            }
                            else {
                                this.allCustomer = [];
                            }
                        });
                    }
                }
                else {
                    this.allCustomer = [];
                }
            });

            //auto complete search in reward program
            this.searchCustomerRewardProgram.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {

                    if (typeof (searchText) === "string") {

                        this._commonService.searchClient(searchText, this.rewardProgramSearchParam.CustomerTypeID).subscribe(response => {
                            if (response.Result != null && response.Result.length) {
                                this.allCustomerRewardProgram = response.Result;
                            }
                            else {
                                this.allCustomerRewardProgram = [];
                            }
                        });
                    }
                }
                else {
                    this.allCustomerRewardProgram = [];
                }
            });

            this.searchProduct.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {

                    if (typeof (searchText) === "string") {

                        this._commonService.searchProduct(searchText).subscribe(response => {
                            if (response.Result != null && response.Result.length) {
                                this.allProducts = response.Result;
                            }
                            else {
                                this.allProducts = [];
                            }
                        });
                    }
                }
                else {
                    this.allProducts = [];
                }
            });

            this.searchProductCurrentStock.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {

                    if (typeof (searchText) === "string") {

                        this._commonService.searchProduct(searchText).subscribe(response => {
                            if (response.Result != null && response.Result.length) {
                                this.allProducts = response.Result;
                            }
                            else {
                                this.allProducts = [];
                            }
                        });
                    }
                }
                else {
                    this.allProducts = [];
                }
            }); 

        this.commonReportSearchParam.DateFrom = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat),
            this.commonReportSearchParam.DateTo = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat)
    }

    getFundamental() {
        this._httpService.get(CommonReportApi.Fundamental).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                this.ActivitiesTypeList = res.Result.CustomerActivityTypeList;
            }
            else{
                this._messageService.showErrorMessage(res.MessageText);
            }
        });
    }

    // endregion


    // #region AllLeadReports





    // #endregion

    // #region Customer Common Reports

    getServiceFundamental() {
      this._httpService.get(SaleApi.getServiceFundamental).subscribe((Data: any) => {
        this.serviceList = Data.Result.ServiceList;
      });
    }

    exportAllMailingListReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            personTypeID: this.commonReportSearchParam.PersonID == 0 ? null : this.commonReportSearchParam.PersonID,
            customerTypeID: this.commonReportSearchParam.CustomerTypeID == 0 ? null : this.commonReportSearchParam.CustomerTypeID,
            dateFrom: this.commonReportSearchParam.DateFrom,
            dateTo: this.commonReportSearchParam.DateTo
        }
        if (this.commonReportSearchParam.PersonID == 2 && this.commonReportSearchParam.CustomerTypeID == 0) {
            params.customerTypeID = 0;
        }
        this._httpService.get(CommonReportApi.getAllMailingList, params).subscribe((mailingListData: any) => {
            if (fileType == this.fileType.PDF) {
                this._commonService.createPDF(mailingListData, this.reportName.MailingList);
            }
            if (fileType == this.fileType.Excel) {
                this._commonService.createExcel(mailingListData, this.reportName.MailingList);
            };

        });
    }

    viewAllMailingListReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            personTypeID: this.commonReportSearchParam.PersonID == 0 ? null : this.commonReportSearchParam.PersonID,
            customerTypeID: this.commonReportSearchParam.CustomerTypeID == 0 ? null : this.commonReportSearchParam.CustomerTypeID,
            dateFrom: this.commonReportSearchParam.DateFrom,
            dateTo: this.commonReportSearchParam.DateTo
        }
        if (this.commonReportSearchParam.PersonID == 2 && this.commonReportSearchParam.CustomerTypeID == 0) {
            params.customerTypeID = 0;
        }
        this._httpService.get(CommonReportApi.getAllMailingList, params)
            .subscribe(
                (allLeadData: any) => {
                    this._commonService.viewPDFReport(allLeadData);
                });
    }

    exportFirstVisitReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            customerID: this.commonReportSearchParam.CustomerID,
            customerTypeID: this.commonReportSearchParam.CustomerTypeID == 0 ? null : this.commonReportSearchParam.CustomerTypeID,
            dateFrom: this.commonReportSearchParam.DateFrom,
            dateTo: this.commonReportSearchParam.DateTo
        }
        this._httpService.get(CommonReportApi.getFirstVisitReport, params).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (fileType == this.fileType.PDF) {
                        this._commonService.createPDF(response, this.reportName.FirstVisit);
                    }
                    if (fileType == this.fileType.Excel) {
                        this._commonService.createExcel(response, this.reportName.FirstVisit);
                    };
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }

            });
    }

    viewFirstVisitReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            customerID: this.commonReportSearchParam.CustomerID,
            customerTypeID: this.commonReportSearchParam.CustomerTypeID == 0 ? null : this.commonReportSearchParam.CustomerTypeID,
            dateFrom: this.commonReportSearchParam.DateFrom,
            dateTo: this.commonReportSearchParam.DateTo
        }
        this._httpService.get(CommonReportApi.getFirstVisitReport, params)
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

    viewTodayActivitiesReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            staffID: this.commonReportSearchParam.StaffID == 0 ? null : this.commonReportSearchParam.StaffID,
            activityTypeID: this.commonReportSearchParam.ActivityTypeID == 0 ? null : this.commonReportSearchParam.ActivityTypeID,
            dateFrom: this.commonReportSearchParam.DateFrom,
            dateTo: this.commonReportSearchParam.DateTo
        }
        if (this._dateTimeService.compareTwoDates(this.dateFrom, this.dateTo)) {
            this._httpService.get(CommonReportApi.getStaffWiseActivityReport, params)
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
        else {
            this._messageService.showErrorMessage(this.messages.Error.Invalid_FromDate);
        }
    }

    exportTodayActivitiesReport(fileType: number) {
        let params = {
            fileFormatTypeID: fileType,
            staffID: this.commonReportSearchParam.StaffID == 0 ? null : this.commonReportSearchParam.StaffID,
            activityTypeID: this.commonReportSearchParam.ActivityTypeID == 0 ? null : this.commonReportSearchParam.ActivityTypeID,
            dateFrom: this.commonReportSearchParam.DateFrom,
            dateTo: this.commonReportSearchParam.DateTo
        }
        if (this._dateTimeService.compareTwoDates(this.dateFrom, this.dateTo)) {
            this._httpService.get(CommonReportApi.getStaffWiseActivityReport, params).subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (fileType == this.fileType.PDF) {
                            this._commonService.createPDF(response, this.reportName.StaffWiseActivities);
                        }
                        if (fileType == this.fileType.Excel) {
                            this._commonService.createExcel(response, this.reportName.StaffWiseActivities);
                        };
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }

                });
        }
        else {
            this._messageService.showErrorMessage(this.messages.Error.Invalid_FromDate);
        }
    }

    // service bookinga View and exports

    exportServiceBookingReport(fileType: number) {

      let params = {
          fileFormatTypeID: fileType,
          customerID: this.commonReportSearchParam.CustomerID,
          customerTypeID: this.commonReportSearchParam.CustomerTypeID == 0 ? null : this.commonReportSearchParam.CustomerTypeID,
          dateFrom: this.commonReportSearchParam.DateFrom,
          dateTo: this.commonReportSearchParam.DateTo,
          serviceID: this.commonReportSearchParam.ServiceID == 0 ? null : this.commonReportSearchParam.ServiceID,
          bookingStatusID: this.commonReportSearchParam.BookingStatusTypeID == 0 ? null : this.commonReportSearchParam.BookingStatusTypeID,
          assignToStaffID: this.commonReportSearchParam.StaffID,

      }
      this._httpService.get(CommonReportApi.viewAllServiceBooking, params).subscribe(
          (response: ApiResponse) => {
              if (response && response.MessageCode > 0) {
                  if (fileType == this.fileType.PDF) {
                      this._commonService.createPDF(response, this.reportName.ServiceBookings);
                  }
                  if (fileType == this.fileType.Excel) {
                      this._commonService.createExcel(response, this.reportName.ServiceBookings);
                  };
              }
              else {
                  this._messageService.showErrorMessage(response.MessageText);
              }

          });
    }

    viewServiceBookingReport(fileType: number) {
      let params = {
        fileFormatTypeID: fileType,
        customerID: this.commonReportSearchParam.CustomerID,
        customerTypeID: this.commonReportSearchParam.CustomerTypeID == 0 ? null : this.commonReportSearchParam.CustomerTypeID,
        dateFrom: this.commonReportSearchParam.DateFrom,
        dateTo: this.commonReportSearchParam.DateTo,
        serviceID: this.commonReportSearchParam.ServiceID == 0 ? null : this.commonReportSearchParam.ServiceID,
        bookingStatusID: this.commonReportSearchParam.BookingStatusTypeID == 0 ? null : this.commonReportSearchParam.BookingStatusTypeID,
        assignToStaffID: this.commonReportSearchParam.StaffID,
      }

      this._httpService.get(CommonReportApi.viewAllServiceBooking, params)
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



    // Class Attendance Export & View

    exportClassAttendanceReport(fileType: number) {
        if (this.isClassesExists) {

            let params = {
                fileFormatTypeID: fileType,
                dateFrom: this.commonReportSearchParam.DateFrom,
                dateTo: this.commonReportSearchParam.DateTo,
                classID: this.ClassAttendance.ClassID > 0 ? Number(this.ClassAttendance.ClassID) : null 
            }
            this._httpService.get(CommonReportApi.getMemberClassAttendance, params).subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (fileType == this.fileType.PDF) {
                            this._commonService.createPDF(response, this.reportName.memberClassAttendance);
                        }
                        if (fileType == this.fileType.Excel) {
                            this._commonService.createExcel(response, this.reportName.memberClassAttendance);
                        };
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }

                });
        }
        else {
            this._messageService.showErrorMessage("There are no Attendees of this class.");
        }
    }

    viewClassAttendanceReport(fileType: number) {
        if (this.isClassesExists) {

            let params = {
                fileFormatTypeID: fileType,
                dateFrom: this.commonReportSearchParam.DateFrom,
                dateTo: this.commonReportSearchParam.DateTo,
                classID: this.ClassAttendance.ClassID > 0 ? Number(this.ClassAttendance.ClassID) : null 
            }

            this._httpService.get(CommonReportApi.getMemberClassAttendance, params)
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
        else {
            this._messageService.showErrorMessage("There are no Attendees of this class.");
        }
    }

    viewCustomerClockInReport(fileType: number) {
        if (this.customerCheckInForm.invalid) {
            return;
        }
        if (this.commonReportSearchParam.NumberOfVisitFrom > 10000 || this.commonReportSearchParam.NumberOfVisitTo > 10000) {
            this._messageService.showErrorMessage(this.messages.Validation.Customer_Reports_Visit_Should_not_Be_Greater);
            return;
        }
        if (this.commonReportSearchParam.NumberOfVisitTo && (this.commonReportSearchParam.NumberOfVisitFrom > this.commonReportSearchParam.NumberOfVisitTo)) {
            this._messageService.showErrorMessage(this.messages.Validation.Customer_Reports_To_should_Be_Greater_than_From);
            return;
        }
        let params = {
            fileFormatTypeID: fileType,
            customerID: this.commonReportSearchParam.CustomerID,
            customerTypeID: this.commonReportSearchParam.CustomerTypeID == 0 ? null : this.commonReportSearchParam.CustomerTypeID,
            dateFrom: this.commonReportSearchParam.DateFrom,
            dateTo: this.commonReportSearchParam.DateTo,
            activityTypeID: this.commonReportSearchParam.ActivityTypeID == 0 ? null : this.commonReportSearchParam.ActivityTypeID,
            numberOfVisitFrom: this.commonReportSearchParam.NumberOfVisitFrom,
            numberOfVisitTo: this.commonReportSearchParam.NumberOfVisitTo,
            membershipStatusTypeID: this.commonReportSearchParam.MembershipStatusTypeID,
        }
        this._httpService.get(CommonReportApi.viewCustomerClockInReport, params).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this._commonService.viewPDFReport(response);
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }

            });
    }
    exportCustomerClockInReport(fileType: number) {
        if (this.customerCheckInForm.invalid) {
            return;
        }
        if (this.commonReportSearchParam.NumberOfVisitFrom > 10000 || this.commonReportSearchParam.NumberOfVisitTo > 10000) {
            this._messageService.showErrorMessage(this.messages.Validation.Customer_Reports_Visit_Should_not_Be_Greater);
            return;
        }
        if (this.commonReportSearchParam.NumberOfVisitTo && (this.commonReportSearchParam.NumberOfVisitFrom > this.commonReportSearchParam.NumberOfVisitTo)) {
            this._messageService.showErrorMessage(this.messages.Validation.Customer_Reports_To_should_Be_Greater_than_From);
            return;
        }
        let params = {
            fileFormatTypeID: fileType,
            customerID: this.commonReportSearchParam.CustomerID,
            customerTypeID: this.commonReportSearchParam.CustomerTypeID == 0 ? null : this.commonReportSearchParam.CustomerTypeID,
            dateFrom: this.commonReportSearchParam.DateFrom,
            dateTo: this.commonReportSearchParam.DateTo,
            activityTypeID: this.commonReportSearchParam.ActivityTypeID == 0 ? null : this.commonReportSearchParam.ActivityTypeID,
            numberOfVisitFrom: this.commonReportSearchParam.NumberOfVisitFrom,
            numberOfVisitTo: this.commonReportSearchParam.NumberOfVisitTo,
            membershipStatusTypeID: this.commonReportSearchParam.MembershipStatusTypeID,
        }
        this._httpService.get(CommonReportApi.viewCustomerClockInReport, params).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (fileType == this.fileType.PDF) {
                        this._commonService.createPDF(response, this.reportName.CustomerClockInReport);
                    }
                    if (fileType == this.fileType.Excel) {
                        this._commonService.createExcel(response, this.reportName.CustomerClockInReport);
                    };
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }

            });
    }

    onMLimitChangeOnlyNumbers(num, type) {
        setTimeout(() => {
            // if(type == "MinimumVisits"){
            //     this.commonReportSearchParam.MemberLimit = this.numberValidator.NotAllowDecimalValue(num);
            // }

            // if(type == "MaximumVisits"){
            //     this.commonReportSearchParam.MemberLimit = this.numberValidator.NotAllowDecimalValue(num);
            // }

            if (type == "ResultFrom") {
                this.commonReportSearchParam.CustomerNumberFrom = this.numberValidator.NotAllowDecimalValue(num);
            }

            if (type == "ResultTo") {
                this.commonReportSearchParam.CustomerNumberTo = this.numberValidator.NotAllowDecimalValue(num);
            }

        }, 10);
    }

    exportCustomerZeroVisitsReport(fileType: number) {
        if (this.commonReportSearchParam.CustomerNumberTo.toString() == "" || this.commonReportSearchParam.CustomerNumberFrom.toString() == "") {
            this._messageService.showErrorMessage(this.messages.Validation.From_And_To_Fields_Within_The_Result_Section_Cannot_Be_Empty);
            return;
        }

        if (this.commonReportSearchParam.CustomerNumberTo == 0 || this.commonReportSearchParam.CustomerNumberFrom == 0) {
            this._messageService.showErrorMessage(this.messages.Validation.From_And_To_Fields_Within_The_Result_Section_Cannot_Be_Zero);
            return;
        }

        if (this.commonReportSearchParam.CustomerNumberTo && this.commonReportSearchParam.CustomerNumberFrom && (this.commonReportSearchParam.CustomerNumberFrom > this.commonReportSearchParam.CustomerNumberTo) || (this.commonReportSearchParam.CustomerNumberFrom > this.commonReportSearchParam.CustomerNumberTo)) {
            this._messageService.showErrorMessage(this.messages.Validation.To_Value_Cannot_Be_Greater_Than_From_Value_Within_The_Result_Section);
            return;
        }
        let params = {
            fileFormatTypeID: fileType,
            customerID: this.commonReportSearchParam.CustomerID,
            customerTypeID: this.commonReportSearchParam.CustomerTypeID == 0 ? null : this.commonReportSearchParam.CustomerTypeID,
            dateFrom: this.commonReportSearchParam.DateFrom,
            dateTo: this.commonReportSearchParam.DateTo,
            activityTypeID: this.commonReportSearchParam.ActivityTypeID == 0 ? null : this.commonReportSearchParam.ActivityTypeID,
            customerNumberFrom: this.commonReportSearchParam.CustomerNumberFrom,
            customerNumberTo: this.commonReportSearchParam.CustomerNumberTo,
            membershipStatusTypeID: this.commonReportSearchParam.MembershipStatusTypeID,
        }
        this._httpService.get(CommonReportApi.viewZeroVisitsReport, params).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (fileType == this.fileType.PDF) {
                        this._commonService.createPDF(response, this.reportName.ZeroVisitsReport);
                    }
                    if (fileType == this.fileType.Excel) {
                        this._commonService.createExcel(response, this.reportName.ZeroVisitsReport);
                    };
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }

            });
    }

    viewCustomerZeroVisitsReport(fileType: number) {
        if (this.commonReportSearchParam.CustomerNumberTo.toString() == "" || this.commonReportSearchParam.CustomerNumberFrom.toString() == "") {
            this._messageService.showErrorMessage(this.messages.Validation.From_And_To_Fields_Within_The_Result_Section_Cannot_Be_Empty);
            return;
        }

        if (this.commonReportSearchParam.CustomerNumberTo == 0 || this.commonReportSearchParam.CustomerNumberFrom == 0) {
            this._messageService.showErrorMessage(this.messages.Validation.From_And_To_Fields_Within_The_Result_Section_Cannot_Be_Zero);
            return;
        }

        if (this.commonReportSearchParam.CustomerNumberTo && this.commonReportSearchParam.CustomerNumberFrom && (this.commonReportSearchParam.CustomerNumberFrom > this.commonReportSearchParam.CustomerNumberTo) || (this.commonReportSearchParam.CustomerNumberFrom == this.commonReportSearchParam.CustomerNumberTo)) {
            this._messageService.showErrorMessage(this.messages.Validation.To_Value_Cannot_Be_Greater_Than_From_Value_Within_The_Result_Section);
            return;
        }
        let params = {
            fileFormatTypeID: fileType,
            customerID: this.commonReportSearchParam.CustomerID,
            customerTypeID: this.commonReportSearchParam.CustomerTypeID == 0 ? null : this.commonReportSearchParam.CustomerTypeID,
            dateFrom: this.commonReportSearchParam.DateFrom,
            dateTo: this.commonReportSearchParam.DateTo,
            activityTypeID: this.commonReportSearchParam.ActivityTypeID == 0 ? null : this.commonReportSearchParam.ActivityTypeID,
            customerNumberFrom: this.commonReportSearchParam.CustomerNumberFrom,
            customerNumberTo: this.commonReportSearchParam.CustomerNumberTo,
            membershipStatusTypeID: this.commonReportSearchParam.MembershipStatusTypeID,
        }
        this._httpService.get(CommonReportApi.viewZeroVisitsReport, params).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this._commonService.viewPDFReport(response);
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }

            });
    }

    getSelectedStaff(staff: AllPerson) {
        this.commonReportSearchParam.StaffID = staff.StaffID;
    }
    displayStaffName(user?: AllPerson): string | undefined {
        return user ? user.FirstName + ' ' + user.LastName : undefined;
    }

    getSelectedCustomer(customer: AllPerson) {
        this.commonReportSearchParam.CustomerID = customer.CustomerID;
    }
    displayCustomerName(user?: AllPerson): string | undefined {
        return user ? user.FirstName + ' ' + user.LastName : undefined;
    }
    displayClientName(user?: AllPerson): string | undefined {
        return user ? user.FirstName + ' ' + user.LastName : undefined;
    }

    displayProductName(product?: any): string | undefined {
        return product ? product.ProductName : undefined;
    }

    displayProductNameForCurrentStock(product?: any): string | undefined {
        return product ? product.ProductName : undefined;
    }
    // #endregion


    resetDefaultList() {
        this.commonReportSearchParam = new CommonReportSearchParam();
        this.commonReportSearchParam.CustomerTypeID = 0;
        this.mailingListToDateFromCompoObj.resetDateFilter();
        this.firstToDateFromCompoObj.resetDateFilter();
        this.resetCustomerDeatil();
        this.resetServiceBooking();
        this.onClearStaff();
        this.customerCheckIn?.resetDateFilter();
        this.serviceBookingDate?.resetDateFilter();
        this.customerZeroVisits?.resetDateFilter();
        this.dateFrom = this.branchCurrentDate;
        this.dateTo = this.branchCurrentDate;
        this.disableMembershipStatusType = false;
    };

    reciviedDateToFrom($event) {
        this.commonReportSearchParam.DateFrom = $event.DateFrom;
        this.commonReportSearchParam.DateTo = $event.DateTo;
        this.rewardProgramSearchParam.DateFrom =$event.DateFrom;
        this.rewardProgramSearchParam.DateTo = $event.DateTo;
        this.inventoryChangeLogSearchParam.DateFrom =$event.DateFrom;
        this.inventoryChangeLogSearchParam.DateTo = $event.DateTo;
    }

    displayLeadName(user?: AllPerson): string | undefined {
        return user ? user.FirstName + ' ' + user.LastName : undefined;
    }
    resetDateToFrom() {
        this.commonReportSearchParam.StaffID = null;
        this.commonReportSearchParam.StaffID = null;
        this.commonReportSearchParam.CustomerID = null;
        this.commonReportSearchParam.ActivityTypeID = 0;
        this.mailingListToDateFromCompoObj.resetDateFilter();
        this.classAttendanceObj.resetDateFilter();
        this.customerCheckIn.resetDateFilter();
        this.serviceBookingDate.resetDateFilter();
        this.customerZeroVisits.resetDateFilter();
        this.firstToDateFromCompoObj.resetDateFilter();
        this.dateFrom = this.branchCurrentDate;
        this.dateTo = this.branchCurrentDate;
        this.ClassAttendance.ClassID = 0;
        this.todayActivityToDateFromCompoObj.resetDateFilter();
        this.onReset();
        this.commonReportSearchParam.DateFrom = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat),
            this.commonReportSearchParam.DateTo = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat);
    }
    // resetClassAttendanceFilter() {
    //     // this.ClassAttendance.ClassDate = this.minDate;
    //     this.ClassAttendance.ClassID = 0;
    //     this.getAttendeeClasses();
    //     this.classAttendanceObj.resetDateFilter();
    // }

    filtercustomerTypeList(packageID: number) {
        switch (packageID) {
            case this.package.WellnessBasic:
                this.customerTypeList = Configurations.CustomerTypeList.filter(g => g.CustomerTypeID == CustomerType.Client);
                this.customerType = CustomerType.Client;
                this.customerActivityList = Configurations.ClientBasicCheckInActivityList;
                this.setDefaultValue();
                break;
            case this.package.FitnessBasic:
                this.customerTypeList = Configurations.CustomerTypeList.filter(g => g.CustomerTypeID == CustomerType.Member);
                this.customerType = CustomerType.Member;
                this.customerActivityList = Configurations.MemberBasicCheckInActivityList;
                this.setDefaultValue();
                break;
            case this.package.WellnessMedium:
                this.customerTypeList = Configurations.CustomerTypeList.filter(g => g.CustomerTypeID == CustomerType.Client);
                this.customerType = CustomerType.Client;
                this.customerActivityList = Configurations.ClientCheckInActivityList;
                this.setDefaultValue();
                break;
            case this.package.WellnessTop:
                this.customerTypeList = Configurations.CustomerTypeList.filter(g => g.CustomerTypeID == CustomerType.Client);
                this.customerType = CustomerType.Client;
                this.customerActivityList = Configurations.ClientCheckInActivityList;
                this.setDefaultValue();
                break;
            case this.package.FitnessMedium:
                this.customerTypeList = Configurations.CustomerTypeList.filter(g => g.CustomerTypeID == CustomerType.Member);
                this.customerType = CustomerType.Member;
                this.customerActivityList = Configurations.MemberCheckInActivityList;
                this.setDefaultValue();
                break;
            default:
                this.customerTypeList = Configurations.CustomerTypeList;
                break;

        }
    }


    setDefaultValue() {
        this.customerTypeList.splice(0, 0, { CustomerTypeID: 0, CustomerTypeName: "All", IsActive: true });
    }


    setPermissions() {
        this.allowedPages.MailingLsit = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.MailingListReport);
        this.allowedPages.FirstVisit = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.FirstVisitReport);
        this.allowedPages.StaffActivities = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.StaffActivities);
        this.allowedPages.ClassAttendees = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.ClassAttendees);
        this.allowedPages.CustomerCheckInReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.CustomerCheckInReport);
        this.allowedPages.CustomerZeroVisits = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.CustomerZeroVisits);
        this.allowedPages.RewardProgramSummary = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.CustomerZeroVisits);
        this.allowedPages.ServiceBookingReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.ServiceBookingReport);
        this.allowedPages.InventoryChangeLog = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.InventoryChangeLog);
        this.allowedPages.CurrentStock = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.CurrentStock);

        if(this.allowedPages.RewardProgramSummary){
            this.getRewardProgramList(); 
        }
        if(this.allowedPages.InventoryChangeLog || this.allowedPages.CurrentStock){
            
            this.getInventoryChangeLogFundamentals();
        }
    }


    filterClassActive(packageID: number) {
        switch (packageID) {
            case this.package.FitnessBasic:
                this.isClassActive = true;
                break;
            case this.package.FitnessMedium:
                this.isClassActive = true;
                break;
            case this.package.Full:
                this.isClassActive = true;
                break;
        }
    }

    // Added by Saad Jamil for changing the name
    onNameChange(memberName: any) {
        if (memberName.length < 3) {
            this.commonReportSearchParam.CustomerID = ReportCustomerType.ClientMember;
        }
    }

    getSelectedCustomerID(person: AllPerson) {
        this.commonReportSearchParam.CustomerID = person.CustomerID;
    }

    customerTypeChange(customerTypeID) {
        this.customerType = customerTypeID;
        this.disableMembershipStatusType = (customerTypeID == CustomerType.Member || customerTypeID == CustomerType.All) ? false : true;
        if (this.disableMembershipStatusType) {
            this.commonReportSearchParam.MembershipStatusTypeID = null;
        }
    }

    resetCustomerDeatil() {
        this.clearCustomerInput = "";
    }

    resetServiceBooking() {
      this.clearServiceBooking ="";
  }

    preventCharactersForClassBooking(event: any) {
        let index = this.allowedNumberKeysForClassBooking.findIndex(k => k == event.key);
        if (index < 0) {
            event.preventDefault()
        }
    }
    // #endregion

    // reward program

    getRewardProgramList(){
        this._httpService.get(CommonReportApi.getBranchActiveRewardProgramListForReport).subscribe(
            (res:ApiResponse) => {
            if (res && res.MessageCode > 0) {
                this.branchRewardProgramList = res.Result;
                this.rewardProgramList = [];
                this.rewardProgramList = res.Result;
                // if(this.branchRewardProgramList){
                //     var result = this.branchRewardProgramList.find(i => i.IsDefault);
                //     // if(result){
                //     //     this.rewardProgramSearchParam.RewardProgramID = result.RewardProgramID;
                //     // } else{
                //     //     this.rewardProgramSearchParam.RewardProgramID = this.branchRewardProgramList[0].RewardProgramID;
                //     // }
                // }
            }
            else{
                this._messageService.showErrorMessage(res.MessageText);
            }
        });
    }

    getCustomerRewardProgramList(){
        let url = CustomerRewardProgramApi.customerRewardProgramForReport + this.rewardProgramSearchParam.CustomerID;
        this._httpService.get(url).subscribe(
            (res:ApiResponse) => {
            if (res && res.MessageCode > 0) {
                this.rewardProgramList = [];
                this.rewardProgramList = res.Result;
                this.rewardProgramSearchParam.RewardProgramID = 0;
                this.rewardProgramSearchParam.EnrollmentStatusID = 0;
            }
            else{
                this._messageService.showErrorMessage(res.MessageText);
            }
        });
    }

    onChangeRewardProgram(){
        // if(this.rewardProgramSearchParam.CustomerID > 0 && this.rewardProgramSearchParam.RewardProgramID > 0){
        //     this.rewardProgramSearchParam.EnrollmentStatusID = this.rewardProgramList.find(i => i.RewardProgramID == this.rewardProgramSearchParam.RewardProgramID ).EnrollmentStatusID;
        // } else{
            this.rewardProgramSearchParam.EnrollmentStatusID = 0;
        // }
    }

    resetRewardProgramSearchParams(){
        this.rewardProgramSearchParam = new RewardProgramSearchParam();
        this.rewardProgramList = this.branchRewardProgramList;
        this.rewardProgramToFromDate.resetDateFilter();
        this.resetCustomerDetailRewardProgram();
    }

    getSelectedCustomerIDForRewardProgram(person: AllPerson) {
        this.rewardProgramSearchParam.CustomerID = person.CustomerID;
        this.getCustomerRewardProgramList();
    }

    resetCustomerDetailRewardProgram() {
        this.clearCustomerInputRewardProgram = "";
        this.rewardProgramSearchParam.CustomerID = 0;
        this.rewardProgramList = this.branchRewardProgramList;
        this.rewardProgramSearchParam.RewardProgramID = 0;
    }

    getSelectedProduct(product: any) {
        this.inventoryChangeLogSearchParam.ProductID = product.ProductID;
        this.inventoryChangeLogSearchParam.ProductCategoryID = product.ProductCategoryID;
        this.inventoryChangeLogSearchParam.BrandID = product.BrandID > 0 ? product.BrandID : null;
    }

    resetProductDetail() {
        this.clearProductInput = "";
        this.inventoryChangeLogSearchParam.ProductID = 0;
        this.inventoryChangeLogSearchParam.ProductCategoryID = null;
        this.inventoryChangeLogSearchParam.BrandID = null;
    }

    getSelectedProductCurrentStock(product: any) {
        this.inventoryChangeLogSearchParam.ProductID = product.ProductID;
        this.inventoryChangeLogSearchParam.ProductCategoryID = product.ProductCategoryID;
        this.inventoryChangeLogSearchParam.BrandID = product.BrandID > 0 ? product.BrandID : null;
    }

    resetSelectedProductCurrentStock() {
        this.clearProductCurrentStockInput = "";
        this.inventoryChangeLogSearchParam.ProductID = 0;
        this.inventoryChangeLogSearchParam.ProductCategoryID = null;
        this.inventoryChangeLogSearchParam.BrandID = null;
    }

    onNameChangeRewardProgram(memberName: any) {
        if (memberName.length < 3) {
            this.rewardProgramSearchParam.CustomerID = ReportCustomerType.ClientMember;
        }
    }

    onNameChangeproduct(productName: any) {
        if (productName.length < 3) {
            this.rewardProgramSearchParam.CustomerID = 0;
        }
    }

    exportRewardProgramSummaryReport(fileType: number){
        //if(this.rewardProgramSearchParam.RewardProgramID > 0){
            this.rewardProgramSearchParam.FileFormatTypeID = fileType;
            this._httpService.get(CommonReportApi.viewAllRewardProgramSummaryReport, this.rewardProgramSearchParam)
            .subscribe((DailyRefundsData: any) => {
                if (fileType == this.fileType.PDF) {
                    this._commonService.createPDF(DailyRefundsData, this.reportName.RewardProgramSummary);
                }
                if (fileType == this.fileType.Excel) {
                    this._commonService.createExcel(DailyRefundsData, this.reportName.RewardProgramSummary);
                };
            });
        //} else{
            //this._messageService.showErrorMessage("Please select reward program");
        //}
    }

    viewRewardProgramSummaryReport(fileType: number){
        //if(this.rewardProgramSearchParam.RewardProgramID > 0){
            this.rewardProgramSearchParam.FileFormatTypeID = fileType;
            this._httpService.get(CommonReportApi.viewAllRewardProgramSummaryReport, this.rewardProgramSearchParam).subscribe((DailyRefundsData: any) => {
                this._commonService.viewPDFReport(DailyRefundsData);
            });
        //} else{
            //this._messageService.showErrorMessage("Please select reward program");
        //}
    }

    // Inventory Change log

    onProductNameChange(){
        this.inventoryChangeLogSearchParam.ProductName = this.inventoryChangeLogSearchParam.ProductName ? this.inventoryChangeLogSearchParam.ProductName.trim() : this.inventoryChangeLogSearchParam.ProductName;
    }

    exportAllInventoryChangeLogListReport(fileType: number) {
        let params = {
            FileFormatTypeID: fileType,
            ProductID: this.inventoryChangeLogSearchParam.ProductID ? this.inventoryChangeLogSearchParam.ProductID : null,
            ProductCategoryID: this.inventoryChangeLogSearchParam.ProductCategoryID == 0 ? null : this.inventoryChangeLogSearchParam.ProductCategoryID,
            BrandID: this.inventoryChangeLogSearchParam.BrandID == 0 ? null : this.inventoryChangeLogSearchParam.BrandID,
            DateFrom: this.inventoryChangeLogSearchParam.DateFrom,
            DateTo: this.inventoryChangeLogSearchParam.DateTo
        }
        this._httpService.get(CommonReportApi.viewAllInventoryChangeLog, params).subscribe((allInventoryData: any) => {
            if (fileType == this.fileType.PDF) {
                this._commonService.createPDF(allInventoryData, this.reportName.InventoryChangeLog);
            }
            if (fileType == this.fileType.Excel) {
                this._commonService.createExcel(allInventoryData, this.reportName.InventoryChangeLog);
            };

        });
    }

    viewAllInventoryChangeLogListReport(fileType: number) {
        let params = {
            FileFormatTypeID: fileType,
            ProductID: this.inventoryChangeLogSearchParam.ProductID ? this.inventoryChangeLogSearchParam.ProductID : null,
            ProductCategoryID: this.inventoryChangeLogSearchParam.ProductCategoryID == 0 ? null : this.inventoryChangeLogSearchParam.ProductCategoryID,
            BrandID: this.inventoryChangeLogSearchParam.BrandID == 0 ? null : this.inventoryChangeLogSearchParam.BrandID,
            DateFrom: this.inventoryChangeLogSearchParam.DateFrom,
            DateTo: this.inventoryChangeLogSearchParam.DateTo
        }

        this._httpService.get(CommonReportApi.viewAllInventoryChangeLog, params)
            .subscribe(
                (allInventoryData: any) => {
                    this._commonService.viewPDFReport(allInventoryData);
                });
    }

    resetInventoryChangeLogSearchParams(){
        this.inventoryChangeLogSearchParam = new InventoryChnageLogSearchParam();
        this.clearProductInput = "";
        this.inVentoryChangeLogToDateFromCompoObj.resetDateFilter();
    }

    getInventoryChangeLogFundamentals(){
        this._httpService.get(CommonReportApi.inventoryChangeLogFundamental).subscribe(
            (res:ApiResponse) => {
            if (res && res.MessageCode > 0) {
                this.productCategoryList = res.Result.ProductCategoryDDViewModels;
                this.productBrandList = res.Result.BrandDDViewModels;
            }
            else{
                this._messageService.showErrorMessage(res.MessageText);
            }
        });
    }


    // #endregion

    //current stock start

    exportAllCurrentStockListReport(fileType: number) {
        let params = {
            FileFormatTypeID: fileType,
            ProductID: this.inventoryChangeLogSearchParam.ProductID ? this.inventoryChangeLogSearchParam.ProductID : null,
            ProductCategoryID: this.inventoryChangeLogSearchParam.ProductCategoryID == 0 ? null : this.inventoryChangeLogSearchParam.ProductCategoryID,
            BrandID: this.inventoryChangeLogSearchParam.BrandID == 0 ? null : this.inventoryChangeLogSearchParam.BrandID,
        }
        this._httpService.get(CommonReportApi.viewAllCurrentStock, params).subscribe((currentStockData: any) => {
            if (fileType == this.fileType.PDF) {
                this._commonService.createPDF(currentStockData, this.reportName.CurrentStock);
            }
            if (fileType == this.fileType.Excel) {
                this._commonService.createExcel(currentStockData, this.reportName.CurrentStock);
            };

        });
    }

    viewAllCurrentStockListReport(fileType: number) {
        let params = {
            FileFormatTypeID: fileType,
            ProductID: this.inventoryChangeLogSearchParam.ProductID ? this.inventoryChangeLogSearchParam.ProductID : null,
            ProductCategoryID: this.inventoryChangeLogSearchParam.ProductCategoryID == 0 ? null : this.inventoryChangeLogSearchParam.ProductCategoryID,
            BrandID: this.inventoryChangeLogSearchParam.BrandID == 0 ? null : this.inventoryChangeLogSearchParam.BrandID,
        }

        this._httpService.get(CommonReportApi.viewAllCurrentStock, params)
            .subscribe(
                (currentStockData: any) => {
                    this._commonService.viewPDFReport(currentStockData);
                });
    }

    resetCurrentStockSearchParams(){
        this.clearProductCurrentStockInput = "";
        this.inventoryChangeLogSearchParam = new InventoryChnageLogSearchParam();
    }

    //current stock end
}
