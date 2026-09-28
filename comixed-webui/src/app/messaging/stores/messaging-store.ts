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

interface MessagingState {
  isStarting: boolean;
  isStopping: boolean;
  isStarted: boolean;
}

const initialState: MessagingState = {
  isStarted: false,
  isStopping: false,
  isStarting: false
};

export const MessagingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => ({
    start(): void {
      patchState(store, {
        isStarting: true,
        isStopping: false,
        isStarted: false
      });
    },
    started(): void {
      patchState(store, {
        isStarting: false,
        isStopping: false,
        isStarted: true
      });
    },
    stop(): void {
      patchState(store, {
        isStarting: false,
        isStopping: true,
        isStarted: false
      });
    },
    stopped(): void {
      patchState(store, {
        isStarting: false,
        isStopping: false,
        isStarted: false
      });
    }
  }))
);
