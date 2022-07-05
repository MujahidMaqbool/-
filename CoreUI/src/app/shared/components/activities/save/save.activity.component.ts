// #region Imports 

/********************** Angular Refrences *********************/
import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, Inject } from '@angular/core';
import { NgForm, FormControl } from "@angular/forms";
import { SubscriptionLike as ISubscription } from 'rxjs';
/********************** Angular Material Refrences *********************/
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

/********************** Common *********************/
import { Configurations } from '@helper/config/app.config';

/********************** Services & Models *********************/
/* Services */
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { DataSharingService } from '@services/data.sharing.service';
import { DateTimeService } from '@services/date.time.service';

/*Models*/
import { MemberRedirectInfo } from '@customer/member/models/members.model';
import { ActivityTabsOptions } from '@models/activity.tab.options';
import {
    PriorityType,
    Template,
    ActivityOutcome,
    LostReasonType,
    WhatNext,
    Staff,
    AppointmentActivity,
    AppointmentLaterActivity,
    AppointmentNowActivity,
    CallActivity,
    CallNowActivity,
    CallLaterActivity,
    NoteActivity,
    EmailActivity,
    SMSActivity,
    AppNotification,
    ActivityPersonInfo,
    ContactReasonType

} from '@models/activity.model';
import { ApiResponse } from '@app/models/common.model';

/********************** Components *********************/
import { SaveMemberMembershipPopup } from '@app/customer-shared-module/add-member-membership/save-membership-popup/save.member.membership.popup';
/********************** Common *********************/
import { Messages } from '@app/helper/config/app.messages';
import { ENU_ActivityType, TemplateType, ENU_ModuleList, ActivityOutcomeType, WhatNextType, CustomerType, ENU_DateFormatName, ENU_ActivitySubType } from '@app/helper/config/app.enums';
import { Router } from '@angular/router';
import { MatDialogService } from '../../generics/mat.dialog.service';
import { CustomerApi, ClientActivityApi, LeadActivityApi } from '@app/helper/config/app.webapi';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { MissingBillingAddressDialog } from '@app/customer-shared-module/missing-billing-address/missing.billing.address.dialog';
import { AchievementActivity } from '@app/customer/member/models/member.activity.model';
import { OneDaySchedulerComponent } from '../../scheduler/one.day.scheduler.component';


// #endregion

