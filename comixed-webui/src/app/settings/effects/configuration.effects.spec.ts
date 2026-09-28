/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { firstValueFrom, Observable, of, throwError } from 'rxjs';
import { ConfigurationEffects } from './configuration.effects';
import { expect, vi } from 'vitest';
import {
  TEST_CONFIGURATION_OPTIONS_1,
  TEST_CONFIGURATION_OPTIONS_2
} from '@app/settings/settings-fixtures';
import { ConfigurationActions } from '@app/settings/actions/configuration.actions';
import { ConfigurationService } from '@app/settings/services/configuration-service';
import { AlertService } from '@app/services/alert-service';
import { LoggerLevel, provideLogger } from '@angular-ru/cdk/logger';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from '@openng/optimus-ui/api';
import { HttpErrorResponse } from '@angular/common/http';
import { SaveConfigurationResponse } from '@app/settings/models/net/save-configuration-response';

describe('ConfigurationEffects', () => {
  const TEST_CONFIGURATION_OPTION_LIST = [
    TEST_CONFIGURATION_OPTIONS_1,
    TEST_CONFIGURATION_OPTIONS_2
  ];

  let actions$: Observable<unknown>;
  let effects: ConfigurationEffects;
  let configurationService: ConfigurationService;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConfigurationEffects,
        provideLogger({ minLevel: LoggerLevel.OFF }),
        provideTranslateService(),
        provideMockActions(() => actions$),
        ConfigurationService,
        AlertService,
        MessageService
      ]
    });

    effects = TestBed.inject(ConfigurationEffects);
    configurationService = TestBed.inject(ConfigurationService);
    alertService = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = TEST_CONFIGURATION_OPTION_LIST;
      const action = ConfigurationActions.load();
      const outcome = ConfigurationActions.loadSuccess({
        entries: TEST_CONFIGURATION_OPTION_LIST
      });

      const loadSpy = vi
        .spyOn(configurationService, 'load')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = ConfigurationActions.load();
      const outcome = ConfigurationActions.loadFailure();

      const loadSpy = vi
        .spyOn(configurationService, 'load')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ConfigurationActions.load();
      const outcome = ConfigurationActions.loadFailure();

      const loadSpy = vi
        .spyOn(configurationService, 'load')
        .mockThrow(new Error('General error'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.load$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('saving', () => {
    it('should dispatch an action on success', async () => {
      const serviceResponse = {
        options: TEST_CONFIGURATION_OPTION_LIST
      } as SaveConfigurationResponse;
      const action = ConfigurationActions.save({
        entries: [TEST_CONFIGURATION_OPTIONS_1]
      });
      const outcome = ConfigurationActions.saveSuccess({
        entries: TEST_CONFIGURATION_OPTION_LIST
      });

      const loadSpy = vi
        .spyOn(configurationService, 'save')
        .mockReturnValue(of(serviceResponse));

      actions$ = of(action);
      await expect(firstValueFrom(effects.save$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on service failure', async () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = ConfigurationActions.save({
        entries: [TEST_CONFIGURATION_OPTIONS_1]
      });
      const outcome = ConfigurationActions.saveFailure();

      const loadSpy = vi
        .spyOn(configurationService, 'save')
        .mockReturnValue(throwError(() => serviceResponse));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.save$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should dispatch an action on general failure', async () => {
      const action = ConfigurationActions.save({
        entries: [TEST_CONFIGURATION_OPTIONS_1]
      });
      const outcome = ConfigurationActions.saveFailure();

      const loadSpy = vi
        .spyOn(configurationService, 'save')
        .mockThrow(new Error('General error'));
      const errorSpy = vi.spyOn(alertService, 'error');

      actions$ = of(action);
      await expect(firstValueFrom(effects.save$)).resolves.toEqual(outcome);
      expect(loadSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
