import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { DxChartModule, DxDateBoxModule, DxValidatorModule } from 'devextreme-angular';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';

import { SharedModule } from '@app/shared/shared-module';

import { ClientRoutingModule } from './client.routing.module';
import { ClientMainNavigationComponent } from './navigation/client.main.navigation.component';
import { ClientNavigationComponent } from './navigation/client.navigation.component';
import { SearchClientComponent } from './search/search.client.component';
import { SaveClientComponent } from './save/save.client.component';
import { ClientInvoiceHistoryComponent } from './invoice-history/client.invoice.history.component';
import { ViewClientDetailComponent } from './view/view.client.detail.component';
import { SaveClientPopupComponent } from './save/save.client.popup.component';
import { ClientDashboardComponent } from './dashboard/client.dashboard.component';
import { SearchClientActivityComponent } from './activities/search/search.client.activity.component';
import { SaveClientActivityComponent } from './activities/save/save.client.activity.component';
import { ClientBookingComponent } from './bookings/client.booking.component';
import { SharedPaginationModule } from '@app/shared-pagination-module/shared-pagination-module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomerSharedModule } from '@app/customer-shared-module/customer-shared-module';
import { ApplicationDialogSharedModule } from '@app/application-dialog-module/application-dialog-module';
import { BranchSubscribeComponent } from './branch-subscribe/branch.subscribe.component';
import { ApplicationPipesModule } from '@app/application-pipes/application.pipes.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatPaginatorModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatTooltipModule,

    DxChartModule,
    DxDateBoxModule,
    DxValidatorModule,

    InternationalPhoneNumberModule,

    ClientRoutingModule,
    SharedModule,
    SharedPaginationModule,
    CustomerSharedModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule
  ],
  declarations: [
    ClientMainNavigationComponent,
    ClientNavigationComponent,
    ClientDashboardComponent,
    SearchClientComponent,
    SaveClientComponent,
    SaveClientPopupComponent,
    ClientInvoiceHistoryComponent,
    ViewClientDetailComponent,
    SearchClientActivityComponent,
    SaveClientActivityComponent,
    ClientBookingComponent,
    BranchSubscribeComponent
  ],
  entryComponents: [
    ViewClientDetailComponent,
    SaveClientPopupComponent,
    SaveClientActivityComponent
  ]
})
export class ClientModule { }
