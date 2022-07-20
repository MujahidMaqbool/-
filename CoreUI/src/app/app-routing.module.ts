import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'account', loadChildren: () => import('src/app/account/account.module').then(m => m.AccountModule) },
  { path: 'attendance', loadChildren: () => import('src/app/attendance/attendance.module').then(m => m.AttendanceModule) },
  { path: 'pdf', loadChildren: () => import('src/app/pdf/pdf.module').then(m => m.PDFModule) },
  { path: '', loadChildren: () => import('src/app/home/home.module').then(m => m.HomeModule) }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
