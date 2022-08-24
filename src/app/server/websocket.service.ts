import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  websocket?: WebSocket;

  constructor() {

  }
// mở kết nối tới url
  public openWebSocket() {
    this.websocket = new WebSocket('ws://140.238.54.136:8080/chat/chat');

    this.websocket.onopen = (event) => {
      console.log('Open: ' + event);
    }

    this.websocket.onmessage = (event) => {

    }

    this.websocket.onclose = (event) => {
      console.log('Close: ' + event);
    }

  }

  public sendMessage(ms: any) {
    this.websocket?.send(JSON.stringify(ms));

  }

  public responseServe(): Observable<any> {
    return new Observable<any>((observer) => {
      this.websocket?.addEventListener('message', (event) => {
        observer.next(event.data);
      })
    })
  }

// đóng kết nối
  public closeWebSocket() {
    this.websocket?.close();
  }

}
