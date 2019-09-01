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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AccountPageComponent } from 'app/user/pages/account-page/account-page.component';
import { ReaderGuard } from 'app/user/guards/reader.guard';
import { UsersPageComponent } from 'app/user/pages/users-page/users-page.component';
import { AdminGuard } from 'app/user/guards/admin.guard';

const routes: Routes = [
  {
    path: 'account',
    component: AccountPageComponent,
    canActivate: [ReaderGuard]
  },
  {
    path: 'admin/users',
    component: UsersPageComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class UserRoutingModule {}
