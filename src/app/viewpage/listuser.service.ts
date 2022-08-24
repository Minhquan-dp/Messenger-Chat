import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ListUserService {

  constructor() {
  }

  createList(user: string) {
    if (localStorage.getItem(user) === null || localStorage.getItem(user) == undefined) {
      var listUser: any[] = [];
      localStorage.setItem(user, JSON.stringify(listUser));
      return
    }
  }

  getListUser(user: string) {
    return JSON.parse(<string>localStorage.getItem(user));
  }

  addUser(user: string, userAdd: { type: string, user: string }) {
    var list = JSON.parse(<string>localStorage.getItem(user));
    list.push(userAdd);
    localStorage.setItem(user, JSON.stringify(list));
  }

  deleteUser(user: string) {
    localStorage.removeItem(user);
  }
}
