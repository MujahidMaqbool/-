import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {Subject, Observable} from 'rxjs';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { MessageService } from '@app/services/app.message.service';

@Component({
  selector: 'image-capture',
  templateUrl: './image.capture.component.html'
})
export class ImageCaptureComponent implements OnInit {
  @Output()
  public imgCaptured = new EventEmitter<WebcamImage>();
  @Output()
  public imgCaptureError = new EventEmitter<boolean>();

  public showTakePhoto: boolean;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();

  constructor(private _messagesService: MessageService){}

  public ngOnInit() {
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public camSwitched($event) {
    this.showTakePhoto = true;
  }

  public handleInitError(error: WebcamInitError): void {
    //this.errors.push(error);
    this.imgCaptureError.emit(true);
    this._messagesService.showErrorMessage(error.message);
  }

  public handleImage(webcamImage: WebcamImage): void {
    //console.info('received webcam image', webcamImage);
    this.imgCaptured.emit(webcamImage);
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
}
