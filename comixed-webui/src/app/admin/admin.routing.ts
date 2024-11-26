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
import { NgModule } from '@angular/core';
import { AdminGuard } from '@app/user';
import { ConfigurationPageComponent } from '@app/admin/pages/configuration-page/configuration-page.component';
import { BatchProcessListPageComponent } from '@app/admin/pages/batch-process-list-page/batch-process-list-page.component';
import { BatchProcessDetailPageComponent } from '@app/admin/pages/batch-process-detail-page/batch-process-detail-page.component';
import { UserAccountsPageComponent } from '@app/admin/pages/user-accounts-page/user-accounts-page.component';

const routes: Routes = [
  {
    path: 'admin/configuration',
    component: ConfigurationPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/accounts',
    component: UserAccountsPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/processes/:jobId',
    component: BatchProcessDetailPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/processes',
    component: BatchProcessListPageComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRouting {}
