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

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { RemoteLibraryState } from '@app/library/models/net/remote-library-state';
import { RemoteLibrarySegment } from '@app/library/models/net/remote-library-segment';
import { PublisherAndYearSegment } from '@app/library/models/net/publisher-and-year-segment';

interface LibraryState {
  totalComics: number;
  unscrapedComics: number;
  deletedComics: number;
  duplicateComics: number;
  archiveTypes: RemoteLibrarySegment[];
  states: RemoteLibrarySegment[];
  byPublisherAndYear: PublisherAndYearSegment[];
  publishers: RemoteLibrarySegment[];
  series: RemoteLibrarySegment[];
  characters: RemoteLibrarySegment[];
  teams: RemoteLibrarySegment[];
  locations: RemoteLibrarySegment[];
  stories: RemoteLibrarySegment[];
}

const initialState: LibraryState = {
  totalComics: 0,
  unscrapedComics: 0,
  deletedComics: 0,
  duplicateComics: 0,
  archiveTypes: [],
  states: [],
  byPublisherAndYear: [],
  publishers: [],
  series: [],
  characters: [],
  teams: [],
  locations: [],
  stories: []
};

export const LibraryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => ({
    updateState(state: RemoteLibraryState): void {
      patchState(store, {
        totalComics: state.totalComics,
        unscrapedComics: state.unscrapedComics,
        deletedComics: state.deletedComics,
        duplicateComics: state.duplicateComics,
        states: state.states,
        archiveTypes: state.archiveTypes,
        byPublisherAndYear: state.byPublisherAndYear,
        publishers: state.publishers,
        series: state.series,
        characters: state.characters,
        teams: state.teams,
        locations: state.locations,
        stories: state.stories
      });
    }
  }))
);
