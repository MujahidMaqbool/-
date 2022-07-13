/************** Angular References ******************/
import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from '@angular/forms';
import { SubscriptionLike as ISubscription } from "rxjs";

/************** Services & Models ****************/
/* Services */
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { DateTimeService } from "@app/services/date.time.service";
import { DataSharingService } from "@app/services/data.sharing.service";

/* Modles */
import { StaffProfile, StaffInfo } from '@staff/models/staff.model';

/********************** Common *********************/
import { Messages } from '@app/helper/config/app.messages';
import { environment } from '@env/environment';
import { ImageEditorPopupComponent } from "@app/application-dialog-module/image-editor/image.editor.popup.component";
import { Configurations } from "@app/helper/config/app.config";
import { StaffProfileApi, StaffApi } from '@helper/config/app.webapi';
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { CommonService } from "@app/services/common.service";
import { ENU_Permission_Staff } from '@app/helper/config/app.module.page.enums';
import { ApiResponse, DD_Branch } from "@app/models/common.model";
import { variables } from "@app/helper/config/app.variable";
import { AppUtilities } from "@app/helper/aap.utilities";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";

@Component({
    selector: 'staff-profile',
    templateUrl: './staff.profile.popup.component.html'
})

export class StaffProfilePopupComponent extends AbstractGenericComponent implements OnInit {

    @ViewChild('staffProfileForm') staffProfileForm: NgForm;

    /* Local Members */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    errorMessage: string;
    successMessage: string;
    messages = Messages;
    isImageExist: boolean;
    imagePath: string;
    maxDate: Date = new Date();
    defaultBranchCountry :string
    loggedInStaffID: number;

    /* Collection Types*/
    countryList: any[];
    stateList: any[];
    stateListByCountryId: any[];
    genderList: string[];
    titleList: string[];

    /* Model Refrences*/
    staffProfileModel: StaffProfile = new StaffProfile();
    currentBranchData: DD_Branch = new DD_Branch();
    staffInfo: StaffInfo = new StaffInfo();
    serverImageAddress = environment.imageUrl;
    loggedInStaffSubscription: ISubscription;

    dateFormatForSave = Configurations.DateFormatForSave;

    constructor(
        private _staffService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _dialog: MatDialogService,
        private _commonService: CommonService,
    ) {super() }

    ngOnInit() {
        this.getCurrentBranchDetail();
        this.getFundamentals();
        this.getStaffProfile();



        this.loggedInStaffSubscription = this._dataSharingService.loggedInStaffID.subscribe((staffId: number) => {
            this.loggedInStaffID = staffId;
        });
    }

    // #region Events

    onCountryChange(countryId: number) {
        // this.getStatesByCountryId(countryId);
        // if (this.stateListByCountryId && this.stateListByCountryId.length > 0) {
        //     /* If No StateCountyID is set, then set First StateCounty from StateCounty list*/
        //     this.staffProfileModel.StateCountyID = (this.staffProfileModel.StateCountyID && this.staffProfileModel.StateCountyID > 0) ? this.staffProfileModel.StateCountyID : this.stateListByCountryId[0].StateCountyID;
        // }
    }

    onShowImageCropperDialog() {
        const dialogInst = this._dialog.open(ImageEditorPopupComponent, {
            disableClose: true,
            data: {
              height: 200,
              width: 200,
              aspectRatio: 200 / 200,
              showWebCam: true
            }
        });

        dialogInst.componentInstance.croppedImage.subscribe((img: string) => {
            if (img && img.length > 0) {
                this.staffProfileModel.ImageFile = img;
                this.setStaffImage();
                this.staffProfileForm.form.markAsDirty();
            }
        });
    }

    onBirthDateChange(date: any) {
        this.staffProfileForm.form.markAsDirty();
        setTimeout(() => {
            this.staffProfileModel.BirthDate = date;
        });
    }

    onClosePopup() {
        this._dialog.closeAll();
    }

