/********************** Angular Refrences *********************/
import { Component, OnInit } from '@angular/core';
import { SubscriptionLike } from 'rxjs';
import { Location } from '@angular/common';
/********************** Angular Material Refrences *********************/

/********************** Application Components *********************/
import { WidgetBannerUploadComponent } from '@setup/configuration/widget/upload-widget-banner/upload.banner.component';
import { ViewWidgetBannerComponent } from '@setup/configuration/widget/view-widget-banner/view.banner.component';

/********************** Service & Models *********************/
/*Services*/
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { DataSharingService } from '@app/services/data.sharing.service';

/*Models*/
import { WidgetUrl, SocialMedia, Banner, Branch, UploadBanner, Permission } from '@setup/models/widget.settings.model';

/********************** Common and Customs *********************/
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';

/******************  Configurations ****************************/
import { ENU_BannerType, ENU_Package, ENU_LandingPage } from '@helper/config/app.enums';
import { Messages } from '@app/helper/config/app.messages';
import { WidgetSettingApi } from '@app/helper/config/app.webapi';
import { SocialMediaLinks, Configurations } from '@app/helper/config/app.config';
import { ApiResponse } from '@app/models/common.model';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { environment } from "@env/environment";
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html'
})
export class WidgetComponent implements OnInit {

  /* Messages */
  messages = Messages;

  /*********** Local Members **********/
  packageId: number;
  isDataExists: boolean = false;
  imageString: string;
  socialMediaCopy: any;

  isGymPackage: boolean;
  isServiceAllowed: boolean;
  isProductAllowed: boolean;

  /*********** Collection Types **********/
  branch: Branch;
  uploadBanner: UploadBanner;
  socialMediaModel: SocialMedia;
  bannerModel: Banner;
  widgetUrl: WidgetUrl;
  permissions: Permission;
  landingPageLists: any = Configurations.LandingPageList;
  landingPageList: any;

  /* Configurations */
  bannerType = ENU_BannerType;
  socialMediaLinks = SocialMediaLinks;
  package = ENU_Package;
  enu_LandingPage = ENU_LandingPage;

  packageIdSubscription: SubscriptionLike;

