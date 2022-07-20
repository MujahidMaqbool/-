import { Component, Output, EventEmitter, Inject } from "@angular/core";
import { Messages } from "src/app/helper/config/app.messages";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { ViewStaffAssociationComponent } from '../branch-association/view-staffassociation-popup/view.staff.association.popup';
import { SaveStaffForOtherBranch } from "../models/staff.model";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";

@Component({
    selector: 'branch-association',
    templateUrl: './branch.association.component.html'
})

export class BranchAssociationComponent {

    @Output() isConfirm = new EventEmitter<boolean>();

    constructor(        
        private _dialogRef: MatDialogRef<BranchAssociationComponent>,
        private _dialog: MatDialogService,
        @Inject(MAT_DIALOG_DATA) public staffId : number
    ) { }

    /*Model References*/
    otherBranchStaffModel: SaveStaffForOtherBranch;

    /* Messages */
    messages = Messages;

    // #region Events

    onYes() {
        this.openStaffAssociationPopup();
    }

    onNo() {
        this.isConfirm.emit(false);
        this.closePopup();
    }

    // #endregion

    // #region Methods

    openStaffAssociationPopup() {
        const dialogRef = this._dialog.open(ViewStaffAssociationComponent, {
            disableClose: true,
            data:this.staffId
        });        
    }

    closePopup() {
        this._dialogRef.close();
    }

    // #endregion
}