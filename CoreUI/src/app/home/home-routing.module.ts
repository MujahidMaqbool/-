import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthenticationGuard } from "src/app/helper/app.route.guard";
import { ModulePermissionGuard } from "src/app/helper/app.permission.guard";
import { ENU_Permission_Module } from "src/app/helper/config/app.module.page.enums";

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
        loadChildren: () => import('src/app/customer/client/client.module').then(m => m.ClientModule),
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Customer },
      },
      // {
      //   path: "customer",
      //   loadChildren: "src/app/customer/customer.module#CustomerModule",
      //   canActivate: [ModulePermissionGuard],
      //   data: { module: ENU_Permission_Module.Client },
      // },
      {
        path: "scheduler",
        loadChildren: () => import('src/app/scheduler/scheduler.module').then(m => m.SchedulerModule),
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Scheduler },
      },
      {
        path: "lead",
        loadChildren: () => import('src/app/lead/lead.module').then(m => m.LeadModule),
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Lead },
      },
      {
        path: "customer",
        loadChildren: () => import('src/app/customer/customer.module').then(m => m.CustomerModule),
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Customer },
      },
      {
        path: "point-of-sale",
        loadChildren: () => import('src/app/point-of-sale/point.of.sale.module').then(m => m.PointOfSaleModule),
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.PointOfSale },
      },
      {
        path: "reports",
        loadChildren: () => import('src/app/reports/reports.module').then(m => m.ReportsModule),
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
        loadChildren: () => import('src/app/setup/setup.module').then(m => m.SetupModule),
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Setup },
      },
      {
        path: "staff",
        loadChildren: () => import('src/app/staff/staff.module').then(m => m.StaffModule),
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Staff },
      },

      {
        path: "automation",
        loadChildren: () => import('src/app/automation/automation.module').then(m => m.AutomationModule),
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Automation },
      },
      {
        path: "product",
        loadChildren: () => import('src/app/product/product.module').then(m => m.ProductModule),
        canActivate: [ModulePermissionGuard],
        data: { module: ENU_Permission_Module.Product }
      },
      {
        path: "general",
        loadChildren: () => import('src/app/general/general.module').then(m => m.GeneralModule),
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
