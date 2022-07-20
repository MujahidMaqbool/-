/********************* Angular References ********************/
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
/***************** Component ******************/
import { SaveFormsComponent } from 'src/app/shared/components/forms/save-forms/save.forms.component';
import { ViewFormComponent } from 'src/app/shared/components/forms/view/view.form.component';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
/************* Services & Models ***************/
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
/* Models*/
import { ApiResponse, PersonInfo } from 'src/app/models/common.model';
import { CustomerFormSearchModel, CustomerFormModel, CustomFormView, CustomerFormsInfromation } from 'src/app/models/customer.form.model';
/********************** Common ***************************/
import { Messages } from 'src/app/helper/config/app.messages';
/********* Configurations *********** */
import { SubscriptionLike as ISubscription } from 'rxjs';
import { CustomerFormApi, StaffApi } from 'src/app/helper/config/app.webapi';
import { Configurations } from 'src/app/helper/config/app.config'
import { ActivatedRoute } from '@angular/router';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { MatPaginator } from '@angular/material/paginator';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { CustomFormStatus, ENU_DateFormatName } from 'src/app/helper/config/app.enums';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Staff } from 'src/app/helper/config/app.module.page.enums';
import { ENU_pdfFor} from 'src/app/helper/config/app.enums';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
import { EmailFormComponent } from 'src/app/customer-shared-module/customer-forms/email/email.form.component';
import { SmsFormComponent } from 'src/app/customer-shared-module/customer-forms/sms/sms.form.component';

