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
import { readerGuard } from '@app/account/guards/reader-guard';
import { PublisherListPage } from '@app/library/pages/publisher-list-page/publisher-list-page';
import { SeriesListPage } from '@app/library/pages/series-list-page/series-list-page';
import { PublisherComicListPage } from '@app/library/pages/publisher-comic-list-page/publisher-comic-list-page.component';
import { PublisherSeriesListPage } from '@app/library/pages/publisher-series-list-page/publisher-series-list-page';
import { SeriesComicListPage } from '@app/library/pages/series-comic-list-page/series-comic-list-page';
import { ComicListPage } from '@app/library/pages/comic-list-page/comic-list-page';
import { ComicPage } from '@app/library/pages/comic-page/comic-page';
import { TagListPage } from '@app/library/pages/tag-list-page/tag-list-page';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LibraryRouting {}
