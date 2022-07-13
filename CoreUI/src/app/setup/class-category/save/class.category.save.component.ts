/********************** Angular references *********************/
import { Component, Inject, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

/***************** START: Service & Models *********************/
/*Services*/
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';

/*Models*/
import { ClassCategory } from '@setup/models/class.category.model';
import { ClassCategoryApi } from '@app/helper/config/app.webapi';
import { ImageEditorPopupComponent } from '@app/application-dialog-module/image-editor/image.editor.popup.component';
import { ApiResponse } from '@app/models/common.model';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
/********************** Configurations *********************/
import { AppUtilities } from '@app/helper/aap.utilities';
import { ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { environment } from '@env/environment';
import { Messages } from '@app/helper/config/app.messages';

/********************** START: Common *********************/
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { CommonService } from '@app/services/common.service';


@Component({
  selector: 'class-category-save',
  templateUrl: './class.category.save.component.html'
})
export class ClassCategorySaveComponent implements OnInit {

  /**material references */
  @ViewChild('classCategoryForm') classCategoryForm: NgForm;

  @Output()
  classCategorySaved = new EventEmitter<any>();

  /** Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;

  /**Local variables*/
  isImageExists: boolean;
  imagePath: string = "";

  /**Configurations */
  serverImageAddress = environment.imageUrl;

  // #endregion

  constructor(
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dialog: MatDialogService,
    public dialogRef: MatDialogRef<ClassCategorySaveComponent>,
    private _commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public classCategory: ClassCategory
  ) { }

  //#region angular hooks
  ngOnInit() {
    this.concatenateImagePath();
  }

  //#endregion

  // #region Events

  /**close popup */
  onClosePopup(): void {
    this.dialogRef.close();
  }

  /**trim updated class category name*/
  onCategoryNameUpdated() {
    this.classCategory.ClassCategoryName = this.classCategory.ClassCategoryName.trim();
  }

  // #endregion

  // #region Methods

  /**save class category and after saved class close popup and set image path */
  saveClassCategory(isvalid: boolean) {
    if (isvalid && (this.classCategoryForm.dirty || this.classCategory.ImageFile !== null)) {
      this.hasSuccess = false;
      this.hasError = false;
      this.setImageFilePath();
      this._httpService.save(ClassCategoryApi.save, this.classCategory)
        .subscribe((res: any) => {
          if (res && res.MessageCode > 0) {
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Class category"));
            this.classCategorySaved.emit(true);
            this.onClosePopup();
          }
          else if (res && res.MessageCode < 0) {
            this._messageService.showErrorMessage(res.MessageText);
          }
          else {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Class category"));
          }
        },
          err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Class category")); }
        );
    }
  }

  // #endregion

  //#region image

  /**set image file path */
  setImageFilePath() {
    if (this.classCategory.ImageFile == "") {
      this.classCategory.ImagePath = this.classCategory.ImagePath;
    }
  }

  /**crop image , set hiegt and width and concate image path */
  showImageCropperDialog() {
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
        this.classCategory.ImageFile = img;
        this.concatenateImagePath();
        this.classCategoryForm.form.markAsDirty();
      }
    });
  }

  /**concate image path with server url */
  concatenateImagePath() {
    this.imagePath = "";
    if (this.classCategory.ImageFile && this.classCategory.ImageFile != "") {
      this.imagePath = "data:image/jpeg;base64," + this.classCategory.ImageFile;
      this.isImageExists = true;
    }
    else if (this.classCategory.ImagePath && this.classCategory.ImagePath != "") {
      this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + this.classCategory.ImagePath;
      this.isImageExists = true;
    }
    else {
      this.isImageExists = false;
    }
  }

  /**discard image  */
  discardImage() {
    this._commonService.deleteFile(ENU_Permission_Setup.ClassCategory_Save, this.classCategory.ClassCategoryID, this.classCategory.ImagePath)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Image"));
          this.classCategory.ImageFile = "";
          this.classCategory.ImagePath = "";
          this.classCategoryForm.form.markAsDirty();
          this.concatenateImagePath();
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image"));
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image")); }
      );
  }

  /**return boolean if user want to delete or not image */
  onDeleteImage() {
    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this.discardImage();
      }
    })
  }
  // #endregion

}
