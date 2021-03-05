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
import { BuildDetailsEffects } from './build-details.effects';
import { BuildDetailsService } from '@app/services/build-details.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core';
import { BUILD_DETAILS } from '@app/app.fixtures';
import {
  buildDetailsLoaded,
  loadBuildDetails,
  loadBuildDetailsFailed
} from '@app/actions/build-details.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('BuildStatusEffects', () => {
  let actions$: Observable<any>;
  let effects: BuildDetailsEffects;
  let buildService: jasmine.SpyObj<BuildDetailsService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        BuildDetailsEffects,
        provideMockActions(() => actions$),
        {
          provide: BuildDetailsService,
          useValue: {
            loadDetails: jasmine.createSpy('BuildDetailsService.loadStatus()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(BuildDetailsEffects);
    buildService = TestBed.inject(
      BuildDetailsService
    ) as jasmine.SpyObj<BuildDetailsService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the build details', () => {
    it('fires an action on success', () => {
      const serviceResponse = BUILD_DETAILS;
      const action = loadBuildDetails();
      const outcome = buildDetailsLoaded({ details: BUILD_DETAILS });

      actions$ = hot('-a', { a: action });
      buildService.loadDetails.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDetails$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadBuildDetails();
      const outcome = loadBuildDetailsFailed();

      actions$ = hot('-a', { a: action });
      buildService.loadDetails.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadDetails$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadBuildDetails();
      const outcome = loadBuildDetailsFailed();

      actions$ = hot('-a', { a: action });
      buildService.loadDetails.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadDetails$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
