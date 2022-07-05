/********************** Angular References *********************************/
import { NgForm } from '@angular/forms';
import { Component, OnInit, Inject, ViewChild, Output, EventEmitter } from '@angular/core';

/********************* Material:Refference ********************/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatOption } from '@angular/material/core';
/********************** Service & Models *********************/
/* Services */
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
/* Models */
import { ApiResponse } from '@app/models/common.model';
import { MembershipItemsBenefits, AddMembershipItemsBenefits, BranchWiseService, ServicePackageList, BranchSpecificItemType, BranchSpecificItemCategoryTypeList, BranchWiseServiceCategory, SearchProductVariantModel, BranchWiseProductCategory, ProductVariantList } from '@app/setup/models/membership.model';

/********************** Common *********************/
import { Messages } from '@app/helper/config/app.messages';
import { MembershipApi } from '@app/helper/config/app.webapi';
import { NumberValidator } from '@app/shared/helper/number.validator';
import { ENU_MemberShipBenefitDurations, ENU_MemberShipItemTypeName, ProductClassification } from '@app/helper/config/app.enums';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';

// import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'add-product',
  templateUrl: './add.product.component.html'
})
export class AddProductComponent implements OnInit {

  // #region Definitions
  @ViewChild("appPagination") appPagination: AppPaginationComponent;
  @ViewChild('membershipItemBenefitForm') membershipItemBenefitForm: NgForm;

  /* Messages */
  messages = Messages;
  showTotalSessionsValidation: boolean = false;
  showDiscountPercentageValidation: boolean = false;


  /* Configurations */
  enuMemberShipItemTypeName = ENU_MemberShipItemTypeName;
  enuMemberShipBenefitDurations = ENU_MemberShipBenefitDurations;
  enuProductClassification = ProductClassification;

  /* Model References */
  ///
  searchProductVariantModel: SearchProductVariantModel = new SearchProductVariantModel();
  branchWiseProductCategory: BranchWiseProductCategory[] = new Array<BranchWiseProductCategory>();
  /////
  selectedBranchList: any[] = [];
  showItemTypeValidation: boolean = false;
  selectedBranchSpecificItemTypeList: any[] = [];
  saveMembershipItemModel: MembershipItemsBenefits;
  showItemTypeValidationForNotExist: boolean = false;
  oldMembershipItemModelForEdit: MembershipItemsBenefits;
  numberValidator: NumberValidator = new NumberValidator();
  selectedMembershipItemsBenefits: MembershipItemsBenefits[];
  alreadyAddedproductsInList: MembershipItemsBenefits[];
  branchSpecificItemCategoryList: any[] = [];

  /* Local members*/
  itemTypeName: string = "";
  itemTypeHeading: string = "";
  isInvalidData: boolean = false;
  itemTypeValidationMessage: string = "";
  itemTypeValidationMessageForNotExist: string = "";
  itemsSelectionValidationMessage: string = "";
  isSelecteRequiredMsg: string = "";

  isSelecteRequired: boolean = false;
  ////
  totalSessions: number;
  isFree: boolean = true;
  isNoLimit: boolean = true;
  isDataExists: boolean = false;
  discountPercentage: number;
  durationTypeID: number = this.enuMemberShipBenefitDurations.Membership;

  @Output() isClose = new EventEmitter<MembershipItemsBenefits>();
  @Output() savedItemType = new EventEmitter<MembershipItemsBenefits[]>();

  constructor(
    private _httpService: HttpService,
    private _messageService: MessageService,
    public _dialogRef: MatDialogRef<AddProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddMembershipItemsBenefits,

  ) {
    this.saveMembershipItemModel = new MembershipItemsBenefits();
  }

  ngOnInit() {
    this.selectedMembershipItemsBenefits = [];
    this.saveMembershipItemModel = this.data.MembershipItemsBenefit;
    // get salready selecte variant ida for send back end (use for fillter not getting already added variant)

    this.itemTypeName = "Product";
    this.itemTypeHeading = "Products";

    if (this.saveMembershipItemModel.IsEdit) {
      this.setModelDataForEdit();
    }

    this.selectedBranchList = this.data.MembershipBranchList;
    this.alreadyAddedproductsInList = this.data.SelectedMembershipItemsBenefits;
    this.itemTypeValidationMessage = this.messages.Validation.Add_ItemType_In_Membership_For_Added.replace('{0}', this.itemTypeHeading.toLowerCase());
    this.itemTypeValidationMessageForNotExist = this.messages.Validation.Add_ItemType_In_Membership_For_Not_Created.replace('{0}', this.itemTypeHeading.toLowerCase());
    this.isSelecteRequiredMsg = this.messages.Validation.Add_ItemType_Required.replace('{0}', this.itemTypeName.toLowerCase());

  }

