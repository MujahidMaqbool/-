/*********** Angular **********/
import { Component, OnInit } from '@angular/core';
import { SubscriptionLike as ISubscription } from "rxjs";
import { SubscriptionLike } from 'rxjs';
/*********** Configurations **********/
import { ConfigurationsApi, CustomerApi } from '@app/helper/config/app.webapi';
import { Configurations } from '@app/helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { ENU_DateFormatName, ENU_CancelItemType, ENU_CancellationPolicy, ENU_Package } from '@app/helper/config/app.enums';
import { Location } from '@angular/common';
/*********** Components **********/
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';

/*********** Models **********/
import { CancellationPolicy, ClassCancellationPolicy, ServiceCancellationPolicy, ClassServiceResetBy } from '@app/setup/models/CancellationPolicy.model';
import { ApiResponse, DD_Branch } from '@app/models/common.model';

/*********** Services **********/
import { DataSharingService } from '@app/services/data.sharing.service';
import { MessageService } from '@app/services/app.message.service';
import { HttpService } from '@app/services/app.http.service';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { ConfirmResetCountComponent } from '@app/customer-shared-module/confirm-reset-count/confirm.reset.count.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';


@Component({
  selector: 'app-cancelllation-policy',
  templateUrl: './cancelllation-policy.component.html',
})
export class CancelllationPolicyComponent extends AbstractGenericComponent implements OnInit {


  // Configurations
  classCancellationRescheduleRule = Configurations.ClassCancellationRescheduleRule;
  serviceCancellationRescheduleRule = Configurations.ServiceCancellationRescheduleRule;
  cancellationPolicyRescheduleLimit = Configurations.CancellationPolicyRescheduleLimit;
  allowedNumberKeysWithOutDecimal = Configurations.AllowedNumberKeysForClassBooking;
  AllowedNumberKeys = Configurations.AllowedNumberKeys;
  eNUCancelBookingType = ENU_CancelItemType;
  eNU_CancellationPolicy = ENU_CancellationPolicy;
  messages = Messages;

  // Object and list
  cancellationPolicy: CancellationPolicy = new CancellationPolicy;
  copyCancellationPolicyObj: CancellationPolicy = new CancellationPolicy;
  ResetByObj: ClassServiceResetBy = new ClassServiceResetBy();

  /* Enum */
  package = ENU_Package;

  /* Subsctiptions */
  packageIdSubscription: ISubscription;

  /* Local Permissions*/
  currencyFormat: string;
  hasClassCancellationPolicy:boolean = false;
  hasClassReschedulePolicy:boolean = false;
  hasClassLateCancellationPolicy:boolean = false;
  hasClassAutomaticRefund:boolean =false;
  hasClassNoShowPolicy:boolean = false;
  hasClassBlockCustomer:boolean = false;

  hasServiceCancellationPolicy:boolean = false;
  hasMembershipCancellationPolicy:boolean = false;

  hasServiceReschedulePolicy:boolean = false;
  hasServiceLateCancellationPolicy:boolean = false;
  hasServiceAutomaticRefund:boolean =false;
  hasServiceNoShowPolicy:boolean = false;
  hasServiceBlockCustomer:boolean = false;

  // Local Member
  defaultPercentageValue: number = 100;
  defaultflatValue: number = 0.00;
  dateTimeFormat: string = "";
  dateFormat: string = "MMM d, yyyy";
  timeFormat: string = "";
  showValidError: boolean;
  showError: boolean;
  validationText: string;
  isValid: boolean;
  isTimeDurationValidation: boolean;
  isTimeDuration: boolean;
  validationError: string;
  isPercentageValidation: boolean;
  isTimeDurationForSchedule: boolean;

  constructor(private _httpService: HttpService,
    private _messageService: MessageService,
    private _dialog: MatDialogService,
    private _dataSharingService: DataSharingService, private rewriteUrl: Location) {
    super();
  }

  ngOnInit(): void {
    this.checkPackagePermissions();
    this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleEndsBefore = 0;
    //rewrite the url state
    this.rewriteUrl.replaceState("/setup/configurations/cancellation-policy");
    this.getCurrentBranchDetail();
    this.getCancellationPolicy();

  }

 

