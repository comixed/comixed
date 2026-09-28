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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRemoteLibrary from '../reducers/remote-library.reducer';

const selectRemoteLibraryState =
  createFeatureSelector<fromRemoteLibrary.RemoteLibraryState>(
    fromRemoteLibrary.REMOTE_LIBRARY_FEATURE_KEY
  );

export const selectRemoteLibraryTotalComics = createSelector(
  selectRemoteLibraryState,
  state => state.totalComics
);

export const selectRemoteLibraryUnscrapedComics = createSelector(
  selectRemoteLibraryState,
  state => state.unscrapedComics
);

export const selectRemoteLibraryDeletedComics = createSelector(
  selectRemoteLibraryState,
  state => state.deletedComics
);

export const selectRemoteLibraryDuplicateComics = createSelector(
  selectRemoteLibraryState,
  state => state.duplicateComics
);

export const selectRemoteLibraryPublishers = createSelector(
  selectRemoteLibraryState,
  state => state.publishers
);

export const selectRemoteLibrarySeries = createSelector(
  selectRemoteLibraryState,
  state => state.series
);

export const selectRemoteLibraryCharacters = createSelector(
  selectRemoteLibraryState,
  state => state.characters
);

export const selectRemoteLibraryTeams = createSelector(
  selectRemoteLibraryState,
  state => state.teams
);

export const selectRemoteLibraryLocations = createSelector(
  selectRemoteLibraryState,
  state => state.locations
);

export const selectRemoteLibraryStories = createSelector(
  selectRemoteLibraryState,
  state => state.stories
);

export const selectRemoteLibraryStates = createSelector(
  selectRemoteLibraryState,
  state => state.states
);

export const selectRemoteLibraryArchiveTypes = createSelector(
  selectRemoteLibraryState,
  state => state.archiveTypes
);

export const selectRemoteLibraryByPublisherAndYear = createSelector(
  selectRemoteLibraryState,
  state => state.byPublisherAndYear
);
