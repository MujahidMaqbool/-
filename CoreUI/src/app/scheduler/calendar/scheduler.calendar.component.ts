// #region Imports

/**Angular Modules */
import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { forkJoin, SubscriptionLike } from 'rxjs';

/** Models */
import {SchedulerDataSource, CellSelectedData, ActivityViewModel, StaffTaskActivity, SchedulerSearchParam, ActivityLaterViewModel, ClientAppointmentLaterActivity, UpdateLaterActivity
} from '@scheduler/models/scheduler.model';
import { Branch } from '@setup/models/branch.model';
import { ClassAppointmentDetail, ResourcesDataSource, UpdateClass } from '@scheduler/models/class.model';
import { SchedulerServiceModel, StaffBlockTimeModel, UpdateServiceBooking, StaffBlockTimeUpdateModel } from '@scheduler/models/service.model';
import { FavouriteViewDetail } from '@scheduler/models/favourite.view.model';
/** Serivces */
import { HttpService } from '@services/app.http.service';
import { DateTimeService } from '@services/date.time.service';
import { MessageService } from '@services/app.message.service';
import { AuthService } from "@app/helper/app.auth.service";
import { DataSharingService } from '@app/services/data.sharing.service';

/** App Components */
import { DataSourceModelMapper } from '@shared/helper/datasource-model-mapper';
import { SchedulerNavigationComponent } from '@scheduler/navigation/scheduler.navigation.component';

/** DevExtreme Component*/
import { DxSchedulerComponent } from 'devextreme-angular';
import Button from 'devextreme/ui/button';

/** Messages & Constants */

import { Configurations, SchedulerOptions } from '@helper/config/app.config';
import { SchedulerWeekDays, WeekDays, CustomerType, EnumBookingStatusType, enmSchedulerActvityType, ENU_Package, EnumSaleStatusType, ENU_DateFormatName, EnumSchedulerFavouriteViewTypeID, ENU_SchedulerActivityType } from '@helper/config/app.enums';
import { SchedulerApi, SchedulerServicesApi, MemberActivityApi, LeadActivityApi, StaffActivityApi, ClientActivityApi, SchedulerBlockTimeApi } from '@helper/config/app.webapi';
import { Messages } from '@app/helper/config/app.messages';
import { environment } from '@env/environment';
import { ENU_Permission_Module, ENU_Permission_Scheduler } from "@app/helper/config/app.module.page.enums";
import { ApiResponse } from '@app/models/common.model';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { DeleteSeriesComponent } from '@app/application-dialog-module/delete-dialog/delete.series.component';
import { AppUtilities } from '@app/helper/aap.utilities';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { EditSeriesComponent } from '@app/shared/components/scheduler/edit-series/edit.series.component';
import { EditClassAttendeeComponent } from '@app/shared/components/scheduler/edit-class-attendee/edit-class-attendee.component';
import { AttendeeComponent } from '@app/attendee/save-search/attendee.component';
import { FavouriteViewComponent} from '@app/shared/components/save-favourite-view/save.favourite.view.component';
import { AlertConfirmationComponent } from '@app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { MatSelect } from '@angular/material/select';
import * as events from 'devextreme/events';
declare var $: any;

import Scrollable from "devextreme/ui/scroll_view/ui.scrollable";


// #endregion

@Component({
    selector: 'app-scheduler-calendar',
    templateUrl: './scheduler.calendar.component.html',
    styleUrls: ['./scheduler.calendar.css']
})

export class SchedulerCalendarComponent extends AbstractGenericComponent implements OnInit, AfterViewInit {

    // #region Local Members

    /** Decorators */
    //@ViewChild(DxSchedulerComponent) scheduler: DxSchedulerComponent;

    @ViewChild(DxSchedulerComponent, { static: false })
    scheduler: any = DxSchedulerComponent;

    /** Scroll Variables */
    offset: any;
    schedulerScrollable: any;

    /** Local Variables */
    isSaveClassAllowed: boolean = false;
    isSaveServiceAllowed: boolean = false;
    isSaveBlockTimeAllowed: boolean = false;
    isSaveCallAllowed: boolean = false;
    isSaveAppointmentAllowed: boolean = false;
    isSaveTaskAllowed: boolean = false;
    isClassInPackage: boolean = false;
    isServiceInPackage: boolean = false;
    isBlockTimeInPackage: boolean = false;
    isCallInPackage: boolean = false;
    isAppointmentInPackage: boolean = false;
    isTaskInPackage: boolean = false;
    allowResizingOnScheduler: boolean = true;
    ShowMyOwnScheduler: boolean = false;
    isFavouriteViewInPackage: boolean = false;
    loggedInStaffID: number;
    staffExists: boolean = true;

    currentDate: Date = new Date();
    currentBranchTime: Date;
    selectedStaffId: number = 0;
    imageData64: any;
    schedulerClassInstance: any;
    searchStaff: any[] = [];
    searchFacilityList: any[] = [];
    searchStaffPosition: any[] = [];
    searchActivity: any[] = [];
    searchStaffPositions: any[] = [];
    showStaffPositionNameInTemplate: boolean = true;
    showTimeInTemplate: boolean = true;
    showStatusInTemplate: boolean = true;
    CLASS_DEFAULT_COLLOR = "#1f75b5";   /** Donot Delete Use in HTML */
    staffImpagePath: string = './assets/images/user.jpg';
    currentView: string;
    schedulerStartDayHour: any = 0;
    schedulerEndDayHour: any = 24;
    afterSaveStartDate: any = new Date();
    afterSaveEndDate: any = new Date();
    startViewDate: any = new Date();
    endViewDate: any = new Date();
    isTodayButtonAdded: boolean = false;
    shareStaffId: number;
    disableFacilityList: boolean;
    renderAppointmentElement: any = {};
    getSchedulerInstance = {};
    dialogRef: any;
    OFFSET_TOP: number;
    currentBranchTimeZone: string;
    dragStartDate: Date;
    isDragDrop: boolean = false;
    dropdownAppointments: any;
    isPopoverOpen: boolean = false;
    clickAppointmentElement: any;
    hasFacilityInPackage: boolean;
    isScrollToTimeCalled: boolean;
    donotScrollToTime: boolean = false;
    isShowTaskInRole: boolean = false;
    @ViewChild('mySelect') mySelect: MatSelect;
    defaultFavouriteViewValue: number = 0; //set default view as favourite view

    // Use for Grouping 
    isGroupByStaff: boolean = true;
    isShowFacilityIcon: boolean = false;

    /** Models */
    branchInfo: Branch = new Branch();
    _cellDataSelection: CellSelectedData = new CellSelectedData();
    classDetails: ClassAppointmentDetail;
    ServiceDetails: SchedulerServiceModel;
    schedulerSearchParam: SchedulerSearchParam = new SchedulerSearchParam();
    dataSourceModelMapper: DataSourceModelMapper = new DataSourceModelMapper(this._dateTimeService);
    loggedInStaffIdSubscription: SubscriptionLike;

    /** Lists */
    schedulerDataSourceList: SchedulerDataSource[] = [];
    serviceDateSourceList: any[];
    // When on Page load current view is Day, then change on option calendar
    schedulerViews: any[] = SchedulerOptions.CalendarDefaultViewOptions;
    staffListDataSource: any[] = [];
    filteredStaffListDataSource: any[] = [];
    resourcesStaffList: any[] = [];
    staffPositionListDataSource: any[] = [];
    CalendarActivitiesListDataSource: any[] = [];
    activitieList: any[] = [];
    facilityList: any[] = [];
    SchedulerFavouriteViewList: any[];

    /** Alert Messages */
    messages = Messages;
    schedulerWeekDays = SchedulerWeekDays;
    weekDays = WeekDays;
    dateFormat = Configurations.DateFormat;
    serverImageAddress = environment.imageUrl;

    /** Constants, Configuration */
    package = ENU_Package;
    private schedulerStaticStrings = new SchedulerOptions();
    dayViewDateFormat: string = "";//Configurations.SchedulerDateFormatDayView;
    weekViewDateFormatTo: string = "";//Configurations.SchedulerDateFormatWeekViewTo;
    weekViewDateFormatFrom = Configurations.SchedulerDateFormatWeekViewFrom;
    monthViewDateFormat = Configurations.SchedulerDateFormatMonthView;
    schedulerHeaderTimeFormat = Configurations.SchedulerHeaderTimeFormat;
    schedulerActivityType = SchedulerOptions.SchedulerActivityType;
    schedulerDateFormat: string = "";//Configurations.SchedulerTooltipDateFormat;
    recurrenceExceptionDateFormat: string = ""; //Configurations.RecurrenceExceptionDateFormat;

    packageIdSubscription: SubscriptionLike;

     //scheduler load according branch Date
     branchDate: Date = new Date();
     isLoaddedFundamentals: boolean = false;
     isUpdateSeries: boolean = false;    

     //favourite view ver

    // #endregion

    /** Constructor */
    constructor(
        private _authService: AuthService,
        private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService,
        private _schedulerDialog: MatDialogService,
        public _dialog: MatDialogService,
    ) {  super(); }

    /** Directive Initialization */
    ngOnInit() {       
        this.getBranchDatePattern();
    }
    ngAfterViewInit() {
        this.setSchedulerCurrentTimeIndicator();
    }

