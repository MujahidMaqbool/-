import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthenticationGuard } from "@app/helper/app.route.guard";
import { ModulePermissionGuard } from "@app/helper/app.permission.guard";
import { ENU_Permission_Module } from "@app/helper/config/app.module.page.enums";

import { HomeComponent } from "./home.component";
import { WelcomeComponent } from "./welcome/welcome.component";

const routes: Routes = [

  {
    path: "",
    component: HomeComponent,
    canActivate: [AuthenticationGuard],
    children: [
      {
        path: "",
        component: WelcomeComponent,
        pathMatch: "full",
      },

      //   /*
      //     23/05/2019 3:18:PM
      //     As per discussion with Iftekhar, MainDashboard and Reports will always be visible to user
      //     until we add these in packages. Temporarily code is commented to validate permission and
      //     user can activate route without permission
      //   */
      //   //canActivate: [ModulePermissionGuard],
      //   //data: { module: ENU_Permission_Module.MainDashboard }
      // },

      {
        path: "client",
        loadChildren: "@customer/client/client.module#ClientModule",
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Customer },
      },
      // {
      //   path: "customer",
      //   loadChildren: "@customer/customer.module#CustomerModule",
      //   canActivate: [ModulePermissionGuard],
      //   data: { module: ENU_Permission_Module.Client },
      // },
      {
        path: "scheduler",
        loadChildren: "@scheduler/scheduler.module#SchedulerModule",
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Scheduler },
      },
      {
        path: "lead",
        loadChildren: "@lead/lead.module#LeadModule",
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Lead },
      },
      {
        path: "customer",
        loadChildren: "@customer/customer.module#CustomerModule",
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Customer },
      },
      {
        path: "point-of-sale",
        loadChildren: "@pos/point.of.sale.module#PointOfSaleModule",
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.PointOfSale },
      },
      {
        path: "reports",
        loadChildren: "@reports/reports.module#ReportsModule",
        /*
          23/05/2019 3:18:PM
          As per discussion with Iftekhar, MainDashboard and Reports will always be visible to user
          until we add these in packages. Temporarily code is commented to validate permission and
          modules are set to 'TRUE'
        */
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Reports },
      },
      {
        path: "setup",
        loadChildren: "@setup/setup.module#SetupModule",
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Setup },
      },
      {
        path: "staff",
        loadChildren: "@staff/staff.module#StaffModule",
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Staff },
      },

      {
        path: "automation",
        loadChildren: "@automation/automation.module#AutomationModule",
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Automation },
      },
      {
        path: "product",
        loadChildren: "@product/product.module#ProductModule",
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Product }
      },
      {
        path: "general",
        loadChildren: "@general/general.module#GeneralModule",
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.General },
      },
      { path: "**", redirectTo: "dashboard", pathMatch: "full" },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule { }
