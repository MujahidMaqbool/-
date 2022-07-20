/********************** Angular References *********************************/
import { Component, OnInit } from '@angular/core';
import { SubscriptionLike as ISubscription } from 'rxjs';
/********************* Material:Refference ********************/

/********************** Service & Models *********************/
/* Services */


/* Models */
import { PersonInfo, POSBooking } from 'src/app/models/common.model';
import { DataSharingService } from 'src/app/services/data.sharing.service';

/********************** Component *********************************/


/********************** Common *********************************/


@Component({
    selector: 'pos-booking',
    templateUrl: './pos.booking.component.html',
})


export class PointOfSaleBookingComponent implements OnInit {
    /* Local Client */
    shouldGetPersonInfo: boolean = false;
    clientID:number = 0;
    clientIDSubscription: ISubscription;
    /***********Collection & Models*********/
    personInfo: PersonInfo;
    posBooking:POSBooking;

    constructor(
        private _dataSharingService: DataSharingService,
    ) {
        this.posBooking = new POSBooking();
     }

    ngOnInit() {
        this.posBooking.CustomerID = 0;
        this.posBooking.POSBooking = true;
        this._dataSharingService.sharePOSBookingInfo(this.posBooking);
    }

}
