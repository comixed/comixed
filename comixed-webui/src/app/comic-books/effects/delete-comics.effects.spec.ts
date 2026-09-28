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
import { ComicService } from '@app/comic-books/services/comic.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  deleteComicsFailure,
  deleteComicsSuccess,
  deleteSelectedComics,
  deleteSingleComic,
  undeleteSelectedComics,
  undeleteSingleComic
} from '@app/comic-books/actions/delete-comic-books.actions';
import { hot } from 'jasmine-marbles';
import { DeleteComicsEffects } from '@app/comic-books/effects/delete-comics.effects';

describe('DeleteComicsEffects', () => {
  const COMIC_ID = 960320;

  let actions$: Observable<any>;
  let effects: DeleteComicsEffects;
  let comicService: jasmine.SpyObj<ComicService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        DeleteComicsEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicService,
          useValue: {
            deleteSingleComic: jasmine.createSpy(
              'ComicService.deleteSingleComic()'
            ),
            undeleteSingleComic: jasmine.createSpy(
              'ComicService.undeleteSingleComic()'
            ),
            deleteSelectedComics: jasmine.createSpy(
              'ComicService.deleteSelectedComics()'
            ),
            undeleteSelectedComics: jasmine.createSpy(
              'ComicService.undeleteSelectedComics()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(DeleteComicsEffects);
    comicService = TestBed.inject(ComicService) as jasmine.SpyObj<ComicService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('deleting a single comic book', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = deleteSingleComic({
        comicId: COMIC_ID
      });
      const outcome = deleteComicsSuccess();

      actions$ = hot('-a', { a: action });
      comicService.deleteSingleComic.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteSingleComic$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = deleteSingleComic({
        comicId: COMIC_ID
      });
      const outcome = deleteComicsFailure();

      actions$ = hot('-a', { a: action });
      comicService.deleteSingleComic.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteSingleComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = deleteSingleComic({
        comicId: COMIC_ID
      });
      const outcome = deleteComicsFailure();

      actions$ = hot('-a', { a: action });
      comicService.deleteSingleComic.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deleteSingleComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('undeleting a single comic book', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = undeleteSingleComic({
        comicId: COMIC_ID
      });
      const outcome = deleteComicsSuccess();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSingleComic
        .withArgs({ comicId: COMIC_ID })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.undeleteSingleComic$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = undeleteSingleComic({
        comicId: COMIC_ID
      });
      const outcome = deleteComicsFailure();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSingleComic
        .withArgs({ comicId: COMIC_ID })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.undeleteSingleComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = undeleteSingleComic({
        comicId: COMIC_ID
      });
      const outcome = deleteComicsFailure();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSingleComic
        .withArgs({ comicId: COMIC_ID })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.undeleteSingleComic$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('deleting the selected comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = deleteSelectedComics();
      const outcome = deleteComicsSuccess();

      actions$ = hot('-a', { a: action });
      comicService.deleteSelectedComics
        .withArgs()
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteSelectedComics$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = deleteSelectedComics();
      const outcome = deleteComicsFailure();

      actions$ = hot('-a', { a: action });
      comicService.deleteSelectedComics
        .withArgs()
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteSelectedComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = deleteSelectedComics();
      const outcome = deleteComicsFailure();

      actions$ = hot('-a', { a: action });
      comicService.deleteSelectedComics.withArgs().and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deleteSelectedComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('undeleting the selected comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = undeleteSelectedComics();
      const outcome = deleteComicsSuccess();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSelectedComics
        .withArgs()
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.undeleteSelectedComics$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = undeleteSelectedComics();
      const outcome = deleteComicsFailure();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSelectedComics
        .withArgs()
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.undeleteSelectedComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = undeleteSelectedComics();
      const outcome = deleteComicsFailure();

      actions$ = hot('-a', { a: action });
      comicService.undeleteSelectedComics.withArgs().and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.undeleteSelectedComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
