/********************** Angular References *********************************/
import { Component } from '@angular/core';
import { SubscriptionLike as ISubscription } from 'rxjs';
/********************* Material:Refference ********************/

/********************** Service & Models *********************/
/* Services */


/* Models */
import { PersonInfo, POSBooking } from '@app/models/common.model';
import { DataSharingService } from '@app/services/data.sharing.service';

/********************** Component *********************************/


/********************** Common *********************************/
import { PersonType, CustomerType } from '@app/helper/config/app.enums';
import { CommonService } from '@app/services/common.service';

@Component({
    selector: 'client-booking',
    templateUrl: './client.booking.component.html',
})


export class ClientBookingComponent {
    /* Local Client */
    shouldGetPersonInfo: boolean = false;
    clientID:number = 0;
    clientIDSubscription: ISubscription;
    /***********Collection & Models*********/
    personInfo: PersonInfo;
    posBooking:POSBooking;

    constructor(
        private _dataSharingService: DataSharingService,
        private _commonService:CommonService
    ) { 
        this.posBooking = new POSBooking();
    }

    ngOnInit() {
       this.getClientID();
    }


    getClientID() {
        this.clientIDSubscription = this._dataSharingService.clientID.subscribe((clientId: number) => {
            if (clientId && clientId > 0) {
                this.clientID = clientId;
                //  this.getClientInfo();
                //set PersonID and PersonTypeID for personInfo
                this.personInfo = new PersonInfo();
                this.personInfo.PersonID = this.clientID;
                this.personInfo.PersonTypeID = CustomerType.Client;
                this.shouldGetPersonInfo = true;
                // this._dataSharingService.sharePersonInfo(this.personInfo);
                this._dataSharingService.shareCustomerID(clientId);
                this.posBooking.CustomerID =clientId;
                this._dataSharingService.sharePOSBookingInfo(this.posBooking);
                this._commonService.shareLeadInfo(this.personInfo);
            }
        });
    
    }


}
