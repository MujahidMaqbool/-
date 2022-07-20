import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagePermissionGuard } from 'src/app/helper/app.permission.guard';
import { ENU_Permission_ClientAndMember, ENU_Permission_Module } from 'src/app/helper/config/app.module.page.enums';

import { MemberNavigationComponent } from './navigation/member.navigation.component';
import { SaveMemberPageComponent } from './save/save-member-page/save.member.page.component';
import { SearchMemberComponent } from './search/search.member.component';
import { SearchMemberActivityComponent } from './activities/search/search.member.activity.component';
import { MemberMembershipComponent } from './memberships/member.memberships.component';
import { MemberMembershipPaymentsComponent } from './membership-payments/member.membership.payments.component';
import { MemberBooking } from './bookings/member.booking.component';
import { MemberSaleHistoryComponent } from './sale-history/member.sale.history.component';
import { MemberDashboardComponent } from './dashboard/member.dashboard.component';
import { AllMembersAttendanceComponent } from 'src/app/customer/member/member-attendance/members.attendance.component';
import { MemberMainDashboardComponent } from './member-main-dashboard/member.main.dashboard.component';
import { MembershipBenefitComponent } from './membership-benefits/membership.benefit.component';
import { SearchFormsComponent } from 'src/app/customer-shared-module/customer-forms/search-forms/search.forms.component';
import { MembersPaymentsComponent } from './member-payments/members.payments.component';
import { NextOfKinComponent } from 'src/app/customer-shared-module/next-of-kin/next-of-kin.component';
import { ReferralDetailComponent } from 'src/app/customer-shared-module/referral/referral-detail.component';
import { SearchDocumentComponent } from 'src/app/customer-shared-module/documents/search/search-document.component';
import { GatewaysComponent } from 'src/app/customer-shared-module/gateways/gateways.component';
import { WaitListComponent } from 'src/app/customer-shared-module/wait-list/wait-list.component';
import { MembershipBenefitsLog } from './benefits-log/benefits.log.component';
import { SearchRewardProgramsComponent } from 'src/app/customer-shared-module/reward-programs/search-reward-programs.component';


const routes: Routes = [
    {
        path: 'details/:MemberID',
        component: MemberNavigationComponent,
        children: [
            {
                path: '',
                component: SaveMemberPageComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.SaveMember }
            },
            {
                path: 'dashboard',
                component: MemberDashboardComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.MemberIndividualDashboard }
            },
            {
                path: 'documents',
                component: SearchDocumentComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.Documents_View }
            },
            {
                path: 'activities',
                component: SearchMemberActivityComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.Activities_View }
            },
            {
                path: 'next-of-kin',
                component: NextOfKinComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.NextOfKin }
            },
            {
                path: 'reward-rograms',
                component: NextOfKinComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.NextOfKin }
            },
            {
                path: 'memberships',
                component: MemberMembershipComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.Memberships_View }
            },
            {
                path: 'payments',
                component: MemberMembershipPaymentsComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.Payments_View }
            },
            {
                path: 'referral-detail',
                component: ReferralDetailComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.ReferredBy }
            },
            {
                path: 'invoice-history',
                component: MemberSaleHistoryComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.InvoiceHistory }
            },
            {
                path: 'bookings',
                component: MemberBooking,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.BookingHistory }
            },
            {
                path: 'gateways',
                component: GatewaysComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.Gateway }
            },
            {
                path: 'search-forms',
                component: SearchFormsComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.ViewForm }
            },
            {
                path: 'benefits',
                component: MembershipBenefitComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.BenefitsView }
            },
            {
                path: 'membership-benefits-log',
                component: MembershipBenefitsLog,
                //canActivate: [PagePermissionGuard],
                //data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.BenefitsView }
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

            { path: '**', redirectTo: 'search', pathMatch: 'full' }
        ]
    },
    {
        path: 'main-dashboard',
        component: MemberMainDashboardComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.Dashboard }
    },
    {
        path: 'search',
        component: SearchMemberComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.View }
    },
    {
        path: 'members-payments',
        component: MembersPaymentsComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.All_Payments }
    },
    {
        path: 'attendance',
        component: AllMembersAttendanceComponent,
        // canActivate: [PagePermissionGuard],
        // data: { module: ENU_Permission_Module.Member, page: ENU_Permission_Member.View }
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MemberRoutingModule { }
