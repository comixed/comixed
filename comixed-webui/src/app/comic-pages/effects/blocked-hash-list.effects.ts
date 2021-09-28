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
  blockedHashListLoaded,
  loadBlockedHashList,
  loadBlockedHashListFailed,
  markPagesWithHash,
  markPagesWithHashFailed,
  pagesWithHashMarked
} from '@app/comic-pages/actions/blocked-hash-list.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { BlockedPageService } from '@app/comic-pages/services/blocked-page.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@angular-ru/logger';
import { BlockedHash } from '@app/comic-pages/models/blocked-hash';
import { of } from 'rxjs';

@Injectable()
export class BlockedHashListEffects {
  loadAll$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadBlockedHashList),
      tap(action => this.logger.trace('Loading blocked page list:', action)),
      switchMap(action =>
        this.blockedPageService.loadAll().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: BlockedHash[]) =>
            blockedHashListLoaded({ entries: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'blocked-hash-list.load-effect-failure'
              )
            );
            return of(loadBlockedHashListFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadBlockedHashListFailed());
      })
    );
  });

  markPagesWithHash$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(markPagesWithHash),
      tap(action =>
        this.logger.trace('Set blocked page deletion flags:', action)
      ),
      switchMap(action =>
        this.blockedPageService
          .markPagesWithHash({
            hashes: action.hashes,
            deleted: action.deleted
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'blocked-hash-list.mark-pages-with-hash.effect-success',
                  { deleted: action.deleted }
                )
              )
            ),
            map(() => pagesWithHashMarked()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'blocked-hash-list.mark-pages-with-hash.effect-failure',
                  { deleted: action.deleted }
                )
              );
              return of(markPagesWithHashFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(markPagesWithHashFailed());
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
