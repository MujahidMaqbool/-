/********************* Angular:Refference ********************/
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SubscriptionLike as ISubscription } from "rxjs";

/********************* Material:Refference ********************/
import { MatOption } from '@angular/material/core';
import { Location } from '@angular/common';
/********************** START: Service, Models & Enums *********************/

/* Services */
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';

/* Models */
import { ApiResponse } from '@app/models/common.model';
import { ConfigurationWaitList } from '@app/helper/config/app.webapi';
import { CommunicationType } from '@app/setup/models/automation.tempalte.model';
import { TimeDurationType, WaitListConfiguration, WaitListTimeBrackets } from '@app/setup/models/configuration.wait.list.model';

/* Enums */
import { EnumDayOptions, EnumDayType, ENU_Package, ENU_WaitList } from '@app/helper/config/app.enums';

/********************** START: Common, helper And Configuration *********************/

/* Services */
import { DateTimeService } from '@app/services/date.time.service';
import { DataSharingService } from '@app/services/data.sharing.service';

/* helper */
import { Messages } from '@app/helper/config/app.messages';
import { NumberValidator } from '@app/shared/helper/number.validator';


/* Configuration */
import { Configurations } from '@app/helper/config/app.config';

/********************** START: Component *********************/
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { AuthService } from '@app/helper/app.auth.service';


@Component({
  selector: 'app-waiting-list',
  templateUrl: './waiting-list.component.html',
})
export class WaitingListComponent extends AbstractGenericComponent implements OnInit {

  /* DECORATOR */
  @ViewChild('allSelectedDaysForService') private allSelectedDaysForService: MatOption;
  @ViewChild('allSelectedClassNotification') private allSelectedClassNotification: MatOption;
  @ViewChild('allSelectedServiceNotification') private allSelectedServiceNotification: MatOption;

  /* Model */
  selectedServiceDaysTypeList: any[] = [];
  selectedClassCommunicationTypeList: CommunicationType[] = [];
  selectedServiceCommunicationTypeList: CommunicationType[] = [];
  timeDurationTypeList: TimeDurationType[] = new Array<TimeDurationType>();
  waitListConfiguration: WaitListConfiguration = new WaitListConfiguration();
  communicationTypeList: CommunicationType[] = new Array<CommunicationType>();
  waitListConfigurationCopy: WaitListConfiguration = new WaitListConfiguration();
  //waitListTimeBrackets: WaitListTimeBrackets[] = new Array<WaitListTimeBrackets>();

  /* Messages */
  messages = Messages;

  /* Local */
  currentDateTime: Date;
  defaultTimeDurationTypeID: number;

  /* Enums */
  enumWaitList = ENU_WaitList;
  package = ENU_Package;

  /* validator */
  validationMessage: string = "";
  showValidation: boolean = false;
  showPercentageValidationForClass: boolean = false;
  showPercentageValidationForService: boolean = false;

  ShowError: boolean = false;

  numberValidator: NumberValidator = new NumberValidator();

  /* configuration */
  timeFormat = Configurations.TimeFormat;
  schedulerTimeFormat = Configurations.SchedulerTimeFormat;
  allowedNumberKeysWithOutDecimal = Configurations.AllowedNumberKeysForClassBooking;
  AllowedNumberKeys = Configurations.AllowedNumberKeysForClassBooking;
  isTimeDuration: boolean;

  /* Subsctiptions */
  packageIdSubscription: ISubscription;

    /* Local  Permissions*/

    hasClassWaitList:boolean = false;
    hasClassManageManually:boolean = false;
    hasClassTopPrice:boolean = false;
    hasClassManageSequentially:boolean = false;
    hasClassAlertAll:boolean = false;

    hasServiceWaitList:boolean = false;
    hasServiceManageManually:boolean = false;
    hasServiceTopPrice:boolean = false;
    hasServiceManageSequentially:boolean = false;
    hasServiceAlertAll:boolean = false;


  constructor(private _httpService: HttpService,
    private _messageService: MessageService,
    private _dateTimeService: DateTimeService,
    private _dataSharingService: DataSharingService, private rewriteUrl: Location) {
    super();
  }

  ngOnInit(): void {
    this.checkPackagePermissions();
    //rewrite the url state
    this.rewriteUrl.replaceState("/setup/configurations/wait-list");
    this.getBranchSetting();
  }

  ngOnDestroy() {
    this.packageIdSubscription?.unsubscribe();
  }

  //#region Service events

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
            break;
        case this.package.WellnessMedium:
            break;
        case this.package.WellnessTop:
          this.hasServiceWaitList = true;
          this.hasServiceManageManually = true;
          this.hasServiceAlertAll = true;
            break;
        case this.package.FitnessBasic:
            break;
        case this.package.FitnessMedium:
            this.hasClassWaitList = true;
            this.hasClassManageManually = true;
            this.hasClassAlertAll = true;
            break;
        case this.package.Full:
            this.hasClassWaitList = true;
            this.hasClassManageManually = true;
            this.hasClassTopPrice = true;
            this.hasClassManageSequentially = true;
            this.hasClassAlertAll = true;

