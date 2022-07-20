// #region Imports

/********************** Angular References *********************/
import { Component, ViewChild, OnInit, EventEmitter, Output, Inject } from "@angular/core";
import { NgForm } from "@angular/forms";
import { SubscriptionLike as ISubscription } from 'rxjs';
/********************** Material References *********************/
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
/********************** Services & Models *********************/
/* Models */
import { TaskActivity, ActivityPersonInfo, Staff, PriorityType } from "src/app/models/activity.model";

/* Services */
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { DateTimeService } from "src/app/services/date.time.service";
/********************** Common & Customs *********************/
import { Configurations, SchedulerOptions } from "src/app/helper/config/app.config";
import { StaffActivityApi, StaffApi } from "src/app/helper/config/app.webapi";
import { Messages } from "src/app/helper/config/app.messages";
import { ApiResponse, PersonDetail } from "src/app/models/common.model";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { ENU_DateFormatName } from "src/app/helper/config/app.enums";

/********************** Components *********************/

// #endregion 


@Component({
    selector: 'save-task',
    templateUrl: './save.task.component.html'
})

export class SaveTaskComponent extends AbstractGenericComponent implements OnInit {

    // #region  Local Members
    @ViewChild('taskForm') taskForm: NgForm;

    @Output()
    activitySaved = new EventEmitter<boolean>();

    /* Local members */
    isInvalidData: boolean = false;
    isInvalidEndTime: boolean = false;
    isInvalidFollowUpDate: boolean = false;
    timeFormat = Configurations.TimeFormat;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    schedulerMinDate: Date = new Date();
    schedulerMinStartTime: Date = new Date();
    schedulerStartTime: Date = new Date();
    schedulerEndTime: Date = new Date();
    personDetail: PersonDetail = new PersonDetail();
    dayViewFormat: string = "";
    /* Activity Model References */

    tepmplateVariableList = Configurations.TemplateVariableList;
    taskModel: TaskActivity = new TaskActivity();
    personInfo: ActivityPersonInfo = new ActivityPersonInfo();
    staffList: Staff[];
    priorityTypeList: PriorityType[];
    personInfoSubs: ISubscription;

    /* Messages */
    messages = Messages;
    errorMessage: string;
    successMessage: string;

    /* Configurations */
    dateFormat: string = Configurations.DateFormat;
    // #endregion 

    /***********Class Constructor*********/
    constructor(private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        public dialogRef: MatDialogRef<SaveTaskComponent>,
        @Inject(MAT_DIALOG_DATA) public tasksResult: TaskActivity) {
            super();
            this.getBranchDatePattern();   
    }

    ngOnInit() {
        
    }

    // #region Events 

    onTaskStartTimeChanged(event: any) {
        this.taskModel.FollowUpStartTime = this._dateTimeService.getTimeStringFromDate(event.value, this.timeFormat);
        
        // Update EndTime Only if there is previous value
        // if there is no previous value it means it is being set for Edit mode
        if (event.previousValue) {
            this.schedulerEndTime = this.setEndDateInterval(event.value);
            this.taskModel.FollowUpEndTime = this._dateTimeService.getTimeStringFromDate(this.schedulerEndTime, this.timeFormat);
        }
    }

    onTaskEndTimeChanged(event: any) {
        this.taskModel.FollowUpEndTime = this._dateTimeService.getTimeStringFromDate(event.value, this.timeFormat);

        if (this.taskModel.FollowUpEndTime > this.taskModel.FollowUpStartTime) {
            this.isInvalidEndTime = false;
        }
    }

    onClosePopup() {
        this.dialogRef.close();
    }

    onTaskDateChange(newDate: Date) {
        let today = new Date();
        today.setHours(0, 0, 0, 0);

        if (newDate.toLocaleDateString() === today.toLocaleDateString()) {
            this.schedulerMinStartTime = new Date();
            this.schedulerMinStartTime.setSeconds(0,0);
        }
        else {
            this.schedulerMinStartTime = today;
        }

        if (newDate < today) {
        //    this.isInvalidFollowUpDate = true;
        }
        else {
            this.isInvalidFollowUpDate = false;
            this.isInvalidData = false;
            this.isInvalidFollowUpDate = false;
            this.isInvalidData = false;
        }

        this.taskModel.FollowUpDate = newDate;
    }

    // #endregion

