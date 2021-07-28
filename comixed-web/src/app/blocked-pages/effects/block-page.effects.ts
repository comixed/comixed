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
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import {
  blockedStateSet,
  setBlockedState,
  setBlockedStateFailed
} from '@app/blocked-pages/actions/block-page.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class BlockPageEffects {
  setBlockedState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setBlockedState),
      tap(action => this.logger.debug('Effect: set blocked state:', action)),
      switchMap(action =>
        this.blockedPageService
          .setBlockedState({ hash: action.hash, blocked: action.blocked })
          .pipe(
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'blocked-page.set-state.effect-success',
                  { blocked: action.blocked }
                )
              )
            ),
            map(() => blockedStateSet()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'blocked-page.set-state.effect-failure',
                  { blocked: action.blocked }
                )
              );
              return of(setBlockedStateFailed());
            })
          )
      ),
      map(() => blockedStateSet()),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(setBlockedStateFailed());
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
