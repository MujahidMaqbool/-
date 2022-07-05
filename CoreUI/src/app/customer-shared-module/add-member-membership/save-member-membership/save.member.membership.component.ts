/********************** Angular References *********************/
import { Component, OnInit, Input, ViewChild, OnDestroy, ChangeDetectorRef, AfterViewChecked, Output, EventEmitter } from '@angular/core';
import { NgForm } from "@angular/forms";
import { SubscriptionLike as ISubscription, SubscriptionLike } from "rxjs";
/********************** Services & Models *********************/
/* Models */

/* Services */
import { HttpService } from '@services/app.http.service';
import { DataSharingService } from '@services/data.sharing.service';
import { MessageService } from '@services/app.message.service';
import { DateTimeService } from "@services/date.time.service";
/********************** Common & Customs *********************/
import { MembershipPaymentType, ENU_PaymentGateway, EnumSaleType, ENU_Package, ENU_DateFormatName, AddressType } from "@helper/config/app.enums";
/**********************Component*********************/

/********************** Congigurations *********************/
import { Configurations } from '@helper/config/app.config';
import { Messages } from "@app/helper/config/app.messages";
import { MemberMembershipApi } from "@app/helper/config/app.webapi";
import { ApiResponse, CustomerAddress } from "@app/models/common.model";
import { DynamicScriptLoaderService } from '@app/services/dynamic.script.loader.service';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { AddStripeCustomerComponent } from '@app/gateway/stripe/add.stripe.customer.component';
import { AddGoCardlessCustomerComponent } from '@app/gateway/gocardless/add.gocardless.customer.component';
import { StripeACHComponent } from '@app/gateway/stripe-ach/stripe.ach.component';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { StripeDD } from '@app/customer/member/models/member.gateways.model';
import { MembershipsFundamentals, MembershipPaymentPlan, GetMemberMembershipPlan, MembershipPaymentPlanDetail } from '@app/customer/member/models/member.membership.model';
import { PaymentGateway } from '@app/customer/member/models/member.membership.payments.model';
import { PayTabsCustomerComponent } from '@app/gateway/pay-tabs/paytabs.customer.component';



@Component({
    selector: 'save-member-memberhsip',
    templateUrl: './save.member.membership.component.html'
})


export class SaveMemberMembershipComponent extends AbstractGenericComponent implements OnInit, AfterViewChecked, OnDestroy {
    // #region Local Members
    @ViewChild("stripeRef") stripeRef: AddStripeCustomerComponent;
    @ViewChild("goCardlessRef") goCardlessRef: AddGoCardlessCustomerComponent;
    @ViewChild("stripeACHRef") stripeACHRef: StripeACHComponent;
    @ViewChild("paytabsRef") paytabsRef: PayTabsCustomerComponent;
    @ViewChild('memberMembershipForm') memberMembershipForm: NgForm;
    @Input() showValidation: boolean;
    @Input() CustomerAddress: CustomerAddress[];
    @Output() onChangeMemberShip = new EventEmitter<number>();
    @Output() isRequiredAddress = new EventEmitter<boolean>();
    @Output() countrySchema = new EventEmitter<string>();
    @Input() isPopup: boolean = false;

    /* Local Members */
    AllowTermsandConditions: boolean = true;
    customerId: number = 0;
    membershipId: number;
    selectedMembershipId: number;
    oldMembershipId: number;
    isNewMembership: boolean = true;
    today: Date = new Date();
    minStartDate: Date = new Date();
    minCollectionDate: Date = new Date();
    startDate: Date = new Date();
    hasPayments: boolean;
    hasMemberships: boolean = true;
    selectedGatewayId: number;
    saleTypeId: number;
    showProcessingDaysMessage: boolean;
    isTermAgreed: boolean = false;

    showGoCardless: boolean;
    showStripe: boolean;
    showStripeACH: boolean;
    showPayTabs: boolean;
    customerAddress: any;
    BranchDefaultRewardProgramVM:any;

    isPurchaseRestrictionAllowed :boolean = false;
    /* Messages */
    messages = Messages;