  //#Check Package Permission
  checkPackagePermissions() {
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
      if (packageId && packageId > 0) {
        this.setPackagePermissions(packageId);
      }
    })
  }

  setPackagePermissions(packageId: number) {

    switch (packageId) {
      case this.package.WellnessBasic:
        this.hasServiceCancellationPolicy = true;
        break;
      case this.package.WellnessMedium:
        this.hasServiceCancellationPolicy = true;
        this.hasServiceReschedulePolicy = true;
        break;
      case this.package.WellnessTop:
        this.hasServiceCancellationPolicy = true;
        this.hasServiceReschedulePolicy = true;
        break;
      case this.package.FitnessBasic:
        this.hasClassCancellationPolicy = true;
        break;
      case this.package.FitnessMedium:
        this.hasClassCancellationPolicy = true;
        this.hasClassReschedulePolicy = true;
        break;
      case this.package.Full:
        this.hasClassCancellationPolicy = true;
        this.hasClassReschedulePolicy = true;
        this.hasClassLateCancellationPolicy = true;
        this.hasClassAutomaticRefund = true;
        this.hasClassNoShowPolicy = true;
        this.hasClassBlockCustomer = true;
        this.hasMembershipCancellationPolicy = true;
        this.hasServiceCancellationPolicy = true;
        this.hasServiceReschedulePolicy = true;
        this.hasServiceLateCancellationPolicy = true;
        this.hasServiceAutomaticRefund = true;
        this.hasServiceNoShowPolicy = true;
        this.hasServiceBlockCustomer = true;
        break;
    }
  }


  //get current branch time format
  async getCurrentBranchDetail() {
    // will display xd date format discussed with iqra
    //this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerTooltipDateFormat);
    this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
    this.dateTimeFormat = this.dateFormat + " | " + this.timeFormat;
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.CurrencySymbol;
    }
  }

  // set default dropDrown values
  setDefaultDropDownValues() {
    // class cancellation defualt values
    this.cancellationPolicy.classCancellationPolicy.ClassRescheduleEndsBeforeDurationType = this.cancellationPolicy.classCancellationPolicy.ClassRescheduleEndsBeforeDurationType ? this.cancellationPolicy.classCancellationPolicy.ClassRescheduleEndsBeforeDurationType : this.cancellationPolicy.DurationTypeList[0].DurationTypeID;
    this.cancellationPolicy.classCancellationPolicy.ClassRescheduleRule = this.cancellationPolicy.classCancellationPolicy.ClassRescheduleRule ? this.cancellationPolicy.classCancellationPolicy.ClassRescheduleRule : this.classCancellationRescheduleRule[0].value;
    this.cancellationPolicy.classCancellationPolicy.ClassRescheduleLimit = this.cancellationPolicy.classCancellationPolicy.ClassRescheduleLimit ? this.cancellationPolicy.classCancellationPolicy.ClassRescheduleLimit : this.cancellationPolicyRescheduleLimit[0].value;
    this.cancellationPolicy.classCancellationPolicy.ClassRescheduleEndsBefore = this.cancellationPolicy.classCancellationPolicy.ClassRescheduleEndsBefore ? this.cancellationPolicy.classCancellationPolicy.ClassRescheduleEndsBefore : 0;
    this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateFlatFee = this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateFlatFee ? true : false;

    this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeMember = this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeMember ? this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeMember : this.defaultflatValue;
    this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeClientLead = this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeClientLead ? this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeClientLead : this.defaultflatValue;
    this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeClientLead = this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeClientLead ? this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeClientLead : this.defaultflatValue;
    this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeMember = this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeMember ? this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeMember : this.defaultflatValue;

    this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterClientLead = this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterClientLead ? this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterClientLead : 1;
    this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterMember = this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterMember ? this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterMember : 1;
    this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterClientLead = this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterClientLead ? this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterClientLead : 1;
    this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterMember = this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterMember ? this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterMember : 1;

    if (this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeInstantly || this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeInstantly == undefined) {
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeInstantly = true;
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeLater = false;
    } else {
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeInstantly = false;
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeLater = true;
    }


    // service cancellation defualt values
    this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleEndsBeforeDurationType = this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleEndsBeforeDurationType ? this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleEndsBeforeDurationType : this.cancellationPolicy.DurationTypeList[0].DurationTypeID;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleRule = this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleRule ? this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleRule : this.serviceCancellationRescheduleRule[0].value;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleLimit = this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleLimit ? this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleLimit : this.cancellationPolicyRescheduleLimit[0].value;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationEarlyEndsBeforeDurationType = this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationEarlyEndsBeforeDurationType ? this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationEarlyEndsBeforeDurationType : this.cancellationPolicy.DurationTypeList[0].DurationTypeID;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeClientLead = this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeClientLead ? this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeClientLead : this.defaultflatValue;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeMember = this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeMember ? this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeMember : this.defaultflatValue;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeClientLead = this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeClientLead ? this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeClientLead : this.defaultflatValue;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeMember = this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeMember ? this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeMember : this.defaultflatValue;
    this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLateFlatFee = this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLateFlatFee ? true : false;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleEndsBefore = this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleEndsBefore ? this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleEndsBefore : 0;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationEarlyEndsBefore = this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationEarlyEndsBefore ? this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationEarlyEndsBefore : 0;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterClientLead = this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterClientLead ? this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterClientLead : 1;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterMember = this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterMember ? this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterMember : 1;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterClientLead = this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterClientLead ? this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterClientLead : 1;
    this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterMember = this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterMember ? this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterMember : 1;

    // this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeClientLead = this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeClientLead ? this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeClientLead : this.defaultPercentageValue;
    // this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeMember = this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeMember ? this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeMember : this.defaultPercentageValue;
    // this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeClientLead = this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeClientLead ? this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeClientLead : this.defaultPercentageValue;
    // this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeMember = this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeMember ? this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeMember : this.defaultPercentageValue;

    this.cancellationPolicy.serviceCancellationPolicy.IsServiceNoShowFlatFee = this.cancellationPolicy.serviceCancellationPolicy.IsServiceNoShowFlatFee ? true : false;
    if (this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLatePaymentChargeInstantly || this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLatePaymentChargeInstantly == undefined) {
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLatePaymentChargeInstantly = true;
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLatePaymentChargeLater = false;
    } else {
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLatePaymentChargeInstantly = false;
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLatePaymentChargeLater = true;
    }

  }

  // Get class cancellation policy
  getCancellationPolicy() {
    this._httpService.get(ConfigurationsApi.getCancellationPolicySettingDetail)
      .subscribe((res: ApiResponse) => {
        if (res.MessageCode > 0 && res.Result) {
          this.cancellationPolicy.classCancellationPolicy = res.Result.ClassCancellationPolicy;
          this.cancellationPolicy.serviceCancellationPolicy = res.Result.ServiceCancellationPolicy;
          this.cancellationPolicy.DurationTypeList = res.Result.DurationTypeList;
          this.cancellationPolicy.membershipCancellationPolicy = res.Result.MembershipCancellationPolicy;
          this.ResetByObj.ClassResetBy = res.Result.ClassCancellationPolicy.ClassCancellationLateAndNoShowCountResetBy;
          this.ResetByObj.ClassResetDate = res.Result.ClassCancellationPolicy.ClassCancellationLateAndNoShowCountResetOn;
          this.ResetByObj.ServiceResetBy = res.Result.ServiceCancellationPolicy.ServiceCancellationLateAndNoShowCountResetBy;
          this.ResetByObj.ServiceResetDate = res.Result.ServiceCancellationPolicy.ServiceCancellationLateAndNoShowCountResetOn;
          
          //this.cancellationPolicy.classServiceResetBy = res.Result.ClassServiceResetBy;
          // take copy of origional object for reset form
          this.copyCancellationPolicyObj.classCancellationPolicy = Object.assign({}, this.cancellationPolicy.classCancellationPolicy);
          this.copyCancellationPolicyObj.serviceCancellationPolicy = Object.assign({}, this.cancellationPolicy.serviceCancellationPolicy);
          this.copyCancellationPolicyObj.membershipCancellationPolicy = Object.assign({}, this.cancellationPolicy.membershipCancellationPolicy);
          this.setDefaultDropDownValues();
        } else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      });
  }

  setFlatFeeModel() {
    this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeClientLead = this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeClientLead.toString() != "" ? this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeClientLead : 0
    this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeMember = this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeMember.toString() != "" ? this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeMember : 0
    this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeClientLead = this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeClientLead.toString() != "" ? this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeClientLead : 0
    this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeMember = this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeMember.toString() != "" ? this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeMember : 0

    this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeClientLead = this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeClientLead.toString() != "" ? this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeClientLead : 0
    this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeMember = this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeMember.toString() != "" ? this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeMember : 0
    this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeClientLead = this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeClientLead.toString() != "" ? this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeClientLead : 0
    this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeMember = this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeMember.toString() != "" ? this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeMember : 0
  }

  // Save cancellation policy
  onSaveCancellationPolicy() {
    if (!this.isSaved()) {
      this.setFlatFeeModel();
      this._httpService.save(ConfigurationsApi.saveCancellationPolicySetting, this.cancellationPolicy)
        .subscribe((res: ApiResponse) => {
          if (res.MessageCode > 0) {
            this._messageService.showSuccessMessage(this.messages.Success.Cancellation_Policy_save);
            this.getCancellationPolicy();
          } else {
            this._messageService.showErrorMessage(res.MessageText);
          }
        });
    }

  }

  isSaved() {
    // class validation
    if (this.cancellationPolicy.classCancellationPolicy.ClassNoShowPercentageFeeClientLead.toString() == "" || this.cancellationPolicy.classCancellationPolicy.ClassNoShowPercentageFeeClientLead > 100) {
      this.validationText = this.messages.Error.Please_Set_The_Minimum_PercentageBetween;
      this.showError = true;
    } else if (this.cancellationPolicy.classCancellationPolicy.ClassNoShowPercentageFeeMember.toString() == "" || this.cancellationPolicy.classCancellationPolicy.ClassNoShowPercentageFeeMember > 100) {
      this.validationText = this.messages.Error.Please_Set_The_Minimum_PercentageBetween;
      this.showError = true;
    }
    else if (this.cancellationPolicy.classCancellationPolicy.ClassCancellationLatePercentageFeeClientLead.toString() == "" || this.cancellationPolicy.classCancellationPolicy.ClassCancellationLatePercentageFeeClientLead > 100) {
      this.validationText = this.messages.Error.Please_Set_The_Minimum_PercentageBetween;
      this.showError = true;
    }
    else if (this.cancellationPolicy.classCancellationPolicy.ClassCancellationLatePercentageFeeMember.toString() == "" || this.cancellationPolicy.classCancellationPolicy.ClassCancellationLatePercentageFeeMember > 100) {
      this.validationText = this.messages.Error.Please_Set_The_Minimum_PercentageBetween;
      this.showError = true;
    }
    else if (this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterClientLead.toString() == "" || this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterClientLead.toString() == "0") {
      this.validationText = this.messages.Error.ValueMustBeGreatThenZero;
      this.showError = true;
    }
    else if (this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterMember.toString() == "" || this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterMember.toString() == "0") {
      this.validationText = this.messages.Error.ValueMustBeGreatThenZero;
      this.showError = true;
    }
    else if (this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterClientLead.toString() == "" || this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterClientLead.toString() == "0") {
      this.validationText = this.messages.Error.ValueMustBeGreatThenZero;
      this.showError = true;
    }
    else if (this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterMember.toString() == "" || this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterMember.toString() == "0") {
      this.validationText = this.messages.Error.ValueMustBeGreatThenZero;
      this.showError = true;
    }
    else
      if (this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeClientLead.toString() == "" || this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeClientLead > 100) {
        this.validationText = this.messages.Error.Please_Set_The_Minimum_PercentageBetween;
        this.showError = true;
      } else if (this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeMember.toString() == "" || this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeMember > 100) {
        this.validationText = this.messages.Error.Please_Set_The_Minimum_PercentageBetween;
        this.showError = true;
      }
      else if (this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeClientLead.toString() == "" || this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeClientLead > 100) {
        this.validationText = this.messages.Error.Please_Set_The_Minimum_PercentageBetween;
        this.showError = true;
      }
      else if (this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeMember.toString() == "" || this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeMember > 100) {
        this.validationText = this.messages.Error.Please_Set_The_Minimum_PercentageBetween;
        this.showError = true;
      }
      else if (this.cancellationPolicy.classCancellationPolicy.ClassRescheduleEndsBefore.toString() == "") {
        this.validationText = this.messages.Error.FillRequiredInfo;
        this.showError = true;
      } else if (this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleEndsBefore.toString() == "") {
        this.validationText = this.messages.Error.FillRequiredInfo;
        this.showError = true;
      }
      else if (this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationEarlyEndsBefore.toString() == "") {
        this.validationText = this.messages.Error.ValueMustBeGreatThenZero;
        this.showError = true;
      }
      else if (this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterClientLead.toString() == "" || this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterClientLead.toString() == "0") {
        this.validationText = this.messages.Error.ValueMustBeGreatThenZero;
        this.showError = true;
      }
      else if (this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterMember.toString() == "" || this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterMember.toString() == "0") {
        this.validationText = this.messages.Error.ValueMustBeGreatThenZero;
        this.showError = true;
      }
      else if (this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterClientLead.toString() == "" || this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterClientLead.toString() == "0") {
        this.validationText = this.messages.Error.ValueMustBeGreatThenZero;
        this.showError = true;
      }
      else if (this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterMember.toString() == "" || this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterMember.toString() == "0") {
        this.validationText = this.messages.Error.ValueMustBeGreatThenZero;
        this.showError = true;
      }
      else {
        this.showError = false;
      }
    return this.showError;

  }

  //on change value for percentage value
  onPercentageChangeOnlyNumbers(num) {
    this.showError = num && num != "" && num <= 100 ? false : true;
    this.isPercentageValidation = this.showError ? true : false;
    if (this.showError) {
      this.validationError = this.messages.Error.Please_Set_The_Minimum_PercentageBetween;
    }
    if (!this.showError && (this.isTimeDuration || this.isTimeDurationForSchedule)) {
      this.validationError = this.isTimeDurationForSchedule ? this.messages.Error.FillRequiredInfo : this.messages.Error.ValueMustBeGreatThenZero;
      this.showError = true;
    }

  }

  //on change value for time durations
  onchangeDurationTime(num) {
    this.showError = num && num != "" && num != "0" ? false : true;
    this.isTimeDuration = this.showError ? true : false;
    if (this.showError) {
      this.validationError = this.messages.Error.ValueMustBeGreatThenZero;
    }
    if (!this.showError && (this.isPercentageValidation || this.isTimeDurationForSchedule)) {
      this.validationError = this.isPercentageValidation ? this.messages.Error.Please_Set_The_Minimum_PercentageBetween : this.messages.Error.FillRequiredInfo;
      this.showError = true;
    }
  }

  //on change value for schedule time durations
  onchangeDurationTimeForReschedule(num, type) {
    this.showError = num == "" && type == "reschedule" ? true : false;
    this.isTimeDurationForSchedule = this.showError ? true : false;
    if (this.showError) {
      this.validationError = this.messages.Error.FillRequiredInfo;
    }
    if (!this.showError && (this.isPercentageValidation || this.isTimeDuration)) {
      this.validationError = this.isPercentageValidation ? this.messages.Error.Please_Set_The_Minimum_PercentageBetween : this.messages.Error.ValueMustBeGreatThenZero;
      this.showError = true;
    }
  }

  // Reset class and service counter
  onResetClassServiceConter(itemType: number) {
    let param = {
      customerID: 0,
      itemTypeID: itemType
    }

    const _dialogRef = this._dialog.open(ConfirmResetCountComponent, {
      data: true
    });

    _dialogRef.componentInstance.confirmChanges.subscribe(isConform => {
      if (isConform) {
        this._httpService.save(CustomerApi.ResetCancellationNoShowCount, param)
          .subscribe((res: ApiResponse) => {
            if (res.MessageCode > 0) {
              if (itemType === this.eNUCancelBookingType.Class) {
                this.ResetByObj = res.Result;
              } else {
                this.ResetByObj = res.Result;
              }
              this._messageService.showSuccessMessage(this.messages.Success.Reset_Block_Alert);
            } else {
              this._messageService.showErrorMessage(res.Result.MessageText);
            }
          });
      }

    });

  }

  // Reset class  cancellation policy
  onReset() {
    this.cancellationPolicy.classCancellationPolicy = Object.assign({}, this.copyCancellationPolicyObj.classCancellationPolicy);
    this.cancellationPolicy.serviceCancellationPolicy = Object.assign({}, this.copyCancellationPolicyObj.serviceCancellationPolicy);
    this.cancellationPolicy.membershipCancellationPolicy.IsMembershipCancellationPolicyEnabled = false
    this.cancellationPolicy.membershipCancellationPolicy.IsCancelAnyTimeEnabledForWidgetAndApp = false;
    this.cancellationPolicy.membershipCancellationPolicy.IsCancelOutsideTheContractEnabledWidgetAndApp = false;
    this.showError = false;
  }

  // in this mehtod on radio button state change assigned true and false
  onChnageRadioButtonStat(value: any) {
    if (value === this.eNU_CancellationPolicy.ClassCancellationFlatFee) {
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateFlatFee = true;
      this.cancellationPolicy.classCancellationPolicy.ClassCancellationLatePercentageFeeClientLead = this.defaultPercentageValue;
      this.cancellationPolicy.classCancellationPolicy.ClassCancellationLatePercentageFeeMember = this.defaultPercentageValue;
    }
    else
      if (value === this.eNU_CancellationPolicy.ClassCancellationPercentageFee) {
        this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateFlatFee = false;
        this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeMember = this.defaultflatValue;
        this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeClientLead = this.defaultflatValue;
      }
      else if (value === this.eNU_CancellationPolicy.ClassCancellationClassNoShowFlatFee) {
        this.cancellationPolicy.classCancellationPolicy.IsClassNoShowFlatFee = true;
        this.cancellationPolicy.classCancellationPolicy.ClassNoShowPercentageFeeClientLead = this.defaultPercentageValue;
        this.cancellationPolicy.classCancellationPolicy.ClassNoShowPercentageFeeMember = this.defaultPercentageValue;
      }
      else if (value === this.eNU_CancellationPolicy.ClassCancellationClassNoShowpercentageFee) {
        this.cancellationPolicy.classCancellationPolicy.IsClassNoShowFlatFee = false;
        this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeMember = this.defaultflatValue;
        this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeClientLead = this.defaultflatValue;
      }
      else if (value === this.eNU_CancellationPolicy.ServiceCancellationLateFlatFee) {
        this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLateFlatFee = true;
        this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeClientLead = this.defaultPercentageValue;
        this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeMember = this.defaultPercentageValue;
      }
      else if (value === this.eNU_CancellationPolicy.ServiceCancellationLatePercentageFee) {
        this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLateFlatFee = false;
        this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeClientLead = this.defaultflatValue;
        this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeMember = this.defaultflatValue;
      }
      else if (value === this.eNU_CancellationPolicy.ServiceNoShowLateFlatFee) {
        this.cancellationPolicy.serviceCancellationPolicy.IsServiceNoShowFlatFee = true;
        this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeClientLead = this.defaultPercentageValue;
        this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeMember = this.defaultPercentageValue;
      }
      else if (value === this.eNU_CancellationPolicy.ServiceNoShowPercentageFee) {
        this.cancellationPolicy.serviceCancellationPolicy.IsServiceNoShowFlatFee = false;
        this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeClientLead = this.defaultflatValue;
        this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeMember = this.defaultflatValue;
      } else if (value === this.eNU_CancellationPolicy.ClassCancellationChargeInstantly) {
        this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeInstantly = true;
        this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeLater = false;
      } else if (value === this.eNU_CancellationPolicy.ClassCancellationChargeLater) {
        this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeLater = true;
        this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeInstantly = false;
      }
      else if (value === this.eNU_CancellationPolicy.ServiceCancellationLatePaymentChargeInstantly) {
        this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLatePaymentChargeInstantly = true;
        this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLatePaymentChargeLater = false;
      } else if (value === this.eNU_CancellationPolicy.ServiceCancellationLatePaymentChargeLater) {
        this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLatePaymentChargeLater = true;
        this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLatePaymentChargeInstantly = false;
      }

      this.isSaved();
  }

  // Toggle method for class and service
  isClassCancellationPolicy() {
    if (!this.cancellationPolicy.classCancellationPolicy.IsClassCancellation) {
      this.cancellationPolicy.classCancellationPolicy = new ClassCancellationPolicy();
    } else {
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellation = true;
    }
    if (!this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellation) {
      this.cancellationPolicy.serviceCancellationPolicy = new ServiceCancellationPolicy();
    } else {
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellation = true;
    }
    this.setDefaultDropDownValues();
  }

  // Reset on Class Cancellation child toggle
  isClassChildSwitchedOffReset() {

    if (!this.cancellationPolicy.classCancellationPolicy.IsClassCancellationEarly) {
      this.cancellationPolicy.classCancellationPolicy.ClassCancellationEarlyDisplayText = "";
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationEarlyBenefit = false;

    }
    if (!this.cancellationPolicy.classCancellationPolicy.IsClassReschedule) {

      this.cancellationPolicy.classCancellationPolicy.ClassRescheduleDisplayText = "";
      this.cancellationPolicy.classCancellationPolicy.ClassRescheduleEndsBefore = 0;
      this.cancellationPolicy.classCancellationPolicy.ClassRescheduleEndsBeforeDurationType = this.cancellationPolicy.DurationTypeList[0].DurationTypeID;
      this.cancellationPolicy.classCancellationPolicy.ClassRescheduleRule = this.classCancellationRescheduleRule[0].value;
      this.cancellationPolicy.classCancellationPolicy.ClassRescheduleLimit = this.cancellationPolicyRescheduleLimit[0].value;
      this.cancellationPolicy.classCancellationPolicy.IsClassRescheduleBenefit = false;

    }
    if (!this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLate) {
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateBenefit = false;
      this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateDisplayText = "";
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateFlatFee = false;
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateFee = false;

      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateFlatFee = true;
      this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeClientLead = this.defaultflatValue;
      this.cancellationPolicy.classCancellationPolicy.ClassCancellationLateFlatFeeMember = this.defaultflatValue;

      this.cancellationPolicy.classCancellationPolicy.ClassCancellationLatePercentageFeeClientLead = this.defaultPercentageValue;
      this.cancellationPolicy.classCancellationPolicy.ClassCancellationLatePercentageFeeMember = this.defaultPercentageValue;

      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeInstantly = true;
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeLater = false;

    }
    if (!this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateRefundColumn) {
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateRefundColumn = false;
    }
    if (!this.cancellationPolicy.classCancellationPolicy.IsClassNoShow) {

      this.cancellationPolicy.classCancellationPolicy.IsClassNoShowBenefit = false;
      this.cancellationPolicy.classCancellationPolicy.IsClassNoShowFee = false;
      this.cancellationPolicy.classCancellationPolicy.IsClassNoShowFlatFee = true;

      this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeClientLead = this.defaultflatValue;
      this.cancellationPolicy.classCancellationPolicy.ClassNoShowFlatFeeMember = this.defaultflatValue;
      this.cancellationPolicy.classCancellationPolicy.ClassNoShowPercentageFeeMember = this.defaultPercentageValue;
      this.cancellationPolicy.classCancellationPolicy.ClassNoShowPercentageFeeClientLead = this.defaultPercentageValue;

    }
    if (!this.cancellationPolicy.classCancellationPolicy.IsClassBlockBooking) {
      this.cancellationPolicy.classCancellationPolicy.IsClassBlockBookingAlert = false;

      this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterClientLead = 1;
      this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingCancellationAfterMember = 1;

      this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterClientLead = 1;
      this.cancellationPolicy.classCancellationPolicy.ClassBlockBookingNoShowAfterMember = 1;
    }

  }

  // Reset on service Cancellation child toggle
  isServiceChildSwitchedOffReset() {

    if (!this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationEarly) {
      this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationEarlyEndsBefore = 0;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationEarlyEndsBeforeDurationType = this.cancellationPolicy.DurationTypeList[0].DurationTypeID;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationEarlyDisplayText = "";
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationEarlyBenefit = false;

    }
    if (!this.cancellationPolicy.serviceCancellationPolicy.IsServiceReschedule) {

      this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleDisplayText = "";
      this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleEndsBefore = 0;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleEndsBeforeDurationType = this.cancellationPolicy.DurationTypeList[0].DurationTypeID;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleRule = this.serviceCancellationRescheduleRule[0].value;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceRescheduleLimit = this.cancellationPolicyRescheduleLimit[0].value;
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceRescheduleBenefit = false;

    }
    if (!this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLate) {
      this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateDisplayText = "";
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLateBenefit = false;
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLateFee = false;
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceCancellationLateFlatFee = true;

      this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeClientLead = 0;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLateFlatFeeMember = 0;

      this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeClientLead = this.defaultPercentageValue;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceCancellationLatePercentageFeeClientLead = this.defaultPercentageValue;

      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeInstantly = true;
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLatePaymentChargeLater = false;

    }
    if (!this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateRefundColumn) {
      this.cancellationPolicy.classCancellationPolicy.IsClassCancellationLateRefundColumn = false;
    }
    if (!this.cancellationPolicy.serviceCancellationPolicy.IsServiceNoShow) {

      this.cancellationPolicy.serviceCancellationPolicy.IsServiceNoShowBenefit = false;
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceNoShowFee = false;
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceNoShowFlatFee = true;

      this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeClientLead = 0;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowFlatFeeMember = 0;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeClientLead = this.defaultPercentageValue;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceNoShowPercentageFeeMember = this.defaultPercentageValue;

    }
    if (!this.cancellationPolicy.serviceCancellationPolicy.IsServiceBlockBooking) {
      this.cancellationPolicy.serviceCancellationPolicy.IsServiceBlockBookingAlert = false;

      this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterClientLead = 1;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingCancellationAfterMember = 1;

      this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterClientLead = 1;
      this.cancellationPolicy.serviceCancellationPolicy.ServiceBlockBookingNoShowAfterMember = 1;
    }

  }

  // Prevent the charactors
  preventCharacters(event: any) {
    //console.log(this.parentClassObj.ClassDurationInMinutes.toString())
    let index = this.AllowedNumberKeys.findIndex(k => k == event.key);
    if (index < 0) {
      event.preventDefault()
    }
    //this.showErrorMessage = false;
  }

  AllowNumberNumberWithDecimal(event: any) {
    //console.log(this.parentClassObj.ClassDurationInMinutes.toString())
    let index = this.allowedNumberKeysWithOutDecimal.findIndex(k => k == event.key);
    if (index < 0) {
      event.preventDefault()
    }
    //this.showErrorMessage = false;
  }


  /****Cancellation Membership Toggle Mehtod****/
  membershipCancelToggle(obj: MatSlideToggleChange) {
    if (this.cancellationPolicy.membershipCancellationPolicy.IsMembershipCancellationPolicyEnabled) {
      obj.source.checked = true;
      this.cancellationPolicy.membershipCancellationPolicy.IsCancelAnyTimeEnabledForWidgetAndApp = true;
    }
    else {
      obj.source.checked = false;
      this.cancellationPolicy.membershipCancellationPolicy.IsCancelAnyTimeEnabledForWidgetAndApp = false;
      this.cancellationPolicy.membershipCancellationPolicy.IsCancelOutsideTheContractEnabledWidgetAndApp = false;
    }
  }

  anyTimeCancelToggle(obj: MatSlideToggleChange) {
    if (this.cancellationPolicy.membershipCancellationPolicy.IsCancelAnyTimeEnabledForWidgetAndApp) {
      obj.source.checked = true;
      this.cancellationPolicy.membershipCancellationPolicy.IsCancelOutsideTheContractEnabledWidgetAndApp = false;
    }
    else {
      obj.source.checked = false;
      this.cancellationPolicy.membershipCancellationPolicy.IsCancelOutsideTheContractEnabledWidgetAndApp = true;
    }
  }

  outSideCancelToggle(obj: MatSlideToggleChange) {
    if (this.cancellationPolicy.membershipCancellationPolicy.IsCancelOutsideTheContractEnabledWidgetAndApp) {
      obj.source.checked = true;
      this.cancellationPolicy.membershipCancellationPolicy.IsCancelAnyTimeEnabledForWidgetAndApp = false;
    }
    else {
      obj.source.checked = false;
      this.cancellationPolicy.membershipCancellationPolicy.IsCancelAnyTimeEnabledForWidgetAndApp = true;
    }
  }



}
