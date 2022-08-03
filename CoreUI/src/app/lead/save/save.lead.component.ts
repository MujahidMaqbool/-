/********************* Angular References ********************/
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { NgForm, FormControl } from "@angular/forms";
import { SubscriptionLike as ISubscription } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as _ from 'lodash';
import {  debounceTime } from 'rxjs/operators';

/********************* Angular Material References ********************/
import { MatSlideToggleChange } from '@angular/material/slide-toggle';


/********************* Services & Models ********************/
/* Services */
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from 'src/app/services/app.message.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { CommonService } from 'src/app/services/common.service';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { DateTimeService } from 'src/app/services/date.time.service';

/* Models*/
import {  SaveLead, UpdateLead } from 'src/app/lead/models/lead.model';
import { CompanyDetails } from 'src/app/setup/models/company.details.model';
import { ApiResponse, StateCounty } from 'src/app/models/common.model';
import { CustomerAddress, AllPerson } from './../../models/common.model';

/********************** Configuration ***************************/
import { LeadStatusType, CustomerType, ENU_CancelItemType, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { Messages } from 'src/app/helper/config/app.messages';
import { LeadApi, CustomerApi, LeadStatusApi } from 'src/app/helper/config/app.webapi';
import { Configurations, CustomerTypeName } from 'src/app/helper/config/app.config';
import { environment } from 'src/environments/environment';
import { AddressType } from './../../helper/config/app.enums';
import { ENU_Permission_Lead } from 'src/app/helper/config/app.module.page.enums';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { TrimPipe } from 'src/app/shared/pipes/trim';


/**********************Component*********************/
import { MembershipViewComponent } from 'src/app/shared/components/membership-view/membership.view.component';
import { SaleHistoryComponent } from 'src/app/shared/components/sale/sale-history/sale.history.component';
import { AlertConfirmationComponent } from 'src/app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { AddLeadMembershipComponent } from 'src/app/customer-shared-module/add-lead-membership/add.lead.membership.component';
import { ImageEditorPopupComponent } from 'src/app/application-dialog-module/image-editor/image.editor.popup.component';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { ConfirmResetCountComponent } from 'src/app/customer-shared-module/confirm-reset-count/confirm.reset.count.component';
import { FillFormComponent } from 'src/app/shared/components/fill-form/fill.form.component';
import { EditCustomerEmailComponent } from 'src/app/customer-shared-module/edit-email/edit.customer.email.component';
import { GenericAlertDialogComponent } from 'src/app/application-dialog-module/generic-alert-dialog/generic.alert.dialog.component';

@Component({
  selector: 'save-lead',
  templateUrl: './save.lead.component.html'
})

export class SaveLeadComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

  // #region Local Members
  @ViewChild('saveLeadFormData') saveLeadFormData: NgForm;
  @ViewChild('saleHistoryRef') saleHistoryRef: SaleHistoryComponent;

  @Output() closeDialog = new EventEmitter<boolean>();
  @Output() isSaved = new EventEmitter<boolean>();
  @Input() popupMode: boolean = false;
  leadCopy: any;

  pageTitle: string;
  customerId: number;
  defaultCountry: string;
  memberShipId: number = 0;
  isMemberShipSelected: boolean = false;
  isLeadWonOrLost: boolean;
  isImageExists: boolean;
  imagePath: string;
  hasBillingAddress: boolean;
  hasBillingAddressForEdit: boolean;
  isSameBillingAddress: boolean;
  isPartialPaymentAllow: boolean = false;
  hascurrencyFormated: boolean = false;
  currencyFormat: string;
  fullName: string = "";
  dateTimeFormat: string = "";
  dateFormat: string = "";
  timeFormat: string = "";

  /* Messages */
  messages = Messages;
  hasSuccess: boolean = false;
  hasError: boolean = false;
  successMessage: string;
  errorMessage: string;
  isExistForms: boolean;
  /* Model References */
  dialogRef: any;
  saveLeadDataObj: SaveLead = new SaveLead();
  public companyDetails: CompanyDetails = new CompanyDetails();

  leadIDSubscription: ISubscription;
  // partialPaymentSubscription: ISubscription;
  dateFormatForSave = Configurations.DateFormatForSave;
  /* Collection Types */
  membershipList: any;
  enquirySourceTypeList: any;
  staffList: any;
  genderList: string[];
  titleList: string[];
  countryList: any[];
  stateList: StateCounty[];
  stateListByCountryId: StateCounty[];
  stateListByBillingCountryId: StateCounty[];

  /* Configurations */
  addressType = AddressType;
  leadStatusType = LeadStatusType;
  customerType = CustomerType;
  customerTypeName = CustomerTypeName;
  staff: any;
  staffForm: any;

  serverImageAddress = environment.imageUrl;

  maxDate: Date = new Date();
  AppUtilities: any;
  searchPerson: FormControl = new FormControl();
  allPerson: AllPerson[];
  leadID: number = 0;
  leadIdSubscription: any;
  customerAddressCopy: CustomerAddress[] = [];
  cancelItemType = ENU_CancelItemType;
  isLoadAddressComp: boolean = false;

  // #endregion

  constructor(
    private _FormDialogue: MatDialogService,
    private _httpService: HttpService,
    private _viewDialogue: MatDialogService,
    private _dataSharingService: DataSharingService,
    private _dateTimeService: DateTimeService,
    private _messageService: MessageService,
    private _commonService: CommonService,
    private _router: Router,
    private _trimString: TrimPipe,
    private route: ActivatedRoute,
    public _dialog: MatDialogService) {
    super();
  }

  ngOnInit() {
    this.getCurrentBranchDetail();
    this.route.params
      .subscribe(
        (params: Params) => {
          this.saveLeadDataObj.CustomerID = isNaN(parseInt(params['LeadID'])) ? 0 : parseFloat(params['LeadID']);
          if (this.saveLeadDataObj.CustomerID == 0) {
            setTimeout(() => {
              this.resetForm();
            }, 500);
          }
        }
      );

    // this.partialPaymentSubscription = this._dataSharingService.isPartPaymentAllow.subscribe(
    //   (partialPayment: boolean) => {
    //     this.isPartialPaymentAllow = partialPayment;
    //   }
    // )
  }

  ngOnDestroy() {
    this.leadIDSubscription.unsubscribe();
    // this.partialPaymentSubscription.unsubscribe();
  }

  // #region Events

  onEmailUpdated() {
    if (this.saveLeadDataObj.Email && this.saveLeadDataObj.Email !== '') {
      this.saveLeadDataObj.Email = this.saveLeadDataObj.Email.trim();
      this.verifyCustomer();
    }
    // else {
    //   this.resetForm();
    // }
  }

  onMembershipChange() {
    this.isMemberShipSelected = true;
    this.memberShipId = this.saveLeadDataObj.MembershipID;
  }

  onViewMembership() {
    this.openViewMemberShipDialog();
  }


  onShowImageCropperDialog() {
    const dialogInst = this._viewDialogue.open(ImageEditorPopupComponent, {
      disableClose: true,
      data: {
        showWebCam: true,
        height: 200,
        width: 200,
        aspectRatio: 200 / 200,
      }
    });

    dialogInst.componentInstance.croppedImage.subscribe((img: string) => {
      if (img && img.length > 0) {
        this.saveLeadDataObj.ImageFile = img;
        this.setLeadImage();
        this.saveLeadFormData.form.markAsDirty();
      }
    });
  }

  onSaveLead(isValid: boolean) {
    this.setCustomerStateCounty();
    this.saveLead(isValid);
  }
  //set state county name as a state county code
  setCustomerStateCounty(){
    this.saveLeadDataObj.CustomerAddress[0].StateCountyCode = this.saveLeadDataObj.CustomerAddress[0].StateCountyName;
    this.saveLeadDataObj.CustomerAddress[1].StateCountyCode = this.saveLeadDataObj.CustomerAddress[1].StateCountyName;
    this.saveLeadDataObj.CustomerAddress[2].StateCountyCode = this.saveLeadDataObj.CustomerAddress[2].StateCountyName;
  }

  onReset() {
    this.resetForm();
  }

  onBirthDateChange(date: any) {
    setTimeout(() => {
      this.saveLeadDataObj.BirthDate = date;
      this.saveLeadFormData.form.markAsDirty();
    });
  }

  onDeleteImage() {
    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this.discardImage();
      }
    })
  }



  // onRemoveBillingAddress() {
  //   this.saveLeadDataObj.BillingAddress = undefined;
  //   this.hasBillingAddress = false;
  // }

  // #endregion

  // #region Methods

  async getCurrentBranchDetail() {
    this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
    this.dateTimeFormat = this.dateFormat + " | " + this.timeFormat;

    //implementation change after discuss with tahir bhai show branch current date not browser date implementaed by fahad dated on 03-03-2021
    this.maxDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("ISOCode")) {
      this.defaultCountry = branch.ISOCode.toLowerCase();
      this.hascurrencyFormated = true;
    }

    this.isPartialPaymentAllow = await super.isPartPaymentAllow(this._dataSharingService);

    this.leadIDSubscription = this._dataSharingService.leadID.subscribe((leadId: number) => {
      if (leadId && leadId > 0) {
        this.leadID = leadId;
        this.getLeadDetails(leadId);
        this.getFundamentals(false);
        this.hascurrencyFormated = true;
      }
      else {
        //  this.isSameBillingAddress = true;
        //        this.saveLeadDataObj.BillingAddress = new CustomerBillingAddress();
        this.getFundamentals(true);
        this.hascurrencyFormated = true;
      }
      this.searchCustomer()

    });

  }

  getFundamentals(isNewLead: boolean) {
    let params = {
      isNewLead: isNewLead
    }
    this._httpService.get(LeadApi.getFundamentals, params)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.enquirySourceTypeList = res.Result.EnquirySourceTypeList;
          this.titleList = res.Result.TitleList;
          this.genderList = res.Result.GenderList;
          this.countryList = res.Result.CountryList;
          this.stateList = res.Result.StateCountyList;
          this.membershipList = isNewLead ? res.Result.MembershipList : [];
          this.staffList = isNewLead ? res.Result.StaffList : [];
          this.getLeadSetting();
          // as per discussion with fahad default drop down sets when no membership is selected in lead settings
           this.setDefaultDropDowns(isNewLead);
           setTimeout(() => {
            this.isLoadAddressComp = true;
           }, 100);
        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead")); }
      );
  }

  getLeadSetting() {

    this._httpService.get(LeadStatusApi.getLeadSetting)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {

          this.saveLeadDataObj.AssignedToStaffID = response.Result.StaffId;
          this.saveLeadDataObj.MembershipID = response.Result.MembershipId;
          if (this.saveLeadDataObj.MembershipID == 0) {
            this.setDefaultDropDowns(true);
          }
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead Setting"));
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead Setting"));
        });
  }

  getLeadDetails(leadId: number) {
    this._httpService.get(LeadApi.getByID + leadId)
      .subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            this.saveLeadDataObj = res.Result;
            this.setSelectedMemberName();
            this.saveLeadDataObj.EnquirySourceTypeID = this.saveLeadDataObj.EnquirySourceTypeID == null ? undefined : this.saveLeadDataObj.EnquirySourceTypeID;
            this.saveLeadDataObj.IsCustomerEnrolledRewardProgram = res.Result.IsCustomerEnrolledRewardProgram;
            this.isMemberShipSelected = this.saveLeadDataObj.MembershipID && this.saveLeadDataObj.MembershipID > 0 ? true : false;

            this.leadCopy = Object.assign({}, this.saveLeadDataObj);
            this.customerAddressCopy = _.cloneDeep(this.saveLeadDataObj.CustomerAddress)
            this.setLeadImage();
            this.setDefaultDropDowns(false);
          }
          else {
            this._messageService.showErrorMessage(res.MessageText);
          }
        }
      )
  }

  //Reward Program toggle check if enrolled
  onRewardProgramToggle(ob: MatSlideToggleChange) {
    if (!this.saveLeadDataObj.RewardProgramAllowed && this.saveLeadDataObj.IsCustomerEnrolledRewardProgram) {
      ob.source.checked = true;
      this.saveLeadDataObj.RewardProgramAllowed = true;
        this._messageService.showErrorMessage(this.messages.Error.RewardProgram_Enrolled);
    }
  }

  verifyCustomer() {
    this._httpService.save(CustomerApi.verifyCustomer + "?email=" + this.saveLeadDataObj.Email.trim() + '&IsFromLead=true', null)
      .subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode) {

            // let CustomerID = 0
            // if (res.MessageData && res.MessageData.CustomerID) {
            //   CustomerID = res.MessageData.CustomerID;
            // } else if (res.Result && res.Result.CustomerID) {
            //   CustomerID = res.Result.CustomerID;
            // } else {
            //   CustomerID = res.MessageData;
            // }

            // update customerInfo object
            let customerInfo = {
              CustomerID: ((typeof (res.MessageData)) === 'object') && res.MessageData != null ? res.MessageData.CustomerID : ((typeof (res.Result)) === 'object') && res.Result != null ? res.Result.CustomerID : res.MessageData != null ? res.MessageData : res.Result,
              CustomerTypeID: ((typeof (res.MessageData)) === 'object') && res.MessageData != null ? res.MessageData.CustomerTypeID : ((typeof (res.Result)) === 'object') && res.Result != null ? res.Result.CustomerTypeID : res.MessageData != null ? res.MessageData : res.Result,
              MessageCode: res.MessageCode,
              MessageText: res.MessageText,
              isFromLead: true
            }

            // Feb 19, 2020 , As per requirement, "If a client is archived then on processing as Lead it doesn't
            // redirect to process as Lead"
            // If a customer (As for now only client can be archived) is archived within same comapny then -45
            // was being returnd. But according to new functionality instead of -45 there will be -18
            // to verify that archived customer(client)

            if (res.MessageCode == -18 || res.MessageCode == -21 || res.MessageCode == -46) {
              this.showProceedToLeadDialog(customerInfo, AppUtilities.setCustomerTypeMessage(customerInfo), true);
            }
            else if (res.MessageCode > 0) {
              if (res && res.Result && res.Result.IsWalkedIn) {
                this._messageService.showErrorMessage(this.messages.Error.Walked_In_Association);
                this.resetForm();
              }
              else {
                this.showDuplicateCustomerMessage(customerInfo);
                if (this.popupMode) {
                  this.closeDialog.emit(true);
                }
                else if(customerInfo?.CustomerID > 0 && customerInfo?.CustomerTypeID > 0){
                  this.resetForm();
                }
              }
            }
          }else{
            this._messageService.showErrorMessage(res.MessageText);
          }
        },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Lead"));
          this.resetForm();
        }
      )
  }


  showDuplicateCustomerMessage(customerInfo: any) {
    switch (customerInfo.CustomerTypeID) {
      case this.customerType.Client:
        this.showProceedToLeadDialog(customerInfo, AppUtilities.setCustomerTypeMessage(customerInfo), false);
        break;
      case this.customerType.Lead:
        if (this.popupMode) {
          this._messageService.showErrorMessage(this.messages.Error.Duplicate_Customer.replace("{0}", this.customerTypeName.Lead));
        }
        else {
          const dialogRef = this._dialog.open(GenericAlertDialogComponent, { disableClose: true });
          dialogRef.componentInstance.Message = this.messages.Error.Duplicate_Email;
        }
        break;
      case this.customerType.Member:
        this.showProceedToLeadDialog(customerInfo, AppUtilities.setCustomerTypeMessage(customerInfo), false)
        break;
    }
  }

  showProceedToLeadDialog(customerInfo: any, _customerTypeMessage: string, isCallSubscribeBranch: boolean = false) {
    const confirmDialog = this._dialog.open(AlertConfirmationComponent, {
      disableClose: true
    });

    confirmDialog.componentInstance.Title = this.messages.Dialog_Title.Proceed_As_Lead;
    confirmDialog.componentInstance.Message = _customerTypeMessage;

    confirmDialog.componentInstance.confirmChange.subscribe((isConfirm: boolean) => {
      if (isConfirm) {
        if (isCallSubscribeBranch) {
          //added by fahad multi branc case
          this._httpService.save(CustomerApi.subscribeBranch + '?email=' + this.saveLeadDataObj.Email.trim() + '&IsClient=true' + '&IsFromLead=true', null)
            .subscribe((response: ApiResponse) => {
              this.customerId = response.MessageCode && response.MessageCode > 0? response.MessageCode : customerInfo.CustomerID;
              this.getLeadDetails(this.customerId);
            })
        }
        this.openProceedAsLeadDialog(customerInfo);
      }
      this.resetForm();
    })
  }

  // setCustomerTypeMessage(responseMessage: any): string {
  //   var _customerTypeMessage = AppUtilities.setCustomerTypeMessage(responseMessage);
  //   switch (responseMessage.MessageCode) {
  //     case -18:
  //       _customerTypeMessage = this.messages.Confirmation.Archieved_Proceed_As_Lead.replace("{0}", _customerTypeMessage);
  //       break;

  //     case -46:
  //       _customerTypeMessage = responseMessage.MessageText.replace(/Staff/gi, "Customer")
  //       break;

  //     default:
  //       _customerTypeMessage = this.messages.Confirmation.Proceed_As_Lead.replace("{0}", _customerTypeMessage);
  //       break

  //   }
  //   return _customerTypeMessage;
  // }

  openProceedAsLeadDialog(customerInfo: any) {
    const dialogref = this._dialog.open(AddLeadMembershipComponent,
      {
        disableClose: true,
        data: {
          CustomerTypeID: customerInfo.CustomerTypeID,
          CustomerID: customerInfo.CustomerID,
          IsMemberToLead: false
        }
      });

    dialogref.componentInstance.isLeadMembershipSaved.subscribe((res: any) => {
      if (res.isSaved) {
        setTimeout(() => {
          if (customerInfo.CustomerTypeID == this.customerType.Member) {
            if (res.messageCode == 1) {
              this._router.navigate(['/lead/details/' + customerInfo.CustomerID]);
            } else
              if (customerInfo.messageCode == -46) {
                this._router.navigate(['/lead/details/' + customerInfo.CustomerID]);
              }
              else {
                this._router.navigate(['customer/member/details/' + customerInfo.CustomerID]);
              }
          }
          else if (customerInfo.CustomerTypeID == this.customerType.Client) {
            if (res.messageCode == 1) {
              this._router.navigate(['/lead/details/' + customerInfo.CustomerID]);
            } else
              if (customerInfo.messageCode == -46) {
                this._router.navigate(['/lead/details/' + customerInfo.CustomerID]);
              } else if (customerInfo.messageCode == -18) {
                this._router.navigate(['/lead/details/' + customerInfo.CustomerID]);
              } else {
                this._router.navigate(['customer/client/details/' + customerInfo.CustomerID]);
              }
          }
        })
      }
    });
  }

  createLead() {
    this.saveLeadDataObj.Email = this.saveLeadDataObj.Email.toLowerCase();
    if (this.saveLeadDataObj.MembershipID == 0) {
      this.saveLeadFormData.form.setErrors({ 'invalid': true });
      return;
    }
    this._httpService.save(LeadApi.save, this.setModelForSave())
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode) {
          if (res.MessageCode === -25) {
            this._messageService.showErrorMessage(this.messages.Error.Duplicate_Email.replace("{0}", "Lead"));
          }
          else if (res.MessageCode > 0) {
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Lead"));
            this.isExistForms = res.Result.IsFormExists;
            if (this.popupMode) {
              this.closeDialog.emit(true);
              this.isSaved.emit(true);
            }
            else {
              this._router.navigate(['/lead/details',res.Result.CustomerID]);
            }
            if (this.isExistForms) {
              this._FormDialogue.open(FillFormComponent, {
                disableClose: true,
                data: {
                  customertypeId: this.customerType.Lead,
                  customerID: res.Result.CustomerID // sale ID as Customer id
                }
              });
            }
          }
          else {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead"));
          }
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead")); }
      );
  }



  updateLead() {
    this.hasSuccess = false;
    this.hasError = false;
    this.saveLeadDataObj.Email = this.saveLeadDataObj.Email.toLowerCase();
    this._httpService.save(LeadApi.update, this.setModelForUpdate())
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode) {
          if (res.MessageCode === -25) {
            this._messageService.showErrorMessage(this.messages.Error.Duplicate_Email.replace("{0}", "Lead"));
          }
          else if (res.MessageCode > 0) {
            if (this.popupMode) {
              this.closeDialog.emit(true);
            }
            else {
              // should stay on details screen/tab when any changes are saved in customer profileand not route back to customers listing screen
              //this._router.navigate(['/lead/search']);
              this.setLeadImage();
            }

            this.isSaved.emit(true);

            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Lead"));

          }
          else {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead"));
          }
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Lead")); }
      );
  }

  saveLead(isvalid: boolean) {
    if (!this.isLeadWonOrLost && isvalid && this.saveLeadFormData.dirty) {
      this.hasSuccess = false;
      this.hasError = false;
      if (this.saveLeadDataObj.CustomerID > 0) {
        this.updateLead();
      }
      else {
        this.createLead();
      }
    }
  }

  trimName() {
    this.saveLeadDataObj.FirstName = this._trimString.transform(this.saveLeadDataObj.FirstName);
    this.saveLeadDataObj.LastName = this._trimString.transform(this.saveLeadDataObj.LastName);
  }

  openViewMemberShipDialog() {

    var data = {
      MembershipID: this.saveLeadDataObj.MembershipID,
      CustomerMembershipID: 0
    };

    this.dialogRef = this._viewDialogue.open(MembershipViewComponent,
      {
        disableClose: true,
        data: data,
      });
  }

  setModelForSave() {
    let saveLead = new SaveLead();
    saveLead.CustomerID = this.saveLeadDataObj.CustomerID;
    saveLead.AssignedToStaffID = this.saveLeadDataObj.AssignedToStaffID;
    saveLead.Title = this.saveLeadDataObj.Title;
    saveLead.FirstName = this.saveLeadDataObj.FirstName;
    saveLead.LastName = this.saveLeadDataObj.LastName;
    saveLead.Gender = this.saveLeadDataObj.Gender;
    saveLead.Email = this.saveLeadDataObj.Email;
    saveLead.Mobile = this.saveLeadDataObj.Mobile;
    saveLead.Phone = this.saveLeadDataObj.Phone;
    saveLead.Description = this.saveLeadDataObj.Description;
    saveLead.Address1 = this.saveLeadDataObj.Address1;
    saveLead.Address2 = this.saveLeadDataObj.Address2;
    saveLead.CountryID = this.saveLeadDataObj.CountryID;
    saveLead.StateCountyName = this.saveLeadDataObj.StateCountyName;
    //saveLead.StateCountyID = this.saveLeadDataObj.StateCountyID;
    saveLead.EnquirySourceTypeID = this.saveLeadDataObj.EnquirySourceTypeID;
    saveLead.CityName = this.saveLeadDataObj.CityName;
    saveLead.PostCode = this.saveLeadDataObj.PostCode;
    saveLead.EmailAllowed = this.saveLeadDataObj.EmailAllowed;
    saveLead.SMSAllowed = this.saveLeadDataObj.SMSAllowed;
    saveLead.PhoneCallAllowed = this.saveLeadDataObj.PhoneCallAllowed;
    saveLead.PostalMailAllowed = this.saveLeadDataObj.PostalMailAllowed;
    saveLead.FirstAidAllowed = this.saveLeadDataObj.FirstAidAllowed;
    saveLead.MembershipID = this.saveLeadDataObj.MembershipID;
    saveLead.ImagePath = this.saveLeadDataObj.ImagePath;
    saveLead.ImageFile = this.saveLeadDataObj.ImageFile;
    // saveLead.BirthDate = this._dateTimeService.convertDateObjToString(this.saveLeadDataObj.BirthDate, this.dateFormatForSave);
    saveLead.BirthDate = this.saveLeadDataObj.BirthDate;
    //  saveLead.BillingAddress = this.saveLeadDataObj.BillingAddress;
    saveLead.AllowPartPaymentOnCore = this.saveLeadDataObj.AllowPartPaymentOnCore;
    saveLead.AllowPartPaymentOnWidget = this.saveLeadDataObj.AllowPartPaymentOnWidget;
    saveLead.ReferenceCustomerID = this.saveLeadDataObj.ReferenceCustomerID;
    saveLead.ReferenceCustomerName = this.saveLeadDataObj.ReferenceCustomerName;
    saveLead.Occupation = this.saveLeadDataObj.Occupation;
    saveLead.CompanyName = this.saveLeadDataObj.CompanyName;
    saveLead.CustomerAddress = [...this.saveLeadDataObj.CustomerAddress];
    return saveLead;
  }

  setModelForUpdate() {
    let updateLead = new UpdateLead();

    updateLead.CustomerID = this.saveLeadDataObj.CustomerID;
    updateLead.Title = this.saveLeadDataObj.Title;
    updateLead.FirstName = this.saveLeadDataObj.FirstName;
    updateLead.LastName = this.saveLeadDataObj.LastName;
    updateLead.Gender = this.saveLeadDataObj.Gender;
    updateLead.Email = this.saveLeadDataObj.Email;
    updateLead.Mobile = this.saveLeadDataObj.Mobile;
    updateLead.Phone = this.saveLeadDataObj.Phone;
    updateLead.Description = this.saveLeadDataObj.Description;
    updateLead.EnquirySourceTypeID = this.saveLeadDataObj.EnquirySourceTypeID;
    // updateLead.IsActive = this.saveLeadDataObj.IsActive;
    updateLead.Address1 = this.saveLeadDataObj.Address1;
    updateLead.Address2 = this.saveLeadDataObj.Address2;
    updateLead.StateCountyName = this.saveLeadDataObj.StateCountyName;
    updateLead.CountryID = this.saveLeadDataObj.CountryID;
    updateLead.CityName = this.saveLeadDataObj.CityName;
    updateLead.PostCode = this.saveLeadDataObj.PostCode;
    updateLead.ImageFile = this.saveLeadDataObj.ImageFile;
    updateLead.ImagePath = this.saveLeadDataObj.ImagePath;
    updateLead.EmailAllowed = this.saveLeadDataObj.EmailAllowed;
    updateLead.SMSAllowed = this.saveLeadDataObj.SMSAllowed;
    updateLead.PhoneCallAllowed = this.saveLeadDataObj.PhoneCallAllowed;
    updateLead.PostalMailAllowed = this.saveLeadDataObj.PostalMailAllowed;
    updateLead.RewardProgramAllowed = this.saveLeadDataObj.RewardProgramAllowed;
    updateLead.FirstAidAllowed = this.saveLeadDataObj.FirstAidAllowed;
    //updateLead.BirthDate = this._dateTimeService.convertDateObjToString(this.saveLeadDataObj.BirthDate, this.dateFormatForSave);
    updateLead.BirthDate = this.saveLeadDataObj.BirthDate;
    // updateLead.BillingAddress = this.saveLeadDataObj.BillingAddress;
    updateLead.AllowPartPaymentOnCore = this.saveLeadDataObj.AllowPartPaymentOnCore;
    updateLead.AllowPartPaymentOnWidget = this.saveLeadDataObj.AllowPartPaymentOnWidget;
    updateLead.ReferenceCustomerID = this.saveLeadDataObj.ReferenceCustomerID;
    updateLead.ReferenceCustomerName = this.saveLeadDataObj.ReferenceCustomerName;
    updateLead.Occupation = this.saveLeadDataObj.Occupation;
    updateLead.CompanyName = this.saveLeadDataObj.CompanyName;
    updateLead.PushNotificationAllowed = this.saveLeadDataObj.PushNotificationAllowed;
    updateLead.CustomerAddress = [...this.saveLeadDataObj.CustomerAddress];
    return updateLead;
  }

  setLeadImage() {
    this.isImageExists = false;
    if (this.saveLeadDataObj.ImageFile && this.saveLeadDataObj.ImageFile.length > 0) {
      this.isImageExists = true;
      this.imagePath = "data:image/jpeg;base64," + this.saveLeadDataObj.ImageFile;
    }
    else if (this.saveLeadDataObj.ImagePath && this.saveLeadDataObj.ImagePath.length > 0) {
      this.isImageExists = true;
      this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setCustomerImagePath()) + this.saveLeadDataObj.ImagePath;
    }
  }

  setDefaultDropDowns(isNewLead: boolean) {
    /* If No Title ID is set, then set First Title from title list*/
    this.saveLeadDataObj.Title = !this.saveLeadDataObj.Title ? undefined : this.saveLeadDataObj.Title;

    /* If No Gender ID is set, then set First Gender from gender list*/
    this.saveLeadDataObj.Gender = !this.saveLeadDataObj.Gender ? undefined: this.saveLeadDataObj.Gender;

    /* If No Source ID is set, then set First Source from source list*/

    if (isNewLead) {
      /* If No Membership ID is set, then set First MembershipID from Membership list*/
      if (this.membershipList && this.membershipList.length > 0) {
        this.saveLeadDataObj.MembershipID = this.membershipList[0].MembershipID;
        this.isMemberShipSelected = true;
      }

      /* If No Staff ID is set, then set First StaffID from Staff list*/
      if (this.staffList && this.staffList.length > 0) {
        this.saveLeadDataObj.AssignedToStaffID = this.staffList[0].StaffID;
      }
    }
  }

  resetForm() {
    if (this.saveLeadDataObj.CustomerID > 0) {
      this.saveLeadDataObj = Object.assign({}, this.leadCopy);
      this.saveLeadDataObj.EnquirySourceTypeID = this.saveLeadDataObj.EnquirySourceTypeID == null ? undefined : this.saveLeadDataObj.EnquirySourceTypeID;
      this.saveLeadDataObj.CustomerAddress = _.cloneDeep(this.customerAddressCopy);
      this.setDefaultDropDowns(false);
    }
    else {
      this.saveLeadFormData.resetForm();
      setTimeout(() => {
        //  this.saveLeadDataObj.BillingAddress = new AddressModel();
        this.hasBillingAddress = false;
        this.imagePath = '';
        this.isImageExists = false;
        this.saveLeadDataObj = new SaveLead();
        this.setDefaultDropDowns(true);
        this.getLeadSetting();
        this.saveLeadDataObj.EnquirySourceTypeID = this.saveLeadDataObj.EnquirySourceTypeID == null ? undefined : this.saveLeadDataObj.EnquirySourceTypeID;
      });
    }
  }

  discardImage() {
    this._commonService.deleteFile(ENU_Permission_Lead.Save, this.saveLeadDataObj.CustomerID, this.saveLeadDataObj.ImagePath)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Image"));
          this.saveLeadDataObj.ImageFile = "";
          this.saveLeadDataObj.ImagePath = "";
          this.leadCopy.ImageFile = "";
          this.leadCopy.ImagePath = "";
          this.setLeadImage();
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image"));
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Image")); }
      );
  }


  editCustomerEmailDialog() {
    let customerInfo = {
      customerEmail: this.saveLeadDataObj.Email,
      customerId: this.saveLeadDataObj.CustomerID
    }
    const dialogRef = this._dialog.open(EditCustomerEmailComponent, {
      disableClose: true,
      data: customerInfo
    });
    dialogRef.componentInstance.emailUpdated.subscribe((isUpdated: boolean) => {
      if (isUpdated) {
        this.getLeadDetails(this.saveLeadDataObj.CustomerID)
      }
    });

  }


  getErrorMessage(saveLeadFormData: NgForm) {
    if (saveLeadFormData.invalid) {

      if (saveLeadFormData.controls.Email?.errors?.pattern) {
        return Messages.Validation.Email_Invalid;
      }
      if (saveLeadFormData.controls.Mobile?.errors || saveLeadFormData.controls.Phone?.errors) {
        return Messages.Validation.Phone_Invalid;
      } if (this.saveLeadDataObj.AssignedToStaffID == 0 || this.saveLeadDataObj.MembershipID == 0) {
        return Messages.Validation.Lead_Assignged_membership_Selection;
      } else {
        return Messages.Validation.Info_Required;
      }
    }
  }

  setSelectedMemberName() {
    if (this.saveLeadDataObj.CustomerID && this.saveLeadDataObj.CustomerID > 0) {
      this.fullName = this.saveLeadDataObj.ReferenceCustomerName;
    }
    else {
      this.fullName = "";
    }
    this.searchPerson.setValue(this.fullName);
    this.searchPerson.updateValueAndValidity();
  }
  searchCustomer() {
    this.searchPerson.valueChanges
      .pipe(debounceTime(400))
      .subscribe(searchText => {
        if (searchText && searchText !== "" && searchText.length > 2) {
          if (typeof (searchText) === "string") {
            this._commonService.searchClient(searchText, 0)
              .subscribe(
                response => {
                  if (response.Result != null && response.Result.length) {
                    this.allPerson = response.Result;
                    this.allPerson.forEach(person => {
                      person.FullName = person.FirstName + " " + person.LastName;
                    });
                    if (this.leadID && this.leadID > 0) {
                      this.allPerson = this.allPerson.filter(m => m.CustomerID !== this.leadID);
                    }
                  }
                  else {
                    this.allPerson = [];
                  }
                });
          }
        }
        else {
          this.allPerson = [];
          if (typeof (searchText) === "string" && searchText.trim() === "") {
            this.saveLeadDataObj.ReferenceCustomerID = null;
            this.saveLeadDataObj.ReferenceCustomerName = "";
          }
        }
      });

  }

  displayMemberName(user?: AllPerson): string | undefined {
    return user ? typeof (user) === "object" ? user.FullName : user : undefined;
  }
  onReferredByChange(person: AllPerson) {
    this.getSelectedMemberName(person);
  }

  getSelectedMemberName(person: AllPerson) {
    this.saveLeadDataObj.ReferenceCustomerID = person.CustomerID;
    this.saveLeadDataObj.ReferenceCustomerName = person.FullName;
  }
  setSelectedPersonName() {
    if (this.saveLeadDataObj.CustomerID && this.saveLeadDataObj.CustomerID > 0) {
      this.fullName = this.saveLeadDataObj.ReferenceCustomerName;
    }
    else {
      this.fullName = "";
    }
    this.searchPerson.setValue(this.fullName);
  }

   //Reset Block Classes Counter
   resetBlockCounter(itemType: any) {
    let param = {
      customerID: this.saveLeadDataObj.CustomerID,
      itemTypeID: itemType
    }
    const dialogRef = this._dialog.open(ConfirmResetCountComponent, {
    });

    dialogRef.componentInstance.confirmChanges.subscribe(isConfirm => {
      if (isConfirm) {
        this._httpService.save(CustomerApi.ResetCancellationNoShowCount, param).subscribe((res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            if (itemType == this.cancelItemType.Class) {
              this.saveLeadDataObj.ClassResetBy = res.Result.ClassResetBy;
              this.saveLeadDataObj.ClassResetDate = res.Result.ClassResetDate;
              this.saveLeadDataObj.ClassLateCancellationCount = res.Result.ClassLateCancellationCount;
              this.saveLeadDataObj.ClassNoShowCount = res.Result.ClassNoShowCount;
              if (this.saveLeadDataObj.ClassNoShowCount == 0 || this.saveLeadDataObj.ClassLateCancellationCount == 0) {
                this.saveLeadDataObj.IsClassBookingBlocked = false;
              }
            } else {
              this.saveLeadDataObj.ServiceResetBy = res.Result.ServiceResetBy;
              this.saveLeadDataObj.ServiceResetDate = res.Result.ServiceResetDate;
              this.saveLeadDataObj.ServiceLateCancellationCount = res.Result.ServiceLateCancellationCount;
              this.saveLeadDataObj.ServiceNoShowCount = res.Result.ServiceNoShowCount;
              if (this.saveLeadDataObj.ServiceNoShowCount == 0 || this.saveLeadDataObj.ServiceLateCancellationCount == 0) {
                this.saveLeadDataObj.IsServiceBookingBlocked = false;
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
}
