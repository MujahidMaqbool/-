/********************* Angular References ********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { SubscriptionLike } from 'rxjs';

/********************* Material Reference ********************/
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
/********************* Services & Models ********************/
/* Services */
import { MessageService } from '@app/services/app.message.service';

/* Models*/
import { StaffSearchParameter, StaffView, StaffSearchParameters } from '@app/staff/models/staff.model';

/********************** Common ***************************/
import { Configurations } from '@helper/config/app.config'
import { StaffApi } from '@helper/config/app.webapi'
import { HttpService } from '@app/services/app.http.service';
import { Messages } from '@helper/config/app.messages';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';

/********************** Components *********************************/
import { ViewStaffDetail } from '@staff/view-staff-detail/view.staff.detail.component';
import { AuthService } from '@app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Staff } from '@app/helper/config/app.module.page.enums';
import { DataSharingService } from '@app/services/data.sharing.service';
import { SessionService } from '@app/helper/app.session.service';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';


@Component({
    selector: 'search-staff',
    templateUrl: './search.staff.component.html'
})

export class SearchStaffComponent implements OnInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;

    // #region Local Members
    panelOpenState: boolean = false;
    isDataExists: boolean = false;
    isStaffSaveAllowed: boolean = false;
    isStaffActivityAllowed: boolean = false;
    isSuperAdminLoggedIn: boolean;
    loggedInStaffId: number;

    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    errorMessage: string;
    successMessage: string;
    messages = Messages;

    /* Models Refences */
    staffSearchParameter = new StaffSearchParameter();
    staffSearchFilterParams: StaffSearchParameters = new StaffSearchParameters();
    staffSearchFundamentals: any;
    staffPositionList: any;
    statusList: any;
    staffGridDataObj: any;
    staffViewDetailDataObj: StaffView;

    
    sortIndex: number = 1;
    sortOrder_ASC: string = Configurations.SortOrder_ASC;
    sortOrder_DESC: string = Configurations.SortOrder_DESC;
    sortOrder: string;
    postionSortOrder: string;
    isPositionOrderASC: boolean = undefined;
    isStaffNameOrderASC: boolean = true;
    isSearchByPageIndex: boolean = false;

    loggedInStaffIdSubscription: SubscriptionLike;

    // #endregion 

    constructor(
        private _authService: AuthService,
        private _staffService: HttpService,
        private _staffActionDialog: MatDialogService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService
    ) { }

    ngOnInit() {
        this.getStaffSearchFundamentals();
        this.sortOrder = this.sortOrder_ASC;
        this.postionSortOrder = this.sortOrder_ASC;
        this.isStaffSaveAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Save);
        this.isStaffActivityAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Activity_View);

        this.loggedInStaffIdSubscription = this._dataSharingService.loggedInStaffID.subscribe((staffId: number) => {
            this.loggedInStaffId = staffId;
        })
    }
    ngOnDestroy() {
        this.loggedInStaffIdSubscription.unsubscribe();
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.appPagination.paginator.pageSize = this.appPagination.pageSize;
            this.getStaff();
        });
    }

    // #region Events


    changeSorting(sortIndex: number) {
        this.sortIndex = sortIndex;
        this.staffSearchParameter.SortIndex = this.sortIndex ;
        if (sortIndex == 1) {
            this.isPositionOrderASC = undefined;
            if (this.sortOrder == this.sortOrder_ASC) {
                this.sortOrder = this.sortOrder_DESC;
                this.staffSearchParameter.SortOrder = this.sortOrder
                this.isStaffNameOrderASC = false;
                this.getStaff();
            }
            else {
                this.sortOrder = this.sortOrder_ASC;
                this.staffSearchParameter.SortOrder = this.sortOrder
                this.getStaff();
                this.isStaffNameOrderASC = true;
            }
        }

        if (sortIndex == 2) {
            this.isStaffNameOrderASC = undefined;
            if (this.postionSortOrder == this.sortOrder_ASC) {
                this.isPositionOrderASC = true;
                this.sortOrder = this.sortOrder_ASC;
                this.staffSearchParameter.SortOrder = this.sortOrder
                this.getStaff();
                 this.postionSortOrder = this.sortOrder_DESC
            }
            else {
                this.sortOrder = this.sortOrder_DESC;
                this.staffSearchParameter.SortOrder = this.sortOrder
                this.getStaff();
                this.isPositionOrderASC = false;
                this.postionSortOrder = this.sortOrder_ASC;
            }
        }
    }

    openDialog() {
        this._staffActionDialog.open(ViewStaffDetail, {
            disableClose: true,
            data: this.staffViewDetailDataObj,
        });

    }

    // #endregion   

    // #region methods

    getStaffSearchFundamentals() {
        this._staffService.get(StaffApi.searchFundamentals)
            .subscribe(data => {
                this.staffSearchFundamentals = data.Result;
                this.staffPositionList = data.Result.StaffPositionList;
                this.statusList = data.Result.StatusList;
                this.setDefaultDrowdown();
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
                });
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getStaff();
    }

    getStaff() {

        this.staffSearchFilterParams.PageNumber = this.appPagination.pageNumber;
        this.staffSearchFilterParams.PageSize = this.appPagination.pageSize;
        this.staffSearchFilterParams.SortIndex = this.staffSearchParameter.SortIndex;
        this.staffSearchFilterParams.SortOrder = this.staffSearchParameter.SortOrder;

        this._staffService.get(StaffApi.getAll, this.staffSearchFilterParams)
            .subscribe(data => {
                this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                this.isSuperAdminLoggedIn = SessionService.IsStaffSuperAdmin();
                if (this.isDataExists) {
                    if (data.Result.length > 0) {
                        this.appPagination.totalRecords = data.TotalRecord;
                    }
                    else {
                        this.appPagination.totalRecords = 0;
                    }

                    this.staffGridDataObj = data.Result;
                }
            });
    }

    staffSearch() {
        this.staffSearchFilterParams = new StaffSearchParameters();
        this.staffSearchFilterParams.StaffName = this.staffSearchParameter.StaffName;
        this.staffSearchFilterParams.CardNumber = this.staffSearchParameter.CardNumber;
        this.staffSearchFilterParams.StaffPositionID = this.staffSearchParameter.StaffPositionID;
        this.staffSearchFilterParams.IsActive = this.staffSearchParameter.IsActive ? true : false;
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getStaff();
    }

    resetStaffSearchFilters() {
        this.staffSearchFilterParams = new StaffSearchParameters()
        this.staffSearchParameter.IsActive = 1;
        this.staffSearchParameter.BranchID = 0;
        this.staffSearchParameter.StaffName = "";
        this.staffSearchParameter.StaffPositionID = 0;
        this.staffSearchParameter.CardNumber = "";
        this.appPagination.resetPagination();
        this.getStaff();
    }

    deleteStaff(Id: number) {
        const deleteDialogRef = this._staffActionDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Heading.replace("{0}", "staff ") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._staffService.delete(StaffApi.delete + Id)
                    .subscribe((res: any) => {
                        if (res && res.MessageCode) {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Staff"));
                                this.getStaff();
                            }
                            else if (res && res.MessageCode <= 0) {
                                // this._messageService.showErrorMessage(this.messages.Error.Staff_Associated_Error.replace("{0}", "Staff"));
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Staff"));
                            }
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Staff")); }
                    );
            }
        })
    }

    viewStaffDetails(Id: number) {
        this._staffService.get(StaffApi.viewStaffById + Id)
            .subscribe(
                data => {
                    this.staffViewDetailDataObj = data.Result;
                    this.openDialog();
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff"));
                });
    }


    setDefaultDrowdown() {
        this.staffPositionList.splice(0, 0, { StaffPositionID: 0, StaffPositionName: "All", IsActive: true });
    }


    // #endregion

}