import { Component, OnInit, ViewChild, EventEmitter, Output, Inject } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Messages } from "@app/helper/config/app.messages";
import { HttpService } from "@app/services/app.http.service";
import { MessageService } from "@app/services/app.message.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GatewayCard, EditCard } from "@app/setup/models/gateway.card.model";
import { ApiResponse } from "@app/models/common.model";
import { CustomerPaymentGatewayApi } from "@app/helper/config/app.webapi";
import { Configurations } from "@app/helper/config/app.config";

@Component({
    selector: 'edit-gateway',
    templateUrl: './edit-gateway.component.html'
})
export class EditGatewayComponent implements OnInit {
    @ViewChild('editGatewayForm') editGatewayForm: NgForm;
    @Output()
    gatewayEditSaved = new EventEmitter<boolean>();

    /* Messages */
    messages = Messages;

    /* Local Variables */
    pageTitle: string;
    public GatewayCard: GatewayCard = new GatewayCard();
    lastDigits: string = '';
    currentDate:Date = new Date();
    months:Array<any>=Configurations.Months;
    years:number[];
    currentMonth:number;
  currentYear: number;
    constructor(private _httpService: HttpService,
        private _messageService: MessageService,
        public dialogRef: MatDialogRef<EditGatewayComponent>,
        @Inject(MAT_DIALOG_DATA) public EditCardModel: EditCard
    ) {
        this.pageTitle = "Edit Card";

    }
    ngOnInit() {
        this.lastDigits = this.EditCardModel.Last4;
        this.GatewayCard.customerID = this.EditCardModel.customerID;
        this.GatewayCard.customerPaymentGatewayID = this.EditCardModel.CustomerPaymentGatewayID;
        this.GatewayCard.name = this.EditCardModel.Name;
        this.GatewayCard.expMonth = this.EditCardModel.ExpMonth
        this.GatewayCard.expYear = this.EditCardModel.ExpYear;
        this.years = this.generateNextYears();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
    }
    onClosePopup(): void {
        this.dialogRef.close();
    }
    // #region Methods

    saveCard(isValid: boolean) {
        if (isValid && this.editGatewayForm.dirty) {
            this._httpService.save(CustomerPaymentGatewayApi.editGatewayCard, this.GatewayCard)
                .subscribe((response: ApiResponse) => {
                    if (response && response.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Card"));
                        this.onClosePopup();
                        this.gatewayEditSaved.emit(true);
                    }
                    else if (response && response.MessageCode < 0) {
                        this._messageService.showErrorMessage(response.MessageText);
                    }
                    else {
                        this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Card"));
                    }
                },
                    err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Card")); }
                );
        }
    }

 generateNextYears() {
     let min;
      //  if(this.EditCardModel.ExpYear){
      //    min = this.EditCardModel.ExpYear;
      //  }
      //  else{
         min = new Date().getFullYear();
      //  }

        var max = min + 50;
        var years = []

        for (var i = min; i <= max; i++) {
          years.push(i)
        }
        return years
      }

      onChangeYear() {
        this.GatewayCard.expMonth = null
      }

      OnChangeNameOnCard(){
          this.GatewayCard.name = this.GatewayCard.name?.trim();
      }
    // #endrgion
}
