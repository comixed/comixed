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
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import * as ScrapingActions from '../actions/single-comic-scraping.actions';
import * as LibraryActions from '../actions/library.actions';
import { ComicService } from '../services/comic.service';
import { AlertService } from '../services/alert.service';
import { UserService } from '../services/user.service';
import { Comic } from '../models/comics/comic';
import { Volume } from '../models/comics/volume';
import { Issue } from '../models/scraping/issue';

@Injectable()
export class SingleComicScrapingEffects {

  constructor(
    private actions$: Actions,
    private comic_service: ComicService,
    private alert_service: AlertService,
    private user_service: UserService,
  ) { }

  @Effect()
  single_comic_scraping_fetch_volumes$: Observable<Action> = this.actions$
    .ofType<ScrapingActions.SingleComicScrapingFetchVolumes>(ScrapingActions.SINGLE_COMIC_SCRAPING_FETCH_VOLUMES)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.fetch_candidates_for(
        action.api_key,
        action.series,
        action.volume,
        action.issue_number,
        action.skip_cache,
      )
        .do((volumes: Array<Volume>) => this.alert_service.show_info_message(`Retrieved ${volumes.length} volumes...`))
        .map((volumes: Array<Volume>) => new ScrapingActions.SingleComicScrapingFoundVolumes(volumes))
    );

  @Effect()
  single_comic_scraping_save_local_changes$: Observable<Action> = this.actions$
    .ofType<ScrapingActions.SingleComicScrapingSaveLocalChanges>(ScrapingActions.SINGLE_COMIC_SCRAPING_SAVE_LOCAL_CHANGES)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.save_changes_to_comic(
        action.comic,
        action.series,
        action.volume,
        action.issue_number,
      )
        .map(() => new ScrapingActions.SingleComicScrapingSetup({
          api_key: action.api_key,
          comic: action.comic,
          series: action.series,
          volume: action.volume,
          issue_number: action.issue_number,
        })));

  @Effect()
  single_comic_scraping_set_current_volume$: Observable<Action> = this.actions$
    .ofType<ScrapingActions.SingleComicScrapingSetCurrentVolume>(ScrapingActions.SINGLE_COMIC_SCRAPING_SET_CURRENT_VOLUME)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.scrape_comic_details_for(
        action.api_key,
        action.volume.id,
        action.issue_number,
        action.skip_cache,
      )
        .map((issue: Issue) => new ScrapingActions.SingleComicScrapingFoundIssue({
          issue: issue,
          volume_id: action.volume.id,
        })
        ));

  @Effect()
  single_comic_scraping_fetch_issues$: Observable<Action> = this.actions$
    .ofType<ScrapingActions.SingleComicScrapingFetchIssue>(ScrapingActions.SINGLE_COMIC_SCRAPING_FETCH_ISSUES)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.scrape_comic_details_for(
        action.api_key,
        action.volume_id,
        action.issue_number,
        action.skip_cache,
      )
        .map((issue: Issue) => new ScrapingActions.SingleComicScrapingFoundIssue({
          issue: issue,
          volume_id: action.volume_id,
        }))
    );

  @Effect()
  single_comic_scraping_scrape_metadata$: Observable<Action> = this.actions$
    .ofType<ScrapingActions.SingleComicScrapingScrapeMetadata>(ScrapingActions.SINGLE_COMIC_SCRAPING_SCRAPE_METADATA)
    .map(action => action.payload)
    .switchMap(action =>
      this.comic_service.scrape_and_save_comic_details(
        action.api_key,
        action.comic.id,
        action.issue_id,
        action.skip_cache,
      )
        .do((comic: Comic) => Object.assign(action.comic, comic))
        .do(() => this.alert_service.show_info_message('Comic details scraped...'))
        .map((comic: Comic) => new ScrapingActions.SingleComicScrapingMetadataScraped({
          comic: comic,
          multi_comic_mode: action.multi_comic_mode,
        })));
}
