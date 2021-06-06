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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LIBRARY_FEATURE_KEY, LibraryState } from '../reducers/library.reducer';
import { flattened } from '@app/core';

/** Selects the feature state. */
export const selectLibraryState =
  createFeatureSelector<LibraryState>(LIBRARY_FEATURE_KEY);

/** Selects the selected comics. */
export const selectSelectedComics = createSelector(
  selectLibraryState,
  state => state.selected
);

/** Selects if the feature is current busy. */
export const selectLibraryBusy = createSelector(
  selectLibraryState,
  state => state.loading
);

/** Selects all comics. */
export const selectAllComics = createSelector(
  selectLibraryState,
  state => state.comics
);

/** Selects the publishers without duplicates. */
export const selectPublishers = createSelector(selectAllComics, comics =>
  comics
    .map(comic =>
      !!comic.publisher && comic.publisher.length > 0
        ? comic.publisher
        : 'library.label.no-publisher'
    )
    .filter((publisher, index, self) => self.indexOf(publisher) === index)
);

/** Selects the series without duplicates. */
export const selectSeries = createSelector(selectAllComics, comics =>
  comics
    .map(comic =>
      !!comic.series && comic.series.length > 0
        ? comic.series
        : 'library.label.no-series'
    )
    .filter((series, index, self) => self.indexOf(series) === index)
);

/** Selects the characters without duplicates. */
export const selectCharacters = createSelector(selectAllComics, comics =>
  flattened(comics.map(comic => comic.characters))
);

/** Selects the teams without duplicates. */
export const selectTeams = createSelector(selectAllComics, comics =>
  flattened(comics.map(comic => comic.teams))
);

/** Selects the locations without duplicates. */
export const selectLocations = createSelector(selectAllComics, comics =>
  flattened(comics.map(comic => comic.locations))
);

/** Selects the stories without duplicates. */
export const selectStories = createSelector(selectAllComics, comics =>
  flattened(comics.map(comic => comic.storyArcs))
);
