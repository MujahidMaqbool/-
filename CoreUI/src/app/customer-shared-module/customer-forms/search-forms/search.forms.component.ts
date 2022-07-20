/********************* Angular References ********************/
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
/***************** Component ******************/
import { EmailFormComponent } from '../email/email.form.component';// will be implement later
import { SmsFormComponent } from '../sms/sms.form.component';// will be implement later
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
/************* Services & Models ***************/
/** Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
/** Models*/
import { ApiResponse, PersonInfo } from 'src/app/models/common.model';
import { CustomerFormSearchModel, CustomerFormModel, CustomFormView, CustomerFormsInfromation } from 'src/app/models/customer.form.model';
/********************** Common ***************************/
import { Messages } from 'src/app/helper/config/app.messages';
/********* Material References *********** */
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
/********* Configurations *********** */
import { SubscriptionLike as ISubscription } from 'rxjs';
import { CustomerFormApi } from 'src/app/helper/config/app.webapi';
import { Configurations } from 'src/app/helper/config/app.config'
import { ActivatedRoute } from '@angular/router';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { CustomFormStatus, CustomerType, ENU_DateFormatName, ENU_pdfFor } from 'src/app/helper/config/app.enums';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember, ENU_Permission_Lead } from 'src/app/helper/config/app.module.page.enums';
/********* Import components *********** */
import { SaveFormsComponent } from 'src/app/shared/components/forms/save-forms/save.forms.component';
import { ViewFormComponent } from 'src/app/shared/components/forms/view/view.form.component';

@Component({
    selector: 'search-forms',
    templateUrl: 'search.forms.component.html',
})
export class SearchFormsComponent extends AbstractGenericComponent implements OnInit {

    /**Angular refences */
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;


    /* Local Variables */
    customerID: string;
    staffID: string;
    customerType: number;
    isDataExists: boolean = true;
    showPDFData: boolean = false;
    sortOrder_ASC = Configurations.SortOrder_ASC;
    sortOrder_DESC = Configurations.SortOrder_DESC;
    sortOrder: string;
    allowedPages = {
        isSaveFormAllow: false,
    };

    /* Messages */
    messages = Messages;

    /* Collection & Models Types */
    // personInfo: PersonInfo;
    customerForm: CustomerFormModel[] = [];
    customeFormViewModel: CustomFormView = new CustomFormView();

    customerFormSearchModel: CustomerFormSearchModel = new CustomerFormSearchModel;
    deleteDialogRef: any;

    /************* Configurations ***************/
    customerIdSubscripiton: ISubscription;
    enuFormTypes = CustomFormStatus;
    dateFormat: string = ""; //Configurations.DateFormat;
    customerFormStatus = Configurations.CustomerFormStatus;
    customerFormProfile: CustomFormView = new CustomFormView;
    shouldGetPersonInfo: boolean;

    constructor(
        private _FormDialogue: MatDialogService,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _route: ActivatedRoute,
        public _dataSharingService: DataSharingService,
        private _authService: AuthService,
        private cdr: ChangeDetectorRef,
    ) {
        super()
    }

    //#region Angular hooks
    ngOnInit() {
    }

    ngAfterViewInit() {
        this.getBranchDatePattern();
        this.customerFormSearchModel.formStatusID = this.customerFormStatus[0].value;
        this.getCustomerIdFromRoute();
        this.setPermissions();
        this.getCustomerByID();
        this.getCustomerForm();
        this.cdr.detectChanges();

    }

    ngOnDestroy() {
        this.customerIdSubscripiton.unsubscribe();
    }
    //#endregion

    //#region Events
    /**set parametes on manually search  */
    onSearchForm() {
        this.customerFormSearchModel.formName = this.customerFormSearchModel.formName != "" ? this.customerFormSearchModel.formName : "";
        this.customerFormSearchModel.formStatusID = this.customerFormSearchModel.formStatusID != null ? this.customerFormSearchModel.formStatusID : null,
            this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getCustomerForm();
    }

