/********************** Angular References *********************************/
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
/********************* Material:Refference ********************/
import { DatePipe } from '@angular/common';

/********************** Service & Models *********************/
/* Services */
import { MessageService } from 'src/app/services/app.message.service';

/* Models */
import { AllPerson, ReportSearchParameter } from "src/app/models/common.model";

/********************** Component *********************************/
//import { InvoiceDetailComponent } from '../invoice.detail/invoice.detail.component';

/********************** Common *********************************/
import { CommonService } from 'src/app/services/common.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { debounceTime } from 'rxjs/internal/operators';
import { PersonType, ReportViewType, FileType, ReportName, CustomerType } from 'src/app/helper/config/app.enums';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';

@Component({
    selector: 'all-sale-booked-detail-report',
    templateUrl: './all.sale.booked.detail.report.component.html',
})

export class AllSaleBookedDetailReportComponent implements OnInit {

    @ViewChild('AllSaleDetailsForm') allSaleDetailsForm: NgForm;
    @ViewChild('saleDetailByMemberRef') saleDetailByMemberRef: DateToDateFromComponent;
    @Input() moduleName: string;
    /* Local Members */
    customerName: string;
    dateFrom: any;
    dateTo: any;
    customerTypePlaceHolder: string = '';
    customerTitle: string = '';
    dateFormat: string = 'yyyy-MM-dd';
    currentDate: Date = new Date();
    clearClientBookedDetailInput: string = "";
    reportViewType = ReportViewType;
    @Input() customerTypeID: number = 4;
    @Input() reportPackageBasedText: string = 'products/services/classes';
   
    /* Messages */
    messages = Messages;
    enuCustomerType = CustomerType;

    /* Models Refences */
    fileType = FileType;
    reportName = ReportName;
    allPerson: AllPerson[];
    reportSearchParameter = new ReportSearchParameter();
    searchPerson: FormControl = new FormControl();
    customerDescriptionName: string;

    constructor(
        private _commonService: CommonService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService
    ) { }

