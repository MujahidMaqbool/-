import { Component, OnInit, ViewChild, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductVariant, SearchProductVariant, ProductAttribute, AttributeValue } from 'src/app/product/models/variant.model';
import { HttpService } from 'src/app/services/app.http.service';
import { ProductApi } from 'src/app/helper/config/app.webapi';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { RestoreVariantComponent } from './restore-variant/restore.variant.component';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { ApiResponse } from 'src/app/models/common.model';
import { ProductClassification } from 'src/app/helper/config/app.enums';

@Component({
  selector: 'app-product-variant',
  templateUrl: './product.variant.component.html',
})
export class ProductVariantComponent implements OnInit {


  /******************************References******************************** */
  @ViewChild("appPagination") appPagination: AppPaginationComponent;
  @Output() isClose = new EventEmitter<boolean>();
  messages = Messages;

  /***********Enum*********/
  productClassification = ProductClassification;
  /******************************models and list******************************** */
  searchProductVariant: SearchProductVariant = new SearchProductVariant();
  productAttributeList: ProductAttribute[] = [];
  VariantList: AttributeValue[] = [];
  selectedVariantList: Array<any> = [];
  productVariant: ProductVariant[] = [];
  productVariantList: any[] = [];
  deletedProductVariant: any = [];
  productAttributeListCopy: ProductAttribute[];

  branchesListDD: any = [];
  VariantListDD: any = [];

  tempProductAttributeListCopy: ProductAttribute = new ProductAttribute;

  productVariantObj: any;
  productAttribute: any;
  branchList: any;
  variantList: any;

  //******************************Local variables******************************** */
  allVarientValue: any = {
    AttributeValue: '',
    AttributeValueID: 0,
    AttributeID: 0,
    SortOrder: 0
  }
  allVarientValueCopy: any = {
    AttributeValue: '',
    AttributeValueID: 0,
    AttributeID: 0,
    SortOrder: 0
  }
  isDataExists: boolean;
  isShowGenerateVariantBtn: boolean = true;
  allProductAttributeValueList: any;
  archivedList: any;
  searchVariantName: string = "";
  isFundamentalDataExists: boolean;
  isAttributeValueExistDataExists: boolean;
  isVaraintExist: any;

  constructor(
    private dialogRef: MatDialogService,
    private _dialog: MatDialogRef<ProductVariantComponent>,
    private _httpService: HttpService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public productobj: any
  ) { }

  ngOnInit(): void {
    if (this.productobj.isProductVariantGenerate && this.productobj.classficationID == this.productClassification.Variant) {
      this.getGeneratedFundamental().then(isTrue => {
        this.getFundamental().then(isTrue => {
          this.productVariantDetail();
        });
      });
    } else {
      let productVariant = new ProductVariant();
      productVariant.productAttribute = new ProductAttribute();
      productVariant.productAttribute.AttributeID = null;
      this.productVariant.push(productVariant);
      this.getFundamental();
    }
  }

  // get fundamental for generated variants
  getGeneratedFundamental() {
    return new Promise<boolean>((resolve, reject) => {
      this._httpService.get(ProductApi.getGeneratedFundamental + this.productobj.productID).subscribe((respose) => {
        this.isDataExists = respose.Result != null ? true : false;
        if (this.isDataExists) {
          this.productAttributeList = respose.Result.ProductAttributes;
          this.allProductAttributeValueList = respose.Result.AttributeValues;
          this.productVariant = [];
          respose.Result.ProductAttributes.forEach((variant, index) => {
            let obj = {
              AttributeID: variant.AttributeID,
              AttributeName: variant.AttributeName,
              SortOrder: variant.SortOrder,
            }
            let valObj = this.setAttributeValues(variant.ProductAttributeValues)
            let param = {
              productAttribute: obj,
              attributeValue: valObj,
              productAttributeDD: [],
              attributeValuesDD: []
            } as ProductVariant;
            this.productVariant.push(param);
          })
          this.isShowGenerateVariantBtn = false;
          resolve(true)
        } else {
          reject();
        }
      });
    });
  }

  // set generated attribute and their values 
  setAttributeValues(ProductAttributeValues: any) {
    let list: any = [];
    let i = 0
    ProductAttributeValues.forEach(variant => {
      let attVal: any = {};
      attVal.AttributeValue = variant.AttributeValue.toString();
      attVal.AttributeValueID = Number(variant.AttributeValueID);
      attVal.AttributeID = Number(variant.AttributeID);
      attVal.SortOrder = Number(i++) + 1;
      list.push(attVal);
    })
    return list;
  }

