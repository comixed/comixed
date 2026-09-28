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

import { createFeature, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ComicFileGroup } from '@app/library/models/comic-file-group';
import { ComicFileListActions } from '@app/library/actions/comic-file-list.actions';

export const COMIC_FILE_LIST_FEATURE_KEY = 'comic_file_list_state';

export interface ComicFileListState extends EntityState<ComicFileGroup> {
  busy: boolean;
  currentPath: string;
}

export const comicFileListAdaptor: EntityAdapter<ComicFileGroup> =
  createEntityAdapter<ComicFileGroup>({
    selectId: group => group.directory,
    sortComparer: (left, right) => left.directory.localeCompare(right.directory)
  });

export const initialComicFileListState: ComicFileListState =
  comicFileListAdaptor.getInitialState({
    busy: false,
    currentPath: ''
  });

export const comicFileListReducer = createReducer(
  initialComicFileListState,
  on(ComicFileListActions.loadFromSession, state => ({
    ...state,
    busy: true
  })),
  on(ComicFileListActions.loadFromSessionSuccess, (state, action) => {
    return comicFileListAdaptor.setAll(action.groups, {
      ...state,
      busy: false,
      currentPath: ''
    });
  }),
  on(ComicFileListActions.loadFromSessionFailure, state => ({
    ...state,
    busy: false
  })),
  on(ComicFileListActions.loadFromDisk, state => ({ ...state, busy: true })),
  on(ComicFileListActions.loadFromDiskSuccess, (state, action) => {
    return comicFileListAdaptor.setAll(action.groups, {
      ...state,
      busy: false,
      currentPath: ''
    });
  }),
  on(ComicFileListActions.loadFromDiskFailure, state => ({
    ...state,
    busy: false
  })),
  on(ComicFileListActions.select, state => ({ ...state, busy: true })),
  on(ComicFileListActions.selectSuccess, (state, action) => {
    return comicFileListAdaptor.setAll(action.groups, {
      ...state,
      busy: false
    });
  }),
  on(ComicFileListActions.selectFailure, state => ({ ...state, busy: false })),
  on(ComicFileListActions.import, state => ({ ...state, busy: true })),
  on(ComicFileListActions.importSuccess, state => {
    return comicFileListAdaptor.setAll([], {
      ...state,
      busy: false,
      currentPath: ''
    });
  }),
  on(ComicFileListActions.importFailure, state => ({ ...state, busy: false }))
);

export const comicFileListsFeature = createFeature({
  name: COMIC_FILE_LIST_FEATURE_KEY,
  reducer: comicFileListReducer
});
