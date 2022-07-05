import { Component, OnInit, Output, EventEmitter, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-reset-count',
  templateUrl: './confirm.reset.count.component.html',
})
export class ConfirmResetCountComponent implements OnInit {

  @Output() confirmChanges = new EventEmitter<boolean>();


  constructor(
    private _dialogRef: MatDialogRef<ConfirmResetCountComponent>,
    @Inject(MAT_DIALOG_DATA) public isSetupPage: Boolean
  ) { }

  ngOnInit() {
  }

  onYes(){
    this.confirmChanges.emit(true);
    this.onClose();
  }

  onClose() {
    this._dialogRef.close();
  }

}