@Component({
    selector: 'staff-forms',
    templateUrl: 'staff.form.component.html',
})
export class StaffFormsComponent extends AbstractGenericComponent implements OnInit, AfterViewInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;

    // #region Configurations
    customerFormStatus = Configurations.CustomerFormStatus;

    /* Local Variables */
    customerID: string;
    staffID: string;
    customerType: number;
    isDataExists: boolean = true;
    allowedPages = {
        saveForms : false
      };

    /* Messages */
    messages = Messages;

    /* Collection Types */
    personInfo: PersonInfo;
    staffForm: CustomerFormModel[] = [];
    staffFormSearchModel: CustomerFormSearchModel = new CustomerFormSearchModel;
    deleteDialogRef: any;

    /************* Configurations ***************/
    staffIdSubscripiton: ISubscription;
    enuFormTypes = CustomFormStatus;
    dateFormatForView: string = Configurations.DateFormat;

    // #endregion

    shouldGetPersonInfo: boolean;

    constructor(
        private _FormDialogue: MatDialogService,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _route: ActivatedRoute,
        public _dataSharingService: DataSharingService,
        private _authService: AuthService,
    ) {
        super();
    }

    ngOnInit() {
        this.getBranchDatePattern();
        this.staffFormSearchModel.formStatusID = this.customerFormStatus[0].value;
        this.setPermissions();
    }

    async getBranchDatePattern() {
        this.dateFormatForView = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
    }
    ngOnDestroy() {
        this.staffIdSubscripiton.unsubscribe();
    }

    ngAfterViewInit() {
        this.getStaffFromRoute();
        this.getStaffForm();
        this.getStaffByID();
    }
    setPermissions() {
        this.allowedPages.saveForms = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.SaveForms);
    }


    getStaffByID() {
        this.staffIdSubscripiton = this._dataSharingService.staffID.subscribe((staffId: number) => {
            if (staffId && staffId > 0) {
                //set PersonID and PersonTypeID for personInfo
                this.personInfo = new PersonInfo();
                this.personInfo.PersonID = Number(this.staffID);
                this.shouldGetPersonInfo = true;
            }
        })
    }

    // Get Customer from route
    getStaffFromRoute() {
        if (this.staffID && this.staffID != null || this.staffID == undefined) {
            this.staffID = this._route.parent.snapshot.paramMap.get('StaffID');
        }
    }

    // Pagination
    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getStaffForm();
    }

    onSearchForm() {
        this.staffFormSearchModel.formName = this.staffFormSearchModel.formName != "" ? this.staffFormSearchModel.formName : "";
        this.staffFormSearchModel.formStatusID = this.staffFormSearchModel.formStatusID != null ? this.staffFormSearchModel.formStatusID : null,
            this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getStaffForm();
    }

    // Get Customer Form
    getStaffForm() {

        let param = {
            staffID: Number(this.staffID),
            formName: this.staffFormSearchModel.formName == "" || this.staffFormSearchModel.formName == undefined ? "" : this.staffFormSearchModel.formName,
            formStatusID: this.staffFormSearchModel.formStatusID,
            pageNumber: this.appPagination.pageNumber,
            pageSize: this.appPagination.pageSize
        }
        this._httpService.get(StaffApi.getAllStaffForms, param).subscribe(
            (response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    this.isDataExists = response.Result != null && response.Result.length > 0 ? true : false;
                    if (response && response.Result) {
                        this.staffForm = response.Result;
                        this.appPagination.totalRecords = response.TotalRecord;
                    } else {
                        this.staffForm = [];
                        this.appPagination.totalRecords = 0;
                    }
                }
                else {
                    this._messageService.showErrorMessage(response.MessageText);
                }
            },
            error => {
                this._messageService.showErrorMessage(this.messages.Error.Dropdowns_Load_Error);
            });
    }

    // Reset fileters
    resetSearchFilter() {
        this.staffFormSearchModel.formName = "";
        this.staffFormSearchModel.formStatusID = 0;
        this.appPagination.resetPagination();
        this.getStaffForm();
    }


    // Popup open

    onAddForm() {
        const dialogRef = this._FormDialogue.open(SaveFormsComponent, {
            disableClose: true,
            data: {
                StaffID: this.staffID,
                isStaff : true
            }
        });

        dialogRef.componentInstance.isConfirm.subscribe((isConfirm: boolean) => {
            if (isConfirm) {
                dialogRef.close();
                this._dataSharingService.shareFormsCountForCustomerNavigation(Number(this.staffID));
                this.getStaffForm();
            }
        });
    }

    onViewForm(staffFormId: number) {

        let param = {
            staffFormID: staffFormId
        }

        this._httpService.get(StaffApi.getStaffFormsByID, param).subscribe((response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
                var formData = this.setFormViewModelValues(response.Result, true);
                this.openFormDailog(formData);
            }else{
                this._messageService.showErrorMessage(response.MessageText);
            }
        });
    }

    onEditForm(staffFormId: number) {

        let param = {
            staffFormID: staffFormId
        }

        this._httpService.get(StaffApi.getStaffFormsByID, param).subscribe((response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
                var formData = this.setFormViewModelValues(response.Result);
                this.openFormDailog(formData);
            }
        });
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

    saveForm(filledFormData) {

        let param = {

            JsonText: filledFormData.JsonText,
            FormID: 0,
            StaffID: filledFormData.StaffID,
            StaffFormID : filledFormData.StaffFormID,
            FormStatusID : this.enuFormTypes.Submitted
        }

        this._httpService.save(StaffApi.SaveStaffForms, param).subscribe((response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Staff Form"));
                this.getStaffForm();
            }else{
                this._messageService.showErrorMessage(response.MessageText);
            }
        });
    }

    setFormViewModelValues(formViewModel: any, isView: boolean = false) {

        var savedCustomerForms = new CustomerFormsInfromation();
        savedCustomerForms.CustomFormView = new Array<CustomFormView>();
        savedCustomerForms.CustomFormView.push(formViewModel);
        savedCustomerForms.isViewForm = isView;
        return savedCustomerForms;
    }

    // onEmailForm() {
    //     const dialogRef = this._FormDialogue.open(EmailFormComponent, {
    //         disableClose: true,
    //         data: {
    //             CustomerID: this.staffID,
    //             CustomerTypeID: this.customerType
    //         }
    //     });
    //     dialogRef.componentInstance.onSubmitForms.subscribe((isSubmitForms: boolean) => {
    //         if (isSubmitForms) {
    //             this._FormDialogue.close();
    //         }
    //     })
    // }

    // onSmsForm() {
    //     const dialogRef = this._FormDialogue.open(SmsFormComponent, {
    //         disableClose: true,
    //         data: {
    //             CustomerID: this.customerID,
    //             CustomerTypeID: this.customerType
    //         }
    //     });

    //     dialogRef.componentInstance.onSubmitForms.subscribe((isSubmitForms: boolean) => {
    //         if (isSubmitForms) {
    //             this._FormDialogue.close();
    //         }
    //     })
    // }
    onEmailForm(staffFormId: any) {
        this.openFormDialog(staffFormId,EmailFormComponent);
      }

      onSmsForm(staffFormId: number) {
        this.openFormDialog(staffFormId, SmsFormComponent);
      }

      openFormDialog(formId, component) {
        this._FormDialogue.open(component, {
          disableClose: true,
          data: {
              CustomerID: this.staffID,
              CustomerTypeID: 4,
              CustomerFormID: formId
          }
      });
      }

    onDeleteForm(staffFormId: number) {
        let param = {
            staffFormID: staffFormId
        }
        this.deleteDialogRef = this._FormDialogue.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(StaffApi.deleteStaffForms, param)
                    .subscribe((res: ApiResponse) => {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Staff Form"));
                                this.getStaffForm();
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Staff Form"));
                            }
                    },
                    );
            }
        })
    }
    openPDF(customerFormID) {
        window.open("/pdf/form/"+customerFormID+"/"+ENU_pdfFor.Staff);
    }
}
