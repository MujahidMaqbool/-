import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { ViewRole, RoleModuleList, RoleModulePageList } from '@app/setup/models/roles.model';
import { RoleApi } from '@app/helper/config/app.webapi';
import { Messages } from '@app/helper/config/app.messages';

@Component({
  selector: 'app-role-view',
  templateUrl: './role-view.component.html'
})
export class RoleViewComponent implements OnInit {

  /* Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;
  
  /*********** Local Members **********/
  isDataExists: boolean = false;
 /*********** Collection Types **********/
 viewRoleDetail: ViewRole = new ViewRole();
 viewModuleList:RoleModuleList;
 viewModulePageList:RoleModulePageList;


  constructor(
    private _dialogRef: MatDialogRef<RoleViewComponent>,
    private _httpService: HttpService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public roleID: number
  ) { }


    // #region Events

  ngOnInit() {
    this.viewRole(this.roleID);
  }
  onClosePopup(): void {
    this._dialogRef.close();
  }

   // #endregion

  // #region Methods

  viewRole(roleID: number) {

    let url = RoleApi.detail.replace("{roleID}", roleID.toString());

    this._httpService.get(url)
      .subscribe(data => {
        if (data && data.MessageCode > 0) {
          this.isDataExists = data.Result != null;
          if (this.isDataExists) {
            this.setViewToleDetail(data.Result);
          }
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error);
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error); }
      )
  };

  setViewToleDetail(Result: any) {
    this.viewRoleDetail.RoleID = Result.RoleID;
    this.viewRoleDetail.RoleName = Result.RoleName;
    Result.ModuleList.forEach(moduleObj => {

      this.viewModuleList = new RoleModuleList();
      this.viewModuleList.ModuleID = moduleObj.ModuleID;
      this.viewModuleList.ModuleName = moduleObj.ModuleName;
      this.viewModuleList.IsModuleSelected = true;
      moduleObj.ModulePageList.forEach(modulePageListObj => {
        this.viewModulePageList = new RoleModulePageList();
        this.viewModulePageList.ModulePageID = modulePageListObj.ModulePageID;
        this.viewModulePageList.ModulePageName = modulePageListObj.ModulePageName;
        this.viewModulePageList.IsPageSelected = true;

        this.viewModuleList.ModulePageList.push(this.viewModulePageList);
       
      });
      this.viewRoleDetail.RoleModuleList.push(this.viewModuleList);
    });

  }

     // #endregion
}
