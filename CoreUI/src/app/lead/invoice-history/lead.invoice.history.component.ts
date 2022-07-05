/********************** Angular References *********************/
import { Component, OnInit, OnDestroy } from '@angular/core';

/********************* Material:Refference ********************/


/********************** Services & Models *********************/
/* Services */

import { DataSharingService } from '@services/data.sharing.service';
/* Models */
import { PersonInfo, InvoiceHistory } from "@models/common.model";

/********************** Common ***************************/


/********************** Configurations *********************/
import { CustomerType } from '@helper/config/app.enums';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { ENU_Permission_Module, ENU_Permission_Lead } from '@app/helper/config/app.module.page.enums';
import { AuthService } from '@app/helper/app.auth.service';


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