  // get fundamental for new attribute and their values
  getFundamental() {
    return new Promise<boolean>((resolve, reject) => {
      this._httpService.get(ProductApi.getFundamental).subscribe((respose) => {
        this.isFundamentalDataExists = respose.Result != null ? true : false;
        if (this.isFundamentalDataExists) {
          this.productAttributeList = respose.Result.ProductAttribute;
          this.branchList = respose.Result.BranchList;
          this.productAttributeListCopy = respose.Result.ProductAttribute;
          if (!this.productobj.isProductVariantGenerate) {
            this.productVariant[0].productAttributeDD = respose.Result.ProductAttribute;
          }
          if (this.productobj.isProductVariantGenerate) {
            this.productVariant.forEach(element => {
              element.productAttributeDD = respose.Result.ProductAttribute;
              element.attributeValuesDD = this.filterAttributeValues(element.productAttribute.AttributeID);
              var data: any = [];
              element.attributeValue.forEach(attr => {
                var result = element.attributeValuesDD.find(i => i.AttributeValueID == attr.AttributeValueID);
                if (result) {
                  data.push(result);
                }
              });
              if (element.attributeValue && element.attributeValuesDD && element.attributeValuesDD?.length == element.attributeValue?.length) {
                data.push(this.allVarientValue);
              }
              element.attributeValue = [];
              element.attributeValue = data;
            })
          }
          resolve(true);
        } else {
          reject();
        }
      });
    })
  }

  //  filter value of attribute
  filterAttributeValues(AttributeID: any) {
    let listOfValues = [];
    this.allProductAttributeValueList.forEach(value => {
      if (AttributeID == value.AttributeID) {
        listOfValues.push(value)
      }
    })
    return listOfValues;
  }

  // on select attribute and get its value from BE 
  onSelectAttribute(index: any, isSelection: boolean = false) {
    this.productVariant[index].attributeValue = [];
    this.productVariant[index].productAttribute == null ? null : this.productVariant[index].productAttribute;
    this.productVariant[index].productAttribute.SortOrder = index;
    this._httpService.get(ProductApi.getAttributeValue + this.productVariant[index].productAttribute.AttributeID).subscribe((respose) => {
      this.isAttributeValueExistDataExists = respose.Result != null && respose.Result.length > 0 ? true : false;
      this.productVariant[index].attributeValuesDD = [];
      this.allVarientValue = isSelection ? {} : this.allVarientValue;
      if (this.isAttributeValueExistDataExists) {
        this.productVariant[index].attributeValuesDD = respose.Result;
      }
    });
    this.productVariant[index].isRequiredAttribute = this.productVariant[index].productAttribute != null ? false : true;
  }

  // close dialog
  onCloseDialog() {
    this.isClose.emit(true)
    this._dialog.close();
  }

  // add new varaints
  addNewVariant() {
    let productAttribute = new ProductVariant();
    productAttribute.productAttribute = new ProductAttribute();
    productAttribute.productAttribute.AttributeID = null;
    productAttribute.productAttributeDD = this.productAttributeListCopy;
    this.productVariant.push(productAttribute);
    var attribute: any = [];
    this.productVariant.forEach((element, index) => {
      if (element.productAttribute?.AttributeID && element.productAttribute?.AttributeID > 0) {
        attribute.push({ attributeID: element.productAttribute?.AttributeID }
        );
      }
    })
    if (attribute) {
      this.RemoveElementFromArray(attribute);
    }
  }

  // remove added varaints from list
  RemoveElementFromArray(attribute: any) {
    this.productVariant[this.productVariant.length - 1].productAttributeDD = [];
    this.productVariant[0].productAttributeDD.forEach(element => {
      var result = attribute.find(i => i.attributeID == element.AttributeID);
      if (!result) {
        this.productVariant[this.productVariant.length - 1].productAttributeDD.push(element);
      }
    });
  }

  // recieved pagination index
  reciviedPagination(pagination: boolean) {
    if (pagination)
      this.productVariantDetail();
  }

