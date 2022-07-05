// #region Imports

/********************** Angular Refrences *********************/
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { SubscriptionLike as ISubscription, BehaviorSubject } from "rxjs";
import { Router } from '@angular/router';

/********************* Material:Refference ********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** Services & Models *********************/
/* Models */
import { MemberMembership ,MemberShipSearch ,MembershipStatus} from "@customer/member/models/member.membership.model";
import { Membership ,} from "@customer/member/models/member.membership.payments.model";

import { PersonInfo, ApiResponse } from '@app/models/common.model';

/* Services */
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { DataSharingService } from '@services/data.sharing.service';
import { AuthService } from '@app/helper/app.auth.service';
/********************** Component *********************/
//import { SaveMemberMembershipPopup } from '@shared/components/add-member-membership/save-membership-popup/save.member.membership.popup';
import { GenericAlertDialogComponent } from '@app/application-dialog-module/generic-alert-dialog/generic.alert.dialog.component';
import { EditMemberMembershipComponent } from '@customer/member/memberships/edit-membership/edit.member.membership.component';
import { AlertConfirmationComponent } from '@app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { AddLeadMembershipComponent } from '@app/customer-shared-module/add-lead-membership/add.lead.membership.component';
/**********************  Common *********************/
import { Configurations } from '@helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { MemberMembershipApi,MemberPaymentsApi } from '@app/helper/config/app.webapi';

import { CustomerType, MembershipStatus_Enum, ENU_CancelMembershipReasons, ENU_DateFormatName, EnumActivityLogType } from '@app/helper/config/app.enums';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from '@app/helper/config/app.module.page.enums';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { CancelMembershipComponent } from '@customer/member/cancel-membership/cancel.membership.component';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { MembershipViewComponent } from '@app/shared/components/membership-view/membership.view.component';
import { SaveMemberMembershipPopup } from '@app/customer-shared-module/add-member-membership/save-membership-popup/save.member.membership.popup';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { ActivityLogComponent } from '@app/shared/components/activity-log/activity.log.popup.component';

// #endregion

@Component({
    selector: 'member-membership',
    templateUrl: './member.memberships.component.html',
})

export class MemberMembershipComponent extends AbstractGenericComponent implements OnInit, AfterViewInit, OnDestroy {

    // #region Local Members
    // @ViewChild(CancelMembershipComponent)
    // private localDialog: CancelMembershipComponent

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;
    @ViewChild('membershipSearchDate') membershipSearchDate: DateToDateFromComponent;

    /* Local */
    memberID: number;
    shouldGetPersonInfo: boolean = false;
    previousPageSize = Configurations.DefaultPageSize;
    dateFormat: string = "";///Configurations.DateFormat;
    sortOrder_ASC = Configurations.SortOrder_ASC;
    sortOrder_DESC = Configurations.SortOrder_DESC;
    sortOrder: string;
    dateToPlaceHolder: string = "Select Start Date";
    dateFromPlaceHolder: string = "Select End Date";
    // startDateSortASC: boolean = undefined;
    // isCustomerNameOrderASC: boolean = true;



    /* Messages */
    messages = Messages;

    /* Pagination */
    totalRecords: number = 0;
    defaultPageSize = Configurations.DefaultPageSize;
    pageSizeOptions = Configurations.PageSizeOptions;
    pageNumber: number = 1;
    pageIndex: number = 0;
    isExpand: boolean = true;
    inputName: string = '';
    isDataExists: boolean = false;
    hasMemberships: boolean;
    BranchDefaultRewardProgramVM:any ={};
    /* Collection And Models */
    statusList = Configurations.Status;
    memberMembership: MemberMembership[];
    membershipSearchModel: MemberShipSearch = new MemberShipSearch();
    membershipSearchParams = new MemberShipSearch();

    memberIdSubscription: ISubscription;
    dialogStatus: ISubscription = new BehaviorSubject<boolean>(true);
    // personInfo: PersonInfo;
    membershipStatus = MembershipStatus_Enum;
    enu_CancelMembershipReasons = ENU_CancelMembershipReasons;
    membershipList: Membership[];
    membershipStatusTypeList : MembershipStatus[];


