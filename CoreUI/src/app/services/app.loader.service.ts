import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class LoaderService {

  public spinnerSubject: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  constructor() {

  }

  show() {
    this.spinnerSubject.next(true);
  }


  hide() {
    this.spinnerSubject.next(false);
  }

  getMessage(): Observable<any> {
    return this.spinnerSubject.asObservable();
  }
}

