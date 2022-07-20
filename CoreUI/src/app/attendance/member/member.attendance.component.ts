/**************** Angular References ***************/
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router } from '@angular/router';

/**********  Services & Models **********/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { MemberAttendanceApi } from "src/app/helper/config/app.webapi";
import { Messages } from "src/app/helper/config/app.messages";
import { MemerClockInInfo, MemberMessage } from "../models/member.attendance.model";
import { environment } from "src/environments/environment";

/* Models */
import { ApiResponse, CompanyInfo } from "src/app/models/common.model";
import { MemberAttendanceDetail } from 'src/app/attendance/models/member.attendance.model';
import { DataSharingService } from "src/app/services/data.sharing.service";
import { ENU_MemberAttendanceRedirect } from "src/app/helper/config/app.enums";
import { variables } from "src/app/helper/config/app.variable";
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { CompanyDetails } from "src/app/setup/models/company.details.model";

@Component({
    selector: 'member-attendance',
    templateUrl: './member.attendance.component.html'
})

export class MemberAttendanceComponent extends AbstractGenericComponent implements OnInit {
    @ViewChild("cardNumberCtrl") cardNumberControl: ElementRef;

    // #region Local Members

    /* Configurations */
    messages = Messages;

    /* Local Members */
    cardNumber: string;
    memberEmail: string;
    emailNotExist: boolean = false;
    cardNumberNotExist: boolean = false;

    /* Collection Types */
    serverImageAddress = environment.imageUrl;
    enu_MemberAttendanceRedirect = ENU_MemberAttendanceRedirect

    /* Model Refrences*/
    companyInfo: CompanyDetails = new CompanyDetails();
    memberClockInInfo: MemerClockInInfo;
    memberMessage: MemberMessage;
    memberAttendaceModel: MemberAttendanceDetail;

    // #endregion

    constructor(
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _router: Router,
        private _dataSharingService: DataSharingService
    ) { super() }

    ngOnInit() {
        this.getCompanyDetails();
        this._dataSharingService.shareMemberAttendanceInfo(null);
    }

    async getCompanyDetails(){
        const company = await super.getCompanyDetail(this._dataSharingService);
        if (company) {
          this.companyInfo = company;
        }
    }

    ngAfterViewInit() {
        this.focusCardElement();
    }

    // #region Events

    onMemberClockIn() {
        this.memberClockin(this.cardNumber, this.enu_MemberAttendanceRedirect.AttendanceTerminal);
    }

    onCloseMessage() {
        this.cardNumberNotExist = false;
    }

    onClearCard() {
        this.cardNumber = "";
        this.cardNumberNotExist = false;
        this.focusCardElement();
    }

    // #endregion

    // #region Methods

    focusCardElement() {
        setTimeout(() => this.cardNumberControl.nativeElement.focus());
    }

    memberClockin(cardNumber: any, redirectMood: number) {
        this.cardNumberNotExist = false;
        this.cardNumber = cardNumber.trim();
        let params = {
            cardNumber: this.cardNumber
        }

        if (this.cardNumber.length > 0) {
            this._httpService.get(MemberAttendanceApi.memberClockIn, params).subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        if (response.Result) {
                            localStorage.setItem('MemberDetail', JSON.stringify(response.Result));
                            if (redirectMood == this.enu_MemberAttendanceRedirect.AttendanceTerminal) {
                                this._router.navigate(['/attendance/member/details']);
                            }
                            else {
                                window.open('/attendance/member/details', '_blank');
                            }
                        }
                        else {
                            this.cardNumberNotExist = true;
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Staff_Clockin_Error);
                    }
                },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Staff_Clockin_Error);
                }
            )
        }
        else {
            this._messageService.showErrorMessage(this.messages.Validation.Card_Number_Required);
        }

    }

    // #endregion
}