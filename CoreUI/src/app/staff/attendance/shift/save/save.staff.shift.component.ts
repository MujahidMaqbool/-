/**Angular Modules */
import { Component, Inject, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { SubscriptionLike as ISubscription, SubscriptionLike } from 'rxjs';

/** DevExtreme */
import { DxFormComponent } from 'devextreme-angular';

/** Models*/
import { RRuleData, CellSelectedData } from '@scheduler/models/scheduler.model';
import { StaffShift } from '@staff/models/staff.model';

/** Services */

import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { DateTimeService } from '@services/date.time.service';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';

/** Configurations */
import { Configurations } from '@helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { StaffShiftApi } from '@app/helper/config/app.webapi';
import { ApiResponse } from '@app/models/common.model';
import { DataSharingService } from '@app/services/data.sharing.service';
import { ENU_DateFormatName, ENU_Package } from '@app/helper/config/app.enums';

@Component({
    selector: 'save-staff-shift',
    templateUrl: './save.staff.shift.component.html'
})

export class SaveSchedulerStaffShiftComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Members

    @ViewChild('schedulerShiftFormData') schedulerShiftFormData: NgForm;
    @ViewChild(DxFormComponent) devexpForm: DxFormComponent;
    @Output() onUpdateSchedulerStaffShift = new EventEmitter<StaffShift>();


    /**Scope Variables */
    currentDate: Date = new Date(this.selectedCellData.startDate);
    branchCurrentDate: Date = new Date();
    selectedStaffID: number = 0;
    selectedShiftTempalteID: number = 0;
    isShiftTemplateChangeEvent: boolean = false;
    isChangeStartDateEvent: boolean = true;
    previousStartDate: Date;
    previousEndDate: Date;
    showRepeatControl: boolean = false;
    changeStartDateRRule: Date;

    /**Models & Lists */

    staffShiftModel: StaffShift = new StaffShift();
    copyStaffShiftModel: StaffShift = new StaffShift();
    staffList: any[] = [];
    shiftTemplateList: any[] = [];
    filterShiftTemplateList: any[] = [];
    staffRecurrenceRule: RRuleData = new RRuleData();
    recurrenceExceptionList: any[] = [];


    /** Configurations, Constants, Messages */
    messages = Messages;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    dateFormat: string = "";//Configurations.DateFormat;
    exceptionDateFormate: string = "";//Configurations.ExceptionDateFormat;
    schedulerRRuleUntilDateFormat: string = "";//Configurations.SchedulerRRuleUntilDateFormat;
    recurrenceExceptionDateFormat: string = "";//Configurations.RecurrenceExceptionDateFormat;
    dateTimeCompareError = Messages.Validation.Endtime_Should_Greater_Than_Start_Time;
    startDateValidationError = Messages.Validation.StartDate_Required;
    requiredInfoErrorMsg = Messages.Validation.Info_Required;
    isShowError: boolean = false;
    packageIdSubscription: SubscriptionLike;
    packageId :number;
    package = ENU_Package;
    isShowTemplate: boolean = true;





    /** Angular library */
    staffDetailSubscription: ISubscription;

    // #endregion

    /** Constructor */
    constructor(
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
        public dialogRef: MatDialogRef<SaveSchedulerStaffShiftComponent>,
        @Inject(MAT_DIALOG_DATA) public selectedCellData: CellSelectedData
    ) {
        super()
    }

    ngOnInit() {
        this.getBranchDatePattern();
        this.getFundamentals();
        if (this.selectedCellData.id > 0) {
            this.isChangeStartDateEvent = false;
            this.getStaffShiftByID(this.selectedCellData.id);
        }
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
            (packageId: number) => {
                if (packageId && packageId > 0) {
                  this.packageId = packageId;
                  this.setPackagePermission(this.packageId);
                }
            }
        );
    }

    ngOnDestroy() {
        this.staffShiftModel = undefined;
        this.packageIdSubscription.unsubscribe();

    }

    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.exceptionDateFormate = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.ExceptionDateFormat);
        this.schedulerRRuleUntilDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerRRuleUntilDateFormat);
        this.recurrenceExceptionDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.RecurrenceExceptionDateFormat);
        this.branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
    }

    onStartTimeChange($event) {
        if ($event.value || this.isChangeStartDateEvent) {
            if ($event.previousValue && !this.isShiftTemplateChangeEvent) {
                let getTimeDifference = this._dateTimeService.getTimeDifferenceFromTimeString(this.getTimeFromDate($event.previousValue), this.getTimeFromDate(new Date(this.staffShiftModel.EndTime)));
                if (this.staffShiftModel.StartTime > this.staffShiftModel.EndTime) {
                    this.staffShiftModel.EndTime = this._dateTimeService.setTimeInterval(new Date(this.staffShiftModel.StartTime), getTimeDifference);
                }
            }
            if (this.staffShiftModel.StartTime) {   // if user clear start date field
                this.staffShiftModel.StartTime.setDate(new Date(this.staffShiftModel.StartDate).getDate());
                this.staffShiftModel.StartTime.setMonth(new Date(this.staffShiftModel.StartDate).getMonth());
                this.staffShiftModel.StartTime.setFullYear(new Date(this.staffShiftModel.StartDate).getFullYear());
            }
        }
        this.isShiftTemplateChangeEvent = false;
    }

    onEndTimeChange($event) {
        if ($event.value) {
            new Date(this.staffShiftModel.EndTime.setDate(new Date(this.staffShiftModel.StartDate).getDate()));
            new Date(this.staffShiftModel.EndTime.setMonth(new Date(this.staffShiftModel.StartDate).getMonth()));
            new Date(this.staffShiftModel.EndTime.setFullYear(new Date(this.staffShiftModel.StartDate).getFullYear()));
        }
    }

    // #region Events

    filterShiftTemplate(staffID) {
        //let selectedStaff = this.staffList.filter(x => x.StaffID == Number(staffID))
        this.filterShiftTemplateList = [];
        let selectedStaff = this.staffList.filter(x => x.StaffID == Number(staffID))[0];
        this.filterShiftTemplateList = this.shiftTemplateList.filter(x => x.StaffPositionID == selectedStaff.StaffPositionID);
    }

    splitShiftTemplateTime(selectedShiftTempalteID) {
        this.isChangeStartDateEvent = false;
        this.isShiftTemplateChangeEvent = true;
        if (selectedShiftTempalteID > 0) {
            let selectedTemplate = this.filterShiftTemplateList.filter(x => x.ShiftTemplateID == selectedShiftTempalteID);
            let shiftTimes;
            if (selectedTemplate) {
                shiftTimes = selectedTemplate[0].ShiftTemplateName.split('-');
                this.staffShiftModel.UnpaidBreak = selectedTemplate[0].UnpaidBreak;
                this.staffShiftModel.Description = selectedTemplate[0].Description;
            }
            //let startTimeFromString = this.convertTimeToDateString(shiftTimes[0].toString()),
            //  endTimeFromString = this.convertTimeToDateString(shiftTimes[1].toString()),
            let date = new Date(this.selectedCellData.startDate);
            this.staffShiftModel.StartTime = this._dateTimeService.convertTimeStringToDateTime(shiftTimes[0].replace(/ /g, ''), date);
            this.staffShiftModel.EndTime = this._dateTimeService.convertTimeStringToDateTime(shiftTimes[1].replace(/ /g, ''), date);

        } else {
            this.staffShiftModel.StartTime = this.previousStartDate;
            this.staffShiftModel.EndTime = this.previousEndDate;
            this.staffShiftModel.UnpaidBreak = 0;
        }
    }

    onStartDate_valueChanged(dateValue: string) {

        //if (event.previousValue) {
        // let startDateTime = new Date(this.staffShiftModel.StartTime),
        //     endDateTime = new Date(this.staffShiftModel.EndTime),
        //     startDate = new Date(event.value);

        this.staffShiftModel.StartDate = dateValue;
        //this.staffShiftModel.StartTime = new Date(startDate.setHours(startDateTime.getHours(), startDateTime.getMinutes()));
        //this.staffShiftModel.EndTime = new Date(startDate.setHours(endDateTime.getHours(), endDateTime.getMinutes()));
        //}
    }

    onCloseSchedulerStaffShiftPopup() {
        this.dialogRef.close();
    }

    // #endregion

    // #region Methods

    getFundamentals() {
        this._httpService.get(StaffShiftApi.getFundamentals)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.mapDataResponseFundamentals(response.Result);
                        this.formatTimeValues();
                        if (this.selectedCellData.id == 0) {
                            this.isChangeStartDateEvent = true;
                            this.setDefaultValueToForm();
                        }
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error)
            );
    }

    mapDataResponseFundamentals(data) {
        if (data.ShiftTemplateList && data.ShiftTemplateList.length > 0) {
            this.shiftTemplateList = data.ShiftTemplateList;
            this.filterShiftTemplateList = data.ShiftTemplateList.filter(x => x.StaffPositionID === this.selectedCellData.StaffPositionID);
            this.filterShiftTemplateList.forEach((data) => {
                data.startTime = data.ShiftTemplateName.split('-')[0];
                data.endTime = data.ShiftTemplateName.split('-')[1];
            })
        } else {
            this.shiftTemplateList = [];
            this.filterShiftTemplateList = [];
        }

        this.staffList = data.StaffList && data.StaffList.length > 0 ? data.StaffList : [];
    }

    formatTimeValues() {
        if (this.shiftTemplateList && this.shiftTemplateList.length > 0) {
            this.shiftTemplateList.forEach(template => {
                let timeValues = template.ShiftTemplateName.split('-');
                let startTime = this._dateTimeService.formatTimeString(timeValues[0]);
                let endTime = this._dateTimeService.formatTimeString(timeValues[1]);

                template.ShiftTemplateName = startTime + ' - ' + endTime;
            })
        }
    }

    setDefaultValueToForm() {
        this.staffShiftModel = new StaffShift();
        /* Change: StaffID is now remove from model because its came from StaffShift View All Fundamentals */
        this.staffShiftModel.StaffID = this.selectedCellData.StaffID == 0 ? this.staffList[0].StaffID : this.selectedCellData.StaffID;
        /** If staff hae no permission to do Classes then stafflist is not filtered so its 0 */
        let setStaffIDWithPermission = this.staffList.filter(x => x.StaffID == this.staffShiftModel.StaffID)[0];
        if (!setStaffIDWithPermission) { this.staffShiftModel.StaffID = 0; }
        this.staffShiftModel.StaffPositionID = this.selectedCellData.StaffPositionID;
        this.staffShiftModel.StartTime = this.selectedCellData.startDate;
        this.staffShiftModel.EndTime = this.selectedCellData.endDate;
        this.previousStartDate = new Date(this.staffShiftModel.StartTime);
        this.previousEndDate = new Date(this.staffShiftModel.EndTime);
        this.staffShiftModel.StartDate = this.selectedCellData.startDate;
    }

    getStaffShiftByID(staffShiftID: number) {
        this._httpService.get(StaffShiftApi.getByID + staffShiftID)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.staffShiftModel = response.Result;
                        this.setShiftFormDataByID();
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Shift")); }
            );
    }

    setShiftFormDataByID() {

        /** IF appointment is for recurrenceException (Edit this only),
        * then repeat controll switch should be Off */
        if (this.selectedCellData.isRecurrenceException) {
            /** Don't  set startDate from API get By ID, Set it to Current Date, 
            * because recurrenceException StartDate set it to current selected Date 
            * And EndDate also should be the same*/

            //this.changeStartDateRRule = this.staffShiftModel.StartDate; /** changeStartDateRRule Date is for Save on RRule Update */

            this.staffShiftModel.StartDate = this.selectedCellData.startDate;
            this.staffShiftModel.StartTime = this._dateTimeService.convertTimeStringToDateTime(this.staffShiftModel.StartTime, this.selectedCellData.startDate);
            this.staffShiftModel.EndTime = this._dateTimeService.convertTimeStringToDateTime(this.staffShiftModel.EndTime, this.selectedCellData.startDate);
            
            let repeatEditor: any = this.devexpForm.instance.getEditor("repeat");
            if (repeatEditor._editors[0].editorOptions.items.length > 4) {
                repeatEditor._editors[0].editorOptions.items.splice(0, 1);
                repeatEditor._editors[0].editorOptions.items.splice(3, 1);
            }
            repeatEditor._editors[0].label.text = '';
            repeatEditor._editors[1].items[0].label.text = 'Every';
        }
        else {
            this.staffShiftModel.StartTime = this._dateTimeService.convertTimeStringToDateTime(this.staffShiftModel.StartTime, this.staffShiftModel.StartDate);
            this.staffShiftModel.EndTime = this._dateTimeService.convertTimeStringToDateTime(this.staffShiftModel.EndTime, this.staffShiftModel.StartDate);
            if (this.staffShiftModel.RecurrenceRule) {
                this.staffRecurrenceRule.repeat = this.staffShiftModel.RecurrenceRule;
                this.showRepeatControl = true;
            }
            if (this.staffShiftModel.RecurrenceException) {
                let strRException = this.staffShiftModel.RecurrenceException.split(',');
                if (strRException) {
                    for (let index = 0; index < strRException.length; index++) {
                        let exceptDate = this._dateTimeService.convertExceptionStringToDate(strRException[index]);
                        const element = this._dateTimeService.convertDateObjToString(exceptDate, this.dateFormat);
                        this.recurrenceExceptionList.push(element);
                    }
                }
            }
        }

        this.copyStaffShiftModel = JSON.parse(JSON.stringify(this.staffShiftModel));
    }

    saveStaffShift(isValid: boolean) {
        this.isShowError = false;
        if (isValid) {
            if (this.staffShiftModel.StartDate) {
                if (this.staffShiftModel.StartTime && this.staffShiftModel.EndTime) {
                    if (Date.parse(this.staffShiftModel.StartTime) < Date.parse(this.staffShiftModel.EndTime)) {
                        if (this.validateDaySelected()) {
                            this.isShowError = false;
                            this.validateRepeatRuleOnSaveShift();
                            if (!this.isShowError) {
                                this.isShowError = false;
                                let copStaffShiftModel = Object.assign({}, this.staffShiftModel);
                                copStaffShiftModel.StaffPositionID = this.selectedCellData.StaffPositionID;
                                //copStaffShiftModel.StaffID = this.selectedCellData.StaffID;
                                copStaffShiftModel.RecurrenceRule = this.staffRecurrenceRule.repeat;
                                this.addRecurrence(copStaffShiftModel);
                                this.addRecurrenceException(copStaffShiftModel);
                                copStaffShiftModel.StartDate = this._dateTimeService.convertDateObjToString(this.staffShiftModel.StartDate, this.dateFormat);
                                copStaffShiftModel.StartTime = this._dateTimeService.getTimeStringFromDate(new Date(this.staffShiftModel.StartTime));
                                copStaffShiftModel.EndTime = this._dateTimeService.getTimeStringFromDate(new Date(this.staffShiftModel.EndTime));
                                this.onUpdateSchedulerStaffShift.emit(copStaffShiftModel);
                            }
                        }
                    } else {
                        this.dateTimeCompareError = Messages.Validation.Endtime_Should_Greater_Than_Start_Time;
                        this.isShowError = true;
                    }
                } else {
                    this.dateTimeCompareError = this.requiredInfoErrorMsg;
                    this.isShowError = true;
                }
            } else {
                this.dateTimeCompareError = this.startDateValidationError;
                this.isShowError = true;
            }
        }
    }

    validateDaySelected() {
        if (this.staffRecurrenceRule.repeat && this.staffRecurrenceRule.repeat.includes("WEEKLY")) {
            if (this.staffRecurrenceRule.repeat.includes("BYDAY")) {
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

    validateRepeatRuleOnSaveShift() {

        if (this.staffRecurrenceRule && this.staffRecurrenceRule.repeat && this.showRepeatControl) {
            let splitRRule = this.staffRecurrenceRule.repeat.split(';');
            if (this.staffRecurrenceRule.repeat.toLowerCase().indexOf("until") == -1 && this.staffRecurrenceRule.repeat.toLowerCase().indexOf("count") == -1) {
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
                        if (Date.parse(this.staffShiftModel.StartTime) > Date.parse(endRRuleDate)) {
                            this.dateTimeCompareError = this.messages.Validation.Scheduler_Repeat_EndDate_Greater_Than_SartDate;;
                            this.isShowError = true;
                        } else {
                            var days = this._dateTimeService.getDaysCountFromTwoDifferentDays(this.staffShiftModel.StartTime, new Date(endRRuleDate));
                            if(days > 365){
                                this.dateTimeCompareError = this.messages.Validation.The_End_Repeat_Date_Of_Recurring_Must_Fall_Within_One_Year_Range;
                                this.isShowError = true;
                            }
                           
                        }
                        break;
                    }else if(element.toLowerCase().includes("count")){
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

    addRecurrence(shiftModel: StaffShift) {
        if (this.showRepeatControl) {
            shiftModel.RecurrenceRule = this.staffRecurrenceRule.repeat;
            if (shiftModel.StaffShiftID != 0 && shiftModel.RecurrenceException) {
                shiftModel = super.updateRecurrenceExceptionOnEditSeries(shiftModel, this._dateTimeService.getTimeStringFromDate(new Date(shiftModel.StartTime)));
            }
        }
        else
            shiftModel.RecurrenceRule = null;
    }

    addRecurrenceException(ShiftModel: StaffShift) {

        if (this.selectedCellData.isRecurrenceException) {
            //ShiftModel.RecurrenceException = this._dateTimeService.convertDateObjToString(new Date(ShiftModel.StartDate), Configurations.RecurrenceExceptionDateFormat);
            //ShiftModel.RecurrenceRule = "";  // recurrence rule is always empty/null if edit this only appointment is going to update in case of Drag n Drop.

            var copyShiftModel = JSON.parse(JSON.stringify(this.copyStaffShiftModel));
            let formatRecurrenceDate = this._dateTimeService.convertDateObjToString(new Date(copyShiftModel.StartDate), this.recurrenceExceptionDateFormat);
            let _gethours = new Date(copyShiftModel.StartDate).getHours().toString(), _getminutes = new Date(copyShiftModel.StartDate).getMinutes().toString();
            if (_gethours.length === 1) _gethours = "0" + _gethours;
            if (_getminutes.length === 1) _getminutes = "0" + _getminutes;
            ShiftModel.RecurrenceException = formatRecurrenceDate + "T" + _gethours + _getminutes + "00";
            ShiftModel.IsUpdate = false;
        }
        if (ShiftModel.StaffShiftID && ShiftModel.StaffShiftID > 0 && !this.selectedCellData.isRecurrenceException) {
            ShiftModel.IsUpdate = true;
        }
    }

    repeatSwitch_valueChanged(event) {

        this.showRepeatControl = event.value;
        if (!this.showRepeatControl) {
            this.staffRecurrenceRule.repeat = null;
            this.isShowError = false;
        }

        if (this.showRepeatControl) {
            if (this.staffRecurrenceRule.repeat == undefined) {
                this.staffRecurrenceRule.repeat = 'FREQ=DAILY' + ';UNTIL=' + this.branchCurrentDate.getFullYear() + ("0" + (this.branchCurrentDate.getMonth() + 1)).slice(-2)  + ("0" + this.branchCurrentDate.getDate()).slice(-2);    
            }
            let repeatEditor: any = this.devexpForm.instance.getEditor("repeat");
            if (repeatEditor._editors[0].editorOptions.items.length > 4) {
                repeatEditor._editors[0].editorOptions.items.splice(0, 1);
                repeatEditor._editors[0].editorOptions.items.splice(3, 1);
            }
            repeatEditor._editors[0].label.text = '';
            repeatEditor._editors[1].items[0].label.text = 'Every';
        }
    }

    convertTimeToDateString(time: string) {
        /** Convert Time (09:00am) to Date String */
        let splitTimeArray = time.split(':'), minutes = splitTimeArray[1], hours = splitTimeArray[0], seconds = splitTimeArray[2];
        let timeSpanArray: any = {
            minutes: minutes,
            hours: hours,
            seconds: seconds
        }
        return timeSpanArray;
    }

    setHoursDT(dt, h) {
        var s = /(\d+):(\d+)(.+)/.exec(h);
        dt.setHours(s[3] === "PM" ?
            12 + parseInt(s[1], 10) :
            parseInt(s[1], 10));
        dt.setMinutes(parseInt(s[2], 10));
        return dt;
    }

    getTimeFromDate(date: Date) {
        return this._dateTimeService.getTimeStringFromDate(date);
    }
    onRecurrenceValueChanged = (event: any) => {
        this.staffRecurrenceRule.repeat = event.value;
    }

    setPackagePermission(packageId: number) {
        switch (packageId) {
            case this.package.WellnessMedium:
                this.isShowTemplate = false;
                break;
        }
      }
}
