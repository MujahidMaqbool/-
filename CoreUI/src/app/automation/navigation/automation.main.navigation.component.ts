import { Component } from "@angular/core";
import { AuthService } from "src/app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Automation } from "src/app/helper/config/app.module.page.enums";


@Component({
    selector: 'automation-main-navigation',
    templateUrl: './automation.main.navigation.component.html'
})

export class AutomationMainNavigationComponent {
    allowedPages = {
        AutomationSave: false,
        AutomationViewLog: false,
    };

    constructor(private _authService: AuthService) {
        this.setPermissions();
    }

    setPermissions() {
        this.allowedPages.AutomationSave = this._authService.hasPagePermission(ENU_Permission_Module.Automation, ENU_Permission_Automation.AutomationSave);
        this.allowedPages.AutomationViewLog = this._authService.hasPagePermission(ENU_Permission_Module.Automation, ENU_Permission_Automation.AutomationViewLog);
    }

}