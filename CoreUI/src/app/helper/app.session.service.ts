import { Injectable } from "@angular/core";
import { variables } from "./config/app.variable";

@Injectable({ providedIn: 'root' })

export class SessionService {
    private static userId: number;
    private static isSuperAdmin: boolean;

    public static setBranchID(branchID: number) {
        localStorage.setItem(variables.BranchID, branchID.toString());
    }

    public static getBranchID(): number {
        return parseInt(localStorage.getItem(variables.BranchID));
    }

    public static setLoggedInUserID(userID: number) {
        this.userId = userID;
    }

    public static getLoggedInUserID(): number {
        return this.userId;
    }

    public static setIsSuperAdmin(isSuperAdmin: boolean) {
        this.isSuperAdmin = isSuperAdmin;
    }

    public static IsStaffSuperAdmin(): boolean {
        return this.isSuperAdmin;
    }
}