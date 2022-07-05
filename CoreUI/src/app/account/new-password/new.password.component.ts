import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HttpService } from '@app/services/app.http.service';
import { LoginApi } from '@helper/config/app.webapi';
import { Messages } from '@helper/config/app.messages';

import { SavePassword } from '../model/login.model';
import { MessageService } from '@app/services/app.message.service';


@Component({
  selector: 'new-password',
  templateUrl: './new.password.component.html'
})

export class SavePasswordComponent {

  /* Model References */
  savePasswordModel: SavePassword;

  /* Local Members */
  token: string;
  confirmPassword: string;
  invalidEmail: boolean;
  invalidPassword: boolean;
  loginRoute: string = '/account/login';

  /* Error Messages */
  hasError: boolean;
  errorMessage: string;
  messages = Messages;

  /* Collection Types */

  constructor(
    private _httpService: HttpService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _messageService: MessageService) {

    this.savePasswordModel = new SavePassword();

    this.invalidEmail = false;
    this.invalidPassword = false;
  }

  // #region Events

  ngOnInit() {
    this.getTokenFromRoute();
  }

  onSavePassword() {
    this.savePassword();
  }

  // #endregion

  // #region Methods

  getTokenFromRoute() {
    this._route.paramMap.subscribe(params => {
      this.token = params.get('token');

      if (this.token && this.token.length > 0) {
        this.verifyToken();
      }
      else {
        this._router.navigate([this.loginRoute]);
        this._messageService.showErrorMessage(this.messages.Validation.Password_Token_Invalid);
      }
    });
  }

  verifyToken() {    
    this._httpService.save(LoginApi.validateToken, JSON.stringify(this.token)).subscribe(
      response => {
        if (response && response.Result) {
          this.savePasswordModel.Email = response.Result.Email;

          // Show Form and continue  
        }
        else if (response && response.MessageCode == -44) {
          // Invalid Token
          this._router.navigate([this.loginRoute]);
          this._messageService.showErrorMessage(this.messages.Validation.Password_Token_Invalid);
        }else{
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
      error => {
        this._router.navigate([this.loginRoute]);
        this._messageService.showErrorMessage(this.messages.Error.Password_Token_Save);
      }
    )
  }

  savePassword() {
    this.savePasswordModel.PasswordToken = this.token;
    this._httpService.save(LoginApi.savePassword, this.savePasswordModel).subscribe(
      response => {
        if (response && response.MessageCode && response.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Password_Save);
          this._router.navigate([this.loginRoute]);
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', 'Password'));
        }
      },
      error => {
        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', 'Password'));
      }
    )
  }

  showErrorMessage(message: string) {
    this.hasError = true;
    this.errorMessage = message;
  }

  // #endregion
}