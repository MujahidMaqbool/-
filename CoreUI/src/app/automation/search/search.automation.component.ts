/************************* Angular References ***********************************/
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

/********************* Material Reference ********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** Components *********************************/
import { AutomationRuleApi } from 'src/app/helper/config/app.webapi';
import { AutomationSearch, AutomationSearchParameter, Audience, AutomationSearchParameters } from 'src/app/automation/models/automation.search.model';
import { HttpService } from 'src/app/services/app.http.service';
import { Configurations } from 'src/app/helper/config/app.config';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Automation } from 'src/app/helper/config/app.module.page.enums';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { ApiResponse } from 'src/app/models/common.model';


@Component({
    selector: 'search-automation',
    templateUrl: './search.automation.component.html'
})

export class SearchAutomationComponent extends AbstractGenericComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;

    // #region Local Members
    isSaveAutomationAllowed: boolean = false;


    /* Models Refences */
    fundamentals: AutomationSearch = new AutomationSearch();
    automationSearchParameter: AutomationSearchParameter = new AutomationSearchParameter();
    automationSearchFilterParameters = new AutomationSearchParameters();
    triggerCategoryList: any;
    eventTypeList: any = [];
    audienceTypeList: any;
    audienceTypes: any;
    statusTypeList: any;
    automationList: any = [];
    /***********Dialog Reference*********/
    deleteDialogRef: any;
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
    isSearchByPageIndex: boolean = false;
    dateFormat: string = ""; //Configurations.DateFormat;
    /***********Messages*********/
    messages = Messages;

    constructor(
        private _router: Router,
        private _httpService: HttpService,
        private _actionDialogue: MatDialogService,
        private _messageService: MessageService,
        private _authService: AuthService,
        private _dataSharingService: DataSharingService
    ) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
        this.isSaveAutomationAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Automation, ENU_Permission_Automation.AutomationSave);
        this.getSearchFundamentals();
    }
    ngAfterViewInit() {
        this.getAutomationSearchList();
    }
    // #region Events */

    //30
    onAddEditAutomation(automationID: number) {
        this._router.navigate(['/automation/details', automationID]);
    }

    onTitleUpdated() {
        this.automationSearchParameter.RuleName = this.automationSearchParameter.RuleName.trim();
    }


    onChangeEventCategoryType(eventCategoryTypeID: number) {
        this.onSetEventTypes(eventCategoryTypeID);
    }

    onSetEventTypes(eventCategoryTypeID: number) {
        if (eventCategoryTypeID > 0) {
            this.eventTypeList = this.fundamentals.EventType.filter(x => x.EventCategoryTypeID == eventCategoryTypeID);
            this.eventTypeList.splice(0, 0, { EventTypeID: 0, EventTypeName: "All", IsActive: true });
        } else {
            this.eventTypeList = this.fundamentals.EventType;
            this.automationSearchParameter.EventTypeID = 0;
        }
    }

    onChangeEventType(eventTypeID: number) {
        var result = this.fundamentals.EventType.find(x => x.EventTypeID == eventTypeID);
        if (eventTypeID > 0) {
            this.automationSearchParameter.EventCategoryTypeID = result.EventCategoryTypeID;
            this.onSetEventTypes(this.automationSearchParameter.EventCategoryTypeID);
        }

    }

    onDeleteAutomationRule(automationID: number) {
        this.deleteDialogRef = this._actionDialogue.open(DeleteConfirmationComponent, { disableClose: true ,  data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(AutomationRuleApi.deleteAutomationRule.replace("{ruleID}", automationID.toString()))
                    .subscribe((res: ApiResponse) => {
                        if (res && res.MessageCode) {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Automation Rule"));
                                this.getAutomationSearchList();
                            }
                            else if (res && res.MessageCode <= 0) {
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Automation Rule"));
                            }
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Automation Rule")); }
                    );
            }
        })
    }

    // #endregion

    // #region Methods

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getAutomationSearchList();
    }

    onSearchForm() {
        this.automationSearchFilterParameters = new AutomationSearchParameters();
        this.automationSearchFilterParameters.EventCategoryTypeID = this.automationSearchParameter.EventCategoryTypeID > 0 ? this.automationSearchParameter.EventCategoryTypeID : null;
        this.automationSearchFilterParameters.EventTypeID = this.automationSearchParameter.EventTypeID > 0 ? this.automationSearchParameter.EventTypeID : null;
        this.automationSearchFilterParameters.RuleName = this.automationSearchParameter.RuleName != "" ? this.automationSearchParameter.RuleName : "";
        this.automationSearchFilterParameters.AudienceTypeID = this.automationSearchParameter.AudienceTypeID > 0 ? this.automationSearchParameter.AudienceTypeID : null;
        this.automationSearchFilterParameters.IsActive = this.automationSearchParameter.IsActive ? true : false;
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;

        this.getAutomationSearchList();
    }

    getAutomationSearchList() {

        this.automationSearchFilterParameters.PageNumber = this.appPagination.pageNumber;
        this.automationSearchFilterParameters.PageSize = this.appPagination.pageSize;
        this.automationSearchFilterParameters.SortIndex = this.automationSearchParameter.SortIndex,
        this.automationSearchFilterParameters.SortOrder = this.automationSearchParameter.SortOrder

        this._httpService.get(AutomationRuleApi.getAllAutomationRule, this.automationSearchFilterParameters)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0){
                this.isDataExists = res.Result != null && res.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    if (res.Result.length > 0) {
                        this.appPagination.totalRecords = res.TotalRecord;
                    }
                    else {
                        this.appPagination.totalRecords = 0;
                    }
                    this.isSearchByPageIndex = false;
                    this.automationList = res.Result;

                } else {
                    this.appPagination.totalRecords = 0;
                }
            }else{
                this._messageService.showErrorMessage(res.MessageText);
            }
                
            });

    }

    resetForm() {
        this.automationSearchFilterParameters = new AutomationSearchParameters();
        this.automationSearchParameter.EventCategoryTypeID = 0;
        this.automationSearchParameter.AudienceTypeID = 0;
        this.automationSearchParameter.EventTypeID = 0;
        this.automationSearchParameter.RuleName = "";
        this.automationSearchParameter.IsActive = 1;
        this.appPagination.resetPagination();
        this.onSetEventTypes(this.automationSearchParameter.EventCategoryTypeID);
        this.getAutomationSearchList();
    }

    getTriggerCategoryName(eventCategoryTypeID){
        return eventCategoryTypeID > 0 ? "(" + this.fundamentals.EventCategoryType.find(x => x.EventCategoryTypeID == eventCategoryTypeID).EventCategoryTypeName + ")" : "";
    }

    getSearchFundamentals() {
        this._httpService.get(AutomationRuleApi.getFundamentals)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0){
                this.fundamentals = res.Result;
                this.triggerCategoryList = this.fundamentals.EventCategoryType;
                this.eventTypeList = this.fundamentals.EventType;
                this.audienceTypes = this.fundamentals.RuleAudience;
                this.audienceTypeList = [];

                // add customer data in audience type list
                this.audienceTypes.RuleCustomerAudience.forEach(rca => {
                    this.audienceTypeList.push({ AudienceTypeID: rca.AudienceTypeID, AudienceTypeName: rca.AudienceTypeName });
                });

                // add staff data in audience type list
                this.audienceTypes.RuleStaffAudience.forEach(rsa => {
                    this.audienceTypeList.push({ AudienceTypeID: rsa.AudienceTypeID, AudienceTypeName: rsa.AudienceTypeName });
                });

                this.statusTypeList = this.fundamentals.StatusList;
                this.setDefaultDrowdown();
            }else{
                this._messageService.showErrorMessage(res.MessageText);
            }
            });

    }

    setDefaultDrowdown() {
        this.audienceTypeList.splice(0, 0, { AudienceTypeID: 0, AudienceTypeName: "All", IsActive: true });
        this.triggerCategoryList.splice(0, 0, { EventCategoryTypeID: 0, EventCategoryTypeName: "All", IsActive: true });
        this.eventTypeList.splice(0, 0, { EventCategoryTypeID: 0, EventTypeID: 0, EventTypeName: "All", IsActive: true });
    }

    // #endregion

}  