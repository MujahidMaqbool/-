/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { NgForm } from '@angular/forms';
/********************** Service & Models *********************/
/*Services*/

import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
/*Models*/
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';
import {
    SaveAutomation, EventCategoryType, EventType, Audience, AutomationRuleTemplate, AudienceTemplate,
    DurationType, RuleAudience, AutomationRuleAudienceCommunication, AutomationRuleStaffPosition, AutomationRuleAudienceGroup
} from 'src/app/models/automation.model';
/********************** Common and Customs *********************/
import { AutomationRuleApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';
import { TrimPipe } from "src/app/shared/pipes/trim";
/********* Configurations ************/

import { Configurations } from 'src/app/helper/config/app.config';
import { ENU_EventCategoryType, ENU_AudienceType, ENU_CommunicationType, ENU_AutomationDurationType, ENU_NotificationTrigger } from 'src/app/helper/config/app.enums';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { TimeFormatPipe } from 'src/app/application-pipes/time-format.pipe';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

@Component({
    selector: 'save-automation',
    templateUrl: './save.automation.component.html'
})
export class SaveAutomationComponent extends AbstractGenericComponent implements OnInit {

    @ViewChild('verifyAutomationForm') verifyAutomationForm: NgForm;

    // #region Local Members

    automationID: number;
    defaultEventTypeId: number;
    defaultEventCategoryTypeId: number;
    doNotSendAfter: Date = null;
    doNotSendBefore: Date = null;
    StartDate: any = new Date();
    isInvalidEndTime: boolean = false;
    isInvalidStartTime: boolean = false;
    eventTypeName: string = "";

    // variables use show success or error messages
    hasSuccess: boolean = false;
    hasError: boolean = false;
    successMessage: string;
    errorMessage: string;

    // variables use to check tempaltes list are empty or not
    hasTempalte = true;
    hasStaffTemplate: boolean = false;
    hasCustomerTemplate: boolean = false;
    hasStaffPositionTemplate: boolean = false;


    // object list declare to show and hide tempaltes list.
    audienceDisabled = {
        customerSelected: false,
        relatedStaffSelected: false,
        staffPositionSeleted: false,
    }

    /* Messages */
    messages = Messages;
    /* Model References */
    saveAutomation: SaveAutomation;
    automationPermission: EventType;
    audienceTemplate: AudienceTemplate;

    /* Collection Types */

    // variables use to check tempaltes list are empty or not
    durationType: DurationType[] = [];
    eventCategoryType: EventCategoryType[] = [];
    defaultEventTypeList: EventType[] = [];
    eventType: EventType[] = [];
    audienceTypeDefaultList: Audience[] = [];
    audienceStaffDefaultList: Audience[] = [];
    audienceCustomerEditList: Audience[] = [];
    audienceStaffEditList: Audience[] = [];

    // declare empty list we need all these lists to fill templates accordning to trigger on change,bacuse we 9 dropdown templates in.

    automationRuleTemplate: AutomationRuleTemplate[] = [];
    audienceCustomerEmailtemplate: AutomationRuleTemplate[] = [];
    audienceCustomerSMStemplate: AutomationRuleTemplate[] = [];
    audienceCustomerNotificationtemplate: AutomationRuleTemplate[] = [];
    audienceStaffEmailtemplate: AutomationRuleTemplate[] = [];
    audienceStaffSMStemplate: AutomationRuleTemplate[] = [];
    audienceStaffNotificationtemplate: AutomationRuleTemplate[] = [];
    audienceStaffPositionEmailtemplate: AutomationRuleTemplate[] = [];
    audienceStaffPositionSMStemplate: AutomationRuleTemplate[] = [];
    audienceStaffPositionNotificationtemplate: AutomationRuleTemplate[] = [];
    audienceTemplateDetailByID: AutomationRuleTemplate[] = [];


    automationRuleStaffPosition: AutomationRuleAudienceGroup[] = [];
    staffPositionList: AutomationRuleAudienceGroup[] = [];
    selectedStaffPosition: any[] = [];
    automationTemplateCopy: AutomationRuleAudienceCommunication[] = [];
    ruleAudienceCustomer: Audience[] = [];
    ruleAudienceStaff: Audience[] = [];
    /** Configurations, Constants */
    endRepeatOccurrence = Configurations.EndRepeatOccurrence;
    timeFormat = Configurations.TimeFormat;
    dateFormat = Configurations.DateFormat;
    exceptionDateFormate = Configurations.ExceptionDateFormat;
    enu_EventCategoryType = ENU_EventCategoryType;
    enu_AudienceType = ENU_AudienceType;
    enu_CommunicationType = ENU_CommunicationType;
    enu_AutomationDurationType = ENU_AutomationDurationType;
    enu_NotificationTrigger = ENU_NotificationTrigger;
    // #endregion


    constructor(
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _trimString: TrimPipe,
        private _dateTimeService: DateTimeService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _dataSharingService: DataSharingService,
        private _timeFormatPipe: TimeFormatPipe
    ) {
        super();
        this.automationPermission = new EventType();
        this.saveAutomation = new SaveAutomation();
        this.audienceTemplate = new AudienceTemplate();
    }
    ngOnInit() {
        this.getFundamentals().then(isPromiseResolved => {
            if (isPromiseResolved) {
                this.getAutomationRuleIDFromRoute().then((isPromiseResolved: boolean) => {
                    if (isPromiseResolved) {
                        this.getAutomationDetailByID();
                    }
                    else {
                        this.setBeforeAfterTime();
                    }

                })

            }
        });
    }

  
    // #region Events


    onEmailUpdated() {
        if (this.saveAutomation.ReplyEmailAddress) {
            this.saveAutomation.ReplyEmailAddress = this._trimString.transform(this.saveAutomation.ReplyEmailAddress);
        }
    }

    onChangeEventCategory() {
        this.filterEventTypeAndBind();
        this.saveAutomation.EventTypeID = 0;
    }

    onEventTypeChanged() {
        if (this.saveAutomation.EventTypeID > 0) {
            this.rebindEventTypeDropdown();
            this.getautomationRuleTemplate();
            this.setAudienceValueAsSelected();
            this.automationPermission = this.defaultEventTypeList.filter(event => event.EventTypeID === this.saveAutomation.EventTypeID)[0];
            // this.filterAudienceTypeWithPermission();
            if (this.automationPermission.AllowRepeat || this.automationPermission.AllowAfter || this.automationPermission.AllowBefore) {
                this.saveAutomation.DurationValue = this.automationID > 0 && this.saveAutomation.DurationValue != null ? this.saveAutomation.DurationValue : (this.saveAutomation.EventTypeID==this.enu_NotificationTrigger.MembershipExpiry ? 12: 24);
                this.saveAutomation.DurationTypeID = this.automationID > 0 && this.saveAutomation.DurationTypeID ? this.saveAutomation.DurationTypeID : this.durationType.filter(event => event.DurationTypeID === this.enu_AutomationDurationType.Hours)[0].DurationTypeID;
                this.saveAutomation.RepeatValue = this.automationID > 0 && this.saveAutomation.RepeatValue ? this.saveAutomation.RepeatValue : this.endRepeatOccurrence[0].value;
            }
        }
    }

    onAudienceChanged(audienceType: Audience) {
        this.hasTempalte = true;
        switch (audienceType.AudienceTypeID) {
            case this.enu_AudienceType.Customer:
                if (audienceType.AudienceChecked && !this.hasCustomerTemplate) {
                    this._messageService.showErrorMessage(this.messages.Error.Template_Not_Defined);
                    this.hasTempalte = false;
                }
                else {
                    this.audienceTemplate.AudienceCustomerEmailIsActive = audienceType.AudienceChecked && this.audienceCustomerEmailtemplate && this.audienceCustomerEmailtemplate.length > 0 ? true : false;
                    this.audienceTemplate.AudienceCustomerSMSIsActive = audienceType.AudienceChecked && this.audienceCustomerSMStemplate && this.audienceCustomerSMStemplate.length > 0 ? true : false;
                    this.audienceTemplate.AudienceCustomerNotificationIsActive = audienceType.AudienceChecked && this.audienceCustomerNotificationtemplate && this.audienceCustomerNotificationtemplate.length > 0 ? true : false;
                    this.audienceDisabled.customerSelected = audienceType.AudienceChecked ? true : false;
                }

                break;

            case this.enu_AudienceType.RelatedStaff:
                if (audienceType.AudienceChecked && !this.hasStaffTemplate) {
                    this._messageService.showErrorMessage(this.messages.Error.Template_Not_Defined);
                    this.hasTempalte = false;
                }
                else {
                    this.audienceDisabled.relatedStaffSelected = audienceType.AudienceChecked ? true : false;
                    this.audienceTemplate.AudienceStaffEmailIsActive = audienceType.AudienceChecked && this.audienceStaffEmailtemplate && this.audienceStaffEmailtemplate.length > 0 ? true : false;
                    this.audienceTemplate.AudienceStaffSMSIsActive = audienceType.AudienceChecked && this.audienceStaffSMStemplate && this.audienceStaffSMStemplate.length > 0 ? true : false;
                    this.audienceTemplate.AudienceStaffNotificationIsActive = audienceType.AudienceChecked && this.audienceStaffNotificationtemplate && this.audienceStaffNotificationtemplate.length > 0 ? true : false;
                }
                break;
            case this.enu_AudienceType.StaffPosition:
                if (audienceType.AudienceChecked && !this.hasStaffPositionTemplate) {
                    this._messageService.showErrorMessage(this.messages.Error.Template_Not_Defined);
                    this.hasTempalte = false;
                }
                else {
                    this.audienceTemplate.AudienceStaffPositionEmailIsActive = audienceType.AudienceChecked && this.audienceStaffPositionEmailtemplate && this.audienceStaffPositionEmailtemplate.length > 0 ? true : false;
                    this.audienceTemplate.AudienceStaffPositionSMSIsActive = audienceType.AudienceChecked && this.audienceStaffPositionSMStemplate && this.audienceStaffPositionSMStemplate.length > 0 ? true : false;
                    this.audienceTemplate.AudienceStaffPositionNotificationIsActive = audienceType.AudienceChecked && this.audienceStaffPositionNotificationtemplate && this.audienceStaffPositionNotificationtemplate.length > 0 ? true : false;

                    if (!audienceType.AudienceChecked) {
                        this.selectedStaffPosition = [];
                        this.audienceDisabled.staffPositionSeleted = false;
                    }
                    if (audienceType.AudienceChecked) {
                        this.audienceDisabled.staffPositionSeleted = audienceType.AudienceChecked ? true : false;
                    }

                }
                break;
        }
    }

    onStartTimeChange(event: any) {
        if (event && event.value) {
            this.saveAutomation.DoNotSendBefore = this._dateTimeService.getTimeStringFromDate(event.value, this.timeFormat);
            this.isInvalidEndTime = true;
        }
        else {
            this.saveAutomation.DoNotSendBefore = null;
            this.saveAutomation.DoNotSendBefore == null && this.saveAutomation.DoNotSendAfter == null ? this.isInvalidEndTime = false : this.isInvalidEndTime = true;
        }


    }

    onEndTimeChange(event: any) {
        if (event && event.value) {
            this.saveAutomation.DoNotSendAfter = this._dateTimeService.getTimeStringFromDate(event.value, this.timeFormat);
            this.isInvalidEndTime = true;
        }
        else {
            this.saveAutomation.DoNotSendAfter = null;
            this.saveAutomation.DoNotSendBefore == null && this.saveAutomation.DoNotSendAfter == null ? this.isInvalidEndTime = false : this.isInvalidEndTime = true;
        }
    }

    onRuleNameUpdated() {
        if (this.saveAutomation.RuleName && this.saveAutomation.RuleName.length > 0) {
            this.saveAutomation.RuleName = this.saveAutomation.RuleName.trim();
        }
    }

    onSaveAutomation(isValid: boolean) {
        if (isValid) {
            this.mapAutomationRuleSaveModel().then((isPromiseResolved: boolean) => {
                //  console.log(this.saveAutomation);
                if (isPromiseResolved) {
                    this.saveAutomation.hasOwnProperty("RuleCustomerAudience") ? delete this.saveAutomation["RuleCustomerAudience"] : null;
                    this.saveAutomation.hasOwnProperty("RuleStaffAudience") ? delete this.saveAutomation["RuleStaffAudience"] : null;
                    if (this.timeFormat == 'hh:mm a') {
                        this.saveAutomation.DoNotSendBefore = this._timeFormatPipe.convert24Hoursto12HoursFormat(this.saveAutomation.DoNotSendBefore);
                        this.saveAutomation.DoNotSendAfter = this._timeFormatPipe.convert24Hoursto12HoursFormat(this.saveAutomation.DoNotSendAfter);
                    }
                    this._httpService.save(AutomationRuleApi.saveAutomationRule, this.saveAutomation)
                        .subscribe((res: ApiResponse) => {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Automation rule"));
                                this._router.navigate(['/automation/search']);
                            }
                            else {
                                if (this.timeFormat == 'hh:mm a') {
                                    this.saveAutomation.DoNotSendBefore = this._timeFormatPipe.transform(this.saveAutomation.DoNotSendBefore);
                                    this.saveAutomation.DoNotSendAfter = this._timeFormatPipe.transform(this.saveAutomation.DoNotSendAfter);
                                }
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                        },
                            err => {
                                if (this.timeFormat == 'hh:mm a') {
                                    this.saveAutomation.DoNotSendBefore = this._timeFormatPipe.transform(this.saveAutomation.DoNotSendBefore);
                                    this.saveAutomation.DoNotSendAfter = this._timeFormatPipe.transform(this.saveAutomation.DoNotSendAfter);
                                }
                                this._messageService.showErrorMessage(this.messages.Error.Save_Error);
                            }
                        );
                }
            });

        }
    }


    // #endregion

    // #region Methods

    getFundamentals() {
        return new Promise<any>((isPromiseResolved, reject) => {
            try {
                this._httpService.get(AutomationRuleApi.getAllFundamental)
                    .subscribe(async (res: ApiResponse) => {
                        if (await res && res.MessageCode > 0) {
                            this.eventCategoryType = res.Result.EventCategoryType;
                            this.defaultEventTypeList = res.Result.EventType;
                            this.audienceTypeDefaultList = res.Result.RuleAudience;
                            this.audienceStaffDefaultList = res.Result.RuleAudience.RuleStaffAudience;
                            this.ruleAudienceCustomer = res.Result.RuleAudience.RuleCustomerAudience;
                            this.ruleAudienceStaff = res.Result.RuleAudience.RuleStaffAudience;
                            this.durationType = res.Result.DurationTypeList;
                            this.automationRuleStaffPosition = res.Result.AutomationRuleStaffPosition;
                            this.setAudienceValueAsSelected();
                            isPromiseResolved(true);
                        }
                        else {
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
                    );
            }
            catch (err) {
                reject(this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error));
            }
        });
    }

    getAutomationRuleIDFromRoute() {
        return new Promise<boolean>((isPromiseResolved, reject) => {
            this._route.paramMap.subscribe(async (params) => {
                this.automationID = await +params.get('AutomationID');
                if (this.automationID > 0) {
                    isPromiseResolved(true);
                }
                else {
                    isPromiseResolved(false);
                }
            });
        });
    }

    // #region Get Automation Detail on edit and bind values with fields

    getAutomationDetailByID() {
        let getFundamentalls = this._httpService.get(AutomationRuleApi.getAllFundamental);
        let automationDetail = this._httpService.get(AutomationRuleApi.getAutomationRuleDetail.replace("{ruleID}", this.automationID.toString()))
        forkJoin([getFundamentalls, automationDetail])
            .subscribe(
                data => {
                    this.sendResponseData(data);
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Automation rule")); }
            );
    }

    sendResponseData(data) {
        this.fillFundamentals(data[0]);
        this.mapAutomationDetail(data[1]);
    }

    fillFundamentals(res: ApiResponse) {
        if (res && res.MessageCode > 0) {
            this.automationPermission = new EventType();
            this.eventCategoryType = res.Result.EventCategoryType;
            this.defaultEventTypeList = res.Result.EventType;
            this.audienceTypeDefaultList = res.Result.RuleAudience;
            this.audienceStaffDefaultList = res.Result.RuleAudience.RuleStaffAudience;
            this.ruleAudienceCustomer = res.Result.RuleAudience.RuleCustomerAudience;
            this.ruleAudienceStaff = res.Result.RuleAudience.RuleStaffAudience;
            this.durationType = res.Result.DurationTypeList;
            this.automationRuleStaffPosition = res.Result.AutomationRuleStaffPosition;
        }
        else {
            this._messageService.showErrorMessage(res.MessageText);
        }

    }

    mapAutomationDetail(res: ApiResponse) {
        if (res && res.MessageCode > 0) {
            this.saveAutomation = res.Result;
            this.audienceCustomerEditList = res.Result.RuleCustomerAudience && res.Result.RuleCustomerAudience.Customer.length > 0 ? res.Result.RuleCustomerAudience.Customer : [];
            this.audienceStaffEditList = res.Result.RuleStaffAudience && res.Result.RuleStaffAudience.Staff.length > 0 ? res.Result.RuleStaffAudience.Staff : [];
            this.automationTemplateCopy = this.saveAutomation.AutomationRuleAudienceCommunication;
            this.defaultEventTypeId = this.saveAutomation.EventTypeID;
            this.defaultEventCategoryTypeId = this.saveAutomation.EventCategoryTypeID;
            this.staffPositionList = res.Result.AutomationRuleAudienceGroup;
            this.automationPermission = this.defaultEventTypeList.filter(item => item.EventTypeID === this.saveAutomation.EventTypeID)[0];
            this.setRuleAudience();
            if (this.staffPositionList && this.staffPositionList.length > 0 && this.automationPermission.AllowStaffPosition) {
                this.setAutomationRuleAudienceGroup(res.Result.AutomationRuleAudienceGroup);
            }
            this.audienceTemplateDetailByID = res.Result.AutomationRuleAudienceCommunication;
            this.filterEventTypeAndBind().then((isPromiseResolved: boolean) => {
                if (isPromiseResolved) {
                    this.getautomationRuleTemplate().then((isPromiseResolved: boolean) => {
                        if (isPromiseResolved) {
                            this.setAutomationRuleTemplateDropdownValuesAsSelected();
                            this.setBeforeAfterTime();
                        }
                    });
                }
            });
        }
        else {
            this._messageService.showErrorMessage(res.MessageText);
        }
    }

    // #endregion  Automation Detail on edit


    getautomationRuleTemplate() {
        return new Promise<boolean>((isPromiseResolved, reject) => {
            let url = AutomationRuleApi.getRuleTemplate.replace("{eventTypeID}", this.saveAutomation.EventTypeID.toString())
            this._httpService.get(url)
                .subscribe((res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        if (res.Result && res.Result.length > 0) {
                            this.automationRuleTemplate = res.Result;
                            this.hasTempalte = res.Result && res.Result.length > 0 ? true : false;
                            this.hasCustomerTemplate = this.automationRuleTemplate.filter(fl => fl.IsCustomer).length > 0 ? true : false;
                            this.hasStaffTemplate = this.automationRuleTemplate.filter(fl => !fl.IsCustomer).length > 0 ? true : false;
                            this.hasStaffPositionTemplate = this.automationRuleTemplate.filter(fl => !fl.IsCustomer).length > 0 ? true : false;
                            this.filterAudienceTemplateByCommunicationType();
                            isPromiseResolved(true);
                        }
                        else {
                            this.eventTypeName = this.defaultEventTypeList.filter(event => event.EventTypeID === this.saveAutomation.EventTypeID)[0].EventTypeName;
                            this.hasTempalte = false;
                            this.hasCustomerTemplate = false;
                            this.hasStaffTemplate = false;
                            this.audienceCustomerEmailtemplate = [];
                            this.audienceCustomerSMStemplate = [];
                            this.audienceCustomerNotificationtemplate = [];
                            this.audienceStaffNotificationtemplate = [];
                            this.audienceStaffEmailtemplate = [];
                            this.audienceStaffSMStemplate = [];
                            this.audienceStaffPositionSMStemplate = [];
                            this.audienceStaffPositionEmailtemplate = [];
                            this.audienceStaffPositionNotificationtemplate = [];

                        }

                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
                );
        });
    }


    mapAutomationRuleSaveModel() {

        // Map Audience Template Selected Values in dropdowns and push in saveAtuomation model for save.
        return new Promise<boolean>((isPromiseResolved, reject) => {
            let isResolved: boolean = true;
            this.saveAutomation.AutomationRuleAudienceCommunication = [];
            this.saveAutomation.RuleAudience = [];

            if (!this.verifyTime()) {
                return isPromiseResolved(false);
            }
            if (!this.verifyStaffPostion()) {
                return isPromiseResolved(false);
            }

            let selectedAudienceCustomer = this.ruleAudienceCustomer.filter(m => m.AudienceChecked)
            let selectedAudienceStaff = this.ruleAudienceStaff.filter(m => m.AudienceChecked);
            if (selectedAudienceCustomer.length == 0 && selectedAudienceStaff.length == 0) {
                this._messageService.showErrorMessage(this.messages.Validation.Auience_Type_Not_Selected);
                return isPromiseResolved(false);
            }
            if (selectedAudienceCustomer.length !== 0) {
                selectedAudienceCustomer.forEach(element => {
                    let audience = new RuleAudience();
                    audience.AudienceTypeID = element.AudienceTypeID;
                    audience.RuleAudienceID = element.RuleAudienceID && element.RuleAudienceID !== undefined ? element.RuleAudienceID : 0;
                    audience.RuleID = element.RuleID && element.RuleAudienceID !== undefined ? element.RuleID : 0;
                    this.saveAutomation.RuleAudience.push(audience);

                    switch (element.AudienceTypeID) {
                        case this.enu_AudienceType.Customer:
                            if (this.audienceTemplate && (
                                this.audienceTemplate.AudienceCustomerEmailIsActive ||
                                this.audienceTemplate.AudienceCustomerSMSIsActive ||
                                this.audienceTemplate.AudienceCustomerNotificationIsActive)) {
                                if (this.audienceTemplate && this.audienceTemplate.AudienceCustomerEmailIsActive) {
                                    let customerEmailTemplateType = new AutomationRuleAudienceCommunication();
                                    customerEmailTemplateType.AudienceTypeID = element.AudienceTypeID;
                                    customerEmailTemplateType.RuleAudienceID = element.RuleAudienceID && element.RuleAudienceID !== undefined ? element.RuleAudienceID : 0;
                                    let filterTemplate = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.Email && (fl.AudienceTypeID === this.enu_AudienceType.Customer))[0];
                                    customerEmailTemplateType.RuleAudienceCommunicationID = filterTemplate ? filterTemplate.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;
                                    customerEmailTemplateType.CommunicationTypeID = this.enu_CommunicationType.Email;
                                    customerEmailTemplateType.TemplateTextID = this.audienceTemplate.CustomerEmailTemplateTextID;
                                    this.saveAutomation.AutomationRuleAudienceCommunication.push(customerEmailTemplateType);

                                }

                                if (this.audienceTemplate && this.audienceTemplate.AudienceCustomerSMSIsActive) {
                                    let customerSMSTemplateType = new AutomationRuleAudienceCommunication();
                                    customerSMSTemplateType.AudienceTypeID = element.AudienceTypeID;
                                    customerSMSTemplateType.RuleAudienceID = element.RuleAudienceID && element.RuleAudienceID !== undefined ? element.RuleAudienceID : 0;
                                    let filterTemplate = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.SMS && (fl.AudienceTypeID === this.enu_AudienceType.Customer))[0];
                                    customerSMSTemplateType.RuleAudienceCommunicationID = filterTemplate ? filterTemplate.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;
                                    customerSMSTemplateType.CommunicationTypeID = this.enu_CommunicationType.SMS;
                                    customerSMSTemplateType.TemplateTextID = this.audienceTemplate.CustomerSMSTemplateTextID;
                                    this.saveAutomation.AutomationRuleAudienceCommunication.push(customerSMSTemplateType);
                                }

                                if (this.audienceTemplate && this.audienceTemplate.AudienceCustomerNotificationIsActive) {
                                    let customerNotficationTemplateType = new AutomationRuleAudienceCommunication();
                                    customerNotficationTemplateType.AudienceTypeID = element.AudienceTypeID;
                                    customerNotficationTemplateType.RuleAudienceID = element.RuleAudienceID && element.RuleAudienceID !== undefined ? element.RuleAudienceID : 0;
                                    let filterTemplate = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.Notification && (fl.AudienceTypeID === this.enu_AudienceType.Customer))[0];
                                    customerNotficationTemplateType.RuleAudienceCommunicationID = filterTemplate ? filterTemplate.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;
                                    customerNotficationTemplateType.CommunicationTypeID = this.enu_CommunicationType.Notification;
                                    customerNotficationTemplateType.TemplateTextID = this.audienceTemplate.CustomerNotficationTemplateTextID;
                                    this.saveAutomation.AutomationRuleAudienceCommunication.push(customerNotficationTemplateType);
                                }
                            }
                            else {
                                isPromiseResolved(isResolved = false);
                                this._messageService.showErrorMessage(this.messages.Validation.Template_Not_Selected.replace("{0}", "customer"));
                                return;
                            }
                            break;

                    }
                });
            }

            if (selectedAudienceStaff.length !== 0) {
                selectedAudienceStaff.forEach(element => {
                    let audience = new RuleAudience();
                    audience.AudienceTypeID = element.AudienceTypeID;
                    audience.RuleAudienceID = element.RuleAudienceID && element.RuleAudienceID !== undefined ? element.RuleAudienceID : 0;
                    audience.RuleID = element.RuleID && element.RuleAudienceID !== undefined ? element.RuleID : 0;
                    this.saveAutomation.RuleAudience.push(audience);

                    switch (element.AudienceTypeID) {
                        case this.enu_AudienceType.RelatedStaff:
                            if (this.audienceTemplate
                                && (this.audienceTemplate.AudienceStaffEmailIsActive
                                    || this.audienceTemplate.AudienceStaffSMSIsActive
                                    || this.audienceTemplate.AudienceStaffNotificationIsActive)) {

                                if (this.audienceTemplate && this.audienceTemplate.AudienceStaffEmailIsActive) {
                                    let relatedStaffEmailTemplateType = new AutomationRuleAudienceCommunication();
                                    relatedStaffEmailTemplateType.AudienceTypeID = element.AudienceTypeID;
                                    relatedStaffEmailTemplateType.RuleAudienceID = element.RuleAudienceID && element.RuleAudienceID !== undefined ? element.RuleAudienceID : 0;
                                    // let filterTemplate = automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.Email && (fl.AudienceTypeID === this.enu_AudienceType.RelatedStaff || fl.AudienceTypeID === this.enu_AudienceType.StaffPosition))[0];
                                    // relatedStaffEmailTemplateType.RuleAudienceCommunicationID = filterTemplate ? filterTemplate.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;

                                    let filterTemplateRelatedStaff = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.Email && fl.AudienceTypeID === this.enu_AudienceType.RelatedStaff)[0];
                                    //  let filterTemplateStaffPosition = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.Email && fl.AudienceTypeID === this.enu_AudienceType.StaffPosition)[0];

                                    // if (this.enu_AudienceType.StaffPosition === (filterTemplateStaffPosition && filterTemplateStaffPosition.AudienceTypeID) && relatedStaffEmailTemplateType.AudienceTypeID > 0) {
                                    //     relatedStaffEmailTemplateType.RuleAudienceCommunicationID = filterTemplateStaffPosition ? filterTemplateStaffPosition.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;
                                    // }
                                    // if (this.enu_AudienceType.RelatedStaff === (filterTemplateRelatedStaff && filterTemplateRelatedStaff.AudienceTypeID)) {
                                    relatedStaffEmailTemplateType.RuleAudienceCommunicationID = filterTemplateRelatedStaff ? filterTemplateRelatedStaff.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;
                                    // }


                                    relatedStaffEmailTemplateType.CommunicationTypeID = this.enu_CommunicationType.Email;
                                    relatedStaffEmailTemplateType.TemplateTextID = this.audienceTemplate.StaffEmailTemplateTextID;
                                    this.saveAutomation.AutomationRuleAudienceCommunication.push(relatedStaffEmailTemplateType);
                                }

                                if (this.audienceTemplate && this.audienceTemplate.AudienceStaffSMSIsActive) {
                                    let relatedStaffSMSTemplateType = new AutomationRuleAudienceCommunication();
                                    relatedStaffSMSTemplateType.AudienceTypeID = element.AudienceTypeID;
                                    relatedStaffSMSTemplateType.RuleAudienceID = element.RuleAudienceID && element.RuleAudienceID !== undefined ? element.RuleAudienceID : 0;
                                    let filterTemplateRelatedStaff = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.SMS && fl.AudienceTypeID === this.enu_AudienceType.RelatedStaff)[0];
                                    // let filterTemplateStaffPosition = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.SMS && fl.AudienceTypeID === this.enu_AudienceType.StaffPosition)[0];
                                    //  if (this.enu_AudienceType.RelatedStaff === (filterTemplateRelatedStaff && filterTemplateRelatedStaff.AudienceTypeID)) {
                                    relatedStaffSMSTemplateType.RuleAudienceCommunicationID = filterTemplateRelatedStaff ? filterTemplateRelatedStaff.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;
                                    //  }
                                    // if (this.enu_AudienceType.StaffPosition === (filterTemplateStaffPosition && filterTemplateStaffPosition.AudienceTypeID)) {
                                    //     relatedStaffSMSTemplateType.RuleAudienceCommunicationID = filterTemplateStaffPosition ? filterTemplateStaffPosition.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;
                                    // }
                                    relatedStaffSMSTemplateType.CommunicationTypeID = this.enu_CommunicationType.SMS;
                                    relatedStaffSMSTemplateType.TemplateTextID = this.audienceTemplate.StaffSMSTemplateTextID;
                                    this.saveAutomation.AutomationRuleAudienceCommunication.push(relatedStaffSMSTemplateType);
                                }

                                if (this.audienceTemplate && this.audienceTemplate.AudienceStaffNotificationIsActive) {
                                    let relatedStaffNotficationTemplateType = new AutomationRuleAudienceCommunication();
                                    relatedStaffNotficationTemplateType.AudienceTypeID = element.AudienceTypeID;
                                    relatedStaffNotficationTemplateType.RuleAudienceID = element.RuleAudienceID && element.RuleAudienceID !== undefined ? element.RuleAudienceID : 0;
                                    //  let filterTemplate = automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.Notification && (fl.AudienceTypeID === this.enu_AudienceType.RelatedStaff || fl.AudienceTypeID === this.enu_AudienceType.StaffPosition))[0];

                                    let filterTemplateRelatedStaff = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.Notification && fl.AudienceTypeID === this.enu_AudienceType.RelatedStaff)[0];
                                    // let filterTemplateStaffPosition = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.Notification && fl.AudienceTypeID === this.enu_AudienceType.StaffPosition)[0];
                                    // if (this.enu_AudienceType.RelatedStaff === (filterTemplateRelatedStaff && filterTemplateRelatedStaff.AudienceTypeID)) {
                                    relatedStaffNotficationTemplateType.RuleAudienceCommunicationID = filterTemplateRelatedStaff ? filterTemplateRelatedStaff.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;
                                    // }
                                    // if (this.enu_AudienceType.StaffPosition === (filterTemplateStaffPosition && filterTemplateStaffPosition.AudienceTypeID)) {
                                    //     relatedStaffNotficationTemplateType.RuleAudienceCommunicationID = filterTemplateStaffPosition ? filterTemplateStaffPosition.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;
                                    // }

                                    // relatedStaffNotficationTemplateType.RuleAudienceCommunicationID = filterTemplate ? filterTemplate.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;

                                    relatedStaffNotficationTemplateType.CommunicationTypeID = this.enu_CommunicationType.Notification;
                                    relatedStaffNotficationTemplateType.TemplateTextID = this.audienceTemplate.StaffNotficationTemplateTextID;
                                    this.saveAutomation.AutomationRuleAudienceCommunication.push(relatedStaffNotficationTemplateType);
                                }
                            }
                            else {
                                isPromiseResolved(isResolved = false);
                                this._messageService.showErrorMessage(this.messages.Validation.Template_Not_Selected.replace("{0}", "related staff"));
                                return;
                            }
                            break;



                        case this.enu_AudienceType.StaffPosition:
                            if (this.audienceTemplate
                                && (this.audienceTemplate.AudienceStaffPositionEmailIsActive
                                    || this.audienceTemplate.AudienceStaffPositionSMSIsActive
                                    || this.audienceTemplate.AudienceStaffPositionNotificationIsActive)) {

                                if (this.audienceTemplate && this.audienceTemplate.AudienceStaffPositionEmailIsActive) {
                                    let relatedStaffEmailTemplateType = new AutomationRuleAudienceCommunication();
                                    relatedStaffEmailTemplateType.AudienceTypeID = element.AudienceTypeID;
                                    relatedStaffEmailTemplateType.RuleAudienceID = element.RuleAudienceID && element.RuleAudienceID !== undefined ? element.RuleAudienceID : 0;
                                    let filterTemplateStaffPosition = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.Email && fl.AudienceTypeID === this.enu_AudienceType.StaffPosition)[0];
                                    relatedStaffEmailTemplateType.RuleAudienceCommunicationID = filterTemplateStaffPosition ? filterTemplateStaffPosition.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;

                                    relatedStaffEmailTemplateType.CommunicationTypeID = this.enu_CommunicationType.Email;
                                    relatedStaffEmailTemplateType.TemplateTextID = this.audienceTemplate.StaffEmailTemplateTextID;
                                    this.saveAutomation.AutomationRuleAudienceCommunication.push(relatedStaffEmailTemplateType);
                                }

                                if (this.audienceTemplate && this.audienceTemplate.AudienceStaffPositionSMSIsActive) {
                                    let relatedStaffSMSTemplateType = new AutomationRuleAudienceCommunication();
                                    relatedStaffSMSTemplateType.AudienceTypeID = element.AudienceTypeID;
                                    relatedStaffSMSTemplateType.RuleAudienceID = element.RuleAudienceID && element.RuleAudienceID !== undefined ? element.RuleAudienceID : 0;

                                    let filterTemplateStaffPosition = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.SMS && fl.AudienceTypeID === this.enu_AudienceType.StaffPosition)[0];

                                    relatedStaffSMSTemplateType.RuleAudienceCommunicationID = filterTemplateStaffPosition ? filterTemplateStaffPosition.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;
                                    relatedStaffSMSTemplateType.CommunicationTypeID = this.enu_CommunicationType.SMS;
                                    relatedStaffSMSTemplateType.TemplateTextID = this.audienceTemplate.StaffSMSTemplateTextID;
                                    this.saveAutomation.AutomationRuleAudienceCommunication.push(relatedStaffSMSTemplateType);
                                }

                                if (this.audienceTemplate && this.audienceTemplate.AudienceStaffPositionNotificationIsActive) {
                                    let relatedStaffNotficationTemplateType = new AutomationRuleAudienceCommunication();
                                    relatedStaffNotficationTemplateType.AudienceTypeID = element.AudienceTypeID;
                                    relatedStaffNotficationTemplateType.RuleAudienceID = element.RuleAudienceID && element.RuleAudienceID !== undefined ? element.RuleAudienceID : 0;

                                    let filterTemplateStaffPosition = this.automationTemplateCopy.filter(fl => fl.CommunicationTypeID === this.enu_CommunicationType.Notification && fl.AudienceTypeID === this.enu_AudienceType.StaffPosition)[0];

                                    relatedStaffNotficationTemplateType.RuleAudienceCommunicationID = filterTemplateStaffPosition ? filterTemplateStaffPosition.RuleAudienceCommunicationID : this.audienceTemplate.RuleAudienceCommunicationID;
                                    relatedStaffNotficationTemplateType.CommunicationTypeID = this.enu_CommunicationType.Notification;
                                    relatedStaffNotficationTemplateType.TemplateTextID = this.audienceTemplate.StaffPositionNotficationTemplateTextID;
                                    this.saveAutomation.AutomationRuleAudienceCommunication.push(relatedStaffNotficationTemplateType);
                                }
                            }
                            else {
                                isPromiseResolved(isResolved = false);
                                this._messageService.showErrorMessage(this.messages.Validation.Template_Not_Selected.replace("{0}", "staff position"));
                                return;
                            }
                            break;

                    }
                });
            }
            if (isResolved) {
                isPromiseResolved(true);
            }
            else {
                isPromiseResolved(false);
            }
        });
    }

    setAudienceValueAsSelected() {
        this.ruleAudienceCustomer.forEach(element => {
            element.AudienceChecked = false;
            this.audienceDisabled.customerSelected = false;
        });
        this.ruleAudienceStaff.forEach(element => {
            element.AudienceChecked = false;
            this.audienceDisabled.relatedStaffSelected = false;
            this.audienceDisabled.staffPositionSeleted = false;
        });
    }

    setAutomationRuleTemplateDropdownValuesAsSelected() {
        this.audienceTemplateDetailByID.forEach(element => {
            if (element.RuleAudienceCommunicationID > 0) {
                let audienceType: any;
                audienceType = this.automationRuleTemplate.filter(fl => fl.TemplateTextID == element.TemplateTextID && fl.AudienceTypeID == element.AudienceTypeID)[0];
                if (audienceType) {
                    switch (audienceType.AudienceTypeID) {
                        case this.enu_AudienceType.Customer:

                            this.audienceDisabled.customerSelected = true;

                            if (audienceType.CommunicationTypeID === this.enu_CommunicationType.Email) {
                                this.audienceTemplate.AudienceCustomerEmailIsActive = true;
                                this.audienceTemplate.CustomerEmailTemplateTextID = audienceType.TemplateTextID;
                                break;
                            }

                            if (audienceType.CommunicationTypeID === this.enu_CommunicationType.Notification) {
                                this.audienceTemplate.AudienceCustomerNotificationIsActive = true;
                                this.audienceTemplate.CustomerNotficationTemplateTextID = audienceType.TemplateTextID;
                                break;
                            }

                            if (audienceType.CommunicationTypeID === this.enu_CommunicationType.SMS) {
                                this.audienceTemplate.AudienceCustomerSMSIsActive = true;
                                this.audienceTemplate.CustomerSMSTemplateTextID = audienceType.TemplateTextID;
                                break;
                            }

                        case this.enu_AudienceType.RelatedStaff:

                            this.audienceDisabled.relatedStaffSelected = true;

                            if (audienceType.CommunicationTypeID === this.enu_CommunicationType.Email) {
                                this.audienceTemplate.AudienceStaffEmailIsActive = true;
                                this.audienceTemplate.StaffEmailTemplateTextID = audienceType.TemplateTextID;
                                break;
                            }
                            if (audienceType.CommunicationTypeID === this.enu_CommunicationType.Notification) {
                                this.audienceTemplate.AudienceStaffNotificationIsActive = true;
                                this.audienceTemplate.StaffNotficationTemplateTextID = audienceType.TemplateTextID;
                                break;
                            }
                            if (audienceType.CommunicationTypeID === this.enu_CommunicationType.SMS) {
                                this.audienceTemplate.AudienceStaffSMSIsActive = true;
                                this.audienceTemplate.StaffSMSTemplateTextID = audienceType.TemplateTextID;
                                break;
                            }

                        case this.enu_AudienceType.StaffPosition:

                            this.audienceDisabled.staffPositionSeleted = true;

                            if (audienceType.CommunicationTypeID === this.enu_CommunicationType.Email) {
                                this.audienceTemplate.AudienceStaffPositionEmailIsActive = true;
                                this.audienceTemplate.StaffPositionEmailTemplateTextID = audienceType.TemplateTextID;
                                break;
                            }
                            if (audienceType.CommunicationTypeID === this.enu_CommunicationType.Notification) {
                                this.audienceTemplate.AudienceStaffPositionNotificationIsActive = true;
                                this.audienceTemplate.StaffPositionNotficationTemplateTextID = audienceType.TemplateTextID;
                                break;
                            }
                            if (audienceType.CommunicationTypeID === this.enu_CommunicationType.SMS) {
                                this.audienceTemplate.AudienceStaffPositionSMSIsActive = true;
                                this.audienceTemplate.StaffPositionSMSTemplateTextID = audienceType.TemplateTextID;
                                break;
                            }


                    }
                }
                else {
                    element.AudienceSelected = false;
                }
            }
        });

    }

    async setBeforeAfterTime() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            if (branch.BranchTimeFormat12Hours == true) {
                this.timeFormat = 'hh:mm a'
            }

        }
     
        if (this.automationID > 0) {
            if (this.saveAutomation.DoNotSendBefore) {
                this.doNotSendBefore = this._dateTimeService.convertTimeStringToDateTime(this.saveAutomation.DoNotSendBefore, this.StartDate);
            }
            if (this.saveAutomation.DoNotSendAfter) {
                this.doNotSendAfter = this._dateTimeService.convertTimeStringToDateTime(this.saveAutomation.DoNotSendAfter, this.StartDate);
            }
        }
    }

    filterAudienceTemplateByCommunicationType() {

        // Filter Audience Customer Email,SMS and Notification Template List and set first value as default value in audienceCustomerTemplate model
        this.audienceCustomerEmailtemplate = this.automationRuleTemplate.filter(a => a.CommunicationTypeID == this.enu_CommunicationType.Email && a.IsCustomer == 1);
        this.audienceTemplate.CustomerEmailTemplateTextID = this.audienceCustomerEmailtemplate && this.audienceCustomerEmailtemplate.length > 0 ? this.audienceCustomerEmailtemplate[0].TemplateTextID : 0;

        this.audienceCustomerSMStemplate = this.automationRuleTemplate.filter(a => a.CommunicationTypeID == this.enu_CommunicationType.SMS && a.IsCustomer == 1);
        this.audienceTemplate.CustomerSMSTemplateTextID = this.audienceCustomerSMStemplate && this.audienceCustomerSMStemplate.length > 0 ? this.audienceCustomerSMStemplate[0].TemplateTextID : 0;

        this.audienceCustomerNotificationtemplate = this.automationRuleTemplate.filter(a => a.CommunicationTypeID == this.enu_CommunicationType.Notification && a.IsCustomer == 1);
        this.audienceTemplate.CustomerNotficationTemplateTextID = this.audienceCustomerNotificationtemplate && this.audienceCustomerNotificationtemplate.length > 0 ? this.audienceCustomerNotificationtemplate[0].TemplateTextID : 0;

        // Filter Audience Related Staff Email,SMS and Notification Template List and set first value as default value in audienceCustomerTemplate model
        this.audienceStaffEmailtemplate = this.automationRuleTemplate.filter(a => a.CommunicationTypeID == this.enu_CommunicationType.Email && a.AudienceTypeID == this.enu_AudienceType.RelatedStaff && a.IsCustomer == 0);
        this.audienceTemplate.StaffEmailTemplateTextID = this.audienceStaffEmailtemplate && this.audienceStaffEmailtemplate.length > 0 ? this.audienceStaffEmailtemplate[0].TemplateTextID : 0;

        this.audienceStaffSMStemplate = this.automationRuleTemplate.filter(a => a.CommunicationTypeID == this.enu_CommunicationType.SMS && a.AudienceTypeID == this.enu_AudienceType.RelatedStaff && a.IsCustomer == 0);
        this.audienceTemplate.StaffSMSTemplateTextID = this.audienceStaffSMStemplate && this.audienceStaffSMStemplate.length > 0 ? this.audienceStaffSMStemplate[0].TemplateTextID : 0;

        this.audienceStaffNotificationtemplate = this.automationRuleTemplate.filter(a => a.CommunicationTypeID == this.enu_CommunicationType.Notification && a.AudienceTypeID == this.enu_AudienceType.RelatedStaff && a.IsCustomer == 0);
        this.audienceTemplate.StaffNotficationTemplateTextID = this.audienceStaffNotificationtemplate && this.audienceStaffNotificationtemplate.length > 0 ? this.audienceStaffNotificationtemplate[0].TemplateTextID : 0;

        // Filter Audience Staff Position Email,SMS and Notification Template List and set first value as default value in audienceCustomerTemplate model
        this.audienceStaffPositionEmailtemplate = this.automationRuleTemplate.filter(a => a.CommunicationTypeID == this.enu_CommunicationType.Email && a.AudienceTypeID == this.enu_AudienceType.StaffPosition && a.IsCustomer == 0);
        this.audienceTemplate.StaffPositionEmailTemplateTextID = this.audienceStaffPositionEmailtemplate && this.audienceStaffPositionEmailtemplate.length > 0 ? this.audienceStaffPositionEmailtemplate[0].TemplateTextID : 0;

        this.audienceStaffPositionSMStemplate = this.automationRuleTemplate.filter(a => a.CommunicationTypeID == this.enu_CommunicationType.SMS && a.AudienceTypeID == this.enu_AudienceType.StaffPosition && a.IsCustomer == 0);
        this.audienceTemplate.StaffPositionSMSTemplateTextID = this.audienceStaffPositionSMStemplate && this.audienceStaffPositionSMStemplate.length > 0 ? this.audienceStaffPositionSMStemplate[0].TemplateTextID : 0;

        this.audienceStaffPositionNotificationtemplate = this.automationRuleTemplate.filter(a => a.CommunicationTypeID == this.enu_CommunicationType.Notification && a.AudienceTypeID == this.enu_AudienceType.StaffPosition && a.IsCustomer == 0);
        this.audienceTemplate.StaffPositionNotficationTemplateTextID = this.audienceStaffPositionNotificationtemplate && this.audienceStaffPositionNotificationtemplate.length > 0 ? this.audienceStaffPositionNotificationtemplate[0].TemplateTextID : 0;


    }

    filterEventTypeAndBind() {
        if (this.saveAutomation.EventCategoryTypeID > 0) {
            return new Promise<boolean>((isPromiseResolved, reject) => {
                this.eventType = this.defaultEventTypeList.filter(event => event.EventCategoryTypeID === this.saveAutomation.EventCategoryTypeID);
                isPromiseResolved(true);
            });
        }
    }

    getTimeFromDate(date: Date) {
        return this._dateTimeService.getTimeStringFromDate(date);
    }

    setRuleAudience() {
        this.rebindEventTypeDropdown();
        if (this.audienceCustomerEditList && this.audienceCustomerEditList.length > 0) {
            this.audienceCustomerEditList.forEach((element, i) => {
                let index: number = this.ruleAudienceCustomer.findIndex(fl => fl.AudienceTypeID === element.AudienceTypeID);
                this.ruleAudienceCustomer[index].AudienceChecked = true;
                this.ruleAudienceCustomer[index].RuleAudienceID = element.RuleAudienceID;
                this.ruleAudienceCustomer[index].RuleID = element.RuleID;
            });
        }
        if (this.audienceStaffEditList && this.audienceStaffEditList.length > 0) {
            this.audienceStaffEditList.forEach((element, i) => {
                let index: number = this.ruleAudienceStaff.findIndex(fl => fl.AudienceTypeID === element.AudienceTypeID);
                this.ruleAudienceStaff[index].AudienceChecked = true;
                this.ruleAudienceStaff[index].RuleAudienceID = element.RuleAudienceID;
                this.ruleAudienceStaff[index].RuleID = element.RuleID;
            });
        }
    }

    setAutomationRuleAudienceGroup(automationRuleAudienceGroup: AutomationRuleAudienceGroup[]) {
        automationRuleAudienceGroup.forEach(element => {
            let staffPosition = new AutomationRuleAudienceGroup();
            staffPosition = this.automationRuleStaffPosition.filter(fl => fl.StaffPositionID === element.AudienceGroupID)[0];
            this.selectedStaffPosition.push(staffPosition);
        });
        this.audienceDisabled.staffPositionSeleted = true;
    }

    preventDecimalValue(e: any) {
        if (e.key === ".") e.preventDefault();
    }

    mapSelectedStaffPosition() {
        return new Promise<boolean>((isPromiseResolved, reject) => {
            if (this.selectedStaffPosition && this.selectedStaffPosition.length > 0) {
                this.saveAutomation.AutomationRuleAudienceGroup = [];
                this.selectedStaffPosition.forEach(element => {
                    let automationRuleStaffPosition = new AutomationRuleAudienceGroup();
                    if (this.staffPositionList && this.staffPositionList.length > 0) {
                        let staffPosition = this.staffPositionList.filter(fl => fl.AudienceGroupID === element.StaffPositionID)[0];
                        automationRuleStaffPosition.AudienceGroupID = staffPosition && staffPosition.AudienceGroupID > 0 ? staffPosition.AudienceGroupID : element.StaffPositionID;
                        automationRuleStaffPosition.RuleAudienceGroupID = staffPosition && staffPosition.RuleAudienceGroupID > 0 ? staffPosition.RuleAudienceGroupID : 0;
                        automationRuleStaffPosition.AudienceGroupName = staffPosition && staffPosition.AudienceGroupName != "" ? staffPosition.AudienceGroupName : element.StaffPositionName;
                        automationRuleStaffPosition.RuleAudienceID = staffPosition && staffPosition.RuleAudienceID > 0 ? staffPosition.RuleAudienceID : 0;
                    }
                    else {
                        automationRuleStaffPosition.AudienceGroupID = element.StaffPositionID;
                        automationRuleStaffPosition.RuleAudienceGroupID = 0;
                        automationRuleStaffPosition.RuleAudienceID = 0;
                        automationRuleStaffPosition.AudienceGroupName = element.StaffPositionName;
                    }

                    this.saveAutomation.AutomationRuleAudienceGroup.push(automationRuleStaffPosition);
                });
                return isPromiseResolved(true);
            }

            else {
                return isPromiseResolved(false);
            }
        });

    }

    verifyTime(): boolean {
        if ((this.saveAutomation.DoNotSendAfter == "" || this.saveAutomation.DoNotSendAfter == null) && (this.saveAutomation.DoNotSendBefore == "" || this.saveAutomation.DoNotSendBefore == null)) {
            return (true);
        }
        else {
            if (this.saveAutomation.DoNotSendAfter == "" || this.saveAutomation.DoNotSendAfter == null) {
                this._messageService.showErrorMessage(this.messages.Validation.Do_Not_Send_After_Time);
                return (false);
            }
            if (this.saveAutomation.DoNotSendBefore == "" || this.saveAutomation.DoNotSendBefore == null) {
                this._messageService.showErrorMessage(this.messages.Validation.Do_Not_Send_Before_Time);
                return (false);
            }
            return (true);
        }
    }

    verifyStaffPostion(): boolean {
        if (this.audienceDisabled.staffPositionSeleted) {
            if (this.selectedStaffPosition.length > 0) {
                this.mapSelectedStaffPosition();
                return (true);
            }
            else {
                this._messageService.showErrorMessage(this.messages.Validation.Staff_Position_Not_Selected);
                return (false);
            }
        }
        else {
            this.saveAutomation.AutomationRuleAudienceGroup = null;
            return (true);
        }
    }

    rebindEventTypeDropdown() {
        this.selectedStaffPosition = [];
        this.ruleAudienceStaff = this.audienceStaffDefaultList;
        if (this.saveAutomation.EventTypeID === this.enu_NotificationTrigger.PaymentFailed
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.LeadAssigned
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.NewLead
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.CustomerIncomingEmail
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.CustomerIncomingSMS
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.StaffIncomingEmail
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.StaffIncomingSMS
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.MembershipExpiry
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.MembershipIsSold

            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.BookedFromClassWaitlist
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.BookedFromServiceWaitlist
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.ServiceBookingIsCancelled
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.ClassBookingIsCancelled
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.ServiceCheckedInByCustomer
            || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.ClassCheckedInByCustomer
            ) {


            if (this.saveAutomation.EventTypeID === this.enu_NotificationTrigger.PaymentFailed
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.LeadAssigned
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.NewLead
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.StaffIncomingEmail
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.StaffIncomingSMS
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.CustomerIncomingEmail
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.CustomerIncomingSMS
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.MembershipExpiry
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.MembershipIsSold) {
                this.ruleAudienceStaff = this.audienceStaffDefaultList.filter(staff => staff.AudienceTypeID == this.enu_AudienceType.StaffPosition);
            }
            if (this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.NewLead) {
                this.ruleAudienceStaff = this.audienceStaffDefaultList;
            }
            if (this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.LeadAssigned) {
                this.ruleAudienceStaff = this.audienceStaffDefaultList.filter(staff => staff.AudienceTypeID == this.enu_AudienceType.RelatedStaff);
            }

            if(this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.BookedFromClassWaitlist
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.BookedFromServiceWaitlist
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.ServiceBookingIsCancelled
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.ClassBookingIsCancelled
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.ServiceCheckedInByCustomer
                || this.saveAutomation.EventTypeID == this.enu_NotificationTrigger.ClassCheckedInByCustomer){
                this.ruleAudienceStaff = this.audienceStaffDefaultList;
            }
        }
        else {
            this.ruleAudienceStaff = this.audienceStaffDefaultList.filter(staff => staff.AudienceTypeID == this.enu_AudienceType.RelatedStaff);
        }
    }
    
    filterAudienceTypeWithPermission() {
        this.selectedStaffPosition = [];
        this.ruleAudienceStaff = [];

        if (this.automationPermission.AllowCustomer) {
            this.ruleAudienceStaff.push(this.audienceStaffDefaultList.filter(staff => staff.AudienceTypeID == this.enu_AudienceType.Customer)[0]);
        }
        if (this.automationPermission.AllowRelatedStaff) {
            this.ruleAudienceStaff.push(this.audienceStaffDefaultList.filter(staff => staff.AudienceTypeID == this.enu_AudienceType.RelatedStaff)[0]);
        }
        if (this.automationPermission.AllowStaffPosition) {
            this.ruleAudienceStaff.push(this.audienceStaffDefaultList.filter(staff => staff.AudienceTypeID == this.enu_AudienceType.StaffPosition)[0]);
        }
    }

    // #endregion
}
