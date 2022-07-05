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

import { TimeFormatterPipe } from "@shared/pipes/time.formatter";
import { TrimPipe } from "@shared/pipes/trim";

/*********************** Service & Models *********************/
import {
  Branch,
  BranchForSave,
  BranchWorkTime,
} from "@setup/models/branch.model";
import { HttpService } from "@services/app.http.service";
import { DataSharingService } from "../../../services/data.sharing.service";
import { MessageService } from "@services/app.message.service";

/*********************** Common *********************/
import { Configurations } from "@helper/config/app.config";
import { Messages } from "@app/helper/config/app.messages";
import { BranchApi } from "@app/helper/config/app.webapi";
import { WeekDays, ENU_Package } from "@app/helper/config/app.enums";
import { DD_Branch, StateCounty, UtcTimeZone, ApiResponse } from "@app/models/common.model";
import { AuthService } from "@app/helper/app.auth.service";
import {
  ENU_Permission_Module,
  ENU_Permission_Setup,
} from "@app/helper/config/app.module.page.enums";
import { SubscriptionLike } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";

@Component({
  selector: "save-branch",
  templateUrl: "./save.branch.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BranchSaveComponent extends AbstractGenericComponent implements OnInit, OnDestroy {
  // #region Local Members

  /** Form References */
  @ViewChild("branchForm") branchForm: NgForm;

  @Output()
  branchSaved = new EventEmitter<boolean>();

  branch: Branch = new Branch();
  currentBranchData: DD_Branch = new DD_Branch();
  defaultBranchCountry:any;
  packageIdSubscription: SubscriptionLike;
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
    private _dialogRef: MatDialogRef<BranchSaveComponent>,
    private _messageService: MessageService,
    private _cdr: ChangeDetectorRef,
    public route: ActivatedRoute,
    private _router: Router,
    private _authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public branchForSave: BranchForSave
  ) { super(); }


  // #region angular hooks

  ngOnInit() {
    this.route.params.subscribe(paramMap => {
      this.getBranchById(Number(paramMap.BranchId));
    })

    this.getCurrentBranchDetail();
    this.isPartialPaymentAllow = this._authService.hasPagePermission(
      ENU_Permission_Module.Setup,
      ENU_Permission_Setup.Partial_Payment
    );

    this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
      (packageId: number) => {
        if (packageId && packageId > 0) {
          this.packageID = packageId;
          this.setPartialPaymentPermissions(packageId);
        }
      }
    );
    this.getBranchFundamentals();
    this.pageTitle = "Branch";
  }

  ngAfterViewChecked() {
    this._cdr.detectChanges();
  }
  ngOnDestroy() {
    this.packageIdSubscription.unsubscribe();
  }
  // #endregion

  // #region Events

  /**Close popup*/
  // onClosePopup(): void {
  //   this._dialogRef.close();
  // }
  onStartTimeFocusIn(day: number) {
    this.verifyStartTime(day);
  }

    //get current branch time format
    async getCurrentBranchDetail() {
      const branch = await super.getBranchDetail(this._dataSharingService);
      if (branch && branch.hasOwnProperty("Currency")) {
        this.defaultBranchCountry = branch.Currency.toLowerCase().substring(0, branch.Currency.length - 1);
        this.currentBranchData = branch;
      }
    }
  onEndTimeFocusIn(day: number) {
    this.verifyEndTime(day);
  }

  /**start date change event and check valid end time*/
  onStartDateChange(data: any, day: number) {
    let value = data.value;
    if (value != undefined && typeof (value) !== "object") {
      this.branchForm.form.markAsDirty();
      this.validateEndTime(value, day);
    } else if (value !== null && typeof (data.value) === "object") {
      data.value = new Date(data.value);
      value = data.value.getHours() + ':' + data.value.getMinutes();
      this.setStartTime(value, day);
    }
  }

  /**end date change event and check valid end and start time*/
  onEndDateChange(data: any, day: number) {
    let value = data.value;
    if (value != undefined && typeof (value) !== "object") {
      this.branchForm.form.markAsDirty();
      this.validateStartTime(value, day);
      this.isEndTimeValid();
    } else if (value !== null && typeof (data.value) === "object") {
      data.value = new Date(data.value);
      value = data.value.getHours() + ':' + data.value.getMinutes();
      this.setEndTime(value, day);
    }
  }

  /**on blur event format time value*/
  onTimeBlur() {
    this.formatTimeValue();
  }

  /**set Widget partial payment values*/
  onPartialPaymentChange() {
    if (!this.branch.AllowPartPayment) {
      this.branch.WidgetPartPaymentForMember = 100;
      this.branch.WidgetPartPaymentForNonMember = 100;
      this.branch.WidgetPartPaymentFriendlyName = null;
    }
  }

  /**set email from updated name and trim the value*/
  onBranchEmailFromNameUpdated() {
    this.branch.BranchEmailFromName = this.branch.BranchEmailFromName.trim();
  }

  /**set branch replay email from name and trim the value*/
  onBranchReplyToEmailUpdated() {
    this.branch.BranchReplyToEmail = this.branch.BranchReplyToEmail.trim();
  }

  /**set partial payment permission according to package*/
  setPartialPaymentPermissions(packageID: number) {
    switch (packageID) {
      case this.package.WellnessBasic:
        this.isClietPaymentInPackage = true;
        break;

      case this.package.WellnessMedium:
        this.isClientLeadAllow = true;
        this.isClietPaymentInPackage = true;
        this.clientLeadPercentageToolTip = this.messages.Tool_Tip_Branch.Tool_msg_WellnessMedium;
        break;

      case this.package.WellnessTop:
        this.isMemberAllow = false;
        this.isClientLeadAllow = true;
        this.isClietPaymentInPackage = true;
        this.clientLeadPercentageToolTip = this.messages.Tool_Tip_Branch.Tool_msg_WellnessTop;
        break;

      case this.package.FitnessBasic:
        this.isMemberPaymentInPackage = true;
        break;

      case this.package.FitnessMedium:
        this.isMemberAllow = true;
        this.isClientLeadAllow = false;
        this.isMemberPaymentInPackage = true;
        break;

      case this.package.Full:
        this.isMemberAllow = true;
        this.isClientLeadAllow = true;
        this.isMemberPaymentInPackage = true;
        this.isClietPaymentInPackage = true;
        this.clientLeadPercentageToolTip = this.messages.Tool_Tip_Branch.Tool_msg_Full_Package;
        break;
    }

    // set benefit permissions
    this.isDoorCheckedInInPackage = packageID == this.package.Full || packageID == this.package.FitnessBasic || packageID == this.package.FitnessMedium ? true : false;
    this.isClassInPackage = packageID == this.package.Full || packageID == this.package.FitnessBasic || packageID == this.package.FitnessMedium ? true : false;
    this.isServiceInPackage = packageID == this.package.Full ? true : false;
    this.isProductInPackage = packageID == this.package.Full || packageID == this.package.FitnessMedium ? true : false;
    this.isShowAllBenefits = this.isDoorCheckedInInPackage || this.isClassInPackage || this.isServiceInPackage || this.isProductInPackage ? true : false;
  }
  // #endregion

  // #region Methods

  /*Get branch info and Open dialog for edit and view branch information*/
  getBranchById(branchID: number) {
    this._httpService.get(BranchApi.getByID + branchID)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.branch = res.Result;
          // let country = this.countryList.filter(x => x.CountryID == this.branch.CountryID);
          // this.branch.BranchName = country[0].CountryName;
          this.branchForSave = res.Result;
          this.setBranchForEdit();
          //this.openDialog();
        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        error => this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Branch"))
      );
  }

  /**save branch information , called other methods like formate_time_values, validation, setdefault_partial_payment, set models value and shared updated branches */
  saveBranch(isvalid: boolean, branchForm) {
    if (
      this.branchForm.dirty &&
      isvalid &&
      this.isEndTimeValid() &&
      this.setDefaultPartialPayment()
    ) {
      this.hasSuccess = false;
      this.hasError = false;

      // Format Time fields

      this.formatTimeValue();
      this.setBranchModelForSave();

      this._httpService.update(BranchApi.update, this.branchForSave).subscribe(
        (res: any) => {

          if (res && res.MessageCode > 0) {
            this._dataSharingService.sharePartPaymentAllowPermission(
              this.branchForSave.AllowPartPayment
            );
            this._messageService.showSuccessMessage(
              this.messages.Success.Save_Success.replace("{0}", "Branch")
            );

            //subscribe branch settings dated on 18-02-2021 (Fahad)
            this.shareCurrentBranch();

            this.branchSaved.emit(true);
            this._router.navigate(["/setup/branch/"]);
            // this.onClosePopup();

            // this code commentd by fahad not need no subscribe update branch dated on 18-02-2021
            // this._dataSharingService.shareUpdateBranch(
            //   new DD_Branch({
            //     BranchID: this.branchForSave.BranchID,
            //     BranchName: this.branchForSave.BranchName,
            //     BranchTimeFormat12Hours: this.branchForSave.BranchTimeFormat12Hours,
            //     TimeZone: this.branchForSave.TimeZone,
            //     CurrencySymbol: this.branchForSave.CurrencySymbol,
            //     DateFormatID: this.branchForSave.DateFormatID
            //   })
            // );

          } else {
            this._messageService.showErrorMessage(
              this.messages.Error.Save_Error.replace("{0}", "Branch")
            );
          }
        },
        (err) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Save_Error.replace("{0}", "Branch")
          );
        }
      );
    }
  }

  // check staff edit active branch setting then subscribe changes dated on 18-02-2021 (Fahad)
  shareCurrentBranch() {

          this._dataSharingService.shareCurrentBranch(
            new DD_Branch({
              BranchID: this.branchForSave.BranchID,
              BranchName: this.branchForSave.BranchName,
              BranchTimeFormat12Hours: this.branchForSave.BranchTimeFormat12Hours,
              TimeZone: this.branchForSave.TimeZone,
              CurrencySymbol: this.currentBranchData.CurrencySymbol,
              DateFormatID: this.currentBranchData.DateFormatID,
              Currency: this.currentBranchData.Currency,
              Email: this.branchForSave.Email,
              Phone1: this.branchForSave.Phone1,
              Address1: this.branchForSave.Address1,
              ISOCode: this.currentBranchData.ISOCode,
              AllowPartPayment: this.currentBranchData.AllowPartPayment
            })
          );

  }

  /** check valid start time by weekly */
  validateStartTime(value: any, day: number) {
    switch (day) {
      case this.weekDays.Monday: {
        this.isMondayStartRequired = value && value != "" ? true : false;
        this.branch.MondayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Tuesday: {
        this.isTuesdayStartRequired = value && value != "" ? true : false;
        this.branch.TuesdayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Wednesday: {
        this.isWednesdayStartRequired = value && value != "" ? true : false;
        this.branch.WednesdayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Thursday: {
        this.isThursdayStartRequired = value && value != "" ? true : false;
        this.branch.ThursdayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Friday: {
        this.isFridayStartRequired = value && value != "" ? true : false;
        this.branch.FridayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Saturday: {
        this.isSaturdayStartRequired = value && value != "" ? true : false;
        this.branch.SaturdayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Sunday: {
        this.isSundayStartRequired = value && value != "" ? true : false;
        this.branch.SundayEndTime = value && value != "" ? value : "";
        break;
      }
    }
  }
  setEndTime(value: any, day: number) {
    switch (day) {
      case this.weekDays.Monday: {
        this.branch.MondayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Tuesday: {
        this.branch.TuesdayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Wednesday: {
        this.branch.WednesdayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Thursday: {
        this.branch.ThursdayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Friday: {
        this.branch.FridayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Saturday: {
        this.branch.SaturdayEndTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Sunday: {
        this.branch.SundayEndTime = value && value != "" ? value : "";
        break;
      }
    }
  }

  verifyStartTime(day: number) {
    switch (day) {
      case this.weekDays.Monday: {
        if (this.branch.MondayStartTime != undefined && this.branch.MondayStartTime == "") {
          this.branch.MondayStartTime = '00:00'
        }
        break;
      }
      case this.weekDays.Tuesday: {
        if (this.branch.TuesdayStartTime != undefined && this.branch.TuesdayStartTime == "") {
          this.branch.TuesdayStartTime = '00:00'
        }
        break;
      }
      case this.weekDays.Wednesday: {
        if (this.branch.WednesdayStartTime != undefined && this.branch.WednesdayStartTime == "") {
          this.branch.WednesdayStartTime = '00:00'
        }
        break;
      }
      case this.weekDays.Thursday: {
        if (this.branch.ThursdayStartTime != undefined && this.branch.ThursdayStartTime == "") {
          this.branch.ThursdayStartTime = '00:00'
        }
        break;
      }
      case this.weekDays.Friday: {
        if (this.branch.FridayStartTime != undefined && this.branch.FridayStartTime == "") {
          this.branch.FridayStartTime = '00:00'
        }
        break;
      }
      case this.weekDays.Saturday: {
        if (this.branch.SaturdayStartTime != undefined && this.branch.SaturdayStartTime == "") {
          this.branch.SaturdayStartTime = '00:00'
        }
        break;
      }
      case this.weekDays.Sunday: {
        if (this.branch.SundayStartTime != undefined && this.branch.SundayStartTime == "") {
          this.branch.SundayStartTime = '00:00'
        }
        break;
      }
    }
  }


  verifyEndTime(day: number) {
    switch (day) {
      case this.weekDays.Monday: {
        if (this.branch.MondayEndTime != undefined && this.branch.MondayEndTime == "") {
          this.branch.MondayEndTime = '00:00'
        }
        break;
      }
      case this.weekDays.Tuesday: {
        if (this.branch.TuesdayEndTime != undefined && this.branch.TuesdayEndTime == "") {
          this.branch.TuesdayEndTime = '00:00'
        }
        break;
      }
      case this.weekDays.Wednesday: {
        if (this.branch.WednesdayEndTime != undefined && this.branch.WednesdayEndTime == "") {
          this.branch.WednesdayEndTime = '00:00'
        }
        break;
      }
      case this.weekDays.Thursday: {
        if (this.branch.ThursdayEndTime != undefined && this.branch.ThursdayEndTime == "") {
          this.branch.ThursdayEndTime = '00:00'
        }
        break;
      }
      case this.weekDays.Friday: {
        if (this.branch.FridayEndTime != undefined && this.branch.FridayEndTime == "") {
          this.branch.FridayEndTime = '00:00'
        }
        break;
      }
      case this.weekDays.Saturday: {
        if (this.branch.SaturdayEndTime != undefined && this.branch.SaturdayEndTime == "") {
          this.branch.SaturdayEndTime = '00:00'
        }
        break;
      }
      case this.weekDays.Sunday: {
        if (this.branch.SundayEndTime != undefined && this.branch.SundayEndTime == "") {
          this.branch.SundayEndTime = '00:00'
        }
        break;
      }
    }
  }
  setStartTime(value: any, day: number) {
    switch (day) {
      case this.weekDays.Monday: {
        this.branch.MondayStartTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Tuesday: {
        this.branch.TuesdayStartTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Wednesday: {
        this.branch.WednesdayStartTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Thursday: {
        this.branch.ThursdayStartTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Friday: {
        this.branch.FridayStartTime = value && value != "" ? value : "00:00";
        break;
      }
      case this.weekDays.Saturday: {
        this.branch.SaturdayStartTime = value && value != "" ? value : "00:00";
        break;
      }
      case this.weekDays.Sunday: {
        this.branch.SundayStartTime = value && value != "" ? value : "00:00";
        break;
      }
    }
  }

  /** check valid end time by weekly */
  validateEndTime(value: string, day: number) {
    switch (day) {
      case this.weekDays.Monday: {
        this.isMondayEndRequired = value && value != "" ? true : false;
        this.branch.MondayStartTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Tuesday: {
        this.isTuesdayEndRequired = value && value != "" ? true : false;
        this.branch.TuesdayStartTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Wednesday: {
        this.isWednesdayEndRequired = value && value != "" ? true : false;
        this.branch.WednesdayStartTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Thursday: {
        this.isThursdayEndRequired = value && value != "" ? true : false;
        this.branch.ThursdayStartTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Friday: {
        this.isFridayEndRequired = value && value != "" ? true : false;
        this.branch.FridayStartTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Saturday: {
        this.isSaturdayEndRequired = value && value != "" ? true : false;
        this.branch.SaturdayStartTime = value && value != "" ? value : "";
        break;
      }
      case this.weekDays.Sunday: {
        this.isSundayEndRequired = value && value != "" ? true : false;
        this.branch.SundayStartTime = value && value != "" ? value : "";
        break;
      }
    }
  }

  /**End time validations*/
  isEndTimeValid() {
    this.isValidEndTime = true;

    this.isMondayEndTimeInvalid = false;
    this.isTuesdayEndTimeInvalid = false;
    this.isWednesdayEndTimeInvalid = false;
    this.isThursdayEndTimeInvalid = false;
    this.isFridayEndTimeInvalid = false;
    this.isSaturdayEndTimeInvalid = false;
    this.isSundayEndTimeInvalid = false;

    if (this.branch.MondayEndTime && this.branch.MondayEndTime != "" && this.branch.MondayEndTime != '00:00') {
      if (
        Number(this.branch.MondayEndTime.split(':')[0]) < Number(this.branch.MondayStartTime.split(':')[0])
      ) {
        this.isValidEndTime = false;
        this.isMondayEndTimeInvalid = true;
      } else if (
        Number(this.branch.MondayEndTime.split(':')[0]) == Number(this.branch.MondayStartTime.split(':')[0])
      ) {
        if (Number(this.branch.MondayEndTime.split(':')[1]) <= Number(this.branch.MondayStartTime.split(':')[1])) {
          this.isValidEndTime = false;
          this.isMondayEndTimeInvalid = true;
        }
      }
    }

    if (this.branch.TuesdayEndTime && this.branch.TuesdayEndTime != "" && this.branch.TuesdayEndTime != '00:00') {
      if (
        Number(this.branch.TuesdayEndTime.split(':')[0]) < Number(this.branch.TuesdayStartTime.split(':')[0])
      ) {
        this.isValidEndTime = false;
        this.isTuesdayEndTimeInvalid = true;
      } else if (
        Number(this.branch.TuesdayEndTime.split(':')[0]) == Number(this.branch.TuesdayStartTime.split(':')[0])
      ) {
        if (Number(this.branch.TuesdayEndTime.split(':')[1]) <= Number(this.branch.TuesdayStartTime.split(':')[1])) {
          this.isValidEndTime = false;
          this.isTuesdayEndTimeInvalid = true;
        }
      }
    }

    if (this.branch.WednesdayEndTime && this.branch.WednesdayEndTime != "" && this.branch.WednesdayEndTime != '00:00') {
      if (
        Number(this.branch.WednesdayEndTime.split(':')[0]) < Number(this.branch.WednesdayStartTime.split(':')[0])
      ) {
        this.isValidEndTime = false;
        this.isWednesdayEndTimeInvalid = true;
      } else if (
        Number(this.branch.WednesdayEndTime.split(':')[0]) == Number(this.branch.WednesdayStartTime.split(':')[0])
      ) {
        if (Number(this.branch.WednesdayEndTime.split(':')[1]) <= Number(this.branch.WednesdayStartTime.split(':')[1])) {
          this.isValidEndTime = false;
          this.isWednesdayEndTimeInvalid = true;
        }
      }
    }


    if (this.branch.ThursdayEndTime && this.branch.ThursdayEndTime != "" && this.branch.ThursdayEndTime != '00:00') {
      if (
        Number(this.branch.ThursdayEndTime.split(':')[0]) < Number(this.branch.ThursdayStartTime.split(':')[0])
      ) {
        this.isValidEndTime = false;
        this.isThursdayEndTimeInvalid = true;
      } else if (
        Number(this.branch.ThursdayEndTime.split(':')[0]) == Number(this.branch.ThursdayStartTime.split(':')[0])
      ) {
        if (Number(this.branch.ThursdayEndTime.split(':')[1]) <= Number(this.branch.ThursdayStartTime.split(':')[1])) {
          this.isValidEndTime = false;
          this.isThursdayEndTimeInvalid = true;
        }
      }
    }

    if (this.branch.FridayEndTime && this.branch.FridayEndTime != "" && this.branch.FridayEndTime != '00:00') {
      if (
        Number(this.branch.FridayEndTime.split(':')[0]) < Number(this.branch.FridayStartTime.split(':')[0])
      ) {
        this.isValidEndTime = false;
        this.isFridayEndTimeInvalid = true;
      } else if (
        Number(this.branch.FridayEndTime.split(':')[0]) == Number(this.branch.FridayStartTime.split(':')[0])
      ) {
        if (Number(this.branch.FridayEndTime.split(':')[1]) <= Number(this.branch.FridayStartTime.split(':')[1])) {
          this.isValidEndTime = false;
          this.isFridayEndTimeInvalid = true;
        }
      }
    }

    if (this.branch.SaturdayEndTime && this.branch.SaturdayEndTime != "" && this.branch.SaturdayEndTime != '00:00') {
      if (
        Number(this.branch.SaturdayEndTime.split(':')[0]) < Number(this.branch.SaturdayStartTime.split(':')[0])
      ) {
        this.isValidEndTime = false;
        this.isSaturdayEndTimeInvalid = true;
      } else if (
        Number(this.branch.SaturdayEndTime.split(':')[0]) == Number(this.branch.SaturdayStartTime.split(':')[0])
      ) {
        if (Number(this.branch.SaturdayEndTime.split(':')[1]) <= Number(this.branch.SaturdayStartTime.split(':')[1])) {
          this.isValidEndTime = false;
          this.isSaturdayEndTimeInvalid = true;
        }
      }
    }


    if (this.branch.SundayEndTime && this.branch.SundayEndTime != "" && this.branch.SundayEndTime != '00:00') {
      if (
        Number(this.branch.SundayEndTime.split(':')[0]) < Number(this.branch.SundayStartTime.split(':')[0])
      ) {
        this.isValidEndTime = false;
        this.isSundayEndTimeInvalid = true;
      } else if (
        Number(this.branch.SundayEndTime.split(':')[0]) == Number(this.branch.SundayStartTime.split(':')[0])
      ) {
        if (Number(this.branch.SundayEndTime.split(':')[1]) <= Number(this.branch.SundayStartTime.split(':')[1])) {
          this.isValidEndTime = false;
          this.isSundayEndTimeInvalid = true;
        }
      }
    }
    return this.isValidEndTime;
  }

  onFormatChanged() {
    if (this.branch.BranchTimeFormat12Hours === true) {
      this.timeFormat = Configurations.TimePlaceholderWithFormat;
    } else {
      this.timeFormat = Configurations.TimePlaceholder;
    }

  }
  /**Get branch fundamental , which included state, timeZone and country list, also called other methods like set_branch_for_edit and set_default_dropdowns*/
  getBranchFundamentals() {
    this._httpService.get(BranchApi.getBranchFundamentals).subscribe(
      (data) => {
        if (data && data.Result) {

          this.stateList = data.Result.StateCountyList;
          this.timeZoneList = data.Result.UTCTimeZoneList;
          this.countryList = data.Result.CountryList;

          this.setBranchForEdit();
          this.setDefaultDropdowns();
        }else{
          this._messageService.showErrorMessage(data.MessageText);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Dropdowns_Load_Error
        );
      }
    );
  }
  setDefaultBranchTimings() {
    this.branch.MondayStartTime = "00:00:00";
    this.branch.MondayEndTime = "00:00:00";
    this.branch.TuesdayStartTime = "00:00:00";
    this.branch.TuesdayEndTime = "00:00:00";
    this.branch.WednesdayStartTime = "00:00:00";
    this.branch.WednesdayEndTime = "00:00:00";
    this.branch.ThursdayStartTime = "00:00:00";
    this.branch.ThursdayEndTime = "00:00:00";
    this.branch.FridayStartTime = "00:00:00";
    this.branch.FridayEndTime = "00:00:00";
    this.branch.SaturdayStartTime = "00:00:00";
    this.branch.SaturdayEndTime = "00:00:00";
    this.branch.SundayStartTime = "00:00:00";
    this.branch.SundayEndTime = "00:00:00";
  }
  /**Prevent the charactors less then 0*/
  preventCharacters(event: any) {
    let index = this.allowedKeys.findIndex((k) => k == event.key);
    if (index < 0) {
      event.preventDefault();
    }
  }

  /** Format Start Time values and check validations*/
  formatTimeValue() {
    this.branch.MondayStartTime = this._timeFormatter.transform(
      this.branch.MondayStartTime
    );
    this.branch.TuesdayStartTime = this._timeFormatter.transform(
      this.branch.TuesdayStartTime
    );
    this.branch.WednesdayStartTime = this._timeFormatter.transform(
      this.branch.WednesdayStartTime
    );
    this.branch.ThursdayStartTime = this._timeFormatter.transform(
      this.branch.ThursdayStartTime
    );
    this.branch.FridayStartTime = this._timeFormatter.transform(
      this.branch.FridayStartTime
    );
    this.branch.SaturdayStartTime = this._timeFormatter.transform(
      this.branch.SaturdayStartTime
    );
    this.branch.SundayStartTime = this._timeFormatter.transform(
      this.branch.SundayStartTime
    );

    /** Format End Time values */
    this.branch.MondayEndTime = this._timeFormatter.transform(
      this.branch.MondayEndTime
    );
    this.branch.TuesdayEndTime = this._timeFormatter.transform(
      this.branch.TuesdayEndTime
    );
    this.branch.WednesdayEndTime = this._timeFormatter.transform(
      this.branch.WednesdayEndTime
    );
    this.branch.ThursdayEndTime = this._timeFormatter.transform(
      this.branch.ThursdayEndTime
    );
    this.branch.FridayEndTime = this._timeFormatter.transform(
      this.branch.FridayEndTime
    );
    this.branch.SaturdayEndTime = this._timeFormatter.transform(
      this.branch.SaturdayEndTime
    );
    this.branch.SundayEndTime = this._timeFormatter.transform(
      this.branch.SundayEndTime
    );

    /** Validate End Time values */
    this.validateStartTime(this.branch.MondayEndTime, this.weekDays.Monday);
    this.validateStartTime(this.branch.TuesdayEndTime, this.weekDays.Tuesday);
    this.validateStartTime(
      this.branch.WednesdayEndTime,
      this.weekDays.Wednesday
    );
    this.validateStartTime(this.branch.ThursdayEndTime, this.weekDays.Thursday);
    this.validateStartTime(this.branch.FridayEndTime, this.weekDays.Friday);
    this.validateStartTime(this.branch.SaturdayEndTime, this.weekDays.Saturday);
    this.validateStartTime(this.branch.SundayEndTime, this.weekDays.Sunday);

    /** Validate Start Time values */
    this.validateEndTime(this.branch.MondayStartTime, this.weekDays.Monday);
    this.validateEndTime(this.branch.TuesdayStartTime, this.weekDays.Tuesday);
    this.validateEndTime(
      this.branch.WednesdayStartTime,
      this.weekDays.Wednesday
    );
    this.validateEndTime(this.branch.ThursdayStartTime, this.weekDays.Thursday);
    this.validateEndTime(this.branch.FridayStartTime, this.weekDays.Friday);
    this.validateEndTime(this.branch.SaturdayStartTime, this.weekDays.Saturday);
    this.validateEndTime(this.branch.SundayStartTime, this.weekDays.Sunday);
  }

  /**check benefits accourding to the package*/
  onCheckBenefits() {
    if (this.packageID == this.package.FitnessBasic) {
      this.branch.isSelectAllBenefits = this.branch.SuspendClassBenefits && this.branch.SuspendDoorCheckInBenefits ? true : false;
    } else if (this.packageID == this.package.FitnessMedium) {
      this.branch.isSelectAllBenefits = this.branch.SuspendClassBenefits && this.branch.SuspendDoorCheckInBenefits && this.branch.SuspendProductBenefits ? true : false;
    } else if (this.packageID == this.package.Full) {
      this.branch.isSelectAllBenefits = this.branch.SuspendClassBenefits && this.branch.SuspendDoorCheckInBenefits && this.branch.SuspendProductBenefits && this.branch.SuspendServiceBenefits ? true : false;
    }
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

    this.formatTimeValue();
  }

  /**set branch model for save*/
  setBranchModelForSave() {
    this.branchForSave = new BranchForSave();

    this.branchForSave.CountryID = this.branch.CountryID;
    this.branchForSave.BranchID = this.branch.BranchID;
    this.branchForSave.BranchName = this.branch.BranchName;
    this.branchForSave.CompanyID = this.branch.CompanyID;
    this.branchForSave.StateCountyName = this.branch.StateCountyName;
    this.branchForSave.CityName = this.branch.CityName;
    this.branchForSave.TimeZone = this.branch.TimeZone;
    this.branchForSave.Currency = this.branch.Currency;
    this.branchForSave.Address1 = this.branch.Address1;
    this.branchForSave.Address2 = this.branch.Address2;
    this.branchForSave.PostalCode = this.branch.PostalCode;
    this.branchForSave.BranchTimeFormat12Hours = this.branch.BranchTimeFormat12Hours;
    this.branchForSave.Email = this.branch.Email.toLowerCase();
    this.branchForSave.Phone1 = this.branch.Phone1;
    this.branchForSave.Mobile = this.branch.Mobile;
    this.branchForSave.Fax = this.branch.Fax;
    this.branchForSave.IsActive = this.branch.IsActive;
    this.branchForSave.IsOnline = this.branch.IsOnline;
    this.branchForSave.SuspendCustomerEmail = this.branch.SuspendCustomerEmail;
    this.branchForSave.DontRequireClientPaymentMethodwhenTotalZero = this.branch.DontRequireClientPaymentMethodwhenTotalZero;
    this.branchForSave.DontRequireMemberPaymentMethodwhenTotalZero = this.branch.DontRequireMemberPaymentMethodwhenTotalZero;
    this.branchForSave.RestrictCustomerInvoiceEmail = this.branch.RestrictCustomerInvoiceEmail;
    this.branchForSave.PrefixTypeNamePOS = this.branch.PrefixTypeNamePOS;
    this.branchForSave.PrefixTypeNameMembership = this.branch.PrefixTypeNameMembership;
    this.branchForSave.PrivacyPolicyURL = this.branch.PrivacyPolicyURL;
    this.branchForSave.TermsOfServiceURL = this.branch.TermsOfServiceURL;
    this.branchForSave.WidgetPartPaymentFriendlyName = this.branch
      .WidgetPartPaymentFriendlyName
      ? this._trimString.transform(this.branch.WidgetPartPaymentFriendlyName)
      : this.branch.WidgetPartPaymentFriendlyName;

    this.branchForSave.PartialPaymentLable = this.branch
      .PartialPaymentLable
      ? this._trimString.transform(this.branch.PartialPaymentLable)
      : this.branch.PartialPaymentLable;

    this.branchForSave.AllowPartPayment = this.branch.AllowPartPayment;
    this.branchForSave.WidgetPartPaymentForMember = this.branch.WidgetPartPaymentForMember;
    this.branchForSave.WidgetPartPaymentForNonMember = this.branch.WidgetPartPaymentForNonMember;
    this.branchForSave.BranchEmailFromName = this.branch.BranchEmailFromName;
    this.branchForSave.BranchReplyToEmail = this.branch.BranchReplyToEmail;

    this.branchForSave.SuspendClassBenefits = this.branch.SuspendClassBenefits;
    this.branchForSave.SuspendDoorCheckInBenefits = this.branch.SuspendDoorCheckInBenefits;
    this.branchForSave.SuspendProductBenefits = this.branch.SuspendProductBenefits;
    this.branchForSave.SuspendServiceBenefits = this.branch.SuspendServiceBenefits;

    this.setBranchWorkTimingsForSave();
  }

  /**suspend/unsuspend all benefits on branch level*/
  onsuspendAllChange() {
    if (this.branch.isSelectAllBenefits) {
      this.branch.SuspendClassBenefits = true;
      this.branch.SuspendDoorCheckInBenefits = true;
      this.branch.SuspendProductBenefits = true;
      this.branch.SuspendServiceBenefits = true;
    }
    else {
      this.branch.SuspendClassBenefits = false;
      this.branch.SuspendDoorCheckInBenefits = false;
      this.branch.SuspendProductBenefits = false;
      this.branch.SuspendServiceBenefits = false;
    }
  }

  /**set branch save time model*/
  setBranchWorkTimingsForSave() {
    let branchWorkTime = new BranchWorkTime();
    this.branchForSave.BranchWorkTimeList = [];

    if (
      this.branch.MondayStartTime &&
      this.branch.MondayStartTime !== "" &&
      this.branch.MondayEndTime &&
      this.branch.MondayEndTime !== "" &&
      this.branch.MondayEndTime !== "00:00"
    ) {
      branchWorkTime = new BranchWorkTime();
      branchWorkTime.DayID = this.weekDays.Monday;
      branchWorkTime.StartTime = this.branch.MondayStartTime;
      branchWorkTime.EndTime = this.branch.MondayEndTime;

      this.branchForSave.BranchWorkTimeList.push(branchWorkTime);
    }

    if (
      this.branch.TuesdayStartTime &&
      this.branch.TuesdayStartTime !== "" &&
      this.branch.TuesdayEndTime &&
      this.branch.TuesdayEndTime !== "" &&
      this.branch.TuesdayEndTime !== "00:00"
    ) {
      branchWorkTime = new BranchWorkTime();
      branchWorkTime.DayID = this.weekDays.Tuesday;
      branchWorkTime.StartTime = this.branch.TuesdayStartTime;
      branchWorkTime.EndTime = this.branch.TuesdayEndTime;

      this.branchForSave.BranchWorkTimeList.push(branchWorkTime);
    }

    if (
      this.branch.WednesdayStartTime &&
      this.branch.WednesdayStartTime !== "" &&
      this.branch.WednesdayEndTime &&
      this.branch.WednesdayEndTime !== "" &&
      this.branch.WednesdayEndTime !== "00:00"
    ) {
      branchWorkTime = new BranchWorkTime();
      branchWorkTime.DayID = this.weekDays.Wednesday;
      branchWorkTime.StartTime = this.branch.WednesdayStartTime;
      branchWorkTime.EndTime = this.branch.WednesdayEndTime;

      this.branchForSave.BranchWorkTimeList.push(branchWorkTime);
    }

    if (
      this.branch.ThursdayStartTime &&
      this.branch.ThursdayStartTime !== "" &&
      this.branch.ThursdayEndTime &&
      this.branch.ThursdayEndTime !== "" &&
      this.branch.ThursdayEndTime !== "00:00"
    ) {
      branchWorkTime = new BranchWorkTime();
      branchWorkTime.DayID = this.weekDays.Thursday;
      branchWorkTime.StartTime = this.branch.ThursdayStartTime;
      branchWorkTime.EndTime = this.branch.ThursdayEndTime;

      this.branchForSave.BranchWorkTimeList.push(branchWorkTime);
    }

    if (
      this.branch.FridayStartTime &&
      this.branch.FridayStartTime !== "" &&
      this.branch.FridayEndTime &&
      this.branch.FridayEndTime !== "" &&
      this.branch.FridayEndTime !== "00:00"
    ) {
      branchWorkTime = new BranchWorkTime();
      branchWorkTime.DayID = this.weekDays.Friday;
      branchWorkTime.StartTime = this.branch.FridayStartTime;
      branchWorkTime.EndTime = this.branch.FridayEndTime;

      this.branchForSave.BranchWorkTimeList.push(branchWorkTime);
    }

    if (
      this.branch.SaturdayStartTime &&
      this.branch.SaturdayStartTime !== "" &&
      this.branch.SaturdayEndTime &&
      this.branch.SaturdayEndTime !== "" &&
      this.branch.SaturdayEndTime !== "00:00"
    ) {
      branchWorkTime = new BranchWorkTime();
      branchWorkTime.DayID = this.weekDays.Saturday;
      branchWorkTime.StartTime = this.branch.SaturdayStartTime;
      branchWorkTime.EndTime = this.branch.SaturdayEndTime;

      this.branchForSave.BranchWorkTimeList.push(branchWorkTime);
    }

    if (
      this.branch.SundayStartTime &&
      this.branch.SundayStartTime !== "" &&
      this.branch.SundayEndTime &&
      this.branch.SundayEndTime !== "" &&
      this.branch.SundayEndTime !== "00:00"
    ) {
      branchWorkTime = new BranchWorkTime();
      branchWorkTime.DayID = this.weekDays.Sunday;
      branchWorkTime.StartTime = this.branch.SundayStartTime;
      branchWorkTime.EndTime = this.branch.SundayEndTime;

      this.branchForSave.BranchWorkTimeList.push(branchWorkTime);
    }
  }

  /**set default dropdown value.If No Country ID is set, then set First Country from country list*/
  setDefaultDropdowns() {
    this.branch.CountryID =
      this.branch.CountryID && this.branch.CountryID > 0
        ? this.branch.CountryID
        : this.countryList[0].CountryID;
  }

  /**return boolean value for Default Partial Payment*/
  setDefaultPartialPayment(): boolean {
    if (this.branch.AllowPartPayment) {
      if (
        this.branch.WidgetPartPaymentForMember.toString() == "" &&
        this.branch.WidgetPartPaymentForNonMember.toString() == ""
      ) {
        this._messageService.showErrorMessage(
          this.messages.Validation.Payment_Percentage
        );
        return false;
      } else if (this.branch.WidgetPartPaymentForMember.toString() == "") {
        this._messageService.showErrorMessage(
          this.messages.Validation.Payment_Percentage_Member
        );
        return false;
      } else if (this.branch.WidgetPartPaymentForNonMember.toString() == "") {
        this._messageService.showErrorMessage(
          this.messages.Validation.Payment_Percentage_Client
        );
        return false;
      }
    }
    return true;
  }

  /**get state by country id*/
  getStatesByCountryId(countryId: number) {
    if (this.stateList && this.stateList.length > 0) {
      this.stateListByCountryId = this.stateList.filter(
        (c) => c.CountryID == countryId
      );
    }
  }

  /** To copy Text from Textbox */
  copyUrl(prefix: string, value: string) {
    var tempInput = document.createElement("input");
    tempInput.style.position = "relative";
    tempInput.style.left = "-1000px";
    tempInput.style.top = "-1000px";
    tempInput.value = prefix + value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }

  /** on focus out trim PartialPaymentFriendlyName string*/
  trimPartialPaymentFriendlyName() {
    this.branch.WidgetPartPaymentFriendlyName = this.branch
      .WidgetPartPaymentFriendlyName
      ? this._trimString.transform(this.branch.WidgetPartPaymentFriendlyName)
      : this.branch.WidgetPartPaymentFriendlyName;
  }

  /** trim partial payment label */
  trimPartialPaymentLable() {
    this.branch.PartialPaymentLable = this.branch
      .PartialPaymentLable
      ? this._trimString.transform(this.branch.PartialPaymentLable)
      : this.branch.PartialPaymentLable;
  }

  // #endregion
}
