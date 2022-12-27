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
  reducer as seriesReducer,
  SERIES_FEATURE_KEY,
  SeriesState
} from '@app/collections/reducers/series.reducer';
import {
  PUBLISHER_FEATURE_KEY,
  PublisherState,
  reducer as publisherReducer
} from '@app/collections/reducers/publisher.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface CollectionsModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [PUBLISHER_FEATURE_KEY]: PublisherState;
  [SERIES_FEATURE_KEY]: SeriesState;
}

export type ModuleState = CollectionsModuleState;

export const reducers: ActionReducerMap<CollectionsModuleState> = {
  router: routerReducer,
  [PUBLISHER_FEATURE_KEY]: publisherReducer,
  [SERIES_FEATURE_KEY]: seriesReducer
};
