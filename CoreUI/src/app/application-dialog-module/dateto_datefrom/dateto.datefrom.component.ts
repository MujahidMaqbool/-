/********************** Angular References *********************************/
import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
/********************* Material:Refference ********************/
import { MatDatepicker } from '@angular/material/datepicker';

/********************** Service & Models *********************/

/* Models */
import { DateToFrom } from "src/app/models/common.model";

/* Services */
import { DateTimeService } from 'src/app/services/date.time.service';


/********************** Component *********************************/

@Component({
    selector: 'dateto-datefrom',
    templateUrl: './dateto.datefrom.component.html',
})

export class DateToDateFromComponent implements OnInit {

    //  @ViewChild('')
    @Output() sendDateTo = new EventEmitter<DateToFrom>();
    @ViewChild('datePickerElement') _input: ElementRef;
    @Input() IsdateDifference;
    @Input() dateToPlaceHolder;
    @Input() dateFromPlaceHolder;
    @Input() toMaxDate?= null;
    @Input() dateToLabelName;
    @Input() dateFromLabelName;
    @Input() receiveFromDate;
    @Input() receiveToDate;
    @Input() toMinDate;
    @Input() fromMaxDate;
    @Input() fromMinDate;
    @Input() isFromMaxDate: boolean = true;
    /* Local Members */
    dateFrom: Date;
    dateTo: Date;
    dateFormat: string = 'yyyy-MM-dd';
    maxDate: Date = new Date();
    toMinimumDate: any = null;
    /* Models Refences */
    dateToFrom = new DateToFrom();

    branchDate: Date;

    dateToPlaceHolderValue: string = "Please Select Date";
    dateFromPlaceHolderValue: string = "Please Select Date";
    dateFromLabelValue: string = "From";
    dateToLabelValue: string = "To";

    constructor(private ref: ChangeDetectorRef, private _dateTimeService: DateTimeService
    ) { }

    async ngOnInit() {
        //implementation change after discuss with tahir bhai show branch current date not browser date implementaed by fahad dated on 03-03-2021
        this.getBranchDatePattern();

        this.dateToPlaceHolderValue = this.dateToPlaceHolder ? this.dateToPlaceHolder : this.dateToPlaceHolderValue;
        this.dateFromPlaceHolderValue = this.dateFromPlaceHolder ? this.dateFromPlaceHolder : this.dateFromPlaceHolderValue;

        this.dateToLabelName = this.dateToLabelName ? this.dateToLabelName : this.dateToLabelValue;
        this.dateFromLabelName = this.dateFromLabelName ? this.dateFromLabelName : this.dateFromLabelValue;

    }

    //#region Methods

    async getBranchDatePattern() {
        this.branchDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        if(this.isFromMaxDate){
            this.maxDate = this.branchDate;
        } else{
            this.maxDate = null;
        }
        
        this.dateTo = this.branchDate
        this.dateFrom = this.branchDate


        // Date Range Changed month to One Day ... As Per Discussed with tahir shb and fazeel (13-03-2020) in this generic component and where this component is using.
        this.dateToFrom.DateFrom = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormat);
        this.dateToFrom.DateTo = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormat);

        //////
        if(this.receiveFromDate){
          this.dateFrom = this.receiveFromDate;
          this.dateToFrom.DateFrom = this._dateTimeService.convertDateObjToString(this.receiveFromDate, this.dateFormat);
        }

        ////
        if(this.receiveToDate){
          this.dateTo = this.receiveToDate;
          this.dateToFrom.DateTo = this._dateTimeService.convertDateObjToString(this.receiveToDate, this.dateFormat);
        }

        ////
        if(this.fromMaxDate){
          this.maxDate = this.fromMaxDate;
        }

        //
        if(this.toMinDate)
        {
          this.toMinimumDate = this.toMinDate;
        }


        if (this.IsdateDifference) {
            this.fromDateDifference(this.IsdateDifference);
        }
    }

    onFromDateChange(date: Date) {
        this.dateToFrom.DateFrom = date ? this._dateTimeService.convertDateObjToString(date, this.dateFormat) : ""; // 07/05/2018 MM/dd/yyyy
        this.setNotSelectedDate();
        this.sendDateTo.emit(this.dateToFrom);
        this.validateDate();
    };

    onToDateChange(date: Date) {
        this.dateToFrom.DateTo = date ? this._dateTimeService.convertDateObjToString(date, this.dateFormat) : ""; // 07/05/2018 MM/dd/yyyy
        this.setNotSelectedDate();
        this.sendDateTo.emit(this.dateToFrom);

    };

    onOpenCalendar(picker: MatDatepicker<Date>) {
        picker.open();
        // setTimeout(() => this._input.nativeElement.focus());
    }

    async setEmptyDateFilter() {
        //when branch not loaded not call this method
        var _date = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.dateTo = null;
        this.dateFrom = null;
        this.dateToFrom.DateTo = null;
        this.dateToFrom.DateFrom = null;
        this.sendDateTo.emit(this.dateToFrom);
        this.ref.detectChanges();
    }

    resetDateFilter() {
        this.dateTo = this.branchDate;
        this.dateFrom = this.branchDate;
        this.dateToFrom.DateTo = this._dateTimeService.convertDateObjToString(this.dateTo, this.dateFormat); // 07/05/2018 MM/dd/yyyy
        this.dateToFrom.DateFrom = this._dateTimeService.convertDateObjToString(this.dateFrom, this.dateFormat);
        this.sendDateTo.emit(this.dateToFrom);
    }

    setNotSelectedDate() {
        if (this.dateToFrom.DateFrom == null && this.dateToFrom.DateTo) {
            this.dateToFrom.DateFrom = this.dateToFrom.DateTo;
            this.dateFrom = this.dateTo;
        }

        if (this.dateToFrom.DateTo == null && this.dateToFrom.DateFrom) {
            this.dateTo = this.branchDate;
            this.dateToFrom.DateTo = this._dateTimeService.convertDateObjToString(this.dateTo, this.dateFormat);
        }
    }

    validateDate() {
        if (this.dateToFrom.DateFrom > this.dateToFrom.DateTo) {
            this.dateToFrom.DateTo = this.dateToFrom.DateFrom;
            this.dateTo = new Date(this.dateToFrom.DateFrom);
            this.sendDateTo.emit(this.dateToFrom);
        }
    }

    async fromDateDifference(difference) {

        let dateFrom = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        dateFrom.setDate(dateFrom.getDate() - difference);

        this.dateFrom = dateFrom;
        this.dateToFrom.DateFrom = this._dateTimeService.convertDateObjToString(this.dateFrom, this.dateFormat);

    }

    onFromDateChangeForParent(date: Date) {
        this.dateFrom = date;
    };

    onToDateChangeForParent(date: Date) {
        this.dateTo = date;
    };

    //#endregion
}
