import { noUndefined } from '@angular/compiler/src/util';
import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MatOption } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePickerComponent } from '@app/application-dialog-module/date-picker/date.picker.component';
import { AppUtilities } from '@app/helper/aap.utilities';
import { Configurations } from '@app/helper/config/app.config';
import { ENU_DateFormatName, POSItemType } from '@app/helper/config/app.enums';
import { Messages } from '@app/helper/config/app.messages';
import { ImagesPlaceholder } from '@app/helper/config/app.placeholder';
import { PointOfSaleApi } from '@app/helper/config/app.webapi';
import { ApiResponse, DD_Branch } from '@app/models/common.model';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { DataSharingService } from '@app/services/data.sharing.service';
import { DateTimeService } from '@app/services/date.time.service';
import { TaxCalculation } from '@app/services/tax.calculations.service';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { environment } from '@env/environment';
import { borderTopRightRadius } from 'html2canvas/dist/types/css/property-descriptors/border-radius';
import { SubscriptionLike } from 'rxjs';
import { CartWaitListService, POSServiceModel, POSServicePackageModel, SaleService, SaleWaitListService, ServiceStaff, ServiceViewModel, WaitListWorkTimeBrackets } from '../models/point.of.sale.model';
import { POSServiceDetailComponent } from '../services/pos.service.detail.component';

@Component({
    selector: 'app-add-to-waitlist',
    templateUrl: './add.to.waitlist.component.html',
})
export class AddToWaitlistComponent extends AbstractGenericComponent implements OnInit {

    @Output() saleServiceWaitListModel = new EventEmitter<SaleService[]>();

    @ViewChild('datePickerComp') datePickerComp: DatePickerComponent;

    @ViewChild('allSelectedTimeBracket') private allSelectedTimeBracket: MatOption;

    /* Local Members */
    serviceTimeSlot: any;
    isSaveInProgress: boolean;
    currencyFormat: string;
    serviceDate: Date = new Date();
    minServiceDate: Date = new Date();
    servicePackageDiscounted: boolean;
    servicePackageDiscount: number;
    remainingSession: boolean;
    isMembershipExpire: boolean;
    isBenefit: boolean;
    disabledDays: string;
    isShowData: boolean = false;
    customerMembershipID: number;
    note: string = "";
    isShowDateError: boolean = false;
    isTimeBracketError: boolean = false;

    /* Collection Models */
    saleService: SaleWaitListService;
    serviceStaffList: ServiceStaff[];
    waitListWorkTimeBrackets: WaitListWorkTimeBrackets[];
    servicesList: POSServiceModel = new POSServiceModel();
    waitListedItem: SaleService[] = new Array<SaleService>();
    /* Model References */


    service: POSServiceModel = new POSServiceModel();
    selectedStaff: ServiceStaff = new ServiceStaff();
    selectedServicePackage: POSServicePackageModel = new POSServicePackageModel();
    selectedTimeBracket: WaitListWorkTimeBrackets[] = [];
    anyTimeBracket: WaitListWorkTimeBrackets = new WaitListWorkTimeBrackets();

    /* Configurations */
    timeFormat = Configurations.TimeFormat;
    messages = Messages;
    serverImageAddress = environment.imageUrl;
    timeList = [];

    cartWaitListService: CartWaitListService[] = new Array<CartWaitListService>();;

    /* Private Members */
    private readonly DATE_FORMAT = "MM/dd/yyyy";
    private readonly MEMBERSHIP_DATE_FORMAT = "yyyy-MM-dd";


    dateFormat: string = "";
    longDateFormat: string = "";
    // #endregion

    constructor(private _httpService: HttpService,
        private _dialogRef: MatDialogRef<POSServiceDetailComponent>,
        private _openDialog: MatDialogService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        private _taxCalculation: TaxCalculation,
        public dialogRef: MatDialogRef<AddToWaitlistComponent>,
        @Inject(MAT_DIALOG_DATA) public serviceVM: ServiceViewModel
    ) {
        super();
    }