  // #region Events

  onBranchSelectionChange(branchID: number, isEdit: boolean = false) {
    this.showItemTypeValidation = false
    this.showItemTypeValidationForNotExist = false;
  }

  onCloseDialog() {
    this._dialogRef.close();
  }

  onDiscountPercentageChangeOnlyNumbers(num: string) {
    this.validateDiscountPercentage();
  }

  onBenefitSessionDurationChangeOnlyNumbers(num: string) {
    this.validateTotalSessions();
    setTimeout(() => {
      this.totalSessions = this.numberValidator.NotAllowDecimalValue(num);
    }, 10);
  }

  noLimit_collapse_valueChanged() {


    setTimeout(() => {
      this.isNoLimit = this.isNoLimit ? false : true;
      this.totalSessions = null;
      this.showTotalSessionsValidation = false;
      this.durationTypeID = this.enuMemberShipBenefitDurations.Membership
      //this.validateTotalSessions();
      //this.showTotalSessionsValidation = false;
    }, 100);
  }

  free_collapse_valueChanged() {
    setTimeout(() => {
      this.isFree = this.isFree ? false : true;
      this.discountPercentage = null;
      //this.validateDiscountPercentage();
      this.showDiscountPercentageValidation = false;
    }, 100);
  }

  // #endregion

  // #region Methods

  getAlreadyAddedVarintIDs(branchID) {
    var i;
    var result: string = "";
    for (i = 0; i < this.alreadyAddedproductsInList.length; ++i) {
      if (this.alreadyAddedproductsInList[i].ItemID !== undefined && this.alreadyAddedproductsInList[i].BranchID == branchID) {
        result = result + this.alreadyAddedproductsInList[i].ItemID + ((this.alreadyAddedproductsInList.length - 1) == i ? "" : ",");
      }
    }
    return result;
  }

  selectOrDeselectAllProducts(isCheck: boolean) {
    this.branchWiseProductCategory.forEach(productCategory => {
      productCategory.VariantProductInfoList.forEach(product => {
        product.IsSelected = isCheck;
        product.VariantInfoList.forEach(variant => {
          variant.IsSelected = isCheck;
        });
      });
    });
    this.storeSelectedVariants();
  }

  onSelectOrDeselectProductCategory(categoryID: number, isCheck: boolean) {
    var result = this.branchWiseProductCategory.find(i => i.ProductCategoryID == categoryID)
    result.VariantProductInfoList.forEach(product => {
      product.IsSelected = isCheck;
      product.VariantInfoList.forEach(variant => {
        variant.IsSelected = isCheck;
      });
    });
    this.storeSelectedVariants();
  }

  onProductChange(productID, IsCheck, catIndex, serviceIndex) {
    this.branchWiseProductCategory[catIndex].VariantProductInfoList[serviceIndex].VariantInfoList.forEach(variant => {
      variant.IsSelected = IsCheck;
    });
    this.storeSelectedVariants();
  }

  onProductVariantChange(packageID, IsCheck, catIndex, productIndex) {
    let result = this.branchWiseProductCategory[catIndex].VariantProductInfoList[productIndex].VariantInfoList.filter(spackage => spackage.IsSelected == true);
    if (!result || result.length < 1 || result == null) {
      this.branchWiseProductCategory[catIndex].VariantProductInfoList[productIndex].IsSelected = false;
    } else {
      this.branchWiseProductCategory[catIndex].VariantProductInfoList[productIndex].IsSelected = true;
    }

    this.storeSelectedVariants();
  }

  onSearchProduct() {
    this.resetModelData();
    this.appPagination.resetPagination();
    if (this.searchProductVariantModel.BranchID > 0) {
      this.selectedMembershipItemsBenefits = [];
      this.searchProductVariantModel.ProductVariantIDs = this.getAlreadyAddedVarintIDs(this.searchProductVariantModel.BranchID);
      this.appPagination.paginator.pageIndex = 0;
      this.appPagination.pageNumber = 1;
      this.getProducts();
    }
  }

  reciviedPagination(pagination: boolean) {

    //this.storeSelectedVariants();

    if (pagination)
      this.getProducts();
  }

