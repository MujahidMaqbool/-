// #region Imports

/********************** Angular Refrences *********************/

import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { SubscriptionLike } from 'rxjs';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************** Component *********************/
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { RescheduleBookingComponent } from '../reschedule-booking/reschedule.booking.component';
import { RedeemMembershipComponent } from '../redeem-membership/redeem.membership.component';
import { ViewFormComponent } from '../forms/view/view.form.component';
import { AttendeeComponent } from 'src/app/attendee/save-search/attendee.component';

/********************** Services & Models *********************/
import { AttendeeClass, ClassAttendanceDetail, ClassInfo, FreeClassesMemberships } from 'src/app/models/attendee.model';
import { ApiResponse, CustomerMemberhsip, DD_Branch, PersonInfo } from 'src/app/models/common.model';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MatDialogService } from '../generics/mat.dialog.service';
import { MessageService } from 'src/app/services/app.message.service';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
import { POSCartItem, POSFormsDetail } from 'src/app/point-of-sale/models/point.of.sale.model';
import { CustomerFormsInfromation, CustomFormView } from 'src/app/models/customer.form.model';
import { CommonService } from 'src/app/services/common.service';
import { HttpService } from 'src/app/services/app.http.service';

/********************** Common *********************/
import { ImagesPlaceholder } from 'src/app/helper/config/app.placeholder';

/**********************  Configurations *********************/
import { ClassStatus, ENU_CancelItemType, ENU_DateFormatName, POSItemType, ENU_Package } from 'src/app/helper/config/app.enums';
import { ClassStatusName, Configurations, DiscountType } from 'src/app/helper/config/app.config';
import { AttendeeApi, CustomerFormApi, PointOfSaleApi, SaleApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';
import { Memberships } from 'src/app/setup/models/custom.form.model';

declare var $: any;

// #endregion

@Component({
  selector: "app-class-reschedule",
  templateUrl: "./class.reschedule.component.html",
})
export class ClassRescheduleComponent
  extends AbstractGenericComponent
  implements OnInit
{
  /*********** region Local Members ****/
  private readonly DATE_FORMAT = "yyyy-MM-dd";

  @Output() isReschedule = new EventEmitter<boolean>();

  shouldGetPersonInfo: boolean = false;
  minDate: Date = new Date();
  isClassSearch: boolean = false;

  oldCustomerMembershipID: number;
  impagePath = ImagesPlaceholder.user;
  dateFormForView: string = "";

  currencyFormat: string;
  classStatus: string = "";
  isClassesExists: boolean = false;

  dateFormatForSearch = "yyyy-MM-dd";
  timeFormat = Configurations.TimeFormatView;
  classDate: string;

  itemTotalPrice: number;
  itemCharges: number;
  tempFormmodel: any = [];

  selectedClassHasBenefits: boolean = true;
  formStatus: string = "normal";
  selectedMemberShipName: string = "";

  TotalEarnedRewardPoints: number = null;
  hasMemberhsip: boolean = false;
  isPurchaseRestrictionAllowed :boolean = false;
  purchaseRestrictionTooltip:boolean = false;

  /***********Model Reference*********/
  personInfo: PersonInfo;
  classInfo: ClassInfo = new ClassInfo();
  newItemPrice: number;

  attendeeClass: AttendeeClass[];
  selectedRescheduledClass: any = [];
  copySelectedRescheduledClass: any = [];

  customerMembershipList: CustomerMemberhsip[];
  freeClassMembershipsList: FreeClassesMemberships[];
  classDetailObj: ClassAttendanceDetail = new ClassAttendanceDetail();

  formsList = new CustomerFormsInfromation();
  formsDetail = new POSFormsDetail();
  freeClassMemberships: FreeClassesMemberships;

  /*********** Configurations *********/
  classStatusType = ClassStatus;
  classStatusTypeName = ClassStatusName;
  bookingType = ENU_CancelItemType;

  discountType = DiscountType;

  /***********Messages*********/
  messages = Messages;

  /* Subsctiptions */
  packageIdSubscription: SubscriptionLike;
  package = ENU_Package;

  constructor(
    public dialogRef: MatDialogRef<ClassRescheduleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dateTimeService: DateTimeService,
    private _dataSharingService: DataSharingService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _openDialog: MatDialogService,
    private _commonService: CommonService,
    private _taxCalculationService: TaxCalculation
  ) {
    super();
  }

  ngOnInit() {
    this.checkPackagePermissions();
    this.getCurrentBranchDetail();
  }

  checkPackagePermissions() {
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
        if (packageId && packageId > 0) {
          this.setPackagePermissions(packageId);
        }
    })
}

