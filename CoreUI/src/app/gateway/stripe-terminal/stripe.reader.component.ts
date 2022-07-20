/********************** Angular Refrences *********************/
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
  Input,
} from "@angular/core";
/********************** Service & Models *********************/
/*Services*/
import { DynamicScriptLoaderService } from "src/app/services/dynamic.script.loader.service";
import {
  StripeService,
  StripeDataSharingService,
} from "src/app/services/stripe.service";
import { Messages } from "src/app/helper/config/app.messages";
import { StripeReaderPopupComponent } from "src/app/home/stripe.reader.popup/stripe.reader.popup.component";
import { SubscriptionLike, Observable } from "rxjs";
import { DataSharingService } from "src/app/services/data.sharing.service";
import { LoaderService } from "src/app/services/app.loader.service";
import { MessageService } from "src/app/services/app.message.service";
import { ENU_ReaderStatus } from "src/app/helper/config/app.enums";
/*Models*/
/********************** Common and Customs *********************/
var loaderService;

@Component({
  selector: "stripe-reader",
  templateUrl: "./stripe.reader.component.html",
})
export class StripeReaderComponent implements OnInit {
  @Output() closeDialog = new EventEmitter<boolean>();

  @ViewChild("stripeReaderComponentRef")
  stripeReaderComponentRef: StripeReaderPopupComponent;
  // #region Local Members
  stripeTerminalSubscription: SubscriptionLike;
  isReaderConneted: boolean = false;
  hasstripeReader:  boolean;
  /* Model References */

  /* Configurations */
  messages = Messages;
  enu_ReaderStatus = ENU_ReaderStatus;
  // #endregion
  readerSubscription: SubscriptionLike;
  stripeReaderList: any[];
  stripeTerminalLoactionSubscription: SubscriptionLike;

  constructor(
    private _stripeService: StripeService,
    private _dynamicScriptLoader: DynamicScriptLoaderService,
    private _stripeDataSharingService: StripeDataSharingService,
    private _dataSharingService: DataSharingService,
    private _loaderService: LoaderService,
    private _messageService: MessageService,
    private ref: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadScripts();
    // this.readerSubscription = this._stripeService.readDetailList.subscribe((readDetailList) => {
    //     this.hasstripeReader = readDetailList && readDetailList.length > 0 ? true : false;
    //     this.stripeReaderList = readDetailList;
    // });

    this.readerSubscription = this._dataSharingService.isStripeReaderSaved.subscribe(
      (isStripeReaderSaved: boolean) => {
        if (isStripeReaderSaved) {
          this.getReaderList();
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.stripeTerminalSubscription) {
      this.stripeTerminalSubscription.unsubscribe();
    }
    if (this.readerSubscription) {
      this.readerSubscription.unsubscribe();
    }

    if(this.stripeTerminalLoactionSubscription){
      this.stripeTerminalLoactionSubscription.unsubscribe();
    }
  }

  ngAfterContentChecked() {
    this.ref.detectChanges();
  }
  getStripeTerminalConfig() {
    this._stripeService.initializeTerminal();
    // let selectedReaderSerialNumber = JSON.parse(localStorage.getItem(variables.StripeTerminalSerialNumber));
    // if (selectedReaderSerialNumber != null && selectedReaderSerialNumber != "undefined") {
    //     this._stripeService.discoverReader(selectedReaderSerialNumber).then(response => {
    //         this.hasstripeReader = response && response.length > 0 ? true : false;
    //         this.stripeReaderList = response;
    //     });
    // }
    // else {

    //   }
    this.getReaderList();
  }

  getReaderList(isShareConnectionInfo: boolean = true) {

    this.stripeTerminalLoactionSubscription =this._dataSharingService.stripeTerminalLoactionID.subscribe(
      (locationID: string) => {
        if (locationID) {
          this._stripeService.discoverReader("", locationID).then((response) => {
            // this.hasstripeReader = new Observable<boolean>((observer) => {
            //   observer.next(response && response.length > 0 ? true : false);
            // });
            this.hasstripeReader = response && response.length > 0 ? true : false;
            this._stripeService
              .getConnectionStatus()
              .then((isReaderConneted: any) => {
                // console.log('connection status', response);
                if (isReaderConneted == this.enu_ReaderStatus.Connected) {
                  this.isReaderConneted = true;

                } else {
                  this.isReaderConneted = false;
                }
                if(isShareConnectionInfo)
                  this._dataSharingService.shareStripeTerminalConnectedOrDisconnected(true);
              });
            this.stripeReaderList = response;
          });
        } else{
          this._messageService.showWarningMessage('No available readers.');
        }
      }
    );
  }

  onDisconnectReader() {
    this._stripeService.disConnectReader().then((response) => {
      if (response) {
        this._messageService.showSuccessMessage(
          this.messages.Success.Reader_Disconnect
        );
        this.getReaderList();
      }
    });
  }

  onConnectReader(reader: any) {
    this._stripeService.connectReader(reader).then((isResolved) => {
      if (isResolved) {
        this.closeDialog.emit(true);
        this.getStripeTerminalConfig();
      }
    });
  }

  private loadScripts() {
    // You can load multiple scripts by just providing the key as argument into load method of the service
    this._dynamicScriptLoader
      .load("stripejs", "stripeterminaljs")
      .then((data) => {
        // Script Loaded Successfully
        // console.log(data)
        this.getStripeTerminalConfig();
      })
      .catch((error) => console.log(error));
  }
}
