
/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from "@angular/core";
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { SearchCategory } from "@app/product/models/categories.model";
import { SaveCategoryComponent } from "../save/save.category.component";
import { ENU_Permission_Module, ENU_Permission_Product } from "@app/helper/config/app.module.page.enums";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { HttpService } from "@app/services/app.http.service";
import { MessageService } from "@app/services/app.message.service";
import { AuthService } from "@app/helper/app.auth.service";
import { Configurations } from "@app/helper/config/app.config";
import { AppPaginationComponent } from "@app/shared-pagination-module/app-pagination/app.pagination.component";
import { Messages } from "@app/helper/config/app.messages";
import { InventoryProductCategoryApi } from "@app/helper/config/app.webapi";
import { ViewCategoryComponent } from "../view/view.category.component";
import { DataSharingService } from "@app/services/data.sharing.service";
import { EnumSaleSourceType } from "@app/helper/config/app.enums";



@Component({
  selector: 'app-categories-search',
  templateUrl: './search.categories.component.html'
})
export class SearchCategoriesComponent implements OnInit {
  /* Pagination  */
  @ViewChild("appPagination") appPagination: AppPaginationComponent;
  pageIndex = 0;
  sortIndex: number = 1;
  sortOrder_ASC: string = Configurations.SortOrder_ASC;
  sortOrder_DESC: string = Configurations.SortOrder_DESC;
  sortOrder: string = this.sortOrder_ASC;
  postionSortOrder: string;
  isPositionOrderASC: boolean = undefined;
  isCategoryNameOrderASC: boolean = true;
  isSearchByPageIndex: boolean = false;
  sharedCategoryID:number = 0;
  isMultiBranch:boolean = false;

  isDataExists: boolean;
  // #region Local members
  allowedPages = {
    Save_Category: false,
    Delete_Category:false,
    View_Category:false
  }
  /*** Model & Collection */
  messages = Messages;
  categoriesList: any = [];
  categoryStatusList: any = [];
  categoryTypeList: any = [];
  searchCategory: SearchCategory = new SearchCategory();
  enumAppSourceType = EnumSaleSourceType;
  // #endregion

  constructor(
    private _dialog: MatDialogService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    public _authService: AuthService,
    private _dataSharingService: DataSharingService,

  ) {
    this.isMultiBranchID();
    this.getCategoryID();
  }

  ngOnInit() {
    this.setPermission();
    this.getSearchFundamental();
    if (this.sharedCategoryID && this.sharedCategoryID > 0) {
      this.onAddCategory(this.sharedCategoryID);
    }
  }
  ngAfterViewInit() {
    this.appPagination.resetPagination();
    this.getCategories();
  }

  ngOnDestroy() {
    this.resetCategoryID(0);
  }

  //#Start method region
  resetCategoryID(categoryID) {
    this._dataSharingService.shareCategoryID(categoryID);
  }

//check here if we have interprise level permission or not
async isMultiBranchID() {
  await this._dataSharingService.sharedIsMultiBranchCompany.subscribe((isMultiBranch: boolean) => {
  this.isMultiBranch = isMultiBranch;
  if(!isMultiBranch){
    this.searchCategory.CategoryTypeID = EnumSaleSourceType.OnSite;
  }
});
}
  setPermission() {
    this.allowedPages.Save_Category = this._authService.hasPagePermission(ENU_Permission_Module.Product, ENU_Permission_Product.Category_Save);
    this.allowedPages.View_Category = this._authService.hasPagePermission(ENU_Permission_Module.Product,ENU_Permission_Product.Category_View);
    this.allowedPages.Delete_Category = this._authService.hasPagePermission(ENU_Permission_Module.Product, ENU_Permission_Product.Category_Delete);
  }
    /*******Get shared AttributeID *******/
    async getCategoryID() {
      await this._dataSharingService.sharedCategoryID.subscribe((CategoryID: number) => {
      this.sharedCategoryID = CategoryID;
    });
    }
  // grid sorting
  changeSorting(sortIndex: number) {
    this.sortIndex = sortIndex;
    if (sortIndex == 1) {
      this.isPositionOrderASC = undefined;
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.isCategoryNameOrderASC = false;
        this.getCategories();
      }
      else {
        this.sortOrder = this.sortOrder_ASC;
        this.getCategories();
        this.isCategoryNameOrderASC = true;
      }
    }

