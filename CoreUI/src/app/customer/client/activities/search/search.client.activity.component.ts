// #region References

/********************** Angular References *********************/
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { Router } from '@angular/router';
/********************** Material References *********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** Services & Models *********************/
/* Models */
import { ClientActivity, ClientActivityTabOptions, ClientActivityCount, ClientActivityInfo } from '@customer/client/models/client.activity.model';
import { ActivityPersonInfo } from '@models/activity.model';
import { PersonInfo, ApiResponse } from '@models/common.model';
/* Services */
import { HttpService } from '@services/app.http.service';
import { DataSharingService } from '@services/data.sharing.service';
import { AuthService } from '@app/helper/app.auth.service';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';

/********************** Common & Customs *********************/
import { Configurations } from '@helper/config/app.config';
import { ClientActivityApi, CustomerApi } from '@helper/config/app.webapi';
import { Messages } from '@helper/config/app.messages';
import { environment } from '@env/environment';
import { ENU_ActivityType, CustomerType, ENU_DateFormatName, ENU_ActivitySubType } from '@helper/config/app.enums';

/********************** Components *********************/
import { SaveClientActivityComponent } from '@customer/client/activities/save/save.client.activity.component';
import { AddLeadMembershipComponent } from '@app/customer-shared-module/add-lead-membership/add.lead.membership.component';
import { SaveMemberMembershipPopup } from '@app/customer-shared-module/add-member-membership/save-membership-popup/save.member.membership.popup';
import { ImagesPlaceholder } from '@app/helper/config/app.placeholder';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from '@app/helper/config/app.module.page.enums';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { CommonService } from '@app/services/common.service';
import { MissingBillingAddressDialog } from '@app/customer-shared-module/missing-billing-address/missing.billing.address.dialog';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { MessageService } from '@app/services/app.message.service';
import { TimeFormatPipe } from '@app/application-pipes/time-format.pipe';

// import { ViewMemberActivityComponent } from '../view/view.activity.component';

// #endregion

@Component({
    selector: 'search-client-activity',
    templateUrl: './search.client.activity.component.html',
})

export class SearchClientActivityComponent extends AbstractGenericComponent implements OnInit, AfterViewInit, OnDestroy {

    // #region Local Members

    @ViewChild(MatPaginator) paginator: MatPaginator;

    clientID: number = 0;
    selectedTabIndex: number = 0;
    isDataExists: boolean = false;
    shouldGetPersonInfo: boolean = false;

    isSearchClientAllowed: boolean = false;
    isSaveActivityAllowed: boolean = false;
    isProceedToLeadAllowed: boolean = false;
    isProceedToMemberAllowed: boolean = false;

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
    personTypeInfo: PersonInfo;
    personInfo: ActivityPersonInfo;
    // activityTask: ViewMemberTask;
    clientActivityTabOptions: ClientActivityTabOptions;
    activityCount: ClientActivityCount;
    clientInfo: ClientActivityInfo;

    clientIDSubscription: ISubscription;
    activityCountSubscription: ISubscription;
    activityPersonInfoSubscription: ISubscription;