  storeSelectedVariants() {

    this.branchWiseProductCategory.forEach(productCategory => {
      productCategory.VariantProductInfoList.forEach(product => {
        if (product.IsSelected) {
          if(product.ProductClassificationID == this.enuProductClassification.Variant){
            product.VariantInfoList.forEach(variant => {
              if (variant.IsSelected) {
                var mib = new MembershipItemsBenefits();
                mib.BranchID = productCategory.BranchID;
                mib.BranchName = this.selectedBranchList.find(sbl => sbl.BranchID == productCategory.BranchID).BranchName;
                mib.ItemCategoryID = productCategory.ProductCategoryID;
                mib.ItemCategoryName = productCategory.ProductCategoryName;
                mib.ItemID = variant.ProductVariantID;
                mib.ItemName = product.ProductName;
                mib.ProductID = product.ProductID;
                mib.ProductVariantName = variant.ProductVariantName;
                mib.ItemTypeID = this.saveMembershipItemModel.ItemTypeID;
                mib.MembershipID = this.saveMembershipItemModel.MembershipID;
                mib.MembershipItemID = this.saveMembershipItemModel.MembershipItemID;
                this.selectedMembershipItemsBenefits.push(mib);
              } else {
                this.selectedMembershipItemsBenefits = this.selectedMembershipItemsBenefits.filter(i => i.ItemID != variant.ProductVariantID);
              }
            });
          } else{
            var mib = new MembershipItemsBenefits();
            mib.BranchID = productCategory.BranchID;
            mib.BranchName = this.selectedBranchList.find(sbl => sbl.BranchID == productCategory.BranchID).BranchName;
            mib.ItemCategoryID = productCategory.ProductCategoryID;
            mib.ItemCategoryName = productCategory.ProductCategoryName;
            mib.ItemID = product.VariantInfoList[0].ProductVariantID;
            mib.ItemName = product.ProductName;
            mib.ProductID = product.ProductID;
            mib.ProductVariantName = "";
            mib.ItemTypeID = this.saveMembershipItemModel.ItemTypeID;
            mib.MembershipID = this.saveMembershipItemModel.MembershipID;
            mib.MembershipItemID = this.saveMembershipItemModel.MembershipItemID;
            this.selectedMembershipItemsBenefits.push(mib);
          }

        } else {
          if(product.VariantInfoList && product.VariantInfoList.length > 0 ){
            product.VariantInfoList.forEach(variant => {
              this.selectedMembershipItemsBenefits = this.selectedMembershipItemsBenefits.filter(i => i.ItemID != variant.ProductVariantID);
            });
          } else{
            this.selectedMembershipItemsBenefits = this.selectedMembershipItemsBenefits.filter(i => i.ItemID != product.ProductID);
          }
        }
      });
    });

    // distinct list
    this.selectedMembershipItemsBenefits = Array.from(new Set(this.selectedMembershipItemsBenefits
                                            .map(s => s.ItemID)))
                                            .map(ItemID => {
                                              return {
                                                MembershipItemID: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.MembershipItemID,
                                                MembershipID: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.MembershipID,
                                                ItemCategoryID: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID).ItemCategoryID,
                                                ItemCategoryName: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.ItemCategoryName,
                                                ProductClassificationID: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.ProductClassificationID,
                                                ItemID: ItemID,
                                                ItemName: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.ItemName,
                                                ProductVariantName: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.ProductVariantName,
                                                ItemTypeID: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.ItemTypeID,
                                                BranchID: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.BranchID,
                                                BranchName: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.BranchName,
                                                ServiceID: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.ServiceID,
                                                ProductID: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.ProductID,
                                                NoLimits: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.NoLimits,
                                                TotalSessions: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.TotalSessions,
                                                DurationTypeID: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.DurationTypeID,
                                                DurationValue: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.DurationValue,
                                                DurationTypeName: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.DurationTypeName,
                                                IsFree: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.IsFree,
                                                DiscountPercentage: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.DiscountPercentage,
                                                IsEdit: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.IsEdit,
                                                IsSelected: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.IsSelected,
                                                IsActive: this.selectedMembershipItemsBenefits.find(s => s.ItemID == ItemID)?.IsActive,
                                              }
                                            });
  }

  getProducts() {
    this.searchProductVariantModel.PageNumber = this.appPagination.pageNumber;
    this.searchProductVariantModel.PageSize = this.appPagination.pageSize;
    this._httpService.get(MembershipApi.getMembershipProductVariant, this.searchProductVariantModel)
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            if (response.Result && response.Result.length > 0) {
              this.branchWiseProductCategory = response.Result;
              if (response.Result.length > 0) {

                // already added products
                this.branchWiseProductCategory.forEach(productCategory => {
                  productCategory.VariantProductInfoList.forEach(product => {
                    product.VariantInfoList.forEach(variant => {
                      var result = this.selectedMembershipItemsBenefits.find(i => i.ItemID == variant.ProductVariantID);
                      if(result){
                        variant.IsSelected = true;
                        product.IsSelected = true;
                      }
                    });
                  });
                });

                this.appPagination.totalRecords = response.TotalRecord;
              }
              else {
                this.branchWiseProductCategory = [];
                this.appPagination.totalRecords = 0;
              }
            }
            else {
              this.branchWiseProductCategory = [];
              this.appPagination.totalRecords = 0;
            }
          }
          else {
            //this.showItemTypeValidation = true;
            this._messageService.showErrorMessage(response.MessageText);
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Add " + this.itemTypeName));
        }
      );
  }

  //////////////

  setModelDataForEdit() {
    this.searchProductVariantModel.BranchID = this.saveMembershipItemModel.BranchID;
    this.oldMembershipItemModelForEdit = this.data.MembershipItemsBenefit;
    this.isFree = this.saveMembershipItemModel.IsFree;
    this.durationTypeID = this.saveMembershipItemModel.DurationTypeID;
    this.discountPercentage = this.saveMembershipItemModel.IsFree ? null : this.saveMembershipItemModel.DiscountPercentage;
    this.isNoLimit = this.saveMembershipItemModel.NoLimits;
    this.totalSessions = this.saveMembershipItemModel.NoLimits ? null : this.saveMembershipItemModel.TotalSessions;


    this.branchWiseProductCategory = [];

    let variantInfoList = new Array<ProductVariantList>();
    let productVariant = new ProductVariantList();
    productVariant.ProductVariantID = this.saveMembershipItemModel.ItemID;
    productVariant.ProductVariantName = this.saveMembershipItemModel.ProductVariantName;
    productVariant.IsSelected = true;
    variantInfoList.push(productVariant);

    this.branchWiseProductCategory.push(
      {
        BranchID: this.saveMembershipItemModel.BranchID,
        ProductCategoryID: this.saveMembershipItemModel.ItemCategoryID,
        ProductCategoryName: this.saveMembershipItemModel.ItemCategoryName,
        VariantProductInfoList: [
          {
            ProductCategoryID: this.saveMembershipItemModel.ItemCategoryID,
            ProductClassificationID: this.saveMembershipItemModel.ProductClassificationID,
            ProductCategoryName: this.saveMembershipItemModel.ItemCategoryName,
            ProductID: this.saveMembershipItemModel.ProductID,
            ProductName: this.saveMembershipItemModel.ItemName,
            IsSelected: true,
            VariantInfoList: variantInfoList
          }
        ]
      }
    )
  }

  validateItemType() {
    if(!this.saveMembershipItemModel.IsEdit){
      this.isSelecteRequired = this.selectedMembershipItemsBenefits && this.selectedMembershipItemsBenefits.length > 0 ? false : true;
      return this.selectedMembershipItemsBenefits && this.selectedMembershipItemsBenefits.length > 0 ? true :  false;
    } else{
      return true;
    }

  }

  onSave(isValid: boolean) {
    this.validateTotalSessions();
    this.validateDiscountPercentage();
    if (!this.showTotalSessionsValidation && !this.showDiscountPercentageValidation && this.validateItemType()) {
      this.savedItemType.emit([]);

      if(this.saveMembershipItemModel.IsEdit){
        this.onEditSetSelectedModel();
      }

      let _membershipItemsBenefits = new Array<MembershipItemsBenefits>();

      this.selectedMembershipItemsBenefits.forEach(product => {

                var mib = new MembershipItemsBenefits();
                mib.BranchID = product.BranchID;
                mib.BranchName = this.selectedBranchList.find(sbl => sbl.BranchID == product.BranchID).BranchName;
                mib.DiscountPercentage = this.discountPercentage == 100 ? null : this.discountPercentage;
                mib.ItemCategoryID = product.ItemCategoryID;
                mib.ItemCategoryName = product.ItemCategoryName;
                mib.IsFree = this.discountPercentage == 100 ? true : this.isFree;
                mib.ItemID = product.ItemID;
                mib.ItemName = product.ItemName;
                mib.ProductID = product.ProductID;
                mib.ProductVariantName = product.ProductVariantName;
                mib.ItemTypeID = this.saveMembershipItemModel.ItemTypeID;
                mib.MembershipID = this.saveMembershipItemModel.MembershipID;
                mib.MembershipItemID = this.saveMembershipItemModel.MembershipItemID;
                mib.NoLimits = this.isNoLimit;
                mib.DurationTypeID =this.durationTypeID;
                mib.TotalSessions = this.totalSessions;
                mib.IsEdit = this.saveMembershipItemModel.IsEdit;
                _membershipItemsBenefits.push(mib);
      });
      // this.branchWiseProductCategory.forEach(productCategory => {
      //   productCategory.VariantProductInfoList.forEach(product => {
      //     if (product.IsSelected) {
      //       product.VariantInfoList.forEach(variant => {
      //         if (variant.IsSelected) {
      //           var mib = new MembershipItemsBenefits();
      //           mib.BranchID = this.searchProductVariantModel.BranchID;
      //           mib.BranchName = this.selectedBranchList.find(sbl => sbl.BranchID == this.searchProductVariantModel.BranchID).BranchName;
      //           mib.DiscountPercentage = this.discountPercentage == 100 ? null : this.discountPercentage;
      //           mib.ItemCategoryID = productCategory.ProductCategoryID;
      //           mib.ItemCategoryName = productCategory.ProductCategoryName;
      //           mib.IsFree = this.discountPercentage == 100 ? true : this.isFree;
      //           mib.ItemID = variant.ProductVariantID;
      //           mib.ItemName = product.ProductName;
      //           mib.ProductID = product.ProductID;
      //           mib.VariantName = variant.ProductVariantName;
      //           mib.ItemTypeID = this.saveMembershipItemModel.ItemTypeID;
      //           mib.MembershipID = this.saveMembershipItemModel.MembershipID;
      //           mib.MembershipItemID = this.saveMembershipItemModel.MembershipItemID;
      //           mib.NoLimits = this.isNoLimit;
      //           mib.TotalSessions = this.totalSessions;
      //           mib.IsEdit = this.saveMembershipItemModel.IsEdit;
      //           _membershipItemsBenefits.push(mib);
      //         }
      //       });
      //     }
      //   });
      // });

      this.savedItemType.emit(_membershipItemsBenefits);

      this.onCloseDialog();
    } else {
      this.showValidationMessage(true);
    }
  }

  onEditSetSelectedModel(){
    this.selectedMembershipItemsBenefits = [];

        var selectedMembershipItemBenefit = {
          MembershipItemID: this.saveMembershipItemModel.MembershipItemID,
          MembershipID: this.saveMembershipItemModel.MembershipID,
          ItemCategoryID: this.saveMembershipItemModel.ItemCategoryID,
          ItemCategoryName: this.saveMembershipItemModel.ItemCategoryName,
          ProductClassificationID: this.saveMembershipItemModel.ProductClassificationID,
          ItemID: this.saveMembershipItemModel.ItemID,
          ItemName: this.saveMembershipItemModel.ItemName,
          ProductVariantName: this.saveMembershipItemModel.ProductVariantName,
          ItemTypeID: this.saveMembershipItemModel.ItemTypeID,
          BranchID: this.saveMembershipItemModel.BranchID,
          BranchName: this.saveMembershipItemModel.BranchName,
          ServiceID: this.saveMembershipItemModel.ServiceID,
          ProductID: this.saveMembershipItemModel.ProductID,
          NoLimits: this.saveMembershipItemModel.NoLimits,
          TotalSessions: this.saveMembershipItemModel.TotalSessions,
          DurationTypeID: this.saveMembershipItemModel.DurationTypeID,
          DurationValue: this.saveMembershipItemModel.DurationValue,
          DurationTypeName: this.saveMembershipItemModel.DurationTypeName,
          IsFree: this.saveMembershipItemModel.IsFree,
          DiscountPercentage: this.saveMembershipItemModel.DiscountPercentage,
          IsEdit: this.saveMembershipItemModel.IsEdit,
          IsSelected: this.saveMembershipItemModel.IsSelected,
          IsActive: this.saveMembershipItemModel.IsActive,
        }

        this.selectedMembershipItemsBenefits.push(selectedMembershipItemBenefit);
  }

  showValidationMessage(isVisible: boolean) {
    this.isInvalidData = isVisible;
  }

  validateTotalSessions() {
    this.showTotalSessionsValidation = this.isNoLimit ? false : this.totalSessions > 0 && !this.isNoLimit ? false : true;
  }

  validateDiscountPercentage() {
    this.showDiscountPercentageValidation = this.isFree ? false : this.discountPercentage > 0 && this.discountPercentage <= 100 && !this.isFree ? false : true;
  }

  resetModelData() {
    this.isNoLimit = true;
    this.totalSessions = null;
    this.durationTypeID = this.enuMemberShipBenefitDurations.Membership
    this.isFree = true;
    this.discountPercentage = null;
    this.showTotalSessionsValidation = false;
    this.showDiscountPercentageValidation = false;
  }

  // #endregion
}