@Component({
    selector: 'activity-tabs',
    templateUrl: './save.activity.component.html'
})
export class SaveActivityComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    // #region Local Members
    dayViewFormat: string = "";

    @Output()
    activitySaved = new EventEmitter<boolean>();

    @Output()
    openAddCall = new EventEmitter<boolean>();

    @Output()
    openAddAppointment = new EventEmitter<boolean>();

    /* Activity Form References*/
    @ViewChild('appointmentForm') appointmentForm: NgForm;
    @ViewChild('callForm') callForm: NgForm;
    @ViewChild('emailForm') emailForm: NgForm;
    @ViewChild('noteForm') notesForm: NgForm;
    @ViewChild('smsForm') smsForm: NgForm;
    @ViewChild('appNotificationForm') appNotificationForm: NgForm;
    @ViewChild('achievementsForm') achievementsForm: NgForm;

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
    appNotificationModel: AppNotification;
    memberRedirectInfo: MemberRedirectInfo;
    achievementModel: AchievementActivity;

    personInfo: ActivityPersonInfo;

    callFormSubscription: ISubscription;
    appointmentFormSubscription: ISubscription;
    emailFormSubscription: ISubscription;
    noteFormSubscription: ISubscription;
    smsFormSubscription: ISubscription;
    appNotificationSubscription: ISubscription;

    loggedInStaffSubscription: ISubscription;
    personInfoSubscription: ISubscription;
    membershipIdSubscription: ISubscription;

    /* Local members */
    loggedInStaffID: number;
    membershipId: number;
    assignedTo = new FormControl();
    minDate: Date = new Date();
    schedulerMinDate: Date = new Date();
    schedulerMaxDate: Date = new Date();
    schedulerStartTime: Date = new Date();
    schedulerEndTime: Date = new Date();
    currentDateTime: Date = new Date();
    currentDate: Date;
    activeTab: string;
    activeTabIndex: number;
    isInvalidData: boolean = false;
    hasError: boolean = false;
    hasSuccess: boolean = false;
    templateTypeId: number;
    //emailAddress: string;
    selectedTemplate: any;
    isAppointmentLostReasonRequired: boolean = false;
    isAppointmentTrialEndRequired: boolean = false;
    isApptOutcomeSaleOrLost: boolean = false;
    isCallLostReasonRequired: boolean = false;
    //isCallWhatNextRequired: boolean = false;
    isActiveTabEmailOrSMS: boolean = false;
    isInvalidEndTime: boolean = false;
    isInvalidStartTime: boolean = false;
    isInvalidFollowUpDate: boolean = false;
    isInvalidEmailBody: boolean = false;
    saveInProgress: boolean = false;
    currentCallDate: Date;
    currentAppointmentDate: Date;

    /* Collection Types */
    priorityTypeList: PriorityType[];
    outcomeList: ActivityOutcome[];
    templateTextList: Template[];
    contactReasonList: ContactReasonType[];
    lostReasonList: LostReasonType[];
    whatNextList: WhatNext[];
    staffList: Staff[];

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
    modules = ENU_ModuleList;
    outcomeType = ActivityOutcomeType;
    whatNext = WhatNextType;
    durationList = Configurations.DurationList;
    tepmplateVariableList = Configurations.TemplateVariableList;
    emailMaxLength = Configurations.EmailMaxLength;

    // #endregion

    constructor(
        private _activityService: HttpService,
        private _modelDialog: MatDialogService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _router: Router,
        public dialogRef: MatDialogRef<SaveActivityComponent>,
        @Inject(MAT_DIALOG_DATA) public tabsOptions: ActivityTabsOptions
    ) {
        super();
        this.getBranchDatePattern();
    }

    ngOnInit() {

        this.currentDate = new Date();
    }

    async getBranchTime() {

    }
    ngOnDestroy() {
        if (this.personInfoSubscription) {
            this.personInfoSubscription.unsubscribe();
        }

        if (this.membershipIdSubscription) {
            this.membershipIdSubscription.unsubscribe();
        }
    }

    // #region Events 

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
            case this.activityTypes.Achievements: {
                //Save Achievement
                this.saveAchievement();
                break;
            }
            case this.activityTypes.AppNotification: {
                // Save App Notificatoin
                this.saveAppNotification();
                break;
            }
        }
    }

    closePopup() {
        this.dialogRef.close();
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

    onAppointmentDateChange(newDate: Date) {
        // this.appointmentModel.FollowUpDate = newDate;
        // this.appointmentModel.Date = this.getDateString(newDate, this.dateFormat);
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
            this.appointmentModel.FollowUpEndTime = this._dateTimeService.getTimeStringFromDate(event.value, this.timeFormat);

            if (this.appointmentModel.FollowUpEndTime > this.appointmentModel.FollowUpStartTime) {
                this.isInvalidEndTime = false;
            }
        }
        else {
            this.appointmentModel.FollowUpEndTime = null;
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

    onAppointmentOutcomeChange() {
        this.isApptOutcomeSaleOrLost = false;
        this.isAppointmentLostReasonRequired = false;
        this.isAppointmentTrialEndRequired = false;
        if (this.appointmentModel.IsNow) {
            if (this.appointmentModel.ActivityOutcomeID === this.outcomeType.Lead_Apt_Lost) {
                this.isAppointmentLostReasonRequired = true;
                this.isApptOutcomeSaleOrLost = true;
                this.appointmentModel.ActivityWhatNextID = this.whatNext.Lead_Apt_NoFurtherAction;
            }
            else if (this.appointmentModel.ActivityOutcomeID === this.outcomeType.Lead_Apt_Sale) {
                this.isApptOutcomeSaleOrLost = true;
                this.appointmentModel.ActivityWhatNextID = this.whatNext.Lead_Apt_NoFurtherAction;
            }
        }

        if (this.appointmentModel.ActivityOutcomeID === this.outcomeType.Lead_Apt_Trial) {
            this.isAppointmentTrialEndRequired = true;
        }
    }

    onCallDateChange(newDate: Date) {
        // this.callModel.FollowUpDate = newDate;
        // this.callModel.Date = this.getDateString(newDate, this.dateFormat);
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
            this.callModel.FollowUpEndTime = this._dateTimeService.getTimeStringFromDate(event.value, this.timeFormat);

            if (this.callModel.FollowUpEndTime > this.callModel.FollowUpStartTime) {
                this.isInvalidEndTime = false;
            }
        }
        else {
            this.callModel.FollowUpEndTime = null;
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

    onCallWhatNextChange() {
        this.setCallLostReasonRequirement();
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

    // #endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
        this.currentDateTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.schedulerMinDate = this.currentDateTime;
        this.schedulerMaxDate = this.currentDateTime;
        this.currentCallDate = this.currentDateTime;
        this.currentAppointmentDate = this.currentDateTime;
        

        this.appointmentModel = new AppointmentActivity();
        this.callModel = new CallActivity();
        this.noteModel = new NoteActivity();
        this.emailModel = new EmailActivity();
        this.smsModel = new SMSActivity();
        this.appNotificationModel = new AppNotification();
        this.achievementModel = new AchievementActivity();

        this.memberRedirectInfo = new MemberRedirectInfo();

        this.schedulerEndTime.setMinutes(this.schedulerStartTime.getMinutes() + 15);

        //set branch date time added by fahad for browser different time zone issue resolving

        this.getBranchTime();
        this.minDate = this.currentDateTime;

        setTimeout(async () => {
            /* Commented to disable 'Show the same tab in Add Activity which was active in Search Activity '*/
            // this.activeTab = !this.tabsOptions.defaultActiveTab || this.tabsOptions.defaultActiveTab === this.activityTypes.All
            //                     ? this.tabsOptions.activeTabs[0] : this.tabsOptions.defaultActiveTab;

            this.activeTab = this.tabsOptions.activeTabs[0];
            this.initializeRefrences(this.tabsOptions.activityRefrences);

            //set branch date time added by fahad for browser different time zone issue resolving
            this.callModel.FollowUpDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
            this.appointmentModel.FollowUpDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

            if (this.tabsOptions.isEditMode) {
                this.setModelForEdit();
            }

            this.loggedInStaffSubscription = this._dataSharingService.loggedInStaffID.subscribe((staffId: number) => {
                this.loggedInStaffID = staffId;
            });

            this.setTemplateTypeId();
            this.subscribeToFormChanges();

            this.personInfoSubscription = this._dataSharingService.activityPersonInfo.subscribe((personInfo: ActivityPersonInfo) => {
                if (personInfo) {
                    this.personInfo = personInfo;
                }
            });

            this.membershipIdSubscription = this._dataSharingService.membershipID.subscribe((membershipId: number) => {
                if (membershipId && membershipId > 0) {
                    this.membershipId = membershipId;
                }
            });
        });

        setTimeout(() => {
            this.setActiveTabIndex();
        }, 500);

        this.emailMaxLengthMessage = Messages.Validation.Email_MaxLength.replace("{0}", this.emailMaxLength.toString());
    }

    initializeRefrences(references: any) {
        if (references && references.AppointmentNow) {
            this.appointmentNowModel = Object.assign({}, references.AppointmentNow);
        }

        if (references && references.AppointmentLater) {
            this.appointmentLaterModel = Object.assign({}, references.AppointmentLater);

            if (references.AppointmentLater.CustomerActivityID && references.AppointmentLater.CustomerActivityID > 0) {
                this.appointmentModel = Object.assign({}, references.AppointmentLater);
                if (this.tabsOptions.isMarkAsDone) {
                    // Prepare for appointment Mark As Done Mode
                    this.appointmentModel.IsNow = true;
                    this.appointmentNowModel.CustomerActivityID = this.appointmentModel.CustomerActivityID;
                }
                else {
                    // Prepare for appointment Edit Mode
                    this.getAppointmentFundamentals();
                    this.appointmentModel.IsNow = this.appointmentModel.ActivitySubTypeID == ENU_ActivitySubType.Now ? true : false;
                    this.appointmentModel.FollowUpDate = this.appointmentModel.FollowUpStartTime?this.setFollowUpDate(this.appointmentModel.FollowUpDate, this.appointmentModel.FollowUpStartTime):this.appointmentModel.FollowUpDate;
                    this.appointmentModel.Date = this._dateTimeService.convertDateObjToString(this.appointmentModel.FollowUpDate, this.dateFormat);

                    if (this.appointmentModel.FollowUpStartTime) {
                        this.schedulerStartTime = this._dateTimeService.convertTimeStringToDateTime(this.appointmentModel.FollowUpStartTime, this.appointmentModel.FollowUpDate);
                    }
                    if (this.appointmentModel.FollowUpEndTime) {
                        this.schedulerEndTime = this._dateTimeService.convertTimeStringToDateTime(this.appointmentModel.FollowUpEndTime, this.appointmentModel.FollowUpDate);
                    }
                }
            }
        }

        if (references && references.CallNow) {
            this.callNowModel = Object.assign({}, references.CallNow);
        }

        if (references && references.CallLater) {
            this.callLaterModel = Object.assign({}, references.CallLater);

            if (references.CallLater.CustomerActivityID && references.CallLater.CustomerActivityID > 0) {
                this.callModel = Object.assign({}, references.CallLater);

                if (this.tabsOptions.isMarkAsDone) {
                    // Prepare for call Mark As Done Mode
                    this.callModel.IsNow = true;
                    this.callNowModel.CustomerActivityID = this.callModel.CustomerActivityID;
                }
                else {
                    // Prepare for call Edit Mode
                    this.getCallFundamentals();
                    this.callModel.IsNow = this.callModel.ActivitySubTypeID == ENU_ActivitySubType.Now ? true : false;
                    this.callModel.ActivityWhatNextID = this.callModel.ActivityWhatNextID;
                    this.callModel.ActivityOutcomeID = this.callModel.ActivityOutcomeID;
                    this.callModel.ContactReasonTypeID = this.callModel.ContactReasonTypeID;
                    this.callModel.FollowUpDate = this.callModel.FollowUpStartTime?this.setFollowUpDate(this.callModel.FollowUpDate, this.callModel.FollowUpStartTime):this.callModel.FollowUpDate;
                    this.callModel.Date = this._dateTimeService.convertDateObjToString(this.callModel.FollowUpDate, this.dateFormat);

                    if (this.callModel.FollowUpStartTime) {
                        this.schedulerStartTime = this._dateTimeService.convertTimeStringToDateTime(this.callModel.FollowUpStartTime, this.callModel.FollowUpDate);
                    }
                    if (this.callModel.FollowUpEndTime) {
                        this.schedulerEndTime = this._dateTimeService.convertTimeStringToDateTime(this.callModel.FollowUpEndTime, this.callModel.FollowUpDate);
                    }
                }
            }
        }

        if (references && references.Note) {
            this.noteModel = Object.assign({}, references.Note);
        }

        if (references && references.Email) {
            this.emailModel = Object.assign({}, references.Email);
        }

        if (references && references.SMS) {
            this.smsModel = Object.assign({}, references.SMS);
        }
        if (references && references.Achievements) {
            this.achievementModel = Object.assign({}, references.Achievements);
        }

        if (references && references.AppNotification) {
            this.appNotificationModel = Object.assign({}, references.AppNotification);
        }
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
            case this.activityTypes.Achievements: {
                this.setEditAchievementModel();
                break;
            }
            case this.activityTypes.Note: {
                this.setEditNoteModel();
                break;
            }
            case this.activityTypes.FollowupCall: {
                this.callModel.IsNow = false;
                this.resetSchdeulerMinMaxDate();
                break;
            }
        }
    }

    setEditAppointmentModel() {
        this.appointmentModel = Object.assign({}, this.tabsOptions.activityRefrences.AppointmentLater);

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
            this.appointmentModel.IsNow = this.appointmentModel.ActivitySubTypeID == ENU_ActivitySubType.Now ? true : false;
            this.appointmentModel.FollowUpDate = this.appointmentModel.FollowUpStartTime?this.setFollowUpDate(this.appointmentModel.FollowUpDate, this.appointmentModel.FollowUpStartTime):this.appointmentModel.FollowUpDate;
            this.appointmentModel.Date = this.getDateString(this.appointmentModel.FollowUpDate, this.dateFormat);

            if (this.appointmentModel.FollowUpStartTime) {
                this.schedulerStartTime = this.setFollowUpDate(this.appointmentModel.FollowUpDate, this.appointmentModel.FollowUpStartTime);
            }
            if (this.appointmentModel.FollowUpEndTime) {
                this.schedulerEndTime = this.setFollowUpDate(this.appointmentModel.FollowUpDate, this.appointmentModel.FollowUpEndTime);
            }
        }
    }

    setEditCallModel() {
        this.callModel = Object.assign({}, this.tabsOptions.activityRefrences.CallLater);

        //remove zone from date added by fahad for browser different time zone issue resolving
        this.callModel.FollowUpDate = this._dateTimeService.removeZoneFromDateTime(this.callModel.FollowUpDate);

        if (this.tabsOptions.isMarkAsDone) {
            // Prepare for call Mark As Done Mode
            this.callModel.IsNow = true;

            if (new Date(this.callModel.FollowUpDate) >= this.currentDateTime) {
                this.callModel.FollowUpDate = this.currentDateTime;
                this.setSchdeulerMinMaxDate();
            }

            else if (new Date(this.callModel.FollowUpDate) < this.currentDateTime) {
                this.schedulerMinDate = this.callModel.FollowUpDate;
                this.schedulerMaxDate = this.currentDateTime;
            }

        }
        else {
            // Prepare for call Edit Mode
            this.resetSchdeulerMinMaxDate();
            this.callModel.IsNow = this.callModel.ActivitySubTypeID == ENU_ActivitySubType.Now ? true : false;
            this.callModel.FollowUpDate = this.callModel.FollowUpStartTime?this.setFollowUpDate(this.callModel.FollowUpDate, this.callModel.FollowUpStartTime):this.callModel.FollowUpDate;
            this.callModel.Date = this.getDateString(this.callModel.FollowUpDate, this.dateFormat);

            if (this.callModel.FollowUpStartTime) {
                this.schedulerStartTime = this.setFollowUpDate(this.callModel.FollowUpDate, this.callModel.FollowUpStartTime);
            }
            if (this.callModel.FollowUpEndTime) {
                this.schedulerEndTime = this.setFollowUpDate(this.callModel.FollowUpDate, this.callModel.FollowUpEndTime);
            }
        }
    }

    setEditNoteModel() {
        this.noteModel = Object.assign({}, this.tabsOptions.activityRefrences.Note);
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
        var activeTabs = JSON.parse(JSON.stringify(this.tabsOptions.activeTabs));
        this.activeTabIndex = activeTabs.indexOf(this.activeTab);
    }

    getAppointmentFundamentals() {
        this.staffList = [];
        this.outcomeList = [];
        this.lostReasonList = [];
        this.contactReasonList = [];
        this.whatNextList = [];
        if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.getAppointmentFundamentals && this.tabsOptions.apiUrls.getAppointmentFundamentals.length > 0) {
            this._activityService.get(this.tabsOptions.apiUrls.getAppointmentFundamentals).subscribe(
                (res: ApiResponse) => {
                    // Set fundamentals
                    if (res && res.MessageCode > 0) {
                        this.outcomeList = res.Result.ActivityOutcomeList;
                        this.staffList = res.Result.StaffList;
                        this.lostReasonList = res.Result.LostReasonList;
                        this.contactReasonList = res.Result.ContactReasonTypeList;
                        this.whatNextList = res.Result.ActivityWhatNextList;

                        if (!this.membershipId || this.membershipId == 0) {
                            this.outcomeList = this.outcomeList.filter(o => o.ActivityOutcomeID !== this.outcomeType.Lead_Apt_Lost && o.ActivityOutcomeID !== this.outcomeType.Lead_Apt_Sale)
                        }

                        this.setAppointmentDropdowns();
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
            )
        }
    }

    getCallFundamentals() {
        this.staffList = [];
        this.outcomeList = [];
        this.lostReasonList = [];
        this.contactReasonList = [];
        this.whatNextList = [];
        if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.getCallFundamentals && this.tabsOptions.apiUrls.getCallFundamentals.length > 0) {
            this._activityService.get(this.tabsOptions.apiUrls.getCallFundamentals).subscribe(
                (res: ApiResponse) => {
                    // Set fundamentals
                    if (res && res.MessageCode > 0) {
                        this.outcomeList = res.Result.ActivityOutcomeList;
                        this.staffList = res.Result.StaffList;
                        this.lostReasonList = res.Result.LostReasonList;
                        this.contactReasonList = res.Result.ContactReasonTypeList;
                        this.whatNextList = res.Result.ActivityWhatNextList;

                        if (!this.membershipId || this.membershipId == 0) {
                            this.whatNextList = this.whatNextList.filter(w => w.ActivityWhatNextID !== this.whatNext.Lead_Lost && w.ActivityWhatNextID !== this.whatNext.Lead_Sale)
                        }

                        this.setCallDropdowns();
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
            )
        }
    }

    setAppointmentDropdowns() {
        this.appointmentModel.Duration = this.appointmentModel.Duration ? this.appointmentModel.Duration : this.durationList[0].value;

        if (this.whatNextList && this.whatNextList.length > 0) {
            if (!this.appointmentModel.ActivityWhatNextID || this.appointmentModel.ActivityWhatNextID <= 0) {
                this.appointmentModel.ActivityWhatNextID = this.whatNextList[0].ActivityWhatNextID;
            }
        }

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

        if (this.contactReasonList && this.contactReasonList.length > 0) {
            if (!this.appointmentModel.ContactReasonTypeID || this.appointmentModel.ContactReasonTypeID <= 0) {
                this.appointmentModel.ContactReasonTypeID = this.contactReasonList[0].ContactReasonTypeID;
            }
        }

        if (this.outcomeList && this.outcomeList.length > 0) {
            if (!this.appointmentModel.ActivityOutcomeID || this.appointmentModel.ActivityOutcomeID <= 0) {
                this.appointmentModel.ActivityOutcomeID = this.outcomeList[0].ActivityOutcomeID;
            }
        }

        if (this.lostReasonList && this.lostReasonList.length > 0) {
            if (!this.appointmentModel.LostReasonTypeID || this.appointmentModel.LostReasonTypeID <= 0) {
                this.appointmentModel.LostReasonTypeID = this.lostReasonList[0].LostReasonTypeID;
            }
        }
    }

    setAppointmentNowModel() {
        this.appointmentNowModel = new AppointmentNowActivity;
        this.appointmentNowModel.CustomerActivityID = this.appointmentModel.CustomerActivityID;
        this.appointmentNowModel.Title = this.appointmentModel.Title;
        this.appointmentNowModel.Description = this.appointmentModel.Description;
        this.appointmentNowModel.ActivityOutcomeID = this.appointmentModel.ActivityOutcomeID;
        this.appointmentNowModel.ActivityWhatNextID = this.appointmentModel.ActivityWhatNextID;
        this.appointmentNowModel.FollowUpDate = this._dateTimeService.convertDateObjToString(this.appointmentModel.FollowUpDate, this.dateFormat);
        this.appointmentNowModel.ContactReasonTypeID = this.appointmentModel.ContactReasonTypeID;
        this.appointmentNowModel.CustomerID = this.tabsOptions.ownerId;
        this.appointmentNowModel.LostReasonTypeID = null;

        if (this.isAppointmentTrialEndRequired) {
            this.appointmentNowModel.TrialEndDate = this._dateTimeService.convertDateObjToString(this.appointmentModel.TrialEndDate, this.dateFormat);
        }

        if (this.isAppointmentLostReasonRequired) {
            this.appointmentNowModel.LostReasonTypeID = this.appointmentModel.LostReasonTypeID;
            this.appointmentNowModel.Description = this.appointmentModel.Description;
        }
    }

    setAppointmentLaterModel() {
        this.appointmentLaterModel.Title = this.appointmentModel.Title;
        this.appointmentLaterModel.Description = this.appointmentModel.Description;
        this.appointmentLaterModel.AssignedToStaffID = this.appointmentModel.AssignedToStaffID;
        this.appointmentLaterModel.FollowUpDate = this._dateTimeService.convertDateObjToString(this.appointmentModel.FollowUpDate, this.dateFormat);
        this.appointmentLaterModel.FollowUpStartTime = this.appointmentModel.FollowUpStartTime;
        this.appointmentLaterModel.FollowUpEndTime = this.appointmentModel.FollowUpEndTime;
        this.appointmentLaterModel.ContactReasonTypeID = this.appointmentModel.ContactReasonTypeID;
    }

    setAppointmentMarkAsDoneModel() {
        let appMarkAsDoneModel = this.tabsOptions.activityRefrences.AppointmentMarkAsDone;;
        appMarkAsDoneModel.CustomerActivityID = this.appointmentModel.CustomerActivityID;
        appMarkAsDoneModel.Title = this.appointmentModel.Title;
        appMarkAsDoneModel.ActivityOutcomeID = this.appointmentModel.ActivityOutcomeID;
        appMarkAsDoneModel.ActivityWhatNextID = this.appointmentModel.ActivityWhatNextID;
        appMarkAsDoneModel.ContactReasonTypeID = this.appointmentModel.ContactReasonTypeID;
        appMarkAsDoneModel.CompletionDate = this._dateTimeService.convertDateObjToString(this.appointmentModel.FollowUpDate, this.dateFormat);
        appMarkAsDoneModel.Description = this.appointmentModel.Description;

        if (this.appointmentModel.ActivityOutcomeID === this.outcomeType.Lead_Apt_Lost) {
            appMarkAsDoneModel.LostReasonTypeID = this.appointmentModel.LostReasonTypeID;
            appMarkAsDoneModel.MembershipID = this.membershipId;
        }
        else if (this.appointmentModel.ActivityOutcomeID === this.outcomeType.Lead_Apt_Sale) {
            appMarkAsDoneModel.MembershipID = this.membershipId;
        }
        else if (this.appointmentModel.ActivityOutcomeID === this.outcomeType.Lead_Apt_Trial) {
            appMarkAsDoneModel.TrialEndDate = this._dateTimeService.convertDateObjToString(this.appointmentModel.TrialEndDate, this.dateFormat);
        }

        return appMarkAsDoneModel;
    }

    validateAppointmentNowModel(): boolean {
        let isValid = true;

        if (!this.appointmentNowModel.Title || this.appointmentNowModel.Title == '') {
            isValid = false;
        }

        if (this.isAppointmentTrialEndRequired) {
            if ((!this.appointmentNowModel.TrialEndDate || this.appointmentNowModel.TrialEndDate == null)) {
                isValid = false;
            }
        }

        if (!this.appointmentNowModel.ActivityOutcomeID || this.appointmentNowModel.ActivityOutcomeID <= 0) {
            isValid = false;
        }

        if (this.isAppointmentLostReasonRequired) {
            if ((!this.appointmentNowModel.LostReasonTypeID || this.appointmentNowModel.LostReasonTypeID <= 0)) {
                isValid = false;
            }

            if ((!this.appointmentNowModel.Description || this.appointmentNowModel.Description == '')) {
                isValid = false;
            }
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

        if (this.contactReasonList && this.contactReasonList.length > 0) {
            if (!this.callModel.ContactReasonTypeID || this.callModel.ContactReasonTypeID <= 0) {
                this.callModel.ContactReasonTypeID = this.contactReasonList[0].ContactReasonTypeID;
            }
        }

        if (this.outcomeList && this.outcomeList.length > 0) {
            if (!this.callModel.ActivityOutcomeID || this.callModel.ActivityOutcomeID <= 0) {
                this.callModel.ActivityOutcomeID = this.outcomeList[0].ActivityOutcomeID;
            }
        }

        if (this.lostReasonList && this.lostReasonList.length > 0) {
            if (!this.callModel.LostReasonTypeID || this.callModel.LostReasonTypeID <= 0) {
                this.callModel.LostReasonTypeID = this.lostReasonList[0].LostReasonTypeID;
            }
        }

        if (this.whatNextList && this.whatNextList.length > 0) {
            if (!this.callModel.ActivityWhatNextID || this.callModel.ActivityWhatNextID <= 0) {
                this.callModel.ActivityWhatNextID = this.whatNextList[0].ActivityWhatNextID;
            }
            this.setCallLostReasonRequirement();
        }
    }

    setCallLostReasonRequirement() {
        this.isCallLostReasonRequired = false;

        if (this.callModel.ActivityWhatNextID && (this.callModel.ActivityWhatNextID === this.whatNext.Lead_Lost)) {
            this.isCallLostReasonRequired = true;
        }
    }

    setCallNowModel() {
        this.callNowModel = new CallNowActivity;
        this.callNowModel.CustomerActivityID = this.callModel.CustomerActivityID;
        this.callNowModel.Title = this.callModel.Title;
        this.callNowModel.Description = this.callModel.Description;
        this.callNowModel.CustomerID = this.tabsOptions.ownerId;
        this.callNowModel.ContactReasonTypeID = this.callModel.ContactReasonTypeID;
        this.callNowModel.ActivityOutcomeID = this.callModel.ActivityOutcomeID;
        this.callNowModel.ActivityWhatNextID = this.callModel.ActivityWhatNextID;
        this.callNowModel.ActivitySubTypeID = ENU_ActivitySubType.Now;
        this.callNowModel.FollowUpDate = this._dateTimeService.convertDateObjToString(this.callModel.FollowUpDate, this.dateFormat);

        if (this.isCallLostReasonRequired) {
            this.callNowModel.LostReasonTypeID = this.callModel.LostReasonTypeID;
        }
    }

    setCallLaterModel() {
        this.callLaterModel.Title = this.callModel.Title;
        this.callLaterModel.Description = this.callModel.Description;
        this.callLaterModel.ContactReasonTypeID = this.callModel.ContactReasonTypeID;
        this.callLaterModel.AssignedToStaffID = this.callModel.AssignedToStaffID;
        this.callLaterModel.FollowUpDate = this._dateTimeService.convertDateObjToString(this.callModel.FollowUpDate, this.dateFormat);
        this.callLaterModel.FollowUpStartTime = this.callModel.FollowUpStartTime;
        this.callLaterModel.FollowUpEndTime = this.callModel.FollowUpEndTime;
    }

    setCallMarkAsDoneModel() {
        let markAsDoneModel = this.tabsOptions.activityRefrences.CallMarkAsDone;
        markAsDoneModel.CustomerActivityID = this.callModel.CustomerActivityID;
        markAsDoneModel.ContactReasonTypeID = this.callModel.ContactReasonTypeID;
        markAsDoneModel.ActivityOutcomeID = this.callModel.ActivityOutcomeID;
        markAsDoneModel.ActivityWhatNextID = this.callModel.ActivityWhatNextID;
        markAsDoneModel.CompletionDate = this._dateTimeService.convertDateObjToString(this.callModel.FollowUpDate, this.dateFormat);
        markAsDoneModel.Title = this.callModel.Title;
        markAsDoneModel.Description = this.callModel.Description;

        if (this.callModel.ActivityWhatNextID === this.whatNext.Lead_Lost) {
            markAsDoneModel.LostReasonTypeID = this.callModel.LostReasonTypeID;
            markAsDoneModel.MembershipID = this.membershipId;
        }
        else if (this.callModel.ActivityOutcomeID === this.whatNext.Lead_Sale) {
            markAsDoneModel.MembershipID = this.membershipId;
        }

        return markAsDoneModel;
    }

    validateCallNowModel(): boolean {
        let isValid = true;

        if (!this.callNowModel.Title || this.callNowModel.Title == '') {
            isValid = false;
        }

        if (!this.callNowModel.ActivityOutcomeID || this.callNowModel.ActivityOutcomeID <= 0) {
            isValid = false;
        }

        if (this.isCallLostReasonRequired) {
            if ((!this.callNowModel.LostReasonTypeID || this.callNowModel.LostReasonTypeID <= 0)) {
                isValid = false;
            }

            if ((!this.callNowModel.Description || this.callNowModel.Description == '')) {
                isValid = false;
            }
        }

        return isValid;
    }

    validateCallLaterModel(): boolean {
        let isValid = true;
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        this.isInvalidFollowUpDate = false;
        this.isInvalidEndTime = false;
        this.isInvalidStartTime = false;

        if (!this.callLaterModel.Title || this.callLaterModel.Title == '') {
            isValid = false;
        }

        if (!this.callLaterModel.AssignedToStaffID || this.callLaterModel.AssignedToStaffID <= 0) {
            isValid = false;
        }

        if (!this.callLaterModel.FollowUpDate) {
            isValid = false;
        }
        //  else if (new Date(this.appointmentLaterModel.FollowUpDate) < today) {
        //      this.isInvalidFollowUpDate = true;
        //  }

        if (!this.callLaterModel.FollowUpStartTime || this.callLaterModel.FollowUpStartTime == '') {
            isValid = false;
        }

        if (!this.callLaterModel.FollowUpEndTime || this.callLaterModel.FollowUpEndTime == '') {
            isValid = false;
        }
        else if (this.callLaterModel.FollowUpStartTime >= this.callLaterModel.FollowUpEndTime) {
            this.isInvalidEndTime = true;
        }
        //  else if (this.appointmentLaterModel.FollowUpDate == this._dateTimeService.convertDateObjToString(this.currentDateTime, this.dateFormat)) {
        //     if (this._dateTimeService.getTimeDifferenceFromTimeString(this._dateTimeService.getTimeStringFromDate(this.currentDateTime,this.timeFormat), this.appointmentLaterModel.FollowUpStartTime) < 0) {
        //    this.isInvalidStartTime = true;
        //   }
        // }

        return isValid;
    }

    processCallAfterSave() {
        let shouldClosePopup = true;
        if (this.callModel.IsNow) {
            //if (this.callModel.ActivityOutcomeID === this.outcomeType.Lead_SpokeTo) {
            /*
                If What Next is FollowUp Call
            */
            if (this.callModel.ActivityWhatNextID === this.whatNext.Lead_Call) {
                this.openAddCall.emit(true);
                shouldClosePopup = true;
                // if (this.tabsOptions.isMarkAsDone) {
                //     /*
                //         If it was MarkAs Done Mode,
                //         Then close the popup and
                //         Open Add Activity with Call Form with Later option
                //     */
                //     this.openAddCallLater.emit(true);
                //     shouldClosePopup = true;
                // }
                // else {
                //     /*
                //         Else keep the popup open and
                //         Reset Call Form with Later option
                //     */

                //     this.callForm.form.reset();
                //     this.setCallDropdowns();
                //     this.callModel.IsNow = false;
                //     let today = new Date();
                //     // Convert Today to Tomorrow
                //     today.setDate(today.getDate() + 1)
                //     this.callModel.FollowUpDate = today;
                //     /* Popup should not be closed */
                //     shouldClosePopup = false;
                // }
            }

            /*
                If What Next is Appointment
            */
            if (this.callModel.ActivityWhatNextID === this.whatNext.Lead_Appointment) {
                this.openAddAppointment.emit(true);
                shouldClosePopup = true;
                // if (this.tabsOptions.isMarkAsDone) {
                //     /*
                //         If it was MarkAs Done Mode,
                //         Then close the popup and
                //         Open Add Activity with Appointment Form
                //     */
                //     this.openAddAppointment.emit(true);
                //     shouldClosePopup = true;
                // }
                // else {
                //     /*
                //         Other Keep the popup open and
                //         Change Tab to Appointment
                //     */
                //     this.activeTab = this.activityTypes.Appointment;
                //     this.setActiveTabIndex();

                //     /* Popup should not be closed */
                //     shouldClosePopup = false;
                // }
            }

            /*
                If What Next is Not Interested
            */
            if (this.callModel.ActivityWhatNextID === this.whatNext.Lead_Lost) {
                /*
                    Close this dialog and redirect to Lead Search
                */
                shouldClosePopup = true;
                this.redirectToLeadSearch();
            }
            //}
        }

        return shouldClosePopup;
    }

    processAppointmentAfterSave() {
        let shouldClosePopup = true;
        if (this.appointmentModel.IsNow) {
            /*
                If Outcome is Not Interested
            */
            if (this.appointmentModel.ActivityOutcomeID === this.outcomeType.Lead_Apt_Lost) {
                /*
                    Close this dialog and redirect to Lead Search
                */
                shouldClosePopup = true;
                this.redirectToLeadSearch();
            }
            /*
                If WhatNext is Call
            */
            else if (this.appointmentModel.ActivityWhatNextID === this.whatNext.Lead_Apt_Call) {
                this.openAddCall.emit(true);
            }
            /*
                If WhatNext is Appointment
            */
            else if (this.appointmentModel.ActivityWhatNextID === this.whatNext.Lead_Apt_Appointment) {
                this.openAddAppointment.emit(true);
            }
        }

        return shouldClosePopup;
    }

    getTemplateFundamentals(templateTypeId: number) {
        this.contactReasonList = [];
        if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.getTemplateFundamentals && this.tabsOptions.apiUrls.getTemplateFundamentals.length > 0) {
            let url = this.tabsOptions.apiUrls.getTemplateFundamentals + templateTypeId.toString();
            this._activityService.get(url).subscribe(
                (res: ApiResponse) => {
                    // Set fundamentals
                    if (res && res.MessageCode > 0) {
                        this.templateTextList = res.Result.TemplateTextList;
                        this.contactReasonList = res.Result.ContactReasonTypeList;

                        /* Add 'No Template' option on zero index */
                        this.templateTextList.splice(0, 0, { TemplateTextID: null, TemplateTextTitle: "No Template" });

                        /* Set Default Selection in dropdowns */
                        this.selectedTemplate = this.templateTextList[0];
                        this.smsModel.ContactReasonTypeID = this.contactReasonList[0].ContactReasonTypeID;
                        this.emailModel.ContactReasonTypeID = this.contactReasonList[0].ContactReasonTypeID;
                        this.appNotificationModel.ContactReasonTypeID = this.contactReasonList[0].ContactReasonTypeID;
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
            )
        }
    }

    getTemplateDescription(templateTextId: number, templateTypeId: number): any {
        if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.getTemplateDescription && this.tabsOptions.apiUrls.getTemplateDescription.length > 0) {
            let url = this.tabsOptions.apiUrls.getTemplateDescription.replace("{templateTextID}", templateTextId.toString())
                .replace("{templateTypeID}", templateTypeId.toString())
                .replace("{cutomerID}", this.tabsOptions.ownerId.toString());;
            return this._activityService.get(url);
        }
        else {
            return false;
        }
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
                    if (res && res.MessageCode > 0 && res.Result.TemplateText) {
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
                    if (templateVar === "[Staff Name]" || templateVar === "[Lead Name]") {
                        description = description.replace(templateVar, this.personInfo.Name);
                    }
                    else if (templateVar === "[Phone]") {
                        description = description.replace(templateVar, this.personInfo.Mobile);
                    }
                    else if (templateVar === "[Address]") {
                        if (this.personInfo.Address && this.personInfo.Address !== '') {
                            description = description.replace(templateVar, this.personInfo.Address);
                        }
                        else {
                            description = description.replace(templateVar, 'N/A');
                        }
                    }
                }
            })
        }


        return description;
    }

    subscribeToFormChanges() {
        this.unSubscribeFormChanges();

        switch (this.activeTab) {
            case this.activityTypes.Appointment:
            case this.activityTypes.FollowupAppointment: {
                setTimeout(() => {
                    this.getAppointmentFundamentals();
                    this.appointmentModel.FollowUpStartTime = this._dateTimeService.getTimeStringFromDate(this.schedulerStartTime, this.timeFormat);
                    this.appointmentModel.FollowUpEndTime = this._dateTimeService.getTimeStringFromDate(this.schedulerEndTime, this.timeFormat);
                });

                this.appointmentForm.valueChanges.subscribe(() => {
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
                    this.callModel.FollowUpStartTime = this._dateTimeService.getTimeStringFromDate(this.schedulerStartTime, this.timeFormat);
                    this.callModel.FollowUpEndTime = this._dateTimeService.getTimeStringFromDate(this.schedulerEndTime, this.timeFormat);
                });
                this.callForm.valueChanges.subscribe(() => {
                    if (this.callForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = false;
                break;
            }
            case this.activityTypes.Email: {
                this.emailForm.valueChanges.subscribe(() => {
                    if (this.emailForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = true;
                break;
            }
            case this.activityTypes.Note: {
                this.notesForm.valueChanges.subscribe(() => {
                    if (this.notesForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = false;
                break;
            }
            case this.activityTypes.Achievements: {
                this.achievementsForm.valueChanges.subscribe(() => {
                    if (this.achievementsForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = false;
                break;
            }
            case this.activityTypes.SMS: {
                this.smsForm.valueChanges.subscribe(() => {
                    if (this.smsForm.valid) {
                        this.showValidationMessage(false);
                    }
                });
                this.isActiveTabEmailOrSMS = true;
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
        }
    }

    unSubscribeFormChanges() {
        if (this.callFormSubscription) { this.callFormSubscription.unsubscribe(); }
        if (this.appointmentFormSubscription) { this.appointmentFormSubscription.unsubscribe(); }
        if (this.emailFormSubscription) { this.emailFormSubscription.unsubscribe(); }
        if (this.noteFormSubscription) { this.noteFormSubscription.unsubscribe(); }
        if (this.smsFormSubscription) { this.smsFormSubscription.unsubscribe(); }
        if (this.appNotificationSubscription) { this.appNotificationSubscription.unsubscribe(); }
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
            this.saveAppointmentLater();
        }
    }

    saveAppointmentNow() {
        this.setAppointmentNowModel();
        if (this.validateAppointmentNowModel()) {
            /*
                If What Next is Sale
            */
            if (this.appointmentNowModel.ActivityOutcomeID === this.outcomeType.Lead_Apt_Sale) {
                if (this.tabsOptions.permissions.isProceedToMemberAllowed) {
                    /*
                    Open Proceed to Member dialog
                */
                    this.checkBillingAddress(this.tabsOptions.apiUrls.saveAppointmentNow, this.appointmentNowModel, this.activityType.Appointment);
                    // this._dataSharingService.shareMemberMembershipID(this.membershipId);
                    // const membersDialog = this._modelDialog.open(SaveMemberMembershipPopup,
                    //     {
                    //         disableClose: true,
                    //         data: {
                    //             CustomerID: this.tabsOptions.ownerId,
                    //             CustomerTypeID: CustomerType.Lead
                    //         }
                    //     });
                    // membersDialog.componentInstance.membershipSaved.subscribe((isSaved: boolean) => {
                    //     if (isSaved) {
                    //         // then SaveActivity if Member was saved successfully
                    //         if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveAppointmentNow && this.tabsOptions.apiUrls.saveAppointmentNow.length > 0) {
                    //             this.appointmentNowModel.MembershipID = this.membershipId;
                    //             this.saveActivity(this.tabsOptions.apiUrls.saveAppointmentNow, this.appointmentNowModel, this.activityType.Appointment)
                    //         }
                    //         else {
                    //             this.saveInProgress = false;
                    //             console.log("web api path  for 'saveAppointment' not defined")
                    //         }
                    //     }
                    //     else {
                    //         this.saveInProgress = false;
                    //     }
                    // });
                }
                else {
                    this.saveInProgress = false;
                    this._messageService.showErrorMessage(this.messages.Error.Permission_UnAuthorized_ProceedToMember)
                }
            }
            else {
                if (this.appointmentNowModel.ActivityOutcomeID === this.outcomeType.Lead_Apt_Lost) {
                    this.appointmentNowModel.MembershipID = this.membershipId;
                }
                if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveAppointmentNow && this.tabsOptions.apiUrls.saveAppointmentNow.length > 0) {
                    this.saveActivity(this.tabsOptions.apiUrls.saveAppointmentNow, this.appointmentNowModel, this.activityType.Appointment)
                }
                else {
                    this.saveInProgress = false;
                    console.log("web api path  for 'saveAppointment' not defined")
                }
            }
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveAppointmentMarkAsDone() {
        this.setAppointmentNowModel();
        if (this.validateAppointmentNowModel()) {
            /*
                If What Next is Sale
            */
            if (this.appointmentNowModel.ActivityOutcomeID === this.outcomeType.Lead_Apt_Sale) {
                if (this.tabsOptions.permissions.isProceedToMemberAllowed) {
                    /*
                    Open Proceed to Member dialog
                */
                    this.checkBillingAddress(this.tabsOptions.apiUrls.saveAppointmentMarkAsDone, this.setAppointmentMarkAsDoneModel(), this.activityType.Appointment);
                    // this._dataSharingService.shareMemberMembershipID(this.membershipId);
                    // const membersDialog = this._modelDialog.open(SaveMemberMembershipPopup,
                    //     {
                    //         disableClose: true,
                    //         data: {
                    //             CustomerID: this.tabsOptions.ownerId,
                    //             CustomerTypeID: CustomerType.Lead
                    //         }
                    //     });

                    // membersDialog.componentInstance.membershipSaved.subscribe((isSaved: boolean) => {
                    //     if (isSaved) {
                    //         // then SaveActivity if Member was saved successfully
                    //         if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveAppointmentMarkAsDone && this.tabsOptions.apiUrls.saveAppointmentMarkAsDone.length > 0) {
                    //             this.saveActivity(this.tabsOptions.apiUrls.saveAppointmentMarkAsDone, this.setAppointmentMarkAsDoneModel(), this.activityType.Appointment)
                    //         }
                    //         else {
                    //             this.saveInProgress = false;
                    //             console.log("web api path  for 'saveAppointment' not defined")
                    //         }
                    //     }
                    //     else {
                    //         this.saveInProgress = false;
                    //     }
                    // });
                }
                else {
                    this.saveInProgress = false;
                    this._messageService.showErrorMessage(this.messages.Error.Permission_UnAuthorized_ProceedToMember)
                }
            }
            else {
                if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveAppointmentMarkAsDone && this.tabsOptions.apiUrls.saveAppointmentMarkAsDone.length > 0) {
                    this.saveActivity(this.tabsOptions.apiUrls.saveAppointmentMarkAsDone, this.setAppointmentMarkAsDoneModel(), this.activityType.Appointment)
                }
                else {
                    this.saveInProgress = false;
                    console.log("web api path  for 'saveAppointment' not defined")
                }
            }
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
            if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveAppointmentLater && this.tabsOptions.apiUrls.saveAppointmentLater.length > 0) {
                this.saveActivity(this.tabsOptions.apiUrls.saveAppointmentLater, this.appointmentLaterModel)
            }
            else {
                this.saveInProgress = false;
                console.log("web api path  for 'saveAppointment' not defined")
            }
        }
        else {
            this.saveInProgress = false;
            //this.showValidationMessage(true);
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
            this.saveCallLater();
        }
    }

    saveCallNow() {
        this.setCallNowModel();
        if (this.validateCallNowModel()) {
            /*
                If What Next is Sale
            */
            if (this.callNowModel.ActivityWhatNextID === this.whatNext.Lead_Sale) {
                /*
                    Open Proceed to Member dialog
                */
                if (this.tabsOptions.permissions.isProceedToMemberAllowed) {

                    this.checkBillingAddress(this.tabsOptions.apiUrls.saveCallNow, this.callNowModel, this.activityType.Call);
                    // this._dataSharingService.shareMemberMembershipID(this.membershipId);
                    // const membersDialog = this._modelDialog.open(SaveMemberMembershipPopup,
                    //     {
                    //         disableClose: true,
                    //         data: {
                    //             CustomerID: this.tabsOptions.ownerId,
                    //             CustomerTypeID: CustomerType.Lead                   
                    //         }
                    //     });
                    // membersDialog.componentInstance.membershipSaved.subscribe((isSaved: boolean) => {
                    //     if (isSaved) {
                    //         // then SaveActivity if Member was saved successfully
                    //         this.callNowModel.MembershipID = this.membershipId;
                    //         if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveCallNow && this.tabsOptions.apiUrls.saveCallNow.length > 0) {
                    //             this.saveActivity(this.tabsOptions.apiUrls.saveCallNow, this.callNowModel, this.activityType.Call)
                    //         }
                    //         else {
                    //             console.log("web api path  for 'saveAppointment' not defined")
                    //         }
                    //     }
                    //     else {
                    //         this.saveInProgress = false;
                    //     }
                    // });
                }
                else {
                    this.saveInProgress = false;
                    this._messageService.showErrorMessage(this.messages.Error.Permission_UnAuthorized_ProceedToMember)
                }

            }
            else {
                if (this.callNowModel.ActivityWhatNextID === this.whatNext.Lead_Lost) {
                    this.callNowModel.MembershipID = this.membershipId;
                }
                if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveCallNow && this.tabsOptions.apiUrls.saveCallNow.length > 0) {
                    this.saveActivity(this.tabsOptions.apiUrls.saveCallNow, this.callNowModel, this.activityType.Call);
                }
                else {
                    console.log("web api path  for 'saveCallNow' not defined")
                }
            }
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveCallMarkAsDone() {
        this.setCallNowModel();
        if (this.validateCallNowModel()) {
            /*
                If What Next is Sale
            */
            if (this.callNowModel.ActivityWhatNextID === this.whatNext.Lead_Sale) {
                if (this.tabsOptions.permissions.isProceedToMemberAllowed) {
                    /*
                    Open Proceed to Member dialog
                */

                    this.checkBillingAddress(this.tabsOptions.apiUrls.saveCallMarkAsDone, this.setCallMarkAsDoneModel(), this.activityType.Call);
                    // this._dataSharingService.shareMemberMembershipID(this.membershipId);
                    // const membersDialog = this._modelDialog.open(SaveMemberMembershipPopup,
                    //     {
                    //         disableClose: true,
                    //         data: {
                    //             CustomerID: this.tabsOptions.ownerId,
                    //             CustomerTypeID: CustomerType.Lead                   
                    //         }
                    //     });

                    // membersDialog.componentInstance.membershipSaved.subscribe((isSaved: boolean) => {
                    //     if (isSaved) {
                    //         // then SaveActivity if Member was saved successfully
                    //         if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveCallMarkAsDone && this.tabsOptions.apiUrls.saveCallMarkAsDone.length > 0) {
                    //             this.saveActivity(this.tabsOptions.apiUrls.saveCallMarkAsDone, this.setCallMarkAsDoneModel(), this.activityType.Call)
                    //         }
                    //         else {
                    //             console.log("web api path  for 'saveAppointment' not defined")
                    //         }
                    //     }
                    //     else {
                    //         this.saveInProgress = false;
                    //     }
                    // });
                }
                else {
                    this.saveInProgress = false;
                    this._messageService.showErrorMessage(this.messages.Error.Permission_UnAuthorized_ProceedToMember);
                }
            }
            else {
                if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveCallMarkAsDone && this.tabsOptions.apiUrls.saveCallMarkAsDone.length > 0) {
                    this.saveActivity(this.tabsOptions.apiUrls.saveCallMarkAsDone, this.setCallMarkAsDoneModel(), this.activityType.Call);
                }
                else {
                    console.log("web api path  for 'saveCallNow' not defined")
                }
            }
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    checkBillingAddress(url: any, callModel: any, activityType: any) {
        this._activityService.get(CustomerApi.checkBillingAndGateway + callModel.CustomerID).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result.HasBillingAddress) {
                        this.proceedToMember(url, callModel, activityType);
                    }
                    else {
                        this.showBillingAddressDialog(callModel);
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            }
        )
    }

    proceedToMember(url: string, callModel: any, activityType: any) {
        this._dataSharingService.shareMemberMembershipID(this.membershipId);
        const membersDialog = this._modelDialog.open(SaveMemberMembershipPopup,
            {
                disableClose: true,
                data: {
                    CustomerID: this.tabsOptions.ownerId,
                    CustomerTypeID: CustomerType.Lead
                }
            });

        membersDialog.componentInstance.membershipSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                // then SaveActivity if Member was saved successfully
                if (url && url.length > 0) {
                    this.saveActivity(url, callModel, activityType)
                }
                else {
                    console.log("web api path  for 'saveAppointment' not defined")
                }
            }
            else {
                this.saveInProgress = false;
            }
        });
    }

    showBillingAddressDialog(customerInfo: any) {
        const dialog = this._modelDialog.open(MissingBillingAddressDialog, {
            disableClose: true,
            data: customerInfo.CustomerID
        });
        dialog.componentInstance.redirectUrl = "/lead/details/" + customerInfo.CustomerID;
        dialog.componentInstance.onCancel.subscribe((isCancelled: boolean) => {
            if (isCancelled) {
                this.saveInProgress = false;
            }
        })
    }

    saveCallLater() {
        this.setCallLaterModel();
        if (!this.validateCallLaterModel()) {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
        else if (!this.isInvalidEndTime && !this.isInvalidStartTime) {
            if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveCallLater && this.tabsOptions.apiUrls.saveCallLater.length > 0) {
                this.saveActivity(this.tabsOptions.apiUrls.saveCallLater, this.callLaterModel)
            }
            else {
                this.saveInProgress = false;
                console.log("web api path  for 'saveCallLater' not defined")
            };
        }
        else {
            this.saveInProgress = false;
            //this.showValidationMessage(true);
        }
    }

    saveEmail() {
        if (this.emailForm.valid && !this.isInvalidEmailBody) {
            if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveEmail && this.tabsOptions.apiUrls.saveEmail.length > 0) {
                this.saveActivity(this.tabsOptions.apiUrls.saveEmail, this.emailModel)
            }
            else {
                this.saveInProgress = false;
                console.log("web api path  for 'saveEmail' not defined")
            }
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
            if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveNote && this.tabsOptions.apiUrls.saveNote.length > 0) {
                this.saveActivity(this.tabsOptions.apiUrls.saveNote, this.noteModel);
            }
            else {
                this.saveInProgress = false;
                console.log("web api path for 'saveNote' not defined")
            }

        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveSMS() {
        if (this.smsForm.valid) {
            if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveSMS && this.tabsOptions.apiUrls.saveSMS.length > 0) {
                this.saveActivity(this.tabsOptions.apiUrls.saveSMS, this.smsModel)
            }
            else {
                this.saveInProgress = false;
                console.log("web api path 'saveSMS' not defined")
            }
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveAchievement() {
        if (this.achievementsForm.valid) {
            if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveAchievement && this.tabsOptions.apiUrls.saveAchievement.length > 0) {
                this.saveActivity(this.tabsOptions.apiUrls.saveAchievement, this.achievementModel);
            } else {
                this.saveInProgress = false;
            }
        }
        else {
            this.saveInProgress = false;
            this.showValidationMessage(true);
        }
    }

    saveAppNotification() {
        if (this.appNotificationForm.valid) {
            if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.saveAppNotification && this.tabsOptions.apiUrls.saveAppNotification.length > 0) {
                this.saveActivity(this.tabsOptions.apiUrls.saveAppNotification, this.appNotificationModel)
            }
            else {
                this.saveInProgress = false;
                console.log("web api path 'saveAppNotification' not defined")
            }
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
                (response: ApiResponse) => {
                    if (response && response.MessageCode && response.MessageCode > 0) {
                        this.saveInProgress = false;
                        this.activitySaved.emit(true);

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

                        this.successClosePopup(shouldClosePopup);
                    }
                    else {
                        this.saveInProgress = false;
                        this.activitySaved.emit(false);
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", this.activeTab));
                    }
                },
                error => {
                    this.saveInProgress = false;
                    this.activitySaved.emit(false);
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", this.activeTab));
                }
            )
    }

    resetAllForms() {
        if (this.appointmentForm && this.appointmentForm.form) {
            this.appointmentForm.form.reset();
            setTimeout(() => {
                this.appointmentModel = new AppointmentActivity();

                //set branch date time added by fahad for browser different time zone issue resolving
                this.appointmentModel.FollowUpDate = this.currentDateTime;
                this.setSchdeulerMinMaxDate();
            });
        }

        if (this.callForm && this.callForm.form) {
            this.callForm.form.reset();
            setTimeout(() => {
                this.callModel = new CallActivity();

                //set branch date time added by fahad for browser different time zone issue resolving
                this.callModel.FollowUpDate = this.currentDateTime;

                this.setSchdeulerMinMaxDate();
            });
        }

        if (this.emailForm && this.emailForm.form) {
            this.emailForm.form.reset();
        }

        if (this.notesForm && this.notesForm.form) {
            this.notesForm.form.reset();
        }
        if (this.achievementsForm && this.achievementsForm.form) {
            this.achievementsForm.form.reset();
        }

        if (this.smsForm && this.smsForm.form) {
            this.smsForm.form.reset();
        }

        if (this.appNotificationForm && this.appNotificationForm.form) {
            this.appNotificationForm.form.reset();
        }
    }

    showValidationMessage(isVisible: boolean) {
        this.isInvalidData = isVisible;
    }

    successClosePopup(shouldClosePopup: boolean) {
        if (shouldClosePopup) {
            this.closePopup();
        }
    }

    // #endregion

    // #region Helping Methods

    redirectToLeadSearch() {
        this._router.navigate(['/lead/search']);
    }

    getTimeStringFromDate(dateValue: Date, timeFormat: string) {
        return this._dateTimeService.getTimeStringFromDate(dateValue, timeFormat);

    }
    getDateString(dateValue: Date, dateFormat: string) {
        return this._dateTimeService.convertDateObjToString(dateValue, dateFormat);
    }

    setFollowUpDate(followUpDate: any, time: string) {
        if (time != undefined && time != null) {
            return this._dateTimeService.convertTimeStringToDateTime(time, followUpDate);
        }
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

    async setSchdeulerMinMaxDate() {
        let schedulerTimeFormat = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.schedulerMinDate = schedulerTimeFormat;
        this.schedulerMaxDate = schedulerTimeFormat;
    }

    onSelectDate_valueChanged(startDate: Date) {
        startDate = new Date(startDate);
        this.currentDate = startDate;
    }

    onSelectDateCallValueChanged(startDate: Date) {
        startDate = new Date(startDate);
        this.callModel.FollowUpDate = startDate;
    }

    onSelectDateAppointmentValueChanged(startDate: Date) {
        startDate = new Date(startDate);
        this.appointmentModel.FollowUpDate = startDate;
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