/********************** Angular Reference ***********************/
import { Component, OnInit, Inject, ViewChild, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { NgForm } from '@angular/forms';
/*********************** Material Reference *************************/
import { MatStepper } from '@angular/material/stepper';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubscriptionLike as ISubscription } from 'rxjs';
/********************** Services & Models ***********************/
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { DateTimeService } from '@app/services/date.time.service';
import { TaxCalculation } from '@app/services/tax.calculations.service';
/* Models */
import { ApiResponse, PersonInfo } from '@app/models/common.model';
import { GetMemberMembershipPlan, SaveMemberMembership, ViewPaymentSummary, ViewPayment, AccountDetails } from '@customer/member/models/member.membership.model';
import { Card, DirectDebit, StripeDD, SaveCustomerGateway, AuthenticateCard } from '@customer/member/models/member.gateways.model';

/********************** Components *********************/
import { SaveMemberPaymentComponent } from '../save-member-payment/save.member.payment.component';
/********************** Common *********************/
import { Messages } from '@app/helper/config/app.messages';
import { MemberMembershipApi, CustomerPaymentGatewayApi, CustomerFormApi, CustomerApi } from '@app/helper/config/app.webapi';
import { EnumSaleType, ENU_PaymentGateway, MembershipPaymentType, ENU_SEPACountryCode, CustomFormStatus, ENU_SEPACountryScheme } from '@app/helper/config/app.enums';
import { Configurations } from '@app/helper/config/app.config';
import { MandateConfirmationDialog } from '../mandate-confirmation/mandate.confirmation.component';
import { StripeService } from '@app/services/stripe.service';
import { StripePaymentIntent, PayTabPaymentMode } from '@app/point-of-sale/models/point.of.sale.model';
import { DataSharingService } from '@app/services/data.sharing.service';
import { CustomFormView } from '@app/models/customer.form.model';
import { SaveMemberMembershipComponent } from '../save-member-membership/save.member.membership.component';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { MembershipFormComponent } from '@app/customer-shared-module/customer-forms/membership-form/membership.form.component';
import { POSMembershipPaymentComponent } from '@customershared/payments/pos.membership.payment';
import { StripeACHComponent } from '@app/gateway/stripe-ach/stripe.ach.component';
import { MissingBillingAddressDialog } from '@app/customer-shared-module/missing-billing-address/missing.billing.address.dialog';
import { LoaderService } from '@app/services/app.loader.service';
import { RewardPointTemplateComponent } from '@app/shared/components/reward-point-template/reward-point-template.component';

@Component({
    selector: 'save-member-membership-popup',
    templateUrl: './save.member.membership.popup.html'
})

export class SaveMemberMembershipPopup implements OnInit {

    // #region Local Members 

    @ViewChild('stepper') stepper: MatStepper;
    @ViewChild('saveMemberMembershipRef') saveMemberMembershipRef: SaveMemberMembershipComponent;
    @ViewChild('saveMemberPaymentRef') saveMemberPaymentRef: SaveMemberPaymentComponent;
    @ViewChild('membershipBuyForm') membershipBuyForm: NgForm;
    @ViewChild('posPaymentRef') posPaymentRef: POSMembershipPaymentComponent;
    @ViewChild('stripeACHRef') stripeACHRef: StripeACHComponent;
    @ViewChild('rewardProgram') rewardProgram: RewardPointTemplateComponent;
    @ViewChildren('formComponents') formComponents: QueryList<MembershipFormComponent>;

    @Output()
    membershipSaved = new EventEmitter<boolean>();

    saveInProgress: boolean;
    continueInProgress: boolean = false;
    showSkipAndContinue: boolean = false;
    showNextAndContinue: boolean = false;
    showSkipRewardProgramAndContinue: boolean = false;
    showJoinRewardProgramAndContinue: boolean = false;
    isRewardProgramExistsForJoin: boolean = false;
    saleTypeId: number;
    bankName: string;
    bankEmail: string;
    showPrevious: boolean;
    showContinue: boolean = true;
    showSave: boolean;
    showPay: boolean;
    showMembershipPayment: boolean = false;
    activeTabIndex: number = 0;
    shouldGetPersonInfo: boolean = false;
    paymentIntentID: string;
    stripeCardInfo: any;
    payTabsCardInfo: any;
    customerEmail: string;
    /* Messages, Constants */
    messages = Messages;
    datetimeFormatForSave = Configurations.DateFormatForSave;

    /* Collection And Models */
    getMembershipPlanModel: GetMemberMembershipPlan;
    saveMemberMembershipModel: SaveMemberMembership;
    viewPaymentSummary: ViewPaymentSummary;
    // personTypeInfo: PersonInfo;
    stripeDD: StripeDD;
    saveGatewayModel: SaveCustomerGateway = new SaveCustomerGateway();
    authenticateCard: AuthenticateCard = new AuthenticateCard();
    BranchDefaultRewardProgramVM: any;

    membershipPaymentType = MembershipPaymentType;
    stripePaymentIntent: StripePaymentIntent;

    customFormView: CustomFormView[] = [];
    oldCustomFormView: CustomFormView[] = [];
    copyCustomFormViewAfterSave: any;

    personInfoSubscription: ISubscription;
    personTypeInfo: PersonInfo = new PersonInfo();
    /************* Configurations ***************/
    saleType = EnumSaleType;
    paymentGateway = ENU_PaymentGateway;
    enuFormTypes = CustomFormStatus;
    enu_SEPACountryCode = ENU_SEPACountryCode;
    countrySchema: string;
    paymentGateWayID: number;


    // #endregion

    constructor(private _dialog: MatDialogService,
        private _dialogRef: MatDialogRef<SaveMemberMembershipPopup>,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _memberMembershipService: HttpService,
        private _taxCaluclationService: TaxCalculation,
        private _stripeService: StripeService,
        private _loaderService: LoaderService,
        private _dataSharingService: DataSharingService,
        @Inject(MAT_DIALOG_DATA) public model: any) {
    }

