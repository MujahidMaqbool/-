/********************* Angular References ********************/
import { Component, OnInit, ViewChild } from '@angular/core';

/********************* Material Reference ********************/
import { MatPaginator } from '@angular/material/paginator';

/********************* Services & Models ********************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { AuthService } from 'src/app/helper/app.auth.service';

/* Models*/
import { TemplateSearchParameter, TemplateList, TemplateView } from 'src/app/setup/models/template.model';

/********************** Common ***************************/
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';

/********************** Components *********************************/
import { TemplateSaveComponent } from "src/app/setup/template/save/template.save.component";
import { Messages } from 'src/app/helper/config/app.messages';
import { Configurations } from 'src/app/helper/config/app.config';
import { TemplateApi } from 'src/app/helper/config/app.webapi';
import { TemplateType } from 'src/app/helper/config/app.enums';
import { ENU_Permission_Module, ENU_Permission_Setup } from 'src/app/helper/config/app.module.page.enums';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';

@Component({
  selector: 'template-search',
  templateUrl: './template.search.component.html'
})
export class TemplateSearchComponent implements OnInit {

  // #region Local Members

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;

  isSaveTemplateAllowed: boolean = false;
  /* Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  errorMessage: string;
  successMessage: string;
  messages = Messages;

  /* Models Refences */
  templateSearchParameter = new TemplateSearchParameter();
  genralTempSearchParams: TemplateSearchParameter = new TemplateSearchParameter();
  templateList = new TemplateList();
  templateSearchfundamentals: any;
  statusList: any;
  templateTypeList: any;
  moduleList: any;
  templateGridObj: any;
  templateModel: TemplateView = new TemplateView();
  templateType = TemplateType;

  sortIndex: number = 1;
  sortOrder_ASC = Configurations.SortOrder_ASC;
  sortOrder_DESC = Configurations.SortOrder_DESC;
  sortOrder: string;
  postionSortOrder: string;
  isPositionOrderASC: boolean = undefined;
  isDataExists: boolean = false;
  isTemplateTitile: boolean = true;
  isSearchByPageIndex: boolean = false;

  // #endregion

  constructor(
    private _authService: AuthService,
    private _httpService: HttpService,
    private _templateActionDialog: MatDialogService,
    private _messageService: MessageService,
  ) { }