    /**open dialog for add new form and share customer id over the app , and refres form grid after saved successfully */
    onAddForm() {
        const dialogRef = this._FormDialogue.open(SaveFormsComponent, {
            disableClose: true,
            data: {
                CustomerID: this.customerID
            }
        });

        dialogRef.componentInstance.isConfirm.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                dialogRef.close();
                this._dataSharingService.shareFormsCountForCustomerNavigation(Number(this.customerID));
                this.getCustomerForm();
            }
        });
    }

    /**get  form by customer id and open form view popup */
    onViewForm(customerFormId: number) {

        this._httpService.get(CustomerFormApi.getCustomerFormDetail + customerFormId).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                var formData = this.setFormViewModelValues(res.Result, true);
                this.openFormDailog(formData);
            } else {
                this._messageService.showErrorMessage(res.MessageText);
            }
        });
    }

    /**get  form by customer id and open form edit popup */
    onEditForm(customerFormId: number) {
        
        this._httpService.get(CustomerFormApi.getCustomerFormDetail + customerFormId).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                var formData = this.setFormViewModelValues(res.Result);
                this.openFormDailog(formData);
            } else {
                this._messageService.showErrorMessage(res.MessageText);
            }
        });
    }

    /**delete forms */
    onDeleteForm(customerFormId: number) {
        let _url = CustomerFormApi.deleteCustomerForm + customerFormId;
        this.deleteDialogRef = this._FormDialogue.open(DeleteConfirmationComponent, { disableClose: true, data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", ""), description: this.messages.Delete_Messages.Del_Msg_Undone } });
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(_url)
                    .subscribe((res: ApiResponse) => {
                        if (res && res.MessageCode) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Customer Form"));
                                this._dataSharingService.shareFormsCountForCustomerNavigation(Number(this.customerID));
                                this.getCustomerForm();
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Customer Form"));
                            }
                    },
                    );
            }
        })
    }



    /**open pdf in new tab */
    openPDF(customerFormID) {
        window.open("/pdf/form/" + customerFormID + "/" + ENU_pdfFor.Client);
    }
    changeSorting(sortIndex: number) {
        this.customerFormSearchModel.SortIndex = sortIndex;
        if (sortIndex == 1) {
            if (this.sortOrder == this.sortOrder_ASC) {
                this.sortOrder = this.sortOrder_DESC;
                this.customerFormSearchModel.SortOrder = this.sortOrder;
                this.getCustomerForm();
            } else {
                this.sortOrder = this.sortOrder_ASC;
                this.customerFormSearchModel.SortOrder = this.sortOrder;
                this.getCustomerForm();
            }
        }
        if (sortIndex == 2) {
            if (this.sortOrder == this.sortOrder_ASC) {
                this.sortOrder = this.sortOrder_DESC;
                this.customerFormSearchModel.SortOrder = this.sortOrder;
                this.getCustomerForm();
            } else {
                this.sortOrder = this.sortOrder_ASC;
                this.customerFormSearchModel.SortOrder = this.sortOrder;
                this.getCustomerForm();
            }
        }
        if (sortIndex == 3) {
            if (this.sortOrder == this.sortOrder_ASC) {
                this.sortOrder = this.sortOrder_DESC;
                this.customerFormSearchModel.SortOrder = this.sortOrder;
                this.getCustomerForm();
            } else {
                this.sortOrder = this.sortOrder_ASC;
                this.customerFormSearchModel.SortOrder = this.sortOrder;
                this.getCustomerForm();
            }
        }

    }
    //#endregion

    //#region Methods
    /**get branch date apttern */
    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(
            this._dataSharingService,
            ENU_DateFormatName.LongDateFormat
        );
    }

    /**set permissions for add , edit and view button */
    setPermissions() {
        if (this.customerType == CustomerType.Member) {
            this.allowedPages.isSaveFormAllow = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.SaveForm);
        }
        if (this.customerType == CustomerType.Client) {
            this.allowedPages.isSaveFormAllow = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.SaveForm);
        }
        if (this.customerType == CustomerType.Lead) {
            this.allowedPages.isSaveFormAllow = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.SaveForm);
        }
    }

    /**Get customer personal info*/
    getCustomerByID() {
        this.customerIdSubscripiton = this._dataSharingService.customerID.subscribe((customerId: number) => {
            if (customerId && customerId > 0) {
                this.shouldGetPersonInfo = true;
            }
        })
    }

    /**Get customer from rout*/
    getCustomerIdFromRoute() {
        this.customerID = this._route.parent.snapshot.paramMap.get('ClientID');
        this.customerType = CustomerType.Client;
        if (this.customerID == null || this.customerID == undefined) {
            this.customerID = this._route.parent.snapshot.paramMap.get('LeadID');
            this.customerType = CustomerType.Lead;
        }
        if (this.customerID == null || this.customerID == undefined) {
            this.customerID = this._route.parent.snapshot.paramMap.get('MemberID');
            this.customerType = CustomerType.Member;
        }
    }

    /**Paginations */
    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getCustomerForm();
    }

    /**Get All customer formsand shared form count */
    getCustomerForm() {
       
        this.customerFormSearchModel.customerID = Number(this.customerID),
            this.customerFormSearchModel.formName = this.customerFormSearchModel.formName == "" || this.customerFormSearchModel.formName == undefined ? "" : this.customerFormSearchModel.formName,
            this.customerFormSearchModel.customerName = "",
            this.customerFormSearchModel.customerTypeID = this.customerType,
            this.customerFormSearchModel.formStatusID = this.customerFormSearchModel.formStatusID,
            this.customerFormSearchModel.DateFrom = "",
            this.customerFormSearchModel.DateTo = "",
            this.customerFormSearchModel.pageNumber = this.appPagination.pageNumber,
            this.customerFormSearchModel.pageSize = this.appPagination.pageSize

        this._httpService.get(CustomerFormApi.getAllCustomerForm, this.customerFormSearchModel).subscribe(
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
                    this._dataSharingService.shareFormsCountForCustomerNavigation(Number(this.customerID));
                }
                else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
            });
    }

    /**reset all search parameters */
    resetSearchFilter() {
        this.customerFormSearchModel.formName = "";
        this.customerFormSearchModel.formStatusID = 0;
        this.appPagination.resetPagination();
        this.getCustomerForm();
    }

    /**here is save form method */
    saveForm(filledFormData) {

        let param = {
            CustomerFormID: filledFormData.CustomerFormID,
            CustomerID: filledFormData.CustomerID,
            FormID: filledFormData.FormID,
            JsonText: filledFormData.JsonText,
            FormStatusID: filledFormData.FormStatusID,
            formName: filledFormData.FormName,
            IsSkipped: filledFormData.IsSkipped,
        }

        this._httpService.save(CustomerFormApi.saveCustomerForm, param).subscribe((res: ApiResponse) => {
            if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Customer Form"));
                this._dataSharingService.shareFormsCountForCustomerNavigation(Number(this.customerID));
                this.getCustomerForm();
            } else {
                this._messageService.showErrorMessage(res.MessageText);
            }
        });
    }

    /**set form view model */
    setFormViewModelValues(formViewModel: any, isView: boolean = false) {

        var savedCustomerForms = new CustomerFormsInfromation();
        savedCustomerForms.CustomFormView = new Array<CustomFormView>();
        savedCustomerForms.CustomFormView.push(formViewModel);
        savedCustomerForms.isViewForm = isView;
        return savedCustomerForms;
    }

    //#endregion

    //#region popup
    /**open form dialog and save data to save method */
    openFormDailog(formData) {

        const dialogRef = this._FormDialogue.open(ViewFormComponent, {
            disableClose: true,
            data: formData
        });

        dialogRef.componentInstance.onSubmitForms.subscribe((filledFormData: CustomFormView[]) => {
            this.saveForm(filledFormData[0])
        })

    }

    onEmailForm(customerFormId: any) {
        this.openFormDialog(customerFormId, EmailFormComponent);
    }

    onSmsForm(customerFormId: number) {
        this.openFormDialog(customerFormId, SmsFormComponent);
    }

    openFormDialog(formId, component) {
        this._FormDialogue.open(component, {
            disableClose: true,
            data: {
                CustomerID: this.customerID,
                CustomerTypeID: this.customerType,
                CustomerFormID: formId
            }
        });
    }

}
