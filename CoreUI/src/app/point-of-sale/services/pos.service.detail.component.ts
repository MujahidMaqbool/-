/********************** Angular References *********************/
import { Component, OnInit, Inject, Output, EventEmitter } from "@angular/core";

/********************** Angular Material References *********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/****************** Services & Models *****************/
/* Services */
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "../../services/app.message.service";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { DateTimeService } from "src/app/services/date.time.service";
import { TaxCalculation } from "src/app/services/tax.calculations.service";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";

/* Models */
import { POSServiceModel, ServiceStaff, SaleService, ServiceViewModel, POSServicePackageModel } from "../models/point.of.sale.model";
import { ApiResponse } from "src/app/models/common.model";

/****************** Configurations *****************/
import { Configurations } from "src/app/helper/config/app.config";
import { PointOfSaleApi } from "src/app/helper/config/app.webapi";
import { ENU_DateFormatName, POSItemType } from "src/app/helper/config/app.enums";
import { Messages } from "src/app/helper/config/app.messages";
import { environment } from "src/environments/environment";
import { ImagesPlaceholder } from "src/app/helper/config/app.placeholder";
import { AppUtilities } from "src/app/helper/aap.utilities";

/****************** Components *****************/
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { AddToWaitlistComponent } from "../add-to-waitlist/add.to.waitlist.component";


@Component({
    selector: 'pos-service-details',
    templateUrl: './pos.service.detail.component.html'
})

