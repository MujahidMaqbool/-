import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagePermissionGuard } from '@app/helper/app.permission.guard';
import { ENU_Permission_Module,ENU_Permission_Individual } from '@app/helper/config/app.module.page.enums';
import { CustomerFormPDFComponent } from './customer-form-pdf/customer.form.pdf.component';

const routes: Routes = [
  {
    path: 'form/:FormID/:FormType',
    component: CustomerFormPDFComponent,
    //canActivate: [PagePermissionGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class PDFRoutingModule { }