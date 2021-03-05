/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { LibraryEffects } from './library.effects';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4
} from '@app/library/library.fixtures';
import { LibraryService } from '@app/library/services/library.service';
import { AlertService } from '@app/core';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import {
  comicLoaded,
  loadComic,
  loadComicFailed,
  readStateSet,
  setReadState,
  setReadStateFailed
} from '@app/library/actions/library.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('LibraryEffects', () => {
  const COMIC = COMIC_1;
  const COMICS = [COMIC_1, COMIC_2, COMIC_3, COMIC_4];
  const READ = Math.random() > 0.5;

  let actions$: Observable<any>;
  let effects: LibraryEffects;
  let comicService: jasmine.SpyObj<LibraryService>;
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
            loadComic: jasmine.createSpy('LibraryService.loadComic()'),
            setRead: jasmine.createSpy('LibraryService.setRead()')
          }
        }
      ]
    });

    effects = TestBed.inject(LibraryEffects);
    comicService = TestBed.inject(
      LibraryService
    ) as jasmine.SpyObj<LibraryService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading a comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = loadComic({ id: COMIC.id });
      const outcome = comicLoaded({ comic: COMIC });

      actions$ = hot('-a', { a: action });
      comicService.loadComic.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComic$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComic({ id: COMIC.id });
      const outcome = loadComicFailed();

      actions$ = hot('-a', { a: action });
      comicService.loadComic.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComic({ id: COMIC.id });
      const outcome = loadComicFailed();

      actions$ = hot('-a', { a: action });
      comicService.loadComic.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('setting the read state for comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = setReadState({ comics: COMICS, read: READ });
      const outcome = readStateSet();

      actions$ = hot('-a', { a: action });
      comicService.setRead.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setRead$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = setReadState({ comics: COMICS, read: READ });
      const outcome = setReadStateFailed();

      actions$ = hot('-a', { a: action });
      comicService.setRead.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.setRead$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = setReadState({ comics: COMICS, read: READ });
      const outcome = setReadStateFailed();

      actions$ = hot('-a', { a: action });
      comicService.setRead.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.setRead$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
