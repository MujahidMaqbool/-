// #region Imports

/********************** Angular References *********************/
import { Component, ViewChild, OnInit } from "@angular/core";
import { debounceTime } from 'rxjs/internal/operators';
import { FormControl } from "@angular/forms";
/********************** Material References *********************/
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
/********************** Services & Models *********************/
/* Models */
import { AllStaffTask, StaffTaskSearchParameter, PriorityType, TaskActivityView } from "@app/models/activity.model";
import { AllStaff, ApiResponse } from "@app/models/common.model";
/* Services */
import { DateTimeService } from "@app/services/date.time.service";
import { HttpService } from "@app/services/app.http.service";
import { MessageService } from "@app/services/app.message.service";
import { CommonService } from '@app/services/common.service';
import { DataSharingService } from "@app/services/data.sharing.service";
import { AuthService } from "@app/helper/app.auth.service";
/********************** Common & Customs *********************/
import { StaffActivityApi } from "@app/helper/config/app.webapi";
import { Messages } from "@app/helper/config/app.messages";
import { DatePipe } from "@angular/common";
import { Configurations } from "@app/helper/config/app.config";
import { ENU_ActivityType, ENU_DateFormatName } from "@app/helper/config/app.enums";
/********************** Components *********************/
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { CompleteTaskComponent } from "@app/shared/components/activities/edit/complete.task.component";
import { ViewActivityComponent } from "@app/shared/components/activities/view/view.activity.component";
import { ENU_Permission_Module, ENU_Permission_Staff } from "@app/helper/config/app.module.page.enums";
import { DateToDateFromComponent } from "@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";
import { SaveTaskComponent } from "./save/save.task.component";
// #endregion 


@Component({
    selector: 'staff-task',
    templateUrl: './staff.task.component.html'
})

export class StaffTaskComponent extends AbstractGenericComponent implements OnInit {
    // #region  Local Members

    @ViewChild('taskDateSearch') taskDateSearch: DateToDateFromComponent;

    /* Local Members */
    isSaveTaskAllowed: boolean = false;

    staffName: string = "";
    personName: string = "";
    taskDateFrom: Date;
    taskDateTo: Date;
    maxDate: Date = new Date();
    isDataExists: boolean = false;
    /* Messages */
    messages = Messages;
    errorMessage: string;
    successMessage: string;
    /* Collection and Model References */
    priorityTypeList: PriorityType[];
    allStaffTask: AllStaffTask[] = [];
    allPerson: AllStaff[];
    activityTask: TaskActivityView;
    activtyType = ENU_ActivityType;
    taskStatusList = Configurations.TaskStatus;
    staffTaskSearchParameter = new StaffTaskSearchParameter();
    searchPerson: FormControl = new FormControl();
    /* Configurations */
    dateFormat: string = "";//Configurations.DateFormat;
    pageSize = Configurations.DefaultPageSize;
    // #endregion 

    /***********Class Constructor*********/
    constructor(
        private _authService: AuthService,
        private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
        private _commonService: CommonService,
        private _dataSharingService: DataSharingService,
        private _openDialog: MatDialogService,
        private _dateFilter: DatePipe) {
            super();
    }


    ngOnInit() {
        this.getBranchDatePattern();
    }

    ngAfterViewInit() {
        this.resetStaffTaskSearchFilters();
        this.getAllStaffTask();
    }

    // #region Events 

    // onFromDateChange(date: any) {
    //     setTimeout(() => {
    //         this.staffTaskSearchParameter.DateFrom = date; //this.getDateString(date, this.dateFormat); 07/05/2018 MM/dd/yyyy   
    //     });
    // }

    // onToDateChange(date: any) {
    //     setTimeout(() => {
    //         this.staffTaskSearchParameter.DateTo = date; //this.getDateString(date, this.dateFormat); 07/05/2018 MM/dd/yyyy   
    //     });
    // }

    reciviedDateTo($event) {
        this.staffTaskSearchParameter.DateFrom = $event.DateFrom;
        this.staffTaskSearchParameter.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.staffTaskSearchParameter.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.staffTaskSearchParameter.DateTo = date;
    }

    onActivityMarkAsDone(activityID: number, assignedToStaffID: number) {
        this._dataSharingService.shareStaffID(assignedToStaffID);
        this.taskMarkAsDone(activityID, assignedToStaffID);
    }

    onResetParameters() {
        this.resetStaffTaskSearchFilters();
        this.getAllStaffTask();
        
    }

    onViewTask(activityID: number, assignedToStaffID: number) {
        this._dataSharingService.shareStaffID(assignedToStaffID);
        this.viewTaskActivity(activityID, assignedToStaffID);
    }

    onEditTask(staffActivityID: number, staffID: number) {
        this.editTaskActivity(staffActivityID, staffID);
    }

