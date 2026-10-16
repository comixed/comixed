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

import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { LoggerService } from '@angular-ru/cdk/logger';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectCurrentUserState } from '@app/account/selectors/current-user.selectors';
import { hasRole } from '@app/account/account-functions';

export const readerGuard: CanActivateFn = () => {
  const logger = inject(LoggerService);
  const store = inject(Store);
  const result$ = new Subject<boolean>();

  store.select(selectCurrentUserState).subscribe({
    next: state => {
      if (!state.loading && state.checked) {
        const result = hasRole(state?.user?.roles || [], 'READER');
        logger.debug('isReader?', result);
        result$.next(result);
      }
    }
  });
  return result$.asObservable();
};
