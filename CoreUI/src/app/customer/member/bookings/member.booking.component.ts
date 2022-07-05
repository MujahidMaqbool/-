/********************** Angular References *********************************/
import { Component } from '@angular/core';
/********************* Material:Refference ********************/

/********************** Service & Models *********************/
/* Services */


/* Models */
import { PersonInfo, POSBooking } from '@app/models/common.model';
import { DataSharingService } from '@app/services/data.sharing.service';

/********************** Component *********************************/


/********************** Common *********************************/
import { PersonType, CustomerType } from '@app/helper/config/app.enums';

@Component({
    selector: 'member-booking',
    templateUrl: './member.booking.component.html',
})


export class MemberBooking {
    /* Local Members */
    shouldGetPersonInfo: boolean = false;
    /***********Collection & Models*********/
    // personInfo: PersonInfo;
    posBooking: POSBooking;

    constructor(
        private _dataSharingService: DataSharingService,
    ) { }

    ngOnInit() {
        this.posBooking = new POSBooking();
        this.getMemberID();
    }


    getMemberID() {
        this._dataSharingService.memberID.subscribe(memberId => {
            setTimeout(() => {
                if (memberId) {
                    //set PersonID and PersonTypeID for personInfo
                    // this.personInfo = new PersonInfo();
                    // this.personInfo.PersonID = memberId;
                    // this.personInfo.PersonTypeID = CustomerType.Member;
                    this.shouldGetPersonInfo = true;

                    this.posBooking.CustomerID = memberId;
                    this.posBooking.POSBooking = false;
                    this._dataSharingService.sharePOSBookingInfo(this.posBooking);
                }
            })
        })
    }

}
