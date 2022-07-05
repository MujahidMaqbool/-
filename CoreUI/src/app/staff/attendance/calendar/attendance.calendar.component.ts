/** Angular */
import { Component, ViewChild, OnInit } from '@angular/core';

/** Services */
import { HttpService } from '@services/app.http.service';
import { DateTimeService } from '@services/date.time.service';
import { DataSharingService } from '@services/data.sharing.service';
import { MessageService } from '@services/app.message.service';

/** Models */
import { CellSelectedData, SchedulerSearchParam, ShiftAndAttendanceDataSource } from '@scheduler/models/scheduler.model';
import { ResourcesDataSource } from '@scheduler/models/class.model';
import { StaffAttendance, CheckShiftsParameter } from '@staff/models/staff.attendance.model';

/** Messages & Constants */
import { Configurations, SchedulerOptions } from '@helper/config/app.config';

/** Component */
import { SaveStaffAttendanceComponent } from '@staff/attendance/save/save.staff.attendance.component';
import { environment } from '@env/environment';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';

/** devextreme */
import { DxSchedulerComponent } from 'devextreme-angular';
import Button from 'devextreme/ui/button'
import { Messages } from '@app/helper/config/app.messages';
import { StaffShiftApi, StaffAttendanceApi } from '@app/helper/config/app.webapi';
import { forkJoin, SubscriptionLike } from 'rxjs';
import { AuthService } from '@app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Staff } from '@app/helper/config/app.module.page.enums';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { variables } from '@app/helper/config/app.variable';
import { AppUtilities } from '@app/helper/aap.utilities';
import { ENU_DateFormatName } from '@app/helper/config/app.enums';
import { DD_Branch } from '@app/models/common.model';
declare var $: any;

@Component({
    selector: 'attendance-calendar',
    templateUrl: './attendance.calendar.component.html',
    styleUrls: ['./attendance.calendar.css']
})

export class AttendanceCalendarComponent extends AbstractGenericComponent implements OnInit {

    @ViewChild(DxSchedulerComponent) scheduler: DxSchedulerComponent;

    /** Local Variables */
    isSaveAttendanceAllowed: boolean = false;

    private schedulerStaticStrings = new SchedulerOptions();
    currentDate: Date = new Date();
    afterSaveStartDate: string;
    afterSaveEndDate: string;
    startViewDate: Date = new Date()
    endViewDate: Date = new Date();
    isDragDrop: boolean = false;
    searchStaff: any[] = [];
    disbaleLoadButton: boolean = false;
    countCellClick: number = 0;
    staffImpagePath: string = './assets/images/user.jpg';

    //scheduler load according branch Date
    branchDate: Date = new Date();

    /** Models */
    selectedCellData: CellSelectedData = new CellSelectedData();
    staffAttendanceModel: StaffAttendance = new StaffAttendance();
    checkShiftsParameter: CheckShiftsParameter = new CheckShiftsParameter();
    schedulerSearchParam: SchedulerSearchParam = new SchedulerSearchParam();

    /** Lists */
    staffListDataSource: any[] = [];
    filteredStaffListDataSource: any[] = [];
    staffPositionListDataSource: any[] = [];
    shareStaffList: any[] = [];
    shiftAndAttendanceDataSource: ShiftAndAttendanceDataSource[] = [];
    staffShiftList: any[] = [];
    staffAttedanceList: any[] = [];
    schedulerViews: any[] = SchedulerOptions.CalendarDefaultViewOptions;
    resourcesStaffList: any[] = [];
    renderAppointmentDataList: any[] = [];

    /** Alert Messages */
    messages = Messages;

    /** Configurations */
    timeFormat = Configurations.TimeFormat;
    serverImageAddress = environment.imageUrl;
    dateFormat: string = "";//Configurations.DateFormat;
    dayViewDateFormat: string = "";//Configurations.SchedulerDateFormatDayView;
    schedulerHeaderTimeFormat = Configurations.SchedulerHeaderTimeFormat;
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    dialogRef: any;
    currentBranchSubscription: SubscriptionLike;

