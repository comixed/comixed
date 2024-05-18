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
import { LoggerModule } from '@angular-ru/cdk/logger';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TokenService } from '@app/core/services/token.service';
import { StompService } from '@app/messaging/services/stomp.service';
import { BehaviorSubject } from 'rxjs';
import { stopMessaging } from '@app/messaging/actions/messaging.actions';

describe('WebSocketService', () => {
  const initialState = {};
  const TOPIC = '/topic/something';
  const CALLBACK = () => {};
  const MESSAGE = 'Some message';
  const AUTH_TOKEN = 'This is the auth token';

  let service: WebSocketService;
  let store: MockStore<any>;
  let stompService: jasmine.SpyObj<StompService>;
  let tokenService: jasmine.SpyObj<TokenService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: StompService,
          useValue: {
            connected: jasmine.createSpy('StompService.connected'),
            configure: jasmine.createSpy('StompService.configure()'),
            activate: jasmine.createSpy('StompService.activate()'),
            deactivate: jasmine.createSpy('StompService.deactivate()'),
            publish: jasmine.createSpy('StompService.publish()'),
            watch: jasmine.createSpy('StompService.watch()'),
            connected$: new BehaviorSubject<any>(null),
            stompErrors$: new BehaviorSubject<any>(null)
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
    stompService = TestBed.inject(StompService) as jasmine.SpyObj<StompService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when the user has authenticated', () => {
    beforeEach(() => {
      tokenService.hasAuthToken.and.returnValue(true);
    });

    describe('if messaging is not started', () => {
      beforeEach(() => {
        stompService.connected.and.returnValue(false);
        service.connect().subscribe(() => {});
      });

      it('configures the service', () => {
        expect(stompService.configure).toHaveBeenCalled();
      });

      it('activates the service', () => {
        expect(stompService.activate).toHaveBeenCalled();
      });
    });

    describe('if messaging is already started', () => {
      beforeEach(() => {
        stompService.connected.and.returnValue(true);
        service.connect().subscribe(() => {});
      });

      it('does not configure the service', () => {
        expect(stompService.configure).not.toHaveBeenCalled();
      });

      it('does not activate the service', () => {
        expect(stompService.activate).not.toHaveBeenCalled();
      });
    });
  });

  describe('disconnecting', () => {
    describe('if messaging is not started', () => {
      beforeEach(() => {
        stompService.connected.and.returnValue(false);
        service.disconnect();
      });

      it('does not deactivate the service', () => {
        expect(stompService.deactivate).not.toHaveBeenCalled();
      });

      it('does not fire an action', () => {
        expect(store.dispatch).not.toHaveBeenCalled();
      });
    });

    describe('if messaging is started', () => {
      beforeEach(() => {
        stompService.connected.and.returnValue(true);
        service.disconnect().subscribe(() => {});
      });

      it('deactivates the service', () => {
        expect(stompService.deactivate).toHaveBeenCalled();
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(stopMessaging());
      });
    });
  });

  describe('publishing a message', () => {
    const TOPIC = 'this.topic';
    const MESSAGE = 'The messasge body';

    beforeEach(() => {
      service.send(TOPIC, MESSAGE);
    });

    it('calls the publish method', () => {
      expect(stompService.publish).toHaveBeenCalledWith({
        destination: TOPIC,
        body: MESSAGE
      });
    });
  });
});
