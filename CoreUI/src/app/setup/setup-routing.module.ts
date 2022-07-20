import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';

import { WidgetComponent } from './configuration/widget/widget.component';
import { TemplateSearchComponent } from './template/search/template.search.component';
import { RoleSaveComponent } from './role/role-save/role-save.component';
import { RoleSearchComponent } from './role/role-search/role-search.component';
import { ServiceSaveComponent } from './service/save/service.save.component';
import { ServiceSearchComponent } from './service/search/service.search.component';
import { StaffPositionSearchComponent } from './staff-position/search/staff.position.search.component';
import { ServiceCategorySearchComponent } from './service-category/search/service.category.search.component';
import { BranchSearchComponent } from './branch/search/search.branch.component';
import { CompanyComponent } from './company/company.component';
import { MembershipSaveComponent } from './membership/save/membership.save.component';
import { MembershipSearchComponent } from './membership/search/membership.search.component';
import { SearchFacilityComponent } from './facility/search/search.facility.component';
import { PagePermissionGuard } from 'src/app/helper/app.permission.guard';
import { ENU_Permission_Module, ENU_Permission_Setup } from 'src/app/helper/config/app.module.page.enums';
import { SearchTaxComponent } from './taxes/search/search.tax.component';
import { AutomationTemplateSearchComponent } from './automation-template/search/automation.template.search.component';
import { ClassCategorySearchComponent } from './class-category/search/class.category.search.component';
import { ClassSearchComponent } from './class/search/class.search.component';
import { ClassSaveComponent } from './class/save/class.save.component';
import { FormSearchComponent } from './forms/search/search.form.component';
import { FormSaveComponent } from './forms/save/save.form.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { BranchSaveComponent } from './branch/save/save.branch.component';
import { SearchRewardProgramComponent } from './reward-program/search/reward.program.search.component';
import { SaveRewardProgramComponent } from './reward-program/save/reward.program.save.component';
import { MembershipCategorySearchComponent } from './membership-category/search/membership.category.search.component';


const routes: Routes = [
  {
    path: '',
    component: NavigationComponent,
    children: [
      { path: '', redirectTo: '/setup/company-details', pathMatch: 'full' },
      {
        path: 'company-details',
        component: CompanyComponent,
      },
      {
        path: 'branch',
        component: BranchSearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Branch_View }
      },
      {
        path: 'branch/save/:BranchId',
        component: BranchSaveComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Branch_Save }
      },
      {
        path: 'staff-position',
        component: StaffPositionSearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.StaffPosition_View }
      },
      {
        path: 'facility',
        component: SearchFacilityComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Facility_View }
      },
      {
        path: 'membership',
        component: MembershipSearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Membership_View }
      },
      {
        path: 'membership/save/:MembershipID',
        component: MembershipSaveComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Membership_Save }
      },
      {
        path: 'membership-category',
        component: MembershipCategorySearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.MembershipCategory_View }
      },
      {
        path: 'service-category',
        component: ServiceCategorySearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.ServiceCategory_View }
      },
      {
        path: 'service',
        component: ServiceSearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Service_View }
      },
      {
        path: 'service/save/:ServiceID',
        component: ServiceSaveComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Service_Save }
      },
      {
        path: 'class-category',
        component: ClassCategorySearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.ClassCategory_View }
      },
      {
        path: 'class',
        component: ClassSearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Class_View }
      },
      {
        path: 'class/save/:ClassID',
        component: ClassSaveComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Class_Save }
      },
      {
        path: 'template',
        component: TemplateSearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Template_View }
      },
      {
        path: 'automation-template',
        component: AutomationTemplateSearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Automation_Template_View }
      },
      {
        path: 'roles',
        component: RoleSearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Role_View }
      },
      {
        path: 'roles/save/:RoleID',
        component: RoleSaveComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Role_Save }
      },
      {
        path: 'taxes',
        component: SearchTaxComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Tax_View }
      },
      {
        path: 'form',
        component: FormSearchComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Form_View }
      },
      {
        path: 'form/save/:FormID',
        component: FormSaveComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Form_Save }
      },
      {
        path: 'configurations',
        component: ConfigurationComponent,
      },
      {
        path: 'configurations/basic',
        component: ConfigurationComponent,
      },
      {
        path: 'configurations/cancellation-policy',
        component: ConfigurationComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.CancellationPolicy_View }
      },
      {
        path: 'configurations/wait-list',
        component: ConfigurationComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.WaitList_View }
      },
      {
        path: 'configurations/payments',
        component: ConfigurationComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.GatewayIntegration }
      },
      {
        path: 'configurations/pos',
        component: ConfigurationComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.PrinterConfig }
      },
      {
        path: 'configurations/lead',
        component: ConfigurationComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.LeadStatus }
      },
      {
        path: 'configurations/widget',
        component: ConfigurationComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.Widget }
      },
      {
        path: 'configurations/actvities-color',
        component: ConfigurationComponent,
        canActivate: [PagePermissionGuard],
        data: { module: ENU_Permission_Module.Setup, page: ENU_Permission_Setup.ActivitiesColor }
      },
      {
        path: 'reward-program',
        component: SearchRewardProgramComponent,
      },
      {
        path: 'reward-program/details/:ID',
        component: SaveRewardProgramComponent,
      },
      { path: '**', redirectTo: '/' }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule { }
