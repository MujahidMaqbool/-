import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { HttpService } from 'src/app/services/app.http.service';
import { LoginApi } from 'src/app/helper/config/app.webapi';
import { AuthService } from 'src/app/helper/app.auth.service';
import { Messages } from 'src/app/helper/config/app.messages';

import { ChangePassword } from '../model/login.model';
import { NgForm } from '@angular/forms';
import { MessageService } from 'src/app/services/app.message.service';


@Component({
  selector: 'change-password',
  templateUrl: './change.password.component.html'
})

export class ChangePasswordComponent {

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
    private _router: Router) {

    this.changePasswordModel = new ChangePassword();

    this.invalidEmail = false;
    this.invalidPassword = false;
  }

  // #region Events

  onChangePassword() {
    this.changePassword();
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
            this._router.navigate(['/account/login']);
          }
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

  // #endregion
}