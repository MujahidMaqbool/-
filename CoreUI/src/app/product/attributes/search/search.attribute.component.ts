/**Angular references**/
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

/**components**/
import { ViewAttributeComponent } from '../view/view.attribute.component';
import { SaveAttributeComponent } from '../save/save.attribute.component';
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';

/** Services & Models */
import { MessageService } from '@app/services/app.message.service';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { HttpService } from '@app/services/app.http.service';
import { AttributesSearchParams, AttributeViewModel } from '../../models/attributes.model';
import { AuthService } from '@app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Product } from '@app/helper/config/app.module.page.enums';
/** Configurations */
import { Configurations } from '@app/helper/config/app.config';
import { ApiResponse } from '@app/models/common.model';
import { AttributeApi } from '@app/helper/config/app.webapi';
import { Messages } from '@app/helper/config/app.messages';
import { EnumSaleSourceType } from '@app/helper/config/app.enums';
import { DataSharingService } from '@app/services/data.sharing.service';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-attributes-search',
  templateUrl: './search.attribute.component.html'
})
export class AttributesSearchComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;
  @ViewChild("attName") private _inputElement: ElementRef;
  //Models and Objects
  attributesSearchParams : AttributesSearchParams = new AttributesSearchParams();
  attributeViewDetail: AttributeViewModel = new AttributeViewModel();
  branchList = [];
  attributeList: [];


  // locals
  messages = Messages;
  isDataExists: boolean = false;
  appSourceTypeID = EnumSaleSourceType;
  allowedActions = {
    Save_Attribute: false,
    Delete_Attribute: false
  }
  isMultiBranch:boolean = false;

  sharedAttributeID: number = 0;
  // private subscription: Subscription;

  //Sorting
  sortOrder_ASC = Configurations.SortOrder_ASC;
  sortOrder_DESC = Configurations.SortOrder_DESC;
  sortOrder: string;
  isDeleteAllow:boolean;
  isSaveAllow : boolean;
  isViewAllow : boolean;

  constructor(
    private _dialog: MatDialogService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    public _authService: AuthService,
    private _dataSharingService: DataSharingService,
  ) { }

  ngOnInit(): void {
    this.isMultiBranchID();
    this.getFundamentals();
    this.getAttributeID();
    this.setPermissions();
    /*******For redirection from Enterprise******** */
    if (this.sharedAttributeID && this.sharedAttributeID > 0) {
      this.onAddAttribute(this.sharedAttributeID);
    }

  }

 /* Method to set permission */
 setPermissions() {
  this.isDeleteAllow = this._authService.hasPagePermission(ENU_Permission_Module.Product, ENU_Permission_Product.Attribute_Delete);
  this.isSaveAllow = this._authService.hasPagePermission(ENU_Permission_Module.Product, ENU_Permission_Product.Attribute_Save);
  this.isViewAllow = this._authService.hasPagePermission(ENU_Permission_Module.Product, ENU_Permission_Product.Attribute_View);
}

  ngAfterViewInit() {
    this.getAttributeList();
  }

  ngOnDestroy() {
    this.reSetSharedAttributeID(0);
  }

  focusInput() {
    setTimeout(() => { this._inputElement.nativeElement.focus() }, 900)
  }

  reSetSharedAttributeID(attributeID) {
    this._dataSharingService.shareAttributeID(attributeID);
  }

  /*******Get shared AttributeID *******/
  async getAttributeID() {
      await this._dataSharingService.sharedAttributeID.subscribe((attributeId: number) => {
      this.sharedAttributeID = attributeId;
    });
  }
      //check here if we have interprise level permission or not
      async isMultiBranchID() {
        await this._dataSharingService.sharedIsMultiBranchCompany.subscribe((isMultiBranch: boolean) => {
        this.isMultiBranch = isMultiBranch;
        if(!isMultiBranch){
          this.attributesSearchParams.TypeID = EnumSaleSourceType.OnSite;
        }
      });
      }
   /* Get Search Fundamentals */
   getFundamentals() {
    this._httpService.get(AttributeApi.getFundamental).subscribe(
      (response: ApiResponse) => {
        if (response.MessageCode > 0) {
          this.branchList = response.Result;
        } else {
          this._messageService.showErrorMessage(
            this.messages.Error.Get_Error.replace("{0}", "Attribute")
          );
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Attribute")
        );
      }
    );
  }

  searchAttributeList(){
    this.appPagination.pageNumber = 1;
    this.appPagination.paginator.pageIndex = 0;
    this.getAttributeList();
  }
  /* Get Attribute list */
  getAttributeList() {
    this.attributesSearchParams.AttributeName = this.attributesSearchParams.AttributeName.trim();
    let attributeSearch = JSON.parse(
      JSON.stringify(this.attributesSearchParams)
    );
    attributeSearch.PageNumber = this.appPagination.pageNumber;
    attributeSearch.PageSize = this.appPagination.pageSize;
    this._httpService.get(AttributeApi.getAttributes, attributeSearch).subscribe(
      (data) => {
        this.isDataExists =
          data.Result != null && data.Result.length > 0 ? true : false;
        if (this.isDataExists) {
          this.attributeList = data.Result;
          if (data.Result.length > 0) {
            this.appPagination.totalRecords = data.TotalRecord;
          } else {
            this.appPagination.totalRecords = 0;
          }
        } else {
          this.attributeList = [];

          this.appPagination.totalRecords = 0;
        }
      },
      (error) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Attribute")
        );
      }
    );
  }

    /* change sorting */
    changeSorting(sortIndex: number) {
      this.attributesSearchParams.SortIndex = sortIndex;
      if (sortIndex == 1) {
        if (this.sortOrder == this.sortOrder_ASC) {
          this.sortOrder = this.sortOrder_DESC;
          this.attributesSearchParams.SortOrder = this.sortOrder;
          this.getAttributeList();
        } else {
          this.sortOrder = this.sortOrder_ASC;
          this.attributesSearchParams.SortOrder = this.sortOrder;
          this.getAttributeList();
        }
      }

      if (sortIndex == 2) {
        if (this.sortOrder == this.sortOrder_ASC) {
          this.sortOrder = this.sortOrder_DESC;
          this.attributesSearchParams.SortOrder = this.sortOrder;
          this.getAttributeList();
        } else {
          this.sortOrder = this.sortOrder_ASC;
          this.attributesSearchParams.SortOrder = this.sortOrder;
          this.getAttributeList();
        }
      }
    }


   /* Method to receive the pagination from the Paginator */
   reciviedPagination(pagination: boolean) {
    if (pagination) {
      this.getAttributeList();
    }
  }

   /* Method to reset search filters */
   resetSearchFilter() {
    this.attributesSearchParams = new AttributesSearchParams();
    this.appPagination.resetPagination();
    this.isMultiBranchID();
    this.getAttributeList();
  }

  onViewAttribute(productAttributeID: number, attributeStatus: boolean) {
    this._httpService.get(AttributeApi.getAttributeByID + productAttributeID).subscribe(data => {
      if (data && data.Result != null) {
        this.attributeViewDetail = data.Result;

        this._dialog.open(ViewAttributeComponent, {
          disableClose: true,
          data: { ...this.attributeViewDetail, isActive: attributeStatus }
        });
      }
      else {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace('{0}', 'Attribute')
        );
      }
    });
    (error) => {
      this._messageService.showErrorMessage(
        this.messages.Error.Get_Error.replace('{0}', 'Attribute')
      );
    }
  }

  onAddAttribute(attributeID: any, AppSourceTypeID: number = null) {
    const _dialog = this._dialog.open(SaveAttributeComponent, {
      disableClose: true,
      data: {
        attributeID: attributeID,
        appSourceTypeID: AppSourceTypeID
      }
    });
    _dialog.componentInstance.isSaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this.getAttributeList();
      }
    });
  }

  onDeleteAttribute(attributeID: number) {

    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, {
      disableClose: true, data: {
        Title: this.messages.Delete_Messages.Confirm_delete, header: this.messages.Delete_Messages.Del_Msg_Heading.replace("{0}", "attribute"),
        description: this.messages.Delete_Messages.Del_Msg_Undone, ButtonText: this.messages.General.Delete
      }
    });
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.delete(AttributeApi.deleteAttribute + attributeID)
          .subscribe((res: any) => {
            if (res && res.MessageCode) {
              if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Attribute"));
                this.getAttributeList();
              }
              else if (res && res.MessageCode < 0) {
                this._messageService.showErrorMessage(res.MessageText);
              }
              else {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "attribute"));
              }
            }
          },
            err => {
              this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "attribute"));
            });
      }
    })

}



}
