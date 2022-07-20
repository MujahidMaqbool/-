// #region Imports

/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from "@angular/core";

/********************** Material References *********************/

/********************** Services & Models *********************/
/* Models */
import { AllStaffTask, StaffTaskSearchParameter, PriorityType, TaskActivityView } from "src/app/models/activity.model";
/* Services */
import { DateTimeService } from "src/app/services/date.time.service";
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";
/********************** Common & Customs *********************/
import { StaffActivityApi } from "src/app/helper/config/app.webapi";
import { Messages } from "src/app/helper/config/app.messages";
import { DatePipe } from "@angular/common";
import { Configurations } from "src/app/helper/config/app.config";
import { ENU_ActivityType, ENU_DateFormatName } from "src/app/helper/config/app.enums";
/********************** Components *********************/
import { CompleteTaskComponent } from "src/app/shared/components/activities/edit/complete.task.component";
import { ViewActivityComponent } from "src/app/shared/components/activities/view/view.activity.component";
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { DateToDateFromComponent } from "src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component";
import { ApiResponse } from "src/app/models/common.model";

// #endregion


@Component({
    selector: 'my-tasks',
    templateUrl: './my.tasks.component.html'
})

export class MyTasksComponent extends AbstractGenericComponent implements OnInit {

    @ViewChild('allTasksToFromDateComoRef') allTasksToFromDateComoRef: DateToDateFromComponent;
    // #region  Local Members
    /* Local Members */
    taskDateFrom: Date;
    taskDateTo: Date;
    maxDate: Date = new Date();
    isDataExists: boolean = false;
    /* Messages */
    messages = Messages;
    errorMessage: string;
    successMessage: string;
    /* Collection and Model References */
    statusList: any;
    priorityTypeList: PriorityType[];
    myTasksList: AllStaffTask[] = [];
    activityTask: TaskActivityView;
    activtyType = ENU_ActivityType;
    taskStatusList = Configurations.TaskStatus;
    staffTaskSearchParameter = new StaffTaskSearchParameter();
    /* Configurations */
    dateFormat = Configurations.DateFormat;
    pageSize = Configurations.DefaultPageSize;
    dateFormatForView: string = Configurations.DateFormat;
    // #endregion

    /***********Class Constructor*********/
    constructor(private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _openDialog: MatDialogService,
        private _dateFilter: DatePipe) {
        super();
    }


    ngOnInit() {
        this.getBranchDatePattern();
        this.resetStaffTaskSearchFilters();
        this.getMyTasks();
        this.getTaskFundamentals();
    }

    ngAfterViewInit() {
        this.allTasksToFromDateComoRef.setEmptyDateFilter();
    }

    // #region Events

    onFromDateChange(date: any) {
        setTimeout(() => {
            this.staffTaskSearchParameter.DateFrom = date; //this.getDateString(date, this.dateFormat); 07/05/2018 MM/dd/yyyy
        });
    }

    onToDateChange(date: any) {
        setTimeout(() => {
            this.staffTaskSearchParameter.DateTo = date; //this.getDateString(date, this.dateFormat); 07/05/2018 MM/dd/yyyy
        });
    }

    onActivityMarkAsDone(activityID: number, assignedToStaffID: number) {
        //this._dataSharingService.shareStaffID(assignedToStaffID);
        this.taskMarkAsDone(activityID, assignedToStaffID);
    }

    onResetParameters() {
        this.resetStaffTaskSearchFilters();
        this.getMyTasks();
    }

    onViewTask(activityID: number, assignedToStaffID: number) {
        //this._dataSharingService.shareStaffID(assignedToStaffID);
        this.viewTaskActivity(activityID, assignedToStaffID);
    }

    onClosePopup() {
        this.closePopup();
    }

    // #endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dateFormatForView = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    }
    
    openDialogForTaskView() {
        this._openDialog.open(
            ViewActivityComponent,
            {
                disableClose: true,
                data: this.activityTask
            }
        )
    }

    getDateString(dateValue: Date, dateFormat: string) {
        return this._dateTimeService.convertDateObjToString(dateValue, dateFormat);
    }

