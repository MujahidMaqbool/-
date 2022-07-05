/** Angular */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDatepicker } from '@angular/material/datepicker';

/** Services */
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';

/** Models */
import { TimesheetSearchParam } from '@staff/models/attendance.timesheet.model'

/** App Component */


/** Messages & Constants */

import { Configurations } from '@helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { StaffTimeSheetApi } from '@app/helper/config/app.webapi';
import { DateTimeService } from '@app/services/date.time.service';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { DataSharingService } from '@app/services/data.sharing.service';
import { ENU_DateFormatName } from '@app/helper/config/app.enums';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { ApiResponse } from '@app/models/common.model';
@Component({
    selector: 'my-attendance-timesheet',
    templateUrl: './my.attendance.timesheet.component.html'
})

export class MyAttendanceTimeSheetComponent extends AbstractGenericComponent implements OnInit {

    /***********Angular Event*********/
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;
    @ViewChild('allAttendanceToFromDateComoRef') allAttendanceToFromDateComoRef: DateToDateFromComponent;

    /** Models */
    timesheetSearchParam: TimesheetSearchParam = new TimesheetSearchParam();
    myAttendenceSearchParams: TimesheetSearchParam = new TimesheetSearchParam();

    /** Lists */

    myAttendanceTimesheetList: any[] = [];
    /** Alert Messages */
    messages = Messages;
    isDataExists: boolean = false;
    /***********Local*********/
    dateFrom: Date = new Date();
    dateTo: Date = new Date();
    dateFormat: string = 'MM-dd-yyyy';
    timeFormat = Configurations.TimeFormatView;
    dateFormatForView: string = Configurations.DateFormat;
    branchCurrentDateTime: Date;


    constructor(private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService, private _openDialog: MatDialogService) {
        super();
    }

    /***********Angular Events *********/

    ngOnInit() {
        this.getBranchDatePattern();
    }

    async getBranchDatePattern() {
        this.dateFormatForView = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.branchCurrentDateTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

        this.appPagination.paginator.pageSize = this.appPagination.pageSize;
        this.timesheetSearchParam.DateFrom =  this.branchCurrentDateTime
        this.timesheetSearchParam.DateTo =  this.branchCurrentDateTime
        this.getMyAttendanceTimesheet();
    }

    ngAfterViewInit() {
       
    }

    // #region Events


    onFromDateChange(date: any) {
        setTimeout(() => {
            this.timesheetSearchParam.DateFrom = date; //this.getDateString(date, this.dateFormat); // 07/05/2018 MM/dd/yyyy
        })
    }

    onToDateChange(date: any) {
        setTimeout(() => {
            this.timesheetSearchParam.DateTo = date; //this.getDateString(date, this.dateFormat); // 07/05/2018  MM/dd/yyyy   
        });
    }

    onReset() {
        this.resetAllParams();
    }
    onClosePopup() {
        this._openDialog.closeAll();
    }

    // #endregion

    // #region Methods


    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getMyAttendanceTimesheet();
    }

    onLoadStaffAttendance() {
        this.myAttendenceSearchParams.DateFrom = this._dateTimeService.convertDateObjToString(this.timesheetSearchParam.DateFrom, this.dateFormat);
        this.myAttendenceSearchParams.DateTo = this._dateTimeService.convertDateObjToString(this.timesheetSearchParam.DateTo, this.dateFormat)
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getMyAttendanceTimesheet();
    }

    getMyAttendanceTimesheet() {
        let params = {
            startDate: this._dateTimeService.convertDateObjToString(this.timesheetSearchParam.DateFrom, this.dateFormat),
            endDate: this._dateTimeService.convertDateObjToString(this.timesheetSearchParam.DateTo, this.dateFormat),
            pageNumber: this.appPagination.pageNumber,
            pageSize: this.appPagination.pageSize,
        }

        this._httpService.get(StaffTimeSheetApi.getMyAttendanceTimeSheetById, params)
            .subscribe((res:ApiResponse) => {
                if(res && res.MessageCode > 0){
                this.isDataExists = res.Result != null && res.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    if (res.Result.length > 0) {
                        this.appPagination.totalRecords = res.TotalRecord;
                    }

                    this.myAttendanceTimesheetList = res.Result;
                    this.myAttendanceTimesheetList.forEach(timesheetObj => {
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
                else {
                    this.appPagination.totalRecords = 0;
                }
            }else{
                this._messageService.showErrorMessage(res.MessageText);

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

    resetAllParams() {
        // this.dateTo = new Date();
        // this.dateFrom = new Date();
        this.myAttendenceSearchParams = new TimesheetSearchParam();
        this.timesheetSearchParam.DateTo = this.branchCurrentDateTime //this.getDateString(this.dateTo, this.dateFormat);
        this.timesheetSearchParam.DateFrom = this.branchCurrentDateTime //this.getDateString(this.dateFrom, this.dateFormat);
        this.getMyAttendanceTimesheet();
        this.allAttendanceToFromDateComoRef.resetDateFilter();
        this.appPagination.resetPagination();
    }


    reciviedDateTo($event) {
        this.timesheetSearchParam.DateFrom = $event.DateFrom;
        this.timesheetSearchParam.DateTo = $event.DateTo;
      }
    // #endregion
}