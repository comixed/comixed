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
import { Observable, of, throwError } from 'rxjs';
import { LastReadListEffects } from './last-read-list.effects';
import { LastReadService } from '@app/comic-books/services/last-read.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AlertService } from '@app/core/services/alert.service';
import {
  loadUnreadComicBookCount,
  loadUnreadComicBookCountFailure,
  loadUnreadComicBookCountSuccess
} from '@app/comic-books/actions/last-read-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadUnreadComicBookCountResponse } from '@app/comic-books/models/net/load-unread-comic-book-count-response';

describe('LastReadListEffects', () => {
  const READ_COUNT = 129;
  const UNREAD_COUNT = 717;

  let actions$: Observable<any>;
  let effects: LastReadListEffects;
  let lastReadService: jasmine.SpyObj<LastReadService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        LastReadListEffects,
        provideMockActions(() => actions$),
        {
          provide: LastReadService,
          useValue: {
            loadUnreadComicBookCount: jasmine.createSpy(
              'LastReadService.loadUnreadComicBookCount()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(LastReadListEffects);
    lastReadService = TestBed.inject(
      LastReadService
    ) as jasmine.SpyObj<LastReadService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the unread comic book count', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        readCount: READ_COUNT,
        unreadCount: UNREAD_COUNT
      } as LoadUnreadComicBookCountResponse;
      const action = loadUnreadComicBookCount();
      const outcome = loadUnreadComicBookCountSuccess({
        readCount: READ_COUNT,
        unreadCount: UNREAD_COUNT
      });

      actions$ = hot('-a', { a: action });
      lastReadService.loadUnreadComicBookCount
        .withArgs()
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadUnreadComicBookCount$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadUnreadComicBookCount();
      const outcome = loadUnreadComicBookCountFailure();

      actions$ = hot('-a', { a: action });
      lastReadService.loadUnreadComicBookCount
        .withArgs()
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadUnreadComicBookCount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadUnreadComicBookCount();
      const outcome = loadUnreadComicBookCountFailure();

      actions$ = hot('-a', { a: action });
      lastReadService.loadUnreadComicBookCount
        .withArgs()
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadUnreadComicBookCount$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
