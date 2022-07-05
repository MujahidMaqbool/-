/*********************** Angular References *************************/
import { Component, Inject, OnInit } from '@angular/core';

/*********************** Material References *************************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/*************************** Services & Models ***********************/
/*Services*/
import { HttpService } from '@services/app.http.service';

/*Models*/
import { MemberDetail, MemberMembershipList } from '@customer/member/models/members.model';

/********************** START: Common *********************/
import { ClientApi, MemberApi, CompanyDetailsApi, BranchApi } from '@helper/config/app.webapi';
import { Messages } from '@helper/config/app.messages';
import { environment } from '@env/environment';
import { AppUtilities } from '@app/helper/aap.utilities';
import { DataSharingService } from '@app/services/data.sharing.service';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { ENU_DateFormatName, ENU_Package } from '@app/helper/config/app.enums';
import { AllCustomers } from '@app/customer/models/customers.models';
import { SubscriptionLike as ISubscription, SubscriptionLike } from 'rxjs';
import { CompanyDetails } from '@app/setup/models/company.details.model';
import { MessageService } from '@app/services/app.message.service';
import { ApiResponse } from '@app/models/common.model';

@Component({
    selector: 'view-member-detail',
    templateUrl: './view.member.detail.component.html'
})

export class ViewMemberDetail extends AbstractGenericComponent implements OnInit {

    /* Local Variables */
    // partialPaymentSubscription: ISubscription;
    isPartialPaymentAllow: boolean = false;
    gendername: string = "";
    titlename: string = "";
    isDataExists: boolean = false;
    totalRecords: number = 0;
    imagePath: string = "./assets/images/user.jpg";
    dateFormat: string = "";
    packageIdSubscription: SubscriptionLike;
    countryList: any[];
    companyDetails: CompanyDetails = new CompanyDetails();

    /* Model Refences */
    customerDetail: MemberDetail = new MemberDetail();
    membershipList: MemberMembershipList[] = [];

    /* Message */
    messages = Messages;

    /* Configurations */
    serverImageAddress = environment.imageUrl;
    allowedReferredBy:boolean;
    isSmsAllowed:boolean = true;
    isEmailAllowed:boolean = true;
    isPushNotificationAllowed:boolean = true;
    package = ENU_Package;
    defaultCountry: string;
    constructor(
        private _httpService: HttpService,
        private dialogRef: MatDialogRef<ViewMemberDetail>,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        @Inject(MAT_DIALOG_DATA) public customer: AllCustomers) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
        this.getBranchFundamentals();
        this.isPartPaymentAllowed();
        if (this.customer.CustomerTypeID == 3) {
            this.getMemberDetailById(this.customer.CustomerID);
        } else {
            this.getClientDetail(this.customer.CustomerID);
        }
        // this.partialPaymentSubscription = this._dataSharingService.isPartPaymentAllow.subscribe(
        //     (partialPayment: boolean) => {
        //         this.isPartialPaymentAllow = partialPayment;
        //     }
        // )
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
            (packageId: number) => {
                if (packageId && packageId > 0) {
                    this.setPackagePermission(packageId);
                }
            }
        );
    }
    async isPartPaymentAllowed() {
        this.isPartialPaymentAllow = await super.isPartPaymentAllow(this._dataSharingService);
        //console.log(this.isPartialPaymentAllow)

    }
    // #region Event(s)

    onCloseDialog() {
        this.dialogRef.close();
    }
    ngOnDestroy() {
        this.packageIdSubscription.unsubscribe();
    }
    // #endregion

    // #region Method(s)

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    }

    getMemberDetailById(memberID: number) {
        if (memberID > 0) {
            this._httpService.get(MemberApi.getMemberDetail + memberID)
                .subscribe((res: ApiResponse) => {
                        if (res && res.MessageCode && res.MessageCode > 0) {
                            this.customerDetail = res.Result;
                            this.membershipList = this.customerDetail.MemberMembershipList;
                            this.isDataExists = this.membershipList != null && this.membershipList.length > 0 ? true : false;
                            if (this.customerDetail.ImagePath && this.customerDetail.ImagePath.length > 0) {
                                this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setCustomerImagePath()) + this.customerDetail.ImagePath;
                            }
                        }else{
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    },
                        err => {
                            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Member information"));
                        }
                    
                )
        }
    }


    getClientDetail(clientID: number) {
        this._httpService.get(ClientApi.getClientViewDetailByID + clientID)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.customerDetail = res.Result;
                    // this.customerDetail.FullName = this.customerDetail.Title + ' ' + this.customerDetail.FirstName + ' ' + this.customerDetail.LastName;
                    if (this.customerDetail.ImagePath && this.customerDetail.ImagePath.length > 0) {
                        this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setCustomerImagePath()) + this.customerDetail.ImagePath;
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);

                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Client information"));
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
                this.allowedReferredBy = true
                break;

            case this.package.FitnessBasic:
                this.isSmsAllowed = false;
                break;

            case this.package.FitnessMedium:
                break;

            case this.package.Full:
                this.allowedReferredBy = true;
                break;

        }
      }

    async getCompanyDetails() {
        const company = await super.getCompanyDetail(this._dataSharingService);
        if (company) {
            this.companyDetails = company;
            this.defaultCountry = this.countryList.find(country => country.CountryID == this.companyDetails.CountryID).CountryName;
        }

    }

    getBranchFundamentals() {
        this._httpService.get(BranchApi.getBranchFundamentals).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                this.countryList = res.Result.CountryList;
                if (this.countryList.length > 0) {
                    this.getCompanyDetails()
                }
            } else {
                this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
            }
        },
            (error) => {
                this._messageService.showErrorMessage(
                    this.messages.Error.Dropdowns_Load_Error
                );
            }
        );
    }
    // #endregion

}
