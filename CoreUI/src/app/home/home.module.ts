import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HomeRoutingModule } from "./home-routing.module";

import { DxChartModule, DxPieChartModule } from "devextreme-angular";
import { SharedModule } from '@app/shared/shared-module';
import { SlickCarouselModule } from "ngx-slick-carousel";

import { HomeComponent } from "./home.component";
import { WelcomeComponent } from "./welcome/welcome.component";
import { ClientModule } from "@customer/client/client.module";
import { StripeReaderPopupComponent } from "./stripe.reader.popup/stripe.reader.popup.component";
import { GeneralModule } from "@app/general/general.module";
import { MatDialogModule } from "@angular/material/dialog";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatPaginatorModule } from "@angular/material/paginator";
import { ChangePasswordPopup } from "./change-password/change.password.popup.component";
import { ApplicationDialogSharedModule } from "@app/application-dialog-module/application-dialog-module";
import { MyTasksComponent } from "./my-tasks/my.tasks.component";
import { StaffProfilePopupComponent } from "./staff-profile/staff.profile.popup.component";
import { MyAttendanceTimeSheetComponent } from "./my-attendance-timesheet/my.attendance.timesheet.component";
import { InternationalPhoneNumberModule } from "ngx-international-phone-number";
import { SharedPaginationModule } from "@app/shared-pagination-module/shared-pagination-module";
import { ApplicationPipesModule } from "@app/application-pipes/application.pipes.module";
import { GatewayModule } from "@app/gateway/gateway-module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    HomeRoutingModule,
    SharedModule,
    ClientModule,
    GeneralModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatTooltipModule,

    DxChartModule,
    DxPieChartModule,
    SlickCarouselModule,
    MatPaginatorModule,
    SharedPaginationModule,
    InternationalPhoneNumberModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule,
    GatewayModule
  ],
  declarations: [
    HomeComponent,
    WelcomeComponent,
    StripeReaderPopupComponent,
    ChangePasswordPopup,
    MyTasksComponent,
    StaffProfilePopupComponent,
    MyAttendanceTimeSheetComponent
  ],

  entryComponents: [StripeReaderPopupComponent],

  providers: [],
})
export class HomeModule {}
