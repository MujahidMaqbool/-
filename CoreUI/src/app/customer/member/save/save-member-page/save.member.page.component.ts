/********************** Angular References *********************/
import { Component, OnInit, OnDestroy } from '@angular/core';

import { SubscriptionLike as ISubscription } from "rxjs";
/********************** Services & Models *********************/
/* Models */

/* Services */
import { DataSharingService } from 'src/app/services/data.sharing.service';


@Component({
    selector: 'save-member',
    template: `
             <add-member *ngIf="memberId === 0"></add-member>
             <edit-member-details *ngIf="memberId > 0"></edit-member-details>
    `
})

export class SaveMemberPageComponent implements OnInit, OnDestroy {

    memberId: number = 0;
    memberIdSubscription: ISubscription;

    constructor(private _dataSharingService: DataSharingService) {

    }
    ngOnInit() {
        this.memberIdSubscription = this._dataSharingService.memberID.subscribe(memberId => {
            // as per discussion with fahad there is not to add this condition (Ahmed Arshad)(03/05/2021)
            // if (memberId && memberId > 0) {
                this.memberId = memberId;
            // }
        });
    }

    ngOnDestroy()
    {
        this.memberIdSubscription.unsubscribe();
    }
}

