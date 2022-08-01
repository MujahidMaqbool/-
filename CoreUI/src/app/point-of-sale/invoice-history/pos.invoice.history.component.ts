/********************** Angular References *********************/
import { Component, OnInit } from '@angular/core';


/********************** Services & Models *********************/
/* Services */
import { DataSharingService } from '../../services/data.sharing.service';

/* Models */
import { InvoiceHistory } from 'src/app/models/common.model';


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
