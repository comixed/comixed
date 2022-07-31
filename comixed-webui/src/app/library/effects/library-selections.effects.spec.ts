/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { LibrarySelectionsEffects } from './library-selections.effects';
import { LibrarySelectionsService } from '@app/library/services/library-selections.service';
import {
  clearSelectedComicBooks,
  comicBookSelectionsUpdated,
  deselectComicBooks,
  selectComicBooks,
  updateComicBookSelectionsFailed
} from '@app/library/actions/library-selections.actions';
import { hot } from 'jasmine-marbles';
import { AlertService } from '@app/core/services/alert.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('LibrarySelectionsEffects', () => {
  const IDS = [7, 17, 65, 1, 29, 71];

  let actions$: Observable<any>;
  let effects: LibrarySelectionsEffects;
  let librarySelectionsService: jasmine.SpyObj<LibrarySelectionsService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        LibrarySelectionsEffects,
        provideMockActions(() => actions$),
        {
          provide: LibrarySelectionsService,
          useValue: {
            updateComicBookSelections: jasmine.createSpy(
              'LibrarySelectionsService.updateComicBookSelections()'
            ),
            clearSelections: jasmine.createSpy(
              'LibrarySelectionsService.clearSelections()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(LibrarySelectionsEffects);
    librarySelectionsService = TestBed.inject(
      LibrarySelectionsService
    ) as jasmine.SpyObj<LibrarySelectionsService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('selecting comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = IDS;
      const action = selectComicBooks({ ids: IDS });
      const outcome = comicBookSelectionsUpdated({ ids: IDS });

      actions$ = hot('-a', { a: action });
      librarySelectionsService.updateComicBookSelections
        .withArgs({
          ids: IDS,
          adding: true
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.selectComicBooks$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = selectComicBooks({ ids: IDS });
      const outcome = updateComicBookSelectionsFailed();

      actions$ = hot('-a', { a: action });
      librarySelectionsService.updateComicBookSelections
        .withArgs({
          ids: IDS,
          adding: true
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.selectComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = selectComicBooks({ ids: IDS });
      const outcome = updateComicBookSelectionsFailed();

      actions$ = hot('-a', { a: action });
      librarySelectionsService.updateComicBookSelections
        .withArgs({
          ids: IDS,
          adding: true
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.selectComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('deselecting comic books', () => {
    it('fires an action on success', () => {
      const serviceResponse = IDS;
      const action = deselectComicBooks({ ids: IDS });
      const outcome = comicBookSelectionsUpdated({ ids: IDS });

      actions$ = hot('-a', { a: action });
      librarySelectionsService.updateComicBookSelections
        .withArgs({
          ids: IDS,
          adding: false
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deselectComicBooks$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = deselectComicBooks({ ids: IDS });
      const outcome = updateComicBookSelectionsFailed();

      actions$ = hot('-a', { a: action });
      librarySelectionsService.updateComicBookSelections
        .withArgs({
          ids: IDS,
          adding: false
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deselectComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = deselectComicBooks({ ids: IDS });
      const outcome = updateComicBookSelectionsFailed();

      actions$ = hot('-a', { a: action });
      librarySelectionsService.updateComicBookSelections
        .withArgs({
          ids: IDS,
          adding: false
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deselectComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('clearing comic book selections', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse();
      const action = clearSelectedComicBooks();
      const outcome = comicBookSelectionsUpdated({ ids: [] });

      actions$ = hot('-a', { a: action });
      librarySelectionsService.clearSelections.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.clearSelectedComicBooks$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = clearSelectedComicBooks();
      const outcome = updateComicBookSelectionsFailed();

      actions$ = hot('-a', { a: action });
      librarySelectionsService.clearSelections.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.clearSelectedComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = clearSelectedComicBooks();
      const outcome = updateComicBookSelectionsFailed();

      actions$ = hot('-a', { a: action });
      librarySelectionsService.clearSelections.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.clearSelectedComicBooks$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
