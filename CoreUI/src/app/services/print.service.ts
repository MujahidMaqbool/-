import { MessageService } from './app.message.service';
import { ReceiptModel, ReceiptItem } from '@app/models/sale.model';
import { PrinterSetup } from '@app/setup/models/printer.setup.model';
import { LoaderService } from './app.loader.service';
import { Messages } from '@app/helper/config/app.messages';
import { DateTimeService } from './date.time.service';
import { TimeFormatPipe } from '@app/application-pipes/time-format.pipe';
import { TaxCalculation } from './tax.calculations.service';

declare var epson: any;
var messageService;
var loaderService;
var dateTimeService;
var timeFormatPipe;

//@Injectable({ providedIn: 'root' })


//Note: "For connect to printer same network connected (PC and Printer) Documentation Link 'https://download.epson-biz.com/'"
// - Added TM printer support - TM-T88VI

export class PrintService {
    // Settings

    messages = Messages;
    builder: any;
    receiptDateFormat: string = "dd-MM-yyyy";

    /* Model Refrences*/
    private _timeout = '10000';
    private _receipt: ReceiptModel;
    private _printerConfig: PrinterSetup;

    constructor(private _messageService: MessageService,
        private _loaderService: LoaderService,
        private _dateTimeService: DateTimeService,
        private _TimeFormatPipe: TimeFormatPipe) {
        messageService = this._messageService;
        loaderService = this._loaderService;
        dateTimeService = this._dateTimeService;
        timeFormatPipe = this._TimeFormatPipe;

        //Create an ePOS-Print Builder object
        this.builder = new epson.ePOSBuilder();
        //Create a print document
        this.builder.addTextLang('en');
        this.builder.addTextSmooth(true);
        this.builder.addTextFont(this.builder.FONT_B);
    }

    printReceipt(receipt: ReceiptModel, printerConfig: PrinterSetup, openDrawer: boolean) {

        this._receipt = receipt;
        this._printerConfig = printerConfig;

        this._addReceiptHeader();
        this._addReceiptItems();
        this._addReceiptTotal();
        this._addReceiptPaymentMethod();
        this._addReceiptFooter();

        this._sendPrint(openDrawer);
    }

    test(printerConfig: PrinterSetup) {
        //console.log(this._receipt);
        this._printerConfig = printerConfig;

        this._receipt = new ReceiptModel();
        this._receipt.ReceiptDate = dateTimeService.convertDateObjToString(new Date(), this.receiptDateFormat);
        this._receipt.ReceiptTime = timeFormatPipe.transform(new Date().toString().split(' ')[4]);
        this._receipt.ReceiptNo = "xxxx";
        this._receipt.CashierID = "test";
        this._receipt.branchName = printerConfig.branchName;
        this._receipt.SaleStatusTypeName = "Test";
        this._receipt.CustomerName = "Walk in";

        this._addReceiptHeader();
        this._addReceiptFooter();

        this._sendPrint();
    }

    private _addReceiptHeader() {
        //console.log(this._receipt);
        /* Add Logo in Header*/
        var canvas: any = document.getElementById('canvas');
        if (canvas.getContext) {
            var context = canvas.getContext('2d');
            context.drawImage(document.getElementById('logo'), 0, 0, 500, 70);
            this.builder.addTextAlign(this.builder.ALIGN_CENTER);
            this.builder.addImage(context, 0, 0, 500, 70, this.builder.COLOR_1);
        }

        this.builder.addText('\n');

        /* Add Dotted Line */
        //this.builder.addHLine(200, 250, this.builder.LINE_THICK);
        this.builder.addTextAlign(this.builder.ALIGN_LEFT);
        this._addDottedLine();

        /* Set Text Style to BOLD */
        this._setBoldTextStyle();

        /* Add Date Time */
        //var now = new Date();
        //this.builder.addText(now.toDateString() + ' ' + now.toTimeString().slice(0, 8));
        this.builder.addTextSize(1, 1);
        this.builder.addText('Invoice Details : ' + this._receipt.ReceiptDate + ' | ' + this._receipt.ReceiptTime + ' | ' + this._receipt.ReceiptNo);
        this.builder.addText('\n');
        this.builder.addTextPosition(0);
        this.builder.addText('Branch : ' + this._receipt.branchName );
        /* Add Receipt Number */

        this.builder.addText('\n');
       // this.builder.addText('Processed By: ' + this._receipt.CashierID+ ' | '+ this._receipt.ReceiptProcessedByDate);
        this.builder.addText('Processed By: ' + this._receipt.CashierID);



        this.builder.addText('\n');
        /* Add Customer Name */
        //this.builder.addTextPosition(350);
        this.builder.addText('Customer: ' + this._receipt.CustomerName);
        this.builder.addText('\n');

        this._setBoldTextStyle();
        this._addBoldLine();
        this._resetFormatting();
        this._setFontTextStyleForSaleStatus();
        this._setBoldTextStyle();
        this.builder.addTextPosition(190);
        this.builder.addText(this._receipt.SaleStatusTypeName.toUpperCase());
        this.builder.addText('\n');
        this._setFontTextStyle();
        /* Add Dotted Line */
        //this.builder.addHLine(200, 250, this.builder.LINE_THICK);
        this._addBoldLine();
       

        this.builder.addTextPosition(0);
        // this.builder.addTextSize(1, 1);
        this._setBoldTextStyle();
        this.builder.addText('Item');

        this.builder.addTextPosition(390)
        this._setBoldTextStyle();
        this.builder.addText('Total\n');

        // this.builder.addTextPosition(220)
        // this.builder.addText('Quantity');
        //this.builder.addTextPosition(300)
        //this.builder.addText('Per Unit');



        /* Add Bold Line */
        this._addBoldLine();
       
        // this.builder.addTextStyle(undefined, false, true, undefined);
    }

