/********************* Angular References ********************/
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { NgForm, FormControl } from "@angular/forms";
import { SubscriptionLike as ISubscription } from "rxjs";

/***************** Component ******************/
import { SaleHistoryComponent } from "@shared/components/sale/sale-history/sale.history.component";

/************* Services & Models ***************/
/* Services */
import { HttpService } from "@services/app.http.service";

/* Models*/
import {
  SaveClient,
  CountryList,
  EnquirySourceTypeList,
  Client,
} from "@app/customer/client/models/client.model";
import {
  ApiResponse,
  StateCounty,
  DD_Branch,
  CustomerAddress,
  AllPerson,
} from "@app/models/common.model";
import { CompanyDetails } from "@setup/models/company.details.model";

/********************** Common ***************************/
import { Messages } from "@app/helper/config/app.messages";
import { CommonService } from "@app/services/common.service";
import { DateTimeService } from "@app/services/date.time.service";
import { ImageEditorPopupComponent } from "@app/application-dialog-module/image-editor/image.editor.popup.component";
import { environment } from "@env/environment";
import {
  CustomerType,
  AddressType,
  ENU_Package,
  ENU_DateFormatName,
  ENU_CancelItemType,
} from "@app/helper/config/app.enums";
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";

/********* Configurations *********** */
import {
  ENU_Permission_ClientAndMember,
  ENU_Permission_Module,
} from "@app/helper/config/app.module.page.enums";
import {
  ClientApi,
  CustomerApi,
  MemberMembershipApi,
} from "@app/helper/config/app.webapi";
import {
  Configurations,
  CustomerTypeName,
} from "@app/helper/config/app.config";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { GenericAlertDialogComponent } from "@app/application-dialog-module/generic-alert-dialog/generic.alert.dialog.component";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";
import { AppUtilities } from "@app/helper/aap.utilities";
import { TrimPipe } from "@app/shared/pipes/trim";
import { FillFormComponent } from "@app/shared/components/fill-form/fill.form.component";
import { EditCustomerEmailComponent } from "@app/customer-shared-module/edit-email/edit.customer.email.component";
import { BranchSubscribeComponent } from "../branch-subscribe/branch.subscribe.component";
import { variables } from "@app/helper/config/app.variable";
import { MessageService } from "@app/services/app.message.service";
import { DataSharingService } from "@app/services/data.sharing.service";
import { debounceTime } from "rxjs/operators";
import { AddLeadMembershipComponent } from "@app/customer-shared-module/add-lead-membership/add.lead.membership.component";
import { SaveMemberMembershipPopup } from "@app/customer-shared-module/add-member-membership/save-membership-popup/save.member.membership.popup";
import { AuthService } from "@app/helper/app.auth.service";
import { AlertConfirmationComponent } from "@app/application-dialog-module/confirmation-dialog/alert.confirmation.component";
import { SubscriptionLike } from "rxjs";
import * as _ from "lodash";
import { ConfirmResetCountComponent } from "@app/customer-shared-module/confirm-reset-count/confirm.reset.count.component";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";

