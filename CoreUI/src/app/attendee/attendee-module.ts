import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { SaveAppNotificationComponent } from './app-notfication/save.app.notification.component';
import { SaveEmailComponent } from './email/save.email.component';
import { SaveSMSComponent } from './sms/save.sms.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
import { AttendeeNotificationComponent } from './attendee-notification-popup/attendee.notificatin.popup.component';
import { AttendeeComponent } from './save-search/attendee.component';
import { ApplicationDialogSharedModule } from '@app/application-dialog-module/application-dialog-module';
import { ApplicationPipesModule } from '@app/application-pipes/application.pipes.module';
import { WaitlistConfirmationPopupComponent } from './waitlist-confirmation-popup/waitlist.confirmation.popup.component';
import { DxTooltipModule, DxTemplateModule } from 'devextreme-angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatDatepickerModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatNativeDateModule,
    MatTooltipModule,
    InternationalPhoneNumberModule,
    ApplicationDialogSharedModule,
    ApplicationPipesModule,

    DxTooltipModule,
    DxTemplateModule,
  ],
  declarations: [
    SaveAppNotificationComponent,
    SaveEmailComponent,
    SaveSMSComponent,
    AttendeeNotificationComponent,
    AttendeeComponent,
    WaitlistConfirmationPopupComponent,
  ],
  exports: [
    SaveAppNotificationComponent,
    AttendeeNotificationComponent,
    AttendeeComponent,
  ]
})
export class AttendeeModule { }