    private _addReceiptItems() {
        /* Reset Formatting */
        this._resetFormatting();
        this.builder.addTextSize(1, 1);

        if (this._receipt && this._receipt.Items) {
            this._receipt.Items.forEach((item: ReceiptItem) => {
                let exceedingName = "";
                this.builder.addTextPosition(0);
                /* Set BOLD for item name */
                this._setBoldTextStyle();
                if (item.Name.length > 22) {
                    exceedingName = item.Name.substring(22);
                    this.builder.addText(item.Name.substring(0, 22));
                } else {
                    this.builder.addText(item.Name);
                }

                if (exceedingName && exceedingName.length > 0) {
                    /* Set BOLD for item name */
                    this.builder.addText('\n');
                    this._setBoldTextStyle();
                    this.builder.addText(exceedingName);
                    /* Reset Formatting */
                    this._resetFormatting();
                }

                 /* Reset Formatting */
                 this._resetFormatting();
                // item Amount
                this.builder.addTextPosition(390);
                this.builder.addText(item.Amount);
                this.builder.addText('\n');
               
                // this.builder.addText('\n');
                // this.builder.addTextPosition(220);
                // this.builder.addText('\n');

                 // item description
                 item.Description = item.Description ? item.Description : '';
                 if (item.Description) {
                     item.Description = item.Description ? item.Description : '';
                     this.builder.addText(item.Description);
                     this.builder.addText('\n');
                 }

                if (item.MembershipPaymentInterval && item.MembershipPaymentInterval.length > 0) {
                    this.builder.addTextPosition(0);

                    this.builder.addText(item.MembershipPaymentName);
                    this.builder.addText('\n');

                    this.builder.addText(item.MembershipPaymentInterval);
                    this.builder.addText(' (' + item.MembershipPaymentStartDate + ' - ' + item.MembershipPaymentEndDate + ')');
                    this.builder.addText('\n');

                } else {

                    if(item.VariantName){
                        this.builder.addText(item.VariantName);
                        this.builder.addTextPosition(0);
                    }

                    if (item.ItemIsRefunded && item.ItemRefundedAmount > 0 && item.VariantName) {
                        this.builder.addTextPosition(340);
                        this.builder.addText('Refunded: '+  this._receipt.CurrencySymbol + item.ItemRefundedAmount);
                        this.builder.addText('\n');
                    } else if(item.VariantName){
                        this.builder.addText('\n');
                    }

                    // item Price
                    this.builder.addText('Per Unit: ');
                    this.builder.addText(item.Price);
                    this.builder.addTextPosition(0);
                    // item Quantity
                  
                    if (item.ItemIsRefunded && item.ItemRefundedAmount > 0 && item.VariantName) {
                        this.builder.addTextPosition(280);
                        this.builder.addText('Returned/Cancelled: '+ item.RefundedQty);
                        this.builder.addText('\n');
                    } else if (item.ItemIsRefunded && item.ItemRefundedAmount > 0 && (item.VariantName == null || item.VariantName == "" || item.VariantName == undefined)) {
                        this.builder.addTextPosition(340);
                        this.builder.addText('Refunded: '+  this._receipt.CurrencySymbol + item.ItemRefundedAmount);
                        this.builder.addText('\n');
                    } else {
                        this.builder.addText('\n')
                    }
                    this.builder.addText('Quantity: ');
                    this.builder.addText(item.Qty);
                    this.builder.addTextPosition(0);

                    if (item.ItemIsRefunded && item.ItemRefundedAmount > 0 && (item.VariantName == null || item.VariantName == "" || item.VariantName == undefined)) {
                        this.builder.addTextPosition(280);
                        this.builder.addText('Returned/Cancelled: '+ item.RefundedQty);
                        this.builder.addText('\n');
                    } else {
                        this.builder.addText('\n')
                    }

                    if (item.IsItemRescheduled && item.ItemReScheduleCount > 0) {
                        this.builder.addTextPosition(280);
                        this.builder.addText('Rescheduled: '+ item.ItemReScheduleCount);
                        this.builder.addText('\n');
                    }
                   

                    // item Discount

                    if (item.TotalDiscount) {
                        this.builder.addText('Discount: ');
                        this.builder.addText('-' + this._receipt.CurrencySymbol + item.TotalDiscount);
                        this.builder.addTextPosition(0);
                        this.builder.addText('\n');
                    }

                    // comment this condition as per discussed with haroon and omer shb
                    // if (item.ItemTaxAmount && item.ItemTaxAmount != "0") {
                        this.builder.addText('Tax: ');
                        this.builder.addText(item.ItemTaxAmount == "0" || item.ItemTaxAmount == undefined?  + "0.00" : item.ItemTaxAmount);
                        this.builder.addTextPosition(0);
                        this.builder.addText('\n');
                    // }

                    //Item Discount Type If Exists
                    if (item.DiscountType) {
                        this.builder.addText('');
                        this.builder.addText(item.DiscountType);
                        this.builder.addTextPosition(0);
                        this.builder.addText('\n');
                    }
                }
                /* add line */
                this._addLine();
            })
        }

        // /* Add Item 2*/
        // /* Reset Formatting */
        // this.builder.addTextStyle(undefined, false, false, undefined);
        // this.builder.addTextPosition(0);
        // /* Set BOLD for item name */
        // this.builder.addTextStyle(undefined, false, true, undefined);
        // this.builder.addText('Stone Massage');
        // /* Reset Formatting */
        // this.builder.addTextStyle(undefined, false, false, undefined);

        // this.builder.addTextPosition(220)
        // this.builder.addText('2');
        // this.builder.addTextPosition(300)
        // this.builder.addText('£20.00');
        // this.builder.addTextPosition(390)
        // this.builder.addText('£40.00\n');
        // // item description
        // this.builder.addText('08/06/18 12:34');
        // /* add line */
        // this.builder.addTextPosition(0);
        // this.builder.addTextStyle(undefined, true, true, undefined);
        // this.builder.addText('                                                        \n');
    }

