/********************** Angular references *********************/
import { Component, Inject, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

/***************** START: Service & Models *********************/
/*Services*/
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';

/*Models*/
import { Messages } from 'src/app/helper/config/app.messages';
import { environment } from 'src/environments/environment';
import { MembershipCategoryApi } from 'src/app/helper/config/app.webapi';
import { ImageEditorPopupComponent } from 'src/app/application-dialog-module/image-editor/image.editor.popup.component';
import { ENU_Permission_Setup } from 'src/app/helper/config/app.module.page.enums';
import { ApiResponse } from 'src/app/models/common.model';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { CommonService } from 'src/app/services/common.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { MembershipCategory } from 'src/app/setup/models/membership.category.model';

/********************** START: Common *********************/

@Component({
  selector: 'app-membership-category-save',
  templateUrl: './membership.category.save.component.html'
})
export class MembershipCategorySaveComponent implements OnInit {

 // #region Local Members

 @ViewChild('membershipCategoryForm') membershipCategoryForm: NgForm;

 @Output()
  membershipCategorySaved = new EventEmitter<boolean>();

 /* Messages */
 hasSuccess: boolean = false;
 hasError: boolean = false;
 messages = Messages;
 errorMessage: string;
 successMessage: string;
 pageTitle: string = "Membership Category";

 /* Local Members*/
 isImageExists: boolean;
 imagePath: string = "";

 /* Configurations */
 serverImageAddress = environment.imageUrl;

 // #endregion

 constructor(
   private _httpService: HttpService,
   private _messageService: MessageService,
   private _dialog: MatDialogService,
   public dialogRef: MatDialogRef<MembershipCategorySaveComponent>,
   private _commonService: CommonService,
   @Inject(MAT_DIALOG_DATA) public membershipCategory: MembershipCategory
 ) { }

 ngOnInit() {
   this.concatenateImagePath();
   this.membershipCategory;
   if (this.membershipCategory.MembershipCategoryID > 0) {
   }
   else {
     this.membershipCategory = new MembershipCategory();
   }
 }

 // #region Events

 // onImageUrlChange(url: string) {
 //   if (url && url.length > 0) {
 //     this.productCategory.ImageFile = url;
 //     this.membershipCategoryForm.form.markAsDirty();
 //   }
 // }

 onClosePopup(): void {
   this.dialogRef.close();
 }

 onCategoryNameUpdated() {
   this.membershipCategory.CategoryName = this.membershipCategory.CategoryName.trim();
 }

 onDeleteImage() {
   const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
   deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
     if (isConfirmDelete) {
       this.discardImage();
     }
   })
 }

 // #endregion

 // #region Methods

 saveMembershipCategory(isvalid: boolean) {
   if (isvalid && (this.membershipCategoryForm.dirty || this.membershipCategory.ImageFile !== null)) {
     this.hasSuccess = false;
     this.hasError = false;
     this.setImageFilePath();
     this._httpService.save(MembershipCategoryApi.save, this.membershipCategory)
       .subscribe((res: any) => {
         if (res && res.MessageCode > 0) {
           this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Membership Category"));
           this.membershipCategorySaved.emit(true);
           this.onClosePopup();
         }
         else if (res && res.MessageCode < 0) {
           this._messageService.showErrorMessage(res.MessageText);
         }
         else {
           this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Membership Category"));
         }
       },
         err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Membership Category")); }
       );
   }
 }

 setImageFilePath() {
   if (this.membershipCategory.ImageFile == "") {
     this.membershipCategory.ImagePath = this.membershipCategory.ImagePath;
   }
 }

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
       this.membershipCategory.ImageFile = img;
       this.concatenateImagePath();
       this.membershipCategoryForm.form.markAsDirty();
     }
   });
 }

 concatenateImagePath() {
   this.imagePath = "";
   if (this.membershipCategory.ImageFile && this.membershipCategory.ImageFile != "") {
     this.imagePath = "data:image/jpeg;base64," + this.membershipCategory.ImageFile;
     this.isImageExists = true;
   }
   else if (this.membershipCategory.ImagePath && this.membershipCategory.ImagePath != "") {
     this.imagePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setOtherImagePath()) + this.membershipCategory.ImagePath;
     this.isImageExists = true;
   }
   else {
     this.isImageExists = false;
   }
 }

 discardImage() {
   this._commonService.deleteFile(ENU_Permission_Setup.MembershipCategory_Save, this.membershipCategory.MembershipCategoryID, this.membershipCategory.ImagePath)
     .subscribe((response: ApiResponse) => {
       if (response && response.MessageCode > 0) {
         this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Image"));
         this.membershipCategory.ImageFile = "";
         this.membershipCategory.ImagePath = "";
         this.membershipCategoryForm.form.markAsDirty();
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
