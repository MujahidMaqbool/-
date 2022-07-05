import { Component, OnInit, ViewChild } from "@angular/core";
import { SubscriptionLike as ISubscription, SubscriptionLike } from "rxjs";
/************************* Services & Models ***********************************/
/* Services */
import { HttpService } from '@services/app.http.service';
import { DateTimeService } from '@services/date.time.service';
import { TaxCalculation } from "@app/services/tax.calculations.service";

/* Models */
import { MemberInfo, MemberDashboardSearchParam, MemberActivities, MemberBooking, MemberServices, MemberProducts, MemberActiveMemberships, MemberAttendanceSummary, MemberTotalRevenue, TotalSaleCount } from "@customer/member/models/member.dashboard.model";
import { DD_Branch, ApiResponse } from "@app/models/common.model";
/**********************  Common *********************/
import { environment } from "@env/environment";
import { ENU_ActivityType, MembershipPaymentType, EnumSaleSourceType, ENU_Package, ENU_MemberAttendanceRedirect, ENU_DateFormatName, ENU_MainDashboard_ClubVisitGraphType, EnumNetSaleSourceType } from '@helper/config/app.enums';
import { DataSharingService } from '@services/data.sharing.service';
import { ClientApi, MemberApi, MemberPaymentsApi } from '@app/helper/config/app.webapi';
import { MessageService } from "@app/services/app.message.service";
import { Messages } from "@app/helper/config/app.messages";
import { MemberMembershipPayments } from "../models/member.membership.payments.model";
import { Configurations } from "@app/helper/config/app.config";
import { ImagesPlaceholder } from "@app/helper/config/app.placeholder";
import { DateToDateFromComponent } from "@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component";
import { Router } from "@angular/router";
import { MemberAttendanceComponent } from "@app/attendance/member/member.attendance.component";
import { AuthService } from "@app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Individual } from "@app/helper/config/app.module.page.enums";
import { CustomerType } from "@app/helper/config/app.enums";
import { AppUtilities } from "@app/helper/aap.utilities";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";
import { CurrencyPipe } from "@angular/common";
import { MatDatepicker } from "@angular/material/datepicker";
import { DateToFrom } from "@models/common.model";

/*
    Component Variables are not accessible in Dashboard widget events
    Declared an Javascript variable to be used in events while changing label
*/
var currencyCode: any;

@Component({
    selector: 'member-dashboard',
    templateUrl: './member.dashboard.component.html'
})

export class MemberDashboardComponent extends AbstractGenericComponent implements OnInit {

    @ViewChild('fromToDateComoRef') fromToDateComoRef: DateToDateFromComponent;
    @ViewChild('vcfromToDateComoRef') vcfromToDateComoRef: DateToDateFromComponent;
    allowedPages = {
        ServiceDashboard: false,
        ProductDashboard: false
    };

    DataChangeDashboard = {
        Attendance: 1,
        MemberActivity: 2
    };

    // ************* Local ****************

    memberID: number;
    memberEmail: string;
    totalAmount: number;
    isDataExists: boolean = false;
    isMemberInfoExists: boolean = false;
    isMemberActivitiesExists: boolean = false;
    isActiveMembershipsExist: boolean = false;
    ismemberBookingExists: boolean = false;
    ismemberMembershipBookingExists: boolean = false;
    ismemberServicesExists: boolean = false;
    ismemberProductsExists: boolean = false;
    ismemberAttendanceExists: boolean = false;
    isAddAttendanceAllowed: boolean = false;
    isMemberTotalRevenueExists: boolean = false;

    imagePath = ImagesPlaceholder.user;
    currentDate: Date = new Date();
    timeFormat = Configurations.TimeFormat;
    /***********Messages*********/
    messages = Messages;
    /***********Date Format*********/
    dateFormat: string = "";//'yyyy-MM-dd';
    dateFormatForDP: string = 'yyyy-MM-dd';
    dateFormatForSearch: string = 'yyyy-MM-dd';
    dateFormatforMembership: string = "";//'EEE MMM d y';
    dateFormatforAttendanceSummary: string = "";//'MMM d y';
    currencyFormat: string;
    currencyCode: string;
    branchDate: Date = new Date();
    dateToPlaceHolderValue: string = "Please Select Date";
    dateFromPlaceHolderValue: string = "Please Select Date";
    dateTo: Date;
    dateFrom: Date;
    maxDate: Date = new Date();

