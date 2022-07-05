/********************** Angular References *********************/
import { Component, Output, EventEmitter, ViewChild, Inject } from "@angular/core";
/********************** Angular Material References *********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/****************** Components *****************/
import { SaleQueue, SaleQueueSearchParams, SaveQueue } from "@pos/models/point.of.sale.model";

/****************** Services & Models *****************/
/* Services */
import { DateTimeService } from "@app/services/date.time.service";
import { MessageService } from "@app/services/app.message.service";

/* Models */

/****************** Configurations *****************/
import { Configurations } from "@helper/config/app.config";
import { HttpService } from "@app/services/app.http.service";
import { PointOfSaleApi } from "@app/helper/config/app.webapi";
import { Messages } from "@app/helper/config/app.messages";
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { CustomerSearchComponent } from "@app/shared/components/customer-search/customer.search.component";
import { ApiResponse } from "@app/models/common.model";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { AlertConfirmationComponent } from "@app/application-dialog-module/confirmation-dialog/alert.confirmation.component";
import { AbstractGenericComponent } from "@app/shared/helper/abstract.generic.component";
import { DataSharingService } from "@app/services/data.sharing.service";
import { ENU_DateFormatName } from "@app/helper/config/app.enums";
import { StaffSearchAutoCompleteComponent } from "../staff-search/staff.search.component";

@Component({
    selector: 'pos-queued-invoices',
    templateUrl: './pos.queued.invoices.component.html'
})

export class POSQueuedInvoicesComponent extends AbstractGenericComponent {
    @ViewChild('customerSearch') customerSearch: CustomerSearchComponent;
    @ViewChild('staffSearch') staffSearch: StaffSearchAutoCompleteComponent;

    @Output() removeInvoice = new EventEmitter<number>();
    @Output() viewInvoice = new EventEmitter<SaveQueue>();

    readonly DATE_FORMAT = "MM/dd/yyyy";
    isDataExists: boolean;
    queueCreatedOn: Date = new Date();
    maxDate: Date = new Date();
    queuedInvoiceList: SaleQueue[] = [];
    createdAt: Date = new Date();
    saleQueueSearchParams: SaleQueueSearchParams = new SaleQueueSearchParams();

    messages = Messages;
    dateFormat: string = "";//Configurations.DateFormat;
    timeFormat = Configurations.TimeFormat;
    dateandTimeFormat: string = '';
    IsSearchExist: boolean = false;
    constructor(private _dialogRef: MatDialogRef<POSQueuedInvoicesComponent>,
        private _httpService: HttpService,
        private _messagesService: MessageService,
        private _dialog: MatDialogService,
        private _dateTimeService: DateTimeService,
        private _dataSharingService: DataSharingService,
        @Inject(MAT_DIALOG_DATA) public isShowRetrieveConfirmation: boolean
        //@Inject(MAT_DIALOG_DATA) public queuedInvoiceList: QueuedInvoiceForGrid[]
    ) {
        super();
    }

    ngOnInit() {
        this.getBranchSetting();
    }

    // #region Events

    onCreateDateChange(date: any) {
        setTimeout(() => {
            this.saleQueueSearchParams.CreatedOn = date;
            this.createdAt = date; //this._dateTimeService.convertDateObjToString(date, this.DATE_FORMAT);   
        });
    }

    onSearchQueueInvoice() {
        this.IsSearchExist = true;
        this.getAllSaleQueue();
    }

    onCustomerChange(customerID: number) {
        this.saleQueueSearchParams.CustomerID = customerID > 0 ? customerID : undefined;
    }

    onStaffChange(staffID: number) {
        this.saleQueueSearchParams.StaffID = staffID > 0 ? staffID : undefined;
    }

    onReset() {
        this.resetSearchParameters();
        this.getAllSaleQueue();
    }

    onViewInvoice(saleQueueId: number) {
        if (this.isShowRetrieveConfirmation) {
            this.showRetrieveConfirmationDailog(saleQueueId);
        } else {
            this.viewInvoiceInCart(saleQueueId);
        }
    }

