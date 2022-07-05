import { Injectable, EventEmitter } from "@angular/core";
import { HttpService } from "./app.http.service";
import { StripeApi, PointOfSaleApi, CustomerPaymentGatewayApi } from "@app/helper/config/app.webapi";
import { DataSharingService } from "./data.sharing.service";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { MessageService } from "./app.message.service";
import { variables } from "@app/helper/config/app.variable";
import { SubscriptionLike } from "rxjs";
import { Messages } from "@app/helper/config/app.messages";
import { LoaderService } from "./app.loader.service";
import { AuthenticateCard } from "@customer/member/models/member.gateways.model";
import { ApiResponse } from "@app/models/common.model";
import { DynamicScriptLoaderService } from "./dynamic.script.loader.service";
import {GatewayIntegrationApi} from "@app/helper/config/app.webapi"




declare var StripeTerminal: any;
var loaderService;


declare var Stripe: any;
var stripe: any;
var loaderService;


@Injectable()
export class StripeDataSharingService {
    private _stripeTerminal = new BehaviorSubject<any>(null);
    StripeTerminal = this._stripeTerminal.asObservable();

    ShareStripeTerminal(terminal: any) {
        this._stripeTerminal.next(terminal)
    }
}

@Injectable()
export class StripeService {

    /* Messages */
    messages = Messages;

    partialPaymentSubscription: SubscriptionLike;
    isReaderAvailable = new EventEmitter<boolean>();
    readDetail: Subject<any[]> = new Subject<any[]>();
    public readDetailList = this.readDetail.asObservable();
    teminal: any;
    customerPaymentGatewayId: number;

    constructor(private _http: HttpService,
        private _stripeDataSharingService: StripeDataSharingService,
        private _messageService: MessageService,
        private _loaderService: LoaderService,
        private _dynamicScriptLoader: DynamicScriptLoaderService) {
        loaderService = this._loaderService;
        this.loadScripts();
    }

