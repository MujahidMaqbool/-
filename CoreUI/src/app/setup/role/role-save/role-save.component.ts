/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
/********************** Material References *********************/

/********************** Services & Models *********************/
/* Models */
import {
  ModuleList,
  ModulePageList,
  SaveRoles,
  RoleModuleList,
  RoleModulePageList,
} from "@app/setup/models/roles.model";
import { ApiResponse } from "@app/models/common.model";

/* Services */
import { HttpService } from "@app/services/app.http.service";
import { MessageService } from "@app/services/app.message.service";
import { DataSharingService } from "@app/services/data.sharing.service";

/********************** component & Common *********************/
import { Configurations } from "@app/helper/config/app.config";
import { RoleApi } from "@app/helper/config/app.webapi";
import { Messages } from "@app/helper/config/app.messages";
import { NgForm } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import {
  ENU_Permission_Setup,
  ENU_Permission_Module,
  ENU_Permission_Staff,
  ENU_Permission_ClientAndMember,
  ENU_Permission_Lead,
  ENU_Permission_Automation,
  ENU_Permission_Home,
  ENU_Permission_Product,
} from "@app/helper/config/app.module.page.enums";

@Component({
  selector: "app-role-save",
  templateUrl: "./role-save.component.html",
})
export class RoleSaveComponent implements OnInit {
  @ViewChild("saveRoleForm") saveRoleForm: NgForm;

  /* Messages */
  messages = Messages;
  errorMessage: string;
  successMessage: string;
  saveInProgress: boolean = false;

  /*********** Local Members **********/

  /*********** Pagination **********/
  totalRecords: number = 0;
  defaultPageSize = Configurations.DefaultPageSize;
  pageSizeOptions = Configurations.PageSizeOptions;
  pageNumber: number = 1;
  pageIndex: number = 0;
  isDataExists: boolean = false;
  eNU_Permission_Setup = ENU_Permission_Setup;
  eNU_ModulePage: any;
  /*********** Collection Types **********/
  allRolesModuleList: RoleModuleList[] = [];
  allRolesGetList: RoleModuleList[] = [];
  moduleList: ModuleList[] = [];
  rolesListData: SaveRoles = new SaveRoles();

