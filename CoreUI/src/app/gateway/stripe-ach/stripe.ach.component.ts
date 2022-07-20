// #region Imports

/*********************** Angular References *************************/
import { Component, Input } from "@angular/core";
/*********************** Models & Services  *************************/
/* Models */
import { SavedCard } from "src/app/point-of-sale/models/point.of.sale.model";
import { ApiResponse } from "src/app/models/common.model";

/* Services */
import { MessageService } from "src/app/services/app.message.service";
import { HttpService } from "src/app/services/app.http.service";
import { LoaderService } from "src/app/services/app.loader.service";

/*********************** Common  *************************/
import { Messages } from "src/app/helper/config/app.messages";
import { PointOfSaleApi, SaleApi } from "src/app/helper/config/app.webapi";
import { DynamicScriptLoaderService } from "src/app/services/dynamic.script.loader.service";
import { StripeDD } from "src/app/customer/member/models/member.gateways.model";
import { environment } from "src/environments/environment";


// #endregion

declare var Plaid: any;
@Component({
  selector: "stripe-ach",
  templateUrl: "./stripe.ach.component.html"
})


export class StripeACHComponent {

  @Input() customerID: number;


  // #region Local Members
  @Input() showAddAccount: boolean = true;
  customerPaymentGatewayId: number = 0;
  isTermsAgreed: boolean = false;

  public_token: string;
  metadata: any;

  /* Model Refernces & Collections */
  stripeDD: StripeDD;
  savedAccounts: SavedCard[];

  messages = Messages;

  // #endregion

  constructor(private _httpService: HttpService,
    private _loaderService: LoaderService,
    private _messageService: MessageService,
    private _dynamicScriptLoader: DynamicScriptLoaderService) {
    this.stripeDD = new StripeDD();

  }

  ngOnInit() {

    if(this.showAddAccount) {
      this.customerPaymentGatewayId = 0;
    }

    this.savedAccounts = [];

    this.getSavedAccounts();

  }

  ngOnDestroy() {
  }

  // #region Events

  onCardSelectionChange(val: any){
    if(val == 0 || val < 0){
      this.loadScripts();
    }
  }

  isValidStripeDDAccountAdded(): boolean{
    if(this.customerPaymentGatewayId > 0 || this.stripeDD.PublicToken != undefined){
      return true;
    }
    this.customerPaymentGatewayId = 0;
    return false;
  }

  // #endregion

  // #region Methods

  getSavedAccounts() {
    this.savedAccounts = [];
    if (this.customerID && this.customerID > 0) {
      this._httpService.get(SaleApi.getStripeACHAccounts + this.customerID)
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
              
              this.customerPaymentGatewayId = this.savedAccounts[0].CustomerPaymentGatewayID;
            } else{
              this.savedAccounts = [];
              this.savedAccounts.push({ CustomerPaymentGatewayID: -1, InstrumentName: "", InstrumentLastDigit: "", Title: "Add New Account" });
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
    } else{
      this.savedAccounts.push({ CustomerPaymentGatewayID: -1, InstrumentName: "", InstrumentLastDigit: "", Title: "Add New Account" });
    }
  }

  saveCustomerStripeDDAccountDetail() {
    this._httpService.get(PointOfSaleApi.getStripeSettings)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          if (response.Result.PlaidPublicKey && response.Result.ClientName) {
            this.getStripeACHToken(response.Result.PlaidPublicKey, response.Result.ClientName).then(resolved => {
              if (resolved) {
                this.mapAccountDetail(resolved);
                // removed add card option
                if(this.savedAccounts != undefined && this.savedAccounts != null){
                  this.savedAccounts.splice(-1,1);
                } else{
                  this.savedAccounts = [];
                }
                this.savedAccounts.push({ CustomerPaymentGatewayID: null, InstrumentName: "", InstrumentLastDigit: "", Title: this.stripeDD.Account.Name + " ****" + this.stripeDD.Account.Mask });
                this.customerPaymentGatewayId = null;
              }
            })
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Stripe Settings"));
        }
      } else{
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Stripe Settings"));
      }
    },
      error => {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Stripe Settings"));
      }
    );
  }

  getStripeACHToken(plaidPublickey: string, clientName: string) {
    
    var evnName = environment.ENVName;
    if(evnName == "live"){
      evnName = "production";
    } else{
       evnName = evnName == "qa" || evnName == "demo" || evnName == "staging" ? "sandbox" : evnName;
    }
    
    return new Promise<any>((resolve, reject) => {
      var linkHandler = Plaid.create({
        env: evnName,
        clientName: clientName,
        key: plaidPublickey,
        product: ['auth'],
        selectAccount: true,
        onLoad: function () {
          // The Link module finished loading.
        },
        onSuccess: function (public_token, metadata) {
          let data = {
            ID: '',
            Name: '',
            Mask: '',
            SubType: '',
            Type: '',
            PublickToken: ''
          }

          data.ID = metadata.account.id;
          data.Mask = metadata.account.mask;
          data.Name = metadata.institution.name;
          data.SubType = metadata.account.subtype;
          data.Type = metadata.account.type;
          data.PublickToken = public_token;

          resolve(data);

        },
        onExit: function (err, metadata) {
          if (err != null) {
          }
        },
      });

      linkHandler.open();
    });
  }

  private mapAccountDetail(data: any) {
    if (data) {
      this.stripeDD.PublicToken = data.PublickToken;
      this.stripeDD.CustomerId = this.customerID;
      this.stripeDD.Account.ID = data.ID;
      this.stripeDD.Account.Mask = data.Mask;
      this.stripeDD.Account.Name = data.Name;
      this.stripeDD.Account.SubType = data.SubType
      this.stripeDD.Account.Type = data.Type;
    }

  }

  // compInst._loaderService.show();
  // return new Promise<any>((resolve, reject) => {
  //   // if (this.nameOnCard.valid) {
  //   Plaid.create({
  //     env: 'sandbox',
  //     clientName: 'Wellyx',
  //     key: '22f56254648ae77fda8e38b064f495',
  //     product: ['auth']
  //   }).then(function (public_token) {
  //     console.log(public_token);
  //     compInst._loaderService.hide();
  //     resolve(true);
  //   });
  // });

  private loadScripts() {
    // You can load multiple scripts by just providing the key as argument into load method of the service
    this._dynamicScriptLoader.load('stripejs', 'stripeplaidjs').then(data => {
      this.saveCustomerStripeDDAccountDetail();
      // Script Loaded Successfully
    }).catch(error => console.log(error));
  }

  // #endregion
}
