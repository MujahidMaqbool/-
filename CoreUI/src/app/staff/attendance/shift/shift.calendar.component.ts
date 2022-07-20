/** Angular */
import { Component, ViewChild, OnInit } from '@angular/core';
import { forkJoin, SubscriptionLike } from 'rxjs';

/** devextreme */
import { DxSchedulerComponent } from 'devextreme-angular';
import Button from 'devextreme/ui/button';

/** Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DateTimeService } from 'src/app/services/date.time.service';

/** Models */
import { CellSelectedData, SchedulerSearchParam, StaffShiftDataSource } from 'src/app/scheduler/models/scheduler.model';
import { StaffShift, UpdateStaffShift } from 'src/app/staff/models/staff.model';
import { Branch } from 'src/app/setup/models/branch.model';
import { ResourcesDataSource } from 'src/app/scheduler/models/class.model';

/** Messages & Constants, Customs */
import { MessageService } from 'src/app/services/app.message.service';
import { Configurations, SchedulerOptions } from 'src/app/helper/config/app.config';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

/** Component */
import { SaveSchedulerStaffShiftComponent } from 'src/app/staff/attendance/shift/save/save.staff.shift.component';
import { Messages } from 'src/app/helper/config/app.messages';
import { StaffShiftApi } from 'src/app/helper/config/app.webapi';
import { WeekDays, SchedulerWeekDays, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Staff } from 'src/app/helper/config/app.module.page.enums';
import { ImagesPlaceholder } from 'src/app/helper/config/app.placeholder';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import * as events from 'devextreme/events';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { DeleteSeriesComponent } from 'src/app/application-dialog-module/delete-dialog/delete.series.component';
import { variables } from 'src/app/helper/config/app.variable';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { EditSeriesComponent } from 'src/app/shared/components/scheduler/edit-series/edit.series.component';
import { DD_Branch } from 'src/app/models/common.model';
declare var $: any;

import Scrollable from 'devextreme/ui/scroll_view/ui.scrollable';  


@Component({
    selector: 'shift-calendar',
    templateUrl: './shift.calendar.component.html',
    styleUrls: ['./shift.calendar.css']
})

