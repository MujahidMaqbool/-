/********************** Angular References *********************************/
import { Component } from '@angular/core';
import { SubscriptionLike as ISubscription } from 'rxjs';
/********************* Material:Refference ********************/

/********************** Service & Models *********************/
/* Services */


/* Models */
import { PersonInfo, POSBooking } from '@app/models/common.model';
import { DataSharingService } from '@app/services/data.sharing.service';

/********************** Common *********************************/
import { CustomerType } from '@app/helper/config/app.enums';
import { AuthService } from '@app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Lead } from '@app/helper/config/app.module.page.enums';

@Component({
    selector: 'lead-bookings',
    templateUrl: './lead.bookings.component.html',
})

export class LeadBookingsComponent {

    /* Local Lead */
    shouldGetPersonInfo: boolean = false;
    leadID:number = 0;
    leadIDSubscription: ISubscription;

    /***********Collection & Models*********/
    // personInfo: PersonInfo;
    posBooking:POSBooking;

    allowedPages = {
        Lead_View: false,
    }

    constructor(
        private _authService: AuthService,
        private _dataSharingService: DataSharingService,
    ) { 
        this.posBooking = new POSBooking();
    }

    ngOnInit() {
        this.setPermissions();
       this.getLeadByID();
    }

    setPermissions() {
        this.allowedPages.Lead_View = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.View);
    }

    getLeadByID() {
        this.leadIDSubscription = this._dataSharingService.leadID.subscribe((leadId: number) => {
            if (leadId && leadId > 0) {
                this.leadID = leadId;                
                // this.personInfo = new PersonInfo();
                // this.personInfo.PersonID = this.leadID;
                // this.personInfo.PersonTypeID = CustomerType.Lead;
                // this._dataSharingService.sharePersonInfo(this.personInfo);
                this.shouldGetPersonInfo = true;

                this._dataSharingService.shareCustomerID(leadId);
                this.posBooking.CustomerID =leadId;
                this._dataSharingService.sharePOSBookingInfo(this.posBooking);
            }
        });    
    }
}