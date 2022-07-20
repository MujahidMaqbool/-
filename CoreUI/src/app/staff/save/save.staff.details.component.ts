import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from "@angular/forms";
import { SubscriptionLike as ISubscription } from 'rxjs';
import { Router } from '@angular/router';
/********************* Material Reference ********************/
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
/*************************** Services & Models *************************/
/* Models*/
import { Staff, StaffInfo, ServiceCategoryWithServiceList, StaffService } from 'src/app/staff/models/staff.model';
import { ModuleList } from 'src/app/setup/models/roles.model';
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { MessageService } from 'src/app/services/app.message.service';
import { SessionService } from 'src/app/helper/app.session.service';
import { CommonService } from 'src/app/services/common.service';

/********************** Components *********************/
import { BranchAssociationComponent } from '../branch-association/branch.association.component';
import { UnArchivedStaffComponent } from '../archived-staff/staff.unarchive.component';
import { RoleViewComponent } from 'src/app/setup/role/role-view/role-view.component';
import { CanProvideServicePopup } from '../canprovide-serivce-popup/canprovide.serivce.popup';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { ImageEditorPopupComponent } from 'src/app/application-dialog-module/image-editor/image.editor.popup.component';
import { EditEmailComponent } from '../edit-email/edit.email.component';

/*************************** Common & Customs *************************/
import { Configurations } from 'src/app/helper/config/app.config';
import { environment } from 'src/environments/environment';
import { Messages } from 'src/app/helper/config/app.messages';
import { DoorAccessApi, StaffApi } from "src/app/helper/config/app.webapi";
import { ENU_Package } from 'src/app/helper/config/app.enums';
import { ENU_Permission_Staff } from 'src/app/helper/config/app.module.page.enums';
import { GenericAlertDialogComponent } from 'src/app/application-dialog-module/generic-alert-dialog/generic.alert.dialog.component';
import { variables } from 'src/app/helper/config/app.variable';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { TrimPipe } from 'src/app/shared/pipes/trim';



@Component({
    selector: 'save-staff-details',
    templateUrl: './save.staff.details.component.html'
})

