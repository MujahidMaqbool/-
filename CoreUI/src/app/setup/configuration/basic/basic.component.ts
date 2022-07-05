/*********** Angular **********/
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
/*********** Configurations **********/
import { ConfigurationsApi } from '@app/helper/config/app.webapi';
import { HttpService } from '@app/services/app.http.service';
/*********** Components **********/
/*********** Models **********/
import { ApiResponse } from '@app/models/common.model';
import { BrachBasic, BasicAccessControl } from '@app/setup/models/branch.basic.model';
import { DurationTypeList } from '@app/scheduler/models/class.model';
/*********** Services **********/
import { MessageService } from '@app/services/app.message.service';
import { Configurations } from '@app/helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { DataSharingService } from '@app/services/data.sharing.service';
import { SubscriptionLike } from 'rxjs';
import { ENU_Package } from '@app/helper/config/app.enums';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html'
})
export class BasicComponent implements OnInit {

  ServiceInterval = Configurations.ServiceInterval;
  AllowedNumberKeys = Configurations.AllowedNumberKeys;
  DateIntervalForClasses = Configurations.DateIntervalForClasses;
  AccessControlTimeIntervel = Configurations.AccessControlInterval;
  AccessControlOpeningTime = Configurations.AccessControlOpeningTime;
  messages = Messages;
  // Model & Listing
  brachBasic: BrachBasic = new BrachBasic();
  brachBasicControlAccess: BasicAccessControl = new BasicAccessControl();
  copyBrachBasic: BrachBasic = new BrachBasic();
  durationTypeList: DurationTypeList[] = [];
  showError: boolean;
  hasFamilyAndFriendInPackage: boolean = false;
  hasRewardProgramPackage: boolean = false;
  hasAccessControlPackage: boolean = false;

  accessControlMembers: boolean = false;
  accessControlStaff: boolean = false;
  showHidePriceLabel: boolean = false;

  packageIdSubscription: SubscriptionLike;
  package = ENU_Package;

  constructor(private _httpService: HttpService, private _messageService: MessageService, private rewriteUrl: Location, private _dataSharingService: DataSharingService, ) { }

  ngOnInit(): void {
    this.checkPackagePermissions();

    //rewrite the url state
    this.rewriteUrl.replaceState("/setup/configurations/basic");
    this.getFundamental();
  }

  ngOnDestroy() {
    this.packageIdSubscription?.unsubscribe();
  }

  //#region