            this.hasServiceWaitList = true;
            this.hasServiceManageManually = true;
            this.hasServiceTopPrice = true;
            this.hasServiceManageSequentially = true;
            this.hasServiceAlertAll = true;
            break;
    }
  }

  onChangeServiceWaitList() {
    if (!this.waitListConfiguration.serviceWaitList.IsServiceWaitList)
      this.onChangeValueRadio(this.enumWaitList.WaitListService, this.enumWaitList.Service);
    else
      this.showValidation = false;
  }

  //for trim string
  onBlurBracketTextFunction(arrayIndex) {
    this.waitListConfiguration.branchWorkTimeBrackets[arrayIndex].BracketName = this.waitListConfiguration.branchWorkTimeBrackets[arrayIndex].BracketName ? this.waitListConfiguration.branchWorkTimeBrackets[arrayIndex].BracketName.trim() : this.waitListConfiguration.branchWorkTimeBrackets[arrayIndex].BracketName;
  }

  //validate bracket time
  onBracketTimeChanged(arrayIndex) {
    if (this.waitListConfiguration.branchWorkTimeBrackets[arrayIndex].StartTime >= this.waitListConfiguration.branchWorkTimeBrackets[arrayIndex].EndTime) {
      this.waitListConfiguration.branchWorkTimeBrackets[arrayIndex].IsEndTimeInvalid = true;
    } else {
      this.waitListConfiguration.branchWorkTimeBrackets[arrayIndex].IsEndTimeInvalid = false;
    }
  }

  //delete bracket
  onDeleteBracket(arrayIndex) {
    if (this.waitListConfiguration.serviceWaitList.IsServiceWaitListOnline) {
      this.waitListConfiguration.branchWorkTimeBrackets.splice(arrayIndex, 1);
    }
  }

  // add new bracket
  async onAddNewBracket() {
    if (this.waitListConfiguration.serviceWaitList.IsServiceWaitListOnline) {

      this.waitListConfiguration.branchWorkTimeBrackets = this.waitListConfiguration.branchWorkTimeBrackets == null ? [] : this.waitListConfiguration.branchWorkTimeBrackets;
      // staff cannot added more than 5 brackets
      if (this.waitListConfiguration.branchWorkTimeBrackets && this.waitListConfiguration.branchWorkTimeBrackets.length < 5) {
        var newBracket = new WaitListTimeBrackets();
        newBracket.BranchWorkTimeBracketID = 0;
        newBracket.BracketName = "";
        newBracket.StartTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        newBracket.EndTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        //var endDate = newBracket.EndTime;
        newBracket.EndTime = new Date(newBracket.EndTime.setMinutes(newBracket.EndTime.getMinutes() + 60));//this.currentDateTime;
        // set end time diffrence 60 minuts

        this.waitListConfiguration.branchWorkTimeBrackets.push(newBracket);
      } else {
        this._messageService.showErrorMessage(this.messages.Error.Maximum5BracketsAreAllowed);

      }
    }
  }

  // go to braket
  gotoBracket() {
    setTimeout(() => {
      document.getElementById('timeBracket').scrollIntoView();
    }, 100);
  }

  //for all days selection
  toggleAllDaysSelection(type) {

    this.selectedServiceDaysTypeList = [];

    if (this.allSelectedDaysForService.selected) {
      this.daysTypeList.forEach(dayType => {
        this.selectedServiceDaysTypeList.push(dayType);
      });

      setTimeout(() => {
        this.allSelectedDaysForService.select();
      }, 100);

    }
  }

  //for single day selection
  tosslePerOneDay() {

    if (this.allSelectedDaysForService && this.allSelectedDaysForService.selected) {
      this.allSelectedDaysForService.deselect();
      return false;
    }
    if (this.daysTypeList.length == this.selectedServiceDaysTypeList.length && this.daysTypeList.length > 1)
      this.allSelectedDaysForService.select();

  }

  // not allow dot in munber
  onServiceMaximumCustomersChangeOnlyNumbers(num) {
    setTimeout(() => {
      this.waitListConfiguration.serviceWaitList.ServiceWaitListMaxCustomer = this.numberValidator.NotAllowDecimalValue(num);
    }, 10);
  }

  //#endregion Service events

  //#region Class events

  onChangeClassWaitList() {
    if (!this.waitListConfiguration.classWaitList.IsClassWaitList)
      this.onChangeValueRadio(this.enumWaitList.WaitListClass, this.enumWaitList.Class);
    else
      this.showValidation = false;
  }

  //#endregion Class events


  //#region Class & Service events
  onChangeValueRadio(val, type) {

    this.showPercentageValidationForClass = false;
    this.showPercentageValidationForService = false;
    this.ShowError = false;

    if (type == this.enumWaitList.Class) {

      this.waitListConfiguration.classWaitList.IsClassWaitListManually = val == this.enumWaitList.ManageManually || this.enumWaitList.WaitListClass ? true : false;

      this.waitListConfiguration.classWaitList.IsClassWaitListTopPrice = val == this.enumWaitList.TopPrice ? true : false;
      this.waitListConfiguration.classWaitList.IsClassWaitListTopPriceBookAuto = val == this.enumWaitList.TopPrice ? true : false;
      this.waitListConfiguration.classWaitList.IsClassWaitListTopPriceAlertOnly = false;

      this.waitListConfiguration.classWaitList.IsClassWaitListSequentially = val == this.enumWaitList.ManageSequentially ? true : false;
      this.waitListConfiguration.classWaitList.IsClassWaitListSequentiallyBookAuto = val == this.enumWaitList.ManageSequentially ? true : false;
      this.waitListConfiguration.classWaitList.IsClassWaitListSequentiallyAlertOnly = false;

      this.waitListConfiguration.classWaitList.IsClassWaitListAlertAll = val == this.enumWaitList.AlertAll ? true : false;

      this.waitListConfiguration.classWaitList.ClassWaitListTopPriceCloseBookBeforeMember = 0;
      this.waitListConfiguration.classWaitList.ClassWaitListTopPriceCloseBookBeforeClientLead = 0;
      this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookAutoBeforeMember = 0;
      this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookAutoBeforeClientLead = 0;

      this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeInterval = 1;
      this.waitListConfiguration.classWaitList.ClassWaitListTopPriceAlertOnlyTimetoRespond = 1;
      this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeInterval = 1;
      this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespond = 1;

      this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeIntervalDurationTypeId = this.defaultTimeDurationTypeID;
      this.waitListConfiguration.classWaitList.ClassWaitListTopPriceAlertOnlyTimetoRespondDurationTypeId = this.defaultTimeDurationTypeID;
      this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeIntervalDurationTypeId = this.defaultTimeDurationTypeID;
      this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId = this.defaultTimeDurationTypeID;

      if (val == this.enumWaitList.WaitListClass) {
        this.waitListConfiguration.classWaitList.IsClassWaitListOnline = false;
        this.waitListConfiguration.classWaitList.IsClassWaitListRequirePaymentMethodOnline = false;
        this.waitListConfiguration.classWaitList.ClassWaitListPaymentDisplayText = "";
        this.selectedClassCommunicationTypeList = [];
      }
    } else {

      this.waitListConfiguration.serviceWaitList.IsServiceWaitListManually = val == this.enumWaitList.ManageManually || this.enumWaitList.WaitListService ? true : false;

      this.waitListConfiguration.serviceWaitList.IsServiceWaitListTopPrice = val == this.enumWaitList.TopPrice ? true : false;
      this.waitListConfiguration.serviceWaitList.IsServiceWaitListTopPriceBookAuto = val == this.enumWaitList.TopPrice ? true : false;
      this.waitListConfiguration.serviceWaitList.IsServiceWaitListTopPriceAlertOnly = false;

      this.waitListConfiguration.serviceWaitList.IsServiceWaitListSequentially = val == this.enumWaitList.ManageSequentially ? true : false;
      this.waitListConfiguration.serviceWaitList.IsServiceWaitListSequentiallyBookAuto = val == this.enumWaitList.ManageSequentially ? true : false;
      this.waitListConfiguration.serviceWaitList.IsServiceWaitListSequentiallyAlertOnly = false;

      this.waitListConfiguration.serviceWaitList.IsServiceWaitListAlertAll = val == this.enumWaitList.AlertAll ? true : false;

      this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceCloseBookBeforeMember = 0;
      this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceCloseBookBeforeClientLead = 0;
      this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookAutoBeforeMember = 0;
      this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookAutoBeforeClientLead = 0;

      this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeInterval = 1;
      this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceAlertOnlyTimetoRespond = 1;
      this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeInterval = 1;
      this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespond = 1;

      this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeIntervalDurationTypeId = this.defaultTimeDurationTypeID;
      this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceAlertOnlyTimetoRespondDurationTypeId = this.defaultTimeDurationTypeID;
      this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeIntervalDurationTypeId = this.defaultTimeDurationTypeID;
      this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId = this.defaultTimeDurationTypeID;

      if (val == this.enumWaitList.WaitListService) {
        this.waitListConfiguration.serviceWaitList.IsServiceWaitListOnline = false;
        this.waitListConfiguration.serviceWaitList.IsServiceWaitListRequirePaymentMethodOnline = false;
        this.waitListConfiguration.serviceWaitList.ServiceWaitListPaymentDisplayText = "";
        var copyWaitListConfiguration = JSON.parse(JSON.stringify(this.waitListConfigurationCopy));
        this.waitListConfiguration.branchWorkTimeBrackets = copyWaitListConfiguration.branchWorkTimeBrackets;
        this.selectedServiceCommunicationTypeList = [];
        this.waitListConfiguration.serviceWaitList.ServiceWaitListMaxCustomer = null;
        this.selectedServiceDaysTypeList = [];
      }
    }
  }

  onChangeTopPriceBookAutomaticallyRadio(type) {
    if (type == this.enumWaitList.Class) {
      if (this.waitListConfiguration.classWaitList.IsClassWaitListTopPrice) {
        this.waitListConfiguration.classWaitList.IsClassWaitListTopPriceBookAuto = true;
        this.waitListConfiguration.classWaitList.IsClassWaitListTopPriceAlertOnly = false;

        this.waitListConfiguration.classWaitList.ClassWaitListTopPriceAlertOnlyTimetoRespondDurationTypeId = this.defaultTimeDurationTypeID;
      }
    } else {
      if (this.waitListConfiguration.serviceWaitList.IsServiceWaitListTopPrice) {
        this.waitListConfiguration.serviceWaitList.IsServiceWaitListTopPriceBookAuto = true;
        this.waitListConfiguration.serviceWaitList.IsServiceWaitListTopPriceAlertOnly = false;

        this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId = this.defaultTimeDurationTypeID;
      }
    }
  }

  onChangeTopPriceAlertOnlyRadio(type) {
    if (type == this.enumWaitList.Class) {
      if (this.waitListConfiguration.classWaitList.IsClassWaitListTopPrice) {

        this.showPercentageValidationForClass = false;

        this.waitListConfiguration.classWaitList.IsClassWaitListTopPriceAlertOnly = true;
        this.waitListConfiguration.classWaitList.IsClassWaitListTopPriceBookAuto = false;

        this.waitListConfiguration.classWaitList.ClassWaitListTopPriceCloseBookBeforeMember = 0;
        this.waitListConfiguration.classWaitList.ClassWaitListTopPriceCloseBookBeforeClientLead = 0;

        this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeInterval = 1;
        this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeIntervalDurationTypeId = this.defaultTimeDurationTypeID;
      }
    } else {
      if (this.waitListConfiguration.serviceWaitList.IsServiceWaitListTopPrice) {

        this.showPercentageValidationForService = false;

        this.waitListConfiguration.serviceWaitList.IsServiceWaitListTopPriceAlertOnly = true;
        this.waitListConfiguration.serviceWaitList.IsServiceWaitListTopPriceBookAuto = false;

        this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceCloseBookBeforeMember = 0;
        this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceCloseBookBeforeClientLead = 0;

        this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeInterval = 1;
        this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeIntervalDurationTypeId = this.defaultTimeDurationTypeID;
      }
    }

  }

  onChangeManageSequentiallyBookAutomaticallyRadio(type) {
    if (type == this.enumWaitList.Class) {
      if (this.waitListConfiguration.classWaitList.IsClassWaitListSequentially) {
        this.waitListConfiguration.classWaitList.IsClassWaitListSequentiallyBookAuto = true;
        this.waitListConfiguration.classWaitList.IsClassWaitListSequentiallyAlertOnly = false;

        this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespond = 1;
        this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId = this.defaultTimeDurationTypeID;
      }
    } else {
      if (this.waitListConfiguration.serviceWaitList.IsServiceWaitListSequentially) {
        this.waitListConfiguration.serviceWaitList.IsServiceWaitListSequentiallyBookAuto = true;
        this.waitListConfiguration.serviceWaitList.IsServiceWaitListSequentiallyAlertOnly = false;

        this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespond = 1;
        this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId = this.defaultTimeDurationTypeID;
      }
    }

  }

  onChangeManageSequentiallyAlertOnlyRadio(type) {
    if (type == this.enumWaitList.Class) {
      if (this.waitListConfiguration.classWaitList.IsClassWaitListSequentially) {

        this.showPercentageValidationForClass = false;

        this.waitListConfiguration.classWaitList.IsClassWaitListSequentiallyAlertOnly = true;
        this.waitListConfiguration.classWaitList.IsClassWaitListSequentiallyBookAuto = false;

        this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookAutoBeforeMember = 0;
        this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookAutoBeforeClientLead = 0;

        this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeInterval = 1;
        this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeIntervalDurationTypeId = this.defaultTimeDurationTypeID;
      }
    } else {
      if (this.waitListConfiguration.serviceWaitList.IsServiceWaitListSequentially) {

        this.showPercentageValidationForService = false;

        this.waitListConfiguration.serviceWaitList.IsServiceWaitListSequentiallyAlertOnly = true;
        this.waitListConfiguration.serviceWaitList.IsServiceWaitListSequentiallyBookAuto = false;

        this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookAutoBeforeMember = 0;
        this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookAutoBeforeClientLead = 0;

        this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeInterval = 1;
        this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeIntervalDurationTypeId = this.defaultTimeDurationTypeID;
      }
    }

  }

  onBlurPaymentDisplayTextFunction(type) {
    if (type == this.enumWaitList.Class) {
      this.waitListConfiguration.classWaitList.ClassWaitListPaymentDisplayText = this.waitListConfiguration.classWaitList.ClassWaitListPaymentDisplayText ? this.waitListConfiguration.classWaitList.ClassWaitListPaymentDisplayText.trim() : this.waitListConfiguration.classWaitList.ClassWaitListPaymentDisplayText;
    } else {
      this.waitListConfiguration.serviceWaitList.ServiceWaitListPaymentDisplayText = this.waitListConfiguration.serviceWaitList.ServiceWaitListPaymentDisplayText ? this.waitListConfiguration.serviceWaitList.ServiceWaitListPaymentDisplayText.trim() : this.waitListConfiguration.serviceWaitList.ServiceWaitListPaymentDisplayText;
    }
  }

  onPercentageChangeOnlyNumbers(num, type) {
    if (type == this.enumWaitList.Class) {
      this.showPercentageValidationForClass = num && num <= 100 ? false : true;
      if (this.showPercentageValidationForClass) {
        this.ShowError = false;
      } else {
        this.ShowError = this.isTimeDuration && !this.showPercentageValidationForService ? true : false;
      }
    } else {
      this.showPercentageValidationForService = num && num <= 100 ? false : true;
      if (this.showPercentageValidationForService) {
        this.ShowError = false;
      } else {
        this.ShowError = this.isTimeDuration && !this.showPercentageValidationForClass ? true : false;
      }
    }
  }

  onchangeDurationTime(num) {
    this.ShowError = num && num != "" && Number(num) != 0 ? false : true;
    this.isTimeDuration = this.ShowError ? true : false;
    if (this.showPercentageValidationForClass || this.showPercentageValidationForService) {
      this.ShowError = false;
    }
  }

  onEnableWaitListOnlineChange(type) {
    if (type == this.enumWaitList.Class) {
      if (!this.waitListConfiguration.classWaitList.IsClassWaitListOnline) {
        this.waitListConfiguration.classWaitList.IsClassWaitListRequirePaymentMethodOnline = false;
        this.waitListConfiguration.classWaitList.ClassWaitListPaymentDisplayText = "";
      }
    } else {
      if (!this.waitListConfiguration.serviceWaitList.IsServiceWaitListOnline) {
        this.waitListConfiguration.serviceWaitList.IsServiceWaitListRequirePaymentMethodOnline = false;
        this.waitListConfiguration.serviceWaitList.ServiceWaitListPaymentDisplayText = "";
        var copyWaitListConfiguration = JSON.parse(JSON.stringify(this.waitListConfigurationCopy));
        this.waitListConfiguration.branchWorkTimeBrackets = copyWaitListConfiguration.branchWorkTimeBrackets;
      }
    }
  }

  onEnablelassWaitListRequirePaymentMethodOnline(type) {
    if (type == this.enumWaitList.Class) {
      if (!this.waitListConfiguration.classWaitList.IsClassWaitListRequirePaymentMethodOnline) {
        this.waitListConfiguration.classWaitList.ClassWaitListPaymentDisplayText = "";
      }
    } else {
      if (!this.waitListConfiguration.serviceWaitList.IsServiceWaitListRequirePaymentMethodOnline) {
        this.waitListConfiguration.serviceWaitList.ServiceWaitListPaymentDisplayText = "";
      }
    }
  }

  //for all notification selection
  toggleAllNotificationSelection(type) {

    if (type == this.enumWaitList.Class) {
      this.selectedClassCommunicationTypeList = [];

      if (this.allSelectedClassNotification.selected) {
        this.communicationTypeList.forEach(communicationType => {
          this.selectedClassCommunicationTypeList.push(communicationType);
        });

        setTimeout(() => {
          this.allSelectedClassNotification.select();
        }, 100);

      }
    } else {
      this.selectedServiceCommunicationTypeList = [];

      if (this.allSelectedServiceNotification.selected) {
        this.communicationTypeList.forEach(communicationType => {
          this.selectedServiceCommunicationTypeList.push(communicationType);
        });

        setTimeout(() => {
          this.allSelectedServiceNotification.select();
        }, 100);

      }
    }
  }

  //for single notification selection
  tosslePerOneNotification(type) {
    if (type == this.enumWaitList.Class) {
      if (this.allSelectedClassNotification && this.allSelectedClassNotification.selected) {
        this.allSelectedClassNotification.deselect();
        return false;
      }
      if (this.communicationTypeList.length == this.selectedClassCommunicationTypeList.length && this.communicationTypeList.length > 1)
        this.allSelectedClassNotification.select();
    } else {
      if (this.allSelectedServiceNotification && this.allSelectedServiceNotification.selected) {
        this.allSelectedServiceNotification.deselect();
        return false;
      }
      if (this.communicationTypeList.length == this.selectedServiceCommunicationTypeList.length && this.communicationTypeList.length > 1)
        this.allSelectedServiceNotification.select();
    }
  }

  //#endregion Class & Service events

  //#region Method

  async getBranchSetting() {

    //get branch date time added by fahad for browser different time zone issue resolving
    this.currentDateTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
    this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);

    this.getFundamentals();
  }

  getFundamentals() {

    return this._httpService.get(ConfigurationWaitList.getFundamentals)
      .toPromise()
      .then((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this.timeDurationTypeList = response.Result.DurationTypeList;
          this.communicationTypeList = response.Result.CommunicationType;
          this.defaultTimeDurationTypeID = this.timeDurationTypeList[0].DurationTypeID;
          this.waitListConfiguration.classWaitList = response.Result.ClassWaitList;
          this.waitListConfiguration.serviceWaitList = response.Result.ServiceWaitList;
          this.waitListConfiguration.branchWorkTimeBrackets = response.Result.BranchWorkTimeBrackets;

          this.setDefaultWaitListModel();
          this.setWaitListModelForDataShow(false);
          //this.removeZoneFromBracketTime();
          //after comple method calls then save membership clone
          this.waitListConfigurationCopy = JSON.parse(JSON.stringify(this.waitListConfiguration));

          this.onChangeClassWaitList();
          this.onChangeServiceWaitList();
        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Waitlist Configuration")); }
      );
  }

  setDefaultWaitListModel() {

    // set class waiting list default values
    this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeInterval = this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeInterval != 0 ? this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeInterval : 1;
    this.waitListConfiguration.classWaitList.ClassWaitListTopPriceAlertOnlyTimetoRespond = this.waitListConfiguration.classWaitList.ClassWaitListTopPriceAlertOnlyTimetoRespond != 0 ? this.waitListConfiguration.classWaitList.ClassWaitListTopPriceAlertOnlyTimetoRespond : 1;
    this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeInterval = this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeInterval != 0 ? this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeInterval : 1;
    this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespond = this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespond != 0 ? this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespond : 1;

    this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeIntervalDurationTypeId = this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeIntervalDurationTypeId > 0 ? this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeIntervalDurationTypeId : this.defaultTimeDurationTypeID;
    this.waitListConfiguration.classWaitList.ClassWaitListTopPriceAlertOnlyTimetoRespondDurationTypeId = this.waitListConfiguration.classWaitList.ClassWaitListTopPriceAlertOnlyTimetoRespondDurationTypeId > 0 ? this.waitListConfiguration.classWaitList.ClassWaitListTopPriceAlertOnlyTimetoRespondDurationTypeId : this.defaultTimeDurationTypeID;
    this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeIntervalDurationTypeId = this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeIntervalDurationTypeId > 0 ? this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeIntervalDurationTypeId : this.defaultTimeDurationTypeID;
    this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId = this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId > 0 ? this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId : this.defaultTimeDurationTypeID;


    // set service waiting list default values
    this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeInterval = this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeInterval != 0 ? this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeInterval : 1;
    this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceAlertOnlyTimetoRespond = this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceAlertOnlyTimetoRespond != 0 ? this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceAlertOnlyTimetoRespond : 1;
    this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeInterval = this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeInterval != 0 ? this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeInterval : 1;
    this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespond = this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespond != 0 ? this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespond : 1;

    this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeIntervalDurationTypeId = this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeIntervalDurationTypeId > 0 ? this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeIntervalDurationTypeId : this.defaultTimeDurationTypeID;
    this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceAlertOnlyTimetoRespondDurationTypeId = this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceAlertOnlyTimetoRespondDurationTypeId > 0 ? this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceAlertOnlyTimetoRespondDurationTypeId : this.defaultTimeDurationTypeID;
    this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeIntervalDurationTypeId = this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeIntervalDurationTypeId > 0 ? this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeIntervalDurationTypeId : this.defaultTimeDurationTypeID;
    this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId = this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId > 0 ? this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespondDurationTypeId : this.defaultTimeDurationTypeID;

  }

  setWaitListModelForDataShow(isReset: boolean) {
    // set class selection notification data
    this.selectedClassCommunicationTypeList = [];
    if (this.waitListConfiguration.classWaitList.IsClassWaitList && this.waitListConfiguration.classWaitList.ClassWaitListNotificationType) {
      var classNotificationTypeIDs = this.waitListConfiguration.classWaitList.ClassWaitListNotificationType.split(',');

      this.communicationTypeList.forEach(communicationType => {
        if (classNotificationTypeIDs.find(cnti => Number(cnti) == communicationType.CommunicationTypeID))
          this.selectedClassCommunicationTypeList.push(communicationType);
      });

      // in case all selection check All 
      if (this.communicationTypeList && this.selectedClassCommunicationTypeList && this.communicationTypeList.length == this.selectedClassCommunicationTypeList.length) {
        setTimeout(() => {
          this.allSelectedClassNotification.select();
        }, 100);
      }
    }

    // set service days selection data
    this.selectedServiceDaysTypeList = [];
    if (this.waitListConfiguration.serviceWaitList.IsServiceWaitList && this.waitListConfiguration.serviceWaitList.ServiceWaitListDaysList) {
      var serviceDaysTypeIDs = this.waitListConfiguration.serviceWaitList.ServiceWaitListDaysList.split(',');

      this.daysTypeList.forEach(dayType => {
        if (serviceDaysTypeIDs.find(sdti => Number(sdti) == dayType.DayTypeID))
          this.selectedServiceDaysTypeList.push(dayType);
      });

      // in case all selection check All 
      if (this.daysTypeList && this.selectedServiceDaysTypeList && this.daysTypeList.length == this.selectedServiceDaysTypeList.length) {
        setTimeout(() => {
          this.allSelectedDaysForService.select();
        }, 100);
      }
    }

    //set service bracket time
    if (!isReset && this.waitListConfiguration.branchWorkTimeBrackets && this.waitListConfiguration.branchWorkTimeBrackets.length > 0) {
      this.waitListConfiguration.branchWorkTimeBrackets.forEach(bracket => {
        bracket.IsEndTimeInvalid = false;
        if (bracket.StartTime) {
          bracket.StartTime = this._dateTimeService.convertTimeStringToDateTime(bracket.StartTime, this.currentDateTime);
        }
        if (bracket.EndTime) {
          bracket.EndTime = this._dateTimeService.convertTimeStringToDateTime(bracket.EndTime, this.currentDateTime);
        }
      });
    }

    // set service selection notification data
    this.selectedServiceCommunicationTypeList = [];
    if (this.waitListConfiguration.serviceWaitList.IsServiceWaitList && this.waitListConfiguration.serviceWaitList.ServiceWaitListNotificationType) {
      var serviceNotificationTypeIDs = this.waitListConfiguration.serviceWaitList.ServiceWaitListNotificationType.split(',');

      this.communicationTypeList.forEach(communicationType => {
        if (serviceNotificationTypeIDs.find(snti => Number(snti) == communicationType.CommunicationTypeID))
          this.selectedServiceCommunicationTypeList.push(communicationType);
      });

      // in case all selection check All 
      if (this.communicationTypeList && this.selectedServiceCommunicationTypeList && this.communicationTypeList.length == this.selectedServiceCommunicationTypeList.length) {
        setTimeout(() => {
          this.allSelectedServiceNotification.select();
        }, 100);
      }
    }
  }

  setBracketTimeAccordingToBranchZone() {
    this.waitListConfiguration.branchWorkTimeBrackets.forEach(bracket => {
      if (bracket.StartTime) {
        bracket.StartTime = this._dateTimeService.ConvertDateTimeAccordingBranchZone(bracket.StartTime);
      }
      if (bracket.EndTime) {
        bracket.EndTime = this._dateTimeService.ConvertDateTimeAccordingBranchZone(bracket.EndTime);
      }
    });
  }

  // reset all configurations
  onReset() {
    this.showValidation = false;
    this.showPercentageValidationForClass = false;
    this.showPercentageValidationForService = false;
    this.ShowError = false;
    //this.selectedClassCommunicationTypeList = [];

    this.waitListConfiguration.classWaitList.IsClassWaitListManually = false;
    this.waitListConfiguration.serviceWaitList.IsServiceWaitListManually = false;
    this.onChangeClassWaitList();
    this.onChangeServiceWaitList();

    setTimeout(() => {
      this.waitListConfiguration = JSON.parse(JSON.stringify(this.waitListConfigurationCopy));

      this.setBracketTimeAccordingToBranchZone();

      this.onChangeClassWaitList();
      this.onChangeServiceWaitList();
      this.setWaitListModelForDataShow(true);
    }, 100);


  }

  onSave() {

    if (this.isValid()) {
      this.prepareModelForSave();
      this._httpService.save(ConfigurationWaitList.save, this.waitListConfiguration)
        .subscribe(
          (res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
              this.getFundamentals();
              this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Waitlist Configurations"));
            }
            else {
              this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Waitlist Configurations"));
            }
          },
          error => {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Waitlist Configurations"));
          }
        );
    }

  }

  // check configuration validation
  isValid() {

    // validate atleast select one configuration
    // if(!this.waitListConfiguration.classWaitList.IsClassWaitList && !this.waitListConfiguration.serviceWaitList.IsServiceWaitList){
    //   this.showValidation = true;
    //   this.validationMessage = this.messages.Error.PleaseSelectAtleastOneConfiguration;
    //   return false;
    // }

    // check percentage validator true
    if (this.showPercentageValidationForClass || this.showPercentageValidationForService) {
      return false;
    }

    // validate percentage values for class
    if (this.waitListConfiguration.classWaitList.IsClassWaitList) {

      if (this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeInterval) {
        // validate percentage values for client/lead Top Price Book Automatically
        if (this.waitListConfiguration.classWaitList.ClassWaitListTopPriceCloseBookBeforeClientLead.toString() == "" || this.waitListConfiguration.classWaitList.ClassWaitListTopPriceCloseBookBeforeClientLead > 100) {
          this.showPercentageValidationForClass = true;
          return false;
        }

        // validate percentage values for member Top Price Book Automatically
        if (this.waitListConfiguration.classWaitList.ClassWaitListTopPriceCloseBookBeforeMember.toString() == "" || this.waitListConfiguration.classWaitList.ClassWaitListTopPriceCloseBookBeforeMember > 100) {
          this.showPercentageValidationForClass = true;
          return false;
        }
      }

      // validate percentage values for Manage Sequentially Book Automatically
      if (this.waitListConfiguration.classWaitList.IsClassWaitListSequentiallyBookAuto) {
        // validate percentage values for Client/Lead Manage Sequentially Book Automatically
        if (this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookAutoBeforeClientLead.toString() == "" || this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookAutoBeforeClientLead > 100) {
          this.showPercentageValidationForClass = true;
          return false;
        }

        // validate percentage values for Member Manage Sequentially Book Automatically
        if (this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookAutoBeforeMember.toString() == "" || this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookAutoBeforeMember > 100) {
          this.showPercentageValidationForClass = true;
          return false;
        }
      }
      // set validation for time text box
      if (this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeInterval.toString() == "" || this.waitListConfiguration.classWaitList.ClassWaitListTopPriceBookTimeInterval == 0) {
        this.ShowError = true;
        return false;
      } else if (this.waitListConfiguration.classWaitList.ClassWaitListTopPriceAlertOnlyTimetoRespond.toString() == "" ||  this.waitListConfiguration.classWaitList.ClassWaitListTopPriceAlertOnlyTimetoRespond == 0) {
        this.ShowError = true;
        return false;
      }

      if (this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeInterval.toString() == "" || this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyBookTimeInterval == 0) {
        this.ShowError = true;
        return false;
      } else if (this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespond.toString() == "" || this.waitListConfiguration.classWaitList.ClassWaitListSequentiallyAlertOnlyTimetoRespond == 0) {
        this.ShowError = true;
        return false;
      }

    }

    // validate percentage values for service
    if (this.waitListConfiguration.serviceWaitList.IsServiceWaitList) {

      if (this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeInterval) {
        // validate percentage values for client/lead Top Price Book Automatically
        if (this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceCloseBookBeforeClientLead.toString() == "" || this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceCloseBookBeforeClientLead > 100) {
          this.showPercentageValidationForService = true;
          return false;
        }

        // validate percentage values for member Top Price Book Automatically
        if (this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceCloseBookBeforeMember.toString() == "" || this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceCloseBookBeforeMember > 100) {
          this.showPercentageValidationForService = true;
          return false;
        }
      }

      // validate percentage values for Manage Sequentially Book Automatically
      if (this.waitListConfiguration.serviceWaitList.IsServiceWaitListSequentiallyBookAuto) {
        // validate percentage values for Client/Lead Manage Sequentially Book Automatically
        if (this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookAutoBeforeClientLead.toString() == "" || this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookAutoBeforeClientLead > 100) {
          this.showPercentageValidationForService = true;
          return false;
        }

        // validate percentage values for Member Manage Sequentially Book Automatically
        if (this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookAutoBeforeMember.toString() == "" || this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookAutoBeforeMember > 100) {
          this.showPercentageValidationForService = true;
          return false;
        }
      }
      // set validation for time text box
      if (this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeInterval.toString() == "" || this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceBookTimeInterval == 0) {
        this.ShowError = true;
        return false;
      } else if (this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceAlertOnlyTimetoRespond.toString() == "" || this.waitListConfiguration.serviceWaitList.ServiceWaitListTopPriceAlertOnlyTimetoRespond == 0) {
        this.ShowError = true;
        return false;
      }

      if (this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeInterval.toString() == "" || this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyBookingTimeInterval == 0) {
        this.ShowError = true;
        return false;
      } else if (this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespond.toString() == "" || this.waitListConfiguration.serviceWaitList.ServiceWaitListSequentiallyAlertOnlyTimetoRespond == 0) {
        this.ShowError = true;
        return false;
      }
    }

    if (this.waitListConfiguration.serviceWaitList.IsServiceWaitListOnline) {

      if (this.waitListConfiguration.branchWorkTimeBrackets && this.waitListConfiguration.branchWorkTimeBrackets.length > 0) {
        for (let i = 0; i < this.waitListConfiguration.branchWorkTimeBrackets.length; i++) {
          this.onBracketTimeChanged(i);
        }

        if (this.waitListConfiguration.branchWorkTimeBrackets.find(bwtb => bwtb.IsEndTimeInvalid == true)) {
          this.gotoBracket();
          return false;
        }

        if (this.waitListConfiguration.branchWorkTimeBrackets.find(bwtb => bwtb.BracketName == "")) {
          this.gotoBracket();
          return false;
        }
      }
    }

    return true;
  }

  //set model to send data api
  prepareModelForSave() {

    // convert class selected notifications ids Comma seperated string e.g 1,2,3
    this.waitListConfiguration.classWaitList.ClassWaitListNotificationType = "";
    if (this.waitListConfiguration.classWaitList.IsClassWaitList && this.selectedClassCommunicationTypeList && this.selectedClassCommunicationTypeList.length > 0) {
      this.waitListConfiguration.classWaitList.ClassWaitListNotificationType = this.listToCommaSeparatedString(this.selectedClassCommunicationTypeList, false);
    }

    // convert service selected days ids Comma seperated string e.g 1,2,3
    this.waitListConfiguration.serviceWaitList.ServiceWaitListDaysList = "";
    if (this.waitListConfiguration.serviceWaitList.IsServiceWaitList && this.selectedServiceDaysTypeList && this.selectedServiceDaysTypeList.length > 0) {
      this.waitListConfiguration.serviceWaitList.ServiceWaitListDaysList = this.listToCommaSeparatedString(this.selectedServiceDaysTypeList, true);
    }

    // convert datetime into time
    if (this.waitListConfiguration.branchWorkTimeBrackets && this.waitListConfiguration.branchWorkTimeBrackets.length > 0) {
      this.waitListConfiguration.branchWorkTimeBrackets.forEach(bracket => {
        if (bracket.StartTime) {
          bracket.StartTime = this._dateTimeService.getTimeStringFromDate(bracket.StartTime, this.timeFormat);
        }
        if (bracket.EndTime) {
          bracket.EndTime = this._dateTimeService.getTimeStringFromDate(bracket.EndTime, this.timeFormat);
        }
      });
    }

    // convert service selected notifications ids Comma seperated string e.g 1,2,3
    this.waitListConfiguration.serviceWaitList.ServiceWaitListNotificationType = "";
    if (this.waitListConfiguration.serviceWaitList.IsServiceWaitList && this.selectedServiceCommunicationTypeList && this.selectedServiceCommunicationTypeList.length > 0) {
      this.waitListConfiguration.serviceWaitList.ServiceWaitListNotificationType = this.listToCommaSeparatedString(this.selectedServiceCommunicationTypeList, false);
    }

    this.waitListConfiguration.serviceWaitList.ServiceWaitListMaxCustomer = this.waitListConfiguration.serviceWaitList.ServiceWaitListMaxCustomer ? this.waitListConfiguration.serviceWaitList.ServiceWaitListMaxCustomer : null; 

  }

  // List data convert into Comma seperated string e.g 1,2,3
  listToCommaSeparatedString(arr: any, isDays: boolean = false) {
    var i;
    var result: string = "";
    for (i = 0; i < arr.length; ++i) {
      if (isDays) {
        if (arr[i].DayTypeID)
          result = result + arr[i]?.DayTypeID + ((arr.length - 1) == i ? "" : ",");
      } else {
        if (arr[i].CommunicationTypeID)
          result = result + arr[i]?.CommunicationTypeID + ((arr.length - 1) == i ? "" : ",");
      }
    }
    return result;
  }

  //#endregion

  /* Select Days for Waitlist dropdown options*/
  daysTypeList = [
    { DayTypeID: EnumDayType.Monday, DayTypeName: EnumDayOptions.Monday },
    { DayTypeID: EnumDayType.Tuesday, DayTypeName: EnumDayOptions.Tuesday },
    { DayTypeID: EnumDayType.Wednesday, DayTypeName: EnumDayOptions.Wednesday },
    { DayTypeID: EnumDayType.Thursday, DayTypeName: EnumDayOptions.Thursday },
    { DayTypeID: EnumDayType.Friday, DayTypeName: EnumDayOptions.Friday },
    { DayTypeID: EnumDayType.Saturday, DayTypeName: EnumDayOptions.Saturday },
    { DayTypeID: EnumDayType.Sunday, DayTypeName: EnumDayOptions.Sunday }
  ];

  preventCharactersForClassBooking(event: any) {
    //console.log(this.parentClassObj.ClassDurationInMinutes.toString())
    let index = this.AllowedNumberKeys.findIndex(k => k == event.key);
    if (index < 0) {
      event.preventDefault()
    }
  }

  AllowNumberNumberWithDecimal(event: any) {
    //console.log(this.parentClassObj.ClassDurationInMinutes.toString())
    let index = this.allowedNumberKeysWithOutDecimal.findIndex(k => k == event.key);
    if (index < 0) {
      event.preventDefault()
    }
    //this.showErrorMessage = false;
  }
}
