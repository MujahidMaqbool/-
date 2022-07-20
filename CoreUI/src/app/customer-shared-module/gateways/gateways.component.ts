// #region Imports

/*********************** Angular References *************************/
import { Component, OnInit, OnDestroy } from "@angular/core";
import { SubscriptionLike, SubscriptionLike as ISubscription } from "rxjs";

/*********************** Material References *************************/

/*********************** Models & Services *************************/
/* Models */
import { ApiResponse, PersonInfo } from "src/app/models/common.model";
import { GatewayAccountSearch } from "src/app/customer/member/models/member.gateways.model";
import { CustomerPaymentGateway } from "src/app/customer/member/models/member.gateways.model";

/* Services*/
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { DataSharingService } from "src/app/services/data.sharing.service";

/*********************** Components *************************/
import { AddGatewayComponent } from "src/app/customer-shared-module/gateways/add-gateway/add-gateway.component";
import { ViewGatewayComponent } from "src/app/customer-shared-module/gateways/view-gateway/view-gateway.component";
import { DeleteConfirmationComponent } from "src/app/application-dialog-module/delete-dialog/delete.confirmation.component";
/*********************** Common *************************/
import { CustomerPaymentGatewayApi } from "src/app/helper/config/app.webapi";
import { Messages } from "src/app/helper/config/app.messages";
import {
  ENU_PaymentGateway,
  ENU_DateFormatName,
} from "src/app/helper/config/app.enums";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";
import { AbstractGenericComponent } from "src/app/shared/helper/abstract.generic.component";
import { EditGatewayComponent } from "./edit-gateway/edit-gateway.component";
import { EditCard } from "src/app/setup/models/gateway.card.model";
import { Configurations } from "src/app/helper/config/app.config";

// #endregion Imports

