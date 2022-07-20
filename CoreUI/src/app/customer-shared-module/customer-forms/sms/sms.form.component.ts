/**Angular References */
import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { NgForm } from "@angular/forms";
/** Material Reference */
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
/** Services & Models */
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { DataSharingService } from "src/app/services/data.sharing.service";
import {
  ActivityPersonInfo,
  Template,
  SMSActivity,
} from "src/app/models/activity.model";
import { ApiResponse, DD_Branch } from "src/app/models/common.model";
/**Configurations */
import { Configurations } from "src/app/helper/config/app.config";
import { Messages } from "src/app/helper/config/app.messages";
import { SubscriptionLike as ISubscription } from "rxjs";
import { TemplateType, EnumSaleSourceType, FormQueryType, ENU_EmailSmsFor } from "src/app/helper/config/app.enums";
import { environment } from 'src/environments/environment';
import {
  MemberActivityApi,
  CustomerFormApi,
  LeadActivityApi,
  StaffActivityApi,
  StaffApi,
} from "src/app/helper/config/app.webapi";
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";

@Component({
  selector: "sms-form",
  templateUrl: "./sms.form.component.html",
})
export class SmsFormComponent extends AbstractGenericComponent implements OnInit {
  @ViewChild("smsForm") smsForm: NgForm;
  smsModel = new SMSActivity();
  isInvalidData: boolean = false;
  personInfo: ActivityPersonInfo;
  selectedTemplate: Template;
  personInfoSubscription: ISubscription;
  contactReasonTypeList: any[];
  templateTextList: any[];
  templateVariableList = Configurations.TemplateVariableList;
  messages = Messages;
  customerFormId: any;
  formUrl: string;
  companyID: any;
  branchID: any;
  tinyUrl: string;
  msgType :string;

  constructor(
    private _httpService: HttpService,
    private http: HttpClient,
    private _messageService: MessageService,
    private _dataSharingService: DataSharingService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SmsFormComponent>
  ) { super() }

  ngOnInit() {
    this.customerFormId = this.data.CustomerFormID;
    this.smsModel.CustomerID = this.data.CustomerID;
    this.smsModel.CustomerTypeID = this.data.CustomerTypeID;
    this.getPersonInfo();
    this.getTemplateFundamentals();
    this.phoneNoMissing();
  }
  phoneNoMissing(){
    if(this.data.CustomerTypeID == ENU_EmailSmsFor.Client )
     {
      this.msgType = 'Client'
     }
     if(this.data.CustomerTypeID == ENU_EmailSmsFor.Member )
     {
      this.msgType = 'Member'

     }
     if(this.data.CustomerTypeID == ENU_EmailSmsFor.Lead )
     {
      this.msgType = 'Lead'

     }
     if(this.data.CustomerTypeID == ENU_EmailSmsFor.Staff )
     {
      this.msgType = 'Staff'

     }
  }
  ngOnDestroy() {
    this.personInfoSubscription.unsubscribe();
  }

  /** get tiny url from third party */
  getTinyUrl() {
    const url =
    environment.formUrl.replace("{CompanyID}", this.companyID)
    .replace('{BranchID}', this.branchID).replace('{SourceType}', String(EnumSaleSourceType.OnSite)).replace('{FormID}',
    String(this.data.CustomerTypeID == ENU_EmailSmsFor.Staff ? 6 : FormQueryType.FormID)).replace('{CustomerFormID}', String(this.customerFormId))
    this.http.get(environment.tinyUrl + url,  {headers:{skip:"true"}, responseType: 'text'}).subscribe(response => {
      this.formUrl = response;
      this.smsModel.Description = "\r\n " + this.formUrl;
    }, error => {
      this._messageService.showErrorMessage(
        this.messages.Error.Get_Error.replace('{0}', "Customer Form URL")
      );
    })
  }

  /** gets person informations */
  getPersonInfo() {
    this.personInfoSubscription = this._dataSharingService.activityPersonInfo.subscribe(
      (personInfo: ActivityPersonInfo) => {
        if (personInfo) {
          this.personInfo = personInfo;
        }
      }
    );
    //this.getCurrentBranchDetail();
    this.getCompanyDetails();
  }
  /* Change sms Template  */
  onTemplateChange(template: Template) {
    this.setTemplateForSMS(template);
  }
  async getCompanyDetails(){

    const company = await super.getCompanyDetail(this._dataSharingService);
    if (company) {
      this.companyID = String(company.CompanyID);
    }

    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.branchID = branch.BranchID;
    }

