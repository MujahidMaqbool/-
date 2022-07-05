import { Component, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '@env/environment';
import { variables } from '@app/helper/config/app.variable';
import { AppUtilities } from '@app/helper/aap.utilities';

@Component({
    selector: 'view-banner',
    templateUrl: './view.banner.component.html'
})
export class ViewWidgetBannerComponent {

    constructor(
        public dialogRef: MatDialogRef<ViewWidgetBannerComponent>,
        @Inject(MAT_DIALOG_DATA) public imagePath: string) { 
        this.imagePath = environment.imageUrl.replace("{ImagePath}",AppUtilities.setOtherImagePath()) + imagePath;
    }

    onCancel() {
        this.closePopup();
    }

    closePopup() {
        this.dialogRef.close();
    }
}