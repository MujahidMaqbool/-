import { Component, OnInit, ViewChild } from "@angular/core";
import { SubscriptionLike } from "rxjs";
/************************* Services & Models ***********************************/
/* Services  */
import { DataSharingService } from "src/app/services/data.sharing.service";
import { DateTimeService } from "src/app/services/date.time.service";
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
/* Models */
import { MemberDashboardSearchParam, MemberSnapshot, MemberBooking, MemberServices, MemberProducts, MemberByStatus, MemberServiceAndAttendance, MemberAttendanceSummary, MemberClubVisits, MemberPayment } from "../models/member.dashboard.model";
import { ApiResponse, DD_Branch } from "src/app/models/common.model";
/************************* Common ***********************************/
import { MemberApi } from "src/app/helper/config/app.webapi";
import { Configurations } from "src/app/helper/config/app.config";
import { Messages } from "src/app/helper/config/app.messages";
import { EnumSaleSourceType, MembershipStatus_Enum, EnumMemberPayment, ENU_Package, CustomerType, ENU_DateFormatName } from "src/app/helper/config/app.enums";
import { DateToDateFromComponent } from "src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component";
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";

/*
    Component Variables are not accessible in Dashboard widget events
    Declared an Javascript variable to be used in events while changing label
*/
var currencyCode: any;

@Component({
    selector: 'member-main-dashboard',
    templateUrl: './member.main.dashboard.component.html'
})
export class MemberMainDashboardComponent extends AbstractGenericComponent implements OnInit {

    @ViewChild('fromToDateComoRef') fromToDateComoRef: DateToDateFromComponent;

    allowedPages = {
        ServiceDashboard: false,
        ProductDashboard: false,
        MembershipStatusDashboard: false,
        ServiceBookedAndAttendance: false
    };

    DataChangeDashboard = {
        VisitInClub: 1,
        MembersActivities: 2,
        Attendance: 3,
        MembersbyStatus: 4,
        ServicesBookedandCompleted: 5,
        Payment: 6
    };


    // ************* Local ****************
    memberID: number = 0;
    customizeText: string = '';
    isMemberInfoExists: boolean = false;
    isMemberByStatusExists: boolean = false;
    isMemberSnapshotExists: boolean = false;
    ismemberBookingExists: boolean = false;
    ismemberShipBookingExists: boolean = false;
    ismemberServicesExists: boolean = false;
    ismemberProductsExists: boolean = false;
    ismembersAttendanceExists: boolean = false;
    ismembersBookingeExists: boolean = false;
    ismembersClubVisitsExists: boolean = false;
    ismembersPaymentExists: boolean = false;
    isMemberServiceAndAttendanceExists: boolean = false;


    maxDate: Date = new Date();
    currentDate: Date = new Date();
    
    customerType = CustomerType;
    //dateFormatforAttendanceSummary: string = 'EEE MMM d y';
    //dateFormatforServicesSummary: string = 'MMM y';
    //dateFormatforSeervicesSummary: string = 'MMdy';
    dateFormatForChart: string = "";//'MMM d, y';
    dateFormat: string = 'yyyy-MM-dd';
    currencyFormat: string;
    packageIdSubscription: SubscriptionLike;
    // ************* Model and Collection ****************
    memberDashboardSearchParam: MemberDashboardSearchParam = new MemberDashboardSearchParam();
    memberSnapshot: MemberSnapshot;
    memberBooking: MemberBooking[] = [];
    memberMemberShipBooking: MemberBooking[] = [];
    memberServices: MemberServices[] = [];
    memberProducts: MemberProducts[] = [];
    memberByStatus: MemberByStatus[] = [];
    memberAttendanceSummary: MemberAttendanceSummary[] = [];
    memberClubVisits: MemberClubVisits[] = [];
    memberPayment: MemberPayment[] = [];
    memberServiceAndAttendance: MemberServiceAndAttendance[] = [];
    forAttendanceDate: any;
    types: string[] = ["area", "stackedarea", "fullstackedarea"];
    package = ENU_Package;
    PaymentStatusType : any = Configurations.PaymentStatusType;

    /***********Messages*********/
    messages = Messages;

    constructor(private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
    ) {
        super();
    }

    ngOnInit() {
        this.memberDashboardSearchParam.paymentStatusTypeID = this.PaymentStatusType[0].value;
        this.getBranchDatePattern();
       
    }

