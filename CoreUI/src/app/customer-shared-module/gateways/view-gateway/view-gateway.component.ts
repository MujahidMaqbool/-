/*********************** Angular References *************************/
import { Component, Inject, OnInit } from '@angular/core';

/*********************** Material References *************************/
import { MatDialogRef,  } from '@angular/material/dialog';


@Component({
    selector: 'vieW-gateway',
    templateUrl: './view-gateway.component.html'
})

export class ViewGatewayComponent implements OnInit {



    constructor(
        private dialogRef: MatDialogRef<ViewGatewayComponent>) {
    }

    ngOnInit() {

    }

    // #region Event(s)

    onCloseDialog() {
        this.dialogRef.close();
    }

    // #endregion

    // #region Method(s)

    // #endregion

}
