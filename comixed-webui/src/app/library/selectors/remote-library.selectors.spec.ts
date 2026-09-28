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

import {
  REMOTE_LIBRARY_FEATURE_KEY,
  RemoteLibraryState
} from '../reducers/remote-library.reducer';
import { beforeEach } from 'vitest';
import { initialUserState } from '@app/account/reducers/user.reducer';
import { REMOTE_LIBRARY } from '@app/library/library-fixtures';
import {
  selectRemoteLibraryArchiveTypes,
  selectRemoteLibraryByPublisherAndYear,
  selectRemoteLibraryCharacters,
  selectRemoteLibraryDeletedComics,
  selectRemoteLibraryDuplicateComics,
  selectRemoteLibraryLocations,
  selectRemoteLibraryPublishers,
  selectRemoteLibrarySeries,
  selectRemoteLibraryStates,
  selectRemoteLibraryStories,
  selectRemoteLibraryTeams,
  selectRemoteLibraryTotalComics,
  selectRemoteLibraryUnscrapedComics
} from '@app/library/selectors/remote-library.selectors';

describe('RemoteLibrary Selectors', () => {
  const TEST_REMOTE_LIBRARY = REMOTE_LIBRARY;

  let state: RemoteLibraryState;

  beforeEach(() => {
    state = {
      ...initialUserState,
      totalComics: TEST_REMOTE_LIBRARY.totalComics,
      unscrapedComics: TEST_REMOTE_LIBRARY.unscrapedComics,
      deletedComics: TEST_REMOTE_LIBRARY.deletedComics,
      duplicateComics: TEST_REMOTE_LIBRARY.duplicateComics,
      publishers: TEST_REMOTE_LIBRARY.publishers,
      series: TEST_REMOTE_LIBRARY.series,
      characters: TEST_REMOTE_LIBRARY.characters,
      teams: TEST_REMOTE_LIBRARY.teams,
      locations: TEST_REMOTE_LIBRARY.locations,
      stories: TEST_REMOTE_LIBRARY.stories,
      states: TEST_REMOTE_LIBRARY.states,
      archiveTypes: TEST_REMOTE_LIBRARY.archiveTypes,
      byPublisherAndYear: TEST_REMOTE_LIBRARY.byPublisherAndYear
    };
  });

  it('should select the total comic count', () => {
    expect(
      selectRemoteLibraryTotalComics({
        [REMOTE_LIBRARY_FEATURE_KEY]: state
      })
    ).toBe(TEST_REMOTE_LIBRARY.totalComics);
  });

  it('should select the unscraped comic count', () => {
    expect(
      selectRemoteLibraryUnscrapedComics({
        [REMOTE_LIBRARY_FEATURE_KEY]: state
      })
    ).toBe(TEST_REMOTE_LIBRARY.unscrapedComics);
  });

  it('should select the total comic count', () => {
    expect(
      selectRemoteLibraryDeletedComics({
        [REMOTE_LIBRARY_FEATURE_KEY]: state
      })
    ).toBe(TEST_REMOTE_LIBRARY.deletedComics);
  });

  it('should select the total comic count', () => {
    expect(
      selectRemoteLibraryDuplicateComics({
        [REMOTE_LIBRARY_FEATURE_KEY]: state
      })
    ).toBe(TEST_REMOTE_LIBRARY.duplicateComics);
  });

  it('should select the list of publishers', () => {
    expect(
      selectRemoteLibraryPublishers({ [REMOTE_LIBRARY_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_REMOTE_LIBRARY.publishers);
  });

  it('should select the list of series', () => {
    expect(
      selectRemoteLibrarySeries({ [REMOTE_LIBRARY_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_REMOTE_LIBRARY.series);
  });

  it('should select the list of characters', () => {
    expect(
      selectRemoteLibraryCharacters({ [REMOTE_LIBRARY_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_REMOTE_LIBRARY.characters);
  });

  it('should select the list of teams', () => {
    expect(
      selectRemoteLibraryTeams({ [REMOTE_LIBRARY_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_REMOTE_LIBRARY.teams);
  });

  it('should select the list of locations', () => {
    expect(
      selectRemoteLibraryLocations({ [REMOTE_LIBRARY_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_REMOTE_LIBRARY.locations);
  });

  it('should select the list of stories', () => {
    expect(
      selectRemoteLibraryStories({ [REMOTE_LIBRARY_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_REMOTE_LIBRARY.stories);
  });

  it('should select the list of states', () => {
    expect(
      selectRemoteLibraryStates({ [REMOTE_LIBRARY_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_REMOTE_LIBRARY.states);
  });

  it('should select the list of archive types', () => {
    expect(
      selectRemoteLibraryArchiveTypes({ [REMOTE_LIBRARY_FEATURE_KEY]: state })
    ).toStrictEqual(TEST_REMOTE_LIBRARY.archiveTypes);
  });

  it('should select the counts by publisher and year', () => {
    expect(
      selectRemoteLibraryByPublisherAndYear({
        [REMOTE_LIBRARY_FEATURE_KEY]: state
      })
    ).toStrictEqual(TEST_REMOTE_LIBRARY.byPublisherAndYear);
  });
});
