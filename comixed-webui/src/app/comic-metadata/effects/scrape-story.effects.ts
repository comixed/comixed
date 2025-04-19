/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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
  loadStoryCandidates,
  loadStoryCandidatesFailure,
  loadStoryCandidatesSuccess,
  scrapeStoryMetadata,
  scrapeStoryMetadataFailure,
  scrapeStoryMetadataSuccess
} from '../actions/scrape-story.actions';
import { LoggerService } from '@angular-ru/cdk/logger';
import { ComicBookScrapingService } from '@app/comic-metadata/services/comic-book-scraping.service';
import { AlertService } from '@app/core/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { StoryMetadata } from '@app/collections/models/story-metadata';
import { of } from 'rxjs';

@Injectable()
export class ScrapeStoryEffects {
  loadStoryCandidates$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadStoryCandidates),
      tap(action => this.logger.trace('Loading story candidates:', action)),
      switchMap(action =>
        this.comicBookScrapingService
          .loadStoryCandidates({
            sourceId: action.sourceId,
            storyName: action.name,
            maxRecords: action.maxRecords,
            skipCache: action.skipCache
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            map((response: StoryMetadata[]) =>
              loadStoryCandidatesSuccess({ candidates: response })
            ),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'scrape-story.load-story-candidates.effect-failure',
                  { name: action.name }
                )
              );
              return of(loadStoryCandidatesFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(loadStoryCandidatesFailure());
      })
    );
  });

  scrapeStory$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(scrapeStoryMetadata),
      tap(action => this.logger.trace('Scraping story:', action)),
      switchMap(action =>
        this.comicBookScrapingService
          .scrapeStory({
            sourceId: action.sourceId,
            referenceId: action.referenceId,
            skipCache: action.skipCache
          })
          .pipe(
            tap(response => this.logger.debug('Response received:', response)),
            tap(() =>
              this.alertService.info(
                this.translateService.instant(
                  'scrape-story.scrape-story-metadata.effect-success'
                )
              )
            ),
            map(() => scrapeStoryMetadataSuccess()),
            catchError(error => {
              this.logger.error('Service failure:', error);
              this.alertService.error(
                this.translateService.instant(
                  'scrape-story.scrape-story-metadata.effect-failure'
                )
              );
              return of(scrapeStoryMetadataFailure());
            })
          )
      ),
      catchError(error => {
        this.logger.error('General failure:', error);
        this.alertService.error(
          this.translateService.instant('app.general-effect-failure')
        );
        return of(scrapeStoryMetadataFailure());
      })
    );
  });

  constructor(
    private logger: LoggerService,
    private actions$: Actions,
    private comicBookScrapingService: ComicBookScrapingService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
}
