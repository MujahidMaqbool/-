/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild, Inject, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { NgForm } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/*************************** Services & Models *************************/
/* Models*/
import { TemplateView } from 'src/app/setup/models/template.model';

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { Configurations } from 'src/app/helper/config/app.config';
import { Messages } from 'src/app/helper/config/app.messages';
import { TemplateApi } from 'src/app/helper/config/app.webapi';
import { TemplateType } from 'src/app/helper/config/app.enums';

/*************************** Common & Customs *************************/


@Component({
  selector: 'template-save',
  templateUrl: './template.save.component.html'
})
export class TemplateSaveComponent implements OnInit {

  // #region Local Members

  /* Template form Reference*/
  @ViewChild('emailTemplateForm') emailTemplateForm: NgForm;
  @ViewChild('TemplateFormSMS') templateFormSMS: NgForm;
  @ViewChild('TemplateFormNotification') templateFormNotification: NgForm;

  @Output()
  templateSaved = new EventEmitter<boolean>();

  /*Model Reference*/
  templateSMSModel: TemplateView = new TemplateView();
  templateNotificationModel: TemplateView = new TemplateView();
  templateEmailModel: TemplateView = new TemplateView();

  /* Configurations */
  templateType = TemplateType;
  templateTypes = Configurations.TemplateTypes;

  /* Local members*/
  pageTitle: string = "Template";
  activeTab: string = "Email";
  readonly _maxEmailBodyLength = 2500;
  readonly _maxSMSBodyLength = 160;
  readonly _maxNotificationBodyLength = 160;

  disableModule: boolean = false;
  moduleID: number;
  variableModuleID : number;
  isLoadVariableModule: boolean = false;
  isEdit : boolean = false;
  /* Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;
  isInvalidData: boolean = false;
  isInvalidEmailBody: boolean = false;
  isInvalidSMSBody: boolean = false;
  isInvalidNotificationBody: boolean = false;

  emailMaxLengthMessage: string;
  smsMaxLengthMessage: string;
  notificationMaxLengthMessage: string;

  /* Collection Types*/
  moduleList: any[] = []
  moduleVariableList: any[] = []
  moduleIlteredVariableList : any[] = [];
  variableList: any[] = [];

  // #endregion

  constructor(
    private _httpService: HttpService,
    private _messageService: MessageService,
    public dialogRef: MatDialogRef<TemplateSaveComponent>,
    @Inject(MAT_DIALOG_DATA)
    public templateDetailsDataObj: any, private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getFundamentals();
    this.getFundamentalsVariableModule();
    this.emailMaxLengthMessage = Messages.Validation.Email_MaxLength.replace("{0}", this._maxEmailBodyLength.toString());
    this.smsMaxLengthMessage = Messages.Validation.SMS_MaxLength.replace("{0}", this._maxSMSBodyLength.toString());
    this.notificationMaxLengthMessage = Messages.Validation.Notification_MaxLength.replace("{0}", this._maxNotificationBodyLength.toString());
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
}
  // #region Events

  onModuleChange(moduleid : number){
    this.moduleIlteredVariableList = this.moduleVariableList.filter(x => x.ModuleID == moduleid || x.ModuleID == 1 || x.ModuleID ==2);
    this.variableModuleID = this.moduleIlteredVariableList[0].ModuleID;
    this.onModuleChangeTemplateVariable(this.moduleIlteredVariableList[0].ModuleID);
  }

  onModuleChangeTemplateVariable(moduleId: number) {
    let param ={
      moduleId : moduleId
    }
    this._httpService.get(TemplateApi.getVariableByModuleId, param)
    .subscribe(data => {
      this.variableList = data.Result;
    });
  }

  onTabChange($event: any) {
    this.showValidationMessage(false);
    this.activeTab = $event.tab.textLabel;
    this.resetAllForms();
  }

