/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2022, The ComiXed Project
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
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  loadPublisherDetail,
  loadPublisherDetailFailure,
  loadPublisherDetailSuccess,
  loadPublisherList,
  loadPublisherListFailure,
  loadPublisherListSuccess
} from '../actions/publisher.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { PublisherService } from '@app/collections/services/publisher.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Series } from '@app/collections/models/series';
import { LoadPublisherListResponse } from '@app/collections/models/net/load-publisher-list-response';

@Injectable()
export class PublisherEffects {
  loadPublishers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadPublisherList),
      tap(action => this.logger.debug('Loading publishers:', action)),
      switchMap(action =>
        this.publisherService
          .loadPublishers({
            page: action.page,
            size: action.size,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadPublisherListResponse) =>
              loadPublisherListSuccess({
                total: response.total,
                publishers: response.publishers
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'collections.publishers.load-publishers.effect-failure'
                )
              );
              return of(loadPublisherListFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadPublisherListFailure());
      })
    );
  });

  loadPublisherDetail$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadPublisherDetail),
      tap(action => this.logger.debug('Loading publisher detail:', action)),
      switchMap(action =>
        this.publisherService.loadPublisherDetail({ name: action.name }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: Series[]) =>
            loadPublisherDetailSuccess({ detail: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'collections.publishers.load-publisher-detail.effect-failure',
                { name: action.name }
              )
            );
            return of(loadPublisherDetailFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadPublisherDetailFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private publisherService: PublisherService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
