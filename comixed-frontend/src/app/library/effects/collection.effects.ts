/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project
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
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { CollectionEntry } from 'app/library/models/collection-entry';
import { GetCollectionPageResponse } from 'app/library/models/net/get-collection-page-response';
import { CollectionService } from 'app/library/services/collection.service';
import { NGXLogger } from 'ngx-logger';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  CollectionActions,
  CollectionActionTypes,
  CollectionComicsReceived,
  CollectionGetComicsFailed,
  CollectionLoadFailed,
  CollectionReceived
} from '../actions/collection.actions';

@Injectable()
export class CollectionEffects {
  constructor(
    private actions$: Actions<CollectionActions>,
    private translateService: TranslateService,
    private messageService: MessageService,
    private collectionService: CollectionService,
    private logger: NGXLogger
  ) {}

  @Effect()
  getEntries$: Observable<Action> = this.actions$.pipe(
    ofType(CollectionActionTypes.Load),
    map(action => action.payload),
    switchMap(action =>
      this.collectionService.getEntries(action.collectionType).pipe(
        map(
          (response: CollectionEntry[]) =>
            new CollectionReceived({ entries: response })
        ),
        catchError(error => {
          this.logger.error('getting collection entries service error:', error);
          this.messageService.add({
            severity: 'error',
            detail: this.translateService.instant(
              'collection-effects.get-entries.error.detail',
              { collectionType: action.collectionType }
            )
          });
          return of(new CollectionLoadFailed());
        })
      )
    ),
    catchError(error => {
      this.logger.error('getting collection entries general error:', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new CollectionLoadFailed());
    })
  );

  @Effect()
  getPageForEntry$: Observable<Action> = this.actions$.pipe(
    ofType(CollectionActionTypes.GetComics),
    map(action => action.payload),
    switchMap(action =>
      this.collectionService
        .getPageForEntry(
          action.collectionType,
          action.name,
          action.page,
          action.count,
          action.sortField,
          action.ascending
        )
        .pipe(
          map(
            (response: GetCollectionPageResponse) =>
              new CollectionComicsReceived({
                comics: response.comics,
                comicCount: response.comicCount
              })
          ),
          catchError(error => {
            this.logger.error(
              'getting collection page entries service failure:',
              error
            );
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(
                'collection-effects.get-page-for-entry.error.detail'
              )
            });
            return of(new CollectionGetComicsFailed());
          })
        )
    ),
    catchError(error => {
      this.logger.error(
        'getting collection page entries general failure:',
        error
      );
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new CollectionGetComicsFailed());
    })
  );
}
