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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRouting } from './admin.routing';
import { StoreModule } from '@ngrx/store';
import {
  reducer as webAuditLogReducer,
  WEB_AUDIT_LOG_FEATURE_KEY
} from '@app/admin/reducers/web-audit-log.reducer';
import { EffectsModule } from '@ngrx/effects';
import { WebAuditLogEffects } from '@app/admin/effects/web-audit-log.effects';
import { WebAuditLogPageComponent } from './pages/web-audit-log-page/web-audit-log-page.component';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@app/core/core.module';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TaskAuditLogPageComponent } from './pages/task-audit-log-page/task-audit-log-page.component';
import {
  reducer as taskAuditLogReducer,
  TASK_AUDIT_LOG_FEATURE_KEY
} from '@app/admin/reducers/task-audit-log.reducer';
import { TaskAuditLogEffects } from '@app/admin/effects/task-audit-log.effects';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [WebAuditLogPageComponent, TaskAuditLogPageComponent],
  imports: [
    CommonModule,
    CoreModule,
    AdminRouting,
    TranslateModule.forRoot(),
    StoreModule.forFeature(TASK_AUDIT_LOG_FEATURE_KEY, taskAuditLogReducer),
    StoreModule.forFeature(WEB_AUDIT_LOG_FEATURE_KEY, webAuditLogReducer),
    EffectsModule.forFeature([TaskAuditLogEffects, WebAuditLogEffects]),
    MatTableModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatSidenavModule,
    MatCardModule
  ],
  exports: [CommonModule, CoreModule]
})
export class AdminModule {}
