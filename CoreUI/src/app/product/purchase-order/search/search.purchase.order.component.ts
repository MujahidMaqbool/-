/********************** Angular Refrences *********************/
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

/***********Components *************/
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { ReceiveOrderComponent } from '../receive-order/receive.order.component';
import { EmailOrderComponent } from '../email-order/email.order.component';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { ViewPurchaseOrderComponent } from '../view/view.purchase.order.component';
/********************** Services & Models *********************/
/* Services */
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
/* Models */
import { PurchaseOrderSearchParameter, BranchList, SuppliersList } from "src/app/product/models/purchaseOrder.model";
import { ApiResponse, DD_Branch } from "src/app/models/common.model";
import { Messages } from 'src/app/helper/config/app.messages';
import { AuthService } from 'src/app/helper/app.auth.service';
import { PurchaseOrderApi } from 'src/app/helper/config/app.webapi';
import { EnumPurchaseOrderStatus, EnumPurchaseOrderStatusName, ENU_DateFormatName, FileType, EnumSaleSourceType } from 'src/app/helper/config/app.enums';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { AlertConfirmationComponent } from 'src/app/application-dialog-module/confirmation-dialog/alert.confirmation.component';
import { SubscriptionLike } from 'rxjs';
import { Configurations } from 'src/app/helper/config/app.config';
import { CommonService } from 'src/app/services/common.service';
import { ENU_Permission_Module, ENU_Permission_Product } from 'src/app/helper/config/app.module.page.enums';


@Component({
  selector: 'app-search-purchase-order',
  templateUrl: './search.purchase.order.component.html'
})
export class SearchPurchaseOrderComponent extends AbstractGenericComponent implements OnInit {

  /**Local variables */
  purchaseOrderSearchParameter: PurchaseOrderSearchParameter = new PurchaseOrderSearchParameter();
  dateFromToPlaceHolder: string = "Created Date";
  messages = Messages;
  isDataExists: boolean = false;
  enumPOStatus = EnumPurchaseOrderStatus;
  enumAppSourceType = EnumSaleSourceType;
  purchaseOrderDetails: any;
  fileType = FileType;
  companyID: number;
  branchID: number;
  currencySymbol: string = "";
  dateFormat: string = "";
  dateTimeFormat: string = "";
  timeFormat: string = "";
  AllowedNumberKeysOnly = Configurations.AllowedNumberKeysOnly;
  isMultiBranch:boolean = false;

  company: SubscriptionLike;
  currentBranchSubscription: SubscriptionLike;
  save_PO:boolean;
  delete_PO:boolean;
  view_PO:boolean;
  emailToSupplier: boolean = false;
  branchList: BranchList[] = [];
  suppliersList: SuppliersList[] = [];
  purchaseOrdersList: Array<any> = [];

  purchaseOrderOptions = [
    { poStatusID: EnumPurchaseOrderStatus.Ordered, poStatusName: EnumPurchaseOrderStatusName.Ordered },
    { poStatusID: EnumPurchaseOrderStatus.Received, poStatusName: EnumPurchaseOrderStatusName.Received },
    { poStatusID: EnumPurchaseOrderStatus.PartiallyReceived, poStatusName: EnumPurchaseOrderStatusName.PartiallyReceived },
    { poStatusID: EnumPurchaseOrderStatus.Cancelled, poStatusName: EnumPurchaseOrderStatusName.Cancelled }
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;
  @ViewChild("pODateSearch") poDateSearch: DateToDateFromComponent;
  @ViewChild("poNumber") private _inputElement: ElementRef;


  constructor(
    private _dialog: MatDialogService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    public _authService: AuthService,
    private _commonService: CommonService,
    private _dataSharingService: DataSharingService,
  ) {
    super();
  }

  ngOnInit(): void {
      this.isMultiBranchID();
      this.getCurrentBranchDetail();
      this.getFundamentals();
      this.setPermission();
  }


  ngOnDestroy() {
    this.company?.unsubscribe();
  }

  focusInput() {
    setTimeout(() => { this._inputElement.nativeElement.focus() }, 700)
  }

  async getCurrentBranchDetail() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.timeFormat = await super.getBranchTimeFormat(this._dataSharingService);
        this.dateTimeFormat =  this.dateFormat + " - " + this.timeFormat;

        this.getCompanyDetails();
        const branch = await super.getBranchDetail(this._dataSharingService);
        if (branch && branch.hasOwnProperty("Currency")) {
            this.branchID = branch.BranchID;
            this.currencySymbol = branch.CurrencySymbol
        }
    }