export class ShiftCalendarComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Members

    @ViewChild(DxSchedulerComponent) scheduler: DxSchedulerComponent;

    /** Local Variables */
    isSaveShiftAllowed: boolean = false;

    schedulerStaticStrings = new SchedulerOptions();
    afterSaveStartDate: string;
    currentDate: Date = new Date();
    afterSaveEndDate: string;
    startViewDate: Date = new Date();
    endViewDate: Date = new Date();
    isDragDrop: boolean = false;
    searchStaff: any[] = [];
    shiftExistError: boolean = false;
    currentView: string;
    disbaleLoadButton: boolean = false;
    serverImageAddress = environment.imageUrl;
    staffImpagePath = ImagesPlaceholder.user;
    allowResizingOnScheduler: boolean = true;
    editSeriesDialogRef: any;
    dialogRef: any;
    dragStartDate: Date;

    //scheduler load according branch Date
    branchDate: Date = new Date();

    /** Models */
    branchInfo: Branch = new Branch();
    selectedCellData: CellSelectedData = new CellSelectedData();
    staffShiftModel: StaffShift = new StaffShift();
    schedulerSearchParam: SchedulerSearchParam = new SchedulerSearchParam();

    /** Lists */
    staffListDataSource: any[] = [];
    filteredStaffListDataSource: any[] = [];
    staffPositionListDataSource: any[] = [];
    staffShiftDataSource: StaffShiftDataSource[] = [];
    schedulerViews: any[] = SchedulerOptions.CalendarDefaultViewOptions;
    resourcesStaffList: any[] = [];

    /** Messages, Constants & Configuraitons */
    messages = Messages;
    weekDays = WeekDays;
    dateFormat = Configurations.DateFormat;
    dayViewDateFormat: string = "";//Configurations.SchedulerDateFormatDayView;
    weekViewDateFormatTo: string = "";//Configurations.SchedulerDateFormatWeekViewTo;
    weekViewDateFormatFrom = Configurations.SchedulerDateFormatWeekViewFrom;
    monthViewDateFormat = Configurations.SchedulerDateFormatMonthView;
    schedulerHeaderTimeFormat = Configurations.SchedulerHeaderTimeFormat;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    schedulerActivityType = SchedulerOptions.SchedulerActivityType;
    schedulerWeekDays = SchedulerWeekDays;
    timeFormat = Configurations.TimeFormat;
    APPOINTMENT_DEFAULT_COLLOR = "#337ab7";
    MARGIN_MIN_HOURS_TO_SCROLL: number = 1;
    recurrenceExceptionDateFormat: string = ""; //Configurations.RecurrenceExceptionDateFormat;
    schedulerStaffShiftToolTipDateFormat: string = "";


    // #endregion

    constructor(
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _authService: AuthService,
        public _schedulerFormDialog: MatDialogService,
        private _dataSharingService: DataSharingService,
    ) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
    }

    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.schedulerHeaderTimeFormat =  this.schedulerTimeFormat == Configurations.SchedulerTimeFormatWithFormat ? Configurations.SchedulerHeaderTimeFormatWith12Hours: Configurations.SchedulerTimeFormat;
        
        //this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.dayViewDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);
        this.weekViewDateFormatTo = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatWeekViewTo);
        this.recurrenceExceptionDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.RecurrenceExceptionDateFormat);
        this.schedulerStaffShiftToolTipDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerStaffShiftToolTipDateFormat);

        //implementation change after discuss with tahir bhai show branch current date not browser date implementaed by fahad dated on 03-03-2021
        this.branchDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

        this.currentDate = this.branchDate;
        this.startViewDate = this.branchDate;
        this.endViewDate = this.branchDate;

        this.scheduler.currentDate = this.branchDate;
        this.getAllSchedulerDataSource();
        this.isSaveShiftAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Shift_Save);
    }

    customizeDateNavigatorText = (e) => {

        if (!this.currentView || this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.CapsDay || this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineDay)
            return this._dateTimeService.convertDateObjToString(e.startDate, this.dayViewDateFormat);

        if (this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.CapsMonth)
            return this._dateTimeService.convertDateObjToString(e.startDate, this.monthViewDateFormat);

        /** for Week View */
        if (e.startDate.getMonth() === e.endDate.getMonth())
            return this._dateTimeService.convertDateObjToString(e.startDate, this.weekViewDateFormatFrom) + " - " + this._dateTimeService.convertDateObjToString(e.endDate, this.weekViewDateFormatTo);
        else {

            return this._dateTimeService.convertDateObjToString(e.startDate, this.weekViewDateFormatFrom) + " - " + this._dateTimeService.convertDateObjToString(e.endDate, this.weekViewDateFormatTo);
        }
    }

    getAllSchedulerDataSource() {

        let startDateParam = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormat),
            endDateParam = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormat),
            getSchedulerSearchFundamentals = this._httpService.get(StaffShiftApi.getCalendarFundamentals);

        let url = StaffShiftApi.getAll.
            replace("{staffID}", this.searchStaff.toString()).
            replace("{startDate}", startDateParam).
            replace("{endDate}", endDateParam),
            getSchedulerData = this._httpService.get(url);

        forkJoin([getSchedulerSearchFundamentals, getSchedulerData])
            .subscribe(
                data => {
                    this.getResponseSchedulerData(data);
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Shift")); }
            );
    }

    getResponseSchedulerData(data) {

        try {
            // mapdatasource
            this.mapResponseSchedulerDataToModel(data[1]);

            // search fundamentals
            if ((data[0].Result && data[0].Result.StaffList) && (data[0].Result && data[0].Result.StaffPositionList)) {
                this.staffListDataSource = [];
                data[0].Result.StaffList.forEach((sl) => {
                    if (data[0].Result.StaffPositionList.filter(x => x.StaffPositionID == sl.StaffPositionID).length > 0) {
                        let _objStaff = new ResourcesDataSource();
                        _objStaff.id = sl.StaffID;
                        _objStaff.text = sl.StaffFullName;
                        _objStaff.selected = false;
                        _objStaff.avatar = sl.ImagePath != "" ? this.serverImageAddress.replace("{ImagePath}",AppUtilities.setStaffImagePath()) + sl.ImagePath : this.staffImpagePath;
                        _objStaff.staffPositionID = sl.StaffPositionID;
                        _objStaff.staffPositionName = data[0].Result.StaffPositionList.find(x => x.StaffPositionID == sl.StaffPositionID).StaffPositionName;
                        this.staffListDataSource.push(_objStaff);
                    }
                });
            }
            if (data[0].Result && data[0].Result.StaffPositionList) {
                this.staffPositionListDataSource = [];
                data[0].Result.StaffPositionList.forEach(pl => {
                    let objPosition = new ResourcesDataSource();
                    objPosition.id = pl.StaffPositionID;
                    objPosition.text = pl.StaffPositionName;
                    this.staffPositionListDataSource.push(objPosition);
                });
            }
            this.resourcesStaffList = this.staffListDataSource;
            this.filteredStaffListDataSource = JSON.parse(JSON.stringify(this.staffListDataSource));
            this.setSchedulerViewsOption();
            this.markAllSchedulerSearchParameter();
        } catch (error) {
            this.disbaleLoadButton = true;
            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "shifts"));
        }
    }

    mapResponseSchedulerDataToModel(data) {
        this.staffShiftDataSource = [];
        if (data.Result) {
            data.Result.forEach(item => {
                let objSchedulerModel = new StaffShiftDataSource();
                objSchedulerModel.id = item.id;
                objSchedulerModel.text = item.text;
                objSchedulerModel.startDate = item.startDate.substr(0, item.startDate.indexOf("Z"));
                objSchedulerModel.endDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
                objSchedulerModel.displayStartDate = item.startDate.substr(0, item.startDate.indexOf("Z"));
                objSchedulerModel.displayEndDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
                objSchedulerModel.description = item.description;
                objSchedulerModel.StaffID = item.StaffID;
                objSchedulerModel.UnpaidBreak = item.UnpaidBreak;
                objSchedulerModel.recurrenceRule = item.recurrenceRule;// ? item.recurrenceRule.substr(0, item.recurrenceRule.indexOf("Z")) : item.recurrenceRule;
                objSchedulerModel.recurrenceException = item.recurrenceException;
                this.staffShiftDataSource.push(objSchedulerModel);
            });
        }
    }

    mapResonseSchedulerDataToModel_WeekView(data) {
        this.staffShiftDataSource = [];
        if (data.Result) {
            data.Result.forEach(item => {
                let objSchedulerModel = new StaffShiftDataSource();
                objSchedulerModel.id = item.id;
                objSchedulerModel.text = item.text;
                objSchedulerModel.displayStartDate = item.startDate.substr(0, item.startDate.indexOf("Z"));
                objSchedulerModel.displayEndDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
                objSchedulerModel.startDate = new Date(new Date(item.startDate.substr(0, item.startDate.indexOf("Z"))).setHours(0, 0, 0, 0));
                objSchedulerModel.endDate = new Date(new Date(item.endDate.substr(0, item.endDate.indexOf("Z"))).setHours(23, 59, 59, 59));
                objSchedulerModel.description = item.description;
                objSchedulerModel.StaffID = item.StaffID;
                objSchedulerModel.UnpaidBreak = item.UnpaidBreak;
                objSchedulerModel.recurrenceRule = item.recurrenceRule;// ? item.recurrenceRule.substr(0, item.recurrenceRule.indexOf("Z")) : item.recurrenceRule;

                //Start
                //this code added by fahad dated on 24-02-2021 not remove this code otherwise drag and drop functionlaty not show data properly
                var _recurrenceRule: string = "";
                if(item.recurrenceException){
                    let recurrenceExceptionList = [];
                    let strRException =  item.recurrenceException.split(',');
                    if (strRException) {
                        for (let index = 0; index < strRException.length; index++) {
                            if(strRException[index].toString().length > 5){
                                let exceptionDate = strRException[index].toString().split("T");
                                let exceptionDateTime = exceptionDate[0] + "T000000";
                                recurrenceExceptionList.push(exceptionDateTime)
                            }
                        }
                    }
                    if(recurrenceExceptionList){
                        _recurrenceRule = this.recurrenceExceptionListToCommaSeparatedString(recurrenceExceptionList);
                    }
                }
                
                objSchedulerModel.recurrenceException = _recurrenceRule;
                 //End
                // objSchedulerModel.recurrenceException = item.recurrenceException;
                this.staffShiftDataSource.push(objSchedulerModel);
            });
        }
    }

    recurrenceExceptionListToCommaSeparatedString(recurrenceExceptionList: any) {
        var i;
        var result: string = "";
        for (i = 0; i < recurrenceExceptionList.length; ++i) {
            result = result + recurrenceExceptionList[i] + ((recurrenceExceptionList.length - 1) == i ? "" : ",");
        }
        return result;
    }

    onAppointmentFormOpening(event) {
        event.popup.hide();
    }

    onAppointmentClick(event) {

        /** this date is set for edit click and "Edit this only" from series */
        this.selectedCellData.startDate = event.targetedAppointmentData.startDate;

        /** this is also used for prevent default popup on ViewMore click in monthView */
        if (event.appointmentElement.className.indexOf("dx-list-item") > -1) {
            setTimeout(() => {
                this.scheduler.instance.hideAppointmentTooltip();
                this.scheduler.instance.repaint();
            }, 100);
            event.cancel = true;
        }
    }

    onAppointmentDblClick(event) {

        event.cancel = true;
        if (this.isSaveShiftAllowed) {

            setTimeout(() => {
                this.scheduler.instance.hideAppointmentTooltip();
            }, 300);
            /** This startDate is set for "edit this only" while edit series shift  */
            this.selectedCellData.startDate = event.targetedAppointmentData.startDate;
            this.setSelectedCellData(event.appointmentData);
            this.openDialog_SeriesConfirm(event.appointmentData);
        }
    }

    onCellClick(e) {
        e.cancel = true;
        if (this.isSaveShiftAllowed) {
            this.selectedCellData.id = 0;
            this.selectedCellData.startDate = this.scheduler.currentView == this.schedulerStaticStrings.GetSchedulerStaticString.CapsMonth || this.scheduler.currentView == this.schedulerStaticStrings.GetSchedulerStaticString.CapsWeek ? new Date(new Date(e.cellData.startDate).setHours(new Date(e.cellData.startDate).getHours() + 1)) : e.cellData.startDate;
            this.selectedCellData.endDate = this.scheduler.currentView == this.schedulerStaticStrings.GetSchedulerStaticString.CapsMonth || this.scheduler.currentView == this.schedulerStaticStrings.GetSchedulerStaticString.CapsWeek ? new Date(new Date(this.selectedCellData.startDate).setMinutes(this.selectedCellData.startDate.getMinutes() + 60)) : e.cellData.endDate;
            //this.selectedCellData.allDay = e.cellData.allDay == undefined ? false : e.cellData.allDay;
            this.selectedCellData.StaffID = e.cellData.groups ? e.cellData.groups.StaffID : this.filteredStaffListDataSource ? this.filteredStaffListDataSource[0].id : 0;
            this.selectedCellData.isRecurrenceException = false;
            this.selectStaffForShift();
            if (this.scheduler.currentView !== this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineDay) {
                e.cellData.startDate = this.selectedCellData.startDate;
            }
            this.openDialog_SeriesConfirm(e.cellData);
        }
    }

    onContentReady(event) {

        //this.scrollToTime(event);
        let buttonHTMLClass = document.getElementsByClassName('today_green_btn'),
            calendarStartDate = this.scheduler.instance.getStartViewDate(),
            calendarEndDate = this.scheduler.instance.getEndViewDate(),
            today = new Date(this.branchDate.setHours(0, 0, 0)),
            todayText: string = "Today";

        if (buttonHTMLClass.length < 1) {

            let self = this;
            let element = document.querySelectorAll(".dx-scheduler-navigator");
            const container = document.createElement("div");
            container.setAttribute('class', 'today_green_btn');
            element[0].parentNode.insertBefore(container, element[0].nextSibling);

            new Button(container, {
                text: todayText,
                onClick: function () {
                    self.scheduler.instance.option("currentDate", today);
                }
            });
        }

        if (buttonHTMLClass.length > 0) {
            switch (this.scheduler.currentView) {
                case this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineDay:
                    buttonHTMLClass[0]['innerText'] = "Today";
                    break;
                case this.schedulerStaticStrings.GetSchedulerStaticString.CapsDay:
                    buttonHTMLClass[0]['innerText'] = "Today";
                    break;
                case this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineWeek:
                    buttonHTMLClass[0]['innerText'] = "This Week";
                    break;
                case this.schedulerStaticStrings.GetSchedulerStaticString.CapsWeek:
                    buttonHTMLClass[0]['innerText'] = "This Week";
                    break;
                case this.schedulerStaticStrings.GetSchedulerStaticString.CapsMonth:
                    buttonHTMLClass[0]['innerText'] = "This Month";
                    break;
            }
        }

        /** If button is found in current date then remove it */
        if (this.scheduler.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineDay || this.scheduler.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.CapsDay) {
            if (Date.parse(calendarStartDate.toString()) === Date.parse(today.toString())) {
                buttonHTMLClass[0].remove();
            }
        } else {
            if (Date.parse(today.toString()) >= Date.parse(calendarStartDate.toString()) && Date.parse(today.toString()) <= Date.parse(calendarEndDate.toString())) {
                buttonHTMLClass[0].remove();
            }
        }
    }

    selectStaffForShift() {
        if (this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.CapsMonth) {
            let filterStaff = this.filteredStaffListDataSource[0];
            this.selectedCellData.StaffFullName = filterStaff.text;
            this.selectedCellData.StaffEmail = filterStaff.email;
            this.selectedCellData.StaffPhone = filterStaff.mobile;
            this.selectedCellData.StaffPositionID = filterStaff.staffPositionID;
        }
        else {
            let filterStaff = this.filteredStaffListDataSource.filter(x => x.id == this.selectedCellData.StaffID)[0];
            this.selectedCellData.StaffFullName = filterStaff.text;
            this.selectedCellData.StaffEmail = filterStaff.email;
            this.selectedCellData.StaffPhone = filterStaff.mobile;
            this.selectedCellData.StaffPositionID = filterStaff.staffPositionID;
        }
    }

    setSelectedCellData(appointmentData) {

        this.selectedCellData.endDate = appointmentData.endDate;
        this.selectedCellData.id = appointmentData.id;
        this.selectedCellData.StaffID = appointmentData.StaffID;
        let filterStaff = this.filteredStaffListDataSource.filter(x => x.id == this.selectedCellData.StaffID)[0];
        this.selectedCellData.StaffFullName = filterStaff.text;
        this.selectedCellData.StaffPositionID = filterStaff.staffPositionID;
        this.selectedCellData.StaffEmail = filterStaff.email;
        this.selectedCellData.StaffPhone = filterStaff.mobile;
    }

    scrollToTime(event) {

        if (this.currentDate.getDate() == new Date(this.startViewDate).getDate()) {
            event.component.scrollToTime(this.currentDate.getHours(), this.currentDate.getMinutes(), this.currentDate);
        }
    }

    onAppointmentRendered(event) {

        if (!this.currentView || this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.CapsDay || this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineDay) {
            this.setShiftFixedHeight(event, "26px");
        }

        event.appointmentElement.removeAttribute("title");

        event.appointmentElement.style.backgroundColor = this.LightenColor("#26344b", 85);
        event.appointmentElement.style.borderLeft = "5px solid #26344b";
        event.appointmentElement.style.color = "#000000";

        let this_ = event;
        /** cancel keyboard event */
        event.appointmentElement.addEventListener("keydown", e => {
            if (e.key === "Enter" || e.code === "Space") {
                e.stopPropagation();
            } else if (e.key === "Delete") {
                e.stopPropagation();
                this.confirmDeleteShift(this_.appointmentData);
            }
        });
        
        events.on(event.appointmentElement, "dxdragstart", e => {
            this.isDragDrop = true;
            //Add this date for adding RecurrenceException
            this.dragStartDate = event.targetedAppointmentData.startDate;
            //this code added by fahad dated on 24-02-2021 not remove this code otherwise drag and drop functionlaty not show data properly
            if(event.appointmentElement) event.appointmentElement.removeClass('dx-draggable');
        });
        
    }

    setShiftFixedHeight(event: any, width: string) {
        /** Fixed height set from shift.calendar.css */
        var rowHeight = width;

        // try {
        //     var apptElement = event.appointmentElement;
        //     var transformLeft = $(apptElement).css("transform").split(',')[0].split(')')[0].split('(')[1].split('px')[0].trim();
        //     var transformTop = $(apptElement).css("transform").split(',')[1].split(')')[0].split('px')[0].trim();

        //     if (transformLeft !== "1" && transformTop !== "0") {
        //         $(apptElement).css({ 'transform': 'translate(' + transformLeft + 'px, ' + (transformTop) + 'px)' });
        //     } else {
        //         if ($(apptElement).css("transform").split(',')[0].indexOf('matrix') !== -1) {
        //             var transformLeft = $(apptElement).css("transform").split(',')[4].trim();
        //             var transformTop = $(apptElement).css("transform").split(',')[5].split(')')[0].trim();
        //             $(apptElement).css({ 'transform': 'translate(' + transformLeft + 'px, ' + (transformTop) + 'px)' });
        //         }
        //     }

        // } catch (error) { }
        event.appointmentElement.style.height = rowHeight;
    }

    LightenColor(col: any, p: number) {

        const R = parseInt(col.substring(1, 3), 16);
        const G = parseInt(col.substring(3, 5), 16);
        const B = parseInt(col.substring(5, 7), 16);
        const curr_total_dark = (255 * 3) - (R + G + B);

        // calculate how much of the current darkness comes from the different channels
        const RR = ((255 - R) / curr_total_dark);
        const GR = ((255 - G) / curr_total_dark);
        const BR = ((255 - B) / curr_total_dark);

        // calculate how much darkness there should be in the new color
        const new_total_dark = ((255 - 255 * (p / 100)) * 3);

        // make the new channels contain the same % of available dark as the old ones did
        const NR = 255 - Math.round(RR * new_total_dark);
        const NG = 255 - Math.round(GR * new_total_dark);
        const NB = 255 - Math.round(BR * new_total_dark);

        const RO = ((NR.toString(16).length === 1) ? "0" + NR.toString(16) : NR.toString(16));
        const GO = ((NG.toString(16).length === 1) ? "0" + NG.toString(16) : NG.toString(16));
        const BO = ((NB.toString(16).length === 1) ? "0" + NB.toString(16) : NB.toString(16));

        return "#" + RO + GO + BO;
    }

    onOptionChanged(e) {
        if (e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.DateSerializationoFormat &&
            e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.DataSource &&
            e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.Resources &&
            e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.Views &&
            e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.Height &&
            e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.SelectedCellData &&
            e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.Editing
        ) {  // firstTime loading check

            setTimeout(() => {
                try {
                    this.startViewDate = e.component.getStartViewDate();
                    this.endViewDate = e.component.getEndViewDate();
                    this.afterSaveStartDate = e.component.getStartViewDate();
                    this.afterSaveEndDate = e.component.getEndViewDate();
                    this.setStartDateAsEndDateInDayView(e.component.getEndViewDate());
                    //this.loadSearchFundamentals(true, false);
                } catch (error) {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "shifts"));
                    console.log('Error while change dates from view options');
                    //this.loadSearchFundamentals(true);
                }
            }, 1000);
            this.currentView = this.scheduler.currentView;
            this.resizePermissionInMonthView();
            this.setSchedulerHeight();
        }
    }

    setSchedulerViewsOption() {

        this.schedulerViews = [
            { type: this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineDay, name: "Day", groups: [SchedulerOptions.strStaffID], cellDuration: 60, maxAppointmentsPerCell: 2 },
            //{ type: this.schedulerStaticStrings.GetSchedulerStaticString.Week, name: "Week", groups: [SchedulerOptions.strStaffID], groupOrientation: "vertical", cellDuration: 1440 },
            { type: this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineWeek, name: "Week", groups: [SchedulerOptions.strStaffID], cellDuration: 1440 },
            { type: this.schedulerStaticStrings.GetSchedulerStaticString.Month, name: "Month", maxAppointmentsPerCell: 2 }
        ];
    }

    setSchedulerHeight() {
        this.currentView = this.scheduler.currentView;
        switch (this.currentView) {
            case this.schedulerStaticStrings.GetSchedulerStaticString.CapsDay:
                this.scheduler.height = "auto";
                break;
            case this.schedulerStaticStrings.GetSchedulerStaticString.CapsWeek:
                this.scheduler.height = "auto";
                break;
            case this.schedulerStaticStrings.GetSchedulerStaticString.CapsMonth:
                this.scheduler.height = "1100";
                break;
        }
    }

    updateActivityForDragDrop(event) {

        if (this.isSaveShiftAllowed) {

            if (event.newData) {
                if (Date.parse(event.newData.startDate) < Date.parse(event.newData.endDate)) {

                    /** check for drop end time is greater than  00 then endDate date is changed */
                    //(new Date(event.newData.endDate).getHours() === 0 && new Date(event.newData.endDate).getMinutes() >= 0) &&
                    if (new Date(event.newData.startDate).getDate() !== new Date(event.newData.endDate).getDate()) {
                        let setHoursToEndDate = new Date(new Date(event.newData.endDate).setHours(23, 59, 59, 59));
                        event.newData.endDate = new Date(setHoursToEndDate.setDate(new Date(event.newData.startDate).getDate()));
                    }
                    else {
                        /** if time is 12:00 am then donot allow to save this time, save on 59:59 */
                        if (new Date(event.newData.endDate).getHours() === 0 && new Date(event.newData.endDate).getMinutes() === 0) {
                            let setHoursToEndDate = new Date(new Date(event.newData.endDate).setHours(23, 59, 59, 59));
                            event.newData.endDate = new Date(setHoursToEndDate.setDate(new Date(event.newData.startDate).getDate()));
                        }
                        else {
                            if (new Date(event.newData.endDate).getHours() === 23 && new Date(event.newData.endDate).getMinutes() > 0) {
                                let setHoursToEndDate = new Date(new Date(event.newData.endDate).setHours(23, 59, 59, 59));
                                event.newData.endDate = new Date(setHoursToEndDate.setDate(new Date(event.newData.startDate).getDate()));
                            }
                            else {
                                /** If minute is 59 OR If minutes are geater than 0 */
                                if (new Date(event.newData.endDate).getMinutes() == 59 || new Date(event.newData.endDate).getMinutes() > 0) {
                                    let hourDifference = Math.abs(new Date(event.newData.startDate).getTime() - new Date(event.newData.endDate).getTime()) / 3600000;
                                    if (hourDifference > 1)
                                        event.newData.endDate = new Date(new Date(event.newData.endDate).setHours(new Date(event.newData.endDate).getHours() + 1, 0, 0));
                                }
                            }
                        }
                        /** If start Date minutes change to 59 then set as 00 */
                        if (new Date(event.newData.startDate).getMinutes() == 59 || new Date(event.newData.startDate).getMinutes() > 0) {
                            event.newData.startDate = new Date(new Date(event.newData.startDate).setHours(new Date(event.newData.startDate).getHours() + 1, 0, 0));
                        }
                    }
                    /** OLD Functionality, Confirm which action user want to perfom. */
                    /** New Functionality, Auto implement 'Edit This Only' */
                    this.setDragDropModel(event);

                    //this.openDialog_SeriesConfirm_DragDrop(event);
                } else {
                    this._messageService.showErrorMessage(this.messages.Validation.Endtime_Should_Greater_Than_Start_Time);
                    this.loadSearchFundamentals();
                }
            }
        }
        else {
            event.cancel = true;
            this._messageService.showErrorMessage(this.messages.Error.Permission_Action_UnAuthorized);
        }
    }

    staffListChangeAll() {

        this.filteredStaffListDataSource.forEach(item => {
            item.selected = this.schedulerSearchParam.AllStaff;
        });

        this.staffListChange();
    }

    staffListChange() {

        this.searchStaff = [];
        if (this.filteredStaffListDataSource && this.filteredStaffListDataSource.length > 0) {
            this.schedulerSearchParam.AllStaff = this.filteredStaffListDataSource.every((item: any) => item.selected == true);
        }

        //if (this.schedulerSearchParam.StaffPositionID > 0) {

        //    let staffWithPosition = this.filteredStaffListDataSource.filter(s => s.staffPositionID == this.schedulerSearchParam.StaffPositionID && s.selected == true);
        //    staffWithPosition.filter(x => x.selected == true).forEach(item => { this.searchStaff.push(item.id) });
        //}
        //else {
            this.filteredStaffListDataSource.filter(x => x.selected == true).forEach(item => { this.searchStaff.push(item.id) });
        //}
    }

    staffPositionChangeAll() {

        this.staffPositionListDataSource.forEach(item => {
            item.selected = this.schedulerSearchParam.AllStaffPosition;
        });
        this.onStaffPositionChange();
    }

    onStaffPositionChange() {
        this.searchStaff = [];
        this.schedulerSearchParam.AllStaffPosition = this.staffPositionListDataSource.every( p => p.selected === true);
        this.schedulerSearchParam.AllStaff = this.schedulerSearchParam.AllStaffPosition || this.staffPositionListDataSource.some(p => p.selected === true);
        this.filteredStaffListDataSource.forEach(staff => {
            staff.selected = false;
        });
            this.filteredStaffListDataSource = this.staffListDataSource.filter(x => this.staffPositionListDataSource.some( sp => sp.selected === true && sp.id === x.staffPositionID));
            this.resourcesStaffList = this.filteredStaffListDataSource;
            this.resourcesStaffList.forEach(x => {
                this.filteredStaffListDataSource.filter(s => s.id === x.id)[0].selected = true;
            })
        

        this.resourcesStaffList.forEach(item => { this.searchStaff.push(item.id) });
        this.loadSearchFundamentals(true);
    }

    markAllSchedulerSearchParameter() {
        this.schedulerSearchParam.AllStaffPosition = true;
        this.staffPositionListDataSource.forEach(item => {
            item.selected = this.schedulerSearchParam.AllStaffPosition;
        });

        this.schedulerSearchParam.AllStaff = true;
        this.filteredStaffListDataSource.forEach(item => {
            item.selected = this.schedulerSearchParam.AllStaff;
        });
    }

    filterStaffResourceGroup(selectedStaffIds) {
        if (this.resourcesStaffList.length > 0) {
            this.resourcesStaffList = this.filteredStaffListDataSource;     // Default is all Staffs
            let staffList: any[] = this.resourcesStaffList;
            if (selectedStaffIds.length > 1) {
                staffList = [];
                selectedStaffIds.forEach(id => {
                    staffList.push(this.resourcesStaffList.filter(x => x.id == id)[0]);
                });
            }
            else if (selectedStaffIds.length == 1) {
                staffList = [];
                staffList.push(this.resourcesStaffList.filter(x => x.id == selectedStaffIds[0])[0]);
            }
            this.resourcesStaffList = staffList;
        }
    }

    openDialog_SeriesConfirm(singleSchedulerData) {
        if (singleSchedulerData.recurrenceRule) {
            this.editSeriesDialogRef = this._schedulerFormDialog.open(EditSeriesComponent, { disableClose: true, data: { showAttendeeButton: false, heading: 'Shift' } });
            this.editSeriesDialogRef.componentInstance.confirmEditSeries.subscribe((isConfirmEditSeries: Number) => {
                if (isConfirmEditSeries === 1) {
                    this.selectedCellData.startDate = new Date(singleSchedulerData.startDate);
                    this.selectedCellData.isRecurrenceException = false;
                    this.openStaffShiftDialog();
                }
                else if (isConfirmEditSeries === 2) {
                    /** Edit This Only, add recurrenceException while saving */
                    this.selectedCellData.isRecurrenceException = true;

                    /** Because recurrence Start Date is different, 
                     * Now user Edit this only with selection of Date */
                    //this.selectedCellData.startDate = new Date(this.startViewDate);

                    this.openStaffShiftDialog();
                }
            });
        } else {
            this.selectedCellData.startDate = new Date(singleSchedulerData.startDate);
            this.selectedCellData.isRecurrenceException = false;
            this.openStaffShiftDialog();
        }
    }

    openStaffShiftDialog() {

        setTimeout(() => {
            this.scheduler.instance.hideAppointmentTooltip();
        }, 300);

        // this condition added by fahaf dated on 22-02-2021
        // searched single staff not show on create new shift in month view
        if (this.currentView == this.schedulerStaticStrings.GetSchedulerStaticString.CapsMonth && this.selectedCellData.id == 0 && this.searchStaff && this.searchStaff.length > 0) {
            this.selectedCellData.StaffID = this.searchStaff[0];
            let filterStaff = this.filteredStaffListDataSource.filter(x => x.id == this.selectedCellData.StaffID)[0];
            this.selectedCellData.StaffPositionID = filterStaff.staffPositionID;
        }

        this.dialogRef = this._schedulerFormDialog.open(SaveSchedulerStaffShiftComponent,
            {
                disableClose: true,
                data: this.selectedCellData
            });

        this.dialogRef.componentInstance.onUpdateSchedulerStaffShift.subscribe((model: any) => {
            this.staffShiftModel = model;
            this.saveStaffShift(this.staffShiftModel);
        });
    }

    setDragDropModel(event) {

        let newData = JSON.parse(JSON.stringify(event.newData)),
            oldData = JSON.parse(JSON.stringify(event.oldData));

        if (event.newData.recurrenceRule && this.isDragDrop) {
            /** ALI-ZIA - New Functionality, Shifts Auto functioned 'Edit This Only'  */
            /** Edit This Only, add recurrenceException while saving */
            this.selectedCellData.isRecurrenceException = true;
            /** Because recurrence Start Date is different, 
             * Now user Edit this only with selection of Date */
            this.selectedCellData.startDate = new Date(this.startViewDate);
            /** Now set default value */
            this.isDragDrop = false;
        }
        else {
            this.selectedCellData.isRecurrenceException = false;
        }
        this.updateShiftForDragDrop(newData, oldData);
    }

    openDialog_SeriesConfirm_DragDrop(event) {

        let newData = JSON.parse(JSON.stringify(event.newData)),
            oldData = JSON.parse(JSON.stringify(event.oldData));
        if (event.newData.recurrenceRule) {
            this.editSeriesDialogRef = this._schedulerFormDialog.open(EditSeriesComponent, { disableClose: true });
            this.editSeriesDialogRef.componentInstance.confirmEditSeries.subscribe((isConfirmEditSeries: number) => {
                if (isConfirmEditSeries === 1) {
                    this.selectedCellData.isRecurrenceException = false;
                    this.updateShiftForDragDrop(newData, oldData);
                }
                else if (isConfirmEditSeries === 2) {
                    /** Edit This Only, add recurrenceException while saving */
                    this.selectedCellData.isRecurrenceException = true;

                    /** Because recurrence Start Date is different, 
                     * Now user Edit this only with selection of Date */
                    this.selectedCellData.startDate = new Date(this.startViewDate);
                    this.updateShiftForDragDrop(newData, oldData);
                }
                else {
                    this.loadSearchFundamentals();
                }
            });
        } else {
            this.selectedCellData.isRecurrenceException = false;
            this.updateShiftForDragDrop(newData, oldData);
        }
    }

    loadSearchFundamentals(isLoadFilterStaffResourceGroup: boolean = false, displayErrorMsg: boolean = true) {

        /**
         * If Option is change then start and end date will be also change
         * so in filter activities we have to pass these params. 
         */

        let startDateParam, endDateParam;

        if (this.startViewDate && this.endViewDate){ 
        //if (this.startViewDate && this.endViewDate) {
            startDateParam = this._dateTimeService.convertDateObjToString(this.startViewDate, this.dateFormat);
            endDateParam = this._dateTimeService.convertDateObjToString(this.endViewDate, this.dateFormat);
        }
        else {
            startDateParam = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormat);
            endDateParam = this._dateTimeService.convertDateObjToString(this.branchDate, this.dateFormat);
        }

        /**
         * load the activities according to search params
         * start and end date is selected from calendar
         */

        if (this.validateSearchFilterStaff(displayErrorMsg)) {

            let url = StaffShiftApi.getAll.replace("{staffID}", this.searchStaff.toString())
                .replace("{startDate}", startDateParam)
                .replace("{endDate}", endDateParam);

            this._httpService.get(url)
                .subscribe(data => {
                    if(data && data.MessageCode > 0){
                    if (this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineWeek || this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.CapsWeek)
                        this.mapResonseSchedulerDataToModel_WeekView(data);
                    else
                        this.mapResponseSchedulerDataToModel(data);

                    if(isLoadFilterStaffResourceGroup) this.filterStaffResourceGroup(this.searchStaff);
                        debugger;
                    this.scheduler.instance.getDataSource().reload();
                    }else{
                        this._messageService.showErrorMessage(data.MessageText);
                    }
                    
                },
                    err => {
                        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Shift"));
                    }
                );
        }
    }

    resetSearchFundamentals() {

        /** 
         * If Option is change then start and end date would be change, 
         */
        this.markAllSchedulerSearchParameter();
        //this.schedulerSearchParam.StaffPositionID = 0;
        this.searchStaff = [];
        this.filteredStaffListDataSource.filter(x => x.selected == true).forEach(item => { this.searchStaff.push(item.id) });

        let startDateParam, endDateParam;

        if (this.startViewDate && this.endViewDate) {
            startDateParam = this.startViewDate;
            endDateParam = this.endViewDate;
        }
        else {
            startDateParam = this.branchDate;
            endDateParam = this.branchDate;
        }

        startDateParam = this._dateTimeService.convertDateObjToString(new Date(startDateParam), this.dateFormat),
            endDateParam = this._dateTimeService.convertDateObjToString(new Date(endDateParam), this.dateFormat);

        let url = StaffShiftApi.getAll.replace("{staffID}", this.searchStaff.toString())
            .replace("{startDate}", startDateParam)
            .replace("{endDate}", endDateParam);

        this._httpService.get(url)
            .subscribe(data => {
                if (data && data.Result) {
                    this.mapResponseSchedulerDataToModel(data);
                    this.resourcesStaffList = this.filteredStaffListDataSource;     // Default is all Staffs
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Shift")); }
            );
    }

    editStaffShift(singleStaffShift) {

        setTimeout(() => {
            this.scheduler.instance.hideAppointmentTooltip();
        });

        /** start Date is set from onAppointmentClick */
        this.selectedCellData.endDate = singleStaffShift.endDate;
        this.selectedCellData.id = singleStaffShift.id;
        this.selectedCellData.StaffID = singleStaffShift.StaffID;
        let filterStaff = this.filteredStaffListDataSource.filter(x => x.id == this.selectedCellData.StaffID)[0];
        this.selectedCellData.StaffFullName = filterStaff.text;
        this.selectedCellData.StaffPositionID = filterStaff.staffPositionID;
        this.openDialog_SeriesConfirm(singleStaffShift);
    }

    saveStaffShift(saveModel: StaffShift) {
        this._httpService.save(StaffShiftApi.save, saveModel)
            .subscribe(
                data => {
                    if (data && data.MessageCode > 0) {
                        this.closePopup();
                        this.loadSearchFundamentals();
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Staff Shift"));
                    } else if (data && (data.MessageCode === -138 || data.MessageCode === -139 || data.MessageCode === -140)) {
                        this._messageService.showErrorMessage(data.MessageText);
                        this.shiftExistError = true;
                        this.loadSearchFundamentals();
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff Shift"));
                }
            );
    }

    updateShiftForDragDrop(newUpdateData, oldData) {

        let copyNewData = newUpdateData,
            udpateData: UpdateStaffShift = new UpdateStaffShift(),
            oldDataStartTime = this.branchDate, oldDataEndTime = this.branchDate;

        udpateData.StaffShiftID = newUpdateData.id;
        udpateData["id"] = newUpdateData.id;      // For Use Generic addRecurrenceExceptionToModel
        udpateData.StaffID = newUpdateData.StaffID;
        udpateData.RecurrenceException = newUpdateData.recurrenceException;

        /** donot change time when drag n drop on WeekView */
        if (this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.CapsWeek) {
            udpateData.StartDate = newUpdateData.startDate;
            udpateData.RecurrenceRule = newUpdateData.recurrenceRule;
            this.addRecurrenceExceptionToModel(udpateData, oldData);
            oldDataStartTime = new Date(new Date(newUpdateData.startDate).setTime(new Date(oldData.displayStartDate).getTime())),
                oldDataEndTime = new Date(new Date(newUpdateData.endDate).setTime(new Date(oldData.displayEndDate).getTime()));
            udpateData.StartTime = this.convertDateToTimeSpan(new Date(oldDataStartTime));
            udpateData.EndTime = this.convertDateToTimeSpan(new Date(oldDataEndTime));
        }
        else {
            udpateData.StartDate = newUpdateData.startDate;
            udpateData.RecurrenceRule = newUpdateData.recurrenceRule;
            this.addRecurrenceExceptionToModel(udpateData, oldData);
            udpateData.StartTime = this.convertDateToTimeSpan(new Date(newUpdateData.startDate));
            udpateData.EndTime = this.convertDateToTimeSpan(new Date(newUpdateData.endDate));
        }

        this._httpService.update(StaffShiftApi.update, udpateData)
            .subscribe(response => {
                if (response && response.MessageCode > 0) {
                    if (this.selectedCellData.isRecurrenceException) {
                        //** Load again Data, Because recurrence rule should be null and paint the appointments remove currently recurrence shifts */
                        this.loadSearchFundamentals();
                    } else {
                        this.refreshDataSourceAfterDragDrop(copyNewData, oldDataStartTime, oldDataEndTime);
                    }

                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Staff Shift"));
                } else if (response && (response.MessageCode === -138 || response.MessageCode === -139 || response.MessageCode === -140)) {
                    this.loadSearchFundamentals();
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff Shift"));
                    this.loadSearchFundamentals();
                }
            );
    }

    confirmDeleteShift(shift: any) {
        setTimeout(() => {
            this.scheduler.instance.hideAppointmentTooltip();
        });
        /** Delete only this */
        if (!shift.recurrenceRule) {
            this.dialogRef = this._schedulerFormDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
            this.dialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
                if (isConfirmDelete) {
                    this.deleteStaffShift(shift.id, '');
                }
            });
        }
        /** Delete Series */
        if (shift.recurrenceRule) {
            this.dialogRef = this._schedulerFormDialog.open(DeleteSeriesComponent, { disableClose: true, data: { heading: "Shift"} });
            this.dialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: number) => {
                switch (isConfirmDelete) {
                    case 1:
                        this.deleteStaffShift(shift.id, '');
                        break;
                    case 2:
                        let exceptDate = this.generateExceptionString(this.selectedCellData.startDate);
                        this.deleteStaffShift(shift.id, exceptDate);
                        break;
                }
            });
        }
    }

    deleteStaffShift(staffShiftID, recurrenceException) {
        if (staffShiftID && staffShiftID > 0) {

            this._httpService.delete(StaffShiftApi.delete
                .replace("{shiftID}", staffShiftID)
                .replace("{recurrenceException}", recurrenceException)
            ).subscribe(
                response => {
                    if (response && response.MessageCode > 0) {
                        this.loadSearchFundamentals();
                        this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Staff Shift"));
                    } else if (response && response.MessageCode === -141) {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Staff Shift"));
                    this.loadSearchFundamentals();
                }
            )
        }
    }

     validateSearchFilterStaff(displayErrorMsg): boolean {
        /** it means reset all staff */
        if (this.schedulerSearchParam.AllStaff) {
            this.staffListChangeAll();
        }
        /** If no staff is selectd */
        let filterAllUnSelectedStaff = this.filteredStaffListDataSource.every(s => s.selected === false);
        if (filterAllUnSelectedStaff && displayErrorMsg) {
            this._messageService.showErrorMessage(this.messages.Validation.Scheduler_Staff_Required_Error);
            return false;
        } else
            return true;
    }

    convertDateToTimeSpan(date) {
        return date.getHours() + ":" + date.getMinutes();
    }

    resizePermissionInMonthView() {

        this.currentView = this.scheduler.currentView;
        /** donot allow resizing in Month View */
        if (this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.CapsMonth || this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.CapsWeek) {
            this.allowResizingOnScheduler = false;
        } else this.allowResizingOnScheduler = true;
    }

    setStartDateAsEndDateInDayView(endViewDate) {

        if (this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.CapsDay || this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineDay) {
            this.startViewDate = endViewDate;
            this.afterSaveStartDate = endViewDate;
        }
    }

    addRecurrenceExceptionToModel(activityModel: any, oldData) {

        if (this.selectedCellData.isRecurrenceException) {

            // if(!this.dragStartDate){
            //     this.dragStartDate = this.selectedCellData.startDate;
            // }
            //activityModel.RecurrenceException = this._dateTimeService.convertDateObjToString(new Date(activityModel.StartDate), Configurations.RecurrenceExceptionDateFormat)
            let formatRecurrenceDate = this._dateTimeService.convertDateObjToString(new Date(this.dragStartDate), this.recurrenceExceptionDateFormat);
            let _gethours = new Date(oldData.displayStartDate).getHours().toString(), _getminutes = new Date(oldData.displayStartDate).getMinutes().toString();
            if (_gethours.length === 1) _gethours = "0" + _gethours;
            if (_getminutes.length === 1) _getminutes = "0" + _getminutes;

            activityModel.RecurrenceException = formatRecurrenceDate + "T" + _gethours + _getminutes + "00";
            activityModel.RecurrenceRule = null;  // recurrence rule is always empty/null if edit this only appointment is going to update in case of Drag n Drop.
            activityModel.IsUpdate = false;
        }

        if (activityModel.StaffShiftID && activityModel.StaffShiftID > 0 && !this.selectedCellData.isRecurrenceException) {
            activityModel.IsUpdate = true;
        }
    }

    generateExceptionString(dateObj) {
        let formatRecurrenceDate = this._dateTimeService.convertDateObjToString(dateObj, this.recurrenceExceptionDateFormat);
        let _gethours = new Date(dateObj).getHours().toString(), _getminutes = new Date(dateObj).getMinutes().toString();
        if (_gethours.length === 1) _gethours = "0" + _gethours;
        if (_getminutes.length === 1) _getminutes = "0" + _getminutes;
        return formatRecurrenceDate + "T" + _gethours + _getminutes + "00";
    }

    refreshDataSourceAfterDragDrop(updatedData, oldDataStartTime, oldDataEndTime) {

        /** after paint refresh DataSourse */

        /** if drag n drop is using 'this only' then remove recurrence while repaint  */
        let filterStaffShift = this.staffShiftDataSource.filter(x => x.id === updatedData.id)[0];

        if (!this.selectedCellData.isRecurrenceException) {
            if (filterStaffShift.recurrenceRule) {
                filterStaffShift.recurrenceRule = updatedData.recurrenceRule;
            }
        }
        else {
            filterStaffShift.recurrenceRule = null;
        }

        if (filterStaffShift.recurrenceException) {
            filterStaffShift.recurrenceException = updatedData.recurrenceException;
        }

        if (this.currentView === this.schedulerStaticStrings.GetSchedulerStaticString.CapsWeek) {
            filterStaffShift.startDate = new Date(new Date(oldDataStartTime).setMonth(new Date(updatedData.startDate).getMonth(), new Date(updatedData.startDate).getDate()));
            filterStaffShift.endDate = new Date(new Date(oldDataEndTime).setMonth(new Date(updatedData.startDate).getMonth(), new Date(updatedData.startDate).getDate()));
            /** set time for week view */
            filterStaffShift.startDate = new Date(new Date(filterStaffShift.startDate).setHours(0, 0, 0, 0));
            filterStaffShift.endDate = new Date(new Date(filterStaffShift.endDate).setHours(23, 59, 59, 59));

            filterStaffShift.displayStartDate = new Date(new Date(oldDataStartTime).setMonth(new Date(updatedData.startDate).getMonth(), new Date(updatedData.startDate).getDate()));
            filterStaffShift.displayEndDate = new Date(new Date(oldDataEndTime).setMonth(new Date(updatedData.startDate).getMonth(), new Date(updatedData.startDate).getDate()));

        } else {
            filterStaffShift.startDate = updatedData.startDate;
            filterStaffShift.endDate = updatedData.endDate;
            filterStaffShift.displayStartDate = updatedData.startDate;
            filterStaffShift.displayEndDate = updatedData.endDate;
        }

        filterStaffShift.StaffID = updatedData.StaffID;
        this.staffShiftDataSource.filter(x => x.id === updatedData.id)[0] = filterStaffShift;
        /** Add recurrence Exception reload Datasource  */
        this.scheduler.dataSource = this.staffShiftDataSource;
        debugger;
        this.scheduler.instance.getDataSource().reload();
    }

    paintAppointmentPreviousSelection(oldData) {

        this.staffShiftDataSource.filter(x => x.id === oldData.id)[0].startDate = oldData.startDate;
        this.staffShiftDataSource.filter(x => x.id === oldData.id)[0].endDate = oldData.endDate;
        this.staffShiftDataSource.filter(x => x.id === oldData.id)[0].StaffID = oldData.StaffID;
        this.scheduler.dataSource = this.staffShiftDataSource;
    }

    closePopup() {
        this.dialogRef.close();
    }

}