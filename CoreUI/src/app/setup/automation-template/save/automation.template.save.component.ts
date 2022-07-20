/********************** Angular Refrences *********************/
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject, Output, EventEmitter, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';


/* Models*/
import { AutomationTemplateFundamental, EventType, TemplateVariable, SaveAutomationTemplate } from 'src/app/setup/models/automation.tempalte.model';

/* Services */
import { ApiResponse } from 'src/app/models/common.model';
import { Messages } from 'src/app/helper/config/app.messages';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { AutomationTemplateApi } from 'src/app/helper/config/app.webapi';
import { ENU_EventCategoryType, ENU_CommunicationType } from 'src/app/helper/config/app.enums';

/*************************** Common & Customs *************************/


@Component({
  selector: 'automation-template-save',
  templateUrl: './automation.template.save.component.html'
})
export class AutomationTemplateSaveComponent implements OnInit {

  // #region Local Members

  /* Template form Reference*/
  @ViewChild('saveAutomationTemplateForm') saveAutomationTemplateForm: NgForm;

  /*Model Reference*/
  veriableList: any;
  audienceTypeList: any;
  eventTypeList: EventType[];
  templateVariable: TemplateVariable[];
  classTemplateVariable: TemplateVariable[];
  staffTemplateVariable: TemplateVariable[];
  gerneralTemplateVariable: TemplateVariable[];
  customerTemplateVariable: TemplateVariable[];
  automationTemplateModel: SaveAutomationTemplate = new SaveAutomationTemplate();
  fundamentals: AutomationTemplateFundamental = new AutomationTemplateFundamental();
  saveAutomationTemplateModel: SaveAutomationTemplate = new SaveAutomationTemplate();

  /* Local members*/
  eventTypeID: number;
  caretPos: number = 0;
  isCustomer: boolean = true;
  communicationTypeID: number;
  eventCategoryTypeID: number;
  isShowData :boolean = false;
  isInvalidData: boolean = false;
  eventCategoryTypeName: string;
  isShowHtmlEditor: boolean = true;
  readonly _maxSMSBodyLength = 160;
  emailTextDescription: string = "";
  readonly _maxEmailBodyLength = 50000;
  smsAndNotificationTextDescription: string = "";
  @Output() isSaved = new EventEmitter<boolean>();

  /* Messages */
  messages = Messages;
  smsMaxLengthMessage: string;
  emailMaxLengthMessage: string;
  isInvalidSMSBody: boolean = false;
  isInvalidEmailBody: boolean = false;
  notificationMaxLengthMessage: string;

  /** Configurations, Constants */
  enu_EventCategoryType = ENU_EventCategoryType;
  enu_CommunicationType = ENU_CommunicationType;

  // #endregion

  constructor(
    private ref: ChangeDetectorRef,
    private _httpService: HttpService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AutomationTemplateSaveComponent>
  ) { }

  ngOnInit() {
    this.getFundamentals();
    this.emailMaxLengthMessage = Messages.Validation.Description_MaxLength.replace("{0}", this._maxEmailBodyLength.toString());
    this.smsMaxLengthMessage = Messages.Validation.SMS_MaxLength.replace("{0}", this._maxSMSBodyLength.toString());
    this.notificationMaxLengthMessage = Messages.Validation.Notification_MaxLength.replace("{0}", this._maxSMSBodyLength.toString());
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }

  // #region Events

  onCloseDialog() {
    this.dialogRef.close();
  }

  onTitleUpdated() {
    if (this.saveAutomationTemplateModel.TemplateTextTitle && this.saveAutomationTemplateModel.TemplateTextTitle.length > 0) {
      this.saveAutomationTemplateModel.TemplateTextTitle = this.saveAutomationTemplateModel.TemplateTextTitle.trim();
    }
  }

  onSubjectUpdated() {
    if (this.saveAutomationTemplateModel.TemplateTextSubject && this.saveAutomationTemplateModel.TemplateTextSubject.length > 0) {
      this.saveAutomationTemplateModel.TemplateTextSubject = this.saveAutomationTemplateModel.TemplateTextSubject.trim();
    }
  }