    async getBranchDatePattern() {
       
        //this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.dayViewDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
        this.weekViewDateFormatTo = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatWeekViewTo);
        this.schedulerDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerTooltipDateFormat);
        this.recurrenceExceptionDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.RecurrenceExceptionDateFormat);
    
        //implementation change after discuss with tahir bhai show branch current date not browser date implementaed by fahad dated on 03-03-2021
        this.branchDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

        this.currentDate = this.branchDate;
        this.startViewDate = this.branchDate;
        this.endViewDate = this.branchDate;

        this.scheduler.currentDate = this.branchDate;

        this.checkPackagePermissions();

    }

    async subscribeBranchTime() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            if (branch.BranchTimeFormat12Hours === true) {
                this.schedulerHeaderTimeFormat = Configurations.SchedulerHeaderTimeFormatWith12Hours;
            }
            this.currentBranchTimeZone = branch.TimeZone;
            this.setCurrentBranchTiming();
        }
      
         this._dataSharingService.loggedInStaffID.subscribe(
            (result) => {
                this.loggedInStaffID = result;
            }
        )
    }

    setCurrentBranchTiming() {
        var currentBranchTime = this._dateTimeService.getCurrentDateTimeForDScheduler();
        this.currentBranchTime = new Date(currentBranchTime);
        // var d = new Date(currentBranchTime);
        // var timeZoneDifference = (d.getTimezoneOffset() / 60) * -1; //convert to positive value.
        // d.setTime(d.getTime() + (timeZoneDifference * 60) * 60 * 1000);
        // this.currentBranchTime = d;
        // //this.currentBranchTime = new Date(this.currentBranchTime);
        // if (this.currentBranchTime.toString().indexOf('Z') > 0) {
        //     this.currentBranchTime = new Date(this.currentBranchTime.toString().split('Z')[0]);
        // }else if (this.currentBranchTime.toString().indexOf('+') > 0) {
        //     this.currentBranchTime = new Date(this.currentBranchTime.toString().split('+')[0]);
        // }else if(this.currentBranchTime.toString().indexOf('T') > 0){
        //     this.currentBranchTime = new Date(this.currentBranchTime.toString().replace('T', " "));
        // }
        this.setSchedulerCurrentTimeIndicator();
    }

    customizeDateNavigatorText = (e) => {

        if (!this.currentView || this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.Day || this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineDay)
            return this._dateTimeService.convertDateObjToString(e.startDate, this.dayViewDateFormat);

        if (this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.Month)
            return this._dateTimeService.convertDateObjToString(e.startDate, this.monthViewDateFormat);

        /** for Week View */
        if (e.startDate.getMonth() === e.endDate.getMonth())
            return this._dateTimeService.convertDateObjToString(e.startDate, this.weekViewDateFormatFrom) + " - " + this._dateTimeService.convertDateObjToString(e.endDate, this.weekViewDateFormatTo);
        else
            return this._dateTimeService.convertDateObjToString(e.startDate, this.weekViewDateFormatFrom) + " - " + this._dateTimeService.convertDateObjToString(e.endDate, this.weekViewDateFormatTo);
    }

    checkPackagePermissions() {
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPackagePermissions(packageId);
                if(this.isFavouriteViewInPackage) {
                    this.getSchedulerFavouriteViewsList();
                } 
                this.subscribeBranchTime();
                this.setPermissions();
                this.getAllSchedulerDataSource();
            }
        })
    }

    setPackagePermissions(packageId: number) {
        this.hasFacilityInPackage = false;

        switch (packageId) {
            case this.package.WellnessTop:
            case this.package.Full:
                this.hasFacilityInPackage = true;
                this.isFavouriteViewInPackage = true;
                break;
        }
        
        this.isClassInPackage = packageId == this.package.WellnessBasic || packageId == this.package.WellnessMedium || packageId == this.package.WellnessTop ? false : true;
        this.isServiceInPackage = packageId == this.package.FitnessBasic || packageId == this.package.FitnessMedium ? false : true;
        this.isBlockTimeInPackage = true;
        this.isCallInPackage = packageId == this.package.WellnessBasic || packageId == this.package.FitnessBasic ? false : true;
        this.isAppointmentInPackage = packageId == this.package.WellnessBasic || packageId == this.package.FitnessBasic ? false : true;
        this.isTaskInPackage = packageId == this.package.WellnessBasic || packageId == this.package.WellnessMedium || packageId == this.package.FitnessBasic ? false : true;
    }

    setPermissions() {
        this.isSaveClassAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Class);
        this.isSaveServiceAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Service);
        this.isSaveBlockTimeAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.BlockTime);
        this.isSaveCallAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Call);
        this.isSaveAppointmentAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Appointment);
        this.isSaveTaskAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Task);
        this.isShowTaskInRole = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.GroupByFacility);
        this.ShowMyOwnScheduler = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.ShowMyOwnScheduler);
       

    }

    getAllSchedulerDataSource() {

        // GET THE FIRST AND LAST DATE OF THE MONTH.
        let startDateParam = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormat),
            endDateParam = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormat),
            getSchedulerSearchFundamentals = this._httpService.get(SchedulerApi.getAllFundamentals),
            url = SchedulerApi.getAll.
                replace("{staffID}", "").
                replace("{isGroupByStaff}",String(this.isGroupByStaff)).
                replace("{facilityID}", "0").
                replace("{schedulerActivityTypeID}", "").
                replace("{startDate}", startDateParam).
                replace("{endDate}", endDateParam),
            getSchedulerData = this._httpService.get(url);

        forkJoin([getSchedulerData, getSchedulerSearchFundamentals]).subscribe(data => {
            this.getResponseSchedulerData(data);
        },
            err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Scheduler")); }
        );
    }

    getAllSchedulerAfterSaveActivity(startDate: string, endDate: string) {
        this.searchActivity = this.searchActivity.length == 0 ? [] : this.searchActivity;
        if (this.schedulerSearchParam.AllFacility) {
            this.searchFacilityList = [];
            this.searchFacilityList.push(0);
        };

        startDate = this._dateTimeService.convertDateObjToString(new Date(startDate), this.dateFormat),
            endDate = this._dateTimeService.convertDateObjToString(new Date(endDate), this.dateFormat);

        let url = SchedulerApi.getAll
            .replace("{staffID}", String(this.searchStaff))
            .replace("{isGroupByStaff}",String(this.isGroupByStaff))
            .replace("{facilityID}",String(this.searchFacilityList))
            .replace("{schedulerActivityTypeID}",String(this.searchActivity.sort()))
            .replace("{startDate}", startDate).replace("{endDate}", endDate);

        this._httpService.get(url).subscribe(
            data => {
                this.schedulerDataSourceList = this.dataSourceModelMapper.GetMapperModel(data, this.currentView);
                this.scheduler.instance.repaint();
                this.setOffset();
                
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Scheduler")); }
        );
    }

    getResponseSchedulerData(data) {
        this.bindDataSearchFundamentals(data[1]);
        this.setDefaultStaffForResources();
        this.setSchedulerViewOption();
        this.markAllSchedulerSearchParameter();
        if (data[0] && data[0].Result) {
            this.schedulerDataSourceList = [];
            this.schedulerDataSourceList = this.dataSourceModelMapper.GetMapperModel(data[0], this.currentView);
            
        }
        setTimeout(() => {this.defaultFavouriteViewValue = 0}, 200);
        (this.isGroupByStaff == true) ? this.isShowFacilityIcon = false : this.isShowFacilityIcon = true; 
    }

    setDefaultStaffForResources() {

        this.resourcesStaffList = this.filteredStaffListDataSource;
    }

    bindDataSearchFundamentals(data) {
        if (data && data.Result) {
            if (data.Result.StaffList.length < 1 || !data.Result.StaffList) {
                this.staffExists = false;
            }
            if (data.Result.StaffList) {
                this.staffListDataSource = [];

                data.Result.StaffList.forEach((sl, index) => {
                    let _objStaff = new ResourcesDataSource();
                    _objStaff.id = sl.StaffID;
                    _objStaff.text = sl.StaffFullName;
                    //_objStaff.selected = this.shareStaffId == sl.StaffID ? true : false;
                    _objStaff.selected = true;
                    _objStaff.staffPositionID = sl.StaffPositionID;
                    _objStaff.avatar = sl.ImagePath != "" ? this.serverImageAddress.replace("{ImagePath}",AppUtilities.setStaffImagePath()) + sl.ImagePath : this.staffImpagePath;
                    this.staffListDataSource.push(_objStaff);
                    this.selectedStaffId = index == 0 ? _objStaff.id : 0;
                });
            }
            if (data.Result.StaffPositionList) {
                this.staffPositionListDataSource = [];
                data.Result.StaffPositionList.forEach(pl => {
                    let objPosition = new ResourcesDataSource();
                    objPosition.id = pl.StaffPositionID;
                    objPosition.text = pl.StaffPositionName;
                    this.staffPositionListDataSource.push(objPosition);
                });
            }
            if (data.Result.SchedulerActivitiesList) {
                this.activitieList
                this.CalendarActivitiesListDataSource = [];
                data.Result.SchedulerActivitiesList.forEach(pl => {
                    let objActivity = new ResourcesDataSource();
                    objActivity.id = pl.SchedulerActivityTypeID;
                    objActivity.text = pl.SchedulerActivityTypeName;
                    objActivity.selected = false;
                    objActivity.color = pl.SchedulerActivityTypeColor;
                    //commented by fahad after disscusion with faizan ///
                    //All those activities which are turned off from roles section, should appear on activities search filter available on left side, when scheduler opens
                    //if (this.hasSaveAppointmentPermission(pl.SchedulerActivityTypeID))
                    if(this.hasAppointmentInPackage(pl.SchedulerActivityTypeID))
                        this.CalendarActivitiesListDataSource.push(objActivity);

                });

                this.activitieList = this.CalendarActivitiesListDataSource;
            }
            if (data.Result.FacilityList) {
                this.facilityList = [];
                data.Result.FacilityList.forEach(fl => {
                    let objActivity = new ResourcesDataSource();
                    objActivity.id = fl.FacilityID;
                    objActivity.text = fl.FacilityName;
                    objActivity.selected = false;
                    this.facilityList.push(objActivity);
                });
            }
           
            this.filteredStaffListDataSource = JSON.parse(JSON.stringify(this.staffListDataSource));
            this.isLoaddedFundamentals = true;
        }
    }

    onChangeGrouping() {
        if(this.isGroupByStaff){
            this.CalendarActivitiesListDataSource = this.activitieList;
        } else {
            this.CalendarActivitiesListDataSource = [];
            this.activitieList.forEach(activity => {
                if (activity.id == enmSchedulerActvityType.class || activity.id == enmSchedulerActvityType.service) {
                    this.CalendarActivitiesListDataSource.push(activity);
                }
            });           
        }        
        this.CalendarActivitiesListDataSource.forEach(calenderActivity => {
            calenderActivity.selected = true;
        });        
        this.schedulerSearchParam.AllSchedulerActivityType = this.CalendarActivitiesListDataSource.every((item: any) =>  item.selected == true);
        this.activityListChange(null);
    }

    onContentReady(event) {

        let self = this;
        let buttonHTMLClass = document.getElementsByClassName('today_green_btn'),
            buttonRefreshClass = document.getElementsByClassName('refreshButtonIcon'),
            calendarStartDate = this.scheduler.instance.getStartViewDate(),
            calendarEndDate = this.scheduler.instance.getEndViewDate(),
            today = new Date(this.branchDate.setHours(0, 0, 0)),
            todayText: string = "Today";

        /** Create Today Button */
        if (buttonHTMLClass.length < 1) {

            let element = document.querySelectorAll(".dx-scheduler-navigator");

            const container = document.createElement("div");
            container.setAttribute('class', 'today_green_btn');

            element[0].parentNode.insertBefore(container, element[0].nextSibling);

            new Button(container, {
                text: todayText,
                onClick: function () {
                    self.scheduler.instance.option("currentDate", today);

                    // let offset = Scrollable.getInstance(document.getElementsByClassName("dx-scrollable")[2]).scrollOffset();
                    setTimeout(() => {
                        // Scrollable.getInstance(document.getElementsByClassName("dx-scrollable")[2]).scrollTo(offset);
                    }, 100);
                }
            });
        }

        /** Create Refresh Button */
        if (buttonRefreshClass.length < 1) {
            let element = null;
            /** Create refresh button alongwith day/week/month view switcher */
            if (buttonHTMLClass.length > 0) {
                element = document.querySelectorAll(".today_green_btn");
            }
            else {
                element = document.querySelectorAll(".dx-scheduler-navigator");
            }

            const buttonContainer = document.createElement("div");
            buttonContainer.setAttribute('class', 'refreshButtonIcon');
            element[0].parentNode.insertBefore(buttonContainer, element[0].nextSibling);
            buttonContainer.onclick = function () { self.loadSearchFundamentals() };            
        }

        /** If button is found in current date then remove it */
        if (this.scheduler.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.Day) {
            if (Date.parse(calendarStartDate.toString()) === Date.parse(today.toString())) {
                buttonHTMLClass[0].remove();
            }
        } else {
            if (Date.parse(today.toString()) >= Date.parse(calendarStartDate.toString()) && Date.parse(today.toString()) <= Date.parse(calendarEndDate.toString())) {
                buttonHTMLClass[0].remove();
            }
        }

        if (buttonHTMLClass.length > 0) {
            switch (this.scheduler.currentView) {
                case this.schedulerStaticStrings.GetSchedulerStaticString.Day:
                    buttonHTMLClass[0]['innerText'] = "Today";
                    break;
                case this.schedulerStaticStrings.GetSchedulerStaticString.Week:
                    buttonHTMLClass[0]['innerText'] = "This Week";
                    break;
                case this.schedulerStaticStrings.GetSchedulerStaticString.Month:
                    buttonHTMLClass[0]['innerText'] = "This Month";
                    break;
            }
        }        

        if (!this.donotScrollToTime) {
            this.scrollToTimeAccordingView(event);
        }

        if(this.offset){
           this.setOffset(); 
        }

    }

    scrollPositionOffset() {

        if (!this.isScrollToTimeCalled) {
            // let offset = Scrollable.getInstance(document.getElementsByClassName("dx-scrollable")[2]).scrollOffset();

            // if (offset && offset.top > 0) {
            //     this.OFFSET_TOP = offset.top;
            // } else {
            //     this.OFFSET_TOP = window.pageYOffset;
            // }
            // if (this.scheduler.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.Week) {
            //     offset.top = this.OFFSET_TOP;
            // }
            // setTimeout(() => {
            //     Scrollable.getInstance(document.getElementsByClassName("dx-scrollable")[2]).scrollTo(offset);
            // });
        }
    }

    markAllSchedulerSearchParameter() {

        /** Default All is set true */
        this.disableFacilityList = false;
        this.schedulerSearchParam.AllStaffPosition = true;
        this.schedulerSearchParam.AllSchedulerActivityType = true;
        this.schedulerSearchParam.AllStaff = true;
        this.schedulerSearchParam.AllFacility = true;
        this.staffPositionListDataSource.forEach(item => {
            item.selected = this.schedulerSearchParam.AllStaffPosition;
        });
        this.filteredStaffListDataSource.forEach(item => {
            item.selected = this.schedulerSearchParam.AllStaff;
        });
        this.facilityList.forEach(item => {
            item.selected = this.schedulerSearchParam.AllFacility;
        });
        this.CalendarActivitiesListDataSource.forEach(item => {
            item.selected = this.schedulerSearchParam.AllSchedulerActivityType;
        });
    }

    onSchedulerOptionChanged(e) {
        if (e.name === this.schedulerStaticStrings.GetSchedulerStaticString.CurrentView || e.name === this.schedulerStaticStrings.GetSchedulerStaticString.CurrentDate) {  // firstTime loading check
            this.emptyDataSource();
            this.donotScrollToTime = false;
            //this.setSchedulerCurrentTimeIndicator();
            setTimeout(() => {
                try {
                    // Call API getAllScheduler with this start and end date params
                    if (e.component && e.component.getStartViewDate()) {
                        let _getstartDate = JSON.parse(JSON.stringify(e.component.getStartViewDate())),
                            _getendDate = JSON.parse(JSON.stringify(e.component.getEndViewDate()))
                        this.startViewDate = _getstartDate;
                        this.endViewDate = _getendDate;
                        this.afterSaveStartDate = _getstartDate;
                        this.afterSaveEndDate = _getendDate;
                        this.setStartDateAsEndDateInDayView(_getendDate);
                        this.loadSearchFundamentals();
                    }
                } catch (error) {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Scheduler"));
                    this.loadSearchFundamentals();
                }
            }, 1000);

            this.currentView = this.scheduler.currentView;
            this.resizePermissionInMonthView();
        }
    }

    setSchedulerViewOption() {
        this.schedulerViews = [{
            type: this.schedulerStaticStrings.GetSchedulerStaticString.Day,
            groups: [SchedulerOptions.strStaffID, SchedulerOptions.strFacilityID],
           
        },
        {
            type: this.schedulerStaticStrings.GetSchedulerStaticString.Week,
            
        },
        {
            type: this.schedulerStaticStrings.GetSchedulerStaticString.Month,
           
        }];
    }

    onAppointmentFormOpening(event) {
        //event.component._appointmentPopup._popup.hide();
    }

    onCellClick(event) {

        event.cancel = true;
        /**
        * For Adding All New Activities & remove previous Selection
        */
       
        this._cellDataSelection.ActivityType = undefined;
        this._cellDataSelection.ActivityTypeID = undefined;
        this._cellDataSelection.CustomerName = undefined;
        this._cellDataSelection.startDate = this.currentView == this.schedulerStaticStrings.GetSchedulerStaticString.Month ? new Date(new Date(event.cellData.startDate).setMinutes(new Date(event.cellData.startDate).getMinutes() + 60)) : event.cellData.startDate;
        this._cellDataSelection.endDate = this.currentView == this.schedulerStaticStrings.GetSchedulerStaticString.Month ? new Date(new Date(this._cellDataSelection.startDate).setMinutes(this._cellDataSelection.startDate.getMinutes() + 60)) : event.cellData.endDate;
        this._cellDataSelection.allDay = event.cellData.allDay == undefined ? false : event.cellData.allDay;

        this._cellDataSelection.StaffID = event.cellData.groups && this.isGroupByStaff ? event.cellData.groups.StaffID : 0;
        this._cellDataSelection.FacilityID = event.cellData.groups && !this.isGroupByStaff ? event.cellData.groups.FacilityID : 0;


        this._cellDataSelection.isRecurrenceException = false;

       this.getOffset();

        this.openFormDialog();
    }

    onAppointmentClick(event) {
        /** donot allow activity to edit that has been markasdone */
        // if (event.appointmentData.MarkAsDone) {
        //     this._messageService.showErrorMessage(this.messages.Validation.SchedulerCompletedActivityError);
        //     event.cancel = true;
        // }

        /** this date is set for edit click and "Edit this only" from series */
        this._cellDataSelection.startDate = event.targetedAppointmentData.startDate;
        // let popover = $('.dx-overlay.dx-popup.dx-popover');
        // if (popover[0]) {
        //     this.clickAppointmentElement = event;
        //     this.isPopoverOpen = true;
        // }
        /** this is also used for prevent default popup on view more option */

        //  Off-Time is also being treated as Appointment but it should be treated as Cell
        // if (event.targetedAppointmentData.text == "Off-Time") {
        //     event.cancel = true;
        //     this._cellDataSelection.ActivityType = undefined;
        //     this._cellDataSelection.ActivityTypeID = undefined;
        //     this._cellDataSelection.CustomerName = undefined;
        //     this._cellDataSelection.startDate = this.currentView == this.schedulerStaticStrings.GetSchedulerStaticString.Month ? new Date(new Date(event.targetedAppointmentData.startDate).setMinutes(new Date(event.targetedAppointmentData.startDate).getMinutes() + 60)) : event.targetedAppointmentData.startDate;
        //     this._cellDataSelection.endDate = this.currentView == this.schedulerStaticStrings.GetSchedulerStaticString.Month ? new Date(new Date(this._cellDataSelection.startDate).setMinutes(this._cellDataSelection.startDate.getMinutes() + 60)) : event.targetedAppointmentData.endDate;
        //     this._cellDataSelection.allDay = event.targetedAppointmentData.allDay == undefined ? false : event.targetedAppointmentData.allDay;
        //     this._cellDataSelection.StaffID = event.targetedAppointmentData.StaffID ? event.targetedAppointmentData.StaffID : 0;
        //     this._cellDataSelection.isRecurrenceException = false;
        //     this.openFormDialog();
        //     return;
        // }

        if (event.appointmentElement.className.includes("dx-list-item")) {

            event.cancel = true;
            this.isPopoverOpen = true;
        } else {
            this.isPopoverOpen = false;
        }

        this.getOffset();

    }

    onAppointmentDblClick(event) {

        event.cancel = true;

        setTimeout(() => {
            this.closeTooltip();
        }, 300);
        if (event.appointmentData.ActivityType == SchedulerOptions.SchedulerActivityType.ShiftInterval) {
            this._messageService.showErrorMessage(this.messages.Validation.StaffIntervalUpdateError);
        }
        /** donot allow activity to edit that has been markedasdone */
        else if (event.appointmentData.MarkAsDone) {
            this._messageService.showErrorMessage(this.messages.Validation.SchedulerCompletedActivityError);
        }
        else {
            if (this.hasSaveAppointmentPermission(event.appointmentData.ActivityTypeID)) {

                this.editSchedulerActivity(event.appointmentData, event.targetedAppointmentData.startDate);
            }
            else {
                this._messageService.showErrorMessage(this.messages.Error.Permission_Action_UnAuthorized);
            }
        }

        this.getOffset();
    }

    onAppointmentRendered(event) {

        event.appointmentElement.removeAttribute("title");
        var el = event.appointmentElement;
        el.style.backgroundColor = this.LightenColor(event.appointmentData.SchedulerActivityTypeColor, 85);
        el.style.borderLeft = "4px solid " + event.appointmentData.SchedulerActivityTypeColor;
        el.style.color = "#000000";

        let this_ = event;
        /** cancel keyboard event */
        event.appointmentElement.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.code === "Space") {
                e.stopPropagation();
            } else if (e.key === "Delete") {
                e.stopPropagation();
                if (this.isActivityValidForDelete(this_.appointmentData)) {
                    this.deleteActivity(this_.appointmentData);
                }
            }
        });
       
        events.on(event.appointmentElement, "dxdragstart", e => {
            
            // Add this date for adding RecurrenceException
            this.isDragDrop = true;
            this.dragStartDate = event.targetedAppointmentData.startDate;
            /** this Date is set on onAppointmentClick & onAppointmentDblClick for recurrenceException, 
             * Now we also used here because while dragging RRule class Form is Opened not auto drop updating. */
            this._cellDataSelection.startDate = this.dragStartDate;
            if(event.appointmentElement) event.appointmentElement.removeClass('dx-draggable');
        });
    }

    LightenColor(col: any, p: number) {

        const R = parseInt(col.substring(1, 3), 16);
        const G = parseInt(col.substring(3, 5), 16);
        const B = parseInt(col.substring(5, 7), 16);
        const curr_total_dark = (255 * 3) - (R + G + B);

        // calculate how much of the current darkness comes from the different channels
        const RR = ((255 - R) / curr_total_dark);
        const GR = ((255 - G) / curr_total_dark);
        const BR = ((255 - B) / curr_total_dark);

        // calculate how much darkness there should be in the new color
        const new_total_dark = ((255 - 255 * (p / 100)) * 3);

        // make the new channels contain the same % of available dark as the old ones did
        const NR = 255 - Math.round(RR * new_total_dark);
        const NG = 255 - Math.round(GR * new_total_dark);
        const NB = 255 - Math.round(BR * new_total_dark);

        const RO = ((NR.toString(16).length === 1) ? "0" + NR.toString(16) : NR.toString(16));
        const GO = ((NG.toString(16).length === 1) ? "0" + NG.toString(16) : NG.toString(16));
        const BO = ((NB.toString(16).length === 1) ? "0" + NB.toString(16) : NB.toString(16));

        return "#" + RO + GO + BO;
    }

    updateActivityForDragDrop(event) {
        if (this.hasSaveAppointmentPermission(event.newData.ActivityTypeID)) {
            if (event.newData) {
                this.getOffset();
                let oldData = JSON.parse(JSON.stringify(event.oldData));
                /** When you drag through 00:00:00 AM then its end time should 11:59:59 PM */
                //let newDataStartDate = new Date(event.newData.startDate);
                if (new Date(event.newData.startDate).getDate() !== new Date(event.newData.endDate).getDate()) {
                    let setHoursToEndDate = new Date(new Date(event.newData.endDate).setHours(23, 59, 59, 59));
                    event.newData.endDate = new Date(setHoursToEndDate.setDate(new Date(event.newData.startDate).getDate()));
                }
                /** (ALI-ZIA) New Functionality Changes: 03-Oct-2019 When I resigned from EMC :)
                 *  Edit This Only functionlity auto implemented while drag n drop not resize.
                */
                this.openSeriesConfirmDialogForDragNDrop(event);
                // if (event.newData.ActivityTypeID == enmSchedulerActvityType.class && event.newData.recurrenceRule && this.isDragDrop) {
                //     this.confirmSeriesDialogDragDropForClass(event);
                // }

                // else if (event.newData.ActivityTypeID == enmSchedulerActvityType.blockTime && event.newData.recurrenceRule && this.isDragDrop) {
                //     this._cellDataSelection.isRecurrenceException = true;
                //     this._cellDataSelection.startDate = new Date(this.startViewDate);
                //     this.checkActivityUpdateForDragAndDrop(event, oldData);
                //     /** Now set default value */
                //     this.isDragDrop = false;
                // }
                // else {
                //     this._cellDataSelection.isRecurrenceException = false;
                //     this.checkActivityUpdateForDragAndDrop(event, oldData);
                // }
            }
        } else {
            event.cancel = true;
            this._messageService.showErrorMessage(this.messages.Error.Permission_Page_UnAuthorized);
        }
    }

    onAppointmentUpdating(event) {
            if (this.hasSaveAppointmentPermission(event.newData.ActivityTypeID)) {
                if (event.newData) {
                    let oldData = JSON.parse(JSON.stringify(event.oldData));
                    /** When you drag through 00:00:00 AM then its end time should 11:59:59 PM */
                    //let newDataStartDate = new Date(event.newData.startDate);
                    if (new Date(event.newData.startDate).getDate() !== new Date(event.newData.endDate).getDate()) {
                        let setHoursToEndDate = new Date(new Date(event.newData.endDate).setHours(23, 59, 59, 59));
                        event.newData.endDate = new Date(setHoursToEndDate.setDate(new Date(event.newData.startDate).getDate()));
                    }
                    /** (ALI-ZIA) New Functionality Changes: 03-Oct-2019 When I resigned from EMC :)
                     *  Edit This Only functionlity auto implemented while drag n drop not resize.
                    */
                    //this.openSeriesConfirmDialogForDragNDrop(event);
                    if (event.newData.ActivityTypeID == enmSchedulerActvityType.class && event.newData.recurrenceRule && this.isDragDrop) {
                        this.confirmSeriesDialogDragDropForClass(event);
                    }
    
                    else if (event.newData.ActivityTypeID == enmSchedulerActvityType.blockTime && event.newData.recurrenceRule && this.isDragDrop) {
                        this._cellDataSelection.isRecurrenceException = true;
                        this._cellDataSelection.startDate = new Date(this.startViewDate);
                        this.checkActivityUpdateForDragAndDrop(event, oldData);
                        /** Now set default value */
                        this.isDragDrop = false;
                    }
                    else {
                        this._cellDataSelection.isRecurrenceException = false;
                        this.checkActivityUpdateForDragAndDrop(event, oldData);
                    }
                }
            } else {
                event.cancel = true;
                this._messageService.showErrorMessage(this.messages.Error.Permission_Page_UnAuthorized);
            }
    }

    confirmSeriesDialogDragDropForClass(event) {

        setTimeout(() => {
            this.closeTooltip();
        });

        /** Now set default value */
        this.isDragDrop = false;
        /** New Functionality That donot open confirm series (Automatically Edit This Only) but only for Classes        
         * Edit This Only, add recurrenceException while saving */
        this._cellDataSelection.isRecurrenceException = true;
        this._cellDataSelection.id = event.newData.id;
        this._cellDataSelection.StaffID = event.newData.StaffID;
        this._cellDataSelection.StaffFullName = event.newData.StaffFullName;
        this._cellDataSelection.startDate = new Date(event.newData.startDate);
        //this._cellDataSelection.oldStartDate = new Date(event.oldData.startDate);
        this._cellDataSelection.endDate = new Date(event.newData.endDate);
        this._cellDataSelection.IsDragDrop = true;
        this._cellDataSelection.DragStartDate = this.dragStartDate;
        // Set Scheduler ActivityType
        this._cellDataSelection.ActivityType = event.newData.ActivityType;
        this._cellDataSelection.ActivityTypeID = event.newData.ActivityTypeID;

        /** Dono Automatically update Class in Case of DragnDrop. Open the Form */
        this.openFormDialog();

    }

    openSeriesConfirmDialogForDragNDrop(event) {
        let oldData = JSON.parse(JSON.stringify(event.oldData));
        if (event.newData.recurrenceRule) {
            let isShowAttendeeButton = false;
            if (event.newData.ActivityTypeID === enmSchedulerActvityType.class) isShowAttendeeButton = true;
            this.dialogRef = this._schedulerDialog.open(EditSeriesComponent, { disableClose: true, data: { showAttendeeButton: isShowAttendeeButton, heading: event.newData.ActivityTypeID === enmSchedulerActvityType.class ? 'Class' : 'Block Time' } });

            /** Confirm Recurrence Rule Subscription */
            this.dialogRef.componentInstance.confirmEditSeries.subscribe((isConfirmEditSeries: Number) => {
                setTimeout(() => {
                    this.closeTooltip();
                });
                if (isConfirmEditSeries === 1) {
                    this._cellDataSelection.isRecurrenceException = false;
                    this.isUpdateSeries = true;
                    this.checkActivityUpdateForDragAndDrop(event, oldData);
                }
                else if (isConfirmEditSeries === 2) {
                    /** Edit This Only, add recurrenceException while saving */
                    this._cellDataSelection.isRecurrenceException = true;

                    /** Because recurrence Start Date is different, 
                     * Now user Edit this only with selection of Date */
                    this._cellDataSelection.startDate = new Date(this.startViewDate);

                     /** comented by fahad for chnages implementation not show edit popup for class */
                    /** Dono Automatically update Class in Case of DragnDrop. Open the Form */
                    if (event.newData.ActivityTypeID == enmSchedulerActvityType.class) {

                        this._cellDataSelection.id = event.newData.id;
                        this._cellDataSelection.StaffID = event.newData.StaffID;
                        this._cellDataSelection.StaffFullName = event.newData.StaffFullName;
                        this._cellDataSelection.startDate = new Date(event.newData.startDate);
                        this._cellDataSelection.endDate = new Date(event.newData.endDate);
                        if (this.isDragDrop) {
                            this._cellDataSelection.IsDragDrop = true;
                            this._cellDataSelection.DragStartDate = this.dragStartDate;
                        }
                        // Set Scheduler ActivityType
                        this._cellDataSelection.ActivityType = event.newData.ActivityType;
                        this._cellDataSelection.ActivityTypeID = event.newData.ActivityTypeID;
                    /** start comented by fahad for chnages implementation not show edit popup for class */
                    //     this.openFormDialog();
                    // }
                    // else {
                       /** end comented by fahad for chnages implementation not show edit popup for class */
                    }
                    this.isUpdateSeries = false;
                    this.checkActivityUpdateForDragAndDrop(event, oldData);
                }
                else {
                    this.dragStartDate = null;
                    //this.loadSearchFundamentals();
                    this.refreshDataSourceAfterDragDrop(oldData);
                }
            });

            /** Confirm Manage Attendee Subscription */
            this.dialogRef.componentInstance.confirmManageAttendeeClick.subscribe((manageAttendee: boolean) => {
                setTimeout(() => {
                    this.closeTooltip();
                });

                if (manageAttendee) {
                    if (event.newData && event.newData.id > 0 && event.newData.ActivityTypeID === enmSchedulerActvityType.class) {
                        if (event.newData.recurrenceRule){
                            event.newData.startDate = this._cellDataSelection.startDate;
                        }
                            
                        this.openClassAttendeeForm(event.newData);
                    }
                }
            });
        } else {
            this._cellDataSelection.isRecurrenceException = false;
            this.checkActivityUpdateForDragAndDrop(event, oldData);
        }
    }

    checkActivityUpdateForDragAndDrop(event, oldData) {
        switch (event.newData.ActivityTypeID) {
            case enmSchedulerActvityType.class:
                /** DragnDrop Edit This Only feature is changed, (06/08/2019) open form dialog to save class */
                //if (!this._cellDataSelection.isRecurrenceException) {
                    /**If class series has attendee(s) user can not update class using drag & drop*/
                        if (event.oldData.IsDragable === true) {
                            this.updateClassForDragDrop(event.newData, event.oldData);
                        } else {
                            this.loadSearchFundamentals();
                            this._messageService.showErrorMessage(this.messages.Error.ClassEditSeriesError);
                        }
                //}
                break;
            case enmSchedulerActvityType.service:
                if (event.newData.BookingStatusTypeID === EnumBookingStatusType.Attended) {
                    this._messageService.showErrorMessage(this.messages.Error.service_Attended_update_Error);
                    event.cancel = true;
                    /** Back to old data because dropping date and time will be new Data */
                    this.refreshDataSourceAfterDragDrop(oldData);
                }
                else
                    if (event.newData.BookingStatusTypeID === EnumBookingStatusType.NoShow) {
                        this._messageService.showErrorMessage(this.messages.Error.service_NoShow_update_Error);
                        event.cancel = true;
                        /** Back to old data because dropping date and time will be new Data */
                        this.refreshDataSourceAfterDragDrop(oldData);
                    }
                    else {
                        this.updateSaleService(event.newData);
                    }
                break;
            case enmSchedulerActvityType.blockTime:
                this.updateStaffBlockTimeForDragDrop(event.newData, oldData);
                break;
            case enmSchedulerActvityType.call:
                if (event.newData.MarkAsDone) {
                    this._messageService.showErrorMessage(this.messages.Validation.SchedulerCompletedActivityError);
                    event.cancel = true;
                    /** Back to old data because dropping date and time will be new Data */
                    this.refreshDataSourceAfterDragDrop(oldData);
                }
                else {
                    this.saveCallAppointmentForDragDrop(event.newData, event);
                }
                break;
            case enmSchedulerActvityType.appointment:
                /** If Appointment is save in previous date from currentDate for drag drop then cancel to update on scheduler */
                if (event.newData.MarkAsDone) {
                    this._messageService.showErrorMessage(this.messages.Validation.SchedulerCompletedActivityError);
                    event.cancel = true;
                    /** Back to old data because dropping date and time will be new Data */
                    this.refreshDataSourceAfterDragDrop(oldData);
                }
                else {
                    this.saveCallAppointmentForDragDrop(event.newData, event);
                }
                break;
            case enmSchedulerActvityType.task:
                if (event.newData.MarkAsDone) {
                    this._messageService.showErrorMessage(this.messages.Validation.SchedulerCompletedActivityError);
                    event.cancel = true;
                    /** Back to old data because dropping date and time will be new Data */
                    this.refreshDataSourceAfterDragDrop(oldData);
                }
                else {
                    this.updateTaskForDragDrop(event.newData);
                }
                break;
        }
    }

    deleteActivity(activityData) {

        setTimeout(() => {
            this.closeTooltip();
        }, 100);

        if (activityData.ActivityType) {
            if (activityData.ActivityTypeID === enmSchedulerActvityType.class){
                this.deleteClassSeriesOrOnlyThis(activityData);
            } else if(activityData.ActivityTypeID === enmSchedulerActvityType.blockTime){
                this.deleteBlockTimeSeriesOrOnlyThis(activityData);
            }
            else{
                this.confirmDeleteActivity(activityData);
            }
                
        }
    }

    isActivityValidForDelete(activityData: any) {

        let isValid = false;
        /** Service Paid Check */
        if (activityData.ActivityTypeID == enmSchedulerActvityType.service && activityData.SaleStatusTypeID == EnumSaleStatusType.Paid) {
            isValid = false;
        }
        else {
            isValid = true;
        }
        return isValid;
    }

    confirmDeleteActivity(_actvity: any) {
        this.dialogRef = this._schedulerDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        this.dialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                switch (_actvity.ActivityTypeID) {
                    case enmSchedulerActvityType.service:
                        this.deleteService(_actvity.id, _actvity.CustomerID, _actvity.StaffID);
                        break;
                    // case enmSchedulerActvityType.blockTime:
                    //     this.deleteBlockTime(_actvity.id);
                    //     break;
                    case enmSchedulerActvityType.call:
                        if (!_actvity.MarkAsDone) {
                            this.deleteCallOrAppointmentActivity(_actvity);
                        } else {
                            this._messageService.showErrorMessage(this.messages.Error.Restrict_Delete_Activity);
                        }
                        break;
                    case enmSchedulerActvityType.appointment:
                        if (!_actvity.MarkAsDone) {
                            this.deleteCallOrAppointmentActivity(_actvity);
                        } else {
                            this._messageService.showErrorMessage(this.messages.Error.Restrict_Delete_Activity);
                        }
                        break;
                    case enmSchedulerActvityType.task:
                        if (!_actvity.MarkAsDone) {
                            this.deleteTask(_actvity.id, _actvity.ActivityTypeID, _actvity.StaffID);
                        } else {
                            this._messageService.showErrorMessage(this.messages.Error.Restrict_Delete_Activity);
                        }
                        break;
                }
            }
        });
    }

    manageAttendeeActivity(classData) {

        setTimeout(() => {
            this.closeTooltip();
        }, 100);

        if (classData && classData.id > 0 && classData.ActivityType === SchedulerOptions.SchedulerActivityType.Class) {
            if (classData.recurrenceRule){
                classData.startDate = this._cellDataSelection.startDate ? this._cellDataSelection.startDate : this.startViewDate;
                // classData.startDate = this.scheduler.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.Week
                //                         || this.scheduler.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.Month
                //                          ? this._cellDataSelection.startDate : this.startViewDate; 
            }
            this.openClassAttendeeForm(classData);
        }
    }

    loadSearchFundamentals(emptySearchParam:boolean = true) {
        /**
         * If Option is change then start and end date will be also change, 
         * so in filter activities we have to pass these params. 
         */
        let startDateParam, endDateParam;

        if (this.startViewDate && this.endViewDate) {
            startDateParam = this.startViewDate;
            endDateParam = this.endViewDate;
        } else {
            startDateParam = this.branchDate;
            endDateParam = this.branchDate;
        }

        /**
         * load the activities according to search params
         * start and end date is selected from calendar
         */

        this.searchActivity.length == 0 ? "" : this.searchActivity;
        this.searchFacilityList.length == 0 ? 0 : this.searchFacilityList;
        this.searchStaff.length == 0 ? "" : this.searchStaff;

        startDateParam = this._dateTimeService.convertDateObjToString(new Date(startDateParam), this.dateFormat),
            endDateParam = this._dateTimeService.convertDateObjToString(new Date(endDateParam), this.dateFormat);

        if(this.isLoaddedFundamentals) {

                if (this.validateSearchFilterPosition() && this.validateSearchFilterStaff(emptySearchParam) && this.validateSearchFilterActivities() && this.validateSearchFilterFacility(emptySearchParam)) {

                    this.showHideCustomerNameOnTemplate();
                    /**prevent scheduler jerk on refresh button click */
                    if(!this.isGroupByStaff){
                        this.isShowFacilityIcon = true;
                        let faclityList = [];
                            /**'0' means this is All case */
                        if (this.searchFacilityList.toString() === '0') {
                            faclityList = this.facilityList ;
                        } else {
                                this.searchFacilityList.forEach(id => {
                                    faclityList.push(this.facilityList.find(x => x.id == id));
                                });
                        }
                        
                        this.resourcesStaffList = faclityList;
                    }

                    let url = SchedulerApi.getAll.replace("{staffID}", String(this.searchStaff))
                        .replace("{isGroupByStaff}", String(this.isGroupByStaff))
                        .replace("{facilityID}", String(this.searchFacilityList))
                        .replace("{schedulerActivityTypeID}", String(this.searchActivity.sort()))
                        .replace("{startDate}", startDateParam).replace("{endDate}", endDateParam);
    
                    this._httpService.get(url)
                        .subscribe(data => {
                            
                            if(this.isGroupByStaff){
                                this.isShowFacilityIcon = false;
                                this.filterStaffResourceGroup(this.searchStaff);
                            }
                            else{
                                this.filterGrouping();
                            }
    
                            this.schedulerDataSourceList = this.dataSourceModelMapper.GetMapperModel(data, this.currentView);
    
                            this.setCurrentBranchTiming();
                        },
                            err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Scheduler")); }
                    );
                }          
         
        }
       
       
    }

    /**On reset call default fav view */
    resetSearchFundamentalFilters() {
        this.onFavouriteViewChange(this.defaultFavouriteViewValue);
    }

    resetSearchFundamentals() {
        /** 
         * If Option is change then start and end date would be change, 
         * so in filter activities we have to pass these params. 
         */

        //added by fahad. reset button show all staff as selected. 
        this.filteredStaffListDataSource = this.staffListDataSource;

        //added by fahad grouping implementation
        this.isGroupByStaff = true;
        this.onChangeGrouping();
        this.isShowFacilityIcon = false;


        this.markAllSchedulerSearchParameter();
        this.showHideCustomerNameOnTemplate();
        //this.schedulerSearchParam.StaffPositionID = 0;

        let startDateParam, endDateParam;
        if (this.startViewDate && this.endViewDate) {
            startDateParam = this.startViewDate;
            endDateParam = this.endViewDate;
        } else {
            startDateParam = this.branchDate;
            endDateParam = this.branchDate;
        }

        startDateParam = this._dateTimeService.convertDateObjToString(new Date(startDateParam), this.dateFormat),
            endDateParam = this._dateTimeService.convertDateObjToString(new Date(endDateParam), this.dateFormat);

        let url = SchedulerApi.getAll.replace("{staffID}", "")
            .replace("{isGroupByStaff}", this.isGroupByStaff.toString())
            .replace("{facilityID}", "0")
            .replace("{schedulerActivityTypeID}", "")
            .replace("{startDate}", startDateParam).replace("{endDate}", endDateParam);

        this._httpService.get(url)
            .subscribe(data => {
                this.resourcesStaffList = this.filteredStaffListDataSource;     // Default is all Staffs
                this.schedulerDataSourceList = this.dataSourceModelMapper.GetMapperModel(data, this.currentView);
                this.defaultFavouriteViewValue = 0;  //set default view  as favourite view
                this.scrollPositionOffset();
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Scheduler")); }
            );
    }

    validateSearchFilterStaff(emptySearchParam: boolean = true): boolean {

        emptySearchParam ? this.emptySearchParam() : '';

        if(this.isGroupByStaff){
            /** If no staff is selectd */
            if (this.filteredStaffListDataSource.length > 0) {
                let filterAllUnSelectedStaff = this.filteredStaffListDataSource.every(s => s.selected === false);
                if (filterAllUnSelectedStaff) {
                    this._messageService.showErrorMessage(this.messages.Validation.Scheduler_Staff_Required_Error);
                    return false;
                } else
                    return true;
            } else if (this.ShowMyOwnScheduler) {
                    /**When showMYScheduler is on and staff scheduler permissions are OFF then staf list is empty (add login staff id in staff list)*/
                    this.loggedInStaffID ? this.filteredStaffListDataSource.push(this.loggedInStaffID) : '';
                    return true;
            }
        } else {
            return true;
        }
       
    }

    validateSearchFilterFacility(emptySearchParam: boolean = true): boolean {

        if(emptySearchParam) {
            this.emptySearchParam();
        } else {
                if (this.schedulerSearchParam.AllFacility) {
                    this.searchFacilityList = [];
                    this.searchFacilityList.push(0);
                }
        }

        if(!this.isGroupByStaff){
            /** If no staff is selectd */
            if (this.searchFacilityList.length > 0) {
                    return true;
            } else
                this._messageService.showErrorMessage(this.messages.Validation.Scheduler_Group_Facility_Required_Error);
                return false;
        } else{
            return true;
        }
       
    }
    
    emptySearchParam() {

        if (this.schedulerSearchParam.AllStaff) {          
            if (!this.schedulerSearchParam.AllStaffPosition) {               
                this.resourcesStaffList = this.filteredStaffListDataSource.filter(x => this.staffPositionListDataSource.some(sp => sp.selected === true && sp.id === x.staffPositionID));
            } else {
                this.searchStaff = [];
            }
        }

        if (this.schedulerSearchParam.AllSchedulerActivityType) {
            this.searchActivity = [];
        }

        if (this.schedulerSearchParam.AllFacility) {
            this.searchFacilityList = [];
            this.searchFacilityList.push(0);
        }

        /** if class/service is not selected then empty previous selection */
        if (this.disableFacilityList) {
            this.searchFacilityList = [];
        }
    }

    validateSearchFilterActivities() {
        /** If no activity is selectd */
        let filterAllUnSelectedActivity = this.CalendarActivitiesListDataSource.every(s => s.selected === false);
        if (filterAllUnSelectedActivity) {
            this._messageService.showErrorMessage(this.messages.Validation.Scheduler_Activity_Required_Error);
            return false;
        } else
            return true;
    }

    validateSearchFilterPosition() {
        /** If no position is selectd */
        let filterAllUnSelectedActivity = this.staffPositionListDataSource.every(s => s.selected === false);
        if (filterAllUnSelectedActivity) {
            this._messageService.showErrorMessage(this.messages.Validation.Scheduler_Position_Required_Error);
            return false;
        } else
            return true;
    }

    staffPositionChangeAll() {

        this.staffPositionListDataSource.forEach(item => {
            item.selected = this.schedulerSearchParam.AllStaffPosition;
        });
        this.onStaffPositionChange();
    }

    onStaffPositionChange() {
       
        this.searchStaff = [];
        this.schedulerSearchParam.AllStaffPosition = this.staffPositionListDataSource.every(p => p.selected === true);
        this.schedulerSearchParam.AllStaff = this.schedulerSearchParam.AllStaffPosition || this.staffPositionListDataSource.some(p => p.selected === true);
        this.filteredStaffListDataSource.forEach(staff => {
            staff.selected = false;
        });

        this.filteredStaffListDataSource = this.staffListDataSource.filter(x => this.staffPositionListDataSource.some(sp => sp.selected === true && sp.id === x.staffPositionID));
        
        if(this.isGroupByStaff){
            this.resourcesStaffList = this.filteredStaffListDataSource;

            this.resourcesStaffList.forEach(x => {
                this.filteredStaffListDataSource.filter(s => s.id === x.id)[0].selected = true;
            })
    
                
            this.resourcesStaffList.forEach(item => { this.searchStaff.push(item.id) });
        } else {
            var resourcesStaffList = this.filteredStaffListDataSource;

            resourcesStaffList.forEach(x => {
                this.filteredStaffListDataSource.filter(s => s.id === x.id)[0].selected = true;
            })
    
            resourcesStaffList.forEach(item => { this.searchStaff.push(item.id) });
        }        
        
    }

    staffListChangeAll() {
        //this condidition added by fahad. when position is not selected and user can select staff to show validation
        if(this.filteredStaffListDataSource && this.filteredStaffListDataSource.length > 0){
            this.filteredStaffListDataSource.forEach(item => {
                item.selected = this.schedulerSearchParam.AllStaff;
            });
            this.staffListChange();
        } else{
            this._messageService.showErrorMessage(this.messages.Validation.Scheduler_Position_Required_Error);
        }
    }

    staffListChange() {

        this.searchStaff = [];
        if (this.filteredStaffListDataSource && this.filteredStaffListDataSource.length > 0) {
            this.schedulerSearchParam.AllStaff = this.filteredStaffListDataSource.every((item: any) => item.selected == true);
        }

        this.filteredStaffListDataSource.filter(x => x.selected == true).forEach(item => { this.searchStaff.push(item.id) });
        
    }

    showHideCustomerNameOnTemplate() {

        let filterSelectedStaff = this.filteredStaffListDataSource.filter(s => s.selected === true);
        if (filterSelectedStaff.length > 2)
            this.showStaffPositionNameInTemplate = false;
        else
            this.showStaffPositionNameInTemplate = true;

        if (filterSelectedStaff.length >= 8) {
            this.showStatusInTemplate = false;

        } else {
            this.showStatusInTemplate = true;
        }
    }

    facilityListChangeAll() {

        this.facilityList.forEach(item => {
            item.selected = this.schedulerSearchParam.AllFacility;
        });
        this.facilityListChange();
    }

    facilityListChange() {

        this.searchFacilityList = [];
        this.schedulerSearchParam.AllFacility = this.facilityList.every(function (item: any) { return item.selected == true; });
        this.facilityList.filter(x => x.selected == true).forEach(item => { this.searchFacilityList.push(item.id) });
    }

    activityListChangeAll() {

        this.CalendarActivitiesListDataSource.forEach(item => { item.selected = this.schedulerSearchParam.AllSchedulerActivityType; });
        this.activityListChange(null);

        //** If Activity is select all then class/service is enable so, we have to enable facility else false */
        if (this.schedulerSearchParam.AllSchedulerActivityType) {
            this.disableFacilityList = false;
            this.schedulerSearchParam.AllFacility = true;
            this.facilityList.forEach(item => {
                item.selected = true;
            });
        } else {
            this.disableFacilityList = true;
            this.schedulerSearchParam.AllFacility = false;
            this.facilityList.forEach(item => {
                item.selected = false;
            });
        }
    }

    activityListChange(event) {

        this.searchActivity = [];
        this.schedulerSearchParam.AllSchedulerActivityType = this.CalendarActivitiesListDataSource.every(function (item: any) { return item.selected == true; });
        this.CalendarActivitiesListDataSource.filter(x => x.selected == true).forEach(item => { this.searchActivity.push(item.id) });

        //** If Activity list has class/service is selected */
        this.disableFacilityList = true;
        this.CalendarActivitiesListDataSource.forEach(activity => {
            if ((activity.id === 1 && activity.selected === true) || (activity.id === 5 && activity.selected === true)) {
                this.disableFacilityList = false;
            }
        });
        //** If facility is not active for Class/Service then disable and checked all false else true*/
        if (this.disableFacilityList) {
            this.schedulerSearchParam.AllFacility = false;
            this.facilityList.forEach(item => {
                item.selected = false;
            });
        } else {
            this.schedulerSearchParam.AllFacility = true;
            this.facilityList.forEach(item => {
                item.selected = true;
            });
        }
    }

    filterStaffResourceGroup(selectedStaffIds) {

        if (this.resourcesStaffList.length > 0) {
            if (selectedStaffIds && selectedStaffIds.length > 0 && this.staffExists) {
                let staffList = [];
                selectedStaffIds.forEach(id => {
                    staffList.push(this.filteredStaffListDataSource.find(x => x.id == id));
                });
                this.resourcesStaffList = staffList;
            }
            else {
                this.resourcesStaffList = this.filteredStaffListDataSource;
            }
            this.scrollPositionOffset();
        }
    }

    filterGrouping() {
        if(this.hasFacilityInPackage){
            if(this.searchFacilityList && this.searchFacilityList.length > 0 && this.searchFacilityList[0] > 0){
                let faclityList = [];
                this.searchFacilityList.forEach(id => {
                        faclityList.push(this.facilityList.find(x => x.id == id));
                });
                this.resourcesStaffList = faclityList;
            } else{
                this.resourcesStaffList = this.facilityList;
            }
            this.isShowFacilityIcon = true;
        }
    }

    openFormDialog() {

        setTimeout(() => {
            this.closeTooltip();
        });
       //**Check permissions for scheduler activities*/ 
       if(!this.isSaveClassAllowed && !this.isSaveServiceAllowed && !this.isSaveBlockTimeAllowed && !this.isSaveCallAllowed && !this.isSaveAppointmentAllowed && !this.isSaveTaskAllowed) {
        this._messageService.showErrorMessage(this.messages.Error.Activities_Not_Allowed);
        return;
       }

        this.isDragDrop = false;
        this.dialogRef = this._schedulerDialog.open(SchedulerNavigationComponent,
            {
                disableClose: true,
                panelClass: 'cst-xl-popup-overlay',
                data: this._cellDataSelection
            });

        this.dialogRef.componentInstance.SaveActivity.subscribe((model: any) => {

            switch (this.dialogRef.componentInstance.activeTab) {
                case SchedulerOptions.SchedulerActivityType.Class:
                    this.classDetails = model;
                    this.saveClass(this.classDetails);
                    break;
                case SchedulerOptions.SchedulerActivityType.Service:                      
                     this.saveSchedulerService(model);                                        
                    break;
                case SchedulerOptions.SchedulerActivityType.BlockTime:
                    this.saveStaffBlockTime(model);
                    break;
                case SchedulerOptions.SchedulerActivityType.Call:
                    this.saveCall(model);
                    break;
                case SchedulerOptions.SchedulerActivityType.Appointment:
                    this.saveAppointment(model);
                    break;
                case SchedulerOptions.SchedulerActivityType.Task:
                    this.saveTask(model);
                    break;
            }
        });

        this.dialogRef.componentInstance.ReloadScheduler.subscribe((isReload: Boolean) => {
            if (isReload) {
                this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
            }
        });

    }

    hideAppointmentTooltip() {
        setTimeout(() => {
            this.closeTooltip();
        }, 100);
    }

    convertDateToTimeSpan(date) {
        return date.getHours() + ":" + date.getMinutes();
    }

    reScheduleServiceActivity(singleSchedulerData, cellClickStartDate?) {

        this.hideAppointmentTooltip();
        this._cellDataSelection.isRescheduleService = true;
        this._cellDataSelection.ServiceID = singleSchedulerData.ServiceID;
        this._cellDataSelection.startDate = new Date(singleSchedulerData.startDate);
        this._cellDataSelection.isRecurrenceException = false;
        this._cellDataSelection.endDate = new Date(singleSchedulerData.endDate);
        this._cellDataSelection.allDay = singleSchedulerData.allDay == undefined ? false : singleSchedulerData.allDay;
        this._cellDataSelection.id = singleSchedulerData.id;
        this._cellDataSelection.StaffID = singleSchedulerData.StaffID;
        this._cellDataSelection.StaffFullName = singleSchedulerData.StaffFullName;
        this._cellDataSelection.CustomerTypeID = singleSchedulerData.CustomerTypeID ? singleSchedulerData.CustomerTypeID : undefined;
        this._cellDataSelection.CustomerID = singleSchedulerData.CustomerID ? singleSchedulerData.CustomerID : undefined;
        this._cellDataSelection.CustomerName = singleSchedulerData.CustomerName ? singleSchedulerData.CustomerName : undefined;
        this._cellDataSelection.CustomerEmail = singleSchedulerData.CustomerEmail ? singleSchedulerData.CustomerEmail : undefined;
        this._cellDataSelection.CustomerMobile = singleSchedulerData.CustomerMobile ? singleSchedulerData.CustomerMobile : undefined;      
        // Set Scheduler ActivityType
        this._cellDataSelection.ActivityType = singleSchedulerData.ActivityType;
        this._cellDataSelection.ActivityTypeID = singleSchedulerData.ActivityTypeID;
        this.openFormDialog();
    }

    
    editSchedulerActivity(singleSchedulerData, cellClickStartDate?) {

        this.hideAppointmentTooltip();

        /** Because recurrence Start Date is different, 
        * Now user Edit this only with selection of Date */
        //if (this.currentView !== this.schedulerStaticStrings.GetSchedulerStaticString.Month && this.currentView !== this.schedulerStaticStrings.GetSchedulerStaticString.Week)
        //this._cellDataSelection.startDate = new Date(singleSchedulerData.startDate);
        this._cellDataSelection.isRescheduleService = false;
        this._cellDataSelection.endDate = new Date(singleSchedulerData.endDate);
        this._cellDataSelection.allDay = singleSchedulerData.allDay == undefined ? false : singleSchedulerData.allDay;
        this._cellDataSelection.id = singleSchedulerData.id;
        this._cellDataSelection.StaffID = singleSchedulerData.StaffID;
        this._cellDataSelection.StaffFullName = singleSchedulerData.StaffFullName;
        this._cellDataSelection.CustomerTypeID = singleSchedulerData.CustomerTypeID ? singleSchedulerData.CustomerTypeID : undefined;
        this._cellDataSelection.CustomerID = singleSchedulerData.CustomerID ? singleSchedulerData.CustomerID : undefined;
        this._cellDataSelection.CustomerName = singleSchedulerData.CustomerName ? singleSchedulerData.CustomerName : undefined;
        this._cellDataSelection.CustomerEmail = singleSchedulerData.CustomerEmail ? singleSchedulerData.CustomerEmail : undefined;
        this._cellDataSelection.CustomerMobile = singleSchedulerData.CustomerMobile ? singleSchedulerData.CustomerMobile : undefined;
        //this._cellDataSelection.PersonTypeName = singleSchedulerData.PersonTypeName ? singleSchedulerData.PersonTypeName : undefined;
        // Set Scheduler ActivityType
        this._cellDataSelection.ActivityType = singleSchedulerData.ActivityType;
        this._cellDataSelection.ActivityTypeID = singleSchedulerData.ActivityTypeID;
        this.openSeriesConfirmDialog(singleSchedulerData, cellClickStartDate);
    }

    openSeriesConfirmDialog(singleSchedulerData, cellClickStartDate?) {

        if (singleSchedulerData.recurrenceRule) {
            let isShowAttendeeButton = false;
            if (singleSchedulerData.ActivityTypeID === enmSchedulerActvityType.class && singleSchedulerData.IsActive) isShowAttendeeButton = true;

            this.dialogRef = this._schedulerDialog.open(EditSeriesComponent, { disableClose: true, data: { showAttendeeButton: isShowAttendeeButton, heading: singleSchedulerData.ActivityTypeID === enmSchedulerActvityType.class ? 'Class' : 'Block Time' } });

            /** Confirm Recurrence Rule Subscription */
            this.dialogRef.componentInstance.confirmEditSeries.subscribe((isConfirmEditSeries: Number) => {
                setTimeout(() => {
                    this.closeTooltip();
                });
                if (isConfirmEditSeries === 1) {
                    this._cellDataSelection.startDate = new Date(singleSchedulerData.startDate);
                    this._cellDataSelection.isRecurrenceException = false;
                    this.openFormDialog();
                }
                else if (isConfirmEditSeries === 2) {
                    /** Edit This Only, add recurrenceException while saving */
                    this._cellDataSelection.isRecurrenceException = true;
                    /** this date is set from dblClick, and From edit button click from tooltip this date is set from onAppointmentClick */
                    if (cellClickStartDate) this._cellDataSelection.startDate = this.branchDate;

                    this.openFormDialog();
                }
            });

            /** Confirm Manage Attendee Subscription */
            this.dialogRef.componentInstance.confirmManageAttendeeClick.subscribe((manageAttendee: boolean) => {

                setTimeout(() => {
                    this.closeTooltip();
                });

                if (manageAttendee) {
                    if (singleSchedulerData && singleSchedulerData.id > 0 && singleSchedulerData.ActivityTypeID === enmSchedulerActvityType.class) {
                        if (singleSchedulerData.recurrenceRule){
                            singleSchedulerData.startDate = this._cellDataSelection.startDate;
                        }
                    }
                    this.openClassAttendeeForm(singleSchedulerData);
                }
            });

        } else {
            this._cellDataSelection.startDate = new Date(singleSchedulerData.startDate);
            this._cellDataSelection.isRecurrenceException = false;

            /** Check Edit Class or Manage Attendee with isActive class Popup */
            if (singleSchedulerData.id > 0 && singleSchedulerData.ActivityTypeID === enmSchedulerActvityType.class && singleSchedulerData.IsActive) {

                this.dialogRef = this._schedulerDialog.open(EditClassAttendeeComponent, { disableClose: true, data: { isActive: singleSchedulerData.IsActive } });
                this.dialogRef.componentInstance.confirmEditClass.subscribe((classManage: Number) => {
                    switch (classManage) {
                        case 1:
                            this.openFormDialog();
                            break;

                        case 2:
                            this.openClassAttendeeForm(singleSchedulerData);
                            break;
                    }
                })
            } else {
                /** any other Activity Type without class */
                this.openFormDialog();
            }
        }
    }
    
    //#region start scroll position

    setOffset(){
        this.schedulerScrollable = this.scheduler.instance._workSpace.getScrollable();
       this.schedulerScrollable.scrollTo(this.offset);
    }

    getOffset(){
       this.schedulerScrollable = this.scheduler.instance._workSpace.getScrollable();
       this.offset = this.schedulerScrollable.scrollOffset();
    }

    //#endregion end scroll position

    //#region CLASSES

    saveClass(saveData: ClassAppointmentDetail) {
        this._httpService.save(SchedulerApi.saveClass, saveData)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.donotScrollToTime = true;
                    this.closePopup();
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Class"));
                    //this.scheduler.instance.repaint();
                }
                else {
                    this.closePopup();
                    this._messageService.showErrorMessage(response.MessageText);
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                }
            },
                err => {
                    this.closePopup();
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Class"));
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);

                }
            );
    }

    updateClassForDragDrop(newUpdateClassData, oldData) {
        let udpateClassData: UpdateClass = new UpdateClass(), oldClassData = JSON.parse(JSON.stringify(oldData));
        udpateClassData.ClassID = newUpdateClassData.id;
        udpateClassData["id"] = newUpdateClassData.id;      // For Use Generic addRecurrenceExceptionToModel
        udpateClassData.AssignedToStaffID = newUpdateClassData.StaffID;
        
        udpateClassData.RecurrenceRule = newUpdateClassData.recurrenceRule;

        // /** Drag n Drop property change */
        // udpateClassData["StartDate"] = oldData.startDate;

        if(this.isUpdateSeries && oldData.recurrenceException){
            //udpateClassData.StartDate = oldData.startDate;
            udpateClassData.RecurrenceException = oldData.recurrenceException;
            udpateClassData = super.updateRecurrenceExceptionOnEditSeries(udpateClassData, this._dateTimeService.getTimeStringFromDate(new Date(newUpdateClassData.startDate)));
            udpateClassData.StartDate = this.dragStartDate ? newUpdateClassData.startDate : oldData.startDate;
        } else{
            udpateClassData.StartDate = newUpdateClassData.startDate; 
        }

        this.addRecurrenceExceptionToModel(udpateClassData, oldClassData);
        
        udpateClassData.StartTime = this.convertDateToTimeSpan(new Date(newUpdateClassData.startDate));
        udpateClassData.EndTime = this.convertDateToTimeSpan(new Date(newUpdateClassData.endDate));
        udpateClassData.ClassCode = newUpdateClassData.ClassCode;
        udpateClassData.IsDragAndDrop = true;

        this.isUpdateSeries = false;
        this._httpService.update(SchedulerApi.updateClass, udpateClassData)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.donotScrollToTime = true;
                    //this.refreshDataSourceAfterDragDrop(newUpdateClassData);
                    this.loadSearchFundamentals();
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Class"));
                }
                else {
                    this.loadSearchFundamentals();
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Class"));
                }
            );
    }

    deleteClassSeriesOrOnlyThis(classData) {

        /** Delete only this */
        if (!classData.recurrenceRule) {
            this.dialogRef = this._schedulerDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
            this.dialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
                if (isConfirmDelete) {
                    this.deleteClass(classData.id, '');
                }
            });
        }
        /** Delete Series */
        if (classData.recurrenceRule) {
            this.dialogRef = this._schedulerDialog.open(DeleteSeriesComponent, { disableClose: true, data: { heading: "Class"} });
            this.dialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: number) => {
                switch (isConfirmDelete) {
                    case 1:
                        this.deleteClass(classData.id, '');
                        break;
                    case 2:
                        let exceptDate = this.generateExceptionString(this._cellDataSelection.startDate);
                        this.deleteClass(classData.id, exceptDate);
                        break;
                }
            });
        }
    }

    deleteClass(classID, recurrenceException) {
        if (classID) {
            this._httpService.delete(SchedulerApi.deleteClass
                .replace("{classID}", classID)
                .replace("{recurrenceException}", recurrenceException))
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.donotScrollToTime = true;
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                        this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Class"));
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Class")); }
                );
        }
    }

    openClassAttendeeForm(classData) {
        //let sendClassData = JSON.parse(JSON.stringify(classData));
        let sendClassData = classData;
        let dialogRef = this._schedulerDialog.open(AttendeeComponent, {
            disableClose: true,
            data: {
                ClassID: sendClassData.id,
                ClassDate: new Date(classData.startDate)
            }
        })

        dialogRef.componentInstance.isAttendeeUpdated.subscribe((isUpdated: boolean) => {
            if (isUpdated) {
                this.loadSearchFundamentals();
            }
        });

        dialogRef.componentInstance.isAttendeePoupClosed.subscribe((isUpdated: boolean) => {
            if (isUpdated) {
                this.loadSearchFundamentals();
            }
        });
    }

    //#endregion

    //#region SERVICES

    saveSchedulerService(saveModel: SchedulerServiceModel) {
        this._httpService.save(SchedulerServicesApi.saveSchedulerService, saveModel)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.donotScrollToTime = true;
                        this.closePopup();
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Service"));
                    } else {
                        this._messageService.showErrorMessage(response.MessageText);
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Service"));
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                }
            );
    }

    updateSaleService(newUpdateServiceData) {

        let updateServiceBooking: UpdateServiceBooking = new UpdateServiceBooking();
        updateServiceBooking.ID = newUpdateServiceData.id;
        updateServiceBooking.SaleSourceTypeID = newUpdateServiceData.SaleSourceTypeID;
        updateServiceBooking.SaleStatusTypeID = newUpdateServiceData.SaleStatusTypeID;
        updateServiceBooking.AssignedToStaffID = newUpdateServiceData.StaffID;
        updateServiceBooking.IsSale = newUpdateServiceData.IsSale;

        updateServiceBooking.StartDate = newUpdateServiceData.startDate;
        updateServiceBooking.StartTime = this._dateTimeService.convertDateToTimeString(new Date(newUpdateServiceData.startDate));
        updateServiceBooking.CustomerName = newUpdateServiceData.CustomerName;
        updateServiceBooking.ServiceName = newUpdateServiceData.text;
        /** subtract cleanup time from endDate */
        let serviceEndTime = new Date(newUpdateServiceData.endDate);
        let subtractMinutes = serviceEndTime.setMinutes(serviceEndTime.getMinutes() - newUpdateServiceData.CleaningTimeInMinute);

        updateServiceBooking.EndTime = this._dateTimeService.convertDateToTimeString(new Date(subtractMinutes));

        this._httpService.update(SchedulerServicesApi.updateSchedulerService, updateServiceBooking)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.donotScrollToTime = true;
                    /** Change Staff Name on run time to display on Tooltip service */
                    this.updateDurationAndStaffNameAfterDragDrop(newUpdateServiceData);
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Service"));

                } else {
                    this._messageService.showErrorMessage(response.MessageText);
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Service"));
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                }
            );
    }

    deleteService(customerBookingId, customerId, staffID) {
        let url = SchedulerServicesApi.deleteBookedSaleService + customerBookingId + "/" + customerId + "/" + staffID;
        this._httpService.delete(url)
            .subscribe(
                (response: ApiResponse) => {
                    if (response.MessageCode > 0) {
                        this.donotScrollToTime = true;
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                        this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Service"));
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Service")); }
            );
    }

    //#endregion

    //#region BLOCK-TIME

    saveStaffBlockTime(saveModel: StaffBlockTimeModel) {
        this._httpService.save(SchedulerBlockTimeApi.saveStaffBlockTime, saveModel)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.donotScrollToTime = true;
                        this.closePopup();
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Block Time"));
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Block Time"));
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                }
            )
    }

    updateStaffBlockTimeForDragDrop(newUpdateBlockTimeData, oldBlockTimeData) {

        let staffBlockTimeUpdateModel: StaffBlockTimeUpdateModel = new StaffBlockTimeUpdateModel();
        //let copyBlockTimeUpdatedData = JSON.parse(JSON.stringify(newUpdateBlockTimeData));
        staffBlockTimeUpdateModel.StaffBlockTimeID = newUpdateBlockTimeData.id;
        staffBlockTimeUpdateModel["id"] = newUpdateBlockTimeData.id;    // For Use Generic addRecurrenceExceptionToModel
        staffBlockTimeUpdateModel.StaffID = newUpdateBlockTimeData.StaffID;
        staffBlockTimeUpdateModel.StartDate = newUpdateBlockTimeData.startDate;
        staffBlockTimeUpdateModel.EndDate = newUpdateBlockTimeData.endDate;
        staffBlockTimeUpdateModel.RecurrenceRule = newUpdateBlockTimeData.recurrenceRule;
        /** Drag n Drop property change */
        //oldBlockTimeData["StartDate"] = oldBlockTimeData.startDate;

        if(this.isUpdateSeries && oldBlockTimeData.recurrenceException){
            staffBlockTimeUpdateModel.RecurrenceException = oldBlockTimeData.recurrenceException;
            staffBlockTimeUpdateModel = super.updateRecurrenceExceptionOnEditSeries(staffBlockTimeUpdateModel, this._dateTimeService.getTimeStringFromDate(new Date(newUpdateBlockTimeData.startDate)));
            staffBlockTimeUpdateModel.StartDate = this.dragStartDate ? newUpdateBlockTimeData.startDate : oldBlockTimeData.startDate;
        }

        this.addRecurrenceExceptionToModel(staffBlockTimeUpdateModel, oldBlockTimeData);
        staffBlockTimeUpdateModel.StartTime = this._dateTimeService.convertDateToTimeString(new Date(newUpdateBlockTimeData.startDate));
        staffBlockTimeUpdateModel.EndTime = this._dateTimeService.convertDateToTimeString(new Date(newUpdateBlockTimeData.endDate));

        this.isUpdateSeries = false;
        this._httpService.update(SchedulerBlockTimeApi.updateStaffBlockTime, staffBlockTimeUpdateModel)
            .subscribe(response => {
                if (response && response.MessageCode > 0) {
                    setTimeout(() => {
                        this.donotScrollToTime = true;
                        //this.refreshDataSourceAfterDragDrop(newUpdateBlockTimeData);
                        this.loadSearchFundamentals();
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Block Time"));
                    }, 300);
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Block Time"));
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                }
            );
    }

    deleteBlockTimeSeriesOrOnlyThis(blockTimeData) { 
        
        /** Delete only this */
        if (!blockTimeData.recurrenceRule) {
            this.dialogRef = this._schedulerDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
            this.dialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
                if (isConfirmDelete) {
                    this.deleteBlockTime(blockTimeData.id, '');
                }
            });
        }
        /** Delete Series */
        if (blockTimeData.recurrenceRule) {
            this.dialogRef = this._schedulerDialog.open(DeleteSeriesComponent, { disableClose: true, data: { heading: "BlockTime"} });
            this.dialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: number) => {
                switch (isConfirmDelete) {
                    case 1:
                        this.deleteBlockTime(blockTimeData.id, '');
                        break;
                    case 2:
                        let exceptDate = this.generateExceptionString(this._cellDataSelection.startDate);
                        this.deleteBlockTime(blockTimeData.id, exceptDate);
                        break;
                }
            });
        }
    }

    deleteBlockTime(staffBlockTimeId, recurrenceException) {
        
        this._httpService.delete(SchedulerBlockTimeApi.deleteBlockTime
            .replace("{blockTimeID}", staffBlockTimeId)
          .replace("{recurrenceException}", recurrenceException))
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.donotScrollToTime = true;
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                        this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Block Time"));
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Block Time")); }
            );
    }

    //#endregion

    //#region CALL-ACTIVITY

    saveCallAppointmentForDragDrop(callActivityData, event) {

        /** update customer (Lead,Memeber,Client) for call/appointment drag n drop */
        this.updateCustomerLaterActivity(callActivityData, event, ClientActivityApi.updateCallAppointmentLater);
    }

    saveCall(viewmodel: ActivityViewModel) {

        let saveModel = this.mapActivityVMToSaveVM(viewmodel), apiUrl;

        switch (viewmodel.CustomerTypeID) {
            case CustomerType.Client:
                apiUrl = ClientActivityApi.saveCallLater;
                break;
            case CustomerType.Lead:
                apiUrl = LeadActivityApi.saveCallLater;
                break;
            case CustomerType.Member:
                apiUrl = MemberActivityApi.saveCallLater;
                break;
        }

        if (apiUrl) {
            this.saveCallActivity(saveModel, apiUrl);
        }
    }

    mapActivityVMToSaveVM(viewmodel: ActivityViewModel) {

        let clientActivityModel = new ActivityLaterViewModel();
        clientActivityModel.Title = viewmodel.Title;
        clientActivityModel.AssignedToStaffID = viewmodel.AssignedToStaffID;
        clientActivityModel.CustomerActivityID = viewmodel.CustomerActivityID;
        clientActivityModel.CustomerID = viewmodel.CustomerID;
        clientActivityModel.ContactReasonTypeID = viewmodel.ContactReasonTypeID;
        clientActivityModel.FollowupDate = viewmodel.FollowUpDate;
        clientActivityModel.FollowUpStartTime = viewmodel.FollowUpStartTime;
        clientActivityModel.FollowUpEndTime = viewmodel.FollowUpEndTime;
        clientActivityModel.Description = viewmodel.Description;
        return clientActivityModel;
    }

    saveCallActivity(activityLaterVM: ActivityLaterViewModel, apiUrl) {
        this._httpService.save(apiUrl, activityLaterVM)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.donotScrollToTime = true;
                        this.closePopup();
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Call"));
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Call"));
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                }
            );
    }

    updateCustomerLaterActivity(newActivityData, event, update_API_URL) {

        let updateLaterActivity: UpdateLaterActivity = new UpdateLaterActivity();
        updateLaterActivity.CustomerActivityID = newActivityData.id;
        updateLaterActivity.CustomerID = newActivityData.CustomerID;
        updateLaterActivity.ActivityTypeID = newActivityData.ActivityTypeID;
        updateLaterActivity.AssignedToStaffID = newActivityData.StaffID;
        updateLaterActivity.FollowupDate = newActivityData.startDate;
        updateLaterActivity.FollowUpStartTime = this._dateTimeService.convertDateToTimeString(new Date(newActivityData.startDate));
        updateLaterActivity.FollowUpEndTime = this._dateTimeService.convertDateToTimeString(new Date(newActivityData.endDate));

        this._httpService.update(update_API_URL, updateLaterActivity)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.donotScrollToTime = true;
                        this.refreshDataSourceAfterDragDrop(newActivityData);
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", newActivityData.ActivityType));
                    }
                    else if (response && response.MessageCode === -10) {
                        event.cancel = true;
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", newActivityData.ActivityType)); }
            );
    }

    deleteCallOrAppointmentActivity(activityData) {
        let deleteApiUrl;
        switch (activityData.CustomerTypeID) {
            case CustomerType.Client:
                deleteApiUrl = ClientActivityApi.delete.replace("{activityID}", activityData.id).replace("{clientID}", activityData.CustomerID).replace("{activityTypeID}", activityData.ActivityTypeID);
                break;
            case CustomerType.Lead:
                deleteApiUrl = LeadActivityApi.delete.replace("{customerActivityID}", activityData.id).replace("{customerID}", activityData.CustomerID).replace("{activityTypeID}", activityData.ActivityTypeID);
                break;
            case CustomerType.Member:
                deleteApiUrl = MemberActivityApi.delete.replace("{activityID}", activityData.id).replace("{memberID}", activityData.CustomerID).replace("{activityTypeID}", activityData.ActivityTypeID);
                break;
        }
        if (deleteApiUrl) {
            this.deleteCutomerActivity(deleteApiUrl, activityData.ActivityType);
        }
    }

    deleteCutomerActivity(apiUrl, activityTypeName) {
        this._httpService.delete(apiUrl)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.donotScrollToTime = true;
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                        this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", activityTypeName));
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", activityTypeName)); }
            );
    }

    //#endregion

    //#region APPOINTMENT-ACTIVITY

    saveAppointment(viewmodel: ActivityViewModel) {

        let saveModel = this.mapActivityVMToSaveVM(viewmodel), apiUrl;

        switch (viewmodel.CustomerTypeID) {
            case CustomerType.Client:
                apiUrl = ClientActivityApi.saveAppointmentLater;
                break;
            case CustomerType.Lead:
                apiUrl = LeadActivityApi.saveAppointmentLater;
                break;
            case CustomerType.Member:
                apiUrl = MemberActivityApi.saveAppointmentLater;
                break;
        }

        if (apiUrl)
            this.saveAppointmentActivity(saveModel, apiUrl);
    }

    saveAppointmentActivity(saveModel: ClientAppointmentLaterActivity, apiUrl) {
        this._httpService.save(apiUrl, saveModel)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.donotScrollToTime = true;
                    this.closePopup();
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Appointment"));
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Appointment"));
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                }
            );
    }

    //#endregion

    //#region TASK-ACTIVITY

    saveTask(saveModel: StaffTaskActivity) {
        this._httpService.save(StaffActivityApi.saveTask, saveModel)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.donotScrollToTime = true;
                        this.closePopup();
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Task"));
                    }
                    else {
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Task"));
                    this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                }
            );
    }

    updateTaskForDragDrop(newUpdateStaffTaskActivity) {

        let updateTaskActivity: StaffTaskActivity = new StaffTaskActivity();
        let copyUpdateStaffTaskActivity = JSON.parse(JSON.stringify(newUpdateStaffTaskActivity));
        updateTaskActivity.StaffActivityID = newUpdateStaffTaskActivity.id;
        updateTaskActivity.AssignedToStaffID = newUpdateStaffTaskActivity.StaffID;
        updateTaskActivity.FollowUpDate = newUpdateStaffTaskActivity.startDate;
        updateTaskActivity.FollowUpStartTime = this._dateTimeService.convertDateToTimeString(new Date(newUpdateStaffTaskActivity.startDate));
        updateTaskActivity.FollowUpEndTime = this._dateTimeService.convertDateToTimeString(new Date(newUpdateStaffTaskActivity.endDate));

        this._httpService.save(StaffActivityApi.updateTask, updateTaskActivity)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.donotScrollToTime = true;
                        this.refreshDataSourceAfterDragDrop(copyUpdateStaffTaskActivity);
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Task"));
                    }
                    else {
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Task")); }
            );
    }

    deleteTask(activityId, activityTypeId, staffId) {
        let url = StaffActivityApi.delete.replace("{staffActivityId}", activityId).replace("{activityTypeID}", activityTypeId).replace("{staffID}", staffId);
        this._httpService.delete(url)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.donotScrollToTime = true;
                        this.getAllSchedulerAfterSaveActivity(this.afterSaveStartDate, this.afterSaveEndDate);
                        this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Task"));
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Task")); }
            );
    }

    resizePermissionInMonthView() {
        /** donot allow resizing in Month View */
        if (this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.Month) {
            this.allowResizingOnScheduler = false;
        } else this.allowResizingOnScheduler = true;
    }

    setStartDateAsEndDateInDayView(endViewDate) {

        if (this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.Day) {
            this.startViewDate = endViewDate;
            this.afterSaveStartDate = endViewDate;
        }
    }

    getTimeDifferenceInMinutes(startTime, EndTime) {
        if (this._dateTimeService.getTimeDifferenceFromTimeString(startTime, EndTime) <= 15)
            return true;
        else
            return false;
    }

    //#endregion

    addRecurrenceExceptionToModel(activityModel: any, oldData: any) {

        if (this._cellDataSelection.isRecurrenceException) {
            let formatRecurrenceDate;
            //activityModel.RecurrenceException = this._dateTimeService.convertDateObjToString(new Date(activityModel.StartDate), Configurations.RecurrenceExceptionDateFormat)
            if(this.dragStartDate != undefined && this.dragStartDate != null){
                formatRecurrenceDate = this._dateTimeService.convertDateObjToString(new Date(this.dragStartDate), this.recurrenceExceptionDateFormat);
            } else{
                formatRecurrenceDate = this._dateTimeService.convertDateObjToString(new Date(activityModel.StartDate), this.recurrenceExceptionDateFormat);
            }

            //formatRecurrenceDate = this._dateTimeService.convertDateObjToString(new Date(this.dragStartDate), this.recurrenceExceptionDateFormat);
            let _gethours = new Date(oldData.StartDate ? oldData.StartDate : oldData.startDate).getHours().toString(), _getminutes = new Date(oldData.StartDate ? oldData.StartDate : oldData.startDate).getMinutes().toString();
            if (_gethours.length === 1) _gethours = "0" + _gethours;
            if (_getminutes.length === 1) _getminutes = "0" + _getminutes;

            activityModel.RecurrenceException = formatRecurrenceDate + "T" + _gethours + _getminutes + "00";
            activityModel.RecurrenceRule = "";  // recurrence rule is always empty/null if edit this only appointment is going to update in case of Drag n Drop.

            activityModel.IsUpdate = false;
            this.dragStartDate = null;
        }
        if (activityModel.id && activityModel.id > 0 && !this._cellDataSelection.isRecurrenceException) {
            activityModel.IsUpdate = true;
        }
    }

    refreshDataSourceAfterDragDrop(updatedData) {

        /** if drag n drop is using 'this only' then remove recurrence while repaint  */

        let filterActivityFromDS = this.schedulerDataSourceList.filter(x => x.id === updatedData.id && x.ActivityType === updatedData.ActivityType)[0];
        if (!this._cellDataSelection.isRecurrenceException) {
            if (filterActivityFromDS.recurrenceRule) {
                filterActivityFromDS.recurrenceRule = updatedData.recurrenceRule;
            }
        } else {
            filterActivityFromDS.recurrenceRule = null;
        }

        if (filterActivityFromDS.recurrenceException) {
            filterActivityFromDS.recurrenceException = updatedData.recurrenceException;
        }

        filterActivityFromDS.startDate = updatedData.startDate;
        filterActivityFromDS.endDate = updatedData.endDate;
        filterActivityFromDS.StaffID = updatedData.StaffID;

        let staffName = this.resourcesStaffList.filter(x => x.id === updatedData.StaffID)[0].text;
        filterActivityFromDS.StaffFullName = staffName;

        /** Duration only for Class & Service (Service duration is set after drag n drop on : updateDurationAndStaffNameAfterDragDrop ) */
        if (updatedData.ActivityTypeID === enmSchedulerActvityType.class) {
            let timeDuration = this._dateTimeService.getTimeDifferenceFromTimeString(updatedData.startDate.split('T')[1], updatedData.endDate.split('T')[1]);
            filterActivityFromDS.Duration = timeDuration > 60 ? this._dateTimeService.convertNumberToHoursMinutes(timeDuration) : timeDuration + " min(s)";
        }

        this.schedulerDataSourceList.filter(x => x.id === updatedData.id && x.ActivityType === updatedData.ActivityType)[0] = filterActivityFromDS;

        this.scheduler.instance.getDataSource().reload();
    }

    updateDurationAndStaffNameAfterDragDrop(newUpdatedData) {
        /** This function is used only for Class and Services, because duration is displayed on tooltip on Class/Service */
        let filterDS = this.schedulerDataSourceList.find(x => x.id === newUpdatedData.id && x.ActivityType === newUpdatedData.ActivityType);
        let staffName = this.resourcesStaffList.filter(x => x.id === newUpdatedData.StaffID)[0].text;
        filterDS.StaffFullName = staffName;

        let timeDuration = this._dateTimeService.getTimeDifferenceFromTimeString(newUpdatedData.startDate.split('T')[1], newUpdatedData.endDate.split('T')[1]);
        filterDS.Duration = timeDuration > 60 ? this._dateTimeService.convertNumberToHoursMinutes(timeDuration) : timeDuration + " min(s)";

        this.schedulerDataSourceList.filter(x => x.id === newUpdatedData.id && x.ActivityType === newUpdatedData.ActivityType)[0] = filterDS;

        this.scheduler.instance.getDataSource().reload();
    }

    //#region Permissions

    hasSaveAppointmentPermission(activityType: number) {
        let hasPermission = false;
        switch (activityType) {
            case enmSchedulerActvityType.class:
                hasPermission = this.isSaveClassAllowed;
                break;
            case enmSchedulerActvityType.service:
                hasPermission = this.isSaveServiceAllowed;
                break;
            case enmSchedulerActvityType.blockTime:
                hasPermission = this.isSaveBlockTimeAllowed;
                break;
            case enmSchedulerActvityType.call:
                hasPermission = this.isSaveCallAllowed;
                break;
            case enmSchedulerActvityType.appointment:
                hasPermission = this.isSaveAppointmentAllowed;
                break;
            case enmSchedulerActvityType.task:
                hasPermission = this.isSaveTaskAllowed;
                break;
        }
        return hasPermission;
    }

    hasAppointmentInPackage(activityType: number) {
        let hasInPackage = false;
        switch (activityType) {
            case enmSchedulerActvityType.class:
                hasInPackage = this.isClassInPackage;
                break;
            case enmSchedulerActvityType.service:
                hasInPackage = this.isServiceInPackage;
                break;
            case enmSchedulerActvityType.blockTime:
                hasInPackage = this.isBlockTimeInPackage;
                break;
            case enmSchedulerActvityType.call:
                hasInPackage = this.isCallInPackage;
                break;
            case enmSchedulerActvityType.appointment:
                hasInPackage = this.isAppointmentInPackage;
                break;
            case enmSchedulerActvityType.task:
                hasInPackage = this.isTaskInPackage;
                break;
        }
        return hasInPackage;
    }

    //#endregion

    scrollToTimeAccordingView(event) {
        /** Scroll to current time */
        if (this.currentBranchTime) {
            /** day-view check */
            if (this.scheduler && this.scheduler.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.Day &&
                this.scheduler.instance.getStartViewDate().getDate() === this.currentBranchTime.getDate() &&
                this.scheduler.instance.getStartViewDate().getMonth() === this.currentBranchTime.getMonth() &&
                this.scheduler.instance.getStartViewDate().getFullYear() === this.currentBranchTime.getFullYear()
            ) {
                this.isScrollToTimeCalled = true;
                event.component.scrollToTime(this.currentBranchTime.getHours(), this.currentBranchTime.getMinutes(), this.currentBranchTime);
                // donot call scrollPositionOffset when this function is called.
            }
            /** week-view check */
            else if (this.scheduler && this.scheduler.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.Week &&
                Date.parse(this._dateTimeService.convertTimeStringToDateTime("00:00:00", this.currentBranchTime).toString()) >= Date.parse(this._dateTimeService.convertTimeStringToDateTime("00:00:00", this.scheduler.instance.getStartViewDate()).toString()) &&
                Date.parse(this._dateTimeService.convertTimeStringToDateTime("00:00:00", this.currentBranchTime).toString()) <= Date.parse(this._dateTimeService.convertTimeStringToDateTime("00:00:00", this.scheduler.instance.getEndViewDate()).toString())) {
                this.isScrollToTimeCalled = true;
                event.component.scrollToTime(this.currentBranchTime.getHours(), this.currentBranchTime.getMinutes(), this.currentBranchTime);
                // donot call scrollPositionOffset when this function is called.
            }
            else {
                this.isScrollToTimeCalled = false;
            }
        }
    }

    generateExceptionString(dateObj) {
        let formatRecurrenceDate = this._dateTimeService.convertDateObjToString(dateObj, this.recurrenceExceptionDateFormat);
        let _gethours = new Date(dateObj).getHours().toString(), _getminutes = new Date(dateObj).getMinutes().toString();
        if (_gethours.length === 1) _gethours = "0" + _gethours;
        if (_getminutes.length === 1) _getminutes = "0" + _getminutes;
        return formatRecurrenceDate + "T" + _gethours + _getminutes + "00";
    }

    setSchedulerCurrentTimeIndicator() {
        /** Set Scheduler currentTimeIndicator with branch time */
        if (this.currentBranchTime) {
            this.currentDate = this.currentBranchTime;
            if (this.scheduler) {
                this.scheduler._setOption("indicatorTime", this.currentBranchTime);
            }
        }
    }

    emptyDataSource() {
        this.schedulerDataSourceList = [];
    }

    closePopup() {
        this.dialogRef.close();
    }

    closeActivity() {
        setTimeout(() => {
            if (this.isPopoverOpen) {
                //$(".dx-overlay-content.dx-popup-normal.dx-resizable").hide();
            }
            else {
                this.closeTooltip();
            }
        }, 100);
    }

    closeTooltip() {
        this.scheduler.instance.hideAppointmentTooltip();
    }