    ngOnInit() {

        if (this.model.CustomerTypeID) {
            this.personTypeInfo = new PersonInfo();
            this.personTypeInfo.PersonID = this.model.CustomerID;
            this.personTypeInfo.PersonTypeID = this.model.CustomerTypeID;
            this.shouldGetPersonInfo = true;
            this._dataSharingService.sharePersonInfo(this.personTypeInfo);
        }

        if (this.model.CustomerID) {
            this._dataSharingService.shareCustomerID(this.model.CustomerID);
        }
        this.isRewardProgramExistsForJoin = this.model.BranchDefaultRewardProgramVM ? true : false;
        this.personInfoSubscription = this._dataSharingService.activityPersonInfo.subscribe((personInfo: any) => {
            this.customerEmail = personInfo.Email;
        })
        this._dataSharingService.branchDefaultRewardProgram.subscribe((branchDefaultRewardProgram) => {
            if (branchDefaultRewardProgram) {
                this.isRewardProgramExistsForJoin = true;
                this.model.BranchDefaultRewardProgramVM = branchDefaultRewardProgram;
            }
        })
        this.saveMemberMembershipModel = new SaveMemberMembership();
    }

    // #region Events

    onContinue() {
        if (this.activeTabIndex === 0) {
            this.saleTypeId = this.saveMemberMembershipRef.saleTypeId;
            this.isSelectMembershipValid().then((isValid: boolean) => {
                if (isValid) {
                    this.continueInProgress = true;
                    this.saveMemberMembershipModel.OldMembershipID = this.saveMemberMembershipRef.membershipId;
                    this.getMembershipPlanModel = this.saveMemberMembershipRef.getMemberMembershipModel();
                    this.GetMembershipSpecificForms(this.getMembershipPlanModel.MembershipID);

                    setTimeout(() => {
                        this.continueInProgress = false;
                    }, 1000);
                    this.stepper.next();
                    this.activeTabIndex = this.stepper.selectedIndex;
                    this.setPerviousContinueButtonVisibility(this.activeTabIndex);
                }
            })
        }
        else if (this.activeTabIndex === 1) {
            if (!this.customFormView || this.customFormView.length < 1)
                this.setViewPaymentSummary();

            this.stepper.next();
        } else if (this.customFormView && this.customFormView.length > 0) {
            var _formData = this.onGetFormComponent();
            _formData.onSubmit();
        } else {
            this.stepper.next();
        }

        this.activeTabIndex = this.stepper.selectedIndex;
        this.setPerviousContinueButtonVisibility(this.activeTabIndex);
    }

    onPrevious() {
        this.stepper.previous();
        this.continueInProgress = false;
        this.activeTabIndex = this.stepper.selectedIndex;
        this.setPerviousContinueButtonVisibility(this.activeTabIndex);
        let _formDataa = this.onGetFormComponent();
        if (!_formDataa) {
            this.showSkipRewardProgramAndContinue = false;
        }
        this.setRewardProgramSkipButtonVisibility();
        // //store Old form data for skip functionality
        if (this.showSkipAndContinue) {
            var _formData = this.onGetFormComponent();
            if (_formData) {
                _formData.setFormCopy(_formData.customeFormViewModel);
            }
        }
        
    }

    onSkipForm() {
        var _formData = this.onGetFormComponent();
        _formData.onSkip();

        this.activeTabIndex = this.stepper.selectedIndex;
        this.setPerviousContinueButtonVisibility(this.activeTabIndex);

    }

    onSkipRewardProgram() {
        this.showContinue = false;
        this.showSave = true;
        this.showPay = false;
        this.showSkipAndContinue = false;
        this.showNextAndContinue = false;
        this.setViewPaymentSummary();
        this.showSkipRewardProgramAndContinue = false;
        this.showJoinRewardProgramAndContinue = false;
        this.showPrevious = true;
        this.activeTabIndex = this.stepper.selectedIndex;
        this.saveMemberMembershipModel.isSkippedRewardProgram = true;
        this.saveMemberMembershipModel.customerViewedRewardProgramID = this.model.BranchDefaultRewardProgramVM.RewardProgramID;
        
        this.stepper.next();

    }

    onJoinRewardProgram() {

        this.setViewPaymentSummary();

        this.showSkipRewardProgramAndContinue = false;
        this.showJoinRewardProgramAndContinue = false;

        this.showPrevious = true;
        this.saveMemberMembershipModel.isSkippedRewardProgram = false;
        this.saveMemberMembershipModel.customerViewedRewardProgramID = this.model.BranchDefaultRewardProgramVM.RewardProgramID;
        this.activeTabIndex = this.stepper.selectedIndex;
        // this.setPerviousContinueButtonVisibility(this.activeTabIndex);
        this.showContinue = false;
        this.showSave = true;
        this.showPay = false;
        this.showSkipAndContinue = false;
        this.showNextAndContinue = false;
        this.stepper.next();
    }
    setRewardProgramSkipButtonVisibility(){
        if(this.isRewardProgramExistsForJoin){
            let stepHeaders = this.stepper._stepHeader.toArray();
            for(let i =0; i< stepHeaders.length; i++){
                const element: HTMLElement = stepHeaders[this.activeTabIndex]._elementRef.nativeElement.childNodes[2] as HTMLElement;
                if(element.innerText === 'Reward Program'){
                    this.showSkipRewardProgramAndContinue = true;
                }else{
                    this.showSkipRewardProgramAndContinue = false;
                }
            }
        }
        
    }
    //get active component data
    onGetFormComponent() {
        var activeInd = this.activeTabIndex - 2;
        var _formsResults = this.formComponents.toArray();
        var _formData = _formsResults[activeInd];

        return _formData;
    }

    onSave() {
        this.saveInProgress = true;
        this.setModelForSave();
    }

    onSaleTypeChange(saleTypeId: number) {
        this.saleTypeId = saleTypeId;
    }

    onCloseDialog() {
        this.membershipSaved.emit(false);
        this.closeDialog();
    }

    ngOnDestroy() {
        this.personInfoSubscription.unsubscribe();
    }

