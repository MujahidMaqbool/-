/******************* Angular Refereces *****************/
import { Component, OnInit, ViewChild } from "@angular/core";
import { SubscriptionLike as ISubscription } from 'rxjs';
import { Router } from '@angular/router';

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { MemberAttendanceApi, AttendeeApi } from "src/app/helper/config/app.webapi";
import { Messages } from "src/app/helper/config/app.messages";
import { DataSharingService } from 'src/app/services/data.sharing.service';

/* Models */
import { MemberAttendanceDetail, CustomerMembership, MemberClassDetail, MembershipClockin, MembershipMessage, CustomerMembershipPaymentInfoList, BranchTimingListForMemberShip, MembershipGlobalSessionDetail, MembershipAlertMessages, MemberMembershipMessages } from "src/app/attendance/models/member.attendance.model";
import { ApiResponse, DD_Branch } from "src/app/models/common.model";
import { MembershipTypeName } from "src/app/helper/config/app.config";
import { CompanyDetails } from "src/app/setup/models/company.details.model";
import { AttendeeClassAttendance } from "src/app/models/attendee.model";

/******* Configurations *********/
import { environment } from "src/environments/environment";
import { MembershipType, MembershipDurationType, EnumBookingStatusType, MembershipStatus_Enum, ENU_ClockinRestrictionType, ENU_DateFormatName, ENU_MemberShipBenefitDurations, MembershipBenefitType, ENU_MembershipAlertMessageRestrictionType, ENU_DurationType } from "src/app/helper/config/app.enums";
import { ImagesPlaceholder } from "src/app/helper/config/app.placeholder";
import { AppUtilities } from "src/app/helper/aap.utilities";


/******* Components *********/
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { TimeClockComponent } from "src/app/attendance/shared/time.clock.component";

@Component({
    selector: 'member-attendance-details',
    templateUrl: './member.attendance.details.component.html'
})

export class MemberAttendanceDetailsComponent extends AbstractGenericComponent implements OnInit {

    @ViewChild("clock") branchCurrentTime: TimeClockComponent;
    /* Configurations */

    /* Local Members */

    //isCheckinSessionConsumed: boolean = false;
    isAllowedDoorCheckIns: boolean = false;
    isShowDoorCheckInButton: boolean = false;
    IsDoorCheckInBenefitsSuspended: boolean;
    membershipTypeName: string;
    intervalId: any;
    clockedInMemberInfoSubscription: ISubscription;
    serverImageAddress = environment.imageUrl;
    imagePath = ImagesPlaceholder.user;
    classImage = ImagesPlaceholder.pos;
    dateFormatForSearch = 'yyyy-MM-dd';
    isPageLoad: boolean = false;
    //dateFormatForSearch = Configurations.NotficationDateTimeFormat
    dateFormat: string = "";//Configurations.DateFormat;

    /* Model Refrences*/
    memberAttendaceModel: MemberAttendanceDetail = new MemberAttendanceDetail();
    selectedMembership: CustomerMembership = new CustomerMembership();
    membershipClockinModel: MembershipClockin = new MembershipClockin();


    /* Collection Types */
    memberMembershipList: CustomerMembership[];
    filteredMemberMembershipList: CustomerMembership[];
    branchTimingListForMemberShip: BranchTimingListForMemberShip[];
    memberClassDetailList: MemberClassDetail[];
    membershipGlobalSessionList: MembershipGlobalSessionDetail[];
    membershipAlertMessages: MembershipAlertMessages[];
    messagesList: MembershipMessage[];
    customerMembershipPaymentInfoList: CustomerMembershipPaymentInfoList[];
    memberMembershipMessages: MemberMembershipMessages[];

    companyInfo: CompanyDetails = new CompanyDetails();
    branchInfo: DD_Branch = new DD_Branch();

    membershipType = MembershipType;
    membershipTypeNames = MembershipTypeName;
    membershipDurationType = MembershipDurationType;
    classBookingStatusType = EnumBookingStatusType;
    enu_MembershipStatus = MembershipStatus_Enum;
    enu_ClockinRestrictionType = ENU_ClockinRestrictionType;
    showMembershipTime: boolean = true;
    isMembershipExists: boolean = false;
    isMembershipCancelled: boolean = false;
    hasClasses: boolean = false;
    IsTodayAttendanceMarked: boolean = false;
    timeInterval:number;

    /* Messages */
    messages = Messages;

    //enum
    enuMemberShipBenefitDurations = ENU_MemberShipBenefitDurations;
    enuMembershipBenefitType = MembershipBenefitType;
    enuMembershipAlertMessageRestrictionType = ENU_MembershipAlertMessageRestrictionType;

