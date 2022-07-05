/*************************** Angular References *********************/
import { Component, Inject, OnDestroy } from '@angular/core';

/*********************** Material Reference *************************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/*********************** Services & Models *************************/
/* Services */
import { HttpService } from '@services/app.http.service';

/* Models */
import { ClientApi } from '@app/helper/config/app.webapi';
import { ClientDetail } from '@customer/client/models/client.model';

/********************** Configurations *************************/
import { Messages } from '@app/helper/config/app.messages';
import { environment } from "@env/environment";
import { ImagesPlaceholder } from '@app/helper/config/app.placeholder';
import { Configurations } from '@app/helper/config/app.config';
import { variables } from '@app/helper/config/app.variable';
import { AppUtilities } from '@app/helper/aap.utilities';
import { SubscriptionLike as ISubscription, SubscriptionLike } from 'rxjs';
import { DataSharingService } from '@app/services/data.sharing.service';

/********************** Component *************************/
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { ENU_DateFormatName, ENU_Package } from '@app/helper/config/app.enums';
import { MessageService } from '@app/services/app.message.service';
import { ApiResponse } from '@app/models/common.model';

@Component({
    selector: 'view-client-detail',
    templateUrl: './view.client.detail.component.html'
})

export class ViewClientDetailComponent extends AbstractGenericComponent implements OnDestroy {

    /* Configurations */
    messages = Messages;

    /* Local variables */
    // partialPaymentSubscription:ISubscription;
    imagePath = ImagesPlaceholder.user;
    isPartialPaymentAllow: boolean = false;
    packageIdSubscription: SubscriptionLike;

    dateFormat: string = "";
    /* Model Refences */
    clientViewModel: ClientDetail;

    /* Configurations */
    serverImageAddress = environment.imageUrl;
    package = ENU_Package;
    isSmsAllowed:boolean;
    isEmailAllowed:boolean;
    isPushNotificationAllowed:boolean;

    constructor(
        private _httpService: HttpService,
        private _messageService: MessageService,
        private dialogRef: MatDialogRef<ViewClientDetailComponent>,
        private _dataSharingService: DataSharingService,
        @Inject(MAT_DIALOG_DATA) public clientID: number) {
            super();
        this.clientViewModel = new ClientDetail();
    }

    ngOnInit() {
        this.getBranchDatePattern();
        // this.partialPaymentSubscription = this._dataSharingService.isPartPaymentAllow.subscribe(
        //     (partialPayment: boolean) => {
        //         this.isPartialPaymentAllow = partialPayment;
        //     }
        // )
        this.isPartPaymentAllowed();
        this.getClientDetail(this.clientID);
     
    }
    async isPartPaymentAllowed(){
        this.isPartialPaymentAllow = await super.isPartPaymentAllow(this._dataSharingService);
     }
    ngOnDestroy() {
        // this.partialPaymentSubscription.unsubscribe();
    }

    // #region Events

    onCloseDialog() {
        this.dialogRef.close();
    }

    //#endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    }

    getClientDetail(clientID: number) {
        this._httpService.get(ClientApi.getClientViewDetailByID + clientID)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.clientViewModel = res.Result;
                    this.clientViewModel.FullName = this.clientViewModel.Title + ' ' + this.clientViewModel.FirstName + ' ' + this.clientViewModel.LastName;
                    if (this.clientViewModel.ImagePath && this.clientViewModel.ImagePath.length > 0) {
                        this.imagePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setCustomerImagePath()) + this.clientViewModel.ImagePath;
                    }
                    else {
                        this.imagePath = ImagesPlaceholder.user;
                    }
                } else {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Client Detail"));
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Client Detail"));
                }
            );
    }

    setPackagePermission(packageId: number) {
        switch (packageId) {
      
            case this.package.WellnessBasic:
               this.isSmsAllowed = false;
               this.isEmailAllowed = false;
               this.isPushNotificationAllowed= false;
                break;
      
            case this.package.WellnessMedium:
                break;
      
            case this.package.WellnessTop:
                break;
      
            case this.package.FitnessBasic:
                break;
      
            case this.package.FitnessMedium:
                break;
                
            case this.package.Full:
                break;
      
        }
      }

    // #endregion
}