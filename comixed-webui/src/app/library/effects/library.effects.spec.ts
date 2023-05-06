/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LibraryService } from '@app/library/services/library.service';
import { LibraryEffects } from '@app/library/effects/library.effects';
import {
  COMIC_DETAIL_1,
  COMIC_DETAIL_3
} from '@app/comic-books/comic-books.fixtures';
import { EditMultipleComics } from '@app/library/models/ui/edit-multiple-comics';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  editMultipleComics,
  editMultipleComicsFailed,
  libraryStateLoaded,
  loadLibraryState,
  loadLibraryStateFailed,
  multipleComicsEdited
} from '@app/library/actions/library.actions';
import { hot } from 'jasmine-marbles';
import { RemoteLibraryState } from '@app/library/models/net/remote-library-state';
import { comicBookSelectionsUpdated } from '@app/library/actions/library-selections.actions';
import { ComicType } from '@app/comic-books/models/comic-type';

describe('LibraryEffects', () => {
  const COMIC_BOOKS = [COMIC_DETAIL_1, COMIC_DETAIL_3];
  const IDS = COMIC_BOOKS.map(comicBook => comicBook.comicId);
  const LIBRARY_STATE = { selectedIds: IDS } as RemoteLibraryState;
  const COMIC_DETAILS: EditMultipleComics = {
    publisher: 'The Publisher',
    series: 'The Series',
    volume: '1234',
    issueNumber: '77a',
    imprint: 'The Imprint',
    comicType: ComicType.MANGA
  };

  let actions$: Observable<any>;
  let effects: LibraryEffects;
  let libraryService: jasmine.SpyObj<LibraryService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        LibraryEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            loadLibraryState: jasmine.createSpy(
              'LibraryService.loadLibraryState'
            ),
            editMultipleComics: jasmine.createSpy(
              'LibraryService.editMultipleComics()'
            )
          }
        }
      ]
    });

    effects = TestBed.inject(LibraryEffects);
    libraryService = TestBed.inject(
      LibraryService
    ) as jasmine.SpyObj<LibraryService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the library state', () => {
    it('fires an action on success', () => {
      const serviceResponse = LIBRARY_STATE;
      const action = loadLibraryState();
      const outcome1 = libraryStateLoaded({ state: LIBRARY_STATE });
      const outcome2 = comicBookSelectionsUpdated({ ids: IDS });

      actions$ = hot('-a', { a: action });
      libraryService.loadLibraryState.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.loadLibraryState$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadLibraryState();
      const outcome = loadLibraryStateFailed();

      actions$ = hot('-a', { a: action });
      libraryService.loadLibraryState.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadLibraryState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadLibraryState();
      const outcome = loadLibraryStateFailed();

      actions$ = hot('-a', { a: action });
      libraryService.loadLibraryState.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadLibraryState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('editing multiple comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = editMultipleComics({
        comicBooks: COMIC_BOOKS,
        details: COMIC_DETAILS
      });
      const outcome = multipleComicsEdited();

      actions$ = hot('-a', { a: action });
      libraryService.editMultipleComics
        .withArgs({
          comicBooks: COMIC_BOOKS,
          details: COMIC_DETAILS
        })
        .and.returnValue(of(outcome));

      const expected = hot('-b', { b: outcome });
      expect(effects.editMultipleComics$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = editMultipleComics({
        comicBooks: COMIC_BOOKS,
        details: COMIC_DETAILS
      });
      const outcome = editMultipleComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.editMultipleComics
        .withArgs({
          comicBooks: COMIC_BOOKS,
          details: COMIC_DETAILS
        })
        .and.returnValue(throwError(outcome));

      const expected = hot('-b', { b: outcome });
      expect(effects.editMultipleComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = editMultipleComics({
        comicBooks: COMIC_BOOKS,
        details: COMIC_DETAILS
      });
      const outcome = editMultipleComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.editMultipleComics
        .withArgs({
          comicBooks: COMIC_BOOKS,
          details: COMIC_DETAILS
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.editMultipleComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