    ngOnDestroy() {
        this.packageIdSubscription.unsubscribe();
    }

    onAttendanceSummaryDateChange() {
        this.getMemberAttendanceSummary();
    }

    onMemberActivityDateChange() {
        this.getMemberSale();
    }

    onMemberStatusDateChange() {
        this.getmeberByStatus();
    }
    onMemberServiceandAttendanceDateChange() {
        this.getMemberServicesandAttendance();
    }

    onMemberClubVisitsDateChange() {
        this.getMemberClubVisits();
    }

    onMemberPaymentDateChange() {
        this.getAllMemberPayment();
    }

    onDateChange($event, dashboardID: number) {
        if ($event != undefined) {
            this.memberDashboardSearchParam.DateFrom = $event.DateFrom;
            this.memberDashboardSearchParam.DateTo = $event.DateTo;
        }

        switch (dashboardID) {
            case this.DataChangeDashboard.VisitInClub:
                this.onMemberClubVisitsDateChange();
                break;
            case this.DataChangeDashboard.MembersActivities:
                this.onMemberActivityDateChange();
                break;
            case this.DataChangeDashboard.Attendance:
                this.onAttendanceSummaryDateChange();
                break;
            case this.DataChangeDashboard.MembersbyStatus:
                this.onMemberStatusDateChange();
                break;
            case this.DataChangeDashboard.ServicesBookedandCompleted:
                this.onMemberServiceandAttendanceDateChange();
                break;
            case this.DataChangeDashboard.Payment:
                this.onMemberPaymentDateChange();
                break;

        }
    }

    async getBranchDatePattern() {
        this.dateFormatForChart = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormatforReturingClient);

         //  this.memberDashboardSearchParam.ServiceDate = this._dateTimeService.convertDateObjToString(this.memberActivityDateFrom, this.dateFormat);

         let branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

