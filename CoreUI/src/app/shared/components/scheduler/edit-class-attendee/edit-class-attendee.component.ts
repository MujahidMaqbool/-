/********************** Angular References *********************************/
import { Component, Output, EventEmitter, Inject, OnInit } from '@angular/core';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Individual } from 'src/app/helper/config/app.module.page.enums';

@Component({
    selector: 'edit-class-attendee',
    templateUrl: './edit-class-attendee.component.html',
})

export class EditClassAttendeeComponent implements OnInit {

    @Output() confirmEditClass = new EventEmitter<Number>();
    isManageAttendeAllow:boolean = false;

    constructor(
        private _authService:AuthService,
        public dialogRef: MatDialogRef<EditClassAttendeeComponent>,
        @Inject(MAT_DIALOG_DATA) public receiveData: any
    ) { }

    ngOnInit() {
        this.isManageAttendeAllow = this._authService.hasPagePermission(ENU_Permission_Module.Individual, ENU_Permission_Individual.AddAttendee);
    }

    onYes() {
        this.confirmEditClass.emit(1);
        this.dialogRef.close();
    }

    onManageAttendeeClick() {
        this.confirmEditClass.emit(2);
        this.dialogRef.close();
    }

    closePopup() {
        this.confirmEditClass.emit(3);
        this.dialogRef.close();
    }

}