    getTaskFundamentals() {
        this._httpService.get(StaffActivityApi.getTaskFundamentals).subscribe(
            (res: ApiResponse) => {
                if (res && res.Result) {
                    this.priorityTypeList = res.Result.PriorityTypeList;
                    this.setDefalutValues();
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
        )
    }

    getMyTasks() {
        let params = {
            //staffID: this.staffTaskSearchParameter.StaffID,
            dateFrom: this.staffTaskSearchParameter.DateFrom,
            dateTo: this.staffTaskSearchParameter.DateTo,
            priorityTypeID: this.staffTaskSearchParameter.PriorityTypeID,
            markedAsDone: this.staffTaskSearchParameter.MarkedAsDone ? true : false,
            pageNumber: this.staffTaskSearchParameter.PageNumber,
            pageSize: this.staffTaskSearchParameter.PageSize
        }
        this._httpService.get(StaffActivityApi.getMyTasksById, params).subscribe(

            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isDataExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isDataExists) {
                        this.myTasksList = res.Result;
                        this.myTasksList.forEach(staffTaskObj => {
                            if (staffTaskObj.FollowUpStartTime && staffTaskObj.FollowUpStartTime != "") {
                                staffTaskObj.FollowUpStartTime = this._dateTimeService.formatTimeString(staffTaskObj.FollowUpStartTime);
                                staffTaskObj.FollowUpEndTime = this._dateTimeService.formatTimeString(staffTaskObj.FollowUpEndTime);
                            }
                        })
                    }
                    else {
                        this.myTasksList = [];
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
        )
    }

    setDefalutValues() {
        this.priorityTypeList.splice(0, 0, { PriorityTypeID: null, PriorityTypeName: "All", IsActive: true });
    }

    viewTaskActivity(activityID: number, assignedToStaffID: number) {
        this.getViewTaskById(activityID, assignedToStaffID).subscribe(
            (data: any) => {
                this.activityTask = data.Result;
                this.activityTask.FollowUpDate = this._dateTimeService.removeZoneFromDateTime(data.Result.FollowUpDate);
                this.activityTask.FollowUpDate = this._dateFilter.transform(data.Result.FollowUpDate, Configurations.DateFormat);
                this.activityTask.AssignedToStaffID = assignedToStaffID;
                this.activityTask.isMyTask = true;
                this.openDialogForTaskView();
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Activity")) }
        )
    }

    getTaskById(staffActivityID: number, staffID: number) {
        let url = StaffActivityApi.getTaskById
            .replace("{staffActivityId}", staffActivityID.toString())
            .replace("{staffID}", staffID.toString());

        return this._httpService.get(url);
    }

    taskMarkAsDone(activityID: number, assignedToStaffID: number) {
        this.getViewTaskById(activityID, assignedToStaffID).subscribe((data: any) => {
            const markAsDoneDialogRef = this._openDialog.open(CompleteTaskComponent, {
                disableClose: true,
                data: {
                    activityId: activityID,
                    assignedToStaffID: assignedToStaffID,
                    task: data.Result
                }
            });
            markAsDoneDialogRef.componentInstance.markedAsDone.subscribe((isSuccess: boolean) => {
                if (isSuccess) {
                    this.getMyTasks();
                }
            });
        },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Task")); })
    }

    getViewTaskById(activityID: number, assignedToStaffID: number) {
        let url = StaffActivityApi.getViewTaskById
            .replace("{staffActivityId}", activityID.toString())
            .replace("{staffID}", assignedToStaffID.toString());

        return this._httpService.get(url);
    }

    searchStaffTask() {
        this.getMyTasks();
    }

    resetStaffTaskSearchFilters() {
        this.staffTaskSearchParameter.DateFrom = "";
        this.staffTaskSearchParameter.DateTo = "";
        this.staffTaskSearchParameter.PriorityTypeID = null;
        this.staffTaskSearchParameter.StaffID = null;
        this.staffTaskSearchParameter.MarkedAsDone = 0;
        this.staffTaskSearchParameter.PageNumber = 1;
        this.staffTaskSearchParameter.PageSize = this.pageSize;
        this.allTasksToFromDateComoRef?.setEmptyDateFilter();
        this.taskDateTo = null;
        this.taskDateFrom = null;
    }

    closePopup() {
        this._openDialog.closeAll();
    }

    reciviedDateTo($event) {
      this.staffTaskSearchParameter.DateFrom = $event.DateFrom;
      this.staffTaskSearchParameter.DateTo = $event.DateTo;
    }

    // #endregion

}
