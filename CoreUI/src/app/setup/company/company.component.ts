/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SubscriptionLike as ISubscription, Observable } from 'rxjs';


/********************** Services & Models *********************/
/* Models */
import { CompanyDetails, CompanyInfo } from '@setup/models/company.details.model';
import { ApiResponse, DD_Branch } from '@app/models/common.model';

/* Services */
import { HttpService } from '@services/app.http.service';
import { DataSharingService } from '@services/data.sharing.service';
import { MessageService } from '@services/app.message.service';
import { AuthService } from '@app/helper/app.auth.service';
import { CompanyDetailsApi } from '@helper/config/app.webapi';

/***************** Common *********************/
import { CommonService } from '@app/services/common.service';
import { ImageEditorPopupComponent } from '@app/application-dialog-module/image-editor/image.editor.popup.component';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';

/**************** Configuration ***********/
import { Messages } from '@app/helper/config/app.messages';
import { environment } from '@env/environment';
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { AppUtilities } from '@app/helper/aap.utilities';

/**************** Components ***********/
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';

@Component({
  selector: 'company-details',
  templateUrl: './company.component.html'
})
export class CompanyComponent extends AbstractGenericComponent  implements OnInit {

  // #region Local Members

  @ViewChild('companyDetailsForm') companyDetailsForm: NgForm;

  /* Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;
  hascurrencyFormated: boolean = false;
  currencyFormat: string;

  /* Collection Types */
  cityList: any[];
  countryList: any[];
  statecountyList: any[];
  stateCountyListByCountryId: any[];
  cityListByStateId: any[];

  /* Local Members*/
  isImageExist: boolean;
  imagePath: string = "";
  isCompanySaveAllowed: boolean = false;
  IsAppleStoreURL: boolean;
  IsGooglePlayStoreURL: boolean;

  /* Configurations */
  serverImageAddress = environment.imageUrl;

  /* Model Refrences */
  public companyDetails: CompanyDetails = new CompanyDetails();

  // #endregion


  constructor(
    private _authService: AuthService,
    private _httpService: HttpService,
    private _dataSharingService: DataSharingService,
    private _messageService: MessageService,
    private _commonService: CommonService,
    private _dialog: MatDialogService,
  ) { super()}

  ngOnInit() {
    this.isCompanySaveAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Company);

