/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
  ScrapingActions,
  ScrapingActionTypes
} from '../actions/scraping.actions';
import { ScrapingVolume } from 'app/comics/models/scraping-volume';
import { Comic } from 'app/comics';
import { ScrapingIssue } from 'app/comics/models/scraping-issue';

export const SCRAPING_FEATURE_KEY = 'scraping_state';

export interface ScrapingState {
  comics: Comic[];
  comic: Comic;
  fetchingVolumes: boolean;
  volumes: ScrapingVolume[];
  fetchingIssue: boolean;
  issue: ScrapingIssue;
  scraping: boolean;
}

export const initialState: ScrapingState = {
  comics: [],
  comic: null,
  fetchingVolumes: false,
  volumes: [],
  fetchingIssue: false,
  issue: null,
  scraping: false
};

export function reducer(
  state = initialState,
  action: ScrapingActions
): ScrapingState {
  switch (action.type) {
    case ScrapingActionTypes.Start:
      return {
        ...state,
        comics: action.payload.comics,
        comic: action.payload.comics[0],
        volumes: [],
        issue: null
      };

    case ScrapingActionTypes.GetVolumes:
      return { ...state, fetchingVolumes: true };

    case ScrapingActionTypes.VolumesReceived:
      return {
        ...state,
        fetchingVolumes: false,
        volumes: action.payload.volumes
      };

    case ScrapingActionTypes.GetVolumesFailed:
      return { ...state, fetchingVolumes: false };

    case ScrapingActionTypes.GetIssue:
      return { ...state, fetchingIssue: true };

    case ScrapingActionTypes.IssueReceived:
      return { ...state, fetchingIssue: false, issue: action.payload.issue };

    case ScrapingActionTypes.GetIssueFailed:
      return { ...state, fetchingIssue: false };

    case ScrapingActionTypes.LoadMetadata:
      return { ...state, scraping: true };

    case ScrapingActionTypes.MetadataLoaded: {
      const comics = state.comics.filter(
        entry => entry.id !== action.payload.comic.id
      );
      const comic = comics.length > 0 ? comics[0] : null;
      return { ...state, scraping: false, comics: comics, comic: comic };
    }

    case ScrapingActionTypes.LoadMetadataFailed:
      return { ...state, scraping: false };

    default:
      return state;
  }
}
