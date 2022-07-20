import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//import { POSPaymentComponent } from './payment/pos.payment.component';
import { PointOfSaleComponent } from './pos/pos.component';
import { PointOfSaleRoutingModule } from "./point.of.sale.routing.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared-module';
import { POSServiceDetailComponent } from './services/pos.service.detail.component';
import { POSQueuedInvoicesComponent } from './queued-invoices/pos.queued.invoices.component';
import { ClientModule } from 'src/app/customer/client/client.module';
import { PointOfSaleNavigationComponent } from './navigation/pos.navigation.component';
import { PointOfSaleInvoiceHistoryComponent } from './invoice-history/pos.invoice.history.component';
import { PointOfSaleBookingComponent } from './booking/pos.booking.component';
import { POSClassBookingDetailComponent } from './booking/pos.class.booking.detail.component';
//import { POSClassAttendanceComponent } from './class-attendance/pos.class.attendance.component';
import { BookingStartTimerComponent } from './booking-start-timer/booking.start.timer.component';
import { SharedPaginationModule } from 'src/app/shared-pagination-module/shared-pagination-module';
import { POSSearchFromComponent } from './forms/form.search.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { ApplicationDialogSharedModule } from 'src/app/application-dialog-module/application-dialog-module';
import { StaffSearchAutoCompleteComponent } from './staff-search/staff.search.component';
import { ApplicationPipesModule } from 'src/app/application-pipes/application.pipes.module';
import { AddToWaitlistComponent } from './add-to-waitlist/add.to.waitlist.component';

import { MatSelectModule } from '@angular/material/select';
import { ClassBookingForFamilyAndFriendsComponent } from './class-booking-for-family-and-friends/class.booking.for.family.and.friends.component';
import { DxTooltipModule, DxTemplateModule } from 'devextreme-angular';
import { PosProductDetailComponent } from './pos-product-detail/pos-product-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    PointOfSaleRoutingModule,
    SharedModule,
    ClientModule,

    MatIconModule,
    MatTabsModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatExpansionModule,
    MatTooltipModule,
    SharedPaginationModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule,
    MatSelectModule,
    MatSlideToggleModule,

    DxTooltipModule,
    DxTemplateModule,
  ],
  declarations: [
    PointOfSaleComponent,
    //POSPaymentComponent,
    //posAttendeeNameFilter,
    POSQueuedInvoicesComponent,
    POSServiceDetailComponent,
    PointOfSaleNavigationComponent,
    PointOfSaleInvoiceHistoryComponent,
    PointOfSaleBookingComponent,
    POSClassBookingDetailComponent,
    //POSClassAttendanceComponent,
    BookingStartTimerComponent,
    POSSearchFromComponent,
    StaffSearchAutoCompleteComponent,
    AddToWaitlistComponent,
    ClassBookingForFamilyAndFriendsComponent,
    PosProductDetailComponent,
  ],
  entryComponents: [
    //POSPaymentComponent,
    POSQueuedInvoicesComponent,
    POSServiceDetailComponent,
    PosProductDetailComponent
  ]
})
export class PointOfSaleModule { }
