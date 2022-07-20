import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MemberRoutingModule } from './member.routing.module';
import { SharedModule } from 'src/app/shared/shared-module';

import { DxDateBoxModule, DxChartModule, DxPieChartModule, DxValidatorModule } from 'devextreme-angular';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';

import { AddMemberComponent } from './save/add-member/add.member.component';
import { EditMemberDetialsComponent } from './save/edit.member.details/edit.member.details.component';
import { SaveMemberDetailsComponent } from './save/save-member-details/save.member.details.component';
import { SaveMemberPageComponent } from './save/save-member-page/save.member.page.component';
import { MemberMainNavigation } from './navigation/member.main.navigation.component';
import { MemberNavigationComponent } from './navigation/member.navigation.component';
import { SearchMemberComponent } from './search/search.member.component';
import { ViewMemberDetail } from './view/view.member.detail.component';
import { SaveMemberActivityComponent } from './activities/save/save.member.activity.component';
import { SearchMemberActivityComponent } from './activities/search/search.member.activity.component';
import { MemberMembershipPaymentsComponent } from './membership-payments/member.membership.payments.component';
import { MemberMembershipComponent } from './memberships/member.memberships.component';
import { MemberBooking } from './bookings/member.booking.component';
import { MemberSaleHistoryComponent } from './sale-history/member.sale.history.component';
import { MemberDashboardComponent } from './dashboard/member.dashboard.component';
import { MemberMainDashboardComponent } from './member-main-dashboard/member.main.dashboard.component';
import { SuspendMembershipComponent } from 'src/app/customer/member/suspend-membership/suspend.membership.component';
import { AddMembershipTransactionComponent } from 'src/app/customer/member/membership-payments/add-transactions/add.membership.transaction.component';
import { TransactionDetailComponent } from 'src/app/customer/member/membership-payments/transaction-detail/transaction.detail.component';
import { EditMemberMembershipComponent } from 'src/app/customer/member/memberships/edit-membership/edit.member.membership.component';
import { AllMembersAttendanceComponent } from 'src/app/customer/member/member-attendance/members.attendance.component';
import { TransactionPaymentComponent } from './membership-payments/payment/transaction.payment.component';
import { CancelMembershipComponent } from "src/app/customer/member/cancel-membership/cancel.membership.component";
import { SharedPaginationModule } from 'src/app/shared-pagination-module/shared-pagination-module';
import { MembershipBenefitComponent } from './membership-benefits/membership.benefit.component';
import { EditBenefitsComponent } from './edit-benefits/edit.benefits.component';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomerSharedModule } from 'src/app/customer-shared-module/customer-shared-module';
import { ApplicationDialogSharedModule } from 'src/app/application-dialog-module/application-dialog-module';
import { ApplicationPipesModule } from 'src/app/application-pipes/application.pipes.module';
import { GatewayModule } from 'src/app/gateway/gateway-module';
import { DatePipe } from '@angular/common'
import { MembersPaymentsComponent } from './member-payments/members.payments.component';
import { MembershipBenefitsLog } from './benefits-log/benefits.log.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    DxDateBoxModule,
    DxValidatorModule,
    DxChartModule,
    DxPieChartModule,

    InternationalPhoneNumberModule,

    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatTabsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSelectModule,

    MemberRoutingModule,
    MatAutocompleteModule,
    SharedModule,
    SharedPaginationModule,
    CustomerSharedModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule,
    GatewayModule,
  ],
  declarations: [
    MemberMainNavigation,
    MemberNavigationComponent,
    SearchMemberComponent,
    AddMemberComponent,
    EditMemberDetialsComponent,
    SaveMemberDetailsComponent,
    SaveMemberPageComponent,
    SaveMemberActivityComponent,
    SearchMemberActivityComponent,
    MemberMembershipComponent,
    MemberMembershipPaymentsComponent,
    MemberBooking,
    MemberSaleHistoryComponent,
    MemberDashboardComponent,
    MemberMainDashboardComponent,
    MembersPaymentsComponent,
    SuspendMembershipComponent,
    AddMembershipTransactionComponent,
    EditMemberMembershipComponent,
    AllMembersAttendanceComponent,
    CancelMembershipComponent,
    MembershipBenefitComponent,
    EditBenefitsComponent,
    MembershipBenefitsLog 
  ],
  providers: [DatePipe, CurrencyPipe],
  entryComponents: [
    MemberMembershipPaymentsComponent,
    SaveMemberActivityComponent,
    SuspendMembershipComponent,
    AddMembershipTransactionComponent,
    EditMemberMembershipComponent,
    CancelMembershipComponent,
    EditBenefitsComponent,
    MembersPaymentsComponent
  ]
})
export class MemberModule { }