    this.getCompanyDetailsFundamentals();
    this._dataSharingService.companyImageUploaded.subscribe(isUploaded => {
      if (isUploaded) {
        this.getCompanyDetails();
      }
    })
    this.getCurrentBranchDetail();
  }

  // #region Events

  onDeleteImage() {
    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this.discardImage();
      }
    });
  }

  //get current branch time format
  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    // if (branch && branch.hasOwnProperty("Currency")) {
    //   this.currencyFormat = branch.Currency.toLowerCase().substring(0, branch.Currency.length - 1);
    //   this.hascurrencyFormated = true;
    // }

    if (branch && branch.hasOwnProperty("ISOCode")) {
      this.currencyFormat = branch.ISOCode.toLowerCase();
      this.hascurrencyFormated = true;
    }

  }

  // #endregion

  // #region Methods

  /*Get Company detail fundamental which included country and state of countries list*/
  getCompanyDetailsFundamentals() {
    this._httpService.get(CompanyDetailsApi.getFundamentals)
      .subscribe(
        data => {
          if (data && data.MessageCode > 0 ) {
            this.countryList = data.Result.CountryList;
            this.statecountyList = data.Result.StateCountyList;
            this.getCompanyDetails();
          }else{
            this._messageService.showErrorMessage(data.MessageText);
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
        }
      );
  }

  /*Get Company detail, shared company detail, set image path and app url*/
  getCompanyDetails() {
    this._httpService.get(CompanyDetailsApi.get)
      .subscribe(
        data => {
          if (data && data.MessageCode > 0) {
            if (data.Result) {
              this.companyDetails = data.Result;
              this.IsAppleStoreURL = this.companyDetails.AppleStoreURL == "" ? true : false;
              this.IsGooglePlayStoreURL = this.companyDetails.GooglePlayStoreURL == "" ? true : false;
              this.getStatesByCountryId(this.companyDetails.CountryID);

              if (this.companyDetails.ImagePath && this.companyDetails.ImagePath.length > 0) {
                this.isImageExist = true;
                this.imagePath = environment.imageUrl + this.companyDetails.ImagePath;
              }

              this.setCompanyLogo();
              this._dataSharingService.shareCompanyImage(this.companyDetails.ImagePath);
              this._dataSharingService.shareCompanyID(this.companyDetails.CompanyID);
            }
            else {
              this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Company Details"));
            }
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Company Details"));
        });
  }

  /*Get States By country */
  getStatesByCountryId(countryId: number) {
    if (this.statecountyList) {
      this.stateCountyListByCountryId = this.statecountyList.filter(sc => sc.CountryID == countryId);
    }
  }

  /*save company Detail*/
  saveCompanyDetails(isValid: boolean) {
    if (isValid && this.companyDetailsForm.dirty) {
      this.hasSuccess = false;
      this.hasError = false;
      this.companyDetails.Email = this.companyDetails.Email.toLowerCase();
      this.companyDetails.ContactEmail = this.companyDetails.ContactEmail ? this.companyDetails.ContactEmail.toLowerCase() : '';
      this._httpService.save(CompanyDetailsApi.save, this.companyDetails)
        .subscribe((res: any) => {
          if (res && res.MessageCode > 0) {
            this.IsAppleStoreURL = this.companyDetails.AppleStoreURL == "" ? true : false;
            this.IsGooglePlayStoreURL = this.companyDetails.GooglePlayStoreURL == "" ? true : false;
            this.shareCompanyInfo();
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Company Details"));
          }
          else {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Company Details"));
          }
        },
          err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Company Details")); }
        );
    }
  }

  /*share company info and company image over the app*/
  shareCompanyInfo() {
    let companyInfo = new CompanyDetails();

    companyInfo.CompanyName = this.companyDetails.CompanyName;
    companyInfo.Email = this.companyDetails.Email;
    companyInfo.Phone1 = this.companyDetails.Phone1;
    companyInfo.Address1 = this.companyDetails.Address1;
    companyInfo.Address2 = this.companyDetails.Address2;

    this._dataSharingService.shareCompanyInfo(companyInfo);
    this._dataSharingService.shareCompanyImage(this.companyDetails.ImageFile ? this.companyDetails.ImageFile : this.companyDetails.ImagePath);
  }

  /* To copy Text from Textbox */
  copyUrl(prefix: string, value: string) {
    var tempInput = document.createElement("input");
    tempInput.value = prefix + value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

  }

  // #endregion


  // #region Image

  /* croppe image , in this method set the hiegth width of the image, set company log , and then check form validation.*/
  showImageCropperDialog() {
    const dialogInst = this._dialog.open(ImageEditorPopupComponent, {
      disableClose: true,
      data: {
        height: 44,
        width: 272,
        aspectRatio: 272 / 44,
        showWebCam: true
      }
    });

    dialogInst.componentInstance.croppedImage.subscribe((img: string) => {
      if (img && img.length > 0) {
        this.companyDetails.ImageFile = img;
        this.setCompanyLogo();
        this.companyDetailsForm.form.markAsDirty();
      }
    });
  }

  /* set image path and bind with server image address  */
  setCompanyLogo() {
    this.imagePath = "";
    if (this.companyDetails.ImageFile && this.companyDetails.ImageFile != "") {
      this.imagePath = "data:image/jpeg;base64," + this.companyDetails.ImageFile;
      this.isImageExist = true;
    }
    else if (this.companyDetails.ImagePath && this.companyDetails.ImagePath != "") {
      this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setCustomerImagePath()) + this.companyDetails.ImagePath;
      this.isImageExist = true;
    }
    else {
      this.isImageExist = false;
    }
  }

  /* discard image */
  discardImage() {
    this._commonService.deleteFile(ENU_Permission_Setup.Company, this.companyDetails.CompanyID, this.companyDetails.ImagePath)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Image"));
          this.companyDetails.ImageFile = "";
          this.companyDetails.ImagePath = "";
          this.setCompanyLogo();
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image"));
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image")); }
      );
  }

  // #endregion
}