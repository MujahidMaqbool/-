// #region Imports 

/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild, Output, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { NgForm } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubscriptionLike as ISubscription } from "rxjs";

/********************** Common *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { StaffActivityApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';

/********************** Components *********************/


/********************** Services & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';

/* Models */

import {
    PriorityType,
    Template,
    ActivityPersonInfo
} from 'src/app/models/activity.model';
import { ENU_ActivityType, TemplateType, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { StaffActivityTabOptions, TaskActivity, EmailActivity, NoteActivity, SMSActivity } from 'src/app/staff/models/staff.activity.model';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

// #endregion 

@Component({
    selector: 'save-staff-activity',
    templateUrl: './save.staff.activity.component.html'
})
export class SaveStaffActivityComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    // #region Local Members 

    dayViewFormat: string = "";

    @Output()
    activitySaved = new EventEmitter<boolean>();

    @Output()
    openAddAppointment = new EventEmitter<boolean>();

    /* Activity Form References*/
    @ViewChild('emailForm') emailForm: NgForm;
    @ViewChild('noteForm') notesForm: NgForm;
    @ViewChild('smsForm') smsForm: NgForm;
    @ViewChild('taskForm') taskForm: NgForm;

    /* Activity Model References */
    emailModel: EmailActivity;
    noteModel: NoteActivity;
    smsModel: SMSActivity;
    taskModel: TaskActivity;

    staffIdSubscription: ISubscription;
    emailFormSubscription: ISubscription;
    noteFormSubscription: ISubscription;
    smsFormSubscription: ISubscription;
    taskFormSubscription: ISubscription;

    personInfo: ActivityPersonInfo;
    personInfoSubscription: ISubscription;

    /* Local members */
    assignedToStaffID: number;
    schedulerStartTime: Date;
    schedulerMinDate: Date = new Date();
    schedulerMinStartTime: Date = new Date();
    currentDateTime: Date = new Date();
    schedulerEndTime: Date;
    activeTab: string;
    activeTabIndex: number = 0;
    isInvalidData: boolean = false;
    hasError: boolean = false;
    hasSuccess: boolean = false;
    templateTypeId: number;
    selectedTemplate: any;
    isInvalidEndTime: boolean = false;
    isInvalidFollowUpDate: boolean = false;
    isActiveTabEmailOrSMS: boolean = false;
    isInvalidStartTime: boolean = false;
    isInvalidEmailBody: boolean = false;
    /* Collection Types */
    priorityTypeList: PriorityType[];
    templateTextList: Template[];
    activeTabs: string[];
    saveInProgress: boolean = false;
    currentCallDate: Date;
    /* Messages */
    messages = Messages;
    errorMessage: string;
    successMessage: string;
    emailMaxLengthMessage: string;

    /* Configurations */
    dateFormat = Configurations.DateFormat;
    timeFormat = Configurations.TimeFormat;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    activityTypes = Configurations.ActivityTypes;
    activityType = ENU_ActivityType;
    templateType = TemplateType;
    tepmplateVariableList = Configurations.TemplateVariableList;
    emailMaxLength = Configurations.EmailMaxLength;

    // #endregion 

    constructor(
        private _httpService: HttpService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        public dialogRef: MatDialogRef<SaveStaffActivityComponent>,
        @Inject(MAT_DIALOG_DATA) public tabsOptions: StaffActivityTabOptions) {
            super();
         }

    ngOnInit() {
        this.getBranchDatePattern();  
    }

    ngOnDestroy() {
        this.staffIdSubscription.unsubscribe();
        this.personInfoSubscription.unsubscribe();

        this.unSubscribeFormChanges();
    }

    // #region  Events

    onTabChange(event: any) {
        this.showValidationMessage(false);
        this.activeTab = event.tab.textLabel;
        this.activeTabIndex = event.index;
        this.setTemplateTypeId();
        this.resetAllForms();
        this.subscribeToFormChanges();
    }

    onSaveClick() {
        this.saveInProgress = true;
        this.hasError = false;
        this.hasSuccess = false;
        this.showValidationMessage(false);

        switch (this.activeTab) {
            // case this.activityTypes.Appointment: {
            //     // Save Appointment                
            //     this.saveAppointment();
            //     break;
            // }
            // case this.activityTypes.Call: {
            //     // Save Call
            //     this.saveCall();
            //     break;
            // }
            case this.activityTypes.Email: {
                // Save Email
                this.saveEmail();
                break;
            }
            case this.activityTypes.Note: {
                // Save Note
                this.saveNote();
                break;
            }
            case this.activityTypes.SMS: {
                // Save SMS
                this.saveSMS();
                break;
            }
            case this.activityTypes.Task: {
                // Save Task
                this.saveTask();
                break;
            }
        }
    }

    onTemplateChange(template: Template) {
        switch (this.templateTypeId) {
            case this.templateType.Email: {
                this.setTemplateForEmail(template);
            }

            case this.templateType.SMS: {
                this.setTemplateForSMS(template);
            }
        }
    }

    onTaskStartTimeChanged(event: any) {
        if (event && event.value) {
            this.taskModel.FollowUpStartTime = this._dateTimeService.getTimeStringFromDate(event.value, this.timeFormat);

            // Update EndTime Only if there is previous value
            // if there is no previous value it means it is being set for Edit mode
            if (event.previousValue) {
                this.schedulerEndTime = this.setEndDateInterval(event.value);
                this.taskModel.FollowUpEndTime = this.getTimeStringFromDate(this.schedulerEndTime, this.timeFormat);
                this.isInvalidStartTime = false;
                this.saveInProgress = false;
            }
        }
        else {
            this.taskModel.FollowUpStartTime = null;
        }


    }

    onTaskEndTimeChanged(event: any) {
        if (event && event.value) {
            this.taskModel.FollowUpEndTime = this._dateTimeService.getTimeStringFromDate(event.value, this.timeFormat);

            if (this.taskModel.FollowUpEndTime > this.taskModel.FollowUpStartTime) {
                this.isInvalidEndTime = false;
            }
            else {
                this.isInvalidEndTime = true;
            }
        }
        else {
            this.taskModel.FollowUpEndTime = null;
        }
    }

    onTaskDateChange(newDate: Date) {
        // let today = new Date();
        // today.setHours(0, 0, 0, 0);


        // if (newDate.toLocaleDateString() === today.toLocaleDateString()) {
        //     this.schedulerMinStartTime = new Date();
        //     this.schedulerMinStartTime.setSeconds(0, 0);
        // }
        // else {
        //     this.schedulerMinStartTime = today;
        // }

        // if (newDate < today) {
        //     //  this.isInvalidFollowUpDate = true;
        // }
        // else {
        //     this.isInvalidFollowUpDate = false;
        //     this.isInvalidData = false;
        //     this.isInvalidStartTime = false;
        //     this.saveInProgress = false;

        // }

        // this.taskModel.FollowUpDate = newDate;
        //this.taskModel.FollowUpDate = this.getDateString(newDate, this.dateFormat);
    }

    onEmailBodyChange(value: string) {
        this.emailModel.EmailBody = value === "<br>" ? "" : value;
        if (value && value.length > this.emailMaxLength) {
            this.isInvalidEmailBody = true;
        }
        else {
            this.emailForm.form.updateValueAndValidity();
            this.isInvalidEmailBody = false;
        }
    }

    onClosePopup() {
        this.dialogRef.close();
    }

    onSelectDateCallValueChanged(startDate: Date) {
        startDate = new Date(startDate);
        this.taskModel.FollowUpDate = startDate;
    }   

    // #endregion

    // #region Methods 

    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
        this.noteModel = new NoteActivity();
        this.emailModel = new EmailActivity();
        this.smsModel = new SMSActivity();
        this.taskModel = new TaskActivity();

        this.schedulerMinStartTime.setSeconds(0, 0);

        //set branch date time added by fahad for browser different time zone issue resolving
        this.currentDateTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.currentCallDate = this.currentDateTime;

        setTimeout(async () => {
            this.activeTabs = this.tabsOptions.activeTabs;

            /* Commented to disable 'Show the same tab in Add Activity which was active in Search Activity '*/
            // this.activeTab = !this.tabsOptions.defaultActiveTab || this.tabsOptions.defaultActiveTab === this.activityTypes.All
            //                     ? this.tabsOptions.activeTabs[0] : this.tabsOptions.defaultActiveTab;

            this.activeTab = this.tabsOptions.activeTabs[0];

            //set branch date time added by fahad for browser different time zone issue resolving
             this.taskModel.FollowUpDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
            
            if (this.tabsOptions.isEditMode) {
                this.setModelForEdit();
            }
            else {
                //set branch date time added by fahad for browser different time zone issue resolving
                this.schedulerStartTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
                this.schedulerEndTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
               
                this.schedulerEndTime.setMinutes(this.schedulerStartTime.getMinutes() + 15);
            }

            this.staffIdSubscription = this._dataSharingService.staffID.subscribe((staffId: number) => {
                this.assignedToStaffID = staffId;
            });

            this.setTemplateTypeId();
            this.subscribeToFormChanges();


            this.personInfoSubscription = this._dataSharingService.activityPersonInfo.subscribe((personInfo: ActivityPersonInfo) => {
                if (personInfo) {
                    this.personInfo = personInfo;
                }
            });
        });

        setTimeout(() => {
            this.setActiveTabIndex();
        }, 500);

        this.emailMaxLengthMessage = Messages.Validation.Email_MaxLength.replace("{0}", this.emailMaxLength.toString());
    }

    setModelForEdit() {
        switch (this.activeTab) {
            case this.activityTypes.Task: {
                this.setEditTaskModel();
                break;
            }
            case this.activityTypes.Note: {
                this.setEditNoteModel();
                break;
            }
        }
    }

    setEditTaskModel() {
        this.taskModel = this.tabsOptions.modelData;
        this.taskModel.FollowUpDate = new Date(this.tabsOptions.modelData.FollowUpDate);

        setTimeout(() => {
            if (this.taskModel.FollowUpStartTime) {
                this.schedulerStartTime = this._dateTimeService.convertTimeStringToDateTime(this.taskModel.FollowUpStartTime, this.taskModel.FollowUpDate);
            }
            if (this.taskModel.FollowUpEndTime) {
                this.schedulerEndTime = this._dateTimeService.convertTimeStringToDateTime(this.taskModel.FollowUpEndTime, this.taskModel.FollowUpDate);
            }
        })
    }

    setEditNoteModel() {
        this.noteModel = Object.assign({}, this.tabsOptions.modelData);
    }

    setEmailOrSMSDropdowns() {
        this.templateTextList.splice(0, 0, { TemplateTextID: null, TemplateTextTitle: "No Template" });
        this.selectedTemplate = this.templateTextList[0];
    }

    setTemplateTypeId() {
        if (this.activeTab === this.activityTypes.Email) {
            this.templateTypeId = this.templateType.Email;

        }
        else if (this.activeTab === this.activityTypes.SMS) {
            this.templateTypeId = this.templateType.SMS;
        }
        else {
            this.templateTypeId = null;
        }

        if (this.templateTypeId && this.templateTypeId > 0) {
            this.getTemplateFundamentals(this.templateTypeId);
        }
    }

    setActiveTabIndex() {
        let index = this.activeTabs.indexOf(this.activeTab);
        if (index < 0) {
            index = 0;
            this.activeTab = this.activeTabs[index];
        }
        this.activeTabIndex = index >= 0 ? index : 0;
    }

    getTaskFundamentals() {
        this._httpService.get(StaffActivityApi.getTaskFundamentals).subscribe(
            data => {
                // Set fundamentals
                if (data && data.Result) {
                    this.priorityTypeList = data.Result.PriorityTypeList;
                }
                this.setTaskDropdowns();
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
        )
    }


    setTaskDropdowns() {
        if (this.priorityTypeList && this.priorityTypeList.length > 0) {
            if (!this.taskModel.PriorityTypeID || this.taskModel.PriorityTypeID <= 0) {
                this.taskModel.PriorityTypeID = this.priorityTypeList[0].PriorityTypeID;
            }
        }
    }


    getTemplateFundamentals(templateTypeId: number) {
        let url = StaffActivityApi.getTemplateFundamentals + templateTypeId.toString();

        this._httpService.get(url).subscribe(
            data => {
                // Set fundamentals
                if (data && data.Result) {
                    this.templateTextList = data.Result.TemplateTextList;
                    this.setEmailOrSMSDropdowns();
                }

            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
        );
    }

    getTemplateDescription(templateTextId: number, templateTypeId: number): any {
        let url = StaffActivityApi.getTemplateDescription.replace("{templateTextID}", templateTextId.toString())
            .replace("{templateTypeID}", templateTypeId.toString())
            .replace("{staffID}", this.assignedToStaffID.toString());
        return this._httpService.get(url);
    }

    setTemplateForSMS(template: Template) {
        if (template && template.TemplateTextID > 0) {
            let templateDescription = this.getTemplateDescription(template.TemplateTextID, this.templateTypeId);

            if (templateDescription) {
                templateDescription.subscribe((data: any) => {
                    if (data && data.Result && data.Result.TemplateText) {
                        this.smsModel.Title = template.TemplateTextTitle;
                        this.smsModel.Description = this.replaceTemplateVariables(data.Result.TemplateText.TemplateTextDescription);
                        this.smsModel.TemplateTextID = template.TemplateTextID;
                    }
                });
            }
        }
        else {
            this.smsModel.TemplateTextID = null;
            this.smsModel.Title = "";
            this.smsModel.Description = "";
        }

    }

    setTemplateForEmail(template: Template) {
        if (template && template.TemplateTextID > 0) {
            let templateDescription = this.getTemplateDescription(template.TemplateTextID, this.templateTypeId)
            if (templateDescription) {
                templateDescription.subscribe((data: any) => {
                    if (data && data.Result && data.Result.TemplateText) {
                        this.emailModel.EmailSubject = data.Result.TemplateText.TemplateTextEmailSubject;
                        this.emailModel.EmailBody = this.replaceTemplateVariables(data.Result.TemplateText.TemplateTextDescription);
                        this.emailModel.TemplateTextID = template.TemplateTextID;
                    }
                });
            }
        }
        else {
            this.emailModel.TemplateTextID = null;
            this.emailModel.EmailSubject = "";
            this.emailModel.EmailBody = "";
        }
    }

    replaceTemplateVariables(description: string) {
        if (description) {
            this.tepmplateVariableList.forEach(templateVar => {
                if (description && description.indexOf(templateVar) >= 0) {
                    if (templateVar === "[Staff Name]") {
                        description = description.replace(templateVar, this.personInfo.Name);
                    }
                    else if (templateVar === "[Phone]") {
                        description = description.replace(templateVar, this.personInfo.Mobile);
                    }
                    else if (templateVar === "[Address]") {
                        description = description.replace(templateVar, this.personInfo.Address);
                    }
                }
            })
        }
        return description;
    }

    subscribeToFormChanges() {
        this.unSubscribeFormChanges();

        switch (this.activeTab) {
            case this.activityTypes.Task: {
                this.getTaskFundamentals();
                setTimeout(() => {
                    if (!this.tabsOptions.isEditMode) {
                        this.taskModel.FollowUpStartTime = this.getTimeStringFromDate(this.schedulerStartTime, this.timeFormat);
                        this.taskModel.FollowUpEndTime = this.getTimeStringFromDate(this.schedulerEndTime, this.timeFormat);
                    }
                });
                this.taskFormSubscription = this.taskForm.valueChanges.subscribe(() => {
                    if (this.taskForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = false;
                break;
            }
            case this.activityTypes.Email: {
                this.emailFormSubscription = this.emailForm.valueChanges.subscribe(() => {
                    if (this.emailForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = true;
                break;
            }
            case this.activityTypes.Note: {
                this.noteFormSubscription = this.notesForm.valueChanges.subscribe(() => {
                    if (this.notesForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = false;
                break;
            }
            case this.activityTypes.SMS: {
                this.smsFormSubscription = this.smsForm.valueChanges.subscribe(() => {
                    if (this.smsForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = true;
                break;
            }
        }
    }

    unSubscribeFormChanges() {
        if (this.emailFormSubscription) { this.emailFormSubscription.unsubscribe(); }
        if (this.noteFormSubscription) { this.noteFormSubscription.unsubscribe(); }
        if (this.smsFormSubscription) { this.smsFormSubscription.unsubscribe(); }
        if (this.taskFormSubscription) { this.taskFormSubscription.unsubscribe(); }

    }

    saveEmail() {
        if (this.emailForm.valid && !this.isInvalidEmailBody) {
            this.emailModel.AssignedToStaffID = this.assignedToStaffID;
            this.saveActivity(StaffActivityApi.saveEmail, this.emailModel);
        }
        else {
            this.saveInProgress = false;
            if ((this.emailForm.form.controls["emailSubject"].errors && 
                this.emailForm.form.controls["emailSubject"].errors.required) || 
                (this.emailForm.form.controls["emailBody"].errors &&
                this.emailForm.form.controls["emailBody"].errors.required)) {
                this.showValidationMessage(true);
            }
        }
    }

    saveNote() {
        if (this.notesForm.valid) {
            this.noteModel.AssignedToStaffID = this.assignedToStaffID;
            this.saveActivity(StaffActivityApi.saveNote, this.noteModel);
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveSMS() {
        if (this.smsForm.valid) {
            this.smsModel.AssignedToStaffID = this.assignedToStaffID;
            this.saveActivity(StaffActivityApi.saveSMS, this.smsModel);
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveTask() {
        if (this.taskForm.valid && this.validateTaskModel()) {
            if (!this.isInvalidEndTime) {
                this.isInvalidEndTime = false;
                this.isInvalidFollowUpDate = false;
                this.taskModel.AssignedToStaffID = this.assignedToStaffID;
                let taskModelForSave = JSON.parse(JSON.stringify(this.taskModel));
                taskModelForSave.FollowUpDate = this._dateTimeService.convertDateObjToString(taskModelForSave.FollowUpDate, this.dateFormat);

                this.saveActivity(StaffActivityApi.saveTask, taskModelForSave);
            }
            else {
                this.saveInProgress = false;
            }
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    validateTaskModel() {
        let today = new Date();
        let isValid = true;
        today.setHours(0, 0, 0, 0);
        // if (new Date(this.taskModel.FollowUpDate) < today) {
        //     this.isInvalidFollowUpDate = true;
        //     isValid = false;
        // }

        if (!this.taskModel.FollowUpStartTime || this.taskModel.FollowUpStartTime == '') {
            isValid = false;
        }

        if (!this.taskModel.FollowUpEndTime || this.taskModel.FollowUpEndTime == '') {
            isValid = false;
        }

        else if (this.taskModel.FollowUpEndTime > this.taskModel.FollowUpStartTime) {
            this.isInvalidEndTime = false;
        }
        else {
            this.isInvalidEndTime = true;
            isValid = false;
        }

        //  if (this._dateTimeService.convertDateObjToString(this.taskModel.FollowUpDate, this.dateFormat) == this._dateTimeService.convertDateObjToString(this.currentDateTime, this.dateFormat)) {
        //      if (this._dateTimeService.getTimeDifferenceFromTimeString(this._dateTimeService.getTimeStringFromDate(this.currentDateTime,this.timeFormat), this.taskModel.FollowUpStartTime) < 0) {
        //        this.isInvalidStartTime = true;
        //   }
        // }

        return isValid;
    }

    saveActivity(url: string, model: any) {
        let shouldClosePopup = true;
        //call to service
        this._httpService.save(url, model)
            .subscribe(
                res => {
                    if (res && res.MessageCode) {
                        if (res.MessageCode > 0) {
                            this.activitySaved.emit(true);
                            this._dataSharingService.shareUpdateActivityCount(true);

                            if (this.activeTab === this.activityTypes.SMS || this.activeTab === this.activityTypes.Email) {
                                this._messageService.showSuccessMessage(this.messages.Success.Sent_Success.replace("{0}", this.activeTab));
                            }
                            else {
                                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", this.activeTab));
                            }
                            
                            this.closePopup(shouldClosePopup);

                            this.saveInProgress = false;
                        }
                        else {
                            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", this.activeTab));
                            this.saveInProgress = false;
                        }
                    }

                },
                error => {
                    this.activitySaved.emit(false);
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", this.activeTab));
                    this.saveInProgress = false;
                }
            );
    }

    resetAllForms() {
        if (this.taskForm && this.taskForm.form) {
            this.taskForm.form.reset();
        }

        if (this.notesForm && this.notesForm.form) {
            this.notesForm.form.reset();
        }

        if (this.smsForm && this.smsForm.form) {
            this.smsForm.form.reset();
        }

        if (this.emailForm && this.emailForm.form) {
            this.emailForm.form.reset();
        }

    }

    // #endregion

    // #region Helping Methods

    showValidationMessage(isVisible: boolean) {
        this.isInvalidData = isVisible;
    }

    closePopup(shouldClosePopup: boolean) {
        if (shouldClosePopup) {
            this.onClosePopup();
        }
    }

    getTimeStringFromDate(dateValue: Date, timeFormat: string) {
        return this._dateTimeService.getTimeStringFromDate(dateValue, timeFormat);
    }

    getDateString(dateValue: Date, dateFormat: string) {
        return this._dateTimeService.convertDateObjToString(dateValue, dateFormat);
    }

    getTimeDifferenceFromDateString(timeStart: string, timeEnd: string): number {
        return this._dateTimeService.getTimeDifferenceFromTimeString(timeStart, timeEnd);
    }

    setFollowUpDate(followUpDate: any, time: string) {
        return this._dateTimeService.convertTimeStringToDateTime(time, followUpDate);
    }

    setEndDateInterval(startDateTime: Date) {
        let endTime = startDateTime.getMinutes() + 15;
        startDateTime.setMinutes(endTime)
        return startDateTime;
    }

    // #endregion
}