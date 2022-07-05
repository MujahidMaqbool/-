import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { ProductApi } from '@app/helper/config/app.webapi';
import { ApiResponse } from '@app/models/common.model';
import { Messages } from '@app/helper/config/app.messages';

@Component({
  selector: 'app-restore-variant',
  templateUrl: './restore.variant.component.html',
})
export class RestoreVariantComponent implements OnInit {

  productVairantList: any = [];
  selectAll: boolean = false;
  productVariantBranchIDList: any = [];
  messages = Messages;
  commaSeprated: string = "";
  @Output()
    isRestore = new EventEmitter<boolean>();
  constructor(
    private _dialog: MatDialogRef<RestoreVariantComponent>,
    @Inject(MAT_DIALOG_DATA) public deletedProductVariant: any,
    private _httpService: HttpService,
    private _messageService: MessageService,

  ) { }

  ngOnInit(): void {
    this.productVairantList = this.deletedProductVariant;
    this.productVairantList.VariantInfo.forEach(element => {
      element.isSelected = false;
    });
    console.log(this.productVairantList)

  }
  onCloseDialog() {
    this._dialog.close();
  }

  selectAllVaraints(event: any) {
    event.target.checked ? this.productVairantList.VariantInfo.filter(x => x.isSelected = true) :
      this.productVairantList.VariantInfo.filter(x => x.isSelected = false);

    event.target.checked ? this.extractProductBranchIdsFromList() : this.productVariantBranchIDList = []
    if (event.target.checked) {
      this.extractProductBranchIdsFromList()
    } else {
      this.productVariantBranchIDList = [];
      this.commaSeprated = '';
    }

    this.selectAll = event.target.checked ? true : false;
    console.log(this.productVariantBranchIDList)
  }

  onSingleSelect(event: any, ProductVariantID: number, parentIndex: number) {
    event.target.checked ? this.productVairantList.VariantInfo[parentIndex].isSelected = true : this.productVairantList.VariantInfo[parentIndex].isSelected = false;
    this.productVairantList.VariantInfo.every(x => this.selectAll = x.isSelected ? true : false)
    if (event.target.checked) {
      this.productVariantBranchIDList.push(ProductVariantID)
    } else {
      this.productVariantBranchIDList.forEach((item, index) => {
        if (item === ProductVariantID) this.productVariantBranchIDList.splice(index, 1);
      });
    }
    this.extractProductBranchIdsFromList(true);
  }

  extractProductBranchIdsFromList(isSingleSelect: boolean = false) {
    if (!isSingleSelect) {
      this.productVariantBranchIDList = [];
      this.productVairantList.VariantInfo.filter(v => {
        this.productVariantBranchIDList.push(v.ProductVariantID);
      })
    }
    this.commaSeprated = this.productVariantBranchIDList.join(",");
    console.log(this.commaSeprated)
  }

  restoreArchivedVariants() {
    // ProductApi.restoreArchivedProductVariant + "?productVariantIDs=" + this.commaSeprated
    this._httpService.get(ProductApi.restoreArchivedProductVariant +this.commaSeprated).subscribe((respose: ApiResponse) => {
      if (respose.MessageCode > 0) {
        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Restored variants"))
        this.isRestore.emit(true);
        this.onCloseDialog();

      } else {
        this._messageService.showSuccessMessage(respose.MessageText)
      }
    })
  }

}
