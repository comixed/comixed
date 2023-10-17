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

import { UpdateMetadataEffects } from './update-metadata.effects';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  metadataUpdating,
  updateMetadata,
  updateMetadataFailed
} from '@app/library/actions/update-metadata.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { LibraryService } from '@app/library/services/library.service';
import { clearComicBookSelectionState } from '@app/comic-books/actions/comic-book-selection.actions';

describe('UpdateMetadataEffects', () => {
  const IDS = [4, 17, 6];

  let actions$: Observable<any>;
  let effects: UpdateMetadataEffects;
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
        UpdateMetadataEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            updateMetadata: jasmine.createSpy('LibraryService.updateMetadata()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(UpdateMetadataEffects);
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

  describe('updating the comic info for a single book', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = updateMetadata({ ids: IDS });
      const outcome1 = metadataUpdating();
      const outcome2 = clearComicBookSelectionState();

      actions$ = hot('-a', { a: action });
      libraryService.updateMetadata
        .withArgs({ ids: IDS })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.updateMetadata$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = updateMetadata({ ids: IDS });
      const outcome = updateMetadataFailed();

      actions$ = hot('-a', { a: action });
      libraryService.updateMetadata
        .withArgs({ ids: IDS })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.updateMetadata$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = updateMetadata({ ids: IDS });
      const outcome = updateMetadataFailed();

      actions$ = hot('-a', { a: action });
      libraryService.updateMetadata
        .withArgs({ ids: IDS })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.updateMetadata$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
