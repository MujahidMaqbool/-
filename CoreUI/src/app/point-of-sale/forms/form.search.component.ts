/********************* Angular References ********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatPaginator } from '@angular/material/paginator';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { ActivatedRoute } from '@angular/router';
import { CustomerFormApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse, AllPerson } from 'src/app/models/common.model';
import { CustomerFormModel, CustomerFormSearchModel, CustomFormView, CustomerFormsInfromation } from 'src/app/models/customer.form.model';
import { Messages } from 'src/app/helper/config/app.messages';
import { DateToDateFromComponent } from 'src/app/application-dialog-module/dateto_datefrom/dateto.datefrom.component';
import { ViewFormComponent } from 'src/app/shared/components/forms/view/view.form.component';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { Configurations } from 'src/app/helper/config/app.config';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { ENU_DateFormatName ,ENU_pdfFor } from 'src/app/helper/config/app.enums';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_PointOfSale, ENU_Permission_Module  } from 'src/app/helper/config/app.module.page.enums';

/********************** Services & Model *********************/

@Component({
    selector: 'search-form',
    templateUrl: './form.search.component.html'
})
export class POSSearchFromComponent extends AbstractGenericComponent implements OnInit {

    customerFormStatus = Configurations.CustomerFormStatus;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;
    // @ViewChild('dateCompoRefForStaffTip') dateCompoRefForStaffTip: DateToDateFromComponent;
    @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
    @ViewChild('bookingRef') bookingRef: DateToDateFromComponent;

    /* Messages */
    messages = Messages;

    /* Local Variables */
    isDataExists: boolean = true;
    dateFormat: string = ""; //Configurations.DateFormat;

    /* Collection Types */
    customerForm: CustomerFormModel[] = [];
    searchPerson: FormControl = new FormControl();
    customerFormSearchModel: CustomerFormSearchModel = new CustomerFormSearchModel;
    customerFormProfile: CustomFormView = new CustomFormView;
    deleteDialogRef: any;
    clearCustomerInput: string = "";
    statusList: any[] = [];
    allPerson: AllPerson[];
    personName: string = "";
    allowedPages = {
        SaveForm : false
    };

    constructor(
        private _FormDialogue: MatDialogService,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _commonService: CommonService,
        private _route: ActivatedRoute,
        public _dataSharingService: DataSharingService,
        private _authService: AuthService
    ) {
        super()
    }

