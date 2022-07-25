/********************** References *********************/
import { Component, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core'
import { DxSchedulerComponent } from 'devextreme-angular';

/********************** Services & Models *********************/
import { HttpService } from 'src/app/services/app.http.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { MessageService } from 'src/app/services/app.message.service';

/********************** Configurations *********************/
import { DataSourceModelMapper } from 'src/app/shared/helper/datasource-model-mapper';
import { SchedulerOptions, Configurations } from 'src/app/helper/config/app.config';
import { Messages } from 'src/app/helper/config/app.messages';
import { SchedulerApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse } from 'src/app/models/common.model';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

@Component({
    selector: 'one-day-scheduler',
    template: `
        <style>  
        :host ::ng-deep .dx-toolbar-button.dx-toolbar-menu-container,
        :host ::ng-deep .dx-toolbar-after .dx-buttongroup-wrapper.dx-widget.dx-collection {
            display: none;
        }
        :host ::ng-deep .dx-toolbar .dx-toolbar-before {
            padding-right: 0;
        }
        :host ::ng-deep .dx-toolbar .dx-toolbar-after {
            padding-left: 0;
        }
            :host ::ng-deep .dx-scheduler-small .dx-scheduler-date-table .dx-scheduler-date-table-row:before{
                width: 50px;
            }            
            :host ::ng-deep .dx-scheduler-time-panel{
                width: 32px;
                font-size: 11px;
                border-right: 1px solid rgba(221, 221, 221, 0.6) !important;
            }
            ::ng-deep .dx-scheduler-small .dx-scheduler-date-table{
                margin-left: -8px;
            }
            :host ::ng-deep .dx-scrollable-scrollbar{
                display: none;
            }
            :host ::ng-deep .dx-scheduler-navigator{
                min-width: 100%;
            }
            :host ::ng-deep .dx-scheduler-navigator-caption{
                width: 234px;
            }
            :host ::ng-deep .dx-scheduler-header{
                position: sticky;
                top: 0;
            }
            :host ::ng-deep .dx-scheduler-time-panel-cell {
                height: 30px;
            }
            :host ::ng-deep .dx-scheduler-cell-sizes-horizontal {
                height: 30px;
            }
            @media (min-width: 1281px) and (max-width: 1600px) {
                :host ::ng-deep .dx-scheduler-navigator{
                    min-width: 91%;
                }
            }
            @media (max-width: 1280px) {
                :host ::ng-deep .dx-scheduler-navigator{
                    min-width: 80%;
                }
            }
        </style>      
                <dx-scheduler id="sharedScheduler" [dataSource]="dataSourceList" (onOptionChanged)="onOptionChanged($event)" 
                            (onAppointmentRendered)="onAppointmentRendered($event)" (onCellClick)="onCellClick($event)" 
                            (onAppointmentFormOpening)="onAppointmentFormOpening($event)" [customizeDateNavigatorText]="customizeDateNavigatorText"
                            (onAppointmentClick)="onAppointmentClick($event)" [min]="minDate" [max]="maxDate" timeCellTemplate="timeCellTemplate"
                            appointmentTemplate="appointment-template"
                            (onAppointmentDblClick)="onAppointmentDblClick($event)" [cellDuration]="15"
                            [showCurrentTimeIndicator]="false" [shadeUntilCurrentTime]="false" [showAllDayPanel]="false" >
                    <dxo-editing [allowAdding]="false" [allowUpdating]="false" [allowDeleting]="false" [allowResizing]="false" [allowDragging]="false"></dxo-editing>
                    <div *dxTemplate="let singleData of 'appointment-template'">
                        <div class="dx-scheduler-appointment-title">{{singleData.appointmentData.text}}</div>
                        <div class="dx-scheduler-appointment-content-details"> 
                            <div class="dx-scheduler-appointment-content-date">{{ (singleData.appointmentData.startDate | customdate: schedulerTimeFormat) }}</div>
                            <div class="dx-scheduler-appointment-content-date"> - </div>
                            <div class="dx-scheduler-appointment-content-date">{{ (singleData.appointmentData.endDate | customdate: schedulerTimeFormat) }}</div>
                        </div>
                        <span *ngIf="singleData.recurrenceRule" class="dx-scheduler-appointment-recurrence-icon dx-icon-repeat">
                        </span>
                    </div>
                    <div *dxTemplate="let appointment of 'timeCellTemplate'" >
                        <div *ngIf="appointment.date.getMinutes() == 0">{{ (appointment.date | customdate: schedulerHeaderTimeFormat ) }}</div>
                    </div>
                </dx-scheduler>
    `
})

export class OneDaySchedulerComponent extends AbstractGenericComponent implements AfterViewInit {

    /** input, output parameters */
    @Input() dayViewFormat: string; /** pass format must for show country base format other wise date show empty */
    @ViewChild(DxSchedulerComponent) childScheduler: DxSchedulerComponent;
    @Input()
    set startDate(value: Date) {
        if (value && value != undefined) {
            this.inputStartDate = value;
            if (this.childScheduler) {
                this.childScheduler.currentDate = this.inputStartDate;
            }
        }
    };
    @Input() minDate?: Date;
    @Input() maxDate?: Date;
    @Input()
    set staffID(value: any) {
        this.newStaffID = value;
    };
    @Input() hideDate: boolean = false;
    @Input() schedulerType: number;
    @Output() onStartDateChange = new EventEmitter<Date>();
    @Input() schedulerTimeFormat?: string = Configurations.SchedulerTimeFormat;  /** Using in HTML DONOT DELETE/REMOVE */
    //@Output() onCellClickChange = new EventEmitter<SmallSchedulerDates>();

    /** Models */
    private schedulerStaticStrings = new SchedulerOptions();
    dataSourceModelMapper: DataSourceModelMapper = new DataSourceModelMapper(this._dateTimeService);

    /** Lists */
    dataSourceList: any[] = [];
    views: any[] = [this.schedulerStaticStrings.GetSchedulerStaticString.Day];
    /** local variables */
    newStaffID: number;
    messages = Messages;
    currentDate: Date = new Date();
    currentView: string = this.schedulerStaticStrings.GetSchedulerStaticString.Day;
    showAllDayPanel: boolean = false;
    startDayHour: number = 0;
    endDayHour: number = 24;
    inputStartDate: Date;
    endDate: Date = new Date();
    dateFormat = Configurations.DateFormat;
    callSchedulerOptionChangeEvent: boolean = true;
    schedulerHeaderTimeFormat: string = Configurations.SchedulerHeaderTimeFormat;
    //dayViewFormat: string = "";//Configurations.SchedulerDateFormatDayView

    // schedulerTimeFormat = Configurations.SchedulerTimeFormat;  
    _oldStartDate: string;  /** Using for ristirect double calling api DONOT DELETE/REMOVE */

    constructor(
        private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _messageService: MessageService,
    ) {
        super();
        /* Default Old date 1 day back ahead from current date */
        this.setDefaultOldStartDate();
    }

    ngOnInit() {
        this.schedulerHeaderTimeFormat = this.schedulerTimeFormat == Configurations.SchedulerTimeFormatWithFormat ? Configurations.SchedulerHeaderTimeFormatWith12Hours : Configurations.SchedulerHeaderTimeFormat;

        /* Default MinDate is 1 year back from current date */
        if (this.minDate) {
            this.minDate = this.minDate
        }
        else {
            this.minDate = new Date();
            this.minDate.setFullYear(new Date().getFullYear() - 1);
        }

        /* Default MaxDate is 1 year ahead from current date */
        if (this.maxDate) {
            this.maxDate = this.maxDate
        }
        else {
            this.maxDate = new Date();
            this.maxDate.setFullYear(new Date().getFullYear() + 1);
        }
    }

    ngAfterViewInit() {
        this.childScheduler.currentDate = this.inputStartDate;
        if (this.newStaffID) {
            this.getScheduler();
            this.setInputDefaultValues();
        }
    }
    customizeDateNavigatorText = (e) => {
        return this._dateTimeService.convertDateObjToString(e.startDate, this.dayViewFormat);
    }

    onAppointmentFormOpening($event) {
        $event.component._popup.hide();
    }

    onAppointmentClick(e) {
        e.cancel = true;
    }

    onAppointmentDblClick(e) {
        e.cancel = true;
    }

    onCellClick(e) {
        //this.onCellClickChange.emit()
        e.cancel = true;
    }

    onAppointmentRendered(e) {

        e.appointmentElement.style.backgroundColor = e.appointmentData.SchedulerActivityTypeColor;
    }

    onOptionChanged(e) {

        if (e.name === this.schedulerStaticStrings.GetSchedulerStaticString.CurrentDate) {  // firstTime loading check

            this.dataSourceList = [];

            setTimeout(() => {
                // Get api
                this.onStartDateChange.emit(e.component.getStartViewDate());
                this.inputStartDate = e.component.getStartViewDate();
                this.endDate = e.component.getEndViewDate();
                this.getScheduler();

            }, 1000);
        }
    }

    setInputDefaultValues() {
        this.childScheduler.views = this.views;
        this.childScheduler.dataSource = this.dataSourceList;
        this.childScheduler.currentView = this.currentView;
        this.childScheduler.showAllDayPanel = this.showAllDayPanel;
        this.childScheduler.startDayHour = this.startDayHour;
        this.childScheduler.endDayHour = this.endDayHour;
        this.endDate = this.inputStartDate;  // first time load day View
    }

    setDefaultOldStartDate() {  /** first time load */
        var date: Date = new Date();
        date = new Date(date.setDate(date.getDate() + 1));
    }

    getScheduler() {
        if (this.inputStartDate) {
            let dateArray = this.convertDateFormat();
            if (this._oldStartDate != dateArray[0]) {
                this.getDataSourceForActivityScheduler(dateArray[0], dateArray[1]);
            }
        }
    }

    getSchedulerByStaff(staffID) {
        if (this.inputStartDate) {
            this.newStaffID = staffID;
            let dateArray = this.convertDateFormat();
            this.getDataSourceForActivityScheduler(dateArray[0], dateArray[1]);
        }
    }

    getDataSourceForActivityScheduler(_startDate, _endDate) {
        this.dataSourceList = [];
        let url = SchedulerApi.getDayView
            .replace("{staffID}", this.newStaffID ? this.newStaffID.toString() : '')
            .replace("{startDate}", _startDate);
        this._oldStartDate = _startDate;
        if (this.newStaffID) {
            this._httpService.get(url)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (response.Result) {
                            this.dataSourceList = [];
                            this.mapDataSource(response.Result);
                            //this.refreshSchedulerDataSource();
                        }
                        else {
                            this.dataSourceList = [];
                        }
                    }
                    else {
                        this.dataSourceList = [];
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Scheduler")); }
                );
        }
    }

    refreshSchedulerDataSource() {
        this.childScheduler.dataSource = this.dataSourceList;
    }

    convertDateFormat() {
        /** remove time from date */
        let convertStartDate = JSON.parse(JSON.stringify(this.inputStartDate)),
            convertEndDate = JSON.parse(JSON.stringify(this.endDate)),
            _startDate = this._dateTimeService.convertDateObjToString(new Date(convertStartDate), this.dateFormat),
            _endDate = this._dateTimeService.convertDateObjToString(new Date(convertEndDate), this.dateFormat);
        return [_startDate, _endDate];
    }

    mapDataSource(responseData) {

        responseData.forEach(data => {
            data.startDate = data.startDate.substr(0, data.startDate.indexOf("Z"));
            data.startDate = new Date(data.startDate);
            data.endDate = data.endDate.substr(0, data.endDate.indexOf("Z"));
            data.endDate = new Date(data.endDate);
        });

        this.dataSourceList = responseData;
    }

    getCustomSchedulerData() {
        this.childScheduler.currentDate = this.inputStartDate;
        if (this.newStaffID) {
            let dateArray = this.convertDateFormat();
            this.getDataSourceForActivityScheduler(dateArray[0], dateArray[1]);
            // this.getScheduler();
        }
    }
}