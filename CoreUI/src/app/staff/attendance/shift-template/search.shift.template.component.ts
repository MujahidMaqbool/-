/********************** Angular References *********************/
import { Component, OnInit } from '@angular/core';

/*************** START: Application Components *********************/
import { SaveShiftTemplateComponent } from './save.shift.template.component';

/********************** START: Service & Models *********************/
/*Services*/
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { AuthService } from 'src/app/helper/app.auth.service';
/*Models*/
import { ShiftTemplate } from 'src/app/staff/models/shift.template.model';

/********************** START: Common *********************/
import { Configurations } from 'src/app/helper/config/app.config'
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { Messages } from 'src/app/helper/config/app.messages';
import { ShiftTemplateApi } from 'src/app/helper/config/app.webapi';
import { ENU_Permission_Module, ENU_Permission_Staff } from 'src/app/helper/config/app.module.page.enums';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { ApiResponse } from 'src/app/models/common.model';


@Component({
    selector: 'shift-template',
    templateUrl: './search.shift.template.component.html',
})

export class SearchShiftTemplateComponent implements OnInit {

    // @ViewChild(MatPaginator) paginator: MatPaginator;

    isSaveShiftTemplateAllowed : boolean = false;

    /* Messages */
    hasSuccess: boolean = false;
    hasError: boolean = false;
    messages = Messages;
    errorMessage: string;
    successMessage: string;

    /* Models Refences */
    shiftTemplate = new ShiftTemplate();
    shiftTemplates: ShiftTemplate[] = [];

    timeFormat = Configurations.TimeFormatView;

    /*********** Pagination **********/
    isDataExists: boolean = false;
    totalRecords: number = 0;

    constructor(        
        private _editStaffShiftDialog: MatDialogService,
        private _deleteShiftTemplateDialog: MatDialogService,
        private _dateTimeService: DateTimeService,
        private _authService: AuthService,
        private _httpService: HttpService,
        private _messageService: MessageService,
    ) { }

    ngOnInit() {
        this.getTemplateShifts();
        this.isSaveShiftTemplateAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.ShiftTemplate_Save);
    }

    // #region Events 

    onAddClick() {
        this.openShifTemplateDialog(0);
    }

    onEditClick(ShiftTemplateID: number) {
        this.openShifTemplateDialog(ShiftTemplateID);
    }

    openShifTemplateDialog(ShiftTemplateID: number) {
        if (ShiftTemplateID > 0) {
            this.getShiftTemplateByID(ShiftTemplateID);
        }
        else {
            this.shiftTemplate = new ShiftTemplate();
            this.openDialog();
        }
    }

    openDialog() {
        const dialogRef = this._editStaffShiftDialog.open(SaveShiftTemplateComponent,
            {
                disableClose: true,
                data: this.shiftTemplate
            });

        dialogRef.componentInstance.shiftTemplateSaved.subscribe((isSaved: boolean) => {
            this.getTemplateShifts();
        });
    }

    // #endregion 

    // #region Methods

    getShiftTemplateByID(shiftTemplateID: number) {
        this._httpService.get(ShiftTemplateApi.getByID + shiftTemplateID)
            .subscribe((data:ApiResponse) => {
                if (data && data.MessageCode > 0) {
                    this.shiftTemplate = data.Result;
                    this.openDialog();
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Shift Template"));
                }
            });
    }

    getTemplateShifts() {
        this._httpService.get(ShiftTemplateApi.getAll)
            .subscribe((data:ApiResponse) => {
                if(data && data.MessageCode > 0){
                this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    this.totalRecords = data.TotalRecord;
                    this.shiftTemplates = data.Result;                    
                    this.shiftTemplates.forEach(st => {
                        st.StartTime = this._dateTimeService.formatTimeString(st.StartTime);
                        st.EndTime = this._dateTimeService.formatTimeString(st.EndTime);
                    })
                }
                else {
                    this.shiftTemplates = [];
                    this.totalRecords = 0;
                }
            }else{
                this._messageService.showErrorMessage(data.MessageText);
            }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Shift Templates")); }
            );
    }

    deleteShiftTemplate(shiftTemplateID: number) {
        const deleteDialogRef = this._deleteShiftTemplateDialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                if (shiftTemplateID) {
                    this._httpService.delete(ShiftTemplateApi.delete + shiftTemplateID)
                        .subscribe((res:ApiResponse) => {
                            if(res && res.MessageCode > 0){
                            this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Shift Template"));
                            this.getTemplateShifts();
                            }else{
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                        },
                            err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Shift Template")); }
                        );
                }
            }
        })
    }

    // #endregion 

}