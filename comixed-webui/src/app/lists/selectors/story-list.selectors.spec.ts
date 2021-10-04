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

import {
  STORY_LIST_FEATURE_KEY,
  StoryListState
} from '../reducers/story-list.reducer';
import {
  selectStories,
  selectStoryListState,
  selectStoryNames
} from './story-list.selectors';
import { STORY_1, STORY_2, STORY_3 } from '@app/lists/lists.fixtures';

describe('StoryList Selectors', () => {
  const ENTRIES = [STORY_1, STORY_2, STORY_3];
  const NAMES = ENTRIES.map(story => story.name);

  let state: StoryListState;

  beforeEach(() => {
    state = { loading: Math.random() > 0.5, names: NAMES, entries: ENTRIES };
  });

  it('should select the feature state', () => {
    expect(
      selectStoryListState({
        [STORY_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('should select the list of story names', () => {
    expect(
      selectStoryNames({
        [STORY_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.names);
  });

  it('should select the list of stories', () => {
    expect(
      selectStories({
        [STORY_LIST_FEATURE_KEY]: state
      })
    ).toEqual(state.entries);
  });
});
