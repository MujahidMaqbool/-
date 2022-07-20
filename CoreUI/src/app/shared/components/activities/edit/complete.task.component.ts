/********************** Angular References *********************/
import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core'
import { SubscriptionLike } from 'rxjs';
/********************** Material References *********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************** Services & Models *********************/
/* Models */
import { PersonInfo } from 'src/app/models/common.model';
import { StaffTaskMarkAsDone } from 'src/app/staff/models/staff.activity.model';
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
/********************** Common & Customs *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { Messages } from 'src/app/helper/config/app.messages';
import { ENU_ModuleList } from 'src/app/helper/config/app.enums';
import { StaffActivityApi } from 'src/app/helper/config/app.webapi';

@Component({
    selector: 'mark-as-done',
    templateUrl: './complete.task.component.html'
})
export class CompleteTaskComponent implements OnInit {

    @Output()
    markedAsDone = new EventEmitter<boolean>();

    /* Model References */

    /* Local Members */
    shouldGetPersonInfo: boolean;

    followUpDate: Date = new Date();
    currentDateTime: Date = new Date();
    taskMinDate: Date = new Date();
    taskMaxDate: Date;

    /* Messages */

    successMessage: string;
    errorMessage: string;
    hasError: boolean;
    hasSuccess: boolean;

    /* Models */
    staffIDSubscription: SubscriptionLike;
    staffTaskMarkAsDoneModel: StaffTaskMarkAsDone;
    personInfo: PersonInfo;

    /* Collection Types */
    modules = ENU_ModuleList;

    /* Configurations */
    dateFormat = Configurations.DateFormat;
    messages = Messages;

    constructor(private dialogRef: MatDialogRef<CompleteTaskComponent>,
        private _dateTimeService: DateTimeService,
        private _activityService: HttpService,
        private _messageService: MessageService,
        @Inject(MAT_DIALOG_DATA) public taskModel: any) {
            this.getBranchSetting();
    }

    ngOnInit() {
            if (this.taskModel.assignedToStaffID && this.taskModel.assignedToStaffID > 0) {
                this.personInfo = new PersonInfo();
                this.personInfo.PersonID = this.taskModel.assignedToStaffID;
                this.shouldGetPersonInfo = true;
            }
    }

    ngOnDestroy() {
    }

    // #region Events

    onDateChange(followUpDate:Date) {
        this.staffTaskMarkAsDoneModel.CompletionDate = this._dateTimeService.convertDateObjToString(followUpDate, this.dateFormat);
    }

    // #endregion

    // #region Methods..

    async getBranchSetting(){
        this.currentDateTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch()
        this.staffTaskMarkAsDoneModel = new StaffTaskMarkAsDone();
        if (this.taskModel && this.taskModel.task && this.taskModel.task.FollowUpDate) {
            //remove zone from date added by fahad for browser different time zone issue resolving
            this.taskModel.task.FollowUpDate = this._dateTimeService.removeZoneFromDateTime(this.taskModel.task.FollowUpDate);

            this.followUpDate =  this.setFollowUpDate(this.taskModel.task.FollowUpDate, this.taskModel.task.FollowUpStartTime);
            this.taskModel.task.FollowUpStartTime = this._dateTimeService.formatTimeString(this.taskModel.task.FollowUpStartTime);
            this.taskModel.task.FollowUpEndTime = this._dateTimeService.formatTimeString(this.taskModel.task.FollowUpEndTime);
            this.staffTaskMarkAsDoneModel.CompletionNote = this.taskModel.task.Description;
            this.staffTaskMarkAsDoneModel.CompletionDate = this._dateTimeService.convertDateObjToString(this.taskModel.task.FollowUpDate, this.dateFormat);
        }
        this.setstaffTaskMarkAsDoneModel();
    }

    saveStatus() {
    
           this.mapStaffTaskMarkAsDoneModel();
           this._activityService.save(StaffActivityApi.saveStaffTaskMarkAsDone, this.staffTaskMarkAsDoneModel)
                .subscribe(
                    res => {
                        if (res && res.MessageCode > 0) {
                            this.markedAsDone.emit(true);
                            this.closePopup();
                            this._messageService.showSuccessMessage(this.messages.Success.Mark_As_Done.replace("{0}", "Task"));
                        }
                        else {
                            this.markedAsDone.emit(false);
                            this._messageService.showErrorMessage(this.messages.Error.Mark_Done_Error.replace("{0}", "Task"));
                        }
                    },
                    err => {
                        this.markedAsDone.emit(true);
                        this._messageService.showErrorMessage(this.messages.Error.Mark_Done_Error.replace("{0}", "Task"));
                    } );
       // }
    }

    setstaffTaskMarkAsDoneModel() {
        if (new Date(this.taskModel.task.FollowUpDate) >= this.currentDateTime) {
            this.taskModel.task.FollowUpDate = this.currentDateTime;
            this.taskMinDate = this.currentDateTime;
            this.taskMaxDate = this.currentDateTime;
            this.followUpDate = this.currentDateTime;
            this.staffTaskMarkAsDoneModel.CompletionDate = this._dateTimeService.convertDateObjToString(this.followUpDate, this.dateFormat);

        }

        else if (new Date(this.taskModel.task.FollowUpDate) < this.currentDateTime) {
            this.taskMinDate = this.taskModel.task.FollowUpDate;
            this.taskMaxDate = this.currentDateTime;
        }
    }

    mapStaffTaskMarkAsDoneModel(){
        this.staffTaskMarkAsDoneModel.StaffID = this.taskModel.assignedToStaffID;
        this.staffTaskMarkAsDoneModel.StaffActivityID = this.taskModel.activityId;
        // this.staffTaskMarkAsDoneModel.CreatedBy = this.taskModel.task.CreatedBy;
    }

    setFollowUpDate(followUpDate: any, time: string) {
        return this._dateTimeService.convertTimeStringToDateTime(time, followUpDate);
    }

    closePopup() {
        this.dialogRef.close();
    }

    // #endregion
}
