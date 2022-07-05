import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientMainNavigationComponent } from './navigation/client.main.navigation.component';
import { SearchClientComponent } from './search/search.client.component';
import { ClientNavigationComponent } from './navigation/client.navigation.component';
import { ClientInvoiceHistoryComponent } from './invoice-history/client.invoice.history.component';
import { SaveClientComponent } from './save/save.client.component';
import { ClientDashboardComponent } from './dashboard/client.dashboard.component';
import { SearchClientActivityComponent } from './activities/search/search.client.activity.component';
import { PagePermissionGuard } from '@app/helper/app.permission.guard';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from '@app/helper/config/app.module.page.enums';
import { ClientBookingComponent } from './bookings/client.booking.component';
import { SearchFormsComponent } from '@app/customer-shared-module/customer-forms/search-forms/search.forms.component';
import { NextOfKinComponent } from '@app/customer-shared-module/next-of-kin/next-of-kin.component';
import { SearchDocumentComponent } from '@app/customer-shared-module/documents/search/search-document.component';
import { ReferralDetailComponent } from '@app/customer-shared-module/referral/referral-detail.component';
import { GatewaysComponent } from '@app/customer-shared-module/gateways/gateways.component';
import { WaitListComponent } from '@app/customer-shared-module/wait-list/wait-list.component';
import { SearchRewardProgramsComponent } from '@app/customer-shared-module/reward-programs/search-reward-programs.component';


const routes: Routes = [
  {
    path: 'details/:ClientID',
    component: ClientNavigationComponent,
    children: [
      {
        path: '',
        component: SaveClientComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.SaveClient }
      },
      {
        path: 'invoice-history',
        component: ClientInvoiceHistoryComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.InvoiceHistory }
      },
      {
        path: 'activities',
        component: SearchClientActivityComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.Activities_View }
      },
      {
        path: 'bookings',
        component: ClientBookingComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.BookingHistory }
      },
      {
        path: 'search-forms',
        component: SearchFormsComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.ViewForm }
      },
      {
        path: 'referral-detail',
        component: ReferralDetailComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.ReferredBy }
      },
      {
      path: 'documents',
      component: SearchDocumentComponent,
      canActivate: [PagePermissionGuard],
      data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.Documents_View }
      },
      {
        path: 'next-of-kin',
        component: NextOfKinComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.NextOfKin }
      },
      {
        path: 'gateways',
        component: GatewaysComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.Gateway }
      },
      {
        path: 'waitlist',
        component: WaitListComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.WaitList_View }
      },
      {
          path: 'reward-programs',
          component: SearchRewardProgramsComponent,
          canActivate: [PagePermissionGuard],
          data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.RewardProgram_View }
      },
      { path: '**', redirectTo: '/customer/search', pathMatch: 'full' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }
