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

import { ImportComicsPageComponent } from './pages/import-comics-page/import-comics-page.component';
import { AdminGuard } from '../user';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ProcessingStatusPageComponent } from '@app/comic-files/pages/processing-status-page/processing-status-page.component';

const routes: Routes = [
  {
    path: 'library/import',
    component: ImportComicsPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'library/processing',
    component: ProcessingStatusPageComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComicFileRouting {}
