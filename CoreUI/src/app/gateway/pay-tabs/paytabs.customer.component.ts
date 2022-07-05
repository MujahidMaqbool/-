
// #region Imports
/* Angular References */
import { Component, Input, OnDestroy, ViewChild, ElementRef } from "@angular/core";
import { FormControl } from "@angular/forms";
/** Rxjs */
import { Subscription } from 'rxjs';
import { interval } from 'rxjs';
/* Models & Services */

import { SavedCard, PayTabs, PayTabPaymentMode } from "@app/point-of-sale/models/point.of.sale.model";
import { ApiResponse, CustomerBillingAddress } from "@app/models/common.model";

/* Services */
import { MessageService } from "@app/services/app.message.service";
import { HttpService } from "@app/services/app.http.service";
import { DynamicScriptLoaderService } from "@app/services/dynamic.script.loader.service";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { LoaderService } from "@app/services/app.loader.service";
import { DataSharingService } from "@app/services/data.sharing.service";
/* Common  */

import { Messages } from "@app/helper/config/app.messages";
import { PointOfSaleApi, CustomerPaymentGatewayApi, GatewayIntegrationApi, CustomerApi } from "@app/helper/config/app.webapi";

import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { IframeComponent } from '../iframe/iframe.component';

import { MissingBillingAddressDialog } from '@app/customer-shared-module/missing-billing-address/missing.billing.address.dialog';
import { CustomerPaymentGateway } from '@app/customer/member/models/member.gateways.model';
import * as creditCardType from "credit-card-type";
import { ENU_Page, ENU_PaymentGateway, EnumSaleType } from "@app/helper/config/app.enums";
// #endregion
/* declare a window global veriable for accesing paytab payment lib methods */
declare const window: any;

@Component({
  selector: "pay-tabs-customer",
  templateUrl: "./paytabs.customer.component.html"
})


export class PayTabsCustomerComponent implements OnDestroy {
  nameOnCard: FormControl = new FormControl();
  @Input() showAddCard: boolean = true;
  @Input() showSaveCard: boolean = true;
  @Input() showCardNumber: boolean = true;
  @Input() customerID: number;
  @Input() areaID: number;
  @Input() pageID: number = 0;
  @ViewChild('payform') payform: ElementRef<HTMLFormElement>;
  @ViewChild('cardbtn') cardbtn: ElementRef<HTMLButtonElement>;
  /* Local Members */
  cardId: number;
  isTermsAgreed: boolean = false;
  isSaveCard: boolean = false;
  hasInvalidData: boolean = false;
  isPayTabsIntegrated: boolean;
  isButtonClicked: boolean = false;
  PayTabsClientID: any;
  isValidatedCard: boolean = false;
  hasSavedCards: boolean = false;
  customerToken: any;
  creditCardType: string = 'credit-card';
  interval: any;
  /* Model Refernces & Collections */
  payTabs: PayTabs = new PayTabs();
  payTabPaymentMode: PayTabPaymentMode = new PayTabPaymentMode();
  savedCards: SavedCard[] = [];
  response: ApiResponse;
  messages = Messages;
  buttonClickSubscriptions: Subscription;
  customerBillingAddressSubscription: Subscription;
  memberEmailSubscription: Subscription;
  counterSubscription: Subscription;
  /*** Enums */
  PaymentGateway = ENU_PaymentGateway;
  SaleType = EnumSaleType;
  enumPage = ENU_Page;

