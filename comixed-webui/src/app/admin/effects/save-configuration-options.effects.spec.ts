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
import { SaveConfigurationOptionsEffects } from './save-configuration-options.effects';
import { ConfigurationService } from '@app/admin/services/configuration.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CONFIGURATION_OPTION_1,
  CONFIGURATION_OPTION_2,
  CONFIGURATION_OPTION_3,
  CONFIGURATION_OPTION_4,
  CONFIGURATION_OPTION_5
} from '@app/admin/admin.fixtures';
import { SaveConfigurationOptionsResponse } from '@app/admin/models/net/save-configuration-options-response';
import {
  configurationOptionsSaved,
  saveConfigurationOptions,
  saveConfigurationOptionsFailed
} from '@app/admin/actions/save-configuration-options.actions';
import { configurationOptionsLoaded } from '@app/admin/actions/configuration-option-list.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('SaveConfigurationOptionsEffects', () => {
  const OPTIONS = [
    CONFIGURATION_OPTION_1,
    CONFIGURATION_OPTION_2,
    CONFIGURATION_OPTION_3,
    CONFIGURATION_OPTION_4,
    CONFIGURATION_OPTION_5
  ];

  let actions$: Observable<any>;
  let effects: SaveConfigurationOptionsEffects;
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
        SaveConfigurationOptionsEffects,
        provideMockActions(() => actions$),
        {
          provide: ConfigurationService,
          useValue: {
            saveOptions: jasmine.createSpy('ConfigurationService.saveOptions()')
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(SaveConfigurationOptionsEffects);
    configurationService = TestBed.inject(
      ConfigurationService
    ) as jasmine.SpyObj<ConfigurationService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('saving configuration options', () => {
    it('fires an action on success', () => {
      const serviceResponse = {
        options: OPTIONS
      } as SaveConfigurationOptionsResponse;
      const action = saveConfigurationOptions({ options: OPTIONS });
      const outcome1 = configurationOptionsSaved();
      const outcome2 = configurationOptionsLoaded({ options: OPTIONS });

      actions$ = hot('-a', { a: action });
      configurationService.saveOptions.and.returnValue(of(serviceResponse));

      const expected = hot('-(bc)', { b: outcome1, c: outcome2 });
      expect(effects.saveOptions$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = saveConfigurationOptions({ options: OPTIONS });
      const outcome = saveConfigurationOptionsFailed();

      actions$ = hot('-a', { a: action });
      configurationService.saveOptions.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.saveOptions$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = saveConfigurationOptions({ options: OPTIONS });
      const outcome = saveConfigurationOptionsFailed();

      actions$ = hot('-a', { a: action });
      configurationService.saveOptions.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.saveOptions$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
