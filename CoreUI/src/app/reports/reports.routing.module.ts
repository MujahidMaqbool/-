import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportsNavigationComponent } from '@reports/navigation/reports.navigation.component';
import { MemberReportComponent } from '@reports/member/member.reports.component';
import { LeadReportsComponent } from '@reports/lead/lead.reports.component';
import { StaffReportsComponent } from '@reports/staff/staff.reports.component';
import { ClientReportComponent } from '@reports/client/client.reports.component';
import { SaleReportsComponent } from './sale/sale.reports.component';
import { CommonReportsComponent } from './common/common.reports.component';
import { ModulePermissionGuard } from '@app/helper/app.permission.guard';
import { ENU_Permission_Module} from '@app/helper/config/app.module.page.enums';

const routes: Routes = [
    {
        path: '',
        component: ReportsNavigationComponent,
        children: [
            //member-reports
            { path: '', redirectTo: '/reports/sale-reports', pathMatch: 'full', },
            {
                path: 'client-reports',
                component: ClientReportComponent,
                canActivate: [ModulePermissionGuard],
                data: { module: ENU_Permission_Module.Customer }
            },
            {
                path: 'lead-reports',
                component: LeadReportsComponent,
                canActivate: [ModulePermissionGuard],
                data: { module: ENU_Permission_Module.Lead }
            },
            {
                path: 'customer-reports',
                component: MemberReportComponent,
                canActivate: [ModulePermissionGuard],
                data: { module: ENU_Permission_Module.Customer }
            },
            {
                path: 'staff-reports',
                component: StaffReportsComponent,
                canActivate: [ModulePermissionGuard],
                data: { module: ENU_Permission_Module.Staff }
            },
            { path: 'sale-reports', component: SaleReportsComponent },
            { path: 'common-reports', component: CommonReportsComponent },



        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule { }
