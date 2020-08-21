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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { Params } from '@angular/router';
import * as fromRouter from '@ngrx/router-store';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import * as fromComics from 'app/comics/reducers/comic.reducer';
import { ComicState } from 'app/comics/reducers/comic.reducer';
import { environment } from '../../environments/environment';
import * as fromScrapingIssue from 'app/comics/reducers/scraping-issue.reducer';
import {
  SCRAPING_ISSUE_FEATURE_KEY,
  ScrapingIssueState
} from 'app/comics/reducers/scraping-issue.reducer';
import * as fromScrapingVolumes from 'app/comics/reducers/scraping-volumes.reducer';
import {
  SCRAPING_VOLUMES_FEATURE_KEY,
  ScrapingVolumesState
} from 'app/comics/reducers/scraping-volumes.reducer';
import * as fromScrapeComic from 'app/comics/reducers/scrape-comic.reducer';
import {
  SCRAPE_COMIC_FEATURE_KEY,
  ScrapeComicState
} from 'app/comics/reducers/scrape-comic.reducer';
import * as fromScrapeMultipleComics from 'app/comics/reducers/scrape-multiple-comic.reducer';
import {
  SCRAPE_MULTIPLE_COMICS_STATE,
  ScrapeMultipleComicsState
} from 'app/comics/reducers/scrape-multiple-comic.reducer';

export { Comic } from 'app/comics/models/comic';
export { ComicFormat } from 'app/comics/models/comic-format';
export { ScanType } from 'app/comics/models/scan-type';
export { ComicCredit } from 'app/comics/models/comic-credit';
export { Page } from 'app/comics/models/page';
export { PageType } from 'app/comics/models/page-type';
export { Volume } from 'app/comics/models/volume';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AppState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  comic: ComicState;
  [SCRAPING_VOLUMES_FEATURE_KEY]: ScrapingVolumesState;
  [SCRAPING_ISSUE_FEATURE_KEY]: ScrapingIssueState;
  [SCRAPE_COMIC_FEATURE_KEY]: ScrapeComicState;
  [SCRAPE_MULTIPLE_COMICS_STATE]: ScrapeMultipleComicsState;
}

export type State = AppState;

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  comic: fromComics.reducer,
  [SCRAPING_VOLUMES_FEATURE_KEY]: fromScrapingVolumes.reducer,
  [SCRAPING_ISSUE_FEATURE_KEY]: fromScrapingIssue.reducer,
  [SCRAPE_COMIC_FEATURE_KEY]: fromScrapeComic.reducer,
  [SCRAPE_MULTIPLE_COMICS_STATE]: fromScrapeMultipleComics.reducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
