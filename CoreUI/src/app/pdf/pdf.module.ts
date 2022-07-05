import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerFormPDFComponent } from './customer-form-pdf/customer.form.pdf.component';
import { PDFRoutingModule } from './pdf.routing.module';
import {AutosizeModule} from '@techiediaries/ngx-textarea-autosize';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DxDateBoxModule} from 'devextreme-angular';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PDFRoutingModule,
    AutosizeModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DxDateBoxModule
  ],
  declarations: [
    CustomerFormPDFComponent
  ],
  entryComponents: [
  ]
})
export class PDFModule { }
