import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse, HttpHeaders } from "@angular/common/http";
import { tap } from "rxjs/internal/operators";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";

import { environment } from "@env/environment";
import { AuthService } from "./app.auth.service";
import { LoaderService } from "@app/services/app.loader.service";


@Injectable()

export class HttpInterceptService implements HttpInterceptor {
    requestCount = 0;
    constructor(private _router: Router,
        private _loaderService: LoaderService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.showLoader();
        const token: string = AuthService.getAccessToken();

        // add it if we have one
        if (token) {
            request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
        }

        // if we already have a content-type, do not
        // set it, but if we don't have one, set it to
        // default --> json
        let isValidateUrlOrCompany = (request.url.indexOf('ValidateUrl') > 0 || request.url.indexOf('Company') > 0) ? true : false;
        if (!request.headers.has('Content-Type') && isValidateUrlOrCompany) {
            request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
        }

        const skipIntercept = request.headers.has('skip'); // introduce this to fetch tinyUrl from third party
        const url = skipIntercept ? '' : environment.apiUrl;
        let headers;
        if(skipIntercept) {
          headers = new HttpHeaders({
            'Accept': 'text/plain',
          });
        } else {
          headers = request.headers.set('Accept', 'application/json')
        }

        // setting the url & accept header

        request = request.clone({ url: url + request.url, headers: headers });

        return next.handle(request)
            .pipe(
                tap(event => {
                    if (event instanceof HttpResponse) {
                        this.onEnd();
                        this.handleMessageCode(event);
                    }
                }, error => {
                    this.onEnd();
                    this.handleAuthError(error);
                })
            )

        // .pipe(catchError((error, caught) => {
        //     //intercept the respons error and displace it to the console
        //     console.log(error);
        //     this.handleAuthError(error);
        //     return of(error);
        // }) as any);
    }

    private handleMessageCode(response: HttpResponse<Response> | any) {
        if (response && response.status === 200 && response.body) {
            let res = response.body;
            if (res.MessageCode) {
                if (res.MessageCode == "1") {
                    return res.Result;
                }
                else if (res.MessageCode == "0") {
                    return throwError("Save Failed");
                }
                else if (res.MessageCode == "204") {
                    return throwError("Not data found");
                }
                else if (res.MessageCode == "-2") {
                    return throwError("File not saved on drive");
                }
                else if (res.MessageCode == "-5") {
                    return throwError("Database error during save/update");
                }
                else if (res.MessageCode == "-11") {
                    return throwError("Invalid email found.");
                }
                else if (res.MessageCode == "-15") {
                    this.redirectToLogin();
                    //return throwError("Invalid token");
                }
                else if (res.MessageCode == "-16") {
                    return throwError("Invalid Permissions");
                }
            }
        }
    }


    private handleAuthError(err: HttpErrorResponse): Observable<HttpEvent<any>> {

        //handle your auth error or rethrow
        if (err.status === 401 || err.status === 403) {
            //navigate /delete cookies or whatever
            this.redirectToLogin();
            // if you've caught / handled the error, you don't want to rethrow it unless you also want downstream consumers to have to handle it as well.
            //return of(err.message);
        }

        let errMsg = '';
        // Client Side Error
        if (err.error instanceof ErrorEvent) {
            errMsg = `Error: ${err.error.message}`;
        }
        else {  // Server Side Error
            errMsg = `Error Code: ${err.status},  Message: ${err.message}`;
        }
        return throwError(errMsg);
    }

    private onEnd(): void {
        this.requestCount = this.requestCount - 1;
        this.hideLoader();
    }

    private showLoader(): void {
        this.requestCount = this.requestCount + 1;
        this._loaderService.show();
    }

    private hideLoader(): void {
        if (this.requestCount === 0) {
            this._loaderService.hide();
        }
    }

    private redirectToLogin() {
        AuthService.logout();
        let loginUrl = '/account/login';
        let returnUrl = this._router.url;
        if (returnUrl === loginUrl) {
            returnUrl = '/';
        }
        this._router.navigate([loginUrl], { queryParams: { returnUrl: returnUrl }});
    }
}
