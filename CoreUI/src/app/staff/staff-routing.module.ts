import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchStaffComponent } from 'src/app/staff/search/search.staff.component';
import { StaffDetailNavigationComponent } from './navigation/detail/staff.detail.navigation.component';
import { StaffMainNavigation } from './navigation/main/staff.main.navigation.component';
import { SaveStaffDetailsComponent } from './save/save.staff.details.component';
import { StaffDocumentComponent } from './documents/search/search.staff.document.component';
import { StaffNextOfKinComponent } from './next-of-kin/staff.next.of.kin.component';
import { StaffDashboard } from './dashboard/staff.dashboard.component';
import { SearchShiftTemplateComponent } from './attendance/shift-template/search.shift.template.component';
import { AttendanceTimeSheetComponent } from './attendance/timesheet/attendance.timesheet.component';
import { ShiftCalendarComponent } from './attendance/shift/shift.calendar.component';
import { AttendanceCalendarComponent } from './attendance/calendar/attendance.calendar.component';
import { StaffTaskComponent } from './task/staff.task.component';
import { SearchStaffActivityComponent } from './activities/search/search.staff.activity.component';
import { PagePermissionGuard } from 'src/app/helper/app.permission.guard';
import { ENU_Permission_Module, ENU_Permission_Staff } from 'src/app/helper/config/app.module.page.enums';
import { StaffFormsComponent } from './staff-forms/staff.form.component';


const routes: Routes = [
  {
    path: 'details/:StaffID',
    component: StaffDetailNavigationComponent,
    children: [
      // { path: '', component: SaveStaffDetailsComponent },
      // { path: 'documents', component: StaffDocumentComponent },
      // { path: 'next-of-kin', component: StaffNextOfKinComponent },
      // { path: 'activities', component: SearchStaffActivityComponent },

      // { path: '**', redirectTo: '/staff/search', pathMatch: 'full' }
      { 
        path: '', 
        component: SaveStaffDetailsComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.Save }
      },
      { 
        path: 'documents', 
        component: StaffDocumentComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.Document_View }
      },
      { 
        path: 'next-of-kin', 
        component: StaffNextOfKinComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.NextOfKin },
      },
      { 
        path: 'activities', 
        component: SearchStaffActivityComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.Activity_View },
      },
      {
        path: 'staff-forms',
        component: StaffFormsComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.Forms }
      },
      { path: '**', redirectTo: '/staff/search', pathMatch: 'full' }
    ]
  },
  
  {
    path: '',
    component: StaffMainNavigation,
    children: [
      {
        path: '',
        redirectTo: 'search'
      },
      {
        path: 'dashboard',
        component: StaffDashboard,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.Dashboard },
      },
      {
        path: 'search',
        component: SearchStaffComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.View } 
      },
      {
        path: 'shift-template',
        component: SearchShiftTemplateComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.ShiftTemplate_View },
      },
      {
        path: 'shifts',
        component: ShiftCalendarComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.Shift_View },
      },
      {
        path: 'attendance',
        component: AttendanceCalendarComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.Attendance_View },
      },
      {
        path: 'timesheet',
        component: AttendanceTimeSheetComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.Timesheet },
      },
      {
        path: 'task',
        component: StaffTaskComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Staff, page: ENU_Permission_Staff.AllTask_View },
      },
     

      { path: '**', redirectTo: 'search', pathMatch: 'full' }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }
