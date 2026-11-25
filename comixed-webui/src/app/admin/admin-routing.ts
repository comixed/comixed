/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ComicListPage } from '@app/library/pages/comic-list-page/comic-list-page';
import { DuplicateComicPage } from '@app/admin/pages/duplicate-comic-page/duplicate-comic-page';
import { BatchProcessListPage } from '@app/admin/pages/batch-process-list-page/batch-process-list-page';
import { adminGuard } from '@app/account/guards/admin-guard';
import { LibrarySettingsPage } from '@app/admin/pages/library-settings-page/library-settings-page';
import { MetadataSettingsPage } from '@app/admin/pages/metadata-settings-page/metadata-settings-page';
import { MetadataSourcePage } from '@app/admin/pages/metadata-source-page/metadata-source-page';
import { DuplicateComicListPage } from '@app/admin/pages/duplicate-comic-list-page/duplicate-comic-list-page';
import { MultiComicScrapingPage } from '@app/admin/pages/multi-comic-scraping-page/multi-comic-scraping-page';
import { ImportComicsPage } from '@app/admin/pages/import-comics-page/import-comics-page';
import { FilenameScrapingRulesPage } from '@app/admin/pages/filename-scraping-rules-page/filename-scraping-rules-page';

const routes: Routes = [
  {
    path: 'admin/library/import',
    component: ImportComicsPage,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/library/unscraped',
    component: ComicListPage,
    data: { unscrapedComics: true },
    canActivate: [adminGuard]
  },
  {
    path: 'admin/library/changed',
    component: ComicListPage,
    data: { changedComics: true },
    canActivate: [adminGuard]
  },
  {
    path: 'admin/library/duplicates',
    component: DuplicateComicListPage,
    data: { duplicateComics: true },
    canActivate: [adminGuard]
  },
  {
    path: 'admin/library/duplicates/:publisherName/:seriesName/:volume/:issueNumber/:coverDate',
    component: DuplicateComicPage,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/library/deleted',
    component: ComicListPage,
    data: { deletedComics: true },
    canActivate: [adminGuard]
  },
  {
    path: 'admin/scraping/multi',
    component: MultiComicScrapingPage,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/processes',
    component: BatchProcessListPage,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/settings/library',
    component: LibrarySettingsPage,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/settings/metadata',
    component: MetadataSettingsPage,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/settings/metadata/filenames',
    component: FilenameScrapingRulesPage,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/settings/metadata/:sourceName',
    component: MetadataSourcePage,
    canActivate: [adminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRouting {}
