/********************* Angular References ********************/
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { HttpService } from '@app/services/app.http.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FundamentalsMemberships } from '@app/setup/models/custom.form.model';


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