  // #endregion
  constructor(private _dynamicScriptLoader: DynamicScriptLoaderService,
    private _messageService: MessageService,
    public _dialog: MatDialogService,
    private _loaderService: LoaderService,
    private _httpService: HttpService,
    private _dataSharingService: DataSharingService) {

  }
  /******* PayTabs Related Documentation & Important Information Regarding testing */
  // Website:https://site.paytabs.com/en/
  // Test Cards:https://site.paytabs.com/en/pt2-documentation/testing/test-cards/
  // Response Codes: https://site.paytabs.com/en/pt2-documentation/testing/payment-response-codes/
  // Documentation V2:https://site.paytabs.com/en/pt2-documentation/
  // Merchant Registration:https://merchant.paytabs.com/merchant/register
  // Merchant Account Login:https://merchant.paytabs.com/merchant/login
  // PayTabs Support Solutions:https://support.paytabs.com/en/support/solutions
  // Support Email: support@PayTabs.com
  // Support WhatsApp No:+971522189208
  /******************************************************** */
  ngOnInit() {
    this.getCustomerSharedEmail();
    this.mapCustomerSharedBillingAddress();
    this.loadScripts();
  }
  ngOnDestroy() {
    this.buttonClickSubscriptions?.unsubscribe();
    this.customerBillingAddressSubscription?.unsubscribe();
    this.memberEmailSubscription?.unsubscribe();
  }
  async loadScripts() {
    /**You can load paytabs script by just providing the key as argument into load method of the service */
    await this._dynamicScriptLoader.load('paytabsjs').then(data => {

      this.getPayTabsFundamentals().then(async () => {
        if (this.isPayTabsIntegrated) {
          this.payTabs.isSaveCard = this.showSaveCard ? false : true;
          await this.getSavedCards();
        }
      })
    }).catch(error => console.log(error));
  }

