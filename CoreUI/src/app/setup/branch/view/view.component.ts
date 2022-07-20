
// @Component({
//   selector: 'branch-view',
//   templateUrl: './view.component.html',
// })
// export class BranchViewComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }
////////////////////////////
/*********************** Angular References *********************/
import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgForm } from "@angular/forms";

import { TimeFormatterPipe } from "src/app/shared/pipes/time.formatter";
import { TrimPipe } from "src/app/shared/pipes/trim";

/*********************** Service & Models *********************/
import {
  Branch,
  BranchForSave,
  BranchWorkTime,
} from "src/app/setup/models/branch.model";
import { HttpService } from "src/app/services/app.http.service";
import { DataSharingService } from "../../../services/data.sharing.service";
import { MessageService } from "src/app/services/app.message.service";

/*********************** Common *********************/
import { Configurations } from "src/app/helper/config/app.config";
import { Messages } from "src/app/helper/config/app.messages";
import { BranchApi } from "src/app/helper/config/app.webapi";
import { WeekDays, ENU_Package } from "src/app/helper/config/app.enums";
import { DD_Branch, StateCounty, UtcTimeZone, ApiResponse } from "src/app/models/common.model";
import { AuthService } from "src/app/helper/app.auth.service";
import {
  ENU_Permission_Module,
  ENU_Permission_Setup,
} from "src/app/helper/config/app.module.page.enums";
import { SubscriptionLike } from "rxjs";