  // select all variant
  toggleAllSelection(index: number, event: any) {
    this.selectedVariantList = [];
    this.allVarientValue = this.allVarientValueCopy;
    event.target.checked ? this.productVariant[index].attributeValue.push(this.allVarientValue) : this.productVariant[index].attributeValue = []
    //if id zero exsit thats means select all
    if (this.productVariant[index].attributeValue.find(i => i.AttributeValueID == 0)) {
      this.productVariant[index].attributeValue = [];
      this.productVariant[index].attributeValuesDD.forEach(variant => {
        this.productVariant[index].attributeValue.push(variant);
      });
      this.tosslePerOneItem(index);
    } else { // else de select all selections values
      this.productVariant[index].attributeValue = [];
    }
  }

  // select single variant on index bases
  tosslePerOneItem(index: number) {
    this.allVarientValue = this.allVarientValueCopy;
    if (this.productVariant[index].attributeValue.filter(i => i.AttributeValueID != 0).length == this.productVariant[index].attributeValuesDD.length) {
      this.productVariant[index].attributeValue.push(this.allVarientValue);
    } else {
      this.productVariant[index].attributeValue = this.productVariant[index].attributeValue.filter(i => i.AttributeValueID != 0);
    }
    this.isShowGenerateVariantBtn = false;
    this.productVariant[index].isRequiredAttributeValue = this.productVariant[index].attributeValue.length > 0 ? false : true;
    this.productVariant[index].isRequiredAttribute = this.productVariant[index].productAttribute != null ? false : true;
  }

  // search product varaints
  onSearchProductVariant() {
    this.productVariantDetail();
  }

  // generate product variant against selected attribute and their values and sdisplay in below
  generateVariant() {
    this.productVariant.forEach(varaint => {
      varaint.isRequiredAttributeValue = varaint.attributeValue.length > 0 ? false : true;
      varaint.isRequiredAttribute = varaint.productAttribute != null ? false : true;
    });
    if (this.productVariant.filter(x => x.isRequiredAttributeValue || x.isRequiredAttribute).length != 0) {
      this._messageService.showErrorMessage(this.messages.Validation.select_Attribute_AttributeValue);
    } else {
      if (this.isCheckMultiSelectAttribute()) {
        this._messageService.showErrorMessage(this.messages.Validation.Attribute_selected_multiple);
      } else {
        // check max limit exceed 125 
        var variantValCount = this.productVariant[0].attributeValue.filter(j => Object.keys(j).length > 0 && j.AttributeValueID != 0).length;
        for (let index = 0; index < this.productVariant.length; index++) {
          if (index + 1 == this.productVariant.length) {
            break;
          } else {
            let len = this.productVariant[index + 1].attributeValue.filter(j => Object.keys(j).length > 0 && j.AttributeValueID != 0).length;
            variantValCount *= len
          }
        }
        if (variantValCount > 125) {
          this._messageService.showErrorMessage(this.messages.Validation.Max_Attribute_Value);
        } else {
          if (this.productVariant.filter(x => x.attributeValue.length)) {
            this.setModelForGenerateProductVariant(this.productVariant);
            let param = {
              productID: this.productobj.productID,
              productVariant: JSON.parse(JSON.stringify(this.productVariantObj))
            }
            this._httpService.save(ProductApi.generateVariant, param).subscribe((respose) => {
              this.isDataExists = respose.Result != null && respose.Result.length > 0 ? true : false;
              if (this.isDataExists) {
                this.productVariantList = respose.Result;
                this.extractProductVariantFromList(this.productVariantList);
                this.appPagination.resetPagination();
                this.appPagination.totalRecords = respose.TotalRecord;
              }
              else {
                this.productVariant = [];
                this.appPagination.totalRecords = 0;
              }
            });
          }
        }
      }
    }
  }

  // extract Product Variant From List
  extractProductVariantFromList(productVariantList: any) {
    productVariantList.filter(x => this.VariantListDD = x.VariantInfo.map(variant => {
      return <any>{
        variantId: variant.ProductVariantID,
        variantName: variant.ProductVariantName
      }
    }))
  }

  // get generated product variant 
  productVariantDetail() {
    let param = {
      productID: this.productobj.productID,
      pageNumber: this.appPagination.pageNumber,
      PageSize: this.appPagination.pageSize,
      productVariantName: this.searchVariantName,
      branchID: this.searchProductVariant.branchID
    }
    this._httpService.save(ProductApi.productVariantDetail, param).subscribe((respose) => {
      this.isDataExists = respose.Result != null && respose.Result.length > 0 ? true : false;
      if (this.isDataExists) {
        this.productVariantList = respose.Result;
        this.productVariantList.filter(x => this.isVaraintExist = x.VariantInfo.length == 0 ? true : false)
        this.extractProductVariantFromList(this.productVariantList);
        this.appPagination.totalRecords = this.isVaraintExist ? 0 : respose.TotalRecord;
      }
      else {
        this.productVariantList = [];
        this.appPagination.totalRecords = 0;
      }
    });
  }

