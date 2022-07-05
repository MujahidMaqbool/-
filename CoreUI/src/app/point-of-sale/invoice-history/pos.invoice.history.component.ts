/********************** Angular References *********************/
import { Component, OnInit, OnDestroy } from '@angular/core';

/********************* Material:Refference ********************/


/********************** Services & Models *********************/
/* Services */

import { DataSharingService } from '../../services/data.sharing.service';
/* Models */

/********************** Common ***************************/

/********************** Configurations *********************/
import { CustomerType } from '@helper/config/app.enums';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { InvoiceHistory } from '@app/models/common.model';


@Component({
    selector: 'pos-invoice-history',
    templateUrl: './pos.invoice.history.component.html'
})

export class PointOfSaleInvoiceHistoryComponent implements OnInit {

    // #region Local POSInvoice

    /* Local POSInvoice */
    /* Model References */
   invocieHistory:InvoiceHistory;

    // #endregion 

    constructor(private _dataSharingService: DataSharingService) {
        this.invocieHistory = new InvoiceHistory();
    }

    ngOnInit() {
        this.invocieHistory.CustomerID = "";
        this.invocieHistory.POSHistory = true;
        this._dataSharingService.shareinvoiceHistoryInfo(this.invocieHistory);

    }

}