/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from "@angular/core";
import { SubscriptionLike } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from '@angular/common';
import { NgForm } from "@angular/forms";

/********************** Service & Models *********************/
/*Services*/
import { HttpService } from "@services/app.http.service";
import { MessageService } from "@services/app.message.service";
import { AuthService } from "@app/helper/app.auth.service";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { SessionService } from "@app/helper/app.session.service";
import { StripeService } from "@app/services/stripe.service";
import { DynamicScriptLoaderService } from "@app/services/dynamic.script.loader.service";
import { DataSharingService } from "@app/services/data.sharing.service";
import { LoaderService } from "@app/services/app.loader.service";

/*Models*/
import { SaveIntegration, BranchGatwayIntegration, StripeTerminal, PaymentSettings } from "@setup/models/gateway.integration.model";
import { ApiResponse, DD_Branch } from "@app/models/common.model";

/****************** Angular Material References *****************/
import { MatOption } from "@angular/material/core";


/******************  Configurations ****************************/
import { Messages } from "@helper/config/app.messages";
import { GatewayIntegrationApi } from "@helper/config/app.webapi";
import { environment } from "@env/environment";
import { ENU_PaymentGateway, ENU_CurrencyFormat, ENU_Package, ENU_CountryCodeStripeTerminal } from "@app/helper/config/app.enums";
import { ENU_Permission_Setup, ENU_Permission_Individual, ENU_Permission_Module } from "@app/helper/config/app.module.page.enums";
import { Configurations } from "@app/helper/config/app.config";


/****************** Components *****************/
import { UaeStripeConnectComponent } from "@app/shared/components/uae-stripe-connect/uae.stripe.connect.component";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";
import { StripeReaderComponent } from "@app/gateway/stripe-terminal/stripe.reader.component";

var loaderService;

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
})
export class PaymentsComponent extends AbstractGenericComponent implements OnInit {
  @ViewChild("stripeReaderForm") stripeReaderForm: NgForm;

  /* Messages */
  messages = Messages;
  /*********** Local Members **********/
  isGymPackage: boolean;
  isBranchGatewayExist: boolean = false;
  isAllowStripeTerminal: boolean = false;
  isAllowStripeTerminalCountryBase: boolean = false;
  hasUserPermissionAllow: boolean = false;
  state: string;
  stripe_client_id: string;
  redirect_uri = environment.stripeRedirectUrl;
  strip_connect_url =
    environment.stripeConnectUrl +
    "/express/oauth/authorize?response_type=code&client_id={client_id}&scope=read_write&redirect_uri={redirect_uri}&state={state}";
  paytabs_connect_url = 'https://merchant.paytabs.com/merchant/register';
  isStripeIntegrated: boolean;
  IsPayTabsIntegrated: boolean;
  imagePath: string = "";
  currencyFormat: string;
  gocardless_client_id: string;
  paymentGatewayID: number = 0;
  selectedpaymentGatewayIdForCheckout: Array<any> = [];
  isSuperAdminLoggedIn: boolean;
  branchISOCode: string = 'AE';
  /*   **Voyager QA Client ID**
    TID7jnoNExZeeu9OAX1Rqjy8ZXB3TsHSdV1ygyVO46YZR3UP5CbFNvDcZFzwms4S
  */
  /*   **Voyager Sandbox Client ID**
     PIaSBoxmOmKCbDS1hN86x61_25X0jpn46fInoAvA51nGrcCDHZSL3S
   */
  // sandbox_ImaIoGjXdB3PNL0AQXC8kg3kbry0FY1QNtstsraa
  gocardless_connect_url =
    environment.goCardlessConnectUrl +
    "/oauth/authorize?response_type=code&client_id={client_id}&scope=read_write&redirect_uri={redirect_uri}&state={state}";
  isGoCardlessIntegrated: boolean;
  /*********** Model Reference **********/
  stripeTerminal: StripeTerminal = new StripeTerminal();
  branchPaymentGatway: BranchGatwayIntegration[];
  branchPaymentGatwayForCheckout: BranchGatwayIntegration[];
  paymentSettings: PaymentSettings = new PaymentSettings();
  CopyPaymentSettings: PaymentSettings = new PaymentSettings();
  saveIntegration: SaveIntegration;
  routerSubscription: SubscriptionLike;
  packageIdSubscription: SubscriptionLike;
  //readerSubscription: SubscriptionLike;
  enu_PaymentGateway = ENU_PaymentGateway;
  enu_CurrencyFormat = ENU_CurrencyFormat;
  AllowedNumberKeys = Configurations.AllowedNumberKeys;
  package = ENU_Package;

