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

import * as fromRouter from '@ngrx/router-store';
import * as fromLibrary from './reducers/library.reducer';
import { LibraryState } from './models/library-state';
import { Params } from '@angular/router';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';

export { LibraryState } from './models/library-state';
export { LibraryAdaptor } from './adaptors/library.adaptor';
export { Comic } from './models/comic';
export { ScanType } from './models/scan-type';
export { ComicFormat } from './models/comic-format';
export { ComicCredit } from './models/comic-credit';
export { ComicCollectionEntry } from './models/comic-collection-entry';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AppState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  library: LibraryState;
}

export type State = AppState;

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  library: fromLibrary.reducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];

// testing fixtures
export {
  COMIC_1,
  COMIC_2,
  COMIC_3,
  COMIC_4,
  COMIC_5
} from './models/comic.fixtures';
export {
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3,
  SCAN_TYPE_4,
  SCAN_TYPE_5
} from './models/scan-type.fixtures';
export {
  FORMAT_1,
  FORMAT_2,
  FORMAT_3,
  FORMAT_4,
  FORMAT_5
} from './models/comic-format.fixtures';
