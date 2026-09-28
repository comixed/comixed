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
import { Store } from '@ngrx/store';
import { selectCurrentUserIsAdmin } from '@app/account/selectors/current-user.selectors';
import { filter, map, take, tap } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const logger = inject(LoggerService);
  const store = inject(Store);

  return store.select(selectCurrentUserIsAdmin).pipe(
    filter(status => status.checked),
    take(1),
    tap(status => logger.trace('Is admin?', status.passed)),
    map(status => status.passed)
  );
};
