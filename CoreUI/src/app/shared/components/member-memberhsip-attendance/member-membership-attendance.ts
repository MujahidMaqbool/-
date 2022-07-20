// #region Imports

/********************** Angular Refrences *********************/
import { NgForm } from "@angular/forms";
import { Component, OnInit, Inject, Output, EventEmitter, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
/********************** Services & Models *********************/
/* Models */
/* Services */
import { MessageService } from "src/app/services/app.message.service";

/**********************  Configurations *********************/
import { AttendeMemberhsip, MemberMemberhsip } from "src/app/models/attendee.model";

import { Messages } from "src/app/helper/config/app.messages";
// #endregion

@Component({
    selector: 'member-memberhsip-attendance',
    templateUrl: 'member-membership-attendance.html'
})
export class MemberMemberhshipAttendance implements OnInit {

    // #region Local Members
    @ViewChild('MembershipFormData') MembershipFormData: NgForm;
    @Output() customerMemberhsipId = new EventEmitter<number>();

    /***********Messages*********/
    messages = Messages;
    /***********Local*********/

    memberhsipID: number = 0;
    /*********** Collections *********/
    /***********Model Reference*********/
    memberMemberhsip: MemberMemberhsip;

    // #endregion

    constructor(
        private _messageService: MessageService,
        public dialogRef: MatDialogRef<MemberMemberhshipAttendance>,
        @Inject(MAT_DIALOG_DATA) public attendeMemberhisp: AttendeMemberhsip[]) {
        this.memberMemberhsip = new MemberMemberhsip();
    }

    ngOnInit() {
    }

    onClosePopup(): void {
        this.dialogRef.close();
    }

   markAttendance(): void {
        if (this.memberMemberhsip.CustomerMembershipID > 0) {
            this.customerMemberhsipId.emit(this.memberMemberhsip.CustomerMembershipID);
            this.dialogRef.close();
        }
        else {
            this._messageService.showErrorMessage(this.messages.Error.Select_Membership);
        }
        //console.log(this.memberMemberhsip.CustomerMembershipID);
    }


}