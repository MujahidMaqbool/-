import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/helper/app.auth.service';
import { Configurations, DiscountType, SaleArea, SchedulerOptions } from 'src/app/helper/config/app.config';
import { CustomerType, EnumBookingStatusType, EnumSaleStatusType, ENU_DateFormatName, ENU_Package, PeriodIntervals, POSItemType } from 'src/app/helper/config/app.enums';
import { Messages } from 'src/app/helper/config/app.messages';
import { SchedulerServicesApi, SaleApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse } from 'src/app/models/common.model';
import { POSCartItem, POSSaleDetail, RemainingSessionDetail, SaleInvoice } from 'src/app/point-of-sale/models/point.of.sale.model';
import { CustomerMembership, SchedulerServiceModel, SchedulerServicesPackage, ServiceBenefitsPackage, ServiceBookingList, ServiceClient } from 'src/app/scheduler/models/service.model';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { CommonService } from 'src/app/services/common.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { POSPaymentComponent } from 'src/app/shared/components/sale/payment/pos.payment.component';
import { OneDaySchedulerComponent } from 'src/app/shared/components/scheduler/one.day.scheduler.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { SubscriptionLike } from 'rxjs';


@Component({
  selector: 'app-waitlist-service-detail',
  templateUrl: './waitlist.service.detail.component.html',
})
export class WaitlistServiceDetailComponent extends AbstractGenericComponent implements OnInit, AfterViewInit {

  @ViewChild('onedaySchedulerComp') onedaySchedulerComp: OneDaySchedulerComponent;

  @ViewChild('serviceFormData') serviceFormData: NgForm;

  @Output() onUpdateService = new EventEmitter<boolean>();
  /** Local Variables */
  currentDate: Date = new Date();
  dayViewFormat: string = "";
  currencyFormat: string;
  isLoadOneDaySchecduler: boolean = false;
  selectedStaffID: number;
  isChangeStartDateEvent: boolean = true;
  isShowError: boolean;
  serviceGlobalRemainingSession?: number;
  membershipEndDate: any;
  selectedDurationValue: number = 0;
  selectedService: any = [];
  selectedServiceName: string;
  customerMembershipId: number;

  isDateTimeEventChange: boolean = true;
  isChangeServicePackage: boolean = false;
  disableServiceSelection: boolean = true;
  getServiceFundamentalList: any;
  hasMemberhsip: boolean;

  isPurchaseRestrictionAllowed :boolean = false;
  /** Lists */
  ServicePackageList: SchedulerServicesPackage[] = [];
  durationTypeList: any[] = [];
  periodIntervals = PeriodIntervals;
  StaffList: any[] = [];
  FacilityList: any[] = [];
  serviceList: any[] = [];
  clientList: ServiceClient[];
  posCartItems: POSCartItem[] = [];
  customerMemberhsip: CustomerMembership[];
  customerMembershipList: Array<CustomerMembership> = [];
  selectedClient: ServiceClient = new ServiceClient();
  serviceBenefitsPackage: ServiceBenefitsPackage[];
  serviceBenefitsDetail: ServiceBenefitsPackage[];
  remainingSessionDetail: RemainingSessionDetail[] = [];
  private schedulerStaticStrings = new SchedulerOptions();

  /*Models */
  messages = Messages;
  saveServicesModel: SchedulerServiceModel = new SchedulerServiceModel();
  copySaveServiceModel: SchedulerServiceModel = new SchedulerServiceModel();
  dateFormat = Configurations.DateFormat;
  datetimeFormat = Configurations.DateTimeFormat
  schedulerTimeFormat = Configurations.SchedulerTimeFormat;
  timeFormat = Configurations.TimeFormatView;
  timeFormatDifference = Configurations.TimeFormat;
  SchedulerStartDayHour = SchedulerOptions.SchedulerStartDayHour;
  cleanupTimeText: string = SchedulerOptions.ServiceCleanupTimeText;
  endTimeText: string = SchedulerOptions.ServiceEndTimeText;
  enumBookingStatusType = EnumBookingStatusType;
  /* Subsctiptions */
  packageIdSubscription: SubscriptionLike;
  package = ENU_Package;
  isRewardProgramInPackage: boolean = false;
  enumCustomerType = CustomerType;

  constructor(
    private _dialogRef: MatDialogRef<WaitlistServiceDetailComponent>,
    private _dataSharingService: DataSharingService,
    private _httpService: HttpService,
    private _dateTimeService: DateTimeService,
    private _messageService: MessageService,
    private _dateFilter: DatePipe,
    private _taxCalculationService: TaxCalculation,
    public _authService: AuthService,
    private _openDialogue: MatDialogService,
    private _commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public serviceDetail: any
  ) {
    super();
  }

  ngOnInit(): void {
    this.checkPackagePermissions();
    this.serviceDetail = this.serviceDetail._serviceDataSelection;
    this.serviceDetail.CustomerMembershipID = this.serviceDetail.CustomerMembershipID;
    this.serviceDetail.AssignedToStaffID = this.serviceDetail.StaffID;
    this.selectedStaffID = this.serviceDetail.StaffID;
    this.saveServicesModel.ServiceBookingList.push(this.serviceDetail);
    this.saveServicesModel.ServiceBookingList[0].StartDate = this.serviceDetail.RequestDate;
    this.saveServicesModel.ServiceBookingList[0].ServicePackageID = this.serviceDetail.ServicePackageID;
    this.saveServicesModel.ServiceBookingList[0].AssignedToStaffID = this.serviceDetail.StaffID;
    this.getCurrentBranchDetail();
  }

  ngAfterViewInit() {
    this.onStaffChange(this.saveServicesModel.ServiceBookingList[0].AssignedToStaffID);
  }

  ngOnDestroy() {
    this.packageIdSubscription?.unsubscribe();
  }

  checkPackagePermissions() {
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
        if (packageId && packageId > 0) {
            this.setPackagePermissions(packageId);
        }
    })
  }

