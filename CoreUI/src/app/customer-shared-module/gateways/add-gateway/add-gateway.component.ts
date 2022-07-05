/*********************** Angular References *************************/
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';

/*********************** Material References *************************/
import { MatDialogRef, } from '@angular/material/dialog';


/*********************** Models & Services *************************/
/* Models */
import { SaveCustomerGateway, BranchPaymentGateway, Card, DirectDebit, StripeDD, StripeDDAccount, StripeCardAuthentication, AuthenticateCard } from '@app/customer/member/models/member.gateways.model';
import { ApiResponse, CustomerAddress, CustomerBillingAddress } from '@app/models/common.model';
/* Services */
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { Messages } from '@app/helper/config/app.messages';

/*********************** Components *************************/

/*********************** Common *************************/
import { ENU_PaymentGateway, EnumSaleType, ENU_SEPACountryCode, ENU_Page } from '@app/helper/config/app.enums';
import { CustomerPaymentGatewayApi, CustomerApi } from '@app/helper/config/app.webapi';
import { DataSharingService } from '@app/services/data.sharing.service';
import { SubscriptionLike } from 'rxjs';
import { StripeService } from '@app/services/stripe.service';
import { AddGoCardlessCustomerComponent } from '@app/gateway/gocardless/add.gocardless.customer.component';
import { AddStripeCustomerComponent } from '@app/gateway/stripe/add.stripe.customer.component';
import { StripeACHComponent } from '@app/gateway/stripe-ach/stripe.ach.component';
import { PayTabsCustomerComponent } from '@app/gateway/pay-tabs/paytabs.customer.component';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MissingBillingAddressDialog } from '@app/customer-shared-module/missing-billing-address/missing.billing.address.dialog';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';

@Component({
    selector: 'add-gateway',
    templateUrl: './add-gateway.component.html'
})
export class AddGatewayComponent implements OnInit {
    @ViewChild("addGoCardlessCustomerRef") addGoCardlessCustomerRef: AddGoCardlessCustomerComponent;
    @ViewChild('addStripeCustomerRef') addStripeCustomerRef: AddStripeCustomerComponent;
    @ViewChild('addStripeACHRef') addStripeACHRef: StripeACHComponent;
    @ViewChild("paytabsRef") paytabsRef: PayTabsCustomerComponent;
    @Output() gatewaySaved = new EventEmitter<boolean>();
    // #region Local Members
    customerId: number;
    hasBranchGateways: boolean;
    saveInProgress: boolean;
    showCard: boolean;
    showDirectDebit: boolean;
    showStripeDD: boolean;
    showStripe: boolean;
    showGoCardless: boolean;
    showStripeACH: boolean;
    showPayTabs: boolean;
    /* Model Reference & Collections */
    saveGatewayModel: SaveCustomerGateway = new SaveCustomerGateway();
    selectedGateway: BranchPaymentGateway = new BranchPaymentGateway();
    authenticateCard: AuthenticateCard = new AuthenticateCard();
    enu_SEPACountryCode = ENU_SEPACountryCode;
    branchGatewayList: BranchPaymentGateway[];
    customerIdSubscription: SubscriptionLike;
    ccountrySubscription: SubscriptionLike;
    /* Configuration */
    messages = Messages;
    paymentGateway = ENU_PaymentGateway;
    saleType = EnumSaleType;
    enuPage = ENU_Page;
    countryID: number;

    // #endregion


    constructor(private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        public _stripeService: StripeService,
        private _dialog: MatDialogService,
        private dialogRef: MatDialogRef<AddGatewayComponent>) {
    }

    ngOnInit() {
        this.customerIdSubscription = this._dataSharingService.customerID.subscribe(
            (customerId: number) => {
                if (customerId && customerId > 0) {
                    this.customerId = customerId;
                }
            }
        )
        this.getGatewayFundamentals();
        this.ccountrySubscription = this._dataSharingService.countryID.subscribe(countryID => {
            this.countryID = countryID;
        });
    }

