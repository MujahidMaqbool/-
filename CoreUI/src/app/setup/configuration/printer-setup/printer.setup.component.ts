/********************** Angular References *********************/
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
/********************** Services & Models *********************/
/* Models */
/* Services */
import { HttpService } from 'src/app/services/app.http.service';
import { MessageService } from 'src/app/services/app.message.service';
import { PrintService } from 'src/app/services/print.service';

/********************** Common *********************/
import { Messages } from 'src/app/helper/config/app.messages';
import { environment } from 'src/environments/environment';
import { ImageEditorPopupComponent } from 'src/app/application-dialog-module/image-editor/image.editor.popup.component';
import { PrinterSetup } from '../../models/printer.setup.model';
import { PrinterSetupApi } from 'src/app/helper/config/app.webapi';
import { DiscountSetupApi } from 'src/app/helper/config/app.webapi';
import { ApiResponse, DD_Branch } from 'src/app/models/common.model';
import { MatDialogService } from 'src/app/shared/components/generics/mat.dialog.service';
import { LoaderService } from 'src/app/services/app.loader.service';
import { AppUtilities } from 'src/app/helper/aap.utilities';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { DateTimeService } from 'src/app/services/date.time.service';
import { TimeFormatPipe } from 'src/app/application-pipes/time-format.pipe';
import { DeleteConfirmationComponent } from 'src/app/application-dialog-module/delete-dialog/delete.confirmation.component';
import { ENU_Permission_Setup } from 'src/app/helper/config/app.module.page.enums';
import { CommonService } from 'src/app/services/common.service';
import { AbstractGenericComponent } from 'src/app/shared/helper/abstract.generic.component';

@Component({
  selector: 'printer-setup-details',
  templateUrl: './printer.setup.component.html'
})
export class PrinterSetupComponent extends AbstractGenericComponent implements OnInit {

  @ViewChild('printerSetupForm') printerSetupForm: NgForm;
  @ViewChild('discountForm') discountForm: NgForm;

  // #region Local Members
  isImageExist: boolean;
  printerSetupImage: string = './assets/images/printer_setup.png';

  /* Messages */
  hasSuccess: boolean = false;
  hasError: boolean = false;
  messages = Messages;
  errorMessage: string;
  successMessage: string;

  /* Collection Types */
  printerSetupModel: PrinterSetup;
  copyPrinterSetupModel: PrinterSetup;
  private _printService: PrintService;

  /* Local Members*/
  discountPassword: string = "";
  isImageExists: boolean;
  imagePath: string = "";
  branchID: number;

  /* Configurations */
  serverImageAddress = environment.imageUrl;
  branchName: string;

  // #endregion

  constructor(
    private _httpService: HttpService,
    private _messageService: MessageService,
    private _loaderService: LoaderService,
    private _dialog: MatDialogService,
    private _dateTimeService: DateTimeService,
    private _TimeFormatPipe: TimeFormatPipe,
    private _dataSharingService: DataSharingService,
    private rewriteUrl: Location,
    private _commonService: CommonService,
  ) {
    super();
    this.printerSetupModel = new PrinterSetup();
  }

  /* Keys Allowed in Discount filed */
  allowedKeys: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete"];

  ngOnInit() {
    //rewrite the url state
    this.rewriteUrl.replaceState("/setup/configurations/pos");
    this.getPrinterSetupDetail();
    this.getCurrentBranchDetail();
  }

  
  // #region Events

  onReset() {
    this.printerSetupModel = new PrinterSetup();
    this.printerSetupModel = JSON.parse(JSON.stringify(this.copyPrinterSetupModel));
  }
  onTerminalPrinterReset() {
    this.printerSetupModel.PrinterIPAddress = this.copyPrinterSetupModel.PrinterIPAddress;
  }

  async getCurrentBranchDetail() {
    const branch = await super.getBranchDetail(this._dataSharingService);
    if (branch && branch.hasOwnProperty("Currency")) {
      this.branchID = branch.BranchID
      this.branchName = branch.BranchName;
    }
  }

  onTestPrint() {
    this.testPrint();
  }

  // #endregion

  // #region Methods

  testPrint() {
    if (this.printerSetupModel.PrinterIPAddress && this.printerSetupModel.PrinterIPAddress.length > 0) {
      this.printerSetupModel.branchName = this.branchName;
      this._printService = new PrintService(this._messageService, this._loaderService, this._dateTimeService, this._TimeFormatPipe);
      this._printService.test(this.printerSetupModel);
    }
  }