    dateToFrom = new DateToFrom();
    // ************* Model and Collection ****************
    activityType = ENU_ActivityType;
    enu_MemberAttendanceRedirect = ENU_MemberAttendanceRedirect
    activityTypeNames = Configurations.ActivityTypes;
    mainDashboard_ClubVisitGraphType = ENU_MainDashboard_ClubVisitGraphType;
    enumSaleSourceType = EnumSaleSourceType;
    packageIdSubscription: SubscriptionLike;
    memberInfo = new MemberInfo();
    memberActivities: MemberActivities[] = [];
    memberBooking: MemberBooking[];
    memberMemberShipBooking: MemberBooking[];
    MemberTotalRevenue: MemberTotalRevenue[];
    memberServices: MemberServices[];
    memberProducts: MemberProducts[];
    memberActiveMemberships: MemberActiveMemberships[] = [];
    memberMembershipPayments: MemberMembershipPayments[];
    memberAttendanceSummary: MemberAttendanceSummary[] = [];
    memberDashboardSearchParam: MemberDashboardSearchParam = new MemberDashboardSearchParam();
    package = ENU_Package;
    totalSaleCount: TotalSaleCount = new TotalSaleCount();
    CustomerTypes = Configurations.CustomerTypeList; 
    memberEmailSubscription: ISubscription;

    membershipPaymentType = MembershipPaymentType;
    customerType = CustomerType;

    constructor(private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        public _currencyFormatter: CurrencyPipe,
        private _taxCalculationService: TaxCalculation,
        private _dataSharingService: DataSharingService,
        private _authService: AuthService,
        private _router: Router) {
        super();
        this.getCurrentBranchDetail();
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        this.memberEmailSubscription.unsubscribe();
        this.packageIdSubscription.unsubscribe();
    }

    // #region Events

    onAttendanceSummaryDateChange() {
        this.getMemberAttendanceSummary();
    }

    onMemberSaleDateChange() {
        this.getMemberSale();
    }

    onDateChange($event, dashboardID: number) {
        if ($event != undefined) {
            this.memberDashboardSearchParam.DateFrom = $event.DateFrom;
            this.memberDashboardSearchParam.DateTo = $event.DateTo;
        }

        switch (dashboardID) {
            case this.DataChangeDashboard.Attendance:
                this.onAttendanceSummaryDateChange();
                break;
            case this.DataChangeDashboard.MemberActivity:
                this.onMemberSaleDateChange();
                break;

        }
    }

    // #endregion

    // #region Methods