    onRemoveInvoice(saleQueueId: number) {
        this.showDeletConfirmationDialog(saleQueueId);
    }

    onClose() {
        this.closeDialog();
    }

    // #endregion

    // #region Methods

    async getBranchSetting() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        //implementation change after discuss with tahir bhai show branch current date not browser date implementaed by fahad dated on 03-03-2021
        this.maxDate = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.queueCreatedOn = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.dateandTimeFormat = this.dateFormat + " " + this.timeFormat;
        this.getAllSaleQueue();
    }

    adjustForTimezone(date: Date): Date {
        var timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
        date.setTime(date.getTime() - timeOffsetInMS);
        return date
    }

    async getAllSaleQueue() {
        if (this.IsSearchExist == false) {
            var currentBranchTime = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
            this.createdAt = new Date(currentBranchTime);
        }

        this.saleQueueSearchParams.CreatedOn = this._dateTimeService.convertDateObjToString(this.createdAt, this.DATE_FORMAT);
        this._httpService.get(PointOfSaleApi.getAllSaleQueue, this.saleQueueSearchParams).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.queuedInvoiceList = response.Result;
                    this.isDataExists = this.queuedInvoiceList && this.queuedInvoiceList.length > 0 ? true : false;
                }
                else {
                    this._messagesService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this._messagesService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Park Sale List"));
            }
        )
        this.IsSearchExist = false;
    }

    async resetSearchParameters() {
        this.saleQueueSearchParams.CreatedOn = "";
        this.saleQueueSearchParams.PageNumber = 1;
        this.saleQueueSearchParams.PageSize = 10;
        this.queueCreatedOn = await this._dateTimeService.getCurrentDateTimeAcordingToBranch();
        this.saleQueueSearchParams.CustomerID = undefined;
        this.saleQueueSearchParams.StaffID = undefined;
        this.customerSearch.resetCustomerName();
        this.staffSearch.resetStaffName();
    }

    showDeletConfirmationDialog(queueSaleID: number) {
        const dialogRef = this._dialog.open(DeleteConfirmationComponent, {
            disableClose: true ,
            data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}
        });

        dialogRef.componentInstance.confirmDelete.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                this.removeInvoiceFromQueue(queueSaleID, true);
            }
        })
    }

    showRetrieveConfirmationDailog(saleQueueId: number) {
        const dialogRef = this._dialog.open(AlertConfirmationComponent, { disableClose: true });

        dialogRef.componentInstance.Title = this.messages.Dialog_Title.Retrieve_Parked_Sale;
        dialogRef.componentInstance.Message = this.messages.Confirmation.Retrieve_Sale_Message;

        dialogRef.componentInstance.confirmChange.subscribe((isConfirmRetrieve: boolean) => {
            if (isConfirmRetrieve) {
                this.closeDialog();
                this.viewInvoiceInCart(saleQueueId);
            }
        })
    }

    removeInvoiceFromQueue(queueSaleID: number, showMessage: boolean) {
        this._httpService.delete(PointOfSaleApi.deleteSaleQueue + queueSaleID).subscribe(
            (response: any) => {
                if (response && response.MessageCode > 0) {
                    if (showMessage) {
                        this._messagesService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Park Sale"));
                        this.getAllSaleQueue();
                    }
                }
                else {
                    this._messagesService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this._messagesService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Park Sale"));
            }
        )
    }

    viewInvoiceInCart(queueSaleID: number) {
        this._httpService.get(PointOfSaleApi.getSaleQueueById + queueSaleID).subscribe(
            (response: any) => {
                if (response && response.MessageCode > 0) {
                    this.removeInvoiceFromQueue(queueSaleID, false);
                    this.viewInvoice.emit(response.Result);
                    this.closeDialog();
                }
                else {
                    this._messagesService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this._messagesService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Park Sale Detail"));
            }
        )
    }


    closeDialog() {
        this._dialogRef.close();
    }

    // #endregion
}