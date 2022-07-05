/********************* Angular References ********************/
import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


/**********************Component*********************/
import { SaveLeadComponent } from '@lead/save/save.lead.component';

/********************* Services & Models ********************/
/* Services */

/* Models*/

/********************** Common ***************************/

@Component({
    selector: 'save-lead-popup',
    templateUrl: './save.lead.popup.component.html'
})

export class AddLeadPopupComponent implements OnInit {
    
    // #region Local Members

    @ViewChild('addLeadRef') addLeadRef: SaveLeadComponent;
    @Output() isSaved = new EventEmitter<boolean>();

    /*********** Messages *********/

    /*********** Model References *********/

    /*********** Collection Types *********/

    /*********** Configurations *********/

    // #endregion


    constructor(private _dialogRef: MatDialogRef<AddLeadPopupComponent>) {
    }

    ngOnInit() {

    }

    // #region Events

    onSaveLead() {
        this.addLeadRef.saveLeadFormData.onSubmit(null);
    }

    onCloseDialog(shouldClose: boolean) {
        if (shouldClose) {
            this.closeDialog();
            this.isSaved.emit(true);
        }
    }

    // #endregion

    // #region Methods

    closeDialog() {
        this._dialogRef.close();
    }

    // #endregion
}