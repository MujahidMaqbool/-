/************************* Angular References ***********************************/
import { Component, ViewChild } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { HomeApi, StaffDashboardApi, ClientApi, LeadApi, MemberApi, RewardProgramApi } from 'src/app/helper/config/app.webapi';
import { StaffAttendance, MemberAttendance, SaleTypeSummary, MainDashboardSearchParams, MembersContract, MembershipStatus, PersonInfo, StaffPendingTask, TotalSaleSummary, MemberContract, RewardProgramSummaryViewModel } from 'src/app/models/home.dashboard.model';
//import {MomentDateAdapter} from '@angular/material-moment-adapter';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports

/********************** Service & Models *********************/

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
/* Models */
import { StaffSchedulerHours } from 'src/app/staff/models/staff.model';
import { IMonthlyVisits, IServicesandAttendanceBooking, IMonthlySales, IClientVisits } from 'src/app/customer/client/models/client.dashboard.model';
import { LeadFlow, LeadActivity, AtivtiesSummary, LeadStatusTypeList } from 'src/app/lead/models/lead.dashboard.model';
import { MemberBooking, MemberServices, MemberProducts, TotalRevenue, TotalSaleCount, LeadStatusTypeListMainDashBorad } from 'src/app/customer/member/models/member.dashboard.model';

