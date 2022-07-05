/********************** Angular Refrences *********************/
import { Component, OnInit, OnDestroy, ViewChild, EventEmitter, Input } from '@angular/core';
import { NgForm } from "@angular/forms";
import { SubscriptionLike as ISubscription } from 'rxjs';
/********************** Angular Material Refrences *********************/
/********************** Common *********************/
import { Configurations } from '@helper/config/app.config';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { DataSharingService } from '@app/services/data.sharing.service';
import { Template, ActivityPersonInfo } from '@app/models/activity.model';
import { TemplateType } from '@app/helper/config/app.enums';
import { Messages } from '@app/helper/config/app.messages';
import { ApiResponse } from '@app/models/common.model';



@Component({
    selector: 'save-sms',
    templateUrl: './save.sms.component.html'
})
export class SaveSMSComponent implements OnInit, OnDestroy {

    @ViewChild('smsForm') smsForm: NgForm;
    @Input() smsModel: any;
    @Input() urls: any;
    smsSaved = new EventEmitter<boolean>();
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

    ngOnDestroy() {
        this.personInfoSubscription.unsubscribe();
    }

    onTemplateChange(template: Template) {
        this.setTemplateForSMS(template);
    }


    getTemplateFundamentals() {
        let url;
        url = this.urls.getTemplateFundamentals + TemplateType.SMS;

        this._httpService.get(url).subscribe(
            (res: ApiResponse) => {
                // Set fundamentals
                if (res && res.MessageCode > 0) {
                    if (res && res.Result) {
                        this.templateTextList = res.Result.TemplateTextList;
                        this.contactReasonTypeList = res.Result.ContactReasonTypeList;
                        this.setEmailOrSMSDropdowns();
                    }
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

        if (this.contactReasonTypeList && this.contactReasonTypeList.length > 0) {
            this.smsModel.ContactReasonTypeID = this.contactReasonTypeList[0].ContactReasonTypeID;
        }
    }

    setTemplateForSMS(template: Template) {
        if (template && template.TemplateTextID > 0) {
            let templateDescription = this.getTemplateDescription(template.TemplateTextID, TemplateType.SMS);

            if (templateDescription) {
                templateDescription.subscribe((res: ApiResponse) => {
                    if (res && res.Result && res.Result.TemplateText) {
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

    getTemplateDescription(templateTextId: number, templateTypeId: number): any {
        let url = this.smsModel.CustomerID ?
                    this.urls.getTemplateDescription.replace("{templateTextID}", templateTextId.toString())
                        .replace("{templateTypeID}", templateTypeId.toString())
                        .replace("{cutomerID}", this.smsModel.CustomerID.toString()) 
                    : this.urls.getTemplateDescription.replace("{templateTextID}", templateTextId.toString())
                        .replace("{templateTypeID}", templateTypeId.toString()) .replace("{cutomerID}", 0);
            ;
        return this._httpService.get(url);
    }

    saveSMS() {
        if (this.smsForm.valid) {
            this._httpService.save(this.urls.saveSMS, this.smsModel)
                .subscribe(
                    (res: ApiResponse) => {
                        if (res && res.MessageCode && res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Sent_Success.replace("{0}", "SMS"));
                            this.smsSaved.next(true);
                        }
                        else {
                            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "SMS"));
                        }
                    },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "SMS"));
                    }
                )
        }
        else {
            this.showValidationMessage(true);
        }
    }

    saveGroupSMS() {
        if (this.smsForm.valid) {
            this._httpService.save(this.urls.saveGroupSMS, this.smsModel)
                .subscribe(
                    (res: ApiResponse) => {
                        if (res && res.MessageCode && res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Sent_Success.replace("{0}", "Attendees SMS"));
                            this.smsSaved.next(true);
                        }
                        else {
                            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Attendees SMS"));
                        }
                    },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Attendees SMS"));
                    }
                )
        }
        else {
            this.showValidationMessage(true);
        }
    }

    showValidationMessage(isVisible: boolean) {
        this.isInvalidData = isVisible;
        this.smsSaved.next(false);
    }

}