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
import { ImprintListEffects } from './imprint-list.effects';
import { ImprintService } from '@app/comic-books/services/imprint.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  IMPRINT_1,
  IMPRINT_2,
  IMPRINT_3
} from '@app/comic-books/comic-book.fixtures';
import {
  imprintsLoaded,
  loadImprints,
  loadImprintsFailed
} from '@app/comic-books/actions/imprint-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('ImprintListEffects', () => {
  const ENTRIES = [IMPRINT_1, IMPRINT_2, IMPRINT_3];

  let actions$: Observable<any>;
  let effects: ImprintListEffects;
  let imprintService: jasmine.SpyObj<ImprintService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ImprintListEffects,
        provideMockActions(() => actions$),
        {
          provide: ImprintService,
          useValue: {
            loadAll: jasmine.createSpy('ImprintService.getAll()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ImprintListEffects);
    imprintService = TestBed.inject(
      ImprintService
    ) as jasmine.SpyObj<ImprintService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading all imprints', () => {
    it('fires an action on success', () => {
      const serviceResponse = ENTRIES;
      const action = loadImprints();
      const outcome = imprintsLoaded({ entries: ENTRIES });

      actions$ = hot('-a', { a: action });
      imprintService.loadAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadImprints();
      const outcome = loadImprintsFailed();

      actions$ = hot('-a', { a: action });
      imprintService.loadAll.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadImprints();
      const outcome = loadImprintsFailed();

      actions$ = hot('-a', { a: action });
      imprintService.loadAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