setPackagePermissions(packageId: number) {
    this.isRewardProgramInPackage = false;
    switch (packageId) {

        case this.package.Full:
            this.isRewardProgramInPackage = true;
            this.isPurchaseRestrictionAllowed = true;
            break;
    }
}

  async getCurrentBranchDetail() {
    this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
    this.isLoadOneDaySchecduler = true;
    this.getFundamentals();
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      if (branch.BranchTimeFormat12Hours == true) {
        this.timeFormat = Configurations.SchedulerTimeFormatWithFormat;
        this.schedulerTimeFormat = Configurations.SchedulerTimeFormatWithFormat;
      }
      this.currencyFormat = branch.CurrencySymbol;
    }

  }

  onClose() {
    this._dialogRef.close();
  }



  getFundamentals() {
    return this._httpService.get(SchedulerServicesApi.getSchedulerServiceFundamentals)
      .subscribe((res:ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.getResponseServiceFundamentals(res.Result);
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
        }
      );
  }

  onSelectDate_valueChanged(itemIndex, serviceBookingDate) {
    serviceBookingDate = new Date(serviceBookingDate);
    this.currentDate = serviceBookingDate;

    if (this.saveServicesModel.ServiceBookingList[itemIndex].ID > 0) {
      this.saveServicesModel.ServiceBookingList[itemIndex].isServiceChange = true;
    }

    this.getMembershipEndDate();
    if (this.checkMemberhsipEndDate(serviceBookingDate)) {
      /** Set date for Start and End Time */
      this.saveServicesModel.ServiceBookingList[itemIndex].StartDate = serviceBookingDate;
      new Date(this.saveServicesModel.ServiceBookingList[itemIndex].StartTime).setDate(serviceBookingDate.getDate());
      new Date(this.saveServicesModel.ServiceBookingList[itemIndex].EndTime).setDate(serviceBookingDate.getDate());

      this.mapServiceBenefit(itemIndex, null, true);
    }
    else {
      this.saveServicesModel.ServiceBookingList[itemIndex].StartDate = serviceBookingDate;
      new Date(this.saveServicesModel.ServiceBookingList[itemIndex].StartTime).setDate(serviceBookingDate.getDate());
      new Date(this.saveServicesModel.ServiceBookingList[itemIndex].EndTime).setDate(serviceBookingDate.getDate());
      this.resetSelectedServiceBenefit(itemIndex);
    }
    this.setDurationNotesAccordingTime(this.saveServicesModel.ServiceBookingList[itemIndex]);

  }


  getResponseServiceFundamentals(response) {
    this.getServiceFundamentalList = response.ServiceCategoryList && response.ServiceCategoryList.length > 0 ? response.ServiceCategoryList : [];
    this.StaffList = response.StaffList && response.StaffList.length > 0 ? response.StaffList : [];
    this.FacilityList = response.FacilityList && response.FacilityList.length > 0 ? response.FacilityList : [];
    this.selectedStaffID = this.StaffList && this.StaffList.length > 0 ? this.StaffList[0].StaffID : 0;
    this.ServicePackageList = [];
    if (this.saveServicesModel.ServiceBookingList[0].AssignedToStaffID != 0) {
      this.onStaffChange(this.saveServicesModel.ServiceBookingList[0].AssignedToStaffID);
    } else {
      this.saveServicesModel.ServiceBookingList[0].AssignedToStaffID = this.StaffList[0].StaffID;
      this.onStaffChange(this.saveServicesModel.ServiceBookingList[0].AssignedToStaffID);
    }
    this.getServiceFundamentalList.forEach(category => {
      category.ServiceList.forEach(service => {
        this.serviceList.push(service);
        if (service.ServicePackageList) {
          service.ServicePackageList.forEach(singlepackage => {
            let objServicePackage = new SchedulerServicesPackage();
            objServicePackage.ServiceID = singlepackage.ServiceID;
            objServicePackage.ServicePackageID = singlepackage.ServicePackageID;
            objServicePackage.TotalPrice = singlepackage.TotalPrice; // price chnaged after partial payment
            objServicePackage.Price = singlepackage.Price;
            objServicePackage.DurationTypeID = singlepackage.DurationTypeID;
            objServicePackage.DurationValue = singlepackage.DurationValue;
            objServicePackage.DurationTypeName = singlepackage.DurationTypeName;
            objServicePackage.TotalTaxPercentage = singlepackage.TotalTaxPercentage;
            objServicePackage.RemainingSession = singlepackage.RemainingSession;
            this.ServicePackageList.push(objServicePackage);
          });
        }
      });
    });

    // for add/update
    if (this.serviceDetail.ItemID > 0) {
      this.isChangeStartDateEvent = false;
      this.getServiceByID();
    }
  }

  getServiceByID() {
    this.setSelectedCustomer(this.serviceDetail);
    this.onServiceChange(null, 0, this.saveServicesModel.ServiceBookingList[0].ServicePackageID);
  }

  onServicePackageChange(packageDetail: SchedulerServicesPackage, arrayIndexx: number, ServicePackageID: number, checkbenefits: boolean = true) {
    if (ServicePackageID) {
      this.updateBenefitsOnDurationvaluechange(ServicePackageID);
    }
    this.isShowError = false;
    this.isDateTimeEventChange = false;
    this.isChangeServicePackage = true;
    let index = this.ServicePackageList.findIndex(fl => fl.ServicePackageID === packageDetail.ServicePackageID);
    let selectedServicePackage = this.serviceBenefitsPackage && this.serviceBenefitsPackage.length > 0 ? this.serviceBenefitsPackage.filter(item => item.ItemID == packageDetail.ServicePackageID)[0] : undefined;


    ///check membership end date
    if (checkbenefits) {
      this.getMembershipEndDate();
    }
    if (this.saveServicesModel.ServiceBookingList.length > 0 && this.checkMemberhsipEndDate(this.saveServicesModel.ServiceBookingList[arrayIndexx].StartDate)) {
      //set benefit again when staff change service added by fahad
      this.resetMembershipBenefitOnServiceChange(arrayIndexx);
      if (this.oncheckItemAndGlobalLevelRemaingSession(selectedServicePackage)) {
        this.mapServiceBenefit(arrayIndexx, packageDetail);
      }
      else {
        this.resetSelectedServiceBenefit(arrayIndexx, packageDetail);
      }
    } else {
      this.resetSelectedServiceBenefit(arrayIndexx, packageDetail);
    }

    this.setDurationNotesAccordingTime(this.saveServicesModel.ServiceBookingList[arrayIndexx]);
  }
  setDurationNotesAccordingTime(objSaleService: ServiceBookingList, isServiceGetByID?): ServiceBookingList {
    let selectedPackage = JSON.parse(JSON.stringify(this.ServicePackageList.find((item: any) => item.ServicePackageID == objSaleService.ServicePackageID)));

    this.selectedDurationValue = selectedPackage.DurationValue;
    this.selectedService = this.serviceList.filter(x => x.ServiceID == objSaleService.ServiceID);
    objSaleService.Price = objSaleService.IsMembershipBenefit ? objSaleService.Price : selectedPackage.Price;


    // if service unpaid or created assigned total price from selectedPackage other wise total price added from objSaleService implementation chnaged after partial payment show full price include tax
    if (objSaleService.SaleStatusTypeID === EnumSaleStatusType.Unpaid && objSaleService.SaleStatusTypeName && objSaleService.SaleStatusTypeName.toString().toLowerCase() === 'unpaid') {
      /** customer memberhisp id mean this service is assiciated with memberhisp benefits */
      objSaleService.TotalPrice = objSaleService.IsMembershipBenefit ? objSaleService.TotalPrice : selectedPackage.TotalPrice;
    } else if (objSaleService.SaleStatusTypeName === undefined) {
      objSaleService.TotalPrice = objSaleService.IsMembershipBenefit ? objSaleService.TotalPrice : selectedPackage.TotalPrice;
    }


    /** hide end time validation error */
    if (new Date(objSaleService.StartTime) < new Date(objSaleService.EndTime)) {
      this.isShowError = false;
      objSaleService.showErrorText = true;
    }

    /** If add new Service button click set endtime according to duration */

    if (this.isChangeServicePackage) {
      if (selectedPackage.DurationTypeID == 6)    // For Hours
        objSaleService.EndTime = this.getDateInterval(objSaleService.StartTime, 5, selectedPackage.DurationValue); // duration time according to package hours
      else if (selectedPackage.DurationValue >= 60 && selectedPackage.DurationTypeID == 8)     // For Minutes
        objSaleService.EndTime = this.getDateInterval(objSaleService.StartTime, 6, selectedPackage.DurationValue); // duration time according to package hours
      else if (selectedPackage.DurationValue <= 60 && selectedPackage.DurationTypeID == 8)     // For Minutes
        objSaleService.EndTime = this.getDateInterval(objSaleService.StartTime, 6, selectedPackage.DurationValue); // duration time according to package minutes
    }

    let cleanupTime = this.selectedService[0].CleaningTimeInMinute;
    /** set cleaning up time with get by id serivce */
    if (isServiceGetByID) {
      cleanupTime = objSaleService.CleaningTimeInMinute;
    }

    let startTime = this._dateTimeService.convertDateObjToString(new Date(objSaleService.StartTime), this.timeFormatDifference),
      endTime = this._dateTimeService.convertDateObjToString(new Date(objSaleService.EndTime), this.timeFormatDifference),
      startAndEndTimeDurationWithCleaning = this._dateTimeService.getTimeDifferenceFromTimeString(startTime, endTime) + cleanupTime,
      endDateTimeWithCleaning = this.getDateInterval(objSaleService.EndTime, 6, cleanupTime);

    /** change endTime with cleanupTime if date is changed to another day */
    if (endDateTimeWithCleaning.getDate() !== new Date(objSaleService.EndTime).getDate()) {
      this.isShowError = true;
      objSaleService.showErrorText = true;
      objSaleService.cleanupEndTimeError = true;
      objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.DateTimeCompareError] = Messages.Validation.Service_EndTime_Greater_Than_TodayTime;
    } else {
      objSaleService.cleanupEndTimeError = false;
    }

    let cleaningTimeDesc = cleanupTime > 0 ? this.cleanupTimeText + this.endTimeText : this.endTimeText;

    if (startAndEndTimeDurationWithCleaning > 0) {

      objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.ItemDurationNote] = "";

      if (startAndEndTimeDurationWithCleaning > 60) {
        objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.ItemDurationNote] =
          this._dateTimeService.convertNumberToHoursMinutes(startAndEndTimeDurationWithCleaning) +
          cleaningTimeDesc +
          this._dateTimeService.formatTimeString(this._dateTimeService.convertDateToTimeString(new Date(endDateTimeWithCleaning)), this.timeFormat);
      } else {
        objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.ItemDurationNote] =
          startAndEndTimeDurationWithCleaning + " minute(s)" +
          cleaningTimeDesc +
          this._dateTimeService.formatTimeString(this._dateTimeService.convertDateToTimeString(new Date(endDateTimeWithCleaning)), this.timeFormat);
      }
    } else {
      objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.ItemDurationNote] = ""; //Your time selection is not Correct.
    }
    return objSaleService;
  }
  getDateInterval(date, interval, units) {

    let dateToday = new Date(date);
    let checkRollover = function () { if (dateToday.getDate() != date.getDate()) dateToday.setDate(0); };
    switch (interval) {
      case this.periodIntervals.year:
        dateToday.setFullYear(dateToday.getFullYear() + units); checkRollover();
        break;
      case this.periodIntervals.quarter:
        dateToday.setMonth(dateToday.getMonth() + 3 * units); checkRollover();
        break;
      case this.periodIntervals.month:
        dateToday.setMonth(dateToday.getMonth() + units); checkRollover();
        break;
      case this.periodIntervals.week:
        dateToday.setDate(dateToday.getDate() + 7 * units);
        break;
      case this.periodIntervals.day:
        dateToday.setDate(dateToday.getDate() + units);
        break;
      case this.periodIntervals.hour:
        dateToday.setTime(dateToday.getTime() + units * 3600000);
        break;
      case this.periodIntervals.minute:
        dateToday.setTime(dateToday.getTime() + units * 60000);
        break;
      case this.periodIntervals.second:
        dateToday.setTime(dateToday.getTime() + units * 1000);
        break;
      default: dateToday = undefined; break;
    }
    return dateToday;
  }

  resetSelectedServiceBenefit(arrayIndexx: number, packageDetail?: any) {

    let index = this.getServicePackage(arrayIndexx, packageDetail);

    this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID = packageDetail ? packageDetail.ServicePackageID : this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID;
    /* set Memberhisp benefit properties if exist*/
    this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree = false;
    this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit = false;
    this.saveServicesModel.ServiceBookingList[arrayIndexx].IsBenefitsSuspended = null;
    this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession = this.ServicePackageList[index].Price;
    this.saveServicesModel.ServiceBookingList[arrayIndexx].PriceBeforeBenefit = this.ServicePackageList[index].TotalPrice;
    this.saveServicesModel.ServiceBookingList[arrayIndexx].DiscountPercentage = null;
    this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount = 0;
    this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID = this.serviceDetail.CustomerMembershipID;
    this.saveServicesModel.ServiceBookingList[arrayIndexx].ItemDiscountAmount = 0;
    this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalPrice = this.ServicePackageList[index].TotalPrice;
  }


  oncheckItemAndGlobalLevelRemaingSession(selectedServicePackage: any): boolean {
    if (selectedServicePackage && this.checkItemAssociationWithMemberhisp(selectedServicePackage)) {
      if (this.serviceGlobalRemainingSession == null && selectedServicePackage.RemainingSession == null) {
        return true;
      }
      else if (this.serviceGlobalRemainingSession == null && selectedServicePackage.RemainingSession != null) {
        return this.checkItemLevelSession(selectedServicePackage);
      }
      else if (this.serviceGlobalRemainingSession != null && selectedServicePackage.RemainingSession == null) {
        return this.serviceGlobalRemainingSession == 0 || this.serviceGlobalRemainingSession > 0 ? true : false;
      }
      else if (this.serviceGlobalRemainingSession != null && selectedServicePackage.RemainingSession != null) {
        // let index = this.remainingSessionDetail.findIndex(c => c.ItemID === selectedServicePackage.ItemID);
        if (this.serviceGlobalRemainingSession > 0) {
          this.serviceGlobalRemainingSession = this.serviceGlobalRemainingSession - 1;
          return this.checkItemLevelSession(selectedServicePackage);
        }
        else {
          return false;
        }
      }
    } else {
      return false;
    }

  }
  checkItemLevelSession(selectedItem) {
    if (this.remainingSessionDetail.length > 0) {
      let index = this.remainingSessionDetail.findIndex(c => c.ItemID === selectedItem.ItemID);
      if (index >= 0) {
        if (this.remainingSessionDetail[index].RemainingSession > 0) {
          this.decreaseItemSession(index);
          return true;
        }
        else {
          return false;
        }
      }
      else {
        return this.pushIntoItemLevelSessinArray(selectedItem);
      }
    }
    else {
      return this.pushIntoItemLevelSessinArray(selectedItem);
    }
  }

  updateGlobalSession() {
    this.serviceGlobalRemainingSession = this.serviceGlobalRemainingSession + 1;
  }
  decreaseItemSession(index: number) {
    this.remainingSessionDetail[index].RemainingSession = this.remainingSessionDetail[index].RemainingSession - 1;
  }
  increaseItemSession(index: number) {
    this.remainingSessionDetail[index].RemainingSession = this.remainingSessionDetail[index].RemainingSession + 1;
  }
  getServicePackage(arrayIndexx, packageDetail): number {
    let index: number;
    let packageid = packageDetail ? packageDetail.ServicePackageID : this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID
    if (packageDetail) {

      index = this.ServicePackageList.findIndex(fl => fl.ServicePackageID === packageDetail.ServicePackageID);

    }
    else {
      index = this.ServicePackageList.findIndex(fl => fl.ServicePackageID === packageid)
      // index = arrayIndexx;
    }

    return index;
  }
  pushIntoItemLevelSessinArray(selectedItem): boolean {
    let sesstionDetail = new RemainingSessionDetail();
    sesstionDetail.ItemID = selectedItem.ItemID;
    sesstionDetail.ItemTypeID = 2;
    sesstionDetail.AllowedSession = selectedItem.RemainingSession;
    sesstionDetail.RemainingSession = selectedItem.RemainingSession == null ? null : selectedItem.RemainingSession == 0 ? 0 : selectedItem.RemainingSession - 1;
    this.remainingSessionDetail.push(sesstionDetail);
    return selectedItem.RemainingSession == null ? true : selectedItem.RemainingSession > 0 ? true : false;

  }

  mapServiceBenefit(arrayIndexx: number, packageDetail?: any, isCheckBenefits: boolean = false) {
    let index = this.getServicePackage(arrayIndexx, packageDetail);
    let selectedServicePackage;
    if (packageDetail) {
      selectedServicePackage = this.serviceBenefitsPackage && this.serviceBenefitsPackage.length > 0 ? this.serviceBenefitsPackage.filter(item => item.ItemID == packageDetail.ServicePackageID)[0] : undefined;
    }
    else {
      selectedServicePackage = this.serviceBenefitsPackage && this.serviceBenefitsPackage.length > 0 ? this.serviceBenefitsPackage.filter(item => item.ItemID == this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID)[0] : undefined;
    }

    if (isCheckBenefits) {
      if (this.oncheckItemAndGlobalLevelRemaingSession(selectedServicePackage)) {
        this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID = packageDetail ? packageDetail.ServicePackageID : this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID;
        /* set Memberhisp benefit properties if exist*/
        this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree = selectedServicePackage.IsFree;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit = selectedServicePackage.IsFree ? selectedServicePackage.IsFree : selectedServicePackage && !selectedServicePackage.IsFree && selectedServicePackage.DiscountPercentage > 0 ? true : false;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].IsBenefitsSuspended = selectedServicePackage.IsBenefitsSuspended;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession = this.ServicePackageList[index].Price;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].PriceBeforeBenefit = this.ServicePackageList[index].TotalPrice;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].DiscountPercentage = selectedServicePackage.DiscountPercentage;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount = this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit ? this._taxCalculationService.getTwoDecimalDigit(((this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession * selectedServicePackage.DiscountPercentage) / 100)) : 0;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID = selectedServicePackage.IsFree || selectedServicePackage.DiscountPercentage > 0 ? this.serviceDetail.CustomerMembershipID : null;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].ItemDiscountAmount = this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount > 0 ? this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount : 0;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].RemainingSession = selectedServicePackage.RemainingSession ? selectedServicePackage.RemainingSession : null;

        this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalPrice = this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree ? 0 : this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit && !this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree ? selectedServicePackage.DiscountedPrice : this.ServicePackageList[index].TotalPrice;
      }
    } else {
      this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID = packageDetail ? packageDetail.ServicePackageID : this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID;
      /* set Memberhisp benefit properties if exist*/
      this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree = selectedServicePackage.IsFree;
      this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit = selectedServicePackage.IsFree ? selectedServicePackage.IsFree : selectedServicePackage && !selectedServicePackage.IsFree && selectedServicePackage.DiscountPercentage > 0 ? true : false;
      this.saveServicesModel.ServiceBookingList[arrayIndexx].IsBenefitsSuspended = selectedServicePackage.IsBenefitsSuspended;
      this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession = this.ServicePackageList[index].Price;
      this.saveServicesModel.ServiceBookingList[arrayIndexx].PriceBeforeBenefit = this.ServicePackageList[index].TotalPrice;
      this.saveServicesModel.ServiceBookingList[arrayIndexx].DiscountPercentage = selectedServicePackage.DiscountPercentage;
      this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount = this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit ? this._taxCalculationService.getTwoDecimalDigit(((this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession * selectedServicePackage.DiscountPercentage) / 100)) : 0;
      this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID = selectedServicePackage.IsFree || selectedServicePackage.DiscountPercentage > 0 ? this.serviceDetail.CustomerMembershipID : this.serviceDetail.CustomerMembershipID;
      this.saveServicesModel.ServiceBookingList[arrayIndexx].ItemDiscountAmount = this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount > 0 ? this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount : 0;
      this.saveServicesModel.ServiceBookingList[arrayIndexx].RemainingSession = selectedServicePackage.RemainingSession ? selectedServicePackage.RemainingSession : null;

      this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalPrice = this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree ? 0 : this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit && !this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree ? selectedServicePackage.DiscountedPrice : this.ServicePackageList[index].TotalPrice;
    }

  }

  onServiceChange(e, arrayIndex: number, ServicePackageID?: any, isMembershipChange: boolean = false) {
    /** Load duration-package-list against service */
    let selectedServiceId;
   // this.saveServicesModel.ServiceBookingList[arrayIndex].ID == 0
    if (e && e.target) {
      selectedServiceId = Number(e.target.value.split(':')[1]);
      this.selectedServiceName = e.target.options[e.target.selectedIndex].text;
      this.selectedService = this.serviceList.filter(x => x.ServiceID == selectedServiceId);
      let durationTypeList = this.ServicePackageList.filter(x => x.ServiceID == selectedServiceId);
      if (this.selectedService && this.selectedService.length > 0 && !isMembershipChange) {
        this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID = this.selectedService[0].ServicePackageList[0].ServicePackageID;
        this.saveServicesModel.ServiceBookingList[arrayIndex].RestrictedCustomerTypeNames = this.selectedService[0].RestrictedCustomerTypeNames;
      } else {
        this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID = ServicePackageID;
      }
      this.onServicePackageChange(durationTypeList[0], arrayIndex, ServicePackageID);

    } else {
      selectedServiceId = this.saveServicesModel.ServiceBookingList[arrayIndex].ServiceID;
      this.selectedService = this.serviceList.filter(x => x.ServiceID == selectedServiceId);
      this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID = this.selectedService[0].ServicePackageList[0].ServicePackageID;
      let selectedServicePackage = this.selectedService[0].ServicePackageList.filter(x => x.ServicePackageID == ServicePackageID);
      if (this.selectedService && this.selectedService.length > 0 && !isMembershipChange) {
        this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID = selectedServicePackage[0].ServicePackageID;
        this.saveServicesModel.ServiceBookingList[arrayIndex].RestrictedCustomerTypeNames = this.selectedService[0].RestrictedCustomerTypeNames;
        this.onServicePackageChange(selectedServicePackage[0], arrayIndex, ServicePackageID, false);
      } else {
        this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID = ServicePackageID;
        this.onServicePackageChange(selectedServicePackage[0], arrayIndex, ServicePackageID, true);
      }

    }
  }

  resetMembershipBenefitOnServiceChange(arrayIndex) {
    //reset benefit again when staff change service
    if (this.serviceBenefitsPackage && this.serviceBenefitsPackage.length > 0 && this.remainingSessionDetail && this.remainingSessionDetail.length > 0) {
      this.getMembershipEndDate();
      if (this.serviceDetail.ID == 0) {


        this.serviceDetail.IsMembershipBenefit = false;
        var newCreatedServices = this.saveServicesModel.ServiceBookingList.filter(s => s.ID == 0);
        let availedItemSession = 0;
        newCreatedServices.forEach(service => {
          if (service.IsMembershipBenefit && service.ServicePackageID == this.serviceDetail.ServicePackageID) {
            availedItemSession++;
          }
        });

        if (this.remainingSessionDetail.length > 0) {

          this.remainingSessionDetail.forEach(rsd => {
            if (availedItemSession == 0) {

              rsd.RemainingSession = this.serviceBenefitsPackage.find(sbf => sbf.ItemID == rsd.ItemID).CopyRemainingSession;
              //rsd.AllowedSession;
            }
          });

          let rsdIndex = this.remainingSessionDetail.findIndex(c => c.ItemID == this.serviceDetail.ServicePackageID);
          if (rsdIndex >= 0)
            this.remainingSessionDetail[rsdIndex].RemainingSession = availedItemSession > 0 ? this.remainingSessionDetail[rsdIndex].AllowedSession - availedItemSession : this.remainingSessionDetail[rsdIndex].AllowedSession;
        }

        let availedGlobalSession = 0;
        newCreatedServices.forEach(service => {
          if (service.IsMembershipBenefit) {
            availedGlobalSession++;
          }
        });

        this.serviceBenefitsPackage.forEach(rsd => {
          if (availedGlobalSession == 0) {
            if ((rsd.GlobalRemainingSession == null || rsd.GlobalRemainingSession == undefined) && (rsd.RemainingSession != null || rsd.RemainingSession != undefined)) {
              rsd.RemainingSession = rsd.CopyRemainingSession;
            } else {
              rsd.RemainingSession = rsd.GlobalRemainingSession;
            }

          }
        });

        let sbpIndex = this.serviceBenefitsPackage.findIndex(c => c.ItemID == this.serviceDetail.ServicePackageID);
        if (sbpIndex >= 0 && this.serviceBenefitsPackage[sbpIndex].RemainingSession && this.serviceBenefitsPackage[sbpIndex].GlobalRemainingSession)
          this.serviceGlobalRemainingSession = availedGlobalSession > 0 ? this.serviceBenefitsPackage[sbpIndex].GlobalRemainingSession - availedGlobalSession : this.serviceBenefitsPackage[sbpIndex].GlobalRemainingSession;
        //this.serviceGlobalRemainingSession = availedSession > 0 ? this.serviceBenefitsPackage[0].GlobalRemainingSession - availedSession : this.serviceBenefitsPackage[0].GlobalRemainingSession;
      }
    }
  }

  checkMemberhsipEndDate(serviceBookingDate: any): boolean {
    if (this.membershipEndDate) {
      let membershipEndDate = this._dateTimeService.removeZoneFromDateTime(this.membershipEndDate);
      serviceBookingDate = new Date(serviceBookingDate);
      serviceBookingDate.setHours(0, 0, 0, 0);
      if (this._dateTimeService.compareTwoDates(serviceBookingDate, membershipEndDate)) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  getMembershipEndDate() {

    this.membershipEndDate = this.serviceDetail.CustomerMembershipID ? this.serviceBenefitsDetail.filter(id => id.CustomerMembershipID == this.serviceDetail.CustomerMembershipID)[0].MembershipEndDate : null;
  }
  setSelectedCustomer(responseData) {
    /** set value to control on backend & set on front-end with selectedClient
     * Also Trigger the getSearchClient
    */
    //this.searchClientControl.setValue(this._cellDataSelection.CustomerName);

    /** New changes */
    //if (this._cellDataSelection.id > 0) {
    if (responseData) {
      this.selectedClient = new ServiceClient();
      this.selectedClient.CustomerID = responseData.CustomerID;
      this.selectedClient.CustomerTypeID = responseData.CustomerTypeID;
      this.selectedClient.CustomerTypeName = responseData.CustomerTypeName;
      this.selectedClient.FullName = responseData.FullName;
      this.selectedClient.Email = responseData.Email;
      this.selectedClient.Mobile = responseData.Mobile;
      this.selectedClient.IsWalkedIn = responseData.IsWalkedInCustomer;
      this.selectedClient.AllowPartPaymentOnCore = responseData.AllowPartPaymentOnCore;
      if (this.selectedClient.CustomerTypeID == this.enumCustomerType.Member && this.selectedClient.CustomerTypeName == "Member") {
        this.getCustomerMemberhsips(this.selectedClient.CustomerID, 0);
      }
      this.getServiceBenefitsDetail().then(isResolved => {
        if (isResolved) {
          if (this.serviceBenefitsDetail) {
            this.serviceBenefitsPackage = this.serviceBenefitsDetail.filter(item => item.CustomerMembershipID == this.serviceDetail.CustomerMembershipID);
            //added by fahad for change service maintane session
            this.setItemLevelBenefitCopy();

          }
          this.updateServicesBenefitModel();
        }
      });
    }
  }
  roundValue(value: any) {
    return this._taxCalculationService.getRoundValue(value);
  }

  getDiscountAmount(price: number, discountPercentage: number) {
    return this._taxCalculationService.getTwoDecimalDigit(((price * discountPercentage) / 100));
  }

  updateServicesBenefitModel() {
    let servicePackageIdList: any;

    if (this.serviceBenefitsPackage) {
      // this.saveServicesModel.ServiceBookingList.forEach(element => {
      //     element.CustomerMembershipID = this.customerMembershipId;
      // });
      let serviceSessoin = this.serviceBenefitsPackage.filter(c => c.GlobalRemainingSession && c.GlobalRemainingSession > 0)[0];
      if (serviceSessoin) {
        this.serviceGlobalRemainingSession = serviceSessoin != undefined && serviceSessoin.GlobalRemainingSession ? serviceSessoin.GlobalRemainingSession : null;
      }
    }


    this.saveServicesModel.ServiceBookingList.forEach(element => {
      servicePackageIdList += element.ServicePackageID > 0 ? element.ServicePackageID + ',' : null;
      let index = this.ServicePackageList.findIndex(fl => fl.ServicePackageID === element.ServicePackageID);
      if (index >= 0) {
        /* set Memberhisp benefit properties if exist*/
        if (this.serviceBenefitsPackage) {
          let selectedServicePackage = this.serviceBenefitsPackage && this.serviceBenefitsPackage.length > 0 ? this.serviceBenefitsPackage.filter(item => item.ItemID == element.ServicePackageID)[0] : undefined;
          element.CustomerMembershipID = selectedServicePackage.CustomerMembershipID ? selectedServicePackage.CustomerMembershipID : this.serviceDetail.CustomerMembershipID;
          if (((element.CustomerMembershipID && this.checkItemAssociationWithMemberhisp(selectedServicePackage)) && this.oncheckItemAndGlobalLevelRemaingSession(selectedServicePackage)) || (element.ID > 0 && element.IsMembershipBenefit)) {
            element.IsMembershipBenefit = true;
            element.CustomerMembershipID = selectedServicePackage.CustomerMembershipID;
            element.PricePerSession = this.ServicePackageList[index].Price;
            element.PriceBeforeBenefit = element.TotalPrice;
            element.TotalPrice = selectedServicePackage.IsFree ? 0 : selectedServicePackage.DiscountedPrice;
            element.ItemDiscountAmount = this.getDiscountAmount(element.PricePerSession, selectedServicePackage.DiscountPercentage);
          }
          else {
            element.IsMembershipBenefit = false;
            element.CustomerMembershipID = null;
            element.PricePerSession = this.ServicePackageList[index].Price;
            element.PriceBeforeBenefit = element.TotalPrice;
            element.TotalPrice = element.IsFree ? 0 : element.TotalPrice;
            element.ItemDiscountAmount = 0;
          }

        }

        else {
          element.IsMembershipBenefit = element.CustomerMembershipID ? true : false;
          element.PricePerSession = this.ServicePackageList[index].Price;
          element.PriceBeforeBenefit = element.TotalPrice;
          element.ItemDiscountAmount = 0;
          element.TotalPrice = element.IsMembershipBenefit && (element.ItemDiscountAmount && element.ItemDiscountAmount == element.Price) ? 0 : this.ServicePackageList[index].Price;
        }



      }
    });
  }
  setItemLevelBenefitCopy() {
    this.serviceBenefitsPackage.forEach(benefit => {
      benefit.CopyRemainingSession = benefit.RemainingSession;
    });
  }


  getServiceBenefitsDetail() {
    return new Promise<boolean>((resolve, reject) => {
      let url = SchedulerServicesApi.getServiceBenefitsDetail
        .replace("{customerID}", this.selectedClient.CustomerID.toString())
        .replace("{serviceDate}", this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat));

      this._httpService.get(url).subscribe((res:ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.customerMemberhsip = res.Result.CustomerMemberships;
          this.serviceBenefitsDetail = res.Result.ServiceBenefitsDetail;
          this.getMembershipEndDate();
          resolve(true);
        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      });
    });
  }
  updateBenefitsOnDurationvaluechange(defaultValue: any) {
    // model is Previous value
    // viewModel is Current value
    /// console.log(defaultValue.model, defaultValue.viewModel);
    if (this.remainingSessionDetail && this.remainingSessionDetail.length > 0) {
      let checkExistingSession = this.remainingSessionDetail.filter(item => item.ItemID == defaultValue.model)[0];
      if (checkExistingSession) {
        let index = this.remainingSessionDetail.findIndex(c => c.ItemID === defaultValue.model);
        let countbooking = this.saveServicesModel.ServiceBookingList.filter(item => item.ServicePackageID == defaultValue.model);
        let remainingSession;
        if (countbooking && countbooking.length > 0) {
          remainingSession = checkExistingSession.AllowedSession - countbooking.length;
          if (remainingSession > 0) {
            if (this.serviceGlobalRemainingSession != null) {
              this.updateGlobalSession();
            }
            if (index >= 0) {
              if (checkExistingSession.RemainingSession != null) {
                this.increaseItemSession(index);
              }
            }
          }
        }
        else {
          if (this.serviceGlobalRemainingSession != null) {
            this.updateGlobalSession();
          }
          this.remainingSessionDetail.splice(index, 1);
        }
      }
    }

  }

  checkItemAssociationWithMemberhisp(cartItem: any): boolean {
    if (!cartItem.IsBenefitsSuspended) {
      return true;
    }
    else {
      return false;
    }
  }
  endTime_valueChanged($event, arrayIndex) {

    this.isShowError = false;
    if (this.saveServicesModel.ServiceBookingList.length > 0)
      this.serviceDetail.showErrorText = false;
    if ($event.value) {
      if (this.isChangeStartDateEvent || $event.previousValue) {
        this.isChangeServicePackage = false;
        this.setDurationNotesAccordingTime(this.serviceDetail);
        super.markFormAsDirty(this.serviceFormData);
      }
    } else {
      this.serviceDetail[this.schedulerStaticStrings.GetSchedulerStaticString.DateTimeCompareError] = Messages.Validation.EndTime_Required;
      this.serviceDetail[this.schedulerStaticStrings.GetSchedulerStaticString.ItemDurationNote] = "";
      this.serviceDetail.showErrorText = true;
      this.isShowError = true;
      this.serviceFormData.form.markAsDirty();
    }
    /** set Date on Date time */
    if ($event.value) {
      new Date(this.serviceDetail.EndTime.setDate(this.currentDate.getDate()));
      new Date(this.serviceDetail.EndTime.setMonth(this.currentDate.getMonth()));
      new Date(this.serviceDetail.EndTime.setFullYear(this.currentDate.getFullYear()));
    }
  }


  getTimeFromDate(date: Date) {
    return this._dateTimeService.getTimeStringFromDate(date);
  }


  startTime_valueChanged($event, servicepackageId, arrayIndex) {

    this.isShowError = false;
    if (this.saveServicesModel.ServiceBookingList.length > 0)
      this.serviceDetail.showErrorText = false;
    if ($event.value) {
      $event.previousValue = $event.previousValue ? $event.previousValue : this.currentDate;
      if (this.isChangeStartDateEvent || $event.previousValue) {
        if (servicepackageId && servicepackageId > 0) this.isChangeServicePackage = true;
        let getTimeDifference = this._dateTimeService.getTimeDifferenceFromTimeString(this.getTimeFromDate($event.previousValue),
          this.getTimeFromDate(new Date(this.serviceDetail.EndTime)));
        this.serviceDetail.EndTime = this._dateTimeService.setTimeInterval(new Date($event.value), getTimeDifference);
        this.setDurationNotesAccordingTime(this.serviceDetail);
        super.markFormAsDirty(this.serviceFormData);
      }
    } else {
      this.serviceDetail[this.schedulerStaticStrings.GetSchedulerStaticString.DateTimeCompareError] = Messages.Validation.StartTime_Required;
      this.serviceDetail[this.schedulerStaticStrings.GetSchedulerStaticString.ItemDurationNote] = "";
      this.serviceDetail.showErrorText = true;
      this.isShowError = true;
      this.serviceFormData.form.markAsDirty();
    }

    /** set Date on Date time */
    if ($event.value) {
      new Date(new Date(this.serviceDetail.StartTime).setDate(this.currentDate.getDate()));
      new Date(new Date(this.serviceDetail.StartTime).setMonth(this.currentDate.getMonth()));
      new Date(new Date(this.serviceDetail.StartTime).setFullYear(this.currentDate.getFullYear()));
    }
  }


  onStaffChange(AssignedToStaffID: number) {
    if (this.onedaySchedulerComp) {
      this.onedaySchedulerComp.getSchedulerByStaff(AssignedToStaffID);
    }
  }

  saveSchedulerService(isvalid: boolean) {

    this.isShowError = false;

    isvalid = true;
    isvalid = this.validateFormOnSubmit();

    if (this.selectedClient) {
      if (this.selectedClient.CustomerID) {
        if (isvalid && this.serviceFormData.dirty) {
          this.saveServicesModel.CustomerID = this.selectedClient.CustomerID;
          this.saveServicesModel.CustomerTypeID = this.selectedClient.CustomerTypeID;
          this.saveServicesModel.CustomerName = this.selectedClient.FullName;
          this.saveServicesModel.CustomerTypeName = this.selectedClient.CustomerTypeName;
          this.saveServicesModel.Email = this.selectedClient.Email;
          this.saveServicesModel.Mobile = this.selectedClient.Mobile;
          this.saveServicesModel.AllowPartPaymentOnCore = this.selectedClient.AllowPartPaymentOnCore;
          this.saveServicesModel.ServiceBookingList.forEach(item => {
            if (item.SaleStatusTypeName && item.SaleStatusTypeName.toString().toLowerCase() === 'partial paid') {
              item.SaleStatusTypeID = EnumSaleStatusType.PartialPaid;
            }

            // item.FormList = this.serviceForms ? this.serviceForms : [];

          });


          this.saveServicesModel.ServiceBookingList.forEach(item => {
            var _startDate = new Date(item.StartDate);
            item.StartDate = new Date(Date.UTC(_startDate.getFullYear(), _startDate.getMonth(), _startDate.getDate(), _startDate.getHours(), _startDate.getMinutes()))
          });

          let copyAddEditServiceModel = JSON.parse(JSON.stringify(this.saveServicesModel));
          this.copySaveServiceModel.ServiceBookingList = JSON.parse(JSON.stringify(this.saveServicesModel.ServiceBookingList));
          this.submitDirtFormOnly();
          this.validateSelectedService(copyAddEditServiceModel);
          // this.onUpdateSchedulerService.emit(serviceToSave);
          this.saveSchedulerServiceAPI(copyAddEditServiceModel);
          //this.onCloseSchedulerServicePopup();
        }
      }
    }

  }


  validateSelectedService(copyAddEditServiceModel) {

    copyAddEditServiceModel.ServiceBookingList.forEach(item => {
      let splitOnlyDatePart: any = null;
      /** Newly Created Service is Booked and Unpaid by default */
      item.BookingStatusTypeID = EnumBookingStatusType.Booked;
      item.SaleStatusTypeID = EnumSaleStatusType.Unpaid;
      if (item.StartDate.toString().includes('Z') > 0) {
        splitOnlyDatePart = item.StartDate.split('Z')[0];
      }
      if (item.StartDate.toString().includes('+') > 0) {
        splitOnlyDatePart = item.StartDate.split('+')[0];
      }

      if (item.StartDate.toString().includes('T') > 0) {
        splitOnlyDatePart = item.StartDate.split('T')[0];
      }

      //  item.StartDate = this._dateTimeService.convertDateObjToString(item.StartDate, this.dateFormat);
      item.StartDate = this._dateTimeService.convertDateObjToString(splitOnlyDatePart, this.dateFormat);
      item.StartTime = this._dateTimeService.convertDateToTimeString(new Date(item.StartTime));
      item.EndTime = this._dateTimeService.convertDateToTimeString(new Date(item.EndTime));
    });
  }
  submitDirtFormOnly() {

    /** HardCoded the properties that have been assigned while validateOnSubmit */
    this.copySaveServiceModel.ServiceBookingList.forEach(element => {
      if (element.FacilityID === 0) element.FacilityID = null;
      element.showErrorText = false;
      element.SaleSourceTypeID = 1;
    });

  }
  validateFormOnSubmit() {

    let isValid = true;
    this.saveServicesModel.ServiceBookingList.forEach((item) => {
      item.showErrorText = false;
      item.SaleSourceTypeID = 1;  // OnSite
      if (item.ServiceID == 0 || item.ServicePackageID == 0 || item.AssignedToStaffID == 0) isValid = false; // Future: in case of facilityID is mendatory || item.FacilityID == 0
      if (item.FacilityID == 0) item.FacilityID = null;    // if 0 then return null

      let startTime = this.getTimeStringFromDate(item.StartTime, Configurations.SchedulerTimeFormat);
      let EndTime = this.getTimeStringFromDate(item.EndTime, Configurations.SchedulerTimeFormat);


      if (startTime > EndTime) {
        isValid = false;
        this.isShowError = true;
        item[this.schedulerStaticStrings.GetSchedulerStaticString.DateTimeCompareError] = Messages.Validation.Endtime_Should_Greater_Than_Start_Time;
        item.showErrorText = true;
      }
      if (!item.StartTime || !item.EndTime) {
        isValid = false;
        item.showErrorText = true;
        item[this.schedulerStaticStrings.GetSchedulerStaticString.DateTimeCompareError] = Messages.Validation.Info_Required;
        this.isShowError = true;
      }

      if (item.cleanupEndTimeError) {
        isValid = false;
        item.showErrorText = true;
        item[this.schedulerStaticStrings.GetSchedulerStaticString.DateTimeCompareError] = Messages.Validation.Service_EndTime_Greater_Than_TodayTime;
        this.isShowError = true;
      }
    });
    return isValid;
  }
  getTimeStringFromDate(dateValue: Date, timeFormat: string) {
    return this._dateFilter.transform(dateValue, timeFormat);
  }

  saveSchedulerServiceAPI(saveModel: SchedulerServiceModel) {
    this._httpService.save(SchedulerServicesApi.saveSchedulerService, saveModel)
      .subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            this.onUpdateService.emit(true);
            this.onClose();
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Service"));
          } else {
            this._messageService.showErrorMessage(res.MessageText);
          }
        },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Service"));
        }
      );
  }

  savePOS(isValid, id) {
    if (isValid) {
      this.openDialogForPayment(id);
    }
  }
  openDialogForPayment(ID: number = 0) {

    if (!this.isShowError) {

      let saleInvoice = new SaleInvoice(), _grossAmount = 0, _vatTotal = 0;
      saleInvoice.TotalEarnedRewardPoints = 0;
      saleInvoice.ApplicationArea = SaleArea.Waitlist;  // to send pos from scheduler
      this.posCartItems = [];

      saleInvoice.SaleDetailList = [];
      saleInvoice.CustomerID = this.selectedClient.CustomerID;

      //** if any list data partial paid not added */
      let serviceBookingListForCheckout = JSON.parse(JSON.stringify(this.saveServicesModel.ServiceBookingList));
      //** if selected item payed add only selected item */
      if (ID > 0) {
        serviceBookingListForCheckout = this.saveServicesModel.ServiceBookingList.filter(x => x.ID == ID)
      }

      serviceBookingListForCheckout.forEach(_singleService => {

        //** sale invoice save into DB */
        let saleService = new POSSaleDetail();
        saleService.CustomerBookingID = null;
        // added by fahad zone issue
        saleService.StartDate = this._dateTimeService.convertDateObjToStringNotChangeDate(new Date(_singleService.StartDate), "YYYY-MM-DD");//_singleService.StartDate;
        saleService.ItemID = _singleService.ServicePackageID;
        saleService.FacilityID = _singleService.FacilityID == 0 ? null : _singleService.FacilityID;
        saleService.ItemTypeID = POSItemType.Service;
        saleService.StartTime = this._dateTimeService.convertDateObjToString(new Date(_singleService.StartTime), this.timeFormatDifference);
        saleService.EndTime = this._dateTimeService.convertDateObjToString(new Date(_singleService.EndTime), this.timeFormatDifference);
        saleService.Qty = 1;
        saleService.CustomerMembershipID = _singleService.IsMembershipBenefit ? _singleService.CustomerMembershipID : null;
        saleService.ItemDiscountAmount = _singleService.ItemDiscountAmount ? _singleService.ItemDiscountAmount : 0;
        saleService.AssignedToStaffID = _singleService.AssignedToStaffID;
        saleService.WaitListDetailID = this.serviceDetail.WaitListDetailID;

        saleInvoice.SaleDetailList.push(saleService);

        //** cartItem is only for display items on POS Component */
        let cartItem = new POSCartItem();
        cartItem.ItemID = _singleService.ServicePackageID;
        cartItem.ItemTypeID = POSItemType.Service;
        // added by fahad zone issue
        cartItem.ServiceDate = this._dateTimeService.convertDateObjToStringNotChangeDate(new Date(_singleService.StartDate), "YYYY-MM-DD");
        cartItem.ServiceStartTime = this._dateTimeService.convertDateObjToString(new Date(_singleService.StartTime), this.timeFormatDifference);
        cartItem.ServiceEndTime = this._dateTimeService.convertDateObjToString(new Date(_singleService.EndTime), this.timeFormatDifference);
        // cartItem.IsFree = false;
        cartItem.SelectedForPay = true;
        cartItem.Name = this.serviceList.filter(x => x.ServiceID === _singleService.ServiceID)[0].ServiceName;
        cartItem.TotalDiscount = _singleService.ItemDiscountAmount ? _singleService.ItemDiscountAmount : 0;
        cartItem.Price = _singleService.IsFree ? 0 : _singleService.Price - cartItem.TotalDiscount;
        cartItem.Qty = 1;
        cartItem.PricePerSession = _singleService.PricePerSession;
        cartItem.DiscountType = (_singleService.CustomerMembershipID && this.customerMembershipList.length > 0) ? this.customerMembershipList.filter(x => x.CustomerMembershipID === _singleService.CustomerMembershipID)[0].MembershipName : '';
        cartItem.TotalTaxPercentage = this.ServicePackageList.filter((item: any) => item.ServicePackageID == _singleService.ServicePackageID)[0].TotalTaxPercentage; // TODO: get vat total from service package in fundamentals
        cartItem.TotalAmountExcludeTax = _singleService.IsFree ? 0 : (cartItem.Qty * (cartItem.PricePerSession - cartItem.TotalDiscount));
        cartItem.ItemDiscountAmount = _singleService.ItemDiscountAmount ? _singleService.ItemDiscountAmount : 0;

        cartItem.ItemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(cartItem.TotalTaxPercentage, cartItem.Price) * cartItem.Qty);
        cartItem.TotalAmountIncludeTax = this._taxCalculationService.getRoundValue(cartItem.TotalAmountExcludeTax + cartItem.ItemTotalTaxAmount);
        //cartItem.TotalAmountExcludeTax = this._taxCalculationService.getRoundValue(cartItem.PricePerSession * cartItem.Qty);


        if(this.isRewardProgramInPackage) {
          this._commonService.getItemRewardPoints(POSItemType.Service, _singleService.ServiceID, this.selectedClient.CustomerID, _singleService?.IsFree, _singleService?.IsBenefitsSuspended, saleService.CustomerMembershipID ? true : false).subscribe((response: any) => {
              cartItem.AmountSpent = response.Result.AmountSpent;
              cartItem.MemberBaseEarnPoints = response.Result.MemberBaseEarnPoints ?  response.Result.MemberBaseEarnPoints : 0;
              cartItem.CustomerEarnedPoints = response.Result.CustomerEarnedPoints ? response.Result.CustomerEarnedPoints : 0;
              saleInvoice.TotalEarnedRewardPoints = this._commonService.calculateRewardPointsPerItem(this.selectedClient, cartItem);
          })
        }

        this.posCartItems.push(cartItem);

        _grossAmount += cartItem.TotalAmountExcludeTax;
        _vatTotal += cartItem.TotalTaxPercentage;
      });

      const dialogref = this._openDialogue.open(POSPaymentComponent,
        {
          disableClose: true,
          panelClass: 'pos-full-popup',
          data: {
            grossAmount: _grossAmount,
            cartItems: this.posCartItems,
            saleInvoice: saleInvoice,
            personInfo: this.selectedClient
          }
        });

      dialogref.componentInstance.paymentStatus.subscribe((isPaid: boolean) => {
        if (isPaid) {
          this.onUpdateService.emit(true);
          this.onClose();
        }
      });
    }
  }

  onMembershipChange(event, arrayIndex) {
    this.customerMembershipId = this.saveServicesModel.ServiceBookingList[arrayIndex].CustomerMembershipID;
    this.onServiceChange(this.saveServicesModel.ServiceBookingList[arrayIndex].ServiceID, arrayIndex, this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID, true);
}

getCustomerMemberhsips(CustomerID, arrayIndex) {
    let url = SaleApi.getCustomerMemberhsips.replace("{customerID}", CustomerID.toString())
    this._httpService.get(url)
        .subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.hasMemberhsip = res.Result && res.Result.length > 0 ? true : false;
                    if (this.hasMemberhsip) {
                        this.customerMembershipList = res.Result;
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Customer Memberhsips"))
            });

}



}
