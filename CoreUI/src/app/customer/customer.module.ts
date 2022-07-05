import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { CustomerRoutingModule } from './customer-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationComponent } from './navigation/customer.navigation.component';
import { DxDateBoxModule, DxValidatorModule, DxChartModule, DxPieChartModule } from 'devextreme-angular';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ApplicationDialogSharedModule } from '@app/application-dialog-module/application-dialog-module';
import { ApplicationPipesModule } from '@app/application-pipes/application.pipes.module';
import { CustomerSharedModule } from '@app/customer-shared-module/customer-shared-module';
import { GatewayModule } from '@app/gateway/gateway-module';
import { SharedPaginationModule } from '@app/shared-pagination-module/shared-pagination-module';
import { SharedModule } from '@app/shared/shared-module';
import { MemberRoutingModule } from './member/member.routing.module';
import { MemberModule } from './member/member.module';
import { MembersPaymentsComponent } from './member-payments/members.payments.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { ViewMemberDetail } from './member/view/view.member.detail.component';
import { TransactionDetailComponent } from './member/membership-payments/transaction-detail/transaction.detail.component';
import { TransactionPaymentComponent } from './member/membership-payments/payment/transaction.payment.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';



@NgModule({
  declarations: [SearchComponent, NavigationComponent, CustomerDashboardComponent, MembersPaymentsComponent, ViewMemberDetail, TransactionDetailComponent,
    TransactionPaymentComponent],
  imports: [
    CommonModule,
    DxDateBoxModule,
    DxValidatorModule,
    DxChartModule,
    DxPieChartModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    CustomerRoutingModule,
    MemberRoutingModule,
    MatAutocompleteModule,
    MatTooltipModule,
    SharedModule,
    SharedPaginationModule,
    CustomerSharedModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule,
    GatewayModule,
  ],
  entryComponents: [
    ViewMemberDetail,
    TransactionDetailComponent,
    TransactionPaymentComponent
  ]
})
export class CustomerModule { }
