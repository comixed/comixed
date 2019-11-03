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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import {
  ScrapingActions,
  ScrapingActionTypes,
  ScrapingGetIssueFailed,
  ScrapingGetVolumesFailed,
  ScrapingIssueReceived,
  ScrapingLoadMetadataFailed,
  ScrapingMetadataLoaded,
  ScrapingVolumesReceived
} from '../actions/scraping.actions';
import { Observable, of } from 'rxjs';
import { Action } from '@ngrx/store';
import { ScrapingService } from 'app/comics/services/scraping.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ScrapingVolume } from 'app/comics/models/scraping-volume';
import { ScrapingIssue } from 'app/comics/models/scraping-issue';
import { Comic } from 'app/comics';

@Injectable()
export class ScrapingEffects {
  constructor(
    private actions$: Actions<ScrapingActions>,
    private scrapingService: ScrapingService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  @Effect()
  getVolumes$: Observable<Action> = this.actions$.pipe(
    ofType(ScrapingActionTypes.GetVolumes),
    map(action => action.payload),
    switchMap(action =>
      this.scrapingService
        .getVolumes(
          action.apiKey,
          action.series,
          action.volume,
          action.skipCache
        )
        .pipe(
          tap((response: ScrapingVolume[]) =>
            this.messageService.add({
              severity: 'info',
              detail: this.translateService.instant(
                'scraping-effects.get-volumes.success.detail',
                { count: response.length }
              )
            })
          ),
          map(
            (response: ScrapingVolume[]) =>
              new ScrapingVolumesReceived({ volumes: response })
          ),
          catchError(error => {
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(
                'scraping-effects.get-volumes.error.detail'
              )
            });
            return of(new ScrapingGetVolumesFailed());
          })
        )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ScrapingGetVolumesFailed());
    })
  );

  @Effect()
  getIssue$: Observable<Action> = this.actions$.pipe(
    ofType(ScrapingActionTypes.GetIssue),
    map(action => action.payload),
    switchMap(action =>
      this.scrapingService
        .getIssue(
          action.apiKey,
          action.volumeId,
          action.issueNumber,
          action.skipCache
        )
        .pipe(
          tap((response: ScrapingIssue) =>
            this.messageService.add({
              severity: 'info',
              detail: this.translateService.instant(
                'scraping-effects.get-issue.success.detail'
              )
            })
          ),
          map(
            (response: ScrapingIssue) =>
              new ScrapingIssueReceived({ issue: response })
          ),
          catchError(error => {
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(
                'scraping-effects.get-issue.error.detail'
              )
            });
            return of(new ScrapingGetIssueFailed());
          })
        )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ScrapingGetIssueFailed());
    })
  );

  @Effect()
  loadMetadata$: Observable<Action> = this.actions$.pipe(
    ofType(ScrapingActionTypes.LoadMetadata),
    map(action => action.payload),
    switchMap(action =>
      this.scrapingService
        .loadMetadata(
          action.apiKey,
          action.comicId,
          action.issueNumber,
          action.skipCache
        )
        .pipe(
          tap((response: Comic) =>
            this.messageService.add({
              severity: 'info',
              detail: this.translateService.instant(
                'scraping-effects.load-metadata.success.detail'
              )
            })
          ),
          map(
            (response: Comic) => new ScrapingMetadataLoaded({ comic: response })
          ),
          catchError(error => {
            this.messageService.add({
              severity: 'error',
              detail: this.translateService.instant(
                'scraping-effects.load-metadata.error.detail'
              )
            });
            return of(new ScrapingLoadMetadataFailed());
          })
        )
    ),
    catchError(error => {
      this.messageService.add({
        severity: 'error',
        detail: this.translateService.instant(
          'general-message.error.general-service-failure'
        )
      });
      return of(new ScrapingLoadMetadataFailed());
    })
  );
}