    async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.dateFormatforMembership = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormatforBooked);
        this.dateFormatforAttendanceSummary = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormatforReturingClient);

        this.branchDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.memberDashboardSearchParam.DateFrom = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormatForSearch);
        this.memberDashboardSearchParam.DateTo = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormatForSearch);

        this.dateFrom = new Date(JSON.parse(JSON.stringify(this.branchDate)));
        //this.dateFrom.setDate(this.branchDate.getDate());
        this.maxDate = this.branchDate;
        this.dateTo = new Date(JSON.parse(JSON.stringify(this.branchDate)));
        this.dateToFrom.DateFrom = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormat);
        this.dateToFrom.DateTo = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormat);
        this.getMemberInfo();
        this.getMemberActivities();
        this.getMemberMemberships();
        this.onAttendanceSummaryDateChange();

        this.memberEmailSubscription = this._dataSharingService.memberEmail.subscribe((email) => {
            if (email && email.length > 0) {
                this.memberEmail = email;
            }
        })

        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.Currency;
            currencyCode = branch.Currency;
            this.getMemberSale();
        }
      
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPermissions(packageId);
            }
        });
    }

    getMemberID() {
        this._dataSharingService.memberID.subscribe(memberID => {
            if (memberID > 0) {
                this.memberID = memberID;
            }
        });
    }

    getMemberAttendanceSummary() {
        this.getMemberID();

        let params = {
            customerID: this.memberID,
            fromDate: this.dateToFrom.DateFrom,
            toDate: this.dateToFrom.DateTo

        }

        this._httpService.get(MemberApi.getMemberAttendanceSummary, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.ismemberAttendanceExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.ismemberAttendanceExists) {
                        this.memberAttendanceSummary = response.Result;
                        this.setAttendanceSummaryDate();
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            );
    }

    getMemberInfo() {
        this.getMemberID();

        this._httpService.get(MemberApi.getMemberInfo + this.memberID)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isMemberInfoExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isMemberInfoExists) {
                        this.memberInfo = response.Result[0];
                        this.setImagePath();
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            );
    }

    getMemberMemberships() {
        this.getMemberID();

        this._httpService.get(MemberApi.getMemberActiveMemberships + this.memberID)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isActiveMembershipsExist = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isActiveMembershipsExist) {
                        this.memberActiveMemberships = response.Result;
                        this.setActiveMembershipsDate();

                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            );
    }

    getMemberActivities() {
        this.getMemberID();
        this._httpService.get(MemberApi.getMemberActivitiesCount + this.memberID)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isMemberActivitiesExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (this.isMemberActivitiesExists) {
                        this.memberActivities = response.Result;
                        this.filterMemberActivities();
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Activity Count"));
                }
            );
    }

    getMemberMembershipPyments() {
        this.getMemberID();

        this._httpService.get(MemberPaymentsApi.getMembershipPyments, null)
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

    getMemberSale() {
        this.getMemberID();

        let params = {
            customerID: this.memberID,
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo,
            CustomerTypeID: this.customerType.Member
        }

        this._httpService.get(MemberApi.getMemberSale, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isMemberInfoExists = response.Result != null ? true : false;
                    if (this.isMemberInfoExists) {
                        this.ismemberBookingExists = response.Result.ClassCountList != null && response.Result.ClassCountList.length > 0 ? true : false;
                        this.ismemberMembershipBookingExists = response.Result.MemberShipCountList != null && response.Result.MemberShipCountList.length > 0 ? true : false;
                        this.ismemberServicesExists = response.Result.ServiceCountList != null && response.Result.ServiceCountList.length > 0 ? true : false;
                        this.ismemberProductsExists = response.Result.ProductCountList != null && response.Result.ProductCountList.length > 0 ? true : false;
                        this.isMemberTotalRevenueExists = response.Result.TotalRevenue != null && response.Result.TotalRevenue.length > 0 ? true : false;

                        if (this.ismemberBookingExists) {
                            this.memberBooking = response.Result.ClassCountList;
                            this.totalSaleCount.TotalClassSale = response.Result.TotalClassSale;
                            // this.calculateMemberBookingBySource();
                        } else{
                            this.totalSaleCount.TotalClassSale = 0;
                        }
                        if (this.ismemberServicesExists) {
                            this.memberServices = response.Result.ServiceCountList;
                            this.totalSaleCount.TotalServiceSale = response.Result.TotalServiceSale;
                        } else{
                            this.totalSaleCount.TotalServiceSale = 0;
                        }
                        if (this.ismemberProductsExists) {
                            this.memberProducts = response.Result.ProductCountList;
                            this.totalSaleCount.TotalProductSale = response.Result.TotalProductSale;
                        } else{
                            this.totalSaleCount.TotalProductSale = 0;
                        }
                        if (this.ismemberMembershipBookingExists) {
                            this.memberMemberShipBooking = response.Result.MemberShipCountList;
                            this.totalSaleCount.TotalMembershipSale = response.Result.TotalMembershipSale;
                        } else{
                            this.totalSaleCount.TotalMembershipSale = 0;
                        }

                        if (this.isMemberTotalRevenueExists) {
                            this.MemberTotalRevenue = response.Result.TotalRevenue;
                            this.totalSaleCount.TotalSale = response.Result.TotalSale;
                        } else{
                            this.totalSaleCount.TotalSale = 0;
                        }
                    }
                    else {
                        this.memberBooking = [];
                        this.memberServices = [];
                        this.memberProducts = [];
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
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

    getDateString(dateValue: Date, dateFormat: string) {
        return this._dateTimeService.convertDateObjToString(dateValue, dateFormat);
    }

    redirectToMemberAtttendance() {
        var memberAttendanceComponent: MemberAttendanceComponent = new MemberAttendanceComponent(this._httpService, this._messageService, this._router, this._dataSharingService);
        memberAttendanceComponent.memberClockin(this.memberInfo.MemberEmail, this.enu_MemberAttendanceRedirect.Dashboard);
    }
    // calculateMemberBookingBySource() {
    //     // this.memberBooking.forEach(element => {
    //     //     switch (element.AppSourceTypeID) {
    //     //         case this.enumSaleSourceType.App:
    //     //             this.memberBooking. = element.ActivityTypeCount
    //     //             break;
    //     //         case this.enumSaleSourceType.App:
    //     //             element.ActivityTypeCount = this.membershipTypeNames.TimeAndSessionBased;
    //     //             break;
    //     //         case this.enumSaleSourceType.App:
    //     //             element.ActivityTypeCount = this.membershipTypeNames.ClassBased;
    //     //             break;
    //     //         case this.enumSaleSourceType.App:
    //     //             element.ActivityTypeCount = this.membershipTypeNames.ClassAndSessionBased;
    //     //             break;
    //     //     }
    //     // });
    // }

    reciviedDateToForVisitInClub($event) {
        let dateTo = new Date($event.DateTo);
        let dateFrom = new Date($event.DateFrom);
        var Time = dateTo.getTime() - dateFrom.getTime();
        var daysDifference = Time / (1000 * 3600 * 24); //Diference in Days

        if (daysDifference > 30) {
            this.vcfromToDateComoRef.onFromDateChangeForParent($event.DateFrom);
            $event.DateTo = dateFrom.setMonth(dateFrom.getMonth() + 1);
            $event.DateTo = this._dateTimeService.convertDateObjToString($event.DateTo, this.dateFormatForDP)
            this.vcfromToDateComoRef.onToDateChangeForParent($event.DateTo);

            this.dateToFrom.DateFrom = $event.DateFrom;
            this.dateToFrom.DateTo = $event.DateTo;
        } else {
            this.dateToFrom.DateFrom = $event.DateFrom;
            this.dateToFrom.DateTo = $event.DateTo;
        }
        if (new Date($event.DateFrom) < this.vcfromToDateComoRef.branchDate) {
            this.vcfromToDateComoRef.toMaxDate = new Date($event.DateFrom);
            this.vcfromToDateComoRef.toMaxDate.setMonth(this.vcfromToDateComoRef.toMaxDate.getMonth() + 1);
        }
        this.onAttendanceSummaryDateChange();
    }
    setAttendanceSummaryDate() {
        this.memberAttendanceSummary.forEach(element => {
            if (element.GraphType === this.mainDashboard_ClubVisitGraphType.Hour) {
                element.ClockInDate = this._dateTimeService.formatTimeString(element.ClockInDate, this.timeFormat);
            } else {
                if (element.GraphType === 2) {
                    element.ClockInDate = this._dateTimeService.convertDateObjToString(new Date(element.ClockInDate), this.dateFormatforMembership);
                }
            }
        });
    }

    setActiveMembershipsDate() {
        this.memberActiveMemberships.forEach(element => {
            element.StartDate = this._dateTimeService.convertDateObjToString(new Date(element.StartDate), this.dateFormatforMembership);
            element.EndDate = this._dateTimeService.convertDateObjToString(new Date(element.EndDate), this.dateFormatforMembership);
            if (element.MembershipPercentage > 100) {
                element.MembershipPercentage = 100;
            }
        });
    }

    setImagePath() {
        if (this.memberInfo.ImagePath && this.memberInfo.ImagePath.length > 0) {
            this.imagePath = environment.imageUrl.replace("{ImagePath}", AppUtilities.setCustomerImagePath()) + this.memberInfo.ImagePath;
        }
        else {
            this.imagePath = AppUtilities.setUserImage(this.memberInfo.Gender);
        }
    }

    filterMemberActivities() {
        this.memberActivities = this.memberActivities.filter(c =>
            c.ActivityTypeID == this.activityType.Appointment ||
            c.ActivityTypeID == this.activityType.Call ||
            c.ActivityTypeID == this.activityType.Email ||
            c.ActivityTypeID == this.activityType.Note ||
            c.ActivityTypeID == this.activityType.SMS ||
            c.ActivityTypeID == this.activityType.MemberMessage ||
            c.ActivityTypeID == this.activityType.Achievement ||
            c.ActivityTypeID == this.activityType.AppNotification ||
            c.ActivityTypeID == this.activityType.Task);
    }

    customizeProductLabel = (point) => {
        return point.argumentText = this._currencyFormatter.transform(point.value, this.currencyFormat, 'symbol');
    }

    customizeServicesLabel = (point) => {
        return point.argumentText = this._currencyFormatter.transform(point.value, this.currencyFormat, 'symbol');
    }
    customizeBookingLabel = (point) => {
        return point.argumentText = this._currencyFormatter.transform(point.value, this.currencyFormat, 'symbol');
    }

    customizeProductTooltip = (arg: any) => {
        return {
            text: arg.argumentText + " : " + this._currencyFormatter.transform(arg.valueText, this.currencyFormat, 'symbol')
        };
    }

    customizeClassTooltip = (arg: any) => {
        return {
            text: arg.argumentText + " : " + this._currencyFormatter.transform(arg.valueText, this.currencyFormat, 'symbol')
        };
    }


    customizeMemberShipTooltip = (arg: any) => {
        return {
            text: arg.argumentText + " : " + this._currencyFormatter.transform(arg.valueText, this.currencyFormat, 'symbol')
        };
    }

    customizeServicesTooltip = (arg: any) => {
        return {
            text: arg.argumentText + " : " + this._currencyFormatter.transform(arg.valueText, this.currencyFormat, 'symbol')
        };
    }

    customizeBookingTooltip = (arg: any) => {
        return {
            text: arg.argumentText + " : " + this._currencyFormatter.transform(arg.valueText, this.currencyFormat, 'symbol')
        };
    }

    memberAttendancecustomizePoint(arg: any) {
        return {
            text: arg.seriesName + ' : ' + arg.value,
            color: "#BFE1FF"
        };

    }

    memberBookingcustomizePoint(arg: any) {
    
        var enumSaleSourceType = EnumNetSaleSourceType;
        switch (arg.data.AppSourceTypeID) {
          case enumSaleSourceType.Core:
            return { color: "#BFE1FF" };
          case enumSaleSourceType.Widget:
            return { color: "#BCD556" };
          case enumSaleSourceType.StaffApp:
            return { color: "#FEBF05" };
          case enumSaleSourceType.CustomerApp:
            return { color: "#F8CAA6" };
        }
      }

    // memberServicecustomizePoint(arg: any) {
    //     var enumSaleSourceType = EnumSaleSourceType;
    //     switch (arg.data.AppSourceTypeID) {
    //         case enumSaleSourceType.App:
    //             return { color: "#febf05" };
    //         case enumSaleSourceType.OnSite:
    //             return { color: "#bfe1ff" };
    //         case enumSaleSourceType.Shop:
    //             return { color: "#bcd556" };
    //     }
    // }

    // memberProductcustomizePoint(arg: any) {
    //     var enumSaleSourceType = EnumSaleSourceType;
    //     switch (arg.data.AppSourceTypeID) {
    //         case enumSaleSourceType.App:
    //             return { color: "#febf05" };
    //         case enumSaleSourceType.OnSite:
    //             return { color: "#bfe1ff" };
    //         case enumSaleSourceType.Shop:
    //             return { color: "#bcd556" };
    //     }
    // }

    bindmemberAttendanceValueWithTooltip(arg: any) {
        return {
            text: arg.seriesName + ' : ' + arg.value
        };
    }

    setPermissions(packageId: number) {
        this.isAddAttendanceAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Individual, ENU_Permission_Individual.MemberAttendance);
        switch (packageId) {
            case this.package.FitnessMedium:
                this.allowedPages.ProductDashboard = true
                break;

            case this.package.Full:
                this.allowedPages.ServiceDashboard = true,
                    this.allowedPages.ProductDashboard = true
                break;

        }
    }


    onFromDateChange(date: Date) {
        this.dateToFrom.DateFrom = date ? this._dateTimeService.convertDateObjToString(date, this.dateFormat) : ""; // 07/05/2018 MM/dd/yyyy
        this.validateDate();
        this.getMemberAttendanceSummary();
    };

    onToDateChange(date: Date) {
        let dateTo = new Date(date);
        this.maxDate = new Date(this.maxDate.setDate(dateTo.getDate()));
        this.dateToFrom.DateTo = date ? this._dateTimeService.convertDateObjToString(date, this.dateFormat) : ""; // 07/05/2018 MM/dd/yyyy
        if (this.dateFrom > this.maxDate) {
            this.dateFrom = new Date(this.maxDate.setDate(dateTo.getDate()));
            this.dateToFrom.DateFrom = date ? this._dateTimeService.convertDateObjToString(this.dateFrom, this.dateFormat) : ""; // 07/05/2018 MM/dd/yyyy
        }
        this.getMemberAttendanceSummary();
    };
    onOpenCalendar(picker: MatDatepicker<Date>) {
        picker.open();
    }
    validateDate() {
        if (this.dateFrom > this.dateTo) {
            this.dateTo = this.dateFrom;
        }
    }
    
    // #endregion

}
