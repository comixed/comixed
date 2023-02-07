/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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
  deletedPagesLoaded,
  loadDeletedPages,
  loadDeletedPagesFailed
} from '../actions/deleted-pages.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { DeletedPagesService } from '@app/comic-pages/services/deleted-pages.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { DeletedPage } from '@app/comic-pages/models/deleted-page';
import { of } from 'rxjs';

@Injectable()
export class DeletedPagesEffects {
  loadedDeletedPages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadDeletedPages),
      tap(() => this.logger.trace('Loading deleted page list')),
      switchMap(action =>
        this.deletedPagesService.loadAll().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: DeletedPage[]) =>
            deletedPagesLoaded({ pages: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'deleted-page-list.load-all.effect-failure'
              )
            );
            return of(loadDeletedPagesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadDeletedPagesFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private deletedPagesService: DeletedPagesService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
