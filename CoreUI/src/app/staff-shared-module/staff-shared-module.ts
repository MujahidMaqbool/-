import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { WebcamModule } from 'ngx-webcam';
import { ApplicationPipesModule } from '@app/application-pipes/application.pipes.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    AngularCropperjsModule,
    WebcamModule,
    ApplicationPipesModule
  ],
  declarations: [
    
  ],
  exports: [
    
  ],
})
export class StaffSharedModule { }
