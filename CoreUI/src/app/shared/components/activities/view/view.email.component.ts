/********************* Angular References **************************/
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************* Services & Models **************************/
import { EmailActivity } from 'src/app/models/activity.model';

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
/********************* Common & Customs **************************/
import { Configurations } from 'src/app/helper/config/app.config';
import { CustomerType } from 'src/app/helper/config/app.enums';
import { LeadActivityApi, MemberActivityApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';

@Component({
    selector: 'view-email',
    templateUrl: './view.email.component.html'
})

export class ViewEmailComponent implements OnInit {

    /* Local Members*/


    emailModel: EmailActivity;

    /* Configruations*/
    dateTimeFormat = Configurations.DateTimeFormat;  
    messages = Messages;
    personType = CustomerType;

    constructor(
        private _dialogRef: MatDialogRef<ViewEmailComponent>,
        private _activityService: HttpService,
        private _messageService: MessageService,
        @Inject(MAT_DIALOG_DATA) public model: any) {
        this.emailModel = new EmailActivity();
    }

    ngOnInit() {
        this.getEmailById();
    }
   

    // #region Events

    onCloseDialog() {
        this.closeDialog();
    }

    // #endregion

    // #region Methods

    getEmailById() {
        this._activityService.get(this.getUrlByPersonType()).subscribe(
            data => {
                if (data && data.Result) {
                    this.emailModel = data.Result;
                    this.emailModel.EmailBody = this.emailModel.EmailBody ? this.emailModel.EmailBody.replace('↵', '<br/>') : 'N/A';
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Email"));
            }
        )
    }

    getUrlByPersonType(): string {
        let url = "";

        switch (parseInt(this.model.personTypeID)) {
            case this.personType.Lead:
                url = LeadActivityApi.getEmailById;
                break;        
            case this.personType.Member:
                url = MemberActivityApi.getEmailById;
                break;
            // case this.personType.Staff:
            //     url = StaffActivityApi.getEmailById;
            //     break;
        }

        url = url.replace("{activityID}", this.model.activityID).replace("{ownerID}", this.model.personID);
        return url;
    }

    closeDialog() {
        this._dialogRef.close();
    }
    // #endregion
}