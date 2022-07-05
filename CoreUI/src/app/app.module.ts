import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpInterceptService } from './helper/app.http.intercept.service';
import { SpinnerComponent } from './home/spinner/spinner.component';
import { DynamicScriptLoaderService } from './services/dynamic.script.loader.service';
import { StripeService, StripeDataSharingService } from './services/stripe.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { IframeComponent } from './gateway/iframe/iframe.component';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';




var language = navigator.language;


@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    IframeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    //FormsModule,
    MatSlideToggleModule,
    HttpClientModule,
    AppRoutingModule,
    MatSnackBarModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptService, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: language },
    //{ provide: LOCALE_ID, useValue: language },
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    DynamicScriptLoaderService,
    StripeService,
    StripeDataSharingService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
