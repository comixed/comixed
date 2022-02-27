/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
  reducer as scrapingReducer,
  METADATA_FEATURE_KEY,
  MetadataState
} from '@app/comic-metadata/reducers/metadata.reducer';
import {
  METADATA_SOURCE_LIST_FEATURE_KEY,
  MetadataSourceListState,
  reducer as metadataSourceListReducer
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface ComicMetadataModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [METADATA_FEATURE_KEY]: MetadataState;
  [METADATA_SOURCE_LIST_FEATURE_KEY]: MetadataSourceListState;
}

export type ModuleState = ComicMetadataModuleState;

export const reducers: ActionReducerMap<ComicMetadataModuleState> = {
  router: routerReducer,
  [METADATA_FEATURE_KEY]: scrapingReducer,
  [METADATA_SOURCE_LIST_FEATURE_KEY]: metadataSourceListReducer
};
