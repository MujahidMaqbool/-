import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';

/*********************** Material Reference *************************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerFormApi, StaffApi } from '@app/helper/config/app.webapi';
import { ApiResponse } from '@app/models/common.model';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { Messages } from '@app/helper/config/app.messages';
import { SaveCustomerForm } from '@app/models/customer.form.model';

@Component({
  selector: 'save-forms',
  templateUrl: './save.forms.component.html'
})
export class SaveFormsComponent implements OnInit {

  /* Messages */
  messages = Messages;
  saveCustomerFormModel: SaveCustomerForm = new SaveCustomerForm;

  customerFormlist = [];
  isFormExist: boolean;
  @Output()
  isConfirm = new EventEmitter<boolean>();

  constructor(private dialogRef: MatDialogRef<SaveFormsComponent>,
    private _httpService: HttpService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public saveCustomForm: any, ) {
  }

  ngOnInit() {
    this.getFundamental();

  }

  getFundamental() {
    let _url = '';

    if (this.saveCustomForm.isStaff) {
      _url = StaffApi.getStaffCustomForms;
    } else {
      _url = CustomerFormApi.getAllCustomerFormFundamental;
    }

    this._httpService.get(_url).subscribe(
      (response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          if (response && response.Result) {
            if (this.saveCustomForm.isStaff) {
              this.setCustomerForm(response.Result.length > 0? response.Result: null);
            } else {
              this.setCustomerForm(response.Result.CustomerForm);
            }
          }
        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
      error => {
        this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
      });
  }

  setCustomerForm(forms: any) {
    if (forms && forms != null) {
      this.customerFormlist = forms && forms.length > 0 ? forms : [];
      this.saveCustomerFormModel.FormID = this.customerFormlist[0].FormID;
    } else {
      this._messageService.showSuccessMessage(this.messages.Confirmation.Not_Active_Forms);
    }
    this.isFormExist = this.customerFormlist && this.customerFormlist.length > 0 ? true : false;
  }

  saveCustomerForm() {
    let _params;
    let _url;

    if (this.saveCustomForm.isStaff) {
      _url = StaffApi.SaveStaffForms;
      _params = {
        JsonText: "",
        FormID: this.saveCustomerFormModel.FormID,
        StaffID: this.saveCustomForm.StaffID,
        StaffFormID: "00000000-0000-0000-0000-000000000000"
      }
    } else {
      _url = CustomerFormApi.saveSaveManualCustomerForm;
      _params = {
        CustomerID: this.saveCustomForm.CustomerID,
        FormID: this.saveCustomerFormModel.FormID
      }
    }

    this._httpService.save(_url, _params).subscribe(
      (response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this.isConfirm.emit(true);
          this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Form"));
        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
      error => {
        this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
      });
  }




  onCloseDialog() {
    this.dialogRef.close();
  }

}
