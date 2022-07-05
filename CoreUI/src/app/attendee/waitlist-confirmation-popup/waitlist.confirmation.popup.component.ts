import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-waitlist-confirmation-popup',
  templateUrl: './waitlist.confirmation.popup.component.html',
})
export class WaitlistConfirmationPopupComponent implements OnInit {

  @Output()
  isAddedToWailtList = new EventEmitter<boolean>();

  constructor(
    private _dialogRef: MatDialogRef<WaitlistConfirmationPopupComponent>,
  ) { }

  ngOnInit(): void {
  }

  onChangeWaitList(val) {
    this.isAddedToWailtList.emit(val);
    this.onClose();
  }

  onClose() {
    this._dialogRef.close();
  }

}
