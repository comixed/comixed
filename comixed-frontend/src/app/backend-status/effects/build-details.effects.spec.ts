/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { BuildDetailsService } from 'app/backend-status/services/build-details.service';
import { AlertService, ApiResponse } from 'app/core';
import { CoreModule } from 'app/core/core.module';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { BuildDetails } from 'app/backend-status/models/build-details';
import { BUILD_DETAILS_1 } from 'app/backend-status/backend-status.fixtures';
import {
  buildDetailsReceived,
  fetchBuildDetails,
  fetchBuildDetailsFailed
} from 'app/backend-status/actions/build-details.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('BuildDetailEffects', () => {
  const BUILD_DETAILS = BUILD_DETAILS_1;
  const ERROR_MESSAGE = 'The error message';

  let actions$: Observable<any>;
  let effects: BuildDetailsEffects;
  let buildDetailService: jasmine.SpyObj<BuildDetailsService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CoreModule, LoggerModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        BuildDetailsEffects,
        provideMockActions(() => actions$),
        {
          provide: BuildDetailsService,
          useValue: {
            getBuildDetails: jasmine.createSpy(
              'BuildDetailsService.getBuildDetails()'
            )
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<BuildDetailsEffects>(BuildDetailsEffects);
    buildDetailService = TestBed.get(BuildDetailsService) as jasmine.SpyObj<
      BuildDetailsService
    >;
    alertService = TestBed.get(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('fetching the build details', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        success: true,
        result: BUILD_DETAILS
      } as ApiResponse<BuildDetails>;
      const action = fetchBuildDetails();
      const outcome = buildDetailsReceived({ buildDetails: BUILD_DETAILS });

      actions$ = hot('-a', { a: action });
      buildDetailService.getBuildDetails.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getBuildDetails$).toBeObservable(expected);
    });

    it('fires an action on failure', () => {
      const serviceResponse = {
        success: false,
        error: ERROR_MESSAGE
      } as ApiResponse<BuildDetails>;
      const action = fetchBuildDetails();
      const outcome = fetchBuildDetailsFailed();

      actions$ = hot('-a', { a: action });
      buildDetailService.getBuildDetails.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getBuildDetails$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = fetchBuildDetails();
      const outcome = fetchBuildDetailsFailed();

      actions$ = hot('-a', { a: action });
      buildDetailService.getBuildDetails.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.getBuildDetails$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = fetchBuildDetails();
      const outcome = fetchBuildDetailsFailed();

      actions$ = hot('-a', { a: action });
      buildDetailService.getBuildDetails.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getBuildDetails$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
