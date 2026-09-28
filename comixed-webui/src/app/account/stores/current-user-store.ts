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

import { User } from '@app/account/models/user';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

interface CurrentUserState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  email: string;
  firstLoginDate: number;
  lastLoginDate: number;
}

const initialState: CurrentUserState = {
  isLoading: false,
  isAuthenticated: false,
  user: null,
  email: '',
  firstLoginDate: 0,
  lastLoginDate: 0
};

export const CurrentUserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => ({
    loading(): void {
      patchState(store, {
        isLoading: true,
        isAuthenticated: false,
        user: null
      });
    },
    loaded(user: User | null): void {
      patchState(store, {
        isLoading: false,
        isAuthenticated: !!user,
        user: user,
        email: user?.email || '',
        firstLoginDate: user?.firstLoginDate || 0,
        lastLoginDate: user?.lastLoginDate || 0
      });
    },
    login(): void {
      patchState(store, { isAuthenticated: false, isLoading: true });
    },
    loginSuccess(): void {
      patchState(store, { isAuthenticated: true, isLoading: false });
    },
    loginFailure(): void {
      patchState(store, { isLoading: false });
    }
  }))
);
