/********************* Angular References ********************/
import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { AuthService } from '@app/helper/app.auth.service';
import { Messages } from '@app/helper/config/app.messages';
import { FormApi } from '@app/helper/config/app.webapi';
import { CustomFormView, CustomerFormsInfromation } from '@app/models/customer.form.model';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { FormSearchParameters } from '@app/setup/models/custom.form.model';
import { AppPaginationComponent } from '@app/shared-pagination-module/app-pagination/app.pagination.component';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { ViewFormComponent } from '@app/shared/components/forms/view/view.form.component';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { Configurations } from '@app/helper/config/app.config';
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { ENU_pdfFor, ENU_DateFormatName } from '@app/helper/config/app.enums';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { DataSharingService } from '@app/services/data.sharing.service';

/********************** Services & Model *********************/

@Component({
    selector: 'form-search',
    templateUrl: './search.form.component.html'
})
export class FormSearchComponent extends AbstractGenericComponent implements  OnInit, AfterViewInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;

    parentFormSearchParam = new FormSearchParameters();
    customFormStatus = Configurations.CustomFormStatus;
    formSerarchParameters: FormSearchParameters = new FormSearchParameters();
    formsList: any[] = [];
    messages = Messages;

    dateFormat: string = ""; //Configurations.DateFormat;

    /* Model References */
    viewFormModel = new CustomFormView();
    // Collection
    deleteDialogRef: any;
    // Local Variables
    //TotalRecord: number = 0;
    isDataExists: boolean = false;
    isSaveClass: boolean = false;
    allowedPages = {
        saveForm: false
    };

    constructor(
        private _dialog: MatDialogService,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _authService: AuthService,
    ) { super();   }

    ngOnInit() {
        this.getBranchDatePattern();
        // this.isSaveClass = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Class_Save);
    }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.setDefaultValues();
        this.allowedPages.saveForm = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Form_Save);
    }

    ngAfterViewInit() {
        this.getCustomForms();
    }
    setDefaultValues() {
        this.parentFormSearchParam.formName = "";
        this.parentFormSearchParam.isActive = this.customFormStatus[1].value;;
    }

    onSearchForm() {
        this.formSerarchParameters.formName = this.parentFormSearchParam.formName != null ? this.parentFormSearchParam.formName : "";
        this.formSerarchParameters.isActive = this.parentFormSearchParam.isActive,
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getCustomForms();
    }

    onResetForm() {
        this.parentFormSearchParam = new FormSearchParameters(); 
        this.formSerarchParameters = new FormSearchParameters();
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getCustomForms();
    }

    public getCustomForms() {
        let param = {
            formName: this.formSerarchParameters.formName != null ? this.formSerarchParameters.formName : "",
            isActive: this.formSerarchParameters.isActive,
            pageNumber: this.appPagination.pageNumber,
            pageSize: this.appPagination.pageSize,
            // pageSize: this.paginator.pageSize == undefined ? this.pageSize : this.paginator.pageSize,
        }
        this._httpService.get(FormApi.getCustomForms, param).subscribe(data => {
            if (data && data.MessageCode > 0) {
                this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    this.formsList = data.Result;
                    this.appPagination.totalRecords = data.TotalRecord;
                } else {
                    this.formsList = [];
                    this.appPagination.totalRecords = 0;
                }
            }else{
                this._messageService.showErrorMessage(data.MessageText);
            }
        });
    }

    deleteForm(formID: any) {
        this.deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.get(FormApi.deleteCustomForm + formID)
                    .subscribe((res: any) => {
                        if (res && res.MessageCode) {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Form"));
                                this.getCustomForms();
                            }
                            else if (res && res.MessageCode <= 0) {
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Form"));
                            }
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Form")); }
                    );
            }
        })
    }

    viewForm(formID: any) {
        this._httpService.get(FormApi.viewCustomForm + formID)
            .subscribe((res: any) => {
                if (res && res.MessageCode > 0) {

                    var savedCustomerForms = new CustomerFormsInfromation();
                    savedCustomerForms.CustomFormView = new Array<CustomFormView>();
                    savedCustomerForms.CustomFormView.push(res.Result);
                    savedCustomerForms.isViewForm = true;

                    this._dialog.open(ViewFormComponent, {
                        disableClose: true,
                        data: savedCustomerForms
                    });
                }else{
                    this._messageService.showErrorMessage(res.MessageText);
                }
            })
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getCustomForms();
    }
       /**open pdf in new tab */
       openPDF(customerFormID) {
        window.open("/pdf/form/"+customerFormID+"/"+ENU_pdfFor.Setup);
    }
}
