// #region Imports

/********************** Angular References *********************/
import { NgForm } from "@angular/forms";
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { Component, ViewChild, OnInit, QueryList, ViewChildren } from '@angular/core';

/********************** Services & Models *********************/
/* Models */
import { SavePageMember } from '@customer/member/models/members.model';
import { CustomFormView } from '@app/models/customer.form.model';
import { ApiResponse, CustomerBillingDetail } from '@app/models/common.model';
import { StripePaymentIntent, PayTabPaymentMode } from '@app/point-of-sale/models/point.of.sale.model';
import { Card, DirectDebit, StripeTerminal, StripeDD, AuthenticateCard } from '@customer/member/models/member.gateways.model';
import { GetMemberMembershipPlan, ViewPaymentSummary, ViewPayment, AccountDetails, GatewayCustomerViewModel } from '@customer/member/models/member.membership.model';
/* Services */
import { HttpService } from '@services/app.http.service';
import { StripeService } from "@app/services/stripe.service";
import { DateTimeService } from '@services/date.time.service';
import { MessageService } from '@services/app.message.service';
import { TaxCalculation } from '@app/services/tax.calculations.service';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { DynamicScriptLoaderService } from "@app/services/dynamic.script.loader.service";


/**********************Component*********************/
import { SaveMemberDetailsComponent } from "@customer/member/save/save-member-details/save.member.details.component";
//import { MembershipFormComponent } from '@app/shared/components/forms/membership-form/membership.form.component';
// import { SaveMemberPaymentComponent } from '@app/shared/components/add-member-membership/save-member-payment/save.member.payment.component';
// import { MandateConfirmationDialog } from '@app/shared/components/add-member-membership/mandate-confirmation/mandate.confirmation.component';
// import { SaveMemberMembershipComponent } from '@shared/components/add-member-membership/save-member-membership/save.member.membership.component';

/********************** Configurations *********************/
import { Messages } from '@app/helper/config/app.messages';
import { Configurations } from '@helper/config/app.config';
import { MemberApi, CustomerPaymentGatewayApi, CustomerFormApi } from '@app/helper/config/app.webapi';
import { WizardStep, EnumSaleType, MembershipPaymentType, ENU_PaymentGateway, ENU_SEPACountryCode, CustomFormStatus, AddressType } from "@helper/config/app.enums";
import { SaveMemberMembershipComponent } from "@app/customer-shared-module/add-member-membership/save-member-membership/save.member.membership.component";
import { SaveMemberPaymentComponent } from "@app/customer-shared-module/add-member-membership/save-member-payment/save.member.payment.component";
import { MandateConfirmationDialog } from "@app/customer-shared-module/add-member-membership/mandate-confirmation/mandate.confirmation.component";
import { MembershipFormComponent } from "@app/customer-shared-module/customer-forms/membership-form/membership.form.component";
import { POSMembershipPaymentComponent } from "@customershared/payments/pos.membership.payment";
import { DataSharingService } from "@app/services/data.sharing.service";
import { CommonService } from "@app/services/common.service";
import { SubscriptionLike } from "rxjs";
import { LoaderService } from "@app/services/app.loader.service";

// #endregion

@Component({
    selector: 'add-member',
    templateUrl: './add.member.component.html'
})

export class AddMemberComponent implements OnInit {
    // #region Local Members

    /* Form Refrences*/
    @ViewChild('stepper') stepper: MatStepper;
    @ViewChild('MemberFormData') memberForm: NgForm;
    @ViewChild('saveMemberDetails') saveMemberDetails: SaveMemberDetailsComponent;
    @ViewChild('saveMemberMembershipRef') saveMemberMembershipRef: SaveMemberMembershipComponent;
    @ViewChild('saveMemberPaymentRef') saveMemberPaymentRef: SaveMemberPaymentComponent;
    @ViewChild('posPaymentRef') posPaymentRef: POSMembershipPaymentComponent;
    @ViewChildren('formComponents') formComponents: QueryList<MembershipFormComponent>;

    /* Messages */
    messages = Messages;

    /* Local Members  */
    showPrevious: boolean;
    showSkipAndContinue: boolean = false;
    showNextAndContinue: boolean = false;
    showContinue: boolean = true;
    showSave: boolean;
    showPay: boolean;
    isRewardProgramExistsForJoin: boolean = false;
    showMembershipPayment: boolean = false;
    showMemberDetailsValidation: boolean;
    showMemberMembershipValidation: boolean;
    showSkipRewardProgramAndContinue: boolean = false;
    showJoinRewardProgramAndContinue: boolean = false;
    activeTabIndex: number = 0;
    saveInProgress: boolean;
    saleTypeId: number;
    bankName: string;
    bankEmail: string;
    paymentIntentID: string;
    stripeCardInfo: any;
    payTabsCardInfo: any
    /* Collection And Models */
    memberModel: SavePageMember = new SavePageMember();
    authenticateCard: AuthenticateCard = new AuthenticateCard();
    getMembershipPlanModel: GetMemberMembershipPlan;
    viewPaymentSummary: ViewPaymentSummary;
    stripePaymentIntent: StripePaymentIntent;
    getStripeDDModel: StripeDD;

