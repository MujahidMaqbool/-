import { Component, Output, EventEmitter, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'delete-series',
    templateUrl: './delete.series.component.html'
})
export class DeleteSeriesComponent {

    @Output()
    confirmDelete = new EventEmitter<number>();

    constructor(public dialogRef: MatDialogRef<DeleteSeriesComponent>,
        @Inject(MAT_DIALOG_DATA) public receiveData: any) { }

    onDeleteSeries() {
        this.confirmDelete.emit(1);
        this.closePopup();
    }

    onDeleteOnlyThis() {
        this.confirmDelete.emit(2);
        this.closePopup();
    }

    onNo() {
        this.confirmDelete.emit(0);
        this.closePopup();
    }

    closePopup() {
        this.dialogRef.close();
    }

}