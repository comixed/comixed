/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import { ComicBookSelectionEffects } from './comic-book-selection.effects';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import { ComicBookSelectionService } from '@app/comic-books/services/comic-book-selection.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  clearComicBookSelectionState,
  clearComicBookSelectionStateFailed,
  comicBookSelectionsLoaded,
  comicBookSelectionStateCleared,
  loadComicBookSelections,
  loadComicBookSelectionsFailed,
  multipleComicBookSelectionStateSet,
  setMultipleComicBookSelectionState,
  setMultipleComicBookSelectionStateFailed,
  setSingleComicBookSelectionState,
  setSingleComicBookSelectionStateFailed,
  singleComicBookSelectionStateSet
} from '@app/comic-books/actions/comic-book-selection.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ComicBookSelectionEffects', () => {
  const COVER_YEAR = Math.random() * 100 + 1900;
  const COVER_MONTH = Math.random() * 12;
  const ARCHIVE_TYPE = ArchiveType.CB7;
  const COMIC_TYPE = ComicType.ISSUE;
  const COMIC_STATE = ComicState.UNPROCESSED;
  const READ_STATE = Math.random() > 0.5;
  const UNSCRAPED_STATE = Math.random() > 0.5;
  const SEARCH_TEXT = 'This is some text';
  const ID = 65;
  const SELECTED = Math.random() > 0.5;

  let actions$: Observable<any>;
  let effects: ComicBookSelectionEffects;
  let comicBookSelectionService: jasmine.SpyObj<ComicBookSelectionService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComicBookSelectionEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicBookSelectionService,
          useValue: {
            loadSelections: jasmine.createSpy(
              'ComicBookSelectionService.loadSelections()'
            ),
            setSingleState: jasmine.createSpy(
              'ComicBookSelectionService.setSingleState()'
            ),
            setMultipleState: jasmine.createSpy(
              'ComicBookSelectionService.setMultipleState()'
            ),
            clearSelections: jasmine.createSpy(
              'ComicBookSelectionService.clearSelections()'
            )
          }
        }
      ],
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ]
    });

    effects = TestBed.inject(ComicBookSelectionEffects);
    comicBookSelectionService = TestBed.inject(
      ComicBookSelectionService
    ) as jasmine.SpyObj<ComicBookSelectionService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the current comic book selectsion', () => {
    it('fires an action on success', () => {
      const serviceResponse = [ID];
      const action = loadComicBookSelections();
      const outcome = comicBookSelectionsLoaded({ ids: [ID] });

      actions$ = hot('-a', {
        a: action
      });
      comicBookSelectionService.loadSelections.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadSelections$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComicBookSelections();
      const outcome = loadComicBookSelectionsFailed();

      actions$ = hot('-a', {
        a: action
      });
      comicBookSelectionService.loadSelections.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicBookSelections();
      const outcome = loadComicBookSelectionsFailed();

      actions$ = hot('-a', {
        a: action
      });
      comicBookSelectionService.loadSelections.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting a single comic book', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = setSingleComicBookSelectionState({
        id: ID,
        selected: SELECTED
      });
      const outcome = singleComicBookSelectionStateSet();

      actions$ = hot('-a', { a: action });
      comicBookSelectionService.setSingleState
        .withArgs({
          id: ID,
          selected: SELECTED
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSingleState$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setSingleComicBookSelectionState({
        id: ID,
        selected: SELECTED
      });
      const outcome = setSingleComicBookSelectionStateFailed();

      actions$ = hot('-a', { a: action });
      comicBookSelectionService.setSingleState
        .withArgs({
          id: ID,
          selected: SELECTED
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSingleState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setSingleComicBookSelectionState({
        id: ID,
        selected: SELECTED
      });
      const outcome = setSingleComicBookSelectionStateFailed();

      actions$ = hot('-a', { a: action });
      comicBookSelectionService.setSingleState
        .withArgs({
          id: ID,
          selected: SELECTED
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setSingleState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting multiple comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = setMultipleComicBookSelectionState({
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        readState: READ_STATE,
        unscrapedState: UNSCRAPED_STATE,
        searchText: SEARCH_TEXT,
        selected: SELECTED
      });
      const outcome = multipleComicBookSelectionStateSet();

      actions$ = hot('-a', { a: action });
      comicBookSelectionService.setMultipleState
        .withArgs({
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          readState: READ_STATE,
          unscrapedState: UNSCRAPED_STATE,
          searchText: SEARCH_TEXT,
          selected: SELECTED
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setMultipleState$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setMultipleComicBookSelectionState({
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        readState: READ_STATE,
        unscrapedState: UNSCRAPED_STATE,
        searchText: SEARCH_TEXT,
        selected: SELECTED
      });
      const outcome = setMultipleComicBookSelectionStateFailed();

      actions$ = hot('-a', { a: action });
      comicBookSelectionService.setMultipleState
        .withArgs({
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          readState: READ_STATE,
          unscrapedState: UNSCRAPED_STATE,
          searchText: SEARCH_TEXT,
          selected: SELECTED
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setMultipleState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setMultipleComicBookSelectionState({
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        readState: READ_STATE,
        unscrapedState: UNSCRAPED_STATE,
        searchText: SEARCH_TEXT,
        selected: SELECTED
      });
      const outcome = setMultipleComicBookSelectionStateFailed();

      actions$ = hot('-a', { a: action });
      comicBookSelectionService.setMultipleState
        .withArgs({
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          readState: READ_STATE,
          unscrapedState: UNSCRAPED_STATE,
          searchText: SEARCH_TEXT,
          selected: SELECTED
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setMultipleState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('clear the comic book selection state', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = clearComicBookSelectionState();
      const outcome = comicBookSelectionStateCleared();

      actions$ = hot('-a', { a: action });
      comicBookSelectionService.clearSelections.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.clearSelections$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = clearComicBookSelectionState();
      const outcome = clearComicBookSelectionStateFailed();

      actions$ = hot('-a', { a: action });
      comicBookSelectionService.clearSelections.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.clearSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = clearComicBookSelectionState();
      const outcome = clearComicBookSelectionStateFailed();

      actions$ = hot('-a', { a: action });
      comicBookSelectionService.clearSelections.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.clearSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
