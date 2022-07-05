import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';


@Injectable({
    providedIn: 'root'
})

export class HttpService {
    private readonly CONTENT_TYPE_HEADER_KEY = 'Content-Type';
    private readonly CONTENT_TYPE_HEADER_VALUE = 'application/json';

    constructor(private http: HttpClient) { }

    get(url: string, _params?: any): Observable<any> {
        let options = this.setRequestOptions(false);
        if (_params) {
            options['params'] = _params;
        }
        return this.http.get(url, options);
    }

    save(url: string, body: any): Observable<any> {
        let options = this.setRequestOptions(true);
        return this.http.post(url, body, options);
    }

    update(url: string, body: any): Observable<any> {
        let options = this.setRequestOptions(true);
        return this.http.put(url, body, options);
    }

    delete(url: string, _params?: any): Observable<any> {
        let options = this.setRequestOptions(false);
        if (_params) {
            options['params'] = _params;
        }
        return this.http.delete(url, options);
    }

    uploadDocument(url: string, formData: any) {  
        
        let options = this.setRequestOptions(false);
        return this.http.post(url, formData, options);
    }

    patch<T>(url: string, body: T): Observable<T> {
        return this.http.patch<T>(url, body);
    }

    private setRequestOptions(isPostRequest: boolean) {
        let _headers = new HttpHeaders();
        let options = { };
        
        if (isPostRequest) {
            _headers.append(this.CONTENT_TYPE_HEADER_KEY, this.CONTENT_TYPE_HEADER_VALUE);
        }

        return options = { headers: _headers};
    }
}