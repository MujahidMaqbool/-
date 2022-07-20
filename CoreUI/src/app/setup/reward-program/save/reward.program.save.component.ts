// #region Imports

/********************** Angular Refrences *********************/
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SubscriptionLike } from "rxjs";
import { NgForm } from '@angular/forms';

/********************* Material:Refference ********************/
import { MatStepper } from '@angular/material/stepper';

/**********************  Configurations *********************/
import { RewardProgramApi } from 'src/app/helper/config/app.webapi';
import { customerEnrollmentTypeID, customerEnrollmentTypeName, CustomerType, ENU_Reward_Program_validation, RewardProgramActivityType, RewardProgramPurchasesType, WizardforRewardProgram } from 'src/app/helper/config/app.enums';

/**********************  Components  *************************/
import { SaveAddExceptionComponent } from './add-exception-dialog/add.exception.component';
import { SaveAddExceptionFormComponent } from './add-form-exception/add.form-exception.save.component';
import { RewardTemplateComponent } from './reward-template/reward.template.component';
import { AlertConfirmationComponent } from 'src/app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

/********************** Services & Models *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { RewardProgramBranchViewModel,RewardProgramEarningRuleFrontEnd, RewardProgramEarningRuleViewModel, RewardProgramModel } from '../models/reward-program.model';

// #endregion


@Component({
  selector: 'app-reward-program-save',
  templateUrl: './reward.program.save.component.html',
})
export class SaveRewardProgramComponent extends AbstractGenericComponent implements OnInit {
    /*********** region Local Members ****/

  @ViewChild("RewardProgramData") rewardProgramFormData: NgForm;
  @ViewChild("RewardProgramPurchasesForm") RewardProgramPurchasesForm: NgForm;
  @ViewChild("RewardProgramActivitesForm") RewardProgramActivitesForm: NgForm;
  @ViewChild('stepper') stepper: MatStepper;

  /***********Messages*********/
  messages = Messages;

  /*********** Configurations *********/
  enum_PurchasesType = RewardProgramPurchasesType;
  enum_ActivitesEarningTypes = RewardProgramActivityType;
  enum_Reward_Program_Validation = ENU_Reward_Program_validation;

  /***********Model Reference*********/
    /*********** Collections *********/
  rewardProgram: RewardProgramModel = new RewardProgramModel();
  copyRewardProgram: RewardProgramModel = new RewardProgramModel();
  rewardProgramEarningRuleFrontEnd: RewardProgramEarningRuleFrontEnd = new RewardProgramEarningRuleFrontEnd();
  classesExceptionCount:[];
  productExceptionCount:[];
  serviceExceptionCount:[];
  membershipExceptionCount:[];
  formsExceptionCount:[];
  
  /***********Objects*********/
  classEarningRule:any = {};
  serviceEarningRule:any = {};
  productEarningRule:any = {};
  membershipEarningRule:any = {};
  customerBirthdayActivityRule:any = {};
  rewardprogramoptinActivityRule:any = {};
  widgetAndAppBookingActivityRule:any = {};
  referalActivityRule:any = {};
  customerActivityRule:any={};
  memberCheckinActivityRule:any={};
  classPresentActivityRule:any={};
  serviceCompletedActivityRule:any={};
  formsActivityRule:any={};

  /*********** Local *******************/
  desciptionWithoutHTML: string;
  showDescriptionValidation: boolean = false;
  showPrevious: boolean;
  showContinue: boolean = true;
  showSave: boolean = false;
  activeTabIndex: number = 0;

  
  isClassSelected: boolean = true;
  isServiceSelected: boolean = true;
  isProductSelected: boolean = true;
  isMembershipSelected: boolean = true;
  isAdhocPaymentSelected: boolean = true;
  reCuringPaymentSelected: boolean = true;
  isCustomerBirthdaySelected: boolean = true;
  isRewardProgramOptinSelected:boolean = true;
  isWidgetAndAppBookingSelected:boolean = true;

  isReferalSelected: boolean = true;
  isNewCustomerSelected: boolean = true;
  isClassPresentSelected:boolean = true;
  isMembershipCheckinSelected: boolean = true;
  isServiceCompleteSelected:boolean = true;
  showPercentageValidationClient: boolean = false;
  showPercentageValidationMember: boolean = false;
  showPercentageValidationLead: boolean = false;
  showExpirayDaysValidation:boolean = false;
  redemptionValueValidation:boolean = false;
  showRedemptionValueValidation:boolean = false;
  showRedemptionPointsValidation: boolean = false;
  showAmountSpentValidation:boolean = false;
  showMemberEarnedPointsValidation:boolean = false;
  showClientEarnedPointsValidation : boolean = false ;
  showLeadEarnedPointsValidation : boolean = false;
  showBenefittedEarnedPointsValidation :  boolean = false ;

  showClassAmountSpentValidation:boolean = false;
  showclassMemberEarnedValidation:boolean = false;
  showclassClientEarnedValidation:boolean = false;
  showclassLeadEarnedValidation:boolean = false;
  showclassBenefittedEarnedPointsValidation:boolean = false;
  currencyFormat: string;

  showServiceAmountSpentValidation:boolean = false;
  showServiceMemberEarnedValidation:boolean = false;
  showServiceClientEarnedValidation:boolean = false;
  showServiceLeadEarnedValidation:boolean = false;
  showServiceBenefittedEarnedPointsValidation:boolean = false;


  showProductAmountSpentValidation:boolean = false;
  showProductMemberEarnedValidation:boolean = false;
  showProductClientEarnedValidation:boolean = false;
  showProductLeadEarnedValidation:boolean = false;
  showProductBenefittedEarnedPointsValidation:boolean = false;


  showMembershipAmountSpentValidation:boolean = false;
  showMembershipMemberEarnedValidation:boolean = false;
  showMembershipClientEarnedValidation:boolean = false;
  showMembershipLeadEarnedValidation:boolean = false;
  showMembershipBenefittedEarnedPointsValidation:boolean = false;

  isShowResetButton : boolean = false;
  customerType = CustomerType;
  branchId:number;
  branchName:string;

  isFormSelected:boolean = true;
  ShowError: boolean = false;
  isSaveClicked :boolean = false;
  deleteDialogRef: any;
  
  rewardProgramID:number;

  customerEnrollmentList = [
    { RewardProgramEnrollmentTypeID: customerEnrollmentTypeID.Customer_Opt_In, RewardProgramEnrollmentTypeName: customerEnrollmentTypeName.Customer_Opt_In },
    { RewardProgramEnrollmentTypeID: customerEnrollmentTypeID.Automatic_Enrollment, RewardProgramEnrollmentTypeName: customerEnrollmentTypeName.Automatic_Enrollment },
    { RewardProgramEnrollmentTypeID: customerEnrollmentTypeID.Manual_Enrollment, RewardProgramEnrollmentTypeName: customerEnrollmentTypeName.Manual_Enrollment },
  ];


  constructor(
    private _dialog: MatDialogService,
    private _DeleteActionDialogue: MatDialogService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dataSharingService: DataSharingService,
    private _router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private _openDialog: MatDialogService) { super() }

  ngOnInit(): void {
    this.mappingEarningRuleData();
    this.mappingActivitiesEarningRuleData();
    this.rewardProgram.RewardProgramEnrollmentTypeID = customerEnrollmentTypeID.Manual_Enrollment;
    this.getCurrentBranchDetail();

    // get ID from url if ID is greater than 0 we call the get reward program api and edit that reward program if ID == 0 then its new reward program case 
    this.route.params.subscribe((params: Params) => {
      this.rewardProgramID = (params["ID"])

      if (this.rewardProgramID > 0) {
        let rewardProgramID;
        this.isShowResetButton = true;
        rewardProgramID = Number(this.rewardProgramID)
        this.getRewardProgramByID(rewardProgramID);
      }
    });
  }
 

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }
  // here we check if the reward program is default in selected branch and user wants to inactivate that program then we show msg and confirm from user 
  onChangeRewardProgramState(event) {
    if (!event.checked) {
      var result = this.rewardProgram.RewardProgramBranchVM.find((i => i.BranchID == this.branchId));
      if (result && result.IsDefault == true) {
        const dialog = this._openDialog.open(AlertConfirmationComponent);
        dialog.componentInstance.Title = this.messages.Dialog_Title.Alert;
        dialog.componentInstance.Message = this.messages.Confirmation.Confirmation_Branch_Unselect.replace("{0}", this.branchName),
        dialog.componentInstance.isChangeIcon = false;
        dialog.componentInstance.showButton = true;
        dialog.componentInstance.showConfirmCancelButton = true;
        dialog.componentInstance.confirmChange.subscribe(isConfirm => {
          if (isConfirm) {
            this.rewardProgram.IsActive = false
          } else {
            this.rewardProgram.IsActive = true;
          }
        })
      }
    }
  }

   /* get branch details */
   async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.branchId = branch.BranchID;
      this.branchName = branch.BranchName;
      this.currencyFormat = branch.CurrencySymbol
      this.getRewardProgramDescription();
    }
  }
  // reset function resets the value to selected stepper (only in case of edit reward program )
  onResetRewardProgram() {
    if (this.stepper.selectedIndex === WizardforRewardProgram.RewardProgram) {
      this.rewardProgram.RewardProgramName = this.copyRewardProgram.RewardProgramName;
      this.rewardProgram.IsActive = this.copyRewardProgram.IsActive;
      this.rewardProgram.RewardProgramEnrollmentTypeID = this.copyRewardProgram.RewardProgramEnrollmentTypeID;
      this.rewardProgram.MinimumPointsRequiredtoRedeem = this.copyRewardProgram.MinimumPointsRequiredtoRedeem;
      this.rewardProgram.MemberRedeemLimit = this.copyRewardProgram.MemberRedeemLimit;
      this.rewardProgram.ClientRedeemLimit = this.copyRewardProgram.ClientRedeemLimit;
      this.rewardProgram.LeadRedeemLimit = this.copyRewardProgram.LeadRedeemLimit;
      this.rewardProgram.IsPointsExpiry = this.copyRewardProgram.IsPointsExpiry;
      this.rewardProgram.PointsExpiryDuration = this.copyRewardProgram.PointsExpiryDuration;
      this.rewardProgram.IsDiscountedMembershipBenefits = this.copyRewardProgram.IsDiscountedMembershipBenefits;
      this.rewardProgram.RewardProgramDetailVM.Description = this.copyRewardProgram.RewardProgramDetailVM.Description;
      this.showPercentageValidationClient = false;
      this.showPercentageValidationLead = false;
      this.showPercentageValidationMember = false;
      this.showExpirayDaysValidation = false;
      this.ShowError = false;
      this.showDescriptionValidation = false;
    }
    else if (this.stepper.selectedIndex === WizardforRewardProgram.RewardPurchases) {
      this.rewardProgram.RedemptionValue = this.copyRewardProgram.RedemptionValue;
      this.rewardProgram.IsAhdhocMembershipPayment = this.copyRewardProgram.IsAhdhocMembershipPayment;
      this.rewardProgram.RedemptionPoints = this.copyRewardProgram.RedemptionPoints
      this.showRedemptionValueValidation = false;
      this.redemptionValueValidation = false;
      this.showRedemptionPointsValidation = false;
      this.showAmountSpentValidation = false;
      this.showMemberEarnedPointsValidation = false;
      this.showClientEarnedPointsValidation = false;
      this.showLeadEarnedPointsValidation = false;
      this.showBenefittedEarnedPointsValidation = false;
      this.showClassAmountSpentValidation = false;
      this.showclassMemberEarnedValidation = false;
      this.showclassClientEarnedValidation = false;
      this.showclassLeadEarnedValidation = false;
      this.showclassBenefittedEarnedPointsValidation = false;
      this.showServiceAmountSpentValidation = false;
      this.showServiceMemberEarnedValidation = false;
      this.showServiceClientEarnedValidation = false;
      this.showServiceLeadEarnedValidation = false;
      this.showServiceBenefittedEarnedPointsValidation = false;
      this.showProductAmountSpentValidation = false;
      this.showProductMemberEarnedValidation = false;
      this.showProductClientEarnedValidation = false;
      this.showProductLeadEarnedValidation = false;
      this.showProductBenefittedEarnedPointsValidation = false;
      this.showMembershipAmountSpentValidation = false;
      this.showMembershipMemberEarnedValidation = false;
      this.showMembershipClientEarnedValidation = false;
      this.showMembershipLeadEarnedValidation = false;
      this.showMembershipBenefittedEarnedPointsValidation = false;
      //when isadvance settings are off
      if (!this.copyRewardProgram.IsAdvanceSetting) {
        this.rewardProgramEarningRuleFrontEnd = JSON.parse(JSON.stringify(this.copyRewardProgram.RewardProgramEarningRuleVM[0]));
        this.rewardProgram.IsAdvanceSetting = this.copyRewardProgram.IsAdvanceSetting;
      }
      //when advance setting is on
      if (this.copyRewardProgram.IsAdvanceSetting) {
        this.rewardProgram.IsAdvanceSetting = this.copyRewardProgram.IsAdvanceSetting;
        var findClasses = this.copyRewardProgram.RewardProgramEarningRuleVM.find(i => i.ItemTypeID == this.enum_PurchasesType.Class);
        if (findClasses) {
          this.classEarningRule = JSON.parse(JSON.stringify(findClasses));
          this.isClassSelected = true;
          this.rewardProgram.RewardProgramEarningRuleExceptionVM = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID != this.enum_PurchasesType.Class);
          this.copyRewardProgram.RewardProgramEarningRuleExceptionVM.forEach((data, i) => {
            if (data.ItemTypeID == this.enum_PurchasesType.Class) {
              this.rewardProgram.RewardProgramEarningRuleExceptionVM.push(data);
            }
          });
          this.countException(this.enum_PurchasesType.Class);
        } else {
          this.classEarningRule.AmountSpent = null;
          this.classEarningRule.MemberEarnedPoints = null;
          this.classEarningRule.ClientEarnedPoints = null;
          this.classEarningRule.LeadEarnedPoints = null;
          this.classEarningRule.BenefittedEarnedPoints = null;
          this.isClassSelected = false;
        }

        var findServices = this.copyRewardProgram.RewardProgramEarningRuleVM.find(i => i.ItemTypeID == this.enum_PurchasesType.Service);
        if (findServices) {
          this.serviceEarningRule = JSON.parse(JSON.stringify(findServices));
          this.rewardProgram.RedemptionPoints = this.copyRewardProgram.RedemptionPoints;
          this.isServiceSelected = true;
          this.rewardProgram.RewardProgramEarningRuleExceptionVM = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID != this.enum_PurchasesType.Service);
          this.copyRewardProgram.RewardProgramEarningRuleExceptionVM.forEach((data, i) => {
            if (data.ItemTypeID == this.enum_PurchasesType.Service) {
              this.rewardProgram.RewardProgramEarningRuleExceptionVM.push(data);
            }
          });
          this.countException(this.enum_PurchasesType.Service);
        } else {
          this.serviceEarningRule.AmountSpent = null;
          this.serviceEarningRule.MemberEarnedPoints = null;
          this.serviceEarningRule.ClientEarnedPoints = null;
          this.serviceEarningRule.LeadEarnedPoints = null;
          this.serviceEarningRule.BenefittedEarnedPoints = null;
          this.isServiceSelected = false;
        }

        var findProduct = this.copyRewardProgram.RewardProgramEarningRuleVM.find(i => i.ItemTypeID == this.enum_PurchasesType.Product);
        if (findProduct) {
          this.productEarningRule = JSON.parse(JSON.stringify(findProduct));
          this.isProductSelected = true;
          this.rewardProgram.RewardProgramEarningRuleExceptionVM = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID != this.enum_PurchasesType.Product);
          this.copyRewardProgram.RewardProgramEarningRuleExceptionVM.forEach((data, i) => {
            if (data.ItemTypeID == this.enum_PurchasesType.Product) {
              this.rewardProgram.RewardProgramEarningRuleExceptionVM.push(data);
            }
          });
          this.countException(this.enum_PurchasesType.Product);

        } else {
          this.productEarningRule.AmountSpent = null;
          this.productEarningRule.MemberEarnedPoints = null;
          this.productEarningRule.ClientEarnedPoints = null;
          this.productEarningRule.LeadEarnedPoints = null;
          this.productEarningRule.BenefittedEarnedPoints = null;
          this.isProductSelected = false;
        }
        var findMembership = this.copyRewardProgram.RewardProgramEarningRuleVM.find(i => i.ItemTypeID == this.enum_PurchasesType.Membership);
        if (findMembership) {
          this.membershipEarningRule = JSON.parse(JSON.stringify(findMembership));
          this.isMembershipSelected = true;
          this.rewardProgram.RewardProgramEarningRuleExceptionVM = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID != this.enum_PurchasesType.Membership);
          this.copyRewardProgram.RewardProgramEarningRuleExceptionVM.forEach((data, i) => {
            if (data.ItemTypeID == this.enum_PurchasesType.Membership) {
              this.rewardProgram.RewardProgramEarningRuleExceptionVM.push(data);
            }
          });
          this.countException(this.enum_PurchasesType.Membership);

        } else {
          this.membershipEarningRule.AmountSpent = null;
          this.membershipEarningRule.MemberEarnedPoints = null;
          this.isMembershipSelected = false;
        }
      }
    }

    else if (this.stepper.selectedIndex === WizardforRewardProgram.RewardActvities) {

      var findCustomerBirthday = this.copyRewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.CustomerBirthday);
      if (findCustomerBirthday) {
        this.customerBirthdayActivityRule = JSON.parse(JSON.stringify(findCustomerBirthday));
        this.isCustomerBirthdaySelected = true;
      } else {
        this.customerBirthdayActivityRule.ClientEarnedPoints = null;
        this.customerBirthdayActivityRule.LeadEarnedPoints = null;
        this.customerBirthdayActivityRule.MemberEarnedPoints = null;
        this.isCustomerBirthdaySelected = false;
      }

      var findRewardProgramOptIn = this.copyRewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.RewardProgramOptIn);
      if (findRewardProgramOptIn) {
        this.rewardprogramoptinActivityRule = JSON.parse(JSON.stringify(findRewardProgramOptIn));
        this.isRewardProgramOptinSelected = true;
      } else {
        this.rewardprogramoptinActivityRule.ClientEarnedPoints = null;
        this.rewardprogramoptinActivityRule.LeadEarnedPoints = null;
        this.rewardprogramoptinActivityRule.MemberEarnedPoints = null;
        this.isRewardProgramOptinSelected = false;
      }

      var findWidgetNAppBooking = this.copyRewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.WidgetAndAppBookings);
      if (findWidgetNAppBooking) {
        this.widgetAndAppBookingActivityRule = JSON.parse(JSON.stringify(findWidgetNAppBooking));
        this.isWidgetAndAppBookingSelected = true;
      } else {
        this.widgetAndAppBookingActivityRule.ClientEarnedPoints = null;
        this.widgetAndAppBookingActivityRule.LeadEarnedPoints = null;
        this.widgetAndAppBookingActivityRule.MemberEarnedPoints = null;
        this.isWidgetAndAppBookingSelected = false;
      }

      var findReferel = this.copyRewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.Referrals);
      if (findReferel) {
        this.referalActivityRule = JSON.parse(JSON.stringify(findReferel));
        this.isReferalSelected = true;
      } else {
        this.referalActivityRule.ClientEarnedPoints = null;
        this.referalActivityRule.LeadEarnedPoints = null;
        this.referalActivityRule.MemberEarnedPoints = null;
        this.isReferalSelected = false;
      }

      var findNewCustomer = this.copyRewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.NewCustomer);
      if (findNewCustomer) {
        this.customerActivityRule = JSON.parse(JSON.stringify(findNewCustomer));
        this.isNewCustomerSelected = true;
      } else {
        this.customerActivityRule.ClientEarnedPoints = null;
        this.customerActivityRule.LeadEarnedPoints = null;
        this.customerActivityRule.MemberEarnedPoints = null;
        this.isNewCustomerSelected = false;
      }

      var findMemberCheckin = this.copyRewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.MemberCheckIn);
      if (findMemberCheckin) {
        this.memberCheckinActivityRule = JSON.parse(JSON.stringify(findMemberCheckin));
        this.isMembershipCheckinSelected = true;
      } else {
        this.memberCheckinActivityRule.MemberEarnedPoints = null;
        this.isMembershipCheckinSelected = false;
      }

      var findClassPresent = this.copyRewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.ClassPresent);
      if (findClassPresent) {
        this.classPresentActivityRule = JSON.parse(JSON.stringify(findClassPresent));
        this.isClassPresentSelected = true;
      } else {
        this.classPresentActivityRule.ClientEarnedPoints = null;
        this.classPresentActivityRule.LeadEarnedPoints = null;
        this.classPresentActivityRule.MemberEarnedPoints = null;
        this.isClassPresentSelected = false;
      }

      var findServiceCompleted = this.copyRewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.ServiceCompleted);
      if (findServiceCompleted) {
        this.serviceCompletedActivityRule = JSON.parse(JSON.stringify(findServiceCompleted));
        this.isServiceCompleteSelected = true;
      } else {
        this.serviceCompletedActivityRule.ClientEarnedPoints = null;
        this.serviceCompletedActivityRule.LeadEarnedPoints = null;
        this.serviceCompletedActivityRule.MemberEarnedPoints = null;
        this.isServiceCompleteSelected = false;
      }

      var findForms = this.copyRewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.Forms);
      if (findForms) {
        this.formsActivityRule = JSON.parse(JSON.stringify(findForms));
        this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM = [];
        this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM = JSON.parse(JSON.stringify(this.copyRewardProgram.RewardProgramActivitiesEarningRuleExceptionVM));
        this.formsExceptionCount = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM));
        this.isFormSelected = true;
      } else {
        this.formsActivityRule.ClientEarnedPoints = null;
        this.formsActivityRule.LeadEarnedPoints = null;
        this.formsActivityRule.MemberEarnedPoints = null;
        this.isFormSelected = false;
      }
    }
  }

  // get reward program by ID and map data
  getRewardProgramByID(rewardProgramID: number) {
    this._httpService.get(RewardProgramApi.getRewardProgramByID + rewardProgramID).subscribe(
      (res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.rewardProgram = res.Result;
          this.copyRewardProgram = JSON.parse(JSON.stringify(res.Result));
          this.rewardProgram.PointsExpiryDuration = this.rewardProgram.IsPointsExpiry == true ? this.rewardProgram.PointsExpiryDuration : null;
          if (this.rewardProgram.IsAdvanceSetting) {
            this.rewardProgramEarningRuleFrontEnd.AmountSpent = null;
            this.rewardProgramEarningRuleFrontEnd.BenefittedEarnedPoints = null;
            this.rewardProgramEarningRuleFrontEnd.LeadEarnedPoints = null;
            this.rewardProgramEarningRuleFrontEnd.MemberEarnedPoints = null;
            this.rewardProgramEarningRuleFrontEnd.ClientEarnedPoints = null;

            var findClasses = this.rewardProgram.RewardProgramEarningRuleVM.find(i => i.ItemTypeID == this.enum_PurchasesType.Class);
            if (findClasses) {
              this.classEarningRule = JSON.parse(JSON.stringify(findClasses));
              this.countException(this.enum_PurchasesType.Class);
            } else {
              this.classEarningRule.AmountSpent = null;
              this.classEarningRule.MemberEarnedPoints = null;
              this.classEarningRule.ClientEarnedPoints = null;
              this.classEarningRule.LeadEarnedPoints = null;
              this.classEarningRule.BenefittedEarnedPoints = null;
              this.isClassSelected = false;
            }

            var findServices = this.rewardProgram.RewardProgramEarningRuleVM.find(i => i.ItemTypeID == this.enum_PurchasesType.Service);
            if (findServices) {
              this.serviceEarningRule = JSON.parse(JSON.stringify(findServices));
              this.countException(this.enum_PurchasesType.Service);

            } else {
              this.serviceEarningRule.AmountSpent = null;
              this.serviceEarningRule.MemberEarnedPoints = null;
              this.serviceEarningRule.ClientEarnedPoints = null;
              this.serviceEarningRule.LeadEarnedPoints = null;
              this.serviceEarningRule.BenefittedEarnedPoints = null;
              this.isServiceSelected = false;
            }

            var findProduct = this.rewardProgram.RewardProgramEarningRuleVM.find(i => i.ItemTypeID == this.enum_PurchasesType.Product);
            if (findProduct) {
              this.productEarningRule = JSON.parse(JSON.stringify(findProduct));
              this.countException(this.enum_PurchasesType.Product);

            } else {
              this.productEarningRule.AmountSpent = null;
              this.productEarningRule.MemberEarnedPoints = null;
              this.productEarningRule.ClientEarnedPoints = null;
              this.productEarningRule.LeadEarnedPoints = null;
              this.productEarningRule.BenefittedEarnedPoints = null;
              this.isProductSelected = false;
            }
            var findMembership = this.rewardProgram.RewardProgramEarningRuleVM.find(i => i.ItemTypeID == this.enum_PurchasesType.Membership);
            if (findMembership) {
              this.membershipEarningRule = JSON.parse(JSON.stringify(findMembership));
              this.countException(this.enum_PurchasesType.Membership);

            } else {
              this.membershipEarningRule.AmountSpent = null;
              this.membershipEarningRule.MemberEarnedPoints = null;
              this.isMembershipSelected = false;
            }
          }
          else {
            this.rewardProgramEarningRuleFrontEnd = this.rewardProgram.RewardProgramEarningRuleVM[0]
          }
          //activity rule mapping
          var findCustomerBirthday = this.rewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.CustomerBirthday);
          if (findCustomerBirthday) {
            this.customerBirthdayActivityRule = JSON.parse(JSON.stringify(findCustomerBirthday));
          } else {
            this.customerBirthdayActivityRule.ClientEarnedPoints = null;
            this.customerBirthdayActivityRule.LeadEarnedPoints = null;
            this.customerBirthdayActivityRule.MemberEarnedPoints = null;
            this.isCustomerBirthdaySelected = false;
          }

          var findRewardProgramOptIn = this.rewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.RewardProgramOptIn);
          if (findRewardProgramOptIn) {
            this.rewardprogramoptinActivityRule = JSON.parse(JSON.stringify(findRewardProgramOptIn));
          } else {
            this.rewardprogramoptinActivityRule.ClientEarnedPoints = null;
            this.rewardprogramoptinActivityRule.LeadEarnedPoints = null;
            this.rewardprogramoptinActivityRule.MemberEarnedPoints = null;
            this.isRewardProgramOptinSelected = false;
          }

          var findWidgetNAppBooking = this.rewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.WidgetAndAppBookings);
          if (findWidgetNAppBooking) {
            this.widgetAndAppBookingActivityRule = JSON.parse(JSON.stringify(findWidgetNAppBooking));
          } else {
            this.widgetAndAppBookingActivityRule.ClientEarnedPoints = null;
            this.widgetAndAppBookingActivityRule.LeadEarnedPoints = null;
            this.widgetAndAppBookingActivityRule.MemberEarnedPoints = null;
            this.isWidgetAndAppBookingSelected = false;
          }

          var findReferel = this.rewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.Referrals);
          if (findReferel) {
            this.referalActivityRule = JSON.parse(JSON.stringify(findReferel));
          } else {
            this.referalActivityRule.ClientEarnedPoints = null;
            this.referalActivityRule.LeadEarnedPoints = null;
            this.referalActivityRule.MemberEarnedPoints = null;
            this.isReferalSelected = false;
          }

          var findNewCustomer = this.rewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.NewCustomer);
          if (findNewCustomer) {
            this.customerActivityRule = JSON.parse(JSON.stringify(findNewCustomer));
          } else {
            this.customerActivityRule.ClientEarnedPoints = null;
            this.customerActivityRule.LeadEarnedPoints = null;
            this.customerActivityRule.MemberEarnedPoints = null;
            this.isNewCustomerSelected = false;
          }

          var findMemberCheckin = this.rewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.MemberCheckIn);
          if (findMemberCheckin) {
            this.memberCheckinActivityRule = JSON.parse(JSON.stringify(findMemberCheckin));
          } else {
            this.memberCheckinActivityRule.MemberEarnedPoints = null;
            this.isMembershipCheckinSelected = false;
          }

          var findClassPresent = this.rewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.ClassPresent);
          if (findClassPresent) {
            this.classPresentActivityRule = JSON.parse(JSON.stringify(findClassPresent));
          } else {
            this.classPresentActivityRule.ClientEarnedPoints = null;
            this.classPresentActivityRule.LeadEarnedPoints = null;
            this.classPresentActivityRule.MemberEarnedPoints = null;
            this.isClassPresentSelected = false;
          }

          var findServiceCompleted = this.rewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.ServiceCompleted);
          if (findServiceCompleted) {
            this.serviceCompletedActivityRule = JSON.parse(JSON.stringify(findServiceCompleted));
          } else {
            this.serviceCompletedActivityRule.ClientEarnedPoints = null;
            this.serviceCompletedActivityRule.LeadEarnedPoints = null;
            this.serviceCompletedActivityRule.MemberEarnedPoints = null;
            this.isServiceCompleteSelected = false;
          }

          var findForms = this.rewardProgram.RewardProgramActivitiesEarningRuleVM.find(i => i.RewardProgramActivityTypeID == this.enum_ActivitesEarningTypes.Forms);
          if (findForms) {
            this.formsActivityRule = JSON.parse(JSON.stringify(findForms));
          } else {
            this.formsActivityRule.ClientEarnedPoints = null;
            this.formsActivityRule.LeadEarnedPoints = null;
            this.formsActivityRule.MemberEarnedPoints = null;
            this.isFormSelected = false;
          }
          this.formsExceptionCount = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM));

        } else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Reward Program")
        );
      }
    );
  }

  // calls when we click on next button for next stepper this fucntion also check the validation if any validation occur it will stops you and show that validation 
  onNext() {
    if (this.stepper.selectedIndex === WizardforRewardProgram.RewardProgram){
    if(this.rewardProgramFormData.valid ){
      this.rewardProgram.RewardProgramName = this.rewardProgram.RewardProgramName.trim();
      this.stepper.next();
      this.showPrevious = true;

    }else{
      if(this.showPercentageValidationClient || this.showPercentageValidationLead || this.showPercentageValidationMember){
        this.ShowError = false;
        this.showDescriptionValidation = false;
      }
      else {
        if (this.rewardProgramFormData.value.Description == "" || this.rewardProgramFormData.value.Description == undefined) {
          this.showDescriptionValidation = true;
        } if (this.rewardProgramFormData.value.RewardProgramName == '' || this.rewardProgramFormData.value.RewardProgramName == undefined) {
          this.ShowError = true;
        } if (this.rewardProgramFormData.value.ClientRedeemLimit == '' || this.rewardProgramFormData.value.LeadRedeemLimit  == '' || this.rewardProgramFormData.value.MemberRedeemLimit == '') {
          this.ShowError = true;
        } if (this.rewardProgramFormData.value.ClientRedeemLimit > 100) {
          this.ShowError = false;
          this.showDescriptionValidation = false;
          this.showPercentageValidationClient = true;
        } if (this.rewardProgramFormData.value.MemberRedeemLimit > 100) {
          this.ShowError = false;
          this.showDescriptionValidation = false;
          this.showPercentageValidationMember = true;
        } if (this.rewardProgramFormData.value.LeadRedeemLimit > 100) {
          this.ShowError = false;
          this.showDescriptionValidation = false;
          this.showPercentageValidationLead = true;
        }
        if(this.rewardProgramFormData.value.PointsExpiryDuration == '' || this.rewardProgramFormData.value.PointsExpiryDuration == 0){
          this.ShowError = true;
          this.ShowError = false;
          this.showDescriptionValidation = false;
          this.showPercentageValidationLead = false;
          this.showPercentageValidationMember = false;
          this.showPercentageValidationClient = false;
          this.showExpirayDaysValidation = true;
        }
      }
     
    }
  }
    else if (this.stepper.selectedIndex === WizardforRewardProgram.RewardPurchases) {
      if(this.RewardProgramPurchasesForm.valid ){
        if(this.RewardProgramPurchasesForm.value.RedemptionValue > 0){
        this.showContinue = false;
        this.showSave = true;
        this.stepper.next();
        }
      } else {
        if (this.RewardProgramPurchasesForm.value.RedemptionValue == "" ) {
          this.showRedemptionValueValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.RedemptionPoints == "") {
          this.showRedemptionPointsValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.AmountSpent == "") {
          this.showAmountSpentValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.MemberEarnedPoints == "") {
          this.showMemberEarnedPointsValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.ClientEarnedPoints == "") {
          this.showClientEarnedPointsValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.LeadEarnedPoints == "") {
          this.showLeadEarnedPointsValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.BenefittedEarnedPoints == "") {
          this.showBenefittedEarnedPointsValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.classAmountSpent == "") {
          this.showClassAmountSpentValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.classMemberEarnedPoints == "") {
          this.showclassMemberEarnedValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.classClientEarnedPoints == "") {
          this.showclassClientEarnedValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.classLeadEarnedPoints == "") {
          this.showclassLeadEarnedValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.classBenefittedEarnedPoints == "") {
          this.showclassBenefittedEarnedPointsValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.serviceAmountSpent == "") {
          this.showServiceAmountSpentValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.serviceMemberEarnedPoints == "") {
          this.showServiceMemberEarnedValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.serviceClientEarnedPoints == "") {
          this.showServiceClientEarnedValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.serviceLeadEarnedPoints == "") {
          this.showServiceLeadEarnedValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.serviceBenefittedEarnedPoints == "") {
          this.showServiceBenefittedEarnedPointsValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.productAmountSpent == "") {
          this.showProductAmountSpentValidation = true
        }
        if (this.RewardProgramPurchasesForm.value.productMemberEarnedPoints == "") {
          this.showProductMemberEarnedValidation = true
        }
        if (this.RewardProgramPurchasesForm.value.producClientEarnedPoints == "") {
          this.showProductClientEarnedValidation = true
        }
        if (this.RewardProgramPurchasesForm.value.productLeadEarnedPoints == "") {
          this.showProductLeadEarnedValidation = true
        }
        if (this.RewardProgramPurchasesForm.value.productBenefittedEarnedPoints == "") {
          this.showProductBenefittedEarnedPointsValidation = true
        }
        if (this.RewardProgramPurchasesForm.value.membershipAmountSpent == "") {
          this.showMembershipAmountSpentValidation = true;
        }
        if (this.RewardProgramPurchasesForm.value.membershipMemberEarnedPoints == "") {
          this.showMembershipMemberEarnedValidation = true;
        }
     
      }
    }
    else if(this.stepper.selectedIndex === WizardforRewardProgram.RewardActvities) {
      // this.showContinue = false;
      // this.showSave = true;
    }
  }
 
  // on previous button checks the stepper and show you buttons accordingly
  onPrevious() {
    this.stepper.previous();
    if (this.stepper.selectedIndex === WizardforRewardProgram.RewardProgram) {
      this.showPrevious = false
    }
    else if (this.stepper.selectedIndex === WizardforRewardProgram.RewardPurchases) {
      this.showContinue = true;
      this.showSave = false;
    }
    else {
      this.showContinue = false;
      this.showSave = true;
    }
  }

  // get the reward program description from backend
  getRewardProgramDescription() {

    this._httpService.get(RewardProgramApi.getRewardProgramDescription + this.branchId)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this.rewardProgram.RewardProgramDetailVM.Description = response.Result.BranchDefaultTemplate
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Reward Program description"))
        }
      );
  }

  // save reward program in both edit and new reward program 
  onSave() {
    if (this.RewardProgramActivitesForm.valid) {
      this.isSaveClicked = true;
      // after on clicking the save button we have to prepare the data 
      this.prepareSaveData();
      this._httpService.save(RewardProgramApi.saveRewardProgram, this.rewardProgram)
        .subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Reward Program"));
              this._router.navigate(['/setup/reward-program']);
            } else {
              this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Reward Program"));
            }
          },
          error => {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Reward Program"))
          }
        );
    }
  }
  // preview button for widget and app preview
  viewTemplate() {
    const dialogRef = this._dialog.open(RewardTemplateComponent, {
      disableClose: true,
      data: {
        rewardProgramName: this.rewardProgram.RewardProgramName,
        description: this.rewardProgram.RewardProgramDetailVM.Description
      }
    });
  }

  // on expiray points change if the bit is true then we assign the value 1 and if false then assign null and also false the valildation
  onChangePointsExpiry(event){
    if (event.checked == true) {
        this.rewardProgram.IsPointsExpiry = event.checked;
        this.rewardProgram.PointsExpiryDuration = 1;
    }
    else {
      this.rewardProgram.IsPointsExpiry = event.checked;
      this.rewardProgram.PointsExpiryDuration = null;
      this.showExpirayDaysValidation = false;
    }
  }
  // prepare data for save 
  prepareSaveData() {
    let rewardProgramBranch = new RewardProgramBranchViewModel;
    this.rewardProgram.RewardProgramBranchVM = [];
    rewardProgramBranch.BranchID = this.branchId;
    rewardProgramBranch.IsDefault = false;
    if(this.rewardProgram.MinimumPointsRequiredtoRedeem == ''){
      this.rewardProgram.MinimumPointsRequiredtoRedeem = 0; 
    }
    this.rewardProgram.RewardProgramBranchVM.push(rewardProgramBranch);
    if(this.rewardProgram.IsPointsExpiry == false){
      this.rewardProgram.PointsExpiryDuration = 0
    }
    // prepare earnig rule data 
    this.earningRuleData();
    // prepare activity rule data 
    this.activityRuleData();
  }
 
  // prepare earning rule data
  earningRuleData() {
    if (this.rewardProgram.IsAdvanceSetting == false) {
      let RewardProgramEarningRuleList = new RewardProgramEarningRuleViewModel();
      this.rewardProgram.RewardProgramEarningRuleVM = [];
      RewardProgramEarningRuleList.ItemTypeID = this.enum_PurchasesType.Class;
      RewardProgramEarningRuleList.AmountSpent = this.rewardProgramEarningRuleFrontEnd.AmountSpent;
      RewardProgramEarningRuleList.ClientEarnedPoints = this.rewardProgramEarningRuleFrontEnd.ClientEarnedPoints;
      RewardProgramEarningRuleList.LeadEarnedPoints = this.rewardProgramEarningRuleFrontEnd.LeadEarnedPoints;
      RewardProgramEarningRuleList.MemberEarnedPoints = this.rewardProgramEarningRuleFrontEnd.MemberEarnedPoints;
      RewardProgramEarningRuleList.BenefittedEarnedPoints = this.rewardProgramEarningRuleFrontEnd.BenefittedEarnedPoints;
      this.rewardProgram.RewardProgramEarningRuleVM.push(JSON.parse(JSON.stringify(RewardProgramEarningRuleList)))
      RewardProgramEarningRuleList.ItemTypeID = this.enum_PurchasesType.Service;
      RewardProgramEarningRuleList.AmountSpent = this.rewardProgramEarningRuleFrontEnd.AmountSpent;
      RewardProgramEarningRuleList.ClientEarnedPoints = this.rewardProgramEarningRuleFrontEnd.ClientEarnedPoints;
      RewardProgramEarningRuleList.LeadEarnedPoints = this.rewardProgramEarningRuleFrontEnd.LeadEarnedPoints;
      RewardProgramEarningRuleList.MemberEarnedPoints = this.rewardProgramEarningRuleFrontEnd.MemberEarnedPoints;
      RewardProgramEarningRuleList.BenefittedEarnedPoints = this.rewardProgramEarningRuleFrontEnd.BenefittedEarnedPoints;
      this.rewardProgram.RewardProgramEarningRuleVM.push(JSON.parse(JSON.stringify(RewardProgramEarningRuleList)))
      RewardProgramEarningRuleList.ItemTypeID = this.enum_PurchasesType.Product;
      RewardProgramEarningRuleList.AmountSpent = this.rewardProgramEarningRuleFrontEnd.AmountSpent;
      RewardProgramEarningRuleList.ClientEarnedPoints = this.rewardProgramEarningRuleFrontEnd.ClientEarnedPoints;
      RewardProgramEarningRuleList.LeadEarnedPoints = this.rewardProgramEarningRuleFrontEnd.LeadEarnedPoints;
      RewardProgramEarningRuleList.MemberEarnedPoints = this.rewardProgramEarningRuleFrontEnd.MemberEarnedPoints;
      RewardProgramEarningRuleList.BenefittedEarnedPoints = this.rewardProgramEarningRuleFrontEnd.BenefittedEarnedPoints;
      this.rewardProgram.RewardProgramEarningRuleVM.push(JSON.parse(JSON.stringify(RewardProgramEarningRuleList)))
      RewardProgramEarningRuleList.ItemTypeID = this.enum_PurchasesType.Membership;
      RewardProgramEarningRuleList.AmountSpent = this.rewardProgramEarningRuleFrontEnd.AmountSpent;
      RewardProgramEarningRuleList.ClientEarnedPoints = 0;
      RewardProgramEarningRuleList.LeadEarnedPoints = 0;
      RewardProgramEarningRuleList.MemberEarnedPoints = this.rewardProgramEarningRuleFrontEnd.MemberEarnedPoints;
      RewardProgramEarningRuleList.BenefittedEarnedPoints = 0;
      this.rewardProgram.RewardProgramEarningRuleVM.push(JSON.parse(JSON.stringify(RewardProgramEarningRuleList)));
      this.rewardProgram.RewardProgramEarningRuleExceptionVM = [];
    }
    else {
      this.rewardProgram.RewardProgramEarningRuleVM = [];
      if (this.isClassSelected) {
        this.rewardProgram.RewardProgramEarningRuleVM.push(this.classEarningRule);
      } else {
        this.rewardProgram.RewardProgramEarningRuleExceptionVM = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID != this.enum_PurchasesType.Class)))
      }

      if (this.isServiceSelected) {
        this.rewardProgram.RewardProgramEarningRuleVM.push(this.serviceEarningRule);
      } else {
        this.rewardProgram.RewardProgramEarningRuleExceptionVM = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID != this.enum_PurchasesType.Service)))
      }

      if (this.isProductSelected) {
        this.rewardProgram.RewardProgramEarningRuleVM.push(this.productEarningRule);
      } else {
        this.rewardProgram.RewardProgramEarningRuleExceptionVM = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID != this.enum_PurchasesType.Product)))
      }

      if (this.isMembershipSelected) {
        this.rewardProgram.RewardProgramEarningRuleVM.push(this.membershipEarningRule);
      } else {
        this.rewardProgram.RewardProgramEarningRuleExceptionVM = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID != this.enum_PurchasesType.Membership)))
      }
    }
  }

  // prepare activity rule data 
  activityRuleData() {
    this.rewardProgram.RewardProgramActivitiesEarningRuleVM = [];
    if (this.isCustomerBirthdaySelected) {
      this.rewardProgram.RewardProgramActivitiesEarningRuleVM.push(this.customerBirthdayActivityRule);
    } if (this.isRewardProgramOptinSelected) {
      this.rewardProgram.RewardProgramActivitiesEarningRuleVM.push(this.rewardprogramoptinActivityRule);
    } if (this.isWidgetAndAppBookingSelected) {
      this.rewardProgram.RewardProgramActivitiesEarningRuleVM.push(this.widgetAndAppBookingActivityRule);
    } if (this.isReferalSelected) {
      this.rewardProgram.RewardProgramActivitiesEarningRuleVM.push(this.referalActivityRule);
    } if (this.isNewCustomerSelected) {
      this.rewardProgram.RewardProgramActivitiesEarningRuleVM.push(this.customerActivityRule);
    } if (this.isMembershipCheckinSelected) {
      this.rewardProgram.RewardProgramActivitiesEarningRuleVM.push(this.memberCheckinActivityRule);
    } if (this.isClassPresentSelected) {
      this.rewardProgram.RewardProgramActivitiesEarningRuleVM.push(this.classPresentActivityRule);
    } if (this.isServiceCompleteSelected) {
      this.rewardProgram.RewardProgramActivitiesEarningRuleVM.push(this.serviceCompletedActivityRule);
    } if (this.isFormSelected) {
      this.rewardProgram.RewardProgramActivitiesEarningRuleVM.push(this.formsActivityRule);
    } if (!this.isFormSelected) {
      this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM = [];
    }
  }
  
  // add exception dialog (in this event we also check if we have exception list filter that list according to item type and send that list to dialog)
  addExceptionDialog(itemTypeID: number) {
    let exceptionList = [];
    if (this.rewardProgram.RewardProgramEarningRuleExceptionVM?.length > 0) {
      if (itemTypeID == RewardProgramPurchasesType.Class) {
        exceptionList = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID == itemTypeID && i.ItemID != null);
      } else if (itemTypeID == RewardProgramPurchasesType.Product) {
        exceptionList = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID == itemTypeID && i.ItemID != null);
      } else if (itemTypeID == RewardProgramPurchasesType.Service) {
        exceptionList = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID == itemTypeID && i.ItemID != null);
      } else {
        exceptionList = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID == itemTypeID && i.ItemID != null);
      }
    }
    const dialogRef = this._dialog.open(SaveAddExceptionComponent, {
      disableClose: true,
      data: {
        itemTypeID,
        exceptionList
      }
    });
    dialogRef.componentInstance.exceptionList.subscribe((excetionTypeList: any) => {
      if (excetionTypeList.length > 0) {
        this.rewardProgram.RewardProgramEarningRuleExceptionVM = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID != itemTypeID);
        excetionTypeList.forEach((data, i) => {
          this.rewardProgram.RewardProgramEarningRuleExceptionVM.push(data);
        });
        this.countException(itemTypeID);
      }
      else if (excetionTypeList.length == 0) {
        this.rewardProgram.RewardProgramEarningRuleExceptionVM = this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID != itemTypeID);
        this.countException(itemTypeID);
      }
    })
  }
  //forms exception dialog and also check the list and send that list to form exception dialog
  openFormException() {
    let exceptionList = [];
    if (this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM?.length > 0) {
      exceptionList = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM));
    }
    const dialogRef = this._dialog.open(SaveAddExceptionFormComponent, {
      disableClose: true,
      data: {
        exceptionList
      }
    });
    dialogRef.componentInstance.exceptionList.subscribe((excetionTypeList: any) => {
      if (excetionTypeList.length > 0) {
        this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM = [];
        excetionTypeList.forEach((data, i) => {
          this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM.push(data);
        });
        this.formsExceptionCount = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM));
      }
      else if (excetionTypeList.length == 0) {
        this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM = [];
        this.formsExceptionCount = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramActivitiesEarningRuleExceptionVM));
      }
    })
  }
  // counts the exception list number
  countException(itemTypeID: number) {
    if (itemTypeID == RewardProgramPurchasesType.Class) {
      this.classesExceptionCount = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID == itemTypeID)));

    } else if (itemTypeID == RewardProgramPurchasesType.Product) {
      this.productExceptionCount = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID == itemTypeID)));

    } else if (itemTypeID == RewardProgramPurchasesType.Service) {
      this.serviceExceptionCount = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID == itemTypeID)));

    } else {
      this.membershipExceptionCount = JSON.parse(JSON.stringify(this.rewardProgram.RewardProgramEarningRuleExceptionVM.filter(i => i.ItemTypeID == itemTypeID)));
    }
  }
  
  // calls when change the advance settings in earning rule
  onChangeAdvanceSettings(event) {
    if (event.checked == true) {
      this.rewardProgramEarningRuleFrontEnd.AmountSpent = null;
      this.rewardProgramEarningRuleFrontEnd.BenefittedEarnedPoints = null;
      this.rewardProgramEarningRuleFrontEnd.LeadEarnedPoints = null;
      this.rewardProgramEarningRuleFrontEnd.MemberEarnedPoints = null;
      this.rewardProgramEarningRuleFrontEnd.ClientEarnedPoints = null;
      this.showBenefittedEarnedPointsValidation = false;
      this.showClientEarnedPointsValidation = false;
      this.showLeadEarnedPointsValidation = false;
      this.showMemberEarnedPointsValidation = false;
      this.showAmountSpentValidation = false;
    }
    else {
      this.rewardProgramEarningRuleFrontEnd.AmountSpent = 1;
      this.rewardProgramEarningRuleFrontEnd.BenefittedEarnedPoints = 1;
      this.rewardProgramEarningRuleFrontEnd.LeadEarnedPoints = 1;
      this.rewardProgramEarningRuleFrontEnd.MemberEarnedPoints = 1;
      this.rewardProgramEarningRuleFrontEnd.ClientEarnedPoints = 1;
      this.onDeleteAdvanceSetting();
    }
  }
  
  // select and unselect classes and assign values accordingly and false the validation 
  onClassesSelect() {
    if (this.isClassSelected == false) {
      this.classEarningRule.AmountSpent = null;
      this.classEarningRule.ClientEarnedPoints = null;
      this.classEarningRule.LeadEarnedPoints = null;
      this.classEarningRule.MemberEarnedPoints = null;
      this.classEarningRule.BenefittedEarnedPoints = null;
      this.showClassAmountSpentValidation = false;
      this.showclassMemberEarnedValidation = false;
      this.showclassClientEarnedValidation = false;
      this.showclassLeadEarnedValidation = false;
      this.showclassBenefittedEarnedPointsValidation = false;
    }
    else {
      this.classEarningRule.AmountSpent = 1;
      this.classEarningRule.ClientEarnedPoints = 1;
      this.classEarningRule.LeadEarnedPoints = 1;
      this.classEarningRule.MemberEarnedPoints = 1;
      this.classEarningRule.BenefittedEarnedPoints = 1;
    }
  }

  // select and unselect services and assign values accordingly and false the validation 
  onServiceSelect() {
    if (this.isServiceSelected == false) {
      this.serviceEarningRule.AmountSpent = null;
      this.serviceEarningRule.ClientEarnedPoints = null;
      this.serviceEarningRule.LeadEarnedPoints = null;
      this.serviceEarningRule.MemberEarnedPoints = null;
      this.serviceEarningRule.BenefittedEarnedPoints = null;
      this.showServiceAmountSpentValidation = false;
      this.showServiceMemberEarnedValidation = false;
      this.showServiceClientEarnedValidation = false;
      this.showServiceLeadEarnedValidation = false;
      this.showServiceBenefittedEarnedPointsValidation = false;
    }
    else {
      this.serviceEarningRule.AmountSpent = 1;
      this.serviceEarningRule.ClientEarnedPoints = 1;
      this.serviceEarningRule.LeadEarnedPoints = 1;
      this.serviceEarningRule.MemberEarnedPoints = 1;
      this.serviceEarningRule.BenefittedEarnedPoints = 1;
    }
  }
    
  // select and unselect product and assign values accordingly and false the validation 
  onProductSelect() {
    if (this.isProductSelected == false) {
      this.productEarningRule.AmountSpent = null;
      this.productEarningRule.ClientEarnedPoints = null;
      this.productEarningRule.LeadEarnedPoints = null;
      this.productEarningRule.MemberEarnedPoints = null;
      this.productEarningRule.BenefittedEarnedPoints = null;
      this.showProductAmountSpentValidation = false;
      this.showProductMemberEarnedValidation = false;
      this.showProductClientEarnedValidation = false;
      this.showProductLeadEarnedValidation = false;
      this.showProductBenefittedEarnedPointsValidation = false;
    }
    else {
      this.productEarningRule.AmountSpent = 1;
      this.productEarningRule.ClientEarnedPoints = 1;
      this.productEarningRule.LeadEarnedPoints = 1;
      this.productEarningRule.MemberEarnedPoints = 1;
      this.productEarningRule.BenefittedEarnedPoints = 1;
    }
  }

  // select and unselect Membership and assign values accordingly and false the validation 
  onMembershipSelect() {
    if (this.isMembershipSelected == false) {
      this.membershipEarningRule.AmountSpent = null;
      this.membershipEarningRule.MemberEarnedPoints = null;
      this.rewardProgram.IsAhdhocMembershipPayment = false;
      this.showMembershipAmountSpentValidation = false;
      this.showMembershipMemberEarnedValidation = false;
      this.showMembershipClientEarnedValidation = false;
      this.showMembershipLeadEarnedValidation = false;
      this.showMembershipBenefittedEarnedPointsValidation = false;
    }
    else {
      this.membershipEarningRule.AmountSpent = 1;
      this.membershipEarningRule.MemberEarnedPoints = 1;
      this.rewardProgram.IsAhdhocMembershipPayment = true;
    }
  }
  // calls when user wants to turn off the advance settings first we confirm and delete all settings(All exceptions)
  onDeleteAdvanceSetting() {
    this.deleteDialogRef = this._DeleteActionDialogue.open(DeleteConfirmationComponent, { disableClose: true, data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_reward_Program } });
    this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this.rewardProgram.IsAdvanceSetting = false;
        this.isClassSelected = true;
        this.isServiceSelected = true;
        this.isProductSelected = true;
        this.isMembershipSelected = true;
        this.isAdhocPaymentSelected = true;
        this.reCuringPaymentSelected = true;
        this.showRedemptionPointsValidation = false; 
        this.showAmountSpentValidation = false;
        this.showMemberEarnedPointsValidation = false;
        this.showClientEarnedPointsValidation = false;
        this.showLeadEarnedPointsValidation = false;
        this.showBenefittedEarnedPointsValidation = false;
        this.showClassAmountSpentValidation = false;
        this.showclassMemberEarnedValidation = false;
        this.showclassClientEarnedValidation = false;
        this.showclassLeadEarnedValidation = false;
        this.showclassBenefittedEarnedPointsValidation = false;
        this.showServiceAmountSpentValidation = false;
        this.showServiceMemberEarnedValidation = false;
        this.showServiceClientEarnedValidation = false;
        this.showServiceLeadEarnedValidation = false;
        this.showServiceBenefittedEarnedPointsValidation = false;
        this.showProductAmountSpentValidation = false;
        this.showProductMemberEarnedValidation = false;
        this.showProductClientEarnedValidation = false;
        this.showProductLeadEarnedValidation = false;
        this.showProductBenefittedEarnedPointsValidation = false;
        this.showMembershipAmountSpentValidation = false;
        this.showMembershipMemberEarnedValidation = false;
        this.showMembershipClientEarnedValidation = false;
        this.showMembershipLeadEarnedValidation = false;
        this.showMembershipBenefittedEarnedPointsValidation = false;
        this.mappingEarningRuleData();
      }
      else {
        this.rewardProgramEarningRuleFrontEnd.AmountSpent = null;
        this.rewardProgramEarningRuleFrontEnd.BenefittedEarnedPoints = null;
        this.rewardProgramEarningRuleFrontEnd.LeadEarnedPoints = null;
        this.rewardProgramEarningRuleFrontEnd.MemberEarnedPoints = null;
        this.rewardProgramEarningRuleFrontEnd.ClientEarnedPoints = null;
        this.rewardProgram.IsAdvanceSetting = true;
      }
    })
  }
  
  // calls when click on customer birthday and assign value according to bit isCustomerBirthdaySelected value
  onCustomerBirthdaySelect() {
    if (this.isCustomerBirthdaySelected == false) {
      this.customerBirthdayActivityRule.ClientEarnedPoints = null;
      this.customerBirthdayActivityRule.LeadEarnedPoints = null;
      this.customerBirthdayActivityRule.MemberEarnedPoints = null;
    }
    else {
      this.customerBirthdayActivityRule.ClientEarnedPoints = 1;
      this.customerBirthdayActivityRule.LeadEarnedPoints = 1;
      this.customerBirthdayActivityRule.MemberEarnedPoints = 1;
    }
  }

  // calls when click on reward optin and assign value according to bit isRewardProgramOptinSelected value
  onRewardProgramOptinSelect() {
    if (this.isRewardProgramOptinSelected == false) {
      this.rewardprogramoptinActivityRule.ClientEarnedPoints = null;
      this.rewardprogramoptinActivityRule.LeadEarnedPoints = null;
      this.rewardprogramoptinActivityRule.MemberEarnedPoints = null;
    }
    else {
      this.rewardprogramoptinActivityRule.ClientEarnedPoints = 1;
      this.rewardprogramoptinActivityRule.LeadEarnedPoints = 1;
      this.rewardprogramoptinActivityRule.MemberEarnedPoints = 1;
    }
  }

  // calls when click on widget and app and assign value according to bit isWidgetAndAppBookingSelected value
  onWidgetAndAppSelect() {
    if (this.isWidgetAndAppBookingSelected == false) {
      this.widgetAndAppBookingActivityRule.ClientEarnedPoints = null;
      this.widgetAndAppBookingActivityRule.LeadEarnedPoints = null;
      this.widgetAndAppBookingActivityRule.MemberEarnedPoints = null;
    }
    else {
      this.widgetAndAppBookingActivityRule.ClientEarnedPoints = 1;
      this.widgetAndAppBookingActivityRule.LeadEarnedPoints = 1;
      this.widgetAndAppBookingActivityRule.MemberEarnedPoints = 1;
    }
  }

  // calls when click on referal and assign value according to bit isReferalSelected value
  onReferalSelect() {
    if (this.isReferalSelected == false) {
      this.referalActivityRule.ClientEarnedPoints = null;
      this.referalActivityRule.LeadEarnedPoints = null;
      this.referalActivityRule.MemberEarnedPoints = null;
    }
    else {
      this.referalActivityRule.ClientEarnedPoints = 1;
      this.referalActivityRule.LeadEarnedPoints = 1;
      this.referalActivityRule.MemberEarnedPoints = 1;
    }
  }

  // calls when click on new customer and assign value according to bit isNewCustomerSelected value
  onNewCustomerSelect() {
    if (this.isNewCustomerSelected == false) {
      this.customerActivityRule.ClientEarnedPoints = null;
      this.customerActivityRule.LeadEarnedPoints = null;
      this.customerActivityRule.MemberEarnedPoints = null;
    }
    else {
      this.customerActivityRule.ClientEarnedPoints = 1;
      this.customerActivityRule.LeadEarnedPoints = 1;
      this.customerActivityRule.MemberEarnedPoints = 1;
    }
  }

  // calls when click on class present and assign value according to bit isClassPresentSelected value
  onClassPresentSelect() {
    if (this.isClassPresentSelected == false) {
      this.classPresentActivityRule.ClientEarnedPoints = null;
      this.classPresentActivityRule.LeadEarnedPoints = null;
      this.classPresentActivityRule.MemberEarnedPoints = null;
    }
    else {
      this.classPresentActivityRule.ClientEarnedPoints = 1;
      this.classPresentActivityRule.LeadEarnedPoints = 1;
      this.classPresentActivityRule.MemberEarnedPoints = 1;
    }
  }

  // calls when click on membership and assign value according to bit isMembershipCheckinSelected value
  onMembershipCheckinSelect() {
    if (this.isMembershipCheckinSelected == false) {
      this.memberCheckinActivityRule.MemberEarnedPoints = null;
    }
    else {
      this.memberCheckinActivityRule.MemberEarnedPoints = 1;
    }
  }

  // calls when click on sevice completed and assign value according to bit isServiceCompleteSelected value
  onServiceCompletedSelect() {
    if (this.isServiceCompleteSelected == false) {
      this.serviceCompletedActivityRule.ClientEarnedPoints = null;
      this.serviceCompletedActivityRule.LeadEarnedPoints = null;
      this.serviceCompletedActivityRule.MemberEarnedPoints = null;
    }
    else {
      this.serviceCompletedActivityRule.ClientEarnedPoints = 1;
      this.serviceCompletedActivityRule.LeadEarnedPoints = 1;
      this.serviceCompletedActivityRule.MemberEarnedPoints = 1;
    }
  }

  // calls when click on form and assign value according to bit isFormSelected value
  onFormSelect(){
    if (this.isFormSelected == false) {
      this.formsActivityRule.ClientEarnedPoints = null;
      this.formsActivityRule.LeadEarnedPoints = null;
      this.formsActivityRule.MemberEarnedPoints = null;
    }
    else {
      this.formsActivityRule.ClientEarnedPoints = 1;
      this.formsActivityRule.LeadEarnedPoints = 1;
      this.formsActivityRule.MemberEarnedPoints = 1;
    }
  }

  // description validation for empty new line 
  onDescriptionUpdated(value: string) {
    if (value == "") {
      this.showDescriptionValidation = true;
      this.showPercentageValidationClient = false;
      this.showPercentageValidationLead = false;
      this.showPercentageValidationMember = false;
      this.showExpirayDaysValidation = false;

      this.rewardProgramFormData.form.updateValueAndValidity();
      this.rewardProgramFormData.form.markAsDirty();
    } else {
      this.rewardProgram.RewardProgramDetailVM.Description = value === "<br>" ? "" : value;
      this.getDescriptionWithOutHtml();
      if (this.desciptionWithoutHTML && this.desciptionWithoutHTML.length == 0) {
        this.rewardProgramFormData.form.updateValueAndValidity();
        this.rewardProgramFormData.form.markAsDirty();
        this.showDescriptionValidation = true;
      }
      else {
        this.showDescriptionValidation = false;
      }
    }
    this.rewardProgram.RewardProgramDetailVM.Description = value;
    this.desciptionWithoutHTML;
  }
   
  // removes the blank spaces from description 
  getDescriptionWithOutHtml() {
    if (this.rewardProgram.RewardProgramDetailVM.Description) {
      this.desciptionWithoutHTML = this.rewardProgram.RewardProgramDetailVM.Description.replace(/<[^>]*>/g, '')
    }
  }
