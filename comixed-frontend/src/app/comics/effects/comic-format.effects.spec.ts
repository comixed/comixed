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

import { ComicFormatEffects } from './comic-format.effects';
import { ComicFormatService } from 'app/comics/services/comic-format.service';
import {
  FORMAT_1,
  FORMAT_2,
  FORMAT_3,
  FORMAT_4,
  FORMAT_5
} from 'app/comics/comics.fixtures';
import {
  comicFormatsLoaded,
  loadComicFormats,
  loadComicFormatsFailed
} from 'app/comics/actions/comic-format.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { ApiResponse } from 'app/core';
import { ComicFormat } from 'app/comics';
import { HttpErrorResponse } from '@angular/common/http';

describe('ComicFormatEffects', () => {
  const FORMATS = [FORMAT_1, FORMAT_2, FORMAT_3, FORMAT_4, FORMAT_5];

  let actions$: Observable<any>;
  let effects: ComicFormatEffects;
  let comicFormatService: jasmine.SpyObj<ComicFormatService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [
        ComicFormatEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicFormatService,
          useValue: {
            loadFormats: jasmine.createSpy('ComicFormatService.loadFormats()')
          }
        }
      ]
    });

    effects = TestBed.get<ComicFormatEffects>(ComicFormatEffects);
    comicFormatService = TestBed.get(ComicFormatService) as jasmine.SpyObj<
      ComicFormatService
    >;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the set of comic formats', () => {
    it('fires an action on success', () => {
      const serviceResponse = { success: true, result: FORMATS } as ApiResponse<
        ComicFormat[]
      >;
      const action = loadComicFormats();
      const outcome = comicFormatsLoaded({ formats: FORMATS });

      actions$ = hot('-a', { a: action });
      comicFormatService.loadFormats.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicFormats$).toBeObservable(expected);
    });

    it('fires an action on failure', () => {
      const serviceResponse = { success: false } as ApiResponse<ComicFormat[]>;
      const action = loadComicFormats();
      const outcome = loadComicFormatsFailed();

      actions$ = hot('-a', { a: action });
      comicFormatService.loadFormats.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadComicFormats$).toBeObservable(expected);
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
      expect(effects.loadComicFormats$).toBeObservable(expected);
    });

    it('fires an action on general failure', () => {
      const action = loadComicFormats();
      const outcome = loadComicFormatsFailed();

      actions$ = hot('-a', { a: action });
      comicFormatService.loadFormats.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadComicFormats$).toBeObservable(expected);
    });
  });
});
