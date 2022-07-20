import { Component, ViewChild, OnInit } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';

/********************** START: Application Components *********************/
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { MembershipViewComponent } from 'src/app/shared/components/membership-view/membership.view.component';
/********************** START: Service & Models *********************/
import { MembershipList, Membership, SearchMembership } from 'src/app/setup/models/membership.model';
import { DD_Branch, ApiResponse } from 'src/app/models/common.model';

import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { AuthService } from 'src/app/helper/app.auth.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
/********************** START: Common *********************/
import { Configurations, MembershipTypeName } from 'src/app/helper/config/app.config'
import { Messages } from 'src/app/helper/config/app.messages';
import { MembershipApi } from 'src/app/helper/config/app.webapi';
import { ENU_Permission_Module, ENU_Permission_Setup } from 'src/app/helper/config/app.module.page.enums';
import { MembershipType, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';


@Component({
    selector: 'membership-search',
    templateUrl: './membership.search.component.html'
})
export class MembershipSearchComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Members

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;

    dateFormat: string = ""; //Configurations.DateFormat;
    currencyFormat: string;

    isSaveMembershipAllowed: boolean = false;
    statusList: any;
    membershipCategoryList: any;
    membershipTypeList: any;

    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    errorMessage: string;
    successMessage: string;

    /*********** Pagination **********/
    // totalRecords: number = 0;
    //  defaultPageSize = Configurations.DefaultPageSize;
    // pageSizeOptions = Configurations.PageSizeOptions;
    // pageNumber: number = 1;
    // pageIndex: number = 0;
    isDataExists: boolean = false;
    deleteDialogRef: any;

    memberships: MembershipList[] = [];
    membership = new Membership();
    membershipSearch = new SearchMembership();
    membershipSearchParams: SearchMembership = new SearchMembership();

    membershipType = MembershipType;
    membershipTypeNames = MembershipTypeName;

    sortOrder_ASC = Configurations.SortOrder_ASC;
    sortOrder_DESC = Configurations.SortOrder_DESC;
    sortOrder: string;

    // #endregion

    constructor(
        private _authService: AuthService,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        public _dialoge: MatDialogService,
    ) { super(); }

    ngOnInit() {
        this.getCurrentBranchDetail();
        this.isSaveMembershipAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Membership_Save);
        this.getFundamental();

    }


    ngAfterViewInit() {
        this.getMemberships();
    }

    // get current branch details
    async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
        }
    }

    changeSorting(sortIndex: number) {
        this.membershipSearchParams.SortIndex = sortIndex;
        if (sortIndex == 1) {
          if (this.sortOrder == this.sortOrder_ASC) {
            this.sortOrder = this.sortOrder_DESC;
            this.membershipSearchParams.SortOrder = this.sortOrder;
            this.getMemberships();
          } else {
            this.sortOrder = this.sortOrder_ASC;
            this.membershipSearchParams.SortOrder = this.sortOrder;
            this.getMemberships();
          }
        }
        if (sortIndex == 2) {
            if (this.sortOrder == this.sortOrder_ASC) {
              this.sortOrder = this.sortOrder_DESC;
              this.membershipSearchParams.SortOrder = this.sortOrder;
              this.getMemberships();
            } else {
              this.sortOrder = this.sortOrder_ASC;
              this.membershipSearchParams.SortOrder = this.sortOrder;
              this.getMemberships();
            }
          }
      }

    getFundamental() {
        this._httpService.get(MembershipApi.getFundamentals)
            .subscribe((response: ApiResponse) => {
                if (response.MessageCode > 0) {
                    this.membershipTypeList = response.Result.MembershipTypeList;
                    this.statusList = response.Result.StatusList;
                    this.membershipCategoryList = response.Result.MembershipCategoryList;
                }else{
                    this._messageService.showErrorMessage(response.MessageText);
                }
            })
    }

    deleteMembership(MembershipID: number) {
        this.deleteDialogRef = this._dialoge.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(MembershipApi.delete + MembershipID)
                    .subscribe((res: any) => {
                        if (res && res.MessageCode) {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Membership"));
                                this.getMemberships();
                            }
                            else if (res && res.MessageCode <= -1) {
                                // this._messageService.showErrorMessage(this.messages.Error.Membership_Associated_Error.replace("{0}", "Membership"));
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Membership"));
                            }
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Membership")); }
                    );
            }
        })
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getMemberships();
    }

    onSearchForm() {
        //this.membershipSearchParams.membershipTypeID = this.membershipSearch.membershipTypeID;
        this.membershipSearchParams.membershipName = this.membershipSearch.membershipName;
        this.membershipSearchParams.membershipCategoryID = this.membershipSearch.membershipCategoryID;
        this.membershipSearchParams.isActive = this.membershipSearch.isActive;
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getMemberships();
    }

    getMemberships() {
        let params = {
            membershipName: this.membershipSearchParams.membershipName,
            membershipCategoryID: this.membershipSearchParams.membershipCategoryID && this.membershipSearchParams.membershipCategoryID > 0 ? this.membershipSearchParams.membershipCategoryID : null,
            isActive: this.membershipSearchParams.isActive ? true : false,
            sortIndex: this.membershipSearchParams.SortIndex,
            sortOrder: this.membershipSearchParams.SortOrder,
            pageNumber: this.appPagination.pageNumber,
            pageSize: this.appPagination.pageSize,
        };

        this._httpService.get(MembershipApi.getAll, params)
            .subscribe((response: ApiResponse) => {
                if(response && response.MessageCode > 0){
                this.isDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    if (response.Result.length > 0) {
                        this.appPagination.totalRecords = response.TotalRecord;
                    }
                    else {
                        this.appPagination.totalRecords = 0;
                    }
                    this.memberships = response.Result;
                    // this.setMembershipTypeName();

                }
                else {
                    this.appPagination.totalRecords = 0;
                }
            }else{
                this._messageService.showErrorMessage(response.MessageText);
            }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Membership")); }
            );
    }

    viewMembershipDetail(membershipId: number) {

        var data = {
            MembershipID: membershipId,
            CustomerMembershipID: 0
        };

        this._dialoge.open(MembershipViewComponent,
            {
                disableClose: true,
                data: data,
            });
    }

    // setMembershipTypeName() {
    //     this.memberships.forEach((membership: MembershipList) => {
    //         switch (membership.MembershipTypeID) {
    //             case this.membershipType.TimeBased:
    //                 membership.MembershipTypeName = this.membershipTypeNames.TimeBased;
    //                 break;
    //             case this.membershipType.TimeAndSessionBased:
    //                 membership.MembershipTypeName = this.membershipTypeNames.TimeAndSessionBased;
    //                 break;
    //             case this.membershipType.ClassBased:
    //                 membership.MembershipTypeName = this.membershipTypeNames.ClassBased;
    //                 break;
    //             case this.membershipType.ClassAndSessionBased:
    //                 membership.MembershipTypeName = this.membershipTypeNames.ClassAndSessionBased;
    //                 break;
    //         }
    //     });
    // }

    resetMembershipSearch() {
        this.membershipSearchParams = new SearchMembership();
        //this.membershipSearch.membershipTypeID = 0;
        this.membershipSearch.membershipName = "";
        this.membershipSearch.membershipCategoryID = 0;
        this.membershipSearch.isActive = 1;
        this.appPagination.resetPagination();
        this.getMemberships();
    }
}
