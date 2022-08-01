// #region Imports

/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { DropEvent } from 'ng-drag-drop';
import * as moment from 'moment';

/********************* Material:Refference ********************/
import { MatDatepicker } from '@angular/material/datepicker';

/********************** Services & Models *********************/
/* Models */
import { LeadOnBoard, LeadStatus, SaveLead, LeadLostReasonModel, LeadSearchParameter } from "src/app/lead/models/lead.model";
import { SearchActivity, AppointmentMarkAsDoneActivity, CallMarkAsDoneActivity } from "src/app/lead/models/lead.activity.model";
import { SaveMember } from 'src/app/customer/member/models/members.model';
import { MemberRedirectInfo } from 'src/app/customer/member/models/members.model';
import { ApiResponse, PersonInfo } from 'src/app/models/common.model';
import { ActivityPersonInfo } from 'src/app/models/activity.model';
import { AppointmentNowActivity,AppointmentLaterActivity,CallNowActivity,CallLaterActivity} from 'src/app/lead/models/lead.activity.model'

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { AuthService } from 'src/app/helper/app.auth.service';

/**********************Component*********************/
import { AddLeadPopupComponent } from 'src/app/lead/save/save.lead.popup.component';
import { LeadLostComponent } from 'src/app/lead/lost-popup/lead.lost.popup.component';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { SaveActivityComponent } from 'src/app/shared/components/activities/save/save.activity.component';
import { SaveMemberMembershipPopup } from 'src/app/customer-shared-module/add-member-membership/save-membership-popup/save.member.membership.popup';
import { MissingBillingAddressDialog } from 'src/app/customer-shared-module/missing-billing-address/missing.billing.address.dialog';

