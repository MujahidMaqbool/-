import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from '@angular/core';

/********************** Angular Material Refrences *********************/
/********************** Application Components *********************/
import { BranchSaveComponent } from '@setup/branch/save/save.branch.component';
/********************** Service & Models *********************/
import { Branch, BranchForSave } from '@setup/models/branch.model';
import { ApiResponse } from '@app/models/common.model';
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { AuthService } from '@app/helper/app.auth.service';
/********************** Common and Customs *********************/
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { Messages } from '@app/helper/config/app.messages';
import { BranchApi } from '@app/helper/config/app.webapi';
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { CommonService } from '@app/services/common.service';
import { DataSharingService } from '@app/services/data.sharing.service';
import { BranchViewComponent } from '../view/view.component';

@Component({
  selector: 'search-branch',
  templateUrl: './search.branch.component.html'
})
export class BranchSearchComponent extends AbstractGenericComponent implements OnInit {

  // #region Local Members

  @ViewChild("appPagination") appPagination: AppPaginationComponent;

  isBranchSaveAllowed: boolean = false;
  branchId: number = null;
  isViewMode: boolean = true;;

  /* Collection Types */
  branches: Branch[] = [];

  /* Model Refrences*/
  branch = new BranchForSave();

  /*********** Pagination **********/
  totalRecords: number = 0;

  isDataExists: boolean = false;

  /* Messages*/
  messages = Messages;
  successMessage: string;
  errorMessage: string;
  hasSuccess: boolean = false;
  hasError: boolean = false;

  // #endregion

  constructor(
    private _authService: AuthService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dialog: MatDialogService,
    private _commonService: CommonService,
    private _dataSharingService: DataSharingService
  ) {super(); }

  // #regoin angular hooks
  ngOnInit() {
    this.isBranchSaveAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Branch_Save);
  }

  ngAfterViewInit() {
    this.getAllBranches();
  }
  // #endregion

  // #regoin Events

  /*Open dialog for edit and view branch information*/
  onEditClick(branchID: number, isViewMode: boolean) {
    this.isViewMode = isViewMode;
    this.openDialogForBranch(branchID);
  }

  // #endregion

  // #regoin Methods

  /*Get branch info and Open dialog for edit and view branch information*/
  getBranchById(branchID: number) {
    this._httpService.get(BranchApi.getByID + branchID)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.branch = res.Result;
          this.openDialog();
        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        error => this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Branch"))
      );
  }

  openDialogForBranch(branchId: number) {
    if (branchId > 0) {
      this.getBranchById(branchId);
    }
    else {
      this.branch = new BranchForSave();
      this.openDialog();
    }
  }

  /*Actual dialog for view and edit*/
  openDialog() {
    this.branch.isViewMode = this.isViewMode;
    const branchDialogRef = this._dialog.open(BranchViewComponent, {
      disableClose: true,
      data: this.branch
    });

    branchDialogRef.componentInstance.branchSaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this.getAllBranches();
      }
    })
  }

  /*pagination*/
  reciviedPagination(pagination: boolean) {
    if (pagination)
      this.getAllBranches();
  }

  /*open delete dialog popup and delete branch by id*/
  deleteBranch(branchID: number) {
    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});

    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.delete(BranchApi.delete + branchID)
          .subscribe(res => {
            if (res && res.MessageCode > 0) {
            this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Branch"));
            this.getAllBranches();
            }else{
              this._messageService.showErrorMessage(res.MessageText);

            }
          },
            err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Branch")); }
          );
      }
    })
  }

  /*Get all branches information*/
  getAllBranches() {
    let url = BranchApi.getAll.replace("{pageNumber}", this.appPagination.pageNumber.toString()).replace("{pageSize}", this.appPagination.pageSize.toString());
    this._httpService.get(url)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
        this.isDataExists = res.Result != null && res.Result.length > 0 ? true : false;
        if (this.isDataExists) {
          this.getCurrentBranchId();
          this.branches = res.Result;
          this.appPagination.totalRecords = res.TotalRecord;
        } else {
          this.branches = [];
          this.appPagination.totalRecords = 0;
        }
      }else{
        this._messageService.showErrorMessage(res.MessageText);
      }
      },
        error => this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Branch")));
  }
 async getCurrentBranchId(){
  this.branchId =  (await super.getBranchDetail(this._dataSharingService)).BranchID;
  }
  // #endregion
}
