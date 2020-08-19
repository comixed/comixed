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

import { Action, createReducer, on } from '@ngrx/store';
import {
  getScrapingVolumes,
  getScrapingVolumesFailed,
  scrapingVolumesReceived
} from '../actions/scraping-volumes.actions';
import { ScrapingVolume } from 'app/comics/models/scraping-volume';

export const SCRAPING_VOLUMES_FEATURE_KEY = 'scraping_volumes_state';

export interface ScrapingVolumesState {
  fetching: boolean;
  volumes: ScrapingVolume[];
}

export const initialState: ScrapingVolumesState = {
  fetching: false,
  volumes: []
};

const scrapingVolumesReducer = createReducer(
  initialState,

  on(getScrapingVolumes, state => ({ ...state, fetching: true })),
  on(scrapingVolumesReceived, (state, action) => ({
    ...state,
    fetching: false,
    volumes: action.volumes
  })),
  on(getScrapingVolumesFailed, state => ({ ...state, fetching: false }))
);

export function reducer(
  state: ScrapingVolumesState | undefined,
  action: Action
) {
  return scrapingVolumesReducer(state, action);
}
