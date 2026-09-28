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
import { PurgeLibraryEffects } from './purge-library.effects';
import { LibraryService } from '@app/library/services/library.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  libraryPurging,
  purgeLibrary,
  purgeLibraryFailed
} from '@app/library/actions/purge-library.actions';
import { hot } from 'jasmine-marbles';

describe('PurgeLibraryEffects', () => {
  let actions$: Observable<any>;
  let effects: PurgeLibraryEffects;
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
        PurgeLibraryEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            purgeLibrary: jasmine.createSpy('LibraryService.purgeLibrary()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(PurgeLibraryEffects);
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

  describe('starting the library purge', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = purgeLibrary();
      const outcome = libraryPurging();

      actions$ = hot('-a', { a: action });
      libraryService.purgeLibrary.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.purgeLibrary$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = purgeLibrary();
      const outcome = purgeLibraryFailed();

      actions$ = hot('-a', { a: action });
      libraryService.purgeLibrary.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.purgeLibrary$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = purgeLibrary();
      const outcome = purgeLibraryFailed();

      actions$ = hot('-a', { a: action });
      libraryService.purgeLibrary.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.purgeLibrary$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
