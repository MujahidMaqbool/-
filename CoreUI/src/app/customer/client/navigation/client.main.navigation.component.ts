/************************ Angular References **************************/
import { Component } from '@angular/core';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_ClientAndMember } from 'src/app/helper/config/app.module.page.enums';
/********************* Material Reference *****************************/

/************************ Services & Models ***************************/
/* Services */


/* Models */

/********************** Components *************************************/


/**************************** Common *********************************/



@Component({
    selector: 'client-main-navigation',
    templateUrl: './client.main.navigation.component.html'
})

export class ClientMainNavigationComponent {

    allowedPages = {
        Dashboard: false,
        View: false,
    };

    constructor(private _authService: AuthService) {
        this.setPermissions();
    }

    setPermissions() {
        this.allowedPages.Dashboard = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.Dashboard);
        this.allowedPages.View = this._authService.hasPagePermission(ENU_Permission_Module.Customer, ENU_Permission_ClientAndMember.View);
    }
}