
/********************** Angular References *********************/
import { Component,ViewChild,OnInit,Input,OnDestroy,AfterViewInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { SubscriptionLike as ISubscription, SubscriptionLike } from "rxjs";
import { FormControl } from "@angular/forms";
import { debounceTime } from "rxjs/internal/operators";
import { Router } from "@angular/router";
import * as _ from "lodash";

/********************* Material:Refference ********************/
import { MatSlideToggleChange } from "@angular/material/slide-toggle";

/********************** Services & Models *********************/

/* Services */
import { HttpService } from "src/app/services/app.http.service";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { MessageService } from "src/app/services/app.message.service";
import { CommonService } from "src/app/services/common.service";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";
import { DateTimeService } from "src/app/services/date.time.service";
import { AuthService } from "src/app/helper/app.auth.service";

/* Models */
import { SavePageMember } from "src/app/customer/member/models/members.model";
import { AllPerson,ApiResponse,StateCounty,CustomerAddress,CustomerBillingAddress } from "src/app/models/common.model";
import { CompanyDetails } from "src/app/setup/models/company.details.model";


/********************** Configurations *********************/
import { MemberApi, CustomerApi, DoorAccessApi } from "src/app/helper/config/app.webapi";
import { Messages } from "src/app/helper/config/app.messages";
import { environment } from "src/environments/environment";
import { CustomerTypeName } from "src/app/helper/config/app.config";
import {CustomerType, AddressType, ENU_Package, ENU_CancelItemType, ENU_DateFormatName } from "src/app/helper/config/app.enums";
import {ENU_Permission_ClientAndMember, ENU_Permission_Module } from "src/app/helper/config/app.module.page.enums";
import { AppUtilities } from "src/app/helper/aap.utilities";
import { TrimPipe } from "src/app/shared/pipes/trim";


/********************** Components *********************/
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { ConfirmResetCountComponent } from "src/app/customer-shared-module/confirm-reset-count/confirm.reset.count.component";
import { AddLeadMembershipComponent } from "src/app/customer-shared-module/add-lead-membership/add.lead.membership.component";
import { GenericAlertDialogComponent } from "src/app/application-dialog-module/generic-alert-dialog/generic.alert.dialog.component";
import { DeleteConfirmationComponent } from "src/app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { EditCustomerEmailComponent } from "src/app/customer-shared-module/edit-email/edit.customer.email.component";
import { AlertConfirmationComponent } from "src/app/application-dialog-module/confirmation-dialog/alert.confirmation.component";
import { ImageEditorPopupComponent } from "src/app/application-dialog-module/image-editor/image.editor.popup.component";
import { SaveMemberMembershipPopup } from "src/app/customer-shared-module/add-member-membership/save-membership-popup/save.member.membership.popup";
import { MissingBillingAddressDialog } from "src/app/customer-shared-module/missing-billing-address/missing.billing.address.dialog";

// #endregion

@Component({
  selector: "save-member-details",
  templateUrl: "./save.member.details.component.html",
})
export class SaveMemberDetailsComponent extends AbstractGenericComponent implements OnInit, OnDestroy, AfterViewInit {

  /* Form Refrences*/
  @ViewChild("MemberFormData") memberForm: NgForm;
  @Input() showValidation: boolean;
  @Input() popupMode: boolean;
  @Input() isCustomerAddressRequired: boolean;

  /* Messages */
  messages = Messages;

  /* Local Members */
  isSameBillingAddress: boolean;
  maxDate: Date = new Date();
  memberID: number = 0;
  membershipCopy: any;
  isImageExists: boolean;
  imagePath: string;
  serverImageAddress = environment.imageUrl;
  fullName: string = "";
  defaultCountry: string;
  customerId: number;
  isPartialPaymentAllow: boolean = false;
  hascurrencyFormated: boolean = false;
  currencyFormat: string;
  dateTimeFormat: string = "";
  dateFormat: string = "";
  timeFormat: string = "";
  cancelItemType = ENU_CancelItemType;
  /*  Collection Types */
  genderList: string[];
  titleList: string[];
  referralList: any[];
  enquirySourceTypeList: any[];
  countryList: any[];
  stateList: StateCounty[];
  stateListByCountryId: StateCounty[];
  stateListByBillingCountryId: StateCounty[];
  allPerson: AllPerson[];
  isAddLeadAllowed: boolean;
  package = ENU_Package;
  isSmsAllowed: boolean = true;
  isResetAndAlertAllowForClass: boolean = false;
  isResetAndAlertAllowForService: boolean = false;
  isRewardProgramAllow: boolean = false;

  packageIdSubscription: SubscriptionLike;
  customerAddressCopy: CustomerAddress[] = [];

  /* Model Reference */
  memberModel: SavePageMember = new SavePageMember();

  memberIdSubscription: ISubscription;
  customerBillingAddressSubscription: ISubscription;
  searchPerson: FormControl = new FormControl();

  customerType = CustomerType;
  customerTypeName = CustomerTypeName;
  public companyDetails: CompanyDetails = new CompanyDetails();
  BillingAddress: CustomerAddress = new CustomerAddress(
    AddressType.BillingAddress
  );
  isLoadedData: boolean = false;
  isLoadCompnent : boolean = false;
  isNFCCardAccessIdDuplicate: boolean = false;

  // #endregion

  /* Constructor */
  constructor(
    private _commonService: CommonService,
    public _dataSharingService: DataSharingService,
    private _messageService: MessageService,
    private _dateTimeService: DateTimeService,
    private _httpService: HttpService,
    private _router: Router,
    private _trimString: TrimPipe,
    private _dialog: MatDialogService,
    private _authService: AuthService
  ) {
    super();
  }

  // #region Events

  ngOnInit() {

    this.getCurrentBranchDetail();
    this.setPermissions();
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
      (packageId: number) => {
        if (packageId && packageId > 0) {
          this.setPackagePermission(packageId);
        }
      }
    );
  }

  ngAfterViewInit() { }
  setPermissions() {
    this.isAddLeadAllowed = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.ProceedToLead
    );
  }

  ngOnDestroy() {
    // this.partialPaymentSubscription.unsubscribe();
    this.memberIdSubscription.unsubscribe();
    this.customerBillingAddressSubscription?.unsubscribe();
    this.packageIdSubscription.unsubscribe();
  }

  onReferredByChange(person: AllPerson) {
    this.getSelectedMemberName(person);
  }

  onEmailUpdated() {
    if (this.memberModel.Email && this.memberModel.Email !== "") {
      this.memberModel.Email = this.memberModel.Email.trim();
      this.verifyCustomer();
    }
    // else {
    //   this.resetForm();
    // }
  }

  onShowImageCropperDialog() {
    const dialogInst = this._dialog.open(ImageEditorPopupComponent, {
      disableClose: true,
      data: {
        showWebCam: true,
        height: 200,
        width: 200,
        aspectRatio: 200 / 200,
      },
    });

    dialogInst.componentInstance.croppedImage.subscribe((img: string) => {
      if (img && img.length > 0) {
        this.memberModel.ImageFile = img;
        this.setMemberImage();
        this.memberForm.form.markAsDirty();
      }
    });
  }

  onBirthDateChange(date: any) {
    setTimeout(() => {
      this.memberModel.BirthDate = date;
      this.memberForm.form.markAsDirty();
    });
  }

  onDeleteImage() {
    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, {
      disableClose: true,
      data: {
        header: this.messages.Delete_Messages.Del_Msg_Generic.replace(
          "{0}",
          "?"
        ),
        description: this.messages.Delete_Messages.Del_Msg_Undone,
      },
    });
    deleteDialogRef.componentInstance.confirmDelete.subscribe(
      (isConfirmDelete: boolean) => {
        if (isConfirmDelete) {
          this.discardImage();
        }
      }
    );
  }

  onUpdateCardNumber() {
    if (this.memberModel.CardNumber && this.memberModel.CardNumber !== "") {
      this.verifyCardNumber();
    }
  }

  onUpdateNFCAccess(){
    //if(environment.ENVName == 'dooraccess'){
      if(this.memberModel.CardAccessID && this.memberModel.CardAccessID != null){
        this.verifyNFCAccess();
      }
    //}
  }

  onProceedToLead() {
    const dialogref = this._dialog.open(AddLeadMembershipComponent, {
      disableClose: true,
      data: {
        CustomerID: this.memberID,
        CustomerTypeID: CustomerType.Member,
        //IsMemberToLead: true
        MemberToLead: true,
      },
    });

    dialogref.componentInstance.isLeadMembershipSaved.subscribe((res: any) => {
      if (res.isSaved) {
        this._router.navigate(["/lead/details/" + this.memberID]);
      }
    });
  }

   //Reward Program toggle check if enrolled
   onRewardProgramToggle(ob: MatSlideToggleChange) {
    if (!this.memberModel.RewardProgramAllowed && this.memberModel.IsCustomerEnrolledRewardProgram) {
      ob.source.checked = true;
      this.memberModel.RewardProgramAllowed = true;
       this._messageService.showErrorMessage(this.messages.Error.RewardProgram_Enrolled);
    }
  }

  //Reset Block Classes Counter
  resetBlockCounter(itemType: any) {
    let param = {
      customerID: this.memberModel.CustomerID,
      itemTypeID: itemType
    }
    const dialogRef = this._dialog.open(ConfirmResetCountComponent, {
    });

    dialogRef.componentInstance.confirmChanges.subscribe(isConfirm => {
      if (isConfirm) {
        this._httpService.save(CustomerApi.ResetCancellationNoShowCount, param).subscribe((res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            if (itemType == this.cancelItemType.Class) {
              this.memberModel.ClassResetBy = res.Result.ClassResetBy;
              this.memberModel.ClassResetDate = res.Result.ClassResetDate;
              this.memberModel.ClassNoShowCount = res.Result.ClassNoShowCount;
              this.memberModel.ClassLateCancellationCount = res.Result.ClassLateCancellationCount;
              if (this.memberModel.ClassNoShowCount == 0 || this.memberModel.ClassLateCancellationCount == 0) {
                this.memberModel.IsClassBookingBlocked = false;
              }
            } else {
              this.memberModel.ServiceResetBy = res.Result.ServiceResetBy;
              this.memberModel.ServiceResetDate = res.Result.ServiceResetDate;
              this.memberModel.ServiceNoShowCount = res.Result.ServiceNoShowCount;
              this.memberModel.ServiceLateCancellationCount = res.Result.ServiceLateCancellationCount;
              if (this.memberModel.ServiceNoShowCount == 0 || this.memberModel.ServiceLateCancellationCount == 0) {
                this.memberModel.IsServiceBookingBlocked = false;
              }
            }
            this._messageService.showSuccessMessage(res.Result.MessageText);
          }
          else {
            this._messageService.showErrorMessage(res.Result.MessageText);
          }

        });
      }

    })
  }

  // #endregion Events

  // #region Methods

  async getCurrentBranchDetail() {
    this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
    this.dateTimeFormat = this.dateFormat + " | " + this.timeFormat;
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("ISOCode")) {
      this.defaultCountry = branch.ISOCode.toLowerCase();
      this.hascurrencyFormated = true;
    }

    this.isPartialPaymentAllow = await super.isPartPaymentAllow(
      this._dataSharingService
    );

    this.getFundamentals();

    this.memberIdSubscription = this._dataSharingService.memberID.subscribe(
      (memberId) => {

        if (memberId && memberId > 0) {
          this.memberID = memberId;

          setTimeout(() => {
            this.getMemberById(memberId);
          }, 1000);
          this.hascurrencyFormated = true;

        } else {
          setTimeout(() => {
            this.resetForm();
          }, 1000);
          this.memberModel = new SavePageMember();
          this._dataSharingService.shareImage("");
        }
      }
    );

    this.searchPerson.valueChanges
      .pipe(debounceTime(400))
      .subscribe((searchText) => {
        if (searchText && searchText !== "" && searchText.length > 2) {
          if (typeof searchText === "string") {
            this._commonService
              .searchClient(searchText, 0, true)
              .subscribe((response) => {
                if (response.Result != null && response.Result.length) {
                  this.allPerson = response.Result;
                  this.allPerson.forEach((person) => {
                    person.FullName = person.FirstName + " " + person.LastName;
                  });
                  if (this.memberID && this.memberID > 0) {
                    this.allPerson = this.allPerson.filter(
                      (m) => m.CustomerID !== this.memberID
                    );
                  }
                } else {
                  this.allPerson = [];
                }
              });
          }
        } else {
          this.allPerson = [];
          if (typeof searchText === "string" && searchText.trim() === "") {
            this.memberModel.ReferenceCustomerID = null;
            this.memberModel.ReferenceCustomerName = "";
          }
        }
      });
    //implementation change after discuss with tahir bhai show branch current date not browser date implementaed by fahad dated on 03-03-2021
    this.maxDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();



  }

  getMemberById(memberId: number) {
    this._httpService.get(MemberApi.getByID + memberId).subscribe(
      (res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.memberModel = res.Result;
          //Member Classes and services reset alert data
          this.memberModel.ClassResetBy = res.Result.ClassResetBy;
          this.memberModel.ClassResetDate = res.Result.ClassResetDate;
          this.memberModel.ClassLateCancellationCount = res.Result.ClassLateCancellationCount;
          this.memberModel.ClassNoShowCount = res.Result.ClassNoShowCount;
          this.memberModel.ServiceResetBy = res.Result.ServiceResetBy;
          this.memberModel.ServiceResetDate = res.Result.ServiceResetDate;
          this.memberModel.ServiceLateCancellationCount = res.Result.ServiceLateCancellationCount;
          this.memberModel.ServiceNoShowCount = res.Result.ServiceNoShowCount;
          this.memberModel.IsCustomerEnrolledRewardProgram = res.Result.IsCustomerEnrolledRewardProgram;
          this.memberModel.StateList = this.stateList;

          this.shareData();
          this.setMemberImage();
          this.checkSameBillingAddress();
          this.membershipCopy = Object.assign({}, this.memberModel);
          this.customerAddressCopy = _.cloneDeep(
            this.memberModel.CustomerAddress
          );
          this.memberModel.EnquirySourceTypeID =
            this.memberModel.EnquirySourceTypeID == null
              ? undefined
              : this.memberModel.EnquirySourceTypeID;
          this.setSelectedMemberName();
          this.setDefaultDropdowns();
        } else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Member Details")
        );
      }
    );
  }

  trimName() {
    this.memberModel.FirstName = this.memberModel.FirstName
      ? this._trimString.transform(this.memberModel.FirstName)
      : this.memberModel.FirstName;
    this.memberModel.LastName = this.memberModel.LastName
      ? this._trimString.transform(this.memberModel.LastName)
      : this.memberModel.LastName;
    this.memberModel.PostCode = this.memberModel.PostCode
      ? this._trimString.transform(this.memberModel.PostCode)
      : this.memberModel.PostCode;
  }

  checkSameBillingAddress() {
    this.isSameBillingAddress = false;
  }

  shareData() {
    this._dataSharingService.shareMemberEmail(this.memberModel.Email);
  }

  setMemberImage() {
    this.isImageExists = false;
    if (this.memberModel.ImageFile && this.memberModel.ImageFile.length > 0) {
      this.isImageExists = true;
      this.imagePath = "data:image/jpeg;base64," + this.memberModel.ImageFile;
    } else if (
      this.memberModel.ImagePath &&
      this.memberModel.ImagePath.length > 0
    ) {
      this.isImageExists = true;
      this.imagePath =
        this.serverImageAddress.replace(
          "{ImagePath}",
          AppUtilities.setCustomerImagePath()
        ) + this.memberModel.ImagePath;
    }
  }

  getStatesByCountryId(countryId: number) {
    if (this.stateList && this.stateList.length > 0) {
      return this.stateList.filter((c) => c.CountryID == countryId);
    }
    return this.stateList;
  }

  getFundamentals() {
    const response = this._httpService.get(MemberApi.getFundamentals).toPromise();
    response.then(
      (res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.enquirySourceTypeList = res.Result.EnquirySourceTypeList;
          this.referralList = res.Result.ReferralList;
          this.countryList = res.Result.CountryList;
          this.stateList = res.Result.StateCountyList;
          this.memberModel.StateList = res.Result.StateCountyList;
          this.titleList = res.Result.TitleList;
          this.genderList = res.Result.GenderList;
          this.isLoadCompnent = true;
          this.setDefaultDropdowns();
        } else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
      (err) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Dropdowns_Load_Error
        );
      }
    );
  }

  setDefaultDropdowns() {
    this.memberModel.Title = !this.memberModel.Title
      ? undefined
      : this.memberModel.Title;
    this.memberModel.Gender = !this.memberModel.Gender
      ? undefined
      : this.memberModel.Gender;
    // this.memberModel.EnquirySourceTypeID = (this.memberModel.EnquirySourceTypeID && this.memberModel.EnquirySourceTypeID > 0) ? this.memberModel.EnquirySourceTypeID : this.enquirySourceTypeList[0].EnquirySourceTypeID;
    /* If No Country ID is set, then set First Country from country list*/
    // this.memberModel.CountryID = (this.memberModel.CountryID && this.memberModel.CountryID > 0) ? this.memberModel.CountryID : null;
    // this.memberModel.BillingAddress.CountryID = (this.memberModel.BillingAddress && this.memberModel.BillingAddress.CountryID &&
    //     this.memberModel.BillingAddress.CountryID > 0) ?
    //     this.memberModel.BillingAddress.CountryID :
    //     undefined;
    //  this.onBillingCountryChange(this.memberModel.BillingAddress.CountryID);
  }

  setSelectedMemberName() {
    if (this.memberModel.CustomerID && this.memberModel.CustomerID > 0) {
      this.fullName = this.memberModel.ReferenceCustomerName;
    } else {
      this.fullName = "";
    }
    this.searchPerson.setValue(this.fullName);
    this.searchPerson.updateValueAndValidity();
  }

  getSelectedMemberName(person: AllPerson) {
    this.memberModel.ReferenceCustomerID = person.CustomerID;
    this.memberModel.ReferenceCustomerName = person.FullName;
  }

  displayMemberName(user?: AllPerson): string | undefined {
    return user ? (typeof user === "object" ? user.FullName : user) : undefined;
  }

  verifyCustomer() {
    this._httpService
      .save(
        CustomerApi.verifyCustomer +
        "?email=" +
        this.memberModel.Email.trim() +
        "&IsFromLead=false",
        null
      )
      .subscribe(
        (res: ApiResponse) => {
          let customerInfo = {
            CustomerID:
              typeof res.MessageData === "object" && res.MessageData != null
                ? res.MessageData.CustomerID
                : typeof res.Result === "object" && res.Result != null
                  ? res.Result.CustomerID
                  : res.MessageData != null
                    ? res.MessageData
                    : res.Result,
            CustomerTypeID:
              typeof res.MessageData === "object" && res.MessageData != null
                ? res.MessageData.CustomerTypeID
                : typeof res.Result === "object" && res.Result != null
                  ? res.Result.CustomerTypeID
                  : this.customerType.Client,
            MessageCode: res.MessageCode,
            MessageText: res.MessageText,
            isFromMember: true,
          };


          if (
            res.MessageCode == -18 ||
            res.MessageCode == -21 ||
            res.MessageCode == -46
          ) {
            this.showProceedAsMemberPopup(
              customerInfo,
              AppUtilities.setCustomerTypeMessage(customerInfo),
              true
            );
          }


          else if (res && res.MessageCode > 0) {
            if (res && res.Result && res.Result.IsWalkedIn) {
              this._messageService.showErrorMessage(
                this.messages.Error.Walked_In_Association
              );
              this.resetForm();
            } else {
              this.showDuplicateCustomerMessage(customerInfo);
              this.resetForm();
            }
          }
        },
        (err) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Save_Error.replace("{0}", "Member")
          );
          this.resetForm();
        }
      );
  }



  showDuplicateCustomerMessage(customerInfo: any) {
    switch (customerInfo.CustomerTypeID) {
      case this.customerType.Client:
        this.showProceedAsMemberPopup(
          customerInfo,
          this.messages.Confirmation.Proceed_As_Member.replace(
            "{0}",
            this.customerTypeName.Client
          ),
          false
        );
        break;
      case this.customerType.Lead:
        this.showProceedAsMemberPopup(
          customerInfo,
          this.messages.Confirmation.Proceed_As_Member.replace(
            "{0}",
            this.customerTypeName.Lead
          ),
          false
        );
        break;
      case this.customerType.Member:
        // this._messageService.showErrorMessage(this.messages.Error.Duplicate_Customer.replace("{0}", this.customerTypeName.Member));
        if (this.popupMode) {
          this._messageService.showErrorMessage(
            this.messages.Error.Duplicate_Customer.replace(
              "{0}",
              this.customerTypeName.Member
            )
          );
        } else {
          const dialogRef = this._dialog.open(GenericAlertDialogComponent, {
            disableClose: true,
          });
          dialogRef.componentInstance.Message = this.messages.Error.Duplicate_Email;
        }
        break;
    }
  }

  showProceedAsMemberPopup(
    customerInfo: any,
    _customerTypeMessage: string,
    isCallSubscribeBranch: boolean = false
  ) {
    const confirmDialog = this._dialog.open(AlertConfirmationComponent, {
      disableClose: true,
    });
    confirmDialog.componentInstance.Title = this.messages.Dialog_Title.Proceed_As_Member;
    confirmDialog.componentInstance.Message = _customerTypeMessage;
    // if (messageCode == -18) {
    //     confirmDialog.componentInstance.Message = this.messages.Confirmation.Archieved_Proceed_As_Member.replace("{0}", customerTypeName);
    // } else {
    //     confirmDialog.componentInstance.Message = message.replace(/Staff/gi, "Customer");   //this.messages.Confirmation.Proceed_As_Member.replace("{0}", customerTypeName);
    // }

    confirmDialog.componentInstance.confirmChange.subscribe(
      (isConfirm: boolean) => {
        if (isConfirm) {
          if (isCallSubscribeBranch) {
            this._httpService
              .save(
                CustomerApi.subscribeBranch +
                "?email=" +
                this.memberModel.Email +
                "&IsClient=true" +
                "&IsFromLead=false",
                null
              )
              .subscribe((response: ApiResponse) => {
                this.customerId = response.MessageCode;
              });
          }
          this.checkBillingAddress(customerInfo);
        } else {
          this.resetForm();
        }
      }
    );
  }

  checkBillingAddress(customerInfo: any) {
    let cunstomerData = {
      CustomerID: 0,
      CustomerTypeID: 0,
      CanbeProcessedAsClient: false,
      IsWalkedIn: false,
      messageCode: undefined,
    };
    if (
      customerInfo.CustomerID != undefined ||
      customerInfo.CustomerID != null
    ) {
      cunstomerData = customerInfo;
    } else {
      cunstomerData.CustomerID = customerInfo;
    }
    if (typeof customerInfo.CustomerID === "object") {
      cunstomerData.CustomerID = customerInfo.CustomerID.CustomerID;
    }

    this.openSaveMemberPopup(cunstomerData);
  }

  openSaveMemberPopup(customerInfo: any) {
    const dialogref = this._dialog.open(SaveMemberMembershipPopup, {
      disableClose: true,
      data: {
        CustomerID: customerInfo.CustomerID,
        CustomerTypeID: customerInfo.CustomerTypeID,
      },
    });

    dialogref.componentInstance.membershipSaved.subscribe(
      (isSaved: boolean) => {
        if (isSaved) {
          this._router.navigate([
            "customer/member/details/" + customerInfo.CustomerID,
          ]);
        }
      }
    );
  }

  showBillingAddressDialog(customerInfo: any) {
    const dialog = this._dialog.open(MissingBillingAddressDialog, {
      disableClose: true,
      data: customerInfo.CustomerID,
    });
    if (customerInfo.CustomerTypeID == this.customerType.Lead) {
      if (customerInfo.messageCode == -46) {
        dialog.componentInstance.redirectUrl =
          "customer/member/details/" + customerInfo.CustomerID;
      } else {
        dialog.componentInstance.redirectUrl =
          "/lead/details/" + customerInfo.CustomerID;
      }
    } else if (customerInfo.CustomerTypeID == this.customerType.Client) {
      if (customerInfo.messageCode == -46) {
        dialog.componentInstance.redirectUrl =
          "customer/member/details/" + customerInfo.CustomerID;
      } else {
        dialog.componentInstance.redirectUrl =
          "customer/client/details/" + customerInfo.CustomerID;
      }
    }

    this.resetForm();
  }

  resetForm() {
    if (this.memberModel.CustomerID > 0) {
      this.memberModel = Object.assign({}, this.membershipCopy);
      this.memberModel.EnquirySourceTypeID =
        this.memberModel.EnquirySourceTypeID == null
          ? undefined
          : this.memberModel.EnquirySourceTypeID;
      this.checkSameBillingAddress();
      this.memberModel.CustomerAddress = _.cloneDeep(this.customerAddressCopy);
      this.setSelectedMemberName();
      this.setDefaultDropdowns();
    } else {
      this.memberForm.resetForm();
      this.setSelectedMemberName();
      setTimeout(() => {
        this.memberModel = new SavePageMember();
        this.setDefaultDropdowns();
        this.imagePath = "";
        this.isImageExists = false;
        this.isSameBillingAddress = this.isSameBillingAddress
          ? this.isSameBillingAddress
          : false;
      });
    }
  }

  discardImage() {
    this._commonService
      .deleteFile(
        ENU_Permission_ClientAndMember.SaveMember,
        this.memberModel.CustomerID,
        this.memberModel.ImagePath
      )
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._messageService.showSuccessMessage(
              this.messages.Success.Delete_Success.replace("{0}", "Image")
            );
            this.imagePath = "";
            this.isImageExists = false;
            this.memberModel.ImageFile = "";
            this.memberModel.ImagePath = "";
            this.membershipCopy.ImageFile = "";
            this.membershipCopy.ImagePath = "";
            this.setMemberImage();
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

  verifyCardNumber() {
    let params = {
      customerID: this.memberModel.CustomerID,
    };
    this._httpService
      .get(
        MemberApi.verifyCardNumber +
        "?cardNumber=" +
        this.memberModel.CardNumber.trim(),
        params
      )
      .subscribe((response: ApiResponse) => {
        if (response.MessageCode === -181) {
          const dialogRef = this._dialog.open(GenericAlertDialogComponent, {
            disableClose: true,
          });
          dialogRef.componentInstance.Message = this.messages.Error.Duplicate_Customer_Card;
          this.memberModel.CardNumber = "";
        }
      });
  }

  verifyNFCAccess(){
    let params = {
      UserID: this.memberModel.CustomerID,
      cardNumber: this.memberModel.CardAccessID,
      IsStaff: false
    };
    this._httpService
      .get(
        DoorAccessApi.checkIfCardNumberExist, params).subscribe((response: ApiResponse) => {
        if (response.Result) {

          const dialogRef = this._dialog.open(GenericAlertDialogComponent, {
            disableClose: true,
          });
          dialogRef.componentInstance.Message = this.messages.Error.Duplicate_NFC_Access;
          this.memberModel.CardAccessID = null;

        }
      });
  }

  editCustomerEmailDialog() {
    let customerInfo = {
      customerEmail: this.memberModel.Email,
      customerId: this.memberModel.CustomerID,
    };
    const dialogRef = this._dialog.open(EditCustomerEmailComponent, {
      disableClose: true,
      data: customerInfo,
    });
    dialogRef.componentInstance.emailUpdated.subscribe((isUpdated: boolean) => {
      if (isUpdated) {
        this.getMemberById(this.memberModel.CustomerID);
      }
    });
  }

  setBillingAddressFromPopup() {
    // // in case of paytabs if user addedd a billing adress from popup billing address prepopulated here ;
    this.customerBillingAddressSubscription = this._dataSharingService.customerBillingAddress.subscribe(
      (billingAddress: CustomerBillingAddress) => {
        if (billingAddress.CountryID && billingAddress.CountryID > 0) {
          this.BillingAddress.Address1 = billingAddress.Address1;
          this.BillingAddress.Address2 = billingAddress.Address2;
          this.BillingAddress.StateCountyName = billingAddress.StateCountyName;
          this.BillingAddress.StateCountyCode = billingAddress.StateCountyCode;
          this.BillingAddress.CityName = billingAddress.CityName;
          this.BillingAddress.PostalCode = billingAddress.PostalCode;
          this.BillingAddress.Mobile = billingAddress.Phone;
          this.BillingAddress.CountryID = billingAddress.CountryID;
        }
      }
    );
  }
  setPackagePermission(packageId: number) {
    switch (packageId) {
      case this.package.FitnessBasic:
        this.isSmsAllowed = false;
        break;

      case this.package.Full:
        this.isResetAndAlertAllowForClass = true;
        this.isResetAndAlertAllowForService = true;
        this.isRewardProgramAllow = true;
        break;
    }
  }

  RequiredCustomerAddress(isAddressRequired: boolean){
    this.isCustomerAddressRequired = isAddressRequired;
  }
  // #endregion Methods
}