    private _addReceiptTotal() {
        /* Set Text Formatting to BOLD and Text size */
        this._setBoldTextStyle();
        this.builder.addTextSize(1, 1);

        /* Add SubTotal */
        this.builder.addTextPosition(0);
        this.builder.addText('Sub Total(Excl. Tax)');
        this.builder.addTextPosition(390);
        this._resetFormatting();
        this.builder.addText(this._receipt.SubTotal);
        this.builder.addText('\n');

        /* Add Discount */
        if (this._receipt.Discount && this._receipt.Discount != "0") {
            this._setBoldTextStyle();
            this.builder.addTextPosition(0);
            this.builder.addText('Sale Discount');
            this.builder.addTextPosition(390);
            this._resetFormatting();
            this.builder.addText(this._receipt.Discount);
            this.builder.addText('\n');
        }
        /* Add Tax */
        this._setBoldTextStyle();
        this.builder.addTextPosition(0);
        if (this._receipt.AppliedTaxNames && this._receipt.AppliedTaxNames.length > 0) {
            this.builder.addText('Tax (' + this._receipt.AppliedTaxNames + ')');
        } else {
            this.builder.addText('Tax:' + this._receipt.AppliedTaxNames);
        }
        this.builder.addTextPosition(390);
        this._resetFormatting();
        this.builder.addText(this._receipt.Tax);
        this.builder.addText('\n');

        /* Add Service Charges */
        if (this._receipt.ServiceCharges && this._receipt.ServiceCharges != "0") {
            this._setBoldTextStyle();
            this.builder.addTextPosition(0);
            this.builder.addText('Service Charges');
            this.builder.addTextPosition(390);
            this._resetFormatting();
            this.builder.addText(this._receipt.ServiceCharges);
            this.builder.addText('\n');
        }

        if (this._receipt.IsRefunded && this._receipt.TotalRefundedServiceChargesAmount != "0") {
            this.builder.addTextPosition(350);
            this.builder.addText(this._receipt.CurrencySymbol + 'Refunded: '+ this._receipt.TotalRefundedServiceChargesAmount);
            this.builder.addText('\n');
        }

        /* Add Tips */
        if (this._receipt.TipAmount && this._receipt.TipAmount != "0") {
            this._setBoldTextStyle();
            this.builder.addTextPosition(0);
            this.builder.addText('Tips');
            this.builder.addTextPosition(390);
            this._resetFormatting();
            this.builder.addText(this._receipt.TipAmount);
            this.builder.addText('\n');
        }

        if (this._receipt.IsRefunded && this._receipt.TotalRefundedTipAmount != "0") {

            this.builder.addTextPosition(350);
            this.builder.addText(this._receipt.CurrencySymbol + 'Refunded: '+ this._receipt.TotalRefundedTipAmount);
            this.builder.addText('\n');
        }

        /* Add Bold Line */
        this._addDottedLine();


        /* Add Total */
        this.builder.addTextStyle(undefined, false, true, undefined);
        this.builder.addTextPosition(0);
        this.builder.addText('Total Due');
        this._resetFormatting();
        this.builder.addTextPosition(390)
        this.builder.addText(this._receipt.Total);
        this.builder.addText('\n');

        /* Add Bold Line */
        this.builder.addTextPosition(0);
        //this._addBoldLine();

        /* Add Balance */
        if (this._receipt.Balance && !this._receipt.HasRemainingAmount && !this._receipt.IsPreviouslyAmountPaid) {
            this._setBoldTextStyle();
            this.builder.addTextPosition(0);
            /* Reset Formatting */
            this.builder.addText('Total Paid');
            this.builder.addTextPosition(390);
            this._resetFormatting();
            this.builder.addText(this._receipt.AmountPaid);
            this.builder.addText('\n');

            // this._setBoldTextStyle();
            // this.builder.addText('Balance Amount');
            // this.builder.addTextPosition(390);
            // this._resetFormatting();
            // this.builder.addText(this._receipt.Balance);
            // this.builder.addText('\n');

            // will not be payable ... after discuss with zahra
            // this._setBoldTextStyle();
            // this.builder.addText('Payable Amount');
            // this.builder.addTextPosition(390);
            // this._resetFormatting();
            // this.builder.addText(this._receipt.Balance);
            // this.builder.addText('\n');

        }
        else {
            this.builder.addTextStyle(undefined, false, true, undefined);
            //this.builder.addTextPosition(0);
            /* Reset Formatting */
            this._resetFormatting();

            // in partial payment case if user had paid some amount on pruchsed time.
            if (this._receipt.IsPreviouslyAmountPaid) {
                this.builder.addText('Total of Previously Paid Amount');
                this.builder.addTextPosition(390)
                this.builder.addText(this._receipt.TotalPreviousPaid);
                this.builder.addText('\n');
            }

            this.builder.addText('Total Paid');
            this.builder.addTextPosition(390)
            this.builder.addText(this._receipt.AmountPaid);
            this.builder.addText('\n');

            // will not be payable ... after discuss with zahra
            // if (this._receipt.HasRemainingAmount) {
            //     // this.builder.addText('Balance Amount');
            //     // this.builder.addTextPosition(390)
            //     // this.builder.addText(this._receipt.BalanceAmount);
            //     // this.builder.addText('\n');
            //     // this._setBoldTextStyle();
            //     this.builder.addText('Remaining Balance');
            //     this.builder.addTextPosition(390);
            //     this._resetFormatting();
            //     this.builder.addText(this._receipt.BalanceAmount);
            //     this.builder.addText('\n');

            // }
            // else {
            //     this.builder.addText('Payable Amount');
            //     this.builder.addTextPosition(390)
            //     this.builder.addText(this._receipt.Balance);
            //     this.builder.addText('\n');
            // }


        }

        this._setBoldTextStyle();
        this.builder.addTextPosition(0);
        this.builder.addText('Adjustment');
        this.builder.addTextPosition(390);
        this._resetFormatting();
        this.builder.addText(this._receipt.ReceiptAdjustmentAmount);
        this.builder.addText('\n');

        this.builder.addTextPosition(0);
        this._addBoldLine();

        this._setBoldTextStyle();
        this.builder.addTextPosition(0);
        this.builder.addText('Balance Due');
        this.builder.addTextPosition(390);
        this._resetFormatting();
        this.builder.addText(this._receipt.BalanceDue);
        this.builder.addText('\n');

        /* Add Bold Line */
        this.builder.addTextPosition(0);
        this._addBoldLine();

        /**==============Reward points section============*/
        if(this._receipt.EarnedRewardPointsIsToBeCalculated || this._receipt.EarnedRewardPointsIsToBeCalculated != null) {
        this._setBoldTextStyle();
        this.builder.addTextPosition(0);
        this.builder.addText('Reward Program');
        this.builder.addTextPosition(350);
        this._resetFormatting();
        if (this._receipt.EarnedRewardPointsIsToBeCalculated) {
            this.builder.addText('To Be Calculated');
        } else {
            this.builder.addTextPosition(390);
            this.builder.addText(this._receipt.RewardPointsEarned);
        }
        this.builder.addText('\n');

        this.builder.addTextPosition(0);
        this.builder.addText('Reward Points Earned');
        this.builder.addText('\n');

        this.builder.addTextPosition(0);
        this._addLine();
    }
        /**=========Reward points section End===========*/

    }

