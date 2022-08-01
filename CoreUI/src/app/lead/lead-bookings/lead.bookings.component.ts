/********************** Angular References *********************************/
import { Component } from '@angular/core';
import { SubscriptionLike as ISubscription } from 'rxjs';

/********************** Service & Models *********************/
/* Services */
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AuthService } from 'src/app/helper/app.auth.service';


/* Models */
import { POSBooking } from 'src/app/models/common.model';

/********************** Configuration *********************************/
import { ENU_Permission_Module, ENU_Permission_Lead } from 'src/app/helper/config/app.module.page.enums';

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
