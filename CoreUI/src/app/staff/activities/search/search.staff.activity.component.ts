// #region References

/********************** Angular References *********************/
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { SubscriptionLike as ISubscription } from 'rxjs';
/********************** Material References *********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** Services & Models *********************/
/* Models */
import { ClientActivity, ClientActivityInfo } from 'src/app/customer/client/models/client.activity.model';
import { PersonInfo } from 'src/app/models/common.model';
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MessageService } from '../../../services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { AuthService } from 'src/app/helper/app.auth.service';
/********************** Common & Customs *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { StaffActivityApi } from 'src/app/helper/config/app.webapi';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { Messages } from 'src/app/helper/config/app.messages';
import { ENU_ActivityType, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { ENU_Permission_Module, ENU_Permission_Staff } from 'src/app/helper/config/app.module.page.enums';

/********************** Components *********************/
import { StaffActivityCount, StaffActivityTabOptions, StaffTaskView } from 'src/app/staff/models/staff.activity.model';
import { SaveStaffActivityComponent } from '../save/save.staff.activity.component';
import { ViewStaffTaskComponent } from '../view/view.staff.task.component';
import { CompleteTaskComponent } from 'src/app/shared/components/activities/edit/complete.task.component';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { TimeFormatPipe } from 'src/app/application-pipes/time-format.pipe';

// import { ViewMemberActivityComponent } from '../view/view.activity.component';

// #endregion

@Component({
    selector: 'search-staff-activity',
    templateUrl: './search.staff.activity.component.html',
})

