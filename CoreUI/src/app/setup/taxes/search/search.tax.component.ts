/*************** Angular References *******************/
import { Component, ViewChild } from '@angular/core';

/*************** Services & Models *******************/

/* Services */
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from 'src/app/services/app.message.service';

/* Models */
import { TaxSetup, SearchTaxParams } from 'src/app/setup/models/tax.setup.model';

/*************** Compenents *******************/
import { SaveTaxComponent } from '../save/save.tax.component';

/********************** Confuigurations *********************/
import { TaxApi } from 'src/app/helper/config/app.webapi';
import { Messages } from 'src/app/helper/config/app.messages';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Setup } from 'src/app/helper/config/app.module.page.enums';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiResponse } from 'src/app/models/common.model';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { Configurations } from 'src/app/helper/config/app.config';
import { ViewTaxComponent } from '../view/view.tax.component';
import { EnumSaleSourceType } from 'src/app/helper/config/app.enums';
import { DataSharingService } from 'src/app/services/data.sharing.service';

@Component({
    selector: 'search-tax',
    templateUrl: './search.tax.component.html'
})

export class SearchTaxComponent {

    // #region Local Members
    @ViewChild("appPagination") appPagination: AppPaginationComponent;
    /* Local Variables */
    isSaveTaxAllowed: boolean = false;
    isDataExists: boolean = false;
    totalRecords: number = 0;
    taxID: number;
    sortIndex: number = 1;
    sortOrder_ASC: string = Configurations.SortOrder_ASC;
    sortOrder_DESC: string = Configurations.SortOrder_DESC;
    sortOrder: string = this.sortOrder_ASC;
    enumAppSourceType = EnumSaleSourceType;
    postionSortOrder: string;
    isPositionOrderASC: boolean = undefined;
    allowedTaxPages = {
        Save_tax: false,
        View_tax: false,
        Delete_Tax: false
    }
    /* Messages */
    messages = Messages;

    /* Collection Types */
    searchTaxParams: SearchTaxParams = new SearchTaxParams();
    taxList: any[] = [];
    StatusList: any[] = [];
    TypeList: any[] = [];
    isMultiBranch: boolean;

    // #endregion

    constructor(
        private _authService: AuthService,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _dialog: MatDialogService,
        private _taxService: HttpService,
        private _dataSharingService: DataSharingService,
        private route: ActivatedRoute,
        private _router: Router
    ) {
        this.route.queryParams.subscribe((params: Params) => {
            this.taxID = parseInt(params["TaxID"]);
        });
        this.isMultiBranchID();
    }