    allowedPages = {
        Search_Member: false,
        Save: false,
        ProceedToLead: false,
        CancelMembership: false
    };

    // #endregion

    constructor(
        private _memberMembershipPaymentsService: HttpService,
        private _memberMembershipService: HttpService,
        private _messageService: MessageService,
        private _memberActionDialogue: MatDialogService,
        private _saleDialogue: MatDialogService,
        private _dataSharingService: DataSharingService,
        private _authService: AuthService,
        private _router: Router) {
            super();
        this.setPermissions();
    }

    // #region Events

    ngOnInit() {
        this.getBranchDatePattern();
    }

    ngAfterViewInit() {
        this.membershipSearchDate.setEmptyDateFilter();
        // this.reciviedDateTo(this.membershipSearchDate.dateToFrom);
        this.getMemberID();
        this.getDilaogStatus();
    }

    ngOnDestroy() {
        this.memberIdSubscription.unsubscribe();
        this.dialogStatus.unsubscribe();
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getMemberMemberships();
    }

    onAddMembership() {
        this.getMembershipListFundamentals();
    }

    // onViewPaymentsDetail(membership: MemberMembership) {
    //     this.viewMembershipPaymentsDetail(membership);
    // }

    onProceedToLead() {
        const dialogref = this._memberActionDialogue.open(AddLeadMembershipComponent,
            {
                disableClose: true,
                data: {
                    CustomerID: this.memberID,
                    CustomerTypeID: CustomerType.Member,
                    //IsMemberToLead: true
                    MemberToLead: true
                }
            });

        dialogref.componentInstance.isLeadMembershipSaved.subscribe((res: any) => {
            if (res.isSaved) {
                this._router.navigate(['/lead/details/' + this.memberID]);
            }
        });
    }

