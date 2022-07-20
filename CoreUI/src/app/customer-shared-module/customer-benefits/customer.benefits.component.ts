import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SaleApi, MemberMembershipApi } from 'src/app/helper/config/app.webapi';
import { HttpService } from 'src/app/services/app.http.service';
import { ApiResponse } from 'src/app/models/common.model';
import { MembershipStatus_Enum } from 'src/app/helper/config/app.enums';
import { MemberMembershipBenefitsSearch, MemberBenefitsViewModel } from 'src/app/customer/member/models/member.membershipBenefits.model';
import { MessageService } from 'src/app/services/app.message.service';

@Component({
  selector: 'app-customer-benefits',
  templateUrl: './customer.benefits.component.html'
})
export class CustomerBenefitsComponent implements OnInit {

  memberMembershipBenefitsSearchModel: MemberMembershipBenefitsSearch = new MemberMembershipBenefitsSearch();
  memberhsipBenefit: MemberBenefitsViewModel[];
  membershipList: any;
  searchMembership: any;

  membershipStatus_Enum = MembershipStatus_Enum;

  constructor(
    public dialogRef: MatDialogRef<CustomerBenefitsComponent>,
    private _httpService: HttpService,
    private _messageService :MessageService,
    @Inject(MAT_DIALOG_DATA) public customer: any
  ) { }

  ngOnInit() {
    this.getSearchFundamental();
  }

  getSearchFundamental() {

    this._httpService.get(SaleApi.getMemberMembership + this.customer)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0 && response.Result != undefined) {
          this.membershipList = response.Result;
          this.searchMembership = this.membershipList[0];
          this.selectedValue();
          this.getClientBenefit();
        }
      });
  }

  /** Get Client Membership Benefits Details**/
  getClientBenefit() {

    let params = {
      CustomerMembershipID: this.searchMembership.CustomerMembershipID
    };

    this._httpService.get(MemberMembershipApi.getMemberMembershipBenefits, params).subscribe((res: ApiResponse) => {
      if (res && res.MessageCode > 0) {
        this.memberhsipBenefit = res.Result.MemberBenefits;
      }
      else{
        this._messageService.showErrorMessage(res.MessageText);
      }
    });
  }

  selectedValue() {
    this.membershipList.forEach(element => {
      let htmlData = '';
      htmlData = element.MembershipStatusTypeID == this.membershipStatus_Enum.Active ?
        '<span class="select-membership-benefit-active">' + element.MembershipStatusName + '</i>' :
        element.MembershipStatusTypeID == this.membershipStatus_Enum.Terminated ?
          '<span class="select-membership-benefit-terminated">' + element.MembershipStatusName + '</i>' :
          element.MembershipStatusTypeID == this.membershipStatus_Enum.Frozen ?
            '<span class="select-membership-benefit-frozen">' + element.MembershipStatusName + '</i>' :
            element.MembershipStatusTypeID == this.membershipStatus_Enum.Expired ?
              '<span class="select-membership-benefit-expired">' + element.MembershipStatusName + '</i>' : '<span class="select-membership-benefit-cancel">' + element.MembershipStatusName + '</i>'

      let mebershipName = element.MembershipName + htmlData;
      element.MembershipName = mebershipName;
    });
  }

  closePopup() {
    this.dialogRef.close();
  }

}
