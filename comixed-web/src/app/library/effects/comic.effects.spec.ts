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

import { Observable, of, throwError } from 'rxjs';
import { ComicEffects } from '@app/library/effects/comic.effects';
import { ComicDetailsService } from '@app/library/services/comic-details.service';
import { AlertService } from '@app/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/logger';
import { provideMockActions } from '@ngrx/effects/testing';
import { COMIC_1 } from '@app/library/library.fixtures';
import {
  comicSaved,
  saveComicDetails,
  saveComicDetailsFailed
} from '@app/library/actions/comic-details.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Comic } from '@app/library';

describe('ComicEffects', () => {
  let actions$: Observable<any>;
  let effects: ComicEffects;
  let comicDetailsService: jasmine.SpyObj<ComicDetailsService>;
  let alertService: AlertService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        LoggerModule.forRoot(),
        HttpClientTestingModule,
        MatSnackBarModule
      ],
      providers: [
        ComicEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicDetailsService,
          useValue: {
            saveComic: jasmine.createSpy('ComicDetailsService.saveComic()')
          }
        },
        AlertService
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
    effects = TestBed.inject(ComicEffects);
    comicDetailsService = TestBed.inject(ComicDetailsService) as jasmine.SpyObj<
      ComicDetailsService
    >;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('when saving comic detail', () => {
    it('fire an action on success', () => {
      const serviceResponse = COMIC_1 as Comic;
      const action = saveComicDetails({ comic: COMIC_1 });
      const outcome = comicSaved({ comic: serviceResponse });

      actions$ = hot('-a', { a: action });
      comicDetailsService.saveComic.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.saveComicDetail$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveComicDetails({ comic: COMIC_1 });
      const outcome = saveComicDetailsFailed;

      actions$ = hot('-a', { a: action });
      comicDetailsService.saveComic.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.saveComicDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fire an action on general failure', () => {
      const action = saveComicDetails({ comic: COMIC_1 });
      const outcome = saveComicDetailsFailed;

      actions$ = hot('-a', { a: action });
      comicDetailsService.saveComic.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.saveComicDetail$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
