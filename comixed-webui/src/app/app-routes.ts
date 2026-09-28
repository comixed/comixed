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

import { Routes } from '@angular/router';
import { DashboardPage } from '@app/dashboard/pages/dashboard-page/dashboard-page';
import { LoginPage } from '@app/account/pages/login-page/login-page';
import { ComicListPage } from '@app/library/pages/comic-list-page/comic-list-page';
import { ImportComicsPage } from '@app/library/pages/import-comics-page/import-comics-page';
import { InitialAccountPage } from '@app/account/pages/initial-account-page/initial-account-page';
import { ComicPage } from '@app/library/pages/comic-page/comic-page';
import { readerGuard } from '@app/account/guards/reader-guard';
import { adminGuard } from '@app/account/guards/admin-guard';
import { PublisherListPage } from '@app/library/pages/publisher-list-page/publisher-list-page';
import { SeriesListPage } from '@app/library/pages/series-list-page/series-list-page';
import { TagListPage } from '@app/library/pages/tag-list-page/tag-list-page';
import { PublisherSeriesListPage } from '@app/library/pages/publisher-series-list-page/publisher-series-list-page';
import { PublisherComicListPage } from '@app/library/pages/publisher-comic-list-page/publisher-comic-list-page.component';
import { BatchProcessListPage } from '@app/admin/pages/batch-process-list-page/batch-process-list-page';
import { SeriesComicListPage } from '@app/library/pages/series-comic-list-page/series-comic-list-page';
import { LibrarySettingsPage } from '@app/admin/pages/library-settings-page/library-settings-page';
import { MetadataSettingsPage } from '@app/admin/pages/metadata-settings-page/metadata-settings-page';
import { MetadataSourcePage } from '@app/admin/pages/metadata-source-page/metadata-source-page';
import { DuplicateComicListPage } from '@app/admin/pages/duplicate-comic-list-page/duplicate-comic-list-page';
import { DuplicateComicPage } from '@app/admin/pages/duplicate-comic-page/duplicate-comic-page';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard' },
  { path: 'accounts/initial', component: InitialAccountPage },
  { path: 'login', component: LoginPage },
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
    path: 'admin/settings/metadata/:sourceName',
    component: MetadataSourcePage,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/library/unscraped',
    component: ComicListPage,
    data: { unscrapedComics: true },
    canActivate: [readerGuard]
  },
  {
    path: 'admin/library/changed',
    component: ComicListPage,
    data: { changedComics: true },
    canActivate: [readerGuard]
  },
  {
    path: 'admin/library/duplicates',
    component: DuplicateComicListPage,
    data: { duplicateComics: true },
    canActivate: [readerGuard]
  },
  {
    path: 'admin/library/duplicates/:publisherName/:seriesName/:volume/:issueNumber/:coverDate',
    component: DuplicateComicPage,
    canActivate: [readerGuard]
  },
  {
    path: 'admin/library/deleted',
    component: ComicListPage,
    data: { deletedComics: true },
    canActivate: [readerGuard]
  },
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/import',
    component: ImportComicsPage,
    canActivate: [adminGuard]
  },
  {
    path: 'library/publishers',
    component: PublisherListPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/series',
    component: SeriesListPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/publishers/:publisherName/comics',
    component: PublisherComicListPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/publishers/:publisherName/series',
    component: PublisherSeriesListPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/publishers/:publisherName/series/:seriesName/:volume',
    component: SeriesComicListPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/comics/all',
    component: ComicListPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/comics/selected',
    component: ComicListPage,
    data: { selectedComics: true },
    canActivate: [readerGuard]
  },
  {
    path: 'library/comics/read',
    component: ComicListPage,
    data: { readComics: true },
    canActivate: [readerGuard]
  },
  {
    path: 'library/comics/:comicId',
    component: ComicPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/:tagType',
    component: TagListPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/:tagType/:tagValue',
    component: ComicListPage,
    canActivate: [readerGuard]
  }
];
