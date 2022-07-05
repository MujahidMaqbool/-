/********************** Angular References *********************/
import { Component, OnInit, EventEmitter, ViewChild, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

/********************** Services & Models *********************/
/* Models */
import { SaleReportSearchParameter } from '../models/sale.report.model';
import { AllPerson } from '@app/models/common.model';
/* Services */
import { HttpService } from '@services/app.http.service';
import { CommonService } from '@app/services/common.service';
import { DateTimeService } from '@app/services/date.time.service';
import { AuthService } from '@app/helper/app.auth.service';
import { DataSharingService } from '@app/services/data.sharing.service';
/**********************  Component *********************/
import { DateToDateFromComponent } from '@app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { CustomerSearchComponent } from '@app/shared/components/customer-search/customer.search.component';

/**********************  Common *********************/
import { Messages } from '@helper/config/app.messages';
import { SaleApi } from '@app/helper/config/app.webapi';
import { debounceTime } from 'rxjs/internal/operators';
import { SubscriptionLike } from 'rxjs';
/**********************  Configurations *********************/
import { Configurations } from '@helper/config/app.config';
import { ENU_Permission_Module, ENU_Permission_Report } from '@app/helper/config/app.module.page.enums';
import { FileFormatType, ReportTab, FileType, ReportName, ENU_Package, POSItemType } from '@app/helper/config/app.enums';
import { MessageService } from '@app/services/app.message.service';



@Component({
  selector: 'sale-report',
  templateUrl: './sale.reports.component.html'
})

export class SaleReportsComponent implements OnInit {

  allowedPages = {
    SaleByProductReport: false,
    SaleByServiceReport: false,
    SaleByClassReport:false,
    SaleByStaffReport: false,
    AllSale: false,
    AllSaleSummary: false,
    AllSaleSummaryByItemReport: false,
    StaffTips: false,
    AllCashOtherSale: false,
    MembershipBenefitsRedemption: false,
    PaymentsSummary: false,
    SalesBreakdown: false,
    PaymentBreakdown: false,
    DailyRefunds: false
  };

  // #region Local references
  @ViewChild('dateCompoRef') dateCompoRef: DateToDateFromComponent;
  @ViewChild('dateCompoRefForAllSale') dateCompoRefForAllSale: DateToDateFromComponent;
  @ViewChild('dateCompoRefForAllCashOtherSale') dateCompoRefForAllCashOtherSale: DateToDateFromComponent;
  @ViewChild('dateCompoRefForProductSale') dateCompoRefForProductSale: DateToDateFromComponent;
  @ViewChild('dateCompoRefForSaleByStaff') dateCompoRefForSaleByStaff: DateToDateFromComponent;
  @ViewChild('dateCompoRefForSaleByService') dateCompoRefForSaleByService: DateToDateFromComponent;
  @ViewChild('dateCompoRefForSaleByClass') dateCompoRefForSaleByClass: DateToDateFromComponent;
  @ViewChild('dateCompoRefForSaleByCate') dateCompoRefForSaleByCate: DateToDateFromComponent;
  @ViewChild('dateCompoRefForSaleSummaryByCate') dateCompoRefForSaleSummaryByCate: DateToDateFromComponent;
  @ViewChild('dateCompoRefForSaleSummary') dateCompoRefForSaleSummary: DateToDateFromComponent;
  @ViewChild('dateCompoRefForSaleSaleSummary') dateCompoRefForSaleSaleSummary: DateToDateFromComponent;
  @ViewChild('dateCompoRefForStaffTip') dateCompoRefForStaffTip: DateToDateFromComponent;
  @ViewChild('dateCompoRefForRedeem') dateCompoRefForRedeem: DateToDateFromComponent;
  @ViewChild('dateCompoRefForBreakDown') dateCompoRefForBreakDown: DateToDateFromComponent;
  @ViewChild('dateCompoRefForPaymentBreakDown') dateCompoRefForPaymentBreakDown: DateToDateFromComponent;
  @ViewChild('customerSearch') customerSearch: CustomerSearchComponent;
  @ViewChild('dateCompoRefForDailyRefunds') dateCompoRefForDailyRefunds: DateToDateFromComponent;
  @ViewChild('dateCompoRefForPaymentsSummary') dateCompoRefForPaymentsSummary: DateToDateFromComponent;

  /* Local Members */
  clearProductInput: string = '';
  personName: string = "";
  customerName: string;
  staffName: string;
  clearProductCustomerInput: string = "";
  clearProductStaffInput: string = "";
  clearServiceCustomerInput: string = "";
  clearServiceStaffInput: string = "";
  clearClassStaffInput: string = "";
  clearSalyByStaffCustomerInput: string = "";
  clearSalyByStaff_StaffInput: string = "";
  clearTipStaffInput: string = "";
  currentDate: Date = new Date();
  // currentMonthFirstDate: Date = new Date();
  // currentMonthLastDate: Date = new Date();

  /* Local Lsit */
  reportTab = ReportTab;
  fileType = FileType;
  reportName = ReportName;

  /* Format */
  dateFormat: string = 'yyyy-MM-dd';
  packageIdSubscription: SubscriptionLike;
  @Input() customerID: EventEmitter<number> = new EventEmitter();
  /* Messages */
  messages = Messages;


  SalesSummarybyItemTypeDateToLabelName: string = 'To - Invoice Created Date';
  SalesSummarybyItemTypeDateFromLabelName: string = 'From - Invoice Created Date';
  SalesByClassDateToLabelName: string = 'To - Class Scheduled Date';
  SalesByClassDateFromLabelName: string = 'From - Class Scheduled Date';
  PaymentBreakdownDateToLabelName: string = "To - Payment Date";
  PaymentBreakdownDateFromLabelName: string = "From - Payment Date";

  /* Models Refences */

  saleReportSearchParameter = new SaleReportSearchParameter();
  searchPerson: FormControl = new FormControl();
  searchCustomer: FormControl = new FormControl();
  searchCustomerPS: FormControl = new FormControl();
  searchCustomerByStaff: FormControl = new FormControl();
  searchCustomerByService: FormControl = new FormControl();
  searchCustomerByProduct: FormControl = new FormControl();
  searchProduct: FormControl = new FormControl();
  allPerson: AllPerson[];
  allCustomer: AllPerson[];
  procductList: any[] = [];
  filteredProcductList: any[] = [];
  productCategoryList: any[] = [];
  productBrandList: any[] = [];
  serviceList: any[] = [];
  classList: any[] = [];
  filteredServiceList: any[] = [];
  filteredClassList: any[] = [];
  paymentGateList: any[] = [];
  RedeemViewModel: any = {
    BranchList: [],
    MembershipList: []
  };
  serviceCategoryList: any[] = [];
  classCategoryList: any[] = []
  itemList: any[] = [];
  itemTypeList: any[] = [];
  allItemTypeList: any[] = [];
  staffPositionList: any[] = [];
  statusList: any[] = [];
  reportTabID: number = 0;
  allProducts: any[];

  /* Configurations */
  saleSourceTypeList = Configurations.SaleSourceType;
  allSaleSourceTypeList = Configurations.AllSaleSourceType;
  PaymentSaleType = Configurations.PaymentSaleType;
  PaymentSaleTypeForCashOther = Configurations.PaymentSaleTypeForCashOther;
  PaymentStatusType = Configurations.PaymentStatusTypesForReports;
  //itemTypeList = Configurations.ItemTypeOnReport;
  fileFormatType = FileFormatType;
  paymentTypeList: any[] = [];
  // paymentGateWayTypeListForCashOther: any[] = [];
  package = ENU_Package;

  // #endregion

  constructor(private _httpService: HttpService,
    private _dateTimeService: DateTimeService,
    private _commonService: CommonService,
    private _authService: AuthService,
    private _messageService: MessageService,
    private _dataSharingService: DataSharingService) {
    //  this.currentMonthFirstDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    //  this.currentMonthLastDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    this.reportTabID = this.reportTab.Sale;
  }


  // #region events
  ngOnInit() {
    this.getBranchSetting();


  }


  onClientNameChange(clientName: any) {
    if (clientName.length < 3) {
      this.saleReportSearchParameter.CustomerID = 0;
    }
  }

  onStaffNameChange(staffName: any) {
    if (staffName.length < 3) {
      this.saleReportSearchParameter.StaffID = 0;
    }
  }

  onResetDateFilter() {
    this.dateCompoRefForAllSale.resetDateFilter();
    this.resetDateFilters();
    this.saleReportSearchParameter.SaleSourceTypeID = 0;
    this.saleReportSearchParameter.PaymentGateWayID = 0;
    this.saleReportSearchParameter.SaleTypeID = 0;
  }

  onResetCashOtherSaleDateFilter() {
    this.dateCompoRefForAllCashOtherSale.resetDateFilter();
    this.resetDateFilters();
    this.saleReportSearchParameter.SaleSourceTypeID = 0;
    this.saleReportSearchParameter.PaymentGateWayID = 0;
    this.saleReportSearchParameter.SaleTypeID = 0;
  }

  ngOnDestroy() {
    this.packageIdSubscription.unsubscribe();
  }

  onClearDate() {
    this.saleReportSearchParameter.StaffID = 0;
    this.saleReportSearchParameter.CustomerID = 0;
    this.clearProductStaffInput = '';
    this.clearProductCustomerInput = '';
    this.clearServiceStaffInput = '';
    this.clearServiceCustomerInput = '';
    this.clearSalyByStaff_StaffInput = '';
    this.clearSalyByStaffCustomerInput = '';
    this.clearTipStaffInput = '';
  }

  onClearSaleByStaff() {
    this.clearSalyByStaff_StaffInput = "";
    this.saleReportSearchParameter.StaffID = 0;
  }

  onClearSaleByCustomer() {
    this.clearSalyByStaffCustomerInput = "";
    this.saleReportSearchParameter.CustomerID = 0;
  }

  onClearStaffTip() {
    this.clearTipStaffInput = '';
  }

  onClearStaffSaleByProduct() {
    this.clearProductStaffInput = "";
    this.saleReportSearchParameter.StaffID = 0;
  }

  onClearCustomerSaleByProduct() {
    this.clearProductCustomerInput = "";
    this.saleReportSearchParameter.CustomerID = 0;
  }

  onClearAssignedToStaffSaleByService() {
    this.clearServiceStaffInput = '';
    this.saleReportSearchParameter.StaffID = 0;
  }

  onClearAssignedToStaffSaleByClass() {
    this.clearClassStaffInput = '';
    this.saleReportSearchParameter.ClassID = 0;
  }

  onClearStaffSaleByService() {
    this.clearServiceCustomerInput = '';
    this.saleReportSearchParameter.CustomerID = 0;
  }

  onChangeBranch() {
    this.RedeemViewModel.MembershipList = [];
    let _url = SaleApi.getAllRedeemMemberships + "?homeBranchID=" + this.saleReportSearchParameter.BranchID;;
    this._httpService.get(_url).subscribe((response: any) => {
      if (response.MessageCode > 0 && response.Result) {
        this.RedeemViewModel.MembershipList = response.Result.RedeemMembershipList;
      }
    });
  }

  // #endregion


  // #region Methods

  async getBranchSetting() {
    this.currentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
    this.saleReportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat),
      this.saleReportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat)
    this.saleReportSearchParameter.SaleTypeID = 0;
    this.saleReportSearchParameter.PaymentGateWayID = 0;
    this.saleReportSearchParameter.ProductID = null;
    this.saleReportSearchParameter.BranchID = 0;
    this.saleReportSearchParameter.MembershipID = null;

    this.setPermissions();
    this.getProductFundamental();
    this.getClassFundamental();
    this.getServiceFundamental();
    this.searchPerson.valueChanges
      .pipe(debounceTime(400))
      .subscribe(searchText => {
        if (searchText && searchText !== "" && searchText.length > 2) {
          if (typeof (searchText) === "string") {
            this._commonService.searchStaff(searchText).subscribe(response => {
              if (response.Result != null && response.Result.length) {
                this.allPerson = response.Result;
              }
              else {
                this.allPerson = [];
              }
            });
          }
        }
        else {
          this.allPerson = [];
        }
      });

    this.searchCustomer.valueChanges
      .pipe(debounceTime(400))
      .subscribe(searchText => {
        if (searchText && searchText !== "" && searchText.length > 2) {

          if (typeof (searchText) === "string") {

            this._commonService.searchClient(searchText, 0).subscribe(response => {
              if (response.Result != null && response.Result.length) {
                this.allCustomer = response.Result;
              }
              else {
                this.allCustomer = [];
              }
            });
          }
        }
        else {
          this.allCustomer = [];
        }
      });

      this.searchCustomerPS.valueChanges
      .pipe(debounceTime(400))
      .subscribe(searchText => {
        if (searchText && searchText !== "" && searchText.length > 2) {

          if (typeof (searchText) === "string") {

            this._commonService.searchClient(searchText, 0).subscribe(response => {
              if (response.Result != null && response.Result.length) {
                this.allCustomer = response.Result;
              }
              else {
                this.allCustomer = [];
              }
            });
          }
        }
        else {
          this.allCustomer = [];
        }
      });

      this.searchProduct.valueChanges
      .pipe(debounceTime(400))
      .subscribe(searchText => {
          if (searchText && searchText !== "" && searchText.length > 2) {

              if (typeof (searchText) === "string") {

                  this._commonService.searchProduct(searchText).subscribe(response => {
                      if (response.Result != null && response.Result.length) {
                          this.allProducts = response.Result;
                      }
                      else {
                          this.allProducts = [];
                      }
                  });
              }
          }
          else {
              this.allProducts = [];
          }
      });


    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
      if (packageId && packageId > 0) {
        this.filterItemList(packageId);
      }
    });
  }

  // #region AllSaleRepors

  onProductNameChange(){
    this.saleReportSearchParameter.ProductName = this.saleReportSearchParameter.ProductName ? this.saleReportSearchParameter.ProductName.trim() : "";
  }

  getProductFundamental() {
    this._httpService.get(SaleApi.getProductFundamental).subscribe((Data: any) => {
      this.procductList = Data.Result.ProductList;
      this.filteredProcductList = Data.Result.ProductList;
      this.productCategoryList = Data.Result.ProductCategoryList;
      this.productBrandList = Data.Result.ProductBrandList;

      this.setDefaultValues();
    });
  }

  getClassFundamental() {
    this._httpService.get(SaleApi.getClassFundamental).subscribe((Data: any) => {
      this.classList = Data.Result.Classes;
      this.filteredClassList = Data.Result.Classes;
      this.classCategoryList = Data.Result.ClassCategories;

      this.setClassesDefaultValues();
    });
  }

  getServiceFundamental() {
    this._httpService.get(SaleApi.getServiceFundamental).subscribe((Data: any) => {
      this.serviceList = Data.Result.ServiceList;
      this.serviceCategoryList = Data.Result.ServiceCategoryList;
      this.filteredServiceList = Data.Result.ServiceList;
     // this.classCategoryList = Data.Result.ServiceCategoryList; ///change to class List
    //  this.filteredClassList = Data.Result.ServiceList;///change to class category List
      this.paymentGateList = Data.Result.PaymentGatewayList;
      this.RedeemViewModel.BranchList = Data.Result.RedeemViewModel.BranchList;
      this.RedeemViewModel.MembershipList = Data.Result.RedeemViewModel.MembershipList;

      this.setServicesDefaultValues();
      this.setDefaultPaymentGateWay();
    });
  }

  exportAllSaleReport(fileType: number, isAllSale: boolean = true) {
    let params = {
      fileFormatTypeID: fileType,
      saleSourceTypeID: this.saleReportSearchParameter.SaleSourceTypeID == 0 ? null : this.saleReportSearchParameter.SaleSourceTypeID,
      saleTypeID: this.saleReportSearchParameter.SaleTypeID == 0 ? null : this.saleReportSearchParameter.SaleTypeID,
      paymentGateWayID: this.saleReportSearchParameter.PaymentGateWayID == 0 ? null : this.saleReportSearchParameter.PaymentGateWayID,
      paymentStatusTypeID: this.saleReportSearchParameter.PaymentStatusTypeID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      reportID: isAllSale == true ? 1 : 2 //by syed asim bukhari
    };
    if (isAllSale) {
      this._httpService.get(SaleApi.getAllSale, params).subscribe((allSale: any) => {
        if (fileType == this.fileType.PDF) {
          this._commonService.createPDF(allSale, this.reportName.AllSale);
        }
        if (fileType == this.fileType.Excel) {
          this._commonService.createExcel(allSale, this.reportName.AllSale);
        };
      });
    } else {
      params.paymentGateWayID = null;
      this._httpService.get(SaleApi.getAllCashSale, params).subscribe((allSale: any) => {
        if (fileType == this.fileType.PDF) {
          this._commonService.createPDF(allSale, this.reportName.CashOtherSales);
        }
        if (fileType == this.fileType.Excel) {
          this._commonService.createExcel(allSale, this.reportName.CashOtherSales);
        };
      });
    }
  };

  viewAllSaleReport(fileType: number, isAllSale: boolean = true) {

    let params = {
      fileFormatTypeID: fileType,
      saleSourceTypeID: this.saleReportSearchParameter.SaleSourceTypeID == 0 ? null : this.saleReportSearchParameter.SaleSourceTypeID,
      saleTypeID: this.saleReportSearchParameter.SaleTypeID == 0 ? null : this.saleReportSearchParameter.SaleTypeID,
      paymentGateWayID: this.saleReportSearchParameter.PaymentGateWayID == 0 ? null : this.saleReportSearchParameter.PaymentGateWayID,
      paymentStatusTypeID: this.saleReportSearchParameter.PaymentStatusTypeID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      reportID: isAllSale == true ? 1 : 2 //by syed asim bukhari
    };
    if (isAllSale) {
      this._httpService.get(SaleApi.getAllSale, params).subscribe((allSale: any) => {
        this._commonService.viewPDFReport(allSale);
      });
    } else {
      params.paymentGateWayID = null;
      this._httpService.get(SaleApi.getAllCashSale, params).subscribe((allSale: any) => {
        this._commonService.viewPDFReport(allSale);
      });
    }

  };

  resetAllSaleFilter() {
    this.dateCompoRefForAllSale.resetDateFilter();
    this.resetDateFilters();
    this.saleReportSearchParameter.SaleSourceTypeID = 0;
    this.saleReportSearchParameter.PaymentGateWayID = 0;
    this.saleReportSearchParameter.PaymentStatusTypeID = 0;
    this.setDefaultPaymentGateWay();
  }


  // #endregion

  // #region SaleByCategoryReport

  exportSaleByCategoryReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      itemTypeID: this.saleReportSearchParameter.ItemTypeID == 0 ? null : this.saleReportSearchParameter.ItemTypeID,
      saleSourceTypeID: this.saleReportSearchParameter.SaleSourceTypeID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo
    };
    this._httpService.get(SaleApi.getAllSaleByCategory, params)
      .subscribe((saleByCategoryData: any) => {
        if (fileType == this.fileType.PDF) {
          this._commonService.createPDF(saleByCategoryData, this.reportName.AllSaleSummary);
        }
        if (fileType == this.fileType.Excel) {
          this._commonService.createExcel(saleByCategoryData, this.reportName.AllSaleSummary);
        };

      });
  };

  viewSaleByCategoryReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      itemTypeID: this.saleReportSearchParameter.ItemTypeID == 0 ? null : this.saleReportSearchParameter.ItemTypeID,
      saleSourceTypeID: this.saleReportSearchParameter.SaleSourceTypeID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo
    }

    this._httpService.get(SaleApi.getAllSaleByCategory, params).subscribe((saleByCategoryData: any) => {
      this._commonService.viewPDFReport(saleByCategoryData);
    });
  }
  resetAllSaleByCategoryFilter() {
    this.resetDateFilters();
    this.dateCompoRefForSaleByCate.resetDateFilter();
    this.saleReportSearchParameter.SaleSourceTypeID = 0;
    this.saleReportSearchParameter.ItemTypeID = 0;
  }

  // #endregion

  // #region AllSaleBySource

  exportAllSaleSummaryReport(fileType: number) {
    if (this.saleReportSearchParameter.DateTo >= this.saleReportSearchParameter.DateFrom) {
      let params = {
        fileFormatTypeID: fileType,
        sourceTypeID: this.saleReportSearchParameter.SaleSourceTypeID,
        paymentStatusTypeID: this.saleReportSearchParameter.PaymentStatusTypeID,
        dateFrom: this.saleReportSearchParameter.DateFrom,
        dateTo: this.saleReportSearchParameter.DateTo
      };
      this._httpService.get(SaleApi.getAllSaleBySource, params)
        .subscribe((allSaleSummaryData: any) => {
          if (fileType == this.fileType.PDF) {
            this._commonService.createPDF(allSaleSummaryData, this.reportName.DailySalesSummaryBySource);
          }
          if (fileType == this.fileType.Excel) {
            this._commonService.createExcel(allSaleSummaryData, this.reportName.DailySalesSummaryBySource);
          };
        });
    }
    else {
      this._messageService.showErrorMessage(this.messages.Error.Invalid_ToDate);
    }
  };

  viewAllSaleSummaryReport(fileType: number) {
    if (this.saleReportSearchParameter.DateTo >= this.saleReportSearchParameter.DateFrom) {
      let params = {
        fileFormatTypeID: fileType,
        sourceTypeID: this.saleReportSearchParameter.SaleSourceTypeID,
        paymentStatusTypeID: this.saleReportSearchParameter.PaymentStatusTypeID,
        dateFrom: this.saleReportSearchParameter.DateFrom,
        dateTo: this.saleReportSearchParameter.DateTo
      };

      this._httpService.get(SaleApi.getAllSaleBySource, params).subscribe((allSaleSummaryData: any) => {
        this._commonService.viewPDFReport(allSaleSummaryData);
      });
    }
    else {
      this._messageService.showErrorMessage(this.messages.Error.Invalid_ToDate);
    }
  };

  resetAllSaleSummaryFilter() {
    this.dateCompoRefForSaleSaleSummary.resetDateFilter();
    //this.resetDateFilters();
    this.saleReportSearchParameter.SaleSourceTypeID = 0;
    this.saleReportSearchParameter.PaymentStatusTypeID = 0;
  }

  // #endregion

  // #region AllSaleBySourceCategory

  exportAllSaleSummaryByCategoryReport(fileType: number) {
    if (this.saleReportSearchParameter.DateTo >= this.saleReportSearchParameter.DateFrom) {
      let params = {
        fileFormatTypeID: fileType,
        itemTypeID: this.saleReportSearchParameter.ItemTypeID == 0 ? null : this.saleReportSearchParameter.ItemTypeID,
        sourceTypeID: this.saleReportSearchParameter.SaleSourceTypeID,
        paymentStatusTypeID: this.saleReportSearchParameter.PaymentStatusTypeID,
        dateFrom: this.saleReportSearchParameter.DateFrom,
        dateTo: this.saleReportSearchParameter.DateTo
      };
      this._httpService.get(SaleApi.getAllSaleBySourceCategory, params)
        .subscribe((saleSummaryByCategoryData: any) => {
          if (fileType == this.fileType.PDF) {
            this._commonService.createPDF(saleSummaryByCategoryData, this.reportName.SalesSummaryByItemType);
          }
          if (fileType == this.fileType.Excel) {
            this._commonService.createExcel(saleSummaryByCategoryData, this.reportName.SalesSummaryByItemType);
          };
        });
    }
    else {
      this._messageService.showErrorMessage(this.messages.Error.Invalid_ToDate);
    }
  };

  viewAllSaleSummaryByCategoryReport(fileType: number) {
    if (this.saleReportSearchParameter.DateTo >= this.saleReportSearchParameter.DateFrom) {
      let params = {
        fileFormatTypeID: fileType,
        itemTypeID: this.saleReportSearchParameter.ItemTypeID == 0 ? null : this.saleReportSearchParameter.ItemTypeID,
        sourceTypeID: this.saleReportSearchParameter.SaleSourceTypeID,
        paymentStatusTypeID: this.saleReportSearchParameter.PaymentStatusTypeID,
        dateFrom: this.saleReportSearchParameter.DateFrom,
        dateTo: this.saleReportSearchParameter.DateTo
      };

      this._httpService.get(SaleApi.getAllSaleBySourceCategory, params).subscribe((allSaleSummaryData: any) => {
        this._commonService.viewPDFReport(allSaleSummaryData);
      });
    }
    else {
      this._messageService.showErrorMessage(this.messages.Error.Invalid_ToDate);
    }
  };

  resetAllSaleSummaryByCategoryFilter() {
    this.dateCompoRefForSaleSummaryByCate.resetDateFilter();
    // this.saleReportSearchParameter.DateFrom = "";
    // this.saleReportSearchParameter.DateTo = "";
    this.saleReportSearchParameter.ItemTypeID = 0;
    this.saleReportSearchParameter.SaleSourceTypeID = 0;
    this.saleReportSearchParameter.PaymentStatusTypeID = 0;
  }
  // #endregion

  // #region SaleByService

  exportSaleByServiceReport(fileType: number) {

    let params = {
      fileFormatTypeID: fileType,
      staffID: this.saleReportSearchParameter.StaffID == 0 ? null : this.saleReportSearchParameter.StaffID,
      customerID: this.saleReportSearchParameter.CustomerID == 0 ? null : this.saleReportSearchParameter.CustomerID,
      serviceID: this.saleReportSearchParameter.ServiceID == 0 ? null : this.saleReportSearchParameter.ServiceID,
      serviceCategoryID: this.saleReportSearchParameter.ServiceCategoryID == 0 ? null : this.saleReportSearchParameter.ServiceCategoryID,
      paymentStatusTypeID: this.saleReportSearchParameter.PaymentStatusTypeID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo
    }

    this._httpService.get(SaleApi.getHistoryByService, params).subscribe((SaleByServiceData: any) => {
      if (fileType == this.fileType.PDF) {
        this._commonService.createPDF(SaleByServiceData, this.reportName.SaleByService);
      }
      if (fileType == this.fileType.Excel) {
        this._commonService.createExcel(SaleByServiceData, this.reportName.SaleByService);
      };
    });
  };

  viewSaleByServiceReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      staffID: this.saleReportSearchParameter.StaffID == 0 ? null : this.saleReportSearchParameter.StaffID,
      customerID: this.saleReportSearchParameter.CustomerID == 0 ? null : this.saleReportSearchParameter.CustomerID,
      serviceID: this.saleReportSearchParameter.ServiceID == 0 ? null : this.saleReportSearchParameter.ServiceID,
      serviceCategoryID: this.saleReportSearchParameter.ServiceCategoryID == 0 ? null : this.saleReportSearchParameter.ServiceCategoryID,
      paymentStatusTypeID: this.saleReportSearchParameter.PaymentStatusTypeID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo
    }

    this._httpService.get(SaleApi.getHistoryByService, params).subscribe((Data: any) => {
      this._commonService.viewPDFReport(Data);
    });
  };

  resetSaleByServiceFilter() {
    this.resetDateFilters();
    this.saleReportSearchParameter.ServiceID = 0;
    this.saleReportSearchParameter.ServiceCategoryID = null;
    this.saleReportSearchParameter.StaffID = null;
    this.saleReportSearchParameter.CustomerID = null;
    this.dateCompoRefForSaleByService.resetDateFilter()
    this.filteredServiceList = null;
    this.filteredServiceList = this.serviceList;
    this.clearServiceCustomerInput = "";
    this.clearServiceStaffInput = "";
    this.saleReportSearchParameter.PaymentStatusTypeID = 0;
  }

  // #endregion

  // #region SaleByService

  // #region SaleByClass

  exportSaleByClassReport(fileType: number) {

    let params = {
      fileFormatTypeID: fileType,
      AssignedToStaffID : this.saleReportSearchParameter.StaffID == 0 ? null : this.saleReportSearchParameter.StaffID,
      customerID: this.saleReportSearchParameter.CustomerID == 0 ? null : this.saleReportSearchParameter.CustomerID,
      classID: this.saleReportSearchParameter.ClassID == 0 ? null : this.saleReportSearchParameter.ClassID,
      categoryID: this.saleReportSearchParameter.ClassCategoryID == 0 ? null : this.saleReportSearchParameter.ClassCategoryID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      SaleStatusID : this.saleReportSearchParameter.PaymentStatusTypeID,
    }

    this._httpService.get(SaleApi.getHistoryByClass, params).subscribe((SaleByClassData: any) => {
      if (fileType == this.fileType.PDF) {
        this._commonService.createPDF(SaleByClassData, this.reportName.SaleByClass);
      }
      if (fileType == this.fileType.Excel) {
        this._commonService.createExcel(SaleByClassData, this.reportName.SaleByClass);
      };
    });
  };

  viewSaleByClassReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      AssignedToStaffID : this.saleReportSearchParameter.StaffID == 0 ? null : this.saleReportSearchParameter.StaffID,
      customerID: this.saleReportSearchParameter.CustomerID == 0 ? null : this.saleReportSearchParameter.CustomerID,
      classID: this.saleReportSearchParameter.ClassID == 0 ? null : this.saleReportSearchParameter.ClassID,
      categoryID: this.saleReportSearchParameter.ClassCategoryID == 0 ? null : this.saleReportSearchParameter.ClassCategoryID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      SaleStatusID : this.saleReportSearchParameter.PaymentStatusTypeID,
    }

    this._httpService.get(SaleApi.getHistoryByClass, params).subscribe((Data: any) => {
      this._commonService.viewPDFReport(Data);
    });
  };

  resetSaleByClassFilter() {
    this.resetDateFilters();
    this.saleReportSearchParameter.ClassID = 0;
    this.saleReportSearchParameter.ClassCategoryID = null;
    this.saleReportSearchParameter.StaffID = null;
    this.saleReportSearchParameter.CustomerID = null;
    this.dateCompoRefForSaleByClass.resetDateFilter()
    this.filteredServiceList = null;
    this.filteredClassList = this.classList;
    this.clearClassStaffInput = "";
    this.saleReportSearchParameter.PaymentStatusTypeID = 0;
  }


  // #endregion

  // #region SaleByProduct

  resetProductDetail() {
    this.clearProductInput = "";
    this.saleReportSearchParameter.ProductID = 0;
    this.saleReportSearchParameter.ProductCategoryID = null;
    this.saleReportSearchParameter.BrandID = null;
  }

  onNameChangeproduct(productName: any) {
    if (productName.length < 3) {
        this.saleReportSearchParameter.ProductID = 0;
    }
  }

  getSelectedProduct(product: any) {
    this.saleReportSearchParameter.ProductID = product.ProductID;
    this.saleReportSearchParameter.ProductCategoryID = product.ProductCategoryID;
    this.saleReportSearchParameter.BrandID = product.BrandID > 0 ? product.BrandID : null;
  }

  displayProductName(product?: any): string | undefined {
    return product ? product.ProductName : undefined;
  }

  exportSaleByProductReport(fileType: number) {

    let params = {
      fileFormatTypeID: fileType,
      staffID: this.saleReportSearchParameter.StaffID == 0 ? null : this.saleReportSearchParameter.StaffID,
      customerID: this.saleReportSearchParameter.CustomerID == 0 ? null : this.saleReportSearchParameter.CustomerID,
      productID: this.saleReportSearchParameter.ProductID > 0 ? this.saleReportSearchParameter.ProductID : null,
      productCategoryID: this.saleReportSearchParameter.ProductCategoryID,
      productBrandID: this.saleReportSearchParameter.BrandID,
      paymentStatusTypeID: this.saleReportSearchParameter.PaymentStatusTypeID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo
    }

    this._httpService.get(SaleApi.getHistoryByProduct, params).subscribe((SaleByProductData: any) => {
      if (fileType == this.fileType.PDF) {
        this._commonService.createPDF(SaleByProductData, this.reportName.SaleByProduct);
      }
      if (fileType == this.fileType.Excel) {
        this._commonService.createExcel(SaleByProductData, this.reportName.SaleByProduct);
      };

    });
  };

  viewSaleByProductReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      staffID: this.saleReportSearchParameter.StaffID == 0 ? null : this.saleReportSearchParameter.StaffID,
      customerID: this.saleReportSearchParameter.CustomerID == 0 ? null : this.saleReportSearchParameter.CustomerID,
      productID: this.saleReportSearchParameter.ProductID > 0 ? this.saleReportSearchParameter.ProductID : null,
      productCategoryID: this.saleReportSearchParameter.ProductCategoryID,
      productBrandID: this.saleReportSearchParameter.BrandID,
      paymentStatusTypeID: this.saleReportSearchParameter.PaymentStatusTypeID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo
    }

    this._httpService.get(SaleApi.getHistoryByProduct, params).subscribe((Data: any) => {
      this._commonService.viewPDFReport(Data);
    });
  };

  resetSaleByProductFilter() {
    this.resetDateFilters();
    this.clearProductInput = "";
    this.saleReportSearchParameter.ProductID = 0;
    this.saleReportSearchParameter.BrandID = null;
    this.saleReportSearchParameter.ProductName = "";
    this.saleReportSearchParameter.ProductCategoryID = null;
    this.saleReportSearchParameter.StaffID = null;
    this.saleReportSearchParameter.CustomerID = null;
    this.customerName = '';
    this.staffName = '';
    this.saleReportSearchParameter.PaymentStatusTypeID = 0;
    this.filteredProcductList = null;
    this.filteredProcductList = this.procductList;
    this.dateCompoRefForProductSale.resetDateFilter();
    this.clearProductCustomerInput = "";
    this.clearProductStaffInput = "";
    //this.customerSearch.resetCustomerName();
  }

  // #endregion


  exportSaleByStaffReport(fileType: number) {

    let params = {
      fileFormatTypeID: fileType,
      staffID: this.saleReportSearchParameter.StaffID == 0 ? null : this.saleReportSearchParameter.StaffID,
      customerID: this.saleReportSearchParameter.CustomerID == 0 ? null : this.saleReportSearchParameter.CustomerID,
      itemTypeID: this.saleReportSearchParameter.ItemTypeID == 0 ? null : this.saleReportSearchParameter.ItemTypeID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo
    }

    this._httpService.get(SaleApi.getHistoryByStaff, params)
      .subscribe((SaleByStaffData: any) => {
        if (fileType == this.fileType.PDF) {
          this._commonService.createPDF(SaleByStaffData, this.reportName.SaleByStaff);
        }
        if (fileType == this.fileType.Excel) {
          this._commonService.createExcel(SaleByStaffData, this.reportName.SaleByStaff);
        };

      });
  };

  viewSaleByStaffReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      staffID: this.saleReportSearchParameter.StaffID == 0 ? null : this.saleReportSearchParameter.StaffID,
      customerID: this.saleReportSearchParameter.CustomerID == 0 ? null : this.saleReportSearchParameter.CustomerID,
      itemTypeID: this.saleReportSearchParameter.ItemTypeID == 0 ? null : this.saleReportSearchParameter.ItemTypeID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo
    }

    this._httpService.get(SaleApi.getHistoryByStaff, params).subscribe((Data: any) => {
      this._commonService.viewPDFReport(Data);
    });
  };
  resetSaleByStaffFilter() {
    this.resetDateFilters();
    this.saleReportSearchParameter.ServiceID = null;
    this.clearSalyByStaffCustomerInput = "";
    this.clearSalyByStaff_StaffInput = "";
    this.saleReportSearchParameter.ItemTypeID = 0;
    this.dateCompoRefForSaleByStaff.resetDateFilter();
  }


  exportAllStaffTipReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      staffID: this.saleReportSearchParameter.StaffID == 0 ? null : this.saleReportSearchParameter.StaffID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo
    };
    this._httpService.get(SaleApi.getAllStaffTips, params)
      .subscribe((StaffTipsData: any) => {
        if (fileType == this.fileType.PDF) {
          this._commonService.createPDF(StaffTipsData, this.reportName.AllStaffTips);
        }
        if (fileType == this.fileType.Excel) {
          this._commonService.createExcel(StaffTipsData, this.reportName.AllStaffTips);
        };
      });
  };

  viewAllStaffTipReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      staffID: this.saleReportSearchParameter.StaffID == 0 ? null : this.saleReportSearchParameter.StaffID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo
    };

    this._httpService.get(SaleApi.getAllStaffTips, params).subscribe((StaffTipsData: any) => {
      this._commonService.viewPDFReport(StaffTipsData);
    });
  };
  resetAllStaffTipFilter() {
    this.dateCompoRefForStaffTip.resetDateFilter();
    this.resetDateFilters();
    this.saleReportSearchParameter.StaffID = 0;
    this.clearTipStaffInput = "";
  }

  // Redeem Report Exoprt and view
  exportRedeemReport(fileType: number) {
    let params = {
      homeBranchID: this.saleReportSearchParameter.BranchID == 0 ? 0 : this.saleReportSearchParameter.BranchID,
      membershipID: this.saleReportSearchParameter.MembershipID == null ? null : this.saleReportSearchParameter.MembershipID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      fileFormatTypeID: fileType,

    };
    this._httpService.get(SaleApi.getAllRedeem, params)
      .subscribe((RedeemData: any) => {
        if (fileType == this.fileType.PDF) {
          this._commonService.createPDF(RedeemData, this.reportName.AllRedeem);
        }
        if (fileType == this.fileType.Excel) {
          this._commonService.createExcel(RedeemData, this.reportName.AllRedeem);
        };
      });
  };

  viewRedeemReport(fileType: number) {
    let params = {
      homeBranchID: this.saleReportSearchParameter.BranchID == 0 ? 0 : this.saleReportSearchParameter.BranchID,
      membershipID: this.saleReportSearchParameter.MembershipID == null ? null : this.saleReportSearchParameter.MembershipID,
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      fileFormatTypeID: fileType,
    };

    this._httpService.get(SaleApi.getAllRedeem, params).subscribe((RedeemData: any) => {
      this._commonService.viewPDFReport(RedeemData);
    });
  };

  resetAllRedeemFilter() {
    this.dateCompoRefForRedeem.resetDateFilter();
    this.resetDateFilters();
    this.saleReportSearchParameter.BranchID = 0;
    this.saleReportSearchParameter.MembershipID = null;
  }
  // #endregion


  //#region  Breakdown

  // Breakdown Report Exoprt and view
  exportBreakdownReport(fileType: number) {
    let params = {
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      fileFormatTypeID: fileType,

    };
    this._httpService.get(SaleApi.getSaleBreakdown, params)
      .subscribe((BreakdownData: any) => {
        if (fileType == this.fileType.PDF) {
          this._commonService.createPDF(BreakdownData, this.reportName.SalesBreakDown);
        }
        if (fileType == this.fileType.Excel) {
          this._commonService.createExcel(BreakdownData, this.reportName.SalesBreakDown);
        };
      });
  };

  viewBreakdownReport(fileType: number) {
    let params = {
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      fileFormatTypeID: fileType,
    };

    this._httpService.get(SaleApi.getSaleBreakdown, params).subscribe((BreakdownData: any) => {
      this._commonService.viewPDFReport(BreakdownData);
    });
  };

  resetAllBreakdownFilter() {
    this.dateCompoRefForBreakDown.resetDateFilter();
    this.resetDateFilters();
  }

  //#endregion


  //#region  payment Breakdown

  // Breakdown Report Exoprt and view
  exportPaymentBreakdownReport(fileType: number) {
    let params = {
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      fileFormatTypeID: fileType,

    };
    this._httpService.get(SaleApi.getPaymentBreakdown, params)
      .subscribe((BreakdownData: any) => {
        if (fileType == this.fileType.PDF) {
          this._commonService.createPDF(BreakdownData, this.reportName.PaymentBreakDown);
        }
        if (fileType == this.fileType.Excel) {
          this._commonService.createExcel(BreakdownData, this.reportName.PaymentBreakDown);
        };
      });
  };

  viewPaymentBreakdownReport(fileType: number) {
    let params = {
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      fileFormatTypeID: fileType,
    };

    this._httpService.get(SaleApi.getPaymentBreakdown, params).subscribe((BreakdownData: any) => {
      this._commonService.viewPDFReport(BreakdownData);
    });
  };

  resetAllPaymentBreakdownFilter() {
    this.dateCompoRefForPaymentBreakDown.resetDateFilter();
    this.resetDateFilters();
  }

  //#endregion

    // Daily Refunds Report Exoprt and view
    exportDailyRefundsReport(fileType: number) {
      let params = {
        dateFrom: this.saleReportSearchParameter.DateFrom,
        dateTo: this.saleReportSearchParameter.DateTo,
        customerID: this.saleReportSearchParameter.CustomerID == 0 ? null : this.saleReportSearchParameter.CustomerID,
        fileFormatTypeID: fileType,

      };
      this._httpService.get(SaleApi.getSaleDailyRefund, params)
        .subscribe((DailyRefundsData: any) => {
          if (fileType == this.fileType.PDF) {
            this._commonService.createPDF(DailyRefundsData, this.reportName.DailyRefunds);
          }
          if (fileType == this.fileType.Excel) {
            this._commonService.createExcel(DailyRefundsData, this.reportName.DailyRefunds);
          };
        });
    };

    viewDailyRefundsReport(fileType: number) {
      let params = {
        dateFrom: this.saleReportSearchParameter.DateFrom,
        dateTo: this.saleReportSearchParameter.DateTo,
        customerID: this.saleReportSearchParameter.CustomerID == 0 ? null : this.saleReportSearchParameter.CustomerID,
        fileFormatTypeID: fileType,
      };

      this._httpService.get(SaleApi.getSaleDailyRefund, params).subscribe((DailyRefundsData: any) => {
        this._commonService.viewPDFReport(DailyRefundsData);
      });
    };

    resetAllDailyRefundsFilter() {
      this.dateCompoRefForDailyRefunds.resetDateFilter();
      this.clearSalyByStaffCustomerInput = "";
      this.resetDateFilters();
    }

    //#endregion

    //#region  PaymentsSummary

  // PaymentsSummary Report Exoprt and view
  exportPaymentsSummaryReport(fileType: number) {
    let params = {
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      fileFormatTypeID: fileType,

    };
    this._httpService.get(SaleApi.getSalePaymentsSummary, params)
      .subscribe((PaymentsSummaryData: any) => {
        if (fileType == this.fileType.PDF) {
          this._commonService.createPDF(PaymentsSummaryData, this.reportName.PaymentsSummary);
        }
        if (fileType == this.fileType.Excel) {
          this._commonService.createExcel(PaymentsSummaryData, this.reportName.PaymentsSummary);
        };
      });
  };

  viewPaymentsSummaryReport(fileType: number) {
    let params = {
      dateFrom: this.saleReportSearchParameter.DateFrom,
      dateTo: this.saleReportSearchParameter.DateTo,
      fileFormatTypeID: fileType,
    };

    this._httpService.get(SaleApi.getSalePaymentsSummary, params).subscribe((PaymentsSummaryData: any) => {
      this._commonService.viewPDFReport(PaymentsSummaryData);
    });
  };

  resetAllPaymentsSummaryFilter() {
    this.dateCompoRefForPaymentsSummary.resetDateFilter();
    this.resetDateFilters();
  }

  //#endregion

  resetDateFilters() {
    this.saleReportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat),
      this.saleReportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
  };

  getSelectedStaff(staff: AllPerson) {
    this.saleReportSearchParameter.StaffID = staff.StaffID;
  }
  displayStaffName(user?: AllPerson): string | undefined {
    return user ? user.FirstName + ' ' + user.LastName : undefined;
  }

  getSelectedCustomer(customer: AllPerson) {
    this.saleReportSearchParameter.CustomerID = customer.CustomerID;
  }
  displayCustomerName(user?: AllPerson): string | undefined {
    return user ? user.FirstName + ' ' + user.LastName : undefined;
  }
  displayClientName(user?: AllPerson): string | undefined {
    return user ? user.FirstName + ' ' + user.LastName : undefined;
  }
  filterProducts(productCategoryID: number) {
    if (productCategoryID != null) {
      this.filteredProcductList = this.procductList.filter(c => c.ProductCategoryID == productCategoryID);
      this.saleReportSearchParameter.ProductID = null;
      //this.filteredProcductList.splice(0, 0, { ProductID: null, ProductName: "All", IsActive: true });
    } else {
      this.filteredProcductList = this.procductList;
      this.saleReportSearchParameter.ProductID = null;
      //this.filteredProcductList.splice(0, 0, { ProductID: null, ProductName: "All", IsActive: true });
    }

  }
  filterService(serviceCategoryID: number) {

    if (serviceCategoryID != null) {
      this.filteredServiceList = this.serviceList.filter(c => c.ServiceCategoryID == serviceCategoryID);
    } else {
      this.filteredServiceList = this.serviceList;
    }
    // this.filteredServiceList.splice(0, 0, { ServiceID: 0, ServiceName: "All", IsActive: true });
    this.saleReportSearchParameter.ServiceID = 0;
  }

  filterClass(classCategoryID: number) {

    if (classCategoryID != null) {
      this.filteredClassList = this.classList.filter(c => c.ClassCategoryID == classCategoryID);
    } else {
      this.filteredClassList = this.classList;
    }
    // this.filteredServiceList.splice(0, 0, { ServiceID: 0, ServiceName: "All", IsActive: true });
    this.saleReportSearchParameter.ClassID = 0;
  }

  reciviedDateToAllSale($event) {

    let dateTo = new Date($event.DateTo);
    let dateFrom = new Date($event.DateFrom);
    var Time = dateTo.getTime() - dateFrom.getTime();
    var daysDifference = Time / (1000 * 3600 * 24); //Diference in Days

    if (daysDifference > 30) {
      this.dateCompoRefForAllSale.onFromDateChangeForParent($event.DateFrom);
      $event.DateTo = dateFrom.setMonth(dateFrom.getMonth() + 1);
      $event.DateTo = this._dateTimeService.convertDateObjToString($event.DateTo, this.dateFormat)
      this.dateCompoRefForAllSale.onToDateChangeForParent($event.DateTo);

      this.saleReportSearchParameter.DateFrom = $event.DateFrom;
      this.saleReportSearchParameter.DateTo = $event.DateTo;
    } else {
      this.saleReportSearchParameter.DateFrom = $event.DateFrom;
      this.saleReportSearchParameter.DateTo = $event.DateTo;
    }
    if (new Date($event.DateFrom) < this.dateCompoRefForAllSale.branchDate) {
      this.dateCompoRefForAllSale.toMaxDate = new Date($event.DateFrom);
      this.dateCompoRefForAllSale.toMaxDate.setMonth(this.dateCompoRefForAllSale.toMaxDate.getMonth() + 1);
    }

  }

  reciviedDateTo($event) {
    this.saleReportSearchParameter.DateFrom = $event.DateFrom;
    this.saleReportSearchParameter.DateTo = $event.DateTo;
  }

  changePaymentMethod(SaleSourceTypeID: number) {
    this.paymentTypeList = [];
    this.setDefaultPaymentGateWay();
    // if (SaleSourceTypeID == 0) {
    //   this.paymentTypeList = Configurations.PaymentType;
    // }
    // if (SaleSourceTypeID == 1) {
    //   this.paymentTypeList = Configurations.PaymentType;
    // }
    // else if (SaleSourceTypeID == 2) {
    //   this.paymentTypeList = Configurations.PaymentType.filter(x => x.SaleTypeID != 1 && x.SaleTypeID != 3);
    // }
    // this.saleReportSearchParameter.SaleTypeID = this.paymentTypeList[0].SaleTypeID;
  }

  setDefaultValues() {
    if (this.productCategoryList) {
      this.productCategoryList?.splice(0, 0, { ProductCategoryID: null, ProductCategoryName: "All", IsActive: true });
      
      //this.filteredProcductList.splice(0, 0, { ProductID: null, ProductName: "All", IsActive: true });
    }
    if(this.productBrandList){
      this.productBrandList?.splice(0, 0, { BrandID: null, BrandName: "All", IsActive: true });
    }
  };

  setClassesDefaultValues() {
    if (this.classCategoryList) {
      this.classCategoryList?.splice(0, 0, { ClassCategoryID: null, ClassCategoryName: "All", IsActive: true });
    }
  };

  setServicesDefaultValues() {
    if (this.serviceCategoryList) {
      this.serviceCategoryList?.splice(0, 0, { ServiceCategoryID: null, ServiceCategoryName: "All", IsActive: true })
      //this.filteredServiceList.splice(0, 0, { ServiceID: 0, ServiceName: "All", IsActive: true });
      this.saleReportSearchParameter.ServiceID = 0;
    }


  };

  onChangeAllSalesSaleType(SaleSourceTypeID){
    if(SaleSourceTypeID == 2 || SaleSourceTypeID == 4){
      this.PaymentSaleType = Configurations.PaymentSaleType.filter(i => i.SaleTypeID !== 1 && i.SaleTypeID !== 4);
    } else if(SaleSourceTypeID > 0){
      this.PaymentSaleType = Configurations.PaymentSaleType;
    }
    this.saleReportSearchParameter.SaleTypeID = this.PaymentSaleType[0].SaleTypeID;
    this. onAllSalePaymentMethodChange();
  }

  setDefaultPaymentGateWay() {
    this.paymentTypeList = this.paymentGateList.filter(x => x.SuourceType == this.saleReportSearchParameter.SaleSourceTypeID);
    // this.paymentGateWayTypeListForCashOther = this.paymentGateList.filter(x => x.SuourceType == this.saleReportSearchParameter.SaleSourceTypeID && x.PaymentGatewayID == 1);
    // if (this.saleReportSearchParameter.SaleSourceTypeID == 0) {
    // }
    // else
    //   if (this.saleReportSearchParameter.SaleSourceTypeID == 0) {
    //     this.paymentTypeList = this.paymentGateList.filter(x => x.SuourceType == this.saleReportSearchParameter.SaleSourceTypeID)
    //   }
    this.saleReportSearchParameter.SaleTypeID = 0;
  }

  onAllSalePaymentMethodChange(){
    this.paymentTypeList = this.paymentGateList.filter(x => x.SuourceType == this.saleReportSearchParameter.SaleSourceTypeID);

    if(this.saleReportSearchParameter.SaleTypeID == 1){
      this.paymentTypeList = this.paymentTypeList.filter(pt => pt.PaymentGatewayID == this.saleReportSearchParameter.SaleTypeID);
      this.saleReportSearchParameter.PaymentGateWayID = this.paymentTypeList[0].PaymentGatewayID;
    } else if (this.saleReportSearchParameter.SaleTypeID == 3){
      this.paymentTypeList = this.paymentTypeList.filter(pt => pt.PaymentGatewayID == this.saleReportSearchParameter.SaleTypeID);
      this.saleReportSearchParameter.PaymentGateWayID = this.paymentTypeList[0].PaymentGatewayID;
    } else if(this.saleReportSearchParameter.SaleTypeID == 4 || this.saleReportSearchParameter.SaleTypeID == 9){
      this.paymentTypeList = this.paymentTypeList.filter(pt => pt.PaymentGatewayID == 7);
      this.saleReportSearchParameter.PaymentGateWayID = this.paymentTypeList[0].PaymentGatewayID;
    } else if(this.saleReportSearchParameter.SaleTypeID == 2){
      this.paymentTypeList = this.paymentTypeList.filter(pt => pt.PaymentGatewayID == 6 || pt.PaymentGatewayID == 2);
      this.saleReportSearchParameter.PaymentGateWayID = this.paymentTypeList[0].PaymentGatewayID;
    } else{
      this.saleReportSearchParameter.PaymentGateWayID = 0;
    }
    //this.paymentTypeList.filter

  }

  setPermissions() {
    this.allowedPages.SaleByProductReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.SaleByProductReport);
    this.allowedPages.SaleByServiceReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.SaleByServiceReport);
    this.allowedPages.SaleByClassReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.SaleByClassReport);
    this.allowedPages.SaleByStaffReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.SaleByStaffReport);
    this.allowedPages.AllSale = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.AllSaleReport);
    this.allowedPages.AllSaleSummary = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.SaleSummaryReport);
    this.allowedPages.AllSaleSummaryByItemReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.AllSaleSummaryByItemReport);
    this.allowedPages.StaffTips = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.StaffTips);
    this.allowedPages.AllCashOtherSale = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.AllCashOtherSale);
    this.allowedPages.MembershipBenefitsRedemption = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.MembershipBenefitsRedemption);

    this.allowedPages.PaymentsSummary = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.PaymentsSummary);
    this.allowedPages.SalesBreakdown = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.SalesBreakdown);
    this.allowedPages.PaymentBreakdown = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.PaymentBreakdown);
    this.allowedPages.DailyRefunds = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.DailyRefunds);
    // if( this.allowedPages.SaleByProductReport && ){
    //   this.filteredItemTypeList
    // }
  }

  filterItemList(packageID: number) {
    this.PaymentSaleType = Configurations.PaymentSaleType.filter(g => g.ItemTypeID != 9);
    switch (packageID) {
      case this.package.WellnessBasic:
        this.itemTypeList = Configurations.ItemTypeOnReport.filter(g => g.ItemTypeID == POSItemType.Service);
        this.allItemTypeList = Configurations.SaleItemTypeOnReport.filter(g => g.ItemTypeID == POSItemType.Service);
        this.setDefaultValue();
        break;
      case this.package.FitnessBasic:
        this.itemTypeList = Configurations.ItemTypeOnReport.filter(g => g.ItemTypeID == POSItemType.Class);
        this.allItemTypeList = Configurations.SaleItemTypeOnReport.filter(g => g.ItemTypeID == POSItemType.Class || g.ItemTypeID == POSItemType.Membership);
        this.setDefaultValue();
        break;
      case this.package.WellnessMedium:
        this.itemTypeList = Configurations.ItemTypeOnReport.filter(g => g.ItemTypeID == POSItemType.Service || g.ItemTypeID == POSItemType.Product);
        this.allItemTypeList = Configurations.SaleItemTypeOnReport.filter(g => g.ItemTypeID == POSItemType.Service || g.ItemTypeID == POSItemType.Product);
        this.setDefaultValue();
        break;
      case this.package.WellnessTop:
        this.itemTypeList = Configurations.ItemTypeOnReport.filter(g => g.ItemTypeID == POSItemType.Service || g.ItemTypeID == POSItemType.Product);
        this.allItemTypeList = Configurations.SaleItemTypeOnReport.filter(g => g.ItemTypeID == POSItemType.Service || g.ItemTypeID == POSItemType.Product || g.ItemTypeID == POSItemType.Membership);
        this.setDefaultValue();
        break;
      case this.package.FitnessMedium:
        this.itemTypeList = Configurations.ItemTypeOnReport.filter(g => g.ItemTypeID == POSItemType.Class || g.ItemTypeID == POSItemType.Product);
        this.allItemTypeList = Configurations.SaleItemTypeOnReport.filter(g => g.ItemTypeID == POSItemType.Class || g.ItemTypeID == POSItemType.Product || g.ItemTypeID == POSItemType.Membership);
        this.setDefaultValue();
        break;
      case this.package.Full:
        this.PaymentSaleType = Configurations.PaymentSaleType;
        this.itemTypeList = Configurations.ItemTypeOnReport;
        this.allItemTypeList = Configurations.SaleItemTypeOnReport;
        break;
    }
  }

  setDefaultValue() {
    this.itemTypeList.splice(0, 0, { ItemTypeID: 0, ItemTypeName: "All", IsActive: true });
    this.allItemTypeList.splice(0, 0, { ItemTypeID: 0, ItemTypeName: "All", IsActive: true });
  }

  onNotifyCustomerID(customerID: number) {
    this.saleReportSearchParameter.CustomerID = customerID;
  }
  //#endregion
}
