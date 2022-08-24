import { AfterViewChecked, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { WebsocketService } from 'src/app/server/websocket.service';
import { ListUserService } from './listuser.service';

import Giphy from "giphy-api";
import * as $ from 'jquery';

import giphyApi from "giphy-api";

@Component({
  selector: 'app-viewpage',
  templateUrl: './viewpage.component.html',
  styleUrls: ['./viewpage.component.css']
})
export class ViewpageComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollBottom', { static: false }) private myScrollContainer?: ElementRef;

  @Input() listUser: string[] = [];
  @Input() listGroup: string[] = [];
  @Input() author?: string='';
  @Input() username?: string='';
  @Input() status?: string='';
  @Input() listMessage: Array<any> = [];
  map?: Map<string, any[]> = new Map();
  typeChat?: string = '';
  currentUser: any;
  showEmojiPicker = false;
  showGiphySearch = false;
  giphySearchTerm = '';
  giphyResults: giphyApi.GIFObject[] = [];

  constructor(public webSocketService: WebsocketService, private router: Router, private listUserService: ListUserService) {
    const navigation = this.router.getCurrentNavigation();
    this.username = navigation?.extras.state as unknown as string;
    this.listUserService.createList(this.username);

  }

  ngOnInit(): void {

    this.getListUserRecent();

    this.webSocketService.responseServe().forEach(item => {
      if (JSON.parse(item).event === 'SEND_CHAT') {
        if ((JSON.parse(item).data.name === this.author) && (JSON.parse(item).data.type == 0)) {
          this.listMessage.push({ type: 'reply',
           name: JSON.parse(item).data.name, to: JSON.parse(item).data.to,
            mes: JSON.parse(item).data.mes, time: this.getTime() })
        }
      }
    });

    this.webSocketService.responseServe().forEach(item => {
      if (JSON.parse(item).event === 'SEND_CHAT') {
        if ((JSON.parse(item).data.to === this.author) && (JSON.parse(item).data.type == 1)) {
          this.listMessage.push({ type: 'reply',
           name: JSON.parse(item).data.name,
            to: JSON.parse(item).data.to, mes: JSON.parse(item).data.mes, time: this.getTime() })
        }
      }
    });

    this.scrollToBottom();

  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // auto scroll area chat to bottom
  scrollToBottom() {
    this.myScrollContainer?.nativeElement.scroll({
      top: this.myScrollContainer.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    })
  }

  // select a user to connect a contact chat
  selectUser(user: string) {
    this.author = user;
    this.typeChat = 'people';
    this.map = new Map();
    this.listMessage = [];
    this.isUserOnline(user);
    this.responseMessagePeople(user);
  }

  // get user chat recent
  getListUserRecent() {
    this.listUser = [];
    var ms = {
      "action": "onchat",
      "data": {
        "event": "GET_USER_LIST"
      }
    };
    this.webSocketService.sendMessage(ms);
    this.webSocketService.responseServe().forEach(item => {
      if (JSON.parse(item).event === 'GET_USER_LIST') {
        JSON.parse(item).data.forEach((res: any) => {
          if (res.type == 0) {
            if (!(this.listUser.includes(res.name)) && !(this.username === res.name)) {
              this.listUser.push(res.name);
            }
          } else {
            if (!(this.listGroup.includes(res.name))) {
              this.listGroup.push(res.name);
            }
          }
        })
      }
    })
  }

  // submit send message
  sendMessage(form: NgForm) {
    if ((this.author?.trim() !== "")) {
      if ((form.value.message.trim() != "")) {
        this.requestMessage(this.author + '', form.value.message.trim(), this.typeChat + '');
        let mess = form.value.message.trim();
        this.listMessage.push({ type: 'sent', name: this.username + '', to: this.author + '', mes: mess, time: this.getTime() })
        form.reset();
      } else {
        return;
      }
    }else{
      form.reset();
    }

  }

  // request send message to people chat
  requestMessage(author: string, message: string, typeChat: string) {
    var ms = {
      "action": "onchat",
      "data": {
        "event": "SEND_CHAT",
        "data": {
          "type": typeChat,
          "to": author,
          "mes": message,
        }
      }
    };
    this.webSocketService.sendMessage(ms);
  }

  // add a contact chat people and save into localStorage
  addPeopleContact(form: NgForm) {
    var user = form.value.username.trim();
    if (!(user === '')) {
      if (!this.listUser?.includes(user) && !(user === this.username)) {
        this.listUser?.push(user);
        form.reset();
      }
    } else {
    }
  }

  // request to check status user
  isUserOnline(user: string) {
    var ms = {
      "action": "onchat",
      "data": {
        "event": "CHECK_USER",
        "data": {
          "user": user
        }
      }
    };
    this.webSocketService.sendMessage(ms);

    this.webSocketService.responseServe().forEach(item => {
      if (JSON.parse(item).event === 'CHECK_USER') {
        if (JSON.parse(item).data.status == true) {
          this.status = 'online';
        } else {
          this.status = 'offline';
        }
      }
    })
  }

  // request to get history chat for people
  requestGetMessagePeople(nameAuthor: string, page: number) {
    var ms = {
      "action": "onchat",
      "data": {
        "event": "GET_PEOPLE_CHAT_MES",
        "data": {
          "name": nameAuthor,
          "page": page
        }
      }
    };
    this.webSocketService.sendMessage(ms);
  }

  // get list history chat for people
  responseMessagePeople(nameAuthor: string): Array<any> {
    let page: number = 1;
    while (page < 10) {
      this.requestGetMessagePeople(nameAuthor, page);
      this.webSocketService.responseServe().forEach(response => {
        if (JSON.parse(response).event == 'GET_PEOPLE_CHAT_MES') {
          JSON.parse(response).data.forEach((l: any) => {
            if (!this.map?.has(l.id)) {
              if (l.name === this.username) {
                this.map?.set(l.id, [{ type: 'sent', name: l.name, to: l.to, mes: l.mes, time: l.createAt }]);
                this.listMessage.splice(0, 0, { type: 'sent', name: l.name, to: l.to, mes: l.mes, time: l.createAt })
              } else {
                this.map?.set(l.id, [{ type: 'reply', name: l.name, to: l.to, mes: l.mes, time: l.createAt }]);
                this.listMessage.splice(0, 0, { type: 'reply', name: l.name, to: l.to, mes: l.mes, time: l.createAt })
              }
            }
          })

        }
      })
      page++;
    }
    return this.listMessage;
  }

  // select group chat
  selectGroup(groupName: string) {
    this.author = groupName;
    this.typeChat = 'room';
    this.status = '...';
    this.map = new Map();
    this.listMessage = [];
    this.getMessageGroup(groupName);
  }

  //submit creat a group chat and add name group into list group
  createGroup(form: NgForm) {
    var groupName = form.value.nameGroup.trim();
    if (!(groupName === '')) {
      this.requestCreateGroup(groupName);
      this.webSocketService.responseServe().forEach(item => {
        if (JSON.parse(item).event === 'CREATE_ROOM') {
          if (JSON.parse(item).status === 'success') {
            this.listGroup.push(groupName);
            form.reset();
          } else {
            alert('Group Exist');
          }
        }
      })
    }
  }

  //submit join a group chat and add name group into list group
  joinGroup(form: NgForm) {
    var groupName = form.value.nameGroup.trim();
    if (!(groupName === '')) {
      this.requestJoinGroup(groupName);
      this.webSocketService.responseServe().forEach(item => {
        if (JSON.parse(item).event === 'JOIN_ROOM') {
          if ((JSON.parse(item).status === 'success') && !(this.listGroup.includes(groupName))) {
            this.listGroup.push(groupName);
            form.reset();
          } else {

          }
        }
      })
    }
  }

  // request to get message from a group
  requestGetMessageGroup(groupName: string, page: number) {
    var ms = {
      "action": "onchat",
      "data": {
        "event": "GET_ROOM_CHAT_MES",
        "data": {
          "name": groupName,
          "page": page
        }
      }
    };
    this.webSocketService.sendMessage(ms);
  }

  // get message a group chat
  getMessageGroup(groupName: string) {
    let page: number = 1;
    while (page < 10) {
      this.requestGetMessageGroup(groupName, page);
      this.webSocketService.responseServe().forEach(response => {
        if (JSON.parse(response).event === 'GET_ROOM_CHAT_MES') {
          JSON.parse(response).data.chatData.forEach((l: any) => {
            if (!this.map?.has(l.id)) {
              if (l.name === this.username) {
                this.map?.set(l.id, [{ type: 'sent', name: l.name, to: l.to, mes: l.mes, time: l.createAt }]);
                this.listMessage.splice(0, 0, { type: 'sent', name: l.name, to: l.to, mes: l.mes, time: l.createAt })
              } else {
                this.map?.set(l.id, [{ type: 'reply', name: l.name, to: l.to, mes: l.mes, time: l.createAt }]);
                this.listMessage.splice(0, 0, { type: 'reply', name: l.name, to: l.to, mes: l.mes, time: l.createAt })
              }
            }
          })
        }
      })
      page++;
    }
  }


  // request message serve to create a new group chat
  requestCreateGroup(nameGroup: string) {
    var ms = {
      "action": "onchat",
      "data": {
        "event": "CREATE_ROOM",
        "data": {
          "name": nameGroup
        }
      }
    }
    this.webSocketService.sendMessage(ms);
  }

  // request message to join a group chat
  requestJoinGroup(nameGroup: string) {
    var ms = {
      "action": "onchat",
      "data": {
        "event": "JOIN_ROOM",
        "data": {
          "name": nameGroup
        }
      }
    };
    this.webSocketService.sendMessage(ms);
  }

  // logout account chat
  onLogout() {
    this.webSocketService.sendMessage({
      "action": "onchat",
      "data": {
        "event": "LOGOUT"
      }
    });
    this.router.navigateByUrl("/login");
  }

  // get time when send and receive a new message
  getTime(): string {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();;
    return date;
  }


  selectPeopleChat() {
    $("#peopleList").css({ 'display': 'block' });
    $("#groupList").css({ 'display': 'none' });
    $("#groupChat").css({ 'background-color': '#32465a' });
    $("#peopleChat").css({ 'background-color': 'rgb(67, 95, 122)' });
  }

  selectGroupChat() {
    $("#groupList").css({ 'display': 'block' });
    $("#peopleList").css({ 'display': 'none' });
    $("#peopleChat").css({ 'background-color': '#32465a' });
    $("#groupChat").css({ 'background-color': 'rgb(67, 95, 122)' });
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }
  // chưa thực hiện được cái code này
  addEmoji(event: { emoji: { native: any; }; }) {
    const { message } = this;
    const text = `${message}${event.emoji.native}`;

    this.message = text;
    this.showEmojiPicker = false;
  }

  _message: string = '';
  get message(): string {
    return this._message;
  }

  set message(value: string) {
    this._message = value;
  }

  searchGiphy() {
    const giphy = Giphy();
    const searchTerm = this.giphySearchTerm;
    giphy.search(searchTerm)
      .then(res => {
        console.log(res);
        this.giphyResults = res.data;
      })
      .catch(console.error);
  }

  sendGif(title: any, url: any) {
    const { currentUser } = this;
    currentUser.sendMessage({
      text: title,
      roomId: '<your room id>',
      attachment: {
        link: url,
        type: 'image',
      }
    }).catch(console.error);
    this.showGiphySearch = false;
  }

  toggleGiphySearch() {
    this.showGiphySearch = !this.showGiphySearch;
  }
}