    this.getTinyUrl();

}

  // async getCurrentBranchDetail() {
  //   const branch = await super.getBranchDetail(this._dataSharingService);
  //   if (branch && branch.hasOwnProperty("Currency")) {
  //     this.branchID = branch.BranchID;
  //   }
  // }
  
  /** fetch fundamentals for client member lead and staff on client type based*/
  getTemplateFundamentals() {
    let url;
    if(this.data.CustomerTypeID == ENU_EmailSmsFor.Client || this.data.CustomerTypeID ==  ENU_EmailSmsFor.Member){
      url = this.getClientMemberFundamentalsUrl();
    }
    if(this.data.CustomerTypeID == ENU_EmailSmsFor.Lead){
      url = this.getLeadFundamentalsUrl();
    }
    if(this.data.CustomerTypeID == ENU_EmailSmsFor.Staff) {
      url = this.getStaffFundamentalsUrl();
    }

    this._httpService.get(url).subscribe(
      (response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
            this.templateTextList = response.Result.TemplateTextList;
            this.contactReasonTypeList = response.Result.ContactReasonTypeList;
            this.setSMSDropdowns();
        } else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
      (err) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Dropdowns_Load_Error
        );
      }
    );
  }

  // for lead fundamentals url
  getLeadFundamentalsUrl(){
    return LeadActivityApi.getTemplateFundamentals + TemplateType.SMS;
  }

    // for staff fundamentals url
    getStaffFundamentalsUrl(){
      return StaffActivityApi.getTemplateFundamentals + TemplateType.SMS;
    }

  // for client and member fundamentals url
  getClientMemberFundamentalsUrl(){
    return MemberActivityApi.getTemplateFundamentals + TemplateType.SMS;
  }


  /** sets dropdown */
  setSMSDropdowns() {
    this.templateTextList.splice(0, 0, {
      TemplateTextID: null,
      TemplateTextTitle: "No Template",
    });
    this.selectedTemplate = this.templateTextList[0];

    if (this.contactReasonTypeList && this.contactReasonTypeList.length > 0) {
      this.smsModel.ContactReasonTypeID = this.contactReasonTypeList[0].ContactReasonTypeID;
    }
  }

  /** sets templates for client lead member and staff on their type based*/
  setTemplateForSMS(template: Template) {
      this.setTemplateSms(template);
  }

  // set template sms for client, Member, Lead and Staff
  setTemplateSms(template){
    if (template && template.TemplateTextID > 0) {
      let templateDescription = this.getTemplateDescription(
        template.TemplateTextID,
        TemplateType.SMS
      );

      if (templateDescription) {
        templateDescription.subscribe((response: ApiResponse) => {
          if (response && response.Result && response.Result.TemplateText) {
            this.smsModel.Title = template.TemplateTextTitle;
            this.smsModel.Description = this.replaceTemplateVariables(
              response.Result.TemplateText.TemplateTextDescription
            );
            this.smsModel.Description += "\r\n " + this.formUrl;
            this.smsModel.TemplateTextID = template.TemplateTextID;
          }
        });
      }
    } else {
      this.smsModel.TemplateTextID = null;
      this.smsModel.Title = "";
      this.smsModel.Description = "";
      this.smsModel.Description += "\r\n " + this.formUrl;
    }
  }

  /** set template variables */
  replaceTemplateVariables(description: string) {
    if (description) {
      this.templateVariableList.forEach((templateVar) => {
        if (description && description.indexOf(templateVar) >= 0) {
          if (
            templateVar === "[Member Name]" ||
            templateVar === "[Client Name]" ||
            templateVar === "[Lead Name]"
          ) {
            description = description.replace(
              templateVar,
              this.personInfo.Name
            );
          } else if (templateVar === "[Phone]") {
            description = description.replace(
              templateVar,
              this.personInfo.Mobile
            );
          } else if (templateVar === "[Address]") {
            description = description.replace(
              templateVar,
              this.personInfo.Address
            );
          }
        }
      });
    }
    return description;
  }

  // get template descrption for client member lead and staff on type based
  getTemplateDescription(templateTextId: number, templateTypeId: number): any {
    if(this.data.CustomerTypeID == ENU_EmailSmsFor.Client || this.data.CustomerTypeID ==  ENU_EmailSmsFor.Member){
      let url = MemberActivityApi.getTemplateDescription
      .replace("{templateTextID}", templateTextId.toString())
      .replace("{templateTypeID}", templateTypeId.toString())
      .replace("{cutomerID}", this.smsModel.CustomerID.toString());
    return this._httpService.get(url);
    }
    if(this.data.CustomerTypeID == ENU_EmailSmsFor.Lead ){
      let url = LeadActivityApi.getTemplateDescription
      .replace("{templateTextID}", templateTextId.toString())
      .replace("{templateTypeID}", templateTypeId.toString())
      .replace("{cutomerID}", this.smsModel.CustomerID.toString());
    return this._httpService.get(url);    }
    if(this.data.CustomerTypeID == ENU_EmailSmsFor.Staff ){
      let url = StaffActivityApi.getTemplateDescription
      .replace("{templateTextID}", templateTextId.toString())
      .replace("{templateTypeID}", templateTypeId.toString())
      .replace("{staffID}", this.smsModel.CustomerID.toString());
    return this._httpService.get(url);    }
  }

  /** sends sms */
  saveSMS() {
    if (this.smsForm.valid) {
      let saveApi; let model;
      if(this.data.CustomerTypeID == ENU_EmailSmsFor.Staff) { // set model for staff
        saveApi = StaffApi.saveSMS;
        model = new SMSActivity();
        model.AssignedToStaffID = this.smsModel.CustomerID;
        model.TemplateTextID = this.smsModel.TemplateTextID;
        model.Description = this.smsModel.Description;
        model.Title = this.smsModel.Title;
      } else {
        saveApi = CustomerFormApi.SaveCustomerFormSMS; // set model for customer and lead
        model = this.smsModel;
      }
      this._httpService
        .save(saveApi, model)
        .subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode && response.MessageCode > 0) {
              this._messageService.showSuccessMessage(
                this.messages.Success.Sent_Success.replace("{0}", "SMS")
              );
            } else {
              this._messageService.showErrorMessage(
                this.messages.Error.Save_Error.replace("{0}", "SMS")
              );
            }
          },
          (err) => {
            this._messageService.showErrorMessage(
              this.messages.Error.Save_Error.replace("{0}", "SMS")
            );
          },
          () => {
            this.dialogRef.close();
          }
        );
    } else {
      this.showValidationMessage(true);
    }
  }

  /** shows error message */
  showValidationMessage(isVisible: boolean) {
    this.isInvalidData = isVisible;
  }

  onCloseDialog() {
    this.dialogRef.close();
  }
}
