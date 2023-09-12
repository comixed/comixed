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
import {
  clearMetadataSource,
  deleteMetadataSource,
  deleteMetadataSourceFailed,
  loadMetadataSource,
  loadMetadataSourceFailed,
  metadataSourceDeleted,
  metadataSourceLoaded,
  metadataSourceSaved,
  saveMetadataSource,
  saveMetadataSourceFailed
} from '@app/comic-metadata/actions/metadata-source.actions';
import { MetadataSourceService } from '@app/comic-metadata/services/metadata-source.service';
import { LoggerService } from '@angular-ru/cdk/logger';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { of } from 'rxjs';
import { metadataSourcesLoaded } from '@app/comic-metadata/actions/metadata-source-list.actions';

@Injectable()
export class MetadataSourceEffects {
  loadOne$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadMetadataSource),
      tap(action => this.logger.trace('Loading metadata source:', action)),
      switchMap(action =>
        this.metadataSourceService.loadOne({ id: action.id }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: MetadataSource) =>
            metadataSourceLoaded({ source: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'metadata-source.load-source.effect-failure'
              )
            );
            return of(loadMetadataSourceFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadMetadataSourceFailed());
      })
    );
  });

  save$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(saveMetadataSource),
      tap(action => this.logger.trace('Saving metadata source:', action)),
      switchMap(action =>
        this.metadataSourceService.save({ source: action.source }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap((response: MetadataSource) =>
            this.alertService.info(
              this.translateService.instant(
                'metadata-source.save-source.effect-success',
                {
                  name: response.name
                }
              )
            )
          ),
          map((response: MetadataSource) =>
            metadataSourceSaved({ source: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'metadata-source.save-source.effect-failure'
              )
            );
            return of(saveMetadataSourceFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(saveMetadataSourceFailed());
      })
    );
  });

  delete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteMetadataSource),
      tap(action => this.logger.trace('Deleting metadata source:', action)),
      switchMap(action =>
        this.metadataSourceService.delete({ source: action.source }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          tap(() =>
            this.alertService.info(
              this.translateService.instant(
                'metadata-source.delete-source.effect-success',
                { name: action.source.name }
              )
            )
          ),
          mergeMap((response: MetadataSource[]) => [
            metadataSourceDeleted(),
            clearMetadataSource(),
            metadataSourcesLoaded({ sources: response })
          ]),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'metadata-source.delete-source.effect-failure'
              )
            );
            return of(deleteMetadataSourceFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(deleteMetadataSourceFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private metadataSourceService: MetadataSourceService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
