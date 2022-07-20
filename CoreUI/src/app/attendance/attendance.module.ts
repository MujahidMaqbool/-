import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import your library
import { SlickCarouselModule } from 'ngx-slick-carousel';

import { AttendanceRoutingModule } from './attendance.routing.module';

import { StaffAttendanceComponent } from './staff/staff.attendance.component';
import { StaffAttendanceSuccessPopup } from './staff/staff.attendance.success.popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MemberAttendanceComponent } from './member/member.attendance.component';
import { MemberAttendanceDetailsComponent } from 'src/app/attendance/member/attendance-details/member.attendance.details.component';
import { TimeClockComponent } from './shared/time.clock.component';
import { ApplicationPipesModule } from 'src/app/application-pipes/application.pipes.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    SlickCarouselModule,

    MatDialogModule,

    AttendanceRoutingModule,
    ApplicationPipesModule
  ],
  declarations: [
    StaffAttendanceComponent,
    StaffAttendanceSuccessPopup,
    MemberAttendanceComponent, 
    MemberAttendanceDetailsComponent,
    TimeClockComponent
  ],
  entryComponents: [
    StaffAttendanceSuccessPopup
  ]
})
export class AttendanceModule { }
