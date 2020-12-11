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

import { Params } from '@angular/router';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import {
  COMIC_IMPORT_FEATURE_KEY,
  ComicImportState,
  reducer as libraryImportReducer
} from './reducers/comic-import.reducer';
import { ActionReducerMap } from '@ngrx/store';
import {
  LIBRARY_FEATURE_KEY,
  LibraryState,
  reducer as comicReducer
} from './reducers/library.reducer';

export { Comic } from '@app/library/models/comic';
export { ComicCredit } from '@app/library/models/comic-credit';
export { ComicFile } from '@app/library/models/comic-file';
export { ComicFormat } from '@app/library/models/comic-format';
export { ComicFileEntry } from '@app/library/models/comic-file-entry';
export { FileDetails } from '@app/library/models/file-details';
export { Page } from '@app/library/models/page';
export { PageType } from '@app/library/models/page-type';
export { ReadingList } from '@app/library/models/reading-list';
export { ScanType } from '@app/library/models/scan-type';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface UserModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [COMIC_IMPORT_FEATURE_KEY]: ComicImportState;
  [LIBRARY_FEATURE_KEY]: LibraryState;
}

export type ModuleState = UserModuleState;

export const reducers: ActionReducerMap<UserModuleState> = {
  router: routerReducer,
  [COMIC_IMPORT_FEATURE_KEY]: libraryImportReducer,
  [LIBRARY_FEATURE_KEY]: comicReducer
};
