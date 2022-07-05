import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '@app/services/app.http.service';
import { StaffNotificationApi } from '@app/helper/config/app.webapi';
import { ApiResponse, PersonInfo } from '@app/models/common.model';
import { MessageService } from '@app/services/app.message.service';
import { SubscriptionLike } from 'rxjs';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { DataSharingService } from '@app/services/data.sharing.service';
import { ENU_DateFormatName } from '@app/helper/config/app.enums';

@Component({
    selector: 'service-notification',
    templateUrl: './service.notification.details.component.html'
})

export class ServiceNotificationDetailComponent extends AbstractGenericComponent implements OnInit {

    dateFormat: string = "";
    isDataExists: boolean = false;
    viewServiceObj: any = {};
    shouldGetPersonInfo: boolean;

    personInfo: PersonInfo;
    staffIDSubscription: SubscriptionLike;

    constructor(
        private dialogRef: MatDialogRef<ServiceNotificationDetailComponent>,
        private _httpService: HttpService,
        private _messagesService: MessageService,
        private _dataSharingService: DataSharingService,
        @Inject(MAT_DIALOG_DATA) public serviceId: any,

    ) { super(); }

    ngOnInit() {
        this.getBranchDatePattern();
    }

    onCloseDialog() {
        this.dialogRef.close();
    }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.getServiceDetail();
    }

    getServiceDetail() {
        let url = StaffNotificationApi.NotificationServiceDetail.replace("{StaffNotificationID}", JSON.stringify(this.serviceId.ServiceID));
        this._httpService.get(url).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                this.isDataExists = res.Result != null ? true : false;
                if (res && res.Result) {
                    this.viewServiceObj = res.Result;
                }
            }
            else {
                this._messagesService.showErrorMessage(res.MessageText);
            }
        });
    }


}