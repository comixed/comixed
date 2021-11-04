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
import { ReadingListDetailEffects } from './reading-list-detail.effects';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { AlertService } from '@app/core/services/alert.service';
import { READING_LIST_3 } from '@app/lists/lists.fixtures';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  loadReadingList,
  loadReadingListFailed,
  readingListLoaded,
  readingListSaved,
  saveReadingList,
  saveReadingListFailed
} from '@app/lists/actions/reading-list-detail.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('LoadReadingListEffects', () => {
  const READING_LIST = READING_LIST_3;

  let actions$: Observable<any>;
  let effects: ReadingListDetailEffects;
  let readingListService: jasmine.SpyObj<ReadingListService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ReadingListDetailEffects,
        provideMockActions(() => actions$),
        {
          provide: ReadingListService,
          useValue: {
            loadOne: jasmine.createSpy('ReadingListService.loadOne()'),
            save: jasmine.createSpy('ReadingListService.save()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ReadingListDetailEffects);
    readingListService = TestBed.inject(
      ReadingListService
    ) as jasmine.SpyObj<ReadingListService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading a reading list', () => {
    it('fires an action on success', () => {
      const serviceResponse = READING_LIST;
      const action = loadReadingList({ id: READING_LIST.id });
      const outcome = readingListLoaded({ list: READING_LIST });

      actions$ = hot('-a', { a: action });
      readingListService.loadOne.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadReadingList$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadReadingList({ id: READING_LIST.id });
      const outcome = loadReadingListFailed();

      actions$ = hot('-a', { a: action });
      readingListService.loadOne.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadReadingList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadReadingList({ id: READING_LIST.id });
      const outcome = loadReadingListFailed();

      actions$ = hot('-a', { a: action });
      readingListService.loadOne.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadReadingList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('saving a reading list', () => {
    it('fires an action on success', () => {
      const serviceResponse = READING_LIST;
      const action = saveReadingList({ list: READING_LIST });
      const outcome = readingListSaved({ list: READING_LIST });

      actions$ = hot('-a', { a: action });
      readingListService.save.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveReadingList({ list: READING_LIST });
      const outcome = saveReadingListFailed();

      actions$ = hot('-a', { a: action });
      readingListService.save.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = saveReadingList({ list: READING_LIST });
      const outcome = saveReadingListFailed();

      actions$ = hot('-a', { a: action });
      readingListService.save.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
