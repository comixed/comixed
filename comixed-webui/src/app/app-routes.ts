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

import { Routes } from '@angular/router';
import { DashboardPage } from '@app/dashboard/pages/dashboard-page/dashboard-page';
import { PublisherListPage } from '@app/collections/pages/publisher-list-page/publisher-list-page';
import { LoginPage } from '@app/account/pages/login-page/login-page';
import { SeriesListPage } from '@app/collections/pages/series-list-page/series-list-page';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/dashboard' },
  { path: 'login', component: LoginPage },
  { path: 'dashboard', component: DashboardPage },
  { path: 'collections/publishers', component: PublisherListPage },
  { path: 'collections/series', component: SeriesListPage }
];
