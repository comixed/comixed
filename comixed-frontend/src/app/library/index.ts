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

import * as fromRouter from '@ngrx/router-store';
import * as fromLibrary from './reducers/library.reducer';
import { LibraryState } from './reducers/library.reducer';
import * as fromSelection from './reducers/selection.reducer';
import { SelectionState } from './reducers/selection.reducer';
import * as fromDupePages from './reducers/duplicate-pages.reducer';
import * as fromCollections from './reducers/collection.reducer';
import { Params } from '@angular/router';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { DuplicatePagesState } from 'app/library/reducers/duplicate-pages.reducer';
import { CollectionState } from 'app/library/reducers/collection.reducer';

export { LibraryAdaptor } from './adaptors/library.adaptor';
export { SelectionAdaptor } from './adaptors/selection.adaptor';
export { ReadingListAdaptor } from './adaptors/reading-list.adaptor';
export { LibraryDisplayAdaptor } from './adaptors/library-display.adaptor';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AppState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  library: LibraryState;
  selection_state: SelectionState;
  duplicate_pages_state: DuplicatePagesState;
  collection_state: CollectionState;
}

export type State = AppState;

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  library: fromLibrary.reducer,
  selection_state: fromSelection.reducer,
  duplicate_pages_state: fromDupePages.reducer,
  collection_state: fromCollections.reducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