    wizardSteps = WizardStep;
    saleType = EnumSaleType;
    dateFormatSave = Configurations.DateFormatForSave;
    membershipPaymentType = MembershipPaymentType;
    paymentGateway = ENU_PaymentGateway;
    enu_SEPACountryCode = ENU_SEPACountryCode;

    customFormView: CustomFormView[] = [];
    oldCustomFormView: CustomFormView[] = [];
    copyCustomFormViewAfterSave: any;

    /************* Configurations ***************/
    enuFormTypes = CustomFormStatus;
    isRequiredCustomerAddress: boolean = false;
    showCustomerAddressRequiredValidation: boolean;
    countryID: number;
    countryIDSubscription: SubscriptionLike;

    // #endregion

    constructor(
        public _dialog: MatDialogService,
        public _memberService: HttpService,
        public dateTimeService: DateTimeService,
        public _router: Router,
        public _taxCaluclationService: TaxCalculation,
        public _messageService: MessageService,
        public _stripeService: StripeService,
        private _loaderService: LoaderService,
        public _dynamicScriptLoader: DynamicScriptLoaderService,
        private _commonService: CommonService,
        public _dataSharingService: DataSharingService) {

    }

    ngOnInit() {
        this.loadScripts();
        this.countryIDSubscription = this._dataSharingService.countryID.subscribe((countryID) => {
            this.countryID = countryID;
        })
    }

    ngOnDestroy() {
        this.countryIDSubscription.unsubscribe();
    }

    // #region Events

    onContinue() {

        this.showMemberDetailsValidation = false;
        let isExistStateCode = this._commonService.isStatCountyCodeExist(this.saveMemberDetails.memberModel, this.saveMemberDetails.stateList, this.countryID);
        if (this.activeTabIndex === this.wizardSteps.Details) {
            if (this.saveMemberDetails.memberForm && this.saveMemberDetails.memberForm.valid && isExistStateCode) {
                this.showCustomerAddressRequiredValidation = false;
                this._dataSharingService.shareMemberEmail(this.saveMemberDetails.memberModel.Email);
                this.setAddressesToModel();
                this.stepper.next();
            }
            else {
                if (!isExistStateCode) {
                    this.showCustomerAddressRequiredValidation = false;
                    setTimeout(() => {
                        this.showCustomerAddressRequiredValidation = true;
                    }, 10);
                } else {
                    this.showMemberDetailsValidation = true;
                }
            }
        }
        else if (this.activeTabIndex === this.wizardSteps.Membership) {
            this.saleTypeId = this.saveMemberMembershipRef.saleTypeId;
            this.setAddressesToModel();
            this.isSelectMembershipValid().then((isValid: boolean) => {
                if (isValid) {
                    if (!this.isRewardProgramExistsForJoin) {
                        this.isRewardProgramExistsForJoin = this.saveMemberMembershipRef && this.saveMemberMembershipRef.BranchDefaultRewardProgramVM ? true : false;
                    }
                    this.getMembershipPlanModel = this.saveMemberMembershipRef.getMemberMembershipModel();
                    this.GetMembershipSpecificForms(this.getMembershipPlanModel.MembershipID);
                    this.getStripeDDModel = this.saveMemberMembershipRef.getStripeDDAccountDetail();
                    this.stepper.next();
                    this.activeTabIndex = this.stepper.selectedIndex;
                    this.setPerviousContinueButtonVisibility(this.activeTabIndex);
                }
            });
        }
        else if (this.activeTabIndex === this.wizardSteps.Payments) {
            this.setViewPaymentSummary();
            this.stepper.next();
        } else if (this.customFormView && this.customFormView.length > 0) {
            var _formData = this.onGetFormComponent();
            _formData.onSubmit();
        }
        // else if (this.activeTabIndex === this.wizardSteps.PaymentMethod) {

        // // }
        this.activeTabIndex = this.stepper.selectedIndex;
        this.setPerviousContinueButtonVisibility(this.activeTabIndex);
    }

    isCustomerAddressExist(addressType) {
        return this.memberModel.CustomerAddress.some(address => address.AddressTypeID === addressType)
    }

    setAddressesToModel() {
        this.memberModel = this.saveMemberDetails.memberModel;
        const homeAddress = this.memberModel.CustomerAddress.find(address => address.AddressTypeID === AddressType.HomeAddress);
        const billingAddress = this.memberModel.CustomerAddress.find(address => address.AddressTypeID === AddressType.BillingAddress);
        if (billingAddress.CountryID && billingAddress.StateCountyName && billingAddress.Address1 && billingAddress.CityName) {
            this._dataSharingService.shareCustomerBillingAddress(billingAddress);
        } else if (homeAddress.CountryID && homeAddress.StateCountyName && homeAddress.Address1 && homeAddress.CityName) {
            this._dataSharingService.shareCustomerBillingAddress(homeAddress)
        } else {
            this._dataSharingService.shareCustomerBillingAddress(billingAddress);
        }
    }