// mapping earning rule data
  mappingEarningRuleData() {
    this.classEarningRule.ItemTypeID = this.enum_PurchasesType.Class;
    this.classEarningRule.AmountSpent = 1;
    this.classEarningRule.ClientEarnedPoints = 1;
    this.classEarningRule.LeadEarnedPoints = 1;
    this.classEarningRule.MemberEarnedPoints = 1;
    this.classEarningRule.BenefittedEarnedPoints = 1;
    this.serviceEarningRule.ItemTypeID = this.enum_PurchasesType.Service;
    this.serviceEarningRule.AmountSpent = 1;
    this.serviceEarningRule.ClientEarnedPoints = 1;
    this.serviceEarningRule.LeadEarnedPoints = 1;
    this.serviceEarningRule.MemberEarnedPoints = 1;
    this.serviceEarningRule.BenefittedEarnedPoints = 1;
    this.productEarningRule.ItemTypeID = this.enum_PurchasesType.Product;
    this.productEarningRule.AmountSpent = 1;
    this.productEarningRule.ClientEarnedPoints = 1;
    this.productEarningRule.LeadEarnedPoints = 1;
    this.productEarningRule.MemberEarnedPoints = 1;
    this.productEarningRule.BenefittedEarnedPoints = 1;
    this.membershipEarningRule.ItemTypeID = this.enum_PurchasesType.Membership;
    this.membershipEarningRule.AmountSpent = 1;
    this.membershipEarningRule.MemberEarnedPoints = 1;
  }
