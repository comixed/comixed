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
import { ComicEffects } from './comic.effects';
import { ComicService } from '@app/library/services/comic.service';
import { AlertService } from '@app/core';
import { COMIC_2 } from '@app/library/library.fixtures';
import {
  comicLoaded,
  comicUpdated,
  loadComic,
  loadComicFailed,
  updateComic,
  updateComicFailed
} from '@app/library/actions/comic.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ComicEffects', () => {
  const COMIC = COMIC_2;

  let actions$: Observable<any>;
  let effects: ComicEffects;
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
        ComicEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicService,
          useValue: {
            loadOne: jasmine.createSpy('ComicService.loadOne()'),
            updateOne: jasmine.createSpy('ComicService.updateOne()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ComicEffects);
    comicService = TestBed.inject(ComicService) as jasmine.SpyObj<ComicService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
    spyOn(alertService, 'info');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading a single comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = loadComic({ id: COMIC.id });
      const outcome = comicLoaded({ comic: COMIC });

      actions$ = hot('-a', { a: action });
      comicService.loadOne.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadOne$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComic({ id: COMIC.id });
      const outcome = loadComicFailed();

      actions$ = hot('-a', { a: action });
      comicService.loadOne.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadOne$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComic({ id: COMIC.id });
      const outcome = loadComicFailed();

      actions$ = hot('-a', { a: action });
      comicService.loadOne.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadOne$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('saving a single comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = updateComic({ comic: COMIC });
      const outcome = comicUpdated({ comic: COMIC });

      actions$ = hot('-a', { a: action });
      comicService.updateOne.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveOne$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = updateComic({ comic: COMIC });
      const outcome = updateComicFailed();

      actions$ = hot('-a', { a: action });
      comicService.updateOne.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveOne$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = updateComic({ comic: COMIC });
      const outcome = updateComicFailed();

      actions$ = hot('-a', { a: action });
      comicService.updateOne.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.saveOne$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
