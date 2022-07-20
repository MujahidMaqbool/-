import { Component, OnInit } from '@angular/core';
import { AdvanceInventory } from 'src/app/setup/models/advance.inventory.model';
import { Location } from '@angular/common';
import { HttpService } from 'src/app/services/app.http.service';
import { ConfigurationsApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse } from 'src/app/models/common.model';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { SubscriptionLike } from 'rxjs';
import { ENU_Package } from 'src/app/helper/config/app.enums';
import { DataSharingService } from 'src/app/services/data.sharing.service';


@Component({
  selector: 'app-advanced',
  templateUrl: './advanced.component.html'
})
export class AdvancedComponent implements OnInit {

  // Model & Listing
  advanceInventory: AdvanceInventory = new AdvanceInventory();

  //local
  messages = Messages;

  packageIdSubscription: SubscriptionLike;
  package = ENU_Package;


  constructor(
    private rewriteUrl: Location,
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _dataSharingService: DataSharingService
  ) { }

  ngOnInit(): void {
    this.rewriteUrl.replaceState("/setup/configurations/advance");
    this.getFundamental();
  }

  //Save Advanced Setting
  saveAdvanceSetting() {
    this._httpService.save(ConfigurationsApi.saveAdvanceSetting, this.advanceInventory).subscribe((res: ApiResponse) => {
      if (res.MessageCode && res.MessageCode > 0) {
        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Advance information"))
      } else {
        this._messageService.showErrorMessage(res.MessageText);
      }
    })
  }

  // get fundamental
  getFundamental() {
    this._httpService.get(ConfigurationsApi.getFundamentalAdvanceSetting).subscribe((res: ApiResponse) => {
      if (res.MessageCode > 0 && res.Result) {
        this.advanceInventory = res.Result;
      } else {
        this._messageService.showErrorMessage(res.MessageText);
      }
    })
  }

  //On Reset
  setDefaultValues(){
    this.advanceInventory = new AdvanceInventory();
  }
}
