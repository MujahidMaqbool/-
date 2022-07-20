/********************** Angular References *********************/
import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/internal/operators';
import { NgForm } from '@angular/forms';
import { SubscriptionLike } from "rxjs";
/********************** Services & Models *********************/
/* Models */
import { CustomerReportSearchParameter, MemberMembership, MembershipStatus, Membership, EnquirySourceType, PaymentStatusTypeList, PaymentGatewayList, MembershipCategoryType } from 'src/app/reports/models/member.reports.model';
import { AllPerson, ApiResponse } from 'src/app/models/common.model';

/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { CommonService } from "src/app/services/common.service";
/**********************  Common *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { Messages } from 'src/app/helper/config/app.messages';
import { CommonReportApi, MemberApi, MemberMembershipApi } from 'src/app/helper/config/app.webapi';
import { PersonType, CustomerType, FileType, ReportName, ENU_Package, ReportCustomerType } from 'src/app/helper/config/app.enums';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Report } from 'src/app/helper/config/app.module.page.enums';
import { AllSaleHistoryReportComponent } from '../common/all.sale.history.report/all.sale.history.report.component';
import { AllSaleBookedDetailReportComponent } from '../common/all.sale.booked.detail.report/all.sale.booked.detail.report.component';
import { DataSharingService } from 'src/app/services/data.sharing.service';

@Component({
  selector: 'member-reports',
  templateUrl: './member.reports.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})

export class MemberReportComponent implements OnInit, AfterViewInit {

  // #region Local Members
  @ViewChild('allCustomersToFromDateComoRef') allCustomersToFromDateComoRef: DateToDateFromComponent;
  @ViewChild('allMembersToFromDateComoRef') allMembersToFromDateComoRef: DateToDateFromComponent;
  @ViewChild('expiredAndTerminatedMembershipsReportsFiltersToFromDateComoRef') expiredAndTerminatedMembershipsReportsFiltersToFromDateComoRef: DateToDateFromComponent;
  
  @ViewChild('allMemberActivtiesToFromDateComoRef') allMemberActivtiesToFromDateComoRef: DateToDateFromComponent;
  @ViewChild('allMemberReferadToFromDateComoRef') allMemberReferadToFromDateComoRef: DateToDateFromComponent;
  @ViewChild('allMemberBySourceToFromDateComoRef') allMemberBySourceToFromDateComoRef: DateToDateFromComponent;
  @ViewChild('allMembershipStatusToFromDateComoRef') allMembershipStatusToFromDateComoRef: DateToDateFromComponent;
  @ViewChild('memberMembershipPaymentsDateComoRef') memberMembershipPaymentsDateComoRef: DateToDateFromComponent;
  
  @ViewChild('singleMemberForm') singleMemberForm: NgForm;
  @ViewChild('customerSearch_MemberAllSaleHistoryRef') customerSearch_MemberAllSaleHistoryRef: AllSaleHistoryReportComponent;
  @ViewChild('customerSearch_MemberAllSaleDetailByInvoiceRef') customerSearch_MemberAllSaleDetailByInvoiceRef: AllSaleBookedDetailReportComponent;

  /* Local Members */

  allowedPages = {
    AllCustomerReports: false,
    CustomerDetailReport: false,
    AllMemberReport: false,
    CustomerActivitiesReport: false,
    MemberMembershipReport: false,
    MemberMembershipPaymentReport: false,
    MemberReferralReport: false,
    CustomerBySourceReport: false,
    AllBookedDetailReport: true,
    AllSaleDetailReport: true,
    MembershipPaymentEmailTemplate: false,
    MemberMembershipContract: false,
    ExpiredAndTerminatedMemberships: false
  };

  MemberMembershipPaymentDateToLabelName: string =  "To - Payment Due Date";
  MemberMembershipPaymentDateFromLabelName: string = "From - Payment Due Date";

  AllMemberDateToLabelName: string =  "To - Membership Start Date";
  AllMemberDateFromLabelName: string = "From - Membership Start Date";

  isExist: boolean = false;
  isExistMemberships: boolean = false;
  dateFrom: Date;
  dateTo: Date;

  clearCustomerActivtiesInput: string = "";
  clearMemberMembershipInput: string = "";
  clearCustomerInput: string = "";
  clearRefferedByMemberInput: string = "";
  clearMemberMembershipPaymentsInput: string = "";
  clearSaleInvoiceMemberInput: string = "";
  leadActivitiesdateFrom: Date;
  leadActivitiesdateTo: Date;
  refferedMemberDateFrom: Date;
  refferedMemberDateTo: Date;

  memberBySourceTypeDateTo: Date;
  memberBySourceTypeDateFrom: Date;
  membershipStatusDateTo: Date;
  membershipStatusDateFrom: Date;
  memberActivtiesDateTo: Date;
  memberActivtiesDateFrom: Date;
  maxDate: Date = new Date();
  dateFormat: string = 'yyyy-MM-dd';
  currentDate: Date = new Date();
  /* Messages */
  messages = Messages;
  statusList = Configurations.Status;
  /* Models Refences */
  allPerson: AllPerson[];
  CustomerReportSearchParameter = new CustomerReportSearchParameter();
  customerTypeList: any = Configurations.CustomerTypes;
  customerStatusList: any = Configurations.CustomerReportStatus;
  expiredAndTerminatedMembershipsStatusList: any = Configurations.ExpiredAndTerminatedMembershipsStatus;
  searchPerson: FormControl = new FormControl();
  searchMember: FormControl = new FormControl();
  memberMembership: MemberMembership[];
  ActiveMemberMembership: any = [];
  ActiveMemberMembershipForPaymentReport: any = [];
  memberMembershipList: MemberMembership[];
  membershipStatusList: MembershipStatus[];
  enquirySourceTypeList: EnquirySourceType[];
  membershipCategoryType: MembershipCategoryType[];
  membershipList: Membership[];
  BranchPaymentGatewayList: PaymentGatewayList[];
  PaymentStatusTypeList: PaymentStatusTypeList[];
  fileType = FileType;
  reportName = ReportName;
  personType: PersonType;
  person: string;
  customerName: string;
  personCustomerType = CustomerType.Customer.toString();
  disableCustomerTypeDropdown = false;
  package = ENU_Package;
  packageIdSubscription: SubscriptionLike;
  CustomerTypeID = CustomerType.Customer;
  activityList = Configurations.CustomerActivityList;
  showAllSaleBookedReport: boolean = false;
  reportPackageBasedText: string = 'products/services/classes';
  moduleName: string = 'Customer';
  // #endregion

  constructor(
    private _httpService: HttpService,
    private _commonService: CommonService,
    private _dateTimeService: DateTimeService,
    private _messageService: MessageService,
    private _authService: AuthService,
    private _dataSharingService: DataSharingService,
    public cd:ChangeDetectorRef
  ) {
    this.getBranchSetting();
    this.person = CustomerType.Customer.toString();
  }

  ngOnInit() {
    this.activityList  = this.activityList.filter(i => i.value != 2);
    this.getCustomerReportFundamental();
    this.getPersonFormControl(); 
  
  }

  
  getPersonFormControl() {

    this.searchPerson.valueChanges
      .pipe(debounceTime(400))
      .subscribe(searchText => {
        if (searchText && searchText !== "" && searchText.length > 2) {
          if (typeof (searchText) === "string") {
            this._commonService.searchClient(searchText, this.CustomerReportSearchParameter.CustomerTypeID == 0 ? CustomerType.Customer : this.CustomerReportSearchParameter.CustomerTypeID)
              .subscribe(
                response => {
                  if (response.Result != null && response.Result.length) {
                    this.allPerson = response.Result;
                    this.allPerson.forEach(person => {
                      person.FullName = person.FirstName + " " + person.LastName;
                    });
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
    this.searchMember.valueChanges
      .pipe(debounceTime(400))
      .subscribe(searchText => {
        if (searchText && searchText !== "" && searchText.length > 2) {
          if (typeof (searchText) === "string") {
            this._commonService.searchClient(searchText, CustomerType.Member)
              .subscribe(
                response => {
                  if (response.Result != null && response.Result.length) {
                    this.allPerson = response.Result;
                    this.allPerson.forEach(person => {
                      person.FullName = person.FirstName + " " + person.LastName;
                    });
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
  }
  ngAfterViewInit() {
    this.showAllSaleBookedReport = true;
    // this.customerSearch_MemberAllSaleDetailByInvoiceRef?.setPlaceHolder();
    this.customerSearch_MemberAllSaleHistoryRef?.setPlaceHolder(this.CustomerTypeID);
  }
  // #region Events

  onFromDateChange(date: Date) {
    this.CustomerReportSearchParameter.DateFrom = this.getDateString(date, this.dateFormat); // 07/05/2018 MM/dd/yyyy
  }

  onToDateChange(date: Date) {
    this.CustomerReportSearchParameter.DateTo = this.getDateString(date, this.dateFormat); // 07/05/2018  MM/dd/yyyy
  }

  onNameChange(memberName: any) {
    if (memberName.length < 3) {
      this.CustomerReportSearchParameter.CustomerID = ReportCustomerType.ClientMember;
      this.isExist = false;
      this.isExistMemberships = false;
      this.ActiveMemberMembership = [];
      this.ActiveMemberMembershipForPaymentReport = [];
    }
  }
  onClearDate() {
    this.CustomerReportSearchParameter.CustomerID = ReportCustomerType.ClientMember;
    this.clearCustomerActivtiesInput = '';
    this.clearMemberMembershipInput = '';
    this.clearRefferedByMemberInput = '';
    this.clearMemberMembershipPaymentsInput = '';
    this.clearSaleInvoiceMemberInput = '';
    this.ActiveMemberMembership = [];
    this.ActiveMemberMembershipForPaymentReport = []; 
    this.CustomerReportSearchParameter.CustomerID = ReportCustomerType.ClientMember;
    this.CustomerReportSearchParameter.CustomerMemberMembership = undefined;
    this.isExist = false;
    this.isExistMemberships = false;
    this.CustomerReportSearchParameter.CustomerMembershipID = 0;
    this.CustomerReportSearchParameter.MembershipCategoryID = 0;
  }

  // #endregion

  // #region Methods

  async getBranchSetting() {
    this.currentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
    this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
      if (packageId && packageId > 0) {

        this.setPermissions(packageId);
      }

    });
    this.CustomerReportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat),
      this.CustomerReportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat)
  }

  getCustomerReportFundamental() {
    this._httpService.get(CommonReportApi.Fundamental).subscribe((res:ApiResponse) => {
      if(res && res.MessageCode > 0){
      this.membershipList = res.Result.MembershipList;
      this.membershipStatusList = res.Result.CustomerStatusList;
      this.enquirySourceTypeList = res.Result.EnquirySourceTypeList; 
      this.membershipCategoryType = res.Result.MembershipCategoryList;  
      this.BranchPaymentGatewayList =  res.Result.BranchPaymentGatewayList;
      this.PaymentStatusTypeList = res.Result.PaymentStatusTypeList;
      this.setDropdownDefaultValue();
      }else{
        this._messageService.showErrorMessage(res.MessageText);
      }
    });
  };
  // #region AllCustomerReports



  exportAllCustomerReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      customerStatusID: this.CustomerReportSearchParameter.customerStatusID,
      customerTypeID: this.CustomerReportSearchParameter.CustomerTypeID,
      dateFrom: this.CustomerReportSearchParameter.DateFrom,
      dateTo: this.CustomerReportSearchParameter.DateTo

    }

    this._httpService.get(CommonReportApi.viewAll, params)
      .subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            if (fileType == this.fileType.PDF) {
              this._commonService.createPDF(res, this.reportName.AllCustomers);
            }
            if (fileType == this.fileType.Excel) {
              this._commonService.createExcel(res, this.reportName.AllCustomers);
            };
          }
          else {
            this._messageService.showErrorMessage(res.MessageText);
          }

        })
  }

  viewAllCustomerReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      customerStatusID: this.CustomerReportSearchParameter.customerStatusID,
      customerTypeID: this.CustomerReportSearchParameter.CustomerTypeID,
      dateFrom: this.CustomerReportSearchParameter.DateFrom,
      dateTo: this.CustomerReportSearchParameter.DateTo
    }

    this._httpService.get(CommonReportApi.viewAll, params)
      .subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            this._commonService.viewPDFReport(res);
          }
          else {
            this._messageService.showErrorMessage(res.MessageText);
          }
        })
  }


  // Customer Detail

  exportCustomerDetailReport(fileType: number) {
    if (this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember || this.CustomerReportSearchParameter.CustomerID == undefined) {
      this._messageService.showErrorMessage(this.messages.Error.SelectCustomerName);
    }
    else {

      let params = {
        fileFormatTypeID: fileType,
        customerID: this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember ? null : this.CustomerReportSearchParameter.CustomerID

      }

      this._httpService.get(CommonReportApi.viewCustomerDetail, params)
        .subscribe(
          (res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
              if (fileType == this.fileType.PDF) {
                this._commonService.createPDF(res, this.reportName.CustomerDetail);
              }
              if (fileType == this.fileType.Excel) {
                this._commonService.createExcel(res, this.reportName.CustomerDetail);
              };
            }
            else {
              this._messageService.showErrorMessage(res.MessageText);
            }

          })
    }
  }

  viewCustomerDetailReport(fileType: number) {
    if (this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember || this.CustomerReportSearchParameter.CustomerID == undefined) {
      this._messageService.showErrorMessage(this.messages.Error.SelectCustomerName);
    }
    else {

      let params = {
        fileFormatTypeID: fileType,
        customerID: this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember ? null : this.CustomerReportSearchParameter.CustomerID
      }

      this._httpService.get(CommonReportApi.viewCustomerDetail, params)
        .subscribe(
          (res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
              this._commonService.viewPDFReport(res);
            }
            else {
              this._messageService.showErrorMessage(res.MessageText);
            }
          })
    }
  }

  resetCustomerDeatil() {
    this.clearCustomerInput = "";
  }

  //#endregion

  // #region AllMembersReports


  exportAllMemberReport(fileType: number) {
    let params = {
      FileFormatTypeID: fileType,
      MembershipID: this.CustomerReportSearchParameter.MembershipID == 0 ? null : this.CustomerReportSearchParameter.MembershipID,
      MembershipStatusID: this.CustomerReportSearchParameter.MembershipStatusTypeID == 0 ? null : this.CustomerReportSearchParameter.MembershipStatusTypeID,
      membershipCategoryID: this.CustomerReportSearchParameter.MembershipCategoryID == 0 ? null : this.CustomerReportSearchParameter.MembershipCategoryID,
      EnquirySourceTypeID: this.CustomerReportSearchParameter.EnquirySourceTypeID == 0 ? null : this.CustomerReportSearchParameter.EnquirySourceTypeID,
      JoiningDateFrom: this.CustomerReportSearchParameter.DateFrom,
      JoiningDateTo: this.CustomerReportSearchParameter.DateTo

    }

    // this._httpService.get(MemberApi.getAllMembersLocal, params)
    this._httpService.get(MemberApi.getAllMemberReport, params)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            if (fileType == this.fileType.PDF) {
              this._commonService.createPDF(response, this.reportName.AllMembers);
            }
            if (fileType == this.fileType.Excel) {
              this._commonService.createExcel(response, this.reportName.AllMembers);
            };
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }

        })
  }

  viewAllMemberReport(fileType: number) {
    let params = {
      FileFormatTypeID: fileType,
      MembershipID: this.CustomerReportSearchParameter.MembershipID == 0 ? null : this.CustomerReportSearchParameter.MembershipID,
      MembershipStatusID: this.CustomerReportSearchParameter.MembershipStatusTypeID == 0 ? null : this.CustomerReportSearchParameter.MembershipStatusTypeID,
      membershipCategoryID: this.CustomerReportSearchParameter.MembershipCategoryID == 0 ? null : this.CustomerReportSearchParameter.MembershipCategoryID,
      EnquirySourceTypeID: this.CustomerReportSearchParameter.EnquirySourceTypeID == 0 ? null : this.CustomerReportSearchParameter.EnquirySourceTypeID,
      JoiningDateFrom: this.CustomerReportSearchParameter.DateFrom,
      JoiningDateTo: this.CustomerReportSearchParameter.DateTo,
    }

    this._httpService.get(MemberApi.getAllMemberReport, params)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._commonService.viewPDFReport(response);
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
  }


  resetAllFilters() {
    this.CustomerReportSearchParameter = new CustomerReportSearchParameter();
    this.searchPerson.setValue('');
    this.searchMember.setValue('');
    this.allMembersToFromDateComoRef.resetDateFilter();
    this.allCustomersToFromDateComoRef.resetDateFilter();
    this.resetDateToFrom();
  }

  resetAllMemberReportFilters() {
    this.CustomerReportSearchParameter.EnquirySourceTypeID = 0;
    this.CustomerReportSearchParameter.MembershipID = 0;
    this.CustomerReportSearchParameter.MembershipStatusTypeID = 0;
    this.CustomerReportSearchParameter.MembershipCategoryID = 0;
    this.CustomerReportSearchParameter.DateFrom = "";
    this.CustomerReportSearchParameter.DateTo = "";
    this.dateFrom = null;
    this.dateTo = null;
    this.customerName = '';
    this.allMembersToFromDateComoRef.resetDateFilter();
    this.resetDateToFrom();
  }

  resetMemberMembershipReportFilters() {
    this.CustomerReportSearchParameter.EnquirySourceTypeID = 0;
    this.CustomerReportSearchParameter.MembershipID = 0;
    this.CustomerReportSearchParameter.MembershipStatusTypeID = 0;
    this.CustomerReportSearchParameter.DateFrom = "";
    this.CustomerReportSearchParameter.DateTo = "";
    this.dateFrom = null;
    this.dateTo = null;
    this.customerName = '';
    this.allMembersToFromDateComoRef.resetDateFilter();
    this.resetDateToFrom();
  }
  // #endregion



  // #region Sale Invoice


  exportSaleInvoiceReport(fileType: number) {
    if (this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember || this.CustomerReportSearchParameter.CustomerID == undefined) {
      this._messageService.showErrorMessage(this.messages.Error.SelectCustomer);
    }
    else {
      if (this.CustomerReportSearchParameter.CustomerMemberMembership != null || this.CustomerReportSearchParameter.CustomerMemberMembership != undefined) {
        let params = {
          fileFormatTypeID: fileType,
          customerMembershipID: this.CustomerReportSearchParameter.CustomerMemberMembership.CustomerMembershipID,
          customerID: this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember ? null : this.CustomerReportSearchParameter.CustomerID
        }

        this._httpService.get(MemberApi.ViewMembershipContract, params)
          .subscribe(
            (response: ApiResponse) => {
              if (response && response.MessageCode > 0) {
                if (fileType == this.fileType.PDF) {
                  this._commonService.createPDF(response, this.reportName.MembersMembershipContract);
                }
                if (fileType == this.fileType.Excel) {
                  this._commonService.createExcel(response, this.reportName.MembersMembershipContract);
                };
              }
              else {
                this._messageService.showErrorMessage(response.MessageText);
              }

            })
      } else {
        this._messageService.showErrorMessage(this.messages.Error.SelectCustomerMembership);
      }
    }
  }

  viewSaleInvoiceReport(fileType: number) {
    if (this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember || this.CustomerReportSearchParameter.CustomerID == undefined) {
      this._messageService.showErrorMessage(this.messages.Error.SelectCustomer);
    }
    else {
      if (this.CustomerReportSearchParameter.CustomerMemberMembership != null || this.CustomerReportSearchParameter.CustomerMemberMembership != undefined) {
        let params = {
          fileFormatTypeID: fileType,
          customerMembershipID: this.CustomerReportSearchParameter.CustomerMemberMembership.CustomerMembershipID == 0 ? null : this.CustomerReportSearchParameter.CustomerMemberMembership.CustomerMembershipID,
          customerID: this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember ? null : this.CustomerReportSearchParameter.CustomerID
        }

        this._httpService.get(MemberApi.ViewMembershipContract, params)
          .subscribe(
            (response: ApiResponse) => {
              if (response && response.MessageCode > 0) {
                this._commonService.viewPDFReport(response);
              }
              else {
                this._messageService.showErrorMessage(response.MessageText);
              }
            })
      } else {
        this._messageService.showErrorMessage(this.messages.Error.SelectCustomerMembership);
      }
    }
  }

  resetSaleInvoiceForm() {
    this.CustomerReportSearchParameter.CustomerMemberMembership = {};
    this.CustomerReportSearchParameter.CustomerMemberMembership = undefined;
    this.clearSaleInvoiceMemberInput = "";
    this.CustomerReportSearchParameter.CustomerID = ReportCustomerType.ClientMember;
    this.ActiveMemberMembership = [];
    this.isExist = false;
  }

  // #endregion



  // #region  MemberActivities

  exportCustomerActivitiesReport(fileType: number) {

    let params = {
      fileFormatTypeID: fileType,
      customerTypeID: this.CustomerReportSearchParameter.CustomerTypeID,
      customerID: this.CustomerReportSearchParameter.CustomerID,
      activityTypeID: this.CustomerReportSearchParameter.ActivityTypeID,
      dateFrom: this.CustomerReportSearchParameter.DateFrom,
      dateTo: this.CustomerReportSearchParameter.DateTo,
    }

    // let url = MemberApi.getAllMembershipPaymentsReport + this.CustomerReportSearchParameter.CustomerID + '/' + this.CustomerReportSearchParameter.SingleMembershipMemberID;
    if(this.CustomerReportSearchParameter.CustomerID){
      this._httpService.get(CommonReportApi.viewAllCustomerActivities, params).subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            if (fileType == this.fileType.PDF) {
              this._commonService.createPDF(response, this.reportName.CustomerActivities);
            }
            if (fileType == this.fileType.Excel) {
              this._commonService.createExcel(response, this.reportName.CustomerActivities);
            };
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
    } else{
      this._messageService.showErrorMessage("Please select customer.");
    }
  }

  viewCustomerActivitiesReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      customerTypeID: this.CustomerReportSearchParameter.CustomerTypeID,
      customerID: this.CustomerReportSearchParameter.CustomerID,
      activityTypeID: this.CustomerReportSearchParameter.ActivityTypeID,
      dateFrom: this.CustomerReportSearchParameter.DateFrom,
      dateTo: this.CustomerReportSearchParameter.DateTo,
    }
    //   let url = MemberApi.getRefferedByMemberReport + this.CustomerReportSearchParameter.CustomerID + '/' + this.CustomerReportSearchParameter.SingleMembershipMemberID;
    if(this.CustomerReportSearchParameter.CustomerID > 0){
    this._httpService.get(CommonReportApi.viewAllCustomerActivities, params).subscribe(
      (response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this._commonService.viewPDFReport(response);
        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      })
    } else{
      this._messageService.showErrorMessage("Please select customer.");
    }
  }

  resetMemberActivitiesReportFilters() {
    this.CustomerReportSearchParameter.ActivityTypeID = 0;
    this.CustomerReportSearchParameter.CustomerName = "";
    this.CustomerReportSearchParameter.CustomerID = ReportCustomerType.ClientMember;
    this.CustomerReportSearchParameter.customerStatusID = 1;
    this.CustomerReportSearchParameter.DateFrom = "";
    this.CustomerReportSearchParameter.DateTo = "";
    this.CustomerReportSearchParameter.CustomerTypeID = this.CustomerTypeID;
    this.leadActivitiesdateFrom = null;
    this.leadActivitiesdateTo = null;
    this.clearCustomerActivtiesInput = '';
    this.clearSaleInvoiceMemberInput = '';
    this.allMemberActivtiesToFromDateComoRef.resetDateFilter();
    this.resetDateToFrom();
  }

  // #endregion

  // #region TotalMembershipsagaintsinglmember

  exportMemberAllMembershipsReport(fileFormatTypeID: number) {
    // let params = {
    //   fileFormatTypeID: fileFormatTypeID,
    //   customerID: this.CustomerReportSearchParameter.CustomerID
    // }

    if (!this.CustomerReportSearchParameter.CustomerID || this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember) {
      this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Member"));
    } else {
      let url = MemberApi.getAllMembershipsReport.replace("{customerID}", this.CustomerReportSearchParameter.CustomerID.toString())
        .replace("{fileFormatTypeID}", fileFormatTypeID.toString());
      this._httpService.get(url)
        .subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              if (fileFormatTypeID == this.fileType.PDF) {
                this._commonService.createPDF(response, this.reportName.MemberMemberships);
              }
              if (fileFormatTypeID == this.fileType.Excel) {
                this._commonService.createExcel(response, this.reportName.MemberMemberships);
              };
            }
            else {
              this._messageService.showErrorMessage(response.MessageText);
            }
          })
    }
  }

  viewMemberAllMembershipsReport(fileType: number) {
    // let params = {
    //   fileFormatTypeID:fileType,
    //   customerID: this.CustomerReportSearchParameter.CustomerID
    // }
    if (!this.CustomerReportSearchParameter.CustomerID || this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember) {
      this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Member"));
    } else {
      let url = MemberApi.getAllMembershipsReport.replace("{customerID}", this.CustomerReportSearchParameter.CustomerID.toString())
        .replace("{fileFormatTypeID}", fileType.toString());

      this._httpService.get(url)
        .subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              this._commonService.viewPDFReport(response);
            }
            else {
              this._messageService.showErrorMessage(response.MessageText);
            }
          })
    }
  }

  // #endregion

  // #region TotalMembershipsPaymentsagaisntsinglemember

  reciviedDateToAllPayments($event) {

    let dateTo = new Date($event.DateTo);
    let dateFrom = new Date($event.DateFrom);
    var Time = dateTo.getTime() - dateFrom.getTime();
    var daysDifference = Time / (1000 * 3600 * 24); //Diference in Days

    if (daysDifference > 30) {
      this.memberMembershipPaymentsDateComoRef.onFromDateChangeForParent($event.DateFrom);
      $event.DateTo = dateFrom.setMonth(dateFrom.getMonth() + 1);
      $event.DateTo = this._dateTimeService.convertDateObjToString($event.DateTo, this.dateFormat)
      this.memberMembershipPaymentsDateComoRef.onToDateChangeForParent($event.DateTo);

      this.CustomerReportSearchParameter.DateFrom = $event.DateFrom;
      this.CustomerReportSearchParameter.DateTo = $event.DateTo;
    } else {
      this.CustomerReportSearchParameter.DateFrom = $event.DateFrom;
      this.CustomerReportSearchParameter.DateTo = $event.DateTo;
    }
    if (new Date($event.DateFrom) < this.memberMembershipPaymentsDateComoRef.branchDate) {
      this.memberMembershipPaymentsDateComoRef.toMaxDate = new Date($event.DateFrom);
      this.memberMembershipPaymentsDateComoRef.toMaxDate.setMonth(this.memberMembershipPaymentsDateComoRef.toMaxDate.getMonth() + 1);
    }

  }

  exportAllPayments(fileFormatTypeID: number) {
  
    if (this.CustomerReportSearchParameter.DateTo >= this.CustomerReportSearchParameter.DateFrom) {
      let _params = {
        fileFormatTypeID: fileFormatTypeID,
        customerID:  this.CustomerReportSearchParameter.CustomerID == 0 ? null : this.CustomerReportSearchParameter.CustomerID,
        customerMembershipID: this.CustomerReportSearchParameter.CustomerMembershipID == 0 ? null : this.CustomerReportSearchParameter.CustomerMembershipID,
        membershipCategoryID: this.CustomerReportSearchParameter.MembershipCategoryID == 0 ? null : this.CustomerReportSearchParameter.MembershipCategoryID,
        membershipStatusID: this.CustomerReportSearchParameter.MembershipStatusID == 0 ? null: this.CustomerReportSearchParameter.MembershipStatusID,
        paymentGatewayID: this.CustomerReportSearchParameter.PaymentGatewayID == 0 ? null: this.CustomerReportSearchParameter.PaymentGatewayID,
        paymentStatusTypeID: this.CustomerReportSearchParameter.PaymentStatusTypeID == 0 ? null: this.CustomerReportSearchParameter.PaymentStatusTypeID,
        dateFrom: this.CustomerReportSearchParameter.DateFrom,
        dateTo: this.CustomerReportSearchParameter.DateTo
      }

      // if(this.CustomerReportSearchParameter.CustomerID > 0){
        this._httpService.get(MemberApi.getMemberPastAndFuturePaymentsReport, _params)
        .subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              if (fileFormatTypeID == this.fileType.PDF) {
                this._commonService.createPDF(response, this.reportName.MembershipPayments);
              }
              if (fileFormatTypeID == this.fileType.Excel) {
                this._commonService.createExcel(response, this.reportName.MembershipPayments);
              };
            }
            else {
              this._messageService.showErrorMessage(response.MessageText);
            }
          })
      // } else{
      //   this._messageService.showErrorMessage("Please select Member");
      // }
      /**CustomerID / Customer is nullable (optional) */
     
             
    } else {
      this._messageService.showErrorMessage(this.messages.Error.Invalid_ToDate);
    }

  }

  viewAllPayments(fileType: number) {
    if (this.CustomerReportSearchParameter.DateTo >= this.CustomerReportSearchParameter.DateFrom) {
      let _params = {
        fileFormatTypeID: fileType,
        customerID:  this.CustomerReportSearchParameter.CustomerID == 0 ? null : this.CustomerReportSearchParameter.CustomerID,
        customerMembershipID: this.CustomerReportSearchParameter.CustomerMembershipID == 0 ? null : this.CustomerReportSearchParameter.CustomerMembershipID,
        membershipCategoryID: this.CustomerReportSearchParameter.MembershipCategoryID == 0 ? null : this.CustomerReportSearchParameter.MembershipCategoryID,
        membershipStatusID: this.CustomerReportSearchParameter.MembershipStatusID == 0 ? null: this.CustomerReportSearchParameter.MembershipStatusID,
        paymentGatewayID: this.CustomerReportSearchParameter.PaymentGatewayID == 0 ? null: this.CustomerReportSearchParameter.PaymentGatewayID,
        paymentStatusTypeID: this.CustomerReportSearchParameter.PaymentStatusTypeID == 0 ? null: this.CustomerReportSearchParameter.PaymentStatusTypeID,
        dateFrom: this.CustomerReportSearchParameter.DateFrom,
        dateTo: this.CustomerReportSearchParameter.DateTo
      }
      /**CustomerID / Customer is nullable (optional) */
     //if(this.CustomerReportSearchParameter.CustomerID > 0){
      this._httpService.get(MemberApi.getMemberPastAndFuturePaymentsReport, _params)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._commonService.viewPDFReport(response);
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
    //  } else{
    //   this._messageService.showErrorMessage("Please select Member");
    //  }
     

    } else {
      this._messageService.showErrorMessage(this.messages.Error.Invalid_ToDate);
    }
  }

  resetMemberMembershipPaymentsReportsFilters(){
    this.CustomerReportSearchParameter.CustomerID = 0;
    this.CustomerReportSearchParameter.CustomerMembershipID = 0;
    this.CustomerReportSearchParameter.MembershipCategoryID = 0;
    this.CustomerReportSearchParameter.MembershipStatusID = 0;
    this.CustomerReportSearchParameter.PaymentGatewayID = 0;
    this.CustomerReportSearchParameter.PaymentStatusTypeID = 0;
    this.CustomerReportSearchParameter.DateFrom = "";
    this.CustomerReportSearchParameter.DateTo = "";
    this.dateFrom = null;
    this.dateTo = null;
    this.clearMemberMembershipPaymentsInput = '';
    this.memberMembershipPaymentsDateComoRef.resetDateFilter();
    this.searchPerson.setValue('');
    this.resetDateToFrom();
  }

  // #endregion

  // #region SingleMember'sMembershippayment

  exportAllMembershipPayments(fileType: number) {
    if (!this.CustomerReportSearchParameter.CustomerID || this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember) {
      this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Member"));
    } else {
      let url = MemberApi.getAllMembershipPaymentsReport + this.CustomerReportSearchParameter.CustomerID + '/' + this.CustomerReportSearchParameter.SingleMembershipMemberID;

      this._httpService.get(url).subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            if (fileType == this.fileType.PDF) {
              this._commonService.createPDF(response, this.reportName.MembershipPayments);
            }
            if (fileType == this.fileType.Excel) {
              this._commonService.createExcel(response, this.reportName.MembershipPayments);
            };
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
    }
  }

  viewAllMembershipPayments() {
    if (!this.CustomerReportSearchParameter.CustomerID || this.CustomerReportSearchParameter.CustomerID == ReportCustomerType.ClientMember) {
      this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Member"));
    } else {
      let url = MemberApi.getAllMembershipPaymentsReport + this.CustomerReportSearchParameter.CustomerID + '/' + this.CustomerReportSearchParameter.SingleMembershipMemberID;
      this._httpService.get(url).subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._commonService.viewPDFReport(response);
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
    }
  }

  resetAllMembershipPaymentsFilters() {
    this.CustomerReportSearchParameter.CustomerName = "";
    this.CustomerReportSearchParameter.SingleMembershipMemberID = null;
  }

  // #endregion

  // #region ReferalReports

  exportRefferedByMemberReport(fileType: number) {
    if (this.CustomerReportSearchParameter.DateTo >= this.CustomerReportSearchParameter.DateFrom) {
      let params = {
        fileFormatTypeID: fileType,
        refrenceCustomerID: this.CustomerReportSearchParameter.CustomerID,
        dateFrom: this.CustomerReportSearchParameter.DateFrom,
        dateTo: this.CustomerReportSearchParameter.DateTo,
      }

      if(this.CustomerReportSearchParameter.CustomerID > 0){
        this._httpService.get(CommonReportApi.viewAllCustomerReferral, params).subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              if (fileType == this.fileType.PDF) {
                this._commonService.createPDF(response, this.reportName.RefferedByMember);
              }
              if (fileType == this.fileType.Excel) {
                this._commonService.createExcel(response, this.reportName.RefferedByMember);
              };
            }
            else {
              this._messageService.showErrorMessage(response.MessageText);
            }
          })
      } else{
        this._messageService.showErrorMessage("Please select Customer");
      }
     
    } else {
      this._messageService.showErrorMessage(this.messages.Error.Invalid_ToDate);
    }
  }

  viewRefferedByMemberReport(fileType: number) {
    if (this.CustomerReportSearchParameter.DateTo >= this.CustomerReportSearchParameter.DateFrom) {
      let params = {
        fileFormatTypeID: fileType,
        refrenceCustomerID: this.CustomerReportSearchParameter.CustomerID,
        dateFrom: this.CustomerReportSearchParameter.DateFrom,
        dateTo: this.CustomerReportSearchParameter.DateTo,
      }
      if(this.CustomerReportSearchParameter.CustomerID > 0){
        this._httpService.get(CommonReportApi.viewAllCustomerReferral, params).subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              if (fileType == this.fileType.PDF) {
                this._commonService.viewPDFReport(response);
              }
            }
            else {
              this._messageService.showErrorMessage(response.MessageText);
            }
          })
      } else{
        this._messageService.showErrorMessage("Please select Customer");
      }


    } else {
      this._messageService.showErrorMessage(this.messages.Error.Invalid_ToDate);
    }
  }

  resetReferalReportsFilters() {
    this.CustomerReportSearchParameter.CustomerName = "";
    this.CustomerReportSearchParameter.DateFrom = "";
    this.CustomerReportSearchParameter.DateTo = "";
    this.dateFrom = null;
    this.dateTo = null;
    this.clearRefferedByMemberInput = '';
    this.allMemberReferadToFromDateComoRef.resetDateFilter();
    this.searchPerson.setValue('');
    this.resetDateToFrom();
  }

  resetMembershipContract() {
    this.CustomerReportSearchParameter.CustomerID = ReportCustomerType.ClientMember;
    this.CustomerReportSearchParameter.CustomerName = "";
    this.CustomerReportSearchParameter.DateFrom = "";
    this.CustomerReportSearchParameter.DateTo = "";
    this.dateFrom = null;
    this.dateTo = null;
    this.CustomerReportSearchParameter.CustomerMemberMembership = undefined;
    this.clearRefferedByMemberInput = '';
    this.resetDateToFrom();
  }

  // #endregion

  // #region ReportsByMemberSource

  exportCustomerBySourceTypeReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      customerTypeID: this.CustomerReportSearchParameter.CustomerTypeID,
      enquirySourceTypeID: this.CustomerReportSearchParameter.EnquirySourceTypeID,
      dateFrom: this.CustomerReportSearchParameter.DateFrom,
      dateTo: this.CustomerReportSearchParameter.DateTo,
    }
    // if (!this.CustomerReportSearchParameter.EnquirySourceTypeID || this.CustomerReportSearchParameter.EnquirySourceTypeID == 0) {
    //   this._messageService.showErrorMessage(this.messages.Validation.Enquiry_Source_Type_Required);
    // }
    // else {
    this._httpService.get(CommonReportApi.viewAllCustomerBySourceType, params)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            if (fileType == this.fileType.PDF) {
              this._commonService.createPDF(response, this.reportName.CustomerBySourceType);
            }
            if (fileType == this.fileType.Excel) {
              this._commonService.createExcel(response, this.reportName.CustomerBySourceType);
            };
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
    // }
  }

  viewCustomerBySourceTypeReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      customerTypeID: this.CustomerReportSearchParameter.CustomerTypeID,
      enquirySourceTypeID: this.CustomerReportSearchParameter.EnquirySourceTypeID,
      dateFrom: this.CustomerReportSearchParameter.DateFrom,
      dateTo: this.CustomerReportSearchParameter.DateTo,
    }
    // if (!this.CustomerReportSearchParameter.EnquirySourceTypeID || this.CustomerReportSearchParameter.EnquirySourceTypeID == 0) {
    //   this._messageService.showErrorMessage(this.messages.Validation.Enquiry_Source_Type_Required);
    // }
    // else {
    this._httpService.get(CommonReportApi.viewAllCustomerBySourceType, params)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._commonService.viewPDFReport(response);
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
    // }
  }

  resetSourceTypeFilters() {
    this.CustomerReportSearchParameter = new CustomerReportSearchParameter();
    this.CustomerReportSearchParameter.EnquirySourceTypeID = 0;
    this.CustomerReportSearchParameter.DateFrom = "";
    this.CustomerReportSearchParameter.DateTo = "";
    this.dateFrom = null;
    this.dateTo = null;
    this.allMemberBySourceToFromDateComoRef.resetDateFilter();
    this.resetDateToFrom();

  }

  // #endregion

  // #region ViewAllMembership'sStatusReports

  exportAllMembershipsStatusReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      dateFrom: this.CustomerReportSearchParameter.DateFrom,
      dateTo: this.CustomerReportSearchParameter.DateTo,
    }

    this._httpService.get(MemberApi.getViewAllMembershipStatusReport, params)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            if (fileType == this.fileType.PDF) {
              this._commonService.createPDF(response, this.reportName.MembershipsStatus);
            }
            if (fileType == this.fileType.Excel) {
              this._commonService.createExcel(response, this.reportName.MembershipsStatus);
            };
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
  }

  viewAllMembershipsStatusReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      dateFrom: this.CustomerReportSearchParameter.DateFrom,
      dateTo: this.CustomerReportSearchParameter.DateTo,
    }

    this._httpService.get(MemberApi.getViewAllMembershipStatusReport, params)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._commonService.viewPDFReport(response);
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
  }

  resetMembershipStatusFilters() {
    this.CustomerReportSearchParameter.DateTo = "";
    this.CustomerReportSearchParameter.DateFrom = "";
    this.allMembershipStatusToFromDateComoRef.resetDateFilter();
    this.resetDateToFrom();

  }

  // #endregion



  getDateString(dateValue: Date, dateFormat: string) {
    return this._dateTimeService.convertDateObjToString(dateValue, dateFormat);
  }

  getSelectedCustomerID(person: AllPerson) {
    this.CustomerReportSearchParameter.CustomerID = person.CustomerID;
  }

  getSelectedMemberID(person: AllPerson) {
    this.CustomerReportSearchParameter.CustomerID = person.CustomerID;
    this.getSelectedMemberMemberships();
  }

  getSelectedMemberMemberships() {
    let _url = MemberMembershipApi.getActiveMemberMembership + "?customerID=" + this.CustomerReportSearchParameter.CustomerID;
    this._httpService.get(_url)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            //this.CustomerReportSearchParameter.MembershipID = 0;
            this.isExist = response.Result && response.Result != null ? true : false;
            this.ActiveMemberMembership = [];
            if (this.isExist) {
              this.ActiveMemberMembership = response.Result;
              this.CustomerReportSearchParameter.CustomerMemberMembership = undefined;
            }
            else {
              this.isExist = false;
            }

          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Membership"));
        }
      );
  }

  getSelectedMemberName(person: AllPerson) {
    this.CustomerReportSearchParameter.CustomerName = person.FullName;

  }

  displayMemberName(user?: AllPerson) {
    return user ? user.FullName : undefined;
  }

  getSelectedMemberships(person: AllPerson) {
    this.CustomerReportSearchParameter.CustomerID = person.CustomerID;
   // this.getMemberMemberships();

  }

  getSelectedMemberships1(person: AllPerson) {
    this.CustomerReportSearchParameter.CustomerID = person.CustomerID;
    //  this.getSingleMemberMemberships();
  }

  getMemberMemberships() {
    this._httpService.get(MemberMembershipApi.getMemberMembershipByID + this.CustomerReportSearchParameter.CustomerID)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this.CustomerReportSearchParameter.MembershipID = 0;
            this.memberMembership = response.Result;
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Membership"));
        }
      );
  }

  getSingleMemberMemberships() {
    let params = {
      customerID: this.CustomerReportSearchParameter.CustomerID,
      pageNumber: 1,
      pageSize: 20
    }

    this._httpService.get(MemberMembershipApi.getMemberMembershipByID, params)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.CustomerReportSearchParameter.SingleMembershipMemberID = 0;
          this.memberMembershipList = res.Result;
        } else {
          this._messageService.showErrorMessage(res.MessageText);
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Membership"));
        }
      );
  }

  reciviedDateTo($event) {
    this.CustomerReportSearchParameter.DateFrom = $event.DateFrom;
    this.CustomerReportSearchParameter.DateTo = $event.DateTo;
  }


  setDropdownDefaultValue() {
    this.membershipList.splice(0, 0, { MembershipID: 0, MembershipName: "All" });
    this.membershipStatusList.splice(0, 0, { MembershipStatusTypeID: 0, MembershipStatusTypeName: "All" });
    this.enquirySourceTypeList.splice(0, 0, { EnquirySourceTypeID: 0, EnquirySourceTypeName: "All" });
    this.membershipCategoryType.splice(0, 0, { MembershipCategoryID: 0, CategoryName: "All" });
    this.PaymentStatusTypeList.splice(0, 0, { PaymentStatusTypeID: 0, PaymentStatusTypeName: "All" });
    this.BranchPaymentGatewayList.splice(0, 0, { PaymentGatewayID: 0, PaymentGatewayName: "All" });
   this.setMemberPaymentReportDefaultValues();

  };

  setPermissions(packageId) {
    switch (packageId) {

      case this.package.WellnessBasic:
        this.CustomerReportSearchParameter.CustomerTypeID = 1;
        this.CustomerTypeID = 1;
        this.disableCustomerTypeDropdown = true;
        this.activityList = Configurations.ClientActivityList;
        this.CustomerReportSearchParameter.ActivityTypeID = 1;
        this.reportPackageBasedText = 'services';
        break;
      case this.package.WellnessMedium:
        this.CustomerReportSearchParameter.CustomerTypeID = 1;
        this.CustomerTypeID = 1;
        this.disableCustomerTypeDropdown = true;
        this.activityList = Configurations.ClientActivityList;
        this.CustomerReportSearchParameter.ActivityTypeID = 1;
        this.reportPackageBasedText = 'products/services';
        break;

      case this.package.WellnessTop:
        this.CustomerReportSearchParameter.CustomerTypeID = 1;
        this.CustomerTypeID = 1;
        this.disableCustomerTypeDropdown = true;
        this.activityList = Configurations.ClientActivityList;
        this.CustomerReportSearchParameter.ActivityTypeID = 1;
        this.reportPackageBasedText = 'products/services';
        break;

      case this.package.FitnessBasic:
        this.CustomerReportSearchParameter.CustomerTypeID = 3;
        this.CustomerTypeID = 3;
        this.disableCustomerTypeDropdown = true;
        this.activityList = Configurations.MemberActivityList;
        this.CustomerReportSearchParameter.ActivityTypeID = 1;
        this.reportPackageBasedText = 'classes';
        break;

      case this.package.FitnessMedium:
        this.CustomerReportSearchParameter.CustomerTypeID = 3;
        this.CustomerTypeID = 3;
        this.disableCustomerTypeDropdown = true;
        this.activityList = Configurations.MemberActivityList;
        this.CustomerReportSearchParameter.ActivityTypeID = 1;
        this.reportPackageBasedText = 'products/classes';
        break;

      case this.package.Full:
        this.CustomerReportSearchParameter.CustomerTypeID = 0;
        this.CustomerTypeID = 0;
        this.reportPackageBasedText = 'products/services/classes';
        break;

    }
    this.allowedPages.AllCustomerReports = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.AllCustomerReports);
    this.allowedPages.CustomerActivitiesReport = packageId == 1 || packageId == 4 ? false : true;
    this.allowedPages.MemberMembershipPaymentReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.MemberMembershipPaymentReport);
    this.allowedPages.CustomerBySourceReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.MemberBySourceReport);
    this.allowedPages.MemberMembershipReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.MemberMembershipReport);
    this.allowedPages.MemberReferralReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.MemberReferralReport);
    this.allowedPages.MembershipPaymentEmailTemplate = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.MembershipPaymentEmailTemplate);
    this.allowedPages.AllMemberReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.AllMemberReport);
    this.allowedPages.CustomerDetailReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.CustomerDetailReport);
    this.allowedPages.MemberMembershipContract = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.MemberMembershipContract);
    this.allowedPages.ExpiredAndTerminatedMemberships = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.ExpiredAndTerminatedMemberships);
  }

  resetDateToFrom() {
    this.CustomerReportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat),
      this.CustomerReportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
  }
  onCustomerTypeChange() {
    if (this.CustomerReportSearchParameter.CustomerTypeID == CustomerType.Client) {
      this.activityList = Configurations.ClientActivityList;
      this.searchPerson.setValue('');
    } else if (this.CustomerReportSearchParameter.CustomerTypeID == CustomerType.Member) {
      this.activityList = Configurations.MemberActivityList;
      this.searchPerson.setValue('');
    } else {
      this.activityList = Configurations.CustomerActivityList;
    }
  }

  /**to see past and future payments of a member */
 
  //**Set default values of Member payments report */
  setMemberPaymentReportDefaultValues() {   
    this.CustomerReportSearchParameter.PaymentStatusTypeID = 0;
    this.CustomerReportSearchParameter.CustomerMembershipID = 0;
    this.CustomerReportSearchParameter.MembershipCategoryID = 0;
    this.CustomerReportSearchParameter.MembershipStatusID = 1;
    this.CustomerReportSearchParameter.PaymentGatewayID = 2;
    this.CustomerReportSearchParameter.DateFrom = "";
    this.CustomerReportSearchParameter.DateTo = "";
    this.customerName = '';
    this.resetDateToFrom();
    this.cd.markForCheck();
  }
  getSelectedMemberIDForPaymentsReport(person: AllPerson) {
    this.CustomerReportSearchParameter.CustomerID = person.CustomerID;
    this.getSelectedMemberMembershipsForPaymentsReport();
  }

  getSelectedMemberMembershipsForPaymentsReport() {
    let _url = MemberMembershipApi.getActiveMemberMembership + "?customerID=" + this.CustomerReportSearchParameter.CustomerID;
    this._httpService.get(_url)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this.isExistMemberships = response.Result && response.Result != null ? true : false;
            this.ActiveMemberMembershipForPaymentReport = [];            
            if (this.isExistMemberships) {
              this.ActiveMemberMembershipForPaymentReport = response.Result;
              this.CustomerReportSearchParameter.CustomerMemberMembership = undefined;
            }
            else {
              this.isExistMemberships = false;
            }

          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Member Membership"));
        }
      );
  }
  /**********End to see past and future payments of a member*********** */

  // #endregion

  /// Expired & Terminated Memberships
  exportExpiredAndTerminatedMembershipsReport(fileType: number) {
      let params = {
        fileFormatTypeID: fileType,
        membershipStatusID: this.CustomerReportSearchParameter.MembershipStatusID > 0 ? this.CustomerReportSearchParameter.MembershipStatusID : null,
        dateFrom: this.CustomerReportSearchParameter.DateFrom,
        dateTo: this.CustomerReportSearchParameter.DateTo,
      }

      this._httpService.get(CommonReportApi.viewAllExpiredTerminatedMemberships, params).subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            if (fileType == this.fileType.PDF) {
              this._commonService.createPDF(response, this.reportName.ExpiredAndTerminatedMemberships);
            }
            if (fileType == this.fileType.Excel) {
              this._commonService.createExcel(response, this.reportName.ExpiredAndTerminatedMemberships);
            };
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
  }

  viewExpiredAndTerminatedMembershipsReport(fileType: number) {

      let params = {
        fileFormatTypeID: fileType,
        membershipStatusID: this.CustomerReportSearchParameter.MembershipStatusID > 0 ? this.CustomerReportSearchParameter.MembershipStatusID : null,
        dateFrom: this.CustomerReportSearchParameter.DateFrom,
        dateTo: this.CustomerReportSearchParameter.DateTo,
      }

        this._httpService.get(CommonReportApi.viewAllExpiredTerminatedMemberships, params).subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              if (fileType == this.fileType.PDF) {
                this._commonService.viewPDFReport(response);
              }
            }
            else {
              this._messageService.showErrorMessage(response.MessageText);
            }
          })
    } 

  resetExpiredAndTerminatedMembershipsReportsFilters() {
    this.CustomerReportSearchParameter.MembershipStatusID = 0;
    this.dateFrom = null;
    this.dateTo = null;
    this.expiredAndTerminatedMembershipsReportsFiltersToFromDateComoRef.resetDateFilter();
  }
 

}