    onPrevious() {
        this.stepper.previous();
        this.activeTabIndex = this.stepper.selectedIndex;
        if (this.activeTabIndex == 1) {

            this.deleteGateway();
        }
        if (!this.isRewardProgramExistsForJoin) {
            this.showMembershipPayment = false;
        }
        let  _formDataa = this.onGetFormComponent();
      if(!_formDataa){
        this.showSkipRewardProgramAndContinue = false;
      }
        this.setPerviousContinueButtonVisibility(this.activeTabIndex);
      this.setRewardProgramSkipButtonVisibility();
        
        // //store Old form data for skip functionality
        if (this.showSkipAndContinue) {
            var _formData = this.onGetFormComponent();
            if (_formData) {
                _formData.setFormCopy(_formData.customeFormViewModel);
                this.showSkipRewardProgramAndContinue = false;
            }
        }
        this.isRequiredCustomerAddress = false;
    }

    onSkipForm() {
        var _formData = this.onGetFormComponent();
        _formData.onSkip();
        this.activeTabIndex = this.stepper.selectedIndex;
        this.setPerviousContinueButtonVisibility(this.activeTabIndex);


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
        var activeInd = this.activeTabIndex - 3;
        var _formsResults = this.formComponents.toArray();
        var _formData = _formsResults[activeInd];

        return _formData;
    }

    onReset() {
        this.resetForm();
        this.deleteGateway();
    }

    onSave() {
        this.saveInProgress = true;
        this.setModelForSave();
    }

    onSaleTypeChange(saleTypeId: number) {
        this.saleTypeId = saleTypeId;
    }

