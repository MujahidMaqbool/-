/********************* Angular References ********************/
import { Component, Inject, OnInit } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
/*********************** Material Reference *************************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
/**********************Component*********************/
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';

/********************* Services & Models ********************/
/* Services */
import { HttpService } from '@services/app.http.service';
import { DateTimeService } from '@services/date.time.service';
import { MessageService } from '@app/services/app.message.service';
import { TaxCalculation } from '@app/services/tax.calculations.service';
import { DataSharingService } from '@app/services/data.sharing.service';

/* Models*/
import { ViewMembership, ViewMembershipBranchClass, ViewMembershipPayment, MembershipClockInTime, MembershipPayment } from '@setup/models/membership.model';
import { ApiResponse, DD_Branch } from '@app/models/common.model';

/********************** Common ***************************/
import { Messages } from '@app/helper/config/app.messages';
import { MembershipApi } from '@app/helper/config/app.webapi';
import { MembershipPaymentType, WeekDays, MembershipType, ENU_Package } from '@app/helper/config/app.enums';
import { MembershipTypeName } from '@app/helper/config/app.config';


@Component({
  selector: 'membership-view',
  templateUrl: './membership.view.component.html'
})
export class MembershipViewComponent extends AbstractGenericComponent implements OnInit {

  packageIdSubscription: SubscriptionLike;

  // #region Local Members
  currencyFormat: string;
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;
  isPurchaseRestrictionAllowed:boolean = false;

  weekDays = WeekDays;
  membershipType = MembershipType;
  membershipTypeNames = MembershipTypeName;

  /* Models */
  membership: ViewMembership = new ViewMembership();


  /** Collections */
  membershipBranchClassList: ViewMembershipBranchClass[];
  singlePaymentList: ViewMembershipPayment[];
  recurringPaymentList: ViewMembershipPayment[];
  membershipClockInTimeList: MembershipClockInTime[] = [];

  // #endregion

  constructor(
    private _httpService: HttpService,
    private _dateTimeService: DateTimeService,
    private _messageService: MessageService,
    private _taxCalculationService: TaxCalculation,
    private _dataSharingService: DataSharingService,
    public _dialogRef: MatDialogRef<MembershipViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      super();
  }

  ngOnInit() {
    for (let index = 0; index < 7; index++) {
      let membershipTime = new MembershipClockInTime();
      membershipTime.DayID = index;
      membershipTime.IsBranchOperationTime = false;
      membershipTime.IsDayRestricted = false;

      this.membershipClockInTimeList.push(membershipTime);
    }
    this.viewMemebershipById(this.data.MembershipID);

    this.getCurrentBranchDetail();

    // Subscribe package ID
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
      (packageId: number) => {
        if (packageId && packageId > 0) {
          this.setPackageBasedPermissions(packageId);
        }
      }
    );
  }


  gOnDestroy() {
    this.packageIdSubscription?.unsubscribe();
  }

  // Package Based Permission
  setPackageBasedPermissions(packageID: number){
  this.isPurchaseRestrictionAllowed =  packageID == ENU_Package.Full ? true : false;
  }
  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.CurrencySymbol;

    }
  }

  onCloseDialog() {
    this._dialogRef.close();
  }

  viewMemebershipById(membershipId: number) {
    this.singlePaymentList = [];
    this.recurringPaymentList = [];
    if (membershipId > 0) {

      this._httpService.get(MembershipApi.viewMemberById + this.data.MembershipID + "/" + this.data.CustomerMembershipID)
        .subscribe(
          (res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
              if (res.Result != null) {
                this.membership = res.Result;
                if (res.Result.MembershipPaymentList != null) {
                  this.singlePaymentList = res.Result.MembershipPaymentList.filter((Paymentlist: any) => Paymentlist.MembershipPaymentTypeID === MembershipPaymentType.Single);
                  this.recurringPaymentList = res.Result.MembershipPaymentList.filter((Paymentlist: any) => Paymentlist.MembershipPaymentTypeID === MembershipPaymentType.Recurring);
                }
                this.membershipClockInTimeList = res.Result.MembershipClockInTimeList ? res.Result.MembershipClockInTimeList : [];

                this.setMembershipTypeName();
                this.formatTimeValue();
                this.convertClassListToString();
                this.calculateSinglePaymentTotalAmount();
                this.calculateReccuringTotalAmount();
              }
            }
            else {
              this._messageService.showErrorMessage(res.MessageText);
            }
          },
          err => {
            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Membership"));
          }
        );
    }
  }

  setMembershipTypeName() {
    switch (this.membership.MembershipTypeID) {
      case this.membershipType.TimeBased:
        this.membership.MembershipTypeName = this.membershipTypeNames.TimeBased;
        break;
      case this.membershipType.TimeAndSessionBased:
        this.membership.MembershipTypeName = this.membershipTypeNames.TimeAndSessionBased;
        break;
      case this.membershipType.ClassBased:
        this.membership.MembershipTypeName = this.membershipTypeNames.ClassBased;
        break;
      case this.membershipType.ClassAndSessionBased:
        this.membership.MembershipTypeName = this.membershipTypeNames.ClassAndSessionBased;
        break;
    }
  }

  convertClassListToString() {
    this.membershipBranchClassList = [];
    if (this.membership.MembershipBranchList) {
      this.membership.MembershipBranchList.forEach(branch => {
        let branchWithClass = new ViewMembershipBranchClass();

        branchWithClass.BranchName = branch.BranchName
        if (branch.MembershipClassList && branch.MembershipClassList.length > 0) {
          branch.Classes = '';
          branch.MembershipClassList.forEach(c => branch.Classes += c.ClassName + ', ');
          branch.Classes = branch.Classes.substr(0, branch.Classes.lastIndexOf(','));
        }
        this.membershipBranchClassList.push(branch);
      })
    }
  }

  calculateSinglePaymentTotalAmount() {
    if (this.singlePaymentList) {
      this.singlePaymentList.forEach((payment: ViewMembershipPayment) => {
        payment.TotalPrice = payment.Price + this._taxCalculationService.getTaxAmount(payment.TotalTaxPercentage, payment.Price);
      })
    }
  }

  calculateReccuringTotalAmount() {
    if (this.recurringPaymentList) {
      this.recurringPaymentList.forEach((payment: ViewMembershipPayment) => {
        payment.TotalPrice = (payment.Price + this._taxCalculationService.getTaxAmount(payment.TotalTaxPercentage, payment.Price)) * payment.RecurringInterval;
      })
    }
  }

  formatTimeValue() {
    this.membershipClockInTimeList.forEach(m => {
      if (m.StartTime && m.EndTime) {
        m.StartTime = this._dateTimeService.formatTimeString(m.StartTime);
        m.EndTime = this._dateTimeService.formatTimeString(m.EndTime);
      }
    });
  }

}
