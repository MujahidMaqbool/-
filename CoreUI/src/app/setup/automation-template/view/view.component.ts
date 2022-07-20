import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/app.http.service';
import { AutomationTemplateApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse } from 'src/app/models/common.model';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { ENU_CommunicationType } from 'src/app/helper/config/app.enums';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
})
export class ViewComponent implements OnInit {
  templateText: any;
  response: ApiResponse;
  messages = Messages;
  enu_CommunicationType = ENU_CommunicationType;
  
  constructor(
    private dialogRef: MatDialogRef<ViewComponent>,
    private _httpService: HttpService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public AutomationTemplateID: number,
  ) { }
  ngOnInit(): void {
    this.loadTemplate(this.AutomationTemplateID);
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  loadTemplate(automationTemplateID: number) {
    this._httpService.get(AutomationTemplateApi.viewTemplate + automationTemplateID)
      .subscribe((res: ApiResponse) => {
        if (res && res.MessageCode > 0) {
          this.templateText = res.Result;
        }
        else {
          this._messageService.showErrorMessage(res.MessageText);
          this.onCloseDialog();
        }
      },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace('{0}', "Automation Template"));
          this.onCloseDialog();
        });
  }
}