  onChangeEventCategoryType(eventCategoryTypeID: number) {
    this.eventCategoryTypeID = eventCategoryTypeID;
    this.eventCategoryTypeName = this.fundamentals.EventCategoryType.find(i => i.EventCategoryTypeID == eventCategoryTypeID).EventCategoryTypeName;
    this.onSetEventTypes(eventCategoryTypeID);
    this.onChangeTemplateVariable();

    // if(this.eventCategoryTypeID == this.enu_EventCategoryType.Class || this.eventCategoryTypeID == this.enu_EventCategoryType.Service
    //   || this.eventCategoryTypeID == this.enu_EventCategoryType.Lead) {
    if(this.eventCategoryTypeID !== this.enu_EventCategoryType.Shift && this.eventCategoryTypeID !== this.enu_EventCategoryType.StaffActivities) {
        this.isCustomer = true;
    } else
    {
      this.isCustomer = false;
    }
    this.onSetAudienceTypeList();
  }

  onSetAudienceTypeList(){
    this.audienceTypeList = [];

    // if(this.eventCategoryTypeID == this.enu_EventCategoryType.Class || this.eventCategoryTypeID == this.enu_EventCategoryType.Service
    //    || this.eventCategoryTypeID == this.enu_EventCategoryType.Lead) {
    if(this.eventCategoryTypeID !== this.enu_EventCategoryType.Shift && this.eventCategoryTypeID !== this.enu_EventCategoryType.StaffActivities) {
    this.audienceTypeList.push({
        'name': "Customer",
        'id': true,
      });
    } 
    
    this.audienceTypeList.push({
      'name': "Staff",
      'id': false,
    });

  }

  onSetEventTypes(eventCategoryTypeID: number) {
    this.eventTypeList = this.fundamentals.EventType.filter(x => x.EventCategoryTypeID == eventCategoryTypeID);
    this.eventTypeID = this.eventTypeList[0].EventTypeID;
    this.onChangeTemplateVariable();
  }

  onChangeEventType(eventTypeID: number) {
    this.eventTypeID = eventTypeID;
    this.onChangeTemplateVariable();
    //this.onSetAudienceTypeList();
  }

  onChangeAudienceType(val: boolean) {
    this.isCustomer = val;
    this.onChangeTemplateVariable();
  }

  onChangeCommunicationType(communicationTypeID: number) {
    this.showValidationMessage(false);
    this.isShowHtmlEditor = communicationTypeID == this.enu_CommunicationType.Email ? true : false;
    // this.emailTextDescription = "";
    // this.smsAndNotificationTextDescription = "";
    this.communicationTypeID = communicationTypeID;
  }

  onChangeTemplateVariable() {

    // if(this.eventCategoryTypeID == 1){
    this.classTemplateVariable = this.fundamentals.TemplateVariable.filter(x => x.EventCategoryTypeID == this.eventCategoryTypeID);
    // } else{
    //   this.classTemplateVariable = [];
    // }
    
    if(this.eventCategoryTypeID == this.enu_EventCategoryType.Membership && (this.eventTypeID == this.enu_EventCategoryType.MembershipIsNearToExpiry || this.eventTypeID == this.enu_EventCategoryType.MembershipIsSold) && this.isCustomer==true){
      this.staffTemplateVariable = [];
    
    } else{
      this.staffTemplateVariable = this.fundamentals.TemplateVariable.filter(x => x.EventCategoryTypeID == 7);
    }

    // if(this.eventCategoryTypeID == this.enu_EventCategoryType.Class || this.eventCategoryTypeID == this.enu_EventCategoryType.Service 
    //   || this.eventCategoryTypeID == this.enu_EventCategoryType.Lead){
    if(this.eventCategoryTypeID != this.enu_EventCategoryType.Shift && this.eventCategoryTypeID != this.enu_EventCategoryType.StaffActivities &&
      this.eventCategoryTypeID != this.enu_EventCategoryType.Lead && this.eventCategoryTypeID != this.enu_EventCategoryType.Membership){
      this.customerTemplateVariable = this.fundamentals.TemplateVariable.filter(x => x.EventCategoryTypeID == 6);
    } else{
       this.customerTemplateVariable = [];
    }

    this.gerneralTemplateVariable = this.fundamentals.TemplateVariable.filter(x => x.EventCategoryTypeID == null || x.EventCategoryTypeID == undefined);

    //on change sort list
    this.getSortedVeriableList();
    
  }

