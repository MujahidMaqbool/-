// #region Imports

/*********************** Angular References *************************/
import { Component, ViewChild, Input } from "@angular/core";
import { FormControl } from "@angular/forms";

/*********************** Models & Services  *************************/
/* Models */
import { SavedCard } from "src/app/point-of-sale/models/point.of.sale.model";
import { ApiResponse } from "src/app/models/common.model";

/* Services */
import { MessageService } from "src/app/services/app.message.service";
import { HttpService } from "src/app/services/app.http.service";
import { LoaderService } from "src/app/services/app.loader.service";
import { DynamicScriptLoaderService } from "src/app/services/dynamic.script.loader.service";

/*********************** Configuration  *************************/
import { Messages } from "src/app/helper/config/app.messages";
import { PointOfSaleApi } from "src/app/helper/config/app.webapi";
import { ENU_Page, ENU_PaymentGateway } from "src/app/helper/config/app.enums";

// #endregion

declare var Stripe: any;
var stripe: any;
var elements: any;
var card: any;

@Component({
  selector: "add-stripe-customer",
  templateUrl: "./add.stripe.customer.component.html"
})


export class AddStripeCustomerComponent {
  @ViewChild("addStripeCustomerForm") addStripeCustomerForm;
  @Input() customerID: number;
  @Input() showAddCard: boolean = true;
  @Input() showSaveCard: boolean = true;
  @Input() showCardNumber: boolean = true;
  @Input() pageID: number = 0;

  // #region Local Members

  isSaveCard: boolean = false;
  isStripeIntegrated: boolean;
  isTermsAgreed: boolean = false;
  isSubmitted: boolean = false;
  cardId: number;
  isSaveInstrument: boolean= false;
  nameOnCard: FormControl = new FormControl();
  actionLink: string;

  /* Model Refernces & Collections */
  savedCards: SavedCard[] = [];

  messages = Messages;
/***** Enums */
  enumPage = ENU_Page;
  PaymentGateway = ENU_PaymentGateway
  // #endregion

  constructor(private _httpService: HttpService,
    private _loaderService: LoaderService,
    private _messageService: MessageService,
    private _dynamicScriptLoader: DynamicScriptLoaderService) {

  }

  ngOnInit() {
    this.loadScripts();
    this.resetCardValues();
  }

  ngOnDestroy() {
    // card = undefined;
    // elements = undefined;
    this.resetCardValues();
  }



  // #region Events

  onCardSelectionChange(card) {
    if (this.cardId === 0) {
      this.isSaveInstrument = card.IsSaveInstrument
      this.createStripeCardElement();
    }
  }
/*** trim spaces from field name on card */
onChangeNameOnCard(){
  this.nameOnCard.setValue(this.nameOnCard.value?.trim());
 }
  // #endregion

  // #region Methods

