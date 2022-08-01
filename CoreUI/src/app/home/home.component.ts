/********************** Angular References *********************************/
import { Component, OnInit, Input, ChangeDetectorRef } from "@angular/core";
import { Router,RouteConfigLoadStart,RouteConfigLoadEnd,NavigationEnd,ActivatedRoute } from "@angular/router";
import { debounceTime, shareReplay } from "rxjs/internal/operators";
import { FormControl } from "@angular/forms";
import { SubscriptionLike } from "rxjs";
import { HostListener } from '@angular/core';

/********************** Services & Models *********************************/
/* Services */
import { AuthService } from "src/app/helper/app.auth.service";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { DateTimeService } from "src/app/services/date.time.service";
import { SessionService } from "src/app/helper/app.session.service";
import { HttpService } from "src/app/services/app.http.service";
import { CommonService } from "src/app/services/common.service";
import { MessageService } from "src/app/services/app.message.service";
import { FCMMessagingService } from "src/app/services/fcm.messageing.service";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";

/* Models */
import { StaffInfo } from "src/app/staff/models/staff.model";
import { AllPerson,DD_Branch,Notification,ApiResponse,StaffAuthentication} from "src/app/models/common.model";
import { CompanyDetails} from "src/app/setup/models/company.details.model";

/********************** Configuration *********************************/
import { ENU_Permission_Module, ENU_Permission_Staff, ENU_Permission_Lead, ENU_Permission_ClientAndMember, ENU_Permission_Individual, ENU_Permission_Home } from "src/app/helper/config/app.module.page.enums";
import { ENU_ActivityType, CustomerType, ENU_Package, ENU_TaskMarkAsDone, ENU_EventCategoryType, ENU_DateFormatName, ENU_CountryCodeStripeTerminal } from "src/app/helper/config/app.enums";
import { Messages } from "src/app/helper/config/app.messages";
import { Configurations } from "src/app/helper/config/app.config";
import { environment } from "src/environments/environment";
import { ENU_NotificationTriggerCategory, ENU_NotificationTrigger } from "src/app/helper/config/app.enums";
import { HomeApi,StaffActivityApi,StaffNotificationApi,StaffApi, GatewayIntegrationApi } from "src/app/helper/config/app.webapi";
import { ImagesPlaceholder } from "src/app/helper/config/app.placeholder";
import { variables } from "src/app/helper/config/app.variable";
import { AppUtilities } from "src/app/helper/aap.utilities";

/********************** Components *********************************/
import { ChangePasswordPopup } from "./change-password/change.password.popup.component";
import { POSClassAttendanceComponent } from "src/app/point-of-sale/class-attendance/pos.class.attendance.component";
import { AttendeeComponent } from "src/app/attendee/save-search/attendee.component";
import { MyAttendanceTimeSheetComponent } from "./my-attendance-timesheet/my.attendance.timesheet.component";
import { StaffProfilePopupComponent } from "./staff-profile/staff.profile.popup.component";
import { StripeReaderPopupComponent } from "./stripe.reader.popup/stripe.reader.popup.component";
import { ServiceNotificationDetailComponent } from "src/app/general/notification/service-notification/service.notification.details.component";
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { MyTasksComponent } from "./my-tasks/my.tasks.component";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
})
export class HomeComponent extends AbstractGenericComponent implements OnInit {
  // #region Local Members

  @Input() customerTypeID: number;
  serviceWorker: any;
  defaultStaffImagePath: string = ImagesPlaceholder.user;

  staffName: string = "User";
  staffRole: string;
  staffEmail: string;
  staffImagePath: string;
  staffInfo: StaffInfo;
  branchId: number;
  isUpdateRequired: boolean = false;
  isStripeDisconnect: boolean = false;
  memberAttendanceTab: any;
  searchPerson: FormControl = new FormControl();
  personName: string = "";
  source: string = "";
  packageIdSubscription: SubscriptionLike;
  enterpriseUrlSubscription: SubscriptionLike;

  updateRequiredSubscription: SubscriptionLike;
  isStripeTerminalAllowedSubscription: SubscriptionLike;
  notficationSubscription: SubscriptionLike;
  showNotiAnimation: boolean;
  showEmailPushNoti: boolean;
  showSMSPushNoti: boolean;
  showTaskPushNoti: boolean;
  showCallPushNoti: boolean;
  showAppPushNoti: boolean;
  showNotePushNoti: boolean;
  showAppointmentPushNoti: boolean;
  loadingRouteConfig: boolean;
  showQuickLinks: boolean;
  showUserMenu: boolean;
  showNotifications: boolean;
  hasNotification: boolean = true;
  isShowFooter: boolean;
  isShowEnterPriseButton: boolean = false;
  isMyTaskAllowed: boolean;
  isMyAttendanceAllowed: boolean;
  isAttendanceTerminalAllowed: boolean;
  isMemberTerminalAllowed: boolean;
  isMainDashboardAllowed: boolean;
  isClassAttendanceAllowed: boolean;
  isStripeTerminalAllow: boolean;
  isStripeTerminalAllowed: boolean = false;
  isAddClientAllowed: boolean;
  isAddLeadAllowed: boolean;
  isBusinussFlowAllowed: boolean;
  isAddMemberAllowed: boolean;
  isMemberPaymentAllowed: boolean;
  isAddAttendeeAllowed: boolean;
  isStaffActivityAllowed: boolean;
  isStaffAttendanceAllowed: boolean;
  isClientActivityAllowed: boolean;
  isLeadActivityAllowed: boolean;
  isMemberActivityAllowed: boolean;
  isNotificationExists: boolean = true;
  isStaffNotification: boolean = false;
  isStaffActivitiesViewAllowed: boolean;
  isMemberActivitiesViewAllowed: boolean;
  isClientActivitiesViewAllowed: boolean;
  isLeadActivitiesViewAllowed: boolean;
  isMultiBranchCompany: boolean;
  clearCustomerInput = '';

  companyInfo: CompanyDetails = new CompanyDetails();

