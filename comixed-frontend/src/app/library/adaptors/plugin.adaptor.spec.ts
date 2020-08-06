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

import { PluginAdaptor } from './plugin.adaptor';
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import {
  PLUGIN_FEATURE_KEY,
  reducer
} from 'app/library/reducers/plugin.reducer';
import { EffectsModule } from '@ngrx/effects';
import { PluginEffects } from 'app/library/effects/plugin.effects';
import { AppState } from 'app/library';
import { PLUGIN_DESCRIPTOR_1 } from 'app/library/models/plugin-descriptor.fixtures';
import {
  AllPluginsReceived,
  GetAllPlugins,
  GetAllPluginsFailed,
  PluginsReloaded,
  ReloadPlugins,
  ReloadPluginsFailed
} from 'app/library/actions/plugin.actions';
import { LoggerModule } from '@angular-ru/logger';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';

describe('PluginAdaptor', () => {
  const PLUGINS = [PLUGIN_DESCRIPTOR_1];

  let pluginAdaptor: PluginAdaptor;
  let store: Store<AppState>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LoggerModule.forRoot(),
        TranslateModule.forRoot(),
        StoreModule.forRoot({}),
        StoreModule.forFeature(PLUGIN_FEATURE_KEY, reducer),
        EffectsModule.forRoot([]),
        EffectsModule.forFeature([PluginEffects])
      ],
      providers: [PluginAdaptor, MessageService]
    });

    pluginAdaptor = TestBed.get(PluginAdaptor);
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should create an instance', () => {
    expect(pluginAdaptor).toBeTruthy();
  });

  describe('getting the list of plugins', () => {
    beforeEach(() => {
      pluginAdaptor.getAllPlugins();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new GetAllPlugins());
    });

    it('provides updates', () => {
      pluginAdaptor.loading$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new AllPluginsReceived({ pluginDescriptors: PLUGINS }));
      });

      it('updates the plugin list', () => {
        pluginAdaptor.plugins$.subscribe(response =>
          expect(response).toEqual(PLUGINS)
        );
      });

      it('provides updates', () => {
        pluginAdaptor.loading$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new GetAllPluginsFailed());
      });

      it('provides updates', () => {
        pluginAdaptor.loading$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });

  describe('reloading plugins', () => {
    beforeEach(() => {
      pluginAdaptor.reloadPlugins();
    });

    it('fires an action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(new ReloadPlugins());
    });

    it('provides updates on reloading', () => {
      pluginAdaptor.loading$.subscribe(response =>
        expect(response).toBeTruthy()
      );
    });

    describe('success', () => {
      beforeEach(() => {
        store.dispatch(new PluginsReloaded({ pluginDescriptors: PLUGINS }));
      });

      it('updates the plugin list', () => {
        pluginAdaptor.plugins$.subscribe(response =>
          expect(response).toEqual(PLUGINS)
        );
      });

      it('provides updates', () => {
        pluginAdaptor.loading$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        store.dispatch(new ReloadPluginsFailed());
      });

      it('provides updates', () => {
        pluginAdaptor.loading$.subscribe(response =>
          expect(response).toBeFalsy()
        );
      });
    });
  });
});
