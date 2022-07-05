import { Component } from "@angular/core";
import { AuthService } from "@app/helper/app.auth.service";
import { ENU_Permission_Module } from "@app/helper/config/app.module.page.enums";


@Component({
    selector :'reports.navigation',
    templateUrl:'./reports.navigation.component.html'
})
export class ReportsNavigationComponent {


    allowedModules = {
        MemberReport: false,
        ClientReport: false,
        StaffReport: false,
        LeadReport: false,
        CustomerReport: false
      };
      
      constructor(private _authService: AuthService) {
        this.setPermissions();
    }


      setPermissions() {
        this.allowedModules.CustomerReport = this._authService.hasModulePermission(ENU_Permission_Module.Customer);
        this.allowedModules.ClientReport = this._authService.hasModulePermission(ENU_Permission_Module.Customer);
        this.allowedModules.LeadReport = this._authService.hasModulePermission(ENU_Permission_Module.Lead);
        this.allowedModules.MemberReport = this._authService.hasModulePermission(ENU_Permission_Module.Customer);
        this.allowedModules.StaffReport = this._authService.hasModulePermission(ENU_Permission_Module.Staff);
    }

}