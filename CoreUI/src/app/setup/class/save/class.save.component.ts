/********************* Angular References ********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";

/********************* Services & Models ********************/
import { HttpService } from '@services/app.http.service';

import { ParentClass } from '@setup/models/parent.class.model';
import { ClassApi } from '@app/helper/config/app.webapi';
import { Configurations } from '@app/helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { MessageService } from '@app/services/app.message.service';
import { environment } from '@env/environment';
import { AppUtilities } from '@app/helper/aap.utilities';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { ImageEditorPopupComponent } from '@app/application-dialog-module/image-editor/image.editor.popup.component';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { ApiResponse } from '@app/models/common.model';
import { ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { CommonService } from '@app/services/common.service';
import { MatOption } from '@angular/material/core';
import { ENU_Package } from '@app/helper/config/app.enums';
import { SubscriptionLike } from 'rxjs';
import { DataSharingService } from '@app/services/data.sharing.service';

/********************** Common & Custom *********************/


@Component({
    selector: 'class-save',
    templateUrl: './class.save.component.html'
})
export class ClassSaveComponent implements OnInit {

    @ViewChild("parentClassFormData") parentClassFormData: NgForm;
    @ViewChild('allSelectedTax') private allSelectedTax: MatOption;
    @ViewChild('allRestrictionSelection') private allRestrictionSelection: MatOption;

    packageIdSubscription: SubscriptionLike;

    /**Messages */
    serverImageAddress = environment.imageUrl;

    /**Local Variables */
    isImageExist: boolean = false;
    imagePath: string = "";
    isSave: boolean = false;
    isEdite: boolean = false;
    isDeleted: boolean = false;
    isPurchaseRestrictionAllowed :boolean = false;
    //totalAmountLimit: number = 9999999;

    /**Collection, Model & Variables */
    messages = Messages;
    parentClassObj = new ParentClass();
    parentClassObjCopy: any = {};
    classCategoryList: any[] = [];
    classLevelList: any[] = [];
    DurationTypeList: any[] = [];
    selectedRestrictedList: any[] = [];

    allowedNumberKeysForClassBooking = Configurations.AllowedNumberKeysForClassBooking;
    restrictedList = Configurations.RestrictList;
    subscribParentID: any;
    // ErrorMessage: string;
    // showErrorMessage: boolean = false;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dialog: MatDialogService,
        private _commonService: CommonService,
        private _dataSharingService: DataSharingService,
    ) {

    }

    //#region Angular hooks
    ngOnInit() {
        this.getFundamental();
        this.subscribParentID = this._route.params.subscribe(params => {
            this.parentClassObj.ParentClassID = params['ClassID'];
        });
        if (this.parentClassObj.ParentClassID > 0) {
            this.getParentClassByID();
        }

        // Subscribe package ID
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
          (packageId: number) => {
            if (packageId && packageId > 0) {
              this.setPackageBasedPermissions(packageId);
            }
          }
        );
    }

    gOnDestroy() {
      this.packageIdSubscription?.unsubscribe();
    }

    //#endregion

    //#endregion methods
    getFundamental() {
        this._httpService.get(ClassApi.getFundamental).subscribe(data => {
            if(data && data.MessageCode > 0){
            this.classCategoryList = data.Result.ListClassCategory;
            this.classLevelList = data.Result.ListClassLevel;
            this.DurationTypeList = data.Result.DurationTypeList;
            }else{
                this._messageService.showErrorMessage(data.MessageText)
            }
        });
        setTimeout(() => {    //<<<---    using ()=> syntax
            this.setDefaultValues();
        }, 1000);

    }

    setPackageBasedPermissions(packageID: number){
      this.isPurchaseRestrictionAllowed =  packageID == ENU_Package.Full ? true : false;
    }
    /**Get parent classe by id and copy class object , set object values , set default values*/
    getParentClassByID() {
        this._httpService.get(ClassApi.getParentClassById + this.parentClassObj.ParentClassID).subscribe(data => {
            if (data && data.MessageCode > 0) {
                this.parentClassObj = data.Result;
                this.setVariableValues();
                this.parentClassObjCopy = Object.assign({}, this.parentClassObj);
                this.concatenateImagePath();
                this.setDefaultValues();
                this.setPurchaseRestriction();
                this.isEdite = true;
            }
            else if (data && data.MessageCode < 0) {
                this._messageService.showErrorMessage(data.MessageText);
            }

        });
    }

    /**set selected Purchase Restriction ids*/
    setPurchaseRestriction(){

      var i;
      this.selectedRestrictedList = [];
      var array = this.parentClassObj.RestrictedCustomerTypeID.split(',');

      for (i = 0; i < array.length; ++i) {
          var result = this.restrictedList.find(m => m.value == Number(array[i]));
          if(result){
            this.selectedRestrictedList.push(result)
          }
      }

      // check if all selected set All true
      if(this.restrictedList && this.selectedRestrictedList && this.restrictedList.length ==  this.selectedRestrictedList.length){
        setTimeout(() => {
          this.allRestrictionSelection.select();
        }, 100);
      }

    }


    /**set object values*/
    setVariableValues() {
        this.parentClassObj.BookingStartsBefore = this.parentClassObj.BookingStartsBefore == 0 ? null : this.parentClassObj.BookingStartsBefore;
        this.parentClassObj.BookingClosesBefore = this.parentClassObj.BookingClosesBefore == 0 ? null : this.parentClassObj.BookingClosesBefore;
        this.parentClassObj.CancellationEndsBefore = this.parentClassObj.CancellationEndsBefore == 0 ? null : this.parentClassObj.CancellationEndsBefore;
        this.parentClassObj.BookingStartsBeforeDurationTypeID = this.parentClassObj.BookingStartsBeforeDurationTypeID == 0 ? 0 : this.parentClassObj.BookingStartsBeforeDurationTypeID;
        this.parentClassObj.BookingClosesBeforeDurationTypeID = this.parentClassObj.BookingClosesBeforeDurationTypeID == 0 ? 0 : this.parentClassObj.BookingClosesBeforeDurationTypeID;
        this.parentClassObj.CancellationEndsBeforeDurationTypeID = this.parentClassObj.CancellationEndsBeforeDurationTypeID == 0 ? 0 : this.parentClassObj.CancellationEndsBeforeDurationTypeID;
        this.parentClassObj.ClassDurationInMinutes = this.parentClassObj.ClassDurationInMinutes == 0 ? null : this.parentClassObj.ClassDurationInMinutes;
    }

    /**assigne default values to object*/
    setDefaultValues() {
        this.parentClassObj.ClassCategoryID = this.parentClassObj.ClassCategoryID;
        this.parentClassObj.ClassLevelID = this.parentClassObj.ClassLevelID == 0 ? null : this.parentClassObj.ClassLevelID;
        this.parentClassObj.BookingClosesBeforeDurationTypeID == 0 ? 0 : this.parentClassObj.BookingClosesBeforeDurationTypeID;
        this.parentClassObj.BookingStartsBeforeDurationTypeID == 0 ? 0 : this.parentClassObj.BookingStartsBeforeDurationTypeID;
        this.parentClassObj.CancellationEndsBeforeDurationTypeID == 0 ? 0 : this.parentClassObj.CancellationEndsBeforeDurationTypeID;
    }

    /**Save Parent Class , check validations , call Assigne_Object_Values_To_Params method , after saved navigate to search class screen*/
    saveParentClass(isvalid: boolean) {
        if (!this.isSave) {
            //if (!this._commonService.validateTotalAmount(this.parentClassObj.ClassDurationInMinutes, this.totalAmountLimit)) {
                if (isvalid) {
                    if ((this.isvalidBooking() && this.parentClassObj.ParentClassName != "" || null) && this.parentClassObj.ClassCategoryID > 0) {
                        this.isSave = true;

                        this.parentClassObj.RestrictedCustomerTypeID = this.listToCommaSeparatedString(this.selectedRestrictedList);
                        let param = this.AssigneObjectValuesToParams();
                        this._httpService.save(ClassApi.saveParentClass, param).subscribe(data => {
                            if (data && data.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Class"));
                                this._router.navigate(["setup/class"]);
                                this.isSave = true;
                            }
                            else if (data && data.MessageCode < 0) {
                                this._messageService.showErrorMessage(data.MessageText);
                                this.isSave = false;
                            }

                        });
                        //this.showErrorMessage = false;
                    }
                }
            // } else {
            //     this.showErrorMessage = true;
            //     this.ErrorMessage = Messages.Validation.Please_Enter_Value_Upto_seven_Digits_Only;
            // }
        }
    }

    /** check booking validations */
    isvalidBooking() {
        let _isValid = true;
        if (this.parentClassObj.BookingStartsBefore != null && this.parentClassObj.BookingStartsBeforeDurationTypeID == 0) {
            return false;
        }
        if (this.parentClassObj.BookingClosesBefore != null && this.parentClassObj.BookingClosesBeforeDurationTypeID == 0 && _isValid) {
            return false;
        }
        if (this.parentClassObj.CancellationEndsBefore != null && this.parentClassObj.CancellationEndsBeforeDurationTypeID == 0 && _isValid) {
            return false;
        }
        return _isValid;
    }

    /** Assigne Object Values To Params , this fuction called in class save function*/
    AssigneObjectValuesToParams() {
        let params = {
            parentClassID: this.parentClassObj.ParentClassID,
            parentClassName: this.parentClassObj.ParentClassName,
            classCategoryID: this.parentClassObj.ClassCategoryID,
            classLevelID: this.parentClassObj.ClassLevelID,
            description: this.parentClassObj.Description,
            howToPrepare: this.parentClassObj.HowToPrepare,
            bookingStartsBefore: this.parentClassObj.BookingStartsBefore,
            bookingStartsBeforeDurationTypeID: this.parentClassObj.BookingStartsBeforeDurationTypeID,
            bookingClosesBefore: this.parentClassObj.BookingClosesBefore,
            bookingClosesBeforeDurationTypeID: this.parentClassObj.BookingClosesBeforeDurationTypeID,
            cancellationEndsBefore: this.parentClassObj.CancellationEndsBefore,
            CancellationEndsBeforeDurationTypeID: this.parentClassObj.CancellationEndsBeforeDurationTypeID,
            classDurationInMinutes: this.parentClassObj.ClassDurationInMinutes,
            imagePath: this.parentClassObj.ImageFile,
            isActive: this.parentClassObj.IsActive,
            restrictedCustomerTypeID: this.parentClassObj.RestrictedCustomerTypeID,
        }
        return params;
    }

    /**reset class object */
    resetParentClass() {
        if (this.parentClassObj.ParentClassID > 0) {
            this.parentClassObj = this.parentClassObjCopy;
            this.parentClassObj = Object.assign({}, this.parentClassObj);
            if (this.isDeleted) {
                this.parentClassObj.ImagePath = "";
            }
        } else {
            this.parentClassFormData.reset();
            setTimeout(() => {
                this.parentClassObj = new ParentClass();
            });
        }
        this.concatenateImagePath();
        this.setDefaultValues();
    }

    /**allow numeric keys for booking and prevents others*/
    preventCharactersForClassBooking(event: any) {
        //console.log(this.parentClassObj.ClassDurationInMinutes.toString())
        let index = this.allowedNumberKeysForClassBooking.findIndex(k => k == event.key);
        if (index < 0) {
            event.preventDefault()
        }
        //this.showErrorMessage = false;
    }

    //#region

    listToCommaSeparatedString(arr: any) {
      var i;
      var result: string = "";
      for (i = 0; i < arr.length; ++i) {
        if(arr[i].value !== undefined) {
          result = result + arr[i].value + ((arr.length - 1) == i ? "" : ",");
        }
      }

      return result;
    }

    //#endregion booking class

    /**set booking start values */
    onBookingStartValueChange(value) {
        if (!value) {
            this.parentClassObj.BookingStartsBeforeDurationTypeID = 0;
            this.parentClassObj.BookingStartsBefore = null;
        }
    }

    /**set booking close values */
    onBookCloseBeforeValueChange(value) {
        if (!value) {
            this.parentClassObj.BookingClosesBeforeDurationTypeID = 0;
            this.parentClassObj.BookingClosesBefore = null;
        }
    }

    /**set booking cancelation before duration values */
    onCancellationEndBeforeValueChange(value) {
        if (!value) {
            this.parentClassObj.CancellationEndsBeforeDurationTypeID = 0;
            this.parentClassObj.CancellationEndsBefore = null;
        }
    }

    toggleAllRestrictionSelection() {
        this.selectedRestrictedList = [];

        if (this.allRestrictionSelection.selected) {
          this.restrictedList.forEach(service => {
            this.selectedRestrictedList.push(service);
          });

          setTimeout(() => {
            this.allRestrictionSelection.select();
          }, 100);
        }
      }

      togglePerOneRestriction(all) {
        if (this.allRestrictionSelection && this.allRestrictionSelection.selected) {
          this.allRestrictionSelection.deselect();
        }
        if (this.restrictedList.length == this.selectedRestrictedList.length && this.restrictedList.length > 1) {
          this.allRestrictionSelection.select();
        }
      }


    /**check class is scheduled and booked , if not then u can deactive class */
    isClassScheduledAndBooked() {
        if (this.isEdite && !this.parentClassObj.IsActive) {
            this._messageService.showSuccessMessage(this.messages.Success.Deactive_Class);
        }
    }
    //#region



    //#region Set image

    /**concate image path with server address */
    concatenateImagePath() {
        this.imagePath = "";
        if (
            this.parentClassObj.ImageFile &&
            this.parentClassObj.ImageFile != ""
        ) {
            this.imagePath =
                "data:image/jpeg;base64," + this.parentClassObj.ImageFile;
            this.isImageExist = true;
        } else if (
            this.parentClassObj.ImagePath != undefined &&
            this.parentClassObj.ImagePath != ""
        ) {
            this.imagePath =
                this.serverImageAddress.replace(
                    "{ImagePath}",
                    AppUtilities.setOtherImagePath()
                ) + this.parentClassObj.ImagePath;
            this.isImageExist = true;
        } else {
            this.isImageExist = false;
        }
    }

    /**set image path */
    setImageFilePath() {
        if (this.parentClassObj.ImageFile == null) {
            this.parentClassObj.ImageFile = this.parentClassObj.ImagePath;
        }
    }

    /**set image width , hieght and concat image path, check form validation */
    showImageCropperDialog() {
        const dialogInst = this._dialog.open(ImageEditorPopupComponent, {
            disableClose: true,
            data: {
                height: 460,
                width: 720,
                aspectRatio: 36 / 23,
                showWebCam: true,
            },
        });

        dialogInst.componentInstance.croppedImage.subscribe((img: string) => {
            if (img && img.length > 0) {
                this.parentClassObj.ImageFile = img;
                this.concatenateImagePath();
                this.parentClassFormData.form.markAsDirty();
            }
        });
    }

    /**delete image */
    onDeleteImage() {
        const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, {
            disableClose: true,
            data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}
        });
        deleteDialogRef.componentInstance.confirmDelete.subscribe(
            (isConfirmDelete: boolean) => {
                if (isConfirmDelete) {
                    this.discardImage();
                }
            }
        );
    }

    /**dicard image and set null value to image path and image file */
    discardImage() {
        this._commonService
            .deleteFile(
                ENU_Permission_Setup.Class_Save,
                this.parentClassObj.ParentClassID,
                this.parentClassObj.ImagePath
            )
            .subscribe(
                (response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this._messageService.showSuccessMessage(
                            this.messages.Success.Delete_Success.replace("{0}", "Image")
                        );
                        this.parentClassObj.ImageFile = "";
                        this.parentClassObj.ImagePath = "";
                        this.parentClassFormData.form.markAsDirty();
                        this.isDeleted = true;
                        this.concatenateImagePath();
                    } else {
                        this._messageService.showErrorMessage(
                            this.messages.Error.Delete_Error.replace("{0}", "Image")
                        );
                    }
                },
                (err) => {
                    this._messageService.showErrorMessage(
                        this.messages.Error.Delete_Error.replace("{0}", "Image")
                    );
                }
            );
    }
    //#endregion
}
