/********************* Angular References ********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SaveClientComponent } from '@customer/client/save/save.client.component';

/**********************Component*********************/

/********************* Services & Models ********************/
/* Services */

/* Models*/

/********************** Common ***************************/

@Component({
    selector: 'save-client-popup',
    templateUrl: './save.client.popup.component.html'
})

export class SaveClientPopupComponent implements OnInit {
    // #region Local Members

    @ViewChild('addClientRef') addClientRef: SaveClientComponent;

    /*********** Messages *********/

    /*********** Model References *********/

    /*********** Collection Types *********/
    
    /*********** Configurations *********/
    
    // #endregion

    
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