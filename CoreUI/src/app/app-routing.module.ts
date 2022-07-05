import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'account', loadChildren: '@app/account/account.module#AccountModule' },
  { path: 'attendance', loadChildren: '@attendance/attendance.module#AttendanceModule' },
  { path: 'pdf', loadChildren: '@pdf/pdf.module#PDFModule' },
  { path: '', loadChildren: '@app/home/home.module#HomeModule' }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
