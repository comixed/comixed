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
  METADATA_FEATURE_KEY,
  MetadataState,
  reducer as scrapingReducer
} from '@app/comic-metadata/reducers/metadata.reducer';
import {
  METADATA_SOURCE_LIST_FEATURE_KEY,
  MetadataSourceListState,
  reducer as metadataSourceListReducer
} from '@app/comic-metadata/reducers/metadata-source-list.reducer';
import {
  METADATA_SOURCE_FEATURE_KEY,
  MetadataSourceState,
  reducer as metadataSourceReducer
} from '@app/comic-metadata/reducers/metadata-source.reducer';
import {
  METADATA_UPDATE_PROCESS_FEATURE_KEY,
  MetadataUpdateProcessState,
  reducer as metadataUpdateProcessReducer
} from '@app/comic-metadata/reducers/metadata-update-process.reducer';
import {
  FETCH_ISSUES_FOR_SERIES_FEATURE_KEY,
  FetchIssuesForSeriesState,
  reducer as fetchIssuesForSeriesReducer
} from '@app/comic-metadata/reducers/fetch-issues-for-series.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface ComicMetadataModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [METADATA_FEATURE_KEY]: MetadataState;
  [METADATA_SOURCE_LIST_FEATURE_KEY]: MetadataSourceListState;
  [METADATA_SOURCE_FEATURE_KEY]: MetadataSourceState;
  [METADATA_UPDATE_PROCESS_FEATURE_KEY]: MetadataUpdateProcessState;
  [FETCH_ISSUES_FOR_SERIES_FEATURE_KEY]: FetchIssuesForSeriesState;
}

export type ModuleState = ComicMetadataModuleState;

export const reducers: ActionReducerMap<ComicMetadataModuleState> = {
  router: routerReducer,
  [METADATA_FEATURE_KEY]: scrapingReducer,
  [METADATA_SOURCE_LIST_FEATURE_KEY]: metadataSourceListReducer,
  [METADATA_SOURCE_FEATURE_KEY]: metadataSourceReducer,
  [METADATA_UPDATE_PROCESS_FEATURE_KEY]: metadataUpdateProcessReducer,
  [FETCH_ISSUES_FOR_SERIES_FEATURE_KEY]: fetchIssuesForSeriesReducer
};
