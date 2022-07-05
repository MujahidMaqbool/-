import { Component, Output, EventEmitter, Input } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'generic-alert-dialog',
    templateUrl: './generic.alert.dialog.component.html'
})

export class GenericAlertDialogComponent {

    @Input() Message: string;

    @Output()
    confirmChange = new EventEmitter<boolean>();

    constructor(public dialogRef: MatDialogRef<GenericAlertDialogComponent>) { }

    onOk() {
        //this.confirmChange.emit(true);
        this.closePopup();
    }

    closePopup() {
        this.dialogRef.close();
    }
}