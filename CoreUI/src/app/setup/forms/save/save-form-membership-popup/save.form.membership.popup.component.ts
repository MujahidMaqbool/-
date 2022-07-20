/********************* Angular References ********************/
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FundamentalsMemberships } from 'src/app/setup/models/custom.form.model';


/********************** Services & Model *********************/

@Component({
    selector: 'save-membership-form',
    templateUrl: './save.form.membership.popup.component.html'
})

export class SaveMembershipFormComponent implements OnInit {

    @Output() onMembershipsSelect = new EventEmitter<FundamentalsMemberships[]>();   

    constructor(
        public _dialogRef: MatDialogRef<SaveMembershipFormComponent>,
        @Inject(MAT_DIALOG_DATA) public membershipList: FundamentalsMemberships[]
    ) { }

    ngOnInit() {
    }

    onIsSelectAll(isSelect: boolean){
        this.membershipList.forEach(membership => { 
            membership.IsSelected = isSelect;
        });
    }

    onSelect() {
        this.onMembershipsSelect.emit(this.membershipList);
        this.onClosePopup();
    }

    onClosePopup() {
        this._dialogRef.close();
    }


} 