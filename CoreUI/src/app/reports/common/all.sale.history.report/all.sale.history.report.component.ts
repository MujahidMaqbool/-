/********************** Angular References *********************************/
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
/********************* Material:Refference ********************/
import { DatePipe } from '@angular/common';

/********************** Service & Models *********************/
/* Services */
import { MessageService } from 'src/app/services/app.message.service';
/* Models */
import { AllPerson, ReportSearchParameter } from "src/app/models/common.model";
/********************** Component *********************************/
import { Messages } from 'src/app/helper/config/app.messages';
import { debounceTime } from 'rxjs/internal/operators';
import { CustomerType, PersonType, FileType, ReportName } from 'src/app/helper/config/app.enums';
import { DateTimeService } from 'src/app/services/date.time.service';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { CommonService } from 'src/app/services/common.service';
import { Configurations } from 'src/app/helper/config/app.config';

@Component({
    selector: 'all-sale-history-report',
    templateUrl: './all.sale.history.report.component.html',
})

export class AllSaleHistoryReportComponent implements OnInit {

    @Input() customerTypeID: number = 4;
    /* Local Members */
    @ViewChild('allSaleHistoryRef') allSaleHistoryRef: DateToDateFromComponent;

    dateFrom: Date;
    dateTo: Date;
    maxDate: Date = new Date();
    dateFormat: string = 'yyyy-MM-dd';
    personName: string = "";
    customerTypePlaceHolder: string = '';
    customerTitle: string = '';
    clearClientHistoryInput: string = ""
    currentDate: Date = new Date();

    /* Messages */
    messages = Messages;

    /* Models Refences */
    fileType = FileType;
    reportName = ReportName;

    allPerson: AllPerson[];
    reportSearchParameter = new ReportSearchParameter();
    searchPerson: FormControl = new FormControl();
    customerDescriptionName: string;
    enuCustomerType = CustomerType;

    customerTypeList: any = Configurations.CustomerTypes;

    constructor(
        private _dateFilter: DatePipe,
        private _commonService: CommonService,
        private _messageService: MessageService,
        private _dateTimeService: DateTimeService
    ) {

    }

