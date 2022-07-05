import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Configurations } from '@app/helper/config/app.config';
import { EnumPurchaseOrderStatus } from '@app/helper/config/app.enums';
import { Messages } from '@app/helper/config/app.messages';
import { PurchaseOrderApi } from '@app/helper/config/app.webapi';
import { EmailModel } from '@app/product/models/purchaseOrder.model';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';


@Component({
  selector: 'app-email-order',
  templateUrl: './email.order.component.html',
  styles: ['.dx-quill-container { min-height: 200px; }']
})
export class EmailOrderComponent implements OnInit {

 
  /*********** region Local Members ****/
  messages = Messages;
  emailBodyMaxLength = Configurations.SupplierEmailMaxLength;
  disableSaveBtn: boolean = false;
  isInvalidEmailBody: boolean = false;
  showEmailBodyValidation:boolean = false;
  submitted:boolean =false;
  emailBodyWithoutHTML:string;
  supplierEmailAddresses:string = "";
  supplierEmailModel:EmailModel = new EmailModel();
  enumPOStatus = EnumPurchaseOrderStatus;

  @ViewChild("EmailOrder") emailOrderForm: NgForm;


  constructor(
    private _dialog: MatDialogRef<EmailOrderComponent>,
    private _httpService: HttpService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) { 


  }

  ngOnInit(): void {

    if (this.dialogData.email) {
      this.supplierEmailAddresses = this.dialogData.email;
    }
    if(this.dialogData.purchaseOrderID) {
      this.supplierEmailModel.PurchaseOrderID = this.dialogData.purchaseOrderID;
    }

    if(this.dialogData.purchaseOrderStatusID && (this.dialogData.purchaseOrderStatusID === this.enumPOStatus.Received || this.dialogData.purchaseOrderStatusID === this.enumPOStatus.PartiallyReceived)) {
      this.supplierEmailModel.isGrn = 1;
    }

  }

  /******Remove html tags from email body and count text****** */
  getDescriptionWithOutHtml() {    
    this.emailBodyWithoutHTML = this.supplierEmailModel.Text.replace(/<[^>]*>/g, '').replace('&quot;', '"')
                                .replace('&quot;', '"').replace('&amp;', '&').replace('&apos;', "'").replace('&gt;', '>').replace('&lt;', '<').replace('&#39;', "'");    
  }

  // description validation for empty new line
  onDescriptionUpdated(value: string) {
    this.supplierEmailModel.Text = value === "<br>" ? "" : value;
    this.getDescriptionWithOutHtml();
    if (this.emailBodyWithoutHTML && this.emailBodyWithoutHTML.length > this.emailBodyMaxLength) {
      this.isInvalidEmailBody = true;      
    } else {      
      this.isInvalidEmailBody = false;
    }

  }

  sendEmailToSupplier() {

    this.submitted = true;    
  
    if (this.emailOrderForm.valid && this.supplierEmailModel.Subject.trim() != '' && this.supplierEmailModel.Subject.trim() != null) {
      this.disableSaveBtn = true;
      this.supplierEmailModel.SupplierEmail = this.supplierEmailAddresses.split(';');
      let supplierEmailData = JSON.parse(JSON.stringify(this.supplierEmailModel));
      this._httpService.save(PurchaseOrderApi.sendEmail, supplierEmailData).subscribe((respose) => {
        if (respose.MessageCode > 0) {
          this._messageService.showSuccessMessage(this.messages.Success.Email_Success);
          this.disableSaveBtn = false;
          this.onCloseDialog();
        } else {
          this.disableSaveBtn = false;
          this._messageService.showErrorMessage(respose.MessageText);
        }
  
      },
        error => {
          this.disableSaveBtn = false;
          this._messageService.showErrorMessage(this.messages.Error.Send_Error.replace("{0}", "email to supplier"));
        });
    } else {
      
      this._messageService.showErrorMessage(this.messages.Validation.Info_Required);
    }
  
  }

  sendEmail() {

    if (this.isInvalidEmailBody) {
      this._messageService.showErrorMessage(this.messages.Validation.Email_MaxLength.replace('{0}', this.emailBodyMaxLength.toString()));
      return;
    } else {

      this.sendEmailToSupplier();
    }
  }

  onCloseDialog() {
    this._dialog.close();
  }


}
