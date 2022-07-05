import { TemplateRef, Injectable } from "@angular/core";
import { MatDialog, MatDialogRef, MatDialogConfig } from "@angular/material/dialog";
import { ComponentType } from "@angular/cdk/overlay/index";
import { Router, NavigationStart } from "@angular/router";

@Injectable()
export class MatDialogService {
    constructor(private _router: Router,
        private _dialog: MatDialog) {
        this._router.events.subscribe((val) => {
            if (val instanceof NavigationStart) {
                this.close();
            }
        });
    }

    open<T, D = any, R = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>, config?: MatDialogConfig<D>): MatDialogRef<T, R> {
        return this._dialog.open(componentOrTemplateRef, config);
    }

    close() {
        this._dialog.closeAll()
    }

    closeAll() {
        this.close();
    }
}