     //check here if we have interprise level permission or not
  async isMultiBranchID() {
    await this._dataSharingService.sharedIsMultiBranchCompany.subscribe((isMultiBranch: boolean) => {
    this.isMultiBranch = isMultiBranch;
    if(!isMultiBranch){
      this.purchaseOrderSearchParameter.TypeID = EnumSaleSourceType.OnSite;
    }
  });
  }

  setPermission() {
    this.save_PO = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.PO_Save);
    this.view_PO = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.PO_View);
    this.delete_PO = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.PO_Delete);
    this.emailToSupplier = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.PO_EmailToSupplier);
  }

  async getCompanyDetails() {
    const company = await super.getCompanyDetail(this._dataSharingService);
    if (company) {
      this.companyID = company.CompanyID;
    }
  }

  /***** Get Search Fundamentals******/
  getFundamentals() {
    this._httpService.get(PurchaseOrderApi.getFundamentals).subscribe(
      (response: ApiResponse) => {
        if (response.MessageCode > 0) {
          this.branchList = response.Result.branchList;
          this.suppliersList = response.Result.suppliersLsit;
          this.getPurchaseOrdersList();
        } else {
          this._messageService.showErrorMessage(response.MessageText);
        }
      },
      (error) => {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "purchase order fundamental"));
      }
    );
  }

  /****Reset search parameters */
  OnResetSearch() {

    this.purchaseOrderSearchParameter = new PurchaseOrderSearchParameter();
    this.suppliersList ? this.suppliersList[0]?.SupplierID : 0;

    this.appPagination.resetPagination();
   // this.poDateSearch.resetDateFilter();
    this.poDateSearch.setEmptyDateFilter();
    this.getPurchaseOrdersList();
  }

  /*******view purchase order detail *********/
  viewPurchaseOrderDetail(id: any, isPO) {

    let url = isPO ? PurchaseOrderApi.getPurchaseOrderDetailByID + id : PurchaseOrderApi.getGRNDetailByID + id
    this._httpService.get(url).subscribe(data => {
      if (data && data.Result != null) {
        this.purchaseOrderDetails = data.Result;
        this.purchaseOrderDetails.isPO = isPO;
        this.purchaseOrderDetails.isMultiBranch = this.isMultiBranch;
        this._dialog.open(ViewPurchaseOrderComponent, {
          disableClose: true,
          data: { ...this.purchaseOrderDetails }
        });
      }
      else {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', 'purchase order detail'));
      }
    });
    (error) => {
      this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', 'purchase order detail'));
    }

  }

  viewGRNDetailByID(purchaseOrderGRNID: number) {
    this._dialog.open(ViewPurchaseOrderComponent, {
      disableClose: true,
      // data: { ...this.purchaseOrderDetails }
    });
  }

  onReceivePurchaseOrder(PurchaseOrderID: any, PurchaseOrderStatusID: number, PODate: any) {
    let _dialogRef = this._dialog.open(ReceiveOrderComponent, {
      disableClose: true,
      data: {
        PurchaseOrderID: PurchaseOrderID,
        poStatusID: PurchaseOrderStatusID,
        PurchaseOrderDate: PODate
      }
    });
    _dialogRef.componentInstance.onReceived.subscribe((isReceived: any) => {
      if (isReceived) {
        this.getPurchaseOrdersList();
      }
    });
  }

  onEmailOrder(PO: any) {
    let _dialogRef = this._dialog.open(EmailOrderComponent, {
      disableClose: true,
      data: {
        email: (PO.SupplierEmail && PO.SupplierEmail != "") ? PO.SupplierEmail : '',
        purchaseOrderID: PO.PurchaseOrderID,
        purchaseOrderStatusID: PO.PurchaseOrderStatusID

      }
    });
  }

  MarkAsReceived(purchaseOrderID: number) {
    let _dialogRef = this._dialog.open(AlertConfirmationComponent, {
      disableClose: true
    });

    _dialogRef.componentInstance.Title = this.messages.Dialog_Title.markAs_received;
    _dialogRef.componentInstance.Heading = this.messages.Confirmation.Receive_Purchase_Order,
    _dialogRef.componentInstance.Message = this.messages.Confirmation.Receive_Msg_Description,
    _dialogRef.componentInstance.showConfirmCancelButton = true

    _dialogRef.componentInstance.confirmChange.subscribe((isConfirmed) => {
      if (isConfirmed) {
        this._httpService.get(PurchaseOrderApi.MarkAsReceive + purchaseOrderID)
          .subscribe((res: any) => {
            if (res && res.MessageCode) {
              if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Mark_Received);
                this.getPurchaseOrdersList();
              }
              else if (res && res.MessageCode < 0) {
                this._messageService.showErrorMessage(res.MessageText);
              }
              else {
                this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Purchase Order"));
              }
            }
          },
            err => {
              this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Purchase Order"));
            });
      }
    })
  }


  deletePurchaseOrder(purchaseOrderID: number) {

    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, {
      disableClose: true, data: {
        Title: this.messages.Delete_Messages.Confirm_delete, header: this.messages.Delete_Messages.Del_Msg_AreYouSure,
        description: this.messages.Delete_Messages.Del_Msg_Undone, ButtonText: this.messages.General.Delete
      }
    });
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.delete(PurchaseOrderApi.deletePurchaseOrder + purchaseOrderID)
          .subscribe((res: any) => {
            if (res && res.MessageCode) {
              if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Purchase order"));
                this.getPurchaseOrdersList();
              }
              else if (res && res.MessageCode < 0) {
                this._messageService.showErrorMessage(res.MessageText);
              }
              else {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "purchase order"));
              }
            }
          },
            err => {
              this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "purchase order"));
            });
      }
    })


  }

  /*****Cancel Purchase Order  ******/
  cancelPurchaseOrder(purchaseOrderID: number) {
    /****For cancel purchase order same Delete component is being used with customized Icon & Text****/
    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, {
      disableClose: true, data: {
        title: this.messages.Confirmation.Cancel_Purchase_Order,
        header: this.messages.Confirmation.Cancel_Msg_AreYouSure,
        description: this.messages.Delete_Messages.Del_Msg_Undone,
        ButtonText: this.messages.Confirmation.Confirm_Text,
        isCancelIcon: true
      }
    });
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.get(PurchaseOrderApi.cancelPurchaseOrder + purchaseOrderID)
          .subscribe((res: any) => {
            if (res && res.MessageCode) {
              if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Cancel_Success.replace("{0}", "Purchase Order"));
                this.getPurchaseOrdersList();
              }
              else if (res && res.MessageCode < 0) {
                this._messageService.showErrorMessage(res.MessageText);
              }
              else {
                this._messageService.showErrorMessage(this.messages.Error.Cancel_Error.replace("{0}", "Purchase Order"));
              }
            }
          },
            err => {
              this._messageService.showErrorMessage(this.messages.Error.Cancel_Error.replace("{0}", "Purchase Order"));
            });
      }
    })


  }

  /**allow numeric keys and prevents others*/
  preventCharactersForNumber(event: any) {
    let index = this.AllowedNumberKeysOnly.findIndex(k => k == event.key);
    if (index < 0) {
      event.preventDefault()
    }
  }

  reciviedDate($event) {
    this.purchaseOrderSearchParameter.FromDate = $event.DateFrom;
    this.purchaseOrderSearchParameter.ToDate = $event.DateTo;
  }

  /* Method to receive the pagination from the Paginator */
  reciviedPagination(pagination: boolean) {
    if (pagination) {
      this.getPurchaseOrdersList();
    }
  }

  // for download PO/GRN report in PDF
  downloadPurchaseOrderPDF(PO: any) {
    let isGRN: number = 0;
    if(PO.PurchaseOrderStatusID === this.enumPOStatus.Received || PO.PurchaseOrderStatusID === this.enumPOStatus.PartiallyReceived) {
      isGRN = 1;
    }
    var pdfFileName: string = PO.PurchaseOrderNumber;
    let apiURL = PurchaseOrderApi.getPurchaseOrderReport.replace('{0}', PO.PurchaseOrderID).replace('{1}', this.branchID.toString()) + isGRN;
    this._httpService.get(apiURL) //+ "/" + this.fileType.PDF
      .toPromise().then(data => {
        if (data && data.MessageCode > 0) {
          this._commonService.createPDF(data, pdfFileName);
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error.replace('{0}', "PDF"));
        }
      });
  }

  searchPurchaseOrders(){
    this.appPagination.pageNumber = 1;
    this.appPagination.paginator.pageIndex = 0;
    this.getPurchaseOrdersList();
  }

  getPurchaseOrdersList() {
    let poSearchParams = JSON.parse(JSON.stringify(this.purchaseOrderSearchParameter));
    poSearchParams.PageNumber = this.appPagination.pageNumber;
    poSearchParams.PageSize = this.appPagination.pageSize;
    this.isMultiBranchID();

    this._httpService.get(PurchaseOrderApi.getPurchaseOrdersList, poSearchParams).subscribe((data) => {

      this.isDataExists = (data.Result != null && data.Result.length > 0) ? true : false;
      if (this.isDataExists) {
        this.purchaseOrdersList = data.Result;

        if (data.Result.length > 0) {
          this.appPagination.totalRecords = data.TotalRecord;
        } else {
          this.appPagination.totalRecords = 0;
        }
      } else {
        this.purchaseOrdersList = [];
        this.appPagination.totalRecords = 0;
      }
    },
      (error) => {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "purchase orders"));
      }
    );
  }



}
