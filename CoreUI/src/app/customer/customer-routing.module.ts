import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModulePermissionGuard, PagePermissionGuard } from '@app/helper/app.permission.guard';
import { ENU_Permission_ClientAndMember, ENU_Permission_Module } from '@app/helper/config/app.module.page.enums';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { MembersPaymentsComponent } from './member-payments/members.payments.component';
import { NavigationComponent } from './navigation/customer.navigation.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  {
    path: '',
    component: NavigationComponent,
    children: [
      {
        path: "",
        redirectTo: "search"
      },
      {
        path: "search",
        component: SearchComponent,
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Customer },
      },
      {
        path: 'members-payments',
        component: MembersPaymentsComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.All_Payments }
      },
      {
          path: 'main-dashboard',
          component: CustomerDashboardComponent,
          canActivate: [PagePermissionGuard],
          data: { module: ENU_Permission_Module.Customer, page: ENU_Permission_ClientAndMember.Dashboard }
      },
    ]
  },
    {
      path: "member",
      loadChildren: "@customer/member/member.module#MemberModule",
      canActivate: [ModulePermissionGuard],
      data: { module: ENU_Permission_Module.Customer },
    },
    {
      path: "client",
      loadChildren: "@customer/client/client.module#ClientModule",
      canActivate: [ModulePermissionGuard],
      data: { module: ENU_Permission_Module.Customer },
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
