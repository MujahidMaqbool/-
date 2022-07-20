import { Injectable } from "@angular/core";
import { variables } from "./config/app.variable";
import { ModulePermission } from "src/app/models/common.model";
import { HttpService } from "src/app/services/app.http.service";
import { HomeApi } from "./config/app.webapi";

@Injectable({ providedIn: 'root' })

export class AuthService {
    public rolePermission: ModulePermission[] = [];

    constructor(private _httpService: HttpService) { }

    public static setFavViewProduct(favViewIndexes: []) {
        localStorage.setItem('ProductFavViewIndexes', JSON.stringify(favViewIndexes) );
    }
    public static getFavViewProduct() {
        return localStorage.getItem("ProductFavViewIndexes");
    }
    public static deleteFavViewProduct() {
      localStorage.removeItem('ProductFavViewIndexes');
    }

    public static setAccessToken(accessToken: string) {
        localStorage.setItem(variables.Access_Token, accessToken);
    }

    public static getAccessToken() {
        return localStorage.getItem(variables.Access_Token);
    }

    public static isUserLoggedIn() {
        if (localStorage.getItem(variables.Access_Token)) {
            return true;
        }
        return false;
    }

    public static logout() {
        localStorage.removeItem(variables.Access_Token);
        localStorage.removeItem(variables.BranchID);
        localStorage.removeItem(variables.CompanyID);
    }

    public setPermissions(_rolePermissions: ModulePermission[]) {
        this.rolePermission = _rolePermissions;
    }

    public getPermissions() {
        return this._httpService.get(HomeApi.getBranchPermissions);
    }

    public hasModulePermission(moduleId: number) {
        let hasPermission = false;
        if (this.rolePermission.some(m => m.ModuleID === moduleId)) {
            hasPermission = true;
        }
        return hasPermission;
    }

    public hasPagePermission(moduleId: number, pageId: number) {
        let hasPermission = false;
        /* Find matching module and then find page in ModulePageList */
        let module = this.rolePermission.find(m => m.ModuleID === moduleId);
        if (module && module.ModulePageList.some(mp => mp.ModulePageID === pageId)) {
            hasPermission = true;
        }
        return hasPermission;
    }
}