  ngOnInit() {
    this.isSaveTemplateAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Template_Save);
    this.getTemplateSearchfundamentals();
    this.sortOrder = this.sortOrder_ASC;
    this.postionSortOrder = this.sortOrder_ASC;
  }

  ngAfterViewInit() {
    this.getTemplates();
  }

  // #region Events */

  // changePageSize(e: any) {
  //   if (e.pageIndex >= this.pageNumber) { this.pageNumber = ++e.pageIndex; }

  //   else {
  //     if (e.pageIndex >= 1) {
  //       this.pageNumber = --this.pageNumber;
  //     }
  //     else { this.pageNumber = 1 }
  //   }
  //   this.getTemplates();
  // }

  onAddTemplate() {
    this.templateModel = new TemplateView();
    this.openTemplateDialog();
  }

  openTemplateDialog() {
    const dialogref = this._templateActionDialog.open(TemplateSaveComponent, {
      disableClose: true,
      data: {
        Template: this.templateModel,
        IsEmail: this.templateModel.TemplateTypeID === this.templateType.Email,
        IsSMS: this.templateModel.TemplateTypeID === this.templateType.SMS,
        IsNotification: this.templateModel.TemplateTypeID === this.templateType.Notification
      }
    });

    dialogref.componentInstance.templateSaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this.resetTemplateSearch();
      }
    })
  }

  changeSorting(sortIndex: number) {
    this.sortIndex = sortIndex;
    if (sortIndex == 1) {
      this.isPositionOrderASC = undefined;
      if (this.sortOrder == this.sortOrder_ASC) {
        this.sortOrder = this.sortOrder_DESC;
        this.templateSearchParameter.SortOrder = this.sortOrder;
        this.isTemplateTitile = false;
        this.getTemplates();
      }
      else {
        this.sortOrder = this.sortOrder_ASC;
        this.templateSearchParameter.SortOrder = this.sortOrder;
        this.getTemplates();
        this.isTemplateTitile = true;
      }
    }

    if (sortIndex == 2) {
      this.isTemplateTitile = undefined;
      if (this.postionSortOrder == this.sortOrder_ASC) {
        this.isPositionOrderASC = true;
        this.sortOrder = this.sortOrder_ASC;
        this.templateSearchParameter.SortOrder = this.sortOrder;
        this.getTemplates();
        this.postionSortOrder = this.sortOrder_DESC;
      }
      else {

        this.sortOrder = this.sortOrder_DESC;
        this.templateSearchParameter.SortOrder = this.sortOrder;
        this.getTemplates();
        this.isPositionOrderASC = false;
        this.postionSortOrder = this.sortOrder_ASC;
      }
    }
  }


  onEditTemplate(templateTextId: number, moduleID: number, typeID: number) {
    let url = TemplateApi.getTemplateById.replace("{templateTextID}", templateTextId.toString())
      .replace("{moduleID}", moduleID.toString())
      .replace("{templateTypeID}", typeID.toString());

    this._httpService.get(url)
      .subscribe(data => {
        this.templateModel = data.Result;
        this.openTemplateDialog();
      }
      );
  }

  // #endregion

  // #region Methods

  getTemplateSearchfundamentals() {
    this._httpService.get(TemplateApi.searchFundamentals)
      .subscribe(data => {
        this.templateSearchfundamentals = data.Result;
        this.templateTypeList = data.Result.TemplateTypeList;
        this.statusList = data.Result.StatusList;
        this.moduleList = data.Result.ModuleList
        this.setDefaultDrowdown();
      })
  }

  reciviedPagination(pagination: boolean) {
    if (pagination)
      this.getTemplates();
  }

  templatefSearch() {
    this.genralTempSearchParams.TemplateTextTitle = this.templateSearchParameter.TemplateTextTitle;
    this.genralTempSearchParams.ModuleID = this.templateSearchParameter.ModuleID;
    this.genralTempSearchParams.TemplateTypeID = this.templateSearchParameter.TemplateTypeID;
    this.genralTempSearchParams.IsActive = this.templateSearchParameter.IsActive;
    this.appPagination.paginator.pageIndex = 0;
    this.appPagination.pageNumber = 1;
    this.getTemplates();

  }

  getTemplates() {

    let params = {
      templateTextTitle: this.genralTempSearchParams.TemplateTextTitle,
      moduleID: this.genralTempSearchParams.ModuleID,
      templateTypeID: this.genralTempSearchParams.TemplateTypeID,
      isActive: this.genralTempSearchParams.IsActive ? true : false,
      pageNumber: this.appPagination.pageNumber,
      pageSize: this.appPagination.paginator.pageSize,
      sortIndex: this.templateSearchParameter.SortIndex,
      sortOrder: this.templateSearchParameter.SortOrder
    }

    this._httpService.get(TemplateApi.getAll, params)
      .subscribe(data => {
        if(data && data.MessageCode > 0){
        this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
        if (this.isDataExists) {
          if (data.Result.length > 0) {
            this.appPagination.totalRecords = data.TotalRecord;
          }
          else {
            this.appPagination.totalRecords = 0;
          }
          this.isSearchByPageIndex = false;
          this.templateGridObj = data.Result;

        } else {
          this.appPagination.totalRecords = 0;
        }
      }else{
        this._messageService.showErrorMessage(data.MessageText);
      }
      });
  }



  resetTemplateSearch() {
    this.genralTempSearchParams = new TemplateSearchParameter();
    this.templateSearchParameter.TemplateTextTitle = "";
    this.templateSearchParameter.ModuleID = 0;
    this.templateSearchParameter.TemplateTypeID = 0;
    this.templateSearchParameter.IsActive = 1;
    this.appPagination.resetPagination();
    this.getTemplates();
  }

  deleteTemplate(templateTextId: number, moduleID: number, typeID: number) {
    let url = TemplateApi.deleteTemplate.replace("{templateTextID}", templateTextId.toString())
      .replace("{moduleID}", moduleID.toString())
      .replace("{templateTypeID}", typeID.toString())

    const deleteDialogRef = this._templateActionDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.delete(url)
          .subscribe((res: any) => {
            if (res && res.MessageCode > 0) {
              this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Template"));
              this.resetTemplateSearch();
            } else {
              this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Template"));
            }
          },
            err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Template")); }
          );
      }
    })
  }

  setDefaultDrowdown() {
    this.templateTypeList.splice(0, 0, { TemplateTypeID: 0, TemplateTypeName: "All", IsActive: true });
    this.moduleList.splice(0, 0, { ModuleID: 0, ModuleName: "All", IsActive: true });
  }

  // #endregion
}