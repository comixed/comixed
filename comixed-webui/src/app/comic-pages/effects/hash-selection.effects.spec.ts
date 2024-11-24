/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2024, The ComiXed Project
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
import { HashSelectionEffects } from './hash-selection.effects';
import { PAGE_1, PAGE_2, PAGE_3 } from '@app/comic-pages/comic-pages.fixtures';
import { HashSelectionService } from '@app/comic-pages/services/hash-selection.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import {
  addAllHashesToSelection,
  addHashSelection,
  clearHashSelections,
  loadHashSelections,
  loadHashSelectionsFailure,
  loadHashSelectionsSuccess,
  removeHashSelection
} from '@app/comic-pages/actions/hash-selection.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

describe('HashSelectionEffects', () => {
  const HASHES = [PAGE_1.hash, PAGE_2.hash, PAGE_3.hash];
  const HASH = HASHES[0];

  let actions$: Observable<any>;
  let effects: HashSelectionEffects;
  let hashSelectionService: jasmine.SpyObj<HashSelectionService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        HashSelectionEffects,
        provideMockActions(() => actions$),
        {
          provide: HashSelectionService,
          useValue: {
            loadSelections: jasmine.createSpy(
              'HashSelectionService.loadSelections()'
            ),
            selectAll: jasmine.createSpy('HashSelectionService.selectAll()'),
            addSelection: jasmine.createSpy(
              'HashSelectionService.addSelection()'
            ),
            removeSelection: jasmine.createSpy(
              'HashSelectionService.removeSelection()'
            ),
            clearSelections: jasmine.createSpy(
              'HashSelectionService.clearSelections()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(HashSelectionEffects);
    hashSelectionService = TestBed.inject(
      HashSelectionService
    ) as jasmine.SpyObj<HashSelectionService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading current selections', () => {
    it('fires an action on success', () => {
      const serviceResponse = HASHES;
      const action = loadHashSelections();
      const outcome = loadHashSelectionsSuccess({ entries: HASHES });

      actions$ = hot('-a', { a: action });
      hashSelectionService.loadSelections.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadHashSelections$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadHashSelections();
      const outcome = loadHashSelectionsFailure();

      actions$ = hot('-a', { a: action });
      hashSelectionService.loadSelections.and.returnValue(
        throwError(() => serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadHashSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadHashSelections();
      const outcome = loadHashSelectionsFailure();

      actions$ = hot('-a', { a: action });
      hashSelectionService.loadSelections.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadHashSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting all hashes', () => {
    it('fires an action on success', () => {
      const serviceResponse = HASHES;
      const action = addAllHashesToSelection();
      const outcome = loadHashSelectionsSuccess({ entries: HASHES });

      actions$ = hot('-a', { a: action });
      hashSelectionService.selectAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.addAllHashes$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = addAllHashesToSelection();
      const outcome = loadHashSelectionsFailure();

      actions$ = hot('-a', { a: action });
      hashSelectionService.selectAll.and.returnValue(
        throwError(() => serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.addAllHashes$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = addAllHashesToSelection();
      const outcome = loadHashSelectionsFailure();

      actions$ = hot('-a', { a: action });
      hashSelectionService.selectAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.addAllHashes$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('selecting one hash', () => {
    it('fires an action on success', () => {
      const serviceResponse = HASHES;
      const action = addHashSelection({ hash: HASH });
      const outcome = loadHashSelectionsSuccess({ entries: HASHES });

      actions$ = hot('-a', { a: action });
      hashSelectionService.addSelection
        .withArgs({ hash: HASH })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.addSelection$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = addHashSelection({ hash: HASH });
      const outcome = loadHashSelectionsFailure();

      actions$ = hot('-a', { a: action });
      hashSelectionService.addSelection
        .withArgs({ hash: HASH })
        .and.returnValue(throwError(() => serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.addSelection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = addHashSelection({ hash: HASH });
      const outcome = loadHashSelectionsFailure();

      actions$ = hot('-a', { a: action });
      hashSelectionService.addSelection
        .withArgs({ hash: HASH })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.addSelection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('removing one hash', () => {
    it('fires an action on success', () => {
      const serviceResponse = HASHES;
      const action = removeHashSelection({ hash: HASH });
      const outcome = loadHashSelectionsSuccess({ entries: HASHES });

      actions$ = hot('-a', { a: action });
      hashSelectionService.removeSelection
        .withArgs({ hash: HASH })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.removeSelection$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = removeHashSelection({ hash: HASH });
      const outcome = loadHashSelectionsFailure();

      actions$ = hot('-a', { a: action });
      hashSelectionService.removeSelection
        .withArgs({ hash: HASH })
        .and.returnValue(throwError(() => serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.removeSelection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = removeHashSelection({ hash: HASH });
      const outcome = loadHashSelectionsFailure();

      actions$ = hot('-a', { a: action });
      hashSelectionService.removeSelection
        .withArgs({ hash: HASH })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.removeSelection$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('clearing selections', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = clearHashSelections();
      const outcome = loadHashSelectionsSuccess({ entries: [] });

      actions$ = hot('-a', { a: action });
      hashSelectionService.clearSelections.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.clearSelections$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = clearHashSelections();
      const outcome = loadHashSelectionsFailure();

      actions$ = hot('-a', { a: action });
      hashSelectionService.clearSelections.and.returnValue(
        throwError(() => {
          serviceResponse;
        })
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.clearSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = clearHashSelections();
      const outcome = loadHashSelectionsFailure();

      actions$ = hot('-a', { a: action });
      hashSelectionService.clearSelections.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.clearSelections$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
