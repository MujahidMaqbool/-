import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
/********************** START: Application Components *********************/
import { ServiceCategorySaveComponent } from '@setup/service-category/save/service.category.save.component';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
/********************** START: Service & Models *********************/
import { ServiceCategory } from '@setup/models/service.category.model';
import { HttpService } from '@services/app.http.service';
import { MessageService } from '../../../services/app.message.service';
import { AuthService } from '@app/helper/app.auth.service';

/********************** START: Common *********************/
import { Messages } from '@app/helper/config/app.messages';
import { Configurations } from '@app/helper/config/app.config';
import { ServiceCategoryApi } from '@app/helper/config/app.webapi';
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';

@Component({
  selector: 'service-category-search',
  templateUrl: './service.category.search.component.html'
})
export class ServiceCategorySearchComponent implements OnInit {

  // #region Local Members
  @ViewChild(MatPaginator) paginator: MatPaginator;

  isSaveServiceCategoryAllowed: boolean = false;
  previousPageSize = 0;

  /* Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;

  /*********** Pagination **********/
  totalRecords: number = 0;
  defaultPageSize = Configurations.DefaultPageSize;
  pageSizeOptions = Configurations.PageSizeOptions;
  pageNumber: number = 1;
  pageIndex: number = 0;
  isExpand: boolean = true;
  inputName: string = '';
  isDataExists: boolean = false;

  result: boolean = false;
  serviceCategoryies: ServiceCategory[] = [];
  serviceCategory = new ServiceCategory();
  deleteDialogRef: any;

  // #endregion

  constructor(
    private _authService: AuthService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dialog: MatDialogService
  ) { }

  ngOnInit() {
    this.isSaveServiceCategoryAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.ServiceCategory_Save);
  }

  ngAfterViewInit() {
    this.paginator.pageSize = this.defaultPageSize;
    this.previousPageSize = this.defaultPageSize;
    this.getServiceCategories();
  }

  onAddClick() {
    this.openDialogForServiceCategory(0);
  }

  onEditClick(ServiceCategoryID: number) {
    this.openDialogForServiceCategory(ServiceCategoryID);
  }

  openDialogForServiceCategory(serviceCategoryID: number) {
    if (serviceCategoryID > 0) {
      this.getServiceCategoryById(serviceCategoryID);
    }
    else {
      this.serviceCategory = new ServiceCategory();
      this.openDialog();
    }
  }

  getServiceCategoryById(serviceCategoryID: number) {
    this._httpService.get(ServiceCategoryApi.getByID + serviceCategoryID)
      .subscribe(data => {
        if (data && data.MessageCode > 0) {
          this.serviceCategory = data.Result;
          this.openDialog();
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service Category"));
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service Category")); }
      );
  }

  openDialog() {
    const saveDialogRef = this._dialog.open(ServiceCategorySaveComponent, {
      disableClose: true,
      data: this.serviceCategory
    });

    saveDialogRef.componentInstance.serviceCategorySaved.subscribe((isSaved: boolean) => {
      this.getServiceCategories();
    })
  }

  deleteServiceCategory(serviceCategoryID: number) {

    this.deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
    this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.delete(ServiceCategoryApi.delete + serviceCategoryID)
          .subscribe((res: any) => {
            if (res && res.MessageCode) {
              if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Service Category"));
                this.getServiceCategories();
              }
              else if (res && res.MessageCode <= 0) {
                this._messageService.showErrorMessage(res.MessageText);
              }
              else {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Service Category"));
              }
            }
          },
            err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Service Category")); }
          );
      }
    })
  }

  getServiceCategories() {
    let url = ServiceCategoryApi.getAll.replace("{pageNumber}", this.pageNumber.toString()).replace("{pageSize}", this.paginator.pageSize.toString())
    this._httpService.get(url)
      .subscribe(data => {
        if (data && data.MessageCode > 0) {
          this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
          if (this.isDataExists) {
            if (data.TotalRecord) {
              this.totalRecords = data.TotalRecord;
            }
            else {
              this.totalRecords = 0;
            }
            this.serviceCategoryies = data.Result;
          }
          else {
            this.serviceCategoryies = [];
          }
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service Category"));
        }
      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Service Category"));
        }
      );
  }

  onPageChange(e: any) {
    if (e.pageIndex >= this.pageNumber) {
      // Set page number
      this.pageNumber = ++e.pageIndex;
    }
    else {
      if (e.pageIndex >= 1) {
        this.pageNumber = --this.pageNumber;
      }
      else { this.pageNumber = 1 }
    }
    // as per disscusion with B.A and tahir when user change page index pagination reset (show page 1)
    if (this.previousPageSize !== e.pageSize) {
      this.pageNumber = 1;
      this.paginator.pageSize = e.pageSize;
      this.paginator.pageIndex = 0;
    }

    this.previousPageSize = e.pageSize;
    this.getServiceCategories();
  }
}