///*For favourite view*/

    getSchedulerFavouriteViewsList() {
        this._httpService.get(SchedulerApi.getFavouriteViewsList)
            .toPromise().then((data) => {
                if (data.MessageCode > 0 && data.Result.length > 0) {
                    this.SchedulerFavouriteViewList = [];
                    this.SchedulerFavouriteViewList = data.Result;
                }
            }).catch((error) => {
                this._messageService.showErrorMessage(JSON.stringify(error));
            });
    }
 
addFavouriteView() {
    if(this.SchedulerFavouriteViewList.length >= 6) {
       this._messageService.showErrorMessage(this.messages.Error.Maximum_Allowed_FavouriteViews_Error);
       return;
    } else if (this.schedulerSearchParam.AllStaff && this.schedulerSearchParam.AllStaffPosition && this.schedulerSearchParam.AllSchedulerActivityType && this.schedulerSearchParam.AllFacility && this.isGroupByStaff) {
        this._messageService.showWarningMessage(this.messages.Validation.Already_DefaultView);        
        return;
    } 

    if (this.validateSearchFilterPosition() && this.validateSearchFilterStaff(false) && this.validateSearchFilterActivities() && this.validateSearchFilterFacility(false)) {

        const dialogRef11 = this._dialog.open(FavouriteViewComponent, {
            disableClose: true,
            data: this.mapFavouriteViewDataForSave()
        });

        dialogRef11.componentInstance.onSave.subscribe((isFavouriteViewSaved: boolean) => {
            if(isFavouriteViewSaved == true) {               
               this.getSchedulerFavouriteViewsList();
            }
        })
    }

}

