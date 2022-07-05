/********************** Angular References *********************/
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { SubscriptionLike as ISubscription } from "rxjs";

/********************** Services & Models *********************/
/* Models */
import {
    AppointmentNowActivity,
    AppointmentLaterActivity,
    CallNowActivity,
    CallLaterActivity,
    NoteActivity,
    EmailActivity,
    SMSActivity,
    AppointmentMarkAsDoneActivity,
    CallMarkAsDoneActivity,
    LeadAppNotification
} from '@lead/models/lead.activity.model'
import { ActivityTabsOptions } from '@models/activity.tab.options'
import { LeadAssignedTo, LeadLostReasonModel, LeadStatus } from '@lead/models/lead.model';
import { MemberRedirectInfo } from '@customer/member/models/members.model';
import { LeadMembershipsList } from '../../models/lead.membership.model';
import { PersonInfo, PersonDetail, ApiResponse } from '@app/models/common.model';

/* Services */
import { HttpService } from '@services/app.http.service';
import { DataSharingService } from '@services/data.sharing.service';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { MessageService } from "@services/app.message.service";
import { AuthService } from '@app/helper/app.auth.service';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
/********************** Application Component(s) *********************/
import { LeadLostComponent } from '@lead/lost-popup/lead.lost.popup.component';

/********************** Common & Customs *********************/
import { Configurations } from '@helper/config/app.config';
import { SearchActivityComponent } from '@shared/components/activities/search/search.activity.component'
import { Messages } from '@app/helper/config/app.messages';
import { LeadActivityApi, LeadMembershipApi, CustomerApi } from '@app/helper/config/app.webapi';
import { ENU_ActivityType, LeadStatusType, CustomerType } from '@app/helper/config/app.enums';
import { environment } from '@env/environment';
//import { SaveMemberMembershipPopup } from '@app/shared/components/add-member-membership/save-membership-popup/save.member.membership.popup';
import { ImagesPlaceholder } from '@app/helper/config/app.placeholder';
import { ENU_Permission_Module, ENU_Permission_Lead } from '@app/helper/config/app.module.page.enums';
import { variables } from '@app/helper/config/app.variable';
import { SaveMemberMembershipPopup } from '@app/customer-shared-module/add-member-membership/save-membership-popup/save.member.membership.popup';
import { MissingBillingAddressDialog } from '@app/customer-shared-module/missing-billing-address/missing.billing.address.dialog';
import { PersonInfoComponent } from '@app/customer-shared-module/person-info/person.info.component';

@Component({
    selector: 'lead-activity',
    templateUrl: './lead.activity.component.html'
})

export class LeadActivityComponent implements OnInit, OnDestroy {

    // #region Local Members 

    @ViewChild(SearchActivityComponent) private activityComponent: SearchActivityComponent;
    @ViewChild('personInfoRef') personInfoRef: PersonInfoComponent;

    /* Local Members */
    leadID: number = 0;
    deleteDialogRef: any;
    previousLeadStatusId: number;
    isLeadLocked: boolean = false;
    shouldGetPersonInfo: boolean = false;
    imagePath = ImagesPlaceholder.user;

    /* Collection Types */
    serverImageAddress = environment.imageUrl;

    /* Messages */
    hasMemberships: boolean = true;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;

    /* Model References */
    leadAssignedTo: LeadAssignedTo;
    leadLostReasonModel: LeadLostReasonModel;
    leadStatus: LeadStatus;
    memberRedirectInfo: MemberRedirectInfo;
    tabsOptions: ActivityTabsOptions = new ActivityTabsOptions();
    // personInfo: PersonInfo;
    leadActivity: PersonDetail = new PersonDetail();
    leadIdSubscription: ISubscription;

    /* Collection Types */

    leadStatusTypeList: any;
    staffList: any;
    existingMembershipList: LeadMembershipsList[] = [];

    /* Configurations */
    leadStatusType = LeadStatusType;
    activityTypes = Configurations.ActivityTypes;
    activityType = ENU_ActivityType;

    allowedPages = {
        Activities_Save: false,
        Lead_View: false,
        Lead_Save: false,
        Lead_ProceedToMember: false,
        BusinessFlow_Save: false,
        Membership_Save: false

    };

    // #endregion 

    constructor(private _router: Router,
        private _httpService: HttpService,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService,
        private _authService: AuthService,
        private _openDialog: MatDialogService) {

        this.leadAssignedTo = new LeadAssignedTo();
        this.leadStatus = new LeadStatus();
        this.setPermissions();

        this.leadIdSubscription = this._dataSharingService.leadID.subscribe((leadId: number) => {
            this.leadID = leadId;
            this.leadAssignedTo.CustomerID = this.leadID;
            this.leadStatus.CustomerID = this.leadID;
        });
    }

    // #region Events

