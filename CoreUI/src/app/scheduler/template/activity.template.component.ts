import { Component, Input, OnInit, AfterViewInit } from "@angular/core";
import { DateTimeService } from '@services/date.time.service';
import { SchedulerOptions, Configurations } from '@helper/config/app.config';
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";
import { DataSharingService } from "@app/services/data.sharing.service";


@Component({
    selector: 'scheduler-activity-template',
    templateUrl: './activity.template.component.html'
})

export class SchedulerActivityTemplateComponent extends AbstractGenericComponent implements OnInit, AfterViewInit {
    @Input() singleActivityData: any;
    @Input() currentView: string;
    @Input() showStaffPositionName: boolean;
    @Input() showTimeInTemplate: boolean;
    @Input() showStatusInTemplate: boolean;
    schedulerOptions = SchedulerOptions.SchedulerActivityType;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;    /** Using in HTML DONOT DELETE/REMOVE */
    schedulerStaticStrings = new SchedulerOptions();    /** Using in HTML DONOT DELETE/REMOVE */

    constructor(private _dateTimeService: DateTimeService,
        public _dataSharingService: DataSharingService) { super() }

    ngOnInit() {
        this.getBranchFormat();
        this.singleActivityData.text = this.singleActivityData.text ? super.fixedCharacterLength(this.singleActivityData.text, 20) : "";
    }

    async getBranchFormat() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
    }

    ngAfterViewInit() {
        if (this.singleActivityData.startDate.indexOf("Z") > 0) {
            this.singleActivityData.startDate = this.singleActivityData.startDate.substr(0, this.singleActivityData.startDate.indexOf("Z"));
        } else {
            this.singleActivityData.startDate = this.singleActivityData.startDate
        }
        if (this.singleActivityData.endDate.indexOf("Z") > 0) {
            this.singleActivityData.endDate = this.singleActivityData.endDate.substr(0, this.singleActivityData.endDate.indexOf("Z"));
        } else {
            this.singleActivityData.endDate = this.singleActivityData.endDate
        }        
    }
    getTimeDifferenceInMinutes(startTime, EndTime) {
        if (this._dateTimeService.getTimeDifferenceFromTimeString(startTime, EndTime) <= 29)
            return true;
        else
            return false;
    }

    LightenColor(col: any, p: number) {

        const R = parseInt(col.substring(1, 3), 16);
        const G = parseInt(col.substring(3, 5), 16);
        const B = parseInt(col.substring(5, 7), 16);
        const curr_total_dark = (255 * 3) - (R + G + B);

        // calculate how much of the current darkness comes from the different channels
        const RR = ((255 - R) / curr_total_dark);
        const GR = ((255 - G) / curr_total_dark);
        const BR = ((255 - B) / curr_total_dark);

        // calculate how much darkness there should be in the new color
        const new_total_dark = ((255 - 255 * (p / 100)) * 3);

        // make the new channels contain the same % of available dark as the old ones did
        const NR = 255 - Math.round(RR * new_total_dark);
        const NG = 255 - Math.round(GR * new_total_dark);
        const NB = 255 - Math.round(BR * new_total_dark);

        const RO = ((NR.toString(16).length === 1) ? "0" + NR.toString(16) : NR.toString(16));
        const GO = ((NG.toString(16).length === 1) ? "0" + NG.toString(16) : NG.toString(16));
        const BO = ((NB.toString(16).length === 1) ? "0" + NB.toString(16) : NB.toString(16));

        return "#" + RO + GO + BO;
    }
}