    ngOnInit() {
        this.customerTypeID = this.customerTypeID == 0 ? 4 : this.customerTypeID;
        this.getBranchSetting();
        this.setPlaceHolder();
        this.searchPerson.valueChanges
            .pipe(debounceTime(400))
            .subscribe(value => {
                if (value && value !== "" && value.length > 2) {
                    if (typeof (value) === "string") {
                        this.customerTypeID = this.customerTypeID ? this.customerTypeID : 0;
                        this._commonService.searchModuleWisePerson(value, PersonType.Customer, this.customerTypeID).subscribe(response => {
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

    }


    onClientNameChange(clientName: any) {
        if (clientName.length < 3) {
            this.reportSearchParameter.CustomerID = 0;
        }
    }

    onClearDate() {
        this.reportSearchParameter.CustomerID = 0;
        this.clearClientBookedDetailInput = '';
    }
    setPlaceHolder() {
        switch (this.customerTypeID) {
            case this.customerTypeID = CustomerType.Client:
                this.customerTitle = "Search By Customer";
                this.customerTypePlaceHolder = "Customer Name";
                this.customerDescriptionName = "Customer";
                break;
            case this.customerTypeID = CustomerType.Lead:
                this.customerTitle = "Search By Lead";
                this.customerTypePlaceHolder = "Lead Name";
                this.customerDescriptionName = "Lead";
                break;
            case this.customerTypeID = CustomerType.Member:
                this.customerTitle = "Search By Customer";
                this.customerTypePlaceHolder = "Customer Name";
                this.customerDescriptionName = "Customer";
                break;
            case this.customerTypeID = CustomerType.Customer:
                this.customerTitle = "Search By Customer";
                this.customerTypePlaceHolder = "Customer Name";
                this.customerDescriptionName = "Customer";
                break;
            default:
                break;
        }
    }
    //#region Methods

    async getBranchSetting() {
        this.currentDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();

        this.dateFrom = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1)
        this.dateTo = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0)
        this.reportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
        this.reportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
    }

    exportAllSaleBookedDetailReport(fileType: number) {
        var reportName = this.moduleName == 'Customer' ? this.reportName.AllSalesDetailByCustomer : this.reportSearchParameter.CustomerTypeID == CustomerType.Lead ? this.reportName.AllSalesDetailByLead : this.reportName.AllSale;
        if (!this.reportSearchParameter.CustomerID || this.reportSearchParameter.CustomerID == 0) {
            this.checkCustomerType();
        }
        else {
            let reportId = this.reportSearchParameter.CustomerTypeID == CustomerType.Lead ? 3 : 4; //by syed asim bukhari 
            this._commonService.getAllSaleBookedDetailReport(fileType, this.reportSearchParameter.CustomerID, this.reportSearchParameter.DateFrom, this.reportSearchParameter.DateTo, this.reportSearchParameter.CustomerTypeID,reportId).subscribe((BookedDetailData: any) => {
                if (fileType == this.fileType.PDF) {
                    this._commonService.createPDF(BookedDetailData, reportName);
                }
                if (fileType == this.fileType.Excel) {
                    this._commonService.createExcel(BookedDetailData, reportName);
                };
            });
        }
    }

    viewAllSaleBookedDetailReport(fileType: number) {
        if (!this.reportSearchParameter.CustomerID || this.reportSearchParameter.CustomerID == 0) {
            this.checkCustomerType();
        } else {
            let reportId = this.reportSearchParameter.CustomerTypeID == CustomerType.Lead ? 3 : 4; //by syed asim bukhari 
            this._commonService.getAllSaleBookedDetailReport(fileType, this.reportSearchParameter.CustomerID, this.reportSearchParameter.DateFrom, this.reportSearchParameter.DateTo, this.reportSearchParameter.CustomerTypeID,reportId).subscribe((BookedDetailData: any) => {
                this._commonService.viewPDFReport(BookedDetailData);
            })
        }
    }

    resetSaleDetailsfilters() {
        this.reportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
        this.reportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
        this.reportSearchParameter.CustomerID = 0;
        this.clearClientBookedDetailInput = "";
        this.saleDetailByMemberRef.resetDateFilter();
    }

    viewPDFReport(base64URL) {
        var win = window.open();
        win.document.write('<iframe src="' + base64URL + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
    }
    // onToDateChange(date: Date) {
    //     this.reportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(date, this.dateFormat); // 07/05/2018  MM/dd/yyyy
    // }

    // onFromDateChange(date: Date) {
    //     this.reportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(date, this.dateFormat); // 07/05/2018 MM/dd/yyyy
    // }

    reciviedDateTo($event) {
        this.reportSearchParameter.DateFrom = $event.DateFrom;
        this.reportSearchParameter.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.reportSearchParameter.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.reportSearchParameter.DateTo = date;
    }


    getSelectedPerson(person: AllPerson) {
        this.reportSearchParameter.CustomerID = person.CustomerID;
        this.reportSearchParameter.CustomerTypeID = person.CustomerTypeID;

    }
    displayPersonName(user?: AllPerson): string | undefined {
        return user ? user.FirstName + ' ' + user.LastName : undefined;
    }

    // resetDateFilter() {
    //     this.dateFrom = this._dateTimeService.convertDateObjToString(new Date(), this.dateFormat);
    //     this.dateTo = this._dateTimeService.convertDateObjToString(new Date(), this.dateFormat);
    // }

    checkCustomerType() {
        if (this.customerTypeID == CustomerType.Client) {
            this._messageService.showErrorMessage(this.messages.Validation.Search_Customer.replace("{0}", "Client"));
        }
        if (this.customerTypeID == CustomerType.Lead) {
            this._messageService.showErrorMessage(this.messages.Validation.Search_Customer.replace("{0}", "Lead"));
        }

        if (this.customerTypeID == CustomerType.Member) {
            this._messageService.showErrorMessage(this.messages.Validation.Search_Customer.replace("{0}", "Member"));
        }
        if (this.reportSearchParameter.CustomerID == 0 || this.reportSearchParameter.CustomerID == undefined) {
          this._messageService.showErrorMessage(this.messages.Error.SelectCustomerName);
        }
    }
    //#endregion

}