    // #region Methods 

    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.dayViewFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);

        this.getTaskFundamentals();
        this.taskModel = new TaskActivity();
        this.taskModel = this.tasksResult;

        this.schedulerMinStartTime.setSeconds(0,0);
        
        if (this.taskModel.FollowUpStartTime) {
            this.schedulerStartTime = this._dateTimeService.convertTimeStringToDateTime(this.taskModel.FollowUpStartTime, this.taskModel.FollowUpDate);
        }
        if (this.taskModel.FollowUpEndTime) {
            this.schedulerEndTime = this._dateTimeService.convertTimeStringToDateTime(this.taskModel.FollowUpEndTime, this.taskModel.FollowUpDate);
        }

        this.taskModel.FollowUpStartTime = this._dateTimeService.getTimeStringFromDate(this.schedulerStartTime, this.timeFormat);
        this.taskModel.FollowUpEndTime = this._dateTimeService.getTimeStringFromDate(this.schedulerEndTime, this.timeFormat);
        this.getPersonInfo();
    }

    getPersonInfo() {
        let params = {
            staffID: this.taskModel.AssignedToStaffID
        }
            this._httpService.get(StaffApi.getStaffBasicInfo, params)
                .subscribe(
                    (data:ApiResponse) => {
                        if (data && data.MessageCode > 0) {
                            this.personDetail = data.Result;
                            this.personInfo.Name = this.personDetail.FirstName + " " + this.personDetail.LastName;
                            this.personInfo.Mobile = this.personDetail.Mobile.toString();
                            this.personInfo.Email = this.personDetail.Email;
                            this.personInfo.Address = this.personDetail.Address1;

                        }
                        else{
                            this._messageService.showErrorMessage(data.MessageText);
                        }
                    },
                    error => this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Person Info"))
                );
    }

    setTaskDropdowns() {
        if (this.priorityTypeList && this.priorityTypeList.length > 0) {
            if (!this.taskModel.PriorityTypeID || this.taskModel.PriorityTypeID <= 0) {
                this.taskModel.PriorityTypeID = this.priorityTypeList[0].PriorityTypeID;
            }
        }

        if (this.staffList && this.staffList.length > 0) {
            if (!this.taskModel.AssignedToStaffID || this.taskModel.AssignedToStaffID <= 0) {
                this.taskModel.AssignedToStaffID = this.staffList[0].StaffID;
            }
        }
    }



    getTaskFundamentals() {
        this.staffList = [];
        this._httpService.get(StaffActivityApi.getTaskFundamentals).subscribe(
            (data:ApiResponse) => {
                // Set fundamentals
                if (data && data.MessageCode > 0) {
                    this.priorityTypeList = data.Result.PriorityTypeList;
                    this.staffList = data.Result.StaffList;
                }
                else{
                    this._messageService.showErrorMessage(data.MessageText);
                }
                this.setTaskDropdowns();
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
        )
    }

    replaceTemplateVariables(description: string) {
        if (description) {
            this.tepmplateVariableList.forEach(templateVar => {
                if (description && description.indexOf(templateVar) >= 0) {
                    if (templateVar === "[Staff Name]" || templateVar === "[Lead Name]") {
                        description = description.replace(templateVar, this.personInfo.Name);
                    }
                    else if (templateVar === "[Phone]") {
                        description = description.replace(templateVar, this.personInfo.Mobile);
                    }
                    else if (templateVar === "[Address]") {
                        if (this.personInfo.Address && this.personInfo.Address !== '') {
                            description = description.replace(templateVar, this.personInfo.Address);
                        }
                        else {
                            description = description.replace(templateVar, 'N/A');
                        }
                    }
                }
            })
        }
        return description;
    }

    saveTask() {
        if (this.taskForm.valid) {
            if (this.validateTaskModel() && !this.isInvalidEndTime) {
                this.isInvalidEndTime = false;
            //    this.isInvalidFollowUpDate = false;
                let taskModelForSave = JSON.parse(JSON.stringify(this.taskModel));
                taskModelForSave.FollowUpDate = this._dateTimeService.convertDateObjToString(taskModelForSave.FollowUpDate, this.dateFormat);
                
                this._httpService.save(StaffActivityApi.saveTask, taskModelForSave)
                .subscribe(
                    (data:ApiResponse) => {
                        this.activitySaved.emit(true);
                    
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", 'Task'));
                        this.onClosePopup();
                    },
                    error => {
                        this.activitySaved.emit(false);
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", 'Task'));
                    }
                )
            }
            
        }
        else {
            this.showValidationMessage(true);
        }
    }

    validateTaskModel() {
        let today = new Date();
        let isValid = true;
        today.setHours(0,0,0,0);
       // if (new Date(this.taskModel.FollowUpDate) < today) {
       //     this.isInvalidFollowUpDate = true;
      //      isValid = false;
      //  }

        if (this.taskModel.FollowUpEndTime > this.taskModel.FollowUpStartTime) {
            this.isInvalidEndTime = false;
        }
        else {
            this.isInvalidEndTime = true;
            isValid = false;
        }

        return isValid;
    }

    showValidationMessage(isVisible: boolean) {
        this.isInvalidData = isVisible;
    }

    setEndDateInterval(startDateTime: Date) {
        let endTime = startDateTime.getMinutes() + 15;
        startDateTime.setMinutes(endTime)
        return startDateTime;
    }

    // #endregion
}