/************************* Component & Common ***********************************/
import { ViewMemberDetail } from 'src/app/customer/member/view/view.member.detail.component';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
/********************** Configurations *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { Configurations } from 'src/app/helper/config/app.config';
import { environment } from 'src/environments/environment';
import { CustomerType, MembershipStatus_Enum, LeadStatusType, EnumSaleSourceType, ENU_Package, ENU_ActivityType, EnumMemberDashboardSaleType, ENU_DateFormatName, ENU_MainDashboard_ClubVisitGraphType, EnumNetSaleSourceType } from 'src/app/helper/config/app.enums';
import { SubscriptionLike } from 'rxjs';
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';
import { ImagesPlaceholder } from 'src/app/helper/config/app.placeholder';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import * as moment from 'moment';
import { variables } from 'src/app/helper/config/app.variable';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
var currencyCode: any;
var currencySymbolForRevenue: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent extends AbstractGenericComponent {


  // #region Local Members

  DataChangeDashboard = {
    RecentAttendanceMember: 1,
    Customers: 2,
    RecentAttendanceStaff: 3,
    StaffPendingTask: 4,
    LeadFlow: 5,
    Sales: 6,
    MembersbyContractTime: 7,
    MembersbyStatus: 8,
    ShiftForecast: 9,
    ClientVisits: 10,
    ServicesBookedandCompleted: 11,
    MembersActivities: 12,
    LeadActivities: 13,
    LeadSummary: 14,
    MonthlySales: 15,
    MemberSale: 16,
    LeadsAssignedToStaff: 17
  };


  AllowedDashboard = {
    staffPendingTask:false,
    RecentAttendanceMember: false,
    Customers: false,
    StaffSchedulerHours: false,
    StaffPendingTask: false,
    LeadFlow: false,
    Sales: false,
    MembersbyStatus: false,
    ShiftForecast: false,
    ClientVisits: false,
    ServicesBookedandCompleted: false,
    MembersActivities: false,
    LeadSummary: false,
    MonthlySales: false,
    StaffActualHours: false,
    AttendanceStaff: false,
    MemberService: false,
    MemberAllActivities: false,
    MembersContractTime: false,
    MembersStatus: false,
    LeadAllActivities: false,
    MemberAttendance: false,
    RewardProgramSummary: false
  };


  @ViewChild('dateCompoRefForForecastDashoboard') dateCompoRefForForecastDashoboard: DateToDateFromComponent;
  @ViewChild('fromToDateComoRef') fromToDateComoRef: DateToDateFromComponent;
  @ViewChild('vcfromToDateComoRef') vcfromToDateComoRef: DateToDateFromComponent;
  // ************* Local ****************
  maxDate: Date = new Date();
  currentDate: Date = new Date();
  leadActivtiesDate: Date = new Date();
  activtiesDateFrom: Date = new Date();
  dateFormatForDP: string = 'yyyy-MM-dd';
  // FromDate: Date = new Date();
  // ToDate: Date = new Date();
  CustomerID: number = 0;
  selectedRewardProgramID: number = null;
  customerTypeIdBooked: number = 0;
  customerTypeIdVisits: number = 0;
  saleTypeID: number = 1;
  memberID: number = 0;
  customerTypeID: number = 0;
  customerTypeIDForSale: number = 0;
  customerTypeIdRecentCustomers: number = 0;
  newLeadsCount: number = 0;
  wonLeadsCount: number = 0;
  lostLeadsCount: number = 0;
  currencyFormat: string;
  currencySymbol: string;
  isFitnessMedium: boolean;
  isWellnessMedium: boolean;
  isWellnessTop: boolean;

  isAttendanceMember: boolean = false;
  isCustomer: boolean = false;
  isLeadFlow: boolean = false;
  isSale: boolean = false;
  isMembersContractTime: boolean = false;
  isMembersStatus: boolean = false;
  isShiftForecast: boolean = false;
  isClientVisits: boolean = false;
  isServicesBookedandCompleted: boolean = false;
  isAttendanceStaff: boolean = false;
  //isStaffAttendanceScheduleHours = false;
  isStaffAttendanceActualHours = false;
  isPendingTask: boolean = false;
  isAllActivities: boolean = false;
  isActivities: boolean = false;
  isMonthlySales: boolean = false;
  isMemberService: boolean = false;


  isMemberAttendanceExsist: boolean = false;
  ismembersContractsExsist: boolean = false;
  isMembershipsStatusExsist: boolean = false;
  isStaffAttendanceExsist: boolean = false;
  saleTypeSummaryExsist: boolean = false;
  isPersonInfoExsist: boolean = false;
  isTotalSaleSummaryExsist: boolean = false;
  isStaffPendingTaskExsist: boolean = false;
  isMembershipStatusExsist: boolean = false;
  isMemberContractExsist: boolean = false;
  isClientVisitsExists: boolean = false;
  isLeadFlowDataExists: boolean = false;
  isServicesandAttendanceExists: boolean = false;
  ismemberBookingExists: boolean = false;
  ismemberMemberShipBookingExists: boolean = false;
  ismemberServicesExists: boolean = false;
  ismemberProductsExists: boolean = false;
  isMemberInfoExists: boolean = false;
  isLeadActivitiesDataExists: boolean = false;
  isMonthlySalesExists: boolean = false;
  TotalRevenueOfBookingsExists: boolean;
  imagePath = ImagesPlaceholder.user;;
  serverImageAddress = environment.imageUrl;
  dateFormatForSearch = Configurations.DashboardDateFormat;
  dateFormatForView: string = Configurations.DateFormat;
  timeFormat = Configurations.TimeFormat;
  dateFormatforBooked: string = ""; // 'EEE MMM d y';
  attendnaceformat: string = ""; // 'YYYY-MM-DD HH:mm'
  dashBoardLastVisitDateFormat: string = "";
  dateTimeFormat: string = "";
  customerTypeIdSalesSummary: number = 0;
  ownLeads: any;
  saleSourceTypeId: number = 0;
  isTotalBookingRevExists: boolean;
  tickIntervalSaleBySource: number = 10;
  tickIntervalSale: number = 1;
  shiftForecastDateFormat: string = "";

  /***********Messages*********/
  messages = Messages;
  // ************* Model and Collection ****************

  package = ENU_Package;
  activityType = ENU_ActivityType;
  leadStatusType = LeadStatusType;
  mainDashboard_ClubVisitGraphType = ENU_MainDashboard_ClubVisitGraphType;
  staffSchedulerHours: any;
  mainDashboardSearchParams: MainDashboardSearchParams = new MainDashboardSearchParams();
  splitSchedulerHours: any[] = [];
  memberAttendance: MemberAttendance[] = [];
  staffAttendance: StaffAttendance[] = [];
  saleTypeSummary: SaleTypeSummary[] = [];
  membersContract: MembersContract[] = [];
  staffPendingTask: StaffPendingTask[] = [];
  personInfo: PersonInfo[] = [];
  membershipStatus: MembershipStatus[] = [];
  memberContract: MemberContract[] = [];
  monthlyVisits: IMonthlyVisits[] = [];
  leadFlowDashboard: LeadFlow[] = [];
  memberBooking: MemberBooking[] = [];
  memberMemberShipBooking: MemberBooking[] = [];
  TotalRevenueOfBookings: TotalRevenue[] = [];
  memberServices: MemberServices[] = [];
  memberProducts: MemberProducts[] = [];
  servicesandAttendanceBooking: IServicesandAttendanceBooking[] = [];
  leadActivityTypeList: LeadActivity[] = [];
  leadActivitySummary: AtivtiesSummary[] = [];
  leadStatusTypeFriendlyViewModel: LeadStatusTypeListMainDashBorad[] = [];
  leadActivities: any[] = [];
  branchRewardProgramList: any[] = [];
  monthlySales: IMonthlySales[] = [];
  totalSaleSummary: TotalSaleSummary = new TotalSaleSummary();
  rewardProgramSummaryViewModel: RewardProgramSummaryViewModel = new RewardProgramSummaryViewModel();
  totalSaleCount: TotalSaleCount = new TotalSaleCount();
  saleType: any[] = [];
  customerTypeList: any[];
  customerVisit: any[];
  allSaleSourceType = Configurations.AllSaleSourceType;
  packageIdSubscription: SubscriptionLike;
  // #endregion

  // ************* Class Constructor ****************

  constructor(private _httpService: HttpService,
    private _messageService: MessageService,
    private _dateTimeService: DateTimeService,
    private _memberActionDialogue: MatDialogService,
    private _dataSharingService: DataSharingService) {
    super();
  }

  // #region Events

  ngOnInit() {
    this.getCurrentBranchDetail();
  }

  ngAfterViewInit() {
    //---not useing yet ---- this.onTotalSaleSummaryChange();---------//

  }

  /*******/

  reciviedDateTo($event) {
    this.mainDashboardSearchParams.DateFrom = $event.DateFrom;
    this.mainDashboardSearchParams.DateTo = $event.DateTo;
  }

  onFromDateChange(date: any) {
    this.mainDashboardSearchParams.DateFrom = date;
  }

  onToDateChange(date: any) {
    this.mainDashboardSearchParams.DateTo = date;
  }
  /********/

  onDateChnage($event) {
    this.mainDashboardSearchParams.DateFrom = $event.DateFrom;
    this.mainDashboardSearchParams.DateTo = $event.DateTo;
  }

  onSaleTypeSummaryDateChange() {
    this.getSaleTypeSummary();
  }

  onMembershipStatusDateChange() {
    this.getMembershipStatus();
  }

  onStaffPendingTaskDateChange() {
    this.getStaffPendingTask();
  }

  onTotalSaleSummaryChange() {
    this.getTotalSaleSummary();
  }

  onMonthlyVisitsDateChange() {
    this.getMonthlyVisitsByDate();
  }

  onSchedulerHoursDateChange() {
    this.getStaffScheduledHours();
  }

  onBookedServicesDateChange() {
    this.getBookedServicesByDate();
  }

  onSchedulerHourFromDateChange(date: Date) {
    this.mainDashboardSearchParams.DateFrom = this._dateTimeService.convertDateObjToString(date, this.dateFormatForSearch); // 07/05/2018 MM/dd/yyyy
  }

  onLeadFlowDateChange() {
    this.getLeadFlow();
  }
  onCustomerTypeChange(event, dashboardID) {

    switch (dashboardID) {
      case this.DataChangeDashboard.StaffPendingTask:
        this.onStaffPendingTaskDateChange();
        break;
      case this.DataChangeDashboard.LeadFlow:
        this.onLeadFlowDateChange();
        break;
      case this.DataChangeDashboard.Sales:
        this.customerTypeIdSalesSummary = event;
        this.mainDashboardSearchParams.SaleType = event;
        this.onSaleTypeSummaryDateChange();
        break;
      case this.DataChangeDashboard.MembersbyStatus:
        this.onMembershipStatusDateChange();
        break;
      case this.DataChangeDashboard.ClientVisits:
        this.customerTypeIdVisits = event;
        this.onMonthlyVisitsDateChange();
        break;
      case this.DataChangeDashboard.ServicesBookedandCompleted:
        this.customerTypeIdBooked = event;
        this.onBookedServicesDateChange();
        break;
      case this.DataChangeDashboard.MembersActivities:
        this.onMemberActivityDateChange();
        break;
      case this.DataChangeDashboard.LeadSummary:
        this.onActivitySummaryDateChange();
        break;
      case this.DataChangeDashboard.LeadActivities:
        this.onActivitiesDateChange();
        break;
      case this.DataChangeDashboard.MemberSale:
        this.customerTypeIDForSale = event;
        this.getMemberSale();
        break;
      case this.DataChangeDashboard.Customers:
        this.mainDashboardSearchParams.PersonId = event;
        this.customerTypeIdRecentCustomers = event;
        this.getPersonInfo();
        break;
    }

  }
  onSaleSourceTypeChange(event) {
    this.saleSourceTypeId = event;
    this.getMonthlySalesByDate();
  }
  getLeadsAssignedToStaff() {
    let params = {
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo
    }

    this._httpService.get(LeadApi.getOwns, params)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this.ownLeads = response.Result;
          }
          
        },
        error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Owns Data")); }
      );
  }
  getLeadsStatus() {
    return new Promise((resolve, reject) => {
      let params = {
        fromDate: this.mainDashboardSearchParams.DateFrom,
        toDate: this.mainDashboardSearchParams.DateTo
      }

      this._httpService.get(LeadApi.getLeadFlow, params).subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this.leadStatusTypeFriendlyViewModel = response.Result;
            if (this.leadStatusTypeFriendlyViewModel && this.leadStatusTypeFriendlyViewModel.length > 0) {
              resolve(true);
            }
          }
          
        },
        error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Status Data")); }
      );
    })


  }
  openMemberDetailDialog(memberID: number) {
    this._memberActionDialogue.open(ViewMemberDetail, {
      disableClose: true,
      data: memberID,
    });

  }

  onSaleTypeChange(saleTypeID: number) {
    this.mainDashboardSearchParams.SaleType = saleTypeID;
    this.getSaleTypeSummary();
  }

  onMemberActivityDateChange() {
    this.getMemberSale();
  }

  onPersonChange(personID: number) {
    this.mainDashboardSearchParams.PersonId = personID;
    this.getPersonInfo();
  }

  onActivitiesDateChange() {
    this.getLeadActivities();

  }

  onActivitySummaryDateChange() {
    let params = {
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo
    }

    this._httpService.get(LeadApi.getActivitiesSummary, params).subscribe(
      data => {
        if (data && data.Result) {
          this.getLeadActivitySummary(data.Result);
        }
        else {
          this.getLeadActivitySummary(data.Result);
        }
      });

  }

  onOpenCalendar(picker: MatDatepicker<Date>) {
    picker.open();
  }

  ngOnDestroy() {
    this.packageIdSubscription.unsubscribe();
  }

  // #endregion



  // #region Methods
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

      this.mainDashboardSearchParams.DateFrom = $event.DateFrom;
      this.mainDashboardSearchParams.DateTo = $event.DateTo;
    } else {
      this.mainDashboardSearchParams.DateFrom = $event.DateFrom;
      this.mainDashboardSearchParams.DateTo = $event.DateTo;
    }
    if (new Date($event.DateFrom) < this.vcfromToDateComoRef.branchDate) {
      this.vcfromToDateComoRef.toMaxDate = new Date($event.DateFrom);
      this.vcfromToDateComoRef.toMaxDate.setMonth(this.vcfromToDateComoRef.toMaxDate.getMonth() + 1);
    }
    this.onMonthlyVisitsDateChange();
  }
  onDateChange($event, dashboardID: number) {
    if ($event != undefined) {
      this.mainDashboardSearchParams.DateFrom = $event.DateFrom;
      this.mainDashboardSearchParams.DateTo = $event.DateTo;
    }

    switch (dashboardID) {
      case this.DataChangeDashboard.StaffPendingTask:
        this.onStaffPendingTaskDateChange();
        break;
      case this.DataChangeDashboard.LeadFlow:
        this.onLeadFlowDateChange();
        break;
      case this.DataChangeDashboard.Sales:
        this.onSaleTypeSummaryDateChange();
        break;
      case this.DataChangeDashboard.MembersbyStatus:
        this.onMembershipStatusDateChange();
        break;
      case this.DataChangeDashboard.ClientVisits:
        this.onMonthlyVisitsDateChange();
        break;
      case this.DataChangeDashboard.ServicesBookedandCompleted:
        this.onBookedServicesDateChange();
        break;
      case this.DataChangeDashboard.MembersActivities:
        this.onMemberActivityDateChange();
        break;
      case this.DataChangeDashboard.LeadSummary:
        this.onActivitySummaryDateChange();
        break;
      case this.DataChangeDashboard.LeadActivities:
        // this.mainDashboardSearchParams.DateFrom = this.mainDashboardSearchParams.DateFrom;
        // this.mainDashboardSearchParams.DateTo = this.mainDashboardSearchParams.DateTo;
        this.onActivitiesDateChange();
        break;
      case this.DataChangeDashboard.LeadsAssignedToStaff:
        this.getLeadsStatus().then(() => {
          this.getLeadsAssignedToStaff();
        })
        break;
      case this.DataChangeDashboard.MonthlySales:
        this.getMonthlySalesByDate();
        break;
    }
  }

  setDashboardPermissions(packageID: number) {

    switch (packageID) {


      case this.package.WellnessBasic:
        this.isSale = true;
        this.filterSaleTypeList(packageID);
        break;

      case this.package.FitnessMedium:
        this.AllowedDashboard.StaffSchedulerHours = true;
        this.AllowedDashboard.StaffPendingTask = true;
        this.AllowedDashboard.Customers = true;
        // this.AllowedDashboard.ServicesBookedandCompleted = true;
        this.AllowedDashboard.Sales = true;
        this.AllowedDashboard.MemberAllActivities = true;
        this.AllowedDashboard.MemberAttendance = true;
        this.AllowedDashboard.MembersContractTime = true;
        this.AllowedDashboard.MembersStatus = true;
        this.AllowedDashboard.MonthlySales = true;
        this.setCustomerTypeList(packageID);
        this.filterSaleTypeList(packageID);
        this.fitnessMediumPackageDashboard();
        this.getPersonInfo();

        break;

      case this.package.Full:
        this.AllowedDashboard.StaffSchedulerHours = true;
        this.AllowedDashboard.StaffActualHours = true;
        this.AllowedDashboard.AttendanceStaff = true;
        this.AllowedDashboard.StaffPendingTask = true;
        this.AllowedDashboard.ClientVisits = true;
        this.AllowedDashboard.MonthlySales = true;
        this.AllowedDashboard.Customers = true;
        this.AllowedDashboard.ServicesBookedandCompleted = true;
        this.AllowedDashboard.Sales = true;
        this.AllowedDashboard.MemberService = true;
        this.AllowedDashboard.MemberAllActivities = true;
        this.AllowedDashboard.MemberAttendance = true;
        this.AllowedDashboard.LeadFlow = true;
        this.AllowedDashboard.MembersContractTime = true;
        this.AllowedDashboard.MembersStatus = true;
        this.AllowedDashboard.LeadAllActivities = true;
        this.AllowedDashboard.RewardProgramSummary = true;
        this.setCustomerTypeList(packageID);
        this.filterSaleTypeList(packageID);
        this.wellnessFullPackageDashboard();
        this.getPersonInfo();
        this.getRewardProgramList();
        this.getRewardProgramSummary();
        this.getLeadsStatus().then(() => {
          this.getLeadsAssignedToStaff();
        })

        break;

      case this.package.WellnessMedium:
        this.AllowedDashboard.StaffSchedulerHours = true;
        this.AllowedDashboard.StaffPendingTask = true;
        this.AllowedDashboard.ClientVisits = true;
        this.AllowedDashboard.MonthlySales = true;
        this.AllowedDashboard.Customers = true;
        this.AllowedDashboard.ServicesBookedandCompleted = true;
        this.AllowedDashboard.Sales = true;
        this.filterSaleTypeList(packageID);
        this.setCustomerTypeList(packageID);
        this.wellnessMediumPackageDashboard();
        this.getPersonInfo();

        break;

      case this.package.WellnessTop:
        this.AllowedDashboard.StaffSchedulerHours = true;
        this.AllowedDashboard.StaffActualHours = true;
        this.AllowedDashboard.AttendanceStaff = true;
        this.AllowedDashboard.StaffPendingTask = true;
        this.AllowedDashboard.ClientVisits = true;
        this.AllowedDashboard.MonthlySales = true;
        this.AllowedDashboard.Customers = true;
        this.AllowedDashboard.ServicesBookedandCompleted = true;
        this.AllowedDashboard.Sales = true;
        this.AllowedDashboard.MemberService = true;
        this.filterSaleTypeList(packageID);
        this.setCustomerTypeList(packageID);
        this.wellnessTopPackageDashboard();
        this.getPersonInfo();

        break;
    }
  }

  setClientVisitsDate() {
    this.monthlyVisits.forEach(element => {
      if (element.GraphType === this.mainDashboard_ClubVisitGraphType.Hour) {
        element.Time = this._dateTimeService.formatTimeString(element.Time, this.timeFormat);
      } else {
        if (element.GraphType === this.mainDashboard_ClubVisitGraphType.Date) {
          element.Time = this._dateTimeService.convertDateObjToString(new Date(element.Time), this.dateFormatforBooked);
        }
      }
    });
  }

  fromDateChange(date: Date) {
    this.mainDashboardSearchParams.DateFrom = this._dateTimeService.convertDateObjToString(date, this.dateFormatForSearch); // 07/05/2018 MM/dd/yyyy
  }

  toDateChange(date: Date) {
    this.mainDashboardSearchParams.DateTo = this._dateTimeService.convertDateObjToString(date, this.dateFormatForSearch); // 07/05/2018 MM/dd/yyyy
  }

  setMemerImagePath() {
    this.memberAttendance.forEach(element => {
      if (element.ImagePath != "" && element.ImagePath != null) {
        element.ImagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setCustomerImagePath()) + element.ImagePath;
        // element.AttendanceTime = this._dateTimeService.formatTimeString(element.AttendanceTime);
      }
      else {
        element.ImagePath = this.imagePath;
        //element.AttendanceTime = this._dateTimeService.formatTimeString(element.AttendanceTime);
      }
      //element.ClockInDate = moment.parseZone(element.ClockInDate).format(this.attendnaceformat);
    });
  }

  setPersonImagePath() {
    this.personInfo.forEach(element => {
      if (element.ImagePath != "" && element.ImagePath != null) {
        element.ImagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setCustomerImagePath()) + element.ImagePath;
      }
      else {
        element.ImagePath = this.imagePath;
      }
      //element.LastVisitDate = moment.parseZone(element.LastVisitDate).format(this.attendnaceformat);
      //element.LastVisitDate = this._dateTimeService.convertDateObjToString(element.LastVisitDate, this.dateFormatForView);
    });
  }

  setStaffPendingTaskImagePath() {

    this.staffPendingTask.forEach(element => {
      if (element.ImagePath != "" && element.ImagePath != null) {
        element.ImagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setStaffImagePath()) + element.ImagePath;
      }
      else {
        element.ImagePath = this.imagePath;
      }
      element.FollowUpDate = this._dateTimeService.convertDateObjToString(new Date(element.FollowUpDate), this.dateFormatForSearch);
      element.FollowUpStartTime = this._dateTimeService.formatTimeString(element.FollowUpStartTime);
      element.FollowUpEndTime = this._dateTimeService.formatTimeString(element.FollowUpEndTime);
    });
  }

  setStaffImagePath() {
    this.staffAttendance.forEach(element => {
      if (element.ImagePath != "" && element.ImagePath != null) {
        element.ImagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setStaffImagePath()) + element.ImagePath;
        //element.ClockIn = this._dateTimeService.formatTimeString(element.ClockIn);
      }
      else {
        element.ImagePath = this.imagePath;
      }
      element.ClockDate = this._dateTimeService.convertDateObjToString(new Date(element.ClockDate), this.dateFormatForSearch);
    });
  }

  setBookingDate() {
    this.servicesandAttendanceBooking.forEach(element => {
      element.Date = this._dateTimeService.convertDateObjToString(new Date(element.Date), this.dateFormatforBooked);
    });
  }

  async getCurrentBranchDetail() {
    this.dateFormatForView = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    this.shiftForecastDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.ShiftForeCastDateFormat);
    this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
    this.dateTimeFormat = this.dateFormatForView + " " + this.timeFormat;
    this.dateFormatforBooked = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormatforBooked);
    this.attendnaceformat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.Attendnaceformat);
    this.dashBoardLastVisitDateFormat = await super.getBranchTimeFormat(this._dataSharingService);
    this.customerTypeList = Configurations.CustomerList;
    this.customerVisit = Configurations.CustomerList.filter(x => x.CustomerTypeID != 2);
    this.CustomerID = this.customerVisit[0].CustomerTypeID;
    this.mainDashboardSearchParams.SaleType = this.saleTypeID;
    this.mainDashboardSearchParams.PersonId = this.customerTypeID;
    let branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
    this.mainDashboardSearchParams.DateFrom = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormatForSearch);
    this.mainDashboardSearchParams.DateTo = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormatForSearch);
    this.leadActivtiesDate = branchCurrentDate;
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
      if (packageId && packageId > 0) {
        this.setDashboardPermissions(packageId);
      }
    });

    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.Currency;
      currencyCode = branch.Currency;
      this.currencySymbol = branch.CurrencySymbol;
      currencySymbolForRevenue = branch.CurrencySymbol;
    }
  }

  getRewardProgramList() {

    this._httpService.get(HomeApi.getBranchActiveRewardProgramList).subscribe(
      (res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.branchRewardProgramList = res.Result;
        }
      });
  }

  getRewardProgramSummary() {
    let params = {
      RewardProgramID: this.selectedRewardProgramID,
      PageModuleID: 1,
    }

    this._httpService.get(RewardProgramApi.getRewardProgramSummary, params).subscribe(
      (res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.rewardProgramSummaryViewModel = res.Result;
        }
      });
  }

  getLeadActivities() {
    //this.mainDashboardSearchParams.DateFrom = this._dateTimeService.convertDateObjToString(new Date(this.leadActivtiesDate), this.dateFormat);
    let params = {
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo
    }

    this._httpService.get(LeadApi.getActivities, params).subscribe(
      (res: ApiResponse) => {
        if (res.Result) {
          this.isLeadActivitiesDataExists = res.Result != null && res.Result.length > 0 ? true : false;
          this.leadActivityTypeList = res.Result;
        }
        else {
          this.isLeadActivitiesDataExists = false;
          this.leadActivityTypeList = []
        }
      });
  }

  getMonthlyVisitsByDate() {
    let params = {
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo,
      customerTypeID: this.customerTypeIdVisits
    }

    if (this._dateTimeService.compareTwoDates(new Date(this.mainDashboardSearchParams.DateFrom), new Date(this.mainDashboardSearchParams.DateTo))) {
      this._httpService.get(ClientApi.getMonthlyVisitsByDate, params)
        .subscribe(data => {
          this.isClientVisitsExists = data.Result != null && data.Result.length ? true : false;
          if (this.isClientVisitsExists) {
            this.monthlyVisits = data.Result;
            this.setClientVisitsDate();
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

  getStaffScheduledHours() {
    let params = {
      startDate: this.mainDashboardSearchParams.DateFrom,
      endDate: this.mainDashboardSearchParams.DateTo
    }

    this._httpService.get(StaffDashboardApi.getStaffScheduledHours, params)
      .subscribe(
        (res: ApiResponse) => {
          if (res.Result != null) {
            this.staffSchedulerHours = res.Result;
            this.getLastWeekHoursDifference();
          }
          else {
            this.staffSchedulerHours = null;
          }
        },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Scheduler Hours"));
        })
  }

  getLastWeekHoursDifference() {
    if (this.staffSchedulerHours.ElapsedShiftHoursLastWeek != "0") {
      this.splitSchedulerHours = this.staffSchedulerHours.ElapsedShiftHoursLastWeek.split(' ');
      if (this.splitSchedulerHours[0] < 0) {
        this.staffSchedulerHours.ScheduledShiftHoursLastWeekPositive = false;
      }
    }
    if (this.staffSchedulerHours.ElapsedAttendanceHoursLastWeek != "0") {
      this.splitSchedulerHours = this.staffSchedulerHours.ElapsedAttendanceHoursLastWeek.split(' ');
      if (this.splitSchedulerHours[0] < 0) {
        this.staffSchedulerHours.ActualHoursLastWeekPositive = false;
      }
    }

  }

  getMemberAttendance() {

    this._httpService.get(HomeApi.getMemberAttendance)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.isMemberAttendanceExsist = res.Result != null ? true : false;
          if (this.isMemberAttendanceExsist) {
            this.memberAttendance = res.Result;
            this.setMemerImagePath();
          }
        } 
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Attendance"));
        }
      );
  }

  getStaffAttendance() {

    this._httpService.get(HomeApi.getStaffAttendance)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.isStaffAttendanceExsist = res.Result != null ? true : false;
          if (this.isStaffAttendanceExsist) {
            this.staffAttendance = res.Result;
            this.setStaffImagePath();
          }
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Staff Attendance"));
        }
      );
  }

  getSaleTypeSummary() {
    let params = {
      customerTypeID: this.customerTypeIdSalesSummary,
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo
    }
    this._httpService.get(HomeApi.getSaleTypeSummary, params)
      .subscribe(data => {
        this.saleTypeSummaryExsist = data.Result != null ? true : false;
        if (this.saleTypeSummaryExsist) {
          this.saleTypeSummary = data.Result;
          this.saleTypeSummary.forEach(x => {
            x.Month = x.Month + ' ' + String(x.Year);
          })
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Sale Summary"));
        }
      );
  }

  getMembersContract() {
    this._httpService.get(HomeApi.getMembersContract)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.ismembersContractsExsist = res.Result != null ? true : false;
          if (this.ismembersContractsExsist) {
            this.membersContract = res.Result;
          }
        } 
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Members Contract"));
        }
      );
  }

  getMembershipStatus() {
    let params = {
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo,
    }

    this._httpService.get(HomeApi.getMembershipStatus, params)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.isMembershipStatusExsist = res.Result != null ? true : false;
          if (this.isMembershipStatusExsist) {
            this.membershipStatus = res.Result;
          }
        } 
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Membership Status"));
        }
      );
  }

  getPersonInfo() {
    let url = HomeApi.getCustomerViewAll.replace("{customerTypeID}", String(this.mainDashboardSearchParams.PersonId));
    this._httpService.get(url)
      .subscribe(data => {
        this.isPersonInfoExsist = data.Result != null ? true : false;
        if (this.isPersonInfoExsist) {
          this.personInfo = data.Result;
          this.setPersonImagePath();
        }
        else {
          this.personInfo = [];
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Person Info"));
        }
      );
  }

  getTotalSaleSummary() {
    let params = {
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo
    }
    this._httpService.get(HomeApi.getTotalSaleSummary, params)
      .subscribe(data => {
        this.isTotalSaleSummaryExsist = data.Result != null ? true : false;
        if (this.isTotalSaleSummaryExsist) {
          this.totalSaleSummary = data.Result;
        }
        else {
          this.totalSaleSummary = null;
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Total Sale Summary"));
        }
      );
  }

  getStaffPendingTask() {
    let params = {
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo
    }

    if (this._dateTimeService.compareTwoDates(new Date(params.fromDate), new Date(params.toDate))) {
      this._httpService.get(HomeApi.getStaffPendingTask, params)
        .subscribe((response: ApiResponse) => {
          this.isStaffPendingTaskExsist = response.Result != null ? true : false;
          if (this.isStaffPendingTaskExsist) {
            this.staffPendingTask = response.Result;
            this.setStaffPendingTaskImagePath();
          }
          else {
            this.staffPendingTask = [];
          }
        },
          error => {
            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Staff Pending Task"));
          });
    }

    else {
      this._messageService.showErrorMessage(this.messages.Error.Invalid_FromDate);
    }
  }

  getMemberContract() {
    this._httpService.get(HomeApi.getMemberContract)
      .subscribe(data => {
        this.isMemberContractExsist = data.Result != null ? true : false;
        if (this.isMemberContractExsist) {
          this.memberContract = data.Result;
        }
        else {
          this.memberContract = [];
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Contract"));
        }
      );
  }

  getBookedServicesByDate() {
    let params = {
      personTypeID: this.customerTypeIdBooked,
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo,
      customerTypeID: this.customerTypeIdBooked
    }

    if (this._dateTimeService.compareTwoDates(new Date(this.mainDashboardSearchParams.DateFrom), new Date(this.mainDashboardSearchParams.DateTo))) {
      this._httpService.get(ClientApi.getBookedServicesByDate, params)
        .subscribe(data => {
          this.isServicesandAttendanceExists = data.Result != null && data.Result.length ? true : false
          if (this.isServicesandAttendanceExists) {
            this.servicesandAttendanceBooking = data.Result;
            this.setBookingDate();
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

  getDateString(dateValue: Date, dateFormat: string) {
    return this._dateTimeService.convertDateObjToString(dateValue, dateFormat);
  }

  getLeadFlow() {
    let params = {
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo
    }

    this._httpService.get(LeadApi.getLeadFlow, params)
      .subscribe((response: ApiResponse) => {
        this.isLeadFlowDataExists = response.Result != null && response.Result.length > 0 ? true : false
        if (this.isLeadFlowDataExists) {
          this.leadFlowDashboard = response.Result;
        }
        else {
          this.leadFlowDashboard = [];
        }
      },
        error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Flow")); }
      )

  }

  getMemberSale() {
    let params = {
      memberId: this.memberID,
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo,
      CustomerTypeID: this.customerTypeIDForSale
    }

    this._httpService.get(MemberApi.getMemberSale, params)
      .subscribe((response: ApiResponse) => {
        this.isMemberInfoExists = response.Result != null ? true : false;
        if (this.isMemberInfoExists) {
          this.ismemberBookingExists = response.Result.ClassCountList != null && response.Result.ClassCountList.length > 0 ? true : false;
          this.ismemberMemberShipBookingExists = response.Result.MemberShipCountList != null && response.Result.MemberShipCountList.length > 0 ? true : false;
          this.ismemberServicesExists = response.Result.ServiceCountList != null && response.Result.ServiceCountList.length > 0 ? true : false;
          this.ismemberProductsExists = response.Result.ProductCountList != null && response.Result.ProductCountList.length > 0 ? true : false;
          this.TotalRevenueOfBookingsExists = response.Result.TotalRevenue != null && response.Result.TotalRevenue.length > 0 ? true : false;
          if (this.ismemberBookingExists) {
            this.memberBooking = response.Result.ClassCountList;
            this.totalSaleCount.TotalClassSale = response.Result.TotalClassSale;
          } else {
            this.memberBooking = [];
            this.totalSaleCount.TotalClassSale = 0;
          }
          if (this.TotalRevenueOfBookingsExists) {
            this.TotalRevenueOfBookings = response.Result.TotalRevenue;
            this.totalSaleCount.TotalSale = response.Result.TotalSale;
          } else {
            this.TotalRevenueOfBookings = []
            this.totalSaleCount.TotalSale = 0;
          }
          if (this.ismemberServicesExists) {
            this.memberServices = response.Result.ServiceCountList;
            this.totalSaleCount.TotalServiceSale = response.Result.TotalServiceSale;
          } else {
            this.memberServices = [];
            this.totalSaleCount.TotalServiceSale = 0;
          }
          if (this.ismemberProductsExists) {
            this.memberProducts = response.Result.ProductCountList;
            this.totalSaleCount.TotalProductSale = response.Result.TotalProductSale;
          } else {
            this.memberProducts = [];
            this.totalSaleCount.TotalProductSale = 0;
          }
          if (this.ismemberMemberShipBookingExists) {
            this.memberMemberShipBooking = response.Result.MemberShipCountList;
            this.totalSaleCount.TotalMembershipSale = response.Result.TotalMembershipSale;
          } else {
            this.memberMemberShipBooking = [];
            this.totalSaleCount.TotalMembershipSale = 0;
          }
        }
        else {
          this.memberBooking = [];
          this.memberServices = [];
          this.memberProducts = [];
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Info"));
        }
      );
  }

  getLeadActivitySummary(data: any) {
    this.newLeadsCount = 0;
    this.wonLeadsCount = 0;
    this.lostLeadsCount = 0;
    if (data) {
      this.leadActivitySummary = data;
      this.leadActivitySummary.forEach(laSum => {
        laSum.val = laSum.TotalLead;
        if (laSum.LeadStatusTypeID == this.leadStatusType.Fresh) {
          this.newLeadsCount = laSum.TotalLead;
        }
        if (laSum.LeadStatusTypeID == this.leadStatusType.Lost) {
          this.lostLeadsCount = laSum.TotalLead;
        }
        if (laSum.LeadStatusTypeID == this.leadStatusType.Sale) {
          this.wonLeadsCount = laSum.TotalLead;
        }
      })
    }
    else {
      this.leadActivitySummary = [];
    }
  }

  getMonthlySalesByDate() {
    const params = {
      fromDate: this.mainDashboardSearchParams.DateFrom,
      toDate: this.mainDashboardSearchParams.DateTo,
      appsourceTypeID: this.saleSourceTypeId
    }
    this._httpService.get(ClientApi.getMonthlySalesByDate, params)
      .subscribe(data => {
        this.isMonthlySalesExists = data.Result != null && data.Result.length > 0 ? true : false;
        if (data.Result != null && data.Result.length > 0) {
          this.monthlySales = data.Result;
          this.monthlySales.forEach((sale) => {
            if (sale.TotalSale >= 0 && sale.TotalSale <= 100) {
              this.tickIntervalSaleBySource = 10;
            } else if (sale.TotalSale >= 100 && sale.TotalSale <= 1000) {
              this.tickIntervalSaleBySource = 100;
            }
            else if (sale.TotalSale >= 1000 && sale.TotalSale <= 100000) {
              this.tickIntervalSaleBySource = 1000;
            }
          })
        }
        else {
          this.monthlySales = [];
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Net Sales Summary By Source"));
        });
  }

  wellnessMediumPackageDashboard() {

    this.onSchedulerHoursDateChange();
    this.onStaffPendingTaskDateChange();
    this.onMonthlyVisitsDateChange();
    this.onSaleTypeSummaryDateChange();
    this.onBookedServicesDateChange();
    this.getMonthlySalesByDate();
  }

  wellnessTopPackageDashboard() {
    this.onSchedulerHoursDateChange();
    this.onStaffPendingTaskDateChange();
    this.onMonthlyVisitsDateChange();
    this.onSaleTypeSummaryDateChange();
    this.onBookedServicesDateChange();
    this.getMonthlySalesByDate();
    this.getStaffAttendance();
  }

  wellnessFullPackageDashboard() {
    this.onSchedulerHoursDateChange();
    this.onStaffPendingTaskDateChange();
    this.onMonthlyVisitsDateChange();
    this.onSaleTypeSummaryDateChange();
    this.onBookedServicesDateChange();
    this.getMonthlySalesByDate();
    this.getStaffAttendance();
    this.onLeadFlowDateChange();
    this.onActivitiesDateChange();
    this.onActivitySummaryDateChange();
    this.onMembershipStatusDateChange();
    this.getMemberContract();
    this.getMemberAttendance();
    this.onMemberActivityDateChange();
  }

  fitnessMediumPackageDashboard() {
    this.onSchedulerHoursDateChange();
    this.onStaffPendingTaskDateChange();
    this.onSaleTypeSummaryDateChange();
    // this.onBookedServicesDateChange();
    this.getMonthlySalesByDate();
    this.getStaffAttendance();
    this.onActivitiesDateChange();
    this.onActivitySummaryDateChange();
    this.onMembershipStatusDateChange();
    this.getMemberContract();
    this.getMemberAttendance();
    this.onMonthlyVisitsDateChange();
    this.onMemberActivityDateChange();
  }

  memberByStatuscustomizePoint(arg: any) {
    var enumMembershipStatus = MembershipStatus_Enum;
    switch (arg.data.MembershipStatusTypeID) {
      case enumMembershipStatus.Terminated:
        return { color: "#F8CAA6" };
      case enumMembershipStatus.Expired:
        return { color: "#E97C82" };
      case enumMembershipStatus.Frozen:
        return { color: "#BFE1FF" };
      case enumMembershipStatus.Active:
        return { color: "#BCD556" };
    }
  }

  leadFlowCustomizePoint(arg: any) {
    var leadStatusType = LeadStatusType;
    if (arg.data.LeadStatusTypeID == leadStatusType.Fresh) {
      return { color: "#BCD556" };
    }
    if (arg.data.LeadStatusTypeID == leadStatusType.FinalMeeting) {
      return { color: "#F6A261" };
    }
    if (arg.data.LeadStatusTypeID == leadStatusType.Lost) {
      return { color: "#E97C82" };
    }
    if (arg.data.LeadStatusTypeID == leadStatusType.MeetingArranged) {
      return { color: "#F8CAA6" };
    }
    if (arg.data.LeadStatusTypeID == leadStatusType.PerposalMade) {
      return { color: "#A2E6E4" };
    }
    if (arg.data.LeadStatusTypeID == leadStatusType.PerposalSend) {
      return { color: "#FEBF05" };
    }
    if (arg.data.LeadStatusTypeID == leadStatusType.Sale) {
      return { color: "#BFE1FF" };
    }
  }
  // whoOwnsMostLeadTooltip(arg: any) {
  //   return {
  //     text: arg.originalArgument + ' : ' + arg.value
  //   };
  // }

  whoOwnsMostLeadTooltip(arg: any) {
    return {
      text: arg.point.data.StaffName + ' : ' + arg.value + '<br/>' + arg.point.data.Email
    };
  }

  clientVisitsCustomizeTooltip(arg: any) {
    return {
      text: arg.seriesName + ' : ' + arg.value + '<br/>' + ' ' + arg.argumentText
    };
  }

  leadActivitySummaryCustomizePoint(arg: any) {
    text: arg.leadStatusType + ' : ' + arg.value;
    var leadStatusType = LeadStatusType;
    if (leadStatusType) {
      if (arg.data.LeadStatusTypeID == leadStatusType.Fresh) {
        return { color: "#BCD556" };
      }
      if (arg.data.LeadStatusTypeID == leadStatusType.Lost) {
        return { color: "#F8CAA6" };
      }
      if (arg.data.LeadStatusTypeID == leadStatusType.Sale) {
        return { color: "#BFE1FF" };
      }

    }

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
  //   var enumSaleSourceType = EnumSaleSourceType;
  //   switch (arg.data.AppSourceTypeID) {
  //     case enumSaleSourceType.App:
  //       return { color: "#F6A261" };
  //     case enumSaleSourceType.OnSite:
  //       return { color: "#BFE1FF" };
  //     case enumSaleSourceType.Shop:
  //       return { color: "#BCD556" };
  //   }
  // }

  // memberProductcustomizePoint(arg: any) {
  //   var enumSaleSourceType = EnumSaleSourceType;
  //   switch (arg.data.AppSourceTypeID) {
  //     case enumSaleSourceType.App:
  //       return { color: "#F6A261" };
  //     case enumSaleSourceType.OnSite:
  //       return { color: "#BFE1FF" };
  //     case enumSaleSourceType.Shop:
  //       return { color: "#BCD556" };
  //   }
  // }

  monthlySalescustomizePoint(arg: any) {
    text: arg.seriesName + ' : ' + arg.valueText;
  }

  leadFlowCustomizePointTooltip(arg: any) {
    return {
      text: arg.argument + ' : ' + arg.value
    };
  }
  bookedVsCompletedTooltip(arg: any) {
    let text = "";
    if (arg.seriesName === 'Booked') {
      text = arg.seriesName + ' : ' + arg.value + '<br/>' + ' ' + 'Completed' + ' : ' + arg.point.data.TotalAttendance + '<br/>' + ' ' + arg.argument
    } else if (arg.seriesName === 'Completed') {
      text = arg.seriesName + ' : ' + arg.value + '<br/>' + ' ' + 'Booked' + ' : ' + arg.point.data.TotalSaleService + '<br/>' + ' ' + arg.argument
    }
    return {
      text: text
    };
  }
  monthlySalecustomizeTooltip(arg: any) {
    let text = "";
    if (arg.seriesName === 'Services') {
      text = arg.seriesName + ' : ' + currencySymbolForRevenue + arg.point.data.ServiceNetTotal + '<br/>' + ' ' + arg.point.data.Month
    }
    else if (arg.seriesName === 'Memberships') {
      text = arg.seriesName + ' : ' + currencySymbolForRevenue + arg.point.data.MembershipNetTotal + '<br/>' + ' ' + arg.point.data.Month
    }
    else if (arg.seriesName === 'Products') {
      text = arg.seriesName + ' : ' + currencySymbolForRevenue + arg.point.data.ProductNetTotal + '<br/>' + ' ' + arg.point.data.Month
    }
    else if (arg.seriesName === 'Classes') {
      text = arg.seriesName + ' : ' + currencySymbolForRevenue + arg.point.data.ClassNetTotal + '<br/>' + ' ' + arg.point.data.Month
    }
    return {
      text: text
    };
  }
  monthlySalebySourcecustomizeTooltip(arg: any) {
    let text = "";
    if (arg.seriesName === 'Core') {
      text = arg.seriesName + ' : ' + '<br/>' + ' ' + 'Net Sale' + '=' + currencySymbolForRevenue + arg.point.data.Core + '<br/>' + ' ' + 'Tax' + '=' + currencySymbolForRevenue + arg.point.data.CoreTax;
    }
    else if (arg.seriesName === 'Widget') {
      text = arg.seriesName + ' : ' + '<br/>' + ' ' + 'Net Sale' + '=' + currencySymbolForRevenue + arg.point.data.Widget + '<br/>' + ' ' + 'Tax' + '=' + currencySymbolForRevenue + arg.point.data.WidgetTax;
    }
    else if (arg.seriesName === 'Staff App') {
      text = arg.seriesName + ' : ' + '<br/>' + ' ' + 'Net Sale' + '=' + currencySymbolForRevenue + arg.point.data.StaffApp + '<br/>' + ' ' + 'Tax' + '=' + currencySymbolForRevenue + arg.point.data.StaffAppTax;
    }
    else if (arg.seriesName === 'Customer App') {
      text = arg.seriesName + ' : ' + '<br/>' + ' ' + 'Net Sale' + '=' + currencySymbolForRevenue + arg.point.data.CustomerApp + '<br/>' + ' ' + 'Tax' + '=' + currencySymbolForRevenue + arg.point.data.CustomerAppTax;
    }
    return {
      text: text
    };
  }
  MamberShipByStatuscustomizeTooltip(arg: any) {
    return {
      text: arg.originalArgument + " " + arg.valueText
    };
  }

  MamberShipNearToExpirecustomizeTooltip(arg: any) {
    return {
      text: arg.argument + ' : ' + arg.valueText
    };
  }

  MemberMemberShipcustomizeTooltip(arg: any) {
    return {
      text: arg.argument + ': ' + currencySymbolForRevenue + arg.valueText
    };
  }

  ProductcustomizeTooltip(arg: any) {
    return {
      text: arg.argument + ': ' + currencySymbolForRevenue + arg.valueText
    };
  }

  ServicescustomizeTooltip(arg: any) {
    return {
      text: arg.argument + ': ' + currencySymbolForRevenue + arg.valueText
    };
  }

  ClassescustomizeTooltip(arg: any) {
    return {
      text: arg.argument + ': ' + currencySymbolForRevenue + arg.valueText
    };
  }

  salecustomizeTooltip(arg: any) {
    return {
      text: 'Total Sales : ' + arg.valueText
    };
  }


  customizeProductLabel(point) {
    return point.argumentText = currencySymbolForRevenue + point.valueText;
  }

  customizeServicesLabel(point) {
    return point.argumentText = currencySymbolForRevenue + point.valueText;
  }
  customizeBookingLabel(point) {
    return point.argumentText = currencySymbolForRevenue + point.valueText;
  }
  customizeTotalRevBookingLabel(point) {
    return point.argumentText = currencySymbolForRevenue + point.valueText;
  }
  setCustomerTypeList(packageID: number) {
    this.customerTypeList = [];
    if (packageID == this.package.WellnessMedium || packageID == this.package.WellnessTop) {
      this.customerTypeList = Configurations.CustomerList.filter(g => g.CustomerTypeID == 1);
    }
    else if (packageID == this.package.FitnessMedium) {
      this.customerTypeList = Configurations.CustomerList.filter(g => g.CustomerTypeID == 3);
    }
    else {
      this.customerTypeList = Configurations.CustomerList;
    }

    this.customerTypeID = this.mainDashboardSearchParams.PersonId = 0;
    // this.customerTypeID = this.customerTypeList[0].CustomerTypeID
  }

  filterSaleTypeList(packageID: number) {

    switch (packageID) {
      case this.package.WellnessMedium:
        this.saleType = Configurations.SaleType.filter(g => g.SaleTypeID == EnumMemberDashboardSaleType.Service || g.SaleTypeID == EnumMemberDashboardSaleType.Product);
        this.setDefaultValue(EnumMemberDashboardSaleType.Product);
        break;
      case this.package.WellnessTop:
        this.saleType = Configurations.SaleType.filter(g => g.SaleTypeID == EnumMemberDashboardSaleType.Service || g.SaleTypeID == EnumMemberDashboardSaleType.Product);
        this.setDefaultValue(EnumMemberDashboardSaleType.Product);
        break;
      case this.package.FitnessMedium:
        this.saleType = Configurations.SaleType.filter(g => g.SaleTypeID == EnumMemberDashboardSaleType.Class || g.SaleTypeID == EnumMemberDashboardSaleType.Membership || g.SaleTypeID == EnumMemberDashboardSaleType.Product);
        this.setDefaultValue(EnumMemberDashboardSaleType.Product);
        break;

      default:
        this.saleType = Configurations.SaleType;
        break;
    }



  }
  setDefaultValue(saleTypeID: number) {
    this.saleTypeID = saleTypeID;
    this.mainDashboardSearchParams.SaleType = this.saleTypeID;
  }

  clientVisits: IClientVisits[] = [
    { value: "TotalClient", name: "Visit" }
  ];

  // #endregion

}