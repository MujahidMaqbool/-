// #region Angular References
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import { SubscriptionLike } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';
import { MatOption } from '@angular/material/core';
/********************** START: Service & Models *********************/

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { CommonService } from 'src/app/services/common.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';

/* Models */
import {
    Membership,
    MembershipPayment,
    MembershipClockInTime,
    MembershipClass,
    BranchWiseClass,
    MembershipBenefits,
    MembershipItemsBenefits,
    AddMembershipItemsBenefits,
} from 'src/app/setup/models/membership.model';
import { Tax, ApiResponse, DD_Branch } from 'src/app/models/common.model';
/********************** START: Common *********************/
import { Configurations, MembershipBenefitTypeName, MembershipBenefitTypesName } from 'src/app/helper/config/app.config'
import { Messages } from 'src/app/helper/config/app.messages';
import { environment } from 'src/environments/environment';
import { MembershipApi } from 'src/app/helper/config/app.webapi';
import { WizardforSetupMembership, WeekDays, MembershipType, MembershipDurationType, ENU_MembershipPaymetType, MembershipBenefitType, ENU_MemberShipBenefitDurations, POSItemType, ENU_MemberShipItemTypeName, ENU_Package } from "src/app/helper/config/app.enums";
import { ImageEditorPopupComponent } from 'src/app/application-dialog-module/image-editor/image.editor.popup.component';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { ENU_Permission_Setup } from 'src/app/helper/config/app.module.page.enums';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
//import { variables } from 'src/app/helper/config/app.variable';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { NumberValidator } from 'src/app/shared/helper/number.validator';
import { BenefitItemTypesComponent } from './benifit-item-types/benefit.item.types.component';
import { AlertConfirmationComponent } from 'src/app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

// #endregion

@Component({
    selector: 'membership-save',
    templateUrl: './membership.save.component.html'
})
export class MembershipSaveComponent extends AbstractGenericComponent implements OnInit, AfterViewInit {

    // #region Definitions
    @ViewChild('stepper') stepper: MatStepper;
    @ViewChild('membershipDetailsForm') membershipDetailsForm: NgForm;
    @ViewChild('membershipTypeForm') membershipTypeForm: NgForm;
    @ViewChild("benifitItemTypeClass") benifitItemTypeClass: BenefitItemTypesComponent;
    @ViewChild("benifitItemTypeService") benifitItemTypeService: BenefitItemTypesComponent;
    @ViewChild("benifitItemTypeProduct") benifitItemTypeProduct: BenefitItemTypesComponent;
    @ViewChild('allSelectedTax') private allSelectedTax: MatOption;
    @ViewChild('allRestrictionSelection') private allRestrictionSelection: MatOption;

    packageIdSubscription: SubscriptionLike;

    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    errorMessage: string;
    successMessage: string;
    showMembershipDetailsValidation: boolean = false;
    showMembershipTypeValidation: boolean = false;
    showPaymentRequiredValidation: boolean = false;
    showPaymentDurationValidation: boolean = false;
    showSessionDurationRequiredValidation: boolean = false;
    showAddRecurringPayment: boolean = true;
    showSelectClassValidation: boolean = false;
    showSelectServiceValidation: boolean = false;
    showSelectProductValidation: boolean = false;

    /* Model References */
    membership: Membership = new Membership();
    membershipCopy: any;
    membershipWizard = WizardforSetupMembership;
    numberValidator: NumberValidator = new NumberValidator();
    addMembershipItemsBenefits: AddMembershipItemsBenefits = new AddMembershipItemsBenefits();

    /* Local Members */
    branchID: number = 0;
    classID: number = 0;
    isImageExist: boolean = false;
    isBranchValid: boolean = true;
    isBranchClassValid: boolean = true;
    membershipID: number = 0;
    arePaymentsValid: boolean = true;
    defaultBranchID: number;
    activeTabIndex: number = 0;
    showPrevious: boolean;
    showContinue: boolean = true;
    showSave: boolean;
    showSaveClass: boolean;
    showSaveService: boolean;
    showSaveProduct: boolean;
    paymentTotal: number = 0;
    isImageExists: boolean;
    imagePath: string = "";
    isSelectAllClasses: boolean = false;
    desciptionWithoutHTML: string;
    isSavedMemberShip: boolean = true; //restrict for multi time save button click
    totalAmountLimit: number = 999999999;
    isAllBranchOperationalTimes: boolean = false;

    //isClassOnlyMembership: boolean;
    isValidEndTime: boolean = true;
    isValidStartTime: boolean = true;

    currencyFormat: string;
    currencySymbol: string;
    readonly _maxDescriptionLength = 500;
    descriptionMaxLengthMessage: string = "";
    showDescriptionValidation: boolean = false;
    showMemberLimitValidation: boolean = false;
    showMemberLengthValidation: boolean = false;
    showSelectBenefitValidation: boolean = false;
    showRecurringPaymentsBeyondMembershipLengthValidation: boolean = false;
    isPurchaseRestrictionAllowed:boolean = false;
    showHidePriceLabel: boolean = false;

    selectedTaxList: any[] = [];

    /* Collection Types */
    staffBranchList: any[];
    membershipCategoryList: any[];
    membershipPaymentList: MembershipPayment[] = [];
    singlePayments: MembershipPayment[] = [];
    recurringPayments: MembershipPayment[] = [];
    taxList: Tax[] = [];
    durationTypeList: any[];
    SessionDurationTypeList: any[];
    recurringPaymentIntervalTypeList: any[];
    singlePaymentCollectionTypeList: any[];
    branchWorkTimings: any[];
    membershipBenefitsTypeList: any[];
    membershipAddedClassList: MembershipItemsBenefits[];
    membershipAddedServiceList: MembershipItemsBenefits[];
    membershipAddedProductList: MembershipItemsBenefits[];
    //filterMembershipClassList: MembershipItemsBenefits[];

    // Purchase Restriction
    selectedRestrictedList: any[] = [];
    restrictedList = Configurations.RestrictList;

    controlNum: number = 0;
    ContractId: number = 12;

    branchWithClassList: BranchWiseClass[] = [];
    membershipClassList: MembershipClass[] = [];
    membershipClockInTimeList: MembershipClockInTime[] = [];


    /* Configurations */
    membershipType = MembershipType;
    weekDays = WeekDays;
    serverImageAddress = environment.imageUrl;
    timePlaceholder = Configurations.TimePlaceholder;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    membershipDurationType = MembershipDurationType;
    membershipPaymentType = ENU_MembershipPaymetType;
    membershipBenefitType = MembershipBenefitType;
    enuMemberShipBenefitDurations = ENU_MemberShipBenefitDurations;
    enuItemType = ENU_MemberShipItemTypeName;
    membershipBenefitTypeName = MembershipBenefitTypeName;
    membershipBenefitTypesName = MembershipBenefitTypesName;


    // #endregion

    constructor(private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        private _taxCalculationService: TaxCalculation,
        private _dataSharingService: DataSharingService,
        public _dialog: MatDialogService,
        private route: ActivatedRoute,
        private _commonService: CommonService,
        public _saveClassMembershipActionDialog: MatDialogService,
        private _router: Router) {
            super();
        this.addMembershipItemsBenefits = new AddMembershipItemsBenefits();
        for (let index = 0; index < 7; index++) {
            let membershipTime = new MembershipClockInTime();
            membershipTime.DayID = index;
            membershipTime.IsBranchOperationTime = true;
            membershipTime.IsDayRestricted = false;
            membershipTime.IsStartTimeInvalid = false;
            membershipTime.IsEndTimeInvalid = false;
            membershipTime.IsStartTimeRequired = false;
            membershipTime.IsEndTimeRequired = false;

            this.membershipClockInTimeList.push(membershipTime);
        }
    }

    ngOnInit() {
        this.getMembershipIdFromRoute();
        this.concatenateImagePath();
        this.descriptionMaxLengthMessage = Messages.Validation.Description_MaxLength.replace("{0}", this._maxDescriptionLength.toString());
        this.getCurrentBranchDetail();

        if (this.membershipID > 0) {
            Promise.all([
                this.getMembershipFundamentles(),
                this.getMembershipById(this.membershipID)
            ]).then(
                success => {
                    this.getDescriptionWithOutHtml();
                    this.setDefaultDropdowns();
                    this.setMembershipBranchListInfo();
                    this.setMembershipTax();
                    this.setPaymentLists();
                    this.updatePaymentTotal();
                    this.setMembershipBenefitsTypes();
                });
        }
        else {
            this.getMembershipFundamentles();
            //this.isClassOnlyMembership = false;
            // setTimeout(() => {
            //     // new member ship development when user add new member ship by default showone length in single paymane and recurring payment list (17-08-2020) fahad
            //     this.addSinglePayment();
            //     this.addRecurringPayment();
            // }, 10);

        }

        // Subscribe package ID
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
          (packageId: number) => {
            if (packageId && packageId > 0) {
              this.setPackageBasedPermissions(packageId);
            }
          }
        );
    }

    ngAfterViewInit() {

        this.membershipDetailsForm.valueChanges.subscribe(() => {
            if (this.membershipDetailsForm.valid) {
                this.showValidationMessage(false);
            }
        });
    }

    gOnDestroy() {
      this.packageIdSubscription?.unsubscribe();
    }

// Package Based Permission
setPackageBasedPermissions(packageID: number){
  this.isPurchaseRestrictionAllowed =  packageID == ENU_Package.Full ? true : false;
  this.showHidePriceLabel = packageID == ENU_Package.Full || packageID == ENU_Package.WellnessTop || packageID == ENU_Package.FitnessMedium ? true : false;

}

// Purchase restriction
togglePerOneRestriction(all) {
  if (this.allRestrictionSelection && this.allRestrictionSelection.selected) {
    this.allRestrictionSelection.deselect();
  }
  if (this.restrictedList.length == this.selectedRestrictedList.length && this.restrictedList.length > 1) {
    this.allRestrictionSelection.select();
  }
}
toggleAllRestrictionSelection() {
  this.selectedRestrictedList = [];

  if (this.allRestrictionSelection.selected) {
    this.restrictedList.forEach(service => {
    this.selectedRestrictedList.push(service);
  });
  setTimeout(() => {
    this.allRestrictionSelection.select();
  }, 100);
  }
}

