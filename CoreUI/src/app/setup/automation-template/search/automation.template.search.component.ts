/********************* Angular References ********************/
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

/********************* Material Reference ********************/
import { MatPaginator } from '@angular/material/paginator';

/********************* Services & Models ********************/
/* Services */
import { AuthService } from '@app/helper/app.auth.service';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';

/* Models*/
import { AutomationTemplateFundamental, AutomationTemplateSearchParameter } from '@app/setup/models/automation.tempalte.model';
/********************** Common ***************************/
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
/********************** Components *********************************/
import { AutomationTemplateSaveComponent } from '@setup/automation-template/save/automation.template.save.component';
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { AutomationTemplateApi } from '@app/helper/config/app.webapi';
import { Configurations } from '@app/helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { ViewComponent } from '../view/view.component';




@Component({
  selector: 'app-automation-template',
  templateUrl: './automation.template.search.component.html'
})
export class AutomationTemplateSearchComponent implements OnInit, AfterViewInit {

  // #region Local Members

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("appPagination") appPagination: AppPaginationComponent;

  isSaveTemplateAllowed: boolean = false;
  isDataExist: boolean = true;

  /* Models Refences */
  fundamentals: AutomationTemplateFundamental = new AutomationTemplateFundamental();
  searchAutomationTemplate: AutomationTemplateSearchParameter = new AutomationTemplateSearchParameter();
  searchAutomationTemplateParams: AutomationTemplateSearchParameter = new AutomationTemplateSearchParameter();
  contactTypeList: any;
  triggerCategoryList: any;
  templateTypeList: any;
  templateList: any = [];

  statusTypeList: any;

  /* Pagination */
  // totalRecords: number = 0;
  // defaultPageSize = Configurations.DefaultPageSize;
  // pageSizeOptions = Configurations.PageSizeOptions;
  // pageNumber: number = 1;
  // pageIndex: number = 0;
  sortIndex: number = 1;
  sortOrder_ASC = Configurations.SortOrder_ASC;
  sortOrder_DESC = Configurations.SortOrder_DESC;
  sortOrder: string;
  postionSortOrder: string;
  isPositionOrderASC: boolean = undefined;
  isDataExists: boolean = false;
  isTemplateTitile: boolean = true;

  /* Messages */
  messages = Messages;  // #endregion

  constructor(
    private _authService: AuthService,
    private _httpService: HttpService,
    private _templateActionDialog: MatDialogService,
    private _messageService: MessageService,
    
  ) { }

