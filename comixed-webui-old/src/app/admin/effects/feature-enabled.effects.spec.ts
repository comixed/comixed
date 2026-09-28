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
import { FeatureEnabledEffects } from './feature-enabled.effects';
import { ConfigurationService } from '@app/admin/services/configuration.service';
import { FeatureEnabledResponse } from '@app/admin/models/net/feature-enabled-response';
import {
  getFeatureEnabled,
  getFeatureEnabledFailure,
  getFeatureEnabledSuccess
} from '@app/admin/actions/feature-enabled.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('FeatureEnabledEffects', () => {
  const FEATURE_NAME = 'feature.name';
  const FEATURE_ENABLED = Math.random() > 0.5;

  let actions$: Observable<any>;
  let effects: FeatureEnabledEffects;
  let configurationService: jasmine.SpyObj<ConfigurationService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        FeatureEnabledEffects,
        provideMockActions(() => actions$),
        {
          provide: ConfigurationService,
          useValue: {
            getFeatureEnabled: jasmine.createSpy(
              'ConfigurationService.getFeatureEnabled()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(FeatureEnabledEffects);
    configurationService = TestBed.inject(
      ConfigurationService
    ) as jasmine.SpyObj<ConfigurationService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the enabled state of a feature', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        enabled: FEATURE_ENABLED
      } as FeatureEnabledResponse;
      const action = getFeatureEnabled({ name: FEATURE_NAME });
      const outcome = getFeatureEnabledSuccess({
        name: FEATURE_NAME,
        enabled: FEATURE_ENABLED
      });

      actions$ = hot('-a', { a: action });
      configurationService.getFeatureEnabled
        .withArgs({ name: FEATURE_NAME })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getFeatureEnabled$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = getFeatureEnabled({ name: FEATURE_NAME });
      const outcome = getFeatureEnabledFailure();

      actions$ = hot('-a', { a: action });
      configurationService.getFeatureEnabled
        .withArgs({ name: FEATURE_NAME })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getFeatureEnabled$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = getFeatureEnabled({ name: FEATURE_NAME });
      const outcome = getFeatureEnabledFailure();

      actions$ = hot('-a', { a: action });
      configurationService.getFeatureEnabled
        .withArgs({ name: FEATURE_NAME })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getFeatureEnabled$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
