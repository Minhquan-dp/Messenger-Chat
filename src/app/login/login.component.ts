import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { WebsocketService } from 'src/app/server/websocket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],

})

export class LoginComponent implements OnInit {

  isFormInvalid = false;
  areUserInvalid = false;

  constructor(public webSocketService: WebsocketService, private router: Router) {

  }

  ngOnInit(): void {

  }

  onLogin(signIn: NgForm) {
    if (signIn.value.user.trim() == "" || signIn.value.password.trim() == "") {
      this.isFormInvalid = true;
      this.areUserInvalid = false;
      return;

    } else {
      this.isFormInvalid = false;
      this.requestLogin(signIn.value.user.trim(), signIn.value.password.trim());
      this.webSocketService.responseServe().forEach(item => {
        if (JSON.parse(item).status === 'success') {
          this.router.navigateByUrl('/chat', { state: signIn.value.user });
        } else {
          this.areUserInvalid = true;
        }
      })
    }
  }


// gửi yêu cấu login
  requestLogin(user: string, password: string) {
    var ms = {
      "action": "onchat",
      "data": {
        "event": "LOGIN",
        "data": {
          "user": user,
          "pass": password
        }
      }
    };

    this.webSocketService.sendMessage(ms);
  }

}
