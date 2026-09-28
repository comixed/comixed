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
import { ReadingListsEffects } from './reading-lists.effects';
import { ReadingListService } from '@app/lists/services/reading-list.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  READING_LIST_1,
  READING_LIST_3,
  READING_LIST_5
} from '@app/lists/lists.fixtures';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  deleteReadingLists,
  deleteReadingListsFailed,
  loadReadingLists,
  loadReadingListsFailed,
  readingListsDeleted,
  readingListsLoaded
} from '@app/lists/actions/reading-lists.actions';

describe('ReadingListsEffects', () => {
  const READING_LISTS = [READING_LIST_1, READING_LIST_3, READING_LIST_5];

  let actions$: Observable<any>;
  let effects: ReadingListsEffects;
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
        ReadingListsEffects,
        provideMockActions(() => actions$),
        {
          provide: ReadingListService,
          useValue: {
            loadReadingLists: jasmine.createSpy(
              'ReadingListsService.loadReadingLists()'
            ),
            deleteReadingLists: jasmine.createSpy(
              'ReadingListsService.deleteReadingLists()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ReadingListsEffects);
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

  describe('loading reading lists for a user', () => {
    it('fires an action on success', () => {
      const serviceResponse = READING_LISTS;
      const action = loadReadingLists();
      const outcome = readingListsLoaded({ entries: READING_LISTS });

      actions$ = hot('-a', { a: action });
      readingListService.loadReadingLists.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadUserReadingLists$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadReadingLists();
      const outcome = loadReadingListsFailed();

      actions$ = hot('-a', { a: action });
      readingListService.loadReadingLists.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadUserReadingLists$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadReadingLists();
      const outcome = loadReadingListsFailed();

      actions$ = hot('-a', { a: action });
      readingListService.loadReadingLists.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadUserReadingLists$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('deleting reading lists', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = deleteReadingLists({ lists: READING_LISTS });
      const outcome = readingListsDeleted();

      actions$ = hot('-a', { a: action });
      readingListService.deleteReadingLists
        .withArgs({ lists: READING_LISTS })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteReadingLists$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = deleteReadingLists({ lists: READING_LISTS });
      const outcome = deleteReadingListsFailed();

      actions$ = hot('-a', { a: action });
      readingListService.deleteReadingLists
        .withArgs({ lists: READING_LISTS })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteReadingLists$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = deleteReadingLists({ lists: READING_LISTS });
      const outcome = deleteReadingListsFailed();

      actions$ = hot('-a', { a: action });
      readingListService.deleteReadingLists
        .withArgs({ lists: READING_LISTS })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deleteReadingLists$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