  checkPackagePermissions() {
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
      if (packageId && packageId > 0) {
        this.setPackagePermissions(packageId);
      }
    })
  }

  setPackagePermissions(packageId: number) {
    this.hasFamilyAndFriendInPackage = false;

    switch (packageId) {
      case this.package.FitnessBasic:
        break;
      case this.package.FitnessMedium:
        this.hasFamilyAndFriendInPackage = true;
        this.showHidePriceLabel = true;
        break;
      case this.package.WellnessTop:
        this.showHidePriceLabel = true;
        break;
      case this.package.Full:
        this.hasFamilyAndFriendInPackage = true;
        this.hasRewardProgramPackage = true;
        this.hasAccessControlPackage = true;
        this.showHidePriceLabel = true;
        break;
    }

  }

  //on change customer check in toggle
  onChangeCustomerCheckIn() {
    if (!this.brachBasic.ServiceCustomerCheckIn) {
      this.brachBasic.ServiceCustomerCheckInStartsBefore = 1;
      this.brachBasic.ServiceCustomerCheckInEndsAfter = 1;
      this.brachBasic.ServiceCustomerCheckInStartsBeforeDurationTypeId = this.durationTypeList[0].DurationTypeID;
      this.brachBasic.ServiceCustomerCheckInEndsAfterDurationTypeId = this.durationTypeList[0].DurationTypeID;

    }
    if (!this.brachBasic.ClassCustomerCheckIn) {
      this.brachBasic.ClassCustomerCheckInStartsBefore = 1;
      this.brachBasic.ClassCustomerCheckInEndsAfter = 1;
      this.brachBasic.ClassCustomerCheckInStartsBeforeDurationTypeId = this.durationTypeList[0].DurationTypeID;
      this.brachBasic.ClassCustomerCheckInEndsAfterDurationTypeId = this.durationTypeList[0].DurationTypeID;
    }
  }

  // on SelecStaff DoorAccess Timing
  onSelectStaffDoorAccessTiming() {
    if (this.brachBasicControlAccess.StaffDoorAccessTiming == 1) {
      this.brachBasicControlAccess.StaffDoorAccessTimeGracePeriodInMinutesText = "0 Minutes";
    } else {
      this.brachBasicControlAccess.StaffDoorAccessTimeGracePeriodInMinutes = this.AccessControlTimeIntervel[0].value;
    }
  }

  // on change select all benefits toggle
  onChangeAllbenefits() {
    if (this.brachBasic.SuspendAllBenefits) {
      this.brachBasic.SuspendDoorCheckInBenefits = true;
      this.brachBasic.SuspendClassBenefits = true;
      this.brachBasic.SuspendProductBenefits = true;
      this.brachBasic.SuspendServiceBenefits = true;
    } else {
      this.brachBasic.SuspendDoorCheckInBenefits = false;
      this.brachBasic.SuspendClassBenefits = false;
      this.brachBasic.SuspendProductBenefits = false;
      this.brachBasic.SuspendServiceBenefits = false;
    }
  }
  onChangeClassBookingForFamilyAndFriends() {
    if (!this.brachBasic.IsClassBookingForFamilyAndFriends) {
      this.brachBasic.IsClassBookingDiscountBenefitsForFamilyAndFriends = false;
      this.brachBasic.IsClassBookingFreeBenefitsForFamilyAndFirends = false;
    }
  }

  // on Change Members Access Control
  onChangeMembersAccessControl() {
    if (this.accessControlMembers) {
      this.brachBasicControlAccess.MemberBLEAccess = true;
      this.brachBasicControlAccess.MemberNFCAccess = true;
    } else if (!this.accessControlMembers) {
      this.brachBasicControlAccess.MemberBLEAccess = false;
      this.brachBasicControlAccess.MemberNFCAccess = false;
    }
  }
  onChangeMembersAccessControlType() {
    if (this.brachBasicControlAccess.MemberBLEAccess || this.brachBasicControlAccess.MemberNFCAccess) {
      this.accessControlMembers = true;
    } else {
      this.accessControlMembers = false;
    }
  }

  // on Change Staff Access Control
  onChangeStaffAccessControl() {
    if (this.accessControlStaff) {
      this.brachBasicControlAccess.StaffBLEAccess = true;
      this.brachBasicControlAccess.StaffNFCAccess = true;
    } else if (!this.accessControlStaff) {
      this.brachBasicControlAccess.StaffBLEAccess = false;
      this.brachBasicControlAccess.StaffNFCAccess = false;
    }
  }
  onChangeStaffAccessControlType() {
    if (this.brachBasicControlAccess.StaffBLEAccess || this.brachBasicControlAccess.StaffNFCAccess) {
      this.accessControlStaff = true;
    } else {
      this.accessControlStaff = false;
    }
  }

  // on reset form
  onReset() {
    this.brachBasic = Object.assign({}, this.copyBrachBasic);
    this.brachBasicControlAccess = Object.assign({}, this.copyBrachBasic.accessControl);

    this.showError = false;
  }
  //#endregion


  //#region
  // set default values
  setDefaultValues() {
    this.brachBasic.ServiceCustomerCheckInStartsBefore = this.brachBasic.ServiceCustomerCheckInStartsBefore != 0 && this.brachBasic.ServiceCustomerCheckInStartsBefore != undefined ? this.brachBasic.ServiceCustomerCheckInStartsBefore : 1;
    this.brachBasic.ServiceCustomerCheckInEndsAfter = this.brachBasic.ServiceCustomerCheckInEndsAfter != 0 && this.brachBasic.ServiceCustomerCheckInEndsAfter != undefined ? this.brachBasic.ServiceCustomerCheckInEndsAfter : 1;
    this.brachBasic.ClassCustomerCheckInStartsBefore = this.brachBasic.ClassCustomerCheckInStartsBefore != 0 && this.brachBasic.ClassCustomerCheckInStartsBefore != undefined ? this.brachBasic.ClassCustomerCheckInStartsBefore : 1;
    this.brachBasic.ClassCustomerCheckInEndsAfter = this.brachBasic.ClassCustomerCheckInEndsAfter != 0 && this.brachBasic.ClassCustomerCheckInEndsAfter != undefined ? this.brachBasic.ClassCustomerCheckInEndsAfter : 1;
    this.brachBasic.ServiceLeadTime = this.brachBasic.ServiceLeadTime != 0 ? this.brachBasic.ServiceLeadTime : this.ServiceInterval[2].value;
    this.brachBasic.ServiceTimeSlotsInterval = this.brachBasic.ServiceTimeSlotsInterval != 0 ? this.brachBasic.ServiceTimeSlotsInterval : this.ServiceInterval[3].value;
    this.brachBasic.DateFilterForClasses = this.brachBasic.DateFilterForClasses == 0 ? this.DateIntervalForClasses[0].value : this.brachBasic.DateFilterForClasses;
  }

  // get fundamental
  getFundamental() {
    this._httpService.get(ConfigurationsApi.basicBranchSetting).subscribe((res: ApiResponse) => {
      if (res.MessageCode > 0 && res.Result) {
        this.brachBasic = res.Result;
        this.copyBrachBasic = Object.assign({}, this.brachBasic);
        this.durationTypeList = res.Result.DurationTypeList;
        this.brachBasicControlAccess = this.brachBasic.accessControl ? this.brachBasic.accessControl : new BasicAccessControl();
        this.onChangeMembersAccessControlType();
        this.onChangeStaffAccessControlType();
        this.brachBasic.ServiceCustomerCheckInStartsBeforeDurationTypeId = this.brachBasic.ServiceCustomerCheckInStartsBeforeDurationTypeId != 0 && this.brachBasic.ServiceCustomerCheckInStartsBeforeDurationTypeId != undefined ? this.brachBasic.ServiceCustomerCheckInStartsBeforeDurationTypeId : res.Result.DurationTypeList[0].DurationTypeID;
        this.brachBasic.ServiceCustomerCheckInEndsAfterDurationTypeId = this.brachBasic.ServiceCustomerCheckInEndsAfterDurationTypeId != 0 && this.brachBasic.ServiceCustomerCheckInEndsAfterDurationTypeId != undefined ? this.brachBasic.ServiceCustomerCheckInEndsAfterDurationTypeId : res.Result.DurationTypeList[0].DurationTypeID;
        this.brachBasic.ClassCustomerCheckInStartsBeforeDurationTypeId = this.brachBasic.ClassCustomerCheckInStartsBeforeDurationTypeId != 0 && this.brachBasic.ClassCustomerCheckInStartsBeforeDurationTypeId != undefined ? this.brachBasic.ClassCustomerCheckInStartsBeforeDurationTypeId : res.Result.DurationTypeList[0].DurationTypeID;
        this.brachBasic.ClassCustomerCheckInEndsAfterDurationTypeId = this.brachBasic.ClassCustomerCheckInEndsAfterDurationTypeId != 0 && this.brachBasic.ClassCustomerCheckInEndsAfterDurationTypeId != undefined ? this.brachBasic.ClassCustomerCheckInEndsAfterDurationTypeId : res.Result.DurationTypeList[0].DurationTypeID;
        
        this.accessControlMembers = this.brachBasicControlAccess.MemberBLEAccess || this.brachBasicControlAccess.MemberNFCAccess ? true : false;
        this.accessControlStaff = this.brachBasicControlAccess.StaffBLEAccess || this.brachBasicControlAccess.StaffNFCAccess ? true : false;

        if (this.brachBasicControlAccess.StaffDoorAccessTiming == 0) {
          this.brachBasicControlAccess.StaffDoorAccessTiming = 1;
          this.brachBasicControlAccess.StaffDoorAccessTimeGracePeriodInMinutesText = "0 Minutes";
        } else {
          if (this.brachBasicControlAccess.StaffDoorAccessTiming == 1) {
            this.brachBasicControlAccess.StaffDoorAccessTimeGracePeriodInMinutesText = "0 Minutes";
          } else {
            this.brachBasicControlAccess.StaffDoorAccessTimeGracePeriodInMinutes = this.brachBasicControlAccess.StaffDoorAccessTimeGracePeriodInMinutes;
          }
        }
        this.chekedAllBenefitSwithedIfAllBenefitCheked();
        this.setDefaultValues();
      } else {
        this._messageService.showErrorMessage(res.MessageText);
      }
    })
  }

  // change benefits toggle
  chekedAllBenefitSwithedIfAllBenefitCheked() {
    this.brachBasic.SuspendAllBenefits = this.brachBasic.SuspendDoorCheckInBenefits
      && this.brachBasic.SuspendClassBenefits &&
      this.brachBasic.SuspendProductBenefits && this.brachBasic.SuspendServiceBenefits ? true : false;
  }

  // save basic branch setting
  savebasicBranchSetting() {
    if (!this.isValid()) {
      if (this.brachBasicControlAccess.StaffDoorAccessTiming == 1) { this.brachBasicControlAccess.StaffDoorAccessTimeGracePeriodInMinutes = 0 }
      this.brachBasic.accessControl = this.brachBasicControlAccess
      this._httpService.save(ConfigurationsApi.saveBasicBranchSetting, this.brachBasic).subscribe((res: ApiResponse) => {
        if (res.MessageCode && res.MessageCode > 0) {
          this.getFundamental();
          this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Basic information"))
        } else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      })
    }

  }

  isValid() {
    if (this.brachBasic.ServiceCustomerCheckInStartsBefore.toString() == "" || this.brachBasic.ServiceCustomerCheckInStartsBefore.toString() == "0") {
      this.showError = true;
    } else if (this.brachBasic.ServiceCustomerCheckInEndsAfter.toString() == "" || this.brachBasic.ServiceCustomerCheckInEndsAfter.toString() == "0") {
      this.showError = true;
    }
    if (this.brachBasic.ClassCustomerCheckInStartsBefore.toString() == "" || this.brachBasic.ClassCustomerCheckInStartsBefore.toString() == "0") {
      this.showError = true;
    } else if (this.brachBasic.ClassCustomerCheckInEndsAfter.toString() == "" || this.brachBasic.ClassCustomerCheckInEndsAfter.toString() == "0") {
      this.showError = true;
    }
    return this.showError;
  }

  //#endregion

  preventCharactersForClassBooking(event: any) {
    //console.log(this.parentClassObj.ClassDurationInMinutes.toString())
    let index = this.AllowedNumberKeys.findIndex(k => k == event.key);
    if (index < 0) {
      event.preventDefault()
    }
  }

  onPercentageChangeOnlyNumbers(num) {
    this.showError = num && num != "" && num != "0" ? false : true;
  }

}
