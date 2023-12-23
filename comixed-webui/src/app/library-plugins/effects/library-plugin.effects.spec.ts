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
import { LibraryPluginEffects } from './library-plugin.effects';
import { LibraryPluginService } from '@app/library-plugins/services/library-plugin.service';
import { LoggerModule } from '@angular-ru/cdk/logger';
import { TranslateModule } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  LIBRARY_PLUGIN_4,
  PLUGIN_LIST
} from '@app/library-plugins/library-plugins.fixtures';
import {
  createLibraryPlugin,
  createLibraryPluginFailure,
  createLibraryPluginSuccess,
  deleteLibraryPlugin,
  deleteLibraryPluginFailure,
  deleteLibraryPluginSuccess,
  loadLibraryPlugins,
  loadLibraryPluginsFailure,
  loadLibraryPluginsSuccess,
  updateLibraryPlugin,
  updateLibraryPluginFailure,
  updateLibraryPluginSuccess
} from '@app/library-plugins/actions/library-plugin.actions';
import { hot } from 'jasmine-marbles';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

describe('LibraryPluginEffects', () => {
  const PLUGIN = LIBRARY_PLUGIN_4;

  let actions$: Observable<any>;
  let effects: LibraryPluginEffects;
  let pluginService: jasmine.SpyObj<LibraryPluginService>;
  let alertService: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        LibraryPluginEffects,
        provideMockActions(() => actions$),
        {
          provide: LibraryPluginService,
          useValue: {
            loadAll: jasmine.createSpy('LibraryPluginService.loadAll()'),
            createPlugin: jasmine.createSpy(
              'LibraryPluginService.createPlugin()'
            ),
            updatePlugin: jasmine.createSpy(
              'LibraryPluginService.updatePlugin()'
            ),
            deletePlugin: jasmine.createSpy(
              'LibraryPluginService.deletePlugin()'
            )
          }
        },
        AlertService
      ]
    });

    effects = TestBed.inject(LibraryPluginEffects);
    pluginService = TestBed.inject(
      LibraryPluginService
    ) as jasmine.SpyObj<LibraryPluginService>;
    alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'info');
    spyOn(alertService, 'error');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('loading the list of plugins', () => {
    it('fires an action on success', () => {
      const serviceResponse = PLUGIN_LIST;
      const action = loadLibraryPlugins();
      const outcome = loadLibraryPluginsSuccess({ plugins: PLUGIN_LIST });

      actions$ = hot('-a', { a: action });
      pluginService.loadAll.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadLibraryPluginList$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = loadLibraryPlugins();
      const outcome = loadLibraryPluginsFailure();

      actions$ = hot('-a', { a: action });
      pluginService.loadAll.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.loadLibraryPluginList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = loadLibraryPlugins();
      const outcome = loadLibraryPluginsFailure();

      actions$ = hot('-a', { a: action });
      pluginService.loadAll.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.loadLibraryPluginList$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('creating a new plugin', () => {
    it('fires an action on success', () => {
      const serviceResponse = PLUGIN;
      const action = createLibraryPlugin({
        language: PLUGIN.language,
        filename: PLUGIN.filename
      });
      const outcome = createLibraryPluginSuccess({ plugin: PLUGIN });

      actions$ = hot('-a', { a: action });
      pluginService.createPlugin
        .withArgs({
          language: PLUGIN.language,
          filename: PLUGIN.filename
        })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.createLibraryPlugin$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = createLibraryPlugin({
        language: PLUGIN.language,
        filename: PLUGIN.filename
      });
      const outcome = createLibraryPluginFailure();

      actions$ = hot('-a', { a: action });
      pluginService.createPlugin
        .withArgs({
          language: PLUGIN.language,
          filename: PLUGIN.filename
        })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.createLibraryPlugin$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = createLibraryPlugin({
        language: PLUGIN.language,
        filename: PLUGIN.filename
      });
      const outcome = createLibraryPluginFailure();

      actions$ = hot('-a', { a: action });
      pluginService.createPlugin
        .withArgs({
          language: PLUGIN.language,
          filename: PLUGIN.filename
        })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.createLibraryPlugin$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('updating a plugin', () => {
    it('fires an action on success', () => {
      const serviceResponse = PLUGIN;
      const action = updateLibraryPlugin({ plugin: PLUGIN });
      const outcome = updateLibraryPluginSuccess({ plugin: PLUGIN });

      actions$ = hot('-a', { a: action });
      pluginService.updatePlugin
        .withArgs({ plugin: PLUGIN })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.updateLibraryPlugin$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = updateLibraryPlugin({ plugin: PLUGIN });
      const outcome = updateLibraryPluginFailure();

      actions$ = hot('-a', { a: action });
      pluginService.updatePlugin
        .withArgs({ plugin: PLUGIN })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.updateLibraryPlugin$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = updateLibraryPlugin({ plugin: PLUGIN });
      const outcome = updateLibraryPluginFailure();

      actions$ = hot('-a', { a: action });
      pluginService.updatePlugin
        .withArgs({ plugin: PLUGIN })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.updateLibraryPlugin$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('deleting a plugin', () => {
    it('fires an action on success', () => {
      const serviceResponse = new HttpResponse({ status: 200 });
      const action = deleteLibraryPlugin({
        plugin: PLUGIN
      });
      const outcome = deleteLibraryPluginSuccess();

      actions$ = hot('-a', { a: action });
      pluginService.deletePlugin
        .withArgs({ plugin: PLUGIN })
        .and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteLibraryPlugin$).toBeObservable(expected);
      expect(alertService.info).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = deleteLibraryPlugin({
        plugin: PLUGIN
      });
      const outcome = deleteLibraryPluginFailure();

      actions$ = hot('-a', { a: action });
      pluginService.deletePlugin
        .withArgs({ plugin: PLUGIN })
        .and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.deleteLibraryPlugin$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('fires an action on general failure', () => {
      const action = deleteLibraryPlugin({
        plugin: PLUGIN
      });
      const outcome = deleteLibraryPluginFailure();

      actions$ = hot('-a', { a: action });
      pluginService.deletePlugin
        .withArgs({ plugin: PLUGIN })
        .and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.deleteLibraryPlugin$).toBeObservable(expected);
      expect(alertService.error).toHaveBeenCalledWith(jasmine.any(String));
    });
  });
});