   onDropPlaceHoder(data: any) {
     if (this.activeTab === this.templateTypes.Email) {
      this.templateEmailModel.TemplateTextDescription += "[" + data.dragData + "]";
      this.emailTemplateForm.form.markAsDirty();
     }
     if (this.activeTab === this.templateTypes.SMS) {
       this.templateSMSModel.TemplateTextDescription += "[" + data.dragData + "]";
       this.templateFormSMS.form.markAsDirty();
       this.onSMSDescriptionUpdated();
     }
     if (this.activeTab === this.templateTypes.PushNotification) {
      this.templateNotificationModel.TemplateTextDescription += "[" + data.dragData + "]";
      this.templateFormNotification.form.markAsDirty();
      this.onSMSDescriptionUpdated();
    }

     setTimeout(() => {
      this.templateEmailModel.TemplateTextDescription;
    }, 1);
   }

  onSaveSMSTemplate(isValid: boolean) {
    this.saveSMSTemplate(isValid);
  }

  onSaveNotificationTemplate(isValid: boolean) {
    this.saveNotificationTemplate(isValid);
  }

  onSaveEmailTemplate(isValid: boolean) {
    this.saveEmailTemplate(isValid);
  }

  onEmailTitleUpdated() {
    if (this.templateEmailModel.TemplateTextTitle && this.templateEmailModel.TemplateTextTitle.length > 0) {
      this.templateEmailModel.TemplateTextTitle = this.templateEmailModel.TemplateTextTitle.trim();
    }
  }

  onEmailSubjectUpdated() {
    if (this.templateEmailModel.TemplateTextEmailSubject && this.templateEmailModel.TemplateTextEmailSubject.length > 0) {
      this.templateEmailModel.TemplateTextEmailSubject = this.templateEmailModel.TemplateTextEmailSubject.trim();
    }
  }

  onEmailDescriptionUpdated(value: string) {
    this.templateEmailModel.TemplateTextDescription = value === "<br>" ? "" : value;
    if (value && value.length > this._maxEmailBodyLength) {
      this.isInvalidData = true;
      this.isInvalidEmailBody = true;
    }
    else {
      this.emailTemplateForm.form.updateValueAndValidity();
      this.isInvalidData = false;
      this.isInvalidEmailBody = false;
      this.emailTemplateForm.form.markAsDirty();
    }

    setTimeout(() => {
      this.templateEmailModel.TemplateTextDescription;
    }, 1);
  }

  onSMSTitleUpdated() {
    if (this.templateSMSModel.TemplateTextTitle && this.templateSMSModel.TemplateTextTitle.length > 0) {
      this.templateSMSModel.TemplateTextTitle = this.templateSMSModel.TemplateTextTitle.trim();
    }
  }

  onSMSDescriptionUpdated() {
    if (this.templateSMSModel.TemplateTextDescription && this.templateSMSModel.TemplateTextDescription.length > 0) {
      this.templateSMSModel.TemplateTextDescription = this.templateSMSModel.TemplateTextDescription.trim();
    }
    if (this.templateSMSModel.TemplateTextDescription && this.templateSMSModel.TemplateTextDescription.length > this._maxSMSBodyLength) {
      this.isInvalidData = true;
      this.isInvalidSMSBody = true;
    }
    else {
      this.templateFormSMS.form.updateValueAndValidity();
      this.isInvalidData = false;
      this.isInvalidSMSBody = false;
      this.templateFormSMS.form.markAsDirty();
    }
  }

  onNotificationTitleUpdated() {
    if (this.templateNotificationModel.TemplateTextTitle && this.templateNotificationModel.TemplateTextTitle.length > 0) {
      this.templateNotificationModel.TemplateTextTitle = this.templateNotificationModel.TemplateTextTitle.trim();
    }
  }

