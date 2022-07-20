/*********************** Angular *************************/
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatDatepicker } from '@angular/material/datepicker';
/*********************** Services *************************/

import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { Messages } from 'src/app/helper/config/app.messages';

/************* Configurations ***************/

import { environment } from 'src/environments/environment';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { CustomerFormApi, StaffApi, BranchApi } from 'src/app/helper/config/app.webapi';
import { CompanyDetailsApi } from 'src/app/helper/config/app.webapi';
import { Configurations } from 'src/app/helper/config/app.config';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { FormApi } from 'src/app/helper/config/app.webapi';
import { ENU_CountryBaseDateFormatName, ENU_CountryFormat, ENU_DateFormat, ENU_pdfFor } from 'src/app/helper/config/app.enums';


/************* Model ***************/
import { CustomFormView } from 'src/app/models/customer.form.model';
import { ApiResponse, CompanyInfo } from 'src/app/models/common.model';
import { Branch } from "src/app/setup/models/branch.model";
import { CompanyDetails } from 'src/app/setup/models/company.details.model';




@Component({
  selector: 'customer-form-pdf',
  templateUrl: './customer.form.pdf.component.html'
})

export class CustomerFormPDFComponent extends AbstractGenericComponent implements OnInit {

  /************* Models ***************/
  CompanyInfo: CompanyDetails = new CompanyDetails();
  customeFormViewModel: CustomFormView = new CustomFormView;
  branchInfo: Branch = new Branch();
  public companyDetails: CompanyDetails = new CompanyDetails();


  /************* Configurations ***************/
  serverImageAddress = environment.imageUrl;

  /************* Local variables ***************/
  imagePath: string;
  isImageExist: boolean;
  formIDOrCustomerFormID: any;
  isShowFormData: boolean = false;
  formType: any;
  branch: any;
  messages = Messages;
  dateFormat: string = "";
  schedulerTimeFormat: string = "";

  constructor(
    private route: ActivatedRoute,
    private _messageService: MessageService,
    private _dataSharingService: DataSharingService,
    private _httpService: HttpService,

  ) {
    super();
  }
  // @ViewChild('autosize') autosize: CdkTextareaAutosize;

  ngOnInit() {
    this.getCompanyDetails();

    this.branch = JSON.parse(localStorage.getItem('BranchInfo'));
    this.getBranchDatePattern();
    this.getFormIdFromRoute();
    this.getFormByID(this.formIDOrCustomerFormID);
    this.getBranchById(this.branch.BranchID)
  }

  // #region Methods
  async getBranchDatePattern() {
    var dateFormatID: number = this.getDateFormat();
    if (dateFormatID && dateFormatID && dateFormatID == ENU_CountryFormat.US) {
      let enuNameForUS = "US" + "DateFormat";
      switch (enuNameForUS) {
        case ENU_CountryBaseDateFormatName.USDateFormat:
          this.dateFormat = ENU_DateFormat.USDateFormat;
          break;
      }
    }
    else if (dateFormatID && dateFormatID && dateFormatID == ENU_CountryFormat.CH) {
      let enuNameForCH = "CH" + "DateFormat";
      switch (enuNameForCH) {
        case ENU_CountryBaseDateFormatName.CHDateFormat:
          this.dateFormat = ENU_DateFormat.CHDateFormat;
          break;
      }
    }
    else {
      let enuNameForUK = "UK" + "DateFormat";
      switch (enuNameForUK) {
        case ENU_CountryBaseDateFormatName.UKDateFormat:
          this.dateFormat = ENU_DateFormat.UKDateFormat;
          break;
      }
    }
    this.dateFormat = this.dateFormat + ' - ' + Configurations.SchedulerTimeFormat;
  }

  //Get form Id from route
  getFormIdFromRoute() {
    this.route.paramMap.subscribe(params => {
      this.formIDOrCustomerFormID = params.get('FormID');
      this.formType = params.get('FormType');
    });
  }

  // getting the branch information with branch Id
  getBranchById(branchID: number) {
    this._httpService.get(BranchApi.getByID + branchID)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.branchInfo = res.Result;
        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
      );
  }

  //get form data
  getFormByID(FormId: any) {

    if (this.formType == ENU_pdfFor.Client) {
      let customerFormId = FormId
      this._httpService.get(CustomerFormApi.getCustomerFormDetail + customerFormId).subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this.customeFormViewModel = response.Result;
          this.customeFormViewModel.JsonText = JSON.parse(this.customeFormViewModel.JsonText);
          this.isShowFormData = true;
        }else{
          this._messageService.showErrorMessage(response.MessageText);
        }
      });
    }
    else if (this.formType == ENU_pdfFor.Staff) {
      let param = {
        staffFormID: FormId
      }
      this._httpService.get(StaffApi.getStaffFormsByID, param).subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this.customeFormViewModel = response.Result;
          this.customeFormViewModel.JsonText = JSON.parse(this.customeFormViewModel.JsonText);
          this.customeFormViewModel = response.Result;
          this.isShowFormData = true;
        }else{
          this._messageService.showErrorMessage(response.MessageText);
        }
      });
    }
    else if (this.formType == ENU_pdfFor.Setup) {
      let formID = FormId;
      this._httpService.get(FormApi.getByID + formID).subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this.customeFormViewModel = response.Result;
          this.customeFormViewModel.JsonText = JSON.parse(this.customeFormViewModel.JsonText);
          this.customeFormViewModel = response.Result;
          this.isShowFormData = true;
        }else{
          this._messageService.showErrorMessage(response.MessageText);
        }
      });
    }
  }
  //download pdf file
  downloadAsPDF() {
    window.print();
  }

  onOpenCalendar(picker: MatDatepicker<Date>) {
    picker.open();
  }
  getCompanyDetails() {
    this._httpService.get(CompanyDetailsApi.get)
      .subscribe(
        data => {
          if (data && data.MessageCode > 0) {
            if (data.Result) {
              this.companyDetails = data.Result;
            }
            else {
              this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Company Details"));
            }
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Company Details"));
        });
  }

  private getDateFormat() {
    var userLang = navigator.language;

    var dateFormatID: number = ENU_CountryFormat.Default;

    // get coutry browser language code from this link: http://download.geonames.org/export/dump/countryInfo.txt

    if (userLang == 'en-US' || userLang == 'en-CA' || userLang == 'fr-CA' || userLang == 'en-AS'
      || userLang == 'en-KY' || userLang == 'en-GH' || userLang == 'en-GU' || userLang == 'ch-GU'
      || userLang == 'en-KE' || userLang == 'sw-KE' || userLang == 'en-MH'
      || userLang == 'ch-MP' || userLang == 'en-MP' || userLang == 'es-PA'
      || userLang == 'en-PH' || userLang == 'en-AS' || userLang == 'en-AS' || userLang == 'en-AS'
      || userLang == 'en-PR' || userLang == 'es-PR' || userLang == 'fr-TG') {
      dateFormatID = ENU_CountryFormat.US;
    }
    else if (userLang == 'zh-CN' || userLang == 'hu-HU' || userLang == 'ko-KP' || userLang == 'ko-KR'
      || userLang == 'zh-TW') {
      dateFormatID = ENU_CountryFormat.CH;
    }
    else {
      dateFormatID = ENU_CountryFormat.UK;
    }
    return dateFormatID;
  }

  // #endregion Methods


}
