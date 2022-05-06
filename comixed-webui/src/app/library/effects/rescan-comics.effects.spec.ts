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
import { RescanComicsEffects } from './rescan-comics.effects';
import { LibraryService } from '@app/library/services/library.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AlertService } from '@app/core/services/alert.service';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_3,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import {
  comicsRescanning,
  rescanComics,
  rescanComicsFailed
} from '@app/library/actions/rescan-comics.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

describe('RescanComicsEffects', () => {
  const COMIC_BOOKS = [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5];

  let actions$: Observable<any>;
  let effects: RescanComicsEffects;
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
        RescanComicsEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            rescanComics: jasmine.createSpy('LibraryService.rescanComics()')
          }
        }
      ]
    });

    effects = TestBed.inject(RescanComicsEffects);
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

  describe('rescanning comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = rescanComics({ comicBooks: COMIC_BOOKS });
      const outcome = comicsRescanning();

      actions$ = hot('-a', { a: action });
      libraryService.rescanComics
        .withArgs({ comicBooks: COMIC_BOOKS })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.rescanComics$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = rescanComics({ comicBooks: COMIC_BOOKS });
      const outcome = rescanComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.rescanComics
        .withArgs({ comicBooks: COMIC_BOOKS })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.rescanComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = rescanComics({ comicBooks: COMIC_BOOKS });
      const outcome = rescanComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.rescanComics
        .withArgs({ comicBooks: COMIC_BOOKS })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.rescanComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
