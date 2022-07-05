// #region Imports

/********************** Angular References *********************/
import { Component, OnInit, OnDestroy, ViewChild, Input, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SubscriptionLike as ISubscription } from 'rxjs';
/********************** Material References *********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** Services & Models *********************/
/* Models */
import { ActivityList, TaskActivityView, StatusType } from '@models/activity.model';
import { ActivityTabsOptions } from '@models/activity.tab.options';
import { ActivityCount } from '@models/activity.model';

/* Services */
import { HttpService } from '@services/app.http.service';
import { DataSharingService } from '@services/data.sharing.service';
import { MessageService } from '@services/app.message.service';

/********************** Common & Customs *********************/
import { Configurations } from '@helper/config/app.config';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';


/********************** Components *********************/
import { CompleteTaskComponent } from '../edit/complete.task.component';
import { ViewActivityComponent } from '../view/view.activity.component';
import { SaveActivityComponent } from '../save/save.activity.component';
import { Messages } from '@app/helper/config/app.messages';
import { ENU_ModuleList, ENU_ActivityType, ENU_DateFormatName, ENU_ActivitySubType } from '@app/helper/config/app.enums';
import { MatDialogService } from '../../generics/mat.dialog.service';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { LeadActivityApi } from '@app/helper/config/app.webapi';
import { TimeFormatPipe } from '@app/application-pipes/time-format.pipe';

// #endregion 

@Component({
    selector: 'search-activity',
    templateUrl: './search.activity.component.html',
})

export class SearchActivityComponent extends AbstractGenericComponent implements OnInit, AfterViewInit, OnDestroy {

    // #region  Local Members

    dateFormat: string = "";

    @Input()
    tabsOptions: ActivityTabsOptions;

    @ViewChild(MatPaginator) paginator: MatPaginator;

    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    errorMessage: string;
    successMessage: string;

    activeTab: string;
    selectedTabIndex: number = 0;
    isDataExists: boolean = false;
    module: number;
    isFirstLoad: boolean = true;

    activityTask: TaskActivityView;
    activityCount: ActivityCount;

    activityCountSubscription: ISubscription;

    /*********** Collection Types **********/
    allActivities: ActivityList[] = [];
    priorityTypeList: any[];
    statusTypeList: any[];
    staffList: any[];
    activityTypeCountList: any[];

    /*********** Configurations **********/
    activityTypes = Configurations.ActivityTypes;
    activityType = ENU_ActivityType;
    modules = ENU_ModuleList;
    statusType = StatusType;

    /*********** Pagination **********/
    defaultPageSize: number = Configurations.DefaultPageSize;
    pageSizeOptions = Configurations.PageSizeOptions;
    pageNumber: number = 1;
    /* Calculates No. of Records shown on current page (0 means records for first page) */
    pageIndex: number = 0;
    totalRecords: number = 0;
    previousPageSize = 0;
    isSearchByPageIndex: boolean = false;

    // #endregion

    constructor(
        private _activityService: HttpService,
        private _dataSharingService: DataSharingService,
        private _dateFilter: DatePipe,
        private _saveActivityDialog: MatDialogService,
        private _markAsDoneDialog: MatDialogService,
        private _deleteActivityDialog: MatDialogService,
        private _viewActivityDialog: MatDialogService,
        private _messageService: MessageService,
        private _TimeFormatPipe: TimeFormatPipe,
    ) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
        this.activityCount = new ActivityCount();