mapFavouriteViewDataForSave() {
    let resultData = null; 
    let groupBy = [{id: this.isGroupByStaff == true ? 1 : 0}];
    let grouping = this.createObjectsFromArray(groupBy, EnumSchedulerFavouriteViewTypeID.Grouping);
    if(this.ShowMyOwnScheduler) {
        if(this.staffExists) { /*///if staff have scheduler permission*/
            let loggedInStaff = this.filteredStaffListDataSource.filter(i => i.id == this.loggedInStaffID);
            var  selectedStaffList = this.createObjectsFromArray(loggedInStaff, EnumSchedulerFavouriteViewTypeID.Staff);
            var selectedStaffPositionList = this.createObjectsFromArray(this.staffPositionListDataSource.filter(i => i.id == loggedInStaff[0].staffPositionID), EnumSchedulerFavouriteViewTypeID.Position);
        } else {
            let loggedInStaff =  [{id: this.loggedInStaffID}];
            var  selectedStaffList = this.createObjectsFromArray(loggedInStaff, EnumSchedulerFavouriteViewTypeID.Staff);
            var selectedStaffPositionList = this.createObjectsFromArray(this.staffPositionListDataSource, EnumSchedulerFavouriteViewTypeID.Position);
        }   
       
    } else {
        var selectedStaffPositionList = this.createObjectsFromArray(this.staffPositionListDataSource.filter(i => i.selected == true), EnumSchedulerFavouriteViewTypeID.Position);
        var selectedStaffList = this.createObjectsFromArray(this.filteredStaffListDataSource.filter(i => i.selected == true), EnumSchedulerFavouriteViewTypeID.Staff);
    }

    let activities = this.createObjectsFromArray(this.CalendarActivitiesListDataSource.filter(i => i.selected == true), EnumSchedulerFavouriteViewTypeID.Activity);
    let facilities = this.createObjectsFromArray(this.facilityList.filter(i => i.selected == true), EnumSchedulerFavouriteViewTypeID.Facility);

    resultData = grouping.concat(selectedStaffPositionList, selectedStaffList, activities, facilities);    
    return resultData;   
}

