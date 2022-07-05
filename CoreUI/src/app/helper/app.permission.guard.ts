import { Injectable } from '@angular/core';
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './app.auth.service';
import { MessageService } from '@app/services/app.message.service';
import { Messages } from './config/app.messages';
import { ApiResponse } from '@app/models/common.model';

@Injectable({ providedIn: 'root' })
export class ModulePermissionGuard implements CanActivate {

    constructor(private _router: Router,
        private _authService: AuthService,
        private _messageService: MessageService
    ) { }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let moduleId = route && route.data["module"] ? route.data["module"] : 0;
            if (this._authService.rolePermission && this._authService.rolePermission.length > 0) {
                if (this._authService.hasModulePermission(moduleId)) {
                    resolve(true);
                    return;
                }
                else {
                    this._router.navigate(['/']);
                    this._messageService.showErrorMessage(Messages.Error.Permission_Module_UnAuthorized);
                    resolve(false);
                    return;
                }
            } else {
                this._authService.getPermissions().subscribe((res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this._authService.setPermissions(res.Result.ModuleList);
                        if (this._authService.hasModulePermission(moduleId)) {
                            resolve(true);
                            return;
                        }
                        else {
                            this._router.navigate(['/']);
                            this._messageService.showErrorMessage(Messages.Error.Permission_Module_UnAuthorized);
                            resolve(false);
                            return;
                        }
                    }
                    else {
                        this._router.navigate(['/']);
                        this._messageService.showErrorMessage(res.MessageText);
                        resolve(false);
                        return;
                    }
                },
                    err => {
                        this._router.navigate(['/']);
                        this._messageService.showErrorMessage(Messages.Error.Check_Permission)
                        reject(err);
                        return;
                    })
            }

        });
    }
}

@Injectable({ providedIn: 'root' })
export class PagePermissionGuard implements CanActivate {

    constructor(private _router: Router,
        private _authService: AuthService,
        private _messageService: MessageService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let moduleId = route && route.data["module"] ? route.data["module"] : 0;
            let pageId = route && route.data["page"] ? route.data["page"] : 0;

            if (this._authService.rolePermission && this._authService.rolePermission.length > 0) {
                if (this._authService.hasPagePermission(moduleId, pageId)) {
                    resolve(true);
                    return;
                }
                else {
                    this._router.navigate(['/']);
                    this._messageService.showErrorMessage(Messages.Error.Permission_Page_UnAuthorized);
                    resolve(false);
                    return;
                }
            } else {
                this._authService.getPermissions().subscribe((res: ApiResponse) => {
                    if (res && res.MessageCode > 0) {
                        this._authService.setPermissions(res.Result.ModuleList);
                        if (this._authService.hasPagePermission(moduleId, pageId)) {
                            resolve(true);
                            return;
                        }
                        else {
                            this._router.navigate(['/']);
                            this._messageService.showErrorMessage(Messages.Error.Permission_Page_UnAuthorized);
                            resolve(false);
                            return;
                        }
                    }
                    else {
                        this._router.navigate(['/']);
                        this._messageService.showErrorMessage(res.MessageText);
                        resolve(false);
                        return;
                    }
                },
                    err => {
                        this._router.navigate(['/']);
                        this._messageService.showErrorMessage(Messages.Error.Check_Permission);
                        reject(err);
                        return;
                    })
            }
        });
    }
}