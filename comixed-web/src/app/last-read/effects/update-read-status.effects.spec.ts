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
import { UpdateReadStatusEffects } from './update-read-status.effects';
import { LastReadService } from '@app/last-read/services/last-read.service';
import { COMIC_4 } from '@app/comic/comic.fixtures';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  comicReadStatusUpdated,
  updateComicReadStatus,
  updateComicReadStatusFailed
} from '@app/last-read/actions/update-read-status.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import {
  lastReadDateRemoved,
  lastReadDateUpdated
} from '@app/last-read/actions/last-read-list.actions';
import { LAST_READ_2 } from '@app/last-read/last-read.fixtures';
import { AlertService } from '@app/core/services/alert.service';

describe('UpdateReadStatusEffects', () => {
  const COMIC = COMIC_4;
  const READ = Math.random() > 0.5;
  const ENTRY = LAST_READ_2;

  let actions$: Observable<any>;
  let effects: UpdateReadStatusEffects;
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
        UpdateReadStatusEffects,
        provideMockActions(() => actions$),
        {
          provide: LastReadService,
          useValue: {
            setStatus: jasmine.createSpy('LastReadService.setStatus()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(UpdateReadStatusEffects);
    lastReadService = TestBed.inject(
      LastReadService
    ) as jasmine.SpyObj<LastReadService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('updating the last read status of a comic', () => {
    it('fires an action on success marking', () => {
      const serviceResponse = ENTRY;
      const action = updateComicReadStatus({ comic: COMIC, status: true });
      const outcome1 = comicReadStatusUpdated();
      const outcome2 = lastReadDateUpdated({ entry: ENTRY });

      actions$ = hot('-a', { a: action });
      lastReadService.setStatus.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.updateStatus$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on success unmarking', () => {
      const serviceResponse = ENTRY;
      const action = updateComicReadStatus({ comic: COMIC, status: false });
      const outcome1 = comicReadStatusUpdated();
      const outcome2 = lastReadDateRemoved({ entry: ENTRY });

      actions$ = hot('-a', { a: action });
      lastReadService.setStatus.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.updateStatus$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = updateComicReadStatus({ comic: COMIC, status: READ });
      const outcome = updateComicReadStatusFailed();

      actions$ = hot('-a', { a: action });
      lastReadService.setStatus.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.updateStatus$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = updateComicReadStatus({ comic: COMIC, status: READ });
      const outcome = updateComicReadStatusFailed();

      actions$ = hot('-a', { a: action });
      lastReadService.setStatus.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.updateStatus$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
