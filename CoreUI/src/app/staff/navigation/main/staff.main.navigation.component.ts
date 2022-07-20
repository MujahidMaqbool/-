import { Component } from "@angular/core";
import { AuthService } from "src/app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Staff } from "src/app/helper/config/app.module.page.enums";

@Component({
  selector: 'staff-main-navigation',
  templateUrl: './staff.main.navigation.component.html'
})

export class StaffMainNavigation {

  allowedPages = {
    Dashboard: false,
    AllStaff: false,
    ShiftTemplate: false,
    Shift: false,
    Attendance: false,
    Timesheet: false,
    AllTask: false
  };

  constructor(private _authService: AuthService) {
    this.setPermissions();
  }

  setPermissions() {
    this.allowedPages.Dashboard = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Dashboard);
    this.allowedPages.AllStaff = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.View);
    this.allowedPages.ShiftTemplate = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.ShiftTemplate_View);
    this.allowedPages.Shift = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Shift_View);
    this.allowedPages.Attendance = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Attendance_View);
    this.allowedPages.Timesheet = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Timesheet);
    this.allowedPages.AllTask = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.AllTask_View);
  }
}