  // check duplicate attibute selected
  isCheckMultiSelectAttribute() {
    var uniq = this.productVariant
      .map((variant) => {
        return {
          count: 1,
          AttributeID: variant?.productAttribute?.AttributeID
        }
      })
      .reduce((a, b) => {
        a[b?.AttributeID] = (a[b?.AttributeID] || 0) + b.count
        return a
      }, {})
    var isDuplicatesAttribute = Object.keys(uniq).filter((a) => uniq[a] > 1).length;
    return isDuplicatesAttribute > 0 ? true : false;
  }

  // set model for generate product variants
  setModelForGenerateProductVariant(productVariant: any) {
    this.productVariantObj = [];
    productVariant.forEach(element => {
      let model = {
        productAttribute: element.productAttribute,
        attributeValue: element.attributeValue.filter(x => Object.keys(x).length > 0 && x.AttributeValueID != 0)
      }
      this.productVariantObj.push(model);
    });
  }

  // delete variant
  deleteVariant(index: any) {
    this.isShowGenerateVariantBtn = false;
    this.productVariant.splice(index, 1);
  }

  // restored deleted variant
  onRestoreVariant() {
    this.getArchivedVariant().then(istrue => {
      const _dialog = this.dialogRef.open(RestoreVariantComponent, {
        disableClose: true,
        data: this.archivedList
      });
      _dialog.componentInstance.isRestore.subscribe((isConfirmRestore: boolean) => {
        if (isConfirmRestore) {
          this.productVariantDetail();
        }
      });
    });
  }

  // get archived product variants
  getArchivedVariant() {
    return new Promise((resolve, reject) => {
      this._httpService.get(ProductApi.getArchivedProductVariant + this.productobj.productID)
        .subscribe((response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this.archivedList = response.Result;
            if (this.archivedList.VariantInfo.length > 0) {
              resolve(true)
            } else {
              reject();
              this._messageService.showErrorMessage(this.messages.Generic_Messages.No_Record_Found);
            }
          }
          else {
            reject();
          }
        });
    });
  }

  // get archived product variants
  activeProductVariant(event: any, productVariantBranch: any, isActive: boolean, parentIdex: number, ChildIdex: number, subChildIdex: number) {
    if (isActive) {
      productVariantBranch.ProductBranchPermissionIsActive = event.target.checked
    } else {
      productVariantBranch.ProductVariantBranchIsIncluded = event.checked;
      if (!event.checked) {
        this.productVariantList[parentIdex].VariantInfo[ChildIdex].VariantBranchInfo[subChildIdex].ProductVariantBranchIsActive = false;
        productVariantBranch.ProductBranchPermissionIsActive = false;
      }
    }

    let param = {
      productVariantBranchID: productVariantBranch.ProductVariantBranchID,
      isActive: productVariantBranch.ProductBranchPermissionIsActive,
      isInclude: productVariantBranch.ProductVariantBranchIsIncluded
    }
    this._httpService.save(ProductApi.productVariantBranchUpdate, param).subscribe((respose) => {
      //this.productVariantDetail();
    });
  }

  // delete product variant
  openDeleteProductVariantDialog(productVariantID: number) {
    this.deleteProductVariant(productVariantID);
  }

  // open dialog for delete product variant
  deleteProductVariant(productVariantID: number) {
    const deleteDialogRef = this.dialogRef.open(DeleteConfirmationComponent, {
      disableClose: true, data: {
        Title: this.messages.Delete_Messages.Confirm_delete, header: this.messages.Delete_Messages.Del_Msg_Heading.replace("{0}", "product variant"),
        description: this.messages.Delete_Messages.Del_Variant_Msg_Description, ButtonText: this.messages.General.Delete
      }
    });
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.delete(ProductApi.deleteProductVariant + productVariantID)
          .subscribe((res: any) => {
            if (res && res.MessageCode) {
              if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Product variant"));
                this.productVariantDetail();
              }
              else if (res && res.MessageCode < 0) {
                this._messageService.showErrorMessage(res.MessageText);
              }
              else {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Product variant"));
              }
            }
          },
            err => {
              this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Product variant"));
            });
      }
    })
  }
}
