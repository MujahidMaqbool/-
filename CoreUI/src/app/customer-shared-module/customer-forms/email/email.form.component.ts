/** Angular References */
import { Component, OnInit, ViewChild, OnDestroy, Inject } from "@angular/core";
import { NgForm } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
/** Material Reference */
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
/** Services & Models */
import { MemberContactReasonType } from "@app/customer/member/models/member.activity.model";
import { ApiResponse, DD_Branch } from "@app/models/common.model";
import { MessageService } from "@app/services/app.message.service";
import { DataSharingService } from "@app/services/data.sharing.service";
import { HttpService } from "@app/services/app.http.service";
import {
  EmailActivity,
  ActivityPersonInfo,
  Template,
} from "@app/models/activity.model";
/** Configurations */
import { SubscriptionLike as ISubscription, SubscriptionLike } from "rxjs";
import { Configurations } from "@app/helper/config/app.config";
import { Messages } from "@app/helper/config/app.messages";
import {
  TemplateType,
  EnumSaleSourceType,
  FormQueryType,
  ENU_EmailSmsFor,
} from "@app/helper/config/app.enums";
import { StaffActivityApi, StaffApi } from "@app/helper/config/app.webapi";
import {
  MemberActivityApi,
  CustomerFormApi,
  LeadActivityApi,
} from "@app/helper/config/app.webapi";
import { environment } from "@env/environment";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";

@Component({
  selector: "email-form",
  templateUrl: "./email.form.component.html",
})
export class EmailFormComponent extends AbstractGenericComponent implements OnInit, OnDestroy {
  emailModel: EmailActivity = new EmailActivity();
  isInvalidEmailBody: boolean = false;
  emailMaxLength = Configurations.EmailMaxLength;
  personInfo: ActivityPersonInfo;
  personInfoSubscription: ISubscription;
  EmailPermissionSubscription: ISubscription;
  templateType = TemplateType;
  memberID: number;
  selectedTemplate: any;
  templateTextList: Template[];
  isInvalidData: boolean = false;
  memberIdSubscription: ISubscription;
  tepmplateVariableList = Configurations.TemplateVariableList;
  memberContactReasonTypeList: MemberContactReasonType[];
  messages = Messages;
  customerFormId: number;
  formUrl: string;
  templateTypeId: number = this.templateType.Email;

  @ViewChild("emailForm") emailForm: NgForm;
  companyID: string;
  branchID: number;

  constructor(
    private dialogRef: MatDialogRef<EmailFormComponent>,
    private _dataSharingService: DataSharingService,
    private _httpService: HttpService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _messageService: MessageService
  ) { super() }

  ngOnInit() {
    this.customerFormId = this.data.CustomerFormID;
    this.emailModel.CustomerID = this.data.CustomerID;
    this.emailModel.CustomerTypeID = this.data.CustomerTypeID;
    this.getMemberId();
    this.getInformation();
    this.getTemplateFundamentals(this.templateType.Email);
  }

  ngOnDestroy() {
    this.personInfoSubscription.unsubscribe();
    this.memberIdSubscription.unsubscribe();
  }

  /** get tiny url from third party */
  getTinyUrl() {
    const url = environment.formUrl
      .replace("{CompanyID}", this.companyID)
      .replace("{BranchID}", String(this.branchID))
      .replace("{SourceType}", String(EnumSaleSourceType.OnSite))
      .replace("{FormID}", String(FormQueryType.FormID))
      .replace("{CustomerFormID}", String(this.customerFormId));
      this.formUrl = url;
          this.emailModel.EmailBody =
            "<br>" + `<a href="${this.formUrl}">Please click to fill the form.</a>`;
  }

  /** get member id */
  getMemberId() {
    this.memberIdSubscription = this._dataSharingService.memberID.subscribe(
      (memberId: number) => {
        this.memberID = memberId;
      }
    );
  }

  /** get person information */
  getInformation() {
    this.personInfoSubscription = this._dataSharingService.activityPersonInfo.subscribe(
      (personInfo: ActivityPersonInfo) => {
        if (personInfo) {
          this.personInfo = personInfo;
        }
      }
    );
     this.getCurrentBranchDetail();
     this.getCompanyDetails();
 
  }

