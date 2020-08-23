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

import { MoveComicsEffects } from './move-comics.effects';
import { LibraryService } from 'app/library/services/library.service';
import { AlertService, ApiResponse } from 'app/core';
import { CoreModule } from 'app/core/core.module';
import { TranslateModule } from '@ngx-translate/core';
import { LoggerModule } from '@angular-ru/logger';
import {
  comicsMoving,
  moveComics,
  moveComicsFailed
} from 'app/library/actions/move-comics.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';

describe('MoveComicsEffects', () => {
  const DIRECTORY = '/Users/comixedreader/Documents/comics';
  const RENAMING_RULE =
    '$PUBLISHER/$SERIES/$VOLUME/$SERIES v$VOLUME #$ISSUE [$COVERDATE]';
  const DELETE_PHYSICAL_FILES = Math.random() * 100 > 50;

  let actions$: Observable<any>;
  let effects: MoveComicsEffects;
  let libraryService: jasmine.SpyObj<LibraryService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        MoveComicsEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryService,
          useValue: {
            moveComics: jasmine.createSpy('LibraryService.moveComics()')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<MoveComicsEffects>(MoveComicsEffects);
    libraryService = TestBed.get(LibraryService) as jasmine.SpyObj<
      LibraryService
    >;
    alertService = TestBed.get(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('moving comics', () => {
    it('fires an action on success', () => {
      const serviceResponse = { success: true } as ApiResponse<void>;
      const action = moveComics({
        directory: DIRECTORY,
        renamingRule: RENAMING_RULE,
        deletePhysicalFiles: DELETE_PHYSICAL_FILES
      });
      const outcome = comicsMoving();

      actions$ = hot('-a', { a: action });
      libraryService.moveComics.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.moveComics$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on failure', () => {
      const serviceResponse = { success: false } as ApiResponse<void>;
      const action = moveComics({
        directory: DIRECTORY,
        renamingRule: RENAMING_RULE,
        deletePhysicalFiles: DELETE_PHYSICAL_FILES
      });
      const outcome = moveComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.moveComics.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.moveComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = moveComics({
        directory: DIRECTORY,
        renamingRule: RENAMING_RULE,
        deletePhysicalFiles: DELETE_PHYSICAL_FILES
      });
      const outcome = moveComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.moveComics.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.moveComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = moveComics({
        directory: DIRECTORY,
        renamingRule: RENAMING_RULE,
        deletePhysicalFiles: DELETE_PHYSICAL_FILES
      });
      const outcome = moveComicsFailed();

      actions$ = hot('-a', { a: action });
      libraryService.moveComics.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.moveComics$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
