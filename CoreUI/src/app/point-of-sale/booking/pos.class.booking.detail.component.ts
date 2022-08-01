/** Angular Modules */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { Messages } from 'src/app/helper/config/app.messages';

/********************** Service & Models *********************/
/* Services */
import { DateTimeService } from 'src/app/services/date.time.service';
import { HttpService } from 'src/app/services/app.http.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MessageService } from 'src/app/services/app.message.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';

/* Models */
import { SearchClassBooking, ClassBookingDetail } from '../models/point.of.sale.model';
import { ApiResponse } from 'src/app/models/common.model';


/************* Configurations ***************/
import { Configurations, ClassStatusName } from 'src/app/helper/config/app.config';
import { BookingApi } from 'src/app/helper/config/app.webapi';
import { ClassStatus, ENU_DateFormatName } from 'src/app/helper/config/app.enums';

/************* Components ***************/
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { AttendeeComponent } from 'src/app/attendee/save-search/attendee.component';

/** Component */
@Component({
    selector: 'pos-class-booking-detail',
    templateUrl: './pos.class.booking.detail.component.html',
})

export class POSClassBookingDetailComponent extends AbstractGenericComponent implements OnInit {

    /** Scope Variables */
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
    @ViewChild('classesDateSearch') classesDateSearch: DateToDateFromComponent;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;
    dateFrom: Date;
    dateTo: Date;
    isGridDataExist: boolean;
    currencyFormat: string;
    dateFormat: string = "";

    /**Local**/
    sortOrder_ASC = Configurations.SortOrder_ASC;
    sortOrder_DESC = Configurations.SortOrder_DESC;
    sortOrder: string = this.sortOrder_DESC;

    /** Models & Lists */
    searchBookedClasses: SearchClassBooking;
    searchBookedClassesParams: SearchClassBooking = new SearchClassBooking();
    bookedClasses: ClassBookingDetail[] = [];

    /** Messages */
    messages = Messages;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    successMessage: string;
    errorMessage: string;


    /***********Configurations *********/
    timeFormat = Configurations.TimeFormat;
    dateFormatForSearch = Configurations.DateFormat;
    classStatus = ClassStatus;
    classStatusName = ClassStatusName;

    dateToPlaceHolder: string = 'Booking Date';
    dateFromPlaceHolder: string = 'Booking Date';

    longDateFormat: string = "";

    constructor(
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
        private _httpService: HttpService,
        private _matDialog: MatDialogService
    ) {
        super();
        this.searchBookedClasses = new SearchClassBooking();
    }


    /** LifeCycle Hooks */

    ngOnInit(): void {
        this.getCurrentBranchDetail();
    }

    ngAfterViewInit() {
        this.classesDateSearch.setEmptyDateFilter();
    }



    //#region Event Start

    reciviedDateTo($event) {
        this.searchBookedClasses.StartDate = $event.DateFrom;
        this.searchBookedClasses.EndDate = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.searchBookedClasses.StartDate = date;
    }

    onToDateChange(date: any) {
        this.searchBookedClasses.EndDate = date;
    }

    onManageAttendeeClick(classId, classDate) {
        if (classId > 0)
            this.openClassAttendeeForm(classId, classDate);
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getClassBookingDetails();
    }

    onSearchBookedClasses() {
        this.searchBookedClassesParams.StartDate = this._dateTimeService.convertDateObjToString(this.searchBookedClasses.StartDate, this.dateFormatForSearch);
        this.searchBookedClassesParams.EndDate = this._dateTimeService.convertDateObjToString(this.searchBookedClasses.EndDate, this.dateFormatForSearch);
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getClassBookingDetails();
    }

     //#region Event ENd

    //#region Method Start

