/**********************Angular references ***********************/
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubscriptionLike as ISubscription } from "rxjs";
/********************* Material:Refference ********************/
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
/********************** Staff Document:Refference ***********************/
import { StaffDocument } from "@staff/models/staff.model";
import { UploadStaffDocument } from '@staff/documents/upload/upload.staff.document.component';

/********************** Staff Service:Refference ***********************/
import { HttpService } from '@services/app.http.service';
import { DataSharingService } from '@services/data.sharing.service';
import { MessageService } from '@services/app.message.service';
import { AuthService } from '@app/helper/app.auth.service';
/********************** START: Common *********************/
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { environment } from "@env/environment";
import { Messages } from '@app/helper/config/app.messages';
import { StaffDocumentApi } from '@app/helper/config/app.webapi';
import { ApiResponse, PersonInfo } from '@app/models/common.model';
import { ENU_Permission_Module, ENU_Permission_Staff } from '@app/helper/config/app.module.page.enums';
import { Configurations } from '@app/helper/config/app.config';
import { AppUtilities } from '@app/helper/aap.utilities';
import { ENU_DateFormatName } from '@app/helper/config/app.enums';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';

@Component({
    selector: 'staff-document',
    templateUrl: './search.staff.document.component.html'
})

export class StaffDocumentComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    branchObj: any;
    statusObj: any;
    staffDocumentGridDataObj: any;

    /* Local Members */

    dateFormat: string = ""; //Configurations.DateFormat;
    isDocumentSaveAllowed: boolean = false;
    isBackToSearchAllowed: boolean = false;

    serverImageAddress = environment.imageUrl;
    serverFileAddress = environment.fileUrl;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    errorMessage: string;
    successMessage: string;
    messages = Messages;
    shouldGetPersonInfo: boolean = false;
    deleteDialogRef: any;
    staffID: number = 0;
    isDataExists: boolean = false;
    filePath: string;
    staffDocumentDataObj = new StaffDocument();
    personInfo: PersonInfo;

    staffIDSubscription: ISubscription;
    //dateFormat = Configurations.DateFormat;

    constructor(
        private _authService: AuthService,
        private _httpService: HttpService,
        private _dataSharingService: DataSharingService,
        private _deleteStaffDilage: MatDialogService,
        private _addNewStaffDocumentDialog: MatDialogService,
        private _messageService: MessageService
    ) { super();
    }

    ngOnInit() {
        this.getBranchDatePattern();        
    }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.getStaffID();
        this.isBackToSearchAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.View);
        this.isDocumentSaveAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Document_Save);
    }

    ngOnDestroy() {
        this.staffIDSubscription.unsubscribe();
    }

    getStaffID() {
        this.staffIDSubscription = this._dataSharingService.staffID.subscribe(staffId => {
            setTimeout(() => {
                if (this.staffID !== staffId) {
                    this.staffID = staffId
                    if (this.staffID > 0) {
                        //set PersonID and PersonTypeID for personInfo
                        this.personInfo = new PersonInfo();
                        this.personInfo.PersonID = this.staffID;
                        this.shouldGetPersonInfo = true;
                        this.getStaffDocuments();
                    }
                }
            })
        })
    }

    getStaffDocuments() {
        this._httpService.get(StaffDocumentApi.getAll + this.staffID)
            .subscribe(
                (data: ApiResponse)=> {
                    if(data && data.MessageCode > 0){
                    this.isDataExists = data.Result && data.Result.length > 0 ? true : false;
                    if (this.isDataExists) {
                        this.staffDocumentGridDataObj = data.Result;
                    }
                    else {
                        this.staffDocumentGridDataObj = [];
                    }
                }else{
                    this._messageService.showErrorMessage(data.MessageText);
                }
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Document")); }
            )
    }

    openAddNewStaffDocumentDialog() {
        const dialogRef = this._addNewStaffDocumentDialog.open(UploadStaffDocument, {
            disableClose: true,
            data: this.staffDocumentDataObj
        });

        dialogRef.componentInstance.documentSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getStaffDocuments();
            }
        })
    }

    deleteStaffDocument(Id: number) {
        this.deleteDialogRef = this._deleteStaffDilage.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(StaffDocumentApi.delete + Id + '/' + this.staffID)
                    .subscribe((res: ApiResponse) => {
                        if (res && res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Staff Document"));
                            this.getStaffDocuments();
                        } else {
                            this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Staff Document"));
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Staff Document")); }
                    );
            }
        })
    }

    viewdownloadFile(filePath: string, viewdownload: boolean): void {
        // check file type pdf or jpg
        var files = filePath.slice(-3);
        // concatinate path for jpg file
        this.filePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + filePath;
        // concatinate path for pdf file
        if (files == "pdf") this.filePath = this.serverFileAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + filePath;
        var encodedUri = encodeURI(this.filePath);
        var link = document.createElement("a");

        // view in new tab if viewdownload is true
        if (viewdownload == true) {
            link.setAttribute("href", encodedUri);
            window.open("" + encodedUri + "", "_blank");
            link.setAttribute("view", filePath);
        }

        // download file if viewdownload is false
        else {
            var file_path = filePath;
            //var a = document.createElement('A');
            link.href = file_path;
            link.download = file_path.substr(file_path.lastIndexOf('/') + 1);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}