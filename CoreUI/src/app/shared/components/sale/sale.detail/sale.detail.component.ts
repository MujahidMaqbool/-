/********************** Angular References *********************************/
import { Component, OnInit, Inject } from '@angular/core';
import { SubscriptionLike } from 'rxjs';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/********************** Service & Models *********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';

/* Models */
import { SaleDetail, ReceiptItem, ReceiptModel, ReceiptPaymentMethod } from 'src/app/models/sale.model';
import { SaleInvoice, POSCartItem } from 'src/app/point-of-sale/models/point.of.sale.model';
import { ApiResponse } from 'src/app/models/common.model';

/********************** Common *********************************/
import { Configurations, DiscountType } from 'src/app/helper/config/app.config';
import { Messages } from 'src/app/helper/config/app.messages';
import { environment } from 'src/environments/environment';
import { SaleApi, PointOfSaleApi } from 'src/app/helper/config/app.webapi';
import { POSItemType, ENU_DateFormatName, EnumSaleStatusType, EnumSaleDetailType, EnumSalePaymentStatusType, ENU_Package } from 'src/app/helper/config/app.enums';
import { PrintReceiptComponent } from '../../print-receipt/print.receipt.component';
import { CurrencyPipe } from '@angular/common';
import { MatDialogService } from '../../generics/mat.dialog.service';
import { AppUtilities } from 'src/app/helper/aap.utilities';

/********************** Cpmponent *********************************/
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { TaxCalculation } from 'src/app/services/tax.calculations.service';
import { TimeFormatPipe } from 'src/app/application-pipes/time-format.pipe';



@Component({
    selector: 'sale-detail',
    templateUrl: './sale.detail.component.html',
})

export class SaleDetailComponent extends AbstractGenericComponent implements OnInit {

    // #region Local Memebers
    receiptDateFormat: string = "";//Configurations.ReceiptDateFormat;
    longDateFormat: string = "";//Configurations.DateFormat;
    dateFormat: string = "";//Configurations.DateFormat;
    dateTimeFormat: string = "";
    isDataExists: boolean;
    hasServiceCharges: boolean = false;
    hasDiscounts: boolean = false;
    hasBalance: boolean = false;
    noOfItems: number = 0;
    quantity: number = 0;
    currencyFormat: string;
    amountPaid: number;
    //#endregion

    /***********Messages*********/
    messages = Messages;
    serverImageAddress = environment.imageUrl;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    successMessage: string;
    errorMessage: string;
    isRewardProgramInPackage: boolean = false;

    /* Model References */
    saleDetail: SaleDetail;
    saleInvoice: SaleInvoice;
    posCartItems: POSCartItem[] = [];
    ReceiptPaymentMethod = new ReceiptPaymentMethod;

    packageIdSubscription: SubscriptionLike;

    /* Dialog Reference */
    deleteDialogRef: any;
    viewDialogRef: any;

    /* Configurations */
    posItemType = POSItemType;
    enumSaleStatusType = EnumSaleStatusType;
    timeFormat = Configurations.TimeFormatView;
    hasPayments: boolean;
    discountType = DiscountType;
    branchName: string;
    enuSaleDetailType = EnumSaleDetailType;
    package = ENU_Package;


    constructor(private _dataSharingService: DataSharingService,
        private _dateTimeService: DateTimeService,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _currencyFormatter: CurrencyPipe,
        private _dialogRef: MatDialogRef<SaleDetailComponent>,
        private _dialog: MatDialogService,
        private _taxCalculationService: TaxCalculation,
        private _TimeFormatPipe: TimeFormatPipe,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        super();
        this.saleDetail = new SaleDetail();
    }

    // #region Events

    ngOnInit() {
        this.checkPackagePermissions();
        this.getCurrentBranchDetail();
    }

    ngOnDestroy() {
        this.packageIdSubscription?.unsubscribe();
    }