    constructor(
        private _httpService: HttpService,
        private _authService: AuthService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        private _schedulerFormDialog: MatDialogService,
        private _dataSharingService: DataSharingService
    ) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
    }
    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.schedulerHeaderTimeFormat =  this.schedulerTimeFormat == Configurations.SchedulerTimeFormatWithFormat ? Configurations.SchedulerHeaderTimeFormatWith12Hours: Configurations.SchedulerTimeFormat;
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.dayViewDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerDateFormatDayView);

         //implementation change after discuss with tahir bhai show branch current date not browser date implementaed by fahad dated on 03-03-2021
         this.branchDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

         this.currentDate = this.branchDate;
        this.startViewDate = this.branchDate;
        this.endViewDate = this.branchDate;

        this.scheduler.currentDate = this.branchDate;


        this.getAllSchedulerDataSource();
        this.isSaveAttendanceAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Attendance_Save);
    }

    customizeDateNavigatorText = (e) => {

        return this._dateTimeService.convertDateObjToString(e.startDate, this.dayViewDateFormat);
    }

    getAllSchedulerDataSource() {
        let getSchedulerSearchFundamentals = this._httpService.get(StaffShiftApi.getCalendarFundamentals);

        let url = StaffAttendanceApi.getAllStaffAttendance.replace("{staffID}", "")
            .replace("{startDate}", this.branchDate.toISOString())
            .replace("{endDate}", this.branchDate.toISOString());
        let getSchedulerData = this._httpService.get(url);

        forkJoin([getSchedulerSearchFundamentals, getSchedulerData])
            .subscribe(
                data => {
                    this.getResponseSchedulerData(data);
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Attendance")); }
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
                        _objStaff.avatar = sl.ImagePath != "" ? this.serverImageAddress.replace("{ImagePath}", AppUtilities.setStaffImagePath()) + sl.ImagePath : this.staffImpagePath;
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
            this.shareData();
            this.markAllSchedulerSearchParameter();
        } catch (error) {
            this.disbaleLoadButton = true;
            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "shifts"));
        }
    }

    mapResponseSchedulerDataToModel(data) {

        this.shiftAndAttendanceDataSource = [];

        if (data.Result) {
            data = data.Result;

            if (data.StaffList) {
                this.shareStaffList = data.StaffList;   // share to saveAttendancecomponent
            }
            if (data.StaffShiftList) {
                this.staffShiftList = data.StaffShiftList;
                data.StaffShiftList.forEach(item => {
                    let objSchedulerModel = new ShiftAndAttendanceDataSource();
                    objSchedulerModel.id = item.id;
                    objSchedulerModel.startDate = item.startDate.substr(0, item.startDate.indexOf("Z"));
                    objSchedulerModel.endDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
                    objSchedulerModel.StaffID = item.StaffID;
                    objSchedulerModel.IsStaffAttendance = false;
                    objSchedulerModel.IsShiftAttended = false;
                    this.shiftAndAttendanceDataSource.push(objSchedulerModel);
                });
            }
            if (data.StaffAttendanceList) {
                this.staffAttedanceList = data.StaffAttendanceList;
                data.StaffAttendanceList.forEach(item => {
                    let objSchedulerModel = new ShiftAndAttendanceDataSource();
                    objSchedulerModel.id = item.id;
                    objSchedulerModel.StaffID = item.StaffID;
                    objSchedulerModel.StaffShiftID = item.StaffShiftID;
                    objSchedulerModel.startDate = item.startDate.substr(0, item.startDate.indexOf("Z"));
                    objSchedulerModel.endDate = item.endDate.substr(0, item.endDate.indexOf("Z"));
                    objSchedulerModel.IsStaffAttendance = true;
                    objSchedulerModel.AttendanceStatus = item.AttendanceStatus;
                    this.shiftAndAttendanceDataSource.push(objSchedulerModel);
                    /** check shift has attended */
                    this.shiftAndAttendanceDataSource.filter(x => x.IsStaffAttendance === false && x.id == objSchedulerModel.StaffShiftID)[0].IsShiftAttended = true;
                    this.scheduler.dataSource = this.shiftAndAttendanceDataSource;
                });
            }
        }
    }

    shareData() {
        this._dataSharingService.shareStaffList(this.shareStaffList);
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

    scrollToTime(event) {

        if (this.currentDate.getDate() == new Date(this.startViewDate).getDate()) {
            event.component.scrollToTime(this.currentDate.getHours(), this.currentDate.getMinutes(), this.currentDate);
        }
    }

    onAppointmentFormCreated($event) {
        $event.component._popup.hide();
    }

    onAppointmentRendered(e) {
        this.onRenderingSetHeight(e);
    }

    onRenderingSetHeight(e) {

        /** This function is used for Rendered Appointment layout Issue with transformation. */
        //this.setAppointmentRenderedList(e.appointmentData);

        // Attendance Timing
        let isSetMarginTop: boolean = false;
        if (e.appointmentData.IsStaffAttendance) {
            if (e.appointmentData.AttendanceStatus === 1) {
                e.appointmentElement.style.backgroundColor = "#B5E4F0";
            }
            else if (e.appointmentData.AttendanceStatus === 2) {
                e.appointmentElement.style.backgroundColor = super.changeLightColor('#1B6EB8', 85);
                //e.appointmentElement.style.backgroundImage = "repeating-linear-gradient(130deg, #9cd89c 8%,green 12%);"
            }

            /** Check If attendance is marked before shift time */
            let filterShift = this.shiftAndAttendanceDataSource.find(x => x.id == e.appointmentData.StaffShiftID && !x.IsStaffAttendance);
            if (filterShift) {
                if (Date.parse(filterShift.startDate) > Date.parse(e.appointmentData.startDate)) {
                    isSetMarginTop = true;
                }
            }
            this.setAppointmentFixedHeight(e, "43px", isSetMarginTop);

            /** Margin if attendance is marked before shift */
            //let filterShift = this.shiftAndAttendanceDataSource.find(x => x.IsStaffAttendance == false && x.id == e.appointmentData.id)
        }
        // Shifts Timing
        else {
            /** check current render shift have any attendance */
            let filterAttendance = this.shiftAndAttendanceDataSource.find(x => x.StaffShiftID == e.appointmentData.id);
            /** has attendance */
            if (filterAttendance) {
                /** Check If attendance is marked before shift time and ,  attendance running end time should greater than shift start time */
                if (Date.parse(filterAttendance.startDate) < Date.parse(e.appointmentData.startDate) && Date.parse(filterAttendance.endDate) > Date.parse(e.appointmentData.startDate)) {
                    isSetMarginTop = true;
                }
                e.appointmentElement.style.backgroundColor = "#26344B";
                this.setAppointmentFixedHeight(e, "8px", isSetMarginTop);
            } else {
                /** has not any attendance */
                this.setAppointmentFixedHeight(e, "50px");
                e.appointmentElement.style.backgroundColor = "#dee2e6";
            }
        }
    }

    onAppointmentClick($event) {
        $event.cancel = true;
    }

    onAppointmentDblClick($event) {

        $event.cancel = true;

        if (this.isSaveAttendanceAllowed) {

            setTimeout(() => {
                this.scheduler.instance.hideAppointmentTooltip();
            }, 100);

            switch ($event.appointmentData.IsStaffAttendance) {
                /** Case1: If shift has attendance & clickable only attendance */
                case true:
                    let convertShiftToAttendance = this.shiftAndAttendanceDataSource.filter(x => x.IsStaffAttendance === false && x.id == $event.appointmentData.StaffShiftID);
                    if (convertShiftToAttendance) {
                        let shift = JSON.parse(JSON.stringify(convertShiftToAttendance));
                        shift[0].id = $event.appointmentData.id;
                        shift[0].StaffShiftID = $event.appointmentData.StaffShiftID;
                        this.setModelClockOutAttendance(shift[0]);
                        this.openStaffAttendanceDialog();
                    }
                    break;
                /** Case2: If it is a shift and donot have attendance */
                case false:
                    if (!this.isStaffShiftHasAttendance($event.appointmentData)) {
                        this.setModelClockInAttendance($event.appointmentData)
                        this.openStaffAttendanceDialog();
                    }
                    break;
            }
        }
    }

    onCellClick($event) {
        $event.cancel = true;
    }

    onOptionChanged(e) {

        if (e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.DateSerializationoFormat &&
            e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.DataSource &&
            e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.Resources &&
            e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.Views &&
            e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.Height &&
            e.name !== this.schedulerStaticStrings.GetSchedulerStaticString.SelectedCellData) {  // firstTime loading check
            setTimeout(() => {
                let _getstartDate = JSON.parse(JSON.stringify(e.component.getStartViewDate())),
                    _getendDate = JSON.parse(JSON.stringify(e.component.getEndViewDate()))
                this.startViewDate = _getstartDate;
                this.endViewDate = _getendDate;
                this.afterSaveStartDate = _getstartDate;
                this.afterSaveEndDate = _getendDate;
                this.loadSearchFundamentals(false);
            }, 1000);
        }
    }

    setSchedulerViewsOption() {
        this.schedulerViews = [{ type: this.schedulerStaticStrings.GetSchedulerStaticString.TimeLineDay, name: "Day", groups: [SchedulerOptions.strStaffID], maxAppointmentsPerCell: 4 }];
    }

    editShiftAttendance(selectedShift) {

    }

    isStaffShiftHasAttendance(shiftData) {

        let filterAttendance = this.shiftAndAttendanceDataSource.filter(x => x.IsStaffAttendance && x.StaffShiftID == shiftData.id)[0];
        if (filterAttendance) {
            return true;
        } else {
            return false;
        }
    }

    setModelClockInAttendance(appointmentData) {

        this.selectedCellData.startDate = appointmentData.startDate;
        this.selectedCellData.endDate = null;
        this.selectedCellData.id = 0;
        this.selectedCellData.StaffID = appointmentData.StaffID;
        this.selectedCellData.StaffShiftID = appointmentData.id;
        this.selectedCellData.ShiftStartTime = appointmentData.startDate;
        this.selectedCellData.ShiftEndTime = appointmentData.endDate;
    }

    setModelClockOutAttendance(appointmentData) {

        this.selectedCellData.startDate = appointmentData.startDate;
        this.selectedCellData.endDate = null;
        this.selectedCellData.id = appointmentData.id;
        this.selectedCellData.StaffID = appointmentData.StaffID;
        this.selectedCellData.StaffShiftID = appointmentData.StaffShiftID;
        this.selectedCellData.ShiftStartTime = appointmentData.startDate;
        this.selectedCellData.ShiftEndTime = appointmentData.endDate;
    }

    updateAttendanceForDragDrop($event) {

        /** Donot facilitate to drag and drop for clock-in/out 
         * And back to the previous position.
        */
        $event.cancel = true;
    }

    staffListChangeAll() {
        this.filteredStaffListDataSource.forEach(item => {
            item.selected = this.schedulerSearchParam.AllStaff;
        });
        this.staffListChange();
    }

    staffPositionChangeAll() {

        this.staffPositionListDataSource.forEach(item => {
            item.selected = this.schedulerSearchParam.AllStaffPosition;
        });
        this.onStaffPositionChange();
    }

    onStaffPositionChange() {
        this.searchStaff = [];
        //this.staffPositionChangeId = staffPositionId;
        this.schedulerSearchParam.AllStaffPosition = this.staffPositionListDataSource.every(p => p.selected === true);
        this.schedulerSearchParam.AllStaff = this.schedulerSearchParam.AllStaffPosition || this.staffPositionListDataSource.some(p => p.selected === true);
        this.filteredStaffListDataSource.forEach(staff => {
            staff.selected = false;
        });

        //if (staffPositionId > 0) {
        //this.isStaffPositionChange = true;
        this.filteredStaffListDataSource = this.staffListDataSource.filter(x => this.staffPositionListDataSource.some(sp => sp.selected === true && sp.id === x.staffPositionID));
        this.resourcesStaffList = this.filteredStaffListDataSource;
        this.resourcesStaffList.forEach(x => {
            this.filteredStaffListDataSource.filter(s => s.id === x.id)[0].selected = true;
        })
        //} 
        // else {
        //     this.isStaffPositionChange = false;
        //     this.staffListDataSource.forEach(staff => {
        //         staff.selected = true;
        //     });
        //     this.resourcesStaffList = this.staffListDataSource;
        // }

        this.resourcesStaffList.forEach(item => { this.searchStaff.push(item.id) });

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
            this.scheduler.instance.repaint();
        }
    }

    openStaffAttendanceDialog() {

        setTimeout(() => {
            this.scheduler.instance.hideAppointmentTooltip();
        }, 300);

        this.dialogRef = this._schedulerFormDialog.open(SaveStaffAttendanceComponent,
            {
                disableClose: true,
                data: this.selectedCellData
            });

        this.dialogRef.componentInstance.onUpdateStaffAttendance.subscribe((model: any) => {
            this.staffAttendanceModel = this.dialogRef.componentInstance.copyStaffAttendanceModel;
            this.saveStaffAttendanceAndRepaintScheduler(this.staffAttendanceModel);
        });

        this.dialogRef.componentInstance.onDeleteStaffAttendance.subscribe((isDelete: boolean) => {
            if (isDelete) {
                this.staffAttendanceModel = this.dialogRef.componentInstance.copyStaffAttendanceModel;
                this.deleteStaffAttendance(this.staffAttendanceModel.StaffShiftID, this.staffAttendanceModel.StaffAttendanceID);
            }
        });
    }

    getStaffAttendanceAndSaveForDragDrop(updateStaffModel) {
        let url = StaffAttendanceApi.getByID.replace("{staffShiftID}", updateStaffModel.StaffShiftID)
            .replace("{staffAttendanceID}", updateStaffModel.id);
        this._httpService.get(url)
            .subscribe(
                data => {
                    if (data && data.Result) {
                        let staffAttendanceModel: StaffAttendance = data.Result;
                        staffAttendanceModel.StaffID = updateStaffModel.StaffID;
                        staffAttendanceModel.ClockIn = this._dateTimeService.convertDateToTimeString(new Date(updateStaffModel.startDate));
                        staffAttendanceModel.ClockOut = this._dateTimeService.convertDateToTimeString(new Date(updateStaffModel.endDate));
                        this.saveStaffAttendanceAndRepaintScheduler(staffAttendanceModel);
                    }else{
                        this._messageService.showErrorMessage(data.MessageText)
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Attendance")); }
            );
    }

    saveStaffAttendanceAndRepaintScheduler(saveModel: StaffAttendance) {

        this._httpService.save(StaffAttendanceApi.saveStaffAttendance, saveModel)
            .subscribe(
                data => {
                    if (data && data.MessageCode > 0) {
                        this.closePopup();
                        this.loadSearchFundamentals();
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Staff Attendance"));
                    } else if (data.MessageCode == -28) {
                        this._messageService.showErrorMessage(this.messages.Validation.Shift_Exist);
                    }
                },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff Attendance"));
                }
            );
    }

    deleteStaffAttendance(staffShiftID, attendanceID) {

        if (staffShiftID > 0 && attendanceID > 0) {
            let deleteAPIUrl = StaffAttendanceApi.deleteStaffAttendance.replace("{staffShiftID}", staffShiftID).replace("{staffAttendanceID}", attendanceID);
            this._httpService.delete(deleteAPIUrl)
                .subscribe(
                    data => {
                        if (data && data['MessageCode'] > 0) {
                            this.closePopup();
                            this.loadSearchFundamentals();
                            this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Staff Attendance"));
                        }
                        else
                            this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Staff Attendance"));
                    },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Staff Attendance")); }
                )
        }
    }

    loadSearchFundamentals(displayErrorMsg: boolean = true) {

        /**
         * If Option is change then start and end date will be also change
         * so in filter activities we have to pass these params. 
         */

        let startDateParam, endDateParam;

        if (this.startViewDate && this.endViewDate) {
            startDateParam = this.startViewDate;
            endDateParam = this.endViewDate;
        }
        else {
            startDateParam = this.branchDate;
            endDateParam = this.branchDate;
        }

        /**
         * load the activities according to search params
         * start and end date is selected from calendar
         */

        startDateParam = this._dateTimeService.convertDateObjToString(new Date(startDateParam), this.dateFormat),
            endDateParam = this._dateTimeService.convertDateObjToString(new Date(endDateParam), this.dateFormat);

        if (this.validateSearchFilterStaff(displayErrorMsg)) {
            let url = StaffAttendanceApi.getAllStaffAttendance.replace("{staffID}", this.searchStaff.toString())
                .replace("{startDate}", startDateParam)
                .replace("{endDate}", endDateParam);

            this._httpService.get(url)
                .subscribe(
                    data => {
                        if(data && data.MessageCode > 0){
                        this.mapResponseSchedulerDataToModel(data);
                        this.filterStaffResourceGroup(this.searchStaff);

                        }else{
                            this._messageService.showErrorMessage(data.MessageText)
                        }
                    },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Attendance")); }
                );
        }
    }

    resetSearchFundamentals() {
        /** 
         * If Option is change then start and end date would be change
         */
        this.markAllSchedulerSearchParameter();
        //this.schedulerSearchParam.StaffPositionID = 0;
        this.searchStaff = [];
        this.filteredStaffListDataSource.filter(x => x.selected == true).forEach(item => { this.searchStaff.push(item.id) });

        let startDateParam, endDateParam;
        if (this.startViewDate && this.endViewDate) {
            startDateParam = this.startViewDate;
            endDateParam = this.endViewDate;
        } else {
            startDateParam = this.branchDate;
            endDateParam = this.branchDate;
        }

        startDateParam = this._dateTimeService.convertDateObjToString(new Date(startDateParam), this.dateFormat),
            endDateParam = this._dateTimeService.convertDateObjToString(new Date(endDateParam), this.dateFormat);

        let url = StaffAttendanceApi.getAllStaffAttendance.replace("{staffID}", this.searchStaff.toString())
            .replace("{startDate}", startDateParam)
            .replace("{endDate}", endDateParam);

        this._httpService.get(url)
            .subscribe(
                data => {
                    if (data && data.Result) {
                        this.mapResponseSchedulerDataToModel(data);
                        this.resourcesStaffList = this.filteredStaffListDataSource;
                    }
                    else{
                        this._messageService.showErrorMessage(data.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Attendance")); }
            );
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

    isTimeInRange(startTime, endTime, range) {
        return startTime >= range[0] && endTime <= range[1];
    }

    setAppointmentFixedHeight(event: any, height: string, setTopMargin?) {

        try {
            var rowHeight = height, marginTop = 26;
            if (setTopMargin) {
                /** If shift and attendance together, then margin both with top */
                if (height == "8px") {
                    marginTop = 31;
                    event.appointmentElement.style.top = "0px";
                }
                else if (height == "43px") {
                    event.appointmentElement.style.top = "7px";
                }
                else {
                    event.appointmentElement.style.top = "0px";
                }
            }
            var apptElement = event.appointmentElement;
            var transformLeft = $(apptElement).css("transform").split(',')[0].split(')')[0].split('(')[1].split('px')[0].trim();
            var transformTop = $(apptElement).css("transform").split(',')[1].split(')')[0].split('px')[0].trim();
            if (transformLeft !== "1" && transformTop !== "0") {
                $(apptElement).css({ 'transform': 'translate(' + transformLeft + 'px, ' + (transformTop - marginTop) + 'px)' });
            } else {
                if ($(apptElement).css("transform").split(',')[0].indexOf('matrix') !== -1) {
                    var transformLeft = $(apptElement).css("transform").split(',')[4].trim();
                    var transformTop = $(apptElement).css("transform").split(',')[5].split(')')[0].trim();
                    $(apptElement).css({ 'transform': 'translate(' + transformLeft + 'px, ' + (transformTop - marginTop) + 'px)' });
                }
            }

        } catch (e) { }
        event.appointmentElement.style.height = rowHeight;
    }

    setTopMarginShiftAndAttendance() {
        /** If shift and attendance toge */
    }

    closePopup() {
        this.dialogRef.close();
    }
}