    onEditMembership(membershipObj: any) {
      const dialogref = this._memberActionDialogue.open(EditMemberMembershipComponent, {
            disableClose: true,
            data: {
                    CustomerMembershpiID: membershipObj.CustomerMembershipID,
                    MembershipName: membershipObj.MembershipName,
                    StartDate: membershipObj.StartDate,
                    EndDate: membershipObj.EndDate,
                    Description: "",
            }
        });
        dialogref.componentInstance.isEditMembershipSaved.subscribe((res: any) => {
          if (res) {
            this.resetMembershipSearchFilters();
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace('{0}', "Membership"));
          }
        });
    }

    onRevertCancelledMembership(custMembershipID: number, membershipID: number) {
        this.revertCancelledMembership(custMembershipID, membershipID);
    }

    onSuspendStatusChange(custMembershipID: number, IsSuspended: boolean) {
        this.suspendClassForFreeMembership(custMembershipID, IsSuspended);

    }

    onCancelMembership(memberMembershipobj: any) {
        this.cancelMembership(memberMembershipobj);
    }

    // #endregion

    // #region Methods

    getSearchFundamentals() {
        this.membershipList = [];
        this.membershipStatusTypeList = [];
        let params = {
            CustomerID: this.memberID
        }
        this._memberMembershipPaymentsService.get(MemberMembershipApi.Fundamental,params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.membershipList = response.Result.MembershipList;
                    this.membershipStatusTypeList = response.Result.MembershipStatusTypeList;
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Search Fundamentals"));
                }
            );
    }
    changeSorting(sortIndex: number) {
        this.membershipSearchParams.SortIndex = sortIndex;
        if (sortIndex == 1) {
          if (this.sortOrder == this.sortOrder_ASC) {
            this.sortOrder = this.sortOrder_DESC;
            this.membershipSearchParams.SortOrder = this.sortOrder;
            this.getMemberMemberships();
          } else {
            this.sortOrder = this.sortOrder_ASC;
            this.membershipSearchParams.SortOrder = this.sortOrder;
            this.getMemberMemberships();
          }
        }
        if (sortIndex == 2) {
            if (this.sortOrder == this.sortOrder_ASC) {
              this.sortOrder = this.sortOrder_DESC;
              this.membershipSearchParams.SortOrder = this.sortOrder;
              this.getMemberMemberships();
            } else {
              this.sortOrder = this.sortOrder_ASC;
              this.membershipSearchParams.SortOrder = this.sortOrder;
              this.getMemberMemberships();
            }
          }
          if (sortIndex == 3) {
            if (this.sortOrder == this.sortOrder_ASC) {
              this.sortOrder = this.sortOrder_DESC;
              this.membershipSearchParams.SortOrder = this.sortOrder;
              this.getMemberMemberships();
            } else {
              this.sortOrder = this.sortOrder_ASC;
              this.membershipSearchParams.SortOrder = this.sortOrder;
              this.getMemberMemberships();
            }
          }
          if (sortIndex == 4) {
            if (this.sortOrder == this.sortOrder_ASC) {
              this.sortOrder = this.sortOrder_DESC;
              this.membershipSearchParams.SortOrder = this.sortOrder;
              this.getMemberMemberships();
            } else {
              this.sortOrder = this.sortOrder_ASC;
              this.membershipSearchParams.SortOrder = this.sortOrder;
              this.getMemberMemberships();
            }
          }
      }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    }

    setPermissions() {
        this.allowedPages.Search_Member = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.View);
        this.allowedPages.Save = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Memberships_Save);
        this.allowedPages.ProceedToLead = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.ProceedToLead);
        this.allowedPages.CancelMembership = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.CancelMembership);
    }
    onMembershipChange(customerMembershipID:number) {
        this.membershipSearchModel.MembershipID = this.membershipList.filter(item => item.CustomerMembershipID == customerMembershipID)[0].MembershipID;
    }
    reciviedDateTo($event) {
        this.membershipSearchParams.DateFrom = $event.DateFrom;
        this.membershipSearchParams.DateTo = $event.DateTo;
    }
    onFromDateChange(date: any) {
        this.membershipSearchParams.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.membershipSearchParams.DateTo = date;
    }
    getMemberID() {
        this.memberIdSubscription = this._dataSharingService.memberID.subscribe(memberID => {
            if (memberID > 0) {
                this.memberID = memberID;
                //set PersonID and PersonTypeID for personInfo
                // this.personInfo = new PersonInfo();
                // this.personInfo.PersonID = this.memberID;
                // this.personInfo.PersonTypeID = CustomerType.Member;
                this.shouldGetPersonInfo = true;
                this.getMemberMemberships();
                this.getSearchFundamentals();
            }
        });
    }

    getDilaogStatus() {
        this.dialogStatus = this._dataSharingService.updateCancelledStatus.subscribe((updateCancelledStatus: boolean) => {
            if (updateCancelledStatus) {
                this.getMemberMemberships();
            }
        })
    }
    resetMembershipSearchFilters() {
        this.membershipSearchParams = new MemberShipSearch();
        this.membershipSearchModel.MembershipStatusTypeID = undefined;
        this.membershipSearchModel.MembershipID = undefined;
        this.membershipSearchModel.CustomerMembershipID = undefined;
        this.membershipSearchModel.DateFrom = null;
        this.membershipSearchModel.DateTo = null;
        this.appPagination.resetPagination();
        // this.membershipSearchDate.resetDateFilter();
        this.membershipSearchDate.setEmptyDateFilter();

        this.getMemberMemberships();

    }
    memberShipSearch() {
      this.membershipSearchParams = new MemberShipSearch();
      this.reciviedDateTo(this.membershipSearchDate.dateToFrom);

      this.membershipSearchParams.MembershipStatusTypeID = this.membershipSearchModel.MembershipStatusTypeID,
    //   this.membershipSearchParams.DateFrom = this.membershipSearchModel.DateFrom,
    //   this.membershipSearchParams.DateTo = this.membershipSearchModel.DateTo,
      this.membershipSearchParams.MembershipID = this.membershipSearchModel.MembershipID,
      this.appPagination.paginator.pageIndex = 0;
      this.appPagination.pageNumber = 1;
      this.getMemberMemberships();
    }
    getMemberMemberships() {

        this.membershipSearchParams.CustomerID = this.memberID;
        this.membershipSearchParams.PageNumber = this.appPagination.pageNumber;
        this.membershipSearchParams.PageSize = this.appPagination.pageSize;

        this._memberMembershipService.get(MemberMembershipApi.getMemberMembershipByID, this.membershipSearchParams)
            .subscribe(data => {
                this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    if (this.isDataExists) {
                        if (data.Result.length > 0) {
                            this.appPagination.totalRecords = data.TotalRecord;
                        }
                        else {
                            this.appPagination.totalRecords = 0;
                        }
                        this.memberMembership = data.Result;
                    } else {
                        this.appPagination.totalRecords = 0;
                    }
                    this.memberMembership = data.Result;
                    this.memberMembership.forEach(element => {
                        if (element.MembershipCancellationReasonTypeID == this.enu_CancelMembershipReasons.Others) {
                            element.MembershipCancellationReasonTypeName = element.MembershipCancellationReason
                        }
                    });
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Membership"));
                }
            );
    }

    getMembershipListFundamentals() {
        let params = {
            CustomerID: this.memberID
        }

        this._memberMembershipService.get(MemberMembershipApi.getMemberMembershipFundamentals, params)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {

                    this.hasMemberships = response.Result.MembershipWithPaymentPlanList.length > 0 ? true : false;
                    this.BranchDefaultRewardProgramVM = response.Result.BranchDefaultRewardProgramVM;
                    this.openAddMembershipDialog();
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error); }
            );
    }

    openAddMembershipDialog() {
        if (this.hasMemberships) {
            const dialogRef = this._memberActionDialogue.open(SaveMemberMembershipPopup, {
                disableClose: true,
                data: {
                    CustomerID: this.memberID,
                    CustomerTypeID: CustomerType.Member,
                    BranchDefaultRewardProgramVM:this.BranchDefaultRewardProgramVM
                }
            });

            dialogRef.componentInstance.membershipSaved.subscribe((isSaved: boolean) => {
                if (isSaved) {
                    this.getMemberMemberships();
                    this.getSearchFundamentals();

                }
            });
        }
        else {
            const dialogRef = this._memberActionDialogue.open(GenericAlertDialogComponent, { disableClose: true });
            dialogRef.componentInstance.Message = this.messages.Generic_Messages.Memebrships_Assigned_Alert;
        }
    }

    viewMembershipDetail(membership: any) {

        var data = {
            MembershipID: membership.MembershipID,
            CustomerMembershipID: membership.CustomerMembershipID
        };

        this._memberActionDialogue.open(MembershipViewComponent,
            {
                disableClose: true,
                data: data,
            });
    }

    // viewMembershipPaymentsDetail(membership: MemberMembership) {
    //     this._memberActionDialogue.open(MembershipPaymentsPopupComponent, {
    //         disableClose: true,
    //         data: {
    //             CustomerMembershipID: membership.CustomerMembershipID,
    //             MembershipID: membership.MembershipID,
    //             CustomerID: this.memberID,
    //             MembershipName: membership.MembershipName,
    //             StartDate: this._dateTimeService.convertDateObjToString(membership.StartDate, this.dateFormat),
    //             EndDate: this._dateTimeService.convertDateObjToString(membership.EndDate, this.dateFormat)
    //         }
    //     });
    // }

    revertCancelledMembership(custMembershipID: number, membershipID: number) {
        const dialogRef = this._memberActionDialogue.open(AlertConfirmationComponent, { disableClose: true });

        dialogRef.componentInstance.Title = this.messages.Dialog_Title.Revert_Cancel;
        dialogRef.componentInstance.Message = this.messages.Confirmation.Revert_Cancel_Membership;
        dialogRef.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                let params = {
                    customerMembershipID: custMembershipID,
                    customerID: this.memberID,
                    membershipID: membershipID
                }
                this._memberMembershipService.get(MemberMembershipApi.revertCancelMemebrship, params)
                    .subscribe(res => {
                        if (res && res.MessageCode > 0) {
                            this.getMemberMemberships();
                            this._messageService.showSuccessMessage(this.messages.Success.Cancelled_Membership_Revert);
                        }
                        else {
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Revert Cancelled Membership")); }
                    );
            }
        })
    }

    suspendClassForFreeMembership(custMembershipID: number, IsSuspended: boolean) {
        const dialogRef = this._memberActionDialogue.open(AlertConfirmationComponent, { disableClose: true });

        dialogRef.componentInstance.Title = IsSuspended == true ? this.messages.Dialog_Title.Allow_Free_Class : this.messages.Dialog_Title.Suspend_Free_Class;
        dialogRef.componentInstance.Message = IsSuspended == true ? this.messages.Confirmation.Allow_Free_Class : this.messages.Confirmation.Suspend_Free_Class;
        dialogRef.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                let params = {
                    customerMembershipID: custMembershipID
                }
                this._memberMembershipService.get(MemberMembershipApi.suspendMemberFreeClass, params)
                    .subscribe(res => {
                        if (res && res.MessageCode > 0) {
                            this.getMemberMemberships();
                            this._messageService.showSuccessMessage(IsSuspended == true ? this.messages.Success.Free_Class_Allowed : this.messages.Success.Free_Class_Suspended);
                        }
                        else {
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Suspending free class")); }
                    );
            }
        })
    }

    cancelMembership(memberMembershipobj: any) {
        let customerMembershipInfo = {
            custID: memberMembershipobj.CustomerID,
            customerMembershipID: memberMembershipobj.CustomerMembershipID,
            scheduledCancellationDate: memberMembershipobj.ScheduledCancellationDate,
            membershipCancellationReasonTypeID: memberMembershipobj.MembershipCancellationReasonTypeID,
            membershipCancellationReason: memberMembershipobj.MembershipCancellationReason,
            isAutoRoll: memberMembershipobj.IsAutoRoll,
            membershipEndDate: memberMembershipobj.EndDate
        }
        const dialogRef = this._memberActionDialogue.open(CancelMembershipComponent,
            {
                disableClose: true,
                data: customerMembershipInfo,
            });

        dialogRef.componentInstance.Title = this.messages.Dialog_Title.Cancel_Membership;
        dialogRef.componentInstance.Message = this.messages.Confirmation.Cancel_Membership;
        dialogRef.componentInstance.confirmChange.subscribe((membershipCancel: any) => {
            if (membershipCancel.IsMembershipCancelNow) {
                let params = {
                    customerMembershipID: memberMembershipobj.CustomerMembershipID,
                    customerID: this.memberID,
                    membershipCancellationReasonTypeID: membershipCancel.MembershipCancellationReasonTypeID,
                    membershipCancellationReason: membershipCancel.MembershipCancellationReason ? membershipCancel.MembershipCancellationReason : ""
                }
                this._memberMembershipService.get(MemberMembershipApi.cancelMembership, params)
                    .subscribe(res => {
                        if (res && res.MessageCode > 0) {
                            this.getMemberMemberships();
                            this._messageService.showSuccessMessage(this.messages.Success.Membership_Cancel_Success);
                        }
                        else {
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Cancelled Membership")); }
                    );
            }
            else {
                this.getMemberMemberships();
            }
        })
    }
     // for open Activity Popup
     openDialogForActivityLog (CustomerMembershipID: number) {

      const dialogRef = this._saleDialogue.open(ActivityLogComponent, {
          disableClose: true
        });

        dialogRef.componentInstance.CustomerMembershipID = CustomerMembershipID;
        dialogRef.componentInstance.dateFormat = this.dateFormat;
        dialogRef.componentInstance.logType = EnumActivityLogType.MemberShip;

      }
    // #endregion
}
