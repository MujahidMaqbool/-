import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AppPaginationComponent } from './app-pagination/app.pagination.component';


@NgModule({
  imports: [
    CommonModule,
    MatPaginatorModule
  ],
  declarations: [
    AppPaginationComponent

  ],
  exports: [
    AppPaginationComponent
  ],
})
export class SharedPaginationModule { }