    ngOnInit(): void {
        this.servicesList = JSON.parse(JSON.stringify(this.serviceVM.serviceModel));
        this.getCurrentBranchDetail();
        this.mapServiceBenefits();

        this.saleService = new SaleWaitListService();
        this.selectedServicePackage = this.service.ServicePackageList && this.service.ServicePackageList.length > 0 ? this.service.ServicePackageList[0] : null;
        this.checkIsServicePackageFree(this.service.ServicePackageList[0]);

    }

   

    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.longDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.LongDateFormat);
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        //---- set date according to branch timezone. ignore browser datetime, get only branch datetime Added by Fahad--////
        this.minServiceDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.serviceDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.saleService.ServiceDate = this._dateTimeService.convertDateObjToString(this.serviceDate, this.DATE_FORMAT);
        this.getServiceStaffList();
    }

    //#region Events

    onServiceDateChange(serviceBookingDate: any) {
        this.isShowDateError = false;
        this.saleService.ServiceDate = serviceBookingDate;
        if (this.service.MembershipEndDate) {
            if (this._dateTimeService.compareTwoDates(new Date(serviceBookingDate), new Date(this.service.MembershipEndDate))) {
                setTimeout(() => {
                    this.isMembershipExpire = false;
                    this.service = this.servicesList;
                    this.mapServiceBenefits();
                    this.getServiceStaffList();
                });
            }
            else {
                this.isMembershipExpire = true;
                this.serviceDate = new Date(serviceBookingDate);
                // this._messageService.showErrorMessage(this.messages.Error.Invalid_Service_Date);
                // this._messageService.showWarningMessage(this.messages.Confirmation.Member_Limit_Has_Reached_Are_You_Sure_You_Want_To_Continue);
                this.updateServicePackages();

            }
        }
        else {
            //this.saleService.ServiceDate = serviceBookingDate;
            this.getServiceStaffList();
        }
    }

    onServicePackageChange(servicePackage: POSServicePackageModel) {
        this.checkIsServicePackageFree(servicePackage);
        this.getServiceStaffList();
    }

    onStaffChange(staffID: number) {
        this.setStaffID(staffID);
        this.serviceTimeSlot = null;
    }

    onAddToCartItem() {
        this.cartWaitListService = this.cartWaitListService == null ? [] : this.cartWaitListService;
        if (!this.datePickerComp.dateElement.invalid && this.selectedTimeBracket != null && this.selectedTimeBracket?.length != 0) {
            this.isShowDateError = false;
            if (this.selectedTimeBracket.find(sbt => sbt.BranchWorkTimeBracketID == 0)) {
                this.itemAddedToCart(this.selectedTimeBracket.find(sbt => sbt.BranchWorkTimeBracketID == 0));
            } else {
                this.selectedTimeBracket.forEach(timeBracket => {
                    this.itemAddedToCart(timeBracket);
                });
            }
        } else {
            if (this.datePickerComp.dateElement.invalid) {
                this.isShowDateError = true;
                return;
            }
            if (this.selectedTimeBracket != null && this.selectedTimeBracket?.length == 0) {
                this.isTimeBracketError = true;
                return;
            }
        }
    }

    itemAddedToCart(timeBracket) {
        var newItem = this.mapCartItemDataForShow(timeBracket);

        if (!this.cartWaitListService.some(
            waitListDetail => waitListDetail.ServiceBranchWorkTimeBracketID === newItem.ServiceBranchWorkTimeBracketID &&
                waitListDetail.StaffID == newItem.StaffID &&
                waitListDetail.ServiceDate == newItem.ServiceDate &&
                waitListDetail.ServiceBranchWorkTimeBracketName === newItem.ServiceBranchWorkTimeBracketName &&
                waitListDetail.ServicePackageID === newItem.ServicePackageID
        )
        ) {

            // if(!this.checkSameDateAndTimeAlredyExistInPOSCart(newItem) && !this.checkSameDateAndTimeAlredyExistInWaitListCart(newItem)){
            //     this.cartWaitListService.push(newItem);
            // }

            if (!this.checkSameDateAndTimeAlredyExistInWaitListCart(newItem) && this.checkAnyStaffValidation(newItem)) {
                this.cartWaitListService.push(newItem);
            }
        } else{
            this._messageService.showErrorMessage(this.messages.Validation.Choose_Another_Service_Time);
        }
    }

    checkAnyStaffValidation(newItem){
       var result = this.cartWaitListService.filter(i => i.ServicePackageID == newItem.ServicePackageID && i.ServiceDate == newItem.ServiceDate && i.ServiceBranchWorkTimeBracketName == newItem.ServiceBranchWorkTimeBracketName);
       if(result && result.length > 0){
        if(result.find(i => i.StaffID == 0)){
            this._messageService.showErrorMessage(this.messages.Validation.Choose_Another_Service_Time);
            return false;
        } else if(newItem.StaffID == 0){
            this._messageService.showErrorMessage(this.messages.Validation.Choose_Another_Service_Time);
            return false;
        } else{
            return true;
        }
       } else{
           return true;
       }

    }

    toggleAllTimeBracketSelection() {

        this.isTimeBracketError = false;
        this.selectedTimeBracket = [];

        if (this.allSelectedTimeBracket.selected) {
            this.waitListWorkTimeBrackets.forEach(timeBracket => {
                this.selectedTimeBracket.push(timeBracket);
            });

            setTimeout(() => {
                this.allSelectedTimeBracket.select();
            }, 100);

        }
    }

    tosslePerOneTimeBracket() {
        this.isTimeBracketError = false;
        if (this.allSelectedTimeBracket && this.allSelectedTimeBracket.selected) {
            this.allSelectedTimeBracket.deselect();
            return false;
        }

        if (this.waitListWorkTimeBrackets.length == this.selectedTimeBracket.length && this.waitListWorkTimeBrackets.length > 1) {
            this.allSelectedTimeBracket.select();
        }

    }

    checkSameDateAndTimeAlredyExistInPOSCart(newItem) {
        let sameDateServices = this.serviceVM.servicesInCart.filter(c =>
            c.ItemTypeID === POSItemType.Service &&
            this._dateTimeService.convertDateObjToString(new Date(c.ServiceDate), this.DATE_FORMAT) ===
            this._dateTimeService.convertDateObjToString(new Date(newItem.ServiceDate), this.DATE_FORMAT))

        //this.serviceVM.servicesInCart
        let isTimeOverlap = false;
        if (sameDateServices && sameDateServices.length > 0) {
            for (let index = 0; index < sameDateServices.length; index++) {

                isTimeOverlap = (sameDateServices[index].ServiceStartTime < newItem.ServiceEndTime) &&
                    (newItem.ServiceStartTime < sameDateServices[index].ServiceEndTime);
                if (isTimeOverlap) {
                    break;
                }
            }
        }

        if (isTimeOverlap) {
            this._messageService.showErrorMessage(this.messages.Validation.Choose_Another_Service_Time);
            this.isSaveInProgress = false;
        }

        return isTimeOverlap;
    }

    checkSameDateAndTimeAlredyExistInWaitListCart(newItem) {
        let sameDateServices = this.cartWaitListService.filter(c =>
            this._dateTimeService.convertDateObjToString(new Date(c.ServiceDate), this.DATE_FORMAT) ===
            this._dateTimeService.convertDateObjToString(new Date(newItem.ServiceDate), this.DATE_FORMAT))

        //this.serviceVM.servicesInCart
        let isTimeOverlap = false;
        if (sameDateServices && sameDateServices.length > 0) {
            for (let index = 0; index < sameDateServices.length; index++) {

                isTimeOverlap = (sameDateServices[index].ServiceStartTime < newItem.ServiceEndTime) &&
                    (newItem.ServiceStartTime < sameDateServices[index].ServiceEndTime && sameDateServices[index].ServicePackageID == newItem.ServicePackageID && sameDateServices[index].StaffID == newItem.StaffID);
                if (isTimeOverlap) {
                    break;
                }
            }
        }

        if (isTimeOverlap) {
            this._messageService.showErrorMessage(this.messages.Validation.Choose_Another_Service_Time);
            this.isSaveInProgress = false;
        }

        return isTimeOverlap;
    }

    mapCartItemDataForShow(timeBracket: any) {

        var newItem = new CartWaitListService();

        newItem.ServiceBranchWorkTimeBracketID = timeBracket.BranchWorkTimeBracketID;
        newItem.ServiceBranchWorkTimeBracketName = timeBracket.BracketName;
        newItem.ServiceEndTime = timeBracket.EndTime;
        newItem.ServiceStartTime = timeBracket.StartTime;
        newItem.ServiceStartTimeForShow = this._dateTimeService.formatTimeString(timeBracket.StartTime, this.timeFormat);
        newItem.ServiceEndTimeForShow = this._dateTimeService.formatTimeString(timeBracket.EndTime, this.timeFormat);
        newItem.ServiceDate = this.saleService.ServiceDate;
        newItem.StaffFullName = this.selectedStaff.StaffFullName
        newItem.StaffID = this.selectedStaff.StaffID;
        newItem.ServiceDurationTypeName = this.selectedServicePackage.DurationTypeName;
        newItem.ServiceDurationValue = this.selectedServicePackage.DurationValue;
        newItem.ServicePackageID = this.selectedServicePackage.ServicePackageID;
        newItem.IsWaitlistItem = true;
        newItem.CustomerMembershipID = this.customerMembershipID;
        newItem.Note = this.note;

        return newItem;
    }

    onDeleteCartItem(arrayIndex) {
        this.cartWaitListService.splice(arrayIndex, 1);
    }

    onClose() {
        this._dialogRef.close();
    }

    onAddToWaitList() {
        this.waitListedItem = [];

        this.cartWaitListService.forEach(waitlistCartItem => {

            var waitListItem = new SaleService();
            waitListItem.IsWaitlistItem = true;
            waitListItem.Note = waitlistCartItem.Note;
            waitListItem.ServiceDate = waitlistCartItem.ServiceDate;
            waitListItem.ServiceEndTime = waitlistCartItem.ServiceEndTime;
            waitListItem.ServicePackageID = waitlistCartItem.ServicePackageID;
            waitListItem.ServiceStartTime = waitlistCartItem.ServiceStartTime;
            waitListItem.StaffID = waitlistCartItem.StaffID > 0 ? waitlistCartItem.StaffID : null;

            this.waitListedItem.push(waitListItem);
        })

        this.saleServiceWaitListModel.emit(this.waitListedItem);
        this.closeDialog()
    }

    //#endregion Events

    //#region Methods

    setDefaultDesiredTime() {
        setTimeout(() => {
            this.allSelectedTimeBracket?.select();
            this.toggleAllTimeBracketSelection();
        }, 100);
    }

    setStaffID(staffID: number) {
        this.saleService.StaffID = staffID;
    }

    getServiceStaffList() {
        this.checkIsServicePackageFree(this.service.ServicePackageList.filter(item => item.ServicePackageID == this.selectedServicePackage.ServicePackageID)[0]);
        this.serviceStaffList = [];
        let params = {
            ServiceDate: this._dateTimeService.convertDateObjToString(new Date(this.saleService.ServiceDate), this.DATE_FORMAT),
            ServicePackageID: this.selectedServicePackage.ServicePackageID,
            IsWaitListAllow: true
        }
        this._httpService.get(PointOfSaleApi.getServiceStaff, params)
            .subscribe(
                (res:ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.serviceStaffList = res.Result.WaitListStaffs;
                        this.selectedStaff = this.serviceStaffList[0];
                        this.saleService.StaffID = this.selectedStaff.StaffID;
                        this.waitListWorkTimeBrackets = res.Result.WaitListWorkTimeBrackets;

                        this.anyTimeBracket = this.waitListWorkTimeBrackets.find(wtb => wtb.BranchWorkTimeBracketID == 0);
                        this.waitListWorkTimeBrackets = this.waitListWorkTimeBrackets.filter(wtb => wtb.BranchWorkTimeBracketID != 0);

                        this.setDefaultDesiredTime();

                        //this.selectedTimeBracket = this.selectedTimeBracket;
                        this.serviceTimeSlot = null;
                        this.disabledDays = res.Result.ServiceWaitListDaysList;

                        this.serviceStaffList.forEach(staff => {
                            staff.ImagePath = staff.ImagePath && staff.ImagePath !== '' ?
                                this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + staff.ImagePath : ImagesPlaceholder.user;
                        });

                        this.generateTimeSlotID();


                        this.isShowData = true;

                    }
                    else {
                        this.selectedStaff = null;
                        this.isShowData = true;
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', 'Staff List'))
                    this.isShowData = true;
                }
            )
    }

    closeDialog() {
        this._dialogRef.close();
    }

    generateTimeSlotID() {
        this.serviceStaffList.forEach(staff => {
            if (staff && staff.TimeSlotList && staff.TimeSlotList.length > 0) {
                staff.TimeSlotList.forEach(timeSlot => {
                    timeSlot.ID = staff.StaffID + ' ' + timeSlot.Time;
                })
            }
        })
    }

    getDiscountAmountPerItem(item: any) {
        return (item.Price - (item.Price * item.DiscountPercentage) / 100);

    }

    mapServiceBenefits() {
        if (this.serviceVM) {
            this.service = this.serviceVM.serviceModel;
            this.service.ServicePackageList.forEach(servicePackage => {

                if (this.service.IsMembershipBenefit && !servicePackage.IsBenefitsSuspended && servicePackage.DiscountPercentage == 100 && (servicePackage.RemainingSession == null || servicePackage.RemainingSession != 0)) {
                    this.remainingSession = true;
                    this.isBenefit = true;
                    servicePackage.CurrentPrice = 0;
                    servicePackage.TotalDiscount = servicePackage.Price;
                    servicePackage.IsMembershipBenefit = this.service.IsMembershipBenefit;
                    servicePackage.IsBenefitsSuspended = servicePackage.IsBenefitsSuspended;
                    servicePackage.IsFree = this.service.IsFree;
                    servicePackage.PricePerSession = servicePackage.Price;
                }
                else if (this.service.IsMembershipBenefit && !servicePackage.IsBenefitsSuspended && servicePackage.DiscountPercentage <= 100 && (servicePackage.RemainingSession == null || servicePackage.RemainingSession != 0)) {
                    this.remainingSession = true;
                    this.isBenefit = true;
                    servicePackage.IsBenefitsSuspended = servicePackage.IsBenefitsSuspended;
                    servicePackage.CurrentPrice = servicePackage.DiscountPercentage > 0 && (servicePackage.RemainingSession > 0 || servicePackage.RemainingSession == null) ? this.getDiscountAmountPerItem(servicePackage) : servicePackage.Price;
                    servicePackage.TotalDiscount = servicePackage.DiscountPercentage > 0 ? this._taxCalculation.getTwoDecimalDigit(((servicePackage.Price * servicePackage.DiscountPercentage) / 100)) : 0;
                    servicePackage.IsMembershipBenefit = servicePackage.DiscountPercentage > 0 ? this.service.IsMembershipBenefit : false;
                    servicePackage.PricePerSession = servicePackage.Price;
                }
                else {
                    this.isBenefit = false;
                    servicePackage.DiscountPercentage = null;
                    servicePackage.IsBenefitsSuspended = this.service.IsBenefitsSuspended;
                    servicePackage.CurrentPrice = servicePackage.Price;
                    servicePackage.TotalDiscount = 0;
                    servicePackage.IsMembershipBenefit = false;
                    servicePackage.IsFree = false;
                    servicePackage.PricePerSession = servicePackage.Price;
                }
            });
        }
    }

    updateServicePackages() {
        this.service = this.serviceVM.serviceModel;

        if (!this._dateTimeService.checkMembershipEndDate(new Date(this.saleService.ServiceDate), new Date(this.service.MembershipEndDate))) {
            this.service.ServicePackageList.forEach(servicePackage => {
                this.isBenefit = false;
                servicePackage.IsBenefitsSuspended = this.service.IsBenefitsSuspended;
                servicePackage.CurrentPrice = servicePackage.Price;
                servicePackage.TotalDiscount = 0;
                servicePackage.IsMembershipBenefit = false;
                servicePackage.IsFree = false;
                servicePackage.PricePerSession = servicePackage.Price;
                this.servicePackageDiscounted = false;

            });
            this.checkIsServicePackageFree(this.service.ServicePackageList[0]);
        }
    }

    checkIsServicePackageFree(item: any): void {
        if (item.IsMembershipBenefit && item.DiscountPercentage && item.DiscountPercentage == 100) {
            this.servicePackageDiscount = null;
            this.service.IsBenefit = true;
            this.servicePackageDiscounted = false;
            this.customerMembershipID = item.CustomerMembershipID;
        }
        else if (item.IsMembershipBenefit && item.DiscountPercentage && item.DiscountPercentage < 100) {
            this.servicePackageDiscount = item.DiscountPercentage;
            this.servicePackageDiscounted = true;
            this.service.IsBenefit = false;
            this.customerMembershipID = item.CustomerMembershipID;
        }
        else {
            this.servicePackageDiscount = null;
            this.servicePackageDiscounted = false;
            this.service.IsBenefit = false;
            this.customerMembershipID = null;
        }

    }

    onClosePopup() {
        this.dialogRef.close();
    }
}
