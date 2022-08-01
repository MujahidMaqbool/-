/************************* Angular References ***********************************/
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

/********************* Material:Refference ********************/
import { MatDialogRef } from '@angular/material/dialog';

/********************** Service & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { AuthService } from 'src/app/helper/app.auth.service';
import { MessageService } from 'src/app/services/app.message.service';

/* Models */
import { ChangePassword } from 'src/app/account/model/login.model';


/********************** Configurations *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { LoginApi } from 'src/app/helper/config/app.webapi';



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
