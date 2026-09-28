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
import { ComicDetailPage } from '@app/library/pages/comic-detail-page/comic-detail-page';
import { readerGuard } from '@app/account/guards/reader-guard';
import { adminGuard } from '@app/account/guards/admin-guard';
import { PublisherListPage } from '@app/library/pages/publisher-list-page/publisher-list-page';
import { SeriesListPage } from '@app/library/pages/series-list-page/series-list-page';
import { SeriesDetailPage } from '@app/library/pages/series-detail-page/series-detail-page';
import { TagListPage } from '@app/library/pages/tag-list-page/tag-list-page';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard' },
  { path: 'accounts/initial', component: InitialAccountPage },
  { path: 'login', component: LoginPage },
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
    path: 'library/publishers/:publisherName/series/:seriesName/:volume',
    component: SeriesDetailPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/all',
    component: ComicListPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/read',
    component: ComicListPage,
    data: { readonly: true },
    canActivate: [readerGuard]
  },
  {
    path: 'library/unscraped',
    component: ComicListPage,
    data: { unscraped: true },
    canActivate: [readerGuard]
  },
  {
    path: 'library/duplicates',
    component: ComicListPage,
    data: { duplicates: true },
    canActivate: [readerGuard]
  },
  {
    path: 'library/deleted',
    component: ComicListPage,
    data: { deleted: true },
    canActivate: [readerGuard]
  },
  {
    path: 'library/:tagType',
    component: TagListPage,
    canActivate: [readerGuard]
  },
  {
    path: 'library/comics/:comicId',
    component: ComicDetailPage,
    canActivate: [readerGuard]
  }
];
