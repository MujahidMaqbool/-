/********************** Angular references *********************/
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/app.http.service';

/***************** START: Service & Models *********************/
import { ClassApi } from 'src/app/helper/config/app.webapi';
import { MessageService } from 'src/app/services/app.message.service';
import { Messages } from 'src/app/helper/config/app.messages';
import { DataSharingService } from 'src/app/services/data.sharing.service';
import { SubscriptionLike } from 'rxjs';
import { ENU_Package } from 'src/app/helper/config/app.enums';

/********************** START: Common *********************/

@Component({
    selector: 'class-view-save',
    templateUrl: './class.view.component.html'
})
export class ClassViewComponent implements OnInit {

  packageIdSubscription: SubscriptionLike;

    /**local models and object */
    isDataExists: boolean = false;
    isPurchaseRestrictionAllowed:boolean = false;
    messages = Messages;
    parentClassObj: any = {};
    classMembership: any = [];

    constructor(
        private _httpService: HttpService,
        public dialogRef: MatDialogRef<ClassViewComponent>,
        @Inject(MAT_DIALOG_DATA) public parentClassID: any,
        private _messageService: MessageService,
        private _dataSharingService: DataSharingService

    ) { }

    //#region angular hooks

    ngOnInit() {
        this.getParentClassView();

        // Subscribe package ID
        this.packageIdSubscription = this._dataSharingService.packageId.subscribe(
          (packageId: number) => {
            if (packageId && packageId > 0) {
              this.setPackageBasedPermissions(packageId);
            }
          }
        );
    }

    gOnDestroy() {
      this.packageIdSubscription?.unsubscribe();
    }


    setPackageBasedPermissions(packageID: number){
      this.isPurchaseRestrictionAllowed =  packageID == ENU_Package.Full ? true : false;
    }
    //#endregion

    //#region methods

    /**get parent class by id */
    getParentClassView() {
        this._httpService.get(ClassApi.getParentClassViewDetail + this.parentClassID.parentClassID).subscribe(res => {
            if (res && res.MessageCode > 0) {
                this.parentClassObj = res.Result;
                this.isDataExists = res.Result.Memberships && res.Result.Memberships.length > 0 ? true : false;
                if (this.isDataExists) {
                    this.classMembership = res.Result.Memberships;
                }
            }else{
                this._messageService.showErrorMessage(res.MessageText);
            }
        })
    }

    /**close popup */
    onClosePopup(): void {
        this.dialogRef.close();
    }

    //#endregion
}
