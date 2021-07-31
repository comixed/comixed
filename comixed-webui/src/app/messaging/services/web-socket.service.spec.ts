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

import { TestBed } from '@angular/core/testing';
import { WebSocketService } from './web-socket.service';
import { LoggerModule } from '@angular-ru/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import * as WebStomp from 'webstomp-client';
import { Client, Frame, Subscription } from 'webstomp-client';
import {
  messagingStarted,
  messagingStopped,
  stopMessaging
} from '@app/messaging/actions/messaging.actions';
import { TokenService } from '@app/core/services/token.service';

describe('WebSocketService', () => {
  const initialState = {};
  const TOPIC = '/topic/something';
  const CALLBACK = () => {};
  const MESSAGE = 'Some message';
  const AUTH_TOKEN = 'This is the auth token';

  let service: WebSocketService;
  let store: MockStore<any>;
  let client: jasmine.SpyObj<Client>;
  let tokenService: jasmine.SpyObj<TokenService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: Client,
          useValue: {
            connect: jasmine.createSpy('Client.connect()'),
            disconnect: jasmine.createSpy('Client.disconnect()'),
            subscribe: jasmine.createSpy('Client.subscribe()'),
            send: jasmine.createSpy('Client.send()')
          }
        },
        {
          provide: TokenService,
          useValue: {
            hasAuthToken: jasmine.createSpy('TokenService.hasAuthToken()'),
            getAuthToken: jasmine.createSpy('TokenService.getAuthToken()')
          }
        }
      ]
    });

    service = TestBed.inject(WebSocketService);
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
    client = TestBed.inject(Client) as jasmine.SpyObj<Client>;
    spyOn(WebStomp, 'over').and.returnValue(client);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connecting', () => {
    describe('when not already connected', () => {
      beforeEach(() => {
        service.client = null;
        service.connect();
        tokenService.hasAuthToken.and.returnValue(true);
        tokenService.getAuthToken.and.returnValue(AUTH_TOKEN);
        service.connect().subscribe(() => {});
      });

      it('creates a client', () => {
        expect(service.client).not.toBeNull();
      });

      it('establishes a connection', () => {
        expect(client.connect).toHaveBeenCalled();
      });

      it('assigns a trace function', () => {
        expect(client.onreceipt).not.toBeNull();
      });

      it('assigns a debug function', () => {
        expect(client.debug).not.toBeNull();
      });
    });

    describe('when already connected', () => {
      beforeEach(() => {
        service.client = client;
        service.client.connected = true;
        service.connect().subscribe(() => {});
      });

      it('does not establish a connection', () => {
        expect(client.connect).not.toHaveBeenCalled();
      });
    });
  });

  describe('disconnecting', () => {
    describe('when connected', () => {
      beforeEach(() => {
        client.connected = true;
        service.client = client;
        client.disconnect.and.callFake(callback => callback());
        service.disconnect().subscribe(() => {});
      });

      it('breaks the connection', () => {
        expect(client.disconnect).toHaveBeenCalled();
      });

      it('fires a message', () => {
        expect(store.dispatch).toHaveBeenCalledWith(stopMessaging());
      });
    });

    describe('when disconnected', () => {
      beforeEach(() => {
        client.connected = false;
        service.client = client;
        service.disconnect().subscribe(() => {});
      });

      it('does not try to break the connection', () => {
        expect(client.disconnect).not.toHaveBeenCalled();
      });

      it('does not fire a message', () => {
        expect(store.dispatch).not.toHaveBeenCalled();
      });
    });
  });

  describe('subscribing to a topic', () => {
    const SUBSCRIPTION = {} as Subscription;
    const CONTENT = { something: true };
    let result: Subscription;
    let processingCallback: any;

    beforeEach(() => {
      service.client = client;
      client.subscribe.and.callFake((topic, callback) => {
        processingCallback = callback;
        return SUBSCRIPTION;
      });
      result = service.subscribe(TOPIC, CALLBACK);
    });

    it('notifies the client', () => {
      expect(client.subscribe).toHaveBeenCalledWith(TOPIC, processingCallback);
    });

    it('returns a subscription', () => {
      expect(result).toBe(SUBSCRIPTION);
    });
  });

  describe('sending a message', () => {
    beforeEach(() => {
      service.client = client;
      service.send(TOPIC, MESSAGE);
    });

    it('notifies the client', () => {
      expect(client.send).toHaveBeenCalledWith(TOPIC, MESSAGE);
    });
  });

  describe('the connection callback', () => {
    beforeEach(() => {
      service.onConnected({} as Frame);
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(messagingStarted());
    });
  });

  describe('the error callback', () => {
    beforeEach(() => {
      service.client = client;
    });

    describe('when not a close event', () => {
      beforeEach(() => {
        service.onError(new Frame('error'));
      });

      it('does not clear the client reference', () => {
        expect(service.client).not.toBeNull();
      });
    });

    describe('when a close event', () => {
      beforeEach(() => {
        service.onError(new CloseEvent('close'));
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(messagingStopped());
      });

      it('clears the client reference', () => {
        expect(service.client).toBeNull();
      });
    });
  });

  describe('the disconnection callback', () => {
    beforeEach(() => {
      service.onDisconnected();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(messagingStopped());
    });
  });
});
