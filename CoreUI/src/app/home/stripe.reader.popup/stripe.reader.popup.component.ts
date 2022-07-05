
/********************** Angular Refrences *********************/
import { Component} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
/********************** Service & Models *********************/
/*Services*/

/*Models*/
/********************** Common and Customs *********************/


@Component({
    selector: 'stripe-reader-popup',
    template: `<div  tabindex="-1" aria-labelledby="myLargeModalLabel">
    <div class="modal-dialog-centered">
        <div class="modal-content medium_popup">
            <div class="popup_header">
                <h4>Reader</h4>
            </div>
            <div class="popup_content cstm_scroll_bg stripe_us">
            <stripe-reader (closeDialog)="onClosePopup()"></stripe-reader>
            </div>
            <div class="row popup_footer">
                <div class="col-md-12">
                    <div class="cancel_btn float-right">
                        <button type="button" (click)="onClosePopup()">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    `
})

export class StripeReaderPopupComponent {
    
    constructor(
        public _dialogRef: MatDialogRef<StripeReaderPopupComponent>
    ) {

    }

    onClosePopup() {
        this._dialogRef.close();
    }

}