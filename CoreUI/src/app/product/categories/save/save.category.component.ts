import { Component, OnInit, Inject, ViewChild, Output, EventEmitter } from '@angular/core';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { ImageEditorPopupComponent } from 'src/app/application-dialog-module/image-editor/image.editor.popup.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { NgForm } from '@angular/forms';
import { Messages } from 'src/app/helper/config/app.messages';
import { SearchCategory, ProductCategory } from 'src/app/product/models/categories.model';
import { InventoryProductCategoryApi } from 'src/app/helper/config/app.webapi';
import { environment } from 'src/environments/environment';
import { ENU_Permission_Product } from 'src/app/helper/config/app.module.page.enums';
import { EnumSaleSourceType } from 'src/app/helper/config/app.enums';

@Component({
  selector: 'app-save-product-category',
  templateUrl: './save.category.component.html'
})
export class SaveCategoryComponent implements OnInit {
  /*********** region Local Members ****/
  @ViewChild("categoryInformationForm") categoryInformationForm: NgForm;
  @Output()
  isSaved = new EventEmitter<boolean>();
  serverImageAddress = environment.imageUrl;
  /** Model & Collection */
  messages = Messages;
  productCategory: ProductCategory = new ProductCategory();
  searchCategory: SearchCategory = new SearchCategory();
  enum_AppSourceType = EnumSaleSourceType;
  /***Local Variables */
  inValidProductCategoryName: boolean;
  imagePath: string;
  isImageExist: boolean;
  isDisabledSaveButton: boolean = false;
  constructor(
    private _dialog: MatDialogRef<SaveCategoryComponent>,
    private _matDialog: MatDialogService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public productCategoryID: any
  ) { }

  ngOnInit(): void {
    if (this.productCategoryID > 0 && this.productCategoryID != null) {
      this.productCategory.ProductCategoryID = this.productCategoryID;
      this.getCategoryID();
    } else {
      this.productCategory.IsActive = true;
      this.productCategory.ProductCategoryID = 0;
    }
  }
  setObjectValue(data: any) {
    this.productCategory
  }
  // show the validation msg
  showValidation(event) {
    event = event.trim();
    if (event == "") {
      this.inValidProductCategoryName = true;
    } else {
      this.inValidProductCategoryName = false;
    }
  }

  // save api for categories
  onSave() {
    if (this.categoryInformationForm.invalid) {
      this.inValidProductCategoryName = true;
      return;
    }
    this.isDisabledSaveButton = true;
    let param = JSON.parse(JSON.stringify(this.productCategory))
    this._httpService.save(InventoryProductCategoryApi.save, param).subscribe((respose) => {
      if (respose.MessageCode > 0) {
        this.isSaved.emit(true);
        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Category"));
        this.onCloseDialog();
      }else if(respose.MessageCode < 0){
        this._messageService.showErrorMessage(respose.MessageText);
        this.isDisabledSaveButton = false;
      }
      else {
        this.isDisabledSaveButton = false;
        this._messageService.showSuccessMessage(this.messages.Error.Save_Error.replace("{0}", "Category"));
      }
    }, error => {
      this.isDisabledSaveButton = false;
      this._messageService.showSuccessMessage(this.messages.Error.Save_Error.replace("{0}", "Category"));
    });
  }

  // get product by id for edit
  getCategoryID() {
    let param = InventoryProductCategoryApi.getByID + this.productCategory.ProductCategoryID
    this._httpService.get(param).subscribe((response) => {
      if (response.MessageCode > 0) {
        this.productCategory = response.Result;
        this.concatenateImagePath();
      }
      else if(response.MessageCode < 0){
        this._messageService.showErrorMessage(response.MessageText);
        this.onCloseDialog();
      }
       else {
        this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Category"));
      }
    });
  }


  // close popup
  onCloseDialog() {
    this._dialog.close();
  }


  //#region Image crop , set and delete region
  showImageCropperDialog() {
    const dialogInst = this._matDialog.open(ImageEditorPopupComponent, {
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
        this.productCategory.ImageFile = img;
        this.categoryInformationForm.form.controls.productCategoryName.markAsDirty();
        this.concatenateImagePath();
        //this.productForm.form.markAsDirty();
      }
    });
  }

  concatenateImagePath() {
    this.imagePath = "";
    if (this.productCategory.ImageFile && this.productCategory.ImageFile != "") {
      this.imagePath = "data:image/jpeg;base64," + this.productCategory.ImageFile;
      this.isImageExist = true;
    }
    else if (this.productCategory.ImagePath != undefined && this.productCategory.ImagePath != "") {
      /**  On Rizwan Ahmed request branch id Url removed 25-07-2022 */
        this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePathForCompanyOnly()) + this.productCategory.ImagePath;
      this.isImageExist = true;
    }
    else {
      this.isImageExist = false;
    }
  }

  onDeleteImage() {
    const deleteDialogRef = this._matDialog.open(DeleteConfirmationComponent, { disableClose: true, data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_Undone } });
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this.discardImage();
      }
    })
  }

  discardImage() {
    let param = {
      modulePageID: ENU_Permission_Product.Category_Delete,
      entityID: this.productCategory.ProductCategoryID,
      fileName: this.productCategory.ImagePath
    }
    this._httpService.delete(InventoryProductCategoryApi.deleteImage, param).subscribe((response) => {
      if (response && response.MessageCode > 0) {
        this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Image"));
        this.productCategory.ImageFile = "";
        this.productCategory.ImagePath = "";
        this.concatenateImagePath();
        this.onCloseDialog();
      } else {
        this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image"));
      }
    }, error => {
      this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image"));
    });
  }
  onlyAlphabets(event) {
    var regex = /^[a-zA-Z]*$/;
    if (regex.test(event.target.value)) {

    } else {
      return
    }
  }
  //#endregion
}
