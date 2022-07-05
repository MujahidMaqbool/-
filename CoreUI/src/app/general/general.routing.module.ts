import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagePermissionGuard, ModulePermissionGuard } from '@app/helper/app.permission.guard';
import { ENU_Permission_Module, ENU_Permission_Automation, ENU_Permission_Home } from '@app/helper/config/app.module.page.enums';
import { GeneralNavigationComponent } from './navigation/general.navigation.component';
import { TodayTaskComponent } from './today-task/today.task.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotificationComponent } from './notification/search-notification/notification.component';


const routes: Routes = [

    {
        path: '',
        component: GeneralNavigationComponent,
        children: [
            { 
                path: '', redirectTo: 'today' ,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.General, page: ENU_Permission_Home.TodayTask }
            },
            { 
                path: 'today', component: TodayTaskComponent ,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.General,page: ENU_Permission_Home.TodayTask }
            },
            {
                path: 'dashboard',
                component: DashboardComponent,
                canActivate: [ModulePermissionGuard],
                data: { module: ENU_Permission_Module.General,page: ENU_Permission_Home.HomeDashboard }
            },
            {
                path: 'notifications',
                component: NotificationComponent,
                canActivate: [ModulePermissionGuard],
                data: { module: ENU_Permission_Module.General,page: ENU_Permission_Home.StaffNotification  }
            },
            { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GeneralRoutingModule { }
