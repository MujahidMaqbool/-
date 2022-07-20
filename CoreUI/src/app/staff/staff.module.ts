import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DxChartModule, DxDateBoxModule, DxSchedulerModule, DxButtonModule, DxValidatorModule, DxFormModule, DxSwitchModule } from 'devextreme-angular';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';

import { StaffRoutingModule } from 'src/app/staff/staff-routing.module';
import { StaffDocumentComponent } from 'src/app/staff/documents/search/search.staff.document.component';
import { SearchStaffComponent } from "src/app/staff/search/search.staff.component";
import { ViewStaffDetail } from "src/app/staff/view-staff-detail/view.staff.detail.component";
import { SharedModule } from 'src/app/shared/shared-module';
import { StaffMainNavigation } from './navigation/main/staff.main.navigation.component';
import { StaffDetailNavigationComponent } from './navigation/detail/staff.detail.navigation.component';
import { SaveStaffDetailsComponent } from './save/save.staff.details.component';
import { UploadStaffDocument } from './documents/upload/upload.staff.document.component';
import { StaffNextOfKinComponent } from './next-of-kin/staff.next.of.kin.component';
import { StaffDashboard } from './dashboard/staff.dashboard.component';
import { SearchShiftTemplateComponent } from './attendance/shift-template/search.shift.template.component';
import { SaveShiftTemplateComponent } from './attendance/shift-template/save.shift.template.component';
import { AttendanceTimeSheetComponent } from './attendance/timesheet/attendance.timesheet.component';
import { ShiftCalendarComponent } from './attendance/shift/shift.calendar.component';
import { SaveSchedulerStaffShiftComponent } from './attendance/shift/save/save.staff.shift.component';
import { AttendanceCalendarComponent } from './attendance/calendar/attendance.calendar.component';
import { SaveStaffAttendanceComponent } from './attendance/save/save.staff.attendance.component';
import { StaffTaskComponent } from './task/staff.task.component';
import { SearchStaffActivityComponent } from './activities/search/search.staff.activity.component';
import { SaveStaffActivityComponent } from './activities/save/save.staff.activity.component';
import { ViewStaffTaskComponent } from './activities/view/view.staff.task.component';
import { BranchAssociationComponent } from './branch-association/branch.association.component';
import { ViewStaffAssociationComponent } from './branch-association/view-staffassociation-popup/view.staff.association.popup';
import { UnArchivedStaffComponent } from './archived-staff/staff.unarchive.component';
import { SetupModule } from 'src/app/setup/setup.module';
import { CanProvideServicePopup } from './canprovide-serivce-popup/canprovide.serivce.popup';
import { EditEmailComponent } from './edit-email/edit.email.component';
import { SharedPaginationModule } from 'src/app/shared-pagination-module/shared-pagination-module';
import { StaffFormsComponent } from './staff-forms/staff.form.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { ApplicationDialogSharedModule } from 'src/app/application-dialog-module/application-dialog-module';
import { SaveTaskComponent } from './task/save/save.task.component';
import { ApplicationPipesModule } from 'src/app/application-pipes/application.pipes.module';
import { GeoLocationComponent } from './attendance/geo-location/geo.location.component';
import { GoogleMapsModule } from '@angular/google-maps'



@NgModule({
  imports: [
    CommonModule,
    StaffRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatAutocompleteModule,
    DxChartModule,
    DxDateBoxModule,
    DxSchedulerModule,
    DxButtonModule,
    DxValidatorModule,
    DxFormModule,
    DxSwitchModule,
    InternationalPhoneNumberModule,
    SetupModule,
    MatDialogModule,
    SharedPaginationModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule,
    GoogleMapsModule
  ],
  declarations: [
    StaffMainNavigation,
    StaffDetailNavigationComponent,
    StaffDashboard,
    StaffDocumentComponent,
    UploadStaffDocument,
    SearchStaffComponent,
    SaveStaffDetailsComponent,
    ViewStaffDetail,
    StaffNextOfKinComponent,
    SearchShiftTemplateComponent,
    SaveShiftTemplateComponent,
    AttendanceTimeSheetComponent,
    ShiftCalendarComponent,
    SaveSchedulerStaffShiftComponent,
    AttendanceCalendarComponent,
    SaveStaffAttendanceComponent,
    StaffTaskComponent,
    SearchStaffActivityComponent,
    SaveStaffActivityComponent,
    ViewStaffTaskComponent,
    BranchAssociationComponent,
    ViewStaffAssociationComponent,
    UnArchivedStaffComponent,
    CanProvideServicePopup,
    EditEmailComponent,
    StaffFormsComponent,
    SaveTaskComponent,
    GeoLocationComponent

  ],
  entryComponents: [
    ViewStaffDetail,
    GeoLocationComponent,
    UploadStaffDocument,
    SaveShiftTemplateComponent,
    SaveSchedulerStaffShiftComponent,
    SaveStaffAttendanceComponent,
    SaveStaffActivityComponent,
    ViewStaffTaskComponent,
    BranchAssociationComponent,
    ViewStaffAssociationComponent,
    UnArchivedStaffComponent,
    CanProvideServicePopup,
    EditEmailComponent
  ]
})
export class StaffModule { }
