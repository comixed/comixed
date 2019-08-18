/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import * as ScrapingActions from 'app/actions/single-comic-scraping.actions';
import { ComicService } from 'app/services/comic.service';
import { MessageService } from 'primeng/api';
import { UserService } from 'app/services/user.service';
import { Comic } from 'app/library';
import { Volume } from 'app/models/comics/volume';
import { Issue } from 'app/models/scraping/issue';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class SingleComicScrapingEffects {
  constructor(
    private actions$: Actions,
    private comic_service: ComicService,
    private message_service: MessageService,
    private user_service: UserService,
    private translate: TranslateService
  ) {}

  @Effect()
  single_comic_scraping_fetch_volumes$: Observable<Action> = this.actions$.pipe(
    ofType(ScrapingActions.SINGLE_COMIC_SCRAPING_FETCH_VOLUMES),
    map(
      (action: ScrapingActions.SingleComicScrapingFetchVolumes) =>
        action.payload
    ),
    switchMap(action =>
      this.comic_service
        .fetch_candidates_for(
          action.api_key,
          action.series,
          action.volume,
          action.issue_number,
          action.skip_cache
        )
        .pipe(
          tap((volumes: Array<Volume>) =>
            this.message_service.add({
              severity: 'info',
              summary: 'Fetch Volumes',
              detail: this.translate.instant(
                'effects.single-comic-scraping.info.retrieved-volume-count',
                { count: volumes.length }
              )
            })
          ),
          map(
            (volumes: Array<Volume>) =>
              new ScrapingActions.SingleComicScrapingFoundVolumes(volumes)
          )
        )
    )
  );

  @Effect()
  single_comic_scraping_save_local_changes$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(ScrapingActions.SINGLE_COMIC_SCRAPING_SAVE_LOCAL_CHANGES),
    map(
      (action: ScrapingActions.SingleComicScrapingSaveLocalChanges) =>
        action.payload
    ),
    switchMap(action =>
      this.comic_service
        .save_changes_to_comic(
          action.comic,
          action.series,
          action.volume,
          action.issue_number
        )
        .pipe(
          map(
            () =>
              new ScrapingActions.SingleComicScrapingSetup({
                api_key: action.api_key,
                comic: action.comic,
                series: action.series,
                volume: action.volume,
                issue_number: action.issue_number
              })
          )
        )
    )
  );

  @Effect()
  single_comic_scraping_set_current_volume$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(ScrapingActions.SINGLE_COMIC_SCRAPING_SET_CURRENT_VOLUME),
    map(
      (action: ScrapingActions.SingleComicScrapingSetCurrentVolume) =>
        action.payload
    ),
    switchMap(action =>
      this.comic_service
        .scrape_comic_details_for(
          action.api_key,
          `${action.volume.id}`,
          action.issue_number,
          action.skip_cache
        )
        .pipe(
          map(
            (issue: Issue) =>
              new ScrapingActions.SingleComicScrapingFoundIssue({
                issue: issue,
                volume_id: action.volume.id
              })
          )
        )
    )
  );

  @Effect()
  single_comic_scraping_fetch_issues$: Observable<Action> = this.actions$.pipe(
    ofType(ScrapingActions.SINGLE_COMIC_SCRAPING_FETCH_ISSUES),
    map(
      (action: ScrapingActions.SingleComicScrapingFetchIssue) => action.payload
    ),
    switchMap(action =>
      this.comic_service
        .scrape_comic_details_for(
          action.api_key,
          `${action.volume_id}`,
          action.issue_number,
          action.skip_cache
        )
        .pipe(
          map(
            (issue: Issue) =>
              new ScrapingActions.SingleComicScrapingFoundIssue({
                issue: issue,
                volume_id: action.volume_id
              })
          )
        )
    )
  );

  @Effect()
  single_comic_scraping_scrape_metadata$: Observable<
    Action
  > = this.actions$.pipe(
    ofType(ScrapingActions.SINGLE_COMIC_SCRAPING_SCRAPE_METADATA),
    map(
      (action: ScrapingActions.SingleComicScrapingScrapeMetadata) =>
        action.payload
    ),
    switchMap(action =>
      this.comic_service
        .scrape_and_save_comic_details(
          action.api_key,
          action.comic.id,
          action.issue_id,
          action.skip_cache
        )
        .pipe(
          tap((comic: Comic) => {
            // clear all existing metadata and copy the new metadata
            for (const field of Object.keys(action.comic)) {
              delete action.comic[field];
            }
            Object.assign(action.comic, comic);
          }),
          tap(() =>
            this.message_service.add({
              severity: 'info',
              summary: 'Scrape Comic',
              detail: this.translate.instant(
                'effects.single-comic-scraping.info.details-scraped'
              )
            })
          ),
          map(
            (comic: Comic) =>
              new ScrapingActions.SingleComicScrapingMetadataScraped({
                original: action.comic,
                updated: comic,
                multi_comic_mode: action.multi_comic_mode
              })
          )
        )
    )
  );
}
