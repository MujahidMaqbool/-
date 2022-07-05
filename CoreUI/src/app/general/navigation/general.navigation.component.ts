import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ENU_HomeRedirect } from "@app/helper/config/app.enums";
import { AuthService } from "@app/helper/app.auth.service";
import {
  ENU_Permission_Module,
  ENU_Permission_Home,
} from "@app/helper/config/app.module.page.enums";

@Component({
  selector: "general-navigation",
  templateUrl: "./general.navigation.component.html",
})
export class GeneralNavigationComponent {
  allowedPages = {
    isNotificationView: false,
    isTodaytaskView: false,
    homeDashboard: false,
  };
  constructor(private router: Router, private _authService: AuthService) {
    this.setPermissions();
  }

  setPermissions() {
    this.allowedPages.isNotificationView = this._authService.hasPagePermission(
      ENU_Permission_Module.General,
      ENU_Permission_Home.StaffNotification
    );
    this.allowedPages.homeDashboard = this._authService.hasPagePermission(
        ENU_Permission_Module.General,
        ENU_Permission_Home.HomeDashboard
      );
    this.allowedPages.isTodaytaskView = this._authService.hasPagePermission(
      ENU_Permission_Module.General,
      ENU_Permission_Home.TodayTask
    );
  }
}
