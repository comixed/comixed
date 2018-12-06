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
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from './admin.guard';
import { ReaderGuard } from './reader.guard';
import { MainPageComponent } from './ui/pages/main-page/main-page.component';
import { AccountPageComponent } from './ui/pages/account/account-page/account-page.component';
import { LibraryPageComponent } from './ui/pages/library/library-page/library-page.component';
import { ComicDetailsComponent } from './ui/pages/comic/comic-details/comic-details.component';
import { ImportPageComponent } from './ui/pages/library/import-page/import-page.component';
import { DuplicatesPageComponent } from './ui/pages/library/duplicates-page/duplicates-page.component';

const routes: Routes = [
  { path: 'home', component: MainPageComponent },
  { path: 'account', component: AccountPageComponent, canActivate: [ReaderGuard] },
  { path: 'duplicates', component: DuplicatesPageComponent, canActivate: [AdminGuard] },
  { path: 'comics', component: LibraryPageComponent, canActivate: [ReaderGuard] },
  { path: 'comics/:id', component: ComicDetailsComponent, canActivate: [ReaderGuard] },
  { path: 'import', component: ImportPageComponent, canActivate: [AdminGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
