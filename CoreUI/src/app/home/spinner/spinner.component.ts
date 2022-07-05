import { Component, OnInit, ViewEncapsulation, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService } from '@app/services/app.loader.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class SpinnerComponent implements OnDestroy {

  _template = `<div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`;
  _loadingText = '';
  _threshold = 500;
  _timeout = 2000;
  _zIndex = 9999;

  @Input() public set zIndex(value: number) {
    this._zIndex = value;
  }

  public get zIndex(): number {
    return this._zIndex;
  }

  @Input()
  public set template(value: string) {
    this._template = value;
  }

  public get template(): string {
    return this._template;
  }

  @Input()
  public set loadingText(value: string) {
    this._loadingText = value;
  }

  public get loadingText(): string {
    return this._loadingText;
  }

  @Input()
  public set threshold(value: number) {
    this._threshold = value;
  }

  public get threshold(): number {
    return this._threshold;
  }

  @Input()
  public set timeout(value: number) {
    this._timeout = value;
  }

  public get timeout(): number {
    return this._timeout;
  }

  subscription: Subscription;
  showSpinner = false;

  constructor(private spinnerService: LoaderService) {
    this.createServiceSubscription();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  createServiceSubscription() {
    let thresholdTimer: any;
    let timeoutTimer: any;

    this.subscription =
      this.spinnerService.getMessage().subscribe(show => {
       
        if (show) {
          if (thresholdTimer) {
            return;
          }
          thresholdTimer = setTimeout(function () {
            thresholdTimer = null;
            this.showSpinner = show;
            timeoutTimer = setTimeout(function () {
              timeoutTimer = null;
              //this.showSpinner = false;
            }.bind(this), this.timeout);
          }.bind(this), this.threshold);
        } else {
          if (thresholdTimer) {
            clearTimeout(thresholdTimer);
            thresholdTimer = null;
          }
          clearTimeout(timeoutTimer);
          timeoutTimer = null;
          this.showSpinner = false;
        }
      });
  }
}
