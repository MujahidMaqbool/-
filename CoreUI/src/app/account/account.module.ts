import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/register.company.component';
import { ForgotComponent } from './forgot/forgot.password.component';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { SavePasswordComponent } from './new-password/new.password.component';
import { ChangePasswordComponent } from './change-password/change.password.component';
import { RedirectComponent } from './redirect/redirect.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    MatStepperModule,

    AccountRoutingModule
  ],
  declarations: [
    LoginComponent, 
    SignupComponent, 
    ForgotComponent, 
    SavePasswordComponent, 
    ChangePasswordComponent,
    RedirectComponent
  ]
})
export class AccountModule { }
