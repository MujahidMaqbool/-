// #region Imports

/**Angular Modules */
import { Component, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges, Input } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { NgForm, FormControl } from '@angular/forms';
import { SubscriptionLike } from 'rxjs';

/** Model */
import { SchedulerServicesPackage, SchedulerServiceModel, ServiceBookingList, ServiceClient, DeleteServiceModel, ServiceBenefitsPackage, CustomerMembership, UpdateSaleServiceStatusModel } from 'src/app/scheduler/models/service.model';
import { CellSelectedData } from 'src/app/scheduler/models/scheduler.model';
import { POSCartItem, RemainingSessionDetail } from 'src/app/point-of-sale/models/point.of.sale.model';
import { ApiResponse } from 'src/app/models/common.model';
import { CustomerFormsInfromation, CustomFormView } from 'src/app/models/customer.form.model';
import { RescheduleBooking } from 'src/app/models/bookings.model';

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { CommonService } from 'src/app/services/common.service';
import { AuthService } from 'src/app/helper/app.auth.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
/** App Messages & Constants */

import { Configurations, SchedulerOptions, DiscountType } from 'src/app/helper/config/app.config';
import { PeriodIntervals, POSItemType, EnumSaleStatusType, EnumBookingStatusType, ENU_Package, ENU_DateFormatName, EnumServiceBookingStatusOptions, EnumServiceBookingStatusType, ENU_CancelItemType, EnumSaleType, ENU_Action_ActivityType, ENU_PaymentActionType, CustomerType } from 'src/app/helper/config/app.enums';
import { DateTimeService } from 'src/app/services/date.time.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { Messages } from 'src/app/helper/config/app.messages';
import { SchedulerServicesApi, SchedulerApi, RescheduleBookingApi, SaleApi } from 'src/app/helper/config/app.webapi';
import { debounceTime } from 'rxjs/internal/operators';

/** Shared Components */
import { DatePipe } from '@angular/common';
import { RedeemMembershipComponent } from 'src/app/shared/components/redeem-membership/redeem.membership.component';
import { FillFormComponent } from 'src/app/shared/components/fill-form/fill.form.component';
import { ViewFormComponent } from 'src/app/shared/components/forms/view/view.form.component';
import { OneDaySchedulerComponent } from 'src/app/shared/components/scheduler/one.day.scheduler.component';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from 'src/app/helper/config/app.module.page.enums';
import { RescheduleBookingComponent } from 'src/app/shared/components/reschedule-booking/reschedule.booking.component';


// #endregion

@Component({
    selector: 'reschedule-service',
    templateUrl: './reschedule-service.component.html'
})

export class RescheduleServiceComponent extends AbstractGenericComponent implements OnChanges {

    // #region Local Members

    /** Decorators */
    @ViewChild('onedaySchedulerComp') onedaySchedulerComp: OneDaySchedulerComponent;
    @ViewChild('serviceFormData') serviceFormData: NgForm;
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
    @Output() onUpdateSchedulerService = new EventEmitter<SchedulerServiceModel>();
    @Output() onReloadScheduler = new EventEmitter<boolean>();
    @Output() onCancel = new EventEmitter<boolean>();
    @Input() serviceComponentCalled: boolean = false;
    @Input() _cellDataSelection: CellSelectedData;

    /** Local Variables */
    currentDate: Date;
    selectedDurationValue: number = 0;
    selectedServiceName: string;
    getServiceFundamentalList: any;
    serviceFormInstance: any;
    selectedService: any = [];
    selectedStaffID: number;
    activeTab: string;
    showBlockTimeTab = false;
    showServiceTab = true;
    addBlockTime = false;
    isAddNewClient = false;
    isLoadOneDaySchecduler: boolean = false;
    dayViewFormat: string = "";
    customerMembershipId: number;
    isShowError: boolean;
    isDateTimeEventChange: boolean = true;
    isChangeServicePackage: boolean = false;
    disableServiceSelection: boolean = true;
    isClientReadonly: boolean = false;
    hideSaveButton: boolean = false;
    isChangeStartDateEvent: boolean = true;
    isNewServicePrice: boolean = false;
    currencyFormat: string;
    hasFacilityInPackage: boolean = false;
    hasItemLevelRemainingSession: boolean = false;
    serviceGlobalRemainingSession?: number = 0;
    membershipEndDate: any;
    isRewardProgramInPackage: boolean = false;
    oldCustomerMembershipID: number;
    TotalEarnedRewardPoints: number = 0;
    servicePackageIsFree: boolean = false;
    newSelectedServicePrice: number;
    hasMemberhsip: boolean;

    isPurchaseRestrictionAllowed :boolean = false;
    /** Models */

    selectedClient: ServiceClient = new ServiceClient();
    searchClientControl: FormControl = new FormControl();
    deleteServiceModel: DeleteServiceModel = new DeleteServiceModel();
    saveServicesModel: SchedulerServiceModel = new SchedulerServiceModel();
    copySaveServiceModel: SchedulerServiceModel = new SchedulerServiceModel();
    newClientID: number = 0;
    updateServiceStatusModel: UpdateSaleServiceStatusModel = new UpdateSaleServiceStatusModel();
    UpdateSaleServiceStatusModel: UpdateSaleServiceStatusModel = new UpdateSaleServiceStatusModel();

    /** Lists */
    ServicePackageList: SchedulerServicesPackage[] = [];
    durationTypeList: any[] = [];
    StaffList: any[] = [];
    FacilityList: any[] = [];
    serviceList: any[] = [];
    clientList: ServiceClient[];
    posCartItems: POSCartItem[] = [];
    customerMemberhsip: CustomerMembership[];
    customerMembershipList: Array<CustomerMembership> = [];
    serviceBenefitsPackage: ServiceBenefitsPackage[];
    serviceBenefitsDetail: ServiceBenefitsPackage[];
    remainingSessionDetail: RemainingSessionDetail[] = [];


    /** Messages, Constants & Configurations */
    private schedulerStaticStrings = new SchedulerOptions();
    packageIdSubscription: SubscriptionLike;
    customerMemberhsipSubscription: SubscriptionLike;
    messages = Messages;
    package = ENU_Package;
    dateFormat = Configurations.DateFormat;
    datetimeFormat = Configurations.DateTimeFormat;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    timeFormat = Configurations.TimeFormatView;
    timeFormatDifference = Configurations.TimeFormat;
    SchedulerStartDayHour = SchedulerOptions.SchedulerStartDayHour;
    cleanupTimeText: string = SchedulerOptions.ServiceCleanupTimeText;
    endTimeText: string = SchedulerOptions.ServiceEndTimeText;
    schedulerOptions = SchedulerOptions;
    periodIntervals = PeriodIntervals;
    deleteDialogRef: any;
    enumSaleStatusType = EnumSaleStatusType;
    enumBookingStatusType = EnumBookingStatusType;
    itemTypes = POSItemType;
    discountType = DiscountType;
    dateTimeType: string = "time";
    differ: any;
    HasForm: boolean = false;
    serviceForms: any;
    allowedPages = {
        viewForm: false
    };
    enumServiceStatusBooked = EnumServiceBookingStatusType;
    checkInDateTimeFormat: string = "";
    dateFormatCheckIn: string = "";
    priceDifference: any = null;
    chargeRefundObj: any = {};
    paymentType = EnumSaleType;
    enumActivityType = ENU_Action_ActivityType;
    rescheduleObj : any = {} ;
    enumPaymentActionType = ENU_PaymentActionType;
    enumCustomerType = CustomerType;

    // #endregion

    /** Constructor */
    constructor(
        private _dateFilter: DatePipe,
        private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _openDialogue: MatDialogService,
        private _taxCalculationService: TaxCalculation,
        public _authService: AuthService,
        private _commonService: CommonService
    ) {
        super();    //implicit call for constructor
        this.saveServicesModel = new SchedulerServiceModel();
        this.saveServicesModel.ServiceBookingList = new Array<ServiceBookingList>();
        this.getCurrentBranchDetail();
        this.checkPackagePermissions();
        this.setPermissions();
    }