    onSubmitFormsHandler(customForm) {
        if (customForm.SkipSubmitIndicator === 'submit') {

            if ((this.activeTabIndex - 2 < this.customFormView.length - 1)) {
                this.stepper.next();
            } else {
                this.setViewPaymentSummary();
                this.stepper.next();
            }

            this.customFormView.forEach((form) => {
                if (form.FormID === customForm.CustomFormView.FormID) {
                    form = customForm.CustomFormView;
                }
            });
        } else {
            this.stepper.previous();
        }
    }
    // #endregion

    // #region Methods

    GetMembershipSpecificForms(membershipID: number) {
        let param = {
            membershipID: membershipID,
            customerID: this.model.CustomerID,
        }

        if (this.customFormView && this.customFormView.length > 0) {
            this.oldCustomFormView = JSON.parse(JSON.stringify(this.customFormView));
        }

        this._memberMembershipService.get(CustomerFormApi.getMembershipSpecificForms, param).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response && response.Result) {
                        this.customFormView = response.Result;
                        var _oldCustomFormView = JSON.parse(JSON.stringify(this.oldCustomFormView)) ? JSON.parse(JSON.stringify(this.oldCustomFormView)) : [];
                        this.customFormView.forEach((value) => {
                            if (_oldCustomFormView && _oldCustomFormView.length > 0 && _oldCustomFormView.find(f => f.FormID == value.FormID)
                                && _oldCustomFormView.find(f => f.FormID == value.FormID).FormStatusID == this.enuFormTypes.Submitted) {
                                value.JsonText = _oldCustomFormView.find(f => f.FormID == value.FormID).JsonText;
                            } else {
                                value.JsonText = JSON.parse(value.JsonText);
                            }
                        });
                    } else {
                        this.customFormView = [];
                    }
                }
                else {
                    this.customFormView = [];
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this.customFormView = [];
                this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
            });
    }

    setPerviousContinueButtonVisibility(index: number) {

        if (index === 0) {
            this.showPrevious = false;
            this.showContinue = true;
            this.showSave = false;
            this.showPay = false;
            this.showSkipAndContinue = false;
            this.showNextAndContinue = false;
        }
        else if (index === 1) {
            this.showPrevious = true;
            this.showContinue = true;
            this.showSave = false;
            this.showPay = false;
            this.showSkipAndContinue = false;
            this.showNextAndContinue = false;
            this.getMembershipPlanModel = this.saveMemberMembershipRef.getMemberMembershipModel();
        } else if (this.customFormView) {
            if ((this.activeTabIndex - 2) <= (this.customFormView.length - 1)) {
                this.showPrevious = true;
                this.showContinue = true;
                this.showSave = false;
                this.showPay = false;
                this.showSkipAndContinue = true;
                this.showJoinRewardProgramAndContinue = false;
                this.showSkipRewardProgramAndContinue = false;
                //show next and continue button for submitted forms
                this.showNextAndContinue = this.customFormView[this.activeTabIndex - 2].FormStatusID == this.enuFormTypes.Submitted ? true : false;
            } else {
                if (this.isRewardProgramExistsForJoin) {
                    this.showPrevious = true;
                    this.showContinue = false;
                    this.showSave = false;
                    this.showPay = false;
                    this.showSkipAndContinue = false;
                    this.showNextAndContinue = false;
                    this.showJoinRewardProgramAndContinue = true;
                    this.showSkipRewardProgramAndContinue = true;
                } else {
                    this.showPrevious = true;
                    this.showContinue = false;
                    this.showSave = true;
                    this.showPay = false;
                    this.showSkipAndContinue = false;
                    this.showNextAndContinue = false;
                }
            }
        }
        else if (index === 2) {
            if (this.isRewardProgramExistsForJoin) {
                this.showPrevious = true;
                this.showContinue = false;
                this.showSave = false;
                this.showPay = false;
                this.showSkipAndContinue = false;
                this.showNextAndContinue = false;
                this.showJoinRewardProgramAndContinue = true;
                this.showSkipRewardProgramAndContinue = true;
            } else {
                this.showPrevious = true;
                this.showContinue = false;
                this.showSave = true;
                this.showPay = false;
                this.showSkipAndContinue = false;
                this.showNextAndContinue = false;
                this.setViewPaymentSummary();
            }
        }

    }

    isSelectMembershipValid(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            //commented by fahad reason for free membership
            // if (!this.saveMemberMembershipRef.paymentPlanList.some(p => !p.Price || p.Price < 1)) {
            if (!this.saveMemberMembershipRef.paymentPlanList.some(p => p.Price == null || p.Price == undefined || p.Price < 0)) {
                // Check All Collection Dates are greater than MinDate
                if (!this.saveMemberMembershipRef.paymentPlanList.some(p => p.CollectionDate < this.saveMemberMembershipRef.minCollectionDate)) {
                    // Check Payment Type and Account Details
                    this.isAccountDetailsValid().then(
                        (isValid: boolean) => {
                            if (isValid) {
                                // Check Terms And Conditions Agreed
                                if (this.saveMemberMembershipRef.isTermAgreed) {
                                    resolve(true);
                                    return;
                                }
                                else {
                                    this._messageService.showErrorMessage(this.messages.Validation.Terms_Agreement_Required);
                                    resolve(false);
                                    return;
                                }
                            }
                            else {
                                resolve(false);
                                return;
                            }
                        }
                    );
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Validation.CollectionDate_Invalid);
                    resolve(false);
                    return;
                }
            }
            else {
                this._messageService.showErrorMessage(this.messages.Validation.Purchase_Membership_Price_Invalid);
                resolve(false);
                return;
            }
        });
    }

    isAccountDetailsValid(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (this.saleTypeId === this.saleType.Cash) {
                resolve(true);
                return;
            }
            else if (this.saleTypeId === this.saleType.Card && this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID == this.paymentGateway.Stripe_Card) {
                this.isCardDetailsValid().then(value => {
                    resolve(value);
                    return;
                });
            }
            else if (this.saleTypeId === this.saleType.Card && this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID == this.paymentGateway.PayTabs) {

                this.isPayTabsCardDetailsValid().then(valid => {
                    resolve(valid);
                    return;
                })
            }
            else if (this.saleTypeId === this.saleType.DirectDebit) {
                if (this.saveMemberMembershipRef.countryID == 2 && this.saveMemberMembershipRef._CountrySchema == ENU_SEPACountryScheme.ach) {
                    this.checkBillingAddress().then(() => {
                        resolve(this.isDirectDebitValid());
                        return;
                    });
                } else {
                    resolve(this.isDirectDebitValid());
                    return;
                }
            }
            else if (this.saleTypeId === this.saleType.StripeTerminal) {
                resolve(this.isStripeTerminalsValid());
                return;
            }
        })
    }
    isPayTabsCardDetailsValid() {
        return new Promise<boolean>((resolve, reject) => {
            if (this.saveMemberMembershipRef.paytabsRef?.cardId == 0) {
                if (this.saveMemberMembershipRef.paytabsRef?.isValidatedCard) {
                    resolve(true);
                    return;
                }
                else {
                    this._dataSharingService.onButtonSubmit(true);
                    this.saveMemberMembershipRef.paytabsRef.payByPayTabsCard().then((response: PayTabPaymentMode) => {
                        if (response.Status === 'A') {
                            this.payTabsCardInfo = response;
                            this.saveMemberMembershipModel.CustomerPaymentGatewayID = response.CustomerPaymentGatewayID;
                            this.saveMemberMembershipRef.paytabsRef.getSavedCards();
                            resolve(true);
                            return;
                        }
                    }).catch(error => {
                        this._messageService.showErrorMessage(error);
                        resolve(false);
                        return;
                    });
                }
            }
            else {
                this.saveMemberMembershipModel.CustomerPaymentGatewayID = this.saveMemberMembershipRef.paytabsRef.cardId;
                if (this.saveMemberMembershipModel.CustomerPaymentGatewayID && this.saveMemberMembershipModel.CustomerPaymentGatewayID > 0) {
                    this.saveMemberMembershipModel.Card = null;
                    resolve(true);
                    return;
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Validation.Select_Card);
                    resolve(false);
                    return;
                }
            }


        })

    }

    setModelForSave() {

        this.saveMemberMembershipModel.CustomerID = this.model.CustomerID;
        this.saveMemberMembershipModel.MembershipID = this.getMembershipPlanModel.MembershipID;
        this.saveMemberMembershipModel.StartDate = this.getMembershipPlanModel.StartDate;
        this.saveMemberMembershipModel.MembershipPaymentPlanDetailList = this.getMembershipPlanModel.MembershipPaymentPlanDetailList;
        this.saveMemberMembershipModel.PaymentGatewayID = this.saveMemberMembershipRef.selectedGatewayId;
        this.saveMemberMembershipModel.SaleTypeID = this.saveMemberMembershipRef.saleTypeId;
        this.saveMemberMembershipModel.Notes = this.posPaymentRef.paymentSummary.Notes;
        //map stripe dd

        this.stripeDD = this.getStripeDDAccountDetail();
        this.saveMemberMembershipModel.PublicToken = this.stripeDD.PublicToken;
        this.saveMemberMembershipModel.AccountDetail = this.stripeDD.Account.ID != undefined ? this.stripeDD.Account : null;

        if (!this.saveMemberMembershipRef.isNewMembership) {
            this.saveMemberMembershipModel.ReplaceCustomerMembershipID = this.saveMemberMembershipRef.oldMembershipId;
            // ReplaceCustomerMembershipID
        }
        if (this.saveMemberMembershipModel.PaymentGatewayID == this.paymentGateway.Stripe_DD) {
            this.saveMemberMembershipModel.SaleTypeID = this.saleType.DirectDebit;
            this.saveMemberMembershipModel.CustomerPaymentGatewayID = this.saveMemberMembershipRef.stripeACHRef.customerPaymentGatewayId == null ? 0 : this.saveMemberMembershipRef.stripeACHRef.customerPaymentGatewayId;
        }

        if (this.customFormView && this.customFormView.length > 0) {
            this.copyCustomFormViewAfterSave = JSON.parse(JSON.stringify(this.customFormView))
            this.saveMemberMembershipModel.MembershipForms = this.customFormView;
            this.saveMemberMembershipModel.MembershipForms.forEach(element => {
                element.JsonText = JSON.stringify(element.JsonText);
            });
        }
        this.saveMembership();

    }

    isCardDetailsValid() {
        this.setSaveGatewayModel();
        return new Promise<boolean>((resolve, reject) => {
            if (this.saveMemberMembershipRef.stripeRef.cardId === 0 || this.authenticateCard.CustomerPaymentGatewayID == 0) {
                this.saveMemberMembershipRef.stripeRef.getStripeToken(true).then(
                    result => {
                        this.stripeCardInfo = result;
                        // this.saveMemberMembershipModel.Card = new Card();
                        // this.saveGatewayModel.Card = new Card();
                        //this.saveMemberMembershipModel.Card.PaymentGatewayToken = this.stripeCardInfo.id;
                        //this.saveMemberMembershipModel.CustomerPaymentGatewayID = 0;
                        // this.saveGatewayModel.Card.PaymentGatewayToken = this.stripeCardInfo.id;
                        this.authenticateCard.CardToken = this.stripeCardInfo.id;

                        this.stripeCardAuthentication().then(value => {
                            resolve(value);
                            return;
                        });

                        // resolve(true);
                        // return;
                    },
                    error => {
                        this._messageService.showErrorMessage(error);
                        resolve(false);
                        return;
                    }
                )
            }
            else {
                this.saveMemberMembershipModel.CustomerPaymentGatewayID = this.saveMemberMembershipRef.stripeRef.cardId;
                // this.authenticateCard.CustomerPaymentGatewayID = this.saveMemberMembershipRef.stripeRef.cardId;
                if (this.saveMemberMembershipModel.CustomerPaymentGatewayID && this.saveMemberMembershipModel.CustomerPaymentGatewayID > 0) {
                    // this.stripeCardAuthentication().then(value => {
                    //     resolve(value);
                    //     return;
                    // });
                    this.saveMemberMembershipModel.Card = null;
                    resolve(true);
                    return;
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Validation.Select_Card);
                    resolve(false);
                    return;
                }
            }
        })
    }

    isDirectDebitValid() {
        let isValid = false;

        if (this.saveMemberMembershipRef.goCardlessRef.accountId === 0) {
            // this.posPaymentRef.goCardlessRef.getCustomerToken().then(
            //     token => {
            //         this.saveMemberMembershipModel.PaymentGatewayToken = token;
            //         this.saveMembership();
            //     },
            //     error => {
            //         this._messageService.showErrorMessage(error);
            //         this.saveInProgress = false;
            //     }
            // )
            if (this.saveMemberMembershipRef.goCardlessRef.addGoCardlessForm.valid) {
                if (this.saveMemberMembershipRef.goCardlessRef.isTermsAgreed) {
                    this.saveMemberMembershipModel.DirectDebit = new DirectDebit();
                    this.saveMemberMembershipModel.DirectDebit.AccountHolderName = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountHolderName;
                    this.saveMemberMembershipModel.DirectDebit.AccountNumber = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountNumber;
                    this.verifyGoCardlessAccountDetail();

                    switch (this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.CountryCode) {
                        case this.enu_SEPACountryCode.FR:
                            this.saveMemberMembershipModel.DirectDebit.AccountNumber = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountNumber + " " + this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.Check;
                            break;

                        case this.enu_SEPACountryCode.PT:
                            this.saveMemberMembershipModel.DirectDebit.AccountNumber = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountNumber + this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.Check;
                            break;

                        case this.enu_SEPACountryCode.ES:
                            this.saveMemberMembershipModel.DirectDebit.AccountNumber = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.Check + " " +
                                this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountNumber;
                            break;
                        case this.enu_SEPACountryCode.SK:
                            this.saveMemberMembershipModel.DirectDebit.AccountNumber = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.PrefixAccountNumber +
                                this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountNumber;
                            break;
                    }
                    isValid = true;

                }
                else {
                    this._messageService.showErrorMessage(this.messages.Validation.GoCardless_Account_Agreement_Required);
                }
            }
            else {
                this.saveMemberMembershipRef.goCardlessRef.isSubmitted = true;
                this._messageService.showErrorMessage(this.messages.Validation.Invalid_BankDetail);
            }
        }
        else {
            this.saveMemberMembershipModel.CustomerPaymentGatewayID = this.saveMemberMembershipRef.goCardlessRef.accountId;
            if (this.saveMemberMembershipModel.CustomerPaymentGatewayID && this.saveMemberMembershipModel.CustomerPaymentGatewayID > 0) {
                this.saveMemberMembershipModel.DirectDebit = null;
                isValid = true;
            }
            else {
                this._messageService.showErrorMessage(this.messages.Validation.Select_Account);
            }
        }

        return isValid;
    }

    isStripeTerminalsValid() {
        let isValid = false;

        if (this.saveMemberMembershipRef.stripeACHRef.isValidStripeDDAccountAdded()) {
            if (this.saveMemberMembershipRef.stripeACHRef.isTermsAgreed) {
                return new Promise<boolean>((resolve, reject) => {
                    this.saveMemberMembershipModel.PaymentGatewayID = this.paymentGateway.Stripe_DD;
                    this.saveMemberMembershipModel.SaleTypeID = this.saleType.DirectDebit;
                    resolve(true);
                    return;
                });
            } else {
                this._messageService.showErrorMessage(this.messages.Validation.StripeACH_Account_Agreement_Required);
                isValid = false;
            }
        } else {
            this._messageService.showErrorMessage(this.messages.Validation.Select_Account);
            isValid = false;
        }

        return isValid;
    }

    stripeCardAuthentication() {
        return new Promise<boolean>((resolve, reject) => {
            this._memberMembershipService.save(CustomerPaymentGatewayApi.getStripeCardAuthentication, this.authenticateCard)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.saveMemberMembershipModel.CustomerPaymentGatewayID = response.Result.CustomerPaymentGatewayID;
                        if (response.Result.IsAuthenticationRequire) {

                            this.authenticateCard.CustomerPaymentGatewayID = response.Result.CustomerPaymentGatewayID;
                            this.saveMemberMembershipRef.stripeRef.confirCardSetup(response.Result.ClientSecret, response.Result.PaymentMethod).then(res => {
                                if (res) {
                                    resolve(true);
                                    this.saveMemberMembershipRef.stripeRef.getSavedCards();
                                    return;
                                }
                            }, error => {

                                this.deleteGateway();
                                this.saveInProgress = false;
                                this._messageService.showErrorMessage(error);
                                resolve(false);
                                return;
                            });

                        }
                        else if (response && response.Result.ResponseValue == -118) {
                            this._messageService.showErrorMessage(this.messages.Error.Duplicate_Card);
                            this.saveInProgress = false;
                            reject(false);
                            return;
                        }
                        else if (!response.Result.IsAuthenticationRequire) {
                            this.saveMemberMembershipRef.stripeRef.getSavedCards();
                            resolve(true);
                            return;
                        }

                    }
                    else {
                        this.saveInProgress = false;
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    error => {
                        this.saveInProgress = false;
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Customer Gateway"));
                    });
        });
    }

    // saveGateway() {

    //     return new Promise<boolean>((resolve, reject) => {
    //         this._memberMembershipService.save(CustomerPaymentGatewayApi.saveCustomerGateways, this.saveGatewayModel)
    //         .subscribe((response: ApiResponse) => {
    //             if (response && response.MessageCode > 0) {
    //                 if (response.Result.IsAuthenticationRequire) {
    //                     this.saveMemberMembershipRef.stripeRef.confirCardSetup(response.Result.ClientSecret, response.Result.PaymentMethod).then(
    //                         res => {
    //                             resolve(true);
    //                             return;
    //                         },
    //                         error => {
    //                             this._messageService.showErrorMessage(error);
    //                             this.saveInProgress = false;
    //                             resolve(true);
    //                             return;
    //                         }
    //                     );
    //                 }

    //             }
    //             /* Removed front end message as per instruction of Zahid */
    //             // else if (response && response.MessageCode == -118) {
    //             //     this.gatewaySaved.emit(false);
    //             //     this._messageService.showErrorMessage(this.messages.Error.Duplicate_Card);
    //             //     this.saveInProgress = false;   
    //             // }
    //             else {
    //                 this.saveInProgress = false;
    //                 this._messageService.showErrorMessage(response.MessageText);
    //             }
    //         },
    //             error => {
    //                 this.saveInProgress = false;
    //                 this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Customer Gateway"));
    //             }
    //         )
    //     })
    // }

    // getStripeTerminalConfig() {
    //     this._stripeService.initializeTerminal();
    //     let selectedReaderSerialNumber = JSON.parse(localStorage.getItem(variables.StripeTerminalSerialNumber));
    //     if (selectedReaderSerialNumber != null && selectedReaderSerialNumber != "undefined") {
    //         this._stripeService.discoverReader(selectedReaderSerialNumber);
    //     }
    //     else {
    //         this._stripeService.discoverReader("");
    //     }
    // }
    getTotal(): number {
        let total = 0;
        let totalAmount = 0;
        this.viewPaymentSummary.PaymentList.forEach(payment => {
            this.viewPaymentSummary.TaxAmount += this.viewPaymentSummary.TotalTaxPercentage ? this._taxCaluclationService.getTaxAmount(this.viewPaymentSummary.TotalTaxPercentage, payment.Price + payment.ProRataPrice) : 0;
            payment.TotalPrice = payment.Price + payment.ProRataPrice;
            total += payment.TotalPrice;
        })
        totalAmount = this.roundValue(total + this.viewPaymentSummary.TaxAmount);
        return totalAmount
    }



    /** changed by ameer hamza && set payment summery in case of paytabs selection */
    setViewPaymentSummary() {
        let allPayments = this.saveMemberPaymentRef.membershipPaymentSummary.MembershipPaymentSummaryList;
        let firstDatePayments = allPayments.filter(p => p.CollectionDate === allPayments[0].CollectionDate);
        let nextPayment = allPayments.find(p => p.MembershipPaymentTypeID === this.membershipPaymentType.Recurring &&
            p.CollectionDate > firstDatePayments[0].CollectionDate);

        this.viewPaymentSummary = new ViewPaymentSummary();
        this.viewPaymentSummary.CustomerID = this.model.CustomerID;
        this.viewPaymentSummary.MembershipID = this.getMembershipPlanModel.MembershipID;
        this.viewPaymentSummary.PaymentDate = firstDatePayments[0].CollectionDate;
        this.viewPaymentSummary.SaleTypeID = this.saleTypeId;
        this.viewPaymentSummary.TotalTaxPercentage = this.saveMemberPaymentRef.membershipPaymentSummary.TotalTaxPercentage;
        this.viewPaymentSummary.PaymentList = [];

        if (nextPayment && nextPayment.DurationTypeID) {
            if (nextPayment.ProRataPrice && nextPayment.ProRataPrice > 0) {
                /*
                    Next Payment Amount = Price + Tax on Price
                */
                this.viewPaymentSummary.NextPaymentAmount = nextPayment.Price + this.getTaxAmount(nextPayment.Price, this.saveMemberPaymentRef.membershipPaymentSummary.TotalTaxPercentage);
                /*
                    NextPaymentProRata = ProRataPrice + Tax on ProRata Price
                 */
                this.viewPaymentSummary.NextPaymentProRata = nextPayment.ProRataPrice + this.getTaxAmount(nextPayment.ProRataPrice, this.saveMemberPaymentRef.membershipPaymentSummary.TotalTaxPercentage);
            }
            else {
                this.viewPaymentSummary.NextPaymentAmount = nextPayment.TotalPrice;
            }

            this.viewPaymentSummary.NextPaymentInterval = nextPayment.DurationTypeID;
            this.viewPaymentSummary.NextPaymentDate = nextPayment.CollectionDate;
        }

        // Set Bank Account Info
        this.viewPaymentSummary.AccountDetails = new AccountDetails();
        if (this.saleTypeId === this.saleType.Card && this.saveMemberMembershipRef.selectedGateway.PaymentGatewayID == this.paymentGateway.Stripe_Card) {
            if (this.saveMemberMembershipModel.CustomerPaymentGatewayID > 0) {
                if (this.saveMemberMembershipRef.stripeRef.savedCards) {
                    this.viewPaymentSummary.AccountDetails.AccountHolderName = this.saveMemberMembershipRef.stripeRef.savedCards
                        .find(c => c.CustomerPaymentGatewayID === this.saveMemberMembershipModel.CustomerPaymentGatewayID).Title;
                    this.viewPaymentSummary.CustomerGatewayId = this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID;
                }
                else {
                    this.viewPaymentSummary.AccountDetails.AccountHolderName = null;
                    this.viewPaymentSummary.AccountDetails.CardNumber = this.stripeCardInfo.card.brand + " **** **** **** " + this.stripeCardInfo.card.last4;
                    this.viewPaymentSummary.AccountDetails.NameOnCard = this.stripeCardInfo.card.name;
                    this.viewPaymentSummary.AccountDetails.Expiry = this.stripeCardInfo.card.exp_month + "/" + this.stripeCardInfo.card.exp_year;
                    this.viewPaymentSummary.CustomerGatewayId = this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID;
                }

            }
            else {
                this.viewPaymentSummary.AccountDetails.AccountHolderName = null;
                this.viewPaymentSummary.AccountDetails.CardNumber = this.stripeCardInfo.card.brand + " **** **** **** " + this.stripeCardInfo.card.last4;
                this.viewPaymentSummary.AccountDetails.NameOnCard = this.stripeCardInfo.card.name;
                this.viewPaymentSummary.AccountDetails.Expiry = this.stripeCardInfo.card.exp_month + "/" + this.stripeCardInfo.card.exp_year;
                this.viewPaymentSummary.CustomerGatewayId = this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID;
            }
        }
        if (this.saleTypeId === this.saleType.Card && this.saveMemberMembershipRef.selectedGateway.PaymentGatewayID == this.paymentGateway.PayTabs) {

            if (this.saveMemberMembershipModel.CustomerPaymentGatewayID > 0) {
                if (this.saveMemberMembershipRef.paytabsRef?.savedCards) {
                    this.viewPaymentSummary.AccountDetails.AccountHolderName = this.saveMemberMembershipRef.paytabsRef?.savedCards
                        .find(c => c.CustomerPaymentGatewayID === this.saveMemberMembershipModel.CustomerPaymentGatewayID)?.Title;
                    if (this.viewPaymentSummary.AccountDetails.AccountHolderName == undefined) {
                        this.viewPaymentSummary.AccountDetails.AccountHolderName = this.payTabsCardInfo.CardScheme + " **** **** **** " + this.payTabsCardInfo.CardLast4Digit;
                    }
                    this.viewPaymentSummary.CustomerGatewayId = this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID;
                }
                else {
                    this.viewPaymentSummary.AccountDetails.AccountHolderName = null;
                    this.viewPaymentSummary.AccountDetails.CardNumber = this.payTabsCardInfo.CardScheme + " **** **** **** " + this.payTabsCardInfo.CardLast4Digit;
                    this.viewPaymentSummary.AccountDetails.NameOnCard = this.saveMemberMembershipRef?.paytabsRef?.nameOnCard?.value;
                    this.viewPaymentSummary.CustomerGatewayId = this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID;
                }

            }
            else {
                this.viewPaymentSummary.AccountDetails.AccountHolderName = null;
                this.viewPaymentSummary.AccountDetails.CardNumber = this.payTabsCardInfo.CardScheme + " **** **** **** " + this.payTabsCardInfo.CardLast4Digit;
                this.viewPaymentSummary.AccountDetails.NameOnCard = this.saveMemberMembershipRef?.paytabsRef?.nameOnCard?.value;
                this.viewPaymentSummary.CustomerGatewayId = this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID;
            }
        }
        else if (this.saleTypeId === this.saleType.DirectDebit) {
            if (this.saveMemberMembershipRef.goCardlessRef.accountId === 0) {
                this.viewPaymentSummary.AccountDetails.AccountHolderName = this.saveMemberMembershipModel.DirectDebit.AccountHolderName;
                this.viewPaymentSummary.AccountDetails.AccountNumber = this.saveMemberMembershipModel.DirectDebit.AccountNumber;
                this.viewPaymentSummary.AccountDetails.BranchCode = this.saveMemberMembershipModel.DirectDebit.BranchCode;
                this.viewPaymentSummary.AccountDetails.BankCode = this.saveMemberMembershipModel.DirectDebit.BankCode;
            }
            else {
                this.viewPaymentSummary.AccountDetails.AccountHolderName = this.saveMemberMembershipRef.goCardlessRef.savedAccounts
                    .find(a => a.CustomerPaymentGatewayID === this.saveMemberMembershipModel.CustomerPaymentGatewayID).Title;
            }
        }
        else if (this.saleTypeId === this.saleType.StripeTerminal) {
            if (this.saveMemberMembershipRef.stripeACHRef.customerPaymentGatewayId === 0 || this.saveMemberMembershipRef.stripeACHRef.customerPaymentGatewayId === null) {
                let stripeDDDetail = this.getStripeDDAccountDetail();
                this.viewPaymentSummary.AccountDetails.AccountHolderName = stripeDDDetail.Account.Name;
                this.viewPaymentSummary.AccountDetails.AccountNumber = "****" + stripeDDDetail.Account.Mask;
            }
            else {
                this.viewPaymentSummary.AccountDetails.AccountHolderName = this.saveMemberMembershipRef.stripeACHRef.savedAccounts
                    .find(a => a.CustomerPaymentGatewayID === this.saveMemberMembershipRef.stripeACHRef.customerPaymentGatewayId).Title;
            }
        }

        if (this._dateTimeService.convertDateObjToString(this.viewPaymentSummary.PaymentDate, this.datetimeFormatForSave) == this._dateTimeService.convertDateObjToString(new Date(), this.datetimeFormatForSave)) {
            this.showSave = false;
            this.showPay = true;
        }

        firstDatePayments.forEach(payment => {
            let viewPayment = new ViewPayment();
            viewPayment.PaymentName = payment.MembershipPaymentName;
            viewPayment.Price = payment.Price;
            viewPayment.ProRataPrice = payment.ProRataPrice;

            this.viewPaymentSummary.PaymentList.push(viewPayment);
        });

        this.showMembershipPayment = true;
        localStorage.setItem('paymentSummary', JSON.stringify(this.viewPaymentSummary));
    }

    getStripeDDAccountDetail(): StripeDD {
        let getStripeDDModel = new StripeDD();
        getStripeDDModel = this.saveMemberMembershipRef.stripeACHRef && this.saveMemberMembershipRef.stripeACHRef.stripeDD != undefined ? this.saveMemberMembershipRef.stripeACHRef.stripeDD : getStripeDDModel;
        return getStripeDDModel;
    }

    getTaxAmount(price: number, percentage: number) {
        return this._taxCaluclationService.getTaxAmount(percentage, price);
    }

    saveMembership() {
        let memberMembershipModelForSave = JSON.parse(JSON.stringify(this.saveMemberMembershipModel));

        memberMembershipModelForSave.StartDate = this._dateTimeService.convertDateObjToString(memberMembershipModelForSave.StartDate, this.datetimeFormatForSave);
        memberMembershipModelForSave.MembershipPaymentPlanDetailList.forEach(payment => {
            payment.CollectionDate = this._dateTimeService.convertDateObjToString(payment.CollectionDate, this.datetimeFormatForSave);
        });
        if (this.membershipBuyForm.valid) {
            this._memberMembershipService.save(MemberMembershipApi.saveMembership, memberMembershipModelForSave)
                .subscribe(
                    (response: ApiResponse) => {
                        if (response && response.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Membership"));
                            // this.showConfirmationDialog();
                            if (response.Result.IsAuthenticationRequire) {
                                this._stripeService.confirmCardPayment(response.Result.ClientSecret, response.Result.PaymentMethod).then(response => {
                                    if (response) {
                                        this.membershipSaved.emit(true);
                                        this.closeDialog();
                                    }
                                },
                                    error => {
                                        this._messageService.showErrorMessage(error);
                                        this.membershipSaved.emit(true);
                                        this.closeDialog();
                                    });
                            }
                            else {
                                this.membershipSaved.emit(true);
                                this.closeDialog();
                            }
                        }
                        else if (response && response.MessageCode == -31) {
                            this._messageService.showErrorMessage(this.messages.Validation.Member_Membership_Exist);
                            this.onSaveMembershipErrorGetFilledFormCopy();
                            this.membershipSaved.emit(false);
                        }
                        else {
                            this._messageService.showErrorMessage(response.MessageText);
                            this.onSaveMembershipErrorGetFilledFormCopy();
                            this.membershipSaved.emit(false);
                        }
                        this.saveInProgress = false;
                    },
                    error => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Membership"));
                        this.onSaveMembershipErrorGetFilledFormCopy();
                        this.membershipSaved.emit(false);
                        this.saveInProgress = false;
                    }
                );
        }
    }

    onSaveMembershipErrorGetFilledFormCopy() {
        if (this.copyCustomFormViewAfterSave) {
            this.customFormView = JSON.parse(JSON.stringify(this.copyCustomFormViewAfterSave));
        }
    }

    showConfirmationDialog() {
        const dialogRef = this._dialog.open(MandateConfirmationDialog, {
            disableClose: true
        });

        dialogRef.componentInstance.customerId = this.saveMemberMembershipModel.CustomerID;
        dialogRef.componentInstance.showCardMandate = this.saleTypeId === this.saleType.Card || this.saleTypeId === this.saleType.StripeTerminal ? true : false;
        dialogRef.componentInstance.showCashMandate = this.saleTypeId === this.saleType.Cash;
        dialogRef.componentInstance.showDirectDebitMandate = this.saleTypeId === this.saleType.DirectDebit;
        dialogRef.componentInstance.gatewayId = this.saveMemberMembershipRef.selectedGatewayId;
    }

    // private loadScripts() {
    //     // You can load multiple scripts by just providing the key as argument into load method of the service
    //     this._dynamicScriptLoader.load('stripejs').then(data => {
    //         // Script Loaded Successfully
    //     }).catch(error => console.log(error));
    // }
    verifyGoCardlessAccountDetail() {
        if (this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.BankCode != null) {
            this.saveMemberMembershipModel.DirectDebit.BankCode = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.BankCode;
        }
        if (this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.BranchCode != null) {
            this.saveMemberMembershipModel.DirectDebit.BranchCode = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.BranchCode;
        }
        if (this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.CountryCode != null) {
            this.saveMemberMembershipModel.DirectDebit.CountryCode = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.CountryCode;
        }
        if (this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountType != null) {
            this.saveMemberMembershipModel.DirectDebit.AccountType = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountType;
        }

    }

    setSaveGatewayModel() {
        this.saveGatewayModel.CustomerID = this.model.CustomerID;
        this.saveGatewayModel.PaymentGatewayID = this.saveMemberMembershipRef.selectedGatewayId;

        if (this.saveGatewayModel.PaymentGatewayID == this.paymentGateway.Stripe_DD) {
            this.saveGatewayModel.SaleTypeID = this.saleType.DirectDebit;
        } else {
            this.saveGatewayModel.SaleTypeID = this.saveMemberMembershipRef.saleTypeId;

        }

        this.authenticateCard.CustomerID = this.model.CustomerID;
        this.authenticateCard.PaymentGatewayID = this.saveMemberMembershipRef.selectedGatewayId;
        this.authenticateCard.SaleTypeID = this.saveGatewayModel.SaleTypeID;
    }


    deleteGateway() {
        let params = {
            CustomerID: this.authenticateCard.CustomerID,
            SaleTypeID: this.authenticateCard.SaleTypeID,
            PaymentGatewayID: this.authenticateCard.PaymentGatewayID,
            CustomerPaymentGatewayID: this.authenticateCard.CustomerPaymentGatewayID
        }

        this._memberMembershipService.delete(CustomerPaymentGatewayApi.deleteGateway, params).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    // this.showMessageAfterPaymentCapturedSuccessfully();
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

    showMessageAfterPaymentCapturedSuccessfully() {
        this.saveInProgress = false;
    }
    roundValue(value: any) {
        return this._taxCaluclationService.getRoundValue(value);
    }

    closeDialog() {
        this._dialogRef.close();
    }

    // receive value as output
    CountrySchema(schema: string) {
        this.countrySchema = schema;
    }
    // receive value as output
    selectedPaymentGateWayID(paymentGateWayID: number) {
        this.paymentGateWayID = paymentGateWayID;
    }

    // check billing address is exist
    checkBillingAddress() {
        return new Promise((resolve, reject) => {
            if (this.paymentGateWayID > 0) {
                resolve(true);
            } else {
                this._memberMembershipService.get(CustomerApi.checkBillingAndGateway + this.model.CustomerID).subscribe(
                    (response: ApiResponse) => {
                        if (!response.Result.HasBillingAddress && !response.Result.HasHomeAddress && !response.Result.HasShippingAddress) {
                            this.showBillingAddressDialog().then(() => {
                                resolve(true);
                            });
                        } else {
                            if (!response.Result.HasValidState) {
                                this.showBillingAddressDialog().then(() => {
                                    resolve(true);
                                });
                            } else {
                                resolve(true);
                            }
                        }
                    })
            }
        })
    }

    // if not exist billing address popup willl open 
    showBillingAddressDialog() {
        return new Promise((resolve, reject) => {
            const dialog = this._dialog.open(MissingBillingAddressDialog, {
                disableClose: true,
                data: { customerID: this.model.CustomerID, isGoCardLess: true }
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
}