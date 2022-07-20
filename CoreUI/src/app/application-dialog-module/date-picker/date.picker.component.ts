import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  AfterViewInit,
  AfterViewChecked
} from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { DateTimeService } from 'src/app/services/date.time.service';
import { Configurations } from 'src/app/helper/config/app.config';

import * as moment from 'moment-timezone';
import { Moment } from 'moment-timezone';

@Component({
    selector: 'date-picker',
    templateUrl: 'date.picker.component.html',
})
export class DatePickerComponent implements OnInit, AfterViewChecked {
    @ViewChild('datePickerElement') _input: ElementRef;
    // Used on parent component
    @ViewChild('dateElement') dateElement;

    @Input()
    name: string = "date";
    @Input()
    tabindex: number;
    @Input()
    set value(value: any) {
        if (value) {
            //remove zone from date time added by fahad for browser different time zone issue resolving
            value = this._dateTimeService.removeZoneFromDateTime(value);
            this.date = new Date(value);
        }
        else {
            this.resetDate();
        }
    }

    @Input()
    required: boolean = false;

    @Input()
    set min(value: Date) {
        setTimeout(() => {
            this.minDate = value;
        })
    };

    @Input()
    set max(value: Date) {
        setTimeout(() => {
            this.maxDate = value;
        })
    };
    @Input()
    showClear: boolean = true;

    @Input()
    isPOSSearch: boolean = false;

    @Input()
    isCancelMembershipNow: boolean = false;

    @Output()
    onDateChange = new EventEmitter<string>();
    @Input()
    disabled: boolean = false;


    @Input()
    diabaledDays: string = "";

    disabledDatesFilter = (m: Moment | null): boolean => {

        const day = (m || moment()).day();
        
        if(this.diabaledDays){
            var dayID = this.diabaledDays.split(',');
            
            return dayID.find(d => Number(d) -1 === day) ? false : true; //? false : true;
            // return day !== 0 && day !== 6 ;
        }

        return true;
    }

    date: Date;
    minDate: Date;
    maxDate: Date;

    dateFormatForSave = Configurations.DateFormatForSave;

    constructor(private _dateTimeService: DateTimeService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
    }

  ngAfterViewChecked(){
    //your code to update the model
    this.cdr.detectChanges();
  }

    onOpenCalendar(picker: MatDatepicker<Date>) {
        picker.open();
        setTimeout(() => this._input.nativeElement.focus());
    }

    onCloseCalendar(e) {
        setTimeout(() => this._input.nativeElement.blur());
    }

    onCalendarDateChange() {
        this.onDateChange.emit(this._dateTimeService.convertDateObjToString(this.date, this.dateFormatForSave));
    }

    onClearDate() {
        this.resetDate();
    }

    resetDate() {
        this.date = undefined;
        this.onDateChange.emit(undefined);
    }
}
