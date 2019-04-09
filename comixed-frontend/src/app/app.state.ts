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

import { User } from 'app/models/user/user';
import { Importing } from 'app/models/import/importing';
import { Library } from 'app/models/actions/library';
import { LibraryFilter } from 'app/models/actions/library-filter';
import { LibraryDisplay } from 'app/models/state/library-display';
import { SingleComicScraping } from 'app/models/scraping/single-comic-scraping';
import { MultipleComicsScraping } from 'app/models/scraping/multiple-comics-scraping';
import { Duplicates } from 'app/models/state/duplicates';
import { UserAdmin } from 'app/models/actions/user-admin';

export interface AppState {
  readonly user: User;
  readonly importing: Importing;
  readonly library: Library;
  readonly library_filter: LibraryFilter;
  readonly library_display: LibraryDisplay;
  readonly single_comic_scraping: SingleComicScraping;
  readonly multiple_comic_scraping: MultipleComicsScraping;
  readonly duplicates: Duplicates;
  readonly user_admin: UserAdmin;
}
