/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import { Params } from '@angular/router';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';
import {
  CONFIGURATION_OPTION_LIST_FEATURE_KEY,
  ConfigurationOptionListState,
  reducer as configurationOptionListReducer
} from './reducers/configuration-option-list.reducer';
import {
  reducer as saveConfigurationOptionsReducer,
  SAVE_CONFIGURATION_OPTIONS_FEATURE_KEY,
  SaveConfigurationOptionsState
} from './reducers/save-configuration-options.reducer';
import {
  FILENAME_SCRAPING_RULES_FEATURE_KEY,
  FilenameScrapingRulesState,
  reducer as filenameScrapingRulesReducer
} from './reducers/filename-scraping-rule-list.reducer';
import {
  reducer as serverRuntimeReducer,
  SERVER_RUNTIME_FEATURE_KEY,
  ShutdownState
} from '@app/admin/reducers/server-runtime.reducer';

export * from './admin.functions';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AdminModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [CONFIGURATION_OPTION_LIST_FEATURE_KEY]: ConfigurationOptionListState;
  [SAVE_CONFIGURATION_OPTIONS_FEATURE_KEY]: SaveConfigurationOptionsState;
  [FILENAME_SCRAPING_RULES_FEATURE_KEY]: FilenameScrapingRulesState;
  [SERVER_RUNTIME_FEATURE_KEY]: ShutdownState;
}

export type ModuleState = AdminModuleState;

export const reducers: ActionReducerMap<AdminModuleState> = {
  router: routerReducer,
  [CONFIGURATION_OPTION_LIST_FEATURE_KEY]: configurationOptionListReducer,
  [SAVE_CONFIGURATION_OPTIONS_FEATURE_KEY]: saveConfigurationOptionsReducer,
  [FILENAME_SCRAPING_RULES_FEATURE_KEY]: filenameScrapingRulesReducer,
  [SERVER_RUNTIME_FEATURE_KEY]: serverRuntimeReducer
};
