/** Angular */
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common'

/** Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';

/** Models */
import { StaffAttendanceModel, StaffClockIn, StaffClockOut } from 'src/app/attendance/models/staff.attendance.model';

/** App Component */

/** Messages & Constants */
import { Configurations } from 'src/app/helper/config/app.config';
import { StaffAttendanceApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';
import { environment } from 'src/environments/environment';
import { variables } from 'src/app/helper/config/app.variable';
import { AppUtilities } from 'src/app/helper/aap.utilities';


@Component({
    selector: 'staff-attendance',
    templateUrl: './staff.attendance.component.html'
})

export class StaffAttendanceComponent implements OnInit {

    @ViewChild('verifyStaffForm') verifyStaffForm: NgForm;

    // #region Local Variables 

    staffEmail: string;
    isStaffVerified: boolean = false;
    isStaffHasShift: boolean
    isStaffClockIn: boolean;
    isClockInSuccess: boolean = false;
    isClockOutSuccess: boolean = false;
    emailNotExist: boolean;
    shouldShow: boolean = false;

    /** Models */
    staffAttendanceModel: StaffAttendanceModel;
    staffClockinModel: StaffClockIn = new StaffClockIn();
    staffClockoutModel: StaffClockOut = new StaffClockOut();

    /** Lists */


    /** Configurations */
    messages = Messages;
    serverImageAddress = environment.imageUrl;
    timeFormat = Configurations.TimeFormat;
    dateFormat = Configurations.DateFormat;

    // #endregion

    constructor(
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService,
        public datepipe: DatePipe
    ) { }

    ngOnInit() {
    }

    // #region Events

    onVerifyStaff(isValid: boolean) {
        if (isValid) {
            this.emailNotExist = false;
            this.verifyStaff();
        }
    }

    onStaffClockIn() {
        this.staffClockin();
    }

    onStaffClockOut() {
        this.staffClockout();
    }

    onCancel() {
        this.resetAll();
    }

    // #endregion

    // #region Methods

    verifyStaff() {
        let params = {
            email: this.staffEmail.toLowerCase().trim()
        }

        this._httpService.get(StaffAttendanceApi.verifyStaff, params).subscribe(
            data => {
                if (data && data.Result) {
                    this.shouldShow = true;
                    this.staffAttendanceModel = data.Result;

                    if (this.staffAttendanceModel.StaffShift) {
                        this.isStaffHasShift = true;
                        this.staffAttendanceModel.StaffShift.StartTime = this._dateTimeService.formatTimeString(this.staffAttendanceModel.StaffShift.StartTime, this.timeFormat);
                        this.staffAttendanceModel.StaffShift.EndTime = this._dateTimeService.formatTimeString(this.staffAttendanceModel.StaffShift.EndTime, this.timeFormat);
                    }
                    else {
                        this.isStaffHasShift = false;
                    }

                    if (this.staffAttendanceModel.StaffAttendance) {
                        this.isStaffClockIn = true;
                        this.staffClockoutModel.ClockIn = this.staffAttendanceModel.StaffAttendance.ClockIn;
                        this.staffAttendanceModel.StaffAttendance.ClockIn = this._dateTimeService.formatTimeString(this.staffAttendanceModel.StaffAttendance.ClockIn, this.timeFormat);
                    }
                    else {
                        this.isStaffClockIn = false;
                    }

                    this.staffAttendanceModel.Staff.FullName = this.staffAttendanceModel.Staff.Title + ' ' + this.staffAttendanceModel.Staff.FirstName + ' ' + this.staffAttendanceModel.Staff.LastName;

                    if (this.staffAttendanceModel.Staff.ImagePath && this.staffAttendanceModel.Staff.ImagePath !== '') {
                        this.staffAttendanceModel.Staff.ImagePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setStaffImagePath()) + this.staffAttendanceModel.Staff.ImagePath;
                    }
                    else {
                        this.staffAttendanceModel.Staff.ImagePath = 'assets/images/portrait.png';
                    }

                    this.isStaffVerified = true;
                    this.staffEmail = '';
                }
                else {
                    this.emailNotExist = true;
                    this._messageService.showErrorMessage(data.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Staff_Email_Verify_Error);
            }
        )
    }

    staffClockin() {
        this.staffClockinModel.StaffShiftID = this.staffAttendanceModel.StaffShift.StaffShiftID;

        this._httpService.save(StaffAttendanceApi.staffClockIn, this.staffClockinModel)
            .subscribe(
                data => {
                    if (data && data.MessageCode > 0) {
                        this.isStaffClockIn = true;
                        this.staffClockinModel.ClockInNotes = "";
                        this.showClockInSuccessMessage();
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Staff_Clockin_Error);
                    }

                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Staff_Clockin_Error);
                }
            )
    }

    staffClockout() {

        this.staffClockoutModel.StaffShiftID = this.staffAttendanceModel.StaffShift.StaffShiftID;
        this.staffClockoutModel.StaffAttendanceID = this.staffAttendanceModel.StaffAttendance.StaffAttendanceID;
        this.staffClockoutModel.ClockDate = new Date();

        this._httpService.save(StaffAttendanceApi.staffClockOut, this.staffClockoutModel).subscribe(
            data => {
                if (data && data.MessageCode > 0) {
                    this.isStaffClockIn = false;
                    this.staffClockoutModel.ClockOutNotes = "";
                    this.showClockOutSuccessMessage();
                } else {
                    this._messageService.showErrorMessage(this.messages.Error.Staff_Clockout_Error);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Staff_Clockout_Error);
            }
        )
    }

    showClockInSuccessMessage() {
        this.isClockInSuccess = true;

        setTimeout(() => {
            this.isClockInSuccess = false;
            this.resetAll();
        }, Configurations.SuccessMessageTimeout);
    }

    showClockOutSuccessMessage() {
        this.isClockOutSuccess = true;

        setTimeout(() => {
            this.isClockOutSuccess = false;
            this.resetAll();
        }, Configurations.SuccessMessageTimeout);
    }

    resetAll() {
        this.staffEmail = '';
        this.isStaffVerified = false;
        this.isStaffClockIn = false;
        this.emailNotExist = false;
        this.verifyStaffForm.resetForm();
        this.staffAttendanceModel = new StaffAttendanceModel();
        this.staffClockinModel = new StaffClockIn();
        this.staffClockoutModel = new StaffClockOut();
    }

    // #endregion
}