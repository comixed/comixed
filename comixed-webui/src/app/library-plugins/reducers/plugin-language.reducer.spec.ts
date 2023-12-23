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
  PluginLanguageState,
  reducer
} from './plugin-language.reducer';
import {
  loadPluginLanguages,
  loadPluginLanguagesFailure,
  loadPluginLanguagesSuccess
} from '@app/library-plugins/actions/plugin-language.actions';
import { PLUGIN_LANGUAGE_LIST } from '@app/library-plugins/library-plugins.fixtures';

describe('PluginLanguage Reducer', () => {
  let state: PluginLanguageState;

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

    it('has no languages', () => {
      expect(state.languages).toEqual([]);
    });
  });

  describe('loading the plugin language list', () => {
    beforeEach(() => {
      state = reducer({ ...state, busy: false }, loadPluginLanguages());
    });

    it('sets the busy flag', () => {
      expect(state.busy).toBeTrue();
    });

    describe('success', () => {
      beforeEach(() => {
        state = reducer(
          {
            ...state,
            busy: true,
            languages: []
          },
          loadPluginLanguagesSuccess({ languages: PLUGIN_LANGUAGE_LIST })
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('sets the language list', () => {
        expect(state.languages).toEqual(PLUGIN_LANGUAGE_LIST);
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        state = reducer(
          { ...state, busy: true, languages: PLUGIN_LANGUAGE_LIST },
          loadPluginLanguagesFailure()
        );
      });

      it('clears the busy flag', () => {
        expect(state.busy).toBeFalse();
      });

      it('leaves the language list intact', () => {
        expect(state.languages).toEqual(PLUGIN_LANGUAGE_LIST);
      });
    });
  });
});
