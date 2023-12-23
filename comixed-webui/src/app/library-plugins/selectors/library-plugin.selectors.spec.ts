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

import {
  LIBRARY_PLUGIN_FEATURE_KEY,
  LibraryPluginState
} from '../reducers/library-plugin.reducer';
import {
  selectLibraryPluginCurrent,
  selectLibraryPluginList,
  selectLibraryPluginState
} from './library-plugin.selectors';
import { PLUGIN_LIST } from '@app/library-plugins/library-plugins.fixtures';

describe('LibraryPlugin Selectors', () => {
  let state: LibraryPluginState;

  beforeEach(() => {
    state = {
      busy: Math.random() > 0.5,
      list: PLUGIN_LIST,
      current: PLUGIN_LIST[1]
    };
  });

  it('should select the feature state', () => {
    expect(
      selectLibraryPluginState({
        [LIBRARY_PLUGIN_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the list of plugins', () => {
    expect(
      selectLibraryPluginList({
        [LIBRARY_PLUGIN_FEATURE_KEY]: state
      })
    ).toEqual(state.list);
  });

  it('should select the current plugin', () => {
    expect(
      selectLibraryPluginCurrent({
        [LIBRARY_PLUGIN_FEATURE_KEY]: state
      })
    ).toEqual(state.current);
  });
});
