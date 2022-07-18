// #region Imports

/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from "@angular/core";

/********************* Material:Refference ********************/
import { MatPaginator } from "@angular/material/paginator";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";

/********************** Services & Models *********************/
/* Services */
import { HttpService } from "@services/app.http.service";
import { MessageService } from "@services/app.message.service";

/* Models */
import { ApiResponse } from "@app/models/common.model";
import { SupplierSearchParameter, SupplierViewModel } from "../../models/supplier.models";
import { DataSharingService } from "@app/services/data.sharing.service";

/********************** Component *********************/
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { AppPaginationComponent } from "@app/shared-pagination-module/app-pagination/app.pagination.component";
import { ViewSupplierComponent } from "../view/view.supplier.component";

/**********************  Configurations *********************/
import { Messages } from '@helper/config/app.messages';
import { SupplierApi } from "@app/helper/config/app.webapi";
import { Configurations } from "@app/helper/config/app.config";
import { EnumSaleSourceType } from "@app/helper/config/app.enums";
import { AuthService } from "@app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Product } from "@app/helper/config/app.module.page.enums";

// #region Imports End


@Component({
  selector: "app-suppliers-search",
  templateUrl: "./search.suppliers.component.html",
})
export class SearchSuppliersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;

  // models and objects
  supplierSearchParameter: SupplierSearchParameter = new SupplierSearchParameter();
  supplierViewDetail: SupplierViewModel = new SupplierViewModel();
  supplierList: [];
  branchList = [];

  // locals
  messages = Messages;
  isDataExists: boolean = false;
  isDeleteAllow : boolean ;
  isSaveAllow : boolean ;
  isViewAllow:boolean;
  appSourceTypeID : EnumSaleSourceType;
  isMultiBranch:boolean = false;

  // pagination and sorting
  sortOrder_ASC = Configurations.SortOrder_ASC;
  sortOrder_DESC = Configurations.SortOrder_DESC;
  sortOrder: string;

  constructor(
    private _httpService: HttpService,
    private _dialog: MatDialogService,
    private _messageService: MessageService,
    public _authService: AuthService,
    private _dataSharingService: DataSharingService,

    ){
      this.isMultiBranchID();
    }

    ngOnInit() {}

    ngAfterViewInit() {
      this.getSupplierList();
      this.setPermissions();
    }

    //#Start method region

  /* Method to set permission */
  setPermissions() {
    this.isDeleteAllow = this._authService.hasPagePermission(ENU_Permission_Module.Product, ENU_Permission_Product.Supplier_Delete);
    this.isSaveAllow = this._authService.hasPagePermission(ENU_Permission_Module.Product, ENU_Permission_Product.Supplier_Save);
    this.isViewAllow = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.Supplier_View);

  }

  //check here if we have interprise level permission or not
  async isMultiBranchID() {
    await this._dataSharingService.sharedIsMultiBranchCompany.subscribe((isMultiBranch: boolean) => {
    this.isMultiBranch = isMultiBranch;
    if(!isMultiBranch){
      this.supplierSearchParameter.TypeID = EnumSaleSourceType.OnSite;
    }
  });
  }
    /* Method to reset search filters */
    resetSearchFilter() {
      this.supplierSearchParameter = new SupplierSearchParameter();
      this.appPagination.resetPagination();
      this.isMultiBranchID();
      this.getSupplierList();
    }

    searchSupplierList(){
      this.appPagination.pageNumber = 1;
      this.appPagination.paginator.pageIndex = 0;
      this.getSupplierList();

    }
  /* Get Supplier list */
  getSupplierList() {
    let supplierSearch = JSON.parse(
      JSON.stringify(this.supplierSearchParameter)
    );
    supplierSearch.PageNumber = this.appPagination.pageNumber;
    supplierSearch.PageSize = this.appPagination.pageSize;
    this._httpService.get(SupplierApi.getSuppliers, supplierSearch).subscribe(
      (data) => {
        this.isDataExists =
          data.Result != null && data.Result.length > 0 ? true : false;
        if (this.isDataExists) {
          this.supplierList = data.Result;
          if (data.Result.length > 0) {
            this.appPagination.totalRecords = data.TotalRecord;
          } else {
            this.appPagination.totalRecords = 0;
          }
        } else {
          this.supplierList = [];

            this.appPagination.totalRecords = 0;
          }
        },
        (error) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Supplier")
          );
        }
      );
    }

    /* Method to receive the pagination from the Paginator */
    reciviedPagination(pagination: boolean) {
      if (pagination) {
        this.getSupplierList();
      }
    }

  /* change sorting */
    changeSorting(sortIndex: number) {
      this.supplierSearchParameter.SortIndex = sortIndex;
      if (sortIndex == 1) {
        if (this.sortOrder == this.sortOrder_ASC) {
          this.sortOrder = this.sortOrder_DESC;
          this.supplierSearchParameter.SortOrder = this.sortOrder;
          this.getSupplierList();
        } else {
          this.sortOrder = this.sortOrder_ASC;
          this.supplierSearchParameter.SortOrder = this.sortOrder;
          this.getSupplierList();
        }
      }

      if (sortIndex == 2) {
        if (this.sortOrder == this.sortOrder_ASC) {
          this.sortOrder = this.sortOrder_DESC;
          this.supplierSearchParameter.SortOrder = this.sortOrder;
          this.getSupplierList();
        } else {
          this.sortOrder = this.sortOrder_ASC;
          this.supplierSearchParameter.SortOrder = this.sortOrder;
          this.getSupplierList();
        }
      }
    }

    /* View Supplier */
    viewSupplierDetail(supplier: any) {
      this._httpService.get(SupplierApi.getSupplierByID + supplier.SupplierID).subscribe(data => {
        if (data && data.Result != null) {
          this.supplierViewDetail = data.Result;
          this.supplierViewDetail.IsMultiBranch = this.isMultiBranch;
          
          this.supplierViewDetail.AppSourceTypeID = supplier.AppSourceTypeID;
          this.supplierViewDetail.IsActive = supplier.IsActive;


          this._dialog.open(ViewSupplierComponent, {
            disableClose: true,
            data: { ...this.supplierViewDetail }
          });
        }
        else {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace('{0}', 'Supplier')
          );
        }
      });
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace('{0}', 'Supplier')
        );
      }
    }

    /* delete Supplier */
    onDeleteSupplier(supplierID: number) {
      const dialogRef = this._dialog.open(DeleteConfirmationComponent, {
        disableClose: true,
        data: {
          Title: this.messages.Dialog_Title.Alert,
          header: this.messages.Delete_Messages.Del_Msg_Heading.replace("{0}", "supplier") ,
          description: this.messages.Delete_Messages.Del_Msg_Undone,
          ButtonText:"Delete",
        },
      });
      dialogRef.componentInstance.confirmDelete.subscribe(
        (confirmDelete: any) => {
          if (confirmDelete) {
            this._httpService
              .delete(SupplierApi.deleteSupplier + supplierID)
              .subscribe(
                (response: ApiResponse) => {
                  if (response && response.MessageCode > 0) {
                  this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Supplier"));
                  this.resetSearchFilter();
                  } else {
                    this._messageService.showErrorMessage(response.MessageText);
                  }
                },
                (error) => {
                  this._messageService.showErrorMessage(
                    this.messages.Error.Get_Error.replace("{0}", "Supplier")
                  );
                }
              );
          }
        }
      );
    }

  //#endregion
}
