import { Component, ViewChild, Input, OnInit, OnDestroy } from "@angular/core";
import { CropperComponent } from 'angular-cropperjs';

@Component({
    selector: 'image-editor',
    templateUrl: 'image.editor.component.html'
})

export class ImageEditorComponent implements OnInit, OnDestroy {
    @ViewChild('cropper') public imgCropper: CropperComponent;

    @Input() height?: number;
    @Input() width?: number;
    @Input() aspectRatio?: number;
    @Input() showWebCam?: boolean;

    defaultHeight: number = 200;
    defaultWidth: number = 200;
    defaultAspectRatio: number = 1/1;

    imageUrl: any;
    croppedImg: string;
    showCropper: boolean;
    isCaptureImage: boolean = false;
    cropperConfig: object = {};

    constructor() {
    }

    ngOnInit() {
        this.height = this.height && this.height > 0 ? this.height : this.defaultHeight;
        this.width = this.width && this.width > 0 ? this.width : this.defaultWidth;
        this.aspectRatio = this.aspectRatio && this.aspectRatio > 0 ? this.aspectRatio : this.defaultAspectRatio;

        this.cropperConfig = {
            movable: true,
            zoomable: true,
            viewMode: 1,
            aspectRatio: this.aspectRatio,
            dragMode: 'move',
            toggleDragModeOnDblclick: false,
            autoCropArea: 0.5,
            //checkCrossOrigin: true //commented by fahad because not working cropper use this line after new update
        };
    }

    ngOnDestroy(){
        if(this.imgCropper && this.imgCropper.cropper) this.imgCropper.cropper.destroy();
    }

    onFileSelected(event) {
        const that = this;
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            that.showCropper = false;
            that.isCaptureImage = false;
            reader.onload = (eventCurr: ProgressEvent) => {
                that.imageUrl = (<FileReader>eventCurr.target).result;
                that.refreshCrop(that.imageUrl);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    onReCapture() {
        this.showCropper = false;
        this.imageUrl = null;
        this.isCaptureImage = true;
    }

    onImgCaptured(img: any){
        if (img && img._imageAsDataUrl && img._imageAsDataUrl.length > 0) {
            this.imageUrl = img._imageAsDataUrl;
            this.refreshCrop(this.imageUrl);
            this.showCropper = true;
        }
    }

    onImageCaptureError(hasError: boolean){
        if(hasError) this.isCaptureImage = false;
    }

    refreshCrop(img) {
        this.imageUrl = img;
        this.showCropper = true;
    }

    cropendImage(event) {
        this.croppedImg = this.getCroppedImage(this.height, this.width);
    }

    readyImage(event) {
        this.croppedImg = this.getCroppedImage(this.height, this.width);
    }

    getCroppedImage(height: number, width: number) {
        return this.imgCropper.cropper.getCroppedCanvas({height: height, width: width}).toDataURL('image/png');
    }

    rotate(turn) {
        turn = turn === 'left' ? -45 : 45;
        this.imgCropper.cropper.rotate(turn);
        this.croppedImg = this.getCroppedImage(this.height, this.width);
    }

    destroy() {
        this.imgCropper.cropper.destroy();
    }

    zoomManual() {
        this.croppedImg = this.getCroppedImage(this.height, this.width);
    }

    zoom(status) {
        status = status === 'positive' ? 0.1 : -0.1;
        this.imgCropper.cropper.zoom(status);
        this.croppedImg = this.getCroppedImage(this.height, this.width);
    }

    // move(offsetX, offsetY) {
    //   this.angularCropper.cropper.move(offsetX, offsetY);
    //   this.cropperRes = this.getCroppedImage(this.height, this.width);
    // }

    // scale(offset) {
    //   if (offset === 'x') {
    //     this.angularCropper.cropper.scaleX(-1);
    //   } else {
    //     this.angularCropper.cropper.scaleY(-1);
    //   }
    //   this.cropperRes = this.getCroppedImage(this.height, this.width);
    // }

    // clear() {
    //   this.angularCropper.cropper.clear();
    //   this.cropperRes = this.getCroppedImage(this.height, this.width);
    // }

    // disable() {
    //   this.angularCropper.cropper.disable();
    //   this.cropperRes = this.getCroppedImage(this.height, this.width);
    // }

    // enable() {
    //   this.angularCropper.cropper.enable();
    //   this.cropperRes = this.getCroppedImage(this.height, this.width);
    // }

    reset() {
        this.imgCropper.cropper.reset();
        this.croppedImg = this.getCroppedImage(this.height, this.width);
    }
}
