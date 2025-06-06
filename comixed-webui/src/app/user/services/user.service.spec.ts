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
import {
  READ_COMIC_BOOK_1,
  READ_COMIC_BOOK_2,
  READ_COMIC_BOOK_3,
  READ_COMIC_BOOK_4,
  READ_COMIC_BOOK_5,
  USER_ADMIN,
  USER_BLOCKED,
  USER_READER
} from '@app/user/user.fixtures';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { interpolate } from '@app/core';
import {
  CHECK_FOR_ADMIN_ACCOUNT_URL,
  CREATE_ADMIN_ACCOUNT_URL,
  CREATE_USER_ACCOUNT_URL,
  DELETE_USER_ACCOUNT_URL,
  DELETE_USER_PREFERENCE_URL,
  LOAD_COMICS_READ_STATISTICS_URL,
  LOAD_CURRENT_USER_URL,
  LOAD_USER_LIST_URL,
  LOGIN_USER_URL,
  LOGOUT_USER_URL,
  SAVE_CURRENT_USER_URL,
  SAVE_USER_ACCOUNT_URL,
  SAVE_USER_PREFERENCE_URL,
  USER_SELF_TOPIC
} from '@app/user/user.constants';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { LoginResponse } from '@app/user/models/net/login-response';
import { AUTHENTICATION_TOKEN } from '@app/core/core.fixtures';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  initialState as initialMessagingState,
  MESSAGING_FEATURE_KEY
} from '@app/messaging/reducers/messaging.reducer';
import { Subscription } from 'rxjs';
import { loadCurrentUserSuccess } from '@app/user/actions/user.actions';
import { WebSocketService } from '@app/messaging';
import { SaveCurrentUserRequest } from '@app/user/models/net/save-current-user-request';
import { SaveUserPreferenceRequest } from '@app/user/models/net/save-user-preference-request';
import {
  COMICS_READ_STATISTICS_1,
  COMICS_READ_STATISTICS_2,
  COMICS_READ_STATISTICS_3,
  COMICS_READ_STATISTICS_4,
  COMICS_READ_STATISTICS_5
} from '@app/app.fixtures';
import { CheckForAdminResponse } from '@app/user/models/net/check-for-admin-response';
import {
  HttpResponse,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { CreateAccountRequest } from '@app/user/models/net/create-account-request';
import { CreateUserAccountRequest } from '@app/user/models/net/create-user-account-request';
import { setReadComicBooks } from '@app/user/actions/read-comic-books.actions';
import {
  initialState as initialUserState,
  USER_FEATURE_KEY
} from '@app/user/reducers/user.reducer';

describe('UserService', () => {
  const USERS = [USER_ADMIN, USER_BLOCKED, USER_READER];
  const READ_COMIC_BOOKS = [
    READ_COMIC_BOOK_1,
    READ_COMIC_BOOK_2,
    READ_COMIC_BOOK_3,
    READ_COMIC_BOOK_4,
    READ_COMIC_BOOK_5
  ];
  const USER = { ...USER_READER, readComicBooks: READ_COMIC_BOOKS };
  const EMAIL = USER.email;
  const PASSWORD = 'this!is!my!password';
  const PREFERENCE_NAME = 'user.preference';
  const PREFERENCE_VALUE = 'preference.value';
  const COMICS_READ_STATISTICS_DATA = [
    COMICS_READ_STATISTICS_1,
    COMICS_READ_STATISTICS_2,
    COMICS_READ_STATISTICS_3,
    COMICS_READ_STATISTICS_4,
    COMICS_READ_STATISTICS_5
  ];
  const initialState = {
    [MESSAGING_FEATURE_KEY]: initialMessagingState,
    [USER_FEATURE_KEY]: initialUserState
  };

  let service: UserService;
  let httpMock: HttpTestingController;
  let webSocketService: jasmine.SpyObj<WebSocketService>;
  let store: MockStore<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: WebSocketService,
          useValue: {
            send: jasmine.createSpy('WebSocketService.send()'),
            subscribe: jasmine.createSpy('WebSocketService.subscribe()')
          }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
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

  it('can check if there are existing admin accounts', () => {
    const serverResponse = {
      hasExisting: true
    } as CheckForAdminResponse;
    service
      .checkForAdminAccount()
      .subscribe(response => expect(response).toEqual(serverResponse));

    const req = httpMock.expectOne(interpolate(CHECK_FOR_ADMIN_ACCOUNT_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
  });

  it('can create the initial admin user', () => {
    const serverResponse = new HttpResponse({ status: 200 });

    service
      .createAdminAccount({
        email: EMAIL,
        password: PASSWORD
      })
      .subscribe(response => expect(response).toEqual(serverResponse));

    const req = httpMock.expectOne(interpolate(CREATE_ADMIN_ACCOUNT_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      email: EMAIL,
      password: PASSWORD
    } as CreateAccountRequest);
    req.flush(serverResponse);
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

  it('can logout the current user out', () => {
    service
      .logoutUser()
      .subscribe(response => expect(response.status).toEqual(200));

    const req = httpMock.expectOne(interpolate(LOGOUT_USER_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    req.flush(new HttpResponse({ status: 200 }));
  });

  describe('user preferences', () => {
    it('saves when the value is non-null and has length', () => {
      service
        .saveUserPreference({
          name: PREFERENCE_NAME,
          value: PREFERENCE_VALUE
        })
        .subscribe(response => expect(response).toEqual(USER));

      const req = httpMock.expectOne(
        interpolate(SAVE_USER_PREFERENCE_URL, { name: PREFERENCE_NAME })
      );
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        value: PREFERENCE_VALUE
      } as SaveUserPreferenceRequest);
      req.flush(USER);
    });

    it('deletes when the value is null', () => {
      service
        .saveUserPreference({
          name: PREFERENCE_NAME,
          value: null
        })
        .subscribe(response => expect(response).toEqual(USER));

      const req = httpMock.expectOne(
        interpolate(DELETE_USER_PREFERENCE_URL, { name: PREFERENCE_NAME })
      );
      expect(req.request.method).toEqual('DELETE');
      req.flush(USER);
    });

    it('deletes when the value is an empty string', () => {
      service
        .saveUserPreference({
          name: PREFERENCE_NAME,
          value: ''
        })
        .subscribe(response => expect(response).toEqual(USER));

      const req = httpMock.expectOne(
        interpolate(DELETE_USER_PREFERENCE_URL, { name: PREFERENCE_NAME })
      );
      expect(req.request.method).toEqual('DELETE');
      req.flush(USER);
    });
  });

  describe('when messaging starts', () => {
    let topic: string;
    let subscription: any;

    beforeEach(() => {
      service.email = USER.email;
      service.userUpdateSubscriptions = null;
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
      expect(topic).toEqual(
        interpolate(USER_SELF_TOPIC, { email: USER.email })
      );
    });

    describe('when updates are received', () => {
      beforeEach(() => {
        subscription(USER);
      });

      it('sets the current user', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          loadCurrentUserSuccess({ user: USER })
        );
      });

      it('sets the read comic books list', () => {
        expect(store.dispatch).toHaveBeenCalledWith(
          setReadComicBooks({ entries: READ_COMIC_BOOKS })
        );
      });
    });
  });

  describe('when messaging is stopped', () => {
    const subscription = jasmine.createSpyObj(['unsubscribe']);

    beforeEach(() => {
      service.userUpdateSubscriptions = subscription;
      store.setState({
        ...initialState,
        [MESSAGING_FEATURE_KEY]: { ...initialMessagingState, started: false }
      });
    });

    it('unsubscribes from updates', () => {
      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('clears the subscription reference', () => {
      expect(service.userUpdateSubscriptions).toBeNull();
    });
  });

  it('can save changes to a user', () => {
    service
      .saveUser({ user: USER, password: PASSWORD })
      .subscribe(response => expect(response).toEqual(USER));

    const req = httpMock.expectOne(
      interpolate(SAVE_CURRENT_USER_URL, { id: USER.comixedUserId })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({
      email: USER.email,
      password: PASSWORD
    } as SaveCurrentUserRequest);
    req.flush(USER);
  });

  it('can load the comics read statistics for a user', () => {
    const serverResponse = COMICS_READ_STATISTICS_DATA;

    service
      .loadComicsReadStatistics()
      .subscribe(response =>
        expect(response).toEqual(COMICS_READ_STATISTICS_DATA)
      );

    const req = httpMock.expectOne(
      interpolate(LOAD_COMICS_READ_STATISTICS_URL)
    );
    expect(req.request.method).toEqual('GET');
    req.flush(serverResponse);
  });

  it('can load the list of users', () => {
    service
      .loadUserAccounts()
      .subscribe(response => expect(response).toBe(USERS));

    const req = httpMock.expectOne(interpolate(LOAD_USER_LIST_URL));
    expect(req.request.method).toEqual('GET');
    req.flush(USERS);
  });

  it('can create a user', () => {
    service
      .saveUserAccount({
        id: null,
        email: USER.email,
        password: PASSWORD,
        admin: false
      })
      .subscribe(response => expect(response).toBe(USERS));

    const req = httpMock.expectOne(interpolate(CREATE_USER_ACCOUNT_URL));
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({
      email: USER.email,
      password: PASSWORD,
      admin: false
    } as CreateUserAccountRequest);
    req.flush(USERS);
  });

  it('can save a user', () => {
    service
      .saveUserAccount({
        id: USER.comixedUserId,
        email: USER.email,
        password: PASSWORD,
        admin: false
      })
      .subscribe(response => expect(response).toBe(USERS));

    const req = httpMock.expectOne(
      interpolate(SAVE_USER_ACCOUNT_URL, { userId: USER.comixedUserId })
    );
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual({
      email: USER.email,
      password: PASSWORD,
      admin: false
    } as CreateUserAccountRequest);
    req.flush(USERS);
  });

  it('can delete a user', () => {
    service
      .deleteUserAccount({ id: USER.comixedUserId })
      .subscribe(response => expect(response).toBe(USERS));

    const req = httpMock.expectOne(
      interpolate(DELETE_USER_ACCOUNT_URL, { userId: USER.comixedUserId })
    );
    expect(req.request.method).toEqual('DELETE');
    req.flush(USERS);
  });
});
