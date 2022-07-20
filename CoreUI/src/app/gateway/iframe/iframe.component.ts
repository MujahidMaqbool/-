import { Component, EventEmitter, Inject, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { LoaderService } from 'src/app/services/app.loader.service';
@Component({
  selector: 'app-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.css']
})
export class IframeComponent implements OnInit {

  @Output() isCancel = new EventEmitter<boolean>();
  @Output() isClosed = new EventEmitter<boolean>();
  redirectUrl: any;
  loadedCount: number = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer, private _loaderService: LoaderService) {
    this.redirectUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.url);
  }
  ngOnInit(): void {
    const iframe = <HTMLIFrameElement>document.getElementById('frameid');
    const handleLoad = (event) => {
      this.loadedCount++;
      if (this.loadedCount == 4) {
        this.onClosePopup();
      }
    };
    iframe.addEventListener('load', handleLoad, true);
  }

  onClosePopup() {
    this.isClosed.next(true);
  }
  onCancelPopup() {
    this._loaderService.show();
    this.isCancel.next(true);
  }
}
