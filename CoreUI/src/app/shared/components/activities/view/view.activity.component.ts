/********************* Angular References **************************/
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubscriptionLike } from 'rxjs';

/********************* Services & Models **************************/
/* Models */
import { TaskActivityView } from '../../../../models/activity.model';
import { PersonInfo } from 'src/app/models/common.model';
/* Services */
import { DateTimeService } from 'src/app/services/date.time.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
/********************* Common & Customs **************************/
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { ENU_DateFormatName } from 'src/app/helper/config/app.enums';

@Component({
    selector: 'view-task',
    templateUrl: './view.activity.component.html'
})

export class ViewActivityComponent extends AbstractGenericComponent {

    /* Local Members*/
    dateFormat: string = "";//Configurations.DateFormat;

    shouldGetPersonInfo: boolean;

    personInfo: PersonInfo;

    staffIDSubscription: SubscriptionLike;

    constructor(private _dataSharingService: DataSharingService,
        private _dialogRef: MatDialogRef<ViewActivityComponent>,
        private _dateTimeService: DateTimeService,
        @Inject(MAT_DIALOG_DATA) public taskModel: TaskActivityView) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();

    }

    ngOnDestroy() {
    }

    /* Events */
    onCloseDialog() {
        this._dialogRef.close();
    }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.taskModel.FollowUpStartTime = this._dateTimeService.formatTimeString(this.taskModel.FollowUpStartTime);
        this.taskModel.FollowUpEndTime = this._dateTimeService.formatTimeString(this.taskModel.FollowUpEndTime);

        if (this.taskModel.isMyTask) {
            if (this.taskModel.AssignedToStaffID && this.taskModel.AssignedToStaffID > 0) {
                this.personInfo = new PersonInfo();
                this.personInfo.PersonID = this.taskModel.AssignedToStaffID;
                this.shouldGetPersonInfo = true;
            }
        } else {
            this.staffIDSubscription = this._dataSharingService.staffID.subscribe((staffId: number) => {
                if (staffId && staffId > 0) {
                    this.personInfo = new PersonInfo();
                    this.personInfo.PersonID = staffId;
                    this.shouldGetPersonInfo = true;
                }
            });
        }
    }
}