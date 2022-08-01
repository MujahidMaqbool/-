/************************* Angular References ***********************************/
import { Component, Inject } from '@angular/core'

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'view-notification',
    templateUrl: './view.notification.component.html'
})
export class ViewNotificationComponent {


    Notification: any = {};
    constructor(
        public dialogRef: MatDialogRef<ViewNotificationComponent>,
        @Inject(MAT_DIALOG_DATA) public notiObj: any) { }


    ngOnInit() {
        this.Notification = this.notiObj;
    }

    onYes() {
        this.closePopup();
    }

    onNo() {
        this.closePopup();
    }

    closePopup() {
        this.dialogRef.close();
    }

}
