import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchAutomationComponent } from './search/search.automation.component';
import { AutomationMainNavigationComponent } from './navigation/automation.main.navigation.component';
import { SaveAutomationComponent } from './save/save.automation.component';
import { AutomationNavigationComponent } from './navigation/automation.navigation.component';
import { SearchLogComponent } from './log/search.log.component';
import { PagePermissionGuard } from 'src/app/helper/app.permission.guard';
import { ENU_Permission_Module, ENU_Permission_Automation } from 'src/app/helper/config/app.module.page.enums';


const routes: Routes = [
    {
        path: 'details/:AutomationID',
        component: AutomationNavigationComponent,
        children: [
            {
                path: '',
                component: SaveAutomationComponent,
                canActivate: [PagePermissionGuard],
               data: { module: ENU_Permission_Module.Automation, page: ENU_Permission_Automation.AutomationSave }
            },
        ]
    }, 

    {
        path: '',
        component: AutomationMainNavigationComponent,
        children: [
            { 
                path: '', redirectTo: 'search' ,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Automation, page: ENU_Permission_Automation.AutomationView }
            },
            { 
                path: 'search', component: SearchAutomationComponent ,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Automation, page: ENU_Permission_Automation.AutomationView }
            },
            { 
                path: 'log', component: SearchLogComponent,
                canActivate: [PagePermissionGuard],
                data: { module: ENU_Permission_Module.Automation, page: ENU_Permission_Automation.AutomationViewLog }
             },

            { path: '**', redirectTo: 'search', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AutomationRoutingModule { }
