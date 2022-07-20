/********************** Angular Refrences *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

/********************* Material:Refference ********************/
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
/********************** Services & Models *********************/
/* Models */
import { Client, SearchClient, SaveClient } from "src/app/customer/client/models/client.model";
import { ApiResponse, PersonInfo } from "src/app/models/common.model";
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { AuthService } from 'src/app/helper/app.auth.service';

/********************** Component *********************/
import { ViewClientDetailComponent } from 'src/app/customer/client/view/view.client.detail.component'
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';
/* Models */
/**********************  Common *********************/
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { PersonType, Gender, ENU_DateFormatName, ENU_Package } from "src/app/helper/config/app.enums";
import { Messages } from 'src/app/helper/config/app.messages';
import { ClientApi, CustomerApi } from 'src/app/helper/config/app.webapi';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from 'src/app/helper/config/app.module.page.enums';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { EmailValidatePipe } from 'src/app/shared/pipes/email.validate';
import { CustomerBenefitsComponent } from 'src/app/customer-shared-module/customer-benefits/customer.benefits.component';
import { SubscriptionLike } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { MessageService } from 'src/app/services/app.message.service';

@Component({
    selector: 'search-client',
    templateUrl: './search.client.component.html'
})

export class SearchClientComponent extends AbstractGenericComponent implements OnInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;


    packageIdSubscription: SubscriptionLike;
    // #region Local Members

    /***********Local*********/
    isSaveClientAllowed: boolean;
    isActivitiesAllowed: boolean;
    beneftisViewAllowedInPermission: boolean;
    InvoiceHistory: boolean;
    BookingHistory: boolean;
    dateFormat: string = "";
    isEmailValid: boolean;
    benefitsViewInculdeInPackage: boolean;
    /***********Messages*********/
    messages = Messages;
    public isDataExists: boolean = false;
    /***********Collection And Models*********/
    client: Client[] = [];
    searchClient: SearchClient;
    saveClient: SaveClient;
    clientDummyData: any;
    personType = PersonType;
    personInfo: PersonInfo
    genderList = Gender;
    /***********Dialog Reference*********/
    deleteDialogRef: any;
    viewDialogRef: any;


    /* configurations */
    //Configurations.DateFormat;
    package = ENU_Package;

    //-----Temprary Commented------//
    //sortOrder_ASC: string = VoyagerConfigurations.SortOrder_ASC;
    //sortOrder_DESC: string = VoyagerConfigurations.SortOrder_DESC;
    //isMemberNameOrderASC: boolean = true;

    // #endregion

    constructor(
        private _router: Router,
        private _authService: AuthService,
        private _httpService: HttpService,
        private _clientActionDialogue: MatDialogService,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService,
        private _emailValidatePipe : EmailValidatePipe,
        private _commonService:CommonService
    ) {
        super();
        this.getBranchDatePattern();
        this.searchClient = new SearchClient();
        this.saveClient = new SaveClient();
        this.personInfo = new PersonInfo();
    }

    ngOnInit() {
        this.isSaveClientAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.SaveClient);
        this.isActivitiesAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Activities_View);
        this.beneftisViewAllowedInPermission = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.BenefitsView);
        this.InvoiceHistory = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.InvoiceHistory);
        this.BookingHistory = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.BookingHistory);

        this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
            (packageId: number) => {
              if (packageId && packageId > 0) {
                this.setBenefitViewPermissions(packageId);
              }
            }
          );
    }

    ngAfterViewInit() {
        this.getAllClients();
    }

    // #region Events

    setBenefitViewPermissions(packageID: number){
        this.benefitsViewInculdeInPackage =  packageID == this.package.Full || packageID == this.package.FitnessBasic || packageID == this.package.FitnessMedium ? true : false;
    }


    onEditClient(client: Client) {
        this._commonService.shareLeadInfo(client);
        this._router.navigate(['/client/details', client.CustomerID]);
    }

    onAddClient(ClientID) {
        this._router.navigate(['/client/details', ClientID]);
    }

    onViewClientDetail(clientID: number) {
        this._clientActionDialogue.open(ViewClientDetailComponent, {
            disableClose: true,
            data: clientID,
        });
    }

    onViewCustomerBenefits(clientID: number) {
      this._clientActionDialogue.open(CustomerBenefitsComponent, {
          disableClose: true,
          data: clientID,
      });
    }

    onDeleteClient(customerID: number) {
        this.deleteDialogRef = this._clientActionDialogue.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(CustomerApi.deleteCustomer + "?customerID=" + customerID)
                    .subscribe((res: ApiResponse) => {
                        if (res && res.MessageCode) {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Client"));
                                this.getAllClients();
                            }
                            else if (res && res.MessageCode <= 0) {
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Client"));
                            }
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Client")); }
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
            this.getAllClients();
    }

    searchAllClients() {
        this.searchClient.Name = (<HTMLInputElement>document.getElementById('client_name')).value,
        this.searchClient.Mobile = (<HTMLInputElement>document.getElementById('client_mobile')).value,
        this.searchClient.Email = (<HTMLInputElement>document.getElementById('client_email')).value,
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getAllClients();

    }

    getAllClients() {
        // if (!this.isSearchByPageIndex) {
        //     this.pageNumber = 1;
        //     this.paginator.pageIndex = 0;
        //     this.paginator.pageSize = this.paginator.pageSize;
        // }
        let params = {
            customerName: this.searchClient.Name,
            mobile: this.searchClient.Mobile,
            email: this.searchClient.Email,
            pageNumber: this.appPagination.pageNumber,
            pageSize: this.appPagination.pageSize
        }

        this._httpService.get(ClientApi.getClients, params)
            .subscribe((res: ApiResponse) => {
                if (res && res.MessageCode > 0) {

                    this.isDataExists = res.Result != null && res.Result.length > 0 ? true : false;
                    if (this.isDataExists) {
                        this.client = res.Result;
                        if (res.Result.length > 0) {
                            this.appPagination.totalRecords = res.TotalRecord;
                        }
                    }
                    else {
                        this.appPagination.totalRecords = 0;
                    }
                } else {
                    this._messageService.showErrorMessage(res.MessageText);
                }
            },
                error => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Client"));
                }
            );
    }

    //-----Temprary Commented------//

    // changeSorting(sortIndex: number) {
    //     if (this.searchClient.SortOrder == this.sortOrder_ASC) {
    //         this.searchClient.SortOrder = this.sortOrder_DESC;
    //         this.getAllClients();
    //         this.isMemberNameOrderASC = false;
    //     }
    //     else {
    //         this.searchClient.SortOrder = this.sortOrder_ASC;
    //         this.getAllClients();
    //         this.isMemberNameOrderASC = true;
    //     }
    // }
    validateEmail()
    {
        var search = (<HTMLInputElement>document.getElementById("client_email")).value;
        this.isEmailValid = this._emailValidatePipe.transform(search);

        // let regexp = new RegExp(/^([a-zA-Z0-9_\-\.]+)@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,10})$/);
        // this.isEmailValid = regexp.test(search);
        // return this.isEmailValid;
    }


    resetClientSearchFilter() {
        this.searchClient.Name = (<HTMLInputElement>document.getElementById('client_name')).value = "";
        this.searchClient.Mobile = (<HTMLInputElement>document.getElementById('client_mobile')).value = "";
        this.searchClient.Email = (<HTMLInputElement>document.getElementById('client_email')).value = "";
        this.appPagination.resetPagination();
        this.getAllClients();
    }

    // #endregion
}