  /** catch customer email in case of new customer */
  async getCustomerSharedEmail() {
    this.memberEmailSubscription = await this._dataSharingService.memberEmail.subscribe(memberEmail => {
      if (memberEmail) {
        this.payTabs.CustomerEmail = memberEmail;
      }
    })
  }
  /** Map Customer Shared billing address if customer billing address not exist  */
  async mapCustomerSharedBillingAddress() {
    this.customerBillingAddressSubscription = await this._dataSharingService.customerBillingAddress.subscribe((billingAddress: CustomerBillingAddress) => {
      if (billingAddress.CountryID && billingAddress.CountryID > 0 && billingAddress.Address1) {
        this.payTabs.StreetAddress = billingAddress.Address1;
        this.payTabs.StreetAddress2 = billingAddress.Address2;
        this.payTabs.City = billingAddress.CityName;
        this.payTabs.State = billingAddress.StateCountyName;
        this.payTabs.Country = billingAddress.CountryName;
        this.payTabs.CountryID = billingAddress.CountryID;
        this.payTabs.PostalCode = billingAddress.PostalCode;
      }
    });
  }
  /* returns paytabs integrated flag and client id for initilizing form */
  getPayTabsFundamentals() {

    return new Promise((resolve, reject) => {
      this._httpService.get(GatewayIntegrationApi.fundamentals).subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            if (response.Result) {
              this.isPayTabsIntegrated = response.Result.IsPayTabsIntegrated;
              this.PayTabsClientID = response.Result.PayTabsClientID;
              resolve();
            }
          } else {
            this.isPayTabsIntegrated = false;
            this._messageService.showErrorMessage(response.MessageText);
          }
        },
        (error) => {
          this.isPayTabsIntegrated = false;
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Fundamentals")
          );
        }
      );
    })
  }
  /* returns customer saved cards */
  async getSavedCards() {
    if (this.customerID && this.customerID > 0) {
      this.savedCards = [];
      if (this.showCardNumber) {
        await this._httpService.get(PointOfSaleApi.getSavedCards + this.customerID)
          .subscribe(async (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              this.hasSavedCards = response.Result && response.Result.length > 0 ? true : false;
              if (this.hasSavedCards) {
                this.savedCards = response.Result;
                this.savedCards = this.savedCards?.filter(savedCard => savedCard.PaymentGatewayID == this.PaymentGateway.PayTabs);
                if (this.savedCards && this.savedCards.length > 0) {
                  this.savedCards.forEach(card => {
                    card.Title = card.InstrumentName + " **** **** **** " + card.InstrumentLastDigit
                  });
                  if (this.showAddCard) {
                    this.savedCards.push({ CustomerPaymentGatewayID: 0, InstrumentName: "", InstrumentLastDigit: "", Title: "Add New Card", PaymentGatewayID: 6 });
                  }
                  this.cardId = this.savedCards[0].CustomerPaymentGatewayID;
                }
                else {
                  await  this.setAddNewCard();
                }
              }
              else {
                await  this.setAddNewCard();
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
        await this.setAddNewCard();
      }
    }
    else {
      await this.setAddNewCard();
    }
  }
  mountPayTabForm() {
    return new Promise<any>((resolve, reject) => {
      window.paylib.inlineForm({
        'key': this.PayTabsClientID,
        'form': this.payform.nativeElement,
        'autoSubmit': false,
        'callback': ((response: any) => {
          /* call back works when user submit a form ,call back returns a temporary token ,that have expiration time about 40 - 50 seconds */
          if (response.status == 200) {
            this.customerToken = response.token;
            resolve(response.token);
          }
          else {
            if (response.error) {
              if (this.isButtonClicked) {
                window.paylib.handleError(document.getElementById('paymentErrors'), response);
                reject(response.errorText);
                this._messageService.showErrorMessage(response.errorText);
              }
            }
          }
        })
      })
    });
  }
  /** rerender paytabs iframe if user click on add new card */
  setAddNewCard() {
    if (this.showAddCard) {
      this.cardId = 0;
      setTimeout(() => {
        this.mountPayTabForm();
      }, 500);
    }
  }
  /** select one of existing saved card or add new card */
  onCardSelectionChange() {
    if (this.cardId == 0) {
      setTimeout(() => {
        this._dynamicScriptLoader.load('paytabsjs').then(data => {
          this.mountPayTabForm();
        }).catch(error => console.log(error));
      }, 500);
    }
  }

  payByPayTabsCard() {
    return new Promise((resolve, reject) => {
      var compInst = this;
      compInst.isButtonClicked = false;
      if (compInst.cardId == 0) {

        if (compInst.nameOnCard.valid) {
          if (compInst.isTermsAgreed) {
            /** for submiting paytab form require to click button that have type submit, but we hide button from paytab iframe form and click this button through parent component pay button click */
            compInst.buttonClickSubscriptions = compInst._dataSharingService.payTabsButtonSubmission.subscribe(isPressed => {
              if (isPressed) {
                compInst.checkBillingAddress().then(() => {
                  if (isPressed) {
                    compInst.isButtonClicked = isPressed;
                    compInst.cardbtn.nativeElement.click();
                    compInst._loaderService.show();
                  }
                }).catch(error => {
                  reject(error);
                })
              }
            })
            compInst.mountPayTabForm().then((customerToken: any) => {
              compInst.payTabs.PaymentGatewayID = compInst.PaymentGateway.PayTabs ;
              compInst.payTabs.CustomerID = compInst.customerID;
              compInst.payTabs.SaleTypeID = compInst.SaleType.Card;
              compInst.payTabs.Amount = 0.1;
              compInst.payTabs.SaleID = "0000";
              //compInst.payTabs.Currency = "USD";
              compInst.payTabs.InstrumentID = customerToken;
              compInst.payTabs.SaleDescription = null;
              compInst.payTabs.CustomerName = compInst.nameOnCard.value;
              compInst._httpService.save(CustomerPaymentGatewayApi.AuthorizationPayTabs, compInst.payTabs)
                .subscribe(
                  (response: ApiResponse) => {
                    compInst.response = response;
                  },
                  error => {
                    compInst.resetForm();
                    reject(error.error.MessageText.ErrorCode == 0 ? error.error.MessageText.Message : this.messages.Validation.Required_Customer_Address_forPayTab);
                  },
                  () => {
                    if (compInst.response && compInst.response.Result) {
                      if (compInst.response.Result) {
                        if (compInst.response.Result.CardAuthenticationURL !== null) {
                          compInst.open3DSAuthorizationIframe(compInst.response.Result.CardAuthenticationURL).then((notificationResponse: any) => {
                            //status "A" means authenticator information
                            this._loaderService.hide();
                            if (notificationResponse && notificationResponse.payTabsPaymentResponseStatus == "A") {
                              compInst.isValidatedCard = true;
                              compInst.payTabPaymentMode.CustomerPaymentGatewayID = parseInt(notificationResponse.customerPaymentGatewayId);
                              compInst.payTabPaymentMode.PaymentGatewayID = compInst.PaymentGateway.PayTabs;
                              compInst.payTabPaymentMode.SaleTypeID = compInst.SaleType.Card;
                              compInst.payTabPaymentMode.IsSaveCard = compInst.isSaveCard;
                              compInst.payTabPaymentMode.CardScheme = notificationResponse.cardScheme;
                              compInst.payTabPaymentMode.CardLast4Digit = notificationResponse.cardLast4Digits;
                              compInst.payTabPaymentMode.Token = notificationResponse.payTabsTempToken;
                              compInst.payTabPaymentMode.Status = notificationResponse.payTabsPaymentResponseStatus;
                              resolve(compInst.payTabPaymentMode);
                            }
                            else {
                              this._loaderService.hide();
                              compInst.resetForm();
                              reject(notificationResponse.payTabsPaymentResponseMessage ? notificationResponse.payTabsPaymentResponseMessage : 'Something went wrong please try again');
                            }
                          }).catch(error => {
                            this._loaderService.hide();
                            compInst.resetForm();
                            this.customerToken = undefined;
                            reject(error);
                          })
                        }
                        else if (compInst.response.Result.Status === 'A') {
                          //status "A" means authenticator information
                          compInst.isValidatedCard = true;
                          compInst.payTabPaymentMode.CustomerPaymentGatewayID = compInst.response.Result.CustomerPaymentGatewayID;
                          compInst.payTabPaymentMode.PaymentGatewayID = compInst.PaymentGateway.PayTabs;
                          compInst.payTabPaymentMode.SaleTypeID = compInst.SaleType.Card;
                          compInst.payTabPaymentMode.IsSaveCard = compInst.isSaveCard;
                          compInst.payTabPaymentMode.CardScheme = compInst.response.Result.CardScheme;
                          compInst.payTabPaymentMode.CardLast4Digit = compInst.response.Result.CardLast4Digit;
                          compInst.payTabPaymentMode.CardAuthenticationURL = null;
                          compInst.payTabPaymentMode.Token = compInst.response.Result.Token;
                          compInst.payTabPaymentMode.Status = compInst.response.Result.Status;
                          compInst.payTabPaymentMode.Message = compInst.response.Result.Message;
                          resolve(compInst.payTabPaymentMode);
                        }
                        else {
                          compInst.resetForm();
                          this.customerToken = undefined;
                          reject(compInst.response.Result.Message);
                        }
                      }
                    }
                  }
                );
            }).catch((error) => {
              compInst._loaderService.hide();
              this.customerToken = undefined;
              compInst.resetForm();
              reject(error);
            });
          }
          else {
            compInst._loaderService.hide();
            reject(compInst.messages.Validation.PayTabs_Account_Agreement_Required);
          }
        }
        else {
          if (this.nameOnCard.errors.minlength && this.nameOnCard.errors.minlength.actualLength !== 3) {
            compInst._loaderService.hide();
            reject(compInst.messages.Validation.Name_On_Card_Length);
            return;
          }
          compInst._loaderService.hide();
          this.validateFields();
          reject(compInst.messages.Validation.Name_On_Card_Required);
        }
      }
      else {
        compInst.payTabPaymentMode.CustomerPaymentGatewayID = this.cardId;
        compInst.payTabPaymentMode.PaymentGatewayID = compInst.PaymentGateway.PayTabs;
        compInst.payTabPaymentMode.SaleTypeID = compInst.SaleType.Card;
        compInst.payTabPaymentMode.IsSaveCard = this.isSaveCard;
        compInst.payTabPaymentMode.CardScheme = null;
        compInst.payTabPaymentMode.CardLast4Digit = null;
        compInst.payTabPaymentMode.Token = null;
        compInst.payTabPaymentMode.Status = null;
        resolve(compInst.payTabPaymentMode);
      }
    })
  }
  /***** Validate fields*/
  validateFields() {
    if (this.nameOnCard.invalid) {
      this.hasInvalidData = true
    }
    else {
      this.hasInvalidData = false;
    }
  }
  /** reset card values in case off error or invalid card details */
  resetForm() {
    this.isButtonClicked = false;
    this.cardbtn.nativeElement.disabled = false;
    this.isValidatedCard = false;
    this.buttonClickSubscriptions?.unsubscribe();
    window.paylib.form.restore();
    this._loaderService?.hide();
  }
  /** paytabs fields next event */
  onFocus(event, nextField: HTMLInputElement) {
    if (this.isValidatedCard) {
      this.isValidatedCard = false;
    }
    if (this.isButtonClicked) {
      this.isButtonClicked = false;
      this.buttonClickSubscriptions?.unsubscribe();
    }
    this.cardbtn.nativeElement.disabled = false;
    if (event.srcElement.id == 'card-number') {
      if (event.currentTarget.value.length > 0) {
        this.creditCardType = creditCardType(event.currentTarget.value).find(card => card.type)?.type;
        if (this.creditCardType !== undefined && this.creditCardType !== creditCardType.types.VISA && this.creditCardType !== creditCardType.types.MASTERCARD && this.creditCardType !== creditCardType.types.AMERICAN_EXPRESS && this.creditCardType !== creditCardType.types.DINERS_CLUB && this.creditCardType !== creditCardType.types.DISCOVER && this.creditCardType !== creditCardType.types.JCB) {
          this.creditCardType = 'credit-card';
        }
      }
      else {
        this.creditCardType = 'credit-card';
      }
    }
    if (event.currentTarget.value.length == 19 && event.srcElement.id == 'card-number') {
      nextField.focus();
    }
    else if (event.currentTarget.value.length == 2 && event.srcElement.id == 'card-month') {
      nextField.focus();
    }
    else if (event.currentTarget.value.length == 4 && event.srcElement.id == 'card-year') {
      nextField.focus();
    }
  }

  /** if 3ds card authorization required than paytabs return a authentication url that we load in a iframe */
  open3DSAuthorizationIframe(CardAuthenticationURL: any) {
    return new Promise((resolve, reject) => {
      const dialogRef = this._dialog.open(IframeComponent, {
        disableClose: true,
        data: {
          url: CardAuthenticationURL
        }
      });
      dialogRef.componentInstance.isClosed.subscribe(isClosed => {
        if (isClosed) {
          this._loaderService.show();
          this.GetPayTabsDetails().then((response: any) => {
            this._loaderService.hide();
            resolve(response);
          }).catch(error => {
            this._loaderService.hide();
            reject(error);
          })
          dialogRef.close();
        }
      });
      dialogRef.componentInstance.isCancel.subscribe(isCancel => {
        if (isCancel) {
          this._loaderService.hide();
          dialogRef.close();
          reject(this.messages.Error.PayTabs_Payment_Declined);
        }
      })
    })
  }
  /*** trim spaces from field name on card */
  onChangeNameOnCard() {
    this.nameOnCard.setValue(this.nameOnCard.value?.trim());
  }
  /**Delete Saved Cards from list */
  onDeleteSavedCard(card: any) {
    this.openDialogForDeleteSavedCard(card);
  }
  /** dialog for delete conformation  */
  openDialogForDeleteSavedCard(card: any) {
    const dialogRef = this._dialog.open(DeleteConfirmationComponent, {
      disableClose: true,
      data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_Undone }
    });
    dialogRef.componentInstance.confirmDelete.subscribe((isConfirm: boolean) => {
      if (isConfirm) {
        this.deleteGateway(card)
      }
    })
  }
  /** delete customer existing payment gateway */
  deleteGateway(gateway: CustomerPaymentGateway) {
    let params = {
      CustomerID: this.customerID,
      SaleTypeID: 2,
      PaymentGatewayID: 6,
      CustomerPaymentGatewayID: gateway.CustomerPaymentGatewayID
    }
    this._httpService.delete(CustomerPaymentGatewayApi.deleteGateway, params).subscribe(
      (res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Gateway Account"));
          this.loadScripts();
        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
      error => {
        this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Gateway Account"));
      }
    )
  }
  /**get authorizedpayment detail api call here after 5 sec elapsed (this function implemented after disscusion with Tahir sb) */
  GetPayTabsDetails() {
    return new Promise((resolve, reject) => {
      this.counterSubscription = interval(5000).subscribe(counter => {
        if (counter === 4) {
          this._loaderService.hide();
          reject('Unable to process your request.please try again');
          this.counterSubscription?.unsubscribe();
          return;
        }
        const customerPaytabsTempToken = {
          tempToken: this.customerToken
        }
        this._httpService.save(CustomerPaymentGatewayApi.GetPaymentAuthorizationForPayTabs, customerPaytabsTempToken).subscribe(
          (response: ApiResponse) => {
            this.response = response;
            // this.customerToken = undefined;
          },
          error => {
            reject(this.response.MessageText ? this.response.MessageText : this.messages.Generic_Messages.limited_connectivity);
            return;
          },
          () => {
            if (this.response && this.response.Result) {
              this._loaderService.show();
              if (this.response.Result && this.response.Result?.Status) {
                const cloneFcmObj = {
                  customerPaymentGatewayId: this.response.Result?.CustomerPaymentGatewayID,
                  payTabsPaymentResponseStatus: this.response.Result?.Status,
                  payTabsTempToken: this.response.Result?.Token,
                  cardScheme: this.response.Result?.CardScheme,
                  cardLast4Digits: this.response.Result?.CardLast4Digit,
                  payTabsPaymentResponseMessage: this.response.Result?.Message
                }
                resolve(cloneFcmObj);
                this.counterSubscription?.unsubscribe();
                return;
              }
            }
          });
      });
    });
  }
  /**check billing address only in case if user select a paytabs,  */
  checkBillingAddress() {
    return new Promise((resolve, reject) => {
      if (this.customerID && this.customerID > 0) {
        this._httpService.get(CustomerApi.checkBillingAndGateway + this.customerID).subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              if (response.Result.HasBillingAddress && response.Result.HasPayTabs) {
                resolve(response.Result.HasBillingAddress);
              }
              else {
                this.showBillingAddressDialog().then(() => {
                  resolve();
                }).catch(error => {
                  reject(error);
                })
              }
            }
            else {
              reject(response.MessageText ? response.MessageText : this.messages.Generic_Messages.limited_connectivity);
            }
          }
        )
      } else {
        if (this.payTabs.CountryID && this.payTabs.CountryID > 0 && this.payTabs.StreetAddress) {
          resolve();
        }
        else {
           resolve();
          // this.showBillingAddressDialog().then(() => {
          //   resolve();
          // }).catch(error => {
          //   reject(error);
          // })
        }
      }
    })
  }
  /** billing address popup returns selected address in case of new customer */
  showBillingAddressDialog() {
    return new Promise((resolve, reject) => {
      const dialog = this._dialog.open(MissingBillingAddressDialog, {
        disableClose: true,
        data: { customerID: this.customerID, isPayTabsIntegrated: this.isPayTabsIntegrated }
      });
      dialog.componentInstance.onCancel.subscribe(isCancel => {
        if (isCancel) {
          if (this.payTabs.CountryID > 0 && this.payTabs.StreetAddress) {
            resolve();
          }
          else {
            reject(this.messages.Validation.Billing_Address_Required);
          }
          this.buttonClickSubscriptions?.unsubscribe();
        }
      });
    })
  }
  // #endregion
}