// mapping activities rule
  mappingActivitiesEarningRuleData() {
    this.customerBirthdayActivityRule.RewardProgramActivityTypeID = this.enum_ActivitesEarningTypes.CustomerBirthday;
    this.customerBirthdayActivityRule.ClientEarnedPoints = 1;
    this.customerBirthdayActivityRule.LeadEarnedPoints = 1;
    this.customerBirthdayActivityRule.MemberEarnedPoints = 1;
    this.rewardprogramoptinActivityRule.RewardProgramActivityTypeID = this.enum_ActivitesEarningTypes.RewardProgramOptIn;
    this.rewardprogramoptinActivityRule.ClientEarnedPoints = 1;
    this.rewardprogramoptinActivityRule.LeadEarnedPoints = 1;
    this.rewardprogramoptinActivityRule.MemberEarnedPoints = 1;
    this.widgetAndAppBookingActivityRule.RewardProgramActivityTypeID = this.enum_ActivitesEarningTypes.WidgetAndAppBookings;
    this.widgetAndAppBookingActivityRule.ClientEarnedPoints = 1;
    this.widgetAndAppBookingActivityRule.LeadEarnedPoints = 1;
    this.widgetAndAppBookingActivityRule.MemberEarnedPoints = 1;
    this.referalActivityRule.RewardProgramActivityTypeID = this.enum_ActivitesEarningTypes.Referrals;
    this.referalActivityRule.ClientEarnedPoints = 1;
    this.referalActivityRule.LeadEarnedPoints = 1;
    this.referalActivityRule.MemberEarnedPoints = 1;
    this.customerActivityRule.RewardProgramActivityTypeID = this.enum_ActivitesEarningTypes.NewCustomer;
    this.customerActivityRule.ClientEarnedPoints = 1;
    this.customerActivityRule.LeadEarnedPoints = 1;
    this.customerActivityRule.MemberEarnedPoints = 1;
    this.memberCheckinActivityRule.RewardProgramActivityTypeID = this.enum_ActivitesEarningTypes.MemberCheckIn;
    this.memberCheckinActivityRule.MemberEarnedPoints = 1;
    this.classPresentActivityRule.RewardProgramActivityTypeID = this.enum_ActivitesEarningTypes.ClassPresent;
    this.classPresentActivityRule.ClientEarnedPoints = 1;
    this.classPresentActivityRule.LeadEarnedPoints = 1;
    this.classPresentActivityRule.MemberEarnedPoints = 1;
    this.serviceCompletedActivityRule.RewardProgramActivityTypeID = this.enum_ActivitesEarningTypes.ServiceCompleted;
    this.serviceCompletedActivityRule.ClientEarnedPoints = 1;
    this.serviceCompletedActivityRule.LeadEarnedPoints = 1;
    this.serviceCompletedActivityRule.MemberEarnedPoints = 1;
    this.formsActivityRule.RewardProgramActivityTypeID = this.enum_ActivitesEarningTypes.Forms;
    this.formsActivityRule.ClientEarnedPoints = 1;
    this.formsActivityRule.LeadEarnedPoints = 1;
    this.formsActivityRule.MemberEarnedPoints = 1;
  }
  // percentage number validation for client lead and member
  onPercentageChangeOnlyNumbers(num, type) {
    if (type == this.customerType.Member) {
      this.showPercentageValidationMember = num && num <= 100 ? false : true;
      if (this.showPercentageValidationMember) {
        this.ShowError = false;
        this.showDescriptionValidation = false;
        this.showExpirayDaysValidation = false;

      } else {
        this.ShowError = this.showPercentageValidationMember ? true : false;
        this.showDescriptionValidation = this.showPercentageValidationMember ? true : false;
        this.showExpirayDaysValidation = this.showPercentageValidationMember ? true : false;
      }
    }
    else if (type == this.customerType.Client) {
      this.showPercentageValidationClient = num && num <= 100 ? false : true;
      if (this.showPercentageValidationClient) {
        this.ShowError = false;
        this.showDescriptionValidation = false;
        this.showExpirayDaysValidation = false;
      } else {
        this.ShowError = this.showPercentageValidationClient ? true : false;
        this.showDescriptionValidation = this.showPercentageValidationClient ? true : false;
        this.showExpirayDaysValidation = this.showPercentageValidationClient ? true : false;

      }
    }
    else {
      this.showPercentageValidationLead = num && num <= 100 ? false : true;
      if (this.showPercentageValidationLead) {
        this.ShowError = false;
        this.showDescriptionValidation = false;
        this.showExpirayDaysValidation = false;
      } else {
        this.ShowError = this.showPercentageValidationLead ? true : false;
        this.showDescriptionValidation = this.showPercentageValidationLead ? true : false;
        this.showExpirayDaysValidation = this.showPercentageValidationLead ? true : false;
      }
    }
  }

  // on expiray day validation 
  onExpirayDayValidation(num) {
    this.showExpirayDaysValidation = num && num == '' || num <= 0 ? true : false;
    if (this.showExpirayDaysValidation) {
      this.ShowError = false;
      this.showDescriptionValidation = false;
      this.showPercentageValidationMember = false;
      this.showPercentageValidationClient = false;
      this.showPercentageValidationLead = false;
    }
    else {
      this.ShowError = this.showExpirayDaysValidation ? true : false;
      this.showDescriptionValidation = this.showExpirayDaysValidation ? true : false;
      this.showPercentageValidationMember = this.showExpirayDaysValidation ? true : false;
      this.showPercentageValidationClient = this.showExpirayDaysValidation ? true : false;
      this.showPercentageValidationLead = this.showExpirayDaysValidation ? true : false;
    }
  }

  // show validation for reward program name and false the other validation 
  showValidation(event) {
    event = event.trim();
    if (event == '') {
      this.ShowError = true;
      this.showPercentageValidationClient = false;
      this.showPercentageValidationLead = false;
      this.showPercentageValidationMember = false;
      this.showExpirayDaysValidation = false;
    }
    else {
      this.ShowError = false;
    }
  }

  // reset the description 
  onResetDescription() {
    this.getRewardProgramDescription();
  }
  
  //show tha validation of required empty fields
  showValidtionRewardPurchasesScreen(event,type){
    if(type == this.enum_Reward_Program_Validation.RedemptionValue){
      if(event == ''){
        this.showRedemptionValueValidation = true;
      }
      else{
        this.showRedemptionValueValidation = false;
       }
       if(event == 0 && !this.showRedemptionValueValidation){
        this.redemptionValueValidation = true;
       }else{
        this.redemptionValueValidation = false;
       }
    }
    
    else if(type == this.enum_Reward_Program_Validation.RedemptionPoints){
      if(event == ''){
        this.showRedemptionPointsValidation = true;
      }
      else{
        this.showRedemptionPointsValidation = false;
       }
    }

    else if(type == this.enum_Reward_Program_Validation.AmountSpent){
      if(event == ''){
      this.showAmountSpentValidation = true;
      }
      else {
      this.showAmountSpentValidation = false;
      }
     }
     else if(type == this.enum_Reward_Program_Validation.MemberEarnedPoints){
      if(event == ''){
        this.showMemberEarnedPointsValidation = true;
        }
        else {
        this.showMemberEarnedPointsValidation = false;
        }
     }
     else if(type == this.enum_Reward_Program_Validation.ClientEarnedPoints){
       if(event == ''){
        this.showClientEarnedPointsValidation = true;
       }else {
        this.showClientEarnedPointsValidation = false;

       }
     }
     else if(type == this.enum_Reward_Program_Validation.LeadEarnedPoints){
       if(event == ''){
       this.showLeadEarnedPointsValidation = true;
       }else {
        this.showLeadEarnedPointsValidation = false;
       }
     }
     else if(type == this.enum_Reward_Program_Validation.BenefittedEarnedPoints){
      if(event == ''){
        this.showBenefittedEarnedPointsValidation = true;
      }
      else {
        this.showBenefittedEarnedPointsValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.classAmountSpent){
      if(event == ''){
        this.showClassAmountSpentValidation = true;
      }
      else {
        this.showClassAmountSpentValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.classMemberEarnedPoints){
      if(event == ''){
        this.showclassMemberEarnedValidation = true;
      }
      else {
        this.showclassMemberEarnedValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.classClientEarnedPoints){
      if(event == ''){
        this.showclassClientEarnedValidation = true;
      }
      else {
        this.showclassClientEarnedValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.classLeadEarnedPoints){
      if(event == ''){
        this.showclassLeadEarnedValidation = true;
      }
      else {
        this.showclassLeadEarnedValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.classBenefittedEarnedPoints){
      if(event == ''){
        this.showclassBenefittedEarnedPointsValidation = true;
      }
      else {
        this.showclassBenefittedEarnedPointsValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.serviceAmountSpent){
      if(event == ''){
        this.showServiceAmountSpentValidation = true;
      }
      else {
        this.showServiceAmountSpentValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.serviceMemberEarnedPoints){
      if(event == ''){
        this.showServiceMemberEarnedValidation = true;
      }
      else {
        this.showServiceMemberEarnedValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.serviceClientEarnedPoints){
      if(event == ''){
        this.showServiceClientEarnedValidation = true;
      }
      else {
        this.showServiceClientEarnedValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.serviceLeadEarnedPoints){
      if(event == ''){
        this.showServiceLeadEarnedValidation = true;
      }
      else {
        this.showServiceLeadEarnedValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.serviceBenefittedEarnedPoints){
      if(event == ''){
        this.showServiceBenefittedEarnedPointsValidation = true;
      }
      else {
        this.showServiceBenefittedEarnedPointsValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.productAmountSpent){
      if(event == ''){
        this.showProductAmountSpentValidation = true;
      }
      else {
        this.showProductAmountSpentValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.productMemberEarnedPoints){
      if(event == ''){
        this.showProductMemberEarnedValidation = true;
      }
      else {
        this.showProductMemberEarnedValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.productClientEarnedPoints){
      if(event == ''){
        this.showProductClientEarnedValidation = true;
      }
      else {
        this.showProductClientEarnedValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.productLeadEarnedPoints){
      if(event == ''){
        this.showProductLeadEarnedValidation = true;
      }
      else {
        this.showProductLeadEarnedValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.productBenefittedEarnedPoints){
      if(event == ''){
        this.showProductBenefittedEarnedPointsValidation = true;
      }
      else {
        this.showProductBenefittedEarnedPointsValidation = false;

      }
     }
 ///membership
     else if(type == this.enum_Reward_Program_Validation.membershipAmountSpent){
      if(event == ''){
        this.showMembershipAmountSpentValidation = true;
      }
      else {
        this.showMembershipAmountSpentValidation = false;

      }
     }
     else if(type == this.enum_Reward_Program_Validation.membershipMemberEarnedPoints){
      if(event == ''){
        this.showMembershipMemberEarnedValidation = true;
      }
      else {
        this.showMembershipMemberEarnedValidation = false;

      }
     }
    //  else if(type == 25){
    //   if(event == ''){
    //     this.showMembershipClientEarnedValidation = true;
    //   }
    //   else {
    //     this.showMembershipClientEarnedValidation = false;

    //   }
    //  }
    //  else if(type == 26){
    //   if(event == ''){
    //     this.showMembershipLeadEarnedValidation = true;
    //   }
    //   else {
    //     this.showMembershipLeadEarnedValidation = false;

    //   }
    //  }
    //  else if(type == 27){
    //   if(event == ''){
    //     this.showMembershipBenefittedEarnedPointsValidation = true;
    //   }
    //   else {
    //     this.showMembershipBenefittedEarnedPointsValidation = false;

    //   }
    //  }
  }
}
