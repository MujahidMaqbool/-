
/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from "@angular/core";
/********************* Material:Refference ********************/

/********************** Services & Models *********************/
/* Services */
import { HttpService } from "@services/app.http.service";
import { MessageService } from "@services/app.message.service";
import { MatPaginator } from "@angular/material/paginator";

/* Models */
import { ApiResponse } from "@app/models/common.model";

/********************** Component *********************/
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { AppPaginationComponent } from "@app/shared-pagination-module/app-pagination/app.pagination.component";

/**********************  Configurations *********************/
import { Messages } from '@helper/config/app.messages';
import { SupplierApi, BrandApi } from "@app/helper/config/app.webapi";
import { Configurations } from "@app/helper/config/app.config";
import { AuthService } from "@app/helper/app.auth.service";
import { ENU_Permission_Module, ENU_Permission_Product, ENU_Permission_Setup } from "@app/helper/config/app.module.page.enums";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { ViewBrandComponent } from "../view/view.brand.component";
import { SaveBrandComponent } from "../save/save.brand.component";
import { BrandSearchParameter, BrandViewModel } from "../brand.models";
import { DataSharingService } from "@app/services/data.sharing.service";
import { EnumSaleSourceType } from "@app/helper/config/app.enums";


@Component({
  selector: "app-brands-search",
  templateUrl: "./search.brands.component.html",
})
export class SearchBrandsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;

  // models and objects
  brandSearchParameter: BrandSearchParameter = new BrandSearchParameter();
  brandViewDetail: BrandViewModel = new BrandViewModel();

  // locals
  messages = Messages;
  isDataExists: boolean = false;
  brandList = [];
  statusList = [];
  typeList = [];
  branchList = [];
  sharedBrandID:number = 0;
  productCategoryList = [];
  allowedPages = {
    Save_Brand: false,
    Delete_Brand: false,
    View_Brand: false

  }
  isMultiBranch:boolean = false;

  // pagination and sorting
  sortOrder_ASC = Configurations.SortOrder_ASC;
  sortOrder_DESC = Configurations.SortOrder_DESC;
  sortOrder: string;

  constructor(
    private _httpService: HttpService,
    private _dialog: MatDialogService,
    private _messageService: MessageService,
    private _authService: AuthService,
    private _dataSharingService: DataSharingService,

    )
    {}

  ngOnInit() {
    this.isMultiBranchID();
    this.getBrandID();
    this.getFundamentals();
    this.setPermission();

    if (this.sharedBrandID && this.sharedBrandID > 0) {
      this.onSaveBrand(this.sharedBrandID);
    }
  }

  /* Method to set enum */
  setPermission() {
    this.allowedPages.Save_Brand = this._authService.hasPagePermission(ENU_Permission_Module.Product, ENU_Permission_Product.Brand_Save);
    this.allowedPages.Delete_Brand = this._authService.hasPagePermission(ENU_Permission_Module.Product, ENU_Permission_Product.Brand_Delete);
    this.allowedPages.View_Brand = this._authService.hasPagePermission(ENU_Permission_Module.Product, ENU_Permission_Product.Brand_View);
  }

  ngAfterViewInit() {
    this.getBrandList();

  }

  ngOnDestroy() {
    this.resetBrandID(0);
  }
