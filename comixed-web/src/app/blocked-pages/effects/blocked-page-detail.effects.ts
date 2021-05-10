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
import { BlockedPageService } from '@app/blocked-pages/services/blocked-page.service';
import { TranslateService } from '@ngx-translate/core';
import {
  blockedPageLoaded,
  blockedPageSaved,
  loadBlockedPageByHash,
  loadBlockedPageFailed,
  saveBlockedPage,
  saveBlockedPageFailed
} from '@app/blocked-pages/actions/blocked-page-detail.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { BlockedPage } from '@app/blocked-pages/models/blocked-page';
import { AlertService } from '@app/core/services/alert.service';

@Injectable()
export class BlockedPageDetailEffects {
  loadByHash$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadBlockedPageByHash),
      tap(action =>
        this.logger.debug('Effect: loading blocked page by hash:', action)
      ),
      switchMap(action =>
        this.blockPageService.loadByHash({ hash: action.hash }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: BlockedPage) =>
            blockedPageLoaded({ entry: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-page.load-by-hash-effect-error',
                { hash: action.hash }
              )
            );
            return of(loadBlockedPageFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-error')
        );
        return of(loadBlockedPageFailed());
      })
    );
  });

  save$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(saveBlockedPage),
      tap(action => this.logger.debug('Effect: save blocked page:', action)),
      switchMap(action =>
        this.blockPageService.save({ entry: action.entry }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap((response: BlockedPage) =>
            this.alertService.info(
              this.translateService.instant(
                'blocked-page.editing.save-effect-success'
              )
            )
          ),
          map((response: BlockedPage) => blockedPageSaved({ entry: response })),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-page.editing.save-effect-failure'
              )
            );
            return of(saveBlockedPageFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(saveBlockedPageFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private blockPageService: BlockedPageService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
