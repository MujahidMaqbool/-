/********************** Angular Refrences *********************/
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription, SubscriptionLike as ISubscription } from "rxjs";

/********************* Material:Refference ********************/
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';


/********************** Services & Models *********************/
/* Models */
import { Configurations, DiscountType, SaleArea } from '@app/helper/config/app.config';
import { AllWaitlist, ApiResponse, CustomerWaitlistSearchParameter, PersonDetail, WaitlistItemList } from '@app/models/common.model';
import { CustomerType, ENU_DateFormatName, ENU_Package, ENU_WaitListBookingType, POSItemType, WaitlistStatusType } from '@app/helper/config/app.enums';
import { PersonInfo } from '@app/models/common.model';
import { CustomerMembership } from '@app/attendance/models/member.attendance.model';
import { ServiceBenefitsPackage } from '@app/scheduler/models/service.model';

/* Services */
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { CommonService } from '@app/services/common.service';
import { Messages } from '@app/helper/config/app.messages';
import { AttendeeApi, PersonInfoApi, SaleApi, WaitlistAPI } from '@app/helper/config/app.webapi';
import { DataSharingService } from '@app/services/data.sharing.service';
import { TaxCalculation } from '@app/services/tax.calculations.service';
import { DateTimeService } from '@app/services/date.time.service';

/********************** Component *********************/
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { POSPaymentComponent } from '@app/shared/components/sale/payment/pos.payment.component';
import { ClassAttendanceDetail, FreeClassesMemberships } from '@app/models/attendee.model';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { Router } from '@angular/router';
import { WaitlistServiceDetailComponent } from '../waitlist-service-detail/waitlist.service.detail.component';
import { ENU_Permission_ClientAndMember, ENU_Permission_Lead, ENU_Permission_Module, ENU_Permission_PointOfSale } from '@app/helper/config/app.module.page.enums';
import { AuthService } from '@app/helper/app.auth.service';
import { RedeemMembershipComponent } from '@app/shared/components/redeem-membership/redeem.membership.component';

@Component({
  selector: 'app-wait-list',
  templateUrl: './wait-list.component.html',
})
export class WaitListComponent extends AbstractGenericComponent implements OnInit, AfterViewInit, OnDestroy {

  // #region Local Members
  @ViewChild("appPagination") appPagination: AppPaginationComponent;
  @ViewChild("waitlistDateSearch") waitlistDateSearch: DateToDateFromComponent;

  searchWaitList: any;
  dateFromPlaceHolder: string = "Select Waitlist Request Date";
  dateToPlaceHolder: string = "Select Waitlist Request Date";
  classDetailObj: ClassAttendanceDetail = new ClassAttendanceDetail();

  dateFormat: string = ""; //Configurations.DateFormat;
  isDataExists: boolean;
  sortOrder: string;
  shouldGetPersonInfo: boolean = false;
  customerID: number = 0;
  customerType: number;
  currentDate: Date;
  currencyFormat: string;
  isWaitlistStatus: boolean = false;
  isPOSHistory: boolean = false;
  commonServiceResponse: any = {};
  timeFormat = Configurations.TimeFormatView;
  dateFormatForSearch = 'yyyy-MM-dd';
  private readonly DATE_FORMAT = "yyyy-MM-dd";

  _serviceDataSelection: any;

  /* Dialog Reference */
  deleteDialogRef: any;
  viewDialogRef: any;

  /* Collection And Models */
  customerMemberhsip: CustomerMembership[];
  serviceBenefitsDetail: ServiceBenefitsPackage[];
  serviceBenefitsPackage: ServiceBenefitsPackage[];
  personInfo: PersonInfo;
  personDetail: any;//PersonDetail = new PersonDetail();
  waitlistStatusType = Configurations.CustomerServiceWaitlistStatuses;
  waitlistBookingType = Configurations.WaitListItemType;
  waitListSearchParameter: CustomerWaitlistSearchParameter = new CustomerWaitlistSearchParameter();
  sortOrder_ASC = Configurations.SortOrder_ASC;
  sortOrder_DESC = Configurations.SortOrder_DESC;
  discountType = DiscountType;
  waitlistStatus = WaitlistStatusType;
  allWaitlists: AllWaitlist[];
  timeFormatDifference = Configurations.TimeFormat;
  bookingStatusType = ENU_WaitListBookingType;
  posItemType = POSItemType
  classDate:any;
  /* Subsctiptions */
  customerIdSubscription: ISubscription;
  customerTypeSubscription: ISubscription;
  packageIdSubscription: ISubscription;
  enumCustomerType = CustomerType;
  activityPersonInfo: ISubscription;
  /* Messages */
  messages = Messages;

