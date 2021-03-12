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
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { MessagingEffects } from './messaging.effects';
import { WebSocketService } from '@app/messaging/services/web-socket.service';
import { provideMockStore } from '@ngrx/store/testing';
import {
  messagingStarted,
  messagingStopped,
  startMessaging,
  stopMessaging
} from '@app/messaging/actions/messaging.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';

describe('MessagingEffects', () => {
  const initialState = {};

  let actions$: Observable<any>;
  let effects: MessagingEffects;
  let webSocketService: jasmine.SpyObj<WebSocketService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        MessagingEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        {
          provide: WebSocketService,
          useValue: {
            connect: jasmine.createSpy('WebSocketService.connect()'),
            disconnect: jasmine.createSpy('WebSocketService.disconnect()')
          }
        }
      ]
    });

    effects = TestBed.inject(MessagingEffects);
    webSocketService = TestBed.inject(
      WebSocketService
    ) as jasmine.SpyObj<WebSocketService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('starting the messaging service', () => {
    it('fires an action on success', () => {
      const action = startMessaging();
      const outcome = messagingStarted();

      actions$ = hot('-a', { a: action });
      webSocketService.connect.and.returnValue(of({}));

      const expected = hot('-b', { b: outcome });
      expect(effects.startMessaging$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const action = startMessaging();
      const outcome = messagingStopped();

      actions$ = hot('-a', { a: action });
      webSocketService.connect.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.startMessaging$).toBeObservable(expected);
    });
  });

  describe('stopping the messaging service', () => {
    it('fires an action on success', () => {
      const action = stopMessaging();
      const outcome = messagingStopped();

      actions$ = hot('-a', { a: action });
      webSocketService.disconnect.and.returnValue(of({}));

      const expected = hot('-b', { b: outcome });
      expect(effects.stopMessaging$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const action = stopMessaging();
      const outcome = messagingStopped();

      actions$ = hot('-a', { a: action });
      webSocketService.connect.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.stopMessaging$).toBeObservable(expected);
    });
  });
});
