/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ScrapeFilenameActions } from '../actions/scrape-filename.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicScrapingService } from '@app/metadata/services/comic-scraping-service';
import { AlertService } from '@app/services/alert-service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class ScrapeFilenameEffects {
  readonly logger = inject(LoggerService);
  readonly comicScrapingService = inject(ComicScrapingService);
  readonly alertService = inject(AlertService);
  readonly translateService = inject(TranslateService);
  private actions$ = inject(Actions);
  scrapeComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ScrapeFilenameActions.scrapeComic),
      tap(action => this.logger.debug('Scraping comic filename:', action)),
      switchMap(action =>
        this.comicScrapingService.scrapeFilename({ comic: action.comic }).pipe(
          tap(response => this.logger.debug('Response received:', response)),
          map(response =>
            ScrapeFilenameActions.scrapeComicSuccess({
              series: response.series,
              volume: response.volume,
              issueNumber: response.issueNumber
            })
          ),
          catchError(error => {
            this.logger.error('Service failure:', error);
            this.alertService.error(
              this.translateService.instant(
                'scrape-filename-effects.scrape-comic.service-failure'
              )
            );
            return of(ScrapeFilenameActions.scrapeComicFailure());
          })
        )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.effects.general-failure')
        );
        return of(ScrapeFilenameActions.scrapeComicFailure());
      })
    );
  });
}