    onDeleteActivity(assignedToStaffID: number, activityID: number) {
        const deleteDialogRef = this._openDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
        deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                if (activityID) {
                    this.deleteActivity(assignedToStaffID, activityID);
                }
            }
        })
    }

    // #endregion

    // #region Methods 

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.getTaskFundamentals();

        this.isSaveTaskAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.AllTask_Save);

        this.searchPerson.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {
                    if (typeof (searchText) === "string") {
                        this._commonService.searchStaff(searchText)
                            .subscribe(
                                response => {
                                    if (response.Result != null && response.Result.length) {
                                        this.allPerson = response.Result;
                                        this.allPerson.forEach(person => {
                                            person.FullName = person.FirstName + " " + person.LastName;
                                        });
                                    }
                                    else {
                                        this.allPerson = [];
                                    }
                                });
                    }
                }
                else {
                    this.allPerson = [];
                }
            });
    }

    openTaskDialouge(result: any) {

        const dialogref = this._openDialog.open(SaveTaskComponent,
            {
                disableClose: true,
                data: result
            });

        dialogref.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getAllStaffTask();
            }
        });
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
            (data:ApiResponse) => {
                if (data && data.MessageCode > 0) {
                    this.priorityTypeList = data.Result.PriorityTypeList;
                    this.priorityTypeList.splice(0, 0, { PriorityTypeID: null, PriorityTypeName: "All", IsActive: true });
                }
                else{
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
        )
    }

    getAllStaffTask() {
        let params = {
            staffID: this.staffTaskSearchParameter.StaffID,
            dateFrom: this.staffTaskSearchParameter.DateFrom,
            dateTo: this.staffTaskSearchParameter.DateTo,
            priorityTypeID: this.staffTaskSearchParameter.PriorityTypeID,
            markedAsDone: this.staffTaskSearchParameter.MarkedAsDone ? true : false,
            pageNumber: this.staffTaskSearchParameter.PageNumber,
            pageSize: this.staffTaskSearchParameter.PageSize
        }
        this._httpService.get(StaffActivityApi.getAllStaffTask, params).subscribe(
            (data:ApiResponse) => {
                if(data && data.MessageCode > 0){
                this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    this.allStaffTask = data.Result;
                    this.allStaffTask.forEach(staffTaskObj => {
                        if (staffTaskObj.FollowUpStartTime && staffTaskObj.FollowUpStartTime != "") {
                            staffTaskObj.FollowUpStartTime = this._dateTimeService.formatTimeString(staffTaskObj.FollowUpStartTime);
                            staffTaskObj.FollowUpEndTime = this._dateTimeService.formatTimeString(staffTaskObj.FollowUpEndTime);
                        }
                    })
                }
                else {
                    this.allStaffTask = [];
                }
            }else{
                this._messageService.showErrorMessage(data.MessageText);
            }
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
        )
    }

    viewTaskActivity(activityID: number, assignedToStaffID: number) {
        this.getViewTaskById(activityID, assignedToStaffID).subscribe(
            (data: any) => {
                this.activityTask = data.Result;

                //remove zone from date added by fahad for browser different time zone issue resolving
                this.activityTask.FollowUpDate = this._dateTimeService.removeZoneFromDateTime(data.Result.FollowUpDate)
                this.activityTask.FollowUpDate = this._dateFilter.transform(data.Result.FollowUpDate,  this.dateFormat);
                this.openDialogForTaskView();
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Activity")) }
        )
    }

    editTaskActivity(staffActivityID: number, staffID: number) {
        this.getTaskById(staffActivityID, staffID).subscribe(
            (data: any) => {
                //remove zone from date added by fahad for browser different time zone issue resolving
                data.Result.FollowUpDate = this._dateTimeService.removeZoneFromDateTime(data.Result.FollowUpDate);
                this.openTaskDialouge(data.Result);
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Task")) }
        )
    }

    getTaskById(staffActivityID: number, staffID: number) {
        let url = StaffActivityApi.getTaskById
            .replace("{staffActivityId}", staffActivityID.toString())
            .replace("{staffID}", staffID.toString());

        return this._httpService.get(url);
    }

    deleteActivity(assignedToStaffID: number, activityID: number) {
        let url = StaffActivityApi.delete
            .replace("{staffActivityId}", activityID.toString())
            .replace("{activityTypeID}", this.activtyType.Task.toString())
            .replace("{staffID}", assignedToStaffID.toString());
        this._httpService.delete(url)
            .subscribe((res:ApiResponse) => {
                if(res && res.MessageCode > 0){
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Activity"));
                this.getAllStaffTask();
                }else{
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Activity")); }
            );
    }

    taskMarkAsDone(activityID: number, assignedToStaffID: number) {
        this.getViewTaskById(activityID, assignedToStaffID).subscribe((data: any) => {
            const markAsDoneDialogRef = this._openDialog.open(CompleteTaskComponent, {
                disableClose: true,
                data: {
                    activityId: activityID,
                    apiUrls: {
                        saveStatus: StaffActivityApi.saveStaffTaskMarkAsDone,
                        getTaskFundamentals: StaffActivityApi.getTaskFundamentals
                    },
                    assignedToStaffID: assignedToStaffID,
                    task: data.Result
                }
            });
            markAsDoneDialogRef.componentInstance.markedAsDone.subscribe((isSuccess: boolean) => {
                if (isSuccess) {
                    this.getAllStaffTask();
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
        this.getAllStaffTask();
    }

    getSelectedStaff(person: AllStaff) {
        this.staffTaskSearchParameter.StaffID = person.StaffID;
    }

    displayStaffName(user?: AllStaff): string | undefined {
        return user ? user.FirstName + ' ' + user.LastName : undefined;
    }

    resetStaffTaskSearchFilters() {
        this.taskDateSearch.setEmptyDateFilter();
        this.staffName = "";
        // this.staffTaskSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.maxDate, this.dateFormat);
        // this.staffTaskSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.maxDate, this.dateFormat);
        this.staffTaskSearchParameter.PriorityTypeID = null;
        this.staffTaskSearchParameter.StaffID = null;
        this.staffTaskSearchParameter.MarkedAsDone = 0;
        this.staffTaskSearchParameter.PageNumber = 1;
        this.staffTaskSearchParameter.PageSize = this.pageSize;
        this.taskDateTo = null;
        this.taskDateFrom = null;
    }
    // #endregion

}