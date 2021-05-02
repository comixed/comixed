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
import { ComicFormatEffects } from './comic-format.effects';
import { ComicFormatService } from '@app/comic/services/comic-format.service';
import { LoggerModule } from '@angular-ru/logger';
import { AlertService } from '@app/core';
import { TranslateModule } from '@ngx-translate/core';
import { FORMAT_1, FORMAT_3, FORMAT_5 } from '@app/comic/comic.fixtures';
import {
  comicFormatsLoaded,
  loadComicFormats,
  loadComicFormatsFailed
} from '@app/comic/actions/comic-format.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ComicFormatEffects', () => {
  const FORMATS = [FORMAT_1, FORMAT_3, FORMAT_5];

  let actions$: Observable<any> = null;
  let effects: ComicFormatEffects;
  let comicFormatService: jasmine.SpyObj<ComicFormatService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ComicFormatEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicFormatService,
          useValue: {
            loadFormats: jasmine.createSpy('ComicFormatService.loadFormats()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ComicFormatEffects);
    comicFormatService = TestBed.inject(
      ComicFormatService
    ) as jasmine.SpyObj<ComicFormatService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the list of formats', () => {
    it('fires an action on success', () => {
      const serviceResponse = FORMATS;
      const action = loadComicFormats();
      const outcome = comicFormatsLoaded({ formats: FORMATS });

      actions$ = hot('-a', { a: action });
      comicFormatService.loadFormats.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadFormats$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadComicFormats();
      const outcome = loadComicFormatsFailed();

      actions$ = hot('-a', { a: action });
      comicFormatService.loadFormats.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadFormats$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadComicFormats();
      const outcome = loadComicFormatsFailed();

      actions$ = hot('-a', { a: action });
      comicFormatService.loadFormats.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadFormats$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
