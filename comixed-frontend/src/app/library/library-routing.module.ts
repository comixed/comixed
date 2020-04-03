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
 * along with this program. If not, see <http:/www.gnu.org/licenses>
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CollectionDetailsPageComponent } from 'app/library/pages/collection-details-page/collection-details-page.component';
import { CollectionPageComponent } from 'app/library/pages/collection-page/collection-page.component';
import { DuplicatesPageComponent } from 'app/library/pages/duplicates-page/duplicates-page.component';
import { LibraryPageComponent } from 'app/library/pages/library-page/library-page.component';
import { MissingComicsPageComponent } from 'app/library/pages/missing-comics-page/missing-comics-page.component';
import { MultiComicScrapingPageComponent } from 'app/library/pages/multi-comic-scraping-page/multi-comic-scraping-page.component';
import { ReadingListPageComponent } from 'app/library/pages/reading-list-page/reading-list-page.component';
import { ReadingListsPageComponent } from 'app/library/pages/reading-lists-page/reading-lists-page.component';
import { AdminGuard, ReaderGuard } from 'app/user';
import { LibraryAdminPageComponent } from 'app/library/pages/library-admin-page/library-admin-page.component';

const routes: Routes = [
  {
    path: 'comics',
    component: LibraryPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'commics/:type/:name',
    component: LibraryPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'collections/:collectionType/:collectionName',
    component: CollectionDetailsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'collections/:collectionType',
    component: CollectionPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'comics/missing',
    component: MissingComicsPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'scraping',
    component: MultiComicScrapingPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'lists/new',
    component: ReadingListPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'lists/:id',
    component: ReadingListPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'lists',
    component: ReadingListsPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'duplicates',
    component: DuplicatesPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/library',
    component: LibraryAdminPageComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class LibraryRoutingModule {}