    onSubmitFormsHandler(customForm) {
        if (customForm.SkipSubmitIndicator === 'submit') {

            if ((this.activeTabIndex - 3 < this.customFormView.length - 1)) {
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
            customerID: 0,
        }

        if (this.customFormView && this.customFormView.length > 0) {
            this.oldCustomFormView = JSON.parse(JSON.stringify(this.customFormView));
        }

        this._memberService.get(CustomerFormApi.getMembershipSpecificForms, param).subscribe(
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
    onJoinRewardProgram() {
        this.showSkipRewardProgramAndContinue = false;
        this.showJoinRewardProgramAndContinue = false;
        this.setViewPaymentSummary();
        this.memberModel.isCutomerViewedRewardProgramSkipped = false;
        this.memberModel.cutomerViewedRewardProgramID = this.saveMemberMembershipRef.BranchDefaultRewardProgramVM.RewardProgramID;
        this.showPrevious = true;
        this.activeTabIndex = this.stepper.selectedIndex;
        this.stepper.next();
    }
    onSkipRewardProgram() {
        this.showSkipRewardProgramAndContinue = false;
        this.showJoinRewardProgramAndContinue = false;
        this.memberModel.isCutomerViewedRewardProgramSkipped = true;
        this.memberModel.cutomerViewedRewardProgramID = this.saveMemberMembershipRef.BranchDefaultRewardProgramVM.RewardProgramID;
        this.setViewPaymentSummary();
        this.showPrevious = true;
        this.activeTabIndex = this.stepper.selectedIndex;
        this.stepper.next();
    }
    setPerviousContinueButtonVisibility(index: number) {


        if (index === this.wizardSteps.Details) {
            this.showPrevious = false;
            this.showContinue = true;
            this.showSave = false;
            this.showPay = false;
            this.showSkipAndContinue = false;
            this.showNextAndContinue = false;
        }
        else if (index === this.wizardSteps.Membership) {
            this.showPrevious = true;
            this.showContinue = true;
            this.showSave = false;
            this.showPay = false;
            this.showSkipAndContinue = false;
            this.showNextAndContinue = false;
        }
        else if (index === this.wizardSteps.Payments) {
            this.showPrevious = true;
            this.showContinue = true;
            this.showSave = false;
            this.showPay = false;
            this.showSkipAndContinue = false;
            this.showNextAndContinue = false;
        } else if (this.customFormView) {
            if ((this.activeTabIndex - 3) <= (this.customFormView.length - 1)) {
                this.showPrevious = true;
                this.showContinue = true;
                this.showSkipAndContinue = true;
                //show next and continue button for submitted forms
                this.showNextAndContinue = this.customFormView[this.activeTabIndex - 3].FormStatusID == this.enuFormTypes.Submitted ? true : false;
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
        } else if (index === this.wizardSteps.PaymentMethod) {
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
    /** paytabs gateway condition added by Ameer hamza */
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

                this.isPayTabsCardDetailsValid().then(isValid => {
                    resolve(isValid);
                    return;
                });
            }
            else if (this.saleTypeId === this.saleType.DirectDebit) {
                resolve(this.isDirectDebitValid());
                return;
            }
            else if (this.saleTypeId === this.saleType.StripeTerminal) {
                resolve(this.isStripeDDValid());
                return;
            }
        })
    }

    setViewPaymentSummary() {
        let allPayments = this.saveMemberPaymentRef.membershipPaymentSummary.MembershipPaymentSummaryList;
        let firstDatePayments = allPayments.filter(p => p.CollectionDate === allPayments[0].CollectionDate);
        let nextPayment = allPayments.find(p => p.MembershipPaymentTypeID === this.membershipPaymentType.Recurring &&
            p.CollectionDate > firstDatePayments[0].CollectionDate);

        this.viewPaymentSummary = new ViewPaymentSummary();
        this.setBillingAddressModel();
        this.viewPaymentSummary.CustomerID = 0;
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
        if (this.saleTypeId === this.saleType.Card && this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID == this.paymentGateway.Stripe_Card) {
            this.viewPaymentSummary.AccountDetails.CardNumber = this.stripeCardInfo.card.brand + " **** **** **** " + this.stripeCardInfo.card.last4;
            this.viewPaymentSummary.AccountDetails.NameOnCard = this.stripeCardInfo.card.name;
            this.viewPaymentSummary.AccountDetails.Expiry = this.stripeCardInfo.card.exp_month + "/" + this.stripeCardInfo.card.exp_year;
            this.viewPaymentSummary.CustomerGatewayId = this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID;
        }
        if (this.saleTypeId === this.saleType.Card && this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID == this.paymentGateway.PayTabs) {
            this.viewPaymentSummary.AccountDetails.CardNumber = this.payTabsCardInfo?.CardScheme + " **** **** **** " + this.payTabsCardInfo?.CardLast4Digit;
            this.viewPaymentSummary.AccountDetails.NameOnCard = this.saveMemberMembershipRef?.paytabsRef?.nameOnCard.value;
            this.viewPaymentSummary.CustomerGatewayId = this.saveMemberMembershipRef?.selectedGateway.PaymentGatewayID;
        }
        else if (this.saleTypeId === this.saleType.DirectDebit) {
            this.viewPaymentSummary.AccountDetails.AccountHolderName = this.memberModel.MemberMembership.DirectDebit.AccountHolderName;
            this.viewPaymentSummary.AccountDetails.AccountNumber = this.memberModel.MemberMembership.DirectDebit.AccountNumber;
            this.viewPaymentSummary.AccountDetails.BankCode = this.memberModel.MemberMembership.DirectDebit.BankCode;
            this.viewPaymentSummary.AccountDetails.BranchCode = this.memberModel.MemberMembership.DirectDebit.BranchCode;
        } else if (this.saleTypeId === this.saleType.StripeTerminal) {
            let stripeDDDetail = this.getStripeDDModel;
            this.viewPaymentSummary.AccountDetails.AccountHolderName = stripeDDDetail.Account.Name;
            this.viewPaymentSummary.AccountDetails.AccountNumber = "****" + stripeDDDetail.Account.Mask;
        }

        if (this.dateTimeService.convertDateObjToString(this.viewPaymentSummary.PaymentDate, this.dateFormatSave) == this.dateTimeService.convertDateObjToString(new Date(), this.dateFormatSave)) {
            this.showSave = false;
            this.showPay = true;
        }
        else {
            this.showSave = true;
            this.showPay = false;
        }

        firstDatePayments.forEach(payment => {
            let viewPayment = new ViewPayment();
            viewPayment.PaymentName = payment.MembershipPaymentName;
            viewPayment.Price = payment.Price;
            viewPayment.ProRataPrice = payment.ProRataPrice;

            this.viewPaymentSummary.PaymentList.push(viewPayment);
        })

        this.showMembershipPayment = true;
        localStorage.setItem('paymentSummary',JSON.stringify(this.viewPaymentSummary));
    }

    setBillingAddressModel() {
        if (this.saveMemberMembershipRef.selectedGatewayId == this.paymentGateway.PayTabs) {
            this.memberModel.CustomerAddress[1].Address1 = this.saveMemberMembershipRef.paytabsRef.payTabs.StreetAddress;
            this.memberModel.CustomerAddress[1].Address2 = this.saveMemberMembershipRef.paytabsRef.payTabs.StreetAddress2;
            this.memberModel.CustomerAddress[1].CityName = this.saveMemberMembershipRef.paytabsRef.payTabs.City;
            this.memberModel.CustomerAddress[1].StateCountyName = this.saveMemberMembershipRef.paytabsRef.payTabs.State;
            this.memberModel.CustomerAddress[1].CountryName = this.saveMemberMembershipRef.paytabsRef.payTabs.Country;
            this.memberModel.CustomerAddress[1].CountryID = this.saveMemberMembershipRef.paytabsRef.payTabs.CountryID;
            this.memberModel.CustomerAddress[1].PostalCode = this.saveMemberMembershipRef.paytabsRef.payTabs.PostalCode;
            this.memberModel.CustomerAddress[1].AddressTypeID = AddressType.BillingAddress;
        }
        const homeAddress = this.memberModel.CustomerAddress.find(address => address.AddressTypeID === AddressType.HomeAddress);
        const billingAddress = this.memberModel.CustomerAddress.find(address => address.AddressTypeID === AddressType.BillingAddress);
        const shippingAddress = this.memberModel.CustomerAddress.find(address => address.AddressTypeID === AddressType.ShippingAddress);
        this.viewPaymentSummary.BillingDetails = new CustomerBillingDetail();
        const billingDetails = this.viewPaymentSummary.BillingDetails;
        if (billingAddress.CountryID && billingAddress.StateCountyName && billingAddress.Address1 && billingAddress.CityName) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, billingAddress);
        } else if (homeAddress.CountryID && homeAddress.StateCountyName && homeAddress.Address1 && homeAddress.CityName) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, homeAddress)
        } else if (shippingAddress.CountryID && shippingAddress.StateCountyName && shippingAddress.Address1 && shippingAddress.CityName) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, shippingAddress);
        }
        else if (billingAddress.CountryID && billingAddress.StateCountyName && billingAddress.Address1) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, billingAddress);
        } else if (homeAddress.CountryID && homeAddress.StateCountyName && homeAddress.Address1) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, homeAddress)
        } else if (shippingAddress.CountryID && shippingAddress.StateCountyName && shippingAddress.Address1) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, shippingAddress);
        }
        else if (billingAddress.CountryID && billingAddress.StateCountyName) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, billingAddress);
        } else if (homeAddress.CountryID && homeAddress.StateCountyName) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, homeAddress)
        } else if (shippingAddress.CountryID && shippingAddress.StateCountyName) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, shippingAddress);
        }
        else if (billingAddress.CountryID) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, billingAddress);
        } else if (homeAddress.CountryID) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, homeAddress)
        } else if (shippingAddress.CountryID) {
            this.viewPaymentSummary.BillingDetails = this.setBillingValues(billingDetails, shippingAddress);
        }
    }

    setBillingValues(billingDetails, address): CustomerBillingDetail {
        if (this.saveMemberMembershipRef.selectedGateway.PaymentGatewayID == this.paymentGateway.PayTabs) {
            billingDetails.Address1 = this.saveMemberMembershipRef.paytabsRef.payTabs.StreetAddress;
            billingDetails.Address2 = this.saveMemberMembershipRef.paytabsRef.payTabs.StreetAddress2;
            billingDetails.CityName = this.saveMemberMembershipRef.paytabsRef.payTabs.City;
            billingDetails.StateCountyName = this.saveMemberMembershipRef.paytabsRef.payTabs.State;
            billingDetails.CountryName = this.saveMemberMembershipRef.paytabsRef.payTabs.Country;
            billingDetails.PostalCode = this.saveMemberMembershipRef.paytabsRef.payTabs.PostalCode;
        }
        else {
            billingDetails.Address1 = address.Address1;
            billingDetails.Address2 = address.Address2;
            billingDetails.CityName = address.CityName;
            billingDetails.CountryName = address.CountryName;
            billingDetails.Phone = address.Mobile;
            billingDetails.StateCountyName = address.StateCountyName;
            billingDetails.PostalCode = address.PostalCode;
        }
        return billingDetails;
    }

    getTaxAmount(price: number, percentage: number) {
        return this._taxCaluclationService.getTaxAmount(percentage, price);
    }

    getTotal(): number {
        let total = 0;
        let totalAmount = 0;

        this.viewPaymentSummary.PaymentList.forEach(payment => {
            this.viewPaymentSummary.TaxAmount += this.viewPaymentSummary.TotalTaxPercentage ? this._taxCaluclationService.getTaxAmount(this.viewPaymentSummary.TotalTaxPercentage, payment.Price + payment.ProRataPrice) : 0;
            payment.TotalPrice = payment.Price + payment.ProRataPrice;
            total += payment.TotalPrice;
        });
        totalAmount = this.roundValue(total + this.viewPaymentSummary.TaxAmount);
        return totalAmount
    }


    isCardDetailsValid() {
        if (this.saveMemberMembershipRef.stripeRef.cardId === 0 || this.authenticateCard.CustomerPaymentGatewayID == 0) {
            return new Promise<boolean>((resolve, reject) => {
                this.saveMemberMembershipRef.stripeRef.getStripeToken(true).then(
                    token => {
                        this.stripeCardInfo = token;
                        this.authenticateCard.CardToken = this.stripeCardInfo.id;
                        this.setStripeCardAuthenticationModel();
                        this._stripeService.stripeCardAuthentication(this.authenticateCard).then(isResolved => {
                            this.memberModel.MemberMembership.GatewayCustomerViewModel = new GatewayCustomerViewModel();
                            this.memberModel.MemberMembership.GatewayCustomerViewModel.Brand = isResolved.Brand;
                            this.memberModel.MemberMembership.GatewayCustomerViewModel.GatewayCustomerID = isResolved.GatewayCustomerID;
                            this.memberModel.MemberMembership.GatewayCustomerViewModel.LastDigit = isResolved.LastDigit;
                            this.memberModel.MemberMembership.GatewayCustomerViewModel.PaymentMethod = isResolved.PaymentMethod;

                            if (isResolved && isResolved.Resolve) {
                                this.resetCardDetail();
                                resolve(true);
                                return;
                            }
                            else {
                                if (isResolved && isResolved.MessageCode === -103 ||
                                    isResolved && isResolved.MessageCode === -118 ||
                                    isResolved && isResolved.MessageCode === -125) {
                                    this._messageService.showErrorMessage(isResolved.MessageText);
                                } else {
                                    this.deleteGateway();
                                }
                                resolve(false);
                                return;
                            }

                        }, error => {
                            this._messageService.showErrorMessage(error);
                            this.deleteGateway();
                            resolve(false);
                            return;
                        });

                    },
                    error => {
                        this._messageService.showErrorMessage(error);
                        resolve(false);
                        return;
                    }
                )
            });
        }
    }
    /** this methods validate paytabs authorized card  */
    isPayTabsCardDetailsValid() {
        if (this.saveMemberMembershipRef.paytabsRef?.cardId == 0) {
            return new Promise<boolean>((resolve, reject) => {
                if (this.saveMemberMembershipRef.paytabsRef?.isValidatedCard) {
                    resolve(true);
                    return;
                }
                else {
                    this._dataSharingService.onButtonSubmit(true);
                    this.saveMemberMembershipRef.paytabsRef.payByPayTabsCard().then((response: PayTabPaymentMode) => {
                        this.payTabsCardInfo = response;
                        this.memberModel.MemberMembership.GatewayCustomerViewModel = new GatewayCustomerViewModel();
                        this.memberModel.MemberMembership.Card = new Card();
                        this.memberModel.MemberMembership.GatewayCustomerViewModel.GatewayCustomerID = "PayTabs Gateway";
                        this.memberModel.MemberMembership.GatewayCustomerViewModel.PaymentMethod = "PayTabs Card";
                        this.memberModel.MemberMembership.GatewayCustomerViewModel.Brand = response.CardScheme;
                        this.memberModel.MemberMembership.Card.PaymentGatewayToken = response.Token;
                        this.memberModel.MemberMembership.GatewayCustomerViewModel.LastDigit = response.CardLast4Digit;
                        resolve(true);
                        return;
                    }).catch(error => {

                        this._messageService.showErrorMessage(error);
                        resolve(false);
                        return;
                    });
                }

            })
        }
    }

    isStripeDDValid() {
        let isValid = false;

        if (this.saveMemberMembershipRef.stripeACHRef.isValidStripeDDAccountAdded()) {
            if (this.saveMemberMembershipRef.stripeACHRef.isTermsAgreed) {
                return new Promise<boolean>((resolve, reject) => {
                    this.memberModel.MemberMembership.PaymentGatewayID = this.paymentGateway.Stripe_DD;
                    this.memberModel.MemberMembership.SaleTypeID = this.saleType.DirectDebit;
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

    isDirectDebitValid() {
        //if (this.posPaymentRef.goCardlessRef.accountId === "0") {
        // this.posPaymentRef.goCardlessRef.getCustomerToken().then(
        //     token => {
        //         this.memberModel.MemberMembership.PaymentGatewayToken = token;
        //         this.saveMember();
        //     },
        //     error => {
        //         this._messageService.showErrorMessage(error);
        //         this.saveInProgress = false;
        //     }
        // )
        // }
        let isValid = false;

        if (this.saveMemberMembershipRef.goCardlessRef.addGoCardlessForm.valid) {
            if (this.saveMemberMembershipRef.goCardlessRef.isTermsAgreed) {
                this.memberModel.MemberMembership.DirectDebit = new DirectDebit();
                this.memberModel.MemberMembership.DirectDebit.AccountHolderName = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountHolderName;
                this.memberModel.MemberMembership.DirectDebit.AccountNumber = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountNumber;
                // this.memberModel.MemberMembership.DirectDebit.BranchCode = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.BranchCode;
                // this.memberModel.MemberMembership.DirectDebit.BankCode = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.BranchCode;
                this.memberModel.MemberMembership.DirectDebit.CountryCode = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.CountryCode;
                this.verifyGoCardlessAccountDetail();
                switch (this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.CountryCode) {
                    case this.enu_SEPACountryCode.FR:
                        this.memberModel.MemberMembership.DirectDebit.AccountNumber = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountNumber + " " + this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.Check;
                        break;

                    case this.enu_SEPACountryCode.PT:
                        this.memberModel.MemberMembership.DirectDebit.AccountNumber = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountNumber + this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.Check;
                        break;

                    case this.enu_SEPACountryCode.ES:
                        this.memberModel.MemberMembership.DirectDebit.AccountNumber = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.Check + " " +
                            this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountNumber;
                        break;
                    case this.enu_SEPACountryCode.SK:
                        this.memberModel.MemberMembership.DirectDebit.AccountNumber = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.PrefixAccountNumber +
                            this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountNumber;
                        break;
                }

                console.log('DD Data', this.memberModel.MemberMembership);
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

        return isValid;
    }

    verifyGoCardlessAccountDetail() {
        if (this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.BankCode != null) {
            this.memberModel.MemberMembership.DirectDebit.BankCode = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.BankCode;
        }
        if (this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.BranchCode != null) {
            this.memberModel.MemberMembership.DirectDebit.BranchCode = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.BranchCode;
        }
        if (this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.CountryCode != null) {
            this.memberModel.MemberMembership.DirectDebit.CountryCode = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.CountryCode;
        }
        if (this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountType != null) {
            this.memberModel.MemberMembership.DirectDebit.AccountType = this.saveMemberMembershipRef.goCardlessRef.saveGoCardlessModel.AccountType;
        }

    }

    // stripeCardAuthentication() {
    //     this.setStripeCardAuthenticationModel();
    //     return new Promise<boolean>((resolve, reject) => {
    //         this._memberService.save(CustomerPaymentGatewayApi.getStripeCardAuthentication, this.authenticateCard)
    //             .subscribe((response: ApiResponse) => {
    //                 if (response && response.MessageCode > 0) {
    //                     this.authenticateCard.CustomerPaymentGatewayID = response.Result.CustomerPaymentGatewayID;
    //                     this.memberModel.MemberMembership.GatewayCustomerViewModel = new GatewayCustomerViewModel();
    //                     this.memberModel.MemberMembership.GatewayCustomerViewModel.Brand = response.Result.Brand;
    //                     this.memberModel.MemberMembership.GatewayCustomerViewModel.GatewayCustomerID = response.Result.GatewayCustomerID;
    //                     this.memberModel.MemberMembership.GatewayCustomerViewModel.LastDigit = response.Result.LastDigit;
    //                     this.memberModel.MemberMembership.GatewayCustomerViewModel.PaymentMethod = response.Result.PaymentMethod;

    //                     if (response.Result.IsAuthenticationRequire) {
    //                         this.saveMemberMembershipRef.stripeRef.confirCardSetup(response.Result.ClientSecret, response.Result.PaymentMethod).then(res => {
    //                             if (res) {
    //                                 // this.saveMemberMembershipRef.stripeRef.getSavedCards();
    //                                 console.log(this.saveMemberMembershipRef.stripeRef.getSavedCards());
    //                                 this.memberModel.MemberMembership.CustomerPaymentGatewayID = response.Result.CustomerPaymentGatewayID;
    //                                 resolve(true);
    //                                 return;
    //                             }
    //                         },
    //                             error => {
    //                                 this.deleteGateway();
    //                                 this.saveInProgress = false;
    //                                 this._messageService.showErrorMessage(error);
    //                             });
    //                     }
    //                     else if (response && response.Result.ResponseValue == -118) {
    //                         this._messageService.showErrorMessage(this.messages.Error.Duplicate_Card);
    //                         this.saveInProgress = false;
    //                         reject(false);
    //                         return;
    //                     }
    //                     else if (!response.Result.IsAuthenticationRequire) {
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

    setModelForSave() {

        this.memberModel.MemberMembership.MembershipID = this.getMembershipPlanModel.MembershipID;
        this.memberModel.MemberMembership.StartDate = this.getMembershipPlanModel.StartDate;
        this.memberModel.MemberMembership.MembershipPaymentPlanDetailList = this.getMembershipPlanModel.MembershipPaymentPlanDetailList;
        this.memberModel.MemberMembership.PaymentGatewayID = this.saveMemberMembershipRef.selectedGatewayId;
        this.memberModel.MemberMembership.SaleTypeID = this.saveMemberMembershipRef.saleTypeId == this.saleType.StripeTerminal ? this.saleType.DirectDebit : this.saveMemberMembershipRef.saleTypeId;
        this.memberModel.MemberMembership.Notes = this.posPaymentRef.paymentSummary.Notes;
        this.memberModel.PublicToken = this.getStripeDDModel ? this.getStripeDDModel.PublicToken : "";
        this.memberModel.AccountDetail = this.getStripeDDModel && this.getStripeDDModel.Account ? this.getStripeDDModel.Account : null;

        if (this.customFormView && this.customFormView.length > 0) {
            this.copyCustomFormViewAfterSave = JSON.parse(JSON.stringify(this.customFormView))
            this.memberModel.MembershipForms = this.customFormView;
            this.memberModel.MembershipForms.forEach(element => {
                element.JsonText = JSON.stringify(element.JsonText);
            });
        }

        this.saveMember();
    }

    setStripeCardAuthenticationModel() {
        //--- Set model for stripe card authenticatin --- //
        this.authenticateCard.SaleTypeID = this.saleTypeId;
        this.authenticateCard.PaymentGatewayID = this.saveMemberMembershipRef.selectedGatewayId;
    }

    saveMember() {
        if (this.saveMemberDetails.memberForm && this.saveMemberDetails.memberForm.valid) {
            let memberForSave = JSON.parse(JSON.stringify(this.memberModel));
            memberForSave.BirthDate = this.dateTimeService.convertDateObjToString(memberForSave.BirthDate, this.dateFormatSave);
            memberForSave.Email = memberForSave.Email.toLowerCase();

            memberForSave.MemberMembership.MembershipPaymentPlanDetailList.forEach(payment => {
                payment.CollectionDate = this.dateTimeService.convertDateObjToString(payment.CollectionDate, this.dateFormatSave);
            });

            this._memberService.save(MemberApi.saveMember, memberForSave)
                .subscribe((res: ApiResponse) => {
                    if (res && (res.MessageCode != null || res.MessageCode != undefined)) {
                        if (res.MessageCode === -25) {
                            this._messageService.showErrorMessage(this.messages.Error.Duplicate_Email.replace("{0}", "Member"));
                            //this.deleteGateway();
                            this.onSaveMembershipErrorGetFilledFormCopy();
                        }
                        else if (res.MessageCode <= 0) {
                            this._messageService.showErrorMessage(res.MessageText);
                            //this.deleteGateway();
                            this.onSaveMembershipErrorGetFilledFormCopy();
                        }
                        else if (res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Member"));

                            if (res.Result.IsAuthenticationRequire) {
                                this._stripeService.confirmCardPayment(res.Result.ClientSecret, res.Result.PaymentMethod).then(response => {
                                    if (response) {
                                        this.resetForm();
                                        this._router.navigate(['customer/member/details', res.Result.CustomerID]);
                                        this.showConfirmationDialog(res.MessageCode);
                                    }
                                },
                                    error => {
                                        this.resetForm();
                                        this._router.navigate(['/customer']);
                                        this._messageService.showErrorMessage(error);
                                        this.onSaveMembershipErrorGetFilledFormCopy();
                                    });
                            }
                            else {
                                this.resetForm();
                                this._router.navigate(['customer/member/details', res.Result.CustomerID]);
                            }
                        }
                        this.saveInProgress = false;
                    }
                },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Member"));
                        this.saveInProgress = false;
                        //this.deleteGateway();
                        this.onSaveMembershipErrorGetFilledFormCopy();
                    }
                );
        }
    }

    onSaveMembershipErrorGetFilledFormCopy() {
        if (this.copyCustomFormViewAfterSave) {
            this.customFormView = JSON.parse(JSON.stringify(this.copyCustomFormViewAfterSave));
        }
    }

    resetForm() {
        this.stepper.reset();
        this.saveMemberDetails.resetForm();
        this.customFormView = [];
        this.activeTabIndex = this.stepper.selectedIndex;
        this.setPerviousContinueButtonVisibility(this.activeTabIndex);

    }

    resetCardDetail() {
        this.authenticateCard.CardToken = null;
        this.authenticateCard.CustomerID = 0;
        this.authenticateCard.PaymentGatewayID = null;
        this.authenticateCard.SaleTypeID = null;
    }


    showConfirmationDialog(customerId: number) {
        const dialogRef = this._dialog.open(MandateConfirmationDialog, {
            disableClose: true
        });

        dialogRef.componentInstance.customerId = customerId;
        dialogRef.componentInstance.showCashMandate = this.saleTypeId === this.saleType.Cash;
        dialogRef.componentInstance.showCardMandate = this.saleTypeId === this.saleType.Card || this.saleTypeId === this.saleType.StripeTerminal ? true : false;
        dialogRef.componentInstance.showDirectDebitMandate = this.saleTypeId === this.saleType.DirectDebit;
        dialogRef.componentInstance.gatewayId = this.saveMemberMembershipRef.selectedGatewayId;

    }


    deleteGateway() {
        if (this.saveMemberMembershipRef.selectedGateway.PaymentGatewayID == this.paymentGateway.Stripe_Card) {
            this._memberService.delete(MemberApi.deleteGateway + this.memberModel.MemberMembership.GatewayCustomerViewModel.GatewayCustomerID).subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
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

    }

    public loadScripts() {
        // You can load multiple scripts by just providing the key as argument into load method of the service
        this._dynamicScriptLoader.load('stripejs', 'stripeterminaljs').then(data => {
            // Script Loaded Successfully
        }).catch(error => console.log(error));
    }

    roundValue(value: any) {
        return this._taxCaluclationService.getRoundValue(value);
    }

    // get input validtaion
    RequiredCustomerAddress(isAddressRequired: boolean) {
        this.isRequiredCustomerAddress = isAddressRequired;
    }
    // #endregion
}