  ngOnInit() {
    this.isSaveTemplateAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Automation_Template_Save);
    this.getSearchFundamentals();
  }

  ngAfterViewInit() {
    this.getAutomationTemplates();
  }
  // #region Events */



  onTitleUpdated() {
    this.searchAutomationTemplate.TemplateTextTitle = this.searchAutomationTemplate.TemplateTextTitle.trim();
  }

  openSaveTemplateDialog(automationTemplateID: number, isCopy: boolean) {
    var data = {
      AutomationTemplateID: automationTemplateID,
      IsCopy: isCopy
    }
    const dialogRef = this._templateActionDialog.open(AutomationTemplateSaveComponent, {
      disableClose: true,
      data: data
    });

    dialogRef.componentInstance.isSaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this.getAutomationTemplates();
      }
    });
  }

  // #endregion

  // #region Methods

  reciviedPagination(pagination: boolean) {
    if (pagination)
      this.getAutomationTemplates();
  }

  onSearchform() {
    this.searchAutomationTemplateParams.TemplateTextTitle = this.searchAutomationTemplate.TemplateTextTitle != "" ? this.searchAutomationTemplate.TemplateTextTitle : "";
    this.searchAutomationTemplateParams.EventCategoryTypeID = this.searchAutomationTemplate.EventCategoryTypeID > 0 ? this.searchAutomationTemplate.EventCategoryTypeID : null;
    this.searchAutomationTemplateParams.IsCustomer = this.searchAutomationTemplate.IsCustomer;
    this.searchAutomationTemplateParams.CommunicationTypeID = this.searchAutomationTemplate.CommunicationTypeID > 0 ? this.searchAutomationTemplate.CommunicationTypeID : null;
    this.searchAutomationTemplateParams.IsActive = this.searchAutomationTemplate.IsActive;
    this.appPagination.paginator.pageIndex = 0;
    this.appPagination.pageNumber = 1;
    this.getAutomationTemplates();
  }

  getAutomationTemplates() {

    let param = {
      templateTextTitle: this.searchAutomationTemplateParams.TemplateTextTitle != "" ? this.searchAutomationTemplateParams.TemplateTextTitle : "",
      eventCategoryTypeID: this.searchAutomationTemplateParams.EventCategoryTypeID > 0 ? this.searchAutomationTemplateParams.EventCategoryTypeID : null,
      isCustomer: this.searchAutomationTemplateParams.IsCustomer,
      communicationTypeID: this.searchAutomationTemplateParams.CommunicationTypeID > 0 ? this.searchAutomationTemplateParams.CommunicationTypeID : null,
      isActive: this.searchAutomationTemplateParams.IsActive ? true : false,
      pageNumber: this.appPagination.pageNumber,
      pageSize: this.appPagination.pageSize,
      isFixed: this.searchAutomationTemplate.IsFixed,
    }
    this._httpService.get(AutomationTemplateApi.getAutomationTemplates, param).subscribe(data => {
      if(data && data.MessageCode > 0){
      this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
      if (this.isDataExists) {
        if (data.Result.length > 0) {
          this.appPagination.totalRecords = data.TotalRecord;
        }
        else {
          this.appPagination.totalRecords = 0;
        }
        this.templateList = data.Result;

      } else {
        this.appPagination.totalRecords = 0;
      }
    }else{
      this._messageService.showErrorMessage(data.MessageText);
    }
    });

  }

  resetForm() {
    this.searchAutomationTemplateParams = new AutomationTemplateSearchParameter();
    this.searchAutomationTemplate.EventCategoryTypeID = 0;
    this.searchAutomationTemplate.AudienceTypeID = 0;
    this.searchAutomationTemplate.CommunicationTypeID = 0;
    this.searchAutomationTemplate.TemplateTextTitle = "";
    this.searchAutomationTemplate.IsCustomer = null;
    this.searchAutomationTemplate.IsActive = 1;
    this.searchAutomationTemplate.IsFixed = null;
    this.appPagination.resetPagination();
    this.getAutomationTemplates();
  }

  getSearchFundamentals() {
    this._httpService.get(AutomationTemplateApi.getSearchFundamentals)
      .subscribe(data => {
        if (data && data.MessageCode > 0) {
          this.fundamentals = data.Result;
          this.contactTypeList = this.fundamentals.AudienceType;
          this.triggerCategoryList = this.fundamentals.EventCategoryType;
          this.templateTypeList = this.fundamentals.CommunicationType;
          this.statusTypeList = this.fundamentals.StatusList;
          this.setDefaultDrowdown();
        } else {
          this._messageService.showErrorMessage(data.MessageText);
        }
      });
  }

  deleteAutomationTemplate(templateTextId: number) {
    const deleteDialogRef = this._templateActionDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.delete(AutomationTemplateApi.delete + templateTextId)
          .subscribe((res: any) => {
            if (res && res.MessageCode > 0) {
              this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Automation Template"));
              this.getAutomationTemplates();
              //this.resetForm();
            } else if (res && res.MessageCode === -177) {
              this._messageService.showErrorMessage(res.MessageText);
            } else {
              this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Automation Template"));
            }
          },
            err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Automation Template")); }
          );
      }
    })
  }

  setDefaultDrowdown() {
    this.contactTypeList.splice(0, 0, { AudienceTypeID: 0, AudienceTypeName: "All", IsActive: true });
    this.triggerCategoryList.splice(0, 0, { EventCategoryTypeID: 0, EventCategoryTypeName: "All", IsActive: true });
    this.templateTypeList.splice(0, 0, { CommunicationTypeID: 0, CommunicationTypeName: "All", IsActive: true });
  }

  onOpenDialog(id: number){
    this._templateActionDialog.open(ViewComponent,
      {
        data: id
      });
  }
  // #endregion
}
