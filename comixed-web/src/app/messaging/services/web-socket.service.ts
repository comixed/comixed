/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Injectable } from '@angular/core';
import { LoggerService } from '@angular-ru/logger';
import { Store } from '@ngrx/store';
import { TokenService, WS_ROOT_URL } from '@app/core';
import webstomp, { Client, Frame, over, Subscription } from 'webstomp-client';
import {
  messagingStarted,
  messagingStopped,
  stopMessaging
} from '@app/messaging/actions/messaging.actions';
import * as SockJS from 'sockjs-client';
import { HTTP_AUTHORIZATION_HEADER } from '@app/app.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  client: Client;

  constructor(
    private logger: LoggerService,
    private store: Store<any>,
    private tokenService: TokenService
  ) {}

  connect(): Observable<any> {
    return new Observable(() => {
      if (!this.client && this.tokenService.hasAuthToken()) {
        this.logger.debug('Creating STOMP client');
        this.client = over(new SockJS(WS_ROOT_URL), {
          protocols: webstomp.VERSIONS.supportedProtocols()
        });
        this.client.onreceipt = frame => this.logger.trace('[FRAME]', frame);
        this.client.debug = text => this.logger.trace('[STOMP]', text);
      }

      if (!!this.client && !this.client.connected) {
        const token = this.tokenService.getAuthToken();
        const headers =
          !!token && token !== '' ? { [HTTP_AUTHORIZATION_HEADER]: token } : {};
        this.logger.debug('Connecting STOMP client:', headers);
        this.client.connect(
          headers,
          frame => this.onConnected(frame),
          error => this.onError(error)
        );
      }
    });
  }

  disconnect(): Observable<any> {
    return new Observable(() => {
      if (!!this.client && this.client.connected) {
        this.logger.trace('Stopping STOMP client');
        this.store.dispatch(stopMessaging());
        this.client.disconnect(() => this.onDisconnected());
      }
    });
  }

  subscribe(topic: string, callback: any): Subscription {
    this.logger.debug('Subscribing to topic:', topic);
    return this.client.subscribe(topic, callback);
  }

  send(topic: string, message: string): void {
    this.logger.debug('Publishing message:', topic, message);
    this.client.send(topic, message);
  }

  onConnected(frame: Frame): void {
    this.logger.debug('[STOMP] Connected');
    this.store.dispatch(messagingStarted());
  }

  onError(error: CloseEvent | Frame): void {
    this.logger.error('[STOMP] ERROR:', error);
    if (error instanceof CloseEvent) {
      this.store.dispatch(messagingStopped());
      this.client = null;
    }
  }

  onDisconnected(): void {
    this.logger.debug('[STOMP] Disconnected');
    this.store.dispatch(messagingStopped());
    this.client = null;
  }
}