        this.activityCountSubscription = this._dataSharingService.updateActivityCount.subscribe((isUpdateRequired: boolean) => {
            if (isUpdateRequired) {
                //this.getActivityCount();
            }
        })
    }
    ngAfterViewInit() {
        this.paginator.pageSize = this.defaultPageSize;
        this.previousPageSize = this.defaultPageSize;
        if (this.tabsOptions && this.tabsOptions.apiUrls && this.isFirstLoad) {
            this.isFirstLoad = false;
            this.module = this.tabsOptions.module;
            this.getAllActivites();
            //this.getActivityCount();
        }
    }
    ngOnDestroy() {
        this.activityCountSubscription.unsubscribe();
    }

    // #region Events 
    onAddActivity() {
        if (this.tabsOptions) {
            let tabOptions = Object.assign({}, this.tabsOptions);
            tabOptions.defaultActiveTab = (!this.activeTab || this.activeTab === this.activityTypes.All) ? tabOptions.activeTabs[0] : this.activeTab;
            this.openAddActivityDialog(tabOptions);
        }
    }

    onActivityMarkAsDone(activityID: number, activityTypeID: number) {
        switch (activityTypeID) {
            case (this.activityType.Appointment): {
                this.appointmentMarkAsDone(activityID);
                break;
            }

            case (this.activityType.Call): {
                this.callMarkAsDone(activityID);
                break;
            }

            case (this.activityType.Task): {
                this.taskMarkAsDone(activityID);
                break;
            }
        }
    }

    onDeleteActivity(activityID: number, activityTypeID: number) {
        const deleteDialogRef = this._deleteActivityDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                if (activityID) {
                    this.deleteActivity(activityID, activityTypeID);
                }
            }
        })
    }

    onViewTaskActivity(activityID: number) {
        this.viewTaskActivity(activityID);
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
        // as per disscusion with B.A and tahir when user change page index pagination reset (show page 1)
        if (this.previousPageSize !== e.pageSize) {
            this.pageNumber = 1;
            this.paginator.pageSize = e.pageSize;
            this.paginator.pageIndex = 0;
        }
        this.previousPageSize = e.pageSize
        this.isSearchByPageIndex = true;
        this.getDataByActiveTab(this.activeTab);
    }

    onEditActivity(activityID: number, activityTypeID: number, ActivitySubTypeID: number) {
        switch (activityTypeID) {
            case (this.activityType.Appointment): {
                this.editAppointmentActivity(activityID, ActivitySubTypeID);
                break
            }
            case (this.activityType.Call): {
                this.editCallActivity(activityID, ActivitySubTypeID);
                break
            }
            case (this.activityType.Task): {
                this.editTaskActivity(activityID);
                break
            }
            case (this.activityType.Note): {
                this.editNoteActivity(activityID);
                break
            }
            case (this.activityType.Achievement): {
                this.editAchievementActivity(activityID);
                break
            }

        }
    }

    // #endregion

    // #region Methods 

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    }

    getAllActivites() {
        this.getActivitiesByTypeId(this.activityType.All);
    }

    getAllAppointmentActivites() {
        this.getActivitiesByTypeId(this.activityType.Appointment);
    }

    getAllCallActivites() {
        this.getActivitiesByTypeId(this.activityType.Call);
    }

    getAllEmailActivites() {
        this.getActivitiesByTypeId(this.activityType.Email);
    }

    getAllNoteActivites() {
        this.getActivitiesByTypeId(this.activityType.Note);
    }

    getAllTaskActivites() {
        this.getActivitiesByTypeId(this.activityType.Task);
    }

    getAllSMSActivites() {
        this.getActivitiesByTypeId(this.activityType.SMS);
    }

    getAllAchievementActivites() {
        this.getActivitiesByTypeId(this.activityType.Achievement);
    }

    getAllAppNotificationActivites() {
        this.getActivitiesByTypeId(this.activityType.AppNotification);
    }

    getActivitiesByTypeId(activityTypeId: number) {
        let params = {
            customerID: this.tabsOptions.ownerId.toString(),
            activityTypeID: activityTypeId,
            pageNumber: this.pageNumber.toString(),
            pageSize: this.paginator.pageSize.toString()
        }
        if (this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.getAll && this.tabsOptions.apiUrls.getAll.toString()) {

            this.allActivities = [];

            this._activityService.get(this.tabsOptions.apiUrls.getAll, params)
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

    // getActivityCount() {
    //     let params = {}
    //     if (this.tabsOptions.module == ModuleList.Staff) {
    //         params = {
    //             assignedToStaffID: this.tabsOptions.ownerId
    //         }
    //     }
    //     else {
    //         params = {
    //             customerID: this.tabsOptions.ownerId
    //         }
    //     }

    //     if (this.tabsOptions && this.tabsOptions.apiUrls && this.tabsOptions.apiUrls.getActivityCount && this.tabsOptions.apiUrls.getActivityCount.length > 0) {
    //         this._activityService.get(this.tabsOptions.apiUrls.getActivityCount, params)
    //             .subscribe(
    //                 data => {
    //                     if (data.Result) {
    //                         this.activityTypeCountList = data.Result;
    //                         this.setActivityCount();
    //                     }
    //                     else {
    //                         this.activityCount = new ActivityCount();
    //                     }
    //                 }
    //             );
    //     }
    // }

    // setActivityCount() {
    //     this.activityCount = new ActivityCount();
    //     this.activityTypeCountList.forEach((activityCount: any) => {
    //         switch (activityCount.ActivityTypeID) {
    //             case this.activityType.Appointment: {
    //                 this.activityCount.AppointmentCount = activityCount.ActivityTypeCount;
    //                 break;
    //             }

    //             case this.activityType.Call: {
    //                 this.activityCount.CallCount = activityCount.ActivityTypeCount;
    //                 break;
    //             }

    //             case this.activityType.Email: {
    //                 this.activityCount.EmailCount = activityCount.ActivityTypeCount;
    //                 break;
    //             }

    //             case this.activityType.Note: {
    //                 this.activityCount.NoteCount = activityCount.ActivityTypeCount;
    //                 break;
    //             }

    //             case this.activityType.SMS: {
    //                 this.activityCount.SMSCount = activityCount.ActivityTypeCount;
    //                 break;
    //             }

    //             case this.activityType.Task: {
    //                 this.activityCount.TaskCount = activityCount.ActivityTypeCount;
    //                 break;
    //             }
    //             case this.activityType.AppNotification: {
    //                 this.activityCount.AppNotificationCount = activityCount.ActivityTypeCount;
    //                 break;
    //             }
    //         }
    //     });
    // }

    setActivityIconVisibility(activitiesData: any) {
        let activityList: ActivityList[];

        if (activitiesData && activitiesData.length > 0) {
            activityList = activitiesData;

            activityList.forEach(activity => {
                activity.ShowEditIcon = (activity.ActivityTypeID === this.activityType.Appointment) ||
                    (activity.ActivityTypeID === this.activityType.Call) ||
                    (activity.ActivityTypeID === this.activityType.Note) ||
                    (activity.ActivityTypeID === this.activityType.Achievement) ||
                    (activity.ActivityTypeID === this.activityType.Task && !activity.MarkedAsDone);
                activity.ShowMarkAsDoneIcon = !activity.MarkedAsDone;
                //activity.ShowViewIcon = (activity.ActivityTypeID === this.activityType.Task);
                activity.ShowDeleteIcon = (activity.ActivityTypeID === this.activityType.Appointment) ||
                    (activity.ActivityTypeID === this.activityType.Call) ||
                    (activity.ActivityTypeID === this.activityType.Note) ||
                    (activity.ActivityTypeID === this.activityType.Achievement);
                //|| (activity.ActivityTypeID === this.activityType.Task && !activity.MarkedAsDone);
                if(activity.CreatedOn){
                    activity.StartTime = this._TimeFormatPipe.transform(activity.CreatedOn.toString().split("T")[1].split(":")[0] + ":" + activity.CreatedOn.toString().split("T")[1].split(":")[1]);
                }
                if(activity.ModifiedOn){
                    activity.ModifiedTime = this._TimeFormatPipe.transform(activity.ModifiedOn.toString().split("T")[1].split(":")[0] + ":" + activity.ModifiedOn.toString().split("T")[1].split(":")[1]);
                }
            });


            // activityList.forEach(activity => {
            //     activity.ShowEditIcon = (activity.ActivityTypeID === this.activityType.Appointment && !activity.IsNow && !activity.MarkedAsDone) ||
            //         (activity.ActivityTypeID === this.activityType.Call && !activity.IsNow && !activity.MarkedAsDone) ||
            //         (activity.ActivityTypeID === this.activityType.Task && !activity.MarkedAsDone);
            //     activity.ShowMarkAsDoneIcon = !activity.MarkedAsDone;
            //     activity.ShowViewIcon = (activity.ActivityTypeID === this.activityType.Task);
            //     activity.ShowDeleteIcon = (activity.ActivityTypeID === this.activityType.Appointment && !activity.IsNow && !activity.MarkedAsDone) ||
            //         (activity.ActivityTypeID === this.activityType.Call && !activity.IsNow && !activity.MarkedAsDone);
            // });
        }
        return activityList;
    }

    getDataByActiveTab(activeTab: string) {
        switch (activeTab) {
            case this.activityTypes.Appointment: {
                this.getAllAppointmentActivites();
                break
            }

            case this.activityTypes.Call: {
                this.getAllCallActivites();
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

            case this.activityTypes.Task: {
                this.getAllTaskActivites();
                break
            }

            case this.activityTypes.SMS: {
                this.getAllSMSActivites();
                break
            }
            case this.activityTypes.Achievements: {
                this.getAllAchievementActivites();
                break
            }

            case this.activityTypes.AppNotification: {
                this.getAllAppNotificationActivites();
                break
            }

            default: {
                this.getAllActivites();
            }
        }
    }

    viewTaskActivity(activityID: number) {
        this.getViewTaskById(activityID).subscribe(
            (data: any) => {
                this.activityTask = data.Result;
                this.activityTask.FollowUpDate = this._dateFilter.transform(data.Result.FollowUpDate, Configurations.DateFormat);
                this.openDialogForTaskView();
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Activity")) }
        )
    }

    editTaskActivity(activityID: number) {
        this.getTaskById(activityID).subscribe(
            (data: any) => {
                this.openDialogForTaskEdit(data.Result);
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Task")) }
        )
    }

    editAchievementActivity(activityID: number) {
        this.getactivityById(activityID,this.activityType.Achievement).subscribe(
            (data: any) => {
                this.openDialogForAchievementEdit(data.Result);
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Task")) }
        )
    }

    editCallActivity(activityID: number, ActivitySubTypeID: number) {
        this.getCallLaterById(activityID, ActivitySubTypeID).subscribe(
            (data: any) => {
                if (ENU_ActivitySubType.Now === ActivitySubTypeID) {
                    this.openDialogForCallNowEdit(data.Result);
                } else {
                    this.openDialogForCallEdit(data.Result);
                }

            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")) }
        )
    }

    editNoteActivity(activityID: number) {
        this.getactivityById(activityID,this.activityType.Note)
            .subscribe(
                (data: any) => {
                    this.openDialogForNoteEdit(data.Result);
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")) }
            )
    }

    editAppointmentActivity(activityID: number, ActivitySubTypeID: number) {
        this.getAppointmentLaterById(activityID, ActivitySubTypeID).subscribe(
            (data: any) => {
                if(ActivitySubTypeID === ENU_ActivitySubType.Now){
                    this.openDialogForAppointmentNowEdit(data.Result);
                }else{
                    this.openDialogForAppointmentEdit(data.Result);
                }
                
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Appointment")) }
        )
    }

    taskMarkAsDone(activityID: number) {
        if (this.tabsOptions && this.tabsOptions.apiUrls && this.tabsOptions.ownerId) {
            this.getViewTaskById(activityID).subscribe((data: any) => {
                const markAsDoneDialogRef = this._markAsDoneDialog.open(CompleteTaskComponent, {
                    disableClose: true,
                    data: {
                        activityId: activityID,
                        apiUrls: this.tabsOptions.apiUrls,
                        ownerId: this.tabsOptions.ownerId,
                        module: this.tabsOptions.module,
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
    }

    appointmentMarkAsDone(activityID: number) {
        if (this.tabsOptions && this.tabsOptions.apiUrls && this.tabsOptions.ownerId) {
            this.getAppointmentLaterById(activityID,ENU_ActivitySubType.Scheduled).subscribe(
                (data: any) => {
                    this.openDialogForAppointmentMarkAsDone(data.Result);
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Appointment")); }
            );
        }
    }

    callMarkAsDone(activityID: number) {
        if (this.tabsOptions && this.tabsOptions.apiUrls && this.tabsOptions.ownerId) {
            this.getCallLaterById(activityID, ENU_ActivitySubType.Scheduled).subscribe(
                (data: any) => {
                    this.openDialogForCallMarkAsDone(data.Result);
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")); }
            );
        }
    }

    getTaskById(activityID: number) {
        let url = this.tabsOptions.apiUrls.getTaskById.replace("{ownerID}", this.tabsOptions.ownerId.toString())
            .replace("{activityID}", activityID.toString());

        return this._activityService.get(url);
    }

    getAchievementById(activityID: number) {
        let url = LeadActivityApi.getAchievementById.replace("{customerActivityID}", activityID.toString())
            .replace("{customerID}", this.tabsOptions.ownerId.toString());

        return this._activityService.get(url);
    }

    getactivityById(activityID: number, activityTab: any) {
        let url = "";
        if (activityTab === this.activityType.Achievement) {
            url = LeadActivityApi.getAchievementById.replace("{customerActivityID}", activityID.toString())
            .replace("{customerID}", this.tabsOptions.ownerId.toString());
        } else {
            url = LeadActivityApi.getNoteActivityById.replace("{customerActivityID}", activityID.toString())
                .replace("{customerID}", this.tabsOptions.ownerId.toString());
        }
        return this._activityService.get(url);
    }



    getViewTaskById(activityID: number) {
        let url = this.tabsOptions.apiUrls.getViewTaskById.replace("{staffID}", this.tabsOptions.ownerId.toString())
            .replace("{staffActivityId}", activityID.toString());

        return this._activityService.get(url);
    }

    getAppNotificationById(activityID: number) {
        let url = this.tabsOptions.apiUrls.getAppNotificationById.replace("{activityID}", activityID.toString())
            .replace("{ownerID}", this.tabsOptions.ownerId.toString());

        return this._activityService.get(url);
    }

    getAppointmentLaterById(activityID: number, ActivitySubTypeID: number) {
        let url = "";
        if (ActivitySubTypeID == ENU_ActivitySubType.Now) {
            url = this.tabsOptions.apiUrls.getAppointmentNowById.replace("{customerActivityID}", activityID.toString())
                .replace("{customerID}", this.tabsOptions.ownerId.toString());
        } else {
            url = this.tabsOptions.apiUrls.getAppointmentLaterById.replace("{ownerID}", this.tabsOptions.ownerId.toString())
                .replace("{activityID}", activityID.toString());
        }

        return this._activityService.get(url);
    }

    // getactivityById(activityID: number, activityTab: any) {
    //     let url = "";
    //     if (activityTab === this.activityType.Achievement) {
    //         url = ClientActivityApi.getAchievementById.replace("{customerID}", this.clientID.toString())
    //             .replace("{customerActivityID}", activityID.toString());
    //     } else {
    //         url = ClientActivityApi.getNoteById.replace("{clientID}", this.clientID.toString())
    //             .replace("{clientActivityID}", activityID.toString());
    //     }
    //     return this._httpService.get(url);
    // }

    getCallLaterById(activityID: number, ActivitySubTypeID) {
        let url = "";
        if (ActivitySubTypeID == ENU_ActivitySubType.Now) {
            url = this.tabsOptions.apiUrls.getCallNowById.replace("{customerActivityID}", activityID.toString())
                .replace("{customerID}", this.tabsOptions.ownerId.toString());
        } else {
            url = this.tabsOptions.apiUrls.getCallLaterById.replace("{ownerID}", this.tabsOptions.ownerId.toString())
                .replace("{activityID}", activityID.toString());
        }
        return this._activityService.get(url);
    }

    openAddActivityDialog(tabsModel: any) {
        const addDialogRef = this._saveActivityDialog.open(SaveActivityComponent, {
            disableClose: true,
            data: tabsModel
        })

        addDialogRef.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
                this._dataSharingService.shareUpdateActivityCount(true);
            }
        })

        addDialogRef.componentInstance.openAddAppointment.subscribe((openAddAppointment: boolean) => {
            if (openAddAppointment) {
                this.openFollowupAppointmentActivity();
            }
        });

        addDialogRef.componentInstance.openAddCall.subscribe((openAddCall: boolean) => {
            if (openAddCall) {
                this.openFollowupCallActivity();
            }
        });
    }

    openDialogForTaskView() {
        this._viewActivityDialog.open(
            ViewActivityComponent,
            {
                disableClose: true,
                data: this.activityTask
            }
        )
    }

    openDialogForTaskEdit(taskModel: any) {
        const editActivityDialog = this._saveActivityDialog.open(
            SaveActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: {
                    activityRefrences: { Task: taskModel },
                    apiUrls: { saveTask: this.tabsOptions.apiUrls.saveTask, getTaskFundamentals: this.tabsOptions.apiUrls.getTaskFundamentals },
                    ownerId: this.tabsOptions.ownerId,
                    module: this.tabsOptions.module,
                    activeTabs: [this.activityTypes.Task]
                }
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }


    openDialogForAchievementEdit(taskModel: any) {
        const editActivityDialog = this._saveActivityDialog.open(
            SaveActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: {
                    activityRefrences: { Achievements: taskModel },
                    apiUrls: { saveAchievement: this.tabsOptions.apiUrls.saveAchievement, getTaskFundamentals: this.tabsOptions.apiUrls.getTaskFundamentals },
                    ownerId: this.tabsOptions.ownerId,
                    module: this.tabsOptions.module,
                    activeTabs: [this.activityTypes.Achievements]
                }
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForAppointmentEdit(appointmentModel: any) {
        const editActivityDialog = this._saveActivityDialog.open(
            SaveActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: {
                    isEditMode: true,
                    activityRefrences: { AppointmentLater: appointmentModel },
                    apiUrls: {
                        saveAppointmentLater: this.tabsOptions.apiUrls.saveAppointmentLater,
                        getAppointmentFundamentals: this.tabsOptions.apiUrls.getAppointmentFundamentals
                    },
                    ownerId: this.tabsOptions.ownerId,
                    module: this.tabsOptions.module,
                    activeTabs: [this.activityTypes.Appointment]
                }
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }


    openDialogForNoteEdit(NoteModel: any) {
        const editActivityDialog = this._saveActivityDialog.open(
            SaveActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: {
                    isEditMode: true,
                    activityRefrences: { Note: NoteModel },
                    apiUrls: {
                        saveNote: this.tabsOptions.apiUrls.saveNote
                    },
                    ownerId: this.tabsOptions.ownerId,
                    module: this.tabsOptions.module,
                    activeTabs: [this.activityTypes.Note]
                }
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }


    openDialogForAppointmentNowEdit(appointmentModel: any) {
        const editActivityDialog = this._saveActivityDialog.open(
            SaveActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: {
                    isEditMode: true,
                    activityRefrences: { AppointmentLater: appointmentModel },
                    apiUrls: {
                        saveAppointmentNow: this.tabsOptions.apiUrls.saveAppointmentNow,
                        getAppointmentFundamentals: this.tabsOptions.apiUrls.getAppointmentFundamentals
                    },
                    ownerId: this.tabsOptions.ownerId,
                    module: this.tabsOptions.module,
                    activeTabs: [this.activityTypes.Appointment]
                }
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForAppointmentMarkAsDone(appintmentModel: any) {
        //appintmentModel.FollowUpDate = new Date(appintmentModel.FollowUpDate);
        const editActivityDialog = this._saveActivityDialog.open(
            SaveActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: {
                    activityRefrences: {
                        AppointmentLater: appintmentModel,
                        AppointmentNow: this.tabsOptions.activityRefrences.AppointmentNow,
                        AppointmentMarkAsDone: this.tabsOptions.activityRefrences.AppointmentMarkAsDone
                    },
                    apiUrls: {
                        saveAppointmentMarkAsDone: this.tabsOptions.apiUrls.saveAppointmentMarkAsDone,
                        getAppointmentFundamentals: this.tabsOptions.apiUrls.getAppointmentFundamentals
                    },
                    ownerId: this.tabsOptions.ownerId,
                    module: this.tabsOptions.module,
                    permissions: this.tabsOptions.permissions,
                    isMarkAsDone: true,
                    isEditMode: true,
                    activeTabs: [this.activityTypes.Appointment]
                }
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForCallEdit(callModel: any) {
        const editActivityDialog = this._saveActivityDialog.open(
            SaveActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: {
                    isEditMode: true,
                    activityRefrences: { CallLater: callModel },
                    apiUrls: { saveCallLater: this.tabsOptions.apiUrls.saveCallLater, getCallFundamentals: this.tabsOptions.apiUrls.getCallFundamentals },
                    ownerId: this.tabsOptions.ownerId,
                    module: this.tabsOptions.module,
                    activeTabs: [this.activityTypes.Call]
                }
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForCallNowEdit(callModel: any) {
        const editActivityDialog = this._saveActivityDialog.open(
            SaveActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: {
                    isEditMode: true,
                    activityRefrences: { CallLater: callModel },
                    apiUrls: { saveCallNow: this.tabsOptions.apiUrls.saveCallNow, getCallFundamentals: this.tabsOptions.apiUrls.getCallFundamentals },
                    ownerId: this.tabsOptions.ownerId,
                    module: this.tabsOptions.module,
                    activeTabs: [this.activityTypes.Call]
                }
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForCallMarkAsDone(callModel: any) {
        //callModel.FollowUpDate = new Date(callModel.FollowUpDate);
        const editActivityDialog = this._saveActivityDialog.open(
            SaveActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: {
                    activityRefrences: {
                        CallLater: callModel,
                        CallNow: this.tabsOptions.activityRefrences.CallNow,
                        CallMarkAsDone: this.tabsOptions.activityRefrences.CallMarkAsDone
                    },
                    apiUrls: {
                        saveCallMarkAsDone: this.tabsOptions.apiUrls.saveCallMarkAsDone,
                        getCallFundamentals: this.tabsOptions.apiUrls.getCallFundamentals
                    },
                    ownerId: this.tabsOptions.ownerId,
                    module: this.tabsOptions.module,
                    permissions: this.tabsOptions.permissions,
                    isMarkAsDone: true,
                    isEditMode: true,
                    activeTabs: [this.activityTypes.Call]
                }
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });

        editActivityDialog.componentInstance.openAddCall.subscribe((openAddCall: boolean) => {
            if (openAddCall) {
                this.openFollowupCallActivity();
            }
        });

        editActivityDialog.componentInstance.openAddAppointment.subscribe((openAddAppointment: boolean) => {
            if (openAddAppointment) {
                this.openFollowupAppointmentActivity();
            }
        });
    }

    openFollowupAppointmentActivity() {
        let tabOptions = Object.assign({}, this.tabsOptions)
        tabOptions.isEditMode = true;
        tabOptions.activeTabs = [this.activityTypes.FollowupAppointment];
        this.openAddActivityDialog(tabOptions);
    }

    openFollowupCallActivity() {
        let tabOptions = Object.assign({}, this.tabsOptions)
        tabOptions.activeTabs = [this.activityTypes.FollowupCall];
        tabOptions.isEditMode = true;
        this.openAddActivityDialog(tabOptions);
    }

    deleteActivity(activityID: number, activityTypeID: number) {
        let url = this.tabsOptions.apiUrls.delete.replace("{customerID}", this.tabsOptions.ownerId.toString())
            .replace("{customerActivityID}", activityID.toString())
            .replace("{activityTypeID}", activityTypeID.toString());
        this._activityService.delete(url)
            .subscribe(res => {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Activity"));
                this.getDataByActiveTab(this.activeTab);
                this._dataSharingService.shareUpdateActivityCount(true);
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Activity")); }
            );
    }

    // #endregion
}