    ngOnInit() {
        this.getSearchFundamental();

        this.allowedTaxPages.Save_tax = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Tax_Save);
        this.allowedTaxPages.View_tax = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Tax_View);
    }
    ngAfterViewInit() {
        this.getAllTaxes();
    }
    /* Method to receive the pagination from the Paginator */
    reciviedPagination(pagination: boolean) {
        if (pagination) {
            this.getAllTaxes();
        }
    }
    // #region Events

    onResetTax() {
        this.searchTaxParams = new SearchTaxParams();
        this.appPagination.resetPagination();
        this.getAllTaxes();
    }

    onSearchTax() {
        this.appPagination.pageNumber = 1;
        this.appPagination.paginator.pageIndex = 0;
        this.getAllTaxes();
    }


    onAddClick() {
        this.openDialogForSaveTax(0);
    }

    onEditClick(taxID: number) {
        this.openDialogForSaveTax(taxID);
    }
    //check here if we have interprise level permission or not
    async isMultiBranchID() {
        await this._dataSharingService.sharedIsMultiBranchCompany.subscribe((isMultiBranch: boolean) => {
            this.isMultiBranch = isMultiBranch;
            if (!isMultiBranch) {
                this.searchTaxParams.TaxTypeID = EnumSaleSourceType.OnSite;
            }
        });
    }
    viewTaxDetail(taxID: number) {
        let tax: any;
        this._httpService.get(TaxApi.getByID + taxID).subscribe(data => {
            if (data && data.Result != null) {
                tax = data.Result;
                tax.isMultiBranch = this.isMultiBranch;

                this._dialog.open(ViewTaxComponent, {
                    disableClose: true,
                    data: { ...tax }
                });
            }
            else {
                this._messageService.showErrorMessage(
                    this.messages.Error.Get_Error.replace('{0}', 'Tax')
                );
            }
        }, (error) => {
            this._messageService.showErrorMessage(
                this.messages.Error.Get_Error.replace('{0}', 'Tax')
            );

        })
    }
    // grid tax  sorting Method
    changeSorting(sortIndex: number) {
        this.sortIndex = sortIndex;
        if (sortIndex == 1) {
            this.isPositionOrderASC = undefined;
            if (this.sortOrder == this.sortOrder_ASC) {
                this.sortOrder = this.sortOrder_DESC;

                this.getAllTaxes();
            }
            else {
                this.sortOrder = this.sortOrder_ASC;
                this.getAllTaxes();

            }
        }
        if (sortIndex == 2) {

            if (this.postionSortOrder == this.sortOrder_ASC) {
                this.isPositionOrderASC = true;
                this.sortOrder = this.sortOrder_ASC;
                this.getAllTaxes();
                this.postionSortOrder = this.sortOrder_DESC
            }
            else {
                this.sortOrder = this.sortOrder_DESC;
                this.getAllTaxes();
                this.isPositionOrderASC = false;
                this.postionSortOrder = this.sortOrder_ASC;
            }
        }
    }
    /*** Tax Delete Method */

    openDialogForSaveTax(taxID: number) {
        if (taxID > 0) {
            this.getTaxById(taxID);
        }
        else {
            this.openDialog(new TaxSetup());
        }
    }

    // #endregion

    // #region Methods
    /* Get Search Fundamentals */
    getSearchFundamental() {
        this._httpService.get(TaxApi.getSearchFundamental).subscribe(
            (response: ApiResponse) => {
                if (response.MessageCode > 0) {
                    this.StatusList = response.Result.StatusList;
                    this.TypeList = response.Result.TypeList;
                } else {
                    this._messageService.showErrorMessage(
                        this.messages.Error.Get_Error.replace("{0}", "Tax")
                    );
                }
            },
            (error) => {
                this._messageService.showErrorMessage(
                    this.messages.Error.Get_Error.replace("{0}", "Tax")
                );
            }
        );
    }
    openDialog(taxModel: TaxSetup) {
        const dialogRef = this._dialog.open(SaveTaxComponent,
            {
                disableClose: true,
                data: taxModel
            });

        dialogRef.componentInstance.taxSaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getAllTaxes();
            } else {
                var url = 'setup/taxes';
                this._router.navigate([url]);
            }
        });
    }

    getTaxById(taxID: number) {
        this._httpService.get(TaxApi.getByID + taxID)
            .subscribe(data => {
                if (data && data.MessageCode > 0) {
                    this.openDialog(data.Result);
                }
                else if(data.MessageCode < 0){
                  this._messageService.showErrorMessage(data.MessageText);
                  this._router.navigate(["setup/taxes"]);
                }
                else {
                    this._messageService.showErrorMessage(data.MessageText)
                }
            }, error => {
                this._messageService.showErrorMessage(
                    this.messages.Error.Get_Error.replace("{0}", "Tax")
                );
            });
    }

    getAllTaxes() {
        let searchTaxParams = JSON.parse(
            JSON.stringify(this.searchTaxParams)
        )
        searchTaxParams.SortIndex = this.sortIndex;
        searchTaxParams.SortOrder = this.sortOrder;
        searchTaxParams.PageNumber = this.appPagination.pageNumber;
        searchTaxParams.PageSize = this.appPagination.pageSize;
        this._taxService.get(TaxApi.getAll, searchTaxParams)
            .subscribe(data => {
                if (data && data.MessageCode > 0) {
                    this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                    if (this.isDataExists) {
                        this.taxList = data.Result;
                        if (this.taxID && this.taxID > 0) {
                            this.openDialogForSaveTax(this.taxID);
                        }
                        this.appPagination.totalRecords = data.TotalRecord;
                    }
                    else {
                        this.taxList = [];
                        this.appPagination.totalRecords = 0;
                    }
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Tax"));
                }
            },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Tax")); }
            );
    }

    deleteTax(taxID: number) {
        if (taxID) {
            const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true, data: { header: this.messages.Delete_Messages.Del_Msg_Heading.replace("{0}", "tax "), description: this.messages.Delete_Messages.Del_Msg_Undone, ButtonText: this.messages.General.Delete } });
            deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
                if (isConfirmDelete) {
                    this._httpService.delete(TaxApi.delete + taxID)
                        .subscribe((res: any) => {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Tax"));
                                this.getAllTaxes();
                            }
                            else if (res && res.MessageCode <= 0) {
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Tax"));
                            }
                        },
                            err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Tax")); }
                        );
                }
            })
        }
    }

    //#endregion
}
