import { Component, Inject, EventEmitter, Output } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomerFormApi, AttendeeApi, SchedulerServicesApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse } from 'src/app/models/common.model';
import { CustomerFormsInfromation, CustomFormView } from 'src/app/models/customer.form.model';
import { ViewFormComponent } from '../forms/view/view.form.component';
import { HttpService } from 'src/app/services/app.http.service';
import { MatDialogService } from '../generics/mat.dialog.service';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';

@Component({
    selector: 'fill-form',
    templateUrl: './fill.form.component.html'
})
export class FillFormComponent {

    @Output() onFormSubmittion = new EventEmitter<boolean>();  

    /* Messages */
    messages = Messages;

    @Output()
    isConfirm = new EventEmitter<boolean>();
    tempFormmodel: any = [];

    isShowFillFormInfo: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<FillFormComponent>,
        private _FormDialogue: MatDialogService,
        private _httpService: HttpService, private _messageService: MessageService,
        @Inject(MAT_DIALOG_DATA) public customer: any, ) { }


    //Get Customer forms
    ngOnInit() {
        var url: string = "";
        if(this.customer.dialogtype && this.customer.dialogtype == "ManageAttendee") {
            url = AttendeeApi.getCustomerForms + this.customer.saleDetailOrBookingID + '/' + this.customer.customerID + '/' + this.customer.isSale;
            this.GetCustomerForms(url, null);
        } else if(this.customer.dialogtype && this.customer.dialogtype == "SchedularService") {
            url = SchedulerServicesApi.getCustomerForms + this.customer.saleDetailOrBookingID + '/' + this.customer.customerID + '/' + this.customer.isSale;
            // let param = {
            //     saleDetailOrBookingID : this.customer.saleDetailOrBookingID,
            //     customerID : this.customer.customerID,
            //     isSale : this.customer.isSale
            // }
            this.GetCustomerForms(url, null);
        // } else if(this.customer.dialogtype && this.customer.dialogtype == "BuyMembership") {
        //     let param = {
        //         customerTypeID: this.customer.customertypeId
        //     }
        //     url = CustomerFormApi.getCustomerTypeForm;
        //     this.GetCustomerForms(url, param);
        // } else {
        } else {
           this.isShowFillFormInfo = true;
        }
    }

    onFillForm(){
        let param = {
            customerTypeID: this.customer.customertypeId,
            customerID: this.customer.customerID
        }
        var url = CustomerFormApi.getCustomerTypeForm;
        this.GetCustomerForms(url, param);
    }

    GetCustomerForms(url, param){
        if(param == null){
            this._httpService.get(url).subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result != undefined && response.Result.length > 0) {
                        var formData = this.setFormViewModelValues(response.Result, false);
                        this.dialogRef.close();
                        this.openFormDailog(formData);
                    }
                    else {
                        this._messageService.showSuccessMessage(this.messages.Error.There_is_no_form.replace("{0}", "Customer Form"));
                        this.dialogRef.close();
                    }
                }else{
                    this._messageService.showErrorMessage(response.MessageText);

                }
            });
        } else{
            this._httpService.get(url, param).subscribe((response: ApiResponse) => {
                if (response && response.MessageCode > 0) {
                    if (response.Result != undefined) {
                        var formData = this.setFormViewModelValues(response.Result, false);
                        this.dialogRef.close();
                        this.openFormDailog(formData);
                    }
                    else {
                        this._messageService.showSuccessMessage(this.messages.Error.There_is_no_form.replace("{0}", "Customer Form"));
                    }
                }else{
                    this._messageService.showErrorMessage(response.MessageText);
                }
            });
        }
    }

    setFormViewModelValues(formViewModel: any, isView: boolean = false) {

        var savedCustomerForms = new CustomerFormsInfromation();
        savedCustomerForms.isViewForm = isView;
        savedCustomerForms.CustomFormView = new Array<CustomFormView>();
        formViewModel.forEach(form => {
            savedCustomerForms.CustomFormView.push(form);
        });

        return savedCustomerForms;
    }

    openFormDailog(formData) {

        const dialogRef = this._FormDialogue.open(ViewFormComponent, {
            disableClose: true,
            data: formData
        });

        dialogRef.componentInstance.onSubmitForms.subscribe((filledFormData: CustomFormView[]) => {
            this.saveForm(filledFormData)
        })

    }

    saveForm(filledFormData) {

        filledFormData.forEach(element => {
            let param = {
                CustomerFormID: element.CustomerFormID,
                CustomerID: this.customer.customerID,
                FormID: element.FormID,
                JsonText: element.JsonText,
                FormStatusID: element.FormStatusID,
                IsSkipped: element.IsSkipped,
                FormTypeID: element.FormTypeID,
                FormName: element.FormName,
                Description: element.Description,
            }
            this.tempFormmodel.push(param);
        });
        this._httpService.save(CustomerFormApi.saveCustomerForms, this.tempFormmodel).subscribe((response: ApiResponse) => {
            if (response && response.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Customer Form"));
                this.onFormSubmittion.emit(true);
            }
            else{
                this._messageService.showErrorMessage(response.MessageText);
            }
        });
    }

    onCancel() {
        this.dialogRef.close();
        this.onFormSubmittion.emit(false);
        this._messageService.showWarningMessage(this.messages.Error.Pending_Forms_Again_Customer);
    }

}
