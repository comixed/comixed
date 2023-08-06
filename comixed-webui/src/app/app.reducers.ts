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

import { ActionReducerMap } from '@ngrx/store';
import {
  reducer as buildDetailsReducer,
  RELEASE_DETAILS_FEATURE_KEY,
  ReleaseDetailsState
} from '@app/reducers/release.reducer';
import {
  PROCESS_COMICS_FEATURE_KEY,
  ProcessComicsState,
  reducer as importCountReducer
} from '@app/reducers/process-comics.reducer';
import {
  DARK_THEME_FEATURE_KEY,
  DarkThemeState,
  reducer as activeThemeReducer
} from '@app/reducers/dark-theme.reducer';

export interface AppState {
  [RELEASE_DETAILS_FEATURE_KEY]: ReleaseDetailsState;
  [PROCESS_COMICS_FEATURE_KEY]: ProcessComicsState;
  [DARK_THEME_FEATURE_KEY]: DarkThemeState;
}

export type State = AppState;

export const APP_REDUCERS: ActionReducerMap<State> = {
  [RELEASE_DETAILS_FEATURE_KEY]: buildDetailsReducer,
  [PROCESS_COMICS_FEATURE_KEY]: importCountReducer,
  [DARK_THEME_FEATURE_KEY]: activeThemeReducer
};
