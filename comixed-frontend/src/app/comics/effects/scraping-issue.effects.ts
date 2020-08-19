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
import {
  getScrapingIssue,
  getScrapingIssueFailed,
  scrapingIssueReceived
} from 'app/comics/actions/scraping-issue.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AlertService, ApiResponse } from 'app/core';
import { ScrapingIssue } from 'app/comics/models/scraping-issue';
import { LoggerService } from '@angular-ru/logger';
import { ScrapingService } from 'app/comics/services/scraping.service';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Injectable()
export class ScrapingIssueEffects {
  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private scrapingService: ScrapingService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  getScrapingIssue$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getScrapingIssue),
      tap(action => this.logger.debug('effect: get scraping issue:', action)),
      switchMap(action =>
        this.scrapingService
          .getIssue(
            action.apiKey,
            action.volumeId,
            action.issueNumber,
            action.skipCache
          )
          .pipe(
            tap(response => this.logger.debug('received response:', response)),
            map((response: ApiResponse<ScrapingIssue>) =>
              response.success
                ? scrapingIssueReceived({ issue: response.result })
                : getScrapingIssueFailed()
            ),
            catchError(error => {
              this.logger.error('service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'scraping.effects.get-scraping-issue.error-detail'
                )
              );
              return of(getScrapingIssueFailed());
            })
          )
      ),
      catchError(error => {
        this.logger.error('general failure:', error);
        this.alertService.error(
          this.translateService.instant(
            'general-message.error.general-service-failure'
          )
        );
        return of(getScrapingIssueFailed());
      })
    );
  });
}
