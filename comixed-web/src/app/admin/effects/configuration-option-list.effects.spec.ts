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
import { ConfigurationOptionListEffects } from './configuration-option-list.effects';
import { ConfigurationService } from '@app/admin/services/configuration.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CONFIGURATION_OPTION_1,
  CONFIGURATION_OPTION_2,
  CONFIGURATION_OPTION_3,
  CONFIGURATION_OPTION_4,
  CONFIGURATION_OPTION_5
} from '@app/admin/admin.fixtures';
import {
  configurationOptionsLoaded,
  loadConfigurationOptions,
  loadConfigurationOptionsFailed
} from '@app/admin/actions/configuration-option-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('ConfigurationOptionListEffects', () => {
  const OPTIONS = [
    CONFIGURATION_OPTION_1,
    CONFIGURATION_OPTION_2,
    CONFIGURATION_OPTION_3,
    CONFIGURATION_OPTION_4,
    CONFIGURATION_OPTION_5
  ];

  let actions$: Observable<any>;
  let effects: ConfigurationOptionListEffects;
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
        ConfigurationOptionListEffects,
        provideMockActions(() => actions$),
        {
          provide: ConfigurationService,
          useValue: {
            loadAll: jasmine.createSpy('ConfigurationService.loadAll()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(ConfigurationOptionListEffects);
    configurationService = TestBed.inject(
      ConfigurationService
    ) as jasmine.SpyObj<ConfigurationService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading all configuration options', () => {
    it('fires an action on success', () => {
      const serviceResponse = OPTIONS;
      const action = loadConfigurationOptions();
      const outcome = configurationOptionsLoaded({ options: OPTIONS });

      actions$ = hot('-a', { a: action });
      configurationService.loadAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadConfigurationOptions();
      const outcome = loadConfigurationOptionsFailed();

      actions$ = hot('-a', { a: action });
      configurationService.loadAll.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadConfigurationOptions();
      const outcome = loadConfigurationOptionsFailed();

      actions$ = hot('-a', { a: action });
      configurationService.loadAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadAll$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
