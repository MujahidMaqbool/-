import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'customdate' })
export class CustomDatePipe implements PipeTransform {
  // adding a default format in case you don't want to pass the format
  // then 'yyyy-MM-dd' will be used
  transform(date: Date | string, format: string = 'yyyy-MM-dd'): string {
    if(date){
      date = date && date.toString().indexOf('Z') > 0 ? new Date(date.toString().split('Z')[0]) : date;
      return new DatePipe('en-US').transform(date, format);
    }
  }
}


