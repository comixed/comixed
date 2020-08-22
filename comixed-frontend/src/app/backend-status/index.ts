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

import * as fromRouter from '@ngrx/router-store';
import * as fromBuildDetails from './reducers/build-details.reducer';
import {
  BUILD_DETAILS_FEATURE_KEY,
  BuildDetailsState
} from './reducers/build-details.reducer';
import * as fromClearTaskAuditLog from './reducers/clear-task-audit-log.reducer';
import * as fromLoadTaskAuditLog from './reducers/load-task-audit-log.reducer';
import {
  LOAD_TASK_AUDIT_LOG_FEATURE_KEY,
  LoadTaskAuditLogState
} from './reducers/load-task-audit-log.reducer';
import * as fromLoadRestAuditLog from './reducers/load-rest-audit-log.reducer';
import { Params } from '@angular/router';

import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import {
  CLEAR_TASK_AUDIT_LOG_FEATURE_KEY,
  ClearTaskAuditLogState
} from 'app/backend-status/reducers/clear-task-audit-log.reducer';
import {
  LOAD_REST_AUDIT_LOG_ENTRIES_FEATURE_KEY,
  LoadRestAuditLogEntriesState
} from 'app/backend-status/reducers/load-rest-audit-log.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AppState {
  router: fromRouter.RouterReducerState<RouterStateUrl>;
  [BUILD_DETAILS_FEATURE_KEY]: BuildDetailsState;
  [LOAD_TASK_AUDIT_LOG_FEATURE_KEY]: LoadTaskAuditLogState;
  [CLEAR_TASK_AUDIT_LOG_FEATURE_KEY]: ClearTaskAuditLogState;
  [LOAD_REST_AUDIT_LOG_ENTRIES_FEATURE_KEY]: LoadRestAuditLogEntriesState;
}

export type State = AppState;

export const reducers: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  [BUILD_DETAILS_FEATURE_KEY]: fromBuildDetails.reducer,
  [LOAD_TASK_AUDIT_LOG_FEATURE_KEY]: fromLoadTaskAuditLog.reducer,
  [CLEAR_TASK_AUDIT_LOG_FEATURE_KEY]: fromClearTaskAuditLog.reducer,
  [LOAD_REST_AUDIT_LOG_ENTRIES_FEATURE_KEY]: fromLoadRestAuditLog.reducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
