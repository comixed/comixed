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

import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Store } from '@ngrx/store';
import { WS_ROOT_URL } from '@app/core';
import {
  startMessagingSuccess,
  stopMessaging
} from '@app/messaging/actions/messaging.actions';
import { HTTP_AUTHORIZATION_HEADER } from '@app/app.constants';
import { Observable, Subscription } from 'rxjs';
import { securedTopic } from '@app/messaging/messaging.functions';
import { TokenService } from '@app/core/services/token.service';
import { IFrame, RxStompState } from '@stomp/rx-stomp';
import { Message } from '@stomp/stompjs';
import { StompService } from '@app/messaging/services/stomp.service';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  logger = inject(LoggerService);
  store = inject(Store);
  tokenService = inject(TokenService);
  stompService = inject(StompService);

  connect(): Observable<any> {
    return new Observable(() => {
      if (this.tokenService.hasAuthToken() && !this.stompService.connected()) {
        this.stompService.configure({
          webSocketFactory: () => new SockJS(WS_ROOT_URL),
          connectHeaders: {
            [HTTP_AUTHORIZATION_HEADER]: this.tokenService.getAuthToken()
          },
          reconnectDelay: 200,
          debug: (message: string): void => {
            /* istanbul ignore next */
            this.logger.debug(message);
          }
        });
        this.stompService.connected$.subscribe(state =>
          this.onConnected(state)
        );
        this.stompService.stompErrors$.subscribe(state => this.onError(state));
        this.stompService.activate();
      }
    });
  }

  disconnect(): Observable<any> {
    return new Observable(() => {
      if (this.stompService.connected()) {
        this.logger.trace('Stopping STOMP service');
        this.stompService.deactivate();
        this.store.dispatch(stopMessaging());
      }
    });
  }

  /**
   * Subscribes to a topic.
   *
   * Passes any received content to the provided callback. Messages are expected to be of the provided type.
   *
   * @param destination the destination
   * @param callback the callback function
   */
  subscribe<T>(destination: string, callback: (T) => void): Subscription {
    this.logger.debug('Subscribing to topic:', destination);
    /* istanbul ignore next */
    return this.stompService
      .watch(destination)
      .subscribe((message: Message) => {
        const content = JSON.parse(message.body);
        this.logger.debug('Received content:', content);
        callback(content);
      });
  }

  /**
   * Sends a message and waits for a response. Passes the responses received to the provided callback function.
   *
   * @param message the message
   * @param body the message body
   * @param destination the destination
   * @param callback the callback function
   */
  requestResponse<T>(
    message: string,
    body: string,
    destination: string,
    callback: (T) => void
  ): Subscription {
    this.logger.trace('Subscribing to temporary queue:', destination);
    /* istanbul ignore next */
    const subscription = this.stompService
      .watch(securedTopic(destination))
      .subscribe((message: Message) => {
        const content = JSON.parse(message.body);
        this.logger.debug('Received content:', content);
        callback(content);
      });
    /* istanbul ignore next */
    this.stompService.publish({ destination: message, body });
    return subscription;
  }

  /**
   * Sends a message to a given destination.
   * @param topic the topic
   * @param message the message
   */
  send(topic: string, message: string): void {
    this.logger.debug('Publishing message:', topic, message);
    this.stompService.publish({ destination: topic, body: message });
  }

  private onError(state: IFrame) {
    this.logger.error('Stomp error state now', state);
  }

  private onConnected(state: RxStompState) {
    this.logger.debug('[STOMP] connected state now', state);
    this.store.dispatch(startMessagingSuccess());
  }
}