createObjectsFromArray(arrayData:any[], FavouriteViewTypeID: number) {
    var objectData = [];  
    for (let data of arrayData) {
        let obj = new FavouriteViewDetail();
        obj.schedulerFavouriteViewTypeID = FavouriteViewTypeID;
        obj.viewItemID = data.id;
        objectData.push(obj);
    } 

    return objectData;
}

deleteFavouriteView(event: any, viewId: number) {    
    event.preventDefault(); //<--prevent default
    event.stopPropagation(); //stop propagation
    this.mySelect.close(); // close fav view dropdown
    let dialogRef = this._dialog.open(AlertConfirmationComponent, { disableClose: true });
    dialogRef.componentInstance.Title = this.messages.Dialog_Title.Delete_View
    dialogRef.componentInstance.Message = this.messages.Confirmation.Delete_View_Message;
    dialogRef.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
        if (isConfirm) {
            let apiUrl = SchedulerApi.deleteSchedulerFavouriteView + viewId;
            this._httpService.delete(apiUrl)
                .subscribe(
                    (response: ApiResponse) => {
                        if (response && response.MessageCode > 0) {
                            if (viewId == this.defaultFavouriteViewValue) {
                                this.getSchedulerFavouriteViewsList();
                                this.isGroupByStaff = true;
                                setTimeout(() => {
                                    this.defaultFavouriteViewValue = 0;
                                    this.getAllSchedulerDataSource();
                                }, 100)
                            } else {
                                this.SchedulerFavouriteViewList = this.SchedulerFavouriteViewList.filter(fv => fv.SchedulerFavouriteViewID != viewId);
                            }
                            this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", 'Favourite view'));
                        }
                        else {
                            this._messageService.showErrorMessage(response.MessageText);
                        }
                    },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", 'Favourite view')); }
                );  
        }
    });
        
}

