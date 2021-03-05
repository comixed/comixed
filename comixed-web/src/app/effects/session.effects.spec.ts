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
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { SessionEffects } from './session.effects';
import { AlertService } from '@app/core';
import { SessionUpdateResponse } from '@app/models/net/session-update-response';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionService } from '@app/services/session.service';
import {
  loadSessionUpdate,
  loadSessionUpdateFailed,
  sessionUpdateLoaded
} from '@app/actions/session.actions';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { COMIC_2, COMIC_3 } from '@app/library/library.fixtures';
import { updateComics } from '@app/library/actions/library.actions';

describe('SessionEffects', () => {
  const TIMESTAMP = new Date().getTime();
  const MAXIMUM_RECORDS = 100;
  const TIMEOUT = 300;
  const IMPORT_COUNT = 717;
  const UPDATED_COMICS = [COMIC_2];
  const REMOVED_COMICS = [COMIC_3];

  let actions$: Observable<any>;
  let effects: SessionEffects;
  let sessionService: jasmine.SpyObj<SessionService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        SessionEffects,
        provideMockActions(() => actions$),
        {
          provide: SessionService,
          useValue: {
            loadSessionUpdate: jasmine.createSpy(
              'SessionService.loadSessionUpdate()'
            )
          }
        }
      ]
    });

    effects = TestBed.inject(SessionEffects);
    sessionService = TestBed.inject(
      SessionService
    ) as jasmine.SpyObj<SessionService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading a user session update', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        update: {
          importCount: IMPORT_COUNT,
          updatedComics: UPDATED_COMICS,
          removedComicIds: REMOVED_COMICS.map(comic => comic.id),
          latest: TIMESTAMP
        }
      } as SessionUpdateResponse;
      const action = loadSessionUpdate({
        timestamp: TIMESTAMP,
        maximumRecords: MAXIMUM_RECORDS,
        timeout: TIMEOUT
      });
      const outcome1 = updateComics({
        updated: UPDATED_COMICS,
        removed: REMOVED_COMICS.map(comic => comic.id)
      });
      const outcome2 = sessionUpdateLoaded({
        importCount: IMPORT_COUNT,
        latest: TIMESTAMP
      });

      actions$ = hot('-a', { a: action });
      sessionService.loadSessionUpdate.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.loadSessionUpdate$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadSessionUpdate({
        timestamp: TIMESTAMP,
        maximumRecords: MAXIMUM_RECORDS,
        timeout: TIMEOUT
      });
      const outcome = loadSessionUpdateFailed();

      actions$ = hot('-a', { a: action });
      sessionService.loadSessionUpdate.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadSessionUpdate$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadSessionUpdate({
        timestamp: TIMESTAMP,
        maximumRecords: MAXIMUM_RECORDS,
        timeout: TIMEOUT
      });
      const outcome = loadSessionUpdateFailed();

      actions$ = hot('-a', { a: action });
      sessionService.loadSessionUpdate.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadSessionUpdate$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
