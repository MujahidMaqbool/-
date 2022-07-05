/********************** Angular References *********************/
import { Component, ViewChild } from '@angular/core';

/********************** Angular Material References *********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** Application Components *********************/
import { SaveFacilityComponent } from '@setup/facility/save/save.facility.component';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';

/********************** Service & Models *********************/
import { Facility } from '@setup/models/facility.model';
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { AuthService } from '@app/helper/app.auth.service';

/********************** Common & Customs *********************/
import { Configurations } from '@helper/config/app.config';
import { Messages } from '@app/helper/config/app.messages';
import { FacilityApi } from '@app/helper/config/app.webapi';
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';

@Component({
    selector: 'search-facility',
    templateUrl: './search.facility.component.html'
})
export class SearchFacilityComponent {

    /**material references */
    @ViewChild(MatPaginator) paginator: MatPaginator;

    /**local members */
    isDataExits: boolean = false;
    isSaveFacilityAllowed: boolean = false;
    isDataExists: boolean = false;
    isExpand: boolean = true;

    /* Collection Types */
    facilities: Facility[] = [];

    /* Model References */
    facilityModel = new Facility();

    /* Messages */
    messages = Messages;
    successMessage: string;
    errorMessage: string;
    hasSuccess: boolean = false;
    hasError: boolean = false;

    /*********** Pagination **********/
    totalRecords: number = 0;
    defaultPageSize = Configurations.DefaultPageSize;
    pageSizeOptions = Configurations.PageSizeOptions;
    pageNumber: number = 1;
    pageIndex: number = 0;
    inputName: string = '';
    previousPageSize = 0;


    constructor(
        private _authService: AuthService,
        private _httpService: HttpService,
        private _saveFacilityDialog: MatDialogService,
        private _messageService: MessageService,
        private _deleteBranchDilage: MatDialogService
    ) { }

    //#region angular hooks
    ngOnInit() {
        this.isSaveFacilityAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Facility_Save);
    }

    ngAfterViewInit() {
        this.paginator.pageSize = this.defaultPageSize;
        this.previousPageSize = this.defaultPageSize;
        this.getFacilities();
    }

    //#endregion

    // #region Events

    /**open dialog for new facility */
    onAddClick() {
        this.openNewDialogForClassFacility(0);
    }

    /**open dialog for edit facility */
    onEditClick(FacilityID: number) {
        this.openNewDialogForClassFacility(FacilityID);
    }

    /**on change pagination */
    onPageChange(e: any) {
        if (e.pageIndex >= this.pageNumber) {
            // Set page number
            this.pageNumber = ++e.pageIndex;
        }
        else {
            if (e.pageIndex >= 1) {
                this.pageNumber = --this.pageNumber;
            }
            else { this.pageNumber = 1 }
        }
        // as per disscusion with B.A and tahir when user change page index pagination reset (show page 1)
        if (this.previousPageSize !== e.pageSize) {
            this.pageNumber = 1;
            this.paginator.pageSize = e.pageSize;
            this.paginator.pageIndex = 0;
        }
        this.previousPageSize = e.pageSize;
        this.getFacilities();
    }

    //#endregion

    //#region methods
    /**generic method for add and edit class class category*/
    openNewDialogForClassFacility(FacilityID: number) {
        if (FacilityID > 0) {
            this.getClassFacilityById(FacilityID);
        }
        else {
            this.facilityModel = new Facility();
            this.openDialog();
        }
    }

    /**get class facility by id and open dialog */
    getClassFacilityById(facilityID: number) {
        this._httpService.get(FacilityApi.getByID + facilityID)
            .subscribe(data => {
                if (data && data.MessageCode > 0) {
                    this.facilityModel = data.Result;
                    this.openDialog();
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Facility"));
                }
            },
                error => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Facility")); });
    }

    /**open dialg for and close popup if data saved successfully*/
    openDialog() {
        const classFacilityDialogRef = this._saveFacilityDialog.open(SaveFacilityComponent, {
            disableClose: true,
            data: this.facilityModel
        });

        classFacilityDialogRef.componentInstance.facilitySaved.subscribe((isSaved: boolean) => {
            if (isSaved) {
                this.getFacilities();
            }
        })
    }

    // #endregion

    // #region Methods
    /**open delete dialog and delete class facillity*/
    deleteClassFacility(facilityID: number) {
        const deleteDialogRef = this._deleteBranchDilage.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});

        deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.delete(FacilityApi.delete + facilityID)
                    .subscribe((res: any) => {
                        if (res && res.MessageCode) {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Facility"));
                                this.getFacilities();
                            }
                            else if (res && res.MessageCode <= 0) {
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Facility"));
                            }
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Facility")); }
                    );
            }
        })
    }

    /**get all facility */
    getFacilities() {
        let url = FacilityApi.getAll.replace("{pageNumber}", this.pageNumber.toString()).replace("{pageSize}", this.paginator.pageSize.toString())
        this._httpService.get(url)
            .subscribe(data => {
                if (data && data.MessageCode > 0) {
                    this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                    this.facilities = [];
                    this.totalRecords = 0;
                    if (this.isDataExists) {
                        this.totalRecords = data.TotalRecord;
                        this.facilities = data.Result;
                    }
                }
                else {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Facilities"));
                }
            },
                err => {
                    this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Facilities"));
                });
    }

    // #endregion
}