onFavouriteViewChange(selectedViewId: number) {
    let selectedView = null;    
    let data = null;
     /**Reset search filters */
     this.searchStaffPositions = [];
     this.searchStaff = [];
     this.searchFacilityList = [];
     this.searchActivity = [];
    if (selectedViewId == 0) { 
        /*///this is default view*/ 
        this.isGroupByStaff = true; 
        this.getAllSchedulerDataSource();
        
    } else {
        selectedView = this.SchedulerFavouriteViewList.filter(fv => fv.SchedulerFavouriteViewID === selectedViewId);
        this.prepareFavouriteViewData(selectedView[0].SchedulerFavouriteViewDetail);
        /**finally load selected favourite view data on the basis of selected and unselected filters properties*/
        this.loadSearchFundamentals(false);
    }
   
}


prepareFavouriteViewData(resultData) { 

        resultData.forEach(fl => {
            /**Set/check) scheduler left side filter properties as (selected/true) */            
            this.setSchedulerFilters(fl.SchedulerFavouriteViewTypeID, fl.ViewItemID);         
        }); 
       /**UnCheck/Unset filters properties that are not included in search filters (positions, staff, activities, facilities) */
        this.staffPositionListDataSource.forEach(element => {
            let existInStaffPositions = this.searchStaffPositions.includes(element.id);
            if (existInStaffPositions === false) {
                let itemIndex = this.staffPositionListDataSource.findIndex(item => item.id == element.id);
                (itemIndex != -1) ? this.staffPositionListDataSource[itemIndex].selected = false : '';
            }
        });
        if (this.staffExists) {
            this.filteredStaffListDataSource.forEach(element => {
                let existInStaffSearch = this.searchStaff.includes(element.id);
                if (existInStaffSearch === false) {
                    let itemIndex = this.filteredStaffListDataSource.findIndex(item => item.id == element.id);
                    (itemIndex != -1) ? this.filteredStaffListDataSource[itemIndex].selected = false : '';
                }
            });
        }
        this.CalendarActivitiesListDataSource.forEach(element => {
            let existInActivityList = this.searchActivity.includes(element.id);
            if (existInActivityList === false) {
                let itemIndex = this.CalendarActivitiesListDataSource.findIndex(item => item.id == element.id);
                (itemIndex != -1) ? this.CalendarActivitiesListDataSource[itemIndex].selected = false : '';
            }
        });
        this.facilityList.forEach(element => {
            let existInFacilityList = this.searchFacilityList.includes(element.id);
            if (existInFacilityList === false) {
                let itemIndex = this.facilityList.findIndex(item => item.id == element.id);
                (itemIndex != -1) ? this.facilityList[itemIndex].selected = false : '';
            }
        });
        ///**Check For "All" option */
        this.schedulerSearchParam.AllStaffPosition = this.staffPositionListDataSource.every(p => p.selected === true);
        this.schedulerSearchParam.AllStaff = this.filteredStaffListDataSource.every((item: any) => item.selected == true);
        this.schedulerSearchParam.AllSchedulerActivityType = this.CalendarActivitiesListDataSource.every(function (item: any) { return item.selected == true; });
        this.schedulerSearchParam.AllFacility = this.facilityList.every(function (item: any) { return item.selected == true; });        
        (this.isGroupByStaff == true) ? this.isShowFacilityIcon = false : this.isShowFacilityIcon = true;
        //** If Activity list has class/service is selected */
        this.disableFacilityList = false;
        this.CalendarActivitiesListDataSource.forEach(activity => {
            if ((activity.id === ENU_SchedulerActivityType.Class && activity.selected === false) && (activity.id === ENU_SchedulerActivityType.Service && activity.selected === false)) {
                this.disableFacilityList = true;
            }
        });
}

