/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ScrapingVolume } from '@app/metadata/models/scraping-volume';
import { SingleComicScrapingActions } from '@app/metadata/actions/single-comic-scraping.actions';
import { ScrapingIssue } from '@app/metadata/models/scraping-issue';

export const SINGLE_COMIC_SCRAPING_FEATURE_KEY = 'single_comic_scraping_state';

export interface SingleComicScrapingState extends EntityState<ScrapingVolume> {
  busy: boolean;
  issue: ScrapingIssue | null;
}

export const singleComicScrapingAdapter: EntityAdapter<ScrapingVolume> =
  createEntityAdapter<ScrapingVolume>({
    sortComparer: (left, right) => left.id.localeCompare(right.id)
  });

export const initialSingleComicScrapingState: SingleComicScrapingState =
  singleComicScrapingAdapter.getInitialState({
    busy: false,
    issue: null
  });

export const singleComicScrapingReducer = createReducer(
  initialSingleComicScrapingState,
  on(SingleComicScrapingActions.resetVolumes, state => {
    return singleComicScrapingAdapter.setAll([], { ...state, issue: null });
  }),
  on(SingleComicScrapingActions.loadVolumes, state => ({
    ...state,
    busy: true
  })),
  on(SingleComicScrapingActions.loadVolumesSuccess, (state, actions) => {
    return singleComicScrapingAdapter.setAll(actions.volumes, {
      ...state,
      busy: false
    });
  }),
  on(SingleComicScrapingActions.loadVolumesFailure, state => ({
    ...state,
    busy: false
  })),
  on(SingleComicScrapingActions.loadIssue, state => ({ ...state, busy: true })),
  on(SingleComicScrapingActions.loadIssueSuccess, (state, action) => ({
    ...state,
    busy: false,
    issue: action.issue
  })),
  on(SingleComicScrapingActions.loadIssueFailure, state => ({
    ...state,
    busy: false
  })),
  on(SingleComicScrapingActions.scrapeComic, state => ({
    ...state,
    busy: true
  })),
  on(SingleComicScrapingActions.scrapeComicSuccess, state => {
    return singleComicScrapingAdapter.removeAll({
      ...state,
      busy: false,
      issue: null
    });
  }),
  on(SingleComicScrapingActions.scrapeComicFailure, state => ({
    ...state,
    busy: false
  }))
);

export const singleComicScrapingsFeature = createFeature({
  name: SINGLE_COMIC_SCRAPING_FEATURE_KEY,
  reducer: singleComicScrapingReducer
});
