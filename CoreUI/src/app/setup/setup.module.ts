import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared-module';
import { SetupRoutingModule } from './setup-routing.module';
import { DxColorBoxModule, DxDateBoxModule, DxFormModule, DxValidatorModule } from 'devextreme-angular';
import { NgDragDropModule } from 'ng-drag-drop';

import { AngularCropperjsModule } from 'angular-cropperjs';

import { ActivitiesColorComponent } from './configuration/activities-color/activities.color.component';
import { CompanyComponent } from './company/company.component';
import { LeadStatusComponent } from './configuration/lead-status/lead.status.component';
import { WidgetComponent } from './configuration/widget/widget.component';
import { NavigationComponent } from './navigation/navigation.component';
import { TemplateSaveComponent } from './template/save/template.save.component';
import { TemplateSearchComponent } from './template/search/template.search.component';
import { RoleSaveComponent } from './role/role-save/role-save.component';
import { RoleSearchComponent } from './role/role-search/role-search.component';
import { RoleViewComponent } from './role/role-view/role-view.component';
import { ServiceCategorySaveComponent } from './service-category/save/service.category.save.component';
import { ServiceCategorySearchComponent } from './service-category/search/service.category.search.component';
import { ServiceSaveComponent } from './service/save/service.save.component';
import { ServiceSearchComponent } from './service/search/service.search.component';
import { StaffPositionSaveComponent } from './staff-position/save/staff.position.save.component';
import { StaffPositionSearchComponent } from './staff-position/search/staff.position.search.component';
import { BranchSearchComponent } from './branch/search/search.branch.component';
import { BranchSaveComponent } from './branch/save/save.branch.component';
import { MembershipSaveComponent } from './membership/save/membership.save.component';
import { MembershipSearchComponent } from './membership/search/membership.search.component';
import { WidgetBannerUploadComponent } from './configuration/widget/upload-widget-banner/upload.banner.component';
import { ViewWidgetBannerComponent } from './configuration/widget/view-widget-banner/view.banner.component';
import { SearchFacilityComponent } from './facility/search/search.facility.component';
import { SaveFacilityComponent } from './facility/save/save.facility.component';
import { PrinterSetupComponent } from './configuration/printer-setup/printer.setup.component';
import { SaveTaxComponent } from './taxes/save/save.tax.component';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
import { AutomationTemplateSearchComponent } from "./automation-template/search/automation.template.search.component";
import { AutomationTemplateSaveComponent } from './automation-template/save/automation.template.save.component';
import { ClassCategorySearchComponent } from './class-category/search/class.category.search.component';
import { ClassCategorySaveComponent } from './class-category/save/class.category.save.component';
import { ClassSearchComponent } from './class/search/class.search.component';
import { ClassSaveComponent } from './class/save/class.save.component';
import { ClassViewComponent } from './class/view/class.view.component';
import { SharedPaginationModule } from 'src/app/shared-pagination-module/shared-pagination-module';
import { AddItemTypeComponent } from './membership/save/add-item-type/add.item.type.component';
import { BenefitItemTypesComponent } from './membership/save/benifit-item-types/benefit.item.types.component';
import { FormSearchComponent } from './forms/search/search.form.component';
import { FormSaveComponent } from './forms/save/save.form.component';
import { FormItemsComponent } from './forms/save/save-form-items-popup/save.form.items.popup.component';
import { DndModule } from 'ngx-drag-drop';
import { SaveMembershipFormComponent } from './forms/save/save-form-membership-popup/save.form.membership.popup.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ApplicationDialogSharedModule } from 'src/app/application-dialog-module/application-dialog-module';
import { ApplicationPipesModule } from 'src/app/application-pipes/application.pipes.module';
import { GatewayModule } from 'src/app/gateway/gateway-module';
import { ConfigurationComponent } from './configuration/configuration.component';
import { WaitingListComponent } from './configuration/waiting-list/waiting-list.component';
import { BasicComponent } from './configuration/basic/basic.component';
import { CancelllationPolicyComponent } from './configuration/cancelllation-policy/cancelllation-policy.component';
import { PaymentsComponent } from './configuration/payments/payments.component';
import { BranchViewComponent } from './branch/view/view.component';
import { ViewComponent } from './automation-template/view/view.component';
import { SearchRewardProgramComponent } from './reward-program/search/reward.program.search.component';
import { SaveRewardProgramComponent } from './reward-program/save/reward.program.save.component';
import { SaveAddExceptionComponent } from './reward-program/save/add-exception-dialog/add.exception.component';
import { SaveAddExceptionFormComponent } from './reward-program/save/add-form-exception/add.form-exception.save.component';
import { RewardViewComponent } from './reward-program/view/view.component';
import { RewardTemplateComponent } from './reward-program/save/reward-template/reward.template.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { RewardProgramDelete } from './reward-program/delete-Reward-Program-Dialog/reward.program.delete.dialog.component';
import { SafeHtmlPipe } from 'src/app/application-pipes/safe.html.pipe';
import { MembershipCategorySaveComponent } from './membership-category/save/membership.category.save.component';
import { MembershipCategorySearchComponent } from './membership-category/search/membership.category.search.component';
import { AdvancedComponent } from './configuration/advanced/advanced.component';
import { ViewTaxComponent } from './taxes/view/view.tax.component';
import { SearchTaxComponent } from './taxes/search/search.tax.component';
import { AddProductComponent } from './membership/save/add-product/add.product.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';


