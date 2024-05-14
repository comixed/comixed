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

import { createReducer, on } from '@ngrx/store';
import { processComicBooksUpdate } from '../actions/process-comics.actions';

export const IMPORT_COMIC_BOOKS_FEATURE_KEY = 'import_comic_books_state';

export interface ProcessingComicStatus {
  stepName: string;
  total: number;
  processed: number;
  progress: number;
}

export interface ImportComicBooksState {
  active: boolean;
  batches: ProcessingComicStatus[];
}

export const initialState: ImportComicBooksState = {
  active: false,
  batches: []
};

export const reducer = createReducer(
  initialState,

  on(processComicBooksUpdate, (state, action) => {
    let batches = state.batches.filter(
      entry => entry.stepName !== action.stepName
    );
    if (action.active) {
      batches = batches.concat({
        stepName: action.stepName,
        total: action.total,
        processed: action.processed,
        progress: action.processed / action.total
      });
    }
    return {
      ...state,
      active: batches.length > 0,
      batches
    };
  })
);
