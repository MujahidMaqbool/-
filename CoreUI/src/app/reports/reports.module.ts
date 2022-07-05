import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ReportsRoutingModule } from '@reports/reports.routing.module';

import { ReportsNavigationComponent } from '@reports/navigation/reports.navigation.component';
import { MemberReportComponent } from '@reports/member/member.reports.component';
import { LeadReportsComponent } from '@reports/lead/lead.reports.component';
import { StaffReportsComponent } from '@reports/staff/staff.reports.component';
import { ClientReportComponent } from '@reports/client/client.reports.component';
import { SaleReportsComponent } from './sale/sale.reports.component';
import { CommonReportsComponent } from './common/common.reports.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicationDialogSharedModule } from '@app/application-dialog-module/application-dialog-module';
import { AllSaleHistoryReportComponent } from './common/all.sale.history.report/all.sale.history.report.component';
import { AllSaleBookedDetailReportComponent } from './common/all.sale.booked.detail.report/all.sale.booked.detail.report.component';
import { SharedModule } from '@app/shared/shared-module';
import { ApplicationPipesModule } from '@app/application-pipes/application.pipes.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,

    ReportsRoutingModule,
    MatTooltipModule,
    ApplicationDialogSharedModule,
    SharedModule,
    ApplicationPipesModule
  ],
  declarations: [
    ReportsNavigationComponent,
    MemberReportComponent,
    LeadReportsComponent,
    StaffReportsComponent,
    ClientReportComponent,
    SaleReportsComponent,
    CommonReportsComponent,
    AllSaleHistoryReportComponent,
    AllSaleBookedDetailReportComponent
  ]
})
export class ReportsModule { }