    ngOnInit() {
        
        this.getBranchDatePattern();
        this.customerFormSearchModel.formStatusID = this.customerFormStatus[0].value;
        this.searchPerson.valueChanges
            .pipe(debounceTime(400))
            .subscribe(searchText => {
                if (searchText && searchText !== "" && searchText.length > 2) {
                    if (typeof (searchText) === "string") {
                        this._commonService.searchClient(searchText, 0)
                            .subscribe(
                                response => {
                                    if (response.Result != null && response.Result.length) {
                                        this.allPerson = response.Result;
                                        this.allPerson.forEach(person => {
                                            person.FullName = person.FirstName + " " + person.LastName;
                                        });
                                    }
                                    else {
                                        this.allPerson = [];
                                    }
                                });
                    }
                }
                else {
                    this.allPerson = [];
                }
            });

    }
    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(
          this._dataSharingService,
          ENU_DateFormatName.DateFormat
        );
      }
    ngAfterViewInit() {
        this.bookingRef.setEmptyDateFilter();
        this.getCustomerForm();
        this.allowedPages.SaveForm = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.saveForm);
    }
    getSelectedClient(person: AllPerson) {
        this.customerFormSearchModel.customerID = person.CustomerID;
        this.customerFormSearchModel.customerName = person.FirstName + ' ' + person.LastName;
    }
    reciviedDateTo($event) {
        this.customerFormSearchModel.DateFrom = $event.DateFrom;
        this.customerFormSearchModel.DateTo = $event.DateTo;
    }

    onFromDateChange(date: any) {
        this.customerFormSearchModel.DateFrom = date;
    }

    onToDateChange(date: any) {
        this.customerFormSearchModel.DateTo = date;
    }

    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getCustomerForm();
    }

    displayClientName(user?: AllPerson): string | undefined {
        return user ? user.FirstName + ' ' + user.LastName : undefined;
    }

    onSearchForm() {
        this.customerFormSearchModel.formName = this.customerFormSearchModel.formName != "" ? this.customerFormSearchModel.formName : "";
        this.customerFormSearchModel.formStatusID = this.customerFormSearchModel.formStatusID != null ? this.customerFormSearchModel.formStatusID : null,
            this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getCustomerForm();
    }

    getCustomerForm() {
        let param = {
            customerID: null,
            formName: this.customerFormSearchModel.formName == "" || this.customerFormSearchModel.formName == undefined ? "" : this.customerFormSearchModel.formName,
            customerName: this.customerFormSearchModel.customerName == "" || this.customerFormSearchModel.customerName == undefined ? "" : this.customerFormSearchModel.customerName,
            formStatusID: this.customerFormSearchModel.formStatusID,
            dateFrom: this.customerFormSearchModel.DateFrom == null || this.customerFormSearchModel.DateFrom == undefined ? "" : this.customerFormSearchModel.DateFrom,
            dateTo: this.customerFormSearchModel.DateTo == null || this.customerFormSearchModel.DateTo == undefined ? "" : this.customerFormSearchModel.DateTo,
            pageNumber: this.appPagination.pageNumber,
            pageSize: this.appPagination.pageSize
        }
        this._httpService.get(CustomerFormApi.getAllCustomerForm, param).subscribe(
            (res: ApiResponse) => {
                if (res && res.MessageCode > 0) {
                    this.isDataExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (res && res.Result) {
                        this.customerForm = res.Result;
                        this.appPagination.totalRecords = res.TotalRecord;
                    } else {
                        this.customerForm = [];
                        this.appPagination.totalRecords = 0;
                    }
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
            });
    }

    onViewForm(customerFormId: number) {

        let param = {
            customerFormID: customerFormId
        }

        this._httpService.get(CustomerFormApi.getCustomerFormDetail + customerFormId).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                var formData = this.setFormViewModelValues(res.Result, true);
                this.openFormDailog(formData);
            }
            else{
                this._messageService.showErrorMessage(res.MessageText);
            }
        });
    }

    onEditForm(customerFormId: number) {

        let param = {
            customerFormID: customerFormId
        }

        this._httpService.get(CustomerFormApi.getCustomerFormDetail + customerFormId).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                var formData = this.setFormViewModelValues(res.Result);
                this.openFormDailog(formData);
            } else {
                this._messageService.showErrorMessage(res.MessageText);
            }
        });
    }

    onDeleteForm(customerFormId: number) {
        
        let _url = CustomerFormApi.deleteCustomerForm + customerFormId;

        this.deleteDialogRef = this._FormDialogue.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(_url)
                    .subscribe((res: ApiResponse) => {
                        if (res && res.MessageCode) {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Customer Form"));
                                this.getCustomerForm();
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Customer Form"));
                            }
                        }else{
                            this._messageService.showErrorMessage(res.MessageText);
                        }
                    },
                    );
            }
        })
    }

    openFormDailog(formData) {

        const dialogRef = this._FormDialogue.open(ViewFormComponent, {
            disableClose: true,
            data: formData
        });

        dialogRef.componentInstance.onSubmitForms.subscribe((filledFormData: CustomFormView[]) => {
            this.saveForm(filledFormData[0])
        })

    }

    setFormViewModelValues(formViewModel: any, isView: boolean = false) {

        var savedCustomerForms = new CustomerFormsInfromation();
        savedCustomerForms.CustomFormView = new Array<CustomFormView>();
        savedCustomerForms.CustomFormView.push(formViewModel);
        savedCustomerForms.isViewForm = isView;
        return savedCustomerForms;
    }

    saveForm(filledFormData) {

        let param = {
            CustomerFormID: filledFormData.CustomerFormID,
            CustomerID: filledFormData.CustomerID,
            FormID: filledFormData.FormID,
            JsonText: filledFormData.JsonText,
            FormStatusID: filledFormData.FormStatusID,
            IsSkipped: filledFormData.IsSkipped,
            formName : filledFormData.FormName,

        }

        this._httpService.save(CustomerFormApi.saveCustomerForm, param).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Customer Form"));
                this.getCustomerForm();
            }else{
                this._messageService.showErrorMessage(res.MessageText);
            }
        });
    }

    resetSearchFilter() {
        this.customerFormSearchModel.formName = "";
        this.clearCustomerInput = "";
        this.customerFormSearchModel.customerName = "";
        this.customerFormSearchModel.formStatusID = 0;
        this.appPagination.resetPagination();
        this.bookingRef.setEmptyDateFilter();
        this.getCustomerForm();
    }
    openPDF(customerFormID) {
        window.open("/pdf/form/"+customerFormID+"/"+ENU_pdfFor.Client);
    }
}
