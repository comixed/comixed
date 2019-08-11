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

import { ImportState } from 'app/models/state/import-state';
import { LibraryState } from 'app/models/state/library-state';
import { LibraryFilter } from 'app/models/actions/library-filter';
import { SingleComicScraping } from 'app/models/scraping/single-comic-scraping';
import { MultipleComicsScraping } from 'app/models/scraping/multiple-comics-scraping';
import { Duplicates } from 'app/models/state/duplicates';
import { UserAdmin } from 'app/models/actions/user-admin';
import { ReadingListState } from 'app/models/state/reading-list-state';
import { SelectionState } from 'app/models/state/selection-state';
import { AuthenticationState } from 'app/user';

export interface AppState {
  readonly auth_state: AuthenticationState;
  readonly import_state: ImportState;
  readonly library: LibraryState;
  readonly library_filter: LibraryFilter;
  readonly single_comic_scraping: SingleComicScraping;
  readonly multiple_comic_scraping: MultipleComicsScraping;
  readonly duplicates: Duplicates;
  readonly user_admin: UserAdmin;
  readonly reading_list: ReadingListState;
  readonly selections: SelectionState;
}