    private _addReceiptPaymentMethod() {
        if (this._receipt.paidPaymentMethod && this._receipt.paidPaymentMethod.length > 0) {
            let ispaymentMethodPrinted = false;
            this._receipt.paidPaymentMethod.forEach(element => {
                if (element.paymentMethod && element.paymentMethod.length > 0 && !ispaymentMethodPrinted ) {
                    this._setBoldTextStyle();
                    this.builder.addTextPosition(0);
                    this.builder.addText(element.paymentMethod);
                    this.builder.addText('\n');
                    ispaymentMethodPrinted = true;
                }

                if (element.MethodName && element.MethodName.length > 0) {
                    this._setBoldTextStyle();
                    this.builder.addTextPosition(0);
                    // set payment method name reward program to reward points after discussed with sohaib shb and zahra
                    this.builder.addText(element.MethodName == 'Reward Program'? 'Reward Points': element.MethodName);
                    this.builder.addTextPosition(390);
                    this._resetFormatting();
                    this.builder.addText(this._receipt.CurrencySymbol + element.InvoiceAmount);
                    this.builder.addText('\n');
                }

                if (element.LastDigits && element.LastDigits.length > 0) {
                    this._setBoldTextStyle();
                    this.builder.addTextPosition(0);
                    this.builder.addText('Card Type:');
                    this._resetFormatting();
                    this.builder.addText('**** **** **** **** ' + element.LastDigits);
                    this.builder.addText('\n');
                }              


            })           
            this._addBoldLine();
            this._resetFormatting();
        }


        // this.builder.addText('\n');
        // this._addBoldLine();

        if (this._receipt.paymentMethod && this._receipt.paymentMethod.length > 0) {
            let ispaymentMethodPrinted = false;
            this._receipt.paymentMethod.forEach(element => {

                if (element.paymentMethod && element.paymentMethod.length > 0 && !ispaymentMethodPrinted) {
                    this._setBoldTextStyle();
                    this.builder.addTextPosition(0);
                    this.builder.addText(element.paymentMethod);
                    this.builder.addText('\n');
                    ispaymentMethodPrinted = true;
                }

                if (element.MethodName && element.MethodName.length > 0) {
                    this._setBoldTextStyle();
                    this.builder.addTextPosition(0);
                    this.builder.addText(element.MethodName);
                    this.builder.addTextPosition(390);
                    this._resetFormatting();
                    this.builder.addText(this._receipt.CurrencySymbol + element.InvoiceAmount == "0" ? element.Adjustment : element.InvoiceAmount);
                    this.builder.addText('\n');
                }

                if ((element.LastDigits && element.LastDigits.length > 0)) {
                    this._setBoldTextStyle();
                    this.builder.addTextPosition(0);
                    this.builder.addText('Card Type:');
                    this._resetFormatting();
                    this.builder.addText('**** **** **** **** ' + element.LastDigits);
                    this.builder.addText('\n');
                }
            });

            this._addBoldLine();
            this._resetFormatting();
        }

    }