    ngOnInit() {
        this.memberRedirectInfo = new MemberRedirectInfo();
        this.setPersonInfoDetail();
        this.leadActivityDetailFundamentals();
    }

    ngOnDestroy() {
        this.leadIdSubscription.unsubscribe();
    }

    onAddActivity() {
        this._dataSharingService.shareMembershipID(this.leadActivity.MembershipID);
        this._dataSharingService.shareCustomerID(this.leadID);
        this.activityComponent.onAddActivity();
    }

    onLeadAssingedToChange() {
        this.leadAssignedTo.MembershipID = this.leadActivity.MembershipID;
        this._httpService.save(LeadMembershipApi.saveAssignedToStatus, this.leadAssignedTo)
            .subscribe((res :ApiResponse) => {
                // Successs
                if (res && res.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Lead_Assignedto_Success.replace("{0}", "Lead assigned"));
                }
                else {
                    this._messageService.showSuccessMessage(res.MessageText);
                }
            },
                err => {  // Error or Failure 
                    this._messageService.showErrorMessage(this.messages.Error.Assigned_Error.replace("{0}", "Lead"));
                })
    }

    onLeadStatusChange() {
        if (this.leadActivity.LeadStatusTypeID == this.leadStatusType.Lost || this.leadActivity.LeadStatusTypeID == this.leadStatusType.Sale) {
            if (this.leadActivity.LeadStatusTypeID == this.leadStatusType.Lost) {
                this.openLeadLost();
            }
            else {
                this.leadStatus.LeadStatusTypeID = this.leadActivity.LeadStatusTypeID;
            }

            if (this.leadActivity.LeadStatusTypeID == this.leadStatusType.Sale) {
                if (this.allowedPages.Lead_ProceedToMember) {
                    // this.checkBillingAddress();(becoz now address are optional (Ahmed Arshad)17/05/2021)
                    this.openLeadWon();

                }
                else {
                    setTimeout(() => {
                        this.leadActivity.LeadStatusTypeID = this.previousLeadStatusId;
                    })
                    this._messageService.showErrorMessage(this.messages.Error.Permission_Page_UnAuthorized)
                }
            }
        }
        else {
            this.leadStatus.LeadStatusTypeID = this.leadActivity.LeadStatusTypeID;
            this.leadStatus.MembershipID = this.leadActivity.MembershipID;
            this._httpService.save(LeadMembershipApi.saveLeadStatus, this.leadStatus)
                .subscribe((res : ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Lead Status"));
                        this.previousLeadStatusId = this.leadActivity.LeadStatusTypeID;
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }

                },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Status"));
                    })
        }
    }

    onMembershipChange() {
        this.getLeadMembershipStatus();
    }

    // #endregion

    // #region Methods

    setPermissions() {
        this.allowedPages.Lead_Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Save);
        this.allowedPages.Lead_View = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.View);
        this.allowedPages.Activities_Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Activities_Save);
        this.allowedPages.BusinessFlow_Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.BusinessFlow_Save);
        this.allowedPages.Membership_Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Memberships_Save);
        this.allowedPages.Lead_ProceedToMember = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.ProceedToMember);
    }

    checkBillingAddress() {
        this._httpService.get(CustomerApi.checkBillingAndGateway + this.leadID).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    if (res.Result.HasBillingAddress) {
                        this.openLeadWon();
                    }
                    else {
                        this.showBillingAddressDialog();
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            }
        )
    }

    showBillingAddressDialog() {
        const dialog = this._openDialog.open(MissingBillingAddressDialog, {
            disableClose: true,
            data: this.leadID
        });

        dialog.componentInstance.redirectUrl = "/lead/details/" + this.leadID;

        dialog.componentInstance.onCancel.subscribe((isCancelled: boolean) => {
            if (isCancelled) {
                this.leadActivity.LeadStatusTypeID = this.previousLeadStatusId;
            }
        })
    }

    deleteLead() {
        this.deleteDialogRef = this._openDialog.open(DeleteConfirmationComponent, { disableClose: true ,
            data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}
        });
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(CustomerApi.deleteCustomer + "?CustomerID=" + this.leadID)
                    .subscribe((res:ApiResponse) => {
                        if (res && res.MessageCode > 0) {
                            this._router.navigate(['/lead']);
                            this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Lead"));
                        }
                        else if (res && res.MessageCode < 0) {
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Lead")); }
                    );
            }
        })
    }

    setMemberhsip() {
        this.leadActivity.MembershipID = this.existingMembershipList[0].MembershipID;
    }

    getLeadMembershipStatus() {
        let param = {
            CustomerId: this.leadID,
            MembershipId: this.leadActivity.MembershipID
        }
        this._httpService.get(LeadMembershipApi.getLeadMembershipStatus, param)
            .subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.leadActivity.LeadStatusTypeID = res.Result.LeadStatusTypeID;
                        this.leadAssignedTo.AssignedToStaffID = res.Result.AssignedToStaffID ? res.Result.AssignedToStaffID : -1;
                        this.previousLeadStatusId = this.leadActivity.LeadStatusTypeID;
                    } else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                }
            )
    }

    openLeadLost() {
        this._dataSharingService.shareLeadID(this.leadStatus.CustomerID);
        this._dataSharingService.shareMembershipID(this.leadActivity.MembershipID);
        this.leadLostReasonModel = new LeadLostReasonModel();
        const dialogRef = this._openDialog.open(LeadLostComponent,
            {
                disableClose: true,
                data: false,
            });

        dialogRef.componentInstance.isSaved.subscribe((isSaved) => {
            if (isSaved) {
                this.previousLeadStatusId = this.leadActivity.LeadStatusTypeID;
            }
            else {
                this.leadActivity.LeadStatusTypeID = this.previousLeadStatusId;
            }
        })
    }

    openLeadWon() {
        this._dataSharingService.shareMemberMembershipID(this.leadActivity.MembershipID);
        const dialogref = this._openDialog.open(SaveMemberMembershipPopup,
            {
                disableClose: true,
                data: {
                    CustomerID: this.leadStatus.CustomerID,
                    CustomerTypeID: CustomerType.Lead
                }
            });

        dialogref.componentInstance.membershipSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.previousLeadStatusId = this.leadActivity.LeadStatusTypeID;
                this._router.navigate(['customer/member/details/' + this.leadStatus.CustomerID]);
            }
            else {
                this.leadActivity.LeadStatusTypeID = this.previousLeadStatusId;
            }
        });
    }

    setLeadActivityTabOptions() {
        this.tabsOptions.ownerId = this.leadID;
        this.tabsOptions.module = ENU_Permission_Module.Lead;
        this.tabsOptions.apiUrls = LeadActivityApi;
        this.tabsOptions.permissions.isSaveActivityAllowed = this.allowedPages.Activities_Save;
        this.tabsOptions.permissions.isProceedToMemberAllowed = this.allowedPages.Lead_ProceedToMember;
        this.tabsOptions.isReadOnlyActivities = this.isLeadLocked;
        this.tabsOptions.activeTabs = [
            this.activityTypes.Call,
            this.activityTypes.Appointment,
            this.activityTypes.Email,
            this.activityTypes.Note,
            this.activityTypes.SMS,
            this.activityTypes.AppNotification,
            this.activityTypes.Achievements,
        ];
        this.tabsOptions.activityRefrences = {
            AppointmentNow: new AppointmentNowActivity({ CustomerID: this.leadID }),
            AppointmentLater: new AppointmentLaterActivity({ CustomerID: this.leadID }),
            AppointmentMarkAsDone: new AppointmentMarkAsDoneActivity({ CustomerID: this.leadID }),
            CallNow: new CallNowActivity({ CustomerID: this.leadID }),
            CallLater: new CallLaterActivity({ CustomerID: this.leadID }),
            CallMarkAsDone: new CallMarkAsDoneActivity({ CustomerID: this.leadID }),
            Note: new NoteActivity({ CustomerID: this.leadID }),
            Email: new EmailActivity({ CustomerID: this.leadID }),
            SMS: new SMSActivity({ CustomerID: this.leadID }),
            AppNotification: new LeadAppNotification({ CustomerID: this.leadID }),
            Achievements: new LeadAppNotification({ CustomerID: this.leadID }),
        };
    };

    setRedirectInfo() {
        this.memberRedirectInfo.LeadID = this.leadStatus.CustomerID;
        this.memberRedirectInfo.IsRedirect = true;
    }

    setPersonInfoDetail() {
        //set PersonID and PersonTypeID for personInfo
        // this.personInfo = new PersonInfo();
        // this.personInfo.PersonID = this.leadID;
        // this.personInfo.PersonTypeID = CustomerType.Lead;
        this.shouldGetPersonInfo = true;
        this.setLeadActivityTabOptions();
    }

    leadActivityDetailFundamentals() {
        let param = {
            customerId: this.leadID
        }
        this._httpService.get(LeadActivityApi.getDetailsFundamental, param)
            .subscribe(
                data => {
                    if (data.Result) {
                        this.leadStatusTypeList = data.Result.LeadStatusTypeList;
                        this.staffList = data.Result.StaffList;
                        this.existingMembershipList = data.Result.ExistingMembershipList;
                        // this.existingMembershipList = this.existingMembershipList.filter(m => m.IsSaleSuspended == false);
                        this.hasMemberships = this.existingMembershipList.length > 0 ? true : false;
                        if (this.hasMemberships) {
                            this.leadActivity.MembershipID = this.existingMembershipList[0].MembershipID;
                            this.getLeadMembershipStatus();
                        }
                    }
                }
            )
    }

    // #endregion
}