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
import { ImportComicsComponent } from './pages/import-comics/import-comics.component';
import { ComicDetailsComponent } from '@app/library/pages/comic-details/comic-details.component';
import { AdminGuard, ReaderGuard } from '@app/user';
import { AllComicsComponent } from '@app/library/pages/all-comics/all-comics.component';

const routes: Routes = [
  {
    path: 'admin/import',
    component: ImportComicsComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'library/:comicId',
    component: ComicDetailsComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'library',
    component: AllComicsComponent,
    canActivate: [ReaderGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LibraryRouting {}