// Array convert into String
listToCommaSeparatedString(arr: any) {
  var i;
  var result: string = "";
  for (i = 0; i < arr.length; ++i) {
    if(arr[i].value !== undefined) {
      result = result + arr[i].value + ((arr.length - 1) == i ? "" : ",");
    }
  }
  return result;
}

setPurchaseRestriction() {
  var i;
  this.selectedRestrictedList = [];
  var array = this.membership.RestrictedCustomerTypeID?.split(',');
  for (i = 0; i < array?.length; ++i) {
      var result = this.restrictedList.find(m => m.value == Number(array[i]));
      if(result){
        this.selectedRestrictedList.push(result)
      }
  }
  // check if all selected set All true
  if(this.restrictedList && this.selectedRestrictedList && this.restrictedList.length ==  this.selectedRestrictedList.length){
    setTimeout(() => {
      this.allRestrictionSelection.select();
    }, 100);
  }
}


    // #region Events

    // get current branch details
    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.branchID = branch.BranchID;
            this.currencyFormat = branch.CurrencySymbol;
            if (branch.BranchTimeFormat12Hours === true) {
                this.schedulerTimeFormat = Configurations.SchedulerTimeFormatWithFormat;
                this.timePlaceholder = Configurations.TimePlaceholderWithFormat;
            }
            this.currencySymbol = branch.CurrencySymbol;
        }
    }
    onSaveMembershipBenefitTypeClass(id: number) {
        this.showSelectClassValidation = false;
        this.benifitItemTypeClass.onSaveMembershipItemType(0);
    }

    onSaveMembershipBenefitTypeService(id: number) {
        this.showSelectServiceValidation = false;
        this.benifitItemTypeService.onSaveMembershipItemType(0);
    }

    onSaveMembershipBenefitTypeProduct(id: number) {
        this.showSelectProductValidation = false;
        this.benifitItemTypeProduct.onSaveMembershipItemType(0);
    }

    onMLimitChangeOnlyNumbers(num) {
        this.showMemberLimitValidation = this.numberValidator.AllowNullAndNotAllowZero(num);//. num != "" && Number(num) == 0 ? true : false;
        setTimeout(() => {
            this.membership.MemberLimit = this.numberValidator.NotAllowDecimalValue(num);
        }, 10);
    }

    onNoLimitChange(id: number) {
        this.membership.MembershipBenefits.forEach((Benefit) => {
            if (Benefit.MembershipBenefitsTypeID == id && Benefit.NoLimits) {
                Benefit.TotalSessions = 0;
                Benefit.DurationTypeID = this.enuMemberShipBenefitDurations.Membership;
            }
        })
    }

    onRecurringIntervalChangeOnlyNumbers(num: string, index: number) {
        setTimeout(() => {
            this.recurringPayments[index].RecurringInterval = this.numberValidator.NotAllowDecimalValue(num);
        }, 10);
    }

    onMLengthChangeOnlyNumbers(num) {
        this.showMemberLengthValidation = this.numberValidator.NotAllowNullAndZero(num);//Number(num) == 0 ? true : false;
        setTimeout(() => {
            this.membership.MembershipDurationValue = this.numberValidator.NotAllowDecimalValue(num);
        }, 10);
    }

    onBenefitSessionDurationChangeOnlyNumbers(num: string, membershipBenefitsTypeID: Number) {
        setTimeout(() => {
            this.membership.MembershipBenefits.forEach((Benefit) => {
                if (Benefit.MembershipBenefitsTypeID == membershipBenefitsTypeID) {
                    Benefit.TotalSessions = this.numberValidator.NotAllowDecimalValue(num);
                }
            })
        }, 10);
    }

    onIsActiveChange() {
        if (this.membership.IsEnquireMembership) {
            setTimeout(() => {this.membership.IsActive = true}, 200);
            this._messageService.showErrorMessage(this.messages.Error.MembershipEnquiry_Error);
            return;
        } else if (!this.membership.IsActive) {
            // this.membership.IsSaleSuspended = true;
            this.membership.IsOnline = false;
            this.membership.IsFeatured = false;
            this.membership.AllowDuplicate = false;
            this.membership.IsHidePriceOnline = false;
        }
    }

    // onSuspendSaleChange() {
    //     if (this.membership.IsSaleSuspended) {
    //         this.membership.IsOnline = false;
    //         this.membership.IsFeatured = false;
    //     }
    // }

    onShowOnlineChange() {
        if (!this.membership.IsOnline) {
            this.membership.IsFeatured = false;
            this.membership.IsHidePriceOnline = false;
        }
    }

    onChangeMembershipName() {
        this.membership.MembershipName = this.membership.MembershipName.trim();
    }

    onDescriptionUpdated(value: string) {

        this.membership.Description = value === "<br>" ? "" : value;
        this.getDescriptionWithOutHtml();
        if (this.desciptionWithoutHTML && this.desciptionWithoutHTML.length > this._maxDescriptionLength) {
            this.showDescriptionValidation = true;
        }
        else {
            this.membershipDetailsForm.form.updateValueAndValidity();
            this.membershipDetailsForm.form.markAsDirty();
            this.showDescriptionValidation = false;
        }

        setTimeout(() => {
            this.membership.Description;
            this.desciptionWithoutHTML;
        }, 1);
    }

    onContinue() {
        this.showMembershipDetailsValidation = false;
        if (this.activeTabIndex === this.membershipWizard.Contract) {
            if (this.hasPayments() && this.validatePayments() && !this.showDescriptionValidation && this.validateDurationTypeWithRecurPayment() &&
            this.membershipDetailsForm && this.membershipDetailsForm.valid && this.validateTotalAmount() && this.membership.MembershipCategoryID > 0) {
                this.stepper.next();
            }
            else {
                this.showMembershipDetailsValidation = true;
            }
        }
        else if (this.activeTabIndex === this.membershipWizard.MembershipType) {
            if (this.validateMembershipType() && this.isValidEndTime) {
                this.stepper.next();
            }
        }

        else if (this.activeTabIndex === this.membershipWizard.Branches) {
            this.setMembershipBranchList();
            this.checkMemberShipBranchList(); //if user remove branch remove branch classes
            if (this.membership.IsClassBenefitsAllowed) {
                this.stepper.next();
            } else if (!this.membership.IsClassBenefitsAllowed && this.membership.IsServiceBenefitsAllowed) {
                this.stepper.next();
            } else if (!this.membership.IsClassBenefitsAllowed && !this.membership.IsServiceBenefitsAllowed && this.membership.IsProductBenefitsAllowed) {
                this.stepper.next();
            }
        }

        else if (this.activeTabIndex === this.membershipWizard.Classes) {
            if (this.membership.IsClassBenefitsAllowed && this.validateBranchClasses()) {
                this.membershipAddedClassList = this.benifitItemTypeClass.BenefitItemList;
                this.stepper.next();
            } else if (!this.membership.IsClassBenefitsAllowed && this.membership.IsServiceBenefitsAllowed && this.validateBranchServices()) {
                this.membershipAddedServiceList = this.benifitItemTypeService.BenefitItemList;
                this.stepper.next();
            }
        }

        else if (this.activeTabIndex === this.membershipWizard.Services) {
            if (this.validateBranchServices()) {
                this.membershipAddedServiceList = this.benifitItemTypeService.BenefitItemList;
                this.stepper.next();
            }
        }
        // this.stepper.selected.completed = true;
        // this.stepper.selected.editable = false;
        this.activeTabIndex = this.stepper.selectedIndex;
        this.setPerviousContinueButtonVisibility(this.activeTabIndex);
    }

    onPrevious() {
        this.resetValidation();
        this.stepper.previous();
        //this.stepper.selected.completed = false;
        this.stepper.selected.editable = true;
        this.activeTabIndex = this.stepper.selectedIndex;
        this.setPerviousContinueButtonVisibility(this.activeTabIndex);
    }

    onReset() {
        this.resetForm();
    }

    onStartTimeChange($event, day: number) {
        if (($event.value || $event.previousValue) && !this.membershipClockInTimeList[day].IsBranchOperationTime) {
            this.showMembershipTypeValidation = false;
            this.validateEndTime(this.membershipClockInTimeList[day]);
            this.isStartTimeValid(this.membershipClockInTimeList[day]);
        }

    }

    onEndTimeChange($event, day: number) {
        if (($event.value || $event.previousValue) && !this.membershipClockInTimeList[day].IsBranchOperationTime && this.membershipClockInTimeList[day].EndTime) {
            this.showMembershipTypeValidation = false;
            this.isValidEndTime = this.validateStartTime(this.membershipClockInTimeList[day]);
            if (this.isValidEndTime)
                this.isEndTimeValid(this.membershipClockInTimeList[day]);
        }
    }

    // onClassBasedValueChange(value) {
    //     this.showMembershipTypeValidation = false;
    //     if (value) {
    //         this.isValidEndTime = true;
    //     }
    // }

    onSaveMembership() {

        if (this.membership.IsProductBenefitsAllowed) {
            if (this.validateBranchProducts()) {
                this.benifitItemTypeProduct.onReset();
                this.saveMembership();
            }
        } else if (!this.membership.IsProductBenefitsAllowed && this.membership.IsServiceBenefitsAllowed) {
            if (this.validateBranchServices()) {
                this.benifitItemTypeService.onReset();
                this.saveMembership();
            }
        } else if (!this.membership.IsProductBenefitsAllowed && !this.membership.IsServiceBenefitsAllowed && this.membership.IsClassBenefitsAllowed) {
            if (this.validateBranchClasses()) {
                this.benifitItemTypeClass.onReset();
                this.saveMembership();
            }
        } else {
            this.saveMembership();
        }

    }

    onBranchSelectionChange(isSelected: boolean, branchDetail: any) {
        if (!isSelected) {

            // var isClassesAdded: boolean = this.membership.IsClassBenefitsAllowed && this.benifitItemTypeClass.BenefitItemList && this.benifitItemTypeClass.BenefitItemList.length > 0 &&
            //                                 this.benifitItemTypeClass.BenefitItemList.filter(i => i.BranchID == branchDetail.BranchID).length > 0 ? true : false;
            // var isServicesAdded: boolean = this.membership.IsServiceBenefitsAllowed && this.benifitItemTypeService.BenefitItemList && this.benifitItemTypeService.BenefitItemList.length > 0 &&
            //                                 this.benifitItemTypeService.BenefitItemList.filter(i => i.BranchID == branchDetail.BranchID).length > 0 ? true : false;
            // var isProductsAdded: boolean = this.membership.IsProductBenefitsAllowed && this.benifitItemTypeProduct.BenefitItemList && this.benifitItemTypeProduct.BenefitItemList.length > 0 &&
            //                                 this.benifitItemTypeProduct.BenefitItemList.filter(i => i.BranchID == branchDetail.BranchID).length > 0 ? true : false;


            this.membershipAddedClassList = this.membership.IsClassBenefitsAllowed && this.benifitItemTypeClass && this.benifitItemTypeClass.BenefitItemList ? this.benifitItemTypeClass.BenefitItemList : [];
            this.membershipAddedServiceList = this.membership.IsServiceBenefitsAllowed && this.benifitItemTypeService && this.benifitItemTypeService.BenefitItemList ? this.benifitItemTypeService.BenefitItemList : [];
            this.membershipAddedProductList = this.membership.IsProductBenefitsAllowed && this.benifitItemTypeProduct && this.benifitItemTypeProduct.BenefitItemList ? this.benifitItemTypeProduct.BenefitItemList : [];

            var isClassesAdded: boolean = this.membershipAddedClassList && this.membershipAddedClassList.filter(i => i.BranchID == branchDetail.BranchID).length > 0 ? true : false;
            var isServicesAdded: boolean = this.membershipAddedServiceList && this.membershipAddedServiceList.filter(i => i.BranchID == branchDetail.BranchID).length > 0 ? true : false;
            var isProductsAdded: boolean = this.membershipAddedProductList && this.membershipAddedProductList.filter(i => i.BranchID == branchDetail.BranchID).length > 0 ? true : false;

            if (isClassesAdded || isServicesAdded || isProductsAdded) {
                const confirmDialog = this._dialog.open(AlertConfirmationComponent, {
                    disableClose: true
                });

                confirmDialog.componentInstance.Title = this.messages.Dialog_Title.Remove_Branch_For_Membership;
                confirmDialog.componentInstance.Message = this.messages.Confirmation.UnSelect_Branch.replace("{0}", branchDetail.BranchName);

                confirmDialog.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
                    if (!isConfirm) {
                        setTimeout(() => {
                            this.staffBranchList.forEach(branch => {
                                if (branch.BranchID == branchDetail.BranchID) {
                                    branch.IsSelected = true;
                                }
                            });
                        }, 100);
                    } else {
                        this.setMembershipBranchList();
                        this.checkMemberShipBranchList();
                    }
                })
            }
        }
        this.isBranchValid = true;
    }

    // onDeleteClass(id: number){
    //     if(id > 0){
    //         this.filterMembershipClassList =  this.filterMembershipClassList.filter(x => {
    //             return x.ItemID != id;
    //         })

    //         this.membershipAddedClassList = this.membershipAddedClassList.filter(x => {
    //             return x.ItemID != id;
    //         })
    //     } else{
    //         // this.filterMemberShipClassList =  this.filterMemberShipClassList.filter(x => {
    //         //     return x.IsSelected == false;
    //         // })

    //         this.membershipAddedClassList = this.membershipAddedClassList.filter(x => {
    //             return x.IsSelected == false;
    //         })

    //         this.filterMembershipClassList = this.membershipAddedClassList;
    //         this.searchBenifitFilter.onReset();
    //     }
    // }

    // onAllClassSelectionChange(event: any) {
    //     this.filterMembershipClassList.forEach(element => {
    //         element.IsSelected = event;
    //     });
    // }

    // onClassSelectionChange() {
    //   var isSelected = this.filterMembershipClassList.filter(mc => mc.IsSelected);
    //   this.isSelectAllClasses = isSelected && isSelected.length == this.filterMembershipClassList.length ? true : false;
    // }

    // onAllClassSelectionChange(branch: BranchWiseClass) {
    //     this.isBranchClassValid = true;

    //     branch.ClassList.forEach(c => c.IsSelected = branch.IsSelected);
    // }

    // onClassSelectionChange() {
    //     this.isBranchClassValid = true;
    //     this.setAllBranchClassesCheck();
    // }

    onBranchOperationTimeAccessChange(isAllowed, dayId) {
        this.showMembershipTypeValidation = false;
        if (isAllowed) {
            var result = this.getBranchTimeByDay(dayId);
            this.membershipClockInTimeList[dayId].IsDayRestricted = false;
            this.membershipClockInTimeList[dayId].StartTime = result.StartTime;
            this.membershipClockInTimeList[dayId].EndTime = result.EndTime;
            this.resetStartEndTimeValidation(dayId);
            this.isValidEndTime = true;
        } else {
            this.membershipClockInTimeList[dayId].IsDayRestricted = false;
            this.membershipClockInTimeList[dayId].StartTime = null;
            this.membershipClockInTimeList[dayId].EndTime = null;
            this.resetStartEndTimeValidation(dayId);
        }

        this.isAllBranchOperationalTimes = this.membershipClockInTimeList.filter(m => m.IsBranchOperationTime).length === 7;
    }

    onAccessPermissionChange(isAllowed, dayId) {
        this.showMembershipTypeValidation = false;
        if (isAllowed) {
            this.membershipClockInTimeList[dayId].IsBranchOperationTime = false;
            this.membershipClockInTimeList[dayId].StartTime = null;
            this.membershipClockInTimeList[dayId].EndTime = null;
            //this.membershipClockInTimeList[dayId].IsStartTimeInvalid = false;
            //this.membershipClockInTimeList[dayId].IsStartTimeRequired = false;
            this.isAllBranchOperationalTimes = false;
            this.resetStartEndTimeValidation(dayId);
        }
    }

    onAllBranchOperationTimeAccessChange(isAllBranchTimes: boolean) {
        this.showMembershipTypeValidation = false;
        this.membershipClockInTimeList.forEach(mTime => {
            mTime.IsBranchOperationTime = isAllBranchTimes;
            if (isAllBranchTimes) {
                var result = this.getBranchTimeByDay(mTime.DayID);
                this.membershipClockInTimeList[mTime.DayID].StartTime = result.StartTime;
                this.membershipClockInTimeList[mTime.DayID].EndTime = result.EndTime;
                this.isValidEndTime = true;
            } else {
                this.membershipClockInTimeList[mTime.DayID].StartTime = null;
                this.membershipClockInTimeList[mTime.DayID].EndTime = null;
            }
            // this.membershipClockInTimeList[mTime.DayID].IsStartTimeInvalid = false;
            // this.membershipClockInTimeList[mTime.DayID].IsStartTimeRequired = false;
            // this.membershipClockInTimeList[mTime.DayID].IsEndTimeInvalid = false;
            // this.membershipClockInTimeList[mTime.DayID].IsEndTimeRequired = false;
            this.resetStartEndTimeValidation(mTime.DayID);
            if (isAllBranchTimes) {
                mTime.IsDayRestricted = false;
            }
        });
        //console.log(this.membershipClockInTimeList);
    }

    onTaxSelectionChange() {
        this.membership.TaxList = []; //this.membership.TaxList == null ? [] : this.membership.TaxList;
        if (this.taxList && this.taxList.length > 0) {
            if (this.selectedTaxList && this.selectedTaxList.length > 0) {
                this.selectedTaxList.forEach(tax => {
                    if (tax.TaxID && tax.TaxID > 0) {
                        this.membership.TaxList.push({ TaxID: tax.TaxID });
                    }
                });
            }
        }
        this.updatePaymentTotal();
    }

    tosslePerOneTax(all) {
        if (this.allSelectedTax && this.allSelectedTax.selected) {
            this.allSelectedTax.deselect();
            //  this.onTaxSelectionChange();
            //  return false;
        }
        if (this.taxList.length == this.selectedTaxList.length && this.taxList.length > 1) {
            this.allSelectedTax.select();
        }
        this.onTaxSelectionChange();
    }

    toggleAllTaxSelection() {
        this.selectedTaxList = [];

        if (this.allSelectedTax.selected) {
            this.taxList.forEach(service => {
                this.selectedTaxList.push(service);
            });

            setTimeout(() => {
                this.allSelectedTax.select();
            }, 100);
        }
        this.onTaxSelectionChange();
    }

    // onMembershipTypeChange() {
    //     // if (this.isClassOnlyMembership) {
    //     //     this.showMembershipTypeValidation = false;
    //     //     this.isValidEndTime = true;
    //     //     /*
    //     //     this loop if a user enter ivalid end time and click on Class Based Membership.this loop check conditions and reset laready fired validations.
    //     //     */
    //     //     this.membershipClockInTimeList.forEach(mTime => {
    //     //         if (!mTime.IsDayRestricted && !mTime.IsBranchOperationTime) {
    //     //             this.resetStartEndTimeValidation(mTime.DayID);
    //     //         }
    //     //     });
    //     // }
    //     // /*
    //     // this loop work if a user enter ivalid end time and click on Class Based Membership and again click on time base membership then this loop check conditions and fire validations
    //     // */
    //     // else {
    //         this.membershipClockInTimeList.forEach(mTime => {
    //             if (!mTime.IsDayRestricted && !mTime.IsBranchOperationTime && mTime.EndTime && mTime.EndTime != '' && mTime.StartTime && mTime.StartTime != '') {
    //                 let isEndTimeValid = mTime.EndTime > mTime.StartTime;
    //                 if (!isEndTimeValid) {
    //                     this.isValidEndTime = false;
    //                     mTime.IsEndTimeInvalid = true;
    //                 }
    //             }
    //         });
    //     // }
    // }

    // onSessionDurationChange() {
    //     if (this.membership.SessionDurationValue && this.membership.SessionDurationValue > 0) {
    //         this.showMembershipTypeValidation = false;
    //     }

    //     if (!this.membership.SessionDurationTypeID) {
    //         this.showSessionDurationRequiredValidation = true;
    //     }
    // }

    // onSessionDurationTypeChange() {
    //     if (this.membership.SessionDurationTypeID && this.membership.SessionDurationTypeID > 0) {
    //         this.showSessionDurationRequiredValidation = false;
    //         this.showMembershipTypeValidation = false;
    //     }
    // }

    onDeleteImage() {
        const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
        deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this.discardImage();
            }
        })
    }

    // #endregion

    // #region Methods

    setMembershipItemsBenefitsForSave() {

        this.membership.MembershipItemsBenefits = [];

        if (this.membership.IsClassBenefitsAllowed) {
            this.membershipAddedClassList = this.benifitItemTypeClass.BenefitItemList;
            this.membershipAddedClassList.forEach(item => {
                this.membership.MembershipItemsBenefits.push(item);
            });
        }

        if (this.membership.IsServiceBenefitsAllowed) {
            this.membershipAddedServiceList = this.benifitItemTypeService.BenefitItemList;
            this.membershipAddedServiceList.forEach(item => {
                this.membership.MembershipItemsBenefits.push(item);
            });
        }

        if (this.membership.IsProductBenefitsAllowed) {
            this.membershipAddedProductList = this.benifitItemTypeProduct.BenefitItemList;
            this.membershipAddedProductList.forEach(item => {
                this.membership.MembershipItemsBenefits.push(item);
            });
        }

    }

    // setMembershipTypeForSave() {
    //     if (this.isClassOnlyMembership) {
    //         if (this.membership.SessionDurationValue && this.membership.SessionDurationValue > 0) {
    //             this.membership.MembershipTypeID = this.membershipType.ClassAndSessionBased;
    //         }
    //         else {
    //             this.membership.SessionDurationTypeID = undefined;
    //             this.membership.MembershipTypeID = this.membershipType.ClassBased;
    //         }
    //     }
    //     else {
    //         if (this.membership.SessionDurationValue && this.membership.SessionDurationValue > 0) {
    //             this.membership.MembershipTypeID = this.membershipType.TimeAndSessionBased;
    //         }
    //         else {
    //             this.membership.MembershipTypeID = this.membershipType.TimeBased;
    //         }
    //     }
    // }

    // setMembershipTypeForEdit() {
    //     switch (this.membership.MembershipTypeID) {
    //         case this.membershipType.TimeBased:
    //         case this.membershipType.TimeAndSessionBased:
    //             this.isClassOnlyMembership = false;
    //             break;
    //         case this.membershipType.ClassBased:
    //         case this.membershipType.ClassAndSessionBased:
    //             this.isClassOnlyMembership = true;
    //             break;
    //     }
    // }

    // setTaxSelection() {
    //     if (this.membership.TaxList) {
    //         this.membership.TaxList.forEach((tax) => {
    //             this.taxList.find(t => t.TaxID === tax.TaxID).IsSelected = true;
    //         })
    //     }
    // }

    setPerviousContinueButtonVisibility(index: number) {
        if (index === this.membershipWizard.Contract) {
            this.showPrevious = false;
            this.showContinue = true;
            this.showSaveClass = false;
            this.showSaveService = false;
            this.showSaveProduct = false;
            this.showSave = false;
        }
        else if (index === this.membershipWizard.MembershipType) {
            this.showPrevious = true;
            this.showContinue = true;
            this.showSaveClass = false;
            this.showSaveService = false;
            this.showSaveProduct = false;
            this.showSave = false;
        }
        else if (index === this.membershipWizard.Branches) {
            if (this.membership.IsDoorCheckedInBenefitsAllowed && !this.membership.IsClassBenefitsAllowed && !this.membership.IsServiceBenefitsAllowed && !this.membership.IsProductBenefitsAllowed) {
                this.showPrevious = true;
                this.showContinue = false;
                this.showSaveClass = false;
                this.showSaveService = false;
                this.showSaveProduct = false;
                this.showSave = true;
            } else {
                this.showPrevious = true;
                this.showContinue = true;
                this.showSaveClass = false;
                this.showSaveService = false;
                this.showSaveProduct = false;
                this.showSave = false;
            }
        }
        else if (index === this.membershipWizard.Classes) {
            if (this.membership.IsClassBenefitsAllowed && !this.membership.IsServiceBenefitsAllowed && !this.membership.IsProductBenefitsAllowed) {
                this.showPrevious = true;
                this.showContinue = false;
                this.showSaveClass = true;
                this.showSaveService = false;
                this.showSaveProduct = false;
                this.showSave = true;
            } else if (!this.membership.IsClassBenefitsAllowed && this.membership.IsServiceBenefitsAllowed && !this.membership.IsProductBenefitsAllowed) {
                this.showPrevious = true;
                this.showContinue = false;
                this.showSaveClass = false;
                this.showSaveService = true;
                this.showSaveProduct = false;
                this.showSave = true;
            } else if (!this.membership.IsClassBenefitsAllowed && this.membership.IsServiceBenefitsAllowed && this.membership.IsProductBenefitsAllowed) {
                this.showPrevious = true;
                this.showContinue = true;
                this.showSaveClass = false;
                this.showSaveService = true;
                this.showSaveProduct = false;
                this.showSave = false;
            } else if (this.membership.IsClassBenefitsAllowed && (this.membership.IsServiceBenefitsAllowed || this.membership.IsProductBenefitsAllowed)) {
                this.showPrevious = true;
                this.showContinue = true;
                this.showSaveClass = true;
                this.showSaveService = false;
                this.showSaveProduct = false;
                this.showSave = false;
            } else {
                this.showPrevious = true;
                this.showContinue = false;
                this.showSaveClass = false;
                this.showSaveService = false;
                this.showSaveProduct = true;
                this.showSave = true;
            }
        }
        else if (index === this.membershipWizard.Services) {
            if (this.membership.IsServiceBenefitsAllowed && !this.membership.IsProductBenefitsAllowed) {
                this.showPrevious = true;
                this.showContinue = false;
                this.showSaveClass = false;
                this.showSaveService = true;
                this.showSaveProduct = false;
                this.showSave = true;
            } else if (this.membership.IsProductBenefitsAllowed && !this.membership.IsServiceBenefitsAllowed || (!this.membership.IsClassBenefitsAllowed && this.membership.IsProductBenefitsAllowed && this.membership.IsServiceBenefitsAllowed)) {
                this.showPrevious = true;
                this.showContinue = false;
                this.showSaveClass = false;
                this.showSaveService = false;
                this.showSaveProduct = true;
                this.showSave = true;
            } else {
                this.showPrevious = true;
                this.showContinue = true;
                this.showSaveClass = false;
                this.showSaveService = true;
                this.showSaveProduct = false;
                this.showSave = false;
            }
        }
        else if (index === this.membershipWizard.Products) {
            this.showPrevious = true;
            this.showContinue = false;
            this.showSaveClass = false;
            this.showSaveService = false;
            this.showSaveProduct = true;
            this.showSave = true;
        }
    }

    getBranchTimeByDay(dayId) {

        let branchTiming = {
            StartTime: null,
            EndTime: null
        };

        var result = this.branchWorkTimings.find(bwt => bwt.DayID == dayId);

        if (result) {
            branchTiming = result;
        }

        return branchTiming;

    }

    getMembershipIdFromRoute() {
        this.route.paramMap.subscribe(params => {
            this.membershipID = +params.get('MembershipID');
        });
    }

    getMembershipFundamentles() {
        return this._httpService.get(MembershipApi.getFundamentals)
            .toPromise()
            .then((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                  this.staffBranchList = response.Result.StaffBranchList;
                  this.membershipCategoryList = response.Result.MembershipCategoryList;

                    this.durationTypeList = response.Result.DurationTypeList.filter(x => x.DurationTypeID != this.ContractId);
                    this.SessionDurationTypeList = response.Result.DurationTypeList;
                    this.recurringPaymentIntervalTypeList = JSON.parse(JSON.stringify(response.Result.DurationTypeList.filter(x => x.DurationTypeID != this.ContractId)));
                    this.singlePaymentCollectionTypeList = response.Result.SinglePaymentCollectionTypeList;
                    this.taxList = response.Result.TaxList;
                    this.membershipBenefitsTypeList = response.Result.MembershipBenefitsTypeList;
                    this.branchWorkTimings = response.Result.BranchWorkTime;

                    //when create new membership show branch timing
                    if (this.membershipID == 0) {
                        this.resetMemberShipModel();
                    }
                    // this.membership.MembershipCategoryID = this.membershipCategoryList && this.membershipCategoryList.length > 0 ? this.membershipCategoryList[0]?.MembershipCategoryID : null;
                    //Temporary Commented as per email from Zahid as on  - 26-September-2019
                    //this.recurringPaymentIntervalTypeList = this.recurringPaymentIntervalTypeList.filter( d=> d.DurationTypeID !== this.membershipDurationType.Days);

                    this.staffBranchList.forEach((branch) => {
                        branch.IsSelected = branch.BranchID === this.branchID ? true : false;
                    })
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
            );
    }

    getMembershipById(membershipId: number) {
        return this._httpService.get(MembershipApi.getByID + membershipId)
            .toPromise()
            .then((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.membership = response.Result;
                    //add class list
                    this.membershipAddedClassList = this.membership.IsClassBenefitsAllowed && this.membership.MembershipItemsBenefits ? this.membership.MembershipItemsBenefits.filter(c => c.ItemTypeID == this.enuItemType.Class) : new Array<MembershipItemsBenefits>();
                    this.membershipAddedServiceList = this.membership.IsServiceBenefitsAllowed && this.membership.MembershipItemsBenefits ? this.membership.MembershipItemsBenefits.filter(c => c.ItemTypeID == this.enuItemType.Service) : new Array<MembershipItemsBenefits>();
                    this.membershipAddedProductList = this.membership.IsProductBenefitsAllowed && this.membership.MembershipItemsBenefits ? this.membership.MembershipItemsBenefits.filter(c => c.ItemTypeID == this.enuItemType.ProductVariant) : new Array<MembershipItemsBenefits>();

                    this.isImageExist = this.membership.ImagePath && this.membership.ImagePath !== "" ? true : false;
                    // Format Time fields
                    this.setTimeValues();
                    // this.setMembershipTypeForEdit();
                    //this.membershipCopy = Object.assign({}, this.membership);
                    this.concatenateImagePath();
                    this.setPurchaseRestriction();
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Membership"));
                }
            );
    }

    setDefaultDropdowns() {
        if (!this.membership.MembershipDurationTypeID) {
            this.membership.MembershipDurationTypeID = this.durationTypeList[0].DurationTypeID;
        }

        // if (!this.membership.SessionDurationTypeID) {
        //     this.membership.SessionDurationTypeID = undefined;
        // }
    }

    setDefaultDropDownsForRecurringPayment(recurringPayment: MembershipPayment) {
        if (this.recurringPaymentIntervalTypeList && this.recurringPaymentIntervalTypeList.length > 0) {
            //recurringPayment.DurationTypeID = this.recurringPaymentIntervalTypeList[0].DurationTypeID;
            recurringPayment.DurationTypeID = this.enuMemberShipBenefitDurations.Day;
        }
        return recurringPayment;
    }

    setDefaultDropdownForSinglePayment(singlePayment: MembershipPayment) {
        if (this.singlePaymentCollectionTypeList && this.singlePaymentCollectionTypeList.length > 0) {
            singlePayment.SinglePaymentCollectionTypeID = this.singlePaymentCollectionTypeList[0].SinglePaymentCollectionTypeID;
        }
        return singlePayment;
    }

    setMembershipBenefitsTypes() {
        if (this.membership.MembershipBenefits && this.membership.MembershipBenefits.length > 0) {
            this.membershipBenefitsTypeList.forEach((Benefit) => {
                var result = this.membership.MembershipBenefits.find(i => i.MembershipBenefitsTypeID == Benefit.MembershipBenefitsTypeID);
                if (Benefit.IsBenefitAllowed && result == null) {
                    var _Benefit = new MembershipBenefits();
                    _Benefit.MembershipBenefitID = 0;
                    _Benefit.MembershipID = this.membership.MembershipID;
                    _Benefit.MembershipBenefitsTypeID = Benefit.MembershipBenefitsTypeID;
                    _Benefit.NoLimits = true;
                    _Benefit.TotalSessions = 0;
                    _Benefit.DurationTypeID = this.enuMemberShipBenefitDurations.Membership;
                    this.membership.MembershipBenefits.push(_Benefit);
                } else if (Benefit.IsBenefitAllowed && result) {
                    result.DurationTypeID = result.DurationTypeID && result.DurationTypeID > 0 ? result.DurationTypeID : this.enuMemberShipBenefitDurations.Membership;
                }
            })
            this.sortMembershipBenefits();
        }
        //after comple method calls then save membership clone
        this.membershipCopy = JSON.parse(JSON.stringify(this.membership));
    }

    setMembershipTax() {
        this.selectedTaxList = [];
        if (this.membership.TaxList && this.membership.TaxList.length > 0 && this.taxList && this.taxList.length > 0 ) {
            this.taxList.forEach((tax) => {
                var result = this.membership.TaxList.find(i => i.TaxID == tax.TaxID);
                if (result) {
                    this.selectedTaxList.push(tax);
                }
            });
        }
        if (this.taxList && this.taxList.length > 0 && this.selectedTaxList && this.selectedTaxList.length > 0 && this.selectedTaxList.length == this.taxList.length) {
            setTimeout(() => {
                this.allSelectedTax.select();
            }, 100);
        }
    }

    setPaymentLists() {
        if (this.membership.MembershipPaymentList) {
            this.singlePayments = this.membership.MembershipPaymentList.filter(m => m.MembershipPaymentTypeID === 1);
            this.recurringPayments = this.membership.MembershipPaymentList.filter(m => m.MembershipPaymentTypeID === 2);

            this.singlePayments.forEach(p => {
                p.IsDurationValid = true;
                p.TotalPrice = p.Price;
                p.controlIndex = this.controlNum++;
            });
            this.recurringPayments.forEach(p => {
                p.IsDurationValid = true;
                p.TotalPrice = p.Price;
                p.controlIndex = this.controlNum++;
            });

            this.showAddRecurringPayment = !(this.recurringPayments && this.recurringPayments.length > 0);
        }
    }

    sortMembershipBenefits() {
        this.membership.MembershipBenefits.sort(function (a, b) {
            if (a.MembershipBenefitsTypeID < b.MembershipBenefitsTypeID) { return -1; }
            if (a.MembershipBenefitsTypeID > b.MembershipBenefitsTypeID) { return 1; }
            return 0;
        });
    }

    showValidationMessage(showValidation: boolean) {
        this.showMembershipDetailsValidation = showValidation;
    }

    saveMembership() {
        this.setMembershipBranchList();
        this.setMembershipBranchListInfo();
        this.setMembershipItemsBenefitsForSave();
        this.hasSuccess = false;
        this.hasError = false;
        // Format Time fields
        this.formatTimeValue()

        this.membership.MembershipPaymentList = [];
        // insert single payments in MembershipPayment
        this.singlePayments.forEach((item) => {
            item.MembershipPaymentTypeID = this.membershipPaymentType.Single;
            item.DurationTypeID = null;
            this.membership.MembershipPaymentList.push(item);
        });

        // insert recurring payments in MembershipPayment
        this.recurringPayments.forEach((item) => {
            item.MembershipPaymentTypeID = this.membershipPaymentType.Recurring;
            item.SinglePaymentCollectionTypeID = null;
            this.membership.MembershipPaymentList.push(item);
        });

        if (this.isSavedMemberShip) {
            this.isSavedMemberShip = false;
            this.membership.RestrictedCustomerTypeID = this.listToCommaSeparatedString(this.selectedRestrictedList);

            this._httpService.save(MembershipApi.save, this.membership)
                .subscribe((res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        //this.membershipCopy = Object.assign({}, this.membership);
                        this.membershipCopy = JSON.parse(JSON.stringify(this.membership));
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Membership"));
                        this.resetForm();
                        this._router.navigate(['/setup/membership']);
                    }
                    else {
                        this.isSavedMemberShip = true;
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                    err => {
                        this.isSavedMemberShip = true;
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Membership"));
                    }
                );
        }

    }

    resetForm() {
        this.stepper.reset();
        this.activeTabIndex = this.stepper.selectedIndex;
        this.setPerviousContinueButtonVisibility(this.activeTabIndex);

        if (this.membership.MembershipID > 0) {
            this.membership = JSON.parse(JSON.stringify(this.membershipCopy));

            //this.membership = Object.assign({}, this.membershipCopy);
            this.membershipAddedClassList = this.membership.IsClassBenefitsAllowed && this.membership.MembershipItemsBenefits ? this.membership.MembershipItemsBenefits.filter(c => c.ItemTypeID == this.enuItemType.Class) : new Array<MembershipItemsBenefits>();
            this.membershipAddedServiceList = this.membership.IsServiceBenefitsAllowed && this.membership.MembershipItemsBenefits ? this.membership.MembershipItemsBenefits.filter(c => c.ItemTypeID == this.enuItemType.Service) : new Array<MembershipItemsBenefits>();
            this.membershipAddedProductList = this.membership.IsProductBenefitsAllowed && this.membership.MembershipItemsBenefits ? this.membership.MembershipItemsBenefits.filter(c => c.ItemTypeID == this.enuItemType.ProductVariant) : new Array<MembershipItemsBenefits>();

            //this.setMembershipBranchListInfo();
            this.setMembershipTax();
            this.setTimeValues();
            this.staffBranchList.forEach((branch) => {
                branch.IsSelected = false;
                var result = this.membership.MembershipBranchList.find(mb => mb.BranchID == branch.BranchID);
                if (result) {
                    branch.IsSelected = true;
                }
            })
            this.setPaymentLists();
            this.resetValidation();
        }
        else {
            this.membershipDetailsForm.resetForm();
            this.resetValidation();
            setTimeout(() => {
                //this.membership = new Membership();
                this.resetMemberShipModel();

                this.singlePayments = [];
                this.recurringPayments = [];

                this.imagePath = '';
                this.isImageExists = false;

                this.setDefaultDropdowns();

                this.showAddRecurringPayment = this.recurringPayments && this.recurringPayments.length > 0 ? false : true;
                // new member ship development when user add new member ship by default showone length in single paymane and recurring payment list (17-08-2020) fahad
                // this.addSinglePayment();
                // this.addRecurringPayment();

            }, 100);
        }
    }

    resetMemberShipModel() {
        this.membership = new Membership();
        this.membershipAddedClassList = new Array<MembershipItemsBenefits>();
        this.membershipAddedServiceList = new Array<MembershipItemsBenefits>();
        this.membershipAddedProductList = new Array<MembershipItemsBenefits>();
        this.membership.MembershipBenefits = new Array<MembershipBenefits>();
        //prepare model data permisiion wise show Benefits
        this.membershipBenefitsTypeList.forEach((Benefit) => {
            if (Benefit.IsBenefitAllowed) {
                var _Benefit = new MembershipBenefits();
                _Benefit.MembershipBenefitID = 0;
                _Benefit.MembershipID = 0;
                _Benefit.MembershipBenefitsTypeID = Benefit.MembershipBenefitsTypeID;
                _Benefit.NoLimits = true;
                _Benefit.TotalSessions = 0;
                _Benefit.DurationTypeID = this.enuMemberShipBenefitDurations.Membership;
                if (Benefit.MembershipBenefitsTypeID == this.membershipBenefitType.DoorCheckedInBenefits) {
                    this.membership.IsDoorCheckedInBenefitsAllowed = true;
                    this.isAllBranchOperationalTimes = true;
                    this.onAllBranchOperationTimeAccessChange(true);
                }

                this.membership.MembershipBenefits.push(_Benefit);
            }
        })
    }

    addSinglePayment() {
        let newSinglePayment = new MembershipPayment();
        newSinglePayment = this.setDefaultDropdownForSinglePayment(newSinglePayment);
        newSinglePayment.controlIndex = this.controlNum++;
        this.singlePayments.push(newSinglePayment);
        this.updatePaymentTotal();
        this.markFormAsDirty();
        this.showPaymentRequiredValidation = false;
    }

    removeSinglePayments(index: number) {
        let payment = this.singlePayments.find(p => p.controlIndex === index);
        this.singlePayments.splice(this.singlePayments.indexOf(payment), 1);
        this.membershipDetailsForm.form.updateValueAndValidity();
        this.updatePaymentTotal();
        this.markFormAsDirty();
        this.validatePayments();
    }

    addRecurringPayment() {
        let newRecurringPayment = new MembershipPayment();
        newRecurringPayment = this.setDefaultDropDownsForRecurringPayment(newRecurringPayment);
        newRecurringPayment.controlIndex = this.controlNum++;
        this.recurringPayments.push(newRecurringPayment);
        this.updatePaymentTotal();
        this.markFormAsDirty();
        this.showPaymentRequiredValidation = false;
        this.showAddRecurringPayment = false;
    }

    removeRecurringPayments(index: number) {
        this.showRecurringPaymentsBeyondMembershipLengthValidation = false;
        let payment = this.recurringPayments.find(p => p.controlIndex === index);
        this.recurringPayments.splice(this.recurringPayments.indexOf(payment), 1);
        this.updatePaymentTotal();
        this.markFormAsDirty();
        this.validatePayments();
        this.showAddRecurringPayment = (this.recurringPayments.length === 0);
    }

    // getBranchWiseClasses() {
    //     this.branchWithClassList = [];
    //     let branchIds = this.staffBranchList.filter(b => b.IsSelected).map(br => br.BranchID);
    //     if (branchIds && branchIds.length > 0) {
    //         this._httpService.get(MembershipApi.getBranchWiseClasses, { branchId: branchIds.toString() })
    //             .subscribe(
    //                 (response: ApiResponse) => {
    //                     if (response && response.MessageCode > 0) {
    //                         this.branchWithClassList = response.Result;

    //                         if (this.branchWithClassList) {
    //                             this.branchWithClassList.forEach(branch => {
    //                                 branch.ClassList.forEach(classItem => {
    //                                     classItem.IsSelected = false;
    //                                     classItem.StartDate = this._dateTimeService.convertDateObjToString(classItem.StartDate, "EEEE");
    //                                     classItem.StartTime = this._dateTimeService.formatTimeString(classItem.StartTime);
    //                                     classItem.EndTime = this._dateTimeService.formatTimeString(classItem.EndTime);
    //                                 })
    //                             })
    //                         }
    //                         //this.setMembershipBranchClassListInfo();
    //                     }
    //                     else {
    //                         this._messageService.showErrorMessage(response.MessageText);
    //                     }
    //                 });
    //     }
    // }

    calculateDurationToDays(durationTypeID: number, DurationValue: number) {
        let membershipDurationValue: number = 0;
        let currentDate: Date = new Date();
        let changeDate: Date = new Date();
        switch (durationTypeID) {
            case this.enuMemberShipBenefitDurations.Day:
                membershipDurationValue = (1 * DurationValue);
                break;
            case this.enuMemberShipBenefitDurations.Week:
                membershipDurationValue = (7 * DurationValue);
                break;
            case this.enuMemberShipBenefitDurations.FortnightBiweek:
                membershipDurationValue = (14 * DurationValue);
                break;
            case this.enuMemberShipBenefitDurations.FourWeek:
                membershipDurationValue = (28 * DurationValue);
                break;
            case this.enuMemberShipBenefitDurations.Month:
                var addedMonth = new Date(changeDate.setMonth(changeDate.getMonth() + (1 * DurationValue)));
                membershipDurationValue = this._dateTimeService.getDaysCountFromTwoDifferentDays(currentDate, addedMonth);
                break;
            case this.enuMemberShipBenefitDurations.Quarter:
                var addedQuarter = new Date(changeDate.setMonth(changeDate.getMonth() + (3 * DurationValue)));
                membershipDurationValue = this._dateTimeService.getDaysCountFromTwoDifferentDays(currentDate, addedQuarter);
                break;
            case this.enuMemberShipBenefitDurations.SixMonth:
                var addedSixMonth = new Date(changeDate.setMonth(changeDate.getMonth() + (6 * DurationValue)));
                membershipDurationValue = this._dateTimeService.getDaysCountFromTwoDifferentDays(currentDate, addedSixMonth);
                break;
            case this.enuMemberShipBenefitDurations.Year:
                var addedYear = new Date(changeDate.setMonth(changeDate.getMonth() + (12 * DurationValue)));
                membershipDurationValue = this._dateTimeService.getDaysCountFromTwoDifferentDays(currentDate, addedYear);
                break;
        }
        return membershipDurationValue;
    }

    validateDurationTypeWithRecurPayment() {
        if (this.recurringPayments && this.recurringPayments.length > 0) {
            let membershipLenght: number = this.calculateDurationToDays(Number(this.membership.MembershipDurationTypeID), this.membership.MembershipDurationValue);
            let membershipPaymentInterval: number =
                this.calculateDurationToDays((this.recurringPayments[0].DurationTypeID == 0 ? 0 : Number(this.recurringPayments[0].DurationTypeID)),
                    (this.recurringPayments[0].RecurringInterval == 0 ? 0 : this.recurringPayments[0].RecurringInterval));
            if (membershipPaymentInterval > membershipLenght) { // Return Error Message
                this.showRecurringPaymentsBeyondMembershipLengthValidation = true;
                return false;
            }
        }
        this.showRecurringPaymentsBeyondMembershipLengthValidation = false;
        return true;
    }

    setMembershipBranchListInfo() {
        if (this.membership.MembershipBranchList) {
            this.membership.MembershipBranchList.forEach((membershipBranch) => {
                this.staffBranchList.filter(b => b.BranchID === membershipBranch.BranchID)[0].IsSelected = true;
            })
        }
    }

    // setMembershipBranchClassListInfo() {
    //     if (this.membership.MembershipClassList) {
    //         this.membership.MembershipClassList.forEach(branchClass => {
    //             let selectedBranch = this.branchWithClassList.find(b => b.BranchID === branchClass.BranchID);
    //             let selectedClass = selectedBranch.ClassList.find(c => c.ClassID === branchClass.ClassID);
    //             selectedClass.IsSelected = true;
    //         });

    //         this.setAllBranchClassesCheck();
    //     }
    // }

    // setAllBranchClassesCheck() {
    //     this.branchWithClassList.forEach((branch: BranchWiseClass) => {
    //         branch.IsSelected = branch.ClassList.filter(c => c.IsSelected).length === branch.ClassList.length ? true : false;
    //     })
    // }

    setMembershipBranchList() {
        this.membership.MembershipBranchList = [];
        //this.membership.MembershipClassList = [];
        // if (this.branchWithClassList) {
        //     this.branchWithClassList.forEach((branch: BranchWiseClass) => {
        //         if (branch.ClassList && branch.ClassList.length > 0) {
        //             let selectedClasses = branch.ClassList.filter(c => c.IsSelected);
        //             if (selectedClasses && selectedClasses.length > 0) {

        //                 // selectedClasses.forEach(classItem => {
        //                 //     this.membership.MembershipClassList.push({ ClassID: classItem.ClassID, BranchID: branch.BranchID });
        //                 // });
        //             }
        //         }
        //         this.membership.MembershipBranchList.push({ BranchID: branch.BranchID });
        //     });
        // }
        // else {
        this.staffBranchList.forEach(branch => {
            if (branch.IsSelected) {
                this.membership.MembershipBranchList.push({ BranchID: branch.BranchID, BranchName: branch.BranchName });
            }
        })
        // }
    }

    checkMemberShipBranchList() {
        // removed classes, services and product from removed branch
        if (this.membership.IsClassBenefitsAllowed) {
            this.membershipAddedClassList = this.benifitItemTypeClass.BenefitItemList && this.benifitItemTypeClass.BenefitItemList.length > 0 ? this.benifitItemTypeClass.BenefitItemList : new Array<MembershipItemsBenefits>();
            if (this.membershipAddedClassList && this.membershipAddedClassList.length > 0) {
                this.staffBranchList.forEach(branch => {
                    if (!branch.IsSelected) {
                        this.membershipAddedClassList = this.membershipAddedClassList.filter(x => {
                            return x.BranchID != branch.BranchID;
                        })
                    }
                })
            }
        }

        if (this.membership.IsServiceBenefitsAllowed) {
            this.membershipAddedServiceList = this.benifitItemTypeService.BenefitItemList && this.benifitItemTypeService.BenefitItemList.length > 0 ? this.benifitItemTypeService.BenefitItemList : new Array<MembershipItemsBenefits>();
            if (this.membershipAddedServiceList && this.membershipAddedServiceList.length > 0) {
                this.staffBranchList.forEach(branch => {
                    if (!branch.IsSelected) {
                        this.membershipAddedServiceList = this.membershipAddedServiceList.filter(x => {
                            return x.BranchID != branch.BranchID;
                        })
                    }
                })
            }
        }

        if (this.membership.IsProductBenefitsAllowed) {
            this.membershipAddedProductList = this.benifitItemTypeProduct.BenefitItemList && this.benifitItemTypeProduct.BenefitItemList.length > 0 ? this.benifitItemTypeProduct.BenefitItemList : new Array<MembershipItemsBenefits>();
            if (this.membershipAddedProductList && this.membershipAddedProductList.length > 0) {
                this.staffBranchList.forEach(branch => {
                    if (!branch.IsSelected) {
                        this.membershipAddedProductList = this.membershipAddedProductList.filter(x => {
                            return x.BranchID != branch.BranchID;
                        })
                    }
                })
            }
        }

    }

    hasPayments() {
        let hasPayment = (this.singlePayments.length > 0 || this.recurringPayments.length > 0);
        this.showPaymentRequiredValidation = !hasPayment;
        return hasPayment
    }

    resetValidation() {
        if (this.benifitItemTypeClass) {
            this.benifitItemTypeClass.onReset();
        }

        if (this.benifitItemTypeService) {
            this.benifitItemTypeService.onReset();
        }

        if (this.benifitItemTypeProduct) {
            this.benifitItemTypeProduct.onReset();
        }

        this.showMemberLimitValidation = false;
        this.showMemberLengthValidation = false;
        this.showSelectClassValidation = false;
        this.showSelectServiceValidation = false;
        this.showSelectProductValidation = false;
        this.showSelectBenefitValidation = false;
    }

    // validateBranches() {
    //     return this.isBranchValid = this.staffBranchList.filter(b => b.IsSelected).length > 0 ? true : false;
    // }

    validateBranchClasses() {
        this.showSelectClassValidation = this.membership.IsClassBenefitsAllowed && this.benifitItemTypeClass.BenefitItemList && this.benifitItemTypeClass.BenefitItemList.length > 0 ? false : true;
        return this.showSelectClassValidation ? false : true;
    }

    validateBranchServices() {
        this.showSelectServiceValidation = this.membership.IsServiceBenefitsAllowed && this.benifitItemTypeService.BenefitItemList && this.benifitItemTypeService.BenefitItemList.length > 0 ? false : true;
        return this.showSelectServiceValidation ? false : true;
    }

    validateBranchProducts() {
        this.showSelectProductValidation = this.membership.IsProductBenefitsAllowed && this.benifitItemTypeProduct.BenefitItemList && this.benifitItemTypeProduct.BenefitItemList.length > 0 ? false : true;
        return this.showSelectProductValidation ? false : true;
    }

    // validateBranchClasses() {
    //     this.isBranchClassValid = true;
    //     let branchHasClasses = false;
    //     let classValid = false;
    //     this.branchWithClassList.some((branch: any) => {
    //         branchHasClasses = (branch.ClassList && branch.ClassList.length > 0);
    //         if (branchHasClasses) {
    //             classValid = branch.ClassList.filter(c => c.IsSelected).length > 0 ? true : false;
    //             if (classValid) {
    //                 return this.isBranchClassValid = classValid;
    //             }
    //         }
    //     });
    //     return this.isBranchClassValid = classValid;
    // }

    validatePayments(index: number = null) {
        this.arePaymentsValid = true;

        if (index != null) {
            if (this.singlePayments.length > 0)
                this.singlePayments[index].MembershipPaymentName = this.singlePayments[index].MembershipPaymentName ? this.singlePayments[index].MembershipPaymentName.trim() : this.singlePayments[index].MembershipPaymentName;
            if (this.recurringPayments.length > 0)
                this.recurringPayments[index].MembershipPaymentName = this.recurringPayments[index].MembershipPaymentName ? this.recurringPayments[index].MembershipPaymentName.trim() : this.recurringPayments[index].MembershipPaymentName;
        }

        if (this.singlePayments) {
            this.singlePayments.forEach((payment: MembershipPayment) => {
                if (!payment.MembershipPaymentName || payment.MembershipPaymentName == '') {
                    return this.arePaymentsValid = false;
                }
            });
        }

        if (this.recurringPayments) {
            this.recurringPayments.forEach((payment: MembershipPayment) => {
                if ((!payment.MembershipPaymentName || payment.MembershipPaymentName == '' ||
                    !payment.Price || payment.Price == 0 ||
                    !payment.RecurringInterval || payment.RecurringInterval == 0)) {
                    return this.arePaymentsValid = false;
                }
            });
        }

        return this.arePaymentsValid;
    }

    validateMembershipType() {

        this.showMembershipTypeValidation = false;
        this.showSessionDurationRequiredValidation = false;
        let isMembershipTypeValid = false;

        if (this.membership.IsDoorCheckedInBenefitsAllowed || this.membership.IsClassBenefitsAllowed || this.membership.IsServiceBenefitsAllowed || this.membership.IsProductBenefitsAllowed) {
            isMembershipTypeValid = true;
            this.showSelectBenefitValidation = false;
        } else {
            this.showSelectBenefitValidation = true;
            return isMembershipTypeValid;
        }

        if (this.membershipTypeForm.invalid) {
            return false;
        }
        // if (this.isClassOnlyMembership) {
        //     isMembershipTypeValid = true;
        // }
        // else {
        if (this.isAllBranchOperationalTimes) {
            isMembershipTypeValid = true;
        }
        else {
            // let hasBranchOpertionalTime = this.membershipClockInTimeList.filter(m => m.IsBranchOperationTime).length > 0;
            // let hasNoAccessTime = this.membershipClockInTimeList.filter(m => m.IsDayRestricted).length > 0;
            // let hasStartEndTime = this.checkStartEndTimesValidity();
            if (this.membership.IsDoorCheckedInBenefitsAllowed) {
                isMembershipTypeValid = this.areAllTimeValid();
            }
        }
        // }

        // this.showMembershipTypeValidation = (!this.isClassOnlyMembership && !isMembershipTypeValid);
        this.showMembershipTypeValidation = !isMembershipTypeValid;

        return isMembershipTypeValid;
    }

    resetDoorCheckedInBenefitsValidation(membershipBenefitsTypeID) {
        this.showSelectBenefitValidation = false;

        if (!this.membership.IsDoorCheckedInBenefitsAllowed) {
            this.showMembershipTypeValidation = false;
        }
        else {
            this.isAllBranchOperationalTimes = true;
            this.onAllBranchOperationTimeAccessChange(true);
        }

        this.resetMemberShipBenefitModel(membershipBenefitsTypeID);
    }

    resetClassBenefitsValidation(membershipBenefitsTypeID) {
        this.showSelectBenefitValidation = false;

        if (this.benifitItemTypeClass) {
            this.membershipAddedClassList = this.benifitItemTypeClass.BenefitItemList;
        }

        this.resetMemberShipBenefitModel(membershipBenefitsTypeID);
    }

    resetServiceBenefitsValidation(membershipBenefitsTypeID) {
        this.showSelectBenefitValidation = false;

        if (this.benifitItemTypeService) {
            this.membershipAddedServiceList = this.benifitItemTypeService.BenefitItemList;
        }

        this.resetMemberShipBenefitModel(membershipBenefitsTypeID);
    }

    resetProductBenefitsValidation(membershipBenefitsTypeID) {
        this.showSelectBenefitValidation = false;

        if (this.benifitItemTypeProduct) {
            this.membershipAddedProductList = this.benifitItemTypeProduct.BenefitItemList;
        }

        this.resetMemberShipBenefitModel(membershipBenefitsTypeID);
    }

    resetMemberShipBenefitModel(membershipBenefitsTypeID) {
        this.membership.MembershipBenefits.forEach((Benefit) => {
            if (Benefit.MembershipBenefitsTypeID == membershipBenefitsTypeID) {
                Benefit.NoLimits = true;
                Benefit.TotalSessions = 0;
                Benefit.DurationTypeID = this.enuMemberShipBenefitDurations.Membership;
            }
        })
    }


    // validateDurationTypeWithRecurPayment() {
    //     // this.showPaymentDurationValidation = false;
    //     // if (this.recurringPayments) {
    //     //     this.recurringPayments.forEach(payment => {
    //     //         payment.IsDurationValid = this.isRecurDurationValid(payment.DurationTypeID, payment.RecurringInterval);
    //     //     })
    //     // }
    //     // this.showPaymentDurationValidation = this.recurringPayments.some(p => !p.IsDurationValid);
    //     // return !(this.showPaymentDurationValidation);

    //     /*
    //         As per discussion with Iftekhar, Payment Duration validation is removed
    //         Code commented to keep the record if we need to implement this validation again sometimes in future
    //     */
    //     return true;
    // }

    // isRecurDurationValid(durationTypeId: number, intervals: number) {
    //     let membershipDuration = this.convertDurationInDays(this.membership.MembershipDurationTypeID, this.membership.MembershipDurationValue);
    //     let paymentDuration = this.convertDurationInDays(durationTypeId, intervals);

    //     if (paymentDuration <= membershipDuration) {
    //         return true;
    //     }
    //     return false
    // }

    // convertDurationInDays(durationType: number, durationValue: number): number {
    //     let durationInDays = 0;
    //     switch (durationType) {
    //         case this.membershipDurationType.Days:
    //             durationInDays = durationValue;
    //             break;
    //         case this.membershipDurationType.Weeks:
    //             durationInDays = (durationValue * 7);
    //             break;
    //         case this.membershipDurationType.Months:
    //             durationInDays = (durationValue * 30);
    //             break;
    //         case this.membershipDurationType.Quarter:
    //             durationInDays = (durationValue * 30 * 3);
    //             break;
    //     }
    //     return durationInDays;
    // }

    areAllTimeValid() {
        let validTime = true;
        this.membershipClockInTimeList.some(mTime => {
            if (!this.validateStartTime(mTime) || !this.validateEndTime(mTime)) {
                return validTime = false;
            }
        });
        return validTime;
    }

    validateStartTime(mTime: MembershipClockInTime) {
        let isStartValidTime = mTime.IsDayRestricted || mTime.IsBranchOperationTime || (mTime.StartTime && mTime.StartTime != '');

        if (!mTime.IsDayRestricted && !mTime.IsBranchOperationTime) {
            if (isStartValidTime) {
                mTime.IsStartTimeRequired = false;
                mTime.IsEndTimeRequired = !mTime.EndTime && mTime.EndTime != '' ? true : false;
            }
            else {
                mTime.IsStartTimeInvalid = true;
            }
        }

        return isStartValidTime;
    }

    validateEndTime(mTime: MembershipClockInTime) {
        let isEndTimeValid = mTime.IsDayRestricted || mTime.IsBranchOperationTime || (mTime.EndTime && mTime.EndTime != '' && mTime.EndTime != undefined);
        if (!mTime.IsDayRestricted && !mTime.IsBranchOperationTime) {
            if (isEndTimeValid) {
                mTime.IsEndTimeRequired = false;
                mTime.IsStartTimeInvalid = !mTime.StartTime && mTime.StartTime != '' ? true : false;
            }
            else {
                mTime.IsEndTimeInvalid = true;
            }
        }

        return isEndTimeValid;
    }

    isStartTimeValid(mTime: MembershipClockInTime) {
        this.isValidStartTime = true;
        //&& mTime.EndTime && mTime.EndTime != ''
        if (!mTime.IsDayRestricted && !mTime.IsBranchOperationTime && mTime.StartTime && mTime.StartTime != '') {
            this.membershipClockInTimeList[mTime.DayID].IsStartTimeInvalid = false;
            this.membershipClockInTimeList[mTime.DayID].IsStartTimeRequired = false;
            this.isValidStartTime = mTime.EndTime > mTime.StartTime;
            this.membershipClockInTimeList[mTime.DayID].IsEndTimeInvalid = !this.isValidStartTime;
        }
        else {
            // this.isValidStartTime = false;
            this.membershipClockInTimeList[mTime.DayID].IsStartTimeRequired = true;
        }
        return this.isValidStartTime;
    }

    isEndTimeValid(mTime: MembershipClockInTime) {
        this.isValidEndTime = true;

        if (!mTime.IsDayRestricted && !mTime.IsBranchOperationTime && mTime.EndTime && mTime.EndTime != '') {
            var endTime: any = this.formatTimeForValidate(mTime.EndTime);
            var startTime: any = this.formatTimeForValidate(mTime.StartTime);
            startTime = this.formatTimeForEdit(startTime);
            endTime = this.formatTimeForEdit(endTime);

            this.isValidEndTime = endTime > startTime;
            this.membershipClockInTimeList[mTime.DayID].IsEndTimeInvalid = !this.isValidEndTime;
        }
        else {
            //  this.isValidStartTime = false;
            this.membershipClockInTimeList[mTime.DayID].IsEndTimeRequired = true;
        }
        return this.isValidEndTime;
    }

    formatTimeForValidate(timeValue) {
        return this._dateTimeService.getTimeStringFromDate(timeValue);
    }

    updatePaymentTotal() {
        setTimeout(() => {
            this.paymentTotal = 0;
            let totalTaxPercentage = this.getTotalTaxPercentage();
            this.singlePayments.forEach(singlePayment => {
                if (singlePayment.Price && singlePayment.Price.toString().length > 13) {
                    singlePayment.Price = Number(singlePayment.Price.toString().substring(0, 13));
                }
                singlePayment.TotalPrice = this._taxCalculationService.getRoundValue(singlePayment.Price + this._taxCalculationService.getTaxAmount(totalTaxPercentage, singlePayment.Price));
                this.paymentTotal = this.paymentTotal + singlePayment.TotalPrice;
            })

            this.recurringPayments.forEach(recurringPayment => {
                //let totalPrice = recurringPayment.Price * recurringPayment.RecurringInterval;
                if (recurringPayment.Price && recurringPayment.Price.toString().length > 13) {
                    recurringPayment.Price = Number(recurringPayment.Price.toString().substring(0, 13));
                }
                let totalPrice = this._taxCalculationService.getRoundValue(recurringPayment.Price + this._taxCalculationService.getTaxAmount(totalTaxPercentage, recurringPayment.Price));
                recurringPayment.TotalPrice = totalPrice * recurringPayment.RecurringInterval;
                this.paymentTotal = this.paymentTotal + (recurringPayment.TotalPrice);
            })
        }, 100);
    }

    getTotalTaxPercentage() {
        let taxTotal = 0;
        if (this.membership.TaxList && this.taxList && this.taxList?.length > 0) {
            this.membership.TaxList.forEach(tax => {
                taxTotal += this.taxList.find(t => t.TaxID === tax.TaxID).TaxPercentage;
            })
        }

        return taxTotal;
    }

    getDescriptionWithOutHtml() {
        if (this.membership.Description) {
            this.desciptionWithoutHTML = this.membership.Description.replace(/<[^>]*>/g, '')
        } else{
            this.desciptionWithoutHTML = "";
        }
    }

    resetMembershipTimes() {
        this.isAllBranchOperationalTimes = false;
        this.membershipClockInTimeList.forEach(mTime => {
            mTime.IsBranchOperationTime = false;
            mTime.IsDayRestricted = false;
            mTime.StartTime = null;
            mTime.EndTime = null;
        })
    }

    resetStartEndTimeValidation(dayId: number) {
        setTimeout(() => {
            this.membershipClockInTimeList[dayId].IsStartTimeInvalid = false;
            this.membershipClockInTimeList[dayId].IsEndTimeInvalid = false;
            this.membershipClockInTimeList[dayId].IsStartTimeRequired = false;
            this.membershipClockInTimeList[dayId].IsEndTimeRequired = false;
        }, 100);
    }

    setTimeValues() {
        if (this.membership.MembershipClockInTimeList && this.membership.MembershipClockInTimeList.length > 0) {
            this.membershipClockInTimeList = JSON.parse(JSON.stringify(this.membership.MembershipClockInTimeList));
            this.membershipClockInTimeList.forEach(m => {
                if (m.StartTime && m.StartTime != "") {
                    m.StartTime = this.formatTimeForEdit(m.StartTime);
                }
                if (m.EndTime && m.EndTime != "") {
                    m.EndTime = this.formatTimeForEdit(m.EndTime);
                }
            });
            this.isAllBranchOperationalTimes = this.membershipClockInTimeList.filter(m => m.IsBranchOperationTime).length === 7;
        }
    }

    formatTimeValue() {
        let membershipTimes = JSON.parse(JSON.stringify(this.membershipClockInTimeList));
        membershipTimes.forEach(m => {
            m.StartTime = this.formatTimeForSave(m.StartTime);
            m.EndTime = this.formatTimeForSave(m.EndTime);
        });

        this.membership.MembershipClockInTimeList = membershipTimes;
    }

    formatTimeForSave(timeValue: any) {
        if (timeValue && timeValue.length > 8) {
            return this._dateTimeService.getTimeStringFromDate(timeValue);
        } else if (timeValue && (timeValue.length == 8 || timeValue.length == 5)) {
            return timeValue;
        } else {
            return "";
        }

    }

    formatTimeForEdit(timeValue: string) {
        return this._dateTimeService.convertTimeStringToDateTime(timeValue);
    }

    markFormAsDirty() {
        if (this.membershipDetailsForm.pristine) {
            this.membershipDetailsForm.form.markAsDirty();
        }
    }

    showImageCropperDialog() {
        const dialogInst = this._dialog.open(ImageEditorPopupComponent, {
            disableClose: true,
            data: {
                height: 460,
                width: 720,
                aspectRatio: 720 / 460,
                showWebCam: true
            }
        });

        dialogInst.componentInstance.croppedImage.subscribe((img: string) => {
            if (img && img.length > 0) {
                this.membership.ImageFile = img;
                this.concatenateImagePath();
                this.membershipDetailsForm.form.markAsDirty();
            }
        });
    }

    concatenateImagePath() {
        this.imagePath = "";
        if (this.membership.ImageFile && this.membership.ImageFile != "") {
            this.imagePath = "data:image/jpeg;base64," + this.membership.ImageFile;
            this.isImageExists = true;
        }
        else if (this.membership.ImagePath && this.membership.ImagePath != "") {
            this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + this.membership.ImagePath;
            this.isImageExists = true;
        }
        else {
            this.isImageExists = false;
        }
    }

    discardImage() {
        this._commonService.deleteFile(ENU_Permission_Setup.Membership_Save, this.membership.MembershipID, this.membership.ImagePath)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Image"));
                    this.membership.ImageFile = "";
                    this.membership.ImagePath = "";
                    this.membershipCopy.ImageFile = "";
                    this.membershipCopy.ImagePath = "";
                    this.concatenateImagePath();
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image"));
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image")); }
            );
    }

    getErrorMessage() {
        if (this.showMembershipDetailsValidation && !this.showDescriptionValidation && !this.showMemberLimitValidation
            && !this.showRecurringPaymentsBeyondMembershipLengthValidation && this.validateTotalAmount()) {
            return Messages.Validation.Info_Required;
        }
        if (this.showPaymentRequiredValidation) {
            return Messages.Validation.Membership_Payment_Required;
        }
        if (this.showDescriptionValidation) {
            return this.descriptionMaxLengthMessage;
        }
        if (this.showMembershipTypeValidation && !this.showSessionDurationRequiredValidation) {
            return Messages.Validation.Membership_Checkin_Sessions_AllDays;
        }
        if (!this.isBranchValid) {
            return Messages.Validation.Default_Branch_Invalid;
        }
        if (!this.isBranchClassValid) {
            return Messages.Validation.Branch_Class_Invalid;
        }
        if (!this.isValidEndTime) {
            return Messages.Validation.Endtime_Should_Greater_Than_Start_Time;
        }
        if (this.showPaymentDurationValidation) {
            return Messages.Validation.Payment_Interval_GreaterThan_MembershipDuration;
        }
        if (this.showSessionDurationRequiredValidation) {
            return Messages.Validation.Session_Duration_Required;
        }
        if (this.showMemberLimitValidation) {
            return Messages.Validation.Member_Limit;
        }
        if (this.showMemberLengthValidation) {
            return Messages.Validation.Membership_Length;
        }
        if (this.showSelectBenefitValidation) {
            return Messages.Validation.Please_Add_At_Least_One_Type_Of_Benefit_To_Proceed;
        }
        if (this.membershipTypeForm.invalid) {
            return Messages.Validation.Total_Sessions_Length;
        }
        if (this.showSelectClassValidation) {
            return Messages.Validation.Please_Add_At_Least_One_Class_To_Proceed;
        }
        if (this.showSelectServiceValidation) {
            return Messages.Validation.Please_Add_At_Least_One_Service_To_Proceed;
        }
        if (this.showSelectProductValidation) {
            return Messages.Validation.Please_Add_At_Least_One_Product_To_Proceed;
        }
        if (this.showRecurringPaymentsBeyondMembershipLengthValidation) {
            return Messages.Validation.Recurring_Payments_Cannot_Be_Scheduled_Beyond_Membership_Length;
        }
        if(!this.validateTotalAmount()){
            return Messages.Validation.Please_Enter_Value_Upto_Nine_Digits_Only;
        }
    }

    validateTotalAmount() {

        if (this.paymentTotal > this.totalAmountLimit){
            return false;
        } else {
            return true;
        }
    }

    // #endregion

}