  datetimeFormat: string = ""; //Configurations.NotficationDateTimeFormat;
  timeFormat = Configurations.TimeFormatView;
  eNU_NotificationCategoryTrigger = ENU_NotificationTriggerCategory;
  eNU_NotificationTrigger = ENU_NotificationTrigger;
  taskDateFormat: string = ""; //Configurations.SchedulerRRuleUntilDateFormat;
  dateFormat: string = "";
  activityType = ENU_ActivityType;
  modulePermission = ENU_Permission_Module;
  package = ENU_Package;

  messages = Messages;

  /* Collection Types */
  branchList: DD_Branch[] = [];
  allPerson: AllPerson[];
  staffAuthentication: StaffAuthentication = new StaffAuthentication;
  newEmail: any;
  newSMS: any;
  newTask: any;
  newCall: any;
  newAppointment: any;
  newNote: any;
  customData: any;
  newAppNoti: any;
  // emailNotifications: any[] = [];
  // smsNotifications: any[] = [];
  notificationList: Notification[] = [];
  enumEventCategory = ENU_EventCategoryType;

  enu_TaskMarkAsDone = ENU_TaskMarkAsDone;
  enu_ActivityType = ENU_ActivityType;

  allowedModules = {
    Setup: false,
    Staff: false,
    // Client: false,
    Lead: false,
    Customer: false,
    PointOfSale: false,
    Scheduler: false,
    Reports: false,
    Individual: false,
    Automation: false,
    Home: false,
    Product:false
  };

  staffNotificationIDsVM: any = {
    IsMarkAsReadForMe: false,
    StaffNotificationIDs: "",
  };
  isNotificationButtonForEveryOne: boolean = false;
  /* Messages */
  hasError: boolean;
  errorMessage: string;
  serverImageAddress = environment.imageUrl;

  loggedInStaffIdSubscription: SubscriptionLike;
  loggedInStaffId: number;
  selectedState: any;
  // #endregion

  constructor(
    private _messagesService: MessageService,
    // private _dataSharingSrevice: DataSharingService,
    private _httpService: HttpService,
    private _commonService: CommonService,
    private _fcmMessagingService: FCMMessagingService,
    private _authService: AuthService,
    public _router: Router,
    private _dialog: MatDialogService,
    private _dataSharingService: DataSharingService,
    private _dateTimeService: DateTimeService,
    private ref: ChangeDetectorRef,
    private _route: ActivatedRoute,
  ) {
    super();

    this.getBranchDatePattern();
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
      (packageId: number) => {
        if (packageId && packageId > 0) {
          this.setMainDashboardPermission(packageId);
        }
      }
    );
    this.staffInfo = new StaffInfo();
    this.searchPerson.valueChanges
      .pipe(debounceTime(1000))
      .subscribe((value) => {
        if (value && value !== "" && value.length > 2) {
          if (typeof value === "string") {
            this.customerTypeID = this.customerTypeID ? this.customerTypeID : 0;
            let trimedValue = value.trim();
            this._commonService
              .searchClient(trimedValue, this.customerTypeID)
              .subscribe((response) => {
                if (response.Result != null && response.Result.length) {
                  this.allPerson = response.Result;
                } else {
                  this.allPerson = [];
                }
              });
          }
        } else {
          this.allPerson = [];
        }
      });

