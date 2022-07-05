import { Component, OnInit, ViewChild } from '@angular/core';

/********************** Angular Material References *********************/
import { MatPaginator } from '@angular/material/paginator';

/********************** START: Application Components *********************/
import { ClassCategorySaveComponent } from '@setup/class-category/save/class.category.save.component';
import { DeleteConfirmationComponent } from '@app/application-dialog-module/delete-dialog/delete.confirmation.component';

/********************** START: Service & Models *********************/
import { ClassCategory } from '@setup/models/class.category.model';
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { AuthService } from '@app/helper/app.auth.service';


/********************** START: Common *********************/
import { ENU_Permission_Module, ENU_Permission_Setup } from '@app/helper/config/app.module.page.enums';
import { Messages } from '@app/helper/config/app.messages';
import { Configurations } from '@app/helper/config/app.config';
import { ClassCategoryApi } from '@app/helper/config/app.webapi';
import { MatDialogService } from '@app/shared/components/generics/mat.dialog.service';

@Component({
  selector: 'class-category-search',
  templateUrl: './class.category.search.component.html'
})
export class ClassCategorySearchComponent implements OnInit {

  /**material references */
  @ViewChild(MatPaginator) paginator: MatPaginator;

  /**Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;
  isSaveClassCategoryAllowed: boolean = false;

  /**Pagination */
  totalRecords: number = 0;
  defaultPageSize = Configurations.DefaultPageSize;
  pageSizeOptions = Configurations.PageSizeOptions;
  pageNumber: number = 1;
  pageIndex: number = 0;
  isExpand: boolean = true;
  inputName: string = '';
  isDataExists: boolean = false;
  previousPageSize = 0;

  /**collection and models */
  classCategoryies: ClassCategory[] = [];
  classCategory = new ClassCategory();
  deleteDialogRef: any;

  // #endregion

  constructor(
    private _authService: AuthService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dialog: MatDialogService
  ) { }

  //#region angular hooks
  ngOnInit() {
    this.isSaveClassCategoryAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.ClassCategory_Save);
  }

  ngAfterViewInit() {
    this.paginator.pageSize = this.defaultPageSize;
    this.previousPageSize = this.defaultPageSize;
    this.getClassCategories();
  }

  //#endregion


  // #region Events

  /**open dialog for add new class category */
  onAddClick() {
    this.openDialogForClassCategory(0);
  }

  /**open dialog for edit existing class category */
  onEditClick(classCategoryID: number) {
    this.openDialogForClassCategory(classCategoryID);
  }

  // #endregion

  // #region Methods

  /**generic method for add and edit class class category*/
  openDialogForClassCategory(classCategoryID: number) {
    if (classCategoryID > 0) {
      this.getClassCategoryById(classCategoryID);
    }
    else {
      this.classCategory = new ClassCategory();
      this.openDialog();
    }
  }

  /**get class category by id and open dialog*/
  getClassCategoryById(classCategoryID: number) {
    this._httpService.get(ClassCategoryApi.getByID + classCategoryID)
      .subscribe(data => {
        if(data && data.MessageCode > 0){
        this.classCategory = data.Result;
        this.openDialog();
        }else{
          this._messageService.showErrorMessage(data.MessageText);
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Class Category")); }
      );
  }

  /**open dialg for and close popup if data saved successfully*/
  openDialog() {
    const editDialogRef = this._dialog.open(ClassCategorySaveComponent, {
      disableClose: true,
      data: this.classCategory
    });

    editDialogRef.componentInstance.classCategorySaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this.getClassCategories();
      }
    });
  }

  /**on change page size, set page index*/
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
    this.getClassCategories();
  }

  /**open delete dialog and delete class category*/
  deleteClassCategory(classCategoryID: number) {
    this.deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone}});
    this.deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        this._httpService.delete(ClassCategoryApi.delete + classCategoryID)
          .subscribe((res: any) => {
            if (res && res.MessageCode) {
              if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Class category"));
                this.getClassCategories();
              }
              else if (res && res.MessageCode <= 0) {
                this._messageService.showErrorMessage(res.MessageText);
              }
              else {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Class category"));
              }
            }
          },
            err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Class category")); }
          );
      }
    })
  }

  /**get all class categories */
  getClassCategories() {
    let url = ClassCategoryApi.getAll.replace("{pageNumber}", this.pageNumber.toString()).replace("{pageSize}", this.paginator.pageSize.toString())
    this._httpService.get(url)
      .subscribe(data => {
        if (data && data.MessageCode > 0) {
          this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
          if (this.isDataExists) {
            if (data.TotalRecord) {
              this.totalRecords = data.TotalRecord;
            }
            else {
              this.totalRecords = 0;
            }
            this.classCategoryies = data.Result;
          }
          else {
            this.classCategoryies = [];
          }
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Class Category"));
        }

      },
        err => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Class Category"));
        });
  }
  //#endregion
}
