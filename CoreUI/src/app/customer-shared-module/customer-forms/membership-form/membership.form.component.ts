import { ElementRef } from '@angular/core';
import { Component, OnInit, ViewChild, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { Configurations } from 'src/app/helper/config/app.config';
import { CustomFormStatus, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { Messages } from 'src/app/helper/config/app.messages';
import { CustomFormView, CustomFormViewBrief } from 'src/app/models/customer.form.model';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

import { environment } from 'src/environments/environment';
import SignaturePad from 'signature_pad';


@Component({
  selector: 'membership-form',
  templateUrl: './membership.form.component.html'
})

export class MembershipFormComponent extends AbstractGenericComponent implements OnInit, AfterViewInit {

  signaturePad: SignaturePad;
  @ViewChild('signaturePadCanvas') signaturePadElement: ElementRef;
  @Input() customeFormViewModel: CustomFormView;
  @Output() onSubmitForms = new EventEmitter<CustomFormViewBrief>();
  isViewForm: boolean = false;

  customeFormViewModelCopy: CustomFormView;
  customFormViewBrief: CustomFormViewBrief = new CustomFormViewBrief();

  /************* Configurations ***************/
  serverImageAddress = environment.imageUrl;
  enuFormTypes = CustomFormStatus;

  /************* Local variables ***************/
  CompanyInfo: any;
  imagePath: string;
  isImageExist: boolean;
  BranchInfo: any;
  isShowSubmitAndNext: boolean;
  isShowEditSignatureButton: boolean = false;

  dateFormat: string = "";
  schedulerTimeFormat = Configurations.SchedulerTimeFormat;    /** Using in HTML DONOT DELETE/REMOVE */

  /* Messages */
  messages = Messages;

  constructor(private _dataSharingService: DataSharingService,  private _messageService: MessageService) {
    super();
  }

  ngOnInit() {
    this.getCurrentBranchDetail();
    this.getCompanyDetails();
    this.setSignature();
  }

  ngAfterViewInit() {
    this.customeFormViewModel.JsonText.attributes.forEach(field => {
      if (field.type == 'eSignature') {
        this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement);
      }
    });
  }

 

  setFormCopy(formModel){
    this.customeFormViewModelCopy = JSON.parse(JSON.stringify(formModel));
  }

  async getCurrentBranchDetail() {
    this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerTooltipDateFormat);
    this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
    this.dateFormat = this.dateFormat + ' - ' + this.schedulerTimeFormat;
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.BranchInfo = branch;
    }
  }
  
  
    async getCompanyDetails(){
      const company = await super.getCompanyDetail(this._dataSharingService);
      if (company) {
        this.CompanyInfo = company;
        this.setCompanyLogo();
      }
  }
  //Get Company Logo
  setCompanyLogo() {
    this.imagePath = "";

    if (this.CompanyInfo.ImagePath && this.CompanyInfo.ImagePath != "") {
      this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setCustomerImagePath()) + this.CompanyInfo.ImagePath;
      this.isImageExist = true;
    } else {
      this.isImageExist = false;
    }
  }

  //signature pad
  drawClear(index) {
    if (!this.isViewForm) {
      if (this.isShowEditSignatureButton) {
        this.onEditSignature(index);
      } else {
        this.signaturePad.clear();
      }
    }
  }

  drawStart(index: number) {
    // will be notified of szimek/signature_pad's onBegin event
    this.focusFunction(index);
    //console.log('begin drawing');
  }

  setSignature() {
    if (this.customeFormViewModel.JsonText.attributes.find(s => s.type == 'eSignature') && this.customeFormViewModel.JsonText.attributes.find(s => s.type == 'eSignature').value) {
      this.isShowEditSignatureButton = true;
    } else {
      this.isShowEditSignatureButton = false;
    }
  }

  onEditSignature(index) {
    this.isShowEditSignatureButton = false;
    this.customeFormViewModel.JsonText.attributes.forEach(field => {
      if (field.type == 'eSignature') {
        this.signaturePad.clear();
      }
    });
  }

  toggleValue(item, index, mainIndex) {
    this.customeFormViewModel.JsonText.attributes[mainIndex].values[index].selected = !item.selected;
  }

  focusFunction(index: number) {
    this.customeFormViewModel.JsonText.attributes[index].error = false;
  }

  onBlurFunction(index: number){
    this.customeFormViewModel.JsonText.attributes[index].value = this.customeFormViewModel.JsonText.attributes[index].value.toString().trim();
  }

  onSubmit() {
    
    let valid = true;

    this.customeFormViewModel.JsonText.attributes.forEach(field => {
      if (field.required && !field.value && field.type != 'checkbox' && field.type != 'eSignature') {
        valid = false;
        field.error = true;
      }
      if (field.required && field.regex) {
        let regex = new RegExp(field.regex);
        if (regex.test(field.value) == false) {
          valid = false;
          field.error = true;

        }
      }
      if (field.type == 'number' && (field.value || field.value == 0)) {
        if (field.value < field.min || field.value > field.max) {
          valid = false;
          field.error = true;

        }
      }
      if (field.value && field.regex) {
        let regex = new RegExp(field.regex);
        if (regex.test(field.value) == false) {
          valid = false;
          field.error = true;

        }
      }
      if (field.required && field.type == 'checkbox') {
        if (field.values.filter(r => r.selected).length == 0) {
          valid = false;
          field.error = true;
        }
      }
      if (field.type == 'eSignature') {
        if (!this.isShowEditSignatureButton && this.signaturePad) {
          field.value = '';
          var signImageIsEmpty = this.signaturePad.isEmpty();
          if (field.required && signImageIsEmpty) {
            valid = false;
            field.error = true;
          }

          field.value = !signImageIsEmpty ? this.signaturePad.toDataURL() : '';
        }
      }
    });
    if (!valid) {
      this._messageService.showErrorMessage(this.messages.Validation.Info_Required);
      return false;
    }

    this.customeFormViewModel.IsSkipped = false;
    this.customeFormViewModel.FormStatusID = this.enuFormTypes.Submitted;
    this.setSignature();

    this.customFormViewBrief = new CustomFormViewBrief();
    this.customFormViewBrief.CustomFormView = this.customeFormViewModel;
    this.customFormViewBrief.SkipSubmitIndicator = 'submit';
    this.onSubmitForms.emit(this.customFormViewBrief);
  }

  public onSkip() {

    //add copied form when user skip form
    if(this.customeFormViewModelCopy){
      this.customeFormViewModel = JSON.parse(JSON.stringify(this.customeFormViewModelCopy));
    }

    this.customeFormViewModel.IsSkipped = true;
    this.customeFormViewModel.FormStatusID = this.customeFormViewModel.FormStatusID;
    this.setSignature();

    this.customFormViewBrief = new CustomFormViewBrief();
    this.customFormViewBrief.CustomFormView = this.customeFormViewModel;
    this.customFormViewBrief.SkipSubmitIndicator = 'submit';
    this.onSubmitForms.emit(this.customFormViewBrief);
  }

  onOpenCalendar(picker: MatDatepicker<Date>) {
    picker.open();
    // setTimeout(() => this._input.nativeElement.focus());
  }
}