    if (sortIndex == 2) {
      this.isCategoryNameOrderASC = undefined;
      if (this.postionSortOrder == this.sortOrder_ASC) {
        this.isPositionOrderASC = true;
        this.sortOrder = this.sortOrder_ASC;
        this.getCategories(); this.postionSortOrder = this.sortOrder_DESC
      }
      else {
        this.sortOrder = this.sortOrder_DESC;
        this.getCategories();
        this.isPositionOrderASC = false;
        this.postionSortOrder = this.sortOrder_ASC;
      }
    }
  }

  // get fundamental for search
  getSearchFundamental() {
    this._httpService.get(InventoryProductCategoryApi.getSearchFundamental).subscribe((respose) => {
      this.categoryStatusList = respose.Result.StatusList;
      this.categoryTypeList = respose.Result.TypeList;
    });
  }



  // get categories list
  getCategories() {
    this.searchCategory.SortIndex = this.sortIndex;
    this.searchCategory.SortOrder = this.sortOrder;
    this.searchCategory.PageSize = this.appPagination.pageSize;
    this.searchCategory.PageNumber = this.appPagination.pageNumber;
    this._httpService.get(InventoryProductCategoryApi.GetAll, this.searchCategory).subscribe((respose) => {
      this.isDataExists = respose.Result != null && respose.Result.length > 0 ? true : false;
      if (this.isDataExists) {
        this.categoriesList = respose.Result
        this.appPagination.totalRecords = respose.TotalRecord;
      }
      else {
        this.categoriesList = [];
        this.appPagination.totalRecords = 0;
      }
    });
  }

  // recieved pagination index
  reciviedPagination(pagination: boolean) {
    if (pagination)
      this.getCategories();
  }

  // on reset pagination
  onSearchFilters() {
    this.appPagination.pageNumber = 1;
    this.appPagination.paginator.pageIndex = 0;
    this.getCategories();
  }

  // add new categories and edit
  onAddCategory(productCategoryID: any) {
    const _dialog = this._dialog.open(SaveCategoryComponent, {
      disableClose: true,
      data: productCategoryID
    });
    _dialog.componentInstance.isSaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this.getCategories();
      }
    });
  }

  //call view categoreis api and pass response to popup
  onViewCategory(ProductCategoryID: any) {
    this.viewCategoryID(ProductCategoryID).then((response: any) => {
      response.isMultiBranch = this.isMultiBranch;
      this._dialog.open(ViewCategoryComponent, {
        disableClose: true,
        data:
          response
      });
    })
  }

  // asynchronous api for view categories
  viewCategoryID(ProductCategoryID: number) {
    return new Promise<boolean>((resolve, reject) => {
      let param = InventoryProductCategoryApi.getByID + ProductCategoryID
      this._httpService.get(param).subscribe((respose) => {
        if (respose.MessageCode > 0) {
          resolve(respose.Result);
        } else {
          this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Category"));
          reject();
        }
      });
    })

  }

  // delete categories
  onDelete(productCategoryID: number) {
    this.deleteCategory(productCategoryID);
  }

  // reset grid filters
  onReset() {
    this.searchCategory = new SearchCategory();
    this.appPagination.pageNumber = 1;
    this.appPagination.paginator.pageIndex = 0;
    this.appPagination.pageSize = 10;
    this.isMultiBranchID();
    this.getCategories();
  }

  // delete categories
  deleteCategory(productCategoryID: number) {
    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, {
      disableClose: true, data: {
        // Title: 'Delete',
        header: this.messages.Delete_Messages.Del_Msg_Heading.replace("{0}", "category"),
        description: this.messages.Delete_Messages.Del_Msg_Undone, ButtonText: this.messages.General.Delete
      }
    });
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.delete(InventoryProductCategoryApi.delete + productCategoryID)
          .subscribe((res: any) => {
            if (res && res.MessageCode) {
              if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Category"));
                this.getCategories();
              }
              else if (res && res.MessageCode < 0) {
                this._messageService.showErrorMessage(res.MessageText);
              }
              else {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Category"));
              }
            }
          },
            err => {
              this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Category"));
            });
      }
    })
  }

  //#region Events
  //#endregion
}
