/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { PluginEffects } from './plugin.effects';
import { PluginService } from 'app/library/services/plugin.service';
import { PLUGIN_DESCRIPTOR_1 } from 'app/library/models/plugin-descriptor.fixtures';
import {
  AllPluginsReceived,
  GetAllPlugins,
  GetAllPluginsFailed,
  PluginsReloaded,
  ReloadPlugins,
  ReloadPluginsFailed
} from 'app/library/actions/plugin.actions';
import { hot } from 'jasmine-marbles';
import { LoggerModule } from '@angular-ru/logger';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import objectContaining = jasmine.objectContaining;

describe('PluginEffects', () => {
  const PLUGINS = [PLUGIN_DESCRIPTOR_1];

  let actions$: Observable<any>;
  let effects: PluginEffects;
  let pluginService: jasmine.SpyObj<PluginService>;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), LoggerModule.forRoot()],
      providers: [
        PluginEffects,
        provideMockActions(() => actions$),
        {
          provide: PluginService,
          useValue: {
            getAllPlugins: jasmine.createSpy('PluginService.getAllPlugins()'),
            reloadPlugins: jasmine.createSpy('PluginService.reloadPlugins()')
          }
        },
        MessageService
      ]
    });

    effects = TestBed.get<PluginEffects>(PluginEffects);
    pluginService = TestBed.get(PluginService);
    messageService = TestBed.get(MessageService);
    spyOn(messageService, 'add');
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('getting the list of plugins', () => {
    it('fires an action on success', () => {
      const serviceResponse = PLUGINS;
      const action = new GetAllPlugins();
      const outcome = new AllPluginsReceived({ pluginDescriptors: PLUGINS });

      actions$ = hot('-a', { a: action });
      pluginService.getAllPlugins.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getAllPlugins$).toBeObservable(expected);
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new GetAllPlugins();
      const outcome = new GetAllPluginsFailed();

      actions$ = hot('-a', { a: action });
      pluginService.getAllPlugins.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.getAllPlugins$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new GetAllPlugins();
      const outcome = new GetAllPluginsFailed();

      actions$ = hot('-a', { a: action });
      pluginService.getAllPlugins.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.getAllPlugins$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });

  describe('reloading plugins', () => {
    it('fires an action on success', () => {
      const serviceResponse = PLUGINS;
      const action = new ReloadPlugins();
      const outcome = new PluginsReloaded({ pluginDescriptors: PLUGINS });

      actions$ = hot('-a', { a: action });
      pluginService.reloadPlugins.and.returnValue(of(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.reloadPlugins$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'info' })
      );
    });

    it('fires an action on service failure', () => {
      const serviceResponse = new HttpErrorResponse({});
      const action = new ReloadPlugins();
      const outcome = new ReloadPluginsFailed();

      actions$ = hot('-a', { a: action });
      pluginService.reloadPlugins.and.returnValue(throwError(serviceResponse));

      const expected = hot('-b', { b: outcome });
      expect(effects.reloadPlugins$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });

    it('fires an action on general failure', () => {
      const action = new ReloadPlugins();
      const outcome = new ReloadPluginsFailed();

      actions$ = hot('-a', { a: action });
      pluginService.reloadPlugins.and.throwError('expected');

      const expected = hot('-(b|)', { b: outcome });
      expect(effects.reloadPlugins$).toBeObservable(expected);
      expect(messageService.add).toHaveBeenCalledWith(
        objectContaining({ severity: 'error' })
      );
    });
  });
});
