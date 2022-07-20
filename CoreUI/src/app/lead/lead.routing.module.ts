import { LeadActivity } from './models/lead.dashboard.model';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeadMainNavigationComponent } from './navigation/lead.main.navigation.component';
import { LeadNavigationComponent } from './navigation/lead.navigation.component';
import { SearchLeadComponent } from './search/search.lead.component';
import { SaveLeadComponent } from './save/save.lead.component';
import { LeadActivityComponent } from './activities/lead.activity.component';
import { LeadInvoiceHistoryComponent } from './invoice-history/lead.invoice.history.component';
import { LeadDashboardComponent } from './dashboard/lead.dashboard.component';
import { LeadBusinessFlowViewComponent } from './business-flow-view/lead.business.flow.component';
import { LeadMembershipComponent } from './lead-membership/lead.membership.component';
import { LeadBookingsComponent } from './lead-bookings/lead.bookings.component';

import { PagePermissionGuard } from 'src/app/helper/app.permission.guard';
import { ENU_Permission_Module, ENU_Permission_Lead } from 'src/app/helper/config/app.module.page.enums';
import { SearchFormsComponent } from 'src/app/customer-shared-module/customer-forms/search-forms/search.forms.component';
import { ReferralDetailComponent } from 'src/app/customer-shared-module/referral/referral-detail.component';
import { SearchDocumentComponent } from 'src/app/customer-shared-module/documents/search/search-document.component';
import { NextOfKinComponent } from 'src/app/customer-shared-module/next-of-kin/next-of-kin.component';
import { GatewaysComponent } from 'src/app/customer-shared-module/gateways/gateways.component';
import { WaitListComponent } from 'src/app/customer-shared-module/wait-list/wait-list.component';
import { SearchRewardProgramsComponent } from 'src/app/customer-shared-module/reward-programs/search-reward-programs.component';


const routes: Routes = [
    {
        path: 'details/:LeadID',
        component: LeadNavigationComponent,
        children: [
            {
                path: '',
                component: SaveLeadComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.Save }
            },
            {
                path: 'activities',
                component: LeadActivityComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.Activities_View }
            },
            {
                path: 'invoice-history',
                component: LeadInvoiceHistoryComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.InvoiceHistory }
            },
            {
                path: 'lead-membership',
                component: LeadMembershipComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.Memberships_View }
            },
            {
                path: 'bookings',
                component: LeadBookingsComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.BookingHistory }
            },
            {
                path: 'search-forms',
                component: SearchFormsComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.ViewForm }
            },
            {
                path: 'referral-detail',
                component: ReferralDetailComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.ReferredBy }
              },
              {
              path: 'documents',
              component: SearchDocumentComponent,
              canActivate: [PagePermissionGuard],
              data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.Documents_View }
              },
              {
                path: 'next-of-kin',
                component: NextOfKinComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.NextOfKin }
              },
              {
                path: 'gateways',
                component: GatewaysComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.Gateway }
              },
              {
                path: 'reward-programs',
                component: SearchRewardProgramsComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.RewardProgram_View }
              },
              {
                path: 'waitlist',
                component: WaitListComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.WaitList_View }
              },
            { path: '**', redirectTo: '/lead', pathMatch: 'full' }
        ]
    },
    {
        path: '',
        component: LeadMainNavigationComponent,
        children: [
            { path: '', redirectTo: 'search' },
            {
                path: 'dashboard',
                component: LeadDashboardComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.Dashboard }
            },
            {
                path: 'search',
                component: SearchLeadComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.View }
            },
            {
                path: 'business-flow',
                component: LeadBusinessFlowViewComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Lead, page: ENU_Permission_Lead.BusinessFlow_View }
            },
            { path: '**', redirectTo: '/lead/search', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LeadRoutingModule { }