@Component({
  selector: "save-client",
  templateUrl: "./save.client.component.html",
})
export class SaveClientComponent
  extends AbstractGenericComponent
  implements OnInit, OnDestroy {
  // #region Local Members

  @ViewChild("saveClientFormData") saveClientFormData: NgForm;
  @ViewChild("saleHistoryRef") saleHistoryRef: SaleHistoryComponent;

  @Output() closeDialog = new EventEmitter<boolean>();
  @Input() popupMode: boolean = false;
  clientCopy: any;
  isAddLeadAllowed: boolean;
  isAddMemberShipAllowed: boolean;
  clientID: number = 0;
  defaultCountry: string;
  maxDate: Date = new Date();
  dateTimeFormat: string = "";
  dateFormat: string = "";
  timeFormat: string = "";
  isImageExists: boolean;
  imagePath: string;
  serverImageAddress = environment.imageUrl;
  newCustomer: boolean;
  hasBillingAddress: boolean;
  isSameBillingAddress: boolean;
  hasBillingAddressForEdit: boolean;
  isPartialPaymentAllow: boolean = false;
  hascurrencyFormated: boolean = false;
  /* Messages */
  messages = Messages;
  hasSuccess: boolean = false;
  hasError: boolean = false;
  successMessage: string;
  errorMessage: string;
  isExistForms: boolean;
  searchPerson: FormControl = new FormControl();
  /* Model References */
  saveClient: SaveClient;
  dialogueRef: any;
  public companyDetails: CompanyDetails = new CompanyDetails();

  clientIdSubscription: ISubscription;
  // partialPaymentSubscription: ISubscription;
  companyID: ISubscription;
  packageIdSubscription: SubscriptionLike;
  dateFormatForSave = Configurations.DateFormatForSave;

  /* Collection Types */
  enquirySourceTypeList: EnquirySourceTypeList[];
  countryList: CountryList[];
  stateList: StateCounty[];
  stateListByCountryId: StateCounty[];
  stateListByBillingCountryId: StateCounty[];
  genderList: string[];
  titleList: string[];

  customerType = CustomerType;
  cancelItemType = ENU_CancelItemType;
  customerTypeName = CustomerTypeName;
  hasMemberships: boolean;
  allPerson: any;
  fullName: any;
  customerAddressCopy: CustomerAddress[] = [];
  allowedReferredBy: boolean;
  package = ENU_Package;
  isSmsAllowed: boolean = true;
  isEmailAllowed: boolean = true;
  isPushNotificationAllowed: boolean = true;
  isResetAndAlertAllowForClass: boolean = false;
  isResetAndAlertAllowForService: boolean = false;
  isRewardProgramAllow: boolean = false;
  isLoadAddressComp: boolean = false;

  // #endregion

  constructor(
    private _FormDialogue: MatDialogService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    public _dataSharingService: DataSharingService,
    private _dateTimeService: DateTimeService,
    private _commonService: CommonService,
    private _dialog: MatDialogService,
    private _trimString: TrimPipe,
    private _router: Router,
    private route: ActivatedRoute,
    private _authService: AuthService
  ) {
    super();
    this.saveClient = new SaveClient();
  }

  ngOnInit() {
    this._dataSharingService.shareCustomerTypeID(this.customerType.Client);
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
  setPermissions() {
    this.isAddLeadAllowed = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.ProceedToLead
    );
    this.isAddMemberShipAllowed = this._authService.hasPagePermission(
      ENU_Permission_Module.Customer,
      ENU_Permission_ClientAndMember.ProceedToMember
    );
  }

  setPackagePermission(packageId: number) {
    switch (packageId) {
      case this.package.WellnessBasic:
        this.isSmsAllowed = false;
        this.isEmailAllowed = false;
        this.isPushNotificationAllowed = false;
        break;

      case this.package.WellnessMedium:
        break;

      case this.package.WellnessTop:
        this.allowedReferredBy = true;
        break;

      case this.package.Full:
        this.allowedReferredBy = true;
        this.isResetAndAlertAllowForClass = true;
        this.isResetAndAlertAllowForService = true;
        this.isRewardProgramAllow = true;
        break;
    }
  }
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

    this.route.params.subscribe((params: Params) => {
      this.saveClient.CustomerID = isNaN(parseInt(params["ClientID"]))
        ? 0
        : parseInt(params["ClientID"]);
      if (this.saveClient.CustomerID == 0) {
        setTimeout(() => {
          this.resetForm();
        }, 500);
      }
    });

    // this.partialPaymentSubscription = this._dataSharingService.isPartPaymentAllow.subscribe(
    //   (partialPayment: boolean) => {
    //     this.isPartialPaymentAllow = partialPayment;
    //   }
    // )
    // this is issue someone assinging company id to the client id (30/04/2021) Ahmed Arshad
    // this.companyID = this._dataSharingService.companyID.subscribe((companyID: number) => {
    //   this.clientID = companyID;
    // });

    this.clientIdSubscription = this._dataSharingService.clientID.subscribe(
      (clientId) => {
        if (clientId && clientId > 0) {
          this.clientID = clientId;
          this.getClientByID(this.clientID);
          this.hascurrencyFormated = true;
        } else {
          this.hascurrencyFormated = true;
        }
        this.searchCustomer();
      }
    );
    //implementation change after discuss with tahir bhai show branch current date not browser date implementaed by fahad dated on 03-03-2021
    this.maxDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

    this.getFundamentals();
  }

  ngOnDestroy() {
    this.clientIdSubscription.unsubscribe();
    this.packageIdSubscription.unsubscribe();

    // this.partialPaymentSubscription.unsubscribe();
  }

  // #region Events

  onEmailUpdated() {
    if (this.saveClient.Email && this.saveClient.Email !== "") {
      this.saveClient.Email = this.saveClient.Email.trim();
      this.verifyCustomer();
    }
    // else {
    //   this.resetForm();
    // }
  }

  onTabChange(event: any) {
    if (event.index == 1) {
      this.saleHistoryRef.getSaleHistory();
    }
  }

  onSaveClient(isValid: boolean) {
    this.setCustomerStateCounty();
    this.submitClient(isValid);
  }

  //set state county name as state county code
  setCustomerStateCounty() {
    this.saveClient.CustomerAddress[0].StateCountyCode = this.saveClient.CustomerAddress[0].StateCountyName;
    this.saveClient.CustomerAddress[1].StateCountyCode = this.saveClient.CustomerAddress[1].StateCountyName;
    this.saveClient.CustomerAddress[2].StateCountyCode = this.saveClient.CustomerAddress[2].StateCountyName;
  }

  onShowImageCropperDialog() {
    const dialogInst = this._dialog.open(ImageEditorPopupComponent, {
      disableClose: true,
      data: {
        height: 200,
        width: 200,
        aspectRatio: 200 / 200,
        showWebCam: true,
      },
    });

    dialogInst.componentInstance.croppedImage.subscribe((img: string) => {
      if (img && img.length > 0) {
        this.saveClient.ImageFile = img;
        this.setClientImage();
        this.saveClientFormData.form.markAsDirty();
      }
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

  onBirthDateChange(date: any) {
    setTimeout(() => {
      this.saveClient.BirthDate = date;
      this.saveClientFormData.form.markAsDirty();
    });
  }

  onReset() {
    this.resetForm();
  }

  onCloseDialog() {
    this.closeDialog.emit(true);
  }
  onProceedToLead() {
    const dialogref = this._dialog.open(AddLeadMembershipComponent, {
      disableClose: true,
      data: {
        CustomerID: this.clientID,
        CustomerTypeID: CustomerType.Client,
        //IsMemberToLead: true
        MemberToLead: true,
      },
    });

    dialogref.componentInstance.isLeadMembershipSaved.subscribe((res: any) => {
      if (res.isSaved) {
        this._router.navigate(["/lead/details/" + this.clientID]);
      }
    });
  }

  onAddMembership() {
    this.getMembershipListFundamentals();
  }

  getMembershipListFundamentals() {
    let params = {
      CustomerID: this.clientID,
    };

    this._httpService
      .get(MemberMembershipApi.getMemberMembershipFundamentals, params)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0 && response.MessageCode != 204) {
            this.hasMemberships =
              response.Result.MembershipWithPaymentPlanList.length > 0
                ? true
                : false;
            this.openAddMembershipDialog();
          } else if (response.MessageCode == 204) {
            this._messageService.showErrorMessage(this.messages.Error.NO_Active_Memberships);
          } else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        },
        (err) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Dropdowns_Load_Error
          );
        }
      );
  }

  openAddMembershipDialog() {
    if (this.hasMemberships) {
      const dialogRef = this._dialog.open(SaveMemberMembershipPopup, {
        disableClose: true,
        data: {
          CustomerID: this.clientID,
          CustomerTypeID: CustomerType.Client,
        },
      });

      dialogRef.componentInstance.membershipSaved.subscribe(
        (isSaved: boolean) => {
          if (isSaved) {
            //this.getMemberMemberships();
            this._router.navigate(['/customer/member/details/' + this.clientID]);
          }
        }
      );
    } else {
      const dialogRef = this._dialog.open(GenericAlertDialogComponent, {
        disableClose: true,
      });
      dialogRef.componentInstance.Message = this.messages.Generic_Messages.Memebrships_Assigned_Alert;
    }
  }

  //Reward Program toggle check if enrolled
  onRewardProgramToggle(ob: MatSlideToggleChange) {
    if (!this.saveClient.RewardProgramAllowed && this.saveClient.IsCustomerEnrolledRewardProgram) {
      ob.source.checked = true;
      this.saveClient.RewardProgramAllowed = true;
      this._messageService.showErrorMessage(this.messages.Error.RewardProgram_Enrolled);
    }
  }

  //Reset Block Classes Counter
  resetBlockCounter(itemType: any) {
    let param = {
      customerID: this.saveClient.CustomerID,
      itemTypeID: itemType
    }
    const dialogRef = this._dialog.open(ConfirmResetCountComponent, {
    });

    dialogRef.componentInstance.confirmChanges.subscribe(isConfirm => {
      if (isConfirm) {
        this._httpService.save(CustomerApi.ResetCancellationNoShowCount, param).subscribe((res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            if (itemType == this.cancelItemType.Class) {
              this.saveClient.ClassResetBy = res.Result.ClassResetBy;
              this.saveClient.ClassResetDate = res.Result.ClassResetDate;
              this.saveClient.ClassLateCancellationCount = res.Result.ClassLateCancellationCount;
              this.saveClient.ClassNoShowCount = res.Result.ClassNoShowCount;
              if (this.saveClient.ClassNoShowCount == 0 || this.saveClient.ClassLateCancellationCount == 0) {
                this.saveClient.IsClassBookingBlocked = false;
              }
            } else {
              this.saveClient.ServiceResetBy = res.Result.ServiceResetBy;
              this.saveClient.ServiceResetDate = res.Result.ServiceResetDate;
              this.saveClient.ServiceLateCancellationCount = res.Result.ServiceLateCancellationCount;
              this.saveClient.ServiceNoShowCount = res.Result.ServiceNoShowCount;
              if (this.saveClient.ServiceNoShowCount == 0 || this.saveClient.ServiceLateCancellationCount == 0) {
                this.saveClient.IsServiceBookingBlocked = false;
              }
            }
            this._messageService.showSuccessMessage(res.Result.MessageText);
          } else {
            this._messageService.showErrorMessage(res.Result.MessageText);
          }

        })
      }
    });



  }

  // #endregion

  // #region Methods

  getFundamentals() {
    this._httpService.get(ClientApi.getFundamentals).subscribe(
      (res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.enquirySourceTypeList = res.Result.EnquirySourceTypeList;
          this.stateList = res.Result.StateCountyList;
          this.countryList = res.Result.CountryList;
          this.isLoadAddressComp = true;
          this.titleList = res.Result.TitleList;
          this.genderList = res.Result.GenderList;
          localStorage.setItem(
            variables.CountryList,
            JSON.stringify(this.countryList)
          );

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

  verifyCustomer() {
    this._httpService
      .save(
        CustomerApi.verifyCustomer +
        "?email=" +
        this.saveClient.Email +
        "&IsFromLead=false",
        null
      )
      .subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode) {
            // Feb 19, 2020 , As per requirement, "If a client is archived then on processing as Client it doesn't redirect to
            // Client details to active that client"
            // If a customer (As for now only client can be archived) is archived within same comapny then -45
            // was being returnd. But according to new functionality instead of -45 there will be -18
            // to verify that archived customer(client)

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
                    : res.MessageData != null
                      ? res.MessageData
                      : res.Result,
              MessageCode: res.MessageCode,
              MessageText: res.MessageText,
              isFromClient: true,
            };

            // implement show proceed popup
            if (customerInfo.MessageCode == -21) {
              if (customerInfo.CustomerTypeID == this.customerType.Member) {
                this.showProceedAsClient(false, "a archived member");
              } else {
                this.showProceedToDialog(
                  customerInfo,
                  AppUtilities.setCustomerTypeMessage(customerInfo),
                  true
                );
              }
            }

            if (res.MessageCode == -18 || res.MessageCode == -46) {
              this.showBranchAssociationPopup(
                AppUtilities.setCustomerTypeMessage(customerInfo)
              );
            } else if (res.MessageCode > 0) {
              this.showDuplicateCustomerMessage(res.Result, res.MessageCode);
              if (this.popupMode) {
                this.closeDialog.emit(true);

                let client = new Client();
                client.Email = this.saveClient.Email;
                client.CustomerID = res.Result.CustomerID;

                this._dataSharingService.shareClientInfo(client);
              } else {
                this.resetForm();
              }
            }
          }
        },
        (err) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Save_Error.replace("{0}", "Client")
          );
        }
      );
  }

  // getCustomerTypeName(customerTypeId: number) {
  //   var ctName = "";
  //   switch (customerTypeId) {
  //     case this.customerType.Client:
  //       ctName = this.customerTypeName.Client;
  //       break;
  //     case this.customerType.Lead:
  //       ctName = this.customerTypeName.Lead;
  //       break;
  //     case this.customerType.Member:
  //       ctName = this.customerTypeName.Member;
  //       break;
  //   }
  //   return ctName;
  // }

  showDuplicateCustomerMessage(customerInfo: any, messageCode: number) {
    switch (customerInfo.CustomerTypeID) {
      case this.customerType.Client:
        // this._messageService.showErrorMessage(this.messages.Error.Duplicate_Customer.replace("{0}", this.customerTypeName.Client));
        if (this.popupMode) {
          this._messageService.showErrorMessage(
            this.messages.Error.Duplicate_Customer.replace(
              "{0}",
              this.customerTypeName.Client
            )
          );
        } else {
          const dialogRef = this._dialog.open(GenericAlertDialogComponent, {
            disableClose: true,
          });
          dialogRef.componentInstance.Message = this.messages.Error.Duplicate_Email;
        }
        break;
      case this.customerType.Lead:
        if (this.popupMode) {
          this._messageService.showErrorMessage(
            this.messages.Error.Duplicate_Customer.replace(
              "{0}",
              this.customerTypeName.Lead
            )
          );
        } else {
          this.showProceedAsClient(
            customerInfo.CanbeProcessedAsClient,
            this.customerTypeName.Lead
          );
        }
        break;
      case this.customerType.Member:
        if (customerInfo.CustomerTypeID == this.customerType.Member) {
          const dialogRef = this._dialog.open(GenericAlertDialogComponent, {
            disableClose: true,
          });
          dialogRef.componentInstance.Message = this.messages.Error.Duplicate_Customer.replace(
            "{0}",
            "member in same branch"
          );
        } else {
          this.showProceedAsClient(
            customerInfo.CanbeProcessedAsClient,
            this.customerTypeName.Member
          );
        }
        break;
    }
  }

  showProceedAsClient(canProceedAsClient: boolean, customerInfo: string) {
    if (canProceedAsClient) {
      this.showBranchAssociationPopup(customerInfo);
    } else if (this.popupMode) {
      this._messageService.showErrorMessage(
        AppUtilities.setCustomerTypeMessage(customerInfo)
      );
    } else {
      const dialogRef = this._dialog.open(GenericAlertDialogComponent, {
        disableClose: true,
      });
      dialogRef.componentInstance.Message = this.messages.Error.Duplicate_Customer.replace(
        "{0}",
        customerInfo
      );
    }
  }


  submitClient(isValid: boolean) {
    if (isValid && this.saveClientFormData.dirty) {
      this.hasSuccess = false;
      this.hasError = false;
      let clientForSave = JSON.parse(JSON.stringify(this.saveClient));
      clientForSave.Email = clientForSave.Email.toLowerCase();
      //remove zone from date
      clientForSave.BirthDate = this._dateTimeService.removeZoneFromDateTime(
        clientForSave.BirthDate
      );
      clientForSave.BirthDate = this._dateTimeService.convertDateObjToString(
        clientForSave.BirthDate,
        this.dateFormatForSave
      );
      this._httpService.save(ClientApi.saveClient, clientForSave).subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode) {
            // this._dataSharingService.returnCurrentBrnachDefaultCountry();
            if (res.MessageCode === -25) {
              this._messageService.showErrorMessage(
                this.messages.Error.Duplicate_Email.replace("{0}", "Client")
              );
            } else if (res.MessageCode > 0) {
              this._messageService.showSuccessMessage(
                this.messages.Success.Save_Success.replace("{0}", "Client")
              );
              this.isExistForms = res.Result.IsFormExists;
              if (this.popupMode) {
                this.closeDialog.emit(true);

                let client = new Client();
                client.FirstName = this.saveClient.FirstName;
                client.LastName = this.saveClient.LastName;
                client.CustomerID = res.Result.CustomerID;

                this._dataSharingService.shareClientInfo(client);
              } else {
                this._router.navigate(['customer/client/details', res.Result.CustomerID]);
                this.setClientImage();
              }

              if (this.saveClient.CustomerID == 0 && this.isExistForms) {
                const dialogRef = this._FormDialogue.open(FillFormComponent, {
                  disableClose: true,
                  data: {
                    customertypeId: this.customerType.Client,
                    customerID: res.Result.CustomerID,
                  },
                });

                //   dialogRef.componentInstance.onFormSubmittion.subscribe((isSubmitted: boolean) => {
                //     if(isSubmitted){
                //       this._messageService.showSuccessMessage("There is pending forms against this customer.");
                //     }
                //  })
              }
            } else {
              this._messageService.showErrorMessage(
                this.messages.Error.Save_Error.replace("{0}", "Client")
              );
            }
          }
        },
        (err) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Save_Error.replace("{0}", "Client")
          );
        }
      );
    }
  }

  trimName() {
    this.saveClient.FirstName = this._trimString.transform(
      this.saveClient.FirstName
    );
    this.saveClient.LastName = this._trimString.transform(
      this.saveClient.LastName
    );
  }

  setClientImage() {
    this.isImageExists = false;
    if (this.saveClient.ImageFile && this.saveClient.ImageFile.length > 0) {
      this.isImageExists = true;
      this.imagePath = "data:image/jpeg;base64," + this.saveClient.ImageFile;
    } else if (
      this.saveClient.ImagePath &&
      this.saveClient.ImagePath.length > 0
    ) {
      this.isImageExists = true;
      this.imagePath =
        this.serverImageAddress.replace(
          "{ImagePath}",
          AppUtilities.setCustomerImagePath()
        ) + this.saveClient.ImagePath;
    }
  }

  getClientByID(clientID: number) {
    setTimeout(() => {

      this._httpService.get(ClientApi.getClientByID + clientID).subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            this.saveClient = res.Result;

            //Client Classes and services reset alert data
            this.saveClient.ClassResetBy = res.Result.ClassResetBy;
            this.saveClient.ClassResetDate = res.Result.ClassResetDate;
            this.saveClient.ClassLateCancellationCount = res.Result.ClassLateCancellationCount;
            this.saveClient.ClassNoShowCount = res.Result.ClassNoShowCount;
            this.saveClient.ServiceResetBy = res.Result.ServiceResetBy;
            this.saveClient.ServiceResetDate = res.Result.ServiceResetDate;
            this.saveClient.ServiceLateCancellationCount = res.Result.ServiceLateCancellationCount;
            this.saveClient.ServiceNoShowCount = res.Result.ServiceNoShowCount;
            this.saveClient.IsCustomerEnrolledRewardProgram = res.Result.IsCustomerEnrolledRewardProgram;

            this.customerAddressCopy = _.cloneDeep(
              this.saveClient.CustomerAddress
            );
            this._commonService.shareLeadInfo(this.saveClient);
            this._router.navigate(['/customer/client/details/' + this.saveClient.CustomerID]);
            this.clientCopy = JSON.parse(JSON.stringify(this.saveClient));
            this.setClientImage();
            this.saveClient.EnquirySourceTypeID =
              this.saveClient.EnquirySourceTypeID == null
                ? undefined
                : this.saveClient.EnquirySourceTypeID;
            this.setSelectedPersonName();
            this.setDefaultDropdowns();
          } else {
            this._messageService.showErrorMessage(
              this.messages.Error.Get_Error.replace("{0}", "Client")
            );
          }
        },
        (err) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Client")
          );
        }
      );
    }, 300);

  }

  showProceedToDialog(
    customerInfo: any,
    _customerTypeMessage: string,
    isCallSubscribeBranch: boolean = false
  ) {
    const confirmDialog = this._dialog.open(AlertConfirmationComponent, {
      disableClose: true,
    });

    confirmDialog.componentInstance.Title = this.messages.Dialog_Title.Proceed_As_Client;
    confirmDialog.componentInstance.Message = _customerTypeMessage;

    confirmDialog.componentInstance.confirmChange.subscribe(
      (isConfirm: boolean) => {
        if (isConfirm) {
          if (isCallSubscribeBranch) {
            //added by fahad multi branc case
            this._httpService
              .save(CustomerApi.subscribeBranch + "?email=" + this.saveClient.Email.trim() + "&IsClient=true" + "&IsFromLead=false", null)
              .subscribe((response: ApiResponse) => {
                if (response.MessageCode > 0) {
                  this.getClientByID(response.MessageCode);
                  this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Client"));
                } else {
                  this._messageService.showSuccessMessage(response.MessageText);
                }
              });
          }
        }
        this.resetForm();
      }
    );
  }

  showBranchAssociationPopup(customerTypeMessage: string) {
    let param = {
      email: this.saveClient.Email,
      isClient: true,
    };

    const dialogRef = this._dialog.open(BranchSubscribeComponent, {
      disableClose: true,
      data: param,
    });

    dialogRef.componentInstance.popUpMessage = customerTypeMessage;

    // if (messageCode == -18) {
    //   dialogRef.componentInstance.popUpMessage = this.messages.Confirmation.Archieved_Proceed_As_Customer.replace("{0}", customerTypeName); //customerTypeName
    // } else {
    //   dialogRef.componentInstance.popUpMessage = message.replace(/Staff/gi, "Customer");
    //   //this.messages.Confirmation.Proceed_As_Customer.replace("{0}", customerTypeName); //customerTypeName
    // }

    dialogRef.componentInstance.isAssociated.subscribe(
      (isAssociated: boolean) => {
        if (isAssociated) {
          if (this.popupMode) {
            let client = new Client();
            client.Email = this.saveClient.Email;
            this._dataSharingService.shareClientInfo(client);

            this.closeDialog.emit(true);
          } else {
            //this.resetForm();
            // Redirect to Client Details Page
            this.rediretToClientDetail(dialogRef.componentInstance.customerId);
          }
        } else {
          this.resetForm();
        }
      }
    );
  }

  rediretToClientDetail(clientId: number) {
    this._router.navigate(["customer/client/details/" + clientId]);
  }

  setDefaultDropdowns() {
    /* If No Title ID is set, then set First Title from title list*/
    //  this.saveClient.Title = (this.saveClient.Title && this.saveClient.Title.length > 0) ? this.saveClient.Title : this.titleList[0];
    this.saveClient.Title = !this.saveClient.Title
      ? undefined
      : this.saveClient.Title;

    // /* If No Source ID is set, then set First Source from source list*/
    // this.saveClient.EnquirySourceTypeID = (this.saveClient.EnquirySourceTypeID && this.saveClient.EnquirySourceTypeID > 0) ? this.saveClient.EnquirySourceTypeID : this.enquirySourceTypeList[0].EnquirySourceTypeID;

    /* If No Gender ID is set, then set First Gender from gender list*/
    this.saveClient.Gender = !this.saveClient.Gender
      ? undefined
      : this.saveClient.Gender;
    //  this.saveClient.Gender = (this.saveClient.Gender && this.saveClient.Gender.length > 0) ? this.saveClient.Gender : this.genderList[0];
  }

  resetForm() {
    if (this.saveClient.CustomerID > 0) {
      this.saveClient = JSON.parse(JSON.stringify(this.clientCopy));
      this.setDefaultDropdowns();
      this.saveClient.EnquirySourceTypeID =
        this.saveClient.EnquirySourceTypeID == null
          ? undefined
          : this.saveClient.EnquirySourceTypeID;
      this.saveClient.CustomerAddress = _.cloneDeep(this.customerAddressCopy);
    } else {
      this.saveClientFormData.resetForm();
      setTimeout(() => {
        this.saveClient = new SaveClient();
        this.hasBillingAddress = false;
        this.setDefaultDropdowns();
        this.imagePath = "";
        this.isImageExists = false;
      }, 1000);
    }
  }

  discardImage() {
    this._commonService
      .deleteFile(
        ENU_Permission_ClientAndMember.SaveClient,
        this.saveClient.CustomerID,
        this.saveClient.ImagePath
      )
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._messageService.showSuccessMessage(
              this.messages.Success.Delete_Success.replace("{0}", "Image")
            );
            this.saveClient.ImageFile = "";
            this.saveClient.ImagePath = "";
            this.clientCopy.imagePath = "";
            this.clientCopy.ImageFile = "";
            this.setClientImage();
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

  // #endregion

  editCustomerEmailDialog() {
    let customerInfo = {
      customerEmail: this.saveClient.Email,
      customerId: this.saveClient.CustomerID,
    };
    const dialogRef = this._dialog.open(EditCustomerEmailComponent, {
      disableClose: true,
      data: customerInfo,
    });
    dialogRef.componentInstance.emailUpdated.subscribe((isUpdated: boolean) => {
      if (isUpdated) {
        this.getClientByID(this.clientID);
      }
    });
  }

  getErrorMessage(saveClientFormData: NgForm) {
    if (saveClientFormData.invalid) {
      if (saveClientFormData.controls.Email?.errors?.pattern) {
        return Messages.Validation.Email_Invalid;
      }
      if (
        saveClientFormData.controls.Mobile?.errors ||
        saveClientFormData.controls.Phone?.errors
      ) {
        return Messages.Validation.Phone_Invalid;
      } else {
        return Messages.Validation.Info_Required;
      }
    }
  }

  searchCustomer() {
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
                  if (this.clientID && this.clientID > 0) {
                    this.allPerson = this.allPerson.filter(
                      (m) => m.CustomerID !== this.clientID
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
            this.saveClient.ReferenceCustomerID = null;
            this.saveClient.ReferenceCustomerName = "";
          }
        }
      });
  }

  displayMemberName(user?: AllPerson): string | undefined {
    return user ? (typeof user === "object" ? user.FullName : user) : undefined;
  }

  onReferredByChange(person: AllPerson) {
    this.getSelectedMemberName(person);
  }

  getSelectedMemberName(person: AllPerson) {
    this.saveClient.ReferenceCustomerID = person.CustomerID;
    this.saveClient.ReferenceCustomerName = person.FullName;
  }

  setSelectedPersonName() {
    if (this.saveClient.CustomerID && this.saveClient.CustomerID > 0) {
      this.fullName = this.saveClient.ReferenceCustomerName;
    } else {
      this.fullName = "";
    }
    this.searchPerson.setValue(this.fullName);
  }
}
