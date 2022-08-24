import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { WebsocketService } from 'src/app/server/websocket.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  isFormInvalid = false;
  areUserInvalid = false;
  isPasswordInvalid = false;

  constructor(public webSocketService: WebsocketService, private router: Router) {
  }

  ngOnInit(): void {
  }

  onRegister(register: NgForm) {
    if (register.value.username.trim() == '' || register.value.password.trim() == '' || register.value.repassword.trim() == '') {
      this.isFormInvalid = true;
      this.areUserInvalid = false;

    } else {

      this.isFormInvalid = false;
      if (!this.isEqualPassword(register.value.password, register.value.repassword)) {
        this.isPasswordInvalid = true;

      } else {
        this.isPasswordInvalid = false;
        this.requestRegister(register.value.username.trim(), register.value.password.trim());
        this.webSocketService.responseServe().forEach(item => {
          if (JSON.parse(item).status === 'success') {
            this.router.navigateByUrl('/login');
          } else {
            this.areUserInvalid = true;
            // register.reset();
          }
        })
      }
    }

  }
// gửi yêu cầu lên serve, sử dụng API
  private requestRegister(username: string, password: string) {
    var ms = {
      "action": "onchat",
      "data": {
        "event": "REGISTER",
        "data": {
          "user": username,
          "pass": password
        }
      }
    };

    this.webSocketService.sendMessage(ms);
  }

// hàm kiểm tra passwork (sử dụng toán tử 3 dấu =)
  private isEqualPassword(password: any, repassword: any): boolean {
    return password.trim() === repassword.trim()
  }
}

