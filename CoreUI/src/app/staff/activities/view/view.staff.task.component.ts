/********************* Angular References **************************/
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************* Services & Models **************************/

/********************* Common & Customs **************************/
import { Configurations } from 'src/app/helper/config/app.config';
import { StaffTaskView } from 'src/app/staff/models/staff.activity.model';
import { DateTimeService } from 'src/app/services/date.time.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { ENU_DateFormatName } from 'src/app/helper/config/app.enums';

@Component({
    selector: 'view-staff-task',
    templateUrl: './view.staff.task.component.html'
})

export class ViewStaffTaskComponent extends AbstractGenericComponent {

    /* Local Members*/
    dateFormat = Configurations.DateFormat;
    constructor(
        private _dialogRef: MatDialogRef<ViewStaffTaskComponent>,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
        @Inject(MAT_DIALOG_DATA) public taskModel: StaffTaskView) {       
              super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
    }

    /* Events */
    onCloseDialog() {
        this._dialogRef.close();
    }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.taskModel.FollowUpStartTime = this._dateTimeService.formatTimeString(this.taskModel.FollowUpStartTime);
        this.taskModel.FollowUpEndTime = this._dateTimeService.formatTimeString(this.taskModel.FollowUpEndTime);
    }

}