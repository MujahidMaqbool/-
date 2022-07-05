import { Component, Inject, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';

/********************** START: Service & Models *********************/
import { HttpService } from '@services/app.http.service';
import { MessageService } from '@services/app.message.service';
import { Messages } from '@app/helper/config/app.messages';
import { StaffPositionApi } from '@app/helper/config/app.webapi';

/********************** START: Common *********************/


@Component({
  selector: 'staff-position-save',
  templateUrl: './staff.position.save.component.html'
})
export class StaffPositionSaveComponent implements OnInit {

  @ViewChild('staffPositionForm') staffPositionForm: NgForm;

  @Output()
  staffPositionSaved = new EventEmitter<boolean>();

  /* Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;
  pageTitle: string;

  constructor(
    private _httpService: HttpService,
    private _messageService: MessageService,
    public dialogRef: MatDialogRef<StaffPositionSaveComponent>,
    @Inject(MAT_DIALOG_DATA) public staffPosition: any) {
  }

  ngOnInit() {
    if (this.staffPosition.StaffPositionID > 0) {
      this.pageTitle = "Staff Position";
    }
    else {
      this.pageTitle = "Staff Position";
    }
  }

  onPositionNameUpdated() {
    this.staffPosition.StaffPositionName = this.staffPosition.StaffPositionName.trim();
  }

  saveStaffPosition(isValid: boolean) {
    if (isValid && this.staffPositionForm.dirty) {
      this.hasSuccess = false;
      this.hasError = false;

      this._httpService.save(StaffPositionApi.save, this.staffPosition)
        .subscribe((res: any) => {
          if (res && res.MessageCode > 0) {
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Staff Position"));
            this.onClosePopup();
            this.staffPositionSaved.emit(true);
          }
          else if (res && res.MessageCode <= 0) {
            this._messageService.showErrorMessage(res.MessageText);
          }
          else {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff Position"));
          }
        },
          err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Staff Position")); }
        );
    }
  }

  onClosePopup(): void {
    this.dialogRef.close();
  }
}