    // #region Events

    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            if (branch.BranchTimeFormat12Hours == true) {
                this.timeFormat = Configurations.SchedulerTimeFormatWithFormat;
                this.schedulerTimeFormat = Configurations.SchedulerTimeFormatWithFormat;
            }
            this.currencyFormat = branch.CurrencySymbol;
        }
    }
    ngOnChanges(changes: SimpleChanges): void {

        if (changes.serviceComponentCalled && changes.serviceComponentCalled.currentValue) {
            this.currentDate = new Date(this._cellDataSelection.startDate);
            this.getBranchDatePattern();
            /** bind event for Customer autoComplete */
            this.getSearchCustomer();
            /** empty previous customer selection */
            this.clearCustomer();
            /** get fundamentals & get service */
            this.getFundamentals();
        }
    }

    ngOnDestroy() {
        this.saveServicesModel.ServiceBookingList = [];
        this.serviceFormData.form.reset();
        this.ServicePackageList = [];
        this.serviceList = [];
        this.FacilityList = [];
    }

    onCloseSchedulerServicePopup() {
        this.onCancel.emit(true);
    }

    onServiceChange(e, arrayIndex: number, ServicePackageID: any, isMembershipChange: boolean = false) {
        /** Load duration-package-list against service */
        let selectedServiceId;
        if(isMembershipChange){
           selectedServiceId = e;
        } else {

            selectedServiceId = Number(e.target.value.split(':')[1]);
            this.selectedServiceName = e.target.options[e.target.selectedIndex].text;
        }
        let durationTypeList;
        if(isMembershipChange){
            durationTypeList = this.ServicePackageList.filter(x => x.ServiceID == selectedServiceId);
            durationTypeList = durationTypeList.filter(i => i.ServicePackageID == ServicePackageID);
         } else {
            /** Load duration-package-list against service */
            durationTypeList = this.ServicePackageList.filter(x => x.ServiceID == selectedServiceId);
         }
        // let selectedServiceId = Number(e.target.value.split(':')[1]);
        // let durationTypeList = this.ServicePackageList.filter(x => x.ServiceID == selectedServiceId);
       // this.selectedServiceName = e.target.options[e.target.selectedIndex].text;
        this.selectedService = this.serviceList.filter(x => x.ServiceID == selectedServiceId);
        if (this.selectedService && this.selectedService.length > 0 && !isMembershipChange) {
             /**======added for reschedule calculation===== */
             this.saveServicesModel.ServiceBookingList[arrayIndex].ItemTaxPercentage = this.selectedService[0].ServicePackageList[0].TotalTaxPercentage;
             this.saveServicesModel.ServiceBookingList[arrayIndex].ItemName = this.selectedService[0].ServiceName;
            this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID = this.selectedService[0].ServicePackageList[0].ServicePackageID;
            this.saveServicesModel.ServiceBookingList[arrayIndex].RestrictedCustomerTypeNames = this.selectedService[0].RestrictedCustomerTypeNames;
        } else {
            this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID = ServicePackageID;
        }

        let serviceCount = this.saveServicesModel.ServiceBookingList.filter(x => x.ServiceID == selectedServiceId).length;
        if (serviceCount > 1) {
            this.saveServicesModel.ServiceBookingList[arrayIndex].IsRepeat = true;
        }
        else {
            this.saveServicesModel.ServiceBookingList[arrayIndex].IsRepeat = false;
        }

        if (this.saveServicesModel.ServiceBookingList[arrayIndex].ID > 0) {
            this.saveServicesModel.ServiceBookingList[arrayIndex].HasUnSubmittedForm = this.serviceList.filter(x => x.ServiceID == selectedServiceId)[0].HasForm;
            this.saveServicesModel.ServiceBookingList[arrayIndex].isServiceChange = true;
        } else {
            this.saveServicesModel.ServiceBookingList[arrayIndex].HasForm = this.serviceList.filter(x => x.ServiceID == selectedServiceId)[0].HasForm;
        }
        this.saveServicesModel.ServiceBookingList[arrayIndex].HasAtleastOneMandatoryForm = this.serviceList.filter(x => x.ServiceID == selectedServiceId)[0].HasAtleastOneMandatoryForm;
        this.saveServicesModel.ServiceBookingList[arrayIndex].FormList = [];
        // this.
        this.onServicePackageChange(durationTypeList[0], arrayIndex, ServicePackageID);
    }

    resetMembershipBenefitOnServiceChange(arrayIndex) {
        //reset benefit again when staff change service
        if (this.serviceBenefitsPackage && this.serviceBenefitsPackage.length > 0 && this.remainingSessionDetail && this.remainingSessionDetail.length > 0) {
            this.getMembershipEndDate();
            if (this.saveServicesModel.ServiceBookingList[arrayIndex].ID == 0) {


                this.saveServicesModel.ServiceBookingList[arrayIndex].IsMembershipBenefit = false;
                var newCreatedServices = this.saveServicesModel.ServiceBookingList.filter(s => s.ID == 0);
                let availedItemSession = 0;
                newCreatedServices.forEach(service => {
                    if (service.IsMembershipBenefit && service.ServicePackageID == this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID) {
                        availedItemSession++;
                    }
                });

                if (this.remainingSessionDetail.length > 0) {

                    this.remainingSessionDetail.forEach(rsd => {
                        if (availedItemSession == 0) {

                            rsd.RemainingSession = this.serviceBenefitsPackage.find(sbf => sbf.ItemID == rsd.ItemID).CopyRemainingSession;

                        }
                    });

                    let rsdIndex = this.remainingSessionDetail.findIndex(c => c.ItemID == this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID);
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

                let sbpIndex = this.serviceBenefitsPackage.findIndex(c => c.ItemID == this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID);
                if (sbpIndex >= 0 && this.serviceBenefitsPackage[sbpIndex].RemainingSession && this.serviceBenefitsPackage[sbpIndex].GlobalRemainingSession)
                    this.serviceGlobalRemainingSession = availedGlobalSession > 0 ? this.serviceBenefitsPackage[sbpIndex].GlobalRemainingSession - availedGlobalSession : this.serviceBenefitsPackage[sbpIndex].GlobalRemainingSession;

            }
        }
    }

    onServicePackageChange(packageDetail: SchedulerServicesPackage, arrayIndexx: number, ServicePackageID) {
        if (ServicePackageID) {
            this.updateBenefitsOnDurationvaluechange(ServicePackageID);
        }
        this.isShowError = false;
        this.isDateTimeEventChange = false;
        this.isChangeServicePackage = true;
        let index = this.ServicePackageList.findIndex(fl => fl.ServicePackageID === packageDetail.ServicePackageID);
        let selectedServicePackage = this.serviceBenefitsPackage && this.serviceBenefitsPackage.length > 0 ? this.serviceBenefitsPackage.filter(item => item.ItemID == packageDetail.ServicePackageID && item.CustomerMembershipID == this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID)[0] : undefined;


        ///check membership end date
        this.getMembershipEndDate();
        if (this.checkMemberhsipEndDate(this.saveServicesModel.ServiceBookingList[arrayIndexx].StartDate)) {
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

        /** */
        /**calculate price difference for reschedule (items having sale discount or without sale discount) */
        this.calculateDiscountAmountAndShowDifference();

    }

    resetSelectedServiceBenefit(arrayIndexx: number, packageDetail?: any) {

        let index = this.getServicePackage(arrayIndexx, packageDetail);

        this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID = packageDetail ? packageDetail.ServicePackageID : this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID;
        /* set Memberhisp benefit properties if exist*/
        this.servicePackageIsFree = false; //*for rewardspoints calculation*/
        this.newSelectedServicePrice = this.ServicePackageList[index].TotalPrice; //*for rewardspoints calculation*/
        this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree = false;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit = false;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].IsBenefitsSuspended = null;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession = this.ServicePackageList[index].Price;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].PriceBeforeBenefit = this.ServicePackageList[index].TotalPrice;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].DiscountPercentage = null;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount = 0;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID = this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].ItemDiscountAmount = 0;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalPrice = this.ServicePackageList[index].TotalPrice;
    }

    mapServiceBenefit(arrayIndexx: number, packageDetail?: any, isCheckBenefits: boolean = false) {
        let index = this.getServicePackage(arrayIndexx, packageDetail);
        let selectedServicePackage;
        if (packageDetail) {
            selectedServicePackage = this.serviceBenefitsPackage && this.serviceBenefitsPackage.length > 0 ? this.serviceBenefitsPackage.filter(item => (item.ServiceID == packageDetail.ServiceID) && (item.ItemID == packageDetail.ServicePackageID) && (item.CustomerMembershipID == this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID))[0] : undefined;
        }
        else {
            selectedServicePackage = this.serviceBenefitsPackage && this.serviceBenefitsPackage.length > 0 ? this.serviceBenefitsPackage.filter(item => (item.ServiceID == this.saveServicesModel.ServiceBookingList[arrayIndexx].ServiceID) && (item.ItemID == this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID) && (item.CustomerMembershipID == this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID))[0] : undefined;
        }

        if (isCheckBenefits) {
            if (this.oncheckItemAndGlobalLevelRemaingSession(selectedServicePackage)) {
                this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID = packageDetail ? packageDetail.ServicePackageID : this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID;
                /* set Memberhisp benefit properties if exist*/
                this.servicePackageIsFree = selectedServicePackage.IsFree; //*for rewardspoints calculation*/
                this.newSelectedServicePrice = this.ServicePackageList[index].TotalPrice; //*for rewardspoints calculation*/
                this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree = selectedServicePackage.IsFree;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit = selectedServicePackage.IsFree ? selectedServicePackage.IsFree : selectedServicePackage && !selectedServicePackage.IsFree && selectedServicePackage.DiscountPercentage > 0 ? true : false;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].IsBenefitsSuspended = selectedServicePackage.IsBenefitsSuspended;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession = this.ServicePackageList[index].Price;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].PriceBeforeBenefit = this.ServicePackageList[index].TotalPrice;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].DiscountPercentage = selectedServicePackage.DiscountPercentage;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount = this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit ? this.getDiscountAmount(this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession, selectedServicePackage.DiscountPercentage) : 0;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID = selectedServicePackage.IsFree || selectedServicePackage.DiscountPercentage > 0 ? this.customerMembershipId : null;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].ItemDiscountAmount = this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount > 0 ? this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount : 0;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].RemainingSession = selectedServicePackage.RemainingSession ? selectedServicePackage.RemainingSession : null;

                this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalPrice = this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree ? 0 : this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit && !this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree ? selectedServicePackage.DiscountedPrice : this.ServicePackageList[index].TotalPrice;
            }
        } else {
            this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID = packageDetail ? packageDetail.ServicePackageID : this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID;
            /* set Memberhisp benefit properties if exist*/
            this.servicePackageIsFree = selectedServicePackage.IsFree; //*for rewardspoints calculation*/
            this.newSelectedServicePrice = this.ServicePackageList[index].TotalPrice; //*for rewardspoints calculation*/
            this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree = selectedServicePackage.IsFree;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit = selectedServicePackage.IsFree ? selectedServicePackage.IsFree : selectedServicePackage && !selectedServicePackage.IsFree && selectedServicePackage.DiscountPercentage > 0 ? true : false;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].IsBenefitsSuspended = selectedServicePackage.IsBenefitsSuspended;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession = this.ServicePackageList[index].Price;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].PriceBeforeBenefit = this.ServicePackageList[index].TotalPrice;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].DiscountPercentage = selectedServicePackage.DiscountPercentage;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount = this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit ? this.getDiscountAmount(this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession, selectedServicePackage.DiscountPercentage) : 0;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID = selectedServicePackage.IsFree || selectedServicePackage.DiscountPercentage > 0 ? this.customerMembershipId : null;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].ItemDiscountAmount = this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount > 0 ? this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalDiscount : 0;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].RemainingSession = selectedServicePackage.RemainingSession ? selectedServicePackage.RemainingSession : null;

            this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalPrice = this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree ? 0 : this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit && !this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree ? selectedServicePackage.DiscountedPrice : this.ServicePackageList[index].TotalPrice;
        }

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
    //for staff data chnage on one day scheduler
    onStaffChange(staffID) {
        if (this.onedaySchedulerComp) {
            this.onedaySchedulerComp.getSchedulerByStaff(staffID);
        }
    }

    setPackagePermissions(packageId: number) {
        this.hasFacilityInPackage = false;

        switch (packageId) {
            case this.package.WellnessTop:
            case this.package.Full:
                this.hasFacilityInPackage = true;
                this.isRewardProgramInPackage = true;
                this.isPurchaseRestrictionAllowed = true;
                break;
        }
    }


    startTime_valueChanged($event, servicepackageId, arrayIndex) {

        this.isShowError = false;
        this.saveServicesModel.ServiceBookingList[arrayIndex].showErrorText = false;
        if ($event.value) {
            if (this.isChangeStartDateEvent || $event.previousValue) {
                $event.previousValue = $event.previousValue ? $event.previousValue : this.currentDate;
                if (servicepackageId && servicepackageId > 0) this.isChangeServicePackage = true;
                let getTimeDifference = this._dateTimeService.getTimeDifferenceFromTimeString(this.getTimeFromDate($event.previousValue),
                    this.getTimeFromDate(new Date(this.saveServicesModel.ServiceBookingList[arrayIndex].EndTime)));
                this.saveServicesModel.ServiceBookingList[arrayIndex].EndTime = this._dateTimeService.setTimeInterval(new Date($event.value), getTimeDifference);
                this.setDurationNotesAccordingTime(this.saveServicesModel.ServiceBookingList[arrayIndex]);
                this.setFormAsDirty();
            }
        } else {
            this.saveServicesModel.ServiceBookingList[arrayIndex][this.schedulerStaticStrings.GetSchedulerStaticString.DateTimeCompareError] = Messages.Validation.StartTime_Required;
            this.saveServicesModel.ServiceBookingList[arrayIndex][this.schedulerStaticStrings.GetSchedulerStaticString.ItemDurationNote] = "";
            this.saveServicesModel.ServiceBookingList[arrayIndex].showErrorText = true;
            this.isShowError = true;
            this.serviceFormData.form.markAsDirty();
        }

        /** set Date on Date time */
        if ($event.value) {
            new Date(new Date(this.saveServicesModel.ServiceBookingList[arrayIndex].StartTime).setDate(this.currentDate.getDate()));
            new Date(new Date(this.saveServicesModel.ServiceBookingList[arrayIndex].StartTime).setMonth(this.currentDate.getMonth()));
            new Date(new Date(this.saveServicesModel.ServiceBookingList[arrayIndex].StartTime).setFullYear(this.currentDate.getFullYear()));
        }
    }

    endTime_valueChanged($event, arrayIndex) {

        this.isShowError = false;
        this.saveServicesModel.ServiceBookingList[arrayIndex].showErrorText = false;
        if ($event.value) {
            if (this.isChangeStartDateEvent || $event.previousValue) {
                this.isChangeServicePackage = false;
                this.setDurationNotesAccordingTime(this.saveServicesModel.ServiceBookingList[arrayIndex]);
                this.setFormAsDirty();
            }
        } else {
            this.saveServicesModel.ServiceBookingList[arrayIndex][this.schedulerStaticStrings.GetSchedulerStaticString.DateTimeCompareError] = Messages.Validation.EndTime_Required;
            this.saveServicesModel.ServiceBookingList[arrayIndex][this.schedulerStaticStrings.GetSchedulerStaticString.ItemDurationNote] = "";
            this.saveServicesModel.ServiceBookingList[arrayIndex].showErrorText = true;
            this.isShowError = true;
            this.serviceFormData.form.markAsDirty();
        }
        /** set Date on Date time */
        if ($event.value) {
            new Date(this.saveServicesModel.ServiceBookingList[arrayIndex].EndTime.setDate(this.currentDate.getDate()));
            new Date(this.saveServicesModel.ServiceBookingList[arrayIndex].EndTime.setMonth(this.currentDate.getMonth()));
            new Date(this.saveServicesModel.ServiceBookingList[arrayIndex].EndTime.setFullYear(this.currentDate.getFullYear()));
        }
    }

    onShowHideNotes(value: boolean, arrayIndex) {
        if (value)
            this.saveServicesModel.ServiceBookingList[arrayIndex][this.schedulerStaticStrings.GetSchedulerStaticString.EditNotes] = false;
        else
            this.saveServicesModel.ServiceBookingList[arrayIndex][this.schedulerStaticStrings.GetSchedulerStaticString.EditNotes] = true;
    }

    openSubmitCustomerFormDialog(saleServiceListIndex: number, saleID: number) {


        let param = {
            customerID: this.saveServicesModel.CustomerID == 0 ? this.selectedClient.CustomerID : this.saveServicesModel.CustomerID,
            itemID: this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ServicePackageID,
            itemTypeID: this.itemTypes.Service,
            customerBookingOrSaleDetailID: this.saveServicesModel.ServiceBookingList[saleServiceListIndex].isServiceChange ? 0 : this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ID,
            isSale: this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleID > 0 ? true : false
        }

        this._httpService.get(SchedulerServicesApi.getServicesCustomerForm, param).subscribe((response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
                if (response.Result != undefined) {
                    this.serviceForms = response.Result;
                    var savedCustomerForms = new CustomerFormsInfromation();
                    savedCustomerForms.CustomFormView = new Array<CustomFormView>();
                    response.Result.forEach(form => {
                        savedCustomerForms.CustomFormView.push(form);
                    });

                    savedCustomerForms.isViewForm = false;
                    this.openFormDailog(savedCustomerForms, saleServiceListIndex);
                }
                else {
                    this._messageService.showSuccessMessage(this.messages.Error.There_is_no_form.replace("{0}", "Customer Form"));
                }
            }else{
                this._messageService.showErrorMessage(response.MessageText);
            }
        });
    }

    openServiceEditSubmitCustomerFormDialog(saleServiceListIndex: number) {

        if (this.saveServicesModel.ServiceBookingList[saleServiceListIndex].isServiceChange) {
            this.openSubmitCustomerFormDialog(saleServiceListIndex, this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleID);
        } else {
            const dialogRef = this._openDialogue.open(FillFormComponent, {
                disableClose: true,
                data: {
                    saleDetailOrBookingID: this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ID,
                    customerID: this.saveServicesModel.CustomerID,
                    isSale: this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleID > 0 ? true : false,
                    dialogtype: 'SchedularService'
                }
            });
        }
    }

    openFormDailog(formData: any, index: any) {
        const dialogRef = this._openDialogue.open(ViewFormComponent, {
            disableClose: true,
            data: formData
        });

        dialogRef.componentInstance.onSubmitForms.subscribe((customerForm: any) => {
            // this.serviceForms = customerForm;
            this.saveServicesModel.ServiceBookingList[index].FormList = customerForm && customerForm.length > 0 ? customerForm : [];
        });

    }
    // #endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
        this.dateFormatCheckIn = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.checkInDateTimeFormat = this.dateFormatCheckIn + " | " + this.timeFormat;
        this.isLoadOneDaySchecduler = true;
    }

    resetServiceForm() {
        let addNewServiceObject = new SchedulerServiceModel();
        this.saveServicesModel.ServiceBookingList = [];
        this.setDefaultValueToServiceModel(addNewServiceObject);
        this.saveServicesModel = addNewServiceObject;
    }

    setDefaultValueToServiceModel(addNewServiceObject: SchedulerServiceModel) {

        addNewServiceObject.CustomerID = 0;
        addNewServiceObject.CustomerTypeID = 0;
        addNewServiceObject.CustomerTypeName = "";
        addNewServiceObject.CustomerName = "";
        addNewServiceObject.Email = "";
        addNewServiceObject.Mobile = "";
        let objSaleService = new ServiceBookingList();
        objSaleService.ID = 0;
        objSaleService.ServicePackageID = 0;
        objSaleService.ServiceCategoryID = 0;
        objSaleService.ServiceID = 0;
        objSaleService.SaleSourceTypeID = 1;
        objSaleService.BookingStatusTypeID = 0;
        objSaleService.SaleStatusTypeID = this.enumSaleStatusType.Unpaid;    // default is unpaid
        objSaleService.StartDate = this._cellDataSelection.startDate;
        objSaleService.StartTime = this._dateTimeService.convertDateObjToString(this._cellDataSelection.startDate, this.datetimeFormat);
        objSaleService.EndTime = this._dateTimeService.convertDateObjToString(this._cellDataSelection.endDate, this.datetimeFormat);
        objSaleService.AssignedToStaffID = this._cellDataSelection.StaffID == 0 ? this.selectedStaffID : this._cellDataSelection.StaffID;
        /** If staff hae no permission to do services then stafflist is not filtered so its 0 */
        let setStaffIDWithPermission = this.StaffList.filter(x => x.StaffID == objSaleService.AssignedToStaffID)[0];
        if (!setStaffIDWithPermission) { objSaleService.AssignedToStaffID = 0; }
        objSaleService.FacilityID = this._cellDataSelection.FacilityID && this._cellDataSelection.FacilityID > 0 ? this._cellDataSelection.FacilityID : 0;
        if (this._cellDataSelection.FacilityID) objSaleService.AssignedToStaffID = this.StaffList[0].StaffID;
        objSaleService.CleaningTimeInMinute = 0;
        objSaleService.Description = "";
        objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.ShowDeleteButton] = false;
        addNewServiceObject.ServiceBookingList.push(objSaleService);
        return addNewServiceObject;
    }

    getFundamentals() {
        return this._httpService.get(SchedulerServicesApi.getSchedulerServiceFundamentals)
            .subscribe(data => {
                if (data && data.Result) {
                    this.getResponseServiceFundamentals(data.Result);
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

    getResponseServiceFundamentals(response) {

        this.getServiceFundamentalList = response.ServiceCategoryList && response.ServiceCategoryList.length > 0 ? response.ServiceCategoryList : [];
        this.StaffList = response.StaffList && response.StaffList.length > 0 ? response.StaffList : [];
        this.FacilityList = response.FacilityList && response.FacilityList.length > 0 ? response.FacilityList : [];
        this.selectedStaffID = this.StaffList && this.StaffList.length > 0 ? this.StaffList[0].StaffID : 0;
        this.ServicePackageList = [];

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
        if (this._cellDataSelection.id > 0) {
            this.isChangeStartDateEvent = false;
            this.saveServicesModel.ServiceBookingList = [];
            this.getServiceByID();
            this.isClientReadonly = true; // on update service, client will be readonly mode
        } else {
            this.isChangeStartDateEvent = true;
            this.resetServiceForm();
        }
    }

    showSearchClient() {
        this.clearCustomer();
    }

    getSearchCustomer() {
        this.searchClientControl.valueChanges.pipe(debounceTime(400))
            .subscribe(value => {
                if (value != "" && value != null) {
                    if (value.length > 2) {
                        this.getClientDetails(value);
                    }
                }
                else {
                    this.clearCustomer();
                }
            });
    }

    getClientDetails(searchText: any) {
        if (searchText && searchText != "" && typeof (searchText) === "string") {
            let url = SchedulerApi.getAllCustomer
                .replace("{request}", searchText)
                .replace("{customerTypeID}", "0")
                .replace("{skipWalkedIn}", "false")
                .replace("{isPOSSearch}", "True")
            this._httpService.get(url)
                .subscribe(response => {
                    if (response.Result != null && response.Result.length) {
                        this.clientList = response.Result;
                        /** For getByID set Selected Client Control Value */
                        this.clientList.forEach(client => {
                            client.FullName = client.FirstName + " " + client.LastName;
                        });
                        if (this._cellDataSelection.CustomerID) {
                            this.selectedClient = this.clientList.filter(c => c.CustomerID === this._cellDataSelection.CustomerID)[0];
                        }
                        this.setSelectedNewClient();
                    }
                    else {
                        this.clientList = [];
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                });
        }
    }

    setSelectedNewClient() {
        /** Add New Client */
        if (this.isAddNewClient) {
            this.selectedClient = this.clientList.filter(c => c.CustomerID === this.newClientID)[0];
        }
    }

    clearCustomer() {

        this.clientList = [];
        this.selectedClient = null;
        this.isClientReadonly = false;
        this.customerMembershipList = [];
        this.hasMemberhsip = false;
        if (this.searchClientControl.value) {
            this.searchClientControl.setValue('');
            this.serviceBenefitsDetail = [];
            this.serviceBenefitsPackage = [];
            //added by fahad need to empty this list
            this.remainingSessionDetail = [];
            this.onCustomerDeleteUpdateServicesModel();
        }
    }

    setSelectedCustomer(responseData) {
        /** set value to control on backend & set on front-end with selectedClient
         * Also Trigger the getSearchClient
        */

        /** New changes */

        if (responseData) {
            this.selectedClient = new ServiceClient();
            this.selectedClient.CustomerID = responseData.CustomerID;
            this.selectedClient.CustomerTypeID = responseData.CustomerTypeID;
            this.selectedClient.CustomerTypeName = responseData.CustomerTypeName;
            this.selectedClient.FullName = responseData.CustomerName;
            this.selectedClient.Email = responseData.Email;
            this.selectedClient.Mobile = responseData.Mobile;
            this.selectedClient.IsWalkedIn = responseData.IsWalkedInCustomer;
            this.selectedClient.AllowPartPaymentOnCore = responseData.AllowPartPaymentOnCore;
            if(this.selectedClient.CustomerTypeID == this.enumCustomerType.Member && this.selectedClient.CustomerTypeName == "Member") {
               this.getCustomerMemberhsips(this.selectedClient.CustomerID, 0);
            }
            this.getServiceBenefitsDetail().then(isResolved => {
                if (isResolved) {
                    if (this.serviceBenefitsDetail) {
                        this.serviceBenefitsPackage = this.serviceBenefitsDetail;
                        //added by fahad for change service maintane session
                        this.setItemLevelBenefitCopy();
                    }
                    this.updateServicesBenefitModel();
                }
            });

        }
    }

    setItemLevelBenefitCopy() {
        this.serviceBenefitsPackage.forEach(benefit => {
            benefit.CopyRemainingSession = benefit.RemainingSession;
        });
    }

    displayClientName(user?: ServiceClient): string | undefined {
        return user ? user.FullName : undefined;
    }

    displayClientEmail(val?: ServiceClient): string | undefined {
        return val ? val.Email : undefined;
    }

    displayClientPhone(val?: ServiceClient): string | undefined {
        return val ? val.Mobile : undefined;
    }

    getServiceByID() {
        var customerID = this._cellDataSelection.CustomerID;
        var bookingID = this._cellDataSelection.id;
        var date = this._dateTimeService.convertDateObjToString(this._cellDataSelection.startDate, this.dateFormat);
        this._httpService.get(SchedulerServicesApi.getSaleServiceDetail + customerID + "/" + bookingID + "/" + date)
            .subscribe(
                data => {
                    if (data.Result) {
                        this.saveServicesModel.CustomerID = data.Result.CustomerID;
                        /** set customer part payment allow */
                        this.saveServicesModel.AllowPartPaymentOnCore = data.Result.AllowPartPaymentOnCore;

                        /** set customer */
                        this.setDateAfterGetByID(data.Result);
                        this.setSelectedCustomer(data.Result);

                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service"));
                }
            );
    }

    setDateAfterGetByID(responseData) {

        this.isShowError = false;

        responseData.ServiceBookingList.forEach((getSingleService) => {
            if (getSingleService.ID == this._cellDataSelection.id) {
                let objSaleService = new ServiceBookingList();
                 ///////
                 this.customerMembershipId = getSingleService.CustomerMembershipID;
                 this.oldCustomerMembershipID = this.customerMembershipId;
                 /////
                objSaleService = getSingleService;

                //for multi time zone issue using this method
                getSingleService.StartDate = this._dateTimeService.convertStringIntoDateForScheduler(getSingleService.StartDate);

                objSaleService.StartTime = this._dateTimeService.convertTimeStringToDateTime(getSingleService.StartTime, getSingleService.StartDate);

                objSaleService.EndTime = this._dateTimeService.convertTimeStringToDateTime(getSingleService.EndTime, getSingleService.StartDate);

                objSaleService.TotalPrice = objSaleService.DiscountPrice;

                /** update prices if service is associated with memberhsip benefits */

                objSaleService.PricePerSession = objSaleService.Price;
                objSaleService.RemainingSession = objSaleService.RemainingSession;
                objSaleService.CustomerMembershipID = objSaleService.CustomerMembershipID;
                objSaleService.IsMembershipBenefit = objSaleService.CustomerMembershipID ? true : false;
                /**  */

                this.isNewServicePrice = true;

                objSaleService = this.setDurationNotesAccordingTime(objSaleService, true);

                objSaleService.AssignedToStaffID

                //when user deactivate staff permissions then show old classes staff detail
                if (this.StaffList && this.StaffList.length) {
                    var checkStaffExist = this.StaffList.find(il => il.StaffID == objSaleService.AssignedToStaffID);
                    if (checkStaffExist == null || checkStaffExist == undefined) {
                        this.StaffList.push({
                            StaffID: objSaleService.AssignedToStaffID,
                            StaffFullName: objSaleService.AssignedToStaffName,
                        })
                    }
                }

                /** Enable Service Option Only If service is not paid/completed
                * paid => SaleStatusTypeID = 2 & completed => BookingStatusTypeID = 3 & Noshow => BookingStatusTypeID = 4
                * If BookingStatusTypeID = 3
               */
                objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.OldServiceID] = objSaleService.ServiceID;
                objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.IsPaidService] = objSaleService.SaleStatusTypeID === this.enumSaleStatusType.Paid || objSaleService.SaleStatusTypeID === this.enumSaleStatusType.Refund || objSaleService.SaleStatusTypeName.toString().toLowerCase() === 'partial paid' || objSaleService.BookingStatusTypeID === this.enumBookingStatusType.NoShow ? true : false;
                objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.IsCompletedService] = objSaleService.BookingStatusTypeID === this.enumBookingStatusType.Attended || objSaleService.BookingStatusTypeID === this.enumBookingStatusType.NoShow ? true : false;
                objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.SelectedForCheckout] = objSaleService.SaleStatusTypeID === this.enumSaleStatusType.Unpaid ? true : false;

                this.saveServicesModel.ServiceBookingList.push(objSaleService);
            }
        });

        this.copySaveServiceModel.ServiceBookingList = JSON.parse(JSON.stringify(this.saveServicesModel.ServiceBookingList));
    }

    setDurationNotesAccordingTime(objSaleService: ServiceBookingList, isServiceGetByID?): ServiceBookingList {
        let selectedPackage = JSON.parse(JSON.stringify(this.ServicePackageList.find((item: any) => item.ServicePackageID == objSaleService.ServicePackageID)));

        this.selectedDurationValue = selectedPackage.DurationValue;
        this.selectedService = this.serviceList.filter(x => x.ServiceID == objSaleService.ServiceID);
        objSaleService.Price = objSaleService.IsMembershipBenefit ? objSaleService.Price : selectedPackage.Price;

        //forms implimantion
        objSaleService.HasForm = this.selectedService[0].HasForm;
        objSaleService.HasAtleastOneMandatoryForm = this.selectedService[0].HasAtleastOneMandatoryForm;

        // if service unpaid or created assigned total price from selectedPackage other wise total price added from objSaleService implementation chnaged after partial payment show full price include tax
        if (objSaleService.SaleStatusTypeID === this.enumSaleStatusType.Unpaid && objSaleService.SaleStatusTypeName && objSaleService.SaleStatusTypeName.toString().toLowerCase() === 'unpaid') {
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

    onSelectDate_valueChanged(itemIndex, serviceBookingDate) {

        this.serviceFormData.form.markAsDirty();
        let enableForm = true;
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
            enableForm ? this.setFormAsDirty() : false;
            if (this.saveServicesModel.ServiceBookingList[itemIndex].BookingStatusTypeID === this.enumBookingStatusType.Attended || this.saveServicesModel.ServiceBookingList[itemIndex].BookingStatusTypeID === this.enumBookingStatusType.NoShow) {
                //** donot enable form to save in such case. */
                enableForm = false;
                // }
            }

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
                            item.SaleStatusTypeID = this.enumSaleStatusType.PartialPaid;
                        }

                    });

                    this.saveServicesModel.ServiceBookingList.forEach(item => {
                        var _startDate = new Date(item.StartDate);
                        item.StartDate = new Date(Date.UTC(_startDate.getFullYear(), _startDate.getMonth(), _startDate.getDate(), _startDate.getHours(), _startDate.getMinutes()))
                    });

                    let copyAddEditServiceModel = JSON.parse(JSON.stringify(this.saveServicesModel));
                    let serviceToSave = this.submitDirtFormOnly(copyAddEditServiceModel);
                    this.validateSelectedService(copyAddEditServiceModel);
                    this.onUpdateSchedulerService.emit(serviceToSave);
                    //this.onCloseSchedulerServicePopup();
                }
            } else {
                this.searchClientControl.setValue('');
            }
        }
        else {
            this.searchClientControl.setValue('');
        }
    }

    submitDirtFormOnly(orignalServiceBookingList) {

        /** HardCoded the properties that have been assigned while validateOnSubmit */
        this.copySaveServiceModel.ServiceBookingList.forEach(element => {
            if (element.FacilityID === 0) element.FacilityID = null;
            element.showErrorText = false;
            element.SaleSourceTypeID = 1;
        });

        let newServiceList = orignalServiceBookingList.ServiceBookingList,
            copyServiceList = this.copySaveServiceModel.ServiceBookingList;
        for (let index = 0; index < newServiceList.length; index++) {
            const newElement = JSON.stringify(newServiceList[index]), copyElement = JSON.stringify(copyServiceList[index]);
            if (newElement === copyElement) {
                orignalServiceBookingList.ServiceBookingList.splice(index, 1);
            }
        }
        return orignalServiceBookingList;
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


    getserviceBookingListForCheckout(data: ServiceBookingList[], ID: number): ServiceBookingList[] {
        var _serviceBookingListForCheckout = new Array<ServiceBookingList>();


        return _serviceBookingListForCheckout;

    }

    setClient(clientId: number, clientName: string) {

        setTimeout(() => {
            this.searchClientControl.setValue(clientName);
            this.searchClientControl.updateValueAndValidity();
        })

        setTimeout(() => {
            this.selectedClient = this.clientList.filter(c => c.CustomerID === clientId)[0];
        }, 1000);
    }

    setClientByEmail(clientEmail: string) {
        setTimeout(() => {
            this.searchClientControl.setValue(clientEmail);
            this.searchClientControl.updateValueAndValidity();
        })

        setTimeout(() => {
            this.selectedClient = this.clientList.filter(c => c.Email === clientEmail)[0];
        }, 1000);
    }

    validateSelectedService(copyAddEditServiceModel) {

        copyAddEditServiceModel.ServiceBookingList.forEach(item => {
            let splitOnlyDatePart: any = null;
            /** Newly Created Service is Booked and Unpaid by default */
            if (item.ID == 0) {
                item.BookingStatusTypeID = this.enumBookingStatusType.Booked;
                item.SaleStatusTypeID = EnumSaleStatusType.Unpaid;
            }
            if (item.StartDate.toString().includes('Z') > 0) {
                splitOnlyDatePart = item.StartDate.split('Z')[0];
            }
            if (item.StartDate.toString().includes('+') > 0) {
                splitOnlyDatePart = item.StartDate.split('+')[0];
            }

            if (item.StartDate.toString().includes('T') > 0) {
                splitOnlyDatePart = item.StartDate.split('T')[0];
            }

            item.StartDate = this._dateTimeService.convertDateObjToString(splitOnlyDatePart, this.dateFormat);
            item.StartTime = this._dateTimeService.convertDateToTimeString(new Date(item.StartTime));
            item.EndTime = this._dateTimeService.convertDateToTimeString(new Date(item.EndTime));
        });
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

    setServiceCompleteUrlParams(saleId: number, saleDetalorBookingId: number): Object {
        let params = {
            SaleId: null,
            DetailId: null
        };

        params.SaleId = saleId
        params.DetailId = saleDetalorBookingId;

        return params
    }

    hideDeleteButton(arrayIndex) {

        if (arrayIndex == 0)
            return true;
        else return false;
    }

    setFormAsDirty() {

        super.markFormAsDirty(this.serviceFormData);
    }


    getTimeFromDate(date: Date) {
        return this._dateTimeService.getTimeStringFromDate(date);
    }



    getTotalDiscount(item: any) {
        if (item.IsMembershipBenefit && item.IsFree && !item.IsBenefitsSuspended) {
            return (item.PricePerSession);
        }
        else if (item.IsMembershipBenefit && !item.IsFree && !item.IsBenefitsSuspended) {
            return ((item.PricePerSession * item.DiscountPercentage) / 100);
        }
        else {
            return 0;
        }
    }



    onCustomerDeleteUpdateServicesModel() {
        let servicePackageIdList: any;
        this.saveServicesModel.ServiceBookingList.forEach(element => {
            servicePackageIdList += element.ServicePackageID > 0 ? element.ServicePackageID + ',' : null;
            let index = this.ServicePackageList.findIndex(fl => fl.ServicePackageID === element.ServicePackageID);
            if (index >= 0) {
                /* set Memberhisp benefit properties if exist*/
                element.IsFree = false;
                element.IsMembershipBenefit = false;
                element.PricePerSession = this.ServicePackageList[index].Price;
                element.CustomerMembershipID = null;

                element.DiscountPercentage = null;
                element.ItemDiscountAmount = null;
                element.PriceBeforeBenefit = this.ServicePackageList[index].TotalPrice;

                element.IsBenefitsSuspended = false;
                element.TotalPrice = this.ServicePackageList[index].TotalPrice;
            }
        });
    }

    // #endregion


    // #region Memberhsip Benefits

    oncheckItemLevelRemaingSession(cartItem: any): boolean {
        if (this.remainingSessionDetail.length > 0) {
            let sessionDetail = new RemainingSessionDetail();
            sessionDetail = this.remainingSessionDetail.filter(c => c.ItemID === cartItem.ServicePackageID)[0];
            if ((sessionDetail == undefined) || (sessionDetail.IsMembershipBenefit && sessionDetail.RemainingSession && sessionDetail.RemainingSession > 0)) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }

    getRedeemMembershipBenefits() {
        if (this.customerMemberhsipSubscription) {
            this.customerMemberhsipSubscription.unsubscribe();
        }
        const dialogRef = this._openDialogue.open(RedeemMembershipComponent, {
            disableClose: true,
            data: this.customerMemberhsip
        })

        this.customerMemberhsipSubscription = dialogRef.componentInstance.membershipSelected.subscribe((customerMembershipId: number) => {
            if (customerMembershipId && customerMembershipId > 0) {
                this.customerMembershipId = customerMembershipId;
                this.serviceBenefitsPackage = this.serviceBenefitsDetail.filter(item => item.CustomerMembershipID == this.customerMembershipId);
                this.getMembershipEndDate();
                let serviceSessoin = this.serviceBenefitsPackage.filter(c => c.GlobalRemainingSession && c.GlobalRemainingSession > 0)[0];

                if (serviceSessoin) {
                    this.serviceGlobalRemainingSession = serviceSessoin.GlobalRemainingSession ? serviceSessoin.GlobalRemainingSession : null;
                }
                this.updateServicesBenefitModel();
            }
            else {
                this.customerMembershipId = null;
            }
        });
    }

    getMembershipEndDate() {

        this.membershipEndDate = this.customerMembershipId ? this.serviceBenefitsDetail.filter(id => id.CustomerMembershipID == this.customerMembershipId)[0]?.MembershipEndDate : null;
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

    getServiceBenefitsDetail() {
        return new Promise<boolean>((resolve, reject) => {
            let url = SchedulerServicesApi.getServiceBenefitsDetail
                .replace("{customerID}", this.selectedClient.CustomerID.toString())
                .replace("{serviceDate}", this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat));

            this._httpService.get(url).subscribe((response) => {
                if (response && response.MessageCode > 0) {
                    this.customerMemberhsip = response.Result.CustomerMemberships;
                    this.serviceBenefitsDetail = response.Result.ServiceBenefitsDetail;
                    this.getMembershipEndDate();
                    resolve(true);
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            });
        });
    }

    getGlobalSession(serviceBenefitsPackage?: ServiceBenefitsPackage) {
        if (serviceBenefitsPackage) {
            let serviceSessoin = this.serviceBenefitsPackage.filter(c => c.GlobalRemainingSession && c.GlobalRemainingSession > 0)[0];
            if (serviceBenefitsPackage) {
                this.serviceGlobalRemainingSession = serviceBenefitsPackage.GlobalRemainingSession;
            }
            else {
                if (serviceSessoin) this.serviceGlobalRemainingSession = serviceSessoin.GlobalRemainingSession;
            }
        }
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

    checkPackagePermissions() {
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPackagePermissions(packageId);
            }
        })
    }

    setPermissions() {
        this.allowedPages.viewForm = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.ViewForm);
        this.allowedPages.viewForm = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.ViewForm);
    }

    checkItemAssociationWithMemberhisp(cartItem: any): boolean {
        if (!cartItem.IsBenefitsSuspended) {
            return true;
        }
        else {
            return false;
        }
    }

    updateBenefitsOnDurationvaluechange(defaultValue: any) {

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

    updateGlobalSession() {
        this.serviceGlobalRemainingSession = this.serviceGlobalRemainingSession + 1;
    }
    decreaseItemSession(index: number) {
        this.remainingSessionDetail[index].RemainingSession = this.remainingSessionDetail[index].RemainingSession - 1;
    }
    increaseItemSession(index: number) {
        this.remainingSessionDetail[index].RemainingSession = this.remainingSessionDetail[index].RemainingSession + 1;
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



    pushIntoItemLevelSessinArray(selectedItem): boolean {
        let sesstionDetail = new RemainingSessionDetail();
        sesstionDetail.ItemID = selectedItem.ItemID;
        sesstionDetail.ItemTypeID = 2;
        sesstionDetail.AllowedSession = selectedItem.RemainingSession;
        sesstionDetail.RemainingSession = selectedItem.RemainingSession == null ? null : selectedItem.RemainingSession == 0 ? 0 : selectedItem.RemainingSession - 1;
        this.remainingSessionDetail.push(sesstionDetail);
        return selectedItem.RemainingSession == null ? true : selectedItem.RemainingSession > 0 ? true : false;

    }



    updateServicesBenefitModel() {
        let servicePackageIdList: any;

        if (this.serviceBenefitsPackage) {

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
                    let selectedServicePackage = this.serviceBenefitsPackage && this.serviceBenefitsPackage.length > 0 ? this.serviceBenefitsPackage.filter(item => item.ItemID == element.ServicePackageID && item.CustomerMembershipID == element.CustomerMembershipID)[0] : undefined;
                  //  element.CustomerMembershipID = selectedServicePackage.CustomerMembershipID ? selectedServicePackage.CustomerMembershipID : null;
                    if (((element.CustomerMembershipID && this.checkItemAssociationWithMemberhisp(selectedServicePackage)) && this.oncheckItemAndGlobalLevelRemaingSession(selectedServicePackage)) || (element.ID > 0 && element.IsMembershipBenefit)) {
                        element.IsMembershipBenefit = true;
                        element.CustomerMembershipID = selectedServicePackage.CustomerMembershipID;
                        element.PricePerSession = this.ServicePackageList[index].Price;
                        element.PriceBeforeBenefit = element.TotalPrice;
                           /**Below line of code commented to display "DiscountPrice" column if service has sale level/POS discount  */
                        //// element.TotalPrice = selectedServicePackage.IsFree ? 0 : selectedServicePackage.DiscountedPrice;
                        if(element.DiscountPrice && element.DiscountPrice != undefined) {
                            /*"DiscountPrice" is being used in cancellation/noshow/ calculation. DiscountPrice contains sales discount as well
                           while "DiscountedPrice" is just benefited price*/
                            element.TotalPrice = element.IsFree ? 0 : element.IsMembershipBenefit && !element.IsFree ? element.DiscountPrice : element.TotalPrice;
                           } else {
                            element.TotalPrice = selectedServicePackage.IsFree ? 0 : element.IsMembershipBenefit && !element.IsFree ? selectedServicePackage.DiscountedPrice : element.TotalPrice;
                           }


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
                    element.TotalPrice = element.IsMembershipBenefit && (element.ItemDiscountAmount && element.ItemDiscountAmount == element.Price) ? 0 : element.TotalPrice;
                }



            }
        });
    }

    getDiscountAmount(price: number, discountPercentage: number) {
        return this._taxCalculationService.getTwoDecimalDigit(((price * discountPercentage) / 100));
    }


    roundValue(value: any) {
        return this._taxCalculationService.getRoundValue(value);
    }

    /*service booking statuses */
    /* Service booking status dropdown options*/
    bookingStatusOptions = [
        { BookingStatusTypeID: EnumServiceBookingStatusType.Booked, BookingStatusTypeName: EnumServiceBookingStatusOptions.Booked },
        { BookingStatusTypeID: EnumServiceBookingStatusType.NotConfirmed, BookingStatusTypeName: EnumServiceBookingStatusOptions.NotConfirmed },
        { BookingStatusTypeID: EnumServiceBookingStatusType.Confirmed, BookingStatusTypeName: EnumServiceBookingStatusOptions.Confirmed },
        { BookingStatusTypeID: EnumServiceBookingStatusType.CheckedInByStaff, BookingStatusTypeName: EnumServiceBookingStatusOptions.CheckedInByStaff },
        { BookingStatusTypeID: EnumServiceBookingStatusType.ReadyToStart, BookingStatusTypeName: EnumServiceBookingStatusOptions.ReadyToStart },
        { BookingStatusTypeID: EnumServiceBookingStatusType.NoShow, BookingStatusTypeName: EnumServiceBookingStatusOptions.NoShow },
        { BookingStatusTypeID: EnumServiceBookingStatusType.InProgress, BookingStatusTypeName: EnumServiceBookingStatusOptions.InProgress },
        { BookingStatusTypeID: EnumServiceBookingStatusType.Completed, BookingStatusTypeName: EnumServiceBookingStatusOptions.Completed },
        { BookingStatusTypeID: EnumServiceBookingStatusType.Cancelled, BookingStatusTypeName: EnumServiceBookingStatusOptions.Cancelled }
    ];

