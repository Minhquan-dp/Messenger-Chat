import {AfterViewChecked, NgModule, OnInit} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ViewpageComponent} from "./viewpage/viewpage.component";
import {RegisterComponent} from "./register/register.component";
import {LoginComponent} from "./login/login.component";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {path:'register',component:RegisterComponent},
  {path:'login',component:LoginComponent},
  {path:'chat',component:  ViewpageComponent ,
    },

];

@NgModule({

  imports: [RouterModule.forRoot(routes)],

  exports: [RouterModule]
})
export class AppRoutingModule {
}
