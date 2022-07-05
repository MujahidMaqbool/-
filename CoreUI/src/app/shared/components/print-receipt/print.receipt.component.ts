// #region Imports
import { Component, OnInit, AfterViewInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { PrintService } from "@app/services/print.service";
import { ReceiptModel } from "@app/models/sale.model";
import { HttpService } from "@app/services/app.http.service";
import { PrinterSetupApi } from "@app/helper/config/app.webapi";
import { PrinterSetup } from "@app/setup/models/printer.setup.model";
import { MessageService } from "@app/services/app.message.service";
import { LoaderService } from "@app/services/app.loader.service";
import { Messages } from "@app/helper/config/app.messages";
import { ApiResponse } from "@app/models/common.model";
import { DateTimeService } from "@app/services/date.time.service";
import { TimeFormatPipe } from "@app/application-pipes/time-format.pipe";
import { TaxCalculation } from "@app/services/tax.calculations.service";

// #endregion

@Component({
    selector: 'print-receipt',
    templateUrl: './print.receipt.component.html'
})

export class PrintReceiptComponent implements OnInit, AfterViewInit {

    // #region Local Members

    logoPath: string = '';
    openDrawer: boolean = false;
    printerConfig: PrinterSetup;
    receipt: ReceiptModel;

    private _printService: PrintService;

    messages = Messages;

    // #endregion

    constructor(private _dialogRef: MatDialogRef<PrintReceiptComponent>,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _loaderService: LoaderService,
        private _dateTimeService: DateTimeService,
        private _TimeFormatPipe: TimeFormatPipe,
        @Inject(MAT_DIALOG_DATA) public model: any) {

    }

    ngOnInit() {
        this.receipt = this.model.receipt;
        this.openDrawer = this.model.openDrawer;
        this.getPrinterConfig();
    }

    ngAfterViewInit() {
        // setTimeout(() => {
        //     this._printService.printReceipt(this.receipt);
        //     this._dialogRef.close();
        // }, 500)
    }

    getPrinterConfig() {
        this._httpService.get(PrinterSetupApi.getPrinterConfiguration).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    if (res.Result) {
                        this.printerConfig = res.Result;
                        if (this.printerConfig.ImageFile && this.printerConfig.ImageFile.length > 0) {
                            this.logoPath = 'data:image/jpeg;base64,' + this.printerConfig.ImageFile;
                        }

                        if (this.printerConfig && this.printerConfig.PrinterIPAddress && this.printerConfig.PrinterIPAddress.length > 0) {
                            setTimeout(() => {
                                this._printService = new PrintService(this._messageService, this._loaderService,this._dateTimeService,this._TimeFormatPipe);
                                this._printService.printReceipt(this.receipt, this.printerConfig, this.openDrawer);
                                this._dialogRef.close();
                            }, 500);
                        }
                        else {
                            this._messageService.showErrorMessage(this.messages.Error.Printer_Not_Configured);
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Printer_Not_Configured);
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', 'Printer Config'));
            }
        );

        // this.receipt.BranchInfo.Address = 'Unit 15 Adagio, 38 Creek Road, Greenwich, London, SE 8 3';
        // this.receipt.BranchInfo.Email = 'spa@maridian-spa.co.uk';
        // this.receipt.BranchInfo.Phone = '020 8469 1961';
        // this.receipt.BranchInfo.TaxNumber = 'GB7070908525';
        // this.receipt.BranchInfo.Website = 'www.maridian-spa.co.uk';
    }
}