    // if (this._fcmMessagingService.isSupportMessaging()) {
    //   if (navigator && navigator.serviceWorker) {
    //     this.registerServiceWorker();
    //     navigator.serviceWorker.addEventListener("message", (event) => {
    //       if (event.data != undefined) {
    //         //console.log("Received a message from Service worker: ", event.data);
    //         this.processNotification(event);
    //         this.getNotifications();
    //       }
    //     });
    //   }
    // }
  }

  // #region Listener start
  // when branch change in one tab, branch auto reload and goto home page in change other tabs when user click it
  @HostListener('window:focus', ['$event'])
  onFocus(event: FocusEvent): void {
    ///if (this.branchList && this.branchList.length > 1) {

    var bID: number;
    var dropDownValue = (<HTMLInputElement><any>document?.getElementById("BranchDropDown"))?.value;
    if (dropDownValue) {
      var branchData = dropDownValue.toString().split(':');
      bID = Number(branchData[1].toString().trim());
    } else {
      bID = this.branchId;
    }

    if (bID && bID !== SessionService.getBranchID()) {
      this._router.navigate(["/"]);
      setTimeout(() => {
        location.reload();
      }, 100);

    }
    //}
  }
  // #region Listener end

  registerServiceWorker() {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("ServiceWorker registered with scope:", registration.scope);
        if (registration.installing) {
          this.serviceWorker = registration.installing;
        } else if (registration.waiting) {
          this.serviceWorker = registration.waiting;
        } else if (registration.active) {
          this.serviceWorker = registration.active;
        }
      })
      .catch((e) => console.error("ServiceWorker failed:", e));
  }

  ngOnInit() {

    this.isViewAllNotification();
    this._router.events.subscribe((event) => {
      if (event instanceof RouteConfigLoadStart) {
        this.loadingRouteConfig = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.loadingRouteConfig = false;
      }
      if (event instanceof NavigationEnd) {
        this.showFooter();
      }
    });
    this.loggedInStaffIdSubscription = this._dataSharingService.loggedInStaffID.subscribe(async (staffId: number) => {
      this.loggedInStaffId = await staffId;
    }
    );
    this._router.url;

    //FCM - Messaging
    if (this._fcmMessagingService.isSupportMessaging()) {
      this._fcmMessagingService.requestPermission();
      // if (this._fcmMessagingService.currentMessage.observers != null) {
      this._fcmMessagingService.receiveMessage();
      this.notficationSubscription = this._fcmMessagingService.currentMessage
        .pipe(shareReplay(1))
        .subscribe((response) => {
          if (response) {
            this.processNotification(response);
          }
        });
    }
    //}

    this._dataSharingService.companyImage.subscribe((img: string) => {
      if (img && img.length > 0) {
        if (img.indexOf(".jpg") > 0) {
          this.companyInfo.ImagePath =
            this.serverImageAddress.replace(
              "{ImagePath}",
              AppUtilities.setCustomerImagePath()
            ) + img;
        } else {
          this.companyInfo.ImagePath = "data:image/jpeg;base64," + img;
        }
      }
    });

    this._dataSharingService.companyInfo.subscribe((compInfo: CompanyDetails) => {
      if (compInfo) {
        this.companyInfo = Object.assign({}, compInfo);
      }
    });

    this.updateRequiredSubscription = this._dataSharingService.updateRolePermission.subscribe(
      (isUpdateRequired: boolean) => {
        this.isUpdateRequired = isUpdateRequired;
        if (isUpdateRequired) {
          // this.currentBranchSubscription = this._dataSharingService.currentBranch.subscribe(
          //   (branch: DD_Branch) => {
          //     if (branch) {
          //       this.isStripeTerminalAllowed = branch.AllowStripeTerminal && this.hasPagePermission(
          //         ENU_Permission_Module.Individual,
          //         ENU_Permission_Individual.AllowStripeTerminal
          //       );
          //     }
          //   }
          // );

          this.getCurrentBranchDetail();
          this.getPermissions();
        }
      }
    );
   this.isStripeTerminalAllowedSubscription = this._dataSharingService.isStripeTerminalAllowed.subscribe((isStripeTerminalAllowed) => {
        this.isStripeTerminalAllowed = isStripeTerminalAllowed;
    })
    this._dataSharingService.currentBranch.subscribe(
      (updatedBranch: DD_Branch) => {
        if (updatedBranch && updatedBranch.BranchID > 0) {
          this.updateBranch(updatedBranch);
        }
      }
    );

    this._dataSharingService.staffInfo.subscribe((staffInfo: StaffInfo) => {
      this.staffInfo = Object.assign({}, staffInfo);
      this.setStaffName(staffInfo);
    });

    this._dataSharingService.staffImage.subscribe((imagePath: string) => {
      //this condition comented by fahad (when staff remove profile picture place holder image show)
      //if (imagePath.length > 0) {
      this.setStaffImage(imagePath);
      //}
    });

    this.getFundamentals();
    this.showFooter();

    this.enterpriseUrlSubscription = this._dataSharingService.enterPriseUrl.subscribe(
      (URL: string) => {
        if (URL && URL != '') {
          this._router.navigate([URL]);
        }
      }
    );

  }

  /****Verify multi branch for enterprise button******/
  verifyMultiBranch(companyInfo: CompanyDetails) {
    let _url = StaffApi.verifyMultiBranchCompany + "?companyID=" + companyInfo.CompanyID;
    this._httpService.get(_url).subscribe((res: ApiResponse) => {
      if (res) {
        this.isMultiBranchCompany = res.Result;
        this._dataSharingService.shareIsMultiBranch(this.isMultiBranchCompany);
      } else {
        this._messagesService.showErrorMessage(res.MessageText);
      }
    });
  }

  mobToogle() {
    if (screen.width < 992) {
      document.getElementById('mob-toggle-btn').click();
    }
  }


  // #region Events
  openEnterprise() {
    environment.enterPriseUrl
    const token: string = AuthService.getAccessToken();
    if (token) {
      window.open(environment.enterPriseUrl + token);

    }

  }

  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      let isStripeTerminalAllowed = branch.AllowStripeTerminal && this.hasPagePermission(
        ENU_Permission_Module.Individual,
        ENU_Permission_Individual.AllowStripeTerminal
      );
      this._dataSharingService.shareisStripeTerminalAllowed(isStripeTerminalAllowed);
    }
  }

  onLogout() {
    this._dataSharingService.shareBranchLoaded(false);
    this._httpService
      .save(StaffApi.StaffLogout, null)
      .subscribe((response: ApiResponse) => {
        if (response.MessageCode === 1) {
          AuthService.logout();
          this._dataSharingService.shareisStripeTerminalAllowed(false);
          this._router.navigate(["/account/login"]);
        } else{
          AuthService.logout();
          this._dataSharingService.shareisStripeTerminalAllowed(false);
          this._router.navigate(["/account/login"]);
        }
      },
        err => {
          //this._messagesService.showErrorMessage(this.messages.Error.LogOut_Error);
          AuthService.logout();
          this._dataSharingService.shareisStripeTerminalAllowed(false);
          this._router.navigate(["/account/login"]);
        });
  }

  onBranchChange(previousState: any, branchId: any, branch: HTMLSelectElement) {

    //this condition commented by fahad after discussion with tahir bhai dated on 18-03-2021
    //if (this.memberAttendanceTab == undefined || this.memberAttendanceTab.closed) {

    this.selectedState = branchId;
    this.clearCustomerInput = '';
    // this.searchPerson = new FormControl();
    this.allPerson = [];
    this._httpService
      .get(HomeApi.switchBranch, { branchId: branchId })
      .subscribe((response) => {
        if (response.MessageCode === 1) {
          localStorage.setItem(variables.Access_Token, response.Result.access_token.toString());
          let branch = this.branchList.find((g) => g.BranchID == branchId);
          if (branch) {
            this.setSelectedBrachSetting(branch);
            this.getFundamentals();
            this.getPermissions();
            this._router.navigate(["/"]);
          } else {
            this.setDefaultBranch();
          }
        } else {
          this._messagesService.showErrorMessage(response.MessageText);
          this.setDefaultBranch();
        }
      });
    // }

    // else {
    //   if (this.memberAttendanceTab) {
    //     if (!this.memberAttendanceTab.closed) {
    //       let index: number = this.branchList.findIndex(fl => fl.BranchID === previousState);
    //       this.selectedState = previousState;
    //       branch.selectedIndex = index;
    //       const confirmDialog = this._dialog.open(AlertConfirmationComponent, {
    //         disableClose: true,
    //       });
    //       confirmDialog.componentInstance.Title = this.messages.Dialog_Title.Swtich_Branch;
    //       confirmDialog.componentInstance.Message = this.messages.Dialog_Title.Close_Member_Attendance_Terminal;
    //       confirmDialog.componentInstance.showButton = true;
    //     }
    //   }
    // }
  }

  // onViewEmail(emailModel: any) {
  //   this.openViewEmailDialog(emailModel);
  // }

  // onViewSMS(smsModel: any) {
  //   alert("new sms");
  // }

  // onViewTask(taskModel: any) {
  //   alert("new task");
  // }
  onNotificationClick(activity: any) {
    this.toggleNotifications(false);

    switch (activity.EventCategoryTypeID) {
      case ENU_NotificationTriggerCategory.Class:
        if (this.isClassAttendanceAllowed) {
          this.openClassAttendeeForm(activity.ItemID, activity.ClassDate);
        } else {
          this._messagesService.showErrorMessage(
            this.messages.Error.Permission_Page_UnAuthorized
          );
        }
        break;
      case ENU_NotificationTriggerCategory.Service:
        this._dialog.open(ServiceNotificationDetailComponent, {
          disableClose: true,
          data: {
            ServiceID: activity.StaffNotificationID,
          },
        });
        break;
      case ENU_NotificationTriggerCategory.Lead:
        // if (this.isBusinussFlowAllowed) {
        this._router.navigate([
          "/lead/details",
          activity.CustomerID,
          "lead-membership",
        ]);
        // } else {
        //   this._messagesService.showErrorMessage(this.messages.Error.Permission_Page_UnAuthorized);
        // }
        break;
      case ENU_NotificationTriggerCategory.Membership:
        if (this.isMemberPaymentAllowed) {
          if ((activity.eventTypeID == ENU_NotificationTrigger.MembershipExpiry)
            || (activity.eventTypeID == ENU_NotificationTrigger.MembershipIsSold)
          ) {
            this._router.navigate([
              "/customer/member/details",
              activity.CustomerID,

            ]);
          }
          else {
            this._router.navigate([
              "/customer/member/details",
              activity.CustomerID,
              "payments",
            ]);
          }
        } else {
          this._messagesService.showErrorMessage(
            this.messages.Error.Permission_Page_UnAuthorized
          );
        }
        break;
      case ENU_NotificationTriggerCategory.CustomerActivity:
        if (this.isLeadActivitiesViewAllowed && CustomerType.Lead == activity.ActivityCustomerTypeID) {
          if (activity.eventTypeID == ENU_NotificationTrigger.ClassCheckedInByCustomer || activity.eventTypeID == ENU_NotificationTrigger.ServiceCheckedInByCustomer
            || activity.eventTypeID == ENU_NotificationTrigger.ServiceBookingIsCancelled || activity.eventTypeID == ENU_NotificationTrigger.ClassBookingIsCancelled) {
            this._router.navigate([
              "/lead/details",
              activity.ActivityCustomerID,
              "bookings",
            ]);
          } else {
            this._router.navigate([
              "/lead/details",
              activity.ActivityCustomerID,
              "activities",
            ]);
          }
        } else if (this.isClientActivitiesViewAllowed && CustomerType.Client == activity.ActivityCustomerTypeID) {
          if (activity.eventTypeID == ENU_NotificationTrigger.ClassCheckedInByCustomer || activity.eventTypeID == ENU_NotificationTrigger.ServiceCheckedInByCustomer
            || activity.eventTypeID == ENU_NotificationTrigger.ServiceBookingIsCancelled || activity.eventTypeID == ENU_NotificationTrigger.ClassBookingIsCancelled) {
            this._router.navigate([
              "/customer/client/details",
              activity.ActivityCustomerID,
              "bookings",
            ]);
          } else {
            this._router.navigate([
              "/customer/client/details",
              activity.ActivityCustomerID,
              "activities",
            ]);
          }

        } else if (this.isMemberActivitiesViewAllowed && CustomerType.Member == activity.ActivityCustomerTypeID) {
          if (activity.eventTypeID == ENU_NotificationTrigger.ClassCheckedInByCustomer || activity.eventTypeID == ENU_NotificationTrigger.ServiceCheckedInByCustomer
            || activity.eventTypeID == ENU_NotificationTrigger.ServiceBookingIsCancelled || activity.eventTypeID == ENU_NotificationTrigger.ClassBookingIsCancelled) {
            this._router.navigate([
              "/customer/member/details",
              activity.ActivityCustomerID,
              "bookings",
            ]);
          } else {
            this._router.navigate([
              "/customer/member/details",
              activity.ActivityCustomerID,
              "activities",
            ]);
          }
        }
        else {
          this._messagesService.showErrorMessage(this.messages.Error.Permission_Page_UnAuthorized);
        }
        break;
      case ENU_NotificationTriggerCategory.StaffActivity:
        if (this.isStaffActivitiesViewAllowed) {
          this._router.navigate([
            "/staff/details",
            activity.ActivityStaffID,
            "activities",
          ]);
        } else {
          this._messagesService.showErrorMessage(
            this.messages.Error.Permission_Page_UnAuthorized
          );
        }
        break;
      default:
        break;
    }

    // switch (activity.ActivityTypeID) {
    //   case this.activityType.Call:
    //     this.redirectToActivity(activity);
    //     break;
    //   case this.activityType.Appointment:
    //     this.redirectToActivity(activity);
    //     break;
    //   case this.activityType.Email:
    //     this.redirectToActivity(activity);
    //     break;
    //   case this.activityType.SMS:
    //     this.redirectToActivity(activity);
    //     break;
    //   case this.activityType.Note:
    //     this.redirectToActivity(activity);
    //     break;

    //   case this.activityType.Task:
    //     if (this.isMyTaskAllowed) {
    //       this.showMyTasksPopup();
    //       this.updateNotificationMarkAsRead(activity);
    //     }
    //     break;
    // }
  }

  openClassAttendeeForm(classId, classDate) {
    const dialogRef = this._dialog.open(AttendeeComponent, {
      disableClose: true,
      data: {
        ClassID: classId,
        ClassDate: new Date(classDate),
      },
    });
    dialogRef.componentInstance.isAttendeeUpdated.subscribe((isUpdated) => {
      if (isUpdated) {
      }
    });
  }

  onCloseNoti() {
    this.showEmailPushNoti = false;
    this.showSMSPushNoti = false;
    this.showTaskPushNoti = false;
    this.showAppointmentPushNoti = false;
    this.showCallPushNoti = false;
    this.showNotePushNoti = false;
    this.showAppPushNoti = false;
  }

  isViewAllNotification() {
    this.isStaffNotification = this._authService.hasPagePermission(ENU_Permission_Module.General, ENU_Permission_Home.StaffNotification);

  }

  openAttendeDialog() {
    this._dialog.open(AttendeeComponent, {
      disableClose: true,
    });
  }

  openClassAttendanceDialog() {
    this._dialog.open(POSClassAttendanceComponent, {
      disableClose: true,
    });
  }

  openStripeReaderDialog() {
    this._httpService.get(GatewayIntegrationApi.GetTerminalConfig).subscribe(
      (response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          if (response.Result) {
            this._dataSharingService.shareStripeTerminalLoactionID(response.Result.TerminalLocation);
          }
        }

        this._dialog.open(StripeReaderPopupComponent, {
          disableClose: true,
        });

      },
      (error) => {
        this._messagesService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Stripe Configuration")
        );
      }
    );
  }

  toggleQuickLinks(show: boolean) {
    setTimeout(() => {
      this.showQuickLinks = show;
    });
  }

  toggleUserMenu(show: boolean) {
    setTimeout(() => {
      this.showUserMenu = show;
      // this.getFundamentals();
    });
  }

  toggleNotifications(show: boolean) {
    this.isNotificationButtonForEveryOne = this._authService.hasPagePermission(
      ENU_Permission_Module.Individual,
      ENU_Permission_Individual.NotificationForEveryOne
    );
    this.showNotiAnimation = false;
    if (show) {
      this.getNotifications();
    }
    this.isViewAllNotification();
    setTimeout(() => {
      this.showNotifications = show;
    });
  }

  onStaffProfile() {
    this.staffProfilePopup();
    this.toggleUserMenu(false);
  }

  onMyTasks() {
    this.showMyTasksPopup();
    this.toggleUserMenu(false);
  }

  onMyAttendanceTimesheet() {
    this.myMyAttendanceTimesheetPopup();
    this.toggleUserMenu(false);
  }

  onChangePassword() {
    this._dialog.open(ChangePasswordPopup, {
      disableClose: true,
    });
    this.toggleUserMenu(false);
  }

  onOpenMemberAttendance() {
    this.memberAttendanceTab = window.open("/attendance/member", "Member Attendance");
  }

  ngOnDestroy() {
    this.packageIdSubscription.unsubscribe();
    this.updateRequiredSubscription.unsubscribe();
    this.enterpriseUrlSubscription.unsubscribe();
    if (this.isStripeTerminalAllowedSubscription) {
      this.isStripeTerminalAllowedSubscription.unsubscribe();
    }

    //this._fcmMessagingService.currentMessage.unsubscribe();
  }

  // #endregion

  // #region Methods

  async getBranchDatePattern() {
    this.taskDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerRRuleUntilDateFormat);
    this.datetimeFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.NotficationDateTimeFormat);
    this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, "DateFormat");
  }

  hasModulePermission(moduleId: number) {
    return this._authService.hasModulePermission(moduleId);
  }

  hasPagePermission(moduleId: number, pageId: number) {
    return this._authService.hasPagePermission(moduleId, pageId);
  }

  staffProfilePopup() {
    this._dialog.open(StaffProfilePopupComponent, {
      disableClose: true,
    });
  }

  showMyTasksPopup() {
    this._dialog.open(MyTasksComponent, {
      disableClose: true,
    });
  }

  showFooter() {
    if (
      this._router.url.includes("scheduler") ||
      this._router.url.includes("shifts") ||
      this._router.url.includes("attendance") ||
      this._router.url.includes("point-of-sale") ||
      this._router.url.includes("timesheet") ||
      this._router.url.includes("setup/form/save")
    ) {
      this.isShowFooter = false;
    } else {
      this.isShowFooter = true;
    }
  }

  redirectToActivity(activity: Notification) {
    if (activity.StaffID && activity.StaffID > 0) {
      if (this.isStaffActivityAllowed) {
        this._router.navigate([
          "/staff/details/" + activity.StaffID + "/activities",
        ]);
        this.updateNotificationMarkAsRead(activity);
      } else {
        this._messagesService.showErrorMessage(
          this.messages.Error.Permission_Page_UnAuthorized
        );
      }
    } else if (activity.CustomerID && activity.CustomerID > 0) {
      switch (activity.CustomerTypeID) {
        case CustomerType.Client:
          if (this.isClientActivityAllowed) {
            this._router.navigate([
              "/customer/client/details/" + activity.CustomerID + "/activities",
            ]);
            this.updateNotificationMarkAsRead(activity);
          } else {
            this._messagesService.showErrorMessage(
              this.messages.Error.Permission_Page_UnAuthorized
            );
          }
          break;
        case CustomerType.Lead:
          if (this.isLeadActivityAllowed) {
            this._router.navigate([
              "/lead/details/" + activity.CustomerID + "/activities",
            ]);
            this.updateNotificationMarkAsRead(activity);
          } else {
            this._messagesService.showErrorMessage(
              this.messages.Error.Permission_Page_UnAuthorized
            );
          }
          break;
        case CustomerType.Member:
          if (this.isMemberActivityAllowed) {
            this._router.navigate([
              "/customer/member/details/" + activity.CustomerID + "/activities",
            ]);
            this.updateNotificationMarkAsRead(activity);
          } else {
            this._messagesService.showErrorMessage(
              this.messages.Error.Permission_Page_UnAuthorized
            );
          }
          break;
      }
    }
  }

  myMyAttendanceTimesheetPopup() {
    this._dialog.open(MyAttendanceTimeSheetComponent, {
      disableClose: true,
    });
  }

  getFundamentals() {
    this._httpService
      .get(HomeApi.getFundamentals)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          if (res && res.Result) {
            if (res.Result.CompanyInfo) {
              this.shareCompanyInfo(res.Result.CompanyInfo);
              this.verifyMultiBranch(this.companyInfo);
              this._dataSharingService.shareCompanyLoaded(true);
              this.branchList = res.Result.BranchList;
              if (this.branchList.length > 1) {
                this.isShowEnterPriseButton = true;
              }
              var storageID = localStorage.getItem(variables.BranchID);
              this.setDefaultBranch();
              this.shareUserInfo(res.Result.StaffInfo);
            }
          }
        } else {
          this._messagesService.showErrorMessage(res.MessageText);
        }
      });
  }

  updateBranch(updatedBranch: DD_Branch) {
    let branch = this.branchList.find(
      (b) => b.BranchID === updatedBranch.BranchID
    );
    if (branch) {
      branch.BranchName = updatedBranch.BranchName;
    }
  }

  updateNotificationMarkAsRead(activity: Notification) {
    let params = {
      staffActivityID: activity.ActivityID,
      staffID: activity.StaffID,
      customerID: activity.CustomerID,
    };
    this._httpService
      .save(StaffActivityApi.updateNotificationMarkAsRead, params)
      .subscribe((data) => {
        if (data && data.Result) {
        }
      });
  }

  getPermissions() {
    this._httpService
      .get(HomeApi.getBranchPermissions)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          if (res.Result) {
            this._dataSharingService.sharePackageId(res.Result.PackageID);
            this._authService.setPermissions(res.Result.ModuleList);
            this.setModulePermissions();
            this.setMenuPermissions();
          }
        } else {
          this._messagesService.showErrorMessage(res.MessageText);
        }
      });
  }

  getNotifications() {
    let url = StaffNotificationApi.viewAllStaffNotification.replace(
      "{staffID}",
      this.loggedInStaffId.toString()
    );
    this._httpService.get(url).subscribe(
      (data) => {
        this.isNotificationExists =
          data.Result && data.Result.length > 0 ? true : false;
        if (data && data.Result) {
          this.notificationList = data.Result;
          this.setNotficationDateTimeFormat();
        } else {
          this.notificationList = [];
        }
      },
      (error) => {
        this._messagesService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Notifications")
        );
      }
    );
  }

  setDefaultBranch() {
    if (this.branchList && this.branchList.length > 0) {
      let branch = this.getBranchFromList();
      this.branchId = branch.BranchID;
      this.selectedState = this.branchId;
      this.setSelectedBrachSetting(branch);
      this.getPermissions();
    }
  }

  setSelectedBrachSetting(branch) {
    localStorage.setItem(variables.BranchID, branch.BranchID.toString());
    SessionService.setBranchID(branch.BranchID);
    this._dataSharingService.sharePartPaymentAllowPermission(
      branch.AllowPartPayment
    );
    //this is the quick fix will change in future after getting API from backend (storing Data in local storage)
    localStorage.setItem('BranchInfo', JSON.stringify(branch));
    this.isStripeTerminalAllow = branch.AllowStripeTerminal && (branch.ISOCode == ENU_CountryCodeStripeTerminal.USA || branch.ISOCode == ENU_CountryCodeStripeTerminal.UK || branch.ISOCode == ENU_CountryCodeStripeTerminal.IRE) ? true : false;
    this._dataSharingService.shareCurrentBranch(branch);
    this._dataSharingService.shareBranchLoaded(true);
  }

  getBranchFromList(): DD_Branch {
    let branch = null;
    let branchId = SessionService.getBranchID();

     //check if not multi branch set by default IsCustomerDefaultBranch true
     if(this.branchList && this.branchList.length == 1){
      this.branchList[0].IsCustomerDefaultBranch = true;
    }

    if (branchId || branchId <= 0) {

      branch = this.branchList.find((g) => g.BranchID == branchId);
      if (!branch) {
        var result = this.branchList.find(i => i.IsCustomerDefaultBranch);
        if(result){
          branch = result;
        } else{
          branch = this.branchList.find(i => i.IsCustomerDefaultBranch);
        }
      }
      // branch = this.branchList[].BranchID = branchId;
    } else {

      branch = this.branchList.find((b) => b.BranchID === this.branchId);
      if (!branch) {
        branch = this.branchList.find(i => i.IsCustomerDefaultBranch);
      }
    }

    return branch;
  }

  setModulePermissions() {
    if (
      this._authService.rolePermission &&
      this._authService.rolePermission.length > 0
    ) {
      this.allowedModules.Setup = this.hasModulePermission(
        this.modulePermission.Setup
      );
      this.allowedModules.Staff = this.hasModulePermission(
        this.modulePermission.Staff
      );
      // this.allowedModules.Client = this.hasModulePermission(
      //   this.modulePermission.Customer
      // );
      this.allowedModules.Lead = this.hasModulePermission(
        this.modulePermission.Lead
      );
      this.allowedModules.Customer = this.hasModulePermission(
        this.modulePermission.Customer
      );
      this.allowedModules.PointOfSale = this.hasModulePermission(
        this.modulePermission.PointOfSale
      );
      this.allowedModules.Scheduler = this.hasModulePermission(
        this.modulePermission.Scheduler
      );
      this.allowedModules.Reports = this.hasModulePermission(
        this.modulePermission.Reports
      );
      this.allowedModules.Individual = this.hasModulePermission(
        this.modulePermission.Individual
      );
      this.allowedModules.Automation = this.hasModulePermission(
        this.modulePermission.Automation
      );
      this.allowedModules.Home = this.hasModulePermission(
        this.modulePermission.General
      );
      this.allowedModules.Product = this.hasModulePermission(
        this.modulePermission.Product
      );
      /*
          23/05/2019 3:18:PM
          As per discussion with Iftekhar, MainDashboard and Reports will always be visible to user
          until we add these in packages. Temporarily code is commented to validate permission and
          modules are set to 'TRUE'
      */
      //this.allowedModules.MainDashboard = this.hasModulePermission(this.modulePermission.MainDashboard);
      //this.allowedModules.Reports = this.hasModulePermission(this.modulePermission.Reports);

      // this.allowedModules.Reports = true;
    }
  }

  setMenuPermissions() {
    this.isAttendanceTerminalAllowed = this.hasPagePermission(
      ENU_Permission_Module.Individual,
      ENU_Permission_Individual.StaffAttendance
    );
    this.isMemberTerminalAllowed = this.hasPagePermission(
      ENU_Permission_Module.Individual,
      ENU_Permission_Individual.MemberAttendance
    );
    this.isClassAttendanceAllowed = this.hasPagePermission(
      ENU_Permission_Module.Individual,
      ENU_Permission_Individual.ClassAttendance
    );
    this.isStripeTerminalAllowed =
      this.hasPagePermission(
        ENU_Permission_Module.Individual,
        ENU_Permission_Individual.AllowStripeTerminal
      ) && this.isStripeTerminalAllow
        ? true
        : false;
    this.isMyTaskAllowed = this.hasPagePermission(
      ENU_Permission_Module.Staff,
      ENU_Permission_Staff.MyTask
    );
    this.isMyAttendanceAllowed = this.hasPagePermission(
      ENU_Permission_Module.Staff,
      ENU_Permission_Staff.MyAttendance
    );

    this.isAddClientAllowed = this.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.SaveClient
    );
    this.isAddLeadAllowed = this.hasPagePermission(
      ENU_Permission_Module.Lead,
      ENU_Permission_Lead.Save
    );
    this.isBusinussFlowAllowed = this.hasPagePermission(
      ENU_Permission_Module.Lead,
      ENU_Permission_Lead.BusinessFlow_View
    );
    this.isAddMemberAllowed = this.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.SaveMember
    );
    this.isMemberPaymentAllowed = this.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.Payments_View
    );
    this.isAddAttendeeAllowed = this.hasPagePermission(
      ENU_Permission_Module.Individual,
      ENU_Permission_Individual.AddAttendee
    );

    this.isStaffActivityAllowed = this.hasPagePermission(
      ENU_Permission_Module.Staff,
      ENU_Permission_Staff.Activity_View
    );
    this.isStaffAttendanceAllowed = this.hasPagePermission(
      ENU_Permission_Module.Staff,
      ENU_Permission_Staff.Attendance_View
    );
    this.isClientActivityAllowed = this.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.Activities_View
    );
    this.isLeadActivityAllowed = this.hasPagePermission(
      ENU_Permission_Module.Lead,
      ENU_Permission_Lead.Activities_View
    );
    this.isMemberActivityAllowed = this.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.Activities_View
    );

    this.isMainDashboardAllowed = this.hasPagePermission(
      ENU_Permission_Module.Individual,
      ENU_Permission_Individual.MainDashboard
    );

    this.isStaffActivitiesViewAllowed = this.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Activity_View);
    this.isMemberActivitiesViewAllowed = this.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Activities_View);
    this.isClientActivitiesViewAllowed = this.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Activities_View);
    this.isLeadActivitiesViewAllowed = this.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Activities_View);
  }

  setStaffImage(staffImage: string) {
    if (staffImage && staffImage.length > 0) {
      if (staffImage.indexOf(".jpg") > 0) {
        this.staffImagePath =
          this.serverImageAddress.replace(
            "{ImagePath}",
            AppUtilities.setStaffImagePath()
          ) + staffImage;
      } else {
        this.staffImagePath = "data:image/jpeg;base64," + staffImage;
      }
    } else {
      this.staffImagePath = this.defaultStaffImagePath;
    }
  }

  setCompanyLogo(logo: string) {
    if (logo && logo.length > 0) {
      this.companyInfo.ImagePath =
        this.serverImageAddress.replace(
          "{ImagePath}",
          AppUtilities.setCustomerImagePath()
        ) + logo;
    }
  }

  setStaffName(userInfo: any) {
    if (userInfo && userInfo.FirstName && userInfo.FirstName.length > 0) {
      this.staffName = userInfo.FirstName;
    }

    if (userInfo && userInfo.LastName && userInfo.LastName.length > 0) {
      this.staffName += " " + userInfo.LastName;
    }
  }

  shareCompanyInfo(companyInfo: CompanyDetails) {
    this.companyInfo = companyInfo;
    this._dataSharingService.shareCompanyInfo(companyInfo);
    if (companyInfo.ImagePath) {
      this.setCompanyLogo(companyInfo.ImagePath);
    }
  }

  shareUserInfo(userInfo: any) {
    this.setStaffName(userInfo);
    this.staffRole = userInfo.RoleName;
    if (userInfo.ImagePath) {
      this.setStaffImage(userInfo.ImagePath);
    } else {
      this.staffImagePath = this.defaultStaffImagePath;
    }

    if (userInfo.Email) {
      this.staffEmail = userInfo.Email;
      this.staffInfo.Email = userInfo.Email;
    }

    /** share staffID */
    SessionService.setLoggedInUserID(userInfo.StaffID);
    SessionService.setIsSuperAdmin(userInfo.IsSuperAdmin);
    //this._dataSharingSrevice.shareStaffID(userInfo.StaffID);
    this._dataSharingService.shareloggedInStaffID(userInfo.StaffID);
  }

  processNotification(response: any) {


    //firebase-messaging-msg-data
    if (response.data) {
      // let activityInfo = JSON.parse(response.data.custom_Data);
      //this.customData = JSON.parse(response.data.custom_Data);

      // let activityInfo = response.data;
      // this.customData = response.data;
      this.showNotiAnimation = true;
      this.newAppNoti = response.data;
      this.setDateTimeFormat();
      this.showAppNotification();
      this.getNotifications();
      // switch (parseInt(activityInfo.activityTypeID)) {
      //   case this.activityType.Call:
      //     this.newCall = response.data;

      //     this.showCallNotification();
      //     break;
      //   case this.activityType.Appointment:
      //     this.newAppointment = response.data;
      //     this.showAppointmentNotification();
      //     break;
      //   case this.activityType.Email:
      //     this.newEmail = response.data;
      //     this.showEmailNotification();
      //     break;
      //   case this.activityType.SMS:
      //     this.newSMS = response.data;
      //     this.showSMSNotification();
      //     break;
      //   case this.activityType.Task:
      //     this.newTask = response.data;
      //     this.customData = response.data;
      //     // this.customData.createdOn = this._dateTimeService.convertDateObjToString(
      //     //   this.customData.createdOn,
      //     //   this.taskDateFormat
      //     // );
      //     this.showTaskNotification();
      //     break;
      //   case this.activityType.Note:
      //     this.newNote = response.data;
      //     this.showNoteNotification();
      //     break;

      //   case this.activityType.AppNotification:
      //     this.newAppNoti = response.data;
      //     this.showAppNotification();
      //     if (this.notficationSubscription) {
      //       this.notficationSubscription.unsubscribe();
      //     }

      //     break;
      // }
    }
  }

  openViewEmailDialog(activityModel: any) {
    let activityInfo = activityModel.data;
    if (
      activityInfo &&
      activityInfo.personID &&
      activityInfo.personTypeID &&
      activityInfo.activityID
    ) {
      // this._dialog.open(
      //   ViewEmailComponent, {
      //     disableClose: true,
      //     data: activityModel.data
      //   });
    }
  }

  /*Read for me and for everyOne implementation notifications*/

  onMarkASReadForEveryone(staffNotificationId: any) {
    this.staffNotificationIDsVM = {
      IsMarkAsReadForMe: true,
      StaffNotificationIDs: staffNotificationId.toString(),
    };
    this.markAsReadForMeoRForEveryOne();
  }

  onMarkASReadForMe(staffNotificationId: any) {
    this.staffNotificationIDsVM = {
      IsMarkAsReadForMe: false,
      StaffNotificationIDs: staffNotificationId.toString(),
    };
    this.markAsReadForMeoRForEveryOne();
  }

  markAsReadForMeoRForEveryOne() {
    this._httpService
      .save(
        StaffNotificationApi.updateStaffNotification,
        this.staffNotificationIDsVM
      )
      .subscribe((res: ApiResponse) => {
        this.getNotifications();
      });
  }

  showEmailNotification() {
    this.showEmailPushNoti = true;
    setTimeout(() => {
      this.showEmailPushNoti = false;
    }, Configurations.SuccessMessageTimeout);
  }

  showSMSNotification() {
    this.showSMSPushNoti = true;
    setTimeout(() => {
      this.showSMSPushNoti = false;
    }, Configurations.SuccessMessageTimeout);
  }

  showTaskNotification() {
    this.showTaskPushNoti = true;
    setTimeout(() => {
      this.showTaskPushNoti = false;
    }, Configurations.SuccessMessageTimeout);
  }

  showCallNotification() {
    this.showCallPushNoti = true;
    setTimeout(() => {
      this.showCallPushNoti = false;
    }, Configurations.SuccessMessageTimeout);
  }
  showNoteNotification() {
    this.showNotePushNoti = true;
    setTimeout(() => {
      this.showNotePushNoti = false;
    }, Configurations.SuccessMessageTimeout);
  }

  showAppointmentNotification() {
    this.showAppointmentPushNoti = true;
    setTimeout(() => {
      this.showAppointmentPushNoti = false;
    }, Configurations.SuccessMessageTimeout);
  }

  showAppNotification() {
    this.showAppPushNoti = true;
    setTimeout(() => {
      this.showAppPushNoti = false;
    }, Configurations.SuccessMessageTimeout);
  }

  //@HostListener('window:beforeunload', ['$event'])
  //public handleBeforeUnload(event: any) {
  //    this._loginService.logout();
  //}

  navigatetoMember() {
    // this._router.onSameUrlNavigation = 'reload';
    this._router.navigate(["/customer/member/details", 0]);
  }
  navigatetoLead() {
    // this._router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this._router.onSameUrlNavigation = 'reload';
    this._router.navigate(["/lead/details", 0]);
  }
  navigatetoClient() {
    // this._router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this._router.onSameUrlNavigation = 'reload';
    this._router.navigate(["/customer/client/details", 0]);
  }


  getSelectedClient(person: AllPerson) {
    // if (person.PersonTypeID === PersonType.Staff) {
    //   this._router.navigate(['/staff/details', person.PersonID]);
    // }
    if (person.CustomerTypeID === CustomerType.Member) {
      if (this.isAddMemberAllowed) {
        this._router.navigate(["customer/member/details", person.CustomerID]);
      } else {
        this._messagesService.showErrorMessage(
          this.messages.Error.Permission_Page_UnAuthorized
        );
      }
    }
    if (person.CustomerTypeID === CustomerType.Lead) {
      if (this.isAddLeadAllowed) {
        this._router.navigate(["/lead/details", person.CustomerID]);
      } else {
        this._messagesService.showErrorMessage(
          this.messages.Error.Permission_Page_UnAuthorized
        );
      }
    }
    if (person.CustomerTypeID === CustomerType.Client) {
      if (this.isAddClientAllowed) {
        this._router.navigate(["customer/client/details", person.CustomerID]);
      } else {
        this._messagesService.showErrorMessage(
          this.messages.Error.Permission_Page_UnAuthorized
        );
      }
    }
  }

  setMainDashboardPermission(packageId: number) {
    switch (packageId) {
      case this.package.FitnessMedium:
        this.allowedModules.Individual = true;
        break;

      case this.package.WellnessMedium:
        this.allowedModules.Individual = true;
        break;

      case this.package.WellnessTop:
        this.allowedModules.Individual = true;
        break;

      case this.package.Full:
        this.allowedModules.Individual = true;
        break;

      case this.package.WellnessBasic:
        this.hasNotification = false;
        this.allowedModules.Individual = false;
        break;

      default:
        this.allowedModules.Individual = false;
        break;
    }
  }

  setDateTimeFormat() {
    this.newAppNoti.createdOn = this._dateTimeService.convertDateObjToString(
      this.newAppNoti.createdOn,
      this.datetimeFormat
    );
  }

  setNotficationDateTimeFormat() {
    this.notificationList.forEach((item) => {
      if (item.CreatedOn) {
        if (
          (item.ActivityTypeID == this.activityType.Task ||
            item.ActivityTypeID == this.activityType.Call ||
            item.ActivityTypeID == this.activityType.Appointment) &&
          item.FollowUpDate != null
        ) {
          item.CreatedOn = this._dateTimeService.convertDateObjToString(
            new Date(item.CreatedOn),
            this.taskDateFormat
          );
          item.FollowUpDate = this._dateTimeService.convertDateObjToString(
            new Date(item.FollowUpDate),
            this.taskDateFormat
          );
          item.FollowUpStartTime = this._dateTimeService.formatTimeString(
            item.FollowUpStartTime,
            this.timeFormat
          );
          item.FollowUpEndTime = this._dateTimeService.formatTimeString(
            item.FollowUpEndTime,
            this.timeFormat
          );
          if (item.ActivityTypeID == this.activityType.Call) {
            item.Description = this.messages.Generic_Messages.Scheduled_Call;
          }
          if (item.ActivityTypeID == this.activityType.Appointment) {
            item.Description = this.messages.Generic_Messages.Scheduled_Appointment;
          }
        } else {
          item.CreatedOn = this._dateTimeService.convertDateObjToString(
            new Date(item.CreatedOn),
            this.datetimeFormat
          );
        }
      }
    });
  }

  displayClientName(user?: AllPerson): string | undefined {
    return user ? user.FirstName + " " + user.LastName : undefined;
  }

  // #endregion
}
