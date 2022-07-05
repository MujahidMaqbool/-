/********************** Angular References *********************************/
import { Component, OnInit, OnDestroy } from '@angular/core';

import { SubscriptionLike as ISubscription } from 'rxjs';

/********************** Common *********************************/
/* Service */

import { DataSharingService } from '@app/services/data.sharing.service';

/* Model */

import { PersonInfo, InvoiceHistory } from '@app/models/common.model';

/********************** Common *********************************/
import { CustomerType } from '@helper/config/app.enums';

@Component({
    selector: 'member-sale-history',
    templateUrl: './member.sale.history.component.html',
})


export class MemberSaleHistoryComponent implements OnInit, OnDestroy {

    /* Local Members */
    shouldGetPersonInfo: boolean = false;
    /***********Collection & Models*********/
    // personInfo: PersonInfo;
    invocieHistory:InvoiceHistory = new InvoiceHistory();
    memberIdSubscription: ISubscription;

    constructor(private _dataSharingService: DataSharingService) {

    }

    ngOnInit() {
        this.memberIdSubscription = this._dataSharingService.memberID.subscribe((memberId: number) => {
            if (memberId && memberId > 0) {
                // this.personInfo = new PersonInfo();
                //set PersonID and PersonTypeID for personInfo
                // this.personInfo.PersonID = memberId;
                // this.personInfo.PersonTypeID = CustomerType.Member;
                this.shouldGetPersonInfo = true;
                // this._dataSharingService.sharePersonInfo(this.personInfo);
                this._dataSharingService.shareCustomerID(memberId);

                this.invocieHistory.CustomerID = memberId.toString();
              this._dataSharingService.shareinvoiceHistoryInfo(this.invocieHistory);
            }
        })
    }

    ngOnDestroy() {
        this.memberIdSubscription.unsubscribe();
    }

    }

