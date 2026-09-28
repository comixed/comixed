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
import { ComicSelectionEffects } from './comic-selection.effects';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { ComicType } from '@app/comic-books/models/comic-type';
import { ComicState } from '@app/comic-books/models/comic-state';
import { ComicSelectionService } from '@app/comic-books/services/comic-selection.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  addSingleComicSelection,
  clearComicSelectionState,
  clearComicSelectionStateFailed,
  comicSelectionsLoaded,
  comicSelectionStateCleared,
  loadComicSelections,
  loadComicSelectionsFailed,
  removeSingleComicSelection,
  setComicSelectionByUnreadState,
  setDuplicateComicsSelectionState,
  setMultipleComicByFilterSelectionState,
  setMultipleComicByIdSelectionState,
  setMultipleComicByPublisherSelectionState,
  setMultipleComicByPublisherSeriesAndVolumeSelectionState,
  setMultipleComicsByTagTypeAndValueSelectionState,
  setMultipleComicSelectionStateFailure,
  setMultipleComicSelectionStateSuccess,
  singleComicSelectionFailed,
  singleComicSelectionUpdated
} from '@app/comic-books/actions/comic-book-selection.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PUBLISHER_1, SERIES_1 } from '@app/collections/collections.fixtures';
import { ComicTagType } from '@app/comic-books/models/comic-tag-type';

