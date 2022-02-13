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

import * as MetadataSourceListActions from '../actions/metadata-source-list.actions';
import {
  loadMetadataSourcesFailed,
  metadataSourcesLoaded
} from '../actions/metadata-source-list.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { MetadataSourceService } from '@app/comic-metadata/services/metadata-source.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { MetadataSource } from '@app/comic-metadata/models/metadata-source';
import { of } from 'rxjs';

@Injectable()
export class MetadataSourceListEffects {
  loadMetadataSources$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MetadataSourceListActions.loadMetadataSources),
      tap(() => this.logger.trace('Loading metadata source list')),
      switchMap(() =>
        this.metadataSourceService.loadMetadataSourceList().pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map((response: MetadataSource[]) =>
            metadataSourcesLoaded({ sources: response })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'metadata.load-sources.effect-failure'
              )
            );
            return of(loadMetadataSourcesFailed());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadMetadataSourcesFailed());
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