    ngOnDestroy() {
        this.customerIdSubscription.unsubscribe();
        this.ccountrySubscription.unsubscribe();
    }

    // #region Event(s)

    onSaleTypeChange(saleTypeId: number, paymentGetWayId: number) {

        this.selectedGateway = this.branchGatewayList.filter(g => g.SaleTypeID === saleTypeId && g.PaymentGatewayID === paymentGetWayId)[0];

        if(!this.selectedGateway && saleTypeId == this.paymentGateway.Stripe_Card){
            this.selectedGateway = this.branchGatewayList.filter(g => g.SaleTypeID === saleTypeId && g.PaymentGatewayID === this.paymentGateway.PayTabs)[0];
        }

        this.setGatewayVisibility(this.selectedGateway.PaymentGatewayID);
    }

    onCardTabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
        if (tabChangeEvent.index == 0) {
            const saleTypeId = 2;
            const paymentGetWayId = 2;
            this.showStripe = true;
            this.showPayTabs = false;
            this.onSaleTypeChange(saleTypeId, paymentGetWayId);
            // this.setGatewayVisibility(paymentGetWayId)
        }
        else {
            const saleTypeId = 2;
            const paymentGetWayId = 6;
            this.showStripe = false;
            this.showPayTabs = true;
            this.onSaleTypeChange(saleTypeId, paymentGetWayId);
        }
    }
    onSave() {
        this.saveInProgress = true;
        this.saveCustomerGateway();
    }

    onCloseDialog() {
        this.closeDialog();
    }

    // #endregion

    // #region Method(s)

    getGatewayFundamentals() {
        this.showCard = false;
        this.showDirectDebit = false;
        this.showStripeDD = false;
        this.branchGatewayList = [];
        this._httpService.get(CustomerPaymentGatewayApi.getGatewayFundamentals).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.hasBranchGateways = response.Result && response.Result.BranchPaymentGatewayList.length > 0 ? true : false;
                    if (this.hasBranchGateways) {
                        this.branchGatewayList = response.Result.BranchPaymentGatewayList;
                        this.branchGatewayList.forEach(gateway => {
                            this.setSaleTypeVisibility(gateway.SaleTypeID, gateway.PaymentGatewayID);
                        })
                        this.selectedGateway = this.branchGatewayList[0];
                        this.setGatewayVisibility(this.selectedGateway.PaymentGatewayID);
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Payment Gateways"));
            }
        )
    }

    getStripeDDAccountDetail(): StripeDD {
        let getStripeDDModel = new StripeDD();
        getStripeDDModel = this.addStripeACHRef && this.addStripeACHRef.stripeDD != undefined ? this.addStripeACHRef.stripeDD : getStripeDDModel;
        return getStripeDDModel;
    }

    setSaleTypeVisibility(saleTypeId: number, paymentGateWayId: number) {
        if (saleTypeId == this.saleType.Card && (paymentGateWayId == this.paymentGateway.Stripe_Card || paymentGateWayId == this.paymentGateway.PayTabs)) {
            this.showCard = true;
        }
        if (saleTypeId == this.saleType.DirectDebit && paymentGateWayId == this.paymentGateway.GoCardless) {
            this.showDirectDebit = true;


        } else if (saleTypeId == this.saleType.DirectDebit && paymentGateWayId == this.paymentGateway.Stripe_DD) {
            this.showStripeDD = true;

        }

        // switch (saleTypeId, paymentGateWayId) {
        //      case this.saleType.Card && this.paymentGateway.Stripe_Card:
        //          this.showCard = true;
        //          break;
        //      case this.saleType.DirectDebit:
        //          this.showDirectDebit = true;
        //          break;
        //      case this.saleType.StripeTerminal:
        //          this.showStripeACH = true;
        //          break;
        // }
    }

    /** patabs gateway bit added if user switch a payment gateway (Ameer Hamza) */
    setGatewayVisibility(gatewayId: number) {
        this.showStripe = false;
        this.showGoCardless = false;
        this.showStripeACH = false;
        this.showPayTabs = false;
        switch (gatewayId) {
            case this.paymentGateway.Stripe_Card:
                this.showStripe = true;
                break;
            case this.paymentGateway.PayTabs:
                this.showPayTabs = true;
                break;
            case this.paymentGateway.GoCardless:
                this.showGoCardless = true;
                break;
            case this.paymentGateway.Stripe_DD:
                this.showStripeACH = true;
                break;
        }
    }
    /** in case of card selection there is another condition added with existing condition (selectedGateway.PaymentGatewayID === Gateway name) Ameer hamza  */
    saveCustomerGateway() {
        this.setSaveGatewayModel();
        if (this.selectedGateway.SaleTypeID === this.saleType.Card && this.selectedGateway.PaymentGatewayID === this.paymentGateway.Stripe_Card) {
            this.saveGatewayModel.Card = new Card();
            this.saveStripeCustomer();
        }
        if (this.selectedGateway?.SaleTypeID === this.saleType.Card && this.selectedGateway?.PaymentGatewayID === this.paymentGateway.PayTabs) {
            this.paytabsRef.payTabs.isSaveCard = true;
            this._dataSharingService.onButtonSubmit(true);
            this.paytabsRef?.payByPayTabsCard().then((res: any) => {
                if (res.CustomerPaymentGatewayID !== null) {
                    this.showMessageAfterPaymentCapturedSuccessfully();
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Customer Gateway"));
                }
            }).catch(error => {
                this.saveInProgress = false;
                this._messageService.showErrorMessage(error);
            })
        }
        else if (this.selectedGateway.SaleTypeID === this.saleType.DirectDebit && this.selectedGateway.PaymentGatewayID === this.paymentGateway.GoCardless) {
            this.saveGatewayModel.DirectDebit = new DirectDebit();
            if (this.countryID == 2) {
                this.checkBillingAddress().then((resolve, rejects) => {
                    this.saveGoCardlessCustomer();
                })
            } else {
                this.saveGoCardlessCustomer();
            }
        }
        else if (this.selectedGateway.SaleTypeID === this.saleType.DirectDebit && this.selectedGateway.PaymentGatewayID === this.paymentGateway.Stripe_DD) {
            this.saveGatewayModel.AccountDetail = new StripeDDAccount();
            this.saveStripeACHCustomer();
        }
    }

    setSaveGatewayModel() {
        this.saveGatewayModel.CustomerID = this.customerId;
        this.saveGatewayModel.PaymentGatewayID = this.selectedGateway.PaymentGatewayID;
        if (this.saveGatewayModel.PaymentGatewayID == this.paymentGateway.Stripe_DD) {
            this.saveGatewayModel.SaleTypeID = this.saleType.DirectDebit;
        } else {
            this.saveGatewayModel.SaleTypeID = this.selectedGateway.SaleTypeID;
        }


    }

    saveStripeCustomer() {
        this.addStripeCustomerRef.getStripeToken().then(
            token => {
                this.authenticateCard.CustomerID = this.saveGatewayModel.CustomerID;
                this.authenticateCard.PaymentGatewayID = this.saveGatewayModel.PaymentGatewayID;
                this.authenticateCard.SaleTypeID = this.saveGatewayModel.SaleTypeID;
                this.authenticateCard.CardToken = token.id;
                this.authenticateCard.IsSaveCard = true;
                // this.saveGatewayModel.Card.PaymentGatewayToken = token.id;
                this._stripeService.stripeCardAuthentication(this.authenticateCard).then(isResolved => {
                    this.saveInProgress = false;
                    if (isResolved && isResolved.Resolve) {
                        this.showMessageAfterPaymentCapturedSuccessfully();
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Customer Gateway"));
                    }
                    else if (isResolved && isResolved.MessageCode === -103 ||
                        isResolved && isResolved.MessageCode === -118 ||
                        isResolved && isResolved.MessageCode === -125) {

                        this._messageService.showErrorMessage(isResolved.MessageText);
                    }
                    else {
                        this._stripeService.deleteGateway(this.authenticateCard);
                    }

                },
                    error => {
                        this.saveInProgress = false;
                        this._messageService.showErrorMessage(error);
                        this._stripeService.deleteGateway(this.authenticateCard);
                    });
            },
            error => {
                if (error) {
                    this._messageService.showErrorMessage(error);
                }
                this.saveInProgress = false;
            }
        )
    }

    saveGoCardlessCustomer() {
        // this.addGoCardlessCustomerRef.getCustomerToken().then(
        //     token => {
        //         this.saveGatewayModel.PaymentGatewayToken = token;
        //         this.saveGateway();
        //     },
        //     error => {
        //         if (error) {
        //             this._messageService.showErrorMessage(error);
        //         }
        //         this.saveInProgress = false;
        //     }
        // );
        if (this.addGoCardlessCustomerRef.addGoCardlessForm.valid) {
            if (this.addGoCardlessCustomerRef.isTermsAgreed) {
                this.saveGatewayModel.DirectDebit.AccountHolderName = this.addGoCardlessCustomerRef.saveGoCardlessModel.AccountHolderName;
                this.saveGatewayModel.DirectDebit.AccountNumber = this.addGoCardlessCustomerRef.saveGoCardlessModel.AccountNumber;
                this.saveGatewayModel.DirectDebit.BranchCode = this.addGoCardlessCustomerRef.saveGoCardlessModel.BranchCode;
                this.saveGatewayModel.DirectDebit.CountryCode = this.addGoCardlessCustomerRef.saveGoCardlessModel.CountryCode;
                this.saveGatewayModel.DirectDebit.BankCode = this.addGoCardlessCustomerRef.saveGoCardlessModel.BankCode;

                switch (this.addGoCardlessCustomerRef.saveGoCardlessModel.CountryCode) {
                    case this.enu_SEPACountryCode.FR:
                        this.saveGatewayModel.DirectDebit.AccountNumber = this.addGoCardlessCustomerRef.saveGoCardlessModel.AccountNumber + " " + this.addGoCardlessCustomerRef.saveGoCardlessModel.Check;
                        break;

                    case this.enu_SEPACountryCode.PT:
                        this.saveGatewayModel.DirectDebit.AccountNumber = this.addGoCardlessCustomerRef.saveGoCardlessModel.AccountNumber + this.addGoCardlessCustomerRef.saveGoCardlessModel.Check;
                        break;

                    case this.enu_SEPACountryCode.ES:
                        this.saveGatewayModel.DirectDebit.AccountNumber = this.addGoCardlessCustomerRef.saveGoCardlessModel.Check + " " +
                            this.addGoCardlessCustomerRef.saveGoCardlessModel.AccountNumber;
                        break;
                    case this.enu_SEPACountryCode.SK:
                        this.saveGatewayModel.DirectDebit.AccountNumber = this.addGoCardlessCustomerRef.saveGoCardlessModel.PrefixAccountNumber +
                            this.addGoCardlessCustomerRef.saveGoCardlessModel.AccountNumber;
                        break;
                }

                this.saveGateway();
            }
            else {
                this._messageService.showErrorMessage(this.messages.Validation.GoCardless_Account_Agreement_Required);
                this.saveInProgress = false;
            }
        }
        else {
            this.addGoCardlessCustomerRef.isSubmitted = true;
            this.saveInProgress = false;
            this._messageService.showErrorMessage(this.messages.Validation.Invalid_BankDetail);
        }
    }

    saveStripeACHCustomer() {
        if (this.addStripeACHRef.isValidStripeDDAccountAdded()) {
            if (this.addStripeACHRef.isTermsAgreed) {

                let stripeDD = this.getStripeDDAccountDetail();
                this.saveGatewayModel.PublicToken = stripeDD.PublicToken;
                this.saveGatewayModel.AccountDetail = stripeDD.Account.ID != undefined ? stripeDD.Account : null;
                this.saveGateway();
            } else {
                this._messageService.showErrorMessage(this.messages.Validation.StripeACH_Account_Agreement_Required);
                this.saveInProgress = false;
            }
        } else {
            this._messageService.showErrorMessage(this.messages.Validation.Select_Account);
            this.saveInProgress = false;
        }
    }

    saveGateway() {
        this._httpService.save(CustomerPaymentGatewayApi.saveCustomerGateways, this.saveGatewayModel)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.showMessageAfterPaymentCapturedSuccessfully();
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Customer Gateway"));
                }
                /* Removed front end message as per instruction of Zahid */
                // else if (response && response.MessageCode == -118) {
                //     this.gatewaySaved.emit(false);
                //     this._messageService.showErrorMessage(this.messages.Error.Duplicate_Card);
                //     this.saveInProgress = false;
                // }
                else {
                    this.saveInProgress = false;
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this.gatewaySaved.emit(false);
                    this.saveInProgress = false;
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Customer Gateway"));
                }
            )
    }

    // stripeCardAuthentication() {
    //     return new Promise<boolean>((resolve, reject) => {
    //         this._httpService.save(CustomerPaymentGatewayApi.getStripeCardAuthentication, this.authenticateCard)
    //             .subscribe((response: ApiResponse) => {
    //                 if (response && response.MessageCode > 0) {
    //                     if (response.Result.IsAuthenticationRequire) {

    //                         this.authenticateCard.CustomerPaymentGatewayID = response.Result.CustomerPaymentGatewayID;
    //                         this.addStripeCustomerRef.confirCardSetup(response.Result.ClientSecret, response.Result.PaymentMethod).then(res => {
    //                             // this.stripeRef.getSavedCards();
    //                             resolve(true);
    //                             return;
    //                         },
    //                             error => {
    //                                 this.saveInProgress = false;
    //                                 this._messageService.showErrorMessage(error);
    //                                 this.deleteGateway();

    //                                 reject(false);
    //                                 return;
    //                             });
    //                     }
    //                     else {
    //                         resolve(true);
    //                         return;
    //                     }

    //                 }
    //                 else {
    //                     this.saveInProgress = false;
    //                     this._messageService.showErrorMessage(response.MessageText);
    //                 }
    //             },
    //                 error => {
    //                     this.saveInProgress = false;
    //                     this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Customer Gateway"));
    //                 });
    //     });
    // }


    deleteGateway() {
        let params = {
            CustomerID: this.authenticateCard.CustomerID,
            SaleTypeID: this.authenticateCard.SaleTypeID,
            PaymentGatewayID: this.authenticateCard.PaymentGatewayID,
            CustomerPaymentGatewayID: this.authenticateCard.CustomerPaymentGatewayID
        }

        this._httpService.delete(CustomerPaymentGatewayApi.deleteGateway, params).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.showMessageAfterPaymentCapturedSuccessfully();
                    // this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Gateway Account"));
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

    closeDialog() {
        this.dialogRef.close();
    }

    showMessageAfterPaymentCapturedSuccessfully() {
        this.saveInProgress = false;
        this.gatewaySaved.emit(true);
        this.closeDialog();

    }
    //check billing address
    checkBillingAddress() {
        return new Promise((resolve, reject) => {
            this._httpService.get(CustomerApi.checkBillingAndGateway + this.customerId).subscribe(
                (response: ApiResponse) => {
                    if (!response.Result.HasBillingAddress && !response.Result.HasHomeAddress && !response.Result.HasShippingAddress) {
                        this.showBillingAddressDialog().then(() => {
                            resolve(true);
                        });
                    } else {
                        resolve(true);
                    }
                })
        })
    }

    // if not exist billing address popup willl open for save
    showBillingAddressDialog() {
        return new Promise((resolve, reject) => {
            const dialog = this._dialog.open(MissingBillingAddressDialog, {
                disableClose: true,
                data: { customerID: this.customerId, isGoCardLess: true }
            });
            dialog.componentInstance.onCancel.subscribe(isCancel => {
                if (isCancel) {
                    this._messageService.showErrorMessage(this.messages.Validation.Billing_Address_Required);
                } else {
                    resolve(true);
                }
            });
        })
    }
    // #endregion

}
