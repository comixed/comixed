/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
import { PluginLanguageEffects } from './plugin-language.effects';
import { PluginLanguageService } from '@app/library-plugins/services/plugin-language.service';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PLUGIN_LANGUAGE_LIST } from '@app/library-plugins/library-plugins.fixtures';
import {
  loadPluginLanguages,
  loadPluginLanguagesFailure,
  loadPluginLanguagesSuccess
} from '@app/library-plugins/actions/plugin-language.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse } from '@angular/common/http';

describe('PluginLanguageEffects', () => {
  let actions$: Observable<any>;
  let effects: PluginLanguageEffects;
  let pluginLanguageService: jasmine.SpyObj<PluginLanguageService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        PluginLanguageEffects,
        provideMockActions(() => actions$),
        {
          provide: PluginLanguageService,
          useValue: {
            loadLanguageRuntimes: jasmine.createSpy(
              'PluginLanguageService.loadLanguageRuntimes()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(PluginLanguageEffects);
    pluginLanguageService = TestBed.inject(
      PluginLanguageService
    ) as jasmine.SpyObj<PluginLanguageService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the plugin language list', () => {
    it('fires an action on success', () => {
      const serviceResponse = PLUGIN_LANGUAGE_LIST;
      const action = loadPluginLanguages();
      const outcome = loadPluginLanguagesSuccess({
        languages: PLUGIN_LANGUAGE_LIST
      });

      actions$ = hot('-a', { a: action });
      pluginLanguageService.loadLanguageRuntimes.and.returnValue(
        of(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadPluginLanguages$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadPluginLanguages();
      const outcome = loadPluginLanguagesFailure();

      actions$ = hot('-a', { a: action });
      pluginLanguageService.loadLanguageRuntimes.and.returnValue(
        throwError(serviceResponse)
      );

      const expected = hot('-b', { b: outcome });
      expect(effects.loadPluginLanguages$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadPluginLanguages();
      const outcome = loadPluginLanguagesFailure();

      actions$ = hot('-a', { a: action });
      pluginLanguageService.loadLanguageRuntimes.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadPluginLanguages$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
