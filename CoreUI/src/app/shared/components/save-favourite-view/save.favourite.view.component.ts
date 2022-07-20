/****************** Angular References **********/
import { Component, OnInit, Inject, EventEmitter, Output } from "@angular/core";
import {FormBuilder,FormGroup,Validators, AbstractControl} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialogService } from "src/app/shared/components/generics/mat.dialog.service";
import { HttpService } from "src/app/services/app.http.service";
import { MessageService } from "src/app/services/app.message.service";
import { Messages } from "src/app/helper/config/app.messages";
import { SchedulerApi } from "src/app/helper/config/app.webapi";
import { ApiResponse } from "src/app/models/common.model";

/**************** Services & Models ***************/
import { FavouriteViewModel } from 'src/app/scheduler/models/favourite.view.model';

/************** Configurations **************/

@Component({
    selector: 'save-favouriteView',
    templateUrl: './save.favourite.view.component.html'
})

export class FavouriteViewComponent implements OnInit {
    // #region Local Members 
    form: FormGroup;
    submitted:boolean = false;
    isSaveButtonDisabled: boolean = false;
    favouriteView: FavouriteViewModel = new FavouriteViewModel();
    @Output() onSave = new EventEmitter<boolean>(false);
    /* Local Members */  
    /* Configurations */
    messages = Messages;
    // #endregion

    // #endregion

    constructor(
        private _httpService: HttpService,
        public _dialog: MatDialogService,
        private _messageService: MessageService,
        public _dialogRef: MatDialogRef<FavouriteViewComponent>,
        @Inject(MAT_DIALOG_DATA) public popupData: any,
        private _formBuilder: FormBuilder
    ) {

    }

    

    ngOnInit() {
        this.form = this._formBuilder.group({
            name: ['', [ Validators.required, Validators.maxLength(60), Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]]
        });     
    }
  
    get f(): { [key: string]: AbstractControl } {
        return this.form.controls;
      }

    saveFavouriteView(): void {
        this.isSaveButtonDisabled = true;
        this.submitted = true;
       // this.form.value.name = this.form.value.name.replace(/^\s+|\s+$/g, '');
        if (this.form.invalid || this.popupData == null) {
            this.isSaveButtonDisabled = false;
            return;
        }
        this.favouriteView.schedulerFavouriteViewName = this.form.value.name;
        this.favouriteView.schedulerFavouriteViewDetail = this.popupData;

        this._httpService.save(SchedulerApi.saveSchedulerFavouriteView, this.favouriteView)
            .subscribe(
                (response: ApiResponse) => {                    
                    if (response && response.MessageCode > 0) {
                        this._messageService.showSuccessMessage(this.messages.Success.Save_Success.replace("{0}", "Favourite view"));
                        this.onSave.emit(true);
                        this.onClose();                                            
                    }
                    else {
                        this._messageService.showErrorMessage(response.MessageText);
                        this.isSaveButtonDisabled = false;
                    }
                   
                },
                err => { this._messageService.showErrorMessage(this.messages.Error.Get_Error.replace("{0}", "Favourite view")); this.isSaveButtonDisabled = false;}
            );
        
    }
    

    onClose(): void {
        this.isSaveButtonDisabled = false;   
        this._dialogRef.close();
    }  

    
    // #endregion
}