/********************** Configuration *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { LeadActivityApi, LeadApi, LeadMembershipApi, CustomerApi } from 'src/app/helper/config/app.webapi';
import { ENU_Permission_Module, ENU_Permission_Lead } from 'src/app/helper/config/app.module.page.enums';
import { ActivityTabsOptions } from 'src/app/models/activity.tab.options'
import { Messages } from 'src/app/helper/config/app.messages';
import { ENU_ModuleList, LeadStatusType, ENU_ActivityType, CustomerType, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragStart, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';



// #endregion

@Component({
    selector: 'lead-business-flow-view',
    templateUrl: './lead.business.flow.component.html',
    host: {
        '(document:mousedown)': 'onMouseDown($event)',
        '(document:mouseup)': 'onMouseUp()',
    },
})

export class LeadBusinessFlowViewComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Members

    dateFormat: string = "";

    @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
    @ViewChild('dateSearch') dateSearch: DateToDateFromComponent;

    /***********Messages*********/
    messages = Messages;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    successMessage: string;
    errorMessage: string;

    /*********** Local members **********/
    displayNone: boolean;
    state = '';
    position = '';
    dateToPlaceHolder: String = "Select Lead Created Date";
    dateFromPlaceHolder: string = "Select Lead Created Date";

    overDueDate: Date = new Date();
    toDate: string = "";
    fromDate: string = "";
    isDataExists: boolean = false;
    isDataExits: boolean = false;
    isDragOverWon: boolean = false;
    isDragOverLost: boolean = false;
    isDragOverDelete: boolean = false;
    onDrag: boolean = false;
    leadID: number;
    isActivityExits: boolean = false;
    membershipList: any;
    leadStatusTypeList: any;
    staffList: any;

    /*********** Collection Types **********/
    dragEnabled = true;
    deleteDialogRef: any;
    saveLeadDataObj: SaveLead;
    leadLostReasonModel: LeadLostReasonModel;
    searchParameterObj = new LeadSearchParameter();
    personTypeInfo: PersonInfo;

    /*********** Model References **********/
    leadStatus: LeadStatus;
    memberRedirectInfo: MemberRedirectInfo;
    tabsOptions: ActivityTabsOptions;
    leads: LeadOnBoard[] = [];
    fresh: LeadOnBoard[] = [];
    perposalMade: LeadOnBoard[] = [];
    meetingArranged: LeadOnBoard[] = [];
    perposalSend: LeadOnBoard[] = [];
    finalMeeting: LeadOnBoard[] = [];
    leadActivity: SearchActivity[] = [];
    saveMember: SaveMember[] = [];
    ondropLead: LeadOnBoard[] = [];;
    leadLostReasonList: any;

    /*********** Configurations **********/
    leadStatusType = LeadStatusType;
    activityType = ENU_ActivityType;
    moduleId = ENU_ModuleList.Lead;
    activityTypes = Configurations.ActivityTypes;
    timeFormat = Configurations.SchedulerTimeFormat;

    allowedPages = {
        Activities_Save: false,
        Activities_View: false,
        Lead_Save: false,
        Lead_Membership_Save: false,
        Lead_ProceedToMember: false,
        Lead_DeleteEnquiry: false,
        BusinessFlow_Save: false,
    };

    longDateFormat: string = "";
    longDateTimeFormat: string = "";

    // #endregion

    constructor(
        private _httpService: HttpService,
        private _dialoge: MatDialogService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _authService: AuthService,
        private _messageService: MessageService
    ) {
        super();
        this.setPermissions();
        this.saveLeadDataObj = new SaveLead();
        this.leadLostReasonModel = new LeadLostReasonModel();
        this.memberRedirectInfo = new MemberRedirectInfo();
    }



    ngOnInit() {
        this.getBranchDatePattern();
        this.leadSearchFundamentals();
       // this.getLeadsStatus();
    }

    ngAfterViewInit() {
        this.dateSearch.resetDateFilter();
        this.dateSearch.setEmptyDateFilter();
        this.getLeadsStatus();
    }
    // #region events

    dragStarted(event: CdkDragStart) {
        this.onDrag = true;
    }

    dragEnded(event: CdkDragEnd) {
        this.onDrag = false;
    }

    dragMoved(event: CdkDragMove) {
        this.position = `> Position X: ${event.pointerPosition.x} - Y: ${event.pointerPosition.y}`;
    }

    // openLeadLost(dropEvent: CdkDragDrop<LeadOnBoard[]>) {
    //     // var onDropData = dropEvent.previousContainer.data[0];
    //     this._dataSharingService.shareLeadID(dropEvent.previousContainer.data[0].CustomerID);
    //     this._dataSharingService.shareMembershipID(dropEvent.previousContainer.data[0].MembershipID);
    //     this.getLeadLostReasons();
    //     const dialogRef = this._dialoge.open(LeadLostComponent,
    //         {
    //             disableClose: true,
    //             data: true,
    //         });

    //     dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
    //         if (isSaved) {
    //             this.getLeadsStatus();
    //         }
    //     })
    // }

    // onMouseDown(event) {
    //     this.onMouseUp();
    //     event = event || window.event;
    //     let clickOnIcon = event.target === document.getElementsByClassName("fa fa-arrow-circle-right")[0];
    //     if (!clickOnIcon) {
    //         this.displayNone = true;
    //     }
    // }
    onMouseDown(event) {
        this.onMouseUp();
        event = event || window.event;
        let clickOnIcon = event.target === document.getElementsByClassName("fa fa-arrow-circle-right")[0];
        if (!clickOnIcon) {
            let tagName = event.target.tagName;
            if (tagName == "BUTTON" || tagName == "I") {
                this.displayNone = undefined;
            }
            else {
                this.displayNone = true;
            }
        }
    }

    onMouseUp() {
        this.displayNone = undefined;
    }

    openLeadLost(dropEvent: DropEvent) {
        // var onDropData = dropEvent.previousContainer.data[0];
        this._dataSharingService.shareLeadID(dropEvent.dragData.CustomerID);
        this._dataSharingService.shareMembershipID(dropEvent.dragData.MembershipID);
        this.getLeadLostReasons();
        const dialogRef = this._dialoge.open(LeadLostComponent,
            {
                disableClose: true,
                data: true,
            });

        dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getLeadsStatus();
            }
        })
    }

    onDeleteEnquiry(dropEvent: DropEvent) {
        // let url = LeadMembershipApi.delete.replace("{customerId}", dropEvent.dragData.CustomerID.toString())
        // .replace("{membershipId}", dropEvent.dragData.CustomerID.toString())

        let params = {
            CustomerID: dropEvent.dragData.CustomerID,
            MembershipID: dropEvent.dragData.MembershipID
        }
        this.deleteDialogRef = this._dialoge.open(DeleteConfirmationComponent, { disableClose: true, data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_Undone } });
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(LeadMembershipApi.delete, params)
                    .subscribe((res :ApiResponse) => {
                        if (res && res.MessageCode > 0) {
                            this.getLeadsStatus();
                            this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Enquiry"));
                        }
                        else if (res && res.MessageCode < 0) {
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Enquiry")); }
                    );
            }
        });
    }

    openAddEditDialog() {
        this._dataSharingService.shareLeadID(0);
        const dialogRef = this._dialoge.open(AddLeadPopupComponent, {
            disableClose: true,
            data: this.saveLeadDataObj,
        });

        dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getLeadsStatus();
            }
        });
    }

    openProceedToMember(dropEvent: DropEvent) {
        this._dataSharingService.shareLeadIDOnMember(dropEvent.dragData.CustomerID);
        this._dataSharingService.shareMemberMembershipID(dropEvent.dragData.MembershipID);
        this._dataSharingService.shareCustomerID(dropEvent.dragData.CustomerID);
        // this.memberRedirectInfo.LeadID = dropEvent.previousContainer.data[0].CustomerID;
        // this.memberRedirectInfo.IsRedirect = false;
        if (dropEvent.dragData.IsSaleSuspended) {
            this._messageService.showSuccessMessage(this.messages.Generic_Messages.Suspended_Memebrships_Alert);
        } else {
            const dialogRef = this._dialoge.open(SaveMemberMembershipPopup,
                {
                    disableClose: true,
                    data: {
                        CustomerID: dropEvent.dragData.CustomerID,
                        CustomerTypeID: CustomerType.Lead
                    }
                });

            dialogRef.componentInstance.membershipSaved.subscribe((isSaved: boolean) => {
                if (isSaved) {
                    this.getLeadsStatus();
                }
            });
        }

    }

    openAddLeadDialog() {
        this.openAddEditDialog();
    }

    onPerposalMade(e: DropEvent) {
        this.perposalMade.push(e.dragData);
        this.removeItem(e.dragData, this.leads);
    }

    // onLeadDrop(dropEvent: CdkDragDrop<LeadOnBoard[]>, leadStatusTypeId: number) {
    //     var onDropData = dropEvent.previousContainer.data[0];
    //     if (onDropData.LeadStatusTypeID != leadStatusTypeId) {
    //         this.leadStatus = new LeadStatus();
    //         this.leadStatus.CustomerID = onDropData.CustomerID;
    //         this.leadStatus.MembershipID = onDropData.MembershipID;
    //         this.leadStatus.LeadStatusTypeID = leadStatusTypeId;
    //         this._httpService.save(LeadMembershipApi.saveLeadStatus, this.leadStatus)
    //             .subscribe(
    //                 res => {
    //                     if (res.MessageCode > 0) {
    //                         this.getLeadsStatus();
    //                         this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Lead Status"));
    //                     }
    //                     else {
    //                         this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Status"));
    //                     }

    //                 },
    //                 err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Status")); }
    //             );
    //     }
    // }

    onDeleteActivity(customerActivityID: number, customerID: number, activityTypeID: number) {
        this.deleteDialogRef = this._dialoge.open(DeleteConfirmationComponent, { disableClose: true, data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_Undone } });
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                let url = LeadActivityApi.delete.replace("{customerActivityID}", customerActivityID.toString())
                    .replace("{customerID}", customerID.toString())
                    .replace("{activityTypeID}", activityTypeID.toString());
                this._httpService.delete(url).subscribe(
                    (res:ApiResponse) => {
                        if(res && res.MessageCode > 0){
                        this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Activity"));
                        }else{
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Activity")); }
                );
            }
        })

    }


    // onToDateChange(date: any) {
    //     setTimeout(() => {
    //         this.searchParameterObj.DateTo = date; //this.getFormattedDate(date);  07/05/2018this.searchParameterObj.DateFrom = date; // 07/05/2018
    //     });
    // }

    // onFromDateChange(date: any) {
    //     setTimeout(() => {
    //         this.searchParameterObj.DateFrom = date; // 07/05/2018
    //     });
    // }

    reciviedDateTo($event) {
        this.searchParameterObj.DateFrom = $event.DateFrom;
        this.searchParameterObj.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.searchParameterObj.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.searchParameterObj.DateTo = date;
    }

    onMarkAsDone(leadInfo: LeadOnBoard, activityId: number, activityTypeId: number) {
        this._dataSharingService.shareMembershipID(leadInfo.MembershipID);
        this.shareLeadInfo(leadInfo);
        switch (activityTypeId) {
            case (this.activityType.Appointment): {
                this.appointmentMarkAsDone(activityId);
                break;
            }

            case (this.activityType.Call): {
                this.callMarkAsDone(activityId);
                break;
            }
        }
    }

    onLeadWon(dropEvent: DropEvent) {
        this.personTypeInfo = new PersonInfo();
        this.personTypeInfo.PersonID = dropEvent.dragData.CustomerID;
        this.personTypeInfo.PersonTypeID = CustomerType.Lead;
        // this.shouldGetPersonInfo = true;
        this._dataSharingService.sharePersonInfo(this.personTypeInfo);
        this.checkBillingAddress(dropEvent);
    }

    // #endregion

    // #region methods

    async getBranchDatePattern() {
        this.longDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.LongDateFormat);
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.longDateTimeFormat = this.longDateFormat + ' - ' + this.timeFormat;
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    }

    checkBillingAddress(dropEvent: DropEvent) {
        this._httpService.get(CustomerApi.checkBillingAndGateway + dropEvent.dragData.CustomerID).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result.HasBillingAddress) {
                        this.openProceedToMember(dropEvent);
                    }
                    else {
                        // this.showBillingAddressDialog(dropEvent); we are hiding this popup because of optional address
                        this.openProceedToMember(dropEvent);

                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            }
        )
    }

    showBillingAddressDialog(dropEvent: DropEvent) {
        const dialog = this._dialoge.open(MissingBillingAddressDialog, {
            disableClose: true,
            data: dropEvent.dragData.CustomerID
        });
        this._dataSharingService.shareMemberMembershipID(dropEvent.dragData.MembershipID);
        dialog.componentInstance.redirectUrl = "/lead/details/" + dropEvent.dragData.CustomerID;
    }

    setPermissions() {
        this.allowedPages.Lead_Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Save);
        this.allowedPages.Activities_View = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Activities_View);
        this.allowedPages.Activities_Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Activities_Save);
        this.allowedPages.Lead_Membership_Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Memberships_Save);
        this.allowedPages.Lead_ProceedToMember = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.ProceedToMember);
        this.allowedPages.Lead_DeleteEnquiry = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Lead_DeleteEnquiry);
        this.allowedPages.BusinessFlow_Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.BusinessFlow_Save);
    }

    leadSearchFundamentals() {
        this._httpService.get(LeadApi.searchFundamentals)
            .subscribe(
                (res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this.membershipList = res.Result.MembershipList;
                        this.leadStatusTypeList = res.Result.LeadStatusTypeList;
                        this.staffList = res.Result.StaffList;

                        this.setSearchFilters();
                    } else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error.replace("{0}", "Lead")); }
            );
    }

    getLeadsStatus() {
        let params = {
            customerName: this.searchParameterObj.CustomerName,
            MembershipID: this.searchParameterObj.MembershipID,
            AssignedToStaffID: this.searchParameterObj.AssignedToStaffID,
            Email: this.searchParameterObj.Email,
            DateFrom: this.searchParameterObj.DateFrom,
            DateTo: this.searchParameterObj.DateTo
        }
        this._httpService.get(LeadApi.getLeadBusinessFlow, params)
            .subscribe((res: ApiResponse) => {
                if (res.Result != null) {
                    this.isDataExists = res.Result.length == 0 ? true : false;
                    this.leads = res.Result;
                    this.filterLeadByStatus();
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                    this.isDataExists = true;
                    this.leads = res.Result;
                    this.resetFilteredLeads();
                }
            },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Status")) }
            );
    }

    getActivitybyLeadID(leadID: number) {
        this.leadActivity = [];
        this.isDataExists = false;
        this.leadID = leadID;
        let params = {
            customerID: leadID,
            pageNumber: 1,
            pageSize: 5
        }
        this._httpService.get(LeadActivityApi.getAll, params)
            .subscribe((res:ApiResponse) => {
                // this.getTime();
                if (res.Result != null) {
                    this.leadActivity = res.Result;
                    this.setDateOverDueDay();
                    this.setActivityIconVisibility();
                    this.isActivityExits = res.Result.length > 0 ? true : false;
                }
                else {
                    this.isActivityExits = false;
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Activities")); }
            );
    }

    getLeadLostReasons() {
        this._httpService.get(LeadApi.leadLostReasonType + this.moduleId)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.leadLostReasonList = res.Result;
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            })
    }

    setDateOverDueDay() {
        this.overDueDate = new Date(this.getFormattedDate(this.overDueDate));

        this.leadActivity.forEach((lead: any, index) => {
            this.leadActivity[index].OverDueDay = 0;
            this.leadActivity[index].RemainingDay = 0;
            this.leadActivity[index].IsOverDue = false;

            if (lead.FollowUpDate != null && lead.MarkedAsDone == false) {

                this.leadActivity[index].FollowUpDate = new Date(lead.FollowUpDate);
                if (this.overDueDate > lead.FollowUpDate) {
                    var diff = Math.abs(this.overDueDate.getTime() - new Date(lead.FollowUpDate).getTime());
                    this.leadActivity[index].OverDueDay = Math.ceil(diff / (1000 * 3600 * 24));
                    this.leadActivity[index].IsOverDue = true;
                    if (this.leadActivity[index].ActivityTypeID == this.activityType.Call) {
                        this.leadActivity[index].TooltipInfo = 'Call Overdue for' + ' ' + this.leadActivity[index].OverDueDay + ' ' + 'Day(s)'
                    }
                    if (this.leadActivity[index].ActivityTypeID == this.activityType.Appointment) {
                        this.leadActivity[index].TooltipInfo = 'Appointment Overdue for' + ' ' + this.leadActivity[index].OverDueDay + ' ' + 'Day(s)';
                    }
                }
                else {
                    var currentDate = moment(this.overDueDate);
                    var FollowUpDate = moment(lead.FollowUpDate);
                    this.leadActivity[index].RemainingDay = FollowUpDate.diff(currentDate, 'days');
                }
            }


            if (lead.FollowUpEndTime != null) {
                this.leadActivity[index].FollowUpEndTime = moment(lead.FollowUpEndTime, 'hh:mm');
            }
            else {
                if (lead.ModifiedOn != null) {
                    this.leadActivity[index].Time = moment(lead.ModifiedOn).format("hh:mm");
                }
                else {
                    this.leadActivity[index].Time = moment(lead.CreatedOn).format("hh:mm");
                }
            }
        })
    }

    setActivityIconVisibility() {
        if (this.leadActivity && this.leadActivity.length > 0) {
            this.leadActivity.forEach(activity => {
                activity.ShowEditIcon = (activity.ActivityTypeID === this.activityType.Appointment && !activity.IsNow && !activity.MarkedAsDone) ||
                    (activity.ActivityTypeID === this.activityType.Call && !activity.IsNow && !activity.MarkedAsDone) ||
                    (activity.ActivityTypeID === this.activityType.Task && !activity.MarkedAsDone);
                activity.ShowMarkAsDoneIcon = !activity.MarkedAsDone;
                activity.ShowViewIcon = (activity.ActivityTypeID === this.activityType.Task);
                activity.ShowDeleteIcon = (activity.ActivityTypeID === this.activityType.Appointment && !activity.IsNow && !activity.MarkedAsDone) ||
                    (activity.ActivityTypeID === this.activityType.Call && !activity.IsNow && !activity.MarkedAsDone);
            });
        }
    }

    shareLeadInfo(leadInfo: LeadOnBoard) {
        let personInfo = new ActivityPersonInfo();

        personInfo.Name = leadInfo.CustomerName;
        personInfo.Mobile = leadInfo.Mobile;
        personInfo.Email = leadInfo.Email;

        this._dataSharingService.shareActivityPersonInfo(personInfo);
    }

    appointmentMarkAsDone(activityId: number) {
        this.getAppointmentLaterById(activityId)
            .subscribe(
                data => {
                    const appointmentMarkAsDonePopup = this._dialoge.open(SaveActivityComponent, {
                        disableClose: true,
                        data: {
                            ownerId: this.leadID,
                            module: this.moduleId,
                            activeTabs: [this.activityTypes.Appointment],
                            isMarkAsDone: true,
                            isEditMode: true,
                            activityRefrences: {
                                AppointmentLater: data.Result,
                                AppointmentNow: new AppointmentNowActivity({ CustomerID: this.leadID }),
                                AppointmentMarkAsDone: new AppointmentMarkAsDoneActivity({ CustomerID: this.leadID })
                            },
                            apiUrls: {
                                saveAppointmentMarkAsDone: LeadActivityApi.saveAppointmentMarkAsDone,
                                getAppointmentFundamentals: LeadActivityApi.getAppointmentFundamentals
                            }
                        }
                    });

                    appointmentMarkAsDonePopup.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
                        if (isSuccess) {
                            this.getActivitybyLeadID(this.leadID);
                        }
                    });
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Appointment"));
                }
            );
    }

    callMarkAsDone(activityId: number) {
        this.setAddCallTabOptions();
        this.getCallLaterById(activityId).subscribe(
            data => {
                const callMarkAsDonePopup = this._dialoge.open(SaveActivityComponent, {
                    disableClose: true,
                    data: {
                        activityRefrences: {
                            CallLater: data.Result,
                            CallNow: new CallNowActivity({ CustomerID: this.leadID }),
                            CallMarkAsDone: new CallMarkAsDoneActivity({ CustomerID: this.leadID })
                        },
                        apiUrls: {
                            saveCallMarkAsDone: LeadActivityApi.saveCallMarkAsDone,
                            getCallFundamentals: LeadActivityApi.getCallFundamentals
                        },
                        ownerId: this.leadID,
                        module: this.moduleId,
                        isMarkAsDone: true,
                        isEditMode: true,
                        activeTabs: [this.activityTypes.Call],
                        permissions :this.tabsOptions.permissions
                    }
                });

                callMarkAsDonePopup.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
                    if (isSuccess) {
                        this.getLeadsStatus();
                        this.getActivitybyLeadID(this.leadID);
                    }
                });

                callMarkAsDonePopup.componentInstance.openAddCall.subscribe((openAddCall: boolean) => {
                    if (openAddCall) {
                        this.setAddCallTabOptions();
                        this.openAddActivityDialog();
                    }
                });

                callMarkAsDonePopup.componentInstance.openAddAppointment.subscribe((openAddAppointment: boolean) => {
                    if (openAddAppointment) {
                        this.setAddAppointmentTabOptions();
                        this.openAddActivityDialog();
                    }
                });
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Call"));
            }
        );
    }

    setAddAppointmentTabOptions() {
        this.tabsOptions = new ActivityTabsOptions();
        this.tabsOptions.ownerId = this.leadID;
        this.tabsOptions.module = this.moduleId;
        this.tabsOptions.apiUrls = LeadActivityApi;
        this.tabsOptions.activeTabs = [
            this.activityTypes.Appointment
        ];
        this.tabsOptions.activityRefrences = {
            AppointmentNow: new AppointmentNowActivity({ CustomerID: this.leadID }),
            AppointmentLater: new AppointmentLaterActivity({ CustomerID: this.leadID })
        };
    };

    setAddCallTabOptions() {
        this.tabsOptions = new ActivityTabsOptions();

        this.tabsOptions.ownerId = this.leadID;
        this.tabsOptions.module = this.moduleId;
        this.tabsOptions.apiUrls = LeadActivityApi;
        this.tabsOptions.permissions.isProceedToMemberAllowed = this.allowedPages.Lead_ProceedToMember;
        this.tabsOptions.activeTabs = [
            this.activityTypes.Call
        ];
        this.tabsOptions.activityRefrences = {
            CallNow: new CallNowActivity({ CustomerID: this.leadID }),
            CallLater: new CallLaterActivity({ CustomerID: this.leadID })
        };
    };

    openAddActivityDialog() {
        const addDialogRef = this._dialoge.open(SaveActivityComponent, {
            disableClose: true,
            data: this.tabsOptions
        })

        addDialogRef.componentInstance.activitySaved.subscribe((isSuccess: boolean) => {
            if (isSuccess) {
                this.getActivitybyLeadID(this.leadID);
            }
        })
    }


    getCallLaterById(activityId: number) {
        if (LeadActivityApi.getCallLaterById && LeadActivityApi.getCallLaterById.length > 0) {
            let url = LeadActivityApi.getCallLaterById.replace("{activityID}", activityId.toString()).replace("{ownerID}", this.leadID.toString());

            return this._httpService.get(url);
        }
    }

    getAppointmentLaterById(activityId: number) {
        if (LeadActivityApi.getAppointmentLaterById && LeadActivityApi.getAppointmentLaterById.length > 0) {
            let url = LeadActivityApi.getAppointmentLaterById.replace("{activityID}", activityId.toString()).replace("{ownerID}", this.leadID.toString());

            return this._httpService.get(url);
        }
    }

    getTaskById(activityId: number) {
        if (LeadActivityApi.getTaskById && LeadActivityApi.getTaskById.length > 0) {
            let url = LeadActivityApi.getTaskById.replace("{activityID}", activityId.toString()).replace("{ownerID}", this.leadID.toString());

            return this._httpService.get(url);
        }
    }

    filterLeadByStatus() {
        this.fresh = this.leads.filter((v: any) => v.LeadStatusTypeID == this.leadStatusType.Fresh);
        this.perposalMade = this.leads.filter((v: any) => v.LeadStatusTypeID == this.leadStatusType.PerposalMade);
        this.meetingArranged = this.leads.filter((v: any) => v.LeadStatusTypeID == this.leadStatusType.MeetingArranged);
        this.perposalSend = this.leads.filter((v: any) => v.LeadStatusTypeID == this.leadStatusType.PerposalSend);
        this.finalMeeting = this.leads.filter((v: any) => v.LeadStatusTypeID == this.leadStatusType.FinalMeeting);

    }

    removeItem(item: any, list: Array<any>) {
        let index = list.map(function (e) {
            return e.name
        }).indexOf(item.name);
        list.splice(index, 1);
    }

    // deleteLead(dropEvent: CdkDragDrop<LeadOnBoard[]>) {
    //     var onDropData = dropEvent.previousContainer.data[0];
    //     this.deleteDialogRef = this._dialoge.open(DeleteConfirmationComponent, { disableClose: true });
    //     this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
    //         if (isConfirmDelete) {
    //             this._httpService.delete(CustomerApi.deleteCustomer + "?customerID=" + onDropData.CustomerID)
    //                 .subscribe(res => {
    //                     if (res && res.MessageCode > 0) {
    //                         this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Lead"));
    //                         this.getLeadsStatus();
    //                     }
    //                     else if (res && res.MessageCode <= 0) {
    //                         this._messageService.showErrorMessage(res.MessageText);
    //                     }

    //                 },
    //                     err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Lead")); }
    //                 );
    //         }
    //     })
    // }

    gettime(createdOn: Date) {
        //var d = new Date(); // for now
        createdOn.getHours(); // => 9
        createdOn.getMinutes(); // =>  30
        createdOn.getSeconds(); // => 51
        var time = createdOn.getHours() + ":" + createdOn.getMinutes();
        return time;
    }

    resetFilteredLeads() {
        this.fresh = null;
        this.perposalMade = null;
        this.meetingArranged = null;
        this.perposalSend = null;
        this.finalMeeting = null;
    }

    resetFilter() {
        this.dateSearch.setEmptyDateFilter();
        this.searchParameterObj.CustomerName = "";
        this.searchParameterObj.MembershipID = null;
        this.searchParameterObj.AssignedToStaffID = null;
        this.searchParameterObj.Email = "";

        this.getLeadsStatus();
    }

    getFormattedDate(date: Date) {
        return this._dateTimeService.convertDateObjToString(date, "MM/dd/yyyy");
    }

    setSearchFilters() {
        this.membershipList.splice(0, 0, { MembershipID: null, MembershipName: "All" });
        this.staffList.splice(0, 0, { StaffID: null, StaffFullName: "All" });
    }

    // #endregion


    todo = [
        'Get to work',
        'Pick up groceries',
        'Go home',
        'Fall asleep'
    ];

    done = [
        'Get up',
        'Brush teeth',
        'Take a shower',
        'Check e-mail',
        'Walk dog'
    ];

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
    }

    onLeadDrop(dropEvent: any, leadStatusTypeId: number) {
        if (dropEvent.dragData && dropEvent.dragData.LeadStatusTypeID != leadStatusTypeId) {
            this.leadStatus = new LeadStatus();
            this.leadStatus.CustomerID = dropEvent.dragData.CustomerID;
            this.leadStatus.MembershipID = dropEvent.dragData.MembershipID;
            this.leadStatus.LeadStatusTypeID = leadStatusTypeId;
            this._httpService.save(LeadMembershipApi.saveLeadStatus, this.leadStatus)
                .subscribe(res => {
                    if (res && res.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Lead"));
                        this.getLeadsStatus();
                    }
                    else if (res && res.MessageCode <= 0) {
                        this._messageService.showErrorMessage(res.MessageText);
                    }

                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Lead")); }
                );
        }
        else {
            this.onDrag = false;
        }
    }

    onDragStart() {

        this.onDrag = true;
    }

    onDragEnd() {

        this.onDrag = false;
    }
}
