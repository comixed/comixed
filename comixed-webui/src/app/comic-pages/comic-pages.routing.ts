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
import { BlockedHashListPageComponent } from './pages/blocked-hash-list-page/blocked-hash-list-page.component';
import { AdminGuard } from '../user';
import { NgModule } from '@angular/core';
import { BlockedHashDetailPageComponent } from '@app/comic-pages/pages/blocked-hash-detail-page/blocked-hash-detail-page.component';
import { DeletedListPageComponent } from '@app/comic-pages/pages/deleted-list-page/deleted-list-page.component';

const routes: Routes = [
  {
    path: 'library/pages/blocked',
    component: BlockedHashListPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'library/pages/deleted',
    component: DeletedListPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'library/pages/blocked/:hash',
    component: BlockedHashDetailPageComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComicPagesRouting {}
