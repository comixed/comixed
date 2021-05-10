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
import { ComicListEffects } from './comic-list.effects';
import { ComicListService } from '@app/library/services/comic-list.service';
import { LoggerModule } from '@angular-ru/logger';
import { COMIC_1, COMIC_3, COMIC_5 } from '@app/comic/comic.fixtures';
import {
  comicsReceived,
  loadComics,
  loadComicsFailed
} from '@app/library/actions/comic-list.actions';
import { hot } from 'jasmine-marbles';
import { ComicService } from '@app/comic/services/comic.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadComicsResponse } from '@app/library/models/net/load-comics-response';
import { LibraryService } from '@app/library/services/library.service';

describe('ComicListEffects', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const LAST_ID = Math.floor(Math.abs(Math.random() * 1000));
  const LAST_PAGE = Math.random() > 0.5;

  let actions$: Observable<any> = null;
  let effects: ComicListEffects;
  let libraryService: jasmine.SpyObj<LibraryService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        ComicListEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            loadBatch: jasmine.createSpy('LibraryService.loadBatch()')
          }
        },
        {
          provide: ComicListService,
          useValue: {}
        }
      ]
    });

    effects = TestBed.inject(ComicListEffects);
    libraryService = TestBed.inject(
      LibraryService
    ) as jasmine.SpyObj<LibraryService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading a batch of comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        comics: COMICS,
        lastId: LAST_ID,
        lastPayload: LAST_PAGE
      } as LoadComicsResponse;
      const action = loadComics({ lastId: LAST_ID });
      const outcome = comicsReceived({
        comics: COMICS,
        lastId: LAST_ID,
        lastPayload: LAST_PAGE
      });

      actions$ = hot('-a', { a: action });
      libraryService.loadBatch.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadBatch$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComics({ lastId: LAST_ID });
      const outcome = loadComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.loadBatch.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadBatch$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const action = loadComics({ lastId: LAST_ID });
      const outcome = loadComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.loadBatch.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadBatch$).toBeObservable(expected);
    });
  });
});
