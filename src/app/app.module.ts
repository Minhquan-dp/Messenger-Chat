import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import {RouterModule} from "@angular/router";

import { ViewpageComponent } from './viewpage/viewpage.component';
import {FormsModule} from "@angular/forms";
import {AppRoutingModule} from "./app-routing.module";
import {CommonModule} from "@angular/common";



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ViewpageComponent,

  ],
    imports: [
      CommonModule,
        BrowserModule,
        RouterModule,


      AppRoutingModule,
        FormsModule
    ],
  exports: [
    LoginComponent,
    RegisterComponent,
    ViewpageComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