    /* get branch details */
    async getCurrentBranchDetail() {
        this.longDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.LongDateFormat);
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.receiptDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.LongDateFormat);
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        //var _shortDateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.SchedulerTooltipDateFormat);
        this.dateTimeFormat = this.dateFormat + " | " + this.timeFormat;
        if (this.data.detailType == this.enuSaleDetailType.InvoiceDetail) {
            this.getInvoiceDetail(this.data.SaleID);
        }
        else {
            this.getRefundDetail(this.data);
        }

        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.currencyFormat = branch.CurrencySymbol;
            this.branchName = branch.BranchName;
        }
    }

    onCloseDialog() {
        this._dialogRef.close();
    }

    onPrint() {
        this.getReceiptForPrint();
    }

    // #endregion

    // #region Methods
    checkPackagePermissions() {
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe((packageId: number) => {
            if (packageId && packageId > 0) {
                this.setPackagePermissions(packageId);
            }
        })
      }

    setPackagePermissions(packageId: number) {
        this.isRewardProgramInPackage = false;
        switch (packageId) {

            case this.package.Full:
                this.isRewardProgramInPackage = true;
                break;
        }
    }

    getInvoiceDetail(saleID: number) {
        this.noOfItems = 0;
        this.quantity = 0;
        this._httpService.get(SaleApi.getInvoiceDetail + saleID)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    if (res.Result) {
                        // console.log(res.Result);
                        this.saleDetail = res.Result;
                        this.hasServiceCharges = this.saleDetail.ServiceChargesAmount && this.saleDetail.ServiceChargesAmount > 0 ? true : false;
                        this.hasDiscounts = this.saleDetail.SaleDiscountAmount && this.saleDetail.SaleDiscountAmount > 0 ? true : false;
                        this.hasBalance = this.saleDetail.BalanceAmount && this.saleDetail.BalanceAmount > 0 ? true : false;
                        this.hasPayments = this.saleDetail.PaymentList && this.saleDetail.PaymentList.length > 0 ? true : false;
                        this.saleDetail.ItemTotalDiscountAmount = 0;
                        this.saleDetail.ItemList.forEach(detail => {
                            if (detail.ImagePath && detail.ImagePath !== "") {
                                detail.ImagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + detail.ImagePath;
                            }
                            else {
                                detail.ImagePath = detail.ImagePath + './assets/images/pos_placeholder.jpg';
                            }


                            if (detail.StartTime && detail.StartTime != "") {
                                detail.StartTime = this._dateTimeService.formatTimeString(detail.StartTime, this.timeFormat);
                            }

                            if (detail.EndTime && detail.EndTime != "") {
                                detail.EndTime = this._dateTimeService.formatTimeString(detail.EndTime, this.timeFormat);
                            }

                            detail.ShowBookingTime = (detail.ItemTypeID === this.posItemType.Class || detail.ItemTypeID === this.posItemType.Service) ? true : false;
                            this.quantity += detail.ItemQty ? detail.ItemQty : 0;
                        });

                        this.saleDetail.IsShowAddedToInventory = this.saleDetail.ItemList.find(il => il.ItemTypeID ==  this.posItemType.Product && il.HasTrackInventory && il.IsRefunded) ? true : false;
                        this.saleDetail.IsRefunded = this.saleDetail.ItemList.find(il => il.IsRefunded) ? true : false;
                        this.saleDetail.IsStatusChanged = this.saleDetail.ItemList.find(il => il.IsItemCancelled || il.IsItemNoShow) ? true : false;
                        this.noOfItems = this.saleDetail.ItemList.length;
                    }
                }
                else {
                    this.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', "Sale Detail"));
                }
            );
    }

    getRefundDetail(sale: any) {
        let param = {
            saleID: sale.SaleStatusID == this.enumSaleStatusType.OverPaid ? sale.SaleID : null,
            saleInvoiceID: sale.SaleStatusID !== this.enumSaleStatusType.OverPaid ? sale.SaleInvoiceID : 0
        }
        this._httpService.save(SaleApi.getCreditInvoiceDetail, param)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    if (res.Result) {
                        //console.log(res.Result);
                        this.saleDetail = res.Result;
                        this.saleDetail.IsShowAddedToInventory = this.saleDetail.ItemList.find(il => il.ItemTypeID ==  this.posItemType.Product && il.HasTrackInventory && il.IsRefunded) ? true : false;
                        this.saleDetail.IsStatusChanged = this.saleDetail.ItemList.find(il => il.IsItemCancelled || il.IsItemNoShow) ? true : false;
                        this.hasPayments = this.saleDetail.PaymentList && this.saleDetail.PaymentList.length > 0 ? true : false;
                    }
                }
                else {
                    this.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this.showErrorMessage(this.messages.Error.Save_Error.replace('{0}', "Sale Detail"));
                }
            );
    }

    getReceiptForPrint() {
        this._httpService.get(PointOfSaleApi.getInvoiceForPrint + this.saleDetail.SaleID).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    if (res.Result) {
                        this.printReceipt(res.Result);
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Printer_Not_Configured);
                    }
                }
                else {
                    this.showErrorMessage(res.MessageText);
                }
            },
            error => {
                this.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Receipt for print"));
            }
        )
    }

    printReceipt(receiptInfo: any) {
        this._dialog.open(PrintReceiptComponent, {
            data: {
                receipt: this.setReceiptPrintModel(receiptInfo),
                openDrawer: true
            }
        });
    }

    setReceiptPrintModel(receiptInfo: any) {
        let receipt = new ReceiptModel();
        this.saleDetail.ItemList.forEach(item => {
            let receiptItem = new ReceiptItem();
            receiptItem.Name = item.ItemName;
            receiptItem.VariantName = item.ItemVariantName;
            receiptItem.MembershipPaymentInterval = item.MembershipPaymentInterval;
            receiptItem.MembershipPaymentStartDate = this._dateTimeService.convertDateObjToString(new Date(item.StartDate), this.receiptDateFormat);
            receiptItem.MembershipPaymentEndDate = this._dateTimeService.convertDateObjToString(new Date(item.EndDate), this.receiptDateFormat);
            receiptItem.MembershipPaymentName = item.MembershipPaymentName;
            //receiptItem.Name = item.ItemName;
            receiptItem.Price = this.getFormattedAmount(item.ItemPricePerUnit);
            receiptItem.Qty = item.ItemQty.toString();
            receiptItem.ItemIsRefunded = item.IsRefunded;
            receiptItem.RefundedQty = item.RefundedQty;
            receiptItem.IsItemRescheduled = item.IsItemRescheduled;
            receiptItem.ItemReScheduleCount = item.ItemReScheduleCount;
            receiptItem.ItemRefundedAmount = this.data.detailType == this.enuSaleDetailType.InvoiceDetail ? item.RefundedAmount : item.ItemRefundedAmount;
            receiptItem.Amount = item.ItemTotalDiscountedPrice == 0 ? this.getFormattedAmount(item.ItemTotalPrice) : this.getFormattedAmount(item.ItemTotalDiscountedPrice);
            // receiptItem.Amount = this.getFormattedAmount(item.ItemTotalPrice);
            receiptItem.ItemTaxAmount =  this.getFormattedAmount(item.ItemTaxAmount);//item.ItemTaxAmount == 0 ? item.ItemTaxAmount.toString() : this.getFormattedAmount(item.ItemTaxAmount);

            //receiptItem.Amount = this.getFormattedAmount((item.ItemPricePerUnit * item.ItemQty) - (item.ItemDiscountAmount * item.ItemQty));
            receiptItem.DiscountType = item.IsMembershipBenefit ? item.MembershipName : item.IsPOSLineItemDiscount ? this.discountType.POSDiscount : '';
            receiptItem.TotalDiscount = item.ItemDiscountAmount > 0 ? item.ItemDiscountAmount : null;


            switch (item.ItemTypeID) {
                case this.posItemType.Product:
                    receiptItem.Description = '';
                    break;
                case this.posItemType.Service:
                    receiptItem.Description = this._dateTimeService.convertDateObjToString(new Date(item.StartDate), this.receiptDateFormat)
                        + ' | ' + item.StartTime + ' - ' + item.EndTime;
                    break;
                case this.posItemType.Class:
                    receiptItem.Description = this._dateTimeService.convertDateObjToString(new Date(item.StartDate), this.receiptDateFormat)
                        + ' | ' + item.StartTime
                        + ' - ' + item.EndTime;
                    break;
            }

            receipt.Items.push(receiptItem);
        });


        if (this.saleDetail.PaymentList && this.saleDetail.PaymentList.length > 0) {
            //Grouped by methoid name refunded amoount
            var refundPaymentMethod = [];
            var paidPaymentMethod = [];
            this.saleDetail.PaymentList.reduce(function (res, value) {
                if (value.PaymentStatusTypeID == EnumSalePaymentStatusType.PMTRefund.toString()) {
                    if (!res[value.PaymentMethod]) {
                        res[value.PaymentMethod] = { MethodName: value.PaymentMethod, InvoiceAmount: 0, paymentMethod: 'Refunded Method', LastDigits : value.InstrumentLastDigit};
                        refundPaymentMethod.push(res[value.PaymentMethod])
                    }
                    res[value.PaymentMethod].InvoiceAmount += res[value.TotalPaid] == 0 || res[value.TotalPaid] == undefined ? value.Adjustment : value.TotalPaid;
                } 
                return res;
            }, {});
            //Grouped by methoid name paid amoount
            this.saleDetail.PaymentList.reduce(function (res, value) {
                if (value.PaymentStatusTypeID == EnumSalePaymentStatusType.PaidOut.toString()) {
                    if (!res[value.PaymentMethod]) {
                        res[value.PaymentMethod] = { MethodName: value.PaymentMethod, InvoiceAmount: 0, paymentMethod: 'Payment Method' , LastDigits : value.InstrumentLastDigit};
                        paidPaymentMethod.push(res[value.PaymentMethod])
                    }
                    res[value.PaymentMethod].InvoiceAmount += value.TotalPaid;
                }
                return res;
            }, {});
            receipt.paymentMethod = refundPaymentMethod;
            receipt.paidPaymentMethod = paidPaymentMethod;
            

            console.log('Paid Out '+paidPaymentMethod);
            console.log('Refund'+ refundPaymentMethod );
            // this.saleDetail.PaymerefundPaymentMethodntList.forEach(element => {
            //     groupByName[element.MethodName] = groupByName[element.MethodName] || [];
            //     groupByName[element.MethodName].push();



            //     if (element.PaymentStatusTypeID == this.enumSaleStatusType.PMTRefund) {
            //         this.ReceiptPaymentMethod.MethodName = element.MethodName;
            //         this.ReceiptPaymentMethod.PaymentGatewayName = element.PaymentGatewayName;
            //         this.ReceiptPaymentMethod.SaleStatusTypeName = element.PaymentStatusTypeName;
            //         this.ReceiptPaymentMethod.PaymentMethodID = element.PaymentMethodID;
            //         this.ReceiptPaymentMethod.LastDigits = element.InstrumentLastDigit;
            //         this.ReceiptPaymentMethod.InvoiceAmount = element.TotalPaid == "0.00" ? "0" : this.getFormattedAmount(element.TotalPaid);
            //         this.ReceiptPaymentMethod.Adjustment = this.getFormattedAmount(element.Adjustment);

            //         this.ReceiptPaymentMethod = new ReceiptPaymentMethod;
            //     }
            // });
        }

        receipt.branchName = this.branchName;
        receipt.Balance = this.getFormattedAmount(this.saleDetail.BalanceAmount);
        //receipt.BranchInfo = receiptBranch;
        receipt.CashierID = this.saleDetail.CashierName;
        receipt.CustomerName = this.saleDetail.CustomerName;
        receipt.Discount = this.saleDetail.SaleDiscountAmount == 0 ? this.saleDetail.SaleDiscountAmount.toString() : this.getFormattedAmount(this.saleDetail.SaleDiscountAmount);
        receipt.ReceiptAdjustmentAmount = this.getFormattedAmount(this.saleDetail.Adjustment);
        var reciptDate = this._dateTimeService.convertDateObjToString(new Date(this.saleDetail.InvoiceDate), this.receiptDateFormat);
        // receipt.ReceiptDate = this._dateTimeService.convertDateObjToString(new Date(receiptInfo.ReceiptDate), this.receiptDateFormat)
        //     + ' ' + this._dateTimeService.getTimeStringFromDate(new Date(receiptInfo.ReceiptDate), this.timeFormat);
        const receiptTime = this.saleDetail.InvoiceDate.split("T")[1].split(":")[0] + ":" + this.saleDetail.InvoiceDate.split("T")[1].split(":")[1] + ":" + this.saleDetail.InvoiceDate.split("T")[1].split(":")[2];
        receipt.ReceiptTime = this._TimeFormatPipe.transform(receiptTime);
        receipt.ReceiptDate = reciptDate;
        //processed by date and time
        var reciptProcessedByDate = this._dateTimeService.convertDateObjToString(new Date(), this.receiptDateFormat);
        receipt.ReceiptProcessedByDate = reciptProcessedByDate;


        receipt.ReceiptNo = this.saleDetail.SaleInvoiceNumber ? this.saleDetail.SaleInvoiceNumber : this.saleDetail.InvoiceNumber;
        receipt.AppliedTaxNames = this.saleDetail.AppliedTaxNames;
        receipt.AmountPaid = this.getFormattedAmount(this.saleDetail.TotalAmountPaid);
        receipt.ServiceCharges = this.saleDetail.ServiceChargesAmount == 0 ? this.saleDetail.ServiceChargesAmount.toString() : this.getFormattedAmount(this.saleDetail.ServiceChargesAmount);
        receipt.TipAmount = this.saleDetail.TipAmount == 0 ? this.saleDetail.TipAmount.toString() : this.getFormattedAmount(this.saleDetail.TipAmount);
        receipt.SubTotal = this.getFormattedAmount(this.saleDetail.SubTotalPrice);
        receipt.Tax = this.getFormattedAmount(this.saleDetail.TotalTaxAmount);
        receipt.Total = this.getFormattedAmount(this.saleDetail.TotalDue);
        receipt.BalanceDue = this.getFormattedAmount(this.saleDetail.BalanceAmount);
        receipt.TotalRefundedTipAmount = this.saleDetail.RefundedTipAmount.toString();
        receipt.IsRefunded = this.saleDetail.IsRefunded;
        receipt.CurrencySymbol = this.saleDetail.CurrencySymbol;
        receipt.SaleStatusTypeName = this.saleDetail.SaleStatusTypeName ? this.saleDetail.SaleStatusTypeName : this.saleDetail.InvoiceStatus;
        receipt.TotalRefundedServiceChargesAmount = this.saleDetail.RefundedServiceChargesAmount.toString();

        // Methode Info
        // receipt.MethodName = receiptInfo.MethodName;
        // receipt.PaymentGatewayName = receiptInfo.PaymentGatewayName;
        // receipt.SaleTypeName = receiptInfo.SaleTypeName;
        // receipt.LastDigits = receiptInfo.LastDigits;
        // receipt.InvoiceAmount = this.getFormattedAmount(receiptInfo.InvoiceAmount);
        /**For Reward program */
        receipt.EarnedRewardPointsIsToBeCalculated = this.saleDetail.EarnedRewardPointsIsToBeCalculated;
        receipt.RewardPointsEarned = this.saleDetail.RewardPointsEarned;

        return receipt;
    }

    getSubtotal(): number {
        let itemTotalDiscountAmount: number;
        itemTotalDiscountAmount = itemTotalDiscountAmount + this.saleDetail.ItemTotalDiscountAmount;
        itemTotalDiscountAmount = this.saleDetail.SubTotalPrice - this.saleDetail.ItemTotalDiscountAmount;
        this.saleDetail.ItemList.forEach(item => {
        });
        //  this.saleDetail.SubTotalPrice > 0 ? (this.saleDetail.SubTotalPrice - this.saleDetail.ItemTotalDiscountAmount) : this.saleDetail.SubTotalPrice);

        return itemTotalDiscountAmount;
    }
    getFormattedAmount(value: any) {
        return this._currencyFormatter.transform(value, this.currencyFormat);
    }

    getDiscountPercentage(discount: number, pricePerSession: number): number {
        return (discount / pricePerSession) * 100;
    }

    showErrorMessage(message: string) {
        this._messageService.showErrorMessage(message);
    }
    roundValue(value: any) {
        return this._taxCalculationService.getRoundValue(value);
    }

    // #endregion

}
