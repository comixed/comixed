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
import { LoggerService } from '@angular-ru/cdk/logger';
import { LastReadService } from '@app/comic-books/services/last-read.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import {
  loadUnreadComicBookCount,
  loadUnreadComicBookCountFailure,
  loadUnreadComicBookCountSuccess
} from '@app/comic-books/actions/last-read-list.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LoadUnreadComicBookCountResponse } from '@app/comic-books/models/net/load-unread-comic-book-count-response';

@Injectable()
export class LastReadListEffects {
  loadUnreadComicBookCount$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadUnreadComicBookCount),
      tap(action => this.logger.debug('Effect: load unread count:', action)),
      switchMap(action =>
        this.lastReadService.loadUnreadComicBookCount().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: LoadUnreadComicBookCountResponse) =>
            loadUnreadComicBookCountSuccess({
              readCount: response.readCount,
              unreadCount: response.unreadCount
            })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'last-read-list.load-entries.effect-failure'
              )
            );
            return of(loadUnreadComicBookCountFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadUnreadComicBookCountFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private lastReadService: LastReadService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
