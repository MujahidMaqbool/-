/********************* Angular References ********************/
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { ClassViewComponent } from '../view/class.view.component';
/********************** Services & Model *********************/
import { ParentClassSearchParameter } from 'src/app/setup/models/parent.class.model';
import { HttpService } from 'src/app/services/app.http.service';

/********************** Common & Custom *********************/
import { ClassApi } from 'src/app/helper/config/app.webapi';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { MatPaginator } from '@angular/material/paginator';
import { AppPaginationComponent } from 'src/app/shared-pagination-module/app-pagination/app.pagination.component';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Setup } from 'src/app/helper/config/app.module.page.enums';

@Component({
    selector: 'class-search',
    templateUrl: './class.search.component.html'
})
export class ClassSearchComponent implements OnInit, AfterViewInit {

    /** pagination References */
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("appPagination") appPagination: AppPaginationComponent;

    /**Models References */
    parentClassSearchParam = new ParentClassSearchParameter();
    classSerarchParameters: ParentClassSearchParameter = new ParentClassSearchParameter();

    /**Collections */
    classCategoryList: any[] = [];
    statusList: any[] = [];
    ParentClassesList: any[] = [];

    /**local variables */
    deleteDialogRef: any;
    isDataExists: boolean = false;
    isSaveClass: boolean = false;

    /**Configurations */
    messages = Messages;


    constructor(
        private _dialog: MatDialogService,
        private _httpService: HttpService,
        private _messageService: MessageService,
        private _authService: AuthService,
    ) {

    }

    //#endregion angular hooks
    ngOnInit() {
        this.getFundamental();
        this.isSaveClass = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.Class_Save);

    }

    ngAfterViewInit() {
        this.getParentClass();
    }

    //#region 

    //#endregion methods

    /**set default values to search parameters */
    setDefaultValues() {
        this.parentClassSearchParam.classCategoryID = null;
        this.parentClassSearchParam.isActive = this.statusList[0].StatusID;
    }

    /**open dialog for view class */
    openDialog(parentClassId: any) {
        const dialogref = this._dialog.open(ClassViewComponent, {
            disableClose: true,
            data: {
                parentClassID: parentClassId
            }
        });
    }

    /**open delete popup, delete class and class get all classes method  */
    DeleteParentClass(parentClassId: any) {
        this.deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
        this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
            if (isConfirmDelete) {
                this._httpService.get(ClassApi.deleteParentClass + parentClassId)
                    .subscribe((res: any) => {
                        if (res && res.MessageCode) {
                            if (res && res.MessageCode > 0) {
                                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Class"));
                                this.getParentClass();
                            }
                            else if (res && res.MessageCode <= 0) {
                                this._messageService.showErrorMessage(res.MessageText);
                            }
                            else {
                                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Class"));
                            }
                        }
                    },
                        err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Class")); }
                    );
            }
        })
    }

    /**get fundametal for class , like class Category List, status List */
    getFundamental() {

        this._httpService.get(ClassApi.getFundamental).subscribe(data => {
            if(data && data.MessageCode >0 ){
            this.classCategoryList = data.Result.ListClassCategory;
            this.statusList = data.Result.StatusList;
            }else{
                this._messageService.showErrorMessage(data.MessageText);
            }
        });
        setTimeout(() => {
            this.setDefaultValues();
        }, 1000);
    }

    /**called received pagination function */
    reciviedPagination(pagination: boolean) {
        if (pagination)
            this.getParentClass();
    }

    /**set search params and class call get parent class method */
    onSearchForm() {
        this.classSerarchParameters.parentClassName = this.parentClassSearchParam.parentClassName != "" ? this.parentClassSearchParam.parentClassName : "";
        this.classSerarchParameters.classCategoryID = this.parentClassSearchParam.classCategoryID != null ? this.parentClassSearchParam.classCategoryID : null,
            this.classSerarchParameters.isActive = this.parentClassSearchParam.isActive;
        this.appPagination.paginator.pageIndex = 0;
        this.appPagination.pageNumber = 1;
        this.getParentClass();
    }

    /**get parent class list */
    getParentClass() {
        let param = {
            parentClassName: this.classSerarchParameters.parentClassName != "" ? this.classSerarchParameters.parentClassName : "",
            classCategoryID: this.classSerarchParameters.classCategoryID != null ? this.classSerarchParameters.classCategoryID : null,
            isActive: this.classSerarchParameters.isActive == 1 ? true : false,
            pageNumber: this.appPagination.pageNumber,
            pageSize: this.appPagination.pageSize,
        }
        this._httpService.get(ClassApi.getParentClass, param).subscribe(data => {
            if (data && data.MessageCode > 0) {
                this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
                if (this.isDataExists) {
                    this.ParentClassesList = data.Result;
                    this.appPagination.totalRecords = data.TotalRecord;
                } else {
                    this.ParentClassesList = [];
                    this.appPagination.totalRecords = 0;
                }
            }else{
                this._messageService.showErrorMessage(data.MessageText)
            }
        });
    }

    /**reset search params and call resetPagination function from pagination component*/
    ResetSearchParam() {
        this.classSerarchParameters = new ParentClassSearchParameter();
        this.parentClassSearchParam.classCategoryID = null;
        this.parentClassSearchParam.parentClassName = "";
        this.parentClassSearchParam.isActive = 1;
        this.appPagination.resetPagination();
        this.getParentClass();
    }
}
