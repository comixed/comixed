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
import { ConvertComicsEffects } from './convert-comics.effects';
import { LibraryService } from '@app/library/services/library.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  COMIC_1,
  COMIC_3,
  COMIC_5
} from '@app/comic-books/comic-books.fixtures';
import { ArchiveType } from '@app/comic-books/models/archive-type.enum';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  comicsConverting,
  convertComics,
  convertComicsFailed
} from '@app/library/actions/convert-comics.actions';
import { hot } from 'jasmine-marbles';

describe('ConvertComicsEffects', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const ARCHIVE_TYPE = ArchiveType.CBZ;
  const RENAME_PAGES = Math.random() > 0.5;
  const DELETE_PAGES = Math.random() > 0.5;

  let actions$: Observable<any>;
  let effects: ConvertComicsEffects;
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
        ConvertComicsEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            convertComics: jasmine.createSpy('LibraryService.convertComics()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ConvertComicsEffects);
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

  describe('converting comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = convertComics({
        comics: COMICS,
        archiveType: ARCHIVE_TYPE,
        deletePages: DELETE_PAGES,
        renamePages: RENAME_PAGES
      });
      const outcome = comicsConverting();

      actions$ = hot('-a', { a: action });
      libraryService.convertComics
        .withArgs({
          comics: COMICS,
          archiveType: ARCHIVE_TYPE,
          deletePages: DELETE_PAGES,
          renamePages: RENAME_PAGES
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.convertComics$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = convertComics({
        comics: COMICS,
        archiveType: ARCHIVE_TYPE,
        deletePages: DELETE_PAGES,
        renamePages: RENAME_PAGES
      });
      const outcome = convertComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.convertComics
        .withArgs({
          comics: COMICS,
          archiveType: ARCHIVE_TYPE,
          deletePages: DELETE_PAGES,
          renamePages: RENAME_PAGES
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.convertComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = convertComics({
        comics: COMICS,
        archiveType: ARCHIVE_TYPE,
        deletePages: DELETE_PAGES,
        renamePages: RENAME_PAGES
      });
      const outcome = convertComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.convertComics
        .withArgs({
          comics: COMICS,
          archiveType: ARCHIVE_TYPE,
          deletePages: DELETE_PAGES,
          renamePages: RENAME_PAGES
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.convertComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
