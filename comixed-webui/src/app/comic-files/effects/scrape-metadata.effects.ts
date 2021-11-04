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
  metadataScrapedFromFilename,
  scrapeMetadataFromFilename,
  scrapeMetadataFromFilenameFailed
} from '../actions/scrape-metadata.actions';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/services/alert.service';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicImportService } from '@app/comic-files/services/comic-import.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { FilenameMetadataResponse } from '@app/comic-files/models/net/filename-metadata-response';
import { of } from 'rxjs';

@Injectable()
export class ScrapeMetadataEffects {
  scrapeFilename$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(scrapeMetadataFromFilename),
      tap(action => this.logger.trace('Scrape filename:', action)),
      switchMap(action =>
        this.comicImportService
          .scrapeFilename({ filename: action.filename })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap((response: FilenameMetadataResponse) =>
              this.alertService.info(
                this.translateService.instant(
                  'scrape-filename.effect-success',
                  { found: response.found }
                )
              )
            ),
            map((response: FilenameMetadataResponse) =>
              metadataScrapedFromFilename({
                found: response.found,
                series: response.series,
                volume: response.volume,
                issueNumber: response.issueNumber
              })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant('scrape-filename.effect-failure')
              );
              return of(scrapeMetadataFromFilenameFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(scrapeMetadataFromFilenameFailed());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicImportService: ComicImportService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
