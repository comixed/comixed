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
import * as fromComics from './reducers/comic.reducer';
import { ComicState } from './reducers/comic.reducer';
import * as fromScraping from './reducers/scraping.reducer';
import { ScrapingState } from './reducers/scraping.reducer';
import { environment } from '../../environments/environment';

export { Comic } from './models/comic';
export { ComicFormat } from './models/comic-format';
export { ScanType } from './models/scan-type';
export { ComicCredit } from './models/comic-credit';
export { Page } from './models/page';
export { Volume } from './models/volume';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AppState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  comic: ComicState;
  scraping_state: ScrapingState;
}

export type State = AppState;

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  comic: fromComics.reducer,
  scraping_state: fromScraping.reducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
