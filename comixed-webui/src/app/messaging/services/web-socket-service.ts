/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { inject, Service } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TokenService } from '@app/account/services/token-service';
import { StompService } from '@app/messaging/services/stomp-service';
import { Observable, Subscription } from 'rxjs';
import { HTTP_AUTHORIZATION_HEADER } from '@app/account/user-constants';
import { securedTopic } from '@app/messaging/messaging-functions';
import { WS_ROOT_URL } from '@app/app-constants';
import { IMessage, RxStompState } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { MessagingStore } from '@app/messaging/stores/messaging-store';

@Service()
export class WebSocketService {
  logger = inject(LoggerService);
  tokenService = inject(TokenService);
  stompService = inject(StompService);
  readonly messagingStore = inject(MessagingStore);

  connect(): Observable<unknown> {
    return new Observable(() => {
      this.logger.trace('Checking for an auth token');
      if (this.tokenService.hasAuthToken()) {
        this.logger.trace('Configuring STOMP service');
        /* v8 ignore next */
        this.stompService.configure({
          webSocketFactory: () => new SockJS(WS_ROOT_URL),
          connectHeaders: {
            [HTTP_AUTHORIZATION_HEADER]: this.tokenService.getAuthToken()
          },
          reconnectDelay: 500,
          heartbeatOutgoing: 10000,
          heartbeatIncoming: 0,
          debug: (message: string): void => {
            /* v8 ignore next */
            console.log(message);
            this.logger.debug(message);
          },
          logRawCommunication: true
        });
        this.logger.trace('Subscribing to STOMP connection state changes');
        this.stompService.connected$.subscribe({
          next: state => {
            this.logger.debug('Connection state:', RxStompState[state]);
            switch (state) {
              case RxStompState.OPEN:
                this.messagingStore.started();
                break;
            }
          },
          error: error => this.logger.error('STOMP connection error:', error)
        });
        this.logger.trace('Subscribing to STOMP errors');
        this.stompService.stompErrors$.subscribe({
          next: error => this.logger.error('STOMP error:', error.body),
          error: error => this.logger.error('STOMP ERROR:', error)
        });
        this.stompService.serverHeaders$.subscribe({
          next: value => this.logger.debug('STOMP headers:', value)
        });
        this.logger.trace('Activating STOMP service');
        this.stompService.activate();
      }
    });
  }

  disconnect(): Observable<unknown> {
    return new Observable(() => {
      if (this.stompService.connected()) {
        this.logger.trace('Deactivating STOMP service');
        this.stompService.deactivate();
        this.messagingStore.stopped();
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
  subscribe<T>(destination: string, callback: (arg: T) => void): Subscription {
    /* v8 ignore next */
    this.logger.debug('Subscribing to topic:', destination);
    /* v8 ignore next */
    return this.stompService.watch(destination).subscribe({
      next(message: IMessage) {
        // this.logger.debug('Received content:', message);
        console.log('Received content:', message);
        const content = JSON.parse(message.body);
        callback(content);
      },
      error(error) {
        console.log('Subscription error:', error);
      }
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
    callback: (arg: T) => void
  ): Subscription {
    /* v8 ignore next */
    this.logger.trace('Subscribing to temporary queue:', destination);
    /* v8 ignore next */
    const subscription = this.stompService
      .watch(securedTopic(destination))
      .subscribe((message: IMessage) => {
        const content = JSON.parse(message.body);
        this.logger.debug('Received content:', content);
        callback(content);
      });
    /* v8 ignore next */
    this.stompService.publish({ destination: message, body });
    /* v8 ignore next */
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
}