  /*********** for select module and page **********/
  selectedRoleModuleList: RoleModuleList;
  selectedModulePageList: RoleModulePageList;
  constructor(
    private _dataSharingService: DataSharingService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit() {
    let requestList = [];
    this.getRoleIdFromRoute();
    requestList.push(this.getRoleFundamentals());

    if (this.rolesListData.RoleID > 0) {
      requestList.push(this.getRoleById(this.rolesListData.RoleID));
    }
  }

  getRoleFundamentals() {
    this._httpService.get(RoleApi.getFundamentals).subscribe(
      (data) => {
        if (data && data.MessageCode > 0) {
          this.isDataExists =
            data.Result != null && data.Result.ModuleList.length > 0
              ? true
              : false;

          if (this.isDataExists) {
            this.allRolesModuleList = data.Result.ModuleList;
            this.setExtraPropertyInAllRolesList();
          }
        } else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error);
        }
      },
      (err) => {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error);
      }
    );
  }

  onModuleSelectionChange(moduleId: number, isSelected: boolean) {
    this.allRolesModuleList
      .find((m) => m.ModuleID === moduleId)
      .ModulePageList.forEach((mp) => {
        mp.IsPageSelected = isSelected;
        if (this.checkDefaultPermissionForModuleLandingPage(moduleId, mp.ModulePageID)) {
          mp.IsDashboardPage = isSelected;
        }
      });
  }

  onPageSelectionChange(moduleId: number, isSelected: boolean) {
    if (isSelected) {
      this.allRolesModuleList.forEach((moduleList) => {
        if (moduleId == moduleList.ModuleID) {
          moduleList.IsModuleSelected = true;
          this.setDashbordPageOnModulePagechange(moduleId);
        }
      });
    } else {
      this.allRolesModuleList.forEach((moduleList) => {
        if (
          moduleId == moduleList.ModuleID &&
          moduleList.ModulePageList.filter((mp) => mp.IsPageSelected).length <=
            0
        ) {
          moduleList.IsModuleSelected = false;
          this.setDashbordOnPageChange(moduleId);
        }
      });
    }
  }

  setDashbordOnPageChange(moduleId: number) {
    this.allRolesModuleList
      .find((m) => m.ModuleID == moduleId)
      .ModulePageList.forEach((mp) => {
        if (this.checkDefaultPermissionForModuleLandingPage(moduleId, mp.ModulePageID)) {
          mp.IsDashboardPage = false;
          mp.IsPageSelected = false;
        }
      });
  }

  setDashbordPageOnModulePagechange(moduleId: number) {
    this.allRolesModuleList
      .find((m) => m.ModuleID == moduleId)
      .ModulePageList.forEach((mp) => {
        if (this.checkDefaultPermissionForModuleLandingPage(moduleId, mp.ModulePageID)) {
          mp.IsDashboardPage = true;
          mp.IsPageSelected = true;
        }
      });
  }

  saveRole(isvalid: boolean) {
    if (isvalid) {
      if (this.allRolesModuleList.some((m) => m.IsModuleSelected)) {
        this.saveInProgress = true;
        this.mapAllRolesList();
        this._httpService.save(RoleApi.add, this.rolesListData).subscribe(
          (res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
              // Show Success Message and Redirect to Search
              this._messageService.showSuccessMessage(
                this.messages.Success.Save_Success.replace("{0}", "Role")
              );
              this._dataSharingService.shareUpdateRolePermission(true);
              if (this.rolesListData.RoleID <= 0) {
                this.saveRoleForm.resetForm();
              }
              this.saveInProgress = false;
              this._router.navigate(["/setup/roles"]);
            } else {
              this._messageService.showErrorMessage(res.MessageText);
              this.saveInProgress = false;
            }
          },
          (err) => {
            this._messageService.showErrorMessage(
              this.messages.Error.Save_Error.replace("{0}", "Role")
            );
            this.saveInProgress = false;
          }
        );
      } else {
        this._messageService.showErrorMessage(
          this.messages.Validation.Select_Module
        );
        this.saveInProgress = false;
      }
    }
  }

  checkDefaultPermissionForModuleLandingPage(moduleId: number, pageId: number) {
    let isDashboard = false;
    switch (moduleId) {
      case ENU_Permission_Module.Staff:
        isDashboard = pageId === ENU_Permission_Staff.View;
        break;
      case ENU_Permission_Module.Customer:
        isDashboard = pageId === ENU_Permission_ClientAndMember.View;
        break;
      case ENU_Permission_Module.Lead:
        isDashboard = pageId === ENU_Permission_Lead.View;
        break;
      case ENU_Permission_Module.Customer:
        isDashboard = pageId === ENU_Permission_ClientAndMember.View;
        break;
      case ENU_Permission_Module.Setup:
        isDashboard = pageId === ENU_Permission_Setup.Company;
        break;
      case ENU_Permission_Module.Automation:
        isDashboard = pageId === ENU_Permission_Automation.AutomationView;
        break;
      case ENU_Permission_Module.General:
        isDashboard = pageId === ENU_Permission_Home.TodayTask;
        break;
      case ENU_Permission_Module.Product:
        isDashboard = pageId === ENU_Permission_Product.Product_View;
      break;
      default:
        break;
    }
    return isDashboard;
  }

  getRoleById(roleId: number) {
    let url = RoleApi.getByID.replace(
      "{roleID}",
      this.rolesListData.RoleID.toString()
    );
    this._httpService.get(url).subscribe(
      (data) => {
        if (data && data.MessageCode > 0) {
          this.isDataExists =
            data.Result != null && data.Result.ModuleList.length > 0
              ? true
              : false;

          if (this.isDataExists) {
            this.rolesListData.Description = data.Result.Description;
            this.rolesListData.RoleName = data.Result.RoleName;
            this.allRolesGetList = data.Result.ModuleList;
            this.setExtraPropertyInAllRolesList();
          }
        } else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error);
        }
      },
      (err) => {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error);
      }
    );
  }

  mapAllRolesList() {
    this.rolesListData.ModuleList = [];
    let selectedModules = this.allRolesModuleList.filter(
      (m) => m.IsModuleSelected
    );
    selectedModules.forEach((selectedModule) => {
      let module = new ModuleList();
      module.ModuleID = selectedModule.ModuleID;
      module.ModulePageList = [];

      let selectedPages = selectedModule.ModulePageList.filter(
        (mp) => mp.IsPageSelected
      );

      selectedPages.forEach((modulePage) => {
        module.ModulePageList.push({ ModulePageID: modulePage.ModulePageID });
      });
      this.rolesListData.ModuleList.push(module);
    });
  }

  setExtraPropertyInAllRolesList() {
    this.allRolesModuleList.forEach((moduleList) => {
      if (this.allRolesGetList.length > 0) {
        this.allRolesModuleList;
        this.allRolesGetList.forEach((mo) => {
          if (mo.ModuleID == moduleList.ModuleID) {
            moduleList.IsModuleSelected = true;
            moduleList.ModulePageList.forEach((page) => {
              if (
                mo.ModulePageList.filter(
                  (mp) => mp.ModulePageID == page.ModulePageID
                ).length > 0
              ) {
                page.IsPageSelected = true;
                if (
                  this.checkDefaultPermissionForModuleLandingPage(mo.ModuleID, page.ModulePageID)
                ) {
                  page.IsDashboardPage = true;
                }
              } else {
                page.IsPageSelected = false;
              }
            });
          }
        });
      }
    });
  }

  // setAllRollsProperties() {
  //   this.allRolesModuleList.forEach(moduleList => {
  //     if (this.allRolesGetList.filter(mp => mp.ModuleID == moduleList.ModuleID)) {
  //       moduleList.IsModuleSelected = true;
  //     }
  //     else {
  //       moduleList.IsModuleSelected = false;
  //     }

  //     moduleList.ModulePageList.forEach(page => {
  //       page.IsPageSelected = false;
  //     });
  //   });
  // }

  getRoleIdFromRoute() {
    this._route.paramMap.subscribe((params) => {
      this.rolesListData.RoleID = +params.get("RoleID");
    });
  }
}
