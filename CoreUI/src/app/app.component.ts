import { Component } from '@angular/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { LoaderService } from './services/app.loader.service';


export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS  }
  ]
})
export class AppComponent {

  constructor(private _router: Router, private _loaderService: LoaderService) {
    
  }
  ngOnInit() {
    this._router.events.subscribe(event => {
      if (event instanceof RouteConfigLoadStart) {
        this._loaderService.show();
      } else if (event instanceof RouteConfigLoadEnd) {
        this._loaderService.hide();
      }
    });
  }
}
