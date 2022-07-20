import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { DatePickerComponent } from './date-picker/date.picker.component';
import { DeleteConfirmationComponent } from './delete-dialog/delete.confirmation.component';
import { DeleteSeriesComponent } from './delete-dialog/delete.series.component';
import { AlertConfirmationComponent } from './confirmation-dialog/alert.confirmation.component';
import { MatSelectModule } from '@angular/material/select';
import { DateToDateFromComponent } from './dateto_datefrom/dateto.datefrom.component';
import { ImageEditorComponent } from './image-editor/image.editor.component';
import { ImageEditorPopupComponent } from './image-editor/image.editor.popup.component';
import { ImageCaptureComponent } from './image-capture/image.capture.component';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { WebcamModule } from 'ngx-webcam';
import { GenericAlertDialogComponent } from './generic-alert-dialog/generic.alert.dialog.component';
import { EmailEditorComponent } from './email-editor/email.editor.component';
import { DxHtmlEditorModule, DxDateBoxModule, DxSchedulerModule, DxValidatorModule, DxButtonGroupModule, DxDataGridModule, DxCheckBoxModule } from 'devextreme-angular';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { CustomDateAdapter } from 'src/app/services/customDateAdapter';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule,
    AngularCropperjsModule,
    WebcamModule,
    DxHtmlEditorModule,
    DxDateBoxModule,
    DxValidatorModule,
    DxButtonGroupModule,
    DxCheckBoxModule,
    MatMomentDateModule
  ],
  providers:
  [
    CustomDateAdapter, // so we could inject services to 'CustomDateAdapter'
    { provide: DateAdapter, useClass: CustomDateAdapter }, // Parse MatDatePicker Format
  ],
  declarations: [
    DatePickerComponent,
    DateToDateFromComponent,
    DeleteConfirmationComponent,
    DeleteSeriesComponent,
    AlertConfirmationComponent,

    ImageEditorComponent,
    ImageEditorPopupComponent,
    ImageCaptureComponent,
    GenericAlertDialogComponent,
    EmailEditorComponent

  ],
  exports: [
    DatePickerComponent,
    DateToDateFromComponent,
    DeleteConfirmationComponent,
    DeleteSeriesComponent,
    AlertConfirmationComponent,
    ImageEditorPopupComponent,
    GenericAlertDialogComponent,
    EmailEditorComponent

  ],
})
export class ApplicationDialogSharedModule { }
