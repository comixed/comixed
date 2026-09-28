/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
  loadStoryCandidates,
  loadStoryCandidatesFailure,
  loadStoryCandidatesSuccess,
  resetStoryCandidates,
  scrapeStoryMetadata,
  scrapeStoryMetadataFailure,
  scrapeStoryMetadataSuccess
} from '@app/comic-metadata/actions/scrape-story.actions';
import { StoryMetadata } from '@app/collections/models/story-metadata';

export const SCRAPE_STORY_FEATURE_KEY = 'scrape_story_state';

export interface ScrapeStoryState {
  busy: boolean;
  candidates: StoryMetadata[];
}

export const initialState: ScrapeStoryState = {
  busy: false,
  candidates: []
};

export const reducer = createReducer(
  initialState,
  on(resetStoryCandidates, state => ({ ...state, candidates: [] })),
  on(loadStoryCandidates, state => ({ ...state, busy: true })),
  on(loadStoryCandidatesSuccess, (state, action) => ({
    ...state,
    busy: false,
    candidates: action.candidates
  })),
  on(loadStoryCandidatesFailure, state => ({
    ...state,
    busy: false,
    candidates: []
  })),
  on(scrapeStoryMetadata, state => ({ ...state, busy: true })),
  on(scrapeStoryMetadataSuccess, state => ({ ...state, busy: false })),
  on(scrapeStoryMetadataFailure, state => ({ ...state, busy: false }))
);

export const scrapeStoryFeature = createFeature({
  name: SCRAPE_STORY_FEATURE_KEY,
  reducer
});
