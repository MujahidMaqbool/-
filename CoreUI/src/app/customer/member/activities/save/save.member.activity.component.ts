// #region Imports 

/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild, Output, EventEmitter, Inject, OnDestroy } from '@angular/core';
import { NgForm, FormControl } from "@angular/forms";
import { DatePipe } from '@angular/common';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubscriptionLike as ISubscription } from "rxjs";

/********************** Common *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { MemberActivityApi } from 'src/app/helper/config/app.webapi';

/********************** Components *********************/


/********************** Services & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';

/* Models */
import {
    MemberContactReasonType,
    AppointmentActivity,
    AppointmentNowActivity,
    AppointmentLaterActivity,
    CallActivity,
    CallNowActivity,
    CallLaterActivity,
    NoteActivity,
    EmailActivity,
    SMSActivity,
    MemberMessage,
    AchievementActivity,
    MemberAppNotification,
    MemberActivityTabOptions,
    CallMarkAsDoneActivity,
    AppointmentMarkAsDoneActivity
} from 'src/app/customer/member/models/member.activity.model';

import {
    ActivityOutcome,
    PriorityType,
    WhatNext,
    Template,
    Staff,
    ActivityPersonInfo
} from 'src/app/models/activity.model';
import { Messages } from 'src/app/helper/config/app.messages';
import { ENU_ActivityType, ENU_ActivitySubType, TemplateType, ENU_ModuleList, WhatNextType, ActivityOutcomeType, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { ApiResponse } from 'src/app/models/common.model';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { OneDaySchedulerComponent } from 'src/app/shared/components/scheduler/one.day.scheduler.component';


// #endregion 

@Component({
    selector: 'save-member-activity',
    templateUrl: './save.member.activity.component.html'
})
export class SaveMemberActivityComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    // #region Local Members 
    dayViewFormat: string = "";

    @Output()
    activitySaved = new EventEmitter<boolean>();

    @Output()
    openAddAppointment = new EventEmitter<boolean>();

    @Output()
    openAddCall = new EventEmitter<boolean>();

    /* Activity Form References*/
    @ViewChild('appointmentForm') appointmentForm: NgForm;
    @ViewChild('callForm') callForm: NgForm;
    @ViewChild('emailForm') emailForm: NgForm;
    @ViewChild('noteForm') notesForm: NgForm;
    @ViewChild('smsForm') smsForm: NgForm;
    @ViewChild('memberMessageForm') memberMessageForm: NgForm;
    @ViewChild('achievementForm') achievementForm: NgForm;
    @ViewChild('appNotificationForm') appNotificationForm: NgForm;

    @ViewChild('onedaySchedulerCallComp') onedaySchedulerCallComp: OneDaySchedulerComponent;
    @ViewChild('onedaySchedulerAppointmentComp') onedaySchedulerAppointmentComp: OneDaySchedulerComponent;

    /* Activity Model References */
    appointmentModel: AppointmentActivity;
    appointmentNowModel: AppointmentNowActivity;
    appointmentLaterModel: AppointmentLaterActivity;
    callModel: CallActivity;
    callNowModel: CallNowActivity;
    callLaterModel: CallLaterActivity;
    emailModel: EmailActivity;
    noteModel: NoteActivity;
    smsModel: SMSActivity;
    memberMessageModel: MemberMessage;
    achievementModel: AchievementActivity;
    appNotificationModel: MemberAppNotification;

    loggedInStaffSubscription: ISubscription;
    memberIdSubscription: ISubscription;
    memberEmailSubscription: ISubscription;
    callFormSubscription: ISubscription;
    appointmentFormSubscription: ISubscription;
    emailFormSubscription: ISubscription;
    noteFormSubscription: ISubscription;
    achievementFormSubscription: ISubscription;
    messageFormSubscription: ISubscription;
    smsFormSubscription: ISubscription;
    appNotificationSubscription: ISubscription;

    personInfo: ActivityPersonInfo;
    personInfoSubscription: ISubscription;

    /* Local members */
    loggedInStaffID: number;
    memberID: number;
    memberEmail: string;
    assignedTo = new FormControl();
    minDate: Date = new Date();
    schedulerMinDate: Date = new Date();
    schedulerMaxDate: Date = new Date();
    schedulerStartTime: Date = new Date();
    schedulerMinStartTime: Date = new Date();
    schedulerEndTime: Date = new Date();
    currentDateTime: Date = new Date();
    activeTab: string;
    activeTabIndex: number = 0;
    isInvalidData: boolean = false;
    hasError: boolean = false;
    hasSuccess: boolean = false;
    templateTypeId: number;
    emailAddress: string;
    selectedTemplate: any;
    isAppointmentLostReasonRequired: boolean = false;
    isAppointmentTrialEndRequired: boolean = false;
    isCallLostReasonRequired: boolean = false;
    redirectToLeadSearch: boolean = false;
    isInvalidEndTime: boolean = false;
    isInvalidStartTime: boolean = false;
    isActiveTabEmailOrSMS: boolean = false;
    isInvalidEmailBody: boolean = false;
    saveInProgress: boolean = false;
    isInvalidFollowUpDate: boolean = false;

    currentCallDate: Date;
    currentAppointmentDate: Date;

    /* Collection Types */
    priorityTypeList: PriorityType[];
    templateTextList: Template[];
    staffList: Staff[];
    memberContactReasonTypeList: MemberContactReasonType[];
    outcomeList: ActivityOutcome[];
    whatNextList: WhatNext[];
    activeTabs: string[];

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
    activitySubType = ENU_ActivitySubType;
    templateType = TemplateType;
    modules = ENU_ModuleList;
    outcomeType = ActivityOutcomeType;
    whatNext = WhatNextType;
    durationList = Configurations.DurationList;
    tepmplateVariableList = Configurations.TemplateVariableList;
    emailMaxLength = Configurations.EmailMaxLength;

    // #endregion 

    constructor(
        private _dateFilter: DatePipe,
        private _activityService: HttpService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        public dialogRef: MatDialogRef<SaveMemberActivityComponent>,
        @Inject(MAT_DIALOG_DATA) public tabsOptions: MemberActivityTabOptions) {
        super();

    }

    ngOnInit() {
        this.getBranchDatePattern();
    }

    ngOnDestroy() {
        this.loggedInStaffSubscription.unsubscribe();
        this.memberEmailSubscription.unsubscribe();
        this.memberIdSubscription.unsubscribe();
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
        this.hasError = false;
        this.hasSuccess = false;
        this.showValidationMessage(false);

        switch (this.activeTab) {
            case this.activityTypes.Achievements: {
                // Save Achievement
                this.saveAchievement();
                break;
            }
            case this.activityTypes.Appointment:
            case this.activityTypes.FollowupAppointment: {
                // Save Appointment                
                this.saveAppointment();
                break;
            }
            case this.activityTypes.Call:
            case this.activityTypes.FollowupCall: {
                // Save Call
                this.saveCall();
                break;
            }
            case this.activityTypes.Email: {
                // Save Email
                this.saveEmail();
                break;
            }
            case this.activityTypes.MemberMessage: {
                // Save Note
                this.saveMemberMessage();
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
            case this.activityTypes.AppNotification: {
                // Save App Notificatoin
                this.saveAppNotification();
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
                if (this.activeTab === this.activityTypes.AppNotification) {
                    this.setTemplateForAppNotification(template);
                }
                else if (this.activeTab === this.activityTypes.SMS) {
                    this.setTemplateForSMS(template);
                }
            }
        }
    }

    onAppointmentChangeToNow() {
        if (this.appointmentModel.IsNow) {
            this.appointmentModel.AssignedToStaffID = this.loggedInStaffID;
            this.setSchdeulerMinMaxDate();
            this.currentAppointmentDate = this.currentDateTime;
            this.appointmentModel.FollowUpDate = this.currentDateTime;
        }
        else {
            this.resetSchdeulerMinMaxDate();
        }
    }

    onAppointmentDateChange(newDate: Date) {
        // this.appointmentModel.FollowUpDate = newDate;
        // this.appointmentModel.Date = this.getDateString(newDate, this.dateFormat);
    }

    onSelectDateCallValueChanged(startDate: Date) {
        startDate = new Date(startDate);
        this.callModel.FollowUpDate = startDate;
    }

    onSelectDateAppointmentValueChanged(startDate: Date) {
        startDate = new Date(startDate);
        this.appointmentModel.FollowUpDate = startDate;
    }

    onAppointmentStartTimeChanged(event: any) {
        if (event && event.value) {
            this.appointmentModel.FollowUpStartTime = this.getTimeStringFromDate(event.value, this.timeFormat);
            this.schedulerEndTime = this.setEndDateInterval(event.value);
            this.appointmentModel.FollowUpEndTime = this.getTimeStringFromDate(this.schedulerEndTime, this.timeFormat);
            this.isInvalidStartTime = false;
        }
        else {
            this.appointmentModel.FollowUpStartTime = null;
        }
    }

    onAppointmentEndTimeChanged(event: any) {
        if (event && event.value) {
            this.appointmentModel.FollowUpEndTime = this.getTimeStringFromDate(event.value, this.timeFormat);

            if (this.appointmentModel.FollowUpEndTime > this.appointmentModel.FollowUpStartTime) {
                this.isInvalidEndTime = false;
                this.isInvalidData = false;
            }
        }
        else {
            this.appointmentModel.FollowUpEndTime = null;
        }
    }

    onCallChangeToNow() {
        if (this.callModel.IsNow) {
            this.callModel.AssignedToStaffID = this.loggedInStaffID;
            this.setSchdeulerMinMaxDate();
            this.currentCallDate = this.currentDateTime;
            this.callModel.FollowUpDate = this.currentDateTime;
        }
        else {
            this.resetSchdeulerMinMaxDate();
        }
    }

    onCallDateChange(newDate: Date) {
        this.callModel.FollowUpDate = newDate;
        this.callModel.Date = this.getDateString(newDate, this.dateFormat);
    }

    onCallStartTimeChanged(event: any) {
        if (event && event.value) {
            this.callModel.FollowUpStartTime = this.getTimeStringFromDate(event.value, this.timeFormat);
            this.schedulerEndTime = this.setEndDateInterval(event.value);
            this.callModel.FollowUpEndTime = this.getTimeStringFromDate(this.schedulerEndTime, this.timeFormat);
            this.isInvalidStartTime = false;
        }
        else {
            this.callModel.FollowUpStartTime = null;
        }
    }

    onCallEndTimeChanged(event: any) {
        if (event && event.value) {
            this.callModel.FollowUpEndTime = this.getTimeStringFromDate(event.value, this.timeFormat);

            if (this.callModel.FollowUpEndTime > this.callModel.FollowUpStartTime) {
                this.isInvalidEndTime = false;
                this.isInvalidData = false;
            }
        }
        else {
            this.callModel.FollowUpEndTime = null;
        }
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

    // #endregion

    // #region Methods 

    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);

        //get branch date time added by fahad for browser different time zone issue resolving
        this.currentDateTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.schedulerMinDate = this.currentDateTime;
        this.schedulerMaxDate = this.schedulerMinDate;

        this.currentCallDate = this.currentDateTime;
        this.currentAppointmentDate = this.currentDateTime;
        this.appointmentModel = new AppointmentActivity();
        this.appointmentNowModel = new AppointmentNowActivity();
        this.appointmentLaterModel = new AppointmentLaterActivity();
        this.callModel = new CallActivity();
        this.callNowModel = new CallNowActivity();
        this.callLaterModel = new CallLaterActivity();
        this.noteModel = new NoteActivity();
        this.emailModel = new EmailActivity();
        this.smsModel = new SMSActivity();
        this.memberMessageModel = new MemberMessage();
        this.appNotificationModel = new MemberAppNotification();
        this.achievementModel = new AchievementActivity();

        this.schedulerEndTime.setMinutes(this.schedulerStartTime.getMinutes() + 30);
        this.personInfoSubscription = this._dataSharingService.activityPersonInfo.subscribe((personInfo: ActivityPersonInfo) => {
            if (personInfo) {
                this.personInfo = personInfo;
            }
        });
        setTimeout(async () => {
            this.activeTabs = this.tabsOptions.activeTabs;

            /* Commented to disable 'Show the same tab in Add Activity which was active in Search Activity '*/
            // this.activeTab = !this.tabsOptions.defaultActiveTab || this.tabsOptions.defaultActiveTab === this.activityTypes.All
            //                     ? this.tabsOptions.activeTabs[0] : this.tabsOptions.defaultActiveTab;

            this.activeTab = this.tabsOptions.activeTabs[0];

            //get branch date time added by fahad for browser different time zone issue resolving
            this.callModel.FollowUpDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
            this.appointmentModel.FollowUpDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

            if (this.tabsOptions.isEditMode) {
                this.setModelForEdit();
            }

            this.loggedInStaffSubscription = this._dataSharingService.loggedInStaffID.subscribe((staffId: number) => {
                this.loggedInStaffID = staffId;
            });

            this.memberIdSubscription = this._dataSharingService.memberID.subscribe((memberId: number) => {
                this.memberID = memberId;
            });

            this.memberEmailSubscription = this._dataSharingService.memberEmail.subscribe((memberEmail: string) => {
                this.memberEmail = memberEmail;
            });

            await this.setTemplateTypeId();
            await this.subscribeToFormChanges();

        }, 500);
        this.emailMaxLengthMessage = Messages.Validation.Email_MaxLength.replace("{0}", this.emailMaxLength.toString());
    }

    setModelForEdit() {
        switch (this.activeTab) {
            case this.activityTypes.Appointment: {
                this.setEditAppointmentModel();
                break;
            }
            case this.activityTypes.FollowupAppointment: {
                this.appointmentModel.IsNow = false;
                this.resetSchdeulerMinMaxDate();
                break;
            }
            case this.activityTypes.Call: {
                this.setEditCallModel();
                break;
            }
            case this.activityTypes.FollowupCall: {
                this.callModel.IsNow = false;
                this.resetSchdeulerMinMaxDate();
                break;
            }
            case this.activityTypes.Note: {
                this.setEditNoteModel();
                break;
            }
            case this.activityTypes.MemberMessage: {
                this.setEditMemberMessageModel();
                break;
            }
            case this.activityTypes.Achievements: {
                this.setEditAchievementModel();
                break;
            }
        }
    }

    setEditAppointmentModel() {
        this.appointmentModel = Object.assign({}, this.tabsOptions.modelData);

        //remove zone from date added by fahad for browser different time zone issue resolving
        this.appointmentModel.FollowUpDate = this._dateTimeService.removeZoneFromDateTime(this.appointmentModel.FollowUpDate);

        if (this.tabsOptions.isMarkAsDone) {
            // Prepare for appointment Mark As Done Mode
            this.appointmentModel.IsNow = true;
            if (new Date(this.appointmentModel.FollowUpDate) >= this.currentDateTime) {
                this.appointmentModel.FollowUpDate = this.currentDateTime;
                this.setSchdeulerMinMaxDate();
            }

            else if (new Date(this.appointmentModel.FollowUpDate) < this.currentDateTime) {
                this.schedulerMinDate = this.appointmentModel.FollowUpDate;
                this.schedulerMaxDate = this.currentDateTime;
            }
        }
        else {
            // Prepare for appointment Edit Mode
            this.resetSchdeulerMinMaxDate();
            this.appointmentModel.IsNow = this.appointmentModel.ActivitySubTypeID == 3 ? true : false;
            this.appointmentModel.FollowUpDate = this.appointmentModel.FollowUpStartTime ? this.setFollowupDate(this.appointmentModel.FollowUpDate, this.appointmentModel.FollowUpStartTime) : this.appointmentModel.FollowUpDate;
            this.appointmentModel.Date = this.getDateString(this.appointmentModel.FollowUpDate, this.dateFormat);

            if (this.appointmentModel.FollowUpStartTime) {
                this.schedulerStartTime = this.setFollowupDate(this.appointmentModel.FollowUpDate, this.appointmentModel.FollowUpStartTime);
            }
            if (this.appointmentModel.FollowUpEndTime) {
                this.schedulerEndTime = this.setFollowupDate(this.appointmentModel.FollowUpDate, this.appointmentModel.FollowUpEndTime);
            }
        }
    }

    setEditCallModel() {
        this.callModel = Object.assign({}, this.tabsOptions.modelData);

        //remove zone from date added by fahad for browser different time zone issue resolving
        this.callModel.FollowUpDate = this._dateTimeService.removeZoneFromDateTime(this.callModel.FollowUpDate);

        if (this.tabsOptions.isMarkAsDone) {
            // Prepare for call Mark As Done Mode
            this.callModel.IsNow = true;

            if (new Date(this.callModel.FollowUpDate) >= this.currentDateTime) {
                this.callModel.FollowUpDate = this.currentDateTime;
                this.setSchdeulerMinMaxDate();
            }

            // else if (new Date(this.callModel.FollowUpDate) > this.currentDateTime) {
            //     this.schedulerMinDate = this.currentDateTime;
            //     this.schedulerMaxDate = this.callModel.FollowUpDate;
            // }

            else if (new Date(this.callModel.FollowUpDate) < this.currentDateTime) {
                this.schedulerMinDate = this.callModel.FollowUpDate;
                this.schedulerMaxDate = this.currentDateTime;
            }
        }
        else {
            // Prepare for call Edit Mode
            this.resetSchdeulerMinMaxDate();
            this.callModel.IsNow = this.callModel.ActivitySubTypeID == 3 ? true : false;
            this.callModel.FollowUpDate = this.callModel.FollowUpStartTime ? this.setFollowupDate(this.callModel.FollowUpDate, this.callModel.FollowUpStartTime) : this.callModel.FollowUpDate;
            this.callModel.Date = this.getDateString(this.callModel.FollowUpDate, this.dateFormat);

            if (this.callModel.FollowUpStartTime) {
                this.schedulerStartTime = this.setFollowupDate(this.callModel.FollowUpDate, this.callModel.FollowUpStartTime);
            }
            if (this.callModel.FollowUpEndTime) {
                this.schedulerEndTime = this.setFollowupDate(this.callModel.FollowUpDate, this.callModel.FollowUpEndTime);
            }
        }
    }

    setEditNoteModel() {
        this.noteModel = Object.assign({}, this.tabsOptions.modelData);
    }

    setEditMemberMessageModel() {
        this.memberMessageModel = Object.assign({}, this.tabsOptions.modelData);
    }

    setEditAchievementModel() {
        this.achievementModel = Object.assign({}, this.tabsOptions.modelData);
    }

    setTemplateTypeId() {
        if (this.activeTab === this.activityTypes.Email) {
            this.templateTypeId = this.templateType.Email;

        }
        else if (this.activeTab === this.activityTypes.SMS) {
            this.templateTypeId = this.templateType.SMS;
        }
        else if (this.activeTab === this.activityTypes.AppNotification) {
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

    getAppointmentFundamentals() {
        this.staffList = [];
        this.whatNextList = [];
        this.memberContactReasonTypeList = [];
        this._activityService.get(MemberActivityApi.getAppointmentFundamentals)
            .subscribe(
                (res: ApiResponse) => {
                    // Set fundamentals
                    if (res && res.MessageCode > 0) {
                        this.whatNextList = res.Result.ActivityWhatNextList;
                        this.staffList = res.Result.StaffList;
                        this.memberContactReasonTypeList = res.Result.ContactReasonTypeList;

                        this.setAppointmentDropdowns();
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
            )
    }

    setAppointmentDropdowns() {
        this.appointmentModel.Duration = this.appointmentModel.Duration ? this.appointmentModel.Duration : this.durationList[0].value;

        if (this.staffList && this.staffList.length > 0) {
            if (!this.appointmentModel.AssignedToStaffID || this.appointmentModel.AssignedToStaffID <= 0) {
                if (this.appointmentModel.IsNow) {
                    this.appointmentModel.AssignedToStaffID = this.loggedInStaffID;
                }
                else {
                    this.appointmentModel.AssignedToStaffID = this.staffList[0].StaffID;
                }
            }
        }

        if (this.whatNextList && this.whatNextList.length > 0) {
            if (!this.appointmentModel.ActivityWhatNextID || this.appointmentModel.ActivityWhatNextID <= 0) {
                this.appointmentModel.ActivityWhatNextID = this.whatNextList[0].ActivityWhatNextID;
            }
        }

        if (this.memberContactReasonTypeList && this.memberContactReasonTypeList.length > 0) {
            if (!this.appointmentModel.ContactReasonTypeID || this.appointmentModel.ContactReasonTypeID <= 0) {
                this.appointmentModel.ContactReasonTypeID = this.memberContactReasonTypeList[0].ContactReasonTypeID;
            }
        }
    }

    getCallFundamentals() {
        this.staffList = [];
        this.memberContactReasonTypeList = [];
        this.outcomeList = [];
        this.whatNextList = [];

        this._activityService.get(MemberActivityApi.getCallFundamentals)
            .subscribe(
                (res: ApiResponse) => {
                    // Set fundamentals
                    if (res && res.MessageCode > 0) {
                        this.staffList = res.Result.StaffList;
                        this.memberContactReasonTypeList = res.Result.ContactReasonTypeList;
                        this.outcomeList = res.Result.ActivityOutcomeList;
                        this.whatNextList = res.Result.ActivityWhatNextList;

                        this.setCallDropdowns();
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
            )
    }

    setCallDropdowns() {

        this.callModel.Duration = this.callModel.Duration ? this.callModel.Duration : this.durationList[0].value;

        if (this.staffList && this.staffList.length > 0) {
            if (!this.callModel.AssignedToStaffID || this.callModel.AssignedToStaffID <= 0) {
                if (this.callModel.IsNow) {
                    this.callModel.AssignedToStaffID = this.loggedInStaffID;
                }
                else {
                    this.callModel.AssignedToStaffID = this.staffList[0].StaffID;
                }
            }
        }

        if (this.outcomeList && this.outcomeList.length > 0) {
            if (!this.callModel.ActivityOutcomeID || this.callModel.ActivityOutcomeID <= 0) {
                this.callModel.ActivityOutcomeID = this.outcomeList[0].ActivityOutcomeID;
            }
        }

        if (this.whatNextList && this.whatNextList.length > 0) {
            if (!this.callModel.ActivityWhatNextID || this.callModel.ActivityWhatNextID <= 0) {
                this.callModel.ActivityWhatNextID = this.whatNextList[0].ActivityWhatNextID;
            }
        }

        if (this.memberContactReasonTypeList && this.memberContactReasonTypeList.length > 0) {
            if (!this.callModel.ContactReasonTypeID || this.callModel.ContactReasonTypeID <= 0) {
                this.callModel.ContactReasonTypeID = this.memberContactReasonTypeList[0].ContactReasonTypeID;
            }
        }
    }

    getTemplateFundamentals(templateTypeId: number) {
        let url = MemberActivityApi.getTemplateFundamentals + templateTypeId;
        this._activityService.get(url).subscribe(
            (res: ApiResponse) => {
                // Set fundamentals
                if (res && res.MessageCode > 0) {
                    this.templateTextList = res.Result.TemplateTextList;
                    this.memberContactReasonTypeList = res.Result.ContactReasonTypeList;

                    this.setEmailOrSMSDropdowns();
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
        );
    }

    setEmailOrSMSDropdowns() {
        this.templateTextList.splice(0, 0, { TemplateTextID: null, TemplateTextTitle: "No Template" });
        this.selectedTemplate = this.templateTextList[0];

        if (this.memberContactReasonTypeList && this.memberContactReasonTypeList.length > 0) {
            if (this.templateTypeId === this.templateType.Email) {
                if (!this.emailModel.ContactReasonTypeID || this.emailModel.ContactReasonTypeID <= 0) {
                    this.emailModel.ContactReasonTypeID = this.memberContactReasonTypeList[0].ContactReasonTypeID;
                }
            }

            if (this.templateTypeId === this.templateType.SMS) {
                if (this.activeTab === this.activityTypes.SMS && (!this.smsModel.ContactReasonTypeID || this.smsModel.ContactReasonTypeID <= 0)) {
                    this.smsModel.ContactReasonTypeID = this.memberContactReasonTypeList[0].ContactReasonTypeID;
                }

                else if (this.activeTab === this.activityTypes.AppNotification && (!this.appNotificationModel.ContactReasonTypeID || this.appNotificationModel.ContactReasonTypeID <= 0)) {
                    this.appNotificationModel.ContactReasonTypeID = this.memberContactReasonTypeList[0].ContactReasonTypeID;
                }
            }
        }
    }

    getTemplateDescription(templateTextId: number, templateTypeId: number): any {
        let url = MemberActivityApi.getTemplateDescription.replace("{templateTextID}", templateTextId.toString())
            .replace("{templateTypeID}", templateTypeId.toString())
            .replace("{cutomerID}", this.memberID.toString());
        return this._activityService.get(url);
    }

    setTemplateForAppNotification(template: Template) {
        if (template && template.TemplateTextID > 0) {
            let templateDescription = this.getTemplateDescription(template.TemplateTextID, this.templateTypeId);

            if (templateDescription) {
                templateDescription.subscribe((res: ApiResponse) => {
                    if (res && res.MessageCode > 0 && res.Result.TemplateText) {
                        this.appNotificationModel.Title = template.TemplateTextTitle;
                        this.appNotificationModel.Description = this.replaceTemplateVariables(res.Result.TemplateText.TemplateTextDescription);
                        this.appNotificationModel.TemplateTextID = template.TemplateTextID;
                    }
                });
            }
        }
        else {
            this.appNotificationModel.TemplateTextID = null;
            this.appNotificationModel.Title = "";
            this.appNotificationModel.Description = "";
        }
    }

    setTemplateForSMS(template: Template) {
        if (template && template.TemplateTextID > 0) {
            let templateDescription = this.getTemplateDescription(template.TemplateTextID, this.templateTypeId);

            if (templateDescription) {
                templateDescription.subscribe((res: ApiResponse) => {
                    if (res && res.MessageCode > 0 && res.Result.TemplateText) {
                        this.smsModel.Title = template.TemplateTextTitle;
                        this.smsModel.Description = this.replaceTemplateVariables(res.Result.TemplateText.TemplateTextDescription);
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
                templateDescription.subscribe((res: ApiResponse) => {
                    if (res && res.Result && res.Result.TemplateText) {
                        this.emailModel.EmailSubject = res.Result.TemplateText.TemplateTextEmailSubject;
                        this.emailModel.EmailBody = this.replaceTemplateVariables(res.Result.TemplateText.TemplateTextDescription);
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
                    if (templateVar === "[Member Name]") {
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
        //this.unSubscribeFormChanges();

        switch (this.activeTab) {
            case this.activityTypes.Achievements: {
                this.achievementFormSubscription = this.achievementForm.valueChanges.subscribe(() => {
                    if (this.achievementForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = false;
                break;
            }
            case this.activityTypes.Appointment:
            case this.activityTypes.FollowupAppointment: {
                setTimeout(() => {
                    this.getAppointmentFundamentals();
                    this.appointmentModel.FollowUpStartTime = this.getTimeStringFromDate(this.schedulerStartTime, this.timeFormat);
                    this.appointmentModel.FollowUpEndTime = this.getTimeStringFromDate(this.schedulerEndTime, this.timeFormat);
                });
                this.appointmentFormSubscription = this.appointmentForm.valueChanges.subscribe(() => {
                    if (this.appointmentForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = false;
                break;
            }
            case this.activityTypes.Call:
            case this.activityTypes.FollowupCall: {
                setTimeout(() => {
                    this.getCallFundamentals();
                    this.callModel.FollowUpStartTime = this.getTimeStringFromDate(this.schedulerStartTime, this.timeFormat);
                    this.callModel.FollowUpEndTime = this.getTimeStringFromDate(this.schedulerEndTime, this.timeFormat);
                });
                this.callFormSubscription = this.callForm.valueChanges.subscribe(() => {
                    if (this.callForm.valid) {
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
            case this.activityTypes.MemberMessage: {
                this.messageFormSubscription = this.memberMessageForm.valueChanges.subscribe(() => {
                    if (this.memberMessageForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = false;
                break;
            }
            case this.activityTypes.AppNotification: {
                this.appNotificationSubscription = this.appNotificationForm.valueChanges.subscribe(() => {
                    if (this.appNotificationForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = true;
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
        if (this.callFormSubscription) { this.callFormSubscription.unsubscribe(); }
        if (this.appointmentFormSubscription) { this.appointmentFormSubscription.unsubscribe(); }
        if (this.emailFormSubscription) { this.emailFormSubscription.unsubscribe(); }
        if (this.noteFormSubscription) { this.noteFormSubscription.unsubscribe(); }
        if (this.appNotificationSubscription) { this.appNotificationSubscription.unsubscribe(); }
        if (this.messageFormSubscription) { this.messageFormSubscription.unsubscribe(); }
        if (this.achievementFormSubscription) { this.achievementFormSubscription.unsubscribe(); }
        if (this.smsFormSubscription) { this.smsFormSubscription.unsubscribe(); }
    }

    saveAchievement() {
        if (this.achievementForm.valid) {
            this.achievementModel.CustomerID = this.memberID;
            this.saveActivity(MemberActivityApi.saveAchievement, this.achievementModel);
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveAppointment() {
        if (this.appointmentModel.IsNow) {
            if (this.tabsOptions.isMarkAsDone) {
                this.saveAppointmentMarkAsDone();
            }
            else {
                this.saveAppointmentNow();
            }
        }
        else {
            if (this.appointmentModel.ActivitySubTypeID == this.activitySubType.Now) {
                this.saveAppointmentNow();
            } else {
                this.saveAppointmentLater();
            }
        }
    }

    saveAppointmentNow() {
        this.setAppointmentNowModel();
        if (this.validateAppointmentNowModel()) {
            this.saveActivity(MemberActivityApi.saveAppointmentNow, this.appointmentNowModel, this.activityType.Appointment);
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveAppointmentLater() {
        this.setAppointmentLaterModel();
        if (!this.validateAppointmentLaterModel()) {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
        else if (!this.isInvalidEndTime && !this.isInvalidStartTime) {
            this.saveActivity(MemberActivityApi.saveAppointmentLater, this.appointmentLaterModel);
        }
        else {
            this.saveInProgress = false;
        }
    }

    saveAppointmentMarkAsDone() {
        this.setAppointmentNowModel();
        if (this.validateAppointmentNowModel()) {
            this.saveActivity(MemberActivityApi.saveAppointmentMarkAsDone, this.setAppointmentMarkAsDoneModel(), this.activityType.Appointment);
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveCall() {
        if (this.callModel.IsNow) {
            if (this.tabsOptions.isMarkAsDone) {
                this.saveCallMarkAsDone();
            }
            else {
                this.saveCallNow();
            }
        }
        else {
            if (this.callModel.ActivitySubTypeID == this.activitySubType.Now) {
                this.saveCallNow();
            } else {
                this.saveCallLater();
            }
        }
    }

    saveCallNow() {
        this.setCallNowModel();
        if (this.validateCallNowModel()) {
            this.saveActivity(MemberActivityApi.saveCallNow, this.callNowModel, this.activityType.Call);
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveCallLater() {
        this.setCallLaterModel();
        if (!this.validateCallLaterModel()) {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
        else if (!this.isInvalidEndTime && !this.isInvalidStartTime) {
            this.saveActivity(MemberActivityApi.saveCallLater, this.callLaterModel);
        }
        else {
            this.saveInProgress = false;
        }
    }

    saveCallMarkAsDone() {
        this.setCallNowModel();
        if (this.validateCallNowModel()) {
            this.saveActivity(MemberActivityApi.saveCallMarkAsDone, this.setCallMarkAsDoneModel(), this.activityType.Call);
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveEmail() {
        if (this.emailForm.valid && !this.isInvalidEmailBody) {
            this.emailModel.CustomerID = this.memberID;
            this.emailModel.ActivitySubTypeID = this.activitySubType.Outgoing;
            this.saveActivity(MemberActivityApi.saveEmail, this.emailModel);
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

    saveMemberMessage() {
        if (this.memberMessageForm.valid) {
            this.memberMessageModel.CustomerID = this.memberID;
            this.saveActivity(MemberActivityApi.saveMemberMessage, this.memberMessageModel);
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveNote() {
        if (this.notesForm.valid) {
            this.noteModel.CustomerID = this.memberID;
            this.saveActivity(MemberActivityApi.saveNote, this.noteModel);
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveSMS() {
        if (this.smsForm.valid) {
            this.smsModel.CustomerID = this.memberID;
            this.smsModel.ActivitySubTypeID = this.activitySubType.Outgoing;
            this.saveActivity(MemberActivityApi.saveSMS, this.smsModel);
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveAppNotification() {
        if (this.appNotificationForm.valid) {
            this.appNotificationModel.CustomerID = this.memberID;
            this.saveActivity(MemberActivityApi.saveAppNotification, this.appNotificationModel);
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveActivity(url: string, model: any, activityType?: number) {
        let shouldClosePopup = true;
        //call to service
        this._activityService.save(url, model)
            .subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.activitySaved.emit(true);
                        this._dataSharingService.shareUpdateActivityCount(true);

                        if (activityType && activityType === this.activityType.Call) {
                            shouldClosePopup = this.processCallAfterSave();
                        }

                        if (activityType && activityType === this.activityType.Appointment) {
                            shouldClosePopup = this.processAppointmentAfterSave();
                        }

                        if (this.activeTab === this.activityTypes.SMS || this.activeTab === this.activityTypes.Email) {
                            this._messageService.showSuccessMessage(this.messages.Success.Sent_Success.replace("{0}", this.activeTab));
                        }
                        else {
                            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", this.activeTab));
                        }

                        this.closePopup(shouldClosePopup);
                    }
                    else {
                        this.activitySaved.emit(false);
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", this.activeTab));
                    }
                },
                error => {
                    this.activitySaved.emit(false);
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", this.activeTab));
                }
            );
    }

    resetAllForms() {
        if (this.achievementForm && this.achievementForm.form) {
            this.achievementForm.form.reset();
        }

        if (this.appointmentForm && this.appointmentForm.form) {
            this.appointmentForm.form.reset();
            setTimeout(async () => {
                this.setSchdeulerMinMaxDate();
                this.appointmentModel = new AppointmentActivity();
                this.appointmentNowModel = new AppointmentNowActivity();
                this.appointmentLaterModel = new AppointmentLaterActivity();

                //get branch date time added by fahad for browser different time zone issue resolving
                this.appointmentModel.FollowUpDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
                this.appointmentNowModel.FollowUpDate = this._dateTimeService.getCurrentDateTimeAcordingToBranch().toString();
            });
        }

        if (this.callForm && this.callForm.form) {
            this.callForm.form.reset();
            setTimeout(async () => {
                this.setSchdeulerMinMaxDate();
                this.callModel = new CallActivity();
                this.callNowModel = new CallNowActivity();
                this.callLaterModel = new CallLaterActivity();

                //get branch date time added by fahad for browser different time zone issue resolving
                this.callModel.FollowUpDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
            });
        }

        if (this.emailForm && this.emailForm.form) {
            this.emailForm.form.reset();
        }

        if (this.memberMessageForm && this.memberMessageForm.form) {
            this.memberMessageForm.form.reset();
        }

        if (this.notesForm && this.notesForm.form) {
            this.notesForm.form.reset();
        }

        if (this.smsForm && this.smsForm.form) {
            this.smsForm.form.reset();
        }

        if (this.appNotificationForm && this.appNotificationForm.form) {
            this.appNotificationForm.form.reset();
        }
    }

    setAppointmentNowModel() {
        this.appointmentNowModel.CustomerActivityID = this.appointmentModel.CustomerActivityID;
        this.appointmentNowModel.Title = this.appointmentModel.Title;
        this.appointmentNowModel.Description = this.appointmentModel.Description ? this.appointmentModel.Description : '';
        this.appointmentNowModel.CustomerID = this.memberID;
        this.appointmentNowModel.ContactReasonTypeID = this.appointmentModel.ContactReasonTypeID;
        this.appointmentNowModel.ActivityWhatNextID = this.appointmentModel.ActivityWhatNextID;
        this.appointmentNowModel.FollowUpDate = this._dateTimeService.convertDateObjToString(this.appointmentModel.FollowUpDate, this.dateFormat);
        this.appointmentNowModel.ActivitySubTypeID = this.activitySubType.Now;
    }

    setAppointmentLaterModel() {
        this.appointmentLaterModel.CustomerActivityID = this.appointmentModel.CustomerActivityID;
        this.appointmentLaterModel.Title = this.appointmentModel.Title;
        this.appointmentLaterModel.Description = this.appointmentModel.Description;
        this.appointmentLaterModel.CustomerID = this.memberID;
        this.appointmentLaterModel.ContactReasonTypeID = this.appointmentModel.ContactReasonTypeID;
        this.appointmentLaterModel.AssignedToStaffID = this.appointmentModel.AssignedToStaffID;
        this.appointmentLaterModel.FollowUpDate = this._dateTimeService.convertDateObjToString(this.appointmentModel.FollowUpDate, this.dateFormat);
        this.appointmentLaterModel.FollowUpStartTime = this.appointmentModel.FollowUpStartTime;
        this.appointmentLaterModel.FollowUpEndTime = this.appointmentModel.FollowUpEndTime;
        this.appointmentLaterModel.ActivitySubTypeID = this.activitySubType.Scheduled;
    }


    setAppointmentMarkAsDoneModel() {
        let appointmentmarkAsDoneModel = new AppointmentMarkAsDoneActivity();
        appointmentmarkAsDoneModel.CustomerActivityID = this.appointmentModel.CustomerActivityID;
        appointmentmarkAsDoneModel.CustomerID = this.appointmentModel.CustomerID;
        appointmentmarkAsDoneModel.Title = this.appointmentModel.Title;
        appointmentmarkAsDoneModel.Description = this.appointmentModel.Description;
        appointmentmarkAsDoneModel.ContactReasonTypeID = this.appointmentModel.ContactReasonTypeID;
        appointmentmarkAsDoneModel.ActivityWhatNextID = this.appointmentModel.ActivityWhatNextID;
        appointmentmarkAsDoneModel.CompletionDate = this._dateTimeService.convertDateObjToString(this.appointmentModel.FollowUpDate, this.dateFormat);
        return appointmentmarkAsDoneModel;
    }


    validateAppointmentNowModel(): boolean {
        let isValid = true;

        if (!this.appointmentNowModel.Title || this.appointmentNowModel.Title == '') {
            isValid = false;
        }

        if (!this.appointmentNowModel.ActivityWhatNextID || this.appointmentNowModel.ActivityWhatNextID <= 0) {
            isValid = false;
        }

        return isValid;
    }

    validateAppointmentLaterModel(): boolean {
        let isValid = true;
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        this.isInvalidFollowUpDate = false;
        this.isInvalidEndTime = false;
        this.isInvalidStartTime = false;

        if (!this.appointmentLaterModel.Title || this.appointmentLaterModel.Title == '') {
            isValid = false;
        }

        if (!this.appointmentLaterModel.AssignedToStaffID || this.appointmentLaterModel.AssignedToStaffID <= 0) {
            isValid = false;
        }

        if (!this.appointmentLaterModel.FollowUpDate) {
            isValid = false;
        }
        //  else if (new Date(this.appointmentLaterModel.FollowUpDate) < today) {
        //      this.isInvalidFollowUpDate = true;
        //  }

        if (!this.appointmentLaterModel.FollowUpStartTime || this.appointmentLaterModel.FollowUpStartTime == '') {
            isValid = false;
        }

        if (!this.appointmentLaterModel.FollowUpEndTime || this.appointmentLaterModel.FollowUpEndTime == '') {
            isValid = false;
        }
        else if (this.appointmentLaterModel.FollowUpStartTime >= this.appointmentLaterModel.FollowUpEndTime) {
            this.isInvalidEndTime = true;
        }

        return isValid;
    }

    processAppointmentAfterSave() {
        let shouldClosePopup = true;
        if (this.appointmentModel.IsNow) {
            /*
                If WhatNext is Call
            */
            if (this.appointmentModel.ActivityWhatNextID === this.whatNext.Member_Apt_Call) {
                this.openAddCall.emit(true);
            }
            /*
                If WhatNext is Appointment
            */
            else if (this.appointmentModel.ActivityWhatNextID === this.whatNext.Member_Apt_Appointment) {
                this.openAddAppointment.emit(true);
            }
        }

        return shouldClosePopup;
    }

    setCallNowModel() {
        this.callNowModel.CustomerActivityID = this.callModel.CustomerActivityID;
        this.callNowModel.Title = this.callModel.Title;
        this.callNowModel.Description = this.callModel.Description;
        this.callNowModel.CustomerID = this.memberID;
        this.callNowModel.ContactReasonTypeID = this.callModel.ContactReasonTypeID;
        this.callNowModel.ActivityOutcomeID = this.callModel.ActivityOutcomeID;
        this.callNowModel.ActivityWhatNextID = null;
        this.callNowModel.ActivityWhatNextID = this.callModel.ActivityWhatNextID;
        this.callNowModel.FollowUpDate = this._dateTimeService.convertDateObjToString(this.callModel.FollowUpDate, this.dateFormat);
        this.callNowModel.ActivitySubTypeID = this.activitySubType.Now;
    }

    setCallMarkAsDoneModel() {
        let markAsDoneModel = new CallMarkAsDoneActivity();
        markAsDoneModel.CustomerActivityID = this.callModel.CustomerActivityID;
        markAsDoneModel.CustomerID = this.callModel.CustomerID;
        markAsDoneModel.Title = this.callModel.Title;
        markAsDoneModel.Description = this.callModel.Description;
        markAsDoneModel.ContactReasonTypeID = this.callModel.ContactReasonTypeID;
        markAsDoneModel.ActivityOutcomeID = this.callModel.ActivityOutcomeID;
        markAsDoneModel.ActivityWhatNextID = this.callModel.ActivityWhatNextID;
        markAsDoneModel.CompletionDate = this._dateTimeService.convertDateObjToString(this.callModel.FollowUpDate, this.dateFormat);

        return markAsDoneModel;
    }

    setCallLaterModel() {
        this.callLaterModel.CustomerActivityID = this.callModel.CustomerActivityID;
        this.callLaterModel.Title = this.callModel.Title;
        this.callLaterModel.Description = this.callModel.Description ? this.callModel.Description : '';
        this.callLaterModel.CustomerID = this.memberID;
        this.callLaterModel.ContactReasonTypeID = this.callModel.ContactReasonTypeID;
        this.callLaterModel.AssignedToStaffID = this.callModel.AssignedToStaffID;
        this.callLaterModel.FollowUpDate = this._dateTimeService.convertDateObjToString(this.callModel.FollowUpDate, this.dateFormat);
        this.callLaterModel.FollowUpStartTime = this.callModel.FollowUpStartTime;
        this.callLaterModel.FollowUpEndTime = this.callModel.FollowUpEndTime;
        this.callNowModel.ActivitySubTypeID = this.activitySubType.Scheduled;
    }

    validateCallNowModel(): boolean {
        let isValid = true;

        if (!this.callNowModel.Title || this.callNowModel.Title == '') {
            isValid = false;
        }

        if (!this.callNowModel.ActivityOutcomeID || this.callNowModel.ActivityOutcomeID <= 0) {
            isValid = false;
        }

        if (!this.callNowModel.ActivityWhatNextID || this.callNowModel.ActivityWhatNextID <= 0) {
            isValid = false;
        }

        return isValid;
    }

    validateCallLaterModel(): boolean {
        let isValid = true;
        this.isInvalidEndTime = false;

        if (!this.callLaterModel.Title || this.callLaterModel.Title == '') {
            isValid = false;
        }

        if (!this.callLaterModel.AssignedToStaffID || this.callLaterModel.AssignedToStaffID <= 0) {
            isValid = false;
        }

        if (!this.callLaterModel.FollowUpDate) {
            isValid = false;
        }

        if (!this.callLaterModel.FollowUpStartTime || this.callLaterModel.FollowUpStartTime == '') {
            isValid = false;
        }

        if (!this.callLaterModel.FollowUpEndTime || this.callLaterModel.FollowUpEndTime == '') {
            isValid = false;
        }
        else if (this.callLaterModel.FollowUpStartTime >= this.callLaterModel.FollowUpEndTime) {
            this.isInvalidEndTime = true;
        }

        return isValid;
    }

    processCallAfterSave() {
        let shouldClosePopup = true;
        if (this.callModel.IsNow) {
            /*
                If What Next is Followup Call
            */
            if (this.callModel.ActivityWhatNextID === this.whatNext.Member_Call) {
                this.openAddCall.emit(true);
            }

            /*
                If What Next is Appointment
            */
            else if (this.callModel.ActivityWhatNextID === this.whatNext.Member_Appointment) {
                this.openAddAppointment.emit(true);
            }
        }

        return shouldClosePopup;
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
        return this._dateFilter.transform(dateValue, timeFormat);
    }

    getDateString(dateValue: Date, dateFormat: string) {
        return this._dateFilter.transform(dateValue, dateFormat);
    }

    getTimeDifferenceFromDateString(timeStart: string, timeEnd: string): number {
        let minutes = 0

        var startDate = new Date("2/16/2018 " + timeStart);
        var endDate = new Date("2/16/2018 " + timeEnd);

        /*
            EndDateTime - StartDateTime = Milliseconds
            Milliseconds Divide by 1000 to convert in Seconds
            Seconds Divide by 60 to convert in Minutes
           .subscribe parseInt to get Whole Number in minutes
        */

        minutes = parseInt((((endDate.getTime() - startDate.getTime()) / 1000) / 60).toString());

        return minutes

    }

    setFollowupDate(FollowUpDate: any, time: string) {
        let date = new Date(FollowUpDate);

        let timeArr = time.split(":");
        date.setHours(parseInt(timeArr[0]), parseInt(timeArr[1]));

        return date
    }

    setEndDateInterval(startDateTime: Date) {
        let endTime = startDateTime.getMinutes() + 15;
        startDateTime.setMinutes(endTime)
        return startDateTime;
    }

    resetSchdeulerMinMaxDate() {
        this.schedulerMinDate = undefined;
        this.schedulerMaxDate = undefined;
    }

    setSchdeulerMinMaxDate() {
        this.schedulerMinDate = this.currentDateTime;
        this.schedulerMaxDate = this.currentDateTime;
    }

    onSelectDate_valueChanged(startDate: Date) {
        startDate = new Date(startDate);
    }

    //on staff change reload data accroding selected staff
    onCallStaffChange(staffID) {
        if (this.onedaySchedulerCallComp) {
            this.onedaySchedulerCallComp.getSchedulerByStaff(staffID);
        }
    }

    //on staff change reload data accroding selected staff
    onAppointmentStaffChange(staffID) {
        if (this.onedaySchedulerAppointmentComp) {
            this.onedaySchedulerAppointmentComp.getSchedulerByStaff(staffID);
        }
    }

    // #endregion
}