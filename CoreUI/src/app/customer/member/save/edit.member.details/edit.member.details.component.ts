/********************** Angular References *********************/
import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { SubscriptionLike as ISubscription } from "rxjs";
/********************** Services & Models *********************/
/* Models */
import { SavePageMember, MemberInfo } from '@customer/member/models/members.model'

/* Services */
import { HttpService } from '@services/app.http.service';
//import { LeadOnBoardComponent } from '../../../lead/Lead-on-board/lead.on.board.component';

/********************** Common & Customs *********************/
import { DataSharingService } from '@services/data.sharing.service';
import { MessageService } from '@services/app.message.service';
import { DateTimeService } from '@services/date.time.service';

/**********************Component*********************/
import { SaveMemberDetailsComponent } from "@customer/member/save/save-member-details/save.member.details.component";

/********************** Configurations *********************/
import { Configurations } from '@helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { MemberApi } from '@app/helper/config/app.webapi';
import { ApiResponse } from '@app/models/common.model';
import { Router } from '@angular/router';
import { CommonService } from '@app/services/common.service';



@Component({
    selector: 'edit-member-details',
    templateUrl: './edit.member.details.component.html'
})

export class EditMemberDetialsComponent implements OnInit, OnDestroy {

    // #region Local Members

    @ViewChild('saveMemberDetails') saveMemberDetails: SaveMemberDetailsComponent;

    //==============Messages===============//
    messages = Messages;
    dateFormatSave = Configurations.DateFormatForSave;
    deleteDialogRef: any;
    //==============Local Members===============//
    maxDate: Date = new Date();
    memberID: number = 0;
    showSave: boolean;
    showMemberDetailsValidation: boolean;
    showMemberMembershipValidation: boolean;
    activeTabIndex: number = 0;

    //==============Model Reference===============//
    memberInfo: MemberInfo = new MemberInfo;
    //leadOnBoardComponentObj: LeadOnBoardComponent;

    memberIdSubscription: ISubscription;
    countryIDSubscription: ISubscription;
    memberModel: SavePageMember;
    isReuiredCustomerAddress : boolean;
    countryID: number;


    // #endregion

    constructor(private _memberService: HttpService,
        private _messageService: MessageService,
        private dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
        private _commonService: CommonService,
        private _router: Router) {
    }

    // #region Events
    ngOnInit() {
        this.memberIdSubscription = this._dataSharingService.memberID.subscribe(memberId => {
            if (memberId && memberId > 0) {
                this.memberID = memberId;
            }
        });
        this.countryIDSubscription =  this._dataSharingService.countryID.subscribe((countryID) => {
            this.countryID = countryID;
        });
    }

    ngOnDestroy() {
        this.memberIdSubscription.unsubscribe();
        this.countryIDSubscription.unsubscribe();
    }

    onReset() {
        this.resetForm();
    }

    onSave() {
        let isAddress = this._commonService.isStatCountyCodeExist(this.saveMemberDetails.memberModel, this.saveMemberDetails.memberModel.StateList,this.countryID);
        this.isReuiredCustomerAddress = false;
         if (this.saveMemberDetails.memberModel.CustomerID > 0 && this.saveMemberDetails.memberForm.valid) {
             if(isAddress){
                 this.saveMember();
                 this.isReuiredCustomerAddress = false;
             }
             else{
                 setTimeout(() => {
                     this.isReuiredCustomerAddress = true;
                 }, 100);
             }
         }
         else {
             this.isReuiredCustomerAddress = false;
             this.saveMemberDetails.showValidation = true;
         }
     }

    // #endregion

    // #region Methods

    saveMember() {
        let memberForSave = JSON.parse(JSON.stringify(this.saveMemberDetails.memberModel));

        //remove zone from date
        memberForSave.BirthDate = this.dateTimeService.removeZoneFromDateTime(memberForSave.BirthDate);
        memberForSave.BirthDate = this.dateTimeService.convertDateObjToString(memberForSave.BirthDate, this.dateFormatSave);
        memberForSave.Email = memberForSave.Email.toLowerCase();
        memberForSave.CardNumber = memberForSave.CardNumber.trim();
        this._memberService.save(MemberApi.updateMember, memberForSave)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    //this.memberCopy = Object.assign({}, this.memberModel);
                    this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Member"));
                    //this._router.navigate(['customer/search']);
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Member")); }
            );
    }

    resetForm() {
        this.saveMemberDetails.resetForm();
    }

    // #endregion
}
