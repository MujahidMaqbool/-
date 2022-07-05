import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './signup/register.company.component';
import { LoginComponent } from './login/login.component';
import { RedirectComponent } from './redirect/redirect.component';
import { ForgotComponent } from './forgot/forgot.password.component';
import { SavePasswordComponent } from './new-password/new.password.component';
import { ChangePasswordComponent } from './change-password/change.password.component';

const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'save-password/:token', component: SavePasswordComponent },
  { path: 'login', component: LoginComponent },
  { path: 'redirect/:CompanyID/:BranchID/:Type/:TypeID/:CustomerTypeID/:IsBranchEdit/:ID', component: RedirectComponent }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
