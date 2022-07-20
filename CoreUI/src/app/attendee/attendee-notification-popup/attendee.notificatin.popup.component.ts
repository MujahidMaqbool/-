/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


import { SMSActivity, EmailActivity, AppNotification, GroupActivity } from 'src/app/models/activity.model';
import { ENU_ActivityType, CustomerType } from 'src/app/helper/config/app.enums';
import { ClientActivityApi, MemberActivityApi, LeadActivityApi, GroupActivityApi } from 'src/app/helper/config/app.webapi';
import { SaveAppNotificationComponent } from 'src/app/attendee/app-notfication/save.app.notification.component';
import { SaveSMSComponent } from 'src/app/attendee/sms/save.sms.component';
import { SaveEmailComponent } from 'src/app/attendee/email/save.email.component';

@Component({
    selector: 'attendee.notificatin.popup',
    templateUrl: './attendee.notificatin.popup.component.html'
})

export class AttendeeNotificationComponent implements OnInit {
    @ViewChild('saveSmsRef') saveSmsRef: SaveSMSComponent;
    @ViewChild('saveEmailRef') saveEmailRef: SaveEmailComponent;
    @ViewChild('saveAppNotificationRef') saveAppNotificationRef: SaveAppNotificationComponent;
    saveSMSDialogRef: any;

    smsModel: SMSActivity;
    emailModel: EmailActivity;
    appNotificationModel: AppNotification;
    componentTitleName: string = "";

    groupSMSModel: GroupActivity;
    groupEmailModel: GroupActivity;
    groupPushNotificationModel: GroupActivity;

    urls: any;
    isSaveSMS: boolean = false;
    isSaveEmail: boolean = false;
    isSaveAppNotification: boolean = false;
    isLead: boolean = false;

    isSaveGroupSMS: boolean = false;
    isSaveGroupEmail: boolean = false;
    isSaveGroupAppNotification: boolean = false;

    activityType = ENU_ActivityType;
    /***********Class Constructor*********/
    constructor(
        public dialogRef: MatDialogRef<AttendeeNotificationComponent>,
        @Inject(MAT_DIALOG_DATA) public activityInfo: any) {

    }

    ngOnInit() {
        this.initializeModel();
    }

    onSave() {
        switch (this.activityInfo.activityTypeId) {
            case this.activityType.SMS:
                this.saveSmsRef.saveSMS();
                this.isSMSSave();
                break;

            case this.activityType.Email:
                this.saveEmailRef.saveEmail();
                this.isEmailSave()
                break;

            case this.activityType.AppNotification:
                this, this.saveAppNotificationRef.saveAppNotification();
                this.isNotificationSave();
                break;
            case this.activityType.GroupSMS:
                this.saveSmsRef.saveGroupSMS();
                this.isSMSSave();
                break;

            case this.activityType.GroupEmail:
                this.saveEmailRef.saveGroupEmail();
                this.isEmailSave()
                break;

            case this.activityType.GroupPushNotification:
                this, this.saveAppNotificationRef.saveGroupAppNotification();
                this.isNotificationSave();
                break;
        }
    }

    initializeModel() {
        switch (this.activityInfo.customerTypeID) {
            case CustomerType.Client:
                this.urls = ClientActivityApi;
                this.initializeModelsByActivityType();
                break;

            case CustomerType.Lead:
                this.urls = LeadActivityApi;
                this.initializeModelsByActivityType();
                break;
            case CustomerType.Member:
                this.urls = MemberActivityApi;
                this.initializeModelsByActivityType();
                break;
            default:
                this.urls = GroupActivityApi;
                this.initializeModelsByActivityType();
                break;
        }
    }

    initializeModelsByActivityType() {
        switch (this.activityInfo.activityTypeId) {
            case this.activityType.SMS:
                this.smsModel = new SMSActivity();
                this.smsModel.CustomerID = this.activityInfo.customerID;
                this.smsModel.TemplateTextID = null;
                this.isSaveSMS = true;
                this.componentTitleName = "SMS";
                break;

            case this.activityType.Email:
                this.emailModel = new EmailActivity();
                this.emailModel.CustomerID = this.activityInfo.customerID;
                this.emailModel.TemplateTextID = null;
                this.isSaveEmail = true;
                this.componentTitleName = "Email";

                break;
            case this.activityType.AppNotification:
                this.appNotificationModel = new AppNotification();
                this.appNotificationModel.CustomerID = this.activityInfo.customerID;

                this.isSaveAppNotification = true;
                this.componentTitleName = "App Notification";

                break;
            
            case this.activityType.GroupSMS:
                this.groupSMSModel = new GroupActivity();
                this.groupSMSModel.ClassID = this.activityInfo.classID;
                this.groupSMSModel.ClassDate = this.activityInfo.classDate;
                this.isSaveGroupSMS = true;
                this.componentTitleName = "SMS to Attendees";

                break;

            case this.activityType.GroupEmail:
                this.groupEmailModel = new GroupActivity();
                this.groupEmailModel.ClassID = this.activityInfo.classID;
                this.groupEmailModel.ClassDate = this.activityInfo.classDate;
                this.isSaveGroupEmail = true;
                this.componentTitleName = "Email to Attendees";

                break;

            case this.activityType.GroupPushNotification:
                this.groupPushNotificationModel = new GroupActivity();
                this.groupPushNotificationModel.ClassID = this.activityInfo.classID;
                this.groupPushNotificationModel.ClassDate = this.activityInfo.classDate;

                this.isSaveGroupAppNotification = true;
                this.componentTitleName = "Push Notification to Attendees";

                break;
        }
    }

    onClosePopup() {
        this.dialogRef.close();
    }

    isSMSSave() {
        this.saveSmsRef.smsSaved.subscribe(isSaved => {
            if (isSaved) {
                this.onClosePopup();
            }
        });
    }

    isEmailSave() {
        this.saveEmailRef.emailSaved.subscribe(isSaved => {
            if (isSaved) {
                this.onClosePopup();
            }
        });
    }

    isNotificationSave() {
        this.saveAppNotificationRef.notificationSaved.subscribe(isSaved => {
            if (isSaved) {
                this.onClosePopup();
            }
        });
    }
}
