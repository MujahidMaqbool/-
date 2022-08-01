/********************* Angular References ********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


/********************** Components ***************************/
import { SaveClientComponent } from 'src/app/customer/client/save/save.client.component';

@Component({
    selector: 'save-client-popup',
    templateUrl: './save.client.popup.component.html'
})

export class SaveClientPopupComponent implements OnInit {

    @ViewChild('addClientRef') addClientRef: SaveClientComponent;


    constructor(private _dialogRef: MatDialogRef<SaveClientPopupComponent>) {
    }


    ngOnInit() {
    }

    // #region Events

    onSaveClient() {
        this.addClientRef.saveClientFormData.onSubmit(null);
    }

    onCloseDialog(shouldClose: boolean) {
        if (shouldClose) {
            this.closeDialog();
        }
    }

    // #endregion

    // #region Methods

    closeDialog() {
        this._dialogRef.close();
    }
    getSaveClientDisableStatus() {
        if ( this.addClientRef && this.addClientRef.saveClientFormData && this.addClientRef.saveClientFormData.pristine ) {
            return  this.addClientRef.saveClientFormData.pristine
        }
    }
    // #endregion
}
