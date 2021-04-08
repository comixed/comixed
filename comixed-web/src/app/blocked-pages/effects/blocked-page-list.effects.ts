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
  blockedPageListLoaded,
  loadBlockedPageList,
  loadBlockedPageListFailed
} from '@app/blocked-pages/actions/blocked-page-list.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { BlockedPageService } from '@app/blocked-pages/services/blocked-page.service';
import { AlertService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/logger';
import { BlockedPage } from '@app/blocked-pages';
import { of } from 'rxjs';

@Injectable()
export class BlockedPageListEffects {
  loadAll$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadBlockedPageList),
      tap(action =>
        this.logger.debug('Effect: loading blocked page list:', action)
      ),
      switchMap(action =>
        this.blockedPageService.loadAll().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: BlockedPage[]) =>
            blockedPageListLoaded({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-page-list.load-effect-failure'
              )
            );
            return of(loadBlockedPageListFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadBlockedPageListFailed());
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
