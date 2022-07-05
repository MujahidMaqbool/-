import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SchedulerCalendarComponent } from './calendar/scheduler.calendar.component';

const routes: Routes = [
    {
        path: '',
        component: SchedulerCalendarComponent
    },
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SchedulerRoutingModule { }
