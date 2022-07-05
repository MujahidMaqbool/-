import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";
import { AuthService } from "@app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Scheduler } from "@app/helper/config/app.module.page.enums";
import { Configurations } from "@app/helper/config/app.config";
import { DataSharingService } from "@app/services/data.sharing.service";
import { ENU_DateFormatName } from "@app/helper/config/app.enums";

@Component({
    template: `
<div class="appointment-content" [ngStyle]="{'background': lightenTheColor}">
    <div class="appointment-text">
        <h4>{{data.StaffFullName}} </h4>
    </div>
    <span [ngStyle]="{'background': data.SchedulerActivityTypeColor}">{{data.ActivityType}}</span>
    <div class="float-right" *ngIf="isSaveBlockTimeAllowed">
        <dx-button class="delete-appointment" (onClick)="onEditBlockTime()"><i class="fal fa-edit"></i></dx-button>
        <dx-button class="delete-appointment" (onClick)="onDeleteBlockTime()"><i class="fal fa-trash-alt"></i></dx-button>
        <dx-button *ngIf="!isDropdownTooltip" class="delete-appointment" (onClick)="onCloseTooltip()" ><i class="fal fa-times-circle"></i></dx-button>
    </div>
</div>
<div class="row appointment-content-detail">
    <div class="col-md-6 col-sm-6 padding_left text-left">
        <div class="appointment_item_detail">
            <h3>Start Date</h3>
            <p><i class="fal fa-calendar-alt"></i> {{(data.startDate | customdate : schedulerTooltipDateFormat)}}</p>
        </div>
        <div class="appointment_item_detail">
            <h3>Between</h3>
            <p><i class="fal fa-clock"></i> {{(data.startDate | customdate: schedulerTimeFormat) + '-' + (data.endDate | customdate: schedulerTimeFormat)}}</p>
        </div>
    </div>
    <div class="col-md-6 col-sm-6 text-left xs-pl-0">
       <!-- <div class="appointment_item_detail">
            <h3>End Date</h3>
            <p><i class="fal fa-calendar-alt"></i> {{(data.endDate | customdate : schedulerTooltipDateFormat)}}</p>
        </div> -->
        <div class="appointment_item_detail">
            <h3>Repeat</h3>
            <p><i class="fal fa-calendar-check"></i> {{repeatOccuranceDay}} </p>
        </div>
        <div class="appointment_item_detail">
        <h3>Last Updated By</h3>
        <p><i class="fal fa-user-check"></i> {{data.CreatedByName}}</p>
        </div>
    </div>
    <!--<div class="col-md-6 col-sm-6 padding_left text-left xs-pl-0">
        <div class="appointment_item_detail">
            <h3>On</h3>
            <p><i class="fal fa-calendar-alt"></i> 0 </p>
        </div>
    </div> -->
    <div class="col-md-12 padding_left text-left xs-pl-0">
    <div class="appointment_item_detail">
        <h3>Notes</h3>
        <p>{{data.description}} </p>
    </div>
</div>

</div>
    `
})

export class BlockTimeTooltipComponent extends AbstractGenericComponent implements OnInit {

    @Input() data: any;
    @Input() isDropdownTooltip: boolean;
    @Output() edit = new EventEmitter<boolean>();
    @Output() delete = new EventEmitter<boolean>();
    @Output() close = new EventEmitter<boolean>();
    repeatOccuranceDay: string = "None";
    repeatValueString: string;

    isSaveBlockTimeAllowed: boolean;
    lightenTheColor: any;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    schedulerTooltipDateFormat: string = "";//Configurations.SchedulerTooltipDateFormat;

    constructor(private _authService: AuthService, private _dataSharingService: DataSharingService) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
        this.splitRRuleToKeyValuePair();
        this.lightenTheColor = super.changeLightColor(this.data.SchedulerActivityTypeColor, 85);
        this.isSaveBlockTimeAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Scheduler, ENU_Permission_Scheduler.BlockTime);
    }

    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.schedulerTooltipDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerTooltipDateFormat);
    }

    onEditBlockTime() {
        this.edit.emit(true);
    }

    onDeleteBlockTime() {
        this.delete.emit(true);
    }

    splitRRuleToKeyValuePair() {
        if (this.data.recurrenceRule) {
            let splitRule = this.data.recurrenceRule.split(';');

            let splitWithEquals = splitRule[0].split('=');
            this.repeatOccuranceDay = splitWithEquals[1];
        }
    }

    onCloseTooltip() {
        this.close.emit(true);
    }
}
