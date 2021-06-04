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

import { Params } from '@angular/router';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import {
  reducer as webAuditLogReducer,
  WEB_AUDIT_LOG_FEATURE_KEY,
  WebAuditLogState
} from './reducers/web-audit-log.reducer';
import { ActionReducerMap } from '@ngrx/store';
import {
  TASK_AUDIT_LOG_FEATURE_KEY,
  TaskAuditLogState,
  reducer as taskAuditLogReducer
} from './reducers/task-audit-log.reducer';

interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
}

export interface AdminModuleState {
  router: RouterReducerState<RouterStateUrl>;
  [TASK_AUDIT_LOG_FEATURE_KEY]: TaskAuditLogState;
  [WEB_AUDIT_LOG_FEATURE_KEY]: WebAuditLogState;
}

export type ModuleState = AdminModuleState;

export const reducers: ActionReducerMap<AdminModuleState> = {
  router: routerReducer,
  [TASK_AUDIT_LOG_FEATURE_KEY]: taskAuditLogReducer,
  [WEB_AUDIT_LOG_FEATURE_KEY]: webAuditLogReducer
};
