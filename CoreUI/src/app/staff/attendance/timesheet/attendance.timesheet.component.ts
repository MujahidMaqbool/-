/** Angular */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDatepicker } from '@angular/material/datepicker';

/** Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';

/** Models */
import { TimesheetSearchParam, TimesheetSearchParameter } from 'src/app/staff/models/attendance.timesheet.model'

/** App Component */
import { GeoLocationComponent } from '../geo-location/geo.location.component';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';


/** Messages & Constants & configurations*/

import { Configurations } from 'src/app/helper/config/app.config';
import { Messages } from 'src/app/helper/config/app.messages';
import { StaffShiftApi, StaffTimeSheetApi } from 'src/app/helper/config/app.webapi';
import { ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { ApiResponse } from 'src/app/models/common.model';

@Component({
    selector: 'attendance-timesheet',
    templateUrl: './attendance.timesheet.component.html',
    styleUrls: ['./attendance.timesheet.css']
})

export class AttendanceTimeSheetComponent extends AbstractGenericComponent implements OnInit {

    /***********Angular Event*********/
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
    @ViewChild('attendenceTimesheetDate') attendenceTimesheetDate: DateToDateFromComponent;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;

    /** Models */
    timesheetSearchParam: TimesheetSearchParam = new TimesheetSearchParam();
    timesheetSearchFilterParams: TimesheetSearchParameter = new TimesheetSearchParameter();

    /** Lists */
    staffListDataSource: any[] = [];
    filteredStaffList: any[] = [];
    positionListDataSource: any[] = [];
    attendanceTimesheetData: any[] = [];
    searchStaff: any[] = [];
    /** Alert Messages */
    messages = Messages;
    isDataExists: boolean = false;
    isAllStaffPosition: boolean = true;
    /***********Local*********/
    dateFrom: Date = new Date();
    dateTo: Date = new Date();
    maxDate: Date = new Date();
    dateFormatForSearch: string = 'MM/dd/yyyy';
    selectedAll: boolean = true;
    timeFormat = Configurations.TimeFormatView;
    dateFormat: string = "";
    /***********Pagination And Sorting *********/
    // totalRecords: number = 0;
    // pageSize = Configurations.DefaultPageSize;
    // pageSizeOptions = Configurations.PageSizeOptions;
    // pageNumber: number = 1;
    // pageIndex: number = 0;
    isSearchByPageIndex: boolean = false;
   

    constructor(private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        public _dialog: MatDialogService,
        private _dataSharingService: DataSharingService) {
        super();
    }

    /***********Angular Events *********/

    ngOnInit() {
        this.getBranchDatePattern();
    }

    ngAfterViewInit() {
        this.appPagination.pageSize = this.appPagination.paginator.pageSize;
        this.timesheetSearchParam.DateFrom = this.getDateString(this.dateFrom, this.dateFormatForSearch);
        this.timesheetSearchParam.DateTo = this.getDateString(this.dateTo, this.dateFormatForSearch);
        this.onLoadStaffAttendance();
    }

    // #region Events
    onStaffPositionChangeAll() {

        this.positionListDataSource.forEach(item => {
            item.selected = this.isAllStaffPosition;
        });
        this.onStaffPositionChange();
    }

    onStaffPositionChange() {
        this.isAllStaffPosition = this.positionListDataSource.every(p => p.selected === true);
        this.selectedAll = true;
        this.getStaffListByPositionId();
    }
    // onToDateChange(date: Date) {
    //     // this.timesheetSearchParam.DateTo = this.getDateString(date, this.dateFormat); // 07/05/2018  MM/dd/yyyy
    //     setTimeout(() => {
    //         this.timesheetSearchParam.DateTo = date;   
    //     });
    // }

    // onFromDateChange(date: any) {
    //     // this.timesheetSearchParam.DateFrom = this.getDateString(date, this.dateFormat); // 07/05/2018 MM/dd/yyyy
    //     setTimeout(() => {
    //      this.timesheetSearchParam.DateFrom = date; 
    //     });
    // }
    
    // for gealocation component
    viewLocation(timesheetObj:any) {
        this._dialog.open(GeoLocationComponent, {
            disableClose: true,
            data:{
                timesheetObj
            }
        });
    }

    reciviedDateTo($event) {
        this.timesheetSearchParam.DateFrom = $event.DateFrom;
        this.timesheetSearchParam.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.timesheetSearchParam.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.timesheetSearchParam.DateTo = date;
    }

    onReset() {
        this.resetAllParams();
        this.attendenceTimesheetDate.resetDateFilter();

    }

    // #endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.getFundamentals();
    }

    getFundamentals() {
        this._httpService.get(StaffShiftApi.getCalendarFundamentals)
            .subscribe(
                (data:ApiResponse) => {
                    if (data && data.MessageCode > 0) {
                        this.positionListDataSource = data.Result.StaffPositionList ? data.Result.StaffPositionList : [];
                        this.staffListDataSource = data.Result.StaffList ? data.Result.StaffList : [];
                        this.resetAllStaffPositionList();
                        this.getStaffListByPositionId();
                    }
                    else{
                        this._messageService.showErrorMessage(data.MessageText);
                    }
                },

                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Shift")); }
            );
    }



    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getStaffAttendance();
    }

    onLoadStaffAttendance() {
        this.timesheetSearchFilterParams = new TimesheetSearchParameter();
        this.timesheetSearchFilterParams.staffID = this.searchStaff.toString();
      
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getStaffAttendance();
    }

    getStaffAttendance() {
        // let params = {
        //     staffID: this.searchStaff.toString(),
        //     startDate: this.timesheetSearchParam.DateFrom,
        //     endDate: this.timesheetSearchParam.DateTo,
        //     pageNumber: this.appPagination.pageNumber,
        //     pageSize: this.appPagination.pageSize
        // }
        this.timesheetSearchFilterParams.startDate = this.timesheetSearchParam.DateFrom;
        this.timesheetSearchFilterParams.endDate = this.timesheetSearchParam.DateTo;
        this.timesheetSearchFilterParams.PageNumber = this.appPagination.pageNumber;
        this.timesheetSearchFilterParams.pageSize = this.appPagination.pageSize;

        this._httpService.get(StaffTimeSheetApi.getAll, this.timesheetSearchFilterParams)
            .subscribe((data :ApiResponse) => {
                if(data && data.MessageCode > 0){
                this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    if (data.Result.length > 0) {
                        this.appPagination.totalRecords = data.TotalRecord;
                    }

                    this.attendanceTimesheetData = data.Result;
                    this.attendanceTimesheetData.forEach(timesheetObj => {
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

    getStaffListByPositionId() {
        this.filteredStaffList = [];
        this.searchStaff = [];

        if (!this.isAllStaffPosition) {
            this.filteredStaffList = this.staffListDataSource.filter(x => this.positionListDataSource.some(sp => sp.selected === true && sp.StaffPositionID === x.StaffPositionID));

        } else {
            this.filteredStaffList = this.staffListDataSource;

        }

        if (this.filteredStaffList.length == 0) {
            this.searchStaff.push(0);
        }
        else {
            this.filteredStaffList.forEach(s => {
                s.selected = true;
                this.searchStaff.push(s.StaffID);
            });
        }
    }

    staffListChangeAll() {
        this.searchStaff = [];
        this.filteredStaffList.forEach(item => {
            item.selected = this.selectedAll;
            if (item.selected) {
                this.searchStaff.push(item.StaffID);
            }
        });
        if (!this.selectedAll) {
            this.searchStaff.push(0);
        }
    }

    staffListChange() {

        this.searchStaff = [];
        this.filteredStaffList.filter(x => x.selected == true).forEach(item => { this.searchStaff.push(item.StaffID) });

        if (this.searchStaff.length > 0) {
            this.selectedAll = this.searchStaff.length === this.filteredStaffList.length ? true : false;
        }
        else {
            this.selectedAll = false;
            this.searchStaff.push(0);
        }

        // this.timesheetSearchParam.AllStaff = this.staffListDataSource.every(function (item: any) {
        //     return item.selected == true;
        // });
    }

    resetAllParams() {
        this.timesheetSearchFilterParams = new TimesheetSearchParameter()
        this.resetAllStaffPositionList();
        this.selectedAll = true;
        this.filteredStaffList = this.staffListDataSource;
        this.resetAllStaffList();
        this.timesheetSearchParam.StaffPositionID = 0;
        this.searchStaff = [];
        this.appPagination.resetPagination();
        this.dateTo = new Date();
        this.dateFrom = new Date();
        this.timesheetSearchParam.DateTo = this.getDateString(this.dateTo, this.dateFormatForSearch);
        this.timesheetSearchParam.DateFrom = this.getDateString(this.dateFrom, this.dateFormatForSearch);
        this.getStaffAttendance();

    }

    resetAllStaffPositionList() {
        this.isAllStaffPosition = true;
        this.positionListDataSource.forEach(p => {
            p.selected = true;
        });
    }

    resetAllStaffList() {
        this.filteredStaffList.forEach(s => {
            s.selected = true;
            this.searchStaff.push(s.StaffID);
        });
    }
}