/************************* Angular References ***********************************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

/********************* Material:Refference ********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** Service & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';

/* Models */
import { TodayTaskSearch, TodayActivities } from "src/app/models/today.task.model";
import { AllPerson, ApiResponse } from 'src/app/models/common.model';

/********************** Configurations *********************/
import { ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { CommonReportApi, StaffApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';


/********************** Components *********************/
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';

@Component({
    selector: 'today-task',
    templateUrl: './today.task.component.html'
})

export class TodayTaskComponent extends AbstractGenericComponent implements OnInit {

    // #region Local variables
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('todayTaskRef') todayTaskRef: DateToDateFromComponent;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;
    dateFormat: string = ""; //Configurations.DateFormat;

    /* Local Variables */
    clearstaffInput = '';
    isDataExists: boolean = false;
    //totalRecords: number = 0;
    dateFrom = new Date();
    dateTo = new Date();
    branchCurrentDate: Date;
    /* Pagination */
    // pageNumber: number = 1;
    // pageSizeOptions = Configurations.PageSizeOptions;
    // pageSize = Configurations.DefaultPageSize;
    // defaultPageSize = Configurations.DefaultPageSize;
    // pageIndex: number = 0;

    /* Collection And Models */
    searchStaff: FormControl = new FormControl();
    allStaff: AllPerson[];
    todayTaskSearch: TodayTaskSearch = new TodayTaskSearch();
    activitiesTypeList: any[] = [];
    todayStaffActivityList: any[] = [];
    allActivities: TodayActivities[];

    /* messages */
    messages = Messages;

    // #endregion

    constructor(
        private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService
    ) {  super(); }

    ngOnInit() {
        this.getBranchDatePattern();

        // this.searchStaff.valueChanges
        //     .pipe(debounceTime(400))
        //     .subscribe(searchText => {
        //         if (searchText && searchText !== "" && searchText.length > 2) {
        //             if (typeof (searchText) === "string") {
        //                 this._commonService.searchStaff(searchText).subscribe(response => {
        //                     if (response.Result != null && response.Result.length) {
        //                         this.allStaff = response.Result;
        //                     }
        //                     else {
        //                         this.allStaff = [];
        //                     }
        //                 });
        //             }
        //         }
        //         else {
        //             this.allStaff = [];
        //         }
        //     });
    }

    // #region Events

    // onStaffNameChange(staffName: any) {
    //     if (staffName && staffName.length < 3) {
    //         this.todayTaskSearch.StaffID = null;
    //     }
    // }

    reciviedDateTo($event) {
        this.todayTaskSearch.DateFrom = $event.DateFrom;
        this.todayTaskSearch.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.todayTaskSearch.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.todayTaskSearch.DateTo = date;
    }

    onReset() {
        this.todayTaskRef.resetDateFilter();
        this.resetTodayActivities();
    }

    // #endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.appPagination.paginator.pageSize = this.appPagination.pageSize;
        this.branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.todayTaskSearch.DateFrom = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat);
        this.todayTaskSearch.DateTo = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat);
        this.getFundamentals();
        this.getTodayStaffActivity();
        this.todayTaskSearch.ActvitiyTypeID = null;
    }

    getFundamentals() {
        this._httpService.get(CommonReportApi.Fundamental).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                this.activitiesTypeList = res.Result.CustomerActivityTypeList;
            }else{
                this._messageService.showErrorMessage(res.MessageText);
            }
        });
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getTodayStaffActivity();
    }

    searchTodayTask() {
        this.todayTaskSearch.StaffName = (<HTMLInputElement><any>(document.getElementById("today_staff_name"))).value;
        // this.todayTaskSearch.ActvitiyTypeID = Number(
        //     (<HTMLSelectElement>document.getElementById("today_task")).value
        //   );
        this.reciviedDateTo(this.todayTaskRef.dateToFrom);
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getTodayStaffActivity();
    }

    getTodayStaffActivity() {

        let params = {
            staffName: this.todayTaskSearch.StaffName.trim(),
            activityTypeID: this.todayTaskSearch.ActvitiyTypeID,
            // pageNumber: this.todayTaskSearch.PageNumber,
            // pageSize: this.todayTaskSearch.PageSize,
            dateFrom: this.todayTaskSearch.DateFrom,
            dateTo: this.todayTaskSearch.DateTo,

            pageNumber: this.appPagination.pageNumber,
            pageSize: this.appPagination.pageSize,
        }
        this._httpService.get(StaffApi.getTodayStaffActivity, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isDataExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isDataExists) {
                        this.allActivities = res.Result;
                        this.appPagination.totalRecords = res.TotalRecord;
                        this.setTimeFormat();
                    }
                    else {
                        this.allActivities = [];
                        this.appPagination.totalRecords = 0;
                    }
                    // this.isSearchByPageIndex = false;
                }else{
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Today's Activity"));
                });
    }


    // displayStaffName(user?: AllPerson): string | undefined {
    //     return user ? user.FirstName + ' ' + user.LastName : undefined;
    // }

    // getSelectedStaff(staff: AllPerson) {
    //     this.todayTaskSearch.StaffID = staff.StaffID;
    // }

    setTimeFormat() {
        this.allActivities.forEach((element => {
            element.StartTime = this._dateTimeService.formatTimeString(element.StartTime);
            element.EndTime = this._dateTimeService.formatTimeString(element.EndTime);
        }))
    }

    resetTodayActivities() {
        this.todayTaskSearch.StaffName = (<HTMLInputElement><any>(
            document.getElementById("today_staff_name")
        )).value = "";
        this.todayTaskSearch.ActvitiyTypeID = (<HTMLSelectElement><any>document.getElementById("today_task")).value = null;
        this.todayTaskSearch.DateFrom = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat);
        this.todayTaskSearch.DateTo = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat);
        this.clearstaffInput = '';
        this.appPagination.resetPagination();
       // this.appPagination.totalRecords = 0;
        this.getTodayStaffActivity();
    }

    // #endregion
}
