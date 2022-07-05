/*********************** Angular Refernces ****************************/
import { Component, Inject, Output, EventEmitter, ViewChild, OnInit, OnDestroy } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CropperComponent } from 'angular-cropperjs';
/***************** Models & Services ************************/
import { UploadBanner } from '@setup/models/widget.settings.model';

import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';


/*********** Configurations *************/
import { ENU_BannerType } from '@helper/config/app.enums';
import { WidgetSettingApi } from '@helper/config/app.webapi';
import { environment } from '@env/environment';
import { Messages } from '@app/helper/config/app.messages';
import { variables } from '@app/helper/config/app.variable';

@Component({
    selector: 'upload-banner',
    templateUrl: './upload.banner.component.html'
})
export class WidgetBannerUploadComponent implements OnInit, OnDestroy {
    @ViewChild('cropper') public imgCropper: CropperComponent;

    // #region Local Members

    @Output()
    imagePath = new EventEmitter<string>();

    height: number;
    width: number;
    imageUrl: any;
    croppedImg: string;
    showCropper: boolean;

    /* Model Reference */
    saveBannerModel: UploadBanner;
    cropperConfig: object = {};

    /* Configurations */
    serverImageAddress = environment.imageUrl;
    messages = Messages;
    bannerType = ENU_BannerType;

    // #endregion

    constructor(
        public dialogRef: MatDialogRef<WidgetBannerUploadComponent>,
        private _httpService: HttpService,
        private _messageService: MessageService,
        @Inject(MAT_DIALOG_DATA) public bannerTypeId: number
    ) {
        this.saveBannerModel = new UploadBanner();
    }

    // #region Events

    ngOnInit() {
        this.height = 460;
        this.width = 1920;

        this.cropperConfig = {
            movable: true,
            zoomable: true,
            viewMode: 1,
            aspectRatio: this.width / this.height,
            dragMode: 'move',
            toggleDragModeOnDblclick: false,
            autoCropArea: 0.75,
            //checkCrossOrigin: true //commented by fahad because not working cropper use this line after new update
        };
    }

    ngOnDestroy(){
        this.imgCropper.cropper.destroy();
    }

    onFileSelected(event) {
        const that = this;
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            that.showCropper = false;
            reader.onload = (eventCurr: ProgressEvent) => {
                that.imageUrl = (<FileReader>eventCurr.target).result;
                that.refreshCrop(that.imageUrl);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    onUpload() {
        this.saveBanner();
    }

    onCancel() {
        this.closePopup();
    }

    // #endregion 


    // #region Methods

    saveBanner() {
        this.saveBannerModel.BannerTypeID = this.bannerTypeId;
        this.saveBannerModel.ImageFile = this.croppedImg.substr(this.croppedImg.indexOf("base64,") + 7, this.croppedImg.length);
        this._httpService.save(WidgetSettingApi.saveBanner, this.saveBannerModel)
            .subscribe(res => {
                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Banner"));
                if (res && res.MessageCode > 0) {
                    this.imagePath.emit(res.Result);
                }else{
                    this._messageService.showErrorMessage(res.MessageText)
                }
                this.closePopup();
            },
            err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Banner")); });
    }

    closePopup() {
        this.dialogRef.close();
    }

    refreshCrop(img) {
        this.imageUrl = img;
        this.showCropper = true;
    }

    cropendImage(event) {
        this.croppedImg = this.getCroppedImage(this.height, this.width);
    }

    readyImage(event) {
        this.croppedImg = this.getCroppedImage(this.height, this.width);
    }

    getCroppedImage(height: number, width: number) {
        return this.imgCropper.cropper.getCroppedCanvas({height: height, width: width}).toDataURL('image/jpeg');
    }

    zoomManual() {
        this.croppedImg = this.getCroppedImage(this.height, this.width);
    }

    // #endregion
}