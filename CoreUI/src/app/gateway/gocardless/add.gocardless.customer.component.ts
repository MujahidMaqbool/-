// declare var GoCardless;
// declare var $: any;
// #region Imports

/*********************** Angular References *************************/
import { Component, ViewChild, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from "@angular/forms";
import { SubscriptionLike } from 'rxjs';

/*********************** Models & Services  *************************/
/* Services */
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { DataSharingService } from 'src/app/services/data.sharing.service';

/* Models */
import { SavedAccount, SaveGoCardless, SEPACountry, SEPADashAfterDigit } from "src/app/models/cutomer.gateway.models";
import { ApiResponse } from 'src/app/models/common.model';

/*********************** Configurations  *************************/
import { CustomerPaymentGatewayApi } from "src/app/helper/config/app.webapi";
import { Messages } from "src/app/helper/config/app.messages";
import { ENU_PaymentAccount, ENU_PaymentSortCode, ENU_SEPACountryCode, ENU_SEPACountryScheme, ENU_Page } from 'src/app/helper/config/app.enums';
import { SEPACountyAccountDetail, SEPACountyAccountDigitBeforeDash } from 'src/app/helper/config/app.config';

/*********************** Components  *************************/
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

// #endregion

@Component({
  selector: "add-gocardless-customer",
  templateUrl: "./add.gocardless.customer.component.html"
})


export class AddGoCardlessCustomerComponent extends AbstractGenericComponent implements OnInit {
  @ViewChild("addGoCardlessForm") addGoCardlessForm: NgForm;

  @Input() customerID: number;
  @Input() showAddAccount: boolean = true;
  @Input() pageID: number = 0;
  @Output() CountrySchema = new EventEmitter();
  @Output() paymentGateWayID = new EventEmitter();


  // #region Local Members

  accountId: number;
  isSubmitted: boolean = false;

  saveGoCardlessModel: SaveGoCardless;
  isTermsAgreed: boolean = false;
  isACH: boolean = false;

  savedAccounts: SavedAccount[];
  sepaCountryList: SEPACountry[];
  sepaDashAfterDigit: SEPADashAfterDigit[];
  messages = Messages;
  paymentAccountLength = ENU_PaymentAccount;
  paymentSortCodeLength = ENU_PaymentSortCode;
  enu_SEPACountryCode = ENU_SEPACountryCode;
  enu_SEPACountryScheme = ENU_SEPACountryScheme;
  sepaCountryAccountDetail: any = SEPACountyAccountDetail.SEPACountryAccountDetail;
  sepaCountryDigitAfterDashDetail: any = SEPACountyAccountDigitBeforeDash.SEPACountryDigitAfterDashDetail;
  sepaCountrySubscription: SubscriptionLike;
  currencyCode: string;
  ISOCode: string;

  accountMax: number = null;
  branchCodeMax: number = null;
  bankCodeMax: number = null;
  checkMax: number = null;
  spaceMax: number = 1;
  hasBranchCode: boolean;
  digitsBeforeDash: number;
  branchCodeRequired: boolean = true;
  currentBranchSubscription: SubscriptionLike;

  //collection
  enumPage = ENU_Page;

  accountTypeList = [
    {
      id: null,
      name: "Select Account Type"
    },
    {
      id: "Checking",
      name: "Checking Account"
    },
    {
      id: "Savings",
      name: "Savings Account"
    },
  ];
  currentBranch: any;

  // #endregion


  constructor(public _httpService: HttpService,
    public _messageService: MessageService,
    public _dataSharingService: DataSharingService,
  ) {
    super();
  }

  ngOnInit() {
    if (this.showAddAccount) {
      this.accountId = 0;
    }
    // subscribe current branch
    this.currentBranchSubscription = this._dataSharingService.currentBranch.subscribe((currentBranch: any) => {
      this.currentBranch = currentBranch;
    })
    this.saveGoCardlessModel = new SaveGoCardless();
    //this.createCustomerToken.PublishableAccessToken = "wI8aeG6HZ6s474fsG1n0jkqLqGXcD4dKUnnS1sXl";
    //this.createCustomerToken.PublishableAccessToken = "D-i0uXNImR57AFNCydQUoBmAjGduys4eVOdwFt5-";

    this.getSavedAccounts();
    this.getCurrentBranchDetail();
    this.getSEPACounteries();
    //this.getSEPACountry();
  }

  ngOnDestroy() {
    this.currentBranchSubscription.unsubscribe();
  }


  // #region Events

  onAccountHolderName() {
    this.saveGoCardlessModel.AccountHolderName = this.saveGoCardlessModel.AccountHolderName?.trim();
  }

  // #endregion

  // #region Methods

  getSavedAccounts() {
    if (this.customerID && this.customerID > 0) {
      this.savedAccounts = [];
      this._httpService.get(CustomerPaymentGatewayApi.getGoCardlessAccounts, { customerId: this.customerID })
        .subscribe((response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this.savedAccounts = response.Result;

            if (this.savedAccounts && this.savedAccounts.length > 0) {
              this.savedAccounts.forEach(account => {
                account.Title = account.InstrumentName + " ****" + account.InstrumentLastDigit
              });

              if (this.showAddAccount) {
                this.savedAccounts.push({ CustomerPaymentGatewayID: 0, InstrumentName: "", InstrumentLastDigit: "", Title: "Add New Account" });

              }

              this.accountId = this.savedAccounts[0].CustomerPaymentGatewayID;
              this.paymentGateWayID.emit(this.accountId);
            }
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }

        },
          error => {
            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Saved Accounts"));
          }
        );
    }
  }

  getSEPACounteries() {
    this._httpService.get(CustomerPaymentGatewayApi.getSEPACoutries)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          if (response.Result) {
            this.CountrySchema.emit(response.Result.Scheme);
            if (this.enu_SEPACountryScheme.sepa_core == response.Result.Scheme) {
              this.sepaCountryList = response.Result ? response.Result.CountriesList : [];
            }
            else {
              if (this.enu_SEPACountryScheme.ach == response.Result.Scheme) {
                this.bankCodeMax = 9;
                this.branchCodeRequired = false;
                this.isACH = true;
                this.saveGoCardlessModel.AccountType = null;
              }

            }
            this.saveGoCardlessModel.CountryCode = response.Result ? response.Result?.CountriesList.filter(country => country.ISOCode == this.currentBranch.ISOCode)[0]?.ISOCode : [];
          }
        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
        }

      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
      );
  }

  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyCode = branch.Currency;
      this.ISOCode = branch.ISOCode;
      if (this.currencyCode == this.enu_SEPACountryCode.AUD || this.currencyCode == this.enu_SEPACountryCode.US) {
        this.saveGoCardlessModel.CountryCode = this.currencyCode;
        this.onSEPACountryChange();
      } else if (this.ISOCode == this.enu_SEPACountryCode.DE) {
        this.saveGoCardlessModel.CountryCode = branch.ISOCode;
        this.onSEPACountryChange();
      }
    }
  }


  // getCustomerToken(): Promise<any> {
  //   this.isSubmitted = true;
  //   return new Promise<any>((resolve, reject) => {
  //     if (this.addGoCardlessForm.valid) {

  //       var compInstance = this;
  //       var model = {
  //         publishable_access_token: compInstance.createCustomerToken.PublishableAccessToken,
  //         customer_bank_account_tokens: {
  //           account_number: compInstance.createCustomerToken.AccountNumber,
  //           branch_code: compInstance.createCustomerToken.BranchCode,
  //           account_holder_name: compInstance.createCustomerToken.AccountHolderName,
  //           country_code: "GB"
  //         }
  //       }

  //       GoCardless.customerBankAccountTokens.create(model, function (response) {
  //         if (response.error) {
  //           reject(response.error.message)
  //           return;
  //         } else {
  //           resolve(response.customer_bank_account_tokens.id);
  //           return;
  //         }
  //       });
  //     }
  //     else {
  //       reject();
  //       return;
  //     }
  //   })
  //}

  onSEPACountryChange() {
    let spaceAfterDigit: any;
    this.resetAccountDetail();
    let accountDetail = this.getAccountNumberDetail();
    if (accountDetail) {
      this.accountMax = accountDetail.AccountCodeMax;
      this.bankCodeMax = accountDetail.BankCodeMax;
      this.branchCodeMax = accountDetail.BranchCodeMax;
      this.checkMax = accountDetail.CheckMax;
      this.branchCodeRequired = accountDetail.BranchCodeMax ? true : false;

    }

    switch (this.saveGoCardlessModel.CountryCode) {

      case this.enu_SEPACountryCode.BE:
        let dashAfterDigit = this.sepaCountryDigitAfterDashDetail.filter(account => account.CountryCode === this.enu_SEPACountryCode.BE)[0];
        this.sepaDashAfterDigit = dashAfterDigit.DashAfterDigit;
        break;

      case this.enu_SEPACountryCode.FR:
        spaceAfterDigit = this.sepaCountryDigitAfterDashDetail.filter(account => account.CountryCode === this.enu_SEPACountryCode.FR)[0];
        this.sepaDashAfterDigit = spaceAfterDigit.DashAfterDigit;
        break;

      case this.enu_SEPACountryCode.AUD:
        spaceAfterDigit = this.sepaCountryDigitAfterDashDetail.filter(account => account.CountryCode === this.enu_SEPACountryCode.AUD)[0];
        this.sepaDashAfterDigit = spaceAfterDigit.DashAfterDigit;
        break;

      case this.enu_SEPACountryCode.IE:
        spaceAfterDigit = this.sepaCountryDigitAfterDashDetail.filter(account => account.CountryCode === this.enu_SEPACountryCode.IE)[0];
        this.sepaDashAfterDigit = spaceAfterDigit.DashAfterDigit;
        break;

      case this.enu_SEPACountryCode.GR:
        spaceAfterDigit = this.sepaCountryDigitAfterDashDetail.filter(account => account.CountryCode === this.enu_SEPACountryCode.GR)[0];
        this.sepaDashAfterDigit = spaceAfterDigit.DashAfterDigit;
        break;

      default:
        this.sepaDashAfterDigit = [];
        break;

    }
  }


  getAccountNumberDetail(): any {
    let filterTemplateRelatedStaff = this.sepaCountryAccountDetail.filter(account => account.CountryCode === this.saveGoCardlessModel.CountryCode)[0];
    if (filterTemplateRelatedStaff) {
      return filterTemplateRelatedStaff;
    }
    else {
      return null;
    }

  }

  resetAccountDetail(): any {
    this.saveGoCardlessModel.AccountNumber = null;
    this.saveGoCardlessModel.AccountHolderName = null;
    this.saveGoCardlessModel.BankCode = null;
    this.saveGoCardlessModel.BranchCode = null;
    this.saveGoCardlessModel.Check = null;

  }

  onChangePaymentGateway() {
    this.paymentGateWayID.emit(this.accountId);
  }
  // #endregion
}