export class SaveStaffDetailsComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    // #region Local Members

    /* Form Refrences*/
    @ViewChild('StaffFormData') staffForm: NgForm;

    /* Local Members*/
    currentBranchId: number;
    staffID: number = 0;
    staffServiceCount: number = 0;
    loggedInStaffId: number;

    staffCopy: any;
    isImageExist: boolean;
    imagePath: string;
    defaultBranchCountry: string;
    hasServices: boolean = false;
    isSuperAdminLoggedIn: boolean;
    isRoleRequired: boolean;
    showServicesCheck: boolean;
    showClassesCheck: boolean;
    hascurrencyFormated: boolean = false;
    currencyFormat: string;

    /* Messages */
    messages = Messages;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    successMessage: string;
    errorMessage: string;
    maxDate: Date = new Date();

    /* Collection Types*/
    serviceCategoryList: ServiceCategoryWithServiceList[] = [];

    positionList: any;
    countryList: any[];
    stateList: any[];
    stateListByCountryId: any[];
    roleList: ModuleList[] = [];
    genderList: string[];
    titleList: string[];

    serverImageAddress = environment.imageUrl;

    /* Model Refences */
    // staff: Staff ;
    staff = new Staff();

    staffInfo: StaffInfo = new StaffInfo();
    staffServiceModel: StaffService = new StaffService();

    loggedInStaffIDSubscription: ISubscription;
    staffIDSubscription: ISubscription;
    packageIdSubscription: ISubscription;

    dateFormatForSave = Configurations.DateFormatForSave;
    package = ENU_Package;
    // #endregion

    constructor(
        private _staffService: HttpService,
        public _dataSharingService: DataSharingService,
        private _messageService: MessageService,
        private _commonService: CommonService,
        private _router: Router,
        private _trimString: TrimPipe,
        private _dateTimeService: DateTimeService,
        public _dialog: MatDialogService
    ) {super(); }

    ngOnInit() {
      this.getCurrentBranchDetail();
    //   setTimeout(() => {
    //     this.resetForm();
    // }, 500);
        this.currentBranchId = SessionService.getBranchID();
        this.getFundamentals();

        this._dataSharingService.shareStaffImage("");

        this.staffIDSubscription = this._dataSharingService.staffID.subscribe(staffId => {
            this.staffID = staffId;
            this.getAllServices();

            if (this.staffID && this.staffID > 0) {
                this.getStaffById(this.staffID);
                // this.hascurrencyFormated = true;
            }
            // else {
            //     this.staff = new Staff();
            //         this.staff.Mobile = null;
            //         this.staff.Phone = null
            //     // this.hascurrencyFormated = true;
            // }
        });

        this.loggedInStaffIDSubscription = this._dataSharingService.loggedInStaffID.subscribe((staffId: number) => {
            this.loggedInStaffId = staffId;
        });

        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.checkPackagePermissions(packageId);
            }
        })

        //implementation change after discuss with tahir bhai show branch current date not browser date implementaed by fahad dated on 03-03-2021

    }

    //get current branch time format
    async getCurrentBranchDetail() {
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("ISOCode")) {
          this.defaultBranchCountry = branch.ISOCode.toLowerCase();
          this.staff.Mobile = null;
          this.staff.Phone = null
        }
      }

    ngOnDestroy() {
        this.staffIDSubscription.unsubscribe();
        this.loggedInStaffIDSubscription.unsubscribe();
        this.packageIdSubscription.unsubscribe();
    }

    // #region  Events

    onViewRole() {
        this.getRoleDetailById();
    }

    onSaveStaff(isValid: boolean) {
        this.saveStaff(isValid);
    }

    // onCountryChange(countryId: number) {
    //     this.getStatesByCountryId(countryId);
    //     if (this.stateListByCountryId && this.stateListByCountryId.length > 0) {
    //         /* If No StateCountyID is set, then set First StateCounty from StateCounty list*/
    //         this.staff.StateCountyID = (this.staff.StateCountyID && this.staff.StateCountyID > 0) ? this.staff.StateCountyID : this.stateListByCountryId[0].StateCountyID;
    //     }
    // }

    onShowImageCropperDialog() {
        if (!this.staff.IsSuperAdmin || this.isSuperAdminLoggedIn) {
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
                    this.staff.ImageFile = img;
                    this.setStaffImage();
                    this.staffForm.form.markAsDirty();
                }
            });
        }
    }

    onEmailUpdated() {
        if (this.staff.Email && this.staff.Email !== '') {
            this.verifyStaff();
        }
        // else {
        //     this.resetForm();
        // }
    }

    onProvideSerivceClick() {
        this.showProvideServiceDialog();
    }

    onBirthDateChange(date: any) {
        setTimeout(() => {
            this.staff.BirthDate = date;
            this.staffForm.form.markAsDirty();
        });
    }

    onShowSchedulerChange() {
        if (!this.staff.Permission.ShowOnScheduler) {
            this.staff.Permission.CanDoClass = this.staff.Permission.CanDoClass ? true : false;
            this.staff.Permission.CanDoService = this.staff.Permission.CanDoService ? true : false;
            this.staff.Permission.CanDoServiceOnline = this.staff.Permission.CanDoServiceOnline ? true : false;
        }
    }

    onDeleteImage() {
        const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this.discardImage();
            }
        })
    }

    onUpdateNFCAccess(){
        if(this.staff.CardAccessID && this.staff.CardAccessID != null){
          this.verifyNFCAccess();
        }
    }




    // #endregion

    // #region Methods

    verifyNFCAccess(){
        let params = {
          UserID: this.staff.StaffID,
          cardNumber: this.staff.CardAccessID,
          IsStaff: true
        };
        this._staffService
          .get(
            DoorAccessApi.checkIfCardNumberExist, params).subscribe((response: ApiResponse) => {
            if (response.Result) {
              const dialogRef = this._dialog.open(GenericAlertDialogComponent, {
                disableClose: true,
              });
              dialogRef.componentInstance.Message = this.messages.Error.Duplicate_NFC_Access;
              this.staff.CardAccessID = null;
            }
          });
      }

    checkPackagePermissions(packageId: number) {
        //this.isRoleRequired = (packageId !== this.package.FitnessBasic && packageId !== this.package.WellnessBasic);
        switch (packageId) {
            case this.package.WellnessBasic:
                this.isRoleRequired = false;
                this.showServicesCheck = true;
                this.showClassesCheck = false;
                break;
            case this.package.WellnessMedium:
                this.isRoleRequired = true;
                this.showServicesCheck = true;
                this.showClassesCheck = false;
                break;
            case this.package.WellnessTop:
                this.isRoleRequired = true;
                this.showServicesCheck = true;
                this.showClassesCheck = false;
                break;
            case this.package.FitnessBasic:
                this.isRoleRequired = false;
                this.showServicesCheck = false;
                this.showClassesCheck = true;
                break;
            case this.package.FitnessMedium:
                this.isRoleRequired = true;
                this.showServicesCheck = false;
                this.showClassesCheck = true;
                break;
            case this.package.Full:
                this.isRoleRequired = true;
                this.showServicesCheck = true;
                this.showClassesCheck = true;
                break;
        }
    }

    getAllServices() {
        this._staffService.get(StaffApi.viewAllSerivces + "?staffID=" + this.staffID)
            .subscribe((res: any) => {
                if (res && res.MessageCode > 0) {
                    this.hasServices = res.Result && res.Result.length > 0;
                    if (this.hasServices) {
                        this.serviceCategoryList = res.Result;
                        this.getSelectedServices();
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            })
    }

    showProvideServiceDialog() {
        const dialogRef = this._dialog.open(CanProvideServicePopup, {
            disableClose: true,
            data: this.serviceCategoryList

        });

        dialogRef.componentInstance.onServicesSelect.subscribe((staffServices: ServiceCategoryWithServiceList[]) => {
            this.serviceCategoryList = staffServices;
            this.getSelectedServices();
            this.staffForm.form.markAsDirty();
        })
    }

    getSelectedServices() {
        this.staffServiceModel.ServiceList = [];
        //let count = 0
        this.serviceCategoryList.forEach(serviceCategory => {
            let selectedServices = serviceCategory.ServiceList.filter(service => service.IsSelected == true);
            //count += selectedServices.length;
            selectedServices.forEach(service => {
                this.staffServiceModel.ServiceList.push({ ServiceID: service.ServiceID });
            })
        });
        //this.staffServiceCount = count;
    }

    getStaffById(staffId: number) {
        this._staffService.get(StaffApi.getByID + staffId)
            .subscribe(
                data => {
                    if (data && data.Result) {
                        this.staff = data.Result;
                        if(!this.staff.Mobile) {
                          this.staff.Mobile = null;
                        }
                        if(!this.staff.Phone) {
                          this.staff.Phone = null
                        }
                        this.staffCopy = JSON.parse(JSON.stringify(this.staff));
                        this.setStaffImage();
                        this.isSuperAdminLoggedIn = SessionService.IsStaffSuperAdmin();
                        this.staff.CountryID = this.staff.CountryID == null ? undefined : this.staff.CountryID;
                        //this.staff.StateCountyID = this.staff.StateCountyID == null ? undefined : this.staff.StateCountyID;
                        if (this.staff.StaffID === this.loggedInStaffId) {
                            this.shareData();
                        }
                    }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Details")) }
            );
    }

    getStatesByCountryId(countryId: number) {
        if (this.stateList && this.stateList.length > 0) {
            this.stateListByCountryId = this.stateList.filter(c => c.CountryID == countryId);
        }
    }

    getRoleDetailById() {
        this._dialog.open(RoleViewComponent, {
            disableClose: true,
            data: this.staff.Permission.RoleID,
        });
    }

    editEmailDialog() {
        let staffEmail = {
            staffEmail: this.staff.Email
        }
        const dialogRef = this._dialog.open(EditEmailComponent, {
            disableClose: true,
            data: this.staff.Email
        });

        dialogRef.componentInstance.emailUpdated.subscribe((isUpdated: boolean) => {
            if (isUpdated) {
                this.getStaffById(this.staffID)
            }
        });

    }


    getFundamentals() {
        this._staffService.get(StaffApi.getFundamentals)
            .subscribe(
                data => {
                    this.positionList = data.Result.StaffPositionList;
                    this.countryList = data.Result.CountryList;
                    this.stateList = data.Result.StateCountyList;
                    this.titleList = data.Result.TitleList;
                    this.genderList = data.Result.GenderList;
                    this.roleList = data.Result.RoleList;

                    this.setDefaultDropdowns();
                },
                error => this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error));
    }

    setDefaultDropdowns() {

        /* If No Title ID is set, then set First Title from title list*/
        //this.staff.Title = this.staff.Title && this.staff.Title !== '' ? this.staff.Title : this.titleList[0];
        this.staff.Title = !this.staff.Title? undefined : this.staff.Title;
        this.staff.StaffPositionID = (this.staff.StaffPositionID && this.staff.StaffPositionID > 0) ? this.staff.StaffPositionID : this.positionList[0].StaffPositionID;

        /* If No Gender ID is set, then set First gender from gender list*/
       // this.staff.Gender = this.staff.Gender && this.staff.Gender !== '' ? this.staff.Gender : this.genderList[0];
        this.staff.Gender = !this.staff.Gender? undefined : this.staff.Gender;
        /* If No Country ID is set, then set First Country from country list*/
        // this.staff.CountryID = (this.staff.CountryID && this.staff.CountryID > 0) ? this.staff.CountryID : this.countryList[0].CountryID;
        //this.onCountryChange(this.staff.CountryID);

    }

    verifyStaff() {
        this._staffService.save(StaffApi.verifyStaff + "?email=" + this.staff.Email.trim(), null)
            .subscribe((response: any) => {
                if (response && response.Result) {
                    if (response.Result.MessageCode == -30) {
                        // this._messageService.showErrorMessage(this.messages.Error.Duplicate_Email);
                        const dialogRef = this._dialog.open(GenericAlertDialogComponent, { disableClose: true });
                        dialogRef.componentInstance.Message = this.messages.Error.Duplicate_Email;
                        this.resetForm();
                    }

                    else if (response.Result.MessageCode == -45) {
                        this.showStaffUnarchivePopup(response.Result.StaffID);
                    }

                    else if (response.Result.MessageCode === -46) {
                        this.showBranchAssociationPopup(response.Result.StaffID);
                    }

                    else if (response.Result.MessageCode === -47) {
                        this._messageService.showErrorMessage(this.messages.Error.Permission_Error);
                        this.resetForm();
                    }
                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff"));
                })
    }

    showBranchAssociationPopup(staffId: number) {
        const dialogRef = this._dialog.open(BranchAssociationComponent, {
            disableClose: true,
            data: staffId
        });

        dialogRef.componentInstance.isConfirm.subscribe((isConfirm: boolean) => {
            if (!isConfirm) {
                this.resetForm();
            }
        })
    }

    showStaffUnarchivePopup(staffId: number) {
        const dialogRef = this._dialog.open(UnArchivedStaffComponent, {
            disableClose: true,
            data: staffId,
        });

        dialogRef.componentInstance.isConfirm.subscribe((isConfirm: boolean) => {
            if (!isConfirm) {
                this.resetForm();
            }
        })
    }

    saveStaff(isValid: boolean) {
        if (isValid && this.staffForm.dirty) {
            //this.setStaffBranchList();
            this.hasSuccess = false;
            this.hasError = false;
            var isNewStaff = this.staff.StaffID > 0 ? false : true;
            let staffForSave = JSON.parse(JSON.stringify(this.staff));
            if (!this.staff.Permission.ShowOnScheduler) {
                staffForSave.Permission.CanDoClass = false;
                staffForSave.Permission.CanDoService = false;
                staffForSave.Permission.CanDoServiceOnline = false;
            }
            // staffForSave.BirthDate = this._dateTimeService.convertDateObjToString(staffForSave.BirthDate, this.dateFormatForSave);
            staffForSave.Email = staffForSave.Email.toLowerCase();
            if (this.staff.IsSuperAdmin) {
                staffForSave.Permission.RoleID = null;
            }
            this._staffService.save(StaffApi.save, staffForSave)
                .subscribe((res: any) => {
                    if (res && (res.MessageCode != null || res.MessageCode != undefined)) {
                        if (res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Staff"));
                            this._router.navigate(['/staff/search']);
                            if (isNewStaff) {
                                this.resetForm();
                                this.saveStaffServices(res.MessageCode);
                            }
                            else {
                                this.setStaffImage();
                                if (this.staff.StaffID === this.loggedInStaffId) {
                                    this.shareData();
                                }
                                this.saveStaffServices(this.staff.StaffID);
                            }
                        }
                        else {
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff")); }
                )
        }
    }

    trimName() {
        this.staff.FirstName = this._trimString.transform(this.staff.FirstName);
        this.staff.LastName = this._trimString.transform(this.staff.LastName);
    }

    saveStaffServices(staffId: number) {
        if (this.hasServices) {
            this.staffServiceModel.StaffID = staffId;
            this._staffService.save(StaffApi.saveSelectedServices, this.staffServiceModel)
                .subscribe((res: any) => {
                    if (res.MessageCode > 0) {

                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff Services"));
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff Services")); }
                )
        }
    }

    setStaffImage() {
        this.isImageExist = false;
        if (this.staff.ImageFile && this.staff.ImageFile.length > 0) {
            this.isImageExist = true;
            this.imagePath = "data:image/jpeg;base64," + this.staff.ImageFile;
        }
        else if (this.staff.ImagePath && this.staff.ImagePath.length > 0) {
            this.isImageExist = true;
            this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setStaffImagePath()) + this.staff.ImagePath;
        }
    }

    setStaffInfo() {
        /* Set Staff Info*/
        this.staffInfo.FirstName = this.staff.FirstName;
        this.staffInfo.LastName = this.staff.LastName;
        this.staffInfo.Email = this.staff.Email;
        this.staffInfo.Mobile = this.staff?.Mobile?.toString();
        this.staffInfo.Address = this.staff.Address1;
        this.staffInfo.ImagePath = this.staff.ImagePath;
    }

    shareData() {
        this.setStaffInfo();

        this._dataSharingService.shareStaffImage(this.staff.ImageFile ? this.staff.ImageFile : this.staff.ImagePath);
        this._dataSharingService.shareStaffEmail(this.staff.Email);
        this._dataSharingService.shareStaffInfo(this.staffInfo);
    }

    resetForm() {
        if (this.staff.StaffID > 0) {
            this.staff = JSON.parse(JSON.stringify(this.staffCopy));
            this.staff.CountryID = this.staff.CountryID == null ? undefined : this.staff.CountryID;
            //this.staff.StateCountyID = this.staff.StateCountyID == null ? undefined : this.staff.StateCountyID;
        }
        else {
            this.staffForm.resetForm();
            setTimeout(() => {
                this.staff = new Staff();
                this.setDefaultDropdowns();
                this.imagePath = '';
                this.isImageExist = false;
            });
        }
    }

    discardImage() {
        this._commonService.deleteFile(ENU_Permission_Staff.Save, this.staff.StaffID, this.staff.ImagePath)
            .subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Image"));
                    this.staff.ImageFile = "";
                    this.staff.ImagePath = "";
                    this.staffCopy.ImageFile = "";
                    this.staffCopy.ImagePath = "";
                    this.setStaffImage();
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image"));
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image")); }
            );
    }

    getErrorMessage(StaffFormData: NgForm) {
        if (StaffFormData.invalid) {

            if (StaffFormData.controls.Email?.errors?.pattern) {
                return Messages.Validation.Email_Invalid;
            }
            if (StaffFormData.controls.Mobile?.errors || StaffFormData.controls.Phone?.errors) {
                return Messages.Validation.Phone_Invalid;
            } else {
                return Messages.Validation.Info_Required;
            }
        }

    }

    // #endregion Methods
}
