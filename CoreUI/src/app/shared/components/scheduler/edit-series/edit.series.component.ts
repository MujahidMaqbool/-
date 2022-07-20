/********************** Angular References *********************************/
import { Component, Output, EventEmitter, Inject, OnInit } from '@angular/core';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Individual } from 'src/app/helper/config/app.module.page.enums';

@Component({
    selector: 'edit-series',
    templateUrl: './edit.series.component.html',
})

export class EditSeriesComponent implements OnInit {

    @Output() confirmEditSeries = new EventEmitter<Number>();
    @Output() confirmManageAttendeeClick = new EventEmitter<boolean>();
    isShowAttendeeButton: boolean = false;
    isShowClassSeriesText: boolean = false;
    isAddAttendeeAllowed:boolean;
    heading: string = "";
    constructor(
        private _authService: AuthService,
        public dialogRef: MatDialogRef<EditSeriesComponent>,
        @Inject(MAT_DIALOG_DATA) public receiveData: any
    ) { }

    ngOnInit() {
        this.isAddAttendeeAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Individual, ENU_Permission_Individual.AddAttendee);

        this.heading = this.receiveData && this.receiveData.heading ? this.receiveData.heading : 'Shift';

        if (this.receiveData && this.receiveData.showAttendeeButton)
            this.isShowAttendeeButton = this.receiveData.showAttendeeButton;
        else
            this.isShowAttendeeButton = false;

        if (this.receiveData && this.receiveData.classEditSeriesText)
            this.isShowClassSeriesText = this.receiveData.classEditSeriesText;
        else
            this.isShowClassSeriesText = false;

    }

    onYes() {
        this.confirmEditSeries.emit(1);
        this.dialogRef.close();
    }

    onManageAttendeeClick() {
        this.confirmManageAttendeeClick.emit(true);
        this.dialogRef.close();
    }

    onNo() {
        this.confirmEditSeries.emit(2);
        this.dialogRef.close();
    }

    closePopup() {
        this.confirmEditSeries.emit(3);
        this.dialogRef.close();
    }

}