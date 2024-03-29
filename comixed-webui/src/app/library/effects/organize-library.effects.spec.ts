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
import { OrganizeLibraryEffects } from './organize-library.effects';
import { LibraryService } from '@app/library/services/library.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoggerModule } from '@angular-ru/cdk/logger';
import {
  COMIC_BOOK_1,
  COMIC_BOOK_3,
  COMIC_BOOK_5
} from '@app/comic-books/comic-books.fixtures';
import {
  startLibraryOrganizationSuccess,
  startLibraryOrganization,
  startLibraryOrganizationFailure
} from '@app/library/actions/organize-library.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { LIBRARY_ORGANIZATION_CONFIG_URL } from '@app/library/library.constants';

describe('OrganizeLibraryEffects', () => {
  const COMIC_BOOKS = [COMIC_BOOK_1, COMIC_BOOK_3, COMIC_BOOK_5];

  let actions$: Observable<any>;
  let effects: OrganizeLibraryEffects;
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
        OrganizeLibraryEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            startLibraryOrganization: jasmine.createSpy(
              'LibraryService.startLibraryOrganization()'
            )
          }
        }
      ]
    });

    effects = TestBed.inject(OrganizeLibraryEffects);
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

  describe('starting library organization', () => {
    it('fires an action on success', () => {
      const serviceResponse = COMIC_BOOKS;
      const action = startLibraryOrganization();
      const outcome = startLibraryOrganizationSuccess();

      actions$ = hot('-a', { a: action });
      libraryService.startLibraryOrganization.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.organizeLibrary$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = startLibraryOrganization();
      const outcome = startLibraryOrganizationFailure();

      actions$ = hot('-a', { a: action });
      libraryService.startLibraryOrganization.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.organizeLibrary$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(
        jasmine.any(String),
        LIBRARY_ORGANIZATION_CONFIG_URL
      );
    });

    it('fires an action on general failure', () => {
      const action = startLibraryOrganization();
      const outcome = startLibraryOrganizationFailure();

      actions$ = hot('-a', { a: action });
      libraryService.startLibraryOrganization.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.organizeLibrary$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