    // slideConfig = {
    //     "slidesToShow": 6,
    //     "slidesToScroll": 1,
    //     "nextArrow": "<div class='nav-btn next-slide'></div>",
    //     "prevArrow": "<div class='nav-btn prev-slide'></div>",
    //     "dots": false,
    //     "infinite": false
    // };

    slideConfig = {
      "slidesToShow": 6,
      "slidesToScroll": 1,
      "nextArrow": "<div class='nav-btn next-slide'></div>",
      "prevArrow": "<div class='nav-btn prev-slide'></div>",
      "dots": false,
      "infinite": false,
      responsive: [{
          breakpoint: 1360,
          settings: {
              slidesToShow: 5,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 5000,
              speed: 800
          }
      },
      {
          breakpoint: 1199,
          settings: {
              slidesToShow: 4,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 5000,
              speed: 800
          }
      },
      {
          breakpoint: 991,
          settings: {
              slidesToShow: 3,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 5000,
              speed: 800
          }
      },
      {
          breakpoint: 767,
          settings: {
              slidesToShow: 2,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 5000,
              speed: 800
          }
      },
      {
          breakpoint: 575,
          settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 5000,
              speed: 800
          }
      }]
  };


    constructor(
        private _dataSharingService: DataSharingService,
        private _router: Router,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService
    ) { super(); }

    ngOnInit() {
        this.getBranchDetails();
        this.getCompanyDetails()
        this.getBranchDatePattern();
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
        // #region Methods

  async getCompanyDetails() {
    const company = await super.getCompanyDetail(this._dataSharingService);
    if (company) {
      this.companyInfo = company;
      //this condition added by fahad after discussion with tahir bhai when user reload page redirect to login page dated on 04/02/2021
      if (!this.companyInfo?.CompanyName) {
        this._router.navigate(['/attendance/member/']);
      }
    }
  }

  async getBranchDetails() {

    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.branchInfo = branch;
    }

  }

  onMemberMembershipChange() {
    this.IsTodayAttendanceMarked = false;
    this.setMembershipTypeName();
    this.getMembershipDetails();
  }

  onClassAttendance(classItem: MemberClassDetail) {
    if (classItem.IsMembershipBenefit) {
      if ((!this.isMembershipCancelled || !classItem.IsFree && !classItem.IsItemBenefitsSuspended)) {
        //check class time
        if (!classItem.IsAttended) {
          var CheckedInTimeStart: Boolean = this.checkClassTimeStartForCheckIn(this.branchCurrentTime.clock, classItem.StartTime);
          if (CheckedInTimeStart) {
            this.markClassAttendance(classItem);
          } else {
            this._messageService.showErrorMessage(this.messages.Error.YourClassTimeIsNotStartedYet);
          }
        } else {
          this.markClassAttendance(classItem);
        }
      }
    } else {
      if (!classItem.IsAttended) {
        var CheckedInTimeStart: Boolean = this.checkClassTimeStartForCheckIn(this.branchCurrentTime.clock, classItem.StartTime);
        if (CheckedInTimeStart) {
          this.markClassAttendance(classItem);
        } else {
          this._messageService.showErrorMessage(this.messages.Error.YourClassTimeIsNotStartedYet);
        }
      } else {
        this.markClassAttendance(classItem);
      }
    }
  }

  onMarkMembershipAttendance() {
    if (!this.isMembershipCancelled && !this.IsDoorCheckInBenefitsSuspended) {
      this.markMembershipAttendance();
    }
  }

  //here we calculate the time interval for delay (in milliseconds)
  calculateTimeInterval(timeType: number, totalTime: number) {
    switch (timeType) {

      case ENU_DurationType.Minutes:
        this.timeInterval = totalTime * 60000;
        break;

      case ENU_DurationType.Hours:
        this.timeInterval = totalTime * 3.6e+6;
        break;

      case ENU_DurationType.Days:
        this.timeInterval = totalTime * 8.64e+7;
        break;

      case ENU_DurationType.Weeks:
        this.timeInterval = totalTime * 6.048e+8;
        break;
    }
  }

  onMouseOver() {
    //fahad
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (Number(this.branchInfo.MemberAttendanceTimer) != null && Number(this.branchInfo.MemberAttendanceTimer > 0)) {
      this.intervalId = setInterval(() => {
        this._router.navigate(['/attendance/member/']);
      }, this.branchInfo.MemberAttendanceTimer * 1000)
    }
  }

  setImagePath() {
    if (this.memberAttendaceModel.ImagePath && this.memberAttendaceModel.ImagePath.length > 0) {
      this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setCustomerImagePath()) + this.memberAttendaceModel.ImagePath;
    }
  }

  markClassAttendance(classItem: MemberClassDetail) {
    let classAttendanceModel = new AttendeeClassAttendance();
    classAttendanceModel.CustomerID = this.memberAttendaceModel.CustomerID;
    classAttendanceModel.IsAttended = !classItem.IsAttended;
    classAttendanceModel.ClassID = classItem.ClassID;
    classAttendanceModel.SaleDetailID = classItem.SaleDetailID;
    classAttendanceModel.ClassDate = this._dateTimeService.convertDateObjToString(new Date(), this.dateFormatForSearch);
    classAttendanceModel.IsFree = classItem.IsFree;
    classAttendanceModel.CustomerMembershipID = this.selectedMembership.CustomerMembershipID

    this._httpService.save(AttendeeApi.saveAttendeeAttendance, classAttendanceModel).subscribe
      ((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Attendance"));
          this.getMembershipDetails();
        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      })
  }

  markMembershipAttendance() {
    if (!this.IsTodayAttendanceMarked && !this.isAllowedDoorCheckIns) {
      this.membershipClockinModel.CustomerID = this.memberAttendaceModel.CustomerID;
      this.membershipClockinModel.CustomerMembershipID = this.selectedMembership.CustomerMembershipID;
      this._httpService.save(MemberAttendanceApi.markMemberAttendance, this.membershipClockinModel).
        subscribe((response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this.IsTodayAttendanceMarked = true;
            this.getMembershipDetails();
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Attendance"));
          } else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
    }
  }

  async getBranchDatePattern() {
    this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);

    var memberDetail: MemberAttendanceDetail = JSON.parse(localStorage.getItem('MemberDetail'));
    // this.clockedInMemberInfoSubscription = this._dataSharingService.memberAttendanceInfo.
    //    subscribe((model: MemberAttendanceDetail) => {
    if (memberDetail && memberDetail.CustomerMembershipList) {
      this.memberAttendaceModel = memberDetail;
      this.memberMembershipList = this.memberAttendaceModel.CustomerMembershipList;
      this.filteredMemberMembershipList = this.memberMembershipList.filter(item => item.MembershipStatusTypeID === this.enu_MembershipStatus.Active || item.MembershipStatusTypeID === this.enu_MembershipStatus.Frozen);
      this.isMembershipExists = this.filteredMemberMembershipList != null && this.filteredMemberMembershipList.length > 0 ? true : false;
      this.setImagePath();
      this.setDefaultMembership();
      this.setMembershipTypeName();
      this.getMembershipDetails();
      // localStorage.removeItem('MemberDetail');

    }
    else {
      this._router.navigate(['/attendance/member/']);
    }
    //  })
    //fahad
    this.intervalId = setInterval(() => {
      this._router.navigate(['/attendance/member/']);
    }, 20000)
  }

  getMembershipDetails() {
    let params = {
      customerID: this.memberAttendaceModel.CustomerID,
      membershipID: this.selectedMembership.MembershipID,
      customerMembershipId: this.selectedMembership.CustomerMembershipID

    }

    this._httpService.get(MemberAttendanceApi.getMemberMembershipDetails, params).
      subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this.IsDoorCheckInBenefitsSuspended = response.Result.IsBenefitsSuspended;
          this.memberMembershipMessages = response.Result.MembershipMessageList;
          this.membershipAlertMessages = response.Result.MembershipAlertMessageList;
          this.branchTimingListForMemberShip = response.Result.MembershipDetailList;
          this.membershipGlobalSessionList = response.Result.MembershipSessionDetailList;
          this.isShowDoorCheckInButton = this.membershipGlobalSessionList && this.membershipGlobalSessionList.find(i => i.MembershipBenefitsTypeID == this.enuMembershipBenefitType.DoorCheckedInBenefits) ? true : false;

          if (this.isShowDoorCheckInButton)
            this.checkAllowedDoorCheckins();
          this.memberClassDetailList = response.Result.MemberClassDetailList;
          this.messagesList = response.Result.MembershipMessageList;

          this.customerMembershipPaymentInfoList = response.Result.CustomerMembershipPaymentInfoList;
          this.memberClassDetailList = this.memberClassDetailList ? this.memberClassDetailList : [];
          this.hasClasses = (this.memberClassDetailList.length > 0);

          this.setClassImagePath();
          this.checkRestrictionType();
          this.isPageLoad = true;
        } else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      })
  }

  checkAllowedDoorCheckins() {
    var noLimit: boolean = this.membershipGlobalSessionList.find(i => i.MembershipBenefitsTypeID == this.enuMembershipBenefitType.DoorCheckedInBenefits).NoLimits;
    if (noLimit) {
      this.isAllowedDoorCheckIns = false;
    } else {
      var TotalSessions: number = this.membershipGlobalSessionList.find(i => i.MembershipBenefitsTypeID == this.enuMembershipBenefitType.DoorCheckedInBenefits).TotalSessions;
      var SessionConsumed: number = this.membershipGlobalSessionList.find(i => i.MembershipBenefitsTypeID == this.enuMembershipBenefitType.DoorCheckedInBenefits).SessionConsumed;
      if (SessionConsumed >= TotalSessions) {
        this.isAllowedDoorCheckIns = true;
      } else {
        this.isAllowedDoorCheckIns = false;
      }
    }
  }

  checkRestrictionType() {
    if (this.membershipAlertMessages) {
      this.membershipAlertMessages.forEach(restrictionType => {
        //restrictionType.RestrictionTypeId == this.enuMembershipAlertMessageRestrictionType.PaymentFailed // check comment dateded on 15-10-2020 by fahad after discussion with zahara (paymnet failed member can class and door checked in if benefits are not suspended)
        if (restrictionType.RestrictionTypeId == this.enuMembershipAlertMessageRestrictionType.InactiveMembership || restrictionType.RestrictionTypeId == this.enuMembershipAlertMessageRestrictionType.MembershipNotStartedYet) {
          this.isMembershipCancelled = true;
        }
        else {
          this.isMembershipCancelled = false;
        }
      });
    }
  }

    // formatMembershipTimes() {
    //     //formate branch timings
    //     // if (this.branchTimingListForMemberShip && this.branchTimingListForMemberShip.length > 0) {
    //     //     this.branchTimingListForMemberShip.forEach(membership => {
    //     //         if(!membership.IsNoAccess){
    //     //             if(membership.StartTime)
    //     //                 membership.StartTime = this._dateTimeService.formatTimeString(membership.StartTime);
    //     //             if(membership.EndTime)
    //     //                 membership.EndTime = this._dateTimeService.formatTimeString(membership.EndTime);
    //     //         }
    //     //     })
    //     // }

    //     // //formate class(es) timings
    //     // if(this.memberClassDetailList && this.memberClassDetailList.length > 0) {
    //     //     this.memberClassDetailList.forEach(_class => {
    //     //         _class.StartTime = this._dateTimeService.formatTimeString(_class.StartTime);
    //     //         _class.EndTime = this._dateTimeService.formatTimeString(_class.EndTime);
    //     //     })
    //     // }
    // }

  checkClassTimeStartForCheckIn(currentTime, classStartTime) {
    var isValidClassCheckInTime: boolean = true;
    var _classStartTime: any = this.ConvertTimeStringToDateTime(classStartTime);
    var _classStartTime: any = this.addMinutes(_classStartTime, 30);
    var _currentTime: any = this.ConvertTimeStringToDateTime(currentTime);

    isValidClassCheckInTime = _currentTime >= _classStartTime;
    return isValidClassCheckInTime;
  }

  addMinutes(date, minutes) {
    return new Date(date.getTime() - minutes * 60000);
  }

  ConvertTimeStringToDateTime(timeValue: string) {
    return this._dateTimeService.convertTimeStringToDateTime(timeValue);
  }

  setClassImagePath() {
    this.memberClassDetailList.forEach(classdetail => {
      if (classdetail.ImagePath && classdetail.ImagePath != '') {
        classdetail.ImagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + classdetail.ImagePath;
      }
      else {
        classdetail.ImagePath = this.classImage;
      }
    })
  }

  async setDefaultMembership() {
    /* On loading page first membership will be selected */
    if (this.isMembershipExists) {
      this.selectedMembership = this.filteredMemberMembershipList[0];

    }
    else {
      this.selectedMembership = this.memberMembershipList[0];
    }
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      let branchID = branch.BranchID;
      this.filteredMemberMembershipList.forEach(item => {
        if (item.BranchID == branchID) {
          item.MemberhsipConcatName = item.MembershipName;
        }
        else {
          item.MemberhsipConcatName = item.MembershipName + ' - ' + item.BranchName;
        }
      });
    }

  }

    setMembershipTypeName() {
        // switch (this.selectedMembership.MembershipTypeID) {
        //     case this.membershipType.TimeBased:
        //         this.membershipTypeName = this.membershipTypeNames.TimeBased;
        //         break;
        //     case this.membershipType.TimeAndSessionBased:
        //         this.membershipTypeName = this.membershipTypeNames.TimeAndSessionBased;
        //         break;
        //     case this.membershipType.ClassBased:
        //         this.membershipTypeName = this.membershipTypeNames.ClassBased;
        //         break;
        //     case this.membershipType.ClassAndSessionBased:
        //         this.membershipTypeName = this.membershipTypeNames.ClassAndSessionBased;
        //         break;
        // }
    }

    // setRemainingSession() {
    //     if (this.sessionList.length > 0) {
    //         this.sessionList.forEach(session => {
    //             session.RemainingSessions = session.TotalSession - session.AttendedSession;
    //             if (session.RemainingSessions <= 0) {
    //                 session.RemainingSessions = 0;
    //             }
    //         });
    //     }

    // }

    // #endregion
}
