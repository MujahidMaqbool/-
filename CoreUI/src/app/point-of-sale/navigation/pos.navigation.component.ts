/************************ Angular References **************************/
import { Component } from '@angular/core';
import { AuthService } from 'src/app/helper/app.auth.service';
import { ENU_Permission_Module, ENU_Permission_PointOfSale } from 'src/app/helper/config/app.module.page.enums';
import { Router } from '@angular/router';
/********************* Material Reference *****************************/

/************************ Services & Models ***************************/
/* Services */


/* Models */

/********************** Components *************************************/


/**************************** Common *********************************/
@Component({
    selector: 'pos-navigation',
    templateUrl: './pos.navigation.component.html'
})

export class PointOfSaleNavigationComponent {

    allowedPages = {
        Invoices: false,
        Bookings: false,
        Attendance: false,
        ClassBooking: false,
        ServiceBooking: false,
        ProductBooking: false,
        ViewForm: false,
        ViewWaitList: false,
    };
    url: any;

    constructor(private _authService: AuthService, public route: Router) {
        // case of refresh page
        var activeRoute: string = this.route.url;
        this.getUrl(activeRoute.substring(activeRoute.lastIndexOf('/') + 1));

        this.setPermissions();
    }

    setPermissions() {
        this.allowedPages.Invoices = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.InvoiceHistory);
        this.allowedPages.Bookings = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.BookingHistory);
        this.allowedPages.Attendance = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Attendance);
        this.allowedPages.ClassBooking = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Class);
        this.allowedPages.ServiceBooking = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Service);
        this.allowedPages.ProductBooking = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.Product);
        this.allowedPages.ViewForm = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.ViewForm);
        this.allowedPages.ViewWaitList = this._authService.hasPagePermission(ENU_Permission_Module.PointOfSale, ENU_Permission_PointOfSale.ViewWaitList);
    }

  // get url and highlighted dropdown selection
    getUrl(_url) {
        this.url = _url;
    }
}