    /* Collection And Models */
    allMembershipList: MembershipsFundamentals[] = [];
    membershipList: MembershipsFundamentals[] = [];
    oldMembershipList: MembershipsFundamentals[] = [];
    paymentGatewayList: PaymentGateway[] = [];
    paymentPlanList: MembershipPaymentPlan[] = [];
    stripeDD: StripeDD;

    oldMembership: MembershipsFundamentals;
    membershipListObj: MembershipsFundamentals = new MembershipsFundamentals();
    selectedGateway: PaymentGateway = new PaymentGateway();
    addressTypes = AddressType;

    customerIdSubscription: ISubscription;
    memberMembershipIdSubscription: ISubscription;
    packageIdSubscription: SubscriptionLike;
   countryIDIdSubscription: SubscriptionLike;
    /* Configurations */

    membershipPaymentType = MembershipPaymentType;
    paymentGateway = ENU_PaymentGateway;
    saleType = EnumSaleType
    dateFormatSave = Configurations.DateFormatForSave;
    package = ENU_Package;
    dayViewFormat: string = "";
    hasMembershipslist: boolean;
    isRequiredCustomerAddressForACH: boolean = false;
    paymentGateWayID: number;
    countryID: number;
    _CountrySchema: string;
    @Output() selectedPaymentGateWay = new EventEmitter();

    /* Constructor */
    constructor(public _memberMembershipService: HttpService,
        public _messageService: MessageService,
        public _dateTimeService: DateTimeService,
        public _dataSharingService: DataSharingService,
        public _dynamicScriptLoader: DynamicScriptLoaderService,
        public _cdr: ChangeDetectorRef,
        public _dialog: MatDialogService) {
        super();
        this.stripeDD = new StripeDD();
        this.getBranchDatePattern();
    }

    // #region Events
    ngOnInit() {
      this.countryIDIdSubscription =  this._dataSharingService.countryID.subscribe((countryID) => {
            this.countryID = countryID;
        });
    }

    ngAfterViewChecked() {
        this._cdr.detectChanges();
    }
    async getBranchDatePattern() {
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);

        this.loadScripts();

        //---- set date according to branch timezone. ignore browser datetime, get only branch datetime Added by Fahad--////
        this.minCollectionDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.startDate = this.minCollectionDate;
        this.minStartDate = this.minCollectionDate;
        this.minCollectionDate.setHours(0, 0, 0, 0);

        this.customerIdSubscription = this._dataSharingService.customerID.subscribe((customerId: number) => {
            this.customerId = customerId;
        });