  onDropPlaceHoder(data: any) {
    var dropData = "[" + data.dragData + "]";
    if (this.communicationTypeID === this.enu_CommunicationType.Email) {
      //dropData = "<span class='dx-variable' data-var-start-esc-char='[' data-var-end-esc-char=']' data-var-value='"+ data.dragData +"'><span contenteditable='false'>" + "[" + data.dragData + "]" + "</span></span>";
      // </p> tag added place holder move into next line so fixed that issue using that code
      var lastFour = this.emailTextDescription.substr(this.emailTextDescription.length - 4);
      var withoutLastFour = this.emailTextDescription.substring(0, this.emailTextDescription.length - 4);
      this.emailTextDescription = withoutLastFour + dropData + lastFour;
    } else {
      dropData = "[" + data.dragData + "]";
      this.smsAndNotificationTextDescription = [this.smsAndNotificationTextDescription.slice(0, this.caretPos), dropData, this.smsAndNotificationTextDescription.slice(this.caretPos)].join('');
      this.onSMSDescriptionUpdated();
    }

    this.saveAutomationTemplateForm.form.markAsDirty();
  }

  onEmailDescriptionUpdated(value: string) {
    this.emailTextDescription = value === "<br>" ? "" : value;
    if (value && value.length > this._maxEmailBodyLength) {
      this.isInvalidData = true;
      this.isInvalidEmailBody = true;
    }
    else {
      this.saveAutomationTemplateForm.form.updateValueAndValidity();
      this.isInvalidData = false;
      this.isInvalidEmailBody = false;
      this.saveAutomationTemplateForm.form.markAsDirty();
    }

    setTimeout(() => {
      this.emailTextDescription;
    }, 1);
  }

  onTextAreaUpdated(){
    //gdfdsf
    if(this.smsAndNotificationTextDescription){
      this.smsAndNotificationTextDescription = this.smsAndNotificationTextDescription.replace(/^\s+/g, '');
    } 
  }

  onSMSDescriptionUpdated() {
    if (this.smsAndNotificationTextDescription && this.smsAndNotificationTextDescription.length > 0) {
      this.smsAndNotificationTextDescription = this.smsAndNotificationTextDescription.trim();
    }

    setTimeout(() => {
      if (this.smsAndNotificationTextDescription && this.smsAndNotificationTextDescription.length > this._maxSMSBodyLength) {
        this.isInvalidData = true;
        this.isInvalidSMSBody = true;
      }
      else {
        this.saveAutomationTemplateForm.form.updateValueAndValidity();
        this.isInvalidData = false;
        this.isInvalidSMSBody = false;
        this.saveAutomationTemplateForm.form.markAsDirty();
      }
    }, 100);
  }

  onSave(isValid: boolean) {
    this.saveAutomationTemplate(isValid);
  }

  // #endregion

  // #region Methods

  getCaretPos(oField) {
    if (oField.selectionStart || oField.selectionStart == '0') {
      this.caretPos = oField.selectionStart;
    }
  }

  getFundamentals() {
    this._httpService.get(AutomationTemplateApi.getFundamentals)
      .subscribe(data => {
        if(data && data.Result){
        this.fundamentals = data.Result;

        if (this.data.AutomationTemplateID > 0) {
          this.getAutomationTemplateDetail(this.data.AutomationTemplateID);
        } else {
          this.onChangeEventCategoryType(this.fundamentals.EventCategoryType[0].EventCategoryTypeID);
          this.communicationTypeID = this.fundamentals.CommunicationType[0].CommunicationTypeID;
          this.onChangeTemplateVariable();
          this.isShowData = true;
        }
      }else{
        this._messageService.showErrorMessage(data.MessageText);
      }

      });
  }