    private _addReceiptFooter() {
        /* Reset Formatting */
        this._resetFormatting();
        /* Text size */
        this.builder.addTextSize(1, 1);
        this.builder.addTextAlign(this.builder.ALIGN_CENTER);
        this.builder.addTextPosition(0);
        this.builder.addText('\n');

        /* Address */
        //this.builder.addText('Unit 15 Adagio, 38 Creek Road, Greenwich, London, SE 8 3 FN \n');
        if (this._printerConfig.ReceiptAddress && this._printerConfig.ReceiptAddress.length > 0) {
            this.builder.addText(this._printerConfig.ReceiptAddress);
            this.builder.addText('\n');
        }

        /* Email */
        //this.builder.addText('E: spa@maridian-spa.co.uk ');
        if (this._printerConfig.ReceiptEmail && this._printerConfig.ReceiptEmail.length > 0) {
            this.builder.addText('Email: ' + this._printerConfig.ReceiptEmail);
            this.builder.addText('\n');
        }

        /* Website */
        //this.builder.addText('www.maridian-spa.co.uk \n');
        if (this._printerConfig.WebSite && this._printerConfig.WebSite.length > 0) {
            this.builder.addText('Website: ' + this._printerConfig.WebSite);
            this.builder.addText('\n');
        }

        /* Phone */
        //this.builder.addText('T: 020 8469 1961 \n');
        if (this._printerConfig.ReceiptPhone && this._printerConfig.ReceiptPhone.length > 0) {
            this.builder.addText('  Telephone: ' + this._printerConfig.ReceiptPhone);
            this.builder.addText('\n');
        }

        /* VAT */
        //this.builder.addText('VAT: GB7070908525 \n');
        if (this._printerConfig.NTN && this._printerConfig.NTN.length > 0) {
            this.builder.addText(this._printerConfig.TaxName + ' : ' + this._printerConfig.NTN);

        }
        this.builder.addText('\n');
        this._addBoldLine();
        this._resetFormatting();
        /* Add Dotted Line */
        //this.builder.addHLine(200, 250, this.builder.LINE_THICK);

        //this._addLine();
        this.builder.addText(this._printerConfig.FooterNotes);
        this.builder.addText('\n');


        this._addDottedLine();
        /* Powered by */
        this.builder.addText('Powered by: Wellyx');
        this.builder.addText('\n');
    }


