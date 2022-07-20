import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { ApplicationDialogSharedModule } from 'src/app/application-dialog-module/application-dialog-module';
import { ApplicationPipesModule } from 'src/app/application-pipes/application.pipes.module';
import { AccountCodeDirective } from 'src/app/shared/directives/account.code.directive';
import { BranchCodeDirective } from 'src/app/shared/directives/branch.code.directive';
import { AddStripeCustomerComponent } from './stripe/add.stripe.customer.component';
import { StripeReaderComponent } from './stripe-terminal/stripe.reader.component';
import { StripeACHComponent } from './stripe-ach/stripe.ach.component';
import { AddGoCardlessCustomerComponent } from './gocardless/add.gocardless.customer.component';
import { PayTabsCustomerComponent } from './pay-tabs/paytabs.customer.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule,
  
  ],
  declarations: [
    AddStripeCustomerComponent,
    StripeReaderComponent,
    StripeACHComponent,
    AddGoCardlessCustomerComponent,
    AccountCodeDirective,
    BranchCodeDirective,
    PayTabsCustomerComponent
  ],
  exports: [
    AddStripeCustomerComponent,
    StripeReaderComponent,
    StripeACHComponent,
    AddGoCardlessCustomerComponent,
    PayTabsCustomerComponent
  ]
})
export class GatewayModule { }