  getAutomationTemplateDetail(automationTemplateID: number) {
    this._httpService.get(AutomationTemplateApi.getDetail + automationTemplateID)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          if (res.Result) {
            this.saveAutomationTemplateModel = res.Result;
            this.saveAutomationTemplateModel.IsFixed = this.data.IsCopy ? false : this.saveAutomationTemplateModel.IsFixed;
            this.onChangeEventCategoryType(this.saveAutomationTemplateModel.EventCategoryTypeID);
            this.onChangeAudienceType(this.saveAutomationTemplateModel.IsCustomer);
            this.onChangeEventType(this.saveAutomationTemplateModel.EventTypeID);
            this.communicationTypeID = this.saveAutomationTemplateModel.CommunicationTypeID;

            if(this.communicationTypeID == this.enu_CommunicationType.SMS){
              this.saveAutomationTemplateModel.TemplateTextSubject = '';
            }

            if (this.communicationTypeID == this.enu_CommunicationType.Email) {
              this.emailTextDescription = this.saveAutomationTemplateModel.TemplateTextDescription;
              this.isShowHtmlEditor = true;
            } else {
              this.smsAndNotificationTextDescription = this.saveAutomationTemplateModel.TemplateTextDescription;
              this.isShowHtmlEditor = false;
            }
          }
          this.isShowData = true;
        }
        else {
          this.isShowData = true;
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        error => {
          this.isShowData = true;
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Automation Template"));
        }
      );
  }

  getSortedVeriableList(){
    
    this.veriableList = [];

    this.veriableList.push({
      'name': "General",
      'data': this.gerneralTemplateVariable,
    });

    if(this.eventCategoryTypeID == this.enu_EventCategoryType.Membership && (this.eventTypeID == this.enu_EventCategoryType.MembershipIsNearToExpiry || this.eventTypeID == this.enu_EventCategoryType.MembershipIsSold) && this.isCustomer==true)
    {

    }
    else 
    {
      this.veriableList.push({
        'name': "Staff",
        'data': this.staffTemplateVariable,
      });
    }

    if(this.customerTemplateVariable && this.customerTemplateVariable.length > 0){
      this.veriableList.push({
        'name': "Customer",
        'data': this.customerTemplateVariable,
      });
    }

    this.veriableList.push({
      'name': this.eventCategoryTypeName,
      'data': this.classTemplateVariable,
    });

    this.veriableList.sort(function(a, b){
      if(a.name < b.name) { return -1; }
      if(a.name > b.name) { return 1; }
      return 0;
    })
  }

  saveAutomationTemplate(isValid: boolean) {
    if (isValid) {
      this.saveAutomationTemplateModel.TemplateTextDescription = this.communicationTypeID == this.enu_CommunicationType.Email ? this.emailTextDescription : this.smsAndNotificationTextDescription;
      this.saveAutomationTemplateModel.EventTypeID = this.eventTypeID;
      this.saveAutomationTemplateModel.EventCategoryTypeID = this.eventCategoryTypeID;
      this.saveAutomationTemplateModel.CommunicationTypeID = this.communicationTypeID;
      this.saveAutomationTemplateModel.IsCustomer = this.isCustomer;
      this.saveAutomationTemplateModel.IsFixed = false;
      /// Added below line by Asim on 16/09/2021 to set TemplateTextID = 0 if user is making copy
      this.saveAutomationTemplateModel.TemplateTextID = this.data.IsCopy ? 0 : this.saveAutomationTemplateModel.TemplateTextID;
      this.saveAutomationTemplateModel.TemplateTextSubject = this.communicationTypeID == this.enu_CommunicationType.SMS ? this.saveAutomationTemplateModel.TemplateTextTitle : this.saveAutomationTemplateModel.TemplateTextSubject; 

      this._httpService.save(AutomationTemplateApi.save, this.saveAutomationTemplateModel)
        .subscribe((res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Automation Template"));
          } else{
            this._messageService.showErrorMessage(res.MessageText);
          }
          this.onCloseDialog();
          this.isSaved.emit(true);
        },
          err => {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Automation Template"));
          });
    } else {
      this.showValidationMessage(true);
    }
  }

  showValidationMessage(isVisible: boolean) {
    this.isInvalidData = isVisible;
  }
  
  // #endregion

}