export class POSServiceDetailComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Members

    @Output() saleServiceModel = new EventEmitter<SaleService>();
    @Output() saleServiceWaitListModel = new EventEmitter<SaleService[]>();

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
    isAllowWaitList: boolean = false;
    /* Collection Models */
    saleService: SaleService;
    serviceStaffList: ServiceStaff[];
    servicesList:POSServiceModel = new POSServiceModel();
    /* Model References */


    service: POSServiceModel = new POSServiceModel();
    selectedStaff: ServiceStaff = new ServiceStaff();

    /* Configurations */
    timeFormat = Configurations.TimeFormat;
    messages = Messages;
    serverImageAddress = environment.imageUrl;
    timeList = [];

    /* Private Members */
    private readonly DATE_FORMAT = "MM/dd/yyyy";
    private readonly MEMBERSHIP_DATE_FORMAT = "yyyy-MM-dd";
    dateFormat: string = "";
    // #endregion

    constructor(private _httpService: HttpService,
        private _dialogRef: MatDialogRef<POSServiceDetailComponent>,
        private _openDialog: MatDialogService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        private _taxCalculation:TaxCalculation,
        @Inject(MAT_DIALOG_DATA) public serviceVM: ServiceViewModel) {
        super();

    }

    ngOnInit() {
        this.servicesList = JSON.parse(JSON.stringify(this.serviceVM.serviceModel));
        this.getCurrentBranchDetail();
        this.mapServiceBenefits();
        this.saleService = new SaleService();

        this.saleService.ServicePackageID = this.service.ServicePackageList && this.service.ServicePackageList.length > 0 ? this.service.ServicePackageList[0].ServicePackageID : 0;
        this.checkIsServicePackageFree(this.service.ServicePackageList[0]);


    }

    async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        //---- set date according to branch timezone. ignore browser datetime, get only branch datetime Added by Fahad--////
        this.minServiceDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.serviceDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.saleService.ServiceDate = this._dateTimeService.convertDateObjToString(this.serviceDate, this.DATE_FORMAT);
        const branch = await super.getBranchDetail(this._dataSharingService);

        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }

        this.getServiceWaitListStatus();
        this.getServiceStaffList();
    }

    //#region Events

    onServiceDateChange(serviceBookingDate: any) {
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
            this.getServiceWaitListStatus();
        }
    }

    onServiceTimeChange() {
        this.saleService.ServiceStartTime = this.serviceTimeSlot.StartTime;
        this.saleService.ServiceEndTime = this.serviceTimeSlot.EndTime;
    }

    onServicePackageChange(servicePackage: POSServicePackageModel) {
        this.checkIsServicePackageFree(servicePackage);
        this.getServiceStaffList();
    }

    onStaffChange(staffID: number) {
        this.setStaffID(staffID);
        this.serviceTimeSlot = null;
    }

    onAdd() {
        if (!this.isSaveInProgress) {
            this.isSaveInProgress = true;
            if (this.serviceTimeSlot) {
                let sameDateServices = this.serviceVM.servicesInCart.filter(c =>
                    c.ItemTypeID === POSItemType.Service && !c.IsWaitlistItem &&
                    this._dateTimeService.convertDateObjToString(new Date(c.ServiceDate), this.DATE_FORMAT) ===
                    this._dateTimeService.convertDateObjToString(new Date(this.saleService.ServiceDate), this.DATE_FORMAT))

                //this.serviceVM.servicesInCart
                let isTimeOverlap = false;
                if (sameDateServices && sameDateServices.length > 0) {
                    for (let index = 0; index < sameDateServices.length; index++) {

                        isTimeOverlap = (sameDateServices[index].ServiceStartTime < this.saleService.ServiceEndTime) &&
                            (this.saleService.ServiceStartTime < sameDateServices[index].ServiceEndTime);
                        if (isTimeOverlap) {
                            break;
                        }
                    }
                }

                if (isTimeOverlap) {
                    this._messageService.showErrorMessage(this.messages.Validation.Choose_Another_Service_Time);
                    this.isSaveInProgress = false;
                }
                else {
                    this.saleServiceModel.emit(this.saleService);
                    this.closeDialog();
                    this.isSaveInProgress = false;
                }
            }
            else {
                this._messageService.showErrorMessage(this.messages.Validation.Staff_TimeSlot_Required);
                this.isSaveInProgress = false;
            }
        }
    }

    onClose() {
        this._dialogRef.close();
    }

    //#endregion Events

    //#region Methods

    setStaffID(staffID: number) {
        this.saleService.StaffID = staffID;
    }

    getServiceWaitListStatus(){

        let params = {
            ServiceDate: this._dateTimeService.convertDateObjToString(new Date(this.saleService.ServiceDate), this.DATE_FORMAT),
            ServiceID: this.servicesList.ServiceID
        }

        this._httpService.get(PointOfSaleApi.getServiceWaitListStatus, params)
        .subscribe(
            data => {
                if (data.Result) {
                   this.isAllowWaitList = true;
                }
                else {
                    this.isAllowWaitList = false;
                }
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', 'Waitlist status')) }
        )
    }

    getServiceStaffList() {
        this.checkIsServicePackageFree(this.service.ServicePackageList.filter(item => item.ServicePackageID == this.saleService.ServicePackageID)[0]);
        this.serviceStaffList = [];
        let params = {
            ServiceDate: this._dateTimeService.convertDateObjToString(new Date(this.saleService.ServiceDate), this.DATE_FORMAT),
            ServicePackageID: this.saleService.ServicePackageID
        }
        this._httpService.get(PointOfSaleApi.getServiceStaff, params)
            .subscribe(
                (res:ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.serviceStaffList = res.Result.StaffWithTimeSlots;
                        this.selectedStaff = this.serviceStaffList[0];
                        this.saleService.StaffID = this.selectedStaff.StaffID;
                        this.serviceTimeSlot = null;

                        this.serviceStaffList.forEach(staff => {
                            staff.ImagePath = staff.ImagePath && staff.ImagePath !== '' ?
                                this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + staff.ImagePath : ImagesPlaceholder.user;
                        });

                        this.generateTimeSlotID();
                    }
                    else {
                        this.selectedStaff = null;
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', 'Staff List')) }
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

    mapServiceBenefits(){
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

    validate(sTime, eTime) {
        if (+this.getDate(sTime) < +this.getDate(eTime)) {
            var len = this.timeList.length;
            return len > 0 ? (+this.getDate(this.timeList[len - 1].endTime) < +this.getDate(sTime)) : true;
        } else {
            return false;
        }
    }

    getDate(time) {
        var today = new Date();
        var _t = time.split(":");
        today.setHours(_t[0], _t[1], 0, 0);
        return today;
    }

    checkIsServicePackageFree(item: any): void {
        if (item.IsMembershipBenefit && item.DiscountPercentage && item.DiscountPercentage == 100) {
            this.servicePackageDiscount = null;
            this.service.IsBenefit = true;
            this.servicePackageDiscounted = false;
        }
        else if (item.IsMembershipBenefit && item.DiscountPercentage && item.DiscountPercentage < 100) {
            this.servicePackageDiscount = item.DiscountPercentage;
            this.servicePackageDiscounted = true;
            this.service.IsBenefit = false;
        }
        else {
            this.servicePackageDiscount = null;
            this.servicePackageDiscounted = false;
            this.service.IsBenefit = false;
        }

    }

    openWaitlistDialog(){
        const dialog = this._openDialog.open(AddToWaitlistComponent,
            {
                disableClose: true,
                data: this.serviceVM
            });

            dialog.componentInstance.saleServiceWaitListModel.subscribe(saleServiceWaitList => {
                if (saleServiceWaitList) {
                    this.saleServiceWaitListModel.emit(saleServiceWaitList);
                    this.closeDialog();
                }
            });

    }
    //#endregion
}
