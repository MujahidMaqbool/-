import { Injectable } from "@angular/core";
import { MatSnackBar } from '@angular/material/snack-bar';

import { Configurations } from "src/app/helper/config/app.config"


@Injectable({ providedIn: 'root'})
export class MessageService{
    constructor(public snackBar: MatSnackBar)
    {

    }

    private showMessage(message:string, messageType: number){
        let msgClass= 'success';
        if(messageType === MessageType.Error)
        {
            msgClass = 'error';
        }
        if(messageType === MessageType.Warning){
            msgClass = 'warning';
        }

        this.snackBar.open(message, 'Close', {
            duration: Configurations.SuccessMessageTimeout,
            panelClass: msgClass,
            horizontalPosition: 'right',
            verticalPosition: 'bottom'
          });
    }

    showErrorMessage(message: string){
        this.showMessage(message, MessageType.Error);
    }

    showWarningMessage(message: string){
        this.showMessage(message, MessageType.Warning);
    }

    showSuccessMessage(message: string){
        this.showMessage(message, MessageType.Success);
    }

}

export enum MessageType {
    Error = 1,
    Success = 2,
    Warning = 3,
}