  onNotificationDescriptionUpdated() {
    if (this.templateNotificationModel.TemplateTextDescription && this.templateNotificationModel.TemplateTextDescription.length > 0) {
      this.templateNotificationModel.TemplateTextDescription = this.templateNotificationModel.TemplateTextDescription.trim();
    }
    if (this.templateNotificationModel.TemplateTextDescription && this.templateNotificationModel.TemplateTextDescription.length > this._maxSMSBodyLength) {
      this.isInvalidData = true;
      this.isInvalidNotificationBody = true;
    }
    else {
      this.templateFormNotification.form.updateValueAndValidity();
      this.isInvalidData = false;
      this.isInvalidNotificationBody = false;
      this.templateFormNotification.form.markAsDirty();
    }
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  // #endregion

  // #region Methods

  getFundamentals() {
    let url = TemplateApi.getFundamentals+"?IsloadVariableModule="+this.isLoadVariableModule;
    this._httpService.get(url)
      .subscribe(data => {
        if(data && data.MessageCode > 0){
        this.moduleList = data.Result;
        this.setDefaultModule();
        if (this.templateDetailsDataObj.Template && this.templateDetailsDataObj.Template.TemplateTextID > 0) {
          this.setEditModeOptions();
        }
        else {
          this.setAddModeOptions();
        }
      }else{
        this._messageService.showErrorMessage(data.MessageText)
      }
    }
      );
  }

  getFundamentalsVariableModule(){
    this.isLoadVariableModule = true;
    let _url = TemplateApi.getFundamentals+"?IsloadVariableModule="+this.isLoadVariableModule;
    this._httpService.get(_url)
    .subscribe(data => {
      if(data && data.MessageCode > 0){
      this.moduleVariableList = data.Result;
      this.moduleIlteredVariableList = data.Result;
      this.variableModuleID = this.moduleVariableList[0].ModuleID;
      if(this.isEdit){
        this.onModuleChange(this.moduleID);
      }
      else{
        this.onModuleChange(this.variableModuleID);
      }
    }else{
      this._messageService.showErrorMessage(data.MessageText)
    }
    });
  }

  setAddModeOptions() {
    this.templateDetailsDataObj.IsEmail = true;
    this.templateDetailsDataObj.IsSMS = true;
    //this.templateDetailsDataObj.IsNotification = true;
    this.templateEmailModel = new TemplateView();
    this.templateSMSModel = new TemplateView();
    this.templateNotificationModel = new TemplateView();
  }

  setEditModeOptions() {
    this.templateEmailModel = null;
    this.templateSMSModel = null;
    this.templateNotificationModel = null;
    if (this.templateDetailsDataObj.IsEmail) {
      this.templateEmailModel = this.templateDetailsDataObj.Template;
      this.moduleID = this.templateEmailModel.ModuleID;
      this.activeTab = "Email";
    }
    if (this.templateDetailsDataObj.IsSMS) {
      this.templateSMSModel = this.templateDetailsDataObj.Template;
      this.moduleID = this.templateSMSModel.ModuleID;
      this.activeTab = "SMS";
    }
    if (this.templateDetailsDataObj.IsNotification) {
      this.templateNotificationModel = this.templateDetailsDataObj.Template;
      this.moduleID = this.templateNotificationModel.ModuleID;
      this.activeTab = "Push Notification";
    }
    this.pageTitle = "Template";
    this.disableModule = true;
    this.isEdit = true;
    this.getFundamentalsVariableModule();
    //this.onModuleChange(this.moduleID);
  }

  setDefaultModule() {
    if (this.moduleList && this.moduleList.length > 0) {
      this.moduleID = this.moduleList[0].ModuleID;
    }
  }

  saveEmailTemplate(isValid: boolean) {
    if (isValid) {
      if (this.emailTemplateForm.dirty) {
        this.templateEmailModel.TemplateTextDescription = this.templateEmailModel.TemplateTextDescription.trim();
        this.templateEmailModel.TemplateTypeID = this.templateType.Email;
        this.templateEmailModel.ModuleID = this.moduleID;

        let shouldClosePopup = this.templateEmailModel.TemplateTextID >= 0 ? true : false;
        this._httpService.save(TemplateApi.saveEmail, this.templateEmailModel)
          .subscribe((res: any) => {
            if (res && res.MessageCode > 0) {
              if (!shouldClosePopup) this.resetAllForms();
              this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Template"));
              this.templateSaved.emit(true);
              this.successClosePopup(shouldClosePopup);
            }
            else if (res && res.MessageCode < 0) {
              this._messageService.showErrorMessage(res.MessageText);
            }
            else {
              this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Template"));
            }
          },
            err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Template")); }
          );
      }
    }
    else {
      this.showValidationMessage(true);
    }
  }

  saveSMSTemplate(isValid: boolean) {
    if (isValid) {
      if (this.templateFormSMS.dirty) {
        this.templateSMSModel.TemplateTextDescription = this.templateSMSModel.TemplateTextDescription.trim();
        this.templateSMSModel.TemplateTypeID = this.templateType.SMS;
        this.templateSMSModel.ModuleID = this.moduleID;
        let shouldClosePopup = this.templateSMSModel.TemplateTextID >= 0 ? true : false;
        this._httpService.save(TemplateApi.saveSMS, this.templateSMSModel)
          .subscribe((res: any) => {
            if (res && res.MessageCode > 0) {
              if (!shouldClosePopup) this.resetAllForms();
              this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Template"));
              this.templateSaved.emit(true);
              this.successClosePopup(shouldClosePopup);
            }
            else if (res && res.MessageCode < 0) {
              this._messageService.showErrorMessage(res.MessageText);
            }
            else {
              this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Template"));
            }
          },
            err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Template")); }
          );
      }
    }
    else {
      this.showValidationMessage(true);
    }
  }

  saveNotificationTemplate(isValid: boolean) {
    if (isValid) {
      if (this.templateFormNotification.dirty) {
        this.templateNotificationModel.TemplateTextDescription = this.templateNotificationModel.TemplateTextDescription.trim();
        this.templateNotificationModel.TemplateTypeID = this.templateType.Notification;
        this.templateNotificationModel.ModuleID = this.moduleID;
        let shouldClosePopup = this.templateNotificationModel.TemplateTextID >= 0 ? true : false;
        this._httpService.save(TemplateApi.saveSMS, this.templateNotificationModel)
          .subscribe((res: any) => {
            if (res && res.MessageCode > 0) {
              if (!shouldClosePopup) this.resetAllForms();
              this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Template"));
              this.templateSaved.emit(true);
              this.successClosePopup(shouldClosePopup);
            }
            else if (res && res.MessageCode < 0) {
              this._messageService.showErrorMessage(res.MessageText);
            }
            else {
              this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Template"));
            }
          },
            err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Template")); }
          );
      }
    }
    else {
      this.showValidationMessage(true);
    }
  }

  resetAllForms() {
    if (this.templateDetailsDataObj.Template.TemplateTextID == 0) {
      if (this.emailTemplateForm) {
        this.emailTemplateForm.form.reset();
        setTimeout(() => {
          this.templateEmailModel = new TemplateView();
        });
      }

      if (this.templateFormSMS) {
        this.templateFormSMS.form.reset();
        setTimeout(() => {
          this.templateSMSModel = new TemplateView();
        });
      }

      if (this.templateFormNotification) {
        this.templateFormNotification.form.reset();
        setTimeout(() => {
          this.templateNotificationModel = new TemplateView();
        });
      }
    }
    this.subscribeToFormChanges();
  }

  subscribeToFormChanges() {
    switch (this.activeTab) {
      case this.templateTypes.Email: {
        this.emailTemplateForm.valueChanges.subscribe(() => {
          if (this.templateFormSMS.valid) {
            this.showValidationMessage(false);
          }
        });
        break;
      }
      case this.templateTypes.SMS: {
        this.templateFormSMS.valueChanges.subscribe(() => {
          if (this.templateFormSMS.valid) {
            this.showValidationMessage(false);
          }
        });
        break;
      }

      case this.templateTypes.PushNotification: {
        this.templateFormNotification.valueChanges.subscribe(() => {
          if (this.templateFormNotification.valid) {
            this.showValidationMessage(false);
          }
        });
        break;
      }
    }
  }

  showValidationMessage(isVisible: boolean) {
    this.isInvalidData = isVisible;
  }

  successClosePopup(shouldClosePopup: boolean) {
    if (shouldClosePopup) {
      this.onCloseDialog();
    }
  }

  // #endregion
}