  constructor(
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dataSharingService: DataSharingService,
    private _uploadBannerDialog: MatDialogService,
    private _viewBannerDialog: MatDialogService,
    private _deleteDialog: MatDialogService,
    private rewriteUrl: Location
  ) {
    this.branch = new Branch();
    this.socialMediaModel = new SocialMedia();
    this.bannerModel = new Banner();
    this.uploadBanner = new UploadBanner();
    this.widgetUrl = new WidgetUrl();
    this.permissions = new Permission();

    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
      if (packageId && packageId > 0) {
        this.isGymPackage = packageId === this.package.FitnessBasic ||
          packageId === this.package.FitnessMedium ||
          packageId === this.package.Full;
        this.isServiceAllowed = packageId === this.package.WellnessBasic ||
          packageId === this.package.WellnessMedium ||
          packageId === this.package.WellnessTop ||
          packageId === this.package.Full;
        this.isProductAllowed = packageId === this.package.WellnessMedium ||
          packageId === this.package.WellnessTop ||
          packageId === this.package.FitnessMedium ||
          packageId === this.package.Full;
      }
    })
  }

  ngOnInit() {
    //this.permissions.defaultLandingPage = this.landingPageList[0].value;
    this.permissions.ShowHomeOnline = true;
    if (this.isGymPackage) {
      this.landingPageList = this.landingPageLists;
    }
    if (this.isServiceAllowed && !this.isGymPackage) {
      this.landingPageList = this.landingPageLists.filter(x => x.value == 1 || x.value == 4);
    }
    if (this.isProductAllowed && !this.isGymPackage) {
      this.landingPageList = this.landingPageLists.filter(x => x.value == 1 || x.value == 4 || x.value == 5);
    }
    if (this.isProductAllowed && this.isGymPackage && !this.isServiceAllowed) {
      this.landingPageList = this.landingPageLists.filter(x => x.value == 1 || x.value == 2 || x.value == 3 || x.value == 5);
    }
    if (!this.isProductAllowed && !this.isServiceAllowed && this.isGymPackage) {
      this.landingPageList = this.landingPageLists.filter(x => x.value == 1 || x.value == 2 || x.value == 3);
    }
    //rewrite the url state
    this.rewriteUrl.replaceState("/setup/configurations/widget");
    this.getFundamentals();

  }

  ngOnDestroy() {
    this.packageIdSubscription.unsubscribe();
  }

  // #region events

  onViewBanner(imagePath: string) {
    if (imagePath && imagePath !== "" && imagePath !== "0") {
      this._viewBannerDialog.open(ViewWidgetBannerComponent, {
        disableClose: true,
        data: imagePath
      })
    }
  }

  onUploadBanner(bannerType: number) {
    const openDialogRef = this._uploadBannerDialog.open(WidgetBannerUploadComponent, {
      disableClose: true,
      data: bannerType
    });
    openDialogRef.componentInstance.imagePath.subscribe((imgPath) => {
      if (imgPath && imgPath !== "") {
        this.updateBannerImage(bannerType, imgPath);
      }
    });
  }

  onRemoveBanner(bannerType: number, fileName: string) {
    if (fileName != "") {
      const deleteDialogRef = this._deleteDialog.open(DeleteConfirmationComponent, { disableClose: true, data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_Undone } });
      deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
        if (isConfirmDelete) {
          this.deleteBanner(bannerType, fileName);
        }
      })
    }
  }

  onSelectLandingPage() {
    switch (Number(this.permissions.defaultLandingPage)) {
      case this.enu_LandingPage.Home:
        this.permissions.ShowHomeOnline = true;
        break;

      case this.enu_LandingPage.Memberships:
        this.permissions.ShowMembershipOnline = true;
        break;

      case this.enu_LandingPage.Classes:
        this.permissions.ShowClassOnline = true;
        break;

      case this.enu_LandingPage.Services:
        this.permissions.ShowServiceOnline = true;
        break;

      case this.enu_LandingPage.Products:
        this.permissions.ShowProductOnline = true;
        break;
      case this.enu_LandingPage.Events:
        this.permissions.ShowEventOnline = true;
        break;
      case this.enu_LandingPage.Packages:
        this.permissions.ShowPackageOnline = true;
        break;

      default:
        break;
    }
  }

  // #endregion

  // #region methods

  getFundamentals() {
    return this._httpService.get(WidgetSettingApi.getFundamentals)
      .subscribe(data => {
        if (data && data.Result) {
          this.widgetUrl = data.Result.WidgetUrl != null ? data.Result.WidgetUrl : new WidgetUrl();
          if (this.widgetUrl.QRCodeUrl != "") {
            this.widgetUrl.QRCodeUrl = environment.qrCodeUrl + data.Result?.WidgetUrl?.QRCodeUrl;
          }
          let branchWidgetPermission = data.Result.WidgetSettingWithBranch;
          this.branch.BranchID = branchWidgetPermission.BranchID;
          this.branch.BranchName = branchWidgetPermission.BranchName;
          this.permissions = branchWidgetPermission.WidgetSetting.Permission;
          this.permissions.defaultLandingPage = branchWidgetPermission.WidgetSetting.Permission == undefined || branchWidgetPermission.WidgetSetting.Permission?.DefaultLandingPage == 0 ? this.landingPageList[0].value : branchWidgetPermission.WidgetSetting.Permission?.DefaultLandingPage;
          if (this.permissions.defaultLandingPage === 1) {
            this.permissions.ShowHomeOnline = true;
          }
          this.socialMediaModel = this.setSocialMediaForEdit(branchWidgetPermission.WidgetSetting.SocialMedia);
          this.bannerModel = branchWidgetPermission.WidgetSetting.Banner;

          this.socialMediaCopy = JSON.parse(JSON.stringify(this.socialMediaModel));
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Widget Settings."));
        }
      );
  }

  saveWidgetSettings() {
    this.permissions.defaultLandingPage = Number(this.permissions.defaultLandingPage);
    this._httpService.save(WidgetSettingApi.savePermissions, this.permissions)
      .subscribe(res => {
        if (res && res.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Online resources "));
        } else {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Online resources "));
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Online resources "));
        });
  }

  saveSocialMedia() {
    if (JSON.stringify(this.socialMediaCopy) != JSON.stringify(this.socialMediaModel)) {
      this._httpService.save(WidgetSettingApi.saveSocialMedia, this.setSocialMediaForSave(Object.assign({}, this.socialMediaModel)))
        .subscribe((res: any) => {
          if (res && res.MessageCode > 0) {
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Social Media Links"));
            this.socialMediaCopy = JSON.parse(JSON.stringify(this.socialMediaModel));
          } else {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Social Media Links"));
          }
        },
          err => {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Social Media Links"));
          });
    }
  }

  deleteBanner(bannerType: number, fileName: string) {
    let params = {
      FileName: fileName,
      BannerTypeID: bannerType
    }
    this._httpService.delete(WidgetSettingApi.deleteBanner, params)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Banner"));
          this.updateBannerImage(bannerType, '');
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Banner"));
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Banner"));
        });
  }

  updateBannerImage(bannerType: number, imgPath: string) {
    switch (bannerType) {
      case (this.bannerType.Home): {
        this.bannerModel.HomeBanner = imgPath;
        break;
      }

      case (this.bannerType.Class): {
        this.bannerModel.ClassBanner = imgPath;
        break;
      }

      case (this.bannerType.Membership): {
        this.bannerModel.MembershipBanner = imgPath;
        break;
      }

      case (this.bannerType.Product): {
        this.bannerModel.ProductBanner = imgPath;
        break;
      }

      case (this.bannerType.Service): {
        this.bannerModel.ServiceBanner = imgPath;
        break;
      }
      case (this.bannerType.Event): {
        this.bannerModel.EventBanner = imgPath;
        break;
      }
      case (this.bannerType.Package): {
        this.bannerModel.PackageBanner = imgPath;
        break;
      }
      case (this.bannerType.Checkout): {
        this.bannerModel.CheckoutBanner = imgPath;
        break;
      }

      case (this.bannerType.Promotional): {
        this.bannerModel.PromotionalBanner = imgPath;
        break;
      }
    }
  }

  setSocialMediaForEdit(socialMedia: SocialMedia) {
    if (socialMedia) {
      if (socialMedia.FacebookUrl && socialMedia.FacebookUrl.length > 0) {
        socialMedia.FacebookUrl = socialMedia.FacebookUrl.substr(this.socialMediaLinks.Facebook.length, socialMedia.FacebookUrl.length);
      }
      if (socialMedia.TwitterUrl && socialMedia.TwitterUrl.length > 0) {
        socialMedia.TwitterUrl = socialMedia.TwitterUrl.substr(this.socialMediaLinks.Twitter.length, socialMedia.TwitterUrl.length);
      }
      if (socialMedia.YoutubeUrl && socialMedia.YoutubeUrl.length > 0) {
        socialMedia.YoutubeUrl = socialMedia.YoutubeUrl.substr(this.socialMediaLinks.Youtube.length, socialMedia.YoutubeUrl.length);
      }
      if (socialMedia.LinkedInUrl && socialMedia.LinkedInUrl.length > 0) {
        socialMedia.LinkedInUrl = socialMedia.LinkedInUrl.substr(this.socialMediaLinks.LinkedIn.length, socialMedia.LinkedInUrl.length);
      }
      if (socialMedia.InstagramUrl && socialMedia.InstagramUrl.length > 0) {
        socialMedia.InstagramUrl = socialMedia.InstagramUrl.substr(this.socialMediaLinks.Instagram.length, socialMedia.InstagramUrl.length);
      }
    }
    return socialMedia;
  }

  setSocialMediaForSave(socialMedia: SocialMedia) {
    if (socialMedia) {
      if (socialMedia.FacebookUrl && socialMedia.FacebookUrl.length > 0) {
        socialMedia.FacebookUrl = this.socialMediaLinks.Facebook + socialMedia.FacebookUrl;
      }
      if (socialMedia.TwitterUrl && socialMedia.TwitterUrl.length > 0) {
        socialMedia.TwitterUrl = this.socialMediaLinks.Twitter + socialMedia.TwitterUrl;
      }
      if (socialMedia.LinkedInUrl && socialMedia.LinkedInUrl.length > 0) {
        socialMedia.LinkedInUrl = this.socialMediaLinks.LinkedIn + socialMedia.LinkedInUrl;
      }
      if (socialMedia.YoutubeUrl && socialMedia.YoutubeUrl.length > 0) {
        socialMedia.YoutubeUrl = this.socialMediaLinks.Youtube + socialMedia.YoutubeUrl;
      }
      if (socialMedia.InstagramUrl && socialMedia.InstagramUrl.length > 0) {
        socialMedia.InstagramUrl = this.socialMediaLinks.Instagram + socialMedia.InstagramUrl;
      }
    }
    return socialMedia;
  }

  /* To copy Text from Textbox */
  copyUrl(prefix: string, value: string) {
    // inputElement.select();
    // document.execCommand('copy');
    // inputElement.setSelectionRange(0, 0);

    var tempInput = document.createElement("input");
    tempInput.style.position = "relative";
    tempInput.style.left = "-1000px";
    tempInput.style.top = "-1000px";
    tempInput.value = prefix + value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }


  // #endregion

}
