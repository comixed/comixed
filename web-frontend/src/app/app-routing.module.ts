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

import { MainPageComponent } from './main-page/main-page.component';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';
import { DuplicatePageListComponent } from './comic/duplicate-page-list/duplicate-page-list.component';
import { LibraryPageComponent } from './ui/pages/library/library-page/library-page.component';
import { ImportComicListComponent } from './comic/import-comic-list/import-comic-list.component';
import { ComicDetailsComponent } from './comic/details/comic-details.component';

const routes: Routes = [
  { path: 'home', component: MainPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'account', component: AccountComponent },
  { path: 'duplicates', component: DuplicatePageListComponent },
  { path: 'comics', component: LibraryPageComponent },
  { path: 'comics/:id', component: ComicDetailsComponent },
  { path: 'import', component: ImportComicListComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
