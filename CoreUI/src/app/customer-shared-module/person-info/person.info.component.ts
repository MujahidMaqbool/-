import { Component, Input ,ChangeDetectorRef} from "@angular/core";
/* Services*/
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
/* Models */
import { ApiResponse, PersonDetail } from 'src/app/models/common.model';
import { PersonInfo } from "src/app/models/common.model";
import { ActivityPersonInfo } from "src/app/models/activity.model";

/********************** Common *********************/
import { PersonInfoApi } from 'src/app/helper/config/app.webapi';
import { Messages } from "src/app/helper/config/app.messages";
import { environment } from 'src/environments/environment';
import { DataSharingService } from "src/app/services/data.sharing.service";
import { ImagesPlaceholder } from "src/app/helper/config/app.placeholder";
import { AppUtilities } from "src/app/helper/aap.utilities";

import { SubscriptionLike as ISubscription } from 'rxjs';

@Component({
    selector: 'person-info',
    templateUrl: './person.info.component.html'
})
export class PersonInfoComponent {
    // @Input() personTypeInfo: PersonInfo;
     personTypeInfo: PersonInfo;

    @Input() isCustomerBooking?: boolean;

    /* Local Members */
    messages = Messages;
    impagePath = ImagesPlaceholder.user;
    /* Collection Types */
    serverImageAddress = environment.imageUrl;
    /* Model Refrences*/
    personDetail: PersonDetail = new PersonDetail();

    personInfoSubscription: ISubscription;

    constructor(private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _cdr: ChangeDetectorRef,
        ) {}

    ngOnInit(){
        this.personInfoSubscription = this._dataSharingService.personInfo.subscribe((personInfo: PersonInfo) => {
            if (personInfo.PersonID > 0 && personInfo.PersonTypeID > 0) {
                this.personTypeInfo = personInfo;
               this.getPersonInfo();
            }
        });
    }

    ngAfterViewInit() {
    }
    ngAfterViewChecked() {
        this._cdr.detectChanges();
      }
    ngOnDestroy() {
        this.personInfoSubscription.unsubscribe();
    }

    getPersonInfo() {
        if (this.personTypeInfo) {
            this._httpService.get(PersonInfoApi.getPersonInfo + this.personTypeInfo.PersonTypeID + '/' + this.personTypeInfo.PersonID)
                .subscribe(
                    (res:ApiResponse) => {
                        if (res && res.Result) {
                            this.personDetail = res.Result;
                            if (this.personDetail.ImagePath != null && this.personDetail.ImagePath != "") {
                                this.impagePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setCustomerImagePath()) + this.personDetail.ImagePath;
                            }
                            let personInfo = new ActivityPersonInfo();

                            if(this.personDetail.LastName == null || this.personDetail.LastName == ''){
                                personInfo.Name = this.personDetail.FirstName;
                            }
                            else {
                                personInfo.Name = this.personDetail.FirstName + " " + this.personDetail.LastName;
                            }
                            personInfo.FirstName = this.personDetail.FirstName;
                            personInfo.LastName = this.personDetail.LastName;
                            personInfo.Mobile = this.personDetail.Mobile.toString();
                            personInfo.Email = this.personDetail.Email;
                            personInfo.Address = this.personDetail.Address1;
                            personInfo.EmailAllowed = this.personDetail.EmailAllowed;
                            personInfo.SMSAllowed = this.personDetail.SMSAllowed;
                            personInfo.MemberMessageAllowed = this.personDetail.MemberMessageAllowed;
                            personInfo.AppNotificationAllowed = this.personDetail.AppNotificationAllowed;
                            personInfo.PhoneCallAllowed = this.personDetail.PhoneCallAllowed;
                            personInfo.IsWalkedIn = this.personDetail.IsWalkedIn;
                            personInfo.MemberMessageAllowed = this.personDetail.MemberMessageAllowed;
                            personInfo.CustomerTypeName = this.personDetail.CustomerTypeName;
                            personInfo.CustomerTypeID = this.personDetail.CustomerTypeID;
                            personInfo.CustomerID = this.personDetail.CustomerID;
                            personInfo.RewardProgramAllowed = this.personDetail.RewardProgramAllowed;
                            personInfo.RewardProgramEnrolledBranchID = this.personDetail.RewardProgramEnrolledBranchID;
                            personInfo.AllowPartPaymentOnCore = this.personDetail.AllowPartPaymentOnCore

                            this._dataSharingService.shareActivityPersonInfo(personInfo);

                        }
                        else{
                            this._messageService.showErrorMessage(res.MessageText)
                        }
                    },
                    error => this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Person Info"))
                );
        }
    }

}
