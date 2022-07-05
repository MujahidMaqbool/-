// #region Angular References
import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';

/*****Material/ Third party imports  ******/
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/****Model/enums *******/
import { Attribute, AttributeValue, AttributeBranch } from '@app/product/models/attributes.model';


/**** * Configurations ******/
import { AttributeApi } from '@app/helper/config/app.webapi';
import { HttpService } from '@app/services/app.http.service';
import { MessageService } from '@app/services/app.message.service';
import { Messages } from '@app/helper/config/app.messages';
import { AbstractGenericComponent } from '@app/shared/helper/abstract.generic.component';
import { DataSharingService } from '@app/services/data.sharing.service';
import { EnumSaleSourceType } from '@app/helper/config/app.enums';




@Component({
  selector: 'app-attribute-save',
  templateUrl: './save.attribute.component.html',
})
export class SaveAttributeComponent extends AbstractGenericComponent implements OnInit {

  /*********** region Local Members ****/
  @Output() isSaved = new EventEmitter<boolean>();
  @ViewChild('scrollContainer') private myScrollContainer: ElementRef;
  /* Model References */
  attribute: Attribute = new Attribute();
  attributeValues: AttributeValue;


  //Local variables
  messages = Messages;
  submitted: boolean = false;
  isShowRequired: boolean = false;
  showContinue: boolean = true;
  showPrevious: boolean = false;
  showSave: boolean = false;
  disableSaveBtn: boolean = false;
  inValidProductAttributeName: boolean = false;
  showDuplicateValueError: boolean = false;
  branchInfo :AttributeBranch = new AttributeBranch();
  disableInput: boolean = false;
  appSourceTypeID = EnumSaleSourceType;

  constructor(
    private _dataSharingService: DataSharingService,
    private _dialog: MatDialogRef<SaveAttributeComponent>,
    private _httpService: HttpService,
    private _messageService: MessageService,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {
    super();
    this.getCurrentBranchDetail();
   }

  ngOnInit(): void {

    if (this.dialogData.attributeID > 0 && this.dialogData.attributeID != null && this.dialogData.attributeID != undefined) {
      this.attribute.AttributeID = this.dialogData.attributeID;
      this.disableInput = (this.dialogData.appSourceTypeID && this.dialogData.appSourceTypeID === this.appSourceTypeID.EnterPrise) ? true : false;
      this.getAttributeDetailByID(this.dialogData.attributeID);
    } else {
      this.attribute.AttributeID = 0;

    }

  }

   /* get branch details */
   async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch) {
      this.getBranchInfo(branch.BranchID)
    }
  }

  // get the branch info
  getBranchInfo(BranchID : number){
    this.branchInfo.BranchID = BranchID;
    this.attribute.AttributeBranchVM.push(this.branchInfo);

  }

  getAttributeDetailByID(productAttributeID: number) {
    let param = AttributeApi.getAttributeDetailByID + productAttributeID;
    this._httpService.get(param).subscribe((response) => {
      if (response.MessageCode > 0) {
        this.attribute = response.Result;
        this.attribute.AttributeBranchVM = this.attribute.AttributeBranchVM.filter(i => i.BranchID == this.branchInfo.BranchID);
         /**********Sort variants according to sort number in array******** */
         if(this.attribute.AttributeValueVM){
          this.attribute.AttributeValueVM.sort(function(a, b) {
            return Number(a.SortOrder) - Number(b.SortOrder);
          });
         }

      }
      else if(response.MessageCode < 0){
        this._messageService.showErrorMessage(response.MessageText);
        this.onCloseDialog();
      }
      else {
        this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "attribute detail"));
      }
    },
      error => {
        this._messageService.showErrorMessage(error);
      });
  }

  isValidVarientValues(){
    var result: boolean = true;

    this.attribute.AttributeValueVM.forEach((element) => {
      if(element.AttributeValue.trim() == "" || element.AttributeValue == null || element.AttributeValue == undefined) {
        result = false;
      }
    });

    this.isShowRequired = !result ? true : false;
    return result
  }

  onBlur(index){
    this.attribute.AttributeValueVM[index].AttributeValue = this.attribute.AttributeValueVM[index].AttributeValue.trim();
    this.isValidVarientValues();
  }

  delete(index: any) {
    this.attribute.AttributeValueVM.splice(index, 1);
  }

  addNew() {
    this.submitted = true;
    if (this.isValidVarientValues()) {
      var newVariantValue = new AttributeValue();
      this.attribute.AttributeValueVM.push(newVariantValue);
    }
    setTimeout(()=> {this.scrollToBottom()}, 25);
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  /***********Check duplicates **************/
  checkIfDuplicateExists(array): boolean {
    let valueArr = array.map(function (item) { return item.AttributeValue.trim().toLowerCase() });
    var isDuplicate = valueArr.some(function (item, idx) {

      return valueArr.indexOf(item) != idx
    });
    return isDuplicate;
  }

  // befor save set sort order of Variant Values
  setVariantValueSortOrder(): Attribute {
    this.attribute.AttributeBranchVM = this.attribute.AttributeBranchVM.filter(i => i.BranchID == this.branchInfo.BranchID);
    let result = JSON.parse(JSON.stringify(this.attribute))
    result.AttributeValueVM.forEach((element, index) => {
      element.SortOrder = index;
    });

    return result;
  }

  onSave() {
    this.submitted = true;
    this.attribute.AttributeName = this.attribute.AttributeName.trim();
    if (this.isValidVarientValues() && this.attribute.AttributeName != "" && this.attribute.AttributeName != null) {
      this.disableSaveBtn = true;
      /**Check unique attributes variant values */
      if (this.checkIfDuplicateExists(this.attribute.AttributeValueVM)) {
        this.showDuplicateValueError = true;
        this.disableSaveBtn = false;
      } else {


        this._httpService.save(AttributeApi.saveAttribute, this.setVariantValueSortOrder()).subscribe((response) => {
          if (response.MessageCode > 0) {
            this.isSaved.emit(true);
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Attribute"));
            this.onCloseDialog();
            this.disableSaveBtn = false;
          } else if(response.MessageCode < 0) {
            this.disableSaveBtn = false;
            this._messageService.showErrorMessage(response.MessageText);
            this.onCloseDialog();
          }
          else {
            this.disableSaveBtn = false;
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "attribute"));
          }

        },
          error => {
            this.disableSaveBtn = false;
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "attribute"));
          });
      }

    } else {
      this.inValidProductAttributeName = true;
    }

  }


  onCloseDialog() {
    this._dialog.close();
  }


}