    async getCurrentBranchDetail(){
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, "DateFormat");
        this.longDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.LongDateFormat);
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
        this.onLoadDefaultData();
    }

    getClassBookingDetails() {
        let params = {
            StartDate: this.searchBookedClassesParams.StartDate ? this._dateTimeService.convertDateObjToString(this.searchBookedClassesParams.StartDate, this.dateFormatForSearch) : "",
            EndDate: this.searchBookedClassesParams.EndDate ? this._dateTimeService.convertDateObjToString(this.searchBookedClassesParams.EndDate, this.dateFormatForSearch) : "",
            PageNumber: this.appPagination.pageNumber,
            PageSize: this.appPagination.paginator.pageSize,
            SortIndex: this.searchBookedClassesParams.SortIndex,
            SortOrder: this.searchBookedClassesParams.SortOrder,
        }

        this._httpService.get(BookingApi.getBookedClasses, params)
            .subscribe((res:ApiResponse )=> {
                if (res.Result != null && res.Result.length > 0) {
                    this.isGridDataExist = true;
                    this.bookedClasses = res.Result;
                    this.checkMinAttende();
                    //this.setTimeFormat();
                    if (res.Result.length > 0) {
                        this.appPagination.totalRecords = res.TotalRecord;
                    }

                    this.bookedClasses.forEach(booking => {
                        switch (booking.Status) {
                            case this.classStatus.BuyNow:
                                booking.StatusName = this.classStatusName.Open;
                                break;
                            case this.classStatus.Timeout:
                                booking.StatusName = this.classStatusName.Timeout;
                                break;
                            case this.classStatus.Full:
                                booking.StatusName = this.classStatusName.Full;
                                break;
                            case this.classStatus.BookingNotStarted:
                                booking.StatusName = this.classStatusName.BookingNotStarted;
                        }
                    })
                }
                else {
                    this.isGridDataExist = false;
                    this.appPagination.totalRecords = 0;
                    this.bookedClasses = null;
                    this._messageService.showErrorMessage(res.MessageText);

                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Bookings"));
                }
            );
    }

    onLoadDefaultData() {
        this.searchBookedClassesParams = new SearchClassBooking();
        this.searchBookedClassesParams.EndDate = "";
        this.searchBookedClassesParams.StartDate = "";
        this.appPagination.resetPagination();
        this.classesDateSearch.setEmptyDateFilter();
        this.getClassBookingDetails();
    }

    openClassAttendeeForm(classId, classDate) {
        const dialogRef = this._matDialog.open(AttendeeComponent, {
            disableClose: true,
            data: {
                ClassID: classId,
                ClassDate: new Date(classDate)
            }
        });
        dialogRef.componentInstance.isAttendeeUpdated.subscribe(isUpdated => {
            if (isUpdated) {
                this.getClassBookingDetails();
            }
        })
    }


    checkMinAttende() {
        this.bookedClasses.forEach(element => {
            if (element.TotalBooked < element.AttendeeMin) {
                element.MinAttendeMeet = false;
            }
            else {
                element.MinAttendeMeet = true;
            }
        });
    }

    changeSorting(sortIndex: number) {
        this.searchBookedClassesParams.SortIndex = sortIndex;
        if (sortIndex == 1) {
          if (this.sortOrder == this.sortOrder_ASC) {
            this.sortOrder = this.sortOrder_DESC;
            this.searchBookedClassesParams.SortOrder = this.sortOrder;
            this.getClassBookingDetails();
          } else {
            this.sortOrder = this.sortOrder_ASC;
            this.searchBookedClassesParams.SortOrder = this.sortOrder;
            this.getClassBookingDetails();
          }
        }
        if (sortIndex == 2) {
            if (this.sortOrder == this.sortOrder_ASC) {
              this.sortOrder = this.sortOrder_DESC;
              this.searchBookedClassesParams.SortOrder = this.sortOrder;
              this.getClassBookingDetails();
            } else {
              this.sortOrder = this.sortOrder_ASC;
              this.searchBookedClassesParams.SortOrder = this.sortOrder;
              this.getClassBookingDetails();
            }
          }
      }
    //#region Method End

}