    async initializeTerminal() {
        this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {
            //  console.log("Before",terminalResponse);
            this.teminal = await terminalResponse;
            // console.log("After",terminalResponse);
            if (this.teminal == null || this.teminal == "undefined") {
                this._stripeDataSharingService.ShareStripeTerminal(
                    StripeTerminal.create({
                        onFetchConnectionToken: async () => {
                            const token = await this._http.get(StripeApi.getConnectionToken)
                                .toPromise()
                                .then(response => {
                                    //window.localStorage.setItem('sentToServer', sent ? '1' : '0');
                                    return response.Result;
                                }, error => {
                                    //  console.log('Fetch connectionToken ' + error);
                                }).catch(function (e) {
                                    // console.log(e);
                                });

                            // console.log(token);
                            return token;
                        },
                        onUnexpectedReaderDisconnect: async () => {
                            this._messageService.showErrorMessage('Reader disconnected unexpected.');
                            // console.log('Reader disconnected unexpected');
                        }
                    }, error => {
                        alert(error);
                    })
                );
            }
        })

    }

    // connectionStatus() {
    //     return new Promise<string>((resolve, reject) => {

    //         this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {
    //             this.teminal = await terminalResponse;
    //             if (this.teminal) {
    //                 var result = await this.teminal.getConnectionToken();
    //                 resolve(result);
    //             } else {
    //                 this._messageService.showErrorMessage('Terminal is not initilized.');
    //             }
    //         })
    //     })
    // }

    registerReader(registrationCode: string, label: string) {
        let param = {
            registrationCode: registrationCode,
            label: label
        };

        this._http.save(StripeApi.saveRegisterReader, param)
            .subscribe((response: any) => {
            });
    }

    discoverReader(serialNumber: string, locationID: string) {
        var discoverResult: any;
        const config = { 
            simulated: false,
            location: locationID
         }
        return new Promise<any>((resolve, reject) => {

            this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {
                //  console.log("subscribe respnse after intiliation = ", terminalResponse);
                this.teminal = await terminalResponse;
                if (this.teminal) {
                    // console.log("Terminal Before Discover", this.teminal);
                    discoverResult = await this.teminal.discoverReaders(config);
                    if (discoverResult.error) {
                        this._messageService.showErrorMessage(discoverResult.error.message);
                        //  console.log('Failed to discover: ', discoverResult.error);
                    } else if (discoverResult.discoveredReaders.length === 0) {
                        this._messageService.showWarningMessage('No available readers.');
                        //  console.log('No available readers.');
                    } else {

                        // You should show the list of discoveredReaders to the
                        // cashier here and let them select which to connect to (see below).
                        let selectedReader;
                        if (serialNumber != null && serialNumber != "" && serialNumber != "undefined") {
                            selectedReader = discoverResult.discoveredReaders.filter(f => f.serial_number === serialNumber)
                            // this.connectReader(selectedReader[0]);
                        }

                        else {
                            selectedReader = discoverResult.discoveredReaders;
                        }
                        return resolve(selectedReader);
                        // this.readDetail.next(selectedReader);
                    }
                }

            });

        });
        //return Observable.;


    }

    connectReader(selectedReader) {
        loaderService.show();
        return new Promise<boolean>((resolve, reject) => {
            if (selectedReader != undefined) {
                // Just select the first reader here.
                this.partialPaymentSubscription = this._stripeDataSharingService.StripeTerminal.subscribe(
                    async (terminalResponse) => {
                        this.teminal = await terminalResponse;
                        if (this.teminal) {
                            var connectResult = await this.teminal.connectReader(selectedReader);
                            if (connectResult.error) {
                                loaderService.hide();
                                this._messageService.showErrorMessage(connectResult.error.message);
                            } else {
                                this._messageService.showSuccessMessage(this.messages.Success.Reader_Connected);
                                localStorage.setItem(variables.StripeTerminalSerialNumber, JSON.stringify(connectResult.reader));
                                resolve(true);
                                loaderService.hide();
                            }
                        } else {
                            this._messageService.showErrorMessage('Terminal is not initilized.');
                        }
                    }
                )
            }
        });
    }

    disConnectReader() {
        return new Promise<any>((resolve, reject) => {
            this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {
                this.teminal = await terminalResponse;
                if (this.teminal) {
                    resolve(await this.teminal.disconnectReader());
                    await this.clearCachedCredentials();
                } else {
                    this._messageService.showErrorMessage('Terminal is not initilized.');
                }
            })
        })
    }

    getConnectionStatus() {
        return new Promise<any>((resolve, reject) => {
            this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {
                this.teminal = await terminalResponse;
                if (this.teminal) {
                    resolve(await this.teminal.getConnectionStatus());
                }
                else {
                    resolve(false);
                }
            });
        });
    }

    clearCachedCredentials() {
        return new Promise<any>((resolve, reject) => {
            this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {
                this.teminal = await terminalResponse;
                if (this.teminal) {
                    resolve(await this.teminal.clearCachedCredentials());
                }
                else {
                    resolve(false);
                }
            });
        });
    }

    createPaymentIntent(totalAmount: any, customerID?: number, customerEmail?: string) {
        this._loaderService.show();
        return new Promise<any>((resolve, reject) => {
            this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {
                this.teminal = await terminalResponse;
                if (this.teminal) {
                    this._http.save(StripeApi.savePaymentIntent + "?amount=" + totalAmount + "&customerID=" + customerID + "&customerEmail=" + customerEmail, null)
                        .toPromise()
                        .then(response => {
                            if (response && response.MessageCode > 0) {
                                this._loaderService.hide();
                                // Placeholder for collecting payment
                                return resolve(response);
                            }
                            else {
                                this._loaderService.hide();
                                this._messageService.showErrorMessage(response.MessageText);
                            }
                        },
                            error => {
                                this._loaderService.hide();
                                this._messageService.showErrorMessage('Error during paymentIntent creation.');
                                // console.log('Error during paymentIntent creation.');
                            });

                } else {
                    this._loaderService.hide();
                    this._messageService.showErrorMessage('Terminal is not initilized.');
                }
            })
        })
    }

    collectPayment(clientSecret: string) {
        return new Promise<any>((resolve, reject) => {
            if (clientSecret) {
                this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {
                    this.teminal = await terminalResponse;
                    if (this.teminal) {
                        var result = await this.teminal.collectPaymentMethod(clientSecret);
                       
                        if (result.error) {
                            // Placeholder for handling result.error
                            this._loaderService.hide();
                            this._messageService.showErrorMessage(result.error.message);
                            if (result.error.code === "canceled") {
                                resolve("canceled");
                            }
                            else {
                                resolve(false);
                            }

                        } else {
                            this._loaderService.hide();
                            // Placeholder for processing payment
                            resolve(result.paymentIntent);
                        }
                    } else {
                        this._loaderService.hide();
                        this._messageService.showErrorMessage('Terminal is not initilized.');
                    }
                })

            } else {
                this._loaderService.hide();
                this._messageService.showErrorMessage('No found client secret.');
                // console.log('No found client secret.');
            }
        })
    }

    setReaderDisplay(amount: any) {
        return new Promise<any>((resolve, reject) => {
            this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {
                this.teminal = await terminalResponse;
                if (this.teminal) {
                    var result = await this.teminal.setReaderDisplay({
                        type: 'cart',
                        cart: {
                            line_items: [
                                {
                                    description: "Caramel latte",
                                    amount: amount,
                                    quantity: 1,
                                },
                                {
                                    description: "Dozen donuts",
                                    amount: amount,
                                    quantity: 1,
                                },
                            ],
                            tax: 100,
                            total: amount,
                            currency: 'usd',
                        },
                    });
                    if (result.error) {
                        resolve(false);
                    }
                    else {
                        resolve(true);
                    }

                } else {
                    this._messageService.showErrorMessage('Terminal is not initilized.');
                }
            });
        })
    }



    cancelCollectPayment() {
        this._loaderService.show();
        this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {
            this.teminal = await terminalResponse;
            if (this.teminal) {
                var result = await this.teminal.cancelCollectPaymentMethod();
                if (result.error) {
                    this._loaderService.hide();
                    this._messageService.showErrorMessage(result.error.message);
                }
                this._loaderService.hide();
            } else {
                this._loaderService.hide();
                this._messageService.showErrorMessage('Terminal is not initilized.');
            }
            this._loaderService.hide();
        }),
        error => {
            this._loaderService.hide();
        }
    }

    processPayment(paymentIntent: any) {
        this._loaderService.show();
        let processPaymentResponse = {
            paymentIntentID: '',
            isProcessPaymentSucced: true
        }
        return new Promise<any>((resolve, reject) => {

            this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {

                this.teminal = await terminalResponse;
                if (this.teminal) {
                    var result = await this.teminal.processPayment(paymentIntent)
                    if (result.error) {
                        // Placeholder for handling result.error
                        this._loaderService.hide();
                        this._messageService.showErrorMessage(result.error.message);
                        this.clearReaderDisplay();
                        processPaymentResponse.isProcessPaymentSucced = false;
                        resolve(processPaymentResponse);
                        //  console.log('Error during payment process.');
                        //  console.log(result.error);

                    } else if (result.paymentIntent) {
                        processPaymentResponse.paymentIntentID = result.paymentIntent.id
                        // Placeholder for notifying your backend to capture result.paymentIntent.id
                        //if (result.paymentIntent.status === 'succeeded') {
                        this._loaderService.hide();
                        resolve(processPaymentResponse);

                        //} else {
                        //resolve("");
                        //this._messageService.showErrorMessage('Error during Payment processed.');
                        //}
                    }
                } else {
                    this._loaderService.hide();
                    this._messageService.showErrorMessage('Terminal is not initilized.');
                }
            })
        })
    }


    clearReaderDisplay() {
        return new Promise<string>((resolve, reject) => {

            this._stripeDataSharingService.StripeTerminal.subscribe(async (terminalResponse) => {

                this.teminal = await terminalResponse;
                if (this.teminal) {
                    var result = await this.teminal.clearReaderDisplay();
                    if (result.error) {
                        // Placeholder for handling result.error
                        this._messageService.showErrorMessage(result.error.message);

                    }
                } else {
                    this._messageService.showErrorMessage('Terminal is not initilized.');
                }
            })
        })
    }

    capturePayment(paymentIntentId: string) {
        return new Promise<any>((resolve, reject) => {
            this._http.save(StripeApi.saveCapturePaymentIntent + "?paymentIntendId=" + paymentIntentId, null)
                .toPromise()
                .then((response: any) => {
                    resolve(response);
                    // console.log('Payment Captured');
                    // console.log(response);

                });
        });
    }


    //----- Stripe 3D Authentication ----//

    stripeCardAuthentication(authenticateCard: AuthenticateCard) {
        this.getStripSettings();
        let params = {
            CustomerPaymentGatewayId: null,
            Resolve: null,
            GatewayCustomerID: null,
            LastDigit: null,
            PaymentMethod: null,
            Brand: null,
            IsSaveInstrument: null
        }
        return new Promise<any>((resolve, reject) => {
            this._http.save(PointOfSaleApi.getStripeCardAuthentication, authenticateCard)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.customerPaymentGatewayId = response.Result.CustomerPaymentGatewayID;
                        params.Brand = response.Result.Brand;
                        params.GatewayCustomerID = response.Result.GatewayCustomerID;
                        params.LastDigit = response.Result.LastDigit;
                        params.PaymentMethod = response.Result.PaymentMethod;
                        params.IsSaveInstrument = response.Result.IsSaveInstrument;

                        if (response.Result.IsAuthenticationRequire) {

                            this.confirmCardSetup(response.Result.ClientSecret, response.Result.PaymentMethod).then(res => {
                                if (res) {
                                    params.CustomerPaymentGatewayId = this.customerPaymentGatewayId;
                                    params.Resolve = true;
                                    resolve(params);
                                    return;
                                }
                            },
                                error => {
                                    params.Resolve = false;
                                    resolve(params);
                                    this._messageService.showErrorMessage(error);
                                    return;
                                });
                        }
                        else if (response && response.Result.ResponseValue == -118) {
                            this._messageService.showErrorMessage(this.messages.Error.Duplicate_Card);
                            resolve(false);
                            return;
                        }
                        else if (!response.Result.IsAuthenticationRequire) {
                            params.CustomerPaymentGatewayId = this.customerPaymentGatewayId;
                            params.Resolve = true;
                            resolve(params);
                            return;
                        }

                    }
                    else {
                        resolve(response);
                        return;
                    }
                },
                    error => {
                        reject(error.error.MessageText);
                        return;
                    });
        });
    }

    deleteGateway(authenticateCard: AuthenticateCard) {
        let params = {
            CustomerID: authenticateCard.CustomerID,
            SaleTypeID: authenticateCard.SaleTypeID,
            PaymentGatewayID: authenticateCard.PaymentGatewayID,
            CustomerPaymentGatewayID: this.customerPaymentGatewayId
        }

        this._http.delete(CustomerPaymentGatewayApi.deleteGateway, params).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
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
    confirmCardPayment(clientSecret: any, paymentMethod: any) {
        return new Promise<any>((resolve, reject) => {
            this.getStripSettings().then(isResolved => {
                if (isResolved) {
                    this.confirmPayment(clientSecret, paymentMethod).then(response => {
                        if (response) {
                            resolve(true);
                        }
                    },
                        error => {
                            reject(error);
                        });
                }
            });
        });

    }

    confirmPayment(clientSecret: any, paymentMethod: any) {
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
                        resolve(true);
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


    confirmCardSetup(clientSecret: any, paymentMethod: any) {

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

    getStripSettings() {
        return new Promise<any>((resolve, reject) => {
            this._http.get(PointOfSaleApi.getStripeSettings)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (response.Result.StripePublishablekey && response.Result.StripeAccountID) {
                            this.setStripKeys(response.Result);
                            resolve(true);
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Stripe Settings"));
                    }
                );
        });
    }
    connectStripeAccount(stripeAccountModel:any) {
        return new Promise<any>((resolve, reject) => {
            this._http.save(GatewayIntegrationApi.StripeAccount,stripeAccountModel)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (response.Result) {
                            resolve(response.Result);
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Stripe Settings"));
                    }
                );
        });
    }

    setStripKeys(stripeConfig: any) {
        //stripe = Stripe('pk_test_vzkoTBnZPa9gSvbuSzZbIgXH', 'acct_1DoqMYIuCqZ95Hms');
        stripe = Stripe(stripeConfig.StripePublishablekey, stripeConfig.StripeAccountID);
    }


    public loadScripts() {
        // You can load multiple scripts by just providing the key as argument into load method of the service
        this._dynamicScriptLoader.load('stripejs', 'stripeterminaljs').then(data => {
            // Script Loaded Successfully
        }).catch(error => console.log(error));
    }



}