//check here if we have interprise level permission or not
async isMultiBranchID() {
  await this._dataSharingService.sharedIsMultiBranchCompany.subscribe((isMultiBranch: boolean) => {
  this.isMultiBranch = isMultiBranch;
  if(!isMultiBranch){
    this.brandSearchParameter.BrandTypeID = EnumSaleSourceType.OnSite;
  }
});
}
  //#Start method region
 resetBrandID(brandID) {
    this._dataSharingService.shareBrandID(brandID);
  }
 /*******Get shared AttributeID *******/
 async getBrandID() {
  await this._dataSharingService.sharedAttributeID.subscribe((brandID: number) => {
  this.sharedBrandID = brandID;
});
}
   /* Method to reset search filters */
  resetSearchFilter() {
    this.brandSearchParameter = new BrandSearchParameter();
    this.appPagination.resetPagination();
    this.isMultiBranchID();
    this.getBrandList();
  }


  /* Get Search Fundamentals */
  getFundamentals() {
    this._httpService.get(BrandApi.getBrandSearchFundamentals).subscribe(
      (response: ApiResponse) => {
        if (response.MessageCode && response.MessageCode > 0) {
          this.branchList = response.Result.BranchList;
          this.statusList = response.Result.StatusList;
          this.typeList = response.Result.TypeList;
          this.productCategoryList = response.Result.ProductCategoryList;

        } else {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Brand")
          );
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Brand")
        );
      }
    );
  }

  searchBrandList(){
    this.appPagination.pageNumber = 1;
    this.appPagination.paginator.pageIndex = 0;
    this.getBrandList();
  }

  /* Get Brand list */
  getBrandList() {
    let brandSearch = JSON.parse(
      JSON.stringify(this.brandSearchParameter)
    );
    brandSearch.PageNumber = this.appPagination.pageNumber;
    brandSearch.PageSize = this.appPagination.pageSize;
    this._httpService.get(BrandApi.getBrands, brandSearch).subscribe(
      (data) => {
        this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
        if (this.isDataExists) {
          this.brandList = data.Result;

          if (data.Result.length > 0) {
            this.appPagination.totalRecords = data.TotalRecord;
          } else {
            this.appPagination.totalRecords = 0;
          }
        } else {
          this.brandList = [];

          this.appPagination.totalRecords = 0;
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Brand")
        );
      }
    );
  }

   // Add Brand
   onSaveBrand(brandID: number) {
    const _dialog = this._dialog.open(SaveBrandComponent, {
      disableClose: true,
      data: brandID
    });
    _dialog.componentInstance.isSaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this.getBrandList();
      }
    });
  }

  /* Method to receive the pagination from the Paginator */
  reciviedPagination(pagination: boolean) {
    if (pagination) {
      this.getBrandList();
    }
  }

  /* change sorting */
  changeSorting(sortIndex: number) {
    this.brandSearchParameter.SortIndex = sortIndex;
    if (sortIndex == 1) {
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.brandSearchParameter.SortOrder = this.sortOrder;
        this.getBrandList();
      } else {
        this.sortOrder = this.sortOrder_ASC;
        this.brandSearchParameter.SortOrder = this.sortOrder;
        this.getBrandList();
      }
    }

    if (sortIndex == 2) {
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.brandSearchParameter.SortOrder = this.sortOrder;
        this.getBrandList();
      } else {
        this.sortOrder = this.sortOrder_ASC;
        this.brandSearchParameter.SortOrder = this.sortOrder;
        this.getBrandList();
      }
    }
  }

/* View Brand */
viewBrandDetail(brandID: number) {
  this._httpService.get(BrandApi.getBrandByID + brandID).subscribe(data => {
    if (data && data.Result != null) {
      this.brandViewDetail = data.Result;
      this.brandViewDetail.isMultiBranch = this.isMultiBranch;
      this._dialog.open(ViewBrandComponent, {
        disableClose: true,
        data: { ...this.brandViewDetail }
      });
    }
    else {
      this._messageService.showErrorMessage(
        this.messages.Error.Get_Error.replace('{0}', 'Brand')
      );
    }
  });
  (error) => {
    this._messageService.showErrorMessage(
      this.messages.Error.Get_Error.replace('{0}', 'Brand')
    );
  }
}

/* Delete Brand */
onDeleteBrand(brandID: number) {
  const dialogRef = this._dialog.open(DeleteConfirmationComponent, {
    disableClose: true,
    data: {
      Title: this.messages.Delete_Messages.Confirm_delete,
      header: this.messages.Delete_Messages.Del_Msg_Heading.replace("{0}", "brand"),
      description: this.messages.Delete_Messages.Del_Msg_Undone,
      ButtonText: this.messages.General.Delete,
      isALertIcon: true
    },
  });
  dialogRef.componentInstance.confirmDelete.subscribe(
    (confirmDelete: any) => {
      if (confirmDelete) {
        this._httpService
          .delete(BrandApi.deleteBrand + brandID)
          .subscribe(
            (response: ApiResponse) => {
              if (response && response.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Brand"));
                this.resetSearchFilter();
              } else {
                this._messageService.showErrorMessage(response.MessageText);
              }
            },
            (error) => {
              this._messageService.showErrorMessage(
                this.messages.Error.Get_Error.replace("{0}", "Brand")
              );
            }
          );
      }
    }
  );
}

  //#endregion
}
