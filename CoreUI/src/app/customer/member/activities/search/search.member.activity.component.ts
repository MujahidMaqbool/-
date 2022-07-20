/********************** Angular References *********************/
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { SubscriptionLike as ISubscription } from "rxjs";

/********************** Material References *********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** Services & Models *********************/
/* Models */
import { MemberActivity, MemberActivityTabOptions, MemberActivityCount, MemberActivityInfo } from 'src/app/customer/member/models/member.activity.model';
import { ActivityPersonInfo } from 'src/app/models/activity.model';

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MessageService } from 'src/app/services/app.message.service';

/********************** Common & Customs *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';

/********************** Components *********************/
import { SaveMemberActivityComponent } from 'src/app/customer/member/activities/save/save.member.activity.component';

/********************** Configurations *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { MemberActivityApi } from 'src/app/helper/config/app.webapi';
import { environment } from 'src/environments/environment';
import { PersonInfo } from 'src/app/models/common.model';
import { ENU_ActivityType, CustomerType, ENU_DateFormatName, ENU_ActivitySubType } from 'src/app/helper/config/app.enums';
import { ImagesPlaceholder } from 'src/app/helper/config/app.placeholder';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from 'src/app/helper/config/app.module.page.enums';
import { AuthService } from 'src/app/helper/app.auth.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { TimeFormatPipe } from 'src/app/application-pipes/time-format.pipe';


@Component({
    selector: 'search-member-activity',
    templateUrl: './search.member.activity.component.html',
})

export class SearchMemberActivityComponent extends AbstractGenericComponent implements OnInit, AfterViewInit, OnDestroy {

    // #region Local Members

    @ViewChild(MatPaginator) paginator: MatPaginator;
    memberID: number = 0;
    selectedTabIndex: number = 0;
    isDataExists: boolean = false;
    shouldGetPersonInfo: boolean = false;
    previousPageSize = 0;
    dateFormat: string = "";//Configurations.DateFormat;
    //longDateFormat: string = "";

    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    successMessage: string;
    errorMessage: string;

    /*********** Collection Types **********/
    allActivities: MemberActivity[] = [];
    activityTypeCountList: any[];

    /************ Model References******/
    memberActivityModel = new MemberActivity();
    memberActivityTabOptions: MemberActivityTabOptions;
    activityCount: MemberActivityCount;
    memberInfo: MemberActivityInfo;
    personInfo: PersonInfo;
    memberIDSubscription: ISubscription;
    activityCountSubscription: ISubscription;

    /*********** Configurations **********/
    activityTypes = Configurations.ActivityTypes;
    activityType = ENU_ActivityType;
    activeTab = Configurations.ActivityTypes.All;

    /*********** Pagination **********/
    defaultPageSize: number = Configurations.DefaultPageSize;
    pageSizeOptions = Configurations.PageSizeOptions;
    pageNumber: number = 1;
    /* Calculates No. of Records shown on current page (0 means records for first page) */
    pageIndex: number = 0;
    totalRecords: number = 0;

    allowedPages = {
        Search_Member: false,
        Save: false
    };

    // #endregion

    constructor(
        private _dataSharingService: DataSharingService,
        private _activityService: HttpService,
        private _dialog: MatDialogService,
        private _messageService: MessageService,
        private _authService: AuthService,
        private _TimeFormatPipe: TimeFormatPipe,
    ) { super(); }

    ngOnInit() {
        this.setPermissions();
        this.getBranchDatePattern();
        //this.activityCount = new MemberActivityCount();
        this.memberInfo = new MemberActivityInfo();

        // this.activityCountSubscription = this._dataSharingService.updateActivityCount.subscribe((isUpdateRequired: boolean) => {
        //     if (isUpdateRequired) {
        //         this.getActivityCount();
        //     }
        // });
    }

    ngAfterViewInit() {
        this.paginator.pageSize = this.defaultPageSize;
        this.previousPageSize = this.defaultPageSize;

        this.memberIDSubscription = this._dataSharingService.memberID.subscribe((memberId: number) => {
            this.memberID = memberId;
            this.getAllActivites();
            //this.getActivityCount();
            //set PersonID and PersonTypeID for personInfo
            // this.personInfo = new PersonInfo();
            // this.personInfo.PersonID = this.memberID;
            // this.personInfo.PersonTypeID = CustomerType.Member;
            this.shouldGetPersonInfo = true;
            //  this.getMemberInfo();
        });

        // this.activityCountSubscription = this._dataSharingService.updateActivityCount.subscribe((isUpdateRequired: boolean) => {
        //     if (isUpdateRequired) {
        //         this.getActivityCount();
        //     }
        // });
    }

    ngOnDestroy() {
        this.memberIDSubscription.unsubscribe();
        //this.activityCountSubscription.unsubscribe();
    }

    // #region Events
    onAddActivity() {
        if (this.memberID > 0) {
            this.openNewMemberActivity();
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
        }
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

    onEditActivity(CustomerActivityID: number, activityTypeID: number, ActivitySubTypeID: number) {
        switch (activityTypeID) {
            case (this.activityType.Appointment): {
                this.editAppointmentActivity(CustomerActivityID, ActivitySubTypeID);
                break
            }

            case (this.activityType.Call): {
                this.editCallActivity(CustomerActivityID, ActivitySubTypeID);
                break
            }
            case (this.activityType.Note): {
                this.editNoteActivity(CustomerActivityID, this.activityType.Note);
                break
            }
            case (this.activityType.MemberMessage): {
                this.editMemberMessageActivity(CustomerActivityID, this.activityType.MemberMessage);
                break
            }
            case (this.activityType.Achievement): {
                this.editAchievementActivity(CustomerActivityID, this.activityType.Achievement);
                break
            }
        }
    }

    // #endregion

    // #region Methods 

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.LongDateFormat);

    }

    setPermissions() {
        this.allowedPages.Search_Member = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.View);
        this.allowedPages.Save = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Activities_Save);
    }

    openNewMemberActivity() {
        const dialogRef = this._dialog.open(SaveMemberActivityComponent,
            {
                disableClose: true,
                data: {
                    isEditMode: false,
                    defaultActiveTab: this.activeTab,
                    activeTabs: [
                        this.activityTypes.Call,
                        this.activityTypes.Appointment,
                        this.activityTypes.Email,
                        this.activityTypes.Note,
                        this.activityTypes.SMS,
                        this.activityTypes.MemberMessage,
                        this.activityTypes.Achievements,
                        this.activityTypes.AppNotification
                    ]
                }
            });

        dialogRef.componentInstance.activitySaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getDataByActiveTab(this.activeTab);
            }
        });

        dialogRef.componentInstance.openAddAppointment.subscribe((openAddAppointment: boolean) => {
            if (openAddAppointment) {
                this.openFollowupAppointmentActivity();
            }
        });

        dialogRef.componentInstance.openAddCall.subscribe((openAddCall: boolean) => {
            if (openAddCall) {
                this.openFollowupCallActivity();
            }
        });
    }

    openFollowupAppointmentActivity() {
        const dialogRef = this._dialog.open(SaveMemberActivityComponent,
            {
                disableClose: true,
                data: {
                    isEditMode: true,
                    activeTabs: [
                        this.activityTypes.FollowupAppointment
                    ]
                }
            });

        dialogRef.componentInstance.activitySaved.subscribe((isSaved: boolean) => {
            if (isSaved) this.getDataByActiveTab(this.activeTab);
        })
    }

    openFollowupCallActivity() {
        const dialogRef = this._dialog.open(SaveMemberActivityComponent,
            {
                disableClose: true,
                data: {
                    isEditMode: true,
                    activeTabs: [
                        this.activityTypes.FollowupCall
                    ]
                }
            });

        dialogRef.componentInstance.activitySaved.subscribe((isSaved: boolean) => {
            if (isSaved) this.getDataByActiveTab(this.activeTab);
        })
    }

    getMemberInfo() {

        this._activityService.get(MemberActivityApi.getMemberInfo + this.memberID.toString())
            .subscribe(
                data => {
                    if (data.Result) {
                        this.memberInfo = data.Result;

                        if (this.memberInfo.ImagePath && this.memberInfo.ImagePath.length > 0) {
                            this.memberInfo.ImagePath = environment.imageUrl + this.memberInfo.ImagePath;
                        }
                        else {
                            this.memberInfo.ImagePath = ImagesPlaceholder.user;
                        }

                        let personInfo = new ActivityPersonInfo();
                        personInfo.Name = this.memberInfo.FullName;
                        personInfo.Mobile = this.memberInfo.Mobile;
                        personInfo.Email = this.memberInfo.Email;
                        personInfo.Address = this.memberInfo.Address1;

                        this._dataSharingService.shareActivityPersonInfo(personInfo);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Member Info"))
                }
            );
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

    getAllAppNotificationActivites() {
        this.getActivitiesByTypeId(this.activityType.AppNotification);
    }

    getAllSMSActivites() {
        this.getActivitiesByTypeId(this.activityType.SMS);
    }

    getAllMemberMessageActivites() {
        this.getActivitiesByTypeId(this.activityType.MemberMessage);
    }

    getAllAchievementActivites() {
        this.getActivitiesByTypeId(this.activityType.Achievement);
    }

    getActivitiesByTypeId(activityTypeId: number) {
        if (this.memberID > 0) {
            let url = MemberActivityApi.getAll + "?customerID=" + this.memberID.toString() +
                "&activityTypeId=" + activityTypeId +
                "&pageNumber=" + this.pageNumber.toString() +
                "&pageSize=" + this.paginator.pageSize.toString();
            this.allActivities = [];
            this._activityService.get(url)
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
    //     let params = {
    //         customerID: this.memberID
    //     }
    //     if (MemberActivityApi && MemberActivityApi.getActivityCount && MemberActivityApi.getActivityCount.length > 0) {
    //         this._activityService.get(MemberActivityApi.getActivityCount, params)
    //             .subscribe(
    //                 data => {
    //                     if (data.Result) {
    //                         this.activityTypeCountList = data.Result;
    //                         this.setActivityCount();
    //                     }
    //                     else {
    //                         this.activityCount = new MemberActivityCount();
    //                     }
    //                 }
    //             );
    //     }
    // }

    // setActivityCount() {
    //     this.activityCount = new MemberActivityCount();
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

    //             case this.activityType.AppNotification: {
    //                 this.activityCount.AppNotificationCount = activityCount.ActivityTypeCount;
    //                 break;
    //             }

    //             case this.activityType.MemberMessage: {
    //                 this.activityCount.MemberMessageCount = activityCount.ActivityTypeCount;
    //                 break;
    //             }

    //             case this.activityType.Achievement: {
    //                 this.activityCount.MemberAchievementsCount = activityCount.ActivityTypeCount;
    //                 break;
    //             }
    //         }
    //     });
    // }

    setActivityIconVisibility(activitiesData: any) {
        let activityList: MemberActivity[];

        if (activitiesData && activitiesData.length > 0) {
            activityList = activitiesData;

            activityList.forEach(activity => {
                activity.ShowEditIcon = (activity.ActivityTypeID === this.activityType.Appointment) ||
                    (activity.ActivityTypeID === this.activityType.Call) ||
                    (activity.ActivityTypeID === this.activityType.Note) ||
                    (activity.ActivityTypeID === this.activityType.Achievement) ||
                    (activity.ActivityTypeID === this.activityType.MemberMessage) ||
                    (activity.ActivityTypeID === this.activityType.Task && !activity.MarkedAsDone);
                activity.ShowMarkAsDoneIcon = !activity.MarkedAsDone;
                //activity.ShowViewIcon = (activity.ActivityTypeID === this.activityType.Task);
                activity.ShowDeleteIcon = (activity.ActivityTypeID === this.activityType.Appointment) ||
                    (activity.ActivityTypeID === this.activityType.Call) ||
                    (activity.ActivityTypeID === this.activityType.Note) ||
                    (activity.ActivityTypeID === this.activityType.MemberMessage) ||
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
            //     activity.ShowEditIcon = (activity.ActivityTypeID === this.activityType.Appointment && !activity.MarkedAsDone) ||
            //         (activity.ActivityTypeID === this.activityType.Call && !activity.MarkedAsDone) ||
            //         (activity.ActivityTypeID === this.activityType.Note) ||
            //         (activity.ActivityTypeID === this.activityType.Achievement);
            //     activity.ShowMarkAsDoneIcon = !activity.MarkedAsDone;
            //     activity.ShowDeleteIcon = (activity.ActivityTypeID === this.activityType.Appointment&& !activity.MarkedAsDone) ||
            //         (activity.ActivityTypeID === this.activityType.Note) ||
            //         (activity.ActivityTypeID === this.activityType.Achievement) ||
            //         (activity.ActivityTypeID === this.activityType.Call && !activity.MarkedAsDone);
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

            case this.activityTypes.SMS: {
                this.getAllSMSActivites();
                break
            }

            case this.activityTypes.MemberMessage: {
                this.getAllMemberMessageActivites();
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

    editCallActivity(activityID: number, ActivitySubTypeID: number) {
        this.getCallLaterById(activityID, ActivitySubTypeID).subscribe(
            (data: any) => {
                this.openDialogForCallEdit(data.Result);
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")) }
        )
    }

    editNoteActivity(activityID: number, activityTab: any) {
        this.getactivityById(activityID, activityTab)
            .subscribe(
                (data: any) => {
                    this.openDialogForNoteEdit(data.Result);
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Note")) }
            )
    }

    editAchievementActivity(activityID: number, activityTab) {
        this.getactivityById(activityID, activityTab)
            .subscribe(
                (data: any) => {
                    this.openDialogForAchievementEdit(data.Result);
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Achievement")) }
            )
    }

    editMemberMessageActivity(activityID: number, activityTab) {
        this.getactivityById(activityID, activityTab)
            .subscribe(
                (data: any) => {
                    this.openDialogFormemberMessageEdit(data.Result);
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Member message")) }
            )
    }

    editAppointmentActivity(activityID: number, ActivitySubTypeID: number) {
        this.getAppointmentLaterById(activityID, ActivitySubTypeID).subscribe(
            (data: any) => {
                this.openDialogForAppointmentEdit(data.Result);
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Appointment")) }
        )
    }

    appointmentMarkAsDone(activityID: number) {
        this.getAppointmentLaterById(activityID, ENU_ActivitySubType.Scheduled).subscribe(
            (data: any) => {
                if (data && data.Result) {
                    this.openDialogForAppointmentMarkAsDone(data.Result);
                }
                else {
                    this._messageService.showErrorMessage(data.MessageText)
                }
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Appointment")); }
        );
    }

    callMarkAsDone(activityID: number) {
        this.getCallLaterById(activityID,ENU_ActivitySubType.Scheduled).subscribe(
            (data: any) => {
                if (data && data.Result) {
                    this.openDialogForCallMarkAsDone(data.Result);
                }
                else {
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")); }
        );
    }

    getAppNotificationById(activityID: number) {
        let url = MemberActivityApi.getAppNotificationById.replace("{memberActivityID}", activityID.toString())
            .replace("{memberID}", this.memberID.toString());

        return this._activityService.get(url);
    }

    getAppointmentLaterById(activityID: number, ActivitySubTypeID: number) {

        let url = "";
        if (ActivitySubTypeID == ENU_ActivitySubType.Now) {
            url = MemberActivityApi.getAppointmentNowById.replace("{memberID}", this.memberID.toString())
                .replace("{memberActivityID}", activityID.toString());
        } else {
            url = MemberActivityApi.getAppointmentLaterById.replace("{memberID}", this.memberID.toString())
                .replace("{memberActivityID}", activityID.toString());
        }
        return this._activityService.get(url);
    }

    getCallLaterById(activityID: number, ActivitySubTypeID: number) {

        let url = "";
        if (ActivitySubTypeID == ENU_ActivitySubType.Now) {
            url = MemberActivityApi.getCallNowById.replace("{memberID}", this.memberID.toString())
                .replace("{memberActivityID}", activityID.toString());
        } else {
            url = MemberActivityApi.getCallLaterById.replace("{memberID}", this.memberID.toString())
            .replace("{memberActivityID}", activityID.toString());
        }
        return this._activityService.get(url);
    }

    getactivityById(activityID: number, activityTab: any) {
        let url = "";
        if (activityTab === this.activityType.Achievement) {
            url = MemberActivityApi.getAchievementById.replace("{customerID}", this.memberID.toString())
                .replace("{customerActivityID}", activityID.toString());
        } else if (activityTab === this.activityType.Note) {
            url = MemberActivityApi.getNotetById.replace("{customerID}", this.memberID.toString())
                .replace("{customerActivityID}", activityID.toString());
        } else if (activityTab === this.activityType.MemberMessage) {
            url = MemberActivityApi.getMemberMessageById.replace("{customerID}", this.memberID.toString())
                .replace("{customerActivityID}", activityID.toString());
        }

        return this._activityService.get(url);
    }

    openDialogForAppointmentEdit(appointmentModel: any) {
        this.setActivityEditModeOptions(this.activityTypes.Appointment, appointmentModel);
        const editActivityDialog = this._dialog.open(
            SaveMemberActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.memberActivityTabOptions
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForCallEdit(callModel: any) {
        this.setActivityEditModeOptions(this.activityTypes.Call, callModel);
        const editActivityDialog = this._dialog.open(
            SaveMemberActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.memberActivityTabOptions
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForNoteEdit(callModel: any) {
        this.setActivityEditModeOptions(this.activityTypes.Note, callModel);
        const editActivityDialog = this._dialog.open(
            SaveMemberActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.memberActivityTabOptions
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForAchievementEdit(callModel: any) {
        this.setActivityEditModeOptions(this.activityTypes.Achievements, callModel);
        const editActivityDialog = this._dialog.open(
            SaveMemberActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.memberActivityTabOptions
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogFormemberMessageEdit(callModel: any) {
        this.setActivityEditModeOptions(this.activityTypes.MemberMessage, callModel);
        const editActivityDialog = this._dialog.open(
            SaveMemberActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.memberActivityTabOptions
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForAppointmentMarkAsDone(appintmentModel: any) {
        appintmentModel.FollowupDate = new Date();
        this.setActivityEditModeOptions(this.activityTypes.Appointment, appintmentModel, true);
        const editActivityDialog = this._dialog.open(
            SaveMemberActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.memberActivityTabOptions
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });

        editActivityDialog.componentInstance.openAddAppointment.subscribe((openAddAppointment: boolean) => {
            if (openAddAppointment) {
                this.openFollowupAppointmentActivity();
            }
        });

        editActivityDialog.componentInstance.openAddCall.subscribe((openAddCall: boolean) => {
            if (openAddCall) {
                this.openFollowupCallActivity();
            }
        });
    }

    openDialogForCallMarkAsDone(callModel: any) {
        callModel.FollowupDate = new Date();
        this.setActivityEditModeOptions(this.activityTypes.Call, callModel, true);
        const editActivityDialog = this._dialog.open(
            SaveMemberActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.memberActivityTabOptions
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });

        editActivityDialog.componentInstance.openAddAppointment.subscribe((openAddAppointment: boolean) => {
            if (openAddAppointment) {
                this.openFollowupAppointmentActivity();
            }
        });

        editActivityDialog.componentInstance.openAddCall.subscribe((openAddCall: boolean) => {
            if (openAddCall) {
                this.openFollowupCallActivity();
            }
        });
    }

    openNewAppointmentActivity() {
        const dialogRef = this._dialog.open(SaveMemberActivityComponent,
            {
                disableClose: true,
                data: {
                    isEditMode: false,
                    activeTabs: [
                        this.activityTypes.Appointment
                    ]
                }
            });

        dialogRef.componentInstance.activitySaved.subscribe((isSaved: boolean) => {
            this.getDataByActiveTab(this.activeTab);
        })
    }

    setActivityEditModeOptions(activeTab: string, modelData: any, isMarkAsDone?: boolean) {
        this.memberActivityTabOptions = new MemberActivityTabOptions();

        this.memberActivityTabOptions.isEditMode = true;
        this.memberActivityTabOptions.activeTabs = [activeTab];
        this.memberActivityTabOptions.modelData = modelData;

        if (isMarkAsDone) {
            this.memberActivityTabOptions.isMarkAsDone = isMarkAsDone;
        }

    }

    deleteActivity(activityID: number, activityTypeID: number) {
        let url = MemberActivityApi.delete.replace("{memberID}", this.memberID.toString())
            .replace("{activityID}", activityID.toString())
            .replace("{activityTypeID}", activityTypeID.toString());
        this._activityService.delete(url)
            .subscribe(res => {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Activity"));
                this.getDataByActiveTab(this.activeTab);
                //this._dataSharingService.shareUpdateActivityCount(true);
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Activity")); }
            )
    }

    // #endregion

}
