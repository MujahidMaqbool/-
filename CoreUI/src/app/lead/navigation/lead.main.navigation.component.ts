import { Component } from "@angular/core";
import { AuthService } from "src/app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Lead } from "src/app/helper/config/app.module.page.enums";


@Component({
    selector: 'lead-main-navigation',
    templateUrl: './lead.main.navigation.component.html'
})

export class LeadMainNavigationComponent {
    allowedPages = {
        Dashboard: false,
        View: false,
        BusinessFlow: false
    };

    constructor(private _authService: AuthService) {
        this.setPermissions();
    }

    setPermissions() {
        this.allowedPages.Dashboard = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Dashboard);
        this.allowedPages.View = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.View);
        this.allowedPages.BusinessFlow = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.BusinessFlow_View);
    }
}