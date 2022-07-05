import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './app.auth.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationGuard implements CanActivate {

    constructor(private _router: Router) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let canActivate = false;
        if (AuthService.isUserLoggedIn()) {
            canActivate = true;
        }
        else {
            let loginUrl = '/account/login';
            let returnUrl = state.url;
            if (returnUrl === loginUrl) {
                returnUrl = '/';
            }
            this._router.navigate([loginUrl], { queryParams: { returnUrl: returnUrl } });
        }
        return canActivate;
    }
}