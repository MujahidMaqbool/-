/************************* Angular References ***********************************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

/********************* Material Reference ********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** Components *********************************/
import { StaffNotificationApi } from 'src/app/helper/config/app.webapi';
import { HttpService } from 'src/app/services/app.http.service';
import { Configurations } from 'src/app/helper/config/app.config';
import { LogSearch, Fundamental } from '../models/log.search.model';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { ApiResponse } from 'src/app/models/common.model';
import { MessageService } from 'src/app/services/app.message.service';

@Component({
    selector: 'search-log',
    templateUrl: './search.log.component.html'
})

export class SearchLogComponent extends AbstractGenericComponent implements OnInit {


    // #region Local Members

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('logRef') logRef: DateToDateFromComponent;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;


    /* Local Variables */
    dateFrom = new Date();
    dateTo = new Date();
    branchCurrentDate: Date;

    /* Models Refences */
    fundamentals: Fundamental = new Fundamental();
    logSearch: LogSearch = new LogSearch();
    logSearchParams:LogSearch  = new LogSearch();
    triggerCategoryList: any;
    eventTypeList: any;
    communicationTypeList: any;
    logList: any = [];
 
    sortIndex: number = 1;
    sortOrder_ASC = Configurations.SortOrder_ASC;
    sortOrder_DESC = Configurations.SortOrder_DESC;
    sortOrder: string;
    postionSortOrder: string;
    isPositionOrderASC: boolean = undefined;
    isDataExists: boolean = false;
    isTemplateTitile: boolean = true;
    //dateFormat = Configurations.DateFormat;
    dateFormat: string = "";

    constructor(
        private _router: Router,
        private _dataSharingService: DataSharingService,
        private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,

    ) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();                               
    }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.appPagination.paginator.pageSize = this.appPagination.pageSize;
        this.logSearch.DateFrom = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat);
        this.logSearch.DateTo = this._dateTimeService.convertDateObjToString(this.branchCurrentDate, this.dateFormat);
        this.getSearchFundamentals();
        this.getLogSearchList();
    }

    reciviedDateTo($event) {
        this.logSearch.DateFrom = $event.DateFrom;
        this.logSearch.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.logSearch.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.logSearch.DateTo = date;
    }

    // changePageSize(e: any) {
    //     if (e.pageIndex >= this.pageNumber) { this.pageNumber = ++e.pageIndex; }

    //     else {
    //         if (e.pageIndex >= 1) {
    //             this.pageNumber = --this.pageNumber;
    //         }
    //         else { this.pageNumber = 1 }
    //     }
    //     this.getLogSearchList();
    // }


    onChangeEventCategoryType(eventCategoryTypeID: number) {
        this.onSetEventTypes(eventCategoryTypeID);
    }

    onSetEventTypes(eventCategoryTypeID: number, isCallInTs: boolean = true) {
        if (eventCategoryTypeID > 0) {
            this.eventTypeList = this.fundamentals.EventType.filter(x => x.EventCategoryTypeID == eventCategoryTypeID);
            this.eventTypeList.splice(0, 0, { EventTypeID: 0, EventTypeName: "All", IsActive: true });
            this.logSearch.EventTypeID = isCallInTs ? 0 : this.logSearch.EventTypeID;
        } else {
            this.eventTypeList = this.fundamentals.EventType;
            this.logSearch.EventTypeID = isCallInTs ? 0 : this.logSearch.EventTypeID;
        }
    }

    onChangeEventType(eventTypeID: number) {
        var result = this.fundamentals.EventType.find(x => x.EventTypeID == eventTypeID);
        if (eventTypeID > 0) {
            this.logSearch.EventTypeID = eventTypeID;
            this.logSearch.EventCategoryTypeID = result.EventCategoryTypeID;
            this.onSetEventTypes(this.logSearch.EventCategoryTypeID, false);
        }else{
            this.logSearch.EventTypeID = 0;
        }
    }


    getTriggerCategoryName(eventCategoryTypeID) {
        return eventCategoryTypeID > 0 ? "(" + this.fundamentals.EventCategoryType.find(x => x.EventCategoryTypeID == eventCategoryTypeID).EventCategoryTypeName + ")" : "";
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getLogSearchList();
    }


    onSearchForm() {
        this.defaultSearchFilter();
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getLogSearchList();
    }

    defaultSearchFilter(){
        this.logSearchParams.EventCategoryTypeID = this.logSearch.EventCategoryTypeID > 0 ? this.logSearch.EventCategoryTypeID : null;
        this.logSearchParams.EventTypeID = this.logSearch.EventTypeID > 0 ? this.logSearch.EventTypeID : null;
        this.logSearchParams.CommunicationTypeID = this.logSearch.CommunicationTypeID > 0 ? this.logSearch.CommunicationTypeID : null;
    }

    getLogSearchList() {
     
        this.logSearchParams.EventCategoryTypeID = this.logSearchParams.EventCategoryTypeID > 0 ? this.logSearchParams.EventCategoryTypeID : null;
        this.logSearchParams.EventTypeID = this.logSearchParams.EventTypeID > 0 ? this.logSearchParams.EventTypeID : null;
        this.logSearchParams.CommunicationTypeID = this.logSearchParams.CommunicationTypeID > 0 ? this.logSearchParams.CommunicationTypeID : null;

        this.logSearchParams.DateFrom = this.logSearch.DateFrom,
        this.logSearchParams.DateTo = this.logSearch.DateTo,
        this.logSearchParams.PageNumber = this.appPagination.pageNumber,
        this.logSearchParams.PageSize = this.appPagination.pageSize,
        this.logSearchParams.SortIndex = this.logSearch.SortIndex,
        this.logSearchParams.SortOrder = this.logSearch.SortOrder

        this._httpService.get(StaffNotificationApi.viewLogList, this.logSearchParams)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode && res.MessageCode > 0) {

                    this.isDataExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isDataExists) {
                        if (res.Result.length > 0) {
                            this.appPagination.totalRecords = res.TotalRecord;
                        }
                        else {
                            this.appPagination.totalRecords = 0;
                        }
                        this.logList = res.Result;
                    } else {
                        this.appPagination.totalRecords = 0;
                    }
                    
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            });

    }

    getSearchFundamentals() {
        this._httpService.get(StaffNotificationApi.getLogFundamental)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode && res.MessageCode > 0) {
                this.fundamentals = res.Result;
                this.triggerCategoryList = this.fundamentals.EventCategoryType;
                this.eventTypeList = this.fundamentals.EventType;
                this.communicationTypeList = this.fundamentals.CommunicationType;
                this.setDefaultDrowdown();
                }else{
                    this._messageService.showErrorMessage(res.MessageText);
                }
            });
    }

    resetForm() {
        this.logSearchParams = new LogSearch();
        this.logRef.resetDateFilter();
        this.logSearch.EventCategoryTypeID = 0;
        this.logSearch.CommunicationTypeID = 0;
        this.logSearch.EventTypeID = 0;
        this.appPagination.resetPagination();
        this.onSetEventTypes(this.logSearch.EventCategoryTypeID);
        this.getLogSearchList();
    }

    setDefaultDrowdown() {
        this.communicationTypeList.splice(0, 0, { CommunicationTypeID: 0, CommunicationTypeName: "All", IsActive: true });
        this.triggerCategoryList.splice(0, 0, { EventCategoryTypeID: 0, EventCategoryTypeName: "All", IsActive: true });
        this.eventTypeList.splice(0, 0, { EventCategoryTypeID: 0, EventTypeID: 0, EventTypeName: "All", IsActive: true });
    }
}  