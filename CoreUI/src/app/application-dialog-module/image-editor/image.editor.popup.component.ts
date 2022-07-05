import { Component, Output, EventEmitter, Inject, ViewChild } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { ImageEditorComponent } from "./image.editor.component";

@Component({
    selector: 'image-editor-popup',
    templateUrl: 'image.editor.popup.component.html'
})

export class ImageEditorPopupComponent {
    @Output() croppedImage = new EventEmitter<string>();
    @ViewChild('imageEditor') public imageEditor: ImageEditorComponent;

    constructor(
        public dialogRef: MatDialogRef<ImageEditorPopupComponent>,
        @Inject(MAT_DIALOG_DATA) public config: any) {
    }

    ngOnInit() {

    }

    onClose() {
        this.croppedImage.emit("");
        this.closeDialog();
    }

    onCrop() {
        let img = this.imageEditor.croppedImg;
        // remove 'data:image/jpeg;base64,' from string
        img = img.substr(img.indexOf("base64,") + 7, img.length);
        this.croppedImage.emit(img);
        this.closeDialog();
    }

    closeDialog() {
        this.dialogRef.close();
    }
}