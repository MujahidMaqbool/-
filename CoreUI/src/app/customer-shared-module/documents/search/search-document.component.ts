/********************* Angular references ********************/
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SubscriptionLike as ISubscription } from "rxjs";

/********************** Services & Models *********************/
/* Models */
import { MemberDocument ,DocumentSearch } from "@customer/member/models/members.model";
import { PersonInfo } from '@app/models/common.model';
/* Services */
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { DataSharingService } from '@services/data.sharing.service';

/********************** Component *********************/
import { SaveDocument } from '@app/customer-shared-module/documents/save/save-document.component';

/********************** START: Common *********************/

import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { MemberApi } from "@helper/config/app.webapi";
import { Messages } from '@app/helper/config/app.messages';
import { environment } from '@env/environment';
import { CustomerType, ENU_DateFormatName } from '@app/helper/config/app.enums';
import { AuthService } from '@app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember, ENU_Permission_Lead } from '@app/helper/config/app.module.page.enums';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';
import { Configurations } from '@app/helper/config/app.config';
import { AppUtilities } from '@app/helper/aap.utilities';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'document-list',
    templateUrl: './search-document.component.html'
})

export class SearchDocumentComponent extends AbstractGenericComponent implements OnInit, OnDestroy {

    // #region Local Members
    /***********Messages*********/
    serverImageAddress = environment.imageUrl;
    serverFileAddress = environment.fileUrl;
    hasSuccess: boolean = false;
    hasError: boolean = false;
    errorMessage: string;
    successMessage: string;
    messages = Messages;

    dateFormat: string = ""; //Configurations.DateFormat;

    /***********Local Members*********/
    deleteDialogRef: any;
    customerID: number = 0;
    sortOrder_ASC = Configurations.SortOrder_ASC;
    sortOrder_DESC = Configurations.SortOrder_DESC;
    sortOrder: string;

    // memberID:number = 0;

    isDataExists: boolean = false;
    filePath: string;
    shouldGetPersonInfo: boolean = false;
    customerType : number;

    /***********Dialog Reference*********/
    memberDocument: MemberDocument;

    /***********Collection & Models*********/
    // personInfo: PersonInfo;
    DocumentSearchModel: DocumentSearch = new DocumentSearch();
    DocumentSearchParams = new DocumentSearch();
    memberIdSubscription: ISubscription;
    customerTypeSubscription: ISubscription;
    /* Configurations */
   // dateFormat = Configurations.DateFormat;



    allowedPages = {
        Search_Member: false,
        Save: false
    };

    // #endregion

    constructor(
        private route: ActivatedRoute,
        private _memberService: HttpService,
        private _memberActionDialogue: MatDialogService,
        private _dataSharingService: DataSharingService,
        private _messageService: MessageService,
        private _authService: AuthService,
    ) {
        super();
        this.memberDocument = new MemberDocument();
    }

    ngOnInit() {
        this.getBranchDatePattern();
        this.sortOrder = 'ASC'
    }
  
    ngOnDestroy() {
        this.memberIdSubscription.unsubscribe();
        this.customerTypeSubscription.unsubscribe();
    }

    getCustomerType(){
        this.customerTypeSubscription = this._dataSharingService.customerTypeID.subscribe(customerType => {
              this.customerType = customerType;
        })
    }

    async getBranchDatePattern() {
        this.dateFormat = await super.getBranchDateFormat(this._dataSharingService, ENU_DateFormatName.DateFormat);
        this.getCustomerType();
        this.setPermissions(); 
        this.getMemberID();
    }

    setPermissions() {
        if(this.customerType == CustomerType.Lead ){
            this.allowedPages.Save = this._authService.hasPagePermission(ENU_Permission_Module.Lead, ENU_Permission_Lead.Documents_Save);
        }
       else {
        this.allowedPages.Save = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Documents_Save);

       }
        
            
        }
            
       

    getMemberID() {
        this.memberIdSubscription = this._dataSharingService.customerID.subscribe(customerId => {
            if (customerId > 0) {
                this.customerID = customerId;
                //set PersonID and PersonTypeID for personInfo
                // this.personInfo = new PersonInfo();
                // this.personInfo.PersonID = this.customerID;
                // this.personInfo.PersonTypeID = this.customerType;
                this.shouldGetPersonInfo = true;
                this.getMemberDocument();
            }
        });
    }
   
    getMemberDocument() {
        this.DocumentSearchParams.customerID = this.customerID;
        this._memberService.get(MemberApi.getCustomerDocumentByID , this.DocumentSearchParams )
            .subscribe(
                res => {
                    if (res && res.MessageCode > 0) {
                        this.isDataExists = res.Result && res.Result.length > 0 ? true : false;
                        if (this.isDataExists) {
                            this.memberDocument = res.Result;
                        }
                    }
                    else {
                        this._messageService.showErrorMessage(res.MessageText);
                    }

                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Document")); }
            )
    }

    openAddNewStaffDocumentDialog() {
        const dialogRef = this._memberActionDialogue.open(SaveDocument, {
            disableClose: true,
            data: this.customerID
        });

        dialogRef.componentInstance.documentSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getMemberID();
            }
        })
    }

    deleteMemberDocument(documentId: number) {
        this.deleteDialogRef = this._memberActionDialogue.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._memberService.delete(MemberApi.deleteCustomerDocument + documentId + '/' + this.customerID)
                    .subscribe(res => {
                        if (res && res.MessageCode > 0) {
                            this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Document"));
                            this.getMemberID();
                        }
                        else {
                            this._messageService.showErrorMessage(res.MessageText);
                        }

                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Document")); }
                    );
            }
        })
    }

    viewdownloadFile(filePath: string, viewdownload: boolean): void {
        // check file type pdf or jpg
        var files = filePath.slice(-3);
        // concatinate path for jpg file
        this.filePath = this.serverImageAddress.replace("{ImagePath}",AppUtilities.setOtherImagePath()) + filePath;
        // concatinate path for pdf file
        if (files == "pdf") this.filePath = this.serverFileAddress.replace("{ImagePath}",AppUtilities.setOtherImagePath()) + filePath;
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
    changeSorting(sortIndex: number) {
        this.DocumentSearchParams.SortIndex = sortIndex;
        if (sortIndex == 1) {
          if (this.sortOrder == this.sortOrder_ASC) {
            this.sortOrder = this.sortOrder_DESC;
            this.DocumentSearchParams.SortOrder = this.sortOrder;
            this.getMemberDocument();
          } else {
            this.sortOrder = this.sortOrder_ASC;
            this.DocumentSearchParams.SortOrder = this.sortOrder;
            this.getMemberDocument();
          }
        }
      
      }
}