  getPrinterSetupDetail() {
    this._httpService.get(PrinterSetupApi.getPrinterConfiguration)
      .subscribe(
        (res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            if (res.Result) {
              this.printerSetupModel = res.Result;
              this.copyPrinterSetupModel = JSON.parse(JSON.stringify(this.printerSetupModel));

              if (this.printerSetupModel.ReceiptLogoPath && this.printerSetupModel.ReceiptLogoPath.length > 0) {
                this.isImageExist = true;
                this.imagePath = environment.imageUrl + this.printerSetupModel.ReceiptLogoPath;
                this.concatenateImagePath();
              }
            }
          }
          else {
            this._messageService.showErrorMessage(res.MessageText);
          }
        },
        error => {
          this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Printer Setup Detail"));
        });
  }

  preventCharacters(event: any) {
    let index = this.allowedKeys.findIndex(k => k == event.key);
    if (index < 0) {
      event.preventDefault()
    }
  }

  savePrinterSetup(isValid: boolean) {
    if (isValid && this.printerSetupForm.dirty) {
      this.hasSuccess = false;
      this.hasError = false;
      this.printerSetupModel.ReceiptEmail = this.printerSetupModel.ReceiptEmail ? this.printerSetupModel.ReceiptEmail.trim().toLowerCase() : "";
      this.printerSetupModel.WebSite = this.printerSetupModel.WebSite ? this.printerSetupModel.WebSite.trim() : "";
      this._httpService.save(PrinterSetupApi.save, this.printerSetupModel)
        .subscribe((res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            this.printerSetupModel = this.printerSetupModel;
            this.copyPrinterSetupModel = JSON.parse(JSON.stringify(this.printerSetupModel));

            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Printer Setup"));
          }
          else {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Printer Setup"));
          }
        },
          err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Printer Setup")); }
        );
    }
  }

  saveDiscount(isValid: boolean) {
    if (isValid && this.discountForm.dirty) {
      this._httpService.save(DiscountSetupApi.setDiscountPin, parseInt(this.discountPassword))
        .subscribe((res: ApiResponse) => {
          if (res && res.MessageCode > 0) {
            this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Discount Pin"));
            //this.resetDiscountForm();
            this.getPrinterSetupDetail();
          }
          else {
            this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Discount Pin"));
          }
        },
          err => { this._messageService.showErrorMessage(this.messages.Error.Save_Error.replace("{0}", "Discount Pin")); }
        )
    }
  }

  showImageCropperDialog() {
    const dialogInst = this._dialog.open(ImageEditorPopupComponent, {
      disableClose: true,
      data: {
        height: 55,
        width: 361,
        aspectRatio: 361 / 55,
        showWebCam: true
      }
    });

    dialogInst.componentInstance.croppedImage.subscribe((img: string) => {
      if (img && img.length > 0) {
        this.printerSetupModel.ImageFile = img;
        this.concatenateImagePath();
        this.printerSetupForm.form.markAsDirty();
      }
    });
  }

  concatenateImagePath() {
    this.imagePath = "";
    if (this.printerSetupModel.ImageFile && this.printerSetupModel.ImageFile != "") {
      this.imagePath = "data:image/jpeg;base64," + this.printerSetupModel.ImageFile;
      this.isImageExists = true;
    }
    else if (this.printerSetupModel.ReceiptLogoPath && this.printerSetupModel.ReceiptLogoPath != "") {
      this.imagePath = this.serverImageAddress.replace("{ImagePath}", AppUtilities.setOtherImagePath()) + this.printerSetupModel.ReceiptLogoPath;
      this.isImageExists = true;
    }
    else {
      this.isImageExists = false;
    }
  }

  resetDiscountForm() {
    this.discountForm.resetForm();

  }

  onDeleteImage() {
    const deleteDialogRef = this._dialog.open(DeleteConfirmationComponent, {
      disableClose: true,
      data: {
        header: this.messages.Delete_Messages.Del_Msg_Generic.replace(
          "{0}",
          "?"
        ),
        description: this.messages.Delete_Messages.Del_Msg_Undone,
      },
    });
    deleteDialogRef.componentInstance.confirmDelete.subscribe(
      (isConfirmDelete: boolean) => {
        if (isConfirmDelete) {
          this.discardImage();
        }
      }
    );
  }

  discardImage() {
    if(this.printerSetupModel.ReceiptLogoPath){
      this._commonService
      .deleteFile(
        ENU_Permission_Setup.PrinterConfig,
        this.branchID,
        this.printerSetupModel.ReceiptLogoPath
      )
      .subscribe(
        (response: ApiResponse) => {
          if (response && response.MessageCode > 0) {
            this._messageService.showSuccessMessage(
              this.messages.Success.Delete_Success.replace("{0}", "Image")
            );
            this.imagePath = "";
            this.printerSetupModel.ImageFile = "";
            this.isImageExists = false;
            this.printerSetupModel.ReceiptLogoPath = '';
          } else {
            this._messageService.showErrorMessage(
              this.messages.Error.Delete_Error.replace("{0}", "Image")
            );
          }
        },
        (err) => {
          this._messageService.showErrorMessage(
            this.messages.Error.Delete_Error.replace("{0}", "Image")
          );
        }
      );
    } else{
      this.imagePath = "";
      this.printerSetupModel.ImageFile = "";
      this.printerSetupModel.ReceiptLogoPath = "";
      this.isImageExists = false;
      this._messageService.showSuccessMessage(
        this.messages.Success.Delete_Success.replace("{0}", "Image")
      );
    }
   
  }
  // #endregion

}
