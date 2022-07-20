import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutomationRoutingModule } from './automation.routing.module';
import { SearchAutomationComponent } from './search/search.automation.component';
import { AutomationMainNavigationComponent } from './navigation/automation.main.navigation.component';
import { SaveAutomationComponent } from './save/save.automation.component';
import { AutomationNavigationComponent } from './navigation/automation.navigation.component';
import { SearchLogComponent } from './log/search.log.component';
import { DxValidatorModule, DxFormModule, DxDateBoxModule } from 'devextreme-angular';
import { SharedModule } from 'src/app/shared/shared-module';
import { SharedPaginationModule } from 'src/app/shared-pagination-module/shared-pagination-module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { ApplicationDialogSharedModule } from 'src/app/application-dialog-module/application-dialog-module';
import { ApplicationPipesModule } from 'src/app/application-pipes/application.pipes.module';


@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatSelectModule,
    AutomationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    // DxChartModule,
    DxDateBoxModule,
    //  DxSchedulerModule,
    // DxButtonModule,
    DxValidatorModule,
    DxFormModule,
    //  DxSwitchModule,
    SharedModule,
    SharedPaginationModule ,
    ApplicationDialogSharedModule,
    ApplicationPipesModule
  ],
  declarations: [
    AutomationMainNavigationComponent,
    SearchAutomationComponent,
    SaveAutomationComponent,
    AutomationNavigationComponent,
    SearchLogComponent


  ],
  entryComponents: [

  ]
})
export class AutomationModule { }
