/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project
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
import { InitialAccountPage } from '@app/account/pages/initial-account-page/initial-account-page';
import { LoginPage } from '@app/account/pages/login-page/login-page';

const routes: Routes = [
  { path: 'accounts/initial', component: InitialAccountPage },
  { path: 'login', component: LoginPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRouting {}
