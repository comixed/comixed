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

import { importingReducer } from 'app/reducers/importing.reducer';
import { libraryFilterReducer } from 'app/reducers/library-filter.reducer';
import { singleComicScrapingReducer } from 'app/reducers/single-comic-scraping.reducer';
import { multipleComicsScrapingReducer } from 'app/reducers/multiple-comics-scraping.reducer';
import { duplicatesReducer } from 'app/reducers/duplicates.reducer';
import { userAdminReducer } from 'app/reducers/user-admin.reducer';
import { readingListReducer } from 'app/reducers/reading-list.reducer';
import { selectionReducer } from 'app/reducers/selection.reducer';

export const REDUCERS = {
  import_state: importingReducer,
  library_filter: libraryFilterReducer,
  single_comic_scraping: singleComicScrapingReducer,
  multiple_comic_scraping: multipleComicsScrapingReducer,
  duplicates: duplicatesReducer,
  user_admin: userAdminReducer,
  reading_lists: readingListReducer,
  selections: selectionReducer
};
