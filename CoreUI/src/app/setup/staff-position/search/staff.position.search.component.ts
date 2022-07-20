/*************** Angular References *******************/
import { Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

/********************** START: Application Components *********************/
import { StaffPositionSaveComponent } from 'src/app/setup/staff-position/save/staff.position.save.component';

//********************** START: Service & Models *********************/
import { StaffPosition } from 'src/app/setup/models/staff.position.model';
import { HttpService } from "src/app/services/app.http.service";
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { MessageService } from 'src/app/services/app.message.service';
import { AuthService } from 'src/app/helper/app.auth.service';


/********************** START: Common *********************/
import { Configurations } from 'src/app/helper/config/app.config';
import { Messages } from 'src/app/helper/config/app.messages';
import { StaffPositionApi } from 'src/app/helper/config/app.webapi';
import { ENU_Permission_Module, ENU_Permission_Setup } from 'src/app/helper/config/app.module.page.enums';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';

@Component({
  selector: 'staff-position-search',
  templateUrl: './staff.position.search.component.html'
})
export class StaffPositionSearchComponent implements OnInit {

  // #region Local Members

  @ViewChild(MatPaginator) paginator: MatPaginator;

  isSaveStaffPositionAllowed: boolean = false;

  /* Messages */
  messages = Messages;
  errorMessage: string;
  successMessage: string;

  /* Pagination */
  totalRecords: number = 0;
  defaultPageSize = Configurations.DefaultPageSize;
  pageSizeOptions = Configurations.PageSizeOptions;
  pageNumber: number = 1;
  pageIndex: number = 0;
  isExpand: boolean = true;
  inputName: string = '';
  isDataExists: boolean = false;
  previousPageSize = 0;

  /* Collection types */
  staffpositions: StaffPosition[] = [];

  staffposition = new StaffPosition();
  // #endregion

  constructor(
    private _authService: AuthService,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dialog: MatDialogService
  ) { }

  ngOnInit() {
    this.isSaveStaffPositionAllowed = this._authService.hasPagePermission(ENU_Permission_Module.Setup, ENU_Permission_Setup.StaffPosition_Save);
  }

  ngAfterViewInit() {
    this.paginator.pageSize = this.defaultPageSize;
    this.previousPageSize = this.defaultPageSize;
    this.getStaffPositions();
  }

  // #region Events

  onAddClick() {
    this.openDialogForSaveStaffPosition(0);
  }

  onEditClick(staffPositionID: number) {
    this.openDialogForSaveStaffPosition(staffPositionID);
  }

  openDialogForSaveStaffPosition(staffPositionID: number) {
    if (staffPositionID > 0) {
      this.getStaffPositionById(staffPositionID);
    }
    else {
      this.staffposition = new StaffPosition();
      this.openDialog();
    }
  }

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
    this.getStaffPositions();
  }

  // #endregion

  // #region Methods

  getStaffPositionById(staffPositionID: number) {
    this._httpService.get(StaffPositionApi.getByID + staffPositionID)
      .subscribe(data => {
        if (data && data.Result) {
          this.staffposition = data.Result;
          this.openDialog();
        }
      });
  }

  openDialog() {
    const dialogRef = this._dialog.open(StaffPositionSaveComponent,
      {
        disableClose: true,
        data: this.staffposition
      });

    dialogRef.componentInstance.staffPositionSaved.subscribe((isSaved: boolean) => {
      if (isSaved) {
        this.getStaffPositions();
      }
    });
  }

  deleteStaffPosition(staffPositionID: number) {

    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, { disableClose: true , data: { header: this.messages.Delete_Messages.Del_Msg_Generic.replace("{0}", "") , description: this.messages.Delete_Messages.Del_Msg_Undone} });
    deleteDialogRef.componentInstance.confirmDelete.subscribe((isConfirmDelete: boolean) => {
      if (isConfirmDelete) {
        if (staffPositionID) {
          this._httpService.delete(StaffPositionApi.delete + staffPositionID)
            .subscribe((res: any) => {
              if (res && res.MessageCode > 0) {
                this._messageService.showSuccessMessage(this.messages.Success.Delete_Success.replace("{0}", "Staff Position"));
                this.getStaffPositions();
              }
              else if (res && res.MessageCode <= 0) {
                this._messageService.showErrorMessage(res.MessageText);
              }
              else {
                this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Staff Position"));
              }
            },
              err => { this._messageService.showErrorMessage(this.messages.Error.Delete_Error.replace("{0}", "Staff Position")); }
            );
        }
      }
    })
  }

  getStaffPositions() {
    let url = StaffPositionApi.getAll.replace("{pageNumber}", this.pageNumber.toString()).replace("{pageSize}", this.paginator.pageSize.toString());
    this._httpService.get(url)
      .subscribe(data => {
        if (data && data.MessageCode > 0) {
          this.isDataExists = data.Result != null && data.Result.length > 0 ? true : false;
          if (this.isDataExists) {
            if (data.Result.length > 0) {
              this.totalRecords = data.TotalRecord;
            }
            else {
              this.totalRecords = 0;
            }
            this.staffpositions = data.Result;
          }
          else {
            this.staffpositions = [];
          }
        }
        else {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Position"));
        }
      },
        err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Staff Position")); }
      );
  }

  // #endregion

}