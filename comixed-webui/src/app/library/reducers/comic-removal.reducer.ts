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
import { ComicRemovalActions } from '../actions/comic-removal.actions';

export const COMIC_REMOVAL_FEATURE_KEY = 'comic_removal_state';

export interface ComicRemovalState {
  busy: boolean;
}

export const initialComicRemovalState: ComicRemovalState = {
  busy: false
};

export const comicRemovalReducer = createReducer(
  initialComicRemovalState,
  on(ComicRemovalActions.markOneForRemoval, state => ({
    ...state,
    busy: true
  })),
  on(ComicRemovalActions.markOneForRemovalSuccess, state => ({
    ...state,
    busy: false
  })),
  on(ComicRemovalActions.markOneForRemovalFailure, state => ({
    ...state,
    busy: false
  })),
  on(ComicRemovalActions.unmarkOneForRemoval, state => ({
    ...state,
    busy: true
  })),
  on(ComicRemovalActions.unmarkOneForRemovalSuccess, state => ({
    ...state,
    busy: false
  })),
  on(ComicRemovalActions.unmarkOneForRemovalFailure, state => ({
    ...state,
    busy: false
  })),
  on(ComicRemovalActions.markSelectionsForRemoval, state => ({
    ...state,
    busy: true
  })),
  on(ComicRemovalActions.markSelectionsForRemovalSuccess, state => ({
    ...state,
    busy: false
  })),
  on(ComicRemovalActions.markSelectionsForRemovalFailure, state => ({
    ...state,
    busy: false
  })),
  on(ComicRemovalActions.unmarkSelectionsForRemoval, state => ({
    ...state,
    busy: true
  })),
  on(ComicRemovalActions.unmarkSelectionsForRemovalSuccess, state => ({
    ...state,
    busy: false
  })),
  on(ComicRemovalActions.unmarkSelectionsForRemovalFailure, state => ({
    ...state,
    busy: false
  }))
);

export const comicRemovalFeature = createFeature({
  name: COMIC_REMOVAL_FEATURE_KEY,
  reducer: comicRemovalReducer
});
