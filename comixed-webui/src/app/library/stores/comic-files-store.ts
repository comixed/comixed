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
import { LoggerService } from '@angular-ru/cdk/logger';
import { inject } from '@angular/core';
import { ComicFileGroup } from '@app/library/models/comic-file-group';
import { ComicFile } from '@app/library/models/comic-file';

interface ComicFilesState {
  loading: boolean;
  groups: ComicFileGroup[];
  directories: string[];
  files: ComicFile[];
  selected: number;
  allSelected: boolean;
}

const initialState: ComicFilesState = {
  loading: false,
  groups: [],
  directories: [],
  files: [],
  selected: 0,
  allSelected: false
};

export const ComicFilesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, logger = inject(LoggerService)) => ({
    setLoading(loading: boolean): void {
      logger.trace('Toggling comic files loading flag');
      patchState(store, { loading });
    },
    update(groups: ComicFileGroup[]): void {
      const files = groups
        .map(entry => entry.files)
        .reduce((output, files) => output.concat(files), []);
      logger.trace('Updating the list of comic file groups');
      patchState(store, {
        groups,
        directories: groups.map(entry => entry.directory),
        files,
        selected: files.filter(file => file.selected).length,
        allSelected: files.every(entry => entry.selected)
      });
    }
  }))
);
