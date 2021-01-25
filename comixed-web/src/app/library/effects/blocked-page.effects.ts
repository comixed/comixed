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
  pageBlockSet,
  setPageBlock,
  setPageBlockFailed
} from '@app/library/actions/blocked-page.actions';
import { PageService } from '@app/library/services/page.service';
import { AlertService } from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/logger';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class BlockedPageEffects {
  setBlockedState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(setPageBlock),
      tap(action =>
        this.logger.debug('Effect: set blocked state for page:', action)
      ),
      switchMap(action =>
        this.pageService
          .setBlockedState({ page: action.page, blocked: action.blocked })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map(() => pageBlockSet()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'blocked-pages.set-blocked.effect-failure',
                  {
                    blocked: action.blocked,
                    hash: action.page.hash
                  }
                )
              );
              return of(setPageBlockFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(setPageBlockFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private pageService: PageService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