        this.memberMembershipIdSubscription = this._dataSharingService.memberMembershipID.subscribe((membershipId: number) => {
            this.membershipId = membershipId;
        });
        this.getFundamentals();

        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPermissions(packageId);
            }
        });

    }

    ngOnDestroy() {
        this.customerIdSubscription.unsubscribe();
        this.memberMembershipIdSubscription.unsubscribe();
        this.countryIDIdSubscription.unsubscribe();
        this._dataSharingService.shareMemberMembershipID(0);
    }

    onMembershipChange() {
        var result = this.membershipList.find(i => i.MembershipID == this.selectedMembershipId);
        this.membershipListObj = this.membershipList.find(i => i.MembershipID == this.selectedMembershipId);

        if (result.IsMembershipLimitReached) {
            this.showMemberShipLimitWarningMessage();
        }

        this.onChangeMemberShip.emit(result.MembershipID);

        this.getPaymentPlan();

    }

    onOldMembershipChange(oldMembership: MembershipsFundamentals) {

        this.oldMembershipId = oldMembership.CustomerMembershipID;

        this.membershipList = JSON.parse(JSON.stringify(this.allMembershipList));

    }

    onRenewalTypeChange(isNewMembership: boolean) {

        this.membershipList = JSON.parse(JSON.stringify(this.allMembershipList));

    }

    onPriceChange(index) {
        setTimeout(() => {
            if (this.paymentPlanList[index].Price && this.paymentPlanList[index].Price.toString().length > 7) {
                this.paymentPlanList[index].Price = Number(this.paymentPlanList[index].Price.toString().substring(0, 7));
            }
        }, 100);
    }

    onGatewayChange() {
        this.selectedGateway = this.paymentGatewayList.find(g => g.PaymentGatewayID === this.selectedGatewayId);
        this.paymentGateWayID = this.selectedGateway.PaymentGatewayID;
        this.showProcessingDaysMessage = this.selectedGateway.PaymentProcessingDays && this.selectedGateway.PaymentProcessingDays > 0 ? true : false;
        if (((this.selectedGateway.PaymentGatewayID == this.paymentGateway.GoCardless && this.countryID == 2) || this.selectedGateway.PaymentGatewayID == this.paymentGateway.PayTabs) && this.CustomerAddress != undefined) {
            this.isRequiredCustomerAddressForACH = this.checkCustomerAddress(this.selectedGateway.PaymentGatewayID);
            this.isRequiredAddress.emit(this.isRequiredCustomerAddressForACH);
        } else {
            this.isRequiredCustomerAddressForACH = false;
            this.isRequiredAddress.emit(false);
        }
        this.resetMinCollectionDate();
        this.setPaymentType();
    }

    // check if customer add is exist for new member
    checkCustomerAddress(gatewayID: number) {
        let isExist = true;
        let homeAddress: CustomerAddress = this.CustomerAddress.find((address) => address.AddressTypeID === this.addressTypes.HomeAddress);
        let billingAddress: CustomerAddress = this.CustomerAddress.find((address) => address.AddressTypeID === this.addressTypes.BillingAddress);
        let shippingAddress: CustomerAddress = this.CustomerAddress.find((address) => address.AddressTypeID === this.addressTypes.ShippingAddress);
        if (gatewayID == this.paymentGateway.GoCardless) {
            if (billingAddress.CountryID == 2 && billingAddress.StateCountyName != "" && (billingAddress.StateCountyCode != undefined || billingAddress.StateCountyCode != "") && billingAddress.Address1 && billingAddress.CityName && billingAddress.PostalCode != "") {
                isExist = false;
            } else if (homeAddress.CountryID == 2 && homeAddress.StateCountyName != "" && (homeAddress.StateCountyCode != undefined || homeAddress.StateCountyCode != "") && homeAddress.Address1 && homeAddress.CityName && homeAddress.PostalCode != "") {
                isExist = false;
            } else if (shippingAddress.CountryID == 2 && shippingAddress.StateCountyName != "" && (shippingAddress.StateCountyName != undefined || shippingAddress.StateCountyCode != "") && shippingAddress.Address1 && shippingAddress.CityName && shippingAddress.PostalCode != "") {
                isExist = false;
            } else {
                isExist = true;
            }
        } else {
            if (billingAddress.CountryID && billingAddress.StateCountyName && billingAddress.Address1 && billingAddress.CityName) {
                isExist = false;
            } else if (homeAddress.CountryID && homeAddress.StateCountyName && homeAddress.Address1 && homeAddress.CityName) {
                isExist = false;
            } else if (shippingAddress.CountryID && shippingAddress.StateCountyName && shippingAddress.Address1 && shippingAddress.CityName) {
                isExist = false;
            } else {
                isExist = true;
            }
        }

        return isExist;
    }

    onMembershipDateChange(date: any) {
        setTimeout(() => {
            this.startDate = date;
        });
    }

    onkeyPress(event: any) {
        const pattern = /[0-9]/;
        let inputChar = String.fromCharCode(event.charCode);
        if (event.keyCode != 8 && !pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    isNumber(evt) {
        evt = (evt) ? evt : window.event;
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    // #endregion

    // #region Method

    setPermissions(packageID: number) {
        switch (packageID) {
            case this.package.WellnessTop:
            case this.package.Full:
                this.AllowTermsandConditions = false;
                this.isTermAgreed = true;
                this.isPurchaseRestrictionAllowed = true;
                break;
        }
    }

    setPaymentType() {
        this.showGoCardless = false;
        this.showStripe = false;
        this.showStripeACH = false;
        this.showPayTabs = false;
        switch (this.selectedGatewayId) {
            case this.paymentGateway.Cash:
                this.saleTypeId = this.saleType.Cash;
                break;
            case this.paymentGateway.Stripe_Card:
                this.showStripe = true;
                this.saleTypeId = this.saleType.Card;
                break;
            case this.paymentGateway.PayTabs:
                this.showPayTabs = true;
                this.saleTypeId = this.saleType.Card;
                break;
            case this.paymentGateway.GoCardless:
                this.showGoCardless = true;
                this.saleTypeId = this.saleType.DirectDebit;
                this.addProcessingDays();
                break;
            case this.paymentGateway.Stripe_DD:
                this.showStripeACH = true;
                this.saleTypeId = this.saleType.StripeTerminal;
                this.addProcessingDays();
                break;
            // case this.paymentGateway.Stripe_ACH:
            //     this.showStripeACH = true;
            //     this.saleTypeId = this.saleType.StripeTerminal;
            //     break;
        }
    }

    getFundamentals() {
        let params = {
            CustomerID: this.customerId
        }

        this._memberMembershipService.get(MemberMembershipApi.getMemberMembershipFundamentals, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result) {
                        this.allMembershipList = response.Result.MembershipWithPaymentPlanList ? response.Result.MembershipWithPaymentPlanList : [];
                        this.membershipList = response.Result.MembershipWithPaymentPlanList ? response.Result.MembershipWithPaymentPlanList : [];
                        this.hasMembershipslist = response.Result.MembershipWithPaymentPlanList &&
                            response.Result.MembershipWithPaymentPlanList.length > 0 ? false : true;
                            this._dataSharingService.shareBranchDefaultRewardProgram(response.Result.BranchDefaultRewardProgramVM);
                        // if(this.hasMembershipslist){
                        //     this._messageService.showErrorMessage(this.messages.Generic_Messages.No_Membership_available);
                        // }
                          this.BranchDefaultRewardProgramVM = response.Result.BranchDefaultRewardProgramVM;
                        if (this.membershipList && this.membershipList.length > 0)
                            this.onChangeMemberShip.emit(this.membershipList[0].MembershipID);

                        this.oldMembershipList = response.Result.ExistingMembershipList ? response.Result.ExistingMembershipList : [];
                        this.paymentGatewayList = response.Result.BranchPaymentGatewayList ? response.Result.BranchPaymentGatewayList : [];
                        // this.sepaCountryList = response.Result.SepaEnabledCountries ? response.Result.SepaEnabledCountries : [];
                        // this._dataSharingService.shareSEPACountryList(this.sepaCountryList);
                        // //Temprary Add Stripe ACH
                        // let paymentGateway = new PaymentGateway();
                        // paymentGateway.PaymentGatewayID = 6;
                        // paymentGateway.PaymentGatewayName = "Stripe ACH";
                        // this.paymentGatewayList.push(paymentGateway);
                        this.hasMemberships = this.membershipList.length > 0 ? true : false;
                        this.setDefaultDropdowns();
                    }
                    else {
                        this.hasMemberships = false;
                        this._messageService.showErrorMessage(this.messages.Generic_Messages.No_Membership_Found);
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }

            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
            );
    }



    getPaymentPlan() {
        this.paymentPlanList = JSON.parse(JSON.stringify(this.allMembershipList.find(m => m.MembershipID === this.selectedMembershipId).MembershipPaymentPlanList));
        this.hasPayments = this.paymentPlanList && this.paymentPlanList.length > 0 ? true : false;

        if (this.hasMemberships) {
            this.setDefaultCollectionDate();
        }
    }

    setDefaultCollectionDate() {
        // let today = minDate;
        // today.setHours(0,0,0,0);
        this.paymentPlanList.forEach(payment => {
            payment.CollectionDate = this.minCollectionDate;
            payment.SkipProRata = false;
        })
    }

    setDefaultDropdowns() {
        this.selectedGatewayId = this.paymentGateway.Cash;

        if (this.oldMembershipList && this.oldMembershipList.length > 0) {
            this.oldMembership = this.oldMembershipList[0];
            this.oldMembershipId = this.oldMembership.CustomerMembershipID;

            if (!this.isNewMembership) {
                this.membershipList = this.allMembershipList.filter(m => !this.oldMembershipList.some(oldM => oldM.MembershipID == m.MembershipID));
            }
        }

        if (this.membershipId && this.membershipId > 0) {
            let memberhsip = this.membershipList.filter(m => m.MembershipID === this.membershipId)[0];
            if (memberhsip) {
                this.selectedMembershipId = memberhsip.MembershipID;
                if (memberhsip.IsMembershipLimitReached) { this.showMemberShipLimitWarningMessage(); }
            }
            else {
                this.selectedMembershipId = this.membershipList[0].MembershipID;

                if (this.membershipList[0].IsMembershipLimitReached) { this.showMemberShipLimitWarningMessage(); }
            }
        }
        else {
            this.selectedMembershipId = this.membershipList[0].MembershipID;
            if (this.membershipList[0].IsMembershipLimitReached) { this.showMemberShipLimitWarningMessage(); }
        }

        this.membershipListObj = this.membershipList.find(i => i.MembershipID == this.selectedMembershipId);

        this.setPaymentType();
        this.getPaymentPlan();
    }

    getMemberMembershipModel(): GetMemberMembershipPlan {
        let getMembershipPlanModel = new GetMemberMembershipPlan();
        getMembershipPlanModel.MembershipID = this.selectedMembershipId;
        getMembershipPlanModel.StartDate = this._dateTimeService.convertDateObjToString(this.startDate, this.dateFormatSave);
        //getMembershipPlanModel.StartDate = this.startDate;
        getMembershipPlanModel.MembershipPaymentPlanDetailList = [];
        if (this.hasPayments) {
            this.paymentPlanList.forEach(payment => {
                let paymentPlanDetail = new MembershipPaymentPlanDetail();
                paymentPlanDetail.MembershipPaymentID = payment.MembershipPaymentID;
                paymentPlanDetail.MembershipPaymentTypeID = payment.MembershipPaymentTypeID;
                paymentPlanDetail.MembershipPaymentName = payment.MembershipPaymentName;
                paymentPlanDetail.Price = payment.Price;
                paymentPlanDetail.CollectionDate = this._dateTimeService.convertDateObjToString(payment.CollectionDate, this.dateFormatSave);
                paymentPlanDetail.SkipProRata = payment.SkipProRata;

                getMembershipPlanModel.MembershipPaymentPlanDetailList.push(paymentPlanDetail);
            })
        }

        return getMembershipPlanModel;
    }

    getStripeDDAccountDetail(): StripeDD {
        let getStripeDDModel = new StripeDD();
        getStripeDDModel = this.stripeACHRef && this.stripeACHRef.stripeDD != undefined ? this.stripeACHRef.stripeDD : getStripeDDModel;
        return getStripeDDModel;
    }

    async addProcessingDays() {
        //---- set date according to branch timezone. ignore browser datetime, get only branch datetime Added by Fahad--////
        var branchCurrentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.minCollectionDate = this._dateTimeService.addWorkDays(branchCurrentDate, this.selectedGateway.PaymentProcessingDays);
        this.minCollectionDate.setHours(0, 0, 0, 0);
    }

    async resetMinCollectionDate() {
        //---- set date according to branch timezone. ignore browser datetime, get only branch datetime Added by Fahad--////
        this.minCollectionDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.minCollectionDate.setHours(0, 0, 0, 0);
    }

    showMemberShipLimitWarningMessage() {
        this._messageService.showWarningMessage(this.messages.Confirmation.Member_Limit_Has_Reached_Are_You_Sure_You_Want_To_Continue);
    }

    private loadScripts() {
        // You can load multiple scripts by just providing the key as argument into load method of the service
        this._dynamicScriptLoader.load('stripejs', 'paytabsjs').then(data => {
            // stripe = Stripe('pk_test_vzkoTBnZPa9gSvbuSzZbIgXH', 'acct_1DoqMYIuCqZ95Hms');
            // setTimeout(() => {
            //   this.mapStripeConfiguration();

            // }, 100);
            // Script Loaded Successfully
        }).catch(error => console.log(error));
    }

    CountrySchema(countrySchema: string) {
        this._CountrySchema =countrySchema;
    }

    selectedPaymentGateWayID(paymentGateWayID : number){
        this.selectedPaymentGateWay.emit(paymentGateWayID);
    }

}
