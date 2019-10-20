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
import * as fromImport from './reducers/import.reducer';
import * as fromSelection from './reducers/selection.reducer';
import * as fromFilters from './reducers/filters.reducer';
import { LibraryState } from './models/library-state';
import { ImportState } from './models/import-state';
import { Params } from '@angular/router';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { SelectionState } from 'app/library/models/selection-state';
import { FilterState } from 'app/library/reducers/filters.reducer';

export { LibraryDisplayAdaptor } from './adaptors/library-display.adaptor';
export { LibraryAdaptor } from './adaptors/library.adaptor';
export { ImportAdaptor } from './adaptors/import.adaptor';
export { SelectionAdaptor } from './adaptors/selection.adaptor';
export { ReadingListAdaptor } from './adaptors/reading-list.adaptor';
export { Comic } from '../comics/models/comic';
export { ScanType } from '../comics/models/scan-type';
export { ComicFormat } from '../comics/models/comic-format';
export { ComicCredit } from '../comics/models/comic-credit';
export { ComicCollectionEntry } from './models/comic-collection-entry';
export { ComicFile } from './models/comic-file';
export { ReadingList } from './models/reading-list/reading-list';
export { ReadingListEntry } from './models/reading-list/reading-list-entry';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AppState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  library: LibraryState;
  import: ImportState;
  selection: SelectionState;
  filters_state: FilterState;
}

export type State = AppState;

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  library: fromLibrary.reducer,
  import: fromImport.reducer,
  selection: fromSelection.reducer,
  filters_state: fromFilters.reducer
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
} from '../comics/models/comic.fixtures';
export {
  SCAN_TYPE_1,
  SCAN_TYPE_2,
  SCAN_TYPE_3,
  SCAN_TYPE_4,
  SCAN_TYPE_5
} from '../comics/models/scan-type.fixtures';
export {
  FORMAT_1,
  FORMAT_2,
  FORMAT_3,
  FORMAT_4,
  FORMAT_5
} from '../comics/models/comic-format.fixtures';
export {
  COMIC_FILE_1,
  COMIC_FILE_2,
  COMIC_FILE_3,
  COMIC_FILE_4
} from './models/comic-file.fixtures';
