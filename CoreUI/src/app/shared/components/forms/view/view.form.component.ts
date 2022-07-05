import { Component, OnInit, Inject, ViewChild, EventEmitter, Output, ElementRef } from '@angular/core';

/*********************** Material Reference *************************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
/*********************** Material Reference *************************/
import { CustomFormView, CustomerFormsInfromation } from '@app/models/customer.form.model';
import { DataSharingService } from '@app/services/data.sharing.service';
import { AppUtilities } from '@app/helper/aap.utilities';
import { environment } from '@env/environment';

import SignaturePad from 'signature_pad';

import { CustomFormStatus, ENU_DateFormatName, ENU_FromTypeName } from '@app/helper/config/app.enums';
import { Messages } from '@app/helper/config/app.messages';
import { MessageService } from '@app/services/app.message.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { Configurations } from '@app/helper/config/app.config';

@Component({
  selector: 'view-form',
  templateUrl: './view.form.component.html'
})

export class ViewFormComponent extends AbstractGenericComponent implements OnInit {


  // @ViewChild(SignaturePad) signaturePad: SignaturePad;

  signaturePad: SignaturePad;
  @ViewChild('signaturePadCanvas') signaturePadElement: ElementRef;

  @Output() onSubmitForms = new EventEmitter<CustomFormView[]>();

  slideConfig = {
    "slidesToShow": 1,
    "dots": true,
    draggable: false,
  };

  customeFormViewModel: CustomFormView = new CustomFormView;
  customeFormViewModelCopy: CustomFormView = new CustomFormView;
  customFormsCopy: CustomerFormsInfromation = new CustomerFormsInfromation();
  customerFormsInfo: CustomFormView[];
  /************* Configurations ***************/
  serverImageAddress = environment.imageUrl;
  enuFormTypes = CustomFormStatus;
  enuFormTypeName = ENU_FromTypeName;

  /************* Local variables ***************/
  CompanyInfo: any;
  imagePath: string;
  isImageExist: boolean;
  BranchInfo: any;
  isShowSubmitAndNext: boolean;
  formIndex: number = 0;
  isShowEditSignatureButton: boolean = false;
  isDisabledSubmitButton: boolean = false;
  dateFormat: string = "";
  schedulerTimeFormat = Configurations.SchedulerTimeFormat;    /** Using in HTML DONOT DELETE/REMOVE */

  /* Messages */
  messages = Messages;

  constructor(private dialogRef: MatDialogRef<ViewFormComponent>,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public customForms: CustomerFormsInfromation,
    private _dataSharingService: DataSharingService
  ) {
    super();
  }

  ngOnInit() {
    this.getCurrentBranchDetail();
    this.getCompanyDetails();

    //save all forms copy for close form
    this.customFormsCopy = JSON.parse(JSON.stringify(this.customForms));

    this.customeFormViewModel = this.customForms.CustomFormView[this.formIndex];

    try {
      this.customeFormViewModel.JsonText = JSON.parse(this.customeFormViewModel.JsonText);
    } catch (e) {
    }

    this.setSignature();

    if (!this.customForms.isViewForm) {
      this.isShowSubmitAndNext = this.customForms.CustomFormView && this.customForms.CustomFormView.length > 1 ? true : false;
      this.isDisabledSubmitButton = this.customeFormViewModel.FormStatusID == this.enuFormTypes.Submitted ? true : false;

      //copy form data for skip
      this.customeFormViewModelCopy = JSON.parse(JSON.stringify(this.customeFormViewModel));

    }

    this.customeFormViewModel.JsonText.attributes.forEach(item => {
      if (item.type == 'textarea') {
        item.rows = item.value && item.value.length > 150 ? item.value.length / 150 : item.value && item.value.length <= 150 ? 3 : 4;
        item.rows = item.rows < 2 ? 3 : item.rows;
      }

      if (item.type == 'textarea-readonly') {
        item.rows = item.value && item.value.length > 150 ? (item.value.length / 150) + 1 : item.value && item.value.length <= 150 ? 3 : 4;
        item.rows = item.rows < 2 ? 3 : item.rows;
      }

      if (this.customForms.isViewForm && item.type == 'text') {
        item.rows = item.value && item.value.length > 150 ? (item.value.length / 150) + 1 : item.value && item.value.length <= 150 ? 2 : 4;
        item.rows = item.rows < 2 ? 3 : item.rows;
      }
    });

  }

