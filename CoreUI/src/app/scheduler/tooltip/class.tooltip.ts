import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ChangeDetectorRef  } from "@angular/core";
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { AuthService } from "src/app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Scheduler, ENU_Permission_Individual } from "src/app/helper/config/app.module.page.enums";
import { Configurations } from "src/app/helper/config/app.config";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { ENU_DateFormatName } from "src/app/helper/config/app.enums";

@Component({
    template: `
    <div class="appointment-content" [ngStyle]="{'background': lightenTheColor}">
        <div class="appointment-text">
            <h4>{{data.text}} </h4>
        </div>
        <span [ngStyle]="{'background': data.SchedulerActivityTypeColor}">{{data.ActivityType}}</span>
        <div class="float-right" *ngIf="isSaveClassAllowed">
            <dx-button *ngIf="data.IsActive && isAddAttendeeAllowed" class="delete-appointment" (onClick)="onEditAttendee()"><i class="fal fa-users"></i></dx-button>
            <dx-button class="delete-appointment" (onClick)="onEditClass()"> <i class="fal fa-edit"></i></dx-button>
            <dx-button class="delete-appointment" (onClick)="onDeleteClass()" ><i class="fal fa-trash-alt"></i></dx-button>
            <dx-button *ngIf="!isDropdownTooltip" class="delete-appointment" (onClick)="onCloseTooltip()" ><i class="fal fa-times-circle"></i></dx-button>
        </div>
    </div>
    <div class="row appointment-content-detail">
        <div class="col-md-6 col-sm-6 text-left no_padding">
            <div class="appointment_item_detail">
                <h3>Created Date</h3>
                <p><i class="fal fa-calendar-alt"></i> {{(data.startDate | customdate : schedulerTooltipDateFormat) + ' , ' + (data.startDate | customdate: schedulerTimeFormat) + '-' + (data.endDate | customdate: schedulerTimeFormat)}}</p>
            </div>
            <div class="appointment_item_detail">
                <h3>Facility</h3>
                <p><i class="fal fa-building"></i> {{data.FacilityName == "" ? "N/A" : data.FacilityName}} </p>
            </div>
            <div class="appointment_item_detail">
            <h3>Last Updated By</h3>
            <p><i class="fal fa-user-check"></i> {{data.CreatedByName}}</p>
            </div>
        </div>
        <div class="col-md-6 col-sm-6 text-left xs-pl-0">
            <div class="appointment_item_detail">
                <h3>Duration</h3>
                <p><i class="fal fa-clock"></i> {{data.Duration}}</p>
            </div>
            <div class="appointment_item_detail">
                <h3>Instructor</h3>
                <p><i class="fal fa-user-alt"></i> {{data.StaffFullName}}</p>
            </div>
            <!--
            28 November 2019 - Azeem Khalid
            As per discussion with Iftekhar,Tahir and approval form Sohaib, Price & Attendee removed from class tooltip
            card link: https://trello.com/c/JpRZjUlk
            -->
            <!-- <div class="appointment_item_detail">
                <h3>Attendee</h3>
                <p><i class="fal fa-user-alt"></i> {{data.EnrolledAttendee}} </p>
            </div>
            <div class="appointment_item_detail">
                <h3>Price</h3>
                <p><i class="fal fa-hand-holding-usd"></i> {{data.Price}}</p>
            </div> -->
        </div>
    </div>
    `
})

export class ClassTooltipComponent extends AbstractGenericComponent implements OnInit , AfterViewInit {
    @Input() data: any;
    @Input() isDropdownTooltip: boolean;
    @Output() edit = new EventEmitter<boolean>();
    @Output() delete = new EventEmitter<boolean>();
    @Output() close = new EventEmitter<boolean>();
    @Output() manageAttendee = new EventEmitter<boolean>();

    isSaveClassAllowed: boolean;
    isAddAttendeeAllowed:boolean;
    lightenTheColor: any;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    schedulerTooltipDateFormat: string = "";//Configurations.SchedulerTooltipDateFormat;

    constructor(private _authService: AuthService, 
        private _dataSharingService: DataSharingService,
        private cdr: ChangeDetectorRef
        ) {
        super();
    }

    ngOnInit() {
    }
    ngAfterViewInit() {
        this.getBranchDatePattern();
        this.data.text = super.fixedCharacterLength(this.data.text, 22);
        this.lightenTheColor = super.changeLightColor(this.data.SchedulerActivityTypeColor, 85);
        this.isSaveClassAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Class);
        this.isAddAttendeeAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Individual, ENU_Permission_Individual.AddAttendee);
        this.cdr.detectChanges();
    }

    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.schedulerTooltipDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerTooltipDateFormat);
    }

    onEditClass() {
        this.edit.emit(true);
    }

    onEditAttendee() {
        this.manageAttendee.emit(true);
    }

    onDeleteClass() {
        this.delete.emit(true);
    }

    onCloseTooltip() {
        this.close.emit(true);
    }
}
