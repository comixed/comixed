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

import { createFeature, createReducer, on } from '@ngrx/store';
import {
  loadStoriesForName,
  loadStoriesForNameFailed,
  loadStoryNames,
  loadStoryNamesFailed,
  storiesForNameLoaded,
  storyNamesLoaded
} from '../actions/story-list.actions';
import { Story } from '../models/story';

export const STORY_LIST_FEATURE_KEY = 'story_list_state';

export interface StoryListState {
  loading: boolean;
  names: string[];
  entries: Story[];
}

export const initialState: StoryListState = {
  loading: false,
  names: [],
  entries: []
};

export const reducer = createReducer(
  initialState,

  on(loadStoryNames, state => ({ ...state, loading: true })),
  on(storyNamesLoaded, (state, action) => ({
    ...state,
    loading: false,
    names: action.names
  })),
  on(loadStoryNamesFailed, state => ({ ...state, loading: false })),
  on(loadStoriesForName, state => ({ ...state, loading: true })),
  on(storiesForNameLoaded, (state, action) => ({
    ...state,
    loading: false,
    entries: action.stories
  })),
  on(loadStoriesForNameFailed, state => ({ ...state, loading: false }))
);

export const storyListFeature = createFeature({
  name: STORY_LIST_FEATURE_KEY,
  reducer
});
