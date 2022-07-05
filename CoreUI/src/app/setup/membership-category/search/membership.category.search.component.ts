/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';


/********************** Angular Material References *********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** START: Application Components *********************/
import { MembershipCategorySaveComponent } from '../save/membership.category.save.component';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';

/********************** START: Service & Models & Enums *********************/
import { HttpService } from '@services/app.http.service';
import { AuthService } from '@app/helper/app.auth.service';
import { MessageService } from '@services/app.message.service';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { SearchMembershipCategory, MembershipCategory } from '@app/setup/models/membership.category.model';

/********************** START: Common *********************/
import { Messages } from '@app/helper/config/app.messages';
import { Configurations } from '@app/helper/config/app.config';
import { MembershipCategoryApi } from '@app/helper/config/app.webapi';


@Component({
  selector: 'app-membership-category-search',
  templateUrl: './membership.category.search.component.html'
})
export class MembershipCategorySearchComponent implements OnInit {

    // #region Local Members

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;

    isAllowedSave: boolean = false;
    previousPageSize = 0;

    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    errorMessage: string;
    successMessage: string;
    currencyFormat: string;

    /***********Pagination And Sorting *********/
    sortOrder_ASC = Configurations.SortOrder_ASC;
    sortOrder_DESC = Configurations.SortOrder_DESC;
    sortOrder: string;
    totalRecords: number = 0;
    defaultPageSize = Configurations.DefaultPageSize;
    pageSizeOptions = Configurations.PageSizeOptions;
    pageNumber: number = 1;
    pageIndex: number = 0;
    isExpand: boolean = true;
    inputName: string = '';
    isDataExists: boolean = false;

    /*********** Models **********/
    membershipCategorySearchParams: SearchMembershipCategory = new SearchMembershipCategory();
    membershipCategories: MembershipCategory[] = [];
    membershipCategorieModel: MembershipCategory = new MembershipCategory();

    /*********** Dailog Refferences **********/
    deleteDialogRef: any;

  constructor(
    private _authService: AuthService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dialog: MatDialogService
  ) {
    this.membershipCategorySearchParams = new SearchMembershipCategory();
    this.sortOrder = this.sortOrder_ASC;
    this.membershipCategorySearchParams.SortOrder = this.sortOrder_ASC;
  }

  ngOnInit() {
    this.setPermissions();
   }

  ngAfterViewInit() {
    setTimeout(() => {
      this.appPagination.paginator.pageSize = this.appPagination.pageSize;
      this.getMembershipCategories();
    });
  }

  // #region Events

  setPermissions() {
    this.isAllowedSave = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.MembershipCategory_Save);
}

  changeSorting(sortIndex: number) {
    this.membershipCategorySearchParams.SortIndex = sortIndex;
    this.membershipCategorySearchParams.SortOrder = this.membershipCategorySearchParams.SortOrder == this.sortOrder_DESC ? this.sortOrder_ASC : this.sortOrder_DESC;
    this.getMembershipCategories();
  }

  onAddClick() {
    this.openDialogForMembershipCategory(0);
  }

  onEditClick(membershipCategoryID: number) {
    this.openDialogForMembershipCategory(membershipCategoryID);
  }

  reciviedPagination(pagination: boolean) {
    if (pagination)
        this.getMembershipCategories();
  }

  // Search Membership
  searhMembership() {
    this.membershipCategorySearchParams.membershipCategoryName;
    this.membershipCategorySearchParams.IsActive;
    this.appPagination.paginator.pageIndex = 0;
    this.appPagination.pageNumber = 1;
    this.getMembershipCategories();
  }

  // Reset Filter
  resetSearchFilters() {
    this.membershipCategorySearchParams = new SearchMembershipCategory();
    this.membershipCategorySearchParams.SortOrder = this.sortOrder_DESC;
    this.appPagination.resetPagination();
    this.getMembershipCategories();
  }

  openDialogForMembershipCategory(membershipCategoryID: number) {
    if (membershipCategoryID > 0) {
      this.getMembershipCategoryById(membershipCategoryID);
    }
    else {
      this.membershipCategorieModel = new MembershipCategory();
      this.openDialog();
    }
  }

  openDialog() {
    const editDialogRef = this._dialog.open(MembershipCategorySaveComponent, {
      disableClose: true,
      data: this.membershipCategorieModel
    });

    editDialogRef.componentInstance.membershipCategorySaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this.resetSearchFilters();
      }
    });
  }

  // # end region Events

  // #region Method

  getMembershipCategoryById(membershipCategoryID: number) {
    this._httpService.get(MembershipCategoryApi.getByID + membershipCategoryID)
      .subscribe(data => {
        if(data && data.MessageCode){
        this.membershipCategorieModel = data.Result;
        this.openDialog();
        }else{
          this._messageService.showErrorMessage(data.MessageText);
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Membership Category")); }
      );
  }

  deleteMembershipCategory(membershipCategoryID: number) {
    this.deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { 
      disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") 
      , description: this.messages.Delete_Messages.Del_Msg_Undone}});
    this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.delete(MembershipCategoryApi.delete + membershipCategoryID)
          .subscribe((res: any) => {
            if (res && res.MessageCode) {
              if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Membership Category"));
                this.getMembershipCategories();
              }
              else if (res && res.MessageCode <= 0) {
                this._messageService.showErrorMessage(res.MessageText);
              }
              else {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Membership Category"));
              }
            }
          },
            err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Membership Category")); }
          );
      }
    })
  }

  getMembershipCategories() {
    let params = {
       categoryName: this.membershipCategorySearchParams.membershipCategoryName,
       status: this.membershipCategorySearchParams.IsActive,
       pageNumber: this.appPagination.pageNumber,
       pageSize: this.appPagination.pageSize,
       sortOrder: this.membershipCategorySearchParams.SortOrder,
   };
   this._httpService.get(MembershipCategoryApi.getAll, params)
        .subscribe(data => {
          if (data && data.MessageCode > 0) {
            this.isDataExists = data.Result && data.Result.length > 0 ? true : false;
            if (this.isDataExists) {
              this.membershipCategories = data.Result;
              this.appPagination.totalRecords = data.TotalRecord;
            }
            else {
              this.membershipCategories = [];
              this.appPagination.totalRecords = 0;
            }
          } else {
            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Membership Category"));
          }
        },
          err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Membership Category")); }
        );
  }

  // # end region Method

}
