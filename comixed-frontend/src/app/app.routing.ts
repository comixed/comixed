/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard, ReaderGuard } from 'app/user';
import { MainPageComponent } from 'app/ui/pages/main-page/main-page.component';
import { ImportPageComponent } from 'app/comic-import/pages/import-page/import-page.component';
import { DuplicatesPageComponent } from 'app/library/pages/duplicates-page/duplicates-page.component';
import { LibraryAdminPageComponent } from 'app/ui/pages/admin/library-admin-page/library-admin-page.component';
import { ReadingListPageComponent } from 'app/ui/pages/reading-lists/reading-list-page/reading-list-page.component';
import { ReadingListsPageComponent } from 'app/ui/pages/reading-lists/reading-lists-page/reading-lists-page.component';

export const routes: Routes = [
  {
    path: 'home',
    component: MainPageComponent
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
    path: 'pages/duplicates',
    component: DuplicatesPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/library',
    component: LibraryAdminPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRouting {}