  async getCurrentBranchDetail() {
    this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerTooltipDateFormat);
    this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.BranchInfo = branch;
    }

    this.dateFormat = this.dateFormat + ' - ' + this.schedulerTimeFormat;
  }
  
  ngAfterViewInit() {
    this.customeFormViewModel.JsonText.attributes.forEach(field => {
      if (field.type == this.enuFormTypeName.ESignature) {
        this.signaturePad = new SignaturePad(this.signaturePadElement?.nativeElement);
      }
    });
  }

 

  //Get Company Info
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
    if (this.CompanyInfo.ImageFile && this.CompanyInfo.ImageFile != "") {
      this.imagePath = "data:image/jpeg;base64," + this.CompanyInfo.ImageFile;
      this.isImageExist = true;
    }
    else if (this.CompanyInfo.ImagePath && this.CompanyInfo.ImagePath != "") {
      this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setCustomerImagePath()) + this.CompanyInfo.ImagePath;
      this.isImageExist = true;
    }
    else {
      this.isImageExist = false;
    }
  }

  // Close view popup
  onSkipCloseDialog() {
    if (!this.customForms.isViewForm) {
      //this.customForms = JSON.parse(JSON.stringify(this.customFormsCopy));
      var oldForm = JSON.parse(JSON.stringify(this.customeFormViewModelCopy));
      if (this.customForms.CustomFormView.length == this.formIndex) {
        this.customForms.CustomFormView[this.formIndex - 1].JsonText = JSON.stringify(oldForm.JsonText);
      } else {
        this.customForms.CustomFormView[this.formIndex].JsonText = JSON.stringify(oldForm.JsonText);
      }
    }
    this.dialogRef.close();
  }

  onSubmitCloseDialog() {
    this.dialogRef.close();
  }

  //signature pad
  drawClear(index) {
    if (!this.customForms.isViewForm) {
      if (this.isShowEditSignatureButton) {
        this.onEditSignature(index)
      } else {
        this.signaturePad.clear();
      }
    }
  }

  // drawComplete() {
  //   // will be notified of szimek/signature_pad's onEnd event
  //   //console.log(this.signaturePad.toDataURL());
  // }

  drawStart(index: number) {
    // will be notified of szimek/signature_pad's onBegin event
    this.focusFunction(index);
    //console.log('begin drawing');
  }

  setSignature() {
    if (this.customeFormViewModel.JsonText.attributes.find(s => s.type == this.enuFormTypeName.ESignature) && this.customeFormViewModel.JsonText.attributes.find(s => s.type == this.enuFormTypeName.ESignature).value) {
      this.isShowEditSignatureButton = true;
    } else {
      setTimeout(() => {
        let x = document.getElementsByTagName('canvas')[0];
        if (x != undefined) {
          this.signaturePad = new SignaturePad(x);
        }
      }, 1500);
      this.isShowEditSignatureButton = false;
    }
  }

  onEditSignature(index) {
    this.isShowEditSignatureButton = false;
    this.isDisabledSubmitButton = false;
    this.customeFormViewModel.JsonText.attributes[index].value = "";
    setTimeout(() => {
      let x = document.getElementsByTagName('canvas')[0];
      if (x != undefined) {
        this.signaturePad = new SignaturePad(x);
      }
    }, 100);
  }

  toggleValue(item, index, mainIndex) {
    this.customeFormViewModel.JsonText.attributes[mainIndex].values[index].selected = !item.selected;
  }

  focusFunction(index: number) {
    this.customeFormViewModel.JsonText.attributes[index].error = false;
    if (this.customeFormViewModel.JsonText.attributes[index].type != this.enuFormTypeName.Checkbox && this.customeFormViewModel.FormStatusID == this.enuFormTypes.Submitted) {
      this.isDisabledSubmitButton = this.customeFormViewModelCopy.JsonText.attributes[index].value == this.customeFormViewModel.JsonText.attributes[index].value ? true : false;
    } else if (this.customeFormViewModel.JsonText.attributes[index].type == this.enuFormTypeName.Checkbox && this.customeFormViewModel.FormStatusID == this.enuFormTypes.Submitted) {
      this.isDisabledSubmitButton = false;
    }
  }

  onBlurFunction(index: number) {
    this.customeFormViewModel.JsonText.attributes[index].value = this.customeFormViewModel.JsonText.attributes[index].value ? this.customeFormViewModel.JsonText.attributes[index].value.toString().trim() : "";
  }

  onSubmit() {

    let valid = true;

    this.customeFormViewModel.JsonText.attributes.forEach(field => {
      if (field.required && !field.value && field.type != this.enuFormTypeName.Checkbox && field.type != this.enuFormTypeName.ESignature) {
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
        if (field.min) {
          if (field.value < field.min) {
            valid = false;
            field.error = true;
          }
        }
        if (field.max) {
          if (field.value > field.max) {
            valid = false;
            field.error = true;
          }
        }
      }
      if (field.value && field.regex) {
        let regex = new RegExp(field.regex);
        if (regex.test(field.value) == false) {
          valid = false;
          field.error = true;

        }
      }
      if (field.required && field.type == this.enuFormTypeName.Checkbox) {
        if (field.values.filter(r => r.selected).length == 0) {
          valid = false;
          field.error = true;
        }
      }
      if (field.type == this.enuFormTypeName.ESignature) {
        if (!this.isShowEditSignatureButton) {
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

    this.resetFormValidation();

    this.customForms.CustomFormView[this.formIndex].FormStatusID = this.enuFormTypes.Submitted;
    this.customForms.CustomFormView[this.formIndex].JsonText = JSON.stringify(this.customeFormViewModel.JsonText);

    if (this.isShowSubmitAndNext) {
      this.formIndex++;
      if (this.formIndex < this.customForms.CustomFormView.length - 1) {
        this.customeFormViewModel = this.customForms.CustomFormView[this.formIndex];
        this.customeFormViewModel.JsonText = JSON.parse(this.customeFormViewModel.JsonText);
        //copy form data for skip
        this.customeFormViewModelCopy = JSON.parse(JSON.stringify(this.customeFormViewModel));
        this.setSignature();
      } else {
        this.isShowSubmitAndNext = false;
        this.customeFormViewModel = this.customForms.CustomFormView[this.formIndex];
        this.customeFormViewModel.JsonText = JSON.parse(this.customeFormViewModel.JsonText);
        //copy form data for skip
        this.customeFormViewModelCopy = JSON.parse(JSON.stringify(this.customeFormViewModel));
        this.setSignature();
      }
      this.isDisabledSubmitButton = this.customeFormViewModel.FormStatusID == this.enuFormTypes.Submitted ? true : false;
    } else {
      this.onSubmitForms.emit(this.customForms.CustomFormView);
      this.onSubmitCloseDialog();
    }
  }

  public onSkip() {

    //add copied form when user skip form
    var oldForm = JSON.parse(JSON.stringify(this.customeFormViewModelCopy));

    this.customForms.CustomFormView[this.formIndex].IsSkipped = true;
    this.customForms.CustomFormView[this.formIndex].FormStatusID = this.customForms.CustomFormView[this.formIndex].FormStatusID;
    this.customForms.CustomFormView[this.formIndex].JsonText = JSON.stringify(oldForm.JsonText);
    this.formIndex++;
    if (this.formIndex <= this.customForms.CustomFormView.length - 1) {
      this.customeFormViewModel = this.customForms.CustomFormView[this.formIndex];
      this.customeFormViewModel.JsonText = JSON.parse(this.customeFormViewModel.JsonText);
      this.isShowSubmitAndNext = this.formIndex == this.customForms.CustomFormView.length - 1 ? false : true;
      this.setSignature();
      this.isDisabledSubmitButton = this.customeFormViewModel.FormStatusID == this.enuFormTypes.Submitted ? true : false;
      this.customeFormViewModelCopy = JSON.parse(JSON.stringify(this.customeFormViewModel));
    } else {
      this.onSubmitForms.emit(this.customForms.CustomFormView);
      this.onSkipCloseDialog();
    }
  }

  onBack() {
    this.isShowSubmitAndNext = true;
    this.customForms.CustomFormView[this.formIndex].JsonText = JSON.stringify(this.customForms.CustomFormView[this.formIndex].JsonText);
    this.formIndex--;
    this.customeFormViewModel = this.customForms.CustomFormView[this.formIndex];
    this.customeFormViewModel.JsonText = JSON.parse(this.customeFormViewModel.JsonText);
    this.isDisabledSubmitButton = this.customeFormViewModel.FormStatusID == this.enuFormTypes.Submitted ? true : false;
    this.customeFormViewModelCopy = JSON.parse(JSON.stringify(this.customeFormViewModel));
    this.setSignature();
    this.resetFormValidation();
  }

  resetFormValidation() {
    this.customeFormViewModel.JsonText.attributes.forEach(field => {
      field.error = false;
    });
  }

  onOpenCalendar(picker: MatDatepicker<Date>) {
    picker.open();
    // setTimeout(() => this._input.nativeElement.focus());
  }
}
