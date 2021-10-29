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
import { processComicsUpdate } from '../actions/process-comics.actions';

export const PROCESS_COMICS_FEATURE_KEY = 'process_comics_state';

export interface ProcessComicsState {
  active: boolean;
  started: number;
  stepName: string;
  total: number;
  processed: number;
}

export const initialState: ProcessComicsState = {
  active: false,
  started: 0,
  stepName: '',
  total: 0,
  processed: 0
};

export const reducer = createReducer(
  initialState,

  on(processComicsUpdate, (state, action) => ({
    ...state,
    active: action.active,
    started: action.started,
    stepName: action.stepName,
    total: action.total,
    processed: action.processed
  }))
);