  getStripSettings() {
    this._httpService.get(PointOfSaleApi.getStripeSettings)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          if (response.Result.StripePublishablekey && response.Result.StripeAccountID) {
            this.isStripeIntegrated = true;
            this.setStripKeys(response.Result);
            if (this.showCardNumber) {
              this.getSavedCards();
            }

          }
          else {
            this.isStripeIntegrated = false;
           }
        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
          this.isStripeIntegrated = false;
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Stripe Settings"));
        }
      );
  }

  setStripKeys(stripeConfig: any) {
    //stripe = Stripe('pk_test_vzkoTBnZPa9gSvbuSzZbIgXH', 'acct_1DoqMYIuCqZ95Hms');
    stripe = Stripe(stripeConfig.StripePublishablekey, stripeConfig.StripeAccountID);
    elements = stripe.elements();
  }

  resetCardValues() {
    card = undefined;
    elements = undefined;
  }

  getSavedCards() {
    if (this.customerID && this.customerID > 0) {
      this.savedCards = [];
      this._httpService.get(PointOfSaleApi.getSavedCards + this.customerID)
        .subscribe((response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this.savedCards = response.Result;
            this.savedCards = this.savedCards?.filter(savedCard => savedCard.PaymentGatewayID == this.PaymentGateway.Stripe_Card);
            if (this.savedCards && this.savedCards.length > 0) {
              this.savedCards.forEach(card => {
                card.Title = card.InstrumentName + " **** **** **** " + card.InstrumentLastDigit
              });
              if (this.showAddCard) {
                this.savedCards.push({ CustomerPaymentGatewayID: 0, InstrumentName: "", InstrumentLastDigit: "", Title: "Add New Card" ,PaymentGatewayID:2 });
              }
              //let defaultCard = this.savedCards.find(c => c.IsDefault == true);
              //this.cardId = defaultCard ? defaultCard.Id : this.savedCards[0].Id;
              this.cardId = this.savedCards[0].CustomerPaymentGatewayID;
            }
            else {
              this.setAddNewCard();
            }
          }
          else {
            this.setAddNewCard();
            this._messageService.showErrorMessage(response.MessageText);
          }
        },
          error => {
            this.setAddNewCard();
            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Saved Cards"));
          }
        );
    }
    else {
      this.setAddNewCard();
    }
  }

  setAddNewCard() {
    if (this.showAddCard) {
      this.cardId = 0;
      this.createStripeCardElement();
    }
  }

  createStripeCardElement() {
    // Create an instance of the card Element.
    setTimeout(() => {
      if (!card) {
        // Custom styling can be passed to options when creating an Element.
        var style = {
          base: {
            // Add your base input styles here. For example:
            fontSize: '16px',
            color: "#32325d",
          }
        };

        card = elements.create('card');
      }

      // Add an instance of the card Element into the `card-element` <div>.
      card.mount('#card-element');
    })
  }

  getStripeToken(isBuyMembership?: boolean) {
    var compInst = this;
    compInst._loaderService.show();
    return new Promise<any>((resolve, reject) => {
      if (this.nameOnCard.valid) {
        stripe.createToken(card, { name: this.nameOnCard.value }).then(function (result) {
          compInst._loaderService.hide();
          if (result.error) {
            reject(result.error.message)
            return;
          } else {
            if (compInst.isTermsAgreed) {
              if (isBuyMembership) {
                resolve(result.token);
              }
              else {
                resolve(result.token);
              }
              return;
            }
            else {
              reject(compInst.messages.Validation.Stripe_Account_Agreement_Required);
              return;
            }
          }
        }, function (error) {
          compInst._loaderService.hide();
          reject(error);
          return
        });
      }
      else {
        compInst._loaderService.hide();
        compInst.isSubmitted = true;
        reject(compInst.messages.Validation.Name_On_Card_Required);
      }
    })
  }


  confirmCardPayment(clientSecret: any, paymentMethod, publishableKey: any) {

    var compInst = this;
    compInst._loaderService.show();
    return new Promise<any>((resolve, reject) => {
      stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod,
        setup_future_usage: 'on_session'
      }).then(function (result) {
        compInst._loaderService.hide();
        if (result.error) {
          reject(result.error.message)
          return;
        } else {
          if (result.paymentIntent.status === 'succeeded') {
            resolve(result.paymentIntent);
            return;
          }
          else {
            reject(compInst.messages.Validation.Stripe_Account_Agreement_Required);
            return;
          }
        }
      }, function (error) {
        compInst._loaderService.hide();
        reject(error);
        return
      });
    });


  }

  confirCardSetup(clientSecret: any, paymentMethod: any) {

    var compInst = this;
    compInst._loaderService.show();
    return new Promise<any>((resolve, reject) => {
      stripe.confirmCardSetup(clientSecret, {
        payment_method: paymentMethod
      }).then(function (result) {
        compInst._loaderService.hide();
        if (result.error) {
          reject(result.error.message)
          return;
        } else {
          if (result.setupIntent.status === 'succeeded') {
            resolve(result.setupIntent);
            return;
          }
          else {
            reject(compInst.messages.Validation.Stripe_Account_Agreement_Required);
            return;
          }
        }
      }, function (error) {
        compInst._loaderService.hide();
        reject(error);
        return
      });
    });


  }

  private loadScripts() {
    // You can load multiple scripts by just providing the key as argument into load method of the service
    this._dynamicScriptLoader.load('stripejs').then(data => {
      this.getStripSettings();
      // stripe = Stripe('pk_test_vzkoTBnZPa9gSvbuSzZbIgXH', 'acct_1DoqMYIuCqZ95Hms');
      // setTimeout(() => {
      //   this.mapStripeConfiguration();

      // }, 100);
      // Script Loaded Successfully
    }).catch(error => console.log(error));
  }

  // #endregion
}
