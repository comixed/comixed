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
  initialState,
  LibraryPluginState,
  reducer
} from './library-plugin.reducer';
import {
  clearCurrentLibraryPlugin,
  createLibraryPlugin,
  createLibraryPluginFailure,
  createLibraryPluginSuccess,
  deleteLibraryPlugin,
  deleteLibraryPluginFailure,
  deleteLibraryPluginSuccess,
  loadLibraryPlugins,
  loadLibraryPluginsFailure,
  loadLibraryPluginsSuccess,
  setCurrentLibraryPlugin,
  updateLibraryPlugin,
  updateLibraryPluginFailure,
  updateLibraryPluginSuccess
} from '@app/library-plugins/actions/library-plugin.actions';
import {
  LIBRARY_PLUGIN_4,
  PLUGIN_LIST
} from '@app/library-plugins/library-plugins.fixtures';

describe('LibraryPlugin Reducer', () => {
  const PLUGIN = LIBRARY_PLUGIN_4;

  let state: LibraryPluginState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the busy flag', () => {
      expect(state.busy).toBeFalse();
    });

    it('has an empty list of plugins', () => {
      expect(state.list).toEqual([]);
    });

    it('has no current plugin', () => {
      expect(state.current).toBeNull();
    });
  });

  describe('loading the plugin list', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadLibraryPlugins());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, list: [] },
          loadLibraryPluginsSuccess({ plugins: PLUGIN_LIST })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the list of plugins', () => {
        expect(state.list).toEqual(PLUGIN_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, list: PLUGIN_LIST },
          loadLibraryPluginsFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('has an empty list of plugins', () => {
        expect(state.list).toEqual([]);
      });
    });
  });

  describe('setting the current plugin', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, current: null },
        setCurrentLibraryPlugin({ plugin: PLUGIN })
      );
    });

    it('sets the current plugin', () => {
      expect(state.current).toBe(PLUGIN);
    });
  });

  describe('clearing the current plugin', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, current: PLUGIN },
        clearCurrentLibraryPlugin()
      );
    });

    it('clears the current plugin', () => {
      expect(state.current).toBeNull();
    });
  });

  describe('creating a new plugin', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        createLibraryPlugin({
          language: PLUGIN.language,
          filename: PLUGIN.filename
        })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, current: null },
          createLibraryPluginSuccess({ plugin: PLUGIN })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the current plugin', () => {
        expect(state.current).toBe(PLUGIN);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, current: null },
          createLibraryPluginFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('leaves the current plugin null', () => {
        expect(state.current).toBeNull();
      });
    });
  });

  describe('updating a plugin', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        updateLibraryPlugin({ plugin: PLUGIN })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      const UPDATED_PLUGIN = { ...PLUGIN, adminOnly: !PLUGIN.adminOnly };

      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, current: PLUGIN },
          updateLibraryPluginSuccess({ plugin: UPDATED_PLUGIN })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the current plugin', () => {
        expect(state.current).toBe(UPDATED_PLUGIN);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, current: PLUGIN },
          updateLibraryPluginFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('leaves the current plugin alone', () => {
        expect(state.current).toBe(PLUGIN);
      });
    });
  });

  describe('deleting a plugin', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, busy: false },
        deleteLibraryPlugin({ plugin: PLUGIN })
      );
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, current: null },
          deleteLibraryPluginSuccess()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('clears the current plugin', () => {
        expect(state.current).toBeNull();
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, current: PLUGIN },
          deleteLibraryPluginFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('leaves the current plugin alone', () => {
        expect(state.current).toBe(PLUGIN);
      });
    });
  });
});
