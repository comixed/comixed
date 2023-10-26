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
  loadCollectionList,
  loadCollectionListFailure,
  loadCollectionListSuccess
} from '../actions/collection-list.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { LoggerService } from '@angular-ru/cdk/logger';
import { CollectionService } from '@app/collections/services/collection.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadCollectionEntriesResponse } from '@app/collections/models/net/load-collection-entries-response';
import { of } from 'rxjs';

@Injectable()
export class CollectionListEffects {
  loadCollectionList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadCollectionList),
      tap(action => this.logger.debug('Loading collection list:', action)),
      switchMap(action =>
        this.collectionService
          .loadCollectionEntries({
            tagType: action.tagType,
            pageSize: action.pageSize,
            pageIndex: action.pageIndex,
            sortBy: action.sortBy,
            sortDirection: action.sortDirection
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: LoadCollectionEntriesResponse) =>
              loadCollectionListSuccess({
                entries: response.entries,
                totalEntries: response.totalEntries
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'load-collection-list.effect-failure'
                )
              );
              return of(loadCollectionListFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadCollectionListFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private collectionService: CollectionService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
