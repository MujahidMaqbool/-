/********************** Angular References *********************************/
import { Component } from '@angular/core';

/********************** Service & Models *********************/
/* Services */
import { DataSharingService } from 'src/app/services/data.sharing.service';

/* Models */
import { POSBooking } from 'src/app/models/common.model';

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
