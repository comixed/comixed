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

import { initialState, PluginState, reducer } from './plugin.reducer';
import {
  AllPluginsReceived,
  GetAllPlugins,
  GetAllPluginsFailed,
  PluginsReloaded,
  ReloadPlugins,
  ReloadPluginsFailed
} from 'app/library/actions/plugin.actions';
import { PLUGIN_DESCRIPTOR_1 } from 'app/library/models/plugin-descriptor.fixtures';

describe('Plugin Reducer', () => {
  const PLUGINS = [PLUGIN_DESCRIPTOR_1];

  let state: PluginState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer(state, {} as any);
    });

    it('clears the loading all flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('has an empty set of plugins', () => {
      expect(state.plugins).toEqual([]);
    });
  });

  describe('getting the list of plugins', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, new GetAllPlugins());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });
  });

  describe('receiving the list of plugins', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, plugins: [] },
        new AllPluginsReceived({ pluginDescriptors: PLUGINS })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('sets the list of plugins', () => {
      expect(state.plugins).toEqual(PLUGINS);
    });
  });

  describe('failing the load the list of plugins', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, new GetAllPluginsFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });
  });

  describe('reloading plugins', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, new ReloadPlugins());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTruthy();
    });
  });

  describe('plugins reloaded', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, plugins: [] },
        new PluginsReloaded({ pluginDescriptors: PLUGINS })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });

    it('sets the list of plugins', () => {
      expect(state.plugins).toEqual(PLUGINS);
    });
  });

  describe('failure to reload plugins', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, new ReloadPluginsFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalsy();
    });
  });
});
