/********************** Angular References *********************/
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

/********************* Material:Refference ********************/


/********************** Services & Models *********************/
/* Services */

/* Models */

/********************** Common ***************************/

/********************** Configurations *********************/
import { CustomerType } from '@helper/config/app.enums';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { CommonService } from '@app/services/common.service';
import { PersonInfo, InvoiceHistory } from '@app/models/common.model';
import { DataSharingService } from '@app/services/data.sharing.service';


@Component({
    selector: 'client-invoice-history',
    templateUrl: './client.invoice.history.component.html'
})

export class ClientInvoiceHistoryComponent implements OnInit, OnDestroy,AfterViewInit {

    // #region Local Members

    /* Local Members */
    shouldGetPersonInfo: boolean = false;

    /* Model References */
    personInfo: PersonInfo = new PersonInfo();
    invocieHistory:InvoiceHistory = new InvoiceHistory();

    clientIdSubscription: ISubscription;

    // #endregion 

    constructor(private _dataSharingService: DataSharingService,private _commonService:CommonService) {
    }

    ngOnInit() {
        this.clientIdSubscription = this._dataSharingService.clientID.subscribe((clientId) => {
            if (clientId && clientId > 0) {
                //set PersonID and PersonTypeID for personInfo
                this.personInfo = new PersonInfo();
                this.personInfo.PersonID = clientId;
                this.personInfo.PersonTypeID = CustomerType.Client;
                this.shouldGetPersonInfo = true;
                // this._dataSharingService.sharePersonInfo(this.personInfo);
                this.invocieHistory.CustomerID = clientId.toString();
                this._dataSharingService.shareinvoiceHistoryInfo(this.invocieHistory);
                this._commonService.shareLeadInfo(this.personInfo);
            }
        });
    }

    ngAfterViewInit(){
       
    }

    ngOnDestroy() {
        this.clientIdSubscription.unsubscribe();
    }
}