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
import { StoreModule } from '@ngrx/store';
import * as fromBuildDetails from './reducers/build-details.reducer';
import * as fromClearTaskAuditLog from './reducers/clear-task-audit-log.reducer';
import * as fromLoadTaskAuditLog from './reducers/load-task-audit-log.reducer';
import { EffectsModule } from '@ngrx/effects';
import { BuildDetailsEffects } from 'app/backend-status/effects/build-details.effects';
import { TranslateModule } from '@ngx-translate/core';
import { TaskAuditLogPageComponent } from './pages/task-audit-log-page/task-audit-log-page.component';
import { TableModule } from 'primeng/table';
import {
  ButtonModule,
  DialogModule,
  PanelModule,
  ScrollPanelModule,
  SidebarModule,
  ToolbarModule,
  TooltipModule
} from 'primeng/primeng';
import { CoreModule } from 'app/core/core.module';
import { CLEAR_TASK_AUDIT_LOG_FEATURE_KEY } from 'app/backend-status/reducers/clear-task-audit-log.reducer';
import { ClearTaskAuditLogEffects } from 'app/backend-status/effects/clear-task-audit-log.effects';
import { LOAD_TASK_AUDIT_LOG_FEATURE_KEY } from 'app/backend-status/reducers/load-task-audit-log.reducer';
import { LoadTaskAuditLogEffects } from 'app/backend-status/effects/load-task-audit-log.effects';
import * as fromLoadRestAuditLogEntries from 'app/backend-status/reducers/load-rest-audit-log.reducer';
import { LOAD_REST_AUDIT_LOG_ENTRIES_FEATURE_KEY } from 'app/backend-status/reducers/load-rest-audit-log.reducer';
import { LoadRestAuditLogEffects } from 'app/backend-status/effects/load-rest-audit-log.effects';
import { RestAuditLogPageComponent } from './pages/rest-audit-log-page/rest-audit-log-page.component';

@NgModule({
  declarations: [
    BuildDetailsPageComponent,
    TaskAuditLogPageComponent,
    RestAuditLogPageComponent
  ],
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
      LOAD_TASK_AUDIT_LOG_FEATURE_KEY,
      fromLoadTaskAuditLog.reducer
    ),
    StoreModule.forFeature(
      CLEAR_TASK_AUDIT_LOG_FEATURE_KEY,
      fromClearTaskAuditLog.reducer
    ),
    StoreModule.forFeature(
      LOAD_REST_AUDIT_LOG_ENTRIES_FEATURE_KEY,
      fromLoadRestAuditLogEntries.reducer
    ),
    EffectsModule.forFeature([
      BuildDetailsEffects,
      LoadTaskAuditLogEffects,
      ClearTaskAuditLogEffects,
      LoadRestAuditLogEffects
    ]),
    TableModule,
    ToolbarModule,
    ScrollPanelModule,
    TooltipModule,
    DialogModule,
    PanelModule,
    ButtonModule,
    SidebarModule
  ],
  exports: [CommonModule, CoreModule],
  providers: [BuildDetailsService]
})
export class BackendStatusModule {}
