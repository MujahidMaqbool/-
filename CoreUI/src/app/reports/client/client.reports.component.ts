/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/internal/operators';
/********************** Services & Models *********************/
/* Models */
import { ClientReportSearchParam } from 'src/app/reports/models/client.reports.model';
import { AllPerson, ApiResponse } from 'src/app/models/common.model';
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
/**********************  Common *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { ClientApi, CustomerApi } from 'src/app/helper/config/app.webapi';
import { FileType, PersonType, CustomerType, ReportTab, FileFormatType, ReportName } from 'src/app/helper/config/app.enums';
import { DateTimeService } from 'src/app/services/date.time.service';
import { Configurations } from 'src/app/helper/config/app.config';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { CommonService } from 'src/app/services/common.service';
import { CustomerSearchComponent } from 'src/app/shared/components/customer-search/customer.search.component';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Report } from 'src/app/helper/config/app.module.page.enums';
import { AllSaleHistoryReportComponent } from '../common/all.sale.history.report/all.sale.history.report.component';
import { AllSaleBookedDetailReportComponent } from '../common/all.sale.booked.detail.report/all.sale.booked.detail.report.component';

@Component({
  selector: 'client-report',
  templateUrl: './client.reports.component.html'
})

export class ClientReportComponent implements OnInit {

  allowedPages = {
    AllClientReport: false,
    CllientDetailReport: false,
    ClientActivitiesReport: false,
    AllBookedDetailReport: false,
    AllSaleDetailReport: false
  };

  @ViewChild('allClientsToFromDateComoRef') allClientsToFromDateComoRef: DateToDateFromComponent;
  @ViewChild('clientActivtiesToFromDateComoRef') clientActivtiesToFromDateComoRef: DateToDateFromComponent;
  @ViewChild('customerSearch_ClientActivtiesRef') customerSearch_ClientActivtiesRef: CustomerSearchComponent;
  @ViewChild('customerSearch_ClientDetailRef') customerSearch_ClientDetailRef: CustomerSearchComponent;
  @ViewChild('customerSearch_ClientAllSaleHistoryRef') customerSearch_ClientAllSaleHistoryRef: AllSaleHistoryReportComponent;
  @ViewChild('customerSearch_ClientAllSaleDetailByInvoiceRef') customerSearch_ClientAllSaleDetailByInvoiceRef: AllSaleBookedDetailReportComponent;
  /* Local Members */
  personName: string = "";
  dateFormat: string = 'yyyy-MM-dd';
  person: string;
  clientActivitiesdateFrom: Date;
  clientActivitiesdateTo: Date;
  searchPerson: FormControl = new FormControl();
  currentBranchDate: Date;
  clearClientActivtiesInput: string = "";
  clearClientDetaillInput: string = "";
  // clearClientHistoryInput:string = "";
  /* Messages */
  messages = Messages;
  fileType = FileType;
  reportName = ReportName;

  /* Models Refences */
  allPerson: AllPerson[];
  clientReportSearchParam = new ClientReportSearchParam();

  /* Configurations */
  activityList = Configurations.ActivityList
  dateTo: any;
  dateFrom: any;
  statusList = Configurations.Status;
  reportTab = ReportTab;

  constructor(
    private _httpService: HttpService,
    private _commonService: CommonService,
    private _messageService: MessageService,
    private _dateTimeService: DateTimeService,
    private _authService: AuthService) {
      this.getBranchSetting();
    this.person = CustomerType.Client.toString();
    //  this._dataSharingService.shareNotifyReportTabChange(this.reportTab.Client);
    //this.reportTabID = this.reportTab.Sale;
  }

  // #region events

  ngOnInit() {

    this.setPermissions();
    this.searchPerson.valueChanges
      .pipe(debounceTime(400))
      .subscribe(searchText => {
        if (searchText && searchText !== "" && searchText.length > 2) {
          if (typeof (searchText) === "string") {
            this._commonService.searchClient(searchText, CustomerType.Client)
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
    this.customerSearch_ClientActivtiesRef.setPlaceHolder(CustomerType.Client);
    this.customerSearch_ClientDetailRef.setPlaceHolder(CustomerType.Client);
    this.customerSearch_ClientAllSaleDetailByInvoiceRef.setPlaceHolder();
    this.customerSearch_ClientAllSaleHistoryRef.setPlaceHolder(CustomerType.Client);
  }

  onToDateChange(date: Date) {
    this.clientReportSearchParam.DateTo = this._dateTimeService.convertDateObjToString(date, this.dateFormat); // 07/05/2018  MM/dd/yyyy
  }

  onFromDateChange(date: Date) {
    this.clientReportSearchParam.DateFrom = this._dateTimeService.convertDateObjToString(date, this.dateFormat); // 07/05/2018 MM/dd/yyyy
  }



  onNotifyCustomerID(customerID: number) {
    this.clientReportSearchParam.CustomerID = customerID;
  }

  onClientNameChange(clientName: any) {
    if (clientName.length < 3) {
      this.clientReportSearchParam.CustomerID = 0;
    }
  }
  // #endregion

  // #region Methods

  async getBranchSetting(){
    this.currentBranchDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
 
    this.clientReportSearchParam.DateFrom = this._dateTimeService.convertDateObjToString(this.currentBranchDate, this.dateFormat),
      this.clientReportSearchParam.DateTo = this._dateTimeService.convertDateObjToString(this.currentBranchDate, this.dateFormat)
  }
  
  exportAllClient(fileType: number) {

    let params = {
      fileFormatTypeID: fileType,
      isActive: this.clientReportSearchParam.IsActive == 1 ? true : false,
      dateFrom: this.clientReportSearchParam.DateFrom,
      dateTo: this.clientReportSearchParam.DateTo
    }

    this._httpService.get(ClientApi.getAllClientReport, params)
      .subscribe((response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          if (fileType == this.fileType.PDF) {
            this._commonService.createPDF(response, this.reportName.AllClient);
          }
          if (fileType == this.fileType.Excel) {
            this._commonService.createExcel(response, this.reportName.AllClient);
          };
        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      });
  }

  viewAllClientReport(fileType?: number) {
    let params = {
      fileFormatTypeID: fileType,
      isActive: this.clientReportSearchParam.IsActive == 1 ? true : false,
      dateFrom: this.clientReportSearchParam.DateFrom,
      dateTo: this.clientReportSearchParam.DateTo
    }

    this._httpService.get(ClientApi.getAllClientReport, params).subscribe(
      (response: ApiResponse) => {
        if (response && response.MessageCode > 0) {
          this._commonService.viewPDFReport(response);
        }
        else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      })
  }

  reciviedDateTo($event) {
    this.clientReportSearchParam.DateFrom = $event.DateFrom;
    this.clientReportSearchParam.DateTo = $event.DateTo;
  }

  exportClientDetailReport() {
    if (!this.clientReportSearchParam.CustomerID || this.clientReportSearchParam.CustomerID == 0) {
      this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Client"));
    } else {
      //this.clientReportSearchParam.CustomerTypeID = 1;
      this._httpService.get(ClientApi.getClientDetailReport + this.clientReportSearchParam.CustomerID)
        .subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              this._commonService.createPDF(response, this.reportName.ClientDetail);
            }
            else {
              this._messageService.showErrorMessage(response.MessageText);
            }
          })
    }
  }

  viewClientDetailReport() {
    if (!this.clientReportSearchParam.CustomerID || this.clientReportSearchParam.CustomerID == 0) {
      this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Client"));
    } else {
      //this.clientReportSearchParam.CustomerTypeID = 1;
      this._httpService.get(ClientApi.getClientDetailReport + this.clientReportSearchParam.CustomerID)
        .subscribe((response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._commonService.viewPDFReport(response);
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        })
    }
  }


  exportAllClientActivitiesReport(fileType: number) {
    let params = {
      fileFormatTypeID: fileType,
      customerID: this.clientReportSearchParam.CustomerID == 0 ? null : this.clientReportSearchParam.CustomerID,
      activityTypeID: this.clientReportSearchParam.ActivityTypeID == 0 ? null : this.clientReportSearchParam.ActivityTypeID,
      dateFrom: this.clientReportSearchParam.DateFrom,
      dateTo: this.clientReportSearchParam.DateTo
    }
    if (!this.clientReportSearchParam.CustomerID || this.clientReportSearchParam.CustomerID == 0) {
      this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Client"));
    } else {
      this._httpService.get(ClientApi.getAllClientActivtiesReport, params).subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            // this.createPDF(allLeadData, "ClientActiviesReport");
            if (fileType == this.fileType.PDF) {
              this._commonService.createPDF(response, this.reportName.ClientActivities);
            }
            if (fileType == this.fileType.Excel) {
              this._commonService.createExcel(response, this.reportName.ClientActivities);
            };
          }
          else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        });
    }
  }

  viewAllClientActivitiesReport(fileType?: number) {
    let params = {
      fileFormatTypeID: fileType,
      customerID: this.clientReportSearchParam.CustomerID == 0 ? null : this.clientReportSearchParam.CustomerID,
      activityTypeID: this.clientReportSearchParam.ActivityTypeID == 0 ? null : this.clientReportSearchParam.ActivityTypeID,
      dateFrom: this.clientReportSearchParam.DateFrom,
      dateTo: this.clientReportSearchParam.DateTo
    }
    if (!this.clientReportSearchParam.CustomerID || this.clientReportSearchParam.CustomerID == 0) {
      this._messageService.showErrorMessage(this.messages.Validation.Select_Customer.replace("{0}", "Client"));
    } else {
      this._httpService.get(ClientApi.getAllClientActivtiesReport, params)
        .subscribe(
          (response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
              this._commonService.viewPDFReport(response);
            }
            else {
              this._messageService.showErrorMessage(response.MessageText);
            }
          });
    }
  }

  getSelectedClient(person: AllPerson) {
    this.clientReportSearchParam.CustomerID = person.CustomerID;
  }

  // #endregion




  // #endregion



  displayClientName(user?: AllPerson): string | undefined {
    return user ? user.FullName : undefined;
  }



  setPermissions() {
    this.allowedPages.AllBookedDetailReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.ClientAllBookedDetailReport);
    this.allowedPages.AllClientReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.AllClientReport);
    this.allowedPages.AllSaleDetailReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.ClientAllSaleDetailReport);
    this.allowedPages.ClientActivitiesReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.ClientActivitiesReport);
    this.allowedPages.CllientDetailReport = this._authService.hasPagePermission(ENU_Permission_Module.Reports, ENU_Permission_Report.CllientDetailReport);
  }

  resetDateToFrom() {
    this.clientReportSearchParam.DateFrom = this._dateTimeService.convertDateObjToString(this.currentBranchDate, this.dateFormat),
      this.clientReportSearchParam.DateTo = this._dateTimeService.convertDateObjToString(this.currentBranchDate, this.dateFormat);
  }

  resetClientActivitiesFilters() {
    // this.clientReportSearchParam.ActivityTypeID = null;
    this.clientReportSearchParam.CustomerID = 0;
    this.clientReportSearchParam.ActivityTypeID = 0;
    this.allPerson = [];
    this.clearClientActivtiesInput = "";
    this.resetDateToFrom();
    this.clientActivtiesToFromDateComoRef.resetDateFilter();
    this.customerSearch_ClientActivtiesRef.resetCustomerName();
  }

  resetAllClientFilters() {
    this.clientReportSearchParam.IsActive = 1;
    this.resetDateToFrom();
    this.allClientsToFromDateComoRef.resetDateFilter();
  }


  //#endregion

}