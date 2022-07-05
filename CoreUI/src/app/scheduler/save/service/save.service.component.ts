// #region Imports
/**Angular Modules */
import { Component, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges, Input } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { NgForm, FormControl } from '@angular/forms';
import { forkJoin, SubscriptionLike } from 'rxjs';

/** Model */
import { SchedulerServicesPackage, SchedulerServiceModel, ServiceBookingList, ServiceClient, DeleteServiceModel, ServiceBenefitsPackage, CustomerMembership, UpdateSaleServiceStatusModel, ServiceCancelatinPolicyModel } from '@scheduler/models/service.model';
import { CellSelectedData } from '@scheduler/models/scheduler.model';
import { SaleInvoice, POSCartItem, POSSaleDetail, RemainingSessionDetail } from '@app/point-of-sale/models/point.of.sale.model';
import { ApiResponse } from '@app/models/common.model';
import { Client } from '@customer/client/models/client.model';
import { CustomerFormsInfromation, CustomFormView } from '@app/models/customer.form.model';

/* Services */
import { HttpService } from '@services/app.http.service';
import { AuthService } from '@app/helper/app.auth.service';
import { MessageService } from '@services/app.message.service';
import { DataSharingService } from '@app/services/data.sharing.service';
import { DateTimeService } from '@services/date.time.service';
import { TaxCalculation } from '@app/services/tax.calculations.service';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { CommonService } from '@app/services/common.service';

/** App Messages & Constants */
import { Configurations, SchedulerOptions, SaleArea, DiscountType } from '@helper/config/app.config';
import { PeriodIntervals, POSItemType, EnumSaleStatusType, EnumBookingStatusType, ENU_Package, ENU_DateFormatName, EnumServiceBookingStatusOptions, EnumServiceBookingStatusType, ENU_CancelItemType,  CustomerType } from '@helper/config/app.enums';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from '@app/helper/config/app.module.page.enums';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { Messages } from '@app/helper/config/app.messages';
import { SchedulerServicesApi, SchedulerApi, SaleApi } from '@app/helper/config/app.webapi';
import { debounceTime } from 'rxjs/internal/operators';

/** Shared Components */
import { POSPaymentComponent } from '@shared/components/sale/payment/pos.payment.component';
import { AlertConfirmationComponent } from '@app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { SaveClientPopupComponent } from '@customer/client/save/save.client.popup.component';
import { DatePipe } from '@angular/common';
import { SavePartialPaymentComponent } from '@app/shared/components/sale/partial-payment/save.partial.payment.component';
import { FillFormComponent } from '@app/shared/components/fill-form/fill.form.component';
import { ViewFormComponent } from '@app/shared/components/forms/view/view.form.component';
import { NoShowBookingComponent } from '@app/shared/components/noshow-booking/noshow.booking.component';
import { CancelBookingComponent } from '@app/shared/components/cancel-booking/cancel.booking.component';
import { OneDaySchedulerComponent } from '@app/shared/components/scheduler/one.day.scheduler.component';

// #endregion

@Component({
    selector: 'save-scheduler-service',
    templateUrl: './save.service.component.html'
})

export class SaveSchedulerServiceComponent extends AbstractGenericComponent implements OnChanges {

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
    showCheckOutButton: boolean = false;
    isDisabledCheckOutButton: boolean = false; /* for partial payment if all services paid as partail payment disabled check out main button */
    hideSaveButton: boolean = false;
    isChangeStartDateEvent: boolean = true;
    isNewServicePrice: boolean = false;
    currencyFormat: string;
    hasFacilityInPackage: boolean = false;
    hasItemLevelRemainingSession: boolean = false;
    serviceGlobalRemainingSession?: number = 0;
    membershipEndDate: any;
    isSaveButtonDisabled: boolean = false;
    newClientID: number = 0;
    hasMemberhsip: boolean;

    isPurchaseRestrictionAllowed :boolean = false;
    /** Models */
    cancellatinPolicyConfig: ServiceCancelatinPolicyModel;
    selectedClient: ServiceClient = new ServiceClient();
    searchClientControl: FormControl = new FormControl();
    deleteServiceModel: DeleteServiceModel = new DeleteServiceModel();
    saveServicesModel: SchedulerServiceModel = new SchedulerServiceModel();
    copySaveServiceModel: SchedulerServiceModel = new SchedulerServiceModel();
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
    enumCustomerType = CustomerType;

    isRewardProgramInPackage: boolean = false;
    // #endregion

    /** Constructor */
    constructor(
        private _dateFilter: DatePipe,
        private _httpService: HttpService,
        private _commonService: CommonService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _openDialogue: MatDialogService,
        private _saleDetailDialogue: MatDialogService,
        private _taxCalculationService: TaxCalculation,
        public _authService: AuthService
    ) {
        super();    //implicit call for constructor
        this.saveServicesModel = new SchedulerServiceModel();
        this.saveServicesModel.ServiceBookingList = new Array<ServiceBookingList>();
        this.getCurrentBranchDetail();
        this.checkPackagePermissions();
        this.setPermissions();
    }

    // #region Events

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

    // #region Methods

    async getBranchDatePattern() {
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
        this.dateFormatCheckIn = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.checkInDateTimeFormat = this.dateFormatCheckIn + " | " + this.timeFormat;
        this.isLoadOneDaySchecduler = true;
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
            //added by Muj
            this.customerMembershipId = null;
            this.resetServiceForm();
            this.showCheckOutButton = false;
            this.serviceFormData.form.markAsDirty();
            this.onCustomerDeleteUpdateServicesModel();
        }
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
        this.cancellatinPolicyConfig = response.serviceCancelatinPolicy;
        this.ServicePackageList = [];

