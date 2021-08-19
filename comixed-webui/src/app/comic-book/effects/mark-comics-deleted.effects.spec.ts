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
import { ComicService } from '@app/comic-book/services/comic.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { COMIC_1, COMIC_3, COMIC_5 } from '@app/comic-book/comic-book.fixtures';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  comicsMarkedDeleted,
  markComicsDeleted,
  markComicsDeletedFailed
} from '@app/comic-book/actions/mark-comics-deleted.actions';
import { hot } from 'jasmine-marbles';
import { MarkComicsDeletedEffects } from '@app/comic-book/effects/mark-comics-deleted.effects';

describe('MarkComicsDeletedEffects', () => {
  const COMICS = [COMIC_1, COMIC_3, COMIC_5];
  const DELETED = Math.random() > 0.5;

  let actions$: Observable<any>;
  let effects: MarkComicsDeletedEffects;
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
        MarkComicsDeletedEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicService,
          useValue: {
            markComicsDeleted: jasmine.createSpy(
              'ComicService.markComicsDeleted()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(MarkComicsDeletedEffects);
    comicService = TestBed.inject(ComicService) as jasmine.SpyObj<ComicService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('updating the deleted state for a comic', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = markComicsDeleted({ comics: COMICS, deleted: DELETED });
      const outcome = comicsMarkedDeleted();

      actions$ = hot('-a', { a: action });
      comicService.markComicsDeleted.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.markComicsDeleted$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = markComicsDeleted({ comics: COMICS, deleted: DELETED });
      const outcome = markComicsDeletedFailed();

      actions$ = hot('-a', { a: action });
      comicService.markComicsDeleted.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.markComicsDeleted$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = markComicsDeleted({ comics: COMICS, deleted: DELETED });
      const outcome = markComicsDeletedFailed();

      actions$ = hot('-a', { a: action });
      comicService.markComicsDeleted.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.markComicsDeleted$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