  private readonly GATEWAY_ID = "gateway_id";

  @ViewChild("stripeService") stripeService: StripeService;
  @ViewChild("stripeReaderComp") stripeReaderComp: StripeReaderComponent;
  @ViewChild('allSelectedPaymentMethod') private allSelectedPaymentMethod: MatOption;
  hasFacilityInPackage: boolean;
  hasSplitPaymentPackage: boolean = false;
  hasAllowedSplitPayment: boolean = false;
  hasRewardProgramPackage: boolean = false;
  isValid: boolean;
  showError: boolean = false;
  isSave: boolean = true;
  isRequiredMessage: boolean;

  /* Configurations */

  constructor(
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _route: ActivatedRoute,
    private _stripeService: StripeService,
    private _dialog: MatDialogService,
    private _dynamicScriptLoader: DynamicScriptLoaderService,
    private _dataSharingService: DataSharingService,
    private _loaderService: LoaderService,
    private _authService: AuthService,
    private _router: Router,
    private rewriteUrl: Location
  ) {
    super();
    loaderService = this._loaderService;
  }

  ngOnInit() {
    //rewrite the url state
    this.rewriteUrl.replaceState("/setup/configurations/payments");
    this.loadScripts();
    this.isSuperAdminLoggedIn = SessionService.IsStaffSuperAdmin();

    this.checkPackagePermissions();
    this.setPermissions();
    this.setDefaultValue();
    this.getCurrentBranchDetail();

    this._dataSharingService.stripeTerminalConnectedOrDisconnected.subscribe((isConnected: boolean) => {
      if (isConnected)
        this.getStripeTerminalConfig(false);
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  // #region events

  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {

      this.branchISOCode = branch.ISOCode;
      this.isAllowStripeTerminalCountryBase =
        branch.ISOCode === ENU_CountryCodeStripeTerminal.USA || branch.ISOCode === ENU_CountryCodeStripeTerminal.UK || branch.ISOCode === ENU_CountryCodeStripeTerminal.IRE ? true : false;
      // if (this.isAllowStripeTerminalCountryBase) {
      /// this.getStripeReader();
      // }
    }
  }

  // onSave Payments settings
  onSave() {
    if (!this.isSaved()) {
      this.paymentSettings.PaymentGatewayID = this.paymentGatewayID ? this.paymentGatewayID : 0;
      this.paymentSettings.CheckoutPaymentGatewayIDs = [];
      if (this.selectedpaymentGatewayIdForCheckout && this.selectedpaymentGatewayIdForCheckout.length > 0) {
        this.selectedpaymentGatewayIdForCheckout.forEach(gateway => {
          if (gateway.PaymentGatewayID != undefined && gateway.PaymentGatewayID != 0) {
            this.paymentSettings.CheckoutPaymentGatewayIDs.push(gateway.PaymentGatewayID)
          }
        })
      }
      // this.selectedpaymentGatewayIdForCheckout ? this.selectedpaymentGatewayIdForCheckout.forEach(gateway => { this.paymentSettings.CheckoutPaymentGatewayIDs.push(gateway.PaymentGatewayID) }) : [];
      this._httpService.save(GatewayIntegrationApi.SavePaymentSetting, this.paymentSettings).subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._dataSharingService.sharePartPaymentAllowPermission(
              this.paymentSettings.AllowPartPaymentOnCore
            );
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Payments Configurations"));
            this.getFundamentals();
          } else {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Payments Configurations"));
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Payments Configurations"));
        }
      );
    }
  }

