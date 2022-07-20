import { AddGatewayComponent } from './gateways/add-gateway/add-gateway.component';
import { ViewGatewayComponent } from './gateways/view-gateway/view-gateway.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { SlickCarouselModule } from 'ngx-slick-carousel';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepperModule } from '@angular/material/stepper';
import { EditCustomerEmailComponent } from './edit-email/edit.customer.email.component';
import { AddLeadMembershipComponent } from './add-lead-membership/add.lead.membership.component';
import { CustomerBenefitsComponent } from './customer-benefits/customer.benefits.component';
import { SuspendBenefitsComponent } from './suspend-benefits/suspend.benefits.component';
import { POSMembershipPaymentComponent } from './payments/pos.membership.payment';
import { SearchFormsComponent } from './customer-forms/search-forms/search.forms.component';
import { MembershipFormComponent } from './customer-forms/membership-form/membership.form.component';
import { PersonInfoComponent } from './person-info/person.info.component';
import { SharedPaginationModule } from 'src/app/shared-pagination-module/shared-pagination-module';
import { SaveMemberMembershipComponent } from './add-member-membership/save-member-membership/save.member.membership.component';
import { SaveMemberPaymentComponent } from './add-member-membership/save-member-payment/save.member.payment.component';
import { SaveMemberMembershipPopup } from './add-member-membership/save-membership-popup/save.member.membership.popup';
import { ApplicationDialogSharedModule } from 'src/app/application-dialog-module/application-dialog-module';
import { ApplicationPipesModule } from 'src/app/application-pipes/application.pipes.module';
import { GatewayModule } from 'src/app/gateway/gateway-module';
import { DxDateBoxModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { CustomerShippingAddress } from './customer-billing-address/customer.billing.address.component';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
import { SaveDocument } from 'src/app/customer-shared-module/documents/save/save-document.component';
import { SearchDocumentComponent } from 'src/app/customer-shared-module/documents/search/search-document.component';
import { NextOfKinComponent } from 'src/app/customer-shared-module/next-of-kin/next-of-kin.component';
import { ReferralDetailComponent } from 'src/app/customer-shared-module/referral/referral-detail.component';
import { EmailFormComponent } from './customer-forms/email/email.form.component';
import { SmsFormComponent } from './customer-forms/sms/sms.form.component';
import { GatewaysComponent } from './gateways/gateways.component';
import { EditGatewayComponent } from './gateways/edit-gateway/edit-gateway.component';
import { WaitListComponent } from './wait-list/wait-list.component';
import { ConfirmResetCountComponent } from './confirm-reset-count/confirm.reset.count.component';
import { SharedModule } from 'src/app/shared/shared-module';
import { WaitlistServiceDetailComponent } from './waitlist-service-detail/waitlist.service.detail.component';
import { SearchRewardProgramsComponent } from './reward-programs/search-reward-programs.component';
import { AddRewardProgramComponent } from './reward-programs/add-reward-program/add-reward-program.component';
import { AdjustPointsBalanceComponent } from './reward-programs/adjust-points-balance/adjust-points-balance.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatTabsModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatStepperModule,
    DxDateBoxModule,
    DxValidatorModule,
    SlickCarouselModule,
    SharedPaginationModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule,
    GatewayModule,
    InternationalPhoneNumberModule
  ],
  declarations: [
    /* Staff Profile */
    EditCustomerEmailComponent,
    AddLeadMembershipComponent,
    CustomerBenefitsComponent,
    SuspendBenefitsComponent,
    POSMembershipPaymentComponent,
    SearchFormsComponent,
    MembershipFormComponent,
    PersonInfoComponent,

    SaveMemberMembershipComponent,
    SaveMemberPaymentComponent,
    SaveMemberMembershipPopup,
    CustomerShippingAddress,
    ReferralDetailComponent,
    SaveDocument,
    SearchDocumentComponent,
    NextOfKinComponent,
    EmailFormComponent,
    SmsFormComponent,
    GatewaysComponent,
    EditGatewayComponent,
    ViewGatewayComponent,
    AddGatewayComponent,
    WaitListComponent,
    ConfirmResetCountComponent,
    WaitlistServiceDetailComponent,
    SearchRewardProgramsComponent,
    AddRewardProgramComponent,
    AdjustPointsBalanceComponent
  ],
  exports: [
    EditCustomerEmailComponent,
    AddLeadMembershipComponent,
    CustomerBenefitsComponent,
    POSMembershipPaymentComponent,
    SearchFormsComponent,
    MembershipFormComponent,
    PersonInfoComponent,
    SaveMemberMembershipComponent,
    SaveMemberPaymentComponent,
    CustomerShippingAddress,
    ReferralDetailComponent,
    SaveDocument,
    SearchDocumentComponent,
    NextOfKinComponent,
    GatewaysComponent,
    EditGatewayComponent,
    ViewGatewayComponent,
    AddGatewayComponent,
    AddRewardProgramComponent,
    AdjustPointsBalanceComponent
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ]
})
export class CustomerSharedModule { }