  package = ENU_Package;

  hasClassesAndServices:boolean = false;
  hasClassesInPackage:boolean = false;
  hasServiceInPackage:boolean = false;
  hasRewardProgramInPackage: boolean = false;

  allowedPages = {
    isSaveAllow: false,
  };

  constructor(
    private _httpService: HttpService,
    public _commonService: CommonService,
    private _dataSharingService: DataSharingService,
    private _taxCalculationService: TaxCalculation,
    private _dateTimeService: DateTimeService,
    private _openDialog: MatDialogService,
    private route: Router,
    private _messageService: MessageService,
    private _authService: AuthService,) {
    super();
  }

  //#region events
  ngOnInit(): void {
    this.customerID = this.route.url.split('/').length > 3 ? Number(this.route.url.split('/')[4]) : null;
    this.isPOSHistory = this.customerID == null ? true : false;

    this.getCurrentBranchDetail();

  }

  ngAfterViewInit() {
    this.waitlistDateSearch.setEmptyDateFilter();
  }

  ngOnDestroy() {
    this.customerIdSubscription?.unsubscribe();
    this.customerTypeSubscription?.unsubscribe();

    this.packageIdSubscription?.unsubscribe();
    this.activityPersonInfo?.unsubscribe();

  }
  //#endregion

  //#region methods

  checkPackagePermissions() {
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
        if (packageId && packageId > 0) {
            this.setPackagePermissions(packageId);
        }
    })
}