describe('ComicSelectionEffects', () => {
  const COVER_YEAR = Math.random() * 100 + 1900;
  const COVER_MONTH = Math.random() * 12;
  const ARCHIVE_TYPE = ArchiveType.CB7;
  const COMIC_TYPE = ComicType.ISSUE;
  const COMIC_STATE = ComicState.UNPROCESSED;
  const UNSCRAPED_STATE = Math.random() > 0.5;
  const SEARCH_TEXT = 'This is some text';
  const COMIC_ID = 65;
  const PUBLISHER = PUBLISHER_1.name;
  const SERIES = SERIES_1.name;
  const VOLUME = '2024';
  const SELECTED = Math.random() > 0.5;
  const UNREAD_ONLY = Math.random() > 0.5;
  const TAG_TYPE = ComicTagType.TEAM;
  const TAG_VALUE = 'Some team';
  const COMIC_IDS = [7, 17, 65, 1, 29, 91];

  let actions$: Observable<any>;
  let effects: ComicSelectionEffects;
  let comicSelectionService: jasmine.SpyObj<ComicSelectionService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComicSelectionEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicSelectionService,
          useValue: {
            loadSelections: jasmine.createSpy(
              'ComicSelectionService.loadSelections()'
            ),
            addSingleSelection: jasmine.createSpy(
              'ComicSelectionService.addSingleSelection()'
            ),
            removeSingleSelection: jasmine.createSpy(
              'ComicSelectionService.removeSingleSelection()'
            ),
            setSelectedByFilter: jasmine.createSpy(
              'ComicSelectionService.setSelectedByFilter()'
            ),
            setSelectedByTagTypeAndValue: jasmine.createSpy(
              'ComicSelectionService.setSelectedByTagTypeAndValue()'
            ),
            setSelectedById: jasmine.createSpy(
              'ComicSelectionService.setSelectedById()'
            ),
            setSelectedByPublisher: jasmine.createSpy(
              'ComicSelectionService.setSelectedByPublisher()'
            ),
            setSelectedByPublisherSeriesAndVolume: jasmine.createSpy(
              'ComicSelectionService.setSelectedByPublisherSeriesAndVolume()'
            ),
            setDuplicateComicsSelectionState: jasmine.createSpy(
              'ComicSelectionService.setDuplicateComicsSelectionState()'
            ),
            setUnreadComicsSelectionState: jasmine.createSpy(
              'ComicSelectionService.setUnreadComicsSelectionState()'
            ),
            clearSelections: jasmine.createSpy(
              'ComicSelectionService.clearSelections()'
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

    effects = TestBed.inject(ComicSelectionEffects);
    comicSelectionService = TestBed.inject(
      ComicSelectionService
    ) as jasmine.SpyObj<ComicSelectionService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the current comic book selections', () => {
    it('fires an action on success', () => {
      const serviceResponse = [COMIC_ID];
      const action = loadComicSelections();
      const outcome = comicSelectionsLoaded({ ids: [COMIC_ID] });

      actions$ = hot('-a', {
        a: action
      });
      comicSelectionService.loadSelections.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadSelections$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComicSelections();
      const outcome = loadComicSelectionsFailed();

      actions$ = hot('-a', {
        a: action
      });
      comicSelectionService.loadSelections.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicSelections();
      const outcome = loadComicSelectionsFailed();

      actions$ = hot('-a', {
        a: action
      });
      comicSelectionService.loadSelections.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('adding a single comic book selection', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = addSingleComicSelection({
        comicId: COMIC_ID
      });
      const outcome = singleComicSelectionUpdated();

      actions$ = hot('-a', { a: action });
      comicSelectionService.addSingleSelection
        .withArgs({
          comicId: COMIC_ID
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.addSingleSelection$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = addSingleComicSelection({
        comicId: COMIC_ID
      });
      const outcome = singleComicSelectionFailed();

      actions$ = hot('-a', { a: action });
      comicSelectionService.addSingleSelection
        .withArgs({
          comicId: COMIC_ID
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.addSingleSelection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = addSingleComicSelection({
        comicId: COMIC_ID
      });
      const outcome = singleComicSelectionFailed();

      actions$ = hot('-a', { a: action });
      comicSelectionService.addSingleSelection
        .withArgs({
          comicId: COMIC_ID
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.addSingleSelection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('removing a single comic book selection', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = removeSingleComicSelection({
        comicId: COMIC_ID
      });
      const outcome = singleComicSelectionUpdated();

      actions$ = hot('-a', { a: action });
      comicSelectionService.removeSingleSelection
        .withArgs({
          comicId: COMIC_ID
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.removeSingleSelection$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = removeSingleComicSelection({
        comicId: COMIC_ID
      });
      const outcome = singleComicSelectionFailed();

      actions$ = hot('-a', { a: action });
      comicSelectionService.removeSingleSelection
        .withArgs({
          comicId: COMIC_ID
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.removeSingleSelection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = removeSingleComicSelection({
        comicId: COMIC_ID
      });
      const outcome = singleComicSelectionFailed();

      actions$ = hot('-a', { a: action });
      comicSelectionService.removeSingleSelection
        .withArgs({
          comicId: COMIC_ID
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.removeSingleSelection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting comic books by filter', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = setMultipleComicByFilterSelectionState({
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        unscrapedState: UNSCRAPED_STATE,
        searchText: SEARCH_TEXT,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateSuccess();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByFilter
        .withArgs({
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          unscrapedState: UNSCRAPED_STATE,
          searchText: SEARCH_TEXT,
          selected: SELECTED
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedByFilter$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setMultipleComicByFilterSelectionState({
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        unscrapedState: UNSCRAPED_STATE,
        searchText: SEARCH_TEXT,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByFilter
        .withArgs({
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          unscrapedState: UNSCRAPED_STATE,
          searchText: SEARCH_TEXT,
          selected: SELECTED
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedByFilter$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setMultipleComicByFilterSelectionState({
        coverYear: COVER_YEAR,
        coverMonth: COVER_MONTH,
        archiveType: ARCHIVE_TYPE,
        comicType: COMIC_TYPE,
        comicState: COMIC_STATE,
        unscrapedState: UNSCRAPED_STATE,
        searchText: SEARCH_TEXT,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByFilter
        .withArgs({
          coverYear: COVER_YEAR,
          coverMonth: COVER_MONTH,
          archiveType: ARCHIVE_TYPE,
          comicType: COMIC_TYPE,
          comicState: COMIC_STATE,
          unscrapedState: UNSCRAPED_STATE,
          searchText: SEARCH_TEXT,
          selected: SELECTED
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setSelectedByFilter$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting comic books by tag type and value', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = setMultipleComicsByTagTypeAndValueSelectionState({
        tagType: TAG_TYPE,
        tagValue: TAG_VALUE,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateSuccess();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByTagTypeAndValue
        .withArgs({
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          selected: SELECTED
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedByTagTypeAndValue$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setMultipleComicsByTagTypeAndValueSelectionState({
        tagType: TAG_TYPE,
        tagValue: TAG_VALUE,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByTagTypeAndValue
        .withArgs({
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          selected: SELECTED
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedByTagTypeAndValue$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setMultipleComicsByTagTypeAndValueSelectionState({
        tagType: TAG_TYPE,
        tagValue: TAG_VALUE,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByTagTypeAndValue
        .withArgs({
          tagType: TAG_TYPE,
          tagValue: TAG_VALUE,
          selected: SELECTED
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setSelectedByTagTypeAndValue$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting comic books by id', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = setMultipleComicByIdSelectionState({
        comicIds: COMIC_IDS,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateSuccess();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedById
        .withArgs({ comicIds: COMIC_IDS, selected: SELECTED })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedById$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setMultipleComicByIdSelectionState({
        comicIds: COMIC_IDS,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedById
        .withArgs({ comicIds: COMIC_IDS, selected: SELECTED })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedById$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setMultipleComicByIdSelectionState({
        comicIds: COMIC_IDS,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedById
        .withArgs({ comicIds: COMIC_IDS, selected: SELECTED })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setSelectedById$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting comic books by publisher name', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = setMultipleComicByPublisherSelectionState({
        publisher: PUBLISHER,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateSuccess();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByPublisher
        .withArgs({ publisher: PUBLISHER, selected: SELECTED })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedByPublisher$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setMultipleComicByPublisherSelectionState({
        publisher: PUBLISHER,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByPublisher
        .withArgs({ publisher: PUBLISHER, selected: SELECTED })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedByPublisher$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setMultipleComicByPublisherSelectionState({
        publisher: PUBLISHER,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByPublisher
        .withArgs({ publisher: PUBLISHER, selected: SELECTED })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setSelectedByPublisher$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting comic books by publisher, series, and volume', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = setMultipleComicByPublisherSeriesAndVolumeSelectionState({
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateSuccess();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByPublisherSeriesAndVolume
        .withArgs({
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          selected: SELECTED
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedByPublisherSeriesAndVolume$).toBeObservable(
        expected
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setMultipleComicByPublisherSeriesAndVolumeSelectionState({
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByPublisherSeriesAndVolume
        .withArgs({
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          selected: SELECTED
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setSelectedByPublisherSeriesAndVolume$).toBeObservable(
        expected
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setMultipleComicByPublisherSeriesAndVolumeSelectionState({
        publisher: PUBLISHER,
        series: SERIES,
        volume: VOLUME,
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setSelectedByPublisherSeriesAndVolume
        .withArgs({
          publisher: PUBLISHER,
          series: SERIES,
          volume: VOLUME,
          selected: SELECTED
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setSelectedByPublisherSeriesAndVolume$).toBeObservable(
        expected
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting all duplicate comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = setDuplicateComicsSelectionState({
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateSuccess();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setDuplicateComicsSelectionState
        .withArgs({ selected: SELECTED })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setDuplicateComicsSelectionState$).toBeObservable(
        expected
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setDuplicateComicsSelectionState({
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setDuplicateComicsSelectionState
        .withArgs({ selected: SELECTED })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setDuplicateComicsSelectionState$).toBeObservable(
        expected
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setDuplicateComicsSelectionState({
        selected: SELECTED
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setDuplicateComicsSelectionState
        .withArgs({ selected: SELECTED })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setDuplicateComicsSelectionState$).toBeObservable(
        expected
      );
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting all comic books by read state', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = setComicSelectionByUnreadState({
        selected: SELECTED,
        unreadOnly: UNREAD_ONLY
      });
      const outcome = setMultipleComicSelectionStateSuccess();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setUnreadComicsSelectionState
        .withArgs({ selected: SELECTED, unreadOnly: UNREAD_ONLY })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setUnreadComicsSelectionState$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setComicSelectionByUnreadState({
        selected: SELECTED,
        unreadOnly: UNREAD_ONLY
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setUnreadComicsSelectionState
        .withArgs({ selected: SELECTED, unreadOnly: UNREAD_ONLY })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setUnreadComicsSelectionState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setComicSelectionByUnreadState({
        selected: SELECTED,
        unreadOnly: UNREAD_ONLY
      });
      const outcome = setMultipleComicSelectionStateFailure();

      actions$ = hot('-a', { a: action });
      comicSelectionService.setUnreadComicsSelectionState
        .withArgs({ selected: SELECTED, unreadOnly: UNREAD_ONLY })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setUnreadComicsSelectionState$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('clear the comic book selection state', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({});
      const action = clearComicSelectionState();
      const outcome = comicSelectionStateCleared();

      actions$ = hot('-a', { a: action });
      comicSelectionService.clearSelections.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.clearSelections$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = clearComicSelectionState();
      const outcome = clearComicSelectionStateFailed();

      actions$ = hot('-a', { a: action });
      comicSelectionService.clearSelections.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.clearSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = clearComicSelectionState();
      const outcome = clearComicSelectionStateFailed();

      actions$ = hot('-a', { a: action });
      comicSelectionService.clearSelections.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.clearSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
