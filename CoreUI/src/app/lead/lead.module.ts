import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DragDropModule } from '@angular/cdk/drag-drop';

import { DxFunnelModule, DxPieChartModule, DxChartModule } from 'devextreme-angular';

import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';

import { SharedModule } from '@app/shared/shared-module';
import { LeadRoutingModule } from './lead.routing.module';

import { LeadMainNavigationComponent } from './navigation/lead.main.navigation.component';
import { SearchLeadComponent } from './search/search.lead.component';


import { ViewLeadDetailComponent } from './view/view.lead.detail.component';
import { SaveLeadComponent } from './save/save.lead.component';
import { LeadNavigationComponent } from './navigation/lead.navigation.component';
import { SetupModule } from '@app/setup/setup.module';
import { LeadActivityComponent } from './activities/lead.activity.component';
import { LeadInvoiceHistoryComponent } from './invoice-history/lead.invoice.history.component';
import { LeadBookingsComponent } from './lead-bookings/lead.bookings.component';
import { LeadMembershipComponent } from './lead-membership/lead.membership.component';
import { LeadDashboardComponent } from './dashboard/lead.dashboard.component';
import { NgDragDropModule } from 'ng-drag-drop';
import { LeadBusinessFlowViewComponent } from './business-flow-view/lead.business.flow.component';
import { LeadLostComponent } from './lost-popup/lead.lost.popup.component';
import { MemberModule } from '@customer/member/member.module';
import { AddLeadPopupComponent } from './save/save.lead.popup.component';
import { SharedPaginationModule } from '@app/shared-pagination-module/shared-pagination-module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { CustomerSharedModule } from '@app/customer-shared-module/customer-shared-module';
import { ApplicationDialogSharedModule } from '@app/application-dialog-module/application-dialog-module';
import { ApplicationPipesModule } from '@app/application-pipes/application.pipes.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatAutocompleteModule,
    DragDropModule,
    MatDialogModule,
    MatMenuModule,
    MatSlideToggleModule,

    DxFunnelModule,
    DxPieChartModule,
    DxChartModule,
    NgDragDropModule.forRoot(),
    InternationalPhoneNumberModule,

    LeadRoutingModule,
    SharedModule,
    MemberModule,
    SetupModule,
    SharedPaginationModule,
    CustomerSharedModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule

  ],
  declarations: [
    LeadMainNavigationComponent,
    LeadNavigationComponent,

    SearchLeadComponent,
    ViewLeadDetailComponent,
    SaveLeadComponent,
    AddLeadPopupComponent,
    LeadActivityComponent,
    LeadInvoiceHistoryComponent,
    LeadBookingsComponent,
    LeadMembershipComponent,
    LeadDashboardComponent,
    LeadBusinessFlowViewComponent,
    LeadLostComponent

  ],
  entryComponents: [
    ViewLeadDetailComponent,
    LeadLostComponent,
    AddLeadPopupComponent
  ]
})
export class LeadModule { }