@Component({
  selector: "branch-view",
  templateUrl: "./view.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchViewComponent implements OnInit, OnDestroy {
  // #region Local Members

  /** Form References */
  @ViewChild("branchForm") branchForm: NgForm;

  // @Output()
  branchSaved = new EventEmitter<boolean>();

  branch: Branch = new Branch();
  // packageIdSubscription: SubscriptionLike;
  // currentBranchSubscription: SubscriptionLike;
  /** Collection Types */
  countryList: any[];
  stateList: StateCounty[];
  timeZoneList: UtcTimeZone[];
  stateListByCountryId: any[];

  /** Configurations */
  package = ENU_Package;
  weekDays = WeekDays;
  timePlaceholder = Configurations.TimePlaceholder;
  timeFormat = Configurations.TimePlaceholder;
  branchTimeFormats = Configurations.BranchTimeFormats;

  /** Messages */
  pageTitle: string;
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;

  isMondayStartRequired: boolean;
  isTuesdayStartRequired: boolean;
  isWednesdayStartRequired: boolean;
  isThursdayStartRequired: boolean;
  isFridayStartRequired: boolean;
  isSaturdayStartRequired: boolean;
  isSundayStartRequired: boolean;
  isMondayEndRequired: boolean;
  isTuesdayEndRequired: boolean;
  isWednesdayEndRequired: boolean;
  isThursdayEndRequired: boolean;
  isFridayEndRequired: boolean;
  isSaturdayEndRequired: boolean;
  isSundayEndRequired: boolean;

  isValidEndTime: boolean = true;

  isMondayEndTimeInvalid: boolean;
  isTuesdayEndTimeInvalid: boolean;
  isWednesdayEndTimeInvalid: boolean;
  isThursdayEndTimeInvalid: boolean;
  isFridayEndTimeInvalid: boolean;
  isSaturdayEndTimeInvalid: boolean;
  isSundayEndTimeInvalid: boolean;

  //--------Permissions-----------//
  isPartialPaymentAllow: boolean;
  isClientLeadAllow: boolean;
  isMemberAllow: boolean;
  isDoorCheckedInInPackage: boolean;
  isClassInPackage: boolean;
  isServiceInPackage: boolean;
  isProductInPackage: boolean;
  isShowAllBenefits: boolean;
  isMemberPaymentInPackage: boolean;
  isClietPaymentInPackage: boolean;

  /** Keys Allowed in Time filed */
  allowedKeys: string[] = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ":",
    "Backspace",
    "Delete",
    "Insert",
    "ArrowUp",
    "ArrowDown",
    "ArrowRight",
    "ArrowLeft",
    "Home",
    "End",
    "Tab",
  ];
  // This is 24 hours pattern (i.e. 0000 to 2359)
  timePattern: string = "^([01]\\d|2[0-3]):?([0-5]\\d?\\d)$";

  packageID: number;
  clientLeadPercentageToolTip: string;
  // #endregion

  constructor(
    private _httpService: HttpService,
    private _timeFormatter: TimeFormatterPipe,
    private _trimString: TrimPipe,
    public _dataSharingService: DataSharingService,
    private _dialogRef: MatDialogRef<BranchViewComponent>,
    private _messageService: MessageService,
    private _cdr: ChangeDetectorRef,
    private _authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public branchForSave: BranchForSave
  ) { }


  // #region angular hooks

  ngOnInit() {
    this.isPartialPaymentAllow = this._authService.hasPagePermission(
      ENU_Permission_Module.Setup,
      ENU_Permission_Setup.Partial_Payment
    );
    this.getBranchFundamentals();

    this.pageTitle = "Branch";
  }

  ngAfterViewChecked() {
    this._cdr.detectChanges();
  }
  ngOnDestroy() {
    // if (this.currentBranchSubscription) {
    //   this.currentBranchSubscription.unsubscribe();
    // }
    // this.packageIdSubscription.unsubscribe();
  }
  // #endregion

  // #region Events

  /**Close popup*/
  onClosePopup(): void {
    this._dialogRef.close();
  }








  /**set email from updated name and trim the value*/
  // onBranchEmailFromNameUpdated() {
  //   this.branch.BranchEmailFromName = this.branch.BranchEmailFromName.trim();
  // }

  /**set branch replay email from name and trim the value*/
  // onBranchReplyToEmailUpdated() {
  //   this.branch.BranchReplyToEmail = this.branch.BranchReplyToEmail.trim();
  // }


  // #endregion

  // #region Methods


  // onFormatChanged() {
  //   if (this.branch.BranchTimeFormat12Hours === true) {
  //     this.timeFormat = Configurations.TimePlaceholderWithFormat;
  //   } else {
  //     this.timeFormat = Configurations.TimePlaceholder;
  //   }

  // }
  /**Get branch fundamental , which included state, timeZone and country list, also called other methods like set_branch_for_edit and set_default_dropdowns*/
  getBranchFundamentals() {
    this._httpService.get(BranchApi.getBranchFundamentals).subscribe(
      (data) => {
        if (data && data.MessageCode > 0) {

          this.stateList = data.Result.StateCountyList;
          this.timeZoneList = data.Result.UTCTimeZoneList;
          this.countryList = data.Result.CountryList;
          this.setBranchForEdit();
          this.getBranchById(this.branchForSave.BranchID);

        }else{
          this._messageService.showErrorMessage(data.MessageText)
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Dropdowns_Load_Error
        );
      }
    );
  }




  /**set model for edit branch*/
  setBranchForEdit() {
    this.branch = new Branch();

    // this.setDefaultBranchTimings();
    // this.branchForSave.CountryID = this.branch.CountryID;
    this.branch.CountryID = this.branchForSave.CountryID;
    this.branch.BranchID = this.branchForSave.BranchID;
    this.branch.BranchName = this.branchForSave.BranchName;
    this.branch.CompanyID = this.branchForSave.CompanyID;
    this.branch.StateCountyName = this.branchForSave.StateCountyName;
    this.branch.CityName = this.branchForSave.CityName;
    this.branch.TimeZone = this.branchForSave.TimeZone;
    this.branch.Currency = this.branchForSave.Currency;
    this.branch.Address1 = this.branchForSave.Address1;
    this.branch.Address2 = this.branchForSave.Address2;
    this.branch.PostalCode = this.branchForSave.PostalCode;
    this.branch.BranchTimeFormat12Hours = this.branchForSave.BranchTimeFormat12Hours;
    this.branch.Email = this.branchForSave.Email;
    this.branch.Phone1 = this.branchForSave.Phone1;
    this.branch.Mobile = this.branchForSave.Mobile;
    this.branch.Fax = this.branchForSave.Fax;
    this.branch.IsActive = this.branchForSave.IsActive;
    this.branch.IsOnline = this.branchForSave.IsOnline;
    this.branch.SuspendCustomerEmail = this.branchForSave.SuspendCustomerEmail;
    this.branch.SuspendClassBenefits = this.branchForSave.SuspendClassBenefits;
    this.branch.SuspendDoorCheckInBenefits = this.branchForSave.SuspendDoorCheckInBenefits;
    this.branch.SuspendProductBenefits = this.branchForSave.SuspendProductBenefits;
    this.branch.SuspendServiceBenefits = this.branchForSave.SuspendServiceBenefits;
    if (this.branch.SuspendClassBenefits && this.branch.SuspendDoorCheckInBenefits && this.branch.SuspendProductBenefits && this.branch.SuspendServiceBenefits) {
      this.branch.isSelectAllBenefits = true;
    }
    if (this.branch.BranchTimeFormat12Hours === true) {
      this.timeFormat = Configurations.TimePlaceholderWithFormat;
    } else {
      this.timeFormat = Configurations.TimePlaceholder;
    }
    this.branch.DontRequireClientPaymentMethodwhenTotalZero = this.branchForSave.DontRequireClientPaymentMethodwhenTotalZero;
    this.branch.DontRequireMemberPaymentMethodwhenTotalZero = this.branchForSave.DontRequireMemberPaymentMethodwhenTotalZero;


    this.branch.RestrictCustomerInvoiceEmail = this.branchForSave.RestrictCustomerInvoiceEmail;
    this.branch.PrefixTypeNamePOS = this.branchForSave.PrefixTypeNamePOS;
    this.branch.PrefixTypeNameMembership = this.branchForSave.PrefixTypeNameMembership;
    this.branch.TermsOfServiceURL = this.branchForSave.TermsOfServiceURL;
    this.branch.PrivacyPolicyURL = this.branchForSave.PrivacyPolicyURL;
    this.branch.WidgetPartPaymentFriendlyName = this.branchForSave
      .WidgetPartPaymentFriendlyName
      ? this._trimString.transform(
        this.branchForSave.WidgetPartPaymentFriendlyName
      )
      : this.branchForSave.WidgetPartPaymentFriendlyName;

    this.branch.PartialPaymentLable = this.branchForSave
      .PartialPaymentLable
      ? this._trimString.transform(
        this.branchForSave.PartialPaymentLable
      )
      : this.branchForSave.PartialPaymentLable;

    this.branch.AllowPartPayment = this.branchForSave.AllowPartPayment;
    this.branch.WidgetPartPaymentForMember = this.branchForSave.WidgetPartPaymentForMember;
    this.branch.WidgetPartPaymentForNonMember = this.branchForSave.WidgetPartPaymentForNonMember;
    this.branch.BranchEmailFromName = this.branchForSave.BranchEmailFromName;
    this.branch.BranchReplyToEmail = this.branchForSave.BranchReplyToEmail;

    this.setBranchWorkTimingsForEdit();
  }

  /**set branch edit time model*/
  setBranchWorkTimingsForEdit() {
    if (this.branchForSave && this.branchForSave.BranchWorkTimeList) {
      this.branchForSave.BranchWorkTimeList.forEach((branchTime) => {
        switch (branchTime.DayID) {
          case this.weekDays.Monday: {
            this.branch.MondayStartTime = branchTime.StartTime;
            this.branch.MondayEndTime = branchTime.EndTime;
            break;
          }
          case this.weekDays.Tuesday: {
            this.branch.TuesdayStartTime = branchTime.StartTime;
            this.branch.TuesdayEndTime = branchTime.EndTime;
            break;
          }
          case this.weekDays.Wednesday: {
            this.branch.WednesdayStartTime = branchTime.StartTime;
            this.branch.WednesdayEndTime = branchTime.EndTime;
            break;
          }
          case this.weekDays.Thursday: {
            this.branch.ThursdayStartTime = branchTime.StartTime;
            this.branch.ThursdayEndTime = branchTime.EndTime;
            break;
          }
          case this.weekDays.Friday: {
            this.branch.FridayStartTime = branchTime.StartTime;
            this.branch.FridayEndTime = branchTime.EndTime;
            break;
          }
          case this.weekDays.Saturday: {
            this.branch.SaturdayStartTime = branchTime.StartTime;
            this.branch.SaturdayEndTime = branchTime.EndTime;
            break;
          }
          case this.weekDays.Sunday: {
            this.branch.SundayStartTime = branchTime.StartTime;
            this.branch.SundayEndTime = branchTime.EndTime;
            break;
          }
        }
      });
    }


  }
  /**set default dropdown value.If No Country ID is set, then set First Country from country list*/
  // setDefaultDropdowns() {
  //   this.branch.CountryID =
  //     this.branch.CountryID && this.branch.CountryID > 0
  //       ? this.branch.CountryID
  //       : this.countryList[0].CountryID;
  // }

  /**get state by country id*/
  // getStatesByCountryId(countryId: number) {
  //   if (this.stateList && this.stateList.length > 0) {
  //     this.stateListByCountryId = this.stateList.filter(
  //       (c) => c.CountryID == countryId
  //     );
  //   }
  // }

  /*Get branch info and Open dialog for edit and view branch information*/
  getBranchById(branchID: number) {
    this._httpService.get(BranchApi.getByID + branchID)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.branch = res.Result;
          this.setBranchForEdit();
          let country = this.countryList.filter(x => x.CountryID == this.branch.CountryID);
          this.branch.CountryName = country[0].CountryName;
          //this.branchForSave = res.Result;
          //this.openDialog();
        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        error => this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Branch"))
      );
  }





  // #endregion
}