        this.getServiceFundamentalList.forEach(category => {
            category.ServiceList.forEach(service => {
                this.serviceList.push(service);
                if (service.ServicePackageList) {
                    service.ServicePackageList.forEach(singlepackage => {
                        let objServicePackage = new SchedulerServicesPackage();
                        objServicePackage.ServiceID = singlepackage.ServiceID;
                        objServicePackage.ServicePackageID = singlepackage.ServicePackageID;
                         objServicePackage.TotalPrice = singlepackage.TotalPrice;// price chnaged after partial payment
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

    getClientDetails(searchText: any) {
        if (searchText && searchText != "" && typeof (searchText) === "string") {
            searchText = searchText.trim();
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

    getSelectedClient(client: ServiceClient) {
        this.selectedClient = client;
        this.isClientReadonly = true;

        if (this.selectedClient.HasMembership) {
                //this.getCustomerMemberhsips(this.selectedClient.CustomerID, false);
                /**Get member memberships list and service Benefits detail here*/
                let apiURL1 = SaleApi.getCustomerMemberhsips.replace("{customerID}", this.selectedClient.CustomerID.toString());
                let getMemberships = this._httpService.get(apiURL1);

                let apiURL2 = SchedulerServicesApi.getServiceBenefitsDetail.replace("{customerID}", this.selectedClient.CustomerID.toString())
                    .replace("{serviceDate}", this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat));

                    let getServiceBenefitsDetail = this._httpService.get(apiURL2);

                        forkJoin([getMemberships, getServiceBenefitsDetail]).subscribe(results => {

                            this.hasMemberhsip = results[0].Result && results[0].Result.length > 0 ? true : false;
                                if (this.hasMemberhsip) {
                                  this.customerMembershipList = results[0].Result;
                                  this.customerMembershipId = this.customerMembershipList[0].CustomerMembershipID;
                                  this.saveServicesModel.ServiceBookingList[0].CustomerMembershipID = this.customerMembershipList[0].CustomerMembershipID;
                                }
                            this.serviceBenefitsPackage = this.serviceBenefitsDetail = results[1].Result.ServiceBenefitsDetail;
                            this.serviceGlobalRemainingSession = this.serviceBenefitsPackage.find(i => i.CustomerMembershipID == this.customerMembershipId).GlobalRemainingSession;
                            this.getMembershipEndDate(this.customerMembershipId);
                            this.onServiceChange(this.saveServicesModel.ServiceBookingList[0].ServiceID, 0, this.saveServicesModel.ServiceBookingList[0].ServicePackageID, true);
                        },
                            err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "service Benefits & membership")); }
                        );
        }
        // else {

        //         this.getServiceBenefitsDetail().then(isResolved => {
        //                 this.customerMembershipId = null;
        //                 this.serviceBenefitsPackage = this.serviceBenefitsDetail;

        //                 //added by fahad for change service maintane session
        //                 this.setItemLevelBenefitCopy();
        //                 this.getGlobalSession();
        //                 this.updateServicesBenefitModel();
        //         })
        // }
    }

    setSelectedCustomer(responseData) {
        /** set value to control on backend & set on front-end with selectedClient
         * Also Trigger the getSearchClient
        */

        /** New changes */
        //if (this._cellDataSelection.id > 0) {
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
            if (this.selectedClient.CustomerTypeID == this.enumCustomerType.Member && this.selectedClient.CustomerTypeName == "Member") {
                this.getCustomerMemberhsips(this.selectedClient.CustomerID);
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

    async getCurrentBranchDetail(){
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            if (branch.BranchTimeFormat12Hours == true) {
                this.timeFormat = Configurations.SchedulerTimeFormatWithFormat;
                this.schedulerTimeFormat = Configurations.SchedulerTimeFormatWithFormat;
            }
            this.currencyFormat = branch.CurrencySymbol;
        }
    }
    onServiceChange(e, arrayIndex: number, ServicePackageID: any, isMembershipChange: boolean = false) {

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


        this.selectedService = this.serviceList.filter(x => x.ServiceID == selectedServiceId);

        if (this.selectedService && this.selectedService.length > 0 && !isMembershipChange) {
            this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID = this.selectedService[0].ServicePackageList[0].ServicePackageID;
            this.saveServicesModel.ServiceBookingList[arrayIndex].RestrictedCustomerTypeNames = this.selectedService[0].RestrictedCustomerTypeNames;
        } else {
            this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID = ServicePackageID;
        }
       // this.saveServicesModel.ServiceBookingList[arrayIndex].ID == 0
        let serviceCount = this.saveServicesModel.ServiceBookingList.filter(x => x.ServiceID == selectedServiceId).length;
        if (serviceCount > 1) {
            this.saveServicesModel.ServiceBookingList[arrayIndex].IsRepeat = true;
        }
        else {
            this.saveServicesModel.ServiceBookingList[arrayIndex].IsRepeat = false;
        }

        if (this.saveServicesModel.ServiceBookingList[arrayIndex].ID > 0) {
            this.saveServicesModel.ServiceBookingList[arrayIndex].HasUnSubmittedForm = this.serviceList.filter(x => x.ServiceID == selectedServiceId)[0]?.HasForm;
            this.saveServicesModel.ServiceBookingList[arrayIndex].isServiceChange = true;
        } else {
            this.saveServicesModel.ServiceBookingList[arrayIndex].HasForm = this.serviceList.filter(x => x.ServiceID == selectedServiceId)[0]?.HasForm;
        }
        this.saveServicesModel.ServiceBookingList[arrayIndex].HasAtleastOneMandatoryForm = this.serviceList.filter(x => x.ServiceID == selectedServiceId)[0].HasAtleastOneMandatoryForm;
        this.saveServicesModel.ServiceBookingList[arrayIndex].FormList = [];
        this.onServicePackageChange(durationTypeList[0], arrayIndex, ServicePackageID);
    }

    resetMembershipBenefitOnServiceChange(arrayIndex) {
        //reset benefit again when staff change service
        if (this.serviceBenefitsPackage && this.serviceBenefitsPackage.length > 0 && this.remainingSessionDetail && this.remainingSessionDetail.length > 0) {
            this.getMembershipEndDate(this.saveServicesModel.ServiceBookingList[arrayIndex].CustomerMembershipID);
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
        this.getMembershipEndDate(this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID);
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
        this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID =  this.saveServicesModel.ServiceBookingList[arrayIndexx].CustomerMembershipID;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].ItemDiscountAmount = 0;
        this.saveServicesModel.ServiceBookingList[arrayIndexx].TotalPrice = this.saveServicesModel.ServiceBookingList[arrayIndexx].SaleStatusTypeID === this.enumSaleStatusType.Refund ? 0 : this.ServicePackageList[index].TotalPrice;

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
                this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree = selectedServicePackage.IsFree;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit = selectedServicePackage.IsFree ? selectedServicePackage.IsFree : selectedServicePackage && !selectedServicePackage.IsFree && selectedServicePackage.DiscountPercentage > 0 ? true : false;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].IsBenefitsSuspended = selectedServicePackage.IsBenefitsSuspended;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession = this.ServicePackageList[index].Price;
                this.saveServicesModel.ServiceBookingList[arrayIndexx].PriceBeforeBenefit = this.ServicePackageList[index].Price + this.getTaxAmount(this.ServicePackageList[index].Price, this.ServicePackageList[index].TotalTaxPercentage);
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
            this.saveServicesModel.ServiceBookingList[arrayIndexx].IsFree = selectedServicePackage.IsFree;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].IsMembershipBenefit = selectedServicePackage.IsFree ? selectedServicePackage.IsFree : selectedServicePackage && !selectedServicePackage.IsFree && selectedServicePackage.DiscountPercentage > 0 ? true : false;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].IsBenefitsSuspended = selectedServicePackage.IsBenefitsSuspended;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].PricePerSession = this.ServicePackageList[index].Price;
            this.saveServicesModel.ServiceBookingList[arrayIndexx].PriceBeforeBenefit = this.ServicePackageList[index].Price + this.getTaxAmount(this.ServicePackageList[index].Price, this.ServicePackageList[index].TotalTaxPercentage);
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
        this.isRewardProgramInPackage = false;

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
            $event.previousValue = $event.previousValue ? $event.previousValue : this.currentDate;
            if (this.isChangeStartDateEvent || $event.previousValue) {
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
            this.saveServicesModel.ServiceBookingList[index].FormList = customerForm && customerForm.length > 0 ? customerForm : [];
        });

    }
    // #endregion


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

    /**WalkIn customer can not add/book service more than one*/
    addNextServiceFormFields() {

        this.isNewServicePrice = false;
        let serviceListCount: number = this.saveServicesModel.ServiceBookingList.length - 1;
        if (this.selectedService && this.selectedService.length > 0) {
            let cleanupTime = this.selectedService ? this.selectedService[0].CleaningTimeInMinute : 0;
            var objSaleService = new ServiceBookingList();
            objSaleService.ID = 0;
            objSaleService.ServicePackageID = 0;
            objSaleService.ServiceCategoryID = 0;
            objSaleService.ServiceID = 0;
            objSaleService.BookingStatusTypeID = 0;
            objSaleService.SaleStatusTypeID = this.enumSaleStatusType.Unpaid; // default is unpaid
            objSaleService.StartDate = this.currentDate;
            objSaleService.StartTime = this.getDateInterval(this.saveServicesModel.ServiceBookingList[serviceListCount].EndTime, 6, cleanupTime).toString();
            objSaleService.EndTime = this.getDateInterval(this.saveServicesModel.ServiceBookingList[serviceListCount].EndTime, 6, cleanupTime + 15).toString(); // cell duration time is 15
            objSaleService.AssignedToStaffID = this.saveServicesModel.ServiceBookingList[0].AssignedToStaffID; // previous selected Staff populate again
            objSaleService.FacilityID = 0;
            objSaleService.CleaningTimeInMinute = 0;
            objSaleService.Description = "";
            objSaleService.CustomerMembershipID = this.customerMembershipList.length > 0 ? this.customerMembershipList[0].CustomerMembershipID : null;
            this.customerMembershipId = objSaleService.CustomerMembershipID;
            objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.IsPaidService] = false;
            objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.IsCompletedService] = false;
            objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.SelectedForCheckout] = false;
            objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.ShowDeleteButton] = true;
            this.saveServicesModel.ServiceBookingList[serviceListCount][this.schedulerStaticStrings.GetSchedulerStaticString.ShowDeleteButton] = true;  // previous index service show delete button now
            this.saveServicesModel.ServiceBookingList.push(objSaleService);
            this.HasForm = false;
        }
        /* Scroll to the newly created service */
        setTimeout(() => {
            let element = document.getElementById('ServiceID' + (this.saveServicesModel.ServiceBookingList.length - 1));
            element.scrollIntoView({ behavior: "smooth", block: "start" }); // this will scroll elem to the top
        })
    }

    changeServiceSelectionForCheckout(serviceListIndex, value) {

        let countFalseCheckout: number = 0;
        this.serviceFormData.form.markAsPristine();
        this.serviceFormData.form.markAsUntouched();
        this.saveServicesModel.ServiceBookingList[serviceListIndex][this.schedulerStaticStrings.GetSchedulerStaticString.SelectedForCheckout] = value;
        if (this.saveServicesModel.ServiceBookingList.length === 1) this.showCheckOutButton = value;
        //** If anyone in service list is checked for checkout then show checkout button */
        this.saveServicesModel.ServiceBookingList.forEach(item => {
            if (item[this.schedulerStaticStrings.GetSchedulerStaticString.SelectedForCheckout] == true) {
                this.showCheckOutButton = true;
            } else if (item[this.schedulerStaticStrings.GetSchedulerStaticString.SelectedForCheckout] == false) {
                countFalseCheckout++;
            }
        });

        this.setCheckDisabledButton();

        if (countFalseCheckout == this.saveServicesModel.ServiceBookingList.length) {
            this.showCheckOutButton = false;
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
                    }else{
                        this._messageService.showErrorMessage(data.MessageText);
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service"));
                }
            );
    }


    setDateAfterGetByID(responseData) {

        //** If get only 1 service is in the list, then check if Paid or refunded then show only save button */
        if (responseData.ServiceBookingList.length === 1 && (responseData.ServiceBookingList[0].SaleStatusTypeID === EnumSaleStatusType.Paid || responseData.ServiceBookingList[0].SaleStatusTypeID === EnumSaleStatusType.Refund))
            this.showCheckOutButton = false;

        this.isShowError = false;

        let membership = responseData.ServiceBookingList.find(item => item.CustomerMembershipID);
        if (membership) {
            this.customerMembershipId = membership.CustomerMembershipID;
        }

        this.saveServicesModel.ServiceBookingList = []; ///empty ServiceBookingList before making new list
        responseData.ServiceBookingList.forEach((getSingleService) => {

            let objSaleService = new ServiceBookingList();
            objSaleService = getSingleService;

            //for multi time zone issue using this method
            getSingleService.StartDate = this._dateTimeService.convertStringIntoDateForScheduler(getSingleService.StartDate);

            objSaleService.StartTime = this._dateTimeService.convertTimeStringToDateTime(getSingleService.StartTime, getSingleService.StartDate);

            objSaleService.EndTime = this._dateTimeService.convertTimeStringToDateTime(getSingleService.EndTime, getSingleService.StartDate);

            //objSaleService.TotalPrice = objSaleService.DiscountPrice;

            var TotalTaxPercentage = this.ServicePackageList.find(i => i.ServicePackageID == objSaleService.ServicePackageID).TotalTaxPercentage;
            objSaleService.TotalPrice = objSaleService.Price + (this._taxCalculationService.getTaxAmount(TotalTaxPercentage, objSaleService.Price) * 1);

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

            /** if any one service is unpaid/booked then show checkout button */
            /** Change Request By Sohaib: NoShow Button is show when service is unpaid as well, so hide checkout button in this case. (ALIZIA-12/07/2019)  */
            if ((objSaleService.SaleStatusTypeID === EnumSaleStatusType.Unpaid || objSaleService.SaleStatusTypeID === EnumSaleStatusType.PartialPaid) && objSaleService.BookingStatusTypeID !== this.enumBookingStatusType.NoShow) this.showCheckOutButton = true;

            this.saveServicesModel.ServiceBookingList.push(objSaleService);

        });

        this.setCheckDisabledButton();
        this.isSaveButtonDisabled = false;
        this.copySaveServiceModel.ServiceBookingList = JSON.parse(JSON.stringify(this.saveServicesModel.ServiceBookingList));
    }

    setDurationNotesAccordingTime(objSaleService: ServiceBookingList, isServiceGetByID?): ServiceBookingList {
        let selectedPackage = JSON.parse(JSON.stringify(this.ServicePackageList.find((item: any) => item.ServicePackageID == objSaleService.ServicePackageID)));
        // let oldServiceID = objSaleService[this.schedulerStaticStrings.GetSchedulerStaticString.OldServiceID];
        // && oldServiceID == objSaleService.ServiceID
        /** Booked service always have booking price not package price as per request change From SOHAIB 05-07-2019 */

        // price always change if service package change as per request by sohaib 04-02-2020 // Fazeel
        // if (this.isNewServicePrice && objSaleService.ID > 0 && objSaleService.BookingStatusTypeID === this.enumBookingStatusType.Booked && (objSaleService.SaleStatusTypeID === EnumSaleStatusType.Unpaid || objSaleService.SaleStatusTypeID === EnumSaleStatusType.Paid))
        //     selectedPackage.TotalPrice = objSaleService.Price;

        this.selectedDurationValue = selectedPackage.DurationValue;
        this.selectedService = this.serviceList.filter(x => x.ServiceID == objSaleService.ServiceID);
        objSaleService.Price = objSaleService.IsMembershipBenefit ? objSaleService.Price : selectedPackage.Price;

        //forms implimantion
        objSaleService.HasForm = this.selectedService[0]?.HasForm;
        objSaleService.HasAtleastOneMandatoryForm = this.selectedService[0].HasAtleastOneMandatoryForm;

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

        this.getMembershipEndDate(this.saveServicesModel.ServiceBookingList[itemIndex].CustomerMembershipID);
        if (this.checkMemberhsipEndDate(serviceBookingDate)) {
            /** Set date for Start and End Time */
            this.saveServicesModel.ServiceBookingList[itemIndex].StartDate = serviceBookingDate;
            new Date(this.saveServicesModel.ServiceBookingList[itemIndex].StartTime).setDate(serviceBookingDate.getDate());
            new Date(this.saveServicesModel.ServiceBookingList[itemIndex].EndTime).setDate(serviceBookingDate.getDate());
            enableForm ? this.setFormAsDirty() : false;
            if (this.saveServicesModel.ServiceBookingList[itemIndex].BookingStatusTypeID === this.enumBookingStatusType.Attended || this.saveServicesModel.ServiceBookingList[itemIndex].BookingStatusTypeID === this.enumBookingStatusType.NoShow) {
                //** donot enable form to save in such case. */
                enableForm = false;
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


    deleteService(saleServiceListIndex: number) {
         const dialogRef = this._openDialogue.open(AlertConfirmationComponent, { disableClose: true });
         dialogRef.componentInstance.showConfirmCancelButton = true;
         dialogRef.componentInstance.Title = this.messages.Dialog_Title.Delete_Service;
         dialogRef.componentInstance.Message = this.messages.Confirmation.Delete_Service_Message;
         dialogRef.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
             if (isConfirm) {
                 this.deleteBookedSaleService(this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ID, this.saveServicesModel.CustomerID, this.saveServicesModel.ServiceBookingList[saleServiceListIndex].AssignedToStaffID);
             }
         });
    }

    removeServiceObjectFormList(saleServiceListIndex: number) {

        if (this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ID > 0) {
            this.saveServicesModel.ServiceBookingList.splice(saleServiceListIndex, 1);
            this.onCloseSchedulerServicePopup();
            this.deleteBookedSaleService(this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ID, this.saveServicesModel.CustomerID, this.saveServicesModel.ServiceBookingList[saleServiceListIndex].AssignedToStaffID);
        }

        // add service but remove one array
        else if (this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ID == 0 && this.saveServicesModel.ServiceBookingList.length > 1) {
            this.saveServicesModel.ServiceBookingList.splice(saleServiceListIndex, 1);
        }

        // add service & only one array. so, we have to hide popup and remove array
        else if (this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ID == 0 && this.saveServicesModel.ServiceBookingList.length == 1) {
            this.saveServicesModel.ServiceBookingList.splice(saleServiceListIndex, 1);
            this.onCloseSchedulerServicePopup();
        }

        // after remove service obj from list
        {
            if (this.saveServicesModel.ServiceBookingList.length == 1) {
                let serviceListCount: number = this.saveServicesModel.ServiceBookingList.length - 1;
                this.saveServicesModel.ServiceBookingList[serviceListCount][this.schedulerStaticStrings.GetSchedulerStaticString.ShowDeleteButton] = false;
            }
        }
    }

    deleteBookedSaleService(customerBookingId, customerid, assignedToStaffID) {
        let delete_APIURL = SchedulerServicesApi.deleteBookedSaleService + customerBookingId + "/" + customerid + "/" + assignedToStaffID;
        this._httpService.delete(delete_APIURL)
            .subscribe(
                response => {
                    if (response['MessageCode'] > 0) {
                        this.onReloadScheduler.emit(true);
                        this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Service"));
                        this.onCloseSchedulerServicePopup();
                    } else {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service"));
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service"));
                }
            );
    }

    ConfirmNoShowDialog(saleServiceListIndex: number) {
        this.deleteDialogRef = this._openDialogue.open(AlertConfirmationComponent, { disableClose: true });

        this.deleteDialogRef.componentInstance.Title = this.messages.Dialog_Title.Alert;
        this.deleteDialogRef.componentInstance.Message = this.messages.Confirmation.Confirmation_Alter_Service_Status;
        this.deleteDialogRef.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                this.NoShowBookedSaleService(this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleID, this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ID, this.saveServicesModel.ServiceBookingList[saleServiceListIndex].AssignedToStaffID);
            }
        });
    }

    NoShowBookedSaleService(saleId, customerBookingIdOrSaleDetailID, assignedToStaffID) {
        //changed api dated on: 25/09/2020 removed assignedToStaffID
        //this._httpService.get(SchedulerServicesApi.noShowBooking + saleId + "/" + customerBookingIdOrSaleDetailID + "/" + assignedToStaffID)
        this._httpService.get(SchedulerServicesApi.noShowBooking + saleId + "/" + customerBookingIdOrSaleDetailID)
            .subscribe(
                response => {
                    if (response.MessageCode > 0) {
                        this.onReloadScheduler.emit(true);
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Service"));
                        this.onCloseSchedulerServicePopup();
                    } else {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service"));
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service"));
                }
            );
    }

    ConfirmCompleteSaleService(saleServiceListIndex: number) {
        this.deleteDialogRef = this._openDialogue.open(AlertConfirmationComponent, { disableClose: true });

        this.deleteDialogRef.componentInstance.Title = this.messages.Dialog_Title.Alert;
        this.deleteDialogRef.componentInstance.Message = this.messages.Confirmation.Confirmation_Alter_Service_Status;
        this.deleteDialogRef.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                this.completeBookedSaleService(this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleID, this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ID);
            }
        });
    }

    completeBookedSaleService(saleId, saleDetalorBookingId) {
        // saleId = saleId == 0 ? s
        //commented by fahad dated on 28/09/2020 api change
        //this._httpService.get(SchedulerServicesApi.completeSaleService, this.setServiceCompleteUrlParams(saleId, saleDetalorBookingId))

        this._httpService.get(SchedulerServicesApi.completeSaleService + "?saleID=" + saleId + "&detailID=" + saleDetalorBookingId)
            .subscribe(
                response => {
                    if (response.MessageCode > 0) {
                        this.onReloadScheduler.emit(true);
                        this._messageService.showSuccessMessage(this.messages.Success.Service_Completed_Status);
                        this.onCloseSchedulerServicePopup();
                    } else {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service"));
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service"));
                }
            );
    }

    saveSchedulerService(isvalid: boolean) {
        this.isSaveButtonDisabled = true;
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
                   /**Below line commented in order to remain sevice popup open after save and new method has been called here "sendSchedulerServiceSaveRequest"*/
                    // this.onUpdateSchedulerService.emit(serviceToSave);
                   this.sendSchedulerServiceSaveRequest(serviceToSave);
                    //this.onCloseSchedulerServicePopup();
                }
            } else {
                this.searchClientControl.setValue('');
                this.isSaveButtonDisabled = false;
            }
        }
        else {
            this.searchClientControl.setValue('');
            this.isSaveButtonDisabled = false;
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

    savePOS(saleServiceListIndex: any = null) {
        if (saleServiceListIndex == null && this.saveServicesModel.ServiceBookingList.length == this.saveServicesModel.ServiceBookingList.filter(i => (i.SaleStatusTypeName.toString().toLowerCase() === 'unpaid' || i.SaleStatusTypeID === this.enumSaleStatusType.Unpaid) && i.SaleID == 0).length) {
            this.openDialogForPayment();
        } else if (saleServiceListIndex == null && this.saveServicesModel.ServiceBookingList.filter(i => (i.SaleStatusTypeName.toString().toLowerCase() === 'unpaid' || i.SaleStatusTypeID === this.enumSaleStatusType.Unpaid) && i.SaleID == 0).length > 0) {
            this.openDialogForPayment();
        } else if (this.saveServicesModel.AllowPartPaymentOnCore && this.saveServicesModel.ServiceBookingList[0].SaleStatusTypeID !== this.enumSaleStatusType.Paid) {
            if (saleServiceListIndex != null && this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleID > 0) {
                this.onOpenPartialPaymentDialog(this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleID);
            } else if (saleServiceListIndex == null && this.saveServicesModel.ServiceBookingList.length === 1 && this.saveServicesModel.AllowPartPaymentOnCore && this.saveServicesModel.ServiceBookingList[0].SaleID > 0) {
                this.onOpenPartialPaymentDialog(this.saveServicesModel.ServiceBookingList[0].SaleID);
            } else if (saleServiceListIndex != null) {
                this.openDialogForPayment(this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ID);
            } else if (saleServiceListIndex == null && this.saveServicesModel.ServiceBookingList.length > 1) {
                var result = this.saveServicesModel.ServiceBookingList.filter(i => i.SaleStatusTypeID == this.enumSaleStatusType.Refund || i.SaleStatusTypeID == this.enumSaleStatusType.Unpaid);
                if (result != null && result.length == 1) {
                    this.onOpenPartialPaymentDialog(result[0].SaleID);
                } else if (result != null && result.length > 1) {
                    var unPaid = this.saveServicesModel.ServiceBookingList.filter(i => (i.SaleStatusTypeName.toString().toLowerCase() === 'unpaid' || i.SaleStatusTypeID === this.enumSaleStatusType.Unpaid) && i.SaleID == 0);
                    if (unPaid !== null && unPaid.length > 0) {
                        this.openDialogForPayment(unPaid[0].ID);
                    }
                    else if(this.saveServicesModel.ServiceBookingList.filter(i => i.SaleStatusTypeName.toString().toLowerCase() === 'unpaid').length == this.saveServicesModel.ServiceBookingList.length &&
                            this.saveServicesModel.ServiceBookingList.filter(i => i.SaleID === this.saveServicesModel.ServiceBookingList[0].SaleID).length == this.saveServicesModel.ServiceBookingList.length){
                        this.onOpenPartialPaymentDialog(this.saveServicesModel.ServiceBookingList[0].SaleID);
                    }
                    else {
                        var writtenOff = this.saveServicesModel.ServiceBookingList.filter(i => i.SaleStatusTypeID === this.enumSaleStatusType.WrittenOff);
                        if (writtenOff !== null && writtenOff.length > 0 && writtenOff[0].SaleID > 0) {
                            this.onOpenPartialPaymentDialog(writtenOff[0].SaleID);
                        } else {
                            this.openDialogForPayment(writtenOff[0].ID);
                        }
                    }
                } else if(this.saveServicesModel.ServiceBookingList.filter(i => i.SaleStatusTypeID === this.enumSaleStatusType.PartialPaid).length == this.saveServicesModel.ServiceBookingList.length &&
                            this.saveServicesModel.ServiceBookingList.filter(i => i.SaleID === this.saveServicesModel.ServiceBookingList[0].SaleID).length == this.saveServicesModel.ServiceBookingList.length){
                        this.onOpenPartialPaymentDialog(this.saveServicesModel.ServiceBookingList[0].SaleID);
                    }
            } else {
                this.openDialogForPayment();
            }
        } else if (saleServiceListIndex != null && this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleStatusTypeID !== this.enumSaleStatusType.Refund) {
            if (this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleID > 0) {
                this.onOpenPartialPaymentDialog(this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleID);
            } else {
                this.openDialogForPayment(this.saveServicesModel.ServiceBookingList[saleServiceListIndex].ID);
            }
        } else if (saleServiceListIndex != null && this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleStatusTypeID === this.enumSaleStatusType.Refund) {
            this.onOpenPartialPaymentDialog(this.saveServicesModel.ServiceBookingList[saleServiceListIndex].SaleID);
        } else if (saleServiceListIndex == null && this.saveServicesModel.ServiceBookingList.length == 1 && this.saveServicesModel.ServiceBookingList[0].SaleStatusTypeID === this.enumSaleStatusType.Refund) {
            this.onOpenPartialPaymentDialog(this.saveServicesModel.ServiceBookingList[0].SaleID);
        } else if (saleServiceListIndex == null && this.saveServicesModel.ServiceBookingList.length == 1 && this.saveServicesModel.ServiceBookingList[0].SaleStatusTypeID === this.enumSaleStatusType.WrittenOff) {
            if (this.saveServicesModel.ServiceBookingList[0].SaleID > 0) {
                this.onOpenPartialPaymentDialog(this.saveServicesModel.ServiceBookingList[0].SaleID);
            } else {
                this.openDialogForPayment(this.saveServicesModel.ServiceBookingList[0].ID);
            }
        } else if (saleServiceListIndex == null && this.saveServicesModel.ServiceBookingList.length > 1) {

            var unPaid = this.saveServicesModel.ServiceBookingList.filter(i => (i.SaleStatusTypeName.toString().toLowerCase() === 'unpaid' || i.SaleStatusTypeID === this.enumSaleStatusType.Unpaid) && i.SaleID == 0);
            if (unPaid !== null && unPaid.length > 0) {
                this.openDialogForPayment(unPaid[0].ID);
            } else {
                var writtenOff = this.saveServicesModel.ServiceBookingList.filter(i => i.SaleStatusTypeID === this.enumSaleStatusType.WrittenOff);
                if (writtenOff !== null && writtenOff.length > 0 && writtenOff[0].SaleID > 0) {
                    this.onOpenPartialPaymentDialog(writtenOff[0].SaleID);
                } else {
                    this.openDialogForPayment(writtenOff[0].ID);
                }
            }
        } else {
            this.openDialogForPayment();
        }
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

    onOpenPartialPaymentDialog(saleID: number) {
        let data = {
            saleID: saleID,
            customerId: this.saveServicesModel.CustomerID
        }

        const dialogRef = this._saleDetailDialogue.open(SavePartialPaymentComponent, {
            disableClose: true,
            panelClass: 'pos-full-popup',
            data: data
        });

        dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.onCloseSchedulerServicePopup();
                this.onReloadScheduler.emit(true);
            }
        });
    }

    openDialogForPayment(ID: number = 0) {

        if (!this.isShowError) {

            let saleInvoice = new SaleInvoice(), _grossAmount = 0, _vatTotal = 0;
            saleInvoice.TotalEarnedRewardPoints = 0;

            saleInvoice.ApplicationArea = SaleArea.Service;  // to send pos from scheduler
            this.posCartItems = [];

            saleInvoice.SaleDetailList = [];
            saleInvoice.CustomerID = this.selectedClient.CustomerID;

            //** if any list data partial paid not added */
            let serviceBookingListForCheckout = this.saveServicesModel.ServiceBookingList.filter(x => x[this.schedulerStaticStrings.GetSchedulerStaticString.SelectedForCheckout] === true && ((x.SaleStatusTypeID === EnumSaleStatusType.Unpaid && x.BookingStatusTypeID !== this.enumBookingStatusType.NoShow) || x.SaleStatusTypeID === EnumSaleStatusType.Refund || x.SaleStatusTypeID === EnumSaleStatusType.WrittenOff) && x.IsPartialPaid == false);
            //** if selected item payed add only selected item */
            if (ID > 0) {
                serviceBookingListForCheckout = this.saveServicesModel.ServiceBookingList.filter(x => x.ID == ID)
            }

            serviceBookingListForCheckout.forEach(_singleService => {

                //** sale invoice save into DB */
                let saleService = new POSSaleDetail();
                saleService.CustomerBookingID = _singleService.ID;
                // added by fahad zone issue
                saleService.StartDate = this._dateTimeService.convertDateObjToStringNotChangeDate(new Date(_singleService.StartDate), "YYYY-MM-DD");
                saleService.ItemID = _singleService.ServicePackageID;
                saleService.FacilityID = _singleService.FacilityID == 0 ? null : _singleService.FacilityID;
                saleService.ItemTypeID = POSItemType.Service;
                saleService.StartTime = this._dateTimeService.convertDateObjToString(new Date(_singleService.StartTime), this.timeFormatDifference);
                saleService.EndTime = this._dateTimeService.convertDateObjToString(new Date(_singleService.EndTime), this.timeFormatDifference);
                saleService.Qty = 1;
                saleService.CustomerMembershipID = _singleService.IsMembershipBenefit && _singleService.CustomerMembershipID == this.customerMembershipId ? this.customerMembershipId
                : _singleService.IsMembershipBenefit && _singleService.CustomerMembershipID ? _singleService.CustomerMembershipID :  null;
                saleService.ItemDiscountAmount = _singleService.ItemDiscountAmount ? _singleService.ItemDiscountAmount : 0;
                saleService.AssignedToStaffID = _singleService.AssignedToStaffID;

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

                cartItem.Price = _singleService.IsFree ? 0 :  cartItem.TotalDiscount > 0 ? (_singleService.PricePerSession - cartItem.TotalDiscount) : (_singleService.DiscountPrice - (_singleService.ItemTaxPrice ? _singleService.ItemTaxPrice : 0));
                cartItem.Qty = 1;
                cartItem.PricePerSession = _singleService.IsFree ? cartItem.TotalDiscount :  cartItem.TotalDiscount > 0 ? _singleService.PricePerSession :  _singleService.DiscountPrice - (_singleService.ItemTaxPrice ? _singleService.ItemTaxPrice : 0);

                //cartItem.Price = _singleService.IsFree ? 0 : _singleService.PricePerSession - cartItem.TotalDiscount;
                //?cartItem.PricePerSession = _singleService.PricePerSession;
                cartItem.DiscountType = (saleService.CustomerMembershipID && this.customerMembershipList.length > 0) ? this.customerMembershipList.filter(x => x.CustomerMembershipID === _singleService.CustomerMembershipID)[0].MembershipName : '';
                cartItem.TotalTaxPercentage = this.ServicePackageList.filter((item: any) => item.ServicePackageID == _singleService.ServicePackageID)[0].TotalTaxPercentage; // TODO: get vat total from service package in fundamentals
                cartItem.TotalAmountExcludeTax = _singleService.IsFree ? 0 : (cartItem.Qty * (cartItem.PricePerSession - cartItem.TotalDiscount));
                cartItem.ItemDiscountAmount = _singleService.ItemDiscountAmount ? _singleService.ItemDiscountAmount : 0;

                cartItem.ItemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(cartItem.TotalTaxPercentage, cartItem.Price) * cartItem.Qty);
                cartItem.TotalAmountIncludeTax = this._taxCalculationService.getRoundValue(cartItem.TotalAmountExcludeTax + cartItem.ItemTotalTaxAmount);
                // this line added for membership benifit if benefit apply not change value "TotalAmountExcludeTax" for dicount other wise pos cart item and total due show wrong values added by Fahad dated on 13/09/2021
                cartItem.TotalAmountExcludeTax =  cartItem.ItemDiscountAmount > 0 ? this._taxCalculationService.getRoundValue(cartItem.PricePerSession * cartItem.Qty) : cartItem.TotalAmountExcludeTax;

                if(this.isRewardProgramInPackage) {
                    this._commonService.getItemRewardPoints(POSItemType.Service, _singleService.ServiceID, this.selectedClient.CustomerID, _singleService.IsFree, false, saleService.CustomerMembershipID ? true : false).subscribe((response: any) => {
                        cartItem.AmountSpent = response.Result.AmountSpent;
                        cartItem.MemberBaseEarnPoints = response.Result.MemberBaseEarnPoints ?  response.Result.MemberBaseEarnPoints : 0;
                        cartItem.CustomerEarnedPoints = response.Result.CustomerEarnedPoints ? response.Result.CustomerEarnedPoints : 0;
                        saleInvoice.TotalEarnedRewardPoints += this._commonService.calculateRewardPointsPerItem(this.selectedClient, cartItem);
                    })

                    this.posCartItems.push(cartItem);

                    _grossAmount += cartItem.ItemDiscountAmount > 0 ? cartItem.TotalAmountExcludeTax - cartItem.ItemDiscountAmount : cartItem.TotalAmountExcludeTax;
                    _vatTotal += cartItem.TotalTaxPercentage;
                } else{
                    this.posCartItems.push(cartItem);

                    _grossAmount += cartItem.ItemDiscountAmount > 0 ? cartItem.TotalAmountExcludeTax - cartItem.ItemDiscountAmount : cartItem.TotalAmountExcludeTax;
                    _vatTotal += cartItem.TotalTaxPercentage;
                }


            });
            this.posPaymentDailog(_grossAmount, saleInvoice)
        }
    }

    posPaymentDailog(_grossAmount, saleInvoice){
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
                this.onCloseSchedulerServicePopup();
                this.onReloadScheduler.emit(true);
            }
        });
    }

    getserviceBookingListForCheckout(data: ServiceBookingList[], ID: number): ServiceBookingList[] {
        var _serviceBookingListForCheckout = new Array<ServiceBookingList>();
        return _serviceBookingListForCheckout;
    }

    onAddClient() {

        this._dataSharingService.shareClientID(0);
        this._openDialogue.open(SaveClientPopupComponent, {
            disableClose: true
        });

        this._dataSharingService.clientInfo.subscribe((clientInfo: Client) => {
            if (clientInfo.Email && clientInfo.Email.length > 0) {
                this.setClientByEmail(clientInfo.Email);
            }
            else if (clientInfo && clientInfo.CustomerID > 0) {
                this.setClient(clientInfo.CustomerID, (clientInfo.FirstName + ' ' + clientInfo.LastName));
            }

            if (clientInfo && clientInfo.CustomerID > 0) {
                this.isAddNewClient = true;
                if (clientInfo.Email && clientInfo.Email.length > 0) {
                    this.searchClientControl.setValue(clientInfo.Email);
                }
                else {
                    this.newClientID = clientInfo.CustomerID;
                    this.searchClientControl.setValue(clientInfo.FirstName + ' ' + clientInfo.LastName);
                }
            }
        })
    }

    setCheckDisabledButton() {

        if (this.saveServicesModel.ServiceBookingList.length > 1 && this.saveServicesModel.AllowPartPaymentOnCore) {
            this.isDisabledCheckOutButton = true;
            var unpaid = this.saveServicesModel.ServiceBookingList.filter(i => i.SaleStatusTypeID == this.enumSaleStatusType.Unpaid && i.SaleStatusTypeName.toString().toLowerCase() === 'unpaid' && i.BookingStatusTypeID != EnumBookingStatusType.NoShow && i.SaleID == 0);

            if (unpaid !== null && unpaid.length > 0) {
                this.isDisabledCheckOutButton = false;
            }

        } else if (this.saveServicesModel.AllowPartPaymentOnCore) {
            this.isDisabledCheckOutButton = false;
        }
        /*Disable checkout button in case of multiple services have same saleId (joint cackout)*/
        if(this.saveServicesModel.ServiceBookingList.length > 1 && this.saveServicesModel.ServiceBookingList.filter(sb => sb.SaleID == this.saveServicesModel.ServiceBookingList[0].SaleID).length == this.saveServicesModel.ServiceBookingList.length){
            this.isDisabledCheckOutButton = false;
        }
        /**If all services are paid disable chackout button */
        if(this.saveServicesModel.ServiceBookingList.every(service => service.SaleStatusTypeID === EnumSaleStatusType.Paid)) {
            this.isDisabledCheckOutButton = true;
            this.showCheckOutButton = false;
        }

    }

    setClient(clientId: number, clientName: string) {
        //this.personName = clientName;
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
            //this.personName = this.selectedClient.FirstName + ' ' + this.selectedClient.LastName;
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
                element.PriceBeforeBenefit = this.ServicePackageList[index].Price + this.getTaxAmount(this.ServicePackageList[index].Price, this.ServicePackageList[index].TotalTaxPercentage);

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

    getMembershipEndDate(customerMembershipID?) {
        if (customerMembershipID) {
            this.membershipEndDate = this.serviceBenefitsDetail?.filter(id => id.CustomerMembershipID == customerMembershipID)[0]?.MembershipEndDate;
        } else if (this.customerMembershipId) {
            this.membershipEndDate = this.serviceBenefitsDetail?.filter(id => id.CustomerMembershipID == this.customerMembershipId)[0]?.MembershipEndDate;
        } else {
            this.membershipEndDate = null;
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

    getServiceBenefitsDetail() {
        return new Promise<boolean>((resolve, reject) => {
            let url = SchedulerServicesApi.getServiceBenefitsDetail
                .replace("{customerID}", this.selectedClient.CustomerID.toString())
                .replace("{serviceDate}", this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat));

            this._httpService.get(url).subscribe((response) => {
                if (response && response.MessageCode > 0) {
                  //this.customerMemberhsip = response.Result.CustomerMemberships;
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

                    element.CustomerMembershipID = element.ID > 0 ? element.CustomerMembershipID : selectedServicePackage.CustomerMembershipID ? selectedServicePackage.CustomerMembershipID : null;
                 //   if(element.CustomerMembershipID == this.customerMembershipId){
                        if (((element.CustomerMembershipID && this.checkItemAssociationWithMemberhisp(selectedServicePackage)) && this.oncheckItemAndGlobalLevelRemaingSession(selectedServicePackage)) || (element.ID > 0 && element.IsMembershipBenefit)) {
                            element.IsMembershipBenefit = true;
                            element.CustomerMembershipID = selectedServicePackage.CustomerMembershipID;
                            // element.PricePerSession = this.ServicePackageList[index].Price;
                            // element.PriceBeforeBenefit = this.ServicePackageList[index].Price + this.getTaxAmount(this.ServicePackageList[index].Price, this.ServicePackageList[index].TotalTaxPercentage);
                            element.PriceBeforeBenefit = element.PricePerSession + this.getTaxAmount(element.PricePerSession, this.ServicePackageList[index].TotalTaxPercentage);

                            /**Below line of code commented to display "DiscountPrice" column if service has sale level/POS discount  */
                            //// element.TotalPrice = selectedServicePackage.IsFree ? 0 : selectedServicePackage.DiscountedPrice;
                               //// element.TotalPrice = selectedServicePackage.IsFree ? 0 : selectedServicePackage.DiscountedPrice;
                               if(element.IsMembershipBenefit && !element.IsFree && element.ItemDiscountAmount && element.ItemDiscountAmount > 0){
                                //element.TotalPrice = element.ItemDiscountAmount;
                                let discountInPercentage = (element.ItemDiscountAmount / element.PricePerSession) * 100;
                                let newDiscountedPrice = element.PricePerSession - ((discountInPercentage / 100) * element.PricePerSession);
                                let newDiscountedPriceIncludeTax = newDiscountedPrice + this.getTaxAmount(newDiscountedPrice, this.ServicePackageList[index].TotalTaxPercentage);
                                element.TotalPrice = newDiscountedPriceIncludeTax;
                            } else{
                                if(element.DiscountPrice && element.DiscountPrice != undefined) {
                                    /*"DiscountPrice" is being used in cancellation/noshow/ calculation. DiscountPrice contains sales discount as well
                                   while "DiscountedPrice" is just benefited price*/
                                    element.TotalPrice = element.IsFree ? 0 : element.IsMembershipBenefit && !element.IsFree ? element.DiscountPrice : element.TotalPrice;
                                } else {
                                    element.TotalPrice = selectedServicePackage.IsFree ? 0 : element.IsMembershipBenefit && !element.IsFree ? selectedServicePackage.DiscountedPrice : element.TotalPrice;
                                }
                            }

                           // element.ItemDiscountAmount = element.CustomerMembershipID && element.CustomerMembershipID == this.customerMembershipId ? this.getDiscountAmount(element.PricePerSession, selectedServicePackage.DiscountPercentage) : element.ItemDiscountAmount;
                           element.ItemDiscountAmount = element.CustomerMembershipID ? this.getDiscountAmount(element.PricePerSession, selectedServicePackage.DiscountPercentage) : element.ItemDiscountAmount;
                        }
                        else {
                            element.IsMembershipBenefit = false;
                            element.CustomerMembershipID = null;
                            element.PricePerSession = this.ServicePackageList[index].Price;
                            element.PriceBeforeBenefit = this.ServicePackageList[index].Price + this.getTaxAmount(this.ServicePackageList[index].Price, this.ServicePackageList[index].TotalTaxPercentage);
                            element.TotalPrice = element.IsFree ? 0 : element.TotalPrice;
                            element.ItemDiscountAmount = 0;
                        }
                 //   }

                    // else if(element.CustomerMembershipID && this.customerMembershipId && element.CustomerMembershipID != this.customerMembershipId){
                    //     element.PricePerSession = element.Price;
                    //     element.PriceBeforeBenefit = element.Price;
                    // }
                }
                else {
                    element.IsMembershipBenefit = element.CustomerMembershipID ? true : false;
                    element.PricePerSession = this.ServicePackageList[index].Price;
                    element.PriceBeforeBenefit = this.ServicePackageList[index].Price + this.getTaxAmount(this.ServicePackageList[index].Price, this.ServicePackageList[index].TotalTaxPercentage);
                    element.ItemDiscountAmount = 0;
                    element.TotalPrice = element.IsMembershipBenefit && (element.ItemDiscountAmount && element.ItemDiscountAmount == element.Price) ? 0 : element.TotalPrice;
                }
            }
        });
    }

    getDiscountAmount(price: number, discountPercentage: number) {
        return this._taxCalculationService.getTwoDecimalDigit(((price * discountPercentage) / 100));
    }

    getTaxAmount(price: number, taxPercentage: number) {
        return ((price * taxPercentage) / 100);
    }


    roundValue(value: any) {
        return this._taxCalculationService.getRoundValue(value);
    }

/*service booking statuses */
/* Service booking status dropdown options*/
bookingStatusOptions = [
    {BookingStatusTypeID: EnumServiceBookingStatusType.Booked, BookingStatusTypeName: EnumServiceBookingStatusOptions.Booked},
    {BookingStatusTypeID: EnumServiceBookingStatusType.NotConfirmed , BookingStatusTypeName: EnumServiceBookingStatusOptions.NotConfirmed},
    {BookingStatusTypeID: EnumServiceBookingStatusType.Confirmed, BookingStatusTypeName: EnumServiceBookingStatusOptions.Confirmed},
    {BookingStatusTypeID: EnumServiceBookingStatusType.CheckedInByStaff, BookingStatusTypeName: EnumServiceBookingStatusOptions.CheckedInByStaff},
    {BookingStatusTypeID: EnumServiceBookingStatusType.ReadyToStart, BookingStatusTypeName: EnumServiceBookingStatusOptions.ReadyToStart},
    {BookingStatusTypeID: EnumServiceBookingStatusType.NoShow, BookingStatusTypeName: EnumServiceBookingStatusOptions.NoShow},
    {BookingStatusTypeID: EnumServiceBookingStatusType.InProgress, BookingStatusTypeName: EnumServiceBookingStatusOptions.InProgress},
    {BookingStatusTypeID: EnumServiceBookingStatusType.Completed, BookingStatusTypeName: EnumServiceBookingStatusOptions.Completed},
    {BookingStatusTypeID: EnumServiceBookingStatusType.Cancelled, BookingStatusTypeName: EnumServiceBookingStatusOptions.Cancelled}
];


bookingStatusChangeModel(serviceDetail: any) {
    var Data = {
        CustomerID: this.selectedClient.CustomerID,
        CustomerTypeId: this.selectedClient.CustomerTypeID,
        CancelbookingType: ENU_CancelItemType.Service,
        IsCancellationFeeInPercentage: this.cancellatinPolicyConfig.IsServiceCancellationLateFlatFee == false ? true : false,
     // NoShowCharges: //serviceDetail.ServiceNoShowCharges,
      //CancellationCharges: serviceDetail.ServiceCancellationLateCharges, //NOSHOW/CANCELLATION charges bits changed from backend
        OldTotalDue: serviceDetail.SaleTotalPrice,
        AmountPaid: serviceDetail.TotalAmountPaid,
        ItemDiscountedPrice: serviceDetail.DiscountPrice, //serviceDetail.TotalPrice, //"ItemDiscountedPrice" changed asked by Faisal 03-03-2022 for noShow/Cancellation
        SaleID: serviceDetail.SaleID > 0 ? serviceDetail.SaleID : null,
        SaleDetailID: serviceDetail.SaleID > 0 ? serviceDetail.ID : null,
        ItemID: serviceDetail.ServiceID,
        IsBookingID: serviceDetail.SaleID > 0 ? false : true ,
        CustomerBookingID:serviceDetail.SaleID == 0 ? serviceDetail.ID : null,
        IsBenefitConsumed : true,
        ClassNoShowBenefit : this.cancellatinPolicyConfig.IsServiceNoShowBenefit,
        ClassCancellationLateBenefit : this.cancellatinPolicyConfig.IsServiceCancellationLateBenefit,
        ClassCancellationEarlyBenefit : this.cancellatinPolicyConfig.IsServiceCancellationEarlyBenefit,
        CancellationEarly: this.cancellatinPolicyConfig.IsServiceCancellationEarly,
        CancellationLate: this.cancellatinPolicyConfig.IsServiceCancellationLate ,
        IsNoShowFlatFee : this.cancellatinPolicyConfig.IsServiceNoShowFlatFee == false ? true : false,
        ServiceStartDate: serviceDetail.StartDate,
        CustomerMembershipID: serviceDetail.CustomerMembershipID > 0 ? serviceDetail.CustomerMembershipID : null,
        DiscountType:(serviceDetail.CustomerMembershipID && this.customerMembershipList.length > 0) ? this.customerMembershipList.filter(x => x.CustomerMembershipID === serviceDetail.CustomerMembershipID)[0].MembershipName : ''
    }

    /***************Set cancellation charges (As Suggested by Ali Raza Khaliq)******************/
    if (this.cancellatinPolicyConfig.IsServiceCancellationLateFlatFee) {
         /**In case flat fee */
            if (this.selectedClient.CustomerTypeID === this.enumCustomerType.Member) {
                Data["CancellationCharges"] = this.cancellatinPolicyConfig.ServiceCancellationLateFlatFeeMember;
            } else {
                Data["CancellationCharges"] = this.cancellatinPolicyConfig.ServiceCancellationLateFlatFeeClientLead;
            }

    } else {
         /**In case percentage fee */
        if (this.selectedClient.CustomerTypeID === this.enumCustomerType.Member) {
            Data["CancellationCharges"] = this.cancellatinPolicyConfig.ServiceCancellationLatePercentageFeeMember;
        } else {
            Data["CancellationCharges"] = this.cancellatinPolicyConfig.ServiceCancellationLatePercentageFeeClientLead;
        }
    }

    /*********************Set NoShow charges ****************/
    if (this.cancellatinPolicyConfig.IsServiceNoShowFlatFee) {
            /**In case flat fee */
                if (this.selectedClient.CustomerTypeID === this.enumCustomerType.Member) {
                    Data["NoShowCharges"] = this.cancellatinPolicyConfig.ServiceNoShowFlatFeeMember;
                } else {
                    Data["NoShowCharges"] = this.cancellatinPolicyConfig.ServiceNoShowFlatFeeClientLead;
                }

    } else {
          /**In case percentage fee */
            if (this.selectedClient.CustomerTypeID === this.enumCustomerType.Member) {
                Data["NoShowCharges"] = this.cancellatinPolicyConfig.ServiceNoShowPercentageFeeMember;
            } else {
                Data["NoShowCharges"] = this.cancellatinPolicyConfig.ServiceNoShowPercentageFeeClientLead;
            }

    }
    return Data;
}

onBookingStatusChange(serviceDetail: any, arrayIndex: number, oldBookingStatusID: any) {

    this.serviceFormData.form.markAsPristine();
    
   // save old selected option/value
   var oldSelectedBookingOption = this.bookingStatusOptions.find(bso => bso.BookingStatusTypeID == oldBookingStatusID.model);
   // for show new selected value name
   this.saveServicesModel.ServiceBookingList[arrayIndex].BookingStatusTypeName = this.bookingStatusOptions.find(bso => bso.BookingStatusTypeID == serviceDetail.BookingStatusTypeID).BookingStatusTypeName;

   var cancelNoShowData = this.bookingStatusChangeModel(serviceDetail);

   if (serviceDetail.BookingStatusTypeID === EnumServiceBookingStatusType.NoShow) {

                /*////if "No Show" policy and NOShow FEE toggle is ON in configuration settings*/
                if(this.cancellatinPolicyConfig.IsServiceNoShow && this.cancellatinPolicyConfig.IsServiceNoShowFee) {
                     // after checking the "No Show" policy for service here we check the amountpaid and cancellation charges( if they both are 0 then we only change the service status)
                      /**###################### Below condition removed as per discussion with Ali Raza Khaliq 09/11/2021##########################
                              * ********************************************************************************************************/
                     // if (serviceDetail.ServiceNoShowCharges == 0 && serviceDetail.TotalAmountPaid == 0 && serviceDetail.SaleID === 0) {
                            //     this.onlyBookingStatusChange(serviceDetail, arrayIndex, oldSelectedBookingOption)

                            // } else {
                                        let dialogRef = this._openDialogue.open(NoShowBookingComponent, {
                                            disableClose: true,
                                            data: {
                                                cancelNoShowData
                                            }
                                        });
                                        dialogRef.componentInstance.confirm.subscribe((isConfirm: boolean) => {
                                             /*if user clicks on "Cancel" Button of NoShow popup then set dropdown previous selected value*/
                                            if (!isConfirm) {
                                                this.setBookingStatusDropDownValue(arrayIndex, oldSelectedBookingOption);
                                            } else {
                                                this.onReloadScheduler.emit(true);
                                                this.onCloseSchedulerServicePopup();
                                            }
                                        });
                                        //////////if charge amount is zero
                                        dialogRef.componentInstance.isServiceNoShowChargesZero.subscribe((isServiceNoShowChargesZero: boolean) => {
                                            if (isServiceNoShowChargesZero) {
                                                /// only change service status to No Show when charge amount is zero
                                                this.updateBookingStatusToCancelOrNoShow(serviceDetail, EnumServiceBookingStatusType.NoShow);
                                                this.onReloadScheduler.emit(true);
                                                this.onCloseSchedulerServicePopup();
                                            }
                                        });
                         //   }

                } else {
                        /*////if "No Show" policy is oFF in configuration settings*/
                        this.onlyBookingStatusChange(serviceDetail, arrayIndex, oldSelectedBookingOption)
                }

   } else if (serviceDetail.BookingStatusTypeID === EnumServiceBookingStatusType.Cancelled) {
                /*////if cancellation policy is ON and Early OR Late cancellation is also ON */
                if(this.cancellatinPolicyConfig.IsServiceCancellation && (this.cancellatinPolicyConfig.IsServiceCancellationEarly || this.cancellatinPolicyConfig.IsServiceCancellationLate) ) {
                             /*after checking the cancelltion policy for service here we check the amount paid and cancellation charges
                             ( if both are 0 and service is not partially paid with 0 amount then we only change the service status)*/
                              /**###################### Below condition removed as per discussion with Ali Raza Khaliq 09/11/2021##########################
                              * ********************************************************************************************************/
                            // if(serviceDetail.ServiceCancellationLateCharges == 0 && serviceDetail.TotalAmountPaid == 0 && serviceDetail.SaleID === 0) {
                            //     this.onlyBookingStatusChange(serviceDetail, arrayIndex, oldSelectedBookingOption)
                            // }
                            // else {
                            let dialogRef = this._openDialogue.open(CancelBookingComponent, {
                                disableClose: true,
                                data: {
                                    cancelNoShowData
                                }
                            });
                            dialogRef.componentInstance.confirm.subscribe((isConfirm: boolean) => {
                                /*if user clicks on "Cancel" Button of Cancellation popup then set dropdown previous selected value*/
                                if (!isConfirm) {
                                    this.setBookingStatusDropDownValue(arrayIndex, oldSelectedBookingOption);
                                }
                            });
                            dialogRef.componentInstance.isCancellationComplete.subscribe((isRefundComplete: boolean) => {
                                if (isRefundComplete) {  this.onCloseSchedulerServicePopup(); this.onReloadScheduler.emit(true);  }
                            });
                            /*if charge amount is zero after calculation*/
                            dialogRef.componentInstance.isServiceCancellationChargesZero.subscribe((isServiceCancellationChargesZero: boolean) => {
                                if (isServiceCancellationChargesZero)
                                {
                                    /// only change service status to "CANCEL" when charge amount is 0
                                    this.updateBookingStatusToCancelOrNoShow(serviceDetail, EnumServiceBookingStatusType.Cancelled);

                                }
                            });
                      //  }

                } else {
                     /*///if cancellation policy is oFF OR Cancellation charges are 0*/
                        this.onlyBookingStatusChange(serviceDetail, arrayIndex, oldSelectedBookingOption)
                }

   } else {

            /*... If status is other than No Show or Cancel.... Send request for Service Status Change */
            this.onlyBookingStatusChange(serviceDetail, arrayIndex, oldSelectedBookingOption)
   }
}


    onlyBookingStatusChange(serviceDetail, arrayIndex, oldSelectedBookingOption) {

        let dialogRef = this._openDialogue.open(AlertConfirmationComponent, { disableClose: true });
        dialogRef.componentInstance.showConfirmCancelButton = true;
        dialogRef.componentInstance.Title = this.messages.Dialog_Title.Alert;
        dialogRef.componentInstance.Message = this.messages.Confirmation.ChangeStatus_Appointment_Message;
        dialogRef.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                this.updateServiceStatusModel.SaleId = serviceDetail.SaleID;
                this.updateServiceStatusModel.DetailId = serviceDetail.ID;
                this.updateServiceStatusModel.BookingStatusTypeID = serviceDetail.BookingStatusTypeID;
                this.changeStatusBookedSaleService(this.updateServiceStatusModel);
            } else {
                // If user Clicks on "No/Cancel" button assign old selected option/value
                this.setBookingStatusDropDownValue(arrayIndex, oldSelectedBookingOption);
                //this.showCheckOutButton = true;
            }
        });

    }

     /*... If charge amount is zero (Unpaid service) Send request for Service Status Change */
    updateBookingStatusToCancelOrNoShow(serviceDetail: any, bookingStatusTypeId: number) {
             this.updateServiceStatusModel.SaleId = serviceDetail.SaleID;
             this.updateServiceStatusModel.DetailId = serviceDetail.ID;
             this.updateServiceStatusModel.BookingStatusTypeID = serviceDetail.BookingStatusTypeID;
             this.changeStatusBookedSaleService(this.updateServiceStatusModel, bookingStatusTypeId);
    }

    /**
    For service booking status dropdown/select value
    */
    setBookingStatusDropDownValue(arrayIndex:number, selectedBookingOption:any):void {

        this.saveServicesModel.ServiceBookingList[arrayIndex].BookingStatusTypeName = selectedBookingOption.BookingStatusTypeName;
        this.saveServicesModel.ServiceBookingList[arrayIndex].BookingStatusTypeID =  selectedBookingOption.BookingStatusTypeID  == this.enumServiceStatusBooked.InProgress ? this.enumServiceStatusBooked.InProgress
                                                                                    : selectedBookingOption.BookingStatusTypeID == this.enumServiceStatusBooked.Booked ? this.enumServiceStatusBooked.Booked
                                                                                    : selectedBookingOption.BookingStatusTypeID == this.enumServiceStatusBooked.NotConfirmed ? this.enumServiceStatusBooked.NotConfirmed
                                                                                    : selectedBookingOption.BookingStatusTypeID == this.enumServiceStatusBooked.Confirmed ? this.enumServiceStatusBooked.Confirmed
                                                                                    : selectedBookingOption.BookingStatusTypeID == this.enumServiceStatusBooked.Completed ? this.enumServiceStatusBooked.Completed
                                                                                    : selectedBookingOption.BookingStatusTypeID == this.enumServiceStatusBooked.ReadyToStart ? this.enumServiceStatusBooked.ReadyToStart
                                                                                    : selectedBookingOption.BookingStatusTypeID == this.enumServiceStatusBooked.CheckedInByStaff ? this.enumServiceStatusBooked.CheckedInByStaff
                                                                                    : selectedBookingOption.BookingStatusTypeID == this.enumServiceStatusBooked.NoShow ? this.enumServiceStatusBooked.NoShow
                                                                                    : selectedBookingOption.BookingStatusTypeID == this.enumServiceStatusBooked.Cancelled ? this.enumServiceStatusBooked.Cancelled
                                                                                    : this.enumServiceStatusBooked.Booked;

        }

    /*Send request to change booked sale service status */
    changeStatusBookedSaleService(updateServiceStatus: UpdateSaleServiceStatusModel, bookingStatusTypeId: number = 0) {

        let APIURL = SchedulerServicesApi.changeSaleServiceStatus;
        this._httpService.save(APIURL, updateServiceStatus)
            .subscribe(
                response => {
                    if (response['MessageCode'] > 0) {
                        this.onReloadScheduler.emit(true);
                        /* Display success message conditionally for NOSHOW and Cancell */
                        if (bookingStatusTypeId == EnumServiceBookingStatusType.NoShow) {
                            this._messageService.showSuccessMessage(this.messages.Success.NOShow_Success.replace("{0}", "Service"));
                        } else if (bookingStatusTypeId == EnumServiceBookingStatusType.Cancelled) {
                            this._messageService.showSuccessMessage(this.messages.Success.Cancelled_Success.replace("{0}", "Service"));
                        } else {
                            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Service"));
                        }

                        //this.onCloseSchedulerServicePopup();

                    } else {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service"));
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service"));
                }
            );
    }

    /*save and checkout service*/
    saveAndCheckoutService(isvalid: boolean) {
         /*Save Service   */
        this.isShowError = false;
        isvalid = true;
        isvalid = this.validateFormOnSubmit();

        if (this.selectedClient) {
            if (this.selectedClient.CustomerID) {
                if (isvalid && this.serviceFormData.dirty) {
                    /*CheckOut Service   */
                    this.openDialogForServiceCheckout();
                }
            } else {
                this.searchClientControl.setValue('');
            }
        }
        else {
            this.searchClientControl.setValue('');
        }
    }

    openDialogForServiceCheckout(ID: number = 0) {

        if (!this.isShowError) {

            let saleInvoice = new SaleInvoice(), _grossAmount = 0, _vatTotal = 0;
            saleInvoice.TotalEarnedRewardPoints = 0;
            saleInvoice.ApplicationArea = SaleArea.Service;  // to send pos from scheduler
            this.posCartItems = [];

            saleInvoice.SaleDetailList = [];
            saleInvoice.CustomerID = this.selectedClient.CustomerID;

            let serviceBookingListForCheckout = this.saveServicesModel.ServiceBookingList.filter(x => (x.SaleStatusTypeID === EnumSaleStatusType.Unpaid && x.BookingStatusTypeID !== this.enumBookingStatusType.NoShow) && x.IsPartialPaid == false);

            serviceBookingListForCheckout.forEach(_singleService => {

                //** sale invoice save into DB */
                let saleService = new POSSaleDetail();
                
                saleService.CustomerBookingID = _singleService.ID;
                // added by fahad zone issue
                saleService.StartDate = this._dateTimeService.convertDateObjToStringNotChangeDate(new Date(_singleService.StartDate), "YYYY-MM-DD");
                saleService.ItemID = _singleService.ServicePackageID;
                saleService.FacilityID = _singleService.FacilityID == 0 ? null : _singleService.FacilityID;
                saleService.ItemTypeID = POSItemType.Service;
                saleService.StartTime = this._dateTimeService.convertDateObjToString(new Date(_singleService.StartTime), this.timeFormatDifference);
                saleService.EndTime = this._dateTimeService.convertDateObjToString(new Date(_singleService.EndTime), this.timeFormatDifference);
                saleService.Qty = 1;
                saleService.CustomerMembershipID = _singleService.IsMembershipBenefit && _singleService.CustomerMembershipID == this.customerMembershipId ? this.customerMembershipId
                : _singleService.IsMembershipBenefit && _singleService.CustomerMembershipID ? _singleService.CustomerMembershipID :  null;
                saleService.ItemDiscountAmount = _singleService.ItemDiscountAmount ? _singleService.ItemDiscountAmount : 0;
                saleService.AssignedToStaffID = _singleService.AssignedToStaffID;
                saleService.Note = _singleService.Description;
                saleService.Description = _singleService.Description;
                
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
                cartItem.Price = _singleService.IsFree ? 0 : _singleService.PricePerSession - cartItem.TotalDiscount;
                cartItem.Qty = 1;
                cartItem.PricePerSession = _singleService.PricePerSession;
                cartItem.DiscountType = (saleService.CustomerMembershipID && this.customerMembershipList.length > 0) ? this.customerMembershipList.filter(x => x.CustomerMembershipID === _singleService.CustomerMembershipID)[0].MembershipName : '';
                cartItem.TotalTaxPercentage = this.ServicePackageList.filter((item: any) => item.ServicePackageID == _singleService.ServicePackageID)[0].TotalTaxPercentage; // TODO: get vat total from service package in fundamentals
                cartItem.TotalAmountExcludeTax = _singleService.IsFree ? 0 : (cartItem.Qty * (cartItem.PricePerSession - cartItem.TotalDiscount));
                cartItem.ItemDiscountAmount = _singleService.ItemDiscountAmount ? _singleService.ItemDiscountAmount : 0;

                cartItem.ItemTotalTaxAmount = (this._taxCalculationService.getTaxAmount(cartItem.TotalTaxPercentage, cartItem.Price) * cartItem.Qty);
                cartItem.TotalAmountIncludeTax = this._taxCalculationService.getRoundValue(cartItem.TotalAmountExcludeTax + cartItem.ItemTotalTaxAmount);

                // this line added for membership benifit if benefit apply not change value "TotalAmountExcludeTax" for dicount other wise pos cart item and total due show wrong values added by Fahad dated on 13/09/2021
                cartItem.TotalAmountExcludeTax =  cartItem.ItemDiscountAmount > 0 ? this._taxCalculationService.getRoundValue(cartItem.PricePerSession * cartItem.Qty) : cartItem.TotalAmountExcludeTax;

                if(this.isRewardProgramInPackage) {
                    this._commonService.getItemRewardPoints(POSItemType.Service, _singleService.ServiceID, this.selectedClient.CustomerID, _singleService.IsFree, false, saleService.CustomerMembershipID ? true : false).subscribe((response: any) => {
                        cartItem.AmountSpent = response.Result.AmountSpent;
                        cartItem.MemberBaseEarnPoints = response.Result.MemberBaseEarnPoints ?  response.Result.MemberBaseEarnPoints : 0;
                        cartItem.CustomerEarnedPoints = response.Result.CustomerEarnedPoints ? response.Result.CustomerEarnedPoints : 0;
                        saleInvoice.TotalEarnedRewardPoints += this._commonService.calculateRewardPointsPerItem(this.selectedClient, cartItem);
                    })

                    this.posCartItems.push(cartItem);

                    _grossAmount += cartItem.ItemDiscountAmount > 0 ? cartItem.TotalAmountExcludeTax - cartItem.ItemDiscountAmount : cartItem.TotalAmountExcludeTax;
                    _vatTotal += cartItem.TotalTaxPercentage;
                } else{
                    this.posCartItems.push(cartItem);

                    _grossAmount += cartItem.ItemDiscountAmount > 0 ? cartItem.TotalAmountExcludeTax - cartItem.ItemDiscountAmount : cartItem.TotalAmountExcludeTax;
                    _vatTotal += cartItem.TotalTaxPercentage;
                }

            });

            this.posPaymentDailog(_grossAmount, saleInvoice)

        }
    }

    sendSchedulerServiceSaveRequest(saveModel: SchedulerServiceModel) {

      //remove customer membership id when service not a part of membership

      saveModel.ServiceBookingList.forEach( (service) => {
          if(service.CustomerMembershipID > 0){
              service.CustomerMembershipID = service.IsFree || service.DiscountPercentage > 0 ? service.CustomerMembershipID : null;
          }
      });

        this._httpService.save(SchedulerServicesApi.saveSchedulerService, saveModel)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0 && response.Result.length > 0) {
                        // this.donotScrollToTime = true;
                        ///set CustomerId
                        this._cellDataSelection.CustomerID = saveModel.CustomerID;
                        var savedItems = response.Result;
                        this.saveServicesModel.ServiceBookingList = JSON.parse(JSON.stringify(this.saveServicesModel.ServiceBookingList));
                        this.saveServicesModel.ServiceBookingList.forEach( (service) => {
                            service.StartDate = this._dateTimeService.convertStringIntoDateForScheduler(service.StartDate.toString());
                            /*/////Enable checkout button///*/
                            if ((service.SaleStatusTypeID === EnumSaleStatusType.Unpaid || service.SaleStatusTypeID === EnumSaleStatusType.PartialPaid) && service.BookingStatusTypeID !== this.enumBookingStatusType.NoShow) {
                                this.showCheckOutButton = true;
                            }
                        });
                        for (let result of savedItems) {
                            let itemMatched = [];
                            let sDate = null, sTime= null, eTime = null;
                                 sDate = this._dateTimeService.convertStringIntoDateForScheduler(result.StartDate);
                                 sTime = this._dateTimeService.convertTimeStringToDateTime(result.StartTime, sDate);
                                 eTime = this._dateTimeService.convertTimeStringToDateTime(result.EndTime, sDate);

                            itemMatched = this.saveServicesModel.ServiceBookingList.filter((service) =>
                                service.ServiceID === result.ServiceID &&
                                service.ServicePackageID === result.ServicePackageID &&
                                service.AssignedToStaffID === result.AssignedToStaffID &&
                                service.FacilityID === result.FacilityID &&
                                new Date(service.StartDate).setHours(0, 0, 0, 0).toString() ==  new Date(sDate).setHours(0, 0, 0, 0).toString() &&
                                new Date(service.StartTime).toString().split(" ").splice(4, 1).toString() == new Date(sTime).toString().split(" ").splice(4, 1).toString() &&
                                new Date(service.EndTime).toString().split(" ").splice(4, 1).toString() == new Date(eTime).toString().split(" ").splice(4, 1).toString()
                            );

                             /*****######### Replace ID with booking ID for update/checkout purpose & Set other properties that
                              are being used in NoShow/cancellation e.g (TotalAmountPaid, DiscountPrice, SaleTotalPrice, BookingStatusTypeID) ######******/

                             var matchItemLength = itemMatched.length;
                             if(matchItemLength && matchItemLength == 1 && itemMatched[0].ID == 0) {
                                itemMatched[0].ID = result.ID;
                                itemMatched[0].SaleID = 0;
                                itemMatched[0].TotalAmountPaid = 0;
                                itemMatched[0].ItemTaxPrice = result.ItemTaxPrice;
                                itemMatched[0].DiscountPrice = result.DiscountPrice;
                                itemMatched[0].SaleTotalPrice = result.SaleTotalPrice;
                                itemMatched[0].SaleStatusTypeName = "Unpaid";
                                itemMatched[0].BookingStatusTypeID = EnumBookingStatusType.Booked;
                                itemMatched[0][this.schedulerStaticStrings.GetSchedulerStaticString.SelectedForCheckout] = true;
                                this._cellDataSelection.id = result.ID;
                            } else if(matchItemLength > 1) {
                                /**In case If same service is booked multiple time with same properties  */
                                for (let i = 0; i < matchItemLength; i++) {
                                    if (itemMatched[i].ID == 0) {
                                        itemMatched[i].ID = result.ID;
                                        this._cellDataSelection.id = result.ID;
                                        itemMatched[i].SaleID = 0;
                                        itemMatched[i].TotalAmountPaid = 0;
                                        itemMatched[i].ItemTaxPrice = result.ItemTaxPrice;
                                        itemMatched[i].DiscountPrice = result.DiscountPrice;
                                        itemMatched[i].SaleTotalPrice = result.SaleTotalPrice;
                                        itemMatched[i].SaleStatusTypeName = "Unpaid";
                                        itemMatched[i].BookingStatusTypeID = EnumBookingStatusType.Booked;
                                        itemMatched[i][this.schedulerStaticStrings.GetSchedulerStaticString.SelectedForCheckout] = true;
                                        break;
                                     }
                                }

                            }


                        } /**Loop ends here */

                        this.setCheckDisabledButton();
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Service"));
                        this.isSaveButtonDisabled = false;
                        this.serviceFormData.form.markAsPristine();
                        this.onReloadScheduler.emit(true);
                    } else {
                        this.saveServicesModel.ServiceBookingList = [];
                        this._messageService.showErrorMessage(response.MessageText);
                        this.onReloadScheduler.emit(true);
                        this.isSaveButtonDisabled = false;
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Service"));
                    this.onReloadScheduler.emit(true);
                    this.isSaveButtonDisabled = false;
                }
            );

    }

    /**For Membership dropdown/select in service */
    onMembershipChange(event, arrayIndex) {
        this.customerMembershipId = this.saveServicesModel.ServiceBookingList[arrayIndex].CustomerMembershipID;
        this.remainingSessionDetail = [];
        let serviceSessoin = this.serviceBenefitsPackage.filter(c => c.GlobalRemainingSession && c.GlobalRemainingSession > 0 && c.CustomerMembershipID == this.saveServicesModel.ServiceBookingList[arrayIndex].CustomerMembershipID)[0];

        if (serviceSessoin) {
              this.serviceGlobalRemainingSession = serviceSessoin.GlobalRemainingSession ? serviceSessoin.GlobalRemainingSession : null;
              this.saveServicesModel.ServiceBookingList.forEach( (service) => {
                  if(service.IsMembershipBenefit && service.ServiceID > 0 && service.ServicePackageID > 0 && service.CustomerMembershipID == this.customerMembershipId && this.serviceGlobalRemainingSession != null && (service.ID == 0 || service.ID == null || service.ID == undefined) && (service.SaleID == 0 || service.SaleID == null || service.SaleID == undefined)){
                      if(this.saveServicesModel.ServiceBookingList.length > 1){
                          this.serviceGlobalRemainingSession = this.serviceGlobalRemainingSession - 1;
                      }
                  }

            });
        }

        this.onServiceChange(this.saveServicesModel.ServiceBookingList[arrayIndex].ServiceID, arrayIndex, this.saveServicesModel.ServiceBookingList[arrayIndex].ServicePackageID, true);
    }

    getCustomerMemberhsips(CustomerID, IsEditService: boolean = true) {
        let url = SaleApi.getCustomerMemberhsips.replace("{customerID}", CustomerID.toString())
        this._httpService.get(url)
            .subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.hasMemberhsip = res.Result && res.Result.length > 0 ? true : false;
                        if (this.hasMemberhsip) {
                            this.customerMembershipList = res.Result;
                            if(!IsEditService) {
                                setTimeout(()=> {
                                    this.saveServicesModel.ServiceBookingList[0].CustomerMembershipID = this.customerMembershipList[0].CustomerMembershipID;
                                    this.customerMembershipId = this.customerMembershipList[0].CustomerMembershipID;
                                    this.onServiceChange(this.saveServicesModel.ServiceBookingList[0].ServiceID, 0, this.saveServicesModel.ServiceBookingList[0].ServicePackageID, true);
                                700})
                          }
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
    /**Membership dropdown End*/

    onCloseSchedulerServicePopup() {
        this.onCancel.emit(true);
    }

    ngOnDestroy() {
        this.saveServicesModel.ServiceBookingList = [];
        this.serviceFormData.form.reset();
        this.ServicePackageList = [];
        this.serviceList = [];
        this.FacilityList = [];
    }

    // #endregion


}