  isSaved() {
    //commented by tahir shb 
    // if (this.paymentSettings.WidgetPartPaymentFriendlyName == null || this.paymentSettings.WidgetPartPaymentFriendlyName == '') {
    //   this.showError = true;
    //   this.isRequiredMessage = true;
    // }
    // else
    if (this.paymentSettings.WidgetPartPaymentForMember.toString() == "" || this.paymentSettings.WidgetPartPaymentForMember > 100) {
      this.showError = true;
    } else if (this.paymentSettings.WidgetPartPaymentForNonMember.toString() == "" || this.paymentSettings.WidgetPartPaymentForNonMember > 100) {
      this.showError = true;
    }
    else {
      this.showError = false;
      this.isRequiredMessage = false;
    }
    return this.showError;
  }

  onPercentageChangeOnlyNumbers(num, ) {
    this.showError = num && num != "" && num <= 100 ? false : true;
  }

  onSelectAllPyamentMethod() {
    this.selectedpaymentGatewayIdForCheckout = [];

    if (this.allSelectedPaymentMethod.selected) {
      this.branchPaymentGatwayForCheckout.forEach(gateway => {
        this.selectedpaymentGatewayIdForCheckout.push(gateway);
      });

      setTimeout(() => {
        this.allSelectedPaymentMethod.select();
      }, 100);
    }
  }

  tosslePerOneTax(all: any) {
    if (this.allSelectedPaymentMethod && this.allSelectedPaymentMethod.selected) {
      this.allSelectedPaymentMethod.deselect();
      //return false;
    }
    if (this.selectedpaymentGatewayIdForCheckout.length == this.branchPaymentGatwayForCheckout.length && this.branchPaymentGatwayForCheckout.length > 1) {
      this.allSelectedPaymentMethod.select();
    }
  }

  onDisconnect(gatewayId: number) {
    this.disconnectGateway(gatewayId);
  }

  onRedirectToGateway(url: string, gatewayId: number) {
    localStorage.setItem(this.GATEWAY_ID, gatewayId.toString());
    if (gatewayId == this.enu_PaymentGateway.PayTabs) {
      window.open(url, '_blank');
    }
    else {
      if (gatewayId == this.enu_PaymentGateway.Stripe_Card) {
        if (this.branchISOCode === ENU_CountryCodeStripeTerminal.AE) {
          this.openDialogToConnectStripeForUAE();
        }
        else {
          window.location.href = url;
        }
      }
      else {
        window.location.href = url;
      }
    }
  }
  onTerminalPermissionChange() {
    this.saveStripeTerminalConfig();
  }

  onKeyPress() {
    if (this.paymentSettings.WidgetPartPaymentForMember == "" || this.paymentSettings.WidgetPartPaymentForMember < 0 || this.paymentSettings.WidgetPartPaymentForMember > 100) {
      this.isValid = false;
    } else if (this.paymentSettings.WidgetPartPaymentForNonMember == "" || this.paymentSettings.WidgetPartPaymentForNonMember < 0 || this.paymentSettings.WidgetPartPaymentForNonMember > 100) {
      this.isValid = false;
      this.showError = false;
    } else {
      this.showError = false;
    }
    this.showError = this.paymentSettings.WidgetPartPaymentForMember == "" || this.paymentSettings.WidgetPartPaymentForMember < 0 || this.paymentSettings.WidgetPartPaymentForMember > 100 ? true : false;
    this.showError = this.paymentSettings.WidgetPartPaymentFriendlyName == null || this.paymentSettings.WidgetPartPaymentFriendlyName == '' ? true : false;
  }

  onPartialPaymentToggleChange() {
    if (!this.paymentSettings.IsPartialPaymentWidgetAndApp) {
      this.paymentSettings.WidgetPartPaymentFriendlyName = "Pay Minimum Amount Due";
      this.paymentSettings.PartialPaymentLable = "Buy Now and Pay Later";
      this.paymentSettings.WidgetPartPaymentForMember = 100;
      this.paymentSettings.WidgetPartPaymentForNonMember = 100;
    }

  }

