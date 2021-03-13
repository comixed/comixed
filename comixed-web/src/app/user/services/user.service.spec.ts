/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { UserService } from './user.service';
import { USER_READER } from '@app/user/user.fixtures';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { interpolate } from '@app/core';
import {
  DELETE_PREFERENCE_MESSAGE,
  LOAD_CURRENT_USER_URL,
  LOGIN_USER_URL,
  SAVE_PREFERENCE_MESSAGE,
  USER_SELF_TOPIC
} from '@app/user/user.constants';
import { LoggerModule } from '@angular-ru/logger';
import { LoginResponse } from '@app/user/models/net/login-response';
import { AUTHENTICATION_TOKEN } from '@app/core/core.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { WebSocketService } from '@app/messaging';
import { SetUserPreference } from '@app/user/models/messaging/set-user-preference';
import { DeleteUserPreference } from '@app/user/models/messaging/delete-user-preference';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { Frame, Subscription } from 'webstomp-client';
import { currentUserLoaded } from '@app/user/actions/user.actions';

describe('UserService', () => {
  const USER = USER_READER;
  const PASSWORD = 'this!is!my!password';
  const PREFERENCE_NAME = 'user.preference';
  const PREFERENCE_VALUE = 'preference.value';
  const initialState = { [MESSAGING_FEATURE_KEY]: initialMessagingState };

  let service: UserService;
  let httpMock: HttpTestingController;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  let store: MockStore<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, LoggerModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: WebSocketService,
          useValue: {
            send: jasmine.createSpy('WebSocketService.send()'),
            subscribe: jasmine.createSpy('WebSocketService.subscribe()')
          }
        }
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    webSocketService = TestBed.inject(
      WebSocketService
    ) as jasmine.SpyObj<WebSocketService>;
    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('can load the current user', () => {
    const serviceResponse = USER;
    service
      .loadCurrentUser()
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOAD_CURRENT_USER_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(serviceResponse);
  });

  it('can send the user credentials', () => {
    const serviceResponse = {
      email: USER.email,
      token: AUTHENTICATION_TOKEN
    } as LoginResponse;
    service
      .loginUser({ email: USER.email, password: PASSWORD })
      .subscribe(response => expect(response).toEqual(serviceResponse));

    const req = httpMock.expectOne(interpolate(LOGIN_USER_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body.get('email')).toEqual(USER.email);
    expect(req.request.body.get('password')).toEqual(PASSWORD);
    req.flush(serviceResponse);
  });

  describe('saving a user preferences', () => {
    beforeEach(() => {
      webSocketService.send.and.stub();
      service
        .saveUserPreference({
          name: PREFERENCE_NAME,
          value: PREFERENCE_VALUE
        })
        .subscribe(() => {});
    });

    it('sends a message', () => {
      expect(webSocketService.send).toHaveBeenCalledWith(
        SAVE_PREFERENCE_MESSAGE,
        JSON.stringify({
          name: PREFERENCE_NAME,
          value: PREFERENCE_VALUE
        } as SetUserPreference)
      );
    });
  });

  describe('can delete a user preferences', () => {
    beforeEach(() => {
      webSocketService.send.and.stub();
      service
        .saveUserPreference({ name: PREFERENCE_NAME, value: null })
        .subscribe(() => {});
    });

    it('sends a message', () => {
      expect(webSocketService.send).toHaveBeenCalledWith(
        DELETE_PREFERENCE_MESSAGE,
        JSON.stringify({ name: PREFERENCE_NAME } as DeleteUserPreference)
      );
    });
  });

  describe('when messaging starts', () => {
    let topic: string;
    let subscription: any;

    beforeEach(() => {
      service.subscription = null;
      webSocketService.subscribe.and.callFake((topicUsed, callback) => {
        topic = topicUsed;
        subscription = callback;
        return {} as Subscription;
      });
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: true }
      });
    });

    it('subscribes to user updates', () => {
      expect(topic).toEqual(USER_SELF_TOPIC);
    });

    describe('when updates are received', () => {
      beforeEach(() => {
        subscription(new Frame('', {}, JSON.stringify(USER)));
      });

      it('fires an action', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          currentUserLoaded({ user: USER })
        );
      });
    });
  });

  describe('when messaging is stopped', () => {
    const subscription = jasmine.createSpyObj(['unsubscribe']);

    beforeEach(() => {
      service.subscription = subscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from updates', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the subscription reference', () => {
      expect(service.subscription).toBeNull();
    });
  });
});
