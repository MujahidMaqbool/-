import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { AuthService } from "src/app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Scheduler } from "src/app/helper/config/app.module.page.enums";
import { Configurations } from "src/app/helper/config/app.config";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { ENU_DateFormatName } from "src/app/helper/config/app.enums";

@Component({
    template: `
    <div  [ngStyle]="{'background': lightenTheColor}">
        <div class="appointment-content">
            <div class="appointment-text">
                <h4>{{data.CustomerName}}</h4>
            </div>
            <span [ngStyle]="{'background': data.SchedulerActivityTypeColor}">{{data.ActivityType}}</span>
            <div class="float-right" *ngIf="isSaveAppointmentAllowed">
                <dx-button *ngIf="!data.MarkAsDone" class="delete-appointment" (onClick)="onEditAppointment()"> <i class="fal fa-edit"></i> </dx-button>
                <dx-button *ngIf="!data.MarkAsDone" class="delete-appointment" (onClick)="onDeleteAppointment()"> <i class="fal fa-trash-alt"></i> </dx-button>
                <dx-button *ngIf="!isDropdownTooltip" class="delete-appointment" (onClick)="onCloseTooltip()" ><i class="fal fa-times-circle"></i></dx-button>
            </div>
        </div>
        <div class="appointment-content" >
            <div *ngIf="data.CustomerMobile">
                <h3><i class="fal fa-phone appointment-tooltip-icons" aria-hidden="true"> &nbsp;{{data.CustomerMobile}}</i></h3>
            </div>
            <div>
            <h3><i class="fal fa-envelope appointment-tooltip-icons" aria-hidden="true"> &nbsp;{{data.CustomerEmail}}</i></h3>
            </div>
        </div>
    </div>
<div class="row appointment-content-detail">
    <div class="col-md-6 col-sm-6 no_padding text-left">
        <div class="appointment_item_detail">
            <h3>Title</h3>
            <p>{{data.text}}</p>
        </div>
        <div class="appointment_item_detail">
          <h3>Date</h3>
          <p><i class="fal fa-calendar-alt"></i> {{(data.startDate | customdate : schedulerTooltipDateFormat)}}</p>
        </div>
        <div class="appointment_item_detail">
        <h3>Last Updated By</h3>
        <p><i class="fal fa-user-check"></i> {{data.CreatedByName}}</p>
        </div>
    </div>

    <div class="col-md-6 col-sm-6 padding_left text-left xs-pl-0">
    <div class="appointment_item_detail">
       <h3>Assigned To</h3>
       <p><i class="fal fa-user-alt"></i> {{data.StaffFullName}}</p>
    </div>
    <div class="appointment_item_detail">
            <h3>Time</h3>
            <p><i class="fal fa-clock-alt"></i> {{(data.startDate | customdate: schedulerTimeFormat) + '-' + (data.endDate | customdate: schedulerTimeFormat)}}</p>
    </div>
    </div>
    <div class="col-md-12 padding_left text-left">
    <div class="appointment_item_detail">
        <h3>Notes</h3>
        <p>{{data.description}}</p>
    </div>

    </div>
</div>
    `
})

export class AppointmentTooltipComponent extends AbstractGenericComponent implements OnInit {

    @Input() data: any;
    @Input() isDropdownTooltip: boolean;
    @Output() edit = new EventEmitter<boolean>();
    @Output() delete = new EventEmitter<boolean>();
    @Output() close = new EventEmitter<boolean>();

    isSaveAppointmentAllowed: boolean;
    lightenTheColor: any;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    schedulerTooltipDateFormat: string = ""; //Configurations.SchedulerTooltipDateFormat;

    constructor(private _authService: AuthService, private _dataSharingService: DataSharingService) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
        this.data.text = super.fixedCharacterLength(this.data.text, 22);
        this.lightenTheColor = super.changeLightColor(this.data.SchedulerActivityTypeColor, 85);
        this.isSaveAppointmentAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.Appointment);
    }

    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.schedulerTooltipDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerTooltipDateFormat);
    }

    onEditAppointment() {
        this.edit.emit(true);
    }

    onDeleteAppointment() {
        this.delete.emit(true);
    }

    onCloseTooltip() {
        this.close.emit(true);
    }
}
