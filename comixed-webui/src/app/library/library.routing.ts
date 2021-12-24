/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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
import { AdminGuard, ReaderGuard } from '@app/user';
import { LibraryPageComponent } from '@app/library/pages/library-page/library-page.component';
import { ScrapingPageComponent } from '@app/library/pages/scraping-page/scraping-page.component';
import { DuplicatePageListPageComponent } from '@app/library/pages/duplicate-page-list-page/duplicate-page-list-page.component';
import { DuplicatePageDetailPageComponent } from '@app/library/pages/duplicate-page-detail-page/duplicate-page-detail-page.component';

const routes: Routes = [
  {
    path: 'library/all',
    component: LibraryPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'library/unprocessed',
    component: LibraryPageComponent,
    canActivate: [AdminGuard],
    data: { unprocessed: true }
  },
  {
    path: 'library/unread',
    component: LibraryPageComponent,
    canActivate: [ReaderGuard],
    data: { unread: true }
  },
  {
    path: 'library/unscraped',
    component: LibraryPageComponent,
    canActivate: [AdminGuard],
    data: { unscraped: true }
  },
  {
    path: 'library/changed',
    component: LibraryPageComponent,
    canActivate: [AdminGuard],
    data: { changed: true }
  },
  {
    path: 'library/deleted',
    component: LibraryPageComponent,
    canActivate: [AdminGuard],
    data: { deleted: true }
  },
  {
    path: 'library/scrape',
    component: ScrapingPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'library/pages/duplicates',
    component: DuplicatePageListPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'library/pages/duplicates/:hash',
    component: DuplicatePageDetailPageComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LibraryRouting {}