    onDeleteImage() {
        const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this.discardImage();
            }
        })
    }

    // #endregion

    // #region Methods
    async getBranchSetting()
    {
        //implementation change after discuss with tahir bhai show branch current date not browser date implementaed by fahad dated on 03-03-2021
    }

    getFundamentals() {
        this._staffService.get(StaffApi.getFundamentals)
            .subscribe(
                data => {
                    this.countryList = data.Result.CountryList;
                    this.stateList = data.Result.StateCountyList;
                    this.titleList = data.Result.TitleList;
                    this.genderList = data.Result.GenderList;

                    this.setDefaultDropdowns();
                },
                error => this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error));
    }

    getStaffProfile() {
        this._staffService.get(StaffProfileApi.profile)
            .subscribe(
                data => {
                    this.staffProfileModel = data.Result;
                    this.staffProfileModel.StaffID = this.loggedInStaffID;
                    this.setStaffImage();
                },
            );
    }

    getStatesByCountryId(countryId: number) {
        if (this.stateList && this.stateList.length > 0) {
            this.stateListByCountryId = this.stateList.filter(c => c.CountryID == countryId);
        }
    }

    setStaffImage() {
        this.isImageExist = false;
        if (this.staffProfileModel.ImageFile && this.staffProfileModel.ImageFile.length > 0) {
            this.isImageExist = true;
            this.imagePath = "data:image/jpeg;base64," + this.staffProfileModel.ImageFile;
        }
        else if (this.staffProfileModel.ImagePath && this.staffProfileModel.ImagePath.length > 0) {
            this.isImageExist = true;
            this.imagePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setStaffImagePath()) + this.staffProfileModel.ImagePath;
        }
    }

    setDefaultDropdowns() {

        /* If No Title ID is set, then set First Title from title list*/
        this.staffProfileModel.Title = this.staffProfileModel.Title && this.staffProfileModel.Title !== '' ? this.staffProfileModel.Title : this.titleList[0];

        /* If No Gender ID is set, then set First gender from gender list*/
        this.staffProfileModel.Gender = this.staffProfileModel.Gender && this.staffProfileModel.Gender !== '' ? this.staffProfileModel.Gender : this.genderList[0];

        /* If No Country ID is set, then set First Country from country list*/
       // this.staffProfileModel.CountryID = (this.staffProfileModel.CountryID && this.staffProfileModel.CountryID > 0) ? this.staffProfileModel.CountryID : this.countryList[0].CountryID;
        //this.onCountryChange(this.staffProfileModel.CountryID);

    }

    saveStaffProfile(isValid: boolean) {
        if (isValid && this.staffProfileForm.dirty) {
            let staffForSave = JSON.parse(JSON.stringify(this.staffProfileModel));
            // staffForSave.BirthDate = this._dateTimeService.convertDateObjToString(staffForSave.BirthDate, this.dateFormatForSave);
            this._staffService.save(StaffProfileApi.update, staffForSave)
                .subscribe(res => {
                    if (res && res.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Staff Profile"));
                        this.setStaffImage();
                        this.shareData();

                        this.onClosePopup();
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff Profile"));
                    }

                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff Profile")); }
                );
        }
    }

    setStaffInfo() {
        /* Set Staff Info*/
        this.staffInfo.FirstName = this.staffProfileModel.FirstName;
        this.staffInfo.LastName = this.staffProfileModel.LastName;
        this.staffInfo.Mobile = this.staffProfileModel.Mobile.toString();
        this.staffInfo.Address = this.staffProfileModel.Address1;
    }

    shareData() {
        this.setStaffInfo();

        this._dataSharingService.shareStaffInfo(this.staffInfo);
        this._dataSharingService.shareStaffImage(this.staffProfileModel.ImageFile ? this.staffProfileModel.ImageFile : this.staffProfileModel.ImagePath);
    }

    discardImage() {
        this._commonService.deleteFile(ENU_Permission_Staff.Save, this.staffProfileModel.StaffID, this.staffProfileModel.ImagePath)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Image"));
                    this.staffProfileModel.ImageFile = "";
                    this.staffProfileModel.ImagePath = "";
                    this.setStaffImage();
                    this.shareData();
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image"));
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image")); }
            );
    }
      //get current branch time format
      async getCurrentBranchDetail() {
        this.maxDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
          this.defaultBranchCountry = branch.Currency.toLowerCase().substring(0, branch.Currency.length - 1);
          this.currentBranchData = branch;
        }
      }

    // #endregion
}