setPackagePermissions(packageId: number) {
    this.hasClassesAndServices = false;
    this.hasClassesInPackage = false;
    this.hasServiceInPackage = false;
    this.hasRewardProgramInPackage = false;

    switch (packageId) {
        case this.package.WellnessBasic:
          this.hasServiceInPackage = true;
            break;
        case this.package.WellnessMedium:
          this.hasServiceInPackage = true;
            break;
        case this.package.WellnessTop:
            this.hasClassesAndServices = false;
            this.hasClassesInPackage = false;
            this.hasServiceInPackage = true;
            break;
        case this.package.FitnessBasic:
            this.hasClassesInPackage = true;
            break;
        case this.package.FitnessMedium:
            this.hasClassesAndServices = false;
            this.hasClassesInPackage = true;
            this.hasServiceInPackage = false;
            break;
        case this.package.Full:
            this.hasClassesAndServices = true;
            this.hasClassesInPackage = true;
            this.hasServiceInPackage = true;
            this.hasRewardProgramInPackage = true;
            break;
    }

    this.setBookingTypeID();
    this.setPermissions();
  }

    /**set permissions for add , edit and view button */
  setPermissions() {
    if(this.isPOSHistory){
      this.allowedPages.isSaveAllow = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.SaveWaitList);
    }
    else if (this.customerType == CustomerType.Member) {
        this.allowedPages.isSaveAllow = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.WaitList_Save);
    }
    else if (this.customerType == CustomerType.Client) {
        this.allowedPages.isSaveAllow = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.WaitList_Save);
    }
    else if (this.customerType == CustomerType.Lead) {
        this.allowedPages.isSaveAllow = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.WaitList_Save);
    }
  }

  setBookingTypeID() {

    if (!this.hasClassesAndServices) {
        if (this.hasClassesInPackage) {
          this.waitListSearchParameter.ItemTypeID = this.waitlistBookingType.find(i => i.ItemTypeID === 1).ItemTypeID;
          this.waitlistBookingType = this.waitlistBookingType.filter(i => i.ItemTypeID === 1);
        }
        else if (this.hasServiceInPackage) {
            this.waitListSearchParameter.ItemTypeID = this.waitlistBookingType.find(i => i.ItemTypeID === 2).ItemTypeID;
            this.waitlistBookingType = this.waitlistBookingType.filter(i => i.ItemTypeID === 2)
        }

        this.onBookingTypeChange();
    } else{
      this.waitListSearchParameter.ItemTypeID = 0;
    }
  }


  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    this.classDate =  await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

    if (branch && branch.hasOwnProperty("Currency")) {
      this.currencyFormat = branch.CurrencySymbol;
    }
    this.dateFormat = await super.getBranchDateFormat(
      this._dataSharingService,
      ENU_DateFormatName.DateFormat
    );

    if (this.customerID != null) {
      this.getCustomerType();
      this.getCustomerId();
    } else {
      this.checkPackagePermissions();
      this.getAllWaitlist();
    }
  }

  /* Method to get Customer Type */
  getCustomerType() {
    this.customerTypeSubscription = this._dataSharingService.customerTypeID.subscribe(customerType => {
      this.customerType = customerType;
      this.checkPackagePermissions();
    })
  }

  getCustomerId() {
    this.customerIdSubscription = this._dataSharingService.customerID.subscribe(customerId => {
      if (customerId > 0) {
        this.customerID = customerId;
        //set PersonID and PersonTypeID for personInfo
        this.personInfo = new PersonInfo();
        this.personInfo.PersonID = this.customerID;
        this.personInfo.PersonTypeID = this.customerType;
        this.waitListSearchParameter.CustomerID = this.customerID;
        this.shouldGetPersonInfo = true;
        this.activityPersonInfo =  this._dataSharingService.activityPersonInfo.subscribe((personInfo: any)=> {
        this.personDetail = personInfo;
        });
        this.getAllWaitlist();


      } else {
        this.getAllWaitlist();
      }
    });
  }

  sortWaitList(sortIndex: number) {
    this.waitListSearchParameter.SortIndex = sortIndex;

    if (sortIndex == 1) {
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.waitListSearchParameter.SortOrder = this.sortOrder;
        this.getAllWaitlist();
      } else {
        this.sortOrder = this.sortOrder_ASC;
        this.waitListSearchParameter.SortOrder = this.sortOrder;
        this.getAllWaitlist();
      }
    } else {
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.waitListSearchParameter.SortOrder = this.sortOrder;
        this.getAllWaitlist();
      } else {
        this.sortOrder = this.sortOrder_ASC;
        this.waitListSearchParameter.SortOrder = this.sortOrder;
        this.getAllWaitlist();
      }
    }
  }
  /* Method to receive the pagination from the Paginator */
  reciviedPagination(pagination: boolean) {
    if (pagination) {
      this.getAllWaitlist();
    }
  }
  reciviedDate($event) {
    this.waitListSearchParameter.DateFrom = $event.DateFrom;
    this.waitListSearchParameter.DateTo = $event.DateTo;
  }
  /* Method to search all the waitlist */
  searchAllWaitlists() {
    this.reciviedDate(this.waitlistDateSearch.dateToFrom);
    this.appPagination.paginator.pageIndex = 0;
    this.appPagination.pageNumber = 1;
    this.getAllWaitlist();
  }


  /* Method to get all the waitlist */
  resetWaitlistFilter() {
    this.isWaitlistStatus = this.waitListSearchParameter.ItemTypeID == POSItemType.Class ? false : true;
    this.waitlistDateSearch.setEmptyDateFilter();
    this.waitListSearchParameter = new CustomerWaitlistSearchParameter();
    this.waitListSearchParameter.CustomerID = this.customerID > 0 ? this.customerID : 0;
    this.setBookingTypeID();
    this.getAllWaitlist();
  }

  /* Method to get all the waitlist */
  getAllWaitlist() {
    this.isWaitlistStatus = this.waitListSearchParameter.ItemTypeID == POSItemType.Class ? false : true;
    this.waitListSearchParameter.PageNumber = this.appPagination.pageNumber;
    this.waitListSearchParameter.PageSize = this.appPagination.pageSize;
    let url = this.customerID ? WaitlistAPI.customerWaitlist : WaitlistAPI.pOSWaitlist;
    this._httpService.get(url, this.waitListSearchParameter).subscribe(
      (res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.isDataExists =
            res.Result != null && res.Result.length > 0 ? true : false;
          if (this.isDataExists) {
            this.allWaitlists = res.Result;
            this.allWaitlists.forEach(element => {
              element.IsAvailable = element.ItemList.filter(x => x.WaitListStatusTypeID == WaitlistStatusType.AvailableToBook).length > 0 ? true : false;
            });
            // this.setToggleStatuses(data.Result.length);
            if (res.Result.length > 0) {
              this.appPagination.totalRecords = res.TotalRecord;
            } else {
              this.appPagination.totalRecords = 0;
            }
          } else {
            this.appPagination.totalRecords = 0;
          }
        } else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },

      () => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Waitlist")
        );
      }
    );
  }
  /* Open Waitlist Service Details*/
  openWaitlistServiceDetail(waitlist: AllWaitlist, itemType: WaitlistItemList) {

    this._serviceDataSelection = JSON.parse(JSON.stringify(itemType));
    this._serviceDataSelection.ServiceID = waitlist.ItemID;
    this._serviceDataSelection.ServicePackageID = itemType.ItemID;
    this._serviceDataSelection.StartTime = this._dateTimeService.convertTimeStringToDateTime(itemType.StartTime, itemType.RequestDate);
    this._serviceDataSelection.EndTime = this._dateTimeService.convertTimeStringToDateTime(itemType.EndTime, itemType.RequestDate);
    this._serviceDataSelection.WaitListDetailID = itemType.WaitListDetailID;

    if (this.personInfo) {
      this._serviceDataSelection.FullName = this.personDetail?.Name//this.personDetail?.FirstName + this.personDetail?.LastName;
      this._serviceDataSelection.Mobile = this.personDetail?.Mobile?.toString();
      this._serviceDataSelection.Email = this.personDetail?.Email;
      this._serviceDataSelection.CustomerID = itemType.CustomerID;
      this._serviceDataSelection.CustomerTypeID = this.personDetail.CustomerTypeID
      this._serviceDataSelection.CustomerTypeName = this.personDetail.CustomerTypeName;
      this._serviceDataSelection.AllowPartPaymentOnCore = this.personDetail.AllowPartPaymentOnCore;
      this._serviceDataSelection.IsBlocked = this.personDetail.IsBlocked;
    } else {
      this._serviceDataSelection.FullName = itemType.CustomerName;
      this._serviceDataSelection.Mobile = itemType.Mobile?.toString();
      this._serviceDataSelection.Email = itemType.Email;
      this._serviceDataSelection.CustomerID = itemType.CustomerID;
      this._serviceDataSelection.CustomerTypeID = itemType.CustomerTypeID
      this._serviceDataSelection.CustomerTypeName = CustomerType.Client == itemType.CustomerTypeID ? 'Client' : (CustomerType.Member == itemType.CustomerTypeID ? 'Member' : (CustomerType.Lead == itemType.CustomerTypeID ? 'Lead' : null))
      this._serviceDataSelection.AllowPartPaymentOnCore = itemType.AllowPartPaymentOnCore;
      this._serviceDataSelection.IsBlocked = waitlist.IsBlocked;

    }
    const dialogref = this._openDialog.open(WaitlistServiceDetailComponent, {
      disableClose: true,
      data: {
        _serviceDataSelection: this._serviceDataSelection
      }
    });
    dialogref.componentInstance.onUpdateService.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this.getAllWaitlist();
      }
    });
  }

  /* Method to book the waitlist */
   bookWaitList(waitList: AllWaitlist, itemType: WaitlistItemList) {
    if (waitList.ItemTypeID == POSItemType.Class) {


      this.getClassAttendanceDetail(waitList.ItemID,this._dateTimeService.convertDateObjToString(itemType.RequestDate, this.dateFormatForSearch)).subscribe((response: any) => {
        if (response) {
          this.classDetailObj = response.Result;
          this.classDetailObj.StartTime = this._dateTimeService.formatTimeString(this.classDetailObj.StartTime, this.timeFormat);
          this.classDetailObj.EndTime = this._dateTimeService.formatTimeString(this.classDetailObj.EndTime, this.timeFormat);
          var freeClassServiceMemberships: FreeClassesMemberships ;


            this.getMemberShipBenefits(waitList, itemType , itemType.CustomerTypeID , itemType.CustomerID).subscribe((response: any) => {
              freeClassServiceMemberships = response.Result;
              if(response.Result.length > 0){
                this.redeemMembershipForWaitList(itemType , freeClassServiceMemberships , waitList);
              }
            });
        }
      });
    }
    else if (waitList.ItemTypeID == POSItemType.Service) {
      this.openWaitlistServiceDetail(waitList, itemType);
    }
  }

  // getPersonInfo(customerType ,customerID){
  //       return this._httpService.get(PersonInfoApi.getPersonInfo + customerType + '/' + customerID)
  //         // .subscribe(
  //         //   data => {
  //         //     if (data && data.Result) {
  //         //       this.personDetail = data.Result;
  //         //       this.personDetail.Name = this.personDetail.FirstName +''+this.personDetail.LastName;

  //         //     }
  //         //   });
  // }

  // call in case of member to select his/her membership
  redeemMembershipForWaitList(itemType :WaitlistItemList , freeClassServiceMemberships :any ,waitList: AllWaitlist) {

    var hasCustomerMembershipBenefits = {
        parentClassId: this.classDetailObj.ParentClassID,
        customerId: itemType.CustomerID,
        classDate: this._dateTimeService.convertDateObjToString(itemType.RequestDate, this.DATE_FORMAT),
        freeClassMemberships: freeClassServiceMemberships,
        classInfo: this.classDetailObj,
        customerMemberShipID: itemType.CustomerMembershipID,
        itemTypeName: 'Class'
    }
    const redeemDialogRef = this._openDialog.open(RedeemMembershipComponent, {
        disableClose: true,
        data: hasCustomerMembershipBenefits,
    })

    redeemDialogRef.componentInstance.membershipSelected.subscribe((customerMembershipId: number) => {

        if (customerMembershipId && customerMembershipId > 0) {
          if (freeClassServiceMemberships.length > 0) {
              var findSelectedMembershipBenefit = freeClassServiceMemberships.find(i => i.CustomerMembershipID == customerMembershipId);
              if(findSelectedMembershipBenefit){
                  freeClassServiceMemberships.forEach(element => {
                      if (element.CustomerMembershipID == customerMembershipId) {
                          this.openDialogForPayment(itemType.CustomerID, waitList, itemType, this.personDetail, element , this.classDetailObj);

                      }
                  });

              }
              else{
                this.openDialogForPayment(itemType.CustomerID, waitList, itemType, this.personDetail, null , this.classDetailObj);

              }

          }
      }
      else if(customerMembershipId != -1) {
        this.openDialogForPayment(itemType.CustomerID, waitList, itemType, this.personDetail, null , this.classDetailObj);
    }
    })
}

  /* Open Payment Dialog */
  openDialogForPayment(customerID: number, waitList: AllWaitlist, itemType: WaitlistItemList, userInfo: any, freeClassServiceMemberships?: FreeClassesMemberships , classDetailObj? :ClassAttendanceDetail) {
    this.commonServiceResponse = this._commonService.prepareDataForPayment(customerID, waitList, itemType, userInfo, freeClassServiceMemberships , classDetailObj )
    this.commonServiceResponse.saleInvoice.SaleInvoiceTotalEarnedRewardPoints = 0;
    if(this.hasRewardProgramInPackage) {
      this._commonService.getItemRewardPoints(POSItemType.Class, this.commonServiceResponse.posCartItems[0].ItemID, this.commonServiceResponse.personInfo.CustomerID, freeClassServiceMemberships ? freeClassServiceMemberships?.IsFree : false, freeClassServiceMemberships ? freeClassServiceMemberships?.IsBenefitSuspended :  false, freeClassServiceMemberships?.CustomerMembershipID ? true : false).subscribe((response: any) => {
        this.commonServiceResponse.posCartItems[0].AmountSpent = response.Result.AmountSpent;
        this.commonServiceResponse.posCartItems[0].MemberBaseEarnPoints = response.Result.MemberBaseEarnPoints ?  response.Result.MemberBaseEarnPoints : 0;
        this.commonServiceResponse.posCartItems[0].CustomerEarnedPoints = response.Result.CustomerEarnedPoints ? response.Result.CustomerEarnedPoints : 0;
        this.commonServiceResponse.saleInvoice.TotalEarnedRewardPoints = this._commonService.calculateRewardPointsPerItem(this.commonServiceResponse.personInfo, this.commonServiceResponse.posCartItems[0]);
      })
    }

    //freeClassMemberships
    const dialogref = this._openDialog.open(POSPaymentComponent,
      {
        disableClose: true,
        panelClass: 'pos-full-popup',
        data: {
          // grossAmount: this.commonServiceResponse.posCartItems[0].TotalAmountExcludeTax,
          // vatTotal: this._taxCalculationService.getTaxAmount(0, this.commonServiceResponse.posCartItems[0].TotalAmountExcludeTax),
          // cartItems: this.commonServiceResponse.posCartItems,
          // saleInvoice: this.commonServiceResponse.saleInvoice,
          // personInfo: this.commonServiceResponse.personInfo
          grossAmount: this.commonServiceResponse.posCartItems[0].ItemDiscountAmount > 0 ? this.commonServiceResponse.posCartItems[0].TotalAmountExcludeTax - this.commonServiceResponse.posCartItems[0].ItemDiscountAmount : this.commonServiceResponse.posCartItems[0].TotalAmountExcludeTax,
          vatTotal: this._taxCalculationService.getTaxAmount(this.classDetailObj.TotalTaxPercentage, this.commonServiceResponse.posCartItems[0].TotalAmountExcludeTax),
          cartItems: this.commonServiceResponse.posCartItems,
          saleInvoice: this.commonServiceResponse.saleInvoice,

          personInfo: this.commonServiceResponse.personInfo
        }
      });
    dialogref.componentInstance.paymentStatus.subscribe((isPaid: boolean) => {
      if (isPaid) {
        this.getAllWaitlist();
      }
    });

  }



  // Delete WaitList

  deleteWaitlist(waitlistId: number, waitlistDetailId: number) {
    let param: any
    param = {
      waitListID: waitlistId,
      waitListDetailID: waitlistDetailId
    }
    this.deleteDialogRef = this._openDialog.open(DeleteConfirmationComponent, { disableClose: true, data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "this Waitlist "), description: this.messages.Delete_Messages.Del_Msg_Undone } });
    this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.delete(WaitlistAPI.deleteWaitList, param)
          .subscribe((res :ApiResponse) => {
            if (res && res.MessageCode > 0) {
              this.getAllWaitlist();
              this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Waitlist"));
            }
            else if (res && res.MessageCode < 0) {
              this._messageService.showErrorMessage(res.MessageText);
            }
          },
            err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Waitlist")); }
          );
      }
    })
  }

  //Method on booking Type changed
  onBookingTypeChange() {

    this.isWaitlistStatus = this.waitListSearchParameter.ItemTypeID == POSItemType.Class ? false : true;
    this.waitlistStatusType = this.waitListSearchParameter.ItemTypeID == POSItemType.Class ? Configurations.CustomerWaitlistStatuses : Configurations.CustomerServiceWaitlistStatuses;
    this.waitListSearchParameter.WaitListStatusTypeID = 1;
    if (this.isWaitlistStatus && this.waitListSearchParameter.PageSize > 10) {
      this.waitListSearchParameter.PageSize = 10;
      this.appPagination.pageSize = 10;
    }
  }
  // Get Service or Class Benefits if the Customer Membership Id > 0
  getMemberShipBenefits(waitList: AllWaitlist, itemType: WaitlistItemList , CustomerTypeID: number , CustomerID:number ) {
    let customerMembershipModel: any = {};


    if (waitList.ItemTypeID == POSItemType.Class) {

      customerMembershipModel = {
        parentClassId: waitList.ItemList[0].ParentClassID,
        customerId: itemType.CustomerID,
        classDate: this._dateTimeService.convertDateObjToString(itemType.RequestDate, this.DATE_FORMAT)
    }
    } else {
      customerMembershipModel.ItemID = itemType.ItemID;
    }
    return this._httpService.get(AttendeeApi.getMemberClassDetailWithOtherMemberships, customerMembershipModel)
  }

  getClassAttendanceDetail(itemID , classDate) {
    let url = AttendeeApi.getClassAttendanceDetail.replace("{classID}", itemID)
        .replace("{classDate}", classDate);

    return this._httpService.get(url)

}
  //#endregion
}
