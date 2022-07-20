import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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