import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StaffAttendanceComponent } from './staff/staff.attendance.component';
import { MemberAttendanceComponent } from './member/member.attendance.component';
import { PagePermissionGuard } from '@app/helper/app.permission.guard';
import { ENU_Permission_Module,ENU_Permission_Individual } from '@app/helper/config/app.module.page.enums';
import { MemberAttendanceDetailsComponent } from '@app/attendance/member/attendance-details/member.attendance.details.component';

const routes: Routes = [
  {
    path: 'member/details',
    component: MemberAttendanceDetailsComponent,
  },
  {
    path: 'member',
    component: MemberAttendanceComponent,
    canActivate: [PagePermissionGuard],
    data: { module: ENU_Permission_Module.Individual, page: ENU_Permission_Individual.MemberAttendance }
  },

  {
    path: '',
    component: StaffAttendanceComponent,
    canActivate: [PagePermissionGuard],
    data: { module: ENU_Permission_Module.Individual, page: ENU_Permission_Individual.StaffAttendance }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }