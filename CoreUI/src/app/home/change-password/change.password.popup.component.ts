import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from '@app/services/app.http.service';
import { LoginApi } from '@helper/config/app.webapi';
import { AuthService } from '@helper/app.auth.service';
import { Messages } from '@helper/config/app.messages';

import { ChangePassword } from '@account/model/login.model';
import { NgForm } from '@angular/forms';
import { MessageService } from '@app/services/app.message.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'change-password-popup',
  templateUrl: './change.password.popup.component.html'
})

export class ChangePasswordPopup {

  @ViewChild('changePasswordForm') changePasswordForm: NgForm;

  /* Model References */
  changePasswordModel: ChangePassword;

  /* Local Members */
  confirmPassword: string;
  invalidEmail: boolean;
  invalidPassword: boolean;
  imagePath: string = 'assets/images/company_placeholder.jpg';

  /* Error Messages */
  hasError: boolean;
  errorMessage: string;
  messages = Messages;

  /* Collection Types */

  constructor(
    private _messageService: MessageService,
    private _httpService: HttpService,
    private _dialogRef: MatDialogRef<ChangePasswordPopup>,
    private _router: Router) {

    this.changePasswordModel = new ChangePassword();

    this.invalidEmail = false;
    this.invalidPassword = false;
  }

  // #region Events

  onChangePassword() {
    this.changePassword();
  }

  onCloseDialog() {
    this.closeDialog();
  }

  // #endregion

  // #region Methods

  changePassword() {
    if (this.changePasswordForm.valid) {
      this._httpService.save(LoginApi.changePassword, this.changePasswordModel).subscribe(
        response => {
          if (response && response.MessageCode > 0) {
            // SUCCESS
            this._messageService.showSuccessMessage(this.messages.Success.Password_Save);
            AuthService.logout();
            this.closeDialog();
            this._router.navigate(['/account/login']);
          }
          // else if (response && response.MessageCode == -33) {            
          //   // ERROR
          //   this._messageService.showErrorMessage(this.messages.Validation.OldPassword_Incorrect);
          // }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        },
        error => {
          // ERROR
          this._messageService.showErrorMessage(this.messages.Error.Password_Change);
        }
      )
    }
  }

  showErrorMessage(message: string) {
    this.hasError = true;
    this.errorMessage = message;
  }

  closeDialog(){
    this._dialogRef.close();
  }

  // #endregion
}