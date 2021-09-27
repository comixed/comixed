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
import { LoggerService } from '@angular-ru/logger';
import { BlockedPageService } from '@app/comic-pages/services/blocked-page.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import {
  blockedPagesDeleted,
  deleteBlockedPages,
  deleteBlockedPagesFailed
} from '@app/comic-pages/actions/delete-blocked-pages.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';
import { of } from 'rxjs';

@Injectable()
export class DeleteBlockedPagesEffects {
  deleteEntries$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteBlockedPages),
      tap(action => this.logger.debug('Effect: delete blocked pages:', action)),
      switchMap(action =>
        this.blockedPageService.deleteEntries({ entries: action.entries }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'blocked-page-list.delete-entries.effect-success',
                { count: action.entries.length }
              )
            )
          ),
          map(() => blockedPagesDeleted()),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-page-list.delete-entries.effect-failure'
              )
            );
            return of(deleteBlockedPagesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(deleteBlockedPagesFailed());
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
