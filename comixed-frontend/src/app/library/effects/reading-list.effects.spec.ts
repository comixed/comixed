/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  ReadingListAddComics,
  ReadingListAddComicsFailed,
  ReadingListComicsAdded,
  ReadingListSave,
  ReadingListSaved,
  ReadingListSaveFailed
} from 'app/library/actions/reading-list.actions';
import { ReadingListService } from 'app/library/services/reading-list.service';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';

import { ReadingListEffects } from './reading-list.effects';
import { READING_LIST_1 } from 'app/comics/models/reading-list.fixtures';
import { COMIC_1, COMIC_2, COMIC_3 } from 'app/comics/comics.fixtures';
import { AddComicsToReadingListResponse } from 'app/library/models/net/add-comics-to-reading-list-response';
import objectContaining = jasmine.objectContaining;

describe('ReadingListEffects', () => {
  const READING_LIST = READING_LIST_1;
  const READING_LIST_ID = READING_LIST.id;
  const READING_LIST_NAME = READING_LIST.name;
  const READING_LIST_SUMMARY = READING_LIST.summary;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3];

  let actions$: Observable<any>;
  let effects: ReadingListEffects;
  let readingListService: jasmine.SpyObj<ReadingListService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), LoggerModule.forRoot()],
      providers: [
        ReadingListEffects,
        provideMockActions(() => actions$),
        {
          provide: ReadingListService,
          useValue: {
            save: jasmine.createSpy('ReadingListService.save'),
            addComics: jasmine.createSpy('ReadingListService.addComics')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get(ReadingListEffects);
    readingListService = TestBed.get(ReadingListService);
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('when saving a reading list', () => {
    it('fires an action on success', () => {
      const service_response = READING_LIST_1;
      const action = new ReadingListSave({
        id: READING_LIST_ID,
        name: READING_LIST_NAME,
        summary: READING_LIST_SUMMARY
      });
      const outcome = new ReadingListSaved({ readingList: READING_LIST });

      actions$ = hot('-a', { a: action });
      readingListService.save.and.returnValue(of(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const service_response = new HttpErrorResponse({});
      const action = new ReadingListSave({
        id: READING_LIST_ID,
        name: READING_LIST_NAME,
        summary: READING_LIST_SUMMARY
      });
      const outcome = new ReadingListSaveFailed();

      actions$ = hot('-a', { a: action });
      readingListService.save.and.returnValue(throwError(service_response));

      const expected = hot('-b', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ReadingListSave({
        id: READING_LIST_ID,
        name: READING_LIST_NAME,
        summary: READING_LIST_SUMMARY
      });
      const outcome = new ReadingListSaveFailed();

      actions$ = hot('-a', { a: action });
      readingListService.save.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.save$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('adding comics to a reading list', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        addedCount: COMICS.length
      } as AddComicsToReadingListResponse;
      const action = new ReadingListAddComics({
        readingList: READING_LIST,
        comics: COMICS
      });
      const outcome = new ReadingListComicsAdded();

      actions$ = hot('-a', { a: action });
      readingListService.addComics.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.addComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ReadingListAddComics({
        readingList: READING_LIST,
        comics: COMICS
      });
      const outcome = new ReadingListAddComicsFailed();

      actions$ = hot('-a', { a: action });
      readingListService.addComics.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.addComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ReadingListAddComics({
        readingList: READING_LIST,
        comics: COMICS
      });
      const outcome = new ReadingListAddComicsFailed();

      actions$ = hot('-a', { a: action });
      readingListService.addComics.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.addComics$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
