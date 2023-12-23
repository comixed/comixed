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

import { createFeature, createReducer, on } from '@ngrx/store';
import {
  loadPluginLanguages,
  loadPluginLanguagesFailure,
  loadPluginLanguagesSuccess
} from '@app/library-plugins/actions/plugin-language.actions';
import { PluginLanguage } from '@app/library-plugins/models/plugin-language';

export const PLUGIN_LANGUAGE_FEATURE_KEY = 'plugin_language_state';

export interface PluginLanguageState {
  busy: boolean;
  languages: PluginLanguage[];
}

export const initialState: PluginLanguageState = {
  busy: false,
  languages: []
};

export const reducer = createReducer(
  initialState,
  on(loadPluginLanguages, state => ({ ...state, busy: true })),
  on(loadPluginLanguagesSuccess, (state, action) => ({
    ...state,
    busy: false,
    languages: action.languages
  })),
  on(loadPluginLanguagesFailure, state => ({ ...state, busy: false }))
);

export const pluginLanguageFeature = createFeature({
  name: PLUGIN_LANGUAGE_FEATURE_KEY,
  reducer
});
