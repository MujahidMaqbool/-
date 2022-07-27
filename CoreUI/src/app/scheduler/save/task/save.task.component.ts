/**Angular Modules */
import { Component, Inject, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SubscriptionLike as ISubscription } from 'rxjs';

/** Models*/
import { PriorityType } from 'src/app/models/activity.model';
import { StaffTaskActivity, CellSelectedData } from 'src/app/scheduler/models/scheduler.model';

/** Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { MessageService } from 'src/app/services/app.message.service';

/** Configurations */
import { Configurations } from 'src/app/helper/config/app.config';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { Messages } from 'src/app/helper/config/app.messages';
import { SchedulerApi, StaffActivityApi } from 'src/app/helper/config/app.webapi';
import { DatePipe } from '@angular/common';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { OneDaySchedulerComponent } from 'src/app/shared/components/scheduler/one.day.scheduler.component';



@Component({
    selector: 'save-scheduler-task',
    templateUrl: './save.task.component.html'
})

export class SaveSchedulerTaskComponent extends AbstractGenericComponent implements OnChanges {

    // #region Local Members
    dayViewFormat: string = "";
    isShowScheduler: boolean = false;

    @ViewChild('schedulerTaskFormData') schedulerTaskFormData: NgForm;
    @ViewChild('onedaySchedulerComp') onedaySchedulerComp: OneDaySchedulerComponent;
    @Output() onUpdateSchedulerTaskActivity = new EventEmitter<StaffTaskActivity>();
    @Input() taskActivityComponentCalled: boolean = false;
    @Output() onCancel = new EventEmitter<boolean>();
    @Input() _cellDataSelection: CellSelectedData;

    /**Scope Variables */
    currentDate: Date;
    selectedStaffID: number = 0;
    isInvalidFollowupDate: boolean = false;
    isChangeStartDateEvent: boolean = true;

    /** Models  */
    taskActivity: StaffTaskActivity = new StaffTaskActivity();
    copyTaskActivityModel: StaffTaskActivity = new StaffTaskActivity();

    /** Lists */
    staffList: any[] = [];
    priorityTypeList: PriorityType[] = [];

    /** Configurations , Messages & Constants */
    messages = Messages;
    dateFormat = Configurations.DateFormat;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    dateTimeCompareError = Messages.Validation.Endtime_Should_Greater_Than_Start_Time;
    isShowError: boolean = false;

    /** Angular library */
    staffDetailSubscription: ISubscription;
    isSaveButtonDisabled: boolean = false;
    // #endregion

    /** Constructor */
    constructor(
        private _dateFilter: DatePipe,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService
    ) {
        super();    //implicit call for constructor
        this.isSaveButtonDisabled = false;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.currentDate = new Date(this._cellDataSelection.startDate);
        if (changes.taskActivityComponentCalled && changes.taskActivityComponentCalled.currentValue) {
            this.getBranchDatePattern();
            this.getFundamentals();
        }
    }

    // #region Events
    onCloseSchedulerTaskPopup() {
        this.onCancel.emit(true);
    }

    onSelectDate_valueChanged(startDate: Date) {

        startDate = new Date(startDate);

        this.currentDate = startDate;

        let today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            this.isInvalidFollowupDate = true;
        }
        else {
            this.isInvalidFollowupDate = false;
        }

        let followupStartDateTime = new Date(this.taskActivity.FollowUpStartTime),
            followupEndDateTime = new Date(this.taskActivity.FollowUpEndTime);

        this.taskActivity.FollowUpDate = startDate;
        
        //set hours, time and second 0,0,0
        var _selectedDate = startDate;
        _selectedDate = new Date(_selectedDate.setHours(0,0,0));

