/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';

/********************** Material References *********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** Services & Models *********************/
/* Models */
import { Roles, RoleSearchParameter } from 'src/app/setup/models/roles.model';


/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { AuthService } from 'src/app/helper/app.auth.service';
/********************** component & Common *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { RoleApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';
import { RoleViewComponent } from '../role-view/role-view.component';
import { ENU_Permission_Module, ENU_Permission_Setup } from 'src/app/helper/config/app.module.page.enums';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';


@Component({
  selector: 'app-role-search',
  templateUrl: './role-search.component.html'
})
export class RoleSearchComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;

  /* Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;

  /*********** Local Members **********/
  isDataExists: boolean = false;


  /*********** Collection Types **********/
  allRolesList: Roles[] = [];
  statusList = Configurations.Status;
  roleSearchParameter: RoleSearchParameter = new RoleSearchParameter();
  roleSearchParameters: RoleSearchParameter = new RoleSearchParameter();


  allowedPages = {
    Save_Role: false
  }

  constructor(private _authService: AuthService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _viewRoleDetailDialog: MatDialogService,
    private _deleteRoleDialog: MatDialogService
  ) { }

  // #region Events

  ngOnInit() {
    this.setPermissions();
  }

  // onPageChange(e: any) {
  //   if (e.pageIndex >= this.pageNumber) {
  //      Set page number
  //     this.pageNumber = ++e.pageIndex;
  //   }
  //   else {
  //     if (e.pageIndex >= 1) {
  //       this.pageNumber = --this.pageNumber;
  //     }
  //     else { this.pageNumber = 1 }
  //   }
  //   this.getAllRoles();
  // }

  ngAfterViewInit() {
    this.getAllRoles();
  }
  onResetSearchFilters() {
    this.roleSearchParameters = new RoleSearchParameter();
    this.roleSearchParameter.IsActive = 1;
    this.roleSearchParameter.RoleName = "";
    this.appPagination.resetPagination();
    this.getAllRoles();
  }

  onViewRoleDetail(roleID: number) {
    this.openDialog(roleID);
  }

  onDelete(roleID: number) {
    this.deleteRole(roleID);
  }

  // #endregion

  // #region Methods

  setPermissions() {
    this.allowedPages.Save_Role = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Role_Save);
  }

  reciviedPagination(pagination: boolean) {
    if (pagination)
      this.getAllRoles();
  }

  onSearchForm() {
    this.roleSearchParameters.RoleName = this.roleSearchParameter.RoleName;
    this.roleSearchParameters.IsActive = this.roleSearchParameter.IsActive;
    this.appPagination.paginator.pageIndex = 0;
    this.appPagination.pageNumber = 1;
    this.getAllRoles();
  }

  getAllRoles() {

    let params = {
      roleName: this.roleSearchParameters.RoleName,
      isActive: this.roleSearchParameters.IsActive ? true : false,
      pageNumber: this.appPagination.pageNumber,
      pageSize: this.appPagination.pageSize
    }

    this._httpService.get(RoleApi.getAll, params)
      .subscribe(data => {
        if (data && data.MessageCode > 0) {
          this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
          if (this.isDataExists) {
            this.allRolesList = data.Result;
            this.appPagination.totalRecords = data.TotalRecord;
          }
          else {
            this.allRolesList = [];
            this.appPagination.totalRecords = 0;
          }
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Role"));
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Role")); }
      )
  }

  openDialog(roleID: number) {
    this._viewRoleDetailDialog.open(RoleViewComponent, {
      disableClose: true,
      data: roleID
    });
  };

  deleteRole(roleID: number) {
    const deleteDialogRef = this._deleteRoleDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.get(RoleApi.delete + "?roleID=" + roleID)
          .subscribe((res: any) => {
            if (res && res.MessageCode) {
              if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Role"));
                this.getAllRoles();
              }
              else if (res && res.MessageCode < 0) {
                this._messageService.showErrorMessage(res.MessageText);
              }
              else {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Role"));
              }
            }
          },
            err => {
              this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Role"));
            });
      }
    })
  }

  // #endregion
}