    /*********** Configurations **********/
    activityTypes = Configurations.ActivityTypes;
    activityType = ENU_ActivityType;
    dateFormat: string = ""; //Configurations.DateFormat;
    activeTab = Configurations.ActivityTypes.All;

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
        private _authService: AuthService,
        private _dataSharingService: DataSharingService,
        private _httpService: HttpService,
        private _dialog: MatDialogService,
        private _router: Router,
        private _messageService: MessageService,
        private _commonService: CommonService,
        private _TimeFormatPipe: TimeFormatPipe,
    ) { super(); }

    ngOnInit() {
        this.activityCount = new ClientActivityCount();
        this.clientInfo = new ClientActivityInfo();
    }

    ngAfterViewInit() {
        this.getBranchDatePattern();
    }

    ngOnDestroy() {
        this.clientIDSubscription.unsubscribe();
        this.activityCountSubscription.unsubscribe();
        this.activityPersonInfoSubscription.unsubscribe();
    }

    // #region Events

    onAddActivity() {
        if (this.clientID > 0) {
            this.openNewClientActivity();
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

    onViewTaskActivity(activityID: number) {
        // this.viewTaskActivity(activityID);
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
                this.editAppointmentActivity(activityID,ActivitySubTypeID);
                break
            }
            case (this.activityType.Call): {
                this.editCallActivity(activityID, ActivitySubTypeID);
                break
            }
            case (this.activityType.Note): {
                this.editNoteActivity(activityID, this.activityType.Note);
                break
            }
            case (this.activityType.Achievement): {
                this.editAchievementActivity(activityID, this.activityType.Achievement);
                break
            }
        }
    }

    onProceedToLead() {
        const dialogref = this._dialog.open(AddLeadMembershipComponent,
            {
                disableClose: true,
                data: {
                    CustomerID: this.clientID,
                    CustomerTypeID: CustomerType.Client,
                    IsMemberToLead: false
                }
            });

        dialogref.componentInstance.isLeadMembershipSaved.subscribe((res: any) => {
            if (res.isSaved) {
                this._router.navigate(['/lead/details/' + this.clientID]);
            }
        });
    }

    onProceedToMember() {
        this.checkBillingAddress();
    }

    // #endregion

    // #region Methods

    openNewClientActivity() {
        const dialogRef = this._dialog.open(SaveClientActivityComponent,
            {
                disableClose: true,
                data: {
                    isEditMode: false,
                    defaultActiveTab: this.activeTab,
                    activeTabs: [
                        this.activityTypes.Call,
                        this.activityTypes.Appointment,
                        this.activityTypes.Note,
                        this.activityTypes.Email,
                        this.activityTypes.SMS,
                        this.activityTypes.AppNotification,
                        this.activityTypes.Achievements
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

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.LongDateFormat);

        this.isSearchClientAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.View);
        this.isSaveActivityAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Activities_Save);
        this.isProceedToLeadAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.ProceedToLead);
        this.isProceedToMemberAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.ProceedToMember);

        this.paginator.pageSize = this.defaultPageSize;
        this.previousPageSize = this.defaultPageSize;

        this.clientIDSubscription = this._dataSharingService.clientID.subscribe((clientId: number) => {
            if (clientId && clientId > 0) {
                this.clientID = clientId;
                this.getAllActivites();
                //this.getActivityCount();
                //  this.getClientInfo();
                //set PersonID and PersonTypeID for personInfo
                this.personTypeInfo = new PersonInfo();
                this.personTypeInfo.PersonID = this.clientID;
                this.personTypeInfo.PersonTypeID = CustomerType.Client;
                this.shouldGetPersonInfo = true;
                this._dataSharingService.shareCustomerID(clientId);
                this._commonService.shareLeadInfo(this.personInfo);
            }
        });

        this.activityCountSubscription = this._dataSharingService.updateActivityCount.subscribe((isUpdateRequired: boolean) => {
            if (isUpdateRequired) {
                //this.getActivityCount();
            }
        });

        this.activityPersonInfoSubscription = this._dataSharingService.activityPersonInfo.subscribe((personInfo: ActivityPersonInfo) => {
            this.personInfo = personInfo;
        })

        this.activityCountSubscription = this._dataSharingService.updateActivityCount.subscribe((isUpdateRequired: boolean) => {
            if (isUpdateRequired) {
                //this.getActivityCount();
            }
        });
    }

    getClientInfo() {
        this._httpService.get(ClientActivityApi.getClientDetail + this.clientID.toString())
            .subscribe((res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.clientInfo = res.Result;

                        if (this.clientInfo.ImagePath && this.clientInfo.ImagePath.length > 0) {
                            this.clientInfo.ImagePath = environment.imageUrl + this.clientInfo.ImagePath;
                        }
                        else {
                            this.clientInfo.ImagePath = ImagesPlaceholder.user;
                        }

                        let personInfo = new ActivityPersonInfo();
                        personInfo.Name = this.clientInfo.FullName;
                        personInfo.Mobile = this.clientInfo.Mobile;
                        personInfo.Email = this.clientInfo.Email;
                        personInfo.Address = this.clientInfo.Address1;

                        this._dataSharingService.shareActivityPersonInfo(personInfo);
                    }else{
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Client Info"));
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

    getAllSMSActivites() {
        this.getActivitiesByTypeId(this.activityType.SMS);
    }

    getAllAppNotificationActivites() {
        this.getActivitiesByTypeId(this.activityType.AppNotification);
    }

    getAllAchievementActivites() {
        this.getActivitiesByTypeId(this.activityType.Achievement);
    }

    getActivitiesByTypeId(activityTypeId: number) {
        if (this.clientID > 0) {
            let params = {
                CustomerID: this.clientID.toString(),
                activityTypeId: activityTypeId,
                pageNumber: this.pageNumber.toString(),
                pageSize: this.paginator.pageSize.toString()
            }

            this.allActivities = [];
            this._httpService.get(ClientActivityApi.getAll, params)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this.isDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                        if (this.isDataExists) {
                            this.allActivities = this.setActivityIconVisibility(response.Result);
                            this.totalRecords = response.TotalRecord;
                            this.paginator.pageIndex = (this.pageNumber - 1);
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Activities")); }
                );
        }
    }

    getActivityCount() {
        let params = {
            CustomerID: this.clientID
        }
        this._httpService.get(ClientActivityApi.getActivityCount, params)
            .subscribe(
                data => {
                    if (data.Result) {
                        this.activityTypeCountList = data.Result;
                        this.setActivityCount();
                    }
                    else {
                        this.activityCount = new ClientActivityCount();
                    }
                }
            );
    }

    setActivityCount() {
        this.activityCount = new ClientActivityCount();
        this.activityTypeCountList.forEach((activityCount: any) => {
            switch (activityCount.ActivityTypeID) {
                case this.activityType.Appointment: {
                    this.activityCount.AppointmentCount = activityCount.ActivityTypeCount;
                    break;
                }

                case this.activityType.Call: {
                    this.activityCount.CallCount = activityCount.ActivityTypeCount;
                    break;
                }

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
                case this.activityType.AppNotification: {
                    this.activityCount.AppNotificationCount = activityCount.ActivityTypeCount;
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

            case this.activityTypes.Achievements: {
                this.getAllAchievementActivites();
                break;
            }

            case this.activityTypes.SMS: {
                this.getAllSMSActivites();
                break
            }

            case this.activityTypes.AppNotification: {
                this.getAllAppNotificationActivites();
                break
            }

            case this.activityTypes.Achievements: {
                break
            }

            default: {
                this.getAllActivites();
            }
        }
    }

    editCallActivity(activityID: number, ActivitySubTypeID: number) {
        this.getCallLaterById(activityID, ActivitySubTypeID)
            .subscribe(
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
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")) }
            )
    }

    editAchievementActivity(activityID: number, activityTab) {
        this.getactivityById(activityID, activityTab)
            .subscribe(
                (data: any) => {
                    this.openDialogForAchievementEdit(data.Result);
                },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")) }
            )
    }

    editAppointmentActivity(activityID: number,ActivitySubTypeID: number) {
        this.getAppointmentLaterById(activityID,ActivitySubTypeID).subscribe(
            (data: any) => {
                this.openDialogForAppointmentEdit(data.Result);
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Appointment")) }
        )
    }

    appointmentMarkAsDone(activityID: number) {
        this.getAppointmentLaterById(activityID,ENU_ActivitySubType.Scheduled).subscribe(
            (data: any) => {
                this.openDialogForAppointmentMarkAsDone(data.Result);
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Appointment")); }
        );
    }

    callMarkAsDone(activityID: number) {
        this.getCallLaterById(activityID, ENU_ActivitySubType.Scheduled).subscribe(
            (data: any) => {
                this.openDialogForCallMarkAsDone(data.Result);
            },
            error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call")); }
        );
    }

    getTaskForView(activityID: number) {
        // let url = ClientActivityApi.getTaskForView.replace("{clientActivityID}", activityID.toString())
        //     .replace("{clientID}", this.clientID.toString());

        // return this._httpService.get(url);
    }

    getAppNotificationById(activityID: number) {
        let url = ClientActivityApi.getAppNotificationById.replace("{clientActivityID}", activityID.toString())
            .replace("{clientID}", this.clientID.toString());

        return this._httpService.get(url);
    }

    getAppointmentLaterById(activityID: number,ActivitySubTypeID : number) {

        let url = "";
        if (ActivitySubTypeID == ENU_ActivitySubType.Now) {
            url = ClientActivityApi.getAppointmentNowById.replace("{clientID}", this.clientID.toString())
                .replace("{clientActivityID}", activityID.toString());
        } else {
            url = ClientActivityApi.getAppointmentLaterById.replace("{clientID}", this.clientID.toString())
                .replace("{clientActivityID}", activityID.toString());
        }
        return this._httpService.get(url);
    }

    getactivityById(activityID: number, activityTab: any) {
        let url = "";
        if (activityTab === this.activityType.Achievement) {
            url = ClientActivityApi.getAchievementById.replace("{customerID}", this.clientID.toString())
                .replace("{customerActivityID}", activityID.toString());
        } else {
            url = ClientActivityApi.getNoteById.replace("{clientID}", this.clientID.toString())
                .replace("{clientActivityID}", activityID.toString());
        }
        return this._httpService.get(url);
    }

    getCallLaterById(activityID: number, ActivitySubTypeID: number) {
        let url = "";
        if (ActivitySubTypeID == ENU_ActivitySubType.Now) {
            url = ClientActivityApi.getCallNowById.replace("{clientID}", this.clientID.toString())
                .replace("{clientActivityID}", activityID.toString());
        } else {
            url = ClientActivityApi.getCallLaterById.replace("{clientID}", this.clientID.toString())
                .replace("{clientActivityID}", activityID.toString());
        }
        return this._httpService.get(url);
    }

    openDialogForTaskView() {
        // this._viewActivityDialog.open(
        //     ViewClientActivityComponent,
        //     {
        //         disableClose: true,
        //         data: this.activityTask
        //     }
        // )
    }

    openDialogForAppointmentEdit(appointmentModel: any) {
        this.setActivityEditModeOptions(this.activityTypes.Appointment, appointmentModel);
        const editActivityDialog = this._dialog.open(
            SaveClientActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.clientActivityTabOptions
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForAppointmentMarkAsDone(appintmentModel: any) {
        //appintmentModel.FollowUpDate = new Date();
        this.setActivityEditModeOptions(this.activityTypes.Appointment, appintmentModel, true);
        const editActivityDialog = this._dialog.open(
            SaveClientActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.clientActivityTabOptions
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

    openDialogForNoteEdit(callModel: any) {
        this.setActivityEditModeOptions(this.activityTypes.Note, callModel);
        const editActivityDialog = this._dialog.open(
            SaveClientActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.clientActivityTabOptions
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
            SaveClientActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.clientActivityTabOptions
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
            SaveClientActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.clientActivityTabOptions
            }
        );

        editActivityDialog.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getDataByActiveTab(this.activeTab);
            }
        });
    }

    openDialogForCallMarkAsDone(callModel: any) {
        //callModel.FollowUpDate = new Date();
        this.setActivityEditModeOptions(this.activityTypes.Call, callModel, true);
        const editActivityDialog = this._dialog.open(
            SaveClientActivityComponent,
            {
                disableClose: true,
                /* Send Tabs Options*/
                data: this.clientActivityTabOptions
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

    openFollowupAppointmentActivity() {
        const dialogRef = this._dialog.open(SaveClientActivityComponent,
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
        const dialogRef = this._dialog.open(SaveClientActivityComponent,
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

    setActivityEditModeOptions(activeTab: string, modelData: any, isMarkAsDone?: boolean) {
        this.clientActivityTabOptions = new ClientActivityTabOptions();

        this.clientActivityTabOptions.isEditMode = true;
        this.clientActivityTabOptions.activeTabs = [activeTab];
        this.clientActivityTabOptions.modelData = modelData;

        if (isMarkAsDone) {
            this.clientActivityTabOptions.isMarkAsDone = isMarkAsDone;
        }
    }

    deleteActivity(activityID: number, activityTypeID: number) {
        let url = ClientActivityApi.delete.replace("{clientID}", this.clientID.toString())
            .replace("{activityID}", activityID.toString())
            .replace("{activityTypeID}", activityTypeID.toString());
        this._httpService.delete(url)
            .subscribe((res: ApiResponse) => {
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

    checkBillingAddress() {
        this._httpService.get(CustomerApi.checkBillingAndGateway + this.clientID).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result.HasBillingAddress) {
                        this.openLeadWon();
                    }
                    else {
                        this.showBillingAddressDialog()
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            }
        )
    }

    showBillingAddressDialog() {
        const dialog = this._dialog.open(MissingBillingAddressDialog, {
            disableClose: true,
            data: this.clientID
        });

        dialog.componentInstance.redirectUrl = "customer/client/details/" + this.clientID;
    }

    openLeadWon() {
        const dialogref = this._dialog.open(SaveMemberMembershipPopup,
            {
                disableClose: true,
                data: {
                    CustomerID: this.clientID,
                    CustomerTypeID: CustomerType.Client
                }
            });

        dialogref.componentInstance.membershipSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this._router.navigate(['customer/member/details/' + this.clientID]);
            }
        });
    }
    // #endregion

}