setPackagePermissions(packageId: number) {
  switch (packageId) {
      case this.package.Full:
      this.isPurchaseRestrictionAllowed = true;
          break;
  }
}

  toggleRestrictionTooltip() {
    $(".dx-popup-content").addClass('pr-overlay');
   this.purchaseRestrictionTooltip = !this.purchaseRestrictionTooltip;
  }
  /**Method Region start ********/

  async getCurrentBranchDetail() {
    this.classInfo.ClassDate = this.minDate;
    this.minDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
    this.dateFormForView = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);

    this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);

    this.classDate = this._dateTimeService.convertDateObjToString(this.classInfo.ClassDate,this.dateFormatForSearch);
    this.oldCustomerMembershipID = this.data.attendeeObj.CustomerMembershipID;

    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.CurrencySymbol;
    }
    this.setClassStatus();
    this.getRescheduleClasses();
  }

  //this event class when we select the class or change the class
  selectClassToBeSchedule() {
    this.selectedRescheduledClass = JSON.parse(JSON.stringify(this.attendeeClass.filter((s) => s.ClassID == Number(this.classInfo.ClassID))));
    this.copySelectedRescheduledClass = JSON.parse(JSON.stringify(this.selectedRescheduledClass));
    this.getClassAttendanceDetail();
    this.getFormsData();
    this.getCustomerMemberhsips().then(
      (isPromiseResolved: boolean) =>{
        if(isPromiseResolved){
          this.isClassHasMembershipBenfits();
        }
      }
    )

  }

  // here we calculate the sale level discount
  getItemTotalDiscountedPrice( discountedPricePerUnit, saleDiscountPerItemPercentage) {
    if (saleDiscountPerItemPercentage > 0) {
      discountedPricePerUnit -= (discountedPricePerUnit / 100) * saleDiscountPerItemPercentage;
    }
    return this._taxCalculationService.getRoundValue(discountedPricePerUnit);
  }

  //get the details of selected class
  getClassAttendanceDetail() {
    let url = AttendeeApi.getClassAttendanceDetail.replace("{classID}", this.classInfo.ClassID.toString()).replace("{classDate}", this.classDate);
    this._httpService.get(url).subscribe(
      (data) => {
        if (data && data.MessageCode > 0) {
          this.classDetailObj = data.Result;
          this.classDetailObj.StartTime = this._dateTimeService.formatTimeString(this.classDetailObj.StartTime,this.timeFormat);
          this.classDetailObj.EndTime = this._dateTimeService.formatTimeString(this.classDetailObj.EndTime,this.timeFormat);
          this.isClassSearch = true;
          this.setClassStatus();
        } else {
          this._messageService.showErrorMessage(data.MessageText);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Reschedule Class")
        );
      }
    );
  }

  //this method calls when we change the date and loaded classes accordingly.
  onDateChange(date: any) {
    setTimeout(() => {
      this.classDate = this._dateTimeService.convertDateObjToString(date,this.dateFormatForSearch);
      this.classInfo.ClassID = 0;
      this.classDetailObj = new ClassAttendanceDetail();
      this.isClassSearch = false;
      this.hasMemberhsip = false;
      this.data.attendeeObj.CustomerMembershipID = this.customerMembershipList[0].CustomerMembershipID;
      this.getRescheduleClasses();
    });
  }

  //assign class status
  setClassStatus() {
    if (this.data.classDetailObj.IsActive) {
      switch (this.data.classDetailObj.Status) {
        case this.classStatusType.BuyNow:
          this.classStatus = this.classStatusTypeName.Open;
          break;
        case this.classStatusType.Timeout:
          this.classStatus = this.classStatusTypeName.Timeout;
          break;
        case this.classStatusType.Full:
          this.classStatus = this.classStatusTypeName.Full;
          break;
        case this.classStatusType.BookingNotStarted:
          this.classStatus = this.classStatusTypeName.BookingNotStarted;
          break;
      }
    } else {
      this.classStatus = "Cancelled";
    }
  }

  // get the form data and enable the form button if the class has any forms in settings
  getFormsData() {
    this.formsDetail.CustomerID = this.data.attendeeObj.CustomerID;
    this.formsDetail.ItemList = [];
    let itemList: any = {};
    itemList.ItemTypeID = this.bookingType.Class;
    itemList.ItemID = this.selectedRescheduledClass.ClassID;
    this.formsDetail.ItemList.push(itemList);
    this.formsDetail.CustomerBookingIDs = "";

    return this._httpService
      .save(PointOfSaleApi.getFormList, this.formsDetail)
      .toPromise()
      .then(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this.formsList = new CustomerFormsInfromation();
            this.formsList.CustomFormView = response.Result;
            this.formsList.isViewForm = false;
            if (this.formsList.CustomFormView) {
              const formStatusColor = this.formsList.CustomFormView.filter(
                (c) => c.IsMandatory == true
              );
              this.formStatus =
                formStatusColor.length > 0 ? "mandatory" : "non-mandatory";
            }
          }
        },
        (err) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Form")
          );
        }
      );
  }

  //save forms data
  saveForm(filledFormData) {
    filledFormData.forEach((element) => {
      let param = {
        CustomerFormID: element.CustomerFormID,
        CustomerID: this.data.attendeeObj.CustomerID,
        FormID: element.FormID,
        JsonText: element.JsonText,
        FormStatusID: element.FormStatusID,
        IsSkipped: element.IsSkipped,
        FormTypeID: element.FormTypeID,
        FormName: element.FormName,
        Description: element.Description,
      };
      this.tempFormmodel.push(param);
    });
    this._httpService
      .save(CustomerFormApi.saveCustomerForms, this.tempFormmodel)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this._messageService.showSuccessMessage(
            this.messages.Success.Save_Success.replace("{0}", "Customer Form")
          );
        } else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      });
  }
  //onview forms
  onViewForm() {
    if (
      this.formsList.CustomFormView &&
      this.formsList.CustomFormView.length > 0
    ) {
      const dialogRef = this._openDialog.open(ViewFormComponent, {
        disableClose: true,
        data: this.formsList,
      });

      dialogRef.componentInstance.onSubmitForms.subscribe(
        (selectedItems: CustomFormView[]) => {
          this.formsList.CustomFormView = selectedItems;
          this.saveForm(this.formsList.CustomFormView);
        }
      );
    }
  }
  //this method calls when we select the date
  getRescheduleClasses() {
    let params = {
      startDate: this.classDate,
    };
    this._httpService
      .get(AttendeeApi.getAllRescheduleClasses, params)
      .subscribe(
        (data) => {
          if (data && data.MessageCode > 0) {
            this.isClassesExists = data.Result != null && data.Result.length > 0 ? true : false;
            if (this.isClassesExists) {
              this.attendeeClass = JSON.parse(JSON.stringify(data.Result));
              this.attendeeClass.forEach((element: any) => {
                if (element.ClassID == this.data.classDetailObj.ClassID && element.OccurrenceDate == this.data.classDetailObj.StartDate) {
                  this.attendeeClass = this.attendeeClass.filter((x) => x.ClassID != element.ClassID);
                }
                element.StartTime = this._dateTimeService.formatTimeString( element.StartTime, this.timeFormat);
                element.EndTime = this._dateTimeService.formatTimeString( element.EndTime, this.timeFormat);
              });
            } else {
              this.attendeeClass = [];
            }
          } else {
            this._messageService.showErrorMessage(data.MessageText);
          }
        },
        (error) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Reschedule Class")
          );
        }
      );
  }

  // here we check if the customer have any membership against class.
  isClassHasMembershipBenfits() {
    this.getMemberMembershipBenefitsDetail().then(
      (isPromiseResolved: boolean) => {

        if (isPromiseResolved) {
          if (this.data.attendeeObj.CustomerMembershipID && this.data.attendeeObj.CustomerMembershipID > 0 && this.selectedClassHasBenefits)
          {
            var freeClassMemberships = this.freeClassMemberships;
            freeClassMemberships.IsBenefitSuspended = freeClassMemberships.IsBenefitSuspended;

            if (freeClassMemberships != null && freeClassMemberships.IsMembershipBenefit && !freeClassMemberships.IsBenefitSuspended && (freeClassMemberships.RemainingSession > 0 || freeClassMemberships.RemainingSession == null)) {
              if(freeClassMemberships.IsFree) {
                this.itemTotalPrice = 0;
              } else if (!freeClassMemberships.IsFree && freeClassMemberships.DiscountPerncentage) {
                var itemDiscountAmount = this._taxCalculationService.getTwoDecimalDigit((this.selectedRescheduledClass[0].PricePerSession * freeClassMemberships.DiscountPerncentage) / 100 );
                var totalAmountExcludeTax = freeClassMemberships.RemainingSession > 0 || freeClassMemberships.RemainingSession == null || freeClassMemberships.NoLimits ? this.selectedRescheduledClass[0].PricePerSession - itemDiscountAmount : this.selectedRescheduledClass[0].PricePerSession;

                totalAmountExcludeTax = this.getItemTotalDiscountedPrice(totalAmountExcludeTax,this.data.attendeeObj.SaleDiscountPerItemPercentage);

                var itemTotalTaxAmount = this._taxCalculationService.getTaxAmount(this.selectedRescheduledClass[0].TotalTaxPercentage,totalAmountExcludeTax) * 1;
                this.itemTotalPrice = this._taxCalculationService.getRoundValue(Number(totalAmountExcludeTax) + itemTotalTaxAmount);
              }
            } else {
              //if the custmer have membership but remaining sessions are null
              let itemDiscountAmount = 0; //Manage line item discount.
              var totalAmountExcludeTax: any = this.getItemTotalDiscountedPrice(this.selectedRescheduledClass[0].PricePerSession - itemDiscountAmount, this.data.attendeeObj.SaleDiscountPerItemPercentage);
              var itemTotalTaxAmount = this._taxCalculationService.getTaxAmount(this.selectedRescheduledClass[0].TotalTaxPercentage,totalAmountExcludeTax) * 1;
              this.itemTotalPrice = this._taxCalculationService.getRoundValue(Number(totalAmountExcludeTax) + itemTotalTaxAmount);

              // this.data.attendeeObj.CustomerMembershipID = null;
              this.selectedClassHasBenefits = false;
            }
          } else {
            let itemDiscountAmount = 0; //Manage line item discount.
            var totalAmountExcludeTax: any = this.getItemTotalDiscountedPrice(this.selectedRescheduledClass[0].PricePerSession - itemDiscountAmount,this.data.attendeeObj.SaleDiscountPerItemPercentage);
            var itemTotalTaxAmount = this._taxCalculationService.getTaxAmount(this.selectedRescheduledClass[0].TotalTaxPercentage,totalAmountExcludeTax) * 1;
            this.itemTotalPrice = this._taxCalculationService.getRoundValue(Number(totalAmountExcludeTax) + itemTotalTaxAmount);
          }

          if (this.data.isRewardProgramInPackage) {
            this._commonService.getItemRewardPoints(POSItemType.Class,Number(this.classInfo.ClassID),
            this.data.attendeeObj.CustomerID,this.freeClassMemberships ? this.freeClassMemberships?.IsFree: false,
            this.freeClassMemberships ? this.freeClassMemberships?.IsBenefitSuspended : false,
            this.data.attendeeObj.CustomerMembershipID ? true : false )
              .subscribe((response: any) => {
                let cartItem: POSCartItem = new POSCartItem();
                cartItem.AmountSpent = response.Result?.AmountSpent;
                cartItem.MemberBaseEarnPoints = response.Result.MemberBaseEarnPoints ? response.Result.MemberBaseEarnPoints : 0;
                cartItem.CustomerEarnedPoints = response.Result.CustomerEarnedPoints ? response.Result.CustomerEarnedPoints : 0;
                cartItem.DiscountPercentage = this.freeClassMemberships && this.freeClassMemberships?.DiscountPerncentage ? this.freeClassMemberships?.DiscountPerncentage : 0;
                cartItem.IsConsumed = this.data.attendeeObj.CustomerMembershipID && this.data.attendeeObj.CustomerMembershipID > 0 ? false : true;
                cartItem.IsMembershipBenefit = this.data.attendeeObj.CustomerMembershipID && this.data.attendeeObj.CustomerMembershipID > 0 ? true : false;
                cartItem.IsBenefitsSuspended = this.freeClassMemberships && this.freeClassMemberships?.IsBenefitSuspended ? this.freeClassMemberships?.IsBenefitSuspended : false;
                cartItem.ItemTypeID = POSItemType.Class;
                cartItem.TotalAmountIncludeTax = this.itemTotalPrice;

                var personInfo = {
                  CustomerTypeID: this.data.attendeeObj.CustomerTypeID,
                };
                this.TotalEarnedRewardPoints = this._commonService.calculateRewardPointsPerItem(personInfo,cartItem);
              });
          } else {
            this.TotalEarnedRewardPoints = null;
          }
        }
      }
    );
  }

  // onChange membership for members
  onChangeMembership() {
    if (this.selectedRescheduledClass[0]?.ParentClassID) {

      this.isClassHasMembershipBenfits();
    }
  }

  //if the customer exist in multiple or single memberships(if exist in  multiple memberships then shows the popup
  //and user selects the membership and if exist in single membership then we only assign the id)
  getMemberMembershipBenefitsDetail() {
    return new Promise<any>((isPromiseResolved, reject) => {
      try {
        let params = {
          parentClassId: this.selectedRescheduledClass[0].ParentClassID,
          customerId: this.data.attendeeObj.CustomerID,
          classDate: this._dateTimeService.convertDateObjToString(this.selectedRescheduledClass[0].OccurrenceDate,this.DATE_FORMAT),
        };
        this._httpService
          .get(AttendeeApi.getMemberClassDetailWithOtherMemberships, params).subscribe(
            async (response: ApiResponse) => {
              if (response && response.MessageCode > 0) {
                if ((await response.Result) && response.Result.length > 0) {

                  this.freeClassMembershipsList = response.Result;

                  var findSelectedMembershipBenefit = this.freeClassMembershipsList.find((i) => i.CustomerMembershipID == this.data.attendeeObj.CustomerMembershipID);

                  if (findSelectedMembershipBenefit) {
                    if ( this.data.attendeeObj.CustomerMembershipID && this.data.attendeeObj.CustomerMembershipID > 0 ) {
                      if (this.freeClassMembershipsList.length >= 1) {
                        this.freeClassMembershipsList.forEach((element) => {
                          if ( element.CustomerMembershipID == this.data.attendeeObj.CustomerMembershipID) {
                            this.freeClassMemberships = element;
                            this.data.attendeeObj.CustomerMembershipID = element.CustomerMembershipID;
                            this.selectedClassHasBenefits = true;
                            isPromiseResolved(true);
                          }
                        });
                      }
                    } else {
                      this.selectedClassHasBenefits = false;
                      isPromiseResolved(true);
                    }
                  } else {
                    this.selectedClassHasBenefits = false;
                    isPromiseResolved(true);
                  }
                } else {
                  this.selectedClassHasBenefits = false;
                  isPromiseResolved(true);
                }
              } else {
                this._messageService.showErrorMessage(response.MessageText);
              }
            },
            (error) => {
              this._messageService.showErrorMessage(
                this.messages.Error.Get_Error.replace("{0}", "Reschedule Class")
              );
            }
          );
      } catch (err) {
        reject(
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Reschedule Class")
          )
        );
      }
    });
  }

  // here we get the list of member Memberships
  getCustomerMemberhsips() {
    return new Promise<any>((isPromiseResolved, reject) => {
      try {
        let params = {
          parentClassId: this.selectedRescheduledClass[0].ParentClassID,
          customerId: this.data.attendeeObj.CustomerID,
          classDate: this._dateTimeService.convertDateObjToString(this.selectedRescheduledClass[0].OccurrenceDate,this.DATE_FORMAT),
        };

        this._httpService.get(AttendeeApi.getMemberClassDetailWithOtherMemberships, params).subscribe(
          (res: ApiResponse) => {

        if (res && res.MessageCode > 0) {
          this.hasMemberhsip = res.Result && res.Result.length > 0 ? true : false;
          if (this.hasMemberhsip) {
            this.customerMembershipList = res.Result;
            this.data.attendeeObj.CustomerMembershipID = this.customerMembershipList[0].CustomerMembershipID;
            isPromiseResolved(true);
            }
        } else {
          this._messageService.showErrorMessage(res.MessageText);
          isPromiseResolved(false);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Customer Memberhsips"));
        isPromiseResolved(false);
      }
    );
        } catch (err) {
          reject(
            this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Reschedule Class")
            )
          );
        }
    });
  }
   getSelectedMembershipName(){
    let selectedMember = this.customerMembershipList.find((i) =>i.CustomerMembershipID == this.data.attendeeObj.CustomerMembershipID);
    if (selectedMember) {
      return selectedMember.MembershipName;
    }
   }

  //open the reschedule booking dialog and preparing data
  onOpenRescheduleDailog() {

    const dialogRef = this._openDialog.open(RescheduleBookingComponent, {
      disableClose: true,
      data: {
        OldTotalDue: this.data.attendeeObj.TotalDue,
        AmountPaid: this.data.attendeeObj.AmountPaid,
        CancellationCharges: this.itemTotalPrice,
        ItemDiscountedPrice: this.data.attendeeObj.ItemDiscountedPrice,
        CustomerID: this.data.attendeeObj.CustomerID,
        CustomerTypeID: this.data.attendeeObj.CustomerTypeID,
        SaleID: this.data.attendeeObj.SaleID,
        SaleDetailID: this.data.attendeeObj.SaleDetailID,
        ItemID: this.data.attendeeObj.ItemID,
        CancelbookingType: this.bookingType.Class,
        NewItemID: Number(this.classInfo.ClassID),
        NewStartDate: this.classDetailObj.StartDate,
        NewStartTime: this._dateTimeService.formatTimeString(
          this.classDetailObj.StartTime,
          Configurations.TimeFormatView
        ),
        NewEndTime: this._dateTimeService.formatTimeString(
          this.classDetailObj.EndTime,
          Configurations.TimeFormatView
        ),
        CustomerMembershipID: this.selectedClassHasBenefits
          ? this.data.attendeeObj.CustomerMembershipID
          : null,
        DiscountType: this.selectedClassHasBenefits
          ? this.getSelectedMembershipName()
          : "",
        newItemName: this.selectedRescheduledClass[0].Name,
        newItemPricePerSesion: this.selectedRescheduledClass[0].PricePerSession,
        IsShowReturnBenefitToggle:
          this.oldCustomerMembershipID && this.oldCustomerMembershipID > 0
            ? true
            : false,
        ClassRescheduleBenefit: this.data.attendeeObj.ClassRescheduleBenefit,
        TotalEarnedRewardPoints: this.TotalEarnedRewardPoints,
        TotalAdjustment: this.data.attendeeObj.TotalAdjustment,
      },
    });

    dialogRef.componentInstance.isConfirm.subscribe(
      (isRescheduled: boolean) => {
        if (isRescheduled) {
          this.onClosePopup();
          this.isReschedule.emit(true);
          this.openClassAttendeeForm();
        } else {
          // this.searchClassAttendee();
        }
      }
    );
  }

  //onclose reschedule class dialog
  onClosePopup() {
    this.dialogRef.close();
  }

  //oncancel reschedule class dialog
  onCancel() {
    this.isReschedule.emit(false);
    this.onClosePopup();
  }

  //here we open the form dialog
  openClassAttendeeForm() {
    let dialogRef = this._openDialog.open(AttendeeComponent, {
      disableClose: true,
      data: {
        ClassID: this.classDetailObj.ClassID,
        ClassDate: this.classDetailObj.StartDate,
      },
    });
  }

  //onclick reschedule button
  onReschedule() {
    this.onOpenRescheduleDailog();
  }

  /**Method Region end ********/
}
