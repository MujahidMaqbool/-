/************************* Angular References ***********************************/
import { Component, OnInit, ViewChild } from '@angular/core';
/************************* Services & Models ***********************************/

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
/* Models */
import { StaffDashboardParam, StaffPendingTask, StaffAttendance, StaffSchedulerHours } from 'src/app/staff/models/staff.model';

/************************* Common ***********************************/
import { Configurations } from 'src/app/helper/config/app.config'
import { Messages } from 'src/app/helper/config/app.messages';
import { StaffDashboardApi, StaffTimeSheetApi } from 'src/app/helper/config/app.webapi';
import { environment } from 'src/environments/environment';
import { SubscriptionLike } from 'rxjs';
import { ENU_Package, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { ApiResponse } from 'src/app/models/common.model';
import { variables } from 'src/app/helper/config/app.variable';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';


@Component({
    selector: 'staff-dashboard',
    templateUrl: './staff.dashboard.component.html'
})


export class StaffDashboard  extends AbstractGenericComponent implements OnInit {

    @ViewChild('fromToDateComoRef') fromToDateComoRef: DateToDateFromComponent;

    allowedPages = {
        ScheduledHours: false,
        ActualHours: false,
        Tasks: false,
        Attendance: false
    };
    AllowedDashboard = {
        StaffSchedulerHours: false,    
        ShiftForecast: false,
        StaffActualHours: false
      
      };

    DataChangeDashboard = {
        Tasks: 1,
        Attendance: 2
    };

    // #region Local Members
    dateFormat: string = "";
    shiftForecastDateFormat: string = "";
    /* Messages */
    messages = Messages;
    timeFormat = Configurations.TimeFormatView;
    // ************* Local ****************
    currentDate: Date = new Date();
    dateFormatForSearch: string = 'yyyy-MM-dd';
    isPendingTaskDataExists: boolean = false;
    isStaffAttendanceDataExists: boolean = false;
    imagePath: string = './assets/images/member_login.jpg';
    serverImageAddress = environment.imageUrl;
    packageIdSubscription: SubscriptionLike;
    dateFrom: Date = new Date();
    dateTo: Date = new Date();
    // ************* Model and Collection ****************
    package = ENU_Package;
    staffDashboardParam = new StaffDashboardParam();
    staffSchedulerHours = new StaffSchedulerHours();
    staffPendingTask: StaffPendingTask[] = [];
    staffAttendance: StaffAttendance[] = [];
    splitSchedulerHours: any[] = [];
    isDataExists: boolean;
    attendanceTimesheetData: any;


    // #endregion

    // ************* Class Constructor ****************

    constructor(
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService
    ) {
        super();
        //  this.lastweekDate.setDate(this.lastweekDate.getDate() - 7);
    }

    ngOnInit() {
        this.getBranchDatePattern();
    }

    // #region Events

    onAttendanceNoticeDateChange() {
        this.getStaffAttendance();
    }

    onPendingTaskDateChange() {
        this.getStaffPendingTask();
    }

    onDateChange($event, dashboardID: number) {
        if ($event != undefined) {
            this.staffDashboardParam.DateFrom = $event.DateFrom;
            this.staffDashboardParam.DateTo = $event.DateTo;
        }

        switch (dashboardID) {
            case this.DataChangeDashboard.Attendance:
                this.onAttendanceNoticeDateChange();
                break;
            case this.DataChangeDashboard.Tasks:
                this.onPendingTaskDateChange();
                break;

        }
    }

    ngOnDestroy() {
        this.packageIdSubscription.unsubscribe();
    }

    // #endregion

    // #region Methods

    // setTimeFormat() {
    //     this.staffPendingTask.forEach(element => {
    //         element.FollowUpEndTime = this._dateTimeService.formatTimeString(element.FollowUpEndTime, this.timeFormat);
    //         element.FollowUpStartTime = this._dateTimeService.formatTimeString(element.FollowUpStartTime, this.timeFormat);
    //     });
    // }

    // addDays(date, days) {
    //     var result = new Date(date);
    //     this.maxDate.setDate(result.getDate() + days);
    //     this.minDate.setDate(result.getDate());
    //     result.setDate(result.getDate() + days);
    //     return result;
    // }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.shiftForecastDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.ShiftForeCastDateFormat);

        let branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

        this.staffDashboardParam.DateFrom = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormatForSearch);
        this.staffDashboardParam.DateTo = this._dateTimeService.convertDateObjToString(branchCurrentDate, this.dateFormatForSearch);
 
        this.dateFrom = branchCurrentDate;
        this.dateTo = branchCurrentDate;
        
        this.getStaffAttendanceTimeSheet();
        // //this.staffDashboardParam.DateFrom = this._dateTimeService.convertDateObjToString(this.lastweekDate, this.dateFormat);
        //// this.staffDashboardParam.DateTo = this._dateTimeService.convertDateObjToString(this.cusrrentDate, this.dateFormat);

       // this.staffDashboardParam.DateFrom = this._dateTimeService.convertDateObjToString(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1), this.dateFormat);
       // this.staffDashboardParam.DateTo = this._dateTimeService.convertDateObjToString(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0), this.dateFormat);

      
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPermissions(packageId);
            }
        });

        this.onAttendanceNoticeDateChange();
        this.getStaffScheduledHours();
        this.onPendingTaskDateChange();
    }

    getStaffAttendanceTimeSheet() {
        let params = {
            staffID: '',
            startDate: this.getDateString(this.dateFrom, this.dateFormatForSearch),
            endDate: this.getDateString(this.dateTo, this.dateFormatForSearch),
            pageNumber: 1,
            pageSize: 10
        }

        this._httpService.get(StaffTimeSheetApi.getAll, params)
            .subscribe((data:ApiResponse ) => {
                if(data && data.MessageCode > 0){
                this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    // if (data.Result.length > 0) {
                    //     this.totalRecords = data.TotalRecord;
                    // }

                    this.attendanceTimesheetData = data.Result;
                    this.attendanceTimesheetData.forEach(timesheetObj => {
                        let now = new Date();
                        let time = this._dateTimeService.getTimeStringFromDate(now);
                        if (timesheetObj.ClockIn && timesheetObj.ClockIn != "") {
                            timesheetObj.ClockIn = this._dateTimeService.formatTimeString(timesheetObj.ClockIn);
                        }
                        if (timesheetObj.ShiftStartTime && timesheetObj.ShiftStartTime != "") {
                            timesheetObj.ShiftStartTime = this._dateTimeService.formatTimeString(timesheetObj.ShiftStartTime);
                        }
                        if (timesheetObj.ShiftEndTime && timesheetObj.ShiftEndTime != "") {
                            timesheetObj.ShiftEndTime = this._dateTimeService.formatTimeString(timesheetObj.ShiftEndTime);
                        }
                        if (timesheetObj.ClockOut && timesheetObj.ClockOut != "") {
                            timesheetObj.ClockOut = this._dateTimeService.formatTimeString(timesheetObj.ClockOut);
                        }

                    })
                }
            }else{
                this._messageService.showErrorMessage(data.MessageText);
            }
               
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Attendance"));
                }
            );
    }

    getDateString(dateValue: Date, dateFormat: string) {
        return this._dateTimeService.convertDateObjToString(dateValue, dateFormat);
    }

    getStaffScheduledHours() {
        let params = {
            startDate: this.staffDashboardParam.DateFrom,
            endDate: this.staffDashboardParam.DateTo
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
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Scheduler Hours"));
                })
    }
   
    getStaffPendingTask() {
        let params = {
            startDate: this.staffDashboardParam.DateFrom,
            endDate: this.staffDashboardParam.DateTo
        }
        if (this._dateTimeService.compareTwoDates(new Date(this.staffDashboardParam.DateFrom), new Date(this.staffDashboardParam.DateTo))) {
            this._httpService.get(StaffDashboardApi.getStaffPendingTask, params)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.isPendingTaskDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                        if (this.isPendingTaskDataExists) {
                            this.staffPendingTask = response.Result;
                            //this.setTimeFormat();
                            this.setStaffImagePath();
                        }
                        else {
                            this.staffPendingTask = [];
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Pending Tasks"));
                    });
        }

        else {
            this._messageService.showErrorMessage(this.messages.Error.Invalid_FromDate);
        }
    }

    getStaffAttendance() {
        let params = {
            startDate: this.staffDashboardParam.DateFrom,
            endDate: this.staffDashboardParam.DateTo
        }
        if (this._dateTimeService.compareTwoDates(new Date(this.staffDashboardParam.DateFrom), new Date(this.staffDashboardParam.DateTo))) {
            this._httpService.get(StaffDashboardApi.getStaffAttendance, params)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.isStaffAttendanceDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                        if (this.isStaffAttendanceDataExists) {
                            if (response.Result.length > 0) {
                                this.staffAttendance = response.Result;
                            }
                        }
                        else {
                            this.staffAttendance = [];
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Attendance Notice"));
                    });
        }

        else {
            this._messageService.showErrorMessage(this.messages.Error.Invalid_FromDate);
        }
    }


    getLastWeekHoursDifference() {
        if (this.staffSchedulerHours.ElapsedShiftHoursLastWeek && this.staffSchedulerHours.ElapsedShiftHoursLastWeek != "0") {
          this.splitSchedulerHours = this.staffSchedulerHours.ElapsedShiftHoursLastWeek?.split(' ');
          if (this.splitSchedulerHours && this.splitSchedulerHours[0] < 0) {
            this.staffSchedulerHours.ScheduledShiftHoursLastWeekPositive = false;
          }
        }
        if (this.staffSchedulerHours.ElapsedAttendanceHoursLastWeek != "0") {
          this.splitSchedulerHours = this.staffSchedulerHours.ElapsedAttendanceHoursLastWeek?.split(' ');
          if (this.splitSchedulerHours && this.splitSchedulerHours[0] < 0) {
            this.staffSchedulerHours.ActualHoursLastWeekPositive = false;
          }
        }
    
      }

    setStaffImagePath() {
        this.staffPendingTask.forEach(element => {
            if (element.StaffImagePath != "" && element.StaffImagePath != null) {
                element.StaffImagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setStaffImagePath()) + element.StaffImagePath;
                element.FollowUpEndTime = this._dateTimeService.formatTimeString(element.FollowUpEndTime);
                element.FollowUpStartTime = this._dateTimeService.formatTimeString(element.FollowUpStartTime);
            }
            else {
                element.StaffImagePath = this.imagePath;
            }
        });
    }


    setPermissions(packageId: number) {
        switch (packageId) {
            case this.package.FitnessMedium:
                this.allowedPages.ScheduledHours = true,
                    this.allowedPages.Tasks = true
                this.AllowedDashboard.StaffSchedulerHours = true;
                break;

            case this.package.WellnessMedium:
                this.AllowedDashboard.StaffSchedulerHours = true;
                this.allowedPages.ScheduledHours = true,
                    this.allowedPages.Tasks = true
                break;

            case this.package.WellnessTop:
                this.AllowedDashboard.StaffSchedulerHours = true;
                this.AllowedDashboard.StaffActualHours = true;
                this.allowedPages.ScheduledHours = true,
                    this.allowedPages.ActualHours = true,
                    this.allowedPages.Tasks = true,
                    this.allowedPages.Attendance = true
                break;

            case this.package.Full:
                this.AllowedDashboard.StaffSchedulerHours = true;
                this.AllowedDashboard.StaffActualHours = true;
                this.allowedPages.ScheduledHours = true;
                this.allowedPages.ActualHours = true;
                this.allowedPages.Tasks = true;
                this.allowedPages.Attendance = true
                break;
        }
    }

    AttendanceNoticesCustomizeTooltip(arg: any) {
        return {
            text: arg.argument + ' : ' + arg.value
        };
    }

    // #endregion




}