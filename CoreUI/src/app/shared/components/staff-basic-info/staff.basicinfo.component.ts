import { Component, Input } from "@angular/core";
/* Services*/
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
/* Models */
import { PersonDetail } from 'src/app/models/common.model';
import { PersonInfo } from "src/app/models/common.model";
import { ActivityPersonInfo } from "src/app/models/activity.model";

/********************** Common *********************/
import { StaffApi } from 'src/app/helper/config/app.webapi';
import { Messages } from "src/app/helper/config/app.messages";
import { environment } from 'src/environments/environment';
import { DataSharingService } from "src/app/services/data.sharing.service";
import { ImagesPlaceholder } from "src/app/helper/config/app.placeholder";
import { AppUtilities } from "src/app/helper/aap.utilities";

@Component({
    selector: 'staff-basic-info',
    templateUrl: './staff.basicinfo.component.html'
})

export class StaffBasicInfoComponent {

    @Input() personTypeInfo: PersonInfo;

    /* Local Members */
    messages = Messages;
    impagePath = ImagesPlaceholder.user;
    /* Collection Types */
    serverImageAddress = environment.imageUrl;
    /* Model Refrences*/
    personDetail: PersonDetail = new PersonDetail();
    ngAfterViewInit() {
        this.getPersonInfo();
    }

    constructor(private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService, ) { }

    getPersonInfo() {
        let params = {
            staffID: this.personTypeInfo.PersonID
        }
        if (this.personTypeInfo) {
            this._httpService.get(StaffApi.getStaffBasicInfo, params)
                .subscribe(
                    data => {
                        if (data && data.Result) {
                            this.personDetail = data.Result;
                            if (this.personDetail.ImagePath != null && this.personDetail.ImagePath != "") {
                                this.impagePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setStaffImagePath()) + this.personDetail.ImagePath;
                            }
                            let personInfo = new ActivityPersonInfo();
                            personInfo.Name = this.personDetail.FirstName + " " + this.personDetail.LastName;
                            personInfo.Mobile = this.personDetail.Mobile.toString();
                            personInfo.Email = this.personDetail.Email;
                            personInfo.Address = this.personDetail.Address1;

                            this._dataSharingService.shareActivityPersonInfo(personInfo);

                        }
                        else{
                            this._messageService.showErrorMessage(data.MessageText);
                        }
                    },
                    error => this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Person Info"))
                );
        }
    }

}