export class SearchStaffActivityComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    // #region Local Members

    @ViewChild(MatPaginator) paginator: MatPaginator;

    isSaveActivityAllowed: boolean = false;
    isBackToSearchAllowed: boolean = false;

    staffID: number;
    selectedTabIndex: number = 0;
    isDataExists: boolean = false;
    shouldGetPersonInfo: boolean = false;
    previousPageSize = 0;
    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    successMessage: string;
    errorMessage: string;
    /*********** Collection Types **********/
    allActivities: ClientActivity[] = [];
    activityTypeCountList: any[];

    /************ Model References******/
    clientActivityModel = new ClientActivity();
    personInfo: PersonInfo;
    // activityTask: ViewMemberTask;
    staffActivityTabOptions: StaffActivityTabOptions;
    activityCount: StaffActivityCount;
    clientInfo: ClientActivityInfo;
    staffTaskView: StaffTaskView;

    staffIDSubscription: ISubscription;
    activityCountSubscription: ISubscription;

    /*********** Configurations **********/
    activityTypes = Configurations.ActivityTypes;
    activityType = ENU_ActivityType;
    dateFormat: string = "";//Configurations.DateFormat;
    activeTab = Configurations.ActivityTypes.All;

    /*********** Pagination **********/
    defaultPageSize: number = Configurations.DefaultPageSize;
    pageSizeOptions = Configurations.PageSizeOptions;
    pageNumber: number = 1;
    /* Calculates No. of Records shown on current page (0 means records for first page) */
    pageIndex: number = 0;
    totalRecords: number = 0;

    // #endregion

    constructor(
        private _authService: AuthService,
        private _dataSharingService: DataSharingService,
        private _httpService: HttpService,
        private _dialog: MatDialogService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _TimeFormatPipe: TimeFormatPipe,
    ) { super(); }

    ngOnInit() {
        this.getBranchDatePattern();
    }

    ngOnDestroy() {
        this.staffIDSubscription.unsubscribe();
        this.activityCountSubscription.unsubscribe();
    }

    // #region Events

    onAddActivity() {
        if (this.staffID > 0) {
            this.openNewStaffActivity();
        }
    }

    onTaskMarkAsDone(activityID: number) {
        this.taskMarkAsDone(activityID);
    }

    onDeleteActivity(activityID: number, activityTypeID: number) {
        const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true, data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_Undone } });
        deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                if (activityID) {
                    this.deleteActivity(activityID, activityTypeID);
                }
            }
        })
    }

    onTabChange(event: any) {
        this.selectedTabIndex = event.index;
        this.activeTab = event.tab.textLabel;
        this.pageNumber = 1;
        this.getDataByActiveTab(this.activeTab);
    }

    onPageChange(e: any) {
        if (e.pageIndex >= this.pageNumber) {
            // Set page number
            this.pageNumber = ++e.pageIndex;
        }
        else {
            if (e.pageIndex >= 1) {
                this.pageNumber = --this.pageNumber;
            }
            else { this.pageNumber = 1 }
        }
        if (this.previousPageSize !== e.pageSize) {
            this.pageNumber = 1;
            this.paginator.pageSize = e.pageSize;
            this.paginator.pageIndex = 0;
        }
        this.previousPageSize = e.pageSize;
        this.getDataByActiveTab(this.activeTab);
    }

    onEditActivity(activityID: number, activityTypeID: number) {
        switch (activityTypeID) {
            case (this.activityType.Task): {
                this.editActivityByactivityID(activityID, activityTypeID);
                break
            }
            case (this.activityType.Note): {
                this.editActivityByactivityID(activityID, activityTypeID);
                break
            }
        }
    }

    // #endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.isBackToSearchAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.View);
        this.isSaveActivityAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Activity_Save);

        this.activityCount = new StaffActivityCount();
        this.clientInfo = new ClientActivityInfo();

        this.paginator.pageSize = this.defaultPageSize;
        this.previousPageSize = this.defaultPageSize;

        this.staffIDSubscription = this._dataSharingService.staffID.subscribe((staffId: number) => {
            if (staffId && staffId > 0) {
                this.staffID = staffId;
                this.getDataByActiveTab(this.activeTab);
                //this.getActivityCount();
                //set PersonID and PersonTypeID for personInfo
                this.personInfo = new PersonInfo();
                this.personInfo.PersonID = this.staffID;
                this.shouldGetPersonInfo = true;
            }
        });

        this.activityCountSubscription = this._dataSharingService.updateActivityCount.subscribe((isUpdateRequired: boolean) => {
            if (isUpdateRequired) {
                //this.getActivityCount();
            }
        });
    }

    openNewStaffActivity() {
        const dialogRef = this._dialog.open(SaveStaffActivityComponent,
            {
                disableClose: true,
                data: {
                    isEditMode: false,
                    defaultActiveTab: this.activeTab,
                    activeTabs: [
                        //   this.activityTypes.Call,
                        this.activityTypes.Task,
                        this.activityTypes.Note,
                        this.activityTypes.Email,
                        this.activityTypes.SMS
                    ]
                }
            });

        dialogRef.componentInstance.activitySaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getDataByActiveTab(this.activeTab);
            }

        })
    }

    getAllActivites() {
        this.getActivitiesByTypeId(this.activityType.All);
    }

    getAllTaskActivites() {
        this.getActivitiesByTypeId(this.activityType.Task);
    }

    getAllEmailActivites() {
        this.getActivitiesByTypeId(this.activityType.Email);
    }

    getAllNoteActivites() {
        this.getActivitiesByTypeId(this.activityType.Note);
    }

    getAllSMSActivites() {
        this.getActivitiesByTypeId(this.activityType.SMS);
    }

    getActivitiesByTypeId(activityTypeId: number) {
        if (this.staffID > 0) {
            let params = {
                assignedToStaffID: this.staffID,
                activityTypeId: activityTypeId,
                pageNumber: this.pageNumber,
                pageSize: this.paginator.pageSize
            }

            this.allActivities = [];
            this._httpService.get(StaffActivityApi.getAll, params)
                .subscribe(data => {
                    this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                    if (this.isDataExists) {
                        this.allActivities = this.setActivityIconVisibility(data.Result);
                        this.totalRecords = data.TotalRecord;
                        this.paginator.pageIndex = (this.pageNumber - 1);
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Activities")); }
                );
        }
    }

    getActivityCount() {
        let params = {
            assignedToStaffID: this.staffID
        }
        this._httpService.get(StaffActivityApi.getActivityCount, params)
            .subscribe(
                data => {
                    if (data && data.MessageCode > 0) {
                        this.activityTypeCountList = data.Result;
                        this.setActivityCount();
                    }
                    else {
                        this.activityCount = new StaffActivityCount();
                        this._messageService.showErrorMessage(data.MessageText)
                    }
                }
            );
    }

    setActivityCount() {
        this.activityCount = new StaffActivityCount();
        this.activityTypeCountList.forEach((activityCount: any) => {
            switch (activityCount.ActivityTypeID) {

                case this.activityType.Email: {
                    this.activityCount.EmailCount = activityCount.ActivityTypeCount;
                    break;
                }

                case this.activityType.Note: {
                    this.activityCount.NoteCount = activityCount.ActivityTypeCount;
                    break;
                }

                case this.activityType.SMS: {
                    this.activityCount.SMSCount = activityCount.ActivityTypeCount;
                    break;
                }
                case this.activityType.Task: {
                    this.activityCount.TaskCount = activityCount.ActivityTypeCount;
                    break;
                }
            }
        });
    }

    setActivityIconVisibility(activitiesData: any) {
        let activityList: ClientActivity[];

        if (activitiesData && activitiesData.length > 0) {
            activityList = activitiesData;

            activityList.forEach(activity => {
                activity.ShowEditIcon = (activity.ActivityTypeID === this.activityType.Appointment && !activity.IsNow && !activity.MarkedAsDone) ||
                    (activity.ActivityTypeID === this.activityType.Call && !activity.IsNow && !activity.MarkedAsDone) ||
                    (activity.ActivityTypeID === this.activityType.Note) ||
                    (activity.ActivityTypeID === this.activityType.Task && !activity.MarkedAsDone);
                activity.ShowMarkAsDoneIcon = !activity.MarkedAsDone;
                activity.ShowDeleteIcon = (activity.ActivityTypeID === this.activityType.Task && !activity.MarkedAsDone) ||
                    (activity.ActivityTypeID === this.activityType.Note);
                activity.ShowViewIcon = (activity.ActivityTypeID === this.activityType.Task);
                if(activity.CreatedOn){
                    activity.StartTime = this._TimeFormatPipe.transform(activity.CreatedOn.toString().split("T")[1].split(":")[0] + ":" + activity.CreatedOn.toString().split("T")[1].split(":")[1]);
                }
                if(activity.ModifiedOn){
                    activity.ModifiedTime = this._TimeFormatPipe.transform(activity.ModifiedOn.toString().split("T")[1].split(":")[0] + ":" + activity.ModifiedOn.toString().split("T")[1].split(":")[1]);
                }
            });
        }
        return activityList;
    }

    getDataByActiveTab(activeTab: string) {
        switch (activeTab) {
            case this.activityTypes.Task: {
                this.getAllTaskActivites();
                break
            }

            case this.activityTypes.Email: {
                this.getAllEmailActivites();
                break
            }

            case this.activityTypes.Note: {
                this.getAllNoteActivites();
                break;
            }

            case this.activityTypes.SMS: {
                this.getAllSMSActivites();
                break
            }

            default: {
                this.getAllActivites();
            }
        }
    }

    editActivityByactivityID(activityID: number, activityTypeID: number) {
        this.getActivityById(activityID, activityTypeID).subscribe(
            (data: any) => {
                //remove zone from date added by fahad for browser different time zone issue resolving
                data.Result.FollowUpDate = this._dateTimeService.removeZoneFromDateTime(data.Result.FollowUpDate);

                this.openDialogForTaskEdit(data.Result, activityTypeID);
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Appointment")) }
        )
    }

    taskMarkAsDone(activityID: number) {
        this.getTaskForView(activityID).subscribe((data: any) => {
            const markAsDoneDialogRef = this._dialog.open(CompleteTaskComponent, {
                disableClose: true,
                data: {
                    activityId: activityID,
                    // apiUrls: this.tabsOptions.apiUrls,
                    assignedToStaffID: this.staffID,
                    // module: this.tabsOptions.module,
                    task: data.Result
                }
            });

            markAsDoneDialogRef.componentInstance.markedAsDone.subscribe((isSuccess: boolean) => {
                if (isSuccess) {
                    this.getDataByActiveTab(this.activeTab);
                }
            });

        },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Task")); }
        );
    }

    getTaskForView(activityID: number) {
        let url = StaffActivityApi.getViewTaskById.replace("{staffActivityId}", activityID.toString())
            .replace("{staffID}", this.staffID.toString());

        return this._httpService.get(url);
    }

    getActivityById(activityID: number, activityTypeID: number) {
        let url = "";
        if (activityTypeID === this.activityType.Task) {
            url = StaffActivityApi.getTaskById.replace("{staffActivityId}", activityID.toString())
                .replace("{staffID}", this.staffID.toString());
        } else if (activityTypeID === this.activityType.Note) {
            url = StaffActivityApi.getNoteById.replace("{staffActivityId}", activityID.toString())
                .replace("{assignedToStaffID}", this.staffID.toString());
        }
        return this._httpService.get(url);
    }

    onViewTaskActivity(activityID: number) {
        this.getTaskForView(activityID).subscribe(
            (data: any) => {
                this.staffTaskView = data.Result;
                //remove zone from date  added by fahad for browser different time zone issue resolving
                this.staffTaskView.FollowUpDate = this._dateTimeService.removeZoneFromDateTime(this.staffTaskView.FollowUpDate);
                this.staffTaskView.FollowUpDate = this._dateTimeService.convertDateObjToString(new Date(this.staffTaskView.FollowUpDate), this.dateFormat);
                this.openDialogForTaskView();
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Activity")) }
        )
    }


    getViewTaskById(activityID: number) {
        let url = StaffActivityApi.getTaskById.replace("{staffActivityId}", activityID.toString())
            .replace("{staffID}", this.staffID.toString());

        return this._httpService.get(url);
    }

    openDialogForTaskView() {
        this._dialog.open(
            ViewStaffTaskComponent,
            {
                disableClose: true,
                data: this.staffTaskView
            }
        )
    }


    openDialogForTaskEdit(taskModel: any, activityTypeID: number) {
        let activityTask = activityTypeID === this.activityType.Task ? this.activityTypes.Task : this.activityTypes.Note;
        this.setActivityEditModeOptions(activityTask, taskModel);
        const editActivityDialog = this._dialog.open(
            SaveStaffActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.staffActivityTabOptions
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForTasktMarkAsDone(taskModel: any) {
        taskModel.FollowUpDate = new Date();
        this.setActivityEditModeOptions(this.activityTypes.Task, taskModel, true);
        const editActivityDialog = this._dialog.open(
            SaveStaffActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.staffActivityTabOptions
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    setActivityEditModeOptions(activeTab: string, modelData: any, isMarkAsDone?: boolean) {
        this.staffActivityTabOptions = new StaffActivityTabOptions();

        this.staffActivityTabOptions.isEditMode = true;
        this.staffActivityTabOptions.activeTabs = [activeTab];
        this.staffActivityTabOptions.modelData = modelData;

        if (isMarkAsDone) {
            this.staffActivityTabOptions.isMarkAsDone = isMarkAsDone;
        }
    }

    deleteActivity(staffActivityId: number, activityTypeID: number) {
        let url = StaffActivityApi.delete.replace("{staffID}", this.staffID.toString())
            .replace("{staffActivityId}", staffActivityId.toString())
            .replace("{activityTypeID}", activityTypeID.toString());
        this._httpService.delete(url)
            .subscribe((res: any) => {
                if (res && res.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Activity"));
                    this.getDataByActiveTab(this.activeTab);
                    this._dataSharingService.shareUpdateActivityCount(true);
                } else {
                    this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Activity"));
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Activity")); }
            );
    }


    // #endregion

}