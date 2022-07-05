import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DxSchedulerModule, DxDateBoxModule, DxFormModule, DxValidatorModule, DxFileUploaderModule, DxButtonModule, DxSwitchModule} from 'devextreme-angular';

import { SchedulerRoutingModule } from './scheduler.routing.module';
import { SharedModule } from '@app/shared/shared-module';
import { ClientModule } from '@customer/client/client.module';
import { AdTooltipComponent } from "./tooltip/add.tooltip.component"; 

import { SchedulerNavigationComponent } from './navigation/scheduler.navigation.component';
import { SaveSchedulerAppointmentComponent } from './save/appointment/save.appointment.component';
import { SaveSchedulerBlockTimeComponent } from './save/block-time/save.block.time.component';
import { SaveSchedulerCallComponent } from './save/call/save.call.component';
import { SaveSchedulerClassComponent } from './save/class/save.class.component';
import { SaveSchedulerTaskComponent } from './save/task/save.task.component';
import { SaveSchedulerServiceComponent } from './save/service/save.service.component';
import { SchedulerCalendarComponent } from './calendar/scheduler.calendar.component';
//import { NgDragDropModule } from 'ng-drag-drop';
/**Tooltip */
import { ClassTooltipComponent } from "./tooltip/class.tooltip";  
import { ServiceTooltipComponent } from "./tooltip/service.tooltip";
import { BlockTimeTooltipComponent } from "./tooltip/blocktime.tooltip";
import { CallTooltipComponent } from "./tooltip/call.tooltip";
import { AppointmentTooltipComponent } from "./tooltip/appointment.tooltip";
import { TaskTooltipComponent } from "./tooltip/task.tooltip";

/** Activity Bar Template */
import { SchedulerActivityTemplateComponent } from "./template/activity.template.component";
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApplicationDialogSharedModule } from '@app/application-dialog-module/application-dialog-module';

import { ApplicationPipesModule } from '@app/application-pipes/application.pipes.module';
import { AttendeeModule } from '@app/attendee/attendee-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatTabsModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,

    DxSchedulerModule,
    DxDateBoxModule,
    DxFormModule,
    DxValidatorModule,
    DxFileUploaderModule,
    DxButtonModule,
    DxSwitchModule,
    //NgDragDropModule.forRoot(),

    SchedulerRoutingModule,
    SharedModule,
    ClientModule,
    MatTooltipModule,
    ApplicationDialogSharedModule,
    AttendeeModule,
    ApplicationPipesModule
  ],
  declarations: [
    AdTooltipComponent,
    SchedulerNavigationComponent,
    SaveSchedulerAppointmentComponent,
    SaveSchedulerBlockTimeComponent,
    SaveSchedulerCallComponent,
    SaveSchedulerClassComponent,
    SaveSchedulerTaskComponent,
    SaveSchedulerServiceComponent,
    SchedulerCalendarComponent,
    /**Tooltip */
    ClassTooltipComponent,
    ServiceTooltipComponent,
    BlockTimeTooltipComponent,
    CallTooltipComponent,
    AppointmentTooltipComponent,
    TaskTooltipComponent,
    SchedulerActivityTemplateComponent
  ],
  entryComponents: [
    SchedulerNavigationComponent,
    /**Tooltip */
    ClassTooltipComponent,
    ServiceTooltipComponent,
    BlockTimeTooltipComponent,
    CallTooltipComponent,
    AppointmentTooltipComponent,
    TaskTooltipComponent,
    SchedulerActivityTemplateComponent
  ]
})
export class SchedulerModule { }
