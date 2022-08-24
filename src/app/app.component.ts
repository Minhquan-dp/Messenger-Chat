import {Component, OnInit} from '@angular/core';
import {WebsocketService} from "./server/websocket.service";

@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements  OnInit {
  title = 'Appchat';
  constructor(private webSocketService: WebsocketService){


  }

  ngOnInit(): void {
    this.webSocketService.openWebSocket();
  }
}
