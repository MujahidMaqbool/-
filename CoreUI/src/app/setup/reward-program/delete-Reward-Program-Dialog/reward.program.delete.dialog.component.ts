import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateTimeService } from '@app/services/date.time.service';

@Component({
    selector: 'app-delete-RewardProgram',
    templateUrl: './reward.program.delete.dialog.component.html',
})
export class RewardProgramDelete implements OnInit {
    @Output() terminationScheduledDate = new EventEmitter<any>();
    minDate: Date = new Date();;
    dateFormatForSearch = 'yyyy-MM-dd';
    DeleteDate : Date = new Date();
    terminationDate:any;
    
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _dateTimeService: DateTimeService,
        private dialogRef: MatDialogRef<RewardProgramDelete>
    ) {}

     ngOnInit() {
       this.getBranchDatePattern();
    }
    async getBranchDatePattern(){
        this.minDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.terminationDate = this._dateTimeService.convertDateObjToString(this.minDate, this.dateFormatForSearch);
        this.DeleteDate = this.minDate;
    }
    onCancel() {
        this.dialogRef.close();
    }
    onDateChange(date: any) {
        setTimeout(() => {
            this.terminationDate = this._dateTimeService.convertDateObjToString(date, this.dateFormatForSearch);
        });
    }
    onConfirm(){
        this.terminationScheduledDate.emit(this.terminationDate);
        this.dialogRef.close();
    }
}
