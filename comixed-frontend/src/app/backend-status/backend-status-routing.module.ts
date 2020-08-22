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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

import { RouterModule, Routes } from '@angular/router';
import { BuildDetailsPageComponent } from 'app/backend-status/pages/build-details-page/build-details-page.component';
import { NgModule } from '@angular/core';
import { TaskAuditLogPageComponent } from 'app/backend-status/pages/task-audit-log-page/task-audit-log-page.component';
import { AdminGuard } from 'app/user';
import { RestAuditLogPageComponent } from 'app/backend-status/pages/rest-audit-log-page/rest-audit-log-page.component';

const routes: Routes = [
  {
    path: 'build/details',
    component: BuildDetailsPageComponent
  },
  {
    path: 'admin/tasks/logs',
    component: TaskAuditLogPageComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin/logs/rest',
    component: RestAuditLogPageComponent,
    canActivate: [AdminGuard]
  }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class BackendStatusRoutingModule {}
