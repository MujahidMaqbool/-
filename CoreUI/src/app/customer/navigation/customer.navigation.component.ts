import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from '@app/helper/config/app.module.page.enums';

@Component({
  selector: 'app-navigation',
  templateUrl: './customer.navigation.component.html'
})
export class NavigationComponent {
  allowedPages = {
    Dashboard: false,
    View: false,
    Payments: false
  };

  constructor(private _authService: AuthService) {
    this.setPermissions();
  }

  setPermissions() {
    this.allowedPages.Dashboard = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Dashboard);
    this.allowedPages.View = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.View);
    this.allowedPages.Payments = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.All_Payments);
  }


}
