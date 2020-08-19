/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { LoggerService } from '@angular-ru/logger';
import { AlertService, ApiResponse } from 'app/core';
import { TranslateService } from '@ngx-translate/core';
import { ScrapingService } from 'app/comics/services/scraping.service';
import {
  comicScraped,
  scrapeComic,
  scrapeComicFailed
} from 'app/comics/actions/scrape-comic.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Comic } from 'app/comics';
import { of } from 'rxjs';

@Injectable()
export class ScrapeComicEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private scrapingService: ScrapingService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  scrapeComic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(scrapeComic),
      tap(action => this.logger.debug('effect: scraping comic:', action)),
      switchMap(action =>
        this.scrapingService
          .loadMetadata(
            action.apiKey,
            action.comicId,
            action.issueNumber,
            action.skipCache
          )
          .pipe(
            tap(response => this.logger.debug('received response:', response)),
            tap((response: ApiResponse<Comic>) =>
              response.success
                ? this.alertService.info(
                    this.translateService.instant(
                      'scraping.effects.scrape-comic.success-detail'
                    )
                  )
                : this.alertService.error(
                    this.translateService.instant(
                      'scraping.effects.scrape-comic.error-detail'
                    )
                  )
            ),
            map((response: ApiResponse<Comic>) =>
              response.success
                ? comicScraped({ comic: response.result })
                : scrapeComicFailed()
            ),
            catchError(error => {
              this.logger.error('service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'scraping.effects.scrape-comic.success-detail'
                )
              );
              return of(scrapeComicFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('service failure:', error);
        this.alertService.error(
          this.translateService.instant(
            'general-message.error.general-service-failure'
          )
        );
        return of(scrapeComicFailed());
      })
    );
  });
}
