/** Angular */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


import * as moment from 'moment';

/** Services */


/** Models */
import { StaffAttendanceModel } from 'src/app/attendance/models/staff.attendance.model';
import { environment } from 'src/environments/environment';

/** Messages & Constants */


@Component({
    selector: 'staff-attendance-success',
    templateUrl: './staff.attendance.success.popup.component.html'
})

export class StaffAttendanceSuccessPopup implements OnInit {
    
    // #region Local Variables 
    clock: string;

    /** Models */


    /** Lists */


    /** Configurations */
    serverImageAddress = environment.imageUrl;

    // #endregion

    constructor(
        public dialogRef: MatDialogRef<StaffAttendanceSuccessPopup>,
        @Inject(MAT_DIALOG_DATA) public staffAttendanceModel: StaffAttendanceModel
    ) { }

    ngOnInit() {
        // Runs the enclosed function on a set interval.
        setInterval(() => {
            this.clock = moment().format('HH:mm');
        }, 1000) // Updates the time every second.
    }

    // #region Events

    onClosePopup() {
        this.closePopup();
    }


    // #endregion


    // #region Methods

    closePopup() {
        this.dialogRef.close();
    }

    // #endregion
}