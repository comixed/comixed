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

import { initialState, reducer, StoryListState } from './story-list.reducer';
import { STORY_1, STORY_2, STORY_3 } from '@app/lists/lists.fixtures';
import {
  loadStoriesForName,
  loadStoriesForNameFailed,
  loadStoryNames,
  loadStoryNamesFailed,
  storiesForNameLoaded,
  storyNamesLoaded
} from '@app/lists/actions/story-list.actions';

describe('StoryList Reducer', () => {
  const ENTRIES = [STORY_1, STORY_2, STORY_3];
  const NAMES = ENTRIES.map(story => story.name);

  let state: StoryListState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('the initial state', () => {
    beforeEach(() => {
      state = reducer({ ...state }, {} as any);
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('has no names', () => {
      expect(state.names).toEqual([]);
    });

    it('has no stories', () => {
      expect(state.entries).toEqual([]);
    });
  });

  describe('loading all story names', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: false }, loadStoryNames());
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('all story names loaded', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, names: [] },
        storyNamesLoaded({ names: NAMES })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the names', () => {
      expect(state.names).toEqual(NAMES);
    });
  });

  describe('failure loading all story names', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadStoryNamesFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });

  describe('loading all story names', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: false },
        loadStoriesForName({ name: NAMES[0] })
      );
    });

    it('sets the loading flag', () => {
      expect(state.loading).toBeTrue();
    });
  });

  describe('all stories for a name loaded', () => {
    beforeEach(() => {
      state = reducer(
        { ...state, loading: true, names: [] },
        storiesForNameLoaded({ stories: ENTRIES })
      );
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });

    it('sets the entries', () => {
      expect(state.entries).toEqual(ENTRIES);
    });
  });

  describe('failure loading all stories for a name', () => {
    beforeEach(() => {
      state = reducer({ ...state, loading: true }, loadStoriesForNameFailed());
    });

    it('clears the loading flag', () => {
      expect(state.loading).toBeFalse();
    });
  });
});
