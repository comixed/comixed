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
import {
  LAST_READ_1,
  LAST_READ_3,
  LAST_READ_5
} from '@app/last-read/last-read.fixtures';
import { LastReadService } from '@app/last-read/services/last-read.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AlertService } from '@app/core';
import { LoadLastReadEntriesResponse } from '@app/last-read/models/net/load-last-read-entries-response';
import {
  lastReadDatesLoaded,
  loadLastReadDates,
  loadLastReadDatesFailed
} from '@app/last-read/actions/last-read-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('LastReadListEffects', () => {
  const ENTRIES = [LAST_READ_1, LAST_READ_3, LAST_READ_5];
  const LAST_ID = 17;
  const LAST_PAYLOAD = Math.random() > 0.5;

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
            loadEntries: jasmine.createSpy('LastReadService.loadEntries()')
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

  describe('loading a block of last read dates', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        entries: ENTRIES,
        lastPayload: LAST_PAYLOAD
      } as LoadLastReadEntriesResponse;
      const action = loadLastReadDates({ lastId: LAST_ID });
      const outcome = lastReadDatesLoaded({
        entries: ENTRIES,
        lastPayload: LAST_PAYLOAD
      });

      actions$ = hot('-a', { a: action });
      lastReadService.loadEntries.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadEntries$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadLastReadDates({ lastId: LAST_ID });
      const outcome = loadLastReadDatesFailed();

      actions$ = hot('-a', { a: action });
      lastReadService.loadEntries.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadLastReadDates({ lastId: LAST_ID });
      const outcome = loadLastReadDatesFailed();

      actions$ = hot('-a', { a: action });
      lastReadService.loadEntries.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadEntries$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
