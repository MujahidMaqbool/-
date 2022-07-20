import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeneralRoutingModule } from './general.routing.module';
import { GeneralNavigationComponent } from './navigation/general.navigation.component';
import { SharedModule } from 'src/app/shared/shared-module';
import { DxPieChartModule } from 'devextreme-angular/ui/pie-chart';
import { DxChartModule } from 'devextreme-angular/ui/chart';
import { ServiceNotificationDetailComponent } from './notification/service-notification/service.notification.details.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TodayTaskComponent } from './today-task/today.task.component';
import { NotificationComponent } from './notification/search-notification/notification.component';
import { ViewNotificationComponent } from './notification/view-notification/view.notification.component';
import { SharedPaginationModule } from 'src/app/shared-pagination-module/shared-pagination-module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { ApplicationDialogSharedModule } from 'src/app/application-dialog-module/application-dialog-module';
import { ApplicationPipesModule } from 'src/app/application-pipes/application.pipes.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatSelectModule,
    GeneralRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    DxPieChartModule,
    DxChartModule,
    SharedPaginationModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule
  ],
  declarations: [
    TodayTaskComponent,
    DashboardComponent,
    NotificationComponent,
    GeneralNavigationComponent,
    ServiceNotificationDetailComponent,
    ViewNotificationComponent
  ],
  entryComponents: [
    ServiceNotificationDetailComponent,
    ViewNotificationComponent
  ]
})
export class GeneralModule { }
