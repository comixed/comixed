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

import { LIBRARY_FEATURE_KEY, LibraryState } from '../reducers/library.reducer';
import {
  selectAllComics,
  selectCharacters,
  selectLibraryBusy,
  selectLibraryState,
  selectLocations,
  selectPublishers,
  selectSelectedComics,
  selectSeries,
  selectStories,
  selectTeams
} from './library.selectors';
import {
  COMIC_1,
  COMIC_2,
  COMIC_3
} from '@app/comic-books/comic-book.fixtures';

describe('Library Selectors', () => {
  const COMIC = COMIC_1;
  const COMICS = [
    COMIC_1,
    { ...COMIC_2, publisher: '' },
    { ...COMIC_3, series: '' }
  ];
  const SELECTED_COMICS = [COMIC_1, COMIC_2, COMIC_3];
  const PUBLISHERS = [
    COMIC_1.publisher,
    'library.label.no-publisher',
    COMIC_3.publisher
  ];
  const SERIES = [COMIC_1.series, COMIC_2.series, 'library.label.no-series'];
  const CHARACTERS = [
    'character1',
    'character2',
    'character3',
    'character4',
    'character5'
  ];
  const TEAMS = ['team1', 'team2'];
  const LOCATIONS = ['location1', 'location2'];
  const STORIES = ['story1', 'story2', 'story3'];

  let state: LibraryState;

  beforeEach(() => {
    state = {
      loading: Math.random() > 0.5,
      comics: COMICS,
      selected: SELECTED_COMICS,
      saving: Math.random() > 0.5
    };
  });

  it('selects the feature state', () => {
    expect(
      selectLibraryState({
        [LIBRARY_FEATURE_KEY]: state
      })
    ).toEqual(state);
  });

  it('selects the selected comics', () => {
    expect(selectSelectedComics({ [LIBRARY_FEATURE_KEY]: state })).toEqual(
      SELECTED_COMICS
    );
  });

  it('selects the busy state', () => {
    expect(
      selectLibraryBusy({
        [LIBRARY_FEATURE_KEY]: state
      })
    ).toEqual(state.loading);
  });

  it('selects all comics', () => {
    expect(selectAllComics({ [LIBRARY_FEATURE_KEY]: state })).toEqual(
      state.comics
    );
  });

  it('selects the publishers', () => {
    expect(selectPublishers({ [LIBRARY_FEATURE_KEY]: state })).toEqual(
      PUBLISHERS
    );
  });

  it('selects the series', () => {
    expect(selectSeries({ [LIBRARY_FEATURE_KEY]: state })).toEqual(SERIES);
  });

  it('selects the characters', () => {
    expect(selectCharacters({ [LIBRARY_FEATURE_KEY]: state })).toEqual(
      CHARACTERS
    );
  });

  it('selects the teams', () => {
    expect(selectTeams({ [LIBRARY_FEATURE_KEY]: state })).toEqual(TEAMS);
  });

  it('selects the locations', () => {
    expect(selectLocations({ [LIBRARY_FEATURE_KEY]: state })).toEqual(
      LOCATIONS
    );
  });

  it('selects the stories', () => {
    expect(selectStories({ [LIBRARY_FEATURE_KEY]: state })).toEqual(STORIES);
  });
});
