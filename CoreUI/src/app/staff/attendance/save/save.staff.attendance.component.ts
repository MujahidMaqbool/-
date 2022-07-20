/** Angular */
import { Component, OnInit, ViewChild, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { SubscriptionLike as ISubscription, SubscriptionLike } from 'rxjs';

/** Models */
import { StaffAttendance } from 'src/app/staff/models/staff.attendance.model';
import { CellSelectedData } from 'src/app/scheduler/models/scheduler.model';
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';

/** Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';

/** Configuration, Commom, Constants */
import { Configurations } from 'src/app/helper/config/app.config';
import { Messages } from 'src/app/helper/config/app.messages';
import { StaffAttendanceApi } from 'src/app/helper/config/app.webapi';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { DatePipe } from '@angular/common';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

@Component({
    selector: 'save-staff-attendance',
    templateUrl: './save.staff.attendance.component.html'
})

export class SaveStaffAttendanceComponent extends AbstractGenericComponent implements OnInit {

    @ViewChild('staffAttendanceForm') staffAttendanceForm: NgForm;
    @Output() onUpdateStaffAttendance = new EventEmitter<StaffAttendance>();
    @Output() onDeleteStaffAttendance = new EventEmitter<boolean>();

    /** Models & Lists */
    staffAttendanceModel: StaffAttendance = new StaffAttendance();
    copyStaffAttendanceModel: StaffAttendance = new StaffAttendance();
    staffDetailSubscription: ISubscription

    /** Local Variables */
    staffList: any[] = [];
    selectedStaff: any = new Object();
    isShowError = false;
    deleteDialogRef: any;

    /** Configuration, Common, Constants & Messages */
    schedulerTimeFormat = Configurations.SchedulerTimeFormat;
    timeFormat = Configurations.TimeFormat;
    dateFormat = Configurations.DateFormat;
    messages = Messages;
    private SHOW_ERROR_MSG = "Time should be in your shift";
    shiftDescription = this.selectedCellData.ShiftDescription;
    showClockInNotes: boolean = false;
    showClockOutNotes: boolean = false;
    currentBranchSubscription: SubscriptionLike
    /** constructor */
    constructor(
        private _dateFilter: DatePipe,
        private _messageService: MessageService,
        private _httpService: HttpService,
        private _dateTimeService: DateTimeService,
        private _openDialogue: MatDialogService,
        public _dataSharingService: DataSharingService,
        public dialogRef: MatDialogRef<SaveStaffAttendanceComponent>,
        @Inject(MAT_DIALOG_DATA) public selectedCellData: CellSelectedData
    ) { 
        super();
    }

    /** component lifecycle */
    ngOnInit() {
        this.getBranchDatePattern();
        if (this.selectedCellData.id > 0) {
            this.getStaffAttendanceByID(this.selectedCellData.StaffShiftID, this.selectedCellData.id);
        }
        else {
            this.setDefaultValueToForm();
        }
        setTimeout(() => {
            this.setClockInOutNotes();
        }, 100);

    }

    async getBranchDatePattern() {
        this.schedulerTimeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.timeFormat =  this.schedulerTimeFormat;
    }
    /** Events */
    onClosePopup() {
        this.dialogRef.close();
    }

    clockout_valueChanged($event) {
        this.isShowError = false;
        if ($event.value) {
            this.showClockInNotes = false;
            this.showClockOutNotes = true;
        } else {
            this.showClockInNotes = true;
            this.showClockOutNotes = false;
        }
    }

    getStaffAttendanceByID(staffShiftID, staffAttendanceID) {
        let url = StaffAttendanceApi.getByID.replace("{staffShiftID}", staffShiftID)
            .replace("{staffAttendanceID}", staffAttendanceID);
        this._httpService.get(url)
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (response.Result) {
                            this.staffAttendanceModel = response.Result;
                            this.staffAttendanceModel.ClockIn = this._dateTimeService.convertTimeStringToDateTime(response.Result.ClockIn);
                            if (response.Result.ClockOut)
                                this.staffAttendanceModel.ClockOut = this._dateTimeService.convertTimeStringToDateTime(response.Result.ClockOut);
                            else
                                this.staffAttendanceModel.ClockOut = null;
                        }
                        else {
                            /** if have some error at least should load default values */
                            this.setDefaultValueToForm();
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Attendance")); }
            );
    }

    setDefaultValueToForm() {
        this.staffAttendanceModel.StaffAttendanceID = 0;
        this.staffAttendanceModel.StaffShiftID = this.selectedCellData.StaffShiftID;
        this.staffAttendanceModel.ClockIn = new Date(this.selectedCellData.startDate);
        this.staffAttendanceModel.ClockOut = null;
        this.staffAttendanceModel.ClockInNotes = "";
        this.staffAttendanceModel.ClockOutNotes = "";
    }

    saveAttendanceClockInOut(validate) {

        if (validate) {
            

            let clockinTime = this.getTimeStringFromDate(this.staffAttendanceModel.ClockIn, Configurations.TimeFormat);
            let clockoutTime = this.getTimeStringFromDate(this.staffAttendanceModel.ClockOut, Configurations.TimeFormat);

            //let clockinTime = Date.parse(this.staffAttendanceModel.ClockIn),
                //clockoutTime = Date.parse(this.staffAttendanceModel.ClockOut);
            /** Set 30 minutes margin time to clock-in */
            //this.selectedCellData.ShiftStartTime.setMinutes(this.selectedCellData.ShiftStartTime.getMinutes() - 30);
            /** donot allow to clockout after current time */
            if (clockinTime) {
                //if (!clockoutTime || (clockoutTime < Date.parse(new Date().toISOString()))) {
                //if (clockinTime >= this.selectedCellData.ShiftStartTime) {
                /** admin user allow to clock-in without clock-out timing */
                //if (this.staffAttendanceModel.StaffAttendanceID > 0) {
                if (!clockoutTime || (clockoutTime && clockinTime < clockoutTime)) {
                    this.setModelBiningAndSave();
                    //this.onClosePopup();
                    this.onUpdateStaffAttendance.emit(this.copyStaffAttendanceModel);
                }
                else {
                    this.SHOW_ERROR_MSG = this.messages.Validation.ClockOutTime_Should_Greater_Than_ClockInTime;
                    this.isShowError = true;
                }
            } else {
                this.SHOW_ERROR_MSG = this.messages.Validation.ClockIn_Time_Required;
                this.isShowError = true;
            }
        }
    }

    deleteStaffShiftAttendance() {

        this.deleteDialogRef = this._openDialogue.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                if (this.staffAttendanceModel.StaffAttendanceID > 0 && this.staffAttendanceModel.StaffShiftID > 0) {
                    this.copyStaffAttendanceModel = JSON.parse(JSON.stringify(this.staffAttendanceModel));
                    this.onClosePopup();
                    this.onDeleteStaffAttendance.emit(true);
                }
            }
        });
    }

    setModelBiningAndSave() {
        this.copyStaffAttendanceModel = JSON.parse(JSON.stringify(this.staffAttendanceModel));
        this.copyStaffAttendanceModel.ClockIn = this._dateTimeService.convertDateToTimeString(new Date(this.copyStaffAttendanceModel.ClockIn));
        this.copyStaffAttendanceModel.ClockOut = this.copyStaffAttendanceModel.ClockOut ? this._dateTimeService.convertDateToTimeString(new Date(this.copyStaffAttendanceModel.ClockOut)) : null;
        this.copyStaffAttendanceModel.StaffShiftID = this.selectedCellData.StaffShiftID;
        this.copyStaffAttendanceModel.ClockDate = this._dateTimeService.convertDateObjToString(this.selectedCellData.startDate, this.dateFormat);
    }

    setClockInOutNotes() {
        if (this.staffAttendanceModel.StaffAttendanceID == 0) {
            this.showClockInNotes = true;
            this.showClockOutNotes = false;
        }
        if (this.staffAttendanceModel.StaffAttendanceID > 0) {
            if (this.staffAttendanceModel.ClockOut) {
                this.showClockInNotes = false;
                this.showClockOutNotes = true;
            } else {
                this.showClockInNotes = true;
                this.showClockOutNotes = false;
            }
        }
    }

    getTimeStringFromDate(dateValue: Date, timeFormat: string) {
        return this._dateFilter.transform(dateValue, Configurations.TimeFormat);
    }
}