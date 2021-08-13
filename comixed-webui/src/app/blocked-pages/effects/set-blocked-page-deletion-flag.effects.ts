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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import {
  blockedPageDeletionFlagsSet,
  setBlockedPageDeletionFlags,
  setBlockedPageDeletionFlagsFailed
} from '../actions/set-blocked-page-deletion-flag.actions';
import { BlockedPageService } from '@app/blocked-pages/services/blocked-page.service';
import { LoggerService } from '@angular-ru/logger';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { SetBlockedPageDeletionFlagResponse } from '@app/blocked-pages/models/net/set-blocked-page-deletion-flag-response';
import { of } from 'rxjs';

@Injectable()
export class SetBlockedPageDeletionFlagEffects {
  setBlockedPageDeletionFlags$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setBlockedPageDeletionFlags),
      tap(action =>
        this.logger.debug('Effect: set blocked page deletion flags:', action)
      ),
      switchMap(action =>
        this.blockedPageService
          .setDeletedFlag({
            hashes: action.hashes,
            deleted: action.deleted
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap((response: SetBlockedPageDeletionFlagResponse) =>
              this.alertService.info(
                this.translateService.instant(
                  'blocked-page-list.set-deleted-flag.effect-success',
                  { count: response.pageCount, deleted: response.deleted }
                )
              )
            ),
            map((response: SetBlockedPageDeletionFlagResponse) =>
              blockedPageDeletionFlagsSet()
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'blocked-page-list.set-deleted-flag.effect-failure',
                  { deleted: action.deleted }
                )
              );
              return of(setBlockedPageDeletionFlagsFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(setBlockedPageDeletionFlagsFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private blockedPageService: BlockedPageService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
