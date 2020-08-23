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
import * as fromReadingLists from './reducers/reading-list.reducer';
import { ReadingListState } from './reducers/reading-list.reducer';
import { Params } from '@angular/router';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { DuplicatePagesState } from 'app/library/reducers/duplicate-pages.reducer';
import * as fromPublisher from 'app/library/reducers/publisher.reducer';
import { PublisherState } from 'app/library/reducers/publisher.reducer';
import * as fromPlugin from 'app/library/reducers/plugin.reducer';
import { PluginState } from 'app/library/reducers/plugin.reducer';
import * as fromMoveComics from 'app/library/reducers/move-comics.reducer';
import {
  MOVE_COMICS_FEATURE_KEY,
  MoveComicsState
} from 'app/library/reducers/move-comics.reducer';

export { LibraryAdaptor } from './adaptors/library.adaptor';
export { SelectionAdaptor } from './adaptors/selection.adaptor';
export { ReadingListAdaptor } from './adaptors/reading-list.adaptor';
export {
  LibraryDisplayAdaptor
} from '../user/adaptors/library-display.adaptor';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AppState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  library_state: LibraryState;
  selection_state: SelectionState;
  duplicate_pages_state: DuplicatePagesState;
  reading_list_state: ReadingListState;
  publisher_state: PublisherState;
  plugin_state: PluginState;
  [MOVE_COMICS_FEATURE_KEY]: MoveComicsState;
}

export type State = AppState;

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  library_state: fromLibrary.reducer,
  selection_state: fromSelection.reducer,
  duplicate_pages_state: fromDupePages.reducer,
  reading_list_state: fromReadingLists.reducer,
  publisher_state: fromPublisher.reducer,
  plugin_state: fromPlugin.reducer,
  [MOVE_COMICS_FEATURE_KEY]: fromMoveComics.reducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
