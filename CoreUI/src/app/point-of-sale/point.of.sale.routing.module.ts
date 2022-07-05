import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PointOfSaleComponent } from './pos/pos.component';
import { PointOfSaleNavigationComponent } from './navigation/pos.navigation.component';
import { PointOfSaleInvoiceHistoryComponent } from './invoice-history/pos.invoice.history.component';
import { PointOfSaleBookingComponent } from './booking/pos.booking.component';
import { POSClassBookingDetailComponent } from './booking/pos.class.booking.detail.component';
import { POSClassAttendanceComponent } from './class-attendance/pos.class.attendance.component';
import { PagePermissionGuard } from '@app/helper/app.permission.guard';
import { ENU_Permission_Module, ENU_Permission_PointOfSale } from '@app/helper/config/app.module.page.enums';
import { POSSearchFromComponent } from './forms/form.search.component';
import { WaitListComponent } from '@app/customer-shared-module/wait-list/wait-list.component';

const routes: Routes = [
  {
    path: '',
    component: PointOfSaleNavigationComponent,
    children: [
      { path: '', redirectTo: 'pos' },
      {
        path: 'pos',
        component: PointOfSaleComponent
      },
      {
        path: 'pos-history',
        component: PointOfSaleInvoiceHistoryComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.PointOfSale, page: ENU_Permission_PointOfSale.InvoiceHistory }
      },
      {
        path: 'service-bookings',
        component: PointOfSaleBookingComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.PointOfSale, page: ENU_Permission_PointOfSale.Service }
      },
      {
        path: 'class-bookings',
        component: POSClassBookingDetailComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.PointOfSale, page: ENU_Permission_PointOfSale.Class }
      },
      {
        path: 'class-attendance',
        component: POSClassAttendanceComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.PointOfSale, page: ENU_Permission_PointOfSale.Attendance }
      },
      {
        path: 'search-form',
        component: POSSearchFromComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.PointOfSale, page: ENU_Permission_PointOfSale.ViewForm }
      },
      {
        path: 'pos-waitlist',
        component: WaitListComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.PointOfSale, page: ENU_Permission_PointOfSale.ViewWaitList }
      },

      { path: '**', redirectTo: 'pos', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PointOfSaleRoutingModule { }
