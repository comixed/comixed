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

import { UpdateComicInfoEffects } from './update-comic-info.effects';
import { ComicService } from '@app/comic-book/services/comic.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { COMIC_3 } from '@app/comic-book/comic-book.fixtures';
import {
  comicInfoUpdated,
  updateComicInfo,
  updateComicInfoFailed
} from '@app/comic-book/actions/update-comic-info.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { comicUpdated } from '@app/comic-book/actions/comic.actions';

describe('UpdateComicInfoEffects', () => {
  const COMIC = COMIC_3;

  let actions$: Observable<any>;
  let effects: UpdateComicInfoEffects;
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
        UpdateComicInfoEffects,
        provideMockActions(() => actions$),
        {
          provide: ComicService,
          useValue: {
            updateComicInfo: jasmine.createSpy('ComicService.updateComicInfo()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(UpdateComicInfoEffects);
    comicService = TestBed.inject(ComicService) as jasmine.SpyObj<ComicService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('updating the comic info for a single book', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC;
      const action = updateComicInfo({ comic: COMIC });
      const outcome1 = comicInfoUpdated();
      const outcome2 = comicUpdated({ comic: COMIC });

      actions$ = hot('-a', { a: action });
      comicService.updateComicInfo.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.updateComicInfo$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = updateComicInfo({ comic: COMIC });
      const outcome = updateComicInfoFailed();

      actions$ = hot('-a', { a: action });
      comicService.updateComicInfo.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.updateComicInfo$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = updateComicInfo({ comic: COMIC });
      const outcome = updateComicInfoFailed();

      actions$ = hot('-a', { a: action });
      comicService.updateComicInfo.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.updateComicInfo$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
