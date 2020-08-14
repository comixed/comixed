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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildDetailsService } from 'app/backend-status/services/build-details.service';
import { BuildDetailsPageComponent } from './pages/build-details-page/build-details-page.component';
import { BackendStatusRoutingModule } from 'app/backend-status/backend-status-routing.module';
import { BuildDetailsAdaptor } from 'app/backend-status/adaptors/build-details.adaptor';
import { StoreModule } from '@ngrx/store';
import * as fromBuildDetails from './reducers/build-details.reducer';
import * as fromTaskAuditLog from './reducers/task-audit-log.reducer';
import * as fromClearTaskAuditLog from './reducers/clear-task-audit-log.reducer';
import { EffectsModule } from '@ngrx/effects';
import { BuildDetailsEffects } from 'app/backend-status/effects/build-details.effects';
import { TranslateModule } from '@ngx-translate/core';
import { TaskAuditLogEffects } from 'app/backend-status/effects/task-audit-log.effects';
import { TaskAuditLogPageComponent } from './pages/task-audit-log-page/task-audit-log-page.component';
import { TaskAuditLogAdaptor } from 'app/backend-status/adaptors/task-audit-log.adaptor';
import { TableModule } from 'primeng/table';
import { ScrollPanelModule } from 'primeng/primeng';
import { CoreModule } from 'app/core/core.module';
import { CLEAR_TASK_AUDIT_LOG_FEATURE_KEY } from 'app/backend-status/reducers/clear-task-audit-log.reducer';
import { ClearTaskAuditLogEffects } from 'app/backend-status/effects/clear-task-audit-log.effects';
import { ToolbarModule, TooltipModule } from 'primeng/primeng';

@NgModule({
  declarations: [BuildDetailsPageComponent, TaskAuditLogPageComponent],
  imports: [
    CommonModule,
    CoreModule,
    BackendStatusRoutingModule,
    TranslateModule.forRoot(),
    StoreModule.forFeature(
      fromBuildDetails.BUILD_DETAILS_FEATURE_KEY,
      fromBuildDetails.reducer
    ),
    StoreModule.forFeature(
      fromTaskAuditLog.TASK_AUDIT_LOG_FEATURE_KEY,
      fromTaskAuditLog.reducer
    ),
    StoreModule.forFeature(
      CLEAR_TASK_AUDIT_LOG_FEATURE_KEY,
      fromClearTaskAuditLog.reducer
    ),
    EffectsModule.forFeature([
      BuildDetailsEffects,
      TaskAuditLogEffects,
      ClearTaskAuditLogEffects
    ]),
    TableModule,
    ToolbarModule,
    ScrollPanelModule,
    TooltipModule
  ],
  exports: [CommonModule, CoreModule],
  providers: [BuildDetailsService, BuildDetailsAdaptor, TaskAuditLogAdaptor]
})
export class BackendStatusModule {}
