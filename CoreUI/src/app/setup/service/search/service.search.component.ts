/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from "@angular/core";

/********************** Material References *********************/
import { MatPaginator } from "@angular/material/paginator";

/********************** Services & Models *********************/
/* Models */
import { Service, SearchParameter } from "@setup/models/service.model";
import { AuthService } from "@app/helper/app.auth.service";
/* Services */
import { HttpService } from "@services/app.http.service";
import { MessageService } from "@services/app.message.service";

/********************** component & Common *********************/
import { DeleteConfirmationComponent } from "@app/application-dialog-module/delete-dialog/delete.confirmation.component";
import { Messages } from "@app/helper/config/app.messages";
import { Configurations } from "@app/helper/config/app.config";
import { ServiceApi } from "@app/helper/config/app.webapi";
import {
  ENU_Permission_Module,
  ENU_Permission_Setup,
} from "@app/helper/config/app.module.page.enums";
import { MatDialogService } from "@app/shared/components/generics/mat.dialog.service";
import { AppPaginationComponent } from "@app/shared-pagination-module/app-pagination/app.pagination.component";

@Component({
  selector: "service-search",
  templateUrl: "./service.search.component.html",
})
export class ServiceSearchComponent implements OnInit {
  // #region Local Members

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;

  isSaveServiceAllowed: boolean = false;

  /* Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;

  /*********** Local Members **********/
  serviceName: string = "";
  ServiceCategoryID: number = 0;
  deleteDialogRef: any;
  isActive: boolean = false;

  /*********** Pagination **********/
  // totalRecords: number = 0;
  // defaultPageSize = Configurations.DefaultPageSize;
  // pageSizeOptions = Configurations.PageSizeOptions;
  // pageNumber: number = 1;
  // pageIndex: number = 0;
  inputName: string = "";
  isDataExists: boolean = false;

  /*********** Collection Types **********/
  searchFundamentalsList: any;
  serviceCategoryList: any;
  statusList: any;
  searchParameters = new SearchParameter();
  searchServicesParameters: SearchParameter = new SearchParameter();
  services: Service[] = [];

  // #endregion

  constructor(
    private _authService: AuthService,
    private _httpService: HttpService,
    private _deleteBranchDilage: MatDialogService,
    private _messageService: MessageService
  ) { }

  /*********** Angualar Events **********/
  ngOnInit() {
    this.isSaveServiceAllowed = this._authService.hasPagePermission(
      ENU_Permission_Module.Setup,
      ENU_Permission_Setup.Service_Save
    );
    this.searchFundamentals();
  }

  ngAfterViewInit() {
    this.getServices();
  }

  // #region Events


  reciviedPagination(pagination: boolean) {
    if (pagination)
      this.getServices();
  }

  onSearchForm() {
    this.searchServicesParameters.serviceName = this.searchParameters.serviceName;
    this.searchServicesParameters.serviceCategoryID = this.searchParameters.serviceCategoryID;
    this.searchServicesParameters.IsActive = this.searchParameters.IsActive;
    this.appPagination.paginator.pageIndex = 0;
    this.appPagination.pageNumber = 1;
    this.getServices();
  }

  getServices() {
    let params = {
      serviceName: this.searchServicesParameters.serviceName,
      serviceCategoryID: this.searchServicesParameters.serviceCategoryID,
      isActive: this.searchServicesParameters.IsActive ? true : false,
      pageNumber: this.appPagination.pageNumber,
      pageSize: this.appPagination.pageSize,
    };

    this._httpService.get(ServiceApi.getAll, params).subscribe(
      (data) => {
        if (data && data.MessageCode > 0) {
          this.isDataExists =
            data.Result != null && data.Result.length > 0 ? true : false;

          if (this.isDataExists) {
            if (data.TotalRecord) {
              this.appPagination.totalRecords = data.TotalRecord;
            } else {
              this.appPagination.totalRecords = 0;
            }

            this.services = data.Result;
          } else {
            this.services = [];
          }
        } else {
          this._messageService.showErrorMessage(
            this.messages.Error.Dropdowns_Load_Error
          );
        }
      },
      (err) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Dropdowns_Load_Error
        );
      }
    );
  }

  resetSearchFilters() {
    this.searchServicesParameters = new SearchParameter();
    this.searchParameters.IsActive = 1;
    this.searchParameters.serviceCategoryID = 0;
    this.searchParameters.serviceName = "";
    this.appPagination.resetPagination();
    this.getServices();
  }

  EditService(serviceID: number) {
    this._httpService.get(ServiceApi.getByID + serviceID).subscribe(
      (data) => {
        this.services = data.Result;
      },
      (err) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Get_Error.replace("{0}", "Service")
        );
      }
    );
  }

  deleteService(Id: number) {
    this.deleteDialogRef = this._deleteBranchDilage.open(
      DeleteConfirmationComponent,
      { disableClose: true ,
        data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}
       }
    );
    this.deleteDialogRef.componentInstance.confirmDelete.subscribe(
      (isConfirmDelete: boolean) => {
        if (isConfirmDelete) {
          this._httpService.delete(ServiceApi.delete + Id).subscribe(
            (data: any) => {
              if (data && data.MessageCode) {
                if (data && data.MessageCode > 0) {
                  this._messageService.showSuccessMessage(
                    this.messages.Success.Delete_Success.replace(
                      "{0}",
                      "Service"
                    )
                  );
                  this.getServices();
                } else if (data && data.MessageCode <= 0) {
                  this._messageService.showErrorMessage(data.MessageText);
                } else {
                  this._messageService.showErrorMessage(
                    this.messages.Error.Delete_Error.replace("{0}", "Service")
                  );
                }
              }
            },
            (err) => {
              this._messageService.showErrorMessage(
                this.messages.Error.Delete_Error.replace("{0}", "Service")
              );
            }
          );
        }
      }
    );
  }

  searchFundamentals() {
    this._httpService.get(ServiceApi.searchFundamentals).subscribe(
      (data) => {
        this.searchFundamentalsList = data.Result;
        this.serviceCategoryList = data.Result.ServiceCategoryList;
        this.statusList = data.Result.StatusList;
        this.setDefaultDrowdown();
      },
      (err) => {
        this._messageService.showErrorMessage(
          this.messages.Error.Dropdowns_Load_Error
        );
      }
    );
  }

  setDefaultDrowdown() {
    if (this.serviceCategoryList) {
      this.serviceCategoryList.splice(0, 0, {
        ServiceCategoryID: 0,
        ServiceCategoryName: "All",
        IsActive: true,
      });
    }
  }
}