@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SetupRoutingModule,
    SharedModule,
    MatAutocompleteModule,
    DxFormModule,
    DxValidatorModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatStepperModule,
    MatTooltipModule,
    MatSelectModule,
    MatIconModule,
    MatSelectModule,
    AngularCropperjsModule,
    DxColorBoxModule,
    DxDateBoxModule,
    NgDragDropModule.forRoot(),
    InternationalPhoneNumberModule,
    SharedPaginationModule,
    ApplicationDialogSharedModule,

    DndModule,
    ApplicationPipesModule,
    GatewayModule
  ],
  declarations: [

    NavigationComponent,
    CompanyComponent,
    LeadStatusComponent,
    ActivitiesColorComponent,
    TemplateSaveComponent,
    TemplateSearchComponent,
    RoleSaveComponent,
    RoleSearchComponent,
    RoleViewComponent,

    ServiceCategorySaveComponent,
    ServiceCategorySearchComponent,
    ServiceSaveComponent,
    ServiceSearchComponent,

    StaffPositionSaveComponent,
    StaffPositionSearchComponent,

    BranchSearchComponent,
    BranchSaveComponent,

    SearchFacilityComponent,
    SaveFacilityComponent,
    PrinterSetupComponent,

    MembershipSaveComponent,
    MembershipSearchComponent,

    WidgetComponent,
    WidgetBannerUploadComponent,
    ViewWidgetBannerComponent,

    SearchTaxComponent,
    FormSearchComponent,
    FormSaveComponent,
    FormItemsComponent,
    SaveTaxComponent,

    AutomationTemplateSearchComponent,
    AutomationTemplateSaveComponent,

    ClassCategorySearchComponent,
    ClassCategorySaveComponent,
    ClassSaveComponent,
    ClassSearchComponent,
    ClassViewComponent,
    AddItemTypeComponent,
    AddProductComponent,
    BenefitItemTypesComponent,
    SaveMembershipFormComponent,
    ConfigurationComponent,
    WaitingListComponent,
    BasicComponent,
    CancelllationPolicyComponent,
    PaymentsComponent,
    BranchViewComponent,
    ViewComponent,
    SearchRewardProgramComponent,
    RewardProgramDelete,
    SaveRewardProgramComponent,
    SaveAddExceptionComponent,
    SaveAddExceptionFormComponent,
    RewardViewComponent,
    RewardTemplateComponent,
    MembershipCategorySaveComponent,
    MembershipCategorySearchComponent,
    AdvancedComponent,
    ViewTaxComponent
  ],
  entryComponents: [
    BranchSaveComponent,
    ClassCategorySaveComponent,
    ClassViewComponent,
    ServiceCategorySaveComponent,
    ServiceSaveComponent,
    ClassSaveComponent,
    StaffPositionSaveComponent,
    TemplateSaveComponent,
    WidgetBannerUploadComponent,
    ViewWidgetBannerComponent,
    SaveFacilityComponent,
    RoleViewComponent,
    SaveTaxComponent,
    AutomationTemplateSaveComponent,
    AddItemTypeComponent,
    AddProductComponent,
    BenefitItemTypesComponent,
    FormItemsComponent,
    SaveMembershipFormComponent,
    SaveAddExceptionComponent,
    SaveAddExceptionFormComponent,
    RewardViewComponent,
    MembershipCategorySaveComponent,
    ViewTaxComponent
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    }
  ]
})
export class SetupModule { }
