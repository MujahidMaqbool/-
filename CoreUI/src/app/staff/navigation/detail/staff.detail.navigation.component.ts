/************************ Angular References **************************/
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
/********************* Material Reference ********************/

/************************ Services & Models **************************/
/* Services */
import { DataSharingService } from 'src/app/services/data.sharing.service';

/* Models */

/********************** Components *********************************/


/********************** Common *********************************/
import { Messages } from 'src/app/helper/config/app.messages';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_Staff } from 'src/app/helper/config/app.module.page.enums';

@Component({
    selector: 'staff-detail-navigation',
    templateUrl: './staff.detail.navigation.component.html'
})

export class StaffDetailNavigationComponent implements OnInit {
    staffID: number = 0;

    allowedPages = {
        Activities: false,
        Documents: false,
        NextOfKin: false,
        Save: false,
        Forms : false
      };

    messages = Messages;

    constructor(
        private _authService: AuthService,
        private _route: ActivatedRoute,
        private _dataSharingService: DataSharingService,
    ) { }

    ngOnInit() {
        this.getStaffIdFromRoute();
        this.setPermissions();
    }

    getStaffIdFromRoute() {
        this._route.paramMap.subscribe(params => {
            this.staffID = +params.get('StaffID');
            this._dataSharingService.shareStaffID(this.staffID);
        });
    }

    setPermissions() {
        this.allowedPages.Save = this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Save);
        this.allowedPages.Activities = this.staffID > 0 && this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Activity_View);
        this.allowedPages.Documents = this.staffID > 0 && this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Document_View);
        this.allowedPages.NextOfKin = this.staffID > 0 && this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.NextOfKin);
        this.allowedPages.Forms = this.staffID > 0 && this._authService.hasPagePermission(ENU_Permission_Module.Staff, ENU_Permission_Staff.Forms);
    }
}