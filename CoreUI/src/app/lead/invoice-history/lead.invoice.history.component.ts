/********************** Angular References *********************/
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubscriptionLike as ISubscription } from 'rxjs';

/********************* Material:Refference ********************/


/********************** Services & Models *********************/
/* Services */
import { AuthService } from 'src/app/helper/app.auth.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';

/* Models */
import { InvoiceHistory } from "src/app/models/common.model";

/********************** Configurations *********************/
import { ENU_Permission_Module, ENU_Permission_Lead } from 'src/app/helper/config/app.module.page.enums';


@Component({
    selector: 'lead-invoice-history',
    templateUrl: './lead.invoice.history.component.html'
})

export class LeadInvoiceHistoryComponent implements OnInit, OnDestroy {

    // #region Local Members

    /* Local Members */
    shouldGetPersonInfo:boolean = false;

    /* Model References */
    // personInfo: PersonInfo;
    leadIdSubscription: ISubscription;
    invocieHistory:InvoiceHistory = new InvoiceHistory();

    allowedPages = {
        Lead_View: false,
    }
    // #endregion

    constructor(
        private _authService: AuthService,
        private _dataSharingService: DataSharingService) {
    }

    ngOnInit() {
        this.setPermissions();
        this.leadIdSubscription = this._dataSharingService.leadID.subscribe((leadId) => {
            if (leadId && leadId > 0) {
                //set PersonID and PersonTypeID for personInfo
                // this.personInfo = new PersonInfo();
                // this.personInfo.PersonID = leadId;
                // this.personInfo.PersonTypeID = CustomerType.Lead;
                this.shouldGetPersonInfo = true;
              //  this._dataSharingService.sharePersonInfo(this.personInfo);
              this._dataSharingService.shareCustomerID(leadId);
              this.invocieHistory.CustomerID = leadId.toString();
              this._dataSharingService.shareinvoiceHistoryInfo(this.invocieHistory);
            }
        });
    }

    setPermissions() {
        this.allowedPages.Lead_View = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.View);
    }

    ngOnDestroy() {
        this.leadIdSubscription.unsubscribe();
    }
}
