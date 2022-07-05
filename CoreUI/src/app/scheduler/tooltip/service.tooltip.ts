import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from "@angular/core";
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { AuthService } from "@app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Scheduler } from "@app/helper/config/app.module.page.enums";
import { Configurations } from "@app/helper/config/app.config";
import { DataSharingService } from "@app/services/data.sharing.service";
import { ENU_DateFormatName, ENU_Package } from "@app/helper/config/app.enums";
import { SubscriptionLike } from "rxjs";

@Component({
    template: `
    <div  [ngStyle]="{'background': lightenTheColor}">
        <div class="appointment-content">
            <div class="appointment-text">
                <h4>{{data.CustomerName}} </h4>
            </div>
            <span [ngStyle]="{'background': data.SchedulerActivityTypeColor}">{{data.ActivityType}}</span>

            <div class="float-right">
                <dx-button *ngIf="data.IsServiceReschedule" class="delete-appointment" (onClick)="onRescheduleService()"><i class="fal fa-history"></i></dx-button>
                <dx-button class="delete-appointment" (onClick)="onEditService()"><i class="fal fa-edit"></i></dx-button>
                <!--If Service is paid then hide delete this -->
                <dx-button class="delete-appointment" icon="trash" *ngIf="!data.IsSale" (onClick)="onDeleteService()" ><i class="fal fa-trash-alt"></i></dx-button>
                <dx-button *ngIf="!isDropdownTooltip" class="delete-appointment" (onClick)="onCloseTooltip()" ><i class="fal fa-times-circle"></i></dx-button>
            </div>
        </div>
        <div class="appointment-content">
            <div class="" *ngIf="data.CustomerMobile">
            <h3><i class="fal fa-phone appointment-tooltip-icons" aria-hidden="true"> &nbsp;{{data.CustomerMobile}}</i></h3>
            </div>
            <div class="">
            <h3><i class="fal fa-envelope appointment-tooltip-icons" aria-hidden="true"> &nbsp;{{data.CustomerEmail}}</i></h3>
            </div>
        </div>
    </div>
<div class="row appointment-content-detail">
    <div class="col-md-6 col-sm-6 padding_left text-left">
        <div class="appointment_item_detail">
            <h3>Service</h3>
            <p>{{data.text}}</p>
        </div>
        <div class="appointment_item_detail" *ngIf="hasFacilityInPackage">
            <h3>Facility</h3>
            <p><i class="fal fa-building"></i> {{data.FacilityName == "" ? "N/A" : data.FacilityName}} </p>
        </div>
        <div class="appointment_item_detail">
            <h3>Booked on</h3>
            <p><i class="fal fa-calendar-alt"></i> {{(data.CreatedOn | customdate : schedulerTooltipDateFormat)+ ', ' + (data.CreatedOn | customdate: schedulerTimeFormat)}} </p>
        </div>
        <div class="appointment_item_detail">
        <h3>Price</h3>

        <p><i class="fal fa-hand-holding-usd"></i>
        <span class="" [ngClass]="{'remove_price': data.IsMembershipBenefit}"> &nbsp;{{data.Price | currency: currencySymbol}}</span>
         &nbsp;
         <span *ngIf="data.IsMembershipBenefit">&nbsp; {{data.DiscountedPrice | currency: currencySymbol}}</span></p>
    </div>

        <div class="appointment_item_detail">
        <h3>Status</h3>
        <p>{{data.BookingStatusTypeName}}</p>
        </div>
    </div>
    <div class="col-md-6 col-sm-6 text-left padding_left xs-pl-0">
        <div class="appointment_item_detail">
            <h3>Duration</h3>
            <p><i class="fal fa-clock"></i> {{data.Duration}}</p>
        </div>
        <div class="appointment_item_detail">
        <h3>Staff</h3>
        <p><i class="fal fa-user-alt"></i> {{data.StaffFullName}}</p>
        </div>
        <div class="appointment_item_detail">
        <h3>Date</h3>
        <p><i class="fal fa-calendar-alt"></i> {{(data.startDate | customdate : schedulerTooltipDateFormat) + ', ' + (data.startDate | customdate: schedulerTimeFormat) + '-' + (data.endDate | customdate: schedulerTimeFormat)}}</p>
        </div>
        <div class="appointment_item_detail">
            <h3>Last Updated By</h3>
            <p><i class="fal fa-user-check"></i> {{data.CreatedByName}}</p>
        </div>
    </div>

</div>
    `
})

export class ServiceTooltipComponent extends AbstractGenericComponent implements OnInit, OnDestroy {
    @Input() data: any;
    @Input() isDropdownTooltip: boolean;
    @Output() edit = new EventEmitter<boolean>();
    @Output() delete = new EventEmitter<boolean>();
    @Output() close = new EventEmitter<boolean>();
    @Output() reschedule = new EventEmitter<boolean>();
    packageIdSubscription: SubscriptionLike;
    currencySymbol: string;
    isSaveServiceAllowed: boolean;
    lightenTheColor: any;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    schedulerTooltipDateFormat: string = "";//Configurations.SchedulerTooltipDateFormat;
    hasFacilityInPackage: boolean;

    package = ENU_Package;

    constructor(private _authService: AuthService, private _dataSharingService: DataSharingService) {
        super();
    }

    ngOnInit() {
        this.getCurrentBranchDetail();
        this.checkPackagePermissions();
        this.data.CustomerName = super.fixedCharacterLength(this.data.CustomerName, 22);
        this.lightenTheColor = super.changeLightColor(this.data.SchedulerActivityTypeColor, 85);
        this.isSaveServiceAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Service);
       
        
    }

    ngOnDestroy() {
        if (this.packageIdSubscription)
            this.packageIdSubscription.unsubscribe();
    }

    async getCurrentBranchDetail() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.schedulerTooltipDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerTooltipDateFormat);

        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencySymbol = branch.CurrencySymbol;
        }
    }

    onRescheduleService() {
        this.reschedule.emit(true);
    }
    onEditService() {
        this.edit.emit(true);
    }

    onDeleteService() {
        this.delete.emit(true);
    }
    onCloseTooltip() {
        this.close.emit(true);
    }

    checkPackagePermissions() {
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPackagePermissions(packageId);
            }
        })
    }

    setPackagePermissions(packageId: number) {
        this.hasFacilityInPackage = false;

        switch (packageId) {
            case this.package.WellnessTop:
            case this.package.Full:
                this.hasFacilityInPackage = true;
                break;
        }
    }


}
