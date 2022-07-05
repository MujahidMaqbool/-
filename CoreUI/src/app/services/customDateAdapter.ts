// customDateAdapter.ts
import { Injectable } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import * as moment from 'moment';
import { DateTimeService } from './date.time.service';

@Injectable()
export class CustomDateAdapter extends MomentDateAdapter
{
  constructor(private _dateTimeService: DateTimeService)
  {
    super(navigator.language);
  }

  public format(date: moment.Moment, displayFormat: string): string
  {
    const locale = navigator.language;
    const format = this._dateTimeService.getDatePickerFormat();

    const result = date.locale(locale).format(format);

    //console.log(`Reading date [local: '${ locale }'; format: '${ format }'; result: '${ result }']`);

    return result;
  }
  
}