@Component({
  selector: "gateways",
  templateUrl: "./gateways.component.html",
})
export class GatewaysComponent
  extends AbstractGenericComponent
  implements OnInit, OnDestroy {
  // #region Local Members

  customerId: number;
  shouldGetPersonInfo: boolean = false;
  isDataExists: boolean = false;
  dateFormat: string = ""; //Configurations.DateFormat;

  /* Models & Collections */
  customerGatewayList: CustomerPaymentGateway[];
  gatewayAccountSearchParams = new GatewayAccountSearch();

  // personInfo: PersonInfo;
  customerIdSubscripiton: SubscriptionLike;
  customerTypeIdSubscription: ISubscription;
  customerType: number;

  gatewayType = ENU_PaymentGateway;
  messages = Messages;
  sortOrder_ASC = Configurations.SortOrder_ASC;
  sortOrder_DESC = Configurations.SortOrder_DESC;
  sortOrder = this.sortOrder_DESC;

  // #endregion

  constructor(
    private _dataSharingService: DataSharingService,
    private _messageService: MessageService,
    private _httpService: HttpService,
    private _dialog: MatDialogService
  ) {
    super();
  }

  ngOnInit() {
    this.getBranchDatePattern();
    this.getCustomerType();
    this.customerIdSubscripiton = this._dataSharingService.customerID.subscribe(
      (customerId: number) => {
        if (customerId && customerId > 0) {
          this.customerId = customerId;

          //set PersonID and PersonTypeID for personInfo
          // this.personInfo = new PersonInfo();
          // this.personInfo.PersonID = customerId;
          // this.personInfo.PersonTypeID = this.customerType;
          this.shouldGetPersonInfo = true;
          // this._dataSharingService.sharePersonInfo(this.personInfo);
          this.getAllCustomerGateways();
        }
      }
    );
  }

  getCustomerType() {
    this.customerTypeIdSubscription = this._dataSharingService.customerTypeID.subscribe(
      (customerType) => {
        this.customerType = customerType;
      }
    );
  }

  ngOnDestroy() {
    this.customerIdSubscripiton.unsubscribe();
    this.customerTypeIdSubscription.unsubscribe();
  }

  // #region Event(s)

  onAddGateway() {
    this.openDialogForAddGateway();
  }
  onEditGateway(EditCardModel: EditCard) {
    EditCardModel.customerID = this.customerId;
    this.openDialogForEditGateway(EditCardModel);
  }

  onViewGateway() {
    this._dialog.open(ViewGatewayComponent, {
      disableClose: true,
    });
  }

  onDeleteGateway(gateway: CustomerPaymentGateway) {
    this.openDialogForDeleteGateway(gateway);
  }

  // onMakeDefaultGateway(gateway: CustomerPaymentGateway) {
  //     this.makeDefaultGateway(gateway);
  // }

  // #endregion

  // #region Method(s)

  async getBranchDatePattern() {
    this.dateFormat = await super.getBranchDateFormat(
      this._dataSharingService,
      ENU_DateFormatName.DateFormat
    );
  }

  getAllCustomerGateways() {
    this.gatewayAccountSearchParams.CustomerID = this.customerId;
    this.customerGatewayList = [];
    this._httpService
      .get(
        CustomerPaymentGatewayApi.getAllCustomerGateways,
        this.gatewayAccountSearchParams
      )
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this.isDataExists = response.Result && response.Result.length > 0 ? true : false;
            if (this.isDataExists) {
              this.customerGatewayList = response.Result;
            }
          } else {
            this._messageService.showErrorMessage(response.MessageText);
          }
        },
        (error) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Payment Gateways")
          );
        }
      );
  }

  openDialogForAddGateway() {
    const dialogRef = this._dialog.open(AddGatewayComponent, {
      disableClose: true,
    });

    dialogRef.componentInstance.gatewaySaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this.getAllCustomerGateways();
      }
    });
  }
  openDialogForEditGateway(EditCardModel: EditCard) {
    const dialogRef = this._dialog.open(EditGatewayComponent, {
      disableClose: true,
      data: EditCardModel,
    });
    dialogRef.componentInstance.gatewayEditSaved.subscribe(
      (isSaved: boolean) => {
        if (isSaved) {
          this.getAllCustomerGateways();
        }
      }
    );
  }
  openDialogForDeleteGateway(gateway: CustomerPaymentGateway) {
    const dialogRef = this._dialog.open(DeleteConfirmationComponent, {
      disableClose: true,
      data: {
        header: this.messages.Delete_Messages.Del_Msg_Generic.replace(
          "{0}",
          ""
        ),
        description: this.messages.Delete_Messages.Del_Msg_Undone,
      },
    });

    dialogRef.componentInstance.confirmDelete.subscribe(
      (isConfirm: boolean) => {
        if (isConfirm) {
          this.deleteGateway(gateway);
        }
      }
    );
  }

  deleteGateway(gateway: CustomerPaymentGateway) {
    let params = {
      CustomerID: this.customerId,
      SaleTypeID: gateway.SaleTypeID,
      PaymentGatewayID: gateway.PaymentGatewayID,
      CustomerPaymentGatewayID: gateway.CustomerPaymentGatewayID,
    };

    this._httpService
      .delete(CustomerPaymentGatewayApi.deleteGateway, params)
      .subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            this._messageService.showSuccessMessage(
              this.messages.Success.Delete_Success.replace(
                "{0}",
                "Gateway Account"
              )
            );
            this.getAllCustomerGateways();
          } else {
            this._messageService.showErrorMessage(res.MessageText);
          }
        },
        (error) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Delete_Error.replace("{0}", "Gateway Account")
          );
        }
      );
  }

  changeSorting(index) {
    this.gatewayAccountSearchParams.SortIndex = index;
    if (this.sortOrder == this.sortOrder_ASC) {
      this.sortOrder = this.sortOrder_DESC;
      this.gatewayAccountSearchParams.SortOrder = this.sortOrder;
      this.getAllCustomerGateways();
    } else {
      this.sortOrder = this.sortOrder_ASC;
      this.gatewayAccountSearchParams.SortOrder = this.sortOrder;
      this.getAllCustomerGateways();
    }
  }

  // makeDefaultGateway(gateway: CustomerPaymentGateway) {
  //     let url = CustomerPaymentGatewayApi.makeDefaultGateway + "?customerID=" + this.customerId + "&instrumentID=" + gateway.CustomerPaymentGatewayID;
  //     this._httpService.save(url, null)
  //         .subscribe((response: ApiResponse) => {
  //             if (response && response.MessageCode > 0) {
  //                 this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Default Gateway"));
  //                 this.getAllCustomerGateways();
  //             }
  //             else {
  //                 this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Default Gateway"));
  //             }
  //         },
  //             error => {
  //                 this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Default Gateway"));
  //             }
  //         )
  // }

  // #endregion
}
