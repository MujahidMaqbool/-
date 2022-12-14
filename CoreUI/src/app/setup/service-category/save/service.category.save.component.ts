import { Component, Inject, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

/********************** START: Service & Models *********************/
/* Services */
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
/* Models */
import { ServiceCategory } from '@setup/models/service.category.model';
import { Messages } from '@app/helper/config/app.messages';
import { environment } from '@env/environment';
import { ServiceCategoryApi } from '@app/helper/config/app.webapi';

/********************** START: Common *********************/
import { ImageEditorPopupComponent } from '@app/application-dialog-module/image-editor/image.editor.popup.component';
import { CommonService } from '@app/services/common.service';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { ApiResponse } from '@app/models/common.model';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { variables } from '@app/helper/config/app.variable';
import { AppUtilities } from '@app/helper/aap.utilities';

@Component({
  selector: 'service-category-save',
  templateUrl: './service.category.save.component.html'
})
export class ServiceCategorySaveComponent implements OnInit {

  @ViewChild('serviceForm') serviceForm: NgForm;

  @Output()
  serviceCategorySaved = new EventEmitter<boolean>();

  /* Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;
  pageTitle: string;

  /* Local Members*/
  isImageExists: boolean;
  imagePath: string = "";

  /* Configurations */
  //+ '/br' + localStorage.getItem(variables.BranchID) + '/'
  serverImageAddress = environment.imageUrl;

  constructor(
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dialog: MatDialogService,
    private _commonService: CommonService,
    public dialogRef: MatDialogRef<ServiceCategorySaveComponent>,
    @Inject(MAT_DIALOG_DATA) public serviceCategory: ServiceCategory) {
  }

  ngOnInit() {
    this.concatenateImagePath();
    if (this.serviceCategory.ServiceCategoryID > 0) {
      this.pageTitle = "Service Category";
    }
    else {
      this.pageTitle = "Service Category";
    }
  }

  // #region Events

  // onImageUrlChange(url: string) {
  //   if (url && url.length > 0) {
  //     this.serviceCategory.ImageFile = url;
  //     this.serviceForm.form.markAsDirty();
  //   }
  // }

  onClosePopup(): void {
    this.dialogRef.close();
  }

  onCategoryNameUpdated() {
    this.serviceCategory.ServiceCategoryName = this.serviceCategory.ServiceCategoryName.trim();
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

  saveServiceCategory(isvalid: boolean) {
    if (isvalid && (this.serviceForm.dirty || this.serviceCategory.ImageFile !== null)) {
      this.hasSuccess = false;
      this.hasError = false;
      // this.setImageFilePath();
      this._httpService.save(ServiceCategoryApi.save, this.serviceCategory)
        .subscribe((res: any) => {
          if (res && res.MessageCode > 0) {
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Service Category"));
            this.serviceCategorySaved.emit(true);
            this.onClosePopup();
          }
          else if (res && res.MessageCode < 0) {
            this._messageService.showErrorMessage(res.MessageText);
          }
          else {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Service Category"));
          }
        },
          err => {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Service Category"));
          }
        );
    }
  }

  // setImageFilePath() {
  //   if (this.serviceCategory.ImageFile == "") {
  //     this.serviceCategory.ImagePath = this.serviceCategory.ImagePath;
  //   }
  // }

  // showImageCroper() {
  //   this.isImageExists = false;
  // }

  showImageCropperDialog() {
    const dialogInst = this._dialog.open(ImageEditorPopupComponent, {
      disableClose: true,
      data: {
        showWebCam: true
      }
    });

    dialogInst.componentInstance.croppedImage.subscribe((img: string) => {
      if (img && img.length > 0) {
        this.serviceCategory.ImageFile = img;
        this.concatenateImagePath();
        this.serviceForm.form.markAsDirty();
      }
    });
  }

  concatenateImagePath() {
    this.imagePath = "";
    if (this.serviceCategory.ImageFile && this.serviceCategory.ImageFile != "") {
      this.imagePath = "data:image/jpeg;base64," + this.serviceCategory.ImageFile;
      this.isImageExists = true;
    }
    else if (this.serviceCategory.ImagePath && this.serviceCategory.ImagePath != "") {
      this.imagePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setOtherImagePath()) + this.serviceCategory.ImagePath;
      this.isImageExists = true;
    }
    else {
      this.isImageExists = false;
    }
  }

  discardImage() {
    this._commonService.deleteFile(ENU_Permission_Setup.ServiceCategory_Save, this.serviceCategory.ServiceCategoryID, this.serviceCategory.ImagePath)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {          
          this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Image"));
          this.serviceCategory.ImageFile = "";
          this.serviceCategory.ImagePath = "";
          this.serviceForm.form.markAsDirty();
          this.concatenateImagePath();
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