    ngOnInit() {
        this.customerTypeID = this.customerTypeID == 0 ? 4 : this.customerTypeID;
        this.getBranchSetting();
        this.setPlaceHolder(this.customerTypeID);
        this.searchPerson.valueChanges
            .pipe(debounceTime(400))
            .subscribe(value => {
                if (value && value !== "" && value.length > 2) {
                    if (typeof (value) === "string") {
                        this.customerTypeID = this.customerTypeID ? this.customerTypeID : 0;
                        this._commonService.searchModuleWisePerson(value, PersonType.Customer, this.customerTypeID).subscribe(
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

    onClearDate() {
        this.reportSearchParameter.CustomerID = 0;
        this.clearClientHistoryInput = '';
    }

    setPlaceHolder(customerTypeId: any) {
        switch (this.customerTypeID) {
            case this.customerTypeID = CustomerType.Client:
                this.customerTitle = "Search By Customer";
                this.customerTypePlaceHolder = "Customer Name";
                this.customerDescriptionName = "Customer or for all Customers";
                break;
            case this.customerTypeID = CustomerType.Lead:
                this.customerTitle = "Search By Lead";
                this.customerTypePlaceHolder = "Lead Name";
                this.customerDescriptionName = "Lead or for all Leads";
                break;
            case this.customerTypeID = CustomerType.Member:
                this.customerTitle = "Search By Customer";
                this.customerTypePlaceHolder = "Customer Name";
                this.customerDescriptionName = "Customer or for all Customers";
                break;
            case this.customerTypeID = CustomerType.Customer:
                this.customerTitle = "Customer Name";
                this.customerTypePlaceHolder = "Customer Name";
                this.customerDescriptionName = "Customers";
                this.reportSearchParameter.CustomerTypeID = 0;
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

    exportAllSaleHistoryReport(fileType: number) {
        let customerID = this.reportSearchParameter.CustomerID && this.reportSearchParameter.CustomerID > 0 ? this.reportSearchParameter.CustomerID : 0;
        let customerTypeID = this.customerTypeID == 4 ? this.reportSearchParameter.CustomerTypeID : this.customerTypeID;
        this._commonService.getAllSaleHistoryReport(fileType, customerID, this.reportSearchParameter.DateFrom, this.reportSearchParameter.DateTo, customerTypeID).subscribe((SaleHistoryData: any) => {
            if (fileType == this.fileType.PDF) {
                this._commonService.createPDF(SaleHistoryData, this.reportName.AllPaymentAndRefundHistory);
            }
            if (fileType == this.fileType.Excel) {
                this._commonService.createExcel(SaleHistoryData, this.reportName.AllPaymentAndRefundHistory);
            };

        })
    }

    viewAllSaleHistoryReport(fileType: number) {
        let customerID = this.reportSearchParameter.CustomerID && this.reportSearchParameter.CustomerID > 0 ? this.reportSearchParameter.CustomerID : 0;
        let customerTypeID = this.customerTypeID == 4 ? this.reportSearchParameter.CustomerTypeID : this.customerTypeID;
        this._commonService.getAllSaleHistoryReport(fileType, customerID, this.reportSearchParameter.DateFrom, this.reportSearchParameter.DateTo, customerTypeID).subscribe((SaleHistoryData: any) => {
            this._commonService.viewPDFReport(SaleHistoryData);
        })
    }

    resetSaleHistroyFilters() {
        this.reportSearchParameter.DateFrom = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
        this.reportSearchParameter.DateTo = this._dateTimeService.convertDateObjToString(this.currentDate, this.dateFormat);
        this.reportSearchParameter.CustomerID = 0;
        this.clearClientHistoryInput = "";
        this.allSaleHistoryRef.resetDateFilter();
    }

    viewPDFReport(base64URL) {
        var win = window.open();
        win.document.write('<iframe src="' + base64URL + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
    }

    // onFromDateChange(date: Date) {
    //     this.reportSearchParameter.DateFrom = this.getDateString(date, this.dateFormat); // 07/05/2018 MM/dd/yyyy
    // }

    // onToDateChange(date: Date) {
    //     this.reportSearchParameter.DateTo = this.getDateString(date, this.dateFormat); // 07/05/2018  MM/dd/yyyy
    // }

    reciviedDateTo($event) {
        this.reportSearchParameter.DateFrom = $event.DateFrom;
        this.reportSearchParameter.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.reportSearchParameter.DateFrom = date;
        this.allSaleHistoryRef.validateDate();
    }

    onToDateChange(date: any) {
        this.reportSearchParameter.DateTo = date;
    }

    getDateString(dateValue: Date, dateFormat: string) {
        return this._dateFilter.transform(dateValue, dateFormat);
    }

    getSelectedPerson(person: AllPerson) {
        this.reportSearchParameter.CustomerID = person.CustomerID;
        this.reportSearchParameter.CustomerTypeID = person.CustomerTypeID;

    }

    displayPersonName(user?: AllPerson): string | undefined {
        return user ? user.FullName : undefined;
    }

    // resetDateFilter() {
    //     this.dateFrom = new Date();
    //     this.dateTo = new Date();
    // }

    checkCustomerType() {
        if (this.customerTypeID == CustomerType.Customer) {
            this._messageService.showErrorMessage(this.messages.Validation.Search_Customer.replace("{0}", "Customer"));
        }
        if (this.customerTypeID == CustomerType.Client) {
            this._messageService.showErrorMessage(this.messages.Validation.Search_Customer.replace("{0}", "Client"));
        }
        if (this.customerTypeID == CustomerType.Lead) {
            this._messageService.showErrorMessage(this.messages.Validation.Search_Customer.replace("{0}", "Lead"));
        }

        if (this.customerTypeID == CustomerType.Member) {
            this._messageService.showErrorMessage(this.messages.Validation.Search_Customer.replace("{0}", "Member"));
        }
    }

    //#endregion
}