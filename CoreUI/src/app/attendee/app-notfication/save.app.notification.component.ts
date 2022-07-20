/********************** Angular Refrences *********************/
import { Component, OnInit, OnDestroy, ViewChild, EventEmitter, Input } from '@angular/core';
import { NgForm } from "@angular/forms";
import { SubscriptionLike as ISubscription } from 'rxjs';
/********************** Angular Material Refrences *********************/

/********************** Common *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { Template, ActivityPersonInfo, AppNotification } from 'src/app/models/activity.model';
import { TemplateType } from 'src/app/helper/config/app.enums';
import { Messages } from 'src/app/helper/config/app.messages';
import { NumberFormatStyle } from '@angular/common';

@Component({
    selector:'save-app-notification',
    templateUrl:'./save.app.notification.component.html'
})

export class SaveAppNotificationComponent implements OnInit, OnDestroy {

    
    @ViewChild('appNotificationForm') appNotificationForm: NgForm;
    @Input() appNotificationModel: any;
    @Input() urls: any;
    notificationSaved = new EventEmitter<boolean>();

    isInvalidData: boolean = false;
    personInfo: ActivityPersonInfo;
    selectedTemplate: Template;
    personInfoSubscription: ISubscription;


    contactReasonTypeList: any[];
    templateTextList: any[];

    tepmplateVariableList = Configurations.TemplateVariableList;
    messages = Messages;

    constructor(
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService
    ) {

    }

    ngOnInit() {
        this.personInfoSubscription = this._dataSharingService.activityPersonInfo.subscribe((personInfo: ActivityPersonInfo) => {
            if (personInfo) {
                this.personInfo = personInfo;
            }
        });

        this.getTemplateFundamentals();
    }

    ngOnDestroy(){
        this.personInfoSubscription.unsubscribe();
    }


    getTemplateFundamentals(){
        this._httpService.get(this.urls.getTemplateFundamentals + TemplateType.SMS).subscribe(
            data => {
                // Set fundamentals
                if (data && data.Result) {
                    this.templateTextList = data.Result.TemplateTextList;
                    this.contactReasonTypeList = data.Result.ContactReasonTypeList;
                    this.setEmailOrSMSDropdowns();
                }else{
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
        );
    }

    onTemplateChange(template: Template) {
        this.setTemplateForSMS(template);
    }


    setEmailOrSMSDropdowns() {
        this.templateTextList.splice(0, 0, { TemplateTextID: null, TemplateTextTitle: "No Template" });
        this.selectedTemplate = this.templateTextList[0];

        if (this.contactReasonTypeList && this.contactReasonTypeList.length > 0) {
            this.appNotificationModel.ContactReasonTypeID = this.contactReasonTypeList[0].ContactReasonTypeID;
        }
    }

    saveAppNotification() {
        if (this.appNotificationForm.valid) {
            this._httpService.save(this.urls.saveAppNotification, this.appNotificationModel)
                .subscribe(
                    res => {
                        if (res && res.MessageCode && res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "App Notification"));
                            this.notificationSaved.next(true);
                        }
                        else{
                            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "App Notification"));
                        }
                    },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "App Notification"));
                    }
                )
        }
        else {
            this.showValidationMessage(true);

        }

    }

    saveGroupAppNotification() {
        if (this.appNotificationForm.valid) {
            this._httpService.save(this.urls.saveGroupNotification, this.appNotificationModel)
                .subscribe(
                    res => {
                        if (res && res.MessageCode && res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Push Notification"));
                            this.notificationSaved.next(true);
                        }
                        else{
                            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Push Notification"));
                        }
                    },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Push Notification"));
                    }
                )
        }
        else {
            this.showValidationMessage(true);

        }

    }

    showValidationMessage(isVisible: boolean) {
        this.isInvalidData = isVisible;
        this.notificationSaved.next(false);

    }

    setTemplateForSMS(template: Template) {
        if (template && template.TemplateTextID > 0) {
            let templateDescription = this.getTemplateDescription(template.TemplateTextID);

            if (templateDescription) {
                templateDescription.subscribe((data: any) => {
                    if (data && data.Result && data.Result.TemplateText) {
                        this.appNotificationModel.Title = template.TemplateTextTitle;
                        this.appNotificationModel.Description = this.replaceTemplateVariables(data.Result.TemplateText.TemplateTextDescription);
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

    getTemplateDescription(templateTextId: NumberFormatStyle): any {
        let url = this.appNotificationModel.CustomerID ?
                    this.urls.getTemplateDescription.replace("{templateTextID}", templateTextId.toString())
                        .replace("{templateTypeID}", TemplateType.SMS)
                        .replace("{cutomerID}", this.appNotificationModel.CustomerID.toString()) 
                    : this.urls.getTemplateDescription.replace("{templateTextID}", templateTextId.toString())
                        .replace("{templateTypeID}", TemplateType.SMS)
            ;
        return this._httpService.get(url);
    }

    replaceTemplateVariables(description: string) {
        if (description && this.personInfo) {
            this.tepmplateVariableList.forEach(templateVar => {
                if (description && description.indexOf(templateVar) >= 0) {
                    if (templateVar === "[Member Name]" || templateVar === "[Client Name]" || templateVar === "[Lead Name]") {
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
}