/** For NoChange case (If user changes start/end time, facility or staff or date) */
mapRescheduleData(serviceDetail){
    let rescheduleBookingData = new RescheduleBooking();
    rescheduleBookingData.PaymentGatewayID = this.paymentType.Cash;
    rescheduleBookingData.CustomerID = this.selectedClient.CustomerID;
    rescheduleBookingData.ActivityType = this.enumActivityType.Reschedule;
    rescheduleBookingData.SaleID = serviceDetail.SaleID > 0 ? serviceDetail.SaleID : null;
    rescheduleBookingData.SaleDetailID = serviceDetail.SaleID > 0 ? serviceDetail.ID : null,
    rescheduleBookingData.CustomerBookingID = serviceDetail.SaleID == null ? serviceDetail.CustomerBookingID : null;
    rescheduleBookingData.IsRefundNow = false;
    rescheduleBookingData.IsChargeNow = false;
    rescheduleBookingData.ItemTypeID = ENU_CancelItemType.Service;
    rescheduleBookingData.ItemID = this.copySaveServiceModel.ServiceBookingList[0].ServicePackageID;
    rescheduleBookingData.SaleTypeID = this.paymentType.Cash;
    rescheduleBookingData.NewItemID = serviceDetail.ServicePackageID;
    rescheduleBookingData.NewStartDate = new Date(this._dateTimeService.convertDateObjToStringNotChangeDate(new Date(serviceDetail.StartDate), "YYYY-MM-DD"));
    rescheduleBookingData.NewStartTime = this.getTimeStringFromDate(serviceDetail.StartTime, Configurations.SchedulerTimeFormat);
    rescheduleBookingData.NewEndTime = this.getTimeStringFromDate(serviceDetail.EndTime, Configurations.SchedulerTimeFormat);
    rescheduleBookingData.CustomerMembershipID = !serviceDetail.IsBenefitConsumed && !serviceDetail.IsBenefitsSuspended && serviceDetail.IsMembershipBenefit ? serviceDetail.CustomerMembershipID : null;
    // send opposite value of benefit consumed button as per discussion with faisal and ali
    rescheduleBookingData.IsBenefitConsumed = serviceDetail.IsServiceRescheduleBenefit == true ? false : true;
    //In case of equal Amount calculateRefundorCharge return IsRefund and Amount Null so we set the Action Type No Change and ChargesAmount 0
    rescheduleBookingData.ActionType = this.enumPaymentActionType.NoChange;
    rescheduleBookingData.ChargesAmount =  0;
    /** Only For service send FacilityID, Notes, StaffID */
    rescheduleBookingData.StaffID = serviceDetail.AssignedToStaffID;
    rescheduleBookingData.FacilityID = serviceDetail.FacilityID;
    rescheduleBookingData.Notes = serviceDetail.Description;
    rescheduleBookingData.PaymentReferenceNo =  null;
    /** "TotalAjustment" added asked by Faisal/Ali on 04-03-2022 */
    rescheduleBookingData.TotalAjustment = serviceDetail.TotalAdjustment;
    rescheduleBookingData.paymentModes = [];
    return rescheduleBookingData;
   }


   rescheduleService(serviceDetail: any, isvalid: boolean) {
    isvalid = this.validateFormOnSubmit();
    if(!isvalid) { return }
        /////if a service has a sale discount then calculate
        var newCalculatedDiscountAmount = 0;
     //   if(this.copySaveServiceModel.ServiceBookingList[0].CustomerMembershipID !== serviceDetail.CustomerMembershipID || this.copySaveServiceModel.ServiceBookingList[0].ServiceID !== serviceDetail.ServiceID || this.copySaveServiceModel.ServiceBookingList[0].ServicePackageID !== serviceDetail.ServicePackageID || serviceDetail.SaleStatusTypeID == EnumSaleStatusType.PartialPaid) {


            if(!serviceDetail.IsBenefitsSuspended && serviceDetail.IsMembershipBenefit && serviceDetail.IsFree){
                newCalculatedDiscountAmount = 0;
                newCalculatedDiscountAmount = this.getItemTotalDiscountedPrice(newCalculatedDiscountAmount, serviceDetail.SaleDiscountPerItemPercentage);
                var itemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(serviceDetail.ItemTaxPercentage, newCalculatedDiscountAmount) * 1);
                newCalculatedDiscountAmount = this._taxCalculationService.getRoundValue( Number(newCalculatedDiscountAmount) + itemTotalTaxAmount);
            }
            else if(!serviceDetail.IsBenefitsSuspended && serviceDetail.IsMembershipBenefit && serviceDetail.DiscountPercentage && serviceDetail.DiscountPercentage > 0){
                newCalculatedDiscountAmount = this.getItemTotalDiscountedPrice(serviceDetail.PricePerSession, serviceDetail.DiscountPercentage);

                newCalculatedDiscountAmount = this.getItemTotalDiscountedPrice(newCalculatedDiscountAmount, serviceDetail.SaleDiscountPerItemPercentage);
                var itemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(serviceDetail.ItemTaxPercentage, newCalculatedDiscountAmount) * 1);
                newCalculatedDiscountAmount = this._taxCalculationService.getRoundValue( Number(newCalculatedDiscountAmount) + itemTotalTaxAmount);
            } else {
                newCalculatedDiscountAmount = this.getItemTotalDiscountedPrice(serviceDetail.PricePerSession, serviceDetail.SaleDiscountPerItemPercentage);
                var itemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(serviceDetail.ItemTaxPercentage, newCalculatedDiscountAmount) * 1);
                newCalculatedDiscountAmount = this._taxCalculationService.getRoundValue(Number(newCalculatedDiscountAmount) + itemTotalTaxAmount);
            }

            /**For reward points calculation */
            if(this.isRewardProgramInPackage) {
                this._commonService.getItemRewardPoints(ENU_CancelItemType.Service, serviceDetail.ServiceID, this.selectedClient.CustomerID, this.servicePackageIsFree, false, this.customerMembershipId && this.customerMembershipId > 0 ? true : false).subscribe((response: any) => {

                        let cartItem: POSCartItem = new POSCartItem();
                        cartItem.AmountSpent = response.Result?.AmountSpent;
                        cartItem.MemberBaseEarnPoints = response.Result.MemberBaseEarnPoints ? response.Result.MemberBaseEarnPoints : 0;
                        cartItem.CustomerEarnedPoints = response.Result.CustomerEarnedPoints ? response.Result.CustomerEarnedPoints : 0;
                        cartItem.DiscountPercentage = serviceDetail.DiscountPercentage;
                        cartItem.IsConsumed = false;
                        cartItem.IsMembershipBenefit = (this.customerMembershipId && this.customerMembershipId > 0) ? true : false;
                        cartItem.IsBenefitsSuspended = serviceDetail.IsBenefitsSuspended;
                        cartItem.ItemTypeID = POSItemType.Service;
                        cartItem.TotalAmountIncludeTax = this.newSelectedServicePrice;
                        this.TotalEarnedRewardPoints = this._commonService.calculateRewardPointsPerItem(this.selectedClient, cartItem);

                   this.openPaymentPopup(serviceDetail, newCalculatedDiscountAmount);
                })
            } else{
                this.TotalEarnedRewardPoints = null;
                this.openPaymentPopup(serviceDetail, newCalculatedDiscountAmount)
            }
       // }
        // else {

        //     let rescheduleBookingData = this.mapRescheduleData(serviceDetail);

        //     this._httpService.save(RescheduleBookingApi.saveReschedule, rescheduleBookingData)
        //         .subscribe(async (response: ApiResponse) => {
        //             if (await response && response.MessageCode > 0) {
        //                 this._messageService.showSuccessMessage(this.messages.Success.Booking_Reschedule_Successfully.replace("{0}", "Service"));
        //                 this.onReloadScheduler.emit(true);
        //                 this.onCloseSchedulerServicePopup();

        //             }
        //             else {
        //                 this._messageService.showErrorMessage(response.MessageText);
        //             }
        //             error => {
        //                 this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Reschedule Service"))
        //             }
        //         });
        // }
    }

    openPaymentPopup(serviceDetail, newCalculatedDiscountAmount){
        let dialogRef = this._openDialogue.open(RescheduleBookingComponent, {
            disableClose: true,
            data: {
                OldTotalDue: serviceDetail.SaleTotalPrice,
                AmountPaid: serviceDetail.TotalAmountPaid,
                CancellationCharges: newCalculatedDiscountAmount, //serviceDetail.TotalPrice,
                //"ItemDiscountedPrice" changed asked by Faisal 03-03-2022 for noShow/Cancellation and Reschedule
                ItemDiscountedPrice:  this.copySaveServiceModel.ServiceBookingList[0].DiscountPrice,  //this.copySaveServiceModel.ServiceBookingList[0].TotalPrice,//"ItemDiscountedPrice" changed asked by Faisal 03-03-2022 for noShow/Cancellation
                CustomerID: this.selectedClient.CustomerID,
                CustomerTypeID: this.selectedClient.CustomerTypeID,
                SaleID: serviceDetail.SaleID > 0 ? serviceDetail.SaleID : null,
                SaleDetailID: serviceDetail.SaleID > 0 ? serviceDetail.ID : null,
                ItemID: this.copySaveServiceModel.ServiceBookingList[0].ServicePackageID,
                CancelbookingType: ENU_CancelItemType.Service,
                NewItemID: serviceDetail.ServicePackageID,
                NewStartDate: this._dateTimeService.convertDateObjToStringNotChangeDate(new Date(serviceDetail.StartDate), "YYYY-MM-DD"),
                newItemName: serviceDetail.ItemName ? serviceDetail.ItemName : this.copySaveServiceModel.ServiceBookingList[0].ItemName,
                newItemPricePerSesion: serviceDetail.PricePerSession,
                NewStartTime: this.getTimeStringFromDate(serviceDetail.StartTime, Configurations.SchedulerTimeFormat),
                NewEndTime: this.getTimeStringFromDate(serviceDetail.EndTime, Configurations.SchedulerTimeFormat),
                //check if cutomer membership > 0 but selected service not in benefit then set CustomerMembershipID null
                CustomerMembershipID: !serviceDetail.IsBenefitConsumed && !serviceDetail.IsBenefitsSuspended && serviceDetail.IsMembershipBenefit ? serviceDetail.CustomerMembershipID : null,
                IsShowReturnBenefitToggle: this.oldCustomerMembershipID && this.oldCustomerMembershipID > 0 ? true : false,
                StaffID: serviceDetail.AssignedToStaffID,
                FacilityID: serviceDetail.FacilityID,
                Notes: serviceDetail.Description,
                ClassRescheduleBenefit:serviceDetail.IsServiceRescheduleBenefit,
                TotalEarnedRewardPoints: this.TotalEarnedRewardPoints,
                TotalAdjustment : serviceDetail.TotalAdjustment,
                DiscountType: (this.customerMembershipList && this.saveServicesModel.ServiceBookingList[0].CustomerMembershipID > 0)  ? this.customerMembershipList.filter(x => x.CustomerMembershipID === this.saveServicesModel.ServiceBookingList[0].CustomerMembershipID)[0].MembershipName : ''
            }

        });
        dialogRef.componentInstance.isConfirm.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                this.onReloadScheduler.emit(true);
                this.onCloseSchedulerServicePopup();
            }
        });
    }


    /*Calculate service price difference*/
    calculatePriceDifference(oldTotalDue, amountPaid, newItemPrice, itemPrice) {
        this.chargeRefundObj = this._commonService.calculateRefundorCharge(oldTotalDue, amountPaid, newItemPrice, itemPrice, false);
        return this.chargeRefundObj
    }

     /**calculate DiscountAmount that includes sale dicount as well And Show price Difference i-e (charge/Refund).
     * call "calculateDiscountAmountAndShowDifference" function. This function is being used in HTML template as well.
     * we will consider "Reschedule" even staff changes only staff or date or time or facility
     */
    calculateDiscountAmountAndShowDifference (mapServiceBenefit: boolean = false, arrayIndexx=0) {
        /**In Order to Map benefits call onServiceChange*/
        if (mapServiceBenefit) {
            this.onServiceChange(this.saveServicesModel.ServiceBookingList[arrayIndexx].ServiceID, arrayIndexx, this.saveServicesModel.ServiceBookingList[arrayIndexx].ServicePackageID, true);
        }

        let newCalculatedDiscountAmount;
        if(!this.saveServicesModel.ServiceBookingList[arrayIndexx].IsBenefitsSuspended && this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit && this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree){
            newCalculatedDiscountAmount = 0;
            newCalculatedDiscountAmount = this.getItemTotalDiscountedPrice(newCalculatedDiscountAmount, this.saveServicesModel.ServiceBookingList[arrayIndexx].SaleDiscountPerItemPercentage);
            var itemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(this.saveServicesModel.ServiceBookingList[arrayIndexx].ItemTaxPercentage, newCalculatedDiscountAmount) * 1);
            newCalculatedDiscountAmount = this._taxCalculationService.getRoundValue( Number(newCalculatedDiscountAmount) + itemTotalTaxAmount);
        }
        else if(!this.saveServicesModel.ServiceBookingList[arrayIndexx].IsBenefitsSuspended && this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit && this.saveServicesModel.ServiceBookingList[arrayIndexx].DiscountPercentage && this.saveServicesModel.ServiceBookingList[arrayIndexx].DiscountPercentage > 0){
              newCalculatedDiscountAmount = this.getItemTotalDiscountedPrice(this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession, this.saveServicesModel.ServiceBookingList[arrayIndexx].DiscountPercentage);
            newCalculatedDiscountAmount = this.getItemTotalDiscountedPrice(newCalculatedDiscountAmount, this.saveServicesModel.ServiceBookingList[arrayIndexx].SaleDiscountPerItemPercentage);
            var itemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(this.saveServicesModel.ServiceBookingList[arrayIndexx].ItemTaxPercentage, newCalculatedDiscountAmount) * 1);
            newCalculatedDiscountAmount = this._taxCalculationService.getRoundValue( Number(newCalculatedDiscountAmount) + itemTotalTaxAmount);
        } else {
            newCalculatedDiscountAmount = this.getItemTotalDiscountedPrice(this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession, this.saveServicesModel.ServiceBookingList[arrayIndexx].SaleDiscountPerItemPercentage);
            var itemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(this.saveServicesModel.ServiceBookingList[arrayIndexx].ItemTaxPercentage, newCalculatedDiscountAmount) * 1);
            newCalculatedDiscountAmount = this._taxCalculationService.getRoundValue(Number(newCalculatedDiscountAmount) + itemTotalTaxAmount);
        }


            this.priceDifference = this.calculatePriceDifference(this.saveServicesModel.ServiceBookingList[arrayIndexx].SaleTotalPrice, this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalAmountPaid, newCalculatedDiscountAmount, this.copySaveServiceModel.ServiceBookingList[arrayIndexx].TotalPrice);
    }

    getItemTotalDiscountedPrice(discountedPricePerUnit, saleDiscountPerItemPercentage) {
        if (saleDiscountPerItemPercentage > 0) {
            discountedPricePerUnit -= ((discountedPricePerUnit / 100) * saleDiscountPerItemPercentage);
        }
        return this._taxCalculationService.getRoundValue(discountedPricePerUnit);
        // return discountedPricePerUnit;
    }

    onMembershipChange(event, arrayIndex) {
        this.customerMembershipId = this.saveServicesModel.ServiceBookingList[arrayIndex].CustomerMembershipID;
        this.remainingSessionDetail = [];
        let serviceSessoin = this.serviceBenefitsPackage.filter(c => c.GlobalRemainingSession == null || (c.GlobalRemainingSession && c.GlobalRemainingSession > 0) && c.CustomerMembershipID == this.saveServicesModel.ServiceBookingList[arrayIndex].CustomerMembershipID)[0];

        if (serviceSessoin) {
             this.serviceGlobalRemainingSession = serviceSessoin.GlobalRemainingSession ? serviceSessoin.GlobalRemainingSession : null;
        }
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

    // #endregion


}