  preventCharactersForClassBooking(event: any) {
    //console.log(this.parentClassObj.ClassDurationInMinutes.toString())
    let index = this.AllowedNumberKeys.findIndex(k => k == event.key);
    if (index < 0) {
      event.preventDefault()
    }
    //this.showErrorMessage = false;
  }
  openDialogToConnectStripeForUAE() {
    const dialogRef = this._dialog.open(UaeStripeConnectComponent,
      {
        disableClose: true,
        data: this.redirect_uri
      });

    dialogRef.componentInstance.returnedUrl.subscribe((returnedUrl: any) => {
      if (returnedUrl) {
        window.location.href = returnedUrl;
      }
    });
  }
  // #endregion

  // #region methods

  getFundamentals() {
    this._httpService.get(GatewayIntegrationApi.fundamentals).subscribe(
      (response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          if (response.Result) {
            this.paymentSettings = response.Result;
            this.isStripeIntegrated = response.Result.IsStripeIntegrated;
            this.stripe_client_id = response.Result.StripeClientID;
            this.IsPayTabsIntegrated = response.Result.IsPayTabsIntegrated;
            this.isGoCardlessIntegrated =
              response.Result.IsGoCardlessIntegrated;
            this.gocardless_client_id = response.Result.GoCardlessClientID;
            this.CopyPaymentSettings = Object.assign({}, this.paymentSettings);
            this.setConnectStripUrl();
            this.setConnectGoCardLessUrl();
            if (this.isStripeIntegrated && this.isAllowStripeTerminalCountryBase) {
              this.getStripeReader();
              this._dataSharingService.shareisStripeTerminalAllowed(true);
            } else {
              this._dataSharingService.shareisStripeTerminalAllowed(false);
            }
            //this.setDefaultValue();
          }
        } else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Fundamentals")
        );
      }
    );
  }

  getBranchGatwayIntegrationFundamentals() {
    this._httpService.get(GatewayIntegrationApi.BranchPaymentGateway).subscribe(
      (response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          if (response.Result) {
            this.isBranchGatewayExist =
              response.Result && response.Result.length > 0 ? true : false;
            this.branchPaymentGatway = response.Result;
            this.branchPaymentGatwayForCheckout = this.branchPaymentGatway.filter(gateway => gateway.PaymentGatewayID !== this.enu_PaymentGateway.GoCardless && gateway.PaymentGatewayID !== this.enu_PaymentGateway.Stripe_DD);
            this.paymentGatewayID = this.branchPaymentGatway[0].WidgetDefaultPaymentGatewayId;
            let selectGateWays = this.branchPaymentGatwayForCheckout[0]?.WidgetCheckOutPaymentGatewayIDs;
            if (selectGateWays) {
              this.selectAllPaymentsGateWay(selectGateWays);
            }

          }
        } else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Fundamentals")
        );
      }
    );
  }

  setDefaultValue() {
    this.paymentSettings.WidgetPartPaymentFriendlyName = this.paymentSettings.WidgetPartPaymentFriendlyName ? this.paymentSettings.WidgetPartPaymentFriendlyName : "Pay Minimum Amount Due";
    this.paymentSettings.PartialPaymentLable = this.paymentSettings.PartialPaymentLable ? this.paymentSettings.PartialPaymentLable : "Buy Now and Pay Later";
    this.paymentSettings.WidgetPartPaymentForMember = 100;
    this.paymentSettings.WidgetPartPaymentForNonMember = 100;
  }

  selectAllPaymentsGateWay(selectGateWays: any) {
    this.selectedpaymentGatewayIdForCheckout = [];
    if (selectGateWays.length == this.branchPaymentGatwayForCheckout.length && this.branchPaymentGatwayForCheckout.length > 1) {
      this.selectedpaymentGatewayIdForCheckout = this.branchPaymentGatwayForCheckout;
      setTimeout(() => {
        this.allSelectedPaymentMethod.select();
      }, 100);
    } else {
      this.branchPaymentGatwayForCheckout.forEach(gateway => {
        selectGateWays.forEach(gatwayId => {
          if (gatwayId == gateway.PaymentGatewayID) {
            this.selectedpaymentGatewayIdForCheckout.push(gateway);
          }
        });
      });
    }
  }

  getStripeTerminalConfig(isShareConnectionInfo) {

    if (this.stripeReaderComp) {
      this.stripeReaderComp.getReaderList(isShareConnectionInfo);
    }
    //this._stripeService.initializeTerminal();
    // this._stripeService.discoverReader("", this.terminalLocation);
  }

  getStripeReader() {
    this._httpService.get(GatewayIntegrationApi.GetTerminalConfig).subscribe(
      (response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          if (response.Result) {
            //console.log(response.Result);
            //share stripe location id branch wise
            this._dataSharingService.shareStripeTerminalLoactionID(response.Result.TerminalLocation);

            this.isAllowStripeTerminal = response.Result.AllowStripeTerminal;
            this.hasUserPermissionAllow =
              this.isAllowStripeTerminal == true &&
                this._authService.hasPagePermission(
                  ENU_Permission_Module.Individual,
                  ENU_Permission_Individual.AllowStripeTerminal
                )
                ? true
                : false;
            //console.log(this.hasUserPermissionAllow);
          }
        } else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Stripe Configuration")
        );
      }
    );
  }

  checkRouteParameters() {
    this.routerSubscription = this._route.queryParams.subscribe((params) => {
      if (params.state) {
        if (params.state.toString() === AuthService.getAccessToken()) {
          if (params.error) {
            setTimeout(() => {
              this.showErrorMessage(params.error);
            });
            this.getFundamentals();
          } else if (params.code) {
            //this.saveStripeIntegration(params);
            this.saveGatewayIntegration(params);
          }
        } else {
          AuthService.logout();
        }
      } else {
        this.getBranchGatwayIntegrationFundamentals();
        this.getFundamentals();
      }
    });
  }

  saveGatewayIntegration(params: any) {
    let gatewayId = parseInt(localStorage.getItem(this.GATEWAY_ID));
    if (gatewayId === this.enu_PaymentGateway.GoCardless) {
      this.saveGoCardlessIntegration(params);
    } else if (gatewayId === this.enu_PaymentGateway.Stripe_Card) {
      this.saveStripeIntegration(params);
    }
  }

  saveStripeIntegration(params: any) {
    this.saveIntegration = new SaveIntegration();

    this.saveIntegration.Code = params.code;
    this.saveIntegration.Scope = params.scope;
    this.saveIntegration.State = params.state ? params.state : null;

    this._httpService
      .save(
        GatewayIntegrationApi.stripe + "?authorizationCode=" + params.code,
        null
      )
      .subscribe(
        (response) => {
          if (response && response.MessageCode > 0) {
            this._messageService.showSuccessMessage(
              this.messages.Success.Save_Success.replace(
                "{0}",
                "Stripe Integration"
              )
            );
            this.isStripeIntegrated = true;
          } else {
            this._messageService.showErrorMessage(response.MessageText);
          }
          this.getFundamentals();
          this.getBranchGatwayIntegrationFundamentals();
          this._router.navigate(['/setup/configurations/payments']);
        },
        (error) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Save_Error.replace("{0}", "Stripe Integration")
          );
        }
      );
  }

  saveGoCardlessIntegration(params: any) {
    this.saveIntegration = new SaveIntegration();

    this.saveIntegration.Code = params.code;

    this._httpService
      .save(
        GatewayIntegrationApi.goCardLess + "?authorizationCode=" + params.code,
        null
      )
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._messageService.showSuccessMessage(
              this.messages.Success.Save_Success.replace(
                "{0}",
                "GoCardless Integration"
              )
            );
            this.isStripeIntegrated = true;
            this._router.navigate(['/setup/configurations/payments']);
          } else {
            this._messageService.showErrorMessage(response.MessageText);
          }
          this.getFundamentals();
          this.getBranchGatwayIntegrationFundamentals();
        },
        (error) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Save_Error.replace(
              "{0}",
              "GoCardless Integration"
            )
          );
        }
      );
  }

  saveWidgetPaymentGatwayIntergration() {
    if (this.paymentGatewayID > 0) {
      this._httpService
        .save(
          GatewayIntegrationApi.SaveWidgetPaymentGateway.replace(
            "{paymentGatewayID}",
            this.paymentGatewayID.toString()
          ),
          null
        )
        .subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              this._messageService.showSuccessMessage(
                this.messages.Success.Save_Success.replace(
                  "{0}",
                  "Widget payment gateway"
                )
              );
            } else {
              this._messageService.showErrorMessage(response.MessageText);
            }
          },
          (error) => {
            this._messageService.showErrorMessage(
              this.messages.Error.Save_Error.replace(
                "{0}",
                "Widget payment gateway"
              )
            );
          }
        );
    } else {
      this._messageService.showErrorMessage(
        this.messages.Validation.Widget_Payment_Gateway_Required
      );
    }
  }
  /** method for configure multiple payment gateways for widget checkout */
  saveCheckoutGateways() {
    if (this.selectedpaymentGatewayIdForCheckout.length > 0) {
      this._httpService
        .save(
          GatewayIntegrationApi.SaveWidgetCheckoutPaymentGateway,
          this.selectedpaymentGatewayIdForCheckout
        )
        .subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              this._messageService.showSuccessMessage(
                this.messages.Success.Save_Success.replace(
                  "{0}",
                  "Widget Checkout payment gateway"
                )
              );
            } else {
              this._messageService.showErrorMessage(response.MessageText);
            }
          },
          (error) => {
            this._messageService.showErrorMessage(
              this.messages.Error.Save_Error.replace(
                "{0}",
                "Widget Checkout payment gateway"
              )
            );
          }
        );
    } else {
      this._messageService.showErrorMessage(
        this.messages.Validation.Widget_Payment_Gateway_Required
      );
    }
  }

  saveStripeTerminalConfig() {
    this._httpService
      .save(
        GatewayIntegrationApi.SaveTerminalConfig.replace(
          "{allowStripeTerminal}",
          this.isAllowStripeTerminal.toString()
        ),
        null
      )
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Stripe terminal permission"));
            this._dataSharingService.shareUpdateRolePermission(true);
            this.getStripeReader();
          } else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        },
        (error) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Save_Error.replace(
              "{0}",
              "Stripe terminal permission"
            )
          );
        }
      );
  }

  saveStripeReaderIntergration(isValid: boolean) {
    if (isValid) {
      loaderService.show();
      this._httpService
        .save(
          GatewayIntegrationApi.SaveStripeReader.replace(
            "{registrationCode}",
            this.stripeTerminal.RegistrationCode.toString()
          ).replace("{label}", this.stripeTerminal.Label),
          null
        )
        .subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              this._messageService.showSuccessMessage(
                this.messages.Success.Save_Success.replace(
                  "{0}",
                  "Stripe Reader"
                )
              );
              // this.getStripeReader();
              //share stripe location id branch wise
              this._dataSharingService.shareStripeTerminalLoactionID(response.Result.TerminalLocation);
              this.getStripeTerminalConfig(false);
              this._dataSharingService.shareStripeReaderSaveStatus(true);
              this.resetStripeTerminalForm();
              loaderService.hide();
            } else {
              this._messageService.showErrorMessage(response.MessageText);
              loaderService.hide();
            }
          },
          (error) => {
            if (error.error.MessageCode) {
              this._messageService.showErrorMessage(
                error.error.MessageText
              );
              loaderService.hide();
            } else {
              this._messageService.showErrorMessage(error.error.MessageText);
              loaderService.hide();
            }
          }
        );
    }
  }

  disconnectGateway(gatewayId: number) {
    let stripeItegration = JSON.parse(JSON.stringify(this.isStripeIntegrated));
    let goCardlessItegration = JSON.parse(
      JSON.stringify(this.isGoCardlessIntegrated)
    );
    // stop blinking
    //this.isStripeIntegrated = undefined;
    //this.isGoCardlessIntegrated = undefined;

    let params = {
      paymentGatewayID: gatewayId,
    };

    this._httpService
      .delete(GatewayIntegrationApi.Disconnect, params)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this._messageService.showSuccessMessage(
            this.messages.Success.Gateway_Disconnect_Success
          );
          if (gatewayId === this.enu_PaymentGateway.Stripe_Card) {
            this._dataSharingService.shareisStripeTerminalAllowed(false);
          }
          this.getFundamentals();
        } else {
          this.isStripeIntegrated = stripeItegration;
          this.isGoCardlessIntegrated = goCardlessItegration;
          if (res.MessageCode === -117) {
            this._messageService.showErrorMessage(
              this.messages.Error.Cannot_Disconnect_Gateway
            );
          } else {
            this._messageService.showErrorMessage(res.MessageText);
          }
        }
      });
  }
  setConnectStripUrl() {
    if (!this.isStripeIntegrated && this.stripe_client_id) {
      this.state = AuthService.getAccessToken();
      this.strip_connect_url = this.strip_connect_url
        .replace(
          "{client_id}",
          JSON.parse(JSON.stringify(this.stripe_client_id))
        )
        .replace("{redirect_uri}", this.redirect_uri)
        .replace("{state}", this.state);
    }
  }

  setConnectGoCardLessUrl() {
    if (!this.isGoCardlessIntegrated && this.gocardless_client_id) {
      this.state = AuthService.getAccessToken();
      this.gocardless_connect_url = this.gocardless_connect_url
        .replace("{client_id}", this.gocardless_client_id)
        .replace("{redirect_uri}", this.redirect_uri)
        .replace("{state}", this.state);
    }
  }

  setPermissions() {
    this.hasAllowedSplitPayment = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.SplitPayment);
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
      if (packageId && packageId > 0) {
        this.isGymPackage = packageId === this.package.FitnessBasic ||
          packageId === this.package.FitnessMedium ||
          packageId === this.package.Full;
      }
    });
  }

  showErrorMessage(error: string) {
    if (error === "access_denied") {
      this._messageService.showErrorMessage(
        this.messages.Error.User_Denied_Authorisation
      );
    } else {
      this._messageService.showErrorMessage(
        this.messages.Error.Save_Error.replace("{0}", "account integration")
      );
    }
  }

  resetStripeTerminalForm() {
    this.stripeReaderForm.resetForm();
  }

  resetForm() {
    this.paymentSettings = Object.assign({}, this.CopyPaymentSettings);
    this.showError = false;
  }

  private loadScripts() {
    // You can load multiple scripts by just providing the key as argument into load method of the service
    this._dynamicScriptLoader
      .load("stripejs", "stripeterminaljs")
      .then((data) => {
        // Script Loaded Successfully
      })
      .catch((error) => console.log(error));
  }

  isNotificationSave() {
    // this.stripeService.notify.subscribe(isReaderAvailable => {
    //   if (isReaderAvailable) {
    //     this._dataSharingService.stripeReaderList.subscribe(stripeReaderList => {
    //       if (stripeReaderList) {
    //         console.log(stripeReaderList);
    //       }
    //     });
    //   }
    // });
  }

  checkPackagePermissions() {
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
      if (packageId && packageId > 0) {
        this.setPackagePermissions(packageId);
      }
    })
  }

  setPackagePermissions(packageId: number) {
    this.hasFacilityInPackage = false;
    this.hasSplitPaymentPackage = false;

    switch (packageId) {
      case this.package.FitnessBasic:
      case this.package.FitnessMedium:
        this.hasSplitPaymentPackage = true;
        break;
      case this.package.WellnessTop:
        this.hasSplitPaymentPackage = true;
        break;
      case this.package.Full:
        this.hasFacilityInPackage = true;
        this.hasSplitPaymentPackage = true;
        this.hasRewardProgramPackage = true;
        break;
    }

    this.checkRouteParameters();
  }
  // #endregion
}
