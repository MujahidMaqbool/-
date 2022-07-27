// #region Imports

/**Angular Modules */
import { Component, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SubscriptionLike as ISubscription } from 'rxjs';

/** Serivces*/
import { HttpService } from "src/app/services/app.http.service";
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
/** Models */
import { StaffBlockTimeModel } from 'src/app/scheduler/models/service.model';
import { CellSelectedData, RRuleData } from 'src/app/scheduler/models/scheduler.model';

/** App Messages & Constants */
import { Configurations } from 'src/app/helper/config/app.config';
import { DxSwitchComponent, DxFormComponent } from 'devextreme-angular';
import { Messages } from 'src/app/helper/config/app.messages';
import { SchedulerBlockTimeApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse } from 'src/app/models/common.model';
import { DatePipe } from '@angular/common';
import { ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { OneDaySchedulerComponent } from 'src/app/shared/components/scheduler/one.day.scheduler.component';



// #endregion

@Component({
    selector: 'save-scheduler-blocktime',
    templateUrl: './save.block.time.component.html'
})

export class SaveSchedulerBlockTimeComponent extends AbstractGenericComponent implements OnChanges {

    // #region Local Members
    isShowScheduler: boolean = false;

    @ViewChild('onedaySchedulerComp') onedaySchedulerComp: OneDaySchedulerComponent;

    @ViewChild(DxSwitchComponent) devexpSwitch: DxSwitchComponent;
    @ViewChild(DxFormComponent) devexpForm: DxFormComponent;
    @ViewChild('blockTimeFormData') blockTimeFormData: NgForm;
    @Output() onUpdateSchedulerBlockTime = new EventEmitter<StaffBlockTimeModel>();
    @Input() blockTimeComponentCalled: boolean = false;
    @Output() onCancel = new EventEmitter<boolean>();
    @Input() _cellDataSelection: CellSelectedData;

    /** Model & Lists */
    staffBlockModel: StaffBlockTimeModel = new StaffBlockTimeModel();
    copyStaffBlockModel: StaffBlockTimeModel = new StaffBlockTimeModel();
    staffDetailSubscription: ISubscription
    staffList: any[] = [];
    recurrenceRuleFormData: RRuleData = new RRuleData();
    recurrenceExceptionList: any[] = [];

    /** Local Variables */
    currentDate: Date;
    branchCurrentDate: Date = new Date();
    selectedStaffID: number = 0;
    dateTimeType: string = "time";
    isHideStartDate: boolean;
    isHideEndDate: boolean;
    showRepeatControl: boolean = false;
    isChangeStartDateEvent: boolean = true;

    /** Constants & Messages */
    messages = Messages;
    dateFormat: string = "";//Configurations.DateFormat;
    exceptionDateFormate: string = "";//Configurations.ExceptionDateFormat;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    schedulerRRuleUntilDateFormat: string = "";//Configurations.SchedulerRRuleUntilDateFormat;
    recurrenceExceptionDateFormat: string = "";//Configurations.RecurrenceExceptionDateFormat;
    dayViewFormat: string = "";
    dateTimeCompareError = Messages.Validation.Endtime_Should_Greater_Than_Start_Time;
    isShowError: boolean = false;
    isSaveButtonDisabled: boolean = false;

    // #endregion

    /** Constructor */
    constructor(
        private _dateFilter: DatePipe,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
      
    ) {
        super();
        this.isSaveButtonDisabled = false;
    }

    ngOnChanges(changes: SimpleChanges) : void {
        
        if (changes.blockTimeComponentCalled && changes.blockTimeComponentCalled.currentValue) {
            this.currentDate = new Date(this._cellDataSelection.startDate);
            this.getBranchDatePattern();
            this.getFundamentals();
        }
    }

    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.exceptionDateFormate = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.ExceptionDateFormat);
        this.schedulerRRuleUntilDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerRRuleUntilDateFormat);
        this.recurrenceExceptionDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.RecurrenceExceptionDateFormat);
        this.branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.isShowScheduler = true;
    }

    getFundamentals() {
        return this._httpService.get(SchedulerBlockTimeApi.getFundamentals)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.getResponseFundamentals(response.Result);
                        this.getDateOnPageLoad();
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
                }
            );
    }

    getResponseFundamentals(data) {
        if (data.StaffList) {
            this.staffList = data.StaffList;
            this.selectedStaffID = this.staffList && this.staffList.length > 0 ? this.staffList[0].id : 0;
        }
    }

    getDateOnPageLoad() {
        if (this._cellDataSelection.id > 0) {
            this.isChangeStartDateEvent = false;
            this.getBlockTimeByID(this._cellDataSelection.id);
        } else {
            this.isChangeStartDateEvent = true;
            this.resetStaffBlockForm();
            // this.onedaySchedulerComp.staffID = this.staffBlockModel.StaffID;
            // this.onedaySchedulerComp.getCustomSchedulerData();
        }
    }

    resetStaffBlockForm() {
        this.staffBlockModel = new StaffBlockTimeModel();
        this.staffBlockModel.StaffBlockTimeID = 0;
        this.staffBlockModel.StaffID = this._cellDataSelection.StaffID == 0 ? this.staffList[0].StaffID : this._cellDataSelection.StaffID;
        this.staffBlockModel.StaffName = "";
        this.staffBlockModel.AllDay = this._cellDataSelection.allDay;
        this.staffBlockModel.StartDate = this._cellDataSelection.startDate;
        this.staffBlockModel.EndDate = this._cellDataSelection.endDate;
        this.staffBlockModel.RecurrenceRule = "";
        this.staffBlockModel.Description = "";
        //this.refreshDevexControls();
    }

    onCloseSchedulerBlockTimePopup() {
        this.onCancel.emit(true);
    }

    //for staff data chnage on one day scheduler
    onStaffChange(staffID) {
        if (this.onedaySchedulerComp) {
            this.onedaySchedulerComp.getSchedulerByStaff(staffID);
        }
    }

    onSelectDate_valueChanged(startDate: Date) {

        startDate = new Date(startDate);
        let startDateTime = new Date(this.staffBlockModel.StartDate),
            endDateTime = new Date(this.staffBlockModel.EndDate);

        this.currentDate = startDate;
        this.staffBlockModel.StartDate = startDate;

        //set hours, time and second 0,0,0
        var _selectedDate = startDate;
        _selectedDate = new Date(_selectedDate.setHours(0, 0, 0));

        this.staffBlockModel.StartDate = new Date(_selectedDate.setHours(startDateTime.getHours(), startDateTime.getMinutes()));
        this.staffBlockModel.EndDate = new Date(_selectedDate.setHours(endDateTime.getHours(), endDateTime.getMinutes()));
    }

    startDateChangeEvent(event) {
        if (event.value || this.isChangeStartDateEvent) {
            if (event.previousValue) {
                let getTimeDifference = this._dateTimeService.getTimeDifferenceFromTimeString(this.getTimeFromDate(event.previousValue), this.getTimeFromDate(new Date(this.staffBlockModel.EndDate)));
                /** if user clear date box then, get date from user selection Date. */
                if (event.value) {
                    this.staffBlockModel.EndDate = this._dateTimeService.setTimeInterval(new Date(event.value), getTimeDifference);
                }
            }
            if (this.staffBlockModel.StartDate) {
                new Date(new Date(this.staffBlockModel.StartDate).setDate(this.currentDate.getDate()));
                new Date(new Date(this.staffBlockModel.StartDate).setMonth(this.currentDate.getMonth()));
                new Date(new Date(this.staffBlockModel.StartDate).setFullYear(this.currentDate.getFullYear()));
            }
        }
    }

    endDateChangeEvent($event) {
        if ($event.value) {
            new Date(new Date(this.staffBlockModel.EndDate).setDate(this.currentDate.getDate()));
            new Date(new Date(this.staffBlockModel.EndDate).setMonth(this.currentDate.getMonth()));
            new Date(new Date(this.staffBlockModel.EndDate).setFullYear(this.currentDate.getFullYear()));
        }
    }

    repeatSwitch_valueChanged(event) {
        this.showRepeatControl = event.value;
        if (!this.showRepeatControl) {
            this.recurrenceRuleFormData.repeat = null;
            this.isShowError = false;
        }

        if (this.showRepeatControl) {

            setTimeout(() => {
                if (this.showRepeatControl) {
                    if (this.recurrenceRuleFormData.repeat == undefined) {
                        this.recurrenceRuleFormData.repeat = 'FREQ=DAILY' + ';UNTIL=' + this.branchCurrentDate.getFullYear() + ("0" + (this.branchCurrentDate.getMonth() + 1)).slice(-2)  + ("0" + this.branchCurrentDate.getDate()).slice(-2);
               
                    }
                    let repeatEditor: any = this.devexpForm.instance.getEditor("repeat");
                    if (repeatEditor._editors[0].editorOptions.items.length > 4) {
                        repeatEditor._editors[0].editorOptions.items.splice(0, 1);
                        repeatEditor._editors[0].editorOptions.items.splice(3, 1);
                    }
                    repeatEditor._editors[0].label.text = '';
                    repeatEditor._editors[1].items[0].label.text = 'Every';
                }
            }, 100)
        }
    }

    getBlockTimeByID(staffBlockTimeID: number) {
        this._httpService.get(SchedulerBlockTimeApi.getStaffBlockTimeDetail + staffBlockTimeID)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.staffBlockModel = response.Result;

                        // added by fahad after add date picker for select date

                       //for multi time zone issue using this method
                        this.staffBlockModel.StartDate = this._dateTimeService.convertStringIntoDateForScheduler(this.staffBlockModel.StartDate);

                        this.currentDate = this.staffBlockModel.StartDate;
                        this.setDateForRecurrenceException();
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "block time"));
                }
            );
    }

    setDateForRecurrenceException() {
        /** IF appointment is for recurrenceException (Edit this only),
         * then repeat controll switch should be Off */

        if (this._cellDataSelection.isRecurrenceException) {

            /** Don't  set startDate from API get By ID, Set it to Current Date, 
             * because recurrenceException StartDate set it to current selected Date 
             * And EndDate also should be the same*/

            this.staffBlockModel.StartDate = this._dateTimeService.convertTimeStringToDateTime(this.staffBlockModel.StartTime, this._cellDataSelection.startDate);
            this.staffBlockModel.EndDate = this._dateTimeService.convertTimeStringToDateTime(this.staffBlockModel.EndTime, this._cellDataSelection.startDate);

            let repeatEditor: any = this.devexpForm ? this.devexpForm.instance.getEditor("repeat") : "";
            if (repeatEditor && repeatEditor._editors[0].editorOptions.items.length > 4) {
                repeatEditor._editors[0].editorOptions.items.splice(0, 1);
                repeatEditor._editors[0].editorOptions.items.splice(3, 1);
                repeatEditor._editors[0].label.text = '';
                repeatEditor._editors[1].items[0].label.text = 'Every';
            }
            
        } else {

            this.staffBlockModel.StartDate = this._dateTimeService.convertTimeStringToDateTime(this.staffBlockModel.StartTime, this.staffBlockModel.StartDate);
            this.staffBlockModel.EndDate = this._dateTimeService.convertTimeStringToDateTime(this.staffBlockModel.EndTime, this.staffBlockModel.StartDate);
            /** refresh repeat control only when recurrence edit mode is = Series */

            if (this.staffBlockModel.RecurrenceRule) {
                this.recurrenceRuleFormData.repeat = super.removeZoneUntilTime(this.staffBlockModel);
                //this.recurrenceRuleFormData.repeat = this.staffBlockModel.RecurrenceRule;
                this.showRepeatControl = true;
                //this.refreshDevexControls();
            }

            if (this.staffBlockModel.RecurrenceException) {
                let strRException = this.staffBlockModel.RecurrenceException.split(',');
                if (strRException) {
                    for (let index = 0; index < strRException.length; index++) {
                        let exceptDate = this._dateTimeService.convertExceptionStringToDate(strRException[index]);
                        const element = this._dateTimeService.convertDateObjToString(exceptDate, this.dateFormat);
                        this.recurrenceExceptionList.push(element);
                    }
                }
            }
        }

        this.copyStaffBlockModel = JSON.parse(JSON.stringify(this.staffBlockModel));
    }

    refreshDevexControls() {
        this.devexpForm.instance.repaint();
    }

    saveStaffBlockTime(valid: boolean) {
        this.isSaveButtonDisabled = true;
        let startTime = this.getTimeStringFromDate(this.staffBlockModel.StartDate, Configurations.SchedulerTimeFormat);
        let EndTime = this.getTimeStringFromDate(this.staffBlockModel.EndDate, Configurations.SchedulerTimeFormat);
        if (valid) {
            this.isShowError = false;
            if (this.staffBlockModel.StartDate) {
                if (this.staffBlockModel.StartDate && this.staffBlockModel.EndDate) {
                    if (startTime < EndTime) {
                        if (this.validateDaySelected()) {
                            this.isShowError = false;
                            this.validateRepeatRuleOnSave();
                            if (!this.isShowError) {
                                this.isShowError = false;
                                let copyStaffBlockModel = Object.assign({}, this.staffBlockModel);
                                copyStaffBlockModel.StaffBlockTimeID = this._cellDataSelection.id;
                                this.addRecurrence(copyStaffBlockModel);
                                this.addRecurrenceException(copyStaffBlockModel);
                                copyStaffBlockModel.StartTime = this._dateTimeService.convertDateToTimeString(new Date(copyStaffBlockModel.StartDate));
                                copyStaffBlockModel.EndTime = this._dateTimeService.convertDateToTimeString(new Date(copyStaffBlockModel.EndDate));
                                copyStaffBlockModel.StartDate = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
                                this.onUpdateSchedulerBlockTime.emit(copyStaffBlockModel);
                                //this.onCloseSchedulerBlockTimePopup();
                            } else{
                                this.isSaveButtonDisabled = false;
                            }
                        } else{
                            this.isSaveButtonDisabled = false;
                        }
                    } else {
                        this.dateTimeCompareError = Messages.Validation.Endtime_Should_Greater_Than_Start_Time;
                        this.isSaveButtonDisabled = false;
                        this.isShowError = true;
                    }
                } else {
                    this.dateTimeCompareError = Messages.Validation.Info_Required;
                    this.isSaveButtonDisabled = false;
                    this.isShowError = true;
                }
            } else {
                this.dateTimeCompareError = Messages.Validation.StartDate_Required;
                this.isSaveButtonDisabled = false;
                this.isShowError = true;
            }
        } else{
            this.isSaveButtonDisabled = false;
        }
    }
    getTimeStringFromDate(dateValue: Date, timeFormat: string) {
        return this._dateFilter.transform(dateValue, timeFormat);
    }

    validateDaySelected() {
        if (this.recurrenceRuleFormData.repeat && this.recurrenceRuleFormData.repeat.includes("WEEKLY")) {
            if (this.recurrenceRuleFormData.repeat.includes("BYDAY")) {
                this.isShowError = false;
                return true;
            } else {
                this.isShowError = true;
                this.dateTimeCompareError = Messages.Validation.DaySelectOfTheWeelError;
                return false;
            }
        } else {
            return true;
        }
    }

    validateRepeatRuleOnSave() {

        if (this.recurrenceRuleFormData && this.recurrenceRuleFormData.repeat) {
            let splitRRule = this.recurrenceRuleFormData.repeat.split(';');

            if (this.recurrenceRuleFormData.repeat.toLowerCase().indexOf("until") == -1 && this.recurrenceRuleFormData.repeat.toLowerCase().indexOf("count") == -1) {
                this.dateTimeCompareError = this.messages.Validation.Scheduler_Repeat_EndDate_Required_Error;
                this.isShowError = true;
            }
            if (splitRRule) {

                for (let index = 0; index < splitRRule.length; index++) {
                    const element = splitRRule[index];

                    if (element.toLowerCase().indexOf("until") > -1) {
                        let dateStringRule = element.split('=')[1];
                        let splitOnlyDatePart = dateStringRule.split('T')[0];
                        let getYearFromRRule = splitOnlyDatePart.substr(0, 4), getMonthFromRRule = splitOnlyDatePart.substr(4, 2), getDateFromRRule = splitOnlyDatePart.substr(6, 2);
                        let endRRuleDate = getYearFromRRule + '-' + getMonthFromRRule + '-' + getDateFromRRule;
                        if (Date.parse(this.staffBlockModel.StartDate.toString()) > Date.parse(endRRuleDate)) {
                            this.dateTimeCompareError = this.messages.Validation.Scheduler_Repeat_EndDate_Greater_Than_SartDate;
                            this.isShowError = true;
                        } else {
                            var days = this._dateTimeService.getDaysCountFromTwoDifferentDays(this.staffBlockModel.StartDate, new Date(endRRuleDate));
                            if(days > 365){
                                this.dateTimeCompareError = this.messages.Validation.The_End_Repeat_Date_Of_Recurring_Must_Fall_Within_One_Year_Range;
                                this.isShowError = true;
                            }
                           
                        }
                        break;
                    } else if(element.toLowerCase().includes("count")){
                        var count = element.split('=');
                        if(Number(count[1]) > 99){
                            this.dateTimeCompareError = this.messages.Validation.The_Recurring__Occurrences_Cannot_Be_Greater_Than_99;
                            this.isShowError = true;
                        }
                    }
                }
            }
        }
    }

    addRecurrence(blockTimeModel: StaffBlockTimeModel) {
        if (this.showRepeatControl) {
            blockTimeModel.RecurrenceRule = this.recurrenceRuleFormData.repeat;
            blockTimeModel.RecurrenceRule = super.changeUntilTime(blockTimeModel);
            if (blockTimeModel.StaffBlockTimeID != 0 && blockTimeModel.RecurrenceException) {
                blockTimeModel = super.updateRecurrenceExceptionOnEditSeries(blockTimeModel, this._dateTimeService.getTimeStringFromDate(new Date(blockTimeModel.StartDate)));
            }
        }
        else
            blockTimeModel.RecurrenceRule = null;
    }

    addRecurrenceException(blockTimeModel: StaffBlockTimeModel) {

        if (this._cellDataSelection.isRecurrenceException) {

            var copyBlockModel = JSON.parse(JSON.stringify(this.copyStaffBlockModel));

            let formatRecurrenceDate = this._dateTimeService.convertDateObjToString(new Date(copyBlockModel.StartDate), this.recurrenceExceptionDateFormat);
            let _gethours, _getminutes;
            var time = copyBlockModel.StartTime.split(":");
            _gethours = time[0].trim();
            _getminutes = time[1].trim();

            if (_gethours.length === 1) _gethours = "0" + _gethours;
            if (_getminutes.length === 1) _getminutes = "0" + _getminutes;
            blockTimeModel.RecurrenceException = formatRecurrenceDate + "T" + _gethours + _getminutes + "00";

            blockTimeModel.IsUpdate = false;
        }
        if (blockTimeModel.StaffBlockTimeID && blockTimeModel.StaffBlockTimeID > 0 && !this._cellDataSelection.isRecurrenceException) {
            blockTimeModel.IsUpdate = true;
        }
    }

    convertDateToTimeSpan(date) {
        return date.getHours() + ":" + date.getMinutes();
    }

    getTimeFromDate(date: Date) {
        return this._dateTimeService.getTimeStringFromDate(date);
    }

    onRecurrenceValueChanged = (event: any) => {
        this.recurrenceRuleFormData.repeat = event.value;
    }
}