  async getCompanyDetails() {
    const company = await super.getCompanyDetail(this._dataSharingService);
    if (company) {
      this.companyID = String(company.CompanyID);

    }
  }
  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.branchID = branch.BranchID;
    }
  }

  /** get customer form url */
  getCustomerFormUrl() {
    this._httpService
      .get(CustomerFormApi.getCustomerFormUrl + this.customerFormId)
      .subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            this.formUrl = res.Result;
            this.emailModel.EmailBody =
              "<br>" + `<a href="${this.formUrl}">Please click to fill the form.</a>`;
          } else {
            this._messageService.showErrorMessage(res.MessageText);
          }
        },
        (error) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Customer Form URL")
          );
        }
      );
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  /** set email value on change */
  onEmailBodyChange(value: string) {
    this.emailModel.EmailBody = value === "<br>" ? "" : value;
    if (value && value.length > this.emailMaxLength) {
      this.isInvalidEmailBody = true;
    } else {
      this.emailForm.form.updateValueAndValidity();
      this.isInvalidEmailBody = false;
    }
  }

  onTemplateChange(template: Template) {
    this.setTemplateForEmail(template);
  }

  /** set template email for client member lead and staff*/
  setTemplateForEmail(template: Template) {
    this.setTemplateEmail(template);
  }

  // set Template for client and member
  setTemplateEmail(template) {
    if (template && template.TemplateTextID > 0) {
      let templateDescription = this.getTemplateDescription(
        template.TemplateTextID,
        this.templateTypeId
      );
      if (templateDescription) {
        templateDescription.subscribe((response: ApiResponse) => {
          if (response && response.Result && response.Result.TemplateText) {
            this.emailModel.EmailSubject =
              response.Result.TemplateText.TemplateTextEmailSubject;
            this.emailModel.EmailBody = this.replaceTemplateVariables(
              response.Result.TemplateText.TemplateTextDescription
            );
            this.emailModel.TemplateTextID = template.TemplateTextID;
          }
        });
      }
    } else {
      this.emailModel.TemplateTextID = null;
      this.emailModel.EmailSubject = "";
      this.emailModel.EmailBody = "";
    }
  }

  /** get template */
  getTemplateDescription(templateTextId: number, templateTypeId: number): any {
    if (
      this.data.CustomerTypeID == ENU_EmailSmsFor.Client ||
      this.data.CustomerTypeID == ENU_EmailSmsFor.Member
    ) {
      let url = MemberActivityApi.getTemplateDescription
        .replace("{templateTextID}", String(templateTextId))
        .replace("{templateTypeID}", String(templateTypeId))
        .replace("{cutomerID}", String(this.emailModel.CustomerID));
      return this._httpService.get(url);
    }
    if (this.data.CustomerTypeID == ENU_EmailSmsFor.Lead) {
      let url = LeadActivityApi.getTemplateDescription
        .replace("{templateTextID}", String(templateTextId))
        .replace("{templateTypeID}", String(templateTypeId))
        .replace("{cutomerID}", String(this.emailModel.CustomerID));
      return this._httpService.get(url);
    }
    if (this.data.CustomerTypeID == ENU_EmailSmsFor.Staff) {
      let url = StaffActivityApi.getTemplateDescription
        .replace("{templateTextID}", String(templateTextId))
        .replace("{templateTypeID}", String(templateTypeId))
        .replace("{staffID}", String(this.emailModel.CustomerID));
      return this._httpService.get(url);
    }
  }

  replaceTemplateVariables(description: string) {
    if (description) {
      this.tepmplateVariableList.forEach((templateVar) => {
        if (description && description.indexOf(templateVar) >= 0) {
          if (templateVar === "[Member Name]") {
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

  /**  Set fundamentals for client member lead and staff*/
  getTemplateFundamentals(templateTypeId: number) {
    let url;
    if (
      this.data.CustomerTypeID == ENU_EmailSmsFor.Client ||
      this.data.CustomerTypeID == ENU_EmailSmsFor.Member
    ) {
      url = this.getClientMemberFundamentalsUrl(templateTypeId);
    }
    if (this.data.CustomerTypeID == ENU_EmailSmsFor.Lead) {
      url = this.getLeadFundamentalsUrl(templateTypeId);
    }
    if (this.data.CustomerTypeID == ENU_EmailSmsFor.Staff) {
      url = this.getStaffFundamentalsUrl(templateTypeId);
    }
    this._httpService.get(url).subscribe(
      (res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.templateTextList = res.Result.TemplateTextList;
          this.memberContactReasonTypeList =
            res.Result.ContactReasonTypeList;
          this.templateTextList.splice(0, 0, {
            TemplateTextID: null,
            TemplateTextTitle: "No Template",
          });
          this.selectedTemplate = this.templateTextList[0];
          this.setEmailDropdowns();
        } else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
      (err) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Dropdowns_Load_Error
        );
      }
    );
  }

  // get client and member fundamentals
  getClientMemberFundamentalsUrl(templateTypeId) {
    return MemberActivityApi.getTemplateFundamentals + templateTypeId;
  }

  getStaffFundamentalsUrl(templateTypeId) {
    return StaffActivityApi.getTemplateFundamentals + templateTypeId;
  }

  // get lead fundamentals url
  getLeadFundamentalsUrl(templateTypeId) {
    return LeadActivityApi.getTemplateFundamentals + templateTypeId;
  }

  setEmailDropdowns() {
    if (
      this.memberContactReasonTypeList &&
      this.memberContactReasonTypeList.length > 0
    ) {
      if (this.templateTypeId === this.templateType.Email) {
        if (
          !this.emailModel.ContactReasonTypeID ||
          this.emailModel.ContactReasonTypeID <= 0
        ) {
          this.emailModel.ContactReasonTypeID = this.memberContactReasonTypeList[0].ContactReasonTypeID;
        }
      }
    }
  }

  /** sent email */
  onSave() {
    if (this.emailForm.valid && !this.isInvalidEmailBody) {
      let saveApi;
      let model;
      if (this.data.CustomerTypeID == ENU_EmailSmsFor.Staff) {
        // set model for staff
        saveApi = StaffApi.saveEmail;
        model = new EmailActivity();
        model.TemplateTextID = this.emailModel.TemplateTextID;
        model.EmailSubject = this.emailModel.EmailSubject;
        model.EmailBody = this.emailModel.EmailBody;
        model.AssignedToStaffID = this.emailModel.CustomerID;
        model.StaffFormID = this.customerFormId;
      } else {
        saveApi = CustomerFormApi.SaveCustomerFormEmail; // set model for customer and lead
        model = this.emailModel;
        model.customerFormID = this.customerFormId;
      }
      this._httpService.save(saveApi, model).subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            this._messageService.showSuccessMessage(
              this.messages.Success.Sent_Success.replace("{0}", "Email"));
              this.dialogRef.close();
          } else {
            this._messageService.showErrorMessage(res.MessageText)
          }
         
        },
        (error) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Save_Error.replace("{0}", "Email")
          );
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
}