    private _sendPrint(openDrawer?: boolean) {
        //Acquire the print document
        this.builder.addFeedLine(1);
        this.builder.addCut(this.builder.CUT_FEED);

        if (openDrawer) {
            this.builder.addPulse();
        }

        var request = this.builder.toString();

        //Set the end point address
        var address = 'https://' + this._printerConfig.PrinterIPAddress + '/cgi-bin/epos/service.cgi?devid=local_printer&timeout=' + this._timeout;
        //Create an ePOS-Print object
        var epos = new epson.ePOSPrint(address);

        var messages = this.messages;

        epos.onreceive = function (res) {
            // {success: true, code: "", status: 251658262, battery: 0, printjobid: ""}
            //When the printing is not successful, display a message
            loaderService.hide();
            if (!res.success) {
                messageService.showErrorMessage(messages.Error.Reciept_Print);

            }
            else {
                messageService.showSuccessMessage(messages.Success.Print_Sent);
            }
        };

        epos.onerror = function (err) {
            loaderService.hide();
            messageService.showErrorMessage(messages.Error.Reciept_Print);
        }

        epos.onoffline = function (err) {
            loaderService.hide();
            messageService.showErrorMessage(messages.Error.Printer_Offline);
        }

        //Send the print document
        loaderService.show();
        epos.send(request);
    }

    private _addBoldLine() {
        this.builder.addTextStyle(undefined, true, true, undefined);
        this.builder.addText('                                                        \n');
    }

    private _setBoldTextStyle() {
        this.builder.addTextStyle(undefined, false, true, undefined);
    }

    private _setFontTextStyle() {
        this.builder.addTextFont(this.builder.FONT_B);
    }

    private _setFontTextStyleForSaleStatus() {
        this.builder.addTextFont(this.builder.FONT_A);
    }

    private _addDottedLine() {
        this.builder.addText('........................................................\n');
    }

    private _addDottedLineForFooter() {
        this.builder.addText('.................................................\n');
    }

    private _addLine() {
        this.builder.addTextPosition(0);
        this.builder.addTextStyle(undefined, true, true, undefined);
        this.builder.addText('                                                        \n');
    }

    private _resetFormatting() {
        this.builder.addTextStyle(undefined, false, false, undefined);
    }
}
