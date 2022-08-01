import { Component, Inject } from '@angular/core';

/*********************** Material Reference *************************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


/********************** Services & Models *********************/
/* Services */
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';

/* Models */
import { ApiResponse } from 'src/app/models/common.model';
import { LeadDetail } from 'src/app/lead/models/lead.model';

/*************************** Configurations *************************/
import { environment } from 'src/environments/environment';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { BranchApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';
import { ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { ImagesPlaceholder } from 'src/app/helper/config/app.placeholder';

/*************************** Components *************************/
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';


@Component({
  selector: 'view-lead-detail',
  templateUrl: './view.lead.detail.component.html',
})
export class ViewLeadDetailComponent extends AbstractGenericComponent {
  // partialPaymentSubscription: ISubscription;
  isPartialPaymentAllow: boolean = false;

  imagePath = ImagesPlaceholder.user;
  dateFormat: string = ''; //Configurations.DateFormat;
  serverImageAddress = environment.imageUrl;
  companyDetails: any;
  defaultCountry: string;
  messages = Messages;
  countryList: any[];

  constructor(
    private dialogRef: MatDialogRef<ViewLeadDetailComponent>,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dataSharingService: DataSharingService,
    @Inject(MAT_DIALOG_DATA) public viewLeadDetailDataObj: LeadDetail
  ) {
    super();
  }

  ngOnInit() {
    this.getBranchFundamentals();
    this.getBranchDatePattern();
    if (
      this.viewLeadDetailDataObj.ImagePath &&
      this.viewLeadDetailDataObj.ImagePath.length > 0
    ) {
      this.imagePath =
        this.serverImageAddress.replace(
          '{ImagePath}',
          AppUtilities.setCustomerImagePath()
        ) + this.viewLeadDetailDataObj.ImagePath;
    }
    this.isPartPaymentAllowed();
    // this.partialPaymentSubscription = this._dataSharingService.isPartPaymentAllow.subscribe(
    //     (partialPayment: boolean) => {
    //         this.isPartialPaymentAllow = partialPayment;
    //     }
    // )
  }
  async isPartPaymentAllowed() {
    this.isPartialPaymentAllow = await super.isPartPaymentAllow(
      this._dataSharingService
    );
  }
  ngOnDestroy() {
    // this.partialPaymentSubscription.unsubscribe();
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  async getBranchDatePattern() {
    this.dateFormat = await super.getBranchDateFormat(
      this._dataSharingService,
      ENU_DateFormatName.DateFormat
    );
  }

  async getCompanyDetails() {
    const company = await super.getCompanyDetail(this._dataSharingService);
    if (company) {
        this.companyDetails = company;
        this.defaultCountry = this.countryList.find(
          (country) => country.CountryID == this.companyDetails.CountryID
        ).CountryName;

    }

    // this._httpService.get(CompanyDetailsApi.get).subscribe(
    //   (data) => {
    //     if (data && data.MessageCode > 0) {
    //       if (data.Result) {
    //         this.companyDetails = data.Result;
    //         this.defaultCountry = this.countryList.find(
    //           (country) => country.CountryID == this.companyDetails.CountryID
    //         ).CountryName;
    //       } else {
    //         this._messageService.showErrorMessage(
    //           this.messages.Error.Get_Error.replace('{0}', 'Company Details')
    //         );
    //       }
    //     }
    //   },
    //   (error) => {
    //     this._messageService.showErrorMessage(
    //       this.messages.Error.Get_Error.replace('{0}', 'Company Details')
    //     );
    //   }
    // );
  }

  getBranchFundamentals() {
    this._httpService.get(BranchApi.getBranchFundamentals).subscribe(
      (res:ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.countryList = res.Result.CountryList;
          if (this.countryList.length > 0) {
            this.getCompanyDetails();
          }
        }else{
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace('{0}', 'Branch Details')
        );
      }
    );
  }
}
