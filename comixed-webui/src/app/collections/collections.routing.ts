/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
import { CollectionListComponent } from '@app/collections/pages/collection-list/collection-list.component';
import { ReaderGuard } from '@app/user';
import { CollectionDetailComponent } from '@app/collections/pages/collection-detail/collection-detail.component';
import { SeriesListPageComponent } from '@app/collections/pages/series-list-page/series-list-page.component';
import { SeriesDetailPageComponent } from '@app/collections/pages/series-detail-page/series-detail-page.component';
import { PublisherListPageComponent } from '@app/collections/pages/publisher-list-page/publisher-list-page.component';
import { PublisherDetailPageComponent } from '@app/collections/pages/publisher-detail-page/publisher-detail-page.component';

const routes: Routes = [
  {
    path: 'library/collections/publishers',
    component: PublisherListPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'library/collections/publishers/:name',
    component: PublisherDetailPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'library/collections/series',
    component: SeriesListPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'library/collections/publishers/:publisher/series/:name/volumes/:volume',
    component: SeriesDetailPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'library/collections/:collectionType',
    component: CollectionListComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'library/collections/:collectionType/:collectionName',
    component: CollectionDetailComponent,
    canActivate: [ReaderGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollectionsRouting {}
