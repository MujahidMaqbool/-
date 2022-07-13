import { Component, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ENU_LoginState, EnumSaleSourceType } from '@helper/config/app.enums';
import { HttpService } from '@app/services/app.http.service';
import { LoginApi } from '@helper/config/app.webapi';
import { AuthService } from '@helper/app.auth.service';
import { ImagesPlaceholder } from '@helper/config/app.placeholder';
import { Messages } from '@helper/config/app.messages';

import { environment } from '@env/environment';

import { Login } from '../model/login.model';
import { MessageService } from '@app/services/app.message.service';
import { ApiResponse } from '@app/models/common.model';
import { variables } from '@app/helper/config/app.variable';
import { AppUtilities } from '@app/helper/aap.utilities';
import { DataSharingService } from '@app/services/data.sharing.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})

export class LoginComponent {

  /* Model References */
  loginModel: Login;

  /* Local Members */
  returnUrl: string;
  companyName: string;
  companyLogo: string;
  loginTitle: string;
  isWelcomeStaff: boolean;
  isChooseAccount: boolean;
  isStaffLogin: boolean;
  showBackBtn: boolean;
  loginStateId: number;
  invalidEmail: boolean;
  invalidPassword: boolean;
  loginInProcess: boolean = false;
  imagePath: string = 'assets/images/wellyx-company-logo.png';

  loginStates = ENU_LoginState;
  enum_AppSourceType = EnumSaleSourceType;
  logInStatus: boolean = false;

  /* Error Messages */
  hasError: boolean;
  errorMessage: string;
  messages = Messages;

  /* Collection Types */
  staffCompanyList: any[];

  constructor(private _route: ActivatedRoute,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _router: Router,
    private _renderer: Renderer2,
    private _dataSharingSrevice: DataSharingService) {

    this.loginModel = new Login();

    this.loginTitle = "STAFF LOGIN";
    this.loginStateId = this.loginStates.StaffLogin;
    this.isStaffLogin = true;
    this.isChooseAccount = false;
    this.isWelcomeStaff = false;
    this.invalidEmail = false;
    this.invalidPassword = false;
  }


  ngOnInit() {
    const token: string = AuthService.getAccessToken();
    if (token) {
      this._router.navigateByUrl(this.returnUrl);
    }
    else {
      this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';
    }
  }

  // #region Events

  onChooseAccount(company: any) {
    this.loginModel.CompanyID = company.CompanyID;
    this.companyName = company.CompanyName;
    this.companyLogo = company.LogoPath;
    this.onNext();
  }

  onNext() {
    switch (this.loginStateId) {
      case (this.loginStates.StaffLogin): {
        this.getStaffCompanies();
        break;
      }

      case (this.loginStates.ChooseAccount): {
        this.showStaffWelcome();
        break;
      }

      case (this.loginStates.WelcomeStaff): {
        this.loginStaff();
        break;
      }
    }
  }

  onBack() {
    switch (this.loginStateId) {
      case (this.loginStates.ChooseAccount): {
        this.showStaffLogin();
        break;
      }

      case (this.loginStates.WelcomeStaff): {
        this.showChooseAccount();
        break;
      }
    }
  }

  onForgotPassword() {
    this.sendResetPasswordLink();
  }

  // #endregion

  // #region Methods

  sendResetPasswordLink() {
    this._httpService.save(LoginApi.forgotPassword, { CompanyID: this.loginModel.CompanyID, Email: this.loginModel.Email }).subscribe(
      (response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Reset_Password_Email_Sent);
          this.showStaffLogin();
        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
      error => {
        this._messageService.showErrorMessage(this.messages.Error.Reset_Password);
      }
    )
  }

   onEmailTrim(){
     this.loginModel.Email =  this.loginModel.Email.trim();
   }

  getStaffCompanies() {
    this.invalidEmail = false;
    // ---  set AppSourceTypeId for login after upgrade API's on dot net core 3.0 -- 08-01-2021 by fazeel//
    this.loginModel.AppSourceTypeID = this.enum_AppSourceType.OnSite;

    if (this.loginModel.Email && this.loginModel.Email.length > 0) {
      this._httpService.save(LoginApi.staffCompany, "'" + this.loginModel.Email + "'").subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            if (response.Result) {
              this.staffCompanyList = response.Result;
              //localStorage.setItem(variables.CompanyID, this.staffCompanyList[0].CompanyID.toString());
              this.staffCompanyList.forEach(company => {
                if (company.CompanyLogo && company.CompanyLogo.length > 0) {
                  company.LogoPath = environment.imageUrl.replace("{ImagePath}", company.CompanyID) + company.CompanyLogo;
                }
                else {
                  company.LogoPath = this.imagePath;
                }
              })

              if (this.staffCompanyList.length > 1) {
                this.showChooseAccount();
                this.showBackBtn = true;
              }
              else if (this.staffCompanyList.length === 1) {
                this.companyName = this.staffCompanyList[0].CompanyName;
                this.companyLogo = this.staffCompanyList[0].LogoPath;
                this.loginModel.CompanyID = this.staffCompanyList[0].CompanyID;

                this.showStaffWelcome();
              }
            }
            else {
              this.showErrorMessage(this.messages.Validation.Email_Not_Exist);
            }
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Login_Error);
        }
      )

    }
    else {
      this.invalidEmail = true;
    }

  }

  showStaffLogin() {
    this.isStaffLogin = true;
    this.isChooseAccount = false;
    this.isWelcomeStaff = false;
    this.logInStatus = false;

    this.loginStateId = this.loginStates.StaffLogin;
  }

  showChooseAccount() {
    this.loginTitle = "Select a company";
    this.isStaffLogin = false;
    this.isChooseAccount = true;
    this.isWelcomeStaff = false;
    this.logInStatus = false;

    this.loginStateId = this.loginStates.ChooseAccount;
  }

  showStaffWelcome() {
    this.loginTitle = "WELCOME";
    this.isStaffLogin = false;
    this.isChooseAccount = false;
    this.isWelcomeStaff = true;
    this.logInStatus = true;
    this.loginStateId = this.loginStates.WelcomeStaff;

    setTimeout(() => {
      this._renderer.selectRootElement("#txtPassword").focus();
    })
  }

  loginStaff() {
    this.invalidPassword = false;
    this.loginInProcess = true;
    if (this.loginModel.Password && this.loginModel.Password.length > 2) {
      this.login().subscribe(
        (res: ApiResponse) => {
          this.loginInProcess = false;
          if (res && res.MessageCode > 0) {
            if (res.Result) {
              localStorage.setItem(variables.CompanyID, this.loginModel.CompanyID.toString());
              this.sharedCompanyID(this.loginModel.CompanyID);
              AuthService.setAccessToken(res.Result.access_token);
              //this._router.navigate(['/']);
              this._router.navigateByUrl(this.returnUrl);
            }
          }
          else if (res.MessageCode === -33) {
            this.showErrorMessage(this.messages.Validation.Password_Invalid);
          }
          else {
            this.showErrorMessage(res.MessageText);
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Login_Error);
          this.loginInProcess = false;
        }
      );
    }
    else {
      this.invalidPassword = true;
    }
  }

  sharedCompanyID(companyID){
    this._dataSharingSrevice.shareCompanyID(companyID);
  }

  login() {
    this.hasError = false;
    return this._httpService.save(LoginApi.staffLogin, this.loginModel);
  }

  showErrorMessage(message: string) {
    this.hasError = true;
    this.errorMessage = message;
  }

  // #endregion
}
