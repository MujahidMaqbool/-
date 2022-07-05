/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild, Output, EventEmitter, Inject, OnDestroy, Input } from '@angular/core';
import { NgForm } from "@angular/forms";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubscriptionLike as ISubscription } from "rxjs";

import { HttpService } from "@app/services/app.http.service";
import { DataSharingService } from "@app/services/data.sharing.service";
import { MessageService } from "@app/services/app.message.service";
import { ActivityPersonInfo, Template } from '@app/models/activity.model';
import { Configurations } from '@app/helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { TemplateType } from '@app/helper/config/app.enums';


@Component({
    selector: 'save-email',
    templateUrl: './save.email.component.html'
})


export class SaveEmailComponent implements OnInit, OnDestroy {

    @ViewChild('emailForm') emailForm: NgForm;
    @Input() emailModel: any;
    @Input() urls: any;
    @Output()
    emailSaved = new EventEmitter<boolean>();

    personInfo: ActivityPersonInfo;
    selectedTemplate: Template;
    personInfoSubscription: ISubscription;
    emailSubscription: ISubscription;
    personEmail: string;
    isInvalidData: boolean = false;
    isInvalidEmailBody: boolean = false;
    emailMaxLengthMessage: string;

    contactReasonTypeList: any[];
    templateTextList: any[];

    tepmplateVariableList = Configurations.TemplateVariableList;
    messages = Messages;
    emailMaxLength = Configurations.EmailMaxLength;


    constructor(
        private _httpService: HttpService,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService,
        @Inject(MAT_DIALOG_DATA) public tabsOptions: any) { }

    ngOnInit() {
        this.emailSubscription = this._dataSharingService.activityPersonInfo.subscribe((personInfo: ActivityPersonInfo) => {
            if (personInfo) {
                this.personInfo = personInfo;
                this.personEmail = personInfo.Email;
            }
        });

        this.getTemplateFundamentals();
    }

    ngOnDestroy() {
        this.emailSubscription.unsubscribe();
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

    getTemplateFundamentals() {
        this._httpService.get(this.urls.getTemplateFundamentals + TemplateType.Email).subscribe(
            data => {
                // Set fundamentals
                if (data && data.Result) {
                    this.templateTextList = data.Result.TemplateTextList;
                    this.contactReasonTypeList = data.Result.ContactReasonTypeList;
                    this.setEmailOrSMSDropdowns();
                }
                else{
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
        );
    }


    setTemplateForEmail(template: Template) {
        if (template && template.TemplateTextID > 0) {
            let templateDescription = this.getTemplateDescription(template.TemplateTextID, TemplateType.Email)
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

    getTemplateDescription(templateTextId: number, templateTypeId: number): any {
        let url = this.emailModel.CustomerID ? 
                    this.urls.getTemplateDescription.replace("{templateTextID}", templateTextId.toString())
                        .replace("{templateTypeID}", templateTypeId.toString())
                        .replace("{cutomerID}", this.emailModel.CustomerID.toString())
                        : this.urls.getTemplateDescription.replace("{templateTextID}", templateTextId.toString())
                            .replace("{templateTypeID}", templateTypeId.toString()).replace("{cutomerID}", 0);
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



    setEmailOrSMSDropdowns() {
        this.templateTextList.splice(0, 0, { TemplateTextID: null, TemplateTextTitle: "No Template" });
        this.selectedTemplate = this.templateTextList[0];

        if (this.contactReasonTypeList && this.contactReasonTypeList.length > 0) {
            this.emailModel.ContactReasonTypeID = this.contactReasonTypeList[0].ContactReasonTypeID;
        }
    }

    

    saveEmail() {
        if (this.emailForm.valid && !this.isInvalidEmailBody) {
            this._httpService.save(this.urls.saveEmail, this.emailModel)
                .subscribe(
                    res => {
                        if (res && res.MessageCode && res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Sent_Success.replace("{0}", "Email"));
                            this.emailSaved.emit(true);
                        }
                        else {
                            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Email"));
                        }
                    },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Email"));
                    }
                )
        }
        else {
            this.showValidationMessage(true);

        }

    }

    saveGroupEmail() {
        if (this.emailForm.valid && !this.isInvalidEmailBody) {
            this.emailModel.Title = this.emailModel.EmailSubject;
            this.emailModel.Description = this.emailModel.EmailBody;
            this.emailModel.EmailSubject = "";
            this.emailModel.EmailBody = "";
            this._httpService.save(this.urls.saveGroupEmail, this.emailModel)
                .subscribe(
                    res => {
                        if (res && res.MessageCode && res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Sent_Success.replace("{0}", "Attendees Email"));
                            this.emailSaved.emit(true);
                        }
                        else {
                            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Attendees Email"));
                        }
                    },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Attendees Email"));
                    }
                )
        }
        else {
            this.showValidationMessage(true);

        }

    }

    showValidationMessage(isVisible: boolean) {
        this.isInvalidData = isVisible;
        this.emailSaved.next(false);

    }


    onTemplateChange(template: Template) {
        this.setTemplateForEmail(template);
    }

}