         this.memberDashboardSearchParam.DateFrom = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormat);
         this.memberDashboardSearchParam.DateTo = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormat);
 
 
         this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
             if (packageId && packageId > 0) {
                 this.setPermissions(packageId);
             }
 
         });
 
         this.getMemberSnapshot();
         this.onMemberActivityDateChange();
         this.onMemberStatusDateChange();
         this.onAttendanceSummaryDateChange();
         this.onMemberClubVisitsDateChange();
         this.onMemberServiceandAttendanceDateChange();
         this.onMemberPaymentDateChange();
         //  this.dataSource = this.getComplaintsData();

         const branch = await super.getBranchDetail(this._dataSharingService);
         if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.Currency;
            currencyCode = branch.Currency;
         }
         
    }

    getMemberSnapshot() {

        this._httpService.get(MemberApi.getMemberSnapshot)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.memberSnapshot = new MemberSnapshot();

                    this.isMemberSnapshotExists = res.Result != null ? true : false;
                    if (this.isMemberSnapshotExists) {
                        this.memberSnapshot = res.Result[0];
                    }

                    if (this.memberSnapshot.MoreThanFiftyTimes == null) {
                        this.memberSnapshot.MoreThanFiftyTimes = 0;
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            );
    }

    getMemberSale() {
        let params = {
            memberId: this.memberID,
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo,
            CustomerTypeID: this.customerType.Member
        }

        this._httpService.get(MemberApi.getMemberSale, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isMemberInfoExists = res.Result != null ? true : false;
                    if (this.isMemberInfoExists) {
                        this.ismemberBookingExists = res.Result.ClassCountList != null && res.Result.ClassCountList.length > 0 ? true : false;
                        this.ismemberShipBookingExists = res.Result.MemberShipCountList != null && res.Result.MemberShipCountList.length > 0 ? true : false;
                        this.ismemberServicesExists = res.Result.ServiceCountList != null && res.Result.ServiceCountList.length > 0 ? true : false;
                        this.ismemberProductsExists = res.Result.ProductCountList != null && res.Result.ProductCountList.length > 0 ? true : false;
                        if (this.ismemberBookingExists) {
                            this.memberBooking = res.Result.ClassCountList;
                        }
                        if (this.ismemberServicesExists) {
                            this.memberServices = res.Result.ServiceCountList;
                        }
                        if (this.ismemberProductsExists) {
                            this.memberProducts = res.Result.ProductCountList;
                        }
                        if (this.ismemberShipBookingExists) {
                            this.memberMemberShipBooking = res.Result.MemberShipCountList;
                        }
                    }
                    else {
                        this.memberBooking = [];
                        this.memberServices = [];
                        this.memberProducts = [];
                        this.memberMemberShipBooking = [];
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);

                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            );
    }

    getmeberByStatus() {
        let params = {
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo
        }

        this._httpService.get(MemberApi.getMemberByStaus, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isMemberByStatusExists = res.Result != null ? true : false;
                    if (this.isMemberByStatusExists) {
                        this.memberByStatus = res.Result;
                    }
                    else {
                        this.memberByStatus = [];
                    }
                } else {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            );
    }

    getMemberAttendanceSummary() {
        let params = {
            customerId: null,
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo

        }

        this._httpService.get(MemberApi.getAllMemberAttendanceSummary, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.ismembersAttendanceExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.ismembersAttendanceExists) {
                        this.memberAttendanceSummary = res.Result;
                        this.setAttendanceSummaryDate();
                    }
                } else {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));

                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            );
    }

    getMemberClubVisits() {
        let params = {
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo,
        }

        this._httpService.get(MemberApi.getMemberClubVisits, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.ismembersClubVisitsExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.ismembersClubVisitsExists) {
                        this.memberClubVisits = res.Result;
                        this.setClubVisitsDate();
                    }
                } else {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            );
    }

    getAllMemberPayment() {
        let params = {
            paymentStatusTypeID: this.memberDashboardSearchParam.paymentStatusTypeID,
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo
        }

        this._httpService.get(MemberApi.getAllMemberPayment, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.ismembersPaymentExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.ismembersPaymentExists) {
                        this.memberPayment = res.Result;
                        this.setPaymenteDate();
                    }
                    else {
                        this.memberPayment = [];
                    }
                } else {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));

                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            );
    }

    getMemberServicesandAttendance() {
        let params = {
            fromDate: this.memberDashboardSearchParam.DateFrom,
            toDate: this.memberDashboardSearchParam.DateTo
        }

        this._httpService.get(MemberApi.getMemberServicesandAttendance, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isMemberServiceAndAttendanceExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isMemberServiceAndAttendanceExists) {
                        this.memberServiceAndAttendance = res.Result;
                        this.setServiceAndAttendanceDate();
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
                }
            );
    }

    getDateString(dateValue: Date, dateFormat: string) {
        return this._dateTimeService.convertDateObjToString(dateValue, dateFormat);
    }

    setClubVisitsDate() {
        this.memberClubVisits.forEach(element => {
            element.Date = this._dateTimeService.convertDateObjToString(new Date(element.Date), this.dateFormatForChart);
        });
    }

    setAttendanceSummaryDate() {
        this.memberAttendanceSummary.forEach(element => {
            element.ClockInDate = this._dateTimeService.convertDateObjToString(new Date(element.ClockInDate), this.dateFormatForChart);
        });
    }

    setServiceAndAttendanceDate() {
        this.memberServiceAndAttendance.forEach(element => {
            element.Date = this._dateTimeService.convertDateObjToString(new Date(element.Date), this.dateFormatForChart);
        });
    }

    setPaymenteDate() {
        this.memberPayment.forEach(element => {
            element.MonthNames = this._dateTimeService.convertDateObjToString(new Date(element.MonthNames), this.dateFormatForChart);
        });
    }

    customizeSeries(valueFromNameField: number) {
        return valueFromNameField === 2009 ?
            { type: "line", label: { visible: true }, color: "#ff3f7a" } : {};
    }

    clubVisits: ClubVisitsStatic[] = [
        { value: "Total", name: "Club Visits" }
    ];


    customizeProductLabel(point) {
        return point.argumentText = currencyCode + " : " + point.valueText;
    }

    customizeServicesLabel(point) {
        return point.argumentText = currencyCode + " : " + point.valueText;
    }
    customizeBookingLabel(point) {
        return point.argumentText = currencyCode + " : " + point.valueText;
    }

    customizeProductTooltip = (arg: any) => {
        return {
            text: arg.argumentText + " Sale : " + arg.valueText
        };
    }

    customizeServicesTooltip = (arg: any) => {
        return {
            text: arg.argumentText + " Sale : " + arg.valueText
        };
    }

    customizeBookingTooltip = (arg: any) => {
        return {
            text: arg.argumentText + " Sale : " + arg.valueText
        };
    }


    memberBookingcustomizePoint(arg: any) {
        var enumSaleSourceType = EnumSaleSourceType;
        switch (arg.data.AppSourceTypeID) {
            case enumSaleSourceType.App:
                return { color: "#F6A261" };
            case enumSaleSourceType.OnSite:
                return { color: "#BFE1FF" };
            case enumSaleSourceType.Shop:
                return { color: "#BCD556" };
        }
    }
    memberMemberShipBookingcustomizePoint(arg: any) {
        var enumSaleSourceType = EnumSaleSourceType;
        switch (arg.data.AppSourceTypeID) {
            case enumSaleSourceType.App:
                return { color: "#F6A261" };
            case enumSaleSourceType.OnSite:
                return { color: "#BFE1FF" };
            case enumSaleSourceType.Shop:
                return { color: "#BCD556" };
        }
    }
    memberServicecustomizePoint(arg: any) {
        var enumSaleSourceType = EnumSaleSourceType;
        switch (arg.data.AppSourceTypeID) {
            case enumSaleSourceType.App:
                return { color: "#F6A261" };
            case enumSaleSourceType.OnSite:
                return { color: "#BFE1FF" };
            case enumSaleSourceType.Shop:
                return { color: "#BCD556" };
        }
    }

    memberProductcustomizePoint(arg: any) {
        var enumSaleSourceType = EnumSaleSourceType;
        switch (arg.data.AppSourceTypeID) {
            case enumSaleSourceType.App:
                return { color: "#F6A261" };
            case enumSaleSourceType.OnSite:
                return { color: "#BFE1FF" };
            case enumSaleSourceType.Shop:
                return { color: "#BCD556" };
        }
    }

    memberByStatuscustomizePoint(arg: any) {
        var enumMembershipStatus = MembershipStatus_Enum;
        switch (arg.data.MembershipStatusTypeID) {
            case enumMembershipStatus.Terminated:
                return { color: "#FEBF05" };
            case enumMembershipStatus.Expired:
                return { color: "#F8CAA6" };
            case enumMembershipStatus.Frozen:
                return { color: "#BCD556" };
            case enumMembershipStatus.Active:
                return { color: "#E97C82" };
        }
    }

    attendancecustomizeTooltip(arg: any) {
        return {
            text: arg.seriesName + ' : ' + arg.value
        };
    }
    customizeMemberhipBookingTooltip(arg: any) {
        return {
            text: arg.argumentText + ' : ' + arg.value
        };
    }
    customizeClassesBookingTooltip(arg: any) {
        return {
            text: arg.argumentText + ' : ' + arg.value
        };
    }
    customizeServicesBookingTooltip(arg: any) {
        return {
            text: arg.argumentText + ' : ' + arg.value
        };
    }
    customizeProductBookingTooltip(arg: any) {
        return {
            text: arg.argumentText + ' : ' + arg.value
        };
    }
    VisitInClubcustomizeTooltip(arg: any) {
        return {
            text: arg.seriesName + ' : ' + arg.value
        };
    }

    MembershipbyStatuscustomizeTooltip(arg: any) {
        return {
            text: arg.argument + ' : ' + arg.value
        };
    }

    memberPaymentcustomizeTooltip(arg: any) {
        var enumMemberPayment = EnumMemberPayment;

        return {
            text: arg.seriesName + ' : ' + arg.value
        };
    }


    setPermissions(packageId: number) {
        switch (packageId) {

            case this.package.WellnessBasic:
                this.allowedPages.ServiceDashboard = true
                break;

            case this.package.WellnessMedium:
                this.allowedPages.ServiceDashboard = true,
                    this.allowedPages.ProductDashboard = true,
                    this.allowedPages.ServiceBookedAndAttendance = true
                break;

            case this.package.WellnessTop:
                this.allowedPages.ServiceDashboard = true,
                    this.allowedPages.ProductDashboard = true,
                    this.allowedPages.MembershipStatusDashboard = true,
                    this.allowedPages.ServiceBookedAndAttendance = true
                break;

            case this.package.FitnessMedium:
                this.allowedPages.ProductDashboard = true,
                    this.allowedPages.MembershipStatusDashboard = true
                break;

            case this.package.Full:
                this.allowedPages.ServiceDashboard = true,
                    this.allowedPages.ProductDashboard = true,
                    this.allowedPages.MembershipStatusDashboard = true,
                    this.allowedPages.ServiceBookedAndAttendance = true
                break;

        }
    }

}


export class ClubVisitsStatic {
    value: string;
    name: string;
}