setSchedulerFilters(filterType: number, itemId:number) {
   
    switch (filterType) {
        case EnumSchedulerFavouriteViewTypeID.Grouping: 
            if(itemId === 0 && this.hasFacilityInPackage && this.isShowTaskInRole) {
                this.isGroupByStaff = false;
             } else {
                this.isGroupByStaff = true;
             }
            break;
        case EnumSchedulerFavouriteViewTypeID.Position:
            let itemIndexPosition = this.staffPositionListDataSource.findIndex( i => i.id == itemId);
            if (itemIndexPosition != -1) {
            this.staffPositionListDataSource[itemIndexPosition].selected = true;
            this.searchStaffPositions.push(itemId);
            }
            break;
        case EnumSchedulerFavouriteViewTypeID.Staff:
            if (this.ShowMyOwnScheduler) {
                this.searchStaff = [];
                this.loggedInStaffID ? this.searchStaff.push(this.loggedInStaffID) : '';
            } else {
                let itemIndexStaff = this.filteredStaffListDataSource.findIndex(i => i.id == itemId);
                if (itemIndexStaff != -1) {
                this.filteredStaffListDataSource[itemIndexStaff].selected = true;
                this.searchStaff.push(itemId);
                }
            }
            break;
        case EnumSchedulerFavouriteViewTypeID.Activity:
            let itemIndexActivity = this.CalendarActivitiesListDataSource.findIndex( i => i.id == itemId);
            if (itemIndexActivity != -1) {
            this.CalendarActivitiesListDataSource[itemIndexActivity].selected = true;
            this.searchActivity.push(itemId);
            }
            break;
        case EnumSchedulerFavouriteViewTypeID.Facility:
            let itemIndexFacility = this.facilityList.findIndex( i => i.id == itemId);
            if (itemIndexFacility != -1) {
                this.facilityList[itemIndexFacility].selected = true;
                this.searchFacilityList.push(itemId);
            }
            break;
    }
  
}






}