        this.taskActivity.FollowUpStartTime = new Date(_selectedDate.setHours(followupStartDateTime.getHours(), followupStartDateTime.getMinutes()));
        this.taskActivity.FollowUpEndTime = new Date(_selectedDate.setHours(followupEndDateTime.getHours(), followupEndDateTime.getMinutes()));
    }

    //for staff data chnage on one day scheduler
    onStaffChange(staffID){
        if(this.onedaySchedulerComp){
            this.onedaySchedulerComp.getSchedulerByStaff(staffID);
        }
    }

    startDateChangeEvent(event) {
        this.isShowError = false;
        if (!event.value) {
            this.dateTimeCompareError = Messages.Validation.StartTime_Required;
            this.isShowError = true;
        }
        if (event.value || this.isChangeStartDateEvent) {
            if (event.previousValue) {
                let getTimeDifference = this._dateTimeService.getTimeDifferenceFromTimeString(this.getTimeFromDate(event.previousValue), this.getTimeFromDate(new Date(this.taskActivity.FollowUpEndTime)));
                /** if user clear date box then, get date from user selection Date. */
                if (event.value) {
                    this.taskActivity.FollowUpEndTime = this._dateTimeService.setTimeInterval(new Date(event.value), getTimeDifference).toISOString();
                }
            }
            if (this.taskActivity.FollowUpStartTime) {
                new Date(new Date(this.taskActivity.FollowUpStartTime).setDate(new Date(this.taskActivity.FollowUpDate).getDate()));
                new Date(new Date(this.taskActivity.FollowUpStartTime).setMonth(new Date(this.taskActivity.FollowUpDate).getMonth()));
                new Date(new Date(this.taskActivity.FollowUpStartTime).setFullYear(new Date(this.taskActivity.FollowUpDate).getFullYear()));
            }
        }
    }

    endDateChangeEvent(event) {
        this.isShowError = false;
        if (!event.value) {
            this.dateTimeCompareError = Messages.Validation.EndTime_Required;
            this.isShowError = true;
        }
        else {
            new Date(new Date(this.taskActivity.FollowUpEndTime).setDate(new Date(this.taskActivity.FollowUpDate).getDate()));
            new Date(new Date(this.taskActivity.FollowUpEndTime).setMonth(new Date(this.taskActivity.FollowUpDate).getMonth()));
            new Date(new Date(this.taskActivity.FollowUpEndTime).setFullYear(new Date(this.taskActivity.FollowUpDate).getFullYear()));
        }
    }

    // #endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.isShowScheduler = true;
    }

    getFundamentals() {
        this._httpService.get(SchedulerApi.getTaskFundamental)
            .subscribe(
                data => {
                    if (data && data.Result) {
                        if (data.Result.PriorityTypeList) {
                            this.priorityTypeList = data.Result.PriorityTypeList;
                            this.staffList = data.Result.StaffList;
                            this.selectedStaffID = this.staffList ? this.staffList[0].StaffID : 0;
                            this.getDateOnPageLoad();
                        }
                    }else{
                        this._messageService.showErrorMessage(data.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
            )
    }

    getDateOnPageLoad() {

        if (this._cellDataSelection.id > 0) {
            this.isChangeStartDateEvent = false;
            this.getTaskByID(this._cellDataSelection.id, this._cellDataSelection.StaffID);
        } else {
            this.isChangeStartDateEvent = true;
            this.setDefaultValuesToModel();
            // this.onedaySchedulerComp.staffID = this.taskActivity.AssignedToStaffID;
            // this.onedaySchedulerComp.getCustomSchedulerData();
        }
    }

    getTaskByID(customerActivityID: number, staffID: number) {
        let url = StaffActivityApi.getTaskById.replace("{staffActivityId}", customerActivityID.toString()).replace("{staffID}", staffID.toString());
        this._httpService.get(url)
            .subscribe(data => {
                if (data && data.Result) {

                    this.taskActivity = data.Result;

                    // this.taskActivity.FollowUpDate = new Date(this.taskActivity.FollowUpDate);
                    // var _ollowUpDate = this.taskActivity.FollowUpDate.setTime(this.taskActivity.FollowUpDate.getTime() + this.taskActivity.FollowUpDate.getTimezoneOffset()*60*1000 );
                    // this.taskActivity.FollowUpDate = new Date(_ollowUpDate);

                    //for multi time zone issue using this method
                    this.taskActivity.FollowUpDate = this._dateTimeService.convertStringIntoDateForScheduler(this.taskActivity.FollowUpDate.toString());

                    let startDateTime = this._dateTimeService.convertTimeStringToDateTime(data.Result.FollowUpStartTime, new Date(this.taskActivity.FollowUpDate)),
                        endDateTime = this._dateTimeService.convertTimeStringToDateTime(data.Result.FollowUpEndTime, new Date(this.taskActivity.FollowUpDate));

                    this.taskActivity.FollowUpStartTime = startDateTime.toISOString();
                    this.taskActivity.FollowUpEndTime = endDateTime.toISOString();
                }else{
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Task")); }
            );
    }

    setDefaultValuesToModel() {
        this.taskActivity.PriorityTypeID = this.priorityTypeList[0].PriorityTypeID;
        this.taskActivity.AssignedToStaffID = this._cellDataSelection.StaffID == 0 ? this.staffList[0].StaffID : this._cellDataSelection.StaffID;
        this.taskActivity.FollowUpDate = this._cellDataSelection.startDate;
        this.taskActivity.FollowUpStartTime = this._cellDataSelection.startDate;//this._cellDataSelection.startDate.toISOString();
        this.taskActivity.FollowUpEndTime = this._cellDataSelection.endDate;//this._cellDataSelection.endDate.toISOString();
    }

    saveSchedulerTask(valid: boolean) {
        this.isShowError = false;
        this.isSaveButtonDisabled = true;
        if (valid) {
            if (this.validateFollowUpDate()) {
                let copyTaskActivityModel = JSON.parse(JSON.stringify(this.taskActivity));
                copyTaskActivityModel.FollowUpDate = this._dateTimeService.convertDateObjToString(copyTaskActivityModel.FollowUpStartTime, this.dateFormat);
                copyTaskActivityModel.FollowUpStartTime = this._dateTimeService.convertDateToTimeString(new Date(copyTaskActivityModel.FollowUpStartTime));
                copyTaskActivityModel.FollowUpEndTime = this._dateTimeService.convertDateToTimeString(new Date(copyTaskActivityModel.FollowUpEndTime));
                copyTaskActivityModel.StaffActivityID = this._cellDataSelection.id;   // get for add/update
                this.onUpdateSchedulerTaskActivity.emit(copyTaskActivityModel);
            } else{
                this.isSaveButtonDisabled = false;
            }
        } else{
            this.isSaveButtonDisabled = false;
        }
    }

    validateFollowUpDate() {
        let startTime = this.getTimeStringFromDate(this.taskActivity.FollowUpStartTime, Configurations.SchedulerTimeFormat);
        let EndTime = this.getTimeStringFromDate(this.taskActivity.FollowUpEndTime, Configurations.SchedulerTimeFormat);
        let isValid = true;
        /** validate startTime & endTime */
        if (this.taskActivity.FollowUpStartTime && this.taskActivity.FollowUpEndTime) {

            if (startTime < EndTime) {
                this.isShowError = false;
            }
            else {
                this.dateTimeCompareError = Messages.Validation.Endtime_Should_Greater_Than_Start_Time;
                this.isShowError = true;
                isValid = false;
            }
        } else {
            this.dateTimeCompareError = Messages.Validation.Info_Required;
            isValid = false;
            this.isShowError = true;
        }

        return isValid;
    }
    getTimeStringFromDate(dateValue: Date, timeFormat: string) {
        return this._dateFilter.transform(dateValue, timeFormat);
    }

    smallCalendarDateChange(startDate: Date) {
        // let today = new Date();
        // today.setHours(0, 0, 0, 0);

        // if (startDate < today) {
        //     this.isInvalidFollowupDate = true;
        // }
        // else {
        //     this.isInvalidFollowupDate = false;
        // }

        // let followupStartDateTime = new Date(this.taskActivity.FollowUpStartTime),
        //     followupEndDateTime = new Date(this.taskActivity.FollowUpEndTime);

        // this.taskActivity.FollowUpDate = startDate;
        // this.taskActivity.FollowUpStartTime = new Date(startDate.setHours(followupStartDateTime.getHours(), followupStartDateTime.getMinutes()));
        // this.taskActivity.FollowUpEndTime = new Date(startDate.setHours(followupEndDateTime.getHours(), followupEndDateTime.getMinutes()));
    }

    setFormAsDirty() {
        super.markFormAsDirty(this.schedulerTaskFormData);
    }

    getTimeFromDate(date: Date) {
        return this._dateTimeService.getTimeStringFromDate(date);
    }

}