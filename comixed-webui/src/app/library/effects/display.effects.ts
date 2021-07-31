/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LoggerService } from '@angular-ru/logger';
import { pageSizeSet, setPageSize } from '@app/library/actions/display.actions';
import { mergeMap, tap } from 'rxjs/operators';
import { saveUserPreference } from '@app/user/actions/user.actions';
import { PAGE_SIZE_PREFERENCE } from '@app/library/library.constants';

@Injectable()
export class DisplayEffects {
  constructor(private logger: LoggerService, private actions$: Actions) {}

  setPageSize$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setPageSize),
      tap(action => this.logger.trace('Effect: set page size:', action)),
      mergeMap(action =>
        action.save
          ? [
              pageSizeSet(),
              saveUserPreference({
                name: PAGE_SIZE_PREFERENCE,
                value: `${action.size}`
              })
            ]
          : [pageSizeSet()]
      )
    );
  });
}
