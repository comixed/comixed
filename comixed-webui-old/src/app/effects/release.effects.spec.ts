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
import { ReleaseEffects } from './release.effects';
import { ReleaseService } from '@app/services/release.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { CURRENT_RELEASE, LATEST_RELEASE } from '@app/app.fixtures';
import {
  currentReleaseDetailsLoaded,
  latestReleaseDetailsLoaded,
  loadCurrentReleaseDetails,
  loadCurrentReleaseDetailsFailed,
  loadLatestReleaseDetails,
  loadLatestReleaseDetailsFailed
} from '@app/actions/release.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ReleaseEffects', () => {
  let actions$: Observable<any>;
  let effects: ReleaseEffects;
  let buildService: jasmine.SpyObj<ReleaseService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        ReleaseEffects,
        provideMockActions(() => actions$),
        {
          provide: ReleaseService,
          useValue: {
            loadCurrentReleaseDetails: jasmine.createSpy(
              'ReleaseService.loadCurrentReleaseDetails()'
            ),
            loadLatestReleaseDetails: jasmine.createSpy(
              'ReleaseService.loadLatestReleaseDetails()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ReleaseEffects);
    buildService = TestBed.inject(
      ReleaseService
    ) as jasmine.SpyObj<ReleaseService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the current build details', () => {
    it('fires an action on success', () => {
      const serviceResponse = CURRENT_RELEASE;
      const action = loadCurrentReleaseDetails();
      const outcome = currentReleaseDetailsLoaded({ details: CURRENT_RELEASE });

      actions$ = hot('-a', { a: action });
      buildService.loadCurrentReleaseDetails.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadCurrentRelease$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadCurrentReleaseDetails();
      const outcome = loadCurrentReleaseDetailsFailed();

      actions$ = hot('-a', { a: action });
      buildService.loadCurrentReleaseDetails.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadCurrentRelease$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadCurrentReleaseDetails();
      const outcome = loadCurrentReleaseDetailsFailed();

      actions$ = hot('-a', { a: action });
      buildService.loadCurrentReleaseDetails.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadCurrentRelease$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('loading the latest build details', () => {
    it('fires an action on success', () => {
      const serviceResponse = LATEST_RELEASE;
      const action = loadLatestReleaseDetails();
      const outcome = latestReleaseDetailsLoaded({ details: LATEST_RELEASE });

      actions$ = hot('-a', { a: action });
      buildService.loadLatestReleaseDetails.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadLatestRelease$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadLatestReleaseDetails();
      const outcome = loadLatestReleaseDetailsFailed();

      actions$ = hot('-a', { a: action });
      buildService.loadLatestReleaseDetails.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadLatestRelease$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadLatestReleaseDetails();
      const outcome = loadLatestReleaseDetailsFailed();

      actions$ = hot('-a', { a: action });
      buildService.